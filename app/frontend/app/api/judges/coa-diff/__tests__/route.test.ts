import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../route";

const mockRequest = () => new Request("https://apex-one-black.vercel.app/api/judges/coa-diff");

describe("/api/judges/coa-diff wave-46 Phase 3.5 COA diff swap-point", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 200 with canned-fallback engine + permitted/blocked verdicts (default no env flag)", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      engine: string;
      scenario: string;
      permitted: { coa_overlap_flag: number; verdict: string };
      blocked: { coa_overlap_flag: number; verdict: string };
      swap_point: string;
    };
    expect(data.engine).toBe("coa-diff-canned-fallback");
    expect(data.permitted.coa_overlap_flag).toBe(1);
    expect(data.permitted.verdict).toBe("feasible");
    expect(data.blocked.coa_overlap_flag).toBe(0);
    expect(data.blocked.verdict).toBe("violation");
    expect(data.scenario).toMatch(/Sarah Reynolds/);
    expect(data.swap_point).toMatch(/Vinh M3-V14/);
  });

  it("ships X-Apex-Orchestration-Swap-Point + X-Apex-Coa-Diff-Engine headers", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.headers.get("X-Apex-Orchestration-Swap-Point")).toBe("vinh-m3-v14-langgraph");
    expect(res.headers.get("X-Apex-Coa-Diff-Engine")).toBe("coa-diff-canned-fallback");
  });

  it("permitted verdict trace has zero residuals (converged); blocked trace flags the simultaneity gate violation", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    const data = (await res.json()) as {
      permitted: { projection_trace: ReadonlyArray<{ status: string; stage: string }> };
      blocked: { projection_trace: ReadonlyArray<{ status: string; stage: string }> };
    };
    expect(data.permitted.projection_trace.every((entry) => entry.status === "converged")).toBe(true);
    const gateEntry = data.blocked.projection_trace.find((entry) => entry.stage.includes("simultaneity gate"));
    expect(gateEntry?.status).toBe("violation");
  });

  it("stays canned when V14 env flag on but base URL unset (misconfig safety)", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V14", "1");
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    const data = (await res.json()) as { engine: string };
    expect(data.engine).toBe("coa-diff-canned-fallback");
  });

  it("returns real engine when V14 env flag on + base URL set + upstream OK", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V14", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          engine: "will-be-overwritten",
          compute_ms: 99,
          scenario: "real scenario",
          permitted: {
            coa_overlap_flag: 1,
            verdict: "feasible",
            headline: "real permitted",
            body: "real permitted body",
            projection_trace: [{ stage: "real stage", residual_norm: 0.001, status: "converged" }],
          },
          blocked: {
            coa_overlap_flag: 0,
            verdict: "violation",
            headline: "real blocked",
            body: "real blocked body",
            projection_trace: [{ stage: "real gate", residual_norm: 0.5, status: "violation" }],
          },
          swap_point: "real swap-point payload",
        }),
        { status: 200 },
      ),
    );
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    const data = (await res.json()) as { engine: string; scenario: string };
    expect(data.engine).toBe("coa-diff-real");
    expect(data.scenario).toBe("real scenario");
    expect(res.headers.get("X-Apex-Coa-Diff-Engine")).toBe("coa-diff-real");
  });

  it("falls back to canned when V14 env flag on + base URL set + upstream 5xx", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V14", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("upstream down", { status: 503 }));
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string; scenario: string };
    expect(data.engine).toBe("coa-diff-canned-fallback");
    expect(data.scenario).toMatch(/Sarah Reynolds/);
  });
});
