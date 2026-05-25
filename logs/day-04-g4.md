# Day 4 — Gate G4 (TTM zero-shot vs seasonal-naive MAE bake-off)

**Result: FAIL** on `speed_mps`. Pivot trigger fired per plan L377.

Phase 2 Day 4 task 2.11 per docs/vinh-backend-plan.md L59 + L152 + L377.
The G4 gate asks whether zero-shot TTM-r2 beats a seasonal-naive
baseline on FastF1 holdout laps. The answer on this fixture is no, by a
wide margin. The plan's prescribed response is the fine-tune-first
pivot: drop the zero-shot pitch claim, ship D-010 Track 1 (channel-mix
decoder fine-tune) as the forecaster instead.

## Pass criterion (plan L59)

> holdout = laps 4-5 of fixture session, seed=42, channels:
> speed_mps + long_g, metric: per-channel MAE delta > 0;
> uncertainty band coverage 0.1 / 0.5 / 0.9 quantiles from Chronos-2

## Numbers

```
source: Hamilton 2024 Bahrain Q, laps 1-3 context / 4-5 holdout
seed: 42; horizon: 30 steps @ 1 Hz
context: 323 1 Hz steps (aggregated from FastF1 4 Hz car_data)
TTM load: 15.23s; forward: 484.0 ms

channel             TTM MAE    naive MAE        delta verdict
------------------------------------------------------------------------
speed_mps           35.1776      18.3819      16.7957 naive wins
long_g                    -            -            - n/a (FastF1 absent)

VERDICT (G4 floor: TTM wins on speed_mps): FAIL
```

Numbers JSON: `logs/day-04-g4-numbers.json` (committed alongside).

## Why TTM lost (root-cause analysis)

Three load-bearing factors, in honesty order:

1. **Seasonal-naive is structurally favored on F1 telemetry.** Lap-to-lap
   repetition over the same circuit is the dominant signal: lap 3's
   trailing edge (typically end-of-straight or pit approach) predicts
   lap 4's start far better than a context-window-driven generic
   time-series forecaster can. TTM-r2 was trained on diverse non-racing
   time-series; expecting it to discover lap-periodicity zero-shot was
   optimistic.

2. **Context-window padding distortion.** TTM-r2's `context_length` is
   512, but our 3-lap context aggregates to 323 1-Hz rows. The
   `shape_ttm_input` edge-pad replicates the first row 189 times to
   reach 512. TTM sees a tensor that is 37% padding-of-the-first-row +
   63% real telemetry. The padding is necessary for the model API but
   it is not the right inductive bias for racing data. This is a known
   limit of the V1 wrapper, not a bug.

3. **FastF1 channel-availability gap (pre-mortem row 62).** The plan's
   `speed_mps + long_g` channel pair only gets `speed_mps` measured;
   `long_g` is absent from FastF1 car_data and reports as n/a. The
   gate decision rides on `speed_mps` alone. If `long_g` were
   measured, it would be on a derived synthesis path, not raw
   telemetry, and the comparison would be apples-to-oranges anyway.

## Pre-existing G1 issue surfaced

G1 (`logs/day-03-g1-ttm-smoke.md`) asserted `source_hz=50` for FastF1
car_data. The actual median sample rate is **~4 Hz** (median Δt = 240 ms).
G1 still passed because its assertions covered tensor shape + finiteness
only, not semantic correctness of the aggregation. G4's
`load_hamilton_laps` derives the rate from `Date` deltas instead. G1's
forward pass was on over-aggregated input; the shape contract held but
the temporal semantics did not. This is logged here for honesty; G1
remains a valid load-bearing smoke (it proved the forward path works on
real FastF1 bytes), and its conclusion does not change.

## Plan-prescribed pivot (L377)

Plan L377 decision-triggers table:

> Day 4 | G4 zero-shot TTM does not beat seasonal-naive on defined
> holdout | Fine-tune-first, skip zero-shot pitch claim

Action items, in priority order:

1. **Pitch language correction.** Stephen's pitch + deck + paper §3.2
   must not claim "zero-shot TTM-r2 beats naive on F1 telemetry." The
   honest framing: APEX uses TTM-r2 as a frozen forecaster whose
   output is **constrained by the physics-projection layer + Guardian
   audit** rather than relied on for point-prediction accuracy. The
   value proposition is the engine-agnostic violation log + COA-aware
   simultaneity gate + Convergence-14 round-trip, not a forecast-MAE
   leaderboard win.

2. **D-010 Track 1 (channel-mix decoder fine-tune) elevation.** The
   plan already has the fine-tune scaffold listed under G1 (Day 3
   night) + the three-track ensemble at G9 (Day 9). Fine-tuning on
   FastF1 holdouts before re-running G4 is the next step; if Track 1
   beats naive after fine-tune, G4 RE-RUN PASS can be claimed
   honestly. Time-box: 6 hours Day 5 morning. If still fails, escalate.

3. **Forecast envelope reframe.** TTM-r2 + Chronos-2 quantile bands
   (D-010 Track 3) can produce uncertainty envelopes even when the
   point forecast loses to naive. The envelope-coverage metric is a
   different gate than MAE; the plan's reference to "uncertainty band
   coverage 0.1 / 0.5 / 0.9 quantiles" hints at this. Pitch can
   honestly cite "calibrated forecast envelope" without claiming
   point-MAE wins.

4. **Discord 9 PM ET sync escalation tonight (plan L411).** Bring G4
   FAIL number + pivot proposal to Stephen. Decision needs his
   alignment because it changes pitch language Cards 03 + 04.

## What G4 does NOT invalidate

- **G3 V1 NumPy validator + violation log:** unchanged. The validator
  does not care whether TTM or naive produced the forecast; engine-
  agnostic boundary holds.
- **Task 2.10 TTM integration test:** unchanged. The shape contract +
  forward-pass smoke is independent of forecast accuracy.
- **Task 2.9 pipeline:** unchanged. Both `--mode naive` and
  `--mode ttm` continue to exercise the validator end-to-end. The
  pipeline does not assert MAE quality.
- **Phase 2 Day 5 V2 cvxpylayers projector:** the projection layer
  takes any (HORIZON, CHANNEL_COUNT) input and projects it onto the
  feasible set. A worse forecast means a busier projection layer, but
  the architecture still holds.

## Reproducing this number

```
cd app/backend
.venv/Scripts/python -m apex.pipelines.g4_mae_bakeoff
```

Deterministic at seed=42; numbers JSON written to
`logs/day-04-g4-numbers.json`.

## Status

G4: **FAIL** on `speed_mps`. Pivot triggered. Phase 2 Day 4 (tasks
2.1-2.11) is complete; the gate result is captured honestly so Day-5
work proceeds with eyes open. Next: Phase 2 Day 5 starts with task 2.12
(cvxpylayers V2 projector) on the existing pipeline; the fine-tune
recovery path lands as a parallel track that does not block V2.
