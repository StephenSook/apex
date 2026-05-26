import type { Metadata } from "next";
import Link from "next/link";

/**
 * /methodology page. Wave-45 Phase 6 Block C.3 close-out. Sookra
 * Methodology Five Pillars landing page with editorial-paddock
 * visualization + 5 deep-dive cards per pillar + cross-references
 * to project memory entries.
 */

export const metadata: Metadata = {
  title: "Methodology | APEX",
  description:
    "Sookra Methodology Five Pillars: Product credibility + Technical positioning + Defensibility + Storytelling + Business case. The discipline that produced APEX.",
};

interface Pillar {
  readonly number: number;
  readonly name: string;
  readonly headline: string;
  readonly body: string;
  readonly artifact: string;
}

const PILLARS: ReadonlyArray<Pillar> = [
  {
    number: 1,
    name: "Product credibility",
    headline: "No hardcoded personas in default UI state.",
    body: "Persona stories live in the storytelling layer only (video + storyboard + deck + persona doc + opt-in CTA). Default product UI is persona-agnostic. Validated by 2026 hackathon judge sentiment shift from 'convincing demo' to 'actually viable product' (April Guo, Anthropic, 2026 GitLab AI Hackathon).",
    artifact: "feedback_persona_not_hardcoded_in_ui.md + Lane K sweep across runtime UI surfaces (wave-43 + wave-44 + wave-45 BLOCKER-grade audits).",
  },
  {
    number: 2,
    name: "Technical positioning",
    headline: "First-claims that survive prior-art search.",
    body: "Three narrow 'first' claims: first application of a pretrained TSFM to adaptive motorsport telemetry (zero-shot pivoted to fine-tune-first per D-052); first public AI race-engineer workflow we found that reads the FIA Certificate of Adaptations as a binding regulatory input; first COA-parameterized brake-throttle simultaneity gate. We do NOT claim 'first physics-projection layer on a TSFM in any domain'.",
    artifact: "paper §1 + §5.3 + project_apex_qa_killshots #1 Deep Dynamics differentiator.",
  },
  {
    number: 3,
    name: "Defensibility",
    headline: "Cite specific sources. Never invent regulatory anchors.",
    body: "HARD-COMPLIANCE server-side scrubber (Cascade-#21 + cascade-#22 expanded for abbreviated Art./§/Sec. forms) strips invented FIA Article + COA Section numbers from LLM output regardless of model behavior. Independent of system-prompt-forbidding. Engine-agnostic byte-equality lock per D-050 (test_v1_v2_to_text_byte_equal_modulo_engine_line) is the second-layer safety contract.",
    artifact: "feedback_llm_output_compliance_scrubber.md + app/frontend/app/api/openrouter-stream/route.ts scrubInventedRegulatoryAnchors().",
  },
  {
    number: 4,
    name: "Storytelling",
    headline: "Editorial-paddock palette, locked Day 1.",
    body: "Cream paper (#F4EBD8) + racing-green (#0A2818) + clay accent (#C1492C) + amber highlight (#D9A441) + near-black ink (#0F1410). Fraunces display + IBM Plex Sans body + IBM Plex Mono numerics. Coherent across briefing PDF + web frontend + deck + 3-min demo video. Visual identity is a load-bearing differentiator vs commodity dark-tech-forward aesthetics.",
    artifact: "CLAUDE.md editorial-paddock visual identity lock + app/frontend/app/globals.css palette + Fraunces opsz-only axis per wave-44 perf HIGH #4.",
  },
  {
    number: 5,
    name: "Business case",
    headline: "Real downstream value, not just a hackathon submission.",
    body: "Every technical decision maps explicitly to a deployable product surface that adaptive racers, veteran-transition drivers, and grassroots competitors can use today, free at point of use under Apache 2.0. The submission package is a stepping stone toward a sustainable open-source race-engineer artifact, not the end-state of the work.",
    artifact: "Sookra Methodology Pillar 5 + Apache 2.0 license + production deploy + paper §5 future-work outline.",
  },
];

export default function MethodologyPage() {
  return (
    <main id="main" className="flex flex-col">
      <header className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-12 lg:px-10 lg:py-16">
          <p className="apex-eyebrow">Sookra Methodology · Five Pillars</p>
          <h1 className="font-display text-5xl tracking-tight text-ink sm:text-6xl">
            The discipline behind APEX.
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-ink-soft">
            APEX did not happen by accident. Five pillars + a galaxy-ambition mandate produced a project
            that ships 300+ atomic commits in 12 days with engine-agnostic byte-equality lock, fine-tune-
            first pivot in 12 hours, and per-tool honesty tier across every IBM Granite mention.
          </p>
          <p className="font-mono text-xs text-muted">
            Cross-reference: docs/methodology.md (full Sookra Methodology trace) + ~/.claude/projects/-Users-
            stephensookra-Desktop-IBM-May/memory/ (38+ load-bearing memory rules).
          </p>
        </div>
      </header>

      <section className="mx-auto w-full max-w-4xl px-6 py-12 lg:px-10 lg:py-16">
        <ol className="flex flex-col gap-8">
          {PILLARS.map((pillar) => (
            <li
              key={pillar.number}
              className="flex flex-col gap-4 rounded-sm border border-rule bg-paper-warm p-6 lg:p-8"
            >
              <header className="flex items-baseline gap-3">
                <span className="font-display text-5xl text-racing-green">{pillar.number}</span>
                <div className="flex flex-col gap-1">
                  <span className="apex-eyebrow">Pillar {pillar.number}</span>
                  <h2 className="font-display text-2xl tracking-tight text-ink">{pillar.name}</h2>
                </div>
              </header>
              <p className="font-display text-lg leading-snug text-ink">{pillar.headline}</p>
              <p className="text-base leading-relaxed text-ink-soft">{pillar.body}</p>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                Artifact: <span className="text-ink-soft">{pillar.artifact}</span>
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/judges"
            className="rounded-sm border border-racing-green bg-racing-green px-5 py-2 font-mono text-sm uppercase tracking-wider text-paper transition-colors hover:bg-racing-green-deep"
          >
            Open the judges&apos; tour
          </Link>
          <Link
            href="/judge-tour?step=1"
            className="rounded-sm border border-racing-green bg-paper px-5 py-2 font-mono text-sm uppercase tracking-wider text-racing-green transition-colors hover:bg-racing-green hover:text-paper"
          >
            Start the 6-step walkthrough
          </Link>
        </div>
      </section>
    </main>
  );
}
