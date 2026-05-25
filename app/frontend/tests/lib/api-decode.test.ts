import { describe, expect, it, vi } from "vitest";

import {
  assertWirePayloadVersions,
  decodeBackendGuardianAudit,
} from "../../lib/api-decode";
import { DIFFERENTIABLE_PROJECTOR_VERSION, SHAPES_SCHEMA_VERSION } from "../../../shared/types";

describe("decodeBackendGuardianAudit", () => {
  const baseValidSafe = {
    audit_id: "550e8400e29b41d4a716446655440000",
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

  it("BLOCK decode preserves tuple-head (triggered_rules[0]) + ordering invariant across destructure-and-spread", () => {
    const block = {
      ...baseValidSafe,
      verdict: "BLOCK" as const,
      triggered_rules: ["jerk_bound_exceeded", "pacejka_load_warn", "thermal_envelope_warn"],
    };
    const audit = decodeBackendGuardianAudit(block);
    if (audit.verdict !== "BLOCK") {
      throw new Error("type-narrowing assert failed; decoder lost the BLOCK tag");
    }
    expect(audit.triggered_rules[0]).toBe("jerk_bound_exceeded");
    expect(audit.triggered_rules[1]).toBe("pacejka_load_warn");
    expect(audit.triggered_rules[2]).toBe("thermal_envelope_warn");
    expect(audit.triggered_rules.length).toBe(3);
  });

  it("BLOCK decode preserves single-element tuple-head correctly (degenerate case)", () => {
    const block = {
      ...baseValidSafe,
      verdict: "BLOCK" as const,
      triggered_rules: ["coa_simultaneity_violation"],
    };
    const audit = decodeBackendGuardianAudit(block);
    if (audit.verdict !== "BLOCK") {
      throw new Error("type-narrowing assert failed; decoder lost the BLOCK tag");
    }
    expect(audit.triggered_rules[0]).toBe("coa_simultaneity_violation");
    expect(audit.triggered_rules.length).toBe(1);
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
