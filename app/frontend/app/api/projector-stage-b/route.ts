/**
 * Wave-45 Phase 9 Block F V13 frontend stub + wave-46 Phase 2 wire-flip:
 * Stage B 3-iteration SCP outer loop swap-point per D-050 + D-031 staged
 * ladder. Vinh ships the real implementation at
 * `app/backend/apex/physics/projection_scp.py` wrapping Stage A in
 * 3-iterate Taylor-step linearization.
 *
 * HEAD canned path: returns a canned 3-iteration convergence trace for
 * /judges visualization + paper §3.2 cross-reference.
 *
 * Wave-46 D-058 Phase 2.4 + 2.6: when `NEXT_PUBLIC_USE_REAL_BACKEND_V13`
 * is "1" AND `NEXT_PUBLIC_VINH_BACKEND_BASE_URL` is set, fetch the real
 * Vinh backend at `${base}/api/projector-stage-b` + return the upstream
 * `SCPResponse` payload with engine = "scp-v13-real". Falls back to
 * canned on fetch failure.
 */

import type { NextRequest } from "next/server";

import type { SCPIterate, SCPResponse } from "../../../../shared/types";
import { getVinhBackendBaseUrl, shouldUseRealBackend } from "../../../lib/env";
import { VINH_SWAP_POINTS } from "../../../lib/vinh-swap-points";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const CANNED_ITERATES: ReadonlyArray<SCPIterate> = [
  { iterate: 1, residual_norm: 0.0418, trust_region_radius: 1.0, powell_rho: 0.74, status: "convergent" },
  { iterate: 2, residual_norm: 0.0089, trust_region_radius: 1.0, powell_rho: 0.91, status: "convergent" },
  { iterate: 3, residual_norm: 0.0011, trust_region_radius: 1.0, powell_rho: 0.97, status: "converged" },
];

function cannedPayload(t0: number): SCPResponse {
  return {
    engine: "scp-v13-canned-fallback",
    compute_ms: Math.round(performance.now() - t0),
    iterates: CANNED_ITERATES,
    final_residual: 0.0011,
    swap_point: VINH_SWAP_POINTS.V13_SCP.swap_point,
  };
}

async function fetchRealBackend(t0: number): Promise<SCPResponse | null> {
  const base = getVinhBackendBaseUrl();
  if (base === null) return null;
  try {
    const upstream = await fetch(`${base}/api/projector-stage-b`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!upstream.ok) {
      console.warn(`[apex/projector-stage-b] upstream ${upstream.status} ${upstream.statusText}`);
      return null;
    }
    const body = (await upstream.json()) as SCPResponse;
    return {
      ...body,
      engine: "scp-v13-real",
      compute_ms: Math.round(performance.now() - t0),
    };
  } catch (err) {
    console.error("[apex/projector-stage-b] real-backend fetch failed", err);
    return null;
  }
}

export async function GET(_req: NextRequest): Promise<Response> {
  const t0 = performance.now();
  try {
    let payload = cannedPayload(t0);
    if (shouldUseRealBackend("USE_REAL_BACKEND_V13")) {
      const real = await fetchRealBackend(t0);
      if (real !== null) payload = real;
    }
    return Response.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Projector-Swap-Point": VINH_SWAP_POINTS.V13_SCP.header,
        "X-Apex-Projector-Engine": payload.engine,
      },
    });
  } catch (err) {
    console.error("[apex/projector-stage-b]", err);
    const fallback: SCPResponse = {
      engine: "scp-v13-canned-fallback",
      compute_ms: Math.round(performance.now() - t0),
      iterates: [],
      final_residual: -1,
      swap_point: `Vinh M3-V13 swap-in error: ${err instanceof Error ? err.message : String(err)}`,
    };
    return Response.json(fallback, {
      status: 502,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Projector-Swap-Point": VINH_SWAP_POINTS.V13_SCP.header,
        "X-Apex-Error": "1",
      },
    });
  }
}
