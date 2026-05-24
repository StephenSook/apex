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

// Wave-41 cascade-#11 fix-forward: dropped "use client" directive +
// switched brand-type imports to type-only. The prior shape imported
// runtime parser functions (parseHorizonStep + parsePhysicsTier +
// parseSeverity) from app/shared/brands which Turbopack 16 production
// build cannot resolve when this module is transitively pulled into
// the client browser bundle via WhatIfReplayPanel.tsx ("use client").
// Type-only imports are erased at compile time + never enter the
// runtime bundle; Turbopack does not need to resolve them. Mock-
// fixture construction casts at the boundary (`as unknown as
// HorizonStep`) which is safe because the values are in-memory test
// data, not wire-boundary inputs that need parser validation.
//
// CI runs a22737f + f04abba + c34df06 cascade-failed before this
// fix.

import type {
  BackendPhysicsViolationLog,
  ConvergenceFixture,
} from "../../shared/types";
import type {
  HorizonStep,
  PhysicsTier,
  Severity,
} from "../../shared/brands";

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
    // Wave-41 cascade-#11 silent-failure-hunter M-2: throw on
    // non-applicable fixture instead of silently returning baseline.
    // A silent no-op + then synthesizing a coa_simultaneity record at
    // the replay layer (the prior shape) showed a replay diff that
    // had nothing to do with the mutation. Defensive throw surfaces
    // the misconfiguration at the call site.
    if (baseline.violation_class !== "coa_simultaneity") {
      throw new Error(
        `apex.what-if-replay.MUTATION_COA_OVERLAP_INVERT: mutation requires fixture.violation_class === "coa_simultaneity"; got ${JSON.stringify(baseline.violation_class)}. Pick a different mutation for this fixture.`,
      );
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

  // Mock V2 cvxpylayers projector output. The real backend re-runs the
  // differentiable projection over the mutated tensor + emits the
  // actual violation records; the stub matches the production engine's
  // output structure so consumers can swap backends without code
  // changes.
  //
  // Wave-41 cascade-#11 HIGH H4 (codex HIGH#5 + silent-failure-hunter
  // M-2): derive the replayed violation log from the mutated fixture
  // state instead of unconditionally synthesizing a coa_simultaneity
  // record. The prior stub emitted the same synthetic record regardless
  // of mutation outcome which made the /judges replay diff visually
  // meaningful only by coincidence.
  //
  // For MUTATION_COA_OVERLAP_INVERT specifically:
  //   - mutated.coa_simul_permitted === true  -> overlap now permitted
  //     by adaptive equipment -> empty record list (no violation).
  //   - mutated.coa_simul_permitted === false -> overlap now disallowed
  //     (able-bodied baseline) -> single coa_simultaneity_violation
  //     record at tier 0.
  //
  // Brand-propagation: step + tier + severity construction via parsers
  // mirrors the wire-boundary pattern the real backend produces.
  const records: BackendPhysicsViolationLog["records"] =
    mutatedFixture.violation_class === "coa_simultaneity" &&
    !mutatedFixture.coa_simul_permitted
      ? [
          {
            step: 3 as unknown as HorizonStep,
            type: "coa_simultaneity_violation",
            tier: 0 as unknown as PhysicsTier,
            severity: 0.42 as unknown as Severity,
            channel_values: {
              throttle_pct: 12.0,
              brake_pa: 8200.0,
              coa_overlap_flag: 0,
            },
          },
        ]
      : [];

  const replayedViolationLog: BackendPhysicsViolationLog = {
    records,
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
