# Wave-30 Maximal Architecture Lock: Research Sources

7 research sources from the 2026-05-21 / 2026-05-22 multi-model deep research synthesis. This directory is the canonical reference for APEX's maximal architecture as locked by the NotebookLM synthesis at the end of the pass. All downstream PLAN.md rows, decision-log entries D-009 through D-022, paper §3 rewrite, arch-spec maximal expansion, Vinh-handoff rewrite, and frontend type expansion cite these sources.

The numbering matches NotebookLM's source-loading order in `09-notebooklm-synthesis-2026-05-22.md` (the synthesis pass).

## Source manifest

| # | File | Source | Role | Date |
|---|------|--------|------|------|
| 01 | `01-perplexity-prior-art-sweep.pdf` | Perplexity Deep Research | Prior-art scout: confirms what already exists in literature + what doesn't (the "confirmed absences" that prove APEX's novelty) | 2026-05-22 |
| 02 | `02-gemini-physics-frontier-8-tier-stack.pdf` | Gemini 2.5 Pro Deep Research | Maximal vehicle-dynamics math frontier: Pacejka combined-slip, transient tire ODE, two-mass thermal, three-component load transfer, double-track, 3D track geometry, aerodynamics, adaptive hand-controls (8 tiers above current constant-mu floor) | 2026-05-22 |
| 03 | `03-chatgpt-polyphase-aggregation-gap.pdf` | ChatGPT Deep Research | Single hardest sub-problem: 50 Hz raw telemetry to 1 Hz TTM context window without information loss. Recommends polyphase decomposition (50 phase streams, zero information loss) + 50 Hz feasible-lift projector | 2026-05-22 |
| 04 | `04-claude-connective-tissue-physicsttm.pdf` | Claude Deep Research (wide pass) | Integration architecture connecting forecasting layer + physics-projection layer + Guardian. Locks (B, 30, 14) tensor contract + FastAPI multipart contract + COA-PDF-to-constraint mechanism + cvxpylayers vs qpth vs theseus comparison + 8-tier physics constraint roadmap + 12-day build plan | 2026-05-22 |
| 05 | `05-claude-ai-architecture-frontier.pdf` | Claude Deep Research (architecture pass) | AI/architecture frontier above the physics layer. Three-track forecasting stack (Granite TTM r2.1 + FlowState + Chronos-2), expanded 12-tool IBM Granite stack, LangGraph + MCP + ContextForge orchestration, tri-agent Agent-as-Judge critic loop, RAG with Granite Embedding R2, LIPS 4-axis evaluation, APEX-Bench public benchmark, 5 shouldn't-be-possible moves (WebGPU Granite Nano + aLoRA + GEPA + EAGLE-3 + Agent-as-Judge) | 2026-05-22 |
| 06 | `06-claude-decision-brief-five-open-questions.pdf` | Claude Deep Research (decision brief) | Closes the 5 open architectural questions from NotebookLM synthesis: gradient bridge two-regime seam, WebGPU scope cut, lexicographic COA hierarchy with elastic slacks, MLPerf-style tolerance bands, physics-confidence detector for Guardian conditioning. Includes day-by-day implementation plan with explicit fallback triggers + the Day-3 SCP go/no-go gate | 2026-05-22 |
| 07 | `07-apex-repo-state-snapshot.md` | Claude live repo read | Snapshot of github.com/StephenSook/apex at 222 commits. Documents committed architecture (frozen TTM + 1-Hz aggregation + two-stage convex-QP-plus-filter validator + 8-tool Granite stack), built vs unbuilt state, TTM org-invite schedule gate, and the two contradictions wave-30 synthesis resolved (three-way frequency-strategy fork + convexity tension) | 2026-05-22 |
| 08 | `08-physicsttm-kinetic-hallucination-mitigation.md` | Original PIT WALL Phase 5 spec (PIT WALL era; carried into APEX) | Original three-layer architecture spec defining the skeleton everything else thickens: Layer A frozen TTM forecaster, Layer B differentiable physics-projection layer, Layer C Granite Guardian audit. The "kinetic hallucination" framing was first locked + pressure-tested here | 2026-05-19 |
| 09 | `09-notebooklm-synthesis-2026-05-22.md` | NotebookLM synthesis pass | 6-question synthesis over sources 01-08. Locked: (1) frequency-strategy unification, (2) maximal end-to-end architecture across all layers, (3) convexity tension resolution via unrolled SCP, (4) NeurIPS central claim, (5) five remaining open technical questions, (6) dependency-correct build order + 4 hard sync points | 2026-05-22 |

## Synthesis verdict (NotebookLM, source 09)

**Central NeurIPS claim:** Frozen-TSFM + hard differentiable physics-projection composition. Confirmed absence in literature per Perplexity sweep (every published PINN / neural-projection paper trains the predictor; nobody freezes a domain-agnostic TSFM + applies hard projection at inference). Supporting contributions: kinetic hallucination as named failure mode, polyphase 50 Hz feasible-lift projector, APEX-Bench public benchmark release.

**Frequency strategy (resolved):** 1 Hz aggregation + polyphase decomposition + Granite FlowState all coexist as three concurrent paths with assigned jobs. 50 Hz feasible-lift projector is the unifier that fuses them. No path is cut.

**Convexity tension (resolved):** Convex QP becomes inner iterate of an outer 3-iteration unrolled SCP loop. cvxpylayers locked (only library supporting SOCP friction circle). v_x near-zero gradient singularity handled via Tikhonov damping ε = 0.5 m/s + tanh saturation below 1 m/s. Stiff-ODE transient tire dynamics handled via steady-state algebraic substitution for the inner solver; full transient reserved for offline validation.

**Gradient bridge (resolved):** Two-regime seam at the SCP projector output. Gradients flow above (TTM head + physics projection trained by gradient descent). Below the seam (Mellea repair + tri-agent critic + prompts) optimized by DSPy/GEPA reflective evolution; no end-to-end backprop attempted.

**WebGPU scope (resolved):** 30-line Newton friction-ellipse projection in browser. Server-authoritative reconnect. No mechanical recommendations offline; edge model produces draft summaries the server overwrites.

**COA conflicts (resolved):** Lexicographic constraint hierarchy. Tier-0 (kinematic feasibility) + Tier-1 (regulatory safety) are inviolable; Tier-2+ relax via elastic slacks if a COA adaptation makes a corner kinematically impossible.

**Cross-hardware reproducibility (resolved):** MLPerf-style tolerance-banded benchmark protocol with deterministic seed locks + dockerized evaluation harness + explicit floating-point tolerance bounds. Variance report published comparing RTX vs Apple Silicon.

**Physics-confidence detector (resolved):** Composite Mahalanobis-distance detector on telemetry-vs-tire-parameter distribution shift, feeding Granite Guardian BYOC so the safety verdict explicitly conditions on whether the physics model is trustworthy this session. Framed in paper §5 as a research contribution, not a solved problem.

## 4 hard sync points (from synthesis Q6)

1. **Sync Point 1 (Day 1-2):** Data contract lock. FastAPI multipart contract + (B, 30, 14) tensor contract. Independent of TTM org-invite. Vinh can ship Day 1.
2. **Sync Point 2 (Day 4-6):** Orchestration end-to-end. LangGraph + MCP + ContextForge dummy run from ingestion through RAG to frontend.
3. **Sync Point 3 (Day 7-9):** Physics projection convergence. Three-track forecast tensor flows through 8-tier unrolled SCP without crashing or vanishing gradients.
4. **Sync Point 4 (Day 10-12):** Final evaluation lock. LIPS 4-axis ablation table populated; APEX-Bench prepared for release; FCVR = 0.00 verified; 60-second industrial-readiness latency budget met.

## Day-3 SCP go/no-go gate (from source 06)

**The single most important checkpoint in the 12-day build.** Day 3 EOD: Vinh prototypes whether 3 unrolled SCP iterations actually converge through cvxpylayers with the 8-tier Pacejka linearization on the RTX 4060. If it oscillates, drop to 2 iterations plus a trust-region penalty. If it still oscillates, escalate to D-A revision (per `docs/vinh-backend-plan.md` G0 escalation rule).

## Cross-references

- Decision-log entries D-009 through D-022 carry the architectural locks from this synthesis.
- PLAN.md status snapshot + new rows for 8-tier physics + 12-tool stack + LangGraph/MCP/ContextForge + RAG + tri-agent + LIPS + APEX-Bench + 5 shouldn't-be-possible all derive from source 05 + 09.
- `paper/apex-neurips-workshop-2026.md` §3 rewrite, §4 LIPS, §13 references expansion all derive from sources 04 + 05 + 09.
- `docs/architecture-spec.md` maximal expansion derives from sources 02 + 04 + 09.
- `docs/vinh-backend-plan.md` rewrite (V2/V3 labels removed; 8-tier physics in-scope; Day-3 SCP go/no-go gate added) derives from sources 02 + 04 + 06 + 09.

## Reproducibility

If a future cold-reviewer wants to verify these architectural decisions against the source material:

1. The PDFs (sources 01-06) carry the verbatim research outputs. Read them directly.
2. The .md files (sources 07-09) carry the snapshot + synthesis. Read them in the order shown.
3. Cross-reference against the decision-log entries to verify which decision derives from which source.

Galaxy ambition: everything in this directory is **in-scope** for the 2026-05-31 submission. No V2 / V3 / post-hackathon labels. The maximal architecture is the target.

_Wave-30 source bundle finalized 2026-05-22 by Stephen + Claude per directive to land the full multi-model synthesis as the project's architectural ceiling._
