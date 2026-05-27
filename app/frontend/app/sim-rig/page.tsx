import type { Metadata } from "next";
import Link from "next/link";

import SimRigPaddockNightShell from "../../components/SimRigPaddockNightShell";
import SimRigStream from "../../components/SimRigStream";

export const metadata: Metadata = {
  title: "Sim-rig live · APEX",
  description:
    "Live sim-rig telemetry tile demonstrating APEX consuming adaptive-controls telemetry at 20 Hz. Stretch S1 (Day 9 lock) pulled forward to Day 2 per galaxy-tier no-deferrals rule.",
};

const STRETCH_CONTEXT = `Stretch inclusion S1 in PLAN.md §18. Day 2 of build (today) ships against a
canned synthetic adaptive-controls GT4 lap stream so the live tile
is real on the demo video Day 10. Day 9 swap: this component connects to the
Vinh-lane WebSocket at GET /api/sim-rig/stream returning a SimRigFrame stream
per app/shared/types.ts. The render path does not change between simulated and
live modes, so the swap is a one-line prop change.`;

const CHANNEL_NOTES: ReadonlyArray<readonly [string, string]> = [
  [
    "Speed",
    "Vehicle speed in metres per second. The simulated lap encodes a mid-sector slow-hairpin slowdown around the 28-36 second mark of every 78-second loop.",
  ],
  [
    "Throttle / Brake",
    "Throttle in percent, brake in megapascals. The canned profile drops throttle and lifts brake through the slow-hairpin window; outside that window, throttle modulates against brake on a 3x oscillation.",
  ],
  [
    "Steering / Lat G",
    "Steering angle in radians (positive = right turn per shared/types.ts sign convention). Lateral G force in g, negative through left-handers, scaled higher through the hairpin section.",
  ],
  [
    "Long G",
    "Longitudinal acceleration in g. Approximated as (throttle - brake_pa / 5MPa) * 0.9. Useful as a sanity check on the throttle and brake channels visually.",
  ],
  [
    "Gear / RPM",
    "Engine RPM scaled with speed; gear bucketed against speed thresholds matched to a generic GT4 hand-controls setup used by the canned simulated stream.",
  ],
];

export default function SimRigPage() {
  return (
    <main id="main" className="flex flex-col">
      <SimRigPaddockNightShell>
      <header className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-14 lg:px-10 lg:py-20">
          <p className="apex-eyebrow">APEX · Live sim-rig demo · adaptive hand-controls</p>
          <h1 className="font-display text-5xl tracking-tight text-ink sm:text-6xl">
            Real telemetry, audited in flight.{" "}
            <em className="font-display italic text-accent">From the drivers who don&rsquo;t have a race engineer.</em>
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-ink-soft">
            A 20 Hz stream of adaptive hand-controls telemetry flowing into the APEX coaching
            loop. The tile ships a canned synthetic GT4 hand-controls lap so the demo flow
            renders end-to-end without a live rig. Live WebSocket swap point arrives via
            Vinh M3-V2 backend deploy.
          </p>
          <p className="font-mono text-xs text-muted">
            Adaptive hand-controls demo · GT4 sprint-series setup · circuit-agnostic synthetic layout.
          </p>
          <div className="mt-8 flex flex-col gap-3" aria-labelledby="dataset-selector-title">
            <p
              id="dataset-selector-title"
              className="font-mono text-[11px] uppercase tracking-wider text-muted"
            >
              FastF1 dataset selector · wave-47 G5 ship · M3-V11 swap-point
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "synthetic-gt4", label: "Synthetic GT4 (default)", live: true },
                { id: "hamilton-bahrain-2024-q", label: "Hamilton · Bahrain 2024 Q", live: false },
                { id: "leclerc-monza-2024-q", label: "Leclerc · Monza 2024 Q", live: false },
                { id: "verstappen-silverstone-2024-r", label: "Verstappen · Silverstone 2024 R", live: false },
                { id: "sainz-cota-2024-q", label: "Sainz · COTA 2024 Q", live: false },
                { id: "russell-spa-2024-r", label: "Russell · Spa 2024 R", live: false },
              ].map((dataset) => (
                <button
                  key={dataset.id}
                  type="button"
                  disabled={!dataset.live}
                  aria-pressed={dataset.live}
                  aria-label={
                    dataset.live
                      ? `${dataset.label} dataset is currently active`
                      : `${dataset.label} dataset pending Vinh M3-V11 .npz fixture deploy`
                  }
                  className={`rounded-sm border px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                    dataset.live
                      ? "border-racing-green bg-racing-green text-paper"
                      : "border-rule bg-paper-warm text-muted cursor-not-allowed"
                  }`}
                >
                  {dataset.label}
                  {!dataset.live && (
                    <span aria-hidden="true" className="ml-2 opacity-60">
                      [pending]
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="font-mono text-[10px] text-muted">
              Selector wired client-side; live FastF1 .npz fixture delivery + per-dataset
              stream endpoint land via Vinh M3-V11 backend deploy. Synthetic GT4 default
              ships canned + renders the demo flow end-to-end without backend.
            </p>
          </div>
        </div>
      </header>

      <section
        aria-labelledby="live-title"
        className="border-b border-rule bg-paper-warm"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <h2 id="live-title" className="font-display text-3xl tracking-tight text-ink">
            Live frame.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">
            Wave-44 Phase 6h: live HTTP-stream from /api/sim-rig/stream (NDJSON 20Hz
            via Vercel Fluid Compute ReadableStream). Per-frame parse + ring-buffer +
            disconnect-reconnect already in the existing client. Render path is identical
            to the simulated mode below + the Vinh M3-V2 WebSocket mode that follows.
          </p>
          <div className="mt-8 flex flex-col gap-6">
            <SimRigStream mode="httpStream" httpStreamUrl="/api/sim-rig/stream" />
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                In-memory simulated tile (control)
              </p>
              <SimRigStream mode="simulated" />
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="channels-title"
        className="border-b border-rule bg-paper"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <h2 id="channels-title" className="font-display text-3xl tracking-tight text-ink">
            What each channel encodes.
          </h2>
          <dl className="mt-8 flex flex-col gap-4">
            {CHANNEL_NOTES.map(([label, note]) => (
              <div
                key={label}
                className="rounded-sm border border-rule bg-paper-warm p-5"
              >
                <dt className="font-mono text-xs uppercase tracking-wider text-racing-green">
                  {label}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-soft">{note}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        aria-labelledby="context-title"
        className="border-b border-rule bg-paper-warm"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <h2 id="context-title" className="font-display text-3xl tracking-tight text-ink">
            Why ship this on Day 2.
          </h2>
          <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-relaxed text-ink-soft">
            {STRETCH_CONTEXT}
          </p>
          <p className="mt-6 font-mono text-xs text-muted">
            Source: PLAN.md §18 Stretch S1 + pre-mortem row 45 (galaxy-tier compounding lesson).
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/judges"
              className="rounded-sm border border-ink px-5 py-2 font-mono text-sm uppercase tracking-wider text-ink hover:bg-ink hover:text-paper"
            >
              Judges&rsquo; tour
            </Link>
            <Link
              href="/analyze"
              className="rounded-sm border border-racing-green bg-racing-green px-5 py-2 font-mono text-sm uppercase tracking-wider text-paper hover:bg-paper hover:text-racing-green"
            >
              Try the full pipeline
            </Link>
          </div>
        </div>
      </section>

      </SimRigPaddockNightShell>
      <footer className="bg-racing-green py-12 text-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 lg:px-10">
          <p className="apex-eyebrow text-paper-warm">APEX</p>
          <p className="font-display text-2xl">The race engineer for the drivers who do not have one.</p>
          <p className="mt-2 font-mono text-xs text-paper-warm">
            Apache 2.0 · github.com/StephenSook/apex · Built on IBM Granite
          </p>
        </div>
      </footer>
    </main>
  );
}
