import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AICopilotChat from "../AICopilotChat";

vi.mock("../../lib/openrouter-stream", () => ({
  useOpenRouterStream: vi.fn(),
}));

import { useOpenRouterStream } from "../../lib/openrouter-stream";

const mockUseStream = vi.mocked(useOpenRouterStream);

describe("AICopilotChat", () => {
  beforeEach(() => {
    mockUseStream.mockReturnValue({ status: "idle" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the idle state with heading + suggested-questions block", () => {
    render(<AICopilotChat />);
    expect(
      screen.getByRole("heading", { name: /Ask the race engineer/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/AI Copilot/i)).toBeInTheDocument();
  });

  it("renders the input textbox + submit button in idle state", () => {
    render(<AICopilotChat />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    const submitButtons = screen.getAllByRole("button");
    expect(submitButtons.length).toBeGreaterThan(0);
  });

  it("transitions to asking state when user types + submits a question", async () => {
    const user = userEvent.setup();
    render(<AICopilotChat />);
    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "What is the friction-ellipse coefficient?");
    // Find the form-submit button.
    const submitBtn = screen
      .getAllByRole("button")
      .find((b) => /ask|send|submit/i.test(b.textContent ?? "")) ?? screen.getAllByRole("button")[0];
    await user.click(submitBtn);
    // After submit, useOpenRouterStream should receive the trimmed question.
    expect(mockUseStream).toHaveBeenCalled();
  });

  it("renders the 'Live' indicator AND streaming partial when localState=asking + streamState=streaming", async () => {
    const user = userEvent.setup();
    mockUseStream.mockReturnValue({ status: "streaming", partial: "tokens flowing..." });
    render(<AICopilotChat />);
    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "Why did you pick the early-throttle line?");
    const submitBtn = screen
      .getAllByRole("button")
      .find((b) => /^ask$/i.test(b.textContent?.trim() ?? "")) ?? screen.getAllByRole("button")[0];
    await user.click(submitBtn);
    expect(screen.getByText(/^Live$/i)).toBeInTheDocument();
    expect(screen.getByText(/tokens flowing\.\.\./)).toBeInTheDocument();
  });

  it("renders the ready-branch full response when streamState=ready", async () => {
    const user = userEvent.setup();
    mockUseStream.mockReturnValue({ status: "ready", full: "the friction-ellipse limit at that corner..." });
    render(<AICopilotChat />);
    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "Walk me through the COA gate.");
    const submitBtn = screen
      .getAllByRole("button")
      .find((b) => /^ask$/i.test(b.textContent?.trim() ?? "")) ?? screen.getAllByRole("button")[0];
    await user.click(submitBtn);
    expect(screen.getByText(/the friction-ellipse limit at that corner/i)).toBeInTheDocument();
    expect(screen.queryByText(/^Live$/i)).not.toBeInTheDocument();
  });

  it("renders the error-branch role=alert when streamState=error", async () => {
    const user = userEvent.setup();
    mockUseStream.mockReturnValue({ status: "error", message: "rate limit exceeded" });
    render(<AICopilotChat />);
    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "Compare my lap delta.");
    const submitBtn = screen
      .getAllByRole("button")
      .find((b) => /^ask$/i.test(b.textContent?.trim() ?? "")) ?? screen.getAllByRole("button")[0];
    await user.click(submitBtn);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/rate limit exceeded/i);
  });

  it("uses panelId prop for the heading id (a11y aria-labelledby)", () => {
    render(<AICopilotChat panelId="test-panel" />);
    const heading = screen.getByRole("heading", { name: /Ask the race engineer/i });
    expect(heading.id).toBe("test-panel-title");
  });
});
