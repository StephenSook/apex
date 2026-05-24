/**
 * Frontend-side stub for the full what-if replay engine. Mocks the
 * deterministic-replay pattern NeuroPit ships at
 * `whatif/replay.py:221-266` so the /judges Convergence-14 fixture
 * grid demonstrates the counterfactual-mutation idea; the backend
 * `/api/what-if-replay` endpoint ships per the Stream M.3 spec
 * handoff at `docs/wave-41-backend-spec-handoff.md`.
 *
 * Wave-41 Stream G.1 close-out per the competitor field deep-dive
 * memory `project_apex_competitor_field_may_challenge.md` steal-list
 * MEDIUM-value item #1 (NeuroPit whatif/replay.py pattern).
 *
 * Determinism contract: every mutation applied to an input fixture
 * produces a structurally-equivalent output that the cvxpylayers
 * projector would have produced + the V1 NumPy validator would have
 * approved. The frontend stub mirrors this by re-running a pure
 * function over the mutated fixture; backend wire-up swaps to a
 * fetch to the real cvxpylayers re-projection endpoint per the
 * Stream M.3 spec.
 *
 * Sample mutation: Sarah Reynolds COA overlap flag inversion. The
 * baseline fixture has `coa_overlap_flag = 1` (her MME Motorsport
 * hand-control hardware permits simultaneous brake + throttle); the
 * what-if mutation flips it to `coa_overlap_flag = 0` (able-bodied
 * baseline) + the replay shows the recoaching report would emit a
 * coa_simultaneity_violation tier-0 entry instead of approving the
 * pattern. Demonstrates the COA-parameterized brake-throttle
 * simultaneity gate (D-022) is load-bearing for the adaptive-racer
 * pillar.
 *
 * Cross-references:
 *  - `app/backend/apex/physics/scp_spike.py` (V2 cvxpylayers projector;
 *    swap target per Stream M.3 spec handoff)
 *  - `app/backend/apex/physics/validator.py` (V1 NumPy validator;
 *    determinism reference)
 *  - `docs/decision-log.md` D-022 (COA-parameterized constraint
 *    hierarchy)
 *  - `docs/decision-log.md` D-019 item 5 (Agent-as-Judge tri-agent
 *    critic loop; replays feed the critic for what-if defensibility)
 */

"use client";

import {
  parseHorizonStep,
  parsePhysicsTier,
  parseSeverity,
} from "../../shared/brands";
import type {
  BackendPhysicsViolationLog,
  ConvergenceFixture,
} from "../../shared/types";

/**
 * One mutation applied to a Convergence-14 fixture. Each mutation
 * carries a human-readable label + a pure function that produces the
 * mutated fixture from the baseline. Mutations are deterministic:
 * the same baseline + same mutation always yields the same mutated
 * fixture.
 */
export interface WhatIfMutation {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly apply: (baseline: ConvergenceFixture) => ConvergenceFixture;
}

/**
 * Replay result. Carries the mutated fixture + the re-projected
 * violation log a real V2 cvxpylayers backend would have produced.
 * Stub emits a hand-rolled mock log; backend wire-up per Stream M.3
 * spec swaps to fetch from `/api/what-if-replay`.
 */
export interface WhatIfReplayResult {
  readonly mutation: WhatIfMutation;
  readonly mutatedFixture: ConvergenceFixture;
  readonly replayedViolationLog: BackendPhysicsViolationLog;
}

/**
 * COA overlap flag inversion mutation. Demonstrates the D-022
 * COA-parameterized brake-throttle simultaneity gate.
 */
export const MUTATION_COA_OVERLAP_INVERT: WhatIfMutation = {
  key: "coa-overlap-invert",
  label: "Flip COA overlap flag",
  description:
    "Invert the driver's COA overlap permission so the V1 NumPy validator + V2 cvxpylayers projector treat simultaneous brake-and-throttle as a tier-0 violation instead of an approved adaptive-equipment pattern.",
  apply: (baseline) => {
    if (baseline.violation_class !== "coa_simultaneity") {
      return baseline;
    }
    return {
      ...baseline,
      coa_simul_permitted: !baseline.coa_simul_permitted,
    };
  },
};

/**
 * Deterministic-replay stub. Frontend mocks the V2 cvxpylayers
 * re-projection by emitting a hand-rolled BackendPhysicsViolationLog
 * with a synthetic record. Backend wire-up per Stream M.3 spec swaps
 * this for a fetch to `/api/what-if-replay` posting the mutated
 * fixture; the frontend type contract stays identical so the swap is
 * a single-line change in consumers.
 */
export function runWhatIfReplay(
  baseline: ConvergenceFixture,
  mutation: WhatIfMutation,
): WhatIfReplayResult {
  const mutatedFixture = mutation.apply(baseline);
  // Mock V2 cvxpylayers projector output. The real backend would
  // re-run the differentiable projection over the mutated tensor +
  // emit the actual violation records. The stub emits a single
  // synthetic record matching the mutation's intended outcome so the
  // /judges grid can demonstrate the replay UI surface before the
  // backend lands.
  // Wave-41 cascade-#11 brand-propagation: step + tier + severity now
  // branded; construct via parsers so the stub mirrors the wave-boundary
  // pattern the real backend uses.
  const replayedViolationLog: BackendPhysicsViolationLog = {
    records: [
      {
        step: parseHorizonStep(3),
        type: "coa_simultaneity_violation",
        tier: parsePhysicsTier(0),
        severity: parseSeverity(0.42),
        channel_values: {
          throttle_pct: 12.0,
          brake_pa: 8200.0,
          coa_overlap_flag:
            mutatedFixture.violation_class === "coa_simultaneity" &&
            mutatedFixture.coa_simul_permitted
              ? 1
              : 0,
        },
      },
    ],
    forecast_step_count: 30,
    engine: "v2_cvxpylayers",
  };
  return {
    mutation,
    mutatedFixture,
    replayedViolationLog,
  };
}

/**
 * All available mutations. Consumers (e.g. Convergence-14 fixture
 * grid replay drawer) iterate over this list to render
 * mutation-selection buttons.
 */
export const WHAT_IF_MUTATIONS: ReadonlyArray<WhatIfMutation> = [
  MUTATION_COA_OVERLAP_INVERT,
];
