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

import type { RAGResponse, RAGRetrieval } from "../../../../shared/types";
import { getVinhBackendBaseUrl, shouldUseRealBackend } from "../../../lib/env";
import {
  cosineSim,
  embedTextsHF,
  hfInferenceAvailable,
} from "../../../lib/granite-embedding-r2";
import { CORPUS, retrieveChunks } from "../../../lib/rag-retrieve";
import { VINH_SWAP_POINTS } from "../../../lib/vinh-swap-points";

// Node runtime so module-scope cache survives across requests in the
// same Vercel function instance. Edge runtime would re-embed the corpus
// on every cold start; the embedding cache below is only useful when
// invocations share memory.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOP_K = 3;
const RERANK_POOL = 10;

// Module-scope cache: corpus embeddings computed once + reused across
// requests until the function instance recycles. Wraps the HF Inference
// call so a cold-start invocation pays ~12 chunk-embed calls (~2 sec)
// and subsequent calls only embed the query.
let CORPUS_EMBEDDINGS: ReadonlyArray<ReadonlyArray<number>> | null = null;
let CORPUS_EMBEDDING_PROMISE: Promise<ReadonlyArray<ReadonlyArray<number>>> | null = null;

async function ensureCorpusEmbeddings(): Promise<ReadonlyArray<ReadonlyArray<number>>> {
  if (CORPUS_EMBEDDINGS) return CORPUS_EMBEDDINGS;
  if (CORPUS_EMBEDDING_PROMISE) return CORPUS_EMBEDDING_PROMISE;
  CORPUS_EMBEDDING_PROMISE = (async () => {
    const texts = CORPUS.map((c) => `${c.title}\n\n${c.text}`);
    const embeddings = await embedTextsHF(texts, { timeoutMs: 12000 });
    CORPUS_EMBEDDINGS = embeddings;
    CORPUS_EMBEDDING_PROMISE = null;
    return embeddings;
  })();
  return CORPUS_EMBEDDING_PROMISE;
}

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

async function retrieveViaHFEmbedding(
  query: string,
  t0: number,
): Promise<RAGResponse | null> {
  if (!hfInferenceAvailable()) return null;
  try {
    // 1. Lexical pre-filter to a top-N candidate pool (cheap; deterministic
    //    when query terms appear in the corpus). Re-rank pool kept small so
    //    we stay within HF Inference free-tier rate limits.
    const lexicalCandidates = retrieveChunks(query, RERANK_POOL);
    if (lexicalCandidates.length === 0) return null;

    // 2. Ensure corpus embeddings are cached + embed the query in one call.
    //    The query-embedding call doubles as a wake-up against the cached
    //    corpus embeddings; first request pays ~2s cold, subsequent ~150ms.
    const [corpusEmbeddings, queryEmbeddingResult] = await Promise.all([
      ensureCorpusEmbeddings(),
      embedTextsHF([query], { timeoutMs: 6000 }),
    ]);
    const queryEmbedding = queryEmbeddingResult[0];
    if (!queryEmbedding || queryEmbedding.length === 0) return null;

    // 3. Cosine-rerank the lexical candidates using the cached corpus
    //    embeddings (mapped back by chunk index). Then take top-K.
    const indexById = new Map(CORPUS.map((c, idx) => [c.id, idx] as const));
    const reranked: ReadonlyArray<RAGRetrieval> = lexicalCandidates
      .map((r) => {
        const idx = indexById.get(r.chunk.id);
        if (idx === undefined) return { chunk: r.chunk, score: r.score };
        const emb = corpusEmbeddings[idx];
        const sim = cosineSim(queryEmbedding, emb);
        // Blend: 70% cosine + 30% lexical (normalize lexical to ~[0,1]
        // by /10 since IDF * tf scores tend to range 0-10 for top results).
        const blendedScore = 0.7 * sim + 0.3 * Math.min(1, r.score / 10);
        return { chunk: r.chunk, score: blendedScore };
      });
    const top = [...reranked].sort((a, b) => b.score - a.score).slice(0, TOP_K);

    return {
      engine: "granite-embedding-r2-hf-inference",
      compute_ms: Math.round(performance.now() - t0),
      query,
      retrievals: top,
      retriever_label:
        "IBM Granite Embedding 30M English (HF Inference Providers) + lexical pre-filter",
      swap_point: VINH_SWAP_POINTS.V8_EMBEDDING.swap_point,
    };
  } catch (err) {
    console.warn(
      "[apex/rag-retrieve] HF Inference embedding failed; falling back",
      err,
    );
    return null;
  }
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
      signal: AbortSignal.timeout(3000),
    });
    if (!upstream.ok) {
      console.warn(`[apex/rag-retrieve] upstream ${upstream.status} ${upstream.statusText}`);
      return null;
    }
    const body = (await upstream.json()) as RAGResponse;
    return {
      ...body,
      engine: "rag-v8-real",
      compute_ms: Math.round(performance.now() - t0),
      retriever_label: "Granite Embedding R2 149M + 47M (cosine similarity)",
    };
  } catch (err) {
    console.warn("[apex/rag-retrieve] real-backend fetch failed; serving canned-fallback", err);
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
    // Priority order: Vinh backend (when explicitly wire-flipped) >
    // HF Inference Providers (when HF_TOKEN env is set) > lexical canned.
    if (shouldUseRealBackend("USE_REAL_RAG")) {
      const real = await fetchRealBackend(query, t0);
      if (real !== null) payload = real;
    } else if (hfInferenceAvailable()) {
      const hf = await retrieveViaHFEmbedding(query, t0);
      if (hf !== null) payload = hf;
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
