/**
 * Wave-47 cascade-#53 NEW route. Frontend wrapper for Vinh's Phase 4.M3a
 * POSIX-flock-backed JSONL audit log per docs/vinh-backend-verify-wave-47.md.
 * Vinh server at POST /api/audit-log accepts any dict body + 413 on
 * oversize + 400 on non-object; here we forward via the runWireFlipPOST
 * helper so the canned-vs-real-backend swap is uniform with the rest of
 * the wave-46 wire-flip family.
 *
 * Request body: any JSON object (Guardian audit entries, COA-diff
 * traces, RAG retrievals etc).
 *
 * Canned-fallback shape: `{persisted: false, line_index: -1, file_path: ""}`
 * + engine "audit-log-canned-fallback". When env flag set + base URL set,
 * helper forwards to upstream + flips engine to "audit-log-v4-real".
 */

import type { NextRequest } from "next/server";

import { runWireFlipPOST } from "../../../lib/wire-flip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AuditLogResponse {
  readonly engine: string;
  readonly compute_ms: number;
  readonly persisted: boolean;
  readonly line_index: number;
  readonly file_path: string;
  readonly swap_point: string;
}

const AUDIT_LOG_SWAP_POINT =
  "app/backend/apex/orchestration/audit_log.py (Vinh Phase 4.M3a; flock-backed JSONL + 8 KiB per-line cap + daily gzip rotation)";

export async function POST(req: NextRequest): Promise<Response> {
  const t0 = performance.now();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: "invalid_json", message: "Expected JSON object body for audit-log entry." },
      { status: 400 },
    );
  }
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return Response.json(
      { error: "invalid_body", message: "Expected JSON object (not array, not null)." },
      { status: 400 },
    );
  }

  const cannedPayload: AuditLogResponse = {
    engine: "audit-log-canned-fallback",
    compute_ms: Math.round(performance.now() - t0),
    persisted: false,
    line_index: -1,
    file_path: "",
    swap_point: AUDIT_LOG_SWAP_POINT,
  };

  const payload = await runWireFlipPOST<unknown, AuditLogResponse>({
    flag: "USE_REAL_AUDIT_LOG",
    upstreamPath: "/api/audit-log",
    routeId: "audit-log",
    t0,
    body,
    cannedPayload,
    realEngineLabel: "audit-log-v4-real",
  });

  return Response.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "X-Apex-Audit-Log-Engine": payload.engine,
    },
  });
}
