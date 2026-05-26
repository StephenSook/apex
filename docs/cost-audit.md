# APEX cost-audit · Sookra Methodology rolling spend trace

Per PLAN §17.10 + global CLAUDE.md cost-discipline. Pull-forward Day 2 night-late draft of the Day-11 evening `usage-audit` skill run. Final numbers commit at PLAN row 6.6 acceptance criterion (Day 11 evening); the document below is the structural shell + the Day-2 rolling snapshot.

**Purpose.** [DRAFT, pending Day-11 evening codeburn snapshot] - per-build-day cost figures backing the IBM Consulting outreach email on Day 12 and the NeurIPS paper draft's cost-efficiency claim. Also a transparency artifact for the judges page (links from `/judges` planned Day 11).

**Method.** Codeburn CLI (`codeburn status` + `codeburn optimize`) produces the canonical numbers. Snapshot saved to this file. If any single project line exceeds $20 / day, that line surfaces as a pre-mortem.md entry per PLAN row 6.6 acceptance criterion (c).

**Convention.** USD throughout. Dates ISO 8601. Per-day numbers are wall-clock build-day spend, not cumulative.

---

## Day-by-day snapshot

| Build day | Date | Codeburn project spend | Cached prefix hit % | Lessons saved to memory |
|-----------|------|------------------------|----------------------|--------------------------|
| Day 1 | 2026-05-20 | -- (snapshot at Day 11 evening per PLAN 6.6) | -- | `feedback_galaxy_ambition_no_deferrals.md`, `feedback_research_tool_discipline.md`, `feedback_atomic_commit_discipline.md`, `feedback_em_dash_zero_tolerance.md`, `feedback_quality_over_speed.md` |
| Day 2 | 2026-05-21 | -- (snapshot at Day 11 evening per PLAN 6.6) | -- | `feedback_three_brain_review_pattern.md`, `feedback_privacy_sweep_three_surfaces.md`, `feedback_anonymization_pre_consent.md`, `feedback_discriminated_unions_over_contradiction.md`, `feedback_propagation_full_repo_sweep.md` |
| Day 3 | 2026-05-22 | -- | -- | `feedback_plan_mode_trigger_proactive.md`, `feedback_read_before_edit_bash_inspection_distinction.md`, `feedback_propagation_within_file_sweep.md` |
| Day 4 | 2026-05-23 | -- | -- | `feedback_ci_green_per_push_verify_or_cascade.md`, `feedback_research_escalation_protocol.md`, `feedback_competitor_deep_dive_protocol.md`, `feedback_no_time_pressure_restraint.md` |
| Day 5 | 2026-05-24 | -- | -- | `feedback_persona_not_hardcoded_in_ui.md`, `feedback_exhaustive_tool_inventory_before_every_task.md`, `feedback_claude_code_auto_mode_classifier.md`, `feedback_llm_output_compliance_scrubber.md`, `feedback_vercel_mcp_deployment_workflow.md`, `feedback_cascade_fix_forward_discipline.md` |
| Day 6 | 2026-05-25 | -- | -- | `feedback_nextjs16_dynamic_ssr_false_client_only.md`, `feedback_react19_set_state_in_effect_workarounds.md`, `feedback_useState_lazy_init_hydration_footgun.md`, `feedback_g4_fail_pivot_documented_then_executed.md`, `feedback_external_review_triangulation_load_bearing.md`, `feedback_conceptual_stack_vs_shipped_stack.md`, `feedback_byte_equality_regression_guarantee_not_killshot.md`, `feedback_replace_all_substring_trap.md` |
| Day 7 | 2026-05-26 | -- | -- | `feedback_quality_over_speed.md` (research-cycles extension per Stephen explicit 2026-05-25 night-2 verbatim; wave-46 D-058) |
| Day 8 | 2026-05-27 | -- | -- | -- |
| Day 9 | 2026-05-28 | -- | -- | -- |
| Day 10 | 2026-05-29 | -- | -- | -- |
| Day 11 | 2026-05-30 | -- (canonical snapshot) | -- | -- |
| Day 12 | 2026-05-31 | -- | -- | -- |
| Total | -- | -- | -- | 27+ feedback memories accumulated across the 12-day window through Day 7 (8 net-new wave-44/45/45.5 Day 6; 1 amendment Day 7 wave-46) |

---

## Method per the Day-11 canonical run

The Day-11 evening codeburn run executes the following commands and commits the verbatim output to this file. The run is not a one-shot at the end; it is the rolling snapshot updated daily by whoever runs the evening session-end memory write (PLAN row 5.10 + session-end protocol in global CLAUDE.md).

```bash
codeburn status --json > docs/cost-audit-snapshots/$(date -u +%Y-%m-%dT%H%MZ).json
codeburn optimize --json >> docs/cost-audit-snapshots/$(date -u +%Y-%m-%dT%H%MZ).json
```

The latest snapshot lands under `docs/cost-audit-snapshots/`. The latest-snapshot's structured findings are summarized below the table.

---

## Pattern findings (running, updated Day 2 night-late)

Three patterns observed across Day 1 + Day 2 that we believe will drive most of the cost:

1. **Three-brain HARD RULE review-wave compounds.** Each cold-review wave dispatches 4 parallel subagents (codex-rescue + gemini-agent + plan-gap-scanner + pr-review-toolkit:comment-analyzer) plus a manual sweep. Per `feedback_three_brain_review_pattern.md`, this is load-bearing for catching architectural drift. The cost of dispatching the four agents is amortized by avoiding a desk-reject-class submission. Honest tradeoff: 5x token consumption on review nights vs. catching the wave-23 -> wave-24 -> wave-25 propagation pattern that re-surfaced single-stage QP language across 12 surfaces.
2. **Read-before-edit + propagation full-repo sweep are cheap; their absence is expensive.** Per `feedback_propagation_full_repo_sweep.md`, when closing a propagation-type cold-review finding (architectural reformulation that ripples across multiple surfaces), running `grep -rn "<old-phrase>" --include="*.md" .` before per-surface edits is essentially free (under 1 second wall-clock, under 200 tokens). The cost of NOT doing it is the wave-N+1 review re-surfacing the same finding as net-new BLOCKERs, which doubles closure work.
3. **Atomic-commit discipline tools (lint-before-commit triplet + commit-push-pr skill) keep the per-commit cost low.** Without the discipline, batching 8 logical changes into one mega-commit feels cheaper but turns hostile under review.

The Day-11 canonical codeburn snapshot will verify or refine these three findings.

---

## What the numbers feed

- **IBM Consulting cold email (Day 12 afternoon, PLAN row 7.4).** Concrete per-build-day spend figures support the "free at the point of use for adaptive racers" claim with real economics. Honest numbers; no waving.
- **NeurIPS Workshop paper §10 Author contributions (PLAN row 6.7a).** The paper's discussion of token-efficient + cache-warm engineering is one paragraph; the per-day spend signal supports it.
- **Pre-mortem rollback paths (PLAN row 6.5).** If any single project line exceeds $20 / day, that pattern enters pre-mortem with a mitigation.
- **Post-submission engineering retro (PLAN row 7.6).** The 12-day spend total becomes the methodology trace's "what we actually cost" figure.

---

## Open questions

- **Codeburn project granularity.** Does codeburn separate frontend tsc + lint + vitest spend from backend pytest spend? We need per-lane numbers to support the "15 IBM tools each earning their slot" claim (per wave-46 D-058 expansion from the wave-30 D-016 12-tool baseline). If codeburn aggregates the whole repo, we will need to add per-lane labels manually.
- **OpenRouter + IBM watsonx vs. Anthropic API mix.** Today the build is all Anthropic via Claude Code. Lite-mode contingency at `docs/apex-lite-contingency.md` switches to a single watsonx.ai API call for Granite Instruct narration. The cost-audit will need to show both lines.
- **Codeburn's "optimize" findings.** Whatever it suggests Day 11 evening gets prioritized by Stephen+Vinh against the remaining Day-12 capacity. Most optimizations are deferred to the engineering retro rather than committed Day 12.
