"use client";

/**
 * ProductionObservabilityPanel: wave-53 live production-observability cockpit
 * for the /judges page. Fetches /api/observability/summary (same-origin proxy
 * to apex-backend's GET /api/observability/summary) and renders LIVE telemetry:
 * request totals, throughput, uptime, p50/p95/p99 latency, status-class mix,
 * per-route averages, and recent requests deep-linked to their real Honeycomb
 * trace waterfalls.
 *
 * Honesty contract (feedback_conceptual_stack_vs_shipped_stack): live numbers
 * come only from the real backend snapshot (engine "observability-live"). When
 * the backend is unreachable the panel shows the "awaiting live backend" wiring
 * state, never fabricated metrics. Honeycomb deep-links require a Honeycomb
 * login for non-team viewers; this in-app panel is the anonymous-viewable
 * surface, the links are verification for authenticated viewers.
 */

import { useEffect, useState } from "react";

import {
  buildHoneycombTraceUrl,
  HONEYCOMB,
  HONEYCOMB_DATASET_URL,
  type ObservabilitySummary,
} from "../lib/observability";

const REFRESH_MS = 10_000;
const FETCH_TIMEOUT_MS = 8_000;
const MAX_TRACE_ROWS = 8;

const STATUS_COLORS: Record<string, string> = {
  "2xx": "bg-racing-green",
  "3xx": "bg-muted",
  "4xx": "bg-amber",
  "5xx": "bg-accent",
};

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

interface MetricTileProps {
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
}

function MetricTile({ label, value, hint }: MetricTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-sm border border-rule bg-paper-warm p-4">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</dt>
      <dd className="font-display text-2xl tabular-nums text-ink">{value}</dd>
      {hint ? <p className="font-mono text-[10px] text-muted">{hint}</p> : null}
    </div>
  );
}

export default function ProductionObservabilityPanel() {
  const [summary, setSummary] = useState<ObservabilitySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const runOnce = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      try {
        const res = await fetch("/api/observability/summary", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`/api/observability/summary -> HTTP ${res.status}`);
        const payload = (await res.json()) as ObservabilitySummary;
        if (cancelled) return;
        setSummary(payload);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        clearTimeout(timeoutId);
      }
    };
    void runOnce();
    const interval = setInterval(() => void runOnce(), REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [reload]);

  const isLive = summary?.engine === "observability-live";
  const statusEntries = summary
    ? (Object.entries(summary.status_class) as ReadonlyArray<[string, number]>).filter(
        ([, n]) => n > 0,
      )
    : [];
  const statusTotal = statusEntries.reduce((acc, [, n]) => acc + n, 0);
  const routeEntries = summary
    ? (Object.entries(summary.by_route) as ReadonlyArray<[string, { count: number; avg_ms: number }]>)
        .slice()
        .sort((a, b) => b[1].count - a[1].count)
    : [];
  const traces = summary
    ? summary.recent_traces.filter((t) => t.trace_id).slice(0, MAX_TRACE_ROWS)
    : [];

  return (
    <section
      aria-labelledby="production-observability-title"
      className="flex flex-col gap-5 rounded-sm border-2 border-rule bg-paper p-5"
    >
      <header className="flex flex-col gap-2">
        <p className="apex-eyebrow">Production observability · OpenTelemetry → Honeycomb</p>
        <h3
          id="production-observability-title"
          className="font-display text-2xl tracking-tight text-ink"
        >
          Live backend telemetry, in-product.
        </h3>
        <p className="text-sm leading-relaxed text-ink-soft">
          Most hackathon backends ship no observability. APEX exports an OpenTelemetry span for
          every request from <span className="font-mono text-xs">apex-backend</span> to Honeycomb,
          and mirrors the same signals here live. Numbers below are real traffic the deployed
          backend has served since boot, refreshed every {REFRESH_MS / 1000}s. Each recent request
          links to its real Honeycomb trace waterfall.
        </p>
      </header>

      {summary === null && error === null ? (
        <p className="font-mono text-xs uppercase tracking-wider text-amber-ink">
          Connecting to live telemetry…
        </p>
      ) : null}

      {summary === null && error !== null ? (
        <div className="flex flex-col gap-3">
          <p
            role="alert"
            className="rounded-sm border-2 border-accent bg-paper p-3 font-mono text-xs leading-relaxed text-accent"
          >
            Live telemetry unavailable: {error}
          </p>
          <button
            type="button"
            onClick={() => setReload((n) => n + 1)}
            className="self-start rounded-sm border-2 border-racing-green bg-racing-green px-4 py-2 font-mono text-xs uppercase tracking-wider text-paper transition-colors hover:bg-racing-green-deep"
          >
            Retry telemetry
          </button>
        </div>
      ) : null}

      {summary !== null ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`flex items-center gap-2 rounded-sm border px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${
                isLive
                  ? "border-racing-green bg-paper text-racing-green"
                  : "border-amber bg-paper text-amber-ink"
              }`}
            >
              <span
                aria-hidden
                className={`inline-block h-2 w-2 rounded-full ${isLive ? "bg-racing-green" : "bg-amber"}`}
              />
              {isLive ? "Live" : "Awaiting live backend"}
            </span>
            <span className="rounded-sm border border-rule bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              service.name: {summary.service_name}
            </span>
            {summary.otlp_active ? (
              <span className="rounded-sm border border-rule bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
                Exporter: OTLP → Honeycomb
              </span>
            ) : null}
            <span className="rounded-sm border border-rule bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted">
              Auto-refresh every {REFRESH_MS / 1000}s
            </span>
          </div>

          {!isLive ? (
            <p className="rounded-sm border border-amber bg-paper-warm p-3 font-mono text-[11px] leading-relaxed text-amber-ink">
              Wiring status (not a live read): the apex-backend OpenTelemetry → Honeycomb pipeline
              is live and the <span className="not-italic">{HONEYCOMB.dataset}</span> dataset is
              receiving spans. In-app live metrics appear once this frontend deploy points at the
              backend summary endpoint. Explore the real dataset below.
            </p>
          ) : null}

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetricTile label="Total requests" value={summary.total_requests.toLocaleString()} hint="since process boot" />
            <MetricTile label="Throughput" value={`${summary.eps_1m.toFixed(2)}/s`} hint="events per second, last 60s" />
            <MetricTile label="Uptime" value={formatUptime(summary.uptime_s)} hint="current backend process" />
            <MetricTile label="Latency p50" value={`${Math.round(summary.latency_ms.p50)} ms`} hint={`recent window n=${summary.latency_ms.window}`} />
            <MetricTile label="Latency p95" value={`${Math.round(summary.latency_ms.p95)} ms`} />
            <MetricTile label="Latency p99" value={`${Math.round(summary.latency_ms.p99)} ms`} />
          </dl>

          {statusTotal > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                Status-class distribution
              </p>
              <div className="flex h-3 w-full overflow-hidden rounded-sm border border-rule">
                {statusEntries.map(([cls, n]) => (
                  <span
                    key={cls}
                    className={STATUS_COLORS[cls] ?? "bg-muted"}
                    style={{ width: `${(n / statusTotal) * 100}%` }}
                    title={`${cls}: ${n}`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                {statusEntries.map(([cls, n]) => (
                  <span key={cls} className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                    {cls}: {n}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {routeEntries.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Per-route</p>
              <ul className="flex flex-col gap-1">
                {routeEntries.map(([route, stats]) => (
                  <li
                    key={route}
                    className="flex items-baseline justify-between gap-3 border-b border-rule pb-1 font-mono text-xs text-ink-soft"
                  >
                    <span className="truncate">{route}</span>
                    <span className="whitespace-nowrap text-muted">
                      {stats.count}× · {Math.round(stats.avg_ms)} ms avg
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {traces.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                Recent traces (open the real Honeycomb waterfall · Honeycomb login)
              </p>
              <ul className="flex flex-col gap-1">
                {traces.map((t) => (
                  <li key={`${t.trace_id}-${t.ts}`}>
                    <a
                      href={buildHoneycombTraceUrl(t.trace_id as string, t.ts)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-baseline justify-between gap-3 rounded-sm border border-rule bg-paper px-3 py-1.5 font-mono text-xs text-ink-soft transition-colors hover:border-racing-green hover:text-racing-green"
                    >
                      <span className="truncate">
                        {t.method} {t.route} · {t.status}
                      </span>
                      <span className="whitespace-nowrap text-muted">
                        {Math.round(t.duration_ms)} ms · trace ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={HONEYCOMB_DATASET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm border-2 border-racing-green bg-racing-green px-4 py-2 font-mono text-xs uppercase tracking-wider text-paper transition-colors hover:bg-racing-green-deep"
            >
              Explore the live {HONEYCOMB.dataset} dataset in Honeycomb ↗
            </a>
            <button
              type="button"
              onClick={() => setReload((n) => n + 1)}
              className="rounded-sm border-2 border-rule bg-paper px-4 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft transition-colors hover:border-racing-green"
            >
              Refresh now
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
