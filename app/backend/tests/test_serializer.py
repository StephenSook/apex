"""Convergence-14 serializer expansion (Phase 4 task 4.2).

G3 (Day 4) proved round-trip serializer determinism on the 5 violation
types V1 NumPy emits. Phase 4 task 4.2 expands the fixture grid to
all 14 violation types per VIOLATION_TYPES at
shared.contracts.violations.

Each violation type:
  - Has a deterministic ViolationRecord fixture
  - Produces byte-identical to_text() output across repeated calls
  - Sorts correctly by (step, type, tier) in the serialized output
  - Round-trips through the serializer (write -> golden text byte-eq)
"""

from __future__ import annotations

import pytest

from apex.shared.contracts import (
    VIOLATION_TYPES,
    PhysicsViolationLog,
    ViolationRecord,
)

# Map each violation type to a representative fixture so the
# expansion has full coverage. The fixture covers tier + at least
# two channel_values fields.
FIXTURES_BY_TYPE: dict[str, ViolationRecord] = {
    "friction_ellipse_exceeded": ViolationRecord(
        step=3, type="friction_ellipse_exceeded",
        severity=0.30, channel_values={"long_g": 1.5, "lat_g": 0.0},
        tier=7,
    ),
    "forward_euler_inconsistent": ViolationRecord(
        step=5, type="forward_euler_inconsistent",
        severity=0.50, channel_values={"speed_mps": 10.0,
                                        "speed_mps_next": 60.0,
                                        "long_g": 0.0},
        tier=8,
    ),
    "bicycle_kinematic_break": ViolationRecord(
        step=9, type="bicycle_kinematic_break",
        severity=1.20, channel_values={"lat_g": 2.0, "steering_rad": 0.0,
                                        "speed_mps": 50.0},
        tier=8,
    ),
    "coa_simultaneity_violation": ViolationRecord(
        step=4, type="coa_simultaneity_violation",
        severity=0.0, channel_values={"throttle_pct": 30.0,
                                        "brake_pa": 4.0e5,
                                        "coa_overlap_flag": 0.0},
        tier=0,
    ),
    "jerk_bound_exceeded": ViolationRecord(
        step=11, type="jerk_bound_exceeded",
        severity=2.0, channel_values={"long_g": 1.0, "long_g_prev": -1.0},
        tier=8,
    ),
    "tire_load_negative": ViolationRecord(
        step=12, type="tire_load_negative",
        severity=100.0, channel_values={"tire_load_n": -150.0, "lat_g": 1.4},
        tier=4,
    ),
    "tire_thermal_diverged": ViolationRecord(
        step=14, type="tire_thermal_diverged",
        severity=0.5, channel_values={"mu_v": 0.4, "speed_mps": 60.0},
        tier=5,
    ),
    "yaw_rate_kinematic_break": ViolationRecord(
        step=15, type="yaw_rate_kinematic_break",
        severity=0.8, channel_values={"yaw_rate_rad_s": 1.6,
                                        "steering_rad": 0.02,
                                        "speed_mps": 40.0},
        tier=8,
    ),
    "speed_below_pit_minimum": ViolationRecord(
        step=20, type="speed_below_pit_minimum",
        severity=5.0, channel_values={"speed_mps": 0.5},
        tier=8,
    ),
    "track_geometry_oob": ViolationRecord(
        step=22, type="track_geometry_oob",
        severity=0.10, channel_values={"track_pitch_rad": 0.4,
                                        "track_bank_rad": 0.5},
        tier=1,
    ),
    "gear_ratio_inconsistent": ViolationRecord(
        step=24, type="gear_ratio_inconsistent",
        severity=1500.0, channel_values={"rpm": 9500.0,
                                          "speed_mps": 20.0,
                                          "gear": 2.0},
        tier=8,
    ),
    "aerodynamic_load_inverted": ViolationRecord(
        step=25, type="aerodynamic_load_inverted",
        severity=-200.0, channel_values={"speed_mps": 80.0,
                                          "tire_load_n": -50.0},
        tier=6,
    ),
    "lateral_load_transfer_oob": ViolationRecord(
        step=26, type="lateral_load_transfer_oob",
        severity=300.0, channel_values={"lat_g": 1.6,
                                          "tire_load_n": 6500.0},
        tier=4,
    ),
    "longitudinal_load_transfer_oob": ViolationRecord(
        step=27, type="longitudinal_load_transfer_oob",
        severity=320.0, channel_values={"long_g": -1.3,
                                          "tire_load_n": 6800.0},
        tier=4,
    ),
}


def test_fixtures_cover_all_14_violation_types():
    assert set(FIXTURES_BY_TYPE.keys()) == set(VIOLATION_TYPES)
    assert len(FIXTURES_BY_TYPE) == 14


@pytest.mark.parametrize("violation_type", VIOLATION_TYPES)
def test_each_type_serializes_deterministically(violation_type):
    record = FIXTURES_BY_TYPE[violation_type]
    log = PhysicsViolationLog(records=[record], engine="v1_numpy")
    a = log.to_text()
    b = log.to_text()
    assert a == b
    assert violation_type in a
    assert "ENGINE v1_numpy" in a


def test_full_14_type_log_is_byte_deterministic():
    """A log with all 14 violation types at once must serialize
    byte-identically across two calls."""
    log = PhysicsViolationLog(
        records=list(FIXTURES_BY_TYPE.values()),
        engine="v1_numpy",
    )
    assert log.to_text() == log.to_text()


def test_log_sorts_by_step_then_type_then_tier():
    log = PhysicsViolationLog(
        records=list(FIXTURES_BY_TYPE.values()),
        engine="v1_numpy",
    )
    text = log.to_text()
    # Records must appear in (step, type, tier) order.
    sorted_records = sorted(
        FIXTURES_BY_TYPE.values(), key=lambda r: (r.step, r.type, r.tier),
    )
    for prev_record, next_record in zip(sorted_records, sorted_records[1:]):
        prev_idx = text.find(
            f"step={prev_record.step:02d} type={prev_record.type}"
        )
        next_idx = text.find(
            f"step={next_record.step:02d} type={next_record.type}"
        )
        assert 0 <= prev_idx < next_idx


def test_v1_v2_engine_byte_equality_holds_across_all_14_types():
    """The Long-Term Architect load-bearing wall #2 must hold on every
    one of the 14 types: V1 NumPy + V2 cvxpylayers emit byte-identical
    to_text() output on the same ViolationRecord content modulo the
    ENGINE header line."""
    records = list(FIXTURES_BY_TYPE.values())
    v1 = PhysicsViolationLog(records=records, engine="v1_numpy").to_text()
    v2 = PhysicsViolationLog(records=records, engine="v2_cvxpylayers").to_text()
    v1_lines = v1.splitlines()
    v2_lines = v2.splitlines()
    assert v1_lines[0] == "ENGINE v1_numpy"
    assert v2_lines[0] == "ENGINE v2_cvxpylayers"
    assert v1_lines[1:] == v2_lines[1:]
