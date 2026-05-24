/**
 * POST /api/watson-tts
 *
 * Server-side synthesis of coaching-report narration via IBM Watson Text
 * to Speech REST + paddock-radio FFmpeg filter chain (highpass=350 +
 * lowpass=3000 + compand + volume=1.8) for the walkie-talkie acoustic
 * profile.
 *
 * Wave-43 cascade-#15 F2-round-2 + galaxy-ambition rework (Stephen
 * explicit mandate 2026-05-24): full Vercel-compatible streaming
 * response. Drops the prior public/generated-audio cache approach
 * (Vercel readonly FS) + uses ffmpeg-static bundled binary path so the
 * production path runs identically on Vercel + self-hosted environments.
 * Client receives MP3 bytes inline as audio/mpeg body; creates blob
 * URL + plays. No filesystem cache; each request synthesizes fresh
 * (Watson + FFmpeg roundtrip ~1-3s on Vercel iad1 region with warm
 * function instance per Fluid Compute).
 *
 * Hook contract (wave-43 Lane E2.2 WatsonTtsRadio production-path):
 *   - Request body: `{ "audit_id": string, "text": string }`
 *   - Response 200: `audio/mpeg` MP3 bytes
 *   - Response 400: missing env vars OR malformed body OR validation
 *   - Response 502: Watson REST or FFmpeg pipeline failure
 *
 * Implementation notes:
 *   - ffmpeg-static @5.3.0 provides bundled binary at `require('ffmpeg-static')`
 *   - child_process.spawn pipes Watson MP3 in -> FFmpeg filter -> MP3 out
 *   - Per-request unique Watson signal threading: req.signal abort kills
 *     both Watson fetch + FFmpeg child process so consumer disconnect
 *     does not leak quota / processes
 *   - No filesystem writes (Vercel /tmp would work but blob streaming
 *     is simpler + lower-latency + cache-less)
 *
 * Required environment variables:
 *   - WATSON_TTS_API_KEY: IBM Cloud Watson Text to Speech API key
 *   - WATSON_TTS_URL: regional service URL (e.g.
 *     https://api.us-south.text-to-speech.watson.cloud.ibm.com)
 *   - WATSON_TTS_VOICE: optional voice ID (defaults to en-US_HenryV3Voice)
 *
 * When env vars are missing OR Watson/FFmpeg fails, client falls back
 * to Web Speech API per wave-42 WatsonTtsRadio fallback path.
 */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";

import { NextResponse } from "next/server";

// Node.js runtime required for child_process.spawn + ffmpeg-static binary.
export const runtime = "nodejs";
// 60s budget covers Watson REST (~1-2s) + FFmpeg (~1s) + buffer for cold start.
export const maxDuration = 60;

// Wave-43 cascade-#15 F2-round-2: ffmpeg-static binary path resolved at
// module-load via createRequire so the bundled binary is available
// across Vercel + self-hosted environments without PATH dependency.
const require = createRequire(import.meta.url);
const FFMPEG_BIN_PATH: string = require("ffmpeg-static");

interface WatsonTtsRequestBody {
  readonly audit_id?: unknown;
  readonly text?: unknown;
}

function isValidRequest(
  body: WatsonTtsRequestBody,
): body is { readonly audit_id: string; readonly text: string } {
  return (
    typeof body.audit_id === "string"
    && body.audit_id.trim().length > 0
    && /^[a-zA-Z0-9_-]{1,64}$/.test(body.audit_id)
    && typeof body.text === "string"
    && body.text.trim().length > 0
    && body.text.length < 8_000
  );
}

const DEFAULT_VOICE = "en-US_HenryV3Voice";

interface FFmpegFilterResult {
  readonly bytes: Buffer;
  readonly error: string | null;
}

/**
 * Pipe input MP3 buffer through ffmpeg-static binary with paddock-radio
 * filter chain. Returns filtered MP3 buffer OR error message.
 *
 * Wire consumer signal so abort kills the FFmpeg child + frees Vercel
 * function CPU instead of running to completion against a dead client.
 */
async function applyPaddockRadioFilter(
  input: Buffer,
  signal?: AbortSignal,
): Promise<FFmpegFilterResult> {
  return new Promise((resolve) => {
    const proc = spawn(FFMPEG_BIN_PATH, [
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      "pipe:0",
      "-af",
      "highpass=f=350,lowpass=f=3000,compand=attacks=0:points=-80/-80|-40/-20|-20/-10|0/-7:gain=2,volume=1.8",
      "-f",
      "mp3",
      "-acodec",
      "libmp3lame",
      "-b:a",
      "96k",
      "pipe:1",
    ], { stdio: ["pipe", "pipe", "pipe"] });

    const chunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    proc.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
    proc.stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));

    const onAbort = () => proc.kill("SIGTERM");
    if (signal !== undefined) {
      if (signal.aborted) onAbort();
      else signal.addEventListener("abort", onAbort, { once: true });
    }

    proc.on("error", (err) => {
      if (signal !== undefined) signal.removeEventListener("abort", onAbort);
      resolve({ bytes: Buffer.alloc(0), error: `ffmpeg spawn failed: ${err.message}` });
    });

    proc.on("close", (code) => {
      if (signal !== undefined) signal.removeEventListener("abort", onAbort);
      if (code !== 0) {
        const stderr = Buffer.concat(stderrChunks).toString("utf-8").slice(0, 500);
        resolve({ bytes: Buffer.alloc(0), error: `ffmpeg exit ${code}: ${stderr}` });
        return;
      }
      resolve({ bytes: Buffer.concat(chunks), error: null });
    });

    proc.stdin.on("error", (err) => {
      if (signal !== undefined) signal.removeEventListener("abort", onAbort);
      resolve({ bytes: Buffer.alloc(0), error: `ffmpeg stdin failed: ${err.message}` });
    });
    proc.stdin.write(input);
    proc.stdin.end();
  });
}

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.WATSON_TTS_API_KEY;
  const watsonUrl = process.env.WATSON_TTS_URL;
  const voice = process.env.WATSON_TTS_VOICE ?? DEFAULT_VOICE;

  if (apiKey === undefined || watsonUrl === undefined) {
    console.warn("apex.watson-tts: WATSON_TTS_API_KEY or WATSON_TTS_URL missing; client falls back to Web Speech API.");
    return NextResponse.json(
      {
        error: "apex.watson-tts: WATSON_TTS_API_KEY + WATSON_TTS_URL missing; client falls back to Web Speech API.",
      },
      { status: 400 },
    );
  }

  let body: WatsonTtsRequestBody;
  try {
    body = (await req.json()) as WatsonTtsRequestBody;
  } catch {
    return NextResponse.json(
      { error: "apex.watson-tts: malformed JSON body." },
      { status: 400 },
    );
  }

  if (!isValidRequest(body)) {
    return NextResponse.json(
      { error: "apex.watson-tts: audit_id must be [a-zA-Z0-9_-]{1,64}; text non-empty + <8000 chars." },
      { status: 400 },
    );
  }

  const { text } = body;

  const watsonAuth = `Basic ${Buffer.from(`apikey:${apiKey}`).toString("base64")}`;
  const watsonEndpoint = `${watsonUrl.replace(/\/$/, "")}/v1/synthesize?voice=${encodeURIComponent(voice)}`;

  let watsonResponse: Response;
  try {
    watsonResponse = await fetch(watsonEndpoint, {
      method: "POST",
      headers: {
        Authorization: watsonAuth,
        "Content-Type": "application/json",
        Accept: "audio/mp3",
      },
      body: JSON.stringify({ text }),
      signal: req.signal,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("apex.watson-tts: Watson REST fetch failed.", { message });
    return NextResponse.json(
      { error: `apex.watson-tts: fetch failed: ${message}` },
      { status: 502 },
    );
  }

  if (!watsonResponse.ok) {
    const errorBody = await watsonResponse.text().catch(() => "<no body>");
    console.error("apex.watson-tts: Watson upstream non-ok.", {
      status: watsonResponse.status,
      body: errorBody.slice(0, 500),
    });
    return NextResponse.json(
      {
        error: `apex.watson-tts: Watson ${watsonResponse.status} ${watsonResponse.statusText}; body=${errorBody.slice(0, 500)}`,
      },
      { status: 502 },
    );
  }

  const contentType = watsonResponse.headers.get("Content-Type") ?? "";
  if (!contentType.includes("audio/mp3") && !contentType.includes("audio/mpeg")) {
    console.error("apex.watson-tts: unexpected Watson Content-Type.", { contentType });
    return NextResponse.json(
      { error: `apex.watson-tts: unexpected Content-Type from Watson: ${contentType}` },
      { status: 502 },
    );
  }

  const arrayBuffer = await watsonResponse.arrayBuffer();
  const rawAudio = Buffer.from(arrayBuffer);
  if (rawAudio.length === 0) {
    console.error("apex.watson-tts: Watson returned empty body.");
    return NextResponse.json(
      { error: "apex.watson-tts: Watson returned empty body." },
      { status: 502 },
    );
  }

  const filtered = await applyPaddockRadioFilter(rawAudio, req.signal);
  if (filtered.error !== null) {
    console.error("apex.watson-tts: FFmpeg pipeline failed.", { error: filtered.error });
    return NextResponse.json(
      { error: `apex.watson-tts: ${filtered.error}` },
      { status: 502 },
    );
  }

  // Cast Buffer to Uint8Array for Response BodyInit compatibility (TS
  // narrows Buffer to ArrayBufferLike but Response.BodyInit accepts
  // ArrayBuffer-backed views; Uint8Array view wraps the same memory).
  return new Response(new Uint8Array(filtered.bytes), {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(filtered.bytes.length),
      "Cache-Control": "no-store",
    },
  });
}
