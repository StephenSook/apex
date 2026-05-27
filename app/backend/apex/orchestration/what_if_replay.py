"""POST /api/what-if-replay deterministic re-projection (Phase 4 task 4.M3b).

Spec at docs/wave-41-backend-spec-handoff.md L91-150.

Determinism contract:
  - Same (baseline_fixture_id, mutation_key) MUST produce byte-identical
    replayed_violation_log per violations.py to_text() output.
  - Backend MUST use the same V2 cvxpylayers projector instance + the
    same friction-ellipse coefficients as /api/forecast.

The mutation catalogue is the minimum frontend the wave-41 spec
references; new mutations land here as new keys + a `.apply()` function.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Final

import numpy as np

from apex.physics.projection import CvxpyLayersProjector
from apex.shared.contracts import (
    CHANNEL_COUNT,
    HORIZON,
    PhysicsViolationLog,
    PROTOCOL_VERSION,
    SCHEMA_VERSION,
    channel_index,
)


class UnknownFixtureError(ValueError):
    """400 surface: baseline_fixture_id not in BASELINE_FIXTURES."""


class UnknownMutationError(ValueError):
    """400 surface: mutation_key not in MUTATIONS."""


def _build_jerk_bound_fixture() -> np.ndarray:
    """Minimal fixture producing a friction-ellipse violation under V2.

    Mirrors the C14-04 jerk-bound fixture the frontend stub references.
    The actual jerk-bound check is Tier-8 kinematic; for V2 projector
    re-projection we surface the friction-ellipse hit as the visible
    log line.
    """
    f = np.zeros((HORIZON, CHANNEL_COUNT), dtype=np.float32)
    f[10, channel_index("long_g")] = 1.5
    f[10, channel_index("speed_mps")] = 40.0
    f[10, channel_index("coa_overlap_flag")] = 1.0
    return f


BASELINE_FIXTURES: Final[dict[str, dict[str, Any]]] = {
    "C14-04-jerk-bound": {
        "id": "C14-04-jerk-bound",
        "label": "Convergence-14 jerk-bound fixture (C14-04)",
        "build_forecast": _build_jerk_bound_fixture,
    },
}


def _mutation_coa_overlap_invert(forecast: np.ndarray) -> np.ndarray:
    """Invert the COA simultaneity channel from 1.0 -> 0.0 (or vice versa).

    Produces a counterfactual "what if the COA did not permit overlap"
    scenario; the validator will then flag any brake+throttle overlap
    that survives the re-projection.
    """
    mutated = forecast.copy()
    idx = channel_index("coa_overlap_flag")
    mutated[:, idx] = 1.0 - mutated[:, idx]
    return mutated


MUTATIONS: Final[dict[str, Callable[[np.ndarray], np.ndarray]]] = {
    "MUTATION_COA_OVERLAP_INVERT": _mutation_coa_overlap_invert,
}


@dataclass(frozen=True)
class ReplayResult:
    mutated_fixture: dict[str, Any]
    replayed_violation_log: PhysicsViolationLog
    schema_version: str
    protocol_version: str


# Module-level projector. Single instance per process so the
# cvxpylayers DPP-compiled problem is reused across calls (matches the
# /api/forecast determinism contract per spec L130-138).
_projector_singleton: CvxpyLayersProjector | None = None


def _get_projector() -> CvxpyLayersProjector:
    global _projector_singleton
    if _projector_singleton is None:
        _projector_singleton = CvxpyLayersProjector()
    return _projector_singleton


def run_what_if_replay(
    *,
    baseline_fixture_id: str,
    mutation_key: str,
) -> ReplayResult:
    """Run the V2 projector over the mutated fixture; return the
    re-projected violation log.

    Determinism: caller may call this function any number of times
    with the same arguments and receive byte-identical
    `replayed_violation_log.to_text()` output. The cvxpylayers solve
    is itself deterministic given the same DPP-compiled problem +
    same input tensor; the singleton + fixed-fixture path guarantees
    those invariants.
    """
    if baseline_fixture_id not in BASELINE_FIXTURES:
        raise UnknownFixtureError(
            f"baseline_fixture_id {baseline_fixture_id!r} not in "
            f"BASELINE_FIXTURES; known keys: {sorted(BASELINE_FIXTURES.keys())}"
        )
    if mutation_key not in MUTATIONS:
        raise UnknownMutationError(
            f"mutation_key {mutation_key!r} not in MUTATIONS; known keys: "
            f"{sorted(MUTATIONS.keys())}"
        )

    import torch

    fixture = BASELINE_FIXTURES[baseline_fixture_id]
    baseline = fixture["build_forecast"]()
    mutated = MUTATIONS[mutation_key](baseline)
    tensor = torch.from_numpy(mutated).unsqueeze(0).float()
    result = _get_projector().project(tensor)
    return ReplayResult(
        mutated_fixture={
            "id": baseline_fixture_id,
            "mutation": mutation_key,
            "shape": list(mutated.shape),
        },
        replayed_violation_log=result.violation_log,
        schema_version=SCHEMA_VERSION,
        protocol_version=PROTOCOL_VERSION,
    )


__all__ = [
    "BASELINE_FIXTURES",
    "MUTATIONS",
    "ReplayResult",
    "UnknownFixtureError",
    "UnknownMutationError",
    "run_what_if_replay",
]
