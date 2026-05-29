"use client";

/**
 * NotebookLMHoverAudio: lazy-load NotebookLM-generated audio commentary
 * on /judges panels. Wave-46 D-058 Phase 7.6 close-out.
 *
 * Stephen-action: NotebookLM API only accepts empty requests (no per-
 * panel control) per wave-46 tier-1 research finding. Path: pre-generate
 * 6 audio assets offline via NotebookLM web UI (one per /judges panel:
 * architecture figure + galaxy moves cluster + COA gate + byte-equality
 * demo + LIPS harness link + judge-tour CTA), download MP3, drop in
 * `app/frontend/public/audio/`. Component lazy-loads on user interaction
 * + falls back to placeholder text when 404 (asset not yet generated).
 *
 * As of D-062 (2026-05-26): only the COA-gate panel is mounted on /judges
 * with the production-shipped `coa-gate.mp3` asset. The other 5 panels
 * remain scaffold-only pending future NotebookLM-asset generation. Adding
 * mounts before the matching MP3 ships would render the `missing`
 * placeholder visible + clutter /judges; mount each panel one commit at a
 * time after its corresponding MP3 lands in `public/audio/<panelId>.mp3`.
 *
 * Discriminated-union state per `feedback_discriminated_unions_over_contradiction.md`:
 *   - idle: button surfaced; audio src not set; no network call
 *   - loading: src set; audio element fetching; loading state visible
 *   - playing: audio loaded; user clicked play; native controls visible
 *   - missing: 404 / load failure; placeholder text + asset-pending callout
 *
 * Implementation guarantees no preemptive audio fetch (preload="none"
 * + src set only on click). Honors prefers-reduced-motion via the no-
 * autoplay default. ARIA: button has aria-label citing panel topic +
 * audio element has aria-label citing same topic.
 */

import { useRef, useState } from "react";

interface NotebookLMHoverAudioProps {
  readonly panelId: string;
  readonly panelLabel: string;
}

type AudioState =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "playing" }
  | { readonly status: "missing" };

export default function NotebookLMHoverAudio({ panelId, panelLabel }: NotebookLMHoverAudioProps) {
  const [state, setState] = useState<AudioState>({ status: "idle" });
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioSrc = `/audio/${panelId}.mp3`;

  const handleActivate = () => {
    if (state.status !== "idle") return;
    setState({ status: "loading" });
    const audio = audioRef.current;
    if (audio === null) return;
    audio.src = audioSrc;
    audio
      .play()
      .then(() => {
        setState({ status: "playing" });
      })
      .catch(() => {
        setState({ status: "missing" });
      });
  };

  const handleReset = () => {
    setState({ status: "idle" });
    const audio = audioRef.current;
    if (audio !== null) {
      audio.pause();
      audio.removeAttribute("src");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {state.status === "idle" && (
        <button
          type="button"
          onClick={handleActivate}
          aria-label={`Play NotebookLM audio commentary for ${panelLabel}`}
          className="self-start inline-flex items-center gap-2 rounded-sm border border-racing-green bg-paper px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-racing-green transition-colors hover:bg-racing-green hover:text-paper"
        >
          <span aria-hidden="true">🎧</span>
          <span>Listen · NotebookLM commentary</span>
        </button>
      )}
      {state.status === "loading" && (
        <p
          className="font-mono text-[10px] uppercase tracking-wider text-amber-ink"
          aria-live="polite"
        >
          Loading audio...
        </p>
      )}
      {state.status === "playing" && (
        <div className="flex flex-col gap-1">
          <p className="font-mono text-[10px] uppercase tracking-wider text-racing-green">
            NotebookLM commentary · {panelLabel}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="self-start rounded-sm border border-racing-green bg-paper px-3 py-0.5 font-mono text-[10px] uppercase tracking-wider text-racing-green transition-colors hover:bg-racing-green hover:text-paper"
          >
            Stop
          </button>
        </div>
      )}
      {state.status === "missing" && (
        <p
          role="status"
          className="rounded-sm border border-rule bg-paper-warm p-2 font-mono text-[10px] uppercase tracking-wider text-muted"
        >
          Audio asset pending NotebookLM generation. The frontend scaffold is wired;
          asset at <code>public/audio/{panelId}.mp3</code> ships when Stephen completes
          the NotebookLM web-UI export.
        </p>
      )}
      <audio
        ref={audioRef}
        preload="none"
        controls={state.status === "playing"}
        aria-label={`NotebookLM audio commentary: ${panelLabel}`}
        onEnded={handleReset}
        className={state.status === "playing" ? "w-full" : "sr-only"}
      />
    </div>
  );
}
