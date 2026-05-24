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

  // Wave-42 Lane A.G.4 5-tab restructure: tab-switch interaction
  // surfaces alternate analysis panes per the cascade #2 family rule
  // (SAME-commit test fixup with the component refactor).
  it("switches between analysis tabs (Coaching default, Tuning, Forecast, Audit, Chat)", async () => {
    const user = userEvent.setup();
    const { container } = render(<AnalyzeFlow />);

    const fileInputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]');
    await user.upload(fileInputs[0], makeFile("session.csv", 4096, "text/csv"));
    await user.upload(fileInputs[1], makeFile("sarah-coa.pdf", 8192, "application/pdf"));
    await user.type(
      screen.getByRole("textbox", { name: /Your debrief/i }),
      "Lost the rears mid Old Hairpin.",
    );
    await user.type(
      screen.getByRole("textbox", { name: /Driver identifier/i }),
      "sarah-reynolds-britcar-2026",
    );
    await user.click(screen.getByRole("button", { name: /Generate coaching report/i }));

    // Coaching tab is the default activeTab after submit; CoachingReport
    // heading renders inside the Coaching tabpanel.
    await screen.findByRole(
      "heading",
      { name: /Corner-by-corner coaching/i },
      { timeout: 2000 },
    );

    // Click Tuning tab; CoachingReport heading unmounts; Tuning pane heading appears.
    const tuningTab = screen.getByRole("tab", { name: /^Tuning/i });
    await user.click(tuningTab);
    expect(
      screen.getByRole("heading", { name: /Tuning recommendation/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /Corner-by-corner coaching/i }),
    ).not.toBeInTheDocument();

    // Click Forecast tab; Forecast pane heading appears.
    const forecastTab = screen.getByRole("tab", { name: /^Forecast/i });
    await user.click(forecastTab);
    expect(
      screen.getByRole("heading", { name: /Next-session forecast/i }),
    ).toBeInTheDocument();

    // Click Audit tab; Granite Guardian pane heading appears.
    const auditTab = screen.getByRole("tab", { name: /^Audit/i });
    await user.click(auditTab);
    expect(
      screen.getByRole("heading", { name: /Granite Guardian verdict/i }),
    ).toBeInTheDocument();

    // Click Chat tab; AICopilotChat heading appears.
    const chatTab = screen.getByRole("tab", { name: /^Chat/i });
    await user.click(chatTab);
    expect(
      screen.getByRole("heading", { name: /Ask the race engineer/i }),
    ).toBeInTheDocument();

    // Click Coaching tab back; CoachingReport heading returns.
    const coachingTab = screen.getByRole("tab", { name: /^Coaching/i });
    await user.click(coachingTab);
    expect(
      screen.getByRole("heading", { name: /Corner-by-corner coaching/i }),
    ).toBeInTheDocument();
  });
});
