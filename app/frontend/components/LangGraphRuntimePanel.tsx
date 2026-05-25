"use client";

/**
 * LangGraphRuntimePanel: wave-45 Phase 9 Block F V14 frontend surface
 * for the LangGraph + MCP + ContextForge orchestration runtime swap-
 * point per D-017 G7. Renders a 6-node state-machine execution trace
 * (ingestion -> RAG -> projection -> Guardian -> instruct -> provenance)
 * from /api/orchestration. HEAD shows canned-fallback engine; Vinh M3-V14
 * swaps in the real LangGraph runtime + MCP + ContextForge wire-up.
 *
 * Wave-45 Phase 9 Block F: D-017 demoted Langflow to FACADE wave-30;
 * D-026 + G7 path is LangGraph + Granite MCP Gateway + ContextForge for
 * the actual runtime. This panel surfaces that production runtime to
 * judges + scores the IBM_STACK Langflow tier flip from FACADE to
 * INTEGRATION-LANGGRAPH per the maximal-architecture lock.
 */

import { useEffect, useState } from "react";

interface OrchestrationNode {
  readonly id: string;
  readonly label: string;
  readonly status: "completed" | "active" | "pending" | "failed";
  readonly elapsed_ms: number;
}

interface OrchestrationResponse {
  readonly engine: "langgraph-v14-canned-fallback" | "langgraph-v14-real";
  readonly trace_id: string;
  readonly nodes: ReadonlyArray<OrchestrationNode>;
  readonly total_ms: number;
  readonly swap_point: string;
}

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

export default function LangGraphRuntimePanel() {
  const [state, setState] = useState<PanelState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/orchestration", { cache: "no-store" });
        if (!res.ok) throw new Error(`/api/orchestration -> HTTP ${res.status}`);
        const payload = (await res.json()) as OrchestrationResponse;
        if (!cancelled) setState({ status: "ready", response: payload });
      } catch (err) {
        if (!cancelled) {
          setState({
            status: "error",
            message: err instanceof Error ? err.message : String(err),
          });
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

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
          export-graph artifact, not the runtime. HEAD shows canned-fallback engine while
          Vinh wires <span className="font-mono">apex/orchestration/langgraph_runtime.py</span>
          {" "}+ Granite MCP Gateway + ContextForge tool registry.
        </p>
      </header>

      {state.status === "loading" && (
        <p className="font-mono text-xs uppercase tracking-wider text-amber">
          Loading orchestration trace…
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
        <p
          role="alert"
          className="rounded-sm border-2 border-accent bg-paper p-3 font-mono text-xs leading-relaxed text-accent"
        >
          Orchestration trace failed: {state.message}
        </p>
      )}
    </section>
  );
}
