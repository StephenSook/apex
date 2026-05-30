# Spec: Granite-Docling COA PDF -> JSON bridge (the final A+ piece)

Goal: let an arbitrary judge upload a **PDF** Certificate of Adaptations and get the **fully-live** backend pipeline (real physics + Granite Guardian + Granite coaching), exactly like the canonical demo. Today the canonical demo is fully live, but arbitrary uploads fall back to fixture numbers because `/api/analyze-upload` requires a **JSON** COA while the frontend collects a **PDF**.

This is a backend change (Stephen, since the HF Space deploy needs creds/infra Claude cannot run). It also genuinely WIRES Granite-Docling (currently INTEGRATION) into the live path.

## Current state (verified 2026-05-30)

- `app/backend/apex/server.py` `post_analyze_upload`: `_ALLOWED_COA_SUFFIX = {".json"}`, then `json.loads(coa_bytes)` before `run_langgraph`.
- The COA JSON schema the pipeline consumes (from `fixtures/personas/sarah-reynolds-coa-stub.json`) has top keys: `driver_id`, `issuing_authority`, `certificate_metadata`, `driver_metadata`, `medical_findings`, `fia_appendix_l_conditional_approvals`, `adaptive_equipment_specifications`, **`simultaneity_permission_flag`** (the binding COA-gate input), `annotations_for_extraction_pipeline`.
- A COA parser already exists: `app/backend/apex/instruct/coa_parser.py`.
- Granite-Docling (`ibm-granite/granite-docling-258M`) is already named in the provenance footer; it runs on CPU (no GPU required), which fits the HF Spaces free tier.

## Change 1: accept PDF in the upload route

In `post_analyze_upload`:
- `_ALLOWED_COA_SUFFIX = {".json", ".pdf"}`.
- After `_validate_upload(coa, ...)`, branch on the uploaded filename suffix:
  - `.json` -> current path (`json.loads`), unchanged.
  - `.pdf` -> run the bridge below to produce the COA JSON dict, then continue into `run_langgraph` exactly as today.
- Keep the JSON sanity-check (now applied to the bridge output, not the raw bytes).

## Change 2: the bridge (`apex/coa/docling_bridge.py`, new)

Two stages, both CPU:

1. **Docling layout extraction.** Use Granite-Docling / the `docling` library to convert the PDF bytes to structured markdown/text (it preserves headings + tables, which is where the adaptation provisions live). This is the genuine Granite-Docling wiring.
2. **Granite-Instruct structured extraction.** Feed the Docling markdown to Granite 4.1 8B Instruct (the already-wired OpenRouter model, or watsonx) with a strict JSON-only system prompt that maps the document to the COA schema. The non-negotiable field is `simultaneity_permission_flag` (boolean): "does the certificate approve simultaneous brake-and-throttle actuation via the listed hand-control hardware?" Also extract `adaptive_equipment_specifications` and `fia_appendix_l_conditional_approvals`. Reuse the regulatory-anchor scrubber so no invented FIA article numbers leak.

Validate the extracted dict against the COA schema (Pydantic in `apex/schemas.py`); on failure raise HTTP 422 with a clear message. **Never default `simultaneity_permission_flag` silently** - if extraction is not confident, return it as `null` + an `extraction_confidence` annotation so the pipeline (and the UI) can say "COA gate undetermined; upload a structured COA" rather than guessing a safety-relevant flag.

## Change 3: frontend wires the upload path to the backend

Add a server-side proxy `app/frontend/app/api/coaching/analyze-upload/route.ts` (mirror the wave-69 `analyze-demo` route) that forwards the multipart `telemetry` + `coa` (PDF) + `debrief` to `${BACKEND}/api/analyze-upload`, runs the response through the existing `decodeCoachingReport`, and returns `{ ok, report }`. In `AnalyzeFlow.handleAnalyze`, try this route first; on `ok:false` (or 422 undetermined-gate) fall back to the current fixture + live-narrative path. Stamp `narrative_source: "backend-live"` on success (the decoder already does).

## Risk + effort

- Effort: ~1 backend module + 1 route change + 1 frontend proxy + tests. Half a day.
- Risk: Docling cold-start latency on HF free tier (mitigate with the existing 8s-then-fallback timeout). PDF extraction quality varies by COA layout (mitigate with the never-guess-the-flag rule above). Both degrade honestly to the fixture path.
- Verification: upload `app/frontend/public/fixtures/sarah-coa.pdf` -> expect a `backend-live` report whose `simultaneity_permission_flag` matches the canonical JSON; upload a garbage PDF -> expect a 422 + honest fixture fallback, never a guessed gate.

## Why it is the A+ piece

It closes the only remaining gap: today the canonical demo is fully live but arbitrary uploads are prose-live / numbers-fixture. With this, a judge uploading their own telemetry + PDF COA gets the real physics + real Granite pipeline end-to-end, and Granite-Docling moves from INTEGRATION to genuinely WIRED. It is the difference between "the AI is real on our demo" and "the AI is real on YOUR data."
