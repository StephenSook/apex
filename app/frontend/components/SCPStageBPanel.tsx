"use client";

/**
 * SCPStageBPanel: wave-45 Phase 9 Block F V13 visualization for the
 * Stage B 3-iteration SCP outer loop swap-point per D-031 staged
 * ladder + D-050 byte-equality lock. Renders the 3-iterate convergence
 * trace from /api/projector-stage-b with residual_norm + trust_region
 * + Powell rho per iterate.
 *
 * HEAD: canned-fallback engine; Vinh M3-V13 swaps in
 * apex/backend/apex/physics/projection_scp.py wrapping Stage A in
 * 3-iterate Taylor-step linearization.
 *
 * Mounted on /judges immediately below the Pacejka Stage A panel so the
 * D-031 staged ladder reads top-to-bottom for judges.
 */

import { useEffect, useState } from "react";

import type { SCPIterate, SCPResponse } from "../../shared/types";

type PanelState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly response: SCPResponse }
  | { readonly status: "error"; readonly message: string };

function iterateBorder(status: SCPIterate["status"]): string {
  switch (status) {
    case "convergent":
      return "border-amber bg-paper-warm";
    case "trust-region-step":
      return "border-rule bg-paper";
    case "converged":
      return "border-racing-green bg-paper";
    default: {
      const _exhaustive: never = status;
      throw new Error(`unknown SCP iterate status: ${String(_exhaustive)}`);
    }
  }
}

const FETCH_TIMEOUT_MS = 8000;

export default function SCPStageBPanel() {
  const [state, setState] = useState<PanelState>({ status: "loading" });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const run = async () => {
      try {
        const res = await fetch("/api/projector-stage-b", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`/api/projector-stage-b -> HTTP ${res.status}`);
        const payload = (await res.json()) as SCPResponse;
        if (!cancelled) setState({ status: "ready", response: payload });
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error && err.name === "AbortError"
            ? `/api/projector-stage-b timed out after ${FETCH_TIMEOUT_MS} ms`
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
      aria-labelledby="scp-stage-b-title"
      className="flex flex-col gap-4 rounded-sm border-2 border-rule bg-paper-warm p-5"
    >
      <header>
        <p className="apex-eyebrow">Vinh M3-V13 · D-031 Stage B · 3-iterate SCP outer loop</p>
        <h3
          id="scp-stage-b-title"
          className="font-display text-2xl tracking-tight text-ink"
        >
          Stage B. Three iterates, monotone residual descent.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          The Powell-ratio trust-region SCP outer loop wraps the Stage A linearization in
          3 Taylor-step iterates with monotone residual descent. HEAD ships canned-fallback
          engine while Vinh wires <span className="font-mono">apex/backend/apex/physics/projection_scp.py</span>.
        </p>
      </header>

      {state.status === "loading" && (
        <p className="font-mono text-xs uppercase tracking-wider text-amber-ink">
          Loading SCP 3-iterate trace...
        </p>
      )}

      {state.status === "ready" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <span
              className={`rounded-sm border px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${
                state.response.engine === "scp-v13-staged"
                  ? "border-racing-green bg-paper text-racing-green"
                  : "border-amber bg-paper text-amber-ink"
              }`}
            >
              Engine: {state.response.engine}
            </span>
            <span className="rounded-sm border border-rule bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              {state.response.compute_ms} ms
            </span>
            <span className="rounded-sm border border-racing-green bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-racing-green">
              Final residual: {state.response.final_residual.toFixed(4)}
            </span>
          </div>
          <ol className="flex flex-col gap-2">
            {state.response.iterates.map((iter) => (
              <li
                key={iter.iterate}
                className={`flex flex-row items-center gap-4 rounded-sm border-2 p-3 ${iterateBorder(iter.status)}`}
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  Iter {iter.iterate}
                </span>
                <span className="flex-1 font-mono text-xs text-ink">
                  residual {iter.residual_norm.toFixed(4)} · trust {iter.trust_region_radius.toFixed(2)} · rho {iter.powell_rho.toFixed(2)}
                </span>
                <span
                  className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                    iter.status === "converged"
                      ? "border-racing-green text-racing-green"
                      : iter.status === "trust-region-step"
                        ? "border-rule text-muted"
                        : "border-amber text-amber-ink"
                  }`}
                >
                  {iter.status}
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
            SCP Stage B trace failed: {state.message}
          </p>
          <button
            type="button"
            onClick={() => {
              setState({ status: "loading" });
              setReload((n) => n + 1);
            }}
            className="self-start rounded-sm border-2 border-racing-green bg-racing-green px-4 py-2 font-mono text-xs uppercase tracking-wider text-paper transition-colors hover:bg-racing-green-deep"
          >
            Retry SCP trace
          </button>
        </div>
      )}
    </section>
  );
}
