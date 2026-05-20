# IBM SkillsBuild May Challenge — Build & Workspace Plan
**Working name:** APEX (rename from PIT WALL — final pick on Day 1, see §10)
**Submission deadline:** 2026-05-31, 11:59 PM
**Days remaining:** 12 (today is Day 1 of build = 2026-05-20)
**Team:** Stephen Sookra (frontend, deck, video, narrative, stakeholder outreach), Vinh Le (backend, ML pipeline, Langflow, FastAPI, infra)

---

## 1. Context

We have spent the last several days in deep Sookra-methodology recon: six-model competitive map (Phase 1.5), murder-board + judge-sim (Phase 2.5), GreenFlag dead → PIT WALL locked (Phase 3), seven-voice synthesis with NotebookLM verification (Phase 4.5), Kinetic Hallucination discovered + PhysicsTTM mitigation locked (Phase 5). The concept, IBM Granite stack, Q&A defense pack, pitch architecture, and 12-day build skeleton are all locked. Calibrated outcome ceiling: 90% top-3 / 96% Best Use of Technology / 88% Most Innovative.

What is NOT yet done and what this plan executes:

1. The workspace folder is a flat dump of 12 research PDFs with no organization, no git repo, no Obsidian project notes, no project memory. Vinh cannot orient.
2. The product name "PIT WALL" collides on BeMyApp with another team's submission "PitWall" (cinematic GoPro coaching for amateur drivers). We rename Day 1.
3. There is no rolling state-sync protocol between sessions. If VS Code crashes or a new chat starts, context is lost. This plan installs Obsidian + project-memory as the persistent state layer.
4. No code exists yet. Day 1 of the build is today. The 12-day schedule starts now.
5. Research-tool discipline (context7, tavily, web_research, firecrawl, EXA) is not yet a session-default. This plan installs it as a memory-enforced rule.

The intended outcome of executing this plan: by 2026-05-31 23:59, submit a working public demo with a 3-minute video, a clean GitHub repo of ~80–120 atomic commits, a deck-ready briefing PDF, and a Q&A-rehearsed team — positioned to take Grand Prize, Most Innovative, Best Use of Technology, or all three. The plan is also structured so that any future "ultraplann" iteration pass (run plan through external review models) finds clean, addressable sections instead of one monolithic blob.

---

## 2. Phase 0 — Day 1 Decisions (sequence-blocking, do these first)

Order matters. Each step blocks the next.

| # | Decision | Owner | Output | Blocks |
|---|----------|-------|--------|--------|
| D0.1 | Lock final project name from §10 shortlist | Stephen | Name committed to repo + Obsidian | D0.2, D0.3, D0.4 |
| D0.2a | Init GitHub monorepo, public, Apache 2.0, named after D0.1 | Stephen | `https://github.com/StephenSook/<name>` live | D0.2b, D0.5 |
| D0.2b | Invite Vinh as repo collaborator with Write access | Stephen | Vinh accepts invite, can push to main | D0.6, parallel build |
| D0.3 | Create Obsidian project hub + seed notes per §5 | Stephen | `<Name> MOC.md` + 6 child notes live in vault | session-sync |
| D0.4 | Create project memory folder + seed entries per §6 | Stephen | `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/` populated | session-sync |
| D0.5 | Reorganize `Desktop/IBM May/` per §3, commit to repo | Stephen | folder is git-tracked, PDFs in `research/`, code scaffold in `app/` | Vinh onboarding |
| D0.6 | Hand Vinh the (rebranded) briefing PDF + repo URL + invite link + his lane | Stephen | Vinh acknowledges + accepts invite + clones repo | D0.7, parallel build |
| D0.7 | First Vinh-side `pip install granite-tsfm` zero-shot smoke test, push from Vinh's account | Vinh | `logs/day-01-ttm-smoke.md` committed by Vinh | Day 2 build, attribution check |

If D0.7 fails (Granite TTM doesn't load on Vinh's box), the day-1 go/no-go gate fails and we fall back to APEX Lite (drop TTM, keep Granite 4.1 Instruct + Guardian as a regulatory + narrative-only product). Document the gate result in `Claude Memory/Session - 2026-05-20 - apex-day-1.md`.

---

## 3. Phase 1 — Workspace Folder Reorganization

### 3.1 Current state (flat, 12 PDFs at `~/Desktop/IBM May/`)

All research PDFs sit at the root with no taxonomy: model recon outputs, the Vinh briefing, the IBM rules, the screenshot of BeMyApp portal, the Physics-TTM research, etc.

### 3.2 Target structure

```
~/Desktop/IBM May/                          ← repo root, becomes the GitHub repo
├── .git/                                   ← git init Day 1
├── .gitignore                              ← Python + Node + macOS + IBM/HF caches
├── LICENSE                                 ← Apache 2.0
├── README.md                               ← project pitch, demo URL, team, IBM stack
├── pyproject.toml                          ← `apex` + `physics-tsfm` workspace
├── docs/
│   ├── briefing-for-vinh.pdf               ← move from root
│   ├── 3-min-pitch-script.md               ← Day 9 lock
│   ├── deck.pdf                            ← Day 11 lock
│   ├── q-and-a-flashcards.md               ← 5 cards from Phase 4.5
│   ├── stakeholder-outreach-log.md         ← every email + reply
│   └── decision-log.md                     ← rename, kill-switches, pivots
├── research/                               ← all 12 PDFs land here
│   ├── ibm-rules.pdf
│   ├── may-challenge-ibm.pdf
│   ├── claude-pit-wall.pdf
│   ├── perplexity-pit-wall-may-2026.pdf
│   ├── deepseek-ibm-may.pdf
│   ├── gemini-ibm-may.pdf
│   ├── groq-ibm-may.pdf
│   ├── kimi-hostile-pitch-review.pdf
│   ├── new-chatgpt-ibm-may.pdf
│   ├── chatgpt-greenflag-scoring.pdf       ← (dead concept, keep as artifact)
│   ├── pit-wall-physics-constrained-foundation-models.pdf
│   └── pit-wall-briefing-for-vinh.pdf      ← (rename target version lives in /docs)
├── app/                                    ← the product
│   ├── frontend/                           ← Next.js 15 + React + Tailwind + Plex
│   │   ├── app/                            ← App Router
│   │   ├── components/
│   │   └── public/                         ← demo telemetry CSVs, COA fixtures
│   ├── backend/                            ← FastAPI + Langflow + IBM Granite
│   │   ├── apex/                           ← package code
│   │   │   ├── intake/                     ← Granite-Docling COA parser
│   │   │   ├── vision/                     ← Granite Vision timing-sheet parser
│   │   │   ├── ttm/                        ← Granite TimeSeries TTM forecaster
│   │   │   ├── physics/                    ← projection layer (CvxpyLayer QP)
│   │   │   ├── guardian/                   ← Granite Guardian BYOC rules
│   │   │   ├── instruct/                   ← Granite 4.1 8B narrator
│   │   │   └── langflow/                   ← visible orchestration graph export
│   │   ├── tests/                          ← serialization unit tests (Convergence 14)
│   │   └── pyproject.toml
│   └── shared/                             ← TypeScript types + Python schemas
├── physics-tsfm/                           ← library carve-out (post-hackathon paper)
│   ├── README.md                           ← Apache 2.0, abstract from Source 10 §10
│   ├── physics_tsfm/                       ← projection-layer code
│   └── tests/
├── fixtures/                               ← reproducible demo data
│   ├── telemetry/                          ← FastF1 slice + Team BRIT synthetic
│   ├── coa/                                ← redacted FIA COA example PDFs
│   └── timing-sheets/                      ← SRO + Britcar PDF samples
├── deliverables/                           ← what we hand the judges
│   ├── demo-video.mp4                      ← Day 12 lock
│   ├── demo-video-backup.mp4               ← pre-recorded fallback
│   ├── thumbnail.png
│   └── bemyapp-submission-payload.md       ← form copy
├── scripts/                                ← one-shot ops
│   ├── render-deck.sh                      ← Playwright HTML→PDF
│   ├── ai-tone-sweep.sh                    ← em-dash + blocklist scanner
│   └── pre-submit-checks.sh                ← gate runner
├── bob-sessions/                           ← IBM Bob session logs (per Ferrari precedent)
└── logs/                                   ← per-day build logs
    ├── day-01-2026-05-20.md
    └── ...
```

### 3.3 Move plan (commit-by-commit)

| Commit | Action |
|--------|--------|
| `chore: init repo, license, gitignore` | git init, LICENSE, .gitignore, root README stub |
| `docs: import IBM challenge rules + May brief` | move `ibm rules.pdf` + `May challenge IBM.pdf` → `research/` |
| `docs: import six-model recon outputs` | move Claude / Perplexity / DeepSeek / Gemini / Groq / Kimi / ChatGPT PDFs |
| `docs: import physics-tsfm research artifact` | move Physics-Constrained Foundation Models PDF |
| `docs: import Vinh briefing PDF (legacy PIT WALL branding)` | move briefing PDF to `docs/` |
| `chore: scaffold app + physics-tsfm + fixtures dirs` | create empty subtrees with .gitkeep |
| `docs: README v0 — name + tagline + IBM stack + team` | first real README |

Seven commits before any code is written. Green squares activated.

---

## 4. Phase 2 — GitHub Repo Setup

### 4.1 Repo config (decided)

| Item | Value |
|------|-------|
| Name | `<rename-from-D0.1>` (recommendation: `apex`) |
| Visibility | Public from Day 1 |
| License | Apache 2.0 |
| Default branch | `main` |
| Collaborators | Stephen (owner), Vinh (Write access via repo Settings → Collaborators) |
| Branch protection | OFF for hackathon speed. Both members push directly to `main`. Atomic-commit discipline replaces PR review as the quality gate. |
| Commit style | Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`, `perf:`, `ci:`) |
| Branch model | Trunk + short feature branches only when 2+ commits touch the same surface AND the other member is also editing that surface; rebase-merge to keep linear history |
| CI | GitHub Actions: tsc + lint + pytest on PR + main push (per global lint-before-commit triplet) |
| Secrets | `HF_TOKEN`, `IBM_API_KEY`, `WATSONX_PROJECT_ID` in repo secrets; never in code |
| Attribution | Each member commits from their own GitHub account so green-squares land on the right profile. Verify `git config user.email` per machine matches the account that owns the email on github.com. |

### 4.2 Atomic-commit discipline (rule of three)

Every commit must:
1. **One logical change** — one bug fix, one new function, one doc update, one fixture import. Never bundle unrelated work.
2. **Subject ≤ 100 chars** — commitlint passes.
3. **Push immediately** — no batching at end of day. Push-after-every-commit per global CLAUDE.md.

Target velocity: 6–10 commits per build day × 11 days ≈ **80–110 total commits** by submission. Green-squares effect maximized.

### 4.3 CI guardrails (configured Day 2)

`.github/workflows/ci.yml` runs on every push to main + every PR:
- Backend: `ruff`, `mypy --strict`, `pytest -q`, `pytest --cov=apex --cov-fail-under=70`
- Frontend: `tsc --noEmit`, `eslint`, `vitest run`
- AI-tone: `scripts/ai-tone-sweep.sh` (fails on em-dash, smart quotes, AI blocklist words in README + docs)
- Build: `next build` for frontend, `python -m apex --version` for backend

Verify CI is green per push, not just per PR (per global hackathon-project-flow Phase 1 discipline).

---

## 5. Phase 3 — Obsidian Population

Obsidian = persistent project state. If a new chat starts cold or VS Code crashes, the next assistant session reads the vault to re-orient.

### 5.1 Notes to create on Day 1 (under `Projects/`)

| Filename | Type | Purpose |
|----------|------|---------|
| `<Name> MOC.md` | moc | Project hub. Lists every child note + status table + decision log + active gate. |
| `Project - <Name>.md` | project-note | One-page summary: problem, hero use case, IBM stack, team, deadline, prize map. |
| `<Name> - Architecture.md` | project-note | Three-layer PhysicsTTM diagram + role of each Granite tool + serialization contract. |
| `<Name> - 12 Day Build Plan.md` | project-note | Copy of §7 of this plan, kept editable per-day. |
| `<Name> - Vinh Lane.md` | project-note | Backend ownership table (TTM, Physics, Guardian, Langflow, FastAPI, tests). |
| `<Name> - Stephen Lane.md` | project-note | Frontend + deck + video + narrative + outreach. |
| `<Name> - Q&A Defense Pack.md` | project-note | Five flashcards verbatim + rehearsal log. |
| `<Name> - Stakeholder Outreach Log.md` | reference | One row per outreach: org, contact, date sent, reply, quote text, attribution surface. |

Each note follows global frontmatter schema (`title`, `type`, `status: active`, `project: <Name>`, `created: 2026-05-20`, `tags`, `related`).

### 5.2 Update `Home.md` (insertion)

Add this line under `Active MOCs (project hubs)`:

```markdown
- [[<Name> MOC]] — IBM SkillsBuild May Challenge, adaptive-motorsport AI race engineer (deadline 2026-05-31)
```

### 5.3 Session-end sync protocol (durable rule)

Every substantive session terminates with a Claude Memory write:

```
Claude Memory/Session - YYYY-MM-DD - <name> - <slug>.md
```

Body: What done / Decided / Next / Gotchas / Related.

This is the **state-recovery anchor**. If VS Code crashes or the user opens a new chat tomorrow, the assistant reads `Home.md` → `<Name> MOC.md` → last 3 `Claude Memory/` entries and resumes mid-flight.

---

## 6. Phase 4 — Project Memory Population

Memory = facts that should outlive this session and carry into every future conversation about this project.

### 6.1 Directory bootstrap

Create `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/` with `MEMORY.md` index + seed files. Use the frontmatter schema in global CLAUDE.md (`name`, `description`, `metadata.type`).

### 6.2 Seed memory files (Day 1)

| File | Type | Content (one-liner) |
|------|------|---------------------|
| `project_apex_overview.md` | project | What APEX is, who for, deadline, prize map, locked architecture |
| `project_apex_stack.md` | reference | Granite-Docling, Granite Vision 4.1, Granite TTM r2.1, Granite 4.1 Instruct, Granite Guardian 4.1, Langflow, Docling, IBM Bob — version pins + role |
| `project_apex_decisions.md` | project | Renamed from PIT WALL on 2026-05-20 (reason: BeMyApp collision). Monorepo. Public Day 1. PhysicsTTM 3-layer mitigation locked. |
| `project_apex_vinh_lane.md` | project | Backend ownership, FastAPI + Langflow + TTM + Guardian + tests |
| `project_apex_stephen_lane.md` | project | Frontend + deck + 3-min video + outreach + Q&A drills |
| `project_apex_kill_switches.md` | feedback | Day-by-day go/no-go gates: Day 1 TTM smoke, Day 4 zero-shot beats naive, Day 7 projection converges, Day 10 Lite fallback trigger |
| `project_apex_qa_killshots.md` | reference | Five Q&A flashcards verbatim (Deep Dynamics, Kinetic Hallucination, Serialization, COA simultaneity, Latency) |
| `project_apex_stakeholders.md` | reference | Mission 44 (Jason Arthur), Team BRIT (Al Locke), Spinal Track (Nathalie via Andrew), Limitless (Johnny Dawson-Ellis), Raceability (Brian Roberts) — addresses + status |
| `feedback_research_tool_discipline.md` | feedback | When uncertain about a library / API / FIA reg / IBM model / contact / fact: ALWAYS context7 → web_research → firecrawl → EXA before claiming. Save tool used + finding to memory. |
| `feedback_obsidian_state_sync.md` | feedback | Every substantive session terminates with a Claude Memory write so the next session can recover state from `Home.md` → MOC → last 3 sessions |
| `feedback_em_dash_zero_tolerance.md` | feedback | Global rule mirrored: no em-dash in prose, period. Substitutes per global CLAUDE.md table |
| `feedback_atomic_commit_discipline.md` | feedback | One logical change per commit, ≤100 char subject, push immediately, CI green per push |
| `feedback_galaxy_ambition_no_deferrals.md` | feedback | LOAD-BEARING: nothing is "post-hackathon," "stretch," or "if time permits." Everything ships by 2026-05-31 23:59. Every enhancement, paper draft, beta-tester quote, parallel June track, live driver mode — all in scope NOW. Reject any future suggestion to "punt to v2." |

### 6.3 The research-tool discipline rule (memory-enforced)

This is the durable rule the user requested. Saving it as `feedback_research_tool_discipline.md`:

> When I am uncertain about a fact, library version, API behavior, FIA regulation, IBM Granite model card, person's role/email, or any claim I'm about to make in code, deck copy, email, or memory, I MUST verify with a research tool BEFORE asserting it. Order: (1) Context7 for library/API docs, (2) tavily / WebSearch for general facts, (3) Firecrawl for JS-heavy/SPA sites, (4) EXA for academic/research sources, (5) WebFetch for static URLs. Save the tool used + finding to a memory file. Never bluff a fact in this project.

**Why:** This project ships to IBM judges. A single false claim about Granite TTM's training distribution, an outdated email for Jason Arthur, or a wrong FIA Article number turns the demo into a credibility hit. Discipline ships.

**How to apply:** Before any tool call that asserts a fact, ask "do I know this with certainty?". If no, run a research tool first. After verification, save to memory as a fact card so the next session doesn't re-verify the same thing.

---

## 7. Phase 5 — 12-Day Build Plan (today is Day 1)

Days indexed from build kickoff = 2026-05-20. Submission = 2026-05-31 23:59 ET = Day 12.

### Day 1 — Mon 2026-05-20 — Bootstrap + Smoke Test
- D0.1 → D0.7 from §2
- Vinh: `pip install granite-tsfm`, run zero-shot TTM on FastF1 telemetry slice, commit `logs/day-01-ttm-smoke.md`
- Stephen: Next.js 15 + Tailwind + Plex scaffold, commit `app/frontend/` skeleton
- Both: read briefing PDF + memorize Q&A Card 1 (Deep Dynamics)
- **Gate G1:** TTM loads on Vinh's box + 1Hz inference returns within 60s on M2 / RTX 4060
- **Commits target:** 8–12

### Day 2 — Tue 2026-05-21 — Docling + Vision parsing
- Vinh: Granite-Docling parses FIA COA example PDF into structured JSON; Granite Vision 4.1 parses one SRO timing-sheet
- Stephen: file-upload UI + dropzone + accessibility baseline (WCAG 2.1 AA keyboard + screen-reader)
- Both: memorize Q&A Card 2 (Kinetic Hallucination)
- Stakeholder: send Phase-3 emails if any new contacts surface (FFSA Handikart secretary)
- **Gate G2:** parsed COA JSON contains all 9 adaptation domain headings + section IDs
- **Commits target:** 8–10

### Day 3 — Wed 2026-05-22 — Physics Validator V1
- Vinh: pure-NumPy kinematic validator (friction circle, bicycle, Euler step, jerk bound)
- Stephen: build the visible Langflow graph screenshot mockup for deck slide 6
- Both: memorize Q&A Card 3 (Serialization)
- **Gate G3:** validator catches 5 hand-crafted impossible-physics traces and approves 5 valid ones
- **Commits target:** 6–8

### Day 4 — Thu 2026-05-23 — Zero-Shot Baseline + Projection V1
- Vinh: end-to-end TTM forecast → NumPy validator → text log; compare against seasonal-naive baseline on one FastF1 race
- Stephen: build coaching-report React component with corner-by-corner cards
- Both: memorize Q&A Card 4 (COA Simultaneity)
- **Gate G4:** zero-shot TTM (with physics projection) beats seasonal-naive on next-lap mini-sector MAE on at least 3 of 5 holdout circuits
- **Commits target:** 8–10

### Day 5 — Fri 2026-05-24 — CvxpyLayer Projection V2 + Guardian BYOC
- Vinh: replace NumPy validator with differentiable QP via `cvxpylayers`; wire to Granite Guardian 4.1 with BYOC rules (text log → Guardian audit)
- Stephen: build Guardian-verdict UI panel with the reasoning trace surfaced
- Both: memorize Q&A Card 5 (Latency)
- **Gate G5:** Guardian text audit catches the 5 same impossibilities the validator catches
- **Commits target:** 6–8

### Day 6 — Sat 2026-05-25 — Granite Instruct narrator + COA simultaneity flag
- Vinh: Granite 4.1 8B Instruct wired to read forecast envelope + COA + driver debrief, output the tuning-delta recommendation in race-engineer voice
- Stephen: build the tuning-recommendation card UI with citation-to-COA-section provenance
- Both: full Q&A hostile-pass rehearsal (Vinh asks, Stephen answers, swap)
- **Gate G6:** end-to-end pipeline produces a corner-by-corner report from one canned (Sarah / Britcar M240i) test case in under 2 minutes on RTX 4060
- **Commits target:** 8–10

### Day 7 — Sun 2026-05-26 — Langflow + tests + beta-tester escalation
- Vinh: export the full pipeline as a Langflow graph; write the serialization unit-test suite (Convergence 14) — every kinematic violation type has a fixture
- Stephen: deck draft v0 — 3-minute pitch script + storyboard
- Stakeholder: Day-7 follow-up emails to Phase 1 + 2 contacts that did not reply (per Gemini protocol). **In parallel: send LinkedIn DMs to Aaron Morgan and Bobby Trundley (Team BRIT drivers) with 60-second video pitch to secure a real adaptive-driver beta-test quote.** This is in scope per §9.7 galaxy rule — no waiting for Phase 1 to fail.
- **Gate G7:** Langflow graph renders correctly in a screenshot at 1920×1080
- **Commits target:** 6–8

### Day 8 — Mon 2026-05-27 — Latency closure + caching + June Challenge bridge architecture
- Vinh: cache COA + timing-sheet parses at onboarding; ensure post-race coaching loop fits in 60 seconds on RTX 4060
- Stephen: deck draft v1 with all 13 mandatory changes from Phase 4.5 synthesis applied. **In parallel: design the June Challenge bridge — write `docs/june-challenge-bridge.md` outlining how the PhysicsTTM architecture transfers to FIFA World Cup player-tracking telemetry. Concrete: which channels map (player x/y/v/a → throttle/brake/lat-G/long-G), which physics constraints apply (max human acceleration, max turn rate), which IBM tools stay vs swap. Commit a one-slide deck addition that signals to Grand Prize judges we are executing both halves of the prize structure.**
- Both: hostile Q&A pass #2
- **Gate G8:** demo loop measured at < 60s wall-clock 3 runs in a row + June bridge slide committed
- **Commits target:** 8–10

### Day 9 — Tue 2026-05-28 — Demo dress rehearsal + HF Space deploy + Colab notebook + live sim-rig integration
- Vinh: deploy backend to Hugging Face Space free tier; verify cold-start fallback path. **Also: publish `deliverables/apex-demo.ipynb` — self-contained Colab notebook that runs the entire pipeline in a free browser cell. Becomes the zero-install demo path AND the "try it yourself" link in README on launch day, not later.**
- Stephen: record demo video v0 (raw screen capture); lock pitch script. **Also: stand up sim-rig integration — connect iRacing or Assetto Corsa Competizione telemetry export to APEX over WebSocket. The 3-minute video will run APEX on LIVE simulated adaptive-controls telemetry, not a canned replay. This is the galaxy commitment: live + adaptive + on-camera.**
- Both: dress rehearsal #1 (full 3-minute pitch + 5-minute Q&A)
- **Gate G9:** v0 video plays without obvious breakage; HF Space loads in < 90s cold; Colab notebook executes end-to-end in browser; sim-rig WebSocket streams clean telemetry.
- **Commits target:** 6–8

### Day 10 — Wed 2026-05-29 — Polish + live driver mode dress rehearsal + Lite contingency
- **Decision day for Lite fallback:** if any Day 9 gate slipped catastrophically, invoke APEX Lite (drop sim-rig integration, drop Colab, ship the core PhysicsTTM loop on cached fixtures). Default expectation is no fallback needed because the galaxy rule (§9.7) means we built the contingencies pre-emptively, not reactively.
- Stephen: record demo video v1 (production take with voiceover, live sim-rig data on screen) + thumbnail + 30-second highlight clip per §16.4
- Vinh: fix every bug surfaced by dress rehearsal #1; instrument reproducibility metadata footer per §16.5 on every demo output
- Both: dress rehearsal #2 with hostile Q&A using live sim-rig
- **Gate G10:** video v1 ≤ 3:00, audio clean, screen captures readable at 1080p, 30s clip locked, sim-rig didn't crash during recording
- **Commits target:** 8–12

### Day 11 — Thu 2026-05-30 — Submission package + judges page + methodology trace + NeurIPS draft
- Stephen: final deck PDF render via Playwright; BeMyApp form copy; README final polish; AI-tone sweep across README + deck + video transcript + emails. **Stand up `apex.race/judges` per §16.9 — one-page TOC for evaluators. Stand up `apex.race/status` per §16.10 — live demo uptime indicator. Write `docs/methodology.md` per §16.6 — the Sookra Methodology trace. Write `docs/pre-mortem.md` per §16.3 — every known failure mode with mitigation, started Day 2 and final-polished today.**
- Vinh: final repo cleanup; ensure CI green on main; double-check HF Space stays warm via keep-alive cron; finalize reproducibility metadata footer rendering. **Also: draft `paper/apex-neurips-workshop-2026.md` — the NeurIPS Time-Series Foundation Models Workshop paper draft (abstract + intro + method + experiments + related work + limitations). This is IN SCOPE per §9.7. The paper itself goes from "outlined" to "draft-quality readable by another researcher" by submission. Commit the .md and the .tex skeleton.**
- Both: stakeholder follow-up — every quote that landed goes into deck + video credits. Run §17 external-tool layers: `pre-landing-review`, `claude-council`, `three-brain` (Codex + Gemini reviews), `architecture-reviewer`, `repo-sentinel`, NotebookLM gap pass #2, `usage-audit`. Run them today, not tomorrow.
- **Gate G11:** every pre-submit checklist item in §8 passes; methodology + pre-mortem + NeurIPS draft + judges page + status page all committed
- **Commits target:** 12–18 (heaviest commit day)

### Day 12 — Fri 2026-05-31 — Submission + multi-track entry + retrospective + IBM Consulting outreach
- Morning: final smoke test of live demo, video playback, Colab notebook execution, GitHub repo clone-and-run from a clean machine, sim-rig WebSocket healthy.
- Afternoon: submit BeMyApp form per §16.11 — tick EVERY eligible track checkbox (May main, Most Innovative, Best Use of Technology, Grand Prize, any sponsor track). Verify Devpost cross-post if applicable. **Also send: cold email to IBM Consulting leadership citing the Scuderia Ferrari case-study precedent and offering APEX as the reference architecture for governed foundation-model deployment on safety-critical sensor data (per §16.6 methodology trace + Grok strategic positioning). This is IN SCOPE today, not "post-submission."**
- Evening: post-submission session-memory write + engineering-retro skill run + retrospective draft committed to repo
- **Hard deadline:** 23:59 ET. Submit no later than 21:00 to leave margin.

### Velocity check
- 12 days × ~7 commits/day = ~84 commits. Per global hackathon-project-flow, we target 80–120. On track.

---

## 8. Phase 6 — Pre-Submission Checklist (Day 11 gate)

Run `scripts/pre-submit-checks.sh`. Fail = do not submit until fixed.

| # | Check | Pass condition |
|---|-------|----------------|
| 1 | Em-dash sweep | `grep -r "—" docs/ README.md app/frontend/app/` returns zero matches in prose |
| 2 | AI-tone blocklist | "delve into / leverage / seamless / robust / comprehensive / unlock / cutting-edge / revolutionary / streamline / ecosystem / easily / simply" all absent |
| 3 | En-dash + smart-quote sweep | only ASCII hyphens + straight quotes in prose |
| 4 | Operator-attribution sweep | no named operator without consent; check briefing PDF + deck + video credits |
| 5 | Em-dash in commit messages | `git log --pretty=%s | grep "—"` empty |
| 6 | CI green on main | latest GitHub Actions run is green per job, not just aggregate |
| 7 | TypeScript clean | `tsc --noEmit` zero errors |
| 8 | Lint clean | `ruff check` + `eslint` zero errors |
| 9 | Tests pass | `pytest` + `vitest run` zero failures, coverage ≥ 70% on `apex/` |
| 10 | Hugging Face Space healthy | `curl -s https://huggingface.co/spaces/.../health` returns 200 |
| 11 | Demo video length | `ffprobe deliverables/demo-video.mp4` shows ≤ 3:00 |
| 12 | Backup demo exists | `deliverables/demo-video-backup.mp4` present |
| 13 | Deck PDF renders | `docs/deck.pdf` opens without errors, every slide < 100 words |
| 14 | README has working demo URL | `curl -sI <url>` returns 200 |
| 15 | License present | `LICENSE` is Apache 2.0 |
| 16 | All IBM tools cited in README | Granite-Docling, Granite Vision 4.1, Granite TimeSeries TTM r2.1, Granite 4.1 8B Instruct, Granite Guardian 4.1, Langflow, Docling, IBM Bob each named with role |
| 17 | Q&A flashcards memorized | both team members can deliver all 5 cards in < 30s each from cold |
| 18 | Multi-track entries verified | every eligible track checkbox ticked on BeMyApp |
| 19 | Stakeholder quotes attributed | any endorsement quote in deck cites name + org with permission |
| 20 | Git in sync | `git status` clean, `git pull && git push` clean |

---

## 9. Phase 7 — Ongoing Discipline (durable, multi-session)

These behaviors install as memory rules and stay live across all future sessions on this project.

### 9.1 Research-tool discipline (memory-enforced)
Already specified in §6.3. Restated for emphasis: any factual claim → tool first.

### 9.2 Read-before-Edit invariant (mirror of global rule)
Before any file edit: Read first. After 5 tool calls since last Read of a file, re-Read before next Edit. Per global CLAUDE.md.

### 9.3 Session-end sync protocol
Every substantive session ends with a Claude Memory write. Format per §5.3.

### 9.4 Em-dash zero-tolerance
Per global CLAUDE.md. Substitutes table memorized.

### 9.5 Atomic commit + push-immediately
One logical change per commit. ≤100 char subject. Push after every commit. Verify CI green per push.

### 9.6 Operator-unassociation principle
For any community member, mod, or operator: anonymous + aggregate description unless explicit per-surface consent. Even when they reply to outreach, separate consent for deck vs README vs video.

### 9.7 Galaxy-tier scope (no deferrals) — load-bearing project rule
**Nothing is "post-hackathon," "stretch," or "if time permits." Everything ships by 2026-05-31 23:59.**

This rule reframes the entire plan. There is no §18 "outer-orbit stretch" and no "post-submission" §17.10. Every enhancement in §16, every external-tool layer in §17, every "future" thing in §14 collapses into the 12-day scope. The team operates on an "aim for the galaxy, hit the moon" budget: even if a feature lands at 70% quality, having attempted it at all on Day 11 beats deferring it to a "version 2" that judges will never see.

Concrete implications already folded into §7 below:
- Live driver mode (sim-rig running adaptive controls feeding APEX in real time) → Day 9–10 commit, not "if dress rehearsal passes"
- Real adaptive-driver beta-tester quote → Day 7 commit, escalate LinkedIn DM if Phase 1 emails go dark
- NeurIPS Workshop paper draft → Day 11–12, drafted (not just outlined) before submission
- June Challenge bridge architecture → Day 8 parallel-track planning, with one slide in the final deck explicitly committing to it
- Public Colab demo + apex.race/judges + apex.race/status + 30s highlight clip + reproducibility metadata → all Day 7–11
- Methodology trace doc + devlog + multi-track submission → all Day 11 commits

The rule itself is committed to memory as `feedback_galaxy_ambition_no_deferrals.md` (§6.2). It applies to every future session on this project. If a future iteration says "let's punt X to v2," it gets rejected on sight unless X is physically impossible by May 31.

### 9.8 Two-cycle BeMyApp workflow awareness
(Not applicable here — BeMyApp does not have a 2-step approval — but the discipline transfers: verify the submission appears on the public projects feed by Day 12 22:00 with an unrelated browser session.)

---

## 10. Phase 0.1 — Name Decision (D0.1 expanded)

Renamed because the BeMyApp portal already shows a competing submission "PitWall" (cinematic GoPro coaching for amateur drivers). Name collision risk is real for judges scanning the 43-submission grid.

### Shortlist (pick one before D0.2)

| # | Name | Tagline candidate | Pros | Cons |
|---|------|------|------|------|
| 1 | **APEX** ★ recommended | "The AI race engineer for the drivers who don't have one." | Universal racing term. Two syllables, brandable, every corner has an apex. Already in our session vocabulary. | `apex.ai` is taken (Apex Autonomy). Use `apex.race` or `apexengineer.dev` domain. |
| 2 | **GreenLine** | "Get cleared to race. Find the line. Make it home." | Carries forward the GreenFlag predecessor energy. Accessibility undertone. Racing-line semantic. | Generic English compound, weaker brand mark. |
| 3 | **Pacer** | "Your race engineer at the speed of one lap." | Short, racing vocabulary, easy to say. | Pacer.com is a fitness app, possible weak collision. |
| 4 | **TouchLine** | "Hand-controls deserve a coach who reads them right." | Distinctive, double-meaning (tactile + boundary). Surfaced as my working name in earlier research. | Less obvious racing fit at first glance. |

Recommendation: **APEX**. Strongest brand mark, universal racing semantic, no PitWall confusion, and the acronym A.P.E.X. = **A**daptive **P**erformance **E**ngineer (with) e**X**planation reads as a deliberate stack-architectural choice rather than a forced backronym.

If APEX is taken on GitHub (likely): fall back to `apex-engineer` or `apex-race`. Check via `gh repo view StephenSook/apex` Day 1.

This decision is **Day 1 D0.1** — block on it before initializing the repo.

---

## 11. Critical Files To Be Created Day 1

| Path | Purpose |
|------|---------|
| `~/Desktop/IBM May/.gitignore` | Python + Node + macOS + IBM/HF + VS Code |
| `~/Desktop/IBM May/LICENSE` | Apache 2.0 |
| `~/Desktop/IBM May/README.md` | Project + IBM stack + demo URL + team |
| `~/Desktop/IBM May/docs/decision-log.md` | Rename rationale + every kill-switch outcome |
| `~/Desktop/IBM May/logs/day-01-2026-05-20.md` | Bootstrap log |
| `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/MEMORY.md` | Index per §6.2 |
| `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/feedback_research_tool_discipline.md` | The durable rule per §6.3 |
| `~/Documents/Obsidian Vault/Projects/<Name> MOC.md` | Project hub per §5.1 |
| `~/Documents/Obsidian Vault/Home.md` | One-line edit per §5.2 |
| `~/Documents/Obsidian Vault/Claude Memory/Session - 2026-05-20 - apex-bootstrap.md` | First session anchor |

---

## 12. Existing Functions / Skills To Reuse (no reinvention)

| Need | Reuse | Path |
|------|-------|------|
| Pre-submission gate runner | `hackathon-pre-deploy` skill | global skill set |
| Multi-agent recon | `claude-council` or `three-brain` | global |
| Pitch pressure-test | `pre-landing-review` | global |
| AI-tone scanning | `humanize` + project-local `scripts/ai-tone-sweep.sh` | global + new |
| Atomic-commit polish | global `commit-commands:commit-push-pr` | global |
| Plan iteration | external review pass per user's "ultraplann" workflow | external |
| PDF rendering | Playwright HTML → PDF (already proven for Vinh briefing) | session-proven |
| Library docs lookup | `context7` MCP | global |
| Web verification | `tavily` / `WebSearch` | global |
| JS-heavy scrape | `firecrawl` MCP | global |
| Academic / paper search | `EXA` MCP | global |
| Time-series ML | Granite TimeSeries TTM r2.1 from Hugging Face | external |
| Document parsing | Granite-Docling + Docling library | external |
| Safety classifier | Granite Guardian 4.1 8B BYOC | external |
| Narrator | Granite 4.1 8B Instruct | external |
| Visible orchestration | Langflow | external |
| Build accelerator | IBM Bob (commit `bob-sessions/` per Ferrari precedent) | external |

---

## 13. Verification

End-to-end the plan succeeds when:

1. `https://github.com/StephenSook/<name>` is public, has 80+ commits, CI green, License Apache 2.0.
2. `<name> MOC.md` in Obsidian links to 6+ child notes, status table reflects current day, last 3 Claude Memory entries are dated within 72h.
3. Project memory dir at `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/` has `MEMORY.md` index + ≥12 entries.
4. `Desktop/IBM May/` matches the §3.2 structure, no PDFs at root, every subdirectory git-tracked.
5. `app/backend/apex/` has: intake/, vision/, ttm/, physics/, guardian/, instruct/, langflow/ — each with at least one Python module and one passing test.
6. `app/frontend/` deploys to Vercel (or HF Space) at a stable URL referenced in README.
7. `deliverables/demo-video.mp4` is ≤ 3:00, plays cleanly, screen captures readable at 1080p.
8. Pre-submit checklist §8 returns all 20 green.
9. BeMyApp submission form filled, every eligible track entry ticked, submission visible on the public projects feed.
10. Q&A flashcards drill log shows both team members at < 30s/card cold from at least 3 hostile passes.

### Smoke test (run locally)

```bash
# from ~/Desktop/IBM May/
git status                                  # clean
gh repo view StephenSook/<name>             # public, has commits
ls research/ | wc -l                        # 12 (every PDF moved)
pytest app/backend/ -q                      # passes
cd app/frontend && npm run build            # succeeds
curl -sI <demo URL>                         # 200
bash scripts/pre-submit-checks.sh           # all 20 green
ffprobe deliverables/demo-video.mp4 2>&1 | grep Duration  # ≤ 3:00
```

### Manual verification

- Read `<name> MOC.md` and last 3 Claude Memory entries from a fresh terminal. Should be enough to brief a new assistant in < 5 minutes.
- Have a non-team-member clone the repo and run the demo path. They reach a coaching report in ≤ 5 minutes total.
- Run the AI-tone sweep on a sample README + email + video transcript and confirm zero blocklist hits.

---

## 14. Pending Decisions (call out explicitly)

- **D0.1 Name:** APEX recommended. Confirm or override. Blocks all of Day 1.
- **D0.2 Repo URL:** `https://github.com/StephenSook/apex` (or fallback). Confirm GitHub username = `StephenSook` and Vinh's GitHub handle for the collaborator invite.
- **D6 Endorsement quote target:** at least one real adaptive-driver or veteran org reply by Day 10, escalation path through Team BRIT driver DMs per §7 Day 7. Per §9.7 galaxy rule, "no quote" is not an acceptable outcome — escalate, don't shrug.
- **D10 Lite fallback trigger:** if Gate G6 (end-to-end pipeline by Day 6) slips, invoke Lite by Day 10 morning. Lite drops sim-rig + Colab but keeps PhysicsTTM core; per §9.7 the default expectation is no fallback because contingencies are built pre-emptively.
- **June Challenge entry:** parallel-track planning starts Day 8 (§7 Day 8 bridge architecture + slide). Full June build is not on this 12-day clock, but the architectural commitment + deck slide IS in scope.

---

## 16. Project Enhancements — bring it to another realm

These are not in the locked Phase 4.5 architecture but each one materially elevates the submission without changing the core product. Folded in here so the plan can ship them when time allows. Ranked by leverage.

### 16.1 The `/judges` tour page (highest UX leverage)
A dedicated single-page route on the live demo that bypasses the upload flow. One click loads the canned "Sarah Reynolds" telemetry + COA + debrief, the pipeline executes live, and the judge sees the full coaching report in 60 seconds without ever touching a file picker. Judges have 5 minutes per submission. Save them four.

Build target: Day 8. Belongs to Stephen.

### 16.2 The Sarah Reynolds persona — story-grade synthetic case
Full persona scripted to last detail and committed to `fixtures/personas/sarah-reynolds.md`:
- Sarah Reynolds, 34, RAF veteran, left-leg amputee from a 2021 service incident.
- Britcar Trophy 2026 grid, #34 BMW M240i.
- MME Motorsport hand-control system, FIA Article 18.3 COA on file (synthetic but format-faithful).
- Donington Park GP, Saturday qualifying, Lap 17 of 19.
- Sector 2 time delta vs her PB: +0.34s. Debrief: "Lost the rears mid-Old Hairpin again, can't trail-brake on the lever the way I did at Croft last month."
- Telemetry CSV is synthetically generated to be physically plausible AND to contain the exact symptom her debrief describes.

Judges remember stories. "An amputee veteran" is forgettable. "Sarah, Lap 17, lost the rears at Old Hairpin" is unforgettable. Build target: Day 6. Stephen + Vinh joint.

### 16.3 Pre-mortem journal (`docs/pre-mortem.md`)
Live document tracking every known failure mode with a printed mitigation. Started Day 2, updated daily:
- Demo Wi-Fi fails on judge day → pre-recorded video plays automatically if `fetch('/health')` times out
- Granite Guardian false-positives a valid recommendation → fallback narrator: "Recommendation withheld pending engineer review"
- Projection layer doesn't converge → return prior-lap baseline + flag in Guardian audit
- HF Space cold-starts during eval → keep-warm cron job every 4 minutes during May 28–31

Same content powers Q&A defense. Build target: Day 2. Vinh owns, Stephen reviews.

### 16.4 30-second highlight clip alongside the 3-minute video
Some judges only watch 30 seconds. Make those 30 the strongest 30. Cut: 0:00–0:05 problem (£500/day) → 0:05–0:10 hero (Billy Monger achievement) → 0:10–0:25 the demo moment (TTM forecast + physics projection + Guardian stamp landing) → 0:25–0:30 close ("the AI race engineer for the drivers who don't have one").

Published alongside the 3-minute video in `deliverables/demo-video-30s.mp4`. Build target: Day 10. Stephen.

### 16.5 Reproducibility metadata on every demo output
Every coaching report, tuning card, and forecast plot tagged with a provenance footer:
- Granite model versions (TTM r2.1, Instruct 4.1 8B, Guardian 4.1 8B, Vision 4.1 4B, Docling 258M)
- Input file hashes (telemetry CSV SHA-256, COA PDF SHA-256, debrief text hash)
- Cited COA section IDs (e.g., "Article 18.3.2(c)")
- Guardian audit ID + verdict + reasoning trace link
- Generation timestamp + commit SHA of the model code

Right-click any claim in the UI, see the provenance. Best-Use-of-Technology booster. Build target: Day 7. Vinh.

### 16.6 Sookra Methodology trace doc (`docs/methodology.md`)
A single-page chronology of how this project was built: Phase 1 recon (6 models), Phase 2 murder-board, Phase 3 concept lock, Phase 4 verification, Phase 5 PhysicsTTM mitigation, Phase 6 build, Phase 7 submission. Names the methodology, dates each phase, cites the artifacts. Signals process rigor to IBM judges who care about engineering discipline.

Cross-references: `~/.claude/skills/hackathon-project-flow/SKILL.md` for the upstream framework. Build target: Day 11. Stephen.

### 16.7 Colab notebook (`deliverables/apex-demo.ipynb`) — published Day 9, live on launch
A self-contained Google Colab notebook that runs the entire pipeline in a free Colab cell on the judge's browser. Zero install. Doubles as: (a) zero-install demo path for judges who hit a live-demo issue, (b) the public "try it yourself" link on `apex.race` from launch day, (c) the supplementary materials artifact attached to the NeurIPS Workshop paper draft (also produced by submission). Build target: Day 9. Vinh.

### 16.8 Public devlog (daily BeMyApp community ping)
Once per build day, post a one-paragraph update to the BeMyApp May Challenge chat room (the `Chat Rooms` widget visible in the user's screenshot). Builds in public, signals momentum, neutral-to-positive view bias from any judge lurking, and seeds the post-submission narrative for IBM Consulting outreach + NeurIPS paper attention. Cost: 90 seconds per day.

Day 1 ping: "Building APEX — an AI race engineer for adaptive drivers using the IBM Granite stack. PhysicsTTM-projected forecasts + COA-aware Guardian audit. Day 1 just smoke-tested Granite TimeSeries TTM on FastF1 telemetry. Let's see where this goes."

Stephen owns. Calendared into every build day's evening tasks.

### 16.9 `apex.race/judges` as the single submission landing page
A one-page TOC for evaluators: live demo URL + 3-min video + 30s clip + deck PDF + GitHub repo + Q&A flashcards + IBM stack diagram + team bios + methodology trace. Judge clicks one link, sees everything. Lower their cognitive load, raise their patience for our actual pitch. Build target: Day 11. Stephen.

### 16.10 Live status dashboard during judging period
On `apex.race/status`: demo URL uptime indicator, current commit SHA, last green CI run timestamp, HF Space health badge. Confidence signal during the eval window (May 31–June 7). Costs an hour to build via Better Uptime or Plausible. Day 11 polish.

### 16.11 Multi-track submission verification (process gate, not feature)
Re-read the IBM rules PDF Day 11 morning. Identify EVERY eligible track on BeMyApp:
- Main May Challenge prize
- Most Innovative
- Best Use of Technology
- Grand Prize (across May + June)
- Any sponsor-specific track (Granite Open Track? Watson TTS Track? — check)
- Any community-voted / popularity track

Tick every box on the form per global hackathon multi-track strategy (CLAUDE.md). Each unchecked box = forfeited entry. This is process work, not engineering, but the cost of missing it is real.

---

## 17. External Tooling Layers (the "another planner" amplifiers)

Skills + agents + MCP servers we will deliberately deploy at specific moments to multiply leverage. Each one is invoked once or twice, not continuously.

### 17.1 `pre-landing-review` skill — Day 9 pitch pressure-test
After demo video v0 is recorded, run the deck + video + README through this skill before locking v1. Catches the last 10% of issues a human reviewer would surface.

### 17.2 `claude-council` skill — Day 10 final adversarial pass
Five-advisor council with anonymous peer review. Run once on the final pitch + Q&A defense pack to flush any blind spots before submission. Different from the Phase 1-4 model recon because the council uses the same model (calibration check, not diversity check).

### 17.3 `three-brain` stack — Day 9 + Day 10
- Codex (GPT-5.5) as adversarial reviewer on the demo loop code before the dress rehearsal.
- Gemini 2.5 Pro for the 3-minute video pass — multimodal review of the actual recorded video, not the script.
- Claude (us) as the driver synthesizing both.

### 17.4 `feature-dev:code-architect` — Day 1 backend blueprint
Use to lay down the FastAPI + Langflow + Granite skeleton with explicit file paths and module boundaries before Vinh writes the first line. Saves Vinh 2–3 hours of decision-fatigue.

### 17.5 `architecture-reviewer` skill — Day 7 mid-build audit
After Gate G6 (end-to-end pipeline works), run an architecture review to catch scalability + structural debt that will bite during Q&A. Specifically requested dimensions: enterprise readiness (IBM judge cares), performance, security.

### 17.6 `repo-sentinel` skill — Day 11 pre-push security sweep
Full repo audit for secrets leaks, exposed API keys, dependency vulnerabilities, license compliance, before the final public push. The `HF_TOKEN` and `WATSONX_PROJECT_ID` MUST be in env vars, not in committed files.

### 17.7 NotebookLM gap analysis — Day 8 + Day 11
Two more passes:
- Day 8: feed `docs/pre-mortem.md` + the latest synthesis + the Day 5 demo recording, ask "What objection have we still not addressed?"
- Day 11: feed the full submission package, ask "If you were an IBM judge, what's the one weakness you'd flag?"

### 17.8 `codex:codex-rescue` — emergency-only
If Gate G6 slips and end-to-end doesn't work by Day 7, escalate to Codex via the codex-rescue agent for a fresh-eyes diagnosis pass. Cost: one hour of Codex time. Value: avoids the Day 10 Lite fallback.

### 17.9 Context7 + Firecrawl + EXA + Tavily — continuous
Per the durable rule installed in §6.3. Whenever Vinh hits an unknown API behavior (Granite-Docling parsing edge case, Cvxpylayers gradient flow, HF Space deployment quirk), context7 first, tavily second, firecrawl third, EXA for any academic citation. Save findings to project memory as fact cards. Never bluff.

### 17.10 `usage-audit` skill — Day 11 evening (in scope, not deferred)
Audit the session-level cost + token spend so we have real economics data for the IBM Consulting outreach email on Day 12 and the NeurIPS paper's cost-efficiency claim. Per global CLAUDE.md cost discipline. Output committed to `docs/cost-audit-2026-05-30.md`.

---

## 18. Galaxy-Tier Inclusions — confirmation list

Every item in this section is committed to the 12-day scope per §9.7. None are deferred. The plan ships all of these by 2026-05-31 23:59 or it fails the galaxy bar.

| # | Inclusion | Day committed | Owner | Cross-ref |
|---|-----------|---------------|-------|-----------|
| 1 | Live sim-rig driver mode in 3-min video | Day 9 stand-up, Day 10 recording | Stephen + Vinh | §7 Day 9 |
| 2 | Real adaptive-driver beta-tester quote (Team BRIT driver DM escalation) | Day 7 send, by-Day-10 deadline for reply | Stephen | §7 Day 7 |
| 3 | June Challenge bridge architecture + slide | Day 8 | Stephen | §7 Day 8 |
| 4 | Public Colab notebook (`deliverables/apex-demo.ipynb`) | Day 9 | Vinh | §16.7 |
| 5 | `apex.race/judges` landing page | Day 11 | Stephen | §16.9 |
| 6 | `apex.race/status` live status page | Day 11 | Stephen | §16.10 |
| 7 | 30-second highlight clip alongside 3-min video | Day 10 | Stephen | §16.4 |
| 8 | Reproducibility metadata footer on every demo output | Day 10 | Vinh | §16.5 |
| 9 | `docs/methodology.md` — Sookra Methodology trace | Day 11 | Stephen | §16.6 |
| 10 | `docs/pre-mortem.md` — running failure mode journal | Started Day 2, final-polished Day 11 | Vinh + Stephen | §16.3 |
| 11 | `docs/cost-audit-2026-05-30.md` from usage-audit | Day 11 | Stephen | §17.10 |
| 12 | NeurIPS Workshop paper DRAFT (`paper/apex-neurips-workshop-2026.md`) | Day 11 | Vinh | §7 Day 11 |
| 13 | IBM Consulting cold email referencing Ferrari case study | Day 12 afternoon | Stephen | §7 Day 12 |
| 14 | Multi-track submission with every checkbox ticked | Day 12 afternoon | Stephen | §16.11 |
| 15 | Daily BeMyApp community devlog | Every build day evening | Stephen | §16.8 |
| 16 | All §17 external-tool passes (pre-landing-review, claude-council, three-brain, architecture-reviewer, repo-sentinel, NotebookLM) | Day 11 | Both | §17 |

If any item slips past its day, escalate immediately. No rescheduling to "post-submission."

---

## 19. Why this plan should survive a future "ultraplann" iteration pass

The plan is structured so a hostile external reviewer (or another LLM running an iteration pass) finds clean addressable seams instead of a monolith:

- **Phases are numbered and self-contained** (§2–§9). Each phase has owner, output, gate, and commit target.
- **Critical files explicitly listed** (§11) so any reviewer can verify "did this happen?"
- **Verification section** (§13) gives a concrete pass/fail smoke test, not a vibe.
- **Decisions pending** (§14) are surfaced rather than buried.
- **Existing reuse** (§12) prevents "reinvent the wheel" objections.
- **Discipline rules** (§9) carry through every session, not just this one — so iteration passes don't have to re-derive the global hygiene.

If the user runs this plan through a hostile model review, the expected output is improvements at the leaf-level (one gate's pass criterion, one PR's commit ordering), not structural objections. Structural risk has been pre-addressed by phase boundaries, gates, and the Phase 4.5 synthesis we already locked.
