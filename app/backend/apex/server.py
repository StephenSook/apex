"""FastAPI HTTP wrapper for the APEX backend (Phase 5 task 5.2).

Exposes:
  - POST /api/audit-log           (task 4.M3a)
  - POST /api/what-if-replay      (task 4.M3b)
  - GET  /api/session-context     (task 4.M3c)
  - GET  /api/orchestration       (wave-47 cascade-#53; frontend V14 wire-flip)
  - POST /api/analyze             (Sarah end-to-end pipeline; JSON file paths)
  - POST /api/analyze-upload      (wave-48 multipart fix; driver-supplied files)
  - GET  /api/tspulse/anomaly     (wave-48 Tier-2; IBM TSPulse r1 polyphase anomaly head)
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
import shutil
import tempfile
from pathlib import Path
from typing import Any, Final

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from apex.instruct.narrator import Narrator
from apex.instruct.openrouter_generator import build_openrouter_generator
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
from apex.pipelines.telemetry_to_log import load_telemetry_csv
from apex.tspulse import detect_anomaly

# ---- Upload constraints ------------------------------------------------
# wave-48 multipart fix: /api/analyze-upload accepts driver-supplied
# telemetry + COA + debrief as multipart files. Caps are deliberately
# tight to keep the CPU-only HF Spaces deploy responsive + within the
# free-tier RAM budget.

_MAX_TELEMETRY_BYTES: int = 10 * 1024 * 1024   # 10 MiB CSV
_MAX_COA_BYTES: int = 1 * 1024 * 1024          # 1 MiB JSON
_MAX_DEBRIEF_BYTES: int = 256 * 1024           # 256 KiB markdown
_ALLOWED_TELEMETRY_SUFFIX: set[str] = {".csv"}
_ALLOWED_COA_SUFFIX: set[str] = {".json"}
_ALLOWED_DEBRIEF_SUFFIX: set[str] = {".md", ".txt"}

# ---- Singletons -------------------------------------------------------

AUDIT_LOG_PATH = Path(
    os.environ.get(
        "APEX_AUDIT_LOG_PATH",
        str(Path.home() / ".apex" / "audit-log.jsonl"),
    )
)
_audit_store = AuditLogStore(file_path=AUDIT_LOG_PATH)
_session_provider = SessionContextProvider()


def _build_live_narrator() -> Narrator | None:
    """Construct a Narrator with the OpenRouter generator wired in.

    Returns None when the env is missing prerequisites; callers swap to
    the deterministic floor in that case. Idempotent: safe to call once
    per request without paying the cost of repeated env reads in hot
    paths because the underlying httpx client is reconstructed on each
    `_generate()` call anyway.
    """
    generator = build_openrouter_generator()
    if generator is None:
        return None
    return Narrator(text_generator=generator)


# ---- App --------------------------------------------------------------

app = FastAPI(
    title="APEX backend",
    version="0.1.0",
    description=(
        "APEX race-engineer backend. LangGraph 6-node runtime + Stream "
        "M.3 endpoints + Sarah end-to-end analyze pipeline + multipart "
        "driver-upload analyze. Vinh-lane service per docs/vinh-backend-"
        "plan.md Phase 5 task 5.2."
    ),
)

# CORS: APEX frontend on Vercel needs to call this from the browser when
# wave-48 wire-flip is active. Allow all origins in this hackathon scope;
# narrow to the production Vercel domain once the deploy lands.
_ALLOWED_ORIGINS = os.environ.get(
    "APEX_CORS_ORIGINS",
    "https://apex-one-black.vercel.app,http://localhost:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Apex-Client"],
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
        narrator=_build_live_narrator(),
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
        narrator=_build_live_narrator(),
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


# ---- POST /api/analyze-upload (wave-48 multipart fix) ----------------
#
# Driver-supplied telemetry + COA + debrief via multipart/form-data.
# Files are written to a per-request tempdir + run through the same
# LangGraph pipeline as /api/analyze, then cleaned up. Response shape
# is identical so the frontend can swap routes transparently.


def _validate_upload(
    upload: UploadFile | None,
    *,
    field_name: str,
    required: bool,
    allowed_suffix: set[str],
    max_bytes: int,
) -> bytes | None:
    """Reject too-large uploads + wrong file extensions before persisting.

    Returns the file bytes on success or None when the field is optional + absent.
    """
    if upload is None:
        if required:
            raise HTTPException(
                status_code=400,
                detail=f"multipart field {field_name!r} is required",
            )
        return None
    suffix = Path(upload.filename or "").suffix.lower()
    if suffix not in allowed_suffix:
        raise HTTPException(
            status_code=415,
            detail=f"{field_name} must be one of {sorted(allowed_suffix)}; "
                   f"got {suffix or '(no suffix)'}",
        )
    # Read full bytes; FastAPI streams under the hood + the file is
    # closed by the framework when the request ends.
    data = upload.file.read()
    if len(data) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"{field_name} exceeds {max_bytes // 1024} KiB limit",
        )
    return data


@app.post("/api/analyze-upload")
async def post_analyze_upload(
    telemetry: UploadFile = File(..., description="CSV telemetry trace"),
    coa: UploadFile = File(..., description="JSON Certificate of Adaptations"),
    debrief: UploadFile | None = File(default=None, description="Markdown debrief"),
):
    """End-to-end multipart analyze pipeline.

    wave-48 fix for the JSON-path-only `/api/analyze` endpoint: accepts
    driver-supplied files directly via multipart/form-data. Frontend
    `/api/upload-telemetry` + `/upload` page wire to this route when
    `NEXT_PUBLIC_USE_REAL_BACKEND_V14=1` + the backend base URL is set.

    Validates extensions + size caps BEFORE touching disk so a hostile
    upload can never fill /tmp on the HF Spaces CPU instance.
    """
    telemetry_bytes = _validate_upload(
        telemetry,
        field_name="telemetry",
        required=True,
        allowed_suffix=_ALLOWED_TELEMETRY_SUFFIX,
        max_bytes=_MAX_TELEMETRY_BYTES,
    )
    coa_bytes = _validate_upload(
        coa,
        field_name="coa",
        required=True,
        allowed_suffix=_ALLOWED_COA_SUFFIX,
        max_bytes=_MAX_COA_BYTES,
    )
    debrief_bytes = _validate_upload(
        debrief,
        field_name="debrief",
        required=False,
        allowed_suffix=_ALLOWED_DEBRIEF_SUFFIX,
        max_bytes=_MAX_DEBRIEF_BYTES,
    )

    # JSON sanity-check on the COA payload before pipeline execution so
    # the 400 fires HERE instead of deep inside the parser.
    try:
        json.loads(coa_bytes.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=400,
            detail=f"coa payload is not valid JSON: {exc}",
        ) from exc

    # Per-request tempdir; cleanup in finally guarantees no leak even
    # when run_langgraph() raises.
    tmpdir = Path(tempfile.mkdtemp(prefix="apex-analyze-"))
    try:
        telemetry_path = tmpdir / "telemetry.csv"
        coa_path = tmpdir / "coa.json"
        debrief_path = tmpdir / "debrief.md" if debrief_bytes else None

        telemetry_path.write_bytes(telemetry_bytes)
        coa_path.write_bytes(coa_bytes)
        if debrief_path:
            debrief_path.write_bytes(debrief_bytes)

        trace = run_langgraph(
            telemetry_csv=telemetry_path,
            coa_json=coa_path,
            debrief_path=debrief_path,
            narrator=_build_live_narrator(),
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
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


# ---- GET /api/tspulse/anomaly (wave-48 Tier-2 ship; Vinh M3-V7) ------
#
# IBM TSPulse r1 polyphase anomaly detector against the canonical Sarah
# Reynolds telemetry fixture. When env `APEX_ENABLE_TSPULSE=1` is set
# the route invokes the real model via `tsfm_public`; otherwise the
# deterministic brake-pressure heuristic stub runs + the honest engine
# label "tspulse-stub" appears in the response.
#
# Response shape matches the frontend `TSPulseResponse` discriminated-
# union per `app/shared/types.ts` so the wire-flip helper drops the
# upstream body straight onto the panel state.


import time as _time

# Map TSPulse-scanned telemetry channels to frequency-band labels per
# the polyphase decomposition the frontend `TSPulseBand` union encodes.
# Adaptive-driver telemetry exhibits anomalies preferentially in these
# bands: speed = low (smooth dynamics), brake = mid (pulse-like driver
# input), steering = high (fast control response). Channels not in this
# map default to "low".
_CHANNEL_TO_BAND: Final[dict[str, str]] = {
    "speed_mps": "low",
    "brake_pa": "mid",
    "steering_rad": "high",
    "gear": "dc",
    "coa_overlap_flag": "dc",
}


@app.get("/api/tspulse/anomaly")
def get_tspulse_anomaly() -> dict[str, Any]:
    t_start = _time.time()
    telemetry_path, _ = _sarah_fixtures_or_503()
    telemetry = load_telemetry_csv(telemetry_path)
    result = detect_anomaly(telemetry)
    detection_ms = int((_time.time() - t_start) * 1000)
    bands_set: list[str] = []
    seen: set[str] = set()
    for ch in result.channels_scanned:
        band = _CHANNEL_TO_BAND.get(ch, "low")
        if band not in seen:
            seen.add(band)
            bands_set.append(band)
    if result.has_anomaly:
        state = {
            "status": "anomaly",
            "window_index": result.window_index,
            "score": result.score,
            "threshold_p95": result.threshold,
            "affected_bands": bands_set if bands_set else ["mid"],
            "detection_ms": detection_ms,
        }
    else:
        state = {
            "status": "clean",
            "window_index": result.window_index,
            "score": result.score,
            "threshold_p95": result.threshold,
            "detection_ms": detection_ms,
        }
    return {
        "engine": result.engine,
        "compute_ms": detection_ms,
        "state": state,
        "swap_point": (
            "Vinh M3-V7 -> app/backend/apex/tspulse/anomaly.py "
            "(IBM Granite TimeSeries TSPulse r1 polyphase anomaly head)"
        ),
    }


__all__ = ["app"]
