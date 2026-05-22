# APEX Decision Log

Every locked decision with rationale + date + scope. Newest first.

---

## 2026-05-20 D-001: Project renamed PIT WALL → APEX

**Decision.** Project name is APEX.

**Rationale.** BeMyApp portal showed a competing submission titled "PitWall" (cinematic GoPro AI race engineer for amateur drivers using GoPro footage). Different audience and product (amateur sim-and-track-day coaching vs adaptive-racer post-race coaching) but visual name collision in 43-team grid creates judge confusion. APEX is universal racing vocabulary (every corner has one), two syllables, no major brand collision. Backronym A.P.E.X. = Adaptive Performance Engineer (with) eXplanation.

**Affected.** All collateral: repo name, README, deck, video, all stakeholder emails sent on 2026-05-19 (which were still under PIT WALL branding but the substance fully transfers; outreach replies if any will route to APEX).

---

## 2026-05-20 D-002: Monorepo, public Day 1, Apache 2.0

**Decision.** Single GitHub repo at https://github.com/StephenSook/apex. Public from Day 1. Apache 2.0 license. Holds app code + physics-tsfm library + research PDFs + deck + paper draft + Bob session logs in one tree.

**Rationale.** Atomic-commit green-squares visibility matters for IBM judges who may check repo history during evaluation. Public from Day 1 also signals confidence. Single repo simplifies Vinh's onboarding and submission URL.

**Affected.** All build work for the next 12 days. Vinh added as collaborator (pending his GitHub handle).

---

## 2026-05-20 D-003: Galaxy-tier scope rule

**Decision.** Nothing post-hackathon. Nothing stretch. Every enhancement, paper draft, beta-tester quote, June bridge architecture, live sim-rig mode, Colab notebook, judges-tour page, status dashboard, methodology trace, IBM Consulting outreach, multi-track submission entry. All in scope by 2026-05-31 11:59 PM ET.

**Rationale.** Stephen explicit: "We're aiming for the galaxy, not the moon. Nothing should be post-hackathon; everything should be within the scope right now so we can have the best project ever." This reframes the 12-day plan from default-scope to all-in-scope. A feature shipped at 70% quality on Day 11 beats a feature deferred to a v2 that judges never see.

**Affected.** Plan §16 enhancements, §17 external-tool layers, §18 inclusions list, all formerly-stretch items. Memory rule installed at `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/feedback_galaxy_ambition_no_deferrals.md`.

---

## 2026-05-20 D-004: Research-tool discipline as durable rule

**Decision.** When uncertain about a fact, library version, API behavior, FIA regulation, IBM Granite model card detail, or person's role/email: verify with a research tool (Context7 → tavily → firecrawl → EXA → WebFetch) BEFORE asserting in code, deck, email, or memory.

**Rationale.** APEX ships to IBM judges who may include time-series ML researchers. A single false claim turns the demo into a credibility hit. Cost of one research-tool call is seconds; cost of one wrong claim is the prize.

**Affected.** All future work on this project. Memory rule installed.

---

## 2026-05-20 D-005: State-sync protocol via Obsidian + project memory

**Decision.** Every substantive work session ends with a Claude Memory write to Obsidian at `Claude Memory/Session - YYYY-MM-DD - apex-<slug>.md`. Project facts live durably in `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/`. Obsidian APEX MOC is the chronological hub.

**Rationale.** If VS Code crashes or a new chat opens cold, the next session can recover full state from `Home.md` → `APEX MOC` → last 3 Claude Memory entries. Three persistence layers: memory (facts), Obsidian project notes (structure), Claude Memory (chronicle).

**Affected.** Every session for the next 12 days.

---

## 2026-05-20 D-006: No git hooks, manual coordination only

**Decision.** `.git/hooks/` contains only the 14 `.sample` defaults that git ships with. No Husky, no lefthook, no pre-commit, no commit-msg validators, no CLI wrappers. Coordination is manual via PLAN.md edits.

**Rationale.** Stephen and Vinh have shipped Trace, Hometown-Pathway-Atlas, Compass, and Nest using the same manual-coordination convention (Hometown PLAN.md task 0.4 verbatim: "Coordination is manual (mirrors Trace) - no hooks, no CLI"). Hooks introduce three failure modes the 12-day hackathon cannot afford: commit-blocking on lint glitches when a hotfix is needed mid-incident, hook divergence across the two laptops, and silent-bypass-via-`--no-verify` that defeats the gate anyway. CI on push to main is the quality gate that replaces hooks.

**Affected.** All commits Day 1-12. Verified Day 1 PM via `ls -la .git/hooks/`: only `*.sample` files present.

---

## 2026-05-20 D-007: Quality over speed, tool-inventory audit BLOCKING

**Decision.** Before any non-trivial task (commit-worthy work, design decision, deck section, outreach email, demo recording, paper draft), the operator (Claude or Stephen) runs a tool-inventory audit and names at least 5 candidate skills / agents / MCPs / connectors from the available inventory that could raise the result. Pick the top 1-2. Use them. Save findings to memory.

**Rationale.** Stephen explicit on Day 1 (2026-05-20): "Quality over speed. Do not rush things. Make sure you're going through every single skill, every single superpower, every single plugin, every single MCP, every single connector." This rule is the operational implementation of the global hackathon-project-flow Phase 1 principle ("tool-inventory audit BLOCKING before non-trivial tasks"). The project will be won by depth, not by velocity. A 70%-quality feature shipped at Day 11 beats a 90%-quality feature deferred to a hypothetical v2 only when the 70%-quality feature is the ONLY surface that exists; for tasks with quality variance, the rule is "use the highest-impact tools."

**Affected.** Every non-trivial Claude tool-use sequence for the 12-day build. Memory rule installed at `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/feedback_quality_over_speed.md`. Codex independent review wave 2 Day 1 EOD applied this principle (BLOCKER findings B1 + B2 surfaced because the manual-grep-and-fix sweep was lower-leverage than the Codex adversarial review).

---

## 2026-05-19 D-A: PhysicsTTM three-layer architecture (locked pre-rename, carried into APEX)

**Decision.** Three-layer architecture: frozen Granite TimeSeries TTM forecaster → two-stage projection-and-audit layer (Stage 1 differentiable CvxpyLayer QP enforcing the convex constraints friction ellipse + forward-Euler kinematic step + jerk bound; Stage 2 post-projection feasibility filter auditing the nonconvex constraints bicycle-model coupling + COA-parameterized brake-throttle simultaneity gate) → Granite Guardian BYOC text audit on combined serialized violation log.

**Rationale.** Phase 5 NotebookLM gap analysis surfaced "Kinetic Hallucination": TTM trained on energy grids and weather can forecast physically impossible motorsport telemetry. The three-layer architecture closes this objection. Convergence 14 (serialization integrity) is the load-bearing safety requirement.

**Refinement (2026-05-21 night-late, wave-25 closure of wave-24 BLOCKER B1+B2).** D-A originally framed the middle layer as a single "differentiable physics-projection layer (CvxpyLayer QP with friction ellipse, bicycle model, COA-flagged simultaneity)." Wave-24 cold-review caught that bicycle-model coupling and the COA-parameterized brake-throttle simultaneity gate are nonconvex constraints that cannot live inside a CvxpyLayer (CvxpyLayer requires Disciplined Convex Programming). The middle layer is therefore split into Stage 1 (the convex QP that CvxpyLayer can host: friction ellipse + forward-Euler + jerk bound) and Stage 2 (a post-projection feasibility filter that audits the bicycle and COA constraints). The architectural intent is unchanged; the technical contract is now honest about CvxpyLayer's convexity-only support. D-A is amended, not superseded.

**Affected.** Backend architecture, deck slide 6, Q&A Card 2.

---

## 2026-05-19 D-B: Dual-layer pitch headline + Q&A killshot reserved (carried into APEX, refined Day 1 PM 2026-05-20)

**Decision.** Pitch architecture has two leads, both ship in the deck + video + landing page:

1. **Emotional hero headline (h1 on the landing page, lead line of the 3-minute video):** "The race engineer for the drivers who don't have one." This is the human-story hook. Calibrated by Phase 4.5 hostile-pitch review (Kimi) as the most universally accessible opening beat.
2. **Technical positioning headline (Differentiator #1 card on the landing page, slide 4 in the deck):** "First integrated workflow for adaptive hand-controls." This is the technical-novelty anchor that distinguishes APEX from Track Titan, Trophi.ai, and the generic AI race-engineer category.

**Q&A killshot reserved:** COA-parameterized brake-throttle simultaneity (the deepest novelty per NotebookLM Phase 5 Q4 verdict). Deployed only when a judge presses "why not just Track Titan or Trophi.ai." Card 4 in `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_qa_killshots.md`.

**Rationale.** Phase 5 NotebookLM Q4 audit: candidate 3 (integrated workflow) is the most accessible *technical* positioning. The Kimi hostile-pitch review separately identified that leading with the technical claim loses the emotional hook for judges scanning 43 submissions. The synthesis: lead Hero with emotion ("drivers who don't have one"), lead Differentiator panel with technical positioning ("first integrated workflow"), hold COA simultaneity for the Q&A knockout. All three are present in every submission surface (landing page, deck, video, Q&A pack). None are mutually exclusive.

**Affected.** Pitch script (3-min video Day 9), deck (Day 11), landing page (live Day 1 PM), Q&A flashcards (Card 4 in memory).

---

## 2026-05-22 D-009: Wave-30 Maximal Architecture Lock (umbrella)

**Decision.** Stephen ran a 12-hour multi-model deep-research synthesis 2026-05-21 / 2026-05-22 across Perplexity (prior-art scout) + Gemini (8-tier vehicle-dynamics math frontier) + ChatGPT (polyphase aggregation gap) + Claude (connective tissue + AI/architecture frontier + decision brief) + NotebookLM (6-question synthesis pass). 9 sources land at `research/wave-30/`. Per Stephen's galaxy ambition directive, all locked recommendations from the synthesis are in-scope for the 2026-05-31 submission. No V2 / V3 / post-hackathon labels. D-009 through D-027 below are the granular architectural locks derived from this synthesis.

**Rationale.** Wave-29 cold-review pattern (visualization-catches-numeric-drift, pre-mortem row 51) plus Stephen's explicit "we have time, we're aiming for the galaxy, do not restrain anything, me and Vinh can build this" directive flips the project's default posture from conservative-scope to maximal-ceiling. The maximal ceiling is the build target.

**Affected.** Every layer of the pipeline. PLAN.md status snapshot + all sub-rows for Phase 2 + 3 + 4 + 5 + 6 (paper). arch-spec maximal expansion (Layer 0 through Layer 8 with new layers). paper §3 rewrite + §4 LIPS + §13 references. Vinh-handoff rewrite (V2 / V3 labels OUT, 8-tier physics + 12-tool stack IN). Frontend types + EXTENDED_PHYSICS_FIXTURES catalogue. Pre-mortem new failure-mode rows.

**Cross-reference:** `research/wave-30/README.md` source manifest + `research/wave-30/09-notebooklm-synthesis-2026-05-22.md` synthesis pass.

---

## 2026-05-22 D-010: Three-track forecasting ensemble (TTM r2.1 channel-mix + FlowState + Chronos-2)

**Decision.** Layer 3 forecasting is now a three-track ensemble. Track 1 = Granite TimeSeries TTM r2.1 running channel-mixing decoder fine-tune on polyphase 1 Hz phase-time streams (5% of target data, ~minutes on RTX 4060). Track 2 = Granite FlowState (9.1M params, sampling-rate-invariant continuous-time state-space, native 50 Hz). Track 3 = Amazon Chronos-2 (21 quantiles, zero-shot probabilistic baseline, maps uncertainty corridor). The (B, 30, 14) tensor contract from Sync Point 1 is the output of the fused ensemble, not just TTM.

**Rationale.** D-A original "bare zero-shot TTM" is not a defensible NeurIPS story because (a) channel-independent TTM cannot natively learn cross-channel physical relationships, (b) zero-shot point forecasts have no uncertainty band for the next-session-envelope claim, (c) a single forecaster ties the whole story to a single model's failure mode. Channel-mixing fine-tune + FlowState rate-invariance + Chronos-2 probabilistic baseline together address all three. Source 05 + source 09 Q2.

**Affected.** Layer 3 in arch-spec. Paper §3.1 + §4 (Track 1+2+3 as ablation rows). PLAN row 2.6 + 2.8 (TTM forecaster). New 12-tool Granite stack: 12 tools (was 8).

---

## 2026-05-22 D-011: Multi-frequency coexistence + 50 Hz feasible-lift projector unifier

**Decision.** Three frequency strategies coexist, no path is cut. Path A = 1 Hz mini-sector aggregation (coarse macroscopic backbone). Path B = polyphase decomposition (50 phase streams at 1 Hz, interleaved to 50 Hz output, zero information loss, no aliasing). Path C = Granite FlowState (sampling-rate-invariant, native 50 Hz). Unifier = 50 Hz differentiable physics-projection layer that fuses all three paths and enforces vehicle-dynamics constraints on the fused 50 Hz tensor.

**Rationale.** Repo committed 1 Hz aggregation; ChatGPT source 03 recommends polyphase; Claude source 05 recommends FlowState. NotebookLM synthesis source 09 Q1 says do not pick one; assign jobs and exploit each strategy's mathematical guarantee. Polyphase preserves all 50 native samples + bypasses 0.5 Hz Nyquist ceiling. FlowState handles irregular rates that polyphase cannot downsample cleanly. 1 Hz aggregation stays as the macroscopic backbone consistent with TTM's pretraining envelope.

**Affected.** Layer 2 (preprocessing) + Layer 4 (physics projection) in arch-spec. Paper §3.2 frequency-strategy paragraph. PLAN row 2.4 (preprocessor) + 2.9 (projection layer). Vinh-handoff rewrite. Decision-log D-A refinement (1 Hz aggregation framing is now one of three concurrent paths, not the sole rate).

---

## 2026-05-22 D-012: Unrolled SCP outer loop (3 fixed iterations) wrapping convex QP inner stage

**Decision.** The two-stage convex QP plus feasibility filter (D-A refinement) is promoted: convex QP becomes inner iterate of an outer unrolled Sequential Convex Programming (SCP) loop. The non-convex 8-tier physics (Pacejka combined-slip + transient + thermal + load transfer + double-track + 3D track + aero + adaptive hand-controls) is handled by first-order Taylor linearization around the previous iterate, fed back into the inner solver. **Convergence criterion is a fixed 3-iteration unroll**, not a dynamic tolerance. The fixed unroll lets PyTorch unroll the computation graph completely so gradients flow backward through all 3 iterations to the frozen TTM forecasting inputs.

**Rationale.** NotebookLM Q3 synthesis. Source 03 + source 02 both flagged that full nonlinear vehicle dynamics is non-convex and a single clean QP cannot hold the maximal physics. The dynamic-convergence option would break backward-pass determinism. Fixed 3-iteration unroll preserves gradient flow + locks the computation graph. The wave-29 feasibility-filter framing in D-A is superseded by the outer loop's linearization update step.

**Affected.** Layer 4 in arch-spec (Layer 4 expansion). Paper §3.2 SCP formulation. PLAN rows 2.9a + 2.9b (the old Stage 1 / Stage 2 split is reframed). Vinh-handoff (Day 3 SCP go/no-go gate per D-027). Decision-log D-A refinement.

---

## 2026-05-22 D-013: cvxpylayers locked as the differentiable optimization layer

**Decision.** cvxpylayers is the only viable differentiable optimization layer for APEX's inner SCP iterate. qpth and theseus are explicitly rejected.

**Rationale.** NotebookLM Q3. qpth (OptNet) is QP-only and lacks SOCP support; the 2D / 3D friction ellipse constraint `||(ax, ay)||_2 <= μ * g` is fundamentally a second-order cone. theseus applies constraints as soft penalties (weighted cost terms) which defeats hard-projection's whole point. cvxpylayers natively supports DPP-compliant SOCP problems and provides exact implicit differentiation on the backward pass. Source 04 connective-tissue comparison + source 03 convexity warning + source 09 Q3 verdict all converge here.

**Affected.** Vinh-backend-plan §Phase 2 (Day 4 commit). arch-spec Layer 4 implementation block. PLAN row 2.9a Notes. paper §3.2 method paragraph names cvxpylayers + cites Agrawal et al. 2019.

---

## 2026-05-22 D-014: Numerical hazard resolution (Tikhonov damping + tanh saturation + stiff-ODE steady-state algebraic substitution)

**Decision.** Two numerical hazards in the SCP inner solve get explicit fixes baked into the implementation contract.

**(1) v_x near-zero gradient singularity** (slip ratios divide by longitudinal velocity; pit exits + spun vehicles create infinite gradients): Tikhonov damping ε = 0.5 m/s added to denominators. For v < 1 m/s, tire forces frozen via smooth `torch.tanh` saturation. Removes singularity, preserves continuous gradient flow.

**(2) Stiff-ODE problem in transient tire dynamics** (relaxation length L_y / v_x explodes at low speed; Forward-Euler integration oscillates + explodes gradients): inner solve replaces stiff ODE with steady-state algebraic solution. Full transient dynamics deferred to offline validation only. If transient dynamics are strictly required in solver, fall back to differentiable implicit solver (Backward Euler) or torchdiffeq.

**Rationale.** Source 02 Gemini flagged both as build-blocking; source 09 Q3 locked the fixes. These are not "limitations to be documented": they are engineering hazards that explode the build at runtime if not handled before Vinh writes the SCP code.

**Affected.** Vinh-backend-plan Day 4 + Day 5 implementation. arch-spec Layer 4 numerical-stability appendix. paper §3.2 implementation paragraph.

---

## 2026-05-22 D-015: 8-tier physics roadmap (all in-scope, no V2 / V3 deferrals)

**Decision.** The 8 tiers from Gemini source 02 are all in-scope for 2026-05-31 submission:

1. **3D track geometry:** project gravity vector using GPS pitch + bank.
2. **Aerodynamics:** pitch-sensitive front/rear downforce loads `Fz_aero = 0.5·ρ·Cl·A·v²`.
3. **Adaptive hand-control dynamics:** disable `throttle × brake = 0` complementarity when COA c_overlap flag set.
4. **Load transfer:** double-track lateral + longitudinal elastic weight transfer.
5. **Tire thermal + degradation:** modulate peak friction based on thermodynamic state.
6. **Transient tire dynamics:** relaxation-length ODE → steady-state algebraic substitution per D-014.
7. **Full Pacejka tire model:** combined-slip heart-shape boundaries solved via SCP outer loop per D-012.
8. **Vehicle kinematic integration:** Newton-compliant accelerations enforced.

All execute inside the SCP inner iterate. EXTENDED_PHYSICS_FIXTURES catalogue (Stephen-lane wave-30 frontend) surfaces each tier on `/judges` for judge-facing visualization.

**Rationale.** Per D-003 galaxy ambition + Stephen's wave-30 directive: "we need the best physics possible, not leaving out anything possible." Removes the "V2 / V3 / post-hackathon" labels that lived in earlier paper drafts. Source 02 + 09 lock this as the maximal physics target.

**Affected.** arch-spec Layer 4 expansion. paper §3.2 tier-by-tier method. paper §4 8-tier ablation table. PLAN new rows 2.9.1 through 2.9.8 (one per tier). Vinh-handoff rewrite removing V2 / V3 labels. Frontend EXTENDED_PHYSICS_FIXTURES catalogue + new `/judges` panel.

---

## 2026-05-22 D-016: 12-tool Granite stack expansion (was 8)

**Decision.** Granite stack expanded from 8 tools to 12. New additions per source 05:

9. **Granite Embedding R2** (149M encoder + 47M query, hybrid dense/sparse) drives Layer 5 RAG over vehicle setup guides + racing theory + adaptive-equipment specs.
10. **IBM TSPulse** (1M params, time-frequency analyzer) drives Layer 2 anomaly detection over polyphase phase streams.
11. **Granite FlowState** (9.1M, sampling-rate-invariant SSM) is Track 2 of D-010 three-track ensemble.
12. **Granite 4.0 Nano 350M** runs in-browser via WebGPU + Transformers.js for the offline paddock-summary path per D-021.

Original 8 (Granite-Docling 258M + Granite Vision 4.1 4B + Granite TimeSeries TTM r2.1 + Granite 4.1 8B Instruct + Granite Guardian 4.1 + Langflow + Docling library + IBM Bob) all retained; Langflow demoted from runtime to visual demo facade per D-017.

**Rationale.** Maximal ceiling per galaxy directive. Best Use of Technology track favors a stack where every tool earns its slot. Source 05 + 09 Q2 locked.

**Affected.** README "Eight IBM tools" → "Twelve IBM tools" sweep. `/judges` 12-tool grid. Paper §3.6 stack provenance. arch-spec stack diagram. BeMyApp submission payload Tools panel.

---

## 2026-05-22 D-017: LangGraph + MCP + ContextForge orchestration substrate (Langflow demoted to demo facade)

**Decision.** Layer 5 orchestration runs on LangGraph (stateful graph state machine) with all numerical tools (cvxpylayers SCP solver, polyphase preprocessor, anomaly detector, retrieval, narrator, critic, Guardian) exposed via Model Context Protocol (MCP) standardized tool calls, routed through IBM's ContextForge API Gateway. Langflow is retained but demoted from execution runtime to top-level visual demo facade (still rendered for judge visualization on `/judges`).

**Rationale.** Source 05 + 09 Q2. Langflow-as-runtime cannot express the stateful agentic flow required for the tri-agent critic loop + Mellea IVR repair + RAG retrieval node ordering. LangGraph + MCP + ContextForge is the agentic orchestration substrate IBM Consulting actually deploys for stateful AI workflows (per the Ferrari case study posture). Langflow stays as the visualization layer because it's still load-bearing for the deck + 3-min video orchestration screenshot.

**Affected.** Vinh-backend-plan Phase 2 Day 4-6. arch-spec Layer 5 expansion. paper §3.5 orchestration paragraph. PLAN new row 4.1a (LangGraph runtime) + 4.1b (MCP tool wrap) + 4.1c (ContextForge gateway) + 4.1d (Langflow demo facade).

---

## 2026-05-22 D-018: Tri-agent Agent-as-Judge critic loop + Mellea IVR repair (loop_budget = 3)

**Decision.** Layer 7 critic loop runs three specialized models in parallel + a repair loop:

- **Physics-Critic:** small Granite Instruct fine-tune that reads the projected tensor + violation log and challenges the draft report's physics claims.
- **Pedagogy-Critic:** small Granite Instruct fine-tune that reads the draft + COA structure and challenges the recommendation's coachability.
- **Guardian-Safety:** Granite Guardian 4.1 BYOC safety pass.

If any critic flags, IBM Mellea runs Instruct-Validate-Repair (IVR) with `loop_budget = 3` to repair the generated text until it passes the panel. Verified CoachingReport then proceeds to Layer 8 final Guardian audit per D-A.

**Rationale.** Source 05 + 09 Q2 lock the Agent-as-Judge pattern as "shouldn't-be-possible" move 5. Source 09 Q5 open question 1 also resolved: gradients do NOT flow through Mellea IVR (D-020 two-regime seam); the critic loop is the discrete-text regime optimized by GEPA reflective evolution, not gradient descent.

**Affected.** Vinh-backend-plan Phase 4 Day 10. arch-spec Layer 7 (new). paper §3.5 + §3.6 critic-loop paragraphs. New tri-agent critic UI panel on `/judges` + `/analyze` coaching report.

---

## 2026-05-22 D-019: 5 shouldn't-be-possible moves (WebGPU Nano + aLoRA + GEPA + EAGLE-3 + Agent-as-Judge)

**Decision.** Five architectural moves land as the galaxy-tier signal that two students built more than a hackathon submission. Each is placed at a specific layer:

1. **WebGPU Granite Nano 350M** (Layer 0): zero-latency offline paddock summaries in the driver's browser via Transformers.js (per D-021 scope cut).
2. **Activated LoRA (aLoRA)** (Layer 6): hot-swap "race-engineer intrinsic" adapter into vLLM memory without KV-cache recomputation.
3. **GEPA reflective prompt optimization** (Layer 5): DSPy-driven offline prompt evolution against APEX-Bench faithfulness metric.
4. **EAGLE-3 speculative decoding** (Layer 6 inference plane): 2-6x wall-clock speedup on vLLM, hits sub-15s generation latency target.
5. **Agent-as-Judge tri-agent critic loop** (Layer 7): per D-018.

**Rationale.** Source 05 source 09 Q2. Each is a genuine 2025-2026 frontier capability that no existing AI race-engineer ships. Lands the "two students could not have built this in 12 days" perception that turns judges from skeptical to evangelical.

**Affected.** Vinh-backend-plan Phase 4 Day 10-12. arch-spec Layer 0 + Layer 5 + Layer 6 + Layer 7. paper §3.5 + §3.6. Frontend WebGPU Granite Nano path. PLAN new rows 4.2a through 4.2e (one per move). Pre-mortem new rows for each move's failure mode.

---

## 2026-05-22 D-020: Gradient bridge two-regime seam at SCP projector output

**Decision.** Gradients flow above the SCP projector output (TTM channel-mix decoder fine-tune + physics projection) trained via gradient descent + cvxpylayers implicit differentiation through 3 SCP iterations. Below the seam (Mellea IVR repair + tri-agent critic + GEPA prompt evolution) trained via DSPy reflective optimization, no end-to-end backprop attempted. Two regimes, one seam, no impossible end-to-end graph.

**Rationale.** Source 06 decision brief closes NotebookLM Q5 open question 1. Backprop through discrete LLM text generation is structurally broken; pretending otherwise costs Vinh days of attempting REINFORCE-style estimators that will never converge in 12 days. The clean architectural seam keeps both regimes load-bearing without forcing impossible math.

**Affected.** Vinh-backend-plan Phase 3-4 build sequence. arch-spec gradient-flow appendix. paper §3.5 (clarify training regimes).

---

## 2026-05-22 D-021: WebGPU offline scope cut (30-line Newton friction-ellipse + server-authoritative reconnect)

**Decision.** The WebGPU Granite Nano 350M in-browser path does NOT run the eight-tier SCP physics projector. It runs a 30-line Newton friction-ellipse projection (sub-microsecond per step) for offline edge consistency. Offline summary is server-authoritative: the driver's browser produces a draft the server overwrites on reconnect. The edge model is only allowed to claim things the friction-ellipse projector can independently verify. No mechanical recommendations (e.g., "reduce brake travel by 4 mm") allowed offline.

**Rationale.** Source 06 decision brief closes NotebookLM Q5 open question 2 + 3. A WebAssembly-quantized 8-tier SCP solver in the browser is genuinely impossible in 12 days; the scope cut + server-authoritative reconnect kills the consistency problem by construction without losing the WebGPU "shouldn't-be-possible" move.

**Affected.** Frontend WebGPU Granite Nano implementation (`app/frontend/lib/webgpu-nano.ts` new). Sync-on-reconnect UI affordance on `/analyze`. arch-spec Layer 0 + edge-consistency appendix. Paper §5 limitations + §5.3 bounded-scope.

---

## 2026-05-22 D-022: Lexicographic COA constraint hierarchy with elastic slacks

**Decision.** Conflicting COA constraints resolve via lexicographic hierarchy. Tier-0 (kinematic feasibility: vehicle does not leave the track) + Tier-1 (regulatory safety: no input that would violate FIA Appendix L homologation) are inviolable; the SCP solver crashes the run if these cannot be satisfied. Tier-2 (COA hardware permissions like the c_overlap flag for brake-throttle simultaneity) + Tier-3 (COA hardware constraints like steering-lock limits) relax via elastic slacks if a particular corner becomes kinematically impossible under all of them. The slack variable becomes a Guardian audit signal (the assistant report explicitly names which COA constraint was relaxed and why).

**Rationale.** Source 06 decision brief closes NotebookLM Q5 open question 2. The naive "all-COA-flags-are-hard-constraints" framing breaks the moment a hairpin demands a 270-degree steering input the adaptation only permits 180 degrees of; the solver throws an unhandled exception. The lexicographic + elastic-slack approach keeps Tier-0/1 hard + lets Tier-2/3 negotiate honestly when the geometry forces it.

**Affected.** Vinh-backend-plan Day 5. arch-spec Layer 4 constraint-resolution appendix. paper §3.4 (COA-derived constraints paragraph). New ConvergenceFixture variants for Tier-conflict scenarios.

---

## 2026-05-22 D-023: MLPerf-style tolerance-banded reproducibility protocol for APEX-Bench

**Decision.** APEX-Bench evaluation harness uses MLPerf-style tolerance bands, not bit-exact reproduction. Dockerized evaluation container with deterministic seed locks + explicit floating-point tolerance bounds per metric. Published variance report comparing RTX 4060 vs Apple Silicon results (single representative APEX-Bench lap, full LIPS 4-axis ablation, tolerance band per metric documented). External reviewers reproduce results within tolerance bands, not against unrealistic bit-exact thresholds.

**Rationale.** Source 06 closes NotebookLM Q5 open question 4. Bit-exact FP reproduction across hardware architectures (CUDA / Metal / WebGPU) is mathematically impossible; pretending otherwise is a publication-killer. The MLPerf precedent gives APEX a defensible reproducibility posture for the NeurIPS workshop submission.

**Affected.** PLAN row 6.5 APEX-Bench release block. arch-spec evaluation appendix. paper §4 LIPS 4-axis methodology. paper §5 Limitations (reproducibility framing). New `eval/` directory with `Dockerfile` + `tasks.py` + seed-lock + tolerance-band config.

---

## 2026-05-22 D-024: Physics-confidence detector (Mahalanobis-distance) feeds Granite Guardian BYOC

**Decision.** Layer 8 Guardian audit explicitly conditions on a physics-confidence detector. The detector computes Mahalanobis distance between real-time telemetry channel distributions and the assumed Pacejka tire parameter limits + thermodynamic state envelope. If distribution shift exceeds threshold (calibrated against APEX-Bench OOD axis), Guardian receives a low-confidence physics signal and downgrades the verdict from SAFE to REVIEW, with an explicit reason citing the detector. TSPulse anomaly detection feeds the same signal.

**Rationale.** Source 06 closes NotebookLM Q5 open question 5 (Guardian auditing learned physics parameters). Without the detector, Guardian blindly trusts cvxpylayers output as ground truth; if the underlying .tir Pacejka file is wrong, every downstream verdict is wrong. Detector is framed in paper §5 as a research contribution (not solved).

**Affected.** Vinh-backend-plan Day 5 + Day 11. arch-spec Layer 8 expansion. paper §3.3 Guardian paragraph + §5 Limitations + §5.4 research contribution framing. New PhysicsConfidence UI badge on `/analyze` coaching report.

---

## 2026-05-22 D-025: NeurIPS central claim locked

**Decision.** The NeurIPS Workshop paper's central claim is the **frozen-TSFM + hard differentiable physics-projection composition**. Three supporting contributions under it: (a) kinetic hallucination as a named, characterized failure mode; (b) the polyphase 50 Hz feasible-lift projector mechanism; (c) the APEX-Bench public benchmark + LIPS 4-axis evaluation framework. One paper, not four. The four-axis ablation table substantiates the headline claim (FCVR + COBR drop to 0.00 with hard projection vs non-zero for baseline + soft-loss variants).

**Rationale.** Source 09 Q4 verdict + source 01 Perplexity's "confirmed absence" in the literature. Splitting into multiple papers dilutes the novelty per contribution; consolidating gives the strongest single submission.

**Affected.** paper §1 contributions list + §4 Experiments table structure + §13 References (cite Agrawal et al. 2019 cvxpylayers + Amos & Kolter 2017 OptNet + Hochreiter & Schmidhuber for foundation-model retrospective + Ekambaram et al. 2024 TTM + relevant Granite stack papers).

---

## 2026-05-22 D-026: APEX-Bench public benchmark release

**Decision.** APEX-Bench is a 50-lap multi-class telemetry dataset with human ground-truth labels, released publicly under Apache 2.0 alongside the NeurIPS Workshop paper. Includes: Sarah Reynolds Britcar synthetic fixture as the adaptive-driver canonical lap, plus 5 FastF1 holdouts with synthesized 8 -tier physics labels (load transfer + thermal + Pacejka + adaptive-control variants). LIPS 4-axis evaluation (Accuracy + Physical Compliance + Industrial Readiness + OOD Generalization) with the four ablation rows: (a) zero-shot TTM no projection, (b) zero-shot TTM + soft-loss physics, (c) zero-shot TTM + hard projection (APEX), (d) TTM channel-mix fine-tune + hard projection + 3-track ensemble.

**Rationale.** Source 05 + 09 Q4 lock APEX-Bench as the third supporting contribution under D-025. Without a public benchmark, the headline empirical result cannot be independently replicated; the paper becomes a vendor pitch instead of a NeurIPS submission.

**Affected.** PLAN new row 6.5 (APEX-Bench release). New `apex-bench/` directory at repo root with `README.md` + `data/` + `eval/`. paper §4 + §4.5 release-plan paragraph. Frontend `/judges` APEX-Bench panel + downloadable artifact link.

---

## 2026-05-22 D-027: Day-3 SCP go/no-go gate (single most important checkpoint)

**Decision.** Day 3 EOD (Vinh-lane): prototype whether 3 unrolled SCP iterations actually converge through cvxpylayers with the 8-tier Pacejka linearization on the RTX 4060. Pass criterion: gradients flow end-to-end (TTM forecast through SCP projection) without exploding or vanishing; verdict landed at FCVR = 0.00 on the Sarah Reynolds canned fixture. Fallback ladder: (a) drop to 2 SCP iterations + trust-region penalty if 3 oscillates; (b) escalate to D-A revision (per `docs/vinh-backend-plan.md` G0 escalation) if 2 also oscillates. Logged in `logs/day-03-scp-go-no-go.md`.

**Rationale.** Source 06 names this as the single most important checkpoint in the 12-day build. SCP convergence with 8-tier Pacejka is empirical, not theoretical; literature says it converges in 3-5 iterations for well-conditioned vehicle models, but APEX's specific parameterization is novel. Day-3 prototype = empirical answer + fallback plan + no surprise on Day 7+.

**Affected.** Vinh-backend-plan Phase 0 + Phase 2 (Day 3 G0 gate replaced by D-027 SCP go/no-go). PLAN row 2.9a Notes + new pre-mortem entry for the SCP-oscillation failure mode. Day-3 log file ships before any other Phase 2 work.

---
