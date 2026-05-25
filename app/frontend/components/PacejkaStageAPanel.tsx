"use client";

/**
 * PacejkaStageAPanel: wave-45 Phase 9 Block F V12 visualization for the
 * Stage A 8-tier Pacejka linearization swap-point per D-031 staged
 * ladder + D-050 byte-equality lock. Renders the 8 residual norms +
 * convergence-status pills from /api/projector-stage-a.
 *
 * HEAD: canned-fallback engine; Vinh M3-V12 swaps in
 * apex/backend/apex/physics/projection_pacejka.py satisfying the
 * DifferentiableProjector Protocol.
 *
 * Mounted on /judges between the engine-agnostic byte-equality demo
 * + the LangGraph runtime panel for the maximal-architecture story.
 */

import { useEffect, useState } from "react";

import type { PacejkaResponse, PacejkaTier } from "../../shared/types";

type PanelState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly response: PacejkaResponse }
  | { readonly status: "error"; readonly message: string };

function tierBorder(status: PacejkaTier["status"]): string {
  switch (status) {
    case "converged":
      return "border-racing-green bg-paper";
    case "linearized":
      return "border-amber bg-paper-warm";
    case "deferred":
      return "border-rule bg-paper";
    default: {
      const _exhaustive: never = status;
      throw new Error(`unknown Pacejka tier status: ${String(_exhaustive)}`);
    }
  }
}

const FETCH_TIMEOUT_MS = 8000;

export default function PacejkaStageAPanel() {
  const [state, setState] = useState<PanelState>({ status: "loading" });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const run = async () => {
      try {
        const res = await fetch("/api/projector-stage-a", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`/api/projector-stage-a -> HTTP ${res.status}`);
        const payload = (await res.json()) as PacejkaResponse;
        if (!cancelled) setState({ status: "ready", response: payload });
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error && err.name === "AbortError"
            ? `/api/projector-stage-a timed out after ${FETCH_TIMEOUT_MS} ms`
            : err instanceof Error
              ? err.message
              : String(err);
        setState({ status: "error", message });
      }
    };
    void run();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [reload]);

  return (
    <section
      aria-labelledby="pacejka-stage-a-title"
      className="flex flex-col gap-4 rounded-sm border-2 border-rule bg-paper p-5"
    >
      <header>
        <p className="apex-eyebrow">Vinh M3-V12 · D-031 Stage A · 8-tier Pacejka linearization</p>
        <h3
          id="pacejka-stage-a-title"
          className="font-display text-2xl tracking-tight text-ink"
        >
          Stage A. Eight tiers, one residual norm at a time.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          The Pacejka tire-force linearization wave for each physics tier (vehicle dynamics,
          friction ellipse, polyphase anomaly, thermal envelope, SCP outer loop, Pacejka core,
          bicycle model, forward-Euler kinematic step). HEAD ships canned-fallback engine while
          Vinh wires <span className="font-mono">apex/backend/apex/physics/projection_pacejka.py</span>.
        </p>
      </header>

      {state.status === "loading" && (
        <p className="font-mono text-xs uppercase tracking-wider text-amber">
          Loading Pacejka 8-tier trace...
        </p>
      )}

      {state.status === "ready" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <span
              className={`rounded-sm border px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${
                state.response.engine === "pacejka-v12-real"
                  ? "border-racing-green bg-paper text-racing-green"
                  : "border-amber bg-paper text-amber"
              }`}
            >
              Engine: {state.response.engine}
            </span>
            <span className="rounded-sm border border-rule bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              {state.response.compute_ms} ms
            </span>
            <span className="rounded-sm border border-rule bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              Violations: {state.response.final_violation_count}
            </span>
          </div>
          <ol className="grid gap-2 sm:grid-cols-2">
            {state.response.tiers.map((tier) => (
              <li
                key={tier.tier}
                className={`flex flex-col gap-1 rounded-sm border-2 p-3 ${tierBorder(tier.status)}`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    Tier {tier.tier}
                  </span>
                  <span
                    className={`rounded-sm border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                      tier.status === "converged"
                        ? "border-racing-green text-racing-green"
                        : tier.status === "linearized"
                          ? "border-amber text-amber"
                          : "border-rule text-muted"
                    }`}
                  >
                    {tier.status}
                  </span>
                </div>
                <span className="font-display text-base leading-snug text-ink">{tier.name}</span>
                <span className="font-mono text-[10px] text-ink-soft">
                  residual norm: {tier.residual_norm.toFixed(4)}
                </span>
              </li>
            ))}
          </ol>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
            Swap-point: <span className="text-ink-soft">{state.response.swap_point}</span>
          </p>
        </div>
      )}

      {state.status === "error" && (
        <div className="flex flex-col gap-3">
          <p
            role="alert"
            className="rounded-sm border-2 border-accent bg-paper p-3 font-mono text-xs leading-relaxed text-accent"
          >
            Pacejka Stage A trace failed: {state.message}
          </p>
          <button
            type="button"
            onClick={() => {
              setState({ status: "loading" });
              setReload((n) => n + 1);
            }}
            className="self-start rounded-sm border-2 border-racing-green bg-racing-green px-4 py-2 font-mono text-xs uppercase tracking-wider text-paper transition-colors hover:bg-racing-green-deep"
          >
            Retry Pacejka trace
          </button>
        </div>
      )}
    </section>
  );
}
