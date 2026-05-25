"""TTM-input adapter: the single place that lifts scalar COA metadata into
the per-step `coa_overlap_flag` channel of TENSOR_SHAPE.

Per docs/vinh-backend-plan.md Phase 1 task 1.9 + Phase 0 task 0.10:

  > The broadcast adapter in `shared.contracts.build_ttm_input()` is the
  > SINGLE place that tiles this scalar to the per-step simultaneity channel;
  > it imports `TENSOR_SHAPE` from `shapes.py` rather than restating the
  > shape literal; never duplicated in `forecast.py` or `validator.py`
  > (Software Lead fix #2).

The function is torch-optional: if numpy is enough (V1 NumPy validator
path), the caller passes a numpy.ndarray and gets a numpy.ndarray back. If
torch is in scope (V2 cvxpylayers projector path), the caller passes a
torch.Tensor + gets a torch.Tensor back. Type hints stay loose so this
module never needs to import torch at module load time.
"""

from __future__ import annotations

from typing import Any

from .shapes import CHANNEL_COUNT, HORIZON, channel_index


def build_ttm_input(
    telemetry: Any,
    *,
    simultaneity_permitted: bool,
    coa_channel_name: str = "coa_overlap_flag",
) -> Any:
    """Tile the scalar COA `simultaneity_permitted` bool across the
    per-step `coa_overlap_flag` channel of a telemetry tensor.

    Args:
      telemetry: array-like of shape (B, HORIZON, CHANNEL_COUNT). May be a
        numpy.ndarray (V1 path) or torch.Tensor (V2 path). The function
        dispatches on the type's `__class__.__name__` so neither numpy nor
        torch must be importable at module-load time.
      simultaneity_permitted: scalar bool sourced from
        `apex.instruct.coa_parser.CoaParseResult.simultaneity_permitted`.
      coa_channel_name: name of the channel that carries the per-step COA
        flag. Defaults to the wave-30 D-016 binding (`coa_overlap_flag`).

    Returns: the input tensor with the named channel overwritten by
      1.0 if `simultaneity_permitted` else 0.0, across all batch + horizon
      indices. Other channels are untouched.

    Raises: ValueError if the input rank or channel count disagrees with
      shapes.TENSOR_SHAPE. This is the single boundary check; downstream
      consumers can trust shape invariants from here on.
    """
    if telemetry.ndim != 3:
        raise ValueError(
            f"build_ttm_input expects a 3D tensor (B, {HORIZON}, {CHANNEL_COUNT}); "
            f"got ndim={telemetry.ndim}."
        )
    if telemetry.shape[1] != HORIZON or telemetry.shape[2] != CHANNEL_COUNT:
        raise ValueError(
            f"build_ttm_input expects shape (B, {HORIZON}, {CHANNEL_COUNT}); "
            f"got {tuple(telemetry.shape)}."
        )

    channel_idx = channel_index(coa_channel_name)
    fill_value = 1.0 if simultaneity_permitted else 0.0

    is_torch = telemetry.__class__.__module__.startswith("torch")
    if is_torch:
        out = telemetry.clone()
        out[:, :, channel_idx] = fill_value
        return out

    out = telemetry.copy()
    out[:, :, channel_idx] = fill_value
    return out


__all__ = ["build_ttm_input"]
