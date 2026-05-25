/**
 * Canonical IBM Granite stack catalog. Single source of truth for the
 * 12-tool inventory cited across `/` (StackBadges section) + `/judges`
 * (IBM_STACK panel) + paper §3.5 §3.6 + deck + 3-min pitch script.
 *
 * Wave-39 codex MED close-out (comment-analyzer says identical;
 * codex flagged drift): extracted from two duplicate inline arrays
 * (one in `app/page.tsx` StackBadges, one in `app/judges/page.tsx`
 * IBM_STACK) into this shared module so future tool-count or version-
 * pin changes (e.g. Granite 4.1 8B Instruct -> Granite 4.2 9B Instruct
 * post-NeurIPS-2026) propagate to every surface in a single commit.
 *
 * Wave-30 maximal architecture lock D-026: the 12-tool inventory is
 * the "shouldn't-be-possible move" surface. Adding or removing any
 * tool MUST update:
 *   1. This file (the canonical list).
 *   2. paper/apex-neurips-workshop-2026.md §3.5 + §3.6.
 *   3. docs/architecture-spec.md Appendix W30 tool catalog.
 *   4. PLAN.md row 4.X (tool-specific row in the stack roadmap).
 *   5. README.md tool inventory list.
 *   6. deck storyboard "IBM stack" slide.
 */

/**
 * Wave-44 honesty tier per gemini-agent BLOCKER 4 (2026-05-24): the
 * 12-tool catalog asserts "every one load-bearing" but factual wire-up
 * status varies. Tier per tool surfaces the actual production routing
 * status so README + page + paper + deck copy can match reality.
 *
 * - WIRED: real production routing live at HEAD (verified live-smoke)
 * - INTEGRATION: frontend surface + canonical type contract shipped;
 *   backend swap-point documented (Vinh-scope V1-V11); render path
 *   stays identical between mock + real per Stream M.3 spec extension
 * - FACADE: demoted to demo-facade per a project decision (e.g. D-017
 *   Langflow facade per wave-30); does not represent runtime wiring
 * - ACCELERATOR: build-time / development tooling, not runtime routing
 */
export type GraniteStackToolStatus = "WIRED" | "INTEGRATION" | "FACADE" | "ACCELERATOR";

export interface GraniteStackTool {
  /**
   * Display name (e.g. "Granite-Docling"). Excludes the version
   * suffix so the StackBadges + IBM_STACK + deck + paper layouts
   * can render the version in their own typographic style (mono
   * caps badge for StackBadges, parenthetical for IBM_STACK, plain
   * numeric for paper / deck).
   */
  readonly name: string;
  /**
   * Version string. Free-form so the catalog can mix model-card
   * parameter counts ("258M", "4.1 8B"), release tags ("r2.1",
   * "latest"), and demo-facade labels ("demo facade"). Surfaces
   * format-pick by typographic role.
   */
  readonly version: string;
  /**
   * Long-form role description with cross-references to relevant
   * decision-log entries (D-010, D-016, D-019, D-021, D-024) +
   * architecture-spec layer numbers (Layer 0-7).
   */
  readonly role: string;
  /**
   * Wave-44 honesty tier per gemini-agent BLOCKER 4 close-out: factual
   * production-routing status at HEAD. Used by the StackBadges grid +
   * IBM_STACK panel to render an explicit "WIRED" / "INTEGRATION"
   * pill per tool so README + page copy + paper match runtime reality.
   * Avoids the credibility-hit of "12 tools every one load-bearing"
   * narrative when 7 of 12 are still backend-swap-point mocks.
   */
  readonly status: GraniteStackToolStatus;
}

/**
 * The 12-tool IBM Granite stack catalog. Order is load-bearing: the
 * StackBadges grid renders tools in this order top-to-bottom + left-
 * to-right + the IBM_STACK panel mirrors the same sequence. Order
 * tracks pipeline data-flow: ingest (Docling, Vision) -> forecast
 * (TTM, FlowState, TSPulse) -> retrieval (Embedding) -> generation
 * (Instruct, Guardian) -> edge (Nano) -> orchestration (Langflow,
 * Bob).
 */
export const IBM_GRANITE_STACK: ReadonlyArray<GraniteStackTool> = [
  {
    name: "Granite-Docling",
    version: "258M",
    role: "FIA COA PDF to structured JSON parser",
    status: "INTEGRATION",
  },
  {
    name: "Docling library",
    version: "latest",
    role: "Open-source IBM Docling conversion + table-extraction",
    status: "ACCELERATOR",
  },
  {
    name: "Granite Vision",
    version: "4.1 4B",
    role: "SRO + Britcar timing-sheet PDF to CSV",
    status: "INTEGRATION",
    // Wave-44 Phase 6c: frontend GraniteVisionParser component live
    // on /judges + POST /api/timing-sheet-parse canned-fixture path
    // operational. Status flips to "WIRED" once Vinh M3-V1 swaps in real
    // Granite Vision 4.1 4B inference per Stream M.3 contract.
  },
  {
    name: "Granite TimeSeries TTM",
    version: "r2.1",
    role: "Track 1 of D-010 three-track ensemble (frozen + channel-mix decoder)",
    status: "INTEGRATION",
    // Wave-44 Phase 6d: ThreeTrackForecastChart per-track tier badge
    // surfaces TTM as INTEGRATION (Vinh M3-V3 backend swap-point at Phase 1
    // task 1.3 + 1.4). Status flips to "WIRED" once V3 lands.
  },
  {
    name: "Granite FlowState",
    version: "9.1M",
    role: "Track 2 of D-010 (sampling-rate-invariant continuous-time SSM at 50 Hz)",
    status: "INTEGRATION",
    // Wave-44 Phase 6d: ThreeTrackForecastChart per-track tier badge
    // surfaces FlowState as MOCK at HEAD. Backend swap-point Vinh M3-V10
    // (subsequent iteration). Status stays INTEGRATION on the inventory
    // (frontend contract live; backend route documented).
  },
  {
    name: "IBM TSPulse",
    version: "1M",
    role: "Polyphase time-frequency anomaly detector (D-016 Layer 2)",
    status: "INTEGRATION",
    // Wave-44 Phase 6a: frontend TSPulseAnomalyPanel 5-state discriminated
    // union mounted on /judges (mock data via MOCK_TSPULSE_ACTIVE);
    // backend swap-point Vinh M3-V7 endpoint POST /api/tspulse/anomaly per
    // wave-44 plan (Vinh-scope V1-V11). Status flips to "WIRED" once
    // Vinh M3-V7 lands.
  },
  {
    name: "Granite Embedding R2",
    version: "149M + 47M",
    role: "Hybrid dense + sparse RAG over setup + theory + COA (D-016)",
    status: "INTEGRATION",
    // Wave-44 Phase 6b: frontend RAG retrieval surface live on the
    // AICopilotChat path via lexical TF-IDF retrieval over inline
    // corpus chunks (architecture-spec + decision-log + methodology
    // + paper §3). Granite Embedding R2 swap-point: Vinh M3-V8 server-
    // side cosine similarity over precomputed embeddings per Stream
    // M.3 spec extension. Status flips to "WIRED" once V8 lands.
  },
  {
    name: "Granite Instruct",
    version: "4.1 8B",
    role: "Race-engineer narrator producing the coaching report",
    status: "WIRED",
  },
  {
    name: "Granite Guardian",
    version: "4.1 8B",
    role: "BYOC custom-rule audit + D-024 physics-confidence downgrade",
    status: "INTEGRATION",
  },
  {
    name: "Granite 4.0 Nano",
    version: "350M",
    role: "In-browser WebGPU edge model via Transformers.js (D-019 + D-021)",
    status: "WIRED",
  },
  {
    name: "Langflow",
    version: "demo facade",
    role: "Orchestration graph export (D-017 demoted to facade per wave-30)",
    status: "FACADE",
  },
  {
    name: "IBM Bob",
    version: "latest",
    role: "Build accelerator per IBM Granite Ferrari case-study precedent",
    status: "ACCELERATOR",
  },
];

/**
 * IBM_STACK tuple-form adapter for /judges-page consumption. The
 * judges panel renders `[label, role, status]` 3-tuples where the
 * label combines `name + version` into a single display string + the
 * status mirrors the BLOCKER 4 honesty tier so the /judges panel
 * matches the / StackBadges per-tool pill rendering.
 *
 * Wave-44 Phase 4 Gemini BLOCKER 4 close-out: extended from 2-tuple
 * to 3-tuple to surface the per-tool honesty tier on the /judges
 * surface alongside the landing page. Render path consumes
 * `[label, role, status]` + renders a status pill per tool.
 */
export const IBM_STACK_TUPLES: ReadonlyArray<readonly [string, string, GraniteStackToolStatus]> =
  IBM_GRANITE_STACK.map((tool) => [`${tool.name} ${tool.version}`, tool.role, tool.status] as const);
