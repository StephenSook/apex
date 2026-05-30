"""Wave-74: PDF -> COA JSON bridge so arbitrary PDF Certificate-of-Adaptations
uploads run the SAME real pipeline as a structured JSON COA.

STATUS: committed but NOT yet deployed or verified on the HF Space. The
extraction quality varies by PDF layout and the Granite prompt will need
tuning against real certificates on the Space; treat this as a tested-logic
starting point, not a verified-live path. The frontend wiring that routes
uploads here is flag-gated OFF (NEXT_PUBLIC_USE_REAL_ANALYZE_UPLOAD) until
this is deployed + verified, so it cannot affect the live demo.

Design (per docs/coa-docling-bridge-spec.md):
  1. extract_pdf_text(): pypdf text extraction (lazy import; option B in the
     spec, chosen for HF free-tier build safety over the heavier Granite-
     Docling dep). Swap in Granite-Docling here later to also move that tool
     INTEGRATION -> WIRED.
  2. coa_dict_from_text(): the existing OpenRouter Granite Instruct generator
     structures the document text into the canonical COA schema that
     `coa_parser.parse_coa_payload` already consumes.
  3. NEVER guess the simultaneity gate. If the certificate's simultaneity
     provision cannot be determined with confidence, raise
     CoaBridgeUndetermined -> the route returns 422 rather than defaulting the
     gate to False (which would misdiagnose an adaptive driver, the exact
     failure APEX exists to avoid).

The testable core (coa_dict_from_text) takes the generator as a parameter so
it can be unit-tested with a mock + no network + no pypdf.
"""

from __future__ import annotations

import json
from typing import Any, Callable

from apex.instruct.coa_parser import CoaParseError, parse_coa_payload


class CoaBridgeError(ValueError):
    """PDF -> COA extraction failed (no text, bad JSON, schema mismatch)."""


class CoaBridgeUndetermined(CoaBridgeError):
    """The COA simultaneity gate could not be determined from the document.

    Distinct from CoaBridgeError so the route can map it to a specific 422
    "upload a structured COA" message instead of a generic extraction error.
    """


_MAX_PROMPT_CHARS = 12_000

_EXTRACTION_SYSTEM = """You extract a structured Certificate of Adaptations (COA) from raw document text for an adaptive-racing safety pipeline.

Output STRICT JSON ONLY (no prose, no markdown fence) matching this schema:
{
  "driver_id": string,
  "certificate_metadata": {"certificate_number": string, "fia_appendix_l_revision": string},
  "fia_appendix_l_conditional_approvals": [
    {"article_section": string, "fia_appendix_l_reference": string, "condition": string, "approval_status": string, "rationale": string}
  ],
  "adaptive_equipment_specifications": {"hand_control_configuration": {"simultaneity_geometry": string}},
  "simultaneity_permission_flag": boolean | null
}

RULES:
1. The simultaneity gate is safety-relevant. ONLY assert it when the document clearly approves simultaneous brake-and-throttle actuation via the driver's hand-control hardware. When it does:
   - add an approval with article_section "coa_sec_simultaneity", condition "simultaneity_permitted", approval_status "approved";
   - set adaptive_equipment_specifications.hand_control_configuration.simultaneity_geometry to a string that contains the phrase "independent lever paths";
   - set simultaneity_permission_flag to true.
   If the document does NOT clearly approve it, OMIT the coa_sec_simultaneity approval and set simultaneity_permission_flag to null. NEVER guess; null means undetermined.
2. NEVER invent FIA Article numbers. For fia_appendix_l_reference use exactly "FIA Appendix L per the published revision".
3. Use the document's own driver name / certificate number / revision; if a required field is absent, use an empty string (the pipeline will reject an incomplete certificate rather than fabricate one)."""


def extract_pdf_text(pdf_bytes: bytes) -> str:
    """Extract text from a PDF via pypdf. Lazy import so importing this module
    (and the FastAPI server) never requires pypdf, and the GPU-free CI subset
    that does not exercise this path stays green without the dep."""
    try:
        from pypdf import PdfReader
    except ImportError as exc:  # pragma: no cover - import-guard
        raise CoaBridgeError(
            "pypdf is not installed on the backend; add `pypdf` to requirements.txt"
        ) from exc
    import io

    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        text = "\n".join((page.extract_text() or "") for page in reader.pages)
    except Exception as exc:  # noqa: BLE001 - pypdf raises PdfReadError/DependencyError on corrupt, encrypted, or truncated PDFs
        raise CoaBridgeError(
            "could not read the PDF (corrupt, encrypted, or unsupported format); "
            "upload a structured COA or a clearer certificate"
        ) from exc
    if not text.strip():
        raise CoaBridgeError(
            "no extractable text in the PDF (likely a scanned image; needs OCR or the "
            "Granite-Docling layout path, not implemented in this pypdf bridge)"
        )
    return text


def _extract_json(raw: str) -> Any:
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise CoaBridgeError("Granite extraction did not return a JSON object")
    try:
        return json.loads(raw[start : end + 1])
    except json.JSONDecodeError as exc:
        raise CoaBridgeError(f"Granite extraction JSON parse failed: {exc}") from exc


def _has_simultaneity_approval(payload: dict) -> bool:
    approvals = payload.get("fia_appendix_l_conditional_approvals")
    if not isinstance(approvals, list):
        return False
    return any(
        isinstance(a, dict)
        and a.get("article_section") == "coa_sec_simultaneity"
        and a.get("condition") == "simultaneity_permitted"
        and a.get("approval_status") == "approved"
        for a in approvals
    )


def coa_dict_from_text(text: str, generator: Callable[[str, int], str]) -> dict:
    """Structure document text into the canonical COA dict via Granite Instruct.

    Raises CoaBridgeUndetermined when the simultaneity gate is not confidently
    present (never-guess rule), and CoaBridgeError when the extraction is
    malformed or fails the existing `parse_coa_payload` schema validation.
    """
    prompt = f"{_EXTRACTION_SYSTEM}\n\nDOCUMENT:\n{text[:_MAX_PROMPT_CHARS]}"
    try:
        raw = generator(prompt, 0)
    except Exception as exc:  # noqa: BLE001 - external LLM/network boundary; re-raise generically so no upstream response text leaks
        raise CoaBridgeError(
            "COA extraction generator failed (upstream LLM or network error)"
        ) from exc
    payload = _extract_json(raw)
    if not isinstance(payload, dict):
        raise CoaBridgeError("Granite extraction returned non-object JSON")

    explicit = payload.get("simultaneity_permission_flag")
    # Never-guess gate. Treat null AND an uncorroborated non-True value (e.g.
    # the model emitting `false` for an ambiguous certificate instead of the
    # instructed `null`) as undetermined when no approval anchor is present, so
    # a hallucinated negative cannot silently close the gate on an adaptive
    # driver. An affirmative `true` (or any flag backed by the approval anchor)
    # passes here and is consistency-checked by parse_coa_payload below.
    if explicit is not True and not _has_simultaneity_approval(payload):
        raise CoaBridgeUndetermined(
            "COA simultaneity gate could not be determined from the PDF. Upload a "
            "structured COA or a clearer certificate; APEX will not guess a "
            "safety-relevant flag."
        )

    # Reuse the canonical parser for full schema validation + the
    # derived-vs-explicit consistency check. CoaParseError -> 422 upstream.
    try:
        parse_coa_payload(payload)
    except CoaParseError as exc:
        raise CoaBridgeError(f"extracted COA failed schema validation: {exc}") from exc
    return payload


def pdf_to_coa_dict(pdf_bytes: bytes) -> dict:
    """Top-level bridge: PDF bytes -> validated COA dict. Lazily builds the
    OpenRouter Granite generator (returns None when OPENROUTER_API_KEY is unset
    on the backend, which is a hard error here since extraction needs it)."""
    from apex.instruct.openrouter_generator import build_openrouter_generator

    generator = build_openrouter_generator()
    if generator is None:
        raise CoaBridgeError(
            "no Granite generator available for COA extraction (OPENROUTER_API_KEY "
            "unset on the backend Space)"
        )
    text = extract_pdf_text(pdf_bytes)
    return coa_dict_from_text(text, generator)
