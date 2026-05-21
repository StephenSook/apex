# BeMyApp Submission Payload, APEX

> Verbatim copy for each field on the BeMyApp submission form for IBM SkillsBuild AI Builders Challenge May 2026. Draft Day 2 from the wave-15 state; refine Day 10-11 with the live demo URL + recorded video link.
>
> **Owner:** Stephen Sookra. **Submission window opens:** TBD. **Hard deadline:** 2026-05-31, 11:59 PM ET.
>
> Fields below mirror what the BeMyApp portal walkthrough video describes (pinned 2026-05-20 by makenna). Verify each field at submission time against the actual form; if the portal adds a new field, surface here and re-draft.

---

## Project name

```
APEX
```

## Tagline (one-line, <= 100 chars)

```
The AI race engineer for the drivers who do not have one.
```

## One-paragraph elevator (90-120 words)

```
APEX is an AI race engineer for adaptive racers, veteran-team drivers, and grassroots competitors who cannot afford the four-to-five-hundred-pounds-a-day professional race engineer that every Formula One driver has. We point the same IBM Granite stack that ships to Scuderia Ferrari's roughly four hundred million fans at the drivers who need a race engineer most. APEX reads the driver's telemetry, their FIA Certificate of Adaptations under the Appendix L provisions, and a written debrief, then returns a corner-by-corner coaching report with a tuning recommendation, a next-session forecast envelope, and a Granite Guardian safety stamp in sixty seconds end-to-end on a commodity RTX 4060 GPU.
```

## The problem (BeMyApp pinned rubric Q1)

```
The FIA lifted its single-seater ban on disabled drivers in December 2017. The regulatory barrier dropped. The economic one stayed: a professional race engineer costs in the low-to-mid hundreds of pounds per day for amateur and clubman series, by industry estimates. Every F1 driver has one. Most adaptive racers, veteran-team drivers, and grassroots competitors do not. Existing AI race-engineer tools (Track Titan, Trophi.ai) assume able-bodied physics: they encode "throttle * brake = 0" because no able-bodied driver presses both at once. Adaptive drivers running hand-control systems often do, when their FIA Certificate of Adaptations permits the simultaneity their equipment was built for. Existing tools flag adaptive technique as driver error. The market gap is post-race coaching that respects the binding regulatory document the driver actually carries.
```

## The AI approach (BeMyApp pinned rubric Q2)

```
APEX is a three-layer PhysicsTTM architecture: a frozen Granite TimeSeries TTM r2.1 foundation forecaster wrapped in a differentiable CvxpyLayer QP physics-projection layer (friction ellipse + bicycle model + forward-Euler kinematic step + jerk bound + COA-flagged simultaneity), audited by Granite Guardian 4.1 with custom Bring-Your-Own-Classifier rules on the serialized text log of every physics correction. Granite 4.1 8B Instruct narrates the coaching report. Granite-Docling parses the FIA COA PDF into structured JSON at onboarding. Granite Vision parses official timing-sheet PDFs to CSV. Langflow exports the visible orchestration graph. IBM Bob accelerates the build per the IBM x Scuderia Ferrari case-study precedent. Eight IBM Granite tools, all load-bearing. Convergence 14, our serializer unit-test suite, is the safety contract: every kinematic-violation type has a fixture and a verified Guardian verdict.
```

## Why it matters in racing (BeMyApp pinned rubric Q3)

```
Three constituencies share one product gap. Adaptive racers running hand-control rigs in Britcar Trophy, the adaptive-driver UK championships, and FFSA Handikart. Veteran-team drivers competing through veteran motorsport rehabilitation programmes with combat-injury-driven adaptations. Grassroots clubman and amateur racers in SRO regional series and Britcar endurance. Their FIA Certificate of Adaptations (governed by Appendix L of the International Sporting Code) is a binding document. APEX reads it at the tensor level. When the COA permits simultaneous brake-throttle inputs, the physics layer permits them. When the COA does not, the constraint enforces. Same coaching pipeline, different output, depending on what the driver's COA actually says they are allowed to do. The Scuderia Ferrari precedent matters because IBM already shipped this stack to a Formula One team; APEX takes the same architecture and points it at the drivers who need it most.
```

## IBM tools used (every load-bearing slot)

```
1. Granite-Docling 258M model. Parses the driver's FIA Certificate of Adaptations PDF into structured JSON. Preserves Appendix L section IDs and the nine adaptation domain headings.

2. Docling library. Open-source IBM Docling conversion plus table-extraction Python library, the conversion layer behind Granite-Docling's vision pass.

3. Granite Vision 4.1 4B. Parses official SRO and Britcar timing-sheet PDFs into CSV. Charts and tables only.

4. Granite TimeSeries TTM r2.1. Frozen pretrained Tiny Time Mixer (NeurIPS 2024). Aggregated 1-Hz mini-sector tensor input. We do not retrain.

5. Granite 4.1 8B Instruct. Race-engineer narrator. Reads forecast envelope, COA, and debrief, emits the coaching report in a paddock voice.

6. Granite Guardian 4.1 8B. Bring-Your-Own-Classifier custom rules. Audits the serialized text log of every physics-projection correction. Reasoning trace surfaces in the UI.

7. Langflow. Visible orchestration graph export. Day 7 screenshot lands in the deck.

8. IBM Bob. Build accelerator, per the IBM x Scuderia Ferrari case-study precedent. Session logs committed to `bob-sessions/` in the repo.
```

## Demo video link

```
[Day 10 fill: YouTube unlisted URL once production take is rendered]
```

## GitHub repository

```
https://github.com/StephenSook/apex
```

Public from Day 1. Apache 2.0 license. Atomic-commit discipline (130+ commits across the 12-day build window).

## Live demo URL

```
[Day 11 fill: https://apex.race or https://apex-race.vercel.app]
```

Judges' tour single page at `/judges`. Live status dashboard at `/status`. Upload-and-analyze flow at `/analyze`.

## Team

```
Stephen Sookra. Frontend, pitch, project architecture, narrative, stakeholder outreach (Computer Science, Kennesaw State University).
Vinh Le. Backend, ML pipeline, FastAPI, Langflow, infrastructure (Computer Science, Kennesaw State University).
```

## What makes this innovative or impactful (video beat 4 mirror)

```
APEX is the first integrated workflow for adaptive hand-controls. First AI race engineer that reads the FIA Certificate of Adaptations at the tensor level and lets it govern the physics-projection layer's COA simultaneity flag. Existing tools assume able-bodied physics. Adaptive drivers' COAs explicitly permit simultaneity the equipment was built for. APEX permits it when the COA permits it. That single architectural choice (COA-parameterized brake-throttle simultaneity) closes the most significant misdiagnosis pattern across the entire AI race-engineer category. Combined with the differentiable physics-projection layer that catches kinetic hallucinations from a non-physics-pretrained foundation model, and the Guardian text-audit gate on every recommendation, APEX is the IBM-Consulting reference architecture for governed foundation-model deployment on safety-critical sensor data.
```

## Track entries (tick every eligible box)

```
[ ] Main May Challenge prize (Grand Prize Day 1 default)
[ ] Most Innovative
[ ] Best Use of Technology
[ ] Grand Prize (across May + June, if applicable)
[ ] Any sponsor-specific track (Granite Open Track, Watson TTS Track, etc.; verify at submit time)
[ ] Community-voted / popularity track (if any)
```

Per global hackathon-project-flow multi-track strategy: every unchecked box is a forfeited entry. Tick all eligible.

---

## Pre-submit final-check list

Before clicking Submit on 2026-05-31:

- [ ] BeMyApp form completed end-to-end with all fields above filled
- [ ] All eligible tracks ticked
- [ ] Demo video URL points at the recorded production take (not the Day 9 dress rehearsal cut)
- [ ] Live demo URL returns HTTP 200 from a clean browser session
- [ ] GitHub repo is public + Apache 2.0 + last commit on main is green CI
- [ ] Team field references both members + their affiliations
- [ ] `bash scripts/pre-submit-checks.sh --final` returns 0 HARD-FAIL
- [ ] Screenshot of the submitted form saved to `deliverables/screenshots/submission-confirmed.png` for record
- [ ] BeMyApp project listing visible on the public projects feed (verify in a fresh browser session)
- [ ] Submission timestamp logged in `logs/day-12-2026-05-31.md`

---

_Last updated: 2026-05-21 Day 2 by Stephen. Day-2 v0 draft. Day 10-11 final-pass fill in real video URL + live demo URL._
