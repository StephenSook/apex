import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import TSPulseAnomalyPanel, { type TSPulseAnomalyState } from "../TSPulseAnomalyPanel";

describe("TSPulseAnomalyPanel", () => {
  it("renders idle state with detector-mounted copy + no role=alert", () => {
    const state: TSPulseAnomalyState = { status: "idle" };
    render(<TSPulseAnomalyPanel state={state} />);
    expect(screen.getByText(/Detector mounted/i)).toBeInTheDocument();
    expect(screen.getByText(/Detector idle/i)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders scanning state with window-index + elapsed-ms numeric + four-band copy", () => {
    const state: TSPulseAnomalyState = {
      status: "scanning",
      window_index: 1428,
      elapsed_ms: 12,
    };
    render(<TSPulseAnomalyPanel state={state} />);
    expect(screen.getByText(/1428/)).toBeInTheDocument();
    expect(screen.getByText(/12 ms elapsed/i)).toBeInTheDocument();
    expect(screen.getByText(/DC, low, mid, high/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Scanning/i).length).toBeGreaterThan(0);
  });

  it("renders clean state with score below p95 + sub-30ms detection numerics", () => {
    const state: TSPulseAnomalyState = {
      status: "clean",
      window_index: 1500,
      score: 1.42,
      threshold_p95: 2.1,
      detection_ms: 22,
    };
    render(<TSPulseAnomalyPanel state={state} />);
    expect(screen.getByText(/1500/)).toBeInTheDocument();
    expect(screen.getAllByText(/1\.420/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2\.100/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/22 ms/).length).toBeGreaterThan(0);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders anomaly state with role=alert + affected bands + score breach", () => {
    const state: TSPulseAnomalyState = {
      status: "anomaly",
      window_index: 1601,
      score: 3.14,
      threshold_p95: 2.1,
      affected_bands: ["mid", "high"],
      detection_ms: 18.7,
    };
    render(<TSPulseAnomalyPanel state={state} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/3\.140/);
    expect(alert).toHaveTextContent(/2\.100/);
    expect(alert).toHaveTextContent(/Mid, High/);
    expect(alert).toHaveTextContent(/Guardian-Safety pre-flag/i);
  });

  it("renders error state with role=alert + message + service-health hint", () => {
    const state: TSPulseAnomalyState = {
      status: "error",
      message: "504 endpoint timeout",
    };
    render(<TSPulseAnomalyPanel state={state} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/504 endpoint timeout/i);
    expect(alert).toHaveTextContent(/TSPulse service health on \/status/i);
  });
});
