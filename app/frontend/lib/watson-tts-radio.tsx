"use client";

/**
 * Watson TTS walkie-talkie audio player. Wave-42 Lane A.F.1 close-out
 * per the competitor field deep-dive memory steal-list HIGH-value
 * item #1 (PitWall watson_tts.py:37-81 FFmpeg filter-chain
 * walkie-talkie acoustic profile pattern).
 *
 * Two-path implementation:
 *
 * 1. **Watson TTS server-side path** (production): /api/watson-tts
 *    endpoint (Stream M.3 spec extension; Vinh wires in next sync
 *    window) generates the audio with Watson TTS REST API + the
 *    FFmpeg filter chain (highpass=f=350 + lowpass=f=3000 + compand
 *    + volume=1.8) for the walkie-talkie acoustic profile + caches
 *    to `public/generated-audio/{audit_id}.mp3`. The frontend reads
 *    the cached audio file via a standard <audio src> element.
 *
 * 2. **Web Speech API fallback** (immediate ship): when the
 *    Watson server endpoint is unreachable OR when the
 *    /generated-audio/ cache file does not exist, fall back to
 *    `window.speechSynthesis.speak()` with pitch + rate adjustments
 *    that approximate the walkie-talkie profile (pitch 0.85 +
 *    rate 1.05). No external API key needed; works in any modern
 *    browser with Web Speech API support.
 *
 * The component below renders an `<audio>` element when the Watson
 * path is available + falls through to the speechSynthesis path when
 * the audio file lookup fails. User-gesture-triggered play (NOT
 * auto-play) per browser audio API constraints.
 *
 * Per cascade-#11 type-only-import discipline: branded types come
 * via `import type` since this module is client-bundled + the brand
 * runtime construction happens at the consumer site that already
 * has the parsed AuditId in scope.
 */

import { useCallback, useEffect, useState } from "react";

import type { AuditId } from "../../shared/brands";

type AudioPlayerState =
  | { readonly status: "idle" }
  | { readonly status: "checking" }
  | { readonly status: "ready_watson"; readonly url: string }
  | { readonly status: "ready_fallback" }
  | { readonly status: "error"; readonly message: string };

export interface WatsonTtsRadioProps {
  readonly auditId: AuditId;
  readonly text: string;
  readonly cachedAudioBaseUrl?: string;
}

const DEFAULT_CACHED_AUDIO_BASE_URL = "/generated-audio";

export default function WatsonTtsRadio({
  auditId,
  text,
  cachedAudioBaseUrl = DEFAULT_CACHED_AUDIO_BASE_URL,
}: WatsonTtsRadioProps) {
  const [state, setState] = useState<AudioPlayerState>({ status: "idle" });

  // Detect availability of the cached Watson TTS audio file at mount.
  // queueMicrotask defers the setState per cascade-#8 react-hooks/set-
  // state-in-effect ESLint rule + cascade-#11 hook-hardening pattern.
  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setState({ status: "checking" });
    });

    const audioUrl = `${cachedAudioBaseUrl}/${auditId}.mp3`;

    void (async () => {
      try {
        const response = await fetch(audioUrl, { method: "HEAD" });
        if (cancelled) return;
        if (response.ok) {
          setState({ status: "ready_watson", url: audioUrl });
          return;
        }
        // 404 OR other non-ok: fall back to Web Speech API.
        setState({ status: "ready_fallback" });
      } catch {
        if (cancelled) return;
        // Network error / SSR / fetch unsupported: fall back to Web
        // Speech API which only requires browser-side speechSynthesis.
        setState({ status: "ready_fallback" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [auditId, cachedAudioBaseUrl]);

  const playFallback = useCallback(() => {
    if (typeof window === "undefined" || typeof window.speechSynthesis === "undefined") {
      setState({
        status: "error",
        message: "Web Speech API not available in this browser. Update to a recent Chrome / Safari / Firefox for the walkie-talkie audio fallback.",
      });
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    // Walkie-talkie acoustic profile approximation: lower pitch + slightly
    // faster rate. Real walkie-talkie filter chain (highpass + lowpass +
    // compand + volume) lives in the server-side Watson TTS path; this
    // fallback approximates the perceptual character.
    utterance.pitch = 0.85;
    utterance.rate = 1.05;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  }, [text]);

  if (state.status === "idle" || state.status === "checking") {
    return (
      <div className="flex flex-col gap-2 rounded-sm border border-rule bg-paper p-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
          Walkie-talkie · checking audio cache
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div
        role="alert"
        className="flex flex-col gap-2 rounded-sm border border-accent bg-paper p-4"
      >
        <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
          Walkie-talkie unavailable
        </p>
        <p className="text-xs leading-relaxed text-ink-soft">{state.message}</p>
      </div>
    );
  }

  if (state.status === "ready_watson") {
    return (
      <div className="flex flex-col gap-2 rounded-sm border border-rule bg-paper p-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
          Walkie-talkie · Watson TTS · wave-42 Lane A.F.1
        </p>
        <audio
          controls
          src={state.url}
          aria-label="Coaching report walkie-talkie audio playback"
          className="w-full"
        />
        <p className="font-mono text-[10px] text-muted">
          Audio generated server-side via Watson TTS + FFmpeg walkie-talkie
          filter chain (highpass=f=350 + lowpass=f=3000 + compand + volume=1.8)
        </p>
      </div>
    );
  }

  // state.status === "ready_fallback"
  return (
    <div className="flex flex-col gap-2 rounded-sm border border-rule bg-paper p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Walkie-talkie · Web Speech API fallback · wave-42 Lane A.F.1
      </p>
      <button
        type="button"
        onClick={playFallback}
        className="self-start rounded-sm border border-racing-green bg-paper px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-racing-green transition-colors hover:bg-racing-green hover:text-paper"
      >
        Play coaching report
      </button>
      <p className="font-mono text-[10px] text-muted">
        Browser-native speechSynthesis with pitch 0.85 + rate 1.05 approximates
        the walkie-talkie profile. Server-side Watson TTS path activates when
        the cached audio file is available at the per-audit-id endpoint.
      </p>
    </div>
  );
}
