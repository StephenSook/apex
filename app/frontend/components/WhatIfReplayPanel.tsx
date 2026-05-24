"use client";

/**
 * WhatIfReplayPanel: interactive client-side wrapper around the
 * what-if-replay deterministic stub at `app/frontend/lib/what-if-
 * replay.ts`. Renders a "Flip COA overlap flag" button on
 * ConvergenceFixtureGrid tiles whose violation_class ===
 * "coa_simultaneity"; clicking runs the deterministic mutation +
 * displays the projected violation-record count + a one-line summary
 * of the mutated fixture state.
 *
 * Wave-41 cascade-#11 plan-gap-scanner BLOCKER#6 close-out. Stream G.1
 * shipped what-if-replay.ts in commit 014b459 but no callsite wired
 * the engine into the UI. This component resolves the dead-code
 * gap on the steal-list MEDIUM-value item #1 (NeuroPit whatif/
 * replay.py pattern).
 *
 * The panel stays decoupled from the broader replay drawer pattern
 * NeuroPit ships: APEX shows a single-button + single-result-panel
 * surface to demonstrate the counterfactual mechanism on /judges
 * without burying the editorial-paddock visual identity under a
 * modal overlay. Vinh's V2 cvxpylayers backend swap (per the Stream
 * M.3 spec handoff at `docs/wave-41-backend-spec-handoff.md`) keeps
 * the same UI surface; only the runWhatIfReplay() implementation
 * switches from sync stub to async fetch.
 */

import { useState } from "react";

import type { ConvergenceFixture } from "../../shared/types";
import {
  MUTATION_COA_OVERLAP_INVERT,
  runWhatIfReplay,
  type WhatIfReplayResult,
} from "../lib/what-if-replay";

export interface WhatIfReplayPanelProps {
  readonly fixture: ConvergenceFixture;
}

export default function WhatIfReplayPanel({ fixture }: WhatIfReplayPanelProps) {
  const [result, setResult] = useState<WhatIfReplayResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunReplay = () => {
    try {
      const next = runWhatIfReplay(fixture, MUTATION_COA_OVERLAP_INVERT);
      setResult(next);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setResult(null);
    }
  };

  const recordCount = result?.replayedViolationLog.records.length ?? 0;
  const mutatedCoaState =
    result !== null && result.mutatedFixture.violation_class === "coa_simultaneity"
      ? result.mutatedFixture.coa_simul_permitted
        ? "permitted"
        : "disallowed"
      : null;

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-rule pt-3">
      <button
        type="button"
        onClick={handleRunReplay}
        className="self-start rounded-sm border border-racing-green bg-paper px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-racing-green transition-colors hover:bg-racing-green hover:text-paper"
      >
        Replay: {MUTATION_COA_OVERLAP_INVERT.label}
      </button>
      {error !== null && (
        <p className="text-xs text-accent" role="alert">
          {error}
        </p>
      )}
      {result !== null && mutatedCoaState !== null && (
        <div className="flex flex-col gap-1 rounded-sm border border-amber bg-paper-warm p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
            What-if mutation result
          </p>
          <p className="text-xs leading-snug text-ink">
            COA overlap now{" "}
            <span className="font-semibold text-racing-green">{mutatedCoaState}</span>
            ; V2 projector emits{" "}
            <span className="font-semibold text-racing-green">{recordCount}</span>{" "}
            violation record{recordCount === 1 ? "" : "s"}.
          </p>
          <p className="font-mono text-[10px] leading-snug text-muted">
            {result.mutation.description}
          </p>
        </div>
      )}
    </div>
  );
}
