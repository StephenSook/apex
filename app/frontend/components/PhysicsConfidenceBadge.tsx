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
 *
 * Wave-35 A.9 + A.10: Number.isFinite guards on the Mahalanobis +
 * p95 threshold values + exhaustiveness throw on the status variant.
 * Non-finite distance or threshold => role=alert chip prompting
 * re-run of the session, rather than rendering "NaN" silently.
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
  // Wave-35 A.9 + wave-36 codex MED Number.isFinite guard. Non-finite
  // Mahalanobis distance or non-finite p95 threshold both indicate the
  // detector emitted a garbage value (most often: NaN from a divide-
  // by-zero in the covariance inversion). Surface explicitly via
  // role=alert + name the offending field so operators know whether
  // the upstream bug is in the distance calculation or the threshold
  // calibration. Both-non-finite case names both fields.
  const distanceFinite = Number.isFinite(confidence.mahalanobis_distance);
  const thresholdFinite = Number.isFinite(confidence.threshold_p95);
  if (!distanceFinite || !thresholdFinite) {
    let offendingField: string;
    if (!distanceFinite && !thresholdFinite) {
      offendingField = "Mahalanobis distance + p95 threshold";
    } else if (!distanceFinite) {
      offendingField = "Mahalanobis distance";
    } else {
      offendingField = "p95 threshold";
    }
    return (
      <span
        role="alert"
        className="inline-flex items-center gap-2 rounded-sm border-2 border-accent bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-accent"
      >
        <span aria-hidden="true">●</span>
        <span>
          Physics-confidence detector emitted non-finite distance ({offendingField}); re-run the
          session.
        </span>
      </span>
    );
  }

  // Wave-35 A.10 exhaustiveness throw. Top-of-function switch derives
  // the inDistribution flag + asserts every variant of PhysicsConfidence
  // is handled. Adding a new status without updating this switch
  // errors at compile time on the `never` assignment.
  let inDistribution: boolean;
  switch (confidence.status) {
    case "in_distribution":
      inDistribution = true;
      break;
    case "out_of_distribution":
      inDistribution = false;
      break;
    default: {
      const _exhaustive: never = confidence;
      throw new Error(`unknown physics-confidence status: ${String(_exhaustive)}`);
    }
  }

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
