# APEX - Project Context for Claude Code

Read this first. Then read the actual sources of truth in the order listed in `PLAN.md` §Sources of truth.

## Project

AI race engineer for adaptive, veteran, and grassroots racers, built on IBM Granite. Submission for IBM SkillsBuild AI Builders Challenge, May Challenge ("AI Beyond the Finish Line").

- Submission deadline: 2026-05-31, 11:59 PM ET
- Repo: https://github.com/StephenSook/apex
- Team: Stephen Sookra (frontend, pitch, project architect) + Vinh Le (backend, ML pipeline, infra)
- Renamed from PIT WALL on 2026-05-20 to avoid BeMyApp portal name collision

## Authoritative state lives outside this file

This project has a deliberate three-layer persistence stack. **Read those before this file:**

1. **Project memory:** `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/MEMORY.md` (index). Durable facts + 6 load-bearing rules (galaxy ambition, research-tool discipline, Obsidian state sync, em-dash zero tolerance, atomic-commit discipline, quality over speed).
2. **Obsidian project hub:** `~/Documents/Obsidian Vault/Projects/APEX MOC.md`. Chronological pointer to Claude Memory sessions.
3. **PLAN.md (this repo):** living coordination doc. Status snapshot, phase tables, decisions D-001+, shared contracts, pre-submit checklist.

If any single source of truth drifts from another, follow the priority order in `PLAN.md` §Sources of truth (memory > architecture-spec > PLAN.md > briefing PDF > decision-log > methodology > pre-mortem > README).

## Locked decisions (DO NOT VIOLATE without escalation)

Full rationale in `docs/decision-log.md`.

- **D-001:** Project name = APEX (rename from PIT WALL).
- **D-002:** Monorepo, public Day 1, Apache 2.0.
- **D-003:** Galaxy-tier scope. Nothing post-hackathon, nothing stretch. Everything ships by 2026-05-31.
- **D-004:** Research-tool discipline. Context7 → tavily → firecrawl → EXA → WebFetch before any factual claim. Never bluff a fact.
- **D-005:** State-sync protocol. Every substantive session ends with a Claude Memory write at `Claude Memory/Session - YYYY-MM-DD - apex-<slug>.md`.
- **D-006:** No git hooks. Manual coordination only. `.git/hooks/` stays defaults-only. No Husky, lefthook, pre-commit, commit-msg validators.
- **D-007:** Quality over speed. Tool-inventory audit BLOCKING before any non-trivial task. Use every available skill + agent + MCP + connector.
- **D-A:** PhysicsTTM three-layer architecture (frozen TTM → CvxpyLayer QP projection → Guardian BYOC text audit). Convergence 14 (serializer unit-test suite) is load-bearing.
- **D-B (refined Day 1 PM):** Dual-layer pitch architecture. Emotional Hero headline = "The race engineer for the drivers who don't have one." Technical positioning headline (Differentiator #1) = "First integrated workflow for adaptive hand-controls." Q&A killshot reserved = COA-parameterized brake-throttle simultaneity.

## Hard compliance (DQ-grade)

- **No em-dash (—) in prose.** Single most reliable AI-tone tell. Substitutes table in global CLAUDE.md.
- **No AI-tone blocklist words:** delve into / leverage / seamless / robust / comprehensive / unlock / cutting-edge / revolutionary / streamline / ecosystem / easily / simply.
- **No invented FIA Article numbers.** Verify via FIA.com or `research/` PDFs.
- **No named operators without per-surface consent.** Defaults to anonymous + aggregate.
- **No NIL violations.** Sarah Reynolds is a fictional persona by design.
- Conditional phrasing on physics claims ("forecast envelope" not "guaranteed pace").
- Every coaching claim cites a specific COA section + FIA Article via the provenance footer.

## Editorial-paddock visual identity (frontend + deck + video)

Locked Day 1. Coherent across briefing PDF (Vinh handoff), web frontend (`app/frontend/`), deck (Day 11 Playwright HTML to PDF), demo video (Day 10).

- **Background:** warm cream paper (`#F4EBD8`).
- **Primary:** deep racing green (`#0A2818`).
- **Accent:** signal clay red (`#C1492C`).
- **Highlight:** amber (`#D9A441`).
- **Ink:** near-black (`#0F1410`).
- **Display:** Fraunces (variable, SOFT + WONK + opsz axes, italic supported).
- **Body:** IBM Plex Sans (300-700).
- **Mono / numerics:** IBM Plex Mono (400-600).
- **Motion:** subtle staggered reveal via `.apex-rise` keyframe. `prefers-reduced-motion` honored at base CSS.

## What Claude should do every turn

1. **Tool-inventory audit FIRST** for any non-trivial task (D-007). Name at least 5 candidate skills / agents / MCPs / connectors. Pick the top 1-2. Use them.
2. **Research-tool first** for any uncertain fact (D-004). Verify via Context7 / tavily / firecrawl / EXA / WebFetch before asserting.
3. **Read before edit.** Edit/Write tools error if a file has not been Read in the current session. If >5 tool calls have elapsed since last Read of a file, re-Read first.
4. **Atomic commits + push immediately.** One logical change per commit. Subject <= 100 chars. Conventional Commits prefixes.
5. **No git hooks.** Verify `.git/hooks/` stays defaults-only.
6. **No em-dash in prose.** Sweep before committing.
7. **Session-end Claude Memory write** for any substantive session (3+ atomic commits, gate completion, decision, research call).

## What NOT to read by default

Per `feedback_quality_over_speed.md` anti-patterns, do not load these by default (load only when relevant to the task):

- `app/frontend/node_modules/**` (4000+ files, generated)
- `app/frontend/.next/**` (build output)
- `research/*.pdf` (model recon, not active during build)
- `app/frontend/pnpm-lock.yaml` (large lockfile)
