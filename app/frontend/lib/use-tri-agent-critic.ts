/**
 * useTriAgentCriticVerdict: data-source-aware hook returning the wave-30
 * D-018 tri-agent Agent-as-Judge critic loop verdict panel for the
 * /judges + /analyze surfaces.
 *
 * Wave-40 Stream B.4 close-out per the AskUserQuestion "full galaxy-tier
 * pull-forward" answer: the hook lets consumers switch between mock
 * fixtures (today) + the backend fetch (Day 7-8 wire-up) via a single
 * `dataSource` parameter. TriAgentCriticPanel itself remains a pure UI
 * component taking the TriAgentVerdictPanel as a prop; this hook is the
 * data-fetching seam.
 *
 * Discriminated-union state per the feedback_discriminated_unions_over_
 * contradiction memory rule:
 *   - loading: fetch in flight (live mode only; mock mode never enters)
 *   - ready: verdict panel available
 *   - error: fetch failed (live mode only); falls back to error state
 *
 * Live mode contract: GET /api/critic returns a JSON-encoded
 * TriAgentVerdictPanel. The wave-41 decoder (lib/api-decode.ts) verifies
 * the response shape at parse time against the canonical
 * TriAgentVerdictPanel positional-binding invariant per types.ts
 * lines 731-747 (Physics at position 0, Pedagogy at position 1,
 * Guardian-Safety at position 2; runtime guard).
 */

"use client";

import { useEffect, useState } from "react";

import type { TriAgentVerdictPanel } from "../../shared/types";
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

/**
 * Return a TriAgentVerdictState based on the data source. Mock sources
 * resolve synchronously to the canonical fixtures. The live source
 * issues a GET /api/critic + parses the JSON response.
 */
export function useTriAgentCriticVerdict(source: TriAgentDataSource): TriAgentVerdictState {
  const [state, setState] = useState<TriAgentVerdictState>(() =>
    source === "live"
      ? { status: "loading" }
      : { status: "ready", panel: MOCK_FIXTURES[source] },
  );

  useEffect(() => {
    if (source !== "live") {
      // Wave-40 cascade #8 family rule: react-hooks/set-state-in-effect
      // blocks synchronous setState() inside useEffect. Defer via
      // queueMicrotask so the state transition lands AFTER the effect
      // commits. Same hotfix shape as wave-38 cascade #8 (lazy state
      // initializer for navigator.onLine) + wave-39 cascade #9
      // (useEffect-sync of ref-stashed callback). The lazy initializer
      // above already sets the correct initial state for mock sources;
      // this branch only fires when `source` changes between mock
      // values at runtime.
      const targetSource = source;
      queueMicrotask(() => {
        setState({ status: "ready", panel: MOCK_FIXTURES[targetSource] });
      });
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/critic");
        if (cancelled) {
          return;
        }
        if (!response.ok) {
          setState({
            status: "error",
            message: `Critic backend returned ${response.status} ${response.statusText}.`,
          });
          return;
        }
        const payload = (await response.json()) as TriAgentVerdictPanel;
        if (cancelled) {
          return;
        }
        // Runtime guard per wave-37 cascade-#5 qualification: TypeScript
        // does NOT enforce positional binding at JSON.parse boundaries.
        // The wave-41 decoder will swap the inline guard below for a
        // proper schema-validated parse; for now check the 3 critic
        // names + length so a backend regression surfaces in the error
        // state rather than rendering misordered verdicts.
        if (
          !Array.isArray(payload) ||
          payload.length !== 3 ||
          payload[0]?.critic !== "physics" ||
          payload[1]?.critic !== "pedagogy" ||
          payload[2]?.critic !== "guardian_safety"
        ) {
          setState({
            status: "error",
            message: "Critic backend returned a misshapen TriAgentVerdictPanel.",
          });
          return;
        }
        setState({ status: "ready", panel: payload });
      } catch (err) {
        if (cancelled) {
          return;
        }
        const message = err instanceof Error ? err.message : String(err);
        setState({ status: "error", message: `Critic fetch failed: ${message}.` });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [source]);

  return state;
}
