/**
 * Engine-agnostic byte-equality fixture for the wave-45 Phase 10 Block G
 * /judges demo + EngineAgnosticByteEqualityDemo component. Pair of
 * `.to_text()` outputs from the V1 NumPy + V2 cvxpylayers projectors
 * mirroring what Vinh's pytest assertion at
 * `app/backend/tests/test_physics_v2.py::test_v1_v2_to_text_byte_equal_modulo_engine_line`
 * locks at HEAD per D-050 byte-equality lock.
 *
 * The ONLY allowed difference between the two outputs is the leading
 * ENGINE header line. The Guardian BYOC audit reads identical violation
 * strings regardless of which projector engine produced them. Stage A
 * + Stage B per D-031 staged ladder do not change the violation
 * strings on the same physical event.
 */

export const V1_NUMPY_TO_TEXT = `ENGINE=numpy_v1
VIOLATION_LOG row=18 friction_ellipse exceeded mu_v=0.92 mu_v_max=0.85 brake_pressure_mpa=0.4 throttle_pct=12 coa_simul_permitted=true projected_pace_envelope_lower=-0.03 projected_pace_envelope_upper=0.02
VIOLATION_LOG row=19 friction_ellipse exceeded mu_v=0.94 mu_v_max=0.85 brake_pressure_mpa=0.38 throttle_pct=14 coa_simul_permitted=true projected_pace_envelope_lower=-0.04 projected_pace_envelope_upper=0.02
VIOLATION_LOG row=20 friction_ellipse exceeded mu_v=0.96 mu_v_max=0.85 brake_pressure_mpa=0.36 throttle_pct=16 coa_simul_permitted=true projected_pace_envelope_lower=-0.05 projected_pace_envelope_upper=0.01
SUMMARY violations=3 projected_pace_envelope_max=0.05 audit_id=apx-bd91a8c4`;

export const V2_CVXPYLAYERS_TO_TEXT = `ENGINE=cvxpylayers_v2
VIOLATION_LOG row=18 friction_ellipse exceeded mu_v=0.92 mu_v_max=0.85 brake_pressure_mpa=0.4 throttle_pct=12 coa_simul_permitted=true projected_pace_envelope_lower=-0.03 projected_pace_envelope_upper=0.02
VIOLATION_LOG row=19 friction_ellipse exceeded mu_v=0.94 mu_v_max=0.85 brake_pressure_mpa=0.38 throttle_pct=14 coa_simul_permitted=true projected_pace_envelope_lower=-0.04 projected_pace_envelope_upper=0.02
VIOLATION_LOG row=20 friction_ellipse exceeded mu_v=0.96 mu_v_max=0.85 brake_pressure_mpa=0.36 throttle_pct=16 coa_simul_permitted=true projected_pace_envelope_lower=-0.05 projected_pace_envelope_upper=0.01
SUMMARY violations=3 projected_pace_envelope_max=0.05 audit_id=apx-bd91a8c4`;

export interface ByteEqualityDiff {
  readonly status: "byte-identical" | "engine-line-diff-only" | "content-diff";
  readonly engine_line_v1: string;
  readonly engine_line_v2: string;
  readonly body_byte_count: number;
  readonly body_lines: number;
}

export function diffByteEquality(v1: string, v2: string): ByteEqualityDiff {
  if (v1.length === 0 || v2.length === 0) {
    throw new Error("byte-equality fixture given empty input");
  }
  const v1Lines = v1.split("\n");
  const v2Lines = v2.split("\n");
  const v1Engine = v1Lines[0] ?? "";
  const v2Engine = v2Lines[0] ?? "";
  const v1Body = v1Lines.slice(1).join("\n");
  const v2Body = v2Lines.slice(1).join("\n");
  if (v1 === v2) {
    return {
      status: "byte-identical",
      engine_line_v1: v1Engine,
      engine_line_v2: v2Engine,
      body_byte_count: v1Body.length,
      body_lines: v1Lines.length - 1,
    };
  }
  if (v1Body === v2Body) {
    return {
      status: "engine-line-diff-only",
      engine_line_v1: v1Engine,
      engine_line_v2: v2Engine,
      body_byte_count: v1Body.length,
      body_lines: v1Lines.length - 1,
    };
  }
  return {
    status: "content-diff",
    engine_line_v1: v1Engine,
    engine_line_v2: v2Engine,
    body_byte_count: v1Body.length,
    body_lines: v1Lines.length - 1,
  };
}
