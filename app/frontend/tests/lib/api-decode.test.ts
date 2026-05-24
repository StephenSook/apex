import { describe, expect, it, vi } from "vitest";

import {
  assertWirePayloadVersions,
  decodeBackendGuardianAudit,
} from "../../lib/api-decode";
import { DIFFERENTIABLE_PROJECTOR_VERSION, SHAPES_SCHEMA_VERSION } from "../../../shared/types";

describe("decodeBackendGuardianAudit", () => {
  const baseValidSafe = {
    audit_id: "550e8400-e29b-41d4-a716-446655440000",
    verdict: "SAFE" as const,
    reasoning: "all forecast steps within friction-ellipse + jerk bounds",
    triggered_rules: [] as ReadonlyArray<string>,
    physics_confidence: 0.95,
    audited_at_iso: "2026-05-24T20:00:00Z",
  };

  it("decodes a SAFE verdict with empty triggered_rules", () => {
    const audit = decodeBackendGuardianAudit(baseValidSafe);
    expect(audit.verdict).toBe("SAFE");
    expect(audit.triggered_rules).toEqual([]);
    expect(audit.reasoning).toBe("all forecast steps within friction-ellipse + jerk bounds");
  });

  it("throws when SAFE verdict carries non-empty triggered_rules (contract violation)", () => {
    const invalid = {
      ...baseValidSafe,
      triggered_rules: ["jerk_bound_exceeded"],
    };
    expect(() => decodeBackendGuardianAudit(invalid)).toThrow(
      /SAFE verdict cannot carry triggered_rules/i,
    );
  });

  it("decodes a REVIEW verdict with arbitrary triggered_rules count", () => {
    const review = {
      ...baseValidSafe,
      verdict: "REVIEW" as const,
      triggered_rules: ["pacejka_load_warn", "thermal_envelope_warn"],
    };
    const audit = decodeBackendGuardianAudit(review);
    expect(audit.verdict).toBe("REVIEW");
    expect(audit.triggered_rules).toEqual(["pacejka_load_warn", "thermal_envelope_warn"]);
  });

  it("throws when BLOCK verdict carries empty triggered_rules (contract violation)", () => {
    const invalid = {
      ...baseValidSafe,
      verdict: "BLOCK" as const,
      triggered_rules: [],
    };
    expect(() => decodeBackendGuardianAudit(invalid)).toThrow(
      /BLOCK verdict requires at least one triggered_rule/i,
    );
  });

  it("decodes a BLOCK verdict with at least one triggered_rule", () => {
    const block = {
      ...baseValidSafe,
      verdict: "BLOCK" as const,
      triggered_rules: ["friction_ellipse_exceeded"],
    };
    const audit = decodeBackendGuardianAudit(block);
    expect(audit.verdict).toBe("BLOCK");
    expect(audit.triggered_rules.length).toBeGreaterThan(0);
  });

  it("throws when raw is not an object", () => {
    expect(() => decodeBackendGuardianAudit("not an object")).toThrow(
      /must be object/i,
    );
    expect(() => decodeBackendGuardianAudit(null)).toThrow();
    expect(() => decodeBackendGuardianAudit(undefined)).toThrow();
  });

  it("throws on unknown verdict value", () => {
    const invalid = {
      ...baseValidSafe,
      verdict: "MAYBE",
    };
    expect(() => decodeBackendGuardianAudit(invalid)).toThrow(/unknown verdict/i);
  });

  it("accepts physics_confidence as null", () => {
    const audit = decodeBackendGuardianAudit({
      ...baseValidSafe,
      physics_confidence: null,
    });
    expect(audit.physics_confidence).toBeNull();
  });
});

describe("assertWirePayloadVersions", () => {
  it("passes when both schema_version + protocol_version match", () => {
    expect(() =>
      assertWirePayloadVersions({
        schema_version: SHAPES_SCHEMA_VERSION,
        protocol_version: DIFFERENTIABLE_PROJECTOR_VERSION,
      }),
    ).not.toThrow();
  });

  it("throws when schema_version differs", () => {
    expect(() =>
      assertWirePayloadVersions({
        schema_version: "99.99.99",
        protocol_version: DIFFERENTIABLE_PROJECTOR_VERSION,
      }),
    ).toThrow();
  });

  it("warns when both version fields missing (legacy compatibility)", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(() => assertWirePayloadVersions({})).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
