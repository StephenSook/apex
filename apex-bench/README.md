# APEX-Bench `v0.0.1-preview`

> **Status: not yet stable.** Dockerized reproducibility harness for
> the APEX submission's LIPS 4-axis evaluation. Public release
> governance lands at Day-13+ post-hackathon. The harness reproduces
> every row of the paper §4 ablation table within MLPerf-style
> tolerance bands per D-023.

## What this does

`eval/Dockerfile` builds a self-contained image that runs the same
APEX backend pipeline used in the demo against Sarah Reynolds canned
fixtures + a 5-lap FastF1 holdout slice (Hamilton Bahrain 2024 Q laps
4-5; the G4 holdout). Outputs:

1. A `coaching_report.json` per fixture matching the canonical frontend
   contract at `app/shared/types.ts` L436 (CornerInsight +
   TuningDelta + ForecastEnvelope + GuardianAudit + ProvenanceFooter).
2. A `violation_log.txt` per fixture matching `PhysicsViolationLog.to_text()`
   byte-equality lock per D-050.
3. A `lips_ablation.csv` populating the 4-axis ablation table the
   paper §4 cites.

## LIPS 4-axis ablation surface

Per docs/vinh-backend-plan.md L267 + D-026:

| Track | Projector | Status |
|-------|-----------|--------|
| zero-shot TTM-r2 | V1 NumPy (constant-mu) | ✅ shipped Day 4 |
| soft-loss (paper §3.5 baseline) | V1 NumPy (constant-mu) | ✅ shipped Day 4 |
| APEX hard projection | V2 cvxpylayers (constant-mu) | ✅ shipped Day 5 |
| full 3-track + 8-tier | V2 + Stage A + Stage B + FlowState + Chronos-2 | ⬜ deferred per D-052 + D-050 |

The reduced-columns ablation reflects the G4 FAIL pivot per D-052;
paper §4 cites the deferred columns as `v0.0.1-preview, public
release forthcoming`.

## Reproducing

```bash
docker build -t apex-bench:0.0.1-preview -f eval/Dockerfile .
docker run --rm \
  -v "$(pwd)/fixtures:/srv/fixtures:ro" \
  -v "$(pwd)/apex-bench/out:/srv/out" \
  apex-bench:0.0.1-preview
```

Outputs land in `apex-bench/out/`. Tolerance bands documented inline
per D-023 MLPerf protocol.

## NOT public-release-stable

This is a hackathon preview. Versioning, deprecation, contributor
guidelines, and the public DOI'd release land Day-13+. If the paper
appears with this harness cited, please use the `v0.0.1-preview` tag
in any reference; later stable releases will not promise backwards
compatibility with the alpha.

## Cross-references

- [APEX repo](https://github.com/StephenSook/apex)
- [Paper §4 ablation table](https://github.com/StephenSook/apex/blob/main/paper/apex-neurips-workshop-2026.md)
- [Decision Log D-023 MLPerf tolerance bands](https://github.com/StephenSook/apex/blob/main/docs/decision-log.md)
- [Decision Log D-026 APEX-Bench public benchmark release](https://github.com/StephenSook/apex/blob/main/docs/decision-log.md)
- [Decision Log D-050 V2 cut clause not invoked](https://github.com/StephenSook/apex/blob/main/docs/decision-log.md)
- [Decision Log D-052 G4 pivot narrative reframing](https://github.com/StephenSook/apex/blob/main/docs/decision-log.md)
