import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../route";

const mockRequest = () => new Request("https://apex-one-black.vercel.app/api/projector-stage-b");

describe("/api/projector-stage-b V13 SCP 3-iterate swap-point stub", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 200 with canned-fallback engine + 3 iterates (default no env flag)", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      engine: string;
      iterates: ReadonlyArray<unknown>;
      final_residual: number;
      swap_point: string;
    };
    expect(data.engine).toBe("scp-v13-canned-fallback");
    expect(data.iterates).toHaveLength(3);
    expect(data.final_residual).toBeLessThan(0.01);
    expect(data.swap_point).toMatch(/Vinh M3-V13/);
  });

  it("ships X-Apex-Projector-Swap-Point + X-Apex-Projector-Engine headers", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.headers.get("X-Apex-Projector-Swap-Point")).toBe("vinh-m3-v13-scp-3-iterate");
    expect(res.headers.get("X-Apex-Projector-Engine")).toBe("scp-v13-canned-fallback");
  });

  it("stays canned when env flag on but base URL unset (misconfig safety)", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V13", "1");
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    const data = (await res.json()) as { engine: string };
    expect(data.engine).toBe("scp-v13-canned-fallback");
  });

  it("returns real engine when env flag on + base URL set + upstream OK", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V13", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          engine: "will-be-overwritten",
          compute_ms: 99,
          iterates: [{ iterate: 1, residual_norm: 0.001, trust_region_radius: 1.0, powell_rho: 0.99, status: "converged" }],
          final_residual: 0.001,
          swap_point: "real swap-point payload",
        }),
        { status: 200 },
      ),
    );
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    const data = (await res.json()) as { engine: string; iterates: ReadonlyArray<unknown> };
    expect(data.engine).toBe("scp-v13-staged");
    expect(data.iterates).toHaveLength(1);
    expect(res.headers.get("X-Apex-Projector-Engine")).toBe("scp-v13-staged");
  });

  it("falls back to canned when env flag on + base URL set + upstream 5xx", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V13", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("upstream down", { status: 503 }));
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string; iterates: ReadonlyArray<unknown> };
    expect(data.engine).toBe("scp-v13-canned-fallback");
    expect(data.iterates).toHaveLength(3);
  });

  it("falls back to canned when env flag on + base URL set + fetch throws (network error)", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V13", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ENOTFOUND vinh.example"));
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string };
    expect(data.engine).toBe("scp-v13-canned-fallback");
  });
});
