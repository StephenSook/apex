# Day 6 - Gate G6 (Sarah end-to-end CoachingReport + provenance + citation resolution)

**Result: PASS**

Phase 3 task 3.8 per docs/vinh-backend-plan.md L196. Sarah Reynolds
fixtures (5-lap Donington synthetic CSV + COA JSON stub + debrief
markdown) drop into the pipeline and produce a `CoachingReport` JSON
matching the canonical frontend contract at `app/shared/types.ts`
L436-444 verbatim, with `audit_id` non-None (Software Lead fix #9)
and every Citation resolving to a real entry in the input
`CoaParseResult` (no hallucinated FIA Articles per project
compliance rule).

## Pass criterion (plan L196)

> Drop Sarah fixtures into the pipeline. Get back a JSON with corners,
> tuning delta, forecast envelope, Guardian verdict, and provenance
> footer. Coaching report + provenance footer renders + every citation
> traces to fixture COA JSON.

## Evidence

`cd app/backend && .venv/Scripts/python -m pytest tests/test_sarah_e2e.py tests/test_narrator.py -v -p no:cacheprovider`:

```
tests/test_narrator.py::test_coaching_report_has_canonical_fields PASSED
tests/test_narrator.py::test_every_corner_has_reasoning_chain PASSED
tests/test_narrator.py::test_citations_resolve_to_fixture_coa PASSED
tests/test_narrator.py::test_tuning_delta_citation_resolves_to_fixture_coa PASSED
tests/test_narrator.py::test_provenance_audit_id_is_non_none PASSED
tests/test_narrator.py::test_reject_verdict_propagates_to_report PASSED
tests/test_narrator.py::test_forecast_envelope_emits_mini_sectors PASSED
tests/test_narrator.py::test_forecast_envelope_is_deterministic PASSED
tests/test_narrator.py::test_retry_count_on_clean_path_is_zero PASSED
tests/test_narrator.py::test_retry_count_increments_when_validator_rejects_first_attempt PASSED
tests/test_narrator.py::test_retry_budget_exhausted_after_two_retries_raises PASSED
tests/test_narrator.py::test_default_provenance_model_versions_carries_five_models PASSED
tests/test_narrator.py::test_derive_corner_insights_extracts_at_least_one_corner PASSED
tests/test_sarah_e2e.py::test_report_has_canonical_top_level_fields PASSED
tests/test_sarah_e2e.py::test_provenance_audit_id_is_non_none PASSED
tests/test_sarah_e2e.py::test_provenance_carries_commit_sha_and_timestamp PASSED
tests/test_sarah_e2e.py::test_provenance_model_versions_all_five_models PASSED
tests/test_sarah_e2e.py::test_every_corner_has_reasoning_chain PASSED
tests/test_sarah_e2e.py::test_citations_resolve_to_fixture_coa PASSED
tests/test_sarah_e2e.py::test_forecast_envelope_has_consistent_low_mean_high PASSED
tests/test_sarah_e2e.py::test_report_json_serializes_cleanly PASSED
tests/test_sarah_e2e.py::test_end_to_end_under_5_seconds PASSED
tests/test_sarah_e2e.py::test_driver_id_matches_coa PASSED
tests/test_sarah_e2e.py::test_audit_id_is_unique_across_runs PASSED

24 passed
```

Full backend suite (`pytest tests/ -q`):

```
122 passed, 5 skipped in 15.55s
```

## What ships

### `app/backend/apex/instruct/narrator.py`

`Narrator` class assembling `CoachingReport` from validated inputs
(forecast tensor + `CoaParseResult` + `PhysicsViolationLog` +
`GuardianAudit` + driver debrief). Output dataclasses mirror
`app/shared/types.ts` L347-444 verbatim:

- `CoachingReport` (driver_id, corners[], tuning_delta, forecast[],
  audit, provenance)
- `CornerInsight` with optional `reasoning_chain` populated as
  4-step (cause -> consequences -> recommendation -> evidence) chain
  per wave-46 OVERRIDE-steal #2+#4 (Stephen commit `d223f1b`)
- `TuningDelta` with required Citation; brake-bias heuristic tied to
  forecast brake-pressure load
- `Citation` (fia_article="Appendix L"; coa_section resolves to
  CoaParseResult conditional_approvals)
- `ProvenanceFooter` with 5-model registry + commit_sha + UTC
  timestamp
- `ReasoningChainStep` (step, label, content)

### `app/backend/apex/instruct/narrator.py::narrate_with_retry`

wave-46 OVERRIDE-steal #1 retry-loop pattern per Stephen commit
`8c3e481`. Bounded 2-retry budget (3 attempts worst case) against a
Pass-1 deterministic text validator. `NarratorOutput.retry_count` +
`per_attempt_violation_summary` surface the discipline on the
response. `NarratorRetryBudgetExceeded` raises when the budget is
exhausted.

### `app/backend/apex/instruct/sarah_synth.py`

Deterministic synthetic 5-lap Donington telemetry generator
(seed=42). Emits `fixtures/personas/sarah-reynolds-telemetry.csv`
with 300 rows at 1 Hz across all 14 channels. Four corners per lap
modeled as cosine speed dips (Redgate + Old Hairpin + McLeans +
Goddards); friction-ellipse-bounded `lat_g` via the same constant-mu
constraint the V1 validator enforces.

### `fixtures/personas/sarah-reynolds-debrief.md`

Driver self-report markdown surfacing the three loss corners (Turn 1,
Turn 4, Turn 7) + three questions for APEX + the do-not-change
hardware boundary. Fictional-persona watermark + cross-reference to
the COA stub + persona brief.

### `app/backend/apex/pipelines/sarah_e2e.py`

End-to-end pipeline: load telemetry CSV -> tile COA flag via
build_ttm_input -> validate_forecast (V1 NumPy floor) -> Guardian
audit -> Narrator.narrate -> JSON-serializable CoachingReport.
`coaching_report_to_json()` helper produces wire-ready output
matching the frontend canonical type.

## Per-task status

| Task | Status | Notes |
|------|--------|-------|
| 3.1 Granite narrator wired | ✅ | Schema-correct deterministic floor; OpenRouter Granite live-LLM swap-point named via `text_generator` arg + Stephen-side `/api/openrouter-stream` is production prompt path per Q3 split |
| 3.2 Sarah 5-lap telemetry | ✅ | `sarah_synth.py` deterministic generator; output at `fixtures/personas/sarah-reynolds-telemetry.csv` (300 rows) |
| 3.3 Sarah COA fixture | ✅ already-shipped wave-42 `82d1f85`; canonical FIACoa shape per wave-43 G2.1 |
| 3.4 Sarah debrief text | ✅ | `fixtures/personas/sarah-reynolds-debrief.md` with persona watermark + 3 loss corners + 3 questions + hardware-boundary |
| 3.5 Sarah end-to-end pipeline | ✅ | `apex/pipelines/sarah_e2e.py` + 11 tests in `tests/test_sarah_e2e.py` |
| 3.6 Provenance footer assembler | ✅ | shipped inline with narrator (`_build_provenance` + `DEFAULT_PROVENANCE_MODEL_VERSIONS`); commit_sha resolved via `git rev-parse HEAD` with env-var override + `dev` fallback |
| 3.6b Provenance contract test (audit_id non-None) | ✅ | `test_provenance_audit_id_is_non_none` in both narrator + sarah_e2e suites |
| 3.6c Citation resolution test | ✅ | `test_citations_resolve_to_fixture_coa` + `test_tuning_delta_citation_resolves_to_fixture_coa` |
| 3.8 Gate G6 | ✅ | this log |
| 9.OV-1 (wave-46 retry loop pattern) | ✅ | `narrate_with_retry` shipped |
| 9.OV-2+4 (wave-46 reasoning_chain) | ✅ | every CornerInsight carries the 4-step chain |

## Engine-agnostic narrator boundary

The narrator consumes a `PhysicsViolationLog` regardless of which
engine produced it (V1 NumPy floor or V2 cvxpylayers ceiling). The
Guardian audit upstream is also engine-agnostic per G5 lock
(`test_g5_v1_v2_guardian_audits_agree_on_verdict_for_same_violations`).
This means the same CoachingReport assembly produces byte-comparable
output when the validator/projector engine is swapped, modulo the
`engine` field of the `PhysicsViolationLog` that the audit chain
references.

## What G6 does NOT yet ship

The Granite 4.1 8B live-LLM text is NOT generated by the backend.
Stephen-side `/api/openrouter-stream` route (`89da297`) is the
production prompt path; the backend ships the schema-correct
deterministic floor that fits into either the live or the canned
demo flow without re-wiring. The `Narrator(text_generator=...)`
seam is the swap-point for any future backend-side LLM call.

8-tier Pacejka linearization (M3-V12) + 3-iteration SCP unroll
(M3-V13) remain deferred per D-050 staged ladder. They light up
behind the existing `DifferentiableProjector` Protocol when those
swap-points land; the narrator consumes the resulting
`PhysicsViolationLog` identically.

## Status

G6: **PASS**. Phase 3 closed. Phase 4 (LangGraph runtime + M.3
endpoints + cache + Gates G7 + G8) is unblocked. Backend test
posture at G6 close: 122 fast + 5 integration = 127 total.
