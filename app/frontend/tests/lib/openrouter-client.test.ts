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
});
