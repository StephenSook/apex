/**
 * Wave-82: recommendation-stability probe.
 *
 * Answers an axis APEX's confidence-decomposition (evidence quality) and
 * the Guardian audit (rule compliance) do not: is the headline coaching
 * priority FRAGILE? That is, would the corner the report tells you to focus
 * on FLIP if a recent reading drifted slightly or a sensor dropped out? A
 * call can be high-confidence yet sit right on a decision boundary.
 *
 * Honest by construction. This is a LOCAL stability probe: it re-ranks the
 * report's own computed corner time-loss under a bounded input perturbation.
 * It does NOT re-run the physics projection and makes no global guarantee.
 * Deterministic (a fixed perturbation grid, no randomness), so it is fully
 * testable and never fabricates a number.
 *
 * Mission relevance: for adaptive drivers on hand controls, a glitchy or
 * noisy sensor reading is a realistic failure mode, so "does the call still
 * hold if a reading drifts by 0.15 s" is a safety-relevant question that the
 * confidence and Guardian panels do not answer.
 */

export type StabilityVerdict = "stable" | "moderate" | "fragile";

export interface RecommendationStability {
  readonly verdict: StabilityVerdict;
  readonly priorityCorner: string;
  readonly runnerUpCorner: string | null;
  readonly marginS: number;
  readonly perturbationS: number;
  readonly flipCount: number;
  readonly totalProbes: number;
  readonly detail: string;
}

interface CornerLike {
  readonly name: string;
  readonly current_delta_s: number;
}

/**
 * The bounded input-noise budget probed, in seconds. Small, realistic
 * sensor-drift magnitudes; the largest is surfaced as `perturbationS`.
 */
const EPSILONS_S = [0.05, 0.1, 0.15] as const;

/**
 * Index of the priority coaching focus: the corner losing the most time
 * (the most positive delta). Strict `>` so a tie keeps the earlier index,
 * which keeps the function deterministic with no tie-break randomness.
 */
function priorityIndex(deltas: ReadonlyArray<number>): number {
  let best = 0;
  for (let i = 1; i < deltas.length; i += 1) {
    if (deltas[i] > deltas[best]) best = i;
  }
  return best;
}

/**
 * Assess whether the report's headline coaching priority holds under small
 * input perturbations. Returns null when there are fewer than two corners
 * (a single corner has no priority to flip).
 */
export function assessRecommendationStability(
  corners: ReadonlyArray<CornerLike>,
): RecommendationStability | null {
  if (corners.length < 2) return null;

  const deltas = corners.map((c) => c.current_delta_s);
  const base = priorityIndex(deltas);

  let flipCount = 0;
  let totalProbes = 0;
  for (let i = 0; i < deltas.length; i += 1) {
    for (const eps of EPSILONS_S) {
      for (const sign of [1, -1] as const) {
        const probe = deltas.slice();
        // Round to kill float-representation dust (0.2 + 0.1 = 0.30000000000000004)
        // so a perturbation that exactly closes the margin reads as a tie, not a
        // spurious flip. The grid is in 0.05 s steps, exact at 6 decimals.
        probe[i] = Math.round((probe[i] + sign * eps) * 1e6) / 1e6;
        totalProbes += 1;
        if (priorityIndex(probe) !== base) flipCount += 1;
      }
    }
  }

  const orderedDesc = deltas
    .map((d, i) => ({ d, i }))
    .sort((a, b) => b.d - a.d);
  const marginS = orderedDesc[0].d - orderedDesc[1].d;
  const perturbationS = EPSILONS_S[EPSILONS_S.length - 1];
  const priorityCorner = corners[base].name;
  const runnerUpCorner = corners[orderedDesc[1].i]?.name ?? null;

  const flipRate = flipCount / totalProbes;
  const verdict: StabilityVerdict =
    flipCount === 0 ? "stable" : flipRate <= 0.25 ? "moderate" : "fragile";

  const m = marginS.toFixed(2);
  const p = perturbationS.toFixed(2);
  const dropout =
    runnerUpCorner !== null
      ? ` If the ${priorityCorner} reading itself drops out, the focus moves to ${runnerUpCorner}.`
      : "";

  let detail: string;
  if (verdict === "stable") {
    detail = `Stable. ${priorityCorner} stays the priority focus across a bounded ${p} s perturbation of every corner reading (a ${m} s margin to the next corner), so the call holds under realistic input noise.${dropout}`;
  } else if (verdict === "moderate") {
    detail = `Moderate. ${priorityCorner} stays the priority under small input noise, but the margin to ${runnerUpCorner} is only ${m} s, so a larger sensor drift could move the focus. Treat it as the leading call, not the only one.${dropout}`;
  } else {
    detail = `Fragile. The priority focus would shift to ${runnerUpCorner} if a recent reading drifted within the bounded ${p} s probe (margin only ${m} s). Treat this as a provisional call and confirm the reading.${dropout}`;
  }

  return {
    verdict,
    priorityCorner,
    runnerUpCorner,
    marginS,
    perturbationS,
    flipCount,
    totalProbes,
    detail,
  };
}
