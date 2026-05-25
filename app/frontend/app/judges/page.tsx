import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

// Wave-44 Phase 9 perf BLOCKER #2 close-out per vercel:performance-
// optimizer: dynamic-import the 6 mock-only client islands below the
// architecture fold (ALoRA + GEPA + EAGLE3 + TSPulse + GraniteVisionParser
// + EdgeSummary). Code-splits these into separate async chunks so the
// initial /judges JS bundle ships smaller. Loading placeholder
// preserves the visual rhythm so layout-shift stays bounded.
// ssr:false NOT used here (Next.js 16 Server Component restriction);
// the imported modules are already "use client" so the SSR pass emits
// them with the rest of the Client Component tree + hydration happens
// per the dynamic-import boundary.
const LazyLoadingShim = () => (
  <div className="h-40 rounded-sm border border-rule bg-paper-warm motion-safe:animate-pulse" />
);

const ALoRAStatusBadge = dynamic(() => import("../../components/ALoRAStatusBadge"), {
  loading: LazyLoadingShim,
});
const EAGLE3LatencyBadge = dynamic(() => import("../../components/EAGLE3LatencyBadge"), {
  loading: LazyLoadingShim,
});
const EdgeSummary = dynamic(() => import("../../components/EdgeSummary"), {
  loading: LazyLoadingShim,
});
const GEPAEvolutionPanel = dynamic(() => import("../../components/GEPAEvolutionPanel"), {
  loading: LazyLoadingShim,
});
const GraniteVisionParser = dynamic(() => import("../../components/GraniteVisionParser"), {
  loading: LazyLoadingShim,
});
const TSPulseAnomalyPanel = dynamic(() => import("../../components/TSPulseAnomalyPanel"), {
  loading: LazyLoadingShim,
});

// SSR-rendered (above-fold or SEO-relevant): keep eager imports.
import { ConvergenceFixtureGrid } from "../../components/ConvergenceFixtureGrid";
import { ExtendedPhysicsFixtureGrid } from "../../components/ExtendedPhysicsFixtureGrid";
import RaceEventsTilesRow from "../../components/RaceEventsTilesRow";
import PhysicsConfidenceRing from "../../components/PhysicsConfidenceRing";
import TriAgentCriticPanel from "../../components/TriAgentCriticPanel";
import PWAInstallPrompt from "../../components/PWAInstallPrompt";
import { CONVERGENCE_FIXTURES } from "../../lib/convergence-fixtures";
import { EXTENDED_PHYSICS_FIXTURES } from "../../lib/extended-physics-fixtures";
import { IBM_STACK_TUPLES } from "../../lib/ibm-stack";
import {
  MOCK_PHYSICS_CONFIDENCE,
  MOCK_PHYSICS_CONFIDENCE_OOD,
  MOCK_TRI_AGENT_VERDICT,
  MOCK_TRI_AGENT_VERDICT_REJECT,
  MOCK_TSPULSE_ACTIVE,
} from "../../lib/mocks/judges-mocks";

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
    detail: "Apache 2.0, public Day 1, 220+ atomic commits across the 12-day build window.",
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

// Wave-39 codex MED close-out: the IBM_STACK panel now derives from
// the shared `lib/ibm-stack.ts` canonical catalog. The /judges panel
// uses the tuple-form adapter (IBM_STACK_TUPLES). Future tool-count
// + version-pin changes propagate to /, /judges, paper, deck, README
// via a single edit to the shared catalog.
//
// Wave-44 Phase 4 Gemini BLOCKER 4 close-out: extended to 3-tuple
// `[label, role, status]`. status drives the per-tool honesty pill
// (WIRED / INTEGRATION / FACADE / ACCELERATOR) matching the / page
// StackBadges pill rendering. README + page copy + paper match
// runtime reality vs the prior "every one load-bearing" overclaim.
const IBM_STACK: typeof IBM_STACK_TUPLES = IBM_STACK_TUPLES;

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
          <div className="mt-4">
            <PWAInstallPrompt />
          </div>
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
            Twelve IBM tools. Per-tool wire-up status, honest.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-soft">
            Two wired at HEAD (Granite Instruct + Granite 4.0 Nano). Seven at frontend-integration with canonical type contracts and backend swap-points per Stream M.3. One demo-facade (Langflow per D-017). Two build-time accelerators (Docling library + IBM Bob). No tool listed without a runtime role.
          </p>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {IBM_STACK.map(([name, role, status]) => (
              <div
                key={name}
                className="flex flex-col gap-2 rounded-sm border border-rule bg-paper-warm p-4"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="font-mono text-xs uppercase tracking-wider text-racing-green">
                    {name}
                  </dt>
                  <span
                    className={`font-mono text-[9px] uppercase tracking-wider rounded-sm border px-1.5 py-0.5 whitespace-nowrap ${
                      status === "WIRED"
                        ? "border-racing-green bg-paper text-racing-green"
                        : status === "INTEGRATION"
                        ? "border-amber bg-paper text-amber"
                        : status === "FACADE"
                        ? "border-rule bg-paper text-ink-soft"
                        : "border-rule bg-paper text-muted"
                    }`}
                    aria-label={`Status: ${status}`}
                  >
                    {status === "WIRED" ? "Wired" : status === "INTEGRATION" ? "Integration" : status === "FACADE" ? "Facade" : "Accelerator"}
                  </span>
                </div>
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
            {/*
              Wave-44 Phase 9 perf BLOCKER #1 close-out per vercel:performance-optimizer:
              dropped the <picture> wrapper + 1.5MB PNG srcset emission. SVG ships
              direct via next/image with unoptimized=true (SVG is already 45KB; no
              raster conversion needed). priority hints the LCP element so browser
              fetches the SVG with high-priority hint instead of competing with the
              7 client islands below. Saves ~800ms-1.4s LCP on 4G.
            */}
            <Image
              src="/figures/figure-1-architecture.svg"
              alt="APEX pipeline architecture: driver inputs (telemetry CSV, FIA Certificate of Adaptations PDF, written debrief) feed a one-time onboarding stage (Granite-Docling + Granite Vision) and the 60-second post-race coaching loop (1-Hz aggregator into Granite TimeSeries TTM r2.1 into Stage 1 differentiable convex QP into Stage 2 post-projection feasibility filter into Granite Guardian text audit into Granite 4.1 8B Instruct narrator). Outputs are a corner-by-corner coaching report, tuning recommendation with COA section citation, next-session envelope forecast, and Guardian safety stamp with reasoning trace."
              width={1487}
              height={1702}
              priority
              unoptimized
              sizes="(min-width: 64rem) 64rem, 100vw"
              className="h-auto w-full max-w-5xl"
            />
            <figcaption className="font-mono text-xs text-muted">
              Figure 1 (vector via SVG with PNG raster fallback). Download the raster copy at{" "}
              <Link
                href="/figures/figure-1-architecture.png"
                download="apex-figure-1-architecture.png"
                target="_blank"
                rel="noopener noreferrer"
                className="text-racing-green underline decoration-dotted underline-offset-2"
              >
                figure-1-architecture.png
              </Link>
              {" "}for reuse.
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
            The catalogue below is the Stephen-lane display of the 14-fixture safety-contract specification:
            4 at the Stage 1 convex QP boundary, 4 at the Stage 2 feasibility-filter boundary, 4 at the
            Stage 3 Granite Guardian BYOC text-audit boundary, plus 2 round-trip integrity fixtures
            that close the convergence loop. The Vinh-lane assertion suite at{" "}
            <span className="font-mono text-xs text-racing-green">app/backend/tests/test_serializer.py</span>{" "}
            lands per PLAN rows 2.9c + 4.2, with fixture files at{" "}
            <span className="font-mono text-xs text-racing-green">app/backend/tests/fixtures/convergence-14/</span>.
            Each fixture asserts the violation, the serializer output, and the Granite Guardian verdict.
            Click any row to see the expected Guardian verdict reason and the serialized
            violation-log excerpt the fixture targets.
          </p>
          <ConvergenceFixtureGrid fixtures={CONVERGENCE_FIXTURES} />
          <p className="mt-6 font-mono text-xs italic text-muted">
            Grid is display-only. The Vinh-lane test suite at the path above is the assertion source
            of truth.
          </p>
        </div>
      </section>

      <section
        id="physics-tiers"
        aria-labelledby="physics-tiers-title"
        className="border-b border-rule bg-paper"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <h2 id="physics-tiers-title" className="font-display text-3xl tracking-tight text-ink">
            Eight-tier physics implementation.
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft">
            Wave-30 decision D-015 locked the eight-tier physics stack in-scope for the 2026-05-31
            submission. Each tier surfaces below as one tile with its plain-text formula, canonical
            input channels, expected outputs, and the handler that owns it inside the unrolled SCP
            outer loop per D-012. The class-to-handler binding lives on the
            <span className="font-mono text-xs text-racing-green"> ExtendedPhysicsFixture </span>
            discriminated union at{" "}
            <span className="font-mono text-xs text-racing-green">app/shared/types.ts</span>; mis-
            binding a non-convex tier to the inner cvxpylayers iterate is a TypeScript compile error.
            Hover any tile to reveal the architecture-spec Appendix W30 cross-reference.
          </p>
          <div className="mt-8 mb-8">
            <RaceEventsTilesRow />
          </div>
          <ExtendedPhysicsFixtureGrid fixtures={EXTENDED_PHYSICS_FIXTURES} />
          <p className="mt-6 font-mono text-xs italic text-muted">
            Grid is display-only. The Vinh-lane SCP outer-loop linearisation lands per PLAN row 2.18
            with file paths at <span className="not-italic">app/backend/apex/physics/tier_{`{1..8}`}.py</span>
            and <span className="not-italic">app/backend/apex/physics/scp_outer.py</span>.
          </p>
        </div>
      </section>

      <section
        id="galaxy-moves"
        aria-labelledby="galaxy-moves-title"
        className="border-b border-rule bg-paper"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <h2 id="galaxy-moves-title" className="font-display text-3xl tracking-tight text-ink">
            Galaxy-tier inference and adaptation moves.
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft">
            Decision-log D-019 enumerates five shouldn&apos;t-be-possible moves that lift APEX from
            a hackathon submission into a research-paper-grade artifact. The wave-38 build shipped
            move #1 (WebGPU Granite Nano 350M, Layer 0; surfaced below). Wave-40 ships the
            visualization layer for moves #2 (Activated LoRA hot-swap, Layer 6), #3 (GEPA
            reflective prompt evolution, Layer 5), and #4 (EAGLE-3 speculative decoding, Layer 6
            inference). Wave-44 Phase 6a adds the IBM TSPulse 1M polyphase time-frequency anomaly
            detector (D-016 Layer 2; per-window detection before the projector QP fires). Move #5
            (Agent-as-Judge tri-agent critic loop, Layer 7) renders one section below. Each panel
            here uses mock fixtures today; backend wire-up arrives Day 7-8 per <span className="font-mono text-xs text-racing-green">docs/vinh-backend-plan.md</span>
            Phase 4 tasks 4.4 (EAGLE-3) + 4.5 (aLoRA) + 4.6 (GEPA artifact read) + wave-44 plan
            Vinh-scope V7 (TSPulse anomaly endpoint).
          </p>
          <div className="mt-8 flex flex-col gap-6">
            <ALoRAStatusBadge />
            <GEPAEvolutionPanel />
            <EAGLE3LatencyBadge />
            <TSPulseAnomalyPanel state={MOCK_TSPULSE_ACTIVE} />
            <GraniteVisionParser />
          </div>
          <p className="mt-6 font-mono text-xs italic text-muted">
            Panels are mock for /judges visualisation. Real fetch swaps land Day 7-8 per
            <span className="not-italic"> docs/decision-log.md D-019 + D-032 + wave-44 Vinh V7</span>.
          </p>
        </div>
      </section>

      <section
        id="tri-agent"
        aria-labelledby="tri-agent-title-section"
        className="border-b border-rule bg-paper-warm"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <h2 id="tri-agent-title-section" className="font-display text-3xl tracking-tight text-ink">
            Tri-agent Agent-as-Judge critic loop.
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft">
            Wave-30 decision D-018 + D-019 item 5 lock the three-critic panel (Physics-Critic +
            Pedagogy-Critic + Guardian-Safety) running in parallel on the draft coaching report. If
            any critic flags, IBM Mellea Instruct-Validate-Repair fires with loop_budget = 3 until
            the panel approves. Verified CoachingReport then proceeds to the Layer 8 final Guardian
            audit per D-A. The mock panel below renders the discriminated-union pattern from{" "}
            <span className="font-mono text-xs text-racing-green">app/shared/types.ts </span>
            (TriAgentVerdictPanel = three TriAgentVerdict instances; verdict-tag narrowing + empty-
            reasoning-trace fallback per GuardianAudit one level up).
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col items-center gap-3">
              <PhysicsConfidenceRing confidence={MOCK_PHYSICS_CONFIDENCE} />
              <p className="text-center font-mono text-xs text-muted">
                D-024 in-distribution mock: Guardian verdict preserved.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <PhysicsConfidenceRing confidence={MOCK_PHYSICS_CONFIDENCE_OOD} />
              <p className="text-center font-mono text-xs text-muted">
                D-024 out-of-distribution mock: Guardian verdict downgraded from approve to review.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                Mock A: flag verdict on Pedagogy-Critic
              </p>
              <div className="mt-2">
                <TriAgentCriticPanel panel={MOCK_TRI_AGENT_VERDICT} panelId="mock-flag" />
              </div>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                Mock B: reject verdict on Guardian-Safety (COA-conflict)
              </p>
              <div className="mt-2">
                <TriAgentCriticPanel
                  panel={MOCK_TRI_AGENT_VERDICT_REJECT}
                  panelId="mock-reject"
                />
              </div>
            </div>
          </div>
          <p className="mt-6 font-mono text-xs italic text-muted">
            Panel data is mock for /judges visualisation. Vinh-lane backend at{" "}
            <span className="not-italic">app/backend/apex/critics/</span> produces real verdicts per
            PLAN row 4.20; Mellea IVR repair loop per row 4.21.
          </p>
        </div>
      </section>

      <section
        id="edge-summary"
        aria-labelledby="edge-summary-section-title"
        className="border-b border-rule bg-paper"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <h2
            id="edge-summary-section-title"
            className="font-display text-3xl tracking-tight text-ink"
          >
            WebGPU Granite Nano edge inference.
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft">
            Wave-30 decision D-019 item 1 + D-021 lock Granite 4.0 Nano 350M as the in-browser
            edge model via Transformers.js v4 + WebGPU. The 1.5 GB WebGPU buffer pre-check
            (pre-mortem row 61) gates the model load; if the adapter advertises insufficient
            headroom, the chip below degrades to the server-only path. The 30-line Newton
            friction-ellipse projector runs offline alongside the small-LM head; server-
            authoritative reconnect (D-021) overwrites local state on every reconnect so no
            mechanical recommendations are emitted from the offline path. Arch-spec cross-
            reference at{" "}
            <span className="font-mono text-xs text-racing-green">
              docs/architecture-spec.md
            </span>{" "}
            Appendix W30 Layer 0 (Edge/Client Plane).
          </p>
          <div className="mt-6">
            <EdgeSummary />
          </div>
          <p className="mt-6 font-mono text-xs italic text-muted">
            Edge inference is advisory per D-021. The canonical APEX pipeline runs server-side
            through Vinh-lane backend at{" "}
            <span className="not-italic">app/backend/apex/</span>; the edge path lowers the
            barrier for journalists + adaptive-driver coaches to demo the pipeline without an
            RTX-4060 install.
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

  if (resource.href.startsWith("#")) {
    return (
      <Link href={resource.href} className="block focus-visible:outline-none">
        {tile}
      </Link>
    );
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
