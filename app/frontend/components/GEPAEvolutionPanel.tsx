"use client";

/**
 * GEPAEvolutionPanel: /judges-facing visualization of the wave-30
 * D-019 item 3 GEPA reflective prompt optimization Layer 5 panel.
 *
 * GEPA per the 2025 DSPy GEPA reflective-prompt-evolution work:
 * offline genetic-style optimization of prompt candidates against a
 * faithfulness metric. APEX uses APEX-Bench (D-026) as the faithfulness
 * target + GEPA evolves the race-engineer narration prompt over N
 * iterations to maximize coaching-report fidelity to the underlying
 * physics + COA citations. Backend-only optimization; not invoked at
 * inference time. The /judges panel surfaces the optimization trace
 * so judges see the offline-optimized prompt is load-bearing.
 *
 * The panel renders the candidate-prompt count + the per-iteration
 * faithfulness score trajectory + a callout to the selected
 * prompt's faithfulness delta vs the Day-1 baseline. Mock data
 * via `DEMO_GEPA_OPTIMIZATION` in lib/mocks/judges-mocks.ts.
 *
 * Live data lands when Vinh wires the GEPA offline job's
 * artifact-write to `app/backend/apex/prompts/optimized/` + the
 * frontend reads the latest run's `gepa_trace.json` via a FastAPI
 * `/api/gepa/latest` endpoint.
 *
 * Editorial-paddock palette + Fraunces display + IBM Plex Mono numerics.
 */

import { DEMO_GEPA_OPTIMIZATION } from "../lib/mocks/judges-mocks";

export interface GEPAIteration {
  readonly iteration: number;
  readonly candidates_evaluated: number;
  readonly faithfulness_p95: number;
  readonly selected_prompt_id: string;
}

export interface GEPAOptimization {
  readonly run_id: string;
  readonly base_prompt_id: string;
  readonly base_faithfulness_p95: number;
  readonly iterations: ReadonlyArray<GEPAIteration>;
  readonly final_prompt_id: string;
  readonly final_faithfulness_p95: number;
}

export default function GEPAEvolutionPanel({
  optimization = DEMO_GEPA_OPTIMIZATION,
}: {
  readonly optimization?: GEPAOptimization;
}) {
  const totalCandidates = optimization.iterations.reduce(
    (acc, it) => acc + it.candidates_evaluated,
    0,
  );
  const faithfulnessDelta = optimization.final_faithfulness_p95 - optimization.base_faithfulness_p95;
  return (
    <section
      aria-labelledby="gepa-evolution-title"
      className="flex flex-col gap-3 rounded-sm border-2 border-racing-green bg-paper p-5"
    >
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p className="apex-eyebrow">GEPA reflective prompt evolution, D-019 item 3 (Layer 5)</p>
          <h3
            id="gepa-evolution-title"
            className="font-display text-2xl tracking-tight text-ink"
          >
            Offline DSPy prompt optimization
          </h3>
        </div>
        <span className="rounded-sm border border-racing-green bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-racing-green">
          {optimization.iterations.length} iterations
        </span>
      </header>

      <p className="text-sm leading-relaxed text-ink-soft">
        DSPy GEPA evolves the race-engineer narration prompt offline against the
        APEX-Bench faithfulness metric (D-026). The judges-facing pipeline uses the
        final-iteration prompt; this panel records the optimization trace as a
        provenance artifact so faithfulness lift is auditable.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="flex flex-col rounded-sm border border-rule bg-paper-warm p-3">
          <span className="text-[10px] uppercase tracking-wider text-muted">Candidates</span>
          <span className="pt-1 text-ink">{totalCandidates}</span>
        </div>
        <div className="flex flex-col rounded-sm border border-rule bg-paper-warm p-3">
          <span className="text-[10px] uppercase tracking-wider text-muted">Base p95</span>
          <span className="pt-1 text-ink">{optimization.base_faithfulness_p95.toFixed(3)}</span>
        </div>
        <div className="flex flex-col rounded-sm border border-rule bg-paper-warm p-3">
          <span className="text-[10px] uppercase tracking-wider text-muted">Final p95</span>
          <span className="pt-1 text-ink">{optimization.final_faithfulness_p95.toFixed(3)}</span>
        </div>
        <div className="flex flex-col rounded-sm border border-racing-green bg-paper-warm p-3">
          <span className="text-[10px] uppercase tracking-wider text-racing-green">Lift</span>
          <span className="pt-1 text-racing-green">+{faithfulnessDelta.toFixed(3)}</span>
        </div>
      </div>

      <ol className="flex flex-col gap-2">
        {optimization.iterations.map((it) => (
          <li
            key={it.iteration}
            className="flex items-center justify-between rounded-sm border border-rule bg-paper-warm px-3 py-2 font-mono text-xs"
          >
            <span className="text-[10px] uppercase tracking-wider text-muted">
              Iter {it.iteration}
            </span>
            <span className="text-ink-soft">
              {it.candidates_evaluated} candidates -&gt; p95 {it.faithfulness_p95.toFixed(3)}
            </span>
            <span className="text-racing-green">{it.selected_prompt_id}</span>
          </li>
        ))}
      </ol>

      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Cross-ref: <span className="text-ink-soft">D-019 item 3 + D-026 APEX-Bench + arch-spec Appendix W30 Layer 5 (orchestration plane)</span>
      </p>
    </section>
  );
}
