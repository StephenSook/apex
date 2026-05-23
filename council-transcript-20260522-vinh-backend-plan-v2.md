# LLM Council Transcript — Vinh Backend Plan v2 (Wave-30 Maximal Architecture Lock)

**Date:** 2026-05-22 (Day 3)
**Mode:** TECHNICAL
**Subject:** `docs/vinh-backend-plan.md` after Stephen's wave-30 rewrite
**Question:** Can a solo dev on Windows 11 + RTX 4060 actually ship this plan in the remaining ~9 days?

---

## Framed question

Vinh's solo backend implementation plan covers a 12-day hackathon (deadline 2026-05-31; today is 2026-05-22 Day 3) on Windows 11 + RTX 4060. Stephen rewrote the plan on 2026-05-22 to reflect the wave-30 "Maximal Architecture Lock" (decision-log D-009 through D-027): D-027 Day-3 SCP go/no-go gate replaces G0; three-track forecast ensemble (TTM r2.1 + FlowState + Chronos-2); 8-tier physics in unrolled SCP; cvxpylayers locked; 12-tool Granite stack; LangGraph + MCP + ContextForge orchestration; tri-agent Agent-as-Judge critic; APEX-Bench public benchmark + LIPS 4-axis evaluation; tensor contract grew from (B, 24, 1) to (B, 30, 14). V2/V3 "stretch" labels retired.

Specific sub-questions: (1) D-027 in 6h realistic? (2) Three-track + 8-tier SCP + LangGraph + tri-agent + APEX-Bench achievable, or is "galaxy ambition with V1 NumPy ship-floor" code for "you will be on the floor by Day 9"? (3) Highest-leverage de-scope if D-027 wobbles? (4) Internal inconsistencies between gate map and phase tables that will burn time?

---

## Files read for grounding

- `docs/vinh-backend-plan.md` (the plan)
- `docs/decision-log.md` (D-009 through D-027 wave-30 architectural locks)
- `research/wave-30/README.md` (synthesis sources)
- `CLAUDE.md` (project context)
- `paper/physics-ttm-methods.md` (NeurIPS workshop methods companion)

---

## Round 1 — Advisors

### Contrarian

Plan tells you it will fail. L88 admits D-027 is "6h time-box, blocks everything"; L89 routes fallback to D-A revision — wave-30 collapses to V1 NumPy. Plan's gate map predicts non-trivial probability of total architectural rewrite Day 3. Not a hackathon plan; a research bet. Fallback ladder undefined — L51 says "drop to 2 SCP iterations + trust-region penalty if 3 oscillates"; never defines "oscillates" quantitatively. Sequencing broken: G6.5 (cvxpylayers Windows fallback) is Day 4 EOD, but D-027 Day 3 needs cvxpylayers + 8-tier Pacejka already working. Task 0.4c calls cvxpy install "deferred" with `--no-build-isolation` hedge. L94 references `(batch, 24, 1)` — pre-wave-30 contract — while L64 G9 requires `(B, 30, 14)`. Single source-of-truth file has wrong shape.

**Highest-leverage de-scope: kill the three-track ensemble (FlowState + Chronos-2).** Central NeurIPS claim per wave-30/README.md L23 is "frozen-TSFM + hard differentiable physics-projection composition" — that's TTM + SCP, not three forecasters fused. Tracks 2+3 are paper-padding consuming Day 4 EOD (G1c) and Day 9 (G9) for zero novelty gain. Cut them, reclaim ~2 days for D-027 to actually converge. Plan ships V1 NumPy by Day 9. Bet on it.

### First Principles Thinker

Strip the frame. IBM SkillsBuild judges score: working demo + IBM Granite usage + accessibility/impact + paper-grade novelty. They will not run `eval/Dockerfile`. They will not read APEX-Bench. D-027 is load-bearing for the **paper**, not the **submission**. Paper is downstream of the hackathon win, not upstream. Plan's own confession L414: "Council confidence is now the D-027 SCP convergence result... Everything else downstream of D-027." On Day 3, before a demo pixel exists, Vinh bet 9 days on a 6h spike of cvxpylayers + 8-tier Pacejka on Windows + RTX 4060. cvxpylayers on Windows might not *import* in 6h.

**Wrong question.** Should be: what makes Sarah + Granite + adaptive-hand-controls sing 3 minutes on video? V1 NumPy + frozen TTM + Guardian — D-A wave-25 baseline, explicitly preserved as APEX Lite per D-028. **De-scope: invert posture.** Build APEX Lite FIRST (Day 3-5), demo-complete by Day 7. Then attempt D-027 as Day 8-9 paper enrichment spike with hard quit timer. L51 says D-027 is 6h; L334 calls it "single most important checkpoint." A 6h spike cannot be both.

### Expansionist

Plan undershoots artifact half-life. Wave-30 README L23: "frozen-TSFM + hard differentiable physics-projection composition... confirmed absence in literature per Perplexity sweep." Worth more than the entire BeMyApp submission. Hackathon judges forget APEX by July. TestPyPI'd `physics-tsfm` + NeurIPS workshop paper compounds for years.

(1) **APEX-Bench buried.** D-026 = "APEX-Bench public benchmark + LIPS 4-axis evaluation." Reframe: ship APEX-Bench v0.1 as separate HuggingFace dataset card with own DOI (Zenodo, free, 5 min) by Day 9. (2) **Paper companion is afterthought.** `paper/physics-ttm-methods.md` should be spine of Day 8-10, not Day 11 polish. NeurIPS ML4PS / Differentiable Programming workshop deadlines typically late August. (3) **Frozen-TTM + CvxpyLayer composition has no prior art** — first-author publishable contribution hiding in hackathon repo.

**De-scope:** if D-027 wobbles, cut tri-agent critic + LangGraph before APEX-Bench / TestPyPI tag. Those are the 6-month tail. Orchestration is the 6-day tail.

### Outsider

A judge with 5 minutes won't survive this document. Plan opens "Galaxy ambition target: ship the maximal architecture per D-009 + wave-30 ceiling." Nine undefined proper nouns in one sentence. Document never explains what D-027 IS — only what passing it requires. What is SCP? "Pacejka linearization"? "Sarah Reynolds" — person, fixture, or both? Why "FCVR = 0.00"?

Dates contradictory: L5 window is "2026-05-21 (Day 2) → 2026-05-30 (Day 11)." Phase 1 labeled "Day 3 morning, parallel with Phase 2 start" but Phase 2 spans Days 3-5. Phase 0 has 14 tasks for ONE day.

**Can solo dev ship this in 9 days? No.** Plan states cut criterion itself: "solo dev + 10 days + Windows + CUDA + cvxpy is already ~18 honest days of work" (L224) buried in strikethrough. Author's own honest estimate.

**De-scope:** drop three-track + LangGraph runtime, ship V1 NumPy + frozen TTM + Guardian — the "ship-floor" the plan names. "Wave-30 Maximal Architecture Lock" reads like scope-creep dressed as decision. Council-trim overruled by same-day "lock" — red flag. L94 says "9 features" tiled to "(batch, 24, 1)"; L93 says "(batch, 30, 1)."

### Executor

Monday morning, keyboard cold. Tasks 0.4a-0.4c stack landmines: "Windows wants Visual C++ Build Tools; may need `--no-build-isolation`." Realistic Windows damage on fresh `pip install cvxpy cvxpylayers`: 1-3h before a line of SCP code. Eats 17-50% of 6h D-027 box before Vinh writes `forecast.py`, `validator.py`, or `projection.py` — none exist.

**(1) D-027 in 6h: NO as written.** Gate requires "TTM channel-mix forecast through SCP projection" but `forecast.py` is Day 4 work. Minimum viable: 50-line `scp_spike.py` hardcoding random `(B,30,14)` as fake-TTM-output, runs cvxpylayers QP with 8-tier Pacejka, calls `.backward()`, prints gradient norms. Plan does not name it.

**(2) Double-resolution bug.** D-027 Day 3; G6.5 Day 4 EOD. If cvxpy install dies Day 3 morning, G6.5 cannot save D-027 — ladder backwards. Pull G6.5 to **Day 3 hour 2**. Kill-switch L349 "Day 5 cvxpylayers convergence → walk D-027 ladder" duplicates Day 3 — collapse.

**(3) De-scope if wobbles:** cut 8-tier Pacejka *from the Day-3 spike, not the project*. Run constant-μ first, prove gradient flow, then swap in 8-tier.

**(4) Channel-count:** 0.10 says "9 features" but 1.9 says `(batch, 30, 1)`.

### Software Lead

**Hard contract bugs.** (1) Tensor-contract trichotomy: L94 `(batch, 24, 1)`; L93+L118 `(batch, 30, 1)`. Wave-30 = `(B, 30, 14)` but 14 channels never enumerated. `types.ts` defines 8 telemetry; D-015 lists 8 physics tiers; `coa_simul_permitted` is 1; nothing reconciles 8+1+? = 14. (2) Gate-date inconsistencies (G2 Day 5 vs Phase 1 Day 3; G6.5 Day 4 vs D-027 Day 3; Convergence-14 dual-listed; Phase 5/6 no G9/G10 rows). (3) Fixture/gate dependency inversion: Task 0.5 requires Sarah fixture; Task 3.2 creates it Day 6. (4) Task 4.1 "Langflow graph export" contradicts D-017 LangGraph runtime. (5) "Oscillates" undefined — pick residual non-decrease over 2 consecutive iterates ∪ ‖∇L‖ > 1e4. (6) `audit_id` provenance — `uuid4()` at `Guardian.audit()` entry. (7) Forward-Euler tolerance channel-specific.

**Framed:** D-027 in 6h marginal; maximal scope solo in 9 days = 4-engineer-month work.

**De-scope order:** Chronos-2 + FlowState → EAGLE-3 + aLoRA → tri-agent → GEPA. Keep SCP unrolled, Convergence-14, Sarah fixture, 8-tier in paper even if 3-tier in code.

**Bottom line:** plan structurally sound, locally inconsistent. Don't start Phase 0 until 30-min pre-edit lands.

### Long-Term Architect

Plan bakes three load-bearing walls that hurt past 2026-05-31.

**Wall 1 — cvxpylayers lock has no code-survival exit.** D-013 hard-rejects qpth + theseus. Only fallback (L157) is "ship V1 NumPy as floor... paper §3.2 can still cite QP formulation" — paper-survival, not code-survival. **Recommend `DifferentiableProjector` Protocol in `shared/contracts.py` Day 3, ~30 min, V1 NumPy / cvxpylayers / qpth / future Theseus all swap.**

**Wall 2 — contracts module born inconsistent.** L94 still `(batch, 24, 1)`; L93+L118 `(batch, 30, 1)`. Single source of truth launches self-contradicting.

**Wall 3 — gradient seam (D-020) at wrong altitude for multi-year project.** D-020 puts seam at SCP projector output. methods.md L70 frames projection as model-agnostic. If someone learns tire parameters end-to-end in 2026 Q4, seam blocks it.

**On D-026.** Day-11 ship of public benchmark with MLPerf tolerance bands is highest-debt — versioning, deprecation, contributor guidelines all missing. Tag v0.0.1-preview, "not yet stable" banner.

**D-027 in 6h:** achievable only if cvxpylayers imports clean on Windows. Realistic: 3h install + 3h prototype.

**Highest-leverage de-scope if D-027 wobbles:** cut APEX-Bench public release (D-026) before anything else. Longest tail, weakest Day-11 readiness. Paper can cite "benchmark forthcoming."

---

## Anonymization mapping

- A = Outsider
- B = Software Lead
- C = Expansionist
- D = Long-Term Architect
- E = First Principles Thinker
- F = Contrarian
- G = Executor

---

## Round 2 — Peer reviews

### Senior Engineer (PR reviewer)

1. **Strongest: G.** Only response anchored in Monday morning ground truth — names missing `scp_spike.py` artifact, quantifies VC++ install damage as 1-3h of 6h budget, catches G6.5/D-027 ladder wired backwards in time (Day 4 EOD cannot rescue Day 3 morning), proposes constant-μ-first decoupling.
2. **Devil's advocate: D.** Accepts maximal ambition but identifies load-bearing-wall problem: `DifferentiableProjector` Protocol costs 30 min Day 3 and makes V1/cvxpylayers/qpth/Theseus swappable forever.
3. **Biggest blind spot: C.** Optimizing for "artifact half-life" assumes the artifact ships. C never engages with whether D-027 will pass on Windows in 6h.
4. **All missed:** No response checks whether `ibm-granite/granite-timeseries-ttm-r2` weights are even *downloadable* on Vinh's network Monday morning, or whether HF cache + RTX 4060 VRAM + Windows CUDA toolchain triple actually loads the model. Add pre-D-027 G-0.5: "TTM-r2 loads + emits `(B,30,1)` tensor on this laptop" before any QP work.

### SRE / On-call

1. **Strongest: G.** Only response that thinks like 3am on-call. Names unscaffolded-module trap, prescribes 50-line `scp_spike.py` smoke test, pulls G6.5 to Day 3 hour 2.
2. **Devil's advocate: E.** Less technically granular than G but correct on **what gets paged demo night**. Judges page on no-demo, not on missing SCP convergence.
3. **Biggest blind spot: C.** Optimizing for artifact half-life when demo-night reliability is unaddressed.
4. **All missed:** No response defines the **demo-night runbook**: cached Sarah Reynolds trace as offline fallback, Granite timeout + circuit-breaker, Guardian fail-closed vs fail-open policy, no `audit_id` correlation across forecast/projection/Guardian logs, no pre-recorded 90-sec demo video as WiFi-dies rollback.

### Security Reviewer

1. **Strongest: D.** Names concrete supply-chain failure mode (cvxpylayers lock no code-survival exit). D-026's MLPerf tolerance claim correctly flagged as highest false-claim debt to IBM judges.
2. **Devil's advocate: C.** Zenodo DOI + HuggingFace dataset card is only response addressing **citable provenance** for APEX-Bench.
3. **Biggest blind spot: E.** Argues "judges won't run the Dockerfile" and pivots to demo theater. Most attribution-dangerous posture: polished 3-min video without substantiating eval harness makes every quantitative claim unfalsifiable.
4. **All missed:** (a) **MME Motorsport consent scope** — no documented data-handling boundary; (b) **COA PDF → JSON parser is untrusted-input boundary** (Pacejka coefficients into CvxpyLayer without range-validation = solver crash); (c) **OpenRouter + watsonx.ai dual-vendor** = two key-exfil surfaces, no rotation/fallback; (d) **Sarah Reynolds fixture must carry "fictional persona" watermark** in every artifact judges see.

### Junior Developer (curse-of-knowledge)

1. **Strongest: A.** Only response naming actual blocker for new contributor: "Nine undefined proper nouns in one sentence." Catches Phase-0-has-14-tasks-for-one-day reality.
2. **Devil's advocate: G.** Only one writing for a human at a cold keyboard. Proposes concrete artifact (`scp_spike.py`) unblocking D-027 without waiting for `forecast.py`.
3. **Biggest blind spot: C.** Wants Zenodo DOI by Day 9. Has not noticed plan can't pass G2 yet.
4. **All missed:** No glossary. No `ONBOARDING.md`. No single canonical tensor-shape definition file. Six advisors caught the L93/L94/L118 contradiction; zero proposed `contracts/shapes.py` as the fix-now artifact.

### Future Maintainer (6 months from now)

1. **Strongest: D.** Only response thinking like maintainer. `DifferentiableProjector` Protocol is single concrete extensibility win — 30 min Day 3 buys 18 months of swap optionality.
2. **Devil's advocate: C.** Only response optimizing for what survives past 2026-05-31. Zenodo DOI + HuggingFace dataset card are artifacts cited in 6 months.
3. **Biggest blind spot: E.** Strips frame to "what makes the video sing" — fatal for maintainers. APEX Lite + orphaned cvxpylayers branch = worst possible archaeological layering.
4. **All missed: the wave-30 14-channel schema has no versioning policy.** When channel 15 lands (tire pressure, weather), how do TTM weights / CvxpyLayer / Guardian / APEX-Bench / FCVR discover schema change? No `SCHEMA_VERSION` constant, no migration path. First thing to break in 6 months.

---

## Round 3 — Chairman synthesis

### Where the council agrees

1. **Tensor-contract trichotomy is a Day-3-morning hard bug.** F, A, B, D, G, and Junior peer all caught L93/L94/L118 disagreeing on `(B, 24, 1)` vs `(B, 30, 1)` vs wave-30-locked `(B, 30, 14)`. The 14-channel enumeration also doesn't exist anywhere.
2. **D-027 in 6h as written is not realistic on Windows.** F, E, A, G, B, D reached this independently: cvxpy/cvxpylayers VC++ install (G estimates 1-3h of 6h), unscaffolded modules (G), G6.5 fallback wired Day 4 EOD when D-027 is Day 3, no quantitative "oscillates" definition.
3. **G6.5 ladder is wired backwards in time.** F and G both noticed Day-4-EOD cvxpy-Windows-fallback cannot rescue Day-3-morning blocker.
4. **APEX-Bench public release (D-026) is highest-debt Day-11 item.** D + Security peer + F converged: versioning gaps, MLPerf false-claim risk, paper-padding.
5. **The "ship-floor" ladder exists and is named in the plan itself** — V1 NumPy + frozen TTM + Guardian (D-A wave-25 baseline preserved as APEX Lite per D-028).

### Where the council clashes

**F + G + B (maximal-architecture-locally-fixable).** Plan is structurally sound; bugs are local — fix `contracts.py`, pull G6.5 forward, add 50-line `scp_spike.py` with constant-μ before 8-tier, define "oscillates" quantitatively. D-027 recoverable. *Why reasonable:* only advisors engaged hour-by-hour with the keyboard.

**E (invert posture: ship Lite first).** D-027 is paper-load-bearing not demo-load-bearing. Build APEX Lite Day 3-5, demo-complete Day 7, then D-027 as Day 8-9 paper-enrichment spike with hard quit timer. *Why reasonable:* SRE peer correctly noted judges page on no-demo, not on missing SCP convergence.

**C + D (paper artifact half-life).** Optimize for what survives past 2026-05-31: Zenodo DOI'd APEX-Bench, TestPyPI tag, `DifferentiableProjector` Protocol seam. *Why reasonable:* D-003 (galaxy-tier scope) + wave-30 README L23 novelty claim explicitly target post-hackathon artifact value. D's Protocol is 30 min Day 3 for 18 months of optionality.

All three are internally consistent. They disagree about *what the project is for*, not about *whether D-027 is risky*.

### Blind spots the council caught

(a) **Frozen TTM may not load.** Senior Eng peer: no advisor checked whether `ibm-granite/granite-timeseries-ttm-r2` weights download on Vinh's network or whether HF cache + RTX 4060 VRAM + Windows CUDA loads the model. Upstream of cvxpy, upstream of SCP. Add G-0.5: "TTM-r2 loads + emits `(B, 30, 14)` on this laptop" as Day 3 hour 1.

(b) **No demo-night runbook.** SRE peer: cached Sarah trace as offline fallback, Granite timeout + circuit-breaker, Guardian fail-closed vs fail-open, no `audit_id` correlation, no pre-recorded 90-sec demo video as WiFi-dies rollback.

(c) **Security perimeter is unspecified at four boundaries.** Security peer: (i) MME consent has no documented data-handling scope; (ii) COA PDF → JSON is untrusted input feeding Pacejka coefficients into CvxpyLayer QP without range-validation; (iii) OpenRouter + watsonx.ai = two key-exfil surfaces, no rotation/fallback; (iv) Sarah Reynolds fictional-persona watermark missing.

(d) **No glossary / no `ONBOARDING.md` / no single `shapes.py`.** Junior peer: A correctly noted nine undefined proper nouns in one sentence. Zero advisors proposed `shared/contracts/shapes.py` as fix-now artifact.

(e) **No `SCHEMA_VERSION` for the 14-channel contract.** Future Maintainer peer: when channel 15 lands, how do downstream consumers discover the change? Convergence-14 freezes shape, not meaning.

### Steelman of the strongest minority view

**F's specific cut — kill the three-track ensemble — got zero peer reviewer pick.**

Steelman: wave-30 README L23 novelty claim is "frozen-TSFM + hard differentiable physics-projection composition" — singular TSFM, not ensemble. Tracks 2/3 (FlowState + Chronos-2 fusion) consume G1c (Day 4 EOD) and G9 (Day 9) for zero contribution to the central architectural-composition claim. They're forecast-accuracy improvements grafted onto a paper whose thesis is *composition*. Cutting them reclaims ~2 days, removes the fusion-head training and three-way agreement metric. The paper's methods section gets *cleaner*: one frozen TSFM through one differentiable projector is a sharper claim than three forecasters fused.

**Verdict: partially absorb.** Accept the analysis, defer the cut. Tracks 2/3 collide with Day 4 and Day 9, not Day 3 critical path. **Reserve F's cut as the first lever in the de-scope ladder**, to pull the moment D-027 slips past Day 3 EOD. Pre-committing today saves the Day-4 decision cost.

### Confidence call

**MEDIUM.** Single piece of evidence that would flip to HIGH-confidence-against-maximal: `pip install cvxpy cvxpylayers` on Vinh's Windows + Python 3.11 + RTX 4060 fails or takes >2h Monday morning. Single piece that would flip to HIGH-confidence-for-maximal: clean cvxpylayers import + `ibm-granite/granite-timeseries-ttm-r2` loads + emits `(B, 30, 14)` within 90 min of Day 3 start.

### The recommendation

**Can solo Vinh ship the maximal plan as written in 9 days? No.** A, G, and the plan's own L224 honest estimate agree. The maximal architecture as written assumes ~2x available labor. But the plan does *not* need to ship as written — D-028 names APEX Lite as preserved floor.

**D-027 6h gate: change, don't keep or kill.** Convert to two-stage Day 3 spike with explicit decoupling per G:
- Stage A (hour 1): G-0.5 TTM-r2 loads + emits `(B, 30, 14)` on hardware
- Stage B (hour 2): cvxpylayers imports clean on Windows (pulled-forward G6.5)
- Stage C (hours 3-6): `scp_spike.py` with hardcoded fake-TTM tensor, constant-μ friction ellipse (not 8-tier), single SCP iterate, prove `.backward()` flows + gradient norms print

8-tier Pacejka + full 3-iteration SCP move to Day 4. Keep the Day-3 *decision* (continue maximal vs fall to APEX Lite), shrink the Day-3 *technical bar*.

**Three-track ensemble: keep on roadmap, pre-commit to cutting if D-027 Stage C slips past Day 3 EOD.** F's analysis is correct but cutting today before Stage C result is premature. Pre-write the cut as first rung; Day-4 decision is mechanical.

**Maximal scope vs APEX Lite: maximal as paper bet, APEX Lite as demo certainty, both scaffolded in parallel from Day 3.** Reject E's full inversion (Future Maintainer peer correctly flagged Lite-first leaves maximal as orphaned archaeology). Reject pure-maximal (council consensus says it doesn't ship). The demo Vinh shows judges on May 31 must work with V1 NumPy. The paper Vinh submits to NeurIPS workshop must cite the maximal stack. These are not the same artifact; the plan keeps conflating them.

**Internal-inconsistency fix order — edit before any code today:**

1. `shared/contracts/shapes.py` (new file): single `TENSOR_SHAPE = (B, 30, 14)` constant + enumerated 14-channel table (or shrink wave-30 to `(B, 30, 9)` if 14 cannot be enumerated in 15 min). `SCHEMA_VERSION = "0.1.0"` constant.
2. `docs/vinh-backend-plan.md` L93, L94, L118: import from `shapes.py`.
3. Gate map: pull G6.5 to Day 3 hour 2 (rename "G0.6 cvxpy-Windows-import-smoke"); insert G-0.5 (TTM-r2 hardware load) as Day 3 hour 1; collapse duplicate Day-5 kill-switch row (L349).
4. D-027 definition: define "oscillates" as residual non-decrease over 2 consecutive iterates ∪ `‖∇L‖ > 1e4`.
5. Pull minimal Sarah Reynolds telemetry stub (10 rows, fictional-persona watermark) into Phase 0 fixtures so Task 0.5's FCVR=0.00 is evaluable Day 3.
6. Add `DifferentiableProjector` Protocol to `shared/contracts/` — 30 min, buys V1 NumPy ↔ cvxpylayers ↔ qpth ↔ Theseus swap forever.

Total pre-code budget: ~90 minutes.

### Ranked de-scope ladder

Cut first to cut last:

1. **Three-track ensemble (FlowState + Chronos-2 fusion).** F's catch. Saves ~2 days. Cut at Day 3 EOD if Stage C didn't print gradient norms.
2. **APEX-Bench public release (D-026).** D + Security peer. Keep internal eval harness; paper cites "benchmark forthcoming." Saves Day 9-10.
3. **Tri-agent Agent-as-Judge critic.** Collapse to single Guardian-Safety.
4. **LangGraph runtime + ContextForge orchestration.** Demote to Langflow facade. Saves Phase 4 Day 7.
5. **EAGLE-3 + aLoRA speculative decoding.** Granite default path works for demo.
6. **GEPA evolutionary prompt optimization.** Hand-tune three prompts.
7. **8-tier Pacejka inside the QP.** Drop to constant-μ in code; keep 8-tier in paper §3.
8. **Floor: V1 NumPy + frozen TTM + Guardian (APEX Lite per D-028).** Demo-night certainty.

### The one thing to do first

**Open `shared/contracts/shapes.py`, write the file, and commit it before opening any other file today.**

Contents: `from typing import Final; TENSOR_SHAPE: Final = (None, 30, 14); SCHEMA_VERSION: Final = "0.1.0"; CHANNELS: Final = [...14 named strings...]`. If you cannot enumerate all 14 channels in 15 minutes, shrink wave-30 to `(B, 30, 9)` (8 telemetry + 1 COA), update D-010, proceed.

Smallest action that simultaneously unblocks: the contract bug six advisors caught, the schema-versioning blind spot Future Maintainer caught, and the single-source-of-truth blind spot Junior caught. Costs <30 minutes. Everything else depends on the shape being right.

---

_Transcript saved 2026-05-22._
