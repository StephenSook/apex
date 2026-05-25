/**
 * Wave-45 Phase 9 Block F V14 frontend stub: LangGraph + MCP +
 * ContextForge orchestration runtime swap-point per D-017 G7. Vinh
 * ships the real implementation at
 * `app/backend/apex/orchestration/langgraph_runtime.py` replacing
 * the Langflow demo-facade.
 *
 * HEAD: returns a canned 6-node state-machine execution trace for
 * /judges + LangGraphRuntimePanel visualization.
 */

import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

const CANNED_NODES: ReadonlyArray<OrchestrationNode> = [
  { id: "ingest", label: "Telemetry ingest + 1-Hz aggregator", status: "completed", elapsed_ms: 42 },
  { id: "rag", label: "Granite Embedding R2 retrieval", status: "completed", elapsed_ms: 88 },
  { id: "projection", label: "V2 cvxpylayers projector (D-050)", status: "completed", elapsed_ms: 290 },
  { id: "guardian", label: "Granite Guardian BYOC audit", status: "completed", elapsed_ms: 142 },
  { id: "instruct", label: "Granite 4.1 8B Instruct narrator", status: "completed", elapsed_ms: 8420 },
  { id: "provenance", label: "Footer assembly + commit-SHA + audit_id", status: "completed", elapsed_ms: 18 },
];

export async function GET(_req: NextRequest): Promise<Response> {
  try {
    const total_ms = CANNED_NODES.reduce((sum, node) => sum + node.elapsed_ms, 0);
    const payload: OrchestrationResponse = {
      engine: "langgraph-v14-canned-fallback",
      trace_id: `canned-${Date.now().toString(36)}`,
      nodes: CANNED_NODES,
      total_ms,
      swap_point: "Vinh M3-V14 -> app/backend/apex/orchestration/langgraph_runtime.py (D-017 G7 + D-026 + D-054 LangGraph + MCP + ContextForge)",
    };
    return Response.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Orchestration-Swap-Point": "vinh-m3-v14-langgraph",
      },
    });
  } catch (err) {
    console.error("[apex/orchestration]", err);
    const fallback: OrchestrationResponse = {
      engine: "langgraph-v14-canned-fallback",
      trace_id: `error-${Date.now().toString(36)}`,
      nodes: [],
      total_ms: 0,
      swap_point: `Vinh M3-V14 swap-in error: ${err instanceof Error ? err.message : String(err)}`,
    };
    return Response.json(fallback, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Orchestration-Swap-Point": "vinh-m3-v14-langgraph",
        "X-Apex-Error": "1",
      },
    });
  }
}
