"""End-to-end Sarah pipeline (Phase 3 task 3.5).

Wires the full Day-6 Vinh-lane backend path:
  Sarah CSV + COA + debrief
    -> load_telemetry_csv
    -> build_ttm_input (tile COA simultaneity flag)
    -> validate_forecast (V1 NumPy floor)
    -> Guardian.audit (BYOC rule registry)
    -> Narrator.narrate (assemble CoachingReport)

Output: a CoachingReport JSON-serializable dict matching the canonical
frontend contract at app/shared/types.ts L436. Provenance footer carries
non-None audit_id (Software Lead fix #9); every citation resolves to
the input CoaParseResult (no hallucinated FIA Articles per project
compliance).

This is the G6 reproducibility surface. The /api/analyze production
route on the frontend will call this same pipeline assembly logic.
"""

from __future__ import annotations

import json
from dataclasses import asdict, is_dataclass
from pathlib import Path
from typing import Any

import numpy as np

from apex.guardian.audit import Guardian
from apex.instruct.coa_parser import CoaParseResult, parse_coa_json
from apex.instruct.narrator import CoachingReport, Narrator, NarratorInputs
from apex.physics.validator import ToleranceBands, validate_forecast
from apex.pipelines.telemetry_to_log import load_telemetry_csv
from apex.shared.contracts import (
    HORIZON,
    PhysicsViolationLog,
    build_ttm_input,
    channel_index,
)


def _coerce_to_horizon(telemetry: np.ndarray) -> np.ndarray:
    """Take the last HORIZON rows of telemetry as the forecast input.

    Sarah's 5-lap fixture has 300 rows; the validator + narrator are
    horizon-scoped. The naive forecast for G6 is "predict the next 30
    seconds look like the most recent 30 seconds" (seasonal-naive
    baseline per G4 framing); G9 will swap in three-track fusion.
    """
    if telemetry.shape[0] >= HORIZON:
        return telemetry[-HORIZON:].astype(np.float64, copy=True)
    pad = np.repeat(telemetry[-1:], HORIZON - telemetry.shape[0], axis=0)
    return np.concatenate([telemetry, pad], axis=0).astype(np.float64, copy=True)


def run_sarah_e2e(
    *,
    telemetry_csv: Path | str,
    coa_json: Path | str,
    debrief_path: Path | str | None = None,
    mu: float = 1.2,
    wheelbase_m: float = 2.7,
) -> CoachingReport:
    """End-to-end Sarah pipeline. Returns a CoachingReport dataclass.

    Use `coaching_report_to_dict()` to serialize for the wire.
    """
    telemetry = load_telemetry_csv(Path(telemetry_csv))
    coa = parse_coa_json(Path(coa_json))
    debrief = Path(debrief_path).read_text(encoding="utf-8") if debrief_path else ""

    forecast = _coerce_to_horizon(telemetry)
    # Tile the COA simultaneity flag into the forecast's coa_overlap_flag
    # channel via the single-source-of-truth adapter.
    batched = forecast[None, :, :]
    tiled = build_ttm_input(batched, simultaneity_permitted=coa.simultaneity_permitted)
    forecast = tiled[0]

    simultaneity_channel = forecast[:, channel_index("coa_overlap_flag")]
    log: PhysicsViolationLog = validate_forecast(
        forecast,
        mu=mu,
        wheelbase_m=wheelbase_m,
        simultaneity_channel=simultaneity_channel,
        bands=ToleranceBands.for_1hz_aggregation(),
    )

    audit = Guardian().audit(violation_log=log, coa=coa)
    narrator = Narrator()
    inputs = NarratorInputs(
        forecast=forecast,
        coa=coa,
        violation_log=log,
        guardian_audit=audit,
        debrief=debrief,
    )
    out = narrator.narrate(inputs)
    return out.coaching_report


def _dataclass_to_dict(obj: Any) -> Any:
    """Recursive dataclass + tuple -> JSON-serializable conversion."""
    if is_dataclass(obj) and not isinstance(obj, type):
        return {k: _dataclass_to_dict(v) for k, v in asdict(obj).items()}
    if isinstance(obj, (tuple, list)):
        return [_dataclass_to_dict(v) for v in obj]
    if isinstance(obj, dict):
        return {k: _dataclass_to_dict(v) for k, v in obj.items()}
    return obj


def coaching_report_to_dict(report: CoachingReport) -> dict[str, Any]:
    return _dataclass_to_dict(report)


def coaching_report_to_json(report: CoachingReport, *, indent: int = 2) -> str:
    return json.dumps(coaching_report_to_dict(report), indent=indent, sort_keys=False)


__all__ = [
    "coaching_report_to_dict",
    "coaching_report_to_json",
    "run_sarah_e2e",
]
