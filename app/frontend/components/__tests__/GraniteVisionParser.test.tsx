import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import GraniteVisionParser from "../GraniteVisionParser";

const SAMPLE_PARSED = {
  source_filename: "canned-timing-sheet.pdf",
  parser: "canned-fixture",
  parse_ms: 12,
  laps: [
    { lap: 1, sector_1_time_s: 24.18, sector_2_time_s: 28.94, sector_3_time_s: 25.61, lap_time_s: 78.73 },
    { lap: 2, sector_1_time_s: 23.87, sector_2_time_s: 28.41, sector_3_time_s: 25.19, lap_time_s: 77.47 },
  ],
};

describe("GraniteVisionParser", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders idle state with upload + canned-fixture buttons", () => {
    render(<GraniteVisionParser />);
    expect(screen.getByText(/PDF timing sheet to structured laps/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload PDF/i)).toBeInTheDocument();
    expect(screen.getByText(/Try the canned fixture/i)).toBeInTheDocument();
  });

  it("renders ready state with parsed laps table after canned-fixture click", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(SAMPLE_PARSED), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    render(<GraniteVisionParser />);
    await user.click(screen.getByText(/Try the canned fixture/i));
    await waitFor(() =>
      expect(screen.getByText(/2 laps parsed from canned-timing-sheet\.pdf/i)).toBeInTheDocument(),
    );
    expect(screen.getByText("24.180")).toBeInTheDocument();
    expect(screen.getByText("78.730")).toBeInTheDocument();
    expect(screen.getByText(/canned-fixture/)).toBeInTheDocument();
  });

  it("renders error state with role=alert when POST returns non-2xx", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(new Response("ffmpeg error", { status: 500 }));
    render(<GraniteVisionParser />);
    await user.click(screen.getByText(/Try the canned fixture/i));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/Parse error/i);
    expect(alert).toHaveTextContent(/HTTP 500/i);
  });
});
