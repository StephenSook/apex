import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../route";

const mockRequest = () => new Request("https://apex-one-black.vercel.app/api/orchestration");

describe("/api/orchestration V14 LangGraph swap-point stub", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 200 with canned-fallback engine + 6 nodes + total_ms sum (default no env flag)", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      engine: string;
      trace_id: string;
      nodes: ReadonlyArray<{ elapsed_ms: number; status: string }>;
      total_ms: number;
      swap_point: string;
    };
    expect(data.engine).toBe("langgraph-v14-canned-fallback");
    expect(data.nodes).toHaveLength(6);
    expect(data.trace_id).toMatch(/^canned-/);
    const expectedTotal = data.nodes.reduce((s, n) => s + n.elapsed_ms, 0);
    expect(data.total_ms).toBe(expectedTotal);
    expect(data.swap_point).toMatch(/Vinh M3-V14/);
  });

  it("ships X-Apex-Orchestration-Swap-Point + X-Apex-Orchestration-Engine headers", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.headers.get("X-Apex-Orchestration-Swap-Point")).toBe("vinh-m3-v14-langgraph");
    expect(res.headers.get("X-Apex-Orchestration-Engine")).toBe("langgraph-v14-canned-fallback");
  });

  it("stays canned when env flag on but base URL unset (misconfig safety)", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V14", "1");
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    const data = (await res.json()) as { engine: string };
    expect(data.engine).toBe("langgraph-v14-canned-fallback");
  });

  it("returns real engine when env flag on + base URL set + upstream OK", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V14", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          engine: "will-be-overwritten",
          trace_id: "real-abc",
          nodes: [{ id: "ingest", label: "Real ingest", status: "completed", elapsed_ms: 10 }],
          total_ms: 10,
          swap_point: "real swap-point payload",
        }),
        { status: 200 },
      ),
    );
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    const data = (await res.json()) as { engine: string; trace_id: string; nodes: ReadonlyArray<unknown> };
    expect(data.engine).toBe("langgraph-v14-real");
    expect(data.trace_id).toBe("real-abc");
    expect(data.nodes).toHaveLength(1);
    expect(res.headers.get("X-Apex-Orchestration-Engine")).toBe("langgraph-v14-real");
  });

  it("falls back to canned when env flag on + base URL set + upstream 5xx", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V14", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("upstream down", { status: 503 }));
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string; nodes: ReadonlyArray<unknown> };
    expect(data.engine).toBe("langgraph-v14-canned-fallback");
    expect(data.nodes).toHaveLength(6);
  });

  it("falls back to canned when env flag on + base URL set + fetch throws", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_BACKEND_V14", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ENOTFOUND vinh.example"));
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string };
    expect(data.engine).toBe("langgraph-v14-canned-fallback");
  });
});
