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

export function scrubInventedRegulatoryAnchors(text: string): string {
  return text
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
