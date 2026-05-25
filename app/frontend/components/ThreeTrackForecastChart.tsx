/**
 * ThreeTrackForecastChart: renders the wave-30 D-010 three-track
 * forecasting ensemble (Granite TTM r2.1 channel-mix + Granite FlowState
 * + Amazon Chronos-2) as a multi-line chart with per-track confidence
 * bands + ensemble fused result. Chronos-2 quantile bands (21 quantiles
 * per D-010) render as light envelope shading; TTM + FlowState render
 * as single forecast lines. Ensemble fused line renders on top in ink.
 *
 * Discriminated union by status: "converged" renders ensemble + bands;
 * "diverged" renders the 3 tracks separately + a fallback-strategy
 * alert per pre-mortem row 57 (TTM-only fallback OR weighted blend
 * dropping outlier).
 *
 * Mirrors the inline ForecastChart pattern in CoachingReport.tsx (SVG +
 * manual path computation + invariant checks + role=alert for invalid
 * envelopes). Editorial-paddock palette consistent.
 *
 * Wave-35 A.1-A.6 silent-failure close-out: NaN-quantile guard +
 * degenerate-envelope amber note + alert-specificity for empty vs NaN +
 * exhaustiveness throw on status + chronos2 .find undefined alert +
 * single-point envelope guard with circle rendering. All six fixes
 * per wave-34 silent-failure-hunter findings H-1 through H-3 + M-1
 * + M-3 + M-5.
 */

import type {
  ChronosBand,
  ForecastTrackName,
  ThreeTrackBand,
  ThreeTrackForecast,
} from "../../shared/types";

export interface ThreeTrackForecastChartProps {
  readonly forecast: ThreeTrackForecast;
}

const TRACK_LABELS: Record<ForecastTrackName, string> = {
  ttm_channel_mix: "Granite TTM r2.1 channel-mix",
  flowstate: "Granite FlowState",
  chronos2: "Amazon Chronos-2 (21-quantile)",
};

const TRACK_STROKES: Record<ForecastTrackName, string> = {
  ttm_channel_mix: "stroke-racing-green",
  flowstate: "stroke-amber",
  chronos2: "stroke-accent",
};

// Wave-44 Phase 6d honesty audit per BLOCKER 4 framing: per-track
// wire-up tier surfacing. TTM r2.1 wires via OpenRouter (Vinh V3
// backend swap-point already documented per Phase 1 task 1.3);
// FlowState + Chronos-2 are mock at HEAD pending Vinh V10 + V11
// post-submission. Render-path-identical per Stream M.3 spec
// extension; status badge is a visual honesty marker for judges.
type TrackTier = "INTEGRATION" | "MOCK";

const TRACK_TIERS: Record<ForecastTrackName, TrackTier> = {
  ttm_channel_mix: "INTEGRATION",
  flowstate: "MOCK",
  chronos2: "MOCK",
};

const TRACK_SWAP_POINTS: Record<ForecastTrackName, string> = {
  ttm_channel_mix: "Vinh V3 backend (Phase 1 task 1.3 + 1.4 forecast)",
  flowstate: "Vinh V10 backend (post-submission)",
  chronos2: "Vinh V11 backend (post-submission)",
};

export default function ThreeTrackForecastChart({ forecast }: ThreeTrackForecastChartProps) {
  // Wave-35 A.4 exhaustiveness throw on forecast.status. Top-of-function
  // switch derives the converged-flag + asserts at compile time that
  // every variant of ThreeTrackForecast.status is handled. If a new
  // variant is added without updating this switch, TypeScript errors
  // on the `never` assignment.
  let isConverged: boolean;
  switch (forecast.status) {
    case "converged":
      isConverged = true;
      break;
    case "diverged":
      isConverged = false;
      break;
    default: {
      const _exhaustive: never = forecast;
      throw new Error(`Unknown forecast status: ${String(_exhaustive)}`);
    }
  }

  // Wave-37 silent-failure-hunter H-2: top-of-function guard on
  // divergence_sigma. forecast.status is backend-computed from sigma;
  // a backend bug emitting status="converged" alongside sigma=NaN
  // silently rendered "Ensemble converged" header + a green chip with
  // "σ unavailable" misleading operators that the converged-vs-diverged
  // classification was meaningful. Surface non-finite sigma explicitly
  // via role=alert before any downstream rendering decisions.
  if (!Number.isFinite(forecast.divergence_sigma)) {
    return (
      <div
        role="alert"
        className="rounded-sm border-2 border-accent bg-paper p-5 text-sm leading-relaxed text-accent"
      >
        Three-track ensemble divergence sigma is non-finite (
        {String(forecast.divergence_sigma)}); the converged-vs-diverged classification is
        unreliable. Re-run the session before acting on any output.
      </div>
    );
  }

  // Wave-37 type-design-analyzer H-1: positional tuple-binding (wave-36
  // A2) types forecast.tracks[2] as ChronosBand directly. Previous code
  // used `.find` which returned ThreeTrackBand | undefined, losing the
  // compile-time benefit of the positional binding. Direct positional
  // access narrows at compile time.
  //
  // Runtime guard (wave-35 A.5 originally) still defends against
  // backend JSON.parse drift where the tuple-position contract is
  // violated despite the TypeScript type (codex wave-36 H-4 cascade-#5
  // prediction: type enforcement is at frontend construction, not at
  // JSON deserialization).
  const chronos: ChronosBand = forecast.tracks[2];
  if ((chronos as ThreeTrackBand).track !== "chronos2") {
    return (
      <div
        role="alert"
        className="rounded-sm border-2 border-accent bg-paper p-5 text-sm leading-relaxed text-accent"
      >
        Three-track forecast missing the Chronos-2 track in the backend response. Re-run the
        session; this indicates an upstream ensemble-construction error.
      </div>
    );
  }

  const allEmpty = forecast.tracks.every((t) => t.forecast.length === 0);

  // Wave-35 A.3 alert specificity. Distinguish all-empty (no data
  // available) vs all-NaN (physics projection produced data but all
  // values were non-finite). Different actionable next steps.
  if (allEmpty) {
    return (
      <div
        role="status"
        className="rounded-sm border border-rule bg-paper p-5 text-sm text-muted"
      >
        Three-track forecast has no data for this session. Verify upstream telemetry intake.
      </div>
    );
  }

  // Determine common y-range across all tracks (+ ensemble if converged).
  const allValues: number[] = [];
  forecast.tracks.forEach((track) => {
    track.forecast.forEach((v) => {
      if (Number.isFinite(v)) {
        allValues.push(v);
      }
    });
    if (track.track === "chronos2") {
      track.quantiles.forEach((v) => {
        if (Number.isFinite(v)) {
          allValues.push(v);
        }
      });
    }
  });
  // TypeScript only narrows ThreeTrackForecast via the discriminator
  // (forecast.status) directly, not through derived boolean variables
  // like isConverged. Re-narrow inline to access forecast.ensemble.
  if (forecast.status === "converged") {
    forecast.ensemble.forEach((v) => {
      if (Number.isFinite(v)) {
        allValues.push(v);
      }
    });
  }

  if (allValues.length === 0) {
    return (
      <div
        role="alert"
        className="rounded-sm border-2 border-accent bg-paper p-5 text-sm leading-relaxed text-accent"
      >
        Three-track forecast contained no finite values (every track returned NaN or Infinity);
        physics projection failed the consistency check across all three tracks. Re-run the
        session before acting on any output.
      </div>
    );
  }

  const yMin = Math.min(...allValues);
  const yMax = Math.max(...allValues);

  // Wave-35 A.2 degenerate-flat envelope detection. yMax === yMin means
  // zero cross-track variance (the forecast is identically flat across
  // every track + the ensemble). Mathematically possible but in
  // motorsport-telemetry context an unusual signal that should surface
  // to the operator. Mirrors CoachingReport.tsx:206-211 amber-note
  // pattern.
  const isDegenerate = yMax === yMin;
  const yRange = isDegenerate ? 1 : yMax - yMin;

  const horizonLength = Math.max(...forecast.tracks.map((t) => t.forecast.length));
  const W = 800;
  const H = 300;
  const PAD = 36;
  const xFor = (idx: number) =>
    PAD + (idx * (W - 2 * PAD)) / Math.max(1, horizonLength - 1);
  const yFor = (val: number) => H - PAD - ((val - yMin) / yRange) * (H - 2 * PAD);

  // Wave-36 BLOCKER fix per cold-review dual-signal (codex MED A1 +
  // silent-failure-hunter H-1). Previous trackPath implementation
  // filtered non-finite values then mapped surviving values to
  // contiguous M/L commands; `xFor(idx)` was called with the post-
  // filter index, so [40, NaN, 42] rendered as M(x=0,y=40) L(x=1,y=42)
  // instead of M(x=0,y=40) M(x=2,y=42). The forecast was silently
  // corrupted: surviving points re-anchored to wrong horizon positions.
  //
  // New behavior: preserve ORIGINAL horizon index; emit "M" at every
  // gap (multi-segment polyline). Non-finite values produce a visible
  // gap in the rendered line instead of silently shifting subsequent
  // points leftward.
  function trackPath(values: ReadonlyArray<number>): string {
    const segments: string[] = [];
    let lastFinite = false;
    values.forEach((v, idx) => {
      if (!Number.isFinite(v)) {
        lastFinite = false;
        return;
      }
      const command = lastFinite ? "L" : "M";
      segments.push(`${command} ${xFor(idx).toFixed(2)} ${yFor(v).toFixed(2)}`);
      lastFinite = true;
    });
    return segments.join(" ");
  }

  // Wave-35 A.1 + A.6 quantile envelope: filter finite values + handle
  // single-point case. If any non-finite quantile leaks through, the
  // envelope would render NaN coordinates that browsers silently drop;
  // judges see a missing band with no signal. Pre-filter + return null
  // signals upstream "no valid envelope to draw" + parent component
  // does not attempt to render. Same for single-point forecast (line 1
  // requires at least 2 finite means for a polygon).
  const quantileEnvelope =
    chronos.quantiles.length >= 2 && chronos.forecast.length > 0
      ? buildQuantileEnvelope(chronos.forecast, chronos.quantiles, xFor, yFor)
      : null;

  // Wave-37 silent-failure-hunter M-1: generalize the wave-35 A.6
  // single-point Chronos-2 circle pattern to ALL tracks. Multi-segment
  // trackPath emits "M-only" paths (no L commands) for tracks with one
  // isolated finite point OR with gaps separating finite points; SVG
  // strokes nothing for M-only paths so the rendered chart silently
  // drops those points. Compute isolated-finite-points per track + per
  // ensemble + render `<circle>` at each so isolated values stay
  // visible at the correct horizon position.
  function isolatedPoints(values: ReadonlyArray<number>): Array<{ idx: number; v: number }> {
    return values
      .map((v, idx) => ({ v, idx }))
      .filter(({ v, idx }) => {
        if (!Number.isFinite(v)) return false;
        const prevFinite = idx > 0 && Number.isFinite(values[idx - 1]);
        const nextFinite =
          idx < values.length - 1 && Number.isFinite(values[idx + 1]);
        return !prevFinite && !nextFinite;
      });
  }

  return (
    <section
      aria-labelledby="three-track-title"
      className="flex flex-col gap-3 rounded-sm border border-rule bg-paper p-5"
    >
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p className="apex-eyebrow">Three-track forecasting ensemble · D-010</p>
          <h3 id="three-track-title" className="font-display text-2xl tracking-tight text-ink">
            {isConverged ? "Ensemble converged" : "Ensemble diverged"}
          </h3>
        </div>
        <DivergenceChip sigma={forecast.divergence_sigma} converged={isConverged} />
      </header>

      {isDegenerate && (
        <p
          role="status"
          className="rounded-sm border-2 border-amber bg-paper p-3 font-mono text-xs leading-relaxed text-amber"
        >
          Forecast envelope is flat across all three tracks (zero cross-track variance). This is
          mathematically possible but unusual for motorsport telemetry; verify the projection
          before acting on the recommendation.
        </p>
      )}

      {forecast.status === "diverged" && (
        <p
          role="alert"
          className="rounded-sm border-2 border-amber bg-paper p-3 font-mono text-xs leading-relaxed text-amber"
        >
          Three-track ensemble divergence exceeds 2 sigma at{" "}
          {forecast.divergence_sigma.toFixed(2)}. Fallback strategy active:{" "}
          {forecast.fallback === "ttm_only"
            ? "TTM-only forecast for this lap; FlowState + Chronos-2 outputs logged as ensemble-confidence=low for Guardian audit."
            : "weighted blend dropping the outlier track; remaining two tracks fused with TTM anchor."}
        </p>
      )}

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Three-track forecast envelope chart"
        className="w-full"
      >
        {quantileEnvelope && (
          <path d={quantileEnvelope} className="fill-accent/10 stroke-none" aria-hidden="true" />
        )}
        {forecast.tracks.map((track) =>
          track.forecast.length > 0 ? (
            <path
              key={track.track}
              d={trackPath(track.forecast)}
              className={`${TRACK_STROKES[track.track]} fill-none stroke-2`}
              aria-hidden="true"
            />
          ) : null,
        )}
        {forecast.tracks.flatMap((track) =>
          isolatedPoints(track.forecast).map(({ idx, v }) => (
            <circle
              key={`${track.track}-pt-${idx}`}
              cx={xFor(idx)}
              cy={yFor(v)}
              r="4"
              className={`${TRACK_STROKES[track.track].replace("stroke-", "fill-")} stroke-none`}
              aria-hidden="true"
            />
          )),
        )}
        {forecast.status === "converged" && forecast.ensemble.length > 0 && (
          <path
            d={trackPath(forecast.ensemble)}
            className="stroke-ink fill-none stroke-[3]"
            aria-hidden="true"
          />
        )}
        {forecast.status === "converged" &&
          isolatedPoints(forecast.ensemble).map(({ idx, v }) => (
            <circle
              key={`ensemble-pt-${idx}`}
              cx={xFor(idx)}
              cy={yFor(v)}
              r="5"
              className="fill-ink stroke-none"
              aria-hidden="true"
            />
          ))}
      </svg>

      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 font-mono text-xs text-ink-soft">
        {forecast.tracks.map((track) => {
          const tier = TRACK_TIERS[track.track];
          return (
            <li key={track.track} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`inline-block h-2 w-6 ${TRACK_STROKES[track.track].replace("stroke-", "bg-")}`}
                />
                <span>{TRACK_LABELS[track.track]}</span>
                <span
                  className={`rounded-sm border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${
                    tier === "INTEGRATION"
                      ? "border-amber bg-paper text-amber"
                      : "border-rule bg-paper text-muted"
                  }`}
                  aria-label={`Wire-up tier: ${tier}`}
                >
                  {tier === "INTEGRATION" ? "Integration" : "Mock"}
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted">
                Swap: {TRACK_SWAP_POINTS[track.track]}
              </span>
            </li>
          );
        })}
        {forecast.status === "converged" && (
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-[3px] w-6 bg-ink" />
            <span>Ensemble fused output (weighted-mean blend, TTM anchor)</span>
          </li>
        )}
      </ol>
    </section>
  );
}

function DivergenceChip({ sigma, converged }: { sigma: number; converged: boolean }) {
  // Wave-37 silent-failure-hunter H-1: 3-state visual treatment.
  // Previously the chip kept border-racing-green / border-amber via the
  // converged boolean even when sigma was non-finite, so a backend bug
  // producing NaN sigma still wore the converged costume + lied about
  // the classification. Non-finite sigma now produces a border-accent +
  // role=alert chip that explicitly disclaims the classification.
  // Defense-in-depth: parent ThreeTrackForecastChart already top-of-
  // function guards non-finite sigma per wave-37 silent-failure H-2;
  // this branch fires only if the chip is reused standalone.
  if (!Number.isFinite(sigma)) {
    return (
      <span
        role="alert"
        className="rounded-sm border-2 border-accent bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-accent"
      >
        σ unavailable
      </span>
    );
  }
  const borderClass = converged ? "border-racing-green" : "border-amber";
  const toneClass = converged ? "text-racing-green" : "text-amber";
  return (
    <span
      className={`rounded-sm border ${borderClass} bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${toneClass}`}
    >
      σ={sigma.toFixed(2)}
    </span>
  );
}

/**
 * Build the Chronos-2 quantile-envelope polygon path. Pre-filters
 * non-finite values per wave-35 A.1 NaN-quantile guard; returns null
 * when filtering leaves insufficient finite values to form a polygon
 * (< 2 quantile values OR < 2 forecast means; single-point forecasts
 * handled separately by the parent via the circle render path).
 *
 * Render envelope as a closed polygon path: upper edge left-to-right +
 * lower edge right-to-left + close.
 */
function buildQuantileEnvelope(
  forecastMeans: ReadonlyArray<number>,
  quantiles: ReadonlyArray<number>,
  xFor: (idx: number) => number,
  yFor: (val: number) => number,
): string | null {
  const finiteQuantiles = quantiles.filter((q) => Number.isFinite(q));
  const finiteMeans = forecastMeans.filter((m) => Number.isFinite(m));
  // Wave-35 A.1 + A.6 guard: need >= 2 finite quantiles for a band AND
  // >= 2 finite forecast means for a polygon. Single-point forecasts
  // handled by the parent circle render; not by this envelope builder.
  if (finiteQuantiles.length < 2 || finiteMeans.length < 2) {
    return null;
  }
  const qMin = Math.min(...finiteQuantiles);
  const qMax = Math.max(...finiteQuantiles);
  const half = (qMax - qMin) / 2;
  const upper = finiteMeans.map(
    (v, idx) => `${idx === 0 ? "M" : "L"} ${xFor(idx).toFixed(2)} ${yFor(v + half).toFixed(2)}`,
  );
  const lower = [...finiteMeans].reverse().map((v, idxRev) => {
    const idx = finiteMeans.length - 1 - idxRev;
    return `L ${xFor(idx).toFixed(2)} ${yFor(v - half).toFixed(2)}`;
  });
  return `${upper.join(" ")} ${lower.join(" ")} Z`;
}
