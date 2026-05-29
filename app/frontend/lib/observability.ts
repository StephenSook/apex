/**
 * wave-53 production-observability cockpit: shared types + Honeycomb deep-link
 * builders for the /judges live telemetry panel.
 *
 * The backend (apex-backend on HF Spaces) exposes GET /api/observability/summary,
 * an honest in-product mirror of the spans it exports to Honeycomb over OTLP.
 * The Next.js route at app/frontend/app/api/observability/summary proxies it
 * (same-origin, server-side fallback). This module owns the response contract
 * plus the Honeycomb trace/dataset URL construction per
 * docs.honeycomb.io/investigate/collaborate/share-trace.
 *
 * Honesty note (feedback_conceptual_stack_vs_shipped_stack): when the backend
 * is unreachable the panel renders the `observability-awaiting-backend` state,
 * which is labelled as wiring status, NOT a live measurement. Live numbers only
 * ever come from the real backend snapshot (engine `observability-live`).
 */

// Public Honeycomb URL slugs for APEX production. These are not secrets (they
// appear in the dataset URL); the ingest key lives only in the backend HF
// Space env (OTEL_EXPORTER_OTLP_HEADERS) and is rotated post-submission.
export const HONEYCOMB = {
  subdomain: "ui", // US region per share-trace docs (EU would be "ui-eu1")
  team: "stephensookra-gettingstarted",
  environment: "production",
  dataset: "apex-backend",
} as const;

export const HONEYCOMB_DATASET_URL = `https://${HONEYCOMB.subdomain}.honeycomb.io/${HONEYCOMB.team}/environments/${HONEYCOMB.environment}/datasets/${HONEYCOMB.dataset}/overview`;

export type ObservabilityEngine =
  | "observability-live"
  | "observability-awaiting-backend";

export interface RecentTrace {
  readonly trace_id: string | null;
  readonly route: string;
  readonly method: string;
  readonly status: number;
  readonly duration_ms: number;
  readonly ts: number; // epoch seconds
}

export interface LatencyMs {
  readonly p50: number;
  readonly p95: number;
  readonly p99: number;
  readonly window: number;
}

export interface ObservabilitySummary {
  readonly engine: ObservabilityEngine;
  readonly service_name: string;
  readonly otel_enabled: boolean;
  readonly otlp_active: boolean;
  readonly exporter: "otlp" | "console" | "none";
  readonly captured_at: number;
  readonly total_requests: number;
  readonly status_class: Readonly<Record<string, number>>;
  readonly by_route: Readonly<Record<string, { count: number; avg_ms: number }>>;
  readonly latency_ms: LatencyMs;
  readonly uptime_s: number;
  readonly eps_1m: number;
  readonly recent_traces: ReadonlyArray<RecentTrace>;
}

/**
 * Build a direct Honeycomb trace-waterfall permalink for a trace_id.
 * Format per docs.honeycomb.io/investigate/collaborate/share-trace. A +/-5 min
 * window around the request timestamp keeps the lookup fast and reliable.
 * NOTE: opening the link requires a Honeycomb login (non-team viewers cannot
 * see it); the in-app panel is the anonymous-viewable surface, this link is for
 * verification by the team / authenticated viewers.
 */
export function buildHoneycombTraceUrl(traceId: string, tsSeconds: number): string {
  const start = Math.floor(tsSeconds) - 300;
  const end = Math.ceil(tsSeconds) + 300;
  const base = `https://${HONEYCOMB.subdomain}.honeycomb.io/${HONEYCOMB.team}/environments/${HONEYCOMB.environment}/datasets/${HONEYCOMB.dataset}/trace`;
  const qs = new URLSearchParams({
    trace_id: traceId,
    trace_start_ts: String(start),
    trace_end_ts: String(end),
  });
  return `${base}?${qs.toString()}`;
}

/**
 * Honest fallback used when the backend summary endpoint is unreachable. The
 * flags describe the KNOWN production architecture (apex-backend exports OTLP
 * to Honeycomb); the `observability-awaiting-backend` engine tells the panel to
 * present this as wiring status rather than a live reading.
 */
export function awaitingBackendSummary(nowSeconds: number): ObservabilitySummary {
  return {
    engine: "observability-awaiting-backend",
    service_name: HONEYCOMB.dataset,
    otel_enabled: true,
    otlp_active: true,
    exporter: "otlp",
    captured_at: nowSeconds,
    total_requests: 0,
    status_class: { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0 },
    by_route: {},
    latency_ms: { p50: 0, p95: 0, p99: 0, window: 0 },
    uptime_s: 0,
    eps_1m: 0,
    recent_traces: [],
  };
}
