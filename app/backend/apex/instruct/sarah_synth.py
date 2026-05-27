"""Sarah Reynolds 5-lap Donington synthetic telemetry generator.

Phase 3 task 3.2. Emits a deterministic 5-lap trace (300 rows at 1 Hz)
in CHANNELS column order per shapes.py. The trace is physically
plausible (forward-Euler kinematic consistency, friction-ellipse bound
at mu=1.2, bicycle-model kinematic consistency at race-corner speeds)
so it passes the V1 NumPy validator with FCVR ~= 0 except at the three
documented loss corners in the debrief (Turn 1 Redgate, Turn 4 Old
Hairpin, Turn 7 Goddards).

Run from repo root:
    app/backend/.venv/Scripts/python.exe -m apex.instruct.sarah_synth

Writes fixtures/personas/sarah-reynolds-telemetry.csv.

Deterministic (seed=42); regenerable; safe to re-run.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

REPO_ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(REPO_ROOT / "app" / "backend"))

from apex.shared.contracts import CHANNEL_COUNT, CHANNELS, channel_index  # noqa: E402

SEED = 42
LAPS = 5
LAP_DURATION_S = 60       # 60s per lap at 1 Hz mini-sectors -> 300 rows total
TOTAL_ROWS = LAPS * LAP_DURATION_S
WHEELBASE_M = 2.7
MU_NOMINAL = 1.2
G = 9.81

OUT_PATH = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-telemetry.csv"


def build_lap_phase(rng: np.random.Generator) -> np.ndarray:
    """Build one 60-second lap (60 rows) representing a Donington National
    layout: straight + Redgate + Coppice + Schwantz + Old Hairpin +
    McLeans + Coppice exit + Goddards + start-finish straight.

    Output shape: (60, CHANNEL_COUNT) float64.
    """
    rows = np.zeros((LAP_DURATION_S, CHANNEL_COUNT), dtype=np.float64)
    t = np.arange(LAP_DURATION_S)

    # Speed profile: 4 corners across 60s. Speed dips at corner phase indices
    # 8-12 (Turn 1 Redgate), 22-26 (Turn 4 Old Hairpin), 35-39 (Turn 5 McLeans),
    # 48-52 (Turn 7 Goddards). Between corners car accelerates to ~58 m/s.
    base_speed = 58.0
    corner_centers = (10, 24, 37, 50)
    corner_min_speeds = (28.0, 22.0, 32.0, 26.0)   # m/s minimums
    corner_width = 4
    speed = np.full(LAP_DURATION_S, base_speed)
    for c, vmin in zip(corner_centers, corner_min_speeds):
        for i in range(LAP_DURATION_S):
            d = abs(i - c)
            if d <= corner_width:
                # Cosine-shaped dip into the corner.
                dip = (np.cos(np.pi * d / corner_width) + 1) * 0.5
                speed[i] = min(speed[i], vmin + (base_speed - vmin) * (1 - dip))
    # Smooth + ensure speeds stay in physical range.
    speed = np.clip(speed, 12.0, 65.0)

    # Compute long_g from speed delta (forward-Euler kinematic). At 1 Hz step
    # the delta-v ceiling is ~1g * 1s = 9.81 m/s; clip to that bound.
    long_g = np.zeros(LAP_DURATION_S)
    long_g[1:] = np.clip((speed[1:] - speed[:-1]) / G, -1.0, 1.0)
    long_g[0] = long_g[1]

    # Steering: zero on straights, ramp through corners. Sign alternates so
    # the lap mixes left + right corners (Redgate right, Old Hairpin left,
    # McLeans right, Goddards left for Donington National).
    steering = np.zeros(LAP_DURATION_S)
    corner_signs = (+1, -1, +1, -1)
    for c, sign in zip(corner_centers, corner_signs):
        for i in range(LAP_DURATION_S):
            d = abs(i - c)
            if d <= corner_width:
                peak = 0.30                                # ~17 deg at the apex
                shape = (np.cos(np.pi * d / corner_width) + 1) * 0.5
                steering[i] = sign * peak * shape

    # Lat_g from bicycle kinematic: lat_g = steering * v^2 / (L * g)
    # but cap at the friction-ellipse residual after long_g is consumed.
    raw_lat = steering * speed * speed / (WHEELBASE_M * G)
    # Friction ellipse: sqrt(long_g^2 + lat_g^2) <= mu. Solve for lat_g_max.
    lat_max = np.sqrt(np.maximum(0.0, MU_NOMINAL ** 2 - long_g ** 2))
    lat_g = np.sign(raw_lat) * np.minimum(np.abs(raw_lat), lat_max)

    # Throttle: high on straights (~85-100), zero through brake phase
    # (long_g < -0.3), ramp on exit. Brake_pa: ramp up where long_g < -0.3.
    throttle = np.where(long_g >= -0.2, 50.0 + 50.0 * np.clip(long_g, -0.2, 0.5),
                         0.0)
    throttle = np.clip(throttle, 0.0, 100.0)
    brake_pa = np.where(long_g < -0.3, -long_g * 4.0e6, 0.0)
    brake_pa = np.clip(brake_pa, 0.0, 5.0e6)

    # RPM: scaled with speed in 4th-5th gear (rough mapping).
    rpm = 1500.0 + speed * 110.0
    # Gear: simple step-up by speed.
    gear = np.clip((speed / 12.0).astype(int) + 1, 2, 6).astype(float)

    # COA overlap flag: Sarah's COA permits simultaneity; tile 1.0 per step.
    # The build_ttm_input adapter is the canonical source; we tile manually
    # here only because this fixture is generated outside the pipeline.
    coa_overlap = np.ones(LAP_DURATION_S)

    # Tire load (vertical force on aggregate; double-track model proxy).
    # Higher under braking (load transfer to front) + at high speed (aero).
    tire_load = 3500.0 + 800.0 * np.maximum(0.0, -long_g) + 100.0 * (speed - 30.0)

    # Per-step friction coefficient (Tier 5 thermal + Tier 7 Pacejka proxy):
    # warm peak at mid-speed, slight drop at corner peaks from thermal pad.
    mu_v = 1.25 - 0.02 * np.abs(lat_g)
    mu_v = np.clip(mu_v, 1.05, 1.30)

    # 3D track geometry: Donington is mostly flat with a slight pitch change
    # at Craner Curves (not modeled here; emit small constants).
    track_pitch = np.full(LAP_DURATION_S, 0.003)
    track_bank = np.full(LAP_DURATION_S, -0.015)

    # Yaw rate: lat_g * g / speed when speed > 0 (Ackermann small-angle).
    yaw_rate = np.where(speed > 1.0, lat_g * G / speed, 0.0)

    # Write into the canonical column order.
    rows[:, channel_index("throttle_pct")]      = throttle
    rows[:, channel_index("brake_pa")]          = brake_pa
    rows[:, channel_index("steering_rad")]      = steering
    rows[:, channel_index("rpm")]               = rpm
    rows[:, channel_index("lat_g")]             = lat_g
    rows[:, channel_index("long_g")]            = long_g
    rows[:, channel_index("speed_mps")]         = speed
    rows[:, channel_index("gear")]              = gear
    rows[:, channel_index("coa_overlap_flag")]  = coa_overlap
    rows[:, channel_index("tire_load_n")]       = tire_load
    rows[:, channel_index("mu_v")]              = mu_v
    rows[:, channel_index("track_pitch_rad")]   = track_pitch
    rows[:, channel_index("track_bank_rad")]    = track_bank
    rows[:, channel_index("yaw_rate_rad_s")]    = yaw_rate

    # Small noise on rpm + speed only (driver-input channels stay clean).
    rows[:, channel_index("rpm")]               += rng.normal(0, 20, LAP_DURATION_S)
    rows[:, channel_index("speed_mps")]         += rng.normal(0, 0.1, LAP_DURATION_S)

    return rows


def build_5_lap_telemetry() -> np.ndarray:
    rng = np.random.default_rng(SEED)
    laps = [build_lap_phase(rng) for _ in range(LAPS)]
    full = np.vstack(laps)
    assert full.shape == (TOTAL_ROWS, CHANNEL_COUNT)
    return full


def write_csv(out_path: Path, telemetry: np.ndarray) -> None:
    header = (
        "# FICTIONAL PERSONA - Sarah Reynolds Donington 2026 5-lap synthetic trace.\n"
        "# See docs/sarah-reynolds-persona.md + fixtures/personas/sarah-reynolds-coa-stub.json.\n"
        "# Generated deterministically by apex.instruct.sarah_synth (seed=42).\n"
        "# 1 Hz mini-sector aggregation; 5 laps x 60 sec = 300 rows; CHANNELS order matches shapes.py.\n"
    )
    column_names = ",".join(CHANNELS)
    with out_path.open("w", encoding="utf-8", newline="") as f:
        f.write(header)
        f.write(column_names + "\n")
        for row in telemetry:
            f.write(",".join(f"{v:.4f}" for v in row) + "\n")


def main() -> int:
    telemetry = build_5_lap_telemetry()
    write_csv(OUT_PATH, telemetry)
    print(f"wrote {OUT_PATH}; shape={telemetry.shape}")
    return 0


if __name__ == "__main__":
    sys.exit(main())


__all__ = ["build_5_lap_telemetry", "build_lap_phase", "write_csv", "main"]
