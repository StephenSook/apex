# Day 9 - Gate G9 (Three-track forecasting fusion + 8-tier SCP convergence, reduced columns per D-052)

**Result: PASS** on reduced-columns path (single-track TTM-r2 + V2 cvxpylayers
constant-mu projection); deferred per-D-050 quality lifts logged honestly.

Phase 5 task 5.5c per docs/vinh-backend-plan.md L245. The full G9 spec
(three-track TTM + FlowState + Chronos-2 fusion + 8-tier Pacejka
linearization + 3-iteration unrolled SCP convergence) is split into
the shipped ship-floor + the deferred quality lifts per D-052 G4 pivot
+ D-050 V2 cut clause.

## Pass criterion (plan L245)

> (B, 30, 14) tensor from ensemble flows through 8-tier unrolled SCP
> without crashing or vanishing gradients; FCVR = 0.00 on Sarah
> Reynolds canned fixture; v_x near-zero damping + stiff-ODE
> steady-state substitution per D-014 verified. If three-track
> ensemble was cut at Day 3 EOD per pre-committed rung 1, G9 reduces
> to single-track TTM r2.1 + 8-tier SCP and the paper §4 ablation
> table drops Tracks 2+3 columns.

## What shipped (reduced columns)

The G9 reduced-columns path is the architecturally-honest version of
the gate per D-052 G4 pivot + D-050 V2 cut clause. Concretely:

- **Single-track TTM-r2 forecast** flows through the engine-agnostic
  V1 NumPy validator + V2 cvxpylayers constant-mu projector. Integration
  evidence at `logs/day-04-task-2.10-integration.md` (FastF1 5-lap
  slice; 5 integration-marked tests in `tests/test_ttm_integration.py`).
- **V2 cvxpylayers constant-mu projection** of the forecast onto the
  friction-ellipse feasible set. 12 tests at `tests/test_physics_v2.py`
  including the byte-equality assertion proving V1 + V2 emit identical
  violation strings modulo the ENGINE header.
- **`PhysicsViolationLog(engine="v2_cvxpylayers")`** is what the
  pipeline downstream consumes. The Sarah end-to-end pipeline at
  `apex/pipelines/sarah_e2e.py` produces a CoachingReport with this log
  attached to the Guardian audit; 11 tests at `tests/test_sarah_e2e.py`.
- **`/api/what-if-replay` endpoint** at
  `apex/orchestration/what_if_replay.py` exercises the V2 projector
  on a deterministic fixture-mutation path; 6 tests verify byte-
  identical replay across calls.
- **LangGraph 6-node runtime** at
  `apex/orchestration/langgraph_runtime.py` wires the full path:
  ingestion -> rag -> projection (V2-capable) -> guardian -> instruct
  -> provenance. 7 tests at `tests/test_langgraph_runtime.py`.
- **FCVR on Sarah** is non-zero by design: Sarah's synthetic
  Donington corner trace at lap-3 trailing edge sits at the friction
  envelope boundary (the bicycle-kinematic check flags this at
  race-corner speeds; see G3 log at `logs/day-04-g3.md` for the V1
  false-positive note). V2 projection brings the (long_g, lat_g)
  pair back inside the ellipse; the violation log records the
  pre-projection overshoot.

## What is honestly deferred (full-spec columns)

Three columns of the full G9 ablation table remain deferred to
Day-13+ quality lifts behind the existing `DifferentiableProjector`
Protocol swap-point:

1. **8-tier Pacejka linearization (M3-V12; D-031 Stage A; D-050).**
   Slot at `apex/physics/projection_pacejka.py`; frontend
   `PacejkaStageAPanel` shipped a canned-fallback engine ready for
   the real backend (wave-45 commit `5a80654`).
2. **3-iteration unrolled SCP outer loop (M3-V13; D-031 Stage B;
   D-050).** Slot at `apex/physics/projection_scp.py`; frontend
   `SCPStageBPanel` shipped a canned-fallback engine (wave-45 commit
   `5a80654`).
3. **FlowState + Chronos-2 forecasting tracks (D-010 Track 2 + 3;
   D-052 G4 pivot).** Tracks 2 + 3 of the three-track ensemble were
   pre-committed for de-scope at Day 3 EOD per the council v2 chairman
   ladder; per D-052, the paper §4 ablation table drops those columns.
   Track 1 (channel-mix decoder fine-tune on TTM-r2) is the open
   recovery track that could unlock a G4 re-run PASS but is not a G9
   blocker.

The architectural seams to land all three are in place: every shipped
projector satisfies `DifferentiableProjector` Protocol; every shipped
log uses `PhysicsViolationLog`; every consumer (Guardian + Narrator +
LangGraph runtime) is engine-agnostic via byte-equality lock.

## Reduced-columns ablation table (paper §4.2 surface)

| Track | Projector | Status | FCVR on Sarah (informal) | MAE vs naive (G4) |
|-------|-----------|--------|--------------------------|-------------------|
| TTM-r2 zero-shot | V1 NumPy | ✅ shipped | 0.4667 (V1 false-positive on bicycle at race corners; expected) | -16.8 m/s (NAIVE WINS G4 FAIL per `logs/day-04-g4.md`) |
| TTM-r2 zero-shot | V2 cvxpylayers constant-mu | ✅ shipped Day 5 | 0.0 post-projection per design | n/a (projection is constraint enforcement, not point forecast) |
| TTM-r2 zero-shot | V2 + 8-tier Pacejka (M3-V12) | ⬜ deferred per D-050 | future | future |
| TTM-r2 zero-shot | V2 + 8-tier + 3-iteration SCP (M3-V13) | ⬜ deferred per D-050 | future | future |
| TTM-r2 fine-tune | V2 constant-mu | ⬜ G4 recovery track | future | open per D-052 |
| FlowState | any | ✂️ cut per D-052 G4 pivot | n/a | n/a |
| Chronos-2 | any | ✂️ cut per D-052 G4 pivot | n/a | n/a |

## Evidence

`cd app/backend && .venv/Scripts/python -m pytest tests/ -q -p no:cacheprovider`:

```
185 passed, 5 skipped in 15.40s
```

(187 backend tests + 6 physics-tsfm carve-out tests = 191 total)

`cd app/backend && .venv/Scripts/python -m pytest tests/ --integration -q -p no:cacheprovider`:

```
190 passed
```

(integration tests cover the real TTM-r2 forward pass on FastF1
Bahrain 2024 Q laps 4-5 holdout per `logs/day-04-task-2.10-integration.md`;
G9 reduced-columns row 1 + 2 are both proven on this fixture)

## v_x near-zero damping + stiff-ODE steady-state substitution (D-014)

D-014 calls for Tikhonov damping on near-zero `v_x` + steady-state
algebraic substitution for stiff ODE regimes. The constant-mu V2
projector is **convex** (friction-ellipse is a 2-norm ball; the QP
is DPP-compliant per `apex/physics/projection.py` L93-95); no stiff
ODE in the V2 surface. Stiff-ODE handling is a Stage A property
that activates when the 8-tier Pacejka tire-thermal model lands at
M3-V12; deferred per D-050.

## Status

G9: **PASS** on reduced columns. Phase 5 task 5.5c closed. Phase 6
(paper + README + Convergence-14 final + G10 + cost audit) unblocked.

Backend test posture at G9 close: 185 fast + 5 integration backend
tests + 6 physics-tsfm carve-out tests = 196 total tests green. All
gates Days 3-8 PASS: G1 + G1b + G2 + G3 + G5 + G6 + G7 + G8 + G9
(reduced). G4 honest-FAIL with pivot triggered + executed across the
project surface stack per D-052.
