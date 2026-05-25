import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { TriAgentVerdictPanel } from "../../../shared/types";
import TriAgentCriticPanel from "../TriAgentCriticPanel";

const allApprove: TriAgentVerdictPanel = [
  {
    critic: "physics",
    verdict: "approve",
    reasoning_trace: ["Friction ellipse OK", "Bicycle model OK"],
    critic_run_id: "test-physics-approve-1",
  },
  {
    critic: "pedagogy",
    verdict: "approve",
    reasoning_trace: ["Recommendation is coachable"],
    critic_run_id: "test-pedagogy-approve-1",
  },
  {
    critic: "guardian_safety",
    verdict: "approve",
    reasoning_trace: ["No safety concerns"],
    critic_run_id: "test-guardian-safety-approve-1",
  },
];

const anyFlag: TriAgentVerdictPanel = [
  {
    critic: "physics",
    verdict: "flag",
    reasoning_trace: ["Pacejka linearisation residual elevated"],
    flagged_concerns: ["Tier 7 residual exceeds 0.1 friction-coefficient units"],
    critic_run_id: "test-physics-flag-1",
  },
  {
    critic: "pedagogy",
    verdict: "approve",
    reasoning_trace: ["Coaching narrative is clear"],
    critic_run_id: "test-pedagogy-approve-2",
  },
  {
    critic: "guardian_safety",
    verdict: "approve",
    reasoning_trace: ["Safety pass clean"],
    critic_run_id: "test-guardian-safety-approve-2",
  },
];

const anyReject: TriAgentVerdictPanel = [
  {
    critic: "physics",
    verdict: "approve",
    reasoning_trace: ["Physics consistent"],
    critic_run_id: "test-physics-approve-2",
  },
  {
    critic: "pedagogy",
    verdict: "approve",
    reasoning_trace: ["Coachable"],
    critic_run_id: "test-pedagogy-approve-3",
  },
  {
    critic: "guardian_safety",
    verdict: "reject",
    reasoning_trace: ["Recommendation conflicts with COA hardware-spec section"],
    blocked_recommendations: ["Reduce brake travel by 4 mm"],
    critic_run_id: "test-guardian-safety-reject-1",
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
        critic_run_id: "test-physics-reject-empty-trace-1",
      },
      {
        critic: "pedagogy",
        verdict: "approve",
        reasoning_trace: ["fine"],
        critic_run_id: "test-pedagogy-approve-4",
      },
      {
        critic: "guardian_safety",
        verdict: "approve",
        reasoning_trace: ["fine"],
        critic_run_id: "test-guardian-safety-approve-3",
      },
    ];
    render(<TriAgentCriticPanel panel={emptyTrace} />);
    const alerts = screen.getAllByRole("alert");
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0]).toHaveTextContent(/Critic rejected without recorded reasoning/i);
  });

  it("renders the empty-concerns fallback when verdict is flag and flagged_concerns is empty (wave-35 A.8)", () => {
    const flagEmptyConcerns: TriAgentVerdictPanel = [
      {
        critic: "physics",
        verdict: "flag",
        reasoning_trace: ["Pacejka residual elevated"],
        flagged_concerns: [],
        critic_run_id: "test-physics-flag-empty-1",
      },
      {
        critic: "pedagogy",
        verdict: "approve",
        reasoning_trace: ["Coachable"],
        critic_run_id: "test-pedagogy-approve-flag-empty-1",
      },
      {
        critic: "guardian_safety",
        verdict: "approve",
        reasoning_trace: ["Safety pass"],
        critic_run_id: "test-guardian-safety-approve-flag-empty-1",
      },
    ];
    render(<TriAgentCriticPanel panel={flagEmptyConcerns} />);
    const alerts = screen.getAllByRole("alert");
    expect(alerts.length).toBeGreaterThan(0);
    // grep-verified verbatim in TriAgentCriticPanel.tsx line 165:
    // "Critic returned a flag verdict without recorded concerns; ..."
    const target = alerts.find((a) =>
      /flag verdict without recorded concerns/i.test(a.textContent ?? ""),
    );
    expect(target).toBeDefined();
  });

  it("renders the empty-blocked fallback when verdict is reject and blocked_recommendations is empty (wave-35 A.8)", () => {
    const rejectEmptyBlocked: TriAgentVerdictPanel = [
      {
        critic: "physics",
        verdict: "approve",
        reasoning_trace: ["Physics consistent"],
        critic_run_id: "test-physics-approve-reject-empty-1",
      },
      {
        critic: "pedagogy",
        verdict: "approve",
        reasoning_trace: ["Coachable"],
        critic_run_id: "test-pedagogy-approve-reject-empty-1",
      },
      {
        critic: "guardian_safety",
        verdict: "reject",
        reasoning_trace: ["COA conflict"],
        blocked_recommendations: [],
        critic_run_id: "test-guardian-safety-reject-empty-1",
      },
    ];
    render(<TriAgentCriticPanel panel={rejectEmptyBlocked} />);
    const alerts = screen.getAllByRole("alert");
    expect(alerts.length).toBeGreaterThan(0);
    // grep-verified verbatim in TriAgentCriticPanel.tsx line 181:
    // "Critic rejected without recorded blocked recommendations; ..."
    const target = alerts.find((a) =>
      /Critic rejected without recorded blocked recommendations/i.test(a.textContent ?? ""),
    );
    expect(target).toBeDefined();
  });
});
