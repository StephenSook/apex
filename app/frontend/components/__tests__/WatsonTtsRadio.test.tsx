import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import WatsonTtsRadio from "../../lib/watson-tts-radio";
import type { AuditId } from "../../../shared/brands";

const TEST_AUDIT_ID = "abcdef01234567890123456789abcdef" as unknown as AuditId;

describe("WatsonTtsRadio (inline-blob streaming shape, cascade-#15 rework)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let createObjectURLMock: ReturnType<typeof vi.fn>;
  let revokeObjectURLMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    createObjectURLMock = vi.fn(() => "blob:apex-mock-url");
    revokeObjectURLMock = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: createObjectURLMock,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: revokeObjectURLMock,
    });
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      writable: true,
      value: {
        speak: vi.fn(),
        cancel: vi.fn(),
        getVoices: () => [],
      } as unknown as SpeechSynthesis,
    });
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

  it("renders 'preparing audio' on mount before synth POST resolves", () => {
    fetchMock.mockImplementation(() => new Promise(() => undefined));
    render(<WatsonTtsRadio auditId={TEST_AUDIT_ID} text="test coaching report" />);
    expect(screen.getByText(/preparing audio/i)).toBeInTheDocument();
  });

  it("synth POST 200 with audio/mpeg body transitions to ready_watson + creates blob URL", async () => {
    // jsdom Response.blob() routes through the body's underlying
    // ReadableStream; pass Uint8Array directly so the polyfill handles
    // it without invoking Blob.prototype.stream (missing in jsdom).
    const audioBytes = new Uint8Array([0xff, 0xfb, 0x90, 0x00]);
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Headers({ "Content-Type": "audio/mpeg" }),
      blob: async () => new Blob([audioBytes], { type: "audio/mpeg" }),
      text: async () => "",
    } as unknown as Response;
    fetchMock.mockResolvedValueOnce(mockResponse);
    render(<WatsonTtsRadio auditId={TEST_AUDIT_ID} text="ready test" />);
    await waitFor(() =>
      expect(screen.getByLabelText(/walkie-talkie audio playback/i)).toBeInTheDocument(),
    );
    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    const audio = screen.getByLabelText(/walkie-talkie audio playback/i) as HTMLAudioElement;
    expect(audio.src).toContain("blob:");
  });

  it("synth POST 502 falls back to Web Speech API + logs warn", async () => {
    fetchMock.mockResolvedValueOnce(new Response("ffmpeg failed", { status: 502 }));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<WatsonTtsRadio auditId={TEST_AUDIT_ID} text="502 test" />);
    await waitFor(() => expect(screen.getByText(/Web Speech API fallback/i)).toBeInTheDocument());
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("synth POST network throw falls back to Web Speech API + logs warn", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Network failure"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<WatsonTtsRadio auditId={TEST_AUDIT_ID} text="throw test" />);
    await waitFor(() => expect(screen.getByText(/Web Speech API fallback/i)).toBeInTheDocument());
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("unmount mid-flight aborts the synth POST + revokes blob URL", async () => {
    let abortReceived = false;
    fetchMock.mockImplementation((_url, init) => {
      const signal = (init as RequestInit | undefined)?.signal;
      return new Promise<Response>((_resolve, reject) => {
        if (signal !== undefined && signal !== null) {
          signal.addEventListener("abort", () => {
            abortReceived = true;
            reject(new DOMException("aborted", "AbortError"));
          });
        }
      });
    });
    const { unmount } = render(<WatsonTtsRadio auditId={TEST_AUDIT_ID} text="abort test" />);
    unmount();
    await waitFor(() => expect(abortReceived).toBe(true));
  });
});
