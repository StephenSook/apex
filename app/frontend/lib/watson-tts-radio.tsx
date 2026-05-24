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
  | { readonly status: "synthesizing" }
  | { readonly status: "ready_watson"; readonly url: string }
  | { readonly status: "ready_fallback" }
  | { readonly status: "error"; readonly message: string };

export interface WatsonTtsRadioProps {
  readonly auditId: AuditId;
  readonly text: string;
  readonly synthesizeEndpoint?: string;
}

const DEFAULT_SYNTHESIZE_ENDPOINT = "/api/watson-tts";

export default function WatsonTtsRadio({
  auditId,
  text,
  synthesizeEndpoint = DEFAULT_SYNTHESIZE_ENDPOINT,
}: WatsonTtsRadioProps) {
  const [state, setState] = useState<AudioPlayerState>({ status: "idle" });

  // Wave-43 cascade-#15 F2-round-2 + galaxy-ambition rework: drop
  // HEAD-probe cache lookup pattern (Vercel readonly FS made the cache
  // path inoperable; per D-043 path-forward shipped). New shape:
  // single POST to /api/watson-tts on mount; server returns inline
  // audio/mpeg blob; client creates URL.createObjectURL + plays.
  // Per-request synthesis (no cross-request cache) but the Watson +
  // FFmpeg pipeline runs ~1-3s on Vercel iad1 with warm function
  // instance, well within the perception budget for a cool-down lap
  // walkie-talkie. AbortController wired to fetch so unmount-mid-
  // synthesis aborts the server work.
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    let blobUrlToRevoke: string | null = null;

    queueMicrotask(() => {
      if (cancelled) return;
      setState({ status: "synthesizing" });
    });

    void (async () => {
      try {
        const synthResponse = await fetch(synthesizeEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audit_id: auditId, text }),
          signal: controller.signal,
        });
        if (cancelled) return;
        if (!synthResponse.ok) {
          const errorBody = await synthResponse.text().catch(() => "<no body>");
          console.warn(
            "apex.watson-tts: synthesis POST returned non-ok; falling back to Web Speech API.",
            {
              status: synthResponse.status,
              statusText: synthResponse.statusText,
              body: errorBody.slice(0, 500),
              endpoint: synthesizeEndpoint,
            },
          );
          setState({ status: "ready_fallback" });
          return;
        }
        const contentType = synthResponse.headers.get("Content-Type") ?? "";
        if (!contentType.includes("audio/")) {
          console.warn(
            "apex.watson-tts: synthesis POST returned non-audio Content-Type; falling back to Web Speech API.",
            { contentType, endpoint: synthesizeEndpoint },
          );
          setState({ status: "ready_fallback" });
          return;
        }
        const blob = await synthResponse.blob();
        if (cancelled) return;
        blobUrlToRevoke = URL.createObjectURL(blob);
        setState({ status: "ready_watson", url: blobUrlToRevoke });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        const message = err instanceof Error ? err.message : String(err);
        console.warn(
          "apex.watson-tts: synthesis POST threw; falling back to Web Speech API.",
          { message, endpoint: synthesizeEndpoint },
        );
        setState({ status: "ready_fallback" });
      }
    })();

    return () => {
      cancelled = true;
      controller.abort("watson-tts-radio-cleanup");
      if (blobUrlToRevoke !== null) {
        URL.revokeObjectURL(blobUrlToRevoke);
      }
    };
  }, [auditId, text, synthesizeEndpoint]);

  const playFallback = useCallback(() => {
    if (typeof window === "undefined" || typeof window.speechSynthesis === "undefined") {
      setState({
        status: "error",
        message: "Web Speech API not available in this browser. Update to a recent Chrome / Safari / Firefox for the walkie-talkie audio fallback.",
      });
      return;
    }
    // Wave-43 D2.9 close-out per cold-review-2 silent-failure M-R2-2:
    // cancel any in-flight utterance BEFORE speak() so rapid-click does
    // not queue 5 utterances + interfere with one another. Single
    // utterance plays at a time.
    window.speechSynthesis.cancel();
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

  // Wave-43 D2.9 close-out: cleanup on unmount so navigation mid-speech
  // does not let the utterance continue playing on the next page.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (state.status === "idle" || state.status === "checking") {
    return (
      <div className="flex flex-col gap-2 rounded-sm border border-rule bg-paper p-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
          Walkie-talkie · preparing audio
        </p>
      </div>
    );
  }

  if (state.status === "synthesizing") {
    return (
      <div className="flex flex-col gap-2 rounded-sm border border-rule bg-paper p-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
          Walkie-talkie · synthesizing via Watson TTS + FFmpeg
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

  if (state.status === "ready_fallback") {
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

  // Wave-43 D2.10 close-out per cold-review-2 type-design M1 +
  // silent-failure: exhaustive `_exhaustive: never` default. Adding a
  // 6th variant to AudioPlayerState (e.g. "playing", "paused") now
  // forces a TS compile error here instead of silently falling through
  // to whichever was the last `if` block. Mirrors GraniteCitationFooter
  // + RaceEventsTilesRow exhaustive-switch helper pattern.
  const _exhaustive: never = state;
  throw new Error(`apex.watson-tts-radio: unknown AudioPlayerState ${String(_exhaustive)}.`);
}
