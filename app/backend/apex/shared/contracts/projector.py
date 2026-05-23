"""DifferentiableProjector Protocol — exit ramp for the cvxpylayers lock.

Per council v2 chairman synthesis + Long-Term Architect (transcript v2):
D-013 hard-locks cvxpylayers as the differentiable optimization layer, but
the only fallback baked into the plan was "ship V1 NumPy as floor + paper
cites canonical QP" — that's paper-survival, not code-survival. If
cvxpylayers' latency turns out unacceptable on heterogeneous hardware in
6 months, or if a future contributor wants to evaluate qpth / theseus,
there's no swap seam.

This Protocol is the seam. Any module that takes "a thing that projects a
forecast onto the physics-feasible set with differentiable backward" should
type-hint against DifferentiableProjector, not against a concrete class.
The four candidates the project might swap between:

  - NumpyForwardProjector  (V1, no backward; differentiable=False)
  - CvxpyLayersProjector   (V2, locked per D-013)
  - QpthProjector          (rejected by D-013 but future-portable)
  - TheseusProjector       (rejected by D-013 but future-portable)

Cost: ~30 minutes Day 3. Saves months of refactor if D-013 is ever revisited.
This is the single highest-ROI architectural decision flagged by the council.
"""

from __future__ import annotations

from typing import Final, Protocol, runtime_checkable

# Re-export shape constants so projector consumers only need to import this module.
from .shapes import CHANNEL_COUNT, HORIZON, TENSOR_SHAPE


@runtime_checkable
class DifferentiableProjector(Protocol):
    """Projects a forecast tensor onto the physics-feasible set.

    Implementations:
      - May or may not be differentiable (set is_differentiable accordingly).
      - MUST preserve the (B, 30, 14) shape end-to-end.
      - MUST emit a PhysicsViolationLog (defined later in shared.contracts) per
        forecast step that hit a constraint boundary.
      - MUST be deterministic given the same input tensor and same constraint
        parameters (vehicle mass, wheelbase, mu nominal, etc).

    The Protocol is intentionally minimal. Concrete classes own their own
    constraint-parameter constructor + numerical-hazard handling (Tikhonov
    damping per D-014, stiff-ODE steady-state substitution per D-014).
    """

    is_differentiable: bool
    """True if .backward() can flow through this projector (V2 cvxpylayers,
    future qpth, future theseus). False for V1 NumPy floor. Consumers gate
    end-to-end-backprop attempts on this flag.
    """

    def project(self, forecast: "Tensor") -> "ProjectionResult":  # noqa: F821
        """Project `forecast` of shape TENSOR_SHAPE onto the feasible set.

        Returns a ProjectionResult containing (corrected_tensor, violation_log).
        corrected_tensor preserves TENSOR_SHAPE. violation_log is per-step.
        Implementations type-hint `forecast` with their concrete tensor type
        (torch.Tensor for V2, numpy.ndarray for V1) at the implementation site;
        this Protocol uses a string forward-ref to avoid forcing a torch import
        on consumers who only need the type contract.
        """
        ...


PROTOCOL_VERSION: Final[str] = "0.1.0"
"""Bumps when the Protocol signature changes (method add/remove, return type
shift). Distinct from shapes.SCHEMA_VERSION which versions the tensor channel
meanings; PROTOCOL_VERSION versions the projector API surface.
"""


__all__ = [
    "CHANNEL_COUNT",
    "DifferentiableProjector",
    "HORIZON",
    "PROTOCOL_VERSION",
    "TENSOR_SHAPE",
]
