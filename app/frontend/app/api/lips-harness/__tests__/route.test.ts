import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../route";

const mockRequest = () => new Request("https://apex-one-black.vercel.app/api/lips-harness");

describe("/api/lips-harness V15 LIPS swap-point stub", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 200 with canned-fallback engine + 4 ablation rows + seed 42 (default no env flag)", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      engine: string;
      rows: ReadonlyArray<{ configuration: string }>;
      dataset: string;
      seed: number;
      swap_point: string;
    };
    expect(data.engine).toBe("lips-v15-canned-fallback");
    expect(data.rows).toHaveLength(4);
    expect(data.seed).toBe(42);
    expect(data.dataset).toMatch(/Hamilton/);
    expect(data.swap_point).toMatch(/Vinh M3-V15/);
  });

  it("ships X-Apex-Lips-Swap-Point + X-Apex-Lips-Engine headers", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.headers.get("X-Apex-Lips-Swap-Point")).toBe("vinh-m3-v15-lips-4-axis");
    expect(res.headers.get("X-Apex-Lips-Engine")).toBe("lips-v15-canned-fallback");
  });

  it("rows cover the canonical 4-axis ablation order (zero-shot -> soft-loss -> hard projection -> full 3-track + 8-tier)", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    const data = (await res.json()) as { rows: ReadonlyArray<{ configuration: string }> };
    expect(data.rows[0].configuration).toMatch(/Zero-shot/);
    expect(data.rows[3].configuration).toMatch(/Full 3-track ensemble \+ 8-tier physics/);
  });

  it("stays canned when env flag on but base URL unset (misconfig safety)", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V15", "1");
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    const data = (await res.json()) as { engine: string };
    expect(data.engine).toBe("lips-v15-canned-fallback");
  });

  it("returns real engine when env flag on + base URL set + upstream OK", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V15", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          engine: "will-be-overwritten",
          rows: [
            { configuration: "Real row 1", lap_time_mae_s: 17.5, physics_violation_rate: 0, guardian_approve_pct: 95, inference_latency_ms: 1200 },
          ],
          dataset: "FastF1 real",
          seed: 7,
          compute_ms: 99,
          swap_point: "real swap-point payload",
        }),
        { status: 200 },
      ),
    );
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    const data = (await res.json()) as { engine: string; rows: ReadonlyArray<unknown>; seed: number };
    expect(data.engine).toBe("lips-v15-staged");
    expect(data.rows).toHaveLength(1);
    expect(data.seed).toBe(7);
    expect(res.headers.get("X-Apex-Lips-Engine")).toBe("lips-v15-staged");
  });

  it("falls back to canned when env flag on + base URL set + upstream 5xx", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V15", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("upstream down", { status: 503 }));
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string; rows: ReadonlyArray<unknown> };
    expect(data.engine).toBe("lips-v15-canned-fallback");
    expect(data.rows).toHaveLength(4);
  });

  it("falls back to canned when env flag on + base URL set + fetch throws", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V15", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ENOTFOUND vinh.example"));
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string };
    expect(data.engine).toBe("lips-v15-canned-fallback");
  });
});
