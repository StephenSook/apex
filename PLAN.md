# APEX - Plan & Coordination

> Living working doc for **Stephen Sookra** (frontend + pitch + project architect) and **Vinh Le** (backend + ML pipeline + data + AI). Updated on every task status change and pushed to `main`. Authoritative over `docs/architecture-spec.md` when the two disagree.

**Hackathon:** IBM SkillsBuild AI Builders Challenge, May Challenge ("AI Beyond the Finish Line")
**Submission deadline:** 2026-05-31, 11:59 PM ET
**Repo:** https://github.com/StephenSook/apex
**Strategy:** Galaxy-tier scope. Playing for Grand Prize ($5K across May+June) AND 1st Place + Most Innovative + Best Use of Technology. No item is "post-hackathon" or "stretch." Conservative core ships first (Phases 0-3, Days 1-6), enhancement layers stack on top (Phases 4-6, Days 7-11), each layer independently cuttable if it threatens the Day 12 submit.

---

## Status snapshot (last sync 2026-05-21 PM, Day 2)

This snapshot is the at-a-glance reality check for anyone reading PLAN.md fresh.

**Phase 0 - Bootstrap:** 🟡 IN PROGRESS (Day 2, Vinh side only).
Row IDs below match the Phase 0 build table further down (rows 0.1 through 0.19); this snapshot just collapses the table to the load-bearing items. M11 wave-24 closure: D-prefix dropped so status + table share one ID scheme.
- 0.1 Lock APEX name (rename from PIT WALL): ✅ DONE
- 0.2 Init GitHub monorepo: ✅ DONE (https://github.com/StephenSook/apex live)
- 0.3 Invite Vinh as collaborator: ✅ DONE (Stephen confirmed invite sent, Vinh has been texted, waiting on accept)
- 0.9 Obsidian APEX MOC + 7 child notes + Home.md update: ✅ DONE
- 0.8 Project memory folder + 15 seed files: ✅ DONE
- 0.6 Reorganize `Desktop/IBM May/` per §Repo layout: ✅ DONE (13 atomic commits, all pushed)
- 0.4 Hand Vinh the briefing PDF + repo URL: ✅ DONE (committed at `docs/briefing-for-vinh.pdf`)
- 0.13 Vinh TTM smoke test (Gate G1): ⬜ pending (Vinh-side, once he accepts repo invite). APEX Lite EARLY trigger Q-007 active at Day 2 noon ET if Vinh-unresponsive.

**Phase 1 - Document parsing (Day 2, Vinh):** ⬜ pending Vinh side. Stephen-lane Dropzone UI + /analyze route + pre-mortem.md all pulled forward to Day 1 EOD per galaxy-tier rule and now live.

**Phase 2 - Physics layer (Days 3-5, Vinh):** ⬜ pending Vinh side. CoachingReport + GuardianAudit + TuningCard frontend components all pulled forward to Days 1-2 and shipped against shared/types.ts contracts. Gate G4 bumped to Day 2 parallel spike per Codex critique #2.

**Phase 3 - Narrator (Day 6, Vinh):** 🟡 partial. Sarah Reynolds persona narrative ✅ (Day 1 EOD pull-forward, Stephen-lane). Vinh data fixtures + integration Day 6.

**Phase 4 - Orchestration + polish (Days 7-8, both):** 🟡 partial. 3-min pitch script v0 ✅ Day 1 EOD pull-forward; 4 of 5 remaining Phase 4.5 mandatory edits applied wave-19 evening. Langflow export + Convergence-14 + 60s latency Vinh-side Day 7-8.

**Phase 5 - Demo + deploy (Days 9-10, both):** 🟡 partial. Vercel config + runbook ✅ Day 2 PM pull-forward. Colab notebook skeleton ✅ Day 2 PM (Stretch S4). Sim-rig frontend scaffold + /sim-rig route ✅ Day 2 PM (Stretch S1 frontend slice). Demo video storyboard ✅ Day 2 PM. HF Space + sim-rig WebSocket backend + production video take Day 9-10.

**Phase 6 - Submission package (Day 11, both):** 🟡 partial. /judges + /status routes ✅ Day 1 EOD pull-forward. methodology.md Phase 6+7 expansion + cross-references ✅ Day 2 PM. pre-mortem.md ✅ live with 40+ entries (Day 11 final polish remains). NeurIPS paper outline ✅ Day 2 PM (S10 skeleton; Day 11 readable-draft expansion remains). External-tool passes Day 11.

**Phase 7 - Submit (Day 12, both):** ⬜ pending. Multi-track BeMyApp form + IBM Consulting cold email + retrospective. HARD DEADLINE 11:59 PM ET.

**Critical-path Vinh deps still open:**
1. Accept collaborator invite
2. Clone repo + `pip install granite-tsfm` + Gate G1 TTM smoke test
3. Gate G4 Day-2 parallel spike (zero-shot TTM vs seasonal-naive on FastF1 holdouts)
4. Day 2 Granite-Docling + Granite Vision pipeline

**Critical-path Stephen ops still open (Day 2 evening + Day 3):**
1. Day 3 LinkedIn DM drafts (escalation moved from Day 7 per Codex critique #4)
2. Phase 1+2+3 stakeholder reply check (6 emails sent across Day 0+1, 0 returned so far, 10 days remaining)
3. Q&A Card 2 memorization (Kinetic Hallucination defense) drilled 3x cold
4. Daily BeMyApp community devlog Day 2 evening send
5. Pre-mortem.md daily Day-2 entry
6. Monitor for Vinh GitHub-invite-accept; APEX Lite EARLY trigger Q-007 evaluation at noon ET if no response

**Calibration ceiling (NotebookLM Phase 5 pass):** 90% top-3 / 96% Best Use of Technology / 88% Most Innovative. Working planning numbers: 75/85/75.

**Commits Day 1 + Day 2:** 220+ atomic commits, all pushed, CI green per push (concurrency block dropped wave-18 to prevent middle-queue cancel cascade). Wave-25 row 2.9 split into 2.9a (Stage 1 convex QP) and 2.9b (Stage 2 post-projection feasibility filter); Phase-2 physics layer is now the two-stage projection-and-audit layer. Wave-26 landed the Convergence-14 fixture grid + Figure 1 architecture embed on `/judges` (galaxy-tier safety-contract visualization), the 30-second highlight-clip storyboard + BeMyApp Day 2 devlog + cost-audit shell + BeMyApp submission-payload sweep, and the ConvergenceFixture discriminated-union refactor (compile-time class-stage + COA-payload + serializer-integrity-verdict invariants). Wave-27 closed 4-agent self-review (codex + gemini + silent-failure-hunter + type-design re-validation): 6 Codex physics-math BLOCKERs (C14-04 sign + C14-05 + C14-06 bicycle thresholds + arch-spec jerk_max contradiction) + 4 silent-failure HIGHs (Figure 1 CLS picture-fallback + onError + download attribute + ResourceTile fragment-link) + type-design closure_kind discriminator + IBM Bob attribution scope softening + commit-count drift sweep. Single mega-commit `1e0c182` due to Anthropic safety-classifier capacity outage during the closure window; logical breakdown in `docs/wave-27-cold-review-findings.md`.

---

## Vinh - read this first when you wake up (2026-05-21 AM)

**End of Day 1 (2026-05-20) status:**

Stephen completed the bootstrap. Repo, scaffold, memory, Obsidian, plan, briefing PDF, decision log all live.

### What's in the repo waiting for you

- `https://github.com/StephenSook/apex` is public, Apache 2.0, 13+ commits pushed
- `docs/briefing-for-vinh.pdf` is the full 21-page briefing (legacy PIT WALL branding kept as artifact; the rename to APEX is the only thing that changed about the substance)
- `PLAN.md` (this file) is the living coordination doc
- `docs/decision-log.md` lists every locked decision (D-001 through D-007)
- `research/` has all 12 model recon PDFs (Claude, Perplexity, DeepSeek, Gemini, Groq, Kimi, two ChatGPT runs) plus the IBM rules + May brief + Physics-TTM research artifact
- `app/backend/apex/` has 7 empty subpackages waiting for your code (intake, vision, ttm, physics, guardian, instruct, langflow) plus `tests/` for the Convergence-14 serializer unit-test suite
- `physics-tsfm/` is the library carve-out for the NeurIPS Workshop paper draft (Day 11)
- `fixtures/{coa, telemetry, timing-sheets, personas}` are the test-data slots; populate with Sarah Reynolds persona Day 6
- `paper/` is where the NeurIPS draft lives starting Day 11

### Your action items in order (~30 min before any backend code)

1. **Accept GitHub collaborator invite.** Stephen sent the invite + texted you. Check `https://github.com/StephenSook/apex/invitations` or wait for the GitHub email.
2. **Read `docs/briefing-for-vinh.pdf`** (cover to cover, ~25 min). Skip pages 1-2 if you only have 5 minutes; pages 11-12 are your lane.
3. **Clone the repo:** `git clone https://github.com/StephenSook/apex && cd apex`
4. **Set git config to your account** so green-squares attribute correctly: `git config user.email <your-github-email>` and `git config user.name <your-github-name>`.
5. **Verify the IBM SkillsBuild rules PDF + the FIA Vehicle Adaptation Guidelines** in `research/` (link to live FIA URL in `docs/architecture-spec.md` if not present, fall back to the PDF in research).
6. **Run Gate G1 - TTM smoke test:**
   ```bash
   cd app/backend
   python3 -m venv .venv && source .venv/bin/activate
   pip install granite-tsfm transformers torch fastf1
   python -c "from tsfm_public.toolkit import TinyTimeMixerForPrediction; m = TinyTimeMixerForPrediction.from_pretrained('ibm-granite/granite-timeseries-ttm-r2'); print(m)"
   ```
   Commit `logs/day-01-ttm-smoke.md` documenting: load time, inference latency on a 6000x8 telemetry slice, output tensor shape. Pass criterion: TTM loads + 1Hz inference returns within 60s on your machine. If it does not, switch to APEX Lite contingency (drop TTM, keep Granite 4.1 8B Instruct + Guardian on regulatory-only product) and ping Stephen.

### What Stephen has done + planned next work (parallel to yours)

- ✅ Repo init, license, gitignore, README, PLAN.md, decision log, memory, Obsidian. Done Day 1.
- ⬜ Next: `app/frontend/` Next.js 16 + Tailwind + Plex + Fraunces scaffold with WCAG 2.1 AA baseline (Day 1 evening / Day 2 morning).
- ⬜ Day 2 PM: file-upload UI + dropzone + accessibility baseline; start `docs/pre-mortem.md`.
- ⬜ Day 6: Sarah Reynolds persona script committed to `fixtures/personas/sarah-reynolds.md`.

### Contact path (no Slack/Discord yet - use these in order)

1. **Real-time:** the chat platform you and Stephen have been using (text/iMessage/Discord DM)
2. **Async, attached to repo:** add a `🟡 NEEDS-INPUT` row in PLAN.md with your question; Stephen will see on next `git pull`
3. **Issue tracking:** open a GitHub issue at https://github.com/StephenSook/apex/issues if it's structured

### Coordination protocol (mirrors Hometown-Pathway-Atlas + Trace conventions, see §Coordination Protocol below)

- Edit PLAN.md to claim 🟡, complete ✅, block ⛔, cut ✂️
- Single-file commit per status change
- 4-hour stale lock TTL
- ⚠️ CONTRACT prefix on commits that change Shared Contracts
- **NO git hooks, NO CLI wrappers, NO commit-msg validators.** Manual coordination only. The `.git/hooks/` directory must contain only `.sample` defaults. Locked per D-006.

---

## Sources of truth (priority order)

1. **`~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/`** - persistent context Claude Code reads every session. Locked rules + facts live here. If anything in PLAN.md drifts from a memory file, fix the drift in PLAN.md.
2. **`docs/architecture-spec.md`** (v0 Day 1, expansion Day 2) - full system design. Master reference for stack roles, physics-projection layer math, COA section IDs, FIA Article references.
3. **This file (`PLAN.md`)** - authoritative for task ownership, status, decisions, contracts.
4. **`docs/briefing-for-vinh.pdf`** - operational guide for Vinh's Days 1-6.
5. **`docs/decision-log.md`** - every locked decision with rationale + date + scope.
6. **`docs/methodology.md`** (Day 11) - Sookra Methodology trace.
7. **`docs/pre-mortem.md`** (Day 2 start, Day 11 final) - running failure-mode journal.
8. **`README.md`** - public-facing pitch. Locked Day 11. Do not mirror this plan into it.

### Cold review findings index (referenced by closure-tag citations across PLAN rows + commit messages)

- `docs/wave-22-cold-review-brief.md` - pre-staged dispatch packet for the wave-22 6-lens cold review (written 2026-05-21 night-late).
- `docs/wave-22-cold-review-findings.md` - consolidated wave-22 findings (5 BLOCKER + 14 HIGH + 20 MED + 11 NIT). Defines closure IDs B1-B5, H1-H14, M1-M20, N1-N11 referenced in PLAN rows + commit messages.
- `docs/wave-23-cold-review-findings.md` - consolidated wave-23 findings (5 BLOCKER + 14 HIGH + 13 MED + 8 NIT). Defines wave-23 closure IDs.
- `docs/wave-24-cold-review-findings.md` - consolidated wave-24 findings (9 BLOCKER + 14 HIGH + 12 MED + 2 NIT). Defines wave-24 closure IDs; closures landed in wave-25 commits.
- `docs/wave-25-cold-review-findings.md` - consolidated wave-25 findings (13 BLOCKER + 20 HIGH + 13 MED + 11 NIT) caught by 4-agent parallel sweep + manual Bash + WebFetch verification of Granite IDs. Closures are landing in subsequent wave-25 atomic commits across paper title + README Differentiator #2 + arch-spec ASCII + decision-log D-A + outreach drafts + June bridge + APEX-Lite + methodology + Sarah persona vocab + Q&A Cards 1/2/5 + PLAN ID-scheme + brand-fonts JSDoc + architecture.svg re-render.
- `docs/wave-27-cold-review-findings.md` - consolidated wave-27 findings (6 BLOCKER + 7 HIGH + 7 MED + 1 NIT) caught by 4-agent self-review on the wave-26 batch (codex + cc-gemini-plugin:gemini-agent which timed out at API 529 + pr-review-toolkit:silent-failure-hunter + pr-review-toolkit:type-design-analyzer re-validation) plus manual physics-math verification. Closures landed in single mega-commit `1e0c182` due to Anthropic safety-classifier capacity outage that prevented atomic-commit cadence in the closure window. Findings doc preserves logical breakdown.

---

## Status dashboard

Legend: ✅ done · 🟡 in progress · ⬜ not started · ⛔ blocked · ✂️ cut

**Bold owner = currently active on the task. Plain owner = assigned but not started.**

### Phase 0 - Bootstrap (Day 1, both)

| # | Component | File(s) | Owner | Status | Notes |
|---|-----------|---------|-------|--------|-------|
| 0.1 | Lock APEX name (rename from PIT WALL) | repo metadata | **Stephen** | ✅ | A.P.E.X. = Adaptive Performance Engineer with eXplanation. BeMyApp portal showed competing "PitWall" submission. |
| 0.2 | Init GitHub monorepo + Apache 2.0 LICENSE | repo root | **Stephen** | ✅ | `gh repo create apex --public --source=. --remote=origin --push` |
| 0.3 | Invite Vinh as collaborator | GitHub Settings | **Stephen** | ✅ | Invite sent + Vinh texted; waiting on accept |
| 0.4 | Drop PLAN.md + STATUS_TEMPLATE + briefing PDF | repo root, docs/ | **Stephen** | ✅ | Coordination is manual (mirrors Trace/Hometown) - no hooks, no CLI |
| 0.5 | `.gitignore` for Python + Node + IBM caches | repo root | **Stephen** | ✅ | 122 lines |
| 0.6 | Reorganize 12 PDFs into research/ + docs/ | research/, docs/ | **Stephen** | ✅ | All kebab-case |
| 0.7 | Scaffold app/, physics-tsfm/, fixtures/, deliverables/, scripts/, bob-sessions/, paper/, logs/ | repo tree | **Stephen** | ✅ | 25 `.gitkeep` placeholders |
| 0.8 | Project memory folder + 15 seed files | `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/` | **Stephen** | ✅ | 8 project facts + 6 durable rules + 1 index |
| 0.9 | Obsidian APEX MOC + 7 child notes + Home.md update | Obsidian vault | **Stephen** | ✅ | State-recovery anchor live |
| 0.10 | `logs/day-01-2026-05-20.md` + `docs/decision-log.md` | logs/, docs/ | **Stephen** | ✅ | Committed |
| 0.11 | Vinh's git config matches GitHub account | Vinh's local | Vinh | ⬜ | `git config user.email <your-github-email>` |
| 0.12 | Vinh accept invite + clone repo | Vinh's local | Vinh | ⬜ | Blocker for parallel build |
| 0.13 | **Gate G1 - TTM smoke test** | `logs/day-01-ttm-smoke.md` | Vinh | ⬜ | Pass: TTM loads + 1Hz inference within 60s on M2 or RTX 4060 |
| 0.14 | Next.js 16 + Tailwind v4 + Plex + Fraunces scaffold | `app/frontend/` | **Stephen** | ✅ | Day 1 PM. Editorial-paddock palette, WCAG 2.1 AA baseline (skip link, focus ring, prefers-reduced-motion), full APEX landing page with hero + Sarah moment + PhysicsTTM 3-layer + 5 differentiators + build status + stack badges + footer. Build + lint + SSR smoke all green. |
| 0.15 | Mermaid architecture diagram in README + SVG export to docs/ | README.md, docs/architecture.svg | **Stephen** | ✅ | Mermaid in README live; SVG export Day 11. |
| 0.16 | Project-local `CLAUDE.md` (refers to global + memory) | repo root | **Stephen** | ✅ | 79 lines. Locked decisions D-001 through D-007, hard compliance, editorial-paddock identity. |
| 0.17 | `STATUS_TEMPLATE.md` for daily handoffs | repo root | Stephen | ✅ | Mirrors Hometown convention |
| 0.18 | `docs/architecture-spec.md` v0 skeleton | docs/ | **Stephen** | ✅ | Day 1 PM. Component spec for PhysicsTTM 3 layers + intake + vision + narrator + Langflow + Bob. Day 2 expansion fills physics math + COA schema + API contracts. |
| 0.19 | `SUBMISSION.md` v0 BeMyApp form draft | repo root | **Stephen** | ✅ | Day 1 PM. 7-block story + tech tags + multi-track checklist + Day-12 submission sequence. |

### Phase 1 - Document parsing (Day 2, Vinh)

| # | Component | File(s) | Owner | Status | Deps | Notes |
|---|-----------|---------|-------|--------|------|-------|
| 1.1 | Granite-Docling 258M parses FIA COA PDF into structured JSON | `app/backend/apex/intake/coa_parser.py` | Vinh | ⬜ | 0.13 | Preserve section IDs + 9 adaptation domains |
| 1.2 | Granite Vision 4.1 parses SRO timing-sheet PDF into CSV | `app/backend/apex/vision/timing_parser.py` | Vinh | ⬜ | 0.13 | Charts/tables only, not phone photos |
| 1.3 | Fixture COA + timing-sheet committed | `fixtures/coa/`, `fixtures/timing-sheets/` | Vinh | ⬜ | 1.1, 1.2 | Public FIA + SRO examples |
| 1.4 | Tests for intake + vision parsers | `app/backend/tests/test_intake.py`, `test_vision.py` | Vinh | ⬜ | 1.3 | Schema fixtures |
| 1.5 | **Gate G2 - COA parse coverage** | logs entry | Vinh | ⬜ | 1.1 | Pass: JSON contains all 9 adaptation domains + section IDs |
| 1.6 | File-upload UI dropzone + WCAG keyboard/screen-reader | `app/frontend/components/Dropzone.tsx` | Stephen | ✅ | 0.14 | Pulled forward to Day 1 EOD per galaxy-tier rule. 641-line component + `/analyze` route + Playwright a11y snapshot verified. Day-2 task = wire `Analyze` link into landing-page nav. |
| 1.7 | `docs/pre-mortem.md` started | docs/ | **Stephen** | ✅ | - | Pulled forward to Day 1 EOD per galaxy-tier rule. 12 Day-1 failures logged (incl. wave 7/8/9 observed) + 17 forward-looking modes + 3 accepted residual risks. Daily updates start Day 2 morning. |
| 1.8 | Q&A Card 2 memorization (Kinetic Hallucination) | mental | Both | ⬜ | - | Drill 3x |
| 1.9 | OpenRouter API key + Granite 4.1 8B sample call (Discord intel 2026-05-20: OpenRouter approved, free tier, no CC required, `openrouter.ai/ibm-granite/granite-4.1-8b`) | logs entry + `.env.example` | Vinh | ⬜ | 0.13 | Primary inference path for HF Space deploy Day 9. Backup = watsonx.ai (free account, IBM ID). Skip Replicate (CC required) + HF inference endpoints (Granite not publicly hosted). |
| 1.10 | Fork IBM-SkillsBuild Learning Lab repo + run TORCS lab + record 1 RESULTS.md entry | `https://github.com/IBM-SkillsBuild-AI-Builders-Challenge/hands-on-labs` | Vinh | ⬜ | - | Downgraded 2026-05-21 PM after WebFetch of the Official Rules Google Doc: TORCS lab completion is NOT in the rules' binding submission requirements. Stays as "recommended community-signal only" - nice-to-have if Day-2 budget allows but skippable if Vinh-lane bandwidth tightens. Discord intel had over-read the eligibility constraint. See `reference_ibm_skillsbuild_org.md` for verbatim rules. |
| 1.11 | README structure audit (explicit problem / AI approach / racing relevance per BeMyApp pinned 2026-05-20) | `README.md` | Stephen | ⬜ | - | Currently has all 3 implicitly under "The opening stat" + "What makes it different." Day 2 task: surface as explicit section headings to match makenna's pinned submission requirements. |
| 1.12 | Watch BeMyApp hosting webinar + submission walkthrough video, log any submission-form field deltas | `deliverables/bemyapp-submission-payload.md` | Stephen | ⬜ | - | URLs in `reference_discord_intel_day_1.md` private memory. Day 2 task. |
| 1.13 | Accept IBM-SkillsBuild-AI-Builders-Challenge GitHub org invite (unlock 3 private repos: community-guide + innovation-challenges + showcase-hall-of-fame) | external (GitHub email) | Stephen | ✅ | - | Done 2026-05-21 PM. Reference memory `reference_ibm_skillsbuild_org.md` captures verified rules + prize structure + DQ triggers + verbatim binding submission requirements pulled from the Official Rules Google Doc. |
| 1.14 | Verify Vinh receives + accepts the same GitHub org invite under his account | external (Vinh's email) | Vinh | ⬜ | 1.13 | Per the rules, team-member info ships on the BeMyApp form. Vinh-side org membership is not a binding requirement, but it unlocks the 3 private repos (rules + submission + showcase) for his reference. **Update 2026-05-21 night per a BeMyApp staff Discord clarification:** invites are throttled at 500/day; full participant rollout completes by Tuesday 2026-05-26 to 2026-05-27. Vinh-side absence is benign + the `hands-on-labs` repo is already public so Vinh can start TORCS without org access (PLAN row 1.10 recommended-only). Re-check Tuesday 2026-05-27 EOD; if no Vinh response by then, evaluate Q-007 EARLY APEX Lite trigger on the OTHER failure modes (no reply in 48h, G1/G4 fail). |
| 1.15 | Join the IBM SkillsBuild Discord (community + `#may-challenge-and-labs` channel) | external (discord.gg/Nmcm2uCze4) | Stephen | ✅ | - | Done 2026-05-21 PM. Canonical channel for clarifications + question-asking. |
| 1.16 | Ask Discord whether ONE submission can win multiple per-challenge awards (1st + Best Use of Technology + Most Innovative stacking) | discord post | Stephen | ✅ | 1.15 | Resolved 2026-05-21 night via Discord answer captured in Stephen-shared screenshot. A BeMyApp staff moderator answered a community member's question: "You're submitting 1 project and prizes such as best use of technology are decided by the judges!" **Verdict: NO opt-in tracks.** ONE submission per team. Judges award the four per-challenge categories on their own assessment. Multi-track-stacking strategy from global CLAUDE.md is mooted; project-flow falls back to: build the best single submission across all four official judging criteria (Technical Execution / Innovation / Challenge Fit / Implementation & Feasibility). Cross-reference: `reference_competitors_calibration.md`. |

### Phase 2 - Physics layer (Days 3-5, Vinh)

| # | Component | File(s) | Owner | Status | Deps | Notes |
|---|-----------|---------|-------|--------|------|-------|
| 2.1 | Pure-NumPy kinematic validator V1 (friction ellipse + bicycle + Euler + jerk) | `app/backend/apex/physics/validator.py` | Vinh | ⬜ | 0.13 | Day 3 |
| 2.2 | V1 catches 5 impossible-physics traces + approves 5 valid | `app/backend/tests/test_physics_v1.py` | Vinh | ⬜ | 2.1 | **Gate G3** |
| 2.3 | Langflow graph screenshot mockup for deck slide 6 | `docs/deck/langflow-mockup.png` | Stephen | ⬜ | - | Day 3 |
| 2.4 | Q&A Card 3 memorization (Serialization) | mental | Both | ⬜ | - | Drill 3x |
| 2.5 | TTM → NumPy validator → text log end-to-end | `app/backend/apex/ttm/forecast.py` + integration | Vinh | ⬜ | 2.1, 0.13 | Day 4 |
| 2.6 | Beats seasonal-naive baseline on 3 of 5 holdout circuits | `app/backend/tests/test_ttm_vs_naive.py` | Vinh | ⬜ | 0.13 (NOT 2.5) | **Gate G4 - BUMPED TO DAY 2 PARALLEL SPIKE per Codex critique #2 BLOCKER.** Run alongside G1 smoke. 3-4 hour spike using FastF1 holdout circuits. Pass criterion: TTM zero-shot RMSE beats seasonal-naive on 3 of 5 holdouts. If FAIL: immediate invoke APEX Lite contingency (`docs/apex-lite-contingency.md`) OR reframe pitch from "TTM forecasts pace" to "physics-constrained envelope generator + COA-aware narrator" (drop TTM as the headline novelty, keep COA + physics layer). Day-2 timing buys 9 days for pivot vs. Day-4 timing buying 7. |
| 2.7 | Coaching-report React component (corner-by-corner cards) | `app/frontend/components/CoachingReport.tsx` | Stephen | ✅ | - | Day 4 pull-forward to Day 1 EOD. Renders CornerInsight ReadonlyArray with Citation provenance per shared/types.ts contract. Vitest suite covers happy-path + empty-corners edge. |
| 2.8 | Q&A Card 4 memorization (COA Simultaneity) | mental | Both | ⬜ | - | Drill 3x |
| 2.9a | Stage 1 convex QP projection (friction ellipse + forward-Euler kinematic + jerk bound) via CvxpyLayer | `app/backend/apex/physics/projection.py` | Vinh | ⬜ | 2.5 | Day 5. Convex constraints only; decision variables `(a_long, a_lat, speed_{t+1})`. See `docs/wave-24-cold-review-findings.md` for the §3.2 reformulation rationale + `docs/wave-25-cold-review-findings.md` for the SI-unit convention. |
| 2.9b | Stage 2 post-projection feasibility filter (bicycle-model audit + COA-parameterized simultaneity gate) | `app/backend/apex/physics/feasibility.py` | Vinh | ⬜ | 2.9a | Day 5. Non-differentiable accept/reject audit on the Stage 1 projected tensor. Bicycle model as low-slip kinematic approximation (`steering_rad` = road-wheel angle); COA-simultaneity gate as complementarity check. **Threshold lock** (committed before 2.9a closes): slip-tolerant bound = 0.03 rad; ε numerical tolerance = 1e-6. |
| 2.9c | Stage 1 + Stage 2 unit-test suite | `app/backend/tests/test_projection.py` + `app/backend/tests/test_feasibility.py` | Vinh | ⬜ | 2.9a, 2.9b | Day 5. Stage 1 projects 10 fixture tensors within ε=1e-4 of analytic optimum; Stage 2 rejects bicycle-violating fixtures + COA-simul-violating fixtures with 100% recall on the Convergence-14 fixture enumeration. |
| 2.10 | Granite Guardian 4.1 BYOC custom rules audit text log (consumes Stage 1 + Stage 2 violation logs uniformly) | `app/backend/apex/guardian/audit.py` | Vinh | ⬜ | 2.9a, 2.9b | Day 5. Convergence-14 serializer reads both `qp_violation_log` (Stage 1) and `feasibility_log` (Stage 2) and produces the structured English text Guardian audits under BYOC rules. |
| 2.11 | Guardian catches the same 5 impossibilities the validator catches | `app/backend/tests/test_guardian_audit.py` | Vinh | ⬜ | 2.10 | **Gate G5** |
| 2.12 | Guardian-verdict UI panel with reasoning trace surfaced | `app/frontend/components/GuardianAudit.tsx` | Stephen | ✅ | - | Day 5 pull-forward to Day 1 EOD. Discriminated-union GuardianAudit handler approve/flag/reject + reasoning-trace `<details>` + empty-trace role=alert fallback. 6 vitest tests covering all verdicts + empty-trace edge. |
| 2.13 | Q&A Card 5 memorization (Latency) | mental | Both | ⬜ | - | Drill 3x |

### Phase 3 - Narrator (Day 6, Vinh)

| # | Component | File(s) | Owner | Status | Deps | Notes |
|---|-----------|---------|-------|--------|------|-------|
| 3.1 | Granite 4.1 8B Instruct narrator wired | `app/backend/apex/instruct/narrator.py` | Vinh | ⬜ | 2.10, 1.1 | Reads forecast envelope + COA + debrief, emits tuning delta |
| 3.2 | Tuning-recommendation card UI with COA-section provenance | `app/frontend/components/TuningCard.tsx` | Stephen | ✅ | 3.1 | Day 6 pull-forward to Day 1 EOD. Renders TuningDelta + parameter/current/recommended/unit + COA section Citation per shared/types.ts. Vitest suite asserts citation rendering invariant. |
| 3.3 | Sarah Reynolds persona fixture | `docs/sarah-reynolds-persona.md` (Stephen narrative) + `fixtures/{telemetry,coa,timing-sheets}/sarah-*` (Vinh data) | Both | 🟡 | 3.1 | Stephen narrative ✅ Day 1 EOD (pulled forward, Stephen-lane only, no fixtures/ touched per Vinh-lane respect). Vinh data files Day 6 with G6 integration. |
| 3.4 | End-to-end pipeline runs Sarah test case < 2 min on RTX 4060 | demo run logs | Both | ⬜ | 3.1, 2.10, 3.3 | **Gate G6** |
| 3.5 | Q&A hostile rehearsal pass 1 | mental | Both | ⬜ | - | Vinh asks Stephen, then swap |

### Phase 4 - Orchestration + polish (Days 7-8, both)

| # | Component | File(s) | Owner | Status | Deps | Notes |
|---|-----------|---------|-------|--------|------|-------|
| 4.1 | Langflow graph export of full pipeline | `app/backend/apex/langflow/graph.json` + screenshot | Vinh | ⬜ | 3.1 | Day 7 |
| 4.2 | **Convergence-14 serializer unit-test suite** | `app/backend/tests/test_serializer.py` | Vinh | ⬜ | 2.10 | Every kinematic violation type has a fixture + verified Guardian verdict |
| 4.3 | Langflow renders at 1920x1080 | screenshot | Vinh | ⬜ | 4.1 | **Gate G7** |
| 4.4 | Deck draft v0 (3-min pitch script + storyboard) | `docs/3-min-pitch-script.md`, `docs/deck/storyboard.md` | **Stephen** | 🟡 | - | Pitch script v0 ✅ Day 1 EOD (pulled forward, 8-beat structure, 2:58 target, 13 mandatory edits roadmap). Deck storyboard pending Day 7. |
| 4.5 | LinkedIn DMs to two UK adaptive-driver competitors (adaptive-racing-programme drivers) | DM log | Stephen | ⬜ | - | **MOVED to Day 3** per Codex critique #4 + self-critique S4. UK charity response window is 7-14 business days; Day 7 was too late as first escalation. Day 3 send leaves 8 days for reply + integration. |
| 4.6 | Day-7 follow-up emails to Phase 1+2 non-responders | DM log | Stephen | ⬜ | - | Day 7 |
| 4.7 | Cache COA + timing-sheet parses at onboarding | `app/backend/apex/intake/cache.py` | Vinh | ⬜ | 1.1, 1.2 | Day 8 |
| 4.8 | Demo loop fits 60s on RTX 4060 | latency log | Vinh | ⬜ | 4.7 | **Gate G8** |
| 4.9 | Deck draft v1 with all 13 mandatory edits from Phase 4.5 synthesis | `docs/deck/v1.md` | Stephen | ⬜ | 4.4 | Day 8 |
| 4.10 | June Challenge bridge architecture doc + slide | `docs/june-challenge-bridge.md`, deck slide | Stephen | ⬜ | - | PhysicsTTM extends to FIFA player-tracking |
| 4.11 | Q&A hostile rehearsal pass 2 | mental | Both | ⬜ | - | Day 8 |

### Phase 5 - Demo + deploy (Days 9-10, both)

| # | Component | File(s) | Owner | Status | Deps | Notes |
|---|-----------|---------|-------|--------|------|-------|
| 5.1 | HF Space deploy (free tier) + cold-start fallback | `app/backend/Dockerfile`, HF Space config | Vinh | ⬜ | 4.7, 4.1 | Day 9. **Rollback path:** if HF free tier rejects the model footprint, fall back to OpenRouter Granite endpoint (Discord intel 2026-05-20: openrouter.ai/ibm-granite/granite-4.1-8b free tier no CC) or watsonx.ai free account; both already on the architecture-spec contingency ladder. Last resort: Colab notebook (row 5.2) becomes the demo URL. |
| 5.2 | `deliverables/apex-demo.ipynb` Colab notebook | deliverables/ | Stephen | ✅ | 5.1 | Pull-forward Day 9 → Day 2 PM. Skeleton ships canned Sarah Reynolds mock CoachingReport so layout reviewable end-to-end. Day 9 swap: live HF Space call + file pickers (google.colab.files.upload). **Rollback path:** if HF Space cold-start fails Day 9 dress-rehearsal, the canned cells stay in place and the notebook ships as a static demonstration (does not block submission). |
| 5.3 | Sim-rig WebSocket bridge for iRacing/ACC live telemetry | `app/backend/apex/sim_bridge.py` + `app/frontend/components/SimRigStream.tsx` | Stephen + Vinh | 🟡 | 5.1 | Frontend slice + /sim-rig route ✅ Day 2 PM (Stephen, simulated mode, ring-buffer reducer + exponential reconnect). Vinh-side `app/backend/apex/sim_bridge.py` Day 9. **Rollback path:** if Vinh-side WebSocket slips Day 9, frontend stays in simulated mode for the demo video (the render path is identical between simulated and live modes per SimRigStream.tsx). |
| 5.4 | Demo video v0 (raw screen capture) + pitch script locked | `deliverables/demo-video-v0.mp4`, `docs/3-min-pitch-script.md` | Stephen | ⬜ | 4.9 | Day 9 |
| 5.5 | Dress rehearsal 1 (3-min pitch + 5-min hostile Q&A) | recorded | Both | ⬜ | 5.4 | Day 9 |
| 5.6 | v0 plays + HF loads < 90s + Colab executes + sim-rig streams | gates checklist | Both | ⬜ | 5.1-5.5 | **Gate G9** |
| 5.7 | Reproducibility metadata footer on every demo output | `app/frontend/components/ProvenanceFooter.tsx` | Vinh | ⬜ | 3.1 | Model versions + COA section IDs + Guardian audit ID + commit SHA |
| 5.8 | Vercel frontend deploy | `vercel.json` + `docs/vercel-deploy-runbook.md` | Stephen | 🟡 | 0.14 | Pull-forward Day 9 → Day 2 PM. `vercel.json` config + iad1 region + security headers ✅. `docs/vercel-deploy-runbook.md` first-time setup + Day 9 dress + Day 11 apex.race domain swap + rollback + env-var inventory ✅. **Rollback path:** `vercel rollback <deployment-url>` or dashboard Promote-to-Production on any prior green; metadataBase fallback in `app/layout.tsx` covers domain swap failure. Day 9 manual deploy: `vercel --prod` browser-OAuth from Stephen's machine. |
| 5.9 | Demo video v1 production take + voiceover + thumbnail | `deliverables/demo-video.mp4`, `deliverables/thumbnail.png` | Stephen | ⬜ | 5.5 | Day 10 |
| 5.10 | 30-second highlight clip | `deliverables/demo-video-30s.mp4` | Stephen | ⬜ | 5.9 | Day 10 |
| 5.11 | Dress rehearsal 2 with hostile Q&A using live sim-rig | recorded | Both | ⬜ | 5.9 | Day 10 |
| 5.12 | v1 video <= 3:00, audio clean, 1080p, sim-rig stable | gates checklist | Both | ⬜ | 5.9-5.11 | **Gate G10** |
| 5.13 | APEX Lite contingency decision (default: NO, ship full) | `docs/decision-log.md` D-Lite + `docs/apex-lite-contingency.md` | Both | ⬜ | 5.6 | Day 10 morning. **Coupling:** this row is the LATE trigger (Day-9 dress-rehearsal failure on 2+ Gate G9 items per Q-004). The EARLY trigger (Day-2 noon ET, Vinh-unresponsive scenario) is Q-007 with the same execution path. Both reference `docs/apex-lite-contingency.md` for the Lite scope (drop sim-rig + Colab live mode; keep core PhysicsTTM loop + Sarah Reynolds canned demo + frontend coaching UI + Guardian audit). |
| 5.14 | BeMyApp 1920x600 banner asset (editorial-paddock palette + APEX wordmark + tagline + hero visual) | `deliverables/bemyapp-banner-1920x600.png` + renderer at `app/frontend/lib/bemyapp-banner.tsx` (Next ImageResponse) + route handler at `app/frontend/app/bemyapp-banner/route.ts` + brand brief at `docs/banner-brand-brief.md` + render script at `app/frontend/scripts/render-banner.tsx` + shared brand-fonts util at `app/frontend/lib/brand-fonts.ts` | Stephen | ✅ | - | Shipped Day 2 night-late. Editorial-magazine-cover direction (typography-first, warm cream paper, Fraunces italic 260pt APEX wordmark, single confident racing-line SVG curve, masthead + footer racing-green strips with amber hairline accents). DELIBERATE contrast with the universal dark-cinematic banner aesthetic observed across competing projects in the BeMyApp gallery (calibration kept in private memory). Renderer fetches Fraunces + IBM Plex Sans + IBM Plex Mono from Google Fonts CDN at render time so no binary font files commit. **Acceptance criteria (wave-22 cold-review WARN #4 closure):** PNG exactly 1920x600 (verify via `file` command); file size 50-500KB; PNG magic-byte signature `89 50 4E 47 0D 0A 1A 0A` valid (render script enforces); zero em-dash + zero AI-tone blocklist hits in visible copy; Fraunces italic renders at 260pt without fallback. **Rollback path (wave-22 cold-review WARN #5 closure):** the committed PNG IS the canonical artifact uploaded at submission; the renderer + route + script are iteration-only. Day-9 re-render fails -> upload the previously committed PNG. Google Fonts CDN unavailable at render time -> pre-mortem row 47 documents this risk; the committed PNG is the fallback. If both the committed PNG AND the Google Fonts route fail, vendor Fraunces + IBM Plex font files locally to `app/frontend/lib/fonts/` and switch `brand-fonts.ts` to read from disk; ~500KB binary commit; restores submission. |
| 5.15 | Collect + log 3 May Challenge gallery example submissions (calibration pass) | `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/reference_competitors_calibration.md` | Stephen | ✅ | - | Stephen flagged 2026-05-21 PM that 3 projects are already posted in the May Challenge gallery; wave-21 captured all 3 in depth + wave-21 epilogue added the 4th (RaceMind AI). Calibration complete: (a) competitor framing generally F1-elite or able-bodied amateur with no one in our adaptive lane, (b) banner aesthetic universally dark-cinematic, (c) panel tightness varies (NeuroPit + PitWall ship 3-paragraph panels at NeuroPit-depth, AI Race Strategist + RaceMind ship 1 IBM tool), (d) APEX uncontested in the adaptive + veteran + grassroots lane. **Acceptance criteria (wave-22 cold-review WARN #6 closure):** reference memory captures 4 entries with URL + screenshot path + IBM-tool count + key strengths + key weaknesses we can exploit + 1-line takeaway for APEX positioning. APEX takeaways already informed wave-21 BeMyApp panel rewrite to NeuroPit-depth + wave-22 claim softening to honest framing. |

### Phase 6 - Submission package (Day 11, both)

| # | Component | File(s) | Owner | Status | Deps | Notes |
|---|-----------|---------|-------|--------|------|-------|
| 6.1 | Final deck PDF rendered via Playwright HTML to PDF | `docs/deck.pdf` | Stephen | ⬜ | 4.9 | Day 11 |
| 6.2 | `apex.race/judges` one-page judges-tour landing | `app/frontend/app/judges/page.tsx` | Stephen | ✅ | 5.8 | Pull-forward Day 11 → Day 1 EOD. TOC: /analyze + /sim-rig + 3-min video + 30s clip + deck + GitHub + methodology trace + architecture-spec + pre-mortem + 8-tool IBM stack grid + Q&A 5 cards + team. Wave-19 added /sim-rig resource tile. |
| 6.3 | `apex.race/status` live demo status dashboard | `app/frontend/app/status/page.tsx` | Stephen | ✅ | 5.1, 5.8 | Pull-forward Day 11 → Day 1 EOD. Hero + StatusLiveIndicator (GitHub Actions API polling, ApiError ErrorKind discriminator, 403/429 rate-limit branch, Retry button) + static signals + pending-indicator placeholders for Day 9 HF Space + Day 11 Vercel + Day 10 demo video. |
| 6.4 | `docs/methodology.md` (Sookra Methodology trace) | docs/ | Stephen | 🟡 | - | seven phases: P1 recon → P2 murder-board + judge-sim → P3 concept-lock → P4 deep-research → P5 PhysicsTTM mitigation → P6 build → P7 submission. Phase 6+7 expansion + Claude-Memory cross-references ✅ Day 2 PM. **Acceptance criterion:** Day 11 final lock requires (a) every phase has dated artifact list, (b) every gate G1-G11 has pass/fail trace, (c) cross-references to all Claude Memory session notes from waves 1-N+1, (d) AI-tone sweep clean. |
| 6.5 | `docs/pre-mortem.md` final polish | docs/ | Both | 🟡 | 1.7 | Live with 48+ entries (15+ ✅ mitigations, 3 accepted residual risks, row 45 📘 galaxy-tier compounding lesson). Day 11 final polish remains. **Wave-22 additions cross-referenced from this row (closes wave-22 cold-review WARN #7):** row 46 BeMyApp default-placeholder risk (✅ mitigated by row 5.14 banner ship), row 47 Google Fonts CDN render-time dependency (⚠ accepted for iteration; row 5.14 rollback path documents the vendor-local-fonts fallback), row 48 BeMyApp panel depth under-shipping (✅ mitigated by wave-21 NeuroPit-depth rewrite of `deliverables/bemyapp-submission-payload.md`). **Acceptance criterion:** Day 11 final lock requires (a) every entry has Type/Trigger/Mitigation/Status fields filled, (b) every ✅ entry cites a commit SHA or doc path proving the mitigation shipped, (c) every 🟡 entry has a Day-11 close-out plan or explicit residual-risk acceptance. |
| 6.6 | `docs/cost-audit-2026-05-30.md` (usage-audit skill run) | docs/ | Stephen | ⬜ | - | Session cost + token spend. **Acceptance criterion:** Day 11 evening run via `codeburn status` + `codeburn optimize` outputs committed verbatim; if any single project line exceeds $20/day, surface as a pre-mortem entry. |
| 6.7a | `paper/apex-neurips-workshop-2026.md` §1-§3 + §5-§13 DRAFT (readable quality) | paper/ | **Stephen** | 🟡 | 4.2, 5.7 | Publication-readable draft ✅ across waves 22-25 (consolidated closure logs in `docs/wave-22-cold-review-findings.md`, `docs/wave-23-cold-review-findings.md`, `docs/wave-24-cold-review-findings.md`, `docs/wave-25-cold-review-findings.md`). **Acceptance criterion:** Day 11 readable by an external researcher in one pass; passes (a) Abstract <=250 words, (b) §3 Method names all three layers' math equations with the Layer 2 two-stage projection-and-audit split correctly identified, (c) §5 Limitations honest about COA fixture synthesis + retraining-free claim scope, (d) §13 References has at least 10 cited works including the Granite-TTM NeurIPS 2024 paper (verified arXiv/proceedings sources per the Chrosniak et al. 2023 + Agrawal et al. 2019 + Ekambaram et al. 2024 citation convention; verified ibm-granite Hugging Face IDs). |
| 6.7b | `paper/apex-neurips-workshop-2026.md` §4 Experiments cell values | paper/ | Vinh | ⬜ | 2.9a, 2.9b, 2.9c, 2.11 | Day 9-10. Vinh fills Table 1 / Table 2 / Table 3a-c cell values once Stage 1 + Stage 2 + Convergence-14 benchmarks land. **Acceptance criterion:** Table 2 has at least one benchmark (TTM-zero-shot lap-time MAE vs seasonal-naive on at least one FastF1 holdout) with placeholder cells removed. |
| 6.8 | README.md final polish | repo root | Stephen | 🟡 | 5.8 | Pull-forward through Day 2 night-late closures (closure log split across waves 22-25 findings docs). Wave-25 closures shipped: Differentiator #2 two-stage rewrite + Mermaid sync to `docs/architecture-diagram.mmd` two-stage + first-claim §5.3-bounded softening + Track Titan/Trophi.ai softened to evidence-backed framing + commit count 197+ -> 201+ + ai-tone-policy forward-ref removed. Day 11 final polish remaining: real demo URL + Cloud Run links + final AI-tone re-sweep + final commit-count bump pre-submit. |
| 6.9 | AI-tone sweep (`scripts/ai-tone-sweep.sh`) | scripts/ | Stephen | ⬜ | 6.1, 6.8 | Zero em-dash + zero blocklist hits across README, deck, video transcript, emails |
| 6.10 | All §17 external-tool passes | logs | Both | ⬜ | - | pre-landing-review, claude-council, three-brain (Codex + Gemini), architecture-reviewer, repo-sentinel, NotebookLM gap pass 2 |
| 6.11 | Q&A final hostile pass (evening) | mental | Both | ⬜ | - | Cold + timed; each card < 30s |
| 6.12 | Every §Pre-submit Checklist (below) item green | gates checklist | Both | ⬜ | 6.1-6.11 | **Gate G11** |

### Phase 7 - Submit (Day 12, both)

| # | Component | File(s) | Owner | Status | Deps | Notes |
|---|-----------|---------|-------|--------|------|-------|
| 7.1 | Final smoke test (demo, video, Colab, fresh-clone, sim-rig) | gates checklist | Both | ⬜ | 6.12 | Morning |
| 7.2 | BeMyApp form submit + tick every eligible track checkbox | submission proof | Stephen | ⬜ | 7.1 | Afternoon |
| 7.3 | Devpost cross-post if applicable | submission proof | Stephen | ⬜ | 7.2 | Afternoon |
| 7.4 | IBM Consulting cold email referencing Scuderia Ferrari case study | sent log | Stephen | ⬜ | - | Afternoon |
| 7.5 | Post-submission Claude Memory write + engineering-retro | obsidian + docs | Stephen | ⬜ | 7.2 | Evening |
| 7.6 | Submitted by 21:00 ET (3-hour buffer to hard 11:59 PM ET deadline) | submission timestamp | Stephen | ⬜ | 7.2 | **HARD DEADLINE** |

---

## Coordination Protocol

1. **Before starting a task:** set status to 🟡 with timestamp in Notes, commit `PLAN.md` only, push. This is your lock.
2. **After finishing:** flip to ✅, commit `PLAN.md` only, push.
3. **If blocked:** set to ⛔, add a one-line note explaining why. Ping the other person.
4. **Before starting ANY task:** run `git pull` and check this file. If the other person has 🟡 on overlapping files, coordinate first.
5. **Hotfixes:** skip the protocol - commit the fix directly, update PLAN.md after. Don't let process block a real emergency.
6. **PLAN.md commits are atomic.** Never bundle a status update with code changes. One-line status change → commit → push.
7. **Commit messages:** Conventional Commits (mirrors Trace/Hometown).
   - `feat(backend): add ProfileService with FIPS lookup`
   - `feat(frontend): scaffold CoachingReport with corner-by-corner cards`
   - `fix(physics): tighten friction-ellipse bound for wet-track scenarios`
   - `chore(plan): claim 2.1 🟡 Vinh`
   - `docs(plan): complete 1.1 ✅`
   - `docs(plan): cut 4.10 ✂️ - June bridge slide on next session`
   - `⚠️ CONTRACT: change ttm-to-physics tensor shape - adds simultaneity bit` (announce in chat first)
8. **Handoffs:** when your part is done and the other person picks up, add `→ Vinh` or `→ Stephen` in the Notes column.
9. **Stale lock TTL = 4 hours (hackathon mode).** A 🟡 task requires a timestamp in Notes. If no commit happens within 4 hours, the lock is stale - the other person can claim it. Ping the original owner first.
10. **Contract changes require announcement.** Anything in the Shared Contracts table below must be announced in chat BEFORE committing. Use `⚠️ CONTRACT` prefix. Contract drift is the #1 cause of integration bugs.
11. **NO git hooks. NO CLI wrappers. NO commit-msg validators.** `.git/hooks/` must contain only `.sample` defaults. Verified Day 1 Stephen-side. Vinh verifies post-clone (`ls -la .git/hooks/` should show only `*.sample` files). If a tool wants to install Husky / lefthook / pre-commit, DECLINE.
12. **Push after every commit.** Push-immediately rule per global CLAUDE.md atomic-commit discipline.

---

## Shared Contracts

> Don't drift these without an announcement + commit prefix `⚠️ CONTRACT`.

| Contract | Owner | Consumer | Definition |
|----------|-------|----------|------------|
| Telemetry CSV input schema | Vinh | Vinh (intake), Stephen (mocks + upload UI) | Channels: `t` (sec), `throttle_pct`, `brake_pa`, `steering_rad`, `rpm`, `lat_g`, `long_g`, `speed_mps`, `gear`. Raw at 50 Hz. Aggregated to 1-Hz mini-sectors before TTM. |
| FIA COA parsed JSON shape | Vinh | Vinh (services), Stephen (UI) | `{driver: {name, impairment, license_class}, vehicle: {make, model, homologation}, adaptations: {throttle: {...}, brake: {...}, clutch: {...}, steering: {...}, gearshift: {...}, seat: {...}, headrest: {...}, driver_equipment: {...}, chassis: {...}}, coa_simul_permitted: bool, brake_travel_adjustable_mm?: [number, number], fia_section_refs: [...]}`. The COA simultaneity flag is hoisted to top-level (NOT inside a `simultaneity_envelope` sub-object) because it is the LOAD-BEARING flag of the entire project. Always cite FIA Article + paragraph IDs. Wave-22 BLOCKER B1: corrected from the legacy sub-object shape to match `app/shared/types.ts` `FIACoa` SSOT. |
| Timing-sheet parsed CSV shape | Vinh | Stephen | `lap, sector_1_time, sector_2_time, sector_3_time, lap_time, gap, position, tyre, in_pit`. |
| TTM input tensor shape | Vinh | Vinh | `(batch, context_length=24, num_channels=9)` at 1 Hz. 9th channel is COA simultaneity flag. Wave-22 BLOCKER B2: was previously 128 (stale blueprint carry); corrected to 24 to match arch-spec line 84 (one lap of 1-Hz mini-sector aggregates). |
| Physics-projection output | Vinh | Vinh (Guardian + Instruct) | `(corrected_tensor: same shape as input, qp_violation_log + feasibility_log: List[{step, stage: "qp" \| "feasibility", type, severity, msg}])`. Two-stage architecture per wave-24 cold-review B1+B2: Stage 1 convex QP emits `qp_violation_log` for friction/Euler/jerk bound hits; Stage 2 feasibility filter emits `feasibility_log` for bicycle-audit + COA-simultaneity violations. Concatenated for downstream Guardian audit; serializer (Convergence-14) treats both classes uniformly. |
| Guardian audit JSON | Vinh | Stephen (UI) | `{verdict: "approve" \| "flag" \| "reject", reasoning_trace: [...], blocked_recommendations: [...]}`. |
| Coaching-report JSON (API response) | Vinh | Stephen | `{corners: [{name, sector, current_delta_s, recommendation, citations: [{coa_section, fia_article}]}], tuning_delta: {parameter, current, recommended, unit, citation}, forecast: {next_session_envelope, confidence_band}, audit: <Guardian JSON>}`. |
| `POST /api/analyze` request | Stephen | Vinh | `{telemetry_csv: <file>, coa_pdf: <file>, debrief: <text>, driver_id: <str>}`. |
| `GET /api/sim-rig/stream` (WebSocket) | Vinh | Stephen | Live frames of telemetry channels at 10 Hz from iRacing/ACC. |
| Em-dash policy in prose | both | UI strings, deck, video transcript, emails | BANNED in prose. Substitutes per global CLAUDE.md table. Exempt: table column separators, code blocks. |
| FIA citation format | both | UI strings, deck | `FIA Appendix L, Article 18.3.2(c)` format. Never invent article numbers; verify via tool. |

---

## Scope tiering (Core 6 + Stretch 10, re-tiered Day 1 EOD)

Original "Galaxy-Tier Inclusions" 16-item list was re-tiered after Codex independent plan-critique flagged the D-003 / D-007 contradiction. Core 6 are ship-blockers at 95% quality. Stretch 10 ship at 70% if Core is green; cut without ceremony if Core slips.

**Core 6** (ship-blocker, 95% quality):

1. **C1** End-to-end Sarah Reynolds canned demo (Gate G6, Day 6, Both)
2. **C2** 3-minute submission video with mocked-or-live fallback path (Day 10, Stephen)
3. **C3** `docs/pre-mortem.md` running journal (Day 1 EOD ✅ started, Day 11 polish, Stephen)
4. **C4** `docs/methodology.md` Sookra trace (Day 11, Stephen)
5. **C5** Multi-track BeMyApp submission (Day 12 afternoon, Stephen)
6. **C6** All §17 external-tool passes (Day 11, Both)

**Stretch 10** (70% quality, cut without ceremony if Core slips):

S1 live sim-rig in video (Day 9-10), S2 real beta-tester quote (Day 3 DM escalation now, Day 8 anonymize fallback), S3 June Challenge bridge slide (Day 8), S4 Colab notebook (Day 9), S5 `/judges` landing page (Day 11), S6 `/status` dashboard (Day 11), S7 30s highlight clip (Day 10), S8 reproducibility metadata footer (Day 10), S9 cost-audit doc (Day 11), S10 NeurIPS Workshop paper draft (Day 11, Vinh).

**Always-ship trivials:** IBM Consulting cold email (Day 12, Stephen, <30 min), daily BeMyApp community devlog (every evening, Stephen, 90 sec).

Cuts are logged in `docs/decision-log.md` as dated entries. No silent removal.

---

## Decisions (locked)

> Reference by D-### in commits and code comments. Do not re-litigate without escalation. Full rationale: `docs/decision-log.md`.

- **D-001 (2026-05-20):** Project renamed PIT WALL → APEX. BeMyApp collision.
- **D-002 (2026-05-20):** Monorepo, public Day 1, Apache 2.0.
- **D-003 (2026-05-20):** Galaxy-tier scope. Nothing post-hackathon. Memory rule installed.
- **D-004 (2026-05-20):** Research-tool discipline. Context7 → tavily → firecrawl → EXA → WebFetch before any factual claim.
- **D-005 (2026-05-20):** State-sync protocol. Every session ends with Claude Memory write.
- **D-006 (2026-05-20):** No git hooks. Manual coordination only (mirrors Trace + Hometown). `.git/hooks/` stays defaults-only.
- **D-007 (2026-05-20):** Quality over speed. Tool-inventory audit BLOCKING before any non-trivial task. Use every available skill + agent + MCP + connector.
- **D-A (2026-05-19, carried in from PIT WALL):** PhysicsTTM three-layer architecture (frozen TTM → CvxpyLayer QP projection → Guardian BYOC text audit). Convergence 14 (serializer unit-test suite) is load-bearing.
- **D-B (refined Day 1 PM 2026-05-20):** Dual-layer pitch headline. Emotional Hero (h1 + 3-min video lead) = "The race engineer for the drivers who don't have one." Technical positioning (Differentiator #1) = "First integrated workflow for adaptive hand-controls." Q&A killshot reserved = COA-parameterized brake-throttle simultaneity. Full rationale: `docs/decision-log.md` D-B.

---

## Open Questions

> Decisions that need sign-off before work can proceed. Tag the person who needs to decide.

- [ ] **Q-001 - Vinh's git config email:** which email does Vinh's GitHub account use as primary or noreply? Needed so green-squares attribute correctly. **Owner: Vinh.** Resolves at Day 1 EOD when Vinh clones.
- [ ] **Q-002 - Stakeholder reply by Day 3 (revised from Day 7):** UK charity response window is 7-14 business days. Day 7 escalation was too late for first contingency. Revised: LinkedIn DMs to two UK adaptive-driver competitors shipped Day 3 morning regardless of Phase 1+2 reply state. Day 5 second-pass follow-up emails to non-responders. Day 8 anonymization decision if zero replies. **Owner: Stephen.**
- [ ] **Q-003 - Live sim-rig hardware:** which sim title runs on which laptop for Day 9 recording? Default: iRacing on Stephen's machine, fallback to ACC. **Owner: Stephen + Vinh, EOD Day 8.**
- [ ] **Q-004 - APEX Lite trigger:** invoke Lite (drop sim-rig + Colab, keep core PhysicsTTM loop) if Day 9 Gate G9 fails on 2+ items. Default: NO Lite, ship full. **Owner: both, Day 10 morning.**
- [ ] **Q-005 - June Challenge entry:** start parallel June build between Day 12 + June Challenge deadline? Default: NO, focus retro week. **Owner: Stephen, Day 12.**
- [x] **Q-006 - per-surface consent for adaptive-supplier naming - ✅ RESOLVED 2026-05-22 (MME Motorsport):** APEX positioning materials previously named the supplier without explicit per-surface consent. Codex critique wave 2 (Day 1 EOD) flagged as BLOCKER. **Resolution closed:** (a) Adaptive-hand-control supplier consent email sent 2026-05-20 PM (Day 1). (b) MME Motorsport (Marko Mlakar) replied 2026-05-22 03:17 AM ET with broad consent: "Feel free to use the MME Motorsport Hand Controls in your projects" covering all 4 surfaces (apex.race + README + BeMyApp Story + 3-min video). (c) Sarah persona materials now name MME directly; anonymized fallback retired for MME surface. (d) Other adaptive-racing programmes (Team BRIT, Mission 44, Operation Motorsport, FFSA Handikart) remain anonymized pending separate consents - they were NOT in the MME outreach scope. **Receipt logged at `docs/consent-log.md` §1.** Memory entry at `project_apex_consent_mme_motorsport.md`.

- [ ] **Q-007 - APEX Lite EARLY trigger (Vinh-unresponsive scenario):** Distinct from Q-004's LATE Day-10 trigger (Day 9 dress-rehearsal failure). **Canonical decision rule:** Lite EARLY fires if ANY of {no Vinh reply in 48h, G1 fail, G4 fail} holds. Invite-acceptance state is explicitly NOT a trigger condition pre-Tuesday 2026-05-27 EOD because BeMyApp Discord clarified the rate-limited rollout schedule (full history in `docs/wave-22-cold-review-findings.md`); re-enter the trigger set if Tuesday EOD passes with no Vinh response. **Action on trigger:** Stephen invokes APEX Lite per `docs/apex-lite-contingency.md` and logs the decision in `docs/decision-log.md` as `D-Lite-EARLY`. **Re-evaluation cadence:** every 12 hours through Day 4 EOD; Day 5 onward the trigger window collapses into Q-004 only.

---

## Pre-submit Checklist (Day 11 gate G11)

Run `scripts/pre-submit-checks.sh` (default mode = Day-2-through-10 regression). Day 11 strict: `--final`. All 21 items must pass. Fail = no submission tomorrow.

1. [ ] Em-dash sweep on README + PLAN.md + docs + deck + video transcript = zero hits in prose
2. [ ] AI-tone blocklist sweep ("delve into / leverage / seamless / robust / etc") = zero hits
3. [ ] En-dash + smart-quote sweep = ASCII only in prose
4. [ ] Operator-attribution sweep = no named operator without per-surface consent
5. [ ] Em-dash in commit messages = `git log --pretty=%s | grep "-"` empty
6. [ ] GitHub Actions CI green on `main` per-job (not just aggregate)
7. [ ] TypeScript clean: `tsc --noEmit` zero errors
8. [ ] Lint clean: `ruff check` + `eslint` zero errors
9. [ ] Tests pass: `pytest` + `vitest run`; backend coverage >= 70% on `apex/`
10. [ ] HF Space health: `curl -sI <hf-url>/health` returns 200
11. [ ] Demo video length: `ffprobe deliverables/demo-video.mp4` <= 3:00
12. [ ] Backup demo present: `deliverables/demo-video-backup.mp4`
13. [ ] 30-second highlight clip: `deliverables/demo-video-30s.mp4` exists
14. [ ] Deck PDF renders: `docs/deck.pdf` opens cleanly, every slide < 100 words
15. [ ] README has working demo URL: `curl -sI <vercel-url>` returns 200
16. [ ] LICENSE = Apache 2.0
17. [ ] All 8 IBM tools cited in README (Granite-Docling / Vision / TTM / Instruct / Guardian / Langflow / Docling / Bob) with role
18. [ ] Q&A flashcards memorized: both members deliver all 5 cards < 30s each from cold
19. [ ] Multi-track entries verified: every eligible track checkbox ticked on BeMyApp form
20. [ ] Stakeholder quotes attributed only with explicit per-surface consent (or omitted)
21. [ ] BeMyApp submission payload checkboxes ticked: `grep "^\[ \]" deliverables/bemyapp-submission-payload.md` returns nothing (WARN in default mode; HARD-FAIL in `--final` mode). Added wave-18 silent-failure-hunter H-3.

---

## Hard Compliance Rules (DQ-grade if violated)

> Memorize. Auditor catches at sweep level. Manual review for demo video + pitch text.

- ❌ **No em-dash (-) in prose.** Per global CLAUDE.md. Single most reliable AI-tone tell. Pre-submit sweep on Day 11.
- ❌ **No AI-tone blocklist words** in prose: "delve into / leverage / seamless / robust / comprehensive / unlock / cutting-edge / revolutionary / streamline / ecosystem / easily / simply."
- ❌ **No invented FIA Article numbers.** Verify via FIA.com or research/ PDFs before citing. Per D-004 research-tool discipline.
- ❌ **No named operators without per-surface consent.** an adaptive-driver competitor, an adaptive-driver competitor, anyone who replies to outreach: get explicit consent per surface (deck vs README vs video).
- ❌ **No NIL violations.** Do not use real driver names in demo without consent (Sarah Reynolds is fictional, that's the point).
- ❌ **No git hooks.** Per D-006. Verify `.git/hooks/` is defaults-only.
- ✅ **Conditional phrasing on physics claims.** "Forecast envelope" not "guaranteed pace." "Recommended tuning delta" not "optimal setup."
- ✅ **Every coaching claim cites COA section + FIA Article.** Provenance footer.
- ✅ **Granite + watsonx + Bob attribution per Ferrari case-study precedent.**

---

## Setup (anyone cloning)

```bash
# 1. Clone
git clone https://github.com/StephenSook/apex.git
cd apex

# 2. Verify no active git hooks (D-006)
ls -la .git/hooks/  # should be only .sample files

# 3. Set git identity to your GitHub-attributed email
git config user.email <your-github-email>
git config user.name <your-github-name>

# 4. Backend setup (Day 1 onward)
cd app/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt   # requirements.txt lands Phase 1

# 5. Frontend setup (after task 0.14)
cd ../frontend
npm install

# 6. Local dev
# Terminal 1: backend
cd app/backend && uvicorn apex.main:app --reload --port 8000
# Terminal 2: frontend
cd app/frontend && npm run dev    # serves on :3000
```

### Updating PLAN.md (manual coordination, no CLI, no hooks)

Mirrors Trace + Hometown convention. Edit by hand, commit only `PLAN.md`, push.

```bash
# Claim a task: change ⬜ to 🟡 in the row, add timestamp + your name in Notes
git add PLAN.md
git commit -m "chore(plan): claim 1.1 🟡 Vinh"
git push

# Complete a task: change 🟡 to ✅
git add PLAN.md
git commit -m "chore(plan): complete 1.1 ✅"
git push

# Block a task: change to ⛔, add reason in Notes
git add PLAN.md
git commit -m "chore(plan): block 1.1 ⛔ - TTM library throws on M-series"

# Cut a galaxy-tier item: change to ✂️, add reason. Per D-003 galaxy rule, cutting requires escalation - galaxy rule says "nothing deferred."
git add PLAN.md
git commit -m "chore(plan): cut 5.3 ✂️ - sim-rig hardware unavailable; APEX Lite contingency invoked per Q-004"
```

---

## Phase Build Order Notes

**Phase 0 is the unblocker.** Vinh cannot start parallel work until D0.12 (accept invite + clone) and D0.13 (Gate G1 TTM smoke) pass. Stephen owns 0.14 Next.js scaffold while Vinh boots.

**Phase 1 is the critical path for Phase 2.** TTM has nothing to forecast over until intake + vision parse the fixtures. Vinh owns Days 1-2 end-to-end on Phase 1.

**Phase 2 + Phase 3 converge Day 6.** Sarah Reynolds canned end-to-end test = first integration moment. If G6 slips, Day 10 Lite contingency triggers.

**Phase 4 starts in parallel** with Phase 2-3 polish. Stephen builds deck v0 + outreach while Vinh closes physics.

**Phase 5 is the highest-risk Phase** because three new surfaces (HF deploy + Colab + sim-rig) all land Day 9. Build buffer Day 10 morning.

**Phase 6 is the heaviest commit day.** Target 12-18 atomic commits Day 11 across methodology + judges page + status page + cost audit + NeurIPS draft + README polish + AI-tone sweep + all §17 external-tool passes.

**Phase 7 = submission only.** No new features Day 12.

---

## Reference: full design blueprint

The original `~/.claude/plans/all-right-i-want-rippling-moon.md` (also mirrored at `docs/build-plan-blueprint.md` Day 2) contains the design-blueprint depth: PhysicsTTM math, Sookra Methodology trace, full §16 enhancements list, §17 external-tool layer detail, §18 galaxy-tier inclusions list. PLAN.md is the coordination surface; the blueprint is the design surface.

---

_Last updated: 2026-05-22 night by Stephen after 27 review waves (waves 1-18 Day 1 + waves 19-27 Day 2-3). **220+ atomic commits pushed across Day 1 + Day 2.** Phase 0 ✅ except 0.11-0.13 (Vinh-side; Tuesday 2026-05-27 ETA per Discord rate-limited rollout schedule). Full closure log across `docs/wave-22-cold-review-findings.md`, `docs/wave-23-cold-review-findings.md`, `docs/wave-24-cold-review-findings.md`, `docs/wave-25-cold-review-findings.md`. Wave-25 closures landed the two-stage projection-and-audit propagation across paper title + README Differentiator #2 + arch-spec system-overview ASCII + Layer 6 narrator + a_lat SI-unit + decision-log D-A + outreach drafts + June bridge + APEX-Lite + methodology Phase 5 + Sarah persona vocabulary + Q&A Cards 1/2/5 reasoning gaps + PLAN ID-scheme unification + row 6.7 split + row 2.9c test-suite row + commit-count 197+ -> 201+ sweep. Wave-26 landed the galaxy-tier Convergence-14 fixture grid + Figure 1 architecture embed on `/judges`, BeMyApp submission-payload two-stage + Convergence-14 sweep, BeMyApp Day 2 devlog + 30-second highlight-clip storyboard + cost-audit shell pull-forward, and a ConvergenceFixture discriminated-union refactor (compile-time class-stage + COA-payload + serializer-integrity-verdict invariants) closing all three-brain self-review findings on the wave-26 batch (one BLOCKER + two HIGH + three MED + one NIT). Wave-27 closed 4-agent re-review on the wave-26 batch: 6 Codex physics-math BLOCKERs (C14-04 sign + C14-05 bicycle threshold off by 14x + C14-06 predicted lat_g off by 10x + arch-spec jerk_max 30 m/s^3 vs C14-04 0.8 g/s reconciled at 8 m/s^3) + silent-failure HIGHs (Figure 1 CLS picture-fallback + onError + download attribute + ResourceTile fragment-link) + type-design closure_kind discriminator (round_trip vs end_to_end split on serializer_integrity variant) + IBM Bob Ferrari attribution softening + BeMyApp IBM-Consulting overclaim softening + commit-count drift sweep. Single mega-commit `1e0c182` due to Anthropic safety-classifier capacity outage (pool saturated after 4 parallel agents + Gemini 529 Overloaded) preventing atomic-commit cadence; logical breakdown preserved in `docs/wave-27-cold-review-findings.md`. Day 2 + Day 4 + Day 5 + Day 6 + Day 7 + Day 8 + Day 9 + Day 10 + Day 11 task drafts pulled forward per galaxy-tier rule (Core 6 + Stretch S1 + S4 + S5 + S6 + S10 all at draft quality). Pre-consent operator-attribution anonymized across 14+ public files. plan-gap-scanner BLOCKERs closed across waves 19-22-25. APEX Lite EARLY Q-007 trigger softened per Discord rate-limited rollout schedule; re-evaluation Tuesday 2026-05-27 EOD if Vinh still dark._
