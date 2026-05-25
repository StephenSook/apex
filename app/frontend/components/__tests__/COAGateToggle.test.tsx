import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import COAGateToggle from "../COAGateToggle";

describe("COAGateToggle", () => {
  it("renders idle (permitted) state with COA flag = 1 + feasible verdict + no role=alert", () => {
    render(<COAGateToggle />);
    expect(
      screen.getByRole("switch", { name: /coa_overlap_flag/i }),
    ).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(/Projector verdict: feasible/i)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("flips to blocked state on switch click + renders role=alert + violation verdict", async () => {
    const user = userEvent.setup();
    render(<COAGateToggle />);
    const toggle = screen.getByRole("switch", { name: /coa_overlap_flag/i });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText(/Projector verdict: violation/i)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(/release brake before throttle.*unactionable for an adaptive driver/i),
    ).toBeInTheDocument();
  });

  it("flips back to permitted on second click (round-trip)", async () => {
    const user = userEvent.setup();
    render(<COAGateToggle />);
    const toggle = screen.getByRole("switch", { name: /coa_overlap_flag/i });
    await user.click(toggle);
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(/Projector verdict: feasible/i)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders cross-reference footer with D-A + D-018 + D-052 + paper §3.4 + Q&A killshot #4", () => {
    render(<COAGateToggle />);
    expect(screen.getByText(/D-A \+ D-018 tri-agent critic \+ D-052/)).toBeInTheDocument();
  });
});
