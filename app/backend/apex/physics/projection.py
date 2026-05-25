"""V2 cvxpylayers differentiable physics projector (Phase 2 Day 5 task 2.12).

Production class form of the D-027 Stage C SCP spike (Phase 0 task 0.5;
logs/day-03-scp-go-no-go.md). Same constant-mu friction ellipse, same
per-step decoupled formulation, same DPP-compliant cvxpy problem;
now wrapped behind the DifferentiableProjector Protocol so V1 NumPy
floor and V2 cvxpylayers ceiling swap at any caller (V1 is a future
implementation; V2 ships now).

Engine-agnostic boundary (Long-Term Architect load-bearing wall #2):
this projector emits the same `PhysicsViolationLog` schema the V1
validator emits, with `engine="v2_cvxpylayers"`. The violation_log
.to_text() output is byte-identical to V1's friction_ellipse_check
.to_text() on the same step-and-channel content; the engine string is
the only intentional difference. Cross-engine type + step parity is
covered in tests/test_physics_v2.py.

Staged scope per D-031:
  - Constant-mu friction ellipse single iterate: ships now (this file).
  - 8-tier Pacejka linearization: deferred to projection_pacejka.py.
  - 3-iteration SCP unroll: deferred to projection_scp.py.

If the staged ladder rungs are not reached by Day 5 EOD, plan task
2.13 explicitly allows V1 NumPy floor as the ship-version; D-A still
holds because the violation strings are engine-agnostic and the
NeurIPS paper §3.2 canonical-engine framing remains honest.
"""

from __future__ import annotations

from typing import Final

import torch

from apex.shared.contracts import (
    CHANNEL_COUNT,
    HORIZON,
    PhysicsViolationLog,
    ProjectionResult,
    ViolationRecord,
    channel_index,
)

DEFAULT_MU: Final[float] = 1.2
"""Nominal grip coefficient for the demo. Tier-5 thermal + Tier-7 Pacejka
expansion (D-015) overrides this per step in projection_pacejka.py."""

DEFAULT_TOLERANCE: Final[float] = 1e-3
"""Solver-output tolerance: a corrected step whose norm exceeds mu by less
than this still counts as inside the feasible set. Matches the spike's
fcvr() tolerance at scp_spike.py L117."""


class CvxpyLayersProjector:
    """Differentiable projection onto the constant-mu friction ellipse.

    The projection solves, per horizon step:
        min || a_out - a_in ||_2^2
        s.t. || a_out ||_2 <= mu

    where `a_in = (long_g, lat_g)` from the upstream forecast and `a_out`
    is the projected feasible pair. `a_in` is a cp.Parameter; `a_out` is
    a cp.Variable; cvxpylayers wraps the resulting cp.Problem in a
    torch.nn.Module so .backward() flows through the QP solve.

    The cvxpy problem is built once at __init__ and reused across calls;
    only the parameter values change per forecast (DPP discipline).
    """

    is_differentiable: bool = True

    def __init__(
        self,
        *,
        mu: float = DEFAULT_MU,
        tolerance: float = DEFAULT_TOLERANCE,
    ):
        import cvxpy as cp
        from cvxpylayers.torch import CvxpyLayer

        self.mu = float(mu)
        self.tolerance = float(tolerance)

        a_in = cp.Parameter(2)
        a_out = cp.Variable(2)
        constraints = [cp.norm(a_out, 2) <= self.mu]
        objective = cp.Minimize(cp.sum_squares(a_out - a_in))
        prob = cp.Problem(objective, constraints)
        assert prob.is_dpp(), (
            "friction-ellipse projection must be DPP for cvxpylayers"
        )
        self._layer = CvxpyLayer(prob, parameters=[a_in], variables=[a_out])

    def project(self, forecast: torch.Tensor) -> ProjectionResult:
        """Project `forecast` of shape (B, HORIZON, CHANNEL_COUNT) onto the
        per-step friction ellipse.

        Returns ProjectionResult(corrected_tensor, violation_log) where
        corrected_tensor preserves the input shape + dtype + device, and
        violation_log carries one ViolationRecord per step whose
        pre-projection (long_g, lat_g) norm exceeded `mu` + tolerance.
        """
        if forecast.ndim != 3 or forecast.shape[1] != HORIZON or forecast.shape[2] != CHANNEL_COUNT:
            raise ValueError(
                f"CvxpyLayersProjector.project expects shape (B, {HORIZON}, "
                f"{CHANNEL_COUNT}); got {tuple(forecast.shape)}"
            )

        long_idx = channel_index("long_g")
        lat_idx = channel_index("lat_g")

        # Per-step pair extraction: (B, H, 2)
        pairs = torch.stack(
            [forecast[:, :, long_idx], forecast[:, :, lat_idx]], dim=-1
        )

        # cvxpylayers expects (N, 2); flatten over (B, H) then unflatten.
        B, H, _ = pairs.shape
        pairs_flat = pairs.reshape(B * H, 2)
        (projected_flat,) = self._layer(pairs_flat)
        projected = projected_flat.reshape(B, H, 2)

        # Recompose the corrected tensor channel-by-channel so the long_g
        # and lat_g channels carry the projection's grad-fn while every
        # other channel passes through untouched. In-place overwrite of
        # a clone would silently detach those slots from autograd; the
        # unbind + stack route keeps the graph intact.
        channels = list(torch.unbind(forecast, dim=-1))
        channels[long_idx] = projected[:, :, 0]
        channels[lat_idx] = projected[:, :, 1]
        corrected = torch.stack(channels, dim=-1)

        # Build violation log from pre-projection norms.
        pre_norms = torch.linalg.vector_norm(pairs, dim=-1)  # (B, H)
        records: list[ViolationRecord] = []
        # We log only batch index 0's violations into a single log
        # because PhysicsViolationLog is per-forecast, not per-batch.
        # Multi-batch projection is supported numerically but the log
        # surface assumes B=1 (the V1 validator + Day-5 narrator path).
        for step in range(H):
            norm = pre_norms[0, step].item()
            if norm > self.mu + self.tolerance:
                records.append(
                    ViolationRecord(
                        step=int(step),
                        type="friction_ellipse_exceeded",
                        severity=float(norm - self.mu),
                        channel_values={
                            "long_g": float(pairs[0, step, 0].item()),
                            "lat_g": float(pairs[0, step, 1].item()),
                        },
                        tier=7,
                    )
                )

        log = PhysicsViolationLog(
            records=records,
            forecast_step_count=int(H),
            engine="v2_cvxpylayers",
        )
        return ProjectionResult(corrected_tensor=corrected, violation_log=log)


__all__ = ["CvxpyLayersProjector", "DEFAULT_MU", "DEFAULT_TOLERANCE"]
