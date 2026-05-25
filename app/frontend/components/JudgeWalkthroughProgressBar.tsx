"use client";

/**
 * JudgeWalkthroughProgressBar: editorial-paddock progress indicator
 * for the /judge-tour walkthrough route. Wave-45 Phase 4 Block C.1
 * close-out.
 *
 * Renders a horizontal segmented bar with one segment per step + an
 * active indicator + step number + total. motion-safe reduced-motion
 * guard on the active-step transition.
 */

import type { ReactNode } from "react";

export interface JudgeWalkthroughProgressBarProps {
  readonly currentStep: number;
  readonly totalSteps: number;
  readonly label?: ReactNode;
}

export default function JudgeWalkthroughProgressBar({
  currentStep,
  totalSteps,
  label,
}: JudgeWalkthroughProgressBarProps) {
  const safeCurrent = Math.max(1, Math.min(totalSteps, currentStep));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="apex-eyebrow">{label ?? `Step ${safeCurrent} of ${totalSteps}`}</p>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
          {Math.round((safeCurrent / totalSteps) * 100)}%
        </span>
      </div>
      <ol
        className="flex gap-1"
        aria-label={`Judge walkthrough progress: step ${safeCurrent} of ${totalSteps}`}
      >
        {Array.from({ length: totalSteps }, (_, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < safeCurrent;
          const isActive = stepNum === safeCurrent;
          return (
            <li
              key={stepNum}
              aria-current={isActive ? "step" : undefined}
              className={`h-1 flex-1 rounded-sm motion-safe:transition-colors ${
                isActive
                  ? "bg-racing-green"
                  : isCompleted
                    ? "bg-racing-green/60"
                    : "bg-rule"
              }`}
            />
          );
        })}
      </ol>
    </div>
  );
}
