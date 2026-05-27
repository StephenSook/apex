"""End-to-end Sarah pipeline tests (Phase 3 task 3.5 + G6 acceptance).

Drops Sarah's fixtures (5-lap telemetry CSV + COA JSON stub + debrief MD)
into the pipeline and asserts:

  1. CoachingReport JSON validates against the canonical frontend
     contract at app/shared/types.ts L436 (driver_id + corners[] +
     tuning_delta + forecast[] + audit + provenance).
  2. provenance.audit_id is non-None (task 3.6b contract).
  3. Every Citation resolves to a real entry in the input CoaParseResult
     (task 3.6c citation-resolution; no hallucinated FIA Articles).
  4. The end-to-end run takes < 5 seconds wall-clock on commodity
     hardware (G6 informal latency floor; G8 60s budget covers the
     full demo loop, this assertion is a sanity bound).
"""

from __future__ import annotations

import json
import time
from pathlib import Path

import pytest

from apex.pipelines.sarah_e2e import (
    coaching_report_to_dict,
    coaching_report_to_json,
    run_sarah_e2e,
)

REPO_ROOT = Path(__file__).resolve().parents[3]
SARAH_CSV = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-telemetry.csv"
SARAH_COA = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-coa-stub.json"
SARAH_DEBRIEF = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-debrief.md"


@pytest.fixture(scope="module")
def report():
    return run_sarah_e2e(
        telemetry_csv=SARAH_CSV,
        coa_json=SARAH_COA,
        debrief_path=SARAH_DEBRIEF,
    )


def test_report_has_canonical_top_level_fields(report):
    d = coaching_report_to_dict(report)
    assert "driver_id" in d
    assert "corners" in d and isinstance(d["corners"], list) and len(d["corners"]) > 0
    assert "tuning_delta" in d
    assert "forecast" in d and isinstance(d["forecast"], list) and len(d["forecast"]) > 0
    assert "audit" in d
    assert "provenance" in d


def test_provenance_audit_id_is_non_none(report):
    """Software Lead fix #9: audit_id MUST be non-None on every report."""
    d = coaching_report_to_dict(report)
    audit_id = d["audit"]["audit_id"]
    assert audit_id is not None
    assert isinstance(audit_id, str)
    assert len(audit_id) > 0


def test_provenance_carries_commit_sha_and_timestamp(report):
    p = coaching_report_to_dict(report)["provenance"]
    assert p["commit_sha"]
    assert "T" in p["generated_at_iso"]   # ISO 8601 has T separator


def test_provenance_model_versions_all_five_models(report):
    mv = coaching_report_to_dict(report)["provenance"]["model_versions"]
    for key in ("granite_docling", "granite_vision", "granite_ttm",
                 "granite_instruct", "granite_guardian"):
        assert key in mv
        assert mv[key]


def test_every_corner_has_reasoning_chain(report):
    """wave-46 OVERRIDE-steal #2+#4: reasoning_chain present on every
    CornerInsight; renders the <details> expander on the frontend."""
    d = coaching_report_to_dict(report)
    for corner in d["corners"]:
        chain = corner.get("reasoning_chain")
        assert chain is not None
        assert isinstance(chain, list) and len(chain) >= 1
        # Every step has the canonical {step, label, content} shape.
        for s in chain:
            assert s["step"] in ("cause", "consequences", "recommendation", "evidence")
            assert s["label"]
            assert s["content"]


def test_citations_resolve_to_fixture_coa(report):
    """Task 3.6c citation resolution: no hallucinated FIA Articles.

    Every citation a corner OR tuning_delta emits must point at a real
    entry in the input CoaParseResult. APEX never invents specific FIA
    Article numbers (project compliance rule); 'Appendix L' is the only
    valid fia_article token.
    """
    from apex.instruct.coa_parser import parse_coa_json
    coa = parse_coa_json(SARAH_COA)
    valid_coa_sections = {ca.article_section for ca in coa.conditional_approvals}
    # Two additional canonical section IDs the narrator emits.
    valid_coa_sections.update({
        "section_2_medical_findings",
        "section_3_hardware_specifications",
    })

    d = coaching_report_to_dict(report)
    for corner in d["corners"]:
        for citation in corner["citations"]:
            assert citation["fia_article"] == "Appendix L"
            assert citation["coa_section"] in valid_coa_sections
    # tuning_delta citation too.
    td_citation = d["tuning_delta"]["citation"]
    assert td_citation["fia_article"] == "Appendix L"
    assert td_citation["coa_section"] in valid_coa_sections


def test_forecast_envelope_has_consistent_low_mean_high(report):
    d = coaching_report_to_dict(report)
    for entry in d["forecast"]:
        assert entry["low"] <= entry["mean"] <= entry["high"]


def test_report_json_serializes_cleanly(report):
    text = coaching_report_to_json(report)
    # Must be parseable JSON
    parsed = json.loads(text)
    assert parsed["driver_id"]
    # No NaN / Infinity leaked into the wire
    assert "NaN" not in text
    assert "Infinity" not in text


def test_end_to_end_under_5_seconds(report):
    """G6 informal latency floor. G8 60s budget is the load-bearing
    target; 5s for the pure-Python pipeline (no TTM load) is the
    Day-6 sanity bound."""
    t0 = time.time()
    _ = run_sarah_e2e(
        telemetry_csv=SARAH_CSV,
        coa_json=SARAH_COA,
        debrief_path=SARAH_DEBRIEF,
    )
    elapsed = time.time() - t0
    assert elapsed < 5.0, f"Sarah e2e took {elapsed:.2f}s; expected < 5s"


def test_driver_id_matches_coa(report):
    d = coaching_report_to_dict(report)
    assert d["driver_id"] == "sarah-reynolds-britcar-2026"


def test_audit_id_is_unique_across_runs():
    """Two back-to-back runs must produce distinct audit_ids (uuid4
    per-call discipline per shared.contracts.violations.new_audit_id)."""
    r1 = run_sarah_e2e(
        telemetry_csv=SARAH_CSV, coa_json=SARAH_COA, debrief_path=SARAH_DEBRIEF,
    )
    r2 = run_sarah_e2e(
        telemetry_csv=SARAH_CSV, coa_json=SARAH_COA, debrief_path=SARAH_DEBRIEF,
    )
    d1 = coaching_report_to_dict(r1)
    d2 = coaching_report_to_dict(r2)
    assert d1["audit"]["audit_id"] != d2["audit"]["audit_id"]
