import type { Metadata } from "next";
import Link from "next/link";

import TwinDriverNarrativePanel from "../../components/TwinDriverNarrativePanel";

/**
 * /compare?drivers=a,b route. Wave-45 Phase 6 Block C.3 close-out
 * per the ApexIQ competitor deep-dive steal-list item #3 (Compare-
 * Runs verdict narrative). Multi-driver side-by-side coaching
 * report comparison with delta visualization.
 *
 * Lane K persona-decoupling: driver labels use generic "Driver A"
 * / "Driver B" by default; persona-named drivers live in storytelling
 * layer only. Per Sookra Methodology Pillar 4 + wave-43 Lane K rule.
 */

export const metadata: Metadata = {
  title: "Compare drivers | APEX",
  description:
    "Side-by-side coaching-report comparison across two driver runs with delta visualization. Multi-driver compare answers the ApexIQ baseline-vs-improved steal-list item with adaptive-racing audience anchor.",
};

interface DriverSnapshot {
  readonly id: string;
  readonly label: string;
  readonly avg_speed_mps: number;
  readonly risk_score: number;
  readonly wheel_slip_pct: number;
  readonly coa_overlap_flag: 0 | 1;
}

const DEFAULT_DRIVER_A: DriverSnapshot = {
  id: "driver-a",
  label: "Driver A · baseline run",
  avg_speed_mps: 62.4,
  risk_score: 42.18,
  wheel_slip_pct: 7.3,
  coa_overlap_flag: 1,
};

const DEFAULT_DRIVER_B: DriverSnapshot = {
  id: "driver-b",
  label: "Driver B · improved run",
  avg_speed_mps: 62.95,
  risk_score: 46.45,
  wheel_slip_pct: 7.52,
  coa_overlap_flag: 1,
};

function formatDelta(a: number, b: number, decimals = 2): { display: string; sign: "pos" | "neg" | "zero" } {
  const delta = b - a;
  const sign = delta > 0.001 ? "pos" : delta < -0.001 ? "neg" : "zero";
  const prefix = sign === "pos" ? "+" : sign === "neg" ? "" : "±";
  return { display: `${prefix}${delta.toFixed(decimals)}`, sign };
}

function deltaPill(
  sign: "pos" | "neg" | "zero",
  higherIsBetter: boolean,
): string {
  // Wave-45.5 code-reviewer CRITICAL C-2 close: deltaPill previously mapped
  // pos -> green + neg -> red regardless of metric direction. Risk + slip are
  // "lower-is-better" metrics; a pos delta on risk should read red. Per-metric
  // higherIsBetter flag inverts color when needed so the pill matches the
  // verdict copy below.
  const good = sign === "pos" ? higherIsBetter : sign === "neg" ? !higherIsBetter : null;
  if (good === null) {
    return "border-rule bg-paper text-muted";
  }
  return good
    ? "border-racing-green bg-paper text-racing-green"
    : "border-accent bg-paper text-accent";
}

function verdictCopy(a: DriverSnapshot, b: DriverSnapshot): string {
  const fasterB = b.avg_speed_mps > a.avg_speed_mps;
  const riskierB = b.risk_score > a.risk_score;
  if (fasterB && riskierB) {
    return "Faster but riskier. Tune for stability: the lap-time win comes from increased wheel-slip exposure on the load-transfer corners. Recommend stage-A Pacejka linearisation (Vinh M3-V12) before stacking another aggression delta.";
  }
  if (fasterB && !riskierB) {
    return "Faster + lower risk. Improved run dominates the baseline. Recommend locking the aggression delta + propagating the technique change to the next session.";
  }
  if (!fasterB && riskierB) {
    return "Slower + riskier. Improved run regressed; recommend reverting the aggression delta + reviewing the COA constraint surface.";
  }
  return "Slower or unchanged. No measurable lap-time improvement; review the technique change OR baseline fixture.";
}

interface ComparePageProps {
  readonly searchParams: Promise<{ drivers?: string }>;
}

function pickDriverById(id: string): DriverSnapshot | null {
  if (id === DEFAULT_DRIVER_A.id) return DEFAULT_DRIVER_A;
  if (id === DEFAULT_DRIVER_B.id) return DEFAULT_DRIVER_B;
  return null;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { drivers } = await searchParams;
  // Wave-45.5 code-reviewer codex MED close: ?drivers=a,b query param now
  // honored. Format: "driver-a,driver-b" with comma-separated IDs. Unknown
  // IDs or missing param fall back to default fixture pair. Lane K
  // persona-decoupling rule kept: only generic Driver A + Driver B labels
  // ship; real driver-by-name selection lands when Vinh M3-V## session-
  // store endpoint goes live.
  const [parsedA, parsedB] = (drivers ?? "").split(",");
  const a = (parsedA && pickDriverById(parsedA)) || DEFAULT_DRIVER_A;
  const b = (parsedB && pickDriverById(parsedB)) || DEFAULT_DRIVER_B;
  const speedDelta = formatDelta(a.avg_speed_mps, b.avg_speed_mps, 2);
  const riskDelta = formatDelta(a.risk_score, b.risk_score, 2);
  const slipDelta = formatDelta(a.wheel_slip_pct, b.wheel_slip_pct, 2);
  const verdict = verdictCopy(a, b);
  return (
    <main id="main" className="flex flex-col">
      <header className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-12 lg:px-10 lg:py-16">
          <p className="apex-eyebrow">Compare drivers · baseline vs improved · delta visualization</p>
          <h1 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">
            Two runs. Three deltas. One verdict.
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-ink-soft">
            Wave-45 Phase 6 Block C.3 close-out per the ApexIQ competitor deep-dive steal-list item #3.
            Stub fixtures use generic Driver A + Driver B labels per Lane K persona-decoupling rule;
            real driver-to-driver compare wires when Vinh&apos;s Phase 4 task 4.X session-store endpoint
            lands.
          </p>
        </div>
      </header>

      <section className="mx-auto w-full max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {[a, b].map((snapshot) => (
            <article
              key={snapshot.id}
              className="flex flex-col gap-3 rounded-sm border-2 border-rule bg-paper-warm p-5"
            >
              <header>
                <p className="apex-eyebrow">{snapshot.label}</p>
                <h2 className="font-display text-2xl tracking-tight text-ink">{snapshot.id}</h2>
              </header>
              <dl className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="flex flex-col rounded-sm border border-rule bg-paper p-3">
                  <dt className="text-[10px] uppercase tracking-wider text-muted">avg speed (m/s)</dt>
                  <dd className="pt-1 text-ink">{snapshot.avg_speed_mps.toFixed(2)}</dd>
                </div>
                <div className="flex flex-col rounded-sm border border-rule bg-paper p-3">
                  <dt className="text-[10px] uppercase tracking-wider text-muted">risk score</dt>
                  <dd className="pt-1 text-ink">{snapshot.risk_score.toFixed(2)}</dd>
                </div>
                <div className="flex flex-col rounded-sm border border-rule bg-paper p-3">
                  <dt className="text-[10px] uppercase tracking-wider text-muted">wheel slip (%)</dt>
                  <dd className="pt-1 text-ink">{snapshot.wheel_slip_pct.toFixed(2)}</dd>
                </div>
                <div className="flex flex-col rounded-sm border border-rule bg-paper p-3">
                  <dt className="text-[10px] uppercase tracking-wider text-muted">COA flag</dt>
                  <dd className={`pt-1 ${snapshot.coa_overlap_flag === 1 ? "text-racing-green" : "text-accent"}`}>
                    {snapshot.coa_overlap_flag === 1 ? "permitted (1)" : "blocked (0)"}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        <section className="mt-10 flex flex-col gap-4 rounded-sm border-2 border-racing-green bg-paper p-6">
          <h2 className="font-display text-2xl tracking-tight text-ink">Delta + verdict.</h2>
          <dl className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "avg speed (m/s)", delta: speedDelta, higherIsBetter: true },
              { label: "risk score", delta: riskDelta, higherIsBetter: false },
              { label: "wheel slip (%)", delta: slipDelta, higherIsBetter: false },
            ].map(({ label, delta, higherIsBetter }) => (
              <div key={label} className="flex flex-col gap-1">
                <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</dt>
                <dd
                  className={`self-start rounded-sm border px-3 py-1 font-mono text-lg ${deltaPill(delta.sign, higherIsBetter)}`}
                >
                  {delta.display}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 font-display text-lg leading-snug text-ink">{verdict}</p>
        </section>

        <TwinDriverNarrativePanel />

        <p className="mt-8 font-mono text-xs text-muted">
          Cross-ref: ApexIQ competitor deep-dive (2026-05-25) steal-list item #3 + Lane K persona-
          decoupling rule + Sookra Methodology Pillar 1 (Product credibility).{" "}
          <Link href="/judges" className="text-racing-green underline decoration-dotted underline-offset-2">
            Back to /judges
          </Link>
        </p>
      </section>
    </main>
  );
}
