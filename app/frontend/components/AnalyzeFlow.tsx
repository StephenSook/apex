"use client";

/**
 * AnalyzeFlow: client-side composition of Dropzone + CoachingReport.
 *
 * Day 2 ships against canned mock data because Vinh's backend lands Day 5-6.
 * The mock is a Sarah Reynolds (fictional persona) Donington Park Lap 17
 * report consistent with `docs/sarah-reynolds-persona.md` + the 3-min pitch
 * voiceover. When the backend ships, swap the `mockReport` for a real
 * `fetch("/api/analyze", { body: formData })` call returning `AnalyzeResponse`.
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { CoachingReport as CoachingReportType } from "../../shared/types";

import CoachingReport from "./CoachingReport";
import Dropzone, { type DropzoneSubmission } from "./Dropzone";

export default function AnalyzeFlow() {
  const [report, setReport] = useState<CoachingReportType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reportRef = useRef<HTMLDivElement | null>(null);
  const prevReportRef = useRef<CoachingReportType | null>(null);

  const handleAnalyze = useCallback(async (submission: DropzoneSubmission) => {
    setIsSubmitting(true);
    try {
      await delay(900);
      setReport(buildMockReport(submission));
    } catch (err) {
      // Day 5-6 swap: real fetch errors land here. Dropzone's onSubmit catch
      // is a secondary sink, but this primary catch surfaces a user-friendly
      // message instead of leaking JS exception details upward.
      setReport(null);
      if (err instanceof Error) throw err;
      throw new Error("APEX could not generate a coaching report. Check your network and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  useEffect(() => {
    // Focus-steal guard: only steal focus + scroll on the first report after a
    // null state. Resubmits update content in place without yanking focus from
    // wherever the user happens to be typing (e.g. the driver-id input).
    if (report && !prevReportRef.current && reportRef.current) {
      reportRef.current.focus();
      reportRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    prevReportRef.current = report;
  }, [report]);

  return (
    <>
      <Dropzone onAnalyze={handleAnalyze} isSubmitting={isSubmitting} />
      {report && (
        <div ref={reportRef} tabIndex={-1} className="outline-none">
          <CoachingReport report={report} />
          <EdgeModeCallout />
        </div>
      )}
    </>
  );
}

/**
 * Wave-38 Stream C cross-link: surfaces the WebGPU Granite Nano edge
 * mode (D-019 item 1 + D-021) on the /analyze response panel so
 * judges who interact with the live demo see the galaxy-tier
 * shouldn't-be-possible move + can navigate to /judges#edge-summary
 * for the in-browser inference card.
 */
function EdgeModeCallout() {
  return (
    <aside
      aria-labelledby="edge-mode-callout-title"
      className="mx-auto mt-8 flex max-w-6xl flex-col gap-3 rounded-sm border border-rule bg-paper-warm p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:mt-12"
    >
      <div className="flex flex-col gap-1">
        <p className="apex-eyebrow">D-019 item 1 · D-021 · galaxy-tier</p>
        <h3
          id="edge-mode-callout-title"
          className="font-display text-xl tracking-tight text-ink"
        >
          Try the in-browser edge mode.
        </h3>
        <p className="text-sm leading-relaxed text-ink-soft">
          The wave-38 build ships Granite 4.0 Nano 350M running directly in your browser via
          WebGPU + Transformers.js v4. The /judges page surfaces the live 5-state inference card
          (loading / ready / oom / offline / error) + the 30-line Newton friction-ellipse projector
          visualization. Edge inference is advisory per D-021 server-authoritative reconnect; the
          canonical APEX pipeline (this /analyze route) remains the source of truth.
        </p>
      </div>
      <Link
        href="/judges#edge-summary"
        className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-racing-green bg-paper px-4 py-2 font-mono text-xs uppercase tracking-wider text-racing-green transition-colors hover:bg-racing-green hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        Open edge demo
        <span aria-hidden="true">→</span>
      </Link>
    </aside>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildMockReport(submission: DropzoneSubmission): CoachingReportType {
  return {
    driver_id: submission.driver_id,
    corners: [
      {
        name: "Old Hairpin",
        sector: 2,
        current_delta_s: 0.34,
        recommendation:
          "Trail-brake the lever in two micro-presses rather than one. Your COA-derived c_overlap flag is set (from the approved hand-control hardware spec in your COA) so the brake-throttle simultaneity you are running through entry clears Stage 2; the lap loss is the lever-travel ramp at apex release. Reduce hand-lever brake travel by four millimetres at the secondary actuation point.",
        citations: [
          { fia_article: "Appendix L", coa_section: "Section 3(c) hardware spec" },
        ],
      },
      {
        name: "McLeans",
        sector: 1,
        current_delta_s: 0.08,
        recommendation:
          "Throttle pickup is two car-lengths late on entry. Steering angle peaks before throttle re-application; tighten the gap to recover most of the eighty-millisecond delta.",
        citations: [{ fia_article: "Appendix L", coa_section: "Section 1(a) hardware spec" }],
      },
      {
        name: "Coppice",
        sector: 3,
        current_delta_s: -0.05,
        recommendation:
          "Strong exit. Mid-corner throttle pickup is conservative by roughly five percent against your PB; you have margin to push without breaching the friction envelope.",
        citations: [{ fia_article: "Appendix L", coa_section: "Section 1(a) hardware spec" }],
      },
    ],
    tuning_delta: {
      parameter: "hand_lever_brake_travel",
      current: 38.0,
      recommended: 34.0,
      unit: "mm",
      citation: { fia_article: "Appendix L", coa_section: "Section 3(c) hardware spec" },
    },
    forecast: [
      { sector_idx: 0, mean: 47.42, low: 47.21, high: 47.66 },
      { sector_idx: 1, mean: 31.18, low: 31.02, high: 31.39 },
      { sector_idx: 2, mean: 28.91, low: 28.72, high: 29.18 },
      { sector_idx: 3, mean: 33.04, low: 32.81, high: 33.34 },
      { sector_idx: 4, mean: 26.77, low: 26.55, high: 27.02 },
      { sector_idx: 5, mean: 29.43, low: 29.20, high: 29.71 },
      { sector_idx: 6, mean: 35.12, low: 34.84, high: 35.45 },
      { sector_idx: 7, mean: 24.66, low: 24.48, high: 24.90 },
      { sector_idx: 8, mean: 30.55, low: 30.31, high: 30.84 },
      { sector_idx: 9, mean: 41.20, low: 40.92, high: 41.55 },
    ],
    audit: {
      verdict: "approve",
      reasoning_trace: [
        "Friction-ellipse check passed across all 10 mini-sectors; max load 0.92 mu * g.",
        "Bicycle-model tie between lateral G and steering angle within bounds across the lap.",
        "COA-derived c_overlap flag (from the approved hand-control hardware spec in Section 3(c) of the driver's COA) was set across the lap; Stage 2 feasibility filter cleared the brake-throttle simultaneity accordingly.",
        "Tuning delta of -4.0 mm hand-lever brake travel is within recommended manufacturer envelope and does not introduce a forward-Euler kinematic violation in the projected next session.",
      ],
      audit_id: `audit-${submission.driver_id}-${Date.now().toString(36)}`,
    },
    provenance: {
      model_versions: {
        granite_docling: "ibm-granite/granite-docling-258m",
        granite_vision: "ibm-granite/granite-vision-4.1-4b",
        granite_ttm: "ibm-granite/granite-timeseries-ttm-r2",
        granite_instruct: "ibm-granite/granite-4.1-8b-instruct",
        granite_guardian: "ibm-granite/granite-guardian-4.1-8b",
      },
      commit_sha: "0000000000000000000000000000000000000000",
      generated_at_iso: new Date().toISOString(),
    },
  };
}
