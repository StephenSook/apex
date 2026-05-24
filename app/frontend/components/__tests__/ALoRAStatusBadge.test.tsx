import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ALoRAStatusBadge, { type ALoRAStatus } from "../ALoRAStatusBadge";

describe("ALoRAStatusBadge", () => {
  it("renders idle state with base-model copy + no role=alert", () => {
    const status: ALoRAStatus = { status: "idle" };
    render(<ALoRAStatusBadge status={status} />);
    expect(screen.getByText(/No adapter loaded/i)).toBeInTheDocument();
    expect(screen.getByText(/Base model/i)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders loading state with elapsed-ms numeric + sub-200ms criterion copy", () => {
    const status: ALoRAStatus = { status: "loading", elapsed_ms: 137 };
    render(<ALoRAStatusBadge status={status} />);
    expect(screen.getByText(/137 ms elapsed/i)).toBeInTheDocument();
    expect(screen.getByText(/sub-200 ms/i)).toBeInTheDocument();
    expect(screen.getByText(/Hot-swap/i)).toBeInTheDocument();
  });

  it("renders active state with adapter name + rank + alpha + lambda numerics", () => {
    const status: ALoRAStatus = {
      status: "active",
      adapter_name: "race-engineer-intrinsic-v1",
      rank: 16,
      alpha: 32,
      lambda: 0.85,
      swap_ms: 124,
    };
    render(<ALoRAStatusBadge status={status} />);
    expect(screen.getByText(/race-engineer-intrinsic-v1/i)).toBeInTheDocument();
    expect(screen.getByText(/124 ms round-trip/i)).toBeInTheDocument();
    expect(screen.getByText(/Adapter active/i)).toBeInTheDocument();
    expect(screen.getByText("16")).toBeInTheDocument();
    expect(screen.getByText("32")).toBeInTheDocument();
    expect(screen.getByText("0.85")).toBeInTheDocument();
  });

  it("renders fallback state with role=alert + reason + base-model routing", () => {
    const status: ALoRAStatus = { status: "fallback", reason: "adapter checksum mismatch" };
    render(<ALoRAStatusBadge status={status} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/adapter checksum mismatch/i);
    expect(alert).toHaveTextContent(/base Granite Instruct 4.1 8B/i);
  });

  it("renders error state with role=alert + message + vLLM service-health hint", () => {
    const status: ALoRAStatus = { status: "error", message: "503 service unavailable" };
    render(<ALoRAStatusBadge status={status} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/503 service unavailable/i);
    expect(alert).toHaveTextContent(/vLLM service health on \/status/i);
  });
});
