"""End-to-end pipeline: telemetry CSV -> forecast -> validator -> text log.

Phase 2 Day 4 task 2.9. Runs the Day-4 demo flow with two forecast modes:

  - 'naive': telemetry IS the forecast (edge-padded / truncated to
    HORIZON). Cheap; no TTM model load required. Doubles as the
    seasonal-naive baseline for the G4 bake-off (task 2.11).
  - 'ttm': frozen TTM-r2 zero-shot forecast via TtmForecaster. Heavy;
    requires the .venv with torch + tsfm_public + ~600MB HF download.
    Integration coverage at tests/test_ttm_integration.py (task 2.10).

The script is callable two ways:
  1. As a library: `from apex.pipelines.telemetry_to_log import run_pipeline`
     returns a PipelineResult with the forecast tensor + violation log +
     CoA parse result for provenance assembly.
  2. As a CLI:
     `python -m apex.pipelines.telemetry_to_log --telemetry sarah.csv --coa sarah.json --mode naive`
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

import numpy as np

from apex.instruct.coa_parser import CoaParseResult, parse_coa_json
from apex.physics.validator import ToleranceBands, validate_forecast
from apex.shared.contracts import (
    CHANNEL_COUNT,
    CHANNELS,
    HORIZON,
    PhysicsViolationLog,
    build_ttm_input,
    channel_index,
)
from apex.ttm.forecast import shape_ttm_input

ForecastMode = Literal["naive", "ttm"]
_KNOWN_MODES: tuple[ForecastMode, ...] = ("naive", "ttm")


# ---- Result dataclass ---------------------------------------------------

@dataclass(frozen=True)
class PipelineResult:
    """Output of `run_pipeline`. Frozen so the Phase 3 provenance assembler
    can pass this object around without worrying about downstream mutation.
    """

    coa: CoaParseResult
    forecast_tensor: np.ndarray         # (HORIZON, CHANNEL_COUNT)
    violation_log: PhysicsViolationLog
    forecast_mode: ForecastMode


# ---- I/O ----------------------------------------------------------------

def load_telemetry_csv(path: Path) -> np.ndarray:
    """Load a Sarah-style telemetry CSV into a (T, CHANNEL_COUNT) array.

    Skips lines beginning with `#` (the fictional-persona watermark + the
    inline comments documenting the fixture purpose) and the header row.
    Channel order in the CSV must match `shared.contracts.CHANNELS`.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"telemetry CSV not found: {path}")

    rows: list[list[float]] = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            stripped = line.strip()
            if not stripped or stripped.startswith("#"):
                continue
            # Header row: starts with the first channel name
            if stripped.startswith(CHANNELS[0]):
                continue
            rows.append([float(x) for x in stripped.split(",")])

    arr = np.asarray(rows, dtype=np.float64)
    if arr.ndim != 2 or arr.shape[1] != CHANNEL_COUNT:
        raise ValueError(
            f"telemetry CSV shape mismatch: expected (T, {CHANNEL_COUNT}); "
            f"got {arr.shape} from {path}"
        )
    return arr


# ---- Forecast modes -----------------------------------------------------

def _naive_forecast(telemetry: np.ndarray) -> np.ndarray:
    """Seasonal-naive forecast: tile/truncate telemetry to (HORIZON, CHANNEL_COUNT).

    Edge-pads short telemetry by repeating the last row (tail-anchor:
    the seasonal-naive prediction "next 30 steps look like the most
    recent telemetry"). Truncates long telemetry to the last HORIZON
    rows. The result is a (HORIZON, CHANNEL_COUNT) array, the V1
    validator's expected input shape.
    """
    T = telemetry.shape[0]
    if T >= HORIZON:
        return telemetry[-HORIZON:].astype(np.float64, copy=True)
    pad = np.repeat(telemetry[-1:], HORIZON - T, axis=0)
    return np.concatenate([telemetry, pad], axis=0).astype(np.float64, copy=True)


def _ttm_forecast(telemetry: np.ndarray) -> np.ndarray:
    """Frozen TTM-r2 zero-shot forecast.

    Loads the model on every call. Pipelines that drive many forecasts
    should hold a TtmForecaster instance directly rather than going
    through this function.
    """
    from apex.ttm.forecast import TtmForecaster

    forecaster = TtmForecaster()
    out = forecaster.forecast(telemetry, source_hz=1)
    # forecaster.forecast returns (1, HORIZON, CHANNEL_COUNT); strip batch
    return out[0].astype(np.float64, copy=False)


# ---- Pipeline driver ----------------------------------------------------

def run_pipeline(
    *,
    telemetry_csv: Path | str,
    coa_json: Path | str,
    forecast_mode: ForecastMode,
    mu: float = 1.2,
    wheelbase_m: float = 2.7,
    out_path: Path | str | None = None,
) -> PipelineResult:
    """Run the Day-4 end-to-end pipeline and return a PipelineResult.

    Optional: when `out_path` is provided, the violation log is also
    written to disk in the engine-agnostic text format.
    """
    if forecast_mode not in _KNOWN_MODES:
        raise ValueError(
            f"forecast_mode must be one of {_KNOWN_MODES}; got {forecast_mode!r}."
        )

    telemetry = load_telemetry_csv(Path(telemetry_csv))
    coa = parse_coa_json(Path(coa_json))

    if forecast_mode == "naive":
        forecast = _naive_forecast(telemetry)
    else:
        forecast = _ttm_forecast(telemetry)

    # Tile the COA simultaneity flag into the forecast's coa_overlap_flag
    # channel. build_ttm_input expects (B, HORIZON, CHANNEL_COUNT); we add
    # then strip the batch axis so the validator (which is per-forecast,
    # not batched) gets back its (HORIZON, CHANNEL_COUNT) contract.
    batched = forecast[None, :, :]
    tiled = build_ttm_input(batched, simultaneity_permitted=coa.simultaneity_permitted)
    forecast = tiled[0]

    simultaneity_channel = forecast[:, channel_index("coa_overlap_flag")]
    log = validate_forecast(
        forecast,
        mu=mu,
        wheelbase_m=wheelbase_m,
        simultaneity_channel=simultaneity_channel,
        bands=ToleranceBands.for_1hz_aggregation(),
    )

    if out_path is not None:
        Path(out_path).write_text(log.to_text(), encoding="utf-8")

    return PipelineResult(
        coa=coa,
        forecast_tensor=forecast,
        violation_log=log,
        forecast_mode=forecast_mode,
    )


# ---- CLI ----------------------------------------------------------------

def _build_arg_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="apex.pipelines.telemetry_to_log",
        description="Telemetry CSV -> forecast -> validator -> text violation log.",
    )
    p.add_argument("--telemetry", required=True, type=Path,
                   help="path to a Sarah-style telemetry CSV in CHANNELS column order")
    p.add_argument("--coa", required=True, type=Path,
                   help="path to a Sarah-style COA JSON stub")
    p.add_argument("--mode", choices=_KNOWN_MODES, default="naive",
                   help="forecast mode: 'naive' (seasonal-naive baseline) "
                        "or 'ttm' (frozen TTM-r2 zero-shot, heavy)")
    p.add_argument("--out", type=Path, default=None,
                   help="optional output path for the text violation log")
    p.add_argument("--mu", type=float, default=1.2,
                   help="nominal friction coefficient (constant-mu V1)")
    p.add_argument("--wheelbase", type=float, default=2.7,
                   help="vehicle wheelbase in meters")
    return p


def main(argv: list[str] | None = None) -> int:
    args = _build_arg_parser().parse_args(argv)
    result = run_pipeline(
        telemetry_csv=args.telemetry,
        coa_json=args.coa,
        forecast_mode=args.mode,
        mu=args.mu,
        wheelbase_m=args.wheelbase,
        out_path=args.out,
    )
    text = result.violation_log.to_text()
    print(text)
    print(
        f"driver={result.coa.driver_id} mode={result.forecast_mode} "
        f"fcvr={result.violation_log.fcvr():.4f} "
        f"violations={len(result.violation_log.records)}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())


__all__ = [
    "PipelineResult",
    "ForecastMode",
    "load_telemetry_csv",
    "run_pipeline",
    "main",
]
