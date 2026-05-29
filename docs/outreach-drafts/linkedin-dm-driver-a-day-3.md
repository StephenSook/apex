# LinkedIn DM Draft - Adaptive Driver A (Day 3 escalation)

> Per Q-002 (revised from Day 7 → Day 3 by Codex critique #4). Send 2026-05-22 evening from Stephen's LinkedIn (stephensookra). Driver A's name + LinkedIn URL stays in this private outreach-drafts file pre-consent, NOT in public anonymized files.
>
> **Owner:** Stephen Sookra. **Send method:** LinkedIn DM with 60-second video pitch attached (Loom or YouTube unlisted). **Reply window:** any reply by Day 8 EOD = include in deck; no reply by Day 8 = anonymize across all surfaces. **Per-surface consent ask:** quote permission in deck vs README vs video credits, each separately.
>
> Driver A handle: `[PRIVATE: fill in at send time, keep out of public anonymized files]`

---

## To

[PRIVATE: Driver A's LinkedIn handle]

## Subject (LinkedIn DMs don't have subjects, but use for first line)

Quick ask: AI race engineer for adaptive drivers, IBM SkillsBuild May

## Body

Hi [first name],

I'm a sophomore CS student at Kennesaw State University. My teammate Vinh and I are building APEX, an AI race engineer specifically tuned for drivers running adapted controls, for the IBM SkillsBuild AI Builders Challenge. Submission 2026-05-31.

The short version: APEX reads a driver's telemetry, their FIA Certificate of Adaptations, and a written debrief, then produces a corner-by-corner coaching report. The architecture is built on IBM Granite, the same platform IBM ships in its public Ferrari case study, plus a two-stage validator at inference: a differentiable convex QP that handles friction-ellipse + forward-Euler + jerk-bound, then a post-projection feasibility filter that audits the bicycle-model coupling and the COA-parameterized brake-throttle simultaneity gate at tensor level. Public documentation for the leading commercial AI race-engineer tools we surveyed (Track Titan, Trophi.ai) does not show any conditional removal of the able-bodied `throttle * brake = 0` mutual-exclusion assumption nor any FIA-COA parsing path, so adaptive technique reads as invalid telemetry or driver error. We fix that.

I'm reaching out because adaptive UK championship drivers like you are the entire audience for this. I'd love a one-sentence quote on whether a tool like this - reading the actual COA at the tensor level, free at the point of use, built for the budget reality of grassroots adaptive racing - would actually help.

A "yes, this would matter because..." is enough. We'd credit you (per-surface consent: deck vs README vs video, each asked separately).

60-second video pitch: [LINK PRIVATE: Loom or YouTube unlisted]

Repo public Day 1: https://github.com/StephenSook/apex

Thanks for the time.

Stephen Sookra
KSU CS / IBM SkillsBuild Challenge
[school address kept private]
LinkedIn: linkedin.com/in/stephen-sookra-633682339

---

## Tone notes

- No "inspiring" / "charity" / "disadvantage" / "helping disabled drivers" language. Level-Playing-Field lexicon per Gemini stakeholder intel (Phase 1 outreach planning Day 0).
- Competitive framing only: adapted-control drivers don't need a sympathy product, they need a coaching layer existing tools systematically misdiagnose. Same framing that worked on the Limitless + Raceability cold emails Day 0.
- British spelling on "programme," "organisation," "behaviour" - Driver A is UK-based.
- No em-dash. ASCII hyphens only.

## After-send checklist

- [ ] Verify LinkedIn handle before send.
- [ ] Confirm 60-second video link works on a fresh browser.
- [ ] Log send timestamp in `docs/stakeholder-outreach-log.md` Phase 4.
- [ ] Watch for reply through Day 8 EOD.
- [ ] If reply consents (per surface): add quote to PLAN.md endorsements row + relevant deck/README/video. Revert from anonymization to named on those surfaces.
- [ ] If reply declines or no reply: stay anonymized.

---

_Last updated: 2026-05-20 Day 1 EOD draft by Stephen. Send Day 3 (2026-05-22) evening._
