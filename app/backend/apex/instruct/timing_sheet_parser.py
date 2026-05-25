"""Timing-sheet parser (SRO / BritCar PDFs -> structured lap CSV/JSON).

Phase 1 task 1.2. Backend swap-point named by Stephen's wave-44 commit
`2557d5f` header `X-Apex-Parser-Swap-Point: vinh-v1-granite-vision-4.1-4b`
at `app/frontend/app/api/timing-sheet-parse/route.ts`. The JSON shape this
module emits MUST stay byte-compatible with the frontend's
`TimingSheetParsedLaps` interface (same field names, same types, same order
of `laps` rows) so the rendering path in `GraniteVisionParser.tsx` works
identically against either the canned-fixture mock or this V1 backend.

Granite Vision 4.1 4B local inference is the V1 production path; this
module currently ships the canned-fixture path (same five-lap stub as the
frontend route) so the Phase 1 + Phase 2 contract tests run today. The
real `_parse_with_granite_vision` swap is gated behind Phase 2 once the
RTX 4060 + cvxpylayers stack is settled (so we are not debugging two
heavy CUDA loads in parallel).
"""

from __future__ import annotations

import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Literal


@dataclass(frozen=True)
class TimingSheetLap:
    lap: int
    sector_1_time_s: float
    sector_2_time_s: float
    sector_3_time_s: float
    lap_time_s: float

    def to_json(self) -> dict[str, float | int]:
        return asdict(self)


@dataclass(frozen=True)
class TimingSheetParsedLaps:
    source_filename: str
    parser: Literal["granite-vision-4.1-4b", "canned-fixture"]
    parse_ms: int
    laps: tuple[TimingSheetLap, ...]

    def to_json(self) -> dict[str, object]:
        return {
            "source_filename": self.source_filename,
            "parser": self.parser,
            "parse_ms": self.parse_ms,
            "laps": [lap.to_json() for lap in self.laps],
        }


CANNED_LAPS: tuple[TimingSheetLap, ...] = (
    TimingSheetLap(1, 24.182, 28.945, 25.612, 78.739),
    TimingSheetLap(2, 23.871, 28.412, 25.198, 77.481),
    TimingSheetLap(3, 23.659, 28.103, 24.951, 76.713),
    TimingSheetLap(4, 23.582, 27.916, 24.832, 76.330),
    TimingSheetLap(5, 23.504, 27.847, 24.798, 76.149),
)


class TimingSheetParseError(ValueError):
    """Raised when the timing-sheet PDF cannot be parsed by any backend."""


def parse_timing_sheet(
    path: str | Path,
    *,
    backend: Literal["granite-vision-4.1-4b", "canned-fixture"] = "canned-fixture",
) -> TimingSheetParsedLaps:
    """Parse a timing-sheet PDF into structured laps.

    `backend="canned-fixture"` returns the five-lap stub mirroring the
    frontend mock; use this in tests + Phase 1 demos until Granite Vision
    inference is wired Phase 2.

    `backend="granite-vision-4.1-4b"` is the V1 production path; not
    implemented yet (raises NotImplementedError). Swap-point is
    `_parse_with_granite_vision` below.
    """
    pdf_path = Path(path)
    if not pdf_path.exists():
        raise TimingSheetParseError(f"Timing-sheet PDF not found: {pdf_path}")
    if pdf_path.stat().st_size == 0:
        raise TimingSheetParseError(f"Timing-sheet PDF is empty: {pdf_path}")

    t0 = time.perf_counter()
    if backend == "canned-fixture":
        laps = CANNED_LAPS
    elif backend == "granite-vision-4.1-4b":
        laps = _parse_with_granite_vision(pdf_path)
    else:
        raise TimingSheetParseError(f"Unknown timing-sheet backend: {backend!r}")
    parse_ms = int((time.perf_counter() - t0) * 1000)

    return TimingSheetParsedLaps(
        source_filename=pdf_path.name,
        parser=backend,
        parse_ms=parse_ms,
        laps=laps,
    )


def _parse_with_granite_vision(pdf_path: Path) -> tuple[TimingSheetLap, ...]:
    """Granite Vision 4.1 4B inference swap-point.

    Implementation deferred to Phase 2 per docs/vinh-backend-plan.md task
    1.2 commentary. The frontend already accepts either output shape via
    the `parser` field; flipping this in once Granite Vision is loaded on
    the RTX 4060 does NOT require a frontend change.
    """
    raise NotImplementedError(
        "Granite Vision 4.1 4B backend not yet wired; pass "
        "backend='canned-fixture' for Phase 1 contract tests."
    )
