"use client";

/**
 * RAGCitationBadge: renders the per-question retrieval-provenance
 * footer under AICopilotChat responses. Wave-44 Phase 6b galaxy-
 * stretch close-out: judges see that coaching answers come from the
 * project corpus + carry source-chunk citations + can verify the
 * factual base of the response.
 *
 * Today reads from `lib/rag-retrieve.ts` lexical retrieval (term
 * overlap + IDF; deterministic + zero-dependency). Vinh V8 backend
 * swap-point at /api/rag-retrieve replaces with server-side Granite
 * Embedding R2 cosine similarity per Stream M.3 spec extension; this
 * component's render path stays identical.
 */

import type { RAGRetrieval } from "../lib/rag-retrieve";

export interface RAGCitationBadgeProps {
  readonly retrievals: ReadonlyArray<RAGRetrieval>;
  readonly retrieverLabel?: string;
}

export default function RAGCitationBadge({
  retrievals,
  retrieverLabel = "lexical (Granite Embedding R2 swap-point per Vinh V8)",
}: RAGCitationBadgeProps) {
  if (retrievals.length === 0) {
    return (
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        No corpus chunks retrieved for this question.
      </p>
    );
  }
  return (
    <aside
      aria-label="Retrieved corpus chunks"
      className="flex flex-col gap-2 rounded-sm border border-rule bg-paper-warm p-3"
    >
      <p className="font-mono text-[10px] uppercase tracking-wider text-racing-green">
        Retrieved context · {retrievals.length} of corpus · {retrieverLabel}
      </p>
      <ul className="flex flex-col gap-2">
        {retrievals.map(({ chunk, score }) => (
          <li
            key={chunk.id}
            className="flex flex-col gap-1 rounded-sm border-l-2 border-racing-green bg-paper px-3 py-2"
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
              <span className="text-racing-green">{chunk.source}</span>
              {" "}· score {score.toFixed(2)}
            </p>
            <p className="font-display text-sm leading-snug text-ink">
              {chunk.title}
            </p>
            <p className="text-xs leading-relaxed text-ink-soft">{chunk.text}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
