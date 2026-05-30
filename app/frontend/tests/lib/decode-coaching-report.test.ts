import { describe, expect, it } from "vitest";

import { decodeCoachingReport } from "../../lib/decode-coaching-report";

// Mirrors the live backend POST /api/analyze coaching_report payload
// verified 2026-05-30 (shape shared field-for-field with CoachingReport).
function backendPayload(): Record<string, unknown> {
  return {
    driver_id: "sarah-reynolds-britcar-2026",
    corners: [
      {
        name: "Turn 1 Hairpin",
        sector: 1,
        current_delta_s: 0.248,
        recommendation: "Trail-brake later by ~0.15s into Turn 1 Hairpin.",
        citations: [
          { fia_article: "Appendix L", coa_section: "coa_sec_hand_controls" },
          { fia_article: "Appendix L", coa_section: "coa_sec_simultaneity" },
        ],
        reasoning_chain: [
          { step: "cause", label: "What caused the delta", content: "Lowest mean speed." },
          { step: "evidence", label: "Evidence", content: "Telemetry mini-sector 1." },
        ],
      },
    ],
    tuning_delta: {
      parameter: "brake_bias",
      current: 58.0,
      recommended: 58.0,
      unit: "%",
      citation: { fia_article: "Appendix L", coa_section: "coa_sec_hand_controls" },
    },
    forecast: [{ sector_idx: 0, mean: 57.1992, low: 54.2114, high: 58.0262 }],
    audit: {
      verdict: "flag",
      reasoning_trace: ["Rule bicycle_kinematic_break fired on step 4."],
      audit_id: "2e847867b2c34fb8abbc1b5568526090",
      flagged_concerns: ["Bicycle-model kinematic break at step 4."],
      blocked_recommendations: [],
    },
    provenance: {
      model_versions: {
        granite_docling: "ibm-granite/granite-docling-258M",
        granite_vision: "ibm-granite/granite-vision-3.2-2b",
        granite_ttm: "ibm-granite/granite-timeseries-ttm-r2",
        granite_instruct: "ibm-granite/granite-4.0-8b-instruct",
        granite_guardian: "ibm-granite/granite-guardian-4.1",
      },
      commit_sha: "container",
      generated_at_iso: "2026-05-30T19:10:32+00:00",
    },
  };
}

describe("decodeCoachingReport (wave-69 live-backend wire-boundary decoder)", () => {
  it("decodes a valid backend payload and stamps narrative_source backend-live", () => {
    const r = decodeCoachingReport(backendPayload());
    expect(r).not.toBeNull();
    expect(r?.narrative_source).toBe("backend-live");
    expect(r?.driver_id).toBe("sarah-reynolds-britcar-2026");
    expect(r?.corners[0].current_delta_s).toBe(0.248);
    expect(r?.corners[0].citations[0].fia_article).toBe("Appendix L");
    expect(r?.corners[0].reasoning_chain?.[0]?.step).toBe("cause");
    expect(r?.tuning_delta.parameter).toBe("brake_bias");
    expect(r?.forecast[0].mean).toBeCloseTo(57.1992);
    expect(r?.provenance.model_versions.granite_instruct).toMatch(/granite-4/);
  });

  it("decodes the flag audit variant with flagged_concerns", () => {
    const r = decodeCoachingReport(backendPayload());
    expect(r?.audit.verdict).toBe("flag");
    if (r?.audit.verdict === "flag") {
      expect(r.audit.flagged_concerns.length).toBe(1);
    }
  });

  it("decodes approve + reject audit variants", () => {
    const approve = { ...backendPayload(), audit: { verdict: "approve", reasoning_trace: ["ok"], audit_id: "a" } };
    expect(decodeCoachingReport(approve)?.audit.verdict).toBe("approve");
    const reject = {
      ...backendPayload(),
      audit: { verdict: "reject", reasoning_trace: ["no"], blocked_recommendations: ["x"], audit_id: "b" },
    };
    expect(decodeCoachingReport(reject)?.audit.verdict).toBe("reject");
  });

  it("returns null on a non-object", () => {
    expect(decodeCoachingReport(null)).toBeNull();
    expect(decodeCoachingReport("nope")).toBeNull();
  });

  it("returns null when driver_id is missing", () => {
    const p = backendPayload();
    delete p.driver_id;
    expect(decodeCoachingReport(p)).toBeNull();
  });

  it("returns null when corners is empty", () => {
    expect(decodeCoachingReport({ ...backendPayload(), corners: [] })).toBeNull();
  });

  it("returns null on a malformed citation", () => {
    const p = backendPayload();
    (p.corners as Array<Record<string, unknown>>)[0].citations = [{ fia_article: "x" }];
    expect(decodeCoachingReport(p)).toBeNull();
  });

  it("returns null on a non-number forecast field", () => {
    expect(
      decodeCoachingReport({ ...backendPayload(), forecast: [{ sector_idx: 0, mean: "x", low: 1, high: 2 }] }),
    ).toBeNull();
  });

  it("returns null on an empty forecast (no Math.min(...[]) = Infinity render)", () => {
    expect(decodeCoachingReport({ ...backendPayload(), forecast: [] })).toBeNull();
  });

  it("returns null when an audit verdict is unknown", () => {
    expect(
      decodeCoachingReport({ ...backendPayload(), audit: { verdict: "maybe", reasoning_trace: [], audit_id: "z" } }),
    ).toBeNull();
  });

  it("returns null when tuning_delta citation is missing", () => {
    const p = backendPayload();
    delete (p.tuning_delta as Record<string, unknown>).citation;
    expect(decodeCoachingReport(p)).toBeNull();
  });
});
