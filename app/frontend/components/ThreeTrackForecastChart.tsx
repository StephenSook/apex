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
 */

import type {
  ForecastTrackName,
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

export default function ThreeTrackForecastChart({ forecast }: ThreeTrackForecastChartProps) {
  const allEmpty = forecast.tracks.every((t) => t.forecast.length === 0);
  if (allEmpty) {
    return (
      <div className="rounded-sm border border-rule bg-paper p-5 text-sm text-muted">
        No three-track forecast available for this session.
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
        Three-track forecast contained no finite values; physics projection failed the consistency
        check across all three tracks. Re-run the session.
      </div>
    );
  }

  const yMin = Math.min(...allValues);
  const yMax = Math.max(...allValues);
  const yRange = yMax - yMin || 1;

  const horizonLength = Math.max(...forecast.tracks.map((t) => t.forecast.length));
  const W = 800;
  const H = 300;
  const PAD = 36;
  const xFor = (idx: number) =>
    PAD + (idx * (W - 2 * PAD)) / Math.max(1, horizonLength - 1);
  const yFor = (val: number) => H - PAD - ((val - yMin) / yRange) * (H - 2 * PAD);

  function trackPath(values: ReadonlyArray<number>): string {
    return values
      .map((v, idx) => `${idx === 0 ? "M" : "L"} ${xFor(idx).toFixed(2)} ${yFor(v).toFixed(2)}`)
      .join(" ");
  }

  // Quantile bands for the chronos2 track: render envelope between min + max
  // quantile as a filled polygon path. Per wave-35 B.2 refactor, chronos2
  // variant carries `quantiles` as a required (non-optional) field, so the
  // optional-chain shortcut from before is no longer needed.
  const chronos = forecast.tracks.find((t) => t.track === "chronos2");
  const quantileEnvelope =
    chronos && chronos.track === "chronos2" && chronos.quantiles.length >= 2 && chronos.forecast.length > 0
      ? buildQuantileEnvelope(chronos.forecast, chronos.quantiles, xFor, yFor)
      : null;

  return (
    <section
      aria-labelledby="three-track-title"
      className="flex flex-col gap-3 rounded-sm border border-rule bg-paper p-5"
    >
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p className="apex-eyebrow">Three-track forecasting ensemble · D-010</p>
          <h3 id="three-track-title" className="font-display text-2xl tracking-tight text-ink">
            {forecast.status === "converged" ? "Ensemble converged" : "Ensemble diverged"}
          </h3>
        </div>
        <DivergenceChip sigma={forecast.divergence_sigma} converged={forecast.status === "converged"} />
      </header>

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
        {forecast.status === "converged" && forecast.ensemble.length > 0 && (
          <path
            d={trackPath(forecast.ensemble)}
            className="stroke-ink fill-none stroke-[3]"
            aria-hidden="true"
          />
        )}
      </svg>

      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 font-mono text-xs text-ink-soft">
        {forecast.tracks.map((track) => (
          <li key={track.track} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`inline-block h-2 w-6 ${TRACK_STROKES[track.track].replace("stroke-", "bg-")}`}
            />
            <span>{TRACK_LABELS[track.track]}</span>
          </li>
        ))}
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

function buildQuantileEnvelope(
  forecastMeans: ReadonlyArray<number>,
  quantiles: ReadonlyArray<number>,
  xFor: (idx: number) => number,
  yFor: (val: number) => number,
): string {
  // Use the min + max of the quantile band as the envelope edges,
  // applied per-step via the forecastMeans index. This is a coarse
  // band visualization; the full 21-quantile precision is in the
  // backend log. Render envelope as a closed polygon path: upper
  // edge left-to-right + lower edge right-to-left + close.
  const qMin = Math.min(...quantiles);
  const qMax = Math.max(...quantiles);
  const half = (qMax - qMin) / 2;
  const upper = forecastMeans.map((v, idx) => `${idx === 0 ? "M" : "L"} ${xFor(idx).toFixed(2)} ${yFor(v + half).toFixed(2)}`);
  const lower = [...forecastMeans]
    .reverse()
    .map((v, idxRev) => {
      const idx = forecastMeans.length - 1 - idxRev;
      return `L ${xFor(idx).toFixed(2)} ${yFor(v - half).toFixed(2)}`;
    });
  return `${upper.join(" ")} ${lower.join(" ")} Z`;
}
