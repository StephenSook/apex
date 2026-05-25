"use client";

/**
 * COAGateToggle: interactive demonstration of the load-bearing
 * differentiator (D-A + D-018 + D-052). Judges click a switch that
 * flips `coa_overlap_flag = 1` <-> `coa_overlap_flag = 0` + see the
 * projector verdict toggle between "permitted" + "blocked" on a
 * canned brake-throttle simultaneity scenario.
 *
 * Wave-45 Phase 4 Block C.1 close-out per the wave-45 plan
 * + the ApexIQ deep-dive steal-list item #3 (interactive verdict
 * narrative). Mounted on /judges between architecture figure +
 * galaxy-moves cluster. Visual: side-by-side brake (lever pressure)
 * + throttle (hand-control input) traces + COA flag pill + projector
 * verdict panel. Toggle is keyboard-accessible (aria-checked switch
 * role).
 *
 * Discriminated union state:
 *   - permitted: COA flag is true; projector verdict is "feasible"
 *   - blocked: COA flag is false; projector verdict is "violation"
 *
 * Pure UI demo. No fetch + no Granite call + no projector real-time
 * run. The narrative is the killshot: SAME physical event + the
 * COA flag changes the verdict.
 */

import { useState } from "react";

type COAGateState = "permitted" | "blocked";

function statusBorder(state: COAGateState): string {
  switch (state) {
    case "permitted":
      return "border-racing-green";
    case "blocked":
      return "border-accent";
    default: {
      const _exhaustive: never = state;
      throw new Error(`unknown COA gate state: ${String(_exhaustive)}`);
    }
  }
}

function verdictCopy(state: COAGateState): { headline: string; body: string } {
  switch (state) {
    case "permitted":
      return {
        headline: "Projector verdict: feasible",
        body: "COA flag = 1. The driver's adaptive equipment authorises brake + throttle simultaneity per the hardware-spec section. Projector permits the input. Tuning recommendation surfaces the COA citation.",
      };
    case "blocked":
      return {
        headline: "Projector verdict: violation",
        body: "COA flag = 0. The same physical input is treated as a brake-throttle simultaneity violation under able-bodied physics. Tuning recommendation reads `release brake before throttle` which is unactionable for an adaptive driver. This is exactly the misdiagnosis APEX prevents.",
      };
    default: {
      const _exhaustive: never = state;
      throw new Error(`unknown COA gate state: ${String(_exhaustive)}`);
    }
  }
}

export default function COAGateToggle() {
  const [state, setState] = useState<COAGateState>("permitted");
  const verdict = verdictCopy(state);
  const handleToggle = () => {
    setState((s) => (s === "permitted" ? "blocked" : "permitted"));
  };

  return (
    <section
      aria-labelledby="coa-gate-toggle-title"
      aria-live="polite"
      className={`flex flex-col gap-4 rounded-sm border-2 ${statusBorder(state)} bg-paper p-5`}
    >
      <header>
        <p className="apex-eyebrow">Interactive differentiator (D-A + D-052)</p>
        <h3
          id="coa-gate-toggle-title"
          className="font-display text-2xl tracking-tight text-ink"
        >
          The COA simultaneity gate, on a switch.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          The same physical event (brake pressure not fully released + throttle beginning)
          can be either feasible or a violation depending on the driver's FIA Certificate
          of Adaptations. APEX reads the COA at tensor level; flip the switch to see the
          projector verdict change.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={state === "permitted"}
          onClick={handleToggle}
          className={`flex items-center justify-between rounded-sm border-2 px-4 py-3 font-mono text-sm uppercase tracking-wider transition-colors ${
            state === "permitted"
              ? "border-racing-green bg-racing-green text-paper"
              : "border-accent bg-paper text-accent"
          }`}
        >
          <span>
            coa_overlap_flag = <span className="font-display">{state === "permitted" ? "1" : "0"}</span>
          </span>
          <span className="text-[10px] opacity-80">click to flip</span>
        </button>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1 rounded-sm border border-rule bg-paper-warm p-3 font-mono text-xs">
            <span className="text-[10px] uppercase tracking-wider text-muted">brake (lever pressure)</span>
            <span className="text-ink">0.42 MPa residual (not fully released)</span>
          </div>
          <div className="flex flex-col gap-1 rounded-sm border border-rule bg-paper-warm p-3 font-mono text-xs">
            <span className="text-[10px] uppercase tracking-wider text-muted">throttle (hand-control input)</span>
            <span className="text-ink">12 percent (rising)</span>
          </div>
        </div>
      </div>

      <div
        className={`flex flex-col gap-2 rounded-sm border-l-2 ${
          state === "permitted" ? "border-racing-green" : "border-accent"
        } bg-paper p-3`}
        role={state === "blocked" ? "alert" : undefined}
      >
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
          {state === "permitted" ? "Feasible per COA" : "Violation under able-bodied physics"}
        </p>
        <p className="font-display text-lg leading-snug text-ink">
          {verdict.headline}
        </p>
        <p className="text-sm leading-relaxed text-ink-soft">{verdict.body}</p>
      </div>

      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Cross-ref: <span className="text-ink-soft">D-A + D-018 tri-agent critic + D-052 G4 pivot reframing + paper §3.4 COA-parameterized simultaneity gate + Q&amp;A killshot #4</span>
      </p>
    </section>
  );
}
