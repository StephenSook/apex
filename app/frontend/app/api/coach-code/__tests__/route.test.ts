import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "../route";

function mockRequest(body: unknown): Request {
  return new Request("https://apex-one-black.vercel.app/api/coach-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/coach-code wave-46 Phase 6.2 Granite 4.1 8B code-feedback", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 400 invalid_json when body is not JSON", async () => {
    const req = new Request("https://apex-one-black.vercel.app/api/coach-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "<not-json>",
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("invalid_json");
  });

  it("returns 400 missing_code when code field absent or empty", async () => {
    const res = await POST(mockRequest({ question: "explain this" }) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("missing_code");
  });

  it("returns 400 missing_code when code is whitespace-only", async () => {
    const res = await POST(mockRequest({ code: "   ", question: "explain" }) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("missing_code");
  });

  it("returns 400 missing_question when question field absent", async () => {
    const res = await POST(mockRequest({ code: "function foo() {}" }) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("missing_question");
  });

  it("returns 200 canned-fallback when OPENROUTER_API_KEY unset (default test env)", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");
    const res = await POST(
      mockRequest({ code: "function aggregate(rows) { return rows; }", question: "is this efficient?" }) as unknown as Parameters<typeof POST>[0],
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      engine: string;
      feedback: string;
      model: string;
      prompt_tokens: number;
      completion_tokens: number;
    };
    expect(data.engine).toBe("coach-code-canned-fallback");
    expect(data.feedback.length).toBeGreaterThan(100);
    expect(data.feedback).toMatch(/APEX three-layer architecture/);
    expect(data.model).toBe("ibm-granite/granite-4.1-8b-instruct");
    expect(data.prompt_tokens).toBe(0);
    expect(res.headers.get("X-Apex-Coach-Code-Engine")).toBe("coach-code-canned-fallback");
  });

  it("scrubs invented FIA Article numbers from canned-fallback feedback", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");
    const res = await POST(
      mockRequest({ code: "// telemetry code", question: "regulatory anchor check" }) as unknown as Parameters<typeof POST>[0],
    );
    const data = (await res.json()) as { feedback: string };
    expect(data.feedback).not.toMatch(/FIA Article \d+/i);
    expect(data.feedback).toMatch(/FIA Appendix L per the published revision/);
  });
});
