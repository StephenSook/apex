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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SCPIterate {
  readonly iterate: number;
  readonly residual_norm: number;
  readonly trust_region_radius: number;
  readonly powell_rho: number;
  readonly status: "convergent" | "trust-region-step" | "converged";
}

interface SCPResponse {
  readonly engine: "scp-v13-canned-fallback" | "scp-v13-real";
  readonly compute_ms: number;
  readonly iterates: ReadonlyArray<SCPIterate>;
  readonly final_residual: number;
  readonly swap_point: string;
}

const CANNED_ITERATES: ReadonlyArray<SCPIterate> = [
  { iterate: 1, residual_norm: 0.0418, trust_region_radius: 1.0, powell_rho: 0.74, status: "convergent" },
  { iterate: 2, residual_norm: 0.0089, trust_region_radius: 1.0, powell_rho: 0.91, status: "convergent" },
  { iterate: 3, residual_norm: 0.0011, trust_region_radius: 1.0, powell_rho: 0.97, status: "converged" },
];

export async function GET(_req: NextRequest): Promise<Response> {
  const t0 = performance.now();
  const payload: SCPResponse = {
    engine: "scp-v13-canned-fallback",
    compute_ms: Math.round(performance.now() - t0),
    iterates: CANNED_ITERATES,
    final_residual: 0.0011,
    swap_point: "Vinh M3-V13 -> app/backend/apex/physics/projection_scp.py (3-iterate SCP wrap of Stage A)",
  };
  return Response.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "X-Apex-Projector-Swap-Point": "vinh-m3-v13-scp-3-iterate",
    },
  });
}
