"use client";

/**
 * AICopilotChat: interactive single-turn QA surface against the
 * Granite 4.1 8B Instruct narrator via the OpenRouter streaming
 * endpoint. Lives inside the 5-tab AnalyzeFlow Chat tab (wave-42
 * Lane A.G.4). Consumes the useOpenRouterStream hook (wave-42 Lane
 * F.D) for the actual streaming response.
 *
 * Wave-42 Lane A.F.4 close-out per the competitor field deep-dive
 * memory `project_apex_competitor_field_may_challenge.md` steal-list
 * HIGH-value item #3 (RaceMind AI chat surface pattern). APEX adapts
 * to a single-turn QA surface scoped to the current coaching
 * session, with 5 suggested-question buttons drawn from the
 * recurring race-engineer question taxonomy.
 *
 * Discriminated-union local state per
 * `feedback_discriminated_unions_over_contradiction.md`:
 *   - idle: no question submitted yet
 *   - asking: question is in flight via useOpenRouterStream
 *   - answered: response is ready; rendered as the active QA pair
 * Exhaustive-switch helpers with `_exhaustive: never` throw defaults
 * surface any future state literal as a TypeScript compile error.
 *
 * The streaming-state machine lives inside useOpenRouterStream + is
 * surfaced via the partial / full / error shape. This component
 * composes the two: local UI state (what the user did) + hook state
 * (what the network did). Together they render the full chat surface.
 *
 * Editorial-paddock palette: --color-racing-green for the LIVE pulse
 * + --color-amber for the streaming-partial border + --color-accent
 * for error states + --font-display for prompts + --font-mono for
 * suggested-question button labels.
 */

import { useState } from "react";

import { useOpenRouterStream } from "../lib/openrouter-stream";

// Wave-43 D2.5 close-out per cold-review-2 silent-failure H-R2-5 +
// type-design H2 + code-reviewer H-3 cross-corroboration. Collapsed
// to 2-variant union (idle | asking); "answered" is derived from the
// useOpenRouterStream hook state (streamState.status === "ready" |
// "error") at render time. Prior 3-variant shape declared "answered"
// but never constructed via setLocalState; renderedLocalStatus drift
// pattern was a latent bug.
type ChatLocalState =
  | { readonly status: "idle" }
  | { readonly status: "asking"; readonly question: string };

const SUGGESTED_QUESTIONS: ReadonlyArray<string> = [
  "Why did you recommend the early-throttle line at Old Hairpin?",
  "What if I had braked 5 metres later into Coppice?",
  "Show me the friction-ellipse projection for sector 2.",
  "Walk me through the COA simultaneity gate for my hand controls.",
  "Compare my lap delta to the reference line at the trickiest sector.",
];

export interface AICopilotChatProps {
  readonly panelId?: string;
}

export default function AICopilotChat({ panelId = "ai-copilot-chat" }: AICopilotChatProps) {
  const [localState, setLocalState] = useState<ChatLocalState>({ status: "idle" });
  const [inputValue, setInputValue] = useState("");

  // useOpenRouterStream keyed on the active question. When localState
  // moves out of asking/answered the prompt resets to null so the hook
  // returns to idle + cancels any in-flight stream per cascade-#11
  // per-effect-cancelled closure pattern.
  const activeQuestion =
    localState.status === "idle" ? null : localState.question;
  const streamState = useOpenRouterStream(activeQuestion);

  const handleAsk = (question: string) => {
    const trimmed = question.trim();
    if (trimmed.length === 0) return;
    setLocalState({ status: "asking", question: trimmed });
    setInputValue("");
  };

  const handleReset = () => {
    setLocalState({ status: "idle" });
    setInputValue("");
  };

  const handleInputSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleAsk(inputValue);
  };

  const isAsking = localState.status === "asking";
  const isStreaming = isAsking && streamState.status === "streaming";
  // Wave-43 D2.5: "answered" UI state derived directly from streamState
  // (no shadow local-state variant required). isAsking + streamState
  // ready/error narrows the QA-pair render branch below.
  const isAnswered = isAsking && (streamState.status === "ready" || streamState.status === "error");

  return (
    <section
      aria-labelledby={`${panelId}-title`}
      className="flex flex-col gap-4"
    >
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p className="apex-eyebrow">AI Copilot · wave-42 Lane A.F.4</p>
          <h3
            id={`${panelId}-title`}
            className="font-display text-2xl tracking-tight text-ink"
          >
            Ask the race engineer.
          </h3>
        </div>
        {isStreaming && (
          <span
            className="flex items-center gap-2 rounded-sm border border-racing-green bg-paper px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-racing-green"
            aria-live="polite"
          >
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-racing-green" />
            Live
          </span>
        )}
      </header>

      {localState.status === "idle" && (
        <div className="flex flex-col gap-3 rounded-sm border border-rule bg-paper-warm p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
            Suggested questions
          </p>
          <ul className="flex flex-col gap-2">
            {SUGGESTED_QUESTIONS.map((question) => (
              <li key={question}>
                <button
                  type="button"
                  onClick={() => handleAsk(question)}
                  className="w-full rounded-sm border border-rule bg-paper px-3 py-2 text-left text-sm leading-snug text-ink transition-colors hover:border-racing-green hover:text-racing-green"
                >
                  {question}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(isAsking || isAnswered) && localState.status === "asking" && (
          <article className="flex flex-col gap-3 rounded-sm border border-rule bg-paper-warm p-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                You asked
              </p>
              <p className="font-display text-base leading-snug text-ink">
                {localState.question}
              </p>
            </div>
            <div className="flex flex-col gap-2 border-t border-rule pt-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                APEX copilot
              </p>
              {streamState.status === "streaming" && (
                <p className="rounded-sm border-l-2 border-amber bg-paper px-3 py-2 text-sm leading-relaxed text-ink-soft">
                  {streamState.partial.length > 0
                    ? streamState.partial
                    : "Streaming response from Granite 4.1 8B Instruct..."}
                </p>
              )}
              {streamState.status === "ready" && (
                <p className="rounded-sm border-l-2 border-racing-green bg-paper px-3 py-2 text-sm leading-relaxed text-ink">
                  {streamState.full}
                </p>
              )}
              {streamState.status === "error" && (
                <p
                  role="alert"
                  className="rounded-sm border-l-2 border-accent bg-paper px-3 py-2 text-sm leading-relaxed text-accent"
                >
                  {streamState.message}
                </p>
              )}
              {streamState.status === "idle" && (
                <p className="rounded-sm border-l-2 border-rule bg-paper px-3 py-2 text-sm leading-relaxed text-muted">
                  Waiting for the stream to begin...
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="self-start rounded-sm border border-racing-green bg-paper px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-racing-green transition-colors hover:bg-racing-green hover:text-paper"
            >
              Ask another question
            </button>
          </article>
        )}

      <form onSubmit={handleInputSubmit} className="flex flex-col gap-2">
        <label
          htmlFor={`${panelId}-input`}
          className="font-mono text-[11px] uppercase tracking-wider text-muted"
        >
          Type a follow-up
        </label>
        <div className="flex gap-2">
          <input
            id={`${panelId}-input`}
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="What if I had carried more apex speed at..."
            className="flex-1 rounded-sm border border-rule bg-paper px-3 py-2 text-sm text-ink focus:border-racing-green focus:outline-none"
            disabled={isAsking && streamState.status === "streaming"}
          />
          <button
            type="submit"
            disabled={inputValue.trim().length === 0 || (isAsking && streamState.status === "streaming")}
            className="rounded-sm border border-racing-green bg-racing-green px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-paper transition-colors hover:bg-racing-green-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ask
          </button>
        </div>
      </form>

      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Cross-ref:{" "}
        <span className="text-ink-soft">
          steal-list HIGH item #3 (RaceMind AI chat surface pattern); backend
          wires per Stream M.3 spec /api/openrouter-stream
        </span>
      </p>
    </section>
  );
}
