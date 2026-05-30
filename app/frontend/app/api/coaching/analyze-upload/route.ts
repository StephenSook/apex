/**
 * POST /api/coaching/analyze-upload
 *
 * Wave-74: server-side proxy that forwards the driver's ACTUAL uploaded files
 * (telemetry CSV + COA PDF/JSON + optional debrief) to the deployed APEX
 * backend's /api/analyze-upload, which runs the full real pipeline (real
 * physics projection + Granite Guardian audit + Granite coaching) and, for a
 * PDF COA, the wave-74 Granite-Docling bridge. Returns the strict-decoded
 * CoachingReport stamped narrative_source "backend-live".
 *
 * Why a proxy: the browser cannot POST multipart to the HF Space cross-origin
 * without CORS, so the forward happens here on the Node runtime.
 *
 * Activation: the /analyze client only calls this when
 * NEXT_PUBLIC_USE_REAL_ANALYZE_UPLOAD === "1" (OFF by default). Until the
 * backend Docling bridge is deployed + verified, a PDF COA returns 415/422 and
 * this route returns { ok: false } -> the client degrades honestly to the
 * fixture + live-narrative path. So this is dormant + zero-risk in production
 * until deliberately enabled.
 */

import { decodeCoachingReport } from "../../../../lib/decode-coaching-report";

export const runtime = "nodejs";

const DEFAULT_BACKEND = "https://ssookra-apex-backend.hf.space";
// PDF parse + Granite extraction + the LangGraph pipeline; HF free tier can
// cold-start, so allow headroom but stay bounded.
const TIMEOUT_MS = 30_000;

function backendBaseUrl(): string {
  const env =
    process.env.VINH_BACKEND_BASE_URL ?? process.env.NEXT_PUBLIC_VINH_BACKEND_BASE_URL;
  const base = env !== undefined && env.trim() !== "" ? env.trim() : DEFAULT_BACKEND;
  return base.replace(/\/$/, "");
}

function jsonResponse(payload: unknown, phase: string): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Apex-Analyze-Upload-Phase": phase,
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonResponse({ ok: false, source: "bad-request" }, "bad-request");
  }

  const telemetry = form.get("telemetry");
  const coa = form.get("coa");
  const debrief = form.get("debrief");
  if (!(telemetry instanceof File) || !(coa instanceof File)) {
    return jsonResponse({ ok: false, source: "bad-request" }, "bad-request");
  }

  const forward = new FormData();
  forward.append("telemetry", telemetry, telemetry.name);
  forward.append("coa", coa, coa.name);
  if (debrief instanceof File) forward.append("debrief", debrief, debrief.name);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const onAbort = () => controller.abort();
  request.signal.addEventListener("abort", onAbort, { once: true });
  try {
    const res = await fetch(`${backendBaseUrl()}/api/analyze-upload`, {
      method: "POST",
      body: forward,
      signal: controller.signal,
    });
    if (!res.ok) {
      // 415 (PDF not yet accepted, pre-bridge-deploy), 422 (COA gate
      // undetermined), 5xx -> degrade honestly. 422 carries the backend's
      // "upload a structured COA" message for the client to surface if it
      // wants; the client otherwise falls back to the fixture path.
      console.warn(`apex.analyze-upload: backend HTTP ${res.status}; client degrades to fixture`);
      return jsonResponse({ ok: false, source: "backend-error", status: res.status }, `backend-${res.status}`);
    }
    const body = (await res.json()) as { coaching_report?: unknown };
    const report = decodeCoachingReport(body.coaching_report);
    if (report === null) {
      console.error("apex.analyze-upload: backend coaching_report failed strict decode; client degrades to fixture");
      return jsonResponse({ ok: false, source: "decode-error" }, "decode-error");
    }
    return jsonResponse({ ok: true, source: "backend-live", report }, "real");
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    (isAbort ? console.warn : console.error)(
      "apex.analyze-upload: live backend upload failed; client degrades to fixture",
      { message: err instanceof Error ? err.message : String(err) },
    );
    return jsonResponse({ ok: false, source: "upstream-error" }, "upstream-error");
  } finally {
    clearTimeout(timeout);
    request.signal.removeEventListener("abort", onAbort);
  }
}
