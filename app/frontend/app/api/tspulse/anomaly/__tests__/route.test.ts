import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../route";

const mockRequest = () => new Request("https://apex-one-black.vercel.app/api/tspulse/anomaly");

describe("/api/tspulse/anomaly wave-46 Phase 4.4 TSPulse swap-point", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 200 with canned-fallback engine + anomaly state (default no env flag)", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      engine: string;
      state: { status: string; window_index?: number; affected_bands?: ReadonlyArray<string> };
      swap_point: string;
    };
    expect(data.engine).toBe("tspulse-v7-canned-fallback");
    expect(data.state.status).toBe("anomaly");
    expect(data.state.window_index).toBe(18);
    expect(data.state.affected_bands).toEqual(["mid", "high"]);
    expect(data.swap_point).toMatch(/Vinh M3-V7/);
  });

  it("ships X-Apex-Tspulse-Swap-Point + X-Apex-Tspulse-Engine headers", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.headers.get("X-Apex-Tspulse-Swap-Point")).toBe("vinh-m3-v7-tspulse-anomaly");
    expect(res.headers.get("X-Apex-Tspulse-Engine")).toBe("tspulse-v7-canned-fallback");
  });

  it("stays canned when env flag on but base URL unset (misconfig safety)", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_TSPULSE", "1");
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    const data = (await res.json()) as { engine: string };
    expect(data.engine).toBe("tspulse-v7-canned-fallback");
  });

  it("preserves the backend's honest engine label (does NOT relabel a stub as real)", async () => {
    // Wave-72 honesty fix: the deployed backend returns engine "tspulse-stub"
    // when APEX_ENABLE_TSPULSE is off. The frontend must surface that stub
    // label, not overwrite it with "tspulse-v7-real" (which presented a stub
    // as live). Verify both the stub label and the real-head label pass
    // through unchanged.
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_TSPULSE", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          engine: "tspulse-stub",
          compute_ms: 99,
          state: { status: "clean", window_index: 22, score: 0.12, threshold_p95: 0.732, detection_ms: 12 },
          swap_point: "real swap-point payload",
        }),
        { status: 200 },
      ),
    );
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    const data = (await res.json()) as { engine: string; state: { status: string; window_index?: number } };
    expect(data.engine).toBe("tspulse-stub");
    expect(data.state.status).toBe("clean");
    expect(data.state.window_index).toBe(22);
    expect(res.headers.get("X-Apex-Tspulse-Engine")).toBe("tspulse-stub");
  });

  it("passes through the real polyphase-head engine label when the backend ran it", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_TSPULSE", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          engine: "tspulse-r1-anomaly",
          compute_ms: 21,
          state: { status: "anomaly", window_index: 18, score: 0.84, threshold_p95: 0.732, detection_ms: 21 },
          swap_point: "real swap-point payload",
        }),
        { status: 200 },
      ),
    );
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    const data = (await res.json()) as { engine: string };
    expect(data.engine).toBe("tspulse-r1-anomaly");
    expect(res.headers.get("X-Apex-Tspulse-Engine")).toBe("tspulse-r1-anomaly");
  });

  it("falls back to canned when env flag on + base URL set + upstream 5xx", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_TSPULSE", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("upstream down", { status: 503 }));
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string; state: { status: string } };
    expect(data.engine).toBe("tspulse-v7-canned-fallback");
    expect(data.state.status).toBe("anomaly");
  });

  it("falls back to canned when env flag on + base URL set + fetch throws", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_TSPULSE", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ENOTFOUND vinh.example"));
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string };
    expect(data.engine).toBe("tspulse-v7-canned-fallback");
  });
});
