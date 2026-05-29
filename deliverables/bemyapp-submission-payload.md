# BeMyApp Submission Payload, APEX

> Verbatim copy for each field on the BeMyApp submission form for IBM SkillsBuild AI Builders Challenge May 2026. Draft Day 2 PM from the live BeMyApp form structure pulled 2026-05-21 PM; wave-42 Day 6 refresh applied to reflect 12-tool IBM stack + 5 shouldn't-be-possible moves + Phase 0 contracts shipped + cascade-#11 brand-propagation + wave-42 Lane E.M.1/M.2 type-spec PRs; wave-46 D-058 refresh expands the stack to 15 tools (added Granite 4.1 3B Instruct fast-path AICopilotChat routing + Granite Speech 4.1 2B-Plus speaker-attributed ASR + Mellea Instruct-Validate-Repair critic loop); refine Day 10-11 with the live demo URL + recorded video link.
>
> **Owner:** Stephen Sookra. **Submission window opens:** TBD. **Hard deadline:** 2026-05-31, 11:59 PM ET.
>
> **Live demo URL:** https://apex-one-black.vercel.app (Vercel production deploy LIVE per D-046 cascade-#15 + cascade-#18 close-out 2026-05-24; all 4 routes 200).
>
> The fields directly below mirror the live BeMyApp project page template field-for-field (reference: `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/reference_bemyapp_submission_template.md`). The "Reference long-form drafts" section below the form-aligned section keeps the wider material (README-length elevator, full IBM-tools enumeration, full multi-track checklist) in case BeMyApp adds more fields or for cross-use in deck + video.

---

## BeMyApp form fields (1:1 with the live template)

### Banner image (1920 x 600)

```
deliverables/bemyapp-banner-1920x600.png  [PLAN task 5.14 - design + render Day 2-3]
```

Editorial-paddock palette. APEX wordmark (Fraunces display) + tagline + hero visual (architecture diagram or stylized racing line + COA annotation). Cream `#F4EBD8` base, racing-green `#0A2818` accents, clay-red `#C1492C` highlights, amber `#D9A441` band on the wordmark, ink `#0F1410` body text.

### Project name

```
APEX
```

### 1-2 sentence summary (immediately under banner)

```
APEX is the IBM Granite-stack AI race engineer for adaptive racers, veterans, and grassroots competitors. It reads each driver's FIA Certificate of Adaptations at the tensor level, so adaptive driving stops being misdiagnosed as driver error.
```

### Challenges tag

```
May Challenge
```

### GitHub URL

```
https://github.com/StephenSook/apex
```

### The Issue (3 paragraphs, ~140 words; depth-matched to NeuroPit's panel)

```
A professional race engineer costs £400 to £500 per day. Every Formula 1 driver has one. Most adaptive racers, veteran motorsport rehabilitation programme drivers, and grassroots competitors do not. The FIA lifted its single-seater ban on disabled drivers in December 2017. The regulatory barrier dropped. **The economic barrier stayed.**

Existing AI race-engineer tools hard-code `throttle * brake = 0`. But simultaneous brake and throttle is a real racing technique: able-bodied drivers do it when they left-foot-brake or trail-brake, and adaptive drivers running hand-control systems do it within the envelope their FIA Certificate of Adaptations homologates. **Tools that assume mutual exclusion read the technique as driver error and prescribe corrections the driver should not execute.**

The category of AI race engineering exists. The drivers who need it most have no product that respects the binding regulatory document they carry. **The gap is identity-aware coaching.**
```

### Our Magic Solution (3 paragraphs, ~190 words; depth-matched to NeuroPit's panel)

```
APEX is the IBM Granite-stack AI race engineer for adaptive racers, veteran-team drivers, and grassroots competitors. It reads each driver's FIA Certificate of Adaptations at the tensor level, so adaptive driving stops being misdiagnosed as driver error.

The pipeline runs three layers. **Layer 1**: a frozen Granite TimeSeries TTM forecaster from NeurIPS 2024 turns 1-Hz mini-sector telemetry into a next-session pace envelope without retraining. **Layer 2**: a two-stage projection-and-audit layer. Stage 1 is a differentiable CvxpyLayer convex QP that enforces the friction ellipse, the forward-Euler kinematic step, and a jerk bound on every forecast step. Stage 2 is a post-projection feasibility filter that audits the bicycle-model coupling and the COA-parameterized brake-throttle simultaneity gate (the two nonconvex constraints that cannot live inside the CvxpyLayer). **Layer 3**: Granite Guardian 4.1 audits the combined Stage 1 + Stage 2 structured text log under custom Bring-Your-Own-Classifier rules, with the 14-fixture Convergence 14 catalogue (visible on /judges) as the unit-tested safety contract. Granite 4.1 8B Instruct narrates the coaching report in race-engineer voice.

Fourteen IBM Granite tools per the wave-30 D-016 stack expansion + wave-46 D-058 + wave-46-final IBM Bob retirement. Granite TimeSeries TTM r2.1 as Track 1 forecaster, Granite FlowState r1.1 18.5M as Track 2, IBM TSPulse 1M for polyphase anomaly detection, Granite Guardian 4.1 as the audit gate, Granite Embedding R2 149M + 47M as the RAG retrieval layer, Granite-Docling 258M + Granite Vision 4.1 4B + Docling library for document parsing, Granite 4.1 8B Instruct as the narrator, Granite 4.1 3B Instruct for AICopilotChat fast-path routing, Granite Speech 4.1 2B-Plus for speaker-attributed ASR, Granite 4.0 Nano 350M as the in-browser WebGPU edge model per D-021, LangGraph + Granite MCP Gateway + ContextForge for orchestration (Langflow retained as exported graph artifact), Mellea v0.5.0 as IVR-loop build-time accelerator. **Three firsts**: first application of a pretrained time-series foundation model to adaptive motorsport telemetry, first public AI race-engineer workflow we found that reads the FIA Certificate of Adaptations as a binding regulatory input, first COA-parameterized brake-throttle simultaneity gate. **Five shouldn't-be-possible moves** compose on top: WebGPU Granite Nano on-device inference, Activated LoRA per-driver fine-tune, GEPA evolutionary prompt optimization, EAGLE-3 speculative decoding for sub-15s local latency, and a tri-agent Agent-as-Judge critic loop (Physics-Critic + Pedagogy-Critic + Guardian-Safety) gating the final report. Every coaching claim cites a specific COA section and the FIA Appendix L regulatory anchor (per published revision). Provenance is on every line. **Audit first, always.**
```

### Presentation Video Link (YouTube or public platform)

```
[Day 10 fill: YouTube unlisted URL once production take is rendered]
```

### Team Members GitHub Usernames (comma-separated)

```
StephenSook, [Vinh's GitHub handle, need to confirm with Vinh before Day 12]
```

---

## Reference long-form drafts (for deck, video, README cross-use, or if BeMyApp adds fields)

### Tagline (one-line, <= 100 chars)

```
The AI race engineer for the drivers who do not have one.
```

### One-paragraph elevator (90-120 words)

```
APEX is an AI race engineer for adaptive racers, veteran-team drivers, and grassroots competitors who cannot afford the four-to-five-hundred-pounds-a-day professional race engineer that every Formula One driver has. We point the same IBM Granite stack that ships to Scuderia Ferrari's roughly four hundred million fans at the drivers who need a race engineer most. APEX reads the driver's telemetry, their FIA Certificate of Adaptations under the Appendix L provisions, and a written debrief, then returns a corner-by-corner coaching report with a tuning recommendation, a next-session forecast envelope, and a Granite Guardian safety stamp in sixty seconds end-to-end on a commodity RTX 4060 GPU.
```

## The problem (BeMyApp pinned rubric Q1)

```
The FIA lifted its single-seater ban on disabled drivers in December 2017. The regulatory barrier dropped. The economic one stayed: a professional race engineer costs in the low-to-mid hundreds of pounds per day for amateur and clubman series, by industry estimates. Every F1 driver has one. Most adaptive racers, veteran-team drivers, and grassroots competitors do not. Existing AI race-engineer tools (Track Titan, Trophi.ai) hard-code "throttle * brake = 0." But simultaneous brake and throttle is a legitimate technique (left-foot braking, trail-braking, holding throttle to keep a turbo spooled), and for adaptive drivers it is a homologated part of how their hand-control equipment works, recorded in their FIA Certificate of Adaptations. Tools that assume mutual exclusion flag the technique as driver error. The market gap is post-race coaching that respects the binding regulatory document the driver actually carries.
```

## The AI approach (BeMyApp pinned rubric Q2)

```
APEX is a three-layer PhysicsTTM architecture with a two-stage projection-and-audit middle layer: a frozen Granite TimeSeries TTM r2.1 foundation forecaster wrapped in Stage 1 (a differentiable CvxpyLayer convex QP enforcing friction ellipse + forward-Euler kinematic step + jerk bound) and Stage 2 (a post-projection feasibility filter auditing the nonconvex bicycle-model coupling + COA-parameterized brake-throttle simultaneity gate), audited by Granite Guardian 4.1 with custom Bring-Your-Own-Classifier rules on the combined Stage 1 + Stage 2 serialized text log. Granite 4.1 8B Instruct narrates the coaching report. Granite-Docling parses the FIA COA PDF into structured JSON at onboarding. Granite Vision parses official timing-sheet PDFs to CSV. LangGraph + Granite MCP Gateway + ContextForge orchestrates the runtime; Langflow exports the visible orchestration graph artifact. Fourteen IBM Granite tools per the wave-30 D-016 stack expansion + wave-46 D-058 (TTM + FlowState + TSPulse + Guardian + Embedding R2 + Docling-model + Vision + Docling-library + 4.1 8B Instruct + 4.1 3B chat-routing + Granite Speech + 4.0 Nano WebGPU edge + LangGraph runtime + Mellea v0.5.0 IVR slot). Convergence 14, our 14-fixture safety-contract catalogue (visible at /judges), is unit-tested in Vinh's app/backend/tests/test_serializer.py: every kinematic-violation class has a fixture and an asserted Guardian verdict.
```

## Why it matters in racing (BeMyApp pinned rubric Q3)

```
Three constituencies share one product gap. Adaptive racers running hand-control rigs in Britcar Trophy, the adaptive-driver UK championships, and FFSA Handikart. Veteran-team drivers competing through veteran motorsport rehabilitation programmes with combat-injury-driven adaptations. Grassroots clubman and amateur racers in SRO regional series and Britcar endurance. Their FIA Certificate of Adaptations (governed by Appendix L of the International Sporting Code) is a binding document. APEX reads it at the tensor level. When the COA permits simultaneous brake-throttle inputs, the physics layer permits them. When the COA does not, the constraint enforces. Same coaching pipeline, different output, depending on what the driver's COA actually says they are allowed to do. The Scuderia Ferrari precedent matters because IBM already shipped this stack to a Formula One team; APEX takes the same architecture and points it at the drivers who need it most.
```

## IBM tools used (every load-bearing slot; 14 tools at wave-46-final per D-058 stack expansion minus IBM Bob retirement = wave-30 D-016 baseline 12 + wave-46 D-058 additions Granite 4.1 3B Instruct + Granite Speech 4.1 2B-Plus + Mellea, minus IBM Bob 2026-05-26)

```
1. Granite-Docling 258M model. Parses the driver's FIA Certificate of Adaptations PDF into structured JSON. Preserves Appendix L section IDs and the adaptation domain headings.

2. Docling library. Open-source IBM Docling conversion plus table-extraction Python library, the conversion layer behind Granite-Docling's vision pass.

3. Granite Vision 4.1 4B. Parses official SRO and Britcar timing-sheet PDFs into CSV. Charts and tables only.

4. Granite TimeSeries TTM r2.1. Frozen pretrained Tiny Time Mixer (NeurIPS 2024) as Track 1 of the 3-track forecasting ensemble per D-010. Aggregated 1-Hz mini-sector tensor input. We do not retrain.

5. Granite FlowState 9.1M. Track 2 of the 3-track forecasting ensemble per D-010. Sampling-rate-invariant continuous-time SSM.

6. IBM TSPulse 1M. Time-frequency anomaly detector on polyphase phase streams per D-016.

7. Granite Embedding R2 (149M + 47M). RAG retrieval layer per D-016. Hybrid dense + sparse over vehicle setup guides + racing-theory + adaptive-equipment specs + COA-parsed fixtures.

8. Granite 4.1 8B Instruct. Race-engineer narrator. Reads forecast envelope, COA, and debrief; emits the coaching report in a paddock voice.

9. Granite Guardian 4.1 8B. Bring-Your-Own-Classifier custom rules. Audits the combined Stage 1 + Stage 2 serialized text log; verdict (approve / flag / reject) backed by the 14-fixture Convergence 14 unit-test catalogue. Reasoning trace surfaces in the UI.

10. Granite 4.0 Nano 350M. In-browser WebGPU edge model via Transformers.js per D-019 item 1 + D-021. Parity surface to the server-side narrator for offline coaching path.

11. LangGraph + Granite MCP Gateway + ContextForge. Runtime orchestration per D-017 G7 + D-054. Langflow demoted to demo-facade export-graph artifact, retained for visualization but not in the runtime path.

12. Granite Instruct 4.1 3B. Fast-path AICopilotChat router per D-058. Intent classifier routes simple queries to 3B + complex queries to 8B Instruct.

13. Granite Speech 4.1 2B-Plus. Speaker-attributed ASR + word-level timestamps + multilingual EN/FR/DE/ES/PT/JA per HF 2026-04-28 release. Watson STT proxy path per Vinh M3-V9 swap-point.

14. Mellea v0.5.0 (build-time accelerator). IBM Research IVR-loop architectural inspiration for the Phase 5 narrator critic loop per D-058; build-time inspiration only, not a runtime dependency.
```

## Demo video link

```
[Day 10 fill: YouTube unlisted URL once production take is rendered]
```

## GitHub repository

```
https://github.com/StephenSook/apex
```

Public from Day 1. Apache 2.0 license. Atomic-commit discipline (220+ commits across the 12-day build window).

## Live demo URL

```
[Day 11 fill: https://apex-one-black.vercel.app or https://apex-race.vercel.app]
```

Judges' tour single page at `/judges`. Live status dashboard at `/status`. Upload-and-analyze flow at `/analyze`.

## Team

```
Stephen Sookra. Frontend, pitch, project architecture, narrative, stakeholder outreach (Computer Science, Kennesaw State University).
Vinh Le. Backend, ML pipeline, FastAPI, Langflow, infrastructure (Computer Science, Kennesaw State University).
```

## What makes this innovative or impactful (video beat 4 mirror)

```
APEX is the first public AI race-engineer workflow we found that reads the FIA Certificate of Adaptations at the tensor level and lets the COA gate live in a Stage 2 post-projection feasibility filter, separate from the Stage 1 convex QP that handles the everyday physics. Public documentation for the leading commercial AI race-engineer tools we surveyed (Track Titan, Trophi.ai) does not show any conditional removal of the throttle * brake = 0 mutual-exclusion assumption; if a prior workflow is identified, the "first" claim narrows per the bounded-scope statement in our NeurIPS Workshop paper §5.3. APEX permits the simultaneity when the COA permits it. That single architectural choice (COA-parameterized brake-throttle simultaneity) closes the most significant misdiagnosis pattern across the entire adaptive-driver category. Combined with the two-stage projection-and-audit layer that catches kinetic hallucinations from a frozen non-physics-pretrained foundation model applied zero-shot to motorsport telemetry, and the Granite Guardian text-audit gate backed by the 14-fixture Convergence 14 unit-test catalogue on every recommendation, APEX is a candidate reference pattern for IBM Consulting deployments of governed foundation models on safety-critical sensor data. It also ships production observability uncommon in hackathon work: an OpenTelemetry span on every backend request exported to Honeycomb, mirrored live and embedded on the /judges page with deep-links into the real trace waterfalls.
```

## Track entries

```
NO opt-in tracks. ONE submission per team. Judges decide the per-challenge categories.
```

Resolved 2026-05-21 night via Discord answer from a BeMyApp organizer-side Discord moderator: "You're submitting 1 project and prizes such as best use of technology are decided by the judges!" The four per-challenge awards (1st Place, Runner-up, Best Use of Technology, Most Innovative) are juried on the single submission. Grand Prize is awarded across both May + June challenges to one standout project. Our work falls back to: build the best single submission across all four official judging criteria (Technical Execution / Innovation / Challenge Fit / Implementation & Feasibility). Cross-reference: `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/reference_competitors_calibration.md`.

---

## Pre-submit final-check list

Before clicking Submit on 2026-05-31:

- [ ] BeMyApp form-aligned section above completed end-to-end with all fields filled
- [ ] Banner image at 1920x600 uploaded (`deliverables/bemyapp-banner-1920x600.png`)
- [ ] 1-2 sentence summary copy approved
- [ ] The Issue panel copy approved (2-3 sentences, em-dash-clean, AI-tone-clean)
- [ ] Our Magic Solution panel copy approved (2-3 sentences, em-dash-clean, AI-tone-clean)
- [ ] Demo video URL points at the recorded production take (not the Day 9 dress rehearsal cut)
- [ ] Team Members GitHub usernames field includes Vinh's confirmed handle
- [ ] All eligible tracks ticked (verify against current BeMyApp form: no sponsor / install / DQE tracks expected per the Official Rules; verify Day 11 morning)
- [ ] Live demo URL returns HTTP 200 from a clean browser session
- [ ] GitHub repo is public + Apache 2.0 + last commit on main is green CI
- [ ] `bash scripts/pre-submit-checks.sh --final` returns 0 HARD-FAIL
- [ ] Screenshot of the submitted form saved to `deliverables/screenshots/submission-confirmed.png` for record
- [ ] BeMyApp project listing visible on the public projects feed (verify in a fresh browser session)
- [ ] Submission timestamp logged in `logs/day-12-2026-05-31.md`

---

_Last updated: 2026-05-21 PM by Stephen. Day-2 alignment pass against the live BeMyApp project-page template (pulled from the live IBM SkillsBuild Challenge Hub example project today). Form-aligned section is the authoritative copy for Day-12 submission; reference long-form drafts retained for deck + video + README cross-use. Day 10-11 final-pass fill in the real video URL + live demo URL + Vinh GitHub handle. PLAN task 5.14 owns the 1920x600 banner asset; PLAN task 5.15 owns the 3-example gallery calibration pass once URLs land._
