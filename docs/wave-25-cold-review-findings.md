# Wave-25 cold-review findings

Synthesized 2026-05-21 night-late after Stephen's "/review ultrathink" on the wave-25 closure batch. Four parallel agents dispatched + manual Bash/WebFetch sweep:

- **codex:codex-rescue** - adversarial pass across paper + spec + PLAN + README + docs
- **cc-gemini-plugin:gemini-agent** - large-context cross-file consistency sweep across 17 surfaces
- **plan-gap-scanner** - PLAN gap sweep
- **pr-review-toolkit:comment-analyzer** - JSDoc + paper Figure 1 caption + Table 1/2/3 skeleton fidelity
- Manual Bash sweep + WebFetch verification of Granite model identifiers

Headline pattern surfaced: **wave-25's two-stage propagation reached the paper Abstract + §1 + §3.2 + arch-spec Layer 4 + PLAN rows 2.9a/2.9b/2.10 + pitch Beat 4+5 + Q&A Card 2 + Sarah persona §T7-failure + telemetry annotation + forecast bullet** but did NOT propagate to ~12 other surfaces still carrying the pre-wave-25 single-stage framing. Wave-25 closures themselves seeded new drift (same wave-23 -> wave-24 pattern repeating).

Closure systematic rule for wave-26: when running closure on a propagation-type finding (cross-surface architectural reformulation), grep the entire repo for the old language not just the surfaces named in the original finding doc. Save to memory as `feedback_propagation_full_repo_sweep.md`.

---

## BLOCKER (cost-the-submission tier)

### B-W25-1. Paper TITLE still says single-stage "Differentiable Physics-Projection Layer"

**File:line:** `paper/apex-neurips-workshop-2026.md:1`

**Verbatim:** `# APEX: A Differentiable Physics-Projection Layer for Adaptive-Driver Motorsport Telemetry on Frozen Time-Series Foundation Models`

**Source:** gemini B-W25-1

**Fix:** Rewrite title to `# APEX: A Two-Stage Projection-and-Audit Layer for Adaptive-Driver Motorsport Telemetry on Frozen Time-Series Foundation Models`. Mirrors Abstract's verbatim coinage so the title and §3 method section name the same artifact.

### B-W25-2. README Differentiator #2 heading + body still single-stage

**File:line:** `README.md:58-60`

**Verbatim (heading):** `### 2. Differentiable physics-projection layer prevents kinetic hallucinations`

**Verbatim (body):** describes bicycle-model coupling as inside the QP.

**Source:** gemini B-W25-2 + codex BLOCKER #1

**Fix:** Heading -> "Two-stage projection-and-audit layer prevents kinetic hallucinations." Body -> propagate Stage 1 convex QP + Stage 2 feasibility filter framing matching paper §3.2.

### B-W25-3. README embedded Mermaid diagram still shows single PROJ node

**File:line:** `README.md:111` (PROJ node) + `:127` (DOCLING dotted edge) + `:136` (PROJ -> FCST) + `:153` (class assignment)

**Verbatim:** `PROJ["Differentiable physics-projection layer<br/>friction ellipse + bicycle model<br/>+ COA simultaneity flag<br/>+ jerk bound + circuit-conditional mu"]`

**Source:** gemini B-W25-3

**Fix:** Replace inline Mermaid block with the contents of `docs/architecture-diagram.mmd` verbatim. Diagram has been updated wave-25 to QP + FEAS nodes.

### B-W25-4. README first-claim "only" unhedged

**File:line:** `README.md:64`

**Verbatim:** Asserts competing tools provably assume able-bodied physics.

**Source:** codex BLOCKER #2

**Fix:** Use paper §5.3 wording. Characterize Track Titan / Trophi.ai as "no public documentation found," not as proven absence (matches the wave-25 M12 Q&A Card 4 softening pattern).

### B-W25-5. arch-spec system-overview ASCII art still single-stage

**File:line:** `docs/architecture-spec.md:24-25`

**Verbatim:** Single `Differentiable physics projection (CvxpyLayers QP)` box at top of file. Same file Layer 4 sub-section has the wave-24 two-stage rewrite. Internal contradiction.

**Source:** gemini B-W25-4

**Fix:** Redraw ASCII as Stage 1 + Stage 2 stacked, or replace ASCII with a one-line reference to `docs/architecture-diagram.mmd`.

### B-W25-6. arch-spec Layer 6 narrator input doesn't name stage

**File:line:** `docs/architecture-spec.md:204`

**Verbatim:** `- The physics-projected forecast envelope (Layer 2 output, after Layer 3 audit)`

**Source:** gemini B-W25-5

**Fix:** Rename to "Stage 1 `corrected_tensor` from Layer 4, with the Stage 2 feasibility verdict carried in `violation_log`."

### B-W25-7. decision-log D-A still bundles bicycle + COA into the QP

**File:line:** `docs/decision-log.md:79`

**Verbatim:** `differentiable physics-projection layer (CvxpyLayer QP with friction ellipse, bicycle model, COA-flagged simultaneity)`

**Source:** gemini B-W25-6

**Fix:** Decision-log is invoked in CLAUDE.md hard-compliance as a load-bearing locked-decision source. Rewrite D-A to name Stage 1 + Stage 2 explicitly. Add a one-line note dating the refinement to wave-25.

### B-W25-8. BeMyApp devlog Day 1 ping still single-stage

**File:line:** `docs/outreach-drafts/bemyapp-devlog-day-1.md:14`

**Source:** gemini B-W25-7

**Fix:** Day 1 ping is historical (dated 2026-05-20). Add a one-line preamble noting wave-25 refinement. Update Day 2+ ping templates (line 26, 37, 41) to carry the corrected two-stage framing.

### B-W25-9. Paper §3.6 IBM x Scuderia Ferrari claim overstated

**File:line:** `paper/apex-neurips-workshop-2026.md:143`

**Verbatim:** `... are infrastructure adopted from the published IBM Granite stack and the IBM x Scuderia Ferrari case-study precedent.`

**Source:** codex BLOCKER #3

**Fix:** IBM public materials support a watsonx / Granite Ferrari LLM fan-app, not the specific eight-tool stack APEX uses. Soften to "inspired by IBM's public Ferrari watsonx / Granite case study" and cite only the exact scope confirmed by IBM Newsroom.

### B-W25-10. Paper §4 Sarah fixture row count inconsistent with "qualifying session" framing

**File:line:** `paper/apex-neurips-workshop-2026.md:153`

**Verbatim:** `A 60-row 50-Hz telemetry CSV designed to match a plausible adaptive-driver lap-17-of-19 qualifying session ...`

**Source:** codex BLOCKER #4 + comment-analyzer HIGH

**Fix:** 60 rows at 50 Hz = 1.2 seconds, not a qualifying lap. Either correct the row count, or describe explicitly as "a 60-row (1.2-second) 50-Hz telemetry slice extracted from lap 17 of 19 ... covering the brake-release-to-throttle-on micro-window at one corner entry." The frontend's `app/frontend/public/fixtures/sarah-lap-17.csv` is verified at 60 data rows.

### B-W25-11. Paper §4 Metrics defines MAE as RMSE in the same parenthetical

**File:line:** `paper/apex-neurips-workshop-2026.md:181`

**Verbatim:** `- Per-mini-sector lap-time MAE (root mean square error on the lap-time scalar per mini-sector).`

**Source:** comment-analyzer BLOCKER

**Fix:** MAE and RMSE are distinct metrics. Table 2 + 3a + 3b use the column header "Lap-time MAE (s)" so the parenthetical needs to define MAE (mean absolute error), not RMSE.

### B-W25-12. arch-spec line 115 a_lat unit double-applies gravity

**File:line:** `docs/architecture-spec.md:115`

**Verbatim:** `a_lat and a_long are the projected lateral and longitudinal accelerations in g.`

**Source:** codex HIGH #5 (treated as BLOCKER because math bug)

**Fix:** The QP bounds by `(mu_v * g)^2`, so storing a_lat / a_long in g units double-applies gravity. Pick one unit convention throughout: accelerations in m/s^2 with `mu*g` bound, OR accelerations in g with `mu` bound.

### B-W25-13. PLAN missing wave-25 findings doc + index entry

**File:line:** `PLAN.md` Sources-of-truth Cold-review-findings-index sub-section

**Source:** plan-gap-scanner BLOCKER

**Fix:** Create this very file. Add wave-25 index row. PLAN rows 2.9a + 2.9b + 2.10 + 6.7 + 6.8 currently cite wave-24 findings + wave-25 closures without a corresponding wave-25 findings doc.

---

## HIGH (judge will catch on first read)

### H-W25-1. IBM Consulting cold email still single-stage

**File:line:** `docs/outreach-drafts/ibm-consulting-cold-email-day-12.md:31`

**Fix:** Propagate two-stage via comma-clause (avoid em-dash).

### H-W25-2. June-bridge transfer claim + substitution table + Beat 5 all single-stage

**File:line:** `docs/june-challenge-bridge.md:13` + `:34` + `:62`

**Fix:** Update three lines. Substitution-table row gets a Stage-1 + Stage-2 split mirror for both motorsport and FIFA columns.

### H-W25-3. APEX-Lite contingency narrative single-stage

**File:line:** `docs/apex-lite-contingency.md:42` + `:56`

**Fix:** Update Full-APEX cell + Beat-4 narrative.

### H-W25-4. Methodology Phase 5 narrative single-stage

**File:line:** `docs/methodology.md:61`

**Fix:** Add wave-25 paragraph after the wave-24 paragraph. Update footer.

### H-W25-5. Sarah persona "two-stage physics validator" != paper "two-stage projection-and-audit layer"

**File:line:** `docs/sarah-reynolds-persona.md:42` + `:75`

**Source:** gemini H-W25-6

**Fix:** Standardize lexicon to paper Abstract verbatim coinage.

### H-W25-6. Q&A Card 1 (Deep Dynamics) still single-stage

**File:line:** `docs/q-and-a-flashcards.md:15`

**Fix:** Propagate two-stage framing. Card 1 is the most-rehearsed defense card.

### H-W25-7. Q&A Card 2 reasoning-strength gap

**File:line:** `docs/q-and-a-flashcards.md:25`

**Verbatim:** `Both constraints are nonconvex so they cannot live in the QP, but the audit is sufficient because Stage one already pulls forecasts into the convex feasible interior.`

**Source:** gemini H-W25-8

**Fix:** The "sufficient because Stage one already pulls forecasts into the convex feasible interior" claim is logically weak: bicycle equation `a_lat = (speed^2 / L) * tan(theta)` is independent of friction + Euler + jerk feasibility. A motorsport-ML judge will press. Rewrite to describe Stage 2 as accept/reject filter + Guardian-audit-on-combined-log; do not claim Stage 2 corrects in-place.

### H-W25-8. Q&A Card 5 "Day 13 conversation" deferral language

**File:line:** `docs/q-and-a-flashcards.md:79`

**Source:** codex HIGH #11

**Fix:** Replace with V1 boundary answer + pre-deadline artifact.

### H-W25-9. Commit count drift 197 -> 201

**File:line:** `README.md:258` + `PLAN.md:57` + `PLAN.md:507` + `docs/methodology.md:71`

**Source:** gemini H-W25-9

**Fix:** `git rev-list --count HEAD` returns 201. Sweep all four surfaces to "201+ atomic commits."

### H-W25-10. PLAN row 6.7 owner blob wave-24 H6 still un-split

**File:line:** `PLAN.md:264`

**Source:** plan-gap-scanner #11

**Fix:** Split row 6.7 into 6.7a (Stephen, §1-§3 + §5-§13) and 6.7b (Vinh, §4 Experiments).

### H-W25-11. PLAN missing Stage 1 + Stage 2 test row

**Source:** plan-gap-scanner #5 + #8

**Fix:** Add row 2.9c "Stage 1 QP projection + Stage 2 feasibility filter test suite" with file paths + measurable acceptance criterion.

### H-W25-12. paper §4 Stage-1-only baseline row in Table 2 not enumerated in Baselines bullets

**File:line:** `paper/apex-neurips-workshop-2026.md:175` (table row) vs `:165-167` (Baselines bullets)

**Source:** comment-analyzer MED (escalated to HIGH because table row reads smuggled-in to reviewer)

**Fix:** Add fourth Baselines bullet: "TTM + Stage-1 QP only (Stage-2 audit disabled; isolates the differentiable-convex contribution)."

### H-W25-13. paper §4 Guardian verdict distribution metric has no table

**File:line:** `paper/apex-neurips-workshop-2026.md:183`

**Source:** comment-analyzer HIGH

**Fix:** Either add column to Table 2 + 3c, or strike the bullet and reroute claim to §4.6 / §7 reproducibility pointer.

### H-W25-14. paper Abstract "we evaluate" overclaim

**File:line:** `paper/apex-neurips-workshop-2026.md:19`

**Source:** codex HIGH #9

**Fix:** Rewrite to "We specify an evaluation protocol and present a synthetic fixture ..." until measurements exist.

### H-W25-15. paper line 182 physics-violation rate only measures un-projected output

**File:line:** `paper/apex-neurips-workshop-2026.md:182`

**Source:** codex HIGH #7

**Fix:** Define violation rate for raw TTM output, Stage 1 output, and Stage 2 audit failures separately so Tables 2 + 3 carry differential signal.

### H-W25-16. paper Table 3b pre-baked result cells

**File:line:** `paper/apex-neurips-workshop-2026.md:207`

**Source:** codex HIGH #8

**Fix:** Replace `0 (correctly permitted)` + `yes` cells with `--` placeholders. Move expected behavior into prose outside the table.

### H-W25-17. Granite model identifier wrong in paper §13 References

**File:line:** `paper/apex-neurips-workshop-2026.md:340`

**Verbatim:** `ibm-granite/granite-4-8b-instruct on Hugging Face`

**Source:** codex HIGH #10. Verified 2026-05-21 night-late via WebFetch of `https://huggingface.co/ibm-granite`: confirmed public IDs are `ibm-granite/granite-4.1-8b` (8B Instruct base) + `ibm-granite/granite-vision-4.1-4b` + `ibm-granite/granite-docling-258M`. TTM r2.1 model identifier needs verification too.

**Fix:** Update to verified Hugging Face IDs.

### H-W25-18. Outreach LinkedIn DMs + adaptive-supplier consent draft still single-stage + still positive-attribution Track Titan claim

**File:line:** `docs/outreach-drafts/adaptive-supplier-consent-day-1.md:26` + `linkedin-dm-driver-a-day-3.md:25` + `linkedin-dm-driver-b-day-3.md:21`

**Source:** Bash sweep

**Fix:** Apply same two-stage + Track Titan softening already applied to Q&A Card 4 + Sarah persona.

### H-W25-19. PLAN row 2.9a Notes closure-tag bleed-through

**Source:** plan-gap-scanner #4

**Fix:** Move "paper §3.2 reformulation" closure-tag prose into this findings file. Trim row 2.9a Notes to one-line pointer.

### H-W25-20. PLAN row 1.14 + 1.16 named Discord-handle operators

**Source:** plan-gap-scanner #27 + #28

**Verbatim handles:** `Lucas-BMA` + `Chi blú [GTLB]`

**Fix:** Replace with "a BeMyApp staff moderator answered a community member" per `feedback_anonymization_pre_consent.md`.

---

## MED (won't surface unless audited hard)

### M-W25-1. brand-fonts JSDoc "next/og's Font option struct" technically loose

**File:line:** `app/frontend/lib/brand-fonts.ts:5`

**Source:** comment-analyzer MED

**Fix:** `next/og` facade does NOT re-export `Font`. Rewrite JSDoc to clarify that the Font type lives inside Next's compiled bundle, not on the public facade.

### M-W25-2. paper §4 placeholder convention inconsistent (`--` + `TBD` + `n / a` + literal `0`)

**File:line:** `paper/apex-neurips-workshop-2026.md` §4 tables

**Source:** comment-analyzer MED

**Fix:** Standardize `--` for pending camera-ready. Keep `n / a` for "not applicable by design." Keep literal `0` for known-zero values.

### M-W25-3. paper §3 method-section heading "the three-layer PhysicsTTM pipeline" doesn't advertise two-stage middle layer

**Source:** gemini M-W25-1

**Fix:** Rewrite to "the three-layer PhysicsTTM pipeline with a two-stage projection-and-audit middle layer."

### M-W25-4. PLAN status snapshot Phase-2 line 29 doesn't mention row 2.9a/2.9b split

**Source:** gemini H-W25-7

**Fix:** Add a sentence describing the wave-25 row split.

### M-W25-5. Q&A Card 2 vocabulary "two-stage physics validator" != paper "two-stage projection-and-audit layer"

**Source:** gemini M-W25-5

**Fix:** Same as H-W25-5; standardize lexicon.

### M-W25-6. arch-spec footer line 330 still says "wave-19 expansion"

**Source:** gemini M-W25-6

**Fix:** Bump to wave-25 stamp.

### M-W25-7. PLAN Shared Contracts missing Stage-1 QP decision-variable tensor row

**Source:** plan-gap-scanner #17

**Fix:** Add Shared Contract row "Stage-1 QP decision-variable tensor" with shape + units + decision-vs-exogenous channels.

### M-W25-8. paper §4 Physics-violation-rate column has no unit

**File:line:** `paper/apex-neurips-workshop-2026.md:171`

**Source:** comment-analyzer MED

**Fix:** Header -> "Physics-violation rate (fraction of steps)."

### M-W25-9. paper §4 Table 3b column "Brake-throttle-simultaneity rows flagged" has no unit

**File:line:** `paper/apex-neurips-workshop-2026.md:206`

**Source:** comment-analyzer MED

**Fix:** Header -> "(count out of 60-row fixture)."

### M-W25-10. paper §3.6 redundant phrase between line 139 + 143

**Source:** gemini M-W25-3

**Fix:** Break the echo.

### M-W25-11. PLAN Q-007 paragraph closure-tag bleed-through

**Source:** plan-gap-scanner #20

**Fix:** Trim to canonical decision rule + triggers + action; move history to wave-22 findings.

### M-W25-12. PLAN row 5.14 + 5.15 closure-tag bleed-through

**Source:** plan-gap-scanner #21 + #22

**Fix:** Trim each Notes cell to one-line pointer.

### M-W25-13. PLAN row 1.10 status conflicts D-003 galaxy-tier rule

**Source:** plan-gap-scanner #18

**Fix:** Either flip to cut-from-scope + log in decision-log, OR re-elevate to required + assign hard date.

---

## NIT (cosmetic)

### N-W25-1. "IBM x Scuderia Ferrari" vs "IBM × Scuderia Ferrari" mix

**Source:** gemini N-W25-1

**Fix:** Standardize to one form. The `×` (multiplication sign) matches deck branding + BeMyApp banner aesthetic.

### N-W25-2. Sarah persona line 42 "leverages" on AI-tone blocklist

**File:line:** `docs/sarah-reynolds-persona.md:42`

**Source:** codex NIT #15 + Bash blocklist sweep

**Verbatim:** `her amputation-side prosthetic stub leverages awkwardly`

**Fix:** Replace with "loads," "pivots," or "rotates."

### N-W25-3. paper §3.6 IBM x Scuderia Ferrari phrase echoed twice

**Source:** gemini M-W25-3 (cross-listed as NIT here too)

**Fix:** Break the echo at line 143.

### N-W25-4. paper §4 Stage-1 hyphen style inconsistent ("Stage-1" vs "Stage 1")

**File:line:** `paper/apex-neurips-workshop-2026.md:175` + `:176` + `:200` + `:201`

**Source:** comment-analyzer NIT

**Fix:** Standardize to "Stage 1" / "Stage 2" (space, no hyphen) matching diagram.

### N-W25-5. paper §4 Table 3a row "TTM zero-shot, no Stage 1, no Stage 2" vs Table 2 row "TTM zero-shot (no projection)" inconsistent phrasing

**Source:** comment-analyzer NIT

**Fix:** Pick one phrasing for both.

### N-W25-6. June-bridge "post-hackathon" / "Day 13+" language hedges D-003

**Source:** gemini N-W25-2 + N-W25-3

**Fix:** Soften the hedge.

### N-W25-7. README line 195 references unwritten `docs/ai-tone-policy.md`

**Source:** gemini N-W25-5

**Fix:** Either ship the doc or remove the forward reference.

### N-W25-8. brand-fonts JSDoc "Five narrowings" includes "lang -> dropped" which is structural absence not narrowing

**Source:** comment-analyzer NIT (optional)

**Fix:** Rewrite as "Four narrowings + one omission vs upstream."

### N-W25-9. brand-fonts JSDoc parenthetical "(three brand families)" redundant after literal union

**Source:** comment-analyzer NIT (optional)

**Fix:** Drop parenthetical.

### N-W25-10. Figure 1 caption omits Langflow + IBM Bob overlay nodes

**Source:** comment-analyzer NIT (optional)

**Fix:** Append clause naming overlays.

### N-W25-11. PLAN row 5.13 multi-owner blob

**Source:** plan-gap-scanner #29

**Fix:** Annotate as joint decision or split.

---

## Closure order (atomic-commit batch)

Per `feedback_atomic_commit_discipline.md` one logical change per commit:

1. `docs(reviews): wave-25 cold-review findings consolidated` (this file).
2. `fix(paper): wave-25 title + abstract + §3.6 + §4 + Granite IDs` (B-W25-1, B-W25-9, B-W25-10, B-W25-11, H-W25-12, H-W25-13, H-W25-14, H-W25-15, H-W25-16, H-W25-17, M-W25-2, M-W25-3, M-W25-8, M-W25-9, M-W25-10, N-W25-3, N-W25-4, N-W25-5).
3. `fix(readme): wave-25 Differentiator #2 + Mermaid sync + first-claim softening + commit count` (B-W25-2, B-W25-3, B-W25-4, H-W25-9 README slice, N-W25-7).
4. `fix(spec): wave-25 system-overview ASCII + Layer 6 narrator + a_lat unit + footer` (B-W25-5, B-W25-6, B-W25-12, M-W25-6).
5. `fix(docs): wave-25 decision-log D-A two-stage definition` (B-W25-7).
6. `fix(docs): wave-25 outreach + June bridge + APEX-Lite + methodology two-stage propagation` (B-W25-8, H-W25-1, H-W25-2, H-W25-3, H-W25-4, H-W25-18, N-W25-6).
7. `fix(docs): wave-25 Sarah persona vocab + Q&A Card 1 + Card 2 reasoning + Card 5 day-13 + leverages blocklist` (H-W25-5, H-W25-6, H-W25-7, H-W25-8, N-W25-2).
8. `fix(plan): wave-25 findings index + commit-count + row 6.7 split + row 2.9c + row 2.9a notes + anonymize + status snapshot wave-25 paragraph + footer` (B-W25-13, H-W25-9 PLAN slice, H-W25-10, H-W25-11, H-W25-19, H-W25-20, M-W25-4, M-W25-7, M-W25-11, M-W25-12, M-W25-13).
9. `refactor(frontend): wave-25 brand-fonts JSDoc next/og facade precision` (M-W25-1, N-W25-8, N-W25-9).
10. `chore(docs): wave-25 re-render architecture.svg from updated .mmd` (re-render the stale Mermaid SVG export).

Plus one chore standardizing `IBM × Scuderia Ferrari` across all surfaces (N-W25-1).

11 commits total. Push every commit immediately per `feedback_atomic_commit_discipline.md`.
