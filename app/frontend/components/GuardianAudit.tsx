"use client";

/**
 * GuardianAudit: renders the Granite Guardian audit verdict + reasoning trace.
 *
 * Mirrors PLAN task 2.12 (Day 5). The audit type from `app/shared/types.ts`
 * is a discriminated union by `verdict` so this component narrows on
 * `audit.verdict` and renders verdict-specific extras (flagged_concerns,
 * blocked_recommendations) without runtime conditionals on optional fields.
 */

import type { GuardianAudit as GuardianAuditType } from "../../shared/types";

export interface GuardianAuditProps {
  readonly audit: GuardianAuditType;
}

const VERDICT_LABELS: Record<GuardianAuditType["verdict"], string> = {
  approve: "Approved",
  flag: "Flagged",
  reject: "Rejected",
};

const VERDICT_BORDER: Record<GuardianAuditType["verdict"], string> = {
  approve: "border-racing-green",
  flag: "border-amber",
  reject: "border-accent",
};

const VERDICT_TONE: Record<GuardianAuditType["verdict"], string> = {
  approve: "text-racing-green",
  flag: "text-amber",
  reject: "text-accent",
};

export default function GuardianAudit({ audit }: GuardianAuditProps) {
  return (
    <article
      aria-labelledby="audit-title"
      className={`flex flex-col gap-3 rounded-sm border-2 ${VERDICT_BORDER[audit.verdict]} bg-paper p-5`}
    >
      <p className="apex-eyebrow">Granite Guardian audit</p>
      <h3 id="audit-title" className="font-display text-2xl tracking-tight text-ink">
        Verdict:{" "}
        <span className={VERDICT_TONE[audit.verdict]}>{VERDICT_LABELS[audit.verdict]}</span>
      </h3>

      {audit.verdict === "flag" && audit.flagged_concerns.length > 0 && (
        <ConcernList title="Flagged concerns" items={audit.flagged_concerns} tone="text-amber" />
      )}
      {audit.verdict === "reject" && audit.blocked_recommendations.length > 0 && (
        <ConcernList
          title="Blocked recommendations"
          items={audit.blocked_recommendations}
          tone="text-accent"
        />
      )}

      {audit.reasoning_trace.length === 0 ? (
        <p role="alert" className="font-mono text-xs leading-relaxed text-accent">
          Reasoning trace is empty. Granite Guardian returned a {audit.verdict} verdict
          without recorded steps; the audit cannot be verified by re-reading the trace.
          Treat this verdict as provisional and re-run the session.
        </p>
      ) : (
        <details className="group" open={audit.verdict === "approve"}>
          <summary className="cursor-pointer font-mono text-xs uppercase tracking-wider text-ink-soft hover:text-racing-green">
            Reasoning trace ({audit.reasoning_trace.length} step
            {audit.reasoning_trace.length === 1 ? "" : "s"})
          </summary>
          <ol className="mt-3 flex flex-col gap-2 font-mono text-xs leading-relaxed text-ink-soft">
            {audit.reasoning_trace.map((step, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-muted">{String(idx + 1).padStart(2, "0")}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </details>
      )}

      <p className="font-mono text-xs text-muted">Audit ID · {audit.audit_id}</p>
    </article>
  );
}

function ConcernList({
  title,
  items,
  tone,
}: {
  title: string;
  items: ReadonlyArray<string>;
  tone: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-xs uppercase tracking-wider text-ink-soft">{title}</p>
      <ul className={`flex flex-col gap-1 text-sm leading-relaxed ${tone}`}>
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
