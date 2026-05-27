"""FastAPI HTTP wrapper tests (Phase 5 task 5.2 + 5.3 deploy smoke).

Exercises every route via the FastAPI TestClient. No real network;
fully in-process. Validates status codes match the wave-41 spec
(200 / 400 / 413 / 503 where applicable) + the JSON shape contract.
"""

from __future__ import annotations

from pathlib import Path

import pytest

fastapi = pytest.importorskip("fastapi")
from fastapi.testclient import TestClient

from apex.server import app

REPO_ROOT = Path(__file__).resolve().parents[3]
SARAH_CSV = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-telemetry.csv"
SARAH_COA = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-coa-stub.json"
SARAH_DEBRIEF = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-debrief.md"


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_healthz_returns_ok(client):
    r = client.get("/healthz")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


# ---- POST /api/audit-log ---------------------------------------------

def test_audit_log_post_persists(client, tmp_path, monkeypatch):
    # Redirect the audit-log to a tmp file so we do not pollute home dir.
    from apex.orchestration.audit_log import AuditLogStore
    import apex.server as server_mod
    monkeypatch.setattr(
        server_mod, "_audit_store",
        AuditLogStore(file_path=tmp_path / "audit-log.jsonl"),
    )
    payload = {
        "written_at_iso": "2026-05-27T07:00:00+00:00",
        "commit_sha": "abc1234",
        "verdict": {"verdict": "approve", "audit_id": "deadbeef",
                     "reasoning_trace": ["ok"]},
    }
    r = client.post("/api/audit-log", json=payload)
    assert r.status_code == 200
    body = r.json()
    assert body["persisted"] is True
    assert body["line_index"] == 0


def test_audit_log_413_on_oversize(client, tmp_path, monkeypatch):
    from apex.orchestration.audit_log import AuditLogStore, MAX_LINE_BYTES
    import apex.server as server_mod
    monkeypatch.setattr(
        server_mod, "_audit_store",
        AuditLogStore(file_path=tmp_path / "audit-log.jsonl"),
    )
    huge = {"verdict": {"reasoning_trace": ["x" * (MAX_LINE_BYTES + 100)]}}
    r = client.post("/api/audit-log", json=huge)
    assert r.status_code == 413


def test_audit_log_400_on_non_object(client):
    r = client.post("/api/audit-log", json=["not", "an", "object"])
    assert r.status_code == 400


# ---- POST /api/what-if-replay ----------------------------------------

def test_what_if_replay_known_keys_succeeds(client):
    r = client.post("/api/what-if-replay", json={
        "baseline_fixture_id": "C14-04-jerk-bound",
        "mutation_key": "MUTATION_COA_OVERLAP_INVERT",
    })
    assert r.status_code == 200
    body = r.json()
    assert body["mutated_fixture"]["id"] == "C14-04-jerk-bound"
    assert "ENGINE v2_cvxpylayers" in body["replayed_violation_log"]


def test_what_if_replay_unknown_fixture_returns_400(client):
    r = client.post("/api/what-if-replay", json={
        "baseline_fixture_id": "unknown",
        "mutation_key": "MUTATION_COA_OVERLAP_INVERT",
    })
    assert r.status_code == 400


def test_what_if_replay_unknown_mutation_returns_400(client):
    r = client.post("/api/what-if-replay", json={
        "baseline_fixture_id": "C14-04-jerk-bound",
        "mutation_key": "UNKNOWN_MUTATION",
    })
    assert r.status_code == 400


def test_what_if_replay_missing_fields_returns_400(client):
    r = client.post("/api/what-if-replay", json={})
    assert r.status_code == 400


# ---- GET /api/orchestration (wave-47 cascade-#53 wire-flip V14) ------
# These tests lock the canonical Sarah-fixture filenames the endpoint
# resolves at request time. The previous filename drift
# (sarah-reynolds-coa.json instead of sarah-reynolds-coa-stub.json)
# silently returned 503 because the wire-flip helper fell back to
# canned, masking a deploy that never actually lit up to real data.

def test_orchestration_returns_200_with_canonical_fixtures(client):
    r = client.get("/api/orchestration")
    assert r.status_code == 200, (
        f"GET /api/orchestration returned {r.status_code}; "
        f"check fixture filenames in _sarah_fixtures_or_503(). "
        f"Body: {r.json()}"
    )


def test_orchestration_emits_6_node_trace_in_frontend_shape(client):
    r = client.get("/api/orchestration")
    assert r.status_code == 200
    body = r.json()
    # Frontend wire-flip helper expects engine + trace_id + nodes[] +
    # total_ms + swap_point + compute_ms per Stephen commit ec21681.
    assert body["engine"] == "langgraph-v14-real"
    assert body["trace_id"]
    assert isinstance(body["total_ms"], int)
    assert body["swap_point"] == "Vinh M3-V14"
    assert body["compute_ms"] >= 0
    nodes = body["nodes"]
    assert len(nodes) == 6
    expected_ids = ["ingestion", "rag", "projection", "guardian",
                     "instruct", "provenance"]
    actual_ids = [n["id"] for n in nodes]
    assert actual_ids == expected_ids
    for node in nodes:
        assert node["status"] == "ok"
        assert node["label"]   # title-cased frontend display string
        assert node["elapsed_ms"] >= 0


def test_orchestration_503_when_fixtures_missing(client, tmp_path, monkeypatch):
    """If the canonical Sarah fixtures move or get deleted, the endpoint
    MUST return 503 so the frontend wire-flip helper falls back to canned
    rather than failing the request. Per Stephen comment ec21681 L150-152.
    """
    import apex.server as server_mod

    def fake_fixtures_or_503():
        from fastapi import HTTPException
        raise HTTPException(
            status_code=503,
            detail="sarah-reynolds canonical fixtures missing on backend",
        )

    monkeypatch.setattr(
        server_mod, "_sarah_fixtures_or_503", fake_fixtures_or_503,
    )
    r = client.get("/api/orchestration")
    assert r.status_code == 503
    assert "missing" in r.json()["detail"].lower()


def test_orchestration_fixture_filenames_match_disk(client):
    """Regression lock for the wave-47 ec21681 filename drift bug.

    Stephen's first cut named `sarah-reynolds-coa.json` but the file on
    disk is `sarah-reynolds-coa-stub.json`. This test asserts the
    canonical filenames the endpoint resolves to actually exist; the
    integration test above (200 check) catches the resolved path being
    importable end-to-end.
    """
    from apex.server import _sarah_fixtures_or_503
    telemetry, coa = _sarah_fixtures_or_503()
    assert telemetry.exists(), f"telemetry fixture missing: {telemetry}"
    assert coa.exists(), f"coa fixture missing: {coa}"
    assert telemetry.name == "sarah-reynolds-telemetry.csv"
    assert coa.name == "sarah-reynolds-coa-stub.json"


# ---- GET /api/session-context ----------------------------------------

def test_session_context_returns_tiles(client):
    r = client.get("/api/session-context")
    assert r.status_code == 200
    body = r.json()
    assert "tiles" in body and isinstance(body["tiles"], list)
    assert len(body["tiles"]) >= 4
    for tile in body["tiles"]:
        for key in ("key", "label", "value", "detail", "severity"):
            assert key in tile
        assert tile["severity"] in ("ok", "monitor", "critical")
    assert body["fetched_at_iso"]


# ---- POST /api/analyze (deploy smoke per task 5.3) -------------------

def test_analyze_end_to_end_on_sarah_fixtures(client):
    r = client.post("/api/analyze", json={
        "telemetry_csv_path": str(SARAH_CSV),
        "coa_json_path": str(SARAH_COA),
        "debrief_path": str(SARAH_DEBRIEF),
    })
    assert r.status_code == 200
    body = r.json()
    cr = body["coaching_report"]
    assert cr["driver_id"] == "sarah-reynolds-britcar-2026"
    assert len(cr["corners"]) > 0
    assert cr["audit"]["audit_id"]
    # 6-node LangGraph trace surfaces.
    nodes = [s["node"] for s in body["trace"]]
    assert nodes == ["ingestion", "rag", "projection", "guardian",
                      "instruct", "provenance"]
    assert body["swap_point"] == "Vinh M3-V14"


def test_analyze_missing_fixture_returns_404(client):
    r = client.post("/api/analyze", json={
        "telemetry_csv_path": "/no/such/path.csv",
        "coa_json_path": str(SARAH_COA),
    })
    assert r.status_code == 404


def test_analyze_missing_payload_field_returns_400(client):
    r = client.post("/api/analyze", json={"telemetry_csv_path": str(SARAH_CSV)})
    assert r.status_code == 400


# ---- POST /api/analyze-upload (wave-48 multipart fix) ----------------
# Driver-supplied multipart file upload. Same response shape as
# /api/analyze; same LangGraph pipeline; per-request tempdir cleanup.


def test_analyze_upload_end_to_end_on_sarah_multipart(client):
    """Multipart upload of Sarah fixtures returns the same shape as the
    JSON-path variant. Validates the wave-48 fix closes the production
    blocker that /api/analyze could not accept browser-uploaded files.
    """
    with SARAH_CSV.open("rb") as t, SARAH_COA.open("rb") as c, SARAH_DEBRIEF.open("rb") as d:
        files = {
            "telemetry": (SARAH_CSV.name, t, "text/csv"),
            "coa": (SARAH_COA.name, c, "application/json"),
            "debrief": (SARAH_DEBRIEF.name, d, "text/markdown"),
        }
        r = client.post("/api/analyze-upload", files=files)
    assert r.status_code == 200, r.text
    body = r.json()
    cr = body["coaching_report"]
    assert cr["driver_id"] == "sarah-reynolds-britcar-2026"
    assert len(cr["corners"]) > 0
    nodes = [s["node"] for s in body["trace"]]
    assert nodes == ["ingestion", "rag", "projection", "guardian",
                      "instruct", "provenance"]
    assert body["swap_point"] == "Vinh M3-V14"


def test_analyze_upload_missing_telemetry_returns_400(client):
    with SARAH_COA.open("rb") as c:
        r = client.post(
            "/api/analyze-upload",
            files={"coa": (SARAH_COA.name, c, "application/json")},
        )
    assert r.status_code == 422  # FastAPI's missing-required-field code


def test_analyze_upload_wrong_extension_returns_415(client):
    fake_telemetry = b"not,a,csv"
    fake_coa = b'{"driver_id": "test"}'
    files = {
        "telemetry": ("telemetry.xlsx", fake_telemetry, "application/octet-stream"),
        "coa": ("coa.json", fake_coa, "application/json"),
    }
    r = client.post("/api/analyze-upload", files=files)
    assert r.status_code == 415
    assert "telemetry must be" in r.json()["detail"]


def test_analyze_upload_oversize_returns_413(client):
    # 11 MiB telemetry exceeds the 10 MiB cap
    too_big = b"a" * (11 * 1024 * 1024)
    small_coa = b'{"driver_id": "test"}'
    files = {
        "telemetry": ("telemetry.csv", too_big, "text/csv"),
        "coa": ("coa.json", small_coa, "application/json"),
    }
    r = client.post("/api/analyze-upload", files=files)
    assert r.status_code == 413


def test_analyze_upload_invalid_json_coa_returns_400(client):
    csv = SARAH_CSV.read_bytes()
    bad_coa = b"not json at all {{"
    files = {
        "telemetry": ("telemetry.csv", csv, "text/csv"),
        "coa": ("coa.json", bad_coa, "application/json"),
    }
    r = client.post("/api/analyze-upload", files=files)
    assert r.status_code == 400
    assert "not valid JSON" in r.json()["detail"]


def test_analyze_upload_no_debrief_succeeds(client):
    """Debrief is optional; omit it + the pipeline still runs."""
    with SARAH_CSV.open("rb") as t, SARAH_COA.open("rb") as c:
        files = {
            "telemetry": (SARAH_CSV.name, t, "text/csv"),
            "coa": (SARAH_COA.name, c, "application/json"),
        }
        r = client.post("/api/analyze-upload", files=files)
    assert r.status_code == 200
    body = r.json()
    assert body["coaching_report"]["driver_id"] == "sarah-reynolds-britcar-2026"


# ---- CORS preflight ---------------------------------------------------
# wave-48: production frontend at apex-one-black.vercel.app needs to call
# the backend cross-origin. CORS middleware allows the production origin
# + localhost. Verify the preflight returns the required headers.


def test_cors_preflight_allows_production_origin(client):
    r = client.options(
        "/api/analyze-upload",
        headers={
            "Origin": "https://apex-one-black.vercel.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert r.status_code in (200, 204)
    assert r.headers.get("access-control-allow-origin") == \
        "https://apex-one-black.vercel.app"
