"""Frozen TTM-r2 zero-shot forecast wrapper (Phase 2 Day 4 task 2.8).

Three responsibilities (in dependency order):

  1. `aggregate_to_1hz`: collapse raw N Hz telemetry to the macroscopic 1 Hz
     mini-sector backbone (D-011 path A; the wave-30 horizon contract is
     30 steps at 1 Hz per shapes.HORIZON). Per-channel aggregation rules
     respect driver-input semantics: brake pressure and throttle pct
     preserve peaks (a 20 ms brake spike must not be averaged away), the
     gear channel preserves the last value of each second, everything
     else uses the mean.

  2. `shape_ttm_input`: align an aggregated telemetry array to the
     TTM-r2 context-window contract. Pads short telemetry by repeating
     the first row (edge-pad, matching the G1 smoke convention at
     `logs/day-03-g1-ttm-smoke.md`) and tail-truncates long telemetry so
     the most recent context drives the prediction.

  3. `TtmForecaster`: the actual frozen-model holder. Loaded once;
     `.forecast()` returns a `(B, HORIZON, CHANNEL_COUNT)` tensor. Heavy
     dependency (torch + tsfm_public + 600MB HF download) so it lives in
     a class that's only instantiated when a forecast is actually
     needed. Unit tests cover surfaces 1 + 2; the integration test
     (task 2.10) covers surface 3 end-to-end.

The engine-agnostic boundary lives downstream in `apex.physics.validator`
and `apex.shared.contracts.violations`; this module produces tensors,
not violation logs.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Final

import numpy as np

from apex.shared.contracts import CHANNEL_COUNT, CHANNELS, HORIZON, channel_index


# ---- Aggregation rules: which channels peak, which last-value, rest mean ---

_DEFAULT_PEAK_CHANNELS: Final[tuple[str, ...]] = (
    "brake_pa",         # driver-input peak preserves brief spikes
    "throttle_pct",     # driver-input peak preserves shifts
    "lat_g",            # acceleration peaks matter for friction-ellipse audit
    "long_g",
)

_DEFAULT_LAST_CHANNELS: Final[tuple[str, ...]] = (
    "gear",             # discrete; averaging is nonsense
    "coa_overlap_flag", # discrete {0, 1}
)


@dataclass(frozen=True)
class AggregationConfig:
    """Per-channel aggregation rule overrides.

    Default rules apply when this dataclass is left at its defaults. Callers
    that need a different aggregation policy (e.g. the polyphase 50 Hz path
    B will pass an instance with empty peak_channels because it preserves
    the original sample rate) construct a custom instance.
    """

    peak_channels: tuple[str, ...] = field(
        default_factory=lambda: _DEFAULT_PEAK_CHANNELS
    )
    last_value_channels: tuple[str, ...] = field(
        default_factory=lambda: _DEFAULT_LAST_CHANNELS
    )


def aggregate_to_1hz(
    telemetry: np.ndarray,
    *,
    source_hz: int,
    config: AggregationConfig | None = None,
) -> np.ndarray:
    """Collapse `telemetry` from `source_hz` to 1 Hz mini-sector rows.

    Args:
      telemetry: (T, CHANNEL_COUNT) raw array in CHANNELS column order.
      source_hz: positive integer source sample rate. `source_hz=1` is a
        no-op pass-through.
      config: aggregation rule overrides; defaults applied when None.

    Returns: (floor(T / source_hz), CHANNEL_COUNT) float64 array. Partial
      trailing windows are dropped; the wave-30 D-011 path A is anchored
      on full-second mini-sectors, so a 2.4s capture yields 2 rows.
    """
    if source_hz <= 0:
        raise ValueError(f"source_hz must be positive; got {source_hz}.")
    if telemetry.ndim != 2 or telemetry.shape[1] != CHANNEL_COUNT:
        raise ValueError(
            f"aggregate_to_1hz expects (T, {CHANNEL_COUNT}) channels; "
            f"got {telemetry.shape}."
        )

    cfg = config or AggregationConfig()
    full_seconds = telemetry.shape[0] // source_hz
    if full_seconds == 0:
        return np.zeros((0, CHANNEL_COUNT), dtype=np.float64)

    # Reshape into (seconds, source_hz, channels) for vectorized aggregation.
    trimmed = telemetry[: full_seconds * source_hz].astype(np.float64, copy=False)
    windowed = trimmed.reshape(full_seconds, source_hz, CHANNEL_COUNT)

    peak_idx = {channel_index(c) for c in cfg.peak_channels if c in CHANNELS}
    last_idx = {channel_index(c) for c in cfg.last_value_channels if c in CHANNELS}

    out = np.empty((full_seconds, CHANNEL_COUNT), dtype=np.float64)
    for ch in range(CHANNEL_COUNT):
        if ch in peak_idx:
            out[:, ch] = windowed[:, :, ch].max(axis=1)
        elif ch in last_idx:
            out[:, ch] = windowed[:, -1, ch]
        else:
            out[:, ch] = windowed[:, :, ch].mean(axis=1)
    return out


def shape_ttm_input(
    telemetry: np.ndarray,
    *,
    context_length: int,
    dtype: np.dtype = np.float32,
) -> np.ndarray:
    """Align `telemetry` to TTM-r2's (1, context_length, CHANNEL_COUNT) input.

    Pads short telemetry by repeating the first row (edge-pad, matching
    the G1 smoke at `logs/day-03-g1-ttm-smoke.md`). Truncates long
    telemetry from the head so the tail (most recent samples) drives
    the prediction.
    """
    if telemetry.ndim != 2 or telemetry.shape[1] != CHANNEL_COUNT:
        raise ValueError(
            f"shape_ttm_input expects (T, {CHANNEL_COUNT}) channels; "
            f"got {telemetry.shape}."
        )

    T = telemetry.shape[0]
    if T < context_length:
        pad = np.repeat(telemetry[:1], context_length - T, axis=0)
        aligned = np.concatenate([pad, telemetry], axis=0)
    else:
        aligned = telemetry[-context_length:]

    return aligned.astype(dtype, copy=False)[None, :, :]


# ---- TtmForecaster: heavy class, loaded lazily -------------------------

class TtmForecaster:
    """Frozen Granite TimeSeries TTM-r2 zero-shot forecaster.

    Loads `ibm-granite/granite-timeseries-ttm-r2` once per instance.
    `.forecast(telemetry, source_hz=N)` aggregates -> shapes -> forwards
    and returns a `(1, HORIZON, CHANNEL_COUNT)` numpy array matching
    `shapes.TENSOR_SHAPE` (with batch=1).

    This class is NOT imported at module load; callers must construct it
    explicitly. The unit-test suite covers `aggregate_to_1hz` +
    `shape_ttm_input` without instantiating this class; the integration
    test (task 2.10) instantiates it and runs a real forward pass.
    """

    def __init__(self, model_id: str = "ibm-granite/granite-timeseries-ttm-r2"):
        import torch
        from tsfm_public import TinyTimeMixerForPrediction

        self._torch = torch
        self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._model = TinyTimeMixerForPrediction.from_pretrained(
            model_id,
            num_input_channels=CHANNEL_COUNT,
            prediction_filter_length=HORIZON,
        ).to(self._device).eval()
        self._context_length: int = int(self._model.config.context_length)

    @property
    def context_length(self) -> int:
        return self._context_length

    def forecast(
        self,
        telemetry: np.ndarray,
        *,
        source_hz: int,
        config: AggregationConfig | None = None,
    ) -> np.ndarray:
        """End-to-end zero-shot forecast: aggregate -> shape -> forward."""
        aggregated = aggregate_to_1hz(telemetry, source_hz=source_hz, config=config)
        shaped = shape_ttm_input(aggregated, context_length=self._context_length)
        x = self._torch.from_numpy(shaped).to(self._device)
        with self._torch.no_grad():
            out = self._model(past_values=x)
        return out.prediction_outputs.detach().cpu().numpy()


__all__ = [
    "AggregationConfig",
    "TtmForecaster",
    "aggregate_to_1hz",
    "shape_ttm_input",
]
