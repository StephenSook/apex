"""Orchestration layer (Phase 4).

Modules:
  - audit_log.py: POST /api/audit-log JSONL append + rotation (task 4.M3a)
  - what_if_replay.py: POST /api/what-if-replay V2 re-projection (task 4.M3b)
  - session_context.py: GET /api/session-context tile feed (task 4.M3c)
  - langgraph_runtime.py: 6-node state machine, M3-V14 swap-point (task 4.1)
"""
