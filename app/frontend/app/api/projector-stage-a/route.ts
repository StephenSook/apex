/**
 * Wave-45 Phase 9 Block F V12 frontend stub + wave-46 Phase 2 wire-flip:
 * Stage A 8-tier Pacejka linearization swap-point per D-050 + D-031 staged
 * ladder. Vinh ships the real implementation at
 * `app/backend/apex/physics/projection_pacejka.py` satisfying the
 * `DifferentiableProjector` Protocol for one-constructor-call swap.
 *
 * HEAD canned path: returns a canned 8-tier linearization trace JSON for
 * /judges + paper §3.2 visualization. Frontend renders identically
 * between canned + real per Stream M.3 spec extension contract.
 *
 * Wave-46 D-058 Phase 2.3 + 2.6: when `NEXT_PUBLIC_USE_REAL_BACKEND_V12`
 * is "1" AND `NEXT_PUBLIC_VINH_BACKEND_BASE_URL` is set, fetch the real
 * Vinh backend at `${base}/api/projector-stage-a` + return the upstream
 * `PacejkaResponse` payload with engine = "pacejka-v12-real". Falls back
 * to canned on fetch failure (network + 5xx + parse error) to keep
 * /judges + /lips-harness panels rendering during Vinh deploy transitions.
 */

import type { NextRequest } from "next/server";

import type { PacejkaResponse, PacejkaTier } from "../../../../shared/types";
import { getVinhBackendBaseUrl, shouldUseRealBackend } from "../../../lib/env";
import { VINH_SWAP_POINTS } from "../../../lib/vinh-swap-points";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const CANNED_TIERS: ReadonlyArray<PacejkaTier> = [
  { tier: 0, name: "Vehicle dynamics", residual_norm: 0.0021, status: "converged" },
  { tier: 1, name: "Friction ellipse", residual_norm: 0.0008, status: "converged" },
  { tier: 2, name: "Polyphase anomaly (TSPulse)", residual_norm: 0.0044, status: "converged" },
  { tier: 3, name: "Thermal envelope", residual_norm: 0.0102, status: "linearized" },
  { tier: 4, name: "SCP outer loop (single iterate)", residual_norm: 0.0034, status: "converged" },
  { tier: 5, name: "Pacejka linearization (D-015 Tier 7)", residual_norm: 0.0156, status: "linearized" },
  { tier: 6, name: "Bicycle model", residual_norm: 0.0011, status: "converged" },
  { tier: 7, name: "Forward-Euler kinematic step", residual_norm: 0.0003, status: "converged" },
];

function cannedPayload(t0: number): PacejkaResponse {
  return {
    engine: "pacejka-v12-canned-fallback",
    compute_ms: Math.round(performance.now() - t0),
    tiers: CANNED_TIERS,
    final_violation_count: 0,
    swap_point: VINH_SWAP_POINTS.V12_PACEJKA.swap_point,
  };
}

async function fetchRealBackend(t0: number): Promise<PacejkaResponse | null> {
  const base = getVinhBackendBaseUrl();
  if (base === null) return null;
  try {
    const upstream = await fetch(`${base}/api/projector-stage-a`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!upstream.ok) return null;
    const body = (await upstream.json()) as PacejkaResponse;
    return {
      ...body,
      engine: "pacejka-v12-real",
      compute_ms: Math.round(performance.now() - t0),
    };
  } catch (err) {
    console.error("[apex/projector-stage-a] real-backend fetch failed", err);
    return null;
  }
}

export async function GET(_req: NextRequest): Promise<Response> {
  const t0 = performance.now();
  try {
    let payload = cannedPayload(t0);
    if (shouldUseRealBackend("USE_REAL_BACKEND_V12")) {
      const real = await fetchRealBackend(t0);
      if (real !== null) payload = real;
    }
    return Response.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Projector-Swap-Point": VINH_SWAP_POINTS.V12_PACEJKA.header,
        "X-Apex-Projector-Engine": payload.engine,
      },
    });
  } catch (err) {
    console.error("[apex/projector-stage-a]", err);
    const fallback: PacejkaResponse = {
      engine: "pacejka-v12-canned-fallback",
      compute_ms: Math.round(performance.now() - t0),
      tiers: [],
      final_violation_count: -1,
      swap_point: `Vinh M3-V12 swap-in error: ${err instanceof Error ? err.message : String(err)}`,
    };
    return Response.json(fallback, {
      status: 502,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Projector-Swap-Point": VINH_SWAP_POINTS.V12_PACEJKA.header,
        "X-Apex-Error": "1",
      },
    });
  }
}
