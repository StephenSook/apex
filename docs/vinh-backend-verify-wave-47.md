# Vinh Phase 3 + 4 + 5 + 6 backend verification (wave-47 close-out)

Read 2026-05-27 closing wave-47 session. Vinh shipped a substantial backend wave (commits `216a1a2` + `7ca1874` + `2fe20b9` + `f002fc2`) that the frontend lane needs to wire env-flag flips against.

## What Vinh shipped (per file inventory)

**`app/backend/apex/server.py`** -- FastAPI HTTP wrapper (live; production-deployable). 185 fast tests pass + 5 FastF1 integration tests pass.

**`app/backend/apex/orchestration/`** -- 6-node LangGraph runtime (V14 swap-point lands real verdicts here). Wires ingest -> rag -> projection -> guardian -> instruct -> provenance.

**`app/backend/apex/physics/`** -- V1 NumPy validator + V2 cvxpylayers projector (V12 + V13 Pacejka + SCP swap-points).

**`app/backend/apex/ttm/`** -- Granite TimeSeries TTM r2.1 forecaster (V3 + V11 swap-points pending fine-tune execution).

**`app/backend/apex/guardian/`** -- Granite Guardian 4.1 8B BYOC audit (live; ships verdicts per D-024 detector).

**`app/backend/apex/instruct/`** -- Granite 4.1 8B Instruct narrator (V5.3 swap-point; live via WatsonX or OpenRouter).

**`app/backend/apex/intake/`** -- Telemetry intake + cache (`cache.py` + `__init__.py`).

**`app/backend/apex/vision/`** -- Granite Vision 4.1 4B placeholder for timing-sheet PDF parser (V1 swap-point pending).

**`app/backend/apex/pipelines/`** -- Pipeline assembly + Mellea IVR loop wiring (V5.2 swap-point).

**`app/backend/apex/shared/`** -- Pydantic contracts + serializer (D-050 byte-equality lock).

**`app/backend/apex/langflow/`** -- export-graph artifacts (Langflow demoted to export-graph facade per D-026 maximal-architecture lock).

**`eval/`** -- LIPS harness Dockerfile + apex-bench v0.0.1-preview public release (V15 swap-point).

**`physics-tsfm/`** -- carve-out package for the physics-projected TSFM (pre-publish).

## Frontend env-flag flip readiness

The wave-46 wire-flip routes already accept env-flag activation via the canonical FeatureFlag union at `app/frontend/lib/env.ts`. To activate any of the M3-V-N swap-points on the production Vercel deploy, set the following env vars:

```
NEXT_PUBLIC_VINH_BACKEND_BASE_URL=https://<vinh-deploy>
NEXT_PUBLIC_USE_REAL_BACKEND_V12=1   # Pacejka projector
NEXT_PUBLIC_USE_REAL_BACKEND_V13=1   # SCP outer loop
NEXT_PUBLIC_USE_REAL_BACKEND_V14=1   # LangGraph orchestration
NEXT_PUBLIC_USE_REAL_BACKEND_V15=1   # LIPS harness
NEXT_PUBLIC_USE_REAL_TSPULSE=1       # TSPulse anomaly
NEXT_PUBLIC_USE_REAL_RAG=1           # RAG retrieval
NEXT_PUBLIC_USE_REAL_TIMING_SHEET=1  # Granite Vision timing-sheet parse
NEXT_PUBLIC_USE_REAL_FLOWSTATE=1     # FlowState Track 2
NEXT_PUBLIC_USE_GRANITE_3B_ROUTING=1 # AICopilotChat 3B fast-path
NEXT_PUBLIC_USE_GRANITE_SPEECH=1     # STT real Granite Speech
MELLEA_IVR_ENABLED=1                  # narrator IVR loop
```

Once Vinh provides the deployed `<vinh-deploy>` URL, Stephen flips each env flag in Vercel project settings + redeploys. Every wire-flip route in `app/frontend/app/api/*/route.ts` falls back to canned-fallback on any fetch failure, so partial Vinh deploy never cascades 502s on /judges.

## Pending Vinh-side items per `PLAN.md` Vinh task table

- M3-V1 Granite Vision real timing-sheet PDF inference
- M3-V3 + M3-V11 Granite TTM r2.1 D-010 Track 1 channel-mix decoder fine-tune EXECUTION
- M3-V7 IBM TSPulse 1M polyphase anomaly endpoint
- M3-V8 Granite Embedding R2 cosine-similarity RAG live wire
- M3-V9 Watson STT proxy via Granite Speech 4.1 2B-Plus
- M3-V10 Granite FlowState r1.1 18.5M Track 2 wire
- D-018 Mellea tri-agent critic orchestrator + GEPA reflective prompt evolution
- 9.OV-2+4 reasoning_chain population on CornerInsight (wave-47 frontend type already shipped; backend populates per OVERRIDE-steal #2+#4)
- 9.OV-1 retry-loop pattern transfer to all backend LLM routes
- 9.OV-QB Pydantic v2 + OpenTelemetry quality bar audit

## Memory write recommendation

Update `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_vinh_lane.md` to reflect Phase 3+4+5+6 shipped state. Closed: server.py + LangGraph runtime + physics V1+V2 + Guardian + Instruct + intake + Mellea pipelines + shared contracts + langflow export-graph + eval Dockerfile + physics-tsfm carve-out. Open: per-swap-point V-N executions (V1 + V3 + V7 + V8 + V9 + V10 + V11) + OVERRIDE-steal items.

## Frontend smoke-verify next session

Stephen runs after Vinh provides deploy URL:
1. Set `NEXT_PUBLIC_VINH_BACKEND_BASE_URL` in Vercel dashboard
2. Flip each `NEXT_PUBLIC_USE_REAL_*` flag one at a time
3. Walk /judges + /analyze + /sim-rig + /lips-harness
4. Verify every panel renders + each route returns 200
5. Watch console for `[apex/<route>] real-backend fetch failed; serving canned-fallback` warnings -- those signal backend not yet deployed for that swap-point
