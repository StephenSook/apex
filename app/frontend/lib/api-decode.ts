/**
 * Wave-41 Stream A close-out: load-bearing wire-boundary decoder seam
 * per D-032 spec. Wraps `fetch()` JSON.parse boundary with runtime
 * validation so every Backend* schema received from Vinh's FastAPI
 * endpoints gets validated against the canonical TypeScript mirror
 * BEFORE flowing into the rest of the type system.
 *
 * Architectural rationale: TypeScript's `as` casts on
 * `await response.json()` are unsafe by design (TS cannot validate
 * runtime payload shape at compile time). Per wave-37 cascade-#5
 * codex H-4 + type-design M-1 + comment-analyzer M-1: parse-boundary
 * casts are the single highest-impact silent-failure surface in
 * the codebase. Wave-41 Stream A replaces every `as` cast at every
 * JSON.parse boundary with a `decodeXxx()` function from this module.
 *
 * Module exports:
 *
 *   - decodeTriAgentVerdictPanel(raw)     -> TriAgentVerdictPanel
 *   - decodeBackendGuardianAudit(raw)     -> BackendGuardianAudit
 *   - decodeBackendPhysicsViolationLog(raw) -> BackendPhysicsViolationLog
 *   - decodeProjectionResult(raw)         -> ProjectionResult
 *   - decodeStructuredLogEntry(raw)       -> StructuredLogEntry
 *   - translateBackendVerdictToUIVerdict(backend) -> "approve" | "flag" | "reject"
 *   - expectSchemaVersion(...) re-exported from brands.ts
 *
 * Version-parity contract per D-A frozen contract policy + D-032
 * decoder spec: decoder reads SHAPES_SCHEMA_VERSION +
 * DIFFERENTIABLE_PROJECTOR_VERSION from `app/shared/types.ts` (the
 * frontend mirror) + asserts strict equality against any wire-payload
 * `schema_version` / `protocol_version` field. Any mismatch throws +
 * the EdgeSummary error state surfaces the failure to the user.
 *
 * Cross-references:
 *  - `~/.claude/plans/all-right-i-want-rippling-moon.md` Lane 1 Stream A
 *  - `app/shared/types.ts` (Backend* schema mirror + version constants)
 *  - `app/shared/brands.ts` (parser functions for branded primitives)
 *  - `app/backend/apex/shared/contracts/shapes.py:23` SHAPES_SCHEMA_VERSION = "0.1.0"
 *  - `app/backend/apex/shared/contracts/projector.py:69` PROTOCOL_VERSION = "0.1.0"
 *  - `docs/decision-log.md` D-032 frontend-backend type alignment (wave-40)
 *  - D-035 wave-41 decoder + brand-type uplift (Stream I will land)
 */

"use client";

import {
  expectSchemaVersion as _expectSchemaVersion,
  parseAuditId,
  parseHorizonStep,
  parseMahalanobisConfidence,
  parsePhysicsTier,
  parseSeverity,
  type AuditId,
  type HorizonStep,
  type MahalanobisConfidence,
  type PhysicsTier,
  type SemVer,
  type Severity,
} from "../../shared/brands";
import {
  BACKEND_VIOLATION_TYPES,
  CHANNELS,
  DIFFERENTIABLE_PROJECTOR_VERSION,
  SHAPES_SCHEMA_VERSION,
  type BackendGuardianAudit,
  type BackendGuardianVerdict,
  type BackendPhysicsViolationLog,
  type BackendViolationRecord,
  type BackendViolationType,
  type ChannelName,
  type GuardianAudit,
  type ProjectionResult,
  type StructuredLogEntry,
  type StructuredLogEntryCanonical,
  type TriAgentVerdictPanel,
  type ViolationEngine,
} from "../../shared/types";

// Re-export the strict-equality SemVer compare so consumers can hit a
// single decoder import surface for all wire-boundary checks.
export const expectSchemaVersion = _expectSchemaVersion;

// Branded versions of audit_id are exposed via parseAuditId from brands.ts.
// Branded ProjectionResult forecast tensor stays nested ReadonlyArray<...>.

const VALID_BACKEND_VIOLATION_TYPES: ReadonlySet<string> = new Set(BACKEND_VIOLATION_TYPES);
const VALID_VIOLATION_ENGINES: ReadonlySet<ViolationEngine> = new Set<ViolationEngine>([
  "v1_numpy",
  "v2_cvxpylayers",
  "v2_scp_unrolled",
]);
const VALID_BACKEND_GUARDIAN_VERDICTS: ReadonlySet<BackendGuardianVerdict> =
  new Set<BackendGuardianVerdict>(["SAFE", "REVIEW", "BLOCK"]);
const VALID_LOG_LEVELS: ReadonlySet<StructuredLogEntryCanonical["level"]> = new Set<
  StructuredLogEntryCanonical["level"]
>(["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]);
const VALID_CHANNEL_NAMES: ReadonlySet<string> = new Set(CHANNELS);
const VALID_CRITICS: ReadonlyArray<"physics" | "pedagogy" | "guardian_safety"> = [
  "physics",
  "pedagogy",
  "guardian_safety",
];

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isRecord(raw: unknown): raw is Record<string, unknown> {
  return typeof raw === "object" && raw !== null && !Array.isArray(raw);
}

function reqString(raw: Record<string, unknown>, field: string, ctx: string): string {
  const value = raw[field];
  if (typeof value !== "string") {
    throw new Error(
      `apex.decode.${ctx}: field ${JSON.stringify(field)} must be string; got ${typeof value}.`,
    );
  }
  return value;
}

function reqNumber(raw: Record<string, unknown>, field: string, ctx: string): number {
  const value = raw[field];
  if (typeof value !== "number") {
    throw new Error(
      `apex.decode.${ctx}: field ${JSON.stringify(field)} must be number; got ${typeof value}.`,
    );
  }
  return value;
}

function reqArray(raw: Record<string, unknown>, field: string, ctx: string): ReadonlyArray<unknown> {
  const value = raw[field];
  if (!Array.isArray(value)) {
    throw new Error(
      `apex.decode.${ctx}: field ${JSON.stringify(field)} must be array; got ${typeof value}.`,
    );
  }
  return value;
}

function reqObject(raw: Record<string, unknown>, field: string, ctx: string): Record<string, unknown> {
  const value = raw[field];
  if (!isRecord(value)) {
    throw new Error(
      `apex.decode.${ctx}: field ${JSON.stringify(field)} must be object; got ${typeof value}.`,
    );
  }
  return value;
}

// ---------------------------------------------------------------------------
// decodeBackendViolationRecord
// ---------------------------------------------------------------------------

function decodeBackendViolationRecord(raw: unknown, idx: number): BackendViolationRecord {
  if (!isRecord(raw)) {
    throw new Error(`apex.decode.BackendViolationRecord[${idx}]: must be object; got ${typeof raw}.`);
  }
  const stepRaw = reqNumber(raw, "step", `BackendViolationRecord[${idx}]`);
  const _step: HorizonStep = parseHorizonStep(stepRaw);
  void _step;

  const typeRaw = reqString(raw, "type", `BackendViolationRecord[${idx}]`);
  if (!VALID_BACKEND_VIOLATION_TYPES.has(typeRaw)) {
    throw new Error(
      `apex.decode.BackendViolationRecord[${idx}]: unknown type ${JSON.stringify(typeRaw)}.`,
    );
  }

  const tierRaw = reqNumber(raw, "tier", `BackendViolationRecord[${idx}]`);
  const _tier: PhysicsTier = parsePhysicsTier(tierRaw);
  void _tier;

  const severityRaw = reqNumber(raw, "severity", `BackendViolationRecord[${idx}]`);
  const _severity: Severity = parseSeverity(severityRaw);
  void _severity;

  const channelValuesRaw = reqObject(raw, "channel_values", `BackendViolationRecord[${idx}]`);
  const channelValues: Partial<Record<ChannelName, number>> = {};
  for (const [key, value] of Object.entries(channelValuesRaw)) {
    if (!VALID_CHANNEL_NAMES.has(key)) {
      throw new Error(
        `apex.decode.BackendViolationRecord[${idx}].channel_values: unknown channel ${JSON.stringify(key)}.`,
      );
    }
    if (typeof value !== "number") {
      throw new Error(
        `apex.decode.BackendViolationRecord[${idx}].channel_values[${key}]: must be number; got ${typeof value}.`,
      );
    }
    channelValues[key as ChannelName] = value;
  }

  return {
    step: stepRaw,
    type: typeRaw as BackendViolationType,
    tier: tierRaw,
    severity: severityRaw,
    channel_values: channelValues,
  };
}

// ---------------------------------------------------------------------------
// decodeBackendPhysicsViolationLog
// ---------------------------------------------------------------------------

export function decodeBackendPhysicsViolationLog(raw: unknown): BackendPhysicsViolationLog {
  if (!isRecord(raw)) {
    throw new Error(`apex.decode.BackendPhysicsViolationLog: must be object; got ${typeof raw}.`);
  }

  const recordsRaw = reqArray(raw, "records", "BackendPhysicsViolationLog");
  const records = recordsRaw.map((r, idx) => decodeBackendViolationRecord(r, idx));

  const fscRaw = reqNumber(raw, "forecast_step_count", "BackendPhysicsViolationLog");
  if (fscRaw !== 30) {
    throw new Error(
      `apex.decode.BackendPhysicsViolationLog: forecast_step_count must equal HORIZON (30); got ${fscRaw}.`,
    );
  }

  const engineRaw = reqString(raw, "engine", "BackendPhysicsViolationLog") as ViolationEngine;
  if (!VALID_VIOLATION_ENGINES.has(engineRaw)) {
    throw new Error(
      `apex.decode.BackendPhysicsViolationLog: unknown engine ${JSON.stringify(engineRaw)}.`,
    );
  }

  return { records, forecast_step_count: 30, engine: engineRaw };
}

// ---------------------------------------------------------------------------
// decodeBackendGuardianAudit
// ---------------------------------------------------------------------------

export function decodeBackendGuardianAudit(raw: unknown): BackendGuardianAudit {
  if (!isRecord(raw)) {
    throw new Error(`apex.decode.BackendGuardianAudit: must be object; got ${typeof raw}.`);
  }

  const auditIdRaw = reqString(raw, "audit_id", "BackendGuardianAudit");
  const _auditId: AuditId = parseAuditId(auditIdRaw);
  void _auditId;

  const verdictRaw = reqString(raw, "verdict", "BackendGuardianAudit") as BackendGuardianVerdict;
  if (!VALID_BACKEND_GUARDIAN_VERDICTS.has(verdictRaw)) {
    throw new Error(
      `apex.decode.BackendGuardianAudit: unknown verdict ${JSON.stringify(verdictRaw)}.`,
    );
  }

  const reasoning = reqString(raw, "reasoning", "BackendGuardianAudit");

  const triggeredRulesRaw = reqArray(raw, "triggered_rules", "BackendGuardianAudit");
  const triggeredRules = triggeredRulesRaw.map((r, idx) => {
    if (typeof r !== "string") {
      throw new Error(
        `apex.decode.BackendGuardianAudit.triggered_rules[${idx}]: must be string; got ${typeof r}.`,
      );
    }
    return r;
  });

  let physicsConfidence: MahalanobisConfidence | null = null;
  const pcRaw = raw["physics_confidence"];
  if (pcRaw !== null && pcRaw !== undefined) {
    if (typeof pcRaw !== "number") {
      throw new Error(
        `apex.decode.BackendGuardianAudit: physics_confidence must be number or null; got ${typeof pcRaw}.`,
      );
    }
    physicsConfidence = parseMahalanobisConfidence(pcRaw);
  }

  const auditedAtIso = reqString(raw, "audited_at_iso", "BackendGuardianAudit");

  return {
    audit_id: auditIdRaw,
    verdict: verdictRaw,
    reasoning,
    triggered_rules: triggeredRules,
    physics_confidence: physicsConfidence,
    audited_at_iso: auditedAtIso,
  };
}

// ---------------------------------------------------------------------------
// translateBackendVerdictToUIVerdict
// ---------------------------------------------------------------------------

export function translateBackendVerdictToUIVerdict(
  backend: BackendGuardianVerdict,
): GuardianAudit["verdict"] {
  switch (backend) {
    case "SAFE":
      return "approve";
    case "REVIEW":
      return "flag";
    case "BLOCK":
      return "reject";
    default: {
      const _exhaustive: never = backend;
      throw new Error(`apex.decode.translateBackendVerdictToUIVerdict: unknown verdict ${String(_exhaustive)}.`);
    }
  }
}

// ---------------------------------------------------------------------------
// decodeProjectionResult
// ---------------------------------------------------------------------------

export function decodeProjectionResult(raw: unknown): ProjectionResult {
  if (!isRecord(raw)) {
    throw new Error(`apex.decode.ProjectionResult: must be object; got ${typeof raw}.`);
  }

  const correctedRaw = reqArray(raw, "corrected_forecast", "ProjectionResult");
  if (correctedRaw.length === 0) {
    throw new Error(
      `apex.decode.ProjectionResult: corrected_forecast must be non-empty 3-D tensor (B, 30, 14).`,
    );
  }
  for (const [bIdx, batchSlice] of correctedRaw.entries()) {
    if (!Array.isArray(batchSlice) || batchSlice.length !== 30) {
      throw new Error(
        `apex.decode.ProjectionResult: corrected_forecast[${bIdx}] must be 30-step horizon array; got length ${
          Array.isArray(batchSlice) ? batchSlice.length : "non-array"
        }.`,
      );
    }
    for (const [tIdx, channelRow] of batchSlice.entries()) {
      if (!Array.isArray(channelRow) || channelRow.length !== 14) {
        throw new Error(
          `apex.decode.ProjectionResult: corrected_forecast[${bIdx}][${tIdx}] must be 14-channel array.`,
        );
      }
      for (const [cIdx, v] of channelRow.entries()) {
        if (typeof v !== "number") {
          throw new Error(
            `apex.decode.ProjectionResult: corrected_forecast[${bIdx}][${tIdx}][${cIdx}] must be number; got ${typeof v}.`,
          );
        }
      }
    }
  }

  const violationLog = decodeBackendPhysicsViolationLog(raw["violation_log"]);

  return {
    corrected_forecast: correctedRaw as ReadonlyArray<ReadonlyArray<ReadonlyArray<number>>>,
    violation_log: violationLog,
  };
}

// ---------------------------------------------------------------------------
// decodeStructuredLogEntry
// ---------------------------------------------------------------------------

export function decodeStructuredLogEntry(raw: unknown): StructuredLogEntry {
  if (!isRecord(raw)) {
    throw new Error(`apex.decode.StructuredLogEntry: must be object; got ${typeof raw}.`);
  }

  const ts = reqString(raw, "ts", "StructuredLogEntry");

  const levelRaw = reqString(raw, "level", "StructuredLogEntry") as StructuredLogEntryCanonical["level"];
  if (!VALID_LOG_LEVELS.has(levelRaw)) {
    throw new Error(
      `apex.decode.StructuredLogEntry: unknown level ${JSON.stringify(levelRaw)}.`,
    );
  }

  const logger = reqString(raw, "logger", "StructuredLogEntry");
  const event = reqString(raw, "event", "StructuredLogEntry");
  const auditIdRaw = reqString(raw, "audit_id", "StructuredLogEntry");
  parseAuditId(auditIdRaw);
  const commitShaRaw = reqString(raw, "commit_sha", "StructuredLogEntry");
  // CommitSha brand consumed by caller if needed; not stored here.
  void commitShaRaw;

  const modelsRaw = reqObject(raw, "models", "StructuredLogEntry");
  const models: Record<string, string> = {};
  for (const [key, value] of Object.entries(modelsRaw)) {
    if (typeof value !== "string") {
      throw new Error(
        `apex.decode.StructuredLogEntry.models[${key}]: must be string; got ${typeof value}.`,
      );
    }
    models[key] = value;
  }

  // Collect any extras: keys not in the canonical schema spread under the
  // StructuredLogEntryExtras index signature.
  const canonicalKeys = new Set(["ts", "level", "logger", "event", "audit_id", "commit_sha", "models"]);
  const extras: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!canonicalKeys.has(key)) {
      extras[key] = value;
    }
  }

  // LibraryVersion brand-cast at the boundary. JSON has no semver
  // template-literal validation, so we trust the string values here +
  // defer literal-narrowing to consumer-site `as` if needed.
  type LibVer = StructuredLogEntryCanonical["models"][string];

  return {
    ts,
    level: levelRaw,
    logger,
    event,
    audit_id: auditIdRaw,
    commit_sha: commitShaRaw,
    models: models as Readonly<Record<string, LibVer>>,
    ...extras,
  };
}

// ---------------------------------------------------------------------------
// decodeTriAgentVerdictPanel
// ---------------------------------------------------------------------------

export function decodeTriAgentVerdictPanel(raw: unknown): TriAgentVerdictPanel {
  if (!Array.isArray(raw)) {
    throw new Error(`apex.decode.TriAgentVerdictPanel: expected 3-tuple array; got ${typeof raw}.`);
  }
  if (raw.length !== 3) {
    throw new Error(`apex.decode.TriAgentVerdictPanel: expected length 3; got ${raw.length}.`);
  }

  const physics = raw[0] as unknown;
  const pedagogy = raw[1] as unknown;
  const guardianSafety = raw[2] as unknown;

  if (!isRecord(physics) || physics["critic"] !== VALID_CRITICS[0]) {
    throw new Error(
      `apex.decode.TriAgentVerdictPanel[0]: expected critic ${JSON.stringify(VALID_CRITICS[0])}; got ${JSON.stringify((physics as { critic?: unknown })?.critic)}.`,
    );
  }
  if (!isRecord(pedagogy) || pedagogy["critic"] !== VALID_CRITICS[1]) {
    throw new Error(
      `apex.decode.TriAgentVerdictPanel[1]: expected critic ${JSON.stringify(VALID_CRITICS[1])}; got ${JSON.stringify((pedagogy as { critic?: unknown })?.critic)}.`,
    );
  }
  if (!isRecord(guardianSafety) || guardianSafety["critic"] !== VALID_CRITICS[2]) {
    throw new Error(
      `apex.decode.TriAgentVerdictPanel[2]: expected critic ${JSON.stringify(VALID_CRITICS[2])}; got ${JSON.stringify((guardianSafety as { critic?: unknown })?.critic)}.`,
    );
  }

  // Per wave-37 cascade-#5 qualification: positional binding is enforced
  // at frontend construction sites only; this runtime check guards against
  // backend regressions emitting misordered tuples. We trust the verdict +
  // reasoning_trace + conditional-field shapes below per the type contract;
  // a future wave-42 decoder hardening will validate those structurally.
  return raw as unknown as TriAgentVerdictPanel;
}

// ---------------------------------------------------------------------------
// Version-parity entry point for the fetch wrapper
// ---------------------------------------------------------------------------

export interface VersionedWirePayload {
  readonly schema_version?: SemVer;
  readonly protocol_version?: SemVer;
}

/**
 * Strict-equality version-parity check at the wire boundary. Decoder
 * call sites that hit `/api/forecast` or `/api/critic` should invoke
 * this before passing the payload to the per-shape `decodeXxx()`
 * function. Throws if either version field is present + differs from
 * the frontend mirror.
 *
 * If the backend payload omits `schema_version` / `protocol_version`,
 * the check is skipped (legacy compatibility); the per-shape decoders
 * still enforce structural invariants.
 */
export function assertWirePayloadVersions(payload: VersionedWirePayload): void {
  if (payload.schema_version !== undefined) {
    expectSchemaVersion(payload.schema_version, SHAPES_SCHEMA_VERSION, "schema_version");
  }
  if (payload.protocol_version !== undefined) {
    expectSchemaVersion(
      payload.protocol_version,
      DIFFERENTIABLE_PROJECTOR_VERSION,
      "protocol_version",
    );
  }
}
