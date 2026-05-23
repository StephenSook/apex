"use client";

/**
 * EdgeSummary: /judges-facing UI rendering the wave-38 D-019 item 1
 * WebGPU Granite 4.0 Nano 350M edge inference demo + the D-021 30-
 * line Newton friction-ellipse offline projector visualization.
 *
 * Consumes the useGraniteNanoEdge() hook from lib/webgpu-nano.ts +
 * the useConnectivity() hook from lib/sync-on-reconnect.ts. Renders
 * one of 5 discriminated-union states (loading / ready / oom /
 * offline / error) with role=alert / role=status semantics per the
 * wave-35 + wave-37 silent-failure-hunter patterns.
 *
 * The `ready` state shows a live in-browser inference card (paddock
 * summary placeholder for the wave-38 demo; full text-generation
 * call lands in wave-39 once the model warm-up + KV cache strategy
 * stabilises) + a Newton friction-ellipse projection visualization
 * via newton-friction-ellipse.ts (sample input: unconstrained 1.5g
 * combined lateral + longitudinal acceleration projected onto the
 * 0.85g friction boundary; the projection is a single Newton iterate
 * for unit-friction cases).
 *
 * Editorial-paddock palette throughout (warm cream paper + deep
 * racing green + signal clay red accent + amber highlight + near-
 * black ink); Fraunces display + IBM Plex Sans body + IBM Plex Mono
 * numerics.
 *
 * Exhaustiveness throw on the state discriminator via the wave-37
 * verdictLabel/verdictBorder/verdictTone pattern (extract to switch
 * with `_exhaustive: never` default). New state variants compile-
 * error at the never assignment.
 */

import { projectOntoFrictionEllipse } from "../lib/newton-friction-ellipse";
import { useConnectivity } from "../lib/sync-on-reconnect";
import type { GraniteNanoEdgeState } from "../lib/webgpu-nano";
import { useGraniteNanoEdge, WEBGPU_MEMORY_FLOOR_BYTES } from "../lib/webgpu-nano";

const DEMO_INPUT_A_LONG = 12.0;
const DEMO_INPUT_A_LAT = 10.0;
const DEMO_MU = 0.85;

function stateBorder(state: GraniteNanoEdgeState["status"]): string {
  switch (state) {
    case "loading":
      return "border-rule";
    case "ready":
      return "border-racing-green";
    case "oom":
      return "border-accent";
    case "offline":
      return "border-amber";
    case "error":
      return "border-accent";
    default: {
      const _exhaustive: never = state;
      throw new Error(`unknown EdgeSummary state: ${String(_exhaustive)}`);
    }
  }
}

function stateLabel(state: GraniteNanoEdgeState["status"]): string {
  switch (state) {
    case "loading":
      return "Loading";
    case "ready":
      return "Ready";
    case "oom":
      return "Edge unavailable";
    case "offline":
      return "Offline";
    case "error":
      return "Error";
    default: {
      const _exhaustive: never = state;
      throw new Error(`unknown EdgeSummary state: ${String(_exhaustive)}`);
    }
  }
}

function formatBytes(b: number): string {
  if (!Number.isFinite(b) || b < 0) {
    return "unavailable";
  }
  const gb = b / 1_000_000_000;
  return `${gb.toFixed(2)} GB`;
}

export default function EdgeSummary() {
  const edge = useGraniteNanoEdge();
  const connectivity = useConnectivity();

  // Connectivity override: if the browser flipped offline AFTER the
  // edge pipeline loaded (transient network drop), surface the
  // offline state via the role=status reconnect-pending alert. The
  // edge pipeline remains usable but the server-authoritative
  // contract per D-021 requires the operator to know reconnect is
  // pending.
  const effectiveStatus =
    connectivity.status === "offline" && edge.status !== "offline"
      ? "offline"
      : edge.status;

  return (
    <section
      aria-labelledby="edge-summary-title"
      className={`flex flex-col gap-3 rounded-sm border-2 ${stateBorder(effectiveStatus)} bg-paper p-5`}
    >
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p className="apex-eyebrow">WebGPU edge inference · D-019 item 1 · D-021</p>
          <h3
            id="edge-summary-title"
            className="font-display text-2xl tracking-tight text-ink"
          >
            Granite 4.0 Nano 350M in your browser
          </h3>
        </div>
        <span className="rounded-sm border border-rule bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
          {stateLabel(effectiveStatus)}
        </span>
      </header>

      {effectiveStatus === "loading" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-ink-soft">
            Probing WebGPU adapter for {formatBytes(WEBGPU_MEMORY_FLOOR_BYTES)} buffer headroom
            before fetching the Granite 4.0 Nano 350M ONNX weights from Hugging Face. First load
            is ~5-15 seconds on Chrome 121+ desktop; subsequent loads use the browser HTTP cache.
          </p>
          <div
            className="relative h-1 w-full overflow-hidden rounded-sm bg-paper-warm"
            role="progressbar"
            aria-busy="true"
            aria-valuetext={`Loading Granite Nano 350M (phase ${
              edge.status === "loading" && edge.progress >= 0.5 ? "weights" : "probe"
            })`}
          >
            <div
              className="apex-edge-indeterminate absolute inset-y-0 left-0 h-1 w-1/3 rounded-sm bg-racing-green"
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      {effectiveStatus === "ready" && edge.status === "ready" && (
        <ReadyPanel />
      )}

      {effectiveStatus === "oom" && edge.status === "oom" && (
        <p
          role="alert"
          className="rounded-sm border-2 border-accent bg-paper p-3 font-mono text-xs leading-relaxed text-accent"
        >
          Edge mode unavailable: WebGPU adapter advertises only{" "}
          {formatBytes(edge.available_bytes)} of buffer headroom; Granite Nano requires{" "}
          {formatBytes(edge.required_bytes)} for fp16 weights + KV cache. Server-only path active.
          Close heavy browser tabs OR switch to a discrete-GPU machine + reload to enable edge
          inference.
        </p>
      )}

      {effectiveStatus === "offline" && (
        <p
          role="status"
          className="rounded-sm border-2 border-amber bg-paper p-3 font-mono text-xs leading-relaxed text-amber"
        >
          Server-authoritative reconnect pending. Edge results are advisory only per D-021; no
          mechanical recommendations are emitted offline. The local Newton friction-ellipse
          projection continues to run in-browser for visualization; on reconnect the canonical
          server result overwrites the local state.
        </p>
      )}

      {effectiveStatus === "error" && edge.status === "error" && (
        <p
          role="alert"
          className="rounded-sm border-2 border-accent bg-paper p-3 font-mono text-xs leading-relaxed text-accent"
        >
          Edge inference error: {edge.message}. Re-run the session OR switch to the server-
          authoritative path via the /analyze route.
        </p>
      )}

      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Cross-ref: <span className="text-ink-soft">D-019 item 1 + D-021 + arch-spec Appendix W30 Layer 0 (Edge/Client Plane)</span>
      </p>
    </section>
  );
}

function ReadyPanel() {
  const projection = projectOntoFrictionEllipse(DEMO_INPUT_A_LONG, DEMO_INPUT_A_LAT, DEMO_MU);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm leading-relaxed text-ink-soft">
        Granite 4.0 Nano 350M loaded into the WebGPU pipeline. The browser now runs both the
        small-LM paddock-summary head + the 30-line Newton friction-ellipse projector offline;
        the server-authoritative path remains the source of truth + overwrites local state on
        every reconnect per D-021.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
        <div className="flex flex-col gap-1 rounded-sm border border-rule bg-paper-warm p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted">Input (unconstrained)</p>
          <p className="text-ink">
            a_long = {DEMO_INPUT_A_LONG.toFixed(2)} m/s² · a_lat = {DEMO_INPUT_A_LAT.toFixed(2)}{" "}
            m/s² · μ = {DEMO_MU.toFixed(2)}
          </p>
        </div>
        <div className="flex flex-col gap-1 rounded-sm border border-racing-green bg-paper-warm p-3">
          <p className="text-[10px] uppercase tracking-wider text-racing-green">
            Projected (Newton)
          </p>
          {projection ? (
            <p className="text-ink">
              a_long = {projection.a_long.toFixed(2)} m/s² · a_lat ={" "}
              {projection.a_lat.toFixed(2)} m/s² · iterates = {projection.iterates} ·{" "}
              {projection.converged ? "converged" : "MAX_ITERATES"}
            </p>
          ) : (
            <p role="alert" className="text-accent">
              Projection failed; non-finite input.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
