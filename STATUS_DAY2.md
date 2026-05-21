# Day 2 Status Update - [filled-by-author at EOD]

**Date:** 2026-05-21 (Day 2 of 12)
**For:** [Stephen | Vinh]
**From:** [Vinh | Stephen]

> Per `STATUS_TEMPLATE.md`. **This file is pre-seeded Day 1 EOD with the known Day 2 queue + Day 1 EOD anchor state.** Both teammates fill in real-time as work lands. Final EOD pass replaces the [BRACKETED] placeholders with the actual outcomes.

---

## Day 1 EOD anchor state (frozen, do not edit)

- **Repo HEAD at Day 1 EOD:** `d7a1019` (pre-mortem wave 7/8/9 entries)
- **Cumulative atomic commits Day 1:** 92+ pushed to `main`
- **Tree state:** clean
- **Build state:** `pnpm tsc --noEmit` clean, `pnpm build` clean (1.4s Turbopack compile, 1.3s tsc), `pnpm lint` 🟡 ESLint env broken (`LazyLoadingRuleMap is not a constructor`); pre-submit-checks.sh soft-fails this check until Day 2 fix.
- **Gates already passed:** none (Vinh-side G1 + G4 not yet run; Stephen-side a11y baseline passed via Playwright 1440x900 snapshot on `/` + `/analyze`).
- **Most recent review wave:** Codex wave-8 (Day 1 EOD): 3 BLOCKERs + 7 HIGHs + 3 MEDs. All BLOCKERs + 6 HIGHs resolved this session. ESLint env break tracked as 🟡 in `docs/pre-mortem.md` row 26.

---

## Day 2 task queue (pre-seeded; check off as work lands)

### Vinh (critical path)

- [ ] **Accept GitHub collaborator invite** (sent 2026-05-20 PM). Verify `gh api user --jq .login` matches the address that owns this email's GitHub.
- [ ] **Set `git config user.email`** to the GitHub-attributed address so green-squares attribute to Vinh's profile. Q-001.
- [ ] **Verify `.git/hooks/` is defaults-only** (per D-006). Should be 14 `.sample` files, no active hooks.
- [ ] **Run Gate G1 smoke test:** `pip install granite-tsfm`, load TTM r2.1, run zero-shot 1Hz inference on FastF1 telemetry slice. Commit `logs/day-02-ttm-smoke.md` documenting load time + inference latency + output shape on Vinh's box.
- [ ] **Run Gate G4 spike (parallel to G1):** TTM zero-shot vs seasonal-naive on 5 FastF1 holdout circuits. Commit `logs/day-02-ttm-vs-naive.md` with RMSE per holdout. If TTM loses on 3+ of 5: invoke `docs/apex-lite-contingency.md` Lite mode.
- [ ] **If G1 + G4 both pass:** Start Phase 1 task 1.1 = Granite-Docling parse of FIA COA fixture PDF into structured JSON.
- [ ] **Pydantic mirror of `app/shared/types.ts`** in `app/backend/apex/schemas.py`. Specifically: `TelemetryRow`, `TelemetryChannels`, `MiniSectorTensor`, `FIACoa`, `CoachingReport`, `AnalyzeRequestPayload` (multipart), `HealthResponse`. Sign conventions and field names MUST match the TypeScript exactly. Any breaking change = `⚠️ CONTRACT` commit-prefix per PLAN.md §Coordination Protocol rule 10.
- [ ] **Validate OpenRouter API key + sample Granite 4.1 8B call.** Discord intel 2026-05-20: V.L. + BeMyApp confirmed OpenRouter as approved Granite host. Free tier, no credit card. `openrouter.ai/ibm-granite/granite-4.1-8b`. Use as primary inference path on HF Space Day 9 deploy. Backup: watsonx.ai (free account, IBM ID required). Skip Replicate (CC required) + HF inference endpoints (Granite not publicly hosted).
- [ ] **Fork IBM-SkillsBuild Learning Lab repo + run TORCS lab + record one entry in RESULTS.md.** Discord intel 2026-05-20: BeMyApp pinned the Lab as public at `https://github.com/IBM-SkillsBuild-AI-Builders-Challenge/hands-on-labs` and mentioned "one of the required lab steps." Conservative read: complete one step minimum. Time-boxed 30 min. Do not let the lab consume G1 + G4 budget.

### Stephen (parallel to Vinh) - Day 2 mid-day progress

- [x] **Repair ESLint env** (`LazyLoadingRuleMap is not a constructor`). DONE wave 13 (`d096566`): nuked `node_modules` + `pnpm-lock.yaml` + fresh `pnpm install`. ESLint 9.39.4 runs cleanly + caught 2 real lint findings (Link instead of `<a>` for internal nav + unused SLOT_KEYS const). Pre-mortem row 26 🟡 → ✅.
- [ ] **Q&A Card 2 (Kinetic Hallucination) drill 3x cold.** Pending Stephen evening session.
- [ ] **Check stakeholder inbox for Phase 1+2 replies.** Pending Stephen.
- [x] **Audit README.md against the BeMyApp pinned 3-question structure.** DONE wave 13 (`f4f9611`): added explicit submission-answers TOC at top with anchor links + renamed sections to match makenna's pinned rubric (`#the-problem` + `#the-ai-approach` + `#why-it-matters-in-racing`).
- [x] **Wire Dropzone into landing page top nav.** DONE wave 13 (`8cb58d9`): clay-accent Analyze button in SiteHeader primary nav.
- [x] **CoachingReport + TuningCard + GuardianAudit + AnalyzeFlow** (PLAN 2.7 / 3.2 / 2.12 pulled forward Day 4-6 → Day 2). DONE wave 13 (`91a5141` + `c268363`): full /analyze flow renders a canned Sarah Reynolds Donington-Lap-17 mock report on submit. Vinh's real backend Day 5-6 just swaps `buildMockReport()` for a `fetch()` call.
- [x] **architecture-spec.md Docling library 8-tool count** (Gemini wave-11 M1). DONE wave 13 (`efa7881`): added 1a-bis subsection.
- [ ] **Watch the BeMyApp hosting webinar + submission walkthrough video** (links in `reference_discord_intel_day_1.md` memory). Pending Stephen.
- [x] **Pre-mortem.md daily entry** for Day 2 observations. DONE wave 13 (rows 38-42).
- [ ] **Run `bash scripts/pre-submit-checks.sh`** at noon ET and EOD. Wave-13 latest dry-run: 14 PASS, 9 WARN (Vinh-lane + Day 9/10/11 pending), 3 MANUAL, 0 HARD-FAIL.
- [ ] **Daily BeMyApp devlog** evening send. Pending Stephen.

### Joint

- [ ] **Noon ET Lite trigger check.** If Vinh has not accepted the invite by 2026-05-21 12:00 ET, evaluate `docs/apex-lite-contingency.md` per Codex critique #3. Default expectation: invite accepted; Lite not invoked.
- [ ] **Team registration on BeMyApp portal.** Discord intel 2026-05-20: another participant asked "How do we link the team and members there was no option to register teams." No public answer surfaced. Check the BeMyApp portal Day 2 to see if there is an explicit team-registration field. If yes: register Vinh. If no: GitHub collaborator status is the team-evidence.

---

## Gate status (filled as Day 2 lands)

| Gate | Day 1 EOD | Day 2 result | Notes |
|------|-----------|--------------|-------|
| G1 (Day 1 TTM smoke) | ⬜ pending Vinh | [TBD] | `pip install granite-tsfm` + 1Hz inference < 60s on M2 / RTX 4060 |
| G2 (Day 2 COA parse) | ⬜ pending Vinh | [TBD] | Granite-Docling all 9 adaptation domains |
| **G4 (Day 2 SPIKE - TTM beats seasonal-naive)** | ⬜ pending Vinh | [TBD] | If FAIL: invoke `docs/apex-lite-contingency.md` Lite mode + pivot pitch claim. |

---

## Open inputs blocking Day 3 critical path

- [ ] **Vinh accept GitHub collaborator invite** (carries over from Day 1)
- [ ] **Vinh `git config user.email`** verified (Q-001)
- [ ] **G1 + G4 verdicts** (drive Day 3 path: continue with PhysicsTTM vs invoke Lite)
- [ ] **Stakeholder inbox** any-reply / no-reply state determines Day 3 anonymization-revert vs hold

---

## What got done today (fill at EOD)

### Task X.X - [fill in]

[2-3 sentences]

### Code-review fixes applied ([N] total)

| Fix | What changed |
|-----|--------------|

### Atomic commits pushed Day 2 (fill at EOD, newest first)

| SHA | Subject |
|-----|---------|

---

## Tools / skills / MCPs used today (D-007)

[Fill at EOD with the highest-impact layers actually pulled.]

---

## Decision-log additions Day 2

[Mirror any new D-XXX entries to `docs/decision-log.md` and reference here.]

---

_Last updated: 2026-05-20 EOD Day 1 by Stephen as the Day-2 template seed. Final EOD pass by [Stephen | Vinh] 2026-05-21 evening replaces the [BRACKETED] placeholders with real outcomes._
