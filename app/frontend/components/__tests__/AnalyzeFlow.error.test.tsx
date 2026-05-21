import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AnalyzeFlow from "../AnalyzeFlow";
import Dropzone from "../Dropzone";

function makeFile(name: string, size: number, type: string): File {
  return new File([new Uint8Array(size)], name, { type });
}

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  container: HTMLElement,
  driverId = "sarah-reynolds-britcar-2026",
): Promise<void> {
  const fileInputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]');
  await user.upload(fileInputs[0], makeFile("session.csv", 4096, "text/csv"));
  await user.upload(fileInputs[1], makeFile("sarah-coa.pdf", 8192, "application/pdf"));
  await user.type(
    screen.getByRole("textbox", { name: /Your debrief/i }),
    "Lost the rears mid Old Hairpin.",
  );
  await user.type(
    screen.getByRole("textbox", { name: /Driver identifier/i }),
    driverId,
  );
  await user.click(screen.getByRole("button", { name: /Generate coaching report/i }));
}

describe("AnalyzeFlow error path (Codex wave-15 MED backfill)", () => {
  it("surfaces a parent onAnalyze rejection via the Dropzone role=alert", async () => {
    // Custom client wrapper that lets us inject a throwing onAnalyze.
    const handleAnalyze = vi
      .fn()
      .mockRejectedValueOnce(new Error("Granite Guardian blocked the recommendation"));

    const user = userEvent.setup();
    const { container } = render(
      <Dropzone onAnalyze={handleAnalyze} />,
    );

    await fillAndSubmit(user, container);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/Granite Guardian blocked the recommendation/i);
    expect(handleAnalyze).toHaveBeenCalledTimes(1);
  });

  it("does not steal focus from an active form input on resubmit", async () => {
    const user = userEvent.setup();
    const { container } = render(<AnalyzeFlow />);

    // First submission completes; CoachingReport renders + focus moves to the report container.
    await fillAndSubmit(user, container, "first-driver");
    await screen.findByRole(
      "heading",
      { name: /Corner-by-corner coaching/i },
      { timeout: 2000 },
    );

    // User edits the driver-id field to fix a typo.
    const driverInput = screen.getByRole("textbox", { name: /Driver identifier/i });
    await user.clear(driverInput);
    await user.type(driverInput, "second-driver");
    driverInput.focus();
    expect(document.activeElement).toBe(driverInput);

    // Trigger a resubmit. Old report should swap to new but focus stays on driverInput.
    await user.click(screen.getByRole("button", { name: /Generate coaching report/i }));
    await waitFor(
      () => expect(screen.getByText("second-driver")).toBeInTheDocument(),
      { timeout: 2000 },
    );

    // prevReportRef guard: on the SECOND report (not the null -> first transition), focus is left alone.
    expect(document.activeElement).toBe(driverInput);
  });
});
