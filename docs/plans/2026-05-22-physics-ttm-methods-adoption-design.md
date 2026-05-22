# PhysicsTTM methods doc adoption + three physics fixes

**Date:** 2026-05-22
**Author:** Vinh (with Claude)
**Lane:** Vinh (backend, methods spec, fixtures)
**Coordination:** Stephen reads on next session; no Stephen-lane restructure proposed
**Status:** Design ready for execution

## Section 1: Problem, source, and the three findings

### Problem

Stephen's wave-27 cold-review caught 6 physics-math BLOCKERs that lived in prose for 5+ waves before display forced verification (pre-mortem row 51). The fixes were correct but tactical, patching specific numbers without raising the rigor floor of the physics story. Meanwhile `paper/apex-neurips-workshop-2026.md` §3 carries the same physics claims as prose without a formal methods spec backing them.

### Source

Vinh's Perplexity research produced `physics-ttm-neurips-methods.md` (2026-05-22), a NeurIPS-grade methods specification covering the projection layer, vehicle-dynamics constraints, COA-derived semantics, evaluation metrics, ablations A1 to A8, and a limitations section. The doc includes inline citations to TTM (arXiv 2401.03955), OptNet (1703.00443), cvxpylayers (1910.12430), Rajamani vehicle dynamics, Deep Dynamics, FTHD, OpenF1, FastF1, MME Motorsport, Professional Motorsport World, and FIA Appendix L.

### The three findings that block on adoption

**1. BLOCKER, unsafe COA wording.** `convergence-fixtures.ts:132` C14-07 `expected_guardian_reason` cites "FIA Appendix L Article 18.3" and "COA Section 3(c)" as the source of the simultaneity permission. The methods doc §5 ("COA-derived semantics") is explicit: public FIA sources do not expose a discrete simultaneity field; the safe wording is "APEX derives a simultaneity flag from approved COA hardware specifications and adaptation metadata," and the unsafe wording is the one currently in code. C14-08 carries the same fault. Both surfaces violate CLAUDE.md hard-compliance ("No invented FIA Article numbers"). Wave-27 reviewers were doing math, not provenance, so it survived, but a wave-28 cold reviewer with a provenance focus will catch it.

**2. WEAK, jerk-bound at 1 Hz.** Methods doc §4 ("Steering-rate and jerk constraints") states rate constraints should activate at >=10 Hz; at 1 Hz, sub-second driver inputs are aliased and the constraint becomes theoretically suspect. C14-04 fires a jerk-bound clamp at 1 Hz mini-sector dt=1.0s. Defensible for a demo, but a NeurIPS reviewer reading paper §3 would push back.

**3. GAP, no yaw-rate consistency surface.** The methods doc §4 defines yaw-rate consistency `omega ~= v * tan(delta) / L` as a soft penalty `lambda_yaw * Phi_yaw` in the projection objective, cited to Rajamani. APEX currently has no surface for this. It is not in C14 (correctly, since it is a soft penalty, not a violation class) and not visible on `/judges`.

## Section 2: Proposed action

### What gets adopted from the methods doc

The full doc lands at `paper/physics-ttm-methods.md` (per its own §Recommended next file tasks). It becomes the formal companion to `paper/apex-neurips-workshop-2026.md`, the place a NeurIPS reviewer expects to see notation, equation derivations, ablation tables, and metric definitions. Stephen's paper §3 then cites it as the authoritative source rather than re-deriving inline.

### What gets fixed in code (Vinh lane)

Three commits, atomic.

**Commit 1: `fix(fixtures,paper,docs): COA-derived wording sweep + pre-mortem row`**

- `app/frontend/lib/convergence-fixtures.ts` C14-07 + C14-08: rewrite `expected_guardian_reason` to say *"COA-derived `c_overlap` flag from approved hand-control hardware specifications and adaptation metadata"* instead of citing a non-existent FIA Article 18.3 / COA Section 3(c).
- Same change to `sample_violation_log_excerpt`: replace `fia_article:"18.3" coa_section:"3(c)"` with `c_overlap:0` (or `1`) `derivation:hardware_spec`.
- Matching prose sweep on every surface that cites Article 18.3 or Section 3(c). Grep targets: `docs/`, `paper/`, `app/frontend/app/judges/page.tsx`, `app/shared/types.ts`, `deliverables/`. Each hit gets the same softening.
- Pre-mortem row added: "COA wording must derive from approved hardware specs, never cite a discrete FIA simultaneity field. Reason: methods doc §5 explicit, public FIA sources do not expose this field. How to apply: any new surface mentioning brake-throttle simultaneity gets the soft wording."

**Commit 2: `docs(arch-spec,fixtures): jerk-bound applies at >=10 Hz; C14-04 is demo-only`**

- `docs/architecture-spec.md` jerk_max section: add the caveat that rate constraints activate at >=10 Hz per Rajamani and standard vehicle-modeling practice, and that the C14-04 1 Hz fixture is a deliberate demo simplification for the hackathon, not the production path.
- `convergence-fixtures.ts` C14-04 `summary`: append "(1 Hz demo fixture; production telemetry at >=10 Hz)" so the surface is honest about the simplification.

**Commit 3: `docs(methods): land paper/physics-ttm-methods.md`**

- Copy `physics-ttm-neurips-methods.md` to `paper/physics-ttm-methods.md` (preserve filename pattern of paper/ directory).
- Strip the front-matter "Methods claim to defend" framing (research-process language, not paper language).
- Strip §"Recommended next file tasks" (scaffolding, not paper content).
- Keep all equations, citations, ablation table, metric definitions.
- Em-dash sweep before commit (CLAUDE.md hard-compliance). The source doc uses em-dashes throughout; they all need to become commas, semicolons, or sentence breaks.

### What does NOT change

- **C14 arity stays at 14.** D-A holds. No new fixture rows. Yaw-rate consistency lives as a projection-objective term (`lambda_yaw * Phi_yaw`) per the doc, not a violation class. C14-05 and C14-06 are untouched.
- **`/judges` page Convergence-14 grid stays as-is.** No new visual elements until Stephen reviews.
- **`docs/decision-log.md` D-A** does not change. The methods doc supports D-A rather than escalating it.
- **Tier-2 catalogue (tire load, weight transfer, aero, yaw moment fixtures)** is shelved to wave-29+. Today's leverage is the methods doc + the three fixes.

### Coordination posture

This is all Vinh-lane code work plus paper-companion documentation. No Stephen-lane surface gets restructured, only Stephen-authored prose with the unsafe Article 18.3 citation gets a surgical wording swap. Stephen reads on next session, approves the COA fix, and decides separately whether to (a) cite the new methods doc from paper §3, (b) add a "Projection objective terms" panel to `/judges`, (c) escalate tier-2 for a future wave. Those are his calls, not Vinh's.

## Section 3: Impact map and risks

### Files touched (precise scope)

| File | Change | Lines | Lane |
|---|---|---|---|
| `paper/physics-ttm-methods.md` | New file, adopted methods doc (em-dash swept) | +660 (full doc) | Vinh |
| `app/frontend/lib/convergence-fixtures.ts` | C14-07 + C14-08 `expected_guardian_reason` + `sample_violation_log_excerpt` rewording | ~8 lines edited | Vinh |
| `app/frontend/lib/convergence-fixtures.ts` | C14-04 `summary` appendix note | ~1 line edited | Vinh |
| `docs/architecture-spec.md` | jerk_max section caveat | ~3-5 lines added | Shared (Stephen-authored, Vinh-extending) |
| Grep sweep targets for `18.3` and `3(c)` | Any prose hit gets the soft wording | TBD by grep | Mixed |

### Surfaces to grep before commit 1

Every place "Article 18.3" or "Section 3(c)" appears needs the wording fix, or the next reviewer catches the drift. Wave-27 H-W27-5 was exactly the same pattern (commit count drift across three surfaces), one source of truth fixed without sweeping the others.

- `docs/architecture-spec.md`
- `docs/methodology.md`
- `docs/q-and-a-flashcards.md`
- `docs/sarah-reynolds-persona.md`
- `paper/apex-neurips-workshop-2026.md`
- `app/frontend/app/judges/page.tsx`
- `app/shared/types.ts` (variant enum docs)
- `deliverables/bemyapp-submission-payload.md`
- Any cold-review findings doc that quoted the old wording (these stay as audit trail; only live claims get rewritten)

### Risks

**1. Stephen has the old COA wording in his head.** He authored C14-07/08 and the `/judges` page blurb. If he re-edits a Stephen-lane surface tomorrow and re-introduces "Article 18.3" from memory, the fix regresses. Mitigation: the design doc + commit message + an explicit pre-mortem row capture the rule so the next cold review picks it up.

**2. Paper §3 may already cite Article 18.3.** If it does, that is a Stephen-lane edit Vinh should not make unilaterally. Mitigation: the grep above includes `paper/`. If `paper/apex-neurips-workshop-2026.md` shows hits, flag them in the design doc rather than editing. Stephen handles them on his next session.

**3. The methods doc has em-dashes throughout.** A naive copy violates CLAUDE.md hard-compliance. Mitigation: explicit em-dash sweep step in commit 3. Use Edit with `replace_all: true` for the obvious cases, then re-grep `paper/physics-ttm-methods.md` for em-dash to confirm zero hits before commit.

**4. The methods doc references files that do not exist yet.** §"Recommended next file tasks" suggests `logs/day-01-latency-bench.md` and `logs/day-physics-projection-fixtures.md`. Those are future Vinh work, not part of this design. Mitigation: strip the §"Recommended next file tasks" section when copying. It is research-process scaffolding, not paper content.

**5. C14-07 / C14-08 are referenced by `test_serializer.py` once that suite lands.** The wording change affects what the Guardian-verdict assertion compares against. Mitigation: this is Vinh's lane. The change happens before the test suite lands, so there is no breakage. `test_serializer.py` should assert the new wording, not the old.

**6. Coordination cost with Stephen if he objects to the methods doc location.** Mitigation: the design doc lives in `docs/plans/` and is committed; Stephen's pushback (if any) routes through the design doc, not the live `paper/` file.

### What this design does NOT cover

- The ablation table A1 to A8 from the methods doc is not actioned. It is a research artifact for the NeurIPS paper, not a hackathon-week deliverable. Stephen + Vinh decide separately whether to attempt it before 2026-05-31 or defer to a post-submission paper push.
- The synthetic-fixture dataset plan (§Dataset plan, F1 to F4) is not actioned. APEX already has its own fixture plan (C14 + Sarah Reynolds persona); the doc's F1 to F4 is an alternative, not a replacement.
- `paper/apex-neurips-workshop-2026.md` §3 does not get rewritten to cite the new methods doc. That is Stephen's call on his next session.

## Section 4: Execution sequence and verification

### Commit order (atomic, in dependency order)

| # | Commit | What it does | Verification before push |
|---|---|---|---|
| 1 | `fix(fixtures,paper,docs): COA-derived wording sweep + pre-mortem row` | Grep-driven rewording of `Article 18.3` + `Section 3(c)` across every surface. C14-07 + C14-08 expected_guardian_reason + sample_violation_log_excerpt rewritten. Pre-mortem row added. | `git grep -nE "18\.3\|3\(c\)"` returns zero hits in non-cold-review files. Cold-review docs keep their historical quotes (audit trail, not live claims). |
| 2 | `docs(arch-spec,fixtures): jerk-bound applies at >=10 Hz; C14-04 is demo-only` | arch-spec jerk_max section gets the rate-aliasing caveat. C14-04 summary appends the 1 Hz demo-only note. | Read arch-spec section + C14-04 summary back. Confirm caveat is honest, not defensive. |
| 3 | `docs(methods): land paper/physics-ttm-methods.md` | Copy `physics-ttm-neurips-methods.md` to `paper/physics-ttm-methods.md`. Strip §"Methods claim to defend" framing + §"Recommended next file tasks" scaffolding. Em-dash sweep with `replace_all`. | `git grep -c "—" paper/physics-ttm-methods.md` returns 0. Spot-check 5 equations render in markdown preview. Confirm all citations present. |
| 4 | `docs(plans): land 2026-05-22 physics-ttm-methods-adoption design` | This design doc lands at `docs/plans/2026-05-22-physics-ttm-methods-adoption-design.md`. | Em-dash sweep on this doc too. |

### Why this order

Commit 1 first because the COA wording is a live unsafe claim, closes a BLOCKER. Commit 2 second because it is tightly scoped and unblocks commit 3 (the methods doc references the jerk constraint and needs the arch-spec to be consistent). Commit 3 third because it is the biggest and least urgent. Commit 4 last because the design doc references all three preceding commits by hash.

### Verification gates between commits

After each commit: run `git status` (clean), `git log --oneline -1` (subject <=100 chars per CLAUDE.md atomic-commit rule), confirm push to remote succeeds. No git hooks per D-006, so verification is manual.

### Source-of-truth check after commit 3

The methods doc and `convergence-fixtures.ts` should agree on:

- Friction ellipse: methods doc K=8 polyhedral approximation, C14-01/02 polyhedral (consistent)
- Jerk bound: methods doc >=10 Hz caveat, C14-04 demo-only note (consistent after commit 2)
- COA simultaneity: methods doc §5 soft wording, C14-07/08 (consistent after commit 1)
- Bicycle model: methods doc kinematic+dynamic, C14-05/06 lat_g coupling (different angles, both valid; note in commit 3 message that yaw-rate consistency is the soft penalty path, lat_g coupling is the feasibility-filter path)

### Session-end Claude Memory write

Per D-005. Path: `Claude Memory/Session - 2026-05-22 - apex-physics-methods-adoption.md`. Captures: doc adoption decision, 3 fixes landed, pre-mortem row written, tier-2 deferred to wave-29+, Stephen-lane surfaces left untouched.

### Out of scope for this session

- Stephen-lane paper §3 rewrite to cite new methods doc
- `/judges` page "Projection objective terms" panel
- Tier-2 fixture catalogue (tire load, weight transfer, aero, yaw moment)
- Ablation A1 to A8 implementation
- `test_serializer.py` (already on PLAN row 4.2, separate work item)

## Section 5: Amendment (post-Stephen-goal-clarification, 2026-05-22 late)

### What changed

After committing sections 1 to 4 above, Vinh surfaced that Stephen's actual physics goal is **V2/V3 pull-forward**, not rigor consolidation. Evidence: `paper/apex-neurips-workshop-2026.md` line 97 explicitly tags load-dependent Pacejka tire model as "V3 (post-paper)" and the constant-mu to circuit-conditional-mu jump as "V2." Stephen's words paraphrased: "I thought we were limited to certain physics angles, then re-read my docs and saw stuff was held until post-hackathon."

The "post-hackathon" gate is Stephen's own conservative scoping in paper §3.2, not a technical or D-A constraint. He wants the option to pull V2 (and possibly V3) forward into the 2026-05-31 demo.

### What this means for the tier-2 framing in §2 and §4

Sections 1 to 4 above remain valid for:

- The BLOCKER (unsafe COA wording in C14-07/08), fix unchanged.
- The WEAK finding (jerk at 1 Hz caveat), fix unchanged.
- The methods doc adoption (`paper/physics-ttm-methods.md`), adoption is **more valuable** under V2/V3 pull-forward, not less, because the methods doc covers the math for the V2/V3 territory (load-dependent friction, dynamic bicycle, sequential convex for nonconvex extensions).

Sections 1 to 4 are **rescinded** on:

- The "tier-2 fixture catalogue shelved to wave-29+" framing. Tier-2 (tire load, weight transfer, aero, yaw moment) maps directly to Stephen's V2 (circuit-conditional / load-dependent friction) and V3 (Pacejka tire model). It should be on the table for Days 5 to 9, not deferred to wave-29+.

### Mapping tier-2 angles to Stephen's V2/V3

| Tier-2 angle | Paper version | Effort estimate | Demo-viable by Day 11? |
|---|---|---|---|
| Tire load sensitivity (mu drops with Fz) | V2 (line 97 "circuit-conditional lookup") to V3 (line 97 "Pacejka") | V2 = lookup table, ~1 day. V3 = sequential convex, ~3 days + convergence risk. | V2 yes. V3 borderline. |
| Weight transfer (long + lat) | V3-adjacent (not in paper today) | ~1 day for closed-form `dFz = m*a*h_cg/L` + fixture | Yes |
| Aero downforce vs speed | V2-adjacent (not in paper today; expands friction envelope by v^2 term) | ~1 day for `Fz_aero = 0.5*rho*Cl*A*v^2` + fixture | Yes |
| Yaw moment / steady-state yaw rate | Already in methods doc §4 as soft penalty `Phi_yaw` | ~0.5 day to land as projection-objective term in code | Yes |

Total estimate for **V2-only pull-forward (no V3 Pacejka):** 3.5 days of focused Vinh-lane work + Stephen prose updates to paper §3.2 + judges page. Fits in Days 5 to 8 if G0 to G3 pass on schedule.

### Revised execution sequence (proposed for Stephen sync)

Instead of the four commits in §4 standing alone, propose to Stephen this sequence at the 9 PM sync:

1. **Day 3 to 4:** Land §4 commits 1 to 4 (BLOCKER fix + methods doc + design). Unchanged.
2. **Day 5 to 6:** Vinh executes V2 pull-forward in `app/backend/apex/physics/`. Circuit-conditional mu lookup table + aero downforce term in friction ellipse. Stephen updates paper §3.2 line 97 to demote V2 from "future" to "shipped."
3. **Day 6 to 7:** Add `EXTENDED_PHYSICS_FIXTURES` catalogue (4 new fixtures: tire load + weight transfer + aero + yaw moment). Renders as second grid on `/judges`. Each fixture has a closed-form assertion in `test_serializer.py`.
4. **Day 8:** Decision point. V3 Pacejka pull-forward (add 3 days + convergence risk) or defer to post-paper. Default: defer. Q-004 APEX Lite trigger if V2 work blew the budget.

D-A is **not** touched. Convergence-14 grid is **not** touched (still 14, still locked). `EXTENDED_PHYSICS_FIXTURES` lives as a parallel catalogue, exactly as originally proposed before this design doc drifted into rigor-only territory.

### Risk this amendment introduces

**Scope creep before BLOCKER lands.** If Stephen reads this amendment and gets excited about V2/V3 pull-forward, he might push to start tier-2 work before commit 1 (COA BLOCKER fix) is even done. Mitigation: at sync, explicitly sequence the work. BLOCKER first, methods doc second, V2 pull-forward third. The amendment expands the menu without re-prioritizing the BLOCKER.

**Day 5 to 8 is also where Vinh's G3 + G4 + G5 gates land.** Tier-2 expansion competes with the load-bearing backend gates. Mitigation: tier-2 fixtures are display-only on `/judges` and `test_serializer.py` assertions. They share the same surface as G3 (round-trip serializer assertion). The work overlaps rather than competes if scoped to one fixture per day.

### What Vinh wants from the sync

A direct yes/no from Stephen on: "do we pull V2 (circuit-conditional + load-dependent mu + aero) forward into the 2026-05-31 demo, or hold V2 + V3 for post-paper as currently written?" His answer determines whether Vinh's Days 5 to 8 include tier-2 fixture work or stays focused on G3 to G5.
