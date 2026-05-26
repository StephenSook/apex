import type { Metadata } from "next";
import Link from "next/link";

import AnalyzeFlow from "../../components/AnalyzeFlow";
import TelemetryUploadPanel from "../../components/TelemetryUploadPanel";

export const metadata: Metadata = {
  title: "Analyze · APEX",
  description:
    "Upload your telemetry, FIA Certificate of Adaptations, and a sentence of debrief. APEX returns a corner-by-corner coaching report inside two minutes.",
};

export default function AnalyzePage() {
  return (
    <>
      <main id="main" className="flex flex-col">
        <Breadcrumb />
        <AnalyzeFlow />
        <section
          aria-labelledby="analyze-upload-title"
          className="border-t border-rule bg-paper-warm"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 lg:px-10 lg:py-16">
            <header>
              <p className="apex-eyebrow">Bring your own session</p>
              <h2
                id="analyze-upload-title"
                className="font-display text-3xl tracking-tight text-ink"
              >
                Or drop a custom telemetry CSV.
              </h2>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-soft">
                Drag a session CSV onto the panel below to run it through the APEX strict
                parser. No sign-in. Files stay on the apex-one-black Vercel deploy. Five MB +
                ten-thousand row cap; canonical APEX-Bench header schema per
                <span className="font-mono text-xs text-racing-green"> app/shared/types.ts</span>.
              </p>
            </header>
            <TelemetryUploadPanel />
          </div>
        </section>
      </main>
    </>
  );
}

function Breadcrumb() {
  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b border-rule bg-paper"
    >
      <ol className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-4 font-mono text-xs uppercase tracking-wider text-muted lg:px-10">
        <li>
          <Link href="/" className="hover:text-racing-green underline-offset-4 hover:underline">
            APEX
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="text-ink">Analyze</li>
      </ol>
    </nav>
  );
}
