import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "../route";

// The route is a transparent stream-proxy: it checks the multipart
// content-type + body presence, streams the body to the backend, and decodes
// the response. So the test only needs a multipart content-type + any body
// (no FormData round-trip), which keeps it env-agnostic. The backend forward
// is mocked.

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

const URL = "https://apex-one-black.vercel.app/api/coaching/analyze-upload";

function multipartReq(): Request {
  return new Request(URL, {
    method: "POST",
    headers: { "content-type": "multipart/form-data; boundary=----apextest" },
    body: '------apextest\r\nContent-Disposition: form-data; name="telemetry"; filename="t.csv"\r\n\r\nt,v\r\n1,2\r\n------apextest--\r\n',
  });
}

function nonMultipartReq(): Request {
  return new Request(URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
}

function stubFetch(impl: () => Promise<Response> | Response): void {
  vi.stubGlobal("fetch", vi.fn(impl));
}

describe("/api/coaching/analyze-upload wave-74 live-backend upload proxy", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns ok:true backend-live with a decoded report when the backend accepts the upload", async () => {
    stubFetch(
      () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({ coaching_report: coachingReport(), trace: [], swap_point: "x" }),
        }) as unknown as Response,
    );
    const res = await POST(multipartReq());
    expect(res.status).toBe(200);
    const data = (await res.json()) as { ok: boolean; source: string; report?: { narrative_source?: string } };
    expect(data.ok).toBe(true);
    expect(data.source).toBe("backend-live");
    expect(data.report?.narrative_source).toBe("backend-live");
  });

  it("returns ok:false bad-request when the request is not multipart", async () => {
    const res = await POST(nonMultipartReq());
    const data = (await res.json()) as { ok: boolean; source: string };
    expect(data.ok).toBe(false);
    expect(data.source).toBe("bad-request");
  });

  it("returns ok:false backend-error on a non-200 (e.g. 415 pre-bridge, or 422 undetermined gate)", async () => {
    stubFetch(() => ({ ok: false, status: 415, json: async () => ({}) }) as unknown as Response);
    const res = await POST(multipartReq());
    const data = (await res.json()) as { ok: boolean; source: string; status?: number };
    expect(data.ok).toBe(false);
    expect(data.source).toBe("backend-error");
    expect(data.status).toBe(415);
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
    const res = await POST(multipartReq());
    const data = (await res.json()) as { ok: boolean; source: string };
    expect(data.ok).toBe(false);
    expect(data.source).toBe("decode-error");
  });

  it("returns ok:false upstream-error when the backend fetch throws", async () => {
    stubFetch(() => Promise.reject(new Error("ECONNREFUSED")));
    const res = await POST(multipartReq());
    const data = (await res.json()) as { ok: boolean; source: string };
    expect(data.ok).toBe(false);
    expect(data.source).toBe("upstream-error");
  });
});
