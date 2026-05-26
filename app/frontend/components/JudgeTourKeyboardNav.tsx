"use client";

/**
 * JudgeTourKeyboardNav: client-side arrow-key navigation + screen-
 * reader step-change announcements for /judge-tour. Wave-46 D-058
 * Phase 8.6 accessibility close-out.
 *
 * ArrowLeft / ArrowRight keys route to ?step=N-1 / ?step=N+1 within
 * the 1..totalSteps bounds. Renders a polite aria-live region that
 * announces "Step N of total: <headline>" on every step change so
 * screen-reader users hear the new step content without losing the
 * focus context. Visible focus + keyboard nav supplements the
 * Next/Previous Link controls already rendered by JudgeWalkthroughStep.
 *
 * No state of its own; it reads currentStep + totalSteps from props
 * (passed by Server Component parent) + dispatches router.push on key
 * events. Tab focus remains on the existing Next/Previous links;
 * ArrowLeft / ArrowRight intercept the global keydown only when the
 * focused element is body or a non-input control.
 */

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface JudgeTourKeyboardNavProps {
  readonly currentStep: number;
  readonly totalSteps: number;
  readonly stepLabel: string;
}

export default function JudgeTourKeyboardNav({
  currentStep,
  totalSteps,
  stepLabel,
}: JudgeTourKeyboardNavProps) {
  const router = useRouter();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // Do not hijack arrow keys when the user is typing in an input,
      // textarea, contenteditable, or anything with default-arrow-handling.
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName.toLowerCase();
      if (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        target?.isContentEditable === true
      ) {
        return;
      }
      if (event.key === "ArrowRight" && currentStep < totalSteps) {
        event.preventDefault();
        router.push(`/judge-tour?step=${currentStep + 1}`);
      } else if (event.key === "ArrowLeft" && currentStep > 1) {
        event.preventDefault();
        router.push(`/judge-tour?step=${currentStep - 1}`);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentStep, totalSteps, router]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      Step {currentStep} of {totalSteps}: {stepLabel}. Use left and right arrow keys to navigate.
    </div>
  );
}
