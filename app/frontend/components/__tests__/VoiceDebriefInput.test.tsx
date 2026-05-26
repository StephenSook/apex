import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import VoiceDebriefInput from "../VoiceDebriefInput";

interface MockRecognition {
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  abort: ReturnType<typeof vi.fn>;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
}

function installMockSpeechRecognition(): MockRecognition {
  const instance: MockRecognition = {
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
    onresult: null,
    onerror: null,
    onend: null,
    continuous: false,
    interimResults: false,
    lang: "en-US",
  };
  const ctor = vi.fn(() => instance);
  (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition = ctor;
  (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition = ctor;
  return instance;
}

function removeSpeechRecognition() {
  delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
  delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
}

describe("VoiceDebriefInput (wave-44 Phase 6i + wave-45 Phase 3)", () => {
  beforeEach(() => {
    removeSpeechRecognition();
  });

  afterEach(() => {
    removeSpeechRecognition();
    vi.unstubAllGlobals();
  });

  it("renders 'unsupported' state when SpeechRecognition API absent", () => {
    render(<VoiceDebriefInput onTranscript={vi.fn()} />);
    expect(screen.getByText(/Voice debrief not supported/i)).toBeInTheDocument();
  });

  it("renders idle state with start button when API present", () => {
    installMockSpeechRecognition();
    render(<VoiceDebriefInput onTranscript={vi.fn()} />);
    expect(screen.getByRole("button", { name: /start voice debrief/i })).toBeInTheDocument();
  });

  it("renders Watson STT swap-point cross-ref in idle state", () => {
    installMockSpeechRecognition();
    render(<VoiceDebriefInput onTranscript={vi.fn()} />);
    expect(screen.getByText(/Vinh M3-V9/i)).toBeInTheDocument();
  });

  it("surfaces honesty-tier note that Web Speech API is HEAD path", () => {
    installMockSpeechRecognition();
    render(<VoiceDebriefInput onTranscript={vi.fn()} />);
    expect(
      screen.getByText(/browser.native|Web Speech/i),
    ).toBeInTheDocument();
  });

  it("renders Voice-debrief eyebrow with Watson STT swap-point cross-ref", () => {
    installMockSpeechRecognition();
    render(<VoiceDebriefInput onTranscript={vi.fn()} />);
    expect(screen.getByText(/Voice debrief.*browser-native.*Watson STT/i)).toBeInTheDocument();
  });
});
