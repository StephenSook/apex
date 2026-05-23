"""APEX shared contracts package.

Single source of truth for inter-layer types:
  shapes.py     - canonical (B, 30, 14) tensor contract
  projector.py  - DifferentiableProjector Protocol (V1/V2/qpth/Theseus swap)
  violations.py - PhysicsViolationLog + GuardianAudit + audit_id discipline
"""

from .projector import DifferentiableProjector, PROTOCOL_VERSION
from .shapes import (
    CHANNEL_COUNT,
    CHANNEL_TIER_BINDING,
    CHANNELS,
    HORIZON,
    SCHEMA_VERSION,
    TENSOR_SHAPE,
    channel_index,
)
from .violations import (
    GuardianAudit,
    GuardianVerdict,
    PhysicsViolationLog,
    VIOLATION_TYPES,
    ViolationRecord,
    ViolationType,
    new_audit_id,
    utc_now_iso,
)

__all__ = [
    # shapes
    "CHANNEL_COUNT",
    "CHANNELS",
    "CHANNEL_TIER_BINDING",
    "HORIZON",
    "SCHEMA_VERSION",
    "TENSOR_SHAPE",
    "channel_index",
    # projector
    "DifferentiableProjector",
    "PROTOCOL_VERSION",
    # violations
    "GuardianAudit",
    "GuardianVerdict",
    "PhysicsViolationLog",
    "VIOLATION_TYPES",
    "ViolationRecord",
    "ViolationType",
    "new_audit_id",
    "utc_now_iso",
]
