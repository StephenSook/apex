# Contributing to APEX

APEX is an open-source AI race engineer for adaptive racers, veteran-team drivers, and grassroots competitors. We ship under Apache 2.0. Pull requests, issues, and discussion are welcome.

This file documents the project's contribution conventions. The conventions are non-optional for merged contributions. They are documented because the project ships to IBM SkillsBuild judges + a defender-side audience (adaptive-driver community + veteran motorsport rehabilitation programmes), and the same disciplines that protect the codebase also protect the audience.

---

## Table of contents

1. [Quick start](#quick-start)
2. [Branching + commits](#branching--commits)
3. [Pre-submit gates](#pre-submit-gates)
4. [Code style](#code-style)
5. [Tests](#tests)
6. [Review discipline](#review-discipline)
7. [Documentation](#documentation)
8. [Privacy + operator attribution](#privacy--operator-attribution)
9. [What NOT to do](#what-not-to-do)

---

## Quick start

```bash
git clone https://github.com/StephenSook/apex.git
cd apex/app/frontend
pnpm install
pnpm tsc --noEmit && pnpm lint && pnpm test && pnpm build
pnpm dev   # http://localhost:3000
```

Backend (Python + FastAPI + the Granite stack) is complete; see `app/backend/README.md`. Its 192 tests run a GPU-free subset in CI on every push (`.github/workflows/ci.yml`); the torch/cvxpy tests `importorskip`.

## Branching + commits

- **Trunk-based.** Push to `main`. Branch protection is OFF for hackathon velocity; atomic commits + the pre-submit checklist are the quality gate.
- **Conventional Commits.** Subjects MUST follow `<type>(<scope>): <short-imperative>`. Types: `feat`, `fix`, `docs`, `chore`, `test`, `refactor`, `perf`, `ci`. Subject is ≤ 100 characters total.
- **One logical change per commit.** A new utility, a single bug fix, a doc update; never bundle. Atomic commits are the project's review surface.
- **Push immediately.** No batching. The commit history is the work log judges read.
- **No git hooks.** Per D-006 in `docs/decision-log.md`, `.git/hooks/` stays defaults-only. No Husky, no lefthook, no pre-commit. Manual coordination via `PLAN.md` instead.
- **⚠️ CONTRACT prefix** for any change to `app/shared/types.ts` or the backend `apex/schemas.py` Pydantic mirror. Both members re-sync before the next commit.

Example clean commit subjects:

```
feat(frontend): Dropzone component + /analyze route
fix(privacy): redact personal email from IBM Consulting cold-email draft
docs(plan): add 5 Day-2 tasks from Discord intel
⚠️ CONTRACT feat(shared): add driver_id to CoachingReport contract
```

## Pre-submit gates

Before submitting any PR or pushing to `main` near a deadline:

```bash
bash scripts/pre-submit-checks.sh           # default Day-2-through-10 regression mode
bash scripts/pre-submit-checks.sh --final   # Day-11 strict mode (HF Space, video, coverage all required)
```

The script runs 21 checks: em-dash sweep, AI-tone blocklist sweep, en-dash + smart-quote sweep, operator-attribution sweep, commit-subject em-dash sweep, CI per-job green, tsc clean, lint clean, vitest pass + coverage, HF Space health, demo video length, 30-second highlight clip, backup demo, deck PDF, README demo URL, LICENSE Apache 2.0, core IBM Granite tools cited in README, manual Q&A flashcards, manual track checkboxes, manual stakeholder quotes, git in sync, submission-payload checkboxes ticked.

If `--final` returns any HARD-FAIL, DO NOT submit until resolved.

## Code style

- **TypeScript strict.** No `any`, no `as unknown`, no `// @ts-ignore`.
- **No emojis** in code or docs unless explicitly requested.
- **Default to writing no comments.** Only the WHY when it's non-obvious. Never the WHAT (well-named identifiers carry that).
- **Editorial-paddock palette** for any frontend component: cream `#F4EBD8`, racing-green `#0A2818`, clay `#C1492C`, amber `#D9A441`, ink `#0F1410`. Resolve via `var(--token)` or Tailwind utility tokens; no raw hex codes outside `globals.css`.
- **IBM Plex Sans + Plex Mono + Fraunces** fonts via `next/font/google`. No other display fonts.
- **WCAG 2.1 AA** baseline. Keyboard nav, screen-reader labels, `:focus-visible` rings, `prefers-reduced-motion` respect.

## Tests

- **Vitest + @testing-library/react** for the frontend. Tests live at `app/frontend/components/__tests__/`. Pure-function tests in `.test.ts`, component tests in `.test.tsx`.
- **Pytest** for the backend (once Vinh ships `app/backend/`). 70% coverage gate enforced in `--final` mode.
- **Convergence 14** is the load-bearing safety contract: every kinematic-violation type has a unit-test fixture covering the serializer output AND the expected Granite Guardian verdict. Failing a Convergence-14 test blocks the merge.
- **No `vi.fn()` returns without an assertion.** Spies that nobody asserts on are silent test-coverage gaps.

## Review discipline

Per D-007 in `docs/decision-log.md` (quality-over-speed + tool-inventory audit BLOCKING):

- **Three-brain HARD RULE.** Every multi-file or 200+ line change gets reviewed by at least two of: Codex (codex-rescue agent), pr-review-toolkit lens (silent-failure-hunter / type-design-analyzer / code-reviewer / comment-analyzer), Gemini long-context. The original author never self-reviews.
- **Cold review.** When a wave shipped clean against the first review pass, run a second cold pass with a different lens. Multi-wave cold reviews find what single-wave depth misses.
- **Tier findings BLOCKER / HIGH / MED / NIT.** Fix BLOCKERs inline; HIGHs in the same wave; MEDs in the next wave or deferred with a tracked memory entry; NITs at submission-week polish.

## Documentation

- **PLAN.md** is the living coordination doc. Status snapshot + phase tables + coordination protocol + shared contracts + decisions + open questions + pre-submit checklist.
- **docs/decision-log.md** captures every locked decision with rationale + date + scope. Newest first. D-001 through D-007 + D-A + D-B locked Day 1.
- **docs/pre-mortem.md** is the running failure-mode journal. ✅ marks resolved failures. 📘 marks pattern-locked lessons. 🟡 marks accepted residual risks.
- **docs/methodology.md** is the Sookra Methodology seven-phase trace; Day 11 final lock.
- **docs/architecture-spec.md** is the technical design doc: physics math + COA schema + telemetry channel spec + Layer-by-Layer responsibilities.
- **Obsidian session memory** at `~/Documents/Obsidian Vault/Claude Memory/Session - YYYY-MM-DD - apex-<slug>.md` for every substantive work session. Body: What done / Decided / Next / Gotchas / Related.

## Privacy + operator attribution

This is the rule that protects the audience.

- **Default to anonymous + aggregate.** When referring to adaptive-driver competitors, veteran motorsport rehabilitation programmes, hand-control suppliers, or any operator who has not explicitly opted in, use role descriptions ("a UK adaptive-driver competitor," "a veteran motorsport rehabilitation programme") not named identifiers.
- **Per-surface consent.** A driver consenting to be quoted in a deck does NOT consent to a README, a video, or a Twitter card. Each surface requires explicit per-surface consent.
- **Sender identity also anonymized in public files.** Personal email + school email of project members live in private memory only; public-repo files reference `[personal email kept private]` or `[school address kept private]`.
- **Filename privacy.** A filename embedding an operator identity is itself a leak (see pre-mortem row 21). Sweeps must cover paths + content + binary content (PDFs require `pdftotext` extraction; see `feedback_privacy_sweep_three_surfaces.md` in project memory).
- **Sarah Reynolds is fictional.** No real driver named without explicit OK.

## What NOT to do

- Do not skip pre-commit hooks (they don't exist here, per D-006; if you somehow find a hook, remove it).
- Do not push with `--no-verify` or `--no-gpg-sign` unless explicitly authorized.
- Do not force-push to `main`.
- Do not rewrite published commits.
- Do not commit secrets. `HF_TOKEN`, `WATSONX_PROJECT_ID`, OpenRouter API keys all live in env vars + repo secrets.
- Do not name operators or quote sources without per-surface consent.
- Do not use em-dashes (`—`, U+2014) in prose. Substitute table in `~/.claude/CLAUDE.md`. The pre-submit Check 1 catches violations.
- Do not use the project's AI-tone blocklist words in prose: `delve into`, `leverage`, `seamless`, `robust`, `comprehensive`, `unlock`, `cutting-edge`, `revolutionary`, `streamline`, `ecosystem`, `easily`, `simply`, `empower`, `intuitive`, `elevate`, `transform`, `sophisticated`, `powerful`, `amazing`, `effortless`. Check 2 catches violations.

---

## Reporting issues

GitHub Issues at https://github.com/StephenSook/apex/issues. Include a minimal reproduction, the relevant commit SHA, and the output of `bash scripts/pre-submit-checks.sh`.

## License

Apache License 2.0. See `LICENSE`.

---

_Last updated: 2026-05-21 evening by Stephen (initial draft alongside CODE_OF_CONDUCT.md, wave-19 polish)._
