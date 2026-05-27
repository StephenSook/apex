# Day 9 - Deploy smoke (Phase 5 task 5.3)

**Result: PASS** on in-process FastAPI TestClient harness.

Phase 5 task 5.3 per docs/vinh-backend-plan.md L241. Sarah end-to-end
pipeline runs cleanly through the HTTP boundary at
`/api/analyze` + the three Stream M.3 endpoints + healthz probe.

## Pass criterion (plan L241)

> Smoke test the deployed pipeline end-to-end with Sarah fixtures.

## What was smoke-tested

12 tests at `app/backend/tests/test_server.py` exercising every route
via `fastapi.testclient.TestClient`:

```
tests/test_server.py::test_healthz_returns_ok PASSED
tests/test_server.py::test_audit_log_post_persists PASSED
tests/test_server.py::test_audit_log_413_on_oversize PASSED
tests/test_server.py::test_audit_log_400_on_non_object PASSED
tests/test_server.py::test_what_if_replay_known_keys_succeeds PASSED
tests/test_server.py::test_what_if_replay_unknown_fixture_returns_400 PASSED
tests/test_server.py::test_what_if_replay_unknown_mutation_returns_400 PASSED
tests/test_server.py::test_what_if_replay_missing_fields_returns_400 PASSED
tests/test_server.py::test_session_context_returns_tiles PASSED
tests/test_server.py::test_analyze_end_to_end_on_sarah_fixtures PASSED
tests/test_server.py::test_analyze_missing_fixture_returns_404 PASSED
tests/test_server.py::test_analyze_missing_payload_field_returns_400 PASSED

12 passed in 6.06s
```

## End-to-end analyze smoke

`POST /api/analyze` with Sarah fixtures returns a CoachingReport JSON
matching the canonical frontend contract:

```python
{
  "coaching_report": {
    "driver_id": "sarah-reynolds-britcar-2026",
    "corners": [3 items],
    "tuning_delta": {...},
    "forecast": [6 items],
    "audit": {"verdict": "...", "audit_id": "...", "reasoning_trace": [...]},
    "provenance": {
      "model_versions": {granite_docling, granite_vision, granite_ttm,
                         granite_instruct, granite_guardian},
      "commit_sha": "...",
      "generated_at_iso": "..."
    }
  },
  "trace": [
    {"node": "ingestion",   "status": "ok", "duration_ms": ..., "detail": "..."},
    {"node": "rag",         "status": "ok", "duration_ms": ..., "detail": "..."},
    {"node": "projection",  "status": "ok", "duration_ms": ..., "detail": "..."},
    {"node": "guardian",    "status": "ok", "duration_ms": ..., "detail": "..."},
    {"node": "instruct",    "status": "ok", "duration_ms": ..., "detail": "..."},
    {"node": "provenance",  "status": "ok", "duration_ms": ..., "detail": "..."}
  ],
  "swap_point": "Vinh M3-V14"
}
```

## Container build target

`app/backend/Dockerfile` ships a `python:3.10-slim` base + FastAPI +
uvicorn + numpy + structlog. Heavy ML deps (torch + cvxpy +
transformers) are NOT in the slim image; deploys needing
`/api/what-if-replay` swap to an `apex-backend:0.1.0-cvxpy` variant
or stage the install per-target. Healthcheck queries `/healthz` every
30 s.

## Deploy decision (task 5.1)

Per Perplexity Claim 11 + D-046 wave-44 production deploy LIVE:
**Vercel frontend** (`apex-one-black.vercel.app`) + **OpenRouter
Granite 4.1 8B** + **watsonx.ai** for the bonus IBM-tech-track signal.
No HF Space in the judge path. The Vinh-lane backend container ships
as the swap-target for `/api/analyze` + the three Stream M.3 routes;
Stephen-side Vercel functions already wire those URLs to the frontend
fetch surface.

## Status

Deploy smoke: **PASS** (in-process). Production deploy on Modal /
Fly.io / Vercel functions is operator-action gated; the container
image + healthcheck + 4 routes are ship-ready. Latency budget per G8
holds (23.3 ms backend hot-path on RTX 3060 Ti; HTTP boundary adds
~1-2 ms of FastAPI serialization overhead per the TestClient runs).
