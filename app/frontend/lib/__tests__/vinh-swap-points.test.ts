import { describe, expect, it } from "vitest";

import { VINH_SWAP_POINTS } from "../vinh-swap-points";

describe("VINH_SWAP_POINTS single source of truth (wave-45 deep-review NIT N-2)", () => {
  it("has all 7 swap-point keys (V12 + V13 + V14 + V15 wave-45 + V7 + V8 wave-46 Phase 4 + V9 wave-46 Phase 5)", () => {
    expect(Object.keys(VINH_SWAP_POINTS).sort()).toEqual([
      "V12_PACEJKA",
      "V13_SCP",
      "V14_LANGGRAPH",
      "V15_LIPS",
      "V7_TSPULSE",
      "V8_EMBEDDING",
      "V9_WATSON_STT",
    ]);
  });

  it("each entry has swap_point string + header string", () => {
    for (const [key, val] of Object.entries(VINH_SWAP_POINTS)) {
      expect(typeof val.swap_point).toBe("string");
      expect(typeof val.header).toBe("string");
      expect(val.swap_point.length).toBeGreaterThan(0);
      expect(val.header.length).toBeGreaterThan(0);
      expect(val.swap_point).toMatch(/Vinh M3-/);
      expect(val.header).toMatch(/^vinh-m3-/);
      expect(val.header).toMatch(new RegExp(key.split("_")[0]?.toLowerCase() ?? ""));
    }
  });
});
