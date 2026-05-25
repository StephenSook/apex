/**
 * Wave-45 Phase 9 Block F V13 frontend stub: Stage B 3-iteration SCP
 * outer loop swap-point per D-050 + D-031 staged ladder. Vinh ships
 * the real implementation at
 * `app/backend/apex/physics/projection_scp.py` wrapping Stage A in
 * 3-iterate Taylor-step linearization.
 *
 * HEAD: returns a canned 3-iteration convergence trace for /judges
 * visualization + paper §3.2 cross-reference.
 */

import type { NextRequest } from "next/server";

import type { SCPIterate, SCPResponse } from "../../../../shared/types";
import { VINH_SWAP_POINTS } from "../../../lib/vinh-swap-points";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CANNED_ITERATES: ReadonlyArray<SCPIterate> = [
  { iterate: 1, residual_norm: 0.0418, trust_region_radius: 1.0, powell_rho: 0.74, status: "convergent" },
  { iterate: 2, residual_norm: 0.0089, trust_region_radius: 1.0, powell_rho: 0.91, status: "convergent" },
  { iterate: 3, residual_norm: 0.0011, trust_region_radius: 1.0, powell_rho: 0.97, status: "converged" },
];

export async function GET(_req: NextRequest): Promise<Response> {
  const t0 = performance.now();
  try {
    const payload: SCPResponse = {
      engine: "scp-v13-canned-fallback",
      compute_ms: Math.round(performance.now() - t0),
      iterates: CANNED_ITERATES,
      final_residual: 0.0011,
      swap_point: VINH_SWAP_POINTS.V13_SCP.swap_point,
    };
    return Response.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Projector-Swap-Point": VINH_SWAP_POINTS.V13_SCP.header,
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
