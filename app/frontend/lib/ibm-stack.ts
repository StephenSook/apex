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
  },
  {
    name: "Docling library",
    version: "latest",
    role: "Open-source IBM Docling conversion + table-extraction",
  },
  {
    name: "Granite Vision",
    version: "4.1 4B",
    role: "SRO + Britcar timing-sheet PDF to CSV",
  },
  {
    name: "Granite TimeSeries TTM",
    version: "r2.1",
    role: "Track 1 of D-010 three-track ensemble (frozen + channel-mix decoder)",
  },
  {
    name: "Granite FlowState",
    version: "9.1M",
    role: "Track 2 of D-010 (sampling-rate-invariant continuous-time SSM at 50 Hz)",
  },
  {
    name: "IBM TSPulse",
    version: "1M",
    role: "Polyphase time-frequency anomaly detector (D-016 Layer 2)",
  },
  {
    name: "Granite Embedding R2",
    version: "149M + 47M",
    role: "Hybrid dense + sparse RAG over setup + theory + COA (D-016)",
  },
  {
    name: "Granite Instruct",
    version: "4.1 8B",
    role: "Race-engineer narrator producing the coaching report",
  },
  {
    name: "Granite Guardian",
    version: "4.1 8B",
    role: "BYOC custom-rule audit + D-024 physics-confidence downgrade",
  },
  {
    name: "Granite 4.0 Nano",
    version: "350M",
    role: "In-browser WebGPU edge model via Transformers.js (D-019 + D-021)",
  },
  {
    name: "Langflow",
    version: "demo facade",
    role: "Orchestration graph export (D-017 demoted to facade per wave-30)",
  },
  {
    name: "IBM Bob",
    version: "latest",
    role: "Build accelerator per IBM Granite Ferrari case-study precedent",
  },
];

/**
 * IBM_STACK tuple-form adapter for /judges-page consumption. The
 * judges panel renders `[label, role]` tuples where the label
 * combines `name + version` into a single display string. Adapter
 * derives the tuple form from the canonical catalog so the tuple-
 * form rendering stays consistent with the object-form rendering on
 * the landing page.
 */
export const IBM_STACK_TUPLES: ReadonlyArray<readonly [string, string]> =
  IBM_GRANITE_STACK.map((tool) => [`${tool.name} ${tool.version}`, tool.role] as const);
