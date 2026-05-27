"use client";

/**
 * RacingLineHeroShell: dynamic-import wrapper around RacingLineHero per the
 * JudgesGalaxyMovesShell pattern (Next.js 16 ssr:false from Server Component
 * restriction per feedback_nextjs16_dynamic_ssr_false_client_only.md).
 *
 * Server Components cannot directly use next/dynamic with ssr:false. The
 * fix is a Client Component shell that owns the dynamic import.
 *
 * Wave-46 Phase B revision-3 update: the hero is now a 960x600 widescreen
 * 2D SVG editorial illustration (no R3F dependency). The dynamic-import
 * pattern is retained because the SVG uses CSS keyframes + SMIL
 * animateMotion that initialize on first DOM-mount; isolating that
 * behind ssr:false keeps SSR clean.
 */

import dynamic from "next/dynamic";

const RacingLineHero = dynamic(() => import("./RacingLineHero"), {
  ssr: false,
  loading: () => (
    <div
      className="aspect-[10/9] w-full animate-pulse rounded-sm border border-rule bg-paper-warm"
      role="status"
      aria-label="Loading racing line visualization"
    />
  ),
});

export default function RacingLineHeroShell() {
  return <RacingLineHero />;
}
