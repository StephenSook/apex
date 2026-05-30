/**
 * POST /api/coaching/analyze-demo
 *
 * Wave-69: runs the CANONICAL Sarah Reynolds demo through the deployed
 * APEX FastAPI backend's real LangGraph pipeline and returns the decoded
 * `CoachingReport` (real physics projection + Granite Guardian audit +
 * Granite coaching), stamped `narrative_source: "backend-live"`.
 *
 * Why a server-side proxy: (1) the browser cannot call the HF Space
 * cross-origin without CORS, so the fetch happens here on the Node
 * runtime; (2) the backend's `/api/analyze` takes server-local fixture
 * PATHS (the canonical Sarah telemetry + COA ship inside the backend
 * image), so the demo needs no upload and sidesteps the COA PDF-vs-JSON
 * contract gap that blocks arbitrary user uploads.
 *
 * The backend base URL defaults to the known deployed Space so the demo
 * works WITHOUT requiring the NEXT_PUBLIC_VINH_BACKEND_BASE_URL Vercel
 * flag to be set; if that env IS set it takes precedence.
 *
 * Honest degrade: on any failure (backend down, timeout, shape mismatch
 * at the strict decoder) the route returns `{ ok: false }` and the client
 * falls back to the illustrative fixture report. The strict decoder means
 * a backend contract drift can never render a malformed report.
 */

import { decodeCoachingReport } from "../../../../lib/decode-coaching-report";

export const runtime = "nodejs";

const DEFAULT_BACKEND = "https://ssookra-apex-backend.hf.space";
// Canonical Sarah Reynolds fixtures shipped inside the backend image.
const SARAH_TELEMETRY = "fixtures/personas/sarah-reynolds-telemetry.csv";
const SARAH_COA = "fixtures/personas/sarah-reynolds-coa-stub.json";
// HF Spaces free tier can cold-start; give it a generous-but-bounded budget.
const TIMEOUT_MS = 25_000;

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
      "X-Apex-Analyze-Demo-Phase": phase,
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  // Chain the consumer signal so a client disconnect aborts the backend call.
  const onAbort = () => controller.abort();
  request.signal.addEventListener("abort", onAbort, { once: true });
  try {
    const res = await fetch(`${backendBaseUrl()}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telemetry_csv_path: SARAH_TELEMETRY,
        coa_json_path: SARAH_COA,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(`apex.analyze-demo: backend returned HTTP ${res.status}; client degrades to fixture`);
      return jsonResponse({ ok: false, source: "backend-error" }, "backend-error");
    }
    const body = (await res.json()) as { coaching_report?: unknown };
    const report = decodeCoachingReport(body.coaching_report);
    if (report === null) {
      console.error("apex.analyze-demo: backend coaching_report failed strict decode; client degrades to fixture");
      return jsonResponse({ ok: false, source: "decode-error" }, "decode-error");
    }
    return jsonResponse({ ok: true, source: "backend-live", report }, "real");
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    (isAbort ? console.warn : console.error)(
      "apex.analyze-demo: live backend call failed; client degrades to fixture",
      { message: err instanceof Error ? err.message : String(err) },
    );
    return jsonResponse({ ok: false, source: "upstream-error" }, "upstream-error");
  } finally {
    clearTimeout(timeout);
    request.signal.removeEventListener("abort", onAbort);
  }
}
