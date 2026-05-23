/**
 * Wave-41 B.8 close-out per wave-40 cold-review type-design-analyzer
 * H.9-H.11 fixture coverage gap. Deliberate-misshape negative tsc
 * fixture verifying the wave-41 B.2 brand-types module
 * (`app/shared/brands.ts`) enforces construction-site invariants:
 * every brand type cannot be constructed from arbitrary primitive
 * values + must flow through the `parseXxx()` validator constructors.
 *
 * Mirrors the wave-37 cascade-#5 single-line assertion-helper pattern
 * + the wave-39 `webgpu-probe-result.test-d.ts` + wave-40
 * `contract-alignment.test-d.ts` predecessors: each @ts-expect-error
 * directive asserts the next-statement line MUST emit a TypeScript
 * error. If tsc does not emit, the build fails on TS2578 "Unused
 * @ts-expect-error directive."
 *
 * File is type-only; runs through standard CI tsc invocation.
 */

import type {
  AuditId,
  CommitSha,
  HorizonStep,
  MahalanobisConfidence,
  PhysicsTier,
  PhysicsTierValue,
  SemVer,
  Severity,
} from "../../../shared/brands";
import {
  expectSchemaVersion,
  parseAuditId,
  parseCommitSha,
  parseHorizonStep,
  parseMahalanobisConfidence,
  parsePhysicsTier,
  parseSeverity,
} from "../../../shared/brands";

// Single-line assertion helpers. Each accepts the typed brand value at
// the call site so brand-rejection fires on the ONE line of the call
// (which is what @ts-expect-error suppresses).
function assertAuditId(_: AuditId): void {}
function assertCommitSha(_: CommitSha): void {}
function assertMahalanobisConfidence(_: MahalanobisConfidence): void {}
function assertMahalanobisConfidenceOrNull(_: MahalanobisConfidence | null): void {}
function assertHorizonStep(_: HorizonStep): void {}
function assertPhysicsTier(_: PhysicsTier): void {}
function assertPhysicsTierValue(_: PhysicsTierValue): void {}
function assertSeverity(_: Severity): void {}

// ---------------------------------------------------------------------------
// AuditId: canonical compile-paths
// ---------------------------------------------------------------------------

assertAuditId(parseAuditId("abc123def456abc123def456abc123de"));
assertAuditId(parseAuditId("no_audit"));

// @ts-expect-error wave-41 B.8: cannot construct AuditId from arbitrary string.
assertAuditId("abc123def456abc123def456abc123de");

// @ts-expect-error wave-41 B.8: AuditId rejects assignment from plain string literal even when matching the regex.
const _wrongAuditId: AuditId = "abc123def456abc123def456abc123de";
void _wrongAuditId;

// ---------------------------------------------------------------------------
// CommitSha: canonical compile-paths
// ---------------------------------------------------------------------------

assertCommitSha(parseCommitSha("c97caaa"));
assertCommitSha(parseCommitSha("c97caaa0ab334079057cf2dc607369bb371e580c"));
assertCommitSha(parseCommitSha("unknown"));

// @ts-expect-error wave-41 B.8: cannot construct CommitSha from arbitrary string.
assertCommitSha("c97caaa");

// @ts-expect-error wave-41 B.8: cannot wire CommitSha through AuditId-typed slot.
assertAuditId(parseCommitSha("c97caaa"));

// @ts-expect-error wave-41 B.8: cannot wire AuditId through CommitSha-typed slot.
assertCommitSha(parseAuditId("abc123def456abc123def456abc123de"));

// ---------------------------------------------------------------------------
// MahalanobisConfidence: canonical compile-paths
// ---------------------------------------------------------------------------

assertMahalanobisConfidenceOrNull(parseMahalanobisConfidence(1.84));
assertMahalanobisConfidenceOrNull(parseMahalanobisConfidence(null));

// @ts-expect-error wave-41 B.8: cannot construct MahalanobisConfidence from arbitrary number.
assertMahalanobisConfidence(1.84);

// @ts-expect-error wave-41 B.8: assertMahalanobisConfidence does not accept null.
assertMahalanobisConfidence(null);

// ---------------------------------------------------------------------------
// HorizonStep: canonical compile-paths
// ---------------------------------------------------------------------------

assertHorizonStep(parseHorizonStep(0));
assertHorizonStep(parseHorizonStep(29));

// @ts-expect-error wave-41 B.8: cannot construct HorizonStep from arbitrary number.
assertHorizonStep(15);

// @ts-expect-error wave-41 B.8: cannot wire HorizonStep through PhysicsTier-typed slot.
assertPhysicsTier(parseHorizonStep(5));

// ---------------------------------------------------------------------------
// PhysicsTier + PhysicsTierValue: canonical compile-paths
// ---------------------------------------------------------------------------

assertPhysicsTier(parsePhysicsTier(0));
assertPhysicsTier(parsePhysicsTier(8));

assertPhysicsTierValue(0);
assertPhysicsTierValue(8);

// @ts-expect-error wave-41 B.8: cannot construct PhysicsTier from arbitrary number.
assertPhysicsTier(5);

// @ts-expect-error wave-41 B.8: PhysicsTierValue rejects out-of-range literal.
assertPhysicsTierValue(9);

// @ts-expect-error wave-41 B.8: PhysicsTierValue rejects negative literal.
assertPhysicsTierValue(-1);

// ---------------------------------------------------------------------------
// Severity: canonical compile-paths
// ---------------------------------------------------------------------------

assertSeverity(parseSeverity(0));
assertSeverity(parseSeverity(0.124));

// @ts-expect-error wave-41 B.8: cannot construct Severity from arbitrary number.
assertSeverity(0.124);

// @ts-expect-error wave-41 B.8: cannot wire Severity through MahalanobisConfidence-typed slot.
assertMahalanobisConfidence(parseSeverity(0.124));

// ---------------------------------------------------------------------------
// SemVer template-literal + expectSchemaVersion
// ---------------------------------------------------------------------------

const _validSemver: SemVer = "0.1.0";
void _validSemver;

// @ts-expect-error wave-41 B.8: SemVer rejects non-semver string.
const _invalidSemver: SemVer = "0.1";
void _invalidSemver;

// Note on SemVer template-literal coverage: `${number}.${number}.${number}`
// will permissively accept multi-dot inputs like "0.1.0.0" because TS
// template-literal inference greedy-matches `${number}` against "1.0".
// Runtime validation belongs in the wave-41 decoder; the type alias
// catches the obvious "not a dotted-triple" cases (e.g. "0.1").

expectSchemaVersion("0.1.0", "0.1.0", "test");

// @ts-expect-error wave-41 B.8: expectSchemaVersion rejects non-SemVer string for the wire arg.
expectSchemaVersion("not-a-semver", "0.1.0", "test");

// @ts-expect-error wave-41 B.8: expectSchemaVersion contextLabel arg must be string, not number.
expectSchemaVersion("0.1.0", "0.1.0", 42);
