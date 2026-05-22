# Vinh Backend Plan — APEX

**Owner:** Vinh Le
**Lane:** Backend + ML pipeline + physics layer + Guardian + Docling/Vision intake
**Window:** 2026-05-21 (Day 2) → 2026-05-30 (Day 11 ship), 2026-05-31 (Day 12 submit)
**Hard deadline:** 2026-05-31, 11:59 PM ET
**Strategy:** Ship Day 11 → 24h buffer before submission

---

## Guiding principles

1. **V1 NumPy beats V2 CvxpyLayer if V1 ships and V2 doesn't.** Ship simple, upgrade later.
2. **Atomic commits + push immediately.** One logical change per commit. Conventional Commits prefix.
3. **Read before edit.** Per CLAUDE.md, re-Read files if >5 tool calls have elapsed.
4. **Research-tool first** for any uncertain fact. Context7 → tavily → firecrawl → EXA → WebFetch.
5. **No git hooks.** `.git/hooks/` stays defaults-only. Decline Husky / lefthook / pre-commit.
6. **No em-dash in prose** in any doc I write. Single most reliable AI-tone tell.
7. **9 PM ET Discord sync with Stephen.** Show screen, show what works, show what's broken.
8. **Session-end Claude Memory write** per D-005 if I do 3+ atomic commits or hit a gate.
9. **Daily pre-mortem entry** in `docs/pre-mortem.md` — what almost broke, what I learned.
10. **COA simultaneity wording:** "derived flag from approved hardware specs," not "explicit FIA field." Per Perplexity validation 2026-05-21.

---

## Wave-30 Maximal Architecture Lock - posture changes (read this before the gate map)

Wave-30 multi-model deep-research synthesis (research/wave-30/) landed 2026-05-22 with 19 architectural locks in `docs/decision-log.md` D-009 through D-027. Per Stephen's galaxy ambition directive: V2 / V3 / post-hackathon labels are RETIRED. The 8-tier physics + 12-tool Granite stack + LangGraph/MCP/ContextForge orchestration + tri-agent critic + WebGPU Granite Nano + APEX-Bench public benchmark + LIPS 4-axis evaluation are all in-scope for the 2026-05-31 submission.

Vinh-lane scope changes:
1. **G0 autograd spike replaced by D-027 Day-3 SCP go/no-go gate.** Same 6h time-box, larger test: prototype 3 unrolled SCP iterations through cvxpylayers with 8-tier Pacejka linearization on RTX 4060, not just frozen-TTM-forward-plus-cvxpylayers-backward. Pass criterion + fallback ladder below.
2. **Three-track forecasting ensemble** replaces "frozen TTM only." Track 1 TTM r2.1 channel-mix decoder fine-tune + Track 2 Granite FlowState + Track 3 Amazon Chronos-2 (D-010).
3. **Polyphase preprocessor** replaces "1 Hz mini-sector aggregator only." Three frequency paths coexist (D-011).
4. **8-tier physics** in the SCP solve (D-015). NOT in the convex QP only.
5. **cvxpylayers locked over qpth + theseus** (D-013).
6. **12-tool Granite stack** (D-016): added Granite Embedding R2 + TSPulse + Granite FlowState + Granite 4.0 Nano.
7. **LangGraph + MCP + ContextForge** orchestration runtime (D-017); Langflow demoted to visual demo facade.
8. **Tri-agent Agent-as-Judge critic loop + Mellea IVR repair** (D-018).
9. **5 shouldn't-be-possible moves** layered in (D-019): WebGPU Granite Nano + aLoRA + GEPA + EAGLE-3 + Agent-as-Judge.
10. **Gradient bridge two-regime seam at SCP projector output** (D-020): no end-to-end backprop through Mellea / Chronos-2.
11. **APEX-Bench public benchmark release + LIPS 4-axis evaluation** (D-026).

Cross-reference: `research/wave-30/README.md` for source manifest + `research/wave-30/09-notebooklm-synthesis-2026-05-22.md` for the architectural source-of-truth.

---

## Critical-path gate map (wave-30-revised)

| Gate | What | When | Pass criterion | Blocks |
|------|------|------|----------------|--------|
| **D-027** | **Day-3 SCP go/no-go gate (replaces former G0; single most important checkpoint in 12-day build)** | **Day 3, today, time-boxed 6h** | **3 unrolled SCP iterations through cvxpylayers with 8-tier Pacejka linearization on RTX 4060: gradients flow end-to-end (TTM channel-mix forecast through SCP projection without exploding / vanishing); verdict lands at FCVR = 0.00 on Sarah Reynolds canned fixture; logged in `logs/day-03-scp-go-no-go.md`** | **Everything. Fallback ladder: (a) drop to 2 SCP iterations + trust-region penalty if 3 oscillates; (b) escalate to D-A revision (decision-log entry) if 2 also oscillates. Do NOT proceed to Phase 1+ until D-027 passes or escalation logged.** |
| G1 | TTM smoke test | Day 3 night (after D-027 passes) | TTM r2.1 loads + 1Hz inference < 60s on RTX 4060; channel-mix decoder fine-tune scaffold ready (D-010 Track 1) | G2-G10 |
| G1b | Granite 4.1 8B Q4 GGUF latency bench | Day 3 night | Tokens/sec measured + logged | aLoRA hot-swap + EAGLE-3 deploy decision (D-019) |
| G1c | FlowState + Chronos-2 zero-shot smoke (D-010 Tracks 2 + 3) | Day 4 EOD | Both forecasters import + produce (B, 30, 14) tensor on Sarah fixture | Three-track fusion (Sync Point 3) |
| G2 | COA parse coverage | Day 5 | JSON contains all 9 adaptation domains + COA-derived c_overlap flag per D-A wave-28 refinement | Phase 3 narrator |
| G3 | V1 NumPy validator catches 5 impossibilities + approves 5 valid + golden-text round-trip serializer assertion passes (Convergence-14 floor) | Day 4 | All 10 fixtures pass + `violation.to_text()` produces deterministic output matching golden fixture | SCP projection layer |
| G4 | Three-track forecast ensemble beats seasonal-naive on FastF1 holdouts (holdout: laps 4-5 of fixture session, seed=42, channels: speed_mps + long_g, metric: per-channel MAE delta > 0; uncertainty band coverage 0.1 / 0.5 / 0.9 quantiles from Chronos-2) | Day 5 | MAE delta in our favor on defined split + Chronos-2 quantile bands render | If fails -> fine-tune-first pivot |
| G5 | Granite Guardian catches same 5 impossibilities as validator AND lexicographic COA tier-hierarchy stress-test passes (D-022) | Day 6 | All 5 violation logs produce expected verdicts; Tier-0/1 inviolable + Tier-2/3 elastic-slack relaxation verified on hairpin-steering-lock conflict | Convergence-14 suite |
| G5.5 | Physics-confidence detector (D-024) | Day 6 EOD | Mahalanobis-distance detector flags Pacejka mismatch on injected-incorrect-.tir fixture; Guardian downgrades verdict from SAFE to REVIEW | Guardian audit safety contract |
| G6 | Narrator end-to-end on Sarah fixture + tri-agent critic loop passes (D-018) + COA citations resolve to fixture (no invented FIA Articles per wave-28 closure) | Day 7 | Coaching report + provenance footer renders + Physics-Critic + Pedagogy-Critic + Guardian-Safety all approve; every citation traces to fixture COA JSON | Phase 4 orchestration |
| **G6.5** | **cvxpylayers Windows install fallback gate** | **Day 4 EOD** | **If cvxpylayers import fails after 4h debug -> switch to M2 / WSL2 / Linux container; log decision in `logs/day-04-cvxpy-fallback.md`** | **D-013 SCP projection layer** |
| G7 | LangGraph + MCP + ContextForge dummy run end-to-end (D-017 Sync Point 2) + Langflow demo-facade screenshot at 1920x1080 | Day 7 | LangGraph state machine executes ingestion -> RAG -> frontend without breaking; Langflow render committed | Day 9 demo + paper §3.5 |
| G8 | Demo loop fits 60s on RTX 4060 (D-019 includes EAGLE-3 speculative decoding + aLoRA hot-swap so latency budget tightened to 15s coaching-report generation per D-019 Move 3) | Day 8 | Latency log committed; 15s generation + 60s total wall-clock both verified | Day 9 video recording |
| **G9** | **Three-track forecasting fusion + 8-tier SCP physics projector convergence (Sync Point 3)** | **Day 9** | **(B, 30, 14) tensor from ensemble flows through 8-tier unrolled SCP without crashing or vanishing gradients; FCVR = 0.00 on Sarah Reynolds canned fixture; v_x near-zero damping + stiff-ODE steady-state substitution per D-014 verified** | **Day 10 dress rehearsal + LIPS evaluation harness** |
| **G10** | **LIPS 4-axis evaluation harness + APEX-Bench release prep (D-026 + Sync Point 4)** | **Day 11** | **All 4 ablation rows populated (zero-shot TTM; soft-loss; APEX hard projection; full 3-track + 8-tier); MLPerf tolerance bands documented per D-023; dockerized harness `eval/Dockerfile` reproduces results on RTX 4060 within published bounds; apex-bench/ repository prepared for public release** | **Day 12 submission** |

**APEX Lite EARLY trigger Q-007** activates if I'm unresponsive at noon ET Day 2 — already cleared (invite accepted). Q-004 Lite trigger activates if Day 9 Gate G9 fails 2+ items.

**Council trim (2026-05-22) - SUPERSEDED by wave-30 Maximal Architecture Lock 2026-05-22 night.** Council trim treated G7 as screenshot-only + G8 as stretch + sim-rig backend as killed. Wave-30 overrides this for G7-G10: LangGraph + MCP + ContextForge is the orchestration runtime now (D-017), not a screenshot. G8 latency budget tightens to 15s coaching-report generation via EAGLE-3 speculative decoding + aLoRA hot-swap (D-019). G9 + G10 are new gates for three-track fusion + 8-tier SCP convergence + LIPS / APEX-Bench. Engine-agnostic `PhysicsViolationLog.to_text()` boundary stays mandatory from Day 4. Sim-rig backend stays killed (frontend `SimRigStream` already mocks the WebSocket stream).

---

## Phase-by-phase plan

### Phase 0 — Bootstrap (Day 3, today)

**Goal:** Run the autograd-compatibility spike (G0). Until G0 passes, the entire plan is built on an unverified assumption. After G0: smoke-test the load-bearing models, establish git identity, scaffold contracts.

| # | Task | File | Status |
|---|------|------|--------|
| 0.1 | `git config user.email vinhhle24@gmail.com && git config user.name vinhbin` | local | ⬜ |
| 0.2 | Verify `.git/hooks/` is defaults-only (`*.sample` files only) | local | ⬜ |
| 0.3 | Create Python venv: `cd app/backend && python -m venv .venv` | local | ⬜ |
| 0.4a | **Install torch alone first** with CUDA wheel: `pip install torch --index-url https://download.pytorch.org/whl/cu121` (CUDA wheel resolution is #1 killer; isolate it) | local | ⬜ |
| 0.4b | Then install: `pip install granite-tsfm transformers fastf1 numpy pandas pytest` | local | ⬜ |
| 0.4c | Defer to a second pin run: `pip install cvxpy cvxpylayers` (Windows wants Visual C++ Build Tools; may need `--no-build-isolation`) | local | ⬜ |
| 0.4d | `pip freeze > app/backend/requirements.txt` with hashes pinned | `app/backend/requirements.txt` | ⬜ |
| **0.5** | **🚨 Gate G0 — AUTOGRAD SPIKE (6h time-box, blocks everything):** load frozen TTM forward pass → wrap synthetic QP in `CvxpyLayer` → compose `x → TTM(x) → CvxpyLayer(projection) → loss.backward()` → verify gradients flow end-to-end on Windows + pinned versions. **Output: one-line pass/fail + traceback if fail.** | `logs/day-03-autograd-spike.md` | ⬜ |
| **0.5b** | **G0 decision branch.** Pass → continue. Fail → escalate to Stephen, write `docs/decision-log.md` entry D-009 "D-A revision: V2 CvxpyLayer not viable on TTM forward graph; fallback architecture TBD." Do NOT proceed to 0.6+ unilaterally. | `docs/decision-log.md` | ⬜ |
| 0.6 | **Start fastf1 cache download in background hour 1** (first telemetry pull ~500MB, rate-limited; don't block on it Day 8) | `app/backend/.fastf1_cache/` | ⬜ |
| 0.7 | **Gate G1 — TTM smoke test:** load `ibm-granite/granite-timeseries-ttm-r2`, run zero-shot on 5-lap FastF1 export, log load time + inference latency + output tensor shape | `logs/day-03-ttm-smoke.md` | ⬜ |
| 0.8 | **Gate G1b — Granite 4.1 8B Q4 GGUF latency bench** via llama.cpp on RTX 4060 (tokens/sec on 300-word coaching-report prompt) | `logs/day-03-granite-latency.md` | ⬜ |
| 0.9 | **Shared contracts module — single source of truth for inter-layer types (Software Lead fix #2).** Define `PhysicsViolationLog` dataclass + `ViolationRecord` per-step schema + `simultaneity_flag` per-step channel shape `(batch, 24, 1)` here, re-export everywhere. | `app/backend/apex/shared/contracts.py` | ⬜ |
| 0.10 | **Channel-count audit (Software Lead fix #1).** PLAN.md §Shared contracts says 9 channels but `t` is time index, not feature. Resolve in `contracts.py`: TTM input = 8 telemetry channels + 1 COA simultaneity bit per step = 9 features. Document the broadcast/tile adapter from scalar COA flag to per-step `(batch, 24, 1)` tensor. | `app/backend/apex/shared/contracts.py` + PLAN.md §Shared contracts amendment | ⬜ |
| 0.11 | Sketch physics validator function signatures importing from `shared.contracts` (per briefing Step 3) | `app/backend/apex/physics/validator.py` | ⬜ |
| 0.12 | **Observability minimum (SRE-reviewer fix):** structured logging module with `audit_id` + `commit_sha` + `model_versions` baked into every log line. ~2h, saves the demo if something explodes live. | `app/backend/apex/shared/logging.py` | ⬜ |
| 0.13 | Commit `chore(plan): claim Day-3 backend tasks + G0 spike result` to PLAN.md | PLAN.md | ⬜ |
| 0.14 | Daily pre-mortem entry | `docs/pre-mortem.md` | ⬜ |

**Pass condition for Phase 0:** G0 passed (or D-A revision escalated) + G1 + G1b both committed with numbers + `contracts.py` shipped + observability module live. If G0 fails → text Stephen immediately, write D-009 to decision log, await D-A revision before Phase 1.

---

### Phase 1 — Document parsing (Day 3 morning, parallel with Phase 2 start)

**Goal:** Granite-Docling parses FIA COA → JSON. Granite Vision parses timing sheet → CSV. Both are pre-cached at onboarding, not in demo critical path.

| # | Task | File | Status |
|---|------|------|--------|
| 1.1 | Granite-Docling 258M parses one fixture FIA COA PDF → structured JSON preserving all 9 adaptation domains + section IDs | `app/backend/apex/intake/coa_parser.py` | ⬜ |
| 1.2 | Granite Vision 4.1 parses one fixture SRO timing-sheet PDF → CSV (lap times + sector splits) | `app/backend/apex/vision/timing_parser.py` | ⬜ |
| 1.3 | Public FIA COA + SRO timing-sheet fixtures committed | `fixtures/coa/`, `fixtures/timing-sheets/` | ⬜ |
| 1.4 | Unit tests for intake + vision parsers (schema fixtures) | `app/backend/tests/test_intake.py`, `test_vision.py` | ⬜ |
| 1.5 | **Docling fallback ladder test** — if Granite-Docling fails on multi-column or French legal PDF, document failure mode and fall back: Docling → LlamaParse → Mistral OCR → manual JSON | `logs/day-03-docling-bench.md` | ⬜ |
| 1.6 | **Gate G2 — COA parse coverage:** JSON contains all 9 adaptation domains + section IDs | `logs/day-03-g2.md` | ⬜ |
| 1.7 | OpenRouter API key wired + Granite 4.1 8B free-tier sample call (`openrouter.ai/ibm-granite/granite-4.1-8b`) | `.env.example` + `logs/day-03-openrouter.md` | ⬜ |
| 1.8 | watsonx.ai free account stood up as backup | `logs/day-03-watsonx.md` | ⬜ |
| 1.9 | COA parser detects approved hand-control hardware specs and **derives** simultaneity-permission flag (per Perplexity validation wording). **Output is a scalar bool stored in `CoaParseResult.simultaneity_permitted`. The broadcast adapter in `shared.contracts.build_ttm_input()` is the SINGLE place that tiles this scalar to the per-step `(batch, 24, 1)` channel — never duplicated in `forecast.py` or `validator.py` (Software Lead fix #2).** | `app/backend/apex/intake/coa_parser.py` (new fn `derive_simultaneity_flag`) | ⬜ |

**Pass condition:** G2 green + one COA + one timing sheet parsed end-to-end + fallback ladder documented.

---

### Phase 2 — Physics layer (Days 3-5)

**Goal:** The original contribution. Frozen TTM → physics-projection layer → text violation log. The NeurIPS-paper-worthy code.

#### Day 4 — V1 NumPy validator + violation log (engine-agnostic boundary)

**Council mandate:** `PhysicsViolationLog.to_text()` must be engine-agnostic from Day 4 so V1 NumPy and V2 CvxpyLayer produce identical violation strings. Prevents NeurIPS camera-ready fixture divergence and lets G5 Guardian audits be engine-portable.

| # | Task | File | Status |
|---|------|------|--------|
| 2.1 | `friction_ellipse_check(a_long, a_lat, mu, g)` — constant-μ V1 | `app/backend/apex/physics/validator.py` | ⬜ |
| 2.2 | `forward_euler_consistency(speed, a_long, dt, tolerance_band)` — kinematic V1 **with explicit tolerance band ≥ 1Hz quantization error to prevent false-positives on mid-second braking events (Software Lead fix #7)** | same | ⬜ |
| 2.3 | `bicycle_kinematic_check(lat_g, steering_rad, speed, wheelbase)` — V1 | same | ⬜ |
| 2.4 | `coa_simultaneity_rule(throttle_series, brake_series, simultaneity_channel)` — **takes per-step simultaneity_channel `(T,)` tensor (NOT scalar bool) sourced from same `shared.contracts` adapter that builds TTM input. Single source of truth (Software Lead fix #2).** | same | ⬜ |
| 2.5 | `PhysicsViolationLog` dataclass imported from `shared.contracts` (NOT redefined here). `.to_text()` serializer is **engine-agnostic — identical output whether violations came from NumPy V1 or CvxpyLayer V2 (Long-Term Architect fix)**. Golden-text fixtures committed alongside. | `app/backend/apex/physics/violation_log.py` + `app/backend/tests/fixtures/violation_log_golden/` | ⬜ |
| 2.6 | Unit tests: 5 impossible-physics traces (one per violation type) + 5 valid traces | `app/backend/tests/test_physics_v1.py` | ⬜ |
| 2.6b | **Round-trip serializer assertion (Convergence-14 floor, Software Lead fix #4):** every violation type produces deterministic `.to_text()` matching its golden fixture exactly. Re-running with same input twice produces byte-identical output. | `app/backend/tests/test_physics_v1.py` | ⬜ |
| 2.7 | **Gate G3 — V1 catches 5 impossibilities + approves 5 valid + round-trip serializer assertion passes** | `logs/day-04-g3.md` | ⬜ |

#### Day 4 — TTM → validator → text log end-to-end

| # | Task | File | Status |
|---|------|------|--------|
| 2.8 | `forecast.py` — TTM inference wrapper, 1Hz mini-sector aggregation from 50Hz raw, 24-step context window | `app/backend/apex/ttm/forecast.py` | ⬜ |
| 2.9 | End-to-end: telemetry CSV → TTM forecast → NumPy validator → text violation log | integration script | ⬜ |
| 2.10 | Integration test on a FastF1 5-lap slice | `app/backend/tests/test_ttm_integration.py` | ⬜ |
| 2.11 | **Gate G4 — zero-shot TTM vs seasonal-naive MAE bake-off on FastF1 holdouts** | `logs/day-04-g4.md` | ⬜ |

#### Day 5 — CvxpyLayer QP V2 + Guardian wiring

| # | Task | File | Status |
|---|------|------|--------|
| 2.12 | CvxpyLayer QP projection layer V2 (`projection.py`) — projects `(a_long, a_lat)` onto friction-ellipse boundary, differentiable. **Returns `PhysicsViolationLog` imported from `shared.contracts` (NOT a new schema). `.to_text()` output must byte-match V1 NumPy output on identical input — round-trip serializer test from G3 runs against V2 too.** | `app/backend/apex/physics/projection.py` | ⬜ |
| 2.13 | V2 cut decision: if convergence issues by EOD Day 5, ship V1 NumPy as floor. **Per council: D-A still holds because engine-agnostic boundary means V1 and V2 emit identical violation strings — paper §3.2 can still cite QP formulation as the canonical engine while V1 ships in the demo. Escalate to Stephen + decision-log entry if V2 cut.** | go/no-go log entry | ⬜ |
| 2.14 | Granite Guardian 4.1 BYOC custom rules audit on text violation log. **`audit()` returns `GuardianAudit` schema (from `shared.contracts`) including `audit_id: str` generated per-call. UI consumes `audit_id` — never None (Software Lead fix #9).** | `app/backend/apex/guardian/audit.py` | ⬜ |
| 2.15 | Guardian text-rendering helper — surface reasoning trace in think-mode for UI | `app/backend/apex/guardian/audit.py` | ⬜ |
| 2.16 | **Gate G5 — Guardian catches same 5 impossibilities as validator** | `app/backend/tests/test_guardian_audit.py` + `logs/day-05-g5.md` | ⬜ |

**Pass condition:** G3 + G4 + G5 all green. V1 NumPy validator is the floor; V2 CvxpyLayer is the ceiling.

---

### Phase 3 — Narrator + Sarah Reynolds (Day 6)

**Goal:** Granite 4.1 8B Instruct writes the coaching report. Sarah Reynolds fixture proves the adaptive-driver flow end-to-end.

| # | Task | File | Status |
|---|------|------|--------|
| 3.1 | Granite 4.1 8B Instruct narrator wired — reads forecast envelope + COA + debrief, emits tuning delta with citations (COA section + FIA Article) | `app/backend/apex/instruct/narrator.py` | ⬜ |
| 3.2 | Sarah Reynolds telemetry fixture (synthetic hand-control channels, ~5 laps Donington) | `fixtures/personas/sarah-reynolds-telemetry.csv` | ⬜ |
| 3.3 | Sarah Reynolds COA fixture (approved MME-style electronic hand-control unit) | `fixtures/personas/sarah-reynolds-coa.pdf` + parsed `.json` | ⬜ |
| 3.4 | Sarah Reynolds debrief text fixture | `fixtures/personas/sarah-reynolds-debrief.md` | ⬜ |
| 3.5 | End-to-end: Sarah fixtures → TTM → projection → narrator → Guardian → coaching report JSON | integration | ⬜ |
| 3.6 | Provenance footer assembler — model versions + COA section IDs + Guardian `audit_id` + commit SHA | `app/backend/apex/instruct/provenance.py` | ⬜ |
| 3.6b | **Contract test: `narrator.py` → `provenance.py` (Software Lead fix #9).** Assert provenance footer receives non-None `audit_id` for every coaching report. Run as part of G6. | `app/backend/tests/test_provenance_contract.py` | ⬜ |
| 3.6c | **Citation resolution test (G6 hardening, Software Lead fix #6).** Every FIA Article + COA section ID cited in a coaching report must resolve to a real entry in the fixture COA JSON. Hallucinated citations fail G6. | `app/backend/tests/test_citation_resolution.py` | ⬜ |
| 3.7 | Q&A hostile rehearsal pass 1 with Stephen on Discord | mental | ⬜ |
| 3.8 | **Gate G6 — Sarah end-to-end produces coaching report with provenance footer + audit_id non-None + every citation resolves to fixture COA** | `logs/day-06-g6.md` | ⬜ |

**Pass condition:** Drop Sarah fixtures into the pipeline. Get back a JSON with corners, tuning delta, forecast envelope, Guardian verdict, and provenance footer.

---

### Phase 4 — Orchestration + polish (Days 7-8)

**Goal:** Langflow makes the pipeline visible. Convergence-14 makes the safety story bulletproof. 60s latency budget closed.

#### Day 7 — Langflow + Convergence-14

| # | Task | File | Status |
|---|------|------|--------|
| 4.1 | Langflow graph export of full pipeline (intake → vision → TTM → projection → Guardian → instruct → provenance) | `app/backend/apex/langflow/graph.json` + screenshot | ⬜ |
| 4.2 | **Convergence-14 serializer unit-test suite** — every kinematic violation type has a fixture + verified Guardian verdict (the load-bearing safety claim) | `app/backend/tests/test_serializer.py` | ⬜ |
| 4.3 | **Gate G7 — Langflow renders at 1920x1080** | screenshot in `logs/day-07-g7.md` | ⬜ |

#### Day 8 — Caching + latency closure

| # | Task | File | Status |
|---|------|------|--------|
| 4.4 | Cache COA + timing-sheet parses at onboarding (per Card 05 latency defense). **Cache invalidation key = SHA256(COA PDF bytes); re-upload of same driver's COA with different bytes invalidates derived simultaneity flag (Software Lead fix #8).** | `app/backend/apex/intake/cache.py` | ⬜ |
| 4.5 | End-to-end latency profile — step-by-step timing on RTX 4060 with cached intake | `logs/day-08-latency-profile.md` | ⬜ |
| 4.6 | **Gate G8 — coaching loop fits 60s on RTX 4060** | same log | ⬜ |
| 4.7 | Q&A hostile rehearsal pass 2 with Stephen | mental | ⬜ |

**Pass condition:** Langflow screenshot + Convergence-14 green + 60s budget proven.

---

### Phase 5 — Demo + deploy (Days 9-10)

**Goal:** HF Space or OpenRouter deploy live. Sim-rig WebSocket backend if time permits. Production video recorded.

#### Day 9 — Deploy

| # | Task | File | Status |
|---|------|------|--------|
| 5.1 | **Deploy decision finalized** (per Perplexity Claim 11): Option 3 = Vercel frontend + OpenRouter `openrouter.ai/ibm-granite/granite-4.1-8b` + watsonx.ai. No HF Space in judge path. | decision log entry | ⬜ |
| 5.2 | Backend API deployed (Modal / Fly.io / Vercel functions — TBD at sync) | `app/backend/Dockerfile` if needed | ⬜ |
| 5.3 | Smoke test the deployed pipeline end-to-end with Sarah fixtures | `logs/day-09-deploy-smoke.md` | ⬜ |
| 5.4 | Colab notebook backup (per Stephen's `deliverables/apex-demo.ipynb` skeleton) — fully runnable end-to-end | `deliverables/apex-demo.ipynb` | ⬜ |
| ~~5.5~~ | ~~Sim-rig WebSocket backend~~ — **KILLED per council trim (2026-05-22).** Frontend `SimRigStream` consumer can mock-stream from a static fixture for Stephen's demo. Cited risk: solo dev + 10 days + Windows + CUDA + cvxpy is already ~18 honest days of work. | n/a | ✂️ |
| 5.5b | **`physics-tsfm` v0.1 TestPyPI tag (partial Expansionist absorb).** If `physics-tsfm/` library carve-out happens per PLAN.md L74, tag v0.1 and push to TestPyPI Day 9. Zero new code — just `pyproject.toml` + `git tag` + `twine upload --repository testpypi`. Citable artifact for NeurIPS paper. | `physics-tsfm/pyproject.toml` + `logs/day-09-pypi.md` | ⬜ |

#### Day 10 — Video + dress rehearsal

| # | Task | File | Status |
|---|------|------|--------|
| 5.6 | Full dress rehearsal on RTX 4060 with Stephen — time every step | `logs/day-10-dress.md` | ⬜ |
| 5.7 | Q&A hostile pass 3 — all 5 cards cold, with follow-ups | mental | ⬜ |
| 5.8 | Backend support during Stephen's video record session | live | ⬜ |
| 5.9 | **Q-004 APEX Lite go/no-go** — if 2+ Gate-G9 items fail, ship Lite | decision | ⬜ |

**Pass condition:** Live deploy works. Dress rehearsal under 60s. Video in the can.

---

### Phase 6 — Submission package (Day 11)

**Goal:** Everything submission-grade. Paper draft polished. All external-tool passes complete.

| # | Task | File | Status |
|---|------|------|--------|
| 6.1 | NeurIPS Workshop paper §3.2 final pass — physics projection math + COA wording correction | `paper/apex-neurips-workshop-2026.md` | ⬜ |
| 6.2 | Architecture-spec Layer 3 COA schema — apply "derived flag" wording | `docs/architecture-spec.md` | ⬜ |
| 6.3 | Backend README — install + run + test instructions | `app/backend/README.md` | ⬜ |
| 6.4 | Convergence-14 suite final pass — every violation type covered | `app/backend/tests/test_serializer.py` | ⬜ |
| 6.5 | Cost audit — token spend, API calls, infra cost | `docs/cost-audit.md` | ⬜ |
| 6.6 | Final pre-mortem entry | `docs/pre-mortem.md` | ⬜ |

**Pass condition:** Repo is submission-grade. No TODOs in backend code. All tests green.

---

### Phase 7 — Submit (Day 12)

Stephen-led. My role:
- On standby for backend issues during submission
- Live demo if BeMyApp asks for one
- Retrospective contribution

---

## Files I will create / own

```
app/backend/
├── apex/
│   ├── shared/                    # Phase 0 — single source of truth (Software Lead fix #2)
│   │   ├── contracts.py           # PhysicsViolationLog, ViolationRecord, GuardianAudit, build_ttm_input adapter
│   │   └── logging.py             # Structured logging with audit_id + commit_sha + model_versions (SRE fix)
│   ├── intake/
│   │   ├── coa_parser.py          # Phase 1
│   │   └── cache.py               # Phase 4 (SHA256 invalidation key)
│   ├── vision/
│   │   └── timing_parser.py       # Phase 1
│   ├── ttm/
│   │   └── forecast.py            # Phase 2 Day 4
│   ├── physics/
│   │   ├── validator.py           # Phase 2 Day 4
│   │   ├── violation_log.py       # Phase 2 Day 4 (engine-agnostic .to_text())
│   │   └── projection.py          # Phase 2 Day 5 (V2 — imports from shared.contracts)
│   ├── guardian/
│   │   └── audit.py               # Phase 2 Day 5 (returns audit_id non-None)
│   ├── instruct/
│   │   ├── narrator.py            # Phase 3
│   │   └── provenance.py          # Phase 3
│   ├── langflow/
│   │   └── graph.json             # Phase 4 Day 7 (screenshot-only deliverable per council)
│   └── ~~sim_rig/~~               # KILLED per council trim 2026-05-22
├── tests/
│   ├── fixtures/
│   │   └── violation_log_golden/  # Phase 2 Day 4 — Convergence-14 round-trip fixtures
│   ├── test_intake.py
│   ├── test_vision.py
│   ├── test_physics_v1.py         # Includes round-trip serializer assertion (G3)
│   ├── test_ttm_integration.py
│   ├── test_guardian_audit.py
│   ├── test_provenance_contract.py  # Phase 3 (audit_id non-None)
│   ├── test_citation_resolution.py  # Phase 3 (no hallucinated FIA Articles)
│   └── test_serializer.py         # Convergence-14
├── requirements.txt               # Phase 0 task 0.4d (pinned hashes)
├── Dockerfile                     # Phase 5 if needed
└── README.md                      # Phase 6

fixtures/
├── coa/                           # Phase 1
├── timing-sheets/                 # Phase 1
└── personas/
    ├── sarah-reynolds-telemetry.csv
    ├── sarah-reynolds-coa.pdf
    └── sarah-reynolds-debrief.md  # Phase 3

logs/
├── day-02-ttm-smoke.md
├── day-02-granite-latency.md
├── day-03-docling-bench.md
├── day-03-g2.md
├── day-03-g3.md
├── day-03-openrouter.md
├── day-03-watsonx.md
├── day-04-g4.md
├── day-05-g5.md
├── day-06-g6.md
├── day-07-g7.md
├── day-08-latency-profile.md
├── day-09-deploy-smoke.md
└── day-10-dress.md

research/
└── perplexity-comet-sweep-2026-05-21.md   # commit tonight

deliverables/
└── apex-demo.ipynb                # Phase 5 Day 9 — finish Stephen's skeleton
```

---

## Decision triggers (when to cut features)

| By | If | Cut to |
|----|----|----|
| **Day 3 EOD** | **G0 autograd spike fails (TTM forward not differentiable through cvxpylayers)** | **Escalate to Stephen + D-009 decision-log entry. D-A revision required — do NOT proceed unilaterally.** |
| **Day 4 EOD (G6.5)** | **`cvxpylayers` Windows install fails after 4h debug** | **Switch to M2 / WSL2 / Linux container. Log decision in `logs/day-04-cvxpy-fallback.md`.** |
| Day 3 night | G1 TTM smoke fails on RTX 4060 | APEX Lite — drop TTM, keep Granite Instruct + Guardian on regulatory-only product |
| Day 4 | G4 zero-shot TTM does not beat seasonal-naive on defined holdout (laps 4-5, seed=42, channels speed_mps + long_g) | Fine-tune-first, skip zero-shot pitch claim |
| Day 5 | V2 CvxpyLayer has convergence issues | Ship V1 NumPy as floor. Engine-agnostic `.to_text()` boundary means D-A still holds — V1 and V2 emit identical violation strings, paper §3.2 cites QP as canonical engine. |
| Day 6 | Granite-Docling fails on real COA | Fallback ladder: LlamaParse → Mistral OCR → manual JSON |
| Day 8 | 60s budget blown on RTX 4060 | G8 was already demoted to stretch by council trim. Pre-record demo, use live UI for Q&A only. |
| Day 9 | 2+ G9 items fail | Q-004 APEX Lite full invocation |

---

## Daily rhythm

- **Morning:** read PLAN.md + new commits from Stephen overnight + check `🟡 NEEDS-INPUT` rows
- **Code blocks:** 90 min focused, atomic commits per logical change
- **9 PM ET:** Discord sync with Stephen — screen share, what works, what's broken
- **Session end:** Claude Memory write per D-005 if 3+ commits or gate completion, + daily pre-mortem entry

---

## What I will NOT do (scope discipline)

- No real-time pit strategy (post-race only — challenge theme is "Beyond the Finish Line")
- No 3D track modeling (constant-μ 2D friction circle for hackathon, full Pacejka is paper work)
- No real-world telemetry partnership (FastF1 + synthetic hand-control channels)
- No mobile app
- No multi-driver comparison
- No frontend code (Stephen's lane — don't cross)
- No pitch deck edits (Stephen's lane — don't cross)
- No git hooks, no Husky, no commit-msg validators
- No em-dash, no AI-tone blocklist words in any doc I write

---

## Things to bring to 9 PM sync (tonight, Day 3)

1. **G0 autograd spike result (pass/fail).** Single most important number tonight. If fail, escalation conversation starts here.
2. G1 result (TTM smoke test pass/fail + numbers)
3. G1b result (Granite 4.1 8B Q4 tokens/sec on RTX 4060)
4. **COA wording note:** "derived flag, not explicit flag" — for whenever he writes Card 04 or COA pitch language
5. Deploy decision FYI: HF Spaces free tier won't host the full stack — Vercel + OpenRouter is the call by Day 9
6. **Council trim FYI:** sim-rig WebSocket backend killed; G7 reduced to screenshot-only; G8 demoted to stretch. No frontend impact — Stephen's `SimRigStream` can mock-stream from static fixture if he still wants the visual.

Everything else stays in lane and ships per this plan.

---

## Provenance — council edits 2026-05-22

This plan was pressure-tested by an llm-council session (TECHNICAL mode, 7 advisors + 5 peer reviewers + chairman synthesis). Full transcript at [council-transcript-20260522-vinh-backend-plan.md](../council-transcript-20260522-vinh-backend-plan.md).

**Council changes applied:**
- **Added Gate G0** (autograd-compatibility spike) as a hard blocker before any feature code. Senior-reviewer's caught blind spot; chairman called it "the single highest-leverage finding."
- **Hardened G3** with golden-text round-trip serializer assertion (Convergence-14 floor). Software Lead fix #4.
- **Defined G4 holdout** explicitly (laps 4-5, seed=42, channels speed_mps + long_g, per-channel MAE delta). Software Lead fix #5.
- **Hardened G6** with citation-resolution test (no hallucinated FIA Articles) + provenance contract test (audit_id non-None). Software Lead fixes #6 + #9.
- **Added G6.5** (cvxpylayers Windows install fallback) per Executor.
- **Trimmed G7** to screenshot-only deliverable, **demoted G8 to stretch**, **killed sim-rig WebSocket backend** (task 5.5). Council convergence (Contrarian + Executor + chairman).
- **Added `shared/contracts.py`** as single source of truth for inter-layer types — resolves channel-count off-by-one + scalar-vs-tensor simultaneity duality + violation-log schema drift. Software Lead fixes #1, #2, #3.
- **Engine-agnostic `PhysicsViolationLog.to_text()`** from Day 4 so V1 NumPy and V2 CvxpyLayer emit byte-identical violation strings. Long-Term Architect's load-bearing wall #2. Preserves D-A even if V2 is cut.
- **Added observability minimum** (`shared/logging.py` with audit_id + commit_sha + model_versions). SRE-reviewer fix.
- **Added forward-Euler tolerance band** to prevent 1Hz quantization false-positives. Software Lead fix #7.
- **Cache invalidation key** = SHA256(COA PDF bytes). Software Lead fix #8.
- **Added partial Expansionist absorb:** `physics-tsfm` v0.1 TestPyPI tag Day 9 (zero new code). Rejected: external-person DM, public benchmark leaderboard.
- **Phase 0 install sequence** reordered (torch CUDA alone first, defer cvxpy) per Executor.
- **Phase 0 fastf1 cache download** starts in background hour 1 (500MB rate-limited; SRE SPOF flag).

**Council confidence:** MEDIUM, flips to HIGH if G0 spike passes, flips to LOW if G0 spike fails. The single piece of evidence that determines this is the autograd spike result — everything else in this plan is downstream of it.
