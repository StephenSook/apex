"use client";

/**
 * ReplayHorizonSlider: scrub through the 30-step forecast horizon
 * on the /analyze coaching report. Wave-45 Phase 6 Block C.3
 * close-out. Mounts at the bottom of the coaching-report tab.
 * Visualizes which forecast frame is "now" with a slider + ticked-
 * mark visualization.
 *
 * Pure UI demo. No fetch + no live projector run. Demo artifact
 * for the wave-45 plan + paper §4.5 case-study + §4.6 reproducibility cross-reference.
 */

import { useState } from "react";

export interface ReplayHorizonSliderProps {
  readonly horizonSteps?: number;
}

export default function ReplayHorizonSlider({ horizonSteps = 30 }: ReplayHorizonSliderProps) {
  const [frame, setFrame] = useState(0);
  const safe = Math.max(0, Math.min(horizonSteps - 1, frame));
  const percent = ((safe + 1) / horizonSteps) * 100;
  const elapsed = (safe / 50).toFixed(2);
  return (
    <section
      aria-labelledby="replay-horizon-slider-title"
      className="flex flex-col gap-3 rounded-sm border border-rule bg-paper-warm p-5"
    >
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p className="apex-eyebrow">Replay horizon slider · 30-step forecast scrub</p>
          <h3
            id="replay-horizon-slider-title"
            className="font-display text-xl tracking-tight text-ink"
          >
            Frame {safe + 1} of {horizonSteps}
          </h3>
        </div>
        <span className="rounded-sm border border-racing-green bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-racing-green">
          t + {elapsed} s
        </span>
      </header>
      <input
        type="range"
        min={0}
        max={horizonSteps - 1}
        step={1}
        value={safe}
        onChange={(e) => setFrame(Number.parseInt(e.target.value, 10))}
        aria-label="Scrub forecast horizon frame"
        className="w-full accent-racing-green"
      />
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted">
        <span>frame 1</span>
        <span>{percent.toFixed(0)}%</span>
        <span>frame {horizonSteps}</span>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Cross-ref: <span className="text-ink-soft">paper §4.5 case studies + the cvxpylayers per-step projection visualization</span>
      </p>
    </section>
  );
}
