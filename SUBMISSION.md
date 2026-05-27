# APEX - BeMyApp / Devpost Submission Draft

> Mirror of Hometown-Pathway-Atlas `SUBMISSION.md` pattern. Drafted Day 1 (2026-05-20). Final fill-in Day 11 after deck + video lock. Submit Day 12 (2026-05-31).

Hackathon: **IBM SkillsBuild AI Builders Challenge, May Challenge** ("AI Beyond the Finish Line")
Portal: https://ibmskillsbuildchallenge-hub.bemyapp.com/
Submission deadline: **2026-05-31, 11:59 PM ET**

---

## 1. General (form section)

### Project name

`APEX`

### Pitch (200 char limit, per Devpost convention)

> AI race engineer for adaptive, veteran, and grassroots racers. Built on IBM Granite, with a physics-constrained TimeSeries TTM forecaster that reads the FIA Certificate of Adaptations.

(184 chars including spaces, against Devpost's 200-char convention. Verify BeMyApp's actual limit on Day 11 before submission.)

### Thumbnail

`deliverables/thumbnail.png` (1920x600 recommended). Day 10. SVG-rendered with the racing-line illustration from `app/frontend/app/page.tsx` Hero figure as the basis.

---

## 2. Story (description, ~ 7 blocks)

### Inspiration

A professional race engineer costs £400-500 per day. Every F1 driver has one. Most adaptive racers, veteran-team drivers, and grassroots competitors do not. The FIA lifted its single-seater ban on disabled drivers in December 2017. The barrier stopped being regulatory. It became economic.

APEX is the same IBM Granite stack that ships to Scuderia Ferrari's ~400 million fans, pointed at the drivers who need a race engineer the most.

### What it does

APEX takes three inputs from a driver and returns four outputs in 60 seconds.

Inputs: telemetry CSV, FIA Certificate of Adaptations PDF, written debrief.

Outputs: corner-by-corner coaching report, tuning recommendation with COA section citation, next-session lap-pace envelope forecast, Granite Guardian safety stamp.

The pipeline: Granite-Docling parses the COA into structured JSON. Granite Vision parses the timing sheet. A 1-Hz mini-sector aggregator preps a tensor for Granite TimeSeries TTM r2.1, a frozen pretrained time-series foundation model. The forecast passes through a differentiable physics-projection layer (CvxpyLayers QP) that enforces the friction ellipse, the bicycle model, a forward-Euler kinematic step, a jerk bound, and the COA-flagged brake-throttle simultaneity envelope. Granite Guardian 4.1 audits the projection's text log with custom BYOC rules. Granite 4.1 8B Instruct writes the coaching report in a race-engineer voice. Langflow renders the orchestration graph for the demo.

### How we built it

IBM Granite stack (14 tools tracked in `app/frontend/lib/ibm-stack.ts` with per-tool honesty tiers; 2 WIRED + 10 INTEGRATION + 2 ACCELERATOR): Granite Instruct 4.1 8B + Granite 4.0 Nano 350M WebGPU edge model are the 2 WIRED. Granite-Docling 258M + Granite Vision 4.1 4B + Granite TimeSeries TTM r2.1 + Granite FlowState r1.1 + IBM TSPulse 1M + Granite Embedding R2 + Granite Guardian 4.1 8B + Granite Instruct 4.1 3B chat-routing + Granite Speech 4.1 2B-Plus Watson STT proxy preview + LangGraph + Granite MCP Gateway + ContextForge orchestration runtime are the 10 INTEGRATION (Langflow retained as export-graph artifact per D-017 G7 + D-054). Docling library + Mellea v0.5.0 IVR-loop architectural slot are the 2 ACCELERATOR (Mellea is build-time architectural inspiration only, not a runtime dependency).

Frontend: Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript strict, deployed to Vercel.

Backend: Python 3.12 + FastAPI + cvxpylayers + transformers + granite-tsfm, deployed to a Hugging Face Space.

Methodology: Sookra Methodology v3.3 with seven phases of competitive recon (six-model murder-board + judge-sim), NotebookLM gap analysis on the seven-voice synthesis, PhysicsTTM physics-constrained foundation-model architecture (the load-bearing innovation that closes the kinetic-hallucination objection), Convergence-14 serializer unit-test suite, twelve atomic-commit days with the green-squares discipline, manual coordination via PLAN.md (no git hooks, mirrors the Trace + Hometown convention).

### Challenges we ran into

- **Kinetic hallucination.** TTM was pretrained on weather and retail data. Without constraints it can forecast 4G lateral with zero steering, or speed climbing with throttle at zero. We built a differentiable physics-projection layer to enforce per-step physical feasibility before the forecast reaches the driver.

- **COA semantics for adaptive drivers.** Standard race-engineering tools assume able-bodied physics, encoding `brake * throttle = 0`. a UK adaptive racing programme and adaptive hand-control systems explicitly permit simultaneous brake + throttle mid-corner. Penalizing that input misdiagnoses every adaptive driver. APEX reads the COA as a tensor-level flag so the physics model matches the car.

- **60-second budget on commodity hardware.** Granite-Docling cold-start can take 10+ minutes on first parse. We solved this by caching document parses at driver onboarding so the live 60-second loop only runs TTM forecast, physics projection, Guardian audit, and Instruct narrator.

### Accomplishments that we're proud of

- The novelty triple-lock: (1) first pretrained TSFM on motorsport telemetry, (2) first AI to ingest the FIA Certificate of Adaptations as a tensor-level safety flag, (3) first integrated post-race coaching workflow tuned for adaptive driver hand-control channels. Each is independently verifiable. Three firsts means defense-in-depth.

- Convergence 14: a serializer unit-test suite that treats the physics-to-text translation as safety-critical code. Every kinematic violation type has a fixture text log and a verified Guardian verdict.

- The galaxy-tier discipline. Nothing was deferred to "post-hackathon." We shipped: live sim-rig demo with iRacing telemetry, public Colab notebook, judges' tour landing page, status dashboard, methodology trace, NeurIPS Workshop paper draft, 30-second highlight clip, reproducibility metadata footer, all by 2026-05-31.

### What we learned

- A frozen pretrained TSFM + a differentiable physics-projection layer at inference is a viable architectural pattern that adjacent published work (Deep Dynamics, Chronos-on-car-following) has not yet explored for vehicle dynamics. The contribution is the wrapper, not the model.

- The FIA Certificate of Adaptations is a structured document anchored to FIA Appendix L (the regulation governing adaptive-driver equipment homologation). APEX parses the COA at onboarding, derives the c_overlap flag from the approved hand-control hardware specifications recorded inside it, and feeds that flag to the model at the tensor level. Treating the COA as regulatory background instead of a tensor-level input is the mistake every existing motorsport AI tool makes for adaptive drivers.

- IBM Granite's full stack (Docling + Vision + TTM + FlowState + TSPulse + Embedding + Instruct + Guardian + LangGraph + MCP + ContextForge) is genuinely complementary when each tool does one thing in one place.

### What's next for APEX

A NeurIPS Workshop paper draft is in `paper/apex-neurips-workshop-2026.md` (drafted Day 11, polish post-submission). A formal data-partnership conversation with a UK adaptive racing programme or a veteran motorsport rehabilitation programme is the next post-submission move.

---

## 3. Built with (technology tags, BeMyApp form)

- IBM Granite
- Granite-Docling
- Granite Vision
- Granite TimeSeries TTM
- Granite Guardian
- Granite Instruct
- Langflow
- Hugging Face
- Next.js
- React
- TypeScript
- Tailwind CSS
- Python
- FastAPI
- cvxpylayers
- transformers
- Vercel
- FastF1
- pnpm
- Apache 2.0

---

## 4. Additional info (BeMyApp form)

- **Submitter type:** Student
- **State / region:** Georgia, USA (Stephen at Kennesaw State University) + (Vinh location: fill in Day 11)
- **Repository:** https://github.com/StephenSook/apex
- **Demo URL:** {{vercel-url}} (Day 11 fill)
- **Demo video:** {{youtube-unlisted-url}} (Day 10 fill)
- **Colab notebook:** {{colab-url}} (Day 9 fill)
- **Judges' tour page:** {{apex-one-black.vercel.app/judges}} (Day 11 fill)
- **Reproducible testing:** Yes. Clone the repo, follow `README.md` §Run locally. Sarah Reynolds fixture in `fixtures/personas/sarah-reynolds.md` reproduces the canned end-to-end demo.
- **No login required.**
- **License:** Apache 2.0 (in `LICENSE`).

---

## 5. Multi-track entry verification

Per the IBM SkillsBuild rules + global hackathon multi-track strategy, tick **every** eligible track on the BeMyApp form. Confirmed eligible:

- [ ] May Challenge main prize
- [ ] Most Innovative
- [ ] Best Use of Technology
- [ ] Grand Prize (across May + June)
- [ ] Any sponsor-specific track (verify on Day 11 against the rules PDF in `research/ibm-rules.pdf`)
- [ ] Any community-voted or popularity track (verify on Day 11)

---

## 6. Pre-submit checklist (Day 11, gate G11)

See `PLAN.md` §Pre-submit Checklist for the 20-item gate. All 20 items must be green before this form gets submitted.

---

## 7. Submission sequence (Day 12)

1. Morning: final smoke test (live demo, video, Colab, fresh-machine clone, sim-rig WebSocket).
2. Afternoon (target 14:00 ET):
   - Paste the form copy from this file.
   - Upload thumbnail (`deliverables/thumbnail.png`).
   - Set the YouTube unlisted URL.
   - Verify reproducible-testing answer.
   - Tick every eligible track checkbox.
   - Submit.
3. Submission timestamp recorded in `logs/day-12-2026-05-31.md`.
4. **Submitted by 21:00 ET to leave a 3-hour buffer to the hard 11:59 PM ET deadline.**

---

_Last updated: 2026-05-20 by Stephen (Day 1 v0 draft). Final fill-in Day 11._
