"use client";

/**
 * ApexCamPanel: animated real-time visualization of the APEX
 * coaching pipeline. Wave-45 Phase 5 Block C.2 close-out per the
 * ApexIQ competitor deep-dive steal-list item #4 (live ingestion
 * counter / pipeline proof). Mounts on /judges above galaxy-moves.
 *
 * 6-state pipeline animation (loops at 1.5s per stage = 9s loop):
 *   1. ingest      Telemetry frame arriving
 *   2. ttm         Granite TTM forecast firing (Vinh's fine-tune)
 *   3. projector   V2 cvxpylayers QP projection (D-050 byte-equality)
 *   4. guardian    Granite Guardian BYOC audit
 *   5. instruct    Granite 4.1 8B coaching narration
 *   6. provenance  Footer assembly (model SHAs + COA + FIA + audit_id)
 *
 * Each stage activates in sequence; ingest counter increments each
 * loop. motion-safe reduced-motion guard renders the static all-
 * lit frame instead of cycling.
 *
 * Pure UI visualization. No actual fetch + no Granite call. Demo
 * artifact proving the pipeline shape to judges in ~9 seconds.
 */

import { useEffect, useState } from "react";

type PipelineStage = "ingest" | "ttm" | "projector" | "guardian" | "instruct" | "provenance";

const STAGES: ReadonlyArray<{ readonly key: PipelineStage; readonly label: string; readonly detail: string }> = [
  { key: "ingest", label: "Ingest", detail: "Telemetry frame (50 Hz raw -> 1 Hz mini-sector aggregate)" },
  { key: "ttm", label: "TTM Forecast", detail: "Granite TimeSeries TTM r2.1 + D-010 Track 1 channel-mix decoder" },
  { key: "projector", label: "V2 Projector", detail: "cvxpylayers QP + engine-agnostic .to_text() per D-050" },
  { key: "guardian", label: "Guardian Audit", detail: "Granite Guardian 4.1 BYOC verdict + Convergence-14 lock" },
  { key: "instruct", label: "Instruct Narration", detail: "Granite 4.1 8B + HARD-COMPLIANCE scrubber post-call" },
  { key: "provenance", label: "Provenance", detail: "Footer: model SHAs + COA section + audit_id + commit" },
];

const TICK_MS = 1500;

export default function ApexCamPanel() {
  const [mounted, setMounted] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === "undefined") return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setActiveIdx((idx) => {
        const next = (idx + 1) % STAGES.length;
        if (next === 0) setFrameCount((f) => f + 1);
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [mounted]);

  // Pre-mount renders static all-lit frame (SSR-matching) per
  // feedback_useState_lazy_init_hydration_footgun rule.
  const effectiveActive = mounted ? activeIdx : 0;

  return (
    <section
      aria-labelledby="apex-cam-panel-title"
      aria-live="polite"
      className="flex flex-col gap-4 rounded-sm border-2 border-rule bg-paper p-5"
    >
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p className="apex-eyebrow">Pipeline visualization (real-time loop)</p>
          <h3
            id="apex-cam-panel-title"
            className="font-display text-2xl tracking-tight text-ink"
          >
            APEX-cam: the 60-second loop in 9 seconds.
          </h3>
        </div>
        <span className="rounded-sm border border-racing-green bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-racing-green">
          Loop {frameCount + 1}
        </span>
      </header>
      <p className="text-sm leading-relaxed text-ink-soft">
        Each stage activates in sequence. The full pipeline runs sub-60s on RTX 4060 per the G8 budget
        (Stage C verified ~1030 ms per D-030; V2 projector ~290 ms per iterate per D-050). What you
        see here is the architecture, paced for a judge tour.
      </p>
      <ol className="flex flex-col gap-2">
        {STAGES.map((stage, idx) => {
          const isActive = idx === effectiveActive;
          const isCompleted = idx < effectiveActive;
          return (
            <li
              key={stage.key}
              className={`flex items-baseline gap-3 rounded-sm border px-3 py-2 motion-safe:transition-colors ${
                isActive
                  ? "border-racing-green bg-paper-warm"
                  : isCompleted
                    ? "border-racing-green/40 bg-paper"
                    : "border-rule bg-paper"
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-block h-2 w-2 rounded-full motion-safe:transition-colors ${
                  isActive
                    ? "bg-racing-green motion-safe:animate-pulse"
                    : isCompleted
                      ? "bg-racing-green/60"
                      : "bg-rule"
                }`}
              />
              <span className={`font-display text-base ${isActive ? "text-ink" : "text-ink-soft"}`}>
                {stage.label}
              </span>
              <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted">
                {idx + 1} of {STAGES.length}
              </span>
              {isActive && (
                <span className="block flex-basis-full text-xs leading-snug text-ink-soft">
                  {stage.detail}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Cross-ref: <span className="text-ink-soft">paper §3 + §4.4 latency budget + D-019 5 shouldn&apos;t-be-possible moves + D-050 byte-equality lock</span>
      </p>
    </section>
  );
}
