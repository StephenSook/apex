import type { ConvergenceFixture, ConvergenceFixtureCatalogue } from "../../shared/types";

/**
 * Convergence 14 fixture catalogue. The 14 kinematic-violation classes
 * enumerated below are the load-bearing safety contract referenced in
 * `docs/decision-log.md` D-A and `paper/apex-neurips-workshop-2026.md`
 * §3.3 + §4 Convergence-14 validation.
 *
 * Each fixture exercises one constraint family at the boundary that
 * proves the pipeline catches the violation at the right stage. The
 * grid is display-only on `/judges`; Vinh's
 * `app/backend/tests/test_serializer.py` owns the actual assertion
 * suite (PLAN row 4.2). When the test suite lands, every fixture row
 * here corresponds to one pytest case + one fixture file at
 * `app/backend/tests/fixtures/convergence-14/<id>.json`.
 *
 * The "14" is structural, not aspirational: 4 friction-ellipse +
 * forward-Euler + jerk-bound (Stage 1 convex QP catches), 4 bicycle-
 * model coupling + COA-simultaneity gate (Stage 2 feasibility filter
 * catches), 4 physical-envelope sanity (Stage 3 Guardian BYOC text
 * audit catches), 2 serializer integrity round-trips (the convergence
 * test itself). The cardinality + class-to-stage binding + COA-payload
 * binding + serializer-integrity-verdict pin all live on
 * `ConvergenceFixtureCatalogue` and the variant union in
 * `app/shared/types.ts`, so a 15th row, a mis-stage binding, a
 * mis-COA-flag, or a `serializer_integrity + flag` row is a TypeScript
 * compile error here. No runtime asserts needed.
 */
export const CONVERGENCE_FIXTURES: ConvergenceFixtureCatalogue = [
  // ---- Stage 1: convex QP catches (4) ------------------------------------
  {
    id: "C14-01",
    title: "Friction ellipse lateral",
    summary:
      "Lateral g of 1.8 with brake near zero and steering near zero exceeds the constant-mu friction ellipse on a dry-tarmac circuit.",
    violation_class: "friction_ellipse",
    detection_stage: "stage_1_qp",
    expected_verdict: "flag",
    expected_guardian_reason:
      "Stage 1 QP projected lat_g from 1.8 g to friction-ellipse boundary (1.0 g at mu_v = 1.0); residual delta exceeded the 0.1 g flag threshold.",
    coa_simul_permitted: null,
    fixture_path: "app/backend/tests/fixtures/convergence-14/C14-01_friction_ellipse_lateral.json",
    sample_violation_log_excerpt:
      'stage:1 class:friction_ellipse t:7 channel:lat_g raw:1.8 projected:1.0 mu_v:1.0 delta_g:0.8',
  },
  {
    id: "C14-02",
    title: "Friction ellipse longitudinal",
    summary:
      "Longitudinal g of negative 1.5 (braking) combined with steering of 0.3 rad exceeds the friction-ellipse envelope at the corner-entry boundary.",
    violation_class: "friction_ellipse",
    detection_stage: "stage_1_qp",
    expected_verdict: "flag",
    expected_guardian_reason:
      "Stage 1 QP projected long_g from -1.5 g to -0.95 g at the friction-ellipse boundary given lat_g = 0.30 g.",
    coa_simul_permitted: null,
    fixture_path: "app/backend/tests/fixtures/convergence-14/C14-02_friction_ellipse_longitudinal.json",
    sample_violation_log_excerpt:
      'stage:1 class:friction_ellipse t:12 channel:long_g raw:-1.5 projected:-0.95 mu_v:1.0 delta_g:0.55',
  },
  {
    id: "C14-03",
    title: "Forward-Euler monotonicity",
    summary:
      "Forecast claims speed increases from 40 m/s to 50 m/s with long_g pinned at zero across two 1-Hz mini-sectors. Forward-Euler equality fails: speed_{t+1} must equal speed_t + a_long_t * dt.",
    violation_class: "forward_euler",
    detection_stage: "stage_1_qp",
    expected_verdict: "flag",
    expected_guardian_reason:
      "Stage 1 QP recoupled speed[t+1] = speed[t] + a_long[t] * dt; projected speed_{t+1} from 50.0 to 40.0 m/s. Long_g consistency restored.",
    coa_simul_permitted: null,
    fixture_path: "app/backend/tests/fixtures/convergence-14/C14-03_forward_euler_monotonicity.json",
    sample_violation_log_excerpt:
      'stage:1 class:forward_euler t:5 channel:speed_mps raw:50.0 projected:40.0 a_long_t:0.0 dt:1.0',
  },
  {
    id: "C14-04",
    title: "Jerk bound",
    summary:
      "Long_g jumps from +0.6 g at t=8 to -0.8 g at t=9 in one 1-Hz mini-sector, exceeding the V1 jerk bound of 0.8 g/s.",
    violation_class: "jerk_bound",
    detection_stage: "stage_1_qp",
    expected_verdict: "flag",
    expected_guardian_reason:
      "Stage 1 QP jerk-bound clamp engaged; projected long_g[9] from -0.8 g to +0.2 g to respect the V1 jerk bound at 0.8 g per 1.0 s mini-sector.",
    coa_simul_permitted: null,
    fixture_path: "app/backend/tests/fixtures/convergence-14/C14-04_jerk_bound.json",
    sample_violation_log_excerpt:
      'stage:1 class:jerk_bound t:9 channel:long_g raw:-0.8 projected:+0.2 prev:+0.6 jerk_max_g_per_s:0.8',
  },

  // ---- Stage 2: feasibility filter catches (4) ---------------------------
  {
    id: "C14-05",
    title: "Bicycle: lateral g without steering",
    summary:
      "Forecast claims lat_g = 0.5 g with steering_rad = 0.0 at speed 35 m/s. Bicycle-model coupling makes lateral g impossible without nonzero steering at low slip.",
    violation_class: "bicycle_model",
    detection_stage: "stage_2_feasibility",
    expected_verdict: "reject",
    expected_guardian_reason:
      "Stage 2 feasibility filter rejected forecast: bicycle-model coupling requires steering_rad > 0.03 rad for lat_g > 0.1 g at speed 35 m/s with wheelbase 2.7 m.",
    coa_simul_permitted: null,
    fixture_path: "app/backend/tests/fixtures/convergence-14/C14-05_bicycle_no_steering.json",
    sample_violation_log_excerpt:
      'stage:2 class:bicycle_model t:14 lat_g_raw:0.5 steering_rad:0.0 speed_mps:35 expected_steering_rad:0.11',
  },
  {
    id: "C14-06",
    title: "Bicycle: magnitude mismatch",
    summary:
      "Steering of 0.05 rad at speed 30 m/s would yield lat_g of about 0.17 g under low-slip kinematic approximation, but the forecast asserts lat_g = 0.8 g. Magnitude mismatch flags the bicycle-coupling audit.",
    violation_class: "bicycle_model",
    detection_stage: "stage_2_feasibility",
    expected_verdict: "reject",
    expected_guardian_reason:
      "Stage 2 feasibility filter rejected forecast: bicycle-model predicted lat_g approx 0.17 g for steering 0.05 rad at 30 m/s; observed 0.8 g exceeds slip-tolerant bound of 0.03 rad.",
    coa_simul_permitted: null,
    fixture_path: "app/backend/tests/fixtures/convergence-14/C14-06_bicycle_magnitude.json",
    sample_violation_log_excerpt:
      'stage:2 class:bicycle_model t:18 lat_g_raw:0.8 lat_g_predicted:0.17 steering_rad:0.05 speed_mps:30 slip_tol_rad:0.03',
  },
  {
    id: "C14-07",
    title: "COA gate: simultaneity forbidden",
    summary:
      "Telemetry row shows throttle = 0.4 and brake = 2.4 MPa simultaneously, but the driver's COA Section 3(c) flag is set to 0 (simultaneity not permitted). Stage 2 complementarity check fires reject.",
    violation_class: "coa_simultaneity",
    detection_stage: "stage_2_feasibility",
    expected_verdict: "reject",
    expected_guardian_reason:
      "Stage 2 feasibility filter rejected telemetry: brake-throttle simultaneity observed (throttle 0.4 + brake 2.4 MPa) but COA flag = 0 (simultaneity not permitted by adaptation domain). Refer to FIA Appendix L Article 18.3.",
    coa_simul_permitted: false,
    fixture_path: "app/backend/tests/fixtures/convergence-14/C14-07_coa_simul_forbidden.json",
    sample_violation_log_excerpt:
      'stage:2 class:coa_simultaneity t:11 throttle:0.4 brake_pa:2.4e6 coa_simul_permitted:0 fia_article:"18.3" coa_section:"3(c)"',
  },
  {
    id: "C14-08",
    title: "COA gate: simultaneity permitted (positive)",
    summary:
      "Same telemetry as C14-07 (throttle = 0.4 with brake = 2.4 MPa) but COA flag = 1 (Section 3(c) permits brake-throttle simultaneity through corner entry). Stage 2 approves; report renders the tuning recommendation.",
    violation_class: "coa_simultaneity",
    detection_stage: "stage_2_feasibility",
    expected_verdict: "approve",
    expected_guardian_reason:
      "Stage 2 feasibility filter approved telemetry: brake-throttle simultaneity observed (throttle 0.4 + brake 2.4 MPa) within COA Section 3(c) permit window; combined force within friction envelope (lat_g 0.81 + long_g -0.22).",
    coa_simul_permitted: true,
    fixture_path: "app/backend/tests/fixtures/convergence-14/C14-08_coa_simul_permitted.json",
    sample_violation_log_excerpt:
      'stage:2 class:coa_simultaneity t:11 throttle:0.4 brake_pa:2.4e6 coa_simul_permitted:1 verdict:approve combined_g:0.84',
  },

  // ---- Stage 3: Guardian BYOC text audit catches (4) ---------------------
  {
    id: "C14-09",
    title: "Physical envelope: negative speed",
    summary:
      "Forecast tensor channel speed_mps contains a value of -3.0 at t=22. Granite Guardian's physical-envelope BYOC rule fires reject on any speed < 0.",
    violation_class: "physical_envelope",
    detection_stage: "stage_3_guardian",
    expected_verdict: "reject",
    expected_guardian_reason:
      "Granite Guardian rejected forecast: speed_mps = -3.0 at t=22 violates physical-envelope rule (speed_mps >= 0). BYOC rule physical_envelope_speed_nonnegative.",
    coa_simul_permitted: null,
    fixture_path: "app/backend/tests/fixtures/convergence-14/C14-09_negative_speed.json",
    sample_violation_log_excerpt:
      'stage:3 class:physical_envelope t:22 channel:speed_mps raw:-3.0 byoc_rule:"physical_envelope_speed_nonnegative"',
  },
  {
    id: "C14-10",
    title: "Physical envelope: circuit max speed",
    summary:
      "Forecast tensor channel speed_mps contains a value of 110 m/s (about 396 km/h) on a circuit whose homologated maximum is 95 m/s. Guardian fires flag.",
    violation_class: "physical_envelope",
    detection_stage: "stage_3_guardian",
    expected_verdict: "flag",
    expected_guardian_reason:
      "Granite Guardian flagged forecast: speed_mps = 110 at t=17 exceeds circuit-homologated maximum 95 m/s. BYOC rule physical_envelope_speed_circuit_max.",
    coa_simul_permitted: null,
    fixture_path: "app/backend/tests/fixtures/convergence-14/C14-10_speed_exceeds_circuit_max.json",
    sample_violation_log_excerpt:
      'stage:3 class:physical_envelope t:17 channel:speed_mps raw:110.0 circuit_max_mps:95.0 byoc_rule:"physical_envelope_speed_circuit_max"',
  },
  {
    id: "C14-11",
    title: "Physical envelope: gear vs engine state",
    summary:
      "Telemetry row has rpm = 0 with speed = 38 m/s in gear 4. Drivetrain decoupled while in gear violates the engine-state envelope. Guardian flags.",
    violation_class: "physical_envelope",
    detection_stage: "stage_3_guardian",
    expected_verdict: "flag",
    expected_guardian_reason:
      "Granite Guardian flagged telemetry: rpm = 0 at t=9 while speed_mps = 38 and gear = 4 violates the engine-state envelope (rpm > 800 when gear > 0 and speed_mps > 5). BYOC rule physical_envelope_engine_engaged.",
    coa_simul_permitted: null,
    fixture_path: "app/backend/tests/fixtures/convergence-14/C14-11_drivetrain_decoupled.json",
    sample_violation_log_excerpt:
      'stage:3 class:physical_envelope t:9 rpm:0 speed_mps:38 gear:4 byoc_rule:"physical_envelope_engine_engaged"',
  },
  {
    id: "C14-12",
    title: "Physical envelope: throttle saturation",
    summary:
      "Forecast tensor reports throttle_pct = 1.07 at t=14 (above the 0.0..1.0 unit-normalized envelope). Guardian flags as a clamp candidate.",
    violation_class: "physical_envelope",
    detection_stage: "stage_3_guardian",
    expected_verdict: "flag",
    expected_guardian_reason:
      "Granite Guardian flagged forecast: throttle_pct = 1.07 at t=14 outside unit envelope [0.0, 1.0]. BYOC rule physical_envelope_throttle_unit_bound.",
    coa_simul_permitted: null,
    fixture_path: "app/backend/tests/fixtures/convergence-14/C14-12_throttle_saturation.json",
    sample_violation_log_excerpt:
      'stage:3 class:physical_envelope t:14 channel:throttle_pct raw:1.07 byoc_rule:"physical_envelope_throttle_unit_bound"',
  },

  // ---- Convergence (round-trip integrity) (2) ----------------------------
  {
    id: "C14-13",
    title: "Serializer round-trip integrity",
    summary:
      "Synthetic violation tensor written to text log, parsed back to tensor, re-serialized; the parsed-then-re-serialized log is byte-identical to the original. Guardian's verdict on both forms is identical.",
    violation_class: "serializer_integrity",
    detection_stage: "stage_3_guardian",
    expected_verdict: "approve",
    expected_guardian_reason:
      "Granite Guardian verdict is verdict-stable across the serialize-deserialize-reserialize round trip. Convergence-14 byte-equality assertion passes.",
    coa_simul_permitted: null,
    fixture_path: "app/backend/tests/fixtures/convergence-14/C14-13_serializer_roundtrip.json",
    sample_violation_log_excerpt:
      'stage:3 class:serializer_integrity round_trip:byte_equal_passes guardian_verdict_round_trip:approve',
  },
  {
    id: "C14-14",
    title: "Convergence: COA + physics + Guardian closure",
    summary:
      "End-to-end Sarah Reynolds fixture: COA-permitted simultaneity row (C14-08) passes Stage 2 + reaches Stage 3 + receives Guardian approve verdict + tuning recommendation rendered with COA citation. Closes the full safety-contract loop.",
    violation_class: "serializer_integrity",
    detection_stage: "stage_3_guardian",
    expected_verdict: "approve",
    expected_guardian_reason:
      "Granite Guardian approved end-to-end fixture: Stage 2 COA-simul-permitted accept + Stage 3 BYOC audit approve + tuning recommendation rendered with FIA Appendix L Article 18.3 + COA Section 3(c) citation.",
    coa_simul_permitted: true,
    fixture_path: "app/backend/tests/fixtures/convergence-14/C14-14_full_loop_sarah.json",
    sample_violation_log_excerpt:
      'stage:3 class:serializer_integrity convergence_14:closed sarah_fixture:approved fia:"18.3" coa:"3(c)"',
  },
];

/**
 * The "14" invariant is enforced at the type level via
 * `ConvergenceFixtureCatalogue` (14-arity tuple) in `app/shared/types.ts`.
 * Adding or removing a fixture above is a TypeScript compile error at
 * the catalogue site. No runtime throw needed.
 */
