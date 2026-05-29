import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../route";

const mockRequest = () =>
  new Request("https://apex-one-black.vercel.app/api/observability/summary");

const LIVE_BODY = {
  service_name: "apex-backend",
  otel_enabled: true,
  otlp_active: true,
  exporter: "otlp",
  captured_at: 1748400000,
  total_requests: 42,
  status_class: { "2xx": 40, "3xx": 0, "4xx": 1, "5xx": 1 },
  by_route: { "/api/analyze": { count: 3, avg_ms: 1820.5 } },
  latency_ms: { p50: 120, p95: 5680, p99: 5680, window: 42 },
  uptime_s: 3601.2,
  eps_1m: 0.4,
  recent_traces: [
    {
      trace_id: "d82cb2fcf355dc40789106f673400d06",
      route: "/api/analyze",
      method: "POST",
      status: 200,
      duration_ms: 1820.5,
      ts: 1748399999,
    },
  ],
};

describe("/api/observability/summary wave-53 live telemetry proxy", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns awaiting-backend snapshot (200) when base URL unset", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string; total_requests: number };
    expect(data.engine).toBe("observability-awaiting-backend");
    expect(data.total_requests).toBe(0);
    expect(res.headers.get("X-Apex-Observability-Engine")).toBe(
      "observability-awaiting-backend",
    );
  });

  it("returns live snapshot when base URL set + upstream OK", async () => {
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(LIVE_BODY), { status: 200 }),
    );
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      engine: string;
      total_requests: number;
      latency_ms: { p95: number };
      recent_traces: ReadonlyArray<{ trace_id: string }>;
    };
    expect(data.engine).toBe("observability-live");
    expect(data.total_requests).toBe(42);
    expect(data.latency_ms.p95).toBe(5680);
    expect(data.recent_traces[0].trace_id).toBe("d82cb2fcf355dc40789106f673400d06");
    expect(res.headers.get("X-Apex-Observability-Engine")).toBe("observability-live");
  });

  it("falls back to awaiting-backend when upstream is not OK (5xx)", async () => {
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("backend cold", { status: 503 }),
    );
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string; total_requests: number };
    expect(data.engine).toBe("observability-awaiting-backend");
    expect(data.total_requests).toBe(0);
  });

  it("falls back to awaiting-backend when fetch throws (timeout/network)", async () => {
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ETIMEDOUT"));
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string };
    expect(data.engine).toBe("observability-awaiting-backend");
  });
});
