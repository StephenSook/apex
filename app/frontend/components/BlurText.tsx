"use client";

/**
 * BlurText: word-by-word blur-to-crisp reveal for editorial headlines.
 *
 * Wave-51 cascade-#56 close per Codex HIGH #2 accessibility finding:
 * the prior rev rendered the words with inline filter:blur(14px) +
 * opacity:0 on first paint regardless of motion preference, then waited
 * for useEffect to flip the static branch. Reduced-motion users saw
 * invisible-text for a frame OR longer until the effect ran. The
 * rewrite below renders the words VISIBLE by default; the animation
 * className applies only when IntersectionObserver-detected viewport
 * entry AND prefers-reduced-motion-not-set. SSR + first paint match;
 * reduce-motion users see static visible text from frame 1.
 *
 * Reveal mechanics:
 *   - SSR + first paint: no className, no inline style. Words visible.
 *   - Motion-OK users + in-view: className flips to .apex-blur-word
 *     which carries animation: apex-blur-in 820ms forwards. The
 *     keyframe's 0% state is filter:blur(14px) opacity:0 + translateY,
 *     so the words snap to invisible at the moment of class apply
 *     (one frame FOUC) then animate to crisp + on-baseline.
 *   - Reduce-motion users: className never applies. Words stay visible.
 *
 * The one-frame FOUC for motion-OK users is the accessibility-correct
 * trade-off: the alternative is invisible-first-paint for everyone
 * including reduce-motion users, which violates the adaptive-driver
 * audience contract.
 *
 * Editorial-paddock fit:
 *   - Inherits parent font (Fraunces variable italic from the hero h1)
 *   - Inherits text color so cream paper + ink hierarchy holds
 *   - .apex-blur-word utility shipped in wave-51 globals.css with an
 *     explicit prefers-reduced-motion !important reset for belt-and-
 *     suspenders accessibility
 *   - Zero new dependencies; pure CSS + IntersectionObserver
 *
 * Per-word stagger: animation-delay = baseDelay + (wordIndex * perWord).
 * Default perWord 90ms reads cleanly without dragging the reveal past
 * the first viewport interaction.
 */

import { useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "../lib/use-prefers-reduced-motion";

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
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion) return;
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
  }, [prefersReducedMotion]);

  const words = text.split(/\s+/);
  const shouldAnimate = inView && !prefersReducedMotion;

  return (
    <span ref={containerRef}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        const delay = baseDelay + i * perWord;
        return (
          <span
            key={`blur-${i}-${word}`}
            className={shouldAnimate ? "apex-blur-word" : undefined}
            style={shouldAnimate ? { animationDelay: `${delay}ms` } : undefined}
          >
            {word}
            {isLast ? "" : " "}
          </span>
        );
      })}
    </span>
  );
}
