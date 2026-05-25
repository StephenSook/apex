"use client";

/**
 * TTMInBrowserPanel: opt-in Granite TimeSeries TTM r2.1 in-browser
 * forecast demo. Wave-45 Phase 7 Block D close-out. Adds the 7th
 * shouldn't-be-possible move per D-053: the SAME Granite stack
 * running in-browser, lazy-loaded behind explicit opt-in, cached
 * via service worker. Differentiator vs ApexIQ which runs Granite
 * via local Ollama server-side.
 *
 * 4-state DU per the feedback_discriminated_unions_over_contradiction
 * memory rule + _exhaustive: never default.
 *
 * HEAD ships canned-fallback runtime since @huggingface/transformers
 * dep is wave-46 task; lib/ttm-browser.ts handles the graceful
 * fallback. The UI surface is identical between runtime modes per
 * Stream M.3 spec extension contract.
 */

import { useState } from "react";

import { runGraniteTTMInBrowser, type TTMBrowserStatus } from "../lib/ttm-browser";

type TTMPanelState =
  | { readonly status: "idle" }
  | { readonly status: "loading"; readonly startedAt: number }
  | { readonly status: "ready"; readonly result: Extract<TTMBrowserStatus, { status: "ready" }> }
  | { readonly status: "error"; readonly message: string };

function statusBorder(state: TTMPanelState["status"]): string {
  switch (state) {
    case "idle":
      return "border-rule";
    case "loading":
      return "border-amber";
    case "ready":
      return "border-racing-green";
    case "error":
      return "border-accent";
    default: {
      const _exhaustive: never = state;
      throw new Error(`unknown TTM panel state: ${String(_exhaustive)}`);
    }
  }
}

export default function TTMInBrowserPanel() {
  const [state, setState] = useState<TTMPanelState>({ status: "idle" });

  const handleRun = async () => {
    setState({ status: "loading", startedAt: performance.now() });
    try {
      const result = await runGraniteTTMInBrowser([]);
      if (result.status === "ready") {
        setState({ status: "ready", result });
      } else if (result.status === "error") {
        setState({ status: "error", message: result.message });
      }
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : String(err) });
    }
  };

  return (
    <section
      aria-labelledby="ttm-in-browser-title"
      aria-live="polite"
      className={`flex flex-col gap-4 rounded-sm border-2 ${statusBorder(state.status)} bg-paper p-5`}
    >
      <header>
        <p className="apex-eyebrow">Galaxy stretch · D-053 shouldn&apos;t-be-possible move #7</p>
        <h3
          id="ttm-in-browser-title"
          className="font-display text-2xl tracking-tight text-ink"
        >
          Run Granite TimeSeries TTM r2.1 in your browser.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          The same IBM Granite forecaster that ships server-side in the production pipeline, running
          locally in the driver&apos;s browser via Transformers.js + WebGPU / WASM SIMD. Lazy-loaded
          on opt-in; cached via service worker after first download (wave-46 adds the cache layer).
          Today&apos;s HEAD runs canned-fallback while the @huggingface/transformers dep stays gated;
          UI surface is identical between runtime modes per Stream M.3.
        </p>
      </header>

      {state.status === "idle" && (
        <button
          type="button"
          onClick={() => void handleRun()}
          className="self-start rounded-sm border-2 border-racing-green bg-racing-green px-5 py-2 font-mono text-sm uppercase tracking-wider text-paper transition-colors hover:bg-racing-green-deep"
        >
          Run TTM in-browser →
        </button>
      )}

      {state.status === "loading" && (
        <p className="font-mono text-xs text-amber">
          Loading Granite TimeSeries TTM r2.1 model…
        </p>
      )}

      {state.status === "ready" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="rounded-sm border border-racing-green bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-racing-green">
              Ready in {state.result.elapsed_ms} ms
            </span>
            <span
              className={`rounded-sm border px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${
                state.result.runtime === "transformers-js"
                  ? "border-racing-green bg-paper text-racing-green"
                  : "border-amber bg-paper text-amber"
              }`}
            >
              Runtime: {state.result.runtime}
            </span>
          </div>
          <ol className="grid grid-cols-6 gap-1 font-mono text-[10px] text-ink-soft sm:grid-cols-10">
            {state.result.forecast.map((value, idx) => (
              <li
                key={idx}
                className="flex flex-col items-center gap-0.5 rounded-sm border border-rule bg-paper-warm p-2"
                aria-label={`Forecast step ${idx + 1}: ${value.toFixed(2)}`}
              >
                <span className="text-[9px] uppercase tracking-wider text-muted">{idx + 1}</span>
                <span className="text-ink">{value.toFixed(1)}</span>
              </li>
            ))}
          </ol>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
            30-step horizon at 1 Hz · canonical TENSOR_SHAPE = (None, 30, 14) per shapes.py
          </p>
        </div>
      )}

      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-sm border-2 border-accent bg-paper p-3 font-mono text-xs leading-relaxed text-accent"
        >
          TTM in-browser run failed: {state.message}. The @huggingface/transformers dep ships wave-46;
          today&apos;s fallback path is canned-fallback runtime per D-053.
        </p>
      )}

      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Cross-ref: <span className="text-ink-soft">D-053 + D-052 G4 pivot + paper §3 + Vinh apex/ttm/forecast.py</span>
      </p>
    </section>
  );
}
