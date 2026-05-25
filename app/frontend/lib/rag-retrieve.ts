/**
 * Wave-44 Phase 6b RAG retrieval module. Provides per-question
 * provenance footers on the AICopilotChat surface so judges see that
 * answers come from the project corpus + carry source-chunk
 * citations. Granite Embedding R2 swap-point documented per Vinh
 * V8 (wave-44 plan addition; status INTEGRATION at HEAD).
 *
 * HEAD implementation: lexical retrieval via term-overlap +
 * inverse-document-frequency scoring across an inline corpus of
 * canonical project chunks (architecture-spec, decision-log,
 * methodology, paper §3, README). Real retrieval, no model required.
 * Vinh V8 backend swap-point: replace this module's `retrieveChunks`
 * with a fetch to /api/rag-retrieve (server-side Granite Embedding
 * R2 + precomputed corpus embeddings + cosine similarity). Render
 * path on the chat surface stays identical per Stream M.3 spec
 * extension.
 *
 * The inline corpus is intentionally small (10-15 chunks) so the
 * lexical-overlap signal is strong for the AICopilotChat suggested-
 * question set + remains debuggable from the network panel.
 */

export interface RAGChunk {
  readonly id: string;
  readonly source: string;
  readonly title: string;
  readonly text: string;
}

export interface RAGRetrieval {
  readonly chunk: RAGChunk;
  readonly score: number;
}

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "and", "or", "but", "if", "then", "to", "of", "in", "on", "at", "by",
  "for", "with", "from", "as", "this", "that", "these", "those", "it",
  "its", "you", "your", "we", "our", "they", "their", "i", "me", "my",
  "what", "why", "how", "when", "where", "do", "does", "did", "have",
  "has", "had", "would", "could", "should", "can", "will", "may", "might",
]);

function tokenize(text: string): ReadonlyArray<string> {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOP_WORDS.has(t));
}

export const CORPUS: ReadonlyArray<RAGChunk> = [
  {
    id: "arch-spec-three-layer",
    source: "docs/architecture-spec.md",
    title: "PhysicsTTM three-layer architecture",
    text: "APEX uses a three-layer architecture: frozen Granite TimeSeries TTM forecaster + CvxpyLayer differentiable QP physics projection + Granite Guardian BYOC text audit. The TTM is never retrained; physics enforcement is post-hoc projection at inference time, not training-time regularization.",
  },
  {
    id: "decision-d010-ensemble",
    source: "docs/decision-log.md D-010",
    title: "Three-track ensemble forecast",
    text: "Three-track forecast ensemble: Granite TimeSeries TTM (Track 1, frozen channel-mix decoder), Granite FlowState (Track 2, sampling-rate-invariant continuous-time SSM at 50Hz), Chronos-2 (Track 3, zero-shot foundation model). Voting and intersection visualization produces the forecast envelope.",
  },
  {
    id: "decision-d016-eight-tier",
    source: "docs/decision-log.md D-016",
    title: "Eight-tier physics + 12-tool Granite stack",
    text: "Eight-tier physics projector: Tier 0 vehicle dynamics, Tier 1 friction ellipse, Tier 2 polyphase TSPulse anomaly detector, Tier 3 thermal envelope, Tier 4 SCP outer loop, Tier 5 Pacejka linearisation, Tier 6 bicycle model, Tier 7 friction ellipse hard constraint, Tier 8 forward-Euler kinematic step. IBM TSPulse 1M time-frequency analyzer drives Tier 2.",
  },
  {
    id: "decision-d018-tri-agent",
    source: "docs/decision-log.md D-018",
    title: "Mellea Instruct-Validate-Repair tri-agent critic",
    text: "Layer 7 Agent-as-Judge tri-agent critic loop: physics critic + pedagogy critic + guardian_safety critic each verdict the coaching report. Mellea Instruct-Validate-Repair drives the repair loop when any critic flags a concern. Three verdict variants: approve, flag, reject with discriminated-union extras per variant.",
  },
  {
    id: "decision-d019-shouldnt-be-possible",
    source: "docs/decision-log.md D-019",
    title: "Five shouldn't-be-possible moves",
    text: "Five galaxy-tier moves: WebGPU Granite Nano 350M offline edge model (Layer 0), Activated LoRA hot-swap (Layer 6), GEPA reflective prompt optimization (Layer 5), EAGLE-3 speculative decoding (Layer 6 inference plane), Agent-as-Judge tri-agent critic loop (Layer 7). Wave-44 amendment adds IBM TSPulse polyphase anomaly detector as the sixth galaxy-tier move surfaced on /judges.",
  },
  {
    id: "decision-d021-edge-scope",
    source: "docs/decision-log.md D-021",
    title: "WebGPU offline scope cut",
    text: "Granite Nano 350M in-browser path does NOT run the eight-tier SCP physics projector. Runs a 30-line Newton friction-ellipse projection (sub-microsecond per step) for offline edge consistency. Offline summary is server-authoritative; the driver's browser produces a draft the server overwrites on reconnect. The edge model is only allowed to claim things the friction-ellipse projector can independently verify.",
  },
  {
    id: "methodology-coa-simultaneity",
    source: "docs/methodology.md",
    title: "COA-parameterized brake-throttle simultaneity",
    text: "Existing tools encode throttle times brake equals zero because no able-bodied driver presses both at once. Adaptive drivers do, when their FIA Certificate of Adaptations permits simultaneity through their hand-control or paddle-shift system. APEX reads the COA at tensor level. When the COA permits simultaneity, the projection layer permits it. When the COA does not, the constraint enforces.",
  },
  {
    id: "methodology-five-pillars",
    source: "docs/methodology.md (Sookra Five Pillars)",
    title: "Sookra Methodology Five Pillars",
    text: "Five pillars: Product credibility (no hardcoded personas in UI), Technical positioning (first integrated workflow for adaptive hand-controls), Defensibility (cite specific COA section + FIA Article), Storytelling (editorial-paddock palette + Fraunces + IBM Plex), Business case (max payout surface area via multi-track entry).",
  },
  {
    id: "paper-section-3-projector",
    source: "paper/apex-neurips-workshop-2026.md §3",
    title: "Convergence-14 serializer integrity",
    text: "Convergence 14 is a Python unit-test suite that fires every kinematic violation type (friction-ellipse breach, bicycle-model breach, jerk-bound breach, COA-simultaneity breach) and verifies the serialized text log Guardian receives matches the projection layer's internal record. Closes the silent-corruption hole in the projection-to-audit seam.",
  },
  {
    id: "paper-three-mode-explainer",
    source: "paper/apex-neurips-workshop-2026.md §3",
    title: "Coaching loop three modes",
    text: "Coaching pipeline runs in three modes: post-race coaching report (60s budget on RTX 4060: TTM + projector + Guardian + Instruct narration), in-session paddock summary (15s edge model on driver's browser), live HUD overlay (per-frame projection at 50Hz on sim-rig). All three share the same projector + Guardian audit contracts.",
  },
  {
    id: "decision-d004-research",
    source: "docs/decision-log.md D-004",
    title: "Research-tool discipline",
    text: "Research-tool discipline: every uncertain fact verified via Context7 -> tavily -> firecrawl -> EXA -> WebFetch before assertion. Never bluff a fact. Never invent FIA Article numbers. Every coaching claim cites a specific COA section and FIA Article via the provenance footer.",
  },
  {
    id: "decision-d024-physics-confidence",
    source: "docs/decision-log.md D-024",
    title: "Physics-confidence Mahalanobis downgrade",
    text: "Guardian audit conditions on a physics-confidence detector. Detector computes Mahalanobis distance between real-time telemetry channel distributions and the assumed Pacejka tire parameter limits + thermodynamic state envelope. If distribution shift exceeds threshold, Guardian downgrades the verdict from SAFE to REVIEW with an explicit reason citing the detector.",
  },
];

/**
 * Lexical retrieval via term-overlap with IDF weighting. Returns
 * top-k chunks sorted by score descending. Granite Embedding R2 swap
 * point: replace the scoring function with cosine similarity over
 * precomputed embeddings per wave-44 plan Vinh V8.
 */
export function retrieveChunks(
  query: string,
  k: number = 3,
): ReadonlyArray<RAGRetrieval> {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return [];

  // Precompute IDF over the inline corpus per term in the query.
  const idf = new Map<string, number>();
  for (const token of queryTokens) {
    let docCount = 0;
    for (const chunk of CORPUS) {
      if (tokenize(chunk.text).includes(token)) docCount++;
    }
    if (docCount > 0) {
      idf.set(token, Math.log(CORPUS.length / docCount));
    }
  }

  const scored: ReadonlyArray<RAGRetrieval> = CORPUS.map((chunk) => {
    const chunkTokens = tokenize(chunk.text);
    const titleTokens = tokenize(chunk.title);
    let score = 0;
    for (const token of queryTokens) {
      const tf = chunkTokens.filter((t) => t === token).length;
      const titleBoost = titleTokens.includes(token) ? 2 : 1;
      const tokenIdf = idf.get(token) ?? 0;
      score += tf * tokenIdf * titleBoost;
    }
    return { chunk, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .toSorted((a, b) => b.score - a.score)
    .slice(0, k);
}
