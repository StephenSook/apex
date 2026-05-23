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
 * stream) because the backend disk-persistent JSONL chain lands
 * Vinh-side in a future wave (Stream M.3 spec handoff).
 *
 * Append-only contract: every appendVerdict() call serializes the
 * GuardianAudit (UI-facing or backend variant) plus a wall-clock
 * timestamp + commit_sha context into one JSON line + appends to the
 * `apex-guardian-audit-log` localStorage key. Storage quota errors
 * surface as throws; consumers catch + drop the emit per the
 * write-before-emit contract.
 *
 * Read path: getRecentVerdicts(limit) returns the most-recent N
 * verdicts for a /status-page display. Cross-tab consumers receive
 * the same data via the `storage` event since localStorage is shared
 * across same-origin tabs.
 *
 * Backend wire-up: when Vinh ships the disk-persistent JSONL
 * endpoint (Stream M.3 spec at `docs/wave-41-backend-spec-handoff.md`
 * landing later), this module's storage path gets swapped to a
 * `fetch('/api/audit-log', { method: 'POST', body: line })` call.
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
  for (const line of recent) {
    try {
      parsed.push(JSON.parse(line) as GuardianAuditLogLine);
    } catch {
      // Skip corrupt lines; do not throw on read path (would block
      // /status-page rendering for a single bad row).
    }
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
