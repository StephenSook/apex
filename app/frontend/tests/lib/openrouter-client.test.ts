import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { openRouterChatCompletion } from "../../lib/openrouter-client";

describe("openRouterChatCompletion", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.OPENROUTER_BASE_URL = "https://openrouter.example.com/api/v1";
    process.env.OPENROUTER_MODEL = "test-model";
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_BASE_URL;
    delete process.env.OPENROUTER_MODEL;
    delete process.env.OPENROUTER_HTTP_REFERER;
    delete process.env.OPENROUTER_X_TITLE;
  });

  it("happy path: 200 response returns parsed ChatCompletionResponse", async () => {
    const mockResponse = {
      id: "test-id",
      model: "test-model",
      created: 1234567890,
      choices: [
        {
          index: 0,
          message: { role: "assistant" as const, content: "test" },
          finish_reason: "stop" as const,
        },
      ],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    };
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );
    const result = await openRouterChatCompletion({
      messages: [{ role: "user", content: "test" }],
    });
    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("happy path: includes leaderboard headers when env vars set", async () => {
    process.env.OPENROUTER_HTTP_REFERER = "https://apex.race";
    process.env.OPENROUTER_X_TITLE = "APEX AI Race Engineer";
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "x",
          model: "test-model",
          created: 0,
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: "stub" },
              finish_reason: "stop",
            },
          ],
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        }),
        { status: 200 },
      ),
    );
    await openRouterChatCompletion({ messages: [{ role: "user", content: "x" }] });
    const callArgs = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const headers = callArgs?.headers as Record<string, string>;
    expect(headers["HTTP-Referer"]).toBe("https://apex.race");
    expect(headers["X-Title"]).toBe("APEX AI Race Engineer");
    expect(headers["Authorization"]).toBe("Bearer test-key");
  });

  it("5xx error: retries up to maxRetries5xx then throws", async () => {
    fetchMock.mockResolvedValue(new Response("server error", { status: 503 }));
    await expect(
      openRouterChatCompletion(
        { messages: [{ role: "user", content: "test" }] },
        { maxRetries5xx: 2 },
      ),
    ).rejects.toThrow(/503/);
    // 1 initial + 2 retries = 3 fetches
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("429 error: retries once with Retry-After header honored", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response("rate limited", {
          status: 429,
          headers: { "Retry-After": "1" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "ok",
            model: "test-model",
            created: 0,
            choices: [
              {
                index: 0,
                message: { role: "assistant", content: "ok" },
                finish_reason: "stop",
              },
            ],
            usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          }),
          { status: 200 },
        ),
      );
    const result = await openRouterChatCompletion({
      messages: [{ role: "user", content: "test" }],
    });
    expect(result.id).toBe("ok");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("429 error: only retries once even if second response is also 429", async () => {
    fetchMock.mockResolvedValue(
      new Response("rate limited", { status: 429, headers: { "Retry-After": "1" } }),
    );
    await expect(
      openRouterChatCompletion({ messages: [{ role: "user", content: "test" }] }),
    ).rejects.toThrow(/429/);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("missing API key: throws structured error before any fetch", async () => {
    delete process.env.OPENROUTER_API_KEY;
    await expect(
      openRouterChatCompletion({ messages: [{ role: "user", content: "test" }] }),
    ).rejects.toThrow(/OPENROUTER_API_KEY is required/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("missing model: throws structured error before any fetch", async () => {
    delete process.env.OPENROUTER_MODEL;
    await expect(
      openRouterChatCompletion({ messages: [{ role: "user", content: "test" }] }),
    ).rejects.toThrow(/OPENROUTER_MODEL is required/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("4xx (non-429): no retry; throws immediately", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("bad request", { status: 400 }),
    );
    await expect(
      openRouterChatCompletion({ messages: [{ role: "user", content: "test" }] }),
    ).rejects.toThrow(/400/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  // Wave-43 C2.10 expansion per D-041 close-out: decoder + retry-cancel
  // surface area not covered by the wave-42 baseline.

  it("D2.2 array-error-shape: 200 with raw.error as array surfaces first item.message", async () => {
    const errorResponse = {
      error: [{ message: "rate-limit downstream from provider" }],
    };
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(errorResponse), { status: 200 }),
    );
    await expect(
      openRouterChatCompletion({ messages: [{ role: "user", content: "test" }] }),
    ).rejects.toThrow(/rate-limit downstream from provider/i);
  });

  it("D2.2 null-error-shape: 200 with raw.error === null passes through to id/choices validation", async () => {
    const responseWithNullError = {
      error: null,
      id: "test-id",
      model: "test-model",
      created: 1234567890,
      choices: [
        {
          index: 0,
          message: { role: "assistant" as const, content: "ok" },
          finish_reason: "stop" as const,
        },
      ],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    };
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(responseWithNullError), { status: 200 }),
    );
    const result = await openRouterChatCompletion({
      messages: [{ role: "user", content: "test" }],
    });
    expect(result.id).toBe("test-id");
    expect(result.choices[0].message.content).toBe("ok");
  });

  it("D2.4 missing usage field is accepted (usage marked optional)", async () => {
    const responseWithoutUsage = {
      id: "no-usage-id",
      model: "test-model",
      created: 1234567890,
      choices: [
        {
          index: 0,
          message: { role: "assistant" as const, content: "still works" },
          finish_reason: "stop" as const,
        },
      ],
    };
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(responseWithoutUsage), { status: 200 }),
    );
    const result = await openRouterChatCompletion({
      messages: [{ role: "user", content: "test" }],
    });
    expect(result.id).toBe("no-usage-id");
    expect(result.usage).toBeUndefined();
  });

  it("D2.8 consumer-signal abort propagates to fetch abort + throws", async () => {
    const controller = new AbortController();
    fetchMock.mockImplementationOnce(async (_url, init) => {
      // Simulate fetch hanging until signal aborts.
      return await new Promise<Response>((_resolve, reject) => {
        const signal = (init as RequestInit | undefined)?.signal;
        if (signal !== undefined && signal !== null) {
          signal.addEventListener("abort", () => {
            const reason = (signal as AbortSignal & { reason?: unknown }).reason;
            reject(new DOMException(String(reason ?? "aborted"), "AbortError"));
          });
        }
      });
    });
    const promise = openRouterChatCompletion(
      { messages: [{ role: "user", content: "test" }] },
      { signal: controller.signal },
    );
    setTimeout(() => controller.abort("consumer-cancel"), 10);
    await expect(promise).rejects.toThrow();
  });
});
