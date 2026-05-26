import type { Metadata } from "next";
import Link from "next/link";

import TelemetryUploadPanel from "../../components/TelemetryUploadPanel";

/**
 * /upload page. Wave-46 D-058 Phase 7.5 close-out. Judge-uploadable
 * telemetry CSV surface. POST a 50 Hz telemetry CSV with the canonical
 * TelemetryRow header (t_session_s + throttle_pct + brake_pa +
 * steering_rad + rpm + lat_g + long_g + speed_mps + gear); server-side
 * strict parser returns row count + per-channel summary stats + a 5-
 * row head preview.
 *
 * Security floor (per route docstring): 5MB cap + content-type
 * allowlist + canonical-header check + per-row Number.isFinite guard +
 * row count cap 10000. Vercel Sandbox isolation deferred wave-46.5.
 *
 * Operator empathy: judges who run an adaptive racer or grassroots
 * club series can upload their own CSV + see APEX parse it inline. No
 * sign-in required.
 */

export const metadata: Metadata = {
  title: "Upload telemetry | APEX",
  description:
    "Upload a 50 Hz telemetry CSV to APEX. Strict parser + per-channel summary stats. Operator-empathy surface per Sookra Methodology Pillar 4.",
};

export default function UploadPage() {
  return (
    <main className="flex flex-col bg-paper text-ink">
      <section
        aria-labelledby="upload-telemetry-title"
        className="border-y border-rule bg-paper"
      >
        <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-20">
          <p className="apex-eyebrow">
            <Link href="/" className="hover:text-racing-green">Home</Link>
            {" / "}
            upload · wave-46 Phase 7.5 · operator-empathy surface
          </p>
          <h1
            id="upload-telemetry-title"
            className="mt-3 font-display text-4xl tracking-tight text-ink sm:text-5xl"
          >
            Upload your telemetry CSV.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-soft">
            APEX accepts a 50 Hz CSV in the canonical APEX-Bench schema (t_session_s +
            throttle_pct + brake_pa + steering_rad + rpm + lat_g + long_g + speed_mps + gear).
            Strict server-side parser returns row count + duration + per-channel
            summary stats (min / max / mean) + a 5-row head preview. 5 MB cap; 10 000
            row cap. No code execution, no cloud upload, no sign-in.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            Operator-empathy surface per Sookra Methodology Pillar 4. Adaptive racers + grassroots
            clubs upload their own session CSV + see APEX parse it inline. Vercel Sandbox
            isolation queued for wave-46.5; the wave-46 ship runs strict-parser + size + row
            caps as the security floor.
          </p>
          <div className="mt-8">
            <TelemetryUploadPanel />
          </div>
        </div>
      </section>
    </main>
  );
}
