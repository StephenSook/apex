import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  appendVerdict,
  emitWithAuditGuard,
  getRecentVerdicts,
  type GuardianAuditLogLine,
} from "../../lib/guardian-audit-log";
import type { BackendGuardianAudit } from "../../../shared/types";

const AUDIT_LOG_STORAGE_KEY = "apex-guardian-audit-log";

const sampleVerdict: BackendGuardianAudit = {
  verdict: "SAFE",
  triggered_rules: [],
  audit_id: "abcdef01234567890123456789abcdef" as unknown as BackendGuardianAudit["audit_id"],
  reasoning: "no violations in forecast window",
  physics_confidence: null,
  audited_at_iso: "2026-05-24T20:00:00Z",
};

describe("guardian-audit-log", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("appendVerdict persists the line + returns it", () => {
    const line = appendVerdict(sampleVerdict, "abc1234");
    expect(line.commit_sha).toBe("abc1234");
    expect(line.verdict).toEqual(sampleVerdict);
    expect(line.written_at_iso).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    const stored = window.localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(stored!.length).toBeGreaterThan(0);
  });

  it("appendVerdict appends instead of overwriting; getRecentVerdicts returns newest-first", () => {
    appendVerdict(sampleVerdict, "commit-1");
    appendVerdict(sampleVerdict, "commit-2");
    appendVerdict(sampleVerdict, "commit-3");
    const recent = getRecentVerdicts();
    expect(recent).toHaveLength(3);
    expect(recent[0].commit_sha).toBe("commit-3");
    expect(recent[1].commit_sha).toBe("commit-2");
    expect(recent[2].commit_sha).toBe("commit-1");
  });

  it("getRecentVerdicts returns empty array when no log exists", () => {
    expect(getRecentVerdicts()).toEqual([]);
  });

  it("getRecentVerdicts skips corrupt lines + warns once", () => {
    // Seed localStorage with mixed valid + corrupt rows.
    const validLine: GuardianAuditLogLine = {
      written_at_iso: "2026-05-24T20:00:00Z",
      commit_sha: "valid-1",
      verdict: sampleVerdict,
    };
    const corrupted = "not-valid-json{";
    window.localStorage.setItem(
      AUDIT_LOG_STORAGE_KEY,
      `${JSON.stringify(validLine)}\n${corrupted}`,
    );
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const recent = getRecentVerdicts();
    expect(recent).toHaveLength(1);
    expect(recent[0].commit_sha).toBe("valid-1");
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("getRecentVerdicts honors the limit parameter", () => {
    for (let i = 0; i < 10; i++) {
      appendVerdict(sampleVerdict, `commit-${i}`);
    }
    const recent = getRecentVerdicts(5);
    expect(recent).toHaveLength(5);
    // Newest-first: commit-9, commit-8, ... commit-5
    expect(recent[0].commit_sha).toBe("commit-9");
    expect(recent[4].commit_sha).toBe("commit-5");
  });

  it("emitWithAuditGuard appends then calls emit with the line", () => {
    const emitMock = vi.fn().mockReturnValue("emitted");
    const result = emitWithAuditGuard(sampleVerdict, "guarded-commit", emitMock);
    expect(result).toBe("emitted");
    expect(emitMock).toHaveBeenCalledTimes(1);
    const calledWith = emitMock.mock.calls[0][0] as GuardianAuditLogLine;
    expect(calledWith.commit_sha).toBe("guarded-commit");
  });

  it("emitWithAuditGuard does NOT call emit when appendVerdict throws (storage quota)", () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
    const emitMock = vi.fn();
    expect(() => emitWithAuditGuard(sampleVerdict, "quota-commit", emitMock)).toThrow(
      /localStorage write failed/i,
    );
    expect(emitMock).not.toHaveBeenCalled();
    setItemSpy.mockRestore();
  });
});
