/**
 * Wave-40 Stream A.9 close-out. Deliberate-misshape negative tsc
 * fixture verifying the wave-40 backend canonical schema mirrors in
 * `app/shared/types.ts` actually enforce their invariants at
 * construction sites.
 *
 * Mirrors the wave-37 cascade-#5 single-line assertion-helper pattern
 * from `tests/types/positional-binding.test-d.ts` + the wave-39
 * `tests/types/webgpu-probe-result.test-d.ts` follow-on: each
 * `@ts-expect-error` directive asserts that the NEXT statement MUST
 * emit a TypeScript error. If tsc does NOT emit, the build fails on
 * TS2578 "Unused @ts-expect-error directive." Single-line assertion
 * helpers wrap the negative fixtures so the entire type check fires
 * on one line + the @ts-expect-error directive immediately above
 * suppresses cleanly (multi-line object literals attribute errors to
 * inner element columns that @ts-expect-error does not suppress per
 * the cascade-#7 root cause).
 *
 * This file is type-only (no runtime code, no test framework). It
 * runs through the standard CI tsc invocation.
 *
 * Wave-40 D-032 frontend-backend type alignment depends on the
 * canonical schemas being construction-site-enforced. If Vinh adds a
 * new ChannelName to `shapes.py` CHANNELS or a new BackendViolationType
 * to `violations.py` VIOLATION_TYPES in a future commit, the
 * TypeScript mirror compile-errors until updated.
 */

import type {
  BackendGuardianAudit,
  BackendPhysicsViolationLog,
  BackendViolationRecord,
  ChannelName,
  DifferentiableProjector,
  StructuredLogEntry,
  ToleranceBands,
} from "../../../shared/types";
import { CHANNEL_TIER_BINDING, channel_index } from "../../../shared/types";
import {
  parseAuditId,
  parseCommitSha,
  parseHorizonStep,
  parseMahalanobisConfidence,
  parsePhysicsTier,
  parseSeverity,
} from "../../../shared/brands";

function assertRecord(_: BackendViolationRecord): void {}
function assertLog(_: BackendPhysicsViolationLog): void {}
function assertAudit(_: BackendGuardianAudit): void {}
function assertBands(_: ToleranceBands): void {}
function assertProjector(_: DifferentiableProjector): void {}
function assertLogEntry(_: StructuredLogEntry): void {}

// ---------------------------------------------------------------------------
// ChannelName + CHANNEL_TIER_BINDING + channel_index
// ---------------------------------------------------------------------------

const validChannel: ChannelName = "long_g";
void validChannel;

// @ts-expect-error wave-40 type-design HIGH: "not_a_channel" is not in CHANNELS tuple.
const invalidChannel: ChannelName = "not_a_channel";
void invalidChannel;

// @ts-expect-error wave-40 type-design HIGH: channel_index requires ChannelName, not arbitrary string.
channel_index("invented_channel");

// Canonical CHANNEL_TIER_BINDING lookup compiles (canonical channel; sanity-check the canonical path).
const _tierForLongG = CHANNEL_TIER_BINDING["long_g"];
void _tierForLongG;

// ---------------------------------------------------------------------------
// BackendViolationRecord
// ---------------------------------------------------------------------------

// Wave-41 cascade-#11 brand-propagation: step + tier + severity now
// branded; construction sites parse-or-throw at the wire boundary.
assertRecord({
  step: parseHorizonStep(3),
  type: "friction_ellipse_exceeded",
  severity: parseSeverity(0.124),
  channel_values: { long_g: 1.31, lat_g: 0.42 },
  tier: parsePhysicsTier(7),
});

// @ts-expect-error wave-40 type-design HIGH: "made_up_violation" is not in BACKEND_VIOLATION_TYPES.
assertRecord({ step: 0, type: "made_up_violation", severity: 0.1, channel_values: {}, tier: 7 });

// @ts-expect-error wave-40 type-design HIGH: severity must be number, not string.
assertRecord({ step: 0, type: "jerk_bound_exceeded", severity: "0.1", channel_values: {}, tier: 8 });

// @ts-expect-error wave-40 type-design HIGH: channel_values keys must be ChannelName.
assertRecord({ step: 0, type: "jerk_bound_exceeded", severity: 0.1, channel_values: { not_a_channel: 1 }, tier: 8 });

// @ts-expect-error wave-40 type-design HIGH: tier must be number.
assertRecord({ step: 0, type: "jerk_bound_exceeded", severity: 0.1, channel_values: {}, tier: "tier_8" });

// ---------------------------------------------------------------------------
// BackendPhysicsViolationLog
// ---------------------------------------------------------------------------

assertLog({
  records: [],
  forecast_step_count: 30,
  engine: "v1_numpy",
});

// @ts-expect-error wave-40 type-design HIGH: "v3_fictional" is not a ViolationEngine literal.
assertLog({ records: [], forecast_step_count: 30, engine: "v3_fictional" });

// @ts-expect-error wave-40 type-design HIGH: forecast_step_count must be number.
assertLog({ records: [], forecast_step_count: "30", engine: "v1_numpy" });

// ---------------------------------------------------------------------------
// BackendGuardianAudit
// ---------------------------------------------------------------------------

// Wave-41 cascade-#11 brand-propagation: audit_id + physics_confidence
// now branded. Wave-42 Lane E.M.1 discriminated-union by verdict:
// SAFE -> triggered_rules MUST be empty tuple. REVIEW -> any
// ReadonlyArray. BLOCK -> non-empty tuple at the type level.
assertAudit({
  audit_id: parseAuditId("abc123def456abc123def456abc123de"),
  verdict: "SAFE",
  reasoning: "test",
  triggered_rules: [],
  physics_confidence: parseMahalanobisConfidence(0.95),
  audited_at_iso: "2026-05-23T05:00:00+00:00",
});

assertAudit({
  audit_id: parseAuditId("abc123def456abc123def456abc123de"),
  verdict: "REVIEW",
  reasoning: "test",
  triggered_rules: ["rule_one", "rule_two"],
  physics_confidence: parseMahalanobisConfidence(0.42),
  audited_at_iso: "2026-05-23T05:00:00+00:00",
});

assertAudit({
  audit_id: parseAuditId("no_audit"),
  verdict: "BLOCK",
  reasoning: "test",
  triggered_rules: ["fia_18_3_breach"],
  physics_confidence: parseMahalanobisConfidence(null),
  audited_at_iso: "2026-05-23T05:00:00+00:00",
});

// Wave-42 Lane E.M.1 close-out negative tests: discriminated-union
// per-variant invariants enforced at the type level.

// @ts-expect-error cascade-#12 M.1: SAFE verdict cannot carry triggered_rules.
assertAudit({ audit_id: parseAuditId("no_audit"), verdict: "SAFE", reasoning: "", triggered_rules: ["x"], physics_confidence: null, audited_at_iso: "" });

// @ts-expect-error cascade-#12 M.1: BLOCK verdict cannot carry empty triggered_rules.
assertAudit({ audit_id: parseAuditId("no_audit"), verdict: "BLOCK", reasoning: "", triggered_rules: [], physics_confidence: null, audited_at_iso: "" });

// @ts-expect-error wave-40 type-design HIGH: "DOWNGRADE" is not a BackendGuardianVerdict literal.
assertAudit({ audit_id: "x", verdict: "DOWNGRADE", reasoning: "", triggered_rules: [], physics_confidence: null, audited_at_iso: "" });

// @ts-expect-error wave-40 type-design HIGH: audit_id must be string, not number.
assertAudit({ audit_id: 12345, verdict: "SAFE", reasoning: "", triggered_rules: [], physics_confidence: null, audited_at_iso: "" });

// @ts-expect-error wave-40 type-design HIGH: triggered_rules must be ReadonlyArray<string>.
assertAudit({ audit_id: "x", verdict: "SAFE", reasoning: "", triggered_rules: "rule_one", physics_confidence: null, audited_at_iso: "" });

// ---------------------------------------------------------------------------
// ToleranceBands
// ---------------------------------------------------------------------------

// Wave-42 Lane E.M.2: ToleranceBands now requires path tag per the
// discriminated-union convention. Fixture covers all 3 path literals.
assertBands({
  path: "1hz_aggregation",
  delta_v_band_mps: 9.8,
  delta_long_g_band: 1.0,
  delta_lat_g_band: 1.2,
  delta_steering_rad_band: 0.5,
  delta_yaw_rate_rad_s_band: 1.5,
});

assertBands({
  path: "polyphase_50hz",
  delta_v_band_mps: 0.196,
  delta_long_g_band: 0.02,
  delta_lat_g_band: 0.024,
  delta_steering_rad_band: 0.01,
  delta_yaw_rate_rad_s_band: 0.03,
});

assertBands({
  path: "flowstate_rate_invariant",
  delta_v_band_mps: 1.96,
  delta_long_g_band: 0.2,
  delta_lat_g_band: 0.24,
  delta_steering_rad_band: 0.1,
  delta_yaw_rate_rad_s_band: 0.3,
});

// @ts-expect-error wave-40 type-design HIGH: missing delta_yaw_rate_rad_s_band.
assertBands({ path: "1hz_aggregation", delta_v_band_mps: 9.8, delta_long_g_band: 1.0, delta_lat_g_band: 1.2, delta_steering_rad_band: 0.5 });

// @ts-expect-error wave-40 type-design HIGH: all bands must be number.
assertBands({ path: "1hz_aggregation", delta_v_band_mps: "9.8", delta_long_g_band: 1.0, delta_lat_g_band: 1.2, delta_steering_rad_band: 0.5, delta_yaw_rate_rad_s_band: 1.5 });

// @ts-expect-error wave-42 Lane E.M.2: path tag is required.
assertBands({ delta_v_band_mps: 9.8, delta_long_g_band: 1.0, delta_lat_g_band: 1.2, delta_steering_rad_band: 0.5, delta_yaw_rate_rad_s_band: 1.5 });

// @ts-expect-error wave-42 Lane E.M.2: path tag must be one of the 3 valid literals.
assertBands({ path: "invented_path", delta_v_band_mps: 9.8, delta_long_g_band: 1.0, delta_lat_g_band: 1.2, delta_steering_rad_band: 0.5, delta_yaw_rate_rad_s_band: 1.5 });

// ---------------------------------------------------------------------------
// DifferentiableProjector (Protocol seam)
// ---------------------------------------------------------------------------

const validProjector: DifferentiableProjector = {
  is_differentiable: true,
  project(_forecast) {
    return {
      // Wave-40 type-design B.2 close-out: 3-D (batch, horizon, channels)
      // per ForecastTensor3D contract; the wave-40 mirror previously typed
      // this as 2-D which silently dropped the batch axis.
      corrected_forecast: [[[0.5, 0.42]]],
      violation_log: { records: [], forecast_step_count: 30, engine: "v2_cvxpylayers" },
    };
  },
};
assertProjector(validProjector);

// @ts-expect-error wave-40 type-design HIGH: missing project() method.
const incompleteProjector: DifferentiableProjector = { is_differentiable: false };
void incompleteProjector;

// @ts-expect-error wave-40 type-design B.2 close-out: 2-D forecast violates ForecastTensor3D batch-axis preservation per `app/backend/apex/shared/contracts/projector.py:39`.
assertProjector({ is_differentiable: true, project: () => ({ corrected_forecast: [[0.5, 0.42]], violation_log: { records: [], forecast_step_count: 30, engine: "v2_cvxpylayers" } }) });

// ---------------------------------------------------------------------------
// StructuredLogEntry
// ---------------------------------------------------------------------------

// Wave-41 cascade-#11 brand-propagation: audit_id + commit_sha now
// branded; parseAuditId + parseCommitSha enforce wire-boundary shape.
assertLogEntry({
  ts: "2026-05-23T05:00:00+00:00",
  level: "INFO",
  logger: "apex.physics.scp_spike",
  event: "forecast.completed",
  audit_id: parseAuditId("no_audit"),
  commit_sha: parseCommitSha("c97caaa"),
  models: { torch: "2.5.1" },
});

// @ts-expect-error wave-40 type-design HIGH: "TRACE" is not a Python logging level.
assertLogEntry({ ts: "", level: "TRACE", logger: "", event: "", audit_id: "", commit_sha: "", models: {} });

// @ts-expect-error wave-40 type-design HIGH: models must be Record<string, string>.
assertLogEntry({ ts: "", level: "INFO", logger: "", event: "", audit_id: "", commit_sha: "", models: { torch: 2.5 } });
