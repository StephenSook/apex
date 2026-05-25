"use client";

/**
 * JudgeWalkthroughStep: renders one step of the /judge-tour
 * walkthrough. Wave-45 Phase 4 Block C.1 close-out. 6-step narrative
 * locked in the route page; this component is a pure-render leaf
 * with no state beyond active-step navigation handled by the parent
 * route.
 *
 * Editorial-paddock palette + Fraunces display for the headline +
 * IBM Plex Sans body + IBM Plex Mono eyebrow tag.
 */

import type { ReactNode } from "react";
import Link from "next/link";

export interface JudgeWalkthroughStepProps {
  readonly stepNumber: number;
  readonly totalSteps: number;
  readonly eyebrow: string;
  readonly headline: string;
  readonly body: ReactNode;
  readonly cta?: { readonly href: string; readonly label: string };
  readonly previousStep?: number;
  readonly nextStep?: number;
}

export default function JudgeWalkthroughStep({
  stepNumber,
  totalSteps,
  eyebrow,
  headline,
  body,
  cta,
  previousStep,
  nextStep,
}: JudgeWalkthroughStepProps) {
  return (
    <article
      aria-labelledby={`judge-tour-step-${stepNumber}-title`}
      className="flex flex-col gap-6 rounded-sm border border-rule bg-paper p-8 lg:p-12"
    >
      <p className="apex-eyebrow">{eyebrow}</p>
      <h2
        id={`judge-tour-step-${stepNumber}-title`}
        className="font-display text-4xl tracking-tight text-ink sm:text-5xl"
      >
        {headline}
      </h2>
      <div className="prose-apex max-w-3xl text-base leading-relaxed text-ink-soft">
        {body}
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="self-start rounded-sm border border-racing-green bg-racing-green px-5 py-2 font-mono text-sm uppercase tracking-wider text-paper transition-colors hover:bg-racing-green-deep"
        >
          {cta.label}
        </Link>
      )}
      <nav
        aria-label="Walkthrough navigation"
        className="flex items-center justify-between gap-3 border-t border-rule pt-6"
      >
        {previousStep !== undefined ? (
          <Link
            href={`/judge-tour?step=${previousStep}`}
            className="font-mono text-sm uppercase tracking-wider text-ink-soft transition-colors hover:text-racing-green"
          >
            ← Previous
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
        <span className="font-mono text-xs text-muted">
          {stepNumber} of {totalSteps}
        </span>
        {nextStep !== undefined ? (
          <Link
            href={`/judge-tour?step=${nextStep}`}
            className="rounded-sm border border-racing-green bg-paper px-4 py-2 font-mono text-sm uppercase tracking-wider text-racing-green transition-colors hover:bg-racing-green hover:text-paper"
          >
            Next →
          </Link>
        ) : (
          <Link
            href="/judges"
            className="rounded-sm border border-racing-green bg-racing-green px-4 py-2 font-mono text-sm uppercase tracking-wider text-paper transition-colors hover:bg-racing-green-deep"
          >
            Back to Judges
          </Link>
        )}
      </nav>
    </article>
  );
}
