/**
 * Wave-45 Phase 9 Block F V15 frontend stub: LIPS 4-axis evaluation
 * harness + APEX-Bench release swap-point per D-026 + G10. Vinh
 * ships the real implementation at `eval/Dockerfile` + `apex-bench/`
 * repo Day 11 per the vinh-backend-plan.md gate map.
 *
 * HEAD: returns the canned 4-axis ablation table for paper §4.5
 * reproducibility-statement cross-reference + /lips-harness page
 * rendering.
 */

import type { NextRequest } from "next/server";

import { VINH_SWAP_POINTS } from "../../../lib/vinh-swap-points";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LIPSRow {
  readonly configuration: string;
  readonly lap_time_mae_s: number;
  readonly physics_violation_rate: number;
  readonly guardian_approve_pct: number;
  readonly inference_latency_ms: number;
}

interface LIPSResponse {
  readonly engine: "lips-v15-canned-fallback" | "lips-v15-real";
  readonly rows: ReadonlyArray<LIPSRow>;
  readonly dataset: string;
  readonly seed: number;
  readonly compute_ms: number;
  readonly swap_point: string;
}

const CANNED_ROWS: ReadonlyArray<LIPSRow> = [
  {
    configuration: "Zero-shot TTM (no projection)",
    lap_time_mae_s: 35.18,
    physics_violation_rate: 0.42,
    guardian_approve_pct: 0,
    inference_latency_ms: 484,
  },
  {
    configuration: "Soft-loss-only (no projection)",
    lap_time_mae_s: 28.66,
    physics_violation_rate: 0.18,
    guardian_approve_pct: 12,
    inference_latency_ms: 504,
  },
  {
    configuration: "APEX hard projection (V2 cvxpylayers)",
    lap_time_mae_s: 18.42,
    physics_violation_rate: 0.0,
    guardian_approve_pct: 88,
    inference_latency_ms: 1030,
  },
  {
    configuration: "Full 3-track ensemble + 8-tier physics",
    lap_time_mae_s: 17.61,
    physics_violation_rate: 0.0,
    guardian_approve_pct: 94,
    inference_latency_ms: 1318,
  },
];

export async function GET(_req: NextRequest): Promise<Response> {
  const t0 = performance.now();
  try {
    const payload: LIPSResponse = {
      engine: "lips-v15-canned-fallback",
      rows: CANNED_ROWS,
      dataset: "FastF1 Hamilton 2024 Bahrain Q laps 4-5 holdout (canned)",
      seed: 42,
      compute_ms: Math.round(performance.now() - t0),
      swap_point: VINH_SWAP_POINTS.V15_LIPS.swap_point,
    };
    return Response.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Lips-Swap-Point": VINH_SWAP_POINTS.V15_LIPS.header,
      },
    });
  } catch (err) {
    console.error("[apex/lips-harness]", err);
    const fallback: LIPSResponse = {
      engine: "lips-v15-canned-fallback",
      rows: [],
      dataset: "error",
      seed: -1,
      compute_ms: Math.round(performance.now() - t0),
      swap_point: `Vinh M3-V15 swap-in error: ${err instanceof Error ? err.message : String(err)}`,
    };
    return Response.json(fallback, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Lips-Swap-Point": VINH_SWAP_POINTS.V15_LIPS.header,
        "X-Apex-Error": "1",
      },
    });
  }
}
