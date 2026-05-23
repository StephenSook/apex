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

  it("renders the non-finite alert when every track value is NaN or Infinity (wave-35 A.3)", () => {
    const allNonFinite: ThreeTrackForecast = {
      status: "converged",
      tracks: [
        { track: "ttm_channel_mix", forecast: [Number.NaN, Number.NaN] },
        { track: "flowstate", forecast: [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY] },
        { track: "chronos2", forecast: [Number.NaN, Number.NaN], quantiles: [Number.NaN, Number.NaN] },
      ],
      ensemble: [Number.NaN, Number.NaN],
      divergence_sigma: 0,
    };
    render(<ThreeTrackForecastChart forecast={allNonFinite} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/no finite values/i);
    expect(alert).toHaveTextContent(/Re-run the session/i);
  });

  it("renders the missing-chronos2 alert when the chronos2 track is absent (wave-35 A.5)", () => {
    // Cast through unknown to bypass the fixed-arity tuple type; the
    // runtime check is what we want to verify here (backend bug
    // emitting an all-TTM tuple).
    const missingChronos2 = {
      status: "converged",
      tracks: [
        { track: "ttm_channel_mix", forecast: [40.0, 41.0] },
        { track: "flowstate", forecast: [40.1, 41.1] },
        { track: "ttm_channel_mix", forecast: [40.2, 41.2] },
      ],
      ensemble: [40.1, 41.1],
      divergence_sigma: 0,
    } as unknown as ThreeTrackForecast;
    render(<ThreeTrackForecastChart forecast={missingChronos2} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/Chronos-2 track/i);
    expect(alert).toHaveTextContent(/upstream ensemble-construction error/i);
  });

  it("renders the degenerate-flat envelope note when yMax === yMin (wave-35 A.2)", () => {
    const flat: ThreeTrackForecast = {
      status: "converged",
      tracks: [
        { track: "ttm_channel_mix", forecast: [42.0, 42.0, 42.0] },
        { track: "flowstate", forecast: [42.0, 42.0, 42.0] },
        { track: "chronos2", forecast: [42.0, 42.0, 42.0], quantiles: [42.0, 42.0] },
      ],
      ensemble: [42.0, 42.0, 42.0],
      divergence_sigma: 0,
    };
    render(<ThreeTrackForecastChart forecast={flat} />);
    expect(screen.getByText(/envelope is flat across all three tracks/i)).toBeInTheDocument();
    expect(screen.getByText(/zero cross-track variance is unusual/i)).toBeInTheDocument();
  });

  it("renders a single-point Chronos-2 forecast as a circle rather than an envelope (wave-35 A.6)", () => {
    const singlePoint: ThreeTrackForecast = {
      status: "converged",
      tracks: [
        { track: "ttm_channel_mix", forecast: [42.0] },
        { track: "flowstate", forecast: [42.1] },
        { track: "chronos2", forecast: [42.05], quantiles: [40.0, 44.0] },
      ],
      ensemble: [42.05],
      divergence_sigma: 0.1,
    };
    const { container } = render(<ThreeTrackForecastChart forecast={singlePoint} />);
    // Envelope polygon path should NOT be rendered (forecastMeans.length < 2);
    // a small <circle> at the single Chronos-2 point should be rendered instead.
    expect(container.querySelector("circle")).toBeInTheDocument();
  });

  it("does not crash on non-finite chronos2 quantiles; falls back to no envelope (wave-35 A.1)", () => {
    const nanQuantiles: ThreeTrackForecast = {
      status: "converged",
      tracks: [
        { track: "ttm_channel_mix", forecast: [40.0, 41.0, 42.0] },
        { track: "flowstate", forecast: [40.1, 41.1, 42.1] },
        {
          track: "chronos2",
          forecast: [40.2, 41.2, 42.2],
          quantiles: [Number.NaN, Number.NaN, Number.NaN, Number.NaN],
        },
      ],
      ensemble: [40.1, 41.1, 42.1],
      divergence_sigma: 0.1,
    };
    expect(() => render(<ThreeTrackForecastChart forecast={nanQuantiles} />)).not.toThrow();
    // The chart should still render with the three track lines + ensemble;
    // only the quantile envelope path should be omitted.
    expect(screen.getByText("Ensemble converged")).toBeInTheDocument();
  });
});
