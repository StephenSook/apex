import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import JudgeTrackTighteningCallout from "../JudgeTrackTighteningCallout";

describe("JudgeTrackTighteningCallout", () => {
  it("renders all 4 prize-category cards (each category name appears in BOTH the h4 + the claim copy)", () => {
    render(<JudgeTrackTighteningCallout />);
    expect(screen.getAllByText(/1st\b/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Best Use of Technology/i).length).toBe(2);
    expect(screen.getAllByText(/Most Innovative/i).length).toBe(2);
    expect(screen.getAllByText(/Runner-up/i).length).toBe(2);
  });

  it("renders explicit 'Wins X because Y' claim copy per card", () => {
    render(<JudgeTrackTighteningCallout />);
    expect(screen.getAllByText(/Wins/i).length).toBe(4);
    expect(screen.getByText(/COA-parameterized simultaneity gate/i)).toBeInTheDocument();
    expect(screen.getAllByText(/per-tool honesty tier/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/6 shouldn't-be-possible moves/i)).toBeInTheDocument();
    expect(screen.getByText(/most production-ready submission/i)).toBeInTheDocument();
  });

  it("each card has a deep-link CTA", () => {
    render(<JudgeTrackTighteningCallout />);
    const ctaLinks = screen.getAllByText(/Open the .* →|Open the live deploy →|See per-tool honesty tier →/);
    expect(ctaLinks.length).toBe(4);
  });
});
