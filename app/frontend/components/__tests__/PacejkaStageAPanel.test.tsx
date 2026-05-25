import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import PacejkaStageAPanel from "../PacejkaStageAPanel";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PacejkaStageAPanel (wave-45 Phase 9 V12 8-tier Pacejka swap-point)", () => {
  it("renders loading state at mount", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<PacejkaStageAPanel />);
    expect(screen.getByText(/Loading Pacejka 8-tier trace/i)).toBeInTheDocument();
  });

  it("renders 8 tier cards + engine pill + violations count", async () => {
    const mockTiers = Array.from({ length: 8 }, (_, i) => ({
      tier: i,
      name: `Layer ${i} synthetic`,
      residual_norm: 0.001 * (i + 1),
      status: i === 5 ? "linearized" : "converged",
    }));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          engine: "pacejka-v12-canned-fallback",
          compute_ms: 12,
          tiers: mockTiers,
          final_violation_count: 0,
          swap_point: "Vinh M3-V12 swap-point",
        }),
      })),
    );
    render(<PacejkaStageAPanel />);
    await waitFor(() => {
      expect(screen.getByText(/Engine: pacejka-v12-canned-fallback/i)).toBeInTheDocument();
    });
    expect(screen.getAllByText(/Tier \d+/i)).toHaveLength(8);
    expect(screen.getByText(/Violations: 0/i)).toBeInTheDocument();
  });

  it("renders role=alert + retry button on fetch failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 500 })));
    render(<PacejkaStageAPanel />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /Retry Pacejka trace/i })).toBeInTheDocument();
  });
});
