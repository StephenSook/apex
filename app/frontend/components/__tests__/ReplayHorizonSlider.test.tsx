import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ReplayHorizonSlider from "../ReplayHorizonSlider";

describe("ReplayHorizonSlider", () => {
  it("renders initial frame 1 + 0.00s elapsed + default 30 step horizon", () => {
    render(<ReplayHorizonSlider />);
    expect(screen.getByText(/Frame 1 of 30/i)).toBeInTheDocument();
    expect(screen.getByText(/t \+ 0\.00 s/)).toBeInTheDocument();
  });

  it("updates frame display + elapsed time on slider change", () => {
    render(<ReplayHorizonSlider />);
    const slider = screen.getByRole("slider", { name: /Scrub forecast horizon frame/i });
    fireEvent.change(slider, { target: { value: "15" } });
    expect(screen.getByText(/Frame 16 of 30/i)).toBeInTheDocument();
    expect(screen.getByText(/t \+ 0\.30 s/)).toBeInTheDocument();
  });

  it("respects horizonSteps prop override", () => {
    render(<ReplayHorizonSlider horizonSteps={10} />);
    expect(screen.getByText(/Frame 1 of 10/i)).toBeInTheDocument();
  });
});
