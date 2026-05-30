import Image from "next/image";
import Link from "next/link";

import BlurText from "../components/BlurText";
import RacingLineHeroShell from "../components/RacingLineHeroShell";
import { IBM_GRANITE_STACK } from "../lib/ibm-stack";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex flex-col flex-1">
        <Hero />
        <AdaptiveCommunity />
        <DriverContext />
        <CoaGateVisual />
        <Architecture />
        <Differentiators />
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
        </Link>
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-8 font-sans text-sm text-ink-soft">
          <a href="#hero" className="hover:text-racing-green underline-offset-4 hover:underline">
            What it is
          </a>
          <a href="#architecture" className="hover:text-racing-green underline-offset-4 hover:underline">
            Architecture
          </a>
          <Link
            href="/analyze"
            className="rounded-sm bg-accent px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-paper hover:bg-racing-green transition-colors"
          >
            Analyze
          </Link>
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
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-12 lg:px-10 lg:py-28">
        <div className="lg:col-span-6 flex flex-col gap-6">
          <p className="apex-eyebrow apex-rise" style={{ "--apex-delay": "0ms" } as React.CSSProperties}>
            IBM SkillsBuild · May Challenge 2026
          </p>
          <h1
            id="hero-title"
            className="font-display text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl"
          >
            <BlurText text="The race engineer for the drivers who" baseDelay={120} />{" "}
            <em className="font-display italic text-accent">
              <BlurText text={"don’t have one."} baseDelay={720} perWord={120} />
            </em>
          </h1>
          <p
            className="max-w-xl text-lg leading-relaxed text-ink-soft apex-rise"
            style={{ "--apex-delay": "240ms" } as React.CSSProperties}
          >
            A pro race engineer can cost{" "}
            <span className="font-mono text-base text-ink">several hundred pounds</span> a day.
            Every F1 driver has one. Most adaptive racers, veteran-team drivers, and
            grassroots competitors do not. APEX is built on IBM Granite, the same platform IBM
            ships to Scuderia Ferrari&rsquo;s ~400 million fans, and points it at the
            drivers who need a race engineer the most.
          </p>
          <p
            className="max-w-xl font-mono text-xs uppercase tracking-wider text-muted apex-rise"
            style={{ "--apex-delay": "300ms" } as React.CSSProperties}
          >
            Built for race engineers, drivers, adaptive-racing coaches, and grassroots programs.
          </p>
          <div
            className="flex flex-wrap gap-3 pt-2 apex-rise"
            style={{ "--apex-delay": "360ms" } as React.CSSProperties}
          >
            <a
              href="#driver-context"
              className="inline-flex items-center gap-2 rounded-sm bg-racing-green px-5 py-3 font-mono text-xs uppercase tracking-wider text-paper transition-transform hover:translate-y-[-1px] hover:bg-racing-green-deep"
            >
              See how it works
              <span aria-hidden="true">↓</span>
            </a>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-sm border border-racing-green bg-paper-warm px-5 py-3 font-mono text-xs uppercase tracking-wider text-racing-green transition-colors hover:bg-racing-green hover:text-paper"
            >
              Upload telemetry
            </Link>
            <Link
              href="/coach-code"
              className="inline-flex items-center gap-2 rounded-sm border border-ink/15 bg-paper-warm px-5 py-3 font-mono text-xs uppercase tracking-wider text-ink transition-colors hover:border-ink/40"
            >
              Coach my code
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 rounded-sm border border-ink/15 bg-paper-warm px-5 py-3 font-mono text-xs uppercase tracking-wider text-ink transition-colors hover:border-ink/40"
            >
              Twin-driver compare
            </Link>
          </div>
          <p
            className="pt-4 font-mono text-xs text-muted apex-rise"
            style={{ "--apex-delay": "480ms" } as React.CSSProperties}
          >
            IBM Granite + watsonx · Apache 2.0
          </p>
        </div>

        <figure
          className="lg:col-span-6 flex w-full flex-col items-start gap-6 apex-rise"
          style={{ "--apex-delay": "600ms" } as React.CSSProperties}
          aria-label="Editorial paddock illustration on top + SVG cinematic racing-line visualization with orbital glow rings + spark embers + live telemetry strip underneath. Two layered hero visuals."
        >
          <Image
            src="/hero-illustration-4k.png"
            alt="Editorial paddock motorsport illustration: hand-controls-adapted GT4 cockpit interior at golden hour. Warm cream paper textured backdrop with subtle racing-green track-line silhouette. Clay-red apex marker. Amber heat-glow on the dashboard telemetry. Generated via Nano Banana Pro per docs/nano-banana-runbook.md wave-51c ship."
            width={5504}
            height={3072}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-auto w-full rounded-sm"
          />
          <div
            className="w-full"
            aria-label="SVG cinematic racing line visualization with orbital glow rings + spark embers + live telemetry strip."
          >
            <RacingLineHeroShell />
          </div>
        </figure>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- */
/* Adaptive community (counter-position vs OVERRIDE's no-human-story  */
/* gap per project_apex_override_competitor.md; aggregate-only        */
/* community framing, no un-consented operator names; MME Motorsport   */
/* named per the 2026-05-22 consent grant per                          */
/* project_apex_consent_mme_motorsport.md; Sarah Reynolds NOT named    */
/* per feedback_persona_not_hardcoded_in_ui.md storytelling-layer-only */
/* rule)                                                               */
/* -------------------------------------------------------------- */
function AdaptiveCommunity() {
  return (
    <section
      id="who-we-race-for"
      className="border-b border-rule bg-paper"
      aria-labelledby="adaptive-community-title"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
        <div className="lg:col-span-5 flex flex-col gap-5">
          <p className="apex-eyebrow apex-rise" style={{ "--apex-delay": "0ms" } as React.CSSProperties}>
            Who APEX races for
          </p>
          <h2
            id="adaptive-community-title"
            className="font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl apex-rise"
            style={{ "--apex-delay": "120ms" } as React.CSSProperties}
          >
            Adaptive racers, veteran-team drivers, grassroots competitors.{" "}
            <em className="font-display italic text-accent">The people who need a race engineer the most.</em>
          </h2>
          <p
            className="max-w-xl text-base leading-relaxed text-ink-soft apex-rise"
            style={{ "--apex-delay": "240ms" } as React.CSSProperties}
          >
            APEX is built first for drivers competing under FIA Appendix L hand-control
            certification: differential thumb-trigger paddles, modified pedal assemblies,
            and brake-throttle simultaneity envelopes that pro-grade coaching software
            silently treats as data corruption. Then the same coaching surface generalizes
            to any racer who cannot afford a pro engineer at <span className="font-mono text-sm text-ink">£400 to £500</span> a day.
          </p>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6">
          <ul
            className="grid gap-4 sm:grid-cols-2 apex-rise"
            style={{ "--apex-delay": "300ms" } as React.CSSProperties}
            aria-label="What APEX recognizes about adaptive driving"
          >
            <li className="rounded-sm border-l-2 border-racing-green bg-paper-warm p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-racing-green">
                Control input
              </p>
              <p className="mt-2 font-display text-xl leading-tight text-ink">
                Hand-controls preserve continuous-action capability.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Most pro tools assume brake + throttle never overlap. For adaptive
                drivers using thumb-triggers, simultaneous activation IS the technique.
                APEX&rsquo;s COA-gate inverts the assumption.
              </p>
            </li>
            <li className="rounded-sm border-l-2 border-accent bg-paper-warm p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
                Regulation
              </p>
              <p className="mt-2 font-display text-xl leading-tight text-ink">
                FIA Appendix L grounds every coaching claim.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Granite Guardian audits each recommendation against Appendix L
                provisions. No invented Article numbers. Citations point at the
                published revision, never at a hallucinated reference.
              </p>
            </li>
            <li className="rounded-sm border-l-2 border-amber bg-paper-warm p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-amber-ink">
                Community
              </p>
              <p className="mt-2 font-display text-xl leading-tight text-ink">
                Co-developed with operators who actually field these cars.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                MME Motorsport (per consent 2026-05-22) reviews the COA-parameterized
                gate behavior against live setup data. Additional operator partners
                anonymized per per-surface consent discipline.
              </p>
            </li>
            <li className="rounded-sm border-l-2 border-ink/40 bg-paper-warm p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                Open source
              </p>
              <p className="mt-2 font-display text-xl leading-tight text-ink">
                Apache 2.0 from Day 1. Public repo, public methodology.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                The race engineering canon should not be locked behind a paid SaaS
                login. APEX ships every layer (forecaster + projector + Guardian) as
                inspectable open code under a permissive license.
              </p>
            </li>
          </ul>

          <p
            className="font-display text-lg italic leading-relaxed text-ink-soft max-w-2xl apex-rise"
            style={{ "--apex-delay": "420ms" } as React.CSSProperties}
          >
            &ldquo;The race engineer is the unsung half of a Sunday result. Every
            paddock has one in the truck. Almost nobody outside that paddock
            does.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- */
/* Driver context (Lane K persona-decoupled; generic illustrative)  */
/* -------------------------------------------------------------- */
function DriverContext() {
  return (
    <section
      id="driver-context"
      className="border-b border-rule bg-paper-warm"
      aria-labelledby="driver-context-title"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
        <div className="lg:col-span-4 flex flex-col gap-3">
          <p className="apex-eyebrow">What the driver brings</p>
          <h2
            id="driver-context-title"
            className="font-display text-3xl leading-tight text-ink"
          >
            Three artifacts, one report.
          </h2>
          <p className="text-base text-ink-soft leading-relaxed">
            Telemetry CSV from the data logger. FIA Certificate of Adaptations
            PDF when the driver has one on file under FIA Appendix L provisions.
            A sentence or two from the driver&rsquo;s own debrief. APEX returns a
            corner-by-corner coaching report inside five minutes.
          </p>
          <p className="pt-4 font-mono text-xs uppercase tracking-wider text-muted">
            See the canonical demo at <Link href="/judges" className="underline hover:text-racing-green">/judges</Link>. Try with your own files at <Link href="/analyze" className="underline hover:text-racing-green">/analyze</Link>.
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
            Lost the rears mid the slow hairpin again. Trail-braking on the lever
            doesn&rsquo;t come back the way it did last month. The middle sector
            was plus zero point three against my PB.
          </p>
          <footer className="mt-6 flex flex-wrap items-baseline gap-3 text-sm text-muted">
            <span className="font-mono uppercase tracking-wider">Illustrative debrief</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">corner-agnostic example</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">+0.34s mid-sector delta</span>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- */
/* COA gate visual (wave-51d Nano Banana editorial illustration)    */
/* -------------------------------------------------------------- */
function CoaGateVisual() {
  return (
    <section
      id="coa-gate-visual"
      aria-labelledby="coa-gate-visual-title"
      className="border-b border-rule bg-paper"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16 lg:px-10 lg:py-20">
        <header className="flex flex-col gap-3 max-w-3xl">
          <p className="apex-eyebrow">The COA gate, visualized</p>
          <h2
            id="coa-gate-visual-title"
            className="font-display text-3xl leading-tight text-ink"
          >
            Brake-throttle traces crossing at the apex.{" "}
            <em className="italic text-accent">
              When the COA permits it, the projection recognizes it.
            </em>
          </h2>
        </header>
        <figure className="flex flex-col gap-3 rounded-sm border border-rule bg-paper-warm p-3">
          <Image
            src="/coa-gate-illustration-4k.png"
            alt="Editorial paddock infographic: clay-red brake telemetry trace + racing-green throttle telemetry trace overlaid through a corner, crossing at the apex point. Amber heat-glow halo around the apex crossing. Warm cream paper background with subtle paddock dust grain. Plex Mono callout coa_overlap_flag = 1. Generated via Nano Banana Pro per docs/nano-banana-runbook.md wave-51c ship."
            width={5504}
            height={3072}
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="h-auto w-full rounded-sm"
          />
          <figcaption className="font-mono text-[11px] uppercase tracking-wider text-muted">
            Editorial illustration. coa_overlap_flag is the tensor-level signal the V1 NumPy validator
            reads from the parsed FIA Certificate of Adaptations.
          </figcaption>
        </figure>
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
      detail: "differentiable · COA-aware · per-step μ_v (Tier 5 thermal + Tier 7 Pacejka) per D-015",
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
        "FIA Appendix L is the regulation that governs Certificate of Adaptations structure for adaptive-equipment homologation. APEX parses the COA at onboarding, derives the c_overlap flag from the approved hand-control hardware specifications inside it, and feeds the flag to the model at the tensor level. Not regulatory background; tensor-level input.",
    },
    {
      n: "03",
      lead:
        "First integrated workflow for adaptive driver hand-control channels.",
      body:
        "COA-parameterized brake-throttle simultaneity. Competing tools hard-code a brake-throttle mutual-exclusion and systematically misdiagnose adaptive drivers, and any left-foot-braker.",
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
        "Fourteen IBM Granite tools across a per-tool honesty ladder.",
      body:
        "Three WIRED at HEAD, nine at INTEGRATION with canonical type contracts + backend swap-points, two build-time accelerators (Docling library + Mellea v0.5.0 IVR-loop slot; Mellea is build-time architectural inspiration only, not a runtime dependency). Per the IBM × Scuderia Ferrari case-study precedent.",
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
/* Stack badges (IBM Granite tools)                                  */
/* -------------------------------------------------------------- */
function StackBadges() {
  return (
    <section aria-labelledby="stack-title" className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10 lg:py-24">
        <div className="mb-12 flex flex-col gap-3 max-w-3xl">
          <p className="apex-eyebrow">IBM stack</p>
          <h2 id="stack-title" className="font-display text-4xl leading-tight text-ink sm:text-5xl">
            Fourteen tools.
            <em className="italic text-racing-green"> Per-tool wire-up status, honest.</em>
          </h2>
          <p className="text-base text-ink-soft leading-relaxed">
            Three tools wired end-to-end at HEAD (Granite Instruct 4.1 8B coaching narration + Granite 4.0 Nano 350M WebGPU edge model + Granite Embedding R2 live dense RAG rerank via HF Inference Providers). Nine tools at frontend-integration phase with canonical type contracts + backend swap-points documented (per Stream M.3 spec handoff + wave-46 D-058 expansion adding Granite Instruct 4.1 3B chat-routing + Granite Speech 4.1 2B-Plus Watson STT proxy preview; LangGraph + Granite MCP Gateway + ContextForge as the orchestration runtime per D-017 G7 + D-054; render path stays identical across mock and real; Langflow retained as the export-graph artifact). Two build-time accelerators (Docling library + Mellea v0.5.0 IVR-loop slot; Mellea is build-time architectural inspiration only, not a runtime dependency). No runtime tool listed without a runtime role in the pipeline.
          </p>
        </div>
        <ul className="grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-4">
          {IBM_GRANITE_STACK.map((t) => (
            <li
              key={t.name}
              className="flex flex-col gap-1 bg-paper-warm p-5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-lg text-ink">{t.name}</span>
                <span
                  className={`font-mono text-[10px] uppercase tracking-wider rounded-sm border px-2 py-0.5 ${
                    t.status === "WIRED"
                      ? "border-racing-green bg-paper text-racing-green"
                      : t.status === "INTEGRATION"
                      ? "border-amber bg-paper text-amber-ink"
                      : "border-rule bg-paper text-muted"
                  }`}
                  aria-label={`Status: ${t.status}`}
                >
                  {t.status === "WIRED" ? "Wired" : t.status === "INTEGRATION" ? "Integration" : "Accelerator"}
                </span>
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-accent">
                {t.version}
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
              Apache 2.0
            </p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-col gap-3 text-sm">
            <p className="apex-eyebrow text-paper/45">Project</p>
            <Link href="https://github.com/StephenSook/apex" target="_blank" rel="noopener noreferrer" className="hover:text-amber underline-offset-4 hover:underline">
              GitHub
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
        <div className="mt-12 border-t border-paper/10 pt-6 flex flex-wrap items-center justify-end gap-3 font-mono text-[11px] uppercase tracking-wider text-paper/45">
          <span>The race engineer beyond the finish line.</span>
        </div>
      </div>
    </footer>
  );
}
