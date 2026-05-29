"""Unit tests for the live request-metrics aggregator (wave-53).

Pure-stdlib; no FastAPI app import required so this runs without the full
backend dependency set installed.
"""

from __future__ import annotations

from apex.observability_metrics import record_request, reset_metrics, snapshot


def setup_function(_fn):
    reset_metrics()


def test_empty_snapshot_is_honest_cold_start():
    snap = snapshot()
    assert snap["total_requests"] == 0
    assert snap["latency_ms"]["p50"] == 0.0
    assert snap["latency_ms"]["window"] == 0
    assert snap["recent_traces"] == []
    assert snap["status_class"] == {"2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0}


def test_records_counts_status_class_and_route_average():
    record_request(route="/api/analyze", method="POST", status=200, duration_ms=120.0, trace_id="a" * 32)
    record_request(route="/api/analyze", method="POST", status=500, duration_ms=80.0)
    snap = snapshot()
    assert snap["total_requests"] == 2
    assert snap["status_class"]["2xx"] == 1
    assert snap["status_class"]["5xx"] == 1
    assert snap["by_route"]["/api/analyze"]["count"] == 2
    assert snap["by_route"]["/api/analyze"]["avg_ms"] == 100.0


def test_percentiles_are_monotonic():
    for i in range(1, 101):
        record_request(route="/r", method="GET", status=200, duration_ms=float(i))
    lat = snapshot()["latency_ms"]
    assert lat["p50"] <= lat["p95"] <= lat["p99"]
    assert lat["window"] == 100


def test_recent_traces_only_surface_requests_with_trace_ids():
    record_request(route="/r", method="GET", status=200, duration_ms=5.0, trace_id="b" * 32)
    record_request(route="/r", method="GET", status=200, duration_ms=5.0)  # no trace_id
    traces = snapshot()["recent_traces"]
    assert len(traces) == 1
    assert traces[0]["trace_id"] == "b" * 32
    assert traces[0]["route"] == "/r"
