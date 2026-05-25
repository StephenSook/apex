import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SCPStageBPanel from "../SCPStageBPanel";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SCPStageBPanel (wave-45 Phase 9 V13 3-iterate SCP swap-point)", () => {
  it("renders loading state at mount", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<SCPStageBPanel />);
    expect(screen.getByText(/Loading SCP 3-iterate trace/i)).toBeInTheDocument();
  });

  it("renders 3 iterate cards + final residual + engine pill", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          engine: "scp-v13-canned-fallback",
          compute_ms: 8,
          iterates: [
            { iterate: 1, residual_norm: 0.04, trust_region_radius: 1, powell_rho: 0.7, status: "convergent" },
            { iterate: 2, residual_norm: 0.008, trust_region_radius: 1, powell_rho: 0.9, status: "convergent" },
            { iterate: 3, residual_norm: 0.001, trust_region_radius: 1, powell_rho: 0.97, status: "converged" },
          ],
          final_residual: 0.001,
          swap_point: "Vinh M3-V13 swap-point",
        }),
      })),
    );
    render(<SCPStageBPanel />);
    await waitFor(() => {
      expect(screen.getByText(/Engine: scp-v13-canned-fallback/i)).toBeInTheDocument();
    });
    expect(screen.getAllByText(/Iter [123]/i)).toHaveLength(3);
    expect(screen.getByText(/Final residual: 0\.0010/i)).toBeInTheDocument();
  });

  it("renders role=alert + retry button on fetch failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 500 })));
    render(<SCPStageBPanel />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /Retry SCP trace/i })).toBeInTheDocument();
  });
});
