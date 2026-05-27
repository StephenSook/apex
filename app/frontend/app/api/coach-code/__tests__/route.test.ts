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

  // Wave-46 C13 R4 OpenRouter throw-branch fallback tests per OVERRIDE-
  // comparator 14-test-file quality bar. Mock openRouterChatCompletion
  // to throw; verify route falls back to canned-fallback engine + emits
  // X-Apex-Coach-Code-Fallback header.

  it("falls back to canned when OpenRouter throws + emits Fallback header", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "sk-test-mock-key");
    const openrouterMod = await import("../../../../lib/openrouter-client");
    vi.spyOn(openrouterMod, "openRouterChatCompletion").mockRejectedValue(
      new Error("ECONNREFUSED openrouter.ai"),
    );

    const res = await POST(
      mockRequest({ code: "// telemetry code", question: "anything" }) as unknown as Parameters<typeof POST>[0],
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string; feedback: string };
    expect(data.engine).toBe("coach-code-canned-fallback");
    expect(data.feedback).toMatch(/APEX three-layer architecture/);
    expect(res.headers.get("X-Apex-Coach-Code-Fallback")).toBe("openrouter-error");
  });

  it("emits retry_count = 0 + empty violation_summary when canned-fallback fires", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");
    const res = await POST(
      mockRequest({ code: "// telemetry code", question: "test" }) as unknown as Parameters<typeof POST>[0],
    );
    const data = (await res.json()) as {
      retry_count: number;
      violation_summary: ReadonlyArray<ReadonlyArray<string>>;
    };
    expect(data.retry_count).toBe(0);
    expect(data.violation_summary).toEqual([[]]);
  });

  it("returns scrubbed feedback + retry_count = 0 on clean OpenRouter response (no violations detected)", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "sk-test-mock-key");
    const openrouterMod = await import("../../../../lib/openrouter-client");
    vi.spyOn(openrouterMod, "openRouterChatCompletion").mockResolvedValue({
      id: "test",
      model: "ibm-granite/granite-4.1-8b-instruct",
      created: Math.floor(Date.now() / 1000),
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "Aggregate the telemetry at 1 Hz per Stage 1. Cite FIA Appendix L per the published revision.",
          },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 142, completion_tokens: 67, total_tokens: 209 },
    });

    const res = await POST(
      mockRequest({ code: "fn x() {}", question: "any" }) as unknown as Parameters<typeof POST>[0],
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      engine: string;
      retry_count: number;
      violation_summary: ReadonlyArray<ReadonlyArray<string>>;
      feedback: string;
    };
    expect(data.engine).toBe("coach-code-real");
    expect(data.retry_count).toBe(0);
    expect(data.violation_summary).toEqual([[]]);
    expect(data.feedback).toMatch(/Aggregate the telemetry/);
    expect(res.headers.get("X-Apex-Coach-Code-Retry-Count")).toBe("0");
  });
});
