// Wave-41 Lane 1 Stream B.2 + B.6: brand types + literal-range
// PhysicsTierValue + parser-function constructors all live in
// app/shared/brands.ts (kept separate to prevent types.ts bloat past
// 1256-line soft-cap). Decoder boundary (app/frontend/lib/api-decode.ts
// per wave-41 Stream A) imports parseXxx() validators from brands.ts;
// types.ts only consumes the branded types + the PhysicsTierValue
// literal-union.
import type { PhysicsTierValue } from "./brands";

/**
 * APEX shared API contracts.
 *
 * These TypeScript types are the canonical interface between the frontend
 * (Stephen lane, `app/frontend/`) and the backend (Vinh lane, `app/backend/`).
 *
 * Vinh's Pydantic schemas in `app/backend/apex/schemas.py` MUST mirror these
 * type definitions exactly. Field name + casing + nullability + array shape
 * must match. Contract drift across the boundary is the #1 cause of Day 6
 * integration bugs in the Hometown + Trace precedents.
 *
 * Single-source-of-truth: this file. If a field changes here, announce in
 * chat with the `⚠️ CONTRACT` commit-prefix per PLAN.md §Coordination
 * Protocol rule 10, then Vinh updates `apex/schemas.py` in his next commit.
 *
 * Stephen owns this file as a frontend dependency. Vinh consumes it as a
 * spec he implements against. Joint review on any breaking change.
 *
 * Last reviewed Day 1 EOD 2026-05-20 by Stephen, mirroring PLAN.md
 * §Shared Contracts table.
 */

// ---------------------------------------------------------------------------
// Sign conventions (binding across both frontend TS and backend Pydantic):
//   - steering positive = right turn
//   - lat_g positive = right
//   - long_g positive = forward acceleration
//   - all times in seconds from session start unless suffixed otherwise
//   - all G-forces in g (~9.81 m/s^2 per unit)
//   - all pressures in Pascals
// Violating these requires a `⚠️ CONTRACT` commit + both members re-sync.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Telemetry input (driver upload)
// ---------------------------------------------------------------------------

/**
 * The 8 instantaneous physical channels of a raw telemetry sample.
 * Separated from `TelemetryRow` so `MiniSectorTensor` can carry these
 * channels without inheriting `TelemetryRow.t_session_s` (which is
 * row-level time, not window-level time).
 */
export interface TelemetryChannels {
  /** Throttle position, 0 to 100 percent (NOT 0 to 1). */
  readonly throttle_pct: number;
  /** Brake pressure in Pascals. Hand-control adjusted. */
  readonly brake_pa: number;
  /** Steering angle in radians. Sign per convention above. */
  readonly steering_rad: number;
  /** Engine RPM. */
  readonly rpm: number;
  /** Lateral G force. Sign per convention above. */
  readonly lat_g: number;
  /** Longitudinal G force. Sign per convention above. */
  readonly long_g: number;
  /** Vehicle speed in meters per second. */
  readonly speed_mps: number;
  /** Engaged gear. 0 = neutral. */
  readonly gear: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

/** A single row of raw 50 Hz telemetry. */
export interface TelemetryRow extends TelemetryChannels {
  /** Seconds from session start. Monotonically increasing within a session. */
  readonly t_session_s: number;
}

/**
 * Aggregated to 1-Hz mini-sector tensor before TTM forecast.
 * Channels are window-averaged. Window edges are explicit so neither side
 * has to guess whether `t` means window-start, midpoint, or end.
 */
export interface MiniSectorTensor {
  /** Mini-sector index, 0-indexed. Typical lap has 18-24 mini-sectors. */
  readonly sector_idx: number;
  /** Window start time in seconds from session start. */
  readonly t_window_start_s: number;
  /** Window end time in seconds from session start. */
  readonly t_window_end_s: number;
  /** Window-averaged channel values. */
  readonly channels: TelemetryChannels;
  /** COA simultaneity flag for the sector. True if COA permits brake+throttle simultaneously. Mirrors `FIACoa.coa_simul_permitted`. */
  readonly coa_simul_permitted: boolean;
}

// ---------------------------------------------------------------------------
// FIA Certificate of Adaptations (parsed from PDF by Granite-Docling)
// ---------------------------------------------------------------------------

export interface FIAAdaptationDomain {
  /** Section ID inside the driver-specific COA document (e.g. "3.a", "3.c"). Anchored to FIA Appendix L as the governing regulation; the section IDs themselves are local to the parsed COA, not to FIA-internal article numbering. */
  readonly section_id: string;
  /** Human-readable summary of what is adapted. */
  readonly description: string;
  /** Constraints the adaptation imposes (free text from Granite-Docling parse). */
  readonly constraints: ReadonlyArray<string>;
}

export interface FIACoa {
  readonly driver: {
    readonly name: string;
    readonly impairment: string;
    readonly license_class: string;
  };
  readonly vehicle: {
    readonly make: string;
    readonly model: string;
    /** FIA homologation number / certificate identifier (free-form string until a stricter shape is verified). */
    readonly homologation: string;
  };
  /**
   * 9 adaptation domains, all individually optional. Runtime invariant:
   * at least ONE domain must be populated, otherwise the document is
   * incoherent (a COA exists precisely to certify adaptations). Enforced
   * at parse time on both frontend and backend, not at type level.
   */
  readonly adaptations: {
    readonly throttle?: FIAAdaptationDomain;
    readonly brake?: FIAAdaptationDomain;
    readonly clutch?: FIAAdaptationDomain;
    readonly steering?: FIAAdaptationDomain;
    readonly gearshift?: FIAAdaptationDomain;
    readonly seat?: FIAAdaptationDomain;
    readonly headrest?: FIAAdaptationDomain;
    readonly driver_equipment?: FIAAdaptationDomain;
    readonly chassis?: FIAAdaptationDomain;
  };
  /**
   * Hoisted from the previous `simultaneity_envelope` sub-object to top-level
   * because this is the LOAD-BEARING flag of the entire project. It gates the
   * physics-projection layer's COA simultaneity check.
   * True = the hand-control system permits simultaneous brake + throttle
   * inputs mid-corner. Mirrors `MiniSectorTensor.coa_simul_permitted`.
   */
  readonly coa_simul_permitted: boolean;
  /**
   * Hand-lever travel adjustable range in millimetres, as [min, max].
   * Optional because not every adaptation profile defines a range.
   */
  readonly brake_travel_adjustable_mm?: readonly [number, number];
  /** Cross-references back into Appendix L for citation provenance. */
  readonly fia_section_refs: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// Timing-sheet input (parsed from PDF by Granite Vision)
// ---------------------------------------------------------------------------

export interface TimingSheetLap {
  /** 1-indexed lap number. */
  readonly lap: number;
  /** Sector 1 time in seconds. */
  readonly sector_1_time_s: number;
  /** Sector 2 time in seconds. */
  readonly sector_2_time_s: number;
  /** Sector 3 time in seconds. */
  readonly sector_3_time_s: number;
  /** Full lap time in seconds. */
  readonly lap_time_s: number;
  /** Gap to leader in seconds (positive = behind leader). */
  readonly gap_s: number;
  /** Classification position at end of lap. */
  readonly position: number;
  /** Pirelli compound: C1-C5 dry, INTER, WET. Free-form here because non-F1 series differ; validate on backend. */
  readonly tyre: string;
  /** True if the lap included a pit stop. */
  readonly in_pit: boolean;
}

// ---------------------------------------------------------------------------
// Physics-projection layer output (between TTM and Guardian)
// ---------------------------------------------------------------------------

export interface PhysicsViolation {
  readonly step: number;
  readonly type: "friction_ellipse" | "bicycle_model" | "kinematic_step" | "jerk_bound" | "coa_simultaneity";
  readonly severity: "info" | "warning" | "rejected";
  /** Plain English description (audited by Granite Guardian downstream). */
  readonly msg: string;
}

// ---------------------------------------------------------------------------
// Granite Guardian audit output
// ---------------------------------------------------------------------------

/**
 * Discriminated union by `verdict`. Illegal states unrepresentable:
 * `blocked_recommendations` only appears on `"reject"`, `flagged_concerns`
 * only appears on `"flag"`, `"approve"` carries no list. The frontend can
 * `switch (audit.verdict)` and TypeScript will exhaust the cases.
 * Pydantic mirrors this as `Annotated[Union[ApproveAudit, FlagAudit, RejectAudit], Field(discriminator="verdict")]`.
 */
export type GuardianAudit =
  | {
      readonly verdict: "approve";
      readonly reasoning_trace: ReadonlyArray<string>;
      readonly audit_id: string;
    }
  | {
      readonly verdict: "flag";
      readonly reasoning_trace: ReadonlyArray<string>;
      readonly flagged_concerns: ReadonlyArray<string>;
      readonly audit_id: string;
    }
  | {
      readonly verdict: "reject";
      readonly reasoning_trace: ReadonlyArray<string>;
      readonly blocked_recommendations: ReadonlyArray<string>;
      readonly audit_id: string;
    };

// ---------------------------------------------------------------------------
// Coaching report (the actual API response to the driver)
// ---------------------------------------------------------------------------

export interface Citation {
  /** FIA regulatory anchor for the cited adaptation. Use the verifiable Appendix L identifier (e.g. "Appendix L"); do not invent article numbers. Public FIA sources do not expose a discrete simultaneity field; APEX derives the simultaneity flag from approved hardware specifications, never from a fabricated FIA-internal field. */
  readonly fia_article: string;
  /** Driver-specific COA section pointer (e.g. "Section 3(c) hardware spec"). Local to the parsed COA document, not to FIA-internal article numbering. */
  readonly coa_section: string;
}

export interface CornerInsight {
  readonly name: string;
  readonly sector: 1 | 2 | 3;
  /** Current delta vs reference, in seconds. Positive = slower than reference. */
  readonly current_delta_s: number;
  readonly recommendation: string;
  readonly citations: ReadonlyArray<Citation>;
}

export interface TuningDelta {
  readonly parameter: string;
  readonly current: number;
  readonly recommended: number;
  /** Unit string matched to parameter (e.g., "mm" for brake_travel, "deg" for wing_angle, "%" for brake_bias). Validated at runtime. */
  readonly unit: string;
  readonly citation: Citation;
}

/**
 * Next-session forecast envelope. Each entry is one mini-sector projection.
 * Object-array shape (vs three parallel arrays) makes length-mismatch
 * impossible by construction.
 */
export type NextSessionForecast = ReadonlyArray<{
  /** Mini-sector index this projection covers. */
  readonly sector_idx: number;
  /** Mean forecast (the TTM output after physics projection). */
  readonly mean: number;
  /** Confidence band lower edge. */
  readonly low: number;
  /** Confidence band upper edge. */
  readonly high: number;
}>;

export interface ProvenanceFooter {
  /** Granite + IBM model versions used to produce this report. Adding a 6th model = add a 6th field on both sides. */
  readonly model_versions: {
    readonly granite_docling: string;
    readonly granite_vision: string;
    readonly granite_ttm: string;
    readonly granite_instruct: string;
    readonly granite_guardian: string;
  };
  /** 40-char hex git SHA of the code that produced this report. */
  readonly commit_sha: string;
  /** ISO 8601 UTC timestamp of report generation. */
  readonly generated_at_iso: string;
}

export interface CoachingReport {
  /** Driver identifier echoed back from `AnalyzeRequestPayload.driver_id`. Lives on the report so the rendered output never drifts from the persona whose telemetry was analyzed. */
  readonly driver_id: string;
  readonly corners: ReadonlyArray<CornerInsight>;
  readonly tuning_delta: TuningDelta;
  readonly forecast: NextSessionForecast;
  readonly audit: GuardianAudit;
  readonly provenance: ProvenanceFooter;
}

// ---------------------------------------------------------------------------
// API request / response shapes
// ---------------------------------------------------------------------------

/**
 * Frontend-side staging shape for the POST /api/analyze submission.
 *
 * The wire request is `multipart/form-data`, NOT JSON. The frontend
 * serializes this shape to `FormData` before `fetch`. On the backend,
 * FastAPI receives the multipart fields as `UploadFile = File(...)` for
 * the file fields plus standard form fields for `debrief` + `driver_id`.
 *
 * If a future change ships JSON-only (e.g. base64-encoded files), promote
 * this to a literal-union with `kind: "multipart"` and `kind: "json"`
 * variants. For Day 1-12 scope, multipart is the only mode.
 */
export interface AnalyzeRequestPayload {
  /** Telemetry CSV (raw 50 Hz file upload from a `<input type="file">` picker). */
  readonly telemetry_csv: File;
  /** FIA COA PDF (one-time at onboarding; cached). */
  readonly coa_pdf: File;
  /** Driver's written debrief (max 1000 chars, enforced server-side). */
  readonly debrief: string;
  /** Driver identifier (matches a cached COA parse). */
  readonly driver_id: string;
}

/** @deprecated Use {@link AnalyzeRequestPayload} - kept for backward-search. */
export type AnalyzeRequest = AnalyzeRequestPayload;

/** POST /api/analyze response. */
export type AnalyzeResponse = CoachingReport;

// ---------------------------------------------------------------------------
// Sim-rig WebSocket frame (Stretch S1, Day 9-10)
// ---------------------------------------------------------------------------

export interface SimRigFrame {
  /** Wall-clock timestamp of the frame at the sim. */
  readonly t_sim: number;
  /** Live telemetry slice. Frontend simulator ticks at 20 Hz (TICK_INTERVAL_MS=50); backend live stream rate is owned by Vinh's `app/backend/apex/sim_bridge.py` and is targeted at 20 Hz to match the simulated mode without re-rendering downstream UI. */
  readonly channels: TelemetryRow;
}

// ---------------------------------------------------------------------------
// Health + version probes
// ---------------------------------------------------------------------------

export interface HealthResponse {
  readonly status: "ok" | "degraded" | "down";
  readonly commit_sha: string;
  readonly uptime_seconds: number;
  readonly ttm_loaded: boolean;
  readonly guardian_loaded: boolean;
}

// ---------------------------------------------------------------------------
// Convergence 14 safety-contract fixture catalogue
// ---------------------------------------------------------------------------

/**
 * Kinematic-violation class for a Convergence 14 fixture. Each class
 * binds to exactly one architecturally-correct detection stage per the
 * `ConvergenceFixture` discriminated-union variants below; the seven
 * cross-product combinations that are architecturally invalid (e.g.,
 * `bicycle_model` on Stage 1) are compile errors. Refer to
 * `docs/architecture-spec.md` Layer 4 (Stage 1 convex QP + Stage 2
 * feasibility filter) + Layer 5 (Stage 3 Granite Guardian BYOC audit).
 */
export type ConvergenceViolationClass =
  | "friction_ellipse"
  | "forward_euler"
  | "jerk_bound"
  | "bicycle_model"
  | "coa_simultaneity"
  | "physical_envelope"
  | "serializer_integrity";

/**
 * Which pipeline stage catches the violation. Stage 1 = convex QP
 * projection clamp (CvxpyLayer). Stage 2 = post-projection feasibility
 * filter audit. Stage 3 = Granite Guardian BYOC text audit on the
 * combined violation log (the load-bearing safety contract).
 */
export type ConvergenceDetectionStage = "stage_1_qp" | "stage_2_feasibility" | "stage_3_guardian";

/**
 * The Guardian verdict the fixture is asserting (the unit-test
 * assertion target). Mirrors `GuardianAudit.verdict`.
 */
export type ConvergenceExpectedVerdict = "approve" | "flag" | "reject";

/**
 * Stable identifier across the 14 fixtures. Template-literal-typed so
 * typos like "C-14-01" or "C14-1" become compile errors at the catalogue
 * site, not runtime asserts.
 */
export type ConvergenceFixtureId =
  | "C14-01"
  | "C14-02"
  | "C14-03"
  | "C14-04"
  | "C14-05"
  | "C14-06"
  | "C14-07"
  | "C14-08"
  | "C14-09"
  | "C14-10"
  | "C14-11"
  | "C14-12"
  | "C14-13"
  | "C14-14";

/**
 * Field set shared across every Convergence 14 fixture variant. The
 * class-specific fields (`violation_class`, `detection_stage`,
 * `coa_simul_permitted`, `expected_verdict`) live on the discriminated
 * union below; everything else lives here.
 */
interface ConvergenceFixtureBase {
  readonly id: ConvergenceFixtureId;
  /** Short headline for the fixture grid. */
  readonly title: string;
  /** One-sentence description of the violation scenario. */
  readonly summary: string;
  /** Plain-text reason the Guardian audit gives when firing the verdict. Mirrors `GuardianAudit.reasoning_trace` shape. */
  readonly expected_guardian_reason: string;
  /** Path to the fixture file under `app/backend/tests/fixtures/convergence-14/` (Vinh-lane; the path is the contract). Template-literal-typed so a typo in either the directory prefix or the .json extension is a compile error. */
  readonly fixture_path: `app/backend/tests/fixtures/convergence-14/${string}.json`;
  /** Excerpt of the serialized violation log the fixture asserts the serializer produces. Display-only on `/judges`. */
  readonly sample_violation_log_excerpt: string;
}

/**
 * Discriminated-union variant per violation class. Folds three
 * cross-cutting invariants into the type system:
 *
 *   1. **Class -> stage binding** (per architecture-spec Layer 4 / 5):
 *      every class binds to exactly one stage. The 14 invalid
 *      cross-products (e.g. `bicycle_model + stage_1_qp`) are compile
 *      errors.
 *   2. **Class -> COA-simul payload shape**: COA-agnostic classes pin
 *      `coa_simul_permitted: null`; COA-gating classes
 *      (`coa_simultaneity` + optional `serializer_integrity` end-to-end
 *      closure) carry a boolean. Writing `coa_simul_permitted: true` on
 *      a `friction_ellipse` fixture is a compile error.
 *   3. **`serializer_integrity` always pins `expected_verdict:
 *      "approve"`**: the round-trip-byte-equality + verdict-stability
 *      check is meaningful only when the verdict is stable. A
 *      serializer_integrity fixture asserting `flag` or `reject` is a
 *      type error.
 */
export type ConvergenceFixture = ConvergenceFixtureBase &
  (
    | {
        readonly violation_class: "friction_ellipse";
        readonly detection_stage: "stage_1_qp";
        readonly coa_simul_permitted: null;
        readonly expected_verdict: ConvergenceExpectedVerdict;
      }
    | {
        readonly violation_class: "forward_euler";
        readonly detection_stage: "stage_1_qp";
        readonly coa_simul_permitted: null;
        readonly expected_verdict: ConvergenceExpectedVerdict;
      }
    | {
        readonly violation_class: "jerk_bound";
        readonly detection_stage: "stage_1_qp";
        readonly coa_simul_permitted: null;
        readonly expected_verdict: ConvergenceExpectedVerdict;
      }
    | {
        readonly violation_class: "bicycle_model";
        readonly detection_stage: "stage_2_feasibility";
        readonly coa_simul_permitted: null;
        readonly expected_verdict: ConvergenceExpectedVerdict;
      }
    | {
        readonly violation_class: "coa_simultaneity";
        readonly detection_stage: "stage_2_feasibility";
        readonly coa_simul_permitted: boolean;
        readonly expected_verdict: ConvergenceExpectedVerdict;
      }
    | {
        readonly violation_class: "physical_envelope";
        readonly detection_stage: "stage_3_guardian";
        readonly coa_simul_permitted: null;
        readonly expected_verdict: ConvergenceExpectedVerdict;
      }
    | {
        readonly violation_class: "serializer_integrity";
        readonly closure_kind: "round_trip";
        readonly detection_stage: "stage_3_guardian";
        readonly coa_simul_permitted: null;
        readonly expected_verdict: "approve";
      }
    | {
        readonly violation_class: "serializer_integrity";
        readonly closure_kind: "end_to_end";
        readonly detection_stage: "stage_3_guardian";
        readonly coa_simul_permitted: boolean;
        readonly expected_verdict: "approve";
      }
  );

/**
 * Fixed-arity tuple typing the catalogue at compile time. Adding a 15th
 * fixture or removing one becomes a TypeScript error at the catalogue
 * site, not a runtime throw at module-import time. Drop-in for any
 * consumer that previously typed `ReadonlyArray<ConvergenceFixture>`.
 */
export type ConvergenceFixtureCatalogue = readonly [
  ConvergenceFixture,
  ConvergenceFixture,
  ConvergenceFixture,
  ConvergenceFixture,
  ConvergenceFixture,
  ConvergenceFixture,
  ConvergenceFixture,
  ConvergenceFixture,
  ConvergenceFixture,
  ConvergenceFixture,
  ConvergenceFixture,
  ConvergenceFixture,
  ConvergenceFixture,
  ConvergenceFixture,
];

// ---------------------------------------------------------------------------
// Wave-30 extended physics fixture catalogue (D-015 8-tier physics)
// ---------------------------------------------------------------------------

/**
 * 8 physics tiers locked in `docs/decision-log.md` D-015 + arch-spec
 * Appendix W30 Layer 4 expansion. Each tier becomes one fixture tile
 * on /judges 8-tier physics grid; the catalogue mirrors the
 * Convergence-14 pattern (fixed-arity tuple, template-literal IDs,
 * discriminated union folding tier-to-handler invariants into the
 * type system).
 */
export type ExtendedPhysicsTierId =
  | "EP-01"
  | "EP-02"
  | "EP-03"
  | "EP-04"
  | "EP-05"
  | "EP-06"
  | "EP-07"
  | "EP-08";

/**
 * Where in the wave-30 architecture each tier is handled. SCP outer-loop
 * linearisation (Taylor step at each outer iterate fed back into the
 * inner cvxpylayers solve), SCP inner-iterate (convex QP), COA constraint
 * layer (lexicographic Tier-0/1/2/3 per D-022), internal state evolution
 * (Tier 5 thermal model evolves T_surface inside the SCP solver per
 * arch-spec Appendix W30 L391), steady-state algebraic substitution
 * (Tier 6 transient ODE collapse per D-014).
 */
export type ExtendedPhysicsHandler =
  | "scp_outer_linearisation"
  | "scp_inner_iterate"
  | "coa_constraint_layer"
  | "internal_state_evolution"
  | "steady_state_algebraic_substitution";

interface ExtendedPhysicsFixtureBase {
  readonly id: ExtendedPhysicsTierId;
  /** Short headline for the 8-tier physics grid. */
  readonly tier_name: string;
  /** One-sentence physics summary for the tile. */
  readonly summary: string;
  /** Plain-text formula description for the hover-state. Avoid LaTeX in case the grid tile renderer does not provide a math renderer. */
  readonly formula: string;
  /** Channels from the (B, 30, 14) tensor this tier consumes (per arch-spec Appendix W30 channel enumeration). */
  readonly canonical_inputs: ReadonlyArray<string>;
  /** Expected outputs of the tier (per-iterate residual norm, jacobian shape, internal-state evolution, etc.). */
  readonly expected_outputs: ReadonlyArray<string>;
  /** Architecture-spec cross-reference (Appendix W30 line range). */
  readonly arch_spec_ref: string;
  /** decision-log entry the tier was locked in. */
  readonly decision_log_ref: "D-015";
}

/**
 * Discriminated union folding tier-to-handler invariants into the
 * type system. Writing a Pacejka combined-slip tier with
 * `handled_in: "scp_inner_iterate"` is a compile error (Pacejka is
 * non-convex and lives in the outer-loop linearisation per D-012).
 */
export type ExtendedPhysicsFixture = ExtendedPhysicsFixtureBase &
  (
    | {
        readonly id: "EP-01";
        readonly tier: "3d_track_geometry";
        readonly handled_in: "scp_outer_linearisation";
      }
    | {
        readonly id: "EP-02";
        readonly tier: "aerodynamics";
        readonly handled_in: "scp_outer_linearisation";
      }
    | {
        readonly id: "EP-03";
        readonly tier: "adaptive_hand_controls";
        readonly handled_in: "coa_constraint_layer";
      }
    | {
        readonly id: "EP-04";
        readonly tier: "double_track_load_transfer";
        readonly handled_in: "scp_outer_linearisation";
      }
    | {
        readonly id: "EP-05";
        readonly tier: "tire_thermal_degradation";
        readonly handled_in: "internal_state_evolution";
      }
    | {
        readonly id: "EP-06";
        readonly tier: "transient_tire_dynamics";
        readonly handled_in: "steady_state_algebraic_substitution";
      }
    | {
        readonly id: "EP-07";
        readonly tier: "pacejka_combined_slip";
        readonly handled_in: "scp_outer_linearisation";
      }
    | {
        readonly id: "EP-08";
        readonly tier: "kinematic_integration";
        readonly handled_in: "scp_inner_iterate";
      }
  );

/**
 * Fixed-arity tuple typing the catalogue at compile time. Adding a 9th
 * tier or removing one becomes a TypeScript error at the catalogue
 * site. Order is canonical (EP-01 through EP-08); the grid renderer
 * may sort by `tier_name` for display.
 */
export type ExtendedPhysicsFixtureCatalogue = readonly [
  ExtendedPhysicsFixture,
  ExtendedPhysicsFixture,
  ExtendedPhysicsFixture,
  ExtendedPhysicsFixture,
  ExtendedPhysicsFixture,
  ExtendedPhysicsFixture,
  ExtendedPhysicsFixture,
  ExtendedPhysicsFixture,
];

// ---------------------------------------------------------------------------
// Wave-30 SCP outer-loop iteration trace (D-012 unrolled 3-iteration SCP)
// ---------------------------------------------------------------------------

/**
 * Per-iteration state of the unrolled SCP outer loop per D-012. Three
 * iterations fixed (unrolled completely so gradients flow backward
 * through the entire trace to the TTM forecasting inputs). Each
 * iterate carries the linearisation jacobian shape, residual norm,
 * trust-region radius, and an accept/reject status from the Powell
 * ratio acceptance rule per D-027 fallback ladder spec.
 */
export type ScpIterate =
  | {
      readonly iteration_idx: 0 | 1 | 2;
      readonly status: "accepted";
      /** [n_states, n_inputs] tuple for the per-iterate jacobian shape. */
      readonly linearisation_jacobian_shape: readonly [number, number];
      readonly residual_norm: number;
      readonly trust_region_radius: number;
    }
  | {
      readonly iteration_idx: 0 | 1 | 2;
      readonly status: "rejected";
      readonly linearisation_jacobian_shape: readonly [number, number];
      readonly residual_norm: number;
      readonly trust_region_radius: number;
      readonly reject_reason: "powell_ratio_below_threshold" | "infeasible_inner_solve";
    };

/**
 * Fixed-arity 3-tuple of SCP iterates. Adding a 4th iterate or removing
 * one becomes a compile error; D-012 locks exactly 3 unrolled outer-loop
 * iterations. The display component renders this as a convergence trace.
 */
export type ScpConvergenceTrace = readonly [ScpIterate, ScpIterate, ScpIterate];

// ---------------------------------------------------------------------------
// Wave-30 tri-agent Agent-as-Judge critic loop (D-018)
// ---------------------------------------------------------------------------

/**
 * Three specialised critics from D-018 + D-019 item 5. Physics-Critic
 * reads the projected tensor + violation log + challenges physics claims.
 * Pedagogy-Critic reads the draft + COA structure + challenges
 * recommendation coachability. Guardian-Safety is a Granite Guardian 4.1
 * BYOC safety pass. If any critic flags, Mellea IVR repair fires per
 * D-018 with `loop_budget = 3` until the panel approves.
 */
export type CriticName = "physics" | "pedagogy" | "guardian_safety";

/**
 * Discriminated union by verdict tag (mirrors `GuardianAudit` pattern
 * one level up). Illegal states unrepresentable: `flagged_concerns`
 * only appears on `"flag"`, `blocked_recommendations` only appears on
 * `"reject"`, `"approve"` carries no list. Every variant carries a
 * `critic_run_id` (wave-35 B.3 addition) mirroring `GuardianAudit.audit_id`
 * pattern so Mellea IVR repair loops can dedupe per-critic outputs across
 * retries. The TriAgentCriticPanel component can `switch (verdict.verdict)`
 * and TypeScript exhausts the cases.
 */
export type TriAgentVerdict =
  | {
      readonly critic: CriticName;
      readonly verdict: "approve";
      readonly reasoning_trace: ReadonlyArray<string>;
      readonly critic_run_id: string;
    }
  | {
      readonly critic: CriticName;
      readonly verdict: "flag";
      readonly reasoning_trace: ReadonlyArray<string>;
      readonly flagged_concerns: ReadonlyArray<string>;
      readonly critic_run_id: string;
    }
  | {
      readonly critic: CriticName;
      readonly verdict: "reject";
      readonly reasoning_trace: ReadonlyArray<string>;
      readonly blocked_recommendations: ReadonlyArray<string>;
      readonly critic_run_id: string;
    };

/**
 * Per-critic variant types narrowing `TriAgentVerdict` by `critic` name
 * (wave-35 B.1 addition). Enables positional binding on
 * `TriAgentVerdictPanel` so a backend bug emitting `[physics, physics,
 * physics]` becomes a TypeScript compile error at the panel-construction
 * site instead of a runtime duplicate-critic surprise.
 */
export type PhysicsCriticVerdict = TriAgentVerdict & { readonly critic: "physics" };
export type PedagogyCriticVerdict = TriAgentVerdict & { readonly critic: "pedagogy" };
export type GuardianSafetyVerdict = TriAgentVerdict & { readonly critic: "guardian_safety" };

/**
 * Fixed-arity 3-tuple of critic verdicts with POSITIONAL binding per
 * wave-35 B.1 refactor. Position 0 MUST be the Physics-Critic verdict,
 * position 1 MUST be Pedagogy-Critic, position 2 MUST be Guardian-Safety.
 * Adding a 4th critic, removing one, or reordering positions becomes a
 * compile error AT FRONTEND CONSTRUCTION SITES (per wave-37 cascade-#5
 * codex H-4 + type-design M-1 + comment-analyzer M-1 qualification:
 * TypeScript does NOT enforce this at JSON.parse boundaries; backend
 * drift requires runtime decoder + parse-time guard). D-018 locks
 * exactly 3 critics; wave-35 locks the position-to-name mapping at the
 * type level; wave-37 lands the deliberate-misorder negative tsc
 * fixture at `app/frontend/tests/types/positional-binding.test-d.ts`
 * to verify the construction-site compile errors actually fire.
 */
export type TriAgentVerdictPanel = readonly [
  PhysicsCriticVerdict,
  PedagogyCriticVerdict,
  GuardianSafetyVerdict,
];

// ---------------------------------------------------------------------------
// Wave-30 physics-confidence detector (D-024)
// ---------------------------------------------------------------------------

/**
 * Mahalanobis-distance physics-confidence detector per D-024. Computes
 * the distance from incoming telemetry to the Pacejka tire-parameter
 * distribution used to train the SCP solver. When distance exceeds the
 * 95th-percentile threshold from the Sarah Reynolds fixture distribution,
 * the detector downgrades Guardian's verdict from approve/flag to
 * "review" so the coaching report surfaces "physics model in
 * low-confidence regime for this session; verdict downgraded to REVIEW
 * per design" per pre-mortem row 59 calibration plan.
 */
export type PhysicsConfidence =
  | {
      readonly status: "in_distribution";
      readonly mahalanobis_distance: number;
      readonly threshold_p95: number;
    }
  | {
      readonly status: "out_of_distribution";
      readonly mahalanobis_distance: number;
      readonly threshold_p95: number;
      readonly downgrade_from: "approve" | "flag";
      readonly downgrade_to: "review";
    };

// ---------------------------------------------------------------------------
// Wave-30 three-track forecasting ensemble (D-010 + D-011)
// ---------------------------------------------------------------------------

/**
 * One of three forecasting tracks per D-010 ensemble: Granite TTM r2.1
 * channel-mix decoder fine-tune (Track 1, anchor), Granite FlowState
 * (Track 2, sampling-rate-invariant SSM), Amazon Chronos-2 (Track 3,
 * 21-quantile probabilistic baseline mapping uncertainty corridor).
 * Each track outputs forecast bands over the (B, 30, 14) tensor.
 */
export type ForecastTrackName = "ttm_channel_mix" | "flowstate" | "chronos2";

/**
 * Per-track variant types per wave-36 codex HIGH A2 refactor + wave-37
 * cascade-#5 TRIPLE-SIGNAL closure (codex H-4 + type-design M-1 +
 * comment-analyzer M-1). Each variant is exported as a named alias so
 * the per-position tuple binding in `ThreeTrackForecast.tracks` is
 * enforced AT CONSTRUCTION SITES BY TYPESCRIPT: a frontend literal
 * `[chronos2Fixture, chronos2Fixture, ttmFixture]` becomes a TS2322
 * error at the construction site. Note: TypeScript does NOT enforce
 * this at JSON.parse / fetch().json() boundaries; backend response
 * drift must be caught by the runtime guard at the parse boundary
 * (see `ThreeTrackForecastChart.tsx` for the canonical guard).
 *
 * The deliberate-misorder negative tsc fixture lives at
 * `app/frontend/tests/types/positional-binding.test-d.ts` (per
 * wave-37 cascade-#5 prediction) + uses `@ts-expect-error` to verify
 * the construction-site compile errors actually fire.
 *
 * Style: `export type` + intersection-friendly object literal, matching
 * the wave-35 B.1 PhysicsCriticVerdict / PedagogyCriticVerdict /
 * GuardianSafetyVerdict pattern at types.ts:725-727 (consistent with
 * the established positional-binding convention in this file).
 */
export type TtmBand = {
  readonly track: "ttm_channel_mix";
  /** Forecast values for the 30-step horizon on the speed_mps channel
   *  (the demo-visible forecast). One value per mini-sector. */
  readonly forecast: ReadonlyArray<number>;
};

export type FlowStateBand = {
  readonly track: "flowstate";
  readonly forecast: ReadonlyArray<number>;
};

export type ChronosBand = {
  readonly track: "chronos2";
  readonly forecast: ReadonlyArray<number>;
  /** Required 21-quantile bands per D-010 Chronos-2 contract. Empty
   *  array allowed when the back-end has no quantile data yet (e.g.
   *  smoke-test fixture) but the field is not optional. */
  readonly quantiles: ReadonlyArray<number>;
};

/**
 * Discriminated union by `track` name per wave-35 B.2 refactor +
 * wave-36 A2 per-track-named-alias refactor. The chronos2 variant
 * requires `quantiles` (21 per D-010); the other two variants do not
 * carry quantiles. This makes "chronos2 without quantiles" +
 * "ttm_channel_mix with quantiles" both compile errors, lifting the
 * JSDoc-only invariant up to the type level.
 */
export type ThreeTrackBand = TtmBand | FlowStateBand | ChronosBand;

/**
 * Discriminated union by `status`. `converged` carries the ensemble
 * blend output + divergence sigma. `diverged` carries a fallback
 * strategy (TTM-only forecast OR weighted blend dropping the outlier
 * track) per pre-mortem row 57 mitigation when ensemble divergence
 * exceeds 2 sigma on Sarah Reynolds fixture.
 */
export type ThreeTrackForecast =
  | {
      readonly status: "converged";
      readonly tracks: readonly [TtmBand, FlowStateBand, ChronosBand];
      /** Ensemble fused forecast (weighted-mean blend with TTM anchor). */
      readonly ensemble: ReadonlyArray<number>;
      /** Cross-track divergence in standard-deviation units. Less than 2.0 = converged. */
      readonly divergence_sigma: number;
    }
  | {
      readonly status: "diverged";
      readonly tracks: readonly [TtmBand, FlowStateBand, ChronosBand];
      /** Cross-track divergence. Greater than or equal to 2.0 = diverged. */
      readonly divergence_sigma: number;
      readonly fallback: "ttm_only" | "weighted_blend_dropping_outlier";
    };

// ---------------------------------------------------------------------------
// Wave-40 backend canonical schemas (Phase-0 handoff; mirror Vinh's
// `app/backend/apex/shared/contracts/*` + `app/backend/apex/physics/validator.py`
// + `app/backend/apex/shared/logging.py` Python contract layer)
// ---------------------------------------------------------------------------
//
// These types mirror Vinh's Phase 0 Python contracts verbatim so the
// frontend can decode wire payloads (JSON) into the same conceptual shape
// the backend emits. The UI-facing projections above (GuardianAudit,
// PhysicsViolation, CoachingReport) remain unchanged: the frontend
// decoder in `lib/api-decode.ts` (wave-41 landing) will translate
// Backend* shapes into the UI projections at the fetch boundary.
//
// SCHEMA_VERSION + PROTOCOL_VERSION freezes bump when the canonical
// schemas change. Runtime decoder checks them on deserialization;
// version mismatch throws + the EdgeSummary error state surfaces.
//
// Wave-40 D-032 locks this layering. Vinh-canonical = backend; Stephen-
// canonical = frontend; decoder bridges them. Cross-reference:
// `app/backend/apex/shared/contracts/shapes.py` (CHANNELS + TENSOR_SHAPE),
// `app/backend/apex/shared/contracts/violations.py` (PhysicsViolationLog
// + GuardianAudit), `app/backend/apex/physics/validator.py` (ToleranceBands),
// `app/backend/apex/shared/contracts/projector.py` (DifferentiableProjector
// Protocol seam), `app/backend/apex/shared/logging.py` (audit_id JSON).
//
// ---------------------------------------------------------------------------

// ---- Wave-30 D-016 tensor-shape canonical (mirrors shapes.py) ----------

/**
 * SCHEMA_VERSION bumps when CHANNELS changes (add/remove/rename). The
 * frontend decoder MUST compare the wire payload's `schema_version`
 * field against this constant + throw if mismatched. Mirrors
 * `app/backend/apex/shared/contracts/shapes.py` SCHEMA_VERSION.
 */
export const SHAPES_SCHEMA_VERSION = "0.1.0" as const;

/**
 * Wave-30 D-016 contract: (batch, horizon=30 steps, channels=14). The
 * leading null is the dynamic batch dimension. Horizon is 30 timesteps
 * at 1 Hz aggregation (D-010 horizon expansion; was 24 pre-wave-30).
 * Channel count is 14 (D-016; was 9 pre-wave-30). Mirrors
 * `shapes.py` TENSOR_SHAPE.
 */
export const TENSOR_SHAPE = [null, 30, 14] as const;

export const HORIZON = 30 as const;
export const CHANNEL_COUNT = 14 as const;

/**
 * 14-tuple of channel names per `shapes.py` CHANNELS. Order is
 * load-bearing: the channel-axis index of each name is its position in
 * this tuple. Use `channel_index()` for rename-safe slicing.
 */
export const CHANNELS = [
  "throttle_pct",
  "brake_pa",
  "steering_rad",
  "rpm",
  "lat_g",
  "long_g",
  "speed_mps",
  "gear",
  "coa_overlap_flag",
  "tire_load_n",
  "mu_v",
  "track_pitch_rad",
  "track_bank_rad",
  "yaw_rate_rad_s",
] as const;

/**
 * Channel name string-literal union derived from the CHANNELS tuple.
 * Compile-time exhaustive: a typo at a CHANNELS index lookup is a
 * TS error.
 */
export type ChannelName = (typeof CHANNELS)[number];

/**
 * Channel-to-physics-tier binding per D-015 + `shapes.py`
 * CHANNEL_TIER_BINDING. Tier 0 = COA-derived constraint. Tiers 1-8 =
 * physics. null = driver input OR vehicle state (no tier; not subject
 * to physics-projection constraints).
 */
export const CHANNEL_TIER_BINDING: Readonly<Record<ChannelName, PhysicsTierValue | null>> = {
  throttle_pct: null,
  brake_pa: null,
  steering_rad: null,
  rpm: null,
  lat_g: 8,
  long_g: 8,
  speed_mps: 8,
  gear: null,
  coa_overlap_flag: 0,
  tire_load_n: 4,
  mu_v: 5,
  track_pitch_rad: 1,
  track_bank_rad: 1,
  yaw_rate_rad_s: 8,
};

/**
 * Return the channel-axis index for a named channel. Use this in
 * slicing rather than hard-coding integers; rename-safe. Mirrors
 * `shapes.py` channel_index().
 */
export function channel_index(name: ChannelName): number {
  return CHANNELS.indexOf(name);
}

// ---- Wave-40 backend violation taxonomy (Convergence-14) ---------------

/**
 * 14-tuple of violation type names per `violations.py` VIOLATION_TYPES.
 * Order matches the Python tuple. Reordering OR adding entries is a
 * SCHEMA_VERSION bump on `shapes.py` policy.
 */
export const BACKEND_VIOLATION_TYPES = [
  "friction_ellipse_exceeded",
  "forward_euler_inconsistent",
  "bicycle_kinematic_break",
  "coa_simultaneity_violation",
  "jerk_bound_exceeded",
  "tire_load_negative",
  "tire_thermal_diverged",
  "yaw_rate_kinematic_break",
  "speed_below_pit_minimum",
  "track_geometry_oob",
  "gear_ratio_inconsistent",
  "aerodynamic_load_inverted",
  "lateral_load_transfer_oob",
  "longitudinal_load_transfer_oob",
] as const;

export type BackendViolationType = (typeof BACKEND_VIOLATION_TYPES)[number];

/**
 * Engine identifier per `violations.py` PhysicsViolationLog.engine. V1
 * NumPy validator + V2 cvxpylayers projector + V2 SCP unrolled all emit
 * the same ViolationRecord shape; the engine field tells the consumer
 * which produced this log so byte-determinism diffs cross-engine.
 */
export type ViolationEngine = "v1_numpy" | "v2_cvxpylayers" | "v2_scp_unrolled";

/**
 * One violation at one forecast step. Mirrors `violations.py`
 * ViolationRecord frozen dataclass. Frozen at the type level via
 * `readonly` on every field; equality is structural per round-trip
 * serializer assertion (Convergence-14 floor).
 *
 * Field order is the serialization order per `violations.py`
 * to_text() canonical-form spec; the frontend decoder MUST preserve
 * declaration order when serializing back for golden-fixture tests.
 */
export interface BackendViolationRecord {
  /** Forecast horizon step index, 0..29 per HORIZON. */
  readonly step: number;
  /** One of 14 BACKEND_VIOLATION_TYPES. */
  readonly type: BackendViolationType;
  /**
   * Wave-30 D-015 physics tier the violation hit. Tier 0 = COA-derived.
   * Wave-41 B.5: field order rotated to align with `violations.py:131`
   * to_text() serializer emission order (`step type tier severity ch=`)
   * so any TS-side Object.keys()-based round-trip serializer produces
   * byte-identical output. Prior order (severity before tier) was a
   * cold-review type-design-analyzer M.6 finding.
   */
  readonly tier: number;
  /** Distance past the constraint boundary; non-negative. */
  readonly severity: number;
  /** Subset of CHANNELS at this step; keys are ChannelName instances. */
  readonly channel_values: Readonly<Partial<Record<ChannelName, number>>>;
}

/**
 * The full per-forecast violation log emitted by validator or projector.
 * Mirrors `violations.py` PhysicsViolationLog. Engine-agnostic by
 * construction: V1 NumPy + V2 cvxpylayers + V2 SCP unrolled all emit
 * this exact shape; `to_text()` produces byte-identical output for the
 * same records regardless of producer.
 *
 * Empty log => no violations => FCVR = 0 for this forecast.
 */
export interface BackendPhysicsViolationLog {
  readonly records: ReadonlyArray<BackendViolationRecord>;
  /**
   * HORIZON from shapes.py; literal-typed per wave-41 B.3 close-out
   * (type-design-analyzer H.5 from wave-40 cold review). Frozen at
   * the literal `typeof HORIZON` = 30 to catch backend regressions
   * emitting `forecast_step_count: 25` at compile time. If horizon
   * ever varies, widen this to a literal union (`30 | <new-literal>`)
   * not back to `number`.
   */
  readonly forecast_step_count: typeof HORIZON;
  readonly engine: ViolationEngine;
}

/**
 * Forecast Constraint Violation Rate: fraction of horizon steps with at
 * least one violation. Pure TypeScript port of `violations.py`
 * PhysicsViolationLog.fcvr() so the frontend can compute the FCVR
 * client-side from a decoded log (matches the metric scp_spike.py
 * computed at the friction-ellipse level for the D-027 gate).
 */
export function fcvr(log: BackendPhysicsViolationLog): number {
  // Wave-41 B.3: forecast_step_count is literal-typed `typeof HORIZON` = 30
  // so the divide-by-zero branch is unreachable by type constraint. The
  // prior `if (log.forecast_step_count === 0)` guard was dead code under
  // the literal type; removed to satisfy TS2367.
  const violatedSteps = new Set(log.records.map((r) => r.step));
  return violatedSteps.size / log.forecast_step_count;
}

/** True when the log has zero violation records. Mirrors `violations.py` is_empty(). */
export function isEmptyViolationLog(log: BackendPhysicsViolationLog): boolean {
  return log.records.length === 0;
}

// ---- Wave-40 backend GuardianAudit (mirror violations.py) --------------

/**
 * Guardian verdict literal union mirroring `violations.py`
 * GuardianVerdict. Distinct from the UI-facing
 * `GuardianAudit.verdict` (approve|flag|reject) above: the backend
 * emits SAFE|REVIEW|BLOCK at the physics-pipeline boundary; the
 * frontend decoder maps SAFE -> "approve", REVIEW -> "flag",
 * BLOCK -> "reject" at the fetch boundary.
 */
export type BackendGuardianVerdict = "SAFE" | "REVIEW" | "BLOCK";

/**
 * Granite Guardian 4.1 BYOC custom-rules audit verdict. Mirrors
 * `violations.py` GuardianAudit frozen dataclass.
 *
 * `audit_id` is the canonical uuid4().hex string set once at
 * Guardian.audit() entry; never null per council v2 Software Lead
 * fix #9. The provenance footer (Phase 3 task 3.6) asserts non-null
 * on this field; Phase 3 task 3.6b is the contract test.
 *
 * `physics_confidence` is the Mahalanobis-distance detector output
 * from D-024: low confidence -> Guardian downgrades SAFE to REVIEW
 * even if the violation log is empty.
 */
export interface BackendGuardianAudit {
  /** uuid4 hex string from Vinh's new_audit_id() helper; never empty. */
  readonly audit_id: string;
  readonly verdict: BackendGuardianVerdict;
  /** Think-mode trace for UI surface. */
  readonly reasoning: string;
  /** Subset of BYOC rule IDs that fired. */
  readonly triggered_rules: ReadonlyArray<string>;
  /** D-024 Mahalanobis detector output; null when detector skipped. */
  readonly physics_confidence: number | null;
  /** ISO 8601 UTC timestamp with seconds precision. */
  readonly audited_at_iso: string;
}

// ---- Wave-40 ToleranceBands (mirror validator.py) ----------------------

/**
 * Channel-specific tolerance bands for the forward-Euler consistency
 * check per council v2 Software Lead fix #7. Defaults below derived
 * for the 1 Hz aggregation rate (D-011 path A); the polyphase 50 Hz
 * path (D-011 path B) reduces these bounds ~50x per
 * `ToleranceBands.for_polyphase_50hz()`. Mirrors `validator.py`
 * ToleranceBands frozen dataclass.
 */
export interface ToleranceBands {
  /** 1g * 1s quantization ceiling at 1 Hz. */
  readonly delta_v_band_mps: number;
  /** 1g change per step at 1 Hz. */
  readonly delta_long_g_band: number;
  /** mu_nominal grip ceiling. */
  readonly delta_lat_g_band: number;
  /** Max steering rate at 1 Hz. */
  readonly delta_steering_rad_band: number;
  /** Max yaw-rate change at 1 Hz. */
  readonly delta_yaw_rate_rad_s_band: number;
}

/**
 * Default tolerance bands for the 1 Hz mini-sector aggregation path
 * (D-011 path A; the macroscopic backbone). Factory pure-function
 * port of `validator.py` ToleranceBands.for_1hz_aggregation().
 */
export function toleranceBandsFor1hzAggregation(): ToleranceBands {
  return {
    delta_v_band_mps: 9.8,
    delta_long_g_band: 1.0,
    delta_lat_g_band: 1.2,
    delta_steering_rad_band: 0.5,
    delta_yaw_rate_rad_s_band: 1.5,
  };
}

/**
 * Tolerance bands for the polyphase 50 Hz path (D-011 path B). At 50 Hz
 * the per-step Delta-v ceiling shrinks from 1g*1s = 9.8 m/s to
 * 1g*0.02s = 0.196 m/s. Same physics, finer time resolution. Mirrors
 * `validator.py` ToleranceBands.for_polyphase_50hz().
 */
export function toleranceBandsForPolyphase50hz(): ToleranceBands {
  return {
    delta_v_band_mps: 0.196,
    delta_long_g_band: 0.02,
    delta_lat_g_band: 0.024,
    delta_steering_rad_band: 0.01,
    delta_yaw_rate_rad_s_band: 0.03,
  };
}

// ---- Wave-40 DifferentiableProjector Protocol (mirror projector.py) ----

/**
 * PROTOCOL_VERSION bumps when the projector API surface changes
 * (method add/remove, return type shift). Distinct from
 * SHAPES_SCHEMA_VERSION which versions the tensor channel meanings.
 * Mirrors `projector.py` PROTOCOL_VERSION.
 */
export const DIFFERENTIABLE_PROJECTOR_VERSION = "0.1.0" as const;

/**
 * 3-D (batch, horizon, channels) tensor as nested arrays per
 * `shapes.py` TENSOR_SHAPE = (None, 30, 14). Outer = batch (dynamic),
 * middle = HORIZON (30 steps), inner = CHANNEL_COUNT (14 channels).
 * Length invariants are enforced by the wave-41 decoder at the wire
 * boundary, not by the type system (TS lacks dependent types for
 * nested-length checks).
 *
 * Wave-40 cold-review type-design B.2 close-out: the prior
 * `ReadonlyArray<ReadonlyArray<number>>` (2-D) silently dropped the
 * batch axis vs `projector.py:39` Protocol contract ("MUST preserve
 * the (B, 30, 14) shape end-to-end"). The 2-D form is now a separate
 * `ForecastTensor2D` alias for the V1 NumPy validator entry point
 * which explicitly operates on a single batch slice.
 */
export type ForecastTensor3D = ReadonlyArray<ReadonlyArray<ReadonlyArray<number>>>;

/**
 * 2-D (horizon, channels) tensor for the V1 NumPy validator entry
 * point per `validator.py:166-167` ("shape (horizon, channels) per
 * shapes.TENSOR_SHAPE (drop batch axis)"). Distinct from
 * `ForecastTensor3D` which is the projector-level contract.
 */
export type ForecastTensor2D = ReadonlyArray<ReadonlyArray<number>>;

/**
 * Result of a projector.project() call mirroring `projector.py`
 * ProjectionResult (defined later in shared.contracts at the
 * implementation site). The corrected forecast tensor preserves the
 * 3-D (batch, horizon, channels) shape end-to-end per the Protocol
 * contract; the violation log is the engine-agnostic per-step record.
 */
export interface ProjectionResult {
  /** Projected forecast tensor; preserves TENSOR_SHAPE (B, 30, 14). */
  readonly corrected_forecast: ForecastTensor3D;
  /** Per-step violation log. */
  readonly violation_log: BackendPhysicsViolationLog;
}

/**
 * DifferentiableProjector Protocol seam per council v2 chairman
 * synthesis: D-013 hard-locks cvxpylayers but the only fallback baked
 * into the plan was paper-survival, not code-survival. This Protocol
 * is the swap seam for V1 NumPy / V2 cvxpylayers / future qpth /
 * future theseus. Mirrors `projector.py` DifferentiableProjector
 * Protocol.
 */
export interface DifferentiableProjector {
  /** True if .backward() can flow through this projector. */
  readonly is_differentiable: boolean;
  /** Project a forecast onto the physics-feasible set (preserves (B, 30, 14) shape). */
  project(forecast: ForecastTensor3D): ProjectionResult;
}

// ---- Wave-40 StructuredLogEntry (mirror logging.py) --------------------
// Wave-41 B.1 close-out per wave-40 cold-review type-design-analyzer
// BLOCKER B.1: prior single-interface form mixed canonical declared
// fields with the `[extras: string]: unknown` index signature, which
// collapsed `keyof StructuredLogEntry` to `string` + made literal-
// narrowing on declared fields impossible. Split into a frozen
// canonical block + a typed extras bag + an intersection alias so
// the wave-41 decoder can iterate `keyof StructuredLogEntryCanonical`
// for known-field validation + collect remaining keys into a
// separately-typed extras bag.

/**
 * Frozen canonical schema for one JSON line from
 * `app/backend/apex/shared/logging.py` _AuditJSONFormatter. Decoder
 * uses `keyof StructuredLogEntryCanonical` for known-field iteration;
 * unknown keys collect into the `StructuredLogEntryExtras` bag.
 */
export interface StructuredLogEntryCanonical {
  /** ISO 8601 UTC seconds precision. */
  readonly ts: string;
  /** Python logging level. */
  readonly level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  /** Qualified Python module name (e.g. "apex.physics.scp_spike"). */
  readonly logger: string;
  /** Short snake_case event name passed as the log message. */
  readonly event: string;
  /** Audit-id correlation per council v2 SRE peer fix; "no_audit" when outside an audit_context() block. */
  readonly audit_id: string;
  /** Git rev-parse --short HEAD; "unknown" when git unavailable. */
  readonly commit_sha: string;
  /**
   * Library version snapshot (cached per process). Wave-41 B.7:
   * value type tightened from `string` to `LibraryVersion`
   * (semver OR one of three sentinel literals: "unknown" /
   * "no_version_attr" / "not_installed" per logging.py:91-98).
   * Catches sentinel typos like "not-installed" at compile time.
   */
  readonly models: Readonly<Record<string, LibraryVersion>>;
}

/**
 * Library version snapshot value type per `logging.py:91-98`
 * model_versions() output. Either a semver string OR one of three
 * Python sentinels emitted by the fallback paths (no __version__
 * attribute on the module, ImportError on the module, "unknown"
 * fallback in `commit_sha()`). Wave-41 B.7 close-out.
 */
export type LibraryVersion =
  | `${number}.${number}.${number}`
  | "unknown"
  | "no_version_attr"
  | "not_installed";

/**
 * Caller-supplied kwargs from `logger.info("event.name", k=v, k2=v2)`
 * spread as top-level JSON fields per `logging.py` _StructuredAdapter
 * lines 138-147. Decoder collects keys not in
 * `StructuredLogEntryCanonical` into this bag. Wave-41 B.1 close-out
 * separates this from the canonical schema so `keyof
 * StructuredLogEntryCanonical` retains its narrowed literal-union
 * shape.
 */
export type StructuredLogEntryExtras = Readonly<Record<string, unknown>>;

/**
 * Wire-fidelity union: canonical declared fields + extras bag. Used
 * at consumer sites that need the full payload shape. Decoders that
 * iterate known fields should narrow to
 * `StructuredLogEntryCanonical` first.
 */
export type StructuredLogEntry = StructuredLogEntryCanonical & StructuredLogEntryExtras;
