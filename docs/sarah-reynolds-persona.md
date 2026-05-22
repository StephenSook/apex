# Sarah Reynolds - APEX Hero Persona

> Story-grade synthetic persona for the canned demo case. Used in the 3-minute pitch video, the live demo flow, the landing page Hero block, the /judges Q&A defense pack, and the SUBMISSION.md story. The persona is fictional by design (no real driver named without consent per the operator-attribution principle). Engineering-data files (telemetry CSV, COA JSON, timing sheet CSV) live in `fixtures/` and belong to Vinh's data-pipeline lane.

**Owner:** Stephen Sookra (narrative). **Cross-references:** PLAN.md task 3.3, `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_overview.md` §Hero use case, `app/frontend/app/page.tsx` SarahMoment block, SUBMISSION.md Inspiration block, `app/frontend/components/AnalyzeFlow.tsx` buildMockReport().

---

## Identity

**Name:** Sarah Reynolds.
**Age:** 34.
**Background:** RAF veteran. Left-leg amputee from a 2021 incident during a deployment that the persona does not discuss publicly. Out of service for 18 months recovery. Picked up a veteran motorsport rehabilitation programme in 2023.
**Day job:** Engineer at a regional aerospace firm in Bristol. Race weekends only.

## Racing context

- **Series:** Britcar Trophy 2026.
- **Car:** #34 BMW M240i.
- **Adaptations:** electronic hand-control system from a leading UK adaptive-hand-control supplier (supplier name pending per-surface consent per Q-006). Push-to-brake lever on the right of the steering wheel; throttle on the left; clutchless paddle shift. FIA Certificate of Adaptations under the Appendix L provisions on file with the ASN.
- **Crew:** One mechanic, one volunteer engineer. No paid race engineer.
- **Circuit history:** First full season at Britcar. Came up through 2024 Mazda MX-5 Cup with a borrowed adapted car, then a 2025 partial Britcar campaign on a tight budget.

## The demo scene

**Donington Park GP. Saturday qualifying. Lap 17 of 19.**

Sarah is two tenths off her personal best. Sector 2 keeps falling apart at the Old Hairpin (T7). She knows it on the lever but cannot articulate why. Her volunteer engineer cannot diagnose it from the AIM data alone. Her debrief into the team app:

> Lost the rears mid-Old Hairpin again. Cannot trail-brake on the lever the way I did at Croft last month. Sector 2 was plus zero point three four against my PB.

That debrief, plus her telemetry slice and her COA on file, is what APEX takes as input.

## Three-corner deep dive (matches `buildMockReport()` in AnalyzeFlow.tsx)

### Sector 1, T4 (McLeans). +0.08 s vs reference.

Throttle pickup is two car-lengths late on entry. Steering angle peaks at 0.42 rad before throttle re-application; the ideal pattern (her own Croft lap reference) has throttle ramping back from the apex moment, not after the steering angle resolves. On the lever-controlled rig, the cognitive load of switching from braking-lever to throttle-lever costs her roughly 80 ms across this single transition. APEX's coaching report flags it; the recommendation is timing-only, no tuning change.

### Sector 2, T7 (Old Hairpin). +0.34 s vs reference. The hero failure.

Brake-pressure trace shows her hand-lever brake travel maxing at 38 mm with a release-rate that is 0.4 s earlier than her T7 reference lap at Croft. The mechanism: at full lever travel, the secondary actuation point requires a wrist-pivot that her amputation-side prosthetic stub leverages awkwardly. She is effectively trail-braking against herself. APEX's two-stage physics validator processes her forecast: Stage one's convex QP keeps the friction-ellipse + forward-Euler + jerk-bound constraints satisfied, and Stage two's feasibility filter reads her COA simultaneity flag (Section 3(c) permits brake + throttle simultaneity through entry) before clearing the brake-throttle overlap. APEX then recommends a 4 mm hand-lever brake-travel reduction at the secondary actuation point. That recommendation cites Article 18.3 of Appendix L (governing the COA structure) + Section 3(c) of her specific COA (the simultaneity permission). The forecast envelope shows her recovering 0.42 s in Sector 2 next qualifying if she applies the tuning delta.

### Sector 3, T11 (Coppice). -0.05 s vs reference. The unexpected positive.

Sarah is actually faster than her reference lap here. Mid-corner throttle pickup is conservative by roughly five percent; she has margin to push without breaching the friction ellipse. APEX notes the positive and tells her she has runway to be more aggressive at T11. Coaching is not just diagnosis; it is also permission.

## Telemetry annotation (lap 17, condensed)

Eight channels at 50 Hz aggregated to 1-Hz mini-sectors:

| Mini-sector | Speed (mps) | Throttle | Brake (Pa) | Steering (rad) | Lat-G | Long-G |
|-------------|------------|----------|------------|----------------|-------|--------|
| Entry McLeans | 41.2 | 0.20 | 2.4M | 0.12 | -0.31 | -0.42 |
| Apex McLeans | 38.5 | 0.45 | 1.1M | 0.42 | -0.65 | 0.15 |
| Exit McLeans | 44.8 | 0.92 | 0.0M | 0.18 | -0.28 | 0.71 |
| Entry Old Hairpin | 32.1 | 0.12 | 3.2M | 0.55 | -0.42 | -0.78 |
| **Apex Old Hairpin (failure point)** | **24.3** | **0.18** | **1.8M** | **0.92** | **-0.81** | **-0.22** |
| Exit Old Hairpin | 28.9 | 0.62 | 0.4M | 0.51 | -0.55 | 0.48 |
| Entry Coppice | 39.6 | 0.18 | 2.1M | 0.31 | -0.34 | -0.52 |
| Apex Coppice | 35.2 | 0.78 | 0.2M | 0.48 | -0.71 | 0.32 |

The failure-point row at Apex Old Hairpin shows brake (1.8 MPa) AND throttle (0.18, non-zero) present simultaneously. Standard tools assume `throttle * brake = 0`; they flag this row as either invalid telemetry or driver error. APEX runs Stage one of its physics validator (the convex QP confirms peak lat-G of 0.81 + long-G of -0.22 sits within the constant-mu friction ellipse) and Stage two of its feasibility filter (reads the COA simultaneity flag, sees Section 3(c) explicitly permits the brake-throttle overlap, audits the bicycle-model coupling for the resulting trajectory), then recommends the tuning delta instead of flagging the input.

## COA Section 3(c) excerpt (paraphrased; full text not reproduced)

> Adaptation domain 3: brake actuation. The driver utilises an electronic hand-control braking system substituting for the left-foot pedal. Simultaneous brake-and-throttle actuation is permitted as a designed operational mode of the adaptive equipment, provided the maximum combined force application does not exceed the friction envelope of the tyre compound homologated for this vehicle class. Permitted secondary actuation: dual-stage trigger at 38 mm primary travel + secondary travel between 30 mm and 42 mm at driver discretion.

The 4 mm reduction APEX recommends (from 38 to 34 mm) lands within the Section 3(c) permitted-secondary-actuation range. The recommendation cites the section + the homologation class; nothing is invented. Provenance footer carries the audit ID, the Granite model versions, and the commit SHA.

## What APEX returns to Sarah

1. **Corner-by-corner coaching report.** Three corners flagged with delta-vs-reference + recommendation prose + citation chip (Appendix L Article 18.3 + COA Section 3(c) for the simultaneity citation).
2. **Tuning recommendation card.** Reduce hand-lever brake travel by 4 mm. Cite Article 18.3 of Appendix L + Section 3(c) of her COA. Provenance footer shows the Granite Guardian audit ID + model versions + commit SHA + COA section IDs.
3. **Next-session forecast chart.** 10 mini-sector envelope projection. Confidence band reflects the two-stage validator's residual uncertainty after Stage one's friction-ellipse + forward-Euler + jerk QP has corrected the forecast and Stage two's bicycle-model + COA-simultaneity audit has cleared the trajectory.
4. **Guardian safety stamp.** Recommendation cleared against Sarah's COA safe envelope. Reasoning trace visible in think-mode (4 steps for the canned mock case).

## Why Sarah specifically

She is the entire demographic in one persona:

- **Adaptive driver community:** her amputation requires hand-controls. Standard race-engineering tools (Track Titan, Trophi.ai) misdiagnose her simultaneous brake-throttle inputs as driver error. APEX reads her COA at the tensor level and permits the simultaneity her car explicitly supports.
- **Veteran motorsport community:** a veteran motorsport rehabilitation programme routed her into racing. Multiple UK + US programmes serve the same demographic (anonymized aggregate per operator-attribution rule; canonical programme list in private memory).
- **Grassroots community:** no paid race engineer. Volunteer crew. Budget-bound. The £400-500 a day a pro engineer costs is the difference between her getting coaching and not.

She is the human form of the £500-a-day-coaching-gap that APEX exists to close.

## Compliance notes

- Sarah is **fictional**. No real driver named.
- Supplier and adaptive-racing-programme naming anonymized to role descriptions until per-surface consent confirmed per Q-006 in PLAN.md. Consent email sent 2026-05-20 PM.
- Veteran motorsport rehabilitation programmes referenced as anonymized aggregate ("a veteran motorsport rehabilitation programme," "multiple UK + US programmes"). Canonical programme list kept in private memory `project_apex_stakeholders.md` only.
- The verbatim debrief above is the only quoted "speech." The landing page renders it as a blockquote with the giant accent quotation mark for editorial effect, plus the disclaimer "Persona is fictional by design. No real driver named without consent."
- All telemetry numbers above are synthetic + chosen to be physically plausible while honoring the demo narrative. Vinh's Day-6 fixture CSV in `fixtures/telemetry/sarah-lap-17.csv` is the engineering-grade replacement.

## What lives in Vinh's lane (do not write without coordination)

- `fixtures/telemetry/sarah-lap-17.csv` (synthetic but physically plausible 50 Hz × 8 channels)
- `fixtures/coa/sarah-coa.json` (synthetic FIA COA matching the 9 adaptation domains, with COA-simultaneity flag set true at Section 3(c))
- `fixtures/timing-sheets/sarah-britcar-q1.csv` (synthetic timing sheet)

These three files are joint task 3.3 in PLAN.md, scheduled for Day 6 alongside the Granite 4.1 8B Instruct narrator integration. Vinh owns the data schemas; Stephen reviews for narrative coherence with this persona document. The dummy CSV currently shipping at `app/frontend/public/fixtures/sarah-lap-17.csv` is wave-15 placeholder data for Playwright e2e + manual QA only; Vinh's Day-6 fixtures replace it.

---

_Last updated: 2026-05-21 evening by Stephen (wave-19 expansion: three-corner deep-dive matching `buildMockReport()` mock data + telemetry annotation table + COA Section 3(c) excerpt + veteran-motorsport programme anonymization brought into line with wave-17 anonymization sweep)._
