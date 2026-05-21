# APEX - Pre-Mortem Journal

> A running journal of failure modes and mitigations. Started Day 2 per PLAN.md task 1.7. Pulled forward to Day 1 EOD per the galaxy-tier "everything ships" rule. Updated daily. Stephen owns the journal entry. Vinh contributes to backend / data / infra rows.
>
> Mirror of the Hometown convention `docs/build_audit_2026-05-03.md` pattern. Every failure mode logged. Every mitigation documented. Day 11 final polish becomes the Q&A defense reference.

---

## How to use this journal

Each row: `[Day] [Surface] [Failure mode] [Why it happens] [Mitigation] [Status]`.

Status legend: 🟡 actively mitigating · ✅ mitigation shipped · ⚠ accepted residual risk · ❓ unknown (not yet hit).

---

## Day 1 (2026-05-20) - observed failures

| # | Surface | Failure mode | Why it happens | Mitigation | Status |
|---|---------|--------------|----------------|------------|--------|
| 1 | Terminal paste | zsh interpreted line-wrapped clipboard paste as separate commands, breaking `gh repo create` chain twice | iTerm2 default soft-wraps long commands; pasted text retained newlines from markdown code block formatting | Tightened command form to single-line, then ran via Bash tool directly to bypass terminal paste | ✅ |
| 2 | Em-dash in prose | 2 em-dashes shipped to `docs/decision-log.md` from earlier writes | Default Claude prose habit | Manual `grep -rn "—"` sweep on Day 1 PM caught both, replaced with `.` + `:` substitutes | ✅ |
| 3 | Tool naming drift | "Granite Instruct" named 4 ways across files | Wrote the name from memory each time instead of pinning canonical form | Canonicalized to "Granite 4.1 8B Instruct" in prose; badge UI keeps abbreviated form | ✅ |
| 4 | Version drift | "Next.js 15" referenced 3 places, actual is 16.2.6 | PLAN.md written before `create-next-app` ran; never updated post-scaffold | Grep-and-replace across README + PLAN | ✅ |
| 5 | Code review lane | First attempt was Claude reviewing Claude's own frontend | Forgot the global three-brain HARD RULE on self-review | Routed to `codex:codex-rescue` + `pr-review-toolkit:code-reviewer` parallel | ✅ |
| 6 | Vinh-lane interference | About to scaffold `app/backend/` Python without Vinh's input | Galaxy-tier "everything ships" reflex overrode ownership table | Stephen flagged "don't interfere with Vinh" → backed off backend, kept to Stephen-lane only (frontend polish + docs + narrative + outreach) | ✅ |

## Forward-looking failure modes (anticipated)

| # | Day | Surface | Failure mode | Why | Pre-emptive mitigation |
|---|-----|---------|--------------|-----|------------------------|
| 7 | 1-2 | Vinh-side onboarding | Vinh installs npm/pnpm but his node version differs (currently node@22 on Stephen's box) | Node version drift across team | `app/frontend/.nvmrc` Day 2 + Vinh confirms node version in his TTM smoke log |
| 8 | 2 | Granite-Docling on real COA PDF | Granite-Docling 258M cold-start may take 10+ minutes on first parse; non-Latin scripts may fail | Granite-Docling is a 258M VLM with limited multilingual training data | Cache the parsed JSON at onboarding; pre-test on English-only fixture first; fallback to manual JSON if first FIA COA fails |
| 9 | 3-5 | CvxpyLayer QP non-convergence | Friction-ellipse + bicycle-model + COA-simultaneity constraints may produce infeasible solutions on edge-case telemetry | QP needs interior feasibility; some forecast traces will require constraint relaxation | V1: catch and log infeasibility, fallback to prior-lap baseline; V2: relax μ bound with explanation in Guardian audit |
| 10 | 4 | TTM zero-shot baseline worse than seasonal-naive | TTM was pretrained on weather + retail, not motorsport | Domain shift | If Gate G4 fails on 3+ of 5 holdout circuits, reframe pitch from "TTM forecasts pace" to "TTM forecasts envelope" + soften deck claim |
| 11 | 5-6 | Granite Guardian false-positive on legitimate engineering language | Guardian's safety classifier may flag "reduce brake force by 12%" as unsafe-recommendation | Guardian's policy boundaries vs engineering domain language | Convergence 14 serializer unit-test suite catches this; surface Guardian reasoning trace in UI; allow human-engineer override on flagged recommendations |
| 12 | 7 | Phase 1+2 stakeholder emails go dark | UK charity / nonprofit response times are typically 5-10 business days | Outreach is a slow channel | Day 7 escalation: LinkedIn DMs to Aaron Morgan + Bobby Trundley + Day-7 follow-up emails to non-responders |
| 13 | 8 | Demo loop > 60s on commodity hardware | DeepSeek engineering audit warned 15-32 min on CPU + 60s only on RTX 4060 | Granite-Docling + Guardian + Instruct end-to-end | Aggressive pre-cache of document parses at onboarding; live 60s budget is ONLY TTM + projection + Guardian + Instruct narration |
| 14 | 9 | Sim-rig (iRacing / ACC) crashes during 3-min video recording | Live sim-rig is the most fragile element of the demo | iRacing / ACC are not designed for live data export to external WebSocket | Record fallback video on Day 9 first thing; if live mode crashes during Day 10 production take, ship the canned replay |
| 9 | 9-10 | HF Space cold-start during judge eval | Free-tier HF Spaces sleep after 48h of inactivity | HF Space economics | Keep-alive cron during May 28-31 judging window; Colab notebook as zero-install fallback |
| 15 | 10 | Video file size > BeMyApp upload limit | 3-min 1080p H.264 with voice overdub can hit 200+ MB | Submission portal upload caps vary | YouTube unlisted host instead of direct upload; the form accepts URL |
| 16 | 11 | AI-tone sweep finds last-minute em-dash drift | Late Day 10 polish edits may reintroduce em-dash via mechanical autocorrect | Habit + autocomplete | `scripts/ai-tone-sweep.sh` runs on Day 11 morning + before final commit |
| 17 | 11 | Operator-attribution violation (MME Motorsport / Team BRIT) | Marketing copy currently names suppliers + community without explicit per-surface consent | Q-006 open question | Day 2 consent emails + Day 10 anonymization fallback if no reply |
| 18 | 12 | BeMyApp form submission rejected (wrong field format / missing field) | Form validation rules not fully known until submission attempt | Submission portal idiosyncrasies | Submit Day 12 14:00 ET (7-hour buffer before 23:59 deadline) leaves time for fixup |
| 19 | 12 | Hostile Q&A question outside the 5 prepared flashcards | Judges may ask something unanticipated | Q&A is high-variance | Flashcard #6 (catch-all): "We deliberately scope-limited APEX V1 to the COA + TTM + physics layer pattern. The question you're asking is genuinely open and a great Day 13 conversation - happy to dig in." |
| 20 | 12 evening | Submission timestamp on BeMyApp form differs from intended (timezone confusion) | BeMyApp portal may display UTC vs ET | Timezone math | Verify on Day 11 dress rehearsal; screenshot submission timestamp |

## Accepted residual risks (ship with these on Day 12)

- ⚠ Sub-second sub-grid kinetic hallucinations inside 1-Hz aggregates remain possible (V1 physics layer). V2 Pacejka mitigation is post-NeurIPS-paper work.
- ⚠ Constant-mu friction ellipse oversimplifies wet-track scenarios. Day 5 V2 adds circuit-conditional mu lookup; full Pacejka load-dependent slip is V3.
- ⚠ apex.race domain may not be registered by Day 12 (user-action gate). Fallback metadataBase: `https://apex.vercel.app`.

---

## Pre-Q&A defense cross-reference

Every BLOCKER + HIGH residual risk has a corresponding Q&A flashcard or rehearsed answer. See `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_qa_killshots.md` for the 5 cards. Update both this journal and the killshots memory in lockstep.

---

_Last updated: 2026-05-20 PM by Stephen (Day 1 EOD initial draft)._
