import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CoachingReportLiveCharts from "../CoachingReportLiveCharts";
import type { CoachingReport } from "../../../shared/types";

const minimalReport = {
  driver_id: "test-driver",
  generated_at_iso: "2026-05-24T20:00:00Z",
  corners: [],
  tuning_delta: { brake_bias_pct: 0, diff_preload_nm: 0, rationale: "" },
  forecast: [],
  audit: { verdict: "SAFE", reasoning: "", concerns: [] },
} as unknown as CoachingReport;

describe("CoachingReportLiveCharts", () => {
  it("renders the section heading + eyebrow + chart-panel context copy", () => {
    render(<CoachingReportLiveCharts report={minimalReport} />);
    expect(
      screen.getByRole("heading", { name: /Lap-over-lap telemetry context/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Live charts/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Three panels covering pace progression/i),
    ).toBeInTheDocument();
  });

  it("renders the chart-panel labels (lap-time delta + tire degradation + speed-brake-temp)", () => {
    render(<CoachingReportLiveCharts report={minimalReport} />);
    expect(screen.getByText(/Lap-time delta vs reference/i)).toBeInTheDocument();
    expect(screen.getAllByText(/tire/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/brake/i).length).toBeGreaterThan(0);
  });

  it("section is labeled by live-charts-title for a11y", () => {
    const { container } = render(<CoachingReportLiveCharts report={minimalReport} />);
    const section = container.querySelector("section[aria-labelledby='live-charts-title']");
    expect(section).not.toBeNull();
  });
});
