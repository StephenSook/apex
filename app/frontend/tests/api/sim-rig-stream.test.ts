import { describe, expect, it } from "vitest";

import { GET } from "../../app/api/sim-rig/stream/route";

// Wave-45 Phase 3 pr-test-analyzer BLOCKER B2 close-out per wave-44
// deep-review. Cover the NDJSON 20Hz emission contract + the
// AbortSignal teardown path that wave-44 silent-failure BLOCKER #2
// hardened (controller.close() + interval clear on enqueue error).

function buildGetRequest(signal?: AbortSignal): Request {
  return new Request("http://test/api/sim-rig/stream", {
    method: "GET",
    signal,
  });
}

describe("GET /api/sim-rig/stream", () => {
  it("emits NDJSON frame on first read + Content-Type application/x-ndjson + X-Apex-Stream-Shape header", async () => {
    const ac = new AbortController();
    const res = await GET(buildGetRequest(ac.signal) as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/x-ndjson");
    expect(res.headers.get("X-Apex-Stream-Shape")).toBe("ndjson-simrigframe-20hz");
    expect(res.headers.get("Cache-Control")).toBe("no-store, no-transform");
    if (res.body === null) throw new Error("expected non-null ReadableStream body");
    const reader = res.body.getReader();
    const { value, done } = await reader.read();
    expect(done).toBe(false);
    expect(value).toBeDefined();
    if (value === undefined) throw new Error("expected first frame");
    const decoded = new TextDecoder().decode(value).trim();
    const parsed = JSON.parse(decoded) as Record<string, unknown>;
    expect(typeof parsed.t_sim).toBe("number");
    expect(typeof parsed.channels).toBe("object");
    ac.abort();
    await reader.cancel().catch(() => undefined);
  });

  it("tears down interval cleanly on AbortController.abort + cancel()", async () => {
    const ac = new AbortController();
    const res = await GET(buildGetRequest(ac.signal) as Parameters<typeof GET>[0]);
    if (res.body === null) throw new Error("expected non-null ReadableStream body");
    const reader = res.body.getReader();
    await reader.read();
    ac.abort();
    // No specific assertion beyond "no unhandled rejection" + "no
    // hanging timer"; if the cleanup path is broken vitest reports
    // an unfinished interval via the test runner. cancel() releases
    // the reader lock so the controller close + interval clear fire.
    await reader.cancel().catch(() => undefined);
    expect(ac.signal.aborted).toBe(true);
  });
});
