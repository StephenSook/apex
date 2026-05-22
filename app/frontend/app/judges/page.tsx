import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ConvergenceFixtureGrid } from "../../components/ConvergenceFixtureGrid";
import { CONVERGENCE_FIXTURES } from "../../lib/convergence-fixtures";

export const metadata: Metadata = {
  title: "Judges' Tour · APEX",
  description:
    "Single-page tour for IBM SkillsBuild AI Builders Challenge May 2026 judges. Demo, video, deck, repo, Q&A defense pack, IBM stack, methodology trace, and team in one place.",
};

const SUBMISSION_DEADLINE = "2026-05-31, 11:59 PM ET";

const RESOURCES: ReadonlyArray<ResourceLink> = [
  {
    label: "Live demo",
    href: "/analyze",
    detail: "Three-slot upload → corner-by-corner coaching report in ~60s on Granite.",
    badge: "live",
  },
  {
    label: "Live sim-rig stream",
    href: "/sim-rig",
    detail: "20 Hz adaptive-controls telemetry tile. Synthetic Sarah Reynolds Donington lap today; live WebSocket Day 9.",
    badge: "live",
  },
  {
    label: "3-minute submission video",
    href: null,
    detail: "YouTube unlisted URL lands Day 10 (2026-05-29) production take.",
    badge: "pending",
  },
  {
    label: "30-second highlight clip",
    href: null,
    detail: "Cut from the 3-min video for judges who only watch 30s. Lands Day 10.",
    badge: "pending",
  },
  {
    label: "Pitch deck PDF",
    href: null,
    detail: "Playwright HTML→PDF render Day 11. Editorial-paddock palette throughout.",
    badge: "pending",
  },
  {
    label: "Public GitHub repo",
    href: "https://github.com/StephenSook/apex",
    detail: "Apache 2.0, public Day 1, 130+ atomic commits across the 12-day build window.",
    badge: "live",
  },
  {
    label: "Methodology trace",
    href: "https://github.com/StephenSook/apex/blob/main/docs/methodology.md",
    detail: "Sookra Methodology 7-phase trace from recon to submission, with verification log.",
    badge: "live",
  },
  {
    label: "Architecture spec",
    href: "https://github.com/StephenSook/apex/blob/main/docs/architecture-spec.md",
    detail: "Three-layer pipeline with a two-stage projection-and-audit middle layer; Figure 1 inline below.",
    badge: "live",
  },
  {
    label: "Convergence 14 fixture grid",
    href: "#convergence-14",
    detail: "Display of the 14-fixture safety-contract catalogue. 4 Stage 1, 4 Stage 2, 4 Stage 3, 2 round-trip integrity.",
    badge: "live",
  },
  {
    label: "NeurIPS Workshop paper draft",
    href: "https://github.com/StephenSook/apex/blob/main/paper/apex-neurips-workshop-2026.md",
    detail: "Publication-readable §1-§3 + §5-§13 draft. §4 Experiments cell values fill at camera-ready.",
    badge: "live",
  },
  {
    label: "Pre-mortem journal",
    href: "https://github.com/StephenSook/apex/blob/main/docs/pre-mortem.md",
    detail: "Running failure-mode journal. 40+ entries, ~15 ✅ mitigations shipped, 3 accepted residual risks.",
    badge: "live",
  },
];

const IBM_STACK: ReadonlyArray<readonly [string, string]> = [
  ["Granite-Docling 258M", "FIA COA PDF → structured JSON parser."],
  ["Docling library", "Open-source IBM Docling conversion + table-extraction layer."],
  ["Granite Vision 4.1 4B", "SRO + Britcar timing-sheet PDF → CSV."],
  ["Granite TimeSeries TTM r2.1", "Frozen pretrained foundation forecaster on 1-Hz mini-sector tensors."],
  ["Granite 4.1 8B Instruct", "Race-engineer narrator producing the coaching report."],
  ["Granite Guardian 4.1 8B", "BYOC custom-rule text audit on every physics-corrected forecast."],
  ["Langflow", "Visible orchestration graph export of the full pipeline."],
  ["IBM Bob", "Build accelerator per the IBM × Scuderia Ferrari case-study precedent."],
];

const QA_CARDS: ReadonlyArray<QaCard> = [
  {
    title: "Deep Dynamics differentiator",
    question: "Deep Dynamics already trains a physics-informed neural network on race telemetry. Why is APEX different?",
    answer: "Deep Dynamics retrains a bespoke PINN. APEX takes a frozen pretrained foundation model (Granite TimeSeries TTM, NeurIPS 2024) and wraps its outputs in a differentiable CvxpyLayer QP at inference. We do not retrain. The physics enforcement is post-hoc projection, not training-time regularisation. That makes our pattern transferable: any future TSFM gets the same physics envelope without re-training.",
  },
  {
    title: "Kinetic Hallucination",
    question: "TTM was pretrained on weather + retail. Why would it forecast valid motorsport telemetry at all?",
    answer: "It does not, by itself. Without constraints TTM can forecast 4G lateral with zero steering or speed increasing at zero throttle. That is the Kinetic Hallucination problem. The differentiable physics-projection layer (friction ellipse + bicycle model + forward-Euler kinematic step) projects every forecast step onto the feasible manifold. Granite Guardian audits the structured text log of every projection correction. Convergence 14 is the serializer unit-test suite that verifies the physics-violation log is faithful.",
  },
  {
    title: "Serialization integrity",
    question: "What stops the projection layer from silently corrupting the forecast it claims to correct?",
    answer: "Convergence 14: a Python unit-test suite that fires every kinematic violation type (friction-ellipse breach, bicycle-model breach, jerk-bound breach, COA-simultaneity breach) and verifies the serialized text log Guardian receives matches the projection layer's internal record. Day 5-6 ship target. Without this suite, the projection layer is a black box. With it, every claim is testable.",
  },
  {
    title: "COA-parameterized simultaneity",
    question: "Why not just use Track Titan or Trophi.ai if you already have telemetry-aware AI race engineers?",
    answer: "Existing tools assume able-bodied physics. They encode throttle * brake = 0 because no able-bodied driver presses both at once. Adaptive drivers do, when their FIA Certificate of Adaptations (governed by Appendix L of the International Sporting Code) permits simultaneity through their hand-control or paddle-shift system. APEX reads the COA at tensor level. When the COA permits simultaneity, the projection layer permits it. When the COA does not, the constraint enforces. Same coaching pipeline says different things for different drivers based on what their COA says they are allowed to do.",
  },
  {
    title: "Latency budget",
    question: "60 seconds on RTX 4060. Will it run on the judge's machine?",
    answer: "The 60-second budget is the post-race coaching loop on RTX 4060: TTM forecast + projection + Guardian audit + Instruct narration. Granite-Docling + Granite Vision (the document parsers) run once at onboarding and cache to disk. The judge runs the Hugging Face Space deploy (Day 9) or the Colab notebook (Day 9) for a zero-install demo. Both keep the same 60-second loop. The Colab notebook removes the local GPU requirement entirely.",
  },
];

const TEAM: ReadonlyArray<TeamMember> = [
  {
    role: "Frontend, pitch, project architecture, narrative",
    name: "Stephen Sookra",
    affiliation: "Computer Science, Kennesaw State University",
  },
  {
    role: "Backend, ML pipeline, FastAPI, Langflow, Infrastructure",
    name: "Vinh Le",
    affiliation: "Computer Science, Kennesaw State University",
  },
];

export default function JudgesPage() {
  return (
    <main id="main" className="flex flex-col">
      <header className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-14 lg:px-10 lg:py-20">
          <p className="apex-eyebrow">IBM SkillsBuild AI Builders Challenge · May 2026 · Judges&rsquo; tour</p>
          <h1 className="font-display text-5xl tracking-tight text-ink sm:text-6xl">
            APEX, in one page.
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-ink-soft">
            Everything you need to evaluate APEX in five minutes. Live demo first, video second,
            architecture and Q&amp;A defense pack below. Submission deadline {SUBMISSION_DEADLINE}.
          </p>
          <p className="font-mono text-xs text-muted">
            Hero use case: Sarah Reynolds, a fictional persona (RAF veteran, left-leg amputee,
            Britcar Trophy 2026, #34 BMW M240i with electronic hand-controls).
          </p>
        </div>
      </header>

      <section
        id="resources"
        aria-labelledby="resources-title"
        className="border-b border-rule bg-paper-warm"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <h2
            id="resources-title"
            className="font-display text-3xl tracking-tight text-ink"
          >
            Five-second resource map.
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {RESOURCES.map((resource) => (
              <li key={resource.label}>
                <ResourceTile resource={resource} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="stack"
        aria-labelledby="stack-title"
        className="border-b border-rule bg-paper"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <h2 id="stack-title" className="font-display text-3xl tracking-tight text-ink">
            The eight IBM tools, each with a role.
          </h2>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {IBM_STACK.map(([name, role]) => (
              <div
                key={name}
                className="flex flex-col gap-2 rounded-sm border border-rule bg-paper-warm p-4"
              >
                <dt className="font-mono text-xs uppercase tracking-wider text-racing-green">
                  {name}
                </dt>
                <dd className="text-sm leading-relaxed text-ink-soft">{role}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        id="architecture"
        aria-labelledby="architecture-title"
        className="border-b border-rule bg-paper-warm"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <h2 id="architecture-title" className="font-display text-3xl tracking-tight text-ink">
            The pipeline, one diagram.
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft">
            Frozen Granite TimeSeries TTM r2.1 forecaster, wrapped in a two-stage projection-and-audit
            layer (Stage 1 differentiable CvxpyLayer convex QP for friction-ellipse + forward-Euler +
            jerk bound; Stage 2 post-projection feasibility filter for bicycle-model coupling + the
            COA-parameterized brake-throttle simultaneity gate), audited by Granite Guardian 4.1 with
            custom BYOC rules, narrated by Granite 4.1 8B Instruct. Source diagram lives at{" "}
            <span className="font-mono text-xs text-racing-green">docs/architecture-diagram.mmd</span>{" "}
            in the repository; Figure 1 in the NeurIPS Workshop paper draft is the same artifact.
          </p>
          <figure className="mt-8 flex flex-col items-center gap-3 rounded-sm border border-rule bg-paper p-6">
            <Image
              src="/figures/figure-1-architecture.svg"
              alt="APEX pipeline architecture: driver inputs (telemetry CSV, FIA Certificate of Adaptations PDF, written debrief) feed a one-time onboarding stage (Granite-Docling + Granite Vision) and the 60-second post-race coaching loop (1-Hz aggregator into Granite TimeSeries TTM r2.1 into Stage 1 differentiable convex QP into Stage 2 post-projection feasibility filter into Granite Guardian text audit into Granite 4.1 8B Instruct narrator). Outputs are a corner-by-corner coaching report, tuning recommendation with COA section citation, next-session envelope forecast, and Guardian safety stamp with reasoning trace."
              width={1600}
              height={1200}
              className="h-auto w-full max-w-5xl"
            />
            <figcaption className="font-mono text-xs text-muted">
              Figure 1 (vector) · also available at{" "}
              <Link
                href="/figures/figure-1-architecture.png"
                target="_blank"
                rel="noopener noreferrer"
                className="text-racing-green underline decoration-dotted underline-offset-2"
              >
                figure-1-architecture.png
              </Link>{" "}
              for raster reuse.
            </figcaption>
          </figure>
        </div>
      </section>

      <section
        id="convergence-14"
        aria-labelledby="convergence-14-title"
        className="border-b border-rule bg-paper"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <h2 id="convergence-14-title" className="font-display text-3xl tracking-tight text-ink">
            Convergence 14 · the safety contract.
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft">
            Decision-log D-A names the Convergence 14 fixture suite as the load-bearing safety contract.
            Every kinematic-violation class has a unit-test fixture firing the violation, asserting the
            serializer output, and asserting the Granite Guardian verdict matches. The grid below
            enumerates the 14 fixtures: 4 at the Stage 1 convex QP boundary, 4 at the Stage 2
            feasibility-filter boundary, 4 at the Stage 3 Granite Guardian BYOC text-audit boundary,
            plus 2 round-trip integrity fixtures that close the convergence loop. The fixture files
            land at <span className="font-mono text-xs text-racing-green">app/backend/tests/fixtures/convergence-14/</span>{" "}
            with the test suite at{" "}
            <span className="font-mono text-xs text-racing-green">app/backend/tests/test_serializer.py</span>{" "}
            (PLAN row 4.2). Click any row to see the Guardian verdict reason and the serialized
            violation-log excerpt the fixture asserts.
          </p>
          <ConvergenceFixtureGrid fixtures={CONVERGENCE_FIXTURES} />
          <p className="mt-6 font-mono text-xs italic text-muted">
            Grid is display-only. The Vinh-lane test suite at the path above is the assertion source
            of truth.
          </p>
        </div>
      </section>

      <section
        id="qa"
        aria-labelledby="qa-title"
        className="border-b border-rule bg-paper-warm"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <h2 id="qa-title" className="font-display text-3xl tracking-tight text-ink">
            Q&amp;A defense pack.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">
            The five hostile questions we rehearsed three times each. Cards are public; the
            internal canonical source lives in the team&rsquo;s private memory.
          </p>
          <ol className="mt-8 flex flex-col gap-6">
            {QA_CARDS.map((card, idx) => (
              <li key={card.title}>
                <QaTile card={card} index={idx + 1} />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="team"
        aria-labelledby="team-title"
        className="border-b border-rule bg-paper"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <h2 id="team-title" className="font-display text-3xl tracking-tight text-ink">
            Two-person team.
          </h2>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            {TEAM.map((member) => (
              <div key={member.name} className="flex flex-col gap-2">
                <dt className="apex-eyebrow">{member.role}</dt>
                <dd className="font-display text-xl text-ink">{member.name}</dd>
                <p className="font-mono text-xs text-muted">{member.affiliation}</p>
              </div>
            ))}
          </dl>
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

interface ResourceLink {
  readonly label: string;
  readonly href: string | null;
  readonly detail: string;
  readonly badge: "live" | "pending";
}

function ResourceTile({ resource }: { resource: ResourceLink }) {
  const tile = (
    <article className="flex h-full flex-col gap-2 rounded-sm border border-rule bg-paper p-5 transition-colors hover:border-racing-green">
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl text-ink">{resource.label}</h3>
        <BadgeChip badge={resource.badge} />
      </header>
      <p className="text-sm leading-relaxed text-ink-soft">{resource.detail}</p>
      {resource.href && (
        <p className="font-mono text-xs text-muted break-all">{resource.href}</p>
      )}
      {!resource.href && (
        <p className="font-mono text-xs italic text-muted">URL pending</p>
      )}
    </article>
  );

  if (!resource.href) {
    return tile;
  }

  if (resource.href.startsWith("/")) {
    return (
      <Link href={resource.href} className="block focus-visible:outline-none">
        {tile}
      </Link>
    );
  }
  return (
    <Link
      href={resource.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block focus-visible:outline-none"
    >
      {tile}
    </Link>
  );
}

function BadgeChip({ badge }: { badge: ResourceLink["badge"] }) {
  if (badge === "live") {
    return (
      <span className="rounded-sm bg-racing-green px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-paper">
        Live
      </span>
    );
  }
  return (
    <span className="rounded-sm border border-amber px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-amber">
      Pending
    </span>
  );
}

interface QaCard {
  readonly title: string;
  readonly question: string;
  readonly answer: string;
}

function QaTile({ card, index }: { card: QaCard; index: number }) {
  return (
    <article className="rounded-sm border border-rule bg-paper p-6">
      <header className="flex items-baseline gap-3 pb-3">
        <span className="font-mono text-xs uppercase tracking-wider text-accent">
          Card {String(index).padStart(2, "0")}
        </span>
        <h3 className="font-display text-xl text-ink">{card.title}</h3>
      </header>
      <p className="font-mono text-sm leading-relaxed text-ink-soft">
        <span className="font-sans text-base font-medium text-ink">Q.</span> {card.question}
      </p>
      <p className="mt-3 text-base leading-relaxed text-ink">
        <span className="font-mono text-sm font-medium text-racing-green">A.</span> {card.answer}
      </p>
    </article>
  );
}

interface TeamMember {
  readonly role: string;
  readonly name: string;
  readonly affiliation: string;
}
