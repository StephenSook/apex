# APEX Lite - Contingency Plan (Vinh-unresponsive scenario)

> **DO NOT EXECUTE THIS DOC UNLESS THE TRIGGER FIRES.** This is a written contingency for the scenario where Vinh's GitHub collaborator invite remains unaccepted by Day 2 noon ET, or Vinh's local hardware cannot run Granite TimeSeries TTM r2.1 + cvxpylayers + Granite Guardian within Gate G1's 60-second pass criterion.
>
> **Owner:** Stephen Sookra. **Trigger evaluator:** Stephen, Day 2 noon ET. **If triggered:** Stephen executes this doc Day 2 PM through Day 12. If NOT triggered, this doc stays dead-code in the repo as documentation of the contingency we considered.
>
> **Why this exists:** Codex independent plan-critique #3 (Day 1 EOD) flagged Vinh as a single-point-of-failure and estimated full Vinh-lane delivery probability below 50% until Gate G1 passes. The galaxy-tier project plan assumes Vinh delivers Days 2-12 in parallel. Without a documented contingency, a 24-hour Vinh-silence on Day 2 forces Stephen into a midnight scramble.

---

## Trigger conditions (Day 2 noon + PM evaluation)

Invoke APEX Lite if **any** of the following is true:

**Evaluated at 12:00 noon ET on 2026-05-21 (Vinh-availability triggers):**

- [ ] Vinh has NOT accepted the GitHub collaborator invite at https://github.com/StephenSook/apex
- [ ] Vinh has NOT cloned the repo (no commits visible from Vinh's GitHub-attributed email)
- [ ] Vinh has NOT responded to Stephen's text + email follow-ups in the 24 hours since Day 1 EOD
- [ ] Vinh ran `pip install granite-tsfm` on his machine and the install fails on his Python / CUDA / OS combination
- [ ] Vinh ran the Gate G1 TTM smoke test and the inference took >120s (2x budget) on his hardware

**Evaluated end-of-Day-2 (TTM-domain-shift triggers, per PLAN.md task 2.6 G4 bump):**

- [ ] Vinh ran the Gate G4 parallel spike (TTM zero-shot vs seasonal-naive on 5 FastF1 holdout circuits) and TTM LOST to seasonal-naive on 3 or more of the 5 holdouts. This is the "domain shift" failure mode: TTM was pretrained on weather and retail data and may not transfer to motorsport telemetry. If Gate G4 fails, the entire "first pretrained TSFM on motorsport telemetry" pitch claim collapses, and Lite mode preserves the COA + physics layer + Granite Instruct narrator without the failing TSFM.

If NONE of the above: full project continues per `PLAN.md` Phase 0-7. This doc stays dead.

If ANY of the above: Stephen invokes APEX Lite per the rest of this document. Distinct from Q-004's Day-10 LATE trigger (Day 9 dress-rehearsal sim-rig + Colab failure stack) per PLAN.md.

---

## APEX Lite scope (vs. full APEX)

| Component | Full APEX | APEX Lite | Why |
|-----------|-----------|-----------|-----|
| Frontend | Next.js 16 landing page + dropzone + report UI + judges page + status page | Same (Stephen-lane already shipped Day 1) | No change |
| Document parsing | Granite-Docling 258M parses COA PDF | **Pre-parsed canned JSON** (Sarah Reynolds fixture) | Stephen pre-bakes the COA JSON manually using the structured layout in `docs/sarah-reynolds-persona.md` |
| Timing-sheet parsing | Granite Vision 4.1 parses timing PDFs | **Pre-parsed canned CSV** | Same approach - manual data entry, committed as fixture |
| Telemetry aggregation | 1-Hz mini-sector aggregator | Same (deterministic, no model) | Stephen ports the aggregator to a pure Python module without Vinh-style backend infrastructure |
| **TTM forecaster** | Granite TimeSeries TTM r2.1 zero-shot | **Seasonal-naive baseline (deterministic, no ML)** | Without Vinh's hardware, TTM cannot run. Seasonal-naive ("next lap looks like this lap minus the symptom Sarah described") is honest about being naive. |
| Two-stage projection-and-audit layer | Stage 1 differentiable CvxpyLayer QP (friction ellipse + forward-Euler + jerk bound) + Stage 2 post-projection feasibility filter (bicycle-model coupling + COA-parameterized brake-throttle simultaneity gate) | **Pure NumPy validator (V1 from PLAN.md task 2.1)** | Validator catches impossible physics, returns text log. No differentiable QP needed in Lite. Lite collapses Stage 1 + Stage 2 into a single validator pass without the convexity carve-out. |
| Guardian text audit | Granite Guardian 4.1 BYOC custom rules | **Pure Python regex + heuristic audit** | Lite audit checks for "throttle * brake > 0 when COA forbids," "lateral G exceeds friction limit," "speed violates kinematic step." Returns same JSON shape as full Guardian. |
| Narrator | Granite 4.1 8B Instruct via watsonx | **Single watsonx.ai API call (Stephen's API key)** | Stephen invokes Granite Instruct as a hosted endpoint (no local hardware). Lite stays IBM-stack-pure. |
| Langflow visible orchestration | Live Langflow graph export | **Static Langflow graph screenshot** | Designed once, used as deck slide + landing page diagram. |

**Net architectural delta:** TTM → seasonal-naive baseline, cvxpylayers QP → NumPy validator, Granite Guardian local model → hosted-API or rule-based audit. Three substitutions. Pitch claims must be honestly updated.

---

## Lite pitch updates (if invoked)

The 3-min pitch script (`docs/3-min-pitch-script.md`) needs targeted edits if Lite invoked:

- **Beat 4 (Architecture):** drop "frozen Granite TimeSeries TTM forecaster" claim; replace with "deterministic baseline forecaster wrapped in the same physics-projection layer that would constrain a foundation model when added." Honest about the bait-and-switch.
- **Beat 5 (COA killshot):** unchanged. COA-parameterized brake-throttle simultaneity is the architectural innovation, independent of TTM.
- **Beat 7 (Stack count):** "Five IBM tools, all load-bearing" instead of the full fourteen. Drop Granite TimeSeries TTM + Granite Guardian local-model claims. Keep Granite-Docling (or canned-JSON fallback), Granite Vision (or canned-CSV fallback), Granite 4.1 8B Instruct (hosted API), Langflow (static screenshot), Docling library.
- **NeurIPS paper draft (S10 in Stretch):** cut. No novel TSFM contribution if TTM is not used.

---

## Lite timeline (Day 2 PM trigger)

| Day | Stephen-only work |
|-----|-------------------|
| 2 PM | Manually create `fixtures/coa/sarah-coa.json` from the persona doc (3 hours). Manually create `fixtures/telemetry/sarah-lap-17.csv` synthetic at 1 Hz (2 hours). Write 1-Hz aggregator module in `app/backend-lite/apex/aggregator.py` (1 hour). Skip `app/backend/` writes; create `app/backend-lite/` instead to leave Vinh's lane unbroken if he reappears. |
| 3 | Write NumPy physics validator (`app/backend-lite/apex/validator.py`, port from PLAN task 2.1 spec). Test against 5 hand-crafted impossible-physics traces. Gate G3 equivalent. |
| 4 | Write seasonal-naive forecaster (`app/backend-lite/apex/forecaster.py`, simple "next lap = this lap - debrief symptom adjustment"). |
| 5 | Wire watsonx.ai hosted Granite Instruct call (`app/backend-lite/apex/narrator.py`). Stephen's IBM API key. |
| 6 | End-to-end: telemetry CSV + COA JSON + debrief → coaching report. Gate G6-equivalent on Sarah fixture. |
| 7-8 | Polish + caching + Langflow screenshot. |
| 9-10 | Demo video Lite mode (still cinematic, still 3 minutes, still hero stat). |
| 11 | Submission package, methodology trace honestly explains the Lite substitution, paper draft S10 cut. |
| 12 | Submit. |

Lite has 0 ML novelty but 100% functional product. Honest framing wins more judge points than dead-PhysicsTTM dependency.

---

## If Vinh REAPPEARS mid-Lite

If Vinh joins Day 3-6 with working hardware:
- Vinh takes over `app/backend/` (full path). Lite `app/backend-lite/` stays as a checked-in reference.
- Stephen-Lite code becomes the spec Vinh implements against (the schemas + the test fixtures).
- Switch the frontend API base URL when Vinh's backend passes G6.
- Lite directory archived to `app/backend-lite-archive/` after Day 6 G6 success.

If Vinh joins Day 7+: too late to swap. Ship Lite. Vinh contributes to deck + paper + Vinh-lane stretches (Colab, reproducibility metadata) without touching backend.

---

## Lite quality bar

Lite is NOT "lower quality APEX." Lite is "different architectural pattern, same product surface." Judges should not be able to tell from the demo video alone whether Full or Lite is running. The differences are:

- Lite uses deterministic baseline forecast (we say so explicitly in the deck).
- Lite uses pre-parsed fixtures (we say so explicitly in the methodology).
- Lite's "Three Firsts" claim becomes "Two Firsts" (first AI to ingest FIA COA tensor-level, first integrated workflow for adaptive hand-controls). The "first pretrained TSFM" claim is honestly cut.

Lite calibration ceiling estimate (revised from full APEX's 90/96/88 NotebookLM Phase 5 pass): **75 / 80 / 70** for top-3 / Best Use of Tech / Most Innovative. Lite loses Best Use of Tech ground (no TTM novelty) but holds Most Innovative through COA-tensor-level reading.

---

## Decision-log entry if invoked

If Lite is triggered, immediately append to `docs/decision-log.md`:

```markdown
## YYYY-MM-DD D-Lite: APEX Lite contingency invoked

**Decision.** APEX Lite scope per `docs/apex-lite-contingency.md`. Substitutes seasonal-naive forecaster + NumPy validator + hosted-API Granite Instruct for the full PhysicsTTM stack. Stephen executes `app/backend-lite/` per the contingency timeline.

**Rationale.** Trigger fired Day 2 noon ET: [check exact reason - Vinh-unresponsive / Gate G1 fail / TTM hardware incompatibility].

**Affected.** Pitch (Beat 4 + Beat 7 edits), README ("Eight IBM tools" → "Six IBM tools"), `paper/` (NeurIPS draft S10 cut), `app/backend/` (stays untouched, Vinh's lane preserved if he reappears).
```

---

_Drafted: 2026-05-20 Day 1 EOD by Stephen, per Codex critique #3._
_Trigger evaluation: Day 2 noon ET (2026-05-21 12:00 ET)._
