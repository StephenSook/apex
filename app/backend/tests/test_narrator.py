"""Narrator tests (Phase 3 task 3.1 + wave-46 OVERRIDE-steal #2+#4).

The narrator assembles a CoachingReport (per app/shared/types.ts L436)
from validated inputs:
  - forecast envelope (per-mini-sector mean/low/high)
  - CoaParseResult (citations + simultaneity_permitted)
  - PhysicsViolationLog (engine-agnostic; V1 or V2)
  - GuardianAudit (verdict + audit_id; wave-43 G2.1 canonical shape)
  - debrief text (driver self-report)

Output schema matches the frontend canonical contract verbatim. Every
CornerInsight carries the new optional reasoning_chain (wave-46 OVERRIDE-
steal #2+#4 per Stephen commit d223f1b). Every Citation has a verifiable
fia_article + coa_section that resolves against the input CoaParseResult.

The 9.OV-1 retry-loop surface lives in `narrate_with_retry()`: bounded
2-retry budget against a Pass-1 validator + Pass-2 Guardian check;
retry_count + per-attempt violation summary surfaced on the response
payload. The Granite 4.1 8B live LLM swap-point is named but stubbed
behind a deterministic-template generator for today (the OpenRouter
route at /api/openrouter-stream is the Stephen-side production path;
the backend test surface ships the schema + retry-loop pattern that
the live LLM path will satisfy).
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pytest

from apex.guardian.audit import Guardian
from apex.instruct.coa_parser import parse_coa_json
from apex.instruct.narrator import (
    DEFAULT_PROVENANCE_MODEL_VERSIONS,
    CoachingReport,
    NarratorInputs,
    NarratorOutput,
    NarratorRetryBudgetExceeded,
    Narrator,
    build_naive_forecast_envelope,
    derive_corner_insights,
)
from apex.physics.validator import friction_ellipse_check
from apex.shared.contracts import (
    CHANNEL_COUNT,
    HORIZON,
    PhysicsViolationLog,
    ViolationRecord,
    channel_index,
)

REPO_ROOT = Path(__file__).resolve().parents[3]
SARAH_COA_STUB = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-coa-stub.json"


@pytest.fixture
def sarah_coa():
    return parse_coa_json(SARAH_COA_STUB)


@pytest.fixture
def clean_forecast() -> np.ndarray:
    """30-step (HORIZON x CHANNEL_COUNT) forecast representing a clean stint."""
    f = np.zeros((HORIZON, CHANNEL_COUNT), dtype=np.float64)
    f[:, channel_index("speed_mps")] = 38.0
    f[:, channel_index("throttle_pct")] = 60.0
    f[:, channel_index("rpm")] = 6500.0
    f[:, channel_index("gear")] = 5.0
    f[:, channel_index("mu_v")] = 1.25
    f[:, channel_index("coa_overlap_flag")] = 1.0
    return f


@pytest.fixture
def empty_violation_log() -> PhysicsViolationLog:
    return PhysicsViolationLog(records=[], engine="v1_numpy")


# ---- Schema contract: CoachingReport mirrors app/shared/types.ts ------

def test_coaching_report_has_canonical_fields(sarah_coa, clean_forecast,
                                                empty_violation_log):
    guardian_audit = Guardian().audit(
        violation_log=empty_violation_log, coa=sarah_coa,
    )
    inputs = NarratorInputs(
        forecast=clean_forecast,
        coa=sarah_coa,
        violation_log=empty_violation_log,
        guardian_audit=guardian_audit,
        debrief="The car felt good through the long right; gained a tenth on exit.",
    )
    out = Narrator().narrate(inputs)
    report = out.coaching_report

    assert isinstance(report, CoachingReport)
    assert report.driver_id == sarah_coa.driver_id
    assert len(report.corners) > 0
    # tuning_delta + forecast + audit + provenance fields per L436-444.
    assert report.tuning_delta is not None
    assert len(report.forecast) > 0
    assert report.audit.audit_id == guardian_audit.audit_id
    assert report.provenance.commit_sha
    assert report.provenance.generated_at_iso
    # Model versions registry has all five Granite + IBM models per L423-429.
    mv = report.provenance.model_versions
    assert mv.granite_docling
    assert mv.granite_vision
    assert mv.granite_ttm
    assert mv.granite_instruct
    assert mv.granite_guardian


def test_every_corner_has_reasoning_chain(sarah_coa, clean_forecast,
                                            empty_violation_log):
    """wave-46 OVERRIDE-steal #2+#4: every CornerInsight carries the
    optional reasoning_chain. The narrator populates it with 4 steps
    matching the frontend ReasoningChainStep tag set."""
    guardian_audit = Guardian().audit(
        violation_log=empty_violation_log, coa=sarah_coa,
    )
    inputs = NarratorInputs(
        forecast=clean_forecast, coa=sarah_coa,
        violation_log=empty_violation_log,
        guardian_audit=guardian_audit, debrief="ok",
    )
    out = Narrator().narrate(inputs)
    for corner in out.coaching_report.corners:
        assert corner.reasoning_chain is not None
        steps = {s.step for s in corner.reasoning_chain}
        # Allow partial population (1-4 of 4) but at minimum a recommendation
        # step must appear so the frontend has something to expand into.
        assert "recommendation" in steps
        # If all 4 steps present, the canonical order is cause -> consequences
        # -> recommendation -> evidence (lifted from OVERRIDE).
        if len(corner.reasoning_chain) == 4:
            ordered_steps = [s.step for s in corner.reasoning_chain]
            assert ordered_steps == [
                "cause", "consequences", "recommendation", "evidence",
            ]


def test_citations_resolve_to_fixture_coa(sarah_coa, clean_forecast,
                                            empty_violation_log):
    """Every citation a corner emits must point at a real entry in the
    CoaParseResult. No invented FIA Article numbers (project compliance
    rule; Phase 3 task 3.6c citation-resolution test)."""
    guardian_audit = Guardian().audit(
        violation_log=empty_violation_log, coa=sarah_coa,
    )
    inputs = NarratorInputs(
        forecast=clean_forecast, coa=sarah_coa,
        violation_log=empty_violation_log,
        guardian_audit=guardian_audit, debrief="ok",
    )
    out = Narrator().narrate(inputs)

    valid_coa_sections = {ca.article_section for ca in sarah_coa.conditional_approvals}
    valid_coa_sections.add("section_2_medical_findings")
    valid_coa_sections.add("section_3_hardware_specifications")

    for corner in out.coaching_report.corners:
        for citation in corner.citations:
            assert citation.fia_article == "Appendix L"
            assert citation.coa_section in valid_coa_sections


def test_tuning_delta_citation_resolves_to_fixture_coa(sarah_coa, clean_forecast,
                                                         empty_violation_log):
    guardian_audit = Guardian().audit(
        violation_log=empty_violation_log, coa=sarah_coa,
    )
    inputs = NarratorInputs(
        forecast=clean_forecast, coa=sarah_coa,
        violation_log=empty_violation_log,
        guardian_audit=guardian_audit, debrief="ok",
    )
    out = Narrator().narrate(inputs)
    td = out.coaching_report.tuning_delta
    assert td.parameter
    assert td.unit
    assert td.citation.fia_article == "Appendix L"


# ---- audit_id discipline (Software Lead fix #9) ------------------------

def test_provenance_audit_id_is_non_none(sarah_coa, clean_forecast,
                                          empty_violation_log):
    guardian_audit = Guardian().audit(
        violation_log=empty_violation_log, coa=sarah_coa,
    )
    inputs = NarratorInputs(
        forecast=clean_forecast, coa=sarah_coa,
        violation_log=empty_violation_log,
        guardian_audit=guardian_audit, debrief="ok",
    )
    out = Narrator().narrate(inputs)
    assert out.coaching_report.audit.audit_id
    assert isinstance(out.coaching_report.audit.audit_id, str)
    assert len(out.coaching_report.audit.audit_id) > 0


# ---- Verdict propagation -----------------------------------------------

def test_reject_verdict_propagates_to_report(sarah_coa, clean_forecast):
    """A Guardian reject must surface on the report.audit field so the
    frontend can render the blocked_recommendations panel."""
    log = PhysicsViolationLog(
        records=[
            ViolationRecord(
                step=4, type="coa_simultaneity_violation",
                severity=0.0,
                channel_values={"throttle_pct": 30.0, "brake_pa": 4.0e5,
                                "coa_overlap_flag": 0.0},
                tier=0,
            ),
        ],
        engine="v1_numpy",
    )
    audit = Guardian().audit(violation_log=log, coa=sarah_coa)
    assert audit.verdict == "reject"
    inputs = NarratorInputs(
        forecast=clean_forecast, coa=sarah_coa,
        violation_log=log, guardian_audit=audit, debrief="ok",
    )
    out = Narrator().narrate(inputs)
    assert out.coaching_report.audit.verdict == "reject"
    assert len(out.coaching_report.audit.blocked_recommendations) > 0


# ---- Forecast envelope (NextSessionForecast shape) --------------------

def test_forecast_envelope_emits_mini_sectors(clean_forecast):
    env = build_naive_forecast_envelope(clean_forecast)
    assert len(env) > 0
    for entry in env:
        # Per app/shared/types.ts L410-418: sector_idx + mean + low + high
        assert entry.sector_idx >= 0
        assert entry.low <= entry.mean <= entry.high


def test_forecast_envelope_is_deterministic(clean_forecast):
    a = build_naive_forecast_envelope(clean_forecast)
    b = build_naive_forecast_envelope(clean_forecast)
    assert a == b


# ---- Retry-loop surface (wave-46 task 9.OV-1) -------------------------

def test_retry_count_on_clean_path_is_zero(sarah_coa, clean_forecast,
                                             empty_violation_log):
    guardian_audit = Guardian().audit(
        violation_log=empty_violation_log, coa=sarah_coa,
    )
    inputs = NarratorInputs(
        forecast=clean_forecast, coa=sarah_coa,
        violation_log=empty_violation_log,
        guardian_audit=guardian_audit, debrief="ok",
    )
    out = Narrator().narrate(inputs)
    assert out.retry_count == 0
    assert out.per_attempt_violation_summary == ()


def test_retry_count_increments_when_validator_rejects_first_attempt(
    sarah_coa, clean_forecast, empty_violation_log
):
    """Narrator generator can be told to fail-then-succeed; retry budget
    catches the failure and regenerates. Surfaces retry_count + the
    violation summary per attempt per wave-46 9.OV-1."""
    guardian_audit = Guardian().audit(
        violation_log=empty_violation_log, coa=sarah_coa,
    )

    call_counter = {"n": 0}

    def fail_then_succeed_generator(prompt: str, attempt: int) -> str:
        call_counter["n"] += 1
        if attempt == 0:
            return "REJECTED-PASS-1 OUTPUT"  # trips validator
        return "OK-PASS-1 OUTPUT"

    narrator = Narrator(
        text_generator=fail_then_succeed_generator,
        validate_text=lambda text: None if "OK-PASS-1" in text else "non-passing text",
    )
    inputs = NarratorInputs(
        forecast=clean_forecast, coa=sarah_coa,
        violation_log=empty_violation_log,
        guardian_audit=guardian_audit, debrief="ok",
    )
    out = narrator.narrate_with_retry(inputs)
    assert out.retry_count == 1
    assert len(out.per_attempt_violation_summary) == 1
    assert "non-passing" in out.per_attempt_violation_summary[0]
    assert call_counter["n"] == 2  # one fail + one retry success


def test_retry_budget_exhausted_after_two_retries_raises(
    sarah_coa, clean_forecast, empty_violation_log
):
    guardian_audit = Guardian().audit(
        violation_log=empty_violation_log, coa=sarah_coa,
    )
    narrator = Narrator(
        text_generator=lambda prompt, attempt: "INVALID OUTPUT",
        validate_text=lambda text: "always fails",
    )
    inputs = NarratorInputs(
        forecast=clean_forecast, coa=sarah_coa,
        violation_log=empty_violation_log,
        guardian_audit=guardian_audit, debrief="ok",
    )
    with pytest.raises(NarratorRetryBudgetExceeded):
        narrator.narrate_with_retry(inputs)


def test_default_provenance_model_versions_carries_five_models():
    mv = DEFAULT_PROVENANCE_MODEL_VERSIONS
    assert mv["granite_docling"]
    assert mv["granite_vision"]
    assert mv["granite_ttm"]
    assert mv["granite_instruct"]
    assert mv["granite_guardian"]


# ---- Corner derivation (helper smoke) ---------------------------------

def test_derive_corner_insights_extracts_at_least_one_corner(
    sarah_coa, clean_forecast
):
    corners = derive_corner_insights(clean_forecast, sarah_coa)
    assert len(corners) >= 1
    # Sector identifiers must be in {1, 2, 3} per the frontend type.
    for c in corners:
        assert c.sector in (1, 2, 3)
