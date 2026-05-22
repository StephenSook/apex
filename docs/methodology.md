# APEX - Methodology Trace (Sookra Methodology v3.3)

> The process scaffolding APEX was built on. This document is C4 in the Core 6 ship-blocker list and a signal to IBM judges who care about engineering discipline. Day 11 polish locks final form. v0 was committed Day 1 EOD per the galaxy-tier rule (no Day-11 first-write).

**Owner:** Stephen Sookra. **Last reviewed:** 2026-05-20 Day 1 EOD. **Final lock:** Day 11.

---

## Why this document exists

IBM judges who reach this file are asking: "Did you stumble into a working AI race engineer, or did you have a process?" The honest answer is: a documented seven-phase process. Most hackathon submissions ship the artifact and skip the trace. APEX commits the trace because the trace is part of the credibility.

The Sookra Methodology v3.3 is the personal process Stephen Sookra has developed across Trace, Hometown-Pathway-Atlas, Compass, and Nest (all GitHub-public, all hackathon-submitted, three with placements). This trace shows where APEX fits in that body of work and what each phase produced.

---

## The seven phases

### Phase 1 - Cross-model competitive recon (2026-05-09 to 2026-05-12)

**Question:** What will the other 42 teams in the IBM SkillsBuild May Challenge build, so we can avoid the dogpile?

**Method:** Single prompt asking for exhaustive projection of other-team submissions, fanned across six frontier models (ChatGPT, Perplexity, DeepSeek, Gemini, Groq, Kimi). Each model returned 50+ projected ideas tiered into Mainstream, Clever, Visual, Contrarian, Niche, Empty Lanes.

**Artifacts:** Six model output PDFs in `research/{claude,perplexity,deepseek,gemini,groq,kimi,new-chatgpt}-*-may-2026.pdf` + cross-model synthesis identifying the dogpile lanes (pit-wall agent, telemetry copilot, race-recap generator, regulation RAG, TORCS racer) and the empty lanes (adaptive-motorsport regulatory work, post-crash safety data, pit-crew biomechanics, sponsor ROI).

**Outcome:** Lane identified - adaptive-motorsport AI race engineer. Not in any model's dogpile.

### Phase 2 - Murder-board + judge-simulation (2026-05-13 to 2026-05-15)

**Question:** What kills our lane before we commit?

**Method:** Two-prompt sequence per model: (1) Murder Board - tear apart the concept, find every reason it fails; (2) Judge Simulation - score it 1-5 on the four official IBM SkillsBuild criteria.

**Artifacts:** `research/kimi-hostile-pitch-review.pdf` and equivalent hostile-pass outputs from the other five models. Phase 2.5 cross-model synthesis identifying 12 fatal flaws + counter-positioning.

**Outcome:** GreenFlag (the FIA Certificate of Adaptations RAG chatbot concept) was killed because Formula 1 launched "Your Tech Director" agent on Salesforce Agentforce 360 in early 2026, occupying the regulatory-AI lane. Concept pivoted to PIT WALL (later renamed to APEX on Day 1).

### Phase 3 - Concept lock (2026-05-16 to 2026-05-17)

**Method:** Re-run Phase 2 against the new PIT WALL concept. NotebookLM grounding pass with the FIA Vehicle Adaptation Guidelines PDF + the six model outputs as source corpus.

**Artifacts:** Locked concept brief committed as `research/claude-pit-wall.pdf` and the original design-blueprint plan at `~/.claude/plans/`.

**Outcome:** PIT WALL locked. Calibrated outcome ceiling: 85% top-3, 92% Best Use of Technology, 78% Most Innovative (NotebookLM Phase 3 pass).

### Phase 4 - Deep research (2026-05-18)

**Method:** Six-prompt fan-out to the same six models, each with a distinct specialization: (a) ChatGPT technical adversarial review of Granite TimeSeries TTM claims, (b) Perplexity hidden-competitor sweep, (c) Gemini stakeholder intelligence, (d) DeepSeek engineering risk audit, (e) Kimi hostile pitch review, (f) Groq strategic positioning + IBM judge psychology.

**Artifacts:** Six standalone research reports committed in `research/` (specific filenames: `new-chatgpt-ibm-may.pdf`, `perplexity-pit-wall-may-2026.pdf`, `gemini-ibm-may.pdf`, `deepseek-ibm-may.pdf`, `kimi-hostile-pitch-review.pdf`, `groq-ibm-may.pdf`) plus the Phase 4.5 NotebookLM-verified cross-model synthesis identifying 13 mandatory pitch refinements + 5 hidden competitors (PACETEQ, Red Bull + Oracle AI Protest Tool, SRO Motorsports AWS Scrutineering, FIA Digital Licensing Platform, UCL × IBM F1-Jarvis-Granite).

**Outcome:** PIT WALL hardened with 13 mandatory pitch edits (the "Phase 4.5 synthesis" referenced throughout decision-log + pitch script) + confirmed five firsts (later reduced to three independently-verifiable firsts after triple-lock analysis).

### Phase 5 - NotebookLM gap analysis + PhysicsTTM mitigation (2026-05-19)

**Question:** What objection does a frontier-model judge raise that we haven't addressed?

**Method:** Upload nine sources to NotebookLM (Phase 4.5 synthesis v2 + six model outputs + Claude TTM technical verification + Phase 3 concept-lock doc + IBM SkillsBuild rules). Ask the 10-question gap-finding interrogation.

**Artifacts:** Original PIT WALL Physics-Constrained Foundation Models research report in `research/pit-wall-physics-constrained-foundation-models.pdf`. The NotebookLM Phase 5 verdict surfaced **Kinetic Hallucination** - TTM trained on weather + retail data can forecast physically impossible motorsport telemetry - and proposed the three-layer mitigation: frozen TTM forecaster → differentiable physics-projection layer → Granite Guardian BYOC text audit. The serializer unit-test suite (Convergence 14) is the load-bearing safety contract.

**Outcome:** Architecture locked as D-A in `docs/decision-log.md`. Calibrated outcome ceiling raised to 90% top-3, 96% Best Use of Technology, 88% Most Innovative.

### Phase 6 - Build (2026-05-20 to 2026-05-30, in progress)

**Method:** Twelve-day hackathon execution. Manual coordination via `PLAN.md` mirroring the Hometown-Pathway-Atlas + Trace convention (status snapshot, phase tables, coordination protocol, shared contracts, decisions, open questions, pre-submit checklist). No git hooks. Atomic-commit discipline. Push immediately. Quality over speed. Three-brain HARD RULE on every wave: Codex adversarial + pr-review-toolkit lens + Gemini long-context cold review before "done."

**Wave discipline:** Each wave ships an atomic-commit cluster + a Codex + multi-agent cold review + a fix-wave for the findings + a session memory write. 18 waves shipped through 2026-05-21 evening covering bootstrap, frontend scaffold, 7 review-and-fix waves Day 1, 4 cold-review iterations Day 2.

**Artifacts (current state, last reconciled 2026-05-21 night-late):** 197+ atomic commits + 5 production routes (`/`, `/analyze`, `/judges`, `/sim-rig`, `/status`) + `/bemyapp-banner` route handler + 5 per-route `opengraph-image.tsx` handlers (each pinned to Node runtime per wave-22 cold-review MED M3 closure) + 57 vitest tests + GitHub Actions CI workflow (frontend tsc + lint + vitest + Next build, green on main) + Playwright e2e against the live `/analyze` flow + StatusLiveIndicator with typed errors + GhConclusion literal-union exhaustiveness guard + OG / Twitter Card metadata on all routes (using shared brand-fonts.ts for Fraunces + IBM Plex Fraunces fidelity) + BeMyApp submission payload aligned to the live BeMyApp project page template (form-aligned section ships NeuroPit-depth panels with claim-softened "first" wording per wave-22 + wave-24 cold-review closures) + BeMyApp 1920x600 banner asset (editorial-magazine-cover direction, warm cream paper, Fraunces italic 260pt wordmark, deliberate contrast with the universal dark-cinematic competitor banner aesthetic) + pre-submit-checks.sh 21-gate runner with --final mode + the ⚠️ CONTRACT `driver_id` field added to `CoachingReport` for Vinh's Pydantic mirror Day 5-6 + the editorial-paddock palette (cream + racing-green + clay + amber + ink) across every route + Next.js 16 + Tailwind v4 + IBM Plex + Fraunces. Project-local CLAUDE.md, this methodology trace expanded, architecture-spec, SUBMISSION draft, pre-mortem (48+ rows), Sarah Reynolds persona narrative with three-corner deep-dive + telemetry annotation + COA Section 3(c) excerpt, 3-min pitch script v0 with 12 of 13 Phase 4.5 mandatory edits applied + wave-22 + wave-24 cold-review claim softening, adaptive hand-control supplier consent email, APEX Lite contingency, full PLAN coordination doc, shared TypeScript contracts, banner brand brief + render script + wave-22 + wave-23 cold-review brief + cold-review findings docs (waves-22 + 23 + 24 closure trail), NeurIPS Workshop paper publication-readable draft (§1-3 + §5 + §6 + §7 + §8 + §9-12 acks/contributions/COI/funding + §13 References with verified Chronos + Deep Dynamics + CvxpyLayer + Granite-TTM citations; §4 Experiments tables fill Day 9-10 once Gate G4 + G5 measurements land). 20+ project memory files (added IBM-SkillsBuild org + BeMyApp template + competitor calibration). 13+ Obsidian project notes. 9 Claude Memory session anchors (waves 17-24 across Day 1 EOD through Day 2 night-late-late-3).

**Phase 4.5 synthesis re-tiered Day 1 EOD** per Codex independent plan-critique: Core 6 ship-blockers at 95% quality + Stretch 10 at 70% quality + always-ship trivials. See PLAN.md §Scope tiering. Stretch S5 (`/judges`) + S6 (`/status`) pulled forward to Day 2 per the galaxy-tier compounding rule (pre-mortem row 45 📘): each Day-N feature shipped early becomes a Day-N+1 regression-catcher surface.

### Phase 7 - Submission (2026-05-31)

**Method:** Submit by 21:00 ET to leave a three-hour buffer to the hard 11:59 PM ET deadline. Tick every eligible track checkbox per global hackathon multi-track strategy. IBM Consulting cold email Day 12 afternoon. Post-submission engineering-retro committed to the repo Day 12 evening.

---

## Why this process beats stumbling

Three concrete examples from the methodology that would not have happened without the phases:

1. **GreenFlag would have been our submission** if we had skipped Phase 2 murder-board. Phase 2 surfaced F1's "Your Tech Director" agent on Salesforce Agentforce 360 (launched early 2026, occupying the regulatory-RAG lane). Without that surface, we would have shipped a project that an IBM judge could Google in 5 seconds and find a direct commercial competitor for.

2. **Kinetic Hallucination would have shipped as an undetected bug.** Without Phase 5 NotebookLM gap analysis, TTM's weather-and-retail pretraining would have produced physically impossible motorsport telemetry forecasts in the live demo. A motorsport-knowledgeable judge would have caught this in Q&A and the technical credibility would have collapsed.

3. **Galaxy-tier scope would have been silently broken on Day 11.** Without Codex independent plan-critique Day 1 EOD, the D-003 + D-007 contradiction would have surfaced as Day 9-10 scope-cutting panic. Re-tiering Day 1 EOD into Core 6 + Stretch 10 makes the cut-triggers explicit and pre-emptive.

---

## What the methodology costs

Roughly 50 hours of pre-build process work (Phases 1-5) across 11 days. The frontier-model fan-out is API + screen-time. NotebookLM upload + 10-question interrogation is a half-day. The cross-model syntheses are the synthesis layer - Claude does the heavy lifting; the human reviews and locks.

The hackathon would lose 1-2 days of build to do the methodology if started cold. But APEX was started after the methodology had already produced the locked concept, so build-time was preserved.

---

## What's next

- **Day 11:** Final polish of this document. Run `humanize` skill across it. Confirm zero AI-tone blocklist hits via `scripts/pre-submit-checks.sh --only=2`. Re-run `bash scripts/pre-submit-checks.sh --final` to verify every Day-11 gate (CI per-job green, demo video duration, 30-second highlight clip, deck PDF, demo URL, IBM tool citations, submission-payload checkboxes ticked).
- **Day 12 evening:** Post-submission engineering-retro committed alongside this trace, mirroring the Hometown-Pathway-Atlas precedent.
- **Post-submission:** NeurIPS Time-Series Foundation Models Workshop paper draft (if Stretch S10 ships) cites this trace as the methodological context for the PhysicsTTM contribution.

---

## Cross-references to the wave artifacts

- **Wave 1-12 (Day 1):** bootstrap + frontend scaffold + Dropzone + 14 review waves of privacy + AI-tone hardening + architecture diagram fixes + Sarah-pace consistency. See `Claude Memory/Session - 2026-05-20 EOD - apex-day-1-wave-11-12-five-agent-review.md`.
- **Wave 13-15 (Day 2 morning):** ESLint env repair + README structure audit + CoachingReport + TuningCard + GuardianAudit + AnalyzeFlow + ⚠️ CONTRACT driver_id + ForecastChart hardening + vitest 50-test suite + GitHub Actions CI + Playwright e2e + /judges route. See `Claude Memory/Session - 2026-05-21 morning - apex-day-2-wave-15-vitest-judges-ci-e2e.md`.
- **Wave 16-17 (Day 2 afternoon):** 4-agent cold review iteration + /status route + OG meta + Twitter Card + BeMyApp submission payload draft. See `Claude Memory/Session - 2026-05-21 afternoon - apex-day-2-waves-16-17.md`.
- **Wave 17 closure + Wave 18 (Day 2 evening):** Codex wave-17 review fixes + 4-agent cold review on wave-17 + Codex wave-15 MED backfill (AnalyzeFlow error-path tests) + StatusLiveIndicator full refactor + pre-submit Check 21 + concurrency block drop. See `Claude Memory/Session - 2026-05-21 evening - apex-waves-17-18-cold-review-iteration.md`.

---

_Last updated: 2026-05-21 night-late-late-3 by Stephen (wave-24 wave-23 cold-review closure: count drift fixed to 194 commits + paper expanded to publication-readable with completeness sections + wave-23 cold-review fixes shipped across paper §3.2 QP convexity + Chronos citation + Ethics IRB + Acknowledgments/COI/Funding + brand-fonts comment correctness + README polish)._
