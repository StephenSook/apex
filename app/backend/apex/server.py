"""FastAPI HTTP wrapper for the APEX backend (Phase 5 task 5.2).

Exposes:
  - POST /api/audit-log           (task 4.M3a)
  - POST /api/what-if-replay      (task 4.M3b)
  - GET  /api/session-context     (task 4.M3c)
  - GET  /api/orchestration       (wave-47 cascade-#53; frontend V14 wire-flip)
  - POST /api/analyze             (Sarah end-to-end pipeline)
  - GET  /healthz                 (container readiness probe)

Deploy target: any Docker host (Modal / Fly.io / Vercel functions /
container registry). Backed by the deterministic Python modules
landed in Phase 3 + Phase 4; HTTP surface is a thin wrapper.

Production routing per D-052: Stephen-side `/api/openrouter-stream`
remains the production Granite 4.1 8B path (frontend route at Vercel
Edge). This backend service is the Vinh-lane swap-target for the
LangGraph runtime + Stream M.3 endpoints + analyze pipeline.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Request

from apex.orchestration.audit_log import (
    AuditLogLineTooLarge,
    AuditLogStore,
)
from apex.orchestration.langgraph_runtime import run_langgraph
from apex.orchestration.session_context import SessionContextProvider
from apex.orchestration.what_if_replay import (
    UnknownFixtureError,
    UnknownMutationError,
    run_what_if_replay,
)
from apex.pipelines.sarah_e2e import coaching_report_to_dict

# ---- Singletons -------------------------------------------------------

AUDIT_LOG_PATH = Path(
    os.environ.get(
        "APEX_AUDIT_LOG_PATH",
        str(Path.home() / ".apex" / "audit-log.jsonl"),
    )
)
_audit_store = AuditLogStore(file_path=AUDIT_LOG_PATH)
_session_provider = SessionContextProvider()


# ---- App --------------------------------------------------------------

app = FastAPI(
    title="APEX backend",
    version="0.1.0",
    description=(
        "APEX race-engineer backend. LangGraph 6-node runtime + Stream "
        "M.3 endpoints + Sarah end-to-end analyze pipeline. Vinh-lane "
        "service per docs/vinh-backend-plan.md Phase 5 task 5.2."
    ),
)


@app.get("/healthz")
def healthz():
    """Container readiness probe. Returns 200 once the singletons load."""
    return {"status": "ok"}


# ---- POST /api/audit-log ----------------------------------------------

@app.post("/api/audit-log")
async def post_audit_log(request: Request):
    payload = await request.json()
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="payload must be a JSON object")
    try:
        result = _audit_store.append(payload)
    except AuditLogLineTooLarge as exc:
        raise HTTPException(status_code=413, detail=str(exc)) from exc
    return {
        "persisted": result.persisted,
        "line_index": result.line_index,
        "file_path": result.file_path,
    }


# ---- POST /api/what-if-replay -----------------------------------------

@app.post("/api/what-if-replay")
async def post_what_if_replay(request: Request):
    payload = await request.json()
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="payload must be a JSON object")
    baseline_fixture_id = payload.get("baseline_fixture_id")
    mutation_key = payload.get("mutation_key")
    if not baseline_fixture_id or not mutation_key:
        raise HTTPException(
            status_code=400,
            detail="payload must contain baseline_fixture_id + mutation_key",
        )
    try:
        result = run_what_if_replay(
            baseline_fixture_id=baseline_fixture_id,
            mutation_key=mutation_key,
        )
    except (UnknownFixtureError, UnknownMutationError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {
        "mutated_fixture": result.mutated_fixture,
        "replayed_violation_log": result.replayed_violation_log.to_text(),
        "schema_version": result.schema_version,
        "protocol_version": result.protocol_version,
    }


# ---- GET /api/session-context -----------------------------------------

@app.get("/api/session-context")
def get_session_context():
    resp = _session_provider.fetch()
    return {
        "tiles": [
            {
                "key": t.key,
                "label": t.label,
                "value": t.value,
                "detail": t.detail,
                "severity": t.severity,
            }
            for t in resp.tiles
        ],
        "fetched_at_iso": resp.fetched_at_iso,
    }


# ---- GET /api/orchestration -------------------------------------------
#
# Wave-47 cascade-#53 close (Stephen-side audit R1): frontend
# `/api/orchestration` proxies via the wave-46 wire-flip helper and
# expects a typed `OrchestrationResponse` with nodes[].id + label +
# status + elapsed_ms. This endpoint executes the canonical Sarah
# Reynolds 5-lap fixture through the LangGraph 6-node runtime + returns
# the per-node trace in the FRONTEND shape (not the analyze-trace
# shape). Bound to the canonical fixtures shipped with the repo at
# fixtures/personas/sarah-reynolds-{telemetry.csv,coa.json}; if either
# is missing, returns 503 so the frontend wire-flip helper falls back
# to canned without retrying.


def _sarah_fixtures_or_503() -> tuple[Path, Path]:
    # Repo-root fixtures dir; this file is app/backend/apex/server.py, so
    # parents[3] resolves to the repo root reliably regardless of how the
    # server is launched.
    repo_root = Path(__file__).resolve().parents[3]
    base = repo_root / "fixtures" / "personas"
    telemetry = base / "sarah-reynolds-telemetry.csv"
    coa = base / "sarah-reynolds-coa-stub.json"
    if not telemetry.exists() or not coa.exists():
        raise HTTPException(
            status_code=503,
            detail="sarah-reynolds canonical fixtures missing on backend",
        )
    return telemetry, coa


@app.get("/api/orchestration")
def get_orchestration() -> dict[str, Any]:
    telemetry, coa = _sarah_fixtures_or_503()
    trace = run_langgraph(
        telemetry_csv=str(telemetry),
        coa_json=str(coa),
        debrief_path=None,
    )
    nodes = [
        {
            "id": s.node,
            "label": s.node.replace("_", " ").title(),
            "status": s.status,
            "elapsed_ms": s.duration_ms,
        }
        for s in trace.steps
    ]
    total_ms = sum(int(s.duration_ms) for s in trace.steps)
    return {
        "engine": "langgraph-v14-real",
        "trace_id": f"sarah-langgraph-{int(total_ms)}ms",
        "nodes": nodes,
        "total_ms": total_ms,
        "swap_point": trace.swap_point,
        "compute_ms": total_ms,
    }


# ---- POST /api/analyze ------------------------------------------------

@app.post("/api/analyze")
async def post_analyze(request: Request):
    """End-to-end Sarah-style analyze pipeline.

    Request shape (subset of frontend AnalyzeRequestPayload):
      { "telemetry_csv_path": str,
        "coa_json_path": str,
        "debrief_path": str | null }

    All paths must resolve to local files; production wires this to
    multipart uploads + temp-dir extraction (out of scope for the
    Phase 5 hackathon scaffold).
    """
    payload = await request.json()
    telemetry_csv = payload.get("telemetry_csv_path")
    coa_json = payload.get("coa_json_path")
    debrief_path = payload.get("debrief_path")
    if not telemetry_csv or not coa_json:
        raise HTTPException(
            status_code=400,
            detail="payload requires telemetry_csv_path + coa_json_path",
        )
    if not Path(telemetry_csv).exists() or not Path(coa_json).exists():
        raise HTTPException(status_code=404, detail="fixture file not found")
    trace = run_langgraph(
        telemetry_csv=telemetry_csv,
        coa_json=coa_json,
        debrief_path=debrief_path,
    )
    return {
        "coaching_report": coaching_report_to_dict(trace.final_report),
        "trace": [
            {
                "node": s.node,
                "status": s.status,
                "duration_ms": s.duration_ms,
                "detail": s.detail,
            }
            for s in trace.steps
        ],
        "swap_point": trace.swap_point,
    }


__all__ = ["app"]
