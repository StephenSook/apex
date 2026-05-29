/**
 * TwinDriverNarrativePanel: wave-46 D-058 Phase 7.1 storytelling-killshot
 * surface mounted on /compare below the existing summary cards. Shows the
 * SAME physical event coached differently for an adaptive driver vs a
 * veteran archetype, with the COA simultaneity gate as the deciding
 * factor between feasible + violation. Persona-decoupling per Lane K rule:
 * "Driver A · adaptive driver" + "Driver B · veteran archetype" stay as
 * generic labels; persona-named drivers live in storytelling layer only.
 *
 * This is the Mission 44 storytelling killshot in one card: same input,
 * different coaching, because the COA reads as a binding regulatory
 * tensor input. Judges see the operator-empathy delta inline.
 *
 * Pure UI; no fetch. Sookra Methodology Pillar 3 (Storytelling) + Pillar 4
 * (Operator empathy) per wave-30 D-022 lexicographic COA constraint
 * hierarchy + paper §3.4 COA-parameterized simultaneity gate.
 */

interface CoachingExcerpt {
  readonly persona: string;
  readonly coa_overlap_flag: 0 | 1;
  readonly verdict: "feasible" | "violation";
  readonly coaching_action: string;
  readonly rationale: string;
}

const ADAPTIVE_EXCERPT: CoachingExcerpt = {
  persona: "Driver A · adaptive driver (hand-control rig)",
  coa_overlap_flag: 1,
  verdict: "feasible",
  coaching_action:
    "Trail-brake in two micro-presses (4mm + 6mm on the secondary lever) into turn 3 while feathering throttle on the primary control.",
  rationale:
    "Your FIA Certificate of Adaptations approves the brake + throttle simultaneity per the adaptive-equipment provisions of FIA Appendix L per the published revision. The same physical input that a validator hard-coding mutual-exclusion would flag as a violation is feasible here because the COA hardware-spec section permits the dual-lever pattern. The projector reads coa_overlap_flag = 1 + accepts the input.",
};

const VETERAN_EXCERPT: CoachingExcerpt = {
  persona: "Driver B · veteran archetype (standard controls, no adaptive COA)",
  coa_overlap_flag: 0,
  verdict: "violation",
  coaching_action:
    "Release brake fully before applying throttle into turn 3. Standard trail-brake technique with sequential pedal handoff.",
  rationale:
    "Without an adaptive COA on file, the projector reads coa_overlap_flag = 0 + applies the default throttle * brake = 0 mutual-exclusion constraint. The same physical input pattern (residual brake pressure + rising throttle) flags as a brake-throttle simultaneity violation. Coaching prescribes the sequential pedal handoff the regulatory baseline requires.",
};

function VerdictPill({ verdict }: { readonly verdict: "feasible" | "violation" }) {
  return (
    <span
      className={`rounded-sm border px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${
        verdict === "feasible"
          ? "border-racing-green bg-racing-green text-paper"
          : "border-accent bg-paper text-accent"
      }`}
    >
      {verdict}
    </span>
  );
}

function ExcerptCard({ excerpt }: { readonly excerpt: CoachingExcerpt }) {
  const isFeasible = excerpt.verdict === "feasible";
  return (
    <article
      className={`flex flex-col gap-3 rounded-sm border-2 ${
        isFeasible ? "border-racing-green" : "border-accent"
      } bg-paper-warm p-5`}
    >
      <header className="flex items-baseline justify-between gap-3">
        <p className="apex-eyebrow">{excerpt.persona}</p>
        <VerdictPill verdict={excerpt.verdict} />
      </header>
      <div className="flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-wider">
        <span className="text-muted">coa_overlap_flag</span>
        <span
          className={`rounded-sm border px-2 py-0.5 ${
            isFeasible
              ? "border-racing-green text-racing-green"
              : "border-accent text-accent"
          }`}
        >
          {excerpt.coa_overlap_flag}
        </span>
      </div>
      <p className="font-display text-lg leading-snug text-ink">
        {excerpt.coaching_action}
      </p>
      <p className="text-sm leading-relaxed text-ink-soft">{excerpt.rationale}</p>
    </article>
  );
}

export default function TwinDriverNarrativePanel() {
  return (
    <section
      aria-labelledby="twin-driver-narrative-title"
      className="mt-10 flex flex-col gap-5 rounded-sm border-2 border-rule bg-paper p-6"
    >
      <header>
        <p className="apex-eyebrow">
          Twin-driver coaching delta · same physical event · two persona archetypes
        </p>
        <h2
          id="twin-driver-narrative-title"
          className="font-display text-2xl tracking-tight text-ink"
        >
          The storytelling killshot.
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft">
          Same telemetry pattern (residual brake pressure 0.42 MPa + rising throttle 12 percent
          into turn 3). Different coaching action depending on what the driver&apos;s FIA Certificate of
          Adaptations actually says they are allowed to do. APEX reads the COA at the tensor
          level + the projector verdict changes. This is the operator-empathy delta in one
          card.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <ExcerptCard excerpt={ADAPTIVE_EXCERPT} />
        <ExcerptCard excerpt={VETERAN_EXCERPT} />
      </div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Cross-ref: <span className="text-ink-soft">Sookra Methodology Pillar 3 (Storytelling) + Pillar 4 (Operator empathy) + wave-30 D-022 lexicographic COA constraint hierarchy + paper §3.4 COA-parameterized simultaneity gate + Lane K persona-decoupling (drivers stay anonymous archetypes; persona names live in storytelling layer only)</span>
      </p>
    </section>
  );
}
