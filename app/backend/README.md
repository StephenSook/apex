# APEX backend

Vinh-lane backend for the APEX race-engineer hackathon submission
(IBM SkillsBuild AI Builders Challenge May 2026). Implements the
physics-projected forecast layer, the Granite Guardian audit, the
race-engineer narrator, the 6-node LangGraph orchestration runtime,
and the FastAPI HTTP wrapper.

Frontend is at `../frontend/`; project-level coordination is at
`../../PLAN.md`; per-day phase plan is at `../../docs/vinh-backend-plan.md`.

## Quick start

```bash
cd app/backend
python -m venv .venv
.venv/Scripts/activate          # Windows
# OR: source .venv/bin/activate # POSIX

# core deps (pure-Python; no torch / no cvxpy)
pip install numpy fastapi "uvicorn[standard]" structlog

# optional V2 cvxpylayers projector + TTM-r2 forecast wrapper
pip install torch "cvxpy>=1.5" cvxpylayers granite-tsfm transformers fastf1

pytest tests/ -q -p no:cacheprovider                 # 185 fast tests
pytest tests/ --integration -q -p no:cacheprovider   # +5 integration (FastF1)
```

## Server

```bash
uvicorn apex.server:app --host 0.0.0.0 --port 8000
```

Routes:

| Method | Path                    | Spec                                                   |
|--------|-------------------------|--------------------------------------------------------|
| GET    | `/healthz`              | container readiness probe                              |
| POST   | `/api/audit-log`        | JSONL audit-chain append (task 4.M3a)                  |
| POST   | `/api/what-if-replay`   | deterministic V2 cvxpylayers re-projection (task 4.M3b)|
| GET    | `/api/session-context`  | race-event tiles with 30s TTL (task 4.M3c)             |
| POST   | `/api/analyze`          | Sarah end-to-end pipeline through LangGraph runtime    |

Full spec at `../../docs/wave-41-backend-spec-handoff.md`.

## Container

```bash
docker build -t apex-backend:0.1.0 .
docker run --rm -p 8000:8000 \
  -v "$(pwd)/../../fixtures:/srv/fixtures:ro" \
  -e APEX_AUDIT_LOG_PATH=/srv/audit/audit-log.jsonl \
  apex-backend:0.1.0
```

The slim image ships fastapi + uvicorn + numpy + structlog. Heavy ML
deps (torch + cvxpy + transformers) are NOT in the slim image; deploys
needing `/api/what-if-replay` swap to `apex-backend:0.1.0-cvxpy`
(future image) or stage the install per-target.

## Module map

```
apex/
  shared/contracts/   # canonical (B, 30, 14) TENSOR_SHAPE, PhysicsViolationLog,
                       # GuardianAudit, DifferentiableProjector Protocol,
                       # build_ttm_input adapter (Phase 0 ship-floor)
  shared/logging.py    # structured JSON logging with audit_id + commit_sha
  intake/cache.py      # SHA256-keyed onboarding cache (Phase 4 task 4.4)
  instruct/
    coa_parser.py       # FIA Appendix L COA parser (Phase 1)
    timing_sheet_parser.py  # canned-fixture timing-sheet parser (Phase 1)
    narrator.py         # CoachingReport assembler + retry loop + reasoning_chain (Phase 3)
    sarah_synth.py      # deterministic Sarah 5-lap Donington telemetry generator
  ttm/
    forecast.py         # TtmForecaster wrapper + 1Hz aggregator (Phase 2 task 2.8)
    g1_smoke.py         # G1 standalone smoke script (Phase 0 task 0.7)
  physics/
    validator.py        # V1 NumPy validator (Phase 2 Day 4 tasks 2.1-2.5)
    projection.py       # V2 cvxpylayers constant-mu projector (Phase 2 Day 5 task 2.12)
    scp_spike.py        # D-027 Stage C SCP go/no-go gate spike (Phase 0 task 0.5)
  guardian/audit.py    # BYOC custom-rules audit + render_audit helper (Phase 2 Day 5 task 2.14)
  orchestration/
    langgraph_runtime.py    # 6-node state machine (Phase 4 task 4.1, M3-V14 swap-point)
    audit_log.py             # POSIX flock JSONL persistence (Phase 4 task 4.M3a)
    what_if_replay.py        # singleton V2 projector + mutation catalogue (Phase 4 task 4.M3b)
    session_context.py       # 30s TTL race-event tiles (Phase 4 task 4.M3c)
  pipelines/
    telemetry_to_log.py      # CSV -> forecast -> validator -> text log pipeline (Phase 2 task 2.9)
    g4_mae_bakeoff.py        # G4 TTM vs seasonal-naive bake-off (Phase 2 task 2.11; FAIL Day 4)
    sarah_e2e.py             # Sarah end-to-end pipeline (Phase 3 task 3.5)
  server.py                  # FastAPI HTTP wrapper (Phase 5 task 5.2)
Dockerfile                   # slim deploy image (Phase 5 task 5.2)
tests/                       # 185 fast + 5 integration backend tests
```

## Engine-agnostic boundary

V1 NumPy floor + V2 cvxpylayers ceiling emit byte-identical
`PhysicsViolationLog.to_text()` output on the same `ViolationRecord`
content except for the leading `ENGINE` header line. Locked at
`tests/test_physics_v2.py::test_v1_v2_to_text_byte_equal_modulo_engine_line`
+ extended to all 14 violation types at
`tests/test_serializer.py::test_v1_v2_engine_byte_equality_holds_across_all_14_types`.
This is the Long-Term Architect load-bearing wall #2 from the council
v2 transcript; it lets D-A survive a V2 cut because Guardian audits
both engines and produces identical safety verdicts (modulo the
intentional uuid4-per-call `audit_id`).

## Gates shipped

| Gate  | Status | Day | Log                                |
|-------|--------|-----|------------------------------------|
| G-0.5 | ✅     | 3   | logs/day-03-g-0-5-ttm-load.md      |
| G0.6  | ✅     | 3   | logs/day-03-g0-6-cvxpy-import.md   |
| D-027 Stage C | ✅ | 3 | logs/day-03-scp-go-no-go.md       |
| G1    | ✅     | 3   | logs/day-03-g1-ttm-smoke.md        |
| G1b   | ✅     | 3   | logs/day-03-g1b-granite-latency.md |
| G2    | ✅     | 4   | logs/day-04-g2.md                  |
| G3    | ✅     | 4   | logs/day-04-g3.md                  |
| G4    | ❌ FAIL (pivot triggered) | 4 | logs/day-04-g4.md                  |
| G5    | ✅     | 5   | logs/day-05-g5.md                  |
| G6    | ✅     | 6   | logs/day-06-g6.md                  |
| G7    | ✅     | 7   | logs/day-07-g7.md                  |
| G8    | ✅     | 7   | logs/day-08-latency-profile.md     |
| G9    | ✅ reduced columns per D-052 + D-050 | 9 | logs/day-09-g9.md                  |
| G10   | ⬜ Phase 6   | 11  | logs/day-11-g10.md (forthcoming)   |

## License

Apache-2.0. See `../../LICENSE`.
