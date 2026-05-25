# IBM Consulting Cold Email - Day 12 Afternoon Send

> Per PLAN.md task 7.4 + STATUS_DAY1.md §Day-2-and-Day-7-and-Day-12 sends. Day 12 afternoon (2026-05-31) after BeMyApp form submitted. Frames APEX as a reference architecture for governed foundation-model deployment on safety-critical sensor data, citing the IBM × Scuderia Ferrari case-study precedent.
>
> **Owner:** Stephen Sookra. **Send from:** [personal email kept private] (personal address for IBM commercial outreach per the global CLAUDE.md sender-email convention, NOT the school address used for adaptive-motorsport stakeholder outreach). Address tracked in `project_apex_stakeholders.md` (private memory).
> **Recipient:** TBD - research before send Day 12 morning. Likely targets: IBM Consulting Industry Lead for Sports & Entertainment, OR IBM Watson Apps team principal who shipped the Ferrari fan-app case study (named in IBM newsroom; reverse-search on LinkedIn).
> **Reply window:** open-ended (this is post-submission, not on the hackathon clock).

---

## To

[Day 12 morning: research the recipient. Two primary candidates:]
1. IBM Consulting Sports & Entertainment Industry Lead - name + email surfaced from the IBM newsroom Scuderia Ferrari case study + the Mission 44 announcement contact list.
2. IBM Granite product lead - name surfaced from the Hugging Face model-card author list for `ibm-granite/granite-timeseries-ttm-r2`.

Pick ONE primary. CC the [personal address kept private] (yourself, for record).

## Subject

APEX (IBM SkillsBuild May 2026): governed Granite-stack reference architecture, beyond motorsport

## Body

Hi [Name],

I'm a sophomore CS student at Kennesaw State University. My teammate Vinh Le and I just submitted APEX to the IBM SkillsBuild AI Builders Challenge May 2026 ("AI Beyond the Finish Line"). The repo is public at https://github.com/StephenSook/apex and the demo is live at https://apex-one-black.vercel.app.

I'm writing because the architecture we built has direct extension paths into IBM Consulting's safety-critical sensor-data vertical, and I wanted to share the pattern in case it's useful.

APEX uses the same eight IBM Granite tools IBM Consulting deployed for the publicly documented Ferrari watsonx + Granite case study (Granite-Docling, Granite Vision 4.1, Granite TimeSeries TTM r2.1, Granite 4.1 8B Instruct, Granite Guardian 4.1, Langflow, Docling, IBM Bob). What's new: we wrap a frozen pretrained TSFM (Granite TTM) with a two-stage projection-and-audit layer at inference, comprising a differentiable CvxpyLayer QP for the convex constraints (friction ellipse, forward-Euler kinematic step, jerk bound) followed by a post-projection feasibility filter for the nonconvex constraints (bicycle-model coupling, COA-parameterized brake-throttle simultaneity gate), audited end-to-end by Granite Guardian with custom BYOC rules. To our knowledge, no prior published work does that for vehicle dynamics without retraining the foundation model from scratch.

The pattern generalises. APEX is the racing instance. The same governed-foundation-model + physics-constraint + Guardian-audit pattern extends to:
- Industrial robotics (foundation model forecasting controlled by safe-operating-envelope projection)
- Patient-vitals forecasting in clinical settings (foundation model + physiology-bound constraints + clinical-policy audit)
- Energy-grid load forecasting (foundation model + Kirchhoff-law projection + grid-safety audit)

The full architectural spec is at `docs/architecture-spec.md` in the repo.

If any of this lines up with IBM Consulting work in flight, I'd welcome a 30-minute conversation. We are not asking for funding or sponsorship. We are asking whether the pattern (governed Granite-stack + domain physics layer + Guardian audit) is something IBM Consulting would consider seeding as a reference architecture for the verticals listed above.

Thanks for the time.

Stephen Sookra
Computer Science, Kennesaw State University
[personal email kept private]
GitHub: github.com/StephenSook
LinkedIn: linkedin.com/in/stephen-sookra-633682339

Repo: https://github.com/StephenSook/apex
Live demo: [Day-12-fill]
Submission video: [Day-12-fill YouTube unlisted URL]
Methodology trace: https://github.com/StephenSook/apex/blob/main/docs/methodology.md

---

## Tone notes

- Engineering-confident, not salesy. We are NOT asking IBM Consulting to license APEX. We are asking whether the pattern is useful at their scale.
- Reference the Scuderia Ferrari precedent (public IBM marketing, fair to name).
- Reference Mission 44 partnership obliquely if natural; do not lead with it (Mission 44 is education partnership, not Granite-stack partnership).
- No "leverage," "robust," "comprehensive," "seamless" or other AI-blocklist words.
- No em-dash.

## What this email is NOT

- It is NOT a job application. We are still students. We are pointing at a pattern, not asking for hire.
- It is NOT a sales pitch. APEX is Apache 2.0 open-source.
- It is NOT a demand for response. Open-ended timeline (post-submission, no hackathon clock).

## After-send

- [ ] Log send timestamp in `docs/stakeholder-outreach-log.md` Phase 6.
- [ ] Add to `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_stakeholders.md` Phase 6 row.
- [ ] If reply: log + bring back to Stephen's full attention.

---

_Last updated: 2026-05-20 Day 1 EOD draft by Stephen. Send Day 12 (2026-05-31) afternoon AFTER BeMyApp submission lands. Recipient research Day 12 morning._
