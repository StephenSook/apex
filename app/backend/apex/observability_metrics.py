"""In-process live request metrics for the APEX observability cockpit.

wave-53 production-observability surface. The /judges page renders a LIVE
telemetry panel fed by `GET /api/observability/summary`. This module holds
the in-process aggregator that the request middleware writes to and the
summary route reads from. Pure stdlib, thread-safe, zero new dependencies.

Honesty contract (see project memory feedback_conceptual_stack_vs_shipped_
stack): every number here is REAL traffic this process has served since
boot. A cold start (zero requests) is reported truthfully, never faked. The
same spans are exported to Honeycomb over OTLP by `apex/observability.py`;
this aggregator is the in-product mirror so judges can see live metrics
without a Honeycomb login, and each recent request carries its real
Honeycomb `trace_id` for a deep-link into the actual trace waterfall.
"""

from __future__ import annotations

import threading
import time
from collections import deque
from typing import Any

_MAX_RECENT = 200          # ring buffer used for latency percentiles
_MAX_RECENT_TRACES = 12    # recent requests surfaced to the panel (deep-linked)
_STATUS_CLASSES = ("2xx", "3xx", "4xx", "5xx")


def _percentile(sorted_values: list[float], pct: float) -> float:
    """Nearest-rank percentile over an already-sorted list (honest, simple)."""
    if not sorted_values:
        return 0.0
    idx = int(round((pct / 100.0) * (len(sorted_values) - 1)))
    idx = max(0, min(len(sorted_values) - 1, idx))
    return round(sorted_values[idx], 2)


class LiveMetrics:
    """Thread-safe in-process request aggregator."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._reset_locked()

    def _reset_locked(self) -> None:
        self._start = time.time()
        self._total = 0
        self._status_class: dict[str, int] = {c: 0 for c in _STATUS_CLASSES}
        self._by_route: dict[str, dict[str, float]] = {}
        self._recent: deque = deque(maxlen=_MAX_RECENT)

    def reset(self) -> None:
        with self._lock:
            self._reset_locked()

    def record(
        self,
        *,
        route: str,
        method: str,
        status: int,
        duration_ms: float,
        trace_id: str | None = None,
    ) -> None:
        cls = f"{int(status) // 100}xx"
        entry = {
            "ts": time.time(),
            "route": route,
            "method": method,
            "status": int(status),
            "duration_ms": round(float(duration_ms), 2),
            "trace_id": trace_id,
        }
        with self._lock:
            self._total += 1
            self._status_class[cls] = self._status_class.get(cls, 0) + 1
            bucket = self._by_route.setdefault(route, {"count": 0.0, "sum_ms": 0.0})
            bucket["count"] += 1.0
            bucket["sum_ms"] += float(duration_ms)
            self._recent.append(entry)

    def snapshot(self) -> dict[str, Any]:
        now = time.time()
        with self._lock:
            recent = list(self._recent)
            total = self._total
            status_class = dict(self._status_class)
            by_route = {
                route: {
                    "count": int(v["count"]),
                    "avg_ms": round(v["sum_ms"] / v["count"], 2) if v["count"] else 0.0,
                }
                for route, v in self._by_route.items()
            }
            uptime_s = now - self._start
        durations = sorted(e["duration_ms"] for e in recent)
        requests_last_60s = sum(1 for e in recent if now - e["ts"] <= 60.0)
        recent_traces = [
            {
                "trace_id": e["trace_id"],
                "route": e["route"],
                "method": e["method"],
                "status": e["status"],
                "duration_ms": e["duration_ms"],
                "ts": e["ts"],
            }
            for e in reversed(recent)
            if e["trace_id"]
        ][:_MAX_RECENT_TRACES]
        return {
            "total_requests": total,
            "status_class": status_class,
            "by_route": by_route,
            "latency_ms": {
                "p50": _percentile(durations, 50),
                "p95": _percentile(durations, 95),
                "p99": _percentile(durations, 99),
                "window": len(durations),
            },
            "uptime_s": round(uptime_s, 1),
            "eps_1m": round(requests_last_60s / 60.0, 3),
            "recent_traces": recent_traces,
        }


_LIVE = LiveMetrics()


def record_request(
    *,
    route: str,
    method: str,
    status: int,
    duration_ms: float,
    trace_id: str | None = None,
) -> None:
    """Record one served request into the process-global live aggregator."""
    _LIVE.record(
        route=route,
        method=method,
        status=status,
        duration_ms=duration_ms,
        trace_id=trace_id,
    )


def snapshot() -> dict[str, Any]:
    """Return the current live-metrics snapshot (real traffic since boot)."""
    return _LIVE.snapshot()


def reset_metrics() -> None:
    """Reset the process-global aggregator (used by tests)."""
    _LIVE.reset()


__all__ = ["LiveMetrics", "record_request", "snapshot", "reset_metrics"]
