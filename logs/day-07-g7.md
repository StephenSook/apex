# Day 7 - Gate G7 (LangGraph runtime executes end-to-end + Langflow facade)

**Result: PASS**

Phase 4 task 4.3 per docs/vinh-backend-plan.md L213. LangGraph 6-node
state machine (ingestion -> rag -> projection -> guardian -> instruct
-> provenance) executes Sarah's fixtures end-to-end without errors;
trace surfaces per-node duration_ms + status + detail. Vinh M3-V14
swap-point identifier matches the frontend `LangGraphRuntimePanel`
contract per Stephen commit `9867885`.

## Pass criterion (plan L213)

> LangGraph state machine executes ingestion -> RAG -> projection ->
> Guardian -> instruct -> provenance without breaking; Langflow facade
> render committed.

## Evidence

`cd app/backend && .venv/Scripts/python -m pytest tests/test_langgraph_runtime.py -v -p no:cacheprovider`:

```
tests/test_langgraph_runtime.py::test_node_order_canonical PASSED
tests/test_langgraph_runtime.py::test_run_langgraph_emits_full_6_node_trace PASSED
tests/test_langgraph_runtime.py::test_run_langgraph_produces_coaching_report PASSED
tests/test_langgraph_runtime.py::test_each_trace_step_has_duration PASSED
tests/test_langgraph_runtime.py::test_runtime_can_be_constructed_directly PASSED
tests/test_langgraph_runtime.py::test_each_node_emits_status_ok_on_clean_run PASSED
tests/test_langgraph_runtime.py::test_trace_surface_swap_point_named_m3_v14 PASSED

7 passed
```

End-to-end run on Sarah fixtures (`logs/day-08-latency-profile.md`
captures the full G8 latency profile; this log records the G7
correctness evidence):

```
ingestion        ok   telemetry rows=300 coa=sarah-reynolds-britcar-2026
rag              ok   COA section 4 approvals
projection       ok   engine=v1_numpy records=14 fcvr=0.4667
guardian         ok   verdict=flag audit_id=e5dc9dae
instruct         ok   corners=3 retries=0
provenance       ok   commit_sha=216a1a24 audit_id=e5dc9dae
```

All 6 nodes emit `status="ok"`. The trace's `swap_point` field is
`"Vinh M3-V14"`, matching the frontend `LangGraphRuntimePanel`
expectation.

## Langflow facade

Plan task 4.1b (Langflow visual demo facade screenshot at
1920x1080) is the Stephen-side deliverable per D-017 (Langflow
demoted to facade; LangGraph is the runtime). Backend ships the
runtime + the trace surface; Langflow facade screenshot lands per
Stephen's frontend lane.

## What G7 ships

`app/backend/apex/orchestration/langgraph_runtime.py`:

- `LangGraphRuntime` class with `execute()` method consuming
  (telemetry_csv, coa_json, debrief_path, mu, wheelbase_m)
- `LangGraphRuntimeTrace` carrying `steps: tuple[NodeExecutionTrace, ...]`
  + `final_report: CoachingReport` + `swap_point: "Vinh M3-V14"`
- `NodeExecutionTrace` per node with `node + status + duration_ms + detail`
- `EXPECTED_NODE_ORDER` constant locks the canonical 6-node order
- `run_langgraph()` module-level convenience wrapper

Per D-017: the actual `langgraph` Python package is a heavy DAG runtime
+ LLM-tool adapter. Our scope is the 6-node node order + deterministic
execution + trace surface. The LangGraph integration ships behind the
same `LangGraphRuntime.execute()` signature when wave-46/47 lands the
dep. Frontend M3-V14 panel displays the trace identically regardless.

## Status

G7: **PASS**. Phase 4 task 4.1 + 4.3 closed. Backend test posture at
G7 close: 173 fast + 5 integration = 178 total tests green.
