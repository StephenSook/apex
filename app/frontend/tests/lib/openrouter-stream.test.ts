import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useOpenRouterStream } from "../../lib/openrouter-stream";

function makeStreamingResponse(chunks: ReadonlyArray<string>, status = 200): Response {
  const encoder = new TextEncoder();
  let idx = 0;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (idx >= chunks.length) {
        controller.close();
        return;
      }
      const chunk = chunks[idx++];
      controller.enqueue(encoder.encode(chunk));
      await new Promise((resolve) => setTimeout(resolve, 10));
    },
  });
  return new Response(stream, { status });
}

describe("useOpenRouterStream", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("idle state when prompt is null", () => {
    const { result } = renderHook(() => useOpenRouterStream(null));
    expect(result.current).toEqual({ status: "idle" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("streaming: accumulates chunks then transitions to ready", async () => {
    fetchMock.mockResolvedValueOnce(
      makeStreamingResponse(["Hello ", "from ", "OpenRouter."]),
    );
    const { result } = renderHook(() =>
      useOpenRouterStream("test prompt", { endpoint: "/test" }),
    );

    await waitFor(
      () => expect(result.current.status).toBe("ready"),
      { timeout: 2000 },
    );
    if (result.current.status === "ready") {
      expect(result.current.full).toBe("Hello from OpenRouter.");
    } else {
      throw new Error(`expected ready; got ${result.current.status}`);
    }
  });

  it("error state on non-2xx response", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("internal server error", { status: 500 }),
    );
    const { result } = renderHook(() =>
      useOpenRouterStream("test", { endpoint: "/test" }),
    );

    await waitFor(
      () => expect(result.current.status).toBe("error"),
      { timeout: 2000 },
    );
    if (result.current.status === "error") {
      expect(result.current.message).toMatch(/500/);
    }
  });

  it("error state on null response body", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));
    const { result } = renderHook(() =>
      useOpenRouterStream("test", { endpoint: "/test" }),
    );

    await waitFor(
      () => expect(result.current.status).toBe("error"),
      { timeout: 2000 },
    );
    if (result.current.status === "error") {
      expect(result.current.message).toMatch(/null/i);
    }
  });

  it("error state on fetch network throw", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network down"));
    const { result } = renderHook(() =>
      useOpenRouterStream("test", { endpoint: "/test" }),
    );

    await waitFor(
      () => expect(result.current.status).toBe("error"),
      { timeout: 2000 },
    );
    if (result.current.status === "error") {
      expect(result.current.message).toMatch(/network down/);
    }
  });

  it("cleanup on prompt change cancels active stream silently", async () => {
    fetchMock.mockImplementation(
      () =>
        new Promise<Response>((resolve) =>
          setTimeout(() => resolve(makeStreamingResponse(["delayed"])), 200),
        ),
    );
    const { result, rerender } = renderHook(
      ({ prompt }: { prompt: string | null }) =>
        useOpenRouterStream(prompt, { endpoint: "/test" }),
      { initialProps: { prompt: "first" as string | null } },
    );

    // Initial streaming state set synchronously by effect entry.
    await waitFor(() => expect(result.current.status).toBe("streaming"));
    rerender({ prompt: null });

    // After rerender to null, hook returns idle without ever entering
    // ready/error from the cancelled first fetch.
    await waitFor(() => expect(result.current.status).toBe("idle"));
  });
});
