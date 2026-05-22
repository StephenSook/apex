# Wave-23 cold review findings

> Stephen-requested cold review on wave-23 (paper expansion + 3 MED closures + README polish). Dispatched 2026-05-21 night-late-late-3. Five parallel agents + mechanical Bash sweep. All returned within ~10 minutes. Findings consolidated below; closures land atomic in wave-24 (this same Stephen session).
>
> Brief that dispatched: implicit per Stephen's directive ("code review on wave 23"). Lenses chosen to match wave-23 surface: paper prose + small frontend code edits + README + 3 MED closures.

---

## Lenses dispatched

| Lens | Subagent type | Returned |
|---|---|---|
| 1 | `pr-review-toolkit:code-reviewer` | 1 HIGH + 2 MED + 3 NIT (frontend code: runtime exports + brand-fonts comment) |
| 2 | `pr-review-toolkit:comment-analyzer` | 1 BLOCKER + 3 HIGH + 7 MED + 6 NIT (paper + README prose + brand-fonts comment) |
| 3 | `cc-gemini-plugin:gemini-agent` | 1 HIGH + 3 HIGH-drift + 4 MED (cross-file consistency between paper + pitch + README + spec + PLAN + methodology + persona) |
| 4 | `codex:codex-rescue` | 3 BLOCKER + 3 HIGH + 5 MED (adversarial pass on paper claims, including web-research verification of competitor + citation claims) |
| 5 | `plan-gap-scanner` | 4 BLOCKER + 3 WARN + 3 NIT (PLAN.md drift post-wave-23) |
| Bash mechanical sweep | em-dash + AI-tone blocklist + en-dash + smart-quote + operator-attribution + tsc | Clean (no violations) |

---

## BLOCKER (close in wave-24)

### B1. Paper §3.2 QP convexity claim is false
**Source:** codex BLOCKER #1.
**Location:** `paper/apex-neurips-workshop-2026.md:108-114` (§3.2 last paragraph) + lines 88-114 (constraint enumeration).
**Issue:** Paper claims the projection layer is a convex QP wrapped by CvxpyLayer. Two listed constraints are not convex: `throttle_t * brake_t = 0` is a complementarity constraint (the feasible set is nonconvex; midpoint of two feasible points is infeasible), and `a_lat = speed^2 / L * tan(theta)` is a nonlinear equality. CvxpyLayer is convex-only. A NeurIPS workshop reviewer with QP background will flag this within 60 seconds.
**Fix:** Reformulate §3.2 with the QP carrying only convex constraints (friction ellipse + linear bounds + forward-Euler + jerk bound). Move the bicycle-model equality and the COA-simultaneity gate to a post-projection feasibility filter that runs after the QP solve. Add a §3.2-bis note explaining the architectural split: convex QP for the main projection + a feasibility-audit stage for the nonconvex constraints.

### B2. Bicycle-model equation is only conditionally valid + not enforceable as a convex equality
**Source:** codex BLOCKER #2.
**Location:** `paper/apex-neurips-workshop-2026.md:101-104`.
**Issue:** `a_lat = speed^2 / L * tan(theta)` is the kinematic bicycle approximation that holds only at low slip angles + with a specific steering definition. Paper does not specify whether `steering_rad` is steering-wheel angle, road-wheel angle, or slip-corrected steer. At racing speeds, tire slip makes the equality fragile.
**Fix:** Label as "low-slip kinematic approximation" with citation. Specify `steering_rad` is the road-wheel angle (matching common control-theory convention). Move enforcement to post-projection feasibility audit per B1.

### B3. §7 + §4.6 Reproducibility claims provenance + HF Space + Convergence-14 in PRESENT TENSE but backend is `.gitkeep` only
**Source:** codex BLOCKER #3, comment-analyzer HIGH H-1, gemini HIGH H2.
**Location:** `paper/apex-neurips-workshop-2026.md:166` (§4.6) + `:212` (§7) + `:183` (§5.2 BYOC rules path) + multiple §3.3 + §4 references.
**Issue:** Paper claims "Every coaching report produced by the pipeline carries a provenance footer," "the Convergence 14 unit-test suite is the in-repository safety contract," "pytest app/backend/tests/test_serializer.py" runs the suite. Reality: `app/backend/` contains only `.gitkeep`. `app/backend/apex/guardian/rules/` does not exist. PLAN rows 4.2 (Convergence-14), 5.1 (HF Space), 5.7 (provenance footer) are all ⬜. NeurIPS reviewer cloning the repo at submission gets `file not found`. DQ-grade for a reproducibility-claiming paper.
**Fix:** Tense-shift §4.6 + §7 + §5.2 + §3.3 to forward-looking with PLAN-row pointers. Pattern: "Every coaching report **will carry** a provenance footer (target Day-9 ship per PLAN row 5.7); the Convergence-14 unit-test suite **lands at** `app/backend/tests/test_serializer.py` by Day-7 Gate G7." Keep the spec descriptive but anchor each forward-looking claim to a dated PLAN row. Alternative: hold the paper until the backend lands.

### B4. §6 generalization overreach contradicts own §8 Ethics
**Source:** gemini BLOCKER B1.
**Location:** `paper/apex-neurips-workshop-2026.md:199-205` (§6 generalization four-domain list).
**Issue:** §6 lists "Patient-vitals forecasting. Physiology-bound constraints (BP, HR, SpO2 ranges)" as a generalization example. §8 Ethics (line 218) explicitly disclaims medical-advice scope: "We do not claim the pattern is sufficient for higher-stakes safety surfaces (medical advice, financial decisions, judicial outcomes) without domain-specific re-validation." §6 directly contradicts §8. Additionally, the three-clause "In every case, the foundation model stays frozen, the regulatory or physical-law constraints stay parameterizable at inference time, and the audit gate carries a unit-tested safety contract" rhythm is the global-CLAUDE.md-flagged AI-tone tell ("three-item parallel marketing clauses").
**Fix:** Rewrite §6 (a) demote to hypothesis-with-caveat ("We hypothesize the pattern extends ..."); (b) drop the patient-vitals bullet entirely; (c) rewrite the closing three-clause into single-clause prose to avoid the AI-tone rhythm.

### B5. PLAN.md drift post-wave-23 (4 BLOCKER findings from plan-gap-scanner)
**Source:** plan-gap-scanner #1-4.
**Locations:** PLAN.md row 6.7 + row 6.8 + footer last-updated line + no wave-23 row for M3+M5+M16.
**Issue:**
- Row 6.7 (NeurIPS paper) still describes "6-page scaffold" (wave-23 expanded to publication-readable).
- Row 6.8 (README final polish) still ⬜ (wave-23 substantially pulled forward).
- Footer last-updated says "after 19 review waves + wave-19 mega-batch" (waves 20-23 missing).
- Wave-23 MED closures (M3 + M5 + M16) have no PLAN-row cross-reference (compare wave-22's cross-references inside rows 5.14 + 5.15 + 6.5).
**Fix:** Flip 6.7 + 6.8 status notes to reflect wave-23 state. Bump footer. Add cross-references for M3+M5+M16 to the relevant PLAN rows (6.7 for paper, 6.8 for README, runtime decls land under 5.14 banner-related). Bump commit count from 165+ to 189+.

---

## HIGH (close in wave-24)

### H1. Misattributed Chronos-on-car-following citation (desk-reject-class)
**Source:** comment-analyzer BLOCKER B-1 (tiered HIGH here because it is a paper-specific citation hygiene fault, not a publication blocker today).
**Location:** `paper/apex-neurips-workshop-2026.md:53` (§2 Related Work).
**Issue:** Paper cites "Chronos applied to car-following (Garza et al., cite Day 11)". Actual authors are **Zeng & Yan, 2025** (arXiv 2501.07034). "Garza et al." is the TimeGPT-1 paper (Garza & Mergenthaler-Canseco, 2023), unrelated. Citing wrong authors in §2 is a NeurIPS-workshop-desk-reject-class hygiene fault.
**Fix:** Replace with "Chronos applied to car-following (Zeng and Yan, 2025) [arXiv:2501.07034]". Add BibTeX entry to §9 with correct authors + venue + year.

### H2. Reproducibility paths point at empty backend
**Source:** comment-analyzer H-1 + H-2.
**Location:** `paper/apex-neurips-workshop-2026.md:166` + `:183` + `:212`.
**Issue:** Paths `app/backend/tests/test_serializer.py` + `app/backend/apex/guardian/rules/` do not yet exist. Closed jointly by B3 tense-shift.

### H3. brand-fonts.ts comment cites wrong filename (`satori.d.ts` does not exist)
**Source:** code-reviewer HIGH H1 + comment-analyzer NIT N-1.
**Location:** `app/frontend/lib/brand-fonts.ts:5-7`.
**Issue:** Comment says upstream Font type lives at `next/dist/compiled/@vercel/og/satori/satori.d.ts`. Actual file is `index.d.ts`. Plus the underlying name is `FontOptions`, re-exported as `Font` via `export { FontOptions as Font }`. Plus the `next/dist/compiled/...` path is Next-private and will rot across minor versions.
**Fix:** Correct to `next/dist/compiled/@vercel/og/satori/index.d.ts` exports `FontOptions` (re-exported as `Font`). Add a "private compiled path, unstable across Next.js minor bumps" caveat. Tighten "structurally compatible" to "strict subset of next/og's Font option struct" per code-reviewer M1.

### H4. README banner alt text verification
**Source:** comment-analyzer H-3.
**Location:** `README.md:3`.
**Issue:** Alt text says "IBM Granite attribution" — verify the rendered PNG actually carries that attribution. (Banner footer DOES say "Built on IBM Granite - 8 tools, all load-bearing" per visual inspection, so alt text is accurate; closure = note + move on.)
**Fix:** No edit; verification only. The alt text matches the rendered footer text.

### H5. Abstract contribution (1) overscope vs §1 bounded firsts
**Source:** gemini HIGH H1.
**Location:** `paper/apex-neurips-workshop-2026.md:19` (Abstract last sentence).
**Issue:** Abstract contribution (1) says "the differentiable physics-projection layer as a post-hoc add-on to any frozen TSFM" - universal-quantifier scope wider than §1 line 42's bounded firsts. Future polish must not let the Abstract re-introduce the wave-22-softened claim ambiguity.
**Fix:** Rewrite Abstract contribution 3-tuple to match §1's three bounded firsts: (1) first application of a pretrained TSFM to adaptive motorsport telemetry, (2) the COA-parameterized simultaneity gate as the first public AI race-engineer workflow we found that reads FIA Certificate of Adaptations data as a binding regulatory input, (3) Granite Guardian text-audit as a load-bearing, unit-tested safety contract.

### H6. Commit count drift across README + PLAN + methodology
**Source:** gemini HIGH H3a/H3b/H3c.
**Location:** `README.md:258` (186+), `PLAN.md:56` + `:498` (165+), `docs/methodology.md:71` + `:118` (179+).
**Issue:** Actual `git log --oneline | wc -l` returns 189. Five surfaces, four stale numbers.
**Fix:** Sweep to "189 atomic commits across Day 1 + Day 2" everywhere.

### H7. §2 "All commercial tools encode `throttle * brake = 0`" not publicly verifiable
**Source:** codex HIGH #4.
**Location:** `paper/apex-neurips-workshop-2026.md:55`.
**Issue:** Codex web search found Track Titan + Trophi.ai public docs do not document an explicit `throttle * brake = 0` mutual-exclusion constraint. Paper claim is presented as fact but is an inference from product behavior. D-004 research-tool discipline applies.
**Fix:** Soften to "public materials we found do not document support for COA-aware brake-throttle simultaneity; none of the tools surveyed documents explicit conditional removal of the mutual-exclusion assumption."

### H8. §8 Ethics statement insufficient for future real-driver evaluation (NeurIPS standard)
**Source:** codex HIGH #5.
**Location:** `paper/apex-neurips-workshop-2026.md:216-218`.
**Issue:** Current §8 covers synthetic-persona-no-real-driver-data well, but does not commit to IRB / institutional-exemption determination, informed consent, withdrawal rights, or per-surface release consent for any future real-driver telemetry or COA collection study. NeurIPS ethics guidelines require this explicit forward commitment even when current work uses only synthetic data.
**Fix:** Add forward-commitment paragraph: "No human-subject evaluation is reported in this work; any future real-driver telemetry or COA study will require IRB or institutional exemption determination, written informed consent with explicit withdrawal-rights documentation, per-surface release consent for any artifact derived from the data, and an updated Ethics section in any revision reporting such evaluation."

---

## MED (close in wave-24 where cheap, queue rest for Day-11)

| ID | Source | Location | Summary |
|---|---|---|---|
| M1 | code-reviewer M1 | brand-fonts.ts | "structurally compatible" claim overstates; closed jointly with H3 |
| M2 | code-reviewer M2 | 5 opengraph-image.tsx | `runtime` export placement non-idiomatic; move after `contentType` |
| M3 | comment-analyzer M-1 + M-2 | paper Status + footer + §4 | Strip project-internal wave/gate/stretch nomenclature ("wave-22", "S10", "Day-2 Gate G4 spike") from paper body for research-paper voice |
| M4 | comment-analyzer M-3 | README + persona | Price claim drift (low-to-mid-hundreds vs £400-500 vs £500); pick one |
| M5 | comment-analyzer M-4 | paper §3.6 | "Each load-bearing" contradicts "other five tools are infrastructure"; reconcile frame |
| M6 | comment-analyzer M-5 | README §1 AI approach | "First" claims unbounded vs paper §5.3 bounded; mirror via footnote |
| M7 | comment-analyzer M-6 | README badge | "Hosted Hugging Face Space" links to generic Spaces hub; swap to "Coming Day 9" or drop |
| M8 | comment-analyzer M-7 | README Phase 0 row | ✅ vs PLAN.md 🟡 emoji disagreement |
| M9 | gemini MED M3 | paper §3.5 + payload | "Granite 4.1 Instruct" drops the 8B in 2 places; canonical is "Granite 4.1 8B Instruct" per pre-mortem row 3 |
| M10 | gemini MED M2 | paper §3.5 | Layer numbering 1-3 (paper) vs 1-8 (spec) needs cross-reference parenthetical |
| M11 | gemini MED M3 / comment-analyzer NIT N-4 | paper §8 Ethics | `~/.claude/projects/.../memory/...` path leak; replace with `docs/sarah-reynolds-persona.md` |
| M12 | gemini MED M4 / codex M20 still open | paper §2 | Track Titan claim verification (web search confirmed no public throttle*brake=0 documentation) |
| M13 | codex MED + comment-analyzer NIT N-5 | paper §9 BibTeX | 3-4 entries fillable today: Deep Dynamics (Chrosniak/Ning/Behl arXiv 2312.04374), Chronos car-following (Zeng/Yan arXiv 2501.07034), Track Titan + Trophi.ai as web sources; plus Granite Guardian version pin verification (3.0 vs 4.1) |

## NIT (Day-11 polish queue)

| ID | Source | Location | Summary |
|---|---|---|---|
| N1 | code-reviewer N1 | 6 ImageResponse routes | `"nodejs"` is documenting the default; commit body covers rationale (no change) |
| N2 | code-reviewer N3 | bemyapp-banner/route.ts | console.error pre-existing (not wave-23 introduced) |
| N3 | comment-analyzer N-3 | paper §6 | Imperative-future voice on un-validated generalizations; closed by B4 |
| N4 | comment-analyzer N-5 | paper §9 | "..." and "[citation pending]" placeholders are desk-reject risk; add pre-camera-ready PLAN checklist line |
| N5 | comment-analyzer N-6 | README:260 | "Calibration ceiling" line publishes internal win-probability estimates; drop or move to PLAN |
| N6 | comment-analyzer N-2 | paper §3.1 + §3.2 | throttle_pct (0-100) vs brake_pa (1e6 magnitude) require explicit normalization sentence |
| N7 | plan-gap-scanner NIT-9 | PLAN row 6.7 file path | Verify post-wave-23 filename matches PLAN reference (no rename observed) |
| N8 | plan-gap-scanner NIT-8/10 | PLAN status snapshot header + wave count | Bump "last sync 2026-05-21 PM" + footer "19 review waves" |

## Completeness gaps (NeurIPS workshop reviewer expectations)

| Section | Status | Action |
|---|---|---|
| Acknowledgments | Missing | Add §10 before References. Acknowledge IBM Granite team + FastF1 maintainers + FIA for public regulations + hackathon organizers. |
| Author contributions | Missing | Add brief paragraph. Stephen = frontend + pitch + paper narrative; Vinh = backend + ML pipeline + paper §4 experiments. |
| Conflicts of interest | Missing | "The authors declare no conflicts of interest. Both authors are undergraduate students at Kennesaw State University; no commercial sponsorship." |
| Funding | Missing | "Unfunded student work submitted to the IBM SkillsBuild AI Builders Challenge May 2026." |
| Figure 1 | Referenced in §3.5 but not embedded in paper | For camera-ready: embed exported SVG/PNG of the architecture diagram (`docs/architecture.svg`) directly in the paper. |
| Table 1/2/3 numbering | §4 references "Table 2", "Table 3a/3b/3c" without empty skeletons | Add empty table skeletons so §4 prose is internally consistent pre-Vinh-fill. |

---

## Mechanical sweep results (wave-23 changed files)

```
EM-DASH SWEEP: clean
BLOCKLIST SWEEP: clean
EN-DASH + SMART QUOTES: clean
OPERATOR-NAME SWEEP: clean (one "NeuroPit-depth" reference in README is the depth standard, not a team name)
BANNER FILE EXISTS: deliverables/bemyapp-banner-1920x600.png, 113640 bytes
TSC: clean
```

---

## Closure order (wave-24)

Sixteen atomic commits planned, ordered for minimal cross-file rebase risk:

1. `docs(reviews): wave-23 cold review findings consolidated` (this file).
2. `fix(paper): §3.2 QP convexity + bicycle model as post-projection feasibility filter (B1, B2)` — biggest single edit; load-bearing for paper credibility.
3. `fix(paper): tense-shift reproducibility claims to forward-looking (B3, H2)` — §4.6 + §7 + §5.2 + §3.3.
4. `fix(paper): §6 generalization demote to hypothesis-with-caveat; drop patient-vitals (B4)` — drops one bullet + rewrites closer to single-clause.
5. `fix(paper): correct Chronos-car-following citation Garza → Zeng & Yan; fill 4 BibTeX entries (H1, M13)`.
6. `fix(paper): abstract contributions tightened to §1 bounded firsts (H5)`.
7. `fix(paper): §2 Track Titan / Trophi.ai claim softening (H7)`.
8. `fix(paper): §8 Ethics IRB + informed consent + withdrawal rights forward statement (H8)`.
9. `fix(paper): strip project-internal wave nomenclature from research-paper body (M3, M11)`.
10. `fix(paper): Granite 4.1 8B Instruct canonical form (M9, paper §3.5 + payload line 62)`.
11. `fix(paper): §3.6 load-bearing vs infrastructure reconcile (M5)`.
12. `fix(paper): §3.5 layer numbering cross-reference + §3.1/3.2 normalization note (M10, N6)`.
13. `feat(paper): add Acknowledgments + Author contributions + COI + Funding (workshop completeness)`.
14. `fix(frontend): brand-fonts comment correct filename + tighten compat claim (H3, M1)`.
15. `refactor(frontend): runtime export placement after contentType (M2)`.
16. `fix(docs): commit count drift sweep + PLAN drift fix + remove calibration ceiling + README softening (B5, H6, M4, M6, M7, M8, N5, N8)`.

Then wave-24 session memory + APEX MOC sync.

MED queue M12 (Track Titan WebFetch verification) + N4 (BibTeX placeholder sweep) close at Day-11 final pass.

---

_Last updated: 2026-05-21 night-late-late-3 by Stephen (wave-23 cold review consolidated). Five-agent dispatch + Bash mechanical sweep; closures landing in wave-24 same session._
