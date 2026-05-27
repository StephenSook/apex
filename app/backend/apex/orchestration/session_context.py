"""GET /api/session-context race-event tiles (Phase 4 task 4.M3c).

Spec at docs/wave-41-backend-spec-handoff.md L152-192. Mirrors the
frontend `RaceEventsTilesRow.tsx` 4-tile mock fixture.

Cache contract:
  - 30s per-track cache for slow-changing fields (track-temp, weather,
    tire-state)
  - Session-phase tile invalidates per-lap on lap-completion event
"""

from __future__ import annotations

import threading
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Final, Literal

_NOW_LOCK = threading.Lock()
_LAST_TS: list[datetime | None] = [None]

TileSeverity = Literal["ok", "monitor", "critical"]


@dataclass(frozen=True)
class RaceEventsTile:
    key: str
    label: str
    value: str
    detail: str
    severity: TileSeverity


@dataclass(frozen=True)
class SessionContextResponse:
    tiles: tuple[RaceEventsTile, ...]
    fetched_at_iso: str


_DEFAULT_TILES: Final[tuple[RaceEventsTile, ...]] = (
    RaceEventsTile(
        key="session_phase",
        label="Session phase",
        value="FP2 lap 14 of 22",
        detail="Free Practice 2 mid-stint; long-run pace evaluation window",
        severity="ok",
    ),
    RaceEventsTile(
        key="track_temp",
        label="Track temperature",
        value="34 deg C",
        detail="Stable at +1 deg from morning baseline; tire-thermal model in-band",
        severity="ok",
    ),
    RaceEventsTile(
        key="weather",
        label="Weather",
        value="Cloud cover 60%, dry",
        detail="No precipitation forecast for the next 90 minutes",
        severity="ok",
    ),
    RaceEventsTile(
        key="tire_state",
        label="Tire state",
        value="Medium compound, lap 9",
        detail="Wear within the linear-degradation regime; pit window opens lap 18",
        severity="monitor",
    ),
)


def build_mock_tiles() -> tuple[RaceEventsTile, ...]:
    return _DEFAULT_TILES


def _utc_now_iso() -> str:
    """Strictly-monotonic ISO 8601 UTC timestamp.

    Microsecond precision + a monotonic-bump tiebreaker so two
    back-to-back invalidations always produce distinct strings even
    when the system clock resolution is coarser than the call rate.
    Cache-coherence depends on this invariant per the wave-41 spec
    L174-176.
    """
    from datetime import timedelta
    with _NOW_LOCK:
        now = datetime.now(timezone.utc)
        prev = _LAST_TS[0]
        if prev is not None and now <= prev:
            now = prev + timedelta(microseconds=1)
        _LAST_TS[0] = now
    return now.isoformat()


class SessionContextProvider:
    """30-second TTL cache with explicit lap-completion invalidation.

    The 30s cache window matches the spec: track-temp + weather +
    tire-state shift on slower timescales than the cache. The
    session-phase tile invalidates on every lap-completion event via
    `notify_lap_completion()`.
    """

    def __init__(self, cache_ttl_seconds: float = 30.0):
        self._ttl = float(cache_ttl_seconds)
        self._last_fetched_at: float | None = None
        self._cache: SessionContextResponse | None = None

    def notify_lap_completion(self) -> None:
        """Invalidate the cache: the next .fetch() will rebuild."""
        self._last_fetched_at = None
        self._cache = None

    def fetch(self) -> SessionContextResponse:
        now = time.time()
        if (
            self._cache is not None
            and self._last_fetched_at is not None
            and now - self._last_fetched_at < self._ttl
        ):
            return self._cache
        resp = SessionContextResponse(
            tiles=build_mock_tiles(),
            fetched_at_iso=_utc_now_iso(),
        )
        self._cache = resp
        self._last_fetched_at = now
        return resp


__all__ = [
    "RaceEventsTile",
    "SessionContextProvider",
    "SessionContextResponse",
    "TileSeverity",
    "build_mock_tiles",
]
