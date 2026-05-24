import type { Metadata } from "next";
import Link from "next/link";

import StatusLiveIndicator from "../../components/StatusLiveIndicator";

export const metadata: Metadata = {
  title: "Status · APEX",
  description:
    "Live build + CI + demo health indicators for the APEX submission. Confidence signal during the IBM SkillsBuild May 2026 judging window.",
};

const STATIC_SIGNALS: ReadonlyArray<StaticSignal> = [
  {
    label: "Repository",
    value: "github.com/StephenSook/apex",
    href: "https://github.com/StephenSook/apex",
    tone: "racing-green",
  },
  {
    label: "License",
    value: "Apache 2.0",
    href: "https://github.com/StephenSook/apex/blob/main/LICENSE",
    tone: "racing-green",
  },
  {
    label: "Build window",
    value: "2026-05-20 to 2026-05-31",
    href: null,
    tone: "ink",
  },
  {
    label: "Submission deadline",
    value: "2026-05-31, 11:59 PM ET",
    href: null,
    tone: "amber",
  },
  {
    label: "Stack",
    value: "IBM Granite (8 tools) + Next.js 16 + FastAPI",
    href: "https://github.com/StephenSook/apex/blob/main/docs/architecture-spec.md",
    tone: "ink",
  },
  {
    label: "Judges' tour",
    value: "/judges",
    href: "/judges",
    tone: "racing-green",
  },
];

export default function StatusPage() {
  return (
    <main id="main" className="flex flex-col">
      <header className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-14 lg:px-10 lg:py-20">
          <p className="apex-eyebrow">APEX · Live status dashboard</p>
          <h1 className="font-display text-5xl tracking-tight text-ink sm:text-6xl">
            Health, at a glance.
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-ink-soft">
            Confidence signal for judges during the IBM SkillsBuild May 2026 evaluation
            window. CI + repository state surfaced live; demo + Hugging Face Space
            indicators settle in Day 9 to Day 11. No third-party uptime service in the
            loop, just the GitHub Actions API + the deploy targets.
          </p>
        </div>
      </header>

      <section
        aria-labelledby="live-title"
        className="border-b border-rule bg-paper-warm"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <h2 id="live-title" className="font-display text-3xl tracking-tight text-ink">
            Live CI signal.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">
            Polled from{" "}
            <Link
              href="https://github.com/StephenSook/apex/actions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-racing-green underline-offset-4 hover:underline"
            >
              GitHub Actions on main
            </Link>
            . Reload the page to re-fetch.
          </p>
          <div className="mt-8">
            <StatusLiveIndicator />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="static-title"
        className="border-b border-rule bg-paper"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <h2
            id="static-title"
            className="font-display text-3xl tracking-tight text-ink"
          >
            Static signals.
          </h2>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {STATIC_SIGNALS.map((signal) => (
              <SignalTile key={signal.label} signal={signal} />
            ))}
          </dl>
        </div>
      </section>

      <section
        aria-labelledby="pending-title"
        className="border-b border-rule bg-paper-warm"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <h2
            id="pending-title"
            className="font-display text-3xl tracking-tight text-ink"
          >
            Pending indicators.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">
            These signals turn live on the day their underlying service ships.
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            <li className="rounded-sm border border-rule bg-paper p-4">
              <p className="font-mono text-xs uppercase tracking-wider text-amber">
                Day 9 · Hugging Face Space health
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                /health 200 verifier wired in pre-submit-checks.sh Check 10; lights up
                once `APEX_HF_URL` is set.
              </p>
            </li>
            <li className="rounded-sm border border-rule bg-paper p-4">
              <p className="font-mono text-xs uppercase tracking-wider text-amber">
                Day 5 · Vercel deploy URL
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                apex-one-black.vercel.app (canonical; cutover landed wave-38 2026-05-23);
                apex-race.vercel.app remains as a Vercel-served alias for the
                pre-cutover preview history. curl -sI uptime probe.
              </p>
            </li>
            <li className="rounded-sm border border-rule bg-paper p-4">
              <p className="font-mono text-xs uppercase tracking-wider text-amber">
                Day 10 · Demo video
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                3-minute pitch + 30-second highlight clip both committed to{" "}
                <code>deliverables/</code>.
              </p>
            </li>
          </ul>
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

interface StaticSignal {
  readonly label: string;
  readonly value: string;
  readonly href: string | null;
  readonly tone: SignalTone;
}

type SignalTone = "racing-green" | "ink" | "amber" | "accent";

const SIGNAL_TONE_CLASS: Record<SignalTone, string> = {
  "racing-green": "text-racing-green",
  ink: "text-ink",
  amber: "text-amber",
  accent: "text-accent",
};

function SignalTile({ signal }: { signal: StaticSignal }) {
  const valueClass = SIGNAL_TONE_CLASS[signal.tone];

  const inner = (
    <article className="flex h-full flex-col gap-2 rounded-sm border border-rule bg-paper-warm p-5">
      <dt className="font-mono text-xs uppercase tracking-wider text-muted">
        {signal.label}
      </dt>
      <dd className={`font-mono text-base ${valueClass} break-all`}>{signal.value}</dd>
    </article>
  );

  if (!signal.href) return inner;
  if (signal.href.startsWith("/")) {
    return (
      <Link href={signal.href} className="block focus-visible:outline-none">
        {inner}
      </Link>
    );
  }
  return (
    <Link
      href={signal.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block focus-visible:outline-none"
    >
      {inner}
    </Link>
  );
}
