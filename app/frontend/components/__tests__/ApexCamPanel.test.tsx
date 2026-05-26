import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ApexCamPanel from "../ApexCamPanel";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("ApexCamPanel (wave-45 Phase 5 Block C.2)", () => {
  it("renders all 6 pipeline stage labels", () => {
    render(<ApexCamPanel />);
    expect(screen.getByText(/Telemetry frame ingest/i)).toBeInTheDocument();
    expect(screen.getByText(/Granite TTM forecast/i)).toBeInTheDocument();
    expect(screen.getByText(/V2 cvxpylayers/i)).toBeInTheDocument();
    expect(screen.getByText(/Granite Guardian/i)).toBeInTheDocument();
    expect(screen.getByText(/Granite 4.1 8B/i)).toBeInTheDocument();
    expect(screen.getByText(/Footer assembly|provenance/i)).toBeInTheDocument();
  });

  it("renders cross-ref to D-019 7 shouldn't-be-possible moves (per D-053 + D-049 amendments)", () => {
    render(<ApexCamPanel />);
    expect(
      screen.getByText(/D-019 7 shouldn.t.be.possible moves|D-053 . D-049 amendments/i),
    ).toBeInTheDocument();
  });

  it("renders D-050 byte-equality cross-ref", () => {
    render(<ApexCamPanel />);
    expect(screen.getByText(/D-050 byte-equality/i)).toBeInTheDocument();
  });

  it("renders ingestion counter starting at 0", () => {
    render(<ApexCamPanel />);
    expect(screen.getByText(/0$|0 frames/i)).toBeInTheDocument();
  });
});
