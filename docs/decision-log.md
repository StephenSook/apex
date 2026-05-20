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

**Decision.** Nothing post-hackathon. Nothing stretch. Every enhancement, paper draft, beta-tester quote, June bridge architecture, live sim-rig mode, Colab notebook, judges-tour page, status dashboard, methodology trace, IBM Consulting outreach, multi-track submission entry — all in scope by 2026-05-31 23:59 ET.

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

## 2026-05-19 D-A: PhysicsTTM three-layer architecture (locked pre-rename, carried into APEX)

**Decision.** Three-layer architecture: frozen Granite TimeSeries TTM forecaster → differentiable physics-projection layer (CvxpyLayer QP with friction ellipse, bicycle model, COA-flagged simultaneity) → Granite Guardian BYOC text audit on serialized violation log.

**Rationale.** Phase 5 NotebookLM gap analysis surfaced "Kinetic Hallucination" — TTM trained on energy grids and weather can forecast physically impossible motorsport telemetry. The three-layer architecture closes this objection. Convergence 14 (serialization integrity) is the load-bearing safety requirement.

**Affected.** Backend architecture, deck slide 6, Q&A Card 2.

---

## 2026-05-19 D-B: Hero pitch headline + Q&A killshot reserved (carried into APEX)

**Decision.** Pitch headline: "First integrated workflow for adaptive hand-controls." Q&A knockout held in reserve: COA-parameterized brake-throttle simultaneity (the deepest novelty per NotebookLM).

**Rationale.** Phase 5 NotebookLM Q4 verdict: candidate 3 (integrated workflow) is most accessible for opening pitch; candidate 4 (COA simultaneity) is the deepest novelty and best preserved for Q&A when a judge asks "why not just Track Titan?"

**Affected.** Pitch script, Q&A flashcards (Card 4).
