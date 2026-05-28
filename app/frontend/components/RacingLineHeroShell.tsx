"use client";

/**
 * RacingLineHeroShell: dynamic-import wrapper around the R3F-or-SVG hero
 * gate per the JudgesGalaxyMovesShell pattern (Next.js 16 ssr:false from
 * Server Component restriction per feedback_nextjs16_dynamic_ssr_false_client_only.md).
 *
 * Wave-52 R3F Phase 2 revision: dynamic-imports RacingLineHero3DGate
 * which itself layer-composes RacingLineHero SVG (always rendered) +
 * optional R3F canvas overlay + liquid-glass telemetry chips. The R3F
 * canvas mounts only when prefers-reduced-motion does NOT match AND
 * navigator.hardwareConcurrency is at least 4; reduce-motion + low-CPU
 * users see the SVG only.
 *
 * Loading skeleton mirrors the SVG hero aspect (10/9). The gate's own
 * SVG fallback is the reliable first-paint regardless of how long the
 * R3F chunk takes to load (SVG is statically imported inside the gate;
 * only the R3F canvas itself is deferred).
 *
 * Architecture per feedback_nextjs16_dynamic_ssr_false_client_only.md:
 * ssr:false only works inside a Client Component. This shell IS a
 * Client Component ("use client" first line + no async or server data).
 * The gate component it imports is also a Client Component for the
 * same reason. Both are pure client trees; the shell is the boundary
 * between the Server-Component landing page tree + the client R3F tree.
 *
 * Original RacingLineHero (SVG rev-5) is preserved in git as the
 * immediate revert path. It is still imported by RacingLineHero3DGate
 * as the static fallback and the loading state.
 */

import dynamic from "next/dynamic";

const SVGFallbackSkeleton = () => (
  <div
    className="aspect-[10/9] w-full animate-pulse rounded-sm border border-rule bg-paper-warm"
    role="status"
    aria-label="Loading racing line visualization"
  />
);

const RacingLineHero3DGate = dynamic(() => import("./RacingLineHero3DGate"), {
  ssr: false,
  loading: SVGFallbackSkeleton,
});

export default function RacingLineHeroShell() {
  return <RacingLineHero3DGate />;
}
