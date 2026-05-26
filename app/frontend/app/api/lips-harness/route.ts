/**
 * Wave-45 Phase 9 Block F V15 frontend stub + wave-46 Phase 3 wire-flip:
 * LIPS 4-axis evaluation harness + APEX-Bench release swap-point per
 * D-026 + G10. Vinh ships the real implementation at `eval/Dockerfile`
 * + `apex-bench/` repo Day 11 per the vinh-backend-plan.md gate map.
 *
 * HEAD canned path: returns the canned 4-axis ablation table for paper
 * §4.5 reproducibility-statement cross-reference + /lips-harness page
 * rendering.
 *
 * Wave-46 D-058 Phase 3.3 + 3.4: when `NEXT_PUBLIC_USE_REAL_BACKEND_V15`
 * is "1" AND `NEXT_PUBLIC_VINH_BACKEND_BASE_URL` is set, fetch the real
 * Vinh backend at `${base}/api/lips-harness` + return the upstream
 * `LIPSResponse` payload with engine = "lips-v15-real". Falls back to
 * canned on fetch failure.
 */

import type { NextRequest } from "next/server";

import type { LIPSResponse, LIPSRow } from "../../../../shared/types";
import { getVinhBackendBaseUrl, shouldUseRealBackend } from "../../../lib/env";
import { VINH_SWAP_POINTS } from "../../../lib/vinh-swap-points";

export const runtime = "edge";
export const dynamic = "force-dynamic";

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

function cannedPayload(t0: number): LIPSResponse {
  return {
    engine: "lips-v15-canned-fallback",
    rows: CANNED_ROWS,
    dataset: "FastF1 Hamilton 2024 Bahrain Q laps 4-5 holdout (canned)",
    seed: 42,
    compute_ms: Math.round(performance.now() - t0),
    swap_point: VINH_SWAP_POINTS.V15_LIPS.swap_point,
  };
}

async function fetchRealBackend(t0: number): Promise<LIPSResponse | null> {
  const base = getVinhBackendBaseUrl();
  if (base === null) return null;
  try {
    const upstream = await fetch(`${base}/api/lips-harness`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!upstream.ok) {
      console.warn(`[apex/lips-harness] upstream ${upstream.status} ${upstream.statusText}`);
      return null;
    }
    const body = (await upstream.json()) as LIPSResponse;
    return {
      ...body,
      engine: "lips-v15-real",
      compute_ms: Math.round(performance.now() - t0),
    };
  } catch (err) {
    console.error("[apex/lips-harness] real-backend fetch failed", err);
    return null;
  }
}

export async function GET(_req: NextRequest): Promise<Response> {
  const t0 = performance.now();
  try {
    let payload = cannedPayload(t0);
    if (shouldUseRealBackend("USE_REAL_BACKEND_V15")) {
      const real = await fetchRealBackend(t0);
      if (real !== null) payload = real;
    }
    return Response.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Lips-Swap-Point": VINH_SWAP_POINTS.V15_LIPS.header,
        "X-Apex-Lips-Engine": payload.engine,
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
      status: 502,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Lips-Swap-Point": VINH_SWAP_POINTS.V15_LIPS.header,
        "X-Apex-Error": "1",
      },
    });
  }
}
