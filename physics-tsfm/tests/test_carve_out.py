"""physics-tsfm carve-out smoke tests.

Verifies the v0.1.0a1 re-export surface lights up + the canonical
contracts are reachable behind the downstream package name.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Local-dev import path: add app/backend to sys.path so the
# physics_tsfm package can re-export from apex.shared.contracts.
REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "app" / "backend"))


def test_version_string():
    import physics_tsfm
    assert physics_tsfm.__version__ == "0.1.0a1"


def test_tensor_shape_constant_is_canonical():
    from physics_tsfm import CHANNEL_COUNT, HORIZON, TENSOR_SHAPE
    assert TENSOR_SHAPE == (None, 30, 14)
    assert HORIZON == 30
    assert CHANNEL_COUNT == 14


def test_violation_types_enumerates_14():
    from physics_tsfm import VIOLATION_TYPES
    assert len(VIOLATION_TYPES) == 14


def test_physics_violation_log_round_trip():
    from physics_tsfm import PhysicsViolationLog, ViolationRecord

    log = PhysicsViolationLog(
        records=[
            ViolationRecord(
                step=3, type="friction_ellipse_exceeded",
                severity=0.30,
                channel_values={"long_g": 1.5, "lat_g": 0.0},
                tier=7,
            ),
        ],
        engine="v1_numpy",
    )
    text = log.to_text()
    assert "ENGINE v1_numpy" in text
    assert "step=03 type=friction_ellipse_exceeded tier=7" in text
    # Deterministic across calls.
    assert text == log.to_text()


def test_differentiable_projector_protocol_importable():
    from physics_tsfm import DifferentiableProjector
    assert DifferentiableProjector is not None


def test_new_audit_id_produces_nonempty_string():
    from physics_tsfm import new_audit_id
    a = new_audit_id()
    b = new_audit_id()
    assert a != b
    assert len(a) > 0
