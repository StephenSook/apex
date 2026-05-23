import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { ThreeTrackForecast } from "../../../shared/types";
import ThreeTrackForecastChart from "../ThreeTrackForecastChart";

const convergedForecast: ThreeTrackForecast = {
  status: "converged",
  tracks: [
    {
      track: "ttm_channel_mix",
      forecast: [40.0, 41.2, 42.5, 43.8, 45.0],
    },
    {
      track: "flowstate",
      forecast: [40.1, 41.4, 42.7, 43.9, 45.2],
    },
    {
      track: "chronos2",
      forecast: [40.2, 41.5, 42.6, 43.7, 45.1],
      quantiles: [38.5, 39.0, 39.5, 40.0, 40.5, 41.0, 41.5, 42.0, 42.5, 43.0, 43.5, 44.0, 44.5, 45.0, 45.5, 46.0, 46.5, 47.0, 47.5, 48.0, 48.5],
    },
  ],
  ensemble: [40.1, 41.4, 42.6, 43.8, 45.1],
  divergence_sigma: 0.42,
};

const divergedForecast: ThreeTrackForecast = {
  status: "diverged",
  tracks: [
    {
      track: "ttm_channel_mix",
      forecast: [40.0, 41.0, 42.0],
    },
    {
      track: "flowstate",
      forecast: [45.0, 50.0, 55.0],
    },
    {
      track: "chronos2",
      forecast: [40.5, 41.5, 42.5],
      quantiles: [38.0, 47.0],
    },
  ],
  divergence_sigma: 3.14,
  fallback: "ttm_only",
};

describe("ThreeTrackForecastChart", () => {
  it("renders the converged ensemble header + sigma chip", () => {
    render(<ThreeTrackForecastChart forecast={convergedForecast} />);
    expect(screen.getByText("Ensemble converged")).toBeInTheDocument();
    expect(screen.getByText(/σ=0.42/)).toBeInTheDocument();
  });

  it("renders the three track-name legend entries when converged", () => {
    render(<ThreeTrackForecastChart forecast={convergedForecast} />);
    expect(screen.getByText(/Granite TTM r2.1 channel-mix/i)).toBeInTheDocument();
    expect(screen.getByText(/Granite FlowState/i)).toBeInTheDocument();
    expect(screen.getByText(/Amazon Chronos-2/i)).toBeInTheDocument();
    expect(screen.getByText(/Ensemble fused output/i)).toBeInTheDocument();
  });

  it("renders the divergence alert + fallback strategy when diverged", () => {
    render(<ThreeTrackForecastChart forecast={divergedForecast} />);
    expect(screen.getByText("Ensemble diverged")).toBeInTheDocument();
    expect(screen.getByText(/σ=3.14/)).toBeInTheDocument();
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/exceeds 2 sigma at 3.14/i);
    expect(alert).toHaveTextContent(/TTM-only forecast for this lap/i);
  });

  it("renders the SVG chart with role=img + aria-label", () => {
    render(<ThreeTrackForecastChart forecast={convergedForecast} />);
    const chart = screen.getByRole("img", { name: /Three-track forecast envelope chart/i });
    expect(chart).toBeInTheDocument();
  });

  it("renders empty-forecast placeholder when all tracks are empty", () => {
    const empty: ThreeTrackForecast = {
      status: "converged",
      tracks: [
        { track: "ttm_channel_mix", forecast: [] },
        { track: "flowstate", forecast: [] },
        { track: "chronos2", forecast: [], quantiles: [] },
      ],
      ensemble: [],
      divergence_sigma: 0,
    };
    render(<ThreeTrackForecastChart forecast={empty} />);
    // Wave-35 A.3 alert specificity: empty-tracks path now renders a
    // role=status with actionable copy ("Verify upstream telemetry
    // intake") rather than the prior generic placeholder.
    expect(screen.getByText(/Three-track forecast has no data/i)).toBeInTheDocument();
    expect(screen.getByText(/Verify upstream telemetry intake/i)).toBeInTheDocument();
  });
});
