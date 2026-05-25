# Day 4 — Gate G2 (COA parse coverage)

**Result: PASS**

Phase 1 task 1.6 per docs/vinh-backend-plan.md L126. Verifies that the
Sarah-style COA fixture parses end-to-end and surfaces all 9 adaptation
domains, plus that the simultaneity-permission flag is **derived** from
approved hardware specs + medical findings (not read from an explicit FIA
Article field).

## Pass criterion (from plan L58 + L126)

> JSON contains all 9 adaptation domains + COA-derived `c_overlap` flag per
> D-A wave-28 refinement. Sarah fixture covers 4 FIA Appendix L conditional
> approvals + medical findings + adaptive equipment spec + root
> simultaneity flag; G2 verifies all 9 domains parse end-to-end.

## Evidence

Test run (`app/backend/.venv/Scripts/python.exe -m pytest tests/test_instruct.py tests/test_contracts_adapters.py -v`):

```
tests/test_instruct.py::test_sarah_coa_parses_end_to_end PASSED
tests/test_instruct.py::test_sarah_coa_covers_nine_adaptation_domains PASSED
tests/test_instruct.py::test_simultaneity_flag_derives_from_anchors PASSED
tests/test_instruct.py::test_simultaneity_flag_false_when_approval_missing PASSED
tests/test_instruct.py::test_simultaneity_flag_false_when_hardware_anchor_missing PASSED
tests/test_instruct.py::test_explicit_flag_disagreement_raises PASSED
tests/test_instruct.py::test_missing_required_field_raises PASSED
tests/test_instruct.py::test_canned_timing_sheet_matches_frontend_contract PASSED
tests/test_instruct.py::test_canned_timing_sheet_matches_fixture_stub PASSED
tests/test_instruct.py::test_missing_pdf_raises PASSED
tests/test_instruct.py::test_empty_pdf_raises PASSED
tests/test_instruct.py::test_granite_vision_backend_not_yet_wired PASSED
tests/test_contracts_adapters.py::* 7 passed

19 passed in 0.80s
```

## 9 adaptation domains covered by the Sarah fixture

Enumerated in `apex.instruct.coa_parser.ADAPTATION_DOMAINS`:

1. `coa_sec_hand_controls` (conditional approval)
2. `coa_sec_simultaneity` (conditional approval; the load-bearing one for D-022)
3. `coa_sec_egress` (conditional approval)
4. `coa_sec_thermal` (conditional approval)
5. `medical_findings`
6. `adaptive_equipment_specifications`
7. `certificate_metadata`
8. `driver_metadata`
9. `issuing_authority`

The test `test_sarah_coa_covers_nine_adaptation_domains` asserts
`set(ADAPTATION_DOMAINS) - result.adaptation_domains_present == set()`.

## Simultaneity-flag derivation (D-022 + Perplexity 2026-05-21)

The flag is derived from two text anchors, NOT from an explicit FIA Article
field. APEX does not assert specific FIA Article numbers because the
appendix governs the COA framework but per-article enumeration is owned by
FIA-published documentation (see Sarah stub L124).

The two anchors:

1. `fia_appendix_l_conditional_approvals[*]` entry with
   `article_section == "coa_sec_simultaneity"` AND
   `condition == "simultaneity_permitted"` AND
   `approval_status == "approved"`
2. `adaptive_equipment_specifications.hand_control_configuration.simultaneity_geometry`
   contains "independent lever paths"

Both must agree. If the document root carries an explicit
`simultaneity_permission_flag` boolean, it is used as a consistency check;
mismatch raises `CoaParseError` (per
`test_explicit_flag_disagreement_raises`).

## Wave-44 path migration confirmed

Per docs/vinh-backend-plan.md L115:

- `coa_parser.py` lives at `app/backend/apex/instruct/coa_parser.py`
  (NOT `intake/`).
- `timing_sheet_parser.py` lives at `app/backend/apex/instruct/timing_sheet_parser.py`
  (NOT `vision/`).
- `tests/test_instruct.py` covers both.

## Downstream contract handoff

The `build_ttm_input` adapter in `apex.shared.contracts.adapters` is the
SINGLE place that tiles the scalar `simultaneity_permitted` across the
per-step `coa_overlap_flag` channel (TENSOR_SHAPE index 8). Phase 2 +
Phase 3 consumers (`physics.validator.coa_simultaneity_rule`,
`physics.projection`, `ttm.forecast`) MUST import from this adapter rather
than re-tile the scalar themselves (Software Lead fix #2).

`test_contracts_adapters.py` proves: COA flag fills channel 8 with 1.0 if
True / 0.0 if False, other channels are untouched, wrong-rank/shape inputs
raise, the function does not mutate its input.

## Status

G2: **PASS**. Phase 1 Vinh-side scope (tasks 1.1-1.6 + 1.9) is complete.
Stephen-side 1.7 + 1.8 already shipped per wave-42 commits `7179dc1` +
`89da292` + `dc5bd7e`.

Phase 2 (V1 NumPy validator + violation log) can start consuming
`CoaParseResult.simultaneity_permitted` + `build_ttm_input` immediately.
