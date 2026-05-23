/**
 * Wave-37 cascade-#5 TRIPLE-SIGNAL closure (codex H-4 + type-design
 * M-1 + comment-analyzer M-1). Deliberate-misorder negative tsc
 * fixture verifying that the wave-35 B.1 TriAgentVerdictPanel +
 * wave-36 A2 ThreeTrackForecast.tracks positional binding invariants
 * actually fire as TS2322 errors at construction sites.
 *
 * Each `@ts-expect-error` directive asserts that the line BELOW it
 * MUST emit a TypeScript error. If TypeScript does NOT emit an error
 * on the directive's target line, tsc emits `Error: Unused
 * '@ts-expect-error' directive.` (TS2578) which fails the build.
 * This is the negative-fixture pattern from the TypeScript handbook +
 * recommended by the wave-37 codex NIT A6 cascade-#5 prediction.
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

// ---------------------------------------------------------------------------
// Wave-36 A2: ThreeTrackForecast.tracks positional binding
// ---------------------------------------------------------------------------

const ttmFixture: TtmBand = {
  track: "ttm_channel_mix",
  forecast: [40.0, 41.0],
};

const flowStateFixture: FlowStateBand = {
  track: "flowstate",
  forecast: [40.1, 41.1],
};

const chronosFixture: ChronosBand = {
  track: "chronos2",
  forecast: [40.2, 41.2],
  quantiles: [38.0, 47.0],
};

// Canonical order (TTM, FlowState, Chronos) — MUST compile clean.
const _validForecast: ThreeTrackForecast = {
  status: "converged",
  tracks: [ttmFixture, flowStateFixture, chronosFixture],
  ensemble: [40.1, 41.1],
  divergence_sigma: 0.42,
};
void _validForecast;

// Misorder #1: Chronos at position 0 instead of TTM. Position 0 expects
// TtmBand; ChronosBand carries a `quantiles` field + has track="chronos2".
// @ts-expect-error wave-37 cascade-#5: misordered tuple position 0 (chronos2 where TtmBand expected).
const _misorderedChronosAtZero: ThreeTrackForecast = {
  status: "converged",
  tracks: [chronosFixture, flowStateFixture, ttmFixture],
  ensemble: [40.1, 41.1],
  divergence_sigma: 0.42,
};
void _misorderedChronosAtZero;

// Misorder #2: FlowState at position 2 instead of Chronos. Position 2
// expects ChronosBand (with required `quantiles`); FlowStateBand omits
// `quantiles`.
// @ts-expect-error wave-37 cascade-#5: misordered tuple position 2 (flowstate where ChronosBand expected).
const _misorderedFlowStateAtTwo: ThreeTrackForecast = {
  status: "converged",
  tracks: [ttmFixture, flowStateFixture, flowStateFixture],
  ensemble: [40.1, 41.1],
  divergence_sigma: 0.42,
};
void _misorderedFlowStateAtTwo;

// Misorder #3: three identical TtmBand entries. The wave-36 A2
// positional binding catches this at the type level because positions
// 1 + 2 expect FlowStateBand + ChronosBand respectively.
// @ts-expect-error wave-37 cascade-#5: three TtmBand entries violates positional [TtmBand, FlowStateBand, ChronosBand].
const _allTtmTracks: ThreeTrackForecast = {
  status: "converged",
  tracks: [ttmFixture, ttmFixture, ttmFixture],
  ensemble: [40.1, 41.1],
  divergence_sigma: 0.42,
};
void _allTtmTracks;

// ---------------------------------------------------------------------------
// Wave-35 B.1: TriAgentVerdictPanel positional binding
// ---------------------------------------------------------------------------

const physicsVerdict: PhysicsCriticVerdict = {
  critic: "physics",
  verdict: "approve",
  reasoning_trace: ["OK"],
  critic_run_id: "test-physics-1",
};

const pedagogyVerdict: PedagogyCriticVerdict = {
  critic: "pedagogy",
  verdict: "approve",
  reasoning_trace: ["OK"],
  critic_run_id: "test-pedagogy-1",
};

const guardianSafetyVerdict: GuardianSafetyVerdict = {
  critic: "guardian_safety",
  verdict: "approve",
  reasoning_trace: ["OK"],
  critic_run_id: "test-guardian-1",
};

// Canonical order (Physics, Pedagogy, Guardian-Safety) — MUST compile clean.
const _validPanel: TriAgentVerdictPanel = [
  physicsVerdict,
  pedagogyVerdict,
  guardianSafetyVerdict,
];
void _validPanel;

// Misorder #1: Guardian-Safety at position 0 instead of Physics. Position
// 0 expects PhysicsCriticVerdict (critic: "physics"); GuardianSafety-
// Verdict has critic: "guardian_safety".
// @ts-expect-error wave-37 cascade-#5: misordered panel position 0 (guardian_safety where physics expected).
const _misorderedGuardianAtZero: TriAgentVerdictPanel = [
  guardianSafetyVerdict,
  pedagogyVerdict,
  physicsVerdict,
];
void _misorderedGuardianAtZero;

// Misorder #2: three identical PhysicsCriticVerdict entries.
// @ts-expect-error wave-37 cascade-#5: three physics verdicts violates positional [Physics, Pedagogy, Guardian-Safety].
const _allPhysicsCritics: TriAgentVerdictPanel = [
  physicsVerdict,
  physicsVerdict,
  physicsVerdict,
];
void _allPhysicsCritics;
