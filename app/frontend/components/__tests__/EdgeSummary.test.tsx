import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EdgeSummary from "../EdgeSummary";
import type { GraniteNanoEdgeState } from "../../lib/webgpu-nano";
import type { ConnectivityState } from "../../lib/sync-on-reconnect";

vi.mock("../../lib/webgpu-nano", async () => {
  const actual = await vi.importActual<typeof import("../../lib/webgpu-nano")>(
    "../../lib/webgpu-nano",
  );
  return {
    ...actual,
    useGraniteNanoEdge: vi.fn(),
  };
});

vi.mock("../../lib/sync-on-reconnect", () => ({
  useConnectivity: vi.fn(),
}));

import { useGraniteNanoEdge } from "../../lib/webgpu-nano";
import { useConnectivity } from "../../lib/sync-on-reconnect";

const mockUseEdge = vi.mocked(useGraniteNanoEdge);
const mockUseConnectivity = vi.mocked(useConnectivity);

function setEdge(state: GraniteNanoEdgeState) {
  mockUseEdge.mockReturnValue(state);
}

function setConnectivity(state: ConnectivityState) {
  mockUseConnectivity.mockReturnValue(state);
}

describe("EdgeSummary", () => {
  beforeEach(() => {
    setConnectivity({ status: "online" });
  });

  it("renders the loading state with progress bar + 1.5 GB pre-check copy (wave-38 A.6)", () => {
    setEdge({ status: "loading", progress: 0.3 });
    render(<EdgeSummary />);
    // grep-verified verbatim in EdgeSummary.tsx ReadyPanel intro
    expect(screen.getByText(/Probing WebGPU adapter/i)).toBeInTheDocument();
    expect(screen.getByText(/1\.50 GB/i)).toBeInTheDocument();
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it("renders the ready state with Newton projection diagnostics (wave-38 A.6)", () => {
    setEdge({ status: "ready", pipelineReady: true });
    render(<EdgeSummary />);
    expect(screen.getByText(/Granite 4\.0 Nano 350M loaded/i)).toBeInTheDocument();
    expect(screen.getByText(/Projected \(Newton\)/i)).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("renders role=alert OOM fallback with byte diagnostics (wave-38 A.6 + pre-mortem row 61)", () => {
    setEdge({
      status: "oom",
      available_bytes: 900_000_000,
      required_bytes: 1_500_000_000,
    });
    render(<EdgeSummary />);
    const alert = screen.getByRole("alert");
    // grep-verified verbatim in EdgeSummary.tsx oom branch:
    // "Edge mode unavailable: WebGPU adapter advertises only ..."
    expect(alert).toHaveTextContent(/Edge mode unavailable/i);
    expect(alert).toHaveTextContent(/0\.90 GB/i);
    expect(alert).toHaveTextContent(/1\.50 GB/i);
    expect(screen.getByText("Edge unavailable")).toBeInTheDocument();
  });

  it("renders role=status offline reconnect-pending (wave-38 A.6 + D-021)", () => {
    setEdge({ status: "offline", reconnect_pending: true });
    render(<EdgeSummary />);
    const status = screen.getByRole("status");
    // grep-verified verbatim in EdgeSummary.tsx offline branch:
    // "Server-authoritative reconnect pending. Edge results ..."
    expect(status).toHaveTextContent(/Server-authoritative reconnect pending/i);
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });

  it("renders role=alert error with underlying message + re-run guidance (wave-38 A.6)", () => {
    setEdge({ status: "error", message: "WebGPU adapter request failed" });
    render(<EdgeSummary />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/Edge inference error/i);
    expect(alert).toHaveTextContent(/WebGPU adapter request failed/i);
    expect(alert).toHaveTextContent(/Re-run the session/i);
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("connectivity override: ready state + offline connectivity surfaces the offline panel (wave-38 A.6)", () => {
    setEdge({ status: "ready", pipelineReady: true });
    setConnectivity({ status: "offline", reconnect_pending: true });
    render(<EdgeSummary />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/Server-authoritative reconnect pending/i);
    expect(screen.getByText("Offline")).toBeInTheDocument();
    // Ready panel should NOT render under connectivity override.
    expect(screen.queryByText(/Projected \(Newton\)/i)).not.toBeInTheDocument();
  });
});
