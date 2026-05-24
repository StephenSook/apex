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
  parseCommitSha,
  parseHorizonStep,
  parseMahalanobisConfidence,
  parsePhysicsTier,
  parseSeverity,
  type AuditId,
  type CommitSha,
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
  type CriticName,
  type GuardianAudit,
  type LibraryVersion,
  type ProjectionResult,
  type StructuredLogEntry,
  type StructuredLogEntryCanonical,
  type TriAgentVerdict,
  type TriAgentVerdictPanel,
  type ViolationEngine,
} from "../../shared/types";

// Re-export the strict-equality SemVer compare so consumers can hit a
// single decoder import surface for all wire-boundary checks.
export const expectSchemaVersion = _expectSchemaVersion;

/**
 * Wave-41 cascade-#11 plan-gap-scanner BLOCKER#3 close-out. Plan
 * §Stream A listed `expectProtocolVersion(...)` as a required export
 * distinct from `expectSchemaVersion(...)`. The actual operation is
 * the same strict-equality SemVer compare; this thin wrapper exists
 * to make consumer-site call intent explicit (projector-protocol-
 * version checks vs shapes-schema-version checks) so reading a stack
 * trace tells you which contract drifted.
 */
export function expectProtocolVersion(
  wire: SemVer,
  expected: SemVer,
  contextLabel: string,
): void {
  _expectSchemaVersion(wire, expected, contextLabel);
}

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

// Wave-41 cascade-#11 HIGH H2: LibraryVersion per-value validator
// closes the B.7 type-tightening gap. Backend emits semver (X.Y.Z) OR
// one of three logging.py:91-98 sentinels ("unknown", "no_version_attr",
// "not_installed"); any other value is a backend regression worth
// throwing on at the wire boundary instead of flowing silently through
// downstream structured-log consumers.
const SEMVER_RUNTIME_PATTERN = /^\d+\.\d+\.\d+$/;
const LIBRARY_VERSION_SENTINEL_SET: ReadonlySet<string> = new Set([
  "unknown",
  "no_version_attr",
  "not_installed",
]);

function validateLibraryVersionValue(value: string, key: string): LibraryVersion {
  if (LIBRARY_VERSION_SENTINEL_SET.has(value) || SEMVER_RUNTIME_PATTERN.test(value)) {
    return value as LibraryVersion;
  }
  throw new Error(
    `apex.decode.StructuredLogEntry.models[${JSON.stringify(key)}]: expected semver (X.Y.Z) OR one of "unknown" | "no_version_attr" | "not_installed"; got ${JSON.stringify(value)}.`,
  );
}

// ---------------------------------------------------------------------------
// decodeBackendViolationRecord
// ---------------------------------------------------------------------------

function decodeBackendViolationRecord(raw: unknown, idx: number): BackendViolationRecord {
  if (!isRecord(raw)) {
    throw new Error(`apex.decode.BackendViolationRecord[${idx}]: must be object; got ${typeof raw}.`);
  }
  const stepRaw = reqNumber(raw, "step", `BackendViolationRecord[${idx}]`);
  const step: HorizonStep = parseHorizonStep(stepRaw);

  const typeRaw = reqString(raw, "type", `BackendViolationRecord[${idx}]`);
  if (!VALID_BACKEND_VIOLATION_TYPES.has(typeRaw)) {
    throw new Error(
      `apex.decode.BackendViolationRecord[${idx}]: unknown type ${JSON.stringify(typeRaw)}.`,
    );
  }

  const tierRaw = reqNumber(raw, "tier", `BackendViolationRecord[${idx}]`);
  const tier: PhysicsTier = parsePhysicsTier(tierRaw);

  const severityRaw = reqNumber(raw, "severity", `BackendViolationRecord[${idx}]`);
  const severity: Severity = parseSeverity(severityRaw);

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

  // Wave-41 cascade-#11 brand-propagation: return branded step + tier +
  // severity so consumer-site cross-brand wiring (e.g. assigning a
  // PhysicsTier into a step slot) is a TS compile error not a runtime
  // corruption. Field order preserves violations.py:131 to_text()
  // emission per B.5 (load-bearing for round-trip serialization).
  return {
    step,
    type: typeRaw as BackendViolationType,
    tier,
    severity,
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
  const auditId: AuditId = parseAuditId(auditIdRaw);

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

  // Wave-41 cascade-#11 brand-propagation: branded audit_id +
  // physics_confidence flow through. Wave-42 Lane E.M.1: BackendGuardian
  // Audit is now a discriminated union by verdict; per-variant
  // triggered_rules invariants must hold at construction. Decoder
  // throws on backend regression that breaks the new contract so the
  // contract-drift signal surfaces at the wire boundary.
  const base = {
    audit_id: auditId,
    reasoning,
    physics_confidence: physicsConfidence,
    audited_at_iso: auditedAtIso,
  };

  switch (verdictRaw) {
    case "SAFE":
      if (triggeredRules.length > 0) {
        throw new Error(
          `apex.decode.BackendGuardianAudit: SAFE verdict cannot carry triggered_rules; got ${triggeredRules.length} rules. Backend emitter contract violation.`,
        );
      }
      return { ...base, verdict: "SAFE", triggered_rules: [] as const };
    case "REVIEW":
      return { ...base, verdict: "REVIEW", triggered_rules: triggeredRules };
    case "BLOCK":
      if (triggeredRules.length === 0) {
        throw new Error(
          `apex.decode.BackendGuardianAudit: BLOCK verdict requires at least one triggered_rule; got empty array. Backend emitter contract violation.`,
        );
      }
      // Wave-42 cold-review-2 type-design-analyzer H3 close-out:
      // destructure-and-spread eliminates the prior `as unknown as
      // readonly [string, ...string[]]` cast. After the empty-check at
      // the if-guard above, triggeredRules is provably non-empty, so
      // the destructure produces a head + rest pair that satisfies
      // the tuple type without a cast.
      const [headRule, ...restRules] = triggeredRules;
      return {
        ...base,
        verdict: "BLOCK",
        triggered_rules: [headRule, ...restRules] as const,
      };
    default: {
      const _exhaustive: never = verdictRaw;
      throw new Error(
        `apex.decode.BackendGuardianAudit: unknown verdict ${String(_exhaustive)}.`,
      );
    }
  }
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
  const auditId: AuditId = parseAuditId(auditIdRaw);

  // Wave-41 cascade-#11 HIGH H1: parseCommitSha at the wire boundary so
  // a backend bug emitting `commit_sha: "GIT_FAILED"` or empty string
  // throws here instead of flowing silently through downstream
  // structured-log consumers. Per logging.py:74 commit_sha() resolver:
  // 7-40 char lowercase hex OR "unknown" sentinel.
  const commitShaRaw = reqString(raw, "commit_sha", "StructuredLogEntry");
  const commitSha: CommitSha = parseCommitSha(commitShaRaw);

  // Wave-41 cascade-#11 HIGH H2: per-value LibraryVersion validation via
  // validateLibraryVersionValue helper above. The B.7 type-tightening
  // (LibraryVersion = semver | 3 sentinels) was previously bypassed by a
  // single `as Readonly<Record<string, LibVer>>` cast; per-value
  // validation closes that gap.
  const modelsRaw = reqObject(raw, "models", "StructuredLogEntry");
  const models: Record<string, LibraryVersion> = {};
  for (const [key, value] of Object.entries(modelsRaw)) {
    if (typeof value !== "string") {
      throw new Error(
        `apex.decode.StructuredLogEntry.models[${key}]: must be string; got ${typeof value}.`,
      );
    }
    models[key] = validateLibraryVersionValue(value, key);
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

  // Wave-41 cascade-#11 brand-propagation: branded audit_id + commit_sha
  // flow through so consumer-site cross-brand wiring (e.g. assigning a
  // CommitSha into an audit_id slot) is a TS compile error not a runtime
  // corruption. Per-value LibraryVersion validation above closes the
  // prior cast-bypass gap on the models field.
  return {
    ts,
    level: levelRaw,
    logger,
    event,
    audit_id: auditId,
    commit_sha: commitSha,
    models,
    ...extras,
  };
}

// ---------------------------------------------------------------------------
// decodeTriAgentVerdictPanel
// ---------------------------------------------------------------------------

// Wave-41 cascade-#11 BLOCKER B2: decodeTriAgentVerdict validates one
// critic slot fully (critic name match + verdict literal + reasoning_trace
// array of strings + critic_run_id + conditional flagged_concerns /
// blocked_recommendations payload). Prior decoder shape validated only
// critic name + cast the whole tuple unsafely; that let a backend bug
// emitting `verdict: undefined` or non-array reasoning_trace flow into
// TriAgentCriticPanel.tsx and crash the UI.
function decodeTriAgentVerdict<TCritic extends CriticName>(
  raw: unknown,
  expectedCritic: TCritic,
  ctx: string,
): TriAgentVerdict & { readonly critic: TCritic } {
  if (!isRecord(raw)) {
    throw new Error(`apex.decode.${ctx}: must be object; got ${typeof raw}.`);
  }
  const critic = reqString(raw, "critic", ctx);
  if (critic !== expectedCritic) {
    throw new Error(
      `apex.decode.${ctx}: critic must be ${JSON.stringify(expectedCritic)}; got ${JSON.stringify(critic)}.`,
    );
  }
  const verdictRaw = reqString(raw, "verdict", ctx);
  if (verdictRaw !== "approve" && verdictRaw !== "flag" && verdictRaw !== "reject") {
    throw new Error(
      `apex.decode.${ctx}: verdict must be "approve" | "flag" | "reject"; got ${JSON.stringify(verdictRaw)}.`,
    );
  }
  const reasoningTraceRaw = reqArray(raw, "reasoning_trace", ctx);
  const reasoningTrace: string[] = reasoningTraceRaw.map((step, idx) => {
    if (typeof step !== "string") {
      throw new Error(
        `apex.decode.${ctx}.reasoning_trace[${idx}]: must be string; got ${typeof step}.`,
      );
    }
    return step;
  });
  const criticRunId = reqString(raw, "critic_run_id", ctx);

  if (verdictRaw === "approve") {
    return {
      critic: expectedCritic,
      verdict: "approve",
      reasoning_trace: reasoningTrace,
      critic_run_id: criticRunId,
    } as TriAgentVerdict & { readonly critic: TCritic };
  }
  if (verdictRaw === "flag") {
    const flaggedRaw = reqArray(raw, "flagged_concerns", ctx);
    const flagged = flaggedRaw.map((concern, idx) => {
      if (typeof concern !== "string") {
        throw new Error(
          `apex.decode.${ctx}.flagged_concerns[${idx}]: must be string; got ${typeof concern}.`,
        );
      }
      return concern;
    });
    return {
      critic: expectedCritic,
      verdict: "flag",
      reasoning_trace: reasoningTrace,
      flagged_concerns: flagged,
      critic_run_id: criticRunId,
    } as TriAgentVerdict & { readonly critic: TCritic };
  }
  // verdictRaw === "reject" (narrowed by the exhaustive check above)
  const blockedRaw = reqArray(raw, "blocked_recommendations", ctx);
  const blocked = blockedRaw.map((rec, idx) => {
    if (typeof rec !== "string") {
      throw new Error(
        `apex.decode.${ctx}.blocked_recommendations[${idx}]: must be string; got ${typeof rec}.`,
      );
    }
    return rec;
  });
  return {
    critic: expectedCritic,
    verdict: "reject",
    reasoning_trace: reasoningTrace,
    blocked_recommendations: blocked,
    critic_run_id: criticRunId,
  } as TriAgentVerdict & { readonly critic: TCritic };
}

export function decodeTriAgentVerdictPanel(raw: unknown): TriAgentVerdictPanel {
  if (!Array.isArray(raw)) {
    throw new Error(`apex.decode.TriAgentVerdictPanel: expected 3-tuple array; got ${typeof raw}.`);
  }
  if (raw.length !== 3) {
    throw new Error(`apex.decode.TriAgentVerdictPanel: expected length 3; got ${raw.length}.`);
  }

  // Wave-41 cascade-#11 BLOCKER B2: every tuple slot fully structurally
  // validated via decodeTriAgentVerdict; positional binding (Physics ->
  // Pedagogy -> Guardian-Safety) enforced via the expected-critic param.
  // Replaces the prior `return raw as unknown as TriAgentVerdictPanel`
  // unsafe cast.
  const physics = decodeTriAgentVerdict(raw[0], "physics", "TriAgentVerdictPanel[0]");
  const pedagogy = decodeTriAgentVerdict(raw[1], "pedagogy", "TriAgentVerdictPanel[1]");
  const guardianSafety = decodeTriAgentVerdict(
    raw[2],
    "guardian_safety",
    "TriAgentVerdictPanel[2]",
  );

  return [physics, pedagogy, guardianSafety] as const;
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
  let checkedAny = false;
  if (payload.schema_version !== undefined) {
    expectSchemaVersion(payload.schema_version, SHAPES_SCHEMA_VERSION, "schema_version");
    checkedAny = true;
  }
  if (payload.protocol_version !== undefined) {
    expectProtocolVersion(
      payload.protocol_version,
      DIFFERENTIABLE_PROJECTOR_VERSION,
      "protocol_version",
    );
    checkedAny = true;
  }

  // Wave-41 cascade-#11 HIGH H6 (codex HIGH + silent-failure-hunter
  // M-3): warn-not-fatal when both version fields are missing. Per
  // the D-A frozen-contract policy + the Stream M.3 spec handoff, all
  // wire payloads ship versioned. Missing both fields signals a
  // misconfigured endpoint or stale build; surfacing in DevTools
  // without breaking the demo so operators can correlate the warning
  // with a downstream contract drift instead of letting an unversioned
  // payload flow silently.
  if (!checkedAny && typeof console !== "undefined" && console.warn) {
    console.warn(
      "apex.decode.assertWirePayloadVersions: payload omitted both schema_version + protocol_version. Per D-A frozen-contract policy, all wire payloads should ship versioned; this warning indicates a misconfigured endpoint or stale build.",
      { payload },
    );
  }
}
