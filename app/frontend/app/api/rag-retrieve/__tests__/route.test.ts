import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "../route";

function mockRequest(body: unknown): Request {
  return new Request("https://apex-one-black.vercel.app/api/rag-retrieve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/rag-retrieve wave-46 Phase 4.5 Granite Embedding R2 swap-point", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 400 missing_query when 'query' field absent or empty", async () => {
    const res = await POST(mockRequest({}) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("missing_query");
  });

  it("returns 400 missing_query when 'query' is whitespace-only string", async () => {
    const res = await POST(mockRequest({ query: "   " }) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("missing_query");
  });

  it("returns 200 with canned-fallback engine + retrievals on corpus-matching query (default no env flag)", async () => {
    const res = await POST(mockRequest({ query: "what is APEX physics" }) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      engine: string;
      query: string;
      retrievals: ReadonlyArray<{ chunk: { id: string }; score: number }>;
      retriever_label: string;
      swap_point: string;
    };
    expect(data.engine).toBe("rag-v8-canned-fallback");
    expect(data.query).toBe("what is APEX physics");
    expect(data.retrievals.length).toBeGreaterThan(0);
    expect(data.retrievals.length).toBeLessThanOrEqual(3);
    expect(data.retriever_label).toMatch(/lexical/);
    expect(data.swap_point).toMatch(/Vinh M3-V8/);
  });

  it("ships X-Apex-Rag-Swap-Point + X-Apex-Rag-Engine headers", async () => {
    const res = await POST(mockRequest({ query: "physics projection projector tier" }) as unknown as Parameters<typeof POST>[0]);
    expect(res.headers.get("X-Apex-Rag-Swap-Point")).toBe("vinh-m3-v8-embedding-r2-rag");
    expect(res.headers.get("X-Apex-Rag-Engine")).toBe("rag-v8-canned-fallback");
  });

  it("stays canned when env flag on but base URL unset (misconfig safety)", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_RAG", "1");
    const res = await POST(mockRequest({ query: "physics projection projector tier" }) as unknown as Parameters<typeof POST>[0]);
    const data = (await res.json()) as { engine: string };
    expect(data.engine).toBe("rag-v8-canned-fallback");
  });

  it("returns real engine when env flag on + base URL set + upstream OK", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_RAG", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          engine: "will-be-overwritten",
          compute_ms: 99,
          query: "test",
          retrievals: [
            {
              chunk: { id: "real-1", source: "real-source", title: "Real Title", text: "real text" },
              score: 0.91,
            },
          ],
          retriever_label: "will-be-overwritten",
          swap_point: "real swap-point payload",
        }),
        { status: 200 },
      ),
    );
    const res = await POST(mockRequest({ query: "physics projection projector tier" }) as unknown as Parameters<typeof POST>[0]);
    const data = (await res.json()) as {
      engine: string;
      retrievals: ReadonlyArray<{ chunk: { id: string } }>;
      retriever_label: string;
    };
    expect(data.engine).toBe("rag-v8-real");
    expect(data.retrievals).toHaveLength(1);
    expect(data.retrievals[0].chunk.id).toBe("real-1");
    expect(data.retriever_label).toMatch(/Granite Embedding R2/);
    expect(res.headers.get("X-Apex-Rag-Engine")).toBe("rag-v8-real");
  });

  it("falls back to canned when env flag on + base URL set + upstream 5xx", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_REAL_RAG", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("upstream down", { status: 503 }));
    const res = await POST(mockRequest({ query: "physics projection projector tier" }) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string; retrievals: ReadonlyArray<unknown> };
    expect(data.engine).toBe("rag-v8-canned-fallback");
    expect(data.retrievals.length).toBeGreaterThan(0);
  });
});
