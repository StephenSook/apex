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
  /** Section ID from Appendix L Article 18.3 (e.g., "3.a", "3.c"). */
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
  /** Appendix L Article reference, e.g., "Article 18.3.2(c)". */
  readonly fia_article: string;
  /** COA section reference, e.g., "Section 3(c)". */
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
  /** Live telemetry slice at 10 Hz. */
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
