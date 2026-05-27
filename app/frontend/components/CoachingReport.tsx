"use client";

/**
 * CoachingReport: the main output surface APEX returns to the driver.
 *
 * Consumes the `CoachingReport` type from `app/shared/types.ts`. Renders
 * corner-by-corner insights, the tuning delta with FIA Article + COA section
 * provenance, the next-session forecast envelope as a simple inline SVG chart,
 * the Granite Guardian audit verdict, and the reproducibility provenance
 * footer (PLAN §16.5).
 *
 * Ships against canned mock data; Vinh's backend returns a live
 * `CoachingReport` JSON over `/api/analyze` per Stream M.3 spec
 * extension (Phase 1 tasks 1.1-1.6 + 1.9 shipped per G2 PASS).
 * No assumption about live state; the component is a pure function of props.
 */

import type {
  CoachingReport as CoachingReportType,
  CornerInsight,
  Citation,
  NextSessionForecast,
} from "../../shared/types";

import type { AuditId } from "../../shared/brands";

import dynamic from "next/dynamic";

import GraniteCitationFooter from "./GraniteCitationFooter";
import GuardianAudit from "./GuardianAudit";
import TuningCard from "./TuningCard";
import WatsonTtsRadio from "../lib/watson-tts-radio";

const CoachingReportLiveCharts = dynamic(
  () => import("./CoachingReportLiveCharts"),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-72 animate-pulse rounded border border-rule bg-paper-soft"
        aria-label="Recharts panels loading"
      />
    ),
  },
);

export interface CoachingReportProps {
  readonly report: CoachingReportType;
}

export default function CoachingReport({ report }: CoachingReportProps) {
  return (
    <section
      id="coaching-report"
      aria-labelledby="report-title"
      className="border-y border-rule bg-paper"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10 lg:py-24">
        <header className="flex flex-col gap-3 pb-10">
          <p className="apex-eyebrow">Step 2 of 2 · APEX coaching report</p>
          <h2
            id="report-title"
            className="font-display text-4xl tracking-tight text-ink sm:text-5xl"
          >
            Corner-by-corner coaching.
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-ink-soft">
            Generated for{" "}
            <span className="font-mono text-sm text-ink">{report.driver_id}</span>.
            Sixty seconds end to end on Granite. Every recommendation cites the
            specific FIA Appendix L Article and COA section that authorises it.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <CornerList corners={report.corners} />
            <ForecastChart forecast={report.forecast} />
            <CoachingReportLiveCharts report={report} />
          </div>
          <aside className="flex flex-col gap-6">
            <TuningCard tuning={report.tuning_delta} />
            <GuardianAudit audit={report.audit} />
            <WatsonTtsRadio
              auditId={safeParseAuditId(report.audit.audit_id)}
              text={buildCoachingNarration(report)}
            />
          </aside>
        </div>

        <GraniteCitationFooter report={report} />
        <ProvenanceFooterBlock provenance={report.provenance} />
      </div>
    </section>
  );
}

/**
 * Validate the audit_id from any source, falling back to the
 * "no_audit" sentinel for non-canonical inputs (test fixtures, legacy
 * reports). The WatsonTtsRadio still mounts + the walkie-talkie
 * surface renders; audit_id is purely a cache-key in the wider system
 * + the sentinel is the documented null-equivalent. Wave-43 cascade-#17
 * inline validator instead of parseAuditId import to dodge Turbopack
 * client-bundle cross-tree resolution issue per cascade #11 family.
 */
const AUDIT_ID_HEX = /^[0-9a-f]{32}$/;
function safeParseAuditId(raw: string): AuditId {
  if (raw === "no_audit" || AUDIT_ID_HEX.test(raw)) {
    return raw as unknown as AuditId;
  }
  return "no_audit" as unknown as AuditId;
}

/**
 * Build a concise spoken narration from the coaching report for the
 * WatsonTtsRadio walkie-talkie surface. Pulls top-3 corner deltas +
 * tuning recommendation + guardian verdict. ~250 words; Watson TTS
 * renders in ~1-3s on Vercel.
 */
function buildCoachingNarration(report: CoachingReportType): string {
  const topCorners = [...report.corners]
    .slice(0, 3)
    .map((c) => `Sector ${c.sector} ${c.name}, delta ${c.current_delta_s.toFixed(2)} seconds: ${c.recommendation}`)
    .join(" ");
  const tuning = `Tuning recommendation: ${report.tuning_delta.parameter} from ${report.tuning_delta.current} to ${report.tuning_delta.recommended} ${report.tuning_delta.unit}.`;
  const verdict = `Guardian verdict: ${report.audit.verdict}.`;
  return `${topCorners} ${tuning} ${verdict}`;
}

function CornerList({ corners }: { corners: ReadonlyArray<CornerInsight> }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-display text-2xl tracking-tight text-ink">
        Corners ({corners.length})
      </h3>
      <ol className="flex flex-col gap-3" aria-label="Corner-by-corner coaching insights">
        {corners.map((corner, index) => (
          <li key={`${corner.sector}-${corner.name}-${index}`}>
            <CornerCard corner={corner} />
          </li>
        ))}
      </ol>
    </div>
  );
}

const REASONING_STEP_DOT_TONE: Record<
  "cause" | "consequences" | "recommendation" | "evidence",
  string
> = {
  cause: "bg-accent",
  consequences: "bg-amber",
  recommendation: "bg-racing-green",
  evidence: "bg-ink",
};

function CornerCard({ corner }: { corner: CornerInsight }) {
  const slower = corner.current_delta_s > 0;
  const deltaLabel = `${slower ? "+" : ""}${corner.current_delta_s.toFixed(2)} s`;
  const deltaTone = slower ? "text-accent" : "text-racing-green";
  const chain = corner.reasoning_chain ?? [];

  return (
    <article className="rounded-sm border border-rule bg-paper-warm p-5">
      <header className="flex items-baseline justify-between gap-4 pb-2">
        <h4 className="font-display text-lg text-ink">{corner.name}</h4>
        <span className="font-mono text-xs uppercase tracking-wider text-muted">
          Sector {corner.sector}
        </span>
      </header>
      <p className={`font-mono text-base ${deltaTone}`}>{deltaLabel} vs reference</p>
      <p className="pt-2 text-sm leading-relaxed text-ink-soft">{corner.recommendation}</p>
      {corner.citations.length > 0 && (
        <ul className="flex flex-wrap gap-2 pt-3" aria-label="Citations for this recommendation">
          {corner.citations.map((citation, idx) => (
            <li key={idx}>
              <CitationChip citation={citation} />
            </li>
          ))}
        </ul>
      )}
      {chain.length > 0 && (
        <details className="group mt-4 border-t border-rule pt-3">
          <summary className="cursor-pointer list-none font-mono text-[11px] uppercase tracking-wider text-racing-green hover:text-ink focus-visible:text-ink">
            <span aria-hidden="true" className="inline-block group-open:rotate-90 transition-transform">&rsaquo;</span>{" "}
            Reasoning chain ({chain.length} {chain.length === 1 ? "step" : "steps"})
          </summary>
          <ol className="mt-3 flex flex-col gap-3" aria-label="Reasoning chain steps">
            {chain.map((step, idx) => (
              <li key={`${step.step}-${idx}`} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${REASONING_STEP_DOT_TONE[step.step]}`}
                />
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    {step.label}
                  </span>
                  <p className="text-sm leading-relaxed text-ink-soft">{step.content}</p>
                </div>
              </li>
            ))}
          </ol>
        </details>
      )}
    </article>
  );
}

function CitationChip({ citation }: { citation: Citation }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-rule bg-paper px-2 py-1 font-mono text-xs leading-none text-muted">
      <span className="text-racing-green">{citation.fia_article}</span>
      <span aria-hidden="true">·</span>
      <span>{citation.coa_section}</span>
    </span>
  );
}

function ForecastChart({ forecast }: { forecast: NextSessionForecast }) {
  if (forecast.length === 0) {
    return (
      <div className="rounded-sm border border-rule bg-paper-warm p-5 text-sm text-muted">
        No forecast available for this session.
      </div>
    );
  }

  // Invariant check: every forecast point must be finite + low<=mean<=high.
  // CvxpyLayer QP infeasibility + serializer bugs (Convergence 14) can leak
  // malformed points; rendering a geometrically-invalid envelope would lie
  // about the physics to judges actually reading the chart.
  const invalid = forecast.find(
    (point) =>
      !Number.isFinite(point.mean) ||
      !Number.isFinite(point.low) ||
      !Number.isFinite(point.high) ||
      point.low > point.high ||
      point.mean < point.low ||
      point.mean > point.high,
  );
  if (invalid) {
    return (
      <div
        role="alert"
        className="rounded-sm border-2 border-accent bg-paper p-5 text-sm leading-relaxed text-accent"
      >
        Forecast envelope invalid for mini-sector {invalid.sector_idx}. Physics projection failed the
        low {String(invalid.low)} / mean {String(invalid.mean)} / high {String(invalid.high)}{" "}
        consistency check. Re-run the session.
      </div>
    );
  }

  const means = forecast.map((point) => point.mean);
  const highs = forecast.map((point) => point.high);
  const lows = forecast.map((point) => point.low);
  const yMin = Math.min(...lows);
  const yMax = Math.max(...highs);
  const isDegenerate = yMax === yMin;
  const yRange = yMax - yMin || 1;

  const W = 600;
  const H = 220;
  const PAD = 32;
  const xFor = (idx: number) => PAD + (idx * (W - 2 * PAD)) / Math.max(1, forecast.length - 1);
  const yFor = (val: number) => H - PAD - ((val - yMin) / yRange) * (H - 2 * PAD);

  const meanLow = Math.min(...means).toFixed(2);
  const meanHigh = Math.max(...means).toFixed(2);

  const isSinglePoint = forecast.length === 1;

  const envelopePath = forecast
    .map((point, idx) => `${idx === 0 ? "M" : "L"} ${xFor(idx)} ${yFor(point.high)}`)
    .concat(
      forecast
        .slice()
        .reverse()
        .map((point, idx) => `L ${xFor(forecast.length - 1 - idx)} ${yFor(point.low)}`),
    )
    .join(" ")
    .concat(" Z");

  const meanPath = forecast
    .map((point, idx) => `${idx === 0 ? "M" : "L"} ${xFor(idx)} ${yFor(point.mean)}`)
    .join(" ");

  return (
    <div className="flex flex-col gap-3 rounded-sm border border-rule bg-paper-warm p-5">
      <h3 className="font-display text-2xl tracking-tight text-ink">
        Next-session forecast envelope
      </h3>
      <p className="font-mono text-xs leading-relaxed text-muted">
        Mean projection {meanLow} s to {meanHigh} s across {forecast.length} mini-sector
        {forecast.length === 1 ? "" : "s"}. Envelope is the 90 percent confidence band after physics
        projection.
      </p>
      {isDegenerate && (
        <p className="font-mono text-xs leading-relaxed text-amber">
          Note: forecast envelope is flat. Zero variance across mini-sectors is unusual; verify the
          projection.
        </p>
      )}
      <svg
        role="img"
        aria-label={`Next-session forecast across ${forecast.length} mini-sector${forecast.length === 1 ? "" : "s"}`}
        viewBox={`0 0 ${W} ${H}`}
        className="h-56 w-full"
      >
        {isSinglePoint ? (
          <circle
            cx={xFor(0)}
            cy={yFor(forecast[0].mean)}
            r="5"
            fill="var(--racing-green)"
          />
        ) : (
          <>
            <path d={envelopePath} fill="var(--accent)" fillOpacity="0.18" />
            <path
              d={meanPath}
              fill="none"
              stroke="var(--racing-green)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        )}
        <line
          x1={PAD}
          y1={H - PAD}
          x2={W - PAD}
          y2={H - PAD}
          stroke="var(--rule)"
          strokeWidth="1"
        />
        <text
          x={PAD}
          y={H - 8}
          fontFamily="ui-monospace, monospace"
          fontSize="10"
          fill="var(--muted)"
        >
          Mini-sector 0
        </text>
        <text
          x={W - PAD}
          y={H - 8}
          fontFamily="ui-monospace, monospace"
          fontSize="10"
          fill="var(--muted)"
          textAnchor="end"
        >
          Mini-sector {forecast.length - 1}
        </text>
      </svg>
    </div>
  );
}

function ProvenanceFooterBlock({
  provenance,
}: {
  provenance: CoachingReportType["provenance"];
}) {
  const items: ReadonlyArray<readonly [string, string]> = [
    ["Granite-Docling", provenance.model_versions.granite_docling],
    ["Granite Vision", provenance.model_versions.granite_vision],
    ["Granite TTM", provenance.model_versions.granite_ttm],
    ["Granite 4.1 8B Instruct", provenance.model_versions.granite_instruct],
    ["Granite Guardian", provenance.model_versions.granite_guardian],
    ["Commit", provenance.commit_sha.slice(0, 10)],
    ["Generated", provenance.generated_at_iso],
  ];

  return (
    <footer className="mt-12 rounded-sm border border-rule bg-paper p-5 font-mono text-xs leading-relaxed text-muted">
      <p className="pb-3 uppercase tracking-wider text-ink-soft">Provenance footer</p>
      <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt>{label}</dt>
            <dd className="text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </footer>
  );
}
