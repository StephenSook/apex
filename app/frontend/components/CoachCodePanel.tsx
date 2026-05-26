"use client";

/**
 * CoachCodePanel: interactive form on /coach-code that POSTs the user's
 * code + question to /api/coach-code + renders Granite 4.1 8B Instruct
 * feedback inline. Wave-46 D-058 Phase 6.2.B close-out.
 *
 * Discriminated-union state per
 * `feedback_discriminated_unions_over_contradiction.md`:
 *   - idle: form ready for first submit
 *   - submitting: POST in flight
 *   - ready: response received + parsed
 *   - error: validation 4xx or network failure (role=alert)
 *
 * NO code execution. Form posts code + question to server; server returns
 * text feedback only. HARD-COMPLIANCE scrubber applied server-side per
 * `feedback_llm_output_compliance_scrubber.md`.
 */

import { useState } from "react";

import type { CoachCodeResponse } from "../../shared/types";

type PanelState =
  | { readonly status: "idle" }
  | { readonly status: "submitting" }
  | { readonly status: "ready"; readonly payload: CoachCodeResponse }
  | { readonly status: "error"; readonly message: string };

const SUGGESTED_CODE = `// Aggregate 50 Hz telemetry to 1 Hz mini-sector tensor for TTM input.
function aggregateToMiniSectors(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const bucket = Math.floor(row.timestamp_ms / 1000);
    if (!grouped.has(bucket)) grouped.set(bucket, []);
    grouped.get(bucket).push(row);
  }
  return Array.from(grouped.entries()).map(([t, rows]) => ({
    t,
    throttle_pct: average(rows, "throttle_pct"),
    brake_pa: average(rows, "brake_pa"),
    speed_mps: average(rows, "speed_mps"),
  }));
}`;

const SUGGESTED_QUESTION =
  "Is this aggregation efficient for the (B, 30, 14) TTM input contract? What channels am I missing?";

export default function CoachCodePanel() {
  const [code, setCode] = useState(SUGGESTED_CODE);
  const [question, setQuestion] = useState(SUGGESTED_QUESTION);
  const [state, setState] = useState<PanelState>({ status: "idle" });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.trim().length === 0 || question.trim().length === 0) return;
    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/coach-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, question }),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        throw new Error(errBody.message ?? `HTTP ${res.status}`);
      }
      const payload = (await res.json()) as CoachCodeResponse;
      setState({ status: "ready", payload });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleReset = () => {
    setState({ status: "idle" });
  };

  const isSubmitting = state.status === "submitting";

  return (
    <section
      aria-labelledby="coach-code-panel-title"
      className="flex flex-col gap-4 rounded-sm border-2 border-rule bg-paper p-5"
    >
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p className="apex-eyebrow">Code feedback (Granite 4.1 8B Instruct via OpenRouter)</p>
          <h2
            id="coach-code-panel-title"
            className="font-display text-2xl tracking-tight text-ink"
          >
            Paste, ask, review.
          </h2>
        </div>
        {state.status === "ready" && (
          <span
            className={`rounded-sm border px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${
              state.payload.engine === "coach-code-real"
                ? "border-racing-green bg-racing-green text-paper"
                : "border-rule bg-paper text-muted"
            }`}
          >
            engine: {state.payload.engine}
          </span>
        )}
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
            Code (max 32 KB)
          </span>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={12}
            disabled={isSubmitting}
            spellCheck={false}
            className="w-full rounded-sm border border-rule bg-paper-warm p-3 font-mono text-xs leading-relaxed text-ink focus:border-racing-green focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
            Question
          </span>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-sm border border-rule bg-paper-warm p-2 text-sm text-ink focus:border-racing-green focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting || code.trim().length === 0 || question.trim().length === 0}
          className="self-start rounded-sm border border-racing-green bg-racing-green px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-paper transition-colors hover:bg-racing-green-deep disabled:opacity-50"
        >
          {isSubmitting ? "Coaching..." : "Get feedback"}
        </button>
      </form>

      {state.status === "ready" && (
        <article className="flex flex-col gap-2 rounded-sm border-l-2 border-racing-green bg-paper-warm p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
            {state.payload.model} · {state.payload.compute_ms} ms · {state.payload.completion_tokens} completion tokens
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
            {state.payload.feedback}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="self-start rounded-sm border border-racing-green bg-paper px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-racing-green transition-colors hover:bg-racing-green hover:text-paper"
          >
            Ask another question
          </button>
        </article>
      )}

      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-sm border-2 border-accent bg-paper p-3 font-mono text-xs leading-relaxed text-accent"
        >
          Coach-code error: {state.message}. Try again or check the OpenRouter API status.
        </p>
      )}

      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Cross-ref: <span className="text-ink-soft">D-058 wave-46 Phase 6.2 + `feedback_llm_output_compliance_scrubber.md` HARD-COMPLIANCE scrubber + Granite 4.1 8B Instruct supersedes deprecated Granite Code 8B</span>
      </p>
    </section>
  );
}
