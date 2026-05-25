"""Adapter contract tests.

`build_ttm_input` is the SINGLE place that lifts a scalar COA simultaneity
flag into the per-step `coa_overlap_flag` channel (plan task 0.10 + 1.9 +
Software Lead fix #2). If this drifts, multiple downstream layers (TTM
forecast wrapper, V1 NumPy validator, V2 cvxpylayers projector) will
disagree about what channel 8 means.
"""

from __future__ import annotations

import numpy as np
import pytest

from apex.shared.contracts import (
    CHANNEL_COUNT,
    HORIZON,
    build_ttm_input,
    channel_index,
)


def _zero_tensor(batch: int = 2) -> np.ndarray:
    return np.zeros((batch, HORIZON, CHANNEL_COUNT), dtype=np.float32)


def test_simultaneity_permitted_true_fills_coa_channel_with_ones():
    tensor = _zero_tensor()
    out = build_ttm_input(tensor, simultaneity_permitted=True)
    channel_idx = channel_index("coa_overlap_flag")
    assert np.all(out[:, :, channel_idx] == 1.0)


def test_simultaneity_permitted_false_fills_coa_channel_with_zeros():
    tensor = _zero_tensor()
    tensor[:, :, channel_index("coa_overlap_flag")] = 1.0  # poisoned
    out = build_ttm_input(tensor, simultaneity_permitted=False)
    channel_idx = channel_index("coa_overlap_flag")
    assert np.all(out[:, :, channel_idx] == 0.0)


def test_other_channels_untouched():
    tensor = _zero_tensor()
    tensor[:, :, channel_index("speed_mps")] = 47.5
    tensor[:, :, channel_index("long_g")] = -1.1
    out = build_ttm_input(tensor, simultaneity_permitted=True)
    assert np.allclose(out[:, :, channel_index("speed_mps")], 47.5)
    assert np.allclose(out[:, :, channel_index("long_g")], -1.1)


def test_does_not_mutate_input():
    tensor = _zero_tensor()
    original = tensor.copy()
    _ = build_ttm_input(tensor, simultaneity_permitted=True)
    assert np.array_equal(tensor, original)


def test_wrong_rank_raises():
    bad = np.zeros((HORIZON, CHANNEL_COUNT), dtype=np.float32)
    with pytest.raises(ValueError, match="3D tensor"):
        build_ttm_input(bad, simultaneity_permitted=True)


def test_wrong_channel_count_raises():
    bad = np.zeros((1, HORIZON, CHANNEL_COUNT + 1), dtype=np.float32)
    with pytest.raises(ValueError, match="expects shape"):
        build_ttm_input(bad, simultaneity_permitted=True)


def test_wrong_horizon_raises():
    bad = np.zeros((1, HORIZON + 1, CHANNEL_COUNT), dtype=np.float32)
    with pytest.raises(ValueError, match="expects shape"):
        build_ttm_input(bad, simultaneity_permitted=True)
