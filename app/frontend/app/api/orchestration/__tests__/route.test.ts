import { describe, expect, it } from "vitest";

import { GET } from "../route";

const mockRequest = () => new Request("https://apex-one-black.vercel.app/api/orchestration");

describe("/api/orchestration V14 LangGraph swap-point stub", () => {
  it("returns 200 with canned-fallback engine + 6 nodes + total_ms sum", async () => {
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

  it("ships X-Apex-Orchestration-Swap-Point header", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.headers.get("X-Apex-Orchestration-Swap-Point")).toBe("vinh-m3-v14-langgraph");
  });
});
