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

// Wave-47 review HIGH #4 close (silent-failure-hunter + Codex HIGH #1):
// mirror Vinh's backend 8 KiB-per-line cap at the frontend boundary so
// oversize payloads return a typed 413 from this route instead of a
// generic Vercel 502 after exhausting Next.js body limit. Pre-route
// validation is the right place: Vercel runtime memory + log size + the
// helper's fetch body are all bounded at this stage.
const MAX_AUDIT_LOG_BYTES = 8 * 1024;

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
  // Wave-47 review HIGH #4 close: Content-Length pre-check before json
  // parse so a 50 MB nested object cannot exhaust route memory.
  const contentLength = req.headers.get("content-length");
  if (contentLength !== null) {
    const declared = Number(contentLength);
    if (Number.isFinite(declared) && declared > MAX_AUDIT_LOG_BYTES) {
      return Response.json(
        {
          error: "payload_too_large",
          message: `Audit-log entry exceeds ${MAX_AUDIT_LOG_BYTES} byte cap (declared ${declared}). Matches Vinh backend 8 KiB-per-line cap.`,
        },
        { status: 413 },
      );
    }
  }
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
  // Wave-47 review HIGH #4 close (continued): post-parse byte cap for
  // clients that omit Content-Length header (some chunked uploaders).
  const serializedBytes = new TextEncoder().encode(JSON.stringify(body)).length;
  if (serializedBytes > MAX_AUDIT_LOG_BYTES) {
    return Response.json(
      {
        error: "payload_too_large",
        message: `Audit-log entry serialized to ${serializedBytes} bytes; cap is ${MAX_AUDIT_LOG_BYTES}.`,
      },
      { status: 413 },
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
