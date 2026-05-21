# APEX Decision Log

Every locked decision with rationale + date + scope. Newest first.

---

## 2026-05-20 D-001: Project renamed PIT WALL → APEX

**Decision.** Project name is APEX.

**Rationale.** BeMyApp portal showed a competing submission titled "PitWall" (cinematic GoPro AI race engineer for amateur drivers using GoPro footage). Different audience and product (amateur sim-and-track-day coaching vs adaptive-racer post-race coaching) but visual name collision in 43-team grid creates judge confusion. APEX is universal racing vocabulary (every corner has one), two syllables, no major brand collision. Backronym A.P.E.X. = Adaptive Performance Engineer (with) eXplanation.

**Affected.** All collateral: repo name, README, deck, video, all stakeholder emails sent on 2026-05-19 (which were still under PIT WALL branding but the substance fully transfers; outreach replies if any will route to APEX).

---

## 2026-05-20 D-002: Monorepo, public Day 1, Apache 2.0

**Decision.** Single GitHub repo at https://github.com/StephenSook/apex. Public from Day 1. Apache 2.0 license. Holds app code + physics-tsfm library + research PDFs + deck + paper draft + Bob session logs in one tree.

**Rationale.** Atomic-commit green-squares visibility matters for IBM judges who may check repo history during evaluation. Public from Day 1 also signals confidence. Single repo simplifies Vinh's onboarding and submission URL.

**Affected.** All build work for the next 12 days. Vinh added as collaborator (pending his GitHub handle).

---

## 2026-05-20 D-003: Galaxy-tier scope rule

**Decision.** Nothing post-hackathon. Nothing stretch. Every enhancement, paper draft, beta-tester quote, June bridge architecture, live sim-rig mode, Colab notebook, judges-tour page, status dashboard, methodology trace, IBM Consulting outreach, multi-track submission entry. All in scope by 2026-05-31 23:59 ET.

**Rationale.** Stephen explicit: "We're aiming for the galaxy, not the moon. Nothing should be post-hackathon; everything should be within the scope right now so we can have the best project ever." This reframes the 12-day plan from default-scope to all-in-scope. A feature shipped at 70% quality on Day 11 beats a feature deferred to a v2 that judges never see.

**Affected.** Plan §16 enhancements, §17 external-tool layers, §18 inclusions list, all formerly-stretch items. Memory rule installed at `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/feedback_galaxy_ambition_no_deferrals.md`.

---

## 2026-05-20 D-004: Research-tool discipline as durable rule

**Decision.** When uncertain about a fact, library version, API behavior, FIA regulation, IBM Granite model card detail, or person's role/email: verify with a research tool (Context7 → tavily → firecrawl → EXA → WebFetch) BEFORE asserting in code, deck, email, or memory.

**Rationale.** APEX ships to IBM judges who may include time-series ML researchers. A single false claim turns the demo into a credibility hit. Cost of one research-tool call is seconds; cost of one wrong claim is the prize.

**Affected.** All future work on this project. Memory rule installed.

---

## 2026-05-20 D-005: State-sync protocol via Obsidian + project memory

**Decision.** Every substantive work session ends with a Claude Memory write to Obsidian at `Claude Memory/Session - YYYY-MM-DD - apex-<slug>.md`. Project facts live durably in `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/`. Obsidian APEX MOC is the chronological hub.

**Rationale.** If VS Code crashes or a new chat opens cold, the next session can recover full state from `Home.md` → `APEX MOC` → last 3 Claude Memory entries. Three persistence layers: memory (facts), Obsidian project notes (structure), Claude Memory (chronicle).

**Affected.** Every session for the next 12 days.

---

## 2026-05-20 D-006: No git hooks, manual coordination only

**Decision.** `.git/hooks/` contains only the 14 `.sample` defaults that git ships with. No Husky, no lefthook, no pre-commit, no commit-msg validators, no CLI wrappers. Coordination is manual via PLAN.md edits.

**Rationale.** Stephen and Vinh have shipped Trace, Hometown-Pathway-Atlas, Compass, and Nest using the same manual-coordination convention (Hometown PLAN.md task 0.4 verbatim: "Coordination is manual (mirrors Trace) - no hooks, no CLI"). Hooks introduce three failure modes the 12-day hackathon cannot afford: commit-blocking on lint glitches when a hotfix is needed mid-incident, hook divergence across the two laptops, and silent-bypass-via-`--no-verify` that defeats the gate anyway. CI on push to main is the quality gate that replaces hooks.

**Affected.** All commits Day 1-12. Verified Day 1 PM via `ls -la .git/hooks/`: only `*.sample` files present.

---

## 2026-05-20 D-007: Quality over speed, tool-inventory audit BLOCKING

**Decision.** Before any non-trivial task (commit-worthy work, design decision, deck section, outreach email, demo recording, paper draft), the operator (Claude or Stephen) runs a tool-inventory audit and names at least 5 candidate skills / agents / MCPs / connectors from the available inventory that could elevate the result. Pick the top 1-2. Use them. Save findings to memory.

**Rationale.** Stephen explicit on Day 1 (2026-05-20): "Quality over speed. Do not rush things. Make sure you're going through every single skill, every single superpower, every single plugin, every single MCP, every single connector." This rule is the operational implementation of the global hackathon-project-flow Phase 1 principle ("tool-inventory audit BLOCKING before non-trivial tasks"). The project will be won by depth, not by velocity. A 70%-quality feature shipped at Day 11 beats a 90%-quality feature deferred to a hypothetical v2 only when the 70%-quality feature is the ONLY surface that exists; for tasks with quality variance, the rule is "use the leverage tools."

**Affected.** Every non-trivial Claude tool-use sequence for the 12-day build. Memory rule installed at `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/feedback_quality_over_speed.md`. Codex independent review wave 2 Day 1 EOD applied this principle (BLOCKER findings B1 + B2 surfaced because the manual-grep-and-fix sweep was lower-leverage than the Codex adversarial review).

---

## 2026-05-19 D-A: PhysicsTTM three-layer architecture (locked pre-rename, carried into APEX)

**Decision.** Three-layer architecture: frozen Granite TimeSeries TTM forecaster → differentiable physics-projection layer (CvxpyLayer QP with friction ellipse, bicycle model, COA-flagged simultaneity) → Granite Guardian BYOC text audit on serialized violation log.

**Rationale.** Phase 5 NotebookLM gap analysis surfaced "Kinetic Hallucination": TTM trained on energy grids and weather can forecast physically impossible motorsport telemetry. The three-layer architecture closes this objection. Convergence 14 (serialization integrity) is the load-bearing safety requirement.

**Affected.** Backend architecture, deck slide 6, Q&A Card 2.

---

## 2026-05-19 D-B: Dual-layer pitch headline + Q&A killshot reserved (carried into APEX, refined Day 1 PM 2026-05-20)

**Decision.** Pitch architecture has two leads, both ship in the deck + video + landing page:

1. **Emotional hero headline (h1 on the landing page, lead line of the 3-minute video):** "The race engineer for the drivers who don't have one." This is the human-story hook. Calibrated by Phase 4.5 hostile-pitch review (Kimi) as the most universally accessible opening beat.
2. **Technical positioning headline (Differentiator #1 card on the landing page, slide 4 in the deck):** "First integrated workflow for adaptive hand-controls." This is the technical-novelty anchor that distinguishes APEX from Track Titan, Trophi.ai, and the generic AI race-engineer category.

**Q&A killshot reserved:** COA-parameterized brake-throttle simultaneity (the deepest novelty per NotebookLM Phase 5 Q4 verdict). Deployed only when a judge presses "why not just Track Titan or Trophi.ai." Card 4 in `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_qa_killshots.md`.

**Rationale.** Phase 5 NotebookLM Q4 audit: candidate 3 (integrated workflow) is the most accessible *technical* positioning. The Kimi hostile-pitch review separately identified that leading with the technical claim loses the emotional hook for judges scanning 43 submissions. The synthesis: lead Hero with emotion ("drivers who don't have one"), lead Differentiator panel with technical positioning ("first integrated workflow"), hold COA simultaneity for the Q&A knockout. All three are present in every submission surface (landing page, deck, video, Q&A pack). None are mutually exclusive.

**Affected.** Pitch script (3-min video Day 9), deck (Day 11), landing page (live Day 1 PM), Q&A flashcards (Card 4 in memory).
