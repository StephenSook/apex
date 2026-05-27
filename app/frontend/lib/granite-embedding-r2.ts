/**
 * Granite Embedding R2 via HuggingFace Inference Providers (wave-48).
 *
 * Closes frontend-audit critical: /api/rag-retrieve advertises Granite
 * Embedding R2 cosine-similarity retrieval but the HEAD wire is lexical
 * TF-IDF. This module exposes a REAL embedding path via HF Inference
 * Providers (`feature-extraction` pipeline) so the route's claim can be
 * backed by code that actually runs in production when `HF_TOKEN` env
 * is set.
 *
 * Why HF Inference Providers (not OpenRouter / Replicate / IBM watsonx):
 *   - HF is the ONLY Granite endpoint that hosts the embedding models
 *     on a serverless (no boot cost) free tier. Generation-heavy Granite
 *     (Vision, Speech, Guardian, Docling, TTM, TSPulse) are not on HF
 *     Inference Providers; embeddings ARE per the model card.
 *   - Per `references/IBM-Granite-HF-research-2026-05-27.md` research
 *     dispatch: `ibm-granite/granite-embedding-30m-english` is the
 *     primary; `granite-embedding-small-english-r2` (47M, 384-dim, 8k
 *     context) is the upgrade-path live on Replicate as a fallback if
 *     HF rate-limits.
 *
 * Cost model: HF Inference free tier offers approx 1000 calls/day; our
 * RAG corpus has 12 chunks; re-rank uses top-K-lexical-then-embed so the
 * call budget is 1 query + K chunk-embeds = K+1 calls per RAG request.
 * At K=5 that's 6 calls/request; 166 requests/day stays under the cap.
 */

const DEFAULT_MODEL = "ibm-granite/granite-embedding-30m-english";
const HF_ROUTER_URL = "https://router.huggingface.co/hf-inference/models";

export type EmbedTextsOptions = {
  readonly model?: string;
  readonly timeoutMs?: number;
};

/**
 * Embed an array of texts via HF Inference Providers feature-extraction.
 * Returns a 2D array of float embeddings (one row per input text).
 * Throws on any non-200 response so the caller can fall back.
 */
export async function embedTextsHF(
  texts: ReadonlyArray<string>,
  options: EmbedTextsOptions = {},
): Promise<ReadonlyArray<ReadonlyArray<number>>> {
  const token = process.env.HF_TOKEN?.trim();
  if (!token) {
    throw new Error("HF_TOKEN env var not set; cannot reach HF Inference");
  }
  const model = options.model ?? DEFAULT_MODEL;
  const timeoutMs = options.timeoutMs ?? 8000;
  const url = `${HF_ROUTER_URL}/${model}/pipeline/feature-extraction`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Apex-Embedding-Use": "rag-retrieve",
    },
    body: JSON.stringify({
      inputs: texts,
      options: { wait_for_model: true },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(
      `HF Inference returned ${r.status}: ${body.slice(0, 256)}`,
    );
  }
  const data = (await r.json()) as unknown;
  // HF Inference feature-extraction returns a nested float[][] or
  // sometimes float[][][] depending on the model. granite-embedding-30m
  // returns float[][] (one row per input). Defensively coerce if the
  // outer dim is wrapped.
  if (!Array.isArray(data)) {
    throw new Error(`HF returned non-array body shape: ${typeof data}`);
  }
  const first = data[0];
  if (Array.isArray(first) && typeof first[0] === "number") {
    return data as ReadonlyArray<ReadonlyArray<number>>;
  }
  if (Array.isArray(first) && Array.isArray(first[0])) {
    // Some models return [[[...]]]; flatten the outermost wrapper.
    return data.map((row) => (row as number[][])[0]) as ReadonlyArray<
      ReadonlyArray<number>
    >;
  }
  throw new Error("HF returned an unexpected embedding tensor shape");
}

/**
 * Cosine similarity between two same-length numeric vectors.
 * Returns a value in [-1, 1]; identical-direction vectors return 1.0.
 */
export function cosineSim(
  a: ReadonlyArray<number>,
  b: ReadonlyArray<number>,
): number {
  if (a.length !== b.length || a.length === 0) {
    return 0;
  }
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i];
    const bi = b[i];
    dot += ai * bi;
    magA += ai * ai;
    magB += bi * bi;
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  if (denom === 0) return 0;
  return dot / denom;
}

/**
 * Heuristic check: can we reach HF Inference at all? Tests presence of
 * `HF_TOKEN` env without making a network call. Callers gate the
 * embedding-rerank path on this so the route never throws when token
 * is absent (it falls back to lexical-only retrieval).
 */
export function hfInferenceAvailable(): boolean {
  const token = process.env.HF_TOKEN?.trim();
  return Boolean(token);
}
