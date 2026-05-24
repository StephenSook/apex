# Mission Motorsport Intro Email (Day 6 unconditional outreach)

> Phase 6 unconditional outreach to Mission Motorsport, the UK Armed Forces' motorsport charity. Send 2026-05-25 (Day 6) for chance at Day 11 reply within 7-14d charity response window. Distinct from Phase 1 (which targeted Mission 44, a different organisation despite the name similarity).
>
> **Owner:** Stephen Sookra. **Send method:** Email from school address `ssookra@students.kennesaw.edu`. **Reply window:** through Day 11 EOD (2026-05-30); anonymisation locks Day 12 morning if no reply. **Per-surface consent ask:** acknowledgement on apex-one-black.vercel.app + README + BeMyApp Story + 3-min video, each separately.
>
> **Recipient (verify before send):** Public contact channel at `missionmotorsport.org` (organisation contact form OR `info@missionmotorsport.org` standard charity address). Confirm via the Contact Us page at https://www.missionmotorsport.org/ before send. Phone backup: 03339 993 899 per Veterans' Foundation listing.
>
> **Mission Motorsport intel:** UK Armed Forces' motorsport charity (England & Wales No. 1166953; Scotland No. SC046571). Aim: recovery + rehabilitation of those affected by military operations via motorsport opportunities. Real-world overlap with MME Motorsport (Slovenia) hand-control hardware path. Donington Park presence + Race Retro stand visibility.

---

## Subject

```
APEX, AI race engineer for adaptive drivers, IBM SkillsBuild submission 2026-05-31
```

## Body (paste-ready)

```
Hello Mission Motorsport team,

Stephen Sookra here, sophomore CS student at Kennesaw State University. My teammate Vinh Le and I are building APEX, an AI race engineer tuned for adaptive racing drivers (military veterans transitioning via motorsport, paraplegic and amputee competitors running hand controls, and grassroots adaptive racers across the UK championships), for the IBM SkillsBuild AI Builders Challenge. Submission 2026-05-31.

The short version: APEX reads a driver's telemetry, their FIA Certificate of Adaptations, and a written debrief, then produces a corner-by-corner coaching report. Architecture is the same IBM Granite stack IBM ships in its public Ferrari case study, plus a two-stage validator at inference: a differentiable convex QP for friction-ellipse + forward-Euler + jerk-bound, then a post-projection feasibility filter that audits the bicycle-model coupling and the COA-parameterised input gates at tensor level. Public documentation for the leading commercial AI race-engineer tools we surveyed (Track Titan, Trophi.ai) does not show any conditional handling for adaptive-driver inputs nor any FIA-COA parsing path, so adaptive technique reads as invalid telemetry or driver error. We fix that. Free at point of use. Apache 2.0.

I'm reaching out because Mission Motorsport's recovery-and-rehabilitation work with veteran drivers transitioning to competitive motorsport sits exactly inside the audience APEX is built for. Three asks, any subset works:

1. Would the engineering team be willing to read the technical brief and tell us where the architecture misses adaptive-racing reality?
2. Would the drivers find a corner-by-corner coaching report with COA-aware audit useful in practice, or is it solving a problem that does not exist for them?
3. Would an acknowledgement on the project's public surfaces (the apex-one-black.vercel.app landing page, the GitHub README, the BeMyApp submission page, or the 3-minute demo video) be appropriate, and on which surfaces specifically?

Per-surface consent. We default to anonymous + aggregate descriptions until each surface is separately approved. We recently received corporate-only attribution consent from one of the adaptive-equipment suppliers in the space (covering four public surfaces with corporate-only naming); we would treat Mission Motorsport the same way unless directed otherwise.

Repo public: https://github.com/StephenSook/apex
3-minute demo video lands 2026-05-29 (preview link available on request before the 2026-05-31 public release).

Thanks for the time, and for the work the charity does for the community.

With respect,

Stephen Sookra
Computer Science, Kennesaw State University
ssookra@students.kennesaw.edu
GitHub: github.com/StephenSook
LinkedIn: linkedin.com/in/stephen-sookra-633682339
```

---

## Tone notes

- More formal than LinkedIn DMs. Charity-org-to-student-team etiquette.
- Three explicit ask paths so the recipient can engage at whichever depth fits their bandwidth (technical review OR driver reaction OR acknowledgement). Optionality reduces friction-to-reply.
- Per-surface consent framing explicit + the MME parallel cited without naming MME (per anonymisation-pre-consent rule; MME consented to four named surfaces, not to being cited in a separate outreach context).
- No commercial pitch. Apache 2.0 + free-at-point-of-use lands the right tone.
- No em-dash. No AI-tone blocklist words.
- British spelling on "parameterised", "organisation", "acknowledgement".

## After-send checklist

- [ ] Verify recipient email address via the Contact Us page at https://www.missionmotorsport.org/ before send. Avoid sending to `info@` blindly if the public contact channel is a form-based intake.
- [ ] CC nobody on first contact (single recipient, charity-side will route internally).
- [ ] Send from school address `ssookra@students.kennesaw.edu` (consistent with MME-supplier outreach pattern).
- [ ] Log send timestamp in `docs/stakeholder-outreach-log.md` (new Phase 6 row).
- [ ] Watch for reply through Day 11 EOD (2026-05-30); anonymisation decision locks Day 12 morning if no reply.
- [ ] If reply consents (per surface): add to relevant deliverables.
- [ ] If reply declines: stay generic ("UK military-veterans motorsport charities and adaptive-racing programmes worldwide") across all surfaces.

---

_Last updated: 2026-05-22 night Day 3 by Stephen + Claude. Fires unconditionally Day 6 (2026-05-25)._
