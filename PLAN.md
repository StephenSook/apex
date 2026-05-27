# APEX - Plan & Coordination

> Living working doc for **Stephen Sookra** (frontend + pitch + project architect) and **Vinh Le** (backend + ML pipeline + data + AI). Updated on every task status change and pushed to `main`. Authoritative over `docs/architecture-spec.md` when the two disagree.

**Hackathon:** IBM SkillsBuild AI Builders Challenge, May Challenge ("AI Beyond the Finish Line")
**Submission deadline:** 2026-05-31, 11:59 PM ET
**Repo:** https://github.com/StephenSook/apex
**Strategy:** Galaxy-tier scope. Playing for Grand Prize ($5K across May+June) AND 1st Place + Most Innovative + Best Use of Technology. No item is "post-hackathon" or "stretch." Conservative core ships first (Phases 0-3, Days 1-6), enhancement layers stack on top (Phases 4-6, Days 7-11), each layer independently cuttable if it threatens the Day 12 submit.

---

## Wave-46 Vinh task table (NEW 2026-05-26 morning, session A close-out)

**Wave-46 mega-arc plan** at `~/.claude/plans/all-right-i-want-rippling-moon.md` (Claude-side; Vinh references this table for backend lane scope). 10 phases; ~98 atomic commits Vinh + Stephen combined. Session A shipped Stephen-side Phase 1+2+3+4 (15 commits). Vinh tasks below; each is independently shippable + each frontend stub is wire-flip-ready behind `NEXT_PUBLIC_USE_REAL_*` env flags (default false / canned-fallback at HEAD).

| Phase | Module | Vinh path | Status | Frontend wire-flip flag | Stephen-side stub |
|-------|--------|-----------|--------|--------------------------|--------------------|
| 2.1 V12 | Stage A 8-tier Pacejka linearization | `app/backend/apex/physics/projection_pacejka.py` satisfying DifferentiableProjector Protocol | NOT STARTED | `NEXT_PUBLIC_USE_REAL_BACKEND_V12` | `/api/projector-stage-a` shipped wave-46 `f642b35` |
| 2.2 V13 | Stage B 3-iteration SCP outer loop | `app/backend/apex/physics/projection_scp.py` wrapping Stage A | NOT STARTED | `NEXT_PUBLIC_USE_REAL_BACKEND_V13` | `/api/projector-stage-b` shipped wave-46 `f642b35` |
| 3.1 V14 | LangGraph + MCP + ContextForge runtime | `app/backend/apex/orchestration/langgraph_runtime.py` | NOT STARTED | `NEXT_PUBLIC_USE_REAL_BACKEND_V14` | `/api/orchestration` shipped wave-46 `63db753`; also feeds `/api/judges/coa-diff` |
| 3.2 V15 | LIPS 4-axis evaluation harness + APEX-Bench release | `eval/Dockerfile` + `apex-bench/` | NOT STARTED | `NEXT_PUBLIC_USE_REAL_BACKEND_V15` | `/api/lips-harness` shipped wave-46 `63db753` |
| 4.1+4.2 V1 | Granite Vision 4.1 4B real timing-sheet PDF + Granite-Docling 258M | `app/backend/apex/instruct/timing_sheet_parser.py` `_parse_with_granite_vision` | NOT STARTED | `NEXT_PUBLIC_USE_REAL_TIMING_SHEET` | `/api/timing-sheet-parse` wave-46 `cdc8906` multipart POST forward |
| 4.3 V10 | Granite FlowState r1.1 18.5M Track 2 wire | `app/backend/apex/ttm/flowstate.py` (or integrated into existing TTM pipeline) | NOT STARTED | `NEXT_PUBLIC_USE_REAL_FLOWSTATE` (env flag exists; no route stub needed; ThreeTrackForecastChart consumes /api/forecast) | Vinh extends `/api/forecast` to surface flowstate track when wired |
| 4.4 V7 | IBM TSPulse 1M polyphase anomaly detector | `app/backend/apex/tspulse/anomaly.py` | NOT STARTED | `NEXT_PUBLIC_USE_REAL_TSPULSE` | `/api/tspulse/anomaly` shipped wave-46 `0181fc4` |
| 4.5 V8 | Granite Embedding R2 RAG cosine-similarity backend | `app/backend/apex/embedding/rag_retrieve.py` | NOT STARTED | `NEXT_PUBLIC_USE_REAL_RAG` | `/api/rag-retrieve` shipped wave-46 `5bfa215` |
| 4.6 | Granite Guardian 4.1 custom-rule expansion (TIER ladder for new Stage A/B violations) | `app/backend/apex/guardian/audit.py` | partial (BYOC live; new rules pending) | n/a (Guardian already WIRED via /api/openrouter-stream) | already shipped |
| 4.7 V3 | Granite TTM r2.1 D-010 Track 1 channel-mix decoder fine-tune EXECUTION | `app/backend/apex/ttm/forecast.py` channel-mix fine-tune + run on RTX 3060 Ti per `logs/day-04-g4.md` pivot trigger | NOT STARTED | n/a (TTM consumes via /api/forecast) | ThreeTrackForecastChart Track 1 badge already wired to label "Vinh M3-V3 backend"; flips MOCK -> WIRED on Vinh deploy |
| 4.7-extra V11 | Amazon Chronos-2 Track 3 baseline (21-quantile probabilistic forecaster per D-010 three-track ensemble) | `app/backend/apex/ttm/chronos2.py` (or external Chronos-2 HF model serve) | NOT STARTED | n/a (consumed via /api/forecast Track 3 channel) | ThreeTrackForecastChart Track 3 badge wired to "Vinh M3-V11 backend"; flips MOCK -> WIRED on Vinh deploy |
| extra V2 | Sim-rig real WebSocket telemetry source (live driver-rig stream) | `app/backend/apex/sim_rig/ws_server.py` (or any WS endpoint surfaced at deployed sim-rig URL) | NOT STARTED | n/a (SimRigStream auto-switches to `mode="live"` when `websocketUrl` prop is non-empty) | /sim-rig page currently uses httpStream simulated mode; flip to live mode by passing `websocketUrl="wss://<vinh-deploy>/ws/sim-rig"` once Vinh ships |
| extra Tri-agent | D-018 Mellea Instruct-Validate-Repair tri-agent critic orchestrator (NOT same as Phase 5.2 Mellea-on-narrator; separate critic-loop pass over recommendations) | `app/backend/apex/critics/orchestrator.py` + `app/backend/apex/physics/confidence.py` | NOT STARTED | n/a (server-side internal; surfaced via TriAgentCriticPanel data hook) | TriAgentCriticPanel already wires `useTriAgentCriticVerdict` hook to /api/critics/verdict (canned-fallback at HEAD); flips MOCK -> real verdicts on Vinh deploy |
| extra GEPA | D-019 #3 GEPA reflective prompt evolution (shouldn't-be-possible move) writes optimized prompt artifacts | `app/backend/apex/prompts/optimized/` artifact-write + Mellea `req()`-driven evolution loop | NOT STARTED | n/a (server-side internal; surfaced via GEPAEvolutionPanel data hook) | GEPAEvolutionPanel already wires panel with canned-fallback; flips MOCK -> real optimized-prompt evolution log on Vinh deploy |
| 5.1 | Mellea install | `pyproject.toml` add `mellea>=0.5.0` | NOT STARTED | n/a (server-only) | n/a |
| 5.2 | Mellea Instruct-Validate-Repair tri-agent on narrator | `app/backend/apex/instruct/narrator.py` Mellea-orchestrated + `app/backend/apex/instruct/requirements.py` validators (FIA Article registry + COA section + citation + conditional phrasing) | NOT STARTED | `MELLEA_IVR_ENABLED` (server-only flag) | n/a |
| 5.3 | Granite 4.1 8B Instruct narrator real wire | `app/backend/apex/instruct/narrator.py` via WatsonX or OpenRouter | partial (OpenRouter Granite 4.1 8B via /api/openrouter-stream) | n/a | already shipped |
| 5.4 V9 | Watson STT backend proxy via Granite Speech 4.1 2B-Plus | `app/backend/apex/speech/stt_proxy.py` via vLLM serve `ibm-granite/granite-speech-4.1-2b-plus` | NOT STARTED | `NEXT_PUBLIC_USE_GRANITE_SPEECH` | Stephen ships `/api/stt` stub + VoiceDebriefInput env-flag flip in Phase 5 (next session) |
| 5.5 | Watson TTS polish (streaming chunking + per-driver voice profile placeholder) | `app/backend/apex/speech/tts.py` (existing Vercel TTS wire) | partial (production path operational per wave-43 close-out) | n/a (Watson TTS already WIRED) | already shipped |
| 6.1 | Granite 4.1 3B Instruct fast-path AICopilotChat routing | `app/backend/apex/instruct/chat_router.py` (intent classifier 3B-vs-8B) | NOT STARTED | `NEXT_PUBLIC_USE_GRANITE_3B_ROUTING` | Stephen ships AICopilotChat env-flag flip in Phase 6 (next session) |
| 6.2 | Granite 4.1 8B Instruct for /coach-code feature | `app/backend/apex/coach_code/handler.py` (text-only feedback; HARD-COMPLIANCE scrubber server-side) | NOT STARTED | n/a (server-side LLM route) | Stephen ships NEW `/coach-code` page + `/api/coach-code` route in Phase 6 |
| 6.4 | DocTags pass-through (D-023 timing-sheet metadata through orchestration) | `app/backend/apex/instruct/timing_sheet_parser.py` extend to pipe DocTags forward | NOT STARTED | n/a (server-side internal) | n/a |
| 7.2 | Tire degradation predictor (TTM-based) | `app/backend/apex/tire_degradation/predictor.py` consuming TTM r2.1 forecast | NOT STARTED | n/a (server-side internal; consumed via /api/tire-degradation) | Stephen ships NEW `/api/tire-degradation` + `TireDegradationPanel` in Phase 7 |
| 7.3 | Pre-race weather brief NOAA / Met Office API | `app/backend/apex/weather/brief.py` consuming free public APIs | NOT STARTED | n/a (server-side internal; consumed via /api/weather-brief) | Stephen ships NEW `/api/weather-brief` + `WeatherBriefCard` in Phase 7 |
| 9 | Per-agent fix-wave (deep-review batch findings; cascade-#41+) | per-finding | TBD | n/a | concurrent with Phase 9 |
| 9.OV-2+4 | OVERRIDE-steal #2+#4 (2026-05-26 day 8 competitor deep-dive): populate the new optional `reasoning_chain: ReadonlyArray<ReasoningChainStep>` field on every `CornerInsight` returned by the real coaching pipeline. 4 steps per recommendation in OVERRIDE's session-debrief register: `cause` (what physics caused the issue) → `consequences` (what happens if untreated) → `recommendation` (already populated) → `evidence` (citation + telemetry references). Frontend renders as native `<details>` expander when present; backwards-compat preserved (optional field) so partial population is safe. | `app/backend/apex/instruct/narrator.py` (or wherever CoachingReport is assembled) extend to attach the chain | NOT STARTED | n/a (server-side; consumed via /api/analyze CoachingReport) | shipped `app/shared/types.ts` ReasoningChainStep + CoachingReport.tsx CornerCard expander wave-46 `d223f1b`; lifted from OVERRIDE `core/pipeline.py:118-132` per `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_override_competitor.md` steal-list items #2 + #4 |
| 9.OV-1 | OVERRIDE-steal #1 backend-side pattern transfer (2026-05-26 day 8): if Vinh ships any real LLM backend route (narrator, critic, coach-code-real proxy, RAG-Q&A), apply Self-Correcting Retry Loop on Pass-1 deterministic validator OR Pass-2 Granite Guardian failure → feed back as `# Retry directive` system message + regenerate. Bounded budget of 2 retries (3 LLM calls worst case). Surface retry-count + per-attempt violation summary on response payload for honest self-correction telemetry. | per-route on the Vinh backend (narrator + critic + any new LLM consumer) | NOT STARTED | n/a (server-side internal) | shipped HEAD-wired version on `/api/coach-code` wave-46 `8c3e481`; pattern lifted from OVERRIDE `core/pipeline.py:118-132` retry-directive loop per memory |
| 9.OV-QB | OVERRIDE production-grade quality bar audit (2026-05-26 day 8): OVERRIDE ships Pydantic v2 transit objects + OpenTelemetry span tracing for every LLM call + 14 test files covering safety-critical paths + 4-service docker-compose (FastAPI + Langflow + TTM HTTP bridge + TORCS). If Vinh has bandwidth before submission Sunday May 31 23:59 ET, an audit pass to match this bar would defend the 14-tool honesty-tier claim against the OVERRIDE 10-tool fully-WIRED bar. | per-module `app/backend/apex/**/*.py` audit | NOT STARTED | n/a (server-side) | none |
| 10 | Final close-out coordination + Vinh smoke tests on all V1-V15 swap-points | per-route | TBD | n/a | Phase 10 hackathon-pre-deploy gate |

**Vinh action items priority order (highest judges-impact first):**
1. V14 LangGraph runtime (`apex/orchestration/langgraph_runtime.py`): enables RealtimeCOADiffPanel + LangGraphRuntimePanel real verdicts on /judges, flips Langflow FACADE to LangGraph INTEGRATION-LANGGRAPH per D-054
2. V12 Pacejka + V13 SCP (Phase 2 physics layer ascent per D-031 staged ladder): enables PacejkaStageAPanel + SCPStageBPanel real residuals
3. V1 Granite Vision real timing-sheet PDF inference: Granite-Docling 258M cascade for judge-uploadable COA
4. V7 TSPulse polyphase anomaly endpoint: flips MOCK_TSPULSE_ACTIVE to real-time band detections
5. V8 Granite Embedding R2 cosine-similarity RAG: flips AICopilotChat from lexical TF-IDF to real Granite embeddings
6. V3 TTM r2.1 D-010 Track 1 channel-mix decoder fine-tune EXECUTION: flips ThreeTrackForecastChart Track 1 MOCK to WIRED, addresses G4 zero-shot FAIL pivot (per `logs/day-04-g4.md` + `feedback_g4_fail_pivot_documented_then_executed.md`)
7. V10 FlowState Track 2 wire: flips ThreeTrackForecastChart MOCK badge to real continuous-time SSM
8. V11 Chronos-2 Track 3 baseline: flips ThreeTrackForecastChart Track 3 MOCK badge to real probabilistic 21-quantile baseline, completes the D-010 three-track ensemble
9. Mellea IVR loop on narrator (Phase 5.2): flips coaching report from single-pass to validated-and-repaired
10. D-018 Mellea tri-agent critic orchestrator (`apex/critics/orchestrator.py` + `apex/physics/confidence.py`): flips TriAgentCriticPanel from canned-fallback to real critic verdicts
11. V9 Watson STT via Granite Speech 4.1 2B-Plus: replaces Web Speech API HEAD on VoiceDebriefInput
12. V2 sim-rig WebSocket live telemetry source: flips /sim-rig from httpStream simulated mode to live mode
13. D-010 Stage A/B real linearization (Vinh V12 + V13 ship the physics; D-010 Track 1 fine-tune feeds into V12/V13 staged ladder)
14. D-019 #3 GEPA reflective prompt evolution + optimized-prompt artifact writes: flips GEPAEvolutionPanel from canned-fallback to real evolution log
15. V15 LIPS harness + APEX-Bench public release (Day 11 ship)

**Vinh deploy convention:** every backend module ships with the SAME response shape the corresponding frontend stub returns. The frontend wire-flip is then a single `NEXT_PUBLIC_USE_REAL_<KEY>=1` flag in Vercel (plus `NEXT_PUBLIC_VINH_BACKEND_BASE_URL=https://<vinh-deploy>`). All routes fall back to canned-fallback on any fetch failure (network + 5xx + parse error), so a partial Vinh deploy never cascades 502s across /judges + /lips-harness panels.

---

## Status snapshot (last sync 2026-05-26 Day 8 wave-46 session A close-out)

Wave-46 session A shipped 15 atomic commits Phase 1+2+3+4 frontend scope. HEAD CI green at `3ece1d0`. Production smoke 6/6 wave-46 routes 200 (`/api/projector-stage-a` + `/api/projector-stage-b` + `/api/orchestration` + `/api/lips-harness` + `/api/judges/coa-diff` + `/api/tspulse/anomaly`; RAG POST verified). 2 cascades closed (#39 vinh-swap-points test 4-keys -> 6-keys + #40 RAG route corpus-matching query).

**Wave-46 Stephen-side phase status (session A):** Phase 1 ✅ + Phase 2 ✅ + Phase 3 ✅ + Phase 4 ✅ (partial: 4.1/4.2/4.4/4.5/4.8 shipped; 4.3/4.6/4.7 Vinh-side deferred). Phase 5-10 queued for subsequent sessions.

---

## Status snapshot (last sync 2026-05-24 Day 6 wave-43 close-out)

This snapshot is the at-a-glance reality check for anyone reading PLAN.md fresh.

**Wave-43 close-out Day 6 EOD:** 79 atomic commits shipped across 12 lanes (A2 5/5 done + B2 3/3 done + D2 12/12 done + E2 3/3 done + G2.1 1/1 done + G2.2 D-041 + G2.3 D-042 + G2.4 AI-tone sweep + G2.5 README+paper drop HF Space refs + G2.6 apex-one-black.vercel.app deploy LIVE + C2 9-of-13 vitest specs + cascade-#13 inline 2-commit close + cascade-#14 inline 1-commit close + cascade-#15 5-commit F2-round-2 codex BLOCKER+HIGH+MED batch + cascade-#16 3-commit Watson route hardening + cascade-#17 safeParseAuditId fallback + cascade-#18 inline AuditId validator Turbopack cross-tree + cascade-#19 comment-analyzer BLOCKER batch + cascade-#20 HARD-COMPLIANCE system prompt + cascade-#21 HARD-COMPLIANCE server-side regex scrubber + 6-agent code review BLOCKER+HIGH closure batch + Lane K persona-decoupling per Sookra Methodology Pillar 4 + Lane H2 Obsidian session note + APEX MOC pointer + project memory + MEMORY.md refresh + wave-30 amendment + 3 new memory rules locked + Vercel deploy verified). Canonical count per `git log --oneline b380710 --grep="wave-43\|cascade-#1[3-9]\|cascade-#2[0-1]\|Lane K\|cold-review-2"`. Remaining queue: video record (operator-action) + Playwright fidelity specs (no Playwright dep) + remaining 4 C2 vitest files (medium-risk component integration).

**Wave totals across the 12-day arc:** wave-22 through wave-43 inclusive. Wave-41 33 commits + wave-42 24 commits + wave-43 79 commits (canonical per decision-log D-047) = 136 commits across the wave-41/42/43 arc alone. HEAD CI GREEN; cascade #11 + #12 + #13 + #14 + #15 + #16 + #17 + #18 + #19 + #20 + #21 all closed.

**Phase 0 - Bootstrap:** ✅ DONE Day 3 (2026-05-23) per wave-40 Vinh 17-commit Phase 0 close-out. D-027 Stage C PASS at ‖∇L‖ = 24.12 + FCVR = 0 on RTX 3060 Ti per council v2 staged spec (constant-mu friction ellipse + single SCP iterate; 8-tier Pacejka + 3-iteration unroll deferred to Phase 2 Day 4 task 2.12 per D-031). G.1 GREEN BRANCH applies per D-030.
Row IDs below match the Phase 0 build table further down (rows 0.1 through 0.19); this snapshot just collapses the table to the load-bearing items. M11 wave-24 closure: D-prefix dropped so status + table share one ID scheme.
- 0.1 Lock APEX name (rename from PIT WALL): ✅ DONE
- 0.2 Init GitHub monorepo: ✅ DONE (https://github.com/StephenSook/apex live)
- 0.3 Invite Vinh as collaborator: ✅ DONE
- 0.9 Obsidian APEX MOC + 7 child notes + Home.md update: ✅ DONE
- 0.8 Project memory folder + 15 seed files: ✅ DONE
- 0.6 Reorganize `Desktop/IBM May/` per §Repo layout: ✅ DONE
- 0.4 Hand Vinh the briefing PDF + repo URL: ✅ DONE
- 0.11 Vinh git identity: ✅ DONE (commit cluster on Day 3 attributed to `vinhbin <vinhhle24@gmail.com>`)
- 0.12 Vinh accept invite + clone: ✅ DONE (17 commits pushed Day 3)
- 0.13 Vinh TTM smoke test (Gate G1): ✅ DONE (commit `856a002`; warm inference 10.5ms on RTX 3060 Ti; log at `logs/day-03-g1-ttm-smoke.md`)
- 0.13a 🚨 D-027 SCP go/no-go gate: ✅ **PASS Stage C** (commit `c97caaa`; ‖∇L‖ = 24.12, FCVR = 0.00, ~1s e2e on RTX 3060 Ti; constant-mu single-iterate spike per council v2 staged rewrite; 8-tier Pacejka + 3-iteration unroll deferred to Phase 2 Day 4 task 2.12 per D-031). Pre-committed three-track de-scope rung 1 did NOT fire. G.1 GREEN BRANCH applies per D-030.
- **Council v2 amendment additions (Phase 0 task 0.4e-0.4g, 0.9, 0.11, 0.12 not in original enumeration):** `shapes.py` canonical (B, 30, 14) source (commit `771c0bc`); DifferentiableProjector Protocol seam (commit `d47151c`); Sarah Reynolds 10-row telemetry stub with fictional-persona watermark (commit `16a525a`); PhysicsViolationLog + GuardianAudit schemas with `audit_id` discipline (commit `d1dc3fa`); V1 NumPy validator signatures + ToleranceBands (commit `21c788f`); structured JSON logging with audit_id correlation (commit `24a805c`); Day 3 pre-mortem rows 64-68 (commit `c69753d`).
- **G-0.5 TTM-r2 hardware-load gate** (pulled-forward council v2 pre-D-027 check): ✅ PASS (commit `9927b06`; loads 0.74s, 12 MiB VRAM, (2, 30, 14) on RTX 3060 Ti; log at `logs/day-03-g-0-5-ttm-load.md`).
- **G0.6 cvxpylayers Windows import smoke** (replaces former Day-4 G6.5 per council v2): ✅ PASS (commit `310dd67`; clean install, no VC++ tools; log at `logs/day-03-g0-6-cvxpy-import.md`).
- **G1b Granite 4.1 8B Q4_K_M latency bench:** ✅ baseline measured (commit `b61c629`; 7.1 tok/s, 200-token report 28s; local llama.cpp misses 15s sub-budget by 2x; demo path is OpenRouter per D-019/5.1; EAGLE-3 + aLoRA elevated from "optimization" to "required for offline fallback"; log at `logs/day-03-g1b-granite-latency.md`).
- Asset prefetches Day 3: FastF1 cache (Bahrain 2024 Q, 267 laps, 45.7 MiB); TTM r2; Granite 4.1 8B Q4_K_M (4.98 GiB); Granite-Docling 258M (505 MiB; Phase 1 task 1.1 input ready).

**Phase 1 - Document parsing (Day 4, Vinh):** ✅ **Vinh-lane PASS Day 4** (commit `e9c9d11`; Gate G2 PASS at `logs/day-04-g2.md`). Shipped: `app/backend/apex/instruct/coa_parser.py` (JSON-first ingestion + `derive_simultaneity_flag` from approved hardware specs + medical findings per D-022 + Perplexity 2026-05-21 wording, NOT explicit FIA Article); `app/backend/apex/instruct/timing_sheet_parser.py` (canned-fixture parser mirroring frontend `TimingSheetParsedLaps` contract; Granite Vision 4.1 4B swap-point named `_parse_with_granite_vision` for Phase 2 wire-up); `app/backend/apex/shared/contracts/adapters.py` `build_ttm_input()` (single source of truth that tiles scalar COA simultaneity flag across per-step `coa_overlap_flag` channel per Software Lead fix #2); `fixtures/timing-sheets/sarah-reynolds-donington-2026-stub.json` (byte-mirrors frontend `CANNED_LAPS`); 19/19 tests green at `tests/test_instruct.py` (12) + `tests/test_contracts_adapters.py` (7) + `tests/conftest.py`. Stephen task 1.7 OpenRouter Granite API plumbing (wave-42 commit 7179dc1) + 1.8 streaming-response handler (wave-42 commit dc5bd7e) shipped. Granite-Docling 258M PDF rung deferred to Phase 2 per `logs/day-04-docling-bench.md` (rung-0 JSON-first ships now; Docling install + bench is Phase 2 / Phase 3 punch-list). Stream M.3 spec handoff at docs/wave-41-backend-spec-handoff.md.

**Phase 2 - Physics layer (Days 3-5, Vinh):** ✅ **CLOSED Day 5** (2026-05-25). G3 PASS (`9e114b5`) + tasks 2.8-2.10 shipped (`373a882` + `745e4cf` + `a157fb6`) + G4 FAIL with fine-tune-first pivot triggered (`2fddea4` + `logs/day-04-g4.md`) + V2 cvxpylayers projector shipped (`cb970ed`) + Guardian BYOC audit + D-050 V2 cut clause NOT invoked (`9048573`) + G5 PASS (`logs/day-05-g5.md`). 98 fast + 5 integration = 103 backend tests green. D-031 Stage A (8-tier Pacejka) + Stage B (3-iteration unrolled SCP) deferred to Day 6+ as quality lifts behind the `DifferentiableProjector` Protocol swap-point per D-050. Vinh Phase 0 contracts shipped (shapes.py + violations.py + projector.py + logging.py + validator.py + scp_spike.py). **Day 4 close-out:** Gate G3 PASS (commit `9e114b5`; 19 tests in `tests/test_physics_v1.py` + log at `logs/day-04-g3.md`); task 2.8 TTM forecast wrapper + 1Hz aggregator shipped (commit `373a882`; 15 tests in `tests/test_ttm_forecast.py`); task 2.9 telemetry -> forecast -> validator pipeline shipped (commit `745e4cf`; 11 tests in `tests/test_pipeline_telemetry_to_log.py` + working CLI at `apex.pipelines.telemetry_to_log`); task 2.10 FastF1 5-lap integration test shipped (commit `a157fb6`; 5 integration-marked tests in `tests/test_ttm_integration.py`, run with `pytest --integration`). Test posture: 64 fast + 5 integration = 69 green on `.venv`. **Gate G4 FAIL** (task 2.11; `logs/day-04-g4.md`): zero-shot TTM-r2 MAE 35.18 m/s vs seasonal-naive 18.38 m/s on Hamilton Bahrain 2024 Q laps 4-5 holdout speed_mps. Plan L377 fine-tune-first pivot triggered: drop zero-shot pitch claim, elevate D-010 Track 1 channel-mix decoder fine-tune, reframe TTM as forecast-envelope generator (not point-prediction winner). Escalation due at 9 PM ET Discord sync. G3 + 2.8 + 2.9 + 2.10 unaffected by G4; engine-agnostic boundary holds. CoachingReport + GuardianAudit + TuningCard + frontend wire-boundary decoder (api-decode.ts) shipped against canonical Backend* schemas. Phase 2 Day 5 (V2 cvxpylayers projector task 2.12 + Granite Guardian audit + Gate G5) is the next ship.

**Phase 3 - Narrator (Day 6, both):** ✅ **CLOSED Day 6** (2026-05-27). Stephen-side frontend + OpenRouter wire shipped wave-42 (persona narrative + COA fixture stub `82d1f85` + OpenRouter Granite plumbing F.C + F.D + AICopilotChat F.4 + /api/openrouter-stream `89da297`). **Vinh-side backend Phase 3 complete:** `apex/instruct/narrator.py` (schema-correct CoachingReport assembler + 9.OV-1 retry loop + 9.OV-2+4 reasoning_chain) + `apex/instruct/sarah_synth.py` (deterministic 5-lap Donington telemetry generator, seed=42) + `fixtures/personas/sarah-reynolds-debrief.md` + `apex/pipelines/sarah_e2e.py` (end-to-end pipeline) + 24 new tests (13 narrator + 11 sarah_e2e) all green. Gate G6 PASS at `logs/day-06-g6.md`. 122 fast + 5 integration backend tests green.

**Phase 4 - Orchestration + polish (Days 7-8, both):** ✅ **Vinh-lane CLOSED Day 7** (2026-05-27). Backend modules + tests: `apex/orchestration/langgraph_runtime.py` (M3-V14 swap-point, 6-node deterministic state machine) + `apex/orchestration/audit_log.py` (POSIX flock + 500-line tail + 8KiB cap) + `apex/orchestration/what_if_replay.py` (singleton V2 projector, byte-deterministic replay) + `apex/orchestration/session_context.py` (30s TTL cache + lap-completion invalidation) + `apex/intake/cache.py` (SHA256-keyed disk-backed cache per Software Lead fix #8) + Convergence-14 expansion to all 14 violation types at `tests/test_serializer.py`. 51 new backend tests; G7 PASS + G8 PASS (23.3 ms hot-path, less than 0.2% of 15s coaching-report sub-budget). Stephen-lane Phase 4 surfaces (5-tab AnalyzeFlow restructure wave-42 1c95ab5, 5 shouldn't-be-possible-moves frontend surfaces, Recharts triple-panel, Granite citation footer, Watson TTS walkie-talkie, race-event tiles, what-if-replay frontend stubs) all shipped earlier. Cascade #12 6-agent cold review dispatched wave-42 + 5 BLOCKERs closed inline.

**Phase 5 - Demo + deploy (Days 9-10, both):** ✅ Vercel apex-one-black.vercel.app production deploy LIVE per D-046 cascade-#15 + cascade-#18 close-out (verified 2026-05-24 ~19:25 ET; all 4 routes return 200; Granite 4.1 8B routing confirmed end-to-end via 5 OpenRouter env vars; Watson TTS production path operational via bundled ffmpeg-static + inline streaming response). Colab walkthrough at deliverables/apex-demo.ipynb. /judges + /analyze + /status + /sim-rig all live. 3-min demo video script + 11-frame deck PDF (1.4MB) + 30-second highlight clip storyboard shipped wave-43 Lane C2. Production video record Day 10-11 operator-action. **Vinh-lane Phase 5 backend complete Day 9 (2026-05-27):** FastAPI `apex/server.py` + `Dockerfile` slim-base + healthcheck + 4 routes (audit-log + what-if-replay + session-context + analyze) ship-ready behind 12 server tests. G9 PASS on reduced columns at `logs/day-09-g9.md` (single-track TTM + V2 cvxpylayers constant-mu; Stage A + B + FlowState + Chronos-2 deferred per D-052 + D-050). physics-tsfm v0.1.0a1 carve-out shipped (`physics-tsfm/pyproject.toml` + 6 tests); TestPyPI upload operator-action gated.

**Phase 6 - Submission package (Day 11, both):** 🟡 mid-flight. /judges + /status routes ✅. methodology.md + paper §3.1-§3.7 substantive (wave-42 §3.5 5-moves + §3.6 council v2 + §3.7 telemetry shipped). pre-mortem.md 40+ entries. NeurIPS paper §3 wave-42 expansion shipped. BeMyApp submission payload + multi-track checklist + decision-log D-001 through D-040 shipped. External-tool final passes Day 11 (Lane G2.5 + G2.6).

**Phase 7 - Submit (Day 12, both):** ⬜ pending. Multi-track BeMyApp form submit + IBM Consulting cold email + retrospective. HARD DEADLINE 2026-05-31 23:59 ET. Cascade #13 6-agent dispatch (wave-43 Lane F2) + G2.6 apex-one-black.vercel.app smoke-test verify gate Day 11 morning before record.

**Critical-path Vinh deps still open (Day 8):**

Phase 0-2 closed; full commit chain at `docs/vinh-backend-plan.md` Phase 0-2 status paragraphs. Net of 8 Vinh-lane commits Days 3-5 totaling 103 backend tests (98 fast + 5 integration) on `.venv`. Remaining Vinh scope below.

1. **Phase 3 narrator block (tasks 3.1-3.8)** - Granite 4.1 8B Instruct narrator at `app/backend/apex/instruct/narrator.py` consuming forecast envelope + COA + debrief; emits `CoachingReport` JSON matching `app/shared/types.ts` canonical contract incl. the new `reasoning_chain: ReadonlyArray<ReasoningChainStep>` field (wave-46 OVERRIDE-steal #2+#4 from frontend commit `d223f1b`). Sarah 5-lap Donington telemetry + debrief fixtures. Provenance footer assembler with audit_id non-None contract test + citation-resolution test (no hallucinated FIA Articles). **Gate G6** on Sarah end-to-end.
2. **Phase 4 orchestration block (tasks 4.1-4.6 + 4.M3a/b/c)** - LangGraph runtime state machine (Vinh M3-V14 swap-point per `app/frontend/lib/vinh-swap-points.ts`); Convergence-14 serializer expansion from 5-type floor to all 14 types; Stream M.3 API endpoints (audit-log + what-if-replay + session-context) per `docs/wave-41-backend-spec-handoff.md`; COA + timing-sheet cache with SHA256 invalidation; **Gate G7** LangGraph end-to-end; **Gate G8** 60s coaching-loop budget.
3. **Phase 5 demo/deploy block (tasks 5.1-5.5c)** - Deploy decision (Vercel functions vs Modal vs Fly.io); backend API deployed; Sarah smoke test on deployed pipeline; Colab notebook backup; `physics-tsfm` v0.1 TestPyPI prep; **Gate G9** three-track + 8-tier SCP convergence (reduced columns per G4 pivot per D-052).
4. **Phase 6 submission block (tasks 6.1-6.6 + 6.4b)** - NeurIPS paper §3.2 final pass; arch-spec Layer 3 COA wording; backend README; Convergence-14 final pass; **Gate G10** LIPS 4-axis ablation + APEX-Bench dockerized harness; cost audit; final pre-mortem.
5. **wave-46 OVERRIDE-steal task rows (9.OV-1, 9.OV-2+4, 9.OV-QB)** - Self-Correcting Retry Loop pattern on every real LLM backend route (max 2 retries; `retry_count` + per-attempt `violation_summary` on response); `ReasoningChainStep` population on every `CornerInsight` (4-step cause/consequences/recommendation/evidence chain); optional Pydantic v2 + OpenTelemetry quality-bar audit if bandwidth permits before submission.
6. **D-050 deferred quality lifts (M3-V12 + M3-V13)** - 8-tier Pacejka linearization (`apex/physics/projection_pacejka.py`) + 3-iteration unrolled SCP outer loop (`apex/physics/projection_scp.py`) behind existing `DifferentiableProjector` Protocol. Frontend `PacejkaStageAPanel` + `SCPStageBPanel` already shipped canned-fallback engines; these light up the moment the backend modules land. NOT Day-5 blockers per D-050; Day-6+ quality lifts.

**Critical-path Stephen ops still open (Day 4):**
1. 9 PM Day-3 Discord sync verdicts: COA fixture source (synthetic Sarah / FIA template / MME-anonymized), OpenRouter+watsonx account stand-up, Phase 1 ownership split
2. Phase 1+2+3 stakeholder reply check (6 emails Day 0+1, Phase 4 driver DMs Day 3 18:00 ET awaiting reply through Day 8 EOD)
3. Q&A Card 2 memorization (Kinetic Hallucination defense) drilled 3x cold
4. Daily BeMyApp community devlog Day 3/4 evening send
5. Pre-mortem.md daily Day-4 entry

**Calibration ceiling (NotebookLM Phase 5 pass):** 90% top-3 / 96% Best Use of Technology / 88% Most Innovative. Working planning numbers: 75/85/75.

**Commits Day 1 through Day 3:** 400 atomic commits, all pushed, CI green per push (concurrency block dropped wave-18 to prevent middle-queue cancel cascade). **WAVE-30 MAXIMAL ARCHITECTURE LOCK landed 2026-05-22 night** per multi-model deep-research synthesis (Perplexity prior-art + Gemini 8-tier physics + ChatGPT polyphase aggregation gap + Claude wide-pass + NotebookLM synthesis + Claude decision brief). Galaxy ambition directive flips defaults from conservative-scope to maximal-ceiling. V2 / V3 / post-hackathon labels RETIRED on all surfaces. 19 new decisions D-009 through D-027 lock the architectural ceiling at `docs/decision-log.md`. Sources at `research/wave-30/` (9 files including the NotebookLM 6-question synthesis preserved verbatim). The maximal architecture: three-track forecasting ensemble (TTM r2.1 channel-mix + Granite FlowState + Chronos-2) + multi-frequency coexistence (1 Hz + polyphase + FlowState; 50 Hz feasible-lift projector unifier) + unrolled SCP outer loop wrapping convex QP inner stage (cvxpylayers locked, fixed 3-iteration unroll) + 8-tier physics in-scope (3D track + aero + adaptive hand-controls + load transfer + thermal + transient + Pacejka + kinematic) + 12-tool Granite stack (was 8: added Granite Embedding R2 + TSPulse + FlowState + Granite 4.0 Nano) + LangGraph + MCP + ContextForge orchestration (Langflow demoted to demo facade) + tri-agent Agent-as-Judge critic loop + Mellea IVR repair + 5 shouldn't-be-possible moves (WebGPU Granite Nano + aLoRA + GEPA + EAGLE-3 + Agent-as-Judge) + Tikhonov damping + steady-state algebraic substitution for stiff-ODE + gradient bridge two-regime seam at SCP output + WebGPU offline scope cut (Newton friction-ellipse + server-authoritative reconnect) + lexicographic COA constraint hierarchy + MLPerf tolerance-banded reproducibility + Physics-confidence detector feeding Guardian + NeurIPS central claim locked (frozen-TSFM + hard differentiable physics-projection composition) + APEX-Bench public benchmark release (50-lap multi-class + LIPS 4-axis ablation). **Day-3 SCP go/no-go gate (D-027) is the single most important checkpoint in the 12-day build** - replaces former G0 autograd spike; Vinh prototypes 3 unrolled SCP iterations through cvxpylayers with 8-tier Pacejka linearization on RTX 4060 by today EOD. Wave-25 row 2.9 split into 2.9a (Stage 1 convex QP) and 2.9b (Stage 2 post-projection feasibility filter); wave-30 D-012 reframes these as inner iterate of an outer 3-iteration SCP loop. Phase-2 physics layer is now the maximal 8-tier SCP-projected ensemble. Wave-26 landed the Convergence-14 fixture grid + Figure 1 architecture embed on `/judges` (galaxy-tier safety-contract visualization), the 30-second highlight-clip storyboard + BeMyApp Day 2 devlog + cost-audit shell + BeMyApp submission-payload sweep, and the ConvergenceFixture discriminated-union refactor (compile-time class-stage + COA-payload + serializer-integrity-verdict invariants). Wave-27 closed 4-agent self-review (codex + gemini + silent-failure-hunter + type-design re-validation): 6 Codex physics-math BLOCKERs (C14-04 sign + C14-05 + C14-06 bicycle thresholds + arch-spec jerk_max contradiction) + 4 silent-failure HIGHs (Figure 1 CLS picture-fallback + onError + download attribute + ResourceTile fragment-link) + type-design closure_kind discriminator + IBM Bob attribution scope softening + commit-count drift sweep. Wave-28 closed Vinh-Perplexity-research findings (COA-derived wording sweep across 8 surfaces + jerk-bound >=10Hz Rajamani caveat) + landed real-world MME Motorsport consent receipt (Q-006 ✅ closed; Sarah persona names MME directly; consent-log.md §1 audit-trail surface created). Wave-29 closed 3-agent self-review on wave-28 (codex + comment-analyzer + plan-gap-scanner): 14 BLOCKER + 10 HIGH + 8 MED + 4 NIT findings. Wave-29 atomic commits shipped: C14-04 syntax SHIPS-BREAKING fix + 11-surface frontend/deliverables/persona sweep + personal-name redaction (corporate-only naming on public surfaces; audit-trail consent-log retains personal sender + CC) + paper jerk_max 30 -> 8 m/s^3 alignment + PLAN gaps closure + wave-28 findings doc landed.

---

## Vinh - read this first when you wake up (2026-05-21 AM)

**End of Day 1 (2026-05-20) status:**

Stephen completed the bootstrap. Repo, scaffold, memory, Obsidian, plan, briefing PDF, decision log all live.

### What's in the repo waiting for you

- `https://github.com/StephenSook/apex` is public, Apache 2.0, 13+ commits pushed
- `docs/briefing-for-vinh.pdf` is the full 21-page briefing (legacy PIT WALL branding kept as artifact; the rename to APEX is the only thing that changed about the substance)
- `PLAN.md` (this file) is the living coordination doc
- `docs/decision-log.md` lists every locked decision (D-001 through D-007)
- `research/` has all 12 model recon PDFs (Claude, Perplexity, DeepSeek, Gemini, Groq, Kimi, two ChatGPT runs) plus the IBM rules + May brief + Physics-TTM research artifact
- `app/backend/apex/` has 7 empty subpackages waiting for your code (intake, vision, ttm, physics, guardian, instruct, langflow) plus `tests/` for the Convergence-14 serializer unit-test suite
- `physics-tsfm/` is the library carve-out for the NeurIPS Workshop paper draft (Day 11)
- `fixtures/{coa, telemetry, timing-sheets, personas}` are the test-data slots; populate with Sarah Reynolds persona Day 6
- `paper/` is where the NeurIPS draft lives starting Day 11

### Your action items in order (~30 min before any backend code)

1. **Accept GitHub collaborator invite.** Stephen sent the invite + texted you. Check `https://github.com/StephenSook/apex/invitations` or wait for the GitHub email.
2. **Read `docs/briefing-for-vinh.pdf`** (cover to cover, ~25 min). Skip pages 1-2 if you only have 5 minutes; pages 11-12 are your lane.
3. **Clone the repo:** `git clone https://github.com/StephenSook/apex && cd apex`
4. **Set git config to your account** so green-squares attribute correctly: `git config user.email <your-github-email>` and `git config user.name <your-github-name>`.
5. **Verify the IBM SkillsBuild rules PDF + the FIA Vehicle Adaptation Guidelines** in `research/` (link to live FIA URL in `docs/architecture-spec.md` if not present, fall back to the PDF in research).
6. **Run Gate G1 - TTM smoke test:**
   ```bash
   cd app/backend
   python3 -m venv .venv && source .venv/bin/activate
   pip install granite-tsfm transformers torch fastf1
   python -c "from tsfm_public.toolkit import TinyTimeMixerForPrediction; m = TinyTimeMixerForPrediction.from_pretrained('ibm-granite/granite-timeseries-ttm-r2'); print(m)"
   ```
   Commit `logs/day-01-ttm-smoke.md` documenting: load time, inference latency on a 6000x8 telemetry slice, output tensor shape. Pass criterion: TTM loads + 1Hz inference returns within 60s on your machine. If it does not, switch to APEX Lite contingency (drop TTM, keep Granite 4.1 8B Instruct + Guardian on regulatory-only product) and ping Stephen.

### What Stephen has done + planned next work (parallel to yours)

- ✅ Repo init, license, gitignore, README, PLAN.md, decision log, memory, Obsidian. Done Day 1.
- ⬜ Next: `app/frontend/` Next.js 16 + Tailwind + Plex + Fraunces scaffold with WCAG 2.1 AA baseline (Day 1 evening / Day 2 morning).
- ⬜ Day 2 PM: file-upload UI + dropzone + accessibility baseline; start `docs/pre-mortem.md`.
- ⬜ Day 6: Sarah Reynolds persona script committed to `fixtures/personas/sarah-reynolds.md`.

### Contact path (no Slack/Discord yet - use these in order)

1. **Real-time:** the chat platform you and Stephen have been using (text/iMessage/Discord DM)
2. **Async, attached to repo:** add a `🟡 NEEDS-INPUT` row in PLAN.md with your question; Stephen will see on next `git pull`
3. **Issue tracking:** open a GitHub issue at https://github.com/StephenSook/apex/issues if it's structured

### Coordination protocol (mirrors Hometown-Pathway-Atlas + Trace conventions, see §Coordination Protocol below)

- Edit PLAN.md to claim 🟡, complete ✅, block ⛔, cut ✂️
- Single-file commit per status change
- 4-hour stale lock TTL
- ⚠️ CONTRACT prefix on commits that change Shared Contracts
- **NO git hooks, NO CLI wrappers, NO commit-msg validators.** Manual coordination only. The `.git/hooks/` directory must contain only `.sample` defaults. Locked per D-006.

---

## Sources of truth (priority order)

1. **`~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/`** - persistent context Claude Code reads every session. Locked rules + facts live here. If anything in PLAN.md drifts from a memory file, fix the drift in PLAN.md.
2. **`docs/architecture-spec.md`** (v0 Day 1, expansion Day 2) - full system design. Master reference for stack roles, physics-projection layer math, COA section IDs, FIA Article references.
3. **This file (`PLAN.md`)** - authoritative for task ownership, status, decisions, contracts.
4. **`docs/briefing-for-vinh.pdf`** - operational guide for Vinh's Days 1-6.
5. **`docs/decision-log.md`** - every locked decision with rationale + date + scope.
6. **`docs/methodology.md`** (Day 11) - Sookra Methodology trace.
7. **`docs/pre-mortem.md`** (Day 2 start, Day 11 final) - running failure-mode journal.
8. **`README.md`** - public-facing pitch. Locked Day 11. Do not mirror this plan into it.

### Cold review findings index (referenced by closure-tag citations across PLAN rows + commit messages)

- `docs/wave-22-cold-review-brief.md` - pre-staged dispatch packet for the wave-22 6-lens cold review (written 2026-05-21 night-late).
- `docs/wave-22-cold-review-findings.md` - consolidated wave-22 findings (5 BLOCKER + 14 HIGH + 20 MED + 11 NIT). Defines closure IDs B1-B5, H1-H14, M1-M20, N1-N11 referenced in PLAN rows + commit messages.
- `docs/wave-23-cold-review-findings.md` - consolidated wave-23 findings (5 BLOCKER + 14 HIGH + 13 MED + 8 NIT). Defines wave-23 closure IDs.
- `docs/wave-24-cold-review-findings.md` - consolidated wave-24 findings (9 BLOCKER + 14 HIGH + 12 MED + 2 NIT). Defines wave-24 closure IDs; closures landed in wave-25 commits.
- `docs/wave-25-cold-review-findings.md` - consolidated wave-25 findings (13 BLOCKER + 20 HIGH + 13 MED + 11 NIT) caught by 4-agent parallel sweep + manual Bash + WebFetch verification of Granite IDs. Closures are landing in subsequent wave-25 atomic commits across paper title + README Differentiator #2 + arch-spec ASCII + decision-log D-A + outreach drafts + June bridge + APEX-Lite + methodology + Sarah persona vocab + Q&A Cards 1/2/5 + PLAN ID-scheme + brand-fonts JSDoc + architecture.svg re-render.
- `docs/wave-27-cold-review-findings.md` - consolidated wave-27 findings (6 BLOCKER + 7 HIGH + 7 MED + 1 NIT) caught by 4-agent self-review on the wave-26 batch (codex + cc-gemini-plugin:gemini-agent which timed out at API 529 + pr-review-toolkit:silent-failure-hunter + pr-review-toolkit:type-design-analyzer re-validation) plus manual physics-math verification. Closures landed in single mega-commit `1e0c182` due to Anthropic safety-classifier capacity outage that prevented atomic-commit cadence in the closure window. Findings doc preserves logical breakdown.
- `docs/wave-28-cold-review-findings.md` - consolidated wave-28 findings (14 BLOCKER + 10 HIGH + 8 MED + 4 NIT) caught by 3-agent self-review on the wave-28 batch (codex + comment-analyzer + plan-gap-scanner; gemini skipped per 529-timeout history). Wave-28 BLOCKERs span (a) C14-04 SHIPS-BREAKING syntax error; (b) ~11 cross-surface COA-wording misses (Vinh-Perplexity research surfaced FIA Article 18.3 + COA Section 3(c) anti-pattern; wave-28 swept docs/ + paper/ but missed app/frontend/app/ + deliverables/ + SUBMISSION + types.ts JSDoc + tests + banner-renderer); (c) personal-name leak across 4 public-repo surfaces violating consent-log corporate-only attribution. Wave-29 closure batch: 4 atomic commits closing all 14 BLOCKERs + 6 HIGHs; HIGHs H-W28-3 (UK-MME pattern verification) + H-W28-4 (Dec 2017 single-seater-ban-lift date verification across remaining surfaces) + 6 MEDs + 4 NITs queued for wave-30.
- `research/wave-30/` (9 source files + README.md index) - wave-30 multi-model deep-research bundle preserving the full architectural source-of-truth: Perplexity prior-art sweep + Gemini 8-tier physics frontier + ChatGPT polyphase aggregation gap + Claude wide-pass (connective tissue + AI/architecture frontier + decision brief on five open questions) + NotebookLM 6-question synthesis. 19 architectural locks D-009 through D-027 derive from this bundle. Galaxy ambition: everything in this directory is in-scope for the 2026-05-31 submission.

---

## Status dashboard

Legend: ✅ done · 🟡 in progress · ⬜ not started · ⛔ blocked · ✂️ cut

**Bold owner = currently active on the task. Plain owner = assigned but not started.**

### Phase 0 - Bootstrap (Day 1, both)

| # | Component | File(s) | Owner | Status | Notes |
|---|-----------|---------|-------|--------|-------|
| 0.1 | Lock APEX name (rename from PIT WALL) | repo metadata | **Stephen** | ✅ | A.P.E.X. = Adaptive Performance Engineer with eXplanation. BeMyApp portal showed competing "PitWall" submission. |
| 0.2 | Init GitHub monorepo + Apache 2.0 LICENSE | repo root | **Stephen** | ✅ | `gh repo create apex --public --source=. --remote=origin --push` |
| 0.3 | Invite Vinh as collaborator | GitHub Settings | **Stephen** | ✅ | Invite sent + Vinh texted; waiting on accept |
| 0.4 | Drop PLAN.md + STATUS_TEMPLATE + briefing PDF | repo root, docs/ | **Stephen** | ✅ | Coordination is manual (mirrors Trace/Hometown) - no hooks, no CLI |
| 0.5 | `.gitignore` for Python + Node + IBM caches | repo root | **Stephen** | ✅ | 122 lines |
| 0.6 | Reorganize 12 PDFs into research/ + docs/ | research/, docs/ | **Stephen** | ✅ | All kebab-case |
| 0.7 | Scaffold app/, physics-tsfm/, fixtures/, deliverables/, scripts/, bob-sessions/, paper/, logs/ | repo tree | **Stephen** | ✅ | 25 `.gitkeep` placeholders |
| 0.8 | Project memory folder + 15 seed files | `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/` | **Stephen** | ✅ | 8 project facts + 6 durable rules + 1 index |
| 0.9 | Obsidian APEX MOC + 7 child notes + Home.md update | Obsidian vault | **Stephen** | ✅ | State-recovery anchor live |
| 0.10 | `logs/day-01-2026-05-20.md` + `docs/decision-log.md` | logs/, docs/ | **Stephen** | ✅ | Committed |
| 0.11 | Vinh's git config matches GitHub account | Vinh's local | Vinh | ✅ | Day 3 (2026-05-23). All Day-3 commits attributed to `vinhbin <vinhhle24@gmail.com>` |
| 0.12 | Vinh accept invite + clone repo | Vinh's local | Vinh | ✅ | Day 3. 17 atomic commits pushed |
| 0.13 | **Gate G1 - TTM smoke test** | `logs/day-03-g1-ttm-smoke.md` | Vinh | ✅ | Day 3. PASS: warm inference 10.5ms, load 3.08s on RTX 3060 Ti, output (1, 30, 14). Real FastF1 Hamilton 2024 Bahrain Q 5-lap export. Commit `856a002`. |
| 0.13a | **🚨 D-027 Day-3 SCP go/no-go gate (single most important checkpoint in 12-day build per `research/wave-30/06-claude-decision-brief-five-open-questions.pdf`).** Prototype 3 unrolled SCP iterations through cvxpylayers with 8-tier Pacejka linearization on RTX 4060. Pass criterion: gradients flow end-to-end (TTM channel-mix forecast through SCP projection without exploding / vanishing); verdict lands at FCVR = 0.00 on Sarah Reynolds canned fixture. **Fallback ladder:** (a) drop to 2 SCP iterations + trust-region penalty if 3 oscillates; (b) escalate to D-A revision (`docs/decision-log.md` entry D-A-revision) if 2 also oscillates. Replaces former G0 autograd spike with wider scope per wave-30 D-027. | `logs/day-03-scp-go-no-go.md` | Vinh | ✅ | Day 3 (2026-05-23). **PASS Stage C** per council v2 staged spec: constant-mu friction ellipse + single SCP iterate; ‖∇L‖ = 24.12 (council threshold 1e4), FCVR = 0.00, e2e ~1s on RTX 3060 Ti. 8-tier Pacejka + 3-iteration unroll deferred to Phase 2 Day 4 task 2.12 per D-031. Pre-committed three-track de-scope rung 1 did NOT fire. G.1 GREEN BRANCH applies per D-030. Commits `3523f39` (spike) + `c97caaa` (verdict). |
| 0.13b | **G-0.5 TTM-r2 hardware-load gate** (council v2 pre-D-027 check). Verifies TTM-r2 loads from HF + emits (B, 30, 14) on operator GPU before any cvxpy work. | `logs/day-03-g-0-5-ttm-load.md` | Vinh | ✅ | Day 3 (2026-05-23). PASS: loads 0.74s, 12 MiB VRAM, output (2, 30, 14) on RTX 3060 Ti. Council v2 Senior-Eng peer catch. Commit `9927b06`. |
| 0.13c | **G0.6 cvxpylayers Windows import smoke** (council v2 pulled-forward from former Day-4 EOD G6.5). | `logs/day-03-g0-6-cvxpy-import.md` | Vinh | ✅ | Day 3. PASS: clean install on Windows 11 + Python 3.10 + cu121 in 1 min; no VC++ Build Tools intervention; README example backward gives finite grads. 4h Windows debug budget reclaimed. Commit `310dd67`. |
| 0.13d | **G1b Granite 4.1 8B Q4_K_M latency bench**. Feeds aLoRA hot-swap + EAGLE-3 deploy decision per D-019. | `logs/day-03-g1b-granite-latency.md` | Vinh | ✅ | Day 3 (2026-05-23). Baseline: 7.1 tok/s on RTX 3060 Ti via llama-cpp-python 0.3.23; 200-token coaching report = 28s; LOCAL llama.cpp misses 15s sub-budget by 2x. Demo path is OpenRouter per D-019 / plan task 5.1; EAGLE-3 + aLoRA elevated from "optimization" to "required for offline-fallback 15s sub-budget." Commit `b61c629`. |
| 0.13e | **Council v2 staged-rewrite scaffolding** (additions outside the original Phase 0 enumeration). `shapes.py` canonical (B, 30, 14) source (single source of truth for 14 named CHANNELS + CHANNEL_TIER_BINDING + SCHEMA_VERSION); DifferentiableProjector Protocol seam (V1 NumPy / cvxpylayers / qpth / Theseus swap); PhysicsViolationLog + GuardianAudit + audit_id (uuid4 hex, never None) per Software Lead fix #9; V1 NumPy validator signatures + ToleranceBands (channel-specific per Software Lead fix #7); structured JSON logging with audit_id correlation across forecast / projection / Guardian (SRE peer fix); Sarah Reynolds 10-row telemetry stub with fictional-persona watermark (Security peer fix); pyarrow 24.0.0 -> 21.0.0 Windows DLL fix; FastF1 cache prefetch (Bahrain 2024 Q, 45.7 MiB); Granite-Docling 258M prefetch (505 MiB). | `app/backend/apex/shared/contracts/{shapes,projector,violations}.py` + `app/backend/apex/shared/logging.py` + `app/backend/apex/physics/{validator,scp_spike}.py` + `app/backend/apex/ttm/g1_smoke.py` + `app/backend/apex/instruct/g1b_latency_bench.py` + `fixtures/personas/sarah-reynolds-telemetry-stub.csv` + `app/backend/requirements.txt` | Vinh | ✅ | Day 3 (2026-05-23). 14 atomic commits. Full audit trail at `council-transcript-20260522-vinh-backend-plan-v2.md` (transcript) + `docs/decision-log.md` D-030 (Stephen-side wave-40 close-out) + D-031 (Stage A/B deferral) + D-032 (frontend-backend type alignment mirror). |
| 0.14 | Next.js 16 + Tailwind v4 + Plex + Fraunces scaffold | `app/frontend/` | **Stephen** | ✅ | Day 1 PM. Editorial-paddock palette, WCAG 2.1 AA baseline (skip link, focus ring, prefers-reduced-motion), full APEX landing page with hero + Sarah moment + PhysicsTTM 3-layer + 5 differentiators + build status + stack badges + footer. Build + lint + SSR smoke all green. |
| 0.15 | Mermaid architecture diagram in README + SVG export to docs/ | README.md, docs/architecture.svg | **Stephen** | ✅ | Mermaid in README live; SVG export Day 11. |
| 0.16 | Project-local `CLAUDE.md` (refers to global + memory) | repo root | **Stephen** | ✅ | 79 lines. Locked decisions D-001 through D-007, hard compliance, editorial-paddock identity. |
| 0.17 | `STATUS_TEMPLATE.md` for daily handoffs | repo root | Stephen | ✅ | Mirrors Hometown convention |
| 0.18 | `docs/architecture-spec.md` v0 skeleton | docs/ | **Stephen** | ✅ | Day 1 PM. Component spec for PhysicsTTM 3 layers + intake + vision + narrator + Langflow + Bob. Day 2 expansion fills physics math + COA schema + API contracts. |
| 0.19 | `SUBMISSION.md` v0 BeMyApp form draft | repo root | **Stephen** | ✅ | Day 1 PM. 7-block story + tech tags + multi-track checklist + Day-12 submission sequence. |

### Phase 1 - Document parsing (Day 2, Vinh)

| # | Component | File(s) | Owner | Status | Deps | Notes |
|---|-----------|---------|-------|--------|------|-------|
| 1.1 | Granite-Docling 258M parses FIA COA PDF into structured JSON. **Path migrated to `instruct/` per wave-44 sweep.** | `app/backend/apex/instruct/coa_parser.py` | Vinh | ✅ Day 4 (commit `e9c9d11`) | 0.13 ✅; handoff Q1 ✅ synthetic Sarah COA per `docs/vinh-phase-1-handoff.md` | Rung-0 JSON-first ingestion shipped (consumes `fixtures/personas/sarah-reynolds-coa-stub.json`). Granite-Docling 258M PDF rung deferred to Phase 2 per `logs/day-04-docling-bench.md`. `CoaParseResult.simultaneity_permitted` is **derived** from approved hardware specs + medical findings (D-022 + Perplexity 2026-05-21 wording, NOT explicit FIA Article). Section IDs + 9 adaptation domains preserved. |
| 1.2 | Granite Vision 4.1 4B parses SRO timing-sheet PDF into CSV. **Path migrated to `instruct/` per wave-44 sweep.** | `app/backend/apex/instruct/timing_sheet_parser.py` | Vinh | ✅ Day 4 (commit `e9c9d11`) | 0.13 ✅; wave-44 frontend route `2557d5f` ✅ | Canned-fixture parser shipped; mirrors frontend `TimingSheetParsedLaps` JSON contract byte-for-byte. Granite Vision 4.1 4B real-inference swap-point named `_parse_with_granite_vision` for Phase 2 wire-up (gated on RTX 4060 + cvxpylayers stack settling per `logs/day-04-docling-bench.md`). |
| 1.3 | Fixture COA + timing-sheet committed | `fixtures/coa/`, `fixtures/timing-sheets/` | Vinh | ✅ Day 4 | 1.1, 1.2; handoff Q1 ✅ | `fixtures/personas/sarah-reynolds-coa-stub.json` ✅ shipped wave-42 (`82d1f85`); `fixtures/timing-sheets/sarah-reynolds-donington-2026-stub.json` ✅ shipped Day 4 (commit `e9c9d11`; 5-lap stub mirrors frontend `CANNED_LAPS`). |
| 1.4 | Tests for intake + vision parsers. **Tests live at `tests/test_instruct.py` after wave-44 path migration.** | `app/backend/tests/test_instruct.py`, `test_contracts_adapters.py`, `conftest.py` | Vinh | ✅ Day 4 (commit `e9c9d11`) | 1.3 | 19/19 green: 12 tests on `test_instruct.py` (parse + 9-domain coverage + simultaneity-derivation positive + 2 negatives + explicit-flag-disagreement raises + missing-field raises + timing-sheet frontend-contract match + canned-fixture stub match + missing/empty PDF raises + Granite Vision not-yet-wired) + 7 tests on `test_contracts_adapters.py` (`build_ttm_input` tiling). |
| 1.5 | **Gate G2 - COA parse coverage** | `logs/day-04-g2.md` | Vinh | ✅ **PASS Day 4** (commit `e9c9d11`) | 1.1 | Pass: JSON contains all 9 adaptation domains (`coa_sec_hand_controls` / `coa_sec_simultaneity` / `coa_sec_egress` / `coa_sec_thermal` / `medical_findings` / `adaptive_equipment_specifications` / `certificate_metadata` / `driver_metadata` / `issuing_authority`) + section IDs. Simultaneity flag derived from both anchors (approval-status + hand-control-geometry); mismatch with explicit flag raises `CoaParseError`. |
| 1.6 | File-upload UI dropzone + WCAG keyboard/screen-reader | `app/frontend/components/Dropzone.tsx` | Stephen | ✅ | 0.14 | Pulled forward to Day 1 EOD per galaxy-tier rule. 641-line component + `/analyze` route + Playwright a11y snapshot verified. Day-2 task = wire `Analyze` link into landing-page nav. |
| 1.7 | `docs/pre-mortem.md` started | docs/ | **Stephen** | ✅ | - | Pulled forward to Day 1 EOD per galaxy-tier rule. 12 Day-1 failures logged (incl. wave 7/8/9 observed) + 17 forward-looking modes + 3 accepted residual risks. Daily updates start Day 2 morning. |
| 1.8 | Q&A Card 2 memorization (Kinetic Hallucination) | mental | Both | ⬜ | - | Drill 3x |
| ~~1.9~~ | ~~OpenRouter API key + Granite 4.1 8B sample call~~ - reassigned to Stephen-lane per `docs/vinh-phase-1-handoff.md` Q3 split (Vinh owns parsing 1.1-1.6 + simultaneity-flag derivation 1.9-in-vinh-plan; Stephen owns API plumbing). | n/a | Stephen | ✅ DONE wave-42 (`7179dc1` OpenRouter Granite API plumbing + `89da292` `/api/openrouter-stream` route + `dc5bd7e` streaming-response handler + cold-review fixes `df3109d` + `b87f618`) | 0.13 ✅; handoff Q2 + Q3 ✅ | Vinh consumes Granite via Stephen's frontend route; never touches OpenRouter directly. Local llama.cpp Granite 4.1 8B Q4_K_M Day-3 baseline at 7.1 tok/s (G1b commit `b61c629`) is offline-fallback only. Backup watsonx.ai is bonus track for "Best Use of IBM Tech" judging if Stephen has >=4h pre-submit runway. |
| **1.9b** | **Simultaneity-flag derivation + `build_ttm_input` adapter** (was task 1.9 in `docs/vinh-backend-plan.md`; renumbered here to avoid collision with retired OpenRouter row above) | `app/backend/apex/instruct/coa_parser.py` (`derive_simultaneity_flag`) + `app/backend/apex/shared/contracts/adapters.py` (`build_ttm_input`) | Vinh | ✅ Day 4 (commit `e9c9d11`) | 1.1, 0.4e shapes contract ✅, 0.9 violations contract ✅ | Scalar `CoaParseResult.simultaneity_permitted` derived from approved-hardware-spec + medical-finding anchors per D-022 + Perplexity 2026-05-21 wording; tiled to per-step `coa_overlap_flag` channel (TENSOR_SHAPE index 8) by the single-source-of-truth adapter (Software Lead fix #2). 7 contract tests passing. |
| 1.10 | Fork IBM-SkillsBuild Learning Lab repo + run TORCS lab + record 1 RESULTS.md entry | `https://github.com/IBM-SkillsBuild-AI-Builders-Challenge/hands-on-labs` | Vinh | ⬜ | - | Downgraded 2026-05-21 PM after WebFetch of the Official Rules Google Doc: TORCS lab completion is NOT in the rules' binding submission requirements. Stays as "recommended community-signal only" - nice-to-have if Day-2 budget allows but skippable if Vinh-lane bandwidth tightens. Discord intel had over-read the eligibility constraint. See `reference_ibm_skillsbuild_org.md` for verbatim rules. |
| 1.11 | README structure audit (explicit problem / AI approach / racing relevance per BeMyApp pinned 2026-05-20) | `README.md` | Stephen | ⬜ | - | Currently has all 3 implicitly under "The opening stat" + "What makes it different." Day 2 task: surface as explicit section headings to match makenna's pinned submission requirements. |
| 1.12 | Watch BeMyApp hosting webinar + submission walkthrough video, log any submission-form field deltas | `deliverables/bemyapp-submission-payload.md` | Stephen | ⬜ | - | URLs in `reference_discord_intel_day_1.md` private memory. Day 2 task. |
| 1.13 | Accept IBM-SkillsBuild-AI-Builders-Challenge GitHub org invite (gain access to 3 private repos: community-guide + innovation-challenges + showcase-hall-of-fame) | external (GitHub email) | Stephen | ✅ | - | Done 2026-05-21 PM. Reference memory `reference_ibm_skillsbuild_org.md` captures verified rules + prize structure + DQ triggers + verbatim binding submission requirements pulled from the Official Rules Google Doc. |
| 1.14 | Verify Vinh receives + accepts the same GitHub org invite under his account | external (Vinh's email) | Vinh | ⬜ | 1.13 | Per the rules, team-member info ships on the BeMyApp form. Vinh-side org membership is not a binding requirement, but it grants access to the 3 private repos (rules + submission + showcase) for his reference. **Update 2026-05-21 night per a BeMyApp staff Discord clarification:** invites are throttled at 500/day; full participant rollout completes by Tuesday 2026-05-26 to 2026-05-27. Vinh-side absence is benign + the `hands-on-labs` repo is already public so Vinh can start TORCS without org access (PLAN row 1.10 recommended-only). Re-check Tuesday 2026-05-27 EOD; if no Vinh response by then, evaluate Q-007 EARLY APEX Lite trigger on the OTHER failure modes (no reply in 48h, G1/G4 fail). |
| 1.15 | Join the IBM SkillsBuild Discord (community + `#may-challenge-and-labs` channel) | external (discord.gg/Nmcm2uCze4) | Stephen | ✅ | - | Done 2026-05-21 PM. Canonical channel for clarifications + question-asking. |
| 1.16 | Ask Discord whether ONE submission can win multiple per-challenge awards (1st + Best Use of Technology + Most Innovative stacking) | discord post | Stephen | ✅ | 1.15 | Resolved 2026-05-21 night via Discord answer captured in Stephen-shared screenshot. A BeMyApp staff moderator answered a community member's question: "You're submitting 1 project and prizes such as best use of technology are decided by the judges!" **Verdict: NO opt-in tracks.** ONE submission per team. Judges award the four per-challenge categories on their own assessment. Multi-track-stacking strategy from global CLAUDE.md is mooted; project-flow falls back to: build the best single submission across all four official judging criteria (Technical Execution / Innovation / Challenge Fit / Implementation & Feasibility). Cross-reference: `reference_competitors_calibration.md`. |

### Phase 2 - Physics layer (Days 3-5, Vinh)

| # | Component | File(s) | Owner | Status | Deps | Notes |
|---|-----------|---------|-------|--------|------|-------|
| 2.1 | Pure-NumPy kinematic validator V1 (friction ellipse + bicycle + Euler + jerk) | `app/backend/apex/physics/validator.py` | Vinh | ✅ | 0.13 | Day 4 commit `9e114b5`. friction_ellipse_check + forward_euler_consistency + bicycle_kinematic_check + coa_simultaneity_rule + validate_forecast all shipped behind engine-agnostic PhysicsViolationLog. |
| 2.2 | V1 catches 5 impossible-physics traces + approves 5 valid | `app/backend/tests/test_physics_v1.py` | Vinh | ✅ | 2.1 | **Gate G3 PASS** Day 4 commit `9e114b5`; 19 tests + `logs/day-04-g3.md`. Round-trip serializer assertion (Convergence-14 floor) green; 5 impossibilities + 5 valid traces enumerated. |
| 2.3 | Langflow graph screenshot mockup for deck slide 6 | `docs/deck/langflow-mockup.png` | Stephen | ⬜ | - | Day 3 |
| 2.4 | Q&A Card 3 memorization (Serialization) | mental | Both | ⬜ | - | Drill 3x |
| 2.5 | TTM → NumPy validator → text log end-to-end | `app/backend/apex/ttm/forecast.py` + integration | Vinh | ✅ | 2.1, 0.13 | Day 4. TTM forecast wrapper at `apex.ttm.forecast` (commit `373a882`, 15 tests); telemetry-to-log pipeline at `apex.pipelines.telemetry_to_log` (commit `745e4cf`, 11 tests + CLI); FastF1 integration test at `tests/test_ttm_integration.py` (commit `a157fb6`, 5 tests, run with `--integration`). |
| 2.6 | Beats seasonal-naive baseline on FastF1 holdout (speed_mps; long_g absent per pre-mortem row 62) | `app/backend/apex/pipelines/g4_mae_bakeoff.py` + `logs/day-04-g4.md` | Vinh | ❌ | 0.13 (NOT 2.5) | **Gate G4 FAIL** Day 4 (Hamilton Bahrain 2024 Q laps 4-5 holdout; TTM zero-shot MAE 35.18 m/s vs naive 18.38 m/s on speed_mps; numbers JSON at `logs/day-04-g4-numbers.json`). Pivot per plan L377 + `docs/vinh-backend-plan.md` L377: drop "zero-shot beats naive" pitch claim Cards 03 + 04, elevate D-010 Track 1 channel-mix decoder fine-tune to Day 5 morning, reframe TTM as forecast-envelope generator (not point-prediction winner). Q-004 APEX Lite NOT triggered (D-A floor + V1 NumPy validator hold; only the zero-shot accuracy claim is dropped). Discord 9 PM ET sync escalation tonight. |
| 2.7 | Coaching-report React component (corner-by-corner cards) | `app/frontend/components/CoachingReport.tsx` | Stephen | ✅ | - | Day 4 pull-forward to Day 1 EOD. Renders CornerInsight ReadonlyArray with Citation provenance per shared/types.ts contract. Vitest suite covers happy-path + empty-corners edge. |
| 2.8 | Q&A Card 4 memorization (COA Simultaneity) | mental | Both | ⬜ | - | Drill 3x |
| 2.9a | SCP inner-iterate convex QP via cvxpylayers (friction ellipse + forward-Euler kinematic + jerk bound; per D-012 unrolled SCP outer loop) | `app/backend/apex/physics/projection.py` | Vinh | ✅ partial | 2.5, **D-027** | Day 5 commit `cb970ed`. Constant-mu V2 inner iterate shipped as `CvxpyLayersProjector` class behind `DifferentiableProjector` Protocol; per-step (long_g, lat_g) friction-ellipse projection; DPP-compliant; differentiable end-to-end. 12 tests including engine-agnostic byte-equality (test_v1_v2_to_text_byte_equal_modulo_engine_line). Forward-Euler kinematic + jerk bound + 3-iteration unrolled SCP outer loop (D-031 Stage A + Stage B) deferred to swap-points `projection_pacejka.py` + `projection_scp.py` per D-050 (constant-mu floor ships; staged ladder rungs are Day-6+ quality lifts, not Day-5 blockers). |
| 2.9b | SCP outer-loop Taylor linearization of 8-tier non-convex physics (Pacejka combined-slip + transient tire + thermal + load transfer + double-track + 3D track + aero + adaptive hand-controls; per D-012) + non-differentiable feasibility audit (bicycle-model + COA-parameterized simultaneity gate; per D-A wave-25 legacy) | `app/backend/apex/physics/scp_outer.py` (new wave-30) + `app/backend/apex/physics/feasibility.py` (D-A wave-25 legacy) | Vinh | ⬜ deferred per D-050 | 2.9a, **D-027** | Day 6+ quality lift behind the existing `DifferentiableProjector` Protocol swap-point. V1 NumPy validator + V2 cvxpylayers constant-mu floor both emit engine-agnostic `PhysicsViolationLog`; Guardian audits both at task 2.10 below. Wave-25 non-differentiable feasibility filter (bicycle + COA-simultaneity) lives in V1 NumPy validator (`app/backend/apex/physics/validator.py`) shipped Day 4 commit `9e114b5`. |
| 2.9c | Stage 1 + Stage 2 unit-test suite | `app/backend/tests/test_projection.py` + `app/backend/tests/test_feasibility.py` | Vinh | ✅ partial | 2.9a, 2.9b | Day 5 commit `cb970ed`. Stage 1 (constant-mu V2 projection) test suite at `app/backend/tests/test_physics_v2.py` (12 tests). Stage 2 feasibility audit covered by V1 NumPy validator test suite at `app/backend/tests/test_physics_v1.py` (19 tests) + cross-engine Guardian audit at `app/backend/tests/test_guardian_audit.py` (22 tests). Stage A + B 8-tier expansion test fixtures land alongside `projection_pacejka.py` per D-050. |
| 2.10 | Granite Guardian 4.1 BYOC custom rules audit text log (consumes Stage 1 + Stage 2 violation logs uniformly) | `app/backend/apex/guardian/audit.py` | Vinh | ✅ | 2.9a, 2.9b | Day 5 commit `9048573`. Guardian class + BYOCRule dataclass + DEFAULT_RULE_REGISTRY covering 4 V1 violation types + Tier-0 COA gate. `render_audit(audit, mode={'think','no-think'})` helper for UI text surface (task 2.15). GuardianAudit Python schema reconciled with frontend canonical discriminated-union shape per D-032. 13 + 7 + 2 = 22 tests at `tests/test_guardian_audit.py`. |
| 2.11 | Guardian catches the same 5 impossibilities the validator catches | `app/backend/tests/test_guardian_audit.py` | Vinh | ✅ | 2.10 | **Gate G5 PASS Day 5** (`logs/day-05-g5.md`). 22 Guardian tests inc. 5-impossibility floor + D-022 hairpin lexicographic precedence stress test + V1/V2 engine-agnostic Guardian audit agreement. 98 fast + 5 integration = 103 backend tests green. |
| 2.12 | Guardian-verdict UI panel with reasoning trace surfaced | `app/frontend/components/GuardianAudit.tsx` | Stephen | ✅ | - | Day 5 pull-forward to Day 1 EOD. Discriminated-union GuardianAudit handler approve/flag/reject + reasoning-trace `<details>` + empty-trace role=alert fallback. 6 vitest tests covering all verdicts + empty-trace edge. |
| 2.13 | Q&A Card 5 memorization (Latency) | mental | Both | ⬜ | - | Drill 3x |
| 2.14 | Polyphase decomposition preprocessor (50 phase streams at 1Hz interleaved to 50Hz output; D-011 multi-frequency coexistence) | `app/backend/apex/intake/polyphase.py` | Vinh | ⬜ | 0.13, **D-027** | Day 4. Implements ChatGPT source 03 polyphase decomposition + 50Hz feasible-lift projector unifier. Path A 1Hz aggregation + Path B polyphase 50-stream output + Path C native-rate stream all coexist + fan out to Layer 3 forecasting per D-011. **Acceptance criterion:** PolyphaseTensor of shape `(B, 50, 30, 14)` for Path B + `(B, 30, 14)` for Path A produced from Sarah Reynolds raw telemetry fixture without information loss; test `app/backend/tests/test_polyphase.py` verifies bit-exact round-trip on 5-lap fixture. |
| 2.15 | Granite FlowState Track 2 integration (9.1M sampling-rate-invariant SSM; D-010 three-track ensemble) | `app/backend/apex/ttm/flowstate.py` | Vinh | ⬜ | 2.14, **D-027** | Day 4 EOD (G1c smoke gate). Loads FlowState 9.1M weights + produces `(B, 30, 14)` forecast tensor on polyphase output. **Acceptance criterion:** FlowState forecast renders within 30s on RTX 4060; tensor shape contract matches Sync Point 1. |
| 2.16 | Amazon Chronos-2 Track 3 integration (21-quantile probabilistic baseline; D-010 three-track ensemble) | `app/backend/apex/ttm/chronos2.py` | Vinh | ⬜ | 2.14, **D-027** | Day 4 EOD (G1c smoke gate). Loads Chronos-2 + produces 21-quantile uncertainty corridor. **Acceptance criterion:** quantile bands render as `(B, 30, 14, 21)` tensor on Sarah Reynolds fixture; calibration check via empirical-coverage on 5-lap FastF1 holdouts. |
| 2.17 | Three-track ensemble fusion (TTM r2.1 + FlowState + Chronos-2 weighted-mean blend with TTM anchor; D-010) | `app/backend/apex/ttm/ensemble.py` | Vinh | ⬜ | 2.5, 2.15, 2.16 | Day 5. Fuses 3 forecasts into a single `(B, 30, 14)` ensemble tensor + propagates Chronos-2 quantile bands as confidence corridor. **Acceptance criterion:** ensemble MAE beats best single track on at least 3 of 5 FastF1 holdouts; divergence > 2 sigma triggers TTM-only fallback per pre-mortem row 57 (open active risk until Day-7 stress test passes). |
| 2.18 | 8-tier physics implementation (3D track geometry + aero downforce + adaptive hand-controls + double-track load transfer + tire thermal + transient tire ODE + Pacejka combined-slip + kinematic integration; D-015) | `app/backend/apex/physics/tier_{1..8}.py` (8 modules, one per tier) + `app/backend/apex/physics/scp_outer.py` linearization wrapper | Vinh | ⬜ | 2.9a, 2.9b | Days 5-7. Each tier exposes `linearize_around(state) -> (jacobian, residual)` for the SCP outer-loop Taylor-step per D-012. **Acceptance criterion:** all 8 tiers linearize without error on Sarah Reynolds fixture across the 30-step horizon; per-tier convergence-trace logged for D-027 prototype; EXTENDED_PHYSICS_FIXTURES catalogue surfaces each tier on `/judges` (Stephen-lane wave-30 frontend pull-forward). Tier 5 + Tier 7 use T_surface internal state per arch-spec line 391 (no 15th channel). |
| 2.19 | Physics-confidence detector (Mahalanobis-distance over telemetry vs Pacejka tire-parameter distribution; D-024) | `app/backend/apex/physics/confidence.py` | Vinh | ⬜ | 2.18 | Day 6 EOD (G5.5 gate). Outputs `physics_confidence: float` ∈ [0, 1] + Mahalanobis distance + downgrade trigger to Granite Guardian BYOC (SAFE -> REVIEW if OOD). **Acceptance criterion:** detector flags Pacejka mismatch on injected-incorrect-.tir fixture; Guardian downgrades verdict from SAFE to REVIEW; calibration threshold = 95th-percentile Mahalanobis distance from Sarah fixture distribution per pre-mortem row 59. |
| 2.20 | IBM TSPulse anomaly detection on polyphase phase streams (1M params time-frequency analyzer; D-016 12-tool stack expansion) | `app/backend/apex/intake/tspulse.py` | Vinh | ⬜ | 2.14 | Day 4. Anomaly score per polyphase stream feeds Layer 8 Guardian-side observability per arch-spec Layer 8 expansion. **Acceptance criterion:** TSPulse imports + produces anomaly tensor on Sarah Reynolds polyphase output; sanity-check against known-clean fixture (low anomaly) + injected-glitch fixture (high anomaly). |

### Phase 3 - Narrator (Day 6, Vinh)

| # | Component | File(s) | Owner | Status | Deps | Notes |
|---|-----------|---------|-------|--------|------|-------|
| 3.1 | Granite 4.1 8B Instruct narrator wired | `app/backend/apex/instruct/narrator.py` | Vinh | ⬜ | 2.10, 1.1 | Reads forecast envelope + COA + debrief, emits tuning delta |
| 3.2 | Tuning-recommendation card UI with COA-section provenance | `app/frontend/components/TuningCard.tsx` | Stephen | ✅ | 3.1 | Day 6 pull-forward to Day 1 EOD. Renders TuningDelta + parameter/current/recommended/unit + COA section Citation per shared/types.ts. Vitest suite asserts citation rendering invariant. |
| 3.3 | Sarah Reynolds persona fixture | `docs/sarah-reynolds-persona.md` (Stephen narrative) + `fixtures/{telemetry,coa,timing-sheets}/sarah-*` (Vinh data) | Both | 🟡 | 3.1 | Stephen narrative ✅ Day 1 EOD (pulled forward, Stephen-lane only, no fixtures/ touched per Vinh-lane respect). Vinh data files Day 6 with G6 integration. |
| 3.4 | End-to-end pipeline runs Sarah test case < 2 min on RTX 4060 | demo run logs | Both | ⬜ | 3.1, 2.10, 3.3 | **Gate G6** |
| 3.5 | Q&A hostile rehearsal pass 1 | mental | Both | ⬜ | - | Vinh asks Stephen, then swap |

### Phase 4 - Orchestration + polish (Days 7-8, both)

| # | Component | File(s) | Owner | Status | Deps | Notes |
|---|-----------|---------|-------|--------|------|-------|
| 4.1 | Langflow graph export of full pipeline | `app/backend/apex/langflow/graph.json` + screenshot | Vinh | ⬜ | 3.1 | Day 7 |
| 4.2 | **Convergence-14 serializer unit-test suite** | `app/backend/tests/test_serializer.py` | Vinh | ⬜ | 2.10 | Every kinematic violation type has a fixture + verified Guardian verdict |
| 4.3 | Langflow renders at 1920x1080 | screenshot | Vinh | ⬜ | 4.1 | **Gate G7** |
| 4.4 | Deck draft v0 (3-min pitch script + storyboard) | `docs/3-min-pitch-script.md`, `docs/deck/storyboard.md` | **Stephen** | 🟡 | - | Pitch script v0 ✅ Day 1 EOD (pulled forward, 8-beat structure, 2:58 target, 13 mandatory edits roadmap). Deck storyboard pending Day 7. |
| 4.5 | LinkedIn DMs to two UK adaptive-driver competitors (adaptive-racing-programme drivers) | DM log | Stephen | ⬜ | - | **MOVED to Day 3** per Codex critique #4 + self-critique S4. UK charity response window is 7-14 business days; Day 7 was too late as first escalation. Day 3 send leaves 8 days for reply + integration. |
| 4.6 | Day-7 follow-up emails to Phase 1+2 non-responders | DM log | Stephen | ⬜ | - | Day 7 |
| 4.7 | Cache COA + timing-sheet parses at onboarding | `app/backend/apex/intake/cache.py` | Vinh | ⬜ | 1.1, 1.2 | Day 8 |
| 4.8 | Demo loop fits 60s on RTX 4060 | latency log | Vinh | ⬜ | 4.7 | **Gate G8** |
| 4.9 | Deck draft v1 with all 13 mandatory edits from Phase 4.5 synthesis | `docs/deck/v1.md` | Stephen | ⬜ | 4.4 | Day 8 |
| 4.10 | ~~June Challenge bridge architecture doc + slide~~ | RETIRED 2026-05-23 wave-38 | Stephen | ✂️ | - | OUT OF SCOPE: APEX is May Challenge only. June Challenge is a separate event with separate scope; no APEX surfaces reference it. `docs/june-challenge-bridge.md` deleted; deck slide retired; Q-005 closed as WONT-DO. |
| 4.11 | Q&A hostile rehearsal pass 2 | mental | Both | ⬜ | - | Day 8 |
| 4.12 | LangGraph node graph orchestration substrate (D-017; supersedes Langflow as runtime) | `app/backend/apex/orchestration/langgraph.py` | Vinh | ⬜ | 3.1, 4.7 | Day 7 (Sync Point 2 Day 4-6 orchestration end-to-end). Defines the state machine: ingestion -> RAG -> three-track forecast -> 8-tier SCP -> narrator -> tri-agent critic -> Mellea IVR repair -> Guardian audit -> frontend. **Acceptance criterion:** LangGraph state machine executes Sarah Reynolds fixture end-to-end without breaking; per-node latency logged in `logs/day-07-langgraph.md`. |
| 4.13 | MCP servers wired into LangGraph (D-017) | `app/backend/apex/mcp/servers.py` | Vinh | ⬜ | 4.12 | Day 7. Tool-call protocol bindings: COA-parser tool + timing-sheet tool + RAG tool + physics-projection tool + Guardian tool. **Acceptance criterion:** each MCP server responds to test invocation from LangGraph node; logs in `logs/day-07-mcp.md`. |
| 4.14 | ContextForge orchestration router (D-017) | `app/backend/apex/orchestration/contextforge.py` | Vinh | ⬜ | 4.12, 4.13 | Day 7. Routes between Granite Instruct + EAGLE-3 + aLoRA + tri-agent critic based on coaching-mode dispatch. **Acceptance criterion:** ContextForge routes 3 mode requests (adaptive-driver / veteran-team / grassroots) to the correct LLM path with mode-specific aLoRA hot-swap. |
| 4.15 | Langflow demo-facade export (D-017 demoted from runtime; screenshot-only on deck slide 6) | `app/backend/apex/langflow/graph.json` | Vinh | ⬜ | 4.12 | Day 7. Renders the LangGraph state machine as a Langflow-compatible JSON for visual demo on deck slide 6 + `/judges` page. **Acceptance criterion:** Langflow renders at 1920x1080 (existing G7 gate per row 4.3); D-017 demoting Langflow to facade does not change visual deliverable, only changes runtime path. |
| 4.16 | Granite Embedding R2 RAG setup (149M + 47M, hybrid dense/sparse; D-016 12-tool stack) | `app/backend/apex/rag/embedding.py` + `app/backend/apex/rag/store.py` | Vinh | ⬜ | 4.7 | Day 7. Indexes vehicle setup guides + racing-theory primer + adaptive-equipment specs + COA-parsed fixtures into a vector store; query-time retrieval feeds the narrator's coaching report. **Acceptance criterion:** RAG retrieval returns top-5 relevant chunks on 10 test queries within 200ms p95. |
| 4.17 | aLoRA hot-swap adapter for race-engineer intrinsic (D-019 item 2) | `app/backend/apex/instruct/alora.py` + `app/backend/apex/training/alora_finetune.py` | Vinh | ⬜ | 3.1 | Day 7. Activated LoRA fine-tune on Granite 4.1 8B base for race-engineer-intrinsic behavior; hot-swap into vLLM memory without KV-cache recomputation. **Acceptance criterion:** aLoRA hot-swap latency < 500ms; specialized + base-model coaching reports compared side-by-side on 3 fixture scenarios. |
| 4.18 | EAGLE-3 speculative decoding (D-019 item 4) | `app/backend/apex/instruct/eagle3.py` + vLLM config | Vinh | ⬜ | 3.1, 4.17 | Day 8. Draft-model speculative decoding alongside Granite 4.1 8B target; tightens coaching-report sub-budget to 15s inside 60s wall-clock per G8 row 4.8. **Acceptance criterion:** tokens/sec measured on 300-word coaching prompt; speedup vs base verified (EAGLE-3 paper reports 2.5-3.7x typical, up to ~5.9x on Llama-3.3-70B per D-019 item 4 annotation). |
| 4.19 | GEPA reflective prompt optimization via DSPy (D-019 item 3) | `app/backend/apex/prompts/gepa.py` + `app/backend/apex/prompts/optimized/` (version-tagged generations) | Vinh | ⬜ | 3.1, 4.16 | Day 8. DSPy-driven offline prompt evolution against APEX-Bench faithfulness metric. Output: optimized system prompts for narrator + tri-agent critic + Guardian BYOC rules. **Acceptance criterion:** pre/post benchmark on APEX-Bench faithfulness > 5% improvement; optimized prompts version-tagged for reproducibility per D-023 MLPerf protocol. |
| 4.20 | Tri-agent Agent-as-Judge critic loop (Physics-Critic + Pedagogy-Critic + Guardian-Safety; D-018, D-019 item 5) | `app/backend/apex/critics/physics_critic.py` + `app/backend/apex/critics/pedagogy_critic.py` + `app/backend/apex/critics/guardian_safety.py` + `app/backend/apex/critics/orchestrator.py` | Vinh | ⬜ | 3.1, 4.12 | Day 7. Three specialized critics run in parallel on draft coaching report. **Acceptance criterion:** all 3 critics produce verdict (approve/flag/reject) + reasoning trace; tri-agent agreement rate > 70% on 10 fixture coaching reports; flag triggers Mellea IVR repair per row 4.21. |
| 4.21 | IBM Mellea Instruct-Validate-Repair loop with `loop_budget = 3` (D-018) | `app/backend/apex/critics/mellea_ivr.py` | Vinh | ⬜ | 4.20 | Day 7. Mellea IVR repair triggered when any tri-agent critic flags. `loop_budget = 3` APEX-chosen value (UNVERIFIED-default; tunes Day-7 if convergence under-shoots per D-018 line 226 annotation). **Acceptance criterion:** repair-rate > 80% on 10 fixture flagged-coaching-reports; loop_budget exhaustion logged + downgrades final Guardian verdict to REVIEW. |

### Phase 5 - Demo + deploy (Days 9-10, both)

| # | Component | File(s) | Owner | Status | Deps | Notes |
|---|-----------|---------|-------|--------|------|-------|
| 5.1 | HF Space deploy (free tier) + cold-start fallback | `app/backend/Dockerfile`, HF Space config | Vinh | ⬜ | 4.7, 4.1 | Day 9. **Rollback path:** if HF free tier rejects the model footprint, fall back to OpenRouter Granite endpoint (Discord intel 2026-05-20: openrouter.ai/ibm-granite/granite-4.1-8b free tier no CC) or watsonx.ai free account; both already on the architecture-spec contingency ladder. Last resort: Colab notebook (row 5.2) becomes the demo URL. |
| 5.2 | `deliverables/apex-demo.ipynb` Colab notebook | deliverables/ | Stephen | ✅ | 5.1 | Pull-forward Day 9 → Day 2 PM. Skeleton ships canned Sarah Reynolds mock CoachingReport so layout reviewable end-to-end. Day 9 swap: live HF Space call + file pickers (google.colab.files.upload). **Rollback path:** if HF Space cold-start fails Day 9 dress-rehearsal, the canned cells stay in place and the notebook ships as a static demonstration (does not block submission). |
| 5.3 | Sim-rig WebSocket bridge for iRacing/ACC live telemetry | `app/backend/apex/sim_bridge.py` + `app/frontend/components/SimRigStream.tsx` | Stephen + Vinh | 🟡 | 5.1 | Frontend slice + /sim-rig route ✅ Day 2 PM (Stephen, simulated mode, ring-buffer reducer + exponential reconnect). Vinh-side `app/backend/apex/sim_bridge.py` Day 9. **Rollback path:** if Vinh-side WebSocket slips Day 9, frontend stays in simulated mode for the demo video (the render path is identical between simulated and live modes per SimRigStream.tsx). |
| 5.4 | Demo video v0 (raw screen capture) + pitch script locked | `deliverables/demo-video-v0.mp4`, `docs/3-min-pitch-script.md` | Stephen | ⬜ | 4.9 | Day 9 |
| 5.5 | Dress rehearsal 1 (3-min pitch + 5-min hostile Q&A) | recorded | Both | ⬜ | 5.4 | Day 9 |
| 5.6 | v0 plays + HF loads < 90s + Colab executes + sim-rig streams | gates checklist | Both | ⬜ | 5.1-5.5 | **Gate G9** |
| 5.7 | Reproducibility metadata footer on every demo output | `app/frontend/components/ProvenanceFooter.tsx` | Vinh | ⬜ | 3.1 | Model versions + COA section IDs + Guardian audit ID + commit SHA |
| 5.8 | Vercel frontend deploy | `vercel.json` + `docs/vercel-deploy-runbook.md` | Stephen | 🟡 | 0.14 | Pull-forward Day 9 → Day 2 PM. `vercel.json` config + iad1 region + security headers ✅. `docs/vercel-deploy-runbook.md` first-time setup + Day 9 dress + Day 11 apex-one-black.vercel.app domain swap + rollback + env-var inventory ✅. **Rollback path:** `vercel rollback <deployment-url>` or dashboard Promote-to-Production on any prior green; metadataBase fallback in `app/layout.tsx` covers domain swap failure. Day 9 manual deploy: `vercel --prod` browser-OAuth from Stephen's machine. |
| 5.9 | Demo video v1 production take + voiceover + thumbnail | `deliverables/demo-video.mp4`, `deliverables/thumbnail.png` | Stephen | ⬜ | 5.5 | Day 10 |
| 5.10 | 30-second highlight clip | `deliverables/demo-video-30s.mp4` | Stephen | ⬜ | 5.9 | Day 10 |
| 5.11 | Dress rehearsal 2 with hostile Q&A using live sim-rig | recorded | Both | ⬜ | 5.9 | Day 10 |
| 5.12 | v1 video <= 3:00, audio clean, 1080p, sim-rig stable | gates checklist | Both | ⬜ | 5.9-5.11 | **Gate G10** |
| 5.13 | APEX Lite contingency decision (default: NO, ship full) | `docs/decision-log.md` D-Lite + `docs/apex-lite-contingency.md` | Both | ⬜ | 5.6 | Day 10 morning. **Coupling:** this row is the LATE trigger (Day-9 dress-rehearsal failure on 2+ Gate G9 items per Q-004). The EARLY trigger (Day-2 noon ET, Vinh-unresponsive scenario) is Q-007 with the same execution path. Both reference `docs/apex-lite-contingency.md` for the Lite scope (drop sim-rig + Colab live mode; keep core PhysicsTTM loop + Sarah Reynolds canned demo + frontend coaching UI + Guardian audit). |
| 5.14 | BeMyApp 1920x600 banner asset (editorial-paddock palette + APEX wordmark + tagline + hero visual) | `deliverables/bemyapp-banner-1920x600.png` + renderer at `app/frontend/lib/bemyapp-banner.tsx` (Next ImageResponse) + route handler at `app/frontend/app/bemyapp-banner/route.ts` + brand brief at `docs/banner-brand-brief.md` + render script at `app/frontend/scripts/render-banner.tsx` + shared brand-fonts util at `app/frontend/lib/brand-fonts.ts` | Stephen | ✅ | - | Shipped Day 2 night-late. Editorial-magazine-cover direction (typography-first, warm cream paper, Fraunces italic 260pt APEX wordmark, single confident racing-line SVG curve, masthead + footer racing-green strips with amber hairline accents). DELIBERATE contrast with the universal dark-cinematic banner aesthetic observed across competing projects in the BeMyApp gallery (calibration kept in private memory). Renderer fetches Fraunces + IBM Plex Sans + IBM Plex Mono from Google Fonts CDN at render time so no binary font files commit. **Acceptance criteria (wave-22 cold-review WARN #4 closure):** PNG exactly 1920x600 (verify via `file` command); file size 50-500KB; PNG magic-byte signature `89 50 4E 47 0D 0A 1A 0A` valid (render script enforces); zero em-dash + zero AI-tone blocklist hits in visible copy; Fraunces italic renders at 260pt without fallback. **Rollback path (wave-22 cold-review WARN #5 closure):** the committed PNG IS the canonical artifact uploaded at submission; the renderer + route + script are iteration-only. Day-9 re-render fails -> upload the previously committed PNG. Google Fonts CDN unavailable at render time -> pre-mortem row 47 documents this risk; the committed PNG is the fallback. If both the committed PNG AND the Google Fonts route fail, vendor Fraunces + IBM Plex font files locally to `app/frontend/lib/fonts/` and switch `brand-fonts.ts` to read from disk; ~500KB binary commit; restores submission. |
| 5.15 | Collect + log 3 May Challenge gallery example submissions (calibration pass) | `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/reference_competitors_calibration.md` | Stephen | ✅ | - | Stephen flagged 2026-05-21 PM that 3 projects are already posted in the May Challenge gallery; wave-21 captured all 3 in depth + wave-21 epilogue added the 4th (RaceMind AI). Calibration complete: (a) competitor framing generally F1-elite or able-bodied amateur with no one in our adaptive lane, (b) banner aesthetic universally dark-cinematic, (c) panel tightness varies (NeuroPit + PitWall ship 3-paragraph panels at NeuroPit-depth, AI Race Strategist + RaceMind ship 1 IBM tool), (d) APEX uncontested in the adaptive + veteran + grassroots lane. **Acceptance criteria (wave-22 cold-review WARN #6 closure):** reference memory captures 4 entries with URL + screenshot path + IBM-tool count + key strengths + key weaknesses we can exploit + 1-line takeaway for APEX positioning. APEX takeaways already informed wave-21 BeMyApp panel rewrite to NeuroPit-depth + wave-22 claim softening to honest framing. |
| 5.16 | WebGPU Granite 4.0 Nano 350M edge integration (D-019 item 1 + D-021 scope cut to Newton friction-ellipse projector) | `app/frontend/lib/webgpu-nano.ts` + `app/frontend/components/EdgeSummary.tsx` + edge `app/frontend/lib/newton-friction-ellipse.ts` (30-line server-authoritative-reconnect projector) | Stephen | ⬜ | 5.8 | Day 9. Loads Granite 4.0 Nano 350M ONNX weights into browser via Transformers.js + WebGPU. In-browser path runs the 30-line Newton friction-ellipse projector for offline edge consistency per D-021 (no mechanical recommendations offline; server overwrites on reconnect). **Acceptance criterion:** Nano loads + emits paddock summary in browser within 90s cold-start on Chrome 121+ desktop; pre-load 1.5GB WebGPU memory check + server-only fallback path per pre-mortem row 61. |

### Phase 6 - Submission package (Day 11, both)

| # | Component | File(s) | Owner | Status | Deps | Notes |
|---|-----------|---------|-------|--------|------|-------|
| 6.1 | Final deck PDF rendered via Playwright HTML to PDF | `docs/deck.pdf` | Stephen | ⬜ | 4.9 | Day 11 |
| 6.2 | `apex-one-black.vercel.app/judges` one-page judges-tour landing | `app/frontend/app/judges/page.tsx` | Stephen | ✅ | 5.8 | Pull-forward Day 11 → Day 1 EOD. TOC: /analyze + /sim-rig + 3-min video + 30s clip + deck + GitHub + methodology trace + architecture-spec + pre-mortem + 8-tool IBM stack grid + Q&A 5 cards + team. Wave-19 added /sim-rig resource tile. |
| 6.3 | `apex-one-black.vercel.app/status` live demo status dashboard | `app/frontend/app/status/page.tsx` | Stephen | ✅ | 5.1, 5.8 | Pull-forward Day 11 → Day 1 EOD. Hero + StatusLiveIndicator (GitHub Actions API polling, ApiError ErrorKind discriminator, 403/429 rate-limit branch, Retry button) + static signals + pending-indicator placeholders for Day 9 HF Space + Day 11 Vercel + Day 10 demo video. |
| 6.4 | `docs/methodology.md` (Sookra Methodology trace) | docs/ | Stephen | 🟡 | - | seven phases: P1 recon → P2 murder-board + judge-sim → P3 concept-lock → P4 deep-research → P5 PhysicsTTM mitigation → P6 build → P7 submission. Phase 6+7 expansion + Claude-Memory cross-references ✅ Day 2 PM. **Acceptance criterion:** Day 11 final lock requires (a) every phase has dated artifact list, (b) every gate G1-G11 has pass/fail trace, (c) cross-references to all Claude Memory session notes from waves 1-N+1, (d) AI-tone sweep clean. |
| 6.5 | `docs/pre-mortem.md` final polish | docs/ | Both | 🟡 | 1.7 | Live with 48+ entries (15+ ✅ mitigations, 3 accepted residual risks, row 45 📘 galaxy-tier compounding lesson). Day 11 final polish remains. **Wave-22 additions cross-referenced from this row (closes wave-22 cold-review WARN #7):** row 46 BeMyApp default-placeholder risk (✅ mitigated by row 5.14 banner ship), row 47 Google Fonts CDN render-time dependency (⚠ accepted for iteration; row 5.14 rollback path documents the vendor-local-fonts fallback), row 48 BeMyApp panel depth under-shipping (✅ mitigated by wave-21 NeuroPit-depth rewrite of `deliverables/bemyapp-submission-payload.md`). **Acceptance criterion:** Day 11 final lock requires (a) every entry has Type/Trigger/Mitigation/Status fields filled, (b) every ✅ entry cites a commit SHA or doc path proving the mitigation shipped, (c) every 🟡 entry has a Day-11 close-out plan or explicit residual-risk acceptance. |
| 6.6 | `docs/cost-audit-2026-05-30.md` (usage-audit skill run) | docs/ | Stephen | ⬜ | - | Session cost + token spend. **Acceptance criterion:** Day 11 evening run via `codeburn status` + `codeburn optimize` outputs committed verbatim; if any single project line exceeds $20/day, surface as a pre-mortem entry. |
| 6.7a | `paper/apex-neurips-workshop-2026.md` §1-§3 + §5-§13 DRAFT (readable quality) | paper/ | **Stephen** | 🟡 | 4.2, 5.7 | Publication-readable draft ✅ across waves 22-25 (consolidated closure logs in `docs/wave-22-cold-review-findings.md`, `docs/wave-23-cold-review-findings.md`, `docs/wave-24-cold-review-findings.md`, `docs/wave-25-cold-review-findings.md`). **Acceptance criterion:** Day 11 readable by an external researcher in one pass; passes (a) Abstract <=250 words, (b) §3 Method names all three layers' math equations with the Layer 2 two-stage projection-and-audit split correctly identified, (c) §5 Limitations honest about COA fixture synthesis + retraining-free claim scope, (d) §13 References has at least 10 cited works including the Granite-TTM NeurIPS 2024 paper (verified arXiv/proceedings sources per the Chrosniak et al. 2023 + Agrawal et al. 2019 + Ekambaram et al. 2024 citation convention; verified ibm-granite Hugging Face IDs). |
| 6.7b | `paper/apex-neurips-workshop-2026.md` §4 Experiments cell values | paper/ | Vinh | ⬜ | 2.9a, 2.9b, 2.9c, 2.11 | Day 9-10. Vinh fills Table 1 / Table 2 / Table 3a-c cell values once Stage 1 + Stage 2 + Convergence-14 benchmarks land. **Acceptance criterion:** Table 2 has at least one benchmark (TTM-zero-shot lap-time MAE vs seasonal-naive on at least one FastF1 holdout) with placeholder cells removed. |
| 6.7c | `paper/physics-ttm-methods.md` companion methods spec (Perplexity-research adoption per Vinh's adoption-design §4 commit 3) | paper/ | Vinh | ⬜ | 6.7a | Day 8 EOD recommended so paper §3 can cite the methods doc during Day 11 paper polish. Adoption: copy `physics-ttm-neurips-methods.md` to `paper/physics-ttm-methods.md`; strip §"Methods claim to defend" framing + §"Recommended next file tasks" scaffolding; em-dash sweep with `replace_all`. **Acceptance criterion:** `git grep -c "-" paper/physics-ttm-methods.md` returns 0; source-of-truth check passes (friction ellipse + jerk bound + COA simultaneity + bicycle model all agree across methods doc and `convergence-fixtures.ts` + `architecture-spec.md`); 5 equations render cleanly in markdown preview. See `docs/plans/2026-05-22-physics-ttm-methods-adoption-design.md` for adoption rationale + section-strip list. |
| 6.8 | README.md final polish | repo root | Stephen | 🟡 | 5.8 | Pull-forward through Day 2 night-late closures (closure log split across waves 22-25 findings docs). Wave-25 closures shipped: Differentiator #2 two-stage rewrite + Mermaid sync to `docs/architecture-diagram.mmd` two-stage + first-claim §5.3-bounded softening + Track Titan/Trophi.ai softened to evidence-backed framing + commit count 197+ -> 201+ + ai-tone-policy forward-ref removed. Day 11 final polish remaining: real demo URL + Cloud Run links + final AI-tone re-sweep + final commit-count bump pre-submit. |
| 6.9 | AI-tone sweep (`scripts/ai-tone-sweep.sh`) | scripts/ | Stephen | ⬜ | 6.1, 6.8 | Zero em-dash + zero blocklist hits across README, deck, video transcript, emails |
| 6.10 | All §17 external-tool passes | logs | Both | ⬜ | - | pre-landing-review, claude-council, three-brain (Codex + Gemini), architecture-reviewer, repo-sentinel, NotebookLM gap pass 2 |
| 6.11 | Q&A final hostile pass (evening) | mental | Both | ⬜ | - | Cold + timed; each card < 30s |
| 6.12 | Every §Pre-submit Checklist (below) item green | gates checklist | Both | ⬜ | 6.1-6.11 | **Gate G11** |
| 6.13 | APEX-Bench public benchmark release (50-lap multi-class + LIPS 4-axis ablation; D-026) | `apex-bench/README.md` + `apex-bench/data/` (Sarah Reynolds + 5 FastF1 holdouts) + `apex-bench/eval/Dockerfile` + `apex-bench/LICENSE` (Apache 2.0) | Vinh | ⬜ | 6.7b, 2.17, 2.18 | Day 11 (Sync Point 4 Day 10-12 final evaluation lock). Dockerized eval harness reproduces results within MLPerf-style tolerance bands per D-023 (±5% on lap-time MAE, ±2 pp on FCVR/COBR). **Acceptance criterion:** 50-lap multi-class dataset with human ground-truth labels + 4-axis ablation table populated (zero-shot TTM / soft-loss / APEX hard projection / three-track + 8-tier full stack); deterministic seed locks + variance report (RTX 4060 vs Apple M2) committed; Apache 2.0 release alongside paper. |
| 6.14 | LIPS 4-axis evaluation harness (Accuracy + Physical Compliance + Industrial Readiness + OOD Generalization; D-026) | `app/backend/apex/eval/lips_harness.py` + `apex-bench/eval/lips_runner.py` | Vinh | ⬜ | 2.17, 2.18, 2.19 | Day 9. Runs the 4-axis ablation against Sarah Reynolds canned fixture + 5 FastF1 holdouts. **Acceptance criterion:** all 4 axis values populate without error; tables 1 + 2 + 3a-c in paper §4 receive cell values per row 6.7b; LIPS metric definitions sourced from D-026 + cross-referenced in paper §4. |

### Phase 7 - Submit (Day 12, both)

| # | Component | File(s) | Owner | Status | Deps | Notes |
|---|-----------|---------|-------|--------|------|-------|
| 7.1 | Final smoke test (demo, video, Colab, fresh-clone, sim-rig) | gates checklist | Both | ⬜ | 6.12 | Morning |
| 7.2 | BeMyApp form submit + tick every eligible track checkbox | submission proof | Stephen | ⬜ | 7.1 | Afternoon |
| 7.3 | Devpost cross-post if applicable | submission proof | Stephen | ⬜ | 7.2 | Afternoon |
| 7.4 | IBM Consulting cold email referencing Scuderia Ferrari case study | sent log | Stephen | ⬜ | - | Afternoon |
| 7.5 | Post-submission Claude Memory write + engineering-retro | obsidian + docs | Stephen | ⬜ | 7.2 | Evening |
| 7.6 | Submitted by 21:00 ET (3-hour buffer to hard 11:59 PM ET deadline) | submission timestamp | Stephen | ⬜ | 7.2 | **HARD DEADLINE** |

---

## Active gates (wave-35 E.1+E.2 enumeration)

Gate-map definitions. Each `G-<Phase>.<RowNumber>` cross-references the PLAN phase row that owns the acceptance criterion. Verification artifact location is the row's Notes column (Vinh-side gates log to `logs/day-NN-<gate>.md`; Stephen-side gates produce CI artifacts or `deliverables/`).

**Phase 0 + Phase 2 single-letter gates (wave-22 baseline):**

- **G1:** TTM smoke test. Row 0.13 + vinh-backend-plan §Phase 0 row 0.7. Acceptance: Granite TimeSeries TTM r2.1 loads on RTX 4060 + zero-shot inference on 5-lap FastF1 export logs in `logs/day-03-ttm-smoke.md`. Owner: Vinh.
- **G1b:** Granite 4.1 8B Q4 GGUF latency bench. vinh-backend-plan §Phase 0 row 0.8. Acceptance: tokens/sec on 300-word coaching-report prompt logged in `logs/day-03-granite-latency.md`. Owner: Vinh.
- **G1c:** Three-track ensemble zero-shot smoke (D-010). Rows 2.15 + 2.16. Acceptance: Granite FlowState 9.1M + Amazon Chronos-2 21-quantile band each render within 30s on Sarah Reynolds fixture per `logs/day-04-g1c-three-track-smoke.md`. Owner: Vinh.
- **G3:** V1 NumPy validator catches 5 impossibilities + approves 5 valid + round-trip serializer assertion. Row 2.2. Owner: Vinh.
- **G4:** Zero-shot TTM vs seasonal-naive MAE bake-off on FastF1 holdouts. Row 2.6 (bumped to Day-2 parallel spike per Codex critique #2). Owner: Vinh.
- **G5:** Granite Guardian catches same 5 impossibilities as validator. Row 2.11. Owner: Vinh.
- **G5.5:** Physics-confidence detector (D-024). Row 2.19. Acceptance: Mahalanobis distance flags Pacejka mismatch on injected-incorrect-.tir fixture; Guardian downgrades SAFE → REVIEW; calibration threshold = 95th-percentile from Sarah fixture distribution per pre-mortem row 59. Owner: Vinh. Day 6 EOD.
- **G6:** Sarah end-to-end coaching report produces provenance footer + audit_id non-None + every citation resolves to fixture COA. Row 3.4. Owner: both. Day 6.
- **G6.5:** cvxpylayers Windows install fallback. vinh-backend-plan §Phase 2 (Council fix). Owner: Vinh.
- **G7:** Langflow visualisation renders at 1920x1080. Row 4.3 (D-017 demoted Langflow to demo facade per wave-30; visual deliverable unchanged). Owner: Vinh.
- **G8:** Demo loop fits 60s wall-clock on RTX 4060. Row 4.8 (D-019 item 4 EAGLE-3 tightens sub-budget to 15s within the 60s envelope). Owner: Vinh.
- **G9:** Dress-rehearsal 1 gates checklist (v0 plays + HF loads < 90s + Colab executes + sim-rig streams). Row 5.6. Owner: both. Day 9.
- **G10:** v1 video <= 3:00 + audio clean + 1080p + sim-rig stable. Row 5.12. Owner: both. Day 10.
- **G11:** Pre-submit checklist (PLAN §Pre-submit Checklist). Acceptance: all 10+ checklist items pass + CI green per-job + zero em-dash + zero AI-tone blocklist hits + per-track entry verification. Owner: both. Day 11.

**Phase 2 wave-30 architecture gates (D-009 through D-016):**

- **G-2.14:** Polyphase phase-stream decomposition (D-011 multi-frequency coexistence). Row 2.14. Acceptance: `(B, 50, 30, 14)` Path B tensor + `(B, 30, 14)` Path A tensor produced from Sarah Reynolds raw telemetry without information loss; `test_polyphase.py` verifies bit-exact round-trip. Owner: Vinh.
- **G-2.15:** Granite FlowState Track 2 integration (D-010). Row 2.15. Acceptance: FlowState 9.1M forecast renders within 30s on RTX 4060; tensor shape matches Sync Point 1. Owner: Vinh.
- **G-2.16:** Amazon Chronos-2 Track 3 integration (D-010). Row 2.16. Acceptance: 21-quantile bands render as `(B, 30, 14, 21)` tensor on Sarah Reynolds fixture; empirical-coverage calibration on 5-lap FastF1 holdouts. Owner: Vinh.
- **G-2.17:** Three-track ensemble fusion (D-010). Row 2.17. Acceptance: ensemble MAE beats best single track on at least 3 of 5 FastF1 holdouts; divergence > 2 sigma triggers TTM-only fallback per pre-mortem row 57. Owner: Vinh.
- **G-2.18:** 8-tier physics SCP outer-loop convergence (D-012 + D-015). Row 2.18. Acceptance: all 8 tiers linearize without error on Sarah Reynolds fixture across the 30-step horizon; per-tier convergence-trace logged for D-027 prototype. Owner: Vinh.
- **G-2.19:** Physics-confidence detector calibration (D-024; same surface as G5.5). Row 2.19. Owner: Vinh.
- **G-2.20:** IBM TSPulse anomaly detector (D-016). Row 2.20. Acceptance: TSPulse anomaly tensor produced on Sarah Reynolds polyphase output; clean-fixture low-anomaly + injected-glitch high-anomaly sanity check passes. Owner: Vinh.

**Phase 4 wave-30 orchestration gates (D-017 + D-018 + D-019):**

- **G-4.12:** LangGraph stateful state-machine graph (D-017). Row 4.12. Acceptance: state machine executes Sarah Reynolds fixture end-to-end; per-node latency in `logs/day-07-langgraph.md`. Owner: Vinh.
- **G-4.13:** MCP tool-routing (D-017). Row 4.13. Acceptance: each MCP server responds to test invocation from LangGraph node; logs in `logs/day-07-mcp.md`. Owner: Vinh.
- **G-4.14:** IBM ContextForge orchestration router (D-017). Row 4.14. Acceptance: 3 coaching-mode requests (adaptive / veteran / grassroots) route to correct LLM path with mode-specific aLoRA hot-swap. Owner: Vinh.
- **G-4.15:** Langflow demo facade export (D-017 demoted; same visual surface as G7). Row 4.15. Acceptance: LangGraph state machine renders as Langflow-compatible JSON for deck slide 6 + /judges. Owner: Vinh.
- **G-4.16:** Granite Embedding R2 RAG layer (D-016). Row 4.16. Acceptance: hybrid dense + sparse retrieval returns top-5 relevant chunks on 10 test queries within 200ms p95. Owner: Vinh.
- **G-4.17:** aLoRA hot-swap adapter (D-019 item 2). Row 4.17. Acceptance: aLoRA hot-swap latency < 500ms; specialized + base-model coaching reports compared side-by-side on 3 fixtures. Owner: Vinh.
- **G-4.18:** EAGLE-3 speculative decoding (D-019 item 4). Row 4.18. Acceptance: tokens/sec measured on 300-word coaching prompt; speedup vs base verified (paper reports 2.5-3.7x typical). Owner: Vinh.
- **G-4.19:** GEPA reflective prompt optimization via DSPy (D-019 item 3). Row 4.19. Acceptance: pre/post APEX-Bench faithfulness > 5% improvement; optimized prompts version-tagged per D-023 MLPerf protocol. Owner: Vinh.
- **G-4.20:** Tri-agent Agent-as-Judge critic loop (D-018 + D-019 item 5). Row 4.20. Acceptance: all 3 critics emit verdict + reasoning trace; tri-agent agreement rate > 70% on 10 fixture coaching reports. Owner: Vinh.
- **G-4.21:** IBM Mellea Instruct-Validate-Repair (D-018). Row 4.21. Acceptance: repair-rate > 80% on 10 fixture flagged-coaching-reports with `loop_budget = 3`; budget exhaustion logged + downgrades final Guardian verdict to REVIEW. Owner: Vinh.

**Phase 5 wave-30 edge gate (D-019 item 1 + D-021):**

- **G-5.16:** WebGPU Granite 4.0 Nano 350M edge inference (D-019 item 1 + D-021 server-authoritative reconnect scope cut). Row 5.16. Acceptance: Nano loads + emits paddock summary in browser within 90s cold-start on Chrome 121+ desktop; 30-line Newton friction-ellipse projector runs offline; server overwrites on reconnect (no mechanical recommendations offline). Owner: Stephen.

**Phase 6 wave-30 benchmark gates (D-026):**

- **G-6.13:** APEX-Bench public benchmark release. Acceptance: 50-lap multi-class benchmark + Apache 2.0 release alongside paper; reproducibility harness lands in `app/backend/apex_bench/`; deterministic seed locks committed alongside fixture data; RTX 4060 vs Apple M2 variance report published with tolerance bands per D-023 MLPerf protocol; PLAN row 6.13 acceptance criteria all satisfied. Owner: Vinh + Stephen.
- **G-6.14:** LIPS 4-axis ablation table. Acceptance: 4-axis ablation (frozen-vs-fine-tuned + 8-tier-vs-3-tier + tri-agent-vs-single + Guardian-on-vs-off) lands in paper §4.3 with Sarah Reynolds + FastF1 holdout numbers. Owner: Vinh + Stephen.

**D-027 Day-3 SCP go/no-go gate** is the single most important checkpoint in the 12-day build (per `docs/decision-log.md` D-027). Not numbered as a `G-<Phase>.<Row>` because it sits ABOVE the Phase 2 gate ladder. Phase 2 G-2.18 + downstream Phase 4-6 gates all depend on D-027 PASS or one of the fallback ladder rungs (per D-028 galaxy-tier vs APEX Lite ship-floor pattern lock).

---

## Coordination Protocol

1. **Before starting a task:** set status to 🟡 with timestamp in Notes, commit `PLAN.md` only, push. This is your lock.
2. **After finishing:** flip to ✅, commit `PLAN.md` only, push.
3. **If blocked:** set to ⛔, add a one-line note explaining why. Ping the other person.
4. **Before starting ANY task:** run `git pull` and check this file. If the other person has 🟡 on overlapping files, coordinate first.
5. **Hotfixes:** skip the protocol - commit the fix directly, update PLAN.md after. Don't let process block a real emergency.
6. **PLAN.md commits are atomic.** Never bundle a status update with code changes. One-line status change → commit → push.
7. **Commit messages:** Conventional Commits (mirrors Trace/Hometown).
   - `feat(backend): add ProfileService with FIPS lookup`
   - `feat(frontend): scaffold CoachingReport with corner-by-corner cards`
   - `fix(physics): tighten friction-ellipse bound for wet-track scenarios`
   - `chore(plan): claim 2.1 🟡 Vinh`
   - `docs(plan): complete 1.1 ✅`
   - `docs(plan): mark 1.4 ✅ Vinh PII redaction complete`
   - `⚠️ CONTRACT: change ttm-to-physics tensor shape - adds simultaneity bit` (announce in chat first)
8. **Handoffs:** when your part is done and the other person picks up, add `→ Vinh` or `→ Stephen` in the Notes column.
9. **Stale lock TTL = 4 hours (hackathon mode).** A 🟡 task requires a timestamp in Notes. If no commit happens within 4 hours, the lock is stale - the other person can claim it. Ping the original owner first.
10. **Contract changes require announcement.** Anything in the Shared Contracts table below must be announced in chat BEFORE committing. Use `⚠️ CONTRACT` prefix. Contract drift is the #1 cause of integration bugs.
11. **NO git hooks. NO CLI wrappers. NO commit-msg validators.** `.git/hooks/` must contain only `.sample` defaults. Verified Day 1 Stephen-side. Vinh verifies post-clone (`ls -la .git/hooks/` should show only `*.sample` files). If a tool wants to install Husky / lefthook / pre-commit, DECLINE.
12. **Push after every commit.** Push-immediately rule per global CLAUDE.md atomic-commit discipline.

---

## Shared Contracts

> Don't drift these without an announcement + commit prefix `⚠️ CONTRACT`.

| Contract | Owner | Consumer | Definition |
|----------|-------|----------|------------|
| Telemetry CSV input schema | Vinh | Vinh (intake), Stephen (mocks + upload UI) | Channels: `t` (sec), `throttle_pct`, `brake_pa`, `steering_rad`, `rpm`, `lat_g`, `long_g`, `speed_mps`, `gear`. Raw at 50 Hz. Aggregated to 1-Hz mini-sectors before TTM. |
| FIA COA parsed JSON shape | Vinh | Vinh (services), Stephen (UI) | `{driver: {name, impairment, license_class}, vehicle: {make, model, homologation}, adaptations: {throttle: {...}, brake: {...}, clutch: {...}, steering: {...}, gearshift: {...}, seat: {...}, headrest: {...}, driver_equipment: {...}, chassis: {...}}, coa_simul_permitted: bool, brake_travel_adjustable_mm?: [number, number], fia_section_refs: [...]}`. The COA simultaneity flag is hoisted to top-level (NOT inside a `simultaneity_envelope` sub-object) because it is the LOAD-BEARING flag of the entire project. Always cite FIA Article + paragraph IDs. Wave-22 BLOCKER B1: corrected from the legacy sub-object shape to match `app/shared/types.ts` `FIACoa` SSOT. |
| Timing-sheet parsed CSV shape | Vinh | Stephen | `lap, sector_1_time, sector_2_time, sector_3_time, lap_time, gap, position, tyre, in_pit`. |
| TTM input tensor shape | Vinh | Vinh | `(batch, context_length=30, num_channels=14)` at 1 Hz. **Wave-30 supersedes wave-22:** horizon expanded 24 → 30 mini-sectors (finer 8-tier SCP convergence grid per D-010 + Appendix W30); channels expanded 9 → 14 (8 telemetry + 1 COA flag + 5 wave-30 physics additions per D-016: fz_total + mu_v + pitch_rad + bank_rad + yaw_rate). Wave-22 BLOCKER B2 history: was previously 128 (stale blueprint carry); corrected to 24 wave-22; reconciled to 30 wave-30. Existing wave-22 fixtures + tests pad with zeros on channels 9-13 + extend time axis to 30 by repeating last mini-sector value; D-027 SCP gate validates schema end-to-end. |
| Physics-projection output | Vinh | Vinh (Guardian + Instruct) | `(corrected_tensor: same shape as input, qp_violation_log + feasibility_log: List[{step, stage: "qp" \| "feasibility", type, severity, msg}])`. Two-stage architecture per wave-24 cold-review B1+B2: Stage 1 convex QP emits `qp_violation_log` for friction/Euler/jerk bound hits; Stage 2 feasibility filter emits `feasibility_log` for bicycle-audit + COA-simultaneity violations. Concatenated for downstream Guardian audit; serializer (Convergence-14) treats both classes uniformly. |
| Guardian audit JSON | Vinh | Stephen (UI) | `{verdict: "approve" \| "flag" \| "reject", reasoning_trace: [...], blocked_recommendations: [...]}`. |
| Coaching-report JSON (API response) | Vinh | Stephen | `{corners: [{name, sector, current_delta_s, recommendation, citations: [{coa_section, fia_article}]}], tuning_delta: {parameter, current, recommended, unit, citation}, forecast: {next_session_envelope, confidence_band}, audit: <Guardian JSON>}`. |
| `POST /api/analyze` request | Stephen | Vinh | `{telemetry_csv: <file>, coa_pdf: <file>, debrief: <text>, driver_id: <str>}`. |
| `GET /api/sim-rig/stream` (WebSocket) | Vinh | Stephen | Live frames of telemetry channels at 10 Hz from iRacing/ACC. |
| Em-dash policy in prose | both | UI strings, deck, video transcript, emails | BANNED in prose. Substitutes per global CLAUDE.md table. Exempt: table column separators, code blocks. |
| FIA citation format | both | UI strings, deck | `FIA Appendix L, Article 18.3.2(c)` format. Never invent article numbers; verify via tool. |

---

## Scope tiering (Core 6 + Stretch 10, re-tiered Day 1 EOD)

Original "Galaxy-Tier Inclusions" 16-item list was re-tiered after Codex independent plan-critique flagged the D-003 / D-007 contradiction. Core 6 are ship-blockers at 95% quality. Stretch 10 ship at 70% if Core is green; cut without ceremony if Core slips.

**Core 6** (ship-blocker, 95% quality):

1. **C1** End-to-end Sarah Reynolds canned demo (Gate G6, Day 6, Both)
2. **C2** 3-minute submission video with mocked-or-live fallback path (Day 10, Stephen)
3. **C3** `docs/pre-mortem.md` running journal (Day 1 EOD ✅ started, Day 11 polish, Stephen)
4. **C4** `docs/methodology.md` Sookra trace (Day 11, Stephen)
5. **C5** Multi-track BeMyApp submission (Day 12 afternoon, Stephen)
6. **C6** All §17 external-tool passes (Day 11, Both)

**Stretch 10** (70% quality, cut without ceremony if Core slips):

S1 live sim-rig in video (Day 9-10), S2 real beta-tester quote (Day 3 DM escalation now, Day 8 anonymize fallback), ~~S3 June Challenge bridge slide~~ RETIRED 2026-05-23 wave-38 (out of scope: APEX is May Challenge only), S4 Colab notebook (Day 9), S5 `/judges` landing page (Day 11), S6 `/status` dashboard (Day 11), S7 30s highlight clip (Day 10), S8 reproducibility metadata footer (Day 10), S9 cost-audit doc (Day 11), S10 NeurIPS Workshop paper draft (Day 11, Vinh).

**Always-ship trivials:** IBM Consulting cold email (Day 12, Stephen, <30 min), daily BeMyApp community devlog (every evening, Stephen, 90 sec).

Cuts are logged in `docs/decision-log.md` as dated entries. No silent removal.

---

## Decisions (locked)

> Reference by D-### in commits and code comments. Do not re-litigate without escalation. Full rationale: `docs/decision-log.md`.

- **D-001 (2026-05-20):** Project renamed PIT WALL → APEX. BeMyApp collision.
- **D-002 (2026-05-20):** Monorepo, public Day 1, Apache 2.0.
- **D-003 (2026-05-20):** Galaxy-tier scope. Nothing post-hackathon. Memory rule installed.
- **D-004 (2026-05-20):** Research-tool discipline. Context7 → tavily → firecrawl → EXA → WebFetch before any factual claim.
- **D-005 (2026-05-20):** State-sync protocol. Every session ends with Claude Memory write.
- **D-006 (2026-05-20):** No git hooks. Manual coordination only (mirrors Trace + Hometown). `.git/hooks/` stays defaults-only.
- **D-007 (2026-05-20):** Quality over speed. Tool-inventory audit BLOCKING before any non-trivial task. Use every available skill + agent + MCP + connector.
- **D-008:** Reserved slot (D-008 placeholder for an APEX-Lite-fallback formalisation that was instead promoted directly to D-028 wave-31A; numbering preserved for audit-trail continuity).
- **D-009 (2026-05-22 wave-30):** Wave-30 Maximal Architecture Lock umbrella per 12-hour multi-model deep-research synthesis (Perplexity + Gemini + ChatGPT + Claude + NotebookLM). V2/V3/post-hackathon labels RETIRED across the project.
- **D-010 (2026-05-22 wave-30):** Three-track forecasting ensemble: Granite TTM r2.1 channel-mix decoder fine-tune + Granite FlowState (9.1M sampling-rate-invariant SSM) + Amazon Chronos-2 (21-quantile probabilistic baseline).
- **D-011 (2026-05-22 wave-30):** Multi-frequency coexistence: 1 Hz aggregation + polyphase decomposition (50 phase streams) + FlowState rate-invariance. 50 Hz feasible-lift projector as unifier.
- **D-012 (2026-05-22 wave-30):** Unrolled SCP outer loop fixed 3 iterations wrapping convex QP inner stage. First-order Taylor linearisation for 8-tier non-convex physics.
- **D-013 (2026-05-22 wave-30):** cvxpylayers locked as the differentiable optimisation layer (qpth lacks SOCP; theseus only applies soft constraints).
- **D-014 (2026-05-22 wave-30):** Numerical hazard resolution: Tikhonov damping ε = 0.5 m/s + tanh saturation below 1 m/s for v_x near-zero gradient singularity; steady-state algebraic substitution for stiff-ODE transient tire dynamics.
- **D-015 (2026-05-22 wave-30):** 8-tier physics in-scope: 3D track geometry + aerodynamics + adaptive hand-controls + double-track load transfer + tire thermal + transient + full Pacejka combined-slip + kinematic integration.
- **D-016 (2026-05-22 wave-30):** 12-tool Granite stack (was 8): added Granite Embedding R2 + IBM TSPulse + Granite FlowState + Granite 4.0 Nano.
- **D-017 (2026-05-22 wave-30):** LangGraph + MCP + ContextForge orchestration substrate; Langflow demoted to demo facade.
- **D-018 (2026-05-22 wave-30):** Tri-agent Agent-as-Judge critic loop (Physics-Critic + Pedagogy-Critic + Guardian-Safety) + IBM Mellea Instruct-Validate-Repair (loop_budget = 3).
- **D-019 (2026-05-22 wave-30):** 5 shouldn't-be-possible moves: WebGPU Granite Nano 350M (item 1) + Activated LoRA hot-swap (item 2) + GEPA reflective prompt optimisation (item 3) + EAGLE-3 speculative decoding (item 4) + Agent-as-Judge tri-agent critic (item 5).
- **D-020 (2026-05-22 wave-30):** Gradient bridge two-regime seam at SCP projector output. Gradients flow above (TTM + SCP); DSPy/GEPA reflective evolution below (Mellea + tri-agent).
- **D-021 (2026-05-22 wave-30):** WebGPU offline scope cut: 30-line Newton friction-ellipse + server-authoritative reconnect; no mechanical recommendations offline.
- **D-022 (2026-05-22 wave-30):** Lexicographic COA constraint hierarchy with elastic slacks. Tier-0 + Tier-1 inviolable; Tier-2 + Tier-3 relax via slacks.
- **D-023 (2026-05-22 wave-30):** MLPerf tolerance-banded reproducibility protocol for APEX-Bench (dockerised eval + deterministic seed locks + variance report).
- **D-024 (2026-05-22 wave-30):** Physics-confidence detector (Mahalanobis distance over telemetry vs Pacejka tire parameter distribution) feeds Granite Guardian BYOC for verdict downgrade.
- **D-025 (2026-05-22 wave-30):** NeurIPS central claim locked: frozen-TSFM + hard differentiable physics-projection composition. Three supporting contributions: kinetic hallucination + polyphase feasible-lift + APEX-Bench.
- **D-026 (2026-05-22 wave-30):** APEX-Bench public benchmark (50-lap multi-class + LIPS 4-axis ablation, Apache 2.0 release alongside paper).
- **D-027 (2026-05-22 wave-30):** Day-3 SCP go/no-go gate (single most important checkpoint in 12-day build). Trust-region fallback ladder spec at decision-log D-027 (Powell ratio + max 5 adjustments + escalation to D-A revision).
- **D-028 (2026-05-22 wave-31A):** Galaxy-tier scope-expansion with APEX Lite ship-floor fallback posture (project-defining pattern lock). Galaxy ambition is the project's POSTURE, not the submission's RISK MODEL. Pre-mortem row 63 promoted to decision-log.
- **D-A (2026-05-19, carried in from PIT WALL):** PhysicsTTM three-layer architecture (frozen TTM → CvxpyLayer QP projection → Guardian BYOC text audit). Convergence 14 (serializer unit-test suite) is load-bearing. Now functions as APEX Lite ship-floor per D-028.
- **D-B (refined Day 1 PM 2026-05-20):** Dual-layer pitch headline. Emotional Hero (h1 + 3-min video lead) = "The race engineer for the drivers who don't have one." Technical positioning (Differentiator #1) = "First integrated workflow for adaptive hand-controls." Q&A killshot reserved = COA-parameterized brake-throttle simultaneity. Full rationale: `docs/decision-log.md` D-B.

---

## Open Questions

> Decisions that need sign-off before work can proceed. Tag the person who needs to decide.

- [x] **Q-001 - Vinh's git config email, ✅ RESOLVED 2026-05-23 (Phase 0 commit cluster):** Vinh's GitHub account configured as `vinhbin <vinhhle24@gmail.com>` per the 18-commit Phase 0 push (836fcf6 through c69753d). Green-squares attribute correctly on the apex repo network graph. **Owner: Vinh (resolved).**
- [ ] **Q-002 - Stakeholder reply by Day 3 (revised from Day 7):** UK charity response window is 7-14 business days. Day 7 escalation was too late for first contingency. Revised: LinkedIn DMs to two UK adaptive-driver competitors shipped Day 3 morning regardless of Phase 1+2 reply state. Day 5 second-pass follow-up emails to non-responders. Day 8 anonymization decision if zero replies. **Owner: Stephen.**
- [ ] **Q-003 - Live sim-rig hardware:** which sim title runs on which laptop for Day 9 recording? Default: iRacing on Stephen's machine, fallback to ACC. **Owner: Stephen + Vinh, EOD Day 8.**
- [ ] **Q-004 - APEX Lite trigger (LATE Day-10 path):** invoke Lite on ANY of: (a) D-027 SCP gate fails AND D-A revision required (D-027 fallback ladder exhausted per `docs/decision-log.md` D-027); (b) Sync Point 1 (Day 1-2 data contract lock) fails; (c) Sync Point 2 (Day 4-6 orchestration end-to-end) fails; (d) Sync Point 3 (Day 7-9 physics projection convergence) fails; (e) Day 9 Gate G9 fails on 2+ items. **Ship-floor on activation:** V1 NumPy physics validator + frozen Granite TTM r2.1 + Granite Guardian 4.1 text-audit baseline per `docs/decision-log.md` D-A wave-25 architecture, plus Sarah Reynolds canned fixture demo + frontend coaching UI; drop 8-tier SCP, three-track ensemble, LangGraph + MCP + ContextForge runtime, tri-agent critic, WebGPU Nano edge, aLoRA, EAGLE-3, GEPA, Mellea IVR, Physics-confidence detector, APEX-Bench public release, sim-rig stream, Colab live mode. Full Lite scope at `docs/apex-lite-contingency.md`. **Default:** NO Lite, ship maximal. **Owner: both, Day 10 morning.**
- [x] **Q-005 - June Challenge entry, CLOSED 2026-05-23 wave-38 (WONT-DO):** APEX is May Challenge only. June Challenge is a separate event with separate scope; no APEX surfaces reference it. Stretch S3 retired + row 4.10 retired + `docs/june-challenge-bridge.md` deleted. Stephen explicit directive 2026-05-23: "the June challenge does not deal with anything that the May challenge deals with. F1, the June challenge is a whole other, different challenge itself, so nothing should be going onto the June challenge. Everything should be within our scope, and only in the scope."
- [x] **Q-006 - per-surface consent for adaptive-supplier naming - ✅ RESOLVED 2026-05-22 (MME Motorsport d.o.o.):** APEX positioning materials previously named the supplier without explicit per-surface consent. Codex critique wave 2 (Day 1 EOD) flagged as BLOCKER. **Resolution closed:** (a) Adaptive-hand-control supplier consent email sent 2026-05-20 PM (Day 1). (b) MME Motorsport d.o.o. replied 2026-05-22 with broad consent: "Feel free to use the MME Motorsport Hand Controls in your projects" covering all 4 surfaces (apex-one-black.vercel.app + README + BeMyApp Story + 3-min video). (c) Approved attribution form is corporate ("MME Motorsport" or "MME Motorsport d.o.o.") only; personal naming of the corporate sender or CC contact is NOT in scope per `docs/consent-log.md` §1 Not-approved clause. Wave-29 personal-name redaction restored corporate-only attribution across public-repo surfaces; consent-log §1 audit-trail retains personal sender + CC + verbatim quote for receipt provenance only. (d) Sarah persona materials now name MME directly; anonymized fallback retired for MME surface. (e) Other adaptive-racing programmes (Team BRIT, Mission 44, Operation Motorsport, FFSA Handikart) sit under a SEPARATE posture (out-of-scope for MME outreach, not "pending replies"); per-programme outreach + Day-10 anonymization-decision deadline still applies. **Receipt logged at `docs/consent-log.md` §1.** Memory entry at `project_apex_consent_mme_motorsport.md`.

- [x] **Q-007 - APEX Lite EARLY trigger, ✅ NOT FIRED 2026-05-23 Day 5 (D-027 PASSED, Vinh responsive):** Distinct from Q-004's LATE Day-10 trigger. **D-027 SCP go/no-go gate Stage C PASSED 2026-05-23 04:58 ET** per Vinh commit `c97caaa` + log `logs/day-03-scp-go-no-go.md` (gradient finite True; ||grad_L|| = 24.12 < 1e4; FCVR = 0.0 on Sarah stub; output shape (1, 30, 14); DPP-compliant). G.1 GREEN BRANCH applies per `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_stream_g_d027_branch_application.md` + `docs/decision-log.md` D-030. Pre-committed de-scope rung 1 (cut three-track ensemble FlowState + Chronos-2) does NOT fire; three-track stays on roadmap. Vinh fully responsive (18-commit Phase 0 push 03:06-05:14 ET). Stage A (8-tier Pacejka) + Stage B (3-iterate SCP unroll) deferred to Phase 2 Day 4 task 2.12 per council v2 amendment + D-031. **Canonical decision rule retained as defined contingency** in case any of the remaining triggers fire later: {no Vinh reply in 48h (currently FALSE), D-027 fail (currently FALSE), G1 fail (Vinh G-0.5 TTM-r2 hardware-load PASS 2026-05-23 commit 9927b06), G1b fail, G1c fail, G4 fail, G6.5 fail, Sync Point 1 fail}. **Trigger window collapses into Q-004 LATE-only from Day 5 onward** per the canonical rule's "Day 5 onward" clause; this Q-007 status now reflects that collapse. **Owner: both (resolved on this branch).**
- [ ] **Q-008 - MME Motorsport acknowledgement wording (deck + video credits + README acks section):** MME consent grant 2026-05-22 was at no cost; per professional courtesy an acknowledgement on the project's deck + video credits + README acks section is appropriate (per `docs/consent-log.md` §1 Reciprocity clause). Approved attribution form is corporate-only ("MME Motorsport" or "MME Motorsport d.o.o."); personal sender + CC names are NOT in scope. **Default:** add "Thanks to MME Motorsport d.o.o. for granting per-surface attribution permission" at video end-card + deck Acks slide + README Acknowledgements section. **Owner: Stephen, Day 10 morning (before video record) + Day 11 (deck render) + Day 11 (README polish).**
- [ ] **Q-009 - MME naming in BeMyApp submission Story block:** consent-log.md §1 approves BeMyApp Story block as one of 4 surfaces. Today's BeMyApp Story panel doesn't have a Sarah-specific narrative paragraph; only generic "adaptive drivers running hand-control systems" prose. Decision: (a) add a Sarah-persona + MME-named bullet to the Story panel, or (b) keep the panel generic + name MME in the Tools panel only. **Default:** option (a). Add one Sarah+MME bullet to the Magic-Solution section right before the Tools panel. **Owner: Stephen, Day 12 morning before BeMyApp submit.**
- [ ] **Q-010 - MME attribution on /judges page:** consent approves the apex-one-black.vercel.app landing-page surface; /judges is part of apex-one-black.vercel.app. Decision: (a) add MME naming to /judges Sarah-persona blurb in the header, (b) add an Acks resource tile to /judges RESOURCES grid, or (c) leave /judges generic + rely on /analyze for the Sarah-MME story. **Default:** option (a). Extend the header persona note to "Sarah Reynolds, a fictional persona (RAF veteran, left-leg amputee, Britcar Trophy 2026, #34 BMW M240i with MME Motorsport electronic hand-controls)" + add a small "Thanks to MME Motorsport d.o.o." footer line on /judges. **Owner: Stephen, Day 11 /judges final polish.**

---

## Pre-submit Checklist (Day 11 gate G11)

Run `scripts/pre-submit-checks.sh` (default mode = Day-2-through-10 regression). Day 11 strict: `--final`. All 21 items must pass. Fail = no submission tomorrow.

1. [ ] Em-dash sweep on README + PLAN.md + docs + deck + video transcript = zero hits in prose
2. [ ] AI-tone blocklist sweep ("delve into / leverage / seamless / robust / etc") = zero hits
3. [ ] En-dash + smart-quote sweep = ASCII only in prose
4. [ ] Operator-attribution sweep = no named operator without per-surface consent
5. [ ] Em-dash in commit messages = `git log --pretty=%s | grep "-"` empty
6. [ ] GitHub Actions CI green on `main` per-job (not just aggregate)
7. [ ] TypeScript clean: `tsc --noEmit` zero errors
8. [ ] Lint clean: `ruff check` + `eslint` zero errors
9. [ ] Tests pass: `pytest` + `vitest run`; backend coverage >= 70% on `apex/`
10. [ ] HF Space health: `curl -sI <hf-url>/health` returns 200
11. [ ] Demo video length: `ffprobe deliverables/demo-video.mp4` <= 3:00
12. [ ] Backup demo present: `deliverables/demo-video-backup.mp4`
13. [ ] 30-second highlight clip: `deliverables/demo-video-30s.mp4` exists
14. [ ] Deck PDF renders: `docs/deck.pdf` opens cleanly, every slide < 100 words
15. [ ] README has working demo URL: `curl -sI <vercel-url>` returns 200
16. [ ] LICENSE = Apache 2.0
17. [ ] All 12 IBM tools cited in README per D-016 wave-30 stack expansion (Granite-Docling / Vision 4.1 / TimeSeries TTM r2.1 / 4.1 8B Instruct / Guardian 4.1 / Embedding R2 / TSPulse / FlowState / 4.0 Nano / Langflow / Docling library / IBM Bob) each with role + version pin
18. [ ] Q&A flashcards memorized: both members deliver all 5 cards < 30s each from cold
19. [ ] Multi-track entries verified: every eligible track checkbox ticked on BeMyApp form
20. [ ] Stakeholder quotes attributed only with explicit per-surface consent (or omitted)
21. [ ] BeMyApp submission payload checkboxes ticked: `grep "^\[ \]" deliverables/bemyapp-submission-payload.md` returns nothing (WARN in default mode; HARD-FAIL in `--final` mode). Added wave-18 silent-failure-hunter H-3.

---

## Hard Compliance Rules (DQ-grade if violated)

> Memorize. Auditor catches at sweep level. Manual review for demo video + pitch text.

- ❌ **No em-dash (-) in prose.** Per global CLAUDE.md. Single most reliable AI-tone tell. Pre-submit sweep on Day 11.
- ❌ **No AI-tone blocklist words** in prose: "delve into / leverage / seamless / robust / comprehensive / unlock / cutting-edge / revolutionary / streamline / ecosystem / easily / simply."
- ❌ **No invented FIA Article numbers.** Verify via FIA.com or research/ PDFs before citing. Per D-004 research-tool discipline.
- ❌ **No named operators without per-surface consent.** an adaptive-driver competitor, an adaptive-driver competitor, anyone who replies to outreach: get explicit consent per surface (deck vs README vs video).
- ❌ **No NIL violations.** Do not use real driver names in demo without consent (Sarah Reynolds is fictional, that's the point).
- ❌ **No git hooks.** Per D-006. Verify `.git/hooks/` is defaults-only.
- ✅ **Conditional phrasing on physics claims.** "Forecast envelope" not "guaranteed pace." "Recommended tuning delta" not "optimal setup."
- ✅ **Every coaching claim cites COA section + FIA Article.** Provenance footer.
- ✅ **Granite + watsonx + Bob attribution per Ferrari case-study precedent.**

---

## Setup (anyone cloning)

```bash
# 1. Clone
git clone https://github.com/StephenSook/apex.git
cd apex

# 2. Verify no active git hooks (D-006)
ls -la .git/hooks/  # should be only .sample files

# 3. Set git identity to your GitHub-attributed email
git config user.email <your-github-email>
git config user.name <your-github-name>

# 4. Backend setup (Day 1 onward)
cd app/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt   # requirements.txt lands Phase 1

# 5. Frontend setup (after task 0.14)
cd ../frontend
npm install

# 6. Local dev
# Terminal 1: backend
cd app/backend && uvicorn apex.main:app --reload --port 8000
# Terminal 2: frontend
cd app/frontend && npm run dev    # serves on :3000
```

### Updating PLAN.md (manual coordination, no CLI, no hooks)

Mirrors Trace + Hometown convention. Edit by hand, commit only `PLAN.md`, push.

```bash
# Claim a task: change ⬜ to 🟡 in the row, add timestamp + your name in Notes
git add PLAN.md
git commit -m "chore(plan): claim 1.1 🟡 Vinh"
git push

# Complete a task: change 🟡 to ✅
git add PLAN.md
git commit -m "chore(plan): complete 1.1 ✅"
git push

# Block a task: change to ⛔, add reason in Notes
git add PLAN.md
git commit -m "chore(plan): block 1.1 ⛔ - TTM library throws on M-series"

# Cut a galaxy-tier item: change to ✂️, add reason. Per D-003 galaxy rule, cutting requires escalation - galaxy rule says "nothing deferred."
git add PLAN.md
git commit -m "chore(plan): cut 5.3 ✂️ - sim-rig hardware unavailable; APEX Lite contingency invoked per Q-004"
```

---

## Phase Build Order Notes

**Phase 0 is the unblocker.** Vinh cannot start parallel work until D0.12 (accept invite + clone) and D0.13 (Gate G1 TTM smoke) pass. Stephen owns 0.14 Next.js scaffold while Vinh boots.

**Phase 1 is the critical path for Phase 2.** TTM has nothing to forecast over until intake + vision parse the fixtures. Vinh owns Days 1-2 end-to-end on Phase 1.

**Phase 2 + Phase 3 converge Day 6.** Sarah Reynolds canned end-to-end test = first integration moment. If G6 slips, Day 10 Lite contingency triggers.

**Phase 4 starts in parallel** with Phase 2-3 polish. Stephen builds deck v0 + outreach while Vinh closes physics.

**Phase 5 is the highest-risk Phase** because three new surfaces (HF deploy + Colab + sim-rig) all land Day 9. Build buffer Day 10 morning.

**Phase 6 is the heaviest commit day.** Target 12-18 atomic commits Day 11 across methodology + judges page + status page + cost audit + NeurIPS draft + README polish + AI-tone sweep + all §17 external-tool passes.

**Phase 7 = submission only.** No new features Day 12.

---

## Reference: full design blueprint

The original `~/.claude/plans/all-right-i-want-rippling-moon.md` (also mirrored at `docs/build-plan-blueprint.md` Day 2) contains the design-blueprint depth: PhysicsTTM math, Sookra Methodology trace, full §16 enhancements list, §17 external-tool layer detail, §18 galaxy-tier inclusions list. PLAN.md is the coordination surface; the blueprint is the design surface.

---

_Last updated: 2026-05-22 night-late by Stephen after 32 review waves (waves 1-18 Day 1 + waves 19-31C Day 2-3 + wave-32A cold-review closure Day 3 night-late-2). **WAVE-30 MAXIMAL ARCHITECTURE LOCK landed Day 3 night + WAVE-31A 16-commit cold-review closure + WAVE-31B + WAVE-31C outreach scaffolding + WAVE-32A cold-review BLOCKER fix wave; 264+ atomic commits pushed across Day 1 through Day 3.** Phase 0 ✅ except 0.11-0.13 (Vinh-side; Tuesday 2026-05-27 ETA per Discord rate-limited rollout schedule). Full closure log across `docs/wave-22-cold-review-findings.md`, `docs/wave-23-cold-review-findings.md`, `docs/wave-24-cold-review-findings.md`, `docs/wave-25-cold-review-findings.md`. Wave-25 closures landed the two-stage projection-and-audit propagation across paper title + README Differentiator #2 + arch-spec system-overview ASCII + Layer 6 narrator + a_lat SI-unit + decision-log D-A + outreach drafts + June bridge + APEX-Lite + methodology Phase 5 + Sarah persona vocabulary + Q&A Cards 1/2/5 reasoning gaps + PLAN ID-scheme unification + row 6.7 split + row 2.9c test-suite row + commit-count 197+ -> 201+ sweep. Wave-26 landed the galaxy-tier Convergence-14 fixture grid + Figure 1 architecture embed on `/judges`, BeMyApp submission-payload two-stage + Convergence-14 sweep, BeMyApp Day 2 devlog + 30-second highlight-clip storyboard + cost-audit shell pull-forward, and a ConvergenceFixture discriminated-union refactor (compile-time class-stage + COA-payload + serializer-integrity-verdict invariants) closing all three-brain self-review findings on the wave-26 batch (one BLOCKER + two HIGH + three MED + one NIT). Wave-27 closed 4-agent re-review on the wave-26 batch: 6 Codex physics-math BLOCKERs (C14-04 sign + C14-05 bicycle threshold off by 14x + C14-06 predicted lat_g off by 10x + arch-spec jerk_max 30 m/s^3 vs C14-04 0.8 g/s reconciled at 8 m/s^3) + silent-failure HIGHs (Figure 1 CLS picture-fallback + onError + download attribute + ResourceTile fragment-link) + type-design closure_kind discriminator (round_trip vs end_to_end split on serializer_integrity variant) + IBM Bob Ferrari attribution softening + BeMyApp IBM-Consulting overclaim softening + commit-count drift sweep. Single mega-commit `1e0c182` due to Anthropic safety-classifier capacity outage (pool saturated after 4 parallel agents + Gemini 529 Overloaded) preventing atomic-commit cadence; logical breakdown preserved in `docs/wave-27-cold-review-findings.md`. Wave-28 closed Vinh-Perplexity research findings: COA-derived wording sweep across 8 surfaces (FIA Article 18.3 + COA Section 3(c) anti-pattern retired) + jerk-bound >=10Hz Rajamani caveat + landed real-world MME Motorsport consent receipt (Q-006 ✅ closed; consent-log.md §1 audit-trail surface created; Sarah persona names MME directly across README + 3-min pitch + 30s storyboard). Wave-29 closed 3-agent self-review on wave-28 (codex + comment-analyzer + plan-gap-scanner; 14 BLOCKER + 10 HIGH + 8 MED + 4 NIT): C14-04 syntax SHIPS-BREAKING fix + 11-surface frontend/deliverables/persona sweep covering app/frontend/app/page.tsx + judges/page.tsx + AnalyzeFlow.tsx + types.ts JSDoc + SUBMISSION.md + bemyapp-banner.tsx + demo-video-storyboard.md + apex-demo.ipynb + TuningCard.test + CoachingReport.test + persona internal contradictions; personal-name redaction restoring corporate-only attribution across 4 public-repo surfaces (audit-trail consent-log retains personal sender + CC); paper §3.2 jerk_max 30 -> 8 m/s^3 alignment; PLAN gaps closure (Q-006 scope clarification + Q-008/9/10 MME-derived Stephen-lane decisions + row 6.7c methods doc landing + 2.9a/2.9c jerk caveat cross-references); wave-28 findings doc landed. Day 2 + Day 4 + Day 5 + Day 6 + Day 7 + Day 8 + Day 9 + Day 10 + Day 11 task drafts pulled forward per galaxy-tier rule (Core 6 + Stretch S1 + S4 + S5 + S6 + S10 all at draft quality). Pre-consent operator-attribution anonymized across 14+ public files. plan-gap-scanner BLOCKERs closed across waves 19-22-25. APEX Lite EARLY Q-007 trigger softened per Discord rate-limited rollout schedule; re-evaluation Tuesday 2026-05-27 EOD if Vinh still dark._
