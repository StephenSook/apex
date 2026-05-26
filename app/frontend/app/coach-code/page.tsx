import type { Metadata } from "next";
import Link from "next/link";

import CoachCodePanel from "../../components/CoachCodePanel";

/**
 * /coach-code page. Wave-46 D-058 Phase 6.2.B close-out. Granite 4.1
 * 8B Instruct code-feedback surface for engineers building telemetry
 * tools. Demonstrates breadth of the IBM Granite stack beyond the
 * race-engineer narrator path (Granite Code 8B was DEPRECATED per HF
 * model card 2026; Granite 4.1 8B mainline supersedes per the wave-46
 * D-058 tier-1 research finding).
 *
 * Page is a Server Component shell with metadata; the interactive form
 * + LLM output display lives in `CoachCodePanel` Client Component
 * (POSTs to /api/coach-code which scrubs invented FIA Article numbers
 * server-side per `feedback_llm_output_compliance_scrubber.md`).
 */

export const metadata: Metadata = {
  title: "Coach code | APEX",
  description:
    "Granite 4.1 8B Instruct code-feedback for engineers building telemetry tools. HARD-COMPLIANCE scrubber stripping invented FIA Article numbers from LLM output server-side.",
};

export default function CoachCodePage() {
  return (
    <main className="flex flex-col bg-paper text-ink">
      <section
        aria-labelledby="coach-code-title"
        className="border-y border-rule bg-paper"
      >
        <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-20">
          <p className="apex-eyebrow">
            <Link href="/" className="hover:text-racing-green">Home</Link>
            {" / "}
            coach-code · wave-46 Phase 6.2 · Granite 4.1 8B Instruct
          </p>
          <h1
            id="coach-code-title"
            className="mt-3 font-display text-4xl tracking-tight text-ink sm:text-5xl"
          >
            Coach your telemetry code.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-soft">
            Paste a snippet from your telemetry pipeline. Ask a question about how
            it integrates with the APEX three-layer architecture (frozen Granite
            TimeSeries TTM forecaster + V2 cvxpylayers projector + Granite Guardian
            audit). Granite 4.1 8B Instruct returns concise text feedback. HARD-COMPLIANCE
            scrubber strips any hallucinated FIA Article numbers + COA Section numbers
            server-side per `feedback_llm_output_compliance_scrubber.md`.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            No code execution. Text feedback only. Granite Code 8B was deprecated per
            HF model card; Granite 4.1 8B Instruct supersedes (HumanEval 87.2% pass@1).
          </p>
          <div className="mt-8">
            <CoachCodePanel />
          </div>
        </div>
      </section>
    </main>
  );
}
