# Vinh Backend Plan - APEX

**Owner:** Vinh Le
**Lane:** Backend + ML pipeline + physics layer + Guardian + Docling/Vision intake
**Window:** 2026-05-21 (Day 2) → 2026-05-30 (Day 11 ship), 2026-05-31 (Day 12 submit)
**Hard deadline:** 2026-05-31, 11:59 PM ET
**Strategy:** Ship Day 11 → 24h buffer before submission

---

## Guiding principles

1. **Galaxy ambition target: ship the maximal architecture per D-009 + wave-30 ceiling.** V1 NumPy + V2 CvxpyLayer + D-A-revision PhysicsTTM-3-layer baseline are the named ship-floor ladders that activate per the kill-switch table; "stretch" / "v2" / "post-hackathon" deferral labels are RETIRED per wave-30 lock.
2. **Atomic commits + push immediately.** One logical change per commit. Conventional Commits prefix.
3. **Read before edit.** Per CLAUDE.md, re-Read files if >5 tool calls have elapsed.
4. **Research-tool first** for any uncertain fact. Context7 → tavily → firecrawl → EXA → WebFetch.
5. **No git hooks.** `.git/hooks/` stays defaults-only. Decline Husky / lefthook / pre-commit.
6. **No em-dash in prose** in any doc I write. Single most reliable AI-tone tell.
7. **9 PM ET Discord sync with Stephen.** Show screen, show what works, show what's broken.
8. **Session-end Claude Memory write** per D-005 if I do 3+ atomic commits or hit a gate.
9. **Daily pre-mortem entry** in `docs/pre-mortem.md` - what almost broke, what I learned.
10. **COA simultaneity wording:** "derived flag from approved hardware specs," not "explicit FIA field." Per Perplexity validation 2026-05-21.

---

## Wave-30 Maximal Architecture Lock - posture changes (read this before the gate map)

> **Council v2 amendment 2026-05-22 night** ([transcript](../council-transcript-20260522-vinh-backend-plan-v2.md)). Six advisors caught the same Day-3-morning contract bug (tensor shape disagreement across L93/L94/L118) + the G6.5/D-027 backwards-in-time ladder. The plan now: (1) carries `shapes.py` as canonical tensor-shape source (task 0.4e); (2) stages D-027 into G-0.5 hardware-load + G0.6 cvxpy-import + Stage C constant-μ spike (NOT 8-tier on Day 3); (3) retires G6.5 by pulling it forward to G0.6; (4) defines "oscillates" numerically (`‖∇L‖ ≥ 1e4` ∨ residual non-decrease over 2 iterates ∨ NaN); (5) pre-commits the three-track ensemble cut as de-scope rung 1 on Stage C fail; (6) adds `DifferentiableProjector` Protocol (task 0.4f) so V1 NumPy / cvxpylayers / qpth / Theseus all swap; (7) adds G9 + G10 task rows to Phase 5 + 6. The maximal architecture is still the target; the demo path is APEX Lite per D-028 if Stage C fails.

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
| **D-027** | **Day-3 SCP go/no-go gate - STAGED per council v2 (replaces former G0; single most important checkpoint in 12-day build)** | **Day 3, today, time-boxed: G-0.5 hour 1, G0.6 hour 2, Stage C hours 3-6** | **Three-stage pass: (G-0.5) TTM-r2 loads + emits `(B, 30, 14)` on RTX 4060; (G0.6) cvxpylayers imports clean on Windows + 10-line README example runs; (Stage C) 50-line `scp_spike.py` with hardcoded fake-TTM tensor + constant-μ friction ellipse (NOT 8-tier yet) + single SCP iterate + `.backward()` produces finite gradient norm `‖∇L‖ < 1e4` + FCVR = 0.00 on Sarah stub. 8-tier Pacejka + 3-iteration unroll move to Day 4 task 2.12. Logged in `logs/day-03-scp-go-no-go.md`.** | **Everything. Fail criterion ("oscillates"): residual non-decrease over 2 consecutive iterates ∨ `‖∇L‖ ≥ 1e4` ∨ NaN. Fallback ladder: (a) Day 4 task 2.12 drops to 2 SCP iterations + trust-region penalty (decision-log D-027 spec); (b) if 2 also oscillates Day 4, escalate to D-A revision; pre-committed de-scope rung 1 (cut three-track ensemble Tracks 2+3) fires on Stage C fail at Day 3 EOD. Do NOT proceed to Phase 1+ until Stage C passes or escalation logged.** |
| G1 | TTM smoke test | Day 3 night (after D-027 passes) | TTM r2.1 loads + 1Hz inference < 60s on RTX 4060; channel-mix decoder fine-tune scaffold ready (D-010 Track 1) | G2-G10 |
| G1b | Granite 4.1 8B Q4 GGUF latency bench | Day 3 night | Tokens/sec measured + logged | aLoRA hot-swap + EAGLE-3 deploy decision (D-019) |
| G1c | FlowState + Chronos-2 zero-shot smoke (D-010 Tracks 2 + 3) | Day 4 EOD | Both forecasters import + produce (B, 30, 14) tensor on Sarah fixture | Three-track fusion (Sync Point 3) |
| G2 | COA parse coverage | Day 3 morning (matches Phase 1 header; was Day 5 - council v2 fix) | JSON contains all 9 adaptation domains + COA-derived c_overlap flag per D-A wave-28 refinement | Phase 3 narrator |
| G3 | V1 NumPy validator catches 5 impossibilities + approves 5 valid + golden-text round-trip serializer assertion passes (Convergence-14 floor) | Day 4 | **PASS Day 4** (commit `9e114b5`; 19 tests in `tests/test_physics_v1.py` + `logs/day-04-g3.md`). All 10 fixtures pass + `violation.to_text()` produces deterministic output matching golden fixture. | SCP projection layer |
| ~~G4~~ | ~~Three-track forecast ensemble beats seasonal-naive on FastF1 holdouts (holdout: laps 4-5 of fixture session, seed=42, channels: speed_mps + long_g, metric: per-channel MAE delta > 0; uncertainty band coverage 0.1 / 0.5 / 0.9 quantiles from Chronos-2)~~ | ~~Day 5~~ | **FAIL Day 4** (`logs/day-04-g4.md`): zero-shot TTM-r2 MAE 35.18 m/s vs seasonal-naive 18.38 m/s on Hamilton Bahrain 2024 Q laps 4-5 speed_mps; long_g absent from FastF1 per pre-mortem row 62. Fine-tune-first pivot triggered per L377: drop "zero-shot beats naive" pitch claim, elevate D-010 Track 1 channel-mix decoder fine-tune to Day 5 morning, reframe TTM as forecast-envelope generator (not point-prediction winner). Q-004 APEX Lite NOT triggered: D-A floor + V1 NumPy validator hold; only the zero-shot accuracy claim is dropped. | Discord 9 PM ET sync escalation tonight; Day 5 fine-tune track starts AM. |
| G5 | Granite Guardian catches same 5 impossibilities as validator AND lexicographic COA tier-hierarchy stress-test passes (D-022) | Day 6 | **PASS Day 5** (`logs/day-05-g5.md`; 22 Guardian tests inc. test_g5_guardian_catches_all_v1_impossibilities + test_g5_hairpin_lexicographic_precedence_demonstration + test_g5_v1_v2_guardian_audits_agree_on_verdict_for_same_violations). Tier-0/1 inviolable verdict precedence locked at rule-engine floor; Tier-2/3 elastic-slack numerical relaxation deferred to SCP solver Stage A + Stage B per D-050. | Convergence-14 suite |
| G5.5 | Physics-confidence detector (D-024) | Day 6 EOD | Mahalanobis-distance detector flags Pacejka mismatch on injected-incorrect-.tir fixture; Guardian downgrades verdict from SAFE to REVIEW | Guardian audit safety contract |
| G6 | Narrator end-to-end on Sarah fixture + tri-agent critic loop passes (D-018) + COA citations resolve to fixture (no invented FIA Articles per wave-28 closure) | Day 7 | Coaching report + provenance footer renders + Physics-Critic + Pedagogy-Critic + Guardian-Safety all approve; every citation traces to fixture COA JSON | Phase 4 orchestration |
| ~~G6.5~~ | ~~cvxpylayers Windows install fallback gate~~ | ~~Day 4 EOD~~ | **RETIRED per council v2 - pulled forward to Phase 0 task G0.6 (Day 3 hour 2) because the original Day-4 placement could not rescue a Day-3 D-027 blocker (Executor + Contrarian peer catch).** | See G0.6 |
| G7 | LangGraph + MCP + ContextForge runtime end-to-end (D-017 Sync Point 2) + Langflow demo-facade screenshot at 1920x1080 (council v2 - task 4.1 corrected from "Langflow graph export" to LangGraph runtime per D-017) | Day 7 | LangGraph state machine executes ingestion -> RAG -> projection -> Guardian -> instruct -> provenance without breaking; Langflow facade render committed | Day 9 demo + paper §3.5 |
| G8 | Demo loop fits 60s on RTX 4060 (D-019 items 2 + 4 introduce EAGLE-3 speculative decoding + aLoRA hot-swap; coaching-report sub-budget tightens to 15s inside 60s wall-clock) | Day 8 | Latency log committed; 15s generation + 60s total wall-clock both verified | Day 9 video recording |
| **G9** | **Three-track forecasting fusion + 8-tier SCP physics projector convergence (Sync Point 3)** | **Day 9** | **(B, 30, 14) tensor from ensemble flows through 8-tier unrolled SCP without crashing or vanishing gradients; FCVR = 0.00 on Sarah Reynolds canned fixture; v_x near-zero damping + stiff-ODE steady-state substitution per D-014 verified** | **Day 10 dress rehearsal + LIPS evaluation harness** |
| **G10** | **LIPS 4-axis evaluation harness + APEX-Bench release prep (D-026 + Sync Point 4)** | **Day 11** | **All 4 ablation rows populated (zero-shot TTM; soft-loss; APEX hard projection; full 3-track + 8-tier); MLPerf tolerance bands documented per D-023; dockerized harness `eval/Dockerfile` reproduces results on RTX 4060 within published bounds; apex-bench/ repository prepared for public release** | **Day 12 submission** |

**APEX Lite EARLY trigger Q-007** activates if I'm unresponsive at noon ET Day 2 (already cleared, invite accepted). **Q-004 Lite trigger activates on ANY of:** (a) D-027 SCP gate fails AND D-A revision required (D-027 fallback ladder exhausted); (b) Sync Point 1 (Day 1-2 data contract lock) fails; (c) Sync Point 2 (Day 4-6 orchestration end-to-end) fails; (d) Sync Point 3 (Day 7-9 physics projection convergence) fails; (e) Day 9 Gate G9 fails 2+ items. Ship-floor on activation: V1 NumPy validator + frozen TTM + Granite Guardian text audit baseline per D-A wave-25 architecture.

**Council trim (2026-05-22) - SUPERSEDED by wave-30 Maximal Architecture Lock 2026-05-22 night.** Council trim treated G7 as screenshot-only + G8 as stretch + sim-rig backend as killed. Wave-30 overrides this for G7-G10: LangGraph + MCP + ContextForge is the orchestration runtime now (D-017), not a screenshot. G8 latency budget tightens to 15s coaching-report generation via EAGLE-3 speculative decoding + aLoRA hot-swap (D-019). G9 + G10 are new gates for three-track fusion + 8-tier SCP convergence + LIPS / APEX-Bench. Engine-agnostic `PhysicsViolationLog.to_text()` boundary stays mandatory from Day 4. Sim-rig backend stays killed (frontend `SimRigStream` already mocks the WebSocket stream).

---

## Phase-by-phase plan

### Phase 0 - Bootstrap (Day 3, today)

**Goal:** Run the D-027 SCP go/no-go gate (3 unrolled SCP iterations through cvxpylayers with 8-tier Pacejka linearization on RTX 4060). Until D-027 passes, the entire plan is built on an unverified assumption. After D-027: smoke-test the load-bearing models, establish git identity, scaffold contracts.

| # | Task | File | Status |
|---|------|------|--------|
| 0.1 | `git config user.email vinhhle24@gmail.com && git config user.name vinhbin` | local | ⬜ |
| 0.2 | Verify `.git/hooks/` is defaults-only (`*.sample` files only) | local | ⬜ |
| 0.3 | Create Python venv: `cd app/backend && python -m venv .venv` | local | ⬜ |
| 0.4a | **Install torch alone first** with CUDA wheel: `pip install torch --index-url https://download.pytorch.org/whl/cu121` (CUDA wheel resolution is #1 killer; isolate it) | local | ⬜ |
| 0.4b | Then install: `pip install granite-tsfm transformers fastf1 numpy pandas pytest` | local | ⬜ |
| 0.4c | Defer to a second pin run: `pip install cvxpy cvxpylayers` (Windows wants Visual C++ Build Tools; may need `--no-build-isolation`) | local | ⬜ |
| 0.4d | `pip freeze > app/backend/requirements.txt` with hashes pinned | `app/backend/requirements.txt` | ⬜ |
| **0.4e** | **Shapes contract (council v2 fix #1, blocks everything else):** new file `app/backend/apex/shared/contracts/shapes.py` with `TENSOR_SHAPE: Final = (None, 30, 14)`, `SCHEMA_VERSION: Final = "0.1.0"`, and an enumerated 14-channel `CHANNELS` list. **If 14 channels cannot be enumerated in 15 min, shrink to `(None, 30, 9)` (8 telemetry + 1 COA), file D-010 amendment in decision log, proceed.** Tasks 0.9 + 0.10 + 1.9 import from this file; never restate the shape inline. | `app/backend/apex/shared/contracts/shapes.py` | ⬜ |
| **0.4f** | **DifferentiableProjector Protocol (council v2 fix #6, Long-Term Architect):** Protocol class in `shared/contracts/` so V1 NumPy / cvxpylayers / qpth / future Theseus all swap behind one interface. ~30 min Day 3, prevents 6-month load-bearing-wall refactor. | `app/backend/apex/shared/contracts/projector.py` | ⬜ |
| **G-0.5** | **🚨 TTM-r2 hardware-load gate (Day 3 hour 1, blocks D-027):** `from transformers import AutoModel; model = AutoModel.from_pretrained("ibm-granite/granite-timeseries-ttm-r2", trust_remote_code=True)` + emit a fake-input forward producing a `(B, 30, 14)` (or `(B, 30, 9)` per 0.4e) tensor on the RTX 4060. Verifies HF download + VRAM + Windows CUDA toolchain before any QP work. Senior-Eng peer catch: upstream of cvxpy, upstream of SCP. | `logs/day-03-g-0-5-ttm-load.md` | ⬜ |
| **G0.6** | **🚨 cvxpylayers Windows import-smoke (Day 3 hour 2, pulled forward from former G6.5):** `import cvxpy; import cvxpylayers` + run the 10-line cvxpylayers README example end-to-end with `.backward()`. If import fails or example breaks after 90 min debug → switch to WSL2 / Linux container before Stage C. **Decision-locus collapse:** former Day-5 kill-switch row "Day 5 cvxpylayers convergence → walk D-027 ladder" rolls into this gate; only one cvxpy-related fallback decision-point exists. | `logs/day-03-g0-6-cvxpy-import.md` | ⬜ |
| 0.4g | **Sarah Reynolds telemetry stub (council v2 fix #5):** 10-row CSV with fictional-persona watermark in header (`# FICTIONAL PERSONA - see docs/sarah-reynolds-persona.md`); enough for the FCVR=0.00 evaluation in 0.5 Stage C. Full fixture still authored Day 6 task 3.2. | `fixtures/personas/sarah-reynolds-telemetry-stub.csv` | ⬜ |
| **0.5** | **🚨 D-027 SCP go/no-go gate - STAGED per council v2.** Pass G-0.5 + G0.6 first, then run Stage C: 50-line `app/backend/apex/physics/scp_spike.py` with hardcoded `(B, 30, 14)` (or `(B, 30, 9)`) tensor mocking TTM output, **constant-μ friction ellipse only - NOT 8-tier Pacejka**, single SCP iterate, `.backward()`, print gradient norms + FCVR on Sarah stub. 8-tier Pacejka + 3-iteration unroll move to Day 4 task 2.12. **Pass criterion (numeric per Software Lead):** gradient norm finite ∧ `‖∇L‖ < 1e4` ∧ FCVR = 0.00 on Sarah stub. **Fail criterion ("oscillates"):** residual non-decrease over 2 consecutive iterates ∨ `‖∇L‖ ≥ 1e4` ∨ NaN. **Output: one-line pass/fail + log committed.** | `logs/day-03-scp-go-no-go.md` + `app/backend/apex/physics/scp_spike.py` | ⬜ |
| **0.5b** | **D-027 decision branch.** Pass → continue + pre-write Day-4 task 2.12 to swap constant-μ for 8-tier Pacejka. Fail → fallback ladder: (a) drop Day-4 task 2.12 to 2 SCP iterations + trust-region penalty (decision-log D-027 spec); (b) if 2 also oscillates Day 4, escalate to Stephen + D-A revision entry. **Pre-commit de-scope rung 1:** if Stage C fails, cut three-track ensemble (Tracks 2+3 FlowState + Chronos-2) at Day 3 EOD per council v2 chairman ladder - paper still cites TTM r2.1 + SCP as central novelty per wave-30/README.md L23. | `docs/decision-log.md` | ⬜ |
| 0.6 | **Start fastf1 cache download in background hour 1** (first telemetry pull ~500MB, rate-limited; don't block on it Day 8) | `app/backend/.fastf1_cache/` | ⬜ |
| 0.7 | **Gate G1 - TTM smoke test:** load `ibm-granite/granite-timeseries-ttm-r2`, run zero-shot on 5-lap FastF1 export, log load time + inference latency + output tensor shape | `logs/day-03-ttm-smoke.md` | ⬜ |
| 0.8 | **Gate G1b - Granite 4.1 8B Q4 GGUF latency bench** via llama.cpp on RTX 4060 (tokens/sec on 300-word coaching-report prompt) | `logs/day-03-granite-latency.md` | ⬜ |
| 0.9 | **Shared contracts module: single source of truth for inter-layer types (Software Lead fix #2).** Define `PhysicsViolationLog` dataclass + `ViolationRecord` per-step schema + `GuardianAudit` schema (with `audit_id: str` generated via `uuid4()` at `Guardian.audit()` entry, never None per council v2 Software Lead fix). Per-step `simultaneity_flag` channel shape imports `TENSOR_SHAPE` from `shapes.py` (task 0.4e); never restate inline. | `app/backend/apex/shared/contracts.py` | ⬜ |
| 0.10 | **Channel-count audit (Software Lead fix #1, council v2 fix #1).** Resolve canonical channel count in `shapes.py` (task 0.4e): wave-30 D-010 locks `TENSOR_SHAPE = (None, 30, 14)`; if 14 channels cannot be enumerated, shrink to `(None, 30, 9)` (8 telemetry + 1 COA scalar tiled per step) and file D-010 amendment. Document the broadcast/tile adapter from scalar COA flag to per-step channel tensor; the adapter cites `TENSOR_SHAPE` rather than restating the shape literal. | `app/backend/apex/shared/contracts/shapes.py` + PLAN.md §Shared contracts amendment | ⬜ |
| 0.11 | Sketch physics validator function signatures importing from `shared.contracts` (per briefing Step 3) | `app/backend/apex/physics/validator.py` | ⬜ |
| 0.12 | **Observability minimum (SRE-reviewer fix):** structured logging module with `audit_id` + `commit_sha` + `model_versions` baked into every log line. ~2h, saves the demo if something explodes live. | `app/backend/apex/shared/logging.py` | ⬜ |
| 0.13 | Commit `chore(plan): claim Day-3 backend tasks + D-027 SCP gate result` to PLAN.md | PLAN.md | ⬜ |
| 0.14 | Daily pre-mortem entry | `docs/pre-mortem.md` | ⬜ |

**Pass condition for Phase 0:** `shapes.py` + `projector.py` Protocol shipped (tasks 0.4e + 0.4f) + G-0.5 TTM-load + G0.6 cvxpy-import + D-027 Stage C (constant-μ spike) all passed + Sarah stub committed + G1 + G1b both committed with numbers + `contracts.py` shipped + observability module live. If Stage C fails AND fallback ladder exhausted Day 4: text Stephen immediately, write D-A revision entry, pre-committed de-scope rung 1 (three-track cut) executes, await revised architecture before Phase 1.

---

### Phase 1 - Document parsing (Day 3 morning, parallel with Phase 2 start)

**Goal:** Granite-Docling parses FIA COA → JSON. Granite Vision parses timing sheet → CSV. Both are pre-cached at onboarding, not in demo critical path.

> **Path migration 2026-05-24 (wave-44 sweep):** Stephen's wave-42 (`82d1f85`) + wave-44 (`2557d5f`) commits both put parsers at `app/backend/apex/instruct/` (mirrors the Phase 3 narrator + provenance modules already at `instruct/`). The original plan said `intake/` + `vision/`. Migrating Phase 1 task paths from `intake/coa_parser.py` -> `instruct/coa_parser.py` and `vision/timing_parser.py` -> `instruct/timing_sheet_parser.py` to match the de-facto convention. The `intake/cache.py` (Phase 4 task 4.4) stays at `intake/` since caching is intake-domain, not instruction-domain.

> **Phase 1 Stephen-side answers landed at `docs/vinh-phase-1-handoff.md`:** Q1 COA fixture source = synthetic Sarah (shipped at `fixtures/personas/sarah-reynolds-coa-stub.json` commit `82d1f85`); Q2 API path = OpenRouter primary (shipped at `app/frontend/app/api/openrouter-stream/route.ts` commit `89da292`, plus task 1.7 + 1.8 retired on Vinh side); Q3 split = Vinh owns 1.1-1.6 + 1.9 (parsing + simultaneity flag), Stephen owns 1.7 + 1.8 (API plumbing + streaming-response handler).

| # | Task | File | Status |
|---|------|------|--------|
| 1.1 | Granite-Docling 258M parses one fixture FIA COA PDF → structured JSON preserving all 9 adaptation domains + section IDs. **Sarah Reynolds synthetic COA fixture pre-staged at `fixtures/personas/sarah-reynolds-coa-stub.json` per Stephen wave-42 Lane F.A (commit `82d1f85`); `_meta.annotations_for_extraction_pipeline` names `simultaneity_permission_flag` as the root extraction target + the two text-anchor strings for the fallback Granite-Docling text-extraction path.** | `app/backend/apex/instruct/coa_parser.py` | ✅ Day 4 (JSON-first ingestion; Docling PDF rung deferred per `logs/day-04-docling-bench.md`) |
| 1.2 | Granite Vision 4.1 4B parses one fixture SRO timing-sheet PDF → CSV (lap times + sector splits). **Stephen wave-44 (commit `2557d5f`) shipped the frontend route `app/frontend/app/api/timing-sheet-parse/route.ts` with the `TimingSheetParsedLaps` JSON shape locked + the canned-fixture path + the `X-Apex-Parser-Swap-Point: vinh-v1-granite-vision-4.1-4b` header marker. Vinh M3-V1 swaps in real Granite Vision 4.1 4B inference behind the same JSON contract.** | `app/backend/apex/instruct/timing_sheet_parser.py` | ✅ Day 4 (canned-fixture parser shipped; Granite Vision swap-point named `_parse_with_granite_vision`, Phase 2 wire-up) |
| 1.3 | Public FIA COA + SRO timing-sheet fixtures committed | `fixtures/personas/sarah-reynolds-coa-stub.json` ✅ shipped wave-42 (`82d1f85`); `fixtures/timing-sheets/sarah-reynolds-donington-2026-stub.json` ✅ shipped Day 4 (5-lap stub mirrors frontend `CANNED_LAPS`) | ✅ |
| 1.4 | Unit tests for intake + vision parsers (schema fixtures). **Tests live at `tests/test_instruct.py` after path migration; module-level renames acceptable.** | `app/backend/tests/test_instruct.py` | ✅ Day 4 (12 tests on `test_instruct.py` + 7 tests on `test_contracts_adapters.py`, 19/19 passing) |
| 1.5 | **Docling fallback ladder test** - if Granite-Docling fails on multi-column or French legal PDF, document failure mode and fall back: Docling → LlamaParse → Mistral OCR → manual JSON | `logs/day-04-docling-bench.md` | ✅ Day 4 (ladder documented; Phase 1 ships rung-0 JSON path) |
| 1.6 | **Gate G2 - COA parse coverage:** JSON contains all 9 adaptation domains + section IDs. **Sarah fixture covers 4 FIA Appendix L conditional approvals + medical findings + adaptive equipment spec + root simultaneity flag; G2 verifies all 9 domains parse end-to-end.** | `logs/day-04-g2.md` | ✅ PASS Day 4 |
| ~~1.7~~ | ~~OpenRouter API key wired + Granite 4.1 8B free-tier sample call~~ | n/a | ✅ DONE Stephen-side wave-42 commit `7179dc1` (OpenRouter Granite API plumbing) + `89da292` (`/api/openrouter-stream` route) + cold-review fixes `df3109d` + `b87f618`. Vinh consumes via Stephen's frontend route; never touches OpenRouter directly. |
| ~~1.8~~ | ~~watsonx.ai free account stood up as backup~~ | n/a | ✅ DONE Stephen-side wave-42 commit `dc5bd7e` (streaming-response handler). Reframed per handoff Q2 decision: watsonx.ai is bonus track for "Best Use of IBM Tech" judging if Stephen has ≥4h runway pre-submit, not a Vinh-lane stand-up. |
| 1.9 | COA parser detects approved hand-control hardware specs and **derives** simultaneity-permission flag (per Perplexity validation wording). **Output is a scalar bool stored in `CoaParseResult.simultaneity_permitted`. The broadcast adapter in `shared.contracts.build_ttm_input()` is the SINGLE place that tiles this scalar to the per-step simultaneity channel; it imports `TENSOR_SHAPE` from `shapes.py` (task 0.4e) rather than restating the shape literal (council v2 Software Lead + Junior-peer fix - was `(batch, 24, 1)` pre-wave-30, now canonical via `shapes.py`); never duplicated in `forecast.py` or `validator.py` (Software Lead fix #2).** | `app/backend/apex/instruct/coa_parser.py` (new fn `derive_simultaneity_flag`) + `app/backend/apex/shared/contracts/adapters.py` (new fn `build_ttm_input`) | ✅ Day 4 (derivation + tiling adapter shipped; 7 contract tests passing) |

**Pass condition:** G2 green + one COA + one timing sheet parsed end-to-end + fallback ladder documented.

---

### Phase 2 - Physics layer (Days 3-5)

**Goal:** The original contribution. Frozen TTM → physics-projection layer → text violation log. The NeurIPS-paper-worthy code.

**Day 4 status (close-out 2026-05-25):** ✅ G3 PASS (commit `9e114b5`), ✅ task 2.8 TTM wrapper (commit `373a882`), ✅ task 2.9 pipeline (commit `745e4cf`), ✅ task 2.10 FastF1 integration (commit `a157fb6`), ❌ G4 FAIL → fine-tune-first pivot triggered (`logs/day-04-g4.md`). 64 fast + 5 integration tests green.

**Day 5 status (close-out 2026-05-25):** ✅ task 2.12 V2 cvxpylayers projector (commit `cb970ed`), ✅ task 2.13 V2 cut clause NOT invoked (D-050), ✅ task 2.14 Granite Guardian BYOC audit (commit `9048573`), ✅ task 2.15 `render_audit` text helper, ✅ G5 PASS (`logs/day-05-g5.md`). 98 fast + 5 integration tests green. Phase 2 closed; Phase 3 Day 6 (narrator + Sarah end-to-end + Gate G6) unblocked. D-031 Stage A (8-tier Pacejka) + Stage B (3-iteration unrolled SCP) deferred to Day 6+ as quality lifts behind the `DifferentiableProjector` Protocol swap-point per D-050.

#### Day 4 - V1 NumPy validator + violation log (engine-agnostic boundary)

**Council mandate:** `PhysicsViolationLog.to_text()` must be engine-agnostic from Day 4 so V1 NumPy and V2 CvxpyLayer produce identical violation strings. Prevents NeurIPS camera-ready fixture divergence and lets G5 Guardian audits be engine-portable.

| # | Task | File | Status |
|---|------|------|--------|
| 2.1 | `friction_ellipse_check(a_long, a_lat, mu, g)` - constant-μ V1 | `app/backend/apex/physics/validator.py` | ✅ Day 4 (commit `9e114b5`) |
| 2.2 | `forward_euler_consistency(speed, a_long, dt, tolerance_band)` - kinematic V1 **with explicit tolerance band ≥ 1Hz quantization error to prevent false-positives on mid-second braking events (Software Lead fix #7)** | same | ✅ Day 4 (`ToleranceBands.for_1hz_aggregation()` per channel) |
| 2.3 | `bicycle_kinematic_check(lat_g, steering_rad, speed, wheelbase)` - V1 | same | ✅ Day 4 (small-angle V1; CLI smoke on Sarah stub flags expected V1 false-positive rate at race-corner speeds; V2 cvxpylayers + 8-tier Pacejka at Day 5 task 2.12 replaces) |
| 2.4 | `coa_simultaneity_rule(throttle_series, brake_series, simultaneity_channel)` - **takes per-step simultaneity_channel `(T,)` tensor (NOT scalar bool) sourced from same `shared.contracts` adapter that builds TTM input. Single source of truth (Software Lead fix #2).** | same | ✅ Day 4 (per-step tensor consumed; Sarah stub COA-permitted path passes) |
| 2.5 | `PhysicsViolationLog` dataclass imported from `shared.contracts` (NOT redefined here). `.to_text()` serializer is **engine-agnostic - identical output whether violations came from NumPy V1 or CvxpyLayer V2 (Long-Term Architect fix)**. Golden-text fixtures committed alongside. | `app/backend/apex/physics/violation_log.py` + `app/backend/tests/fixtures/violation_log_golden/` | ✅ Day 4 (engine="v1_numpy" emitted; round-trip serializer determinism asserted in test_physics_v1.py) |
| 2.6 | Unit tests: 5 impossible-physics traces (one per violation type) + 5 valid traces | `app/backend/tests/test_physics_v1.py` | ✅ Day 4 (19 tests; 5 impossibilities + 5 valid in fixtures) |
| 2.6b | **Round-trip serializer assertion (Convergence-14 floor, Software Lead fix #4):** every violation type produces deterministic `.to_text()` matching its golden fixture exactly. Re-running with same input twice produces byte-identical output. | `app/backend/tests/test_physics_v1.py` | ✅ Day 4 (3 round-trip assertions; full 14-type Convergence expansion deferred to Phase 4 task 4.2) |
| 2.7 | **Gate G3 - V1 catches 5 impossibilities + approves 5 valid + round-trip serializer assertion passes** | `logs/day-04-g3.md` | ✅ PASS Day 4 commit `9e114b5` |

#### Day 4 - TTM → validator → text log end-to-end

| # | Task | File | Status |
|---|------|------|--------|
| 2.8 | `forecast.py` TTM inference wrapper, 1Hz mini-sector aggregation from 50Hz raw, 30-step context window per wave-30 horizon-expansion D-010 (was 24 pre-wave-30) | `app/backend/apex/ttm/forecast.py` | ✅ Day 4 (commit `373a882`; 15 tests; AggregationConfig with peak/last/mean per-channel rules; TtmForecaster lazy-loaded; FastF1 native rate ~4 Hz derived from `Date` deltas, not the G1 claim of 50 Hz; aggregator dispatches via `source_hz` parameter) |
| 2.9 | End-to-end: telemetry CSV → TTM forecast → NumPy validator → text violation log | integration script | ✅ Day 4 (commit `745e4cf`; `apex.pipelines.telemetry_to_log` module + `python -m` CLI + 11 tests; modes `naive` (G4 baseline + cheap demo) and `ttm` (lazy-loaded heavy)) |
| 2.10 | Integration test on a FastF1 5-lap slice | `app/backend/tests/test_ttm_integration.py` | ✅ Day 4 (commit `a157fb6`; 5 integration-marked tests; skipped by default, enabled with `pytest --integration`; default suite stays 0.5s, integration suite 19.7s on .venv) |
| 2.11 | **Gate G4 - zero-shot TTM vs seasonal-naive MAE bake-off on FastF1 holdouts** | `logs/day-04-g4.md` | ❌ FAIL Day 4 (TTM MAE 35.18 vs naive 18.38 m/s on speed_mps; long_g absent; pivot triggered per L377; bake-off script at `apex.pipelines.g4_mae_bakeoff`; numbers JSON at `logs/day-04-g4-numbers.json`) |

#### Day 5 - CvxpyLayer QP V2 + Guardian wiring

| # | Task | File | Status |
|---|------|------|--------|
| 2.12 | CvxpyLayer QP projection layer V2 (`projection.py`) - projects `(a_long, a_lat)` onto friction-ellipse boundary, differentiable. **Returns `PhysicsViolationLog` imported from `shared.contracts` (NOT a new schema). `.to_text()` output must byte-match V1 NumPy output on identical input - round-trip serializer test from G3 runs against V2 too.** | `app/backend/apex/physics/projection.py` | ✅ Day 5 (commit `cb970ed`; CvxpyLayersProjector satisfies DifferentiableProjector Protocol; 12 tests including byte-equality assertion `test_v1_v2_to_text_byte_equal_modulo_engine_line`; 8-tier Pacejka + 3-iteration unroll deferred to swap-points `projection_pacejka.py` + `projection_scp.py` per D-031 staged ladder) |
| 2.13 | V2 cut decision: if convergence issues by EOD Day 5, ship V1 NumPy as floor. **Per council: D-A still holds because engine-agnostic boundary means V1 and V2 emit identical violation strings - paper §3.2 can still cite QP formulation as the canonical engine while V1 ships in the demo. Escalate to Stephen + decision-log entry if V2 cut.** | go/no-go log entry | ✅ Day 5 - **cut clause NOT invoked**. D-050 records constant-mu V2 ships as Day-5 floor; engine-agnostic byte-equality test locks the load-bearing claim; Stage A + Stage B deferred as quality lifts (not Day-5 blockers). |
| 2.14 | Granite Guardian 4.1 BYOC custom rules audit on text violation log. **`audit()` returns `GuardianAudit` schema (from `shared.contracts`) including `audit_id: str` generated per-call. UI consumes `audit_id` - never None (Software Lead fix #9).** | `app/backend/apex/guardian/audit.py` | ✅ Day 5 (commit `9048573`; Guardian class + BYOCRule dataclass + DEFAULT_RULE_REGISTRY covering 4 V1 violation types + Tier-0 COA gate; GuardianAudit Python schema reconciled with frontend canonical discriminated-union shape per D-032; verdict precedence `reject > flag > approve` per D-022; 13 tests) |
| 2.15 | Guardian text-rendering helper - surface reasoning trace in think-mode for UI | `app/backend/apex/guardian/audit.py` | ✅ Day 5 (`render_audit(audit, mode)` with `think` / `no-think` modes per architecture-spec L440; surfaces verdict header + flagged_concerns + blocked_recommendations + audit_id + optional reasoning_trace; 7 tests) |
| 2.16 | **Gate G5 - Guardian catches same 5 impossibilities as validator** | `app/backend/tests/test_guardian_audit.py` + `logs/day-05-g5.md` | ✅ PASS Day 5 (`logs/day-05-g5.md`; 22 Guardian tests inc. 5-impossibility floor + D-022 hairpin lexicographic precedence stress test + V1/V2 engine-agnostic Guardian-audit-agreement assertion) |

**Pass condition:** G3 + G4 + G5 all green. V1 NumPy validator is the floor; V2 CvxpyLayer is the ceiling.

---

### Phase 3 - Narrator + Sarah Reynolds (Day 6)

**Goal:** Granite 4.1 8B Instruct writes the coaching report. Sarah Reynolds fixture proves the adaptive-driver flow end-to-end.

| # | Task | File | Status |
|---|------|------|--------|
| 3.1 | Granite 4.1 8B Instruct narrator wired - reads forecast envelope + COA + debrief, emits tuning delta with citations (COA section + FIA Article) | `app/backend/apex/instruct/narrator.py` | ⬜ |
| 3.2 | Sarah Reynolds telemetry fixture (synthetic hand-control channels, ~5 laps Donington) | `fixtures/personas/sarah-reynolds-telemetry.csv` | ⬜ |
| 3.3 | Sarah Reynolds COA fixture (approved MME-style electronic hand-control unit) | `fixtures/personas/sarah-reynolds-coa.pdf` + parsed `.json` | ⬜ |
| 3.4 | Sarah Reynolds debrief text fixture | `fixtures/personas/sarah-reynolds-debrief.md` | ⬜ |
| 3.5 | End-to-end: Sarah fixtures → TTM → projection → narrator → Guardian → coaching report JSON | integration | ⬜ |
| 3.6 | Provenance footer assembler - model versions + COA section IDs + Guardian `audit_id` + commit SHA | `app/backend/apex/instruct/provenance.py` | ⬜ |
| 3.6b | **Contract test: `narrator.py` → `provenance.py` (Software Lead fix #9).** Assert provenance footer receives non-None `audit_id` for every coaching report. Run as part of G6. | `app/backend/tests/test_provenance_contract.py` | ⬜ |
| 3.6c | **Citation resolution test (G6 hardening, Software Lead fix #6).** Every FIA Article + COA section ID cited in a coaching report must resolve to a real entry in the fixture COA JSON. Hallucinated citations fail G6. | `app/backend/tests/test_citation_resolution.py` | ⬜ |
| 3.7 | Q&A hostile rehearsal pass 1 with Stephen on Discord | mental | ⬜ |
| 3.8 | **Gate G6 - Sarah end-to-end produces coaching report with provenance footer + audit_id non-None + every citation resolves to fixture COA** | `logs/day-06-g6.md` | ⬜ |

**Pass condition:** Drop Sarah fixtures into the pipeline. Get back a JSON with corners, tuning delta, forecast envelope, Guardian verdict, and provenance footer.

---

### Phase 4 - Orchestration + polish (Days 7-8)

**Goal:** Langflow makes the pipeline visible. Convergence-14 makes the safety story bulletproof. 60s latency budget closed.

#### Day 7 - LangGraph runtime + Langflow facade + Convergence-14 expansion

| # | Task | File | Status |
|---|------|------|--------|
| 4.1 | **LangGraph runtime state machine (council v2 fix #4, wave-30 D-017):** `langgraph_state_machine.py` executes ingestion → RAG → projection → Guardian → instruct → provenance as the orchestration runtime. **Not** Langflow - D-017 demoted Langflow to demo facade. | `app/backend/apex/orchestration/langgraph_state_machine.py` | ⬜ |
| 4.1b | Langflow visual demo facade - screenshot deliverable only (D-017 facade role) | `app/backend/apex/langflow/graph.json` + screenshot | ⬜ |
| 4.2 | **Convergence-14 serializer expansion (extends G3 Day-4 floor, council v2 fix - was dual-listed).** G3 already proved round-trip serializer assertion on 5 violation types Day 4; this task expands fixtures to all 14 kinematic violation types + verified Guardian verdict per type. Not a fresh build. | `app/backend/tests/test_serializer.py` | ⬜ |
| 4.3 | **Gate G7 - LangGraph runtime executes end-to-end + Langflow facade renders at 1920x1080** | screenshot + log in `logs/day-07-g7.md` | ⬜ |
| **4.M3a** | **Stream M.3 endpoint 1: `POST /api/audit-log`** (per `docs/wave-41-backend-spec-handoff.md` L32-89; council v2 addendum from Stephen wave-41 cascade-#11 plan-gap-scanner BLOCKER#2 close-out). JSONL audit-chain persistence with POSIX append atomicity (≤PIPE_BUF byte writes + `fcntl.flock` exclusive lock for >4 KiB lines). `fsync()` per write (~1ms on SSD; acceptable for ≤10 audit/sec Guardian emit rate). Rolling 500-line tail; older lines rotate to `audit-log-YYYY-MM-DD.jsonl.gz`. 8 KiB per-line cap. Status codes 200/400/413/503 per spec. Frontend stub at `app/frontend/lib/guardian-audit-log.ts` swap-point ready. | `app/backend/apex/orchestration/api/audit_log.py` | ⬜ |
| **4.M3b** | **Stream M.3 endpoint 2: `POST /api/what-if-replay`** (per spec L91-150). Deterministic V2 cvxpylayers re-projection over mutated fixtures. Determinism contract: same `(baseline_fixture_id, mutation_key)` MUST produce byte-identical `replayed_violation_log` per `violations.py to_text()` output across calls. Backend MUST use the same frozen-TSFM checkpoint + cvxpylayers projection coefficients as `/api/forecast` (replay is counterfactual over the SAME engine). Status codes 200/400/503. Frontend stub at `app/frontend/lib/what-if-replay.ts` with named mutation `MUTATION_COA_OVERLAP_INVERT`. | `app/backend/apex/orchestration/api/what_if_replay.py` | ⬜ |
| **4.M3c** | **Stream M.3 endpoint 3: `GET /api/session-context`** (per spec L152-192). Race-event telemetry tiles for /judges session-context row. 30s per-track cache for slow-changing fields (track-temp, weather, tire-state); session-phase tile invalidates per-lap on lap-completion event. Returns `tiles: ReadonlyArray<{key, label, value, detail, severity}>` + `fetched_at_iso`. Status codes 200/404/503. Frontend stub at `app/frontend/components/RaceEventsTilesRow.tsx` 4-tile mock fixture. | `app/backend/apex/orchestration/api/session_context.py` | ⬜ |

#### Day 8 - Caching + latency closure

| # | Task | File | Status |
|---|------|------|--------|
| 4.4 | Cache COA + timing-sheet parses at onboarding (per Card 05 latency defense). **Cache invalidation key = SHA256(COA PDF bytes); re-upload of same driver's COA with different bytes invalidates derived simultaneity flag (Software Lead fix #8).** | `app/backend/apex/intake/cache.py` | ⬜ |
| 4.5 | End-to-end latency profile - step-by-step timing on RTX 4060 with cached intake | `logs/day-08-latency-profile.md` | ⬜ |
| 4.6 | **Gate G8 - coaching loop fits 60s on RTX 4060** | same log | ⬜ |
| 4.7 | Q&A hostile rehearsal pass 2 with Stephen | mental | ⬜ |

**Pass condition:** Langflow screenshot + Convergence-14 green + 60s budget proven.

---

### Phase 5 - Demo + deploy (Days 9-10)

**Goal:** HF Space or OpenRouter deploy live. Sim-rig WebSocket backend if time permits. Production video recorded.

#### Day 9 - Deploy

| # | Task | File | Status |
|---|------|------|--------|
| 5.1 | **Deploy decision finalized** (per Perplexity Claim 11): Option 3 = Vercel frontend + OpenRouter `openrouter.ai/ibm-granite/granite-4.1-8b` + watsonx.ai. No HF Space in judge path. | decision log entry | ⬜ |
| 5.2 | Backend API deployed (Modal / Fly.io / Vercel functions - TBD at sync) | `app/backend/Dockerfile` if needed | ⬜ |
| 5.3 | Smoke test the deployed pipeline end-to-end with Sarah fixtures | `logs/day-09-deploy-smoke.md` | ⬜ |
| 5.4 | Colab notebook backup (per Stephen's `deliverables/apex-demo.ipynb` skeleton) - fully runnable end-to-end | `deliverables/apex-demo.ipynb` | ⬜ |
| ~~5.5~~ | ~~Sim-rig WebSocket backend~~ - **KILLED per council trim (2026-05-22).** Frontend `SimRigStream` consumer can mock-stream from a static fixture for Stephen's demo. Cited risk: solo dev + 10 days + Windows + CUDA + cvxpy is already ~18 honest days of work. | n/a | ✂️ |
| 5.5b | **`physics-tsfm` v0.1 TestPyPI tag (partial Expansionist absorb).** If `physics-tsfm/` library carve-out happens per PLAN.md L74, tag v0.1 and push to TestPyPI Day 9. Zero new code - just `pyproject.toml` + `git tag` + `twine upload --repository testpypi`. Citable artifact for NeurIPS paper. | `physics-tsfm/pyproject.toml` + `logs/day-09-pypi.md` | ⬜ |
| **5.5c** | **🚨 Gate G9 - three-track forecasting fusion + 8-tier SCP physics projector convergence (Sync Point 3, council v2 fix - was missing from Phase 5 table):** (B, 30, 14) tensor from ensemble flows through 8-tier unrolled SCP without crashing or vanishing gradients; FCVR = 0.00 on Sarah fixture; v_x near-zero damping + stiff-ODE steady-state substitution per D-014 verified. **If three-track ensemble was cut at Day 3 EOD per pre-committed rung 1, G9 reduces to single-track TTM r2.1 + 8-tier SCP and the paper §4 ablation table drops Tracks 2+3 columns.** | `logs/day-09-g9.md` | ⬜ |

#### Day 10 - Video + dress rehearsal

| # | Task | File | Status |
|---|------|------|--------|
| 5.6 | Full dress rehearsal on RTX 4060 with Stephen - time every step | `logs/day-10-dress.md` | ⬜ |
| 5.7 | Q&A hostile pass 3 - all 5 cards cold, with follow-ups | mental | ⬜ |
| 5.8 | Backend support during Stephen's video record session | live | ⬜ |
| 5.9 | **Q-004 APEX Lite go/no-go** - if 2+ Gate-G9 items fail, ship Lite | decision | ⬜ |

**Pass condition:** Live deploy works. Dress rehearsal under 60s. Video in the can.

---

### Phase 6 - Submission package (Day 11)

**Goal:** Everything submission-grade. Paper draft polished. All external-tool passes complete.

| # | Task | File | Status |
|---|------|------|--------|
| 6.1 | NeurIPS Workshop paper §3.2 final pass - physics projection math + COA wording correction | `paper/apex-neurips-workshop-2026.md` | ⬜ |
| 6.2 | Architecture-spec Layer 3 COA schema - apply "derived flag" wording | `docs/architecture-spec.md` | ⬜ |
| 6.3 | Backend README - install + run + test instructions | `app/backend/README.md` | ⬜ |
| 6.4 | Convergence-14 suite final pass - every violation type covered | `app/backend/tests/test_serializer.py` | ⬜ |
| **6.4b** | **🚨 Gate G10 - LIPS 4-axis evaluation harness + APEX-Bench release prep (Sync Point 4, council v2 fix - was missing from Phase 6 table):** all 4 ablation rows populated (zero-shot TTM; soft-loss; APEX hard projection; full 3-track + 8-tier - or reduced columns if rung 1 fired); MLPerf tolerance bands documented per D-023; dockerized harness `eval/Dockerfile` reproduces results on RTX 4060 within published bounds. **Council v2 + Long-Term Architect: tag APEX-Bench as `v0.0.1-preview` with "not yet stable" README banner; defer public release governance (versioning, deprecation, contributor guidelines) to Day-13+. If D-027 wobbled, paper cites "APEX-Bench v0.0.1-preview, public release forthcoming" instead of a Day-11 public DOI'd release.** | `eval/Dockerfile` + `apex-bench/README.md` + `logs/day-11-g10.md` | ⬜ |
| 6.5 | Cost audit - token spend, API calls, infra cost | `docs/cost-audit.md` | ⬜ |
| 6.6 | Final pre-mortem entry | `docs/pre-mortem.md` | ⬜ |

**Pass condition:** Repo is submission-grade. No TODOs in backend code. All tests green.

---

### Phase 7 - Submit (Day 12)

Stephen-led. My role:
- On standby for backend issues during submission
- Live demo if BeMyApp asks for one
- Retrospective contribution

---

## Files I will create / own

```
app/backend/
├── apex/
│   ├── shared/                    # Phase 0 - single source of truth (Software Lead fix #2)
│   │   ├── contracts/             # canonical (B, 30, 14) + Protocol + violations
│   │   │   ├── shapes.py          # TENSOR_SHAPE + SCHEMA_VERSION + 14 CHANNELS
│   │   │   ├── projector.py       # DifferentiableProjector Protocol seam
│   │   │   └── violations.py      # PhysicsViolationLog + GuardianAudit + audit_id
│   │   └── logging.py             # Structured JSON logging with audit_id + commit_sha + model_versions (SRE fix)
│   ├── intake/
│   │   └── cache.py               # Phase 4 (SHA256 invalidation key); parser modules migrated to instruct/ per wave-44 sweep
│   ├── ttm/
│   │   ├── forecast.py            # Phase 2 Day 4
│   │   └── g1_smoke.py            # Phase 0 task 0.7 ✅
│   ├── physics/
│   │   ├── validator.py           # Phase 2 Day 4 (signatures ✅ Phase 0; bodies Phase 2)
│   │   ├── violation_log.py       # superseded by shared/contracts/violations.py
│   │   ├── projection.py          # Phase 2 Day 5 (V2 - imports from shared.contracts)
│   │   └── scp_spike.py           # Phase 0 task 0.5 ✅ D-027 Stage C PASS spike
│   ├── guardian/
│   │   └── audit.py               # Phase 2 Day 5 (returns audit_id non-None)
│   ├── instruct/                  # parser + narrator + provenance all live here (wave-44 path migration)
│   │   ├── coa_parser.py          # Phase 1 task 1.1 + 1.9
│   │   ├── timing_sheet_parser.py # Phase 1 task 1.2 (was vision/timing_parser.py pre-wave-44)
│   │   ├── narrator.py            # Phase 3
│   │   ├── provenance.py          # Phase 3
│   │   └── g1b_latency_bench.py   # Phase 0 task 0.8 ✅
│   ├── orchestration/
│   │   ├── langgraph_state_machine.py  # Phase 4 task 4.1 (D-017 runtime)
│   │   └── api/                   # FastAPI endpoints (Phase 4 Stream M.3 + Phase 5)
│   │       ├── audit_log.py       # Phase 4 task 4.M3a - POST /api/audit-log
│   │       ├── what_if_replay.py  # Phase 4 task 4.M3b - POST /api/what-if-replay
│   │       ├── session_context.py # Phase 4 task 4.M3c - GET /api/session-context
│   │       ├── coa_upload.py      # Phase 1 - POST /api/coa/upload
│   │       └── forecast.py        # Phase 5 - POST /api/forecast (production critical path)
│   ├── langflow/
│   │   └── graph.json             # Phase 4 Day 7 (screenshot-only facade per D-017 + council)
│   └── ~~sim_rig/~~               # KILLED per council trim 2026-05-22
├── tests/
│   ├── fixtures/
│   │   └── violation_log_golden/  # Phase 2 Day 4 - Convergence-14 round-trip fixtures
│   ├── test_instruct.py           # Phase 1 task 1.4 - coa_parser + timing_sheet_parser
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
└── apex-demo.ipynb                # Phase 5 Day 9 - finish Stephen's skeleton
```

---

## Decision triggers (when to cut features)

| By | If | Cut to |
|----|----|----|
| **Day 3 EOD** | **D-027 SCP gate fails (3-iteration unrolled SCP oscillates or gradient broken through cvxpylayers + 8-tier Pacejka)** | **Walk fallback ladder per D-027: (a) drop to 2 iterations + trust-region penalty; (b) escalate to Stephen + D-A revision entry if 2 also oscillates. Do NOT proceed unilaterally on fallback path.** |
| **Day 4 EOD (G6.5)** | **`cvxpylayers` Windows install fails after 4h debug** | **Switch to M2 / WSL2 / Linux container. Log decision in `logs/day-04-cvxpy-fallback.md`.** |
| Day 3 night | G1 TTM smoke fails on RTX 4060 | APEX Lite - drop TTM, keep Granite Instruct + Guardian on regulatory-only product |
| ~~Day 4~~ **FIRED** | ~~G4 zero-shot TTM does not beat seasonal-naive on defined holdout (laps 4-5, seed=42, channels speed_mps + long_g)~~ → **TRIGGERED Day 4** (`logs/day-04-g4.md`): TTM 35.18 m/s vs naive 18.38 m/s on speed_mps; long_g absent per pre-mortem row 62. | **Pivot in motion:** (1) pitch language correction (drop "zero-shot beats naive" on Cards 03 + 04); (2) Day 5 morning elevates D-010 Track 1 channel-mix decoder fine-tune as parallel track; (3) TTM reframed as forecast-envelope generator (not point-prediction winner); (4) Q-004 APEX Lite NOT triggered (D-A floor + V1 NumPy validator hold; only zero-shot accuracy claim is dropped); (5) Discord 9 PM ET sync escalation tonight. |
| Day 5 | cvxpylayers SCP inner-iterate has convergence issues | Walk D-027 fallback ladder per decision-log (trust-region penalty + Powell ratio acceptance; escalate to D-A revision if rung exhausted). Engine-agnostic `.to_text()` boundary means D-A still holds: SCP-inner-iterate output + V1 NumPy floor emit identical violation strings per paper §3.2 canonical-engine framing. |
| Day 6 | Granite-Docling fails on real COA | Fallback ladder: LlamaParse → Mistral OCR → manual JSON |
| Day 8 | 60s budget blown on RTX 4060 | Wave-30 supersedes council-trim G8-demote: D-019 EAGLE-3 + aLoRA hot-swap tighten coaching-report sub-budget to 15s inside 60s wall-clock. If 60s still blown: pre-record demo, use live UI for Q&A only. |
| Day 9 | 2+ G9 items fail | Q-004 APEX Lite full invocation |

---

## Daily rhythm

- **Morning:** read PLAN.md + new commits from Stephen overnight + check `🟡 NEEDS-INPUT` rows
- **Code blocks:** 90 min focused, atomic commits per logical change
- **9 PM ET:** Discord sync with Stephen - screen share, what works, what's broken
- **Session end:** Claude Memory write per D-005 if 3+ commits or gate completion, + daily pre-mortem entry

---

## What I will NOT do (scope discipline)

- No real-time pit strategy (post-race only - challenge theme is "Beyond the Finish Line")
- No 3D track modeling (constant-μ 2D friction circle for hackathon, full Pacejka is paper work)
- No real-world telemetry partnership (FastF1 + synthetic hand-control channels)
- No mobile app
- No multi-driver comparison
- No frontend code (Stephen's lane - don't cross)
- No pitch deck edits (Stephen's lane - don't cross)
- No git hooks, no Husky, no commit-msg validators
- No em-dash, no AI-tone blocklist words in any doc I write

---

## Things to bring to 9 PM sync (tonight, Day 4 EOD / 2026-05-25)

1. **🚨 Gate G4 FAIL number + pivot ask.** Single most important conversation tonight. TTM zero-shot MAE 35.18 m/s vs seasonal-naive 18.38 m/s on Hamilton Bahrain 2024 Q laps 4-5 holdout speed_mps. Plan L377 fine-tune-first pivot triggered; full log at `logs/day-04-g4.md`. Three pitch-language changes that need Stephen alignment before Card 03 + Card 04 redraft: (a) drop "zero-shot beats naive" pitch claim; (b) reframe TTM as forecast-envelope generator (not point-prediction winner); (c) elevate D-010 Track 1 channel-mix decoder fine-tune to Day 5 morning track. Q-004 APEX Lite NOT triggered; D-A floor + V1 NumPy validator hold; engine-agnostic boundary untouched.
2. **Gate G3 PASS Day 4** (commit `9e114b5`, 19 tests + `logs/day-04-g3.md`). V1 NumPy validator catches 5 impossibilities + approves 5 valid + round-trip serializer assertion (Convergence-14 floor) green. Foundation for Day 5 V2 cvxpylayers projector is solid.
3. **TTM end-to-end shipped Day 4** (tasks 2.8 + 2.9 + 2.10; commits `373a882` + `745e4cf` + `a157fb6`). 53/53 fast tests green + 5 integration tests green on `.venv`. CLI at `apex.pipelines.telemetry_to_log` runs Sarah CSV + COA → forecast → validator → text log end-to-end.
4. **Pre-existing G1 issue surfaced by G4:** FastF1 car_data sample rate is ~4 Hz (median Δt = 240 ms), NOT 50 Hz as G1 claimed. G1 still PASS (forward-pass smoke proved bytes work); G4 derives rate from `Date` deltas correctly. Logged for honesty in `logs/day-04-g4.md`.
5. **COA wording note:** "derived flag, not explicit flag" (for whenever he writes Card 04 or COA pitch language; unchanged from prior plan).
6. **Council trim status:** SUPERSEDED by wave-30 Maximal Architecture Lock (see line 69). G7 promoted to runtime LangGraph + MCP + ContextForge per D-017; G8 sub-budget tightened to 15s via EAGLE-3 + aLoRA per D-019; sim-rig backend stays killed (frontend `SimRigStream` mocks from static fixture).

Everything else stays in lane and ships per this plan.

---

## Provenance: council edits 2026-05-22 (SUPERSEDED by wave-30 Maximal Architecture Lock 2026-05-22 night)

> **Status:** SUPERSEDED. The council session preceded the wave-30 Maximal Architecture Lock. Per D-009 through D-027 + Appendix W30, "stretch" / "demoted" / "future work" labels are RETIRED across the project. The wave-30 gate map at line 47 is the operating source of truth; this section preserves the council-trim history for traceability only. Specifically: G0 (autograd-compatibility spike) is replaced by D-027 SCP go/no-go gate (see line 51); G7 (screenshot-only) is promoted to LangGraph + MCP + ContextForge runtime (D-017); G8 (demoted to stretch) is replaced with a tightened 15s coaching-report sub-budget inside 60s wall-clock via EAGLE-3 + aLoRA (D-019).

This plan was pressure-tested by an llm-council session (TECHNICAL mode, 7 advisors + 5 peer reviewers + chairman synthesis). Full transcript at [council-transcript-20260522-vinh-backend-plan.md](../council-transcript-20260522-vinh-backend-plan.md).

**Council changes applied:**
- **Added Gate G0** (autograd-compatibility spike) as a hard blocker before any feature code. Senior-reviewer's caught blind spot; chairman called it "the single highest-impact finding."
- **Hardened G3** with golden-text round-trip serializer assertion (Convergence-14 floor). Software Lead fix #4.
- **Defined G4 holdout** explicitly (laps 4-5, seed=42, channels speed_mps + long_g, per-channel MAE delta). Software Lead fix #5.
- **Hardened G6** with citation-resolution test (no hallucinated FIA Articles) + provenance contract test (audit_id non-None). Software Lead fixes #6 + #9.
- **Added G6.5** (cvxpylayers Windows install fallback) per Executor.
- **Trimmed G7** to screenshot-only deliverable (SUPERSEDED wave-30: G7 promoted back to LangGraph + MCP + ContextForge runtime per D-017), **demoted G8** (SUPERSEDED wave-30: G8 sub-budget tightened to 15s via EAGLE-3 + aLoRA per D-019), **killed sim-rig WebSocket backend** (task 5.5; still killed in wave-30). Council convergence (Contrarian + Executor + chairman).
- **Added `shared/contracts.py`** as single source of truth for inter-layer types - resolves channel-count off-by-one + scalar-vs-tensor simultaneity duality + violation-log schema drift. Software Lead fixes #1, #2, #3.
- **Engine-agnostic `PhysicsViolationLog.to_text()`** from Day 4 so V1 NumPy and V2 CvxpyLayer emit byte-identical violation strings. Long-Term Architect's load-bearing wall #2. Preserves D-A even if V2 is cut.
- **Added observability minimum** (`shared/logging.py` with audit_id + commit_sha + model_versions). SRE-reviewer fix.
- **Added forward-Euler tolerance band** to prevent 1Hz quantization false-positives. Software Lead fix #7.
- **Cache invalidation key** = SHA256(COA PDF bytes). Software Lead fix #8.
- **Added partial Expansionist absorb:** `physics-tsfm` v0.1 TestPyPI tag Day 9 (zero new code). Rejected: external-person DM, public benchmark leaderboard.
- **Phase 0 install sequence** reordered (torch CUDA alone first, defer cvxpy) per Executor.
- **Phase 0 fastf1 cache download** starts in background hour 1 (500MB rate-limited; SRE SPOF flag).

**Council confidence (SUPERSEDED per wave-30 lock at section header above):** original council framing pinned confidence to the G0 autograd spike pass/fail. Per wave-30 Maximal Architecture Lock + D-027 SCP go/no-go gate retirement of G0, the canonical confidence predicate is now the D-027 SCP convergence result (3-iteration unrolled SCP through cvxpylayers with 8-tier Pacejka linearisation). Everything else in this plan is downstream of D-027.
