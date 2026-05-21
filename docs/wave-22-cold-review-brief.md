# Wave-22 cold review brief

> Dispatched when Codex + Gemini + pr-review-toolkit weekly limits reset (5pm America/New_York). Written 2026-05-21 night-late so the actual dispatch tomorrow morning is a single-paste operation.
>
> Three-brain HARD RULE per global CLAUDE.md: every multi-file or 200+ line wave gets reviewed by at least two of Codex + pr-review-toolkit lens + Gemini long-context. The original author never self-reviews. wave-22 covers waves 19 + 20 + 21 which together shipped ~25 atomic commits, ~5 new doc files, the per-route OG cards, the sim-rig component + route + test, the Colab notebook, the demo-video storyboard, the PLAN.md gap-scanner BLOCKER closures, the BeMyApp template alignment + competitor calibration, and the new BeMyApp banner asset.

---

## Scope

Wave-22 reviews everything pushed between commits `8d2ff04` (start of wave-19) and the head at dispatch time (likely the banner commit + brief commits). Specifically:

### Frontend (Stephen-lane code)

- `app/frontend/components/SimRigStream.tsx` (NEW Day 2 PM)
- `app/frontend/components/__tests__/SimRigStream.test.tsx` (NEW Day 2 PM, 4 tests)
- `app/frontend/app/sim-rig/page.tsx` (NEW Day 2 PM, /sim-rig route)
- `app/frontend/lib/og-card.tsx` (NEW Day 2 PM, shared ImageResponse renderer)
- `app/frontend/lib/bemyapp-banner.tsx` (NEW Day 2 night, banner renderer)
- `app/frontend/app/opengraph-image.tsx` + 4 per-route variants
- `app/frontend/app/bemyapp-banner/route.ts` (NEW Day 2 night, GET handler)
- `app/frontend/app/layout.tsx` (metadataBase resolver kept from wave-18; relevant to OG-image base URLs)
- `app/frontend/app/judges/page.tsx` (resource-tile addition for /sim-rig)

### Docs (Stephen-lane prose)

- `docs/3-min-pitch-script.md` (wave-19 expansion: 4 of 5 mandatory edits applied)
- `docs/sarah-reynolds-persona.md` (wave-19 expansion: three-corner deep-dive + telemetry table + COA excerpt)
- `docs/methodology.md` (wave-19 Phase 6+7 expansion + cross-references)
- `docs/architecture-spec.md` (wave-19 Layer 3+4+5 math + COA schema + telemetry channel spec)
- `paper/apex-neurips-workshop-2026.md` (NEW Day 2 PM, NeurIPS Workshop paper outline)
- `CONTRIBUTING.md` (NEW Day 2 PM)
- `CODE_OF_CONDUCT.md` (NEW Day 2 PM)
- `vercel.json` (NEW Day 2 PM)
- `docs/vercel-deploy-runbook.md` (NEW Day 2 PM)
- `deliverables/apex-demo.ipynb` (NEW Day 2 PM, Colab notebook skeleton)
- `deliverables/demo-video-storyboard.md` (NEW Day 2 PM, 8-beat shot list)
- `deliverables/bemyapp-submission-payload.md` (Day 2 night re-aligned + Day 2 night-late copy depth match to NeuroPit)
- `docs/banner-brand-brief.md` (NEW Day 2 night-late, locked brand brief)
- `PLAN.md` (Day 2 PM + Day 2 night gap-scanner BLOCKER closures + Discord intel + competitor calibration)
- `README.md` (Day 2 night anonymization sweep)

### Memory (private, not in repo but referenced)

- `reference_ibm_skillsbuild_org.md` (NEW Day 2 PM)
- `reference_bemyapp_submission_template.md` (NEW Day 2 PM + Day 2 night-late depth update)
- `reference_competitors_calibration.md` (NEW Day 2 night-late + epilogue for RaceMind AI)

## Lenses + dispatch order

Six parallel agents dispatched in a single message tomorrow morning. Brief each agent like a smart colleague who just walked into the room with no prior context.

### 1. `pr-review-toolkit:code-reviewer`

Brief: "Review the frontend code shipped between commits `8d2ff04..HEAD`. Specifically the new SimRigStream component + test, the og-card + per-route opengraph-image.tsx handlers, the bemyapp-banner renderer + route handler, the /sim-rig route page, and the /judges page resource-tile addition. Check: TS strict compliance, React 19 idioms, Next.js 16 App Router conventions, no any/unknown casts, error handling at WebSocket boundary in SimRigStream, no console.log left in, accessibility (keyboard nav + aria roles + prefers-reduced-motion respect), and the editorial-paddock palette discipline (no raw hex outside globals.css or the lib renderers). Report BLOCKER / HIGH / MED / NIT."

### 2. `pr-review-toolkit:silent-failure-hunter`

Brief: "Audit the same frontend code for silent failures + inappropriate fallback. SimRigStream has a try/catch around JSON.parse on WebSocket frames; check whether the catch swallows shape errors in a way that masks bugs. The bemyapp-banner renderer fetches Google Fonts at render time; check whether the fetch failure modes are surfaced (or fall back to system fonts, or fail loud). The og-card renderer uses system fonts only; verify the JSX has no implicit any-cast hiding type errors. Report BLOCKER / HIGH / MED."

### 3. `pr-review-toolkit:type-design-analyzer`

Brief: "Score the new public types in `app/shared/types.ts` (SimRigFrame + TelemetryChannels + TelemetryRow union) and the new component interfaces (SimRigStreamProps + OgCardProps). Quantitative ratings on encapsulation + invariant expression + usefulness + enforcement. Specifically: should SimRigStream's `mode: simulated | live` be promoted to a discriminated-union state where live carries a required `websocketUrl` field and simulated does not (preventing the runtime alert path entirely)? Report ratings + suggested type refactors."

### 4. `pr-review-toolkit:comment-analyzer`

Brief: "Audit the documentation comments added across the new frontend files (SimRigStream, og-card, bemyapp-banner, bemyapp-banner route). Check for accuracy + completeness + comment-rot risk. Specifically: does any comment describe behavior that does not match the code (drift)? Does any comment carry "added for X task" or "removes Y" language that will rot? Report findings."

### 5. `cc-gemini-plugin:gemini-agent`

Brief: "Large-context architecture pass over the wave-19 + wave-20 + wave-21 + wave-22 commits. The repo is at `/Users/stephensookra/Desktop/IBM May/`. Read PLAN.md + docs/architecture-spec.md + docs/methodology.md + the new frontend code + the new memory files (in `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/`) + the BeMyApp payload doc + the banner brief. Synthesize an architecture-review pass: are the docs internally consistent? Does the methodology Phase 6+7 expansion match the actual artifacts shipped? Does the architecture-spec Layer 3+4+5 math match what the SimRigStream + opengraph-image + bemyapp-banner Code paths imply? Does the BeMyApp payload depth match the competitor calibration findings? Are there cross-file drift points the next session should fix? Report findings + suggested doc edits."

### 6. `plan-gap-scanner`

Brief: "Adversarial gap scan on PLAN.md, second pass. The first pass (wave-19 PM) returned 21 gaps and the BLOCKERs were closed in commit `37fca65`. Re-scan against the current PLAN.md state. Specifically check: (a) did any of the new tasks 1.13 through 1.16 + 5.14 + 5.15 introduce new gaps; (b) did the Q-007 acceptance criterion update + the Discord intel resolution leave any orphan references; (c) does the locked-positioning section + the Hard Compliance Rules section still match the actual artifacts shipped through wave-22. Report BLOCKER / WARN / NIT."

### Optional: `codex:codex-rescue`

Dispatch only if any of the above lenses returns a BLOCKER that the local Claude session can't immediately resolve. Codex is the fresh-eyes second opinion. Brief: paste the BLOCKER finding + the relevant file paths + ask for an adversarial diagnosis.

## Acceptance criteria

The wave-22 cold review passes when:

- All six lenses (or the five available if Codex is held in reserve) return findings within 60 minutes.
- BLOCKERs are zero or all closed before the next Day-3 commit lands.
- HIGH findings are either closed inline or queued as a tracked PLAN task with a Day-3 commit-by date.
- MED + NIT findings are queued for the Day-11 polish wave OR closed if cheap.

## Dispatch checklist

When tomorrow's session resumes:

1. Verify limits are reset: try a `pr-review-toolkit:code-reviewer` agent with a trivial prompt; if it returns within 2 minutes, the lens is live.
2. Once any one lens returns live, dispatch all six (or all five) in a single multi-tool message for parallelism.
3. Save the consolidated findings to `docs/wave-22-cold-review-findings.md`.
4. Tier findings BLOCKER / HIGH / MED / NIT.
5. Close BLOCKERs inline.
6. Open PLAN tasks for HIGH + MED.
7. Push the findings doc + any inline closures atomically.
8. Write the wave-23 Claude Memory session note documenting the cold-review outcome + the artifacts shipped in response.

---

## Risk surface (what could break before tomorrow)

- The `bemyapp-banner.tsx` renderer relies on Google Fonts CDN fetch at render time. If the build environment lacks network access (e.g., Vercel build in offline mode), the route handler 500s. Mitigation: the committed `deliverables/bemyapp-banner-1920x600.png` is the canonical artifact; the route is iteration-only. Acceptable risk for wave-22.
- The Next.js 16 `next/og` API surface may have changed since the og-card.tsx pattern was written (Vercel keeps the API stable but font fetch is the most fragile boundary). If `fonts: [...]` shape changes, the route 500s on first hit. Mitigation: tsc passes today, lint passes today; runtime catch is part of the wave-22 dispatch above.
- The wave-21 PLAN.md edits closed Q-007 acceptance criterion + opened 1.16 with the Discord verdict; if a future PLAN edit overwrites those without preserving the Discord cross-reference, the audit trail breaks. Mitigation: covered by lens 6 (plan-gap-scanner re-scan).

## Out of scope for wave-22

- Vinh-side backend code (none shipped; covered when Vinh sends his first PR).
- Demo video footage (Day 10 production take, not in scope for review until then).
- Sarah Reynolds fixture telemetry CSV (planned Day 6 with Vinh).

---

_Last updated: 2026-05-21 night-late by Stephen. Dispatch tomorrow morning, target 09:00-10:00 ET window once weekly limits reset at 17:00 ET tonight._
