"use client";

/**
 * EngineAgnosticByteEqualityDemo: wave-45 Phase 10 Block G /judges
 * surface. Side-by-side V1 NumPy + V2 cvxpylayers `.to_text()` output
 * with the ENGINE header line highlighted as the ONLY allowed
 * difference per D-050 byte-equality lock.
 *
 * Cross-ref: paper §3.2 + §4.5 + Q&A killshot #3 + Vinh pytest
 * assertion at app/backend/tests/test_physics_v2.py.
 *
 * Verdict states (3): byte-identical (green; both engines emitted
 * identical output character-for-character), engine-line-diff-only
 * (amber; the load-bearing D-050 lock), content-diff (clay; the
 * Guardian audit would read DIFFERENT violation strings; this is the
 * failure state that the production pytest assertion catches).
 */

import {
  V1_NUMPY_TO_TEXT,
  V2_CVXPYLAYERS_TO_TEXT,
  diffByteEquality,
} from "../lib/byte-equality-fixture";

function statusPill(status: "byte-identical" | "engine-line-diff-only" | "content-diff"): {
  label: string;
  border: string;
  text: string;
} {
  switch (status) {
    case "byte-identical":
      return {
        label: "BYTE-IDENTICAL",
        border: "border-racing-green",
        text: "text-racing-green",
      };
    case "engine-line-diff-only":
      return {
        label: "ENGINE-LINE-DIFF-ONLY (D-050 PASS)",
        border: "border-amber",
        text: "text-amber",
      };
    case "content-diff":
      return {
        label: "CONTENT-DIFF (D-050 FAIL)",
        border: "border-accent",
        text: "text-accent",
      };
    default: {
      const _exhaustive: never = status;
      throw new Error(`unknown diff status: ${String(_exhaustive)}`);
    }
  }
}

export default function EngineAgnosticByteEqualityDemo() {
  const diff = diffByteEquality(V1_NUMPY_TO_TEXT, V2_CVXPYLAYERS_TO_TEXT);
  const pill = statusPill(diff.status);

  return (
    <section
      aria-labelledby="byte-equality-demo-title"
      className="flex flex-col gap-4 rounded-sm border-2 border-rule bg-paper p-6"
    >
      <header>
        <p className="apex-eyebrow">D-050 · paper §3.2 · Q&amp;A killshot #3</p>
        <h3
          id="byte-equality-demo-title"
          className="font-display text-2xl tracking-tight text-ink"
        >
          Two engines, one violation string.
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
          The V1 NumPy validator + V2 cvxpylayers projector emit byte-identical
          {" "}<span className="font-mono">.to_text()</span> output on the same physical event,
          modulo the leading ENGINE header line. The Guardian BYOC audit reads identical violation
          strings regardless of which engine produced them. This is the load-bearing technical-positioning
          claim of the entire project; the pytest assertion at{" "}
          <span className="font-mono text-xs text-racing-green">
            app/backend/tests/test_physics_v2.py
          </span>{" "}
          locks it at HEAD.
        </p>
      </header>

      <div
        className={`flex flex-wrap items-baseline gap-3 rounded-sm border-2 bg-paper-warm p-3 ${pill.border}`}
      >
        <span
          className={`rounded-sm border px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${pill.border} ${pill.text}`}
        >
          {pill.label}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
          body bytes {diff.body_byte_count} · body lines {diff.body_lines}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="flex flex-col gap-2">
          <h4 className="font-display text-lg tracking-tight text-ink">V1 NumPy validator</h4>
          <pre className="overflow-x-auto rounded-sm border border-rule bg-paper-warm p-3 font-mono text-[10px] leading-relaxed text-ink">
            <code>
              <span className="bg-amber/30 text-ink">{diff.engine_line_v1}</span>
              {"\n"}
              {V1_NUMPY_TO_TEXT.split("\n").slice(1).join("\n")}
            </code>
          </pre>
        </article>
        <article className="flex flex-col gap-2">
          <h4 className="font-display text-lg tracking-tight text-ink">V2 cvxpylayers projector</h4>
          <pre className="overflow-x-auto rounded-sm border border-rule bg-paper-warm p-3 font-mono text-[10px] leading-relaxed text-ink">
            <code>
              <span className="bg-amber/30 text-ink">{diff.engine_line_v2}</span>
              {"\n"}
              {V2_CVXPYLAYERS_TO_TEXT.split("\n").slice(1).join("\n")}
            </code>
          </pre>
        </article>
      </div>

      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Stage A (8-tier Pacejka) + Stage B (3-iteration SCP) per D-031 staged ladder add precision but
        do not change the violation strings on the same physical event.
      </p>
    </section>
  );
}
