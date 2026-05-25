# Wave-45 deep-review structured fix plan

> Synthesized 2026-05-25 night from 12-agent parallel review dispatch. Currently 7 of 12 agents returned. Status of each finding tracked here. Stephen explicit ask: structured plan for blockers/HIGH so wave-46 picks up cleanly.

## Agents dispatched (12)

| # | Agent | Status | Findings tier |
|---|-------|--------|---------------|
| 1 | codex:codex-rescue (adversarial) | RETURNED | 3 HIGH + 3 MED + 1 NIT — NOT-SUBMISSION-READY |
| 2 | cc-gemini-plugin:gemini-agent (1M context) | PENDING | — |
| 3 | pr-review-toolkit:code-reviewer (conventions) | PENDING | — |
| 4 | pr-review-toolkit:silent-failure-hunter | PENDING | — |
| 5 | pr-review-toolkit:type-design-analyzer | RETURNED | 2 HIGH + 4 MED + 4 NIT |
| 6 | pr-review-toolkit:pr-test-analyzer | RETURNED | 2 HIGH + 3 MED |
| 7 | pr-review-toolkit:comment-analyzer | RETURNED | 2 HIGH + 6 MED + 2 NIT |
| 8 | pr-review-toolkit:code-simplifier | PENDING | — |
| 9 | plan-gap-scanner | RETURNED | 6 BLOCKER + 3 WARN + 3 NIT — NOT-READY |
| 10 | vercel:performance-optimizer | PENDING | — |
| 11 | vercel:ai-architect | RETURNED | 2 HIGH + 3 MED + 3 NIT — SHIPPABLE |
| 12 | vercel:deployment-expert | RETURNED | 1 BLOCKER + 2 HIGH + 4 MED — SHIP-READY with 1 BLOCKER |

## SHIPPED THIS REVIEW WAVE (fix-wave-1, this commit)

- Paper §1 abstract + §1 contribution + §3 frozen-claim sync to D-052 fine-tune pivot (codex HIGH)
- /judge-tour Step 2 tier counts sync to D-054 LangGraph promotion (codex HIGH)
- /judge-tour Vinh commit SHA 9048575 → 9048573 (comment-analyzer HIGH)
- ibm-stack.ts TSPulse V1-V11 → V1-V15 (comment-analyzer MED)
- ApexCamPanel 5 → 7 shouldn't-be-possible moves (comment-analyzer MED)
- judge-tour headline Six → Seven shouldn't-be-possible moves
- lips-harness §4.5 → §4.6 reproducibility (comment-analyzer HIGH)
- EngineAgnosticByteEqualityDemo cross-ref tightened + D-050 reframing per new memory rule
- MobileInstallQR copy honesty (Scan to install → Open on phone; aria-label sync)
- 2 em-dash slips fixed (self-audit)

## OPEN BLOCKER + HIGH (rank-ordered for next ship)

### BLOCKER B-1 (Stephen operator-action) — Vercel WATSON_TTS env vars missing

**Source:** vercel:deployment-expert
**Live probe:** `POST /api/watson-tts` returns `{"error":"apex.watson-tts: WATSON_TTS_API_KEY + WATSON_TTS_URL missing"}`. Voice debrief silently falls back to browser Web Speech API; Watson TTS production path NOT wired despite wave-43 close-out claim.
**Fix:** Stephen sets both env vars (Production scope) in Vercel dashboard, redeploy. NOT Claude action; operator action.

### HIGH H-1 — V12-V15 API routes return 200 on errors (codex HIGH)

**Source:** codex-rescue + type-design-analyzer triangulated
**Surface:** All 4 V12-V15 routes catch errors but return HTTP 200 + empty arrays + `X-Apex-Error: 1` header. Client panels check only `res.ok` before rendering ready state, so a swap-in backend failure renders as valid empty trace. Judge sees broken stub as working UI.
**Fix:** Add tagged `error` variant to `OrchestrationResponse` + `LIPSResponse` + new `PacejkaResponse` + `SCPResponse` (after type-design promotion). Client panels narrow on engine variant + render alert if error.
**Effort:** 4 route edits + 4 panel edits + 4 test updates. ~30 min.

### HIGH H-2 — Plan-gap BLOCKERs: 4 missing test files

**Source:** plan-gap-scanner
**Missing:**
- `components/__tests__/VoiceDebriefInput.test.tsx` (5 cases per plan §3.12)
- `components/__tests__/JudgeWalkthroughStep.test.tsx` (6 cases per plan §4.6)
- `components/__tests__/ApexCamPanel.test.tsx` (4 cases per plan §5.6)
- `components/__tests__/MobileInstallQR.test.tsx` (per plan §6.8-6.12)
**Effort:** 4 test files × ~30 min each = ~2 hours.

### HIGH H-3 — Vercel BotID install OR explicit defer (plan-gap BLOCKER #2)

**Source:** plan-gap-scanner
**Status:** `@vercel/botid` never installed. Plan R3 calls "monitor mode for 24h" then "block mode". Plan body §6.3 does NOT defer.
**Recommended fix:** Install in monitor mode (1 commit; @vercel/botid + middleware setup; documented per R3 risk). OR add D-057 explicit deferral entry + sweep plan references.
**Effort:** 1 hour for safe install OR 15 min for explicit defer entry.

### HIGH H-4 — openrouter-stream 502 catch should fall through to stub (vercel:ai-architect H-2)

**Source:** vercel:ai-architect
**Fix:** `app/api/openrouter-stream/route.ts:213` catch block currently returns 502 to client; should call `streamStubResponse(stubResponseFor(body.prompt), request.signal)` instead. Demo never visibly breaks if OpenRouter has outage.
**Effort:** 1-line fix. 5 min.

### HIGH H-5 — Type-design Pacejka + SCP promotion to shared types

**Source:** type-design-analyzer
**Fix:** Promote `PacejkaTier` + `PacejkaResponse` + `SCPIterate` + `SCPResponse` to `app/shared/types.ts` (V14/V15 promoted earlier; V12/V13 missed). Same drift hazard.
**Effort:** 4 file edits. ~20 min.

### HIGH H-6 — Test coverage gaps: /api/timing-sheet-parse 413 + 415 branches + /judges mount test (pr-test-analyzer)

**Source:** pr-test-analyzer
**Fix:**
- Add 413 + 415 test cases for `/api/timing-sheet-parse` (Content-Length pre-check + invalid_pdf_type branch).
- Add /judges page mount smoke test catching runtime import-chain failures.
**Effort:** 2 test files + ~30 min each. ~1 hour.

## MED (queue for wave-46 unless time permits)

- /changelog `?all=1` searchParams ignored (codex MED)
- /compare `?drivers=` searchParams ignored (codex MED)
- ByteEqualityDiff tagged-record → true DU (type-design MED)
- Add tagged `error` variant to API response DUs (type-design MED + codex HIGH overlap)
- /lips-harness transport-error log noise downgrade (vercel:deployment MED)
- 300+ commits + 14+ routes count drift across surfaces (comment-analyzer MED)
- Phase 18 reference in Q&A flashcards (no Phase 18 in plan; comment-analyzer MED)
- ApexCamPanel set-state-in-effect eslint-disable without rationale (comment-analyzer NIT)
- Synthesis path drift (research/wave-45/synthesis.md vs SYNTHESIS.md per plan-gap WARN)
- Plan body L191-192 R9 unchanged from WIRED framing (plan-gap WARN)

## Wave-46 ship-queue (NOT pre-deadline)

- Granite Switch 4.1-3B preview wire on AICopilotChat
- Mellea IVR loop on narrator
- Granite Speech 4.1 2B-Plus replace Web Speech API
- Granite Embedding 311M Multilingual R2 for cross-lingual RAG
- Real Transformers.js wire for TTM (after upstream pipeline task lands OR direct onnxruntime-web bridge)
- COA multi-parameter constraints (5 live vs 1 binary bit)
- Ablation evidence table on /lips-harness with real Vinh numbers
- IBM Bob customMode appendix + DocTags native pass-through
- Paper §3 + README COA reframing
- apex.race domain attachment (D-042 operator-action)
- Vercel Edge runtime migration for V12-V15 API stubs (after Vinh real-engine swap)

## Stephen operator-action queue (NOT Claude scope)

- **CRITICAL pre-deadline:** Set `WATSON_TTS_API_KEY` + `WATSON_TTS_URL` in Vercel production env + redeploy
- BeMyApp form submission (payload at `deliverables/bemyapp-submission-payload.md`)
- 3-min video record per `docs/demo-video-script-3min.md` + storyboard
- 5 outreach DMs (Mission 44 + Team BRIT + Spinal Track + Limitless + Raceability)
