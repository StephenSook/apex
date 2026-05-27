"""Onboarding cache for COA + timing-sheet parses (Phase 4 task 4.4).

Software Lead fix #8: cache invalidation key = SHA256(file bytes).
Re-upload of the same driver's COA with different bytes produces a
different SHA, which misses the cache and forces re-parse.

Disk-backed JSON store; each cached entry lives in `{cache_dir}/{sha}.json`.
Cheap to wipe (rm -rf the directory); cheap to inspect (cat any sha file).
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Callable


class CacheMiss(KeyError):
    """Raised when the requested SHA is not present in the cache."""


def compute_sha256(path: Path) -> str:
    """Stream-compute SHA-256 hex digest of a file's bytes."""
    h = hashlib.sha256()
    with Path(path).open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


class OnboardingCache:
    """SHA256-keyed disk-backed cache.

    Persists across process restarts. Two instances pointing at the
    same cache_dir see each other's writes (test_cache_persists_across_instances).
    """

    def __init__(self, cache_dir: Path | str):
        self._dir = Path(cache_dir)
        self._dir.mkdir(parents=True, exist_ok=True)

    def _path(self, sha: str) -> Path:
        return self._dir / f"{sha}.json"

    def get(self, sha: str) -> Any:
        p = self._path(sha)
        if not p.exists():
            raise CacheMiss(sha)
        return json.loads(p.read_text(encoding="utf-8"))

    def put(self, sha: str, value: Any) -> None:
        self._path(sha).write_text(json.dumps(value), encoding="utf-8")

    def get_or_compute(self, sha: str, factory: Callable[[], Any]) -> Any:
        try:
            return self.get(sha)
        except CacheMiss:
            value = factory()
            self.put(sha, value)
            return value


__all__ = ["CacheMiss", "OnboardingCache", "compute_sha256"]
