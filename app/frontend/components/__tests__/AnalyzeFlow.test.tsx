import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AnalyzeFlow from "../AnalyzeFlow";

function makeFile(name: string, size: number, type: string): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("AnalyzeFlow integration", () => {
  beforeEach(() => {
    // jsdom does not implement scrollIntoView; stub so the focus-effect does not throw.
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("mounts the Dropzone before any submission", () => {
    render(<AnalyzeFlow />);
    expect(screen.getByRole("heading", { name: /Upload your session/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Corner-by-corner coaching/i })).not.toBeInTheDocument();
  });

  it("disables the submit button until all four fields are populated", async () => {
    const user = userEvent.setup();
    const { container } = render(<AnalyzeFlow />);

    const submit = screen.getByRole("button", { name: /Generate coaching report/i });
    expect(submit).toBeDisabled();

    const fileInputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]');
    expect(fileInputs).toHaveLength(2);

    await user.upload(fileInputs[0], makeFile("a.csv", 4096, "text/csv"));
    expect(submit).toBeDisabled();

    await user.upload(fileInputs[1], makeFile("b.pdf", 8192, "application/pdf"));
    expect(submit).toBeDisabled();

    await user.type(screen.getByRole("textbox", { name: /Your debrief/i }), "debrief");
    expect(submit).toBeDisabled();

    await user.type(screen.getByRole("textbox", { name: /Driver identifier/i }), "id");
    expect(submit).not.toBeDisabled();
  });

  it("renders the mock CoachingReport after the user submits all four fields", async () => {
    const user = userEvent.setup();
    const { container } = render(<AnalyzeFlow />);

    const fileInputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]');
    const telemetry = makeFile("session.csv", 4096, "text/csv");
    const coa = makeFile("sarah-coa.pdf", 8192, "application/pdf");
    await user.upload(fileInputs[0], telemetry);
    await user.upload(fileInputs[1], coa);

    await user.type(
      screen.getByRole("textbox", { name: /Your debrief/i }),
      "Lost the rears mid Old Hairpin.",
    );
    await user.type(
      screen.getByRole("textbox", { name: /Driver identifier/i }),
      "sarah-reynolds-britcar-2026",
    );

    const submit = screen.getByRole("button", { name: /Generate coaching report/i });
    expect(submit).not.toBeDisabled();

    await user.click(submit);

    // findBy* waits up to the default 1000ms for the element to appear, which
    // covers the mock delay(900) without fake timers.
    const reportHeading = await screen.findByRole(
      "heading",
      { name: /Corner-by-corner coaching/i },
      { timeout: 2000 },
    );
    expect(reportHeading).toBeInTheDocument();
    expect(screen.getByText("sarah-reynolds-britcar-2026")).toBeInTheDocument();
    expect(screen.getByText(/Corners \(3\)/)).toBeInTheDocument();
  });
});
