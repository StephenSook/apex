"use client";

/**
 * TuningCard: renders one TuningDelta with FIA Article + COA section citation.
 *
 * Mirrors PLAN task 3.2 (Day 6). Consumed by `CoachingReport` as the
 * sidebar tuning-recommendation block. Provenance is a citation chip
 * pointing at the specific Appendix L Article that authorises the change.
 */

import type { TuningDelta } from "../../shared/types";

export interface TuningCardProps {
  readonly tuning: TuningDelta;
}

export default function TuningCard({ tuning }: TuningCardProps) {
  const friendlyParam = tuning.parameter.replace(/_/g, " ");

  // Physics-projection layer can return NaN on infeasible CvxpyLayer QP solves
  // (pre-mortem row 23) and upstream telemetry parse bugs can leak Infinity.
  // Rendering "NaN mm" inline is a silent UX failure; surface the contract
  // violation as an explicit role=alert and bail out.
  if (!Number.isFinite(tuning.current) || !Number.isFinite(tuning.recommended)) {
    return (
      <article
        role="alert"
        aria-labelledby="tuning-title"
        className="flex flex-col gap-3 rounded-sm border-2 border-accent bg-paper p-5"
      >
        <p className="apex-eyebrow text-accent">Tuning unavailable</p>
        <h3 id="tuning-title" className="font-display text-2xl tracking-tight text-ink">
          {friendlyParam}
        </h3>
        <p className="text-sm leading-relaxed text-ink-soft">
          APEX could not compute a finite tuning delta for this parameter. The physics
          projection returned a non-finite value (current {String(tuning.current)},
          recommended {String(tuning.recommended)}). Re-run the session or contact support.
        </p>
      </article>
    );
  }

  const delta = tuning.recommended - tuning.current;
  const sign = delta > 0 ? "+" : "";
  const formattedDelta = `${sign}${delta.toFixed(2)} ${tuning.unit}`;

  return (
    <article
      aria-labelledby="tuning-title"
      className="flex flex-col gap-3 rounded-sm border-2 border-amber bg-paper p-5"
    >
      <p className="apex-eyebrow">Tuning recommendation</p>
      <h3 id="tuning-title" className="font-display text-2xl tracking-tight text-ink">
        {friendlyParam}
      </h3>

      <dl className="grid grid-cols-3 gap-2 pt-2 font-mono text-xs">
        <div className="flex flex-col gap-1">
          <dt className="uppercase tracking-wider text-muted">Current</dt>
          <dd className="text-base text-ink">
            {tuning.current.toFixed(2)} {tuning.unit}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="uppercase tracking-wider text-muted">Recommended</dt>
          <dd className="text-base text-ink">
            {tuning.recommended.toFixed(2)} {tuning.unit}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="uppercase tracking-wider text-muted">Delta</dt>
          <dd className="text-base text-ink-soft">{formattedDelta}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2 pt-2" aria-label="Citation for tuning recommendation">
        <span className="inline-flex items-center gap-1 rounded-sm border border-rule bg-paper-warm px-2 py-1 font-mono text-xs leading-none text-muted">
          <span className="text-racing-green">{tuning.citation.fia_article}</span>
          <span aria-hidden="true">·</span>
          <span>{tuning.citation.coa_section}</span>
        </span>
      </div>
    </article>
  );
}
