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
// Telemetry input (driver upload)
// ---------------------------------------------------------------------------

/** A single row of raw 50 Hz telemetry. Channels per PLAN §Shared Contracts. */
export interface TelemetryRow {
  /** Seconds from session start. Monotonically increasing. */
  readonly t: number;
  /** Throttle position, 0 to 100 percent. */
  readonly throttle_pct: number;
  /** Brake pressure in Pascals. Hand-control adjusted. */
  readonly brake_pa: number;
  /** Steering angle in radians. Positive = right turn. */
  readonly steering_rad: number;
  /** Engine RPM. */
  readonly rpm: number;
  /** Lateral G force. Positive = right. */
  readonly lat_g: number;
  /** Longitudinal G force. Positive = acceleration. */
  readonly long_g: number;
  /** Vehicle speed in meters per second. */
  readonly speed_mps: number;
  /** Engaged gear, 0 to 8. 0 = neutral. */
  readonly gear: number;
}

/** Aggregated to 1-Hz mini-sector tensor before TTM forecast. */
export interface MiniSectorTensor {
  /** Mini-sector index, 0-indexed. */
  readonly sector_idx: number;
  /** Channel values averaged over the mini-sector window. */
  readonly channels: TelemetryRow;
  /** COA simultaneity flag for the sector. true if COA permits brake+throttle simultaneously. */
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
    readonly homologation: string;
  };
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
  readonly simultaneity_envelope: {
    /** If true, hand-control system permits brake + throttle simultaneously mid-corner. */
    readonly brake_throttle_simul_permitted: boolean;
    /** Hand-lever travel adjustable range in mm. */
    readonly brake_travel_adjustable_mm?: ReadonlyArray<number>;
  };
  /** Cross-references back into Appendix L for citation provenance. */
  readonly fia_section_refs: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// Timing-sheet input (parsed from PDF by Granite Vision)
// ---------------------------------------------------------------------------

export interface TimingSheetLap {
  readonly lap: number;
  readonly sector_1_time: number;
  readonly sector_2_time: number;
  readonly sector_3_time: number;
  readonly lap_time: number;
  readonly gap: number;
  readonly position: number;
  readonly tyre: string;
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

export interface GuardianAudit {
  readonly verdict: "approve" | "flag" | "reject";
  readonly reasoning_trace: ReadonlyArray<string>;
  readonly blocked_recommendations: ReadonlyArray<string>;
  /** Audit ID for provenance footer reference. */
  readonly audit_id: string;
}

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
  readonly current_delta_s: number;
  readonly recommendation: string;
  readonly citations: ReadonlyArray<Citation>;
}

export interface TuningDelta {
  readonly parameter: string;
  readonly current: number;
  readonly recommended: number;
  readonly unit: string;
  readonly citation: Citation;
}

export interface NextSessionForecast {
  readonly next_session_envelope: ReadonlyArray<number>;
  readonly confidence_band_low: ReadonlyArray<number>;
  readonly confidence_band_high: ReadonlyArray<number>;
}

export interface ProvenanceFooter {
  readonly granite_docling_version: string;
  readonly granite_vision_version: string;
  readonly granite_ttm_version: string;
  readonly granite_instruct_version: string;
  readonly granite_guardian_version: string;
  readonly commit_sha: string;
  readonly generated_at: string;
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

export interface AnalyzeRequest {
  /** Telemetry CSV bytes (raw 50 Hz file upload). */
  readonly telemetry_csv: File | Blob;
  /** FIA COA PDF bytes (one-time at onboarding; cached). */
  readonly coa_pdf: File | Blob;
  /** Driver's written debrief (max 1000 chars). */
  readonly debrief: string;
  /** Driver identifier (matches a cached COA parse). */
  readonly driver_id: string;
}

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
