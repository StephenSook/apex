/**
 * Wave-46 Phase 3.5 NEW route. Returns paired COA-parameterized
 * simultaneity-gate verdicts (coa_overlap_flag = 1 vs = 0) on the same
 * physical event (slowest-corner brake-release micro-window on adaptive
 * hand-controls: brake 0.42 MPa residual + throttle 12 percent rising).
 * Replaces COAGateToggle's
 * pure-UI toggle decoration with a route-backed verdict-diff that flips
 * to V14 LangGraph runtime live verdicts when wave-46 Phase 3
 * NEXT_PUBLIC_USE_REAL_BACKEND_V14 + NEXT_PUBLIC_VINH_BACKEND_BASE_URL
 * are both set.
 *
 * HEAD canned path: returns symmetric verdicts mirroring the existing
 * COAGateToggle narrative so /judges renders identical content
 * whether the V14 backend is reachable or not. Real path overrides
 * with whatever the LangGraph runtime returns from
 * `${base}/api/judges/coa-diff`.
 *
 * Consumed by `app/frontend/components/RealtimeCOADiffPanel.tsx` on
 * /judges between architecture figure + galaxy-moves cluster.
 */

import type { NextRequest } from "next/server";

import type { COADiffResponse, COADiffVerdict } from "../../../../../shared/types";
import { getVinhBackendBaseUrl, shouldUseRealBackend } from "../../../../lib/env";
import { VINH_SWAP_POINTS } from "../../../../lib/vinh-swap-points";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const CANNED_PERMITTED: COADiffVerdict = {
  coa_overlap_flag: 1,
  verdict: "feasible",
  headline: "Projector verdict: feasible",
  body: "COA flag = 1. The driver's adaptive equipment authorises brake + throttle simultaneity per the hardware-spec section. Projector permits the input. Tuning recommendation surfaces the COA citation.",
  projection_trace: [
    { stage: "Friction ellipse", residual_norm: 0.0008, status: "converged" },
    { stage: "Forward-Euler kinematic step", residual_norm: 0.0003, status: "converged" },
    { stage: "Bicycle model coupling", residual_norm: 0.0011, status: "converged" },
    { stage: "COA simultaneity gate (flag=1)", residual_norm: 0.0, status: "converged" },
  ],
};

const CANNED_BLOCKED: COADiffVerdict = {
  coa_overlap_flag: 0,
  verdict: "violation",
  headline: "Projector verdict: violation",
  body: "COA flag = 0. The same physical input is treated as a brake-throttle simultaneity violation under able-bodied physics. Tuning recommendation reads `release brake before throttle` which is unactionable for an adaptive driver. This is exactly the misdiagnosis APEX prevents.",
  projection_trace: [
    { stage: "Friction ellipse", residual_norm: 0.0008, status: "converged" },
    { stage: "Forward-Euler kinematic step", residual_norm: 0.0003, status: "converged" },
    { stage: "Bicycle model coupling", residual_norm: 0.0011, status: "converged" },
    { stage: "COA simultaneity gate (flag=0)", residual_norm: 0.504, status: "violation" },
  ],
};

// Persona-decoupled per feedback_persona_not_hardcoded_in_ui.md (Stephen
// explicit 2026-05-24). Default GET response describes the telemetry
// micro-window in generic adaptive-controls vocabulary; persona-named
// fixtures live ONLY in the storytelling layer (demo video + storyboard +
// persona doc), never as a default API response or default UI state.
const CANNED_SCENARIO =
  "Slowest-corner brake-release-to-throttle-on micro-window on adaptive hand-controls: brake 0.42 MPa residual on the lever + throttle 12 percent via secondary hand-control. Same physical event, different verdicts on different COA simultaneity-gate flags.";

function cannedPayload(t0: number): COADiffResponse {
  return {
    engine: "coa-diff-canned-fallback",
    compute_ms: Math.round(performance.now() - t0),
    scenario: CANNED_SCENARIO,
    permitted: CANNED_PERMITTED,
    blocked: CANNED_BLOCKED,
    swap_point: VINH_SWAP_POINTS.V14_LANGGRAPH.swap_point,
  };
}

async function fetchRealBackend(t0: number): Promise<COADiffResponse | null> {
  const base = getVinhBackendBaseUrl();
  if (base === null) return null;
  try {
    const upstream = await fetch(`${base}/api/judges/coa-diff`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!upstream.ok) {
      console.warn(`[apex/judges/coa-diff] upstream ${upstream.status} ${upstream.statusText}`);
      return null;
    }
    const body = (await upstream.json()) as COADiffResponse;
    return {
      ...body,
      engine: "coa-diff-real",
      compute_ms: Math.round(performance.now() - t0),
    };
  } catch (err) {
    console.error("[apex/judges/coa-diff] real-backend fetch failed", err);
    return null;
  }
}

export async function GET(_req: NextRequest): Promise<Response> {
  const t0 = performance.now();
  try {
    let payload = cannedPayload(t0);
    if (shouldUseRealBackend("USE_REAL_BACKEND_V14")) {
      const real = await fetchRealBackend(t0);
      if (real !== null) payload = real;
    }
    return Response.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Orchestration-Swap-Point": VINH_SWAP_POINTS.V14_LANGGRAPH.header,
        "X-Apex-Coa-Diff-Engine": payload.engine,
      },
    });
  } catch (err) {
    console.error("[apex/judges/coa-diff]", err);
    const fallback: COADiffResponse = {
      engine: "coa-diff-canned-fallback",
      compute_ms: Math.round(performance.now() - t0),
      scenario: "error",
      permitted: CANNED_PERMITTED,
      blocked: CANNED_BLOCKED,
      swap_point: `Vinh M3-V14 swap-in error: ${err instanceof Error ? err.message : String(err)}`,
    };
    return Response.json(fallback, {
      status: 502,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Orchestration-Swap-Point": VINH_SWAP_POINTS.V14_LANGGRAPH.header,
        "X-Apex-Error": "1",
      },
    });
  }
}
