import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { EXTENDED_PHYSICS_FIXTURES } from "../../lib/extended-physics-fixtures";
import { ExtendedPhysicsFixtureGrid } from "../ExtendedPhysicsFixtureGrid";

describe("ExtendedPhysicsFixtureGrid", () => {
  it("renders all 8 wave-30 D-015 physics tier tiles", () => {
    render(<ExtendedPhysicsFixtureGrid fixtures={EXTENDED_PHYSICS_FIXTURES} />);
    expect(screen.getByText("3D track geometry")).toBeInTheDocument();
    expect(screen.getByText("Aerodynamics")).toBeInTheDocument();
    expect(screen.getByText("Adaptive hand-controls")).toBeInTheDocument();
    expect(screen.getByText("Double-track load transfer")).toBeInTheDocument();
    expect(screen.getByText("Tire thermal + degradation")).toBeInTheDocument();
    expect(screen.getByText("Transient tire dynamics")).toBeInTheDocument();
    expect(screen.getByText("Full Pacejka combined-slip")).toBeInTheDocument();
    expect(screen.getByText("Kinematic integration")).toBeInTheDocument();
  });

  it("renders the handler attribution label for each tier", () => {
    render(<ExtendedPhysicsFixtureGrid fixtures={EXTENDED_PHYSICS_FIXTURES} />);
    expect(screen.getAllByText(/SCP outer-loop linearisation/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/SCP inner iterate/i)).toBeInTheDocument();
    expect(screen.getByText(/COA constraint layer/i)).toBeInTheDocument();
    expect(screen.getByText(/Internal state evolution/i)).toBeInTheDocument();
    expect(screen.getByText(/Steady-state algebraic substitution/i)).toBeInTheDocument();
  });

  it("renders the canonical inputs as monospace channel lists", () => {
    render(<ExtendedPhysicsFixtureGrid fixtures={EXTENDED_PHYSICS_FIXTURES} />);
    expect(screen.getAllByText(/pitch_rad/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/speed_mps/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/coa_simul_permitted/i).length).toBeGreaterThan(0);
  });

  it("renders an empty grid without breakage when no fixtures provided", () => {
    // Empty tuple cast (compile-time fail is the real guarantee here;
    // the runtime check verifies the JSX renders the heading region.)
    const empty = [] as unknown as typeof EXTENDED_PHYSICS_FIXTURES;
    const { container } = render(<ExtendedPhysicsFixtureGrid fixtures={empty} />);
    expect(container.querySelector("ol")).toBeInTheDocument();
    expect(container.querySelectorAll("li").length).toBe(0);
  });
});
