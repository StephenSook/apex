/**
 * HARD-COMPLIANCE post-processor stripping invented FIA Article + COA
 * Section numeric identifiers from LLM output. The Granite 4.1 8B model
 * (and most LLMs) hallucinate plausible-looking regulatory anchors
 * despite the system-prompt forbidding them. Server-side scrubber
 * enforces the project HARD-COMPLIANCE rule + the no-invented-FIA-
 * articles compliance posture regardless of model behavior.
 *
 * Originally inline at app/api/openrouter-stream/route.ts (wave-43
 * cascade-#21 ship). Extracted to shared lib wave-46 Phase 6.2 so
 * every LLM-output route (openrouter-stream + coach-code + future
 * surfaces) imports the same canonical implementation per
 * `feedback_llm_output_compliance_scrubber.md` memory rule.
 *
 * Patterns matched:
 *   - "FIA Article N.N" / "FIA Article N.N.N" / "Article N.N" -> "FIA Appendix L per the published revision"
 *   - "Art. N.N" / "Art N.N" -> "Appendix L per the published revision"
 *   - "Appendix L §N.N" / "Appendix L §N" / "§N.N" / "§N(letter)" -> "Appendix L per the published revision"
 *   - "COA Section N.N" / "COA Section N.N.N" / "Section N.N(letter)" -> "the COA simultaneity gate"
 *   - "COA Sec. N" / "COA Sec N" / "Sec. N(letter)" -> "the COA simultaneity gate"
 *   - "Article N(letter)" -> "Appendix L per the published revision"
 *   - "FIA Appendix L Article N" -> "FIA Appendix L per the published revision"
 *
 * Verification fixture in tests/lib/openrouter-stream-scrub.test.ts.
 */
// Wave-46 Phase 9.3 suffix-handling: cover both `18.3a` (letter abutting
// the last decimal) AND `18.3.a` (dot-letter, FIA hierarchical form)
// across every Article + Section + Sec. variant below.
const SUFFIX = "(\\.[a-z]|[a-z])?";

// Wave-47 cascade-C #221 close per Codex HIGH: pre-normalize the input
// to collapse Unicode fullwidth digits (１-９) -> ASCII (1-9) + collapse
// spaces around dots ("18 . 3" -> "18.3") + collapse Unicode fullwidth
// dot (．) -> ASCII (.). Without this normalization, brutal-judge LLM
// outputs that contain "Article 18 . 3" or "Article １８.３" pass the
// HARD-COMPLIANCE gate untouched. The normalization is idempotent + safe
// to apply unconditionally before every regex pass below.
function normalizeForScrubber(text: string): string {
  return text
    .replace(/[０-９]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xff10 + 0x30),
    )
    .replace(/．/g, ".")
    .replace(/(\d)\s+\.\s+(\d)/g, "$1.$2")
    .replace(/(\d)\s+\.(\d)/g, "$1.$2")
    .replace(/(\d)\.\s+(\d)/g, "$1.$2");
}

/**
 * Cascade-#47 wave-46 OVERRIDE-steal: detector counterpart for the
 * scrubber. Returns the list of forbidden-anchor patterns that fired on
 * the input text, in human-readable form, for use in the
 * Self-Correcting Retry Loop on `/api/coach-code` (per
 * `project_apex_override_competitor.md` steal #1, lifted from OVERRIDE
 * `core/pipeline.py:118-132` retry-directive pattern). When this
 * function returns a non-empty array, the LLM has violated the
 * HARD-COMPLIANCE no-invented-FIA-articles rule and the route should
 * issue a retry-directive system message + regenerate.
 *
 * Probes for the SAME pattern families as `scrubInventedRegulatoryAnchors`
 * but does NOT mutate the text. The retry-loop calls this BEFORE deciding
 * whether to regenerate; the scrubber still runs as the final safety
 * net (defense in depth) even after the retry-loop terminates.
 */
export interface RegulatoryAnchorViolation {
  readonly pattern: string;
  readonly matches: ReadonlyArray<string>;
}

const VIOLATION_PROBES: ReadonlyArray<{ readonly label: string; readonly regex: RegExp }> = [
  {
    label: "FIA Appendix L Article N",
    regex: new RegExp(`FIA Appendix L Article \\d+(\\.\\d+)*${SUFFIX}`, "gi"),
  },
  {
    label: "FIA Article N (singular or plural)",
    regex: new RegExp(`FIA Articles? \\d+(\\.\\d+)*${SUFFIX}`, "gi"),
  },
  {
    label: "Article N (bare)",
    regex: new RegExp(`\\bArticles? \\d+(\\.\\d+)*${SUFFIX}`, "gi"),
  },
  {
    label: "Art. N abbrev",
    regex: new RegExp(`\\bArt\\.?\\s+\\d+(\\.\\d+)*${SUFFIX}`, "gi"),
  },
  {
    label: "Appendix L § N",
    regex: new RegExp(`Appendix L\\s*[§]\\s*\\d+(\\.\\d+)*${SUFFIX}`, "gi"),
  },
  {
    label: "§ N section reference",
    regex: /§\s*\d+(\.\d+)*(\([a-z]\))?/gi,
  },
  {
    label: "COA Section N",
    regex: new RegExp(`COA Section \\d+(\\.\\d+)*${SUFFIX}`, "gi"),
  },
  {
    label: "COA Sec N abbrev",
    regex: new RegExp(`COA\\s+Sec\\.?\\s+\\d+(\\.\\d+)*${SUFFIX}`, "gi"),
  },
  {
    label: "Section N.N (bare)",
    regex: new RegExp(`\\bSection \\d+\\.\\d+(\\.\\d+)*${SUFFIX}`, "g"),
  },
  {
    label: "Sec. N abbrev",
    regex: new RegExp(`\\bSec\\.?\\s+\\d+(\\.\\d+)*${SUFFIX}`, "gi"),
  },
];

export function detectInventedRegulatoryAnchors(
  text: string,
): ReadonlyArray<RegulatoryAnchorViolation> {
  const normalized = normalizeForScrubber(text);
  const violations: RegulatoryAnchorViolation[] = [];
  for (const probe of VIOLATION_PROBES) {
    const matches = normalized.match(probe.regex);
    if (matches !== null && matches.length > 0) {
      violations.push({ pattern: probe.label, matches: matches.slice(0, 5) });
    }
  }
  return violations;
}

export function hasInventedRegulatoryAnchors(text: string): boolean {
  return detectInventedRegulatoryAnchors(text).length > 0;
}

export function scrubInventedRegulatoryAnchors(text: string): string {
  return normalizeForScrubber(text)
    .replace(
      new RegExp(`FIA Appendix L Article \\d+(\\.\\d+)*${SUFFIX}`, "gi"),
      "FIA Appendix L per the published revision",
    )
    .replace(
      new RegExp(
        `FIA Articles \\d+(\\.\\d+)*${SUFFIX}(\\s+and\\s+\\d+(\\.\\d+)*${SUFFIX})?`,
        "gi",
      ),
      "FIA Appendix L per the published revision",
    )
    .replace(
      new RegExp(
        `Articles \\d+(\\.\\d+)*${SUFFIX}(\\s+and\\s+\\d+(\\.\\d+)*${SUFFIX})?`,
        "gi",
      ),
      "Appendix L per the published revision",
    )
    .replace(
      new RegExp(`FIA Article \\d+(\\.\\d+)*${SUFFIX}`, "gi"),
      "FIA Appendix L per the published revision",
    )
    .replace(
      new RegExp(`Article \\d+(\\.\\d+)*${SUFFIX}`, "gi"),
      "Appendix L per the published revision",
    )
    .replace(
      new RegExp(`\\bArt\\.?\\s+\\d+(\\.\\d+)*${SUFFIX}`, "gi"),
      "Appendix L per the published revision",
    )
    .replace(
      new RegExp(`Appendix L\\s*[§]\\s*\\d+(\\.\\d+)*${SUFFIX}`, "gi"),
      "Appendix L per the published revision",
    )
    .replace(/§\s*\d+(\.\d+)*(\([a-z]\))?/gi, "the published revision section")
    .replace(
      new RegExp(`COA Section \\d+(\\.\\d+)*${SUFFIX}`, "gi"),
      "the COA simultaneity gate",
    )
    .replace(
      new RegExp(`COA\\s+Sec\\.?\\s+\\d+(\\.\\d+)*${SUFFIX}`, "gi"),
      "the COA simultaneity gate",
    )
    .replace(/\bSection \d+\.\d+(\.\d+)*\([a-z]\)/g, "the COA simultaneity gate")
    .replace(
      new RegExp(`\\bSection \\d+\\.\\d+(\\.\\d+)*${SUFFIX}`, "g"),
      "the COA simultaneity gate",
    )
    .replace(
      new RegExp(`\\bSec\\.?\\s+\\d+(\\.\\d+)*${SUFFIX}`, "gi"),
      "the COA simultaneity gate",
    );
}
