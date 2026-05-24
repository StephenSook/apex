/**
 * POST /api/watson-tts
 *
 * Server-side Next.js API route consumed by the wave-42 WatsonTtsRadio
 * client surface. Synthesizes coaching-report narration via Watson Text
 * to Speech REST + applies the FFmpeg paddock-radio filter chain
 * (highpass=350 + lowpass=3000 + compand + volume=1.8) for the
 * "race engineer over walkie-talkie" acoustic profile.
 *
 * Wave-43 Lane E2.1 close-out per the wave-43 plan: backend production
 * path replacing the Web Speech API browser-fallback that wave-42
 * already shipped. Client-side WatsonTtsRadio.tsx HEAD-probes the
 * cache URL first + invokes this POST when no cached file exists for
 * the audit_id.
 *
 * Hook contract (wave-43 Lane E2.2 WatsonTtsRadio production-path
 * activation):
 *   - Request body: `{ "audit_id": string, "text": string }`
 *   - Response 200: `{ "url": string, "cached": boolean }` with the
 *     public /generated-audio/{audit_id}.mp3 URL
 *   - Response 400: missing env vars; client falls back to Web Speech
 *     API per the wave-42 WatsonTtsRadio fallback path
 *   - Response 502: Watson REST or FFmpeg pipeline failure; client
 *     falls back to Web Speech API
 *
 * Implementation notes:
 *   - child_process.spawn for FFmpeg (NO fluent-ffmpeg SDK to avoid
 *     Node-22 simdjson dyld bug per project memory + per the global
 *     three-brain stack runtime hygiene rule)
 *   - Watson REST via plain fetch (NO @ibm-cloud/watson-developer-cloud
 *     SDK for the same reason)
 *   - Cache key = audit_id; filesystem-write atomicity via rename-after
 *     -tempfile pattern so concurrent requests for the same audit_id
 *     do not race-write a partial MP3
 *   - Content-Type validation on Watson response (must be audio/mp3)
 *     + non-empty body length check before FFmpeg invoke
 *
 * Required environment variables:
 *   - WATSON_TTS_API_KEY: IBM Cloud Watson Text to Speech API key
 *   - WATSON_TTS_URL: regional service URL
 *     (e.g. https://api.us-south.text-to-speech.watson.cloud.ibm.com)
 *   - WATSON_TTS_VOICE: optional voice ID (defaults to en-US_HenryV3Voice)
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { NextResponse } from "next/server";

// Node.js runtime required for child_process.spawn + fs/promises.
export const runtime = "nodejs";

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

const CACHE_DIR = join(process.cwd(), "public", "generated-audio");
const DEFAULT_VOICE = "en-US_HenryV3Voice";

/**
 * Resolve cache path for a given audit_id. Atomic-write contract:
 * write to a per-request unique tempfile then rename to
 * {audit_id}.mp3 so HEAD probes never see a half-written file.
 *
 * Wave-43 cascade-#13 F2 HIGH#2 close-out per codex adversarial:
 * the prior shape used `{audit_id}.mp3.tmp` shared across concurrent
 * requests for the same audit_id, so two POSTs interleaving
 * writeFile + rename could ENOENT the loser OR cross-corrupt the
 * final MP3. Per-request unique suffix (PID + timestamp + random)
 * makes each tempfile distinct; both renames target the same final
 * path (POSIX-atomic; identical input + identical FFmpeg pipeline =
 * identical output bytes; overwrite is a no-op semantically).
 */
function cachePaths(auditId: string): { final: string; temp: string } {
  const uniqueSuffix = `${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 10)}`;
  return {
    final: join(CACHE_DIR, `${auditId}.mp3`),
    temp: join(CACHE_DIR, `${auditId}.${uniqueSuffix}.mp3.tmp`),
  };
}

function publicUrl(auditId: string): string {
  return `/generated-audio/${auditId}.mp3`;
}

interface FFmpegFilterResult {
  readonly bytes: Buffer;
  readonly error: string | null;
}

/**
 * Run FFmpeg with the paddock-radio filter chain on the input MP3
 * buffer + return the filtered MP3 buffer. -i pipe:0 reads stdin;
 * pipe:1 writes stdout. Stderr captured for error reporting on
 * non-zero exit.
 */
async function applyPaddockRadioFilter(input: Buffer): Promise<FFmpegFilterResult> {
  return new Promise((resolve) => {
    const proc = spawn("ffmpeg", [
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

    proc.on("error", (err) => {
      resolve({ bytes: Buffer.alloc(0), error: `ffmpeg spawn failed: ${err.message}` });
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        const stderr = Buffer.concat(stderrChunks).toString("utf-8").slice(0, 500);
        resolve({ bytes: Buffer.alloc(0), error: `ffmpeg exit ${code}: ${stderr}` });
        return;
      }
      resolve({ bytes: Buffer.concat(chunks), error: null });
    });

    proc.stdin.on("error", (err) => {
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

  const { audit_id: auditId, text } = body;
  const { final: finalPath, temp: tempPath } = cachePaths(auditId);

  if (existsSync(finalPath)) {
    return NextResponse.json({ url: publicUrl(auditId), cached: true }, { status: 200 });
  }

  await mkdir(CACHE_DIR, { recursive: true });

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
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `apex.watson-tts: fetch failed: ${message}` },
      { status: 502 },
    );
  }

  if (!watsonResponse.ok) {
    const errorBody = await watsonResponse.text().catch(() => "<no body>");
    return NextResponse.json(
      {
        error: `apex.watson-tts: Watson ${watsonResponse.status} ${watsonResponse.statusText}; body=${errorBody.slice(0, 500)}`,
      },
      { status: 502 },
    );
  }

  const contentType = watsonResponse.headers.get("Content-Type") ?? "";
  if (!contentType.includes("audio/mp3") && !contentType.includes("audio/mpeg")) {
    return NextResponse.json(
      { error: `apex.watson-tts: unexpected Content-Type from Watson: ${contentType}` },
      { status: 502 },
    );
  }

  const arrayBuffer = await watsonResponse.arrayBuffer();
  const rawAudio = Buffer.from(arrayBuffer);
  if (rawAudio.length === 0) {
    return NextResponse.json(
      { error: "apex.watson-tts: Watson returned empty body." },
      { status: 502 },
    );
  }

  const filtered = await applyPaddockRadioFilter(rawAudio);
  if (filtered.error !== null) {
    return NextResponse.json(
      { error: `apex.watson-tts: ${filtered.error}` },
      { status: 502 },
    );
  }

  try {
    await writeFile(tempPath, filtered.bytes);
    await rename(tempPath, finalPath);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `apex.watson-tts: cache write failed: ${message}` },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: publicUrl(auditId), cached: false }, { status: 200 });
}
