import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ApexCamPanel from "../ApexCamPanel";

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    media: "",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("ApexCamPanel (wave-45 Phase 5 Block C.2)", () => {
  it("renders all 6 pipeline stage labels", () => {
    render(<ApexCamPanel />);
    expect(screen.getByText(/^Ingest$/)).toBeInTheDocument();
    expect(screen.getByText(/^TTM Forecast$/)).toBeInTheDocument();
    expect(screen.getByText(/^V2 Projector$/)).toBeInTheDocument();
    expect(screen.getByText(/^Guardian Audit$/)).toBeInTheDocument();
    expect(screen.getByText(/^Instruct Narration$/)).toBeInTheDocument();
    expect(screen.getByText(/^Provenance$/)).toBeInTheDocument();
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

  it("renders loop counter starting at Loop 1", () => {
    render(<ApexCamPanel />);
    expect(screen.getByText(/Loop 1/i)).toBeInTheDocument();
  });
});
