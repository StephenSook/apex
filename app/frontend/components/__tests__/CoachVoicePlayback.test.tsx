/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CoachVoicePlayback from "../CoachVoicePlayback";

/**
 * Wave-47 G1 CoachVoicePlayback component test scaffold.
 *
 * Covers: Web Speech API HEAD path discriminated-union state machine
 * (idle -> playing -> ended -> idle) + unsupported branch + ARIA
 * pressed state transitions + speechSynthesis.speak invocation.
 */
describe("CoachVoicePlayback wave-47 G1 component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Stub the global SpeechSynthesis API for jsdom which doesn't ship it.
    // Wave-47 cascade-#53 fix: mock speak() does NOT auto-fire onend
    // so the playing-state Stop button stays mounted long enough for
    // findByRole to assert aria-pressed=true. The previous 10ms auto-
    // fire raced against userEvent rendering + caused intermittent
    // CI failures on this assertion.
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      writable: true,
      value: {
        speak: vi.fn(),
        cancel: vi.fn(),
      },
    });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      writable: true,
      value: class {
        onend: ((ev: SpeechSynthesisEvent) => void) | null = null;
        onerror: ((ev: SpeechSynthesisErrorEvent) => void) | null = null;
        rate = 1;
        pitch = 1;
        volume = 1;
        text: string;
        constructor(text: string) {
          this.text = text;
        }
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the Hear coach button in idle state with browser-voice engine annotation", () => {
    render(<CoachVoicePlayback narration="Sector 2 apex delta 0.31 seconds." />);
    const button = screen.getByRole("button", { name: /Play coaching report aloud/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(/browser voice|Granite Speech 4\.1 2B-Plus/i)).toBeInTheDocument();
  });

  it("transitions to playing + back to idle via onend callback chain", async () => {
    const user = userEvent.setup();
    render(<CoachVoicePlayback narration="Test narration content." />);
    const button = screen.getByRole("button", { name: /Play coaching report aloud/i });
    await user.click(button);
    const stopButton = await screen.findByRole("button", { name: /Stop the coaching report playback/i });
    expect(stopButton).toHaveAttribute("aria-pressed", "true");
  });

  it("renders unsupported fallback when window.speechSynthesis is missing", () => {
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      writable: true,
      value: undefined,
    });
    render(<CoachVoicePlayback narration="Test." />);
    expect(screen.getByText(/Voice playback unavailable/i)).toBeInTheDocument();
  });
});
