# LinkedIn DM Draft - Adaptive Driver B (Day 3 escalation)

> Per Q-002 (revised from Day 7 → Day 3 by Codex critique #4). Send 2026-05-22 evening from Stephen's LinkedIn. Same content + tone as Driver A draft, addressed to a second adaptive UK championship competitor for redundant outreach surface.
>
> **Owner:** Stephen Sookra. **Send method:** LinkedIn DM with 60-second video pitch attached.
>
> Driver B handle: `[PRIVATE: fill in at send time, keep out of public anonymized files]`

---

## To

[PRIVATE: Driver B's LinkedIn handle]

## Body

Hi [first name],

I'm a sophomore CS student at Kennesaw State University. My teammate Vinh and I are building APEX, an AI race engineer specifically tuned for drivers running adapted controls, for the IBM SkillsBuild AI Builders Challenge. Submission 2026-05-31.

The short version: APEX reads a driver's telemetry, their FIA Certificate of Adaptations, and a written debrief, then produces a corner-by-corner coaching report. The architecture is built on IBM Granite, the same platform IBM ships in its public Ferrari case study, plus a two-stage validator at inference: a differentiable convex QP that handles friction-ellipse + forward-Euler + jerk-bound, then a post-projection feasibility filter that audits the bicycle-model coupling and the COA-parameterized brake-throttle simultaneity gate at tensor level. Public documentation for the leading commercial AI race-engineer tools we surveyed (Track Titan, Trophi.ai) does not show any conditional removal of the able-bodied `throttle * brake = 0` mutual-exclusion assumption nor any FIA-COA parsing path, so adaptive technique reads as invalid telemetry or driver error. We fix that.

I'm reaching out because UK adaptive-championship drivers like you are the entire audience for this. One-sentence quote on whether a tool like this - reading the actual COA at tensor level, free at the point of use, built for the budget reality of grassroots adaptive racing - would actually help?

A "yes, this would matter because..." is enough. We'd credit you (per-surface consent: deck vs README vs video, each asked separately).

60-second video pitch: [LINK PRIVATE]

Repo public Day 1: https://github.com/StephenSook/apex

Thanks for the time.

Stephen Sookra
KSU CS / IBM SkillsBuild Challenge
[school address kept private]
LinkedIn: linkedin.com/in/stephen-sookra-633682339

---

## After-send checklist

Same as Driver A draft.

---

_Last updated: 2026-05-20 Day 1 EOD draft by Stephen. Send Day 3 (2026-05-22) evening, ideally within 1 hour of Driver A so reply rates are comparable._
