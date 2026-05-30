"""Wave-74 COA PDF -> JSON bridge tests (apex/instruct/docling_bridge.py).

Exercises the testable core `coa_dict_from_text()` with a mocked Granite
generator: no pypdf + no network (the pypdf text-extraction is a thin wrapper,
and the OpenRouter generator is injected as a parameter). Locks the
never-guess-the-simultaneity-gate rule + the schema-validation passthrough to
the canonical `parse_coa_payload`. GPU-free-CI-safe: imports only coa_parser
(stdlib) + the bridge.
"""

from __future__ import annotations

import json
from typing import Callable, Union

import pytest

from apex.instruct.coa_parser import parse_coa_payload
from apex.instruct.docling_bridge import (
    CoaBridgeError,
    CoaBridgeUndetermined,
    coa_dict_from_text,
)


def _valid_coa() -> dict:
    return {
        "driver_id": "sarah-reynolds-britcar-2026",
        "certificate_metadata": {
            "certificate_number": "COA-2026-0042",
            "fia_appendix_l_revision": "2026.1",
        },
        "fia_appendix_l_conditional_approvals": [
            {
                "article_section": "coa_sec_simultaneity",
                "fia_appendix_l_reference": "FIA Appendix L per the published revision",
                "condition": "simultaneity_permitted",
                "approval_status": "approved",
                "rationale": "Independent hand-control lever paths approved.",
            }
        ],
        "adaptive_equipment_specifications": {
            "hand_control_configuration": {
                "simultaneity_geometry": "independent lever paths on the steering column"
            }
        },
        "simultaneity_permission_flag": True,
    }


def _gen_returning(payload: Union[dict, str]) -> Callable[[str, int], str]:
    text = payload if isinstance(payload, str) else json.dumps(payload)

    def _gen(prompt: str, attempt: int) -> str:
        return text

    return _gen


def test_valid_pdf_extraction_yields_parseable_coa_with_simultaneity_true():
    result = coa_dict_from_text("doc text", _gen_returning(_valid_coa()))
    parsed = parse_coa_payload(result)
    assert parsed.simultaneity_permitted is True
    assert parsed.driver_id == "sarah-reynolds-britcar-2026"


def test_undetermined_gate_raises_rather_than_guessing():
    # flag null + no simultaneity approval anchor -> undetermined, NEVER False.
    coa = _valid_coa()
    coa["simultaneity_permission_flag"] = None
    coa["fia_appendix_l_conditional_approvals"] = []
    with pytest.raises(CoaBridgeUndetermined):
        coa_dict_from_text("doc text", _gen_returning(coa))


def test_non_json_generation_raises_bridge_error():
    with pytest.raises(CoaBridgeError):
        coa_dict_from_text("doc text", _gen_returning("I cannot produce JSON for that."))


def test_malformed_schema_raises_bridge_error():
    # Keeps the simultaneity approval (passes the undetermined guard) but drops
    # certificate_metadata -> parse_coa_payload rejects -> CoaBridgeError.
    coa = _valid_coa()
    del coa["certificate_metadata"]
    with pytest.raises(CoaBridgeError):
        coa_dict_from_text("doc text", _gen_returning(coa))


def test_fenced_json_is_extracted():
    fenced = "```json\n" + json.dumps(_valid_coa()) + "\n```"
    result = coa_dict_from_text("doc text", _gen_returning(fenced))
    assert result["driver_id"] == "sarah-reynolds-britcar-2026"
