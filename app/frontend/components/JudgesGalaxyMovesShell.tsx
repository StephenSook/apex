"use client";

/**
 * Wave-44 deep-review code-reviewer BLOCKER #1 close-out: Client
 * Component wrapper for the 6 galaxy-moves dynamic-imports on
 * /judges. Per Next.js 16 docs (`node_modules/next/dist/docs/01-app/
 * 02-guides/lazy-loading.md:60`): "When a Server Component
 * dynamically imports a Client Component, automatic code splitting
 * is currently not supported." So the prior /judges Server Component
 * dynamic-imports (cascade-#24 close-out) shipped without the actual
 * code-split benefit Stephen booked from BLOCKER #2.
 *
 * Fix: this Client Component wrapper holds the dynamic-imports. The
 * /judges Server Component imports + renders this wrapper normally;
 * the wrapper executes dynamic() in a Client-Component context
 * which restores the code-split benefit (each dynamic-imported
 * component ships as a separate async chunk loaded on first paint).
 *
 * Hydration deferral was already preserved via the ssr:false-removed
 * cascade-#24 close-out; code-splitting is the additional win this
 * wrapper unlocks.
 */

import dynamic from "next/dynamic";

const LazyLoadingShim = () => (
  <div className="h-40 rounded-sm border border-rule bg-paper-warm motion-safe:animate-pulse" />
);

const ALoRAStatusBadge = dynamic(() => import("./ALoRAStatusBadge"), {
  ssr: false,
  loading: LazyLoadingShim,
});
const EAGLE3LatencyBadge = dynamic(() => import("./EAGLE3LatencyBadge"), {
  ssr: false,
  loading: LazyLoadingShim,
});
const GEPAEvolutionPanel = dynamic(() => import("./GEPAEvolutionPanel"), {
  ssr: false,
  loading: LazyLoadingShim,
});
const GraniteVisionParser = dynamic(() => import("./GraniteVisionParser"), {
  ssr: false,
  loading: LazyLoadingShim,
});
const TSPulseAnomalyPanel = dynamic(() => import("./TSPulseAnomalyPanel"), {
  ssr: false,
  loading: LazyLoadingShim,
});

export default function JudgesGalaxyMovesShell() {
  return (
    <div className="mt-8 flex flex-col gap-6">
      <ALoRAStatusBadge />
      <GEPAEvolutionPanel />
      <EAGLE3LatencyBadge />
      <TSPulseAnomalyPanel />
      <GraniteVisionParser />
    </div>
  );
}
