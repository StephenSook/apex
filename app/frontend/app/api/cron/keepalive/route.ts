/**
 * GET /api/cron/keepalive
 *
 * Wave-77: Vercel Cron keep-alive for the HF Space backend. The free-tier
 * Space sleeps after 48h of inactivity; a judge hitting the canonical-demo
 * or upload path cold then gets a slow cold-start (or the frontend's
 * timeout-fallback to the fixture). This route, triggered by the Vercel cron
 * in vercel.json every 6h, pings the backend /healthz (resets the sleep
 * timer, keeps the container + LangGraph pipeline warm) so the live-backend
 * surfaces respond fast + real for judges throughout the judging window.
 *
 * Auth: if CRON_SECRET is set, require Vercel's `Authorization: Bearer
 * <CRON_SECRET>` header; otherwise run open (the route only pings a public
 * health endpoint, so there is no abuse surface).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_BACKEND = "https://ssookra-apex-backend.hf.space";
const PING_TIMEOUT_MS = 20_000;

function backendBaseUrl(): string {
  const env =
    process.env.VINH_BACKEND_BASE_URL ?? process.env.NEXT_PUBLIC_VINH_BACKEND_BASE_URL;
  const base = env !== undefined && env.trim() !== "" ? env.trim() : DEFAULT_BACKEND;
  return base.replace(/\/$/, "");
}

async function pingOk(url: string): Promise<string> {
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(PING_TIMEOUT_MS) });
    return res.ok ? "ok" : `http-${res.status}`;
  } catch (err) {
    return err instanceof Error ? err.name : "error";
  }
}

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (secret !== undefined && secret.trim() !== "") {
    if (request.headers.get("authorization") !== `Bearer ${secret}`) {
      return new Response("unauthorized", { status: 401 });
    }
  }

  const base = backendBaseUrl();
  const started = Date.now();
  // /healthz keeps the container alive; /api/orchestration warms the real
  // LangGraph pipeline so the first judge request is fast, not a cold compile.
  const healthz = await pingOk(`${base}/healthz`);
  const orchestration = healthz === "ok" ? await pingOk(`${base}/api/orchestration`) : "skipped";

  return new Response(
    JSON.stringify({ pinged: base, healthz, orchestration, ms: Date.now() - started }),
    {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    },
  );
}
