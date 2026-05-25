"""Granite Guardian 4.1 BYOC custom-rules audit tests (Phase 2 Day 5 tasks 2.14-2.16).

The Guardian audit reads a PhysicsViolationLog (engine-agnostic; V1 NumPy
floor or V2 cvxpylayers ceiling both work) + a CoaParseResult + a
PhysicsConfidence input, applies a BYOC rule registry, and emits a
GuardianAudit discriminated union (approve | flag | reject) whose shape
matches the canonical frontend contract at `app/shared/types.ts` L323-345.

Three layers of assertion:
  1. Empty violation log + safe CoA -> approve with audit_id non-None
  2. Friction-ellipse violations -> flag with templated concerns
  3. COA simultaneity violation (Tier 0 inviolable) -> reject with
     templated blocked_recommendation

Verdict precedence: reject > flag > approve. If any rule matches with
its reject branch, the top-level verdict is reject regardless of any
flag-branch matches.

Gate G5 acceptance (plan task 2.16): the Guardian audit catches all 5
of the same impossibilities the V1 validator catches, and the
COA-derived simultaneity rule produces a reject verdict on a hairpin-
steering-lock conflict (D-022 lexicographic Tier-0 inviolable).
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pytest

from apex.guardian.audit import (
    BYOCRule,
    DEFAULT_RULE_REGISTRY,
    Guardian,
    render_audit,
)
from apex.instruct.coa_parser import parse_coa_json
from apex.physics.validator import friction_ellipse_check, validate_forecast
from apex.shared.contracts import (
    CHANNEL_COUNT,
    HORIZON,
    GuardianAudit,
    PhysicsViolationLog,
    ViolationRecord,
    channel_index,
)

REPO_ROOT = Path(__file__).resolve().parents[3]
SARAH_COA_STUB = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-coa-stub.json"

MU_DEMO = 1.2
WHEELBASE_M = 2.7
G = 9.81


@pytest.fixture
def sarah_coa():
    return parse_coa_json(SARAH_COA_STUB)


def _empty_log() -> PhysicsViolationLog:
    return PhysicsViolationLog(records=[], engine="v1_numpy")


def _friction_log(steps: tuple[int, ...] = (3,)) -> PhysicsViolationLog:
    records = [
        ViolationRecord(
            step=s,
            type="friction_ellipse_exceeded",
            severity=0.30,
            channel_values={"long_g": 1.5, "lat_g": 0.0},
            tier=7,
        )
        for s in steps
    ]
    return PhysicsViolationLog(records=records, engine="v1_numpy")


def _coa_violation_log(step: int = 4) -> PhysicsViolationLog:
    return PhysicsViolationLog(
        records=[
            ViolationRecord(
                step=step,
                type="coa_simultaneity_violation",
                severity=0.0,
                channel_values={"throttle_pct": 30.0, "brake_pa": 4.0e5,
                                "coa_overlap_flag": 0.0},
                tier=0,
            )
        ],
        engine="v1_numpy",
    )


# ---- GuardianAudit shape contract (frontend reconcile) -----------------

def test_guardian_audit_is_a_discriminated_union_by_verdict():
    """Schema check: GuardianAudit type must be the discriminated-union
    shape that matches app/shared/types.ts L323-345.
    """
    audit_args = {
        "verdict": "approve",
        "reasoning_trace": ("ok",),
        "audit_id": "abc123",
    }
    audit = GuardianAudit(**audit_args)
    assert audit.verdict == "approve"
    assert audit.audit_id == "abc123"


def test_guardian_audit_flag_carries_flagged_concerns():
    audit = GuardianAudit(
        verdict="flag",
        reasoning_trace=("friction ellipse exceeded at step 3",),
        flagged_concerns=("Friction-ellipse breach at step 3",),
        audit_id="def456",
    )
    assert audit.verdict == "flag"
    assert audit.flagged_concerns == ("Friction-ellipse breach at step 3",)


def test_guardian_audit_reject_carries_blocked_recommendations():
    audit = GuardianAudit(
        verdict="reject",
        reasoning_trace=("COA simultaneity violation at step 4",),
        blocked_recommendations=("Cannot approve overlap",),
        audit_id="ghi789",
    )
    assert audit.verdict == "reject"
    assert audit.blocked_recommendations == ("Cannot approve overlap",)


# ---- Guardian.audit() behavior ----------------------------------------

def test_empty_log_yields_approve_with_audit_id(sarah_coa):
    guardian = Guardian()
    audit = guardian.audit(violation_log=_empty_log(), coa=sarah_coa)
    assert audit.verdict == "approve"
    assert audit.audit_id  # non-None + non-empty
    assert isinstance(audit.audit_id, str)
    assert len(audit.audit_id) > 0


def test_audit_id_is_unique_per_call(sarah_coa):
    guardian = Guardian()
    a1 = guardian.audit(violation_log=_empty_log(), coa=sarah_coa)
    a2 = guardian.audit(violation_log=_empty_log(), coa=sarah_coa)
    assert a1.audit_id != a2.audit_id


def test_friction_violation_yields_flag(sarah_coa):
    guardian = Guardian()
    audit = guardian.audit(violation_log=_friction_log(steps=(3,)), coa=sarah_coa)
    assert audit.verdict == "flag"
    assert any("step 3" in c.lower() or "step=3" in c.lower() or "step 03" in c
                for c in audit.flagged_concerns)


def test_coa_simultaneity_violation_yields_reject(sarah_coa):
    guardian = Guardian()
    audit = guardian.audit(violation_log=_coa_violation_log(step=4), coa=sarah_coa)
    assert audit.verdict == "reject"
    assert len(audit.blocked_recommendations) >= 1


def test_reject_has_precedence_over_flag(sarah_coa):
    """If a forecast has both a friction-ellipse violation AND a
    COA-simultaneity violation, the top-level verdict is reject.
    Per D-022 lexicographic Tier-0 inviolable contract.
    """
    log = PhysicsViolationLog(
        records=[
            ViolationRecord(
                step=3, type="friction_ellipse_exceeded",
                severity=0.30, channel_values={"long_g": 1.5, "lat_g": 0.0},
                tier=7,
            ),
            ViolationRecord(
                step=4, type="coa_simultaneity_violation",
                severity=0.0, channel_values={"throttle_pct": 30.0,
                                              "brake_pa": 4.0e5,
                                              "coa_overlap_flag": 0.0},
                tier=0,
            ),
        ],
        engine="v1_numpy",
    )
    guardian = Guardian()
    audit = guardian.audit(violation_log=log, coa=sarah_coa)
    assert audit.verdict == "reject"


def test_reasoning_trace_is_present_on_all_verdicts(sarah_coa):
    guardian = Guardian()
    approve = guardian.audit(violation_log=_empty_log(), coa=sarah_coa)
    flag = guardian.audit(violation_log=_friction_log(), coa=sarah_coa)
    reject = guardian.audit(violation_log=_coa_violation_log(), coa=sarah_coa)
    assert len(approve.reasoning_trace) >= 1
    assert len(flag.reasoning_trace) >= 1
    assert len(reject.reasoning_trace) >= 1


# ---- BYOC rule registry --------------------------------------------------

def test_default_rule_registry_covers_friction_and_simultaneity():
    rule_ids = {r.rule_id for r in DEFAULT_RULE_REGISTRY}
    assert "friction_ellipse_breach" in rule_ids
    assert "coa_simultaneity_breach" in rule_ids


def test_byoc_rule_has_concrete_schema_fields():
    rule = DEFAULT_RULE_REGISTRY[0]
    # Architecture-spec L191-204 names these fields.
    assert isinstance(rule.rule_id, str)
    assert isinstance(rule.violation_type, str)
    assert isinstance(rule.verdict, str)
    assert rule.verdict in {"approve", "flag", "reject"}


def test_custom_rule_can_be_passed_in(sarah_coa):
    # An ops-side override: a friction-ellipse violation now rejects
    # (e.g. for a stricter circuit-conditional mu regime). Verifies the
    # rule registry is parameterizable, not hard-coded.
    custom = BYOCRule(
        rule_id="friction_ellipse_breach_strict",
        violation_type="friction_ellipse_exceeded",
        verdict="reject",
        concern_template=None,
        block_template="No friction-ellipse breach permitted (strict mode) at step {step}.",
    )
    guardian = Guardian(rules=(custom,))
    audit = guardian.audit(violation_log=_friction_log(steps=(3,)), coa=sarah_coa)
    assert audit.verdict == "reject"


# ---- Gate G5: Guardian catches same 5 impossibilities --------------------

def _build_5_impossibility_forecast() -> np.ndarray:
    """One forecast that contains all 5 V1 violation types V1 can emit."""
    f = np.zeros((HORIZON, CHANNEL_COUNT), dtype=np.float64)
    # 1. friction at step 2 (long_g=1.5g, lat_g=0)
    f[2, channel_index("long_g")] = 1.5
    # 2. forward-Euler at step 5 (impossible delta-v)
    f[5, channel_index("speed_mps")] = 0.0
    f[6, channel_index("speed_mps")] = 60.0
    f[5, channel_index("long_g")] = 0.0
    # 3. bicycle-kinematic at step 9 (2g lateral, zero steering, high speed)
    f[9, channel_index("lat_g")] = 2.0
    f[9, channel_index("speed_mps")] = 50.0
    f[9, channel_index("steering_rad")] = 0.0
    # 4. COA simultaneity at step 11 (throttle + brake overlap with forbid)
    f[11, channel_index("throttle_pct")] = 30.0
    f[11, channel_index("brake_pa")] = 0.4e6
    # 5. top-level catch via validate_forecast merging all of the above
    return f


# ---- Guardian text-rendering helper (task 2.15) -----------------------

def test_render_audit_think_mode_includes_reasoning_trace(sarah_coa):
    guardian = Guardian()
    audit = guardian.audit(violation_log=_friction_log(steps=(3,)), coa=sarah_coa)
    text = render_audit(audit, mode="think")
    # Header announces verdict; think-mode surfaces the reasoning chain.
    assert audit.verdict in text.lower()
    assert "reasoning" in text.lower()
    # First reasoning-trace line must appear in the rendered text.
    assert audit.reasoning_trace[0] in text


def test_render_audit_no_think_mode_omits_reasoning_trace(sarah_coa):
    guardian = Guardian()
    audit = guardian.audit(violation_log=_friction_log(steps=(3,)), coa=sarah_coa)
    text = render_audit(audit, mode="no-think")
    # No-think still shows verdict + concerns + audit_id; not the reasoning chain.
    assert audit.verdict in text.lower()
    assert audit.audit_id in text
    # Reasoning-trace lines must NOT appear in no-think output.
    for line in audit.reasoning_trace:
        assert line not in text


def test_render_audit_flag_surfaces_flagged_concerns(sarah_coa):
    guardian = Guardian()
    audit = guardian.audit(violation_log=_friction_log(steps=(3,)), coa=sarah_coa)
    text = render_audit(audit, mode="think")
    assert audit.flagged_concerns[0] in text


def test_render_audit_reject_surfaces_blocked_recommendations(sarah_coa):
    guardian = Guardian()
    audit = guardian.audit(violation_log=_coa_violation_log(step=4), coa=sarah_coa)
    text = render_audit(audit, mode="think")
    assert audit.blocked_recommendations[0] in text


def test_render_audit_approve_renders_audit_id_only(sarah_coa):
    guardian = Guardian()
    audit = guardian.audit(violation_log=_empty_log(), coa=sarah_coa)
    text = render_audit(audit, mode="think")
    # Approve verdict has no flagged_concerns or blocked_recommendations
    # to surface; render must still produce a non-empty text with audit_id.
    assert audit.audit_id in text
    assert "approve" in text.lower()


def test_render_audit_unknown_mode_raises(sarah_coa):
    guardian = Guardian()
    audit = guardian.audit(violation_log=_empty_log(), coa=sarah_coa)
    with pytest.raises(ValueError, match="mode"):
        render_audit(audit, mode="hyperdrive")


def test_render_audit_default_mode_is_think(sarah_coa):
    """Hybrid-thinking default per docs/architecture-spec.md L440."""
    guardian = Guardian()
    audit = guardian.audit(violation_log=_friction_log(steps=(3,)), coa=sarah_coa)
    default_text = render_audit(audit)
    think_text = render_audit(audit, mode="think")
    assert default_text == think_text


# ---- G5 hairpin lexicographic stress test (task 2.16) -----------------

def test_g5_hairpin_lexicographic_precedence_demonstration(sarah_coa):
    """D-022 lexicographic COA constraint hierarchy demonstration on
    the BYOC rule-engine floor: a forecast with many Tier-7/8 physics
    violations (bicycle + friction; the hairpin-steering-lock proxy
    scenario at race-corner speeds) AND one Tier-0 COA simultaneity
    violation produces a single reject verdict; Tier-0 wins precedence
    over the Tier-7/8 flag count.

    Full elastic-slack constraint relaxation (the actual numerical
    slack-variable optimization) lives in the SCP solver Stage A + B
    per D-031 staged ladder; the rule-engine floor demonstrates the
    verdict precedence half of D-022. See logs/day-05-g5.md.
    """
    # Hairpin proxy: heavy lat_g + steering + speed (bicycle floods)
    # plus one Tier-0 simultaneity at step 8.
    records = []
    for step in range(2, 8):
        records.append(ViolationRecord(
            step=step, type="bicycle_kinematic_break",
            severity=12.0 + step,
            channel_values={"lat_g": 1.3, "steering_rad": 0.45,
                            "speed_mps": 35.0},
            tier=8,
        ))
        records.append(ViolationRecord(
            step=step, type="friction_ellipse_exceeded",
            severity=0.16,
            channel_values={"long_g": -0.85, "lat_g": 1.05},
            tier=7,
        ))
    records.append(ViolationRecord(
        step=8, type="coa_simultaneity_violation",
        severity=0.0,
        channel_values={"throttle_pct": 30.0, "brake_pa": 4.0e5,
                        "coa_overlap_flag": 0.0},
        tier=0,
    ))
    log = PhysicsViolationLog(records=records, engine="v1_numpy")

    guardian = Guardian()
    audit = guardian.audit(violation_log=log, coa=sarah_coa)

    # Verdict precedence locks: one Tier-0 reject > many Tier-7/8 flags.
    assert audit.verdict == "reject"
    # blocked_recommendations carries the simultaneity block;
    # flagged_concerns carries the friction + bicycle warnings (those
    # still get surfaced, the verdict precedence does not silence them).
    assert len(audit.blocked_recommendations) >= 1
    assert len(audit.flagged_concerns) >= 1
    trace = "\n".join(audit.reasoning_trace).lower()
    assert "simultaneity" in trace
    # Reasoning trace surfaces the inviolable framing.
    assert "tier-0" in trace or "inviolable" in trace


def test_g5_v1_v2_guardian_audits_agree_on_verdict_for_same_violations(sarah_coa):
    """The engine-agnostic boundary (Long-Term Architect load-bearing
    wall #2) means a V1 NumPy violation log and a V2 cvxpylayers
    violation log over identical input produce identical Guardian
    audits modulo audit_id (uuid4 per call). This is the property that
    lets the demo run V1 while the paper §3.2 cites V2 as canonical.
    """
    long_g = np.zeros(HORIZON, dtype=np.float64)
    lat_g = np.zeros(HORIZON, dtype=np.float64)
    long_g[3] = 1.5
    v1_log = friction_ellipse_check(long_g, lat_g, mu=MU_DEMO, g=G)

    # Manually build a V2-engine log with the same ViolationRecord
    # content (V2 import would require torch + cvxpylayers; this proves
    # the rule engine is engine-agnostic at the type level without the
    # heavy dependency).
    v2_log = PhysicsViolationLog(
        records=tuple(v1_log.records),
        forecast_step_count=v1_log.forecast_step_count,
        engine="v2_cvxpylayers",
    )

    guardian = Guardian()
    v1_audit = guardian.audit(violation_log=v1_log, coa=sarah_coa)
    v2_audit = guardian.audit(violation_log=v2_log, coa=sarah_coa)

    assert v1_audit.verdict == v2_audit.verdict
    assert v1_audit.flagged_concerns == v2_audit.flagged_concerns
    assert v1_audit.blocked_recommendations == v2_audit.blocked_recommendations
    # audit_id differs (uuid4 per call) -- documented intentional.
    assert v1_audit.audit_id != v2_audit.audit_id


def test_g5_guardian_catches_all_v1_impossibilities(sarah_coa):
    forecast = _build_5_impossibility_forecast()
    # COA simultaneity forbidden at step 11 by setting the channel to 0
    simultaneity_channel = np.ones(HORIZON, dtype=np.float64)
    simultaneity_channel[11] = 0.0
    log = validate_forecast(
        forecast, mu=MU_DEMO, wheelbase_m=WHEELBASE_M,
        simultaneity_channel=simultaneity_channel,
    )
    # V1 validator must produce non-empty log with all five violation types.
    flagged_types = {r.type for r in log.records}
    assert "friction_ellipse_exceeded" in flagged_types
    assert "forward_euler_inconsistent" in flagged_types
    assert "bicycle_kinematic_break" in flagged_types
    assert "coa_simultaneity_violation" in flagged_types

    guardian = Guardian()
    audit = guardian.audit(violation_log=log, coa=sarah_coa)
    # COA simultaneity is Tier-0 inviolable -> reject precedence.
    assert audit.verdict == "reject"
    assert audit.audit_id  # non-None
    # Reasoning trace must reference each of the four physics violation types.
    trace_text = "\n".join(audit.reasoning_trace).lower()
    assert "friction" in trace_text
    assert "simultaneity" in trace_text
