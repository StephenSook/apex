"""D-027 Stage C SCP spike (Phase 0 task 0.5, council v2 staged).

What this proves: gradient flow through TTM-r2 forecast -> cvxpylayers
friction-ellipse projection -> scalar loss -> .backward(). Single SCP
iterate, constant-mu (NOT 8-tier Pacejka), no trust-region. 8-tier
linearization and 3-iteration unroll move to Day 4 task 2.12 if Stage C
passes; cut to V1 NumPy floor if Stage C fails.

Pass criteria (council v2 numeric definition):
  - Forward pass completes without NaN/Inf
  - ||grad_L|| < 1e4 (finite + below "oscillating" threshold)
  - FCVR = 0.00 on the Sarah stub (every projected step inside the
    feasible set: long_g**2 + lat_g**2 <= (mu * g)**2)

Fail criteria ("oscillates"):
  - NaN/Inf anywhere
  - ||grad_L|| >= 1e4
  - residual non-decrease over 2 consecutive iterates (single-iterate
    here, so this clause activates only at Day 4 when we add unroll)

Run:
  cd <repo root>
  app/backend/.venv/Scripts/python.exe -u app/backend/apex/physics/scp_spike.py
"""

from __future__ import annotations

import csv
import sys
import time
from pathlib import Path

import torch

# Make apex.* importable when running this file directly from the repo root.
REPO_ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(REPO_ROOT / "app" / "backend"))

from apex.shared.contracts import CHANNELS, CHANNEL_COUNT, HORIZON, channel_index  # noqa: E402

# Physics constants for the constant-mu friction ellipse.
MU_NOMINAL = 1.2          # nominal grip coefficient (single-tier; D-015 Tier 7 swaps later)
G = 9.81                  # m/s^2
GRIP_LIMIT_G = MU_NOMINAL  # in g-units the ellipse is the circle a_long^2 + a_lat^2 <= mu^2

# Pass-criterion thresholds (council v2 Software Lead).
GRAD_NORM_OSCILLATES_AT = 1e4
FCVR_TARGET = 0.0


def load_sarah_stub() -> torch.Tensor:
    """Load the 10-row Sarah Reynolds stub as a (1, 10, 14) float tensor.

    Returns the tensor in CHANNELS column order. Tile/repeat happens at
    the TTM input adapter, not here.
    """
    csv_path = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-telemetry-stub.csv"
    with csv_path.open() as f:
        lines = [line for line in f if not line.startswith("#")]
    reader = csv.DictReader(lines)
    header = reader.fieldnames
    assert tuple(header) == CHANNELS, (
        f"Sarah stub column order {header} != shapes.py CHANNELS contract"
    )
    rows = [[float(r[c]) for c in CHANNELS] for r in reader]
    t = torch.tensor(rows, dtype=torch.float32).unsqueeze(0)  # (1, 10, 14)
    return t


def pad_to_context(x: torch.Tensor, context_length: int) -> torch.Tensor:
    """Pad a (B, T<context, 14) tensor to (B, context, 14) by edge-replicating
    the first row (TTM-r2 expects 512 timesteps of history).

    Edge replication is a defensible pad for a hackathon spike: it preserves
    the channel statistics and avoids zero-imputation discontinuities. Real
    fixtures (Phase 3 task 3.2) provide >512 actual timesteps; this stub is
    just for the gradient-flow proof.
    """
    B, T, C = x.shape
    if T >= context_length:
        return x[:, -context_length:, :]
    front = x[:, :1, :].expand(B, context_length - T, C)
    return torch.cat([front, x], dim=1)


def build_friction_ellipse_projector():
    """Build the cvxpylayers projection: project per-step (a_long, a_lat) onto
    the constant-mu ellipse (here a circle of radius mu in g-units).

    Returns a callable layer(a_in: (N, 2)) -> (N, 2) projected_g_pair.

    Why this shape: the SCP solver decouples horizon-step independence by
    projecting each timestep's (long_g, lat_g) pair separately. Stage C uses
    the single-step formulation; Day 4 task 2.12 will batch this into a
    joint QP across all 30 horizon steps with cross-step kinematic coupling.
    """
    import cvxpy as cp
    from cvxpylayers.torch import CvxpyLayer

    a_in = cp.Parameter(2)          # observed (long_g, lat_g) from TTM forecast
    a_out = cp.Variable(2)          # projected feasible pair
    constraints = [cp.norm(a_out, 2) <= GRIP_LIMIT_G]
    objective = cp.Minimize(cp.sum_squares(a_out - a_in))
    prob = cp.Problem(objective, constraints)
    assert prob.is_dpp(), "Friction-ellipse projection must be DPP for cvxpylayers"
    layer = CvxpyLayer(prob, parameters=[a_in], variables=[a_out])
    return layer


def fcvr(g_pairs: torch.Tensor, tol: float = 1e-4) -> float:
    """Forecast Constraint Violation Rate: fraction of (long_g, lat_g) steps
    where sqrt(long_g^2 + lat_g^2) exceeds the friction-ellipse boundary.

    A projection layer that is doing its job emits an output with FCVR ~= 0.
    """
    norms = torch.linalg.vector_norm(g_pairs, dim=-1)
    violations = (norms > GRIP_LIMIT_G + tol).float()
    return violations.mean().item()


def main() -> int:
    print("=" * 72)
    print("D-027 Stage C SCP spike (Phase 0 task 0.5, council v2 staged)")
    print("=" * 72)
    print(f"device: {'cuda:0 ' + torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'cpu'}")
    print(f"mu_nominal: {MU_NOMINAL}, grip_limit_g: {GRIP_LIMIT_G}")
    print(f"target shape: (B, {HORIZON}, {CHANNEL_COUNT})")
    print(f"gradient oscillates-at threshold: {GRAD_NORM_OSCILLATES_AT}")
    print(f"FCVR target: {FCVR_TARGET}")
    print()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # ---- Load TTM-r2 -----------------------------------------------------
    print("[1/5] loading TTM-r2 ...")
    t0 = time.time()
    from tsfm_public import TinyTimeMixerForPrediction
    model = TinyTimeMixerForPrediction.from_pretrained(
        "ibm-granite/granite-timeseries-ttm-r2",
        num_input_channels=CHANNEL_COUNT,
        prediction_filter_length=HORIZON,
    ).to(device).eval()
    print(f"      loaded in {time.time()-t0:.2f}s; context_length={model.config.context_length}")

    # ---- Build TTM input from Sarah stub --------------------------------
    print("[2/5] building TTM input from Sarah stub ...")
    sarah = load_sarah_stub().to(device)
    print(f"      stub shape: {tuple(sarah.shape)}")
    ttm_input = pad_to_context(sarah, model.config.context_length)
    # Make input require grad so we can call .backward through TTM as well.
    ttm_input = ttm_input.detach().clone().requires_grad_(True)
    print(f"      ttm_input shape: {tuple(ttm_input.shape)} requires_grad={ttm_input.requires_grad}")

    # ---- TTM forward ----------------------------------------------------
    print("[3/5] TTM forward pass ...")
    t0 = time.time()
    out = model(past_values=ttm_input)
    forecast = out.prediction_outputs  # (B, 30, 14)
    print(f"      forecast shape: {tuple(forecast.shape)} in {(time.time()-t0)*1000:.1f}ms")
    assert tuple(forecast.shape) == (1, HORIZON, CHANNEL_COUNT), (
        f"TTM output shape {tuple(forecast.shape)} violates shapes.py contract"
    )

    long_idx = channel_index("long_g")
    lat_idx = channel_index("lat_g")
    g_pairs_raw = torch.stack(
        [forecast[:, :, long_idx], forecast[:, :, lat_idx]], dim=-1
    )  # (1, 30, 2)

    pre_norms = torch.linalg.vector_norm(g_pairs_raw, dim=-1)
    pre_fcvr = fcvr(g_pairs_raw)
    print(f"      pre-projection ||(long_g,lat_g)|| max={pre_norms.max().item():.3f} min={pre_norms.min().item():.3f}")
    print(f"      pre-projection FCVR: {pre_fcvr:.4f}")

    # ---- cvxpylayers projection (single SCP iterate, constant-mu) -------
    print("[4/5] cvxpylayers friction-ellipse projection ...")
    layer = build_friction_ellipse_projector()
    # cvxpylayers expects (N, 2) for a vector parameter; flatten over (B, H).
    pairs_flat = g_pairs_raw.reshape(-1, 2)  # (30, 2)
    t0 = time.time()
    (projected_flat,) = layer(pairs_flat)
    projected = projected_flat.reshape(1, HORIZON, 2)
    print(f"      projection took {(time.time()-t0)*1000:.1f}ms")
    post_fcvr = fcvr(projected)
    post_norms = torch.linalg.vector_norm(projected, dim=-1)
    print(f"      post-projection ||(long_g,lat_g)|| max={post_norms.max().item():.3f} min={post_norms.min().item():.3f}")
    print(f"      post-projection FCVR: {post_fcvr:.4f}")

    # ---- Backward + gradient norm ---------------------------------------
    print("[5/5] backward pass + gradient norm ...")
    # Use sum-of-squares of the projected pair as the scalar loss; this is a
    # smooth function with non-trivial gradient through both the projection
    # and the TTM forward. If gradient flows here, it flows through both.
    loss = (projected ** 2).sum()
    t0 = time.time()
    loss.backward()
    print(f"      backward took {(time.time()-t0)*1000:.1f}ms")
    grad = ttm_input.grad
    assert grad is not None, "Gradient did not propagate to ttm_input"
    grad_norm = torch.linalg.vector_norm(grad).item()
    grad_finite = bool(torch.isfinite(grad).all())
    grad_max_abs = grad.abs().max().item()
    print(f"      loss = {loss.item():.6f}")
    print(f"      ||grad_L|| = {grad_norm:.4f}")
    print(f"      grad finite: {grad_finite}")
    print(f"      max |grad_L_i| = {grad_max_abs:.6f}")

    # ---- Verdict --------------------------------------------------------
    print()
    print("=" * 72)
    pass_grad = grad_finite and grad_norm < GRAD_NORM_OSCILLATES_AT
    pass_fcvr = post_fcvr <= FCVR_TARGET + 1e-6
    verdict = pass_grad and pass_fcvr
    print(f"VERDICT: {'PASS' if verdict else 'FAIL'}")
    print(f"  grad finite + ||grad|| < {GRAD_NORM_OSCILLATES_AT}: {pass_grad}")
    print(f"  FCVR <= {FCVR_TARGET}: {pass_fcvr} (got {post_fcvr:.6f})")
    print("=" * 72)
    return 0 if verdict else 1


if __name__ == "__main__":
    sys.exit(main())
