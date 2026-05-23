# Day 3 — G0.6 cvxpylayers Windows import smoke (PASS)

**Date:** 2026-05-23 (Day 3)
**Operator:** Vinh Le
**Hardware:** Windows 11 + Python 3.10.7 + RTX 3060 Ti
**Gate origin:** Council v2 transcript 2026-05-22 v2 (Executor + Contrarian peer catch). Former G6.5 (Day 4 EOD) was pulled forward to Day 3 hour 2 because the Day-4 placement could not rescue a Day-3 D-027 blocker.

## Pass criterion

`import cvxpy; import cvxpylayers` succeeds on Windows + the 10-line cvxpylayers README example runs end-to-end with `.backward()` producing finite gradients.

## Result

PASS in ~1 minute total install time. Zero VC++ Build Tools intervention required.

```
Successfully installed clarabel-0.11.1 cvxpy-1.7.5 cvxpylayers-0.1.9
                     diffcp-1.1.9 osqp-1.1.1 scs-3.2.11
```

```python
cvxpy=1.7.5 cvxpylayers OK
forward: [2.0, 0.0] -> [1.0000110864639282, 0.0]
backward: grad=[-3.5155478599335765e-06, 0.5000051259994507] (finite=True)
```

## Findings

1. `diffcp` (the compiled C++ backend that cvxpylayers needs for implicit differentiation) built a wheel on Python 3.10.7 + Windows 11 **without** `--no-build-isolation` and **without** the Visual C++ Build Tools workaround the wave-30 plan budgeted 4 hours for.
2. cvxpy resolves a hierarchy of solvers (clarabel + osqp + scs all installed). For our QP + SOCP needs, clarabel is the default; osqp is the fallback. Both ship as pre-built Windows wheels on PyPI.
3. The 10-line README example projects (2, 0) onto the unit ball (correct: returns (1, 0) at the boundary). Backward pass produces finite gradients in both axes.

## Implication for D-027 Stage C

- No fallback to WSL2 / Linux container needed. Stage C runs on native Windows.
- The 4-hour debug budget the wave-30 G6.5 carried (former Day-4 EOD gate) is now **available time** for Stage C scope expansion (e.g. multi-iteration SCP instead of single-iterate; trying 8-tier Pacejka linearization Day 3 instead of deferring to Day 4 task 2.12).

## Cross-references

- `app/backend/requirements.txt` (pinned versions of all solvers)
- `docs/vinh-backend-plan.md` Phase 0 task G0.6 (the gate that replaces former G6.5)
- `council-transcript-20260522-vinh-backend-plan-v2.md` "Where the council agrees" point 3
