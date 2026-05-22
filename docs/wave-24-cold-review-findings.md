# Wave-24 cold review findings

> Stephen-requested cold review on wave-24 (5 BLOCKER + 8 HIGH wave-23 closures + 6 atomic commits). Five parallel agents (pr-review-toolkit:code-reviewer + comment-analyzer + cc-gemini-plugin:gemini-agent + codex:codex-rescue + plan-gap-scanner). Returned 9 BLOCKER + 14 HIGH + 12 MED + 2 NIT findings. Closures land in wave-25 (this same Stephen session).

---

## Headline finding

**Wave-24's own fixes introduced new drift.** The paper §3.2 was correctly reformulated from a false single-stage convex QP claim to a two-stage architecture (Stage 1 convex QP + Stage 2 post-projection feasibility filter), but the propagation was incomplete:

1. **arch-spec Layer 4 still says single-stage** with bicycle + COA inside the QP.
2. **PLAN rows 2.9 + 2.10 + Shared Contracts row** still describe the old single-stage projection. Vinh implementing from PLAN ships single-stage.
3. **Pitch script Beat 4 + 5 + Q&A Card 2 + Sarah persona** all still bundle bicycle + COA into the QP.
4. **Plain-language summary** still uses unbounded "corrects every prediction / obeys vehicle physics" language that the Abstract softening missed.
5. **Abstract + §1** still call the whole thing "differentiable physics-projection layer" — Stage 2 is non-differentiable.

Plus paper-time inventions (0.3g slip-tolerant threshold, ε=0.01 tolerance, "min-max normalized to [0,1]") landed with no architecture-spec or code backing. PLAN row 6.7 claimed `(cite Day 11)` placeholders were removed; §1 still has one. §3.6 "five tools" claim then lists six (counting error). §9 was renamed §13 (References) when wave-24 added Acknowledgments, but cross-references to "§9" in §2 + §10 weren't updated.

---

## Lenses dispatched

| Lens | Returned |
|---|---|
| pr-review-toolkit:code-reviewer | 0 BLOCKER + 0 HIGH + 2 MED + 1 NIT (frontend code clean; brand-fonts JSDoc imprecise enumeration) |
| pr-review-toolkit:comment-analyzer | 5 BLOCKER + 6 HIGH + 4 MED + 5 NIT (densest finding-set; biggest value-add this wave) |
| cc-gemini-plugin:gemini-agent | 4 HIGH-drift + 1 LOW-MED + 2 CLEAN (cross-file consistency) |
| codex:codex-rescue | 2 BLOCKER + 3 HIGH + 0 MED (mathematical convexity + differentiability scope) |
| plan-gap-scanner | 2 BLOCKER + 3 WARN + 2 NIT (PLAN drift post-wave-24) |

---

## BLOCKERs (close in wave-25)

### B1. Abstract + §1 "differentiable physics-projection layer" overclaim post-Stage-1/Stage-2 split
**Sources:** Codex BLOCKER #2.
**Locations:** Abstract line 19 + §1 line 37 + §3.2 line 123.
**Issue:** Wave-24 split §3.2 into Stage 1 differentiable QP + Stage 2 non-differentiable feasibility filter. The Abstract still says "differentiable CvxpyLayer QP projection layer that enforces the friction ellipse, the bicycle model, the forward-Euler kinematic step, the jerk bound, and a COA-parameterized brake-throttle simultaneity gate." This is false — bicycle + COA are now in Stage 2 (non-differentiable). §1 similarly says "APEX adds a differentiable physics-projection layer after the forecaster" as a system-level claim.
**Fix:** Abstract + §1 → "two-stage projection-and-audit layer: a differentiable CvxpyLayer QP for convex constraints (friction ellipse + forward-Euler kinematic + jerk bound), followed by a non-differentiable feasibility audit for the bicycle-model coupling and COA-parameterized simultaneity gate."

### B2. arch-spec Layer 4 still describes single-stage QP (spec-vs-paper drift)
**Sources:** Codex BLOCKER #4, gemini Q1.
**Location:** `docs/architecture-spec.md` Layer 4 lines 93-147, plus footer line 311 (still says "wave-19 expansion").
**Issue:** Spec line 117 has bicycle model as hard equality. Spec line 138 has COA gate `throttle_pct[t] * brake_pa[t] == 0` constraint inside QP-build path. Spec still presents the projection as single-stage. Directly contradicts paper §3.2 Stage 1 vs Stage 2 split.
**Fix:** Add Stage 1 / Stage 2 split paragraph to arch-spec Layer 4. Mark bicycle + COA as Stage 2 feasibility filter constraints. Bump footer to cite wave-25 closure of wave-23 B1+B2 propagation.

### B3. paper §1 still has `[Deep Dynamics; PINN; cite Day 11]` placeholder
**Source:** comment-analyzer BLOCKER-1.
**Location:** `paper/apex-neurips-workshop-2026.md:27`.
**Issue:** PLAN.md row 6.7 status note explicitly claimed "remaining (cite Day 11) placeholders removed." False. Line 27 still has the placeholder.
**Fix:** Replace `[Deep Dynamics; PINN; cite Day 11]` with `[Chrosniak et al. 2023]` (Deep Dynamics arXiv 2312.04374 verified in §13).

### B4. paper §3.2 "min-max normalized to [0, 1]" — paper-time invention
**Source:** comment-analyzer BLOCKER-2.
**Location:** `paper/apex-neurips-workshop-2026.md:89`.
**Issue:** Architecture-spec defines QP in physical units (g, m/s³, radians, Pa). No mention of min-max normalization anywhere. `grep -r "min-max\|MinMaxScaler" docs/ app/` returns only the paper file. This is an undisclosed paper-time invention that creates a binding contract for Vinh's projection.py.
**Fix:** Either (a) commit normalization to arch-spec NOW (⚠️ CONTRACT prefix), or (b) delete the sentence from paper since QP is solvable in physical units and normalization is not load-bearing for the convexity claim. Recommend (b) — simpler.

### B5. paper §3.2 Stage 2 "V1 threshold 0.3g + ε = 0.01" — paper-time inventions
**Source:** comment-analyzer BLOCKER-3.
**Location:** `paper/apex-neurips-workshop-2026.md:119,121`.
**Issue:** No architecture-spec backing. These numbers commit Vinh's projection.py to specific values. Doubly load-bearing on B4 (ε in "normalized units" requires B4 normalization claim).
**Fix:** Either commit numbers to spec (⚠️ CONTRACT), or soften to "a slip-tolerant threshold (V1 value reported in §4.1 at camera-ready)" + "a small numerical tolerance ε to avoid floating-point edge-cases." Recommend the soften route.

### B6. paper §3.6 "five tools" claim then lists SIX
**Source:** comment-analyzer BLOCKER-4.
**Location:** `paper/apex-neurips-workshop-2026.md:141`.
**Issue:** "the other five tools (Granite-Docling 258M, Granite Vision 4.1 4B, Granite 4.1 8B Instruct, Langflow, the Docling library, and IBM Bob)" — six items listed but called "five tools." Plus paper §3.5 says "Spec Layers 1, 2, 6, 7, 8 are infrastructure" — five layer numbers but six tools (Layer 1 contains Docling + Docling library + Vision). Math breaks: §3.5 + §3.6 + canonical 8-tool list don't tile.
**Fix:** Rewrite §3.6 to: "The full pipeline uses eight IBM Granite tools. Two of them (Granite TimeSeries TTM r2.1 as the forecaster, and Granite Guardian 4.1 as the audit gate) host the APEX contributions; the other six (Granite-Docling 258M, Granite Vision 4.1 4B, the Docling library, Granite 4.1 8B Instruct, Langflow, IBM Bob) are infrastructure adopted from the published IBM Granite stack."

### B7. paper §2 + §10 cite "§9" (now §13 References after wave-24 renumbering)
**Source:** comment-analyzer BLOCKER-5.
**Locations:** `paper/apex-neurips-workshop-2026.md:55` ("web-accessible product pages cited in §9") + `:237` (paper §1+§2+...+§9 authorship). When wave-24 added §9 Acks + §10 Author contributions + §11 COI + §12 Funding, original §9 References shifted to §13. Two cross-references didn't follow.
**Fix:** §2 → "cited in §13"; §10 → expand to "§1, §2, §3, §5, §6, §7, §8 prose authorship; §9 Acknowledgments + §10 Author contributions + §11 COI + §12 Funding; §13 References compiled jointly."

### B8. PLAN rows 2.9+2.10 + Shared Contracts still describe single-stage QP
**Source:** plan-gap-scanner BLOCKER-1.
**Locations:** PLAN row 2.9, 2.10, Shared Contracts row "Physics-projection output" line 309.
**Issue:** Row 2.9: "CvxpyLayer QP V2 replaces NumPy validator" (single-stage). Row 2.10: "Granite Guardian audits text log" (no mention of feasibility-filter intermediary). Shared Contracts: single `(corrected_tensor, violation_log)` shape. Vinh implementing from PLAN ships single-stage, paper misrepresents the codebase.
**Fix:** Split row 2.9 into 2.9a (Stage 1 convex QP) + 2.9b (Stage 2 post-projection feasibility filter). Expand row 2.10 Guardian audit to consume both Stage outputs. Extend Shared Contracts physics-projection row to `{stage_1_qp_output, stage_2_feasibility_log}`.

### B9. PLAN closure-tag orphans (no cross-ref to wave-23 findings doc)
**Source:** plan-gap-scanner BLOCKER-2.
**Issue:** PLAN cites wave-23 closure IDs (B1, B2, B3, B4, H1, H5, H8, M3, etc.) but no row points the reader at `docs/wave-23-cold-review-findings.md`. Same orphan applies to `docs/wave-22-cold-review-findings.md` + `docs/wave-22-cold-review-brief.md`.
**Fix:** Add "Cold review findings index" sub-section under PLAN §Sources of truth listing all three cold-review docs.

---

## HIGHs (close in wave-25)

| ID | Source | Location | Summary |
|---|---|---|---|
| H1 | Codex HIGH | paper §3.2:99 | Forward-Euler equation `speed_t = speed_{t-1} + a_long_{t-1} Δt` pins speed_t to prior-step constants; doesn't couple current decision a_long_t. Fix index. |
| H2 | Codex HIGH | paper §3.2:91 | "convex (second-order cone) constraint" — friction ellipse written as quadratic inequality, not SOC norm form. Clarify equivalent SOC representation `norm([a_lat/(μy g), a_long/(μx g)]) ≤ 1`. |
| H3 | Codex HIGH | paper §3.4 | COA novelty: post-hoc threshold audit is structural feasibility check, not novel optimization. Reframe as "COA document schema is parsed into a tensor-level regulatory input that parameterizes downstream feasibility audit behavior." |
| H4 | Codex HIGH | paper §3.6 | Contribution scope creep: "TTM + projection QP + post-projection feasibility filter + Guardian audit" expands beyond Abstract's 3-tuple. Fold feasibility filter into projection implementation detail. |
| H5 | gemini Q2 | pitch + Q&A + persona | Pitch script Beat 4+5 + Q&A Card 2 + Sarah persona all still bundle bicycle/COA into QP. Propagate two-stage split. |
| H6 | gemini Q4 | PLAN row 6.7 + Stretch S10 | Owner says "Stephen + Vinh" jointly; paper §10 claims specific split (Stephen §1-3,5-12 / Vinh §4). Reconcile. |
| H7 | gemini Q6 | README + PLAN + methodology | Commit count actual 195, surfaces say 194+. Drift again. Sweep. |
| H8 | gemini Q10 | paper line 15 | Plain-language summary "corrects every prediction / obeys vehicle physics" unbounded — contradicts wave-24 Abstract+§1+§5.3 softening. Realign. |
| H9 | comment-analyzer HIGH-1 | README:84 | "Apache 2.0, Hugging Face Space hosted" present-tense contradicts wave-24 "Coming Day 9" badge. |
| H10 | comment-analyzer HIGH-2 | paper §3.5:137 | "Spec Layers 1, 2, 6, 7, 8" lists six tools across five numbers without explaining. |
| H11 | comment-analyzer HIGH-3 | paper §10 | Author contributions attributes unshipped backend work to Vinh in present tense (FastAPI, projection.py, etc.); creates comment-rot risk if APEX Lite triggers. Soften to "scheduled to ship per PLAN.md by camera-ready." |
| H12 | comment-analyzer HIGH-4 | paper §9 Acks | Thanks "operators of veteran motorsport rehabilitation programmes who informed the audience definition" — borderline-leaks consent. Rephrase to thank "publicly documented community materials produced by veteran motorsport rehabilitation programmes." |
| H13 | comment-analyzer HIGH-5 | README:255 | "NeurIPS Workshop paper draft ✅" contradicts PLAN row 6.7 🟡. Flip README to 🟡. |
| H14 | comment-analyzer HIGH-6 | paper §4 | Orphan `### 4.6 Reproducibility` with no §4.1-4.5 siblings. Plus §7 duplicates §4.6 ~80%. Add subsection headers OR move §4.6 into §7. |

---

## MEDs (close in wave-25 where cheap)

| ID | Source | Summary |
|---|---|---|
| M1 | code-reviewer | brand-fonts JSDoc enumerates 3 narrowings (data, name, lang); BrandFont actually narrows 5 (also required weight + style). Add the two missing. |
| M2 | code-reviewer | "strict subset" loose vocabulary for TS audiences. Replace with "strict subtype" + assignment-direction caveat. |
| M3 | comment-analyzer | methodology line 71 "Artifacts (current state through wave-24)" — wave-number inside artifact narrative rots at wave-25. Date-stamp instead. |
| M4 | comment-analyzer | paper §6 "We demonstrate the pattern on adaptive-driver motorsport telemetry" — present-tense without §4 tables. Soften to "We describe / We propose." |
| M5 | comment-analyzer | paper §4.6 + §7 reproducibility ~80% duplication. Dedupe by moving §4.6 content into §7 OR keep §4.6 short pointer. |
| M6 | comment-analyzer | paper footer "night-late-late-3" colloquial suffix unprofessional for NeurIPS submission. Strip. |
| M7 | gemini Q7 | ε=0.01 + 0.3g threshold are prose-to-code drift in waiting. Add to arch-spec + PLAN Shared Contracts row (or B5 soften-route). |
| M8 | gemini Q8 | PLAN row 6.7 paper-section enumeration missing §4. Add. |
| M9 | plan-gap-scanner WARN | PLAN row 6.7 status note bleeds commit-message detail (specific section list + closure tags). Compress + cross-ref findings doc. |
| M10 | plan-gap-scanner WARN | PLAN row 6.8 remaining work missing M6 (README §1 first-claim footnotes). Add. |
| M11 | plan-gap-scanner WARN | ID-scheme drift D0.1-D0.7 vs 0.1-0.19 still open. Unify. |
| M12 | plan-gap-scanner NIT | Citation convention inconsistent across rows 6.5 / 6.7 / 6.8. Pick one. |

---

## NITs (Day-11 polish queue)

| ID | Source | Summary |
|---|---|---|
| N1 | code-reviewer | "documented idiom" claim slightly overstated in wave-24 commit message. No code fix. |
| N2 | comment-analyzer | README:83 "transatlantic veteran motorsport rehabilitation programmes" — implies cross-Atlantic. Either "UK + US" or just "veteran motorsport rehabilitation programmes." |

---

## Closure order (wave-25)

Per atomic-commit discipline + minimum cross-file rebase risk:

1. `docs(reviews): wave-24 cold review findings consolidated` (this file).
2. `fix(paper): Abstract + §1 two-stage projection-and-audit + §3.6 counting fix + §9→§13 cross-refs + §1 cite-Day-11 placeholder (B1, B3, B6, B7)`.
3. `fix(paper): §3.2 normalization + thresholds softening + Forward-Euler index fix + SOC clarification + COA novelty restatement + scope tighten (B4, B5, H1, H2, H3, H4)`.
4. `fix(paper): plain-language summary realignment + §3.5 layer enumeration + §10 author contributions tense-shift + §9 Acks rephrase + §4 subsection headers + §6 We-describe softening + §4.6+§7 dedupe + footer suffix strip (H8, H10, H11, H12, H14, M4, M5, M6)`.
5. `fix(spec): architecture-spec Layer 4 two-stage propagation (B2)`.
6. `fix(plan): rows 2.9+2.10 split + Shared Contracts row update + Cold-review-findings index + row 6.7 owner split + row 6.7 enumeration + row 6.8 remaining + ID-scheme + citation-convention (B8, B9, H6, M8, M9, M10, M11, M12)`.
7. `fix(pitch,qa,persona): two-stage propagation to Beat 4+5 + Q&A Card 2 + Sarah persona (H5)`.
8. `chore(docs): commit-count sweep to actual + README L84 HF Space tense + README Phase 6 emoji + methodology wave-stamp date (H7, H9, H13, M3)`.
9. `refactor(frontend): brand-fonts JSDoc 5-narrowing enumeration + strict-subtype precision (M1, M2)`.

Then Day-11 polish per Stephen's directive (M6 README first-claim headings + M12 Track Titan WebFetch verification + N4 BibTeX placeholder final sweep + N6 normalization explicit note + Figure 1 embed + Table 1/2/3 skeletons).

---

_Last updated: 2026-05-21 night-late-late-4 by Stephen (wave-24 cold review consolidated; 5-agent dispatch; closures landing in wave-25 same session)._
