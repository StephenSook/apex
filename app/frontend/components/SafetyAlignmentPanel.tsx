/**
 * SafetyAlignmentPanel: surfaces APEX's coaching-surface alignment with
 * ISO 26262 functional-safety vocabulary set used by adaptive-control
 * engineering teams in motorsport. Wave-47 ship per
 * `project_apex_team_brit_al_locke_email_2026_05_27.md` per-content-use
 * consent + the paper §3.8 Safety-alignment-with-adaptive-control-
 * engineering-practice section.
 *
 * Anonymized framing per Mod-tool attribution principle: cites
 * "adaptive-control engineering teams in motorsport" rather than naming
 * any operator. Surfaces 7 specific checks the standard's vocabulary
 * names + maps each to the APEX invariant that addresses it by
 * construction. Mounts on /judges + /methodology so judges reading the
 * coach surface see WHY the HARD-COMPLIANCE invariants exist.
 *
 * Editorial-paddock palette preserved. Server Component (no client-side
 * interaction; static prose + tiles).
 */

const SAFETY_CHECKS: ReadonlyArray<{
  readonly check: string;
  readonly apex_invariant: string;
}> = [
  {
    check: "CAN signal plausibility check",
    apex_invariant:
      "Telemetry intake validates every channel against the canonical 14-channel shape contract in shared/contracts/shapes.py before any forecast call.",
  },
  {
    check: "Sensor disagreement handling",
    apex_invariant:
      "V1 NumPy validator + V2 cvxpylayers projector each detect physically inconsistent input combinations (friction-ellipse + jerk-bound + tier-1 simultaneity-gate) and reject before narration.",
  },
  {
    check: "Fault-detection and latch-reset",
    apex_invariant:
      "Self-Correcting Retry Loop on the narrator path detects forbidden regulatory-anchor patterns + emits a system-level retry directive enumerating the violations; bounded 2-retry budget.",
  },
  {
    check: "Watchdog and timeout implementations",
    apex_invariant:
      "AbortSignal.timeout(3000) on every Vinh-backend wire-flip + AbortController on OpenRouter completion + 12-second timeout in the VS Code extension webview; consumer disconnection aborts the request.",
  },
  {
    check: "Deterministic behavior under communication faults",
    apex_invariant:
      "Every wire-flip helper returns the canned-fallback payload on any upstream 5xx or fetch failure; the engine field declares which path served + the X-Apex-*-Engine header surfaces it to runtime logs.",
  },
  {
    check: "State-machine review for unintended transitions",
    apex_invariant:
      "Discriminated-union state machines on the client (CoachVoicePlayback, CoachCodePanel, AICopilotChat, TelemetryUploadPanel) make impossible states a TypeScript compile error; no defensive runtime branch needed.",
  },
  {
    check: "Failure Mode and Effects Analysis (FMEA) on driver-input paths",
    apex_invariant:
      "Convergence 14 fixture suite covers the 14 failure modes the V1 + V2 + Guardian stack must reject; each fixture asserts the violation string + the Guardian verdict so the cause/effect map is testable, not asserted.",
  },
];

export default function SafetyAlignmentPanel() {
  return (
    <section
      id="safety-alignment"
      aria-labelledby="safety-alignment-title"
      className="border-b border-rule bg-paper"
    >
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
        <p className="apex-eyebrow">Safety alignment</p>
        <h2
          id="safety-alignment-title"
          className="font-display text-3xl tracking-tight text-ink"
        >
          ISO 26262 vocabulary set, line by line.
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft">
          Adaptive-control engineering teams in motorsport cite ISO 26262 in engineering
          correspondence as the framework they apply when reviewing brake-by-wire interfaces,
          CAN gateway controllers, and adaptive throttle / brake / clutch logic. APEX maps
          its coaching-surface invariants against the standard&rsquo;s vocabulary set so the
          things a functional-safety reviewer flags are the same things APEX&rsquo;s Guardian
          + scrubber + bounded retry-loop + AbortSignal threading address by construction. We
          do not certify APEX against ISO 26262; we claim that the vocabulary set of the
          standard is the right anchor for the coaching-surface invariants we already enforce.
          Detailed treatment in paper section 3.8.
        </p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          {SAFETY_CHECKS.map((entry) => (
            <div
              key={entry.check}
              className="flex flex-col gap-2 rounded-sm border border-rule bg-paper-warm p-5"
            >
              <dt className="font-mono text-xs uppercase tracking-wider text-racing-green">
                {entry.check}
              </dt>
              <dd className="text-sm leading-relaxed text-ink-soft">
                {entry.apex_invariant}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 font-mono text-xs italic text-muted">
          Vocabulary set sourced from adaptive-racing-team engineering correspondence; mapping
          to APEX invariants is the contribution.
        </p>
      </div>
    </section>
  );
}
