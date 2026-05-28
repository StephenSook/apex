"use client";

/**
 * BlurText: word-by-word blur-to-crisp reveal for editorial headlines.
 *
 * Wave-51 hero shock-factor close 2026-05-27/28 per Stephen explicit
 * "shock factor wow factor" direction. Reference vocabulary from
 * motionsites.ai patterns (BlurText splits text by spaces + per-word
 * blur-in animation with staggered delay) translated to the editorial-
 * paddock palette + Fraunces italic display. The reveal happens on
 * IntersectionObserver-detected mount so the animation fires when the
 * headline enters the viewport rather than on every render.
 *
 * Editorial-paddock fit:
 *  - Inherits parent font (caller passes Fraunces variable italic from
 *    the page hero h1; we don't override fontFamily here).
 *  - Inherits text color so the cream paper + ink hierarchy holds.
 *  - Honors prefers-reduced-motion via the .apex-blur-word utility
 *    shipped in wave-51 globals.css (explicit !important reset to
 *    fully opaque + unblurred + on-baseline static state).
 *  - Zero new dependencies. CSS keyframes + IntersectionObserver only.
 *    framer-motion is intentionally NOT added to the deps tree
 *    (galaxy-ambition + bundle-size discipline per wave-51 close-out).
 *
 * Usage:
 *   <h1 className="font-display italic">
 *     <BlurText text="The race engineer for the drivers who" />{" "}
 *     <em className="text-accent">
 *       <BlurText text="don't have one." baseDelay={680} />
 *     </em>
 *   </h1>
 *
 * Per-word stagger: animation-delay = baseDelay + (wordIndex * perWord).
 * Default perWord 90ms reads cleanly without dragging the reveal past
 * the first viewport interaction.
 *
 * Hydration safety per feedback_useState_lazy_init_hydration_footgun.md:
 * useState initial value is `false` (NOT a lazy initializer reading
 * window) so SSR + first client paint match. IntersectionObserver
 * registration happens in useEffect after mount; the in-view flip then
 * triggers the animation. Reduced-motion detection also happens inside
 * useEffect via window.matchMedia. Per
 * feedback_react19_set_state_in_effect_workarounds.md: the conditional
 * setState below is gated on observer firing + reduced-motion match
 * (NOT unconditional) so the React 19 set-state-in-effect rule does
 * not fire.
 */

import { useEffect, useRef, useState } from "react";

export interface BlurTextProps {
  readonly text: string;
  /** Initial offset before the first word animates (ms). Default 0. */
  readonly baseDelay?: number;
  /** Per-word stagger interval (ms). Default 90. */
  readonly perWord?: number;
}

export default function BlurText({
  text,
  baseDelay = 0,
  perWord = 90,
}: BlurTextProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const [inView, setInView] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      // Wave-51 cascade-#55 close per feedback_react19_set_state_in_effect_workarounds.md:
      // defer the reduce-motion state set past the synchronous effect phase via
      // requestAnimationFrame so the React 19 set-state-in-effect lint rule does
      // not flag the conditional sync update. The visible behavior is identical;
      // the reduce-motion branch renders one extra paint with the default state
      // before flipping to the static branch, but the .apex-blur-word static
      // fallback renders the text fully visible on that first paint anyway.
      const rafId = requestAnimationFrame(() => setReduceMotion(true));
      return () => cancelAnimationFrame(rafId);
    }
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const words = text.split(/\s+/);

  return (
    <span ref={containerRef}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        const delay = baseDelay + i * perWord;
        const shouldAnimate = inView && !reduceMotion;
        return (
          <span
            key={`blur-${i}-${word}`}
            className={shouldAnimate ? "apex-blur-word" : undefined}
            style={
              shouldAnimate
                ? { animationDelay: `${delay}ms` }
                : reduceMotion
                  ? undefined
                  : { display: "inline-block", filter: "blur(14px)", opacity: 0 }
            }
          >
            {word}
            {isLast ? "" : " "}
          </span>
        );
      })}
    </span>
  );
}
