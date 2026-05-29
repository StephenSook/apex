/**
 * wave-53 NEW route. Same-origin proxy to the apex-backend live observability
 * summary (GET `${NEXT_PUBLIC_VINH_BACKEND_BASE_URL}/api/observability/summary`).
 *
 * Adds an honest server-side fallback so the /judges ProductionObservability
 * panel never renders broken: when the backend base URL is unset or the
 * upstream is unreachable / not-OK, it returns the awaiting-backend snapshot
 * (engine = "observability-awaiting-backend") with a 200 so the client renders
 * the wiring-status state rather than an error. When the upstream responds OK,
 * the live snapshot is returned with engine = "observability-live".
 *
 * Consumed by app/frontend/components/ProductionObservabilityPanel.tsx.
 */

import type { NextRequest } from "next/server";

import { getVinhBackendBaseUrl } from "../../../../lib/env";
import {
  awaitingBackendSummary,
  type ObservabilitySummary,
} from "../../../../lib/observability";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const UPSTREAM_TIMEOUT_MS = 3000;

async function fetchLiveSummary(): Promise<ObservabilitySummary | null> {
  const base = getVinhBackendBaseUrl();
  if (base === null) return null;
  try {
    const upstream = await fetch(`${base}/api/observability/summary`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!upstream.ok) {
      console.warn(
        `[apex/observability] upstream ${upstream.status} ${upstream.statusText}`,
      );
      return null;
    }
    const body = (await upstream.json()) as Partial<ObservabilitySummary>;
    // Merge over the awaiting template so any field the backend omits is still
    // present, then stamp the honest live engine label.
    return {
      ...awaitingBackendSummary(Date.now() / 1000),
      ...body,
      engine: "observability-live",
    };
  } catch (err) {
    console.warn("[apex/observability] live fetch failed", err);
    return null;
  }
}

export async function GET(_req: NextRequest): Promise<Response> {
  const live = await fetchLiveSummary();
  const payload = live ?? awaitingBackendSummary(Date.now() / 1000);
  return Response.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "X-Apex-Observability-Engine": payload.engine,
    },
  });
}
