# Wave-45 tier-3 synthesis (16-source dispatch)

> Captured 2026-05-25 evening. Synthesizes all 16 responses across 4 topics × 4 model-angled prompts (Perplexity + Gemini 2.5 Pro + ChatGPT GPT-5.5 + NotebookLM). Source artifacts at `research/wave-45/responses/`. Triangulated findings + rank-ordered action items + verbatim citations.

---

## Source manifest

| Topic | Perplexity | Gemini | ChatGPT | NotebookLM |
|-------|------------|--------|---------|------------|
| 1 — Best Use of IBM Technology | `Perplexity IBM SkillsBuild...Cohort History` | `Gemini APEX AI Race Engineer IBM Challenge.pdf` | `ChatGPT Brutal Judge Review of APEX for Best Use of Technology.pdf` | `topic-1-notebooklm.md` |
| 2 — IBM Granite new models | `Perplexity IBM Granite New Model Variants` | `Gemini AI Race Engineer Granite Deep Dive.pdf` | `ChatGPT APEX brutal integration review.pdf` | `topic-2-notebooklm.md` |
| 3 — Competitor activity | `Perplexity ... Competitor Activity Intel` | `Gemini AI Builders Challenge Competitor Analysis.pdf` | `ChatGPT Adversarial Positioning Deep Dive on APEX.pdf` | `topic-3-notebooklm.md` |
| 4 — Research-as-validation | `Perplexity APEX Feature Judging-Rubric Lift` | `Gemini To maximize .pdf` | `ChatGPT Weaknesses in the APEX Submission.pdf` | `topic-4-notebooklm.md` |

---

## Triangulated BLOCKER + HIGH findings (rank-ordered by triangulation count + leverage)

### BLOCKER B-1 — Granite TTM in-browser is a TANK-THE-SUBMISSION over-claim

**Triangulated across:** NotebookLM Topic 2 (most over-claiming) + NotebookLM Topic 4 (HURTS feature-bloat) + ChatGPT Brutal Judge ("the in-browser TTM surface is also canned-fallback") + ChatGPT Weaknesses ("just a wrapper") + Perplexity (Rank #2 ★★★★★ "directly satisfies the criterion" BUT contingent on actually shipping).

**Verbatim NotebookLM Topic 2:** "APEX stack inventory heavily over-claims on Granite 4.0 Nano 350M, officially marking it as 'WIRED' in the `ibm-stack.ts` inventory and describing it as 'In-browser WebGPU edge model via Transformers.js'. However, the codebase reveals that the required `@huggingface/transformers` npm dependency was intentionally not installed during this wave."

**Verbatim NotebookLM Topic 4 (HURTS):** "marketing this as a completed galaxy move when the actual library is uninstalled and the data is mocked is a massive over-claim. If a judge looks at the network tab or the code, the project's technical credibility could instantly collapse."

**Fix path:** Honest demotion in `ibm-stack.ts` + reframe D-053 in decision-log + soften the "7th shouldn't-be-possible move" framing on /judges. Do NOT install `@huggingface/transformers` blindly because Context7 confirmed Transformers.js v4 does NOT support `time-series-forecasting` pipeline task — install without working code = dead bundle weight + worse credibility hit.

---

### BLOCKER B-2 — "Conceptual stack not shipped stack" — the biggest score killer

**Triangulated across:** ChatGPT Brutal Judge #1 (top-ranked criticism) + Gemini APEX IBM Challenge (multiple gap callouts) + Perplexity Cohort History (Pattern 1: "IBM Tool Is the Critical Path, Not a Feature Flag" + disqualification risk per IBM Bob Dev Day rules).

**Verbatim ChatGPT Brutal Judge:** "APEX's own public surfaces say that only two tools are fully wired at HEAD. The rest are described as 'integration,' 'accelerator,' 'demo-facade,' or 'frontend-integration.' [...] A brutal judge would say this out loud: 'You are asking me to reward planned integration, not executed integration.'"

**Verbatim Perplexity Cohort History (Pattern 1):** "Every documented 'Best Use' or 'Best Use of Granite' winner used IBM technology as the functional backbone of their solution. [...] Submissions that call IBM APIs once as a 'query enhancer' or show a static demo of a Granite call are explicitly at risk of disqualification under IBM's published rules for 'not providing a credible or feasible use of IBM technology'."

**Fix path:** Brutally shrink hero narrative to the 5-piece end-to-end live path (COA parse → TTM forecast → physics projection → Guardian audit → Instruct narration). Move LangGraph runtime + FlowState + TSPulse + in-browser TTM to "in-progress / beyond submission" appendix on /judges.

---

### BLOCKER B-3 — D-050 byte-equality is "overmarketed relative to what is actually proven"

**Triangulated across:** ChatGPT Brutal Judge #4 (targets the project's favorite internal killshot) + NotebookLM Topic 1 (load-bearing claim).

**Verbatim ChatGPT Brutal Judge:** "The current proof is narrower than the marketing. It is a useful regression invariant on a constrained path, not yet a decisive proof that the full engine-swapped physics stack preserves user-relevant outputs under real runtime conditions. A brutal judge will say: 'Byte-identical logs are nice plumbing. Show me byte-identical trustworthiness or coaching outcomes.'"

**Fix path:** Reframe D-050 as **regression guarantee**, not load-bearing headline. Extend the evidence: show V1 + V2 preserve same verdict + blocked recommendation set + driver-facing recommendation on the same fixture (not just identical violation strings).

---

### HIGH H-1 — COA reduces to "1 bit" — PDF-to-one-bit pipeline attack

**Triangulated across:** ChatGPT Brutal Judge #2 (second-biggest problem) + ChatGPT Adversarial Positioning (semantic crack).

**Verbatim ChatGPT Brutal Judge:** "APEX repeatedly positions itself as the first workflow that reads the FIA Certificate of Adaptations as a binding regulatory input at the tensor level. But the architecture spec makes clear what that tensor-level regulatory input actually is: the ninth synthetic channel is a binary COA simultaneity bit. [...] A brutal judge will phrase it like this: 'You built a sophisticated PDF-to-one-bit pipeline and are calling it deep document integration.'"

**Fix path:** Either ship 3-5 live COA-derived constraints (brake travel bounds + steering adaptation limits + seating/headrest constraints + homologation-linked equipment constraints + explicit PDF → JSON → tensor → output citation chain) OR narrow the headline honestly to "COA-controlled brake/throttle simultaneity gate".

---

### HIGH H-2 — TSFM story doesn't match inspectable code

**Triangulated across:** ChatGPT Brutal Judge #3 (where IBM-savvy judges get suspicious) + Gemini APEX IBM Challenge (TTM under-utilizes exogenous data).

**Verbatim ChatGPT Brutal Judge:** "The README and judges page talk about a frozen-backbone TTM with a Track 1 channel-mix decoder fine-tune, but the publicly inspectable `forecast.py` path loads `ibm-granite/granite-timeseries-ttm-r2` directly from pretrained weights and describes itself as a frozen zero-shot forecaster."

**Fix path:** Either publish the actual fine-tuned checkpoint + tiny holdout evaluation OR de-escalate the claim ("frozen base TTM with projection layer; FlowState + TSPulse are forward paths not yet sponsor-track-critical"). The honest narrower claim is more scoreable than the unsupported wider claim.

---

### HIGH H-3 — Guardian story has a "deterministic floor" tell

**Triangulated across:** ChatGPT Brutal Judge #4 + ChatGPT Brutal Integration (shallow usage).

**Verbatim ChatGPT Brutal Judge:** "APEX's own shipped `audit.py` says the actual Granite Guardian model integration lands later, and that the current module is a deterministic rule-engine floor that the Guardian model will eventually wrap."

**Fix path:** Wire real Granite Guardian 4.1 BYOC pass + export a one-page evaluation card (pass/fail counts + top rule families + blocked recommendation examples + hallucination/factuality status). Mellea IVR loop wraps narrator output.

---

### HIGH H-4 — Watson TTS workaround Q&A card

**Triangulated across:** NotebookLM Topic 1 (explicit recommendation) + Gemini To maximize (technical tenacity signal).

**Verbatim NotebookLM Topic 1 recommendation:** "Documenting this 'rescue' of the Watson TTS production path proves extreme technical tenacity in keeping IBM technology functional within a constrained cloud environment, which directly appeals to the 'Technical Execution' judging criterion looking for effective, functional use of IBM technology."

**Fix path:** Add Q&A flashcard documenting ffmpeg-static + inline-streaming Vercel workaround. Mirror in README + paper.

---

### HIGH H-5 — Sponsor track copy is THE highest-leverage Best Use of Tech move (Rank #1 per Perplexity)

**Verbatim Perplexity Feature Judging-Rubric Lift Rank #1:** "Explicit claim alignment to named prize categories is the single highest-leverage move in any BeMyApp hackathon. [...] Having per-track copy that says 'Wins Most Innovative because [specific innovation]' and 'Wins Best Use of Technology because [IBM Granite/LangFlow usage]' directly reduces judge cognitive load and removes guessing from the scoring process."

**Status:** Already shipped via `JudgeTrackTighteningCallout` wave-45 Phase 6. Verify visibility + tighten copy.

---

### HIGH H-6 — PitWall counter-attack is the hardest to defend in 30s

**Verbatim ChatGPT Adversarial Positioning (Rank #1 hardest):** "Real race engineers call strategy live; APEX debriefs after the flag."

**Verbatim 2-sentence rebuttal authored by ChatGPT:** "Race strategy is one slice of race engineering; translating driver feedback into faster, safer setup is another, and that is exactly where adaptive drivers are underserved today. APEX is the first workflow that binds the FIA Certificate of Adaptations into the model itself, so when a driver is legally allowed brake-and-throttle overlap, we coach the real car they drive, not an able-bodied abstraction."

**Fix path:** Add Card 9 to `docs/q-and-a-flashcards.md` + memory `project_apex_qa_killshots.md` documenting this counter-rebuttal. Pre-empt at pitch.

---

### HIGH H-7 — NeuroPit accelerated 2026-05-23 — biggest threat now

**Triangulated across:** NotebookLM Topic 3 + Perplexity Competitor Activity ("Active development sprint") + Gemini Competitor Analysis ("architectural powerhouse").

**Artifact cited:** `github.com/vighriday/neuropit-may-2026` — updated 2026-05-23.

**Differentiating features APEX does not have:** 9-score cognitive twin + live PPG biometrics via phone camera + Qdrant vector search.

**Fix path:** Counter-position via "APEX coaches the car AND the driver via tri-agent critic + Granite Guardian". Document in Q&A flashcards.

---

### HIGH H-8 — Granite Switch 4.1-3B preview is the biggest missed variant

**Verbatim ChatGPT Brutal Integration #1:** "The biggest missed integration opportunity is not 'you should have picked a bigger base model.' It is this: you should have made Granite's new intrinsic stack the actual trust-and-control plane of APEX. [...] Granite Switch 4.1 preview was released in early May 2026 specifically to compose 12 Granite adapters from the RAG, Core, and Guardian libraries."

**Fix path:** Wire Granite Switch on AICopilotChat + final report verification path (single visible live path). Wrap final coaching recommendation in Mellea IVR loop with 3 requirements.

---

### HIGH H-9 — FlowState r1.1 upgrade

**Verbatim Perplexity IBM Granite Variants Gap #1:** "APEX currently runs FlowState at the r1.0 checkpoint (9.1M params); the r1.1 drop (March 2026) adds output gating, 4096 pre-training context, CauKer synthetic data, and a 2× larger MLP — delivering meaningfully improved zero-shot lap-time interval forecasting with no API or license change required."

**Fix path:** Update `ibm-stack.ts` FlowState entry to r1.1 (18.5M). Update paper §3.5. Surface revision tag in load call.

---

### HIGH H-10 — Granite Speech 4.1 2B-Plus (replace Web Speech API)

**Verbatim Perplexity IBM Granite Variants Gap #2:** "Granite Speech 4.1 2B-Plus adds speaker diarization and timestamp attribution — directly useful for in-car multi-crew radio transcription (driver + race engineer + spotter) without any external diarization service."

**Verbatim ChatGPT Brutal Integration #5:** "A real Granite Speech integration would let you align phrases like 'late turn-in here' or 'I hesitated on pickup' to time windows and mini-sectors."

**Fix path:** Document in `vinh-backend-plan.md` Vinh V9 swap-point as upgrade target. Or wire as voice-debrief backend.

---

### HIGH H-11 — TSPulse 2048-point buffer prerequisite

**Verbatim Gemini APEX IBM Challenge #6:** "Achieving stable and robust anomaly detection requires a time-series input of at least 3 to 4 times the base context length (i.e., a minimum of 1536–2048 continuous data points). APEX must mathematically guarantee that its sliding edge-telemetry window buffers at least 2048 continuous points before triggering the TSPulse anomaly inference head. Failing to enforce this constraint will result in suboptimal zero-shot anomaly detection, which IBM evaluators will immediately flag as a failure to read the model documentation."

**Fix path:** Document buffer management in `ibm-stack.ts` TSPulse entry + paper §3 + TSPulseAnomalyPanel honesty note.

---

### HIGH H-12 — IBM AI Risk Atlas mapping for physics audit

**Verbatim Gemini APEX IBM Challenge #9:** "APEX must frame this physics-audit strictly within the nomenclature of the IBM AI Risk Atlas. The documentation should formally classify a physical hallucination (e.g., commanding a driver to brake at 5G when the car is aerodynamically only capable of 3G) as an 'Intrinsic Risk: Groundedness/Hallucination'."

**Fix path:** Add to paper §3 + decision-log D-024 cross-reference.

---

### HIGH H-13 — Granite Vision → Granite Guardian validation gap

**Verbatim Gemini APEX IBM Challenge #3:** "APEX currently uses Granite Guardian 4.1 for text and physics audits (Tool 9) but has not explicitly mapped it to validate the structural outputs of the Vision model. The submission must demonstrate an architecture where the parsed timing sheet arrays are passed through a Granite Guardian hallucination or relevance check before being committed to the time-series forecasting engine."

**Fix path:** Document in `vinh-backend-plan.md` + paper §3.

---

### HIGH H-14 — IBM Bob "customMode" documentation

**Verbatim Gemini APEX IBM Challenge #12:** "The developer should create a dedicated customMode within Bob (e.g., agent-architect or motorsport-engineer) configured specifically with system instructions to consult the watsonx Orchestrate documentation via an MCP server prior to writing code. Providing a snippet of the custom bob.yaml configuration and a log of a multi-turn conversation where Bob successfully generated the APEX MCP Gateway will serve as a powerful testament to the developer's mastery of the IBM ecosystem."

**Fix path:** Add appendix to README + deliverables documenting Bob customMode + multi-turn log.

---

### HIGH H-15 — DocTags native integration vs raw Markdown discard

**Verbatim Gemini APEX IBM Challenge #1:** "APEX is currently under-utilizing the native integration of DocTags with the broader watsonx tokenizer ecosystem. [...] APEX should utilize the DocTagsDocument pipeline to pass the structured tags directly into the Granite Instruct model's system prompt. [...] Proving that APEX leverages this native, sub-word token-efficiency rather than bloated intermediary conversions will secure maximum architectural points."

**Fix path:** Document DocTags pass-through in `vinh-backend-plan.md` + paper §3.

---

### MED — Other actionable findings

- **Docling-SDG synthetic data generation** (Gemini APEX IBM Challenge #2): use `docling-sdg` to auto-generate synthetic Q&A pairs from FIA COA rulebooks. Build domain-specific instruction dataset.
- **TTM exogenous data** (Gemini APEX IBM Challenge #4): integrate weather APIs or static track states as exogenous inputs.
- **Granite Embedding 311M Multilingual R2** (Perplexity IBM Granite Variants Gap #3): switch from 149M English-only to 311M multilingual for cross-lingual RAG over race regulations.
- **Granite 4.1 30B fallback tier** (Perplexity IBM Granite Variants Gap #4): add as fallback for complex adaptive-driving regulation interpretation.
- **Numerical stability mitigation in cvxpylayers** (Gemini Granite Deep Dive): aggressive matrix scaling + normalize data structures + gradient clipping to prevent NaN gradients on tight constraint boundaries.
- **Demo edge-case prep** (ChatGPT Weaknesses #5): Murphy's Law dry-run — simulate API failures, offline mode, invalid input, rate limits, missing CORS headers. Always include graceful error message. Rehearse with flaky Wi-Fi.

---

## Empirical winning patterns (Perplexity Cohort History Pattern Library)

1. **IBM Tool Is the Critical Path, Not a Feature Flag.** Every documented winner used IBM tech as the functional backbone, not a feature-flag call. APEX must surface this end-to-end.
2. **Multiple IBM Tools Wired Together Signal Depth.** Ferrari case study (5 watsonx products), TechXchange winners (watsonx.ai + Orchestrate), BrainStormX (multiple Granite models). Breadth of integration rewarded when each tool serves distinct irreplaceable role.
3. **Measurable, Real-World Problem → Real-World Impact.** Ferrari: DAUs doubled + 35% more time in-app. DuniAfrika: instant safety coaching at job sites via WhatsApp.
4. **Explainability + Trust Explicitly Rewarded** (matches APEX's COA gate toggle + Guardian audit).
5. **Visible Aesthetic Identity + Polished Demo Matter.** "Design and usability" = 25% of scoring rubric.
6. **GitHub + README + Video — All Three Must Be Strong.**

**APEX alignment** (Perplexity §6): Racing/F1 is the May 2026 challenge's explicit theme. Must wire ≥1 required tool (Granite, Docling, Langflow, Context Forge, IBM Bob) as critical path, not demo call. Adaptive racing accessibility angle resonates with Call for Code / IBM's stated CSR values. Ferrari/IBM partnership is the most visible IBM-racing reference; APEX can position itself as the driver-side complement.

---

## Perplexity feature-impact rank-order (13 wave-45 ships)

| Rank | Feature | Lift | Rubric Axes |
|------|---------|------|-------------|
| 1 | (e) Per-track sponsor copy | ★★★★★ Prize multiplier | All 4 |
| 2 | (d) Granite TTM in-browser / WebGPU | ★★★★★ | TE + IN + BUT (IF actually shipped) |
| 3 | (l) LangGraph orchestration trace | ★★★★½ | TE + IN + XAI |
| 4 | (b) Real-time pipeline visualization | ★★★★ | TE + CF |
| 5 | (g) Multi-driver compare + delta | ★★★★ | CF + TE |
| 6 | (a) COA gate toggle interactive | ★★★½ | IN + XAI + CF |
| 7 | (j) NeurIPS workshop paper draft | ★★★ | IN + Depth |
| 8 | (k) APEX-Bench evaluation harness | ★★★ | TE + IN |
| 9 | (f) /judge-tour walkthrough | ★★½ | Polish + Doc |
| 10 | (i) Byte-equality engine-agnostic demo | ★★ | TE (niche) |
| 11 | (c) /changelog from git log | ★★ | Polish + Doc |
| 12 | (h) Sookra Methodology Five Pillars | ★½ | CF (contextual) |
| 13 | (m) OG cards on every route | ★ | Secondary |

(TE=Technical Execution, IN=Innovation, CF=Challenge Fit, XAI=Explainability, BUT=Best Use of Tech)

---

## Competitor threat-shift consensus (last 72h)

| Competitor | NotebookLM | Perplexity | Gemini | Triangulated grade |
|------------|------------|------------|--------|---------------------|
| **NeuroPit** | "A — Bigger threat now" | "Active development sprint" | "Architectural powerhouse" | **HIGHEST: A-** |
| **ApexIQ** | C+ Runner-up | "Total public silence re: challenge" | "Most immediate commercial threat" | **HIGH: B-/C+** |
| **PitWall** | B Best Use of Tech | "Possibly stalled / private dev" | "Educational tool not strategic weapon" | MED: C+/B |
| **RaceLens XAI** | C+ 1st Place | "Total public silence" | "Undisputed leader production-readiness" | MED-LOW |
| **AI Race Strategist** | D | "No public artifact" | "Massive structural outlier" | LOW |
| **RaceMind AI** | D | "No public artifact" | "Outstanding submission package" | LOW |
| **AI Race Engineer Copilot** | D | "No public artifact" | "Dark horse on backend efficiency" | LOW |

**Strategic recommendation (Gemini + NotebookLM consensus):** "Grassroots Adaptation Protocol" — APEX pivots to **Universal Adaptive Racing AI** to neutralize ApexIQ's brand collision + claim uncontested Adaptive-Racing Differentiator axis. Document Granite ingesting dirty/low-fidelity grassroots telemetry; LLM logically smooths + adapts erratic data; natural-language driving aids for adaptive novices.

---

## Brutal weakness summary (ChatGPT Weaknesses ranked 6)

1. Over-claiming / buzzwords (Differentiator #2 + honesty tier + 7 shouldn't-be-possible moves + apex-cam pipeline + Sookra Methodology + OG cards) — cut jargon, focus on 1-2 genuinely novel features
2. "Just a wrapper around an API call" — emphasize added value (caching + retries + custom logic) or honestly say "simplifies integration"
3. Over-engineering (14+ routes + WebGPU + multi-agent critics) — triage by priority; enable only 2-3 core endpoints for demo
4. Feature-bloat — strip down to essentials; treat extras as "advanced features"
5. Demo edge-case (voice assistant hang + rate limits + PWA install fail + missing CORS) — Murphy's Law dry-run
6. Trick question: "Which one of your 13 routes is absolutely essential, and why do the others exist?" — pre-prepared answer naming hero route (`/judge-tour` or `/analyze`) + others as supporting infrastructure

---

## Action item rank (ship-this-week priority)

1. **SHIP TODAY:** TTM in-browser honest demotion (B-1) + D-050 reframing (B-3)
2. **SHIP TODAY:** Watson TTS Q&A card (H-4) + PitWall counter-rebuttal Q&A card (H-6)
3. **SHIP TODAY:** Hero-narrative trim — 5-piece end-to-end vs 12-tool architecture opera (B-2)
4. **SHIP THIS WEEK:** FlowState r1.0 → r1.1 upgrade (H-9) + COA reframing across surfaces (H-1)
5. **SHIP THIS WEEK:** Granite Vision → Guardian validation gap close (H-13) + IBM Bob customMode doc (H-14) + DocTags native integration doc (H-15)
6. **SHIP THIS WEEK:** Ablation evidence on /lips-harness (Brutal Judge #5)
7. **DEFER to wave-46** (per honesty + bundle constraints): Granite Switch wire + Mellea IVR loop + Granite Speech 4.1 2B-Plus wire + Granite-embedding-30m or 311m Multilingual swap

---

## Memory rules to capture

1. **`feedback_external_review_triangulation_load_bearing.md`** (NEW) — When ≥3 independent reviewers cite the same weakness (TTM over-claim across NotebookLM + ChatGPT + Perplexity), it's load-bearing. Always ship the honest fix even if it conflicts with the polished narrative.
2. **`feedback_conceptual_stack_vs_shipped_stack.md`** (NEW) — Avoid the "architecture diagram faster than runtime" trap. Brutal judges read tier="INTEGRATION" + "canned-fallback" + "mock" + "swap-point" as "asking judge to reward planned integration not executed". Honest demotion > overpromise + crash credibility.
3. **`feedback_byte_equality_regression_guarantee_not_killshot.md`** (NEW) — D-050 byte-equality is serializer compatibility, not user-relevant invariant. Position as "regression guarantee" not as load-bearing positioning headline. Extend evidence to verdict + recommendation invariance.
