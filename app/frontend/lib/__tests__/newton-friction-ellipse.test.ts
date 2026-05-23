import { describe, expect, it } from "vitest";

import { projectOntoFrictionEllipse } from "../newton-friction-ellipse";

describe("projectOntoFrictionEllipse", () => {
  it("returns input unchanged when already inside the friction ellipse (mu=0.85 demo)", () => {
    const result = projectOntoFrictionEllipse(1.0, 1.0, 0.85);
    expect(result).not.toBeNull();
    expect(result?.a_long).toBeCloseTo(1.0, 6);
    expect(result?.a_lat).toBeCloseTo(1.0, 6);
    expect(result?.iterates).toBe(0);
    expect(result?.converged).toBe(true);
  });

  it("projects an outside-ellipse pair onto the boundary in one Newton iterate", () => {
    const result = projectOntoFrictionEllipse(12.0, 10.0, 0.85);
    expect(result).not.toBeNull();
    // Wave-37 grep-verified-assertion behavior: projected norm equals
    // limit = mu * g = 0.85 * 9.81 = 8.3385 m/s^2 within tolerance.
    const norm = Math.hypot(result!.a_long, result!.a_lat);
    expect(norm).toBeCloseTo(0.85 * 9.81, 3);
    expect(result?.converged).toBe(true);
  });

  it("returns null on non-finite a_long input (wave-37 silent-failure pattern)", () => {
    expect(projectOntoFrictionEllipse(Number.NaN, 1.0, 0.85)).toBeNull();
    expect(projectOntoFrictionEllipse(Number.POSITIVE_INFINITY, 1.0, 0.85)).toBeNull();
  });

  it("returns null on non-finite a_lat input", () => {
    expect(projectOntoFrictionEllipse(1.0, Number.NaN, 0.85)).toBeNull();
    expect(projectOntoFrictionEllipse(1.0, Number.NEGATIVE_INFINITY, 0.85)).toBeNull();
  });

  it("returns null on non-finite OR non-positive mu", () => {
    expect(projectOntoFrictionEllipse(1.0, 1.0, Number.NaN)).toBeNull();
    expect(projectOntoFrictionEllipse(1.0, 1.0, 0)).toBeNull();
    expect(projectOntoFrictionEllipse(1.0, 1.0, -0.5)).toBeNull();
  });

  it("preserves the input direction when projecting (radial scaling)", () => {
    const a_long = 6.0;
    const a_lat = 8.0;
    const mu = 0.5;
    const result = projectOntoFrictionEllipse(a_long, a_lat, mu);
    expect(result).not.toBeNull();
    const inputRatio = a_long / a_lat;
    const outputRatio = result!.a_long / result!.a_lat;
    expect(outputRatio).toBeCloseTo(inputRatio, 6);
  });
});
