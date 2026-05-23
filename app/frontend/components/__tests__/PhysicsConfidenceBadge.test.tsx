import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { PhysicsConfidence } from "../../../shared/types";
import PhysicsConfidenceBadge from "../PhysicsConfidenceBadge";

describe("PhysicsConfidenceBadge", () => {
  it("renders the in-distribution chip with Mahalanobis distance + threshold", () => {
    const confidence: PhysicsConfidence = {
      status: "in_distribution",
      mahalanobis_distance: 1.23,
      threshold_p95: 2.5,
    };
    render(<PhysicsConfidenceBadge confidence={confidence} />);
    expect(screen.getByText(/Physics-confidence · in-distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/M=1.23 \/ p95=2.50/)).toBeInTheDocument();
    const badge = screen.getByLabelText(/Physics confidence: in-distribution/i);
    expect(badge).toBeInTheDocument();
  });

  it("renders the out-of-distribution chip with downgrade arrow", () => {
    const confidence: PhysicsConfidence = {
      status: "out_of_distribution",
      mahalanobis_distance: 3.45,
      threshold_p95: 2.5,
      downgrade_from: "flag",
      downgrade_to: "review",
    };
    render(<PhysicsConfidenceBadge confidence={confidence} />);
    expect(screen.getByText(/Physics-confidence · out-of-distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/M=3.45 \/ p95=2.50/)).toBeInTheDocument();
    expect(screen.getByText(/→ flag → review/)).toBeInTheDocument();
    const badge = screen.getByLabelText(
      /Physics confidence: out-of-distribution, Mahalanobis distance 3.45 \(95th-percentile threshold 2.50\)/i,
    );
    expect(badge).toBeInTheDocument();
  });

  it("renders the downgrade arrow with approve-from variant", () => {
    const confidence: PhysicsConfidence = {
      status: "out_of_distribution",
      mahalanobis_distance: 5.01,
      threshold_p95: 2.5,
      downgrade_from: "approve",
      downgrade_to: "review",
    };
    render(<PhysicsConfidenceBadge confidence={confidence} />);
    expect(screen.getByText(/→ approve → review/)).toBeInTheDocument();
  });

  it("renders the non-finite-distance role=alert when mahalanobis_distance is NaN (wave-35 A.9)", () => {
    const confidence: PhysicsConfidence = {
      status: "in_distribution",
      mahalanobis_distance: Number.NaN,
      threshold_p95: 2.5,
    };
    render(<PhysicsConfidenceBadge confidence={confidence} />);
    const alert = screen.getByRole("alert");
    // grep-verified verbatim in PhysicsConfidenceBadge.tsx line 48:
    // "Physics-confidence detector emitted non-finite distance; ..."
    expect(alert).toHaveTextContent(/non-finite distance/i);
  });

  it("renders the non-finite-distance role=alert when mahalanobis_distance is Infinity (wave-35 A.9)", () => {
    const confidence: PhysicsConfidence = {
      status: "in_distribution",
      mahalanobis_distance: Number.POSITIVE_INFINITY,
      threshold_p95: 2.5,
    };
    render(<PhysicsConfidenceBadge confidence={confidence} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/non-finite distance/i);
  });

  it("renders the non-finite-distance role=alert when threshold_p95 is NaN (wave-35 A.9)", () => {
    const confidence: PhysicsConfidence = {
      status: "out_of_distribution",
      mahalanobis_distance: 3.0,
      threshold_p95: Number.NaN,
      downgrade_from: "approve",
      downgrade_to: "review",
    };
    render(<PhysicsConfidenceBadge confidence={confidence} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/non-finite distance/i);
  });
});
