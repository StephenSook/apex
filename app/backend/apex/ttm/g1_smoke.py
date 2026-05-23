"""G1 — TTM zero-shot smoke on a real FastF1 5-lap export (Phase 0 task 0.7).

G-0.5 already proved TTM-r2 loads on RTX 3060 Ti + emits (B, 30, 14) on a
random tensor. G1 strengthens that proof by running the same forward pass
on a real FastF1 5-lap telemetry slice (Bahrain 2024 Q, cached Phase 0
task 0.6), measuring load + inference latency against the council v2
budget (< 60s end-to-end per plan G1 row).

FastF1 ships a reduced channel set (no analog brake_pa, no steering_rad,
no separated G-channels per pre-mortem row 62). G1's purpose is to prove
the TTM-forward path works on real telemetry, not to claim the 14-channel
contract is satisfied by FastF1. The mapping below uses FastF1's actual
channels and fills the absent ones with zeros + a single warning at the
top of the log so downstream consumers know the gap.

Run from repo root:
  app/backend/.venv/Scripts/python.exe -u app/backend/apex/ttm/g1_smoke.py
"""

from __future__ import annotations

import sys
import time
from pathlib import Path

import numpy as np
import torch

REPO_ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(REPO_ROOT / "app" / "backend"))

from apex.shared.contracts import CHANNEL_COUNT, CHANNELS, HORIZON, channel_index, new_audit_id  # noqa: E402
from apex.shared.logging import audit_context, get_logger  # noqa: E402

logger = get_logger("ttm.g1_smoke")

# FastF1 telemetry has these analog channels available; the rest we fill with
# zeros and document in the pre-mortem (row 62 channel-availability gap).
FASTF1_CHANNEL_MAP = {
    "throttle_pct": "Throttle",     # 0..100
    "brake_pa":     "Brake",        # BOOLEAN in FastF1; tile as 0/3.5e6 Pa to give the validator something to chew
    "rpm":          "RPM",
    "speed_mps":    "Speed",        # FastF1 ships km/h; divide by 3.6
    "gear":         "nGear",
}
FASTF1_ABSENT_CHANNELS = (
    "steering_rad", "lat_g", "long_g", "coa_overlap_flag",
    "tire_load_n", "mu_v", "track_pitch_rad", "track_bank_rad", "yaw_rate_rad_s",
)


def load_5lap_export() -> np.ndarray:
    """Pull 5 laps of Hamilton's Bahrain 2024 Q telemetry from the cache.

    Returns a (T, 14) float32 array in CHANNELS column order. T is whatever
    the 5-lap concatenated telemetry length is at FastF1's native sampling
    rate (the cache holds raw telemetry at ~50 Hz).
    """
    import fastf1
    fastf1.Cache.enable_cache(str(REPO_ROOT / "app" / "backend" / ".fastf1_cache"))
    session = fastf1.get_session(2024, "Bahrain", "Q")
    session.load(telemetry=True, laps=True, weather=False)

    # Hamilton was driver '44' in 2024.
    laps = session.laps.pick_drivers("44").iloc[:5]
    parts = []
    for lap in laps.iterlaps():
        # iterlaps yields (idx, lap) tuples
        idx, lap_row = lap
        car_data = lap_row.get_car_data()
        parts.append(car_data)
    import pandas as pd
    car = pd.concat(parts, ignore_index=True)

    # Build (T, 14) in CHANNELS order
    T = len(car)
    out = np.zeros((T, CHANNEL_COUNT), dtype=np.float32)
    for our_name, ff1_name in FASTF1_CHANNEL_MAP.items():
        i = channel_index(our_name)
        if ff1_name not in car.columns:
            logger.warning("g1.fastf1_column_missing", column=ff1_name)
            continue
        col = car[ff1_name].to_numpy(dtype=np.float32)
        if our_name == "speed_mps":
            col = col / 3.6                  # km/h -> m/s
        if our_name == "brake_pa":
            col = col.astype(np.float32) * 3.5e6   # bool -> ~3.5 MPa peak
        out[:, i] = col
    return out


def main() -> int:
    print("=" * 72)
    print("G1 - TTM zero-shot smoke on FastF1 5-lap export")
    print("=" * 72)
    audit_id = new_audit_id()
    with audit_context(audit_id):
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"device: {device}; audit_id: {audit_id}")
        logger.info("g1.start", device=str(device))

        # ---- Load 5-lap export from FastF1 cache -------------------------
        print("[1/4] loading 5-lap Bahrain 2024 Q (Hamilton) from cache ...")
        t0 = time.time()
        telemetry = load_5lap_export()
        load_s = time.time() - t0
        print(f"      loaded in {load_s:.2f}s; shape={telemetry.shape} channels={CHANNEL_COUNT}")
        logger.info(
            "g1.fastf1_loaded",
            elapsed_s=round(load_s, 2),
            shape=tuple(telemetry.shape),
            absent_channels=FASTF1_ABSENT_CHANNELS,
        )

        # ---- Build TTM input (1 sample, context_length window) -----------
        print("[2/4] loading TTM-r2 ...")
        from tsfm_public import TinyTimeMixerForPrediction
        t0 = time.time()
        model = TinyTimeMixerForPrediction.from_pretrained(
            "ibm-granite/granite-timeseries-ttm-r2",
            num_input_channels=CHANNEL_COUNT,
            prediction_filter_length=HORIZON,
        ).to(device).eval()
        ttm_load_s = time.time() - t0
        print(f"      loaded in {ttm_load_s:.2f}s; context_length={model.config.context_length}")
        logger.info("g1.ttm_loaded", elapsed_s=round(ttm_load_s, 2))

        ctx = model.config.context_length
        T = telemetry.shape[0]
        if T < ctx:
            # Edge-pad: replicate first row
            print(f"      telemetry T={T} < context_length={ctx}; edge-padding")
            pad = np.repeat(telemetry[:1], ctx - T, axis=0)
            telemetry = np.concatenate([pad, telemetry], axis=0)
        x_np = telemetry[-ctx:][None, :, :]  # (1, ctx, 14)
        x = torch.from_numpy(x_np).to(device)
        print(f"      ttm input shape: {tuple(x.shape)}")

        # ---- TTM forward ------------------------------------------------
        print("[3/4] TTM forward (zero-shot) ...")
        # Warm-up call (CUDA kernels JIT)
        with torch.no_grad():
            _ = model(past_values=x)
        torch.cuda.synchronize() if device.type == "cuda" else None
        t0 = time.time()
        with torch.no_grad():
            out = model(past_values=x)
        torch.cuda.synchronize() if device.type == "cuda" else None
        infer_ms = (time.time() - t0) * 1000
        print(f"      inference took {infer_ms:.1f} ms (warm)")
        print(f"      output shape: {tuple(out.prediction_outputs.shape)}")
        logger.info("g1.ttm_forward", warm_ms=round(infer_ms, 1), output_shape=tuple(out.prediction_outputs.shape))

        # ---- Verdict -----------------------------------------------------
        print("[4/4] verdict ...")
        expected = (1, HORIZON, CHANNEL_COUNT)
        total_load_s = load_s + ttm_load_s
        shape_ok = tuple(out.prediction_outputs.shape) == expected
        load_ok = total_load_s < 60.0      # plan G1 row: load + 1Hz inference < 60s
        infer_ok = infer_ms < 60_000       # inference itself well under 60s
        all_finite = bool(torch.isfinite(out.prediction_outputs).all())
        verdict = shape_ok and load_ok and infer_ok and all_finite
        print(f"      shape == {expected}: {shape_ok}")
        print(f"      load(FastF1+TTM) < 60s: {load_ok} ({total_load_s:.2f}s)")
        print(f"      warm inference < 60s: {infer_ok} ({infer_ms:.1f}ms)")
        print(f"      all-finite output: {all_finite}")
        print()
        print("=" * 72)
        print(f"VERDICT: {'PASS' if verdict else 'FAIL'}")
        print("=" * 72)
        logger.info("g1.verdict", pass_=verdict, total_load_s=round(total_load_s, 2), warm_ms=round(infer_ms, 1))
        return 0 if verdict else 1


if __name__ == "__main__":
    sys.exit(main())
