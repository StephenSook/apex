"""physics-tsfm v0.1.0a1: physics-projected forecasts for IBM Granite TimeSeries TTM.

APEX-Bench v0.0.1-preview supporting library. Re-exports the
load-bearing engine-agnostic contracts from the APEX repository
(`app/backend/apex/shared/contracts/`) under a stable downstream
import path so the NeurIPS Workshop paper at
`paper/apex-neurips-workshop-2026.md` can cite a versioned,
pip-installable carve-out.

Status: alpha. Public release governance lands at Day-13+ post-
hackathon-submission per D-050.
"""

from __future__ import annotations

# The carve-out re-exports the canonical types from the APEX backend.
# Local-dev workflow: run `pip install -e .` in the APEX repo root or
# add `app/backend/` to PYTHONPATH so the re-export resolves.
try:
    from apex.shared.contracts import (
        CHANNEL_COUNT,
        CHANNEL_TIER_BINDING,
        CHANNELS,
        DifferentiableProjector,
        GuardianAudit,
        GuardianVerdict,
        HORIZON,
        PROTOCOL_VERSION,
        PhysicsViolationLog,
        ProjectionResult,
        SCHEMA_VERSION,
        TENSOR_SHAPE,
        VIOLATION_TYPES,
        ViolationRecord,
        ViolationType,
        build_ttm_input,
        channel_index,
        new_audit_id,
        utc_now_iso,
    )
except ImportError as exc:
    # Surfaced for downstream users so they get a clear message rather
    # than an opaque ImportError trace.
    raise ImportError(
        "physics-tsfm requires the APEX backend on PYTHONPATH. "
        "For local dev: add app/backend/ to PYTHONPATH or pip install "
        "the APEX repo root in editable mode. "
        "TestPyPI dist will inline the apex.shared.contracts module "
        "in a future release; the alpha publishes the carve-out "
        "as a thin re-export."
    ) from exc

__version__ = "0.1.0a1"

__all__ = [
    "CHANNEL_COUNT",
    "CHANNELS",
    "CHANNEL_TIER_BINDING",
    "DifferentiableProjector",
    "GuardianAudit",
    "GuardianVerdict",
    "HORIZON",
    "PROTOCOL_VERSION",
    "PhysicsViolationLog",
    "ProjectionResult",
    "SCHEMA_VERSION",
    "TENSOR_SHAPE",
    "VIOLATION_TYPES",
    "ViolationRecord",
    "ViolationType",
    "__version__",
    "build_ttm_input",
    "channel_index",
    "new_audit_id",
    "utc_now_iso",
]
