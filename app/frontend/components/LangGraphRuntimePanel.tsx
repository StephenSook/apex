"use client";

/**
 * LangGraphRuntimePanel: wave-45 Phase 9 Block F V14 frontend surface
 * for the LangGraph + MCP + ContextForge orchestration runtime swap-
 * point per D-017 G7. Renders a 6-node state-machine execution trace
 * (ingestion -> RAG -> projection -> Guardian -> instruct -> provenance)
 * from /api/orchestration. Wave-49 1d17eee shipped the real LangGraph
 * runtime at apex/orchestration/langgraph_runtime.py; engine label
 * reflects real backend when NEXT_PUBLIC_USE_REAL_BACKEND_V14=1 + the
 * HF Space is warm.
 *
 * Wave-45 Phase 9 Block F: D-017 demoted Langflow to FACADE wave-30;
 * D-026 + G7 path is LangGraph + Granite MCP Gateway + ContextForge for
 * the actual runtime. This panel surfaces that production runtime to
 * judges + scores the IBM_STACK Langflow tier flip from FACADE to
 * INTEGRATION-LANGGRAPH per the maximal-architecture lock.
 */

import { useEffect, useState } from "react";

import type { OrchestrationNode, OrchestrationResponse } from "../../shared/types";

type PanelState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly response: OrchestrationResponse }
  | { readonly status: "error"; readonly message: string };

function nodeBorder(status: OrchestrationNode["status"]): string {
  switch (status) {
    case "completed":
      return "border-racing-green bg-paper";
    case "active":
      return "border-amber bg-paper-warm";
    case "pending":
      return "border-rule bg-paper";
    case "failed":
      return "border-accent bg-paper";
    default: {
      const _exhaustive: never = status;
      throw new Error(`unknown orchestration node status: ${String(_exhaustive)}`);
    }
  }
}

const FETCH_TIMEOUT_MS = 8000;

export default function LangGraphRuntimePanel() {
  const [state, setState] = useState<PanelState>({ status: "loading" });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const run = async () => {
      try {
        const res = await fetch("/api/orchestration", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`/api/orchestration -> HTTP ${res.status}`);
        const payload = (await res.json()) as OrchestrationResponse;
        if (!cancelled) setState({ status: "ready", response: payload });
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error && err.name === "AbortError"
            ? `/api/orchestration timed out after ${FETCH_TIMEOUT_MS} ms`
            : err instanceof Error
              ? err.message
              : String(err);
        setState({ status: "error", message });
      }
    };
    void run();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [reload]);

  return (
    <section
      aria-labelledby="langgraph-runtime-title"
      className="flex flex-col gap-4 rounded-sm border-2 border-rule bg-paper p-5"
    >
      <header>
        <p className="apex-eyebrow">Vinh M3-V14 · D-017 G7 LangGraph runtime swap-point</p>
        <h3
          id="langgraph-runtime-title"
          className="font-display text-2xl tracking-tight text-ink"
        >
          LangGraph + MCP + ContextForge orchestration trace.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          The actual runtime path per D-026 maximal architecture; Langflow facade is the
          export-graph artifact, not the runtime. Wave-49 lit
          {" "}<span className="font-mono">apex/orchestration/langgraph_runtime.py</span>{" "}
          + Granite MCP Gateway + ContextForge tool registry; engine label reflects the live
          state machine when <span className="font-mono">NEXT_PUBLIC_USE_REAL_BACKEND_V14=1</span>.
        </p>
      </header>

      {state.status === "loading" && (
        <p className="font-mono text-xs uppercase tracking-wider text-amber">
          Loading orchestration trace...
        </p>
      )}

      {state.status === "ready" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <span
              className={`rounded-sm border px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${
                state.response.engine === "langgraph-v14-real"
                  ? "border-racing-green bg-paper text-racing-green"
                  : "border-amber bg-paper text-amber"
              }`}
            >
              Engine: {state.response.engine}
            </span>
            <span className="rounded-sm border border-rule bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              Total: {state.response.total_ms} ms
            </span>
            <span className="rounded-sm border border-rule bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted">
              trace_id {state.response.trace_id}
            </span>
          </div>
          <ol className="flex flex-col gap-2">
            {state.response.nodes.map((node, idx) => (
              <li
                key={node.id}
                className={`flex flex-row items-center gap-3 rounded-sm border-2 p-3 ${nodeBorder(node.status)}`}
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  Node {idx + 1}
                </span>
                <span className="flex-1 font-display text-lg tracking-tight text-ink">
                  {node.label}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
                  {node.elapsed_ms} ms
                </span>
                <span
                  className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                    node.status === "completed"
                      ? "border-racing-green text-racing-green"
                      : node.status === "active"
                        ? "border-amber text-amber"
                        : node.status === "failed"
                          ? "border-accent text-accent"
                          : "border-rule text-muted"
                  }`}
                >
                  {node.status}
                </span>
              </li>
            ))}
          </ol>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
            Swap-point: <span className="text-ink-soft">{state.response.swap_point}</span>
          </p>
        </div>
      )}

      {state.status === "error" && (
        <div className="flex flex-col gap-3">
          <p
            role="alert"
            className="rounded-sm border-2 border-accent bg-paper p-3 font-mono text-xs leading-relaxed text-accent"
          >
            Orchestration trace failed: {state.message}
          </p>
          <button
            type="button"
            onClick={() => {
              setState({ status: "loading" });
              setReload((n) => n + 1);
            }}
            className="self-start rounded-sm border-2 border-racing-green bg-racing-green px-4 py-2 font-mono text-xs uppercase tracking-wider text-paper transition-colors hover:bg-racing-green-deep"
          >
            Retry orchestration trace
          </button>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
            Swap-point: Vinh M3-V14 -&gt; app/backend/apex/orchestration/langgraph_runtime.py
          </p>
        </div>
      )}
    </section>
  );
}
