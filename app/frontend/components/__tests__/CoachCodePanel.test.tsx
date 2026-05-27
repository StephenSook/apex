/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CoachCodePanel from "../CoachCodePanel";

/**
 * Wave-46 C14a R5 CoachCodePanel component test scaffold.
 *
 * Covers discriminated-union state machine: idle (form with prefilled
 * sample code + question) -> submitting (fetch in flight) -> ready
 * (response rendered with engine pill + feedback prose + reset button)
 * + error (role=alert when fetch fails).
 *
 * `globalThis.fetch` mocked via vi.spyOn since jsdom does not run a
 * real backend; mock returns a CoachCodeResponse-shaped JSON.
 */
describe("CoachCodePanel wave-46 Phase 6.2.B component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the form with prefilled code + question + Get feedback button on mount", () => {
    render(<CoachCodePanel />);
    expect(screen.getByRole("button", { name: /Get feedback/i })).toBeInTheDocument();
    const codeField = screen.getByRole("textbox", { name: /Code/i });
    expect(codeField).toBeInTheDocument();
    expect((codeField as HTMLTextAreaElement).value).toMatch(/aggregateToMiniSectors/);
  });

  it("transitions to ready state + renders engine pill + feedback prose + reset button after submit", async () => {
    const user = userEvent.setup();
    const mockPayload = {
      engine: "coach-code-canned-fallback",
      compute_ms: 12,
      model: "ibm-granite/granite-4.1-8b-instruct",
      feedback: "Aggregate at 1 Hz mini-sector tensor. Cite FIA Appendix L per the published revision.",
      prompt_tokens: 0,
      completion_tokens: 0,
      swap_point: "test-swap-point",
      retry_count: 0,
      violation_summary: [[]],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockPayload), { status: 200 }),
    );

    render(<CoachCodePanel />);
    const submitButton = screen.getByRole("button", { name: /Get feedback/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/engine: coach-code-canned-fallback/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Aggregate at 1 Hz mini-sector tensor/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ask another question/i })).toBeInTheDocument();
  });

  it("transitions to error state with role=alert when fetch returns non-ok", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "missing_question", message: "missing question" }), {
        status: 400,
      }),
    );

    render(<CoachCodePanel />);
    const submitButton = screen.getByRole("button", { name: /Get feedback/i });
    await user.click(submitButton);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/Coach-code error/i);
    expect(alert).toHaveTextContent(/missing question/i);
  });

  it("returns to idle form when Ask another question is clicked from ready state", async () => {
    const user = userEvent.setup();
    const mockPayload = {
      engine: "coach-code-canned-fallback",
      compute_ms: 5,
      model: "ibm-granite/granite-4.1-8b-instruct",
      feedback: "Test feedback content.",
      prompt_tokens: 0,
      completion_tokens: 0,
      swap_point: "test",
      retry_count: 0,
      violation_summary: [[]],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockPayload), { status: 200 }),
    );

    render(<CoachCodePanel />);
    await user.click(screen.getByRole("button", { name: /Get feedback/i }));
    const resetButton = await screen.findByRole("button", { name: /Ask another question/i });
    await user.click(resetButton);

    expect(screen.getByRole("button", { name: /Get feedback/i })).toBeInTheDocument();
    expect(screen.queryByText(/Test feedback content/)).not.toBeInTheDocument();
  });
});
