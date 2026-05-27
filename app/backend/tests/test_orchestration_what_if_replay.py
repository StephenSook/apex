"""POST /api/what-if-replay deterministic re-projection tests
(Phase 4 task 4.M3b).

Spec at docs/wave-41-backend-spec-handoff.md L91-150.

Determinism contract:
  - Same (baseline_fixture_id, mutation_key) MUST produce byte-
    identical replayed_violation_log per violations.py to_text()
    output across calls.
  - Backend MUST use the same V2 cvxpylayers projector instance as
    /api/forecast (replay is counterfactual over SAME engine).
"""

from __future__ import annotations

import pytest

torch = pytest.importorskip("torch")
pytest.importorskip("cvxpylayers")

from apex.orchestration.what_if_replay import (
    BASELINE_FIXTURES,
    MUTATIONS,
    UnknownFixtureError,
    UnknownMutationError,
    run_what_if_replay,
)


def test_known_fixture_and_mutation_succeeds():
    result = run_what_if_replay(
        baseline_fixture_id="C14-04-jerk-bound",
        mutation_key="MUTATION_COA_OVERLAP_INVERT",
    )
    assert result.mutated_fixture is not None
    assert result.replayed_violation_log.engine == "v2_cvxpylayers"
    assert result.schema_version
    assert result.protocol_version


def test_determinism_byte_identical_across_two_runs():
    """Same fixture + mutation -> byte-identical violation_log text."""
    a = run_what_if_replay(
        baseline_fixture_id="C14-04-jerk-bound",
        mutation_key="MUTATION_COA_OVERLAP_INVERT",
    )
    b = run_what_if_replay(
        baseline_fixture_id="C14-04-jerk-bound",
        mutation_key="MUTATION_COA_OVERLAP_INVERT",
    )
    assert a.replayed_violation_log.to_text() == b.replayed_violation_log.to_text()


def test_unknown_fixture_raises():
    with pytest.raises(UnknownFixtureError):
        run_what_if_replay(
            baseline_fixture_id="nonsense-fixture",
            mutation_key="MUTATION_COA_OVERLAP_INVERT",
        )


def test_unknown_mutation_raises():
    with pytest.raises(UnknownMutationError):
        run_what_if_replay(
            baseline_fixture_id="C14-04-jerk-bound",
            mutation_key="UNKNOWN_MUTATION",
        )


def test_baseline_fixtures_catalogued():
    assert len(BASELINE_FIXTURES) >= 1
    for fid, fx in BASELINE_FIXTURES.items():
        assert fx["id"] == fid


def test_mutations_catalogued():
    assert "MUTATION_COA_OVERLAP_INVERT" in MUTATIONS
