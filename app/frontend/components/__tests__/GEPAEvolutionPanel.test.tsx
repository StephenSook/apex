import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import GEPAEvolutionPanel, { type GEPAOptimization } from "../GEPAEvolutionPanel";

describe("GEPAEvolutionPanel", () => {
  it("renders the optimization heading + body copy with default mock data", () => {
    render(<GEPAEvolutionPanel />);
    expect(
      screen.getByRole("heading", { name: /Offline DSPy prompt optimization/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/race-engineer narration prompt offline/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/D-026 APEX-Bench/i)).toBeInTheDocument();
  });

  it("renders the iteration count badge derived from the iterations array", () => {
    const optimization: GEPAOptimization = {
      run_id: "test-run-1",
      base_prompt_id: "baseline-v0",
      base_faithfulness_p95: 0.612,
      iterations: [
        {
          iteration: 1,
          candidates_evaluated: 12,
          faithfulness_p95: 0.685,
          selected_prompt_id: "cand-iter-1",
        },
        {
          iteration: 2,
          candidates_evaluated: 16,
          faithfulness_p95: 0.731,
          selected_prompt_id: "cand-iter-2",
        },
        {
          iteration: 3,
          candidates_evaluated: 18,
          faithfulness_p95: 0.802,
          selected_prompt_id: "cand-iter-3",
        },
      ],
      final_prompt_id: "cand-iter-3",
      final_faithfulness_p95: 0.802,
    };
    render(<GEPAEvolutionPanel optimization={optimization} />);
    expect(screen.getByText(/3 iterations/i)).toBeInTheDocument();
    expect(screen.getByText(/cand-iter-3/i)).toBeInTheDocument();
  });

  it("renders the faithfulness-lift delta with + prefix + 3-decimal precision", () => {
    const optimization: GEPAOptimization = {
      run_id: "delta-test",
      base_prompt_id: "baseline",
      base_faithfulness_p95: 0.5,
      iterations: [
        {
          iteration: 1,
          candidates_evaluated: 4,
          faithfulness_p95: 0.6,
          selected_prompt_id: "p1",
        },
      ],
      final_prompt_id: "p1",
      final_faithfulness_p95: 0.75,
    };
    render(<GEPAEvolutionPanel optimization={optimization} />);
    expect(screen.getByText("+0.250")).toBeInTheDocument();
    expect(screen.getByText("0.500")).toBeInTheDocument();
    expect(screen.getByText("0.750")).toBeInTheDocument();
  });
});
