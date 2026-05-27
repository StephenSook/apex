"""GET /api/session-context race-event tiles tests (Phase 4 task 4.M3c).

Spec at docs/wave-41-backend-spec-handoff.md L152-192.

Cache contract:
  - 30s per-track cache for slow-changing fields (track-temp + weather
    + tire-state)
  - Session-phase tile invalidates per-lap on lap-completion event
"""

from __future__ import annotations

import time

import pytest

from apex.orchestration.session_context import (
    SessionContextProvider,
    TileSeverity,
    build_mock_tiles,
)


def test_mock_tiles_returns_canonical_shape():
    tiles = build_mock_tiles()
    assert len(tiles) >= 4
    for tile in tiles:
        assert tile.key
        assert tile.label
        assert tile.value
        assert tile.detail
        assert tile.severity in ("ok", "monitor", "critical")


def test_session_context_provider_returns_iso_timestamp():
    provider = SessionContextProvider()
    out = provider.fetch()
    assert out.fetched_at_iso
    assert "T" in out.fetched_at_iso


def test_session_context_provider_caches_within_window():
    provider = SessionContextProvider(cache_ttl_seconds=10)
    first = provider.fetch()
    second = provider.fetch()
    # Within the cache window, same timestamp + same tiles.
    assert first.fetched_at_iso == second.fetched_at_iso


def test_session_context_provider_invalidates_after_ttl():
    provider = SessionContextProvider(cache_ttl_seconds=0)
    first = provider.fetch()
    time.sleep(0.01)
    second = provider.fetch()
    # Different fetched_at_iso when ttl forces a refresh.
    assert first.fetched_at_iso != second.fetched_at_iso


def test_session_phase_tile_invalidates_on_lap_completion():
    provider = SessionContextProvider(cache_ttl_seconds=60)
    first = provider.fetch()
    provider.notify_lap_completion()
    second = provider.fetch()
    # After lap-completion, the session-phase tile must refresh.
    assert first.fetched_at_iso != second.fetched_at_iso


def test_severity_literal_union_covers_three_values():
    valid: set[TileSeverity] = {"ok", "monitor", "critical"}
    for tile in build_mock_tiles():
        assert tile.severity in valid
