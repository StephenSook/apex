"""COA (Certificate of Adaptations) parser.

Phase 1 tasks 1.1 + 1.9. Reads a Sarah-style FIA Appendix L COA JSON stub
and derives the canonical `simultaneity_permitted` scalar from the approved
hardware specifications + medical findings, NOT from an explicit FIA Article
field (per Perplexity validation 2026-05-21 + decision-log D-022 +
docs/sarah-reynolds-persona.md).

The Granite-Docling 258M PDF -> JSON path is a Phase 1.5 swap-point; this
module ships the JSON-first ingestion now so the rest of the pipeline (V1
NumPy validator, V2 cvxpylayers projector, narrator, Guardian) can consume
a stable `CoaParseResult` while the PDF parse matures.

Per docs/vinh-backend-plan.md Phase 1 wave-44 path migration: this module
lives under `instruct/` (not `intake/`) mirroring the rest of the COA + LLM
domain code.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Mapping

ADAPTATION_DOMAINS: tuple[str, ...] = (
    "coa_sec_hand_controls",
    "coa_sec_simultaneity",
    "coa_sec_egress",
    "coa_sec_thermal",
    "medical_findings",
    "adaptive_equipment_specifications",
    "certificate_metadata",
    "driver_metadata",
    "issuing_authority",
)


@dataclass(frozen=True)
class CoaConditionalApproval:
    article_section: str
    fia_appendix_l_reference: str
    condition: str
    approval_status: str
    rationale: str
    evidence_log_id: str | None = None


@dataclass(frozen=True)
class CoaParseResult:
    """Canonical Phase 1 output. Consumed by:
      - shared.contracts.build_ttm_input() (tiles `simultaneity_permitted`
        across the per-step coa_overlap_flag channel of TENSOR_SHAPE)
      - physics.validator.coa_simultaneity_rule (Phase 2)
      - instruct.narrator (Phase 3, citations resolve against
        `conditional_approvals` article_section IDs)
    """

    driver_id: str
    certificate_number: str
    fia_appendix_l_revision: str
    simultaneity_permitted: bool
    conditional_approvals: tuple[CoaConditionalApproval, ...]
    adaptation_domains_present: frozenset[str]
    raw: Mapping[str, Any] = field(repr=False)


class CoaParseError(ValueError):
    """Raised when the COA JSON is missing required schema fields."""


def parse_coa_json(path: str | Path) -> CoaParseResult:
    """Parse a Sarah-style COA JSON stub from disk into a CoaParseResult.

    Schema is the wave-42 `sarah-reynolds-coa-stub.json` shape; see
    `fixtures/personas/sarah-reynolds-coa-stub.json` for the canonical
    example. Raises CoaParseError if any required top-level key is missing.
    """
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    return parse_coa_payload(payload)


def parse_coa_payload(payload: Mapping[str, Any]) -> CoaParseResult:
    for required in ("driver_id", "certificate_metadata", "fia_appendix_l_conditional_approvals"):
        if required not in payload:
            raise CoaParseError(f"COA payload missing required field: {required!r}")

    cert_meta = payload["certificate_metadata"]
    approvals = tuple(
        CoaConditionalApproval(
            article_section=a["article_section"],
            fia_appendix_l_reference=a["fia_appendix_l_reference"],
            condition=a["condition"],
            approval_status=a["approval_status"],
            rationale=a["rationale"],
            evidence_log_id=a.get("evidence_log_id"),
        )
        for a in payload["fia_appendix_l_conditional_approvals"]
    )

    domains_present = frozenset(
        domain
        for domain in ADAPTATION_DOMAINS
        if domain in payload or any(a.article_section == domain for a in approvals)
    )

    return CoaParseResult(
        driver_id=payload["driver_id"],
        certificate_number=cert_meta["certificate_number"],
        fia_appendix_l_revision=cert_meta["fia_appendix_l_revision"],
        simultaneity_permitted=derive_simultaneity_flag(payload),
        conditional_approvals=approvals,
        adaptation_domains_present=domains_present,
        raw=payload,
    )


def derive_simultaneity_flag(payload: Mapping[str, Any]) -> bool:
    """Derive the COA simultaneity-permission scalar from approved hardware
    specs + medical findings.

    Per Perplexity validation 2026-05-21: APEX does NOT read an explicit FIA
    Article field. The flag is derived from two text anchors named in the
    Sarah stub's `annotations_for_extraction_pipeline.extraction_text_anchors`:

      1. fia_appendix_l_conditional_approvals[*] entry with
         article_section == "coa_sec_simultaneity" AND
         condition == "simultaneity_permitted" AND
         approval_status == "approved"

      2. adaptive_equipment_specifications.hand_control_configuration.
         simultaneity_geometry contains "independent lever paths"

    BOTH anchors must agree. If the document root has an explicit
    `simultaneity_permission_flag` boolean (Sarah stub L121), it is used as a
    consistency check against the derived value; mismatch raises
    CoaParseError so we never silently disagree with the fixture.
    """
    approval_anchor = False
    for a in payload.get("fia_appendix_l_conditional_approvals", ()):
        if (
            a.get("article_section") == "coa_sec_simultaneity"
            and a.get("condition") == "simultaneity_permitted"
            and a.get("approval_status") == "approved"
        ):
            approval_anchor = True
            break

    hardware_anchor = False
    hw_config = (
        payload.get("adaptive_equipment_specifications", {})
        .get("hand_control_configuration", {})
    )
    geometry = hw_config.get("simultaneity_geometry", "")
    if isinstance(geometry, str) and "independent lever paths" in geometry.lower():
        hardware_anchor = True

    derived = approval_anchor and hardware_anchor

    explicit = payload.get("simultaneity_permission_flag")
    if isinstance(explicit, bool) and explicit != derived:
        raise CoaParseError(
            "Derived simultaneity flag disagrees with explicit "
            f"`simultaneity_permission_flag` in payload: derived={derived}, "
            f"explicit={explicit}. Refusing to silently resolve; fix the COA "
            "source or the derivation anchors."
        )

    return derived
