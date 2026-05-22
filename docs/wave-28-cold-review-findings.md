# Wave-28 cold-review findings (closed in wave-29 self-review)

Wave-28 shipped 3 atomic commits closing Vinh-Perplexity-research findings (BLOCKER cross-surface COA-derived wording sweep + jerk >=10Hz Rajamani caveat) + landing the MME Motorsport consent receipt + naming sweep across 3 public-facing surfaces. Subsequent self-review (3 parallel agents: codex-rescue + pr-review-toolkit:comment-analyzer + plan-gap-scanner) found wave-28 under-shipped on cross-surface coverage. This file consolidates the wave-28 findings + the wave-29 closure batch.

Note: this findings doc was created post-wave-28 in wave-29 closure. Wave-28 itself did NOT have its own findings doc; PLAN cold-review findings index was retroactively populated by wave-29 commits.

## Tally

**14 BLOCKER + 10 HIGH + 8 MED + 4 NIT** found by 3-agent self-review.

## BLOCKERs closed in wave-29

### B-W28-1 SHIPS-BREAKING. C14-04 corrupted object literal

`app/frontend/lib/convergence-fixtures.ts:78` C14-04 fixture lost its `summary:` key during the wave-28 jerk-caveat edit. Left an orphan string literal between `title:` and `violation_class:`. Invalid TypeScript object syntax. `tsc --noEmit` + `next build` would hard-fail; CI would go red on the wave-28 commit `d5c9cef` push.

**Closed:** wave-29 commit 1 (ships-breaking, landed before any other wave-29 work).

### B-W28-2 LANDING PAGE missed in wave-28 COA-wording sweep

`app/frontend/app/page.tsx:272-275` Sarah hero block + line 423 Differentiator 02 body both carried "supplier name pending per-surface consent" placeholder + "Article 18.3 of Appendix L is the authoritative document" prose AFTER wave-28's MME consent was received + after the BLOCKER sweep was supposed to remove Article 18.3 references. Most-visible public surface. Critical wave-28 miss.

**Closed:** wave-29 commit 2.

### B-W28-3 /judges PAGE Sarah fixture line missing MME naming

`app/frontend/app/judges/page.tsx:151` Sarah-fixture descriptor on /judges did not name MME despite consent grant.

**Closed:** wave-29 commit 2 (page.tsx swept).

### B-W28-4 AnalyzeFlow.tsx mock data carried old citation strings

`app/frontend/components/AnalyzeFlow.tsx:81, 90, 98, 106, 125` + line 79 mock-report Old-Hairpin recommendation prose: every citation field carried `{fia_article: "Appendix L Art. 18.3", coa_section: "Section 3(c)"}` + the brake-throttle reasoning prose said "the COA permits the brake-throttle simultaneity you are running." Mock data is rendered on /analyze (judges-facing demo path).

**Closed:** wave-29 commit 2. Citations updated to `{fia_article: "Appendix L", coa_section: "Section 3(c) hardware spec"}`. Reasoning prose rewritten to COA-derived c_overlap framing.

### B-W28-5 app/shared/types.ts JSDoc carried Article 18.3 examples

`app/shared/types.ts:92` FIAAdaptationDomain.section_id JSDoc example "3.a, 3.c referencing Appendix L Article 18.3.2(a)" + lines 217-222 Citation interface JSDoc example values `"Article 18.3.2(c)"` + `"Section 3(c)"`. Type-level docs are the most-load-bearing surface for downstream contributors (Vinh's Pydantic mirror reads from types.ts).

**Closed:** wave-29 commit 2. JSDoc examples rewritten to safe forms clarifying that section IDs are local to the parsed driver-specific COA document, not FIA-internal article numbering.

### B-W28-6 SUBMISSION.md carried Article 18.3 live

`SUBMISSION.md:77` "binding force under Article 18.3 of Appendix L." Submission overview file is one of the surfaces a judge reads.

**Closed:** wave-29 commit 2. Rewritten to "anchored to FIA Appendix L... APEX parses the COA at onboarding, derives the c_overlap flag from approved hand-control hardware specifications recorded inside it..."

### B-W28-7 deliverables/bemyapp-submission-payload.md missing MME attribution

consent-log.md §1 claimed BeMyApp Story block is one of 4 approved surfaces. bemyapp-submission-payload.md has no Sarah-persona-specific MME attribution in the Story block; consent-log claim is currently overstated.

**Status:** OPEN. Stephen-lane decision per new Q-009 (whether to add MME naming to the BeMyApp Story block, and what wording). Defer to Stephen synthesis.

### B-W28-8 deliverables/demo-video-storyboard.md (3-min) carried Article 18.3 + Section 3(c) wording

`deliverables/demo-video-storyboard.md:40` overlay "2017-12 - FIA Article 18.3"; `:64` Beat 5 "Sarah's COA Section 3(c) text excerpt"; `:66` Beat 5 zoom "the COA Section 3(c) text. Highlight the simultaneity permission language"; `:73` Beat 6 callout "Section 3(c)" + "COA section citation". Long-form 3-min storyboard distinct from the 30s storyboard (which was swept in wave-28).

**Closed:** wave-29 commit 2. Beat 2 overlay softened to "FIA Appendix L revision; specific date verified at camera-ready"; Beat 5 + Beat 6 rewritten to "hardware-spec text from Section 3(c) of her synthetic COA" + "APEX parses her Certificate of Adaptations, derives the simultaneity flag from her approved hand-control hardware specifications, and feeds it to the model at the tensor level."

### B-W28-9 deliverables/apex-demo.ipynb mock data carried Article 18.3.2(c) + "Section 3(c) permits" verbatim

`deliverables/apex-demo.ipynb` ~7 mock-data citations across cells (lines 93, 124, 128, 141, 153, 162, 173). Colab notebook is the zero-install demo path published Day 9 (per PLAN row 5.4); judges who hit a HF Space issue fall back to Colab.

**Closed:** wave-29 commit 2 via sed sweep. Article 18.3.2(c) -> Appendix L; "COA Section 3(c) permits hand-control range adjustment" -> "COA-derived c_overlap flag (from the hand-control hardware spec in Section 3(c) of the synthetic COA) permits hand-control range adjustment"; "COA simultaneity gate honoured under Section 3(c)" -> "COA-derived c_overlap flag honoured (derived from approved hand-control hardware specifications)."

### B-W28-10 + B-W28-11 Test fixtures pinned stale citation strings

`app/frontend/components/__tests__/TuningCard.test.tsx:13, 38, 39` + `CoachingReport.test.tsx:20, 44`. Tests assert exact rendered citation strings; updating mock data without updating tests breaks the tests. Both files now match new mock data.

**Closed:** wave-29 commit 2.

### B-W28-12 bemyapp-banner.tsx rendered "Section 3(c) - simultaneity permitted" sticker text on the actual BeMyApp banner

`app/frontend/lib/bemyapp-banner.tsx:295` ImageResponse banner renderer drew a sticker reading "COA Section 3(c) - simultaneity permitted." Sticker is rendered onto the BeMyApp banner image judges land on first.

**Closed:** wave-29 commit 2. Sticker text now reads "COA hardware spec - simultaneity derived."

### B-W28-13 + B-W28-14 Personal-name leak (MME corporate sender + CC contact on public-repo surfaces)

`README.md:44` + `docs/stakeholder-outreach-log.md:29` + `docs/outreach-drafts/adaptive-supplier-consent-day-1.md:3` + `docs/pre-mortem.md:65` all named the MME corporate sender + CC contact on public-repo surfaces (personal names redacted from this finding-summary post-wave-34; original names retained only in `docs/consent-log.md` §1 audit trail). consent-log.md §1 approved citation form is corporate-only ("MME Motorsport" or "MME Motorsport d.o.o."); personal sender + CC names stay in the audit-trail consent-log only.

**Closed:** wave-29 commit 3. Personal-name redaction sweep with `docs/consent-log.md` §1 retained as the audit-trail surface that keeps the verbatim quote + sender + CC.

## HIGHs closed or in-progress in wave-29

### H-W28-1 + H-W28-2 (comment-analyzer) Sarah persona internal contradiction (lines 42 + 63)

Persona lines 42 + 63 still said "Section 3(c) permits brake + throttle simultaneity" + "Section 3(c) explicitly permits the brake-throttle overlap" while lines 73-74 + 93 used the wave-28 COA-derived framing. Direct contradiction inside the same file.

**Closed:** wave-29 commit 2. Lines 42 + 63 rewritten to "COA-derived c_overlap flag (APEX derives this flag from the approved hand-control hardware specifications recorded in Section 3(c) of her synthetic COA; the flag is set true because her MME Motorsport dual-stage trigger pattern is documented in that hardware spec as permitting simultaneous brake-throttle actuation)."

### H-W28-3 (comment-analyzer + Codex) "UK drivers running MME hardware" pattern claim unverified

`docs/sarah-reynolds-persona.md:20` + `docs/consent-log.md` line 55 asserted "consistent with the real adaptive-racing-community pattern of UK drivers running MME hardware." Asserted without primary-source citation.

**Status:** OPEN. Soften pending wave-29 wave-30 closure (need research-tool verification or honest softening to "MME ships adaptive hand-controls globally").

### H-W28-4 (comment-analyzer) December 2017 single-seater-ban-lift date asserted across 6+ surfaces without primary-source anchor

Paper §13 line 334 already has "Specific article citation verified at camera-ready" hedge. README + 3-min pitch + 30s storyboard + 3-min storyboard + paper §1 + paper §2 all assert "December 2017" or "lifted in December 2017" or similar as fact. Date itself needs verification; H-04 catches the bare-date claim without primary-source anchor.

**Closed (partial):** wave-29 commit 2 softened the 3-min storyboard Beat 2 overlay to "FIA Appendix L revision; specific revision date verified at camera-ready against the live Appendix L PDF." Other surfaces remain bare "December 2017." Soften pending wave-30 closure.

### H-W28-5 (Codex) Paper §3.2 jerk_max = 30 m/s^3 contradicts arch-spec + fixtures at 8 m/s^3

Paper line 107 said "j_max = 30 m/s^3" while arch-spec line 139 + C14-04 sample log + wave-27 reconciliation locked at 8 m/s^3.

**Closed:** wave-29 commit 4 (paper §3.2 jerk_max updated to 8 m/s^3 with explanatory note + cross-reference to §5.4 sampling-rate caveat).

### H-W28-6 (plan-gap-scanner) PLAN status snapshot + footer don't mention wave-28

**Closed:** wave-29 commit 4.

### H-W28-7 (plan-gap-scanner) No `docs/wave-28-cold-review-findings.md` exists

**Closed:** wave-29 (this file).

### H-W28-8 (plan-gap-scanner) No PLAN row tracks pending methods-doc commit 3 from Vinh's adoption design

`docs/plans/2026-05-22-physics-ttm-methods-adoption-design.md` §4 Commit 3 proposed landing `paper/physics-ttm-methods.md` companion methods spec. Wave-28 landed commits 1 + 2 + 4 only. Commit 3 is in limbo.

**Closed:** wave-29 commit 4. PLAN row 6.7c added with deps + acceptance criterion.

### H-W28-9 (plan-gap-scanner) Q-006 closure scope incomplete

Q-006 resolution language didn't explicitly say "personal naming of the MME corporate sender or CC contact is NOT in scope." (Personal names redacted from this finding-summary cell post-wave-34 per anonymisation-pre-consent rule.)

**Closed:** wave-29 commit 4. Q-006 resolution clause extended.

### H-W28-10 (plan-gap-scanner) No new Q-008/9/10 for MME-derived Stephen-lane decisions

(a) MME acknowledgement language for deck + video credits + README acks section; (b) MME naming in BeMyApp Story block; (c) MME attribution on /judges page.

**Closed:** wave-29 commit 4 (Q-008/9/10 added).

## MEDs (closed or queued)

- M-W28-1 (Codex MED M-01): timestamp timezone inference logged as "ET" without verification. Soften consent-log to "Outlook displays viewer-local; Stephen's machine ET inferred." Queued wave-30.
- M-W28-2 (Codex MED): Sarah persona "Compliance notes" line 91 said anonymized pending Q-006, contradicting line 20 named MME. Rewrite to surface MME consent + still-anonymized programmes. Closed in wave-28 already.
- M-W28-3: outreach-draft signature block "[school address]" placeholder needs post-send-sanitization label. Queued wave-30.
- M-W28-4 (Codex MED): demo-storyboard "MME Motorsport" vs "MME Motorsport d.o.o." naming-convention drift. Standardize. Queued wave-30.
- M-W28-5: pre-mortem row 17 scope clarification (MME outreach was scoped to MME only; other programmes are out-of-scope, not "pending replies"). Closed in wave-29 commit 3.
- M-W28-6 (Codex): row 6.5 pre-mortem cross-references don't extend to wave-27/28 entries. Queued wave-30.
- M-W28-7 (Codex): Shared Contracts FIA citation format row still says "Article 18.3.2(c)" example. Queued wave-30.
- M-W28-8 (Codex): Hard Compliance Rules - "No invented FIA Article numbers" should cite wave-28 specifically. Queued wave-30.

## NITs (queued wave-30)

- N-W28-1: convergence-fixtures.ts top-of-file comment "2 serializer-integrity round-trips" reads as if outside the 3-stage pipeline.
- N-W28-2: june-bridge Beat 5 parenthetical density.
- N-W28-3: PLAN ID-scheme drift "row 6.7 split" vs "row 6.7a/6.7b split."
- N-W28-4: footer wave-attribution paragraph readability decay.

## Closure status

**wave-29 atomic commits shipped:**
1. C14-04 syntax error (SHIPS-BREAKING)
2. Cross-surface frontend + deliverables + persona sweep (BLOCKERs B-W28-2/3/4/5/6/8/9/10/11/12 + HIGHs H-W28-1/2 + partial H-W28-4)
3. Personal-name redaction (BLOCKERs B-W28-13/14)
4. Paper §3.2 jerk_max alignment + PLAN gaps closure + wave-28 findings doc + Q-006 closure scope + Q-008/9/10 new opens + row 6.7c + 2.9a/2.9c jerk caveat (HIGHs H-W28-5/6/7/8/9/10)

**Still queued for wave-30 or beyond:**
- B-W28-7 BeMyApp Story MME attribution (Q-009 Stephen-lane decision)
- H-W28-3 UK-MME pattern verification or soften
- H-W28-4 December 2017 date verification across remaining 5+ surfaces
- M-W28-1/3/4/6/7/8 + all NITs
