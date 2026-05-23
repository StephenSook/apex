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
    // EP-06 formula text contains "Steady-state algebraic substitution" verbatim
    // in addition to the handler-attribution dd label, so use getAllByText.
    expect(screen.getAllByText(/Steady-state algebraic substitution/i).length).toBeGreaterThan(0);
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

  it("renders the empty-canonical_inputs placeholder when the array is empty (wave-35 A.11)", () => {
    // Mutate the first fixture to have empty canonical_inputs; cast
    // the catalogue tuple via unknown to bypass the discriminated-union
    // compile check (this is a runtime-behavior test).
    const mutated = [
      { ...EXTENDED_PHYSICS_FIXTURES[0], canonical_inputs: [] as ReadonlyArray<string> },
      ...EXTENDED_PHYSICS_FIXTURES.slice(1),
    ] as unknown as typeof EXTENDED_PHYSICS_FIXTURES;
    render(<ExtendedPhysicsFixtureGrid fixtures={mutated} />);
    // grep-verified verbatim in ExtendedPhysicsFixtureGrid.tsx line 92:
    // "(no canonical inputs declared for this tier)"
    expect(
      screen.getByText(/no canonical inputs declared for this tier/i),
    ).toBeInTheDocument();
  });

  it("renders the empty-expected_outputs placeholder when the array is empty (wave-35 A.11)", () => {
    const mutated = [
      { ...EXTENDED_PHYSICS_FIXTURES[0], expected_outputs: [] as ReadonlyArray<string> },
      ...EXTENDED_PHYSICS_FIXTURES.slice(1),
    ] as unknown as typeof EXTENDED_PHYSICS_FIXTURES;
    render(<ExtendedPhysicsFixtureGrid fixtures={mutated} />);
    // grep-verified verbatim in ExtendedPhysicsFixtureGrid.tsx line 113:
    // "(no expected outputs declared for this tier)"
    expect(
      screen.getByText(/no expected outputs declared for this tier/i),
    ).toBeInTheDocument();
  });

  it("throws at render time when handled_in is an unknown handler discriminator (wave-35 A.12)", () => {
    // Cast through unknown to construct a fixture with a handler value
    // that is NOT in the ExtendedPhysicsHandler union. handlerBarClass
    // has a `const _exhaustive: never = handler` throw at the bottom
    // of the switch; the runtime guard fires regardless of the
    // compile-time check.
    const bogus = [
      {
        ...EXTENDED_PHYSICS_FIXTURES[0],
        handled_in: "scp_invalid_handler_xyz",
      },
      ...EXTENDED_PHYSICS_FIXTURES.slice(1),
    ] as unknown as typeof EXTENDED_PHYSICS_FIXTURES;
    // grep-verified verbatim in ExtendedPhysicsFixtureGrid.tsx line 42:
    // throw new Error(`unknown handler: ${String(_exhaustive)}`);
    expect(() => render(<ExtendedPhysicsFixtureGrid fixtures={bogus} />)).toThrow(
      /unknown handler/i,
    );
  });
});
