import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { TriAgentVerdictPanel } from "../../../shared/types";
import TriAgentCriticPanel from "../TriAgentCriticPanel";

const allApprove: TriAgentVerdictPanel = [
  {
    critic: "physics",
    verdict: "approve",
    reasoning_trace: ["Friction ellipse OK", "Bicycle model OK"],
  },
  {
    critic: "pedagogy",
    verdict: "approve",
    reasoning_trace: ["Recommendation is coachable"],
  },
  {
    critic: "guardian_safety",
    verdict: "approve",
    reasoning_trace: ["No safety concerns"],
  },
];

const anyFlag: TriAgentVerdictPanel = [
  {
    critic: "physics",
    verdict: "flag",
    reasoning_trace: ["Pacejka linearisation residual elevated"],
    flagged_concerns: ["Tier 7 residual exceeds 0.1 friction-coefficient units"],
  },
  {
    critic: "pedagogy",
    verdict: "approve",
    reasoning_trace: ["Coaching narrative is clear"],
  },
  {
    critic: "guardian_safety",
    verdict: "approve",
    reasoning_trace: ["Safety pass clean"],
  },
];

const anyReject: TriAgentVerdictPanel = [
  {
    critic: "physics",
    verdict: "approve",
    reasoning_trace: ["Physics consistent"],
  },
  {
    critic: "pedagogy",
    verdict: "approve",
    reasoning_trace: ["Coachable"],
  },
  {
    critic: "guardian_safety",
    verdict: "reject",
    reasoning_trace: ["Recommendation conflicts with COA Section 3(c) hardware spec"],
    blocked_recommendations: ["Reduce brake travel by 4 mm"],
  },
];

describe("TriAgentCriticPanel", () => {
  it("renders three critic cards with verdict headers", () => {
    render(<TriAgentCriticPanel panel={allApprove} />);
    expect(screen.getByText("Physics-Critic")).toBeInTheDocument();
    expect(screen.getByText("Pedagogy-Critic")).toBeInTheDocument();
    expect(screen.getByText("Guardian-Safety")).toBeInTheDocument();
    expect(screen.getAllByText("Approved").length).toBe(3);
    expect(screen.getByText(/All critics approve/i)).toBeInTheDocument();
  });

  it("triggers Mellea IVR repair chip on any-flag verdict", () => {
    render(<TriAgentCriticPanel panel={anyFlag} />);
    expect(screen.getByText(/Mellea IVR repair triggered/i)).toBeInTheDocument();
    expect(screen.getByText(/Tier 7 residual exceeds/i)).toBeInTheDocument();
    expect(screen.getByText("Flagged")).toBeInTheDocument();
    expect(screen.getAllByText("Approved").length).toBe(2);
  });

  it("renders blocked recommendations on any-reject verdict", () => {
    render(<TriAgentCriticPanel panel={anyReject} />);
    expect(screen.getByText("Rejected")).toBeInTheDocument();
    expect(screen.getByText(/Reduce brake travel by 4 mm/i)).toBeInTheDocument();
    expect(screen.getByText(/Mellea IVR repair triggered/i)).toBeInTheDocument();
  });

  it("renders empty-trace fallback with role=alert when reasoning trace is empty", () => {
    const emptyTrace: TriAgentVerdictPanel = [
      {
        critic: "physics",
        verdict: "reject",
        reasoning_trace: [],
        blocked_recommendations: ["something"],
      },
      {
        critic: "pedagogy",
        verdict: "approve",
        reasoning_trace: ["fine"],
      },
      {
        critic: "guardian_safety",
        verdict: "approve",
        reasoning_trace: ["fine"],
      },
    ];
    render(<TriAgentCriticPanel panel={emptyTrace} />);
    const alerts = screen.getAllByRole("alert");
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0]).toHaveTextContent(/Critic rejected without recorded reasoning/i);
  });
});
