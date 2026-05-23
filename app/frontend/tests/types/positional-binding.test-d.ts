/**
 * Wave-37 cascade-#5 TRIPLE-SIGNAL closure (codex H-4 + type-design
 * M-1 + comment-analyzer M-1). Deliberate-misorder negative tsc
 * fixture verifying that the wave-35 B.1 TriAgentVerdictPanel +
 * wave-36 A2 ThreeTrackForecast.tracks positional binding invariants
 * actually fire as TS2322 errors at construction sites.
 *
 * Each `@ts-expect-error` directive asserts that the NEXT statement
 * MUST emit a TypeScript error. If TypeScript does NOT emit an error
 * on the next-statement line, tsc emits `TS2578 Unused
 * '@ts-expect-error' directive.` which fails the build.
 *
 * Pattern: single-line function-call assertions wrap the negative
 * fixtures so the entire type check fires on one line + the
 * `@ts-expect-error` directive immediately above suppresses cleanly.
 * Multi-line object-literal constructions attribute their TS errors
 * to inner element columns/lines that `@ts-expect-error` does not
 * suppress (cascade-#7 root cause; corrected here).
 *
 * This file is type-only (no runtime code, no test framework). It
 * runs through the standard CI tsc invocation (frontend job's
 * "TypeScript type-check" step).
 *
 * If you add a new positional-binding type in shared/types.ts, add a
 * corresponding @ts-expect-error fixture below to verify the new
 * type's construction-site enforcement.
 */

import type {
  ChronosBand,
  FlowStateBand,
  GuardianSafetyVerdict,
  PedagogyCriticVerdict,
  PhysicsCriticVerdict,
  ThreeTrackForecast,
  TriAgentVerdictPanel,
  TtmBand,
} from "../../../shared/types";

// Single-line assertion helpers. Each accepts the typed value at the
// call site so misordered tuples fire TS2322 on the ONE line of the
// call (which is what `@ts-expect-error` suppresses).
function assertForecast(_: ThreeTrackForecast): void {}
function assertPanel(_: TriAgentVerdictPanel): void {}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ttmFixture: TtmBand = { track: "ttm_channel_mix", forecast: [40.0, 41.0] };
const flowStateFixture: FlowStateBand = { track: "flowstate", forecast: [40.1, 41.1] };
const chronosFixture: ChronosBand = { track: "chronos2", forecast: [40.2, 41.2], quantiles: [38.0, 47.0] };

const physicsVerdict: PhysicsCriticVerdict = { critic: "physics", verdict: "approve", reasoning_trace: ["OK"], critic_run_id: "test-physics-1" };
const pedagogyVerdict: PedagogyCriticVerdict = { critic: "pedagogy", verdict: "approve", reasoning_trace: ["OK"], critic_run_id: "test-pedagogy-1" };
const guardianSafetyVerdict: GuardianSafetyVerdict = { critic: "guardian_safety", verdict: "approve", reasoning_trace: ["OK"], critic_run_id: "test-guardian-1" };

// ---------------------------------------------------------------------------
// Wave-36 A2: ThreeTrackForecast.tracks positional binding
// ---------------------------------------------------------------------------

// Canonical order — MUST compile clean.
assertForecast({ status: "converged", tracks: [ttmFixture, flowStateFixture, chronosFixture], ensemble: [40.1, 41.1], divergence_sigma: 0.42 });

// Misorder #1: ChronosBand at position 0 instead of TtmBand.
// @ts-expect-error wave-37 cascade-#5: misordered tuple position 0 (chronos2 where TtmBand expected).
assertForecast({ status: "converged", tracks: [chronosFixture, flowStateFixture, ttmFixture], ensemble: [40.1, 41.1], divergence_sigma: 0.42 });

// Misorder #2: FlowStateBand at position 2 instead of ChronosBand.
// @ts-expect-error wave-37 cascade-#5: misordered tuple position 2 (flowstate where ChronosBand expected).
assertForecast({ status: "converged", tracks: [ttmFixture, flowStateFixture, flowStateFixture], ensemble: [40.1, 41.1], divergence_sigma: 0.42 });

// Misorder #3: all-TTM violates positions 1 + 2.
// @ts-expect-error wave-37 cascade-#5: three TtmBand entries violates positional [TtmBand, FlowStateBand, ChronosBand].
assertForecast({ status: "converged", tracks: [ttmFixture, ttmFixture, ttmFixture], ensemble: [40.1, 41.1], divergence_sigma: 0.42 });

// ---------------------------------------------------------------------------
// Wave-35 B.1: TriAgentVerdictPanel positional binding
// ---------------------------------------------------------------------------

// Canonical order — MUST compile clean.
assertPanel([physicsVerdict, pedagogyVerdict, guardianSafetyVerdict]);

// Misorder #1: GuardianSafetyVerdict at position 0 instead of PhysicsCriticVerdict.
// @ts-expect-error wave-37 cascade-#5: misordered panel position 0 (guardian_safety where physics expected).
assertPanel([guardianSafetyVerdict, pedagogyVerdict, physicsVerdict]);

// Misorder #2: all-physics violates positions 1 + 2.
// @ts-expect-error wave-37 cascade-#5: three physics verdicts violates positional [Physics, Pedagogy, Guardian-Safety].
assertPanel([physicsVerdict, physicsVerdict, physicsVerdict]);
