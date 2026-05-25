import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type {
  CoachingReport as CoachingReportType,
  CornerInsight,
  GuardianAudit,
  NextSessionForecast,
  ProvenanceFooter,
  TuningDelta,
} from "../../../shared/types";
import CoachingReport from "../CoachingReport";

function makeReport(overrides: Partial<CoachingReportType> = {}): CoachingReportType {
  const tuning: TuningDelta = {
    parameter: "hand_lever_brake_travel",
    current: 38,
    recommended: 34,
    unit: "mm",
    citation: { fia_article: "Appendix L", coa_section: "the hardware-spec section" },
  };
  const audit: GuardianAudit = {
    verdict: "approve",
    reasoning_trace: ["Friction ellipse OK"],
    audit_id: "audit-1",
  };
  const provenance: ProvenanceFooter = {
    model_versions: {
      granite_docling: "ibm-granite/granite-docling-258m",
      granite_vision: "ibm-granite/granite-vision-4.1-4b",
      granite_ttm: "ibm-granite/granite-timeseries-ttm-r2",
      granite_instruct: "ibm-granite/granite-4.1-8b-instruct",
      granite_guardian: "ibm-granite/granite-guardian-4.1-8b",
    },
    commit_sha: "0000000000000000000000000000000000000000",
    generated_at_iso: "2026-05-21T12:00:00.000Z",
  };
  const corners: ReadonlyArray<CornerInsight> = [
    {
      name: "Old Hairpin",
      sector: 2,
      current_delta_s: 0.34,
      recommendation: "Trail-brake in two micro-presses.",
      citations: [{ fia_article: "Appendix L", coa_section: "the hardware-spec section" }],
    },
  ];
  const forecast: NextSessionForecast = [
    { sector_idx: 0, mean: 47.42, low: 47.21, high: 47.66 },
    { sector_idx: 1, mean: 31.18, low: 31.02, high: 31.39 },
  ];
  return {
    driver_id: "sarah-reynolds-britcar-2026",
    corners,
    tuning_delta: tuning,
    forecast,
    audit,
    provenance,
    ...overrides,
  };
}

describe("CoachingReport", () => {
  it("renders the driver_id from the report contract", () => {
    render(<CoachingReport report={makeReport()} />);
    expect(screen.getByText("sarah-reynolds-britcar-2026")).toBeInTheDocument();
  });

  it("renders the corners list and the recommendation prose", () => {
    render(<CoachingReport report={makeReport()} />);
    expect(screen.getByText(/Corners \(1\)/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Old Hairpin/i })).toBeInTheDocument();
    expect(screen.getByText(/Trail-brake in two micro-presses/)).toBeInTheDocument();
  });

  it("renders the corner delta with the slower-side + accent tone", () => {
    render(<CoachingReport report={makeReport()} />);
    expect(screen.getByText("+0.34 s vs reference")).toBeInTheDocument();
  });

  it("renders the provenance footer with 5 model versions", () => {
    render(<CoachingReport report={makeReport()} />);
    expect(screen.getByText("Granite-Docling")).toBeInTheDocument();
    expect(screen.getByText("Granite Vision")).toBeInTheDocument();
    expect(screen.getByText("Granite TTM")).toBeInTheDocument();
    expect(screen.getByText("Granite 4.1 8B Instruct")).toBeInTheDocument();
    expect(screen.getByText("Granite Guardian")).toBeInTheDocument();
    expect(screen.getByText("0000000000")).toBeInTheDocument();
  });

  it("renders the ForecastChart with role=img + aria-label", () => {
    render(<CoachingReport report={makeReport()} />);
    const chart = screen.getByRole("img", {
      name: /Next-session forecast across 2 mini-sectors/i,
    });
    expect(chart).toBeInTheDocument();
  });

  it("rejects a malformed forecast (low > high) with role=alert (silent-failure M2 regression guard)", () => {
    const badForecast: NextSessionForecast = [
      { sector_idx: 7, mean: 50, low: 60, high: 40 },
    ];
    render(<CoachingReport report={makeReport({ forecast: badForecast })} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/Forecast envelope invalid for mini-sector 7/i);
  });

  it("renders a single-point forecast as a visible dot (silent-failure N4 regression guard)", () => {
    const onePoint: NextSessionForecast = [
      { sector_idx: 0, mean: 30, low: 29, high: 31 },
    ];
    const { container } = render(<CoachingReport report={makeReport({ forecast: onePoint })} />);
    const circle = container.querySelector("svg circle");
    expect(circle).not.toBeNull();
  });

  it("renders the degenerate-envelope amber notice when yMin equals yMax", () => {
    const flat: NextSessionForecast = [
      { sector_idx: 0, mean: 30, low: 30, high: 30 },
      { sector_idx: 1, mean: 30, low: 30, high: 30 },
    ];
    render(<CoachingReport report={makeReport({ forecast: flat })} />);
    expect(screen.getByText(/forecast envelope is flat/i)).toBeInTheDocument();
  });

  it("renders the empty-forecast fallback when forecast has zero points", () => {
    render(<CoachingReport report={makeReport({ forecast: [] })} />);
    expect(screen.getByText(/No forecast available/i)).toBeInTheDocument();
  });
});
