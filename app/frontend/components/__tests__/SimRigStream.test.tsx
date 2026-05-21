import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import SimRigStream from "../SimRigStream";

describe("SimRigStream", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the waiting state before the first frame fires", () => {
    render(<SimRigStream mode="simulated" />);
    expect(screen.getByText(/Waiting for first frame/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulated/i)).toBeInTheDocument();
  });

  it("emits at least one frame after one tick interval elapses", () => {
    render(<SimRigStream mode="simulated" />);
    act(() => {
      vi.advanceTimersByTime(60);
    });
    // After the interval fires once the ring-buffer counter should report at least 1 frame.
    expect(screen.getByText(/Ring buffer 1 of 120 frames/i)).toBeInTheDocument();
  });

  it("renders an alert when live mode is requested without a websocketUrl", () => {
    render(<SimRigStream mode="live" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/websocketUrl prop/i);
  });

  it("does not exceed the ring-buffer cap after many ticks", () => {
    render(<SimRigStream mode="simulated" />);
    act(() => {
      // 150 ticks at 50ms each = 7500ms; ring buffer caps at 120.
      vi.advanceTimersByTime(150 * 50 + 20);
    });
    expect(screen.getByText(/Ring buffer 120 of 120 frames/i)).toBeInTheDocument();
  });
});
