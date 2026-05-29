import type {
  ConvergenceDetectionStage,
  ConvergenceExpectedVerdict,
  ConvergenceFixture,
  ConvergenceFixtureCatalogue,
  ConvergenceViolationClass,
} from "../../shared/types";
import WhatIfReplayPanel from "./WhatIfReplayPanel";

const VIOLATION_LABELS: Record<ConvergenceViolationClass, string> = {
  friction_ellipse: "Friction ellipse",
  forward_euler: "Forward-Euler",
  jerk_bound: "Jerk bound",
  bicycle_model: "Bicycle model",
  coa_simultaneity: "COA simultaneity",
  physical_envelope: "Physical envelope",
  serializer_integrity: "Serializer integrity",
};

const STAGE_LABELS: Record<ConvergenceDetectionStage, string> = {
  stage_1_qp: "Stage 1 · convex QP",
  stage_2_feasibility: "Stage 2 · feasibility filter",
  stage_3_guardian: "Stage 3 · Granite Guardian audit",
};

const VERDICT_LABELS: Record<ConvergenceExpectedVerdict, string> = {
  approve: "approve",
  flag: "flag",
  reject: "reject",
};

function verdictChipClass(verdict: ConvergenceExpectedVerdict): string {
  if (verdict === "approve") {
    return "border-racing-green bg-paper text-racing-green";
  }
  if (verdict === "flag") {
    return "border-amber bg-paper text-amber-ink";
  }
  if (verdict === "reject") {
    return "border-accent bg-paper text-accent";
  }
  const _exhaustive: never = verdict;
  throw new Error(`unknown verdict: ${String(_exhaustive)}`);
}

function stageBarClass(stage: ConvergenceDetectionStage): string {
  if (stage === "stage_1_qp") {
    return "bg-racing-green";
  }
  if (stage === "stage_2_feasibility") {
    return "bg-amber";
  }
  if (stage === "stage_3_guardian") {
    return "bg-accent";
  }
  const _exhaustive: never = stage;
  throw new Error(`unknown detection stage: ${String(_exhaustive)}`);
}

function coaCellLabel(value: boolean | null): string {
  if (value === null) {
    return "not applicable";
  }
  if (value) {
    return "permitted";
  }
  return "forbidden";
}

interface ConvergenceFixtureGridProps {
  readonly fixtures: ConvergenceFixtureCatalogue;
}

export function ConvergenceFixtureGrid({ fixtures }: ConvergenceFixtureGridProps) {
  return (
    <ol className="mt-8 grid gap-4 sm:grid-cols-2">
      {fixtures.map((fixture) => (
        <li key={fixture.id} className="flex">
          <ConvergenceFixtureTile fixture={fixture} />
        </li>
      ))}
    </ol>
  );
}

interface ConvergenceFixtureTileProps {
  readonly fixture: ConvergenceFixture;
}

function ConvergenceFixtureTile({ fixture }: ConvergenceFixtureTileProps) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-sm border border-rule bg-paper p-5">
      <div className={`-mx-5 -mt-5 h-1 rounded-t-sm ${stageBarClass(fixture.detection_stage)}`} aria-hidden />
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg text-ink">
          <span className="font-mono text-xs text-muted">{fixture.id}</span>
          <span className="ml-2">{fixture.title}</span>
        </h3>
        <span
          className={`rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${verdictChipClass(
            fixture.expected_verdict,
          )}`}
        >
          {VERDICT_LABELS[fixture.expected_verdict]}
        </span>
      </header>
      <p className="text-sm leading-relaxed text-ink-soft">{fixture.summary}</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-xs text-muted">
        <div className="flex flex-col">
          <dt className="text-[10px] uppercase tracking-wider text-muted">Violation class</dt>
          <dd className="text-ink">{VIOLATION_LABELS[fixture.violation_class]}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-[10px] uppercase tracking-wider text-muted">Detection stage</dt>
          <dd className="text-ink">{STAGE_LABELS[fixture.detection_stage]}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-[10px] uppercase tracking-wider text-muted">COA simul</dt>
          <dd className="text-ink">{coaCellLabel(fixture.coa_simul_permitted)}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-[10px] uppercase tracking-wider text-muted">Fixture file</dt>
          <dd className="break-all text-ink">{fixture.fixture_path}</dd>
        </div>
      </dl>
      <details className="group">
        <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-racing-green group-open:text-accent">
          Guardian verdict reason
        </summary>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">{fixture.expected_guardian_reason}</p>
        <pre
          aria-label="Serialized violation log excerpt"
          className="mt-2 overflow-x-auto rounded-sm bg-ink p-3 font-mono text-[11px] leading-relaxed text-paper"
        >
          {fixture.sample_violation_log_excerpt}
        </pre>
      </details>
      {fixture.violation_class === "coa_simultaneity" && (
        <WhatIfReplayPanel fixture={fixture} />
      )}
    </article>
  );
}
