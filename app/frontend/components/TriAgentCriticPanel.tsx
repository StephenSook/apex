"use client";

/**
 * TriAgentCriticPanel: renders the wave-30 D-018 tri-agent Agent-as-Judge
 * critic loop verdicts side-by-side. Three critics run in parallel on the
 * draft coaching report (Physics-Critic + Pedagogy-Critic + Guardian-
 * Safety); if any critic flags, Mellea Instruct-Validate-Repair fires
 * with loop_budget = 3 per D-018. This component is display-only on
 * /judges; backend produces the TriAgentVerdictPanel data per
 * `app/backend/apex/critics/orchestrator.py` per PLAN row 4.20.
 *
 * Mirrors GuardianAudit verdict-narrowing pattern (discriminated union
 * by verdict tag); each critic renders verdict-specific extras
 * (flagged_concerns / blocked_recommendations) without runtime
 * conditionals on optional fields.
 */

import type {
  CriticName,
  TriAgentVerdict,
  TriAgentVerdictPanel,
} from "../../shared/types";

export interface TriAgentCriticPanelProps {
  readonly panel: TriAgentVerdictPanel;
}

const CRITIC_LABELS: Record<CriticName, string> = {
  physics: "Physics-Critic",
  pedagogy: "Pedagogy-Critic",
  guardian_safety: "Guardian-Safety",
};

const CRITIC_DESCRIPTIONS: Record<CriticName, string> = {
  physics:
    "Granite Instruct fine-tune; reads the projected tensor + violation log + challenges the draft report's physics claims.",
  pedagogy:
    "Granite Instruct fine-tune; reads the draft + COA structure + challenges the recommendation's coachability.",
  guardian_safety:
    "Granite Guardian 4.1 BYOC safety pass; gates the final verdict downstream.",
};

const VERDICT_LABELS: Record<TriAgentVerdict["verdict"], string> = {
  approve: "Approved",
  flag: "Flagged",
  reject: "Rejected",
};

const VERDICT_BORDER: Record<TriAgentVerdict["verdict"], string> = {
  approve: "border-racing-green",
  flag: "border-amber",
  reject: "border-accent",
};

const VERDICT_TONE: Record<TriAgentVerdict["verdict"], string> = {
  approve: "text-racing-green",
  flag: "text-amber",
  reject: "text-accent",
};

export default function TriAgentCriticPanel({ panel }: TriAgentCriticPanelProps) {
  const anyFlag = panel.some((v) => v.verdict !== "approve");
  return (
    <section
      aria-labelledby="tri-agent-title"
      className="flex flex-col gap-4 rounded-sm border border-rule bg-paper p-5"
    >
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p className="apex-eyebrow">Tri-agent Agent-as-Judge critic loop · D-018</p>
          <h3 id="tri-agent-title" className="font-display text-2xl tracking-tight text-ink">
            Three-critic verdict panel
          </h3>
        </div>
        {anyFlag ? (
          <span className="rounded-sm border border-amber bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-amber">
            Mellea IVR repair triggered
          </span>
        ) : (
          <span className="rounded-sm border border-racing-green bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-racing-green">
            All critics approve
          </span>
        )}
      </header>
      <ol className="grid gap-4 sm:grid-cols-3">
        {panel.map((verdict) => (
          <li key={verdict.critic} className="flex">
            <TriAgentCriticCard verdict={verdict} />
          </li>
        ))}
      </ol>
    </section>
  );
}

interface TriAgentCriticCardProps {
  readonly verdict: TriAgentVerdict;
}

function TriAgentCriticCard({ verdict }: TriAgentCriticCardProps) {
  return (
    <article
      aria-labelledby={`critic-${verdict.critic}-title`}
      className={`flex h-full w-full flex-col gap-3 rounded-sm border-2 ${VERDICT_BORDER[verdict.verdict]} bg-paper p-4`}
    >
      <header>
        <h4
          id={`critic-${verdict.critic}-title`}
          className="font-display text-lg text-ink"
        >
          {CRITIC_LABELS[verdict.critic]}
        </h4>
        <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted">
          {CRITIC_DESCRIPTIONS[verdict.critic]}
        </p>
      </header>
      <p className={`font-display text-xl ${VERDICT_TONE[verdict.verdict]}`}>
        {VERDICT_LABELS[verdict.verdict]}
      </p>

      {verdict.verdict === "flag" && verdict.flagged_concerns.length > 0 && (
        <ConcernList
          title="Flagged concerns"
          items={verdict.flagged_concerns}
          tone="text-amber"
        />
      )}
      {verdict.verdict === "reject" && verdict.blocked_recommendations.length > 0 && (
        <ConcernList
          title="Blocked recommendations"
          items={verdict.blocked_recommendations}
          tone="text-accent"
        />
      )}

      {verdict.reasoning_trace.length === 0 ? (
        <p role="alert" className="font-mono text-xs leading-relaxed text-accent">
          {verdict.verdict === "reject"
            ? "Critic rejected without recorded reasoning. Mellea IVR repair will fire; do not surface the blocked recommendation to the driver."
            : `Critic returned a ${verdict.verdict} verdict without recorded steps; provisional pending Mellea repair pass.`}
        </p>
      ) : (
        <details className="group" open={verdict.verdict !== "approve"}>
          <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-ink-soft hover:text-racing-green">
            Reasoning trace ({verdict.reasoning_trace.length} step
            {verdict.reasoning_trace.length === 1 ? "" : "s"})
          </summary>
          <ol className="mt-2 flex flex-col gap-2 font-mono text-xs leading-relaxed text-ink-soft">
            {verdict.reasoning_trace.map((step, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-muted">{String(idx + 1).padStart(2, "0")}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </details>
      )}
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
    <div className="flex flex-col gap-1">
      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">{title}</p>
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
