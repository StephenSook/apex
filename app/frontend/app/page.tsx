import Link from "next/link";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex flex-col flex-1">
        <Hero />
        <SarahMoment />
        <Architecture />
        <Differentiators />
        <BuildStatus />
        <StackBadges />
      </main>
      <SiteFooter />
    </>
  );
}

/* -------------------------------------------------------------- */
/* Header                                                          */
/* -------------------------------------------------------------- */
function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-10">
        <Link
          href="/"
          aria-label="APEX home"
          className="group flex items-baseline gap-2"
        >
          <span className="font-display text-2xl font-medium tracking-tight text-ink">
            APEX
          </span>
          <span className="font-display italic text-2xl text-accent group-hover:text-racing-green transition-colors">
            .race
          </span>
        </Link>
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-8 font-sans text-sm text-ink-soft">
          <a href="#hero" className="hover:text-racing-green underline-offset-4 hover:underline">
            What it is
          </a>
          <a href="#architecture" className="hover:text-racing-green underline-offset-4 hover:underline">
            Architecture
          </a>
          <a href="#status" className="hover:text-racing-green underline-offset-4 hover:underline">
            Build status
          </a>
          <Link
            href="https://github.com/StephenSook/apex"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm border border-racing-green px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-racing-green hover:bg-racing-green hover:text-paper transition-colors"
          >
            GitHub
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------- */
/* Hero                                                            */
/* -------------------------------------------------------------- */
function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden border-b border-rule"
      aria-labelledby="hero-title"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-28">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <p className="apex-eyebrow apex-rise" style={{ "--apex-delay": "0ms" } as React.CSSProperties}>
            IBM SkillsBuild · May Challenge 2026 · Day 1 of 12
          </p>
          <h1
            id="hero-title"
            className="font-display text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl apex-rise"
            style={{ "--apex-delay": "120ms" } as React.CSSProperties}
          >
            The race engineer for the drivers who{" "}
            <em className="font-display italic text-accent">don&rsquo;t have one.</em>
          </h1>
          <p
            className="max-w-xl text-lg leading-relaxed text-ink-soft apex-rise"
            style={{ "--apex-delay": "240ms" } as React.CSSProperties}
          >
            A pro race engineer costs roughly{" "}
            <span className="font-mono text-base text-ink">£400 to £500</span> a day.
            Every F1 driver has one. Most adaptive racers, veteran-team drivers, and
            grassroots competitors do not. APEX puts the same IBM Granite stack that
            ships to Scuderia Ferrari&rsquo;s ~400 million fans in the hands of the
            drivers who need a race engineer the most.
          </p>
          <div
            className="flex flex-wrap gap-3 pt-2 apex-rise"
            style={{ "--apex-delay": "360ms" } as React.CSSProperties}
          >
            <a
              href="#sarah"
              className="inline-flex items-center gap-2 rounded-sm bg-racing-green px-5 py-3 font-mono text-xs uppercase tracking-wider text-paper transition-transform hover:translate-y-[-1px] hover:bg-racing-green-deep"
            >
              See the demo case
              <span aria-hidden="true">↓</span>
            </a>
            <Link
              href="https://github.com/StephenSook/apex/blob/main/PLAN.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-ink/15 bg-paper-warm px-5 py-3 font-mono text-xs uppercase tracking-wider text-ink transition-colors hover:border-ink/40"
            >
              Read PLAN.md
            </Link>
          </div>
          <p
            className="pt-4 font-mono text-xs text-muted apex-rise"
            style={{ "--apex-delay": "480ms" } as React.CSSProperties}
          >
            Submission deadline 2026-05-31 · IBM Granite + watsonx + Bob · Apache 2.0
          </p>
        </div>

        {/* Hero visual: hand-coded SVG racing line on a corner, with annotated
            apex point. Editorial paddock note, not a generic AI illustration. */}
        <figure
          className="lg:col-span-5 self-center apex-rise"
          style={{ "--apex-delay": "600ms" } as React.CSSProperties}
          aria-label="A racing line through a corner with the apex point marked"
        >
          <svg
            viewBox="0 0 480 540"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            role="img"
          >
            <defs>
              <linearGradient id="track" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--racing-green)" stopOpacity="0.85" />
                <stop offset="100%" stopColor="var(--racing-green)" stopOpacity="0.35" />
              </linearGradient>
              <pattern id="grain" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.4" fill="var(--ink)" opacity="0.05" />
              </pattern>
            </defs>

            {/* Background grain panel */}
            <rect x="0" y="0" width="480" height="540" fill="var(--paper-warm)" />
            <rect x="0" y="0" width="480" height="540" fill="url(#grain)" />

            {/* Track silhouette: a stylised right-hander */}
            <path
              d="M 60 60 Q 60 280 200 320 Q 360 360 400 480"
              stroke="url(#track)"
              strokeWidth="42"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 60 60 Q 60 280 200 320 Q 360 360 400 480"
              stroke="var(--paper)"
              strokeWidth="2"
              strokeDasharray="6 8"
              fill="none"
              strokeLinecap="round"
            />

            {/* The racing line: tighter radius, kissing the apex */}
            <path
              d="M 110 60 Q 110 250 240 270 Q 360 290 380 480"
              stroke="var(--accent)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="3 4"
            />

            {/* Apex point */}
            <circle cx="240" cy="270" r="6" fill="var(--accent)" />
            <circle cx="240" cy="270" r="14" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.4" />

            {/* Labels */}
            <text
              x="270"
              y="266"
              fontFamily="var(--font-mono)"
              fontSize="13"
              fill="var(--ink)"
              letterSpacing="0.12em"
            >
              APEX
            </text>
            <text
              x="270"
              y="282"
              fontFamily="var(--font-mono)"
              fontSize="10"
              fill="var(--muted)"
            >
              T7 entry, Lap 17
            </text>

            <text
              x="60"
              y="44"
              fontFamily="var(--font-mono)"
              fontSize="10"
              fill="var(--muted)"
              letterSpacing="0.18em"
            >
              BRAKING
            </text>
            <text
              x="400"
              y="500"
              fontFamily="var(--font-mono)"
              fontSize="10"
              fill="var(--muted)"
              letterSpacing="0.18em"
              textAnchor="end"
            >
              EXIT
            </text>

            {/* Margin note */}
            <text
              x="60"
              y="510"
              fontFamily="var(--font-fraunces)"
              fontStyle="italic"
              fontSize="14"
              fill="var(--ink-soft)"
            >
              The line is where lap time lives.
            </text>
          </svg>
        </figure>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- */
/* Sarah Reynolds moment                                            */
/* -------------------------------------------------------------- */
function SarahMoment() {
  return (
    <section
      id="sarah"
      className="border-b border-rule bg-paper-warm"
      aria-labelledby="sarah-title"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
        <div className="lg:col-span-4 flex flex-col gap-3">
          <p className="apex-eyebrow">Hero use case</p>
          <h2
            id="sarah-title"
            className="font-display text-3xl leading-tight text-ink"
          >
            What the driver brings to APEX.
          </h2>
          <p className="text-base text-ink-soft leading-relaxed">
            Sarah Reynolds. Thirty-four. RAF veteran. Left-leg amputee from a 2021
            service incident. Britcar Trophy 2026, #34 BMW M240i with leading UK adaptive hand-control supplier
            electronic hand-controls and FIA Article 18.3 Certificate of Adaptations
            on file. Donington Park GP. Saturday qualifying. Lap 17 of 19.
          </p>
          <p className="pt-4 font-mono text-xs uppercase tracking-wider text-muted">
            Persona is fictional by design. No real driver named without consent.
          </p>
        </div>
        <blockquote className="lg:col-span-8 relative">
          <span
            aria-hidden="true"
            className="absolute -left-2 -top-6 font-display italic text-7xl text-accent/70 select-none"
          >
            &ldquo;
          </span>
          <p className="font-display text-3xl italic leading-snug text-ink sm:text-4xl lg:text-[2.4rem]">
            Lost the rears mid-Old Hairpin again. Can&rsquo;t trail-brake on the lever
            the way I did at Croft last month. Sector 2 was plus zero point three four
            against my PB.
          </p>
          <footer className="mt-6 flex flex-wrap items-baseline gap-3 text-sm text-muted">
            <span className="font-mono uppercase tracking-wider">Driver debrief</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">2026-05-23 14:02 BST</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">DEL +0.34s S2</span>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- */
/* Architecture (PhysicsTTM three layers)                            */
/* -------------------------------------------------------------- */
function Architecture() {
  const layers: Array<{
    n: string;
    name: string;
    by: string;
    body: string;
    detail: string;
  }> = [
    {
      n: "01",
      name: "Frozen forecaster",
      by: "Granite TimeSeries TTM r2.1",
      body:
        "A pretrained, sub-1M parameter time-series foundation model. Outperforms several larger TSFMs in the NeurIPS 2024 benchmarks on common forecasting tasks. We do not retrain. We aggregate raw 50 Hz telemetry to 1 Hz mini-sector tensors that sit inside the model&rsquo;s published support envelope.",
      detail: "frozen · zero-shot · channel-independent",
    },
    {
      n: "02",
      name: "Differentiable physics projection",
      by: "CvxpyLayers QP",
      body:
        "Every forecast step passes through a QP that enforces the friction ellipse, the bicycle model, a forward-Euler kinematic step, a jerk bound, and a circuit-conditional friction lookup. Plus the COA simultaneity flag. When the driver&rsquo;s Certificate of Adaptations permits simultaneous brake and throttle, we permit it. Otherwise enforce.",
      detail: "differentiable · COA-aware · V1 constant-mu, V2 Pacejka",
    },
    {
      n: "03",
      name: "Safety-classifier text audit",
      by: "Granite Guardian 4.1 8B (BYOC)",
      body:
        "The projection layer emits a structured English text log of every constraint correction. Guardian audits the log against custom Bring-Your-Own-Classifier rules. A unit-test suite covering every kinematic violation type backs the serializer (Convergence 14, our load-bearing safety contract). Reasoning trace surfaces in the UI.",
      detail: "text audit · serializer-tested · think-mode visible",
    },
  ];

  return (
    <section
      id="architecture"
      className="border-b border-rule"
      aria-labelledby="arch-title"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10 lg:py-24">
        <div className="mb-12 flex flex-col gap-3 max-w-3xl">
          <p className="apex-eyebrow">PhysicsTTM, three layers</p>
          <h2
            id="arch-title"
            className="font-display text-4xl leading-tight text-ink sm:text-5xl"
          >
            We didn&rsquo;t train a custom PINN.
            <br />
            <em className="italic text-racing-green">
              We constrained an off-the-shelf TSFM.
            </em>
          </h2>
          <p className="text-base text-ink-soft leading-relaxed pt-2">
            TTM was pretrained on weather and retail. Without constraints it can
            forecast 4G lateral with zero steering, or speed climbing with the
            throttle at zero. APEX inserts a differentiable physics layer between
            the forecaster and the report. To our knowledge no prior published work
            does this for vehicle dynamics without retraining the model from
            scratch.
          </p>
        </div>

        <ol className="grid gap-6 lg:grid-cols-3">
          {layers.map((l, i) => (
            <li
              key={l.n}
              className="apex-rise flex flex-col gap-4 rounded-sm border border-rule bg-paper-warm p-6 lg:p-7"
              style={{ "--apex-delay": `${i * 100}ms` } as React.CSSProperties}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-5xl italic text-accent">
                  {l.n}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  layer
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-2xl leading-snug text-ink">
                  {l.name}
                </h3>
                <p className="font-mono text-xs uppercase tracking-wider text-racing-green">
                  {l.by}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">{l.body}</p>
              <p className="mt-auto pt-3 border-t border-rule font-mono text-[11px] tracking-wider text-muted">
                {l.detail}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- */
/* Differentiators                                                  */
/* -------------------------------------------------------------- */
function Differentiators() {
  const items: Array<{ n: string; lead: string; body: string }> = [
    {
      n: "01",
      lead:
        "First pretrained time-series foundation model on motorsport telemetry.",
      body:
        "vs Deep Dynamics, which trains a bespoke PINN from scratch; vs Chronos-on-car-following, which uses a different forecaster on different inputs. We freeze TTM and wrap it.",
    },
    {
      n: "02",
      lead:
        "First AI to ingest the FIA Certificate of Adaptations as a binding safety envelope.",
      body:
        "Article 18.3 of Appendix L is the authoritative document. APEX reads it at the tensor level, not as regulatory background.",
    },
    {
      n: "03",
      lead:
        "First integrated workflow for adaptive driver hand-control channels.",
      body:
        "COA-parameterized brake-throttle simultaneity. Competing tools assume able-bodied physics and systematically misdiagnose adaptive drivers.",
    },
    {
      n: "04",
      lead:
        "Granite Guardian with BYOC custom rules, backed by a serializer unit-test suite.",
      body:
        "Convergence 14: every kinematic violation type has a fixture text log and a verified Guardian verdict. Safety-critical code with safety-critical test coverage.",
    },
    {
      n: "05",
      lead:
        "Eight IBM Granite tools, every one load-bearing, IBM Bob in the build loop.",
      body:
        "Per the IBM × Scuderia Ferrari case-study precedent. We commit Bob session logs to the repo.",
    },
  ];

  return (
    <section
      className="border-b border-rule bg-racing-green text-paper"
      aria-labelledby="diff-title"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10 lg:py-24">
        <div className="mb-12 flex flex-col gap-3 max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/55">
            What makes it different
          </p>
          <h2
            id="diff-title"
            className="font-display text-4xl leading-tight sm:text-5xl"
          >
            Five claims. <em className="italic text-amber">Each independently verifiable.</em>
          </h2>
        </div>

        <ol className="grid gap-px bg-paper/10 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((it, i) => (
            <li
              key={it.n}
              className="apex-rise flex flex-col gap-3 bg-racing-green p-6 lg:p-7"
              style={{ "--apex-delay": `${i * 80}ms` } as React.CSSProperties}
            >
              <span className="font-display text-3xl italic text-amber">
                {it.n}
              </span>
              <h3 className="font-display text-xl leading-snug">{it.lead}</h3>
              <p className="text-sm leading-relaxed text-paper/75">{it.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- */
/* Build status                                                     */
/* -------------------------------------------------------------- */
function BuildStatus() {
  const phases = [
    { n: "0", label: "Bootstrap", day: "Day 1", state: "in progress" as const },
    { n: "1", label: "Document parsing", day: "Day 2", state: "pending" as const },
    { n: "2", label: "Physics layer", day: "Days 3-5", state: "pending" as const },
    { n: "3", label: "Narrator", day: "Day 6", state: "pending" as const },
    { n: "4", label: "Orchestration + polish", day: "Days 7-8", state: "pending" as const },
    { n: "5", label: "Demo + deploy", day: "Days 9-10", state: "pending" as const },
    { n: "6", label: "Submission package", day: "Day 11", state: "pending" as const },
    { n: "7", label: "Submit", day: "Day 12 (2026-05-31)", state: "pending" as const },
  ];

  return (
    <section
      id="status"
      className="border-b border-rule"
      aria-labelledby="status-title"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10 lg:py-24">
        <div className="mb-12 flex flex-col gap-3 max-w-3xl">
          <p className="apex-eyebrow">Build status</p>
          <h2
            id="status-title"
            className="font-display text-4xl leading-tight text-ink sm:text-5xl"
          >
            Day 1 of 12, in public.
          </h2>
          <p className="text-base text-ink-soft leading-relaxed pt-2">
            Every commit lands on{" "}
            <Link
              href="https://github.com/StephenSook/apex"
              target="_blank"
              rel="noopener noreferrer"
              className="text-racing-green underline underline-offset-4 hover:text-accent"
            >
              the main branch
            </Link>{" "}
            atomic. No git hooks. No CLI wrappers. Coordination is manual, per the
            convention that worked on Trace and Hometown.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <ul className="lg:col-span-7 flex flex-col divide-y divide-rule border-y border-rule">
            {phases.map((p) => (
              <li
                key={p.n}
                className="grid grid-cols-[auto_1fr_auto] items-baseline gap-4 py-4"
              >
                <span className="font-display text-2xl italic text-accent w-8">
                  {p.n}
                </span>
                <div className="flex flex-col">
                  <span className="font-sans text-base text-ink">{p.label}</span>
                  <span className="font-mono text-xs text-muted">{p.day}</span>
                </div>
                <span
                  className={`font-mono text-xs uppercase tracking-wider ${
                    p.state === "in progress"
                      ? "text-accent"
                      : "text-muted"
                  }`}
                >
                  {p.state}
                </span>
              </li>
            ))}
          </ul>

          <aside className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-sm border border-rule bg-paper-warm p-6">
              <p className="apex-eyebrow">Calibration ceiling</p>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                From the Phase 5 NotebookLM verification pass against the
                seven-voice synthesis.
              </p>
              <dl className="mt-5 grid gap-3 font-mono text-sm">
                <Stat label="Top-3 placement" value="90%" />
                <Stat label="Best Use of Technology" value="96%" />
                <Stat label="Most Innovative" value="88%" />
              </dl>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-wider text-muted">
                Working planning numbers: 75 / 85 / 75
              </p>
            </div>
            <div className="rounded-sm border border-rule p-6">
              <p className="apex-eyebrow">Team</p>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                Stephen Sookra (frontend, pitch, project architect) and Vinh Le
                (backend, ML pipeline, infra). Built with IBM Bob, per the
                Scuderia Ferrari case-study precedent.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-2 last:border-b-0">
      <dt className="text-xs uppercase tracking-wider text-muted">{label}</dt>
      <dd className="text-lg text-ink font-mono tabular-nums">{value}</dd>
    </div>
  );
}

/* -------------------------------------------------------------- */
/* Stack badges (IBM Granite tools)                                  */
/* -------------------------------------------------------------- */
function StackBadges() {
  const tools = [
    { name: "Granite-Docling", v: "258M", role: "COA structured-doc extraction" },
    { name: "Granite Vision", v: "4.1 4B", role: "Timing-sheet chart and table extraction" },
    { name: "Granite TimeSeries TTM", v: "r2.1", role: "Zero-shot multivariate forecasting" },
    { name: "Granite Instruct", v: "4.1 8B", role: "Race-engineer narrator" },
    { name: "Granite Guardian", v: "4.1 8B", role: "BYOC custom-rules safety audit" },
    { name: "Langflow", v: "latest", role: "Visible agentic orchestration" },
    { name: "Docling", v: "latest", role: "Document conversion layer" },
    { name: "IBM Bob", v: "latest", role: "Build accelerator (Ferrari precedent)" },
  ];

  return (
    <section aria-labelledby="stack-title" className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10 lg:py-24">
        <div className="mb-12 flex flex-col gap-3 max-w-3xl">
          <p className="apex-eyebrow">IBM stack</p>
          <h2 id="stack-title" className="font-display text-4xl leading-tight text-ink sm:text-5xl">
            Eight tools.
            <em className="italic text-racing-green"> Every one load-bearing.</em>
          </h2>
        </div>
        <ul className="grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((t) => (
            <li
              key={t.name}
              className="flex flex-col gap-1 bg-paper-warm p-5"
            >
              <span className="font-display text-lg text-ink">{t.name}</span>
              <span className="font-mono text-xs uppercase tracking-wider text-accent">
                {t.v}
              </span>
              <span className="text-sm text-ink-soft leading-snug pt-1">
                {t.role}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- */
/* Footer                                                           */
/* -------------------------------------------------------------- */
function SiteFooter() {
  return (
    <footer className="bg-racing-green-deep text-paper">
      <div className="mx-auto max-w-6xl px-6 py-14 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="flex flex-col gap-3">
            <span className="font-display text-3xl text-paper">
              APEX<span className="italic text-amber">.race</span>
            </span>
            <p className="font-sans text-sm leading-relaxed text-paper/65 max-w-sm">
              AI race engineer for adaptive racers. Built on IBM Granite for the
              IBM SkillsBuild May Challenge 2026.
            </p>
            <p className="pt-2 font-mono text-[11px] uppercase tracking-wider text-paper/45">
              Apache 2.0 · Submission 2026-05-31
            </p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-col gap-3 text-sm">
            <p className="apex-eyebrow text-paper/45">Project</p>
            <Link href="https://github.com/StephenSook/apex" target="_blank" rel="noopener noreferrer" className="hover:text-amber underline-offset-4 hover:underline">
              GitHub
            </Link>
            <Link href="https://github.com/StephenSook/apex/blob/main/PLAN.md" target="_blank" rel="noopener noreferrer" className="hover:text-amber underline-offset-4 hover:underline">
              PLAN.md
            </Link>
            <Link href="https://github.com/StephenSook/apex/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="hover:text-amber underline-offset-4 hover:underline">
              README
            </Link>
            <Link href="https://github.com/StephenSook/apex/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:text-amber underline-offset-4 hover:underline">
              License
            </Link>
          </nav>
          <div className="flex flex-col gap-3 text-sm">
            <p className="apex-eyebrow text-paper/45">Team</p>
            <p className="text-paper/85">Stephen Sookra</p>
            <p className="font-mono text-xs text-paper/55">
              Frontend, pitch, project architect
            </p>
            <p className="text-paper/85 pt-2">Vinh Le</p>
            <p className="font-mono text-xs text-paper/55">
              Backend, ML pipeline, infra
            </p>
          </div>
        </div>
        <div className="mt-12 border-t border-paper/10 pt-6 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-wider text-paper/45">
          <span>Day 1 of 12 · 2026-05-20</span>
          <span>The race engineer beyond the finish line.</span>
        </div>
      </div>
    </footer>
  );
}
