"""Canonical tensor-shape contract for the APEX backend.

Single source of truth for the (B, 30, 14) wave-30 D-016 channel contract.
Every module that touches the inter-layer tensor MUST import TENSOR_SHAPE
and CHANNELS from here; never restate the shape literal inline.

Per council v2 (transcript 2026-05-22 v2): the prior plan had three different
shape statements across L93/L94/L118 of docs/vinh-backend-plan.md. This file
collapses them into one constant + one enumeration.

Channel names trace to paper/physics-ttm-methods.md L17-39. Each channel
binds to a wave-30 D-015 physics tier via the CHANNEL_TIER_BINDING map below;
the binding is the contract the SCP solver in app/backend/apex/physics/
projection.py reads to know which constraint applies to which channel.

SCHEMA_VERSION bumps when CHANNELS changes (add/remove/rename). Convergence-14
serializer tests freeze the shape, not the meaning; SCHEMA_VERSION is the
meaning-version that downstream consumers compare against.
"""

from typing import Final

SCHEMA_VERSION: Final[str] = "0.1.0"

TENSOR_SHAPE: Final[tuple[None, int, int]] = (None, 30, 14)
"""Wave-30 D-016 contract: (batch, horizon=30 steps, channels=14).

The leading None is the dynamic batch dimension. Horizon is 30 timesteps
at 1 Hz aggregation (wave-30 D-010 horizon expansion; was 24 pre-wave-30).
Channel count is 14 (wave-30 D-016; was 9 pre-wave-30). Migration adapter:
zero-pad channels 9-13 of legacy (B, 24, 9) inputs and extend time axis to 30.
"""

HORIZON: Final[int] = 30
CHANNEL_COUNT: Final[int] = 14

CHANNELS: Final[tuple[str, ...]] = (
    "throttle_pct",       # 0: normalized throttle [0, 100]; tau = throttle_pct / 100 in SCP solver
    "brake_pa",           # 1: brake pressure [0, max_brake_pa]; b = brake_pa / max_brake_pa
    "steering_rad",       # 2: road-wheel steering angle, radians
    "rpm",                # 3: engine RPM
    "lat_g",              # 4: lateral acceleration (g)
    "long_g",             # 5: longitudinal acceleration (g)
    "speed_mps",          # 6: longitudinal speed, m/s
    "gear",               # 7: integer 0-8
    "coa_overlap_flag",   # 8: COA-derived simultaneity flag {0, 1}; tiled per-step from scalar
    "tire_load_n",        # 9: per-tire vertical-load aggregate (Tier 4 double-track adjusted)
    "mu_v",               # 10: per-step friction coefficient (Tier 5 thermal + Tier 7 Pacejka)
    "track_pitch_rad",    # 11: track-frame pitch radians (Tier 1 3D track geometry)
    "track_bank_rad",     # 12: track-frame bank radians (Tier 1)
    "yaw_rate_rad_s",     # 13: yaw rate radians/sec (Tier 8 kinematic integration)
)
assert len(CHANNELS) == CHANNEL_COUNT, "CHANNELS length must equal CHANNEL_COUNT"

CHANNEL_TIER_BINDING: Final[dict[str, int | None]] = {
    "throttle_pct":     None,  # driver input, no physics tier
    "brake_pa":         None,  # driver input
    "steering_rad":     None,  # driver input
    "rpm":              None,  # vehicle state, derived
    "lat_g":            8,     # Tier 8 kinematic
    "long_g":           8,     # Tier 8 kinematic
    "speed_mps":        8,     # Tier 8 kinematic
    "gear":             None,  # vehicle state
    "coa_overlap_flag": 0,     # Tier 0 COA-derived constraint
    "tire_load_n":      4,     # Tier 4 double-track load transfer
    "mu_v":             5,     # Tier 5 tire thermal; consumed by Tier 7 Pacejka combined-slip
    "track_pitch_rad":  1,     # Tier 1 3D track geometry
    "track_bank_rad":   1,     # Tier 1
    "yaw_rate_rad_s":   8,     # Tier 8
}
assert set(CHANNEL_TIER_BINDING.keys()) == set(CHANNELS), (
    "CHANNEL_TIER_BINDING must cover every channel in CHANNELS"
)


def channel_index(name: str) -> int:
    """Return the channel-axis index for a named channel.

    Use this in slicing rather than hard-coding integers; rename-safe.
    """
    return CHANNELS.index(name)
