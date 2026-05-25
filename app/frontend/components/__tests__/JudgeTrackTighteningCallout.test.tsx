import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import JudgeTrackTighteningCallout from "../JudgeTrackTighteningCallout";

describe("JudgeTrackTighteningCallout", () => {
  it("renders all 4 prize-category cards", () => {
    render(<JudgeTrackTighteningCallout />);
    expect(screen.getByText(/1st Place/i)).toBeInTheDocument();
    expect(screen.getByText(/Best Use of Technology/i)).toBeInTheDocument();
    expect(screen.getByText(/Most Innovative/i)).toBeInTheDocument();
    expect(screen.getByText(/Runner-up/i)).toBeInTheDocument();
  });

  it("renders explicit 'Wins X because Y' claim copy per card", () => {
    render(<JudgeTrackTighteningCallout />);
    expect(screen.getAllByText(/Wins/i).length).toBe(4);
    expect(screen.getByText(/COA-parameterized simultaneity gate/i)).toBeInTheDocument();
    expect(screen.getByText(/per-tool honesty tier/i)).toBeInTheDocument();
    expect(screen.getByText(/6 shouldn't-be-possible moves/i)).toBeInTheDocument();
    expect(screen.getByText(/most production-ready submission/i)).toBeInTheDocument();
  });

  it("each card has a deep-link CTA", () => {
    render(<JudgeTrackTighteningCallout />);
    const ctaLinks = screen.getAllByText(/Open the .* →|Open the live deploy →|See per-tool honesty tier →/);
    expect(ctaLinks.length).toBe(4);
  });
});
