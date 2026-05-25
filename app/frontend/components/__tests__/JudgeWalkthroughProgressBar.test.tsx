import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import JudgeWalkthroughProgressBar from "../JudgeWalkthroughProgressBar";

describe("JudgeWalkthroughProgressBar", () => {
  it("renders default label `Step N of M` when no label prop given", () => {
    render(<JudgeWalkthroughProgressBar currentStep={3} totalSteps={6} />);
    expect(screen.getByText(/Step 3 of 6/i)).toBeInTheDocument();
  });

  it("renders percentage based on currentStep / totalSteps", () => {
    render(<JudgeWalkthroughProgressBar currentStep={3} totalSteps={6} />);
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it("clamps currentStep into [1, totalSteps] range", () => {
    const { rerender } = render(<JudgeWalkthroughProgressBar currentStep={0} totalSteps={6} />);
    expect(screen.getByText(/Step 1 of 6/i)).toBeInTheDocument();
    rerender(<JudgeWalkthroughProgressBar currentStep={99} totalSteps={6} />);
    expect(screen.getByText(/Step 6 of 6/i)).toBeInTheDocument();
  });
});
