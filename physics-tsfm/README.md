# physics-tsfm

Physics-projected forecasts for IBM Granite TimeSeries TTM. APEX-Bench
`v0.0.1-preview` supporting library.

> **Status: not yet stable.** This package is published to TestPyPI
> as `v0.1.0a1` per APEX submission docs/decision-log.md D-050
> reproducibility commitment. Public release governance (versioning,
> deprecation, contributor guidelines) lands at Day-13+ post-hackathon.

## What this is

The `physics-tsfm` library exposes:

- The `DifferentiableProjector` Protocol seam that swaps V1 NumPy +
  V2 cvxpylayers + future qpth + Theseus projectors behind one
  interface.
- The `PhysicsViolationLog` engine-agnostic serialization contract.
  V1 and V2 emit byte-identical `.to_text()` output on the same
  ViolationRecord content modulo the `ENGINE` header line.
- The canonical `(B, 30, 14)` TENSOR_SHAPE contract for the 14-channel
  Granite TimeSeries TTM r2 forecast input.

## Why this exists

APEX is a hackathon submission for the IBM SkillsBuild AI Builders
Challenge May 2026. The carve-out exists so the NeurIPS Workshop
paper at `paper/apex-neurips-workshop-2026.md` can cite a versioned,
pip-installable supporting library that survives the hackathon repo's
post-submission churn.

## Install

```
pip install --index-url https://test.pypi.org/simple/ physics-tsfm
```

For the cvxpylayers V2 path:

```
pip install --index-url https://test.pypi.org/simple/ \
    --extra-index-url https://pypi.org/simple/ \
    'physics-tsfm[torch]'
```

For the TTM-r2 forecast wrapper:

```
pip install --index-url https://test.pypi.org/simple/ \
    --extra-index-url https://pypi.org/simple/ \
    'physics-tsfm[torch,ttm]'
```

## Quick start

```python
from physics_tsfm import (
    PhysicsViolationLog,
    ViolationRecord,
    TENSOR_SHAPE,
    HORIZON,
    CHANNEL_COUNT,
)

log = PhysicsViolationLog(
    records=[
        ViolationRecord(
            step=3, type="friction_ellipse_exceeded",
            severity=0.30,
            channel_values={"long_g": 1.5, "lat_g": 0.0},
            tier=7,
        ),
    ],
    engine="v1_numpy",
)
print(log.to_text())
```

## License

Apache-2.0. See [LICENSE](https://github.com/StephenSook/apex/blob/main/LICENSE).

## Cross-references

- [APEX repo](https://github.com/StephenSook/apex)
- [Decision Log D-050](https://github.com/StephenSook/apex/blob/main/docs/decision-log.md)
- [Engine-agnostic byte-equality lock](https://github.com/StephenSook/apex/blob/main/app/backend/tests/test_physics_v2.py)
