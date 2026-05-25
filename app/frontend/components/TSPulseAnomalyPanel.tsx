"use client";

/**
 * TSPulseAnomalyPanel: /judges-facing visualization of the IBM TSPulse
 * 1M polyphase time-frequency anomaly detector status panel. Wave-44
 * Phase 6a galaxy-stretch close-out per D-016 Layer 2 architecture
 * spec + wave-30 maximal architecture lock D-026 12-tool inventory.
 *
 * IBM TSPulse (1M params; IBM Granite TS family) operates on the
 * polyphase decomposition of the raw 50 Hz telemetry tensor at four
 * frequency bands (DC + low-band + mid-band + high-band per the
 * D-016 Layer 2 spec) and emits a per-window anomaly score on the
 * joint time-frequency lattice. Pre-mortem row 71 sets the success
 * criterion: a per-window detection in under 30 ms preserves the G8
 * 15s coaching-report latency budget when the detector fires before
 * the projector runs the QP.
 *
 * Discriminated-union state (5 variants per
 * feedback_discriminated_unions_over_contradiction memory rule):
 *   - idle: detector mounted; no telemetry window seen yet.
 *   - scanning: detector running on the current window; per-band
 *     score values stream as they arrive.
 *   - clean: scan complete; anomaly score below the p95 threshold.
 *   - anomaly: scan complete; per-band score breached the p95
 *     threshold; affected bands surface as role=alert.
 *   - error: detector unavailable; underlying message preserved
 *     (role=alert).
 *
 * Mock data via `MOCK_TSPULSE_ACTIVE` in lib/mocks/judges-mocks.ts.
 * Live data arrives once Vinh M3-V7 backend wires the polyphase
 * detector endpoint (POST /api/tspulse/anomaly per wave-44 plan
 * Vinh-scope addition V7).
 *
 * Exhaustiveness throw on the state discriminator via the wave-37
 * verdictLabel pattern (switch with `_exhaustive: never` default).
 *
 * Editorial-paddock palette + Fraunces display + IBM Plex Mono numerics.
 */

import { MOCK_TSPULSE_ACTIVE } from "../lib/mocks/judges-mocks";

export type TSPulseBand = "dc" | "low" | "mid" | "high";

export type TSPulseAnomalyState =
  | { readonly status: "idle" }
  | {
      readonly status: "scanning";
      readonly window_index: number;
      readonly elapsed_ms: number;
    }
  | {
      readonly status: "clean";
      readonly window_index: number;
      readonly score: number;
      readonly threshold_p95: number;
      readonly detection_ms: number;
    }
  | {
      readonly status: "anomaly";
      readonly window_index: number;
      readonly score: number;
      readonly threshold_p95: number;
      readonly affected_bands: ReadonlyArray<TSPulseBand>;
      readonly detection_ms: number;
    }
  | { readonly status: "error"; readonly message: string };

function statusBorder(status: TSPulseAnomalyState["status"]): string {
  switch (status) {
    case "idle":
      return "border-rule";
    case "scanning":
      return "border-amber";
    case "clean":
      return "border-racing-green";
    case "anomaly":
      return "border-accent";
    case "error":
      return "border-accent";
    default: {
      const _exhaustive: never = status;
      throw new Error(`unknown TSPulse status: ${String(_exhaustive)}`);
    }
  }
}

function statusLabel(status: TSPulseAnomalyState["status"]): string {
  switch (status) {
    case "idle":
      return "Detector idle";
    case "scanning":
      return "Scanning";
    case "clean":
      return "Clean";
    case "anomaly":
      return "Anomaly";
    case "error":
      return "Error";
    default: {
      const _exhaustive: never = status;
      throw new Error(`unknown TSPulse status: ${String(_exhaustive)}`);
    }
  }
}

function bandLabel(band: TSPulseBand): string {
  switch (band) {
    case "dc":
      return "DC";
    case "low":
      return "Low";
    case "mid":
      return "Mid";
    case "high":
      return "High";
    default: {
      const _exhaustive: never = band;
      throw new Error(`unknown TSPulse band: ${String(_exhaustive)}`);
    }
  }
}

export default function TSPulseAnomalyPanel({
  state = MOCK_TSPULSE_ACTIVE,
}: {
  readonly state?: TSPulseAnomalyState;
}) {
  return (
    <section
      aria-labelledby="tspulse-anomaly-title"
      aria-live="polite"
      className={`flex flex-col gap-3 rounded-sm border-2 ${statusBorder(state.status)} bg-paper p-5`}
    >
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p className="apex-eyebrow">IBM TSPulse 1M, D-016 Layer 2 (polyphase anomaly)</p>
          <h3
            id="tspulse-anomaly-title"
            className="font-display text-2xl tracking-tight text-ink"
          >
            Time-frequency anomaly detector
          </h3>
        </div>
        <span className="rounded-sm border border-rule bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
          {statusLabel(state.status)}
        </span>
      </header>

      {state.status === "idle" && (
        <p className="text-sm leading-relaxed text-ink-soft">
          Detector mounted. No telemetry window seen yet. The polyphase decomposition fires
          on the first 50 Hz telemetry window via the Vinh M3-V7 backend endpoint at POST
          /api/tspulse/anomaly. Pre-mortem row 71 success criterion is sub-30 ms per-window
          detection so the projector QP retains its budget.
        </p>
      )}

      {state.status === "scanning" && (
        <p className="text-sm leading-relaxed text-ink-soft">
          Scanning window <span className="font-mono text-racing-green">{state.window_index}</span> at
          {" "}{state.elapsed_ms} ms elapsed. Polyphase decomposition running on the four
          frequency bands (DC, low, mid, high) in parallel; per-band scores stream as they
          land.
        </p>
      )}

      {state.status === "clean" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-ink-soft">
            Window <span className="font-mono text-racing-green">{state.window_index}</span> clean.
            {" "}Anomaly score <span className="font-mono">{state.score.toFixed(3)}</span> below the
            {" "}p95 threshold <span className="font-mono">{state.threshold_p95.toFixed(3)}</span>.
            {" "}Detection landed in <span className="font-mono">{state.detection_ms.toFixed(0)} ms</span>.
          </p>
          <div className="grid grid-cols-3 gap-3 font-mono text-xs">
            <div className="flex flex-col rounded-sm border border-rule bg-paper-warm p-3">
              <span className="text-[10px] uppercase tracking-wider text-muted">Score</span>
              <span className="pt-1 text-ink">{state.score.toFixed(3)}</span>
            </div>
            <div className="flex flex-col rounded-sm border border-rule bg-paper-warm p-3">
              <span className="text-[10px] uppercase tracking-wider text-muted">p95</span>
              <span className="pt-1 text-ink">{state.threshold_p95.toFixed(3)}</span>
            </div>
            <div className="flex flex-col rounded-sm border border-rule bg-paper-warm p-3">
              <span className="text-[10px] uppercase tracking-wider text-muted">Latency</span>
              <span className="pt-1 text-ink">{state.detection_ms.toFixed(0)} ms</span>
            </div>
          </div>
        </div>
      )}

      {state.status === "anomaly" && (
        <div className="flex flex-col gap-2">
          <p
            role="alert"
            className="rounded-sm border-2 border-accent bg-paper p-3 font-mono text-xs leading-relaxed text-accent"
          >
            Window <span className="font-mono">{state.window_index}</span> anomaly.
            {" "}Score <span className="font-mono">{state.score.toFixed(3)}</span> breached the
            {" "}p95 threshold <span className="font-mono">{state.threshold_p95.toFixed(3)}</span>.
            {" "}Affected bands: <span className="font-mono">{state.affected_bands.map(bandLabel).join(", ")}</span>.
            {" "}Coaching pipeline routes to the projector with a Guardian-Safety pre-flag per D-016
            {" "}Layer 2 contract.
          </p>
          <div className="grid grid-cols-3 gap-3 font-mono text-xs">
            <div className="flex flex-col rounded-sm border border-rule bg-paper-warm p-3">
              <span className="text-[10px] uppercase tracking-wider text-muted">Score</span>
              <span className="pt-1 text-ink">{state.score.toFixed(3)}</span>
            </div>
            <div className="flex flex-col rounded-sm border border-rule bg-paper-warm p-3">
              <span className="text-[10px] uppercase tracking-wider text-muted">p95</span>
              <span className="pt-1 text-ink">{state.threshold_p95.toFixed(3)}</span>
            </div>
            <div className="flex flex-col rounded-sm border border-rule bg-paper-warm p-3">
              <span className="text-[10px] uppercase tracking-wider text-muted">Latency</span>
              <span className="pt-1 text-ink">{state.detection_ms.toFixed(0)} ms</span>
            </div>
          </div>
        </div>
      )}

      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-sm border-2 border-accent bg-paper p-3 font-mono text-xs leading-relaxed text-accent"
        >
          TSPulse endpoint error: {state.message}. Coaching pipeline routes to the projector
          without the pre-flag. Re-run the session or check the TSPulse service health on
          /status.
        </p>
      )}

      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Cross-ref: <span className="text-ink-soft">D-016 Layer 2 + arch-spec Appendix W30 polyphase decomposition + Vinh M3-V7 endpoint</span>
      </p>
    </section>
  );
}
