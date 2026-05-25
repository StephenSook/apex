"""V1 NumPy physics validator tests (Phase 2 Day 4 tasks 2.1-2.5 + G3 gate).

Two halves:
  1. Unit tests per check (5 impossibilities + 5 valid traces per task 2.6).
  2. Round-trip serializer assertion across all violation types (task 2.6b;
     Convergence-14 floor). The G3 gate at task 2.7 lights when both halves
     pass without skips.

Engine-agnostic invariant: every test that asserts on `.to_text()` output
runs the same fixture through V1 NumPy here. The same fixture passed
through V2 cvxpylayers (Day 5 task 2.12) must produce byte-identical
serialized text; that cross-engine test lives in test_serializer.py once
V2 lands.
"""

from __future__ import annotations

import numpy as np
import pytest

from apex.physics.validator import (
    ToleranceBands,
    bicycle_kinematic_check,
    coa_simultaneity_rule,
    forward_euler_consistency,
    friction_ellipse_check,
    validate_forecast,
)
from apex.shared.contracts import (
    CHANNEL_COUNT,
    HORIZON,
    PhysicsViolationLog,
    ViolationRecord,
    channel_index,
)

G = 9.81
MU_DEMO = 1.2
WHEELBASE_M = 2.7


# ---- friction_ellipse_check (task 2.1) ---------------------------------

def test_friction_ellipse_flat_zero_g_has_no_violations():
    long_g = np.zeros(HORIZON, dtype=np.float64)
    lat_g = np.zeros(HORIZON, dtype=np.float64)
    log = friction_ellipse_check(long_g, lat_g, mu=MU_DEMO, g=G)
    assert log.is_empty()
    assert log.engine == "v1_numpy"
    assert log.forecast_step_count == HORIZON


def test_friction_ellipse_within_circle_passes():
    # 0.5g long + 0.5g lat -> sqrt(0.5) ~= 0.707 < mu (1.2)
    long_g = np.full(HORIZON, 0.5, dtype=np.float64)
    lat_g = np.full(HORIZON, 0.5, dtype=np.float64)
    log = friction_ellipse_check(long_g, lat_g, mu=MU_DEMO, g=G)
    assert log.is_empty()


def test_friction_ellipse_exceeded_flags_each_step():
    # 1.5g long + 0.0g lat -> 1.5 > 1.2 mu -> every step violates
    long_g = np.full(HORIZON, 1.5, dtype=np.float64)
    lat_g = np.zeros(HORIZON, dtype=np.float64)
    log = friction_ellipse_check(long_g, lat_g, mu=MU_DEMO, g=G)
    assert len(log.records) == HORIZON
    for r in log.records:
        assert r.type == "friction_ellipse_exceeded"
        assert r.tier == 7
        assert r.severity > 0.0


def test_friction_ellipse_combined_load_violates():
    # 1.0 long + 1.0 lat -> sqrt(2) ~= 1.414 > 1.2 mu
    long_g = np.zeros(HORIZON, dtype=np.float64)
    lat_g = np.zeros(HORIZON, dtype=np.float64)
    long_g[5] = 1.0
    lat_g[5] = 1.0
    log = friction_ellipse_check(long_g, lat_g, mu=MU_DEMO, g=G)
    assert len(log.records) == 1
    assert log.records[0].step == 5


def test_friction_ellipse_severity_grows_with_magnitude():
    long_g = np.zeros(HORIZON, dtype=np.float64)
    lat_g = np.zeros(HORIZON, dtype=np.float64)
    long_g[0] = 1.3   # mild overshoot
    long_g[1] = 2.0   # large overshoot
    log = friction_ellipse_check(long_g, lat_g, mu=MU_DEMO, g=G)
    by_step = {r.step: r for r in log.records}
    assert by_step[1].severity > by_step[0].severity


# ---- forward_euler_consistency (task 2.2) ------------------------------

def test_forward_euler_consistent_trace_passes():
    # Speed grows by 1g * dt (1s) = 9.81 m/s per step, with long_g = 1.0
    long_g = np.full(HORIZON, 1.0, dtype=np.float64)
    speed_mps = 10.0 + G * np.arange(HORIZON, dtype=np.float64)
    log = forward_euler_consistency(
        speed_mps, long_g, dt=1.0, bands=ToleranceBands.for_1hz_aggregation()
    )
    assert log.is_empty()


def test_forward_euler_impossible_delta_v_flags_step():
    # Speed jumps 50 m/s in one step at long_g = 0 -> impossible
    speed_mps = np.full(HORIZON, 10.0, dtype=np.float64)
    speed_mps[10] = 60.0
    long_g = np.zeros(HORIZON, dtype=np.float64)
    log = forward_euler_consistency(
        speed_mps, long_g, dt=1.0, bands=ToleranceBands.for_1hz_aggregation()
    )
    assert len(log.records) >= 1
    flagged_steps = {r.step for r in log.records}
    # Delta-v at step index 9->10 means the residual lands on step 9 or 10;
    # accept either as long as the impossible transition is flagged.
    assert flagged_steps & {9, 10}
    for r in log.records:
        assert r.type == "forward_euler_inconsistent"
        assert r.tier == 8


# ---- bicycle_kinematic_check (task 2.3) --------------------------------

def test_bicycle_kinematics_consistent_low_speed_passes():
    speed = np.full(HORIZON, 20.0, dtype=np.float64)
    steering = np.full(HORIZON, 0.05, dtype=np.float64)  # small angle
    lat_g = steering * speed ** 2 / (WHEELBASE_M * G)
    log = bicycle_kinematic_check(
        lat_g, steering, speed, WHEELBASE_M, ToleranceBands.for_1hz_aggregation()
    )
    assert log.is_empty()


def test_bicycle_kinematics_impossible_lat_g_no_steering_flags():
    # 2g lateral with zero steering at 50 m/s is physically impossible
    speed = np.full(HORIZON, 50.0, dtype=np.float64)
    steering = np.zeros(HORIZON, dtype=np.float64)
    lat_g = np.zeros(HORIZON, dtype=np.float64)
    lat_g[7] = 2.0
    log = bicycle_kinematic_check(
        lat_g, steering, speed, WHEELBASE_M, ToleranceBands.for_1hz_aggregation()
    )
    flagged = {r.step for r in log.records}
    assert 7 in flagged
    for r in log.records:
        assert r.type == "bicycle_kinematic_break"
        assert r.tier == 8


# ---- coa_simultaneity_rule (task 2.4) ----------------------------------

def test_coa_simultaneity_permitted_no_overlap_passes():
    # Permitted (channel == 1) AND no overlap (one of throttle/brake is 0)
    throttle = np.full(HORIZON, 50.0, dtype=np.float64)
    brake = np.zeros(HORIZON, dtype=np.float64)
    sim_channel = np.ones(HORIZON, dtype=np.float64)
    log = coa_simultaneity_rule(throttle, brake, sim_channel)
    assert log.is_empty()


def test_coa_simultaneity_permitted_with_overlap_passes():
    # Permitted (channel == 1) AND overlap present -> NOT a violation
    throttle = np.full(HORIZON, 50.0, dtype=np.float64)
    brake = np.full(HORIZON, 0.5e6, dtype=np.float64)
    sim_channel = np.ones(HORIZON, dtype=np.float64)
    log = coa_simultaneity_rule(throttle, brake, sim_channel)
    assert log.is_empty()


def test_coa_simultaneity_forbidden_with_overlap_flags():
    # NOT permitted (channel == 0) AND overlap present -> violation
    throttle = np.zeros(HORIZON, dtype=np.float64)
    brake = np.zeros(HORIZON, dtype=np.float64)
    throttle[3] = 30.0
    brake[3] = 0.4e6
    sim_channel = np.zeros(HORIZON, dtype=np.float64)
    log = coa_simultaneity_rule(throttle, brake, sim_channel)
    assert len(log.records) == 1
    assert log.records[0].step == 3
    assert log.records[0].type == "coa_simultaneity_violation"
    assert log.records[0].tier == 0


# ---- validate_forecast (task 2.5) --------------------------------------

def _build_forecast() -> np.ndarray:
    return np.zeros((HORIZON, CHANNEL_COUNT), dtype=np.float64)


def test_validate_forecast_clean_trace_has_zero_violations():
    f = _build_forecast()
    f[:, channel_index("speed_mps")] = 30.0  # constant cruise, zero g
    sim = np.ones(HORIZON, dtype=np.float64)
    log = validate_forecast(f, mu=MU_DEMO, wheelbase_m=WHEELBASE_M,
                            simultaneity_channel=sim)
    assert log.is_empty()
    assert log.fcvr() == 0.0


def test_validate_forecast_merges_violations_across_checks():
    f = _build_forecast()
    # Friction violation at step 2
    f[2, channel_index("long_g")] = 1.5
    # COA violation at step 4 (forbidden + overlap)
    f[4, channel_index("throttle_pct")] = 30.0
    f[4, channel_index("brake_pa")] = 0.4e6
    sim = np.zeros(HORIZON, dtype=np.float64)
    log = validate_forecast(f, mu=MU_DEMO, wheelbase_m=WHEELBASE_M,
                            simultaneity_channel=sim)
    types = {r.type for r in log.records}
    assert "friction_ellipse_exceeded" in types
    assert "coa_simultaneity_violation" in types
    assert log.fcvr() > 0.0


# ---- Convergence-14 round-trip serializer floor (task 2.6b) ------------

def test_to_text_is_deterministic_across_two_calls():
    log = PhysicsViolationLog(
        records=[
            ViolationRecord(
                step=3,
                type="friction_ellipse_exceeded",
                severity=0.1234,
                channel_values={"long_g": 1.31, "lat_g": 0.42},
                tier=7,
            ),
            ViolationRecord(
                step=1,
                type="coa_simultaneity_violation",
                severity=0.0,
                channel_values={"throttle_pct": 30.0, "brake_pa": 4.0e5},
                tier=0,
            ),
        ],
        engine="v1_numpy",
    )
    assert log.to_text() == log.to_text()


def test_to_text_sorts_records_by_step_then_type_then_tier():
    log = PhysicsViolationLog(
        records=[
            ViolationRecord(step=5, type="friction_ellipse_exceeded",
                            severity=0.1, channel_values={}, tier=7),
            ViolationRecord(step=1, type="friction_ellipse_exceeded",
                            severity=0.1, channel_values={}, tier=7),
            ViolationRecord(step=3, type="coa_simultaneity_violation",
                            severity=0.0, channel_values={}, tier=0),
        ]
    )
    text = log.to_text()
    # Step 1 record must appear before step 3 must appear before step 5
    idx1 = text.find("step=01")
    idx3 = text.find("step=03")
    idx5 = text.find("step=05")
    assert 0 <= idx1 < idx3 < idx5


def test_friction_violation_serializer_round_trip_matches_golden():
    long_g = np.zeros(HORIZON, dtype=np.float64)
    lat_g = np.zeros(HORIZON, dtype=np.float64)
    long_g[7] = 1.5
    lat_g[7] = 0.0
    log = friction_ellipse_check(long_g, lat_g, mu=MU_DEMO, g=G)
    text_first = log.to_text()
    text_second = log.to_text()
    assert text_first == text_second
    assert "ENGINE v1_numpy" in text_first
    assert "STEPS 30" in text_first
    assert "step=07 type=friction_ellipse_exceeded tier=7" in text_first


# ---- G3 gate: 5 impossibilities + 5 valid ------------------------------

@pytest.fixture
def impossibilities():
    """5 impossible-physics fixtures, one per violation type V1 covers."""
    cases = []
    # 1. Friction ellipse exceeded
    long_g = np.zeros(HORIZON, dtype=np.float64); long_g[0] = 1.5
    lat_g = np.zeros(HORIZON, dtype=np.float64)
    cases.append(("friction", lambda: friction_ellipse_check(long_g, lat_g, MU_DEMO, G)))
    # 2. Forward Euler inconsistent (speed jump)
    speed = np.full(HORIZON, 10.0, dtype=np.float64); speed[5] = 60.0
    long_g2 = np.zeros(HORIZON, dtype=np.float64)
    cases.append(("euler", lambda: forward_euler_consistency(
        speed, long_g2, dt=1.0, bands=ToleranceBands.for_1hz_aggregation()
    )))
    # 3. Bicycle kinematic break
    speed3 = np.full(HORIZON, 50.0, dtype=np.float64)
    steering = np.zeros(HORIZON, dtype=np.float64)
    lat_g3 = np.zeros(HORIZON, dtype=np.float64); lat_g3[2] = 2.0
    cases.append(("bicycle", lambda: bicycle_kinematic_check(
        lat_g3, steering, speed3, WHEELBASE_M, ToleranceBands.for_1hz_aggregation()
    )))
    # 4. COA simultaneity violation
    thr = np.zeros(HORIZON, dtype=np.float64); thr[0] = 30.0
    brk = np.zeros(HORIZON, dtype=np.float64); brk[0] = 0.4e6
    sim_zero = np.zeros(HORIZON, dtype=np.float64)
    cases.append(("coa", lambda: coa_simultaneity_rule(thr, brk, sim_zero)))
    # 5. validate_forecast top-level (friction at step 2)
    f = _build_forecast(); f[2, channel_index("long_g")] = 1.5
    sim_ones = np.ones(HORIZON, dtype=np.float64)
    cases.append(("top_level", lambda: validate_forecast(
        f, mu=MU_DEMO, wheelbase_m=WHEELBASE_M, simultaneity_channel=sim_ones
    )))
    return cases


@pytest.fixture
def valid_traces():
    """5 valid traces. Each MUST return PhysicsViolationLog with no records."""
    cases = []
    cases.append(("friction_zero", lambda: friction_ellipse_check(
        np.zeros(HORIZON), np.zeros(HORIZON), MU_DEMO, G
    )))
    cases.append(("euler_consistent", lambda: forward_euler_consistency(
        10.0 + G * np.arange(HORIZON, dtype=np.float64),
        np.full(HORIZON, 1.0, dtype=np.float64),
        dt=1.0,
        bands=ToleranceBands.for_1hz_aggregation(),
    )))
    cases.append(("bicycle_consistent", lambda: bicycle_kinematic_check(
        np.full(HORIZON, 0.05) * np.full(HORIZON, 20.0) ** 2 / (WHEELBASE_M * G),
        np.full(HORIZON, 0.05),
        np.full(HORIZON, 20.0),
        WHEELBASE_M,
        ToleranceBands.for_1hz_aggregation(),
    )))
    cases.append(("coa_no_overlap", lambda: coa_simultaneity_rule(
        np.full(HORIZON, 50.0),
        np.zeros(HORIZON),
        np.zeros(HORIZON),
    )))
    f = _build_forecast(); f[:, channel_index("speed_mps")] = 30.0
    cases.append(("validate_clean", lambda: validate_forecast(
        f, mu=MU_DEMO, wheelbase_m=WHEELBASE_M,
        simultaneity_channel=np.ones(HORIZON),
    )))
    return cases


def test_g3_catches_five_impossibilities(impossibilities):
    for name, factory in impossibilities:
        log = factory()
        assert not log.is_empty(), f"impossibility {name} produced empty log"


def test_g3_approves_five_valid_traces(valid_traces):
    for name, factory in valid_traces:
        log = factory()
        assert log.is_empty(), (
            f"valid trace {name} produced violations: {log.to_text()}"
        )
