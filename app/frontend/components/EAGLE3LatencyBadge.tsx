"use client";

/**
 * EAGLE3LatencyBadge: /judges-facing visualization of the wave-30
 * D-019 item 4 EAGLE-3 speculative decoding Layer 6 inference-plane
 * latency badge.
 *
 * EAGLE-3 per arXiv:2503.01840 (2025 EAGLE-3 paper): draft-model +
 * acceptance-sampler speculative decoding speedup on vLLM, 2-6x
 * wall-clock improvement on most evaluated models (envelope is
 * benchmark-dependent; D-019 item 4 cites the verified 2.5-3.7x
 * typical band per the paper's primary evaluation + the up-to-5.9x
 * Llama-3.3-70B outlier). APEX integrates EAGLE-3 onto vLLM Layer 6
 * to hit the G8 15s coaching-report sub-budget on the RTX 4060
 * production target.
 *
 * Discriminated-union state (2 variants for the binary mode + 1
 * error variant; per feedback_discriminated_unions_over_contradiction):
 *   - disabled: vanilla decode; no draft model active.
 *   - active: draft + acceptance loop running; speedup + accepted-
 *     token-rate + draft rank displayed.
 *   - error: vLLM endpoint failure; falls back to vanilla decode.
 *
 * Mock data via `MOCK_EAGLE3_ACTIVE` in lib/mocks/judges-mocks.ts.
 * Live data lands Day 7-8 when Vinh wires the vLLM speculative-
 * decode metrics endpoint (Phase 4 task 4.4 per
 * docs/vinh-backend-plan.md).
 *
 * Exhaustiveness throw on the state discriminator + role=alert on
 * the error variant.
 *
 * Editorial-paddock palette + Fraunces display + IBM Plex Mono numerics.
 */

import { MOCK_EAGLE3_ACTIVE } from "../lib/mocks/judges-mocks";

export type EAGLE3State =
  | { readonly status: "disabled" }
  | {
      readonly status: "active";
      readonly speedup_x: number;
      readonly accepted_token_rate: number;
      readonly draft_rank: number;
      readonly draft_model: string;
    }
  | { readonly status: "error"; readonly message: string };

function stateBorder(status: EAGLE3State["status"]): string {
  switch (status) {
    case "disabled":
      return "border-rule";
    case "active":
      return "border-racing-green";
    case "error":
      return "border-accent";
    default: {
      const _exhaustive: never = status;
      throw new Error(`unknown EAGLE-3 state: ${String(_exhaustive)}`);
    }
  }
}

function stateLabel(status: EAGLE3State["status"]): string {
  switch (status) {
    case "disabled":
      return "Vanilla decode";
    case "active":
      return "Speculative active";
    case "error":
      return "Error";
    default: {
      const _exhaustive: never = status;
      throw new Error(`unknown EAGLE-3 state: ${String(_exhaustive)}`);
    }
  }
}

export default function EAGLE3LatencyBadge({
  state = MOCK_EAGLE3_ACTIVE,
}: {
  readonly state?: EAGLE3State;
}) {
  return (
    <section
      aria-labelledby="eagle3-latency-title"
      className={`flex flex-col gap-3 rounded-sm border-2 ${stateBorder(state.status)} bg-paper p-5`}
    >
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p className="apex-eyebrow">EAGLE-3 speculative decoding, D-019 item 4 (Layer 6 inference)</p>
          <h3
            id="eagle3-latency-title"
            className="font-display text-2xl tracking-tight text-ink"
          >
            Draft-and-accept latency speedup
          </h3>
        </div>
        <span className="rounded-sm border border-rule bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
          {stateLabel(state.status)}
        </span>
      </header>

      {state.status === "disabled" && (
        <p className="text-sm leading-relaxed text-ink-soft">
          Speculative decoding disabled. Vanilla autoregressive vLLM decode is the active
          path. Enable EAGLE-3 in Phase 4 task 4.4 to compress the Granite Instruct
          narration portion of the G8 15s coaching-report budget on the RTX 3060 Ti
          operator hardware that D-027 Stage C validated.
        </p>
      )}

      {state.status === "active" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-ink-soft">
            <span className="font-mono text-racing-green">{state.draft_model}</span> drafts
            candidate tokens; the base Granite Instruct 4.1 8B accepts or rejects in parallel.
            Net wall-clock speedup vs vanilla decode is{" "}
            <span className="font-mono text-racing-green">{state.speedup_x.toFixed(2)}x</span>{" "}
            per the arXiv:2503.01840 envelope (D-019 item 4 cites 2.5-3.7x typical band).
          </p>
          <div className="grid grid-cols-3 gap-3 font-mono text-xs">
            <div className="flex flex-col rounded-sm border border-racing-green bg-paper-warm p-3">
              <span className="text-[10px] uppercase tracking-wider text-racing-green">Speedup</span>
              <span className="pt-1 text-racing-green">{state.speedup_x.toFixed(2)}x</span>
            </div>
            <div className="flex flex-col rounded-sm border border-rule bg-paper-warm p-3">
              <span className="text-[10px] uppercase tracking-wider text-muted">Accept rate</span>
              <span className="pt-1 text-ink">{(state.accepted_token_rate * 100).toFixed(0)}%</span>
            </div>
            <div className="flex flex-col rounded-sm border border-rule bg-paper-warm p-3">
              <span className="text-[10px] uppercase tracking-wider text-muted">Draft rank</span>
              <span className="pt-1 text-ink">{state.draft_rank}</span>
            </div>
          </div>
        </div>
      )}

      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-sm border-2 border-accent bg-paper p-3 font-mono text-xs leading-relaxed text-accent"
        >
          EAGLE-3 metrics endpoint error: {state.message}. Vanilla decode is the active
          fallback; coaching-report latency may exceed the G8 15s sub-budget. Check vLLM
          service health on /status.
        </p>
      )}

      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Cross-ref: <span className="text-ink-soft">D-019 item 4 + arch-spec Appendix W30 Layer 6 (inference plane)</span>
      </p>
    </section>
  );
}
