"""COA + timing-sheet onboarding cache tests (Phase 4 task 4.4).

Software Lead fix #8: cache invalidation key = SHA256(file bytes).
Re-upload of the same driver's COA with different bytes invalidates
the derived simultaneity flag.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from apex.intake.cache import (
    CacheMiss,
    OnboardingCache,
    compute_sha256,
)


@pytest.fixture
def cache(tmp_path: Path) -> OnboardingCache:
    return OnboardingCache(cache_dir=tmp_path / "intake-cache")


def test_compute_sha256_deterministic(tmp_path):
    p = tmp_path / "x.bin"
    p.write_bytes(b"hello")
    a = compute_sha256(p)
    b = compute_sha256(p)
    assert a == b
    assert len(a) == 64   # SHA256 hex


def test_compute_sha256_differs_on_different_bytes(tmp_path):
    p1 = tmp_path / "a.bin"
    p1.write_bytes(b"hello")
    p2 = tmp_path / "b.bin"
    p2.write_bytes(b"goodbye")
    assert compute_sha256(p1) != compute_sha256(p2)


def test_cache_miss_raises_on_unknown_key(cache):
    with pytest.raises(CacheMiss):
        cache.get("unknown-sha256")


def test_cache_put_and_get_roundtrip(cache):
    payload = {"driver_id": "sarah", "simultaneity_permitted": True}
    cache.put("sha256-abc", payload)
    out = cache.get("sha256-abc")
    assert out == payload


def test_cache_invalidates_on_different_bytes(cache, tmp_path):
    original = tmp_path / "coa.json"
    original.write_bytes(b'{"version": 1}')
    sha1 = compute_sha256(original)
    cache.put(sha1, {"version": 1})

    # Different bytes -> different sha -> cache miss for the new sha.
    original.write_bytes(b'{"version": 2}')
    sha2 = compute_sha256(original)
    assert sha1 != sha2
    with pytest.raises(CacheMiss):
        cache.get(sha2)


def test_cache_get_or_compute_helper(cache):
    """Convenience: get_or_compute(sha, factory) returns cached value
    if present; otherwise computes via factory + caches."""
    counter = {"n": 0}

    def factory():
        counter["n"] += 1
        return {"computed": True, "n": counter["n"]}

    first = cache.get_or_compute("sha-1", factory)
    second = cache.get_or_compute("sha-1", factory)
    assert first == second
    assert counter["n"] == 1   # factory called once only


def test_cache_persists_across_instances(tmp_path):
    """Disk-backed cache; a fresh OnboardingCache pointed at the same
    cache_dir sees prior puts."""
    cache_a = OnboardingCache(cache_dir=tmp_path / "intake")
    cache_a.put("sha-x", {"hello": "world"})
    cache_b = OnboardingCache(cache_dir=tmp_path / "intake")
    out = cache_b.get("sha-x")
    assert out == {"hello": "world"}
