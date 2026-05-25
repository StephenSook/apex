/**
 * JudgeTrackTighteningCallout: 4-card grid on /judges with explicit
 * "Wins X because Y" copy per BeMyApp prize category. Wave-45 Phase
 * 6 Block C.3 close-out per the wave-45 plan + the ApexIQ deep-dive
 * positioning-impact synthesis.
 *
 * Each card surfaces (a) the prize category, (b) the prize amount,
 * (c) the per-rubric "Wins X because Y" claim, (d) a deep-link CTA
 * to the /judges section that demonstrates the claim.
 *
 * Editorial-paddock palette. Server Component (pure render; no
 * client state).
 */

import Link from "next/link";

interface PrizeCard {
  readonly category: string;
  readonly prize: string;
  readonly claim: string;
  readonly evidence: string;
  readonly cta: { readonly href: string; readonly label: string };
}

const CARDS: ReadonlyArray<PrizeCard> = [
  {
    category: "1st Place ($2,250)",
    prize: "Grand Prize",
    claim: "Wins 1st because we ship the deepest IBM Granite stack + the only adaptive-racing audience differentiator in the field.",
    evidence: "12 IBM tools wired or integrated with per-tool honesty tier; COA-parameterized simultaneity gate (D-A + paper §3.4); engine-agnostic V1+V2 byte-equality lock (D-050); G4 FAIL pivot documented + executed in 12h.",
    cta: { href: "/judges#stack", label: "Open the IBM stack panel" },
  },
  {
    category: "Best Use of Technology ($750)",
    prize: "Sponsor track",
    claim: "Wins Best Use of Technology because every IBM tool earns its slot + the honesty tier is rendered as a per-tool status pill.",
    evidence: "Twelve tools across ingest, forecast, retrieval, generation, edge, orchestration. WIRED + INTEGRATION + FACADE + ACCELERATOR taxonomy renders on / page + /judges + README + paper.",
    cta: { href: "/judges#stack", label: "See per-tool honesty tier" },
  },
  {
    category: "Most Innovative ($750)",
    prize: "Sponsor track",
    claim: "Wins Most Innovative because we ship 6 shouldn't-be-possible moves stacked on a frozen-backbone TSFM with engine-agnostic projection.",
    evidence: "WebGPU Granite Nano 350M (Layer 0); Activated LoRA hot-swap (Layer 6); GEPA prompt optimization (Layer 5); EAGLE-3 speculative decoding (Layer 6); Agent-as-Judge tri-agent critic (Layer 7); IBM TSPulse polyphase anomaly detector (Layer 2).",
    cta: { href: "/judges#galaxy-moves", label: "Open the galaxy-moves cluster" },
  },
  {
    category: "Runner-up ($1,250)",
    prize: "Grand Prize ladder",
    claim: "Wins Runner-up because we ship the most production-ready submission in the cohort.",
    evidence: "apex-one-black.vercel.app LIVE with 14+ routes 200; HARD-COMPLIANCE server-side scrubber active; PWA installable; sim-rig HTTP-stream operational; 300+ atomic commits in 12 days; NeurIPS Workshop paper draft.",
    cta: { href: "https://apex-one-black.vercel.app", label: "Open the live deploy" },
  },
];

export default function JudgeTrackTighteningCallout() {
  return (
    <section
      aria-labelledby="track-tightening-title"
      className="rounded-sm border border-rule bg-paper p-5"
    >
      <h3 id="track-tightening-title" className="font-display text-2xl tracking-tight text-ink">
        Per-track tightening: explicit prize-by-prize claim.
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        ONE BeMyApp submission auto-enters all 4 prize categories ($5,000 total prize ladder). Each card
        below states the claim, the evidence, and the deep-link to the /judges section that demonstrates it.
        Galaxy-ambition multi-track entry per Sookra Methodology Pillar 5 (Business case).
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {CARDS.map((card) => (
          <li
            key={card.category}
            className="flex flex-col gap-3 rounded-sm border border-rule bg-paper-warm p-4"
          >
            <header className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-racing-green">
                {card.prize}
              </span>
              <h4 className="font-display text-lg leading-snug text-ink">{card.category}</h4>
            </header>
            <p className="text-sm leading-relaxed text-ink-soft">{card.claim}</p>
            <p className="font-mono text-[11px] leading-relaxed text-muted">
              Evidence: <span className="text-ink-soft">{card.evidence}</span>
            </p>
            <Link
              href={card.cta.href}
              className="self-start rounded-sm border border-racing-green bg-paper px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-racing-green transition-colors hover:bg-racing-green hover:text-paper"
            >
              {card.cta.label} →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
