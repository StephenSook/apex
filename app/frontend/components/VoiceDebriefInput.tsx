"use client";

/**
 * VoiceDebriefInput: browser-native voice debrief affordance for the
 * /analyze form. Wave-44 Phase 6i galaxy-stretch close-out per the
 * plan-file Phase 6i rollback path: HEAD ships Web Speech Recognition
 * API (no IBM Cloud account required); Watson STT swap-point
 * documented as Vinh V9 backend wire-up post-submission.
 *
 * Per BLOCKER 4 honesty audit + Phase 6i rollback path: the IBM
 * Watson STT wire is INTENT not REAL at HEAD. The affordance is real
 * + the transcription works via browser-native SpeechRecognition;
 * Watson STT swap-point + paddock-grade noise-cancel filter chain
 * documented for the post-submission iteration.
 *
 * Discriminated-union state:
 *   - unsupported: browser does not expose SpeechRecognition
 *   - idle: ready to record
 *   - recording: SpeechRecognition.start() called; interim results
 *     stream as they arrive
 *   - done: SpeechRecognition.onend() fired; final transcript ready
 *   - error: SpeechRecognition.onerror() fired; reason surfaces
 */

import { useEffect, useRef, useState } from "react";

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionEventLike extends Event {
  readonly results: ArrayLike<SpeechRecognitionResultLike>;
  readonly resultIndex: number;
}

interface SpeechRecognitionResultLike {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): { readonly transcript: string };
  [index: number]: { readonly transcript: string };
}

interface SpeechRecognitionErrorEventLike extends Event {
  readonly error: string;
  readonly message: string;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type VoiceDebriefState =
  | { readonly status: "unsupported" }
  | { readonly status: "idle" }
  | { readonly status: "recording"; readonly partial: string }
  | { readonly status: "done"; readonly transcript: string }
  | { readonly status: "error"; readonly message: string };

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as WindowWithSpeechRecognition;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface VoiceDebriefInputProps {
  readonly onTranscript: (transcript: string) => void;
}

export default function VoiceDebriefInput({ onTranscript }: VoiceDebriefInputProps) {
  const [state, setState] = useState<VoiceDebriefState>(() => {
    const SpeechRecognition = getSpeechRecognition();
    return SpeechRecognition === null ? { status: "unsupported" } : { status: "idle" };
  });
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const handleStart = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (SpeechRecognition === null) {
      setState({ status: "unsupported" });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    let aggregate = "";
    recognition.onresult = (event) => {
      let partial = aggregate;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          aggregate += transcript;
        } else {
          partial += transcript;
        }
      }
      setState({ status: "recording", partial: partial.trim() });
    };
    recognition.onerror = (event) => {
      setState({ status: "error", message: `${event.error}: ${event.message || "speech-recognition error"}` });
    };
    recognition.onend = () => {
      const finalTranscript = aggregate.trim();
      if (finalTranscript.length === 0) {
        setState({ status: "idle" });
        return;
      }
      setState({ status: "done", transcript: finalTranscript });
      onTranscript(finalTranscript);
    };
    recognitionRef.current = recognition;
    setState({ status: "recording", partial: "" });
    recognition.start();
  };

  const handleStop = () => {
    recognitionRef.current?.stop();
  };

  const handleReset = () => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setState({ status: "idle" });
  };

  if (state.status === "unsupported") {
    return (
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Voice debrief not supported in this browser. Type your debrief below instead.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-sm border border-rule bg-paper-warm p-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="apex-eyebrow">Voice debrief (browser-native; Watson STT swap-point per Vinh V9)</p>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
          {state.status}
        </span>
      </div>
      {state.status === "idle" && (
        <button
          type="button"
          onClick={handleStart}
          className="self-start rounded-sm border border-racing-green bg-racing-green px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-paper transition-colors hover:bg-racing-green-deep"
        >
          Start voice debrief
        </button>
      )}
      {state.status === "recording" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden="true" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-accent">Recording</span>
          </div>
          {state.partial.length > 0 && (
            <p className="rounded-sm border-l-2 border-amber bg-paper px-3 py-2 text-sm leading-relaxed text-ink-soft">
              {state.partial}
            </p>
          )}
          <button
            type="button"
            onClick={handleStop}
            className="self-start rounded-sm border border-accent bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-paper"
          >
            Stop and use transcript
          </button>
        </div>
      )}
      {state.status === "done" && (
        <div className="flex flex-col gap-2">
          <p className="rounded-sm border-l-2 border-racing-green bg-paper px-3 py-2 text-sm leading-relaxed text-ink">
            {state.transcript}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="self-start rounded-sm border border-racing-green bg-paper px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-racing-green transition-colors hover:bg-racing-green hover:text-paper"
          >
            Re-record
          </button>
        </div>
      )}
      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-sm border-2 border-accent bg-paper p-3 font-mono text-xs leading-relaxed text-accent"
        >
          Voice error: {state.message}. Type your debrief below instead.
        </p>
      )}
    </div>
  );
}
