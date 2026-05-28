/**
 * Wave-46 D-058 Phase 7.2 NEW route. Tire degradation predictor swap-
 * point. Vinh ships the real predictor at
 * `app/backend/apex/tire_degradation/predictor.py` consuming TTM r2.1
 * forecast + recent lap pace. Predicts per-axle remaining-life
 * percentage over a 10-lap horizon by compound.
 *
 * HEAD canned path: returns canned 10-step degradation curve for soft
 * compound starting at stint lap 1. Frontend renders identically
 * between canned + real per Stream M.3 spec extension contract.
 *
 * Wave-46 D-058 wire-flip: when (future) `NEXT_PUBLIC_USE_REAL_TIRE_DEGRADATION`
 * env flag flips + Vinh backend deploys, this route forwards to
 * `${base}/api/tire-degradation`. Flag not yet added to lib/env.ts
 * since neither backend nor consumer UI panel ship in wave-46; flag
 * lands wave-46.5 alongside TireDegradationPanel UI consumer mount.
 */

import type { NextRequest } from "next/server";

import type {
  TireDegradationResponse,
  TireDegradationStep,
} from "../../../../shared/types";
import { getVinhBackendBaseUrl } from "../../../lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CANNED_STEPS: ReadonlyArray<TireDegradationStep> = [
  { stint_lap: 1, front_left_pct: 98, front_right_pct: 98, rear_left_pct: 96, rear_right_pct: 95 },
  { stint_lap: 2, front_left_pct: 95, front_right_pct: 94, rear_left_pct: 92, rear_right_pct: 90 },
  { stint_lap: 3, front_left_pct: 90, front_right_pct: 89, rear_left_pct: 86, rear_right_pct: 83 },
  { stint_lap: 4, front_left_pct: 84, front_right_pct: 82, rear_left_pct: 78, rear_right_pct: 74 },
  { stint_lap: 5, front_left_pct: 77, front_right_pct: 74, rear_left_pct: 68, rear_right_pct: 63 },
  { stint_lap: 6, front_left_pct: 68, front_right_pct: 65, rear_left_pct: 56, rear_right_pct: 50 },
  { stint_lap: 7, front_left_pct: 58, front_right_pct: 54, rear_left_pct: 42, rear_right_pct: 35 },
  { stint_lap: 8, front_left_pct: 47, front_right_pct: 41, rear_left_pct: 26, rear_right_pct: 18 },
  { stint_lap: 9, front_left_pct: 34, front_right_pct: 27, rear_left_pct: 9, rear_right_pct: 0 },
  { stint_lap: 10, front_left_pct: 19, front_right_pct: 11, rear_left_pct: 0, rear_right_pct: 0 },
];

function cannedPayload(t0: number): TireDegradationResponse {
  return {
    engine: "tire-degradation-canned-fallback",
    compute_ms: Math.round(performance.now() - t0),
    compound: "soft",
    current_stint_lap: 1,
    horizon_laps: 10,
    steps: CANNED_STEPS,
    verdict: "pit-recommended" as const,
  };
}

async function fetchRealBackend(
  t0: number,
): Promise<TireDegradationResponse | null> {
  const base = getVinhBackendBaseUrl();
  if (base === null) return null;
  try {
    const upstream = await fetch(`${base}/api/tire-degradation`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!upstream.ok) {
      console.warn(
        `[apex/tire-degradation] upstream ${upstream.status}; serving canned-fallback`,
      );
      return null;
    }
    const body = (await upstream.json()) as TireDegradationResponse;
    return {
      ...body,
      compute_ms: Math.round(performance.now() - t0),
    };
  } catch (err) {
    console.warn(
      "[apex/tire-degradation] real-backend fetch failed; serving canned",
      err,
    );
    return null;
  }
}

export async function GET(_req: NextRequest): Promise<Response> {
  const t0 = performance.now();
  let payload = cannedPayload(t0);
  // Wave-49 wire-flip: when NEXT_PUBLIC_VINH_BACKEND_BASE_URL is set,
  // forward to the HF Space backend tire-degradation route. Falls back
  // to the canned-fallback on timeout / non-2xx / parse error.
  const real = await fetchRealBackend(t0);
  if (real !== null) payload = real;
  return Response.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "X-Apex-Tire-Degradation-Engine": payload.engine,
    },
  });
}
