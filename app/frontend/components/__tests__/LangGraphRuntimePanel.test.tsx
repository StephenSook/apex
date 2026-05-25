import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import LangGraphRuntimePanel from "../LangGraphRuntimePanel";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("LangGraphRuntimePanel (wave-45 Phase 9 V14 orchestration trace)", () => {
  it("renders loading state at mount", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<LangGraphRuntimePanel />);
    expect(screen.getByText(/Loading orchestration trace/i)).toBeInTheDocument();
  });

  it("renders 6 nodes + total + engine pill once /api/orchestration resolves", async () => {
    const mockNodes = [
      { id: "ingest", label: "Telemetry ingest", status: "completed", elapsed_ms: 42 },
      { id: "rag", label: "Granite Embedding R2 retrieval", status: "completed", elapsed_ms: 88 },
      { id: "projection", label: "V2 cvxpylayers projector", status: "completed", elapsed_ms: 290 },
      { id: "guardian", label: "Granite Guardian audit", status: "completed", elapsed_ms: 142 },
      { id: "instruct", label: "Granite 4.1 8B narrator", status: "completed", elapsed_ms: 8420 },
      { id: "provenance", label: "Footer assembly", status: "completed", elapsed_ms: 18 },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          engine: "langgraph-v14-canned-fallback",
          trace_id: "test-trace-123",
          nodes: mockNodes,
          total_ms: 9000,
          swap_point: "Vinh M3-V14 swap-point",
        }),
      })),
    );
    render(<LangGraphRuntimePanel />);
    await waitFor(() => {
      expect(screen.getByText(/Engine: langgraph-v14-canned-fallback/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Telemetry ingest/i)).toBeInTheDocument();
    expect(screen.getByText(/Footer assembly/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Node \d+/i)).toHaveLength(6);
  });

  it("renders role=alert on fetch failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 500 })),
    );
    render(<LangGraphRuntimePanel />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
