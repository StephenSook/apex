import type { ExtendedPhysicsFixture, ExtendedPhysicsFixtureCatalogue } from "../../shared/types";

/**
 * EXTENDED_PHYSICS_FIXTURES catalogue. The 8 physics tiers enumerated below
 * are the load-bearing wave-30 D-015 lock + architecture-spec Appendix W30
 * Layer 4 expansion. Each fixture exercises one tier of the 8-tier physics
 * stack and ships as one tile on the /judges 8-tier physics implementation
 * grid (galaxy-tier visualization per pre-mortem row 50 lesson + Convergence-
 * 14 grid pattern from wave-26).
 *
 * The "8" is structural per D-015: 3D track geometry + aerodynamics +
 * adaptive hand-controls + double-track load transfer + tire thermal +
 * transient tire dynamics + full Pacejka combined-slip + kinematic
 * integration. The class-to-handler binding pins (Pacejka must use
 * scp_outer_linearisation; kinematic integration is the convex inner
 * iterate) live on the `ExtendedPhysicsFixture` discriminated union in
 * `app/shared/types.ts`, so a 9th tier, a mis-handler binding, or a
 * tier-to-handler mismatch (e.g. Pacejka + scp_inner_iterate) is a
 * TypeScript compile error here. No runtime asserts needed.
 *
 * Each fixture's `formula` is plain-text (not LaTeX) so the grid tile
 * renderer can display it without a math renderer. Each fixture's
 * `arch_spec_ref` cross-references the corresponding line range in
 * `docs/architecture-spec.md` Appendix W30 so a reader of /judges can
 * trace any tier back to the engineering source.
 */
export const EXTENDED_PHYSICS_FIXTURES: ExtendedPhysicsFixtureCatalogue = [
  {
    id: "EP-01",
    tier: "3d_track_geometry",
    handled_in: "scp_outer_linearisation",
    tier_name: "3D track geometry",
    summary:
      "Track elevation + bank + pitch project the gravity vector onto the vehicle frame so the effective vertical load varies corner-by-corner instead of being a flat 9.81 m/s^2.",
    formula:
      "g_eff = R(pitch, bank) * [0, 0, -g]; the per-step rotation matrix from the track-frame pitch + bank pulls the gravity vector into the vehicle frame so downstream Tier 4 + Tier 7 use the correct vertical-load component.",
    canonical_inputs: ["pitch_rad", "bank_rad", "speed_mps"],
    expected_outputs: ["g_eff (3-vector per step)", "per-step rotation matrix R", "vertical-load adjustment for Tier 4"],
    arch_spec_ref: "Appendix W30 Layer 4 Tier 1 (pitch + bank channels added wave-30 D-016 channel expansion)",
    decision_log_ref: "D-015",
  },
  {
    id: "EP-02",
    tier: "aerodynamics",
    handled_in: "scp_outer_linearisation",
    tier_name: "Aerodynamics",
    summary:
      "Aero downforce + drag scale with v^2; downforce adds to vertical load (Tier 4), drag opposes forward acceleration (Tier 8).",
    formula:
      "F_z_aero = 0.5 * rho * Cl * A * v^2; F_drag = 0.5 * rho * Cd * A * v^2. Linearised around the previous SCP outer-iterate to feed back into the inner cvxpylayers convex QP.",
    canonical_inputs: ["speed_mps"],
    expected_outputs: ["F_z_aero (downforce contribution to Tier 4)", "F_drag (deceleration contribution to Tier 8)"],
    arch_spec_ref: "Appendix W30 Layer 4 Tier 2",
    decision_log_ref: "D-015",
  },
  {
    id: "EP-03",
    tier: "adaptive_hand_controls",
    handled_in: "coa_constraint_layer",
    tier_name: "Adaptive hand-controls",
    summary:
      "FIA Certificate of Adaptations parsed at onboarding derives the brake-throttle simultaneity flag + steering-lock limits + clutch-lever travel range; these feed the lexicographic Tier-2 + Tier-3 COA constraints per D-022 elastic-slack hierarchy.",
    formula:
      "If coa_simul_permitted == true: throttle * brake constraint relaxed; else: throttle * brake = 0 (able-bodied assumption). Steering-lock limit |steering_rad| <= steering_lock_max derived from COA hardware spec. Slack variable activates when corner geometry forces relaxation; Guardian audit surfaces the relaxed constraint in the coaching report.",
    canonical_inputs: ["coa_simul_permitted", "throttle_pct", "brake_pa", "steering_rad"],
    expected_outputs: ["lexicographic COA constraint set (Tier 2 + Tier 3)", "per-corner slack variables", "Guardian audit annotations"],
    arch_spec_ref: "Appendix W30 Layer 4 Tier 3 + D-022 lexicographic COA hierarchy",
    decision_log_ref: "D-015",
  },
  {
    id: "EP-04",
    tier: "double_track_load_transfer",
    handled_in: "scp_outer_linearisation",
    tier_name: "Double-track load transfer",
    summary:
      "Lateral acceleration shifts vertical load between left + right tires; longitudinal acceleration shifts between front + rear axles. Each tire's vertical load updates per-step so Tier 7 Pacejka uses the correct F_z.",
    formula:
      "dFz_lat = m * a_y * h_cg / track_width; dFz_long = m * a_x * h_cg / wheelbase. Per-corner allocation respects axle-distribution + roll-stiffness split; fz_total channel (wave-30 D-016 addition) carries the result downstream.",
    canonical_inputs: ["lat_g", "long_g", "speed_mps", "fz_total (computed)"],
    expected_outputs: ["per-tire F_z (4 corners)", "fz_total adjustment for Tier 7"],
    arch_spec_ref: "Appendix W30 Layer 4 Tier 4 (fz_total channel added wave-30 D-016)",
    decision_log_ref: "D-015",
  },
  {
    id: "EP-05",
    tier: "tire_thermal_degradation",
    handled_in: "internal_state_evolution",
    tier_name: "Tire thermal + degradation",
    summary:
      "Two-mass thermal model evolves tire-core + tire-surface temperatures inside the SCP solver (NOT an input channel of the 14-channel tensor); peak friction coefficient mu_v modulates with T_surface + lap-count.",
    formula:
      "Two-mass ODE: dT_core/dt = (T_surface - T_core) / tau_core + tire-heating from slip work; dT_surface/dt = (T_ambient - T_surface) / tau_surface + (T_core - T_surface) / tau_internal. mu_v(T_surface, lap_count) modulates peak friction; T_surface is per-step internal state (initial value = ambient-plus-warmup per circuit metadata).",
    canonical_inputs: ["mu_v (consumed + updated)", "speed_mps", "lap-count metadata"],
    expected_outputs: ["evolved T_surface internal state", "per-step mu_v adjustment for Tier 7"],
    arch_spec_ref: "Appendix W30 Layer 4 Tier 5 (T_surface internal state clarification at line 391; not a 15th channel)",
    decision_log_ref: "D-015",
  },
  {
    id: "EP-06",
    tier: "transient_tire_dynamics",
    handled_in: "steady_state_algebraic_substitution",
    tier_name: "Transient tire dynamics",
    summary:
      "Stiff-ODE tire-relaxation transient (lateral slip catches up to steering input with time constant tau_y) is collapsed to steady-state algebraic per D-014 numerical-hazard resolution; full transient model reserved for offline validation only.",
    formula:
      "Original: tau_y * d(slip_y)/dt + slip_y = slip_y_steady_state. Steady-state algebraic substitution: LHS = 0 so slip_y = slip_y_steady_state. Solver runs the algebraic form inside the inner cvxpylayers convex QP iterate; stiff-ODE form skipped because cvxpylayers cannot handle stiff differential algebraic equations.",
    canonical_inputs: ["lat_g", "steering_rad", "speed_mps"],
    expected_outputs: ["algebraic slip_y consumed by Tier 7 Pacejka"],
    arch_spec_ref: "Appendix W30 Layer 4 Tier 6 + D-014 numerical hazard resolution",
    decision_log_ref: "D-015",
  },
  {
    id: "EP-07",
    tier: "pacejka_combined_slip",
    handled_in: "scp_outer_linearisation",
    tier_name: "Full Pacejka combined-slip",
    summary:
      "Pacejka Magic Formula produces tire forces F_x + F_y from longitudinal + lateral slip + vertical load + friction coefficient + tire-surface temperature; combined-slip boundary forms the heart-shape friction-ellipse generalisation in 2D.",
    formula:
      "F_x, F_y = pacejka(s_x, s_y, F_z, mu_v, T_surface) via Magic Formula. Non-convex; the SCP outer loop linearises the Pacejka boundary around the previous iterate via first-order Taylor step; cvxpylayers inner solver enforces the linearised half-spaces as convex constraints. Three iterations unrolled per D-012.",
    canonical_inputs: ["lat_g", "long_g", "fz_total", "mu_v", "speed_mps", "steering_rad", "T_surface (internal)"],
    expected_outputs: ["F_x, F_y per tire (4 corners)", "per-iterate Jacobian + residual norm for SCP convergence trace"],
    arch_spec_ref: "Appendix W30 Layer 4 Tier 7 + D-012 unrolled SCP outer loop",
    decision_log_ref: "D-015",
  },
  {
    id: "EP-08",
    tier: "kinematic_integration",
    handled_in: "scp_inner_iterate",
    tier_name: "Kinematic integration",
    summary:
      "Forward-Euler kinematic step ties acceleration to speed evolution + position-integration: speed[t+1] = speed[t] + a_long[t] * dt. Newton-compliant + lives in the convex inner iterate (the only tier that is natively convex).",
    formula:
      "speed[t+1] = speed[t] + a_long[t] * dt for all t in [0, prediction_length=30). Convex equality constraint inside the cvxpylayers QP. Jerk-bound activates at >=10 Hz per Rajamani; C14-04 demo fixture is 1 Hz simplification per arch-spec sampling-rate caveat.",
    canonical_inputs: ["long_g", "speed_mps", "yaw_rate"],
    expected_outputs: ["projected speed_mps trajectory across (B, 30) horizon", "kinematic integration residual"],
    arch_spec_ref: "Appendix W30 Layer 4 Tier 8 + 2.9a convex inner iterate row in PLAN.md",
    decision_log_ref: "D-015",
  },
];
