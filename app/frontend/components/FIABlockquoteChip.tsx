/**
 * FIABlockquoteChip: a prominent, citation-anchored characterization of an
 * FIA Appendix L provision.
 *
 * HARD-COMPLIANCE (no-invented-FIA rule): the `quote` text is APEX's plain-
 * language CHARACTERIZATION of the regulation, NOT a verbatim FIA quote. The
 * public FIA sources do not publish a discrete brake-throttle-simultaneity
 * field (see paper/physics-ttm-methods.md), so APEX derives the simultaneity
 * flag from the approved hand-control hardware specification recorded in the
 * driver's Certificate of Adaptations rather than asserting regulatory text the
 * FIA does not publish. The chip references "FIA Appendix L" (which governs the
 * Certificate of Adaptations) without asserting a specific Article number, and
 * the Verify link points at the public FIA disability/accessibility page so the
 * framing is checkable. The component renders the text as a labelled
 * characterization, not inside quotation marks, so it can never read as a
 * fabricated verbatim regulation.
 *
 * Editorial-paddock palette: cream paper backdrop, racing-green rule, clay-red
 * citation chip, ink prose.
 *
 * Self-contained; accepts a `revision` prop so different surfaces can pin the
 * Appendix L revision in effect if the published source advances mid-season.
 */

interface FIABlockquoteChipProps {
  readonly quote: string;
  readonly attribution: string;
  readonly revision?: string;
  readonly sectionAnchor?: string;
  readonly sourceUrl?: string;
}

const DEFAULT_REVISION = "Per the published revision in effect at session time.";
const DEFAULT_SECTION_ANCHOR = "FIA Certificate of Adaptations · Appendix L";
const DEFAULT_SOURCE_URL = "https://www.fia.com/disability-accessibility";

export default function FIABlockquoteChip({
  quote,
  attribution,
  revision = DEFAULT_REVISION,
  sectionAnchor = DEFAULT_SECTION_ANCHOR,
  sourceUrl = DEFAULT_SOURCE_URL,
}: FIABlockquoteChipProps) {
  return (
    <figure
      className="apex-rise my-8 border-l-4 border-racing-green bg-paper-warm p-6 sm:p-8"
      style={{ ["--apex-delay" as string]: "200ms" }}
    >
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        APEX characterization of the regulation, not a verbatim quote
      </p>
      <p className="mt-2 font-display text-xl sm:text-2xl leading-snug text-ink">
        {quote}
      </p>

      <figcaption className="mt-5 flex flex-col gap-3">
        <p className="font-display text-sm italic text-ink-soft">{attribution}</p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-sm bg-accent px-3.5 py-2 font-mono text-[13px] font-semibold uppercase tracking-[0.16em] text-paper">
            <span aria-hidden="true">FIA Appendix L</span>
            <span aria-hidden="true" className="opacity-70">·</span>
            <span>{revision}</span>
          </span>

          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
            {sectionAnchor}
          </span>
        </div>

        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="font-mono text-[11px] uppercase tracking-wider text-racing-green underline-offset-4 hover:underline focus-visible:underline"
        >
          Verify on FIA.com &rarr;
        </a>
      </figcaption>
    </figure>
  );
}
