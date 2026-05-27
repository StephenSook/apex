"""LangGraph runtime state machine tests (Phase 4 task 4.1, M3-V14 swap-point).

Per D-017 + plan task 4.1: LangGraph executes the 6-node orchestration
graph (ingestion -> RAG -> projection -> guardian -> instruct ->
provenance) over a CoachingReport. The runtime is the Vinh-side
production path the frontend `LangGraphRuntimePanel` will consume.

This module ships a pure-Python state machine that mirrors the LangGraph
node order. The actual `langgraph` package is a heavy DAG runtime + LLM
adapter; the deterministic equivalence test here proves the order is
correct without taking the LangGraph dependency. Stephen-side frontend
panel asserts the same 6-node trace surface.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from apex.orchestration.langgraph_runtime import (
    EXPECTED_NODE_ORDER,
    LangGraphRuntime,
    NodeExecutionTrace,
    run_langgraph,
)

REPO_ROOT = Path(__file__).resolve().parents[3]
SARAH_CSV = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-telemetry.csv"
SARAH_COA = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-coa-stub.json"
SARAH_DEBRIEF = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-debrief.md"


def test_node_order_canonical():
    assert EXPECTED_NODE_ORDER == (
        "ingestion",
        "rag",
        "projection",
        "guardian",
        "instruct",
        "provenance",
    )


def test_run_langgraph_emits_full_6_node_trace():
    trace = run_langgraph(
        telemetry_csv=SARAH_CSV,
        coa_json=SARAH_COA,
        debrief_path=SARAH_DEBRIEF,
    )
    nodes = tuple(t.node for t in trace.steps)
    assert nodes == EXPECTED_NODE_ORDER


def test_run_langgraph_produces_coaching_report():
    trace = run_langgraph(
        telemetry_csv=SARAH_CSV, coa_json=SARAH_COA, debrief_path=SARAH_DEBRIEF,
    )
    assert trace.final_report is not None
    assert trace.final_report.driver_id == "sarah-reynolds-britcar-2026"


def test_each_trace_step_has_duration():
    trace = run_langgraph(
        telemetry_csv=SARAH_CSV, coa_json=SARAH_COA, debrief_path=SARAH_DEBRIEF,
    )
    for step in trace.steps:
        assert step.duration_ms >= 0


def test_runtime_can_be_constructed_directly():
    runtime = LangGraphRuntime()
    assert runtime is not None
    trace = runtime.execute(
        telemetry_csv=SARAH_CSV, coa_json=SARAH_COA, debrief_path=SARAH_DEBRIEF,
    )
    assert trace.final_report is not None


def test_each_node_emits_status_ok_on_clean_run():
    trace = run_langgraph(
        telemetry_csv=SARAH_CSV, coa_json=SARAH_COA, debrief_path=SARAH_DEBRIEF,
    )
    for step in trace.steps:
        assert step.status == "ok"


def test_trace_surface_swap_point_named_m3_v14():
    """Stephen frontend `LangGraphRuntimePanel` (commit `9867885`)
    expects the swap_point identifier to be `Vinh M3-V14`. The runtime
    surfaces this on the response so the panel can verify which engine
    produced the trace."""
    trace = run_langgraph(
        telemetry_csv=SARAH_CSV, coa_json=SARAH_COA, debrief_path=SARAH_DEBRIEF,
    )
    assert trace.swap_point == "Vinh M3-V14"
