import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { GuardianAudit as GuardianAuditType } from "../../../shared/types";
import GuardianAudit from "../GuardianAudit";

describe("GuardianAudit", () => {
  it("renders the approve verdict with the open reasoning trace", () => {
    const audit: GuardianAuditType = {
      verdict: "approve",
      reasoning_trace: ["Friction ellipse OK", "Bicycle model OK"],
      audit_id: "audit-approve-1",
    };
    render(<GuardianAudit audit={audit} />);
    expect(screen.getByText("Approved")).toBeInTheDocument();
    // Reasoning trace items should be visible because <details open> is set on approve.
    expect(screen.getByText("Friction ellipse OK")).toBeInTheDocument();
    expect(screen.getByText("Bicycle model OK")).toBeInTheDocument();
    expect(screen.getByText(/audit-approve-1/i)).toBeInTheDocument();
  });

  it("renders the flag verdict with the flagged_concerns list", () => {
    const audit: GuardianAuditType = {
      verdict: "flag",
      reasoning_trace: ["trace step"],
      flagged_concerns: ["Lever travel below safe envelope"],
      audit_id: "audit-flag-1",
    };
    render(<GuardianAudit audit={audit} />);
    expect(screen.getByText("Flagged")).toBeInTheDocument();
    expect(screen.getByText("Lever travel below safe envelope")).toBeInTheDocument();
  });

  it("renders the reject verdict with the blocked_recommendations list", () => {
    const audit: GuardianAuditType = {
      verdict: "reject",
      reasoning_trace: ["trace step"],
      blocked_recommendations: ["Increase brake force by 200%"],
      audit_id: "audit-reject-1",
    };
    render(<GuardianAudit audit={audit} />);
    expect(screen.getByText("Rejected")).toBeInTheDocument();
    expect(screen.getByText("Increase brake force by 200%")).toBeInTheDocument();
  });

  it("singularises the reasoning-trace step count", () => {
    const audit: GuardianAuditType = {
      verdict: "approve",
      reasoning_trace: ["only one"],
      audit_id: "audit-approve-2",
    };
    render(<GuardianAudit audit={audit} />);
    expect(screen.getByText(/Reasoning trace \(1 step\)/i)).toBeInTheDocument();
  });

  it("renders role=alert when reasoning_trace is empty (Codex wave-15 MED guard)", () => {
    const audit: GuardianAuditType = {
      verdict: "approve",
      reasoning_trace: [],
      audit_id: "audit-empty-trace",
    };
    render(<GuardianAudit audit={audit} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/Reasoning trace is empty/i);
    expect(screen.queryByText(/Reasoning trace \(0 step/i)).not.toBeInTheDocument();
  });
});
