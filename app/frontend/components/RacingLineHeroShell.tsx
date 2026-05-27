"use client";

/**
 * RacingLineHeroShell: dynamic-import wrapper around RacingLineHero per the
 * JudgesGalaxyMovesShell pattern (Next.js 16 ssr:false from Server Component
 * restriction per feedback_nextjs16_dynamic_ssr_false_client_only.md).
 *
 * Server Components cannot directly use next/dynamic with ssr:false. The
 * fix is a Client Component shell that owns the dynamic import. This
 * preserves the ~120KB R3F + three lazy-chunk benefit without blocking the
 * initial bundle on Three.js.
 *
 * Wave-46 Phase B2 ship.
 */

import dynamic from "next/dynamic";

const RacingLineHero = dynamic(() => import("./RacingLineHero"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full aspect-square bg-paper-warm rounded-sm border border-rule animate-pulse"
      role="status"
      aria-label="Loading 3D racing-line visualization"
    />
  ),
});

export default function RacingLineHeroShell() {
  return <RacingLineHero />;
}
