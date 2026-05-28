"use client";

/**
 * usePrefersReducedMotion: client hook that watches the
 * (prefers-reduced-motion: reduce) media query + returns the current
 * boolean state. Defers the setState via requestAnimationFrame per the
 * React 19 set-state-in-effect lint rule per project memory
 * feedback_react19_set_state_in_effect_workarounds.
 *
 * Wave-51 cascade-#56 reduce-motion accessibility hook shipped after
 * Codex adversarial review of wave-51 hero upgrade flagged two HIGH
 * accessibility issues:
 *   - BlurText first-paint invisible-text under reduce-motion (the
 *     inline filter:blur(14px) opacity:0 style applied before
 *     useEffect could flip the static branch)
 *   - RacingLineHero SMIL embers continued drifting under reduce-
 *     motion despite the CSS opacity reset (the wave-51 rev-5 ember
 *     additions did not get the display:none CSS reset that the rev-4
 *     car group already had)
 *
 * Both consumers (BlurText + RacingLineHero) now read from this single
 * hook + branch their render output rather than rely on CSS reset
 * timing OR matchMedia reads scattered across multiple effects.
 *
 * Hydration safety per feedback_useState_lazy_init_hydration_footgun:
 * useState initial value is false (NOT a lazy initializer reading
 * window). The matchMedia check happens inside useEffect after mount;
 * the value flips via rAF-deferred setState so the React 19 lint rule
 * does not flag the conditional sync update.
 */

import { useEffect, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Wave-51b cascade-#58 close: jsdom env exposes window but does NOT
    // implement matchMedia; the prior bare-window guard let the code
    // through + the matchMedia call threw TypeError in CoachingReport
    // + AnalyzeFlow test suites that render GraniteCitationFooter.
    // Defensive type-check guards against test envs lacking the API.
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let rafId = 0;
    const apply = (matches: boolean) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setPrefersReducedMotion(matches));
    };

    apply(mq.matches);
    const handler = (event: MediaQueryListEvent) => apply(event.matches);
    mq.addEventListener("change", handler);

    return () => {
      cancelAnimationFrame(rafId);
      mq.removeEventListener("change", handler);
    };
  }, []);

  return prefersReducedMotion;
}
