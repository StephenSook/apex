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
