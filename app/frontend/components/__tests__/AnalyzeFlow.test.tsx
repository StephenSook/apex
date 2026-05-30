import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AnalyzeFlow from "../AnalyzeFlow";

function makeFile(name: string, size: number, type: string): File {
  return new File([new Uint8Array(size)], name, { type });
}

function fetchReturning(payload: unknown): typeof fetch {
  return vi.fn(
    async () => ({ ok: true, status: 200, json: async () => payload }) as unknown as Response,
  ) as unknown as typeof fetch;
}

describe("AnalyzeFlow integration", () => {
  // scrollIntoView stub is set globally in vitest.setup.ts.

  beforeEach(() => {
    // Wave-64: the analyze flow now calls /api/coaching/narrate. Default
    // the suite to the honest fixture path (route ok:false) so the
    // existing assertions exercise the canned narrative deterministically,
    // independent of real fetch behavior in CI. Individual tests override
    // this stub to exercise the live-generated path.
    vi.stubGlobal("fetch", fetchReturning({ ok: false, source: "stub" }));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
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

    // Wave-43 D2.12 CSS-hidden state preservation: all 5 tab panes
    // render always; inactive ones toggle to `hidden` className. Heading
    // text that appears in multiple panes (e.g. "Tuning recommendation"
    // in both Tuning pane AND CoachingReport sub-component) is now in
    // the DOM in BOTH the visible + the hidden subtrees. Helper finds
    // the visible-by-ancestor instance per assertion.
    const visibleHeading = (name: RegExp) => {
      const matches = screen.getAllByRole("heading", { name });
      return matches.find((h) => h.closest(".hidden") === null) ?? null;
    };

    // Click Tuning tab; Tuning pane heading appears visible.
    const tuningTab = screen.getByRole("button", { name: /^Tuning/i });
    await user.click(tuningTab);
    expect(visibleHeading(/Tuning recommendation/i)).not.toBeNull();
    const coachingHeading = screen.getByRole("heading", { name: /Corner-by-corner coaching/i });
    expect(coachingHeading.closest(".hidden")).not.toBeNull();

    // Click Forecast tab; Forecast pane heading appears visible.
    const forecastTab = screen.getByRole("button", { name: /^Forecast/i });
    await user.click(forecastTab);
    expect(visibleHeading(/Next-session forecast/i)).not.toBeNull();

    // Click Audit tab; Granite Guardian pane heading appears visible.
    const auditTab = screen.getByRole("button", { name: /^Audit/i });
    await user.click(auditTab);
    expect(visibleHeading(/Granite Guardian verdict/i)).not.toBeNull();

    // Click Chat tab; AICopilotChat heading appears visible.
    const chatTab = screen.getByRole("button", { name: /^Chat/i });
    await user.click(chatTab);
    expect(visibleHeading(/Ask the race engineer/i)).not.toBeNull();

    // Click Coaching tab back; CoachingReport heading is visible again.
    const coachingTab = screen.getByRole("button", { name: /^Coaching/i });
    await user.click(coachingTab);
    expect(visibleHeading(/Corner-by-corner coaching/i)).not.toBeNull();
  });

  // Wave-64 live-coaching wiring: when /api/coaching/narrate returns
  // Granite output, the merged prose renders + the header label tells the
  // truth ("written live by Granite"). buildMockReport ships 3 corners, so
  // the live mock returns 3 to align the index-based merge.
  it("renders live-generated coaching prose + the live provenance label when the route returns Granite output", async () => {
    vi.stubGlobal(
      "fetch",
      fetchReturning({
        ok: true,
        source: "granite-live",
        corners: [
          {
            name: "Sector 1 corner",
            recommendation: "Live Granite coaching for sector one, grounded in your debrief.",
            recommendation_beginner: "Live simple coaching one.",
            reasoning_chain: [],
          },
          {
            name: "Sector 2 corner",
            recommendation: "Live Granite coaching for sector two.",
            recommendation_beginner: "Live simple coaching two.",
            reasoning_chain: [],
          },
          {
            name: "Sector 3 corner",
            recommendation: "Live Granite coaching for sector three.",
            recommendation_beginner: "Live simple coaching three.",
            reasoning_chain: [],
          },
        ],
        summary: "live session summary",
      }),
    );

    const user = userEvent.setup();
    const { container } = render(<AnalyzeFlow />);
    const fileInputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]');
    await user.upload(fileInputs[0], makeFile("session.csv", 4096, "text/csv"));
    await user.upload(fileInputs[1], makeFile("coa.pdf", 8192, "application/pdf"));
    await user.type(screen.getByRole("textbox", { name: /Your debrief/i }), "Lost the rears.");
    await user.type(screen.getByRole("textbox", { name: /Driver identifier/i }), "live-driver");
    await user.click(screen.getByRole("button", { name: /Generate coaching report/i }));

    await screen.findByRole(
      "heading",
      { name: /Corner-by-corner coaching/i },
      { timeout: 2000 },
    );
    expect(await screen.findByText(/written live by Granite/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Live Granite coaching for sector one, grounded in your debrief/i),
    ).toBeInTheDocument();
  });
});
