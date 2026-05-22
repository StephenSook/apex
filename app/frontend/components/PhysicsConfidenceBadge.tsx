/**
 * PhysicsConfidenceBadge: compact chip rendering the wave-30 D-024
 * physics-confidence detector verdict (Mahalanobis-distance over
 * telemetry vs Pacejka tire-parameter distribution; Guardian-downgrade
 * trigger metadata). Designed for inline-with-prose embedding next to
 * a verdict tag or a coaching-report header to surface "physics model
 * in low-confidence regime for this session; verdict downgraded to
 * REVIEW per design" per pre-mortem row 59 calibration plan.
 *
 * Discriminated union by `status`. In-distribution = green chip;
 * out-of-distribution = amber chip with downgrade-from / downgrade-to
 * arrow rendered inline so the reader can see at a glance what the
 * detector did to the Guardian verdict.
 */

import type { PhysicsConfidence } from "../../shared/types";

export interface PhysicsConfidenceBadgeProps {
  readonly confidence: PhysicsConfidence;
}

const DOWNGRADE_LABELS: Record<"approve" | "flag", string> = {
  approve: "approve",
  flag: "flag",
};

export default function PhysicsConfidenceBadge({ confidence }: PhysicsConfidenceBadgeProps) {
  const inDistribution = confidence.status === "in_distribution";
  const borderClass = inDistribution ? "border-racing-green" : "border-amber";
  const toneClass = inDistribution ? "text-racing-green" : "text-amber";
  const distance = confidence.mahalanobis_distance.toFixed(2);
  const threshold = confidence.threshold_p95.toFixed(2);
  const statusLabel = inDistribution ? "in-distribution" : "out-of-distribution";

  return (
    <span
      aria-label={`Physics confidence: ${statusLabel}, Mahalanobis distance ${distance} (95th-percentile threshold ${threshold})`}
      className={`inline-flex items-center gap-2 rounded-sm border ${borderClass} bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${toneClass}`}
    >
      <span aria-hidden="true">●</span>
      <span>Physics-confidence · {statusLabel}</span>
      <span className="text-muted normal-case">
        M={distance} / p95={threshold}
      </span>
      {confidence.status === "out_of_distribution" && (
        <span className="text-accent">
          → {DOWNGRADE_LABELS[confidence.downgrade_from]} → {confidence.downgrade_to}
        </span>
      )}
    </span>
  );
}
