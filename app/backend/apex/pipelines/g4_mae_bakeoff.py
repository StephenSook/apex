"""G4 MAE bake-off: zero-shot TTM-r2 vs seasonal-naive on FastF1 holdouts.

Phase 2 Day 4 task 2.11 per docs/vinh-backend-plan.md L59 + L152.

Pass criterion (plan L59):
    holdout = laps 4-5 of fixture session (Hamilton Bahrain 2024 Q),
    seed = 42,
    channels = speed_mps + long_g (long_g absent from FastF1 per pre-mortem
        row 62; we report speed_mps as the load-bearing comparison and
        document the long_g gap),
    metric = per-channel MAE delta (TTM beats seasonal-naive by any margin
        in our favor counts as PASS).

Failure mode: TTM MAE >= naive MAE -> fine-tune-first pivot per plan L377
"decision triggers" table, skip the zero-shot pitch claim, escalate to
Stephen.

Methodology:
    - Load Hamilton's Bahrain 2024 Q telemetry from the prefetched FastF1
      cache (G1 + task 2.10 use the same source).
    - Aggregate to 1 Hz mini-sectors.
    - Split: laps 1-3 = TTM context window, laps 4-5 = holdout (the next
      HORIZON=30 seconds after the lap-3 trailing edge).
    - TTM forecast: TtmForecaster.forecast() over the context window.
    - Seasonal-naive baseline: repeat the last context-window value
      (tail-anchor) for HORIZON steps. This is the same definition the
      naive forecast in pipelines/telemetry_to_log.py uses (the G4
      baseline + the demo baseline are the same code path).
    - MAE = mean(|forecast[step, ch] - actual[step, ch]|) over the
      holdout. Compare per-channel across the two forecasters.

Run from app/backend/:
    .venv/Scripts/python -m apex.pipelines.g4_mae_bakeoff
"""

from __future__ import annotations

import json
import sys
import time
from dataclasses import asdict, dataclass
from pathlib import Path

import numpy as np

from apex.shared.contracts import CHANNEL_COUNT, CHANNELS, HORIZON, channel_index
from apex.ttm.forecast import aggregate_to_1hz, shape_ttm_input

SEED = 42
EVAL_CHANNELS = ("speed_mps", "long_g")

REPO_ROOT = Path(__file__).resolve().parents[4]
FASTF1_CACHE = REPO_ROOT / "app" / "backend" / ".fastf1_cache"


@dataclass(frozen=True)
class ChannelResult:
    channel: str
    ttm_mae: float
    naive_mae: float
    available_in_fastf1: bool

    @property
    def mae_delta(self) -> float:
        """Negative means TTM wins (lower MAE)."""
        return self.ttm_mae - self.naive_mae

    @property
    def ttm_wins(self) -> bool:
        return self.ttm_mae < self.naive_mae


@dataclass(frozen=True)
class BakeoffResult:
    channels: tuple[ChannelResult, ...]
    holdout_steps: int
    context_steps: int
    seed: int
    fastf1_source: str
    ttm_load_seconds: float
    ttm_forward_ms: float

    @property
    def pass_(self) -> bool:
        """G4 passes if TTM wins on speed_mps. long_g is absent from
        FastF1 per pre-mortem row 62 and reports as not-comparable; the
        gate decision rides on speed_mps alone.
        """
        for ch in self.channels:
            if ch.channel == "speed_mps":
                return ch.ttm_wins
        return False


def load_hamilton_laps(lap_indices: tuple[int, ...]) -> tuple[np.ndarray, int]:
    """Pull Hamilton's Bahrain 2024 Q laps from the cache and concatenate.

    Returns (telemetry (T, CHANNEL_COUNT) float32, native sample rate Hz).
    The native rate is derived from the median `Date` delta per row; the
    G1 smoke's `source_hz=50` was off by ~12x (FastF1 car_data is ~4 Hz
    in practice, not 50 Hz). See `logs/day-04-g4.md` for the audit.
    """
    import fastf1
    import pandas as pd

    fastf1.Cache.enable_cache(str(FASTF1_CACHE))
    session = fastf1.get_session(2024, "Bahrain", "Q")
    session.load(telemetry=True, laps=True, weather=False)

    all_laps = session.laps.pick_drivers("44")
    parts = []
    for i in lap_indices:
        lap = all_laps.iloc[i]
        car_data = lap.get_car_data()
        parts.append(car_data)
    car = pd.concat(parts, ignore_index=True)

    # Derive the actual sample rate from the `Date` column. FastF1 ships
    # variable-rate samples; we round to the nearest integer Hz so the
    # aggregator's reshape contract holds.
    if "Date" in car.columns:
        deltas = car["Date"].diff().dt.total_seconds().dropna()
        median_dt = float(deltas.median())
        derived_hz = max(1, round(1.0 / median_dt))
    else:
        derived_hz = 4   # documented fallback

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

    return out, derived_hz


def seasonal_naive_forecast(context: np.ndarray) -> np.ndarray:
    """Tail-anchored naive baseline: repeat the last context row HORIZON times.

    This is the same baseline pipelines/telemetry_to_log.py uses in 'naive'
    mode, so G4 and the demo pipeline share a single naive-forecast definition.
    """
    return np.repeat(context[-1:], HORIZON, axis=0).astype(np.float64, copy=False)


def compute_per_channel_mae(
    forecast: np.ndarray,
    actual: np.ndarray,
    channels: tuple[str, ...],
) -> dict[str, float]:
    """forecast, actual: shape (HORIZON, CHANNEL_COUNT). Returns per-channel MAE."""
    out: dict[str, float] = {}
    for ch in channels:
        i = channel_index(ch)
        residual = np.abs(forecast[:, i] - actual[:, i])
        out[ch] = float(residual.mean())
    return out


def run_bakeoff() -> BakeoffResult:
    np.random.seed(SEED)

    # ---- Load laps 0-2 (context) + 3-4 (holdout) ----------------------
    # FastF1 lap indices are zero-based; "laps 4-5" in plan-speak = idx 3-4.
    print("[1/5] loading Hamilton Bahrain 2024 Q laps 1-3 + 4-5 from cache ...")
    context_raw, source_hz = load_hamilton_laps((0, 1, 2))
    holdout_raw, _ = load_hamilton_laps((3, 4))
    print(f"      context T={context_raw.shape[0]} rows @ {source_hz} Hz")
    print(f"      holdout T={holdout_raw.shape[0]} rows @ {source_hz} Hz")

    # ---- Aggregate both to 1 Hz mini-sectors --------------------------
    print("[2/5] aggregating to 1 Hz ...")
    context_1hz = aggregate_to_1hz(context_raw, source_hz=source_hz)
    holdout_1hz = aggregate_to_1hz(holdout_raw, source_hz=source_hz)
    print(f"      context 1Hz T={context_1hz.shape[0]}; holdout 1Hz T={holdout_1hz.shape[0]}")

    if holdout_1hz.shape[0] < HORIZON:
        raise RuntimeError(
            f"holdout has {holdout_1hz.shape[0]} 1Hz rows; need at least {HORIZON} for the bake-off."
        )

    holdout_window = holdout_1hz[:HORIZON].astype(np.float64)

    # ---- TTM zero-shot forecast --------------------------------------
    print("[3/5] TTM-r2 zero-shot forecast ...")
    t0 = time.time()
    from apex.ttm.forecast import TtmForecaster
    forecaster = TtmForecaster()
    ttm_load_seconds = time.time() - t0
    print(f"      TTM-r2 loaded in {ttm_load_seconds:.2f}s; context_length={forecaster.context_length}")

    # We want forecaster's full path (aggregate -> shape -> forward) on the
    # CONTEXT telemetry, but we already aggregated. Re-pack the aggregated
    # context as if it were 1 Hz raw (no further aggregation needed).
    t0 = time.time()
    ttm_pred_1hzraw = forecaster.forecast(context_1hz.astype(np.float32), source_hz=1)
    ttm_forward_ms = (time.time() - t0) * 1000.0
    ttm_forecast = ttm_pred_1hzraw[0].astype(np.float64)
    print(f"      forward {ttm_forward_ms:.1f} ms; output shape={ttm_pred_1hzraw.shape}")

    # ---- Seasonal-naive baseline -------------------------------------
    print("[4/5] seasonal-naive baseline ...")
    naive_forecast = seasonal_naive_forecast(context_1hz)
    print(f"      naive forecast shape={naive_forecast.shape}")

    # ---- Per-channel MAE ---------------------------------------------
    print("[5/5] computing per-channel MAE ...")
    ttm_mae = compute_per_channel_mae(ttm_forecast, holdout_window, EVAL_CHANNELS)
    naive_mae = compute_per_channel_mae(naive_forecast, holdout_window, EVAL_CHANNELS)

    channel_results: list[ChannelResult] = []
    for ch in EVAL_CHANNELS:
        available = ch in ("throttle_pct", "brake_pa", "rpm", "speed_mps", "gear")
        channel_results.append(
            ChannelResult(
                channel=ch,
                ttm_mae=ttm_mae[ch],
                naive_mae=naive_mae[ch],
                available_in_fastf1=available,
            )
        )

    return BakeoffResult(
        channels=tuple(channel_results),
        holdout_steps=HORIZON,
        context_steps=int(context_1hz.shape[0]),
        seed=SEED,
        fastf1_source="Hamilton 2024 Bahrain Q, laps 1-3 context / 4-5 holdout",
        ttm_load_seconds=round(ttm_load_seconds, 2),
        ttm_forward_ms=round(ttm_forward_ms, 1),
    )


def render_report(result: BakeoffResult) -> str:
    lines: list[str] = []
    lines.append("=" * 72)
    lines.append("G4 - TTM zero-shot vs seasonal-naive MAE bake-off")
    lines.append("=" * 72)
    lines.append(f"source: {result.fastf1_source}")
    lines.append(f"seed: {result.seed}; horizon: {result.holdout_steps} steps @ 1 Hz")
    lines.append(f"context: {result.context_steps} 1 Hz steps")
    lines.append(f"TTM load: {result.ttm_load_seconds:.2f}s; forward: {result.ttm_forward_ms:.1f} ms")
    lines.append("")
    lines.append(f"{'channel':<14} {'TTM MAE':>12} {'naive MAE':>12} {'delta':>12} verdict")
    lines.append("-" * 72)
    for ch in result.channels:
        if not ch.available_in_fastf1:
            verdict = "n/a (FastF1 channel absent per pre-mortem row 62)"
            lines.append(
                f"{ch.channel:<14} {'-':>12} {'-':>12} {'-':>12} {verdict}"
            )
            continue
        verdict = "TTM wins" if ch.ttm_wins else "naive wins"
        lines.append(
            f"{ch.channel:<14} {ch.ttm_mae:>12.4f} {ch.naive_mae:>12.4f} "
            f"{ch.mae_delta:>12.4f} {verdict}"
        )
    lines.append("")
    verdict = "PASS" if result.pass_ else "FAIL"
    lines.append(f"VERDICT (G4 floor: TTM wins on speed_mps): {verdict}")
    lines.append("=" * 72)
    return "\n".join(lines)


def main() -> int:
    result = run_bakeoff()
    report = render_report(result)
    print(report)

    out_dir = REPO_ROOT / "logs"
    out_dir.mkdir(exist_ok=True)
    (out_dir / "day-04-g4-numbers.json").write_text(
        json.dumps(
            {
                "channels": [asdict(c) for c in result.channels],
                "holdout_steps": result.holdout_steps,
                "context_steps": result.context_steps,
                "seed": result.seed,
                "fastf1_source": result.fastf1_source,
                "ttm_load_seconds": result.ttm_load_seconds,
                "ttm_forward_ms": result.ttm_forward_ms,
                "pass": result.pass_,
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"\nwrote numbers JSON to {out_dir / 'day-04-g4-numbers.json'}")
    return 0 if result.pass_ else 1


if __name__ == "__main__":
    sys.exit(main())


__all__ = [
    "BakeoffResult",
    "ChannelResult",
    "compute_per_channel_mae",
    "load_hamilton_laps",
    "main",
    "render_report",
    "run_bakeoff",
    "seasonal_naive_forecast",
]
