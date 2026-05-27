/**
 * Wave-47 cascade-#53 NEW route. Frontend wrapper for Vinh's Phase 4.M3b
 * POST /api/what-if-replay per docs/vinh-backend-verify-wave-47.md.
 * Byte-deterministic V2 cvxpylayers re-projection against a baseline
 * fixture + mutation key. Vinh ships BASELINE_FIXTURES catalogue
 * (C14-04-jerk-bound) + MUTATIONS catalogue (MUTATION_COA_OVERLAP_INVERT).
 * Singleton CvxpyLayersProjector reused per spec L130-138 ensures
 * counterfactual determinism with /api/forecast.
 *
 * Request body: { "baseline_fixture_id": string, "mutation_key": string }
 *
 * Canned-fallback shape mirrors Vinh's response so the UI panel
 * renders identically regardless of which path served.
 */

import type { NextRequest } from "next/server";

import { runWireFlipPOST } from "../../../lib/wire-flip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WhatIfReplayBody {
  readonly baseline_fixture_id?: unknown;
  readonly mutation_key?: unknown;
}

interface WhatIfReplayResponse {
  readonly engine: string;
  readonly compute_ms: number;
  readonly mutated_fixture: Record<string, unknown>;
  readonly replayed_violation_log: {
    readonly engine: "v2_cvxpylayers";
    readonly schema_version: string;
    readonly entries: ReadonlyArray<unknown>;
  };
  readonly schema_version: string;
  readonly protocol_version: string;
  readonly swap_point: string;
}

const WHAT_IF_SWAP_POINT =
  "app/backend/apex/orchestration/what_if_replay.py (Vinh Phase 4.M3b; singleton CvxpyLayersProjector + BASELINE_FIXTURES + MUTATIONS registries)";

function buildCannedPayload(
  baselineId: string,
  mutationKey: string,
  t0: number,
): WhatIfReplayResponse {
  return {
    engine: "what-if-replay-canned-fallback",
    compute_ms: Math.round(performance.now() - t0),
    mutated_fixture: {
      baseline_fixture_id: baselineId,
      mutation_key: mutationKey,
      synthesised: "canned-mutation-stub for wave-47 frontend wire-flip",
    },
    replayed_violation_log: {
      engine: "v2_cvxpylayers",
      schema_version: "1.0.0",
      entries: [],
    },
    schema_version: "1.0.0",
    protocol_version: "what-if-replay-2026-05",
    swap_point: WHAT_IF_SWAP_POINT,
  };
}

export async function POST(req: NextRequest): Promise<Response> {
  const t0 = performance.now();
  let body: WhatIfReplayBody;
  try {
    body = (await req.json()) as WhatIfReplayBody;
  } catch {
    return Response.json(
      {
        error: "invalid_json",
        message: "Expected JSON body { baseline_fixture_id: string, mutation_key: string }.",
      },
      { status: 400 },
    );
  }
  const baselineId = typeof body.baseline_fixture_id === "string" ? body.baseline_fixture_id : "";
  const mutationKey = typeof body.mutation_key === "string" ? body.mutation_key : "";
  if (baselineId.length === 0 || mutationKey.length === 0) {
    return Response.json(
      {
        error: "missing_field",
        message: "Both baseline_fixture_id + mutation_key are required non-empty strings.",
      },
      { status: 400 },
    );
  }

  const cannedPayload = buildCannedPayload(baselineId, mutationKey, t0);
  const payload = await runWireFlipPOST<
    { baseline_fixture_id: string; mutation_key: string },
    WhatIfReplayResponse
  >({
    flag: "USE_REAL_WHAT_IF_REPLAY",
    upstreamPath: "/api/what-if-replay",
    routeId: "what-if-replay",
    t0,
    body: { baseline_fixture_id: baselineId, mutation_key: mutationKey },
    cannedPayload,
    realEngineLabel: "what-if-replay-v4-real",
  });

  return Response.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "X-Apex-What-If-Replay-Engine": payload.engine,
    },
  });
}
