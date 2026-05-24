import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import WatsonTtsRadio from "../../lib/watson-tts-radio";
import type { AuditId } from "../../../shared/brands";

const TEST_AUDIT_ID = "abcdef01234567890123456789abcdef" as unknown as AuditId;

describe("WatsonTtsRadio", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    // Stub speechSynthesis so playFallback paths don't throw.
    (globalThis as unknown as { window: Window }).window.speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: () => [],
    } as unknown as SpeechSynthesis;
    (globalThis as unknown as Record<string, unknown>).SpeechSynthesisUtterance = vi
      .fn()
      .mockImplementation(() => ({
        pitch: 1,
        rate: 1,
        volume: 1,
      }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders 'checking' state on first mount before HEAD-probe resolves", () => {
    fetchMock.mockImplementation(() => new Promise(() => undefined));
    render(<WatsonTtsRadio auditId={TEST_AUDIT_ID} text="test coaching report" />);
    expect(screen.getByText(/checking audio cache/i)).toBeInTheDocument();
  });

  it("renders ready_watson + <audio> with the cache URL on HEAD 200", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));
    render(<WatsonTtsRadio auditId={TEST_AUDIT_ID} text="cached coaching report" />);
    await waitFor(() =>
      expect(screen.getByLabelText(/walkie-talkie audio playback/i)).toBeInTheDocument(),
    );
    const audio = screen.getByLabelText(/walkie-talkie audio playback/i) as HTMLAudioElement;
    expect(audio.src).toContain(TEST_AUDIT_ID);
  });

  it("attempts synthesis POST on HEAD 404 then falls back to Web Speech on 502", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 })) // HEAD probe miss
      .mockResolvedValueOnce(new Response("ffmpeg failed", { status: 502 })); // synth POST fails
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<WatsonTtsRadio auditId={TEST_AUDIT_ID} text="cache-miss test" />);
    await waitFor(() => expect(screen.getByText(/Web Speech API fallback/i)).toBeInTheDocument());
    // F2 MED#7: console.warn surfaces failure shape for operator debugging.
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("transitions HEAD-miss + synth 200 to ready_watson with the returned URL", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ url: "/generated-audio/test.mp3", cached: false }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    render(<WatsonTtsRadio auditId={TEST_AUDIT_ID} text="synthesis-success test" />);
    await waitFor(() =>
      expect(screen.getByLabelText(/walkie-talkie audio playback/i)).toBeInTheDocument(),
    );
  });

  it("falls back to Web Speech API on HEAD network error (no synthesis attempt)", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Network failure"));
    render(<WatsonTtsRadio auditId={TEST_AUDIT_ID} text="network-fail test" />);
    await waitFor(() => expect(screen.getByText(/Web Speech API fallback/i)).toBeInTheDocument());
  });
});
