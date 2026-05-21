import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AnalyzeFlow from "../AnalyzeFlow";

function makeFile(name: string, size: number, type: string): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("AnalyzeFlow integration", () => {
  // scrollIntoView stub is set globally in vitest.setup.ts.

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

    // Two-stage assertion: first verify the submit handler advanced state
    // (so a CI flake reports "submit never entered Analyzing" not "no heading"),
    // then verify the mock report rendered after the delay(900).
    await waitFor(
      () => expect(screen.getByRole("button", { name: /Analyzing\.\.\./i })).toBeInTheDocument(),
      { timeout: 500 },
    );

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
