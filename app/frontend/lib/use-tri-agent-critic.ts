/**
 * useTriAgentCriticVerdict: data-source-aware hook returning the wave-30
 * D-018 tri-agent Agent-as-Judge critic loop verdict panel for the
 * /judges + /analyze surfaces.
 *
 * Wave-40 Stream B.4 close-out + wave-41 Stream C hardening per the
 * wave-40 cold-review codex HIGH (live-mode loading-state reset on
 * source toggle) + silent-failure-hunter H-2 (logging gap +
 * unsafe-cast removal) + silent-failure-hunter H-3 (AbortController +
 * timeout). The hook lets consumers switch between mock fixtures +
 * the backend fetch via a single `dataSource` parameter.
 * TriAgentCriticPanel remains a pure UI component taking the
 * TriAgentVerdictPanel as a prop; this hook is the data-fetching seam.
 *
 * Discriminated-union state per the feedback_discriminated_unions_over_
 * contradiction memory rule:
 *   - loading: fetch in flight (live mode only; mock mode never enters)
 *   - ready: verdict panel available
 *   - error: fetch failed (live mode only); falls back to error state
 *
 * Live mode contract: GET /api/critic returns a JSON-encoded
 * TriAgentVerdictPanel. The wave-41 decoder at
 * `app/frontend/lib/api-decode.ts` validates the response shape at
 * parse time against the canonical TriAgentVerdictPanel positional-
 * binding invariant per types.ts (Physics at position 0, Pedagogy at
 * position 1, Guardian-Safety at position 2; runtime guard).
 *
 * Wave-41 Stream C hardening:
 *   - 10-second AbortController timeout on /api/critic fetch.
 *   - console.error with full context preservation on every error
 *     path (no silent failures).
 *   - Live-mode loading-state reset on source toggle: when source
 *     flips from "mock_*" to "live", state immediately resets to
 *     { status: "loading" } so the UI does not flash stale mock data
 *     during the fetch latency window.
 *   - Unsafe `as TriAgentVerdictPanel` cast replaced by
 *     decodeTriAgentVerdictPanel() from the wave-41 decoder.
 *   - Inline runtime guard removed (decoder handles it; single source
 *     of truth).
 */

"use client";

import { useEffect, useRef, useState } from "react";

import type { TriAgentVerdictPanel } from "../../shared/types";
import { decodeTriAgentVerdictPanel } from "./api-decode";
import { MOCK_TRI_AGENT_VERDICT, MOCK_TRI_AGENT_VERDICT_REJECT } from "./mocks/judges-mocks";

export type TriAgentDataSource = "mock_flag" | "mock_reject" | "live";

export type TriAgentVerdictState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly panel: TriAgentVerdictPanel }
  | { readonly status: "error"; readonly message: string };

const MOCK_FIXTURES: Readonly<Record<"mock_flag" | "mock_reject", TriAgentVerdictPanel>> = {
  mock_flag: MOCK_TRI_AGENT_VERDICT,
  mock_reject: MOCK_TRI_AGENT_VERDICT_REJECT,
};

const LIVE_FETCH_TIMEOUT_MS = 10_000;

/**
 * Return a TriAgentVerdictState based on the data source. Mock sources
 * resolve synchronously to the canonical fixtures. The live source
 * issues a GET /api/critic + parses the JSON response with a 10s
 * AbortController timeout + decoder-validated payload.
 */
export function useTriAgentCriticVerdict(source: TriAgentDataSource): TriAgentVerdictState {
  const [state, setState] = useState<TriAgentVerdictState>(() =>
    source === "live"
      ? { status: "loading" }
      : { status: "ready", panel: MOCK_FIXTURES[source] },
  );

  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    if (source !== "live") {
      const targetSource = source;
      queueMicrotask(() => {
        if (cancelledRef.current) return;
        setState({ status: "ready", panel: MOCK_FIXTURES[targetSource] });
      });
      return () => {
        cancelledRef.current = true;
      };
    }

    // Wave-41 Stream C codex HIGH close-out: reset to loading on every
    // source change into "live" so the UI does not flash stale mock
    // verdict data during the fetch latency window. Per the cascade #8
    // family rule, the lazy-initializer state above only sets the
    // initial mount value; the source-toggle case needs an explicit
    // reset here via queueMicrotask deferral.
    queueMicrotask(() => {
      if (cancelledRef.current) return;
      setState({ status: "loading" });
    });

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => {
      controller.abort("timeout");
    }, LIVE_FETCH_TIMEOUT_MS);

    void (async () => {
      try {
        const response = await fetch("/api/critic", { signal: controller.signal });
        if (cancelledRef.current) return;
        if (!response.ok) {
          const message = `Critic backend returned ${response.status} ${response.statusText}.`;
          if (typeof console !== "undefined" && console.error) {
            console.error("apex.useTriAgentCriticVerdict: response not ok", {
              status: response.status,
              statusText: response.statusText,
              url: response.url,
            });
          }
          setState({ status: "error", message });
          return;
        }
        const rawPayload: unknown = await response.json();
        if (cancelledRef.current) return;
        try {
          const panel = decodeTriAgentVerdictPanel(rawPayload);
          setState({ status: "ready", panel });
        } catch (decodeErr) {
          const message =
            decodeErr instanceof Error ? decodeErr.message : String(decodeErr);
          if (typeof console !== "undefined" && console.error) {
            console.error("apex.useTriAgentCriticVerdict: decoder rejected payload", {
              rawPayload,
              decodeErr,
            });
          }
          setState({ status: "error", message: `Critic decoder rejected payload: ${message}` });
        }
      } catch (err) {
        if (cancelledRef.current) return;
        const isAbort =
          err instanceof DOMException && err.name === "AbortError";
        if (isAbort) {
          const isTimeout = controller.signal.reason === "timeout";
          if (isTimeout) {
            if (typeof console !== "undefined" && console.error) {
              console.error("apex.useTriAgentCriticVerdict: /api/critic timed out", {
                timeoutMs: LIVE_FETCH_TIMEOUT_MS,
              });
            }
            setState({
              status: "error",
              message: `Critic backend did not respond within ${LIVE_FETCH_TIMEOUT_MS / 1000}s. Check Vinh's FastAPI service health on /status.`,
            });
          }
          // Non-timeout abort = effect cleanup or source change; silent.
          return;
        }
        const message = err instanceof Error ? err.message : String(err);
        if (typeof console !== "undefined" && console.error) {
          console.error("apex.useTriAgentCriticVerdict: fetch threw", { err });
        }
        setState({ status: "error", message: `Critic fetch failed: ${message}.` });
      } finally {
        clearTimeout(timeoutHandle);
      }
    })();

    return () => {
      cancelledRef.current = true;
      clearTimeout(timeoutHandle);
      controller.abort("source-changed");
    };
  }, [source]);

  return state;
}
