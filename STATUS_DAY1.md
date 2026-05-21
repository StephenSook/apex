# Day 1 Status Update - Stephen

**Date:** 2026-05-20 (Day 1 of 12)
**For:** Vinh Le
**From:** Stephen Sookra

> Per `STATUS_TEMPLATE.md`. Mirror of Trace + Hometown daily-handoff pattern. Drop me into a fresh session tomorrow and you can start cold without a verbal sync.

---

## What got done today

Day 1 bootstrap day. 50+ atomic commits pushed to https://github.com/StephenSook/apex.

### Task 0.1-0.5 - repo setup + folder reorg

Repo init (Apache 2.0), 12 PDFs reorganized into `research/` (kebab-case), `docs/briefing-for-vinh.pdf` available for you. `.gitignore` extended for Python + Node + IBM caches. `LICENSE` + `README.md` v0 + `PLAN.md` v0 shipped.

### Task 0.14 - Next.js 16 frontend scaffold + landing page

`app/frontend/` is Next.js 16.2.6 + React 19.2.4 + Tailwind v4 + TypeScript strict. Editorial-paddock visual identity (cream paper #F4EBD8, racing-green #0A2818, accent clay #C1492C, amber #D9A441, ink #0F1410). IBM Plex Sans + Plex Mono + Fraunces (variable, SOFT/WONK/opsz axes) via `next/font/google`. WCAG 2.1 AA baseline (skip link, focus-visible ring, semantic landmarks, prefers-reduced-motion). 670-line landing page committed in `app/frontend/app/page.tsx` with hero (hand-coded SVG racing line + apex annotation) + Sarah Reynolds editorial moment + PhysicsTTM 3-layer cards + 5 differentiators + build-status table + 8-tool IBM stack + footer. Build green via `pnpm build` (1.7s Turbopack), lint green, Playwright visual QA passed (screenshot at `deliverables/screenshots/day-01-landing-1440x900.png`).

### Code-review fixes applied (8 commits)

Ran pr-review-toolkit:code-reviewer + Codex agent reviews. Shipped these atomic fixes:

| Severity | Fix | File(s) |
|---|---|---|
| B1 BLOCKER | Removed 2 em-dashes in decision-log prose | `docs/decision-log.md` |
| B2 BLOCKER | Refined D-B to dual-layer pitch (emotional Hero + technical Differentiator) | `docs/decision-log.md`, `CLAUDE.md`, memory |
| H1 HIGH | "Next.js 15" → "Next.js 16" in 3 places to match `package.json` | `README.md`, `PLAN.md` |
| H2 HIGH | SUBMISSION pitch char count claim corrected | `SUBMISSION.md` |
| H3 HIGH | `target="_blank" rel="noopener noreferrer"` on 7 external GitHub `<Link>` | `app/frontend/app/page.tsx` |
| H4 HIGH | "Granite Instruct" canonicalized to "Granite 4.1 8B Instruct" in 4 surfaces | `README.md`, `PLAN.md`, `docs/architecture-spec.md`, `SUBMISSION.md` |
| M1 MED | "6 phases" vs "seven phases" Sookra methodology terminology locked at seven | `PLAN.md` |
| M3 MED | README Mermaid OB node aligned with "Eight IBM tools" prose claim | `README.md` |

### Polish wave

Anchor `<Link href="#X">` → `<a href="#X">` (M2), CSS-var pattern `as React.CSSProperties` cast (M4), `aria-label="Primary navigation"` + `"Footer navigation"` improvements, README placeholder marker for `docs/ai-tone-policy.md` (M5), Mermaid PNG (`docs/architecture.png`) and SVG (`docs/architecture.svg`) rendered + inlined in README above the mermaid block as graceful fallback for BeMyApp preview.

### Day-2 and Day-7 tasks pulled forward to Day 1 EOD

- `docs/pre-mortem.md` started (PLAN task 1.7, was Day 2)
- `docs/sarah-reynolds-persona.md` written (PLAN task 3.3, was Day 6 - Stephen narrative only; engineering data files reserved for your lane)
- `docs/3-min-pitch-script.md` v0 (PLAN task 4.4, was Day 7)
- `docs/outreach-drafts/mme-motorsport-consent.md` (per Q-006, sent Day 1 PM)
- `docs/apex-lite-contingency.md` (Codex critique #3 - written contingency if you cannot accept the invite by Day 2 noon ET; **DO NOT EXECUTE unless trigger fires**)
- `docs/methodology.md` v0 (PLAN task 6.4 / Core 6 C4)
- `docs/stakeholder-outreach-log.md` (referenced in `project_apex_stephen_lane.md`)
- `app/shared/types.ts` (shared API contracts in TypeScript; mirror in your Pydantic `app/backend/apex/schemas.py` Day 2-3)

### Atomic commits pushed (most recent first)

| SHA | Subject |
|---|---|
| (this commit) | docs: STATUS_DAY1.md daily handoff |
| `ceadbd8` | docs: APEX Lite contingency plan |
| `08d0821` | fix(pitch): Beat 6 add mocked-UI fallback path (Codex #14) |
| `0d80465` | plan: re-tier Galaxy-Tier into Core 6 + Stretch 10 (Codex #1) |
| `70b687a` | plan: move LinkedIn DM escalation Day 7 → Day 3 (Codex #4) |
| `0c1d99e` | fix(frontend): metadataBase apex-race.vercel.app fallback (Codex #11) |
| `a796d1a` | fix(pitch): Beat 3 achievement-led + paddock voice (S7+S8) |
| `86bd20b` | chore(plan): Day 1 EOD status update |
| `55bc41a` | docs: 3-min pitch script v0 |
| `3f1ee24` | docs(outreach): MME Motorsport consent email draft |
| `cd80680` | docs: Sarah Reynolds persona narrative |
| `4e83f0e` | docs: start pre-mortem.md |
| `78c5b03` | docs(readme): mark forward-looking docs explicitly |
| `bc5a570` | fix(frontend): polish wave (M2 + M4 + aria-label) |

---

## Vinh-lane wire check (Day 6 integration prep)

API contract is in `app/shared/types.ts`. Pydantic mirror needed in `app/backend/apex/schemas.py` Day 2-3. Specifically:

- `TelemetryRow` - 9 fields, raw 50 Hz
- `MiniSectorTensor` - 1-Hz aggregated, includes COA simultaneity bit
- `FIACoa` - 9 adaptation domains + simultaneity envelope
- `CoachingReport` - top-level API response (corners + tuning_delta + forecast + audit + provenance)
- `AnalyzeRequest` / `AnalyzeResponse` - `POST /api/analyze`
- `SimRigFrame` - `GET /api/sim-rig/stream` WebSocket (Stretch S1)
- `HealthResponse` - `/health`

Any contract change announces in chat with `⚠️ CONTRACT` commit prefix per `PLAN.md` §Coordination Protocol rule 10.

---

## Tools / skills / MCPs used today (per D-007)

- `frontend-design` skill (editorial-paddock direction)
- `Context7` MCP (Next.js v16 + tailwind verification; tailwind 502'd, fallback to `node_modules/next/dist/docs/`)
- `Playwright` MCP (browser_navigate + full-page screenshot 1440x900)
- `pr-review-toolkit:code-reviewer` agent (returned 8 ranked findings)
- `codex:codex-rescue` agent (×2 - code review + plan critique)
- `pnpm` + `create-next-app@latest` + `npx @mermaid-js/mermaid-cli` (Mermaid PNG + SVG)
- `Read` (with `offset` + `limit`) per Read-before-Edit invariant
- Manual `grep -rn` for em-dash + AI-blocklist + smart-quote sweep

---

## Gate status

| Gate | State | Note |
|---|---|---|
| G1 (Day 1 TTM smoke) | ⬜ pending Vinh | `pip install granite-tsfm` + 1Hz inference < 60s on M2 / RTX 4060 |
| G2 (Day 2 COA parse) | ⬜ pending Vinh | Granite-Docling all 9 adaptation domains |
| G3 (Day 3 NumPy validator V1) | ⬜ pending Vinh | 5/5 impossible traces caught, 5/5 valid approved |
| **G4 (Day 2 SPIKE - TTM beats seasonal-naive)** | ⬜ pending Vinh | **Bumped from Day 4 to Day 2 parallel spike per Codex critique #2 BLOCKER.** If FAIL: invoke `docs/apex-lite-contingency.md` Lite mode + pivot pitch claim. |
| G5 (Day 5 Guardian BYOC + serializer tests) | ⬜ pending Vinh | Convergence 14 unit-test suite |
| G6 (Day 6 end-to-end Sarah canned demo) | ⬜ pending Both | Core 6 C1, ship-blocker |

---

## Open inputs blocking Day 2 critical path

1. **Vinh accept GitHub collaborator invite.** Sent Day 1 PM. Stephen texted you. Affects task 0.12.
2. **Vinh set `git config user.email` to your GitHub-attributed email** so green squares attribute correctly. Q-001.
3. **Vinh run Gate G1 + Gate G4 IN PARALLEL Day 2 morning** per `PLAN.md` task 2.6 note. If G4 fails, invoke `docs/apex-lite-contingency.md`.
4. **Verify `.git/hooks/` is defaults-only** (per D-006). Should be 14 `.sample` files, no active hooks.

---

## What's left for Day 2 (Vinh + Stephen)

### Vinh (critical path)

1. Accept invite + clone + git config
2. Read `docs/briefing-for-vinh.pdf` (legacy PIT WALL branding kept as artifact)
3. **Run Gate G1 smoke test** - commit `logs/day-02-ttm-smoke.md`
4. **Run Gate G4 spike (parallel)** - commit `logs/day-02-ttm-vs-naive.md` with RMSE per holdout circuit
5. If G1 + G4 pass: start Phase 1 task 1.1 Granite-Docling COA parse
6. If G4 fails: read `docs/apex-lite-contingency.md` + ping Stephen for joint Lite decision

### Stephen (parallel to Vinh)

1. PLAN task 1.6 file-upload dropzone UI (`app/frontend/components/Dropzone.tsx`) - WCAG keyboard + screen-reader baseline
2. PLAN task 1.7 - pre-mortem.md daily entry (Day 2 observations)
3. PLAN task 1.8 - Q&A Card 2 (Kinetic Hallucination) memorization drill 3x
4. Check stakeholder inbox: Phase 1+2 replies (5 emails sent Day 0)
5. Check Codex review status if not yet integrated
6. Day 3 advance prep: LinkedIn DM drafts for Aaron Morgan + Bobby Trundley (Team BRIT drivers) per Q-002 revised escalation

---

## Demo-readiness checkpoint

Once Gate G6 ships (Day 6 EOD), the next demo-able milestone is: end-to-end Sarah Reynolds canned case producing a corner-by-corner coaching report + tuning recommendation + forecast envelope chart + Guardian safety stamp in < 2 minutes on RTX 4060.

```bash
# Verbatim commands to reproduce the demo state on a fresh clone (Day 6+):
git clone https://github.com/StephenSook/apex && cd apex
cd app/backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
python -m apex.cli analyze \
  --telemetry ../../fixtures/telemetry/sarah-lap-17.csv \
  --coa ../../fixtures/coa/sarah-coa.json \
  --debrief ../../fixtures/personas/sarah-debrief.txt
```

(Backend `apex/cli.py` + `apex/main.py` + `requirements.txt` are Vinh's lane to author Day 2-5. The CLI signature above is the contract.)

---

## Decision-log additions Day 1

- D-006: NO git hooks
- D-007: Quality over speed + tool-inventory audit BLOCKING
- D-B (refined): Dual-layer pitch headline
- Q-006: MME Motorsport per-surface consent
- Q-007 (implicit): apex.race domain registration deferred; metadataBase fallback to apex-race.vercel.app
- Scope re-tiering: Core 6 + Stretch 10 (replaces strict "everything ships" reading of D-003)

Full rationale: `docs/decision-log.md`.

---

_Last updated: 2026-05-20 Day 1 EOD by Stephen. 50+ commits. Tree clean. Remote synced. Ready for Day 2 Vinh-side ramp._
