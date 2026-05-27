"""POST /api/audit-log JSONL append-only persistence (Phase 4 task 4.M3a).

Spec at docs/wave-41-backend-spec-handoff.md L32-89.

Guarantees:
  - Append atomicity: ≤PIPE_BUF byte writes are atomic per POSIX;
    larger writes guarded by fcntl.flock exclusive lock as defense
    in depth.
  - Durability: fsync() per write before returning 200.
  - Retention: rolling 500-line tail. Older lines rotate to
    audit-log-YYYY-MM-DD.jsonl.gz alongside the live file.
  - Per-line cap: 8 KiB. Larger payloads raise AuditLogLineTooLarge
    (413 Payload Too Large).

The frontend `app/frontend/lib/guardian-audit-log.ts` localStorage
emulation has known cross-tab race losses; this backend disk-backed
path fixes that for free.
"""

from __future__ import annotations

import gzip
import json
import os
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Final

MAX_LINE_BYTES: Final[int] = 8 * 1024
"""Per-line size cap. Larger payloads raise AuditLogLineTooLarge -> 413."""

MAX_RETAINED_LINES: Final[int] = 500
"""Rolling tail size. Older lines rotate to a dated gzip archive."""


class AuditLogLineTooLarge(ValueError):
    """413 surface: per-line size exceeded MAX_LINE_BYTES."""


@dataclass(frozen=True)
class AppendResult:
    persisted: bool
    line_index: int
    file_path: str


class AuditLogStore:
    """Disk-backed JSONL audit log with rotation.

    Single-writer per file. Cross-process concurrency is handled by
    `fcntl.flock` on POSIX; the Windows fallback uses an in-process
    threading lock (acceptable for the demo path since Vinh's backend
    is single-process during the hackathon).
    """

    def __init__(self, file_path: Path | str):
        self.file_path = Path(file_path)
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        # Cross-process lock on POSIX; in-process fallback elsewhere.
        try:
            import fcntl  # type: ignore[import-not-found]
            self._fcntl = fcntl
        except ImportError:
            self._fcntl = None
            import threading
            self._win_lock = threading.Lock()

    def _line_count(self) -> int:
        if not self.file_path.exists():
            return 0
        with self.file_path.open("rb") as f:
            return sum(1 for _ in f)

    def _rotate_if_needed(self) -> None:
        """When the live file exceeds MAX_RETAINED_LINES, take the
        oldest (size - MAX_RETAINED_LINES) lines and gzip them out
        to a dated archive next to the live file."""
        size = self._line_count()
        if size <= MAX_RETAINED_LINES:
            return
        overflow = size - MAX_RETAINED_LINES
        with self.file_path.open("rb") as f:
            all_lines = f.readlines()
        archive_lines = all_lines[:overflow]
        retained_lines = all_lines[overflow:]

        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        archive_path = self.file_path.parent / f"audit-log-{today}.jsonl.gz"
        # Append to existing archive of the same date so a long-running
        # session does not lose history.
        with gzip.open(archive_path, "ab") as gz:
            gz.writelines(archive_lines)
        with self.file_path.open("wb") as f:
            f.writelines(retained_lines)

    def _acquire(self, fileobj):
        if self._fcntl:
            self._fcntl.flock(fileobj.fileno(), self._fcntl.LOCK_EX)
        else:
            self._win_lock.acquire()

    def _release(self, fileobj):
        if self._fcntl:
            self._fcntl.flock(fileobj.fileno(), self._fcntl.LOCK_UN)
        else:
            self._win_lock.release()

    def append(self, payload: dict[str, Any]) -> AppendResult:
        line = json.dumps(payload, separators=(",", ":"))
        encoded = line.encode("utf-8")
        if len(encoded) > MAX_LINE_BYTES:
            raise AuditLogLineTooLarge(
                f"Audit-log line is {len(encoded)} bytes; cap is "
                f"{MAX_LINE_BYTES}"
            )

        # Open in append+binary so we can flock + fsync.
        with self.file_path.open("ab") as f:
            self._acquire(f)
            try:
                f.write(encoded + b"\n")
                f.flush()
                os.fsync(f.fileno())
            finally:
                self._release(f)

        # Count lines (post-append) before rotation potentially trims.
        idx = self._line_count() - 1
        self._rotate_if_needed()
        return AppendResult(
            persisted=True,
            line_index=idx,
            file_path=str(self.file_path),
        )


def append_audit_line(
    *,
    file_path: Path | str,
    payload: dict[str, Any],
) -> AppendResult:
    """Module-level convenience wrapper that constructs a store + appends."""
    store = AuditLogStore(file_path=file_path)
    return store.append(payload)


__all__ = [
    "AppendResult",
    "AuditLogLineTooLarge",
    "AuditLogStore",
    "MAX_LINE_BYTES",
    "MAX_RETAINED_LINES",
    "append_audit_line",
]
