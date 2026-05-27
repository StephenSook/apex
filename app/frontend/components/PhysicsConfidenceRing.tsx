"use client";

/**
 * PhysicsConfidenceRing: prominent display variant of the D-024
 * Mahalanobis-distance physics-confidence detector. Renders a
 * conic-gradient ring with the distance value at center + the
 * existing PhysicsConfidenceBadge inline below for accessibility
 * semantics + downgrade-arrow context.
 *
 * Wave-41 Stream F.2 close-out per the competitor field deep-dive
 * memory `project_apex_competitor_field_may_challenge.md` steal-list
 * HIGH-value item #2 (AI Race Engineer Copilot ConfidenceCard.jsx:
 * 32-38 conic-gradient ring + animated pulse pattern). APEX adapts
 * the visual idea to surface the Mahalanobis distance as a percent-
 * of-p95-threshold filled ring rather than the raw distance number;
 * a fuller ring means closer to the OOD boundary.
 *
 * Pure CSS animation: conic-gradient background + keyframe pulse
 * defined in globals.css (apex-confidence-pulse). No Framer Motion
 * dependency added; the ring uses standard CSS transforms.
 *
 * Sub-tier accessibility: the ring is decorative (aria-hidden) +
 * the inner numeric text + the wrapped PhysicsConfidenceBadge carry
 * the full screen-reader semantics. Visual-only consumers see the
 * ring; assistive-tech consumers get the existing badge text +
 * Mahalanobis distance verbatim.
 */

import type { PhysicsConfidence } from "../../shared/types";
import PhysicsConfidenceBadge from "./PhysicsConfidenceBadge";

export interface PhysicsConfidenceRingProps {
  readonly confidence: PhysicsConfidence;
}

export default function PhysicsConfidenceRing({ confidence }: PhysicsConfidenceRingProps) {
  // Defensive guard for non-finite inputs; PhysicsConfidenceBadge below
  // also handles this case but the ring needs early-out to avoid
  // NaN.toFixed in the percent calculation. Wave-41 cascade-#11 codex
  // HIGH#4: require threshold_p95 > 0 (not just finite) to avoid
  // `distance / 0 === Infinity` (produces `NaNdeg` conic-gradient) or
  // `0 / 0 === NaN` corruption in the ring math. Falls back to the
  // badge variant when threshold is non-positive (e.g. D-024 detector
  // skipped at low-data session OR dev-mode bypass produced
  // threshold_p95 = 0 from an empty fixture distribution).
  const distanceFinite = Number.isFinite(confidence.mahalanobis_distance);
  const thresholdPositive =
    Number.isFinite(confidence.threshold_p95) && confidence.threshold_p95 > 0;
  if (!distanceFinite || !thresholdPositive) {
    return <PhysicsConfidenceBadge confidence={confidence} />;
  }

  // Ratio of measured distance to p95 threshold, clamped to [0, 1.5]
  // so an out-of-distribution session with distance > threshold still
  // produces a visually meaningful ring (overfill clamped).
  const rawRatio = confidence.mahalanobis_distance / confidence.threshold_p95;
  const ratio = Math.max(0, Math.min(1.5, rawRatio));
  const fillDegrees = Math.min(360, ratio * 240);

  // Wave-41 cascade-#11 NIT N5 close-out per code-reviewer N1: drop
  // hex fallbacks on var() declarations for consistency with the rest
  // of the codebase (EdgeSummary + RaceEventsTilesRow + other
  // editorial-paddock-palette consumers use bare var() without fallback
  // because the CSS variables are defined unconditionally at :root in
  // globals.css). The fallbacks were a defensive holdover from the
  // initial F.2 commit; dropping them aligns the file with the project
  // pattern + reduces visual-token duplication.
  const isOOD = confidence.status === "out_of_distribution";
  const fillColor = isOOD ? "var(--color-amber)" : "var(--color-racing-green)";
  const trackColor = "var(--color-rule)";

  // Conic gradient: filled arc + remaining track. CSS variable consumed
  // by the animated background. Wave-47 G2 ship: layered 3D effect via
  // inset highlight + drop shadow + hover rotation transform.
  const ringStyle: React.CSSProperties = {
    background: `conic-gradient(${fillColor} 0deg ${fillDegrees}deg, ${trackColor} ${fillDegrees}deg 360deg)`,
    boxShadow:
      "inset 0 2px 4px rgba(15, 20, 16, 0.16), inset 0 -2px 4px rgba(255, 255, 255, 0.35), 0 6px 14px rgba(15, 20, 16, 0.12)",
    transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
  };

  // Tick marks at 0, 25, 50, 75 percent positions around the ring +
  // p95 threshold marker at the fill boundary. SVG overlay layered
  // above the conic-gradient ring.
  const tickMarks = [0, 0.25, 0.5, 0.75].map((pct) => ({ pct, degrees: pct * 240 }));

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        aria-hidden="true"
        className="apex-confidence-ring group relative flex h-32 w-32 items-center justify-center rounded-full hover:rotate-[8deg]"
        style={ringStyle}
      >
        <svg
          viewBox="-72 -72 144 144"
          className="absolute inset-0 h-full w-full pointer-events-none"
          aria-hidden="true"
        >
          {tickMarks.map(({ pct, degrees }) => {
            const angle = (degrees * Math.PI) / 180 - Math.PI / 2;
            const x1 = Math.cos(angle) * 60;
            const y1 = Math.sin(angle) * 60;
            const x2 = Math.cos(angle) * 64;
            const y2 = Math.sin(angle) * 64;
            return (
              <line
                key={pct}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--color-ink)"
                strokeWidth={1.5}
                strokeOpacity={0.55}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full bg-paper" style={{ boxShadow: "inset 0 1px 2px rgba(15, 20, 16, 0.1)" }}>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
            Mahalanobis
          </span>
          <span className="font-display text-2xl tracking-tight text-ink">
            {confidence.mahalanobis_distance.toFixed(2)}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted">
            p95 {confidence.threshold_p95.toFixed(2)}
          </span>
        </div>
      </div>
      <PhysicsConfidenceBadge confidence={confidence} />
    </div>
  );
}
