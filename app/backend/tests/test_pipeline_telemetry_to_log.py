"""End-to-end pipeline test: telemetry CSV -> validator -> text violation log.

Phase 2 Day 4 task 2.9. The script `apex.pipelines.telemetry_to_log` is
the runnable demo entry point. This test covers the in-process function
surface (load_telemetry_csv + run_pipeline) without invoking the CLI;
the CLI is a thin wrapper.

Two modes:
  - naive forecast (telemetry IS the forecast): cheap, no TTM model
    load, exercises the validator + log serializer end-to-end. The
    G4 bake-off (task 2.11) will use this as the seasonal-naive
    baseline.
  - TTM forecast: requires the real TTM-r2 model + torch. NOT tested
    here; covered by tests/test_ttm_integration.py (task 2.10).

The integration script is what produces the Day-4 demo artifact: a text
violation log from Sarah's 10-row stub + her COA JSON, ready to feed
the Phase 2 Day 5 Guardian audit.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pytest

from apex.pipelines.telemetry_to_log import (
    PipelineResult,
    load_telemetry_csv,
    run_pipeline,
)
from apex.shared.contracts import CHANNEL_COUNT, CHANNELS, HORIZON, channel_index

REPO_ROOT = Path(__file__).resolve().parents[3]
SARAH_TELEMETRY_STUB = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-telemetry-stub.csv"
SARAH_COA_STUB = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-coa-stub.json"


# ---- load_telemetry_csv -------------------------------------------------

def test_load_telemetry_csv_reads_sarah_stub_shape():
    arr = load_telemetry_csv(SARAH_TELEMETRY_STUB)
    assert arr.ndim == 2
    assert arr.shape[1] == CHANNEL_COUNT
    assert arr.shape[0] == 10   # Sarah stub is 10 rows


def test_load_telemetry_csv_preserves_channel_order():
    arr = load_telemetry_csv(SARAH_TELEMETRY_STUB)
    # Sarah stub row 0: throttle_pct=85.0, speed_mps=52.0
    assert arr[0, channel_index("throttle_pct")] == pytest.approx(85.0)
    assert arr[0, channel_index("speed_mps")] == pytest.approx(52.0)


def test_load_telemetry_csv_skips_comment_lines():
    # The stub has 4 # comment lines at the top + a header line; loader
    # must skip both kinds and return only the 10 numeric rows.
    arr = load_telemetry_csv(SARAH_TELEMETRY_STUB)
    assert arr.shape[0] == 10


def test_load_telemetry_csv_missing_file_raises(tmp_path):
    with pytest.raises(FileNotFoundError):
        load_telemetry_csv(tmp_path / "no-such-file.csv")


# ---- run_pipeline (naive mode) -----------------------------------------

def test_run_pipeline_naive_returns_pipeline_result_with_log():
    result = run_pipeline(
        telemetry_csv=SARAH_TELEMETRY_STUB,
        coa_json=SARAH_COA_STUB,
        forecast_mode="naive",
    )
    assert isinstance(result, PipelineResult)
    assert result.forecast_mode == "naive"
    assert result.violation_log.engine == "v1_numpy"
    # The text log must be byte-deterministic + non-empty header
    text = result.violation_log.to_text()
    assert "ENGINE v1_numpy" in text
    assert "STEPS " in text


def test_run_pipeline_naive_sarah_stub_flags_corner_edge_at_demo_mu():
    # Sarah's stub captures a brake-to-turn-in-to-exit corner with peak
    # combined load `sqrt(0.65^2 + 1.20^2) ~ 1.365g` at row 3. The demo
    # default mu=1.2 (road-tire grade) flags that step as a friction-
    # ellipse violation -- which is the entire point of the validator
    # surfacing the limit. The COA simultaneity is permitted and there
    # is no brake+throttle overlap, so the only violations are physics
    # (friction-ellipse / bicycle-kinematic), not COA-derived.
    result = run_pipeline(
        telemetry_csv=SARAH_TELEMETRY_STUB,
        coa_json=SARAH_COA_STUB,
        forecast_mode="naive",
    )
    types = {r.type for r in result.violation_log.records}
    assert "friction_ellipse_exceeded" in types
    # No COA violations: simultaneity is permitted, so brake+throttle overlap
    # would be allowed; in any case the stub never overlaps the two channels.
    assert "coa_simultaneity_violation" not in types
    assert result.violation_log.fcvr() > 0.0


def test_run_pipeline_naive_respects_coa_simultaneity_flag():
    # Sarah's COA permits simultaneity (hand-control hardware approved).
    # The pipeline must tile that scalar into the coa_overlap_flag channel
    # of the forecast tensor before calling validate_forecast; otherwise
    # the validator would flag every brake-throttle overlap step.
    result = run_pipeline(
        telemetry_csv=SARAH_TELEMETRY_STUB,
        coa_json=SARAH_COA_STUB,
        forecast_mode="naive",
    )
    # Sarah's COA flag is True -> coa_overlap_flag channel filled with 1.0
    forecast = result.forecast_tensor
    coa_idx = channel_index("coa_overlap_flag")
    assert np.all(forecast[:, coa_idx] == 1.0)


def test_run_pipeline_horizon_clips_to_30_steps():
    # Sarah's stub is 10 rows; validator + forecast horizon is HORIZON=30.
    # The pipeline must produce a forecast tensor of shape (HORIZON, 14)
    # by edge-padding the input. The padded steps are the last available
    # telemetry row (tail-anchor, matching shape_ttm_input convention).
    result = run_pipeline(
        telemetry_csv=SARAH_TELEMETRY_STUB,
        coa_json=SARAH_COA_STUB,
        forecast_mode="naive",
    )
    assert result.forecast_tensor.shape == (HORIZON, CHANNEL_COUNT)


def test_run_pipeline_naive_writes_log_to_file_when_out_path_given(tmp_path):
    out_path = tmp_path / "violation-log.txt"
    result = run_pipeline(
        telemetry_csv=SARAH_TELEMETRY_STUB,
        coa_json=SARAH_COA_STUB,
        forecast_mode="naive",
        out_path=out_path,
    )
    assert out_path.exists()
    text_on_disk = out_path.read_text(encoding="utf-8")
    assert text_on_disk == result.violation_log.to_text()


def test_run_pipeline_unknown_forecast_mode_raises():
    with pytest.raises(ValueError, match="forecast_mode"):
        run_pipeline(
            telemetry_csv=SARAH_TELEMETRY_STUB,
            coa_json=SARAH_COA_STUB,
            forecast_mode="hyperdrive",  # not a valid mode
        )


def test_pipeline_result_dataclass_carries_provenance_inputs():
    result = run_pipeline(
        telemetry_csv=SARAH_TELEMETRY_STUB,
        coa_json=SARAH_COA_STUB,
        forecast_mode="naive",
    )
    # Provenance: COA driver_id surfaces on PipelineResult so Phase 3
    # provenance footer assembly has the data without re-parsing COA.
    assert result.coa.driver_id == "sarah-reynolds-britcar-2026"
    assert result.coa.simultaneity_permitted is True
