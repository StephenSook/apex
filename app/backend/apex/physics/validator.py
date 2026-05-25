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
    CHANNEL_TIER_BINDING,
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
    long_arr = np.asarray(long_g, dtype=np.float64)
    lat_arr = np.asarray(lat_g, dtype=np.float64)
    magnitude = np.sqrt(long_arr * long_arr + lat_arr * lat_arr)
    records: list[ViolationRecord] = []
    for step in np.flatnonzero(magnitude > mu):
        records.append(
            ViolationRecord(
                step=int(step),
                type="friction_ellipse_exceeded",
                severity=float(magnitude[step] - mu),
                channel_values={
                    "long_g": float(long_arr[step]),
                    "lat_g": float(lat_arr[step]),
                },
                tier=7,
            )
        )
    return PhysicsViolationLog(
        records=records,
        forecast_step_count=int(long_arr.shape[0]),
        engine="v1_numpy",
    )


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
    speed_arr = np.asarray(speed_mps, dtype=np.float64)
    long_arr = np.asarray(long_g, dtype=np.float64)
    horizon = int(speed_arr.shape[0])

    expected_delta_v = long_arr[:-1] * 9.81 * dt
    actual_delta_v = speed_arr[1:] - speed_arr[:-1]
    residual = np.abs(actual_delta_v - expected_delta_v)

    records: list[ViolationRecord] = []
    for idx in np.flatnonzero(residual > bands.delta_v_band_mps):
        step = int(idx)
        records.append(
            ViolationRecord(
                step=step,
                type="forward_euler_inconsistent",
                severity=float(residual[step] - bands.delta_v_band_mps),
                channel_values={
                    "speed_mps": float(speed_arr[step]),
                    "speed_mps_next": float(speed_arr[step + 1]),
                    "long_g": float(long_arr[step]),
                },
                tier=8,
            )
        )
    return PhysicsViolationLog(
        records=records, forecast_step_count=horizon, engine="v1_numpy"
    )


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
    lat_arr = np.asarray(lat_g, dtype=np.float64)
    steer_arr = np.asarray(steering_rad, dtype=np.float64)
    speed_arr = np.asarray(speed_mps, dtype=np.float64)
    horizon = int(lat_arr.shape[0])

    expected_lat_g = steer_arr * speed_arr * speed_arr / (wheelbase_m * 9.81)
    residual = np.abs(lat_arr - expected_lat_g)

    records: list[ViolationRecord] = []
    for idx in np.flatnonzero(residual > bands.delta_lat_g_band):
        step = int(idx)
        records.append(
            ViolationRecord(
                step=step,
                type="bicycle_kinematic_break",
                severity=float(residual[step] - bands.delta_lat_g_band),
                channel_values={
                    "lat_g": float(lat_arr[step]),
                    "steering_rad": float(steer_arr[step]),
                    "speed_mps": float(speed_arr[step]),
                },
                tier=8,
            )
        )
    return PhysicsViolationLog(
        records=records, forecast_step_count=horizon, engine="v1_numpy"
    )


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
    thr_arr = np.asarray(throttle_pct, dtype=np.float64)
    brk_arr = np.asarray(brake_pa, dtype=np.float64)
    sim_arr = np.asarray(simultaneity_channel, dtype=np.float64)
    horizon = int(thr_arr.shape[0])

    overlap = (thr_arr > 0.0) & (brk_arr > 0.0)
    forbidden = sim_arr <= 0.5
    flagged = overlap & forbidden

    records: list[ViolationRecord] = []
    for idx in np.flatnonzero(flagged):
        step = int(idx)
        records.append(
            ViolationRecord(
                step=step,
                type="coa_simultaneity_violation",
                severity=0.0,
                channel_values={
                    "throttle_pct": float(thr_arr[step]),
                    "brake_pa": float(brk_arr[step]),
                    "coa_overlap_flag": float(sim_arr[step]),
                },
                tier=0,
            )
        )
    return PhysicsViolationLog(
        records=records, forecast_step_count=horizon, engine="v1_numpy"
    )


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
    f = np.asarray(forecast, dtype=np.float64)
    if f.ndim != 2 or f.shape[1] != len(CHANNEL_TIER_BINDING):
        raise ValueError(
            f"validate_forecast expects (horizon, channels) per shapes.TENSOR_SHAPE; "
            f"got {f.shape}"
        )

    if bands is None:
        bands = ToleranceBands.for_1hz_aggregation()

    long_g = f[:, channel_index("long_g")]
    lat_g = f[:, channel_index("lat_g")]
    speed_mps = f[:, channel_index("speed_mps")]
    steering_rad = f[:, channel_index("steering_rad")]
    throttle_pct = f[:, channel_index("throttle_pct")]
    brake_pa = f[:, channel_index("brake_pa")]

    merged: list[ViolationRecord] = []
    merged.extend(friction_ellipse_check(long_g, lat_g, mu).records)
    merged.extend(forward_euler_consistency(speed_mps, long_g, dt=1.0, bands=bands).records)
    merged.extend(bicycle_kinematic_check(
        lat_g, steering_rad, speed_mps, wheelbase_m, bands
    ).records)
    merged.extend(coa_simultaneity_rule(throttle_pct, brake_pa, simultaneity_channel).records)

    return PhysicsViolationLog(
        records=merged,
        forecast_step_count=int(f.shape[0]),
        engine="v1_numpy",
    )


__all__ = [
    "ToleranceBands",
    "bicycle_kinematic_check",
    "coa_simultaneity_rule",
    "forward_euler_consistency",
    "friction_ellipse_check",
    "validate_forecast",
]
