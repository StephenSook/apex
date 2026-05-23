"""Inter-layer data contracts: violation records, log, guardian audit.

Single source of truth for the types that flow physics-layer -> serializer
-> Guardian audit -> narrator -> provenance footer. Every module on that
chain imports from here; never redefines.

Engine-agnostic by construction (council v2 Long-Term Architect load-bearing
wall #2): the V1 NumPy validator and the V2 cvxpylayers projector both emit
`PhysicsViolationLog` instances, and `PhysicsViolationLog.to_text()` produces
byte-identical strings for the same `ViolationRecord` content regardless of
which engine produced it. This lets D-A survive a V2 cut: the paper §3.2
canonical-engine framing remains honest because V1 and V2 emit the same
violation text on the same fixture.

Convergence-14 floor (council v2 chairman + plan task 2.6b): round-trip
serializer assertion. `record.to_text()` then `ViolationRecord.from_text()`
returns an equal record; running `.to_text()` twice on the same record
produces byte-identical output. Tested in
app/backend/tests/test_serializer.py.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Final, Literal


# ---- Violation type taxonomy (Convergence-14) --------------------------
# 14 kinematic violation types per the Convergence-14 expansion (G3 floor at
# 5 types Day 4, G7-adjacent task 4.2 expands to 14). Each type binds to a
# wave-30 D-015 physics tier. Tier 0 is COA-derived; Tiers 1-8 are physics.

ViolationType = Literal[
    "friction_ellipse_exceeded",   # Tier 7 Pacejka combined-slip
    "forward_euler_inconsistent",  # Tier 8 kinematic (Δv vs long_g over Δt)
    "bicycle_kinematic_break",     # Tier 8 kinematic (lat_g vs steering * v)
    "coa_simultaneity_violation",  # Tier 0 COA-derived brake+throttle overlap
    "jerk_bound_exceeded",         # Tier 8 kinematic (D-011 frequency caveat)
    "tire_load_negative",          # Tier 4 double-track load-transfer
    "tire_thermal_diverged",       # Tier 5 thermal model
    "yaw_rate_kinematic_break",    # Tier 8 (omega vs steering * v / wheelbase)
    "speed_below_pit_minimum",     # Tier 8 (v_x near-zero singularity per D-014)
    "track_geometry_oob",          # Tier 1 3D track-frame (pitch/bank OOB)
    "gear_ratio_inconsistent",     # vehicle-dynamics consistency (RPM vs v_x)
    "aerodynamic_load_inverted",   # Tier 6 (downforce sign at v_x)
    "lateral_load_transfer_oob",   # Tier 4
    "longitudinal_load_transfer_oob",  # Tier 4
]
"""14 violation types covered by the Convergence-14 serializer suite."""

VIOLATION_TYPES: Final[tuple[str, ...]] = (
    "friction_ellipse_exceeded",
    "forward_euler_inconsistent",
    "bicycle_kinematic_break",
    "coa_simultaneity_violation",
    "jerk_bound_exceeded",
    "tire_load_negative",
    "tire_thermal_diverged",
    "yaw_rate_kinematic_break",
    "speed_below_pit_minimum",
    "track_geometry_oob",
    "gear_ratio_inconsistent",
    "aerodynamic_load_inverted",
    "lateral_load_transfer_oob",
    "longitudinal_load_transfer_oob",
)
assert len(VIOLATION_TYPES) == 14, "Convergence-14 must enumerate 14 types"


# ---- ViolationRecord: one row of the log --------------------------------

@dataclass(frozen=True)
class ViolationRecord:
    """One violation at one forecast step.

    Frozen so a ViolationRecord cannot mutate between emission and audit.
    Equality is structural so round-trip serializer tests can use ==.

    Field order is the serialization order; `to_text()` writes fields in
    declaration order, `from_text()` parses them back in the same order.
    Reordering fields here is a SCHEMA_VERSION bump per shapes.py policy.
    """

    step: int                       # forecast horizon step index (0..29)
    type: ViolationType             # one of VIOLATION_TYPES
    severity: float                 # how far past the constraint boundary (>= 0)
    channel_values: dict[str, float]  # subset of CHANNELS at this step
    tier: int                       # wave-30 D-015 tier this violation hit


# ---- PhysicsViolationLog: ordered list per forecast --------------------

@dataclass
class PhysicsViolationLog:
    """The full per-forecast violation log emitted by validator or projector.

    Engine-agnostic by design. V1 NumPy validator and V2 cvxpylayers projector
    both emit this exact type. `.to_text()` is the load-bearing serializer
    the Guardian BYOC audit consumes; identical input must produce
    byte-identical text regardless of which engine produced the records.

    Empty log == no violations == FCVR contribution of 0 for this forecast.
    """

    records: list[ViolationRecord] = field(default_factory=list)
    forecast_step_count: int = 30   # HORIZON from shapes.py; redundant for audit
    engine: Literal["v1_numpy", "v2_cvxpylayers", "v2_scp_unrolled"] = "v1_numpy"

    def is_empty(self) -> bool:
        return len(self.records) == 0

    def fcvr(self) -> float:
        """Forecast Constraint Violation Rate: fraction of horizon steps with
        at least one violation. Matches the metric scp_spike.py computed at
        the friction-ellipse level for the D-027 gate.
        """
        if self.forecast_step_count == 0:
            return 0.0
        violated_steps = {r.step for r in self.records}
        return len(violated_steps) / self.forecast_step_count

    def to_text(self) -> str:
        """Deterministic, engine-agnostic serialization.

        Format is line-oriented for easy diffing in golden-fixture tests:
          ENGINE v1_numpy
          STEPS 30
          # records sorted by (step, type, tier) for byte-determinism
          R step=03 type=friction_ellipse_exceeded tier=7 severity=0.1234 ch=long_g:1.310,lat_g:0.420
          ...

        Channel-value subsets serialize with keys sorted alphabetically;
        floats use 4-decimal precision (golden-fixture stability).
        """
        sorted_records = sorted(
            self.records, key=lambda r: (r.step, r.type, r.tier)
        )
        lines = [f"ENGINE {self.engine}", f"STEPS {self.forecast_step_count}"]
        for r in sorted_records:
            ch_text = ",".join(
                f"{k}:{v:.4f}" for k, v in sorted(r.channel_values.items())
            )
            lines.append(
                f"R step={r.step:02d} type={r.type} tier={r.tier} "
                f"severity={r.severity:.4f} ch={ch_text}"
            )
        return "\n".join(lines) + "\n"


# ---- GuardianAudit: BYOC audit verdict + provenance --------------------

GuardianVerdict = Literal["SAFE", "REVIEW", "BLOCK"]


@dataclass(frozen=True)
class GuardianAudit:
    """Granite Guardian 4.1 BYOC custom-rules audit verdict.

    `audit_id` is set ONCE at Guardian.audit() entry via `uuid4()`, never
    None per council v2 Software Lead fix #9. The provenance footer
    (Phase 3 task 3.6) asserts non-None on this field; Phase 3 task 3.6b
    is the contract test.

    `physics_confidence` is the Mahalanobis-distance detector output from
    D-024 (Phase 2 task G5.5 / G6.5): low confidence -> Guardian downgrades
    SAFE to REVIEW even if the violation log is empty, because the physics
    model is not trustworthy on this session's telemetry distribution.
    """

    audit_id: str                           # uuid4 hex string; never empty
    verdict: GuardianVerdict
    reasoning: str                          # think-mode trace for UI surface
    triggered_rules: tuple[str, ...]        # subset of BYOC rule IDs
    physics_confidence: float | None        # D-024 Mahalanobis detector output
    audited_at_iso: str                     # ISO 8601 UTC timestamp


def new_audit_id() -> str:
    """Generate a fresh audit_id at Guardian.audit() entry.

    Centralized here so the next contributor cannot accidentally use a
    different ID scheme; provenance footer + log lines + UI all
    correlate via this single producer.
    """
    return uuid.uuid4().hex


def utc_now_iso() -> str:
    """Audit timestamp helper.

    Use ISO 8601 UTC with seconds precision so log lines sort lexicographically.
    """
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


__all__ = [
    "GuardianAudit",
    "GuardianVerdict",
    "PhysicsViolationLog",
    "VIOLATION_TYPES",
    "ViolationRecord",
    "ViolationType",
    "new_audit_id",
    "utc_now_iso",
]
