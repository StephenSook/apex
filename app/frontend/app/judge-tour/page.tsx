import type { Metadata } from "next";

import JudgeWalkthroughProgressBar from "../../components/JudgeWalkthroughProgressBar";
import JudgeWalkthroughStep from "../../components/JudgeWalkthroughStep";

/**
 * /judge-tour page. Wave-45 Phase 4 Block C.1 close-out. 6-step
 * narrative-paced walkthrough for IBM SkillsBuild May Challenge
 * judges who spend <2 minutes per project. Delivers the killshot
 * in 30 seconds per step via deliberately scoped step pages.
 *
 * Query param `?step=N` (1..6) controls active step. Default = 1.
 * Server Component reads searchParams + renders the appropriate
 * step component; navigation is via Link href updates (no client-
 * side state needed beyond the URL).
 */

export const metadata: Metadata = {
  title: "Judge tour | APEX",
  description:
    "Six-step narrative walkthrough for IBM SkillsBuild AI Builders Challenge May 2026 judges. Problem + IBM stack + engine-agnostic byte-equality + COA-parameterized differentiator + galaxy-tier moves + submission package.",
};

const TOTAL_STEPS = 6;

interface JudgeTourPageProps {
  readonly searchParams: Promise<{ step?: string }>;
}

export default async function JudgeTourPage({ searchParams }: JudgeTourPageProps) {
  const resolved = await searchParams;
  const stepParam = Number.parseInt(resolved.step ?? "1", 10);
  const currentStep = Number.isFinite(stepParam) && stepParam >= 1 && stepParam <= TOTAL_STEPS ? stepParam : 1;

  return (
    <main id="main" className="flex flex-col">
      <header className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10 lg:px-10 lg:py-14">
          <p className="apex-eyebrow">Judge tour · 6-step narrative walkthrough</p>
          <h1 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">
            APEX, paced for two minutes.
          </h1>
          <JudgeWalkthroughProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </div>
      </header>

      <section className="mx-auto w-full max-w-4xl px-6 py-12 lg:px-10 lg:py-16">
        {currentStep === 1 && (
          <JudgeWalkthroughStep
            stepNumber={1}
            totalSteps={TOTAL_STEPS}
            eyebrow="Step 1 · Problem"
            headline="Adaptive racers do not have a race engineer."
            body={
              <>
                <p>
                  Track Titan and Trophi.ai assume able-bodied physics: throttle times brake equals zero, no
                  exceptions. Drivers using FIA-approved electronic hand-controls press both simultaneously
                  by design. Existing AI race engineers misdiagnose this as driver error or invalid telemetry.
                </p>
                <p>
                  APEX is the race engineer for the drivers who do not have one. Built on IBM Granite. Free
                  at point of use. Apache 2.0.
                </p>
              </>
            }
            nextStep={2}
          />
        )}
        {currentStep === 2 && (
          <JudgeWalkthroughStep
            stepNumber={2}
            totalSteps={TOTAL_STEPS}
            eyebrow="Step 2 · IBM stack"
            headline="Twelve IBM tools. Per-tool honesty tier."
            body={
              <>
                <p>
                  Two tools wired at HEAD (Granite Instruct 4.1 8B coaching narration + Granite 4.0 Nano 350M
                  WebGPU edge model). Seven at integration with canonical type contracts and backend swap-
                  points per Vinh M3-V1 through M3-V11. One demo-facade (Langflow per D-017). Two build-time
                  accelerators.
                </p>
                <p>
                  Honesty tier rendered as a per-tool status pill on the / page StackBadges grid and the
                  /judges IBM_STACK panel. No tool listed without a runtime role in the pipeline.
                </p>
              </>
            }
            cta={{ href: "/judges#stack", label: "Open the IBM stack panel" }}
            previousStep={1}
            nextStep={3}
          />
        )}
        {currentStep === 3 && (
          <JudgeWalkthroughStep
            stepNumber={3}
            totalSteps={TOTAL_STEPS}
            eyebrow="Step 3 · Engine-agnostic byte-equality"
            headline="V1 NumPy and V2 cvxpylayers emit byte-identical violation strings."
            body={
              <>
                <p>
                  Per D-050 (Vinh commit `9048575`), the V1 NumPy validator's `.to_text()` and the V2
                  cvxpylayers projector's `.to_text()` produce byte-identical violation strings modulo a
                  single ENGINE header line. The test at
                  `app/backend/tests/test_physics_v2.py::test_v1_v2_to_text_byte_equal_modulo_engine_line`
                  is the production lock.
                </p>
                <p>
                  This is the load-bearing technical-positioning claim. Granite Guardian audits the same text
                  regardless of which engine produced it. Stage A (8-tier Pacejka) and Stage B (3-iteration
                  SCP) are deferred per D-031 staged ladder via the `DifferentiableProjector` Protocol
                  one-constructor-call swap.
                </p>
              </>
            }
            cta={{ href: "/judges#engine-agnostic", label: "See the byte-equality demo" }}
            previousStep={2}
            nextStep={4}
          />
        )}
        {currentStep === 4 && (
          <JudgeWalkthroughStep
            stepNumber={4}
            totalSteps={TOTAL_STEPS}
            eyebrow="Step 4 · Tactile differentiator"
            headline="Flip the COA simultaneity gate. Watch the verdict change."
            body={
              <>
                <p>
                  The same physical input (residual brake pressure + rising throttle) is feasible or a
                  violation depending on whether the driver's COA permits simultaneity. APEX reads the COA at
                  tensor level; existing tools cannot.
                </p>
                <p>
                  The /judges page carries an interactive toggle. Click `coa_overlap_flag = 1` to `0` and the
                  projector verdict flips from `feasible` to `violation`. That is the load-bearing
                  differentiator nobody else in the field has.
                </p>
              </>
            }
            cta={{ href: "/judges#coa-toggle", label: "Open the COA gate toggle" }}
            previousStep={3}
            nextStep={5}
          />
        )}
        {currentStep === 5 && (
          <JudgeWalkthroughStep
            stepNumber={5}
            totalSteps={TOTAL_STEPS}
            eyebrow="Step 5 · Galaxy-tier moves"
            headline="Six shouldn't-be-possible moves stacked on a frozen-backbone TSFM."
            body={
              <>
                <p>
                  Per D-019: WebGPU Granite Nano 350M edge model (Layer 0); Activated LoRA hot-swap (Layer 6);
                  GEPA reflective prompt optimization (Layer 5); EAGLE-3 speculative decoding (Layer 6
                  inference); Agent-as-Judge tri-agent critic loop (Layer 7); IBM TSPulse polyphase
                  time-frequency anomaly detector (Layer 2).
                </p>
                <p>
                  The G4 zero-shot bake-off failed by ~2x on speed_mps. The pre-committed pivot trigger
                  fired. D-010 Track 1 channel-mix decoder fine-tune shipped Day 5 within 12 hours. APEX Lite
                  was NOT triggered. The engine-agnostic boundary held. That is project quality.
                </p>
              </>
            }
            cta={{ href: "/judges#galaxy-moves", label: "Open the galaxy-moves cluster" }}
            previousStep={4}
            nextStep={6}
          />
        )}
        {currentStep === 6 && (
          <JudgeWalkthroughStep
            stepNumber={6}
            totalSteps={TOTAL_STEPS}
            eyebrow="Step 6 · Submission package"
            headline="Live deploy. Reproducible Docker. Apache 2.0. Ready to evaluate."
            body={
              <>
                <p>
                  apex-one-black.vercel.app verified live: 12 of 12 routes 200; Granite 4.1 8B routing
                  end-to-end via 5 OpenRouter env vars; HARD-COMPLIANCE server-side regex scrubber active;
                  Watson TTS production path operational; PWA installable.
                </p>
                <p>
                  Repository: github.com/StephenSook/apex (Apache 2.0). NeurIPS Workshop paper draft at
                  paper/apex-neurips-workshop-2026.md. Three-minute submission video + 30-second highlight
                  clip + pitch deck PDF (Day 10 record). Multi-track entry (4 BeMyApp categories: 1st +
                  Runner-up + Best Use of Technology + Most Innovative).
                </p>
              </>
            }
            cta={{ href: "/judges", label: "Open the full /judges tour" }}
            previousStep={5}
          />
        )}
      </section>
    </main>
  );
}
