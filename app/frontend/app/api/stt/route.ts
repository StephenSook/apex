/**
 * Wave-46 Phase 5.6 NEW route. Watson STT proxy + Granite Speech 4.1 2B-Plus
 * swap-point per D-058 + Vinh M3-V9. Vinh ships the real implementation at
 * `app/backend/apex/speech/stt_proxy.py` running Granite Speech 4.1 2B-Plus
 * on vLLM serve. Speaker-attributed ASR + word-level timestamps + multilingual
 * EN/FR/DE/ES/PT/JA per the HF model card 2026-04-28.
 *
 * HEAD canned path: returns a mock transcript so VoiceDebriefInput can wire-
 * flip the Web Speech API HEAD path to a real backend endpoint without an
 * actual MediaRecorder + audio capture refactor. Mock transcript mirrors a
 * driver-coach voice debrief moment ("APEX coach: brake earlier in turn 3...").
 *
 * Wave-46 D-058 Phase 5.6 wire-flip: when `NEXT_PUBLIC_USE_GRANITE_SPEECH` is
 * "1" + `NEXT_PUBLIC_VINH_BACKEND_BASE_URL` is set, forwards POST body
 * verbatim to `${base}/api/stt`. Returns upstream `STTResponse` payload with
 * engine = "stt-v9-real". Falls back to canned on any fetch failure.
 *
 * Request body: { audio?: string (base64 WAV/PCM), mime_type?: string }
 * Body may be empty for canned-fallback testing.
 */

import type { NextRequest } from "next/server";

import type { STTConfidence } from "../../../../shared/brands";
import type { STTResponse } from "../../../../shared/types";
import { getVinhBackendBaseUrl, shouldUseRealBackend } from "../../../lib/env";
import { VINH_SWAP_POINTS } from "../../../lib/vinh-swap-points";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const CANNED_TRANSCRIPT =
  "APEX coach. Brake earlier into turn three; you are carrying about six tenths too much speed into the apex. Trail-brake in two micro-presses on the secondary lever, then release as you pick up throttle on the primary control. Watch the inside kerb on exit so you keep the rear loaded through the cambered section.";

const CANNED_RESPONSE_TEMPLATE: Omit<STTResponse, "engine" | "compute_ms" | "swap_point"> = {
  transcript: CANNED_TRANSCRIPT,
  confidence: 0.94 as STTConfidence,
  language: "en-US",
  speakers: [
    {
      speaker: "race-engineer",
      start_s: 0.0,
      end_s: 9.4,
      text: CANNED_TRANSCRIPT,
    },
  ],
  word_timestamps: [
    { word: "APEX", start_s: 0.0, end_s: 0.4 },
    { word: "coach", start_s: 0.42, end_s: 0.78 },
    { word: "brake", start_s: 1.04, end_s: 1.36 },
    { word: "earlier", start_s: 1.4, end_s: 1.85 },
    { word: "turn", start_s: 2.08, end_s: 2.32 },
    { word: "three", start_s: 2.36, end_s: 2.74 },
  ],
};

function cannedPayload(t0: number): STTResponse {
  return {
    engine: "stt-v9-canned-fallback",
    compute_ms: Math.round(performance.now() - t0),
    ...CANNED_RESPONSE_TEMPLATE,
    swap_point: VINH_SWAP_POINTS.V9_WATSON_STT.swap_point,
  };
}

async function fetchRealBackend(req: NextRequest, t0: number): Promise<STTResponse | null> {
  const base = getVinhBackendBaseUrl();
  if (base === null) return null;
  try {
    const upstream = await fetch(`${base}/api/stt`, {
      method: "POST",
      headers: {
        "Content-Type": req.headers.get("content-type") ?? "application/json",
        Accept: "application/json",
      },
      body: await req.clone().text(),
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!upstream.ok) {
      console.warn(`[apex/stt] upstream ${upstream.status} ${upstream.statusText}`);
      return null;
    }
    const body = (await upstream.json()) as STTResponse;
    return {
      ...body,
      engine: "stt-v9-real",
      compute_ms: Math.round(performance.now() - t0),
    };
  } catch (err) {
    console.error("[apex/stt] real-backend forward failed", err);
    return null;
  }
}

const MAX_AUDIO_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest): Promise<Response> {
  const t0 = performance.now();
  // Wave-46 Phase 9.3 code-reviewer HIGH 3: cap request body size BEFORE
  // forwarding to the upstream Vinh backend OR reading into memory on the
  // edge runtime. Matches the 5 MB cap pattern in upload-telemetry/route.ts.
  // Wave-46.5 codex-rescue HIGH 1 note: header-only cap can be bypassed by
  // missing OR spoofed Content-Length. Defense in depth: (1) reject if the
  // declared Content-Length exceeds the cap, (2) reject if Content-Length
  // is present but not parseable to a non-negative integer, (3) rely on
  // Vercel Edge runtime's native 4.5 MB request-body cap as the absolute
  // floor when Content-Length is absent (Vercel enforces this below our
  // explicit 5 MB cap regardless of header presence; documented at
  // https://vercel.com/docs/functions/limitations). Production cannot
  // bypass both layers.
  const declared = req.headers.get("content-length");
  if (declared !== null) {
    const declaredBytes = Number.parseInt(declared, 10);
    if (Number.isNaN(declaredBytes) || declaredBytes < 0) {
      return Response.json(
        {
          error: "invalid_content_length",
          message: `STT POST Content-Length must be a non-negative integer; got "${declared}".`,
        },
        { status: 400 },
      );
    }
    if (declaredBytes > MAX_AUDIO_BYTES) {
      return Response.json(
        {
          error: "audio_too_large",
          message: `Audio body declared ${declaredBytes} bytes; cap is ${MAX_AUDIO_BYTES} bytes (5 MB).`,
        },
        { status: 413 },
      );
    }
  }
  try {
    let payload = cannedPayload(t0);
    if (shouldUseRealBackend("USE_GRANITE_SPEECH")) {
      const real = await fetchRealBackend(req, t0);
      if (real !== null) payload = real;
    }
    return Response.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Stt-Swap-Point": VINH_SWAP_POINTS.V9_WATSON_STT.header,
        "X-Apex-Stt-Engine": payload.engine,
      },
    });
  } catch (err) {
    console.error("[apex/stt]", err);
    const fallback: STTResponse = {
      engine: "stt-v9-canned-fallback",
      compute_ms: Math.round(performance.now() - t0),
      transcript: "",
      confidence: 0 as STTConfidence,
      language: "en-US",
      speakers: [],
      word_timestamps: [],
      swap_point: `Vinh M3-V9 swap-in error: ${err instanceof Error ? err.message : String(err)}`,
    };
    return Response.json(fallback, {
      status: 502,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Stt-Swap-Point": VINH_SWAP_POINTS.V9_WATSON_STT.header,
        "X-Apex-Error": "1",
      },
    });
  }
}
