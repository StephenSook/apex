# Vinh Phase 1 handoff (Day 4 morning start)

Stephen-side responses to Vinh's 3 open Phase 1 questions from the
Day-3 EOD handoff. Locked 2026-05-24 Day 6.

Created in response to Vinh's message:

> Three open questions for Phase 1 to start cleanly Day 4 morning:
> 1. COA fixture source. Synthetic Sarah COA (I author, ~1h), real
>    published FIA template, or anonymized MME sample?
> 2. OpenRouter vs watsonx.ai API key for task 1.7. Whichever account
>    you stand up + send `.env` entry.
> 3. Phase 1 task ownership split. Proposed: I take 1.1-1.6 + 1.9
>    (parsing + simultaneity flag); you take 1.7 + 1.8 (API plumbing).

## Q1 - COA fixture source

**Decision: synthetic Sarah Reynolds COA fixture (Stephen authors,
~1h Day 7).**

Reasons:

- Sarah Reynolds is a fictional persona by design per the NIL
  protection rule (`docs/sarah-reynolds-persona.md`). The COA
  fixture must remain fictional + watermarked so we never accidentally
  shift the persona into a real-driver attribution surface.
- Real published FIA templates carry IP licensing ambiguity that does
  not benefit the hackathon submission timeline. FIA Article 18.3
  citation in the provenance footer is enough; we do not need to
  reproduce the actual FIA medical-certificate form layout.
- Anonymized MME Motorsport sample is RESERVED for cross-validation
  in a Phase 4 / Phase 5 pre-submission session. The Marko Mlakar
  consent grant (per `feedback_anonymization_pre_consent.md` +
  `project_apex_consent_mme_motorsport.md`) covers MME naming in
  apex-one-black.vercel.app + README + BeMyApp Story + 3-min video. Anonymized
  per-driver hand-control specs from MME are out of scope for Phase
  1 + would require a second consent surface scope.

Stephen ships synthetic Sarah COA at `fixtures/personas/sarah-
reynolds-coa-stub.json` by Day 7 EOD. Watermark header per the
existing `sarah-reynolds-telemetry-stub.csv` convention. Vinh's
COA parser (task 1.1-1.6) consumes from this path.

## Q2 - OpenRouter vs watsonx.ai

**Decision: OpenRouter first (primary path). watsonx.ai as bonus
track for "Best Use of IBM Tech" category if time permits.**

Reasons:

- OpenRouter was explicitly approved by Discord (Lucas-BMA) on Day 1
  EOD for the Granite model. Reference:
  `reference_discord_intel_day_1.md`.
- D-019 plan task 5.1 already aligns on OpenRouter for the demo path.
- watsonx.ai requires IBM Cloud account standup + IAM token plumbing
  that costs ~3h of Day 4 + Day 5 time. OpenRouter is one `.env`
  entry + standard OpenAI-compatible HTTP client.
- watsonx.ai bonus path: if Stephen finishes apex-one-black.vercel.app deploy +
  judges-tour + pre-submission infrastructure with ≥ 4h runway, add
  watsonx.ai as a secondary code path so the submission can claim
  "runs on watsonx.ai AND OpenRouter" for the Best Use of IBM Tech
  category judging.

Stephen stands up the OpenRouter account + sends Vinh the API key
via Discord DM by Day 4 EOD. `.env` entry format:

```
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=meta-llama/llama-3.1-70b-instruct  # placeholder; Vinh swaps to Granite slug
```

Granite-on-OpenRouter exact model slug: Vinh confirms via OpenRouter
model catalog at api.openrouter.ai/v1/models when standing up
task 1.7. The wave-30 architecture spec assumes "ibm-granite/granite-
4.1-8b-instruct" or similar; verify before committing the model
string.

## Q3 - Phase 1 task ownership split

**Decision: accept Vinh's proposed split unchanged.**

| Task | Owner | Surface |
|------|-------|---------|
| 1.1 COA document upload endpoint | Vinh | FastAPI POST /api/coa/upload |
| 1.2 Granite-Docling 258M COA parse | Vinh | docling pipeline + JSON output |
| 1.3 COA simultaneity-flag extraction | Vinh | Pydantic schema + extraction rule |
| 1.4 COA validation against FIA Article 18.3 | Vinh | rule-based validator |
| 1.5 COA persistence to disk | Vinh | filesystem + indexing |
| 1.6 COA fixture-to-payload converter | Vinh | Sarah fixture -> Pydantic |
| 1.7 OpenRouter Granite 4.1 8B API plumbing | Stephen | env vars + fetch wrapper + retry policy |
| 1.8 Streaming-response handler | Stephen | SSE wrapping + UI hook |
| 1.9 Coaching-recommendation simultaneity-aware prompt | Vinh | Granite prompt template + few-shot |

Split rationale:

- Vinh owns the document-parsing + COA-domain stack (1.1-1.6 + 1.9)
  because the Granite-Docling pipeline + simultaneity-flag semantics
  + FIA Article 18.3 validation are backend-domain heavy + map to
  his Day-2 Phase 0 lane.
- Stephen owns the API plumbing (1.7 + 1.8) because OpenRouter
  standup + SSE streaming wrap into the apex-one-black.vercel.app frontend hook
  which Stephen already owns end-to-end.
- The 1.6 fixture-to-payload converter stays with Vinh because the
  synthetic Sarah COA fixture (Stephen authors per Q1) ships as raw
  JSON; the parsing pipeline that converts to Pydantic stays Vinh-
  domain.

Phase 1 done = end of Day 5 per the plan. Phase 2 (V1 NumPy
validator full implementation) starts Day 6.

## Cross-references

- `docs/decision-log.md` D-005 + D-019 (OpenRouter alignment).
- `docs/sarah-reynolds-persona.md` (fictional-persona NIL protection).
- `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_consent_mme_motorsport.md` (MME consent scope).
- `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/reference_discord_intel_day_1.md` (OpenRouter Discord approval).
- `docs/vinh-backend-plan.md` (Phase 1 task numbering source).

## Status

Sent to Vinh via Discord DM 2026-05-24 Day 6 morning. Waiting for
acknowledgement before Day 4 morning Phase 1 kickoff.
