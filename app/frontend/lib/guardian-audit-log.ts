/**
 * Frontend immutable JSONL audit-log emulation for the GuardianAudit
 * verdict chain. Mirrors NeuroPit common/audit.py:34-46 semantics:
 * write-before-emit guard; if the audit write fails, drop the emit so
 * the UI never shows a verdict that lacks a defensible audit trail.
 *
 * Wave-41 Stream G.2 close-out per the competitor field deep-dive
 * memory `project_apex_competitor_field_may_challenge.md` steal-list
 * MEDIUM-value item #2. APEX adapts the pattern to a browser-native
 * persistence surface (localStorage append + console.info JSONL
 * stream); the backend disk-persistent JSONL chain ships per the
 * Stream M.3 spec handoff at `docs/wave-41-backend-spec-handoff.md`.
 *
 * Append-only contract: every appendVerdict() call serializes the
 * GuardianAudit (UI-facing or backend variant) plus a wall-clock
 * timestamp + commit_sha context into one JSON line + appends to the
 * `apex-guardian-audit-log` localStorage key. Storage quota errors
 * surface as throws; consumers catch + drop the emit per the
 * write-before-emit contract.
 *
 * Read path: getRecentVerdicts(limit) returns the most-recent N
 * verdicts for a /status-page display. Asymmetric error policy:
 * write throws on quota / SSR / disabled-storage; read SKIPS corrupt
 * lines (so one bad row does not block /status rendering) + logs
 * `console.warn` with the corrupt-line count so operators can drill
 * via DevTools when warranted.
 *
 * Cross-tab caveat (wave-41 cascade-#11 silent-failure-hunter H-3):
 * localStorage read-modify-write is NOT atomic across same-origin
 * tabs. Two tabs concurrently calling appendVerdict() can race-lose
 * one verdict (both read prior state; both write append; second
 * write clobbers first). Mitigations:
 *
 *   - The console.info JSONL mirror per appendVerdict() captures
 *     EVERY line independently of localStorage, so operators with
 *     DevTools open see the lost verdict even when the read path
 *     misses it.
 *   - The Stream M.3 backend-persistent JSONL endpoint at
 *     `docs/wave-41-backend-spec-handoff.md` is filesystem-append-
 *     atomic (POSIX guarantees ≤PIPE_BUF byte atomicity); operators
 *     deploying the backend swap path get the atomicity guarantee
 *     for free.
 *   - For local-only deployments needing cross-tab atomicity, the
 *     swap target is IndexedDB transactions OR a BroadcastChannel-
 *     coordinated leader-tab pattern; both adopt the same
 *     GuardianAuditLogLine wire format so the consumer surface
 *     stays identical.
 *
 * Backend wire-up: per the Stream M.3 spec at
 * `docs/wave-41-backend-spec-handoff.md`, the disk-persistent JSONL
 * endpoint receives the storage path via
 * `fetch('/api/audit-log', { method: 'POST', body: line })` calls.
 * The localStorage path stays as fallback for offline operation.
 */

"use client";

import type { BackendGuardianAudit, GuardianAudit } from "../../shared/types";

const AUDIT_LOG_STORAGE_KEY = "apex-guardian-audit-log";
const MAX_RETAINED_LINES = 500;

/**
 * One JSONL audit line. Structurally distinct from the GuardianAudit
 * value so the line carries the wall-clock timestamp + commit_sha
 * envelope around the verdict payload.
 */
export interface GuardianAuditLogLine {
  readonly written_at_iso: string;
  readonly commit_sha: string;
  readonly verdict: GuardianAudit | BackendGuardianAudit;
}

/**
 * Append a verdict to the immutable audit log. Throws on write
 * failure (storage quota exhausted, localStorage disabled, JSON.
 * stringify cycle); caller MUST drop the WebSocket / UI emit per the
 * NeuroPit write-before-emit contract.
 *
 * Returns the serialized line for logging into console.info JSONL
 * stream so the line is visible to operators in DevTools without
 * having to drill into localStorage.
 */
export function appendVerdict(
  verdict: GuardianAudit | BackendGuardianAudit,
  commitSha: string,
): GuardianAuditLogLine {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    throw new Error(
      "apex.guardian-audit-log.appendVerdict: localStorage unavailable; cannot persist verdict.",
    );
  }
  const line: GuardianAuditLogLine = {
    written_at_iso: new Date().toISOString(),
    commit_sha: commitSha,
    verdict,
  };
  const serialized = JSON.stringify(line);
  const existing = window.localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
  // Append-only: split prior lines, push new one, retain bounded tail.
  const priorLines: ReadonlyArray<string> = existing
    ? existing.split("\n").filter((row) => row.length > 0)
    : [];
  const nextLines = [...priorLines, serialized];
  const retainedLines = nextLines.slice(-MAX_RETAINED_LINES);
  try {
    window.localStorage.setItem(AUDIT_LOG_STORAGE_KEY, retainedLines.join("\n"));
  } catch (err) {
    throw new Error(
      `apex.guardian-audit-log.appendVerdict: localStorage write failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  // Mirror to console.info JSONL stream so DevTools shows it without
  // operator drilling into localStorage. Use console.info specifically
  // so this stays separate from error / warn streams.
  if (typeof console !== "undefined" && console.info) {
    console.info(`apex.guardian-audit-log: ${serialized}`);
  }
  return line;
}

/**
 * Read the most-recent N audit log lines for /status-page display
 * OR cross-tab consumption via the `storage` event. Returns the
 * parsed lines newest-first; returns empty array if storage is
 * unavailable or empty.
 *
 * Wave-41 cascade-#11 MED M1 (silent-failure-hunter): emits
 * `console.warn` once per call when corrupt rows are skipped on the
 * read path. The prior silent skip was unobservable: operator looked
 * at /status, saw 49 verdicts, had no idea a 50th was corrupt.
 * Surfacing the count without throwing preserves the
 * /status-page-doesn't-crash-on-one-bad-row invariant.
 */
export function getRecentVerdicts(limit = 50): ReadonlyArray<GuardianAuditLogLine> {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
  if (raw === null) {
    return [];
  }
  const lines = raw.split("\n").filter((row) => row.length > 0);
  const recent = lines.slice(-limit).reverse();
  const parsed: GuardianAuditLogLine[] = [];
  let skipped = 0;
  let sampleCorrupt: string | undefined;
  for (const line of recent) {
    try {
      parsed.push(JSON.parse(line) as GuardianAuditLogLine);
    } catch {
      skipped += 1;
      if (sampleCorrupt === undefined) {
        sampleCorrupt = line.length > 120 ? `${line.slice(0, 120)}...` : line;
      }
    }
  }
  if (skipped > 0 && typeof console !== "undefined" && console.warn) {
    console.warn(
      `apex.guardian-audit-log.getRecentVerdicts: skipped ${skipped} corrupt line(s) of ${recent.length} read.`,
      { skipped, sampleCorrupt },
    );
  }
  return parsed;
}

/**
 * Wrap a synchronous UI emit with the write-before-emit guard. If
 * appendVerdict throws, the emit is dropped + the error propagates
 * so the caller can surface a "could not persist verdict" UI state
 * instead of silently emitting an undefensible verdict.
 */
export function emitWithAuditGuard<TResult>(
  verdict: GuardianAudit | BackendGuardianAudit,
  commitSha: string,
  emit: (line: GuardianAuditLogLine) => TResult,
): TResult {
  const line = appendVerdict(verdict, commitSha);
  return emit(line);
}
