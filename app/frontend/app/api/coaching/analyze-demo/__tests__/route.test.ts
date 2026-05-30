import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "../route";

function coachingReport(): Record<string, unknown> {
  return {
    driver_id: "sarah-reynolds-britcar-2026",
    corners: [
      {
        name: "Turn 1 Hairpin",
        sector: 1,
        current_delta_s: 0.248,
        recommendation: "Trail-brake later.",
        citations: [{ fia_article: "Appendix L", coa_section: "coa_sec_hand_controls" }],
        reasoning_chain: [{ step: "cause", label: "Why", content: "Low speed." }],
      },
    ],
    tuning_delta: {
      parameter: "brake_bias",
      current: 58,
      recommended: 58,
      unit: "%",
      citation: { fia_article: "Appendix L", coa_section: "coa_sec_hand_controls" },
    },
    forecast: [{ sector_idx: 0, mean: 57.2, low: 54.2, high: 58.0 }],
    audit: { verdict: "flag", reasoning_trace: ["t"], flagged_concerns: ["c"], audit_id: "a1" },
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

function req(): Request {
  return new Request("https://apex-one-black.vercel.app/api/coaching/analyze-demo", {
    method: "POST",
  });
}

function stubFetch(impl: () => Promise<Response> | Response): void {
  vi.stubGlobal("fetch", vi.fn(impl));
}

describe("/api/coaching/analyze-demo wave-69 live-backend canonical demo", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns ok:true backend-live with a decoded report on a valid backend payload", async () => {
    stubFetch(
      () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({ coaching_report: coachingReport(), trace: [], swap_point: "x" }),
        }) as unknown as Response,
    );
    const res = await POST(req());
    expect(res.status).toBe(200);
    const data = (await res.json()) as { ok: boolean; source: string; report?: { narrative_source?: string } };
    expect(data.ok).toBe(true);
    expect(data.source).toBe("backend-live");
    expect(data.report?.narrative_source).toBe("backend-live");
  });

  it("returns ok:false backend-error when the backend responds non-200", async () => {
    stubFetch(() => ({ ok: false, status: 503, json: async () => ({}) }) as unknown as Response);
    const res = await POST(req());
    const data = (await res.json()) as { ok: boolean; source: string };
    expect(data.ok).toBe(false);
    expect(data.source).toBe("backend-error");
  });

  it("returns ok:false decode-error when the backend payload is malformed", async () => {
    stubFetch(
      () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({ coaching_report: { driver_id: "x", corners: [] } }),
        }) as unknown as Response,
    );
    const res = await POST(req());
    const data = (await res.json()) as { ok: boolean; source: string };
    expect(data.ok).toBe(false);
    expect(data.source).toBe("decode-error");
  });

  it("returns ok:false upstream-error when the backend fetch throws", async () => {
    stubFetch(() => Promise.reject(new Error("ECONNREFUSED")));
    const res = await POST(req());
    const data = (await res.json()) as { ok: boolean; source: string };
    expect(data.ok).toBe(false);
    expect(data.source).toBe("upstream-error");
  });
});
