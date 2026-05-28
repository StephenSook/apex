/**
 * Wave-46 Phase 4.4 NEW route. IBM TSPulse 1M polyphase anomaly detector
 * swap-point per D-016 Layer 2. Vinh M3-V7 ships the real implementation
 * at `app/backend/apex/tspulse/anomaly.py` consuming the polyphase
 * decomposition of the raw 50 Hz telemetry tensor at four frequency
 * bands (DC + low + mid + high). Pre-mortem row 71 success criterion is
 * sub-30 ms per-window detection so the projector QP retains its budget.
 *
 * HEAD canned path: returns a canned 5-band anomaly snapshot matching
 * DEMO_TSPULSE_ACTIVE shape (currently surfaced via
 * `components/JudgesGalaxyMovesShell.tsx` which passes inline mock to
 * `TSPulseAnomalyPanel`). Lets the panel migrate from prop-driven mock
 * to fetch-driven live data without a Vinh-side ship.
 *
 * Wave-46 D-058 Phase 4.4 wire-flip: when `NEXT_PUBLIC_USE_REAL_TSPULSE`
 * is "1" + `NEXT_PUBLIC_VINH_BACKEND_BASE_URL` is set, fetch
 * `${base}/api/tspulse/anomaly` from Vinh's polyphase detector + return
 * the upstream `TSPulseResponse` payload with engine = "tspulse-v7-real".
 * Falls back to canned on any fetch failure.
 */

import type { NextRequest } from "next/server";

import type { TSPulseAnomalyState, TSPulseResponse } from "../../../../../shared/types";
import { getVinhBackendBaseUrl, shouldUseRealBackend } from "../../../../lib/env";
import { VINH_SWAP_POINTS } from "../../../../lib/vinh-swap-points";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const CANNED_STATE: TSPulseAnomalyState = {
  status: "anomaly",
  window_index: 18,
  score: 0.842,
  threshold_p95: 0.732,
  affected_bands: ["mid", "high"],
  detection_ms: 18,
};

function cannedPayload(t0: number): TSPulseResponse {
  return {
    engine: "tspulse-v7-canned-fallback",
    compute_ms: Math.round(performance.now() - t0),
    state: CANNED_STATE,
    swap_point: VINH_SWAP_POINTS.V7_TSPULSE.swap_point,
  };
}

async function fetchRealBackend(t0: number): Promise<TSPulseResponse | null> {
  const base = getVinhBackendBaseUrl();
  if (base === null) return null;
  try {
    const upstream = await fetch(`${base}/api/tspulse/anomaly`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!upstream.ok) {
      console.warn(`[apex/tspulse/anomaly] upstream ${upstream.status} ${upstream.statusText}`);
      return null;
    }
    const body = (await upstream.json()) as TSPulseResponse;
    return {
      ...body,
      engine: "tspulse-v7-real",
      compute_ms: Math.round(performance.now() - t0),
    };
  } catch (err) {
    console.error("[apex/tspulse/anomaly] real-backend fetch failed", err);
    return null;
  }
}

export async function GET(_req: NextRequest): Promise<Response> {
  const t0 = performance.now();
  try {
    let payload = cannedPayload(t0);
    if (shouldUseRealBackend("USE_REAL_TSPULSE")) {
      const real = await fetchRealBackend(t0);
      if (real !== null) payload = real;
    }
    return Response.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Tspulse-Swap-Point": VINH_SWAP_POINTS.V7_TSPULSE.header,
        "X-Apex-Tspulse-Engine": payload.engine,
      },
    });
  } catch (err) {
    console.error("[apex/tspulse/anomaly]", err);
    const fallback: TSPulseResponse = {
      engine: "tspulse-v7-canned-fallback",
      compute_ms: Math.round(performance.now() - t0),
      state: { status: "error", message: err instanceof Error ? err.message : String(err) },
      swap_point: `Vinh M3-V7 swap-in error: ${err instanceof Error ? err.message : String(err)}`,
    };
    return Response.json(fallback, {
      status: 502,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Tspulse-Swap-Point": VINH_SWAP_POINTS.V7_TSPULSE.header,
        "X-Apex-Error": "1",
      },
    });
  }
}
