# Day 4 — Gate G3 (V1 NumPy validator: 5 impossibilities + 5 valid + round-trip)

**Result: PASS**

Phase 2 Day 4 tasks 2.1-2.7 per docs/vinh-backend-plan.md L145-152. The V1
NumPy validator catches 5 distinct physically-impossible traces, approves
5 distinct valid traces, and `PhysicsViolationLog.to_text()` is
byte-deterministic across repeated calls (Convergence-14 floor per task
2.6b).

## Pass criterion (from plan L58 + L152)

> All 10 fixtures pass + `violation.to_text()` produces deterministic
> output matching golden fixture. V1 NumPy validator catches 5
> impossibilities + approves 5 valid + golden-text round-trip serializer
> assertion passes (Convergence-14 floor).

## Evidence

Full backend suite (`python -m pytest tests/ -q`):

```
......................................                                   [100%]
38 passed in 0.15s
```

Physics-only slice (`python -m pytest tests/test_physics_v1.py -q`):

```
...................                                                      [100%]
19 passed in 0.12s
```

## 5 impossibilities flagged

Enumerated in the `impossibilities` fixture of
`tests/test_physics_v1.py`. Each produces a non-empty
`PhysicsViolationLog`.

1. **friction**: 1.5g long_g, 0 lat_g at mu=1.2 → `friction_ellipse_exceeded`
   on step 0 (Tier 7).
2. **euler**: speed jumps from 10 m/s to 60 m/s in one 1 Hz step at
   long_g=0 → `forward_euler_inconsistent` on step 5 (Tier 8). Δ-v
   tolerance band sourced from `ToleranceBands.for_1hz_aggregation()` per
   council v2 Software Lead fix #7.
3. **bicycle**: 2g lateral at zero steering at 50 m/s →
   `bicycle_kinematic_break` on step 2 (Tier 8).
4. **coa**: throttle 30% + brake 0.4 MPa with `coa_overlap_flag = 0`
   (COA forbids overlap) → `coa_simultaneity_violation` on step 0 (Tier 0).
5. **top_level**: `validate_forecast` merges across all four checks and
   flags a friction violation injected at step 2 with simultaneity
   permitted; verifies the per-check union path.

## 5 valid traces approved

Enumerated in the `valid_traces` fixture. Each returns an empty
`PhysicsViolationLog` (`is_empty() is True`, `fcvr() == 0.0`).

1. **friction_zero**: flat zero-g cruise inside the friction circle.
2. **euler_consistent**: speed grows by exactly 1g · 1s per step at
   long_g = 1.0; Δ-v residual is zero.
3. **bicycle_consistent**: small-angle steering at 20 m/s with
   `lat_g = steer · v² / (L · g)` algebraically matched.
4. **coa_no_overlap**: throttle 50% with brake = 0 regardless of
   simultaneity channel.
5. **validate_clean**: clean 30 m/s cruise through `validate_forecast`
   with simultaneity permitted.

## Convergence-14 floor (round-trip serializer)

Three deterministic-serializer assertions ship with G3 (full
Convergence-14 expansion to all 14 violation types lands at Phase 4
task 4.2 per plan L208).

- `test_to_text_is_deterministic_across_two_calls`: same log instance,
  `.to_text() == .to_text()`.
- `test_to_text_sorts_records_by_step_then_type_then_tier`: golden
  ordering invariant proven for cross-engine byte-equality.
- `test_friction_violation_serializer_round_trip_matches_golden`:
  friction fixture produces text containing the expected `ENGINE`,
  `STEPS`, and `step=07 type=friction_ellipse_exceeded tier=7` lines.

## Engine-agnostic invariant (Long-Term Architect load-bearing wall #2)

Every V1 NumPy check emits `PhysicsViolationLog(engine="v1_numpy", ...)`.
When V2 cvxpylayers lands on Day 5 (task 2.12) it MUST emit
`PhysicsViolationLog(engine="v2_cvxpylayers", ...)` with byte-identical
`.to_text()` output on the same `ViolationRecord` content. The
cross-engine equality test will live in `tests/test_serializer.py` per
Phase 4 task 4.2.

## Status

G3: **PASS**. Phase 2 Day 4 (tasks 2.1-2.7) complete. Next: Day 4 tasks
2.8-2.11 (TTM → validator end-to-end + Gate G4 MAE bake-off), then Day 5
tasks 2.12-2.16 (cvxpylayers V2 projector + Granite Guardian audit +
Gate G5).
