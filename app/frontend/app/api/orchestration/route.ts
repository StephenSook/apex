/**
 * Wave-45 Phase 9 Block F V14 frontend stub + wave-46 Phase 3 wire-flip:
 * LangGraph + MCP + ContextForge orchestration runtime swap-point per
 * D-017 G7. Vinh ships the real implementation at
 * `app/backend/apex/orchestration/langgraph_runtime.py` replacing the
 * Langflow demo-facade.
 *
 * HEAD canned path: returns a canned 6-node state-machine execution
 * trace for /judges + LangGraphRuntimePanel visualization.
 *
 * Wave-46 D-058 Phase 3.3 + 3.6: when `NEXT_PUBLIC_USE_REAL_BACKEND_V14`
 * is "1" AND `NEXT_PUBLIC_VINH_BACKEND_BASE_URL` is set, fetch the real
 * Vinh backend at `${base}/api/orchestration` + return the upstream
 * `OrchestrationResponse` payload with engine = "langgraph-v14-real".
 * Falls back to canned on fetch failure.
 */

import type { NextRequest } from "next/server";

import type { OrchestrationNode, OrchestrationResponse } from "../../../../shared/types";
import { getVinhBackendBaseUrl, shouldUseRealBackend } from "../../../lib/env";
import { VINH_SWAP_POINTS } from "../../../lib/vinh-swap-points";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const CANNED_NODES: ReadonlyArray<OrchestrationNode> = [
  { id: "ingest", label: "Telemetry ingest + 1-Hz aggregator", status: "completed", elapsed_ms: 42 },
  { id: "rag", label: "Granite Embedding R2 retrieval", status: "completed", elapsed_ms: 88 },
  { id: "projection", label: "V2 cvxpylayers projector (D-050)", status: "completed", elapsed_ms: 290 },
  { id: "guardian", label: "Granite Guardian BYOC audit", status: "completed", elapsed_ms: 142 },
  { id: "instruct", label: "Granite 4.1 8B Instruct narrator", status: "completed", elapsed_ms: 8420 },
  { id: "provenance", label: "Footer assembly + commit-SHA + audit_id", status: "completed", elapsed_ms: 18 },
];

function cannedPayload(): OrchestrationResponse {
  const total_ms = CANNED_NODES.reduce((sum, node) => sum + node.elapsed_ms, 0);
  return {
    engine: "langgraph-v14-canned-fallback",
    trace_id: `canned-${Date.now().toString(36)}`,
    nodes: CANNED_NODES,
    total_ms,
    swap_point: VINH_SWAP_POINTS.V14_LANGGRAPH.swap_point,
  };
}

async function fetchRealBackend(): Promise<OrchestrationResponse | null> {
  const base = getVinhBackendBaseUrl();
  if (base === null) return null;
  try {
    const upstream = await fetch(`${base}/api/orchestration`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!upstream.ok) {
      console.warn(`[apex/orchestration] upstream ${upstream.status} ${upstream.statusText}`);
      return null;
    }
    const body = (await upstream.json()) as OrchestrationResponse;
    return { ...body, engine: "langgraph-v14-real" };
  } catch (err) {
    console.error("[apex/orchestration] real-backend fetch failed", err);
    return null;
  }
}

export async function GET(_req: NextRequest): Promise<Response> {
  try {
    let payload = cannedPayload();
    if (shouldUseRealBackend("USE_REAL_BACKEND_V14")) {
      const real = await fetchRealBackend();
      if (real !== null) payload = real;
    }
    return Response.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Orchestration-Swap-Point": VINH_SWAP_POINTS.V14_LANGGRAPH.header,
        "X-Apex-Orchestration-Engine": payload.engine,
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
      status: 502,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Orchestration-Swap-Point": VINH_SWAP_POINTS.V14_LANGGRAPH.header,
        "X-Apex-Error": "1",
      },
    });
  }
}
