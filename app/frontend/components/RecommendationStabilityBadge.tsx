/**
 * RecommendationStabilityBadge: surfaces whether the report's headline
 * coaching priority holds under small input perturbations, an axis the
 * confidence-decomposition (evidence quality) and Guardian audit (rule
 * compliance) do not cover. Pure function of props; renders nothing when
 * there are fewer than two corners to rank.
 *
 * Honest by construction: the verdict comes from a deterministic local
 * stability probe over the report's own deltas (see
 * lib/recommendation-stability.ts), explicitly labelled as a local probe,
 * not a global guarantee.
 */

import type { CornerInsight } from "../../shared/types";
import {
  assessRecommendationStability,
  type StabilityVerdict,
} from "../lib/recommendation-stability";

const TONE: Record<
  StabilityVerdict,
  { readonly border: string; readonly value: string; readonly label: string }
> = {
  stable: { border: "border-racing-green", value: "text-racing-green", label: "STABLE" },
  moderate: { border: "border-amber", value: "text-amber-ink", label: "MODERATE" },
  fragile: { border: "border-accent", value: "text-accent", label: "FRAGILE" },
};

export default function RecommendationStabilityBadge({
  corners,
}: {
  readonly corners: ReadonlyArray<CornerInsight>;
}) {
  const stability = assessRecommendationStability(corners);
  if (stability === null) return null;

  const tone = TONE[stability.verdict];
  return (
    <section
      aria-labelledby="recommendation-stability-title"
      className={`rounded-sm border-l-4 ${tone.border} bg-paper-warm p-5`}
    >
      <p className="apex-eyebrow">Recommendation stability</p>
      <p
        id="recommendation-stability-title"
        className={`font-display text-xl ${tone.value}`}
      >
        {tone.label}
      </p>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
        {stability.detail}
      </p>
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted">
        Local stability probe: re-ranks the corner time-loss under a bounded{" "}
        {stability.perturbationS.toFixed(2)} s input perturbation (
        {stability.flipCount} of {stability.totalProbes} probes change the
        priority). Not a global guarantee.
      </p>
    </section>
  );
}
