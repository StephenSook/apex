import { describe, expect, it } from "vitest";

import { scrubInventedRegulatoryAnchors } from "../../lib/scrub-regulatory-anchors";

/**
 * Canonical regression suite for the HARD-COMPLIANCE regex scrubber per
 * feedback_llm_output_compliance_scrubber.md. Wave-46 Phase 9.3 close-out
 * after silent-failure-hunter BLOCKER 1 (bare `Section N.N` pattern slipped
 * through) + codex MED (plural `FIA Articles N.N and N.N` pattern slipped
 * through). Covers each of the 13 chained replace regexes + order-of-ops.
 */

describe("scrubInventedRegulatoryAnchors", () => {
  it.each<readonly [string, string]>([
    ["per FIA Article 18.3", "per FIA Appendix L per the published revision"],
    [
      "per FIA Article 18.3.a",
      "per FIA Appendix L per the published revision",
    ],
    ["per Article 18", "per Appendix L per the published revision"],
    ["per Art. 18.3", "per Appendix L per the published revision"],
    ["per Art 18", "per Appendix L per the published revision"],
    [
      "per Appendix L §18.3",
      "per Appendix L per the published revision",
    ],
    ["per §18.3", "per the published revision section"],
    ["per §18(a)", "per the published revision section"],
    ["per COA Section 4.2", "per the COA simultaneity gate"],
    ["per COA Sec. 4", "per the COA simultaneity gate"],
    ["per Section 4.2(a)", "per the COA simultaneity gate"],
    [
      "per FIA Appendix L Article 18",
      "per FIA Appendix L per the published revision",
    ],
    ["per Section 5.2", "per the COA simultaneity gate"],
    [
      "per FIA Articles 18.3 and 19.2",
      "per FIA Appendix L per the published revision",
    ],
    [
      "per Articles 18.3 and 19.2",
      "per Appendix L per the published revision",
    ],
  ])("scrubs %s -> %s", (input, expected) => {
    expect(scrubInventedRegulatoryAnchors(input)).toBe(expected);
  });

  it("does NOT mangle benign prose using lowercase 'section'", () => {
    const input = "in section 1 we discuss the friction-ellipse model";
    expect(scrubInventedRegulatoryAnchors(input)).toBe(input);
  });

  it("does NOT mangle a bare 'Section 1' without a numeric child or letter suffix", () => {
    const input = "Section 1 is the abstract; Section 2 is methods.";
    expect(scrubInventedRegulatoryAnchors(input)).toBe(input);
  });

  it("does NOT introduce invented anchors when the input has none", () => {
    const input =
      "Apply trail brake into corner entry and unwind steering on exit.";
    expect(scrubInventedRegulatoryAnchors(input)).toBe(input);
  });

  it("scrubs all anchors in a paragraph with multiple kinds", () => {
    const input =
      "Per FIA Article 18.3 and Section 4.2(a) of the COA, the simultaneity gate fires.";
    const result = scrubInventedRegulatoryAnchors(input);
    expect(result).not.toMatch(/FIA Article \d/);
    expect(result).not.toMatch(/Section \d+\.\d+/);
    expect(result).toContain("FIA Appendix L per the published revision");
    expect(result).toContain("the COA simultaneity gate");
  });

  it("is idempotent when reapplied to its own output", () => {
    const input = "Per FIA Article 18.3 and Section 5.2(a).";
    const once = scrubInventedRegulatoryAnchors(input);
    const twice = scrubInventedRegulatoryAnchors(once);
    expect(twice).toBe(once);
  });
});
