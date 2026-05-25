"""Phase 1 task 1.4 + part of Gate G2.

Verifies the Sarah COA stub parses + the simultaneity flag derives from
hardware specs + approval status (NOT from an explicit FIA Article field).
Also verifies the timing-sheet parser's canned-fixture path matches the
frontend `TimingSheetParsedLaps` JSON shape byte-for-byte (per the wave-44
swap-point contract).
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from apex.instruct.coa_parser import (
    ADAPTATION_DOMAINS,
    CoaParseError,
    derive_simultaneity_flag,
    parse_coa_json,
    parse_coa_payload,
)
from apex.instruct.timing_sheet_parser import (
    CANNED_LAPS,
    TimingSheetParseError,
    parse_timing_sheet,
)

REPO_ROOT = Path(__file__).resolve().parents[3]
SARAH_COA = REPO_ROOT / "fixtures" / "personas" / "sarah-reynolds-coa-stub.json"
TIMING_STUB = REPO_ROOT / "fixtures" / "timing-sheets" / "sarah-reynolds-donington-2026-stub.json"


# ---- coa_parser -------------------------------------------------------------


def test_sarah_coa_parses_end_to_end():
    result = parse_coa_json(SARAH_COA)
    assert result.driver_id == "sarah-reynolds-britcar-2026"
    assert result.certificate_number == "MSUK-MED-COA-2026-0184"
    assert result.fia_appendix_l_revision == "2024.1"
    assert result.simultaneity_permitted is True
    assert len(result.conditional_approvals) == 4


def test_sarah_coa_covers_nine_adaptation_domains():
    """Gate G2 prerequisite: the parser surfaces all 9 declared domains."""
    result = parse_coa_json(SARAH_COA)
    assert len(ADAPTATION_DOMAINS) == 9
    missing = set(ADAPTATION_DOMAINS) - result.adaptation_domains_present
    assert not missing, f"Sarah COA fixture missing domain coverage: {missing}"


def test_simultaneity_flag_derives_from_anchors():
    payload = json.loads(SARAH_COA.read_text(encoding="utf-8"))
    assert derive_simultaneity_flag(payload) is True


def test_simultaneity_flag_false_when_approval_missing():
    payload = json.loads(SARAH_COA.read_text(encoding="utf-8"))
    payload["fia_appendix_l_conditional_approvals"] = [
        a for a in payload["fia_appendix_l_conditional_approvals"]
        if a["article_section"] != "coa_sec_simultaneity"
    ]
    payload.pop("simultaneity_permission_flag", None)
    assert derive_simultaneity_flag(payload) is False


def test_simultaneity_flag_false_when_hardware_anchor_missing():
    payload = json.loads(SARAH_COA.read_text(encoding="utf-8"))
    payload["adaptive_equipment_specifications"]["hand_control_configuration"][
        "simultaneity_geometry"
    ] = "single combined lever, no overlap possible"
    payload.pop("simultaneity_permission_flag", None)
    assert derive_simultaneity_flag(payload) is False


def test_explicit_flag_disagreement_raises():
    """If a COA carries an explicit simultaneity_permission_flag that
    disagrees with the derived value, we refuse to silently pick one."""
    payload = json.loads(SARAH_COA.read_text(encoding="utf-8"))
    payload["simultaneity_permission_flag"] = False  # derived value is True
    with pytest.raises(CoaParseError, match="disagrees with explicit"):
        derive_simultaneity_flag(payload)


def test_missing_required_field_raises():
    with pytest.raises(CoaParseError, match="missing required field"):
        parse_coa_payload({"driver_id": "x"})


# ---- timing_sheet_parser ----------------------------------------------------


def test_canned_timing_sheet_matches_frontend_contract(tmp_path):
    """Backend canned-fixture output MUST match the frontend route's
    `TimingSheetParsedLaps` shape (field names + types + lap rows)."""
    fake_pdf = tmp_path / "stub.pdf"
    fake_pdf.write_bytes(b"%PDF-1.4 fake-stub")
    parsed = parse_timing_sheet(fake_pdf, backend="canned-fixture")
    payload = parsed.to_json()

    expected_lap_keys = {"lap", "sector_1_time_s", "sector_2_time_s", "sector_3_time_s", "lap_time_s"}
    assert set(payload.keys()) == {"source_filename", "parser", "parse_ms", "laps"}
    assert payload["parser"] == "canned-fixture"
    assert payload["source_filename"] == "stub.pdf"
    assert isinstance(payload["parse_ms"], int)
    assert len(payload["laps"]) == 5
    for lap in payload["laps"]:
        assert set(lap.keys()) == expected_lap_keys


def test_canned_timing_sheet_matches_fixture_stub():
    """Numeric content must match the committed timing-sheet JSON stub
    byte-for-byte; if either side drifts, the contract test fails."""
    stub = json.loads(TIMING_STUB.read_text(encoding="utf-8"))
    expected_laps = [
        {
            "lap": lap.lap,
            "sector_1_time_s": lap.sector_1_time_s,
            "sector_2_time_s": lap.sector_2_time_s,
            "sector_3_time_s": lap.sector_3_time_s,
            "lap_time_s": lap.lap_time_s,
        }
        for lap in CANNED_LAPS
    ]
    assert stub["laps"] == expected_laps


def test_missing_pdf_raises():
    with pytest.raises(TimingSheetParseError, match="not found"):
        parse_timing_sheet("does-not-exist.pdf", backend="canned-fixture")


def test_empty_pdf_raises(tmp_path):
    empty = tmp_path / "empty.pdf"
    empty.write_bytes(b"")
    with pytest.raises(TimingSheetParseError, match="empty"):
        parse_timing_sheet(empty, backend="canned-fixture")


def test_granite_vision_backend_not_yet_wired(tmp_path):
    fake_pdf = tmp_path / "stub.pdf"
    fake_pdf.write_bytes(b"%PDF-1.4 fake-stub")
    with pytest.raises(NotImplementedError, match="not yet wired"):
        parse_timing_sheet(fake_pdf, backend="granite-vision-4.1-4b")
