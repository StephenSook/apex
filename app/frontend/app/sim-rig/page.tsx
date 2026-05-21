import type { Metadata } from "next";
import Link from "next/link";

import SimRigStream from "../../components/SimRigStream";

export const metadata: Metadata = {
  title: "Sim-rig live · APEX",
  description:
    "Live sim-rig telemetry tile demonstrating APEX consuming adaptive-controls telemetry at 20 Hz. Stretch S1 (Day 9 lock) pulled forward to Day 2 per galaxy-tier no-deferrals rule.",
};

const STRETCH_CONTEXT = `Stretch inclusion S1 in PLAN.md §18. Day 2 of build (today) ships against a
canned synthetic Sarah Reynolds Donington Park lap-17 stream so the live tile
is real on the demo video Day 10. Day 9 swap: this component connects to the
Vinh-lane WebSocket at GET /api/sim-rig/stream returning a SimRigFrame stream
per app/shared/types.ts. The render path does not change between simulated and
live modes, so the swap is a one-line prop change.`;

const CHANNEL_NOTES: ReadonlyArray<readonly [string, string]> = [
  [
    "Speed",
    "Vehicle speed in metres per second. The simulated lap encodes a Sector 2 Old Hairpin slowdown around the 28-36 second mark of every 78-second loop.",
  ],
  [
    "Throttle / Brake",
    "Throttle in percent, brake in megapascals. The canned profile drops throttle and lifts brake through the Old Hairpin window; outside that window, throttle modulates against brake on a 3x oscillation.",
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
    "Engine RPM scaled with speed; gear bucketed against speed thresholds matched to the BMW M240i Britcar setup that the Sarah Reynolds persona races.",
  ],
];

export default function SimRigPage() {
  return (
    <main id="main" className="flex flex-col">
      <header className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-14 lg:px-10 lg:py-20">
          <p className="apex-eyebrow">APEX · Live sim-rig demo</p>
          <h1 className="font-display text-5xl tracking-tight text-ink sm:text-6xl">
            Real telemetry, audited in flight.
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-ink-soft">
            A 20 Hz stream of adaptive-controls telemetry flowing into the APEX coaching
            loop. Day 2 ships a canned synthetic Sarah Reynolds Donington Park lap so the
            tile is animated for the 3-minute demo video. Day 9 swaps in a live WebSocket
            from the sim rig.
          </p>
          <p className="font-mono text-xs text-muted">
            Hand-controls demo · BMW M240i Britcar Trophy 2026 setup · Donington Park GP layout.
          </p>
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
            Synthetic stream. Real shape. The render path is identical to the live mode
            that lands Day 9.
          </p>
          <div className="mt-8">
            <SimRigStream mode="simulated" />
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
