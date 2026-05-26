/**
 * Canonical IBM Granite stack catalog. Single source of truth for the
 * 15-tool inventory cited across `/` (StackBadges section) + `/judges`
 * (IBM_STACK panel) + paper §3.5 §3.6 + deck + 3-min pitch script.
 *
 * Wave-39 codex MED close-out (comment-analyzer says identical;
 * codex flagged drift): extracted from two duplicate inline arrays
 * (one in `app/page.tsx` StackBadges, one in `app/judges/page.tsx`
 * IBM_STACK) into this shared module so future tool-count or version-
 * pin changes (e.g. Granite 4.1 8B Instruct -> Granite 4.2 9B Instruct
 * post-NeurIPS-2026) propagate to every surface in a single commit.
 *
 * Wave-30 maximal architecture lock D-026: the 15-tool inventory is
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
 * 15-tool catalog asserts "every one load-bearing" but factual wire-up
 * status varies. Tier per tool surfaces the actual production routing
 * status so README + page + paper + deck copy can match reality.
 *
 * - WIRED: real production routing live at HEAD (verified live-smoke)
 * - INTEGRATION: frontend surface + canonical type contract shipped;
 *   backend swap-point documented (Vinh-scope V1-V15 per D-054); render path
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
   * Avoids the credibility-hit of "15 tools every one load-bearing"
   * narrative when 10 of 15 are still backend swap-points (INTEGRATION
   * tier) + 3 are build-time accelerators (ACCELERATOR tier).
   */
  readonly status: GraniteStackToolStatus;
}

/**
 * The 15-tool IBM Granite stack catalog (per D-058 wave-46 expansion:
 * prior 12-tool catalog plus Granite Instruct 4.1 3B chat-routing,
 * Granite Speech 4.1 2B-Plus Watson STT proxy preview, and Mellea v0.5.0
 * IVR-loop ACCELERATOR slot per D-060 reframe). Order is load-bearing:
 * the StackBadges grid renders tools in this order top-to-bottom + left-
 * to-right + the IBM_STACK panel mirrors the same sequence. Order
 * tracks pipeline data-flow: ingest (Docling, Vision) -> forecast
 * (TTM, FlowState, TSPulse) -> retrieval (Embedding) -> generation
 * (Instruct 8B + 3B + Speech) -> guardrails (Guardian) -> edge (Nano)
 * -> orchestration (LangGraph + MCP + ContextForge) -> build-time
 * accelerators (Docling library, IBM Bob, Mellea).
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
    // operational. Wave-46 Phase 4.2: /api/timing-sheet-parse extended
    // with multipart-POST wire-flip behind NEXT_PUBLIC_USE_REAL_TIMING_SHEET
    // env flag; forwards validated PDF to Vinh M3-V1 backend
    // (apex/instruct/timing_sheet_parser.py _parse_with_granite_vision)
    // when both backend deploys + flag set. Status flips to "WIRED" once
    // smoke-verified.
  },
  {
    name: "Granite TimeSeries TTM",
    version: "r2.1 + fine-tune",
    role: "Track 1 of D-010 three-track ensemble (frozen-backbone + channel-mix decoder fine-tune per D-052)",
    status: "INTEGRATION",
    // Wave-45 Phase 2 Block A close-out: Vinh shipped Day 4-5 backend
    // pipeline at apex/ttm/forecast.py + apex/physics/projection.py
    // (V2 cvxpylayers; D-050 byte-equality lock). G4 zero-shot bake-off
    // FAILED on speed_mps (~2x naive win); pre-committed pivot trigger
    // fired per docs/vinh-backend-plan.md L377; D-010 Track 1 channel-
    // mix decoder fine-tune elevated to production forecaster path per
    // feedback_g4_fail_pivot_documented_then_executed memory rule.
    // Engine-agnostic byte-equality boundary preserved as the load-
    // bearing technical-positioning claim. Status flips to "WIRED"
    // once Vinh wires the frontend /api/forecast endpoint to the new
    // fine-tuned channel-mix decoder + Stage A + Stage B per V12-V13.
  },
  {
    name: "Granite FlowState",
    version: "r1.1 18.5M",
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
    // wave-44 plan (Vinh-scope V1-V15 per D-054 wave-45). Wave-46 Phase 4.4:
    // NEW /api/tspulse/anomaly route ships canned-fallback + wire-flip behind
    // NEXT_PUBLIC_USE_REAL_TSPULSE env flag; flips to "WIRED" once both Vinh
    // M3-V7 backend deploys + flag set in Vercel.
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
    // M.3 spec extension. Wave-46 Phase 4.5: NEW /api/rag-retrieve route
    // ships lexical canned-fallback + wire-flip behind NEXT_PUBLIC_USE_REAL_RAG
    // env flag; flips to "WIRED" once both Vinh M3-V8 backend deploys + flag
    // set in Vercel.
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
    name: "LangGraph + MCP + ContextForge",
    version: "runtime (Langflow export-graph)",
    role: "Orchestration runtime per D-017 G7 + D-026 (Langflow demoted to export-graph facade per wave-30)",
    status: "INTEGRATION",
    // Wave-45 Phase 9 Block F V14 close-out per D-054: D-017 originally
    // demoted Langflow to FACADE wave-30 because the actual runtime path
    // is LangGraph + Granite MCP Gateway + ContextForge per D-026 maximal-
    // architecture lock. Frontend stub at /api/orchestration + the
    // LangGraphRuntimePanel surface ship the 6-node trace; Vinh M3-V14
    // wires apex/orchestration/langgraph_runtime.py to flip status from
    // INTEGRATION to WIRED.
  },
  {
    name: "IBM Bob",
    version: "n/a (documented inspiration only, not actively wired)",
    role: "Documented inspiration per IBM Granite Ferrari case-study precedent (bob.ibm.com is an AI dev-partner SaaS for engineer workflow, not a runtime APEX consumes); kept in inventory to acknowledge the architectural precedent but not load-bearing for any APEX runtime path",
    status: "ACCELERATOR",
    // Wave-46 Phase 4.8 honest reframing per Stephen Discord question
    // 2026-05-26 + `feedback_conceptual_stack_vs_shipped_stack.md` brutal-
    // judge rule. IBM Bob launched 2026-04-28 at bob.ibm.com as an AI
    // development partner SaaS for engineering team workflow (multi-model
    // routing across SDLC; Anthropic Claude + Mistral + Granite). It is NOT
    // a runtime model APEX invokes. APEX does NOT sign up for the Bob trial
    // + does NOT depend on Bob for any compliance threshold (we satisfy the
    // BeMyApp "use at least one of IBM Granite / Docling / Langflow /
    // Context Forge / IBM Bob" core-tool requirement four times over via
    // the other four entries). The Bob entry stays in the inventory to
    // acknowledge the architectural inspiration (Ferrari case-study) but is
    // explicitly NOT counted toward the active 14-tool stack; honesty tier
    // ACCELERATOR (lowest) reflects this. Judges who probe will see honest
    // framing instead of a planted "we use Bob" implication.
  },
  {
    name: "Granite Instruct 3B",
    version: "4.1 3B",
    role: "Fast-path AICopilotChat routing for simple queries (D-058 wave-46 add)",
    status: "INTEGRATION",
    // Wave-46 Phase 6.1: 3B fast-path routing on AICopilotChat. Intent
    // classifier routes simple queries to 3B, complex to 8B Instruct.
    // Frontend ships behind NEXT_PUBLIC_USE_GRANITE_3B_ROUTING env flag
    // default false. Status flips to "WIRED" once Vinh wires the
    // chat_router.py 3B fast-path in backend.
  },
  {
    name: "Granite Speech",
    version: "4.1 2B-Plus",
    role: "Speaker-attributed ASR + word-level timestamps replacing Web Speech (D-058 wave-46 add)",
    status: "INTEGRATION",
    // Wave-46 Phase 5: Granite Speech 4.1 2B-Plus replaces the Web Speech
    // API HEAD path on VoiceDebriefInput. Vinh wires Watson STT backend
    // proxy via vLLM serve at /api/stt. Multilingual EN/FR/DE/ES/PT/JA.
    // Status flips to "WIRED" once Vinh ships stt_proxy.py.
  },
  {
    name: "Mellea",
    version: ">=0.5.0",
    role: "Instruct-Validate-Repair tri-agent critic loop on narrator (IBM Research open source library, Apache 2.0)",
    status: "ACCELERATOR",
    // Wave-46 Phase 5: real IBM Research library generative-computing/mellea
    // wires Instruct-Validate-Repair loop on narrator. Pydantic schemas +
    // req() validators on FIA Article + COA section + citation + conditional
    // phrasing per HARD-COMPLIANCE. Multi-backend including WatsonX.
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
