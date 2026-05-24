/**
 * APEX branded primitive types + their parser functions.
 *
 * Wave-41 Stream B.2 close-out per `~/.claude/plans/all-right-i-want-rippling-moon.md`
 * Lane 1 type-foundation. Per wave-40 cold-review type-design-analyzer H.1 + H.3
 * + H.4: every ID-typed string + every range-constrained number on the
 * frontend-backend wire boundary gets a brand type so accidental ID-wiring
 * bugs (passing a commit_sha where an audit_id is expected) become
 * compile-time TS errors instead of runtime corruption.
 *
 * Layering: brand types live in this module to keep `types.ts` from
 * bloating past 1256 lines (already at the soft-cap per the file's existing
 * structure). All brand types re-export through `types.ts` for consumer
 * convenience, but the parser-function constructors live here exclusively.
 *
 * Construction rule per type-design-analyzer recommendation: every brand
 * type has exactly one constructor function (`parseXxx()`) that validates
 * the raw input + throws on shape mismatch. Downstream consumers cannot
 * construct a brand type from arbitrary string/number; the parsers are
 * the only legitimate entry point. Wave-41 decoder
 * (`app/frontend/lib/api-decode.ts`, Stream A) calls these parsers at the
 * wire boundary so every JSON.parse result gets validated before flowing
 * into the rest of the type system.
 *
 * Cross-references:
 *  - `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_council_v2_amendments.md`
 *  - `app/backend/apex/shared/contracts/violations.py:172` (audit_id source)
 *  - `app/backend/apex/shared/logging.py:74` (commit_sha source)
 *  - `app/backend/apex/shared/contracts/shapes.py:34` (HORIZON = 30 source)
 *  - `app/backend/apex/shared/contracts/shapes.py:55-70` (CHANNEL_TIER_BINDING tier-value source)
 *  - `docs/decision-log.md` D-024 (Mahalanobis confidence detector source)
 *  - `docs/decision-log.md` D-035 (wave-41 brand-types architectural decision; will land Stream I)
 */

// ---------------------------------------------------------------------------
// AuditId: uuid4().hex OR "no_audit" sentinel
// ---------------------------------------------------------------------------

declare const __auditIdBrand: unique symbol;

/**
 * 32-char lowercase hex string (uuid4().hex) OR the sentinel "no_audit"
 * when emitted outside an `audit_context()` block. Mirrors
 * `app/backend/apex/shared/logging.py:41` default + the
 * `app/backend/apex/shared/contracts/violations.py:180-187` new_audit_id()
 * generator. Construct exclusively via `parseAuditId()`.
 *
 * Council v2 Software Lead fix #9: this field is never empty in the
 * backend; the parser enforces the same invariant on the frontend
 * decode boundary.
 */
export type AuditId = string & { readonly [__auditIdBrand]: never };

const AUDIT_ID_PATTERN = /^[0-9a-f]{32}$/;
const NO_AUDIT_SENTINEL = "no_audit" as const;

/**
 * Validate + brand a raw string as an AuditId. Accepts the 32-char
 * lowercase hex uuid4().hex form OR the literal "no_audit" sentinel.
 * Throws on any other shape.
 */
export function parseAuditId(raw: string): AuditId {
  if (raw === NO_AUDIT_SENTINEL) {
    return raw as AuditId;
  }
  if (!AUDIT_ID_PATTERN.test(raw)) {
    throw new Error(
      `apex.brands.parseAuditId: invalid audit_id ${JSON.stringify(raw)}; expected 32-char lowercase hex OR "no_audit" sentinel.`,
    );
  }
  return raw as AuditId;
}

// ---------------------------------------------------------------------------
// CommitSha: 7-40 char lowercase hex
// ---------------------------------------------------------------------------

declare const __commitShaBrand: unique symbol;

/**
 * Git commit SHA in either the short (7-char minimum per `git
 * rev-parse --short`) or full (40-char) hex form. Mirrors
 * `app/backend/apex/shared/logging.py:74` commit_sha() resolver +
 * the "unknown" fallback when git is unavailable. Construct via
 * `parseCommitSha()`.
 */
export type CommitSha = string & { readonly [__commitShaBrand]: never };

const COMMIT_SHA_PATTERN = /^[0-9a-f]{7,40}$/;
const COMMIT_SHA_UNKNOWN_SENTINEL = "unknown" as const;

/**
 * Validate + brand a raw string as a CommitSha. Accepts 7-40 char
 * lowercase hex OR the literal "unknown" sentinel emitted by
 * `logging.py` when git is unavailable.
 */
export function parseCommitSha(raw: string): CommitSha {
  if (raw === COMMIT_SHA_UNKNOWN_SENTINEL) {
    return raw as CommitSha;
  }
  if (!COMMIT_SHA_PATTERN.test(raw)) {
    throw new Error(
      `apex.brands.parseCommitSha: invalid commit_sha ${JSON.stringify(raw)}; expected 7-40 char lowercase hex OR "unknown" sentinel.`,
    );
  }
  return raw as CommitSha;
}

// ---------------------------------------------------------------------------
// MahalanobisConfidence: non-negative finite distance
// ---------------------------------------------------------------------------

declare const __mahalanobisBrand: unique symbol;

/**
 * Mahalanobis-distance output from the D-024 physics-confidence
 * detector. Range `[0, +Infinity)`. Mirrors
 * `app/backend/apex/shared/contracts/violations.py:176`
 * `physics_confidence: float | None`. Negative values + NaN + Infinity
 * are corruption + must throw at the decoder boundary, not propagate
 * through Guardian downgrade logic.
 */
export type MahalanobisConfidence = number & { readonly [__mahalanobisBrand]: never };

/**
 * Validate + brand a raw number as a MahalanobisConfidence. Accepts
 * null pass-through (matches Python `float | None`). Throws on
 * negative + NaN + Infinity.
 */
export function parseMahalanobisConfidence(raw: number | null): MahalanobisConfidence | null {
  if (raw === null) {
    return null;
  }
  if (!Number.isFinite(raw) || raw < 0) {
    throw new Error(
      `apex.brands.parseMahalanobisConfidence: invalid value ${raw}; expected non-negative finite number OR null.`,
    );
  }
  return raw as MahalanobisConfidence;
}

// ---------------------------------------------------------------------------
// HorizonStep: integer 0..29 (HORIZON-1)
// ---------------------------------------------------------------------------

declare const __horizonStepBrand: unique symbol;

/**
 * Forecast-horizon step index. Range `[0, HORIZON)` = `[0, 30)` =
 * integer 0..29 per `app/backend/apex/shared/contracts/shapes.py:34`
 * HORIZON. Mirrors `violations.py:86` ViolationRecord.step. Step 30
 * is out-of-range corruption + must throw.
 */
export type HorizonStep = number & { readonly [__horizonStepBrand]: never };

const HORIZON_STEP_MIN = 0;
const HORIZON_STEP_MAX_EXCLUSIVE = 30;

/**
 * Validate + brand a raw number as a HorizonStep. Integer 0..29.
 */
export function parseHorizonStep(raw: number): HorizonStep {
  if (!Number.isInteger(raw) || raw < HORIZON_STEP_MIN || raw >= HORIZON_STEP_MAX_EXCLUSIVE) {
    throw new Error(
      `apex.brands.parseHorizonStep: invalid step ${raw}; expected integer 0..${HORIZON_STEP_MAX_EXCLUSIVE - 1}.`,
    );
  }
  return raw as HorizonStep;
}

// ---------------------------------------------------------------------------
// PhysicsTier: integer 0..8 per D-015 tier-binding
// ---------------------------------------------------------------------------

declare const __physicsTierBrand: unique symbol;

/**
 * Wave-30 D-015 physics tier identifier. Tier 0 = COA-derived
 * constraint; tiers 1..8 = physics tiers (3D track + aero + adaptive
 * hand-controls + load transfer + thermal + transient + Pacejka +
 * kinematic). Mirrors `shapes.py:55-70` CHANNEL_TIER_BINDING values +
 * `violations.py:90` ViolationRecord.tier.
 */
export type PhysicsTier = number & { readonly [__physicsTierBrand]: never };

/**
 * Literal-union over the closed 0..8 tier-value range. Used as the
 * value type of `CHANNEL_TIER_BINDING` in `app/shared/types.ts`
 * (wave-41 B.6 tightening from `number | null` to
 * `PhysicsTierValue | null`).
 */
export type PhysicsTierValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const PHYSICS_TIER_MIN = 0;
const PHYSICS_TIER_MAX = 8;

/**
 * Validate + brand a raw number as a PhysicsTier. Integer 0..8.
 */
export function parsePhysicsTier(raw: number): PhysicsTier {
  if (
    !Number.isInteger(raw) ||
    raw < PHYSICS_TIER_MIN ||
    raw > PHYSICS_TIER_MAX
  ) {
    throw new Error(
      `apex.brands.parsePhysicsTier: invalid tier ${raw}; expected integer ${PHYSICS_TIER_MIN}..${PHYSICS_TIER_MAX}.`,
    );
  }
  return raw as PhysicsTier;
}

// ---------------------------------------------------------------------------
// Severity: non-negative finite distance past constraint boundary
// ---------------------------------------------------------------------------

declare const __severityBrand: unique symbol;

/**
 * Distance past the constraint boundary on a ViolationRecord. Range
 * `[0, +Infinity)`. Mirrors `violations.py:88` ViolationRecord.severity
 * docstring "how far past the constraint boundary (>= 0)". Negative
 * severity is corruption (the record should not exist if severity is
 * 0); NaN + Infinity break downstream FCVR aggregation.
 */
export type Severity = number & { readonly [__severityBrand]: never };

/**
 * Validate + brand a raw number as a Severity. Non-negative finite.
 */
export function parseSeverity(raw: number): Severity {
  if (!Number.isFinite(raw) || raw < 0) {
    throw new Error(
      `apex.brands.parseSeverity: invalid severity ${raw}; expected non-negative finite number.`,
    );
  }
  return raw as Severity;
}

// ---------------------------------------------------------------------------
// SemVer: semantic-version comparator helpers (Stream A decoder uses this)
// ---------------------------------------------------------------------------

/**
 * Major.minor.patch semantic version string (e.g. "0.1.0"). Used for
 * SHAPES_SCHEMA_VERSION + DIFFERENTIABLE_PROJECTOR_VERSION parity
 * checks at the wave-41 decoder boundary. The strict-equality compare
 * is the D-A frozen-contract policy; range-based compare is overkill
 * for this project.
 *
 * **Foot-gun caveat (wave-41 cascade-#11 MED M2 per type-design-
 * analyzer H3):** TypeScript template-literal type
 * `${number}.${number}.${number}` is PERMISSIVE: it greedy-matches
 * the inner `${number}` against floats so `"0.1.0.0"` actually
 * compiles as a valid SemVer (TS infers the second `${number}` as
 * `1.0` which is a valid number literal). The runtime semver
 * validation via the `SEMVER_RUNTIME_PATTERN` regex at
 * `app/frontend/lib/api-decode.ts` is stricter than this type alias
 * + IS the actual wire-boundary safety check. The type alias catches
 * the obvious "not a dotted-triple" cases (e.g. `"0.1"`) + the rest
 * gets caught at runtime. If a future TypeScript bumps include
 * `${bigint}.${bigint}.${bigint}` support (rejects floats + multi-
 * dot), tighten the alias accordingly.
 */
export type SemVer = `${number}.${number}.${number}`;

/**
 * Strict-equality SemVer compare. Used by the wave-41 decoder at
 * `app/frontend/lib/api-decode.ts` to throw on any version mismatch
 * between the wire payload + the frontend mirror constants.
 */
export function expectSchemaVersion(wire: SemVer, expected: SemVer, contextLabel: string): void {
  if (wire !== expected) {
    throw new Error(
      `apex.brands.expectSchemaVersion: ${contextLabel} wire payload version ${JSON.stringify(wire)} does not match frontend mirror ${JSON.stringify(expected)}. Update the TypeScript mirror to match the latest backend constant.`,
    );
  }
}

// ---------------------------------------------------------------------------
// Re-export sentinel constants for consumer pattern matching
// ---------------------------------------------------------------------------

export const SENTINELS = Object.freeze({
  AUDIT_ID_NO_AUDIT: NO_AUDIT_SENTINEL,
  COMMIT_SHA_UNKNOWN: COMMIT_SHA_UNKNOWN_SENTINEL,
});
