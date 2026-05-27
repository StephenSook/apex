/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import NotebookLMHoverAudio from "../NotebookLMHoverAudio";

/**
 * Wave-46 C11 R2 NotebookLMHoverAudio component test scaffold.
 *
 * Covers the discriminated-union state machine transitions:
 *   - idle: Listen button rendered with ARIA label
 *   - playing: state transitions on user click when audio.play() resolves
 *   - missing: state transitions on user click when audio.play() rejects (404)
 *
 * Mocks HTMLAudioElement.play() to control the promise resolution since
 * jsdom does not actually load /audio/* assets.
 */
describe("NotebookLMHoverAudio wave-46 Phase 7.6 component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the idle Listen button with panel-label ARIA on mount", () => {
    render(<NotebookLMHoverAudio panelId="coa-gate" panelLabel="COA gate killshot" />);
    const button = screen.getByRole("button", {
      name: /Play NotebookLM audio commentary for COA gate killshot/i,
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/Listen/i);
  });

  it("transitions to playing state when user clicks Listen and audio.play resolves", async () => {
    const user = userEvent.setup();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);

    render(<NotebookLMHoverAudio panelId="coa-gate" panelLabel="COA gate killshot" />);
    const listenButton = screen.getByRole("button", {
      name: /Play NotebookLM audio commentary/i,
    });
    await user.click(listenButton);

    const playingLabel = await screen.findByText(/NotebookLM commentary · COA gate killshot/i);
    expect(playingLabel).toBeInTheDocument();
    const stopButton = screen.getByRole("button", { name: /Stop/i });
    expect(stopButton).toBeInTheDocument();
  });

  it("transitions to missing state when user clicks Listen and audio.play rejects (404)", async () => {
    const user = userEvent.setup();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValue(new Error("404 not found"));

    render(<NotebookLMHoverAudio panelId="lips-harness" panelLabel="LIPS harness link" />);
    const listenButton = screen.getByRole("button", {
      name: /Play NotebookLM audio commentary/i,
    });
    await user.click(listenButton);

    const missingMessage = await screen.findByText(/Audio asset pending NotebookLM generation/i);
    expect(missingMessage).toBeInTheDocument();
    expect(missingMessage).toHaveAttribute("role", "status");
  });

  it("transitions back to idle state when Stop button is clicked from playing state", async () => {
    const user = userEvent.setup();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});

    render(<NotebookLMHoverAudio panelId="coa-gate" panelLabel="COA gate" />);
    const listenButton = screen.getByRole("button", { name: /Play NotebookLM audio commentary/i });
    await user.click(listenButton);

    const stopButton = await screen.findByRole("button", { name: /Stop/i });
    await user.click(stopButton);

    expect(pauseSpy).toHaveBeenCalled();
    const listenButtonAfterReset = await screen.findByRole("button", {
      name: /Play NotebookLM audio commentary/i,
    });
    expect(listenButtonAfterReset).toBeInTheDocument();
  });
});
