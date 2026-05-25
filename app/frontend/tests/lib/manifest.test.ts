import { describe, expect, it } from "vitest";

import manifest from "../../app/manifest";

// Wave-45 Phase 3 pr-test-analyzer H3 close-out: regression-lock the
// cascade-#22 PWA manifest purpose-type fix (Next.js MetadataRoute.
// Manifest is stricter than W3C spec; `purpose: "any maskable"`
// space-separated is rejected at type-check). Re-introducing the
// multi-purpose form would break next build at deploy time.

describe("app/manifest.ts", () => {
  it("every icon entry uses a single-literal purpose (any | maskable | monochrome)", () => {
    const m = manifest();
    const validPurposes: ReadonlyArray<string> = ["any", "maskable", "monochrome"];
    expect(m.icons).toBeDefined();
    if (m.icons === undefined) throw new Error("icons array undefined");
    for (const icon of m.icons) {
      if (icon.purpose !== undefined) {
        expect(validPurposes).toContain(icon.purpose);
      }
    }
  });

  it("ships start_url=/judges + display=standalone + theme_color racing-green + cream paper background", () => {
    const m = manifest();
    expect(m.start_url).toBe("/judges");
    expect(m.display).toBe("standalone");
    expect(m.theme_color).toBe("#0A2818");
    expect(m.background_color).toBe("#F4EBD8");
    expect(m.name).toMatch(/APEX/i);
    expect(m.short_name).toBe("APEX");
  });
});
