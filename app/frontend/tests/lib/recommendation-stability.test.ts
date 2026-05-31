import { describe, expect, it } from "vitest";

import { assessRecommendationStability } from "../../lib/recommendation-stability";

function corner(name: string, current_delta_s: number) {
  return { name, sector: 1 as const, current_delta_s, recommendation: "", citations: [] };
}

describe("assessRecommendationStability (wave-82 stability probe)", () => {
  it("returns null with fewer than two corners (no priority to flip)", () => {
    expect(assessRecommendationStability([])).toBeNull();
    expect(assessRecommendationStability([corner("Turn 1", 0.4)])).toBeNull();
  });

  it("returns null when a delta is non-finite (un-assessable; self-defending)", () => {
    expect(
      assessRecommendationStability([corner("a", Number.NaN), corner("b", 0.2)]),
    ).toBeNull();
    expect(
      assessRecommendationStability([corner("a", Number.POSITIVE_INFINITY), corner("b", 0.2)]),
    ).toBeNull();
  });

  it("STABLE when the priority corner has a margin wider than the perturbation budget", () => {
    const s = assessRecommendationStability([
      corner("Turn 1 Hairpin", 0.5),
      corner("Sector 2 corner", 0.1),
      corner("Final chicane", 0.05),
    ]);
    expect(s).not.toBeNull();
    expect(s?.verdict).toBe("stable");
    expect(s?.priorityCorner).toBe("Turn 1 Hairpin");
    expect(s?.runnerUpCorner).toBe("Sector 2 corner");
    expect(s?.flipCount).toBe(0);
    expect(s?.detail).toMatch(/Stable/);
    // Honest dropout note names where the focus moves if the reading drops.
    expect(s?.detail).toMatch(/Sector 2 corner/);
  });

  it("FRAGILE when two corners are nearly tied (a small drift flips the priority)", () => {
    const s = assessRecommendationStability([
      corner("Turn 1 Hairpin", 0.3),
      corner("Sector 2 corner", 0.29),
    ]);
    expect(s?.verdict).toBe("fragile");
    expect(s?.flipCount).toBeGreaterThan(0);
    expect(s?.detail).toMatch(/Fragile/);
  });

  it("MODERATE when the margin is inside the budget but not razor-thin", () => {
    const s = assessRecommendationStability([
      corner("Turn 1 Hairpin", 0.3),
      corner("Sector 2 corner", 0.2),
    ]);
    expect(s?.verdict).toBe("moderate");
    expect(s?.marginS).toBeCloseTo(0.1);
  });

  it("always returns a verdict in the closed set and a non-empty detail", () => {
    const s = assessRecommendationStability([
      corner("a", 0.22),
      corner("b", 0.18),
      corner("c", 0.05),
    ]);
    expect(["stable", "moderate", "fragile"]).toContain(s?.verdict);
    expect((s?.detail ?? "").length).toBeGreaterThan(0);
    expect(s?.totalProbes).toBe(3 * 3 * 2); // corners x epsilons x signs
  });

  it("picks the most-positive delta as the priority (most time lost), not the largest magnitude", () => {
    const s = assessRecommendationStability([
      corner("Faster than reference", -0.8),
      corner("Worst corner", 0.2),
    ]);
    expect(s?.priorityCorner).toBe("Worst corner");
  });
});
