/**
 * GraniteCitationFooter: per-recommendation citation chain rendered
 * below the existing ProvenanceFooterBlock in CoachingReport. Surfaces
 * the retrieved-passage IDs + section anchors + Granite paragraph
 * excerpts that grounded the coaching prose, so judges can audit the
 * chain from coaching claim back to the FIA Appendix L / COA / paddock-
 * physics source material.
 *
 * Wave-42 Lane A.G.3 close-out per the competitor field deep-dive
 * memory `project_apex_competitor_field_may_challenge.md` steal-list
 * MEDIUM-value item #3 (NeuroPit `granite_client.py:181-203` per-
 * recommendation citation pattern). APEX adapts the pattern to a
 * consolidated chain footer (vs NeuroPit's per-recommendation expandable)
 * because the editorial-paddock layout favors the unified citation
 * column over scattered per-card expandables.
 *
 * Mock-fixture phase: passage data is hard-coded for the Day-6 demo;
 * production wires per the Stream M.3 spec handoff at
 * `docs/wave-41-backend-spec-handoff.md` extension (Vinh adds the
 * `triggered_rules[].passage_id + section_anchor + excerpt` payload to
 * the BackendGuardianAudit emitter in his next sync window).
 *
 * Editorial-paddock palette: --font-mono for passage IDs + --font-display
 * for section anchors + --color-accent for rule-severity badges +
 * --color-amber for "monitor" severity. <details> + <summary> for
 * native expandable semantics (no JS toggle; keyboard + screen-reader
 * accessible without ARIA work).
 */

import type { CoachingReport } from "../../shared/types";

interface GraniteCitationFooterProps {
  readonly report: CoachingReport;
}

interface CitationLine {
  readonly rule_id: string;
  readonly passage_id: string;
  readonly section_anchor: string;
  readonly excerpt: string;
  readonly severity: "info" | "monitor" | "critical";
}

// Mock-fixture phase: passage data is hard-coded for the Day-6 demo.
// Production wires the triggered_rules payload via Stream M.3 spec
// handoff backend extension.
const MOCK_CITATIONS: ReadonlyArray<CitationLine> = [
  {
    rule_id: "fia_appendix_l_adaptive_simultaneity",
    passage_id: "granite-r2-149m-passage-04812",
    section_anchor: "FIA Appendix L (article TBD per published revision)",
    excerpt:
      "Adaptive driving equipment that permits simultaneous brake-and-throttle actuation is approved when the medical certificate documents the underlying motor-control limitation that makes the simultaneity biomechanically necessary.",
    severity: "info",
  },
  {
    rule_id: "coa_mme_motorsport_simultaneity",
    passage_id: "granite-r2-149m-passage-04931",
    section_anchor: "Driver COA · MME Motorsport hand-control hardware",
    excerpt:
      "Independent brake-lever path + throttle-ring path permit any combination of brake-throttle actuation including full overlap during trail-brake-into-corner-apex.",
    severity: "info",
  },
  {
    rule_id: "pacejka_friction_ellipse_tier_8",
    passage_id: "granite-r2-149m-passage-05204",
    section_anchor: "Tier 8 physics · friction ellipse (Pacejka 96)",
    excerpt:
      "Combined longitudinal + lateral acceleration must remain within the friction ellipse; the per-step projection enforces this as a Stage 1 differentiable QP constraint.",
    severity: "monitor",
  },
];

function severityBadgeClass(severity: CitationLine["severity"]): string {
  switch (severity) {
    case "info":
      return "border-racing-green text-racing-green";
    case "monitor":
      return "border-amber text-amber";
    case "critical":
      return "border-accent text-accent";
    default: {
      const _exhaustive: never = severity;
      throw new Error(`unknown citation severity: ${String(_exhaustive)}`);
    }
  }
}

function severityLabel(severity: CitationLine["severity"]): string {
  switch (severity) {
    case "info":
      return "Info";
    case "monitor":
      return "Monitor";
    case "critical":
      return "Critical";
    default: {
      const _exhaustive: never = severity;
      throw new Error(`unknown citation severity: ${String(_exhaustive)}`);
    }
  }
}

export default function GraniteCitationFooter(_props: GraniteCitationFooterProps) {
  // Wave-42 cascade-fix-forward 1c95ab5: dropped the driverId reference
  // from the section subhead. Prior render duplicated the report.driver_id
  // span already shown in the CoachingReport header which caused
  // `getByText("sarah-reynolds-britcar-2026")` assertions in 3 test files
  // (AnalyzeFlow.test.tsx + AnalyzeFlow.error.test.tsx + CoachingReport.
  // test.tsx) to fail with "Found multiple elements with the text" per
  // the cascade #1 family pattern. The citation chain is session-scoped
  // implicitly via its placement inside CoachingReport; the driver-id
  // anchor was redundant. _props prefix per @typescript-eslint convention
  // since the prop is intentionally unused after the fix-forward.
  return (
    <section
      aria-labelledby="granite-citation-footer-title"
      className="mt-8 rounded-sm border border-rule bg-paper p-5"
    >
      <header className="pb-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
          Granite citation chain · wave-42 G.3
        </p>
        <h3
          id="granite-citation-footer-title"
          className="font-display text-xl tracking-tight text-ink"
        >
          Sources behind this coaching report.
        </h3>
        <p className="pt-1 text-xs leading-relaxed text-ink-soft">
          Every coaching recommendation above traces back to a Granite
          Embedding R2 retrieved passage. Audit the chain from claim to
          source via the citation list below.
        </p>
      </header>
      <ul className="flex flex-col gap-3">
        {MOCK_CITATIONS.map((citation) => (
          <li
            key={citation.rule_id}
            className="flex flex-col gap-2 rounded-sm border border-rule bg-paper-warm p-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-display text-base text-ink">
                {citation.section_anchor}
              </p>
              <span
                className={`rounded-sm border bg-paper px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${severityBadgeClass(citation.severity)}`}
              >
                {severityLabel(citation.severity)}
              </span>
            </div>
            <details className="group">
              <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-racing-green group-open:text-accent">
                Granite excerpt · {citation.passage_id}
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                {citation.excerpt}
              </p>
            </details>
            <p className="font-mono text-[10px] text-muted">
              Rule id: {citation.rule_id}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted">
        Mock-fixture phase · backend wires per Stream M.3 spec
      </p>
    </section>
  );
}
