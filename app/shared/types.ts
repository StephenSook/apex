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
