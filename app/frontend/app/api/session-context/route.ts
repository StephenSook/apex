/**
 * Wave-47 cascade-#53 NEW route. Frontend wrapper for Vinh's Phase 4.M3c
 * GET /api/session-context per docs/vinh-backend-verify-wave-47.md.
 * 30s TTL cache + lap-completion invalidation + 4 mock tiles
 * (session_phase + track_temp + weather + tire_state) emitted with
 * TileSeverity literal "ok" | "monitor" | "critical".
 *
 * Canned-fallback shape mirrors Vinh's response so the UI panel
 * renders identically regardless of which path served.
 */

import { runWireFlipGET } from "../../../lib/wire-flip";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface SessionContextTile {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly severity: "ok" | "monitor" | "critical";
}

interface SessionContextResponse {
  readonly engine: string;
  readonly compute_ms: number;
  readonly tiles: ReadonlyArray<SessionContextTile>;
  readonly fetched_at_iso: string;
  readonly swap_point: string;
}

const SESSION_CONTEXT_SWAP_POINT =
  "app/backend/apex/orchestration/session_context.py (Vinh Phase 4.M3c; 30s TTL cache + lap-completion invalidation + monotonic-iso tiebreaker)";

const CANNED_TILES: ReadonlyArray<SessionContextTile> = [
  {
    key: "session_phase",
    label: "Session phase",
    value: "Free practice 2",
    detail: "27 minutes elapsed of 60",
    severity: "ok",
  },
  {
    key: "track_temp",
    label: "Track temperature",
    value: "31.4 C",
    detail: "Trending plus 0.3 per 10 minutes",
    severity: "monitor",
  },
  {
    key: "weather",
    label: "Weather",
    value: "Overcast 67 percent",
    detail: "Cloud base 1200 metres",
    severity: "ok",
  },
  {
    key: "tire_state",
    label: "Tire state",
    value: "Medium compound",
    detail: "Lap 8 of stint estimated 12-lap window",
    severity: "ok",
  },
];

export async function GET(): Promise<Response> {
  const t0 = performance.now();
  const cannedPayload: SessionContextResponse = {
    engine: "session-context-canned-fallback",
    compute_ms: Math.round(performance.now() - t0),
    tiles: CANNED_TILES,
    fetched_at_iso: new Date().toISOString(),
    swap_point: SESSION_CONTEXT_SWAP_POINT,
  };

  const payload = await runWireFlipGET<SessionContextResponse>({
    flag: "USE_REAL_SESSION_CONTEXT",
    upstreamPath: "/api/session-context",
    routeId: "session-context",
    t0,
    cannedPayload,
    realEngineLabel: "session-context-v4-real",
  });

  return Response.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "X-Apex-Session-Context-Engine": payload.engine,
    },
  });
}
