/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import TwinDriverNarrativePanel from "../TwinDriverNarrativePanel";

/**
 * Wave-46 C14b R5 TwinDriverNarrativePanel component test scaffold.
 *
 * The panel is pure UI (no fetch, no state machine) showing the SAME
 * physical event coached differently for an adaptive driver (verdict
 * = feasible because COA overlap flag = 1) vs a veteran archetype
 * (verdict = violation because COA overlap flag = 0). Persona-decoupling
 * per Lane K rule: "Driver A · adaptive driver" + "Driver B · veteran
 * archetype" stay as generic labels (no Sarah Reynolds in default UI).
 *
 * Tests assert: both excerpts render, verdict pills match expected
 * values, COA simultaneity flag labels visible, and no Sarah Reynolds
 * (or any other persona-named driver) leaks into default state.
 */
describe("TwinDriverNarrativePanel wave-46 Phase 7.1 component", () => {
  it("renders both driver excerpts with persona-decoupled labels", () => {
    render(<TwinDriverNarrativePanel />);
    expect(screen.getByText(/Driver A · adaptive driver/i)).toBeInTheDocument();
    expect(screen.getByText(/Driver B · veteran archetype/i)).toBeInTheDocument();
  });

  it("renders the feasible verdict pill for the adaptive driver", () => {
    render(<TwinDriverNarrativePanel />);
    const feasiblePills = screen.getAllByText(/^feasible$/i);
    expect(feasiblePills.length).toBeGreaterThan(0);
  });

  it("renders the violation verdict pill for the veteran archetype", () => {
    render(<TwinDriverNarrativePanel />);
    const violationPills = screen.getAllByText(/^violation$/i);
    expect(violationPills.length).toBeGreaterThan(0);
  });

  it("renders the coa_overlap_flag label on both excerpts", () => {
    render(<TwinDriverNarrativePanel />);
    const flagLabels = screen.getAllByText(/coa_overlap_flag/i);
    expect(flagLabels.length).toBe(2);
  });

  it("does not leak Sarah Reynolds or any other named persona into default UI (Lane K invariant)", () => {
    render(<TwinDriverNarrativePanel />);
    expect(screen.queryByText(/Sarah Reynolds/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sarah\s+R(eynolds)?/i)).not.toBeInTheDocument();
  });

  it("references FIA Appendix L per the published revision (no invented Article numbers)", () => {
    render(<TwinDriverNarrativePanel />);
    expect(
      screen.getByText(/FIA Appendix L per the published revision/i),
    ).toBeInTheDocument();
  });
});
