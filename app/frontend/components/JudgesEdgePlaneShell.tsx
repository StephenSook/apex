"use client";

/**
 * Wave-44 deep-review code-reviewer BLOCKER #1 close-out (companion
 * to JudgesGalaxyMovesShell): EdgeSummary lives in its own section
 * on /judges (D-019 item 1 / D-021 edge plane), separate from the
 * galaxy-moves cluster. This 1-component shell wraps the dynamic-
 * import so EdgeSummary + its WebGPU adapter probe defer until the
 * Edge-plane section enters view.
 */

import dynamic from "next/dynamic";

const EdgeSummary = dynamic(() => import("./EdgeSummary"), {
  ssr: false,
  loading: () => (
    <div className="h-40 rounded-sm border border-rule bg-paper-warm motion-safe:animate-pulse" />
  ),
});

export default function JudgesEdgePlaneShell() {
  return <EdgeSummary />;
}
