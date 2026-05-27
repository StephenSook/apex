"""Pydantic v2 request + response schemas for the APEX backend (wave-48).

OVERRIDE quality-bar audit close-out per `feedback_three_brain_review_
pattern.md`: the OVERRIDE 10-tool fully-WIRED competitor ships Pydantic
v2 typed transit objects on every route. This module replicates that
posture on the APEX backend so FastAPI auto-validates request bodies +
auto-serializes responses against typed schemas.

Convention:
  - Request models suffixed `Req` (e.g. `AuditLogReq`).
  - Response models suffixed `Resp`.
  - Discriminated unions use `model_config` literal-tag on the wire
    when the frontend type uses a discriminated-union (matches the
    `TSPulseAnomalyState` shape on `app/shared/types.ts`).
  - Frozen models via `model_config = ConfigDict(frozen=True)` so
    constructed instances cannot drift mid-handler.
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class FrozenModel(BaseModel):
    """Base class for immutable response models."""

    model_config = ConfigDict(frozen=True, extra="forbid")


# ---- Healthz ---------------------------------------------------------


class HealthzResp(FrozenModel):
    status: Literal["ok"]


# ---- Audit log -------------------------------------------------------


class AuditLogReq(BaseModel):
    """Loose audit-log payload; backend accepts arbitrary verdict shapes."""

    model_config = ConfigDict(extra="allow")


class AuditLogResp(FrozenModel):
    persisted: bool
    line_index: int
    file_path: str


# ---- What-if replay --------------------------------------------------


class WhatIfReplayReq(BaseModel):
    baseline_fixture_id: str = Field(..., min_length=1, max_length=128)
    mutation_key: str = Field(..., min_length=1, max_length=128)


class WhatIfReplayResp(FrozenModel):
    mutated_fixture: dict
    replayed_violation_log: str
    schema_version: int
    protocol_version: int


# ---- Session context -------------------------------------------------


class SessionTile(FrozenModel):
    key: str
    label: str
    value: str
    detail: str
    severity: Literal["ok", "monitor", "critical"]


class SessionContextResp(FrozenModel):
    tiles: list[SessionTile]
    fetched_at_iso: str


# ---- Orchestration trace ---------------------------------------------


class OrchestrationNode(FrozenModel):
    id: str
    label: str
    status: str
    elapsed_ms: float


class OrchestrationResp(FrozenModel):
    engine: str
    trace_id: str
    nodes: list[OrchestrationNode]
    total_ms: int
    swap_point: str
    compute_ms: int


# ---- TSPulse anomaly -------------------------------------------------


class TSPulseStateClean(FrozenModel):
    status: Literal["clean"]
    window_index: int
    score: float
    threshold_p95: float
    detection_ms: int


class TSPulseStateAnomaly(FrozenModel):
    status: Literal["anomaly"]
    window_index: int
    score: float
    threshold_p95: float
    affected_bands: list[Literal["dc", "low", "mid", "high"]]
    detection_ms: int


class TSPulseStateError(FrozenModel):
    status: Literal["error"]
    message: str


TSPulseState = TSPulseStateClean | TSPulseStateAnomaly | TSPulseStateError


class TSPulseResp(FrozenModel):
    engine: Literal[
        "tspulse-v7-canned-fallback",
        "tspulse-v7-real",
        "tspulse-r1-anomaly",
        "tspulse-stub",
    ]
    compute_ms: int
    state: TSPulseState
    swap_point: str


# ---- Analyze ---------------------------------------------------------


class AnalyzeReq(BaseModel):
    telemetry_csv_path: str = Field(..., min_length=1)
    coa_json_path: str = Field(..., min_length=1)
    debrief_path: Optional[str] = None


class AnalyzeTraceStep(FrozenModel):
    node: str
    status: str
    duration_ms: float
    detail: str


class AnalyzeResp(FrozenModel):
    coaching_report: dict
    trace: list[AnalyzeTraceStep]
    swap_point: str


__all__ = [
    "AnalyzeReq",
    "AnalyzeResp",
    "AnalyzeTraceStep",
    "AuditLogReq",
    "AuditLogResp",
    "FrozenModel",
    "HealthzResp",
    "OrchestrationNode",
    "OrchestrationResp",
    "SessionContextResp",
    "SessionTile",
    "TSPulseResp",
    "TSPulseState",
    "TSPulseStateAnomaly",
    "TSPulseStateClean",
    "TSPulseStateError",
    "WhatIfReplayReq",
    "WhatIfReplayResp",
]
