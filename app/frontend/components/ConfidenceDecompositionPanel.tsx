/**
 * ConfidenceDecompositionPanel: breaks APEX's confidence in a coaching
 * report into its component signals, each shown with the real pipeline
 * source that produces it.
 *
 * This is the honest answer to the competitor pattern (e.g. PitMind's
 * "Overall confidence 95%") of surfacing a single fabricated confidence
 * number. APEX does NOT roll these into one invented score: it shows
 * each dimension next to its source, and explicitly labels any
 * dimension that is an integration-tier demo fixture rather than a live
 * per-session measurement. Server Component (pure function of props; no
 * state, no browser APIs).
 *
 * Real signals decomposed (per the wave-55 code-explorer signal audit):
 *  - Physics feasibility   : CvxpyLayer QP projection residual norms
 *  - Guardian safety        : Granite Guardian 4.1 BYOC verdict
 *  - Forecast certainty     : next-session 90% envelope band width
 *  - Physics-model conf.     : Mahalanobis detector (D-024); demo fixture
 */

import type {
  COADiffProjectionTraceEntry,
  NextSessionForecast,
  PhysicsConfidence,
} from "../../shared/types";

type Tone = "high" | "medium" | "low";

const TONE_CLASS: Record<Tone, { readonly border: string; readonly value: string }> = {
  high: { border: "border-racing-green", value: "text-racing-green" },
  medium: { border: "border-amber", value: "text-amber" },
  low: { border: "border-accent", value: "text-accent" },
};

interface Dimension {
  readonly label: string;
  readonly value: string;
  readonly tone: Tone;
  readonly source: string;
  readonly note?: string;
}

export interface ConfidenceDecompositionPanelProps {
  readonly projectionTrace: ReadonlyArray<COADiffProjectionTraceEntry>;
  readonly guardianVerdict: "approve" | "flag" | "reject";
  readonly forecast: NextSessionForecast;
  readonly physicsConfidence: PhysicsConfidence;
}

function physicsFeasibilityDim(
  trace: ConfidenceDecompositionPanelProps["projectionTrace"],
): Dimension {
  const maxResidual = trace.reduce((m, e) => Math.max(m, e.residual_norm), 0);
  const allConverged = trace.every((e) => e.status === "converged");
  return {
    label: "Physics feasibility",
    value: allConverged
      ? `converged · max resid ${maxResidual.toFixed(4)}`
      : `violation · max resid ${maxResidual.toFixed(3)}`,
    tone: allConverged ? "high" : "low",
    source: "Stage 1 + 2 projection residual norms (CvxpyLayer QP convergence)",
  };
}

function guardianDim(verdict: "approve" | "flag" | "reject"): Dimension {
  const tone: Tone = verdict === "approve" ? "high" : verdict === "flag" ? "medium" : "low";
  return {
    label: "Guardian safety",
    value: verdict.toUpperCase(),
    tone,
    source: "Granite Guardian 4.1 BYOC custom-rule verdict",
  };
}

function forecastDim(forecast: ConfidenceDecompositionPanelProps["forecast"]): Dimension {
  if (forecast.length === 0) {
    return {
      label: "Forecast certainty",
      value: "no forecast",
      tone: "low",
      source: "Next-session forecast envelope",
    };
  }
  const meanBand =
    forecast.reduce((s, p) => s + (p.high - p.low), 0) / forecast.length;
  const meanMean = forecast.reduce((s, p) => s + p.mean, 0) / forecast.length;
  const bandPct = meanMean !== 0 ? (meanBand / meanMean) * 100 : 0;
  const tone: Tone = bandPct < 1 ? "high" : bandPct < 2 ? "medium" : "low";
  return {
    label: "Forecast certainty",
    value: `±${meanBand.toFixed(3)} s mean band (${bandPct.toFixed(2)}% of pace)`,
    tone,
    source: "Next-session forecast 90% envelope width, post-projection",
  };
}

function physicsModelDim(pc: PhysicsConfidence): Dimension {
  const inDist = pc.status === "in_distribution";
  return {
    label: "Physics-model confidence",
    value: `${inDist ? "in-distribution" : "out-of-distribution"} · d ${pc.mahalanobis_distance.toFixed(2)} / p95 ${pc.threshold_p95.toFixed(2)}`,
    tone: inDist ? "high" : "low",
    source: "Mahalanobis physics-confidence detector (D-024)",
    note: "Integration-tier preview: demo fixture, not a live per-session measurement at HEAD.",
  };
}

export default function ConfidenceDecompositionPanel({
  projectionTrace,
  guardianVerdict,
  forecast,
  physicsConfidence,
}: ConfidenceDecompositionPanelProps) {
  const dims: ReadonlyArray<Dimension> = [
    physicsFeasibilityDim(projectionTrace),
    guardianDim(guardianVerdict),
    forecastDim(forecast),
    physicsModelDim(physicsConfidence),
  ];

  return (
    <section
      id="confidence-decomposition"
      aria-labelledby="confidence-decomposition-title"
      className="border-b border-rule bg-paper"
    >
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
        <p className="apex-eyebrow">Confidence decomposition</p>
        <h2
          id="confidence-decomposition-title"
          className="font-display text-3xl tracking-tight text-ink"
        >
          Confidence, broken into the signals that earn it.
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft">
          APEX does not roll a coaching report into a single invented confidence
          number. It surfaces each dimension next to the pipeline signal that
          produces it, so you can see where the confidence comes from and where it
          does not. One dimension below is an integration-tier preview, labelled as
          such.
        </p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          {dims.map((d) => {
            const tone = TONE_CLASS[d.tone];
            return (
              <div
                key={d.label}
                className={`flex flex-col gap-2 rounded-sm border-y border-r border-l-2 border-rule ${tone.border} bg-paper-warm p-5`}
              >
                <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  {d.label}
                </dt>
                <dd className={`font-display text-xl ${tone.value}`}>{d.value}</dd>
                <p className="font-mono text-[10px] leading-relaxed text-muted">
                  Source: {d.source}
                </p>
                {d.note && (
                  <p className="font-mono text-[10px] leading-relaxed text-amber">{d.note}</p>
                )}
              </div>
            );
          })}
        </dl>
        <p className="mt-6 font-mono text-xs italic text-muted">
          Each dimension is derived from a real pipeline signal (projection
          residuals, Guardian verdict, forecast envelope width) or labelled as an
          integration-tier preview. No weighted-sum overall score is shown, because
          APEX does not own a calibrated weighting and showing one would be theatre.
        </p>
      </div>
    </section>
  );
}
