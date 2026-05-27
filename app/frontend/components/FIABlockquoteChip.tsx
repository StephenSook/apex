/**
 * FIABlockquoteChip: prominent blockquote-styled verbatim FIA Appendix L
 * passage with citation chip (revision + section anchor + source link).
 *
 * Cascade-#48 wave-46 OVERRIDE-steal #3 (per
 * `project_apex_override_competitor.md` steal-list item #3, lifted
 * from OVERRIDE session-debrief surface where every coaching insight
 * carries a verbatim-quote blockquote with article + issue date +
 * section + source link). APEX adapts the pattern to honor the
 * project HARD-COMPLIANCE no-invented-FIA-Articles rule: the citation
 * chip references "FIA Appendix L per the published revision" rather
 * than an asserted Article number, and the blockquote text is a real
 * Appendix L passage transcribed from the published PDF in `research/`.
 *
 * Editorial-paddock palette: cream paper backdrop, racing-green
 * blockquote rule, clay-red citation chip, ink prose. IBM Plex Mono
 * for the citation chip + Fraunces italic for the quote attribution.
 *
 * Positioned for mount on `/judges`, `/methodology`, `/analyze` and
 * any other surface that asserts coaching authority. The component is
 * self-contained and accepts a `revision` prop so different surfaces
 * can pin different Appendix L revisions if the published authoritative
 * source advances mid-season.
 */

interface FIABlockquoteChipProps {
  readonly quote: string;
  readonly attribution: string;
  readonly revision?: string;
  readonly sectionAnchor?: string;
  readonly sourceUrl?: string;
}

const DEFAULT_REVISION = "Per the published revision in effect at session time.";
const DEFAULT_SECTION_ANCHOR = "Adaptive-driver vehicle modifications + control-input simultaneity provisions";
const DEFAULT_SOURCE_URL = "https://www.fia.com/regulation/category/123";

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
      <blockquote className="font-display text-xl sm:text-2xl leading-snug text-ink italic">
        &ldquo;{quote}&rdquo;
      </blockquote>

      <figcaption className="mt-5 flex flex-col gap-3">
        <p className="font-display text-sm italic text-ink-soft">
          {attribution}
        </p>

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
