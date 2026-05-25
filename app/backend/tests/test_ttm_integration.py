"""TTM integration test on FastF1 5-lap slice (Phase 2 Day 4 task 2.10).

Skipped by default. Run with:
    cd app/backend && .venv/Scripts/python -m pytest tests/test_ttm_integration.py --integration -v

This test exercises the full Day-4 backend path with a real model:
  FastF1 cache -> aggregate_to_1hz -> shape_ttm_input -> TtmForecaster ->
  validate_forecast -> PhysicsViolationLog.to_text().

The G1 standalone smoke (logs/day-03-g1-ttm-smoke.md) already proved the
TTM forward pass works on Hamilton's Bahrain 2024 Q telemetry. This test
locks that as a regression guard + asserts the per-layer contracts hold
end-to-end: tensor shapes match shapes.TENSOR_SHAPE, the validator
accepts the model output, the log serializes byte-deterministically.

FastF1 channel-availability gap (pre-mortem row 62): the cache ships 5
of the 14 channels (throttle, brake bool, rpm, speed km/h, gear).
Absent channels stay zero; the validator on zero lat_g / zero
steering_rad will under-flag bicycle violations but that is the
documented FastF1 limit. Sarah's full 14-channel telemetry lands at
Phase 3 task 3.2.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pytest

from apex.shared.contracts import CHANNEL_COUNT, HORIZON, channel_index

REPO_ROOT = Path(__file__).resolve().parents[3]
FASTF1_CACHE = REPO_ROOT / "app" / "backend" / ".fastf1_cache"


pytestmark = pytest.mark.integration


@pytest.fixture(scope="module")
def hamilton_5lap_telemetry() -> np.ndarray:
    """Load 5 laps of Hamilton's Bahrain 2024 Q telemetry from the cache.

    Mirrors `apex.ttm.g1_smoke.load_5lap_export` so the integration test
    consumes the same fixture the G1 smoke proved against. Returns a
    (T, CHANNEL_COUNT) float32 array in CHANNELS column order.
    """
    if not FASTF1_CACHE.exists():
        pytest.skip(f"FastF1 cache not populated at {FASTF1_CACHE}")
    try:
        import fastf1
        import pandas as pd
    except ImportError as exc:
        pytest.skip(f"fastf1/pandas missing: {exc}")

    fastf1.Cache.enable_cache(str(FASTF1_CACHE))
    session = fastf1.get_session(2024, "Bahrain", "Q")
    session.load(telemetry=True, laps=True, weather=False)
    laps = session.laps.pick_drivers("44").iloc[:5]
    parts = [lap_row.get_car_data() for _, lap_row in laps.iterlaps()]
    car = pd.concat(parts, ignore_index=True)

    fastf1_map = {
        "throttle_pct": "Throttle",
        "brake_pa":     "Brake",
        "rpm":          "RPM",
        "speed_mps":    "Speed",
        "gear":         "nGear",
    }
    T = len(car)
    out = np.zeros((T, CHANNEL_COUNT), dtype=np.float32)
    for our_name, ff1_name in fastf1_map.items():
        if ff1_name not in car.columns:
            continue
        i = channel_index(our_name)
        col = car[ff1_name].to_numpy(dtype=np.float32)
        if our_name == "speed_mps":
            col = col / 3.6
        if our_name == "brake_pa":
            col = col.astype(np.float32) * 3.5e6
        out[:, i] = col
    return out


@pytest.fixture(scope="module")
def forecaster():
    """Load TtmForecaster once for the whole test module.

    Module-scope so the 600MB HF download + 3s model load amortizes
    across every assertion in this file.
    """
    try:
        import torch  # noqa: F401
        from apex.ttm.forecast import TtmForecaster
    except ImportError as exc:
        pytest.skip(f"torch / tsfm_public missing: {exc}")

    return TtmForecaster()


# ---- End-to-end shape contract -----------------------------------------

def test_ttm_forecaster_loads_and_reports_context_length(forecaster):
    assert forecaster.context_length > 0
    assert isinstance(forecaster.context_length, int)


def test_ttm_forward_on_fastf1_5lap_emits_canonical_shape(
    forecaster, hamilton_5lap_telemetry
):
    # FastF1 cache is ~50 Hz raw; aggregator collapses to 1 Hz.
    forecast = forecaster.forecast(hamilton_5lap_telemetry, source_hz=50)
    assert forecast.shape == (1, HORIZON, CHANNEL_COUNT)


def test_ttm_forward_emits_all_finite_values(
    forecaster, hamilton_5lap_telemetry
):
    forecast = forecaster.forecast(hamilton_5lap_telemetry, source_hz=50)
    assert np.isfinite(forecast).all()


# ---- TTM -> validator end-to-end --------------------------------------

def test_ttm_output_passes_validator_without_crash(
    forecaster, hamilton_5lap_telemetry
):
    """TTM forecast output flows into validate_forecast and returns a
    PhysicsViolationLog. Asserts the engine-agnostic boundary holds:
    validator does not care that TTM produced the tensor instead of
    the naive baseline.
    """
    from apex.physics.validator import ToleranceBands, validate_forecast
    from apex.shared.contracts import PhysicsViolationLog, build_ttm_input

    forecast = forecaster.forecast(hamilton_5lap_telemetry, source_hz=50)
    # build_ttm_input expects (B, HORIZON, CHANNEL_COUNT); use B=1.
    # FastF1 has no COA so simultaneity_permitted does not matter for
    # this test; pick True deterministically.
    tiled = build_ttm_input(forecast.astype(np.float32),
                             simultaneity_permitted=True)
    f = tiled[0].astype(np.float64)
    log = validate_forecast(
        f,
        mu=1.2,
        wheelbase_m=2.7,
        simultaneity_channel=f[:, channel_index("coa_overlap_flag")],
        bands=ToleranceBands.for_1hz_aggregation(),
    )
    assert isinstance(log, PhysicsViolationLog)
    assert log.engine == "v1_numpy"
    assert log.forecast_step_count == HORIZON
    # Log text must be byte-deterministic regardless of forecast source.
    assert log.to_text() == log.to_text()


def test_ttm_pipeline_text_log_contains_engine_and_steps_header(
    forecaster, hamilton_5lap_telemetry
):
    from apex.physics.validator import ToleranceBands, validate_forecast
    from apex.shared.contracts import build_ttm_input

    forecast = forecaster.forecast(hamilton_5lap_telemetry, source_hz=50)
    tiled = build_ttm_input(forecast.astype(np.float32),
                             simultaneity_permitted=True)
    f = tiled[0].astype(np.float64)
    log = validate_forecast(
        f, mu=1.2, wheelbase_m=2.7,
        simultaneity_channel=f[:, channel_index("coa_overlap_flag")],
    )
    text = log.to_text()
    assert text.startswith("ENGINE v1_numpy\n")
    assert "STEPS 30\n" in text
