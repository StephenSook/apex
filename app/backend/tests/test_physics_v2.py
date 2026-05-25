"""V2 cvxpylayers physics projector tests (Phase 2 Day 5 task 2.12).

Constant-mu V2 mirrors the D-027 Stage C spike (Phase 0 task 0.5;
logs/day-03-scp-go-no-go.md) inside a reusable class that satisfies
the DifferentiableProjector Protocol at shared.contracts.projector.

Three layers of assertion:
  1. CvxpyLayersProjector implements DifferentiableProjector.
  2. .project() returns a ProjectionResult whose corrected_tensor is
     inside the friction-ellipse feasible set + whose violation_log
     records every step that was projected (i.e. was OUTSIDE the
     ellipse before projection).
  3. Engine-agnostic boundary holds: V2 violation_log.to_text() is
     byte-identical to V1 NumPy validator.friction_ellipse_check()
     to_text() on identical input.

8-tier Pacejka + 3-iteration unroll are deferred to a separate test
file (test_physics_v2_pacejka.py) per the staged D-031 plan;
constant-mu V2 is the Day-5 ship-floor (plan task 2.13 fallback).
"""

from __future__ import annotations

import numpy as np
import pytest

torch = pytest.importorskip("torch")
pytest.importorskip("cvxpy")
pytest.importorskip("cvxpylayers")

from apex.physics.projection import CvxpyLayersProjector
from apex.physics.validator import friction_ellipse_check
from apex.shared.contracts import (
    CHANNEL_COUNT,
    DifferentiableProjector,
    HORIZON,
    PhysicsViolationLog,
    ProjectionResult,
    channel_index,
)

MU_DEMO = 1.2
G = 9.81


def _zero_forecast() -> torch.Tensor:
    return torch.zeros(1, HORIZON, CHANNEL_COUNT, dtype=torch.float32)


# ---- Protocol conformance ----------------------------------------------

def test_projector_satisfies_protocol():
    projector = CvxpyLayersProjector(mu=MU_DEMO)
    assert isinstance(projector, DifferentiableProjector)


def test_projector_reports_differentiable():
    projector = CvxpyLayersProjector(mu=MU_DEMO)
    assert projector.is_differentiable is True


# ---- Shape preservation ------------------------------------------------

def test_project_preserves_canonical_shape():
    projector = CvxpyLayersProjector(mu=MU_DEMO)
    forecast = _zero_forecast()
    result = projector.project(forecast)
    assert tuple(result.corrected_tensor.shape) == (1, HORIZON, CHANNEL_COUNT)


def test_project_returns_projection_result():
    projector = CvxpyLayersProjector(mu=MU_DEMO)
    result = projector.project(_zero_forecast())
    assert isinstance(result, ProjectionResult)
    assert isinstance(result.violation_log, PhysicsViolationLog)
    assert result.violation_log.engine == "v2_cvxpylayers"


# ---- Feasibility (FCVR=0 post-projection) ------------------------------

def test_feasible_input_passes_through_unchanged():
    # Zero-g cruise: every step already inside the friction ellipse.
    projector = CvxpyLayersProjector(mu=MU_DEMO)
    forecast = _zero_forecast()
    result = projector.project(forecast)
    out = result.corrected_tensor
    long_idx = channel_index("long_g")
    lat_idx = channel_index("lat_g")
    norms = torch.sqrt(out[..., long_idx] ** 2 + out[..., lat_idx] ** 2)
    assert (norms <= MU_DEMO + 1e-3).all()
    # No violations recorded because nothing needed projection.
    assert result.violation_log.is_empty()


def test_infeasible_step_gets_projected_to_boundary():
    # 1.5g longitudinal at step 5 sits outside the mu=1.2 ellipse.
    projector = CvxpyLayersProjector(mu=MU_DEMO)
    forecast = _zero_forecast()
    forecast[0, 5, channel_index("long_g")] = 1.5
    result = projector.project(forecast)
    out = result.corrected_tensor
    long_idx = channel_index("long_g")
    lat_idx = channel_index("lat_g")
    # Projection lands on the boundary: norm == mu within solver tolerance.
    step5_norm = torch.sqrt(
        out[0, 5, long_idx] ** 2 + out[0, 5, lat_idx] ** 2
    ).item()
    assert step5_norm == pytest.approx(MU_DEMO, abs=1e-2)


def test_infeasible_step_is_logged():
    projector = CvxpyLayersProjector(mu=MU_DEMO)
    forecast = _zero_forecast()
    forecast[0, 5, channel_index("long_g")] = 1.5
    result = projector.project(forecast)
    flagged_steps = {r.step for r in result.violation_log.records}
    assert 5 in flagged_steps
    # Same violation type V1 emits, so to_text() is comparable.
    flagged_types = {r.type for r in result.violation_log.records}
    assert flagged_types == {"friction_ellipse_exceeded"}


def test_multiple_violations_all_logged():
    projector = CvxpyLayersProjector(mu=MU_DEMO)
    forecast = _zero_forecast()
    forecast[0, 1, channel_index("long_g")] = 1.5
    forecast[0, 7, channel_index("lat_g")] = 1.4
    forecast[0, 12, channel_index("long_g")] = 1.0
    forecast[0, 12, channel_index("lat_g")] = 1.0  # sqrt(2) ~ 1.414 > 1.2
    result = projector.project(forecast)
    flagged_steps = {r.step for r in result.violation_log.records}
    assert {1, 7, 12} <= flagged_steps


# ---- Engine-agnostic boundary (Long-Term Architect load-bearing wall #2) ---

def test_v1_and_v2_emit_same_violation_types_on_friction_break():
    """V1 NumPy and V2 cvxpylayers must use the same violation type
    enum for the same physical event. Byte-identical to_text() is the
    deeper invariant; this test catches the shallower channel-name drift.
    """
    long_g = np.zeros(HORIZON, dtype=np.float64)
    lat_g = np.zeros(HORIZON, dtype=np.float64)
    long_g[3] = 1.5
    v1_log = friction_ellipse_check(long_g, lat_g, mu=MU_DEMO, g=G)

    projector = CvxpyLayersProjector(mu=MU_DEMO)
    forecast = _zero_forecast()
    forecast[0, 3, channel_index("long_g")] = 1.5
    v2_result = projector.project(forecast)

    v1_types = {r.type for r in v1_log.records}
    v2_types = {r.type for r in v2_result.violation_log.records}
    assert v1_types == v2_types == {"friction_ellipse_exceeded"}

    v1_steps = {r.step for r in v1_log.records}
    v2_steps = {r.step for r in v2_result.violation_log.records}
    assert v1_steps == v2_steps == {3}


def test_v2_log_text_starts_with_engine_v2():
    projector = CvxpyLayersProjector(mu=MU_DEMO)
    forecast = _zero_forecast()
    forecast[0, 3, channel_index("long_g")] = 1.5
    result = projector.project(forecast)
    text = result.violation_log.to_text()
    assert text.startswith("ENGINE v2_cvxpylayers\n")
    assert "STEPS 30\n" in text
    assert "step=03 type=friction_ellipse_exceeded tier=7" in text


def test_v1_v2_to_text_byte_equal_modulo_engine_line():
    """Long-Term Architect load-bearing wall #2: identical input must
    produce byte-identical to_text() output except for the leading
    ENGINE line. This is the property that lets D-A survive a V2 cut:
    paper §3.2 can cite the QP engine as canonical while the demo
    runs V1, because the violation text Guardian audits is the same.
    """
    long_g = np.zeros(HORIZON, dtype=np.float64)
    lat_g = np.zeros(HORIZON, dtype=np.float64)
    long_g[3] = 1.5
    v1_text = friction_ellipse_check(long_g, lat_g, mu=MU_DEMO, g=G).to_text()

    projector = CvxpyLayersProjector(mu=MU_DEMO)
    forecast = _zero_forecast()
    forecast[0, 3, channel_index("long_g")] = 1.5
    v2_text = projector.project(forecast).violation_log.to_text()

    v1_lines = v1_text.splitlines()
    v2_lines = v2_text.splitlines()
    assert len(v1_lines) == len(v2_lines)
    assert v1_lines[0] == "ENGINE v1_numpy"
    assert v2_lines[0] == "ENGINE v2_cvxpylayers"
    # Every remaining line must match byte-for-byte.
    assert v1_lines[1:] == v2_lines[1:]


# ---- Differentiability spot-check -------------------------------------

def test_gradient_flows_through_projector():
    """Smoke that the V2 projector is genuinely differentiable. Mirrors
    the D-027 Stage C ||grad|| < 1e4 invariant but on the production
    projector class, not the spike script.
    """
    projector = CvxpyLayersProjector(mu=MU_DEMO)
    forecast = _zero_forecast().detach().clone().requires_grad_(True)
    # Push step 0 outside the ellipse so the projection layer actually
    # has work to do (otherwise the QP solution equals the input and
    # gradient on the trivial-feasible path is identity).
    with torch.no_grad():
        forecast[0, 0, channel_index("long_g")] = 1.5
    result = projector.project(forecast)
    loss = (result.corrected_tensor ** 2).sum()
    loss.backward()
    grad_norm = torch.linalg.vector_norm(forecast.grad).item()
    assert np.isfinite(grad_norm)
    assert grad_norm < 1e4
