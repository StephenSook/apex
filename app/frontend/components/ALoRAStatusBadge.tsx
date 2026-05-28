"use client";

/**
 * ALoRAStatusBadge: /judges-facing visualization of the wave-30 D-019
 * item 2 Activated LoRA (aLoRA) Layer 6 adapter status panel.
 *
 * aLoRA per IBM Research "Activated LoRA" (NeurIPS-2024-area work):
 * lets vLLM hot-swap a task-specific adapter into a base model's
 * forward pass without recomputing the KV-cache for prior context.
 * APEX uses this to load a "race-engineer intrinsic" adapter on top
 * of the frozen Granite Instruct 4.1 8B base so the coaching report
 * inherits the multi-turn KV-cache of the request preamble + adapts
 * only the final generation pass to the race-engineer narration
 * style. Pre-mortem row 67 sets the success criterion: a hot-swap
 * round-trip under 200 ms preserves the G8 15s coaching-report
 * latency budget; a slower swap routes to the base-model fallback.
 *
 * Discriminated-union state (5 variants per
 * feedback_discriminated_unions_over_contradiction memory rule):
 *   - idle: no adapter loaded; base model in use.
 *   - loading: hot-swap in flight; KV-cache preserved.
 *   - active: race-engineer intrinsic loaded; adapter rank + alpha
 *     + lambda displayed.
 *   - fallback: hot-swap failed; base model in use (role=alert).
 *   - error: unexpected error; underlying message preserved (role=alert).
 *
 * Mock data via `DEMO_ALORA_STATUS_ACTIVE` in lib/mocks/judges-mocks.ts.
 * Live data arrives when Vinh wires the vLLM adapter hot-swap
 * endpoint (Phase 4 task 4.5 per docs/vinh-backend-plan.md).
 *
 * Exhaustiveness throw on the state discriminator via the wave-37
 * verdictLabel pattern (switch with `_exhaustive: never` default).
 *
 * Editorial-paddock palette + Fraunces display + IBM Plex Mono numerics.
 */

import { DEMO_ALORA_STATUS_ACTIVE } from "../lib/mocks/judges-mocks";

export type ALoRAStatus =
  | { readonly status: "idle" }
  | { readonly status: "loading"; readonly elapsed_ms: number }
  | {
      readonly status: "active";
      readonly adapter_name: string;
      readonly rank: number;
      readonly alpha: number;
      readonly lambda: number;
      readonly swap_ms: number;
    }
  | { readonly status: "fallback"; readonly reason: string }
  | { readonly status: "error"; readonly message: string };

function statusBorder(status: ALoRAStatus["status"]): string {
  switch (status) {
    case "idle":
      return "border-rule";
    case "loading":
      return "border-amber";
    case "active":
      return "border-racing-green";
    case "fallback":
      return "border-amber";
    case "error":
      return "border-accent";
    default: {
      const _exhaustive: never = status;
      throw new Error(`unknown ALoRA status: ${String(_exhaustive)}`);
    }
  }
}

function statusLabel(status: ALoRAStatus["status"]): string {
  switch (status) {
    case "idle":
      return "Base model";
    case "loading":
      return "Hot-swap";
    case "active":
      return "Adapter active";
    case "fallback":
      return "Fallback";
    case "error":
      return "Error";
    default: {
      const _exhaustive: never = status;
      throw new Error(`unknown ALoRA status: ${String(_exhaustive)}`);
    }
  }
}

export default function ALoRAStatusBadge({
  status = DEMO_ALORA_STATUS_ACTIVE,
}: {
  readonly status?: ALoRAStatus;
}) {
  return (
    <section
      aria-labelledby="alora-status-title"
      className={`flex flex-col gap-3 rounded-sm border-2 ${statusBorder(status.status)} bg-paper p-5`}
    >
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p className="apex-eyebrow">Activated LoRA hot-swap, D-019 item 2 (Layer 6)</p>
          <h3
            id="alora-status-title"
            className="font-display text-2xl tracking-tight text-ink"
          >
            Race-engineer intrinsic adapter
          </h3>
        </div>
        <span className="rounded-sm border border-rule bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
          {statusLabel(status.status)}
        </span>
      </header>

      {status.status === "idle" && (
        <p className="text-sm leading-relaxed text-ink-soft">
          No adapter loaded. Base Granite Instruct 4.1 8B handles every generation pass.
          The race-engineer intrinsic adapter loads on first coaching-report request via
          the vLLM hot-swap path (Phase 4 task 4.5).
        </p>
      )}

      {status.status === "loading" && (
        <p className="text-sm leading-relaxed text-ink-soft">
          Hot-swap in flight, {status.elapsed_ms} ms elapsed. KV-cache preserved per
          aLoRA contract; prior preamble does not re-tokenize. Pre-mortem row 67 success
          criterion is sub-200 ms round-trip.
        </p>
      )}

      {status.status === "active" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-ink-soft">
            <span className="font-mono text-racing-green">{status.adapter_name}</span> loaded
            via vLLM hot-swap, {status.swap_ms.toFixed(0)} ms round-trip. KV-cache preserved.
            Generation passes inherit the race-engineer narration style without re-encoding the
            multi-turn preamble.
          </p>
          <div className="grid grid-cols-3 gap-3 font-mono text-xs">
            <div className="flex flex-col rounded-sm border border-rule bg-paper-warm p-3">
              <span className="text-[10px] uppercase tracking-wider text-muted">Rank</span>
              <span className="pt-1 text-ink">{status.rank}</span>
            </div>
            <div className="flex flex-col rounded-sm border border-rule bg-paper-warm p-3">
              <span className="text-[10px] uppercase tracking-wider text-muted">Alpha</span>
              <span className="pt-1 text-ink">{status.alpha}</span>
            </div>
            <div className="flex flex-col rounded-sm border border-rule bg-paper-warm p-3">
              <span className="text-[10px] uppercase tracking-wider text-muted">Lambda</span>
              <span className="pt-1 text-ink">{status.lambda.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {status.status === "fallback" && (
        <p
          role="alert"
          className="rounded-sm border-2 border-amber bg-paper p-3 font-mono text-xs leading-relaxed text-amber"
        >
          Adapter hot-swap failed: {status.reason}. Routing to base Granite Instruct 4.1 8B
          per pre-mortem row 67 fallback path. Coaching report remains within the G8 15s
          latency budget; tone reverts to generic narration.
        </p>
      )}

      {status.status === "error" && (
        <p
          role="alert"
          className="rounded-sm border-2 border-accent bg-paper p-3 font-mono text-xs leading-relaxed text-accent"
        >
          aLoRA endpoint error: {status.message}. Falling back to base model. Re-run the
          session or check the vLLM service health on /status.
        </p>
      )}

      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Cross-ref: <span className="text-ink-soft">D-019 item 2 + arch-spec Appendix W30 Layer 6 (instruct plane)</span>
      </p>
    </section>
  );
}
