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

import type { STTResponse } from "../../../../shared/types";
import { getVinhBackendBaseUrl, shouldUseRealBackend } from "../../../lib/env";
import { VINH_SWAP_POINTS } from "../../../lib/vinh-swap-points";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const CANNED_TRANSCRIPT =
  "APEX coach. Brake earlier into turn three; you are carrying about six tenths too much speed into the apex. Trail-brake in two micro-presses on the secondary lever, then release as you pick up throttle on the primary control. Watch the inside kerb on exit so you keep the rear loaded through the cambered section.";

const CANNED_RESPONSE_TEMPLATE: Omit<STTResponse, "engine" | "compute_ms" | "swap_point"> = {
  transcript: CANNED_TRANSCRIPT,
  confidence: 0.94,
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

export async function POST(req: NextRequest): Promise<Response> {
  const t0 = performance.now();
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
      confidence: 0,
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
