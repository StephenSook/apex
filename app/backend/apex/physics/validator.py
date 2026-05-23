"""V1 NumPy physics validator (Phase 2 Day 4 implementation; Phase 0 task 0.11 sketch).

Signatures only at Phase 0. Implementations land at Phase 2 Day 4 tasks 2.1-2.5
behind G3 (validator catches 5 impossibilities + approves 5 valid). The
engine-agnostic boundary lives in shared.contracts.PhysicsViolationLog;
this module's job is to emit that exact type so V1 NumPy output is
byte-identical to V2 cvxpylayers output on the same telemetry input.

Council v2 Software Lead fix #7: forward-Euler tolerance is channel-specific
(m/s for speed integration, m/s^2 for acceleration integration); a single
scalar band either misses real violations or accepts everything. The
ToleranceBands dataclass below carries the per-channel bounds.

Implementations of these functions land in Phase 2 Day 4. Phase 0 stops
at signatures + docstrings + the tolerance-band contract so the next file
to land knows what it imports.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from apex.shared.contracts import (
    PhysicsViolationLog,
    ViolationRecord,
    channel_index,
)


# ---- Tolerance bands (council v2 Software Lead fix #7) -----------------

@dataclass(frozen=True)
class ToleranceBands:
    """Channel-specific tolerance bands for the forward-Euler consistency check.

    A scalar tolerance was the original mis-design: at 1 Hz aggregation and
    peak long_g ~ 1.0g (~9.8 m/s^2), Delta-v quantization is up to ~9.8 m/s
    per step. The validator must accept that quantization as legitimate
    while still catching actual physically-impossible Delta-v transitions.

    Defaults below are derived for the 1 Hz aggregation rate (D-011 path A).
    The polyphase 50 Hz path (D-011 path B) reduces these bounds by ~50x;
    the FlowState rate-invariant path (D-011 path C) uses a different metric
    entirely (per-token surprisal). Each path passes its own ToleranceBands
    instance.
    """

    delta_v_band_mps: float = 9.8          # 1g * 1s; 1 Hz quantization ceiling
    delta_long_g_band: float = 1.0         # 1g change per step at 1 Hz
    delta_lat_g_band: float = 1.2          # mu_nominal grip ceiling
    delta_steering_rad_band: float = 0.5   # max steering rate at 1 Hz
    delta_yaw_rate_rad_s_band: float = 1.5 # max yaw-rate change at 1 Hz

    @classmethod
    def for_1hz_aggregation(cls) -> "ToleranceBands":
        """Default tolerance bands for the 1 Hz mini-sector aggregation path
        (D-011 path A; the macroscopic backbone).
        """
        return cls()

    @classmethod
    def for_polyphase_50hz(cls) -> "ToleranceBands":
        """Tolerance bands for the polyphase 50 Hz path (D-011 path B).

        At 50 Hz the per-step Delta-v ceiling shrinks from 1g*1s = 9.8 m/s
        to 1g*0.02s = 0.196 m/s. Same physics, finer time resolution.
        """
        return cls(
            delta_v_band_mps=0.196,
            delta_long_g_band=0.02,
            delta_lat_g_band=0.024,
            delta_steering_rad_band=0.01,
            delta_yaw_rate_rad_s_band=0.03,
        )


# ---- Validator function signatures (Phase 2 Day 4 lands implementations) ----

def friction_ellipse_check(
    long_g: np.ndarray,
    lat_g: np.ndarray,
    mu: float,
    g: float = 9.81,
) -> PhysicsViolationLog:
    """Constant-mu V1 friction-ellipse check (Phase 2 Day 4 task 2.1).

    long_g, lat_g: shape (horizon,) per-step acceleration in g-units.
    mu: nominal friction coefficient (1.2 default for the demo).
    g: gravity constant.

    Returns a PhysicsViolationLog with one ViolationRecord per step where
    sqrt(long_g^2 + lat_g^2) > mu. The same step can appear in multiple
    logs across validator functions; the projection layer concatenates.

    Engine-agnostic invariant: this function emits ViolationRecord(
    type='friction_ellipse_exceeded', tier=7, ...) and the V2 cvxpylayers
    projector emits the same type for the same step on the same input.
    """
    raise NotImplementedError("Phase 2 Day 4 task 2.1")


def forward_euler_consistency(
    speed_mps: np.ndarray,
    long_g: np.ndarray,
    dt: float,
    bands: ToleranceBands,
) -> PhysicsViolationLog:
    """Kinematic consistency: v[t+1] - v[t] approx long_g[t] * g * dt.

    bands.delta_v_band_mps is the tolerance for the Delta-v residual; bands
    parameterization is the Software Lead fix #7 (council v2). Channel-specific
    tolerances live in ToleranceBands; this function reads bands.delta_v_band_mps
    and bands.delta_long_g_band only.

    Emits ViolationRecord(type='forward_euler_inconsistent', tier=8, ...)
    for each step where the residual exceeds the band.
    """
    raise NotImplementedError("Phase 2 Day 4 task 2.2")


def bicycle_kinematic_check(
    lat_g: np.ndarray,
    steering_rad: np.ndarray,
    speed_mps: np.ndarray,
    wheelbase_m: float,
    bands: ToleranceBands,
) -> PhysicsViolationLog:
    """Bicycle model kinematic check: lat_g approx steering_rad * speed^2 / (wheelbase * g).

    Detects steering/speed/lateral-accel triplets that violate the small-angle
    bicycle approximation. Emits type='bicycle_kinematic_break', tier=8.
    """
    raise NotImplementedError("Phase 2 Day 4 task 2.3")


def coa_simultaneity_rule(
    throttle_pct: np.ndarray,
    brake_pa: np.ndarray,
    simultaneity_channel: np.ndarray,
) -> PhysicsViolationLog:
    """COA-derived brake-throttle overlap check.

    simultaneity_channel is the per-step (horizon,) tensor sourced from
    shared.contracts.build_ttm_input() (the SINGLE place that tiles the
    scalar COA flag to per-step values per Software Lead fix #2). NOT a
    scalar bool here; the validator receives the already-tiled tensor.

    Emits type='coa_simultaneity_violation', tier=0, for each step where
    throttle and brake overlap AND simultaneity_channel[step] == 0
    (COA does not permit overlap for this driver/vehicle).
    """
    raise NotImplementedError("Phase 2 Day 4 task 2.4")


def validate_forecast(
    forecast: np.ndarray,
    mu: float,
    wheelbase_m: float,
    simultaneity_channel: np.ndarray,
    bands: ToleranceBands | None = None,
) -> PhysicsViolationLog:
    """Top-level V1 validator: runs all checks + merges results.

    forecast: shape (horizon, channels) per shapes.TENSOR_SHAPE (drop batch axis).
    Returns merged PhysicsViolationLog with engine='v1_numpy'.

    Phase 2 Day 4 task 2.5 implementation. Phase 0 ships only the signature
    so downstream modules can type-hint against it.
    """
    raise NotImplementedError("Phase 2 Day 4 task 2.5")


__all__ = [
    "ToleranceBands",
    "bicycle_kinematic_check",
    "coa_simultaneity_rule",
    "forward_euler_consistency",
    "friction_ellipse_check",
    "validate_forecast",
]
