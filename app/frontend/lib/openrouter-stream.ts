"use client";

/**
 * useOpenRouterStream: client-side React hook wrapping the SSE-style
 * streaming response from `/api/openrouter-stream` (Next.js API route
 * that proxies to OpenRouter with stream:true; Stream M.3 spec
 * handoff extension for the streaming-response variant).
 *
 * Wave-42 Lane F.D close-out per docs/vinh-phase-1-handoff.md Q3
 * Phase 1 task ownership split (Stephen owns 1.7 OpenRouter API
 * plumbing + 1.8 streaming-response handler). Hook surface returns a
 * discriminated-union state per the
 * `feedback_discriminated_unions_over_contradiction.md` rule.
 *
 * State machine:
 *   - idle: no prompt provided OR cleaned up after consumer reset
 *   - streaming: chunks arriving; `partial` accumulates
 *   - ready: stream done; `full` carries the complete response
 *   - error: fetch / decode failure; `message` carries the reason
 *
 * Monotonic generation-counter via useRef per wave-43 cascade-#12
 * silent-failure-hunter H-R2-1 close-out. Each effect run increments
 * `reqIdRef.current` + captures its own currentReqId; every await
 * boundary checks `reqIdRef.current !== currentReqId` before writing
 * state. This shape closes a real race that per-effect-local
 * `let cancelled = false` cannot: concurrent prompts (e.g. user
 * types "A" then immediately "B" before "A" effect cleanup fires)
 * race for the same setState. Monotonic counter ensures only the
 * latest-by-construction effect run writes state regardless of
 * fetch-resolution arrival order. The cleanup function still
 * increments the counter for parity with the prior per-effect-local
 * cleanup behavior; abort + clearTimeout still fire.
 *
 * Timeout: 60s default (LLM streaming latency higher than single-shot
 * critic; the streaming chunks accumulate over the full response so
 * the timeout caps end-to-end stream wall-clock not per-chunk).
 * Symbol.for sentinel identity for timeout-abort discrimination per
 * cascade-#11 NIT N1 pattern.
 *
 * Cleanup-abort uses string "hook-cleanup" reason (distinct from
 * timeout Symbol) so the catch block can discriminate genuine
 * timeout-error reporting from silent effect-cleanup abort per the
 * use-tri-agent-critic.ts pattern.
 */

import { useEffect, useRef, useState } from "react";

export type OpenRouterStreamState =
  | { readonly status: "idle" }
  | { readonly status: "streaming"; readonly partial: string }
  | { readonly status: "ready"; readonly full: string }
  | { readonly status: "error"; readonly message: string };

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_ENDPOINT = "/api/openrouter-stream";
const TIMEOUT_REASON: symbol = Symbol.for("apex.openrouter-stream.timeout");

export interface OpenRouterStreamOptions {
  readonly endpoint?: string;
  readonly timeoutMs?: number;
}

export function useOpenRouterStream(
  prompt: string | null,
  options: OpenRouterStreamOptions = {},
): OpenRouterStreamState {
  const endpoint = options.endpoint ?? DEFAULT_ENDPOINT;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const [state, setState] = useState<OpenRouterStreamState>({ status: "idle" });
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (prompt === null) {
      // Wave-42 cascade-#8 close-out: queueMicrotask deferral instead of
      // synchronous setState inside the effect body, per the use-tri-
      // agent-critic.ts post-cascade-#11 pattern. Synchronous setState
      // in effect triggers React 19 + Next.js 16 ESLint
      // react-hooks/set-state-in-effect HARD error.
      queueMicrotask(() => {
        setState((prev) => (prev.status === "idle" ? prev : { status: "idle" }));
      });
      return;
    }

    reqIdRef.current += 1;
    const currentReqId = reqIdRef.current;
    queueMicrotask(() => {
      if (reqIdRef.current !== currentReqId) return;
      setState({ status: "streaming", partial: "" });
    });

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(TIMEOUT_REASON), timeoutMs);

    void (async () => {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        });

        if (reqIdRef.current !== currentReqId) return;

        if (!response.ok) {
          const errorBody = await response.text().catch(() => "<no body>");
          if (reqIdRef.current !== currentReqId) return;
          setState({
            status: "error",
            message: `apex.openrouter-stream: ${response.status} ${response.statusText}; body=${errorBody}`,
          });
          return;
        }

        if (response.body === null) {
          setState({
            status: "error",
            message: "apex.openrouter-stream: response body is null; cannot stream.",
          });
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulator = "";

        while (true) {
          const { done, value } = await reader.read();
          if (reqIdRef.current !== currentReqId) {
            await reader.cancel().catch(() => undefined);
            return;
          }
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulator += chunk;
          setState({ status: "streaming", partial: accumulator });
        }

        const finalChunk = decoder.decode();
        if (finalChunk.length > 0) accumulator += finalChunk;

        if (reqIdRef.current !== currentReqId) return;
        setState({ status: "ready", full: accumulator });
      } catch (err) {
        if (reqIdRef.current !== currentReqId) return;
        if (err instanceof DOMException && err.name === "AbortError") {
          const isTimeout = controller.signal.reason === TIMEOUT_REASON;
          if (isTimeout) {
            setState({
              status: "error",
              message: `apex.openrouter-stream: stream timed out after ${timeoutMs / 1000}s. Consider raising OpenRouterStreamOptions.timeoutMs.`,
            });
          }
          // Non-timeout abort = effect cleanup or hook unmount; silent.
          return;
        }
        const message = err instanceof Error ? err.message : String(err);
        setState({ status: "error", message: `apex.openrouter-stream: ${message}` });
      } finally {
        clearTimeout(timeoutHandle);
      }
    })();

    return () => {
      // Wave-43 D2.1: increment reqIdRef so the next effect run + any
      // still-in-flight awaits from this run see the staleness check
      // diverge from currentReqId. AbortController + clearTimeout still
      // fire for fetch cancel + timer cleanup.
      reqIdRef.current += 1;
      clearTimeout(timeoutHandle);
      controller.abort("hook-cleanup");
    };
  }, [prompt, endpoint, timeoutMs]);

  return state;
}
