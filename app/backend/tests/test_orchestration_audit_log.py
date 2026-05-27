"""POST /api/audit-log JSONL persistence tests (Phase 4 task 4.M3a).

Spec at docs/wave-41-backend-spec-handoff.md L32-89.

Persistence contract:
  - JSONL append-only with POSIX flock atomicity
  - fsync() per write
  - Rolling 500-line tail; older lines rotate to
    audit-log-YYYY-MM-DD.jsonl.gz
  - 8 KiB per-line cap (413 on overflow)
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from apex.orchestration.audit_log import (
    AuditLogLineTooLarge,
    AuditLogStore,
    MAX_LINE_BYTES,
    MAX_RETAINED_LINES,
    append_audit_line,
)


@pytest.fixture
def store(tmp_path: Path) -> AuditLogStore:
    return AuditLogStore(file_path=tmp_path / "audit-log.jsonl")


@pytest.fixture
def sample_verdict() -> dict:
    return {
        "written_at_iso": "2026-05-27T06:00:00+00:00",
        "commit_sha": "abc1234",
        "verdict": {
            "verdict": "approve",
            "reasoning_trace": ["clean run"],
            "audit_id": "deadbeef",
        },
    }


def test_first_line_index_is_zero(store, sample_verdict):
    result = store.append(sample_verdict)
    assert result.persisted is True
    assert result.line_index == 0
    assert result.file_path == str(store.file_path)


def test_appended_line_is_jsonl_parseable(store, sample_verdict):
    store.append(sample_verdict)
    text = store.file_path.read_text(encoding="utf-8")
    lines = text.strip().split("\n")
    assert len(lines) == 1
    parsed = json.loads(lines[0])
    assert parsed["commit_sha"] == "abc1234"


def test_line_index_increments(store, sample_verdict):
    a = store.append(sample_verdict)
    b = store.append(sample_verdict)
    c = store.append(sample_verdict)
    assert (a.line_index, b.line_index, c.line_index) == (0, 1, 2)


def test_oversize_line_raises_413(store):
    huge = {
        "written_at_iso": "2026-05-27T06:00:00+00:00",
        "commit_sha": "abc1234",
        "verdict": {"reasoning_trace": ["x" * (MAX_LINE_BYTES + 100)]},
    }
    with pytest.raises(AuditLogLineTooLarge):
        store.append(huge)


def test_retention_caps_at_500_lines(store, sample_verdict):
    # Append MAX_RETAINED_LINES + 50; older 50 should be rotated out.
    for _ in range(MAX_RETAINED_LINES + 50):
        store.append(sample_verdict)
    text = store.file_path.read_text(encoding="utf-8")
    line_count = len([line for line in text.split("\n") if line.strip()])
    assert line_count == MAX_RETAINED_LINES


def test_rotation_writes_gzipped_archive(store, sample_verdict):
    """When rotation fires, older lines land in an
    audit-log-YYYY-MM-DD.jsonl.gz archive in the same dir."""
    for _ in range(MAX_RETAINED_LINES + 10):
        store.append(sample_verdict)
    parent = store.file_path.parent
    archives = list(parent.glob("audit-log-*.jsonl.gz"))
    assert len(archives) >= 1


def test_append_audit_line_module_level_helper(tmp_path: Path, sample_verdict):
    """Module-level convenience function so callers do not have to
    instantiate the store explicitly."""
    result = append_audit_line(
        file_path=tmp_path / "audit-log.jsonl",
        payload=sample_verdict,
    )
    assert result.persisted is True
    assert result.line_index == 0
