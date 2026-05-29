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
 * Wave-35 A.9: Number.isFinite guards on the Mahalanobis + p95
 * threshold values; non-finite distance OR threshold renders a
 * role=alert chip prompting re-run of the session rather than
 * rendering "NaN" silently. Wave-35 A.10: exhaustiveness throw on
 * the status discriminator catches new variants at compile time.
 *
 * Wave-36 codex MED: alert names the offending field by name so
 * operators know whether the upstream bug is in the distance
 * calculation OR the p95 threshold calibration (or both).
 *
 * Wave-37 cold-review fixes:
 * - silent-failure-hunter MED-3: the exhaustiveness switch fires
 *   BEFORE the Number.isFinite guard so a future status variant
 *   carrying non-finite values still routes through the never-
 *   throw + surfaces as a compile-time error rather than silently
 *   being absorbed by the non-finite alert.
 * - silent-failure-hunter MED-2: alert text rephrased from "non-
 *   finite distance" (singular noun) to "non-finite values" (plural
 *   noun) so the parenthetical "p95 threshold" case does not read
 *   as "a threshold called a distance."
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
  // Wave-37 silent-failure-hunter MED-3 reorder: exhaustiveness switch
  // runs FIRST so the never-throw catches an unknown status variant
  // even if the variant happens to carry non-finite values. The prior
  // ordering returned via the non-finite guard before the switch could
  // observe the new variant, silently routing through the alert chip.
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

  // Wave-35 A.9 Number.isFinite guard (now after the exhaustiveness
  // switch per wave-37 MED-3). Wave-36 codex MED + wave-37 MED-2: name
  // the offending field(s) so operators can locate the upstream bug
  // (distance calc divide-by-zero vs p95 threshold empty-fixture
  // calibration vs both); rephrase "distance" -> "values" so the
  // grammar covers the threshold-only branch.
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
          Physics-confidence detector emitted non-finite values ({offendingField}); re-run the
          session.
        </span>
      </span>
    );
  }

  const borderClass = inDistribution ? "border-racing-green" : "border-amber";
  const toneClass = inDistribution ? "text-racing-green" : "text-amber-ink";
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
