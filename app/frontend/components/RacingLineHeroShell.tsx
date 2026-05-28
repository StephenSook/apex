"use client";

/**
 * RacingLineHeroShell: dynamic-import wrapper around RacingLineHero per the
 * JudgesGalaxyMovesShell pattern (Next.js 16 ssr:false from Server Component
 * restriction per feedback_nextjs16_dynamic_ssr_false_client_only.md).
 *
 * Server Components cannot directly use next/dynamic with ssr:false. The
 * fix is a Client Component shell that owns the dynamic import.
 *
 * Wave-52 R3F overlay reverted 2026-05-28 per Stephen screenshot review:
 * the R3F canvas at scene scale [-1, 1] did not align with the SVG viewBox
 * bounds. The R3F track ribbon + apex sphere rendered at the wrong scale
 * over the SVG, and the gate's liquid-glass telemetry chips overlapped
 * the SVG's built-in bottom telemetry strip (THROTTLE/BRAKE/STEER bars
 * already inside the SVG). Two systems competing for the same visual
 * surface = mess. Reverted to SVG-only shell. The RacingLineHero3DCanvas
 * + RacingLineHero3DGate files were removed in the same commit; the
 * @react-three/postprocessing + postprocessing deps remain in package.json
 * for future R3F iterations on a different surface (e.g. /sim-rig).
 *
 * The SVG hero (revision-5 cinematic) ships with its own orbital glow
 * rings + spark embers + cosmic halo + shutter sweep + telemetry strip;
 * it does not need an R3F overlay to be cinematic.
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
