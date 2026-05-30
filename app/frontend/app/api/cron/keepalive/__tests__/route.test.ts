// @vitest-environment node
//
// The route uses fetch + Response.json on the Node runtime; the node test
// environment matches production and avoids jsdom fetch/Response quirks.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../route";

function req(authHeader?: string): Request {
  return new Request("https://apex-one-black.vercel.app/api/cron/keepalive", {
    headers: authHeader ? { authorization: authHeader } : {},
  });
}

function stubFetchOk(): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, status: 200 }) as unknown as Response),
  );
}

describe("/api/cron/keepalive wave-77 HF Space keep-alive", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("pings the backend and reports healthz ok (no CRON_SECRET set)", async () => {
    stubFetchOk();
    const res = await GET(req());
    expect(res.status).toBe(200);
    const data = (await res.json()) as { healthz: string; orchestration: string; pinged: string };
    expect(data.healthz).toBe("ok");
    expect(data.orchestration).toBe("ok");
    expect(data.pinged).toContain("ssookra-apex-backend.hf.space");
  });

  it("returns 401 when CRON_SECRET is set and the Authorization header is wrong", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    stubFetchOk();
    const res = await GET(req("Bearer nope"));
    expect(res.status).toBe(401);
  });

  it("runs when CRON_SECRET is set and the Authorization header matches", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    stubFetchOk();
    const res = await GET(req("Bearer s3cret"));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { healthz: string };
    expect(data.healthz).toBe("ok");
  });
});
