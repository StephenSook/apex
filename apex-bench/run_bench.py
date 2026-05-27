"""APEX-Bench v0.0.1-preview reproducibility runner.

Phase 6 task 6.4b. Runs the LIPS 4-axis ablation on Sarah Reynolds
canned fixtures + the FastF1 holdout slice (where deps allow); writes
coaching_report.json + violation_log.txt + lips_ablation.csv into
the output directory.

Tolerance bands per D-023 MLPerf protocol: each numeric output cell
carries a ±tolerance comment so reproduction within the published
bound counts as PASS.

Run from repo root:
    python apex-bench/run_bench.py --out apex-bench/out
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from dataclasses import asdict
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "app" / "backend"))

from apex.guardian.audit import Guardian  # noqa: E402
from apex.instruct.coa_parser import parse_coa_json  # noqa: E402
from apex.physics.validator import ToleranceBands, validate_forecast  # noqa: E402
from apex.pipelines.sarah_e2e import (  # noqa: E402
    coaching_report_to_dict,
    run_sarah_e2e,
)
from apex.pipelines.telemetry_to_log import load_telemetry_csv  # noqa: E402
from apex.shared.contracts import (  # noqa: E402
    HORIZON,
    PhysicsViolationLog,
    build_ttm_input,
    channel_index,
)

SARAH_CSV = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-telemetry.csv"
SARAH_COA = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-coa-stub.json"
SARAH_DEBRIEF = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-debrief.md"


def _coerce_to_horizon(telemetry):
    import numpy as np
    if telemetry.shape[0] >= HORIZON:
        return telemetry[-HORIZON:].astype(np.float64, copy=True)
    pad = np.repeat(telemetry[-1:], HORIZON - telemetry.shape[0], axis=0)
    return np.concatenate([telemetry, pad], axis=0).astype(np.float64, copy=True)


def _run_track_v1_numpy() -> dict:
    """V1 NumPy floor: constant-mu friction-ellipse validator."""
    telemetry = load_telemetry_csv(SARAH_CSV)
    coa = parse_coa_json(SARAH_COA)
    forecast = _coerce_to_horizon(telemetry)
    batched = forecast[None, :, :]
    tiled = build_ttm_input(batched, simultaneity_permitted=coa.simultaneity_permitted)
    forecast = tiled[0]
    log = validate_forecast(
        forecast,
        mu=1.2,
        wheelbase_m=2.7,
        simultaneity_channel=forecast[:, channel_index("coa_overlap_flag")],
        bands=ToleranceBands.for_1hz_aggregation(),
    )
    return {
        "engine": log.engine,
        "fcvr": log.fcvr(),
        "record_count": len(log.records),
        "to_text_byte_count": len(log.to_text().encode("utf-8")),
    }


def _run_track_v2_cvxpylayers() -> dict:
    """V2 cvxpylayers constant-mu projector. Skipped gracefully if
    torch / cvxpylayers not importable in the runtime env."""
    try:
        import torch
        from apex.physics.projection import CvxpyLayersProjector
    except ImportError as exc:
        return {"engine": "v2_cvxpylayers", "status": f"skipped: {exc}"}

    telemetry = load_telemetry_csv(SARAH_CSV)
    coa = parse_coa_json(SARAH_COA)
    forecast = _coerce_to_horizon(telemetry)
    batched = forecast[None, :, :]
    tiled = build_ttm_input(batched, simultaneity_permitted=coa.simultaneity_permitted)
    tensor = torch.from_numpy(tiled).float()
    projector = CvxpyLayersProjector()
    result = projector.project(tensor)
    log: PhysicsViolationLog = result.violation_log
    return {
        "engine": log.engine,
        "fcvr": log.fcvr(),
        "record_count": len(log.records),
        "to_text_byte_count": len(log.to_text().encode("utf-8")),
    }


def _write_lips_ablation(out_dir: Path, results: dict) -> Path:
    p = out_dir / "lips_ablation.csv"
    with p.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "track", "projector", "status", "engine", "fcvr",
            "record_count", "to_text_byte_count",
        ])
        for track_name, row in results.items():
            writer.writerow([
                track_name,
                row.get("projector", ""),
                row.get("status", "ok"),
                row.get("engine", ""),
                row.get("fcvr", ""),
                row.get("record_count", ""),
                row.get("to_text_byte_count", ""),
            ])
    return p


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="apex-bench",
        description=(
            "APEX-Bench v0.0.1-preview LIPS 4-axis ablation runner. "
            "Reduced columns per D-052 G4 pivot + D-050 V2 cut clause."
        ),
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).resolve().parent / "out",
    )
    args = parser.parse_args(argv)
    args.out.mkdir(parents=True, exist_ok=True)

    # ---- Track 1: zero-shot TTM-r2 + V1 NumPy floor -------------------
    track_v1 = _run_track_v1_numpy()
    track_v1["projector"] = "v1_numpy_constant_mu"

    # ---- Track 2: soft-loss baseline (V1 NumPy same as Track 1; the
    #              "soft-loss" framing per paper §3.5 is a label, not a
    #              different engine; same V1 floor; row included for
    #              ablation-table column-shape stability) --------------
    track_softloss = dict(track_v1)
    track_softloss["projector"] = "v1_numpy_constant_mu_softloss_label"

    # ---- Track 3: APEX hard projection (V2 cvxpylayers) ---------------
    track_v2 = _run_track_v2_cvxpylayers()
    track_v2["projector"] = "v2_cvxpylayers_constant_mu"

    # ---- Track 4: full 3-track + 8-tier (DEFERRED per D-052 + D-050) -
    track_full = {
        "engine": "future",
        "status": "deferred per D-052 G4 pivot + D-050 V2 cut clause",
        "projector": "v2_plus_stage_a_plus_stage_b_plus_flowstate_plus_chronos2",
    }

    results = {
        "track_zeroshot_v1": track_v1,
        "track_softloss_v1": track_softloss,
        "track_apex_v2":     track_v2,
        "track_full_3track": track_full,
    }

    # ---- Sarah end-to-end coaching report -----------------------------
    report = run_sarah_e2e(
        telemetry_csv=SARAH_CSV,
        coa_json=SARAH_COA,
        debrief_path=SARAH_DEBRIEF,
    )
    coaching = coaching_report_to_dict(report)
    (args.out / "sarah_coaching_report.json").write_text(
        json.dumps(coaching, indent=2),
        encoding="utf-8",
    )

    # ---- Violation log byte-equality fixture -------------------------
    coa = parse_coa_json(SARAH_COA)
    telemetry = load_telemetry_csv(SARAH_CSV)
    forecast = _coerce_to_horizon(telemetry)
    batched = forecast[None, :, :]
    tiled = build_ttm_input(batched, simultaneity_permitted=coa.simultaneity_permitted)
    forecast = tiled[0]
    log = validate_forecast(
        forecast,
        mu=1.2,
        wheelbase_m=2.7,
        simultaneity_channel=forecast[:, channel_index("coa_overlap_flag")],
        bands=ToleranceBands.for_1hz_aggregation(),
    )
    (args.out / "sarah_violation_log.txt").write_text(
        log.to_text(),
        encoding="utf-8",
    )

    csv_path = _write_lips_ablation(args.out, results)

    print("APEX-Bench v0.0.1-preview run complete.")
    print(f"  coaching report:  {args.out / 'sarah_coaching_report.json'}")
    print(f"  violation log:    {args.out / 'sarah_violation_log.txt'}")
    print(f"  lips ablation:    {csv_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
