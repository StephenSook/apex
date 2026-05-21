# Sarah Reynolds - APEX Hero Persona

> Story-grade synthetic persona for the canned demo case. Used in the 3-minute pitch video, the live demo flow, the landing page Hero block, and the SUBMISSION.md story. The persona is fictional by design (no real driver named without consent per the operator-attribution principle). Engineering-data files (telemetry CSV, COA JSON, timing sheet CSV) live in `fixtures/` and belong to Vinh's data-pipeline lane.

**Owner:** Stephen Sookra (narrative). **Cross-references:** PLAN.md task 3.3, `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_overview.md` §Hero use case, `app/frontend/app/page.tsx` SarahMoment block, SUBMISSION.md Inspiration block.

---

## Identity

**Name:** Sarah Reynolds.
**Age:** 34.
**Background:** RAF veteran. Left-leg amputee from a 2021 incident during a deployment that the persona does not discuss publicly. Out of service for 18 months recovery. Picked up Mission Motorsport's recovery programme in 2023.
**Day job:** Engineer at a regional aerospace firm in Bristol. Race weekends only.

## Racing context

- **Series:** Britcar Trophy 2026.
- **Car:** #34 BMW M240i.
- **Adaptations:** MME Motorsport electronic hand-control system (push-to-brake lever on the right of the steering wheel; throttle on the left; clutchless paddle shift). FIA Article 18.3 Certificate of Adaptations on file with the ASN.
- **Crew:** One mechanic, one volunteer engineer. No paid race engineer.
- **Circuit history:** First full season at Britcar. Came up through 2024 Mazda MX-5 Cup with a borrowed adapted car, then a 2025 partial Britcar campaign on a tight budget.

## The demo scene

**Donington Park GP. Saturday qualifying. Lap 17 of 19.**

Sarah is two tenths off her personal best. Sector 2 keeps falling apart at the Old Hairpin (T7). She knows it on the lever but cannot articulate why. Her volunteer engineer cannot diagnose it from the AIM data alone. Her debrief into the team app:

> Lost the rears mid-Old Hairpin again. Cannot trail-brake on the lever the way I did at Croft last month. Sector 2 was plus zero point three four against my PB.

That debrief, plus her telemetry slice and her COA on file, is what APEX takes as input.

## What APEX returns to Sarah

1. **Corner-by-corner coaching report.** Identifies that her brake-pressure trace at T7 is releasing 0.4 seconds earlier than her T7 reference lap at Croft. The TTM-forecasted next-session envelope shows she can recover ~0.42s in sector 2 with a 4 mm reduction in hand-lever brake travel (her COA permits hand-control adjustment in this range; Section 3(c)).
2. **Tuning recommendation card.** Reduce hand-lever brake travel by 4 mm. Cite Article 18.3.2(c) of Appendix L + Section 3(c) of her COA. Provenance footer shows the Granite Guardian audit ID + model versions + commit SHA + COA section IDs.
3. **Next-session forecast chart.** Lap 17 PB-minus-0.42 achievable in next qualifying session if the tuning delta is applied. Confidence band reflects the physics-projection layer's residual uncertainty after the friction-ellipse + bicycle-model constraints have corrected the forecast.
4. **Guardian safety stamp.** Recommendation cleared against Sarah's COA safe envelope. Reasoning trace visible in think-mode.

## Why Sarah specifically

She is the entire demographic in one persona:

- **Adaptive driver community:** her amputation requires hand-controls. Standard race-engineering tools (Track Titan, Trophi.ai) misdiagnose her simultaneous brake-throttle inputs as driver error. APEX reads her COA at the tensor level and permits the simultaneity her car explicitly supports.
- **Veteran motorsport community:** Mission Motorsport routed her into racing. Operation Motorsport and Spinal Track serve the same demographic.
- **Grassroots community:** no paid race engineer. Volunteer crew. Budget-bound. The £400-500 a day a pro engineer costs is the difference between her getting coaching and not.

She is the human form of the £500-a-day-coaching-gap that APEX exists to close.

## Compliance notes

- Sarah is **fictional**. No real driver named.
- MME Motorsport is named as the **adaptation supplier**. Per Q-006 in PLAN.md, per-surface consent is being requested (Day 2 email). If declined, anonymize to "leading UK adaptive-hand-control supplier."
- Mission Motorsport, Operation Motorsport, Spinal Track named as **programme contexts** that match Sarah's recovery pathway. Public-charity context, lower per-surface risk than naming individuals, but per-surface consent is the standard.
- The verbatim debrief above is the only quoted "speech." The landing page renders it as a blockquote with the giant accent quotation mark for editorial effect, plus the disclaimer "Persona is fictional by design. No real driver named without consent."

## What lives in Vinh's lane (do not write without coordination)

- `fixtures/telemetry/sarah-lap-17.csv` (synthetic but physically plausible 50 Hz × 8 channels)
- `fixtures/coa/sarah-coa.json` (synthetic FIA COA matching the 9 adaptation domains, with COA-simultaneity flag set true)
- `fixtures/timing-sheets/sarah-britcar-q1.csv` (synthetic timing sheet)

These three files are joint task 3.3 in PLAN.md, scheduled for Day 6 alongside the Granite 4.1 8B Instruct narrator integration. Vinh owns the data schemas; Stephen reviews for narrative coherence with this persona document.

---

_Last updated: 2026-05-20 PM by Stephen (Day 1 EOD initial draft, no engineering-data files written per Vinh-lane respect)._
