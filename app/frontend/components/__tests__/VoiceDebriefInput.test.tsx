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
    render(<VoiceDebriefInput />);
    expect(screen.getByText(/voice debrief unavailable/i)).toBeInTheDocument();
  });

  it("renders idle state with start button when API present", () => {
    installMockSpeechRecognition();
    render(<VoiceDebriefInput />);
    expect(screen.getByRole("button", { name: /start voice debrief/i })).toBeInTheDocument();
  });

  it("renders Watson STT swap-point cross-ref in idle state", () => {
    installMockSpeechRecognition();
    render(<VoiceDebriefInput />);
    expect(screen.getByText(/Vinh M3-V9/i)).toBeInTheDocument();
  });

  it("surfaces honesty-tier note that Web Speech API is HEAD path", () => {
    installMockSpeechRecognition();
    render(<VoiceDebriefInput />);
    expect(
      screen.getByText(/browser.native|Web Speech/i),
    ).toBeInTheDocument();
  });

  it("renders accessible heading with aria semantics", () => {
    installMockSpeechRecognition();
    render(<VoiceDebriefInput />);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toBeInTheDocument();
  });
});
