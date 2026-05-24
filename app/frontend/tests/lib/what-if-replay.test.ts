import { describe, expect, it } from "vitest";

import { CONVERGENCE_FIXTURES } from "../../lib/convergence-fixtures";
import {
  MUTATION_COA_OVERLAP_INVERT,
  runWhatIfReplay,
  WHAT_IF_MUTATIONS,
} from "../../lib/what-if-replay";

const C14_07 = CONVERGENCE_FIXTURES.find((f) => f.id === "C14-07")!;
const C14_08 = CONVERGENCE_FIXTURES.find((f) => f.id === "C14-08")!;
const C14_01 = CONVERGENCE_FIXTURES.find((f) => f.id === "C14-01")!;

describe("MUTATION_COA_OVERLAP_INVERT.apply", () => {
  it("inverts coa_simul_permitted true -> false on a coa_simultaneity fixture", () => {
    const mutated = MUTATION_COA_OVERLAP_INVERT.apply(C14_08);
    expect(C14_08.coa_simul_permitted).toBe(true);
    expect(mutated.coa_simul_permitted).toBe(false);
    expect(mutated.id).toBe(C14_08.id);
  });

  it("inverts coa_simul_permitted false -> true on a coa_simultaneity fixture", () => {
    const mutated = MUTATION_COA_OVERLAP_INVERT.apply(C14_07);
    expect(C14_07.coa_simul_permitted).toBe(false);
    expect(mutated.coa_simul_permitted).toBe(true);
  });

  it("throws on a non-coa_simultaneity fixture (silent-failure M-2 guard)", () => {
    expect(() => MUTATION_COA_OVERLAP_INVERT.apply(C14_01)).toThrow(
      /requires fixture\.violation_class === "coa_simultaneity"/i,
    );
  });
});

describe("runWhatIfReplay", () => {
  it("emits a tier-0 coa_simultaneity_violation when overlap permission flips to false", () => {
    const result = runWhatIfReplay(C14_08, MUTATION_COA_OVERLAP_INVERT);
    expect(result.mutation.key).toBe("coa-overlap-invert");
    expect(result.mutatedFixture.coa_simul_permitted).toBe(false);
    expect(result.replayedViolationLog.engine).toBe("v2_cvxpylayers");
    expect(result.replayedViolationLog.records).toHaveLength(1);
    const record = result.replayedViolationLog.records[0];
    expect(record.type).toBe("coa_simultaneity_violation");
    expect(record.tier).toBe(0);
  });

  it("emits an empty record list when overlap permission flips to true (adaptive-equipment permitted)", () => {
    const result = runWhatIfReplay(C14_07, MUTATION_COA_OVERLAP_INVERT);
    expect(result.mutatedFixture.coa_simul_permitted).toBe(true);
    expect(result.replayedViolationLog.records).toHaveLength(0);
    expect(result.replayedViolationLog.engine).toBe("v2_cvxpylayers");
  });

  it("is deterministic across repeated calls with the same input", () => {
    const r1 = runWhatIfReplay(C14_08, MUTATION_COA_OVERLAP_INVERT);
    const r2 = runWhatIfReplay(C14_08, MUTATION_COA_OVERLAP_INVERT);
    expect(r1.replayedViolationLog).toEqual(r2.replayedViolationLog);
    expect(r1.mutatedFixture).toEqual(r2.mutatedFixture);
  });

  it("propagates the mutation throw when applied to incompatible fixture", () => {
    expect(() => runWhatIfReplay(C14_01, MUTATION_COA_OVERLAP_INVERT)).toThrow();
  });

  it("preserves forecast_step_count = 30 from the canonical contract", () => {
    const result = runWhatIfReplay(C14_07, MUTATION_COA_OVERLAP_INVERT);
    expect(result.replayedViolationLog.forecast_step_count).toBe(30);
  });
});

describe("WHAT_IF_MUTATIONS catalogue", () => {
  it("contains MUTATION_COA_OVERLAP_INVERT", () => {
    expect(WHAT_IF_MUTATIONS).toContain(MUTATION_COA_OVERLAP_INVERT);
    expect(WHAT_IF_MUTATIONS.length).toBeGreaterThanOrEqual(1);
  });
});
