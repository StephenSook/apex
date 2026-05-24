import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import EAGLE3LatencyBadge, { type EAGLE3State } from "../EAGLE3LatencyBadge";

describe("EAGLE3LatencyBadge", () => {
  it("renders the heading + cross-ref with default mock data", () => {
    render(<EAGLE3LatencyBadge />);
    expect(
      screen.getByRole("heading", { name: /Draft-and-accept latency speedup/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/D-019 item 4/)).toBeInTheDocument();
  });

  it("renders disabled state with vanilla-decode body + no role=alert", () => {
    const state: EAGLE3State = { status: "disabled" };
    render(<EAGLE3LatencyBadge state={state} />);
    expect(screen.getByText(/Speculative decoding disabled/i)).toBeInTheDocument();
    expect(screen.getByText(/Vanilla decode/i)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders active state with speedup numerics + draft model + accept rate", () => {
    const state: EAGLE3State = {
      status: "active",
      speedup_x: 3.42,
      accepted_token_rate: 0.78,
      draft_rank: 2,
      draft_model: "granite-draft-2b",
    };
    render(<EAGLE3LatencyBadge state={state} />);
    expect(screen.getByText(/granite-draft-2b/i)).toBeInTheDocument();
    expect(screen.getAllByText(/3\.42x/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/78%/)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders error state with role=alert + vLLM service-health hint", () => {
    const state: EAGLE3State = { status: "error", message: "vLLM 500 internal" };
    render(<EAGLE3LatencyBadge state={state} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/vLLM 500 internal/i);
    expect(alert).toHaveTextContent(/Vanilla decode is the active/i);
    expect(alert).toHaveTextContent(/vLLM service health on \/status/i);
  });
});
