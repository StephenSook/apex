import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../route";

const mockRequest = () => new Request("https://apex-one-black.vercel.app/api/projector-stage-a");

describe("/api/projector-stage-a V12 Pacejka swap-point stub", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 200 with canned-fallback engine + 8 tiers (default no env flag)", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      engine: string;
      tiers: ReadonlyArray<unknown>;
      swap_point: string;
    };
    expect(data.engine).toBe("pacejka-v12-canned-fallback");
    expect(data.tiers).toHaveLength(8);
    expect(data.swap_point).toMatch(/Vinh M3-V12/);
  });

  it("ships X-Apex-Projector-Swap-Point + X-Apex-Projector-Engine headers", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.headers.get("X-Apex-Projector-Swap-Point")).toBe("vinh-m3-v12-pacejka-linearization");
    expect(res.headers.get("X-Apex-Projector-Engine")).toBe("pacejka-v12-canned-fallback");
  });

  it("stays canned when env flag on but base URL unset (misconfig safety)", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V12", "1");
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    const data = (await res.json()) as { engine: string };
    expect(data.engine).toBe("pacejka-v12-canned-fallback");
  });

  it("returns real engine when env flag on + base URL set + upstream OK", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V12", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          engine: "will-be-overwritten",
          compute_ms: 99,
          tiers: [{ tier: 0, name: "Real", residual_norm: 0.001, status: "converged" }],
          final_violation_count: 0,
          swap_point: "real swap-point payload",
        }),
        { status: 200 },
      ),
    );
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    const data = (await res.json()) as { engine: string; tiers: ReadonlyArray<unknown> };
    expect(data.engine).toBe("pacejka-v12-staged");
    expect(data.tiers).toHaveLength(1);
    expect(res.headers.get("X-Apex-Projector-Engine")).toBe("pacejka-v12-staged");
  });

  it("falls back to canned when env flag on + base URL set + upstream 5xx", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V12", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("upstream down", { status: 503 }));
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string; tiers: ReadonlyArray<unknown> };
    expect(data.engine).toBe("pacejka-v12-canned-fallback");
    expect(data.tiers).toHaveLength(8);
  });

  it("falls back to canned when env flag on + base URL set + fetch throws (network error)", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V12", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ENOTFOUND vinh.example"));
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string };
    expect(data.engine).toBe("pacejka-v12-canned-fallback");
  });
});
