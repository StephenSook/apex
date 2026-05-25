"""TTM forecast wrapper tests (Phase 2 Day 4 task 2.8).

Splits into two surfaces:
  1. Pure-numpy aggregator + input-shaper, unit-testable without loading
     TTM-r2 from HuggingFace. These run on every pytest invocation.
  2. The TtmForecaster class itself, which holds the frozen TTM-r2 model.
     Forward-pass smoke is covered by the G1 standalone script
     (logs/day-03-g1-ttm-smoke.md) + the Phase 2 Day 4 task 2.10
     integration test on FastF1 (test_ttm_integration.py); we don't
     re-download the model here.

The aggregator is the macroscopic 1 Hz mini-sector backbone (D-011 path A).
Paths B (polyphase 50 Hz) + C (FlowState rate-invariant) land later; this
wrapper is the V1 floor.
"""

from __future__ import annotations

import numpy as np
import pytest

from apex.shared.contracts import CHANNELS, CHANNEL_COUNT, HORIZON, channel_index
from apex.ttm.forecast import (
    AggregationConfig,
    aggregate_to_1hz,
    shape_ttm_input,
)


# ---- aggregate_to_1hz (1 Hz mini-sector path A) ------------------------

def test_aggregate_already_1hz_returns_input_unchanged_shape():
    # 30 rows at 1 Hz -> aggregator should keep 30 rows
    telemetry = np.zeros((30, CHANNEL_COUNT), dtype=np.float64)
    telemetry[:, channel_index("speed_mps")] = 30.0
    out = aggregate_to_1hz(telemetry, source_hz=1)
    assert out.shape == (30, CHANNEL_COUNT)
    assert np.allclose(out[:, channel_index("speed_mps")], 30.0)


def test_aggregate_50hz_collapses_to_1hz_by_mean():
    # 100 rows at 50 Hz -> 2 rows at 1 Hz
    telemetry = np.zeros((100, CHANNEL_COUNT), dtype=np.float64)
    telemetry[:50, channel_index("speed_mps")] = 40.0
    telemetry[50:, channel_index("speed_mps")] = 60.0
    out = aggregate_to_1hz(telemetry, source_hz=50)
    assert out.shape == (2, CHANNEL_COUNT)
    assert out[0, channel_index("speed_mps")] == pytest.approx(40.0)
    assert out[1, channel_index("speed_mps")] == pytest.approx(60.0)


def test_aggregate_brake_pa_uses_peak_not_mean():
    # Driver-input channel: a brief brake spike should NOT be averaged away
    telemetry = np.zeros((50, CHANNEL_COUNT), dtype=np.float64)
    telemetry[10, channel_index("brake_pa")] = 4.0e6   # one-frame peak
    out = aggregate_to_1hz(telemetry, source_hz=50)
    # Mean would be 4e6/50 = 8e4; peak preserves 4e6
    assert out[0, channel_index("brake_pa")] == pytest.approx(4.0e6)


def test_aggregate_throttle_pct_uses_peak_not_mean():
    telemetry = np.zeros((50, CHANNEL_COUNT), dtype=np.float64)
    telemetry[25, channel_index("throttle_pct")] = 100.0
    out = aggregate_to_1hz(telemetry, source_hz=50)
    assert out[0, channel_index("throttle_pct")] == pytest.approx(100.0)


def test_aggregate_gear_uses_mode_like_last_value():
    # Discrete channel: averaging gear=4 and gear=5 gives 4.5 (nonsense).
    # Aggregator must preserve a valid integer gear; we use the last value
    # of each second as a deterministic choice that matches the trailing-
    # edge convention of FastF1's per-second downsamples.
    telemetry = np.zeros((50, CHANNEL_COUNT), dtype=np.float64)
    telemetry[:25, channel_index("gear")] = 4.0
    telemetry[25:, channel_index("gear")] = 5.0
    out = aggregate_to_1hz(telemetry, source_hz=50)
    assert out[0, channel_index("gear")] == 5.0


def test_aggregate_partial_window_drops_remainder():
    # 120 rows at 50 Hz = 2.4 seconds. Aggregator returns 2 full seconds;
    # the trailing 0.4s partial window is dropped (deterministic, documented).
    telemetry = np.zeros((120, CHANNEL_COUNT), dtype=np.float64)
    out = aggregate_to_1hz(telemetry, source_hz=50)
    assert out.shape == (2, CHANNEL_COUNT)


def test_aggregate_invalid_source_hz_raises():
    telemetry = np.zeros((50, CHANNEL_COUNT), dtype=np.float64)
    with pytest.raises(ValueError, match="source_hz"):
        aggregate_to_1hz(telemetry, source_hz=0)


def test_aggregate_wrong_channel_count_raises():
    bad = np.zeros((50, CHANNEL_COUNT - 1), dtype=np.float64)
    with pytest.raises(ValueError, match="channels"):
        aggregate_to_1hz(bad, source_hz=50)


def test_aggregate_custom_config_override():
    # Caller can override which channels use peak vs mean
    cfg = AggregationConfig(peak_channels=("speed_mps",))
    telemetry = np.zeros((50, CHANNEL_COUNT), dtype=np.float64)
    telemetry[10, channel_index("speed_mps")] = 100.0
    out = aggregate_to_1hz(telemetry, source_hz=50, config=cfg)
    assert out[0, channel_index("speed_mps")] == pytest.approx(100.0)


# ---- shape_ttm_input (context-window padding + batch dim) ---------------

def test_shape_ttm_input_pads_short_telemetry():
    # 10 rows but context_length=512 -> edge-pad to 512
    telemetry = np.zeros((10, CHANNEL_COUNT), dtype=np.float64)
    telemetry[:, channel_index("speed_mps")] = 50.0
    out = shape_ttm_input(telemetry, context_length=512)
    assert out.shape == (1, 512, CHANNEL_COUNT)
    # Padding repeats first row (channel order preserved)
    assert out[0, 0, channel_index("speed_mps")] == 50.0
    assert out[0, 100, channel_index("speed_mps")] == 50.0


def test_shape_ttm_input_truncates_long_telemetry():
    telemetry = np.zeros((1000, CHANNEL_COUNT), dtype=np.float64)
    telemetry[-1, channel_index("speed_mps")] = 99.0  # tail marker
    out = shape_ttm_input(telemetry, context_length=512)
    assert out.shape == (1, 512, CHANNEL_COUNT)
    # Truncation keeps the tail (most recent context), not the head
    assert out[0, -1, channel_index("speed_mps")] == 99.0


def test_shape_ttm_input_exact_length_no_change():
    telemetry = np.arange(
        512 * CHANNEL_COUNT, dtype=np.float64
    ).reshape(512, CHANNEL_COUNT)
    out = shape_ttm_input(telemetry, context_length=512)
    assert out.shape == (1, 512, CHANNEL_COUNT)
    assert np.array_equal(out[0], telemetry)


def test_shape_ttm_input_emits_float32_by_default():
    # TTM-r2 weights are float32; passing float64 wastes VRAM
    telemetry = np.zeros((100, CHANNEL_COUNT), dtype=np.float64)
    out = shape_ttm_input(telemetry, context_length=512)
    assert out.dtype == np.float32


def test_shape_ttm_input_wrong_channel_count_raises():
    bad = np.zeros((100, CHANNEL_COUNT - 1), dtype=np.float64)
    with pytest.raises(ValueError, match="channels"):
        shape_ttm_input(bad, context_length=512)


def test_aggregation_config_default_lists_known_peak_channels():
    cfg = AggregationConfig()
    assert "brake_pa" in cfg.peak_channels
    assert "throttle_pct" in cfg.peak_channels
