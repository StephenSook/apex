"""LangGraph 6-node state-machine runtime (Phase 4 task 4.1; M3-V14 swap-point).

Per D-017 + plan task 4.1, the runtime orchestrates the 6-node pipeline:
  ingestion -> rag -> projection -> guardian -> instruct -> provenance

Each node consumes the prior node's output + emits a deterministic
result. Trace surface (per-node duration_ms + status) wires the
Stephen-side `LangGraphRuntimePanel` (commit `9867885`) via M3-V14.

Implementation note: the actual `langgraph` Python package is a heavy
DAG runtime with LLM-tool adapters. Our hackathon scope is the 6-node
node order + the deterministic execution + the trace surface; the
LangGraph integration ships behind the same `LangGraphRuntime.execute()`
signature when wave-46/47 lands the runtime. Frontend M3-V14 panel
displays the trace exactly the same way regardless.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Final, Literal, Optional

from apex.guardian.audit import Guardian
from apex.instruct.coa_parser import parse_coa_json
from apex.instruct.narrator import CoachingReport, Narrator, NarratorInputs
from apex.physics.validator import ToleranceBands, validate_forecast
from apex.pipelines.telemetry_to_log import load_telemetry_csv
from apex.shared.contracts import (
    HORIZON,
    PhysicsViolationLog,
    build_ttm_input,
    channel_index,
)

EXPECTED_NODE_ORDER: Final[tuple[str, ...]] = (
    "ingestion",
    "rag",
    "projection",
    "guardian",
    "instruct",
    "provenance",
)

NodeStatus = Literal["ok", "error", "skipped"]


@dataclass(frozen=True)
class NodeExecutionTrace:
    node: str
    status: NodeStatus
    duration_ms: float
    detail: str = ""


@dataclass(frozen=True)
class LangGraphRuntimeTrace:
    steps: tuple[NodeExecutionTrace, ...]
    final_report: Optional[CoachingReport]
    swap_point: str = "Vinh M3-V14"


def _coerce_to_horizon(telemetry):
    import numpy as np
    if telemetry.shape[0] >= HORIZON:
        return telemetry[-HORIZON:].astype(np.float64, copy=True)
    pad = np.repeat(telemetry[-1:], HORIZON - telemetry.shape[0], axis=0)
    return np.concatenate([telemetry, pad], axis=0).astype(np.float64, copy=True)


class LangGraphRuntime:
    """6-node orchestration runtime."""

    def execute(
        self,
        *,
        telemetry_csv: Path | str,
        coa_json: Path | str,
        debrief_path: Path | str | None = None,
        mu: float = 1.2,
        wheelbase_m: float = 2.7,
    ) -> LangGraphRuntimeTrace:
        steps: list[NodeExecutionTrace] = []

        # ---- Node 1: ingestion ------------------------------------
        t0 = time.time()
        telemetry = load_telemetry_csv(Path(telemetry_csv))
        coa = parse_coa_json(Path(coa_json))
        debrief = (
            Path(debrief_path).read_text(encoding="utf-8")
            if debrief_path else ""
        )
        steps.append(NodeExecutionTrace(
            node="ingestion",
            status="ok",
            duration_ms=(time.time() - t0) * 1000.0,
            detail=f"telemetry rows={telemetry.shape[0]} coa={coa.driver_id}",
        ))

        # ---- Node 2: rag ------------------------------------------
        t0 = time.time()
        # RAG retrieval lives on the Stephen-side wave-46 rag-retrieve
        # frontend route (commit `923c51e`); the backend orchestration
        # node here is a placeholder that records the rag-retrieve
        # invocation point. Production swap is one fetch() call away.
        rag_anchor = f"COA section {len(coa.conditional_approvals)} approvals"
        steps.append(NodeExecutionTrace(
            node="rag",
            status="ok",
            duration_ms=(time.time() - t0) * 1000.0,
            detail=rag_anchor,
        ))

        # ---- Node 3: projection -----------------------------------
        t0 = time.time()
        forecast = _coerce_to_horizon(telemetry)
        batched = forecast[None, :, :]
        tiled = build_ttm_input(
            batched, simultaneity_permitted=coa.simultaneity_permitted,
        )
        forecast = tiled[0]
        simultaneity_channel = forecast[:, channel_index("coa_overlap_flag")]
        violation_log: PhysicsViolationLog = validate_forecast(
            forecast,
            mu=mu,
            wheelbase_m=wheelbase_m,
            simultaneity_channel=simultaneity_channel,
            bands=ToleranceBands.for_1hz_aggregation(),
        )
        steps.append(NodeExecutionTrace(
            node="projection",
            status="ok",
            duration_ms=(time.time() - t0) * 1000.0,
            detail=(
                f"engine={violation_log.engine} "
                f"records={len(violation_log.records)} "
                f"fcvr={violation_log.fcvr():.4f}"
            ),
        ))

        # ---- Node 4: guardian -------------------------------------
        t0 = time.time()
        guardian_audit = Guardian().audit(
            violation_log=violation_log, coa=coa,
        )
        steps.append(NodeExecutionTrace(
            node="guardian",
            status="ok",
            duration_ms=(time.time() - t0) * 1000.0,
            detail=(
                f"verdict={guardian_audit.verdict} "
                f"audit_id={guardian_audit.audit_id[:8]}"
            ),
        ))

        # ---- Node 5: instruct -------------------------------------
        t0 = time.time()
        narrator_inputs = NarratorInputs(
            forecast=forecast,
            coa=coa,
            violation_log=violation_log,
            guardian_audit=guardian_audit,
            debrief=debrief,
        )
        narrator_out = Narrator().narrate(narrator_inputs)
        steps.append(NodeExecutionTrace(
            node="instruct",
            status="ok",
            duration_ms=(time.time() - t0) * 1000.0,
            detail=(
                f"corners={len(narrator_out.coaching_report.corners)} "
                f"retries={narrator_out.retry_count}"
            ),
        ))

        # ---- Node 6: provenance -----------------------------------
        t0 = time.time()
        provenance = narrator_out.coaching_report.provenance
        steps.append(NodeExecutionTrace(
            node="provenance",
            status="ok",
            duration_ms=(time.time() - t0) * 1000.0,
            detail=(
                f"commit_sha={provenance.commit_sha[:8]} "
                f"audit_id={guardian_audit.audit_id[:8]}"
            ),
        ))

        return LangGraphRuntimeTrace(
            steps=tuple(steps),
            final_report=narrator_out.coaching_report,
        )


def run_langgraph(
    *,
    telemetry_csv: Path | str,
    coa_json: Path | str,
    debrief_path: Path | str | None = None,
    mu: float = 1.2,
    wheelbase_m: float = 2.7,
) -> LangGraphRuntimeTrace:
    """Module-level convenience wrapper."""
    return LangGraphRuntime().execute(
        telemetry_csv=telemetry_csv,
        coa_json=coa_json,
        debrief_path=debrief_path,
        mu=mu,
        wheelbase_m=wheelbase_m,
    )


__all__ = [
    "EXPECTED_NODE_ORDER",
    "LangGraphRuntime",
    "LangGraphRuntimeTrace",
    "NodeExecutionTrace",
    "NodeStatus",
    "run_langgraph",
]
