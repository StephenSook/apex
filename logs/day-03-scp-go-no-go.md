# Day 3 — D-027 SCP Go/No-Go Gate (PASS, Stage C only)

**Date:** 2026-05-23 (Day 3)
**Operator:** Vinh Le
**Hardware:** Windows 11 + Python 3.10.7 + RTX 3060 Ti (8 GB VRAM, CUDA 12.1)
**Gate origin:** decision-log.md D-027 + council v2 staged rewrite (transcript 2026-05-22 v2)

## What this gate is

The single most important checkpoint in the 12-day build per decision-log D-027. Proves that the wave-30 maximal architecture's central technical bet (frozen TSFM forecast + hard differentiable physics-projection composition) actually works on the operator's hardware before any downstream phase invests in scaffolding around it.

Council v2 staged the gate into three substages to decouple risks:
  - **G-0.5** (Day 3 hour 1): TTM-r2 loads + emits (B, 30, 14) on operator hardware
  - **G0.6** (Day 3 hour 2): cvxpylayers imports clean on Windows + README example backward
  - **Stage C** (Day 3 hours 3-6): full forward + projection + backward composition

## Result

**PASS, Stage C only.**

The Day-3 spike used the council v2 reduced spec: single SCP iterate (not 3-iteration unroll) + constant-mu friction ellipse (not 8-tier Pacejka linearization). The 8-tier expansion and 3-iteration unroll move to Day 4 task 2.12 per plan.

```
[1/5] loading TTM-r2 ...
      loaded in 13.61s; context_length=512
[2/5] building TTM input from Sarah stub ...
      stub shape: (1, 10, 14)
      ttm_input shape: (1, 512, 14) requires_grad=True
[3/5] TTM forward pass ...
      forecast shape: (1, 30, 14) in 473.9ms
      pre-projection ||(long_g,lat_g)|| max=0.780 min=0.476
      pre-projection FCVR: 0.0000
[4/5] cvxpylayers friction-ellipse projection ...
      projection took 387.5ms
      post-projection ||(long_g,lat_g)|| max=0.780 min=0.476
      post-projection FCVR: 0.0000
[5/5] backward pass + gradient norm ...
      backward took 170.4ms
      loss = 9.083923
      ||grad_L|| = 24.1191
      grad finite: True
      max |grad_L_i| = 8.430376
```

## Pass criteria check (council v2 Software Lead numeric definitions)

| Criterion | Threshold | Observed | Verdict |
|---|---|---|---|
| Gradient finite | no NaN/Inf anywhere | True | PASS |
| Gradient norm bounded | `‖∇L‖ < 1e4` | 24.12 | PASS |
| FCVR on Sarah stub | `<= 0.0` | 0.000000 | PASS |
| TTM output shape | `(1, 30, 14)` per shapes.py | `(1, 30, 14)` | PASS |
| cvxpylayers DPP-compliance | `prob.is_dpp() == True` | asserted in code | PASS |

## Why FCVR was already 0 pre-projection

Sarah stub data are physically realistic (peak `‖(long_g, lat_g)‖ ≈ 0.78 g` during cornering, well inside the mu=1.2 ellipse). The projection layer is exercising the differentiable solve, not actually correcting violations. That is the intended Stage C behavior: gradient flow is the load-bearing claim. Real violation-correction tests live at Phase 2 task 2.6 (G3 — V1 NumPy validator catches 5 impossibilities).

## Findings

1. **The wave-30 maximal architecture's central bet works on Vinh's hardware.** Frozen TTM-r2 forecast composed with cvxpylayers differentiable projection produces a finite, well-bounded gradient through the entire composition. The "kinetic hallucination" thesis (per D-A original framing) is implementable, not just paper-grade hand-waving.

2. **Total wall-clock of the composed forward + projection + backward ≈ 1.03s** on RTX 3060 Ti. Leaves ~13.97s of the G8 15s coaching-report sub-budget for downstream stages (Granite Instruct narration + Guardian audit + provenance assembly).

3. **One install gotcha caught en route:** pyarrow 24.0.0 had a Windows DLL access violation that hit `tsfm_public` -> `pandas` -> `pyarrow` on script-level imports (G-0.5 isolated test missed it because of import order). Downgraded to pyarrow 21.0.0, re-pinned in `app/backend/requirements.txt`. Single-line fix; no architectural impact.

4. **Pre-committed de-scope rung 1 (cut three-track ensemble FlowState + Chronos-2) does NOT fire.** Stage C passed cleanly. Three-track ensemble stays on the roadmap. Day-4 work proceeds as planned.

## Day-4 work this unblocks (per plan task 2.12)

- Expand the projection from constant-mu single-step to 8-tier Pacejka linearization (D-015 tier integration)
- Expand from single SCP iterate to 3-iteration unrolled SCP per D-012
- Add Tikhonov damping (epsilon = 0.5 m/s) + tanh saturation per D-014 for the v_x near-zero singularity

## Cross-references

- `app/backend/apex/physics/scp_spike.py` — the spike implementation
- `app/backend/apex/shared/contracts/shapes.py` — canonical TENSOR_SHAPE source
- `app/backend/apex/shared/contracts/projector.py` — DifferentiableProjector Protocol (swap seam)
- `fixtures/personas/sarah-reynolds-telemetry-stub.csv` — input fixture
- `docs/decision-log.md` D-027 — gate origin + fallback ladder (not invoked)
- `docs/vinh-backend-plan.md` Phase 0 task 0.5 — the staged gate row
- `council-transcript-20260522-vinh-backend-plan-v2.md` — chairman synthesis behind the staged rewrite
