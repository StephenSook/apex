/**
 * Wave-46 Phase 4.5 NEW route. Granite Embedding R2 RAG retrieval
 * swap-point per D-016 + Vinh M3-V8. Vinh ships the real implementation
 * at `app/backend/apex/embedding/rag_retrieve.py` consuming Granite
 * Embedding R2 149M + 47M cosine-similarity over precomputed corpus
 * embeddings (architecture-spec + decision-log + methodology + paper §3
 * + README chunks).
 *
 * HEAD canned path: returns lexical TF-IDF retrieval output via the
 * existing `lib/rag-retrieve.ts` `retrieveChunks()` helper. Same
 * RAGRetrieval shape the AICopilotChat surface + RAGCitationBadge
 * consume today; the badge render path stays identical regardless of
 * which retriever produced the chunks.
 *
 * Wave-46 D-058 Phase 4.5 wire-flip: when `NEXT_PUBLIC_USE_REAL_RAG` is
 * "1" + `NEXT_PUBLIC_VINH_BACKEND_BASE_URL` is set, forward POST to
 * `${base}/api/rag-retrieve` + return upstream `RAGResponse` payload
 * with engine = "rag-v8-real" + retriever_label flipped to the Granite
 * Embedding R2 cosine-similarity label. Falls back to canned lexical
 * retrieval on any fetch failure.
 *
 * Request body: { "query": string }
 */

import type { NextRequest } from "next/server";

import type { RAGResponse } from "../../../../shared/types";
import { getVinhBackendBaseUrl, shouldUseRealBackend } from "../../../lib/env";
import { retrieveChunks } from "../../../lib/rag-retrieve";
import { VINH_SWAP_POINTS } from "../../../lib/vinh-swap-points";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const TOP_K = 3;

interface RAGRetrieveBody {
  readonly query?: unknown;
}

function cannedPayload(query: string, t0: number): RAGResponse {
  const retrievals = retrieveChunks(query, TOP_K);
  return {
    engine: "rag-v8-canned-fallback",
    compute_ms: Math.round(performance.now() - t0),
    query,
    retrievals,
    retriever_label: "lexical (Granite Embedding R2 swap-point per Vinh M3-V8)",
    swap_point: VINH_SWAP_POINTS.V8_EMBEDDING.swap_point,
  };
}

async function fetchRealBackend(query: string, t0: number): Promise<RAGResponse | null> {
  const base = getVinhBackendBaseUrl();
  if (base === null) return null;
  try {
    const upstream = await fetch(`${base}/api/rag-retrieve`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query }),
      cache: "no-store",
    });
    if (!upstream.ok) return null;
    const body = (await upstream.json()) as RAGResponse;
    return {
      ...body,
      engine: "rag-v8-real",
      compute_ms: Math.round(performance.now() - t0),
      retriever_label: "Granite Embedding R2 149M + 47M (cosine similarity)",
    };
  } catch (err) {
    console.error("[apex/rag-retrieve] real-backend fetch failed", err);
    return null;
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  const t0 = performance.now();
  let body: RAGRetrieveBody;
  try {
    body = (await req.json()) as RAGRetrieveBody;
  } catch {
    return Response.json(
      { error: "invalid_json", message: "Expected JSON body { query: string }." },
      { status: 400 },
    );
  }
  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (query.length === 0) {
    return Response.json(
      { error: "missing_query", message: "Expected non-empty string 'query' field." },
      { status: 400 },
    );
  }
  try {
    let payload = cannedPayload(query, t0);
    if (shouldUseRealBackend("USE_REAL_RAG")) {
      const real = await fetchRealBackend(query, t0);
      if (real !== null) payload = real;
    }
    return Response.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Rag-Swap-Point": VINH_SWAP_POINTS.V8_EMBEDDING.header,
        "X-Apex-Rag-Engine": payload.engine,
      },
    });
  } catch (err) {
    console.error("[apex/rag-retrieve]", err);
    const fallback: RAGResponse = {
      engine: "rag-v8-canned-fallback",
      compute_ms: Math.round(performance.now() - t0),
      query,
      retrievals: [],
      retriever_label: "error",
      swap_point: `Vinh M3-V8 swap-in error: ${err instanceof Error ? err.message : String(err)}`,
    };
    return Response.json(fallback, {
      status: 502,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Rag-Swap-Point": VINH_SWAP_POINTS.V8_EMBEDDING.header,
        "X-Apex-Error": "1",
      },
    });
  }
}
