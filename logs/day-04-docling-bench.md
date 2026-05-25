# Day 4 — Granite-Docling 258M fallback-ladder log

Phase 1 task 1.5 per docs/vinh-backend-plan.md L125. Records the COA-PDF
parsing fallback ladder + the wave-44 Day-4-morning posture (JSON-first,
PDF-second).

## Wave-44 posture

The Phase 1 happy path consumes a structured JSON COA stub
(`fixtures/personas/sarah-reynolds-coa-stub.json`) directly, bypassing the
Granite-Docling 258M PDF -> JSON step entirely. This is the design choice
the wave-42 / wave-44 commits ship around:

- `app/backend/apex/instruct/coa_parser.py` ingests JSON via
  `parse_coa_json()` / `parse_coa_payload()`.
- The Sarah fixture is hand-authored to mirror the FIA Appendix L COA
  structure that Granite-Docling would emit when parsing a real medical
  certificate (so swapping in the PDF path later is field-for-field
  drop-in, not a schema rewrite).
- This avoids spending Day-4 morning on Docling Windows install + image
  preprocessing while the SCP / cvxpylayers stack is still settling on the
  same machine.

Granite-Docling PDF parsing remains the Phase 2 / Phase 3 swap target. The
fallback ladder below applies once Docling is wired in.

## Fallback ladder (when Docling-on-PDF goes live)

| Rung | Engine | Trigger to advance |
|------|--------|--------------------|
| 1 | Granite-Docling 258M | Default. Multi-column FIA Appendix L PDFs + scanned medical certificates. |
| 2 | LlamaParse | Docling raises on multi-column layout, French legal templates, or rotates text below confidence threshold. |
| 3 | Mistral OCR | LlamaParse parses but produces incoherent simultaneity-anchor strings (`derive_simultaneity_flag` returns False on a COA that visually approves simultaneity). |
| 4 | Manual JSON | All three OCR engines fail. Author the JSON by hand against the Sarah-stub schema; mark the resulting record with `_meta.parser_path = "manual-fallback"` in the payload. |

## Rung-1 readiness checklist (deferred to Phase 2)

- [ ] `granite-docling-258m` wheel installs on Windows + CUDA 12.1 inside
      `app/backend/.venv`.
- [ ] Docling emits JSON with the same nested keys the Sarah stub uses
      (`fia_appendix_l_conditional_approvals[*].article_section`,
      `adaptive_equipment_specifications.hand_control_configuration.simultaneity_geometry`).
      If Docling emits flat key/value, write a `_normalize_docling()`
      adapter inside `coa_parser.py` rather than reshape the stub schema.
- [ ] Round-trip test: load the Sarah PDF (when it lands), parse via
      Docling, assert `parse_coa_payload(docling_output)` returns a
      `CoaParseResult` byte-equal to `parse_coa_json(sarah_stub_path)`
      except for `_meta` provenance fields.

## Why the JSON-first path is safe for Phase 1

The G2 gate (task 1.6) requires that the parser surface all 9 adaptation
domains from a Sarah-style COA. JSON-first ingestion satisfies G2 because
the fixture is authored against the same schema Docling will eventually
emit; the simultaneity-flag derivation rules in `derive_simultaneity_flag`
work identically against either source.

The risk we accept: if Docling's emitted JSON keys differ from the Sarah
stub's keys, the rung-1 swap will need a `_normalize_docling()` adapter.
We mitigate by keeping the Sarah stub's keys close to the FIA Appendix L
field names Docling is most likely to use when it parses a real medical
certificate.

## Status

Phase 1 done with rung-0 JSON path. Granite-Docling rung-1 wire-up is on
the Phase 2 / Phase 3 punch list, not Day 4 morning.
