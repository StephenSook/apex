import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type {
  COADiffProjectionTraceEntry,
  NextSessionForecast,
  PhysicsConfidence,
} from "../../../shared/types";
import ConfidenceDecompositionPanel from "../ConfidenceDecompositionPanel";

const TRACE: ReadonlyArray<COADiffProjectionTraceEntry> = [
  { stage: "friction_ellipse", residual_norm: 0.0008, status: "converged" },
  { stage: "coa_simultaneity", residual_norm: 0.0, status: "converged" },
];
const FORECAST: NextSessionForecast = [
  { sector_idx: 0, mean: 47.42, low: 47.21, high: 47.66 },
  { sector_idx: 1, mean: 31.18, low: 31.02, high: 31.39 },
];
const PC_IN: PhysicsConfidence = {
  status: "in_distribution",
  mahalanobis_distance: 1.2,
  threshold_p95: 3.0,
};

describe("ConfidenceDecompositionPanel", () => {
  it("renders all four real-signal dimensions", () => {
    render(
      <ConfidenceDecompositionPanel
        projectionTrace={TRACE}
        guardianVerdict="approve"
        forecast={FORECAST}
        physicsConfidence={PC_IN}
      />,
    );
    expect(screen.getByText("Physics feasibility")).toBeInTheDocument();
    expect(screen.getByText("Guardian safety")).toBeInTheDocument();
    expect(screen.getByText("Forecast certainty")).toBeInTheDocument();
    expect(screen.getByText("Physics-model confidence")).toBeInTheDocument();
  });

  it("labels the physics-model dimension as an integration-tier demo fixture (honesty guard)", () => {
    render(
      <ConfidenceDecompositionPanel
        projectionTrace={TRACE}
        guardianVerdict="approve"
        forecast={FORECAST}
        physicsConfidence={PC_IN}
      />,
    );
    expect(
      screen.getByText(/integration-tier preview: demo fixture/i),
    ).toBeInTheDocument();
  });

  it("shows no single invented overall confidence score (honesty guard)", () => {
    render(
      <ConfidenceDecompositionPanel
        projectionTrace={TRACE}
        guardianVerdict="approve"
        forecast={FORECAST}
        physicsConfidence={PC_IN}
      />,
    );
    expect(screen.queryByText(/overall confidence/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/No weighted-sum overall score is shown/i),
    ).toBeInTheDocument();
  });

  it("reflects a Guardian reject as the verdict value", () => {
    render(
      <ConfidenceDecompositionPanel
        projectionTrace={TRACE}
        guardianVerdict="reject"
        forecast={FORECAST}
        physicsConfidence={PC_IN}
      />,
    );
    expect(screen.getByText("REJECT")).toBeInTheDocument();
  });

  it("does not fabricate a green converged verdict from an empty projection trace (honesty guard)", () => {
    render(
      <ConfidenceDecompositionPanel
        projectionTrace={[]}
        guardianVerdict="approve"
        forecast={FORECAST}
        physicsConfidence={PC_IN}
      />,
    );
    expect(screen.getByText(/no projection trace/i)).toBeInTheDocument();
    expect(screen.queryByText(/converged/i)).not.toBeInTheDocument();
  });

  it("renders a linearized projection stage as its own state, not a violation", () => {
    const linearizedTrace: ReadonlyArray<COADiffProjectionTraceEntry> = [
      { stage: "friction_ellipse", residual_norm: 0.0008, status: "converged" },
      { stage: "stage_2_feasibility", residual_norm: 0.02, status: "linearized" },
    ];
    render(
      <ConfidenceDecompositionPanel
        projectionTrace={linearizedTrace}
        guardianVerdict="approve"
        forecast={FORECAST}
        physicsConfidence={PC_IN}
      />,
    );
    expect(screen.getByText(/linearized/i)).toBeInTheDocument();
    expect(screen.queryByText(/violation/i)).not.toBeInTheDocument();
  });
});
