"use client";

/**
 * RealtimeCOADiffPanel: route-backed COA-parameterized simultaneity-gate
 * verdict-diff. Wave-46 Phase 3.5. Mounts on /judges next to
 * `COAGateToggle` (which is pure-UI). This panel fetches
 * `/api/judges/coa-diff` and renders LIVE side-by-side projector
 * verdicts for `coa_overlap_flag = 1` (permitted) vs `= 0` (blocked) on
 * the same physical event. When wave-46 Phase 3
 * `NEXT_PUBLIC_USE_REAL_BACKEND_V14` + `NEXT_PUBLIC_VINH_BACKEND_BASE_URL`
 * env vars are set, the route returns the Vinh M3-V14 LangGraph runtime
 * output instead of canned-fallback; the panel renders the same UI but
 * the engine pill flips to "coa-diff-real" + numbers come from the live
 * projection trace.
 *
 * Discriminated-union state:
 *   - loading: initial fetch in flight
 *   - ready: response received + parsed
 *   - error: fetch failed or response shape invalid
 *
 * Hydration-safe via mounted-flag pattern per
 * `feedback_useState_lazy_init_hydration_footgun` (SSR renders the
 * loading skeleton; client renders post-fetch).
 */

import { useEffect, useState } from "react";

import type { COADiffResponse, COADiffVerdict } from "../../shared/types";

const FETCH_TIMEOUT_MS = 5000;

type PanelState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly payload: COADiffResponse }
  | { readonly status: "error"; readonly message: string };

function verdictBorder(verdict: COADiffVerdict["verdict"]): string {
  return verdict === "feasible" ? "border-racing-green" : "border-accent";
}

function VerdictPane({ verdict }: { readonly verdict: COADiffVerdict }) {
  const isFeasible = verdict.verdict === "feasible";
  return (
    <div
      className={`flex flex-col gap-3 rounded-sm border-2 ${verdictBorder(verdict.verdict)} bg-paper-warm p-4`}
      role={isFeasible ? undefined : "alert"}
    >
      <header className="flex items-baseline justify-between">
        <span
          className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
            isFeasible
              ? "border-racing-green bg-racing-green text-paper"
              : "border-accent bg-paper text-accent"
          }`}
        >
          coa_overlap_flag = {verdict.coa_overlap_flag}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
          {verdict.verdict}
        </span>
      </header>
      <p className="font-display text-lg leading-snug text-ink">{verdict.headline}</p>
      <p className="text-sm leading-relaxed text-ink-soft">{verdict.body}</p>
      <ol className="flex flex-col gap-1 rounded-sm border border-rule bg-paper p-3 font-mono text-[11px]">
        {verdict.projection_trace.map((entry) => (
          <li key={entry.stage} className="flex items-baseline justify-between gap-3">
            <span className="text-ink">{entry.stage}</span>
            <span
              className={`tabular-nums ${
                entry.status === "converged"
                  ? "text-racing-green"
                  : entry.status === "linearized"
                    ? "text-amber-ink"
                    : "text-accent"
              }`}
            >
              {entry.residual_norm.toFixed(4)} · {entry.status}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function RealtimeCOADiffPanel() {
  const [state, setState] = useState<PanelState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    (async () => {
      try {
        const res = await fetch("/api/judges/coa-diff", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`/api/judges/coa-diff -> HTTP ${res.status}`);
        const payload = (await res.json()) as COADiffResponse;
        setState({ status: "ready", payload });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.name === "AbortError"
              ? `/api/judges/coa-diff timed out after ${FETCH_TIMEOUT_MS} ms`
              : err.message
            : String(err);
        setState({ status: "error", message });
      } finally {
        clearTimeout(timeout);
      }
    })();
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <section
      aria-labelledby="realtime-coa-diff-title"
      aria-live="polite"
      className="flex flex-col gap-4 rounded-sm border-2 border-rule bg-paper p-5"
    >
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p className="apex-eyebrow">Route-backed diff (Vinh M3-V14 LangGraph swap-point)</p>
          <h3
            id="realtime-coa-diff-title"
            className="font-display text-2xl tracking-tight text-ink"
          >
            COA-parameterized simultaneity gate, live verdict diff.
          </h3>
        </div>
        {state.status === "ready" && (
          <span
            className={`rounded-sm border px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${
              state.payload.engine === "coa-diff-real"
                ? "border-racing-green bg-racing-green text-paper"
                : "border-rule bg-paper text-muted"
            }`}
          >
            engine: {state.payload.engine}
          </span>
        )}
      </header>

      {state.status === "loading" && (
        <div
          className="h-72 animate-pulse rounded border border-rule bg-paper-warm"
          aria-label="COA diff loading"
        />
      )}

      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-sm border-2 border-accent bg-paper p-3 font-mono text-xs leading-relaxed text-accent"
        >
          COA diff fetch error: {state.message}. Panel stays empty; COAGateToggle next to it still demonstrates the differentiator.
        </p>
      )}

      {state.status === "ready" && (
        <>
          <p className="text-sm leading-relaxed text-ink-soft">
            Scenario: <span className="font-mono text-xs text-ink">{state.payload.scenario}</span>
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <VerdictPane verdict={state.payload.permitted} />
            <VerdictPane verdict={state.payload.blocked} />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
            Cross-ref: <span className="text-ink-soft">D-A + D-052 G4 pivot reframing + D-058 wave-46 LangGraph wire-flip + paper §3.4 COA-parameterized simultaneity gate + Q&amp;A killshot #4 + COAGateToggle pure-UI sibling</span>
          </p>
        </>
      )}
    </section>
  );
}
