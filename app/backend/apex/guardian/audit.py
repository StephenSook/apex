"""Granite Guardian 4.1 BYOC custom-rules audit (Phase 2 Day 5 task 2.14).

Reads a PhysicsViolationLog (engine-agnostic; V1 NumPy or V2 cvxpylayers
both work) + a CoaParseResult, applies a BYOC rule registry, emits a
GuardianAudit discriminated union (approve | flag | reject) whose shape
mirrors the canonical frontend contract at `app/shared/types.ts` L323-345.

BYOC rule schema follows docs/architecture-spec.md L187-204. Each rule:
- matches ViolationRecords by violation_type
- maps to a verdict (approve | flag | reject)
- carries optional templated strings for the audit's reasoning_trace +
  flagged_concerns + blocked_recommendations fields

Verdict precedence: reject > flag > approve. If any rule fires with a
reject branch, the top-level verdict is reject (D-022 lexicographic
Tier-0 inviolable contract: COA-derived violations are inviolable).

The actual Granite Guardian 4.1 model integration (BYOC custom prompt +
think-mode trace) lands at task 2.15 + Phase 3 + Phase 4 orchestration.
This module ships the deterministic rule-engine floor that the
Guardian model wraps; the engine-agnostic boundary means Gate G5 can
pass on the rule-engine floor even before the Granite model is wired.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Final

from apex.instruct.coa_parser import CoaParseResult
from apex.shared.contracts import (
    GuardianAudit,
    GuardianVerdict,
    PhysicsViolationLog,
    ViolationRecord,
    new_audit_id,
)


# ---- BYOC rule registry -------------------------------------------------

@dataclass(frozen=True)
class BYOCRule:
    """A Bring-Your-Own-Classifier rule for the Granite Guardian audit.

    Concrete shape per docs/architecture-spec.md L187-204. Each rule
    matches a single violation_type + emits a single verdict; multi-
    verdict rules from the architecture-spec's verdict_map are
    represented as separate BYOCRule instances (one per
    severity-trigger).

    Templated fields use str.format() placeholders: {step}, {long_g},
    {lat_g}, {throttle_pct}, {brake_pa}, {speed_mps}, {severity},
    {tier}. Templates that reference a field absent from the
    violation's channel_values fall back to the literal placeholder
    string (no crash on missing fields).
    """

    rule_id: str
    violation_type: str
    verdict: GuardianVerdict
    concern_template: str | None = None     # used on verdict="flag"
    block_template: str | None = None       # used on verdict="reject"
    reasoning_template: str | None = None   # appended to reasoning_trace on any match


def _format_template(template: str, record: ViolationRecord) -> str:
    """Format a BYOC template against a ViolationRecord.

    Substitutes {step}, {type}, {severity}, {tier} from record fields
    and every key in record.channel_values. Missing placeholders fall
    back to the literal `{placeholder}` string.
    """
    fields: dict[str, object] = {
        "step": record.step,
        "type": record.type,
        "severity": f"{record.severity:.4f}",
        "tier": record.tier,
    }
    fields.update({k: f"{v:.4f}" for k, v in record.channel_values.items()})
    try:
        return template.format(**fields)
    except (KeyError, IndexError):
        return template


DEFAULT_RULE_REGISTRY: Final[tuple[BYOCRule, ...]] = (
    BYOCRule(
        rule_id="friction_ellipse_breach",
        violation_type="friction_ellipse_exceeded",
        verdict="flag",
        concern_template=(
            "Friction-ellipse breach at step {step}: long_g={long_g}, "
            "lat_g={lat_g} exceeds the constant-mu envelope by "
            "{severity}g. Constraint tier {tier}."
        ),
        reasoning_template=(
            "Rule friction_ellipse_breach fired on step {step} "
            "(severity {severity})."
        ),
    ),
    BYOCRule(
        rule_id="forward_euler_inconsistency",
        violation_type="forward_euler_inconsistent",
        verdict="flag",
        concern_template=(
            "Forward-Euler kinematic break at step {step}: Delta-v vs "
            "long_g residual exceeds the 1 Hz tolerance band by {severity} m/s."
        ),
        reasoning_template=(
            "Rule forward_euler_inconsistency fired on step {step}."
        ),
    ),
    BYOCRule(
        rule_id="bicycle_kinematic_break",
        violation_type="bicycle_kinematic_break",
        verdict="flag",
        concern_template=(
            "Bicycle-model kinematic break at step {step}: lat_g={lat_g} "
            "vs steering_rad={steering_rad} at speed_mps={speed_mps} "
            "disagrees by {severity}g."
        ),
        reasoning_template=(
            "Rule bicycle_kinematic_break fired on step {step}. V1 "
            "small-angle bicycle model is known to false-positive at "
            "race-corner speeds; V2 cvxpylayers + 8-tier Pacejka "
            "supersedes this check at production fidelity."
        ),
    ),
    BYOCRule(
        rule_id="coa_simultaneity_breach",
        violation_type="coa_simultaneity_violation",
        verdict="reject",
        block_template=(
            "Cannot approve coaching recommendation: COA does not "
            "permit simultaneous throttle + brake input at step {step} "
            "(throttle_pct={throttle_pct}, brake_pa={brake_pa}). "
            "This is a Tier-0 inviolable constraint per D-022 "
            "lexicographic COA hierarchy."
        ),
        reasoning_template=(
            "Rule coa_simultaneity_breach fired on step {step}: "
            "Tier-0 COA-derived simultaneity gate (inviolable)."
        ),
    ),
)
"""Default BYOC rule registry covering the V1 NumPy validator's four
violation types + the Tier-0 COA gate. Convergence-14 expansion to the
remaining 10 violation types lands at Phase 4 task 4.2."""


# ---- Verdict precedence -------------------------------------------------

_VERDICT_PRECEDENCE: Final[dict[GuardianVerdict, int]] = {
    "approve": 0,
    "flag": 1,
    "reject": 2,
}


def _max_verdict(a: GuardianVerdict, b: GuardianVerdict) -> GuardianVerdict:
    return a if _VERDICT_PRECEDENCE[a] >= _VERDICT_PRECEDENCE[b] else b


# ---- Guardian -----------------------------------------------------------

class Guardian:
    """Granite Guardian 4.1 BYOC custom-rules audit driver.

    Stateless aside from the rule registry; .audit() can be called many
    times on the same instance. Each call generates a fresh audit_id
    via shared.contracts.violations.new_audit_id().

    The Granite model itself is NOT loaded here; this class ships the
    deterministic rule-engine floor that the Guardian model wraps.
    Task 2.15 + Phase 4 wire the model in. Gate G5 (task 2.16) passes
    on the rule-engine floor because the floor catches all 5
    impossibilities + emits the right verdict.
    """

    def __init__(self, rules: tuple[BYOCRule, ...] | None = None):
        self._rules = rules if rules is not None else DEFAULT_RULE_REGISTRY

    def audit(
        self,
        *,
        violation_log: PhysicsViolationLog,
        coa: CoaParseResult,
    ) -> GuardianAudit:
        """Apply the BYOC rule registry to `violation_log` + `coa`.

        Returns a GuardianAudit whose verdict is the maximum-precedence
        verdict across every rule that fired (approve if none fired).
        """
        audit_id = new_audit_id()
        reasoning_trace: list[str] = []
        flagged_concerns: list[str] = []
        blocked_recommendations: list[str] = []
        top_verdict: GuardianVerdict = "approve"

        # Empty log + safe CoA: approve with a single reasoning line.
        if violation_log.is_empty():
            reasoning_trace.append(
                f"Empty violation log on {violation_log.engine}; "
                f"COA driver_id={coa.driver_id} simultaneity_permitted="
                f"{coa.simultaneity_permitted}. No rules fired."
            )
            return GuardianAudit(
                verdict="approve",
                reasoning_trace=tuple(reasoning_trace),
                audit_id=audit_id,
            )

        rules_by_type: dict[str, list[BYOCRule]] = {}
        for rule in self._rules:
            rules_by_type.setdefault(rule.violation_type, []).append(rule)

        for record in violation_log.records:
            for rule in rules_by_type.get(record.type, []):
                if rule.reasoning_template:
                    reasoning_trace.append(
                        _format_template(rule.reasoning_template, record)
                    )
                if rule.verdict == "flag" and rule.concern_template:
                    flagged_concerns.append(
                        _format_template(rule.concern_template, record)
                    )
                elif rule.verdict == "reject" and rule.block_template:
                    blocked_recommendations.append(
                        _format_template(rule.block_template, record)
                    )
                top_verdict = _max_verdict(top_verdict, rule.verdict)

        if not reasoning_trace:
            reasoning_trace.append(
                f"Violation log on {violation_log.engine} carried "
                f"{len(violation_log.records)} record(s) but no BYOC rule "
                f"matched. Default verdict: approve."
            )

        return GuardianAudit(
            verdict=top_verdict,
            reasoning_trace=tuple(reasoning_trace),
            audit_id=audit_id,
            flagged_concerns=tuple(flagged_concerns),
            blocked_recommendations=tuple(blocked_recommendations),
        )


__all__ = [
    "BYOCRule",
    "DEFAULT_RULE_REGISTRY",
    "Guardian",
]
