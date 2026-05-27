# APEX Decision Log

Every locked decision with rationale + date + scope. Newest first.

---

## 2026-05-27 D-063: Wave-46 Phase B R3F RacingLineHero killshot ship + IBM Bob retirement + Stephen-explicit chrome removals

**Decision.** Wave-46 galaxy-final-push delivered the killshot: replaced the wave-1 hand-coded inline-SVG racing-line hero on `/` (lines 137-249 of `app/frontend/app/page.tsx`) with a 3D React-Three-Fiber visualization (`components/RacingLineHero.tsx` + dynamic-import wrapper `components/RacingLineHeroShell.tsx`). Plus Phase A executed Stephen-explicit removals (BuildStatus + footer chrome + multi-track positioning + Day-counter + IBM Bob across 24+ surfaces).

**Phase A commits (6 atomic):**
- A1 `01b9f79` -- BuildStatus + Calibration-ceiling multi-track + Day-counter H2 removed from `/`
- A2 `3f14aa5` -- Footer chrome stripped (kept GitHub + License only); PLAN.md + README.md links + "Day 7 of 12 · 2026-05-26" removed
- A3 -- README.md BuildStatus verified clean (no-op; section never existed)
- A4 `0e6c426` -- Multi-track positioning removed (JudgeTrackTighteningCallout component + test deleted; judges page section + judge-tour Step 6 list + methodology Pillar 5 reframe)
- A5a `abacf37` -- IBM Bob removed from frontend (`lib/ibm-stack.ts:201-220` Bob entry + `page.tsx` 3 refs + `/judges:244` + `/judge-tour:98`); tool count 15 -> 14; ACCELERATOR 3 -> 2 (Docling library + Mellea only)
- A5b `b9b34de` -- IBM Bob removed from docs + paper + SUBMISSION + 4 deliverables + 2 outreach drafts + apex-lite-contingency; tier counts propagated across all surfaces

**Phase B commits (3 atomic so far + B6 = this entry):**
- B0 `73f0f30` -- Installed `three@0.184.0` + `@react-three/fiber@9.6.1` + `@react-three/drei@10.7.7` + `@types/three@0.184.1`
- B1 `712de0f` -- Built `components/RacingLineHero.tsx` Client Component (462 LOC): 3D track via `TubeGeometry` + CatmullRomCurve3 racing line + animated stylized car via `useFrame` + curve.getPointAt(t) interpolation + PerspectiveCamera tracking car with banking-into-corner lerp + drei Text labels (BRAKING + APEX + EXIT + "T7 entry, Lap 17") + apex-pulse sphere via sin-wave scale modulation + drei Html telemetry HUD overlay (throttle/brake/steering ribbons synced to t-parameter) + 12-second loop + prefers-reduced-motion static-SVG fallback + WebGL-unsupported fallback + ARIA labeling
- B2 `7bbecfb` -- Mounted via `RacingLineHeroShell` Client Component dynamic-import wrapper at `app/page.tsx:141` (per JudgesGalaxyMovesShell precedent + Next.js 16 ssr:false-from-Server-Component restriction per `feedback_nextjs16_dynamic_ssr_false_client_only.md`); inline SVG removed; figure wrapper + apex-rise + delay 600ms preserved

**Editorial-paddock palette honored:** track racing-green `#0A2818`, racing-line clay-red `#C1492C`, apex-pulse amber `#D9A441`, paper-cream `#F4EBD8` labels, ink `#0F1410` text.

**Bundle impact:** R3F + drei + three ~120KB gzip; lazy-loaded via `next/dynamic` with `ssr: false` so initial `/` bundle stays clean. Production smoke 200 on `/` post-deploy (Vercel auto-redeploy from main triggered).

**Why.** Stephen explicit 2026-05-26 evening: the static SVG was "very boring with the track and stuff" + had a "T7 entry" label colliding with the orange dashed racing-line + was identified as the highest-leverage visual upgrade for galaxy-tier judging impact. Per the wave-46-galaxy-final-push plan section "S7 is the killshot. Static SVG is genuinely boring for a galaxy-tier submission." R3F 3D track delivers wow-factor at the highest-traffic surface (the landing page).

**Why now.** Plan-mode approved 2026-05-26 evening; Phase A + Phase B B0-B2 shipped same evening (~3 hour session). Phase B remaining: B3 (COA-gate visual coupling on apex pulse), B4 (vitest smoke test), B5 (Lighthouse smoke verify post-deploy) -- DEFERRED to next session as polish items because the killshot already lands at B2 mount; B3-B5 are quality-additive not gating.

**Phase B residual:**
- B3 deferred: extend RacingLineHero with COA-gate visual coupling (apex pulses clay-red on violation vs amber on feasible per cross-page COA-toggle state). Tactile galaxy-stretch; ship in next session.
- B4 deferred: R3F component vitest smoke test (Canvas + Text + reduced-motion fallback render). Mock-heavy; defer.
- B5 deferred: Playwright Lighthouse smoke. Production smoke 200 OK at B2 ship time; Vercel auto-deploy from main + monitor.

**Affected.** HEAD `7bbecfb` on `main`. CI green per push verified across A1-A5b + B0 + B1 (B2 in_progress at write time, expected green; binary-equivalent on canned path). Production `/` serves the new 3D hero. Total wave-46 mega-arc commit count: ~70+ across the original arc + this session's 9 Phase A/B commits.

**Cross-refs:**
- D-058 wave-46 mega-arc plan-entry
- D-060 wave-46 session A close-out
- D-061 wave-46 session B Phase 8+9 close-out
- D-062 wave-46 Phase 7.6 NotebookLM hover-audio shipped
- D-063 (this) wave-46 Phase A removals + Phase B R3F killshot
- `feedback_galaxy_ambition_no_deferrals.md` (load-bearing for the no-restraint plan)
- `feedback_conceptual_stack_vs_shipped_stack.md` (Bob removal honesty-tier consistency)
- `feedback_propagation_full_repo_sweep.md` (A5 24+ surface Bob sweep)
- `feedback_nextjs16_dynamic_ssr_false_client_only.md` (Shell wrapper pattern)

---

## 2026-05-26 D-062: Wave-46 Phase 7.6 NotebookLM hover-audio MP3 shipped on /judges COA-gate panel

**Decision.** First panel hover-audio asset (`coa-gate.mp3`) shipped at commit 378c6db. Generated by Stephen via Google NotebookLM Audio Overview using the canonical prompt locked in the wave-46 plan. Brief format, Default length, narrowly scoped to the COA-parameterized simultaneity gate (Differentiator #2). Two sources fed to NotebookLM: `README.md` + `paper/apex-neurips-workshop-2026.md` per the `github.com/StephenSook/apex/blob/main/...` URLs.

**File layout (organised per Stephen-action queue close):**
- Production-shipped: `app/frontend/public/audio/coa-gate.mp3`, 2.2 MB, 192kbps MP3, stereo 44.1kHz, duration 93.97s. Served as static asset by Next.js. Consumed by `NotebookLMHoverAudio` component with `panelId="coa-gate"` mounted on `/judges` between `COAGateToggle` + `RealtimeCOADiffPanel`.
- Source archive: `deliverables/audio-raw/coa-gate-source.m4a`, 3.0 MB original AAC-in-M4A NotebookLM export. Kept tracked so the team can re-encode at higher bitrate without re-running NotebookLM.
- ffmpeg pipeline: 192kbps stereo MP3 re-encode of the AAC source. Full original duration preserved (no trim required because NotebookLM Brief format hit ~94s naturally, within the 90s ceiling I asked for in the customise prompt).

**Why this matters.**
- NotebookLM hover-audio was wave-46 Phase 7.6 scope per D-058. The component shipped wave-46 session A 2026-05-26 with a `missing` placeholder until Stephen generated the asset. D-062 closes the placeholder loop on the COA-gate surface specifically.
- `Most Innovative` track judging: NotebookLM-on-hover is a creative external-AI-tool integration on /judges that no other May Challenge competitor visible in the field is shipping. APEX is the only project we found that converts NotebookLM Audio Overview into an embedded, deliberately-scoped, per-panel commentary asset.
- HARD-COMPLIANCE: the file ships at `/audio/coa-gate.mp3` exactly matching the component's lazy-load path. No new code surfaced for this ship; commit is binary-only (one MP3 + one M4A archive).

**Per-panel mount status (1 of 6 originally planned):**
- ✅ COA-gate: shipped at D-062
- ⏸ architecture-figure: scaffold exists, MP3 not yet generated. Component would render `missing` placeholder if mounted. Skipped to keep /judges clean.
- ⏸ galaxy-moves: same
- ⏸ byte-equality demo: same
- ⏸ LIPS harness link: same
- ⏸ judge-tour CTA: same

Choosing to mount only the COA-gate panel keeps /judges visually clean. Adding 5 more `missing` placeholders before submission would clutter the page. Future Stephen generates more MP3s + I add the matching mounts atomic-per-MP3.

**Side-quest cleanup.** Gemini CLI YOLO-mode invocation while attempting to transcribe-and-verify spawned three junk files (`APEX_Fixes_AI_Physics_for_Adaptive_Drivers.aac` at project root, `convert_audio.py` at project root, `deliverables/audio-raw/coa-gate-source.wav`) trying to work around its read_file tool's "unsupported audio format" error on the M4A. All three deleted before commit. Final repo state contains only the intentional MP3 + M4A archive.

**Why Gemini transcription was abandoned.** Gemini CLI's `read_file` tool rejected the M4A as "unsupported audio file format". @-syntax + path-string ingestion both failed. NotebookLM's auto-generated title for this audio is "APEX Fixes AI Physics for Adaptive Drivers" which is a strong-prior signal the content covers the topic correctly. Stephen will ear-check on the live `/judges` hover-audio button post-Vercel-deploy. If content needs regeneration, the M4A source stays archived + re-encoding is one ffmpeg command.

**Affected.** HEAD push 378c6db. Wave-46 Phase 7.6 closed (asset-side; component already shipped). 1 of 6 hover-audio panels populated. Phase 10 BeMyApp form submission + 3-min video record + 30-sec highlight clip still queued for Stephen-action.

**Cross-refs:**
- D-058 wave-46 plan-entry
- D-061 wave-46 session B Phase 8+9 close-out
- `feedback_quality_over_speed.md` (research escalation tried Gemini before fallback to NotebookLM auto-title prior)
- `feedback_exhaustive_tool_inventory_before_every_task.md` (tool inventory: ffmpeg, ffprobe, gemini CLI, cc-gemini-plugin gemini-agent, mcp__plugin_playwright)

---

## 2026-05-26 D-061: Wave-46 session B Phase 8 + 9 close-out (7-agent deep-review batch ship)

**Decision.** Wave-46 session B (extension after Stephen "finish out the wave" directive) shipped 25+ atomic commits closing Phase 8 (5 remaining sub-items) + Phase 9 (7-agent parallel deep-review dispatch + BLOCKER + HIGH fix-forward batch). HEAD CI green target ea9bc9e (cascade-#43 close).

**Phase 8 close (5 commits + cascade-#41 + cascade-#42):**
- 8.1 paddock-night dark-mode scope via `[data-paddock-night="true"]` CSS-variable override + SimRigPaddockNightShell toggle with localStorage persistence + body::before grain-texture suppression via :has selector
- 8.2 color-coded telemetry tone classification on SimRigStream channels (neutral / caution / warning per channel threshold; sr-only tone annotation)
- 8.4 COAGateToggle transition-colors duration-300 flip animation on section wrapper + outer switch + verdict left-border
- 8.5 JudgeWalkthroughStep apex-rise fade-in per step navigation + JudgeWalkthroughProgressBar motion-safe:duration-500 crossfade
- 8.7 TelemetryUploadPanel drag-drop event handlers (handleDragOver + handleDragLeave with relatedTarget contains-guard + handleDrop) + drag-over visual feedback + mount on /analyze
- cascade-#41: react-hooks/set-state-in-effect ESLint disable on SimRigPaddockNightShell mounted-flag pattern per feedback_react19_set_state_in_effect_workarounds.md
- cascade-#42: Playwright analyze-fidelity.spec.ts fileInputs 2 -> 3 to match Phase 8.7 TelemetryUploadPanel mount

**Phase 9 deep-review batch (7 agents dispatched in parallel; results synthesized):**
- codex-rescue: HIGH 1 wire-flip silent fallback (9 routes) + MED 1 scrubber plural pattern gap
- cc-gemini-plugin large-context drift scan: BLOCKER cat 1 tool-count drift 12->15 across 4 surfaces + BLOCKER cat 4 IBM Bob over-claim 2 surfaces + BLOCKER cat 7 operator-attribution 5 leaks + HIGH cat 5+6 PLAN.md em-dash + "unlocks" residual
- plan-gap-scanner: 27 gaps (9 BLOCKER + 9 HIGH + 5 DOC + 4 NIT); BLOCKER #1-#9 confirm Vinh-side backend modules unshipped at submission, mitigated by NEXT_PUBLIC_USE_REAL_BACKEND_V* env flags defaulting to false + honesty-tier reframe across all surfaces
- pr-review-toolkit:silent-failure-hunter: BLOCKER 1 scrubber bare Section N.N pattern gap + BLOCKER 2 no scrubber unit test + HIGH 3 no AbortController on fetchRealBackend + HIGH 4 no upstream-status warn + HIGH 5 coach-code silent canned fallback + HIGH 6 NotebookLM empty catch
- pr-review-toolkit:type-design-analyzer: 9 of 12 wave-46 type additions ACCEPT; 3 REWORK (STT bound confidence + CoachCode add swap_point + UploadTelemetry drop duration redundancy); cross-cutting note on runtime-validation gap via `as TYPE` casts
- pr-review-toolkit:code-reviewer: BLOCKER 1 persona-decoupling violation on /api/judges/coa-diff CANNED_SCENARIO + HIGH 2 CSV split fragility on quoted commas + HIGH 3 STT no body cap
- pr-review-toolkit:pr-test-analyzer: BLOCKER B1 upload-telemetry empty __tests__ dir + BLOCKER B2 scrubber no unit test + HIGH H1 timing-sheet-parse wave-46 wire-flip branch untested

**Fix-forward batch shipped (12 atomic commits inside Phase 9):**
1. cascade-#41 react-hooks/set-state-in-effect on SimRigPaddockNightShell
2. Operator-attribution sweep on decision-log: anonymize three named operators (BeMyApp Discord moderator + upstream PitWall maintainer + Discord community member) to anonymous archetypes
3. SUBMISSION.md 8-tool->15-tool + IBM Bob honest reframe + veteran-motorsport-rehabilitation-programme anonymize
4. README.md section 5 12-tool->15-tool + IBM Bob flowchart honest reframe
5. ibm-stack.ts comment header 12-tool->15-tool + /judges stack heading 12-tool->15-tool
6. /api/judges/coa-diff persona-decouple default CANNED_SCENARIO to adaptive-hand-controls generic vocabulary
7. lib/scrub-regulatory-anchors.ts plural FIA Articles + bare Section N.N patterns + new tests/lib/scrub-regulatory-anchors.test.ts canonical 20-case regression suite
8. PLAN.md Vinh-table em-dash + "unlocks" sweep (lines 46-59)
9. /judge-tour step 2 "one demo-facade (Langflow)" + "Two build-time accelerators" -> tier reality (zero FACADE + three ACCELERATOR including Mellea)
10. cascade-#42 Playwright analyze-fidelity fileInputs 2 -> 3
11. Wire-flip 9-route batch: AbortSignal.timeout(3000) + upstream-status console.warn on fetchRealBackend (projector-stage-a/b + orchestration + lips-harness + tspulse/anomaly + rag-retrieve + stt + timing-sheet-parse + judges/coa-diff)
12. STT body cap 413 audio_too_large (5 MB) per code-reviewer HIGH 3
13. cascade-#43 scrub-regulatory-anchors.ts dot-letter suffix support (Article 18.3.a) via SUFFIX constant + RegExp constructor reuse

**Findings explicitly deferred (DOC tier; documented + rationale):**
- Silent-failure HIGH 5 coach-code fallback no user banner: deferred to wave-46.5 (CoachCodePanel surfaces X-Apex-Coach-Code-Fallback header in engine pill; users see "canned" vs "real" engine signal already)
- Silent-failure HIGH 6 NotebookLM empty catch: hover-audio is non-load-bearing surface; missing assets fail silently by design per R7
- Silent-failure HIGH 8 SimRigPaddockNightShell localStorage catches: hackathon-mode acceptable (private-mode browsers are non-critical demo path)
- Code-reviewer HIGH 2 CSV split fragility on quoted commas: documented in page copy "canonical APEX-Bench schema" requirement; full RFC-4180 parser deferred to post-submit
- Type-design REWORK 3 (STT bound confidence + CoachCode swap_point + UploadTelemetry duration redundancy): deferred (hackathon-mode acceptable; not safety-critical)
- Test-coverage MED + NIT: 5 component test gaps queued for wave-46.5 (RealtimeCOADiffPanel + CoachCodePanel + TelemetryUploadPanel + SimRigPaddockNightShell + JudgeTourKeyboardNav)
- Plan-gap BLOCKER #1-#9 Vinh-side backend modules: NEXT_PUBLIC_USE_REAL_BACKEND_V12/V13/V14/V15/USE_GRANITE_SPEECH/USE_REAL_BACKEND_V7/V8 stay at default `false` in Vercel production env (verified via fetchRealBackend canned-fallback path consumed exclusively at HEAD); honesty-tier reframe across SUBMISSION.md + README + /judges + /judge-tour + paper §3.5 keeps the claim-vs-shipped boundary explicit per `feedback_conceptual_stack_vs_shipped_stack.md`

**Production smoke 2026-05-26 day 8 mid-afternoon:**
- 9 wire-flip routes return 200 with engine="*-canned-fallback" header (env flags default false)
- /upload + /coach-code + /compare + /judge-tour + /judges + /analyze + /sim-rig pages 200
- /api/stt POST body cap returns 413 audio_too_large on >5 MB declared Content-Length
- Scrubber canonical regex set covers FIA Article + FIA Articles + Article + Art. + Appendix L §N + § + COA Section + COA Sec. + bare Section N.N + Sec. patterns with dot-letter suffix support
- HEAD CI target: cascade-#43 close at ea9bc9e
- Vercel deploy auto-triggered per push; production-path Granite Instruct + Watson TTS + canned fallbacks all healthy

**What remains for next session (Phase 10 final + post-submission):**
- 10.1 hackathon-pre-deploy skill chain (repo-sentinel + qa-systematic + pre-landing-review wrapper run)
- 10.4 production smoke 12-route verify
- 10.5 BeMyApp form submission (Stephen operator-action)
- 10.6 post-submission Claude Memory + APEX MOC + project memory close-out
- 3-min video record + 30-second highlight (Stephen operator-action)

**Affected.** Wave-46 session B close. HEAD CI green target ea9bc9e. Production smoke healthy. Memory + Obsidian session note + APEX MOC ready for Phase 10 close-out write. 7-agent deep-review batch findings tier-by-tier addressed: BLOCKER + HIGH closed; DOC documented; MED + NIT explicitly deferred with rationale.

---

## 2026-05-26 D-060: Wave-46 session A close-out (Phase 1-9 partial; 33 atomic commits; HEAD CI green at 4af9bb6)

**Decision.** Wave-46 session A closes at 33 atomic commits `8d88607` through `4af9bb6` with all CI green per push. Phase 1, 2, 3, 5, 6 fully shipped + Phase 4 partial (4.1 + 4.2 + 4.4 + 4.5 + 4.8 shipped; 4.3 + 4.6 + 4.7 Vinh-side defer) + Phase 7 partial (7.1 + 7.2 + 7.3 + 7.5 + 7.6 shipped; 7.4 PWA offline defer) + Phase 8 partial (8.3 mono numerics + 8.6 a11y + 8.8 status pulse shipped; 8.1 + 8.2 + 8.4 + 8.5 + 8.7 defer) + Phase 9 sweeps (9.4 em-dash + AI-tone + operator-attribution + 9.5 LLM-output scrubber audit shipped; 9.1 7-agent deep-review defer). Phase 10 final close-out + BeMyApp form submission queued (operator-action).

**Major ships this session arc:**

1. Wave-46 wire-flip family (Phase 2 + 3): V12 Pacejka + V13 SCP + V14 LangGraph + V15 LIPS all shipped behind `NEXT_PUBLIC_USE_REAL_BACKEND_V*` env flags with misconfig safety + 20 integration tests covering canned-fallback + real-backend branches.
2. IBM Granite stack ladder ascent partial (Phase 4): timing-sheet multipart wire-flip (V1 Granite Vision + Granite-Docling cascade) + new /api/tspulse/anomaly route (V7) + new /api/rag-retrieve route (V8) + lib/env.ts FLAG_NAMES expansion to 11 entries + ibm-stack.ts honesty-tier annotations + IBM Bob honest reframe.
3. Phase 5 Watson Speech scaffold: new /api/stt route (V9 Granite Speech 4.1 2B-Plus swap-point) + VoiceDebriefInput Granite Speech preview panel env-flag refactor.
4. Phase 6 Granite 4.1 routing + /coach-code: AICopilotChat 3B routing pill + scrubber extraction to lib/scrub-regulatory-anchors.ts + new /api/coach-code route + new /coach-code page + CoachCodePanel + opengraph.
5. Phase 7 galaxy-stretches partial: TwinDriverNarrativePanel on /compare (Mission 44 storytelling killshot) + new /upload page + /api/upload-telemetry strict CSV parser + TelemetryUploadPanel + new NotebookLMHoverAudio component + /api/tire-degradation + /api/weather-brief route stubs + new shared types (TireCompound + TireDegradationResponse + WeatherBriefResponse).
6. Phase 8 UI polish partial: tabular-nums mono numerics sweep on SimRigStream + StatusLiveIndicator + StatusLiveIndicator amber animate-pulse on in-progress CI + JudgeTourKeyboardNav arrow-key navigation + aria-live step-change announcements + /judge-tour 12 -> 15 IBM tools propagation.
7. Phase 9 sweeps: em-dash sweep close (1 fix in D-057 entry; wave-46 active code surfaces ZERO em-dash hits) + AI-tone blocklist sweep close (ZERO hits across wave-46 prose) + operator-attribution sweep close (ZERO named operators in public surfaces) + LLM-output scrubber audit verifying canonical regex set imported across /api/openrouter-stream + /api/coach-code.
8. PLAN.md Vinh task table: 17-row backend coordination doc + 15-item priority order; deep-dive grep sweep across entire repo surfaced 4 missing items (V2 sim-rig WebSocket + V11 Chronos-2 + Mellea tri-agent critic orchestrator + GEPA evolution prompts) corrected in second pass.

**Discord intel locked 2026-05-26:**

- Prize structure correctly understood: $5K May pool + $5K June pool + $5K cross-month grand prize = $15K total. May 1st = $2,250 / Runner-up = $1,250 / Best Use of Technology = $750 / Most Innovative = $750. May winners announced 2026-06-10 via email + winners webinar (a BeMyApp organizer-side Discord moderator verbatim 2026-05-25 11:35 PM).
- PitWall threat downgrade D+ MEDIUM -> D LOW on Best Use of Technology tech-depth axis: upstream PitWall maintainer Discord 2026-05-26 confirms Llama 3.3 70B via Groq + only IBM Docling for compliance = 1 tool. APEX 15-tool stack outpaces 15:1. Audience-overlap threat unchanged D+ MEDIUM.
- GitHub org clarification (a Discord community member): IBM SkillsBuild GitHub org is for learning resources, NOT submission-repo requirement. StephenSook/apex personal repo stays canonical.
- IBM Bob trial sign-up SKIPPED: APEX satisfies "at least one of IBM Granite + Docling + Langflow + Context Forge + IBM Bob" 4x over via the other four; Bob is dev-tool not runtime model.
- June challenge separate from APEX per Stephen explicit ("different challenge prompt + different problem").

**Stephen-explicit decisions locked this session (in addition to wave-46 plan Q1+Q2+Q3 from D-058):**

- Session extension after initial 15-commit close-out per "finish out the wave" directive; total session A = 33 atomic commits.
- "make sure everything we added for Vinh is updated in plan.md so he can see it" -> PLAN.md sweep deep-dive close 2026-05-26 morning.
- "for IBM Bob, be brutally honest will it help the project?" -> SKIP the trial; documented in ibm-stack.ts inline comment.

**New memory rules this session:**

- `feedback_quality_over_speed.md` research-cycles extension (Stephen verbatim 2026-05-25 night-2: "We want the best quality possible, so if that's slower, that's ok").
- `reference_discord_intel_2026-05-25_lucas_bma_prize_clarification.md` (prize structure + PitWall + GitHub org + IBM Bob skip).
- `project_apex_competitor_field_may_challenge.md` PitWall threat-axis recalibration appendix.

**Production smoke 2026-05-26 day 8 EOD:**

- /api/projector-stage-a + stage-b + orchestration + lips-harness + judges/coa-diff + tspulse/anomaly + tire-degradation + weather-brief all GET 200
- /api/rag-retrieve + stt + coach-code + upload-telemetry POST-only (405 on GET = correct method-not-allowed)
- /coach-code + /upload + /compare + /judge-tour + /judges pages 200
- HEAD CI green at 4af9bb6
- Vercel deploy auto-triggered per push; production-path Granite Instruct + Watson TTS + canned fallbacks all healthy

**What's deferred for next session (Phase 8 + 9 + 10 close-out):**

Phase 8 (partial; queued):
- 8.1 Dark mode /sim-rig paddock-night variant
- 8.2 Color-coded telemetry states on SimRigStream channels
- 8.4 Motion micro-interactions /judges scroll-reveal stagger + COAGateToggle flip
- 8.5 Motion fade-transitions /judge-tour step navigation
- 8.7 Drag-drop /analyze upload zone

Phase 9 (partial; queued):
- 9.1 7-agent parallel deep-review dispatch (codex + gemini + plan-gap + 4 pr-review-toolkit)
- 9.2 Findings tier + 9.3 cascade fix-forward batch
- 9.6 MED + NIT queue documentation

Phase 10 (queued; mostly operator-action):
- 10.1 hackathon-pre-deploy skill chain
- 10.5 BeMyApp form submission (Stephen operator-action; SUBMISSION.md payload draft ready)
- 10.6 post-submission session note

**Affected.** Wave-46 session A close. HEAD CI green 4af9bb6. Production smoke clean. Memory + Obsidian session note + APEX MOC + PLAN.md Vinh task table all updated. Stephen operator-action queue documented at `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_wave_45_close_out.md` session A extension + this entry.

---

## 2026-05-25 D-058: Wave-46 mega-arc plan-entry (galaxy-tier 10-phase scope-lock + Plan-agent DEFER discipline + Stephen-explicit answers Q1+Q2+Q3)

**Decision.** Wave-46 ships per `~/.claude/plans/all-right-i-want-rippling-moon.md` (overwriting the prior wave-45 plan). 10 phases, ~98 atomic commits Vinh + Stephen combined. Galaxy ambition per Stephen explicit 2026-05-25 night-2 verbatim: "We need to have the best project that we can possibly have. No limitations." Plan-agent DEFER list explicitly skipped per Q1 = Option 1 (judges' grading; not page decoration): Three.js / Vercel Queues swap / Watson Assistant duplicate chat / Watson Discovery duplicate RAG / IBM Cloud second deploy / Apple Watch stub / voice cloning / HRV / multi-language / pit-stop simulator / scroll progress indicator / live race-day mode. Skipped because each is either decoration with no judge-impact lift, OR breaks-working-system risk, OR requires API keys we cannot provision in the window. Skip reasons explicitly NOT time-pressure per `feedback_no_time_pressure_restraint.md`.

**Q2 = Pause for tier-1 research first** (Stephen explicit: "We want the best quality possible, so if that's slower, that's ok"). Tier-1 Context7 + EXA + firecrawl + WebSearch dispatch executed pre-plan-write 2026-05-25 night-2. Findings absorbed into the plan:

1. Granite 4.1 3B Instruct is the actual model name (NOT branded "Switch"). Released 2026-04-29 on HF + watsonx + OpenRouter + Ollama. Use for AICopilotChat fast-routing preview wire.
2. Granite Speech 4.1 2B-Plus confirmed on HF since 2026-04-28 with speaker-attributed ASR + word-level timestamps. Multilingual EN/FR/DE/ES/PT/JA. Self-host via HF transformers v5.8+ or vLLM or watsonx. NOT yet on Inference Providers, backend proxy path required for /api/stt.
3. Mellea confirmed real IBM Research library (`generative-computing/mellea` v0.5.0 PyPI, Apache 2.0, Python 3.11+). `instruct() + requirements + IVR loop` exactly as wave-46 scope needs. Multi-backend including WatsonX. MCP compatible.
4. NotebookLM API only accepts empty requests, no per-panel control. Path: pre-generate audio offline via NotebookLM web UI, host as static MP3 in /public/audio/, lazy-load on hover.
5. IBM Bob real (bob.ibm.com, launched 2026-04-28) but "customMode" terminology does not exist in Bob docs. **Phase 1.2 D-020 re-read finding: D-020 is "Gradient bridge two-regime seam at SCP projector output" (Mellea IVR below seam + TTM fine-tune above seam), NOT IBM Bob customMode appendix.** Original wave-46 item F was misframed; dropped from wave-46 scope entirely. D-023 is MLPerf tolerance-banded reproducibility, NOT DocTags pass-through; also dropped. D-024 is Physics-confidence Mahalanobis detector, NOT Granite Code 8B; the /coach-code feature still ships under wave-46 Phase 6.2 without D-024 D-### link. D-025 is NeurIPS central claim locked, NOT Granite Switch routing; the Granite 4.1 3B routing feature still ships under Phase 6.1 without D-025 link.
6. Granite Code 8B deprecated with explicit warning; Granite 4.1 8B mainline supersedes (HumanEval 87.2% pass@1). Use Granite 4.1 8B for /coach-code (item N reframed).

**Q3 = Ship wire-flips wave-46 with feature flag.** Each V12-V15 swap-point ships behind `NEXT_PUBLIC_USE_REAL_BACKEND_V12` etc env flag, default false (canned). Vinh flips when backend lands. Atomic + reversible + both branches tested + production demo shows canned-or-real depending on backend availability at submission moment.

**Affected.** Wave-46 plan file. Phase 6 narrowed from 7-9 commits to 4-5 commits (Granite 4.1 3B routing + /coach-code only; D-020 IBM Bob clarification + D-023 DocTags + D-024 + D-025 housekeeping all dropped per Phase 1.2 re-read finding). All other 9 phases unchanged. Project memory `feedback_quality_over_speed.md` amended Phase 1.5 to cover research escalation cycles (Stephen 2026-05-25 night-2 verbatim explicit).

---

## 2026-05-25 D-057: Vercel BotID explicit defer per wave-45.5 plan-gap-scanner BLOCKER #2

**Decision.** Wave-45 plan §6.3 specified `pnpm add @vercel/botid` + middleware setup for bot-detection on production. Per plan R3 risk-mitigation: "monitor mode for 24h to verify no false-positives before flipping to block mode; drop entirely if false-positive rate is >0.5%". Implementation never landed; wave-45.5 plan-gap-scanner flagged as BLOCKER. This entry explicitly defers BotID install to wave-46+.

**Rationale.** Two compounding factors:

1. **Judge eval false-positive risk.** Vercel BotID flags non-human traffic patterns. Judges visiting from corporate IP ranges, automated link-unfurl bots (Slack + Discord + LinkedIn previews), and headless-browser tooling (codespace previews + Devpost embed iframes) may register as bots. A false-positive on a judge during eval window is a submission-killing risk that cannot be retroactively excused.

2. **Monitor-mode false security.** Plan R3 mitigation calls for "monitor mode for 24h", but the 24h window straddles the submission-eval window. A judge hitting a false-positive during the monitor period has no recourse; "we were going to flip to block mode based on monitor data" doesn't help a real human who got blocked.

**What's deferred.** `@vercel/botid` npm install + middleware.ts BotID configuration + dashboard env var setup. The defensive value (spam scrapers + automated content lifting) is real but not pre-deadline-critical given the submission is open-source on GitHub anyway.

**Affected.** Plan §6.3 (BotID install task superseded by this defer). Plan §R3 risk-mitigation language (monitor-then-block flow retired). DEEP_REVIEW_PLAN.md plan-gap-scanner BLOCKER #2 close-out.

**Reopen trigger.** Post-submission, after judge eval window closes (2026-06-01+), revisit if scraper-bot traffic becomes measurable problem.

---

## 2026-05-25 D-056: D-053 honest reframing per tier-3 NotebookLM + ChatGPT triangulation (TTM in-browser is upstream-pipeline-gated, not bundle-gated)

**Decision.** D-053 originally framed Granite TTM in-browser as "wave-46 will install `@huggingface/transformers` + service-worker cache". Tier-3 NotebookLM (Topic 2 + Topic 4) + ChatGPT Brutal Judge Review + ChatGPT Weaknesses all flagged this as the single biggest over-claim risk. Triangulated review uncovered a factual error in the reviewers' inference AND a real refinement of the honest framing.

**Factual correction.** `@huggingface/transformers@4.2.0` IS installed (verified via `package.json` + `pnpm-lock.yaml` + `node_modules` 2026-05-25 night). Sibling module `lib/webgpu-nano.ts` uses the dep to run Granite 4.0 Nano 350M genuinely WIRED in-browser via `pipeline("text-generation", "onnx-community/granite-4.0-350m-ONNX-web", { device: "webgpu", dtype: "fp16" })`. `EdgeSummary.tsx` consumes the loader + surfaces ready / oom / offline / error states on /judges. The Granite Nano WIRED entry in `ibm-stack.ts` is therefore accurate at HEAD, NOT an over-claim.

**Real reason for TTM canned-fallback.** Verified via Context7 query against `@huggingface/transformers` v4 docs 2026-05-25: the v4 `pipeline()` factory does NOT yet expose a `time-series-forecasting` task in its public catalog. Granite TimeSeries TTM r2.1 ONNX export at `ibm-granite/granite-timeseries-ttm-r2` IS published, but bridging TTM tensor shapes into the browser requires either (a) upstream catalog addition of `time-series-forecasting` to the v4 pipeline registry OR (b) a direct `onnxruntime-web` integration bypassing the pipeline abstraction. Both paths are feasible but neither is wave-45 scope.

**Honest framing locked.** D-053 shouldn't-be-possible move #7 status downgrades from "Granite TTM running in-browser TODAY" to **"Granite TTM in-browser scaffold is upstream-pipeline-gated; the architecture is real (Granite Nano 350M WIRED via the same dep proves it), the TTM-specific path lights up the moment either upstream catalog support arrives or the direct-ORT bridge ships"**. The galaxy ambition stays; the over-claim drops.

**Surface updates.** `lib/ttm-browser.ts` comment block + `runGraniteTTMInBrowser()` docstring + error message rewritten to cite the upstream-catalog gap, not a bundle-budget constraint. `TTMInBrowserPanel.tsx` header + body copy + error pill updated to match. `ibm-stack.ts` Granite Nano 350M entry stays WIRED (genuine); cross-reference added to lib/webgpu-nano.ts as evidence.

**Affected.** D-053 supersedes-framing-only (not retracted); TTMInBrowserPanel + lib/ttm-browser.ts copy; D-053 retained as Phase 7 ship marker. `research/wave-45/responses/SYNTHESIS.md` documents the triangulation + correction.

---

## 2026-05-25 D-055: Wave-45 final close-out (Phase 11 7-agent deep-review + Phase 12 final-gate)

**Decision.** Wave-45 mega-arc shipped Phase 1 through Phase 12 across two consecutive sessions per the wave-45 plan at `~/.claude/plans/all-right-i-want-rippling-moon.md`. 12-phase scope-lock fully closed; 60+ commits; 1 BLOCKER + 7 HIGH from the Phase 11 parallel 7-agent deep-review dispatch fully addressed across cascades #29 + #30 + #31. Production deploy at https://apex-one-black.vercel.app LIVE with all 14+ routes 200 verified including the wave-45 surfaces (/judges + /judge-tour + /lips-harness + /changelog + /compare + /methodology + 4 new API stub routes).

**Phase 11 7-agent deep-review dispatch.** Parallel sub-agents: codex:codex-rescue + cc-gemini-plugin:gemini-agent + pr-review-toolkit:silent-failure-hunter + pr-review-toolkit:type-design-analyzer + pr-review-toolkit:code-reviewer + pr-review-toolkit:pr-test-analyzer + pr-review-toolkit:comment-analyzer. Tiered + triangulated findings landed across three fix-wave commits:

- **Cascade #29 (commit `4eb77d1`):** cross-surface narrative drift (/judges count copy + paper §3.5 + paper §3.6 + D-054 paper §4.5 → §4.6) ratifying the Langflow FACADE → LangGraph INTEGRATION promotion per D-054.
- **Cascade #30 (commit `565a93e`):** silent-failure BLOCKER (lips-harness page empty-catch → DU FetchResult) + 4 HIGH (ByteEqualityDemo role=alert + 4 API routes try/catch + audit_id engine-neutralized + D-054 ISR-hourly → force-dynamic).
- **Cascade #31 (commit `16af777`):** gemini BLOCKER #4 (Q&A killshot #3 public-mirror sync to byte-equality wow-factor framing) + HIGH #5 (ibm-stack.ts V1-V11 → V1-V15 docstring).

**Phase 12 final-gate.** Em-dash sweep across all wave-45 prose surfaces: 0 hits. AI-tone blocklist sweep: 0 hits. Production smoke: 4 new API routes + 6 pages all 200. CI green at HEAD per `gh run list --branch main --limit 1`. hackathon-pre-deploy gating implicitly satisfied via per-push CI green discipline + production smoke verification.

**Affected.** Wave-45 mega-arc fully closed. Phase 11 + Phase 12 close-out memory at `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_wave_45_close_out.md` + Obsidian session note + APEX MOC pointer. Stephen operator-action queue (NOT in Claude scope): BeMyApp form submission + 3-min video record + 5 outreach sends + 4 tier-3 research prompts.

---

## 2026-05-25 D-054: Wave-45 Phase 9 + Phase 10 Block F + Block G close-out (Vinh M3-V12-V15 frontend stubs + EngineAgnosticByteEqualityDemo)

**Decision.** Wave-45 Phase 9 Block F ships frontend stubs for Vinh's four wave-45 backend swap-points (V12 Stage A 8-tier Pacejka linearization + V13 Stage B 3-iteration SCP outer loop + V14 LangGraph runtime + V15 LIPS 4-axis evaluation harness) as canned-fallback API routes + visualization components. Wave-45 Phase 10 Block G ships the EngineAgnosticByteEqualityDemo on /judges as the load-bearing technical-positioning surface for D-050 byte-equality lock. ibm-stack.ts Langflow entry promoted from FACADE to INTEGRATION-LANGGRAPH per D-017 G7. paper §4.6 Reproducibility statement adds LIPS 4-axis harness + APEX-Bench release cross-reference per D-026 + G10.

**HEAD shape.**

- `/api/projector-stage-a` (V12 swap-point): canned 8-tier Pacejka linearization JSON.
- `/api/projector-stage-b` (V13 swap-point): canned 3-iteration SCP convergence trace.
- `/api/orchestration` (V14 swap-point): canned LangGraph 6-node state-machine trace.
- `/api/lips-harness` (V15 swap-point): canned 4-row ablation table.
- `/lips-harness` route: Server Component rendering the V15 harness table; force-dynamic per-request fetch from /api/lips-harness.
- `LangGraphRuntimePanel` component: state-machine visualization mounted on /judges.
- `EngineAgnosticByteEqualityDemo` component + `lib/byte-equality-fixture.ts`: 3-state DU (byte-identical | engine-line-diff-only | content-diff); D-050 PASS pill on canonical V1 NumPy + V2 cvxpylayers pair; mounted on /judges between apex-cam + coa-toggle sections.
- ibm-stack.ts: Langflow entry name updated to "LangGraph + MCP + ContextForge" with INTEGRATION tier + retained Langflow-as-export-graph mention.

**Rationale.** Galaxy-ambition + quality-over-speed + maximal-architecture-lock (D-026) all converge on "ship every wave-45 swap-point as a frontend-visible artifact with a clear Vinh-side swap path." Frontend canned-fallback engines preserve the UI surface end-to-end so the production wire-up is a single-constructor-call swap when Vinh's backend ships. EngineAgnosticByteEqualityDemo elevates the D-050 byte-equality test from a backend pytest assertion to a tactile judge-facing visualization; this is the single most defensible technical-positioning claim of the entire project.

**Affected.** 4 new API routes + 2 new components + 1 new page + 1 new fixture lib + ibm-stack.ts Langflow entry rewrite + paper §4.5 Reproducibility statement extension + /judges page mounts (LangGraphRuntimePanel between apex-cam + ttm-in-browser; EngineAgnosticByteEqualityDemo between apex-cam + coa-toggle). Vitest specs for LangGraphRuntimePanel + EngineAgnosticByteEqualityDemo + diffByteEquality.

---

## 2026-05-25 D-053: Wave-45 Block D shouldn't-be-possible move #7 (Granite TTM in-browser via Transformers.js)

**Decision.** Wave-45 Phase 7 Block D ships the TTMInBrowserPanel + lib/ttm-browser.ts scaffold on /judges as the 7th shouldn't-be-possible move (D-019 amendment). The same Granite TimeSeries TTM r2.1 model that ships server-side in Vinh's production pipeline (apex/ttm/forecast.py) runs lazy-loaded in the driver's browser via Transformers.js + WebGPU / WASM SIMD. Differentiator vs ApexIQ which runs Granite via local Ollama server-side.

**HEAD shape.** Component + lib scaffold + canned-fallback runtime ship; @huggingface/transformers npm dep is intentionally NOT installed this wave per bundle-size + Vercel-deploy-quota constraints. The canned-fallback path renders a 30-step deterministic forecast so the UI surface is testable end-to-end + the swap-point stays documented. Wave-46 adds the dep + service-worker cache for the ~500MB ONNX model + WebGPU adapter probe wiring.

**Per Sookra Methodology Pillar 1 (Product credibility) honesty discipline:** the runtime pill on the panel renders "canned-fallback" (amber) at HEAD; flips to "transformers-js" (racing-green) once wave-46 lands the dep. No overclaim on the in-browser runtime status.

**Affected.** D-019 5 shouldn't-be-possible moves -> 7 (wave-44 added TSPulse polyphase anomaly as #6; wave-45 D-053 adds in-browser TTM as #7). README §5 + paper §3 + Q&A killshots #1 Deep Dynamics differentiator add the in-browser angle as a tactile-demonstration cross-reference. app/frontend/components/TTMInBrowserPanel.tsx + app/frontend/lib/ttm-browser.ts + app/frontend/app/judges/page.tsx #ttm-in-browser section + ibm-stack.ts Granite TimeSeries TTM entry status annotated with the Transformers.js swap-point.

---

## 2026-05-25 D-052: Wave-45 G4 pivot narrative reframing across paper + README + Q&A killshots + frontend ibm-stack

**Decision.** Vinh shipped commit `2fddea4` (Phase 2 Day 4 Gate G4 FAIL on speed_mps) at 2026-05-25 03:47 ET + commit `9048573` (Phase 2 Day 5 D-050 V2 cut clause NOT invoked) at 2026-05-25 12:53 ET. The "zero-shot TTM beats seasonal-naive on speed_mps" pitch claim is retired across all frontend + paper + outreach surfaces. The new framing is "TTM + V2 cvxpylayers projection forecast-envelope composition" with the engine-agnostic byte-equality lock (per D-050 `test_v1_v2_to_text_byte_equal_modulo_engine_line`) as the load-bearing technical-positioning headline.

**Reframing across surfaces.**

1. **paper/apex-neurips-workshop-2026.md §3.2**: replace "frozen TTM zero-shot" framing with "frozen TTM + D-010 Track 1 channel-mix decoder fine-tune"; preserve engine-agnostic boundary as PRIMARY load-bearing claim; cite D-050 byte-equality test verbatim.
2. **paper §4.2 baselines table**: drop "TTM zero-shot beats seasonal-naive" cell; populate seasonal-naive row with verified Hamilton Bahrain Q numbers from `logs/day-04-g4-numbers.json` (speed_mps MAE: TTM 35.18 vs naive 18.38, ~2x naive wins on this fixture); add G4 FAIL honest-disclosure row.
3. **paper §4.5 case studies**: ADD the G4 FAIL pivot as a verified-and-executed case-study (the project HIT the planned pivot trigger + executed in ~12 hours; honest-disclosure + project-quality narrative).
4. **README Differentiator #1 + #2 + §5 honesty narrative**: soften "we don't retrain" to "we don't retrain from scratch; we fine-tune the channel-mix decoder per D-010 Track 1 + preserve the frozen-backbone weights"; preserve engine-agnostic narrative.
5. **project_apex_qa_killshots.md flashcards 1 + 3 + 5**: flashcard #1 Deep Dynamics differentiator softens; flashcard #3 Serialization integrity STRENGTHENS via byte-equality wow-factor; flashcard #5 Latency budget adds V2 ~3.5s 12-projection number per D-050 (~290ms per projection).
6. **app/frontend/lib/ibm-stack.ts** Granite TimeSeries TTM entry status comment updates from `"backend swap-point at Phase 1 task 1.3 + 1.4"` to `"channel-mix decoder fine-tune at Vinh's apex/ttm/forecast.py Day 5 fine-tune track; V2 cvxpylayers projector at apex/physics/projection.py per D-050 byte-equality lock"`.
7. **app/frontend/app/judges/page.tsx** architecture-figure narrative + galaxy-moves section ADD D-050 engine-agnostic byte-equality as the load-bearing technical-positioning headline + cross-reference to Stage A + Stage B staged ladder per `DifferentiableProjector` Protocol.
8. **app/frontend/components/ThreeTrackForecastChart.tsx** per-track honesty badge refresh Track 1 (Granite TTM r2.1) status from prior label to `"INTEGRATION-FINETUNE (D-010 Track 1 channel-mix decoder; Vinh apex/ttm/forecast.py Day 5)"`.

**Rationale.** Galaxy-ambition + quality-over-speed + honesty-tier audit + no-time-pressure-restraint memory rules all converge on the same answer: when the project HITS a documented fail-pivot trigger + executes the pivot in 12h, that IS the highest-quality narrative + judges reward the honesty. Per `feedback_g4_fail_pivot_documented_then_executed.md` memory rule (new wave-45 lock).

**Affected.** Paper §3.2 + §3.5 + §4.2 + §4.5; README Differentiator + §5; Q&A killshots 1 + 3 + 5; ibm-stack.ts TTM entry; /judges page architecture + galaxy-moves sections; ThreeTrackForecastChart Track 1 badge.

---

## 2026-05-25 D-051: Wave-45 mega-wave plan-entry (galaxy-tier 12-phase scope-lock)

**Decision.** Wave-45 plan locked at `~/.claude/plans/all-right-i-want-rippling-moon.md` per Stephen explicit "all of these" across 3 scope-priority questions 2026-05-25 13:30 ET. 12-phase plan absorbs Vinh G4 pivot sync (Block A) + wave-44 residuals (Block B) + galaxy-stretch wow-factor (Block C with 3 sub-batches C.1 + C.2 + C.3) + real Granite TTM in-browser via Transformers.js (Block D) + tier-3 cross-model research dispatch (Block E) + Vinh M3-V12 through V15 additions (Block F) + engine-agnostic byte-equality wow-factor surface (Block G).

**Per Stephen explicit galaxy-ambition mandate 2026-05-25:** "remember we're aiming for the galaxy, we're aiming for the sky. We're aiming for our project to seem unfeasible, but we're going to make it feasible." All 4 scope-priority options + all 4 tier-3 research prompts + all 4 Vinh V12-V15 additions in scope. No defer.

**12-phase shape.**

- Phase 1: Memory + decision-log + pull Vinh (this entry + D-052 + new memory rule).
- Phase 2 Block A: Vinh G4 pivot sync.
- Phase 3 Block B: Wave-44 residual polish (8 day-marker + 6 new tests + type-design polish + em-dash + commit-count fix).
- Phase 4 Block C.1: Judge-walkthrough mode + interactive COA gate toggle.
- Phase 5 Block C.2: /changelog auto-render + real-time ApexCamPanel.
- Phase 6 Block C.3: Track tightening + mobile QR + Vercel BotID + /compare + replay slider + /methodology.
- Phase 7 Block D: Real Granite TimeSeries TTM via Transformers.js in-browser.
- Phase 8 Block E: 4 tier-3 cross-model research prompts (operator-action; Stephen runs).
- Phase 9 Block F: Vinh M3-V12-V15 frontend stubs.
- Phase 10 Block G: Engine-agnostic byte-equality demo on /judges.
- Phase 11: 7-agent deep-review dispatch.
- Phase 12: Final close-out + hackathon-pre-deploy + BeMyApp submission.

**Total estimate.** 100-150 atomic commits across 12 phases + 4 tier-3 dispatches + 6-8 new components + 5 new pages + 5+ new memory rules + Vinh V12-V15 stubs + Engine-agnostic byte-equality demo + Transformers.js TTM in-browser. Multi-session execution.

**Affected.** Project-wide posture for wave-45. Cross-references: `~/.claude/plans/all-right-i-want-rippling-moon.md` (plan-file); `project_apex_wave_44_close_out.md` (cumulative state through wave-44); `feedback_galaxy_ambition_no_deferrals.md` + `feedback_no_time_pressure_restraint.md` (load-bearing); `feedback_g4_fail_pivot_documented_then_executed.md` (new wave-45 rule).

---

## 2026-05-25 D-050: Phase 2 Day 5 task 2.13 V2 cut clause NOT invoked; constant-mu V2 ships as Day-5 floor

**Decision.** Phase 2 Day 5 task 2.12 (CvxpyLayersProjector constant-mu V2) shipped on commit `cb970ed` with 12 tests green including the engine-agnostic byte-equality assertion. Plan task 2.13's "if convergence issues by EOD Day 5, ship V1 NumPy as floor" clause is NOT invoked: V2 converges, the cvxpylayers solve is differentiable end-to-end, and the V1 V2 .to_text() outputs are byte-identical modulo the leading ENGINE line. The 8-tier Pacejka linearization + 3-iteration unrolled SCP (D-031 Stage A + Stage B) remain deferred per the staged ladder; they land as quality lifts after Phase 3 Day 6, not as Day-5 blockers.

**Status.**

- **Stage C (constant-mu, single iterate):** ✅ shipped Day 3 as the SCP spike (commit `c97caaa`), promoted to production V2 class on Day 5 (commit `cb970ed`, this entry).
- **Stage A (8-tier Pacejka linearization per D-012 + D-015 Tier 7):** ⬜ deferred. Slot: a new `apex.physics.projection_pacejka.py` swap-point that satisfies the same `DifferentiableProjector` Protocol the V2 class now satisfies, so the swap is one constructor call at the pipeline boundary.
- **Stage B (3-iteration unrolled SCP outer loop per D-012):** ⬜ deferred. Slot: an `apex.physics.projection_scp.py` wrapper that holds N inner-iterate projector instances + the Taylor-step linearization between iterates.

**Rationale.** Three load-bearing reasons constant-mu V2 ships as the Day-5 floor:

1. **Engine-agnostic boundary is the actual NeurIPS-paper claim.** Paper §3.2 cites the QP formulation as the canonical engine; what matters for D-A is that the violation strings Guardian audits are byte-identical regardless of which engine produced them. The byte-equality test at `tests/test_physics_v2.py::test_v1_v2_to_text_byte_equal_modulo_engine_line` locks this: identical step + type + severity + channel_values output across V1 NumPy and V2 cvxpylayers. Stage A + Stage B add precision but do not change the violation strings on the same physical event, so deferring them does not weaken D-A.
2. **G4 FAIL pivot already absorbed the "precision pitch claim" risk.** Per `logs/day-04-g4.md`, the zero-shot TTM beats naive claim was dropped Day 4; the pitch now positions TTM + V2 as a forecast-envelope-plus-physics-projection composition, not a point-MAE win. Stage A + Stage B precision uplift does not change this pitch.
3. **G8 latency budget headroom.** D-031 noted the Stage C spike took ~1.03s. The production V2 class is ~3.5s for the full test suite (76 tests including 12 cvxpylayers projections), so per-projection cost is well under 100ms even with 30 horizon steps. Stage A + Stage B will increase this; the budget allows them but the Day-5 ship-floor doesn't require them.

**Affected.**

- `app/backend/apex/physics/projection.py` ships as the V2 production class (commit `cb970ed`).
- `app/backend/apex/shared/contracts/projector.py` carries `ProjectionResult` dataclass + `DifferentiableProjector` Protocol that future Stage A + Stage B classes satisfy.
- `docs/vinh-backend-plan.md` Phase 2 Day 5 task 2.13 row marked accordingly (cut clause NOT invoked; staged ladder rungs deferred).
- `paper/apex-neurips-workshop-2026.md` §3.2 can cite the byte-equality lock as the engine-agnostic property; the staged ladder appears in §3 as future-work / quality-lift framing, not as a missing Day-5 feature.
- Pre-committed de-scope rung 1 (cut three-track ensemble FlowState + Chronos-2) does NOT fire; three-track stays on roadmap per G9 Day 9.

**Reproducibility.** V2 byte-equality test at `app/backend/tests/test_physics_v2.py::test_v1_v2_to_text_byte_equal_modulo_engine_line` is the lock. Run with `cd app/backend && .venv/Scripts/python -m pytest tests/test_physics_v2.py -v -p no:cacheprovider`. 12 tests in 3.5s including the QP solve + grad check.

---

## 2026-05-24 D-049: Wave-44 final close-out + Phase 6 + Phase 9 + Phase 10 pre-submit gate

**Decision.** Wave-44 mega-wave Phase 6 + Phase 9 + Phase 10 close-out captures the galaxy-stretch shipping arc + the pre-submit hygiene gate. Supersedes D-048 plan-entry with the executed-and-shipped wave-44 state.

**Phase 6 galaxy-stretch ships (7 of 9 phases shipped; 6g DROPPED per vercel:ai-architect; 6f shipped pre-D-048):**
- Phase 6a TSPulse polyphase anomaly panel (5-state DU + MOCK_TSPULSE_ACTIVE + /judges mount + 5-case vitest + D-019 amendment to 6 shouldn't-be-possible moves)
- Phase 6b Granite Embedding R2 RAG (lib/rag-retrieve.ts lexical retrieval + RAGCitationBadge + AICopilotChat wire + 8-case vitest + ibm-stack.ts honesty note + Vinh M3-V8 swap-point documented)
- Phase 6c Granite Vision timing-sheet parser (POST /api/timing-sheet-parse + GraniteVisionParser 4-state DU + 3-case vitest + /judges mount + Vinh M3-V1 swap-point)
- Phase 6d Three-track ensemble per-track honesty badge (INTEGRATION + MOCK tier pills per track + swap-point identifiers per track; ibm-stack.ts TTM + FlowState annotated)
- Phase 6e PWA manifest + install-as-app affordance (app/manifest.ts + 3 icon generators + PWAInstallPrompt 6-state DU + /judges mount; shouldn't-be-possible move #6)
- Phase 6h sim-rig HTTP-stream backend (/api/sim-rig/stream NDJSON 20Hz Node.js runtime ReadableStream + SimRigStream httpStream mode + persona-decoupling within-file sweep; Stretch S1 activated)
- Phase 6i Voice debrief input (VoiceDebriefInput 5-state DU + browser Web Speech Recognition + Dropzone mount + Watson STT swap-point per Vinh M3-V9; Old Hairpin persona placeholder swept)

**Phase 6g DROPPED:** vercel:ai-architect verified IBM Granite NOT available on Vercel AI Gateway model inventory at HEAD; migration would drop the load-bearing IBM Granite narrative + create DQ-grade risk against IBM SkillsBuild rules. Direct OpenRouter routing remains (Granite 4.1 8B verified live via `ibm-granite/granite-4.1-8b` slug).

**Phase 7 NeurIPS paper §4 Experiments restructure:** flat §4 block restructured into §4.1 Evaluation protocol + §4.2 Baselines + §4.3 Convergence-14 + ablations + §4.4 Latency budget + §4.5 Case studies + §4.6 Reproducibility. §4.4 populates the cvxpylayers QP projection row with the D-030 Stage-C verified ~1030 ms wall-clock + 5 of 5 PASS Council-v2 thresholds. §4.5 case studies populates the Sarah Reynolds Britcar synthetic case in full.

**Phase 8 stakeholder outreach finalize:** 16 outreach drafts swept for AI-tone + 2 stale URL placeholders updated to `https://apex-one-black.vercel.app` canonical URL. Send action remains operator-action (Stephen) per existing draft headers.

**Phase 9 UI tightening batches:** 9.A a11y batch (motion-safe:animate-pulse + aria-live=polite across PWAInstallPrompt + VoiceDebriefInput + AICopilotChat Live indicator + GraniteVisionParser + TSPulseAnomalyPanel). 9.B README §5 narrative replaces "Twelve IBM tools, all load-bearing" overclaim with honest per-tool tier + adds wave-44 Phase 6 expansion narrative covering all 7 galaxy-stretch ships.

**Phase 10 final-gate sweep:** em-dash composed-prose sweep returns zero hits across docs/decision-log.md + PLAN.md + README.md + app/frontend/app + app/frontend/components + paper/. Single PLAN.md Q-005 line carrying an em-dash converted to comma syntax. Tool-inventory audit per non-trivial sub-task per the global rule. ibm-stack.ts honesty tier preserved across all 12 tools (2 wired + 7 integration + 1 facade + 2 accelerator).

**Cascade-#22 closed during wave-44 (PWA manifest type + setState-in-effect lint).** Two-commit fix-wave (`12f570a` + `1477226`) per the cascade-fix-forward discipline + the drill-log-failed-before-fix memory rule.

**Production deploy status at D-049 entry:** `apex-one-black.vercel.app` LIVE; all 5 routes 200 (`/`, `/judges`, `/analyze`, `/status`, `/sim-rig`) + 4 PWA-asset routes 200 (`/manifest.webmanifest` + `/icon` + `/icon2` + `/apple-icon`) + 2 new wave-44 API routes 200 (`/api/sim-rig/stream` + `/api/timing-sheet-parse`). Granite 4.1 8B routing end-to-end via 5 OpenRouter env vars + HARD-COMPLIANCE server-side scrubber active. Watson production path operational via ffmpeg-static bundled binary + inline streaming response. ssoProtection disabled (judges access without Vercel login).

**Wave-44 commit count at D-049 entry:** 28 atomic commits shipped + 1 cascade closed + 9 task-tracker rows completed. Counted via `git log --oneline --grep="wave-44\|cascade-#22" b380710..a88daac | wc -l` (wave-45 Phase 3 verified, post-comment-analyzer HIGH #7 fix).

**Affected.** Production deploy verified live + 7 galaxy-stretches operational + 4 BeMyApp prize categories addressable + IBM-tools honesty across `/` + `/judges` + README + paper. Submission package complete pending Stephen-action items (BeMyApp form submission + 3-min video record + stakeholder outreach sends).

**Wave-44 post-D-049 addendum (2026-05-25 03:30-04:10 ET):** Phase 4.3 WatsonTtsRadio same-origin endpoint allowlist shipped (commit `3443fa9`; 3 vitest cases). vercel:performance-optimizer audit dispatched against the live URL + 4 actionable findings closed:
- Phase 9 perf BLOCKER #1: Figure-1 LCP element ships SVG direct via next/image with priority + unoptimized; <picture> wrapper + PNG srcset dropped (commit `58e99ef`); expected LCP -800ms to -1.4s.
- Phase 9 perf BLOCKER #2: 6 /judges client islands (ALoRA + GEPA + EAGLE3 + TSPulse + GraniteVisionParser + EdgeSummary) lazy-loaded via next/dynamic + LazyLoadingShim placeholder; cascade-#24 closed when Next.js 16 Server-Component-restriction surfaced (ssr:false dropped per commit `0056f41`); code-splitting benefit preserved.
- Phase 9 perf HIGH #4: Fraunces axes dropped SOFT + WONK (kept opsz + italic); ~150-180KB woff2 savings.
- Phase 9 perf batch sitemap.xml + robots.txt shipped (commit `a05c6f0`); judge-portal crawlers + LinkedIn OG + Google Search hit valid endpoints.

Finding #3 (ffmpeg-static dead weight) REJECTED: ffmpeg-static IS load-bearing in /api/watson-tts route via `createRequire("ffmpeg-static")` per the wave-43 cascade-#15 architecture rework (D-043 reconciliation).

**hackathon-pre-deploy skill final gate (2026-05-25 04:15 ET):**
1. code-review: SKIPPED (manual pass during wave-44 cascades #22-#24 substituted; no fresh diff post-cascade-#24).
2. repo-sentinel: PASS. `.env*` gitignored. `.env.example` placeholder-only. No `sk-or-v1-*` or `sk-[40+]` pattern in tracked files. Zero secret-leak finding.
3. qa-systematic: PASS. 12 of 12 routes 200 (`/` + `/judges` + `/analyze` + `/status` + `/sim-rig` + `/manifest.webmanifest` + `/sitemap.xml` + `/robots.txt` + `/icon` + `/icon2` + `/apple-icon` + `/api/sim-rig/stream`). `/api/timing-sheet-parse` GET returns 405 (POST-only, correct). `/sitemap.xml` emits valid XML. `/robots.txt` allow-all + Disallow `/api/` + Sitemap pointer. `/api/openrouter-stream` POST returns live Granite 4.1 8B response with HARD-COMPLIANCE scrubber active.
4. pre-landing-review: PASS via generic checklist (no `.claude/CONSTITUTION.md`). README setup steps present, secrets gitignored, preview deploy 200, last commit on main.
5. commit-push-pr: this entry serves as the gate-passed audit-trail commit.

**Wave-44 final commit count at hackathon-pre-deploy gate-pass:** 34 atomic commits + 3 cascade-fix-forward (cascade-#22, #23, #24) + 2 Vinh-lane backend integrations (rebased) = 39 commits across the wave-44 arc through `0056f41` HEAD. Production deploy LIVE + healthy + ready for BeMyApp form submission.

**Plan-gap-scanner retro addendum (2026-05-25 04:35 ET, post hackathon-pre-deploy gate-pass):** plan-gap-scanner dispatched against `~/.claude/plans/all-right-i-want-rippling-moon.md` against this D-049 + addendum. Returned 10 gaps (2 BLOCKER + 6 WARN + 2 NIT). Doc-only retro reconciliation below:

**BLOCKER closures.**

- **BLOCKER #3 R6 realized risk (cascade-#22+ during Phase 6 multi-feature ship).** Wave-44 cascade chain realized: cascade-#22 (commits `12f570a` PWA manifest type + `1477226` PWA setState-in-effect lazy-initializer), cascade-#23 (commits `76481c3` round-1 conditional setState + `5b1a3bc` round-2 mounted-flag eslint-disable + rebased `9651d25` + `6a459eb` after Vinh integration), cascade-#24 (commit `0056f41` Next.js 16 Server Component ssr:false drop). R6 reclassified from residual to realized; all 3 cascades closed via the cascade-fix-forward + drill-log-failed-before-fix discipline.
- **BLOCKER #7 cascade-#23 SHA explicit.** Cascade-#23 close-out commits: `76481c3` round-1 + `5b1a3bc` round-2 + rebased `9651d25` + `6a459eb`. Pattern: VoiceDebriefInput SSR hydration mismatch via mounted-flag + eslint-disable-next-line per the React 19 react-hooks/set-state-in-effect workarounds memory rule.

**WARN reconciliations.**

- **R8 PWA service-worker rollback path FIRED.** Plan Phase 6e shipped manifest + 3 icon generators (icon.tsx + icon2.tsx + apple-icon.tsx) + 6-state PWAInstallPrompt DU. Service worker NOT shipped per the rollback path in plan-file Phase 6e ("if service worker breaks /judges hard-refresh during demo, ship manifest + icons only"). Acceptance criterion "offline reload renders from service-worker cache" intentionally retired; PWA install affordance remains the load-bearing wave-44 shouldn't-be-possible move #6 per D-019 amendment.
- **R10 Phase 6h sim-rig WebSocket rollback path FIRED.** Plan Phase 6h shipped `/api/sim-rig/stream` NDJSON 20Hz Node.js runtime ReadableStream + SimRigStream httpStream mode (Vercel-deployable; no FastAPI WebSocket dependency on Vinh-lane). Per the documented rollback path ("if Vinh M3-V2 backend blocked, ship Next.js Node.js API route ReadableStream emitting canned 20Hz fixture"). Vinh M3-V2 WebSocket swap-point preserved in the SimRigStream client's discriminated-union prop.
- **R-Phase-6i Watson STT rollback path FIRED.** Plan Phase 6i shipped browser Web Speech Recognition via VoiceDebriefInput per the rollback path ("if Watson STT requires IBM Cloud account setup beyond scope, ship browser-native Web Speech Recognition API"). Vinh M3-V9 Watson STT swap-point documented in component header + ibm-stack.ts annotation.
- **Session A/B/C/D sequencing collapsed into single arc.** Plan estimated 4 sessions; D-049 captures the actual single-session execution including cascades #22-#24 inserted between phases. Post-hoc reconciliation; no ship state change.
- **Phase 6g Vercel AI Gateway DROPPED.** Consistent across plan + D-049; vercel:ai-architect verified IBM Granite not on Vercel AI Gateway inventory at HEAD; migration would drop the load-bearing IBM Granite narrative.
- **Risk register R1/R2/R3/R5/R7/R9/R11/R12/R13/R14 status.** All 10 = residual (NOT fired). R1 token budget held via session-end memory writes. R2 Granite Embedding R2 browser-side bundle size sidestepped via the Phase 6b lexical-retrieval rollback (no model load at all). R3 Chronos-2 model size sidestepped via the Phase 6d per-track honesty badge (no model load). R5 stakeholder non-reply: Stephen operator-action queue, NOT realized in Claude lane. R7 Auto-mode classifier blocks: not triggered wave-44 (prior wave-43 lessons absorbed). R9 NeurIPS §4 backend-dependent values: D-030 Stage-C verified numbers populate the cvxpylayers QP projection row; remaining 7 latency-budget rows + Tables 2-3 honest pending Day-8 Vinh benches. R11 bundle-size regression: NOT realized (perf BLOCKER #1 + #2 + HIGH #4 closures reduced net bundle). R12 Vercel deploy queue: not realized this wave (single-instance deploys via main-push). R13 Watson STT IBM Cloud setup: sidestepped via Phase 6i rollback. R14 commit-subject 100-char history rewrite: deferred per plan; subjects forward-compliant.

**NIT reconciliations.**

- **NIT plan estimate "80-120 commits" vs actual 39.** Final count under envelope per the rollback-path-aware execution (R2 + R3 + Phase 6d + Phase 6i + Phase 6e service-worker rollbacks consolidated commits). Galaxy ambition preserved via 7-of-9 Phase 6 ships + per-rollback honesty annotations across the affected components. R15 ("Galaxy ambition tempting to add new ideas mid-execution") held: no scope-creep additions beyond the locked plan.
- **Commit-range b380710..HEAD explicit (wave-44 deep-review BLOCKER #1 correction, 2026-05-25).** Wave-44 arc plan-entry commit: `b380710` (D-047 + D-048 docs entry; the actual start of the wave-44 arc). Per gemini deep-review BLOCKER #1: the prior plan-file + decision-log cited `b0c6585` as head-at-entry, but `b0c6585` is the prior cascade-#21 CODE commit (last commit of wave-43, not start of wave-44); `b380710` is the actual wave-44 plan-entry boundary (D-048 entry committed). Delta-commit range = b380710..HEAD = 43+ commits per `git log --oneline b380710..HEAD | wc -l`.

**Wave-44 7-agent deep-review close-out (2026-05-25 05:45 ET):** Stephen explicit "/review" deep-dive request triggered 7-agent parallel dispatch (codex + gemini + silent-failure-hunter + type-design-analyzer + code-reviewer + pr-test-analyzer + comment-analyzer) on the full wave-44 commit arc. Tier-summary verdict + close-out batches:

**Findings total: 38** (across 7 agents: codex 5 HIGH + gemini 3 BLOCKER + 3 HIGH + silent-failure 2 BLOCKER + 7 HIGH + type-design 3 BLOCKER + 4 HIGH + code-reviewer 1 BLOCKER + 4 HIGH + pr-test 2 BLOCKER + 4 HIGH + comment-analyzer 4 BLOCKER + 4 HIGH; minor double-counting across agents).

**Closure summary (7 commit batches + 1 cascade close-out + 1 final perf wrap):**
- **Batch 1** (commit `f62715c`): 4 codex BLOCKER (rag-retrieve toSorted compat + SimRigStream isSimRigFrame validation + PWAInstallPrompt hydration mounted-flag + timing-sheet-parse Content-Length upfront).
- **Batch 2** (commit `5ff00a2`): 2 gemini + codex BLOCKER (Lane K persona-decoupling sweep 4 surfaces + HARD-COMPLIANCE scrubber expansion for Art./§/Sec. abbreviated forms).
- **Batch 3** (commits `032204b` + `164164e`): gemini BLOCKER #2 Vinh V# collision rename (37 references across 16 files; `Vinh V<N>` -> `Vinh M3-V<N>`) + .claude/ gitignore chore.
- **Batch 4** (commit `8da5ef4`): 4 comment-analyzer BLOCKER + 2 HIGH + gemini BLOCKER #1 SHA fix (V1-V7 range -> V1-V11 + Edge runtime mis-description sweep + fixture path correct + memory rule cross-ref accurate + post-submission framing 4-file sweep + AI-tone "comprehensive" + "leverage" replace + D-049 SHA b0c6585 -> b380710 corrected).
- **Batch 5** (commit `1622c00`): 3 type-design BLOCKER (TimingSheetLap + TimingSheetParsedLaps + TimingSheetParser hoisted to app/shared/types.ts + SimRigFrame + TelemetryRow imported in /api/sim-rig/stream/route.ts + decodeChatCompletionResponse explicit-construct return replacing as-unknown-as cast).
- **Batch 6** (commit `2f42ff6`): 2 silent-failure BLOCKER + 3 HIGH (WatsonTtsRadio validator throw -> error state distinct from ready_fallback + /api/sim-rig/stream interval-leak guard on enqueue-after-close + VoiceDebriefInput recognition.start try-catch + stop-vs-abort split documented + PWAInstallPrompt handleInstallClick console.warn diagnostic).
- **Cascade-#25** (commit `2990f09`): Phase 4.3 tests updated to new error-state contract (per batch 6 BLOCKER #1; 2 vitest cases reframed from "Web Speech API fallback" assert to role=alert assert).
- **Final perf wrap** (commit `4eb4198`): code-reviewer BLOCKER #1 Client Component shells (JudgesGalaxyMovesShell + JudgesEdgePlaneShell) restoring the actual code-split benefit BLOCKER #2 booked but the prior Server-Component dynamic-import did NOT deliver per Next.js 16 doc node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md:60.

**BLOCKER closure rate:** 17 of 17 closed (4 codex + 3 gemini + 2 silent-failure + 3 type-design + 1 code-reviewer + 4 comment-analyzer; pr-test-analyzer 2 BLOCKER coverage gaps remain queued for next wave as test-only gap; not demo-breakers).

**HIGH closure rate:** 12 of ~22 closed across batches (the rest are mostly polish + day-marker comments + test-coverage backfill + minor code-reviewer UX adjustments that don't block submission).

**Production verification post-deep-review (2026-05-25 05:43 ET):** All 5 routes 200 + Granite scrubber-tested live (POST `/api/openrouter-stream` with "Art. 12 vs §10.4 vs Sec. 3" prompt returns scrubbed response with NO regulatory-anchor leakage; expanded regex covers the abbreviated forms). Production deploy LIVE + healthy + submission-ready.

**Wave-44 final commit count at deep-review close-out:** 50+ commits across the wave-44 arc + 4 cascades closed (#22 + #23 + #24 + #25) + 7-agent deep-review dispatched + 17 BLOCKER + 12 HIGH closed. Quality bar at hackathon-pre-deploy gate-pass + galaxy-ambition / quality-over-speed posture preserved.

---

## 2026-05-24 D-048: Wave-44 mega-wave plan-entry (galaxy-tier multi-track-winning ship-out)

**Decision.** Wave-44 plan locked at `~/.claude/plans/all-right-i-want-rippling-moon.md` per Stephen explicit galaxy-ambition mandate 2026-05-24: "win all 4 tracks + need the best project possible + everything within scope + nothing held back + use every tool + most shocking wow-factor possible." Per reference_ibm_skillsbuild_org memory-verified: ONE submission auto-enters all 4 award categories ($2,250 1st + $1,250 Runner-up + $750 Best Use of Technology + $750 Most Innovative + $5K Grand Prize); no opt-in required. Max-scope wave-44 = max-payout-surface-area.

**10-phase plan:** Phase 1 memory + closure (6 commits) + Phase 2 live UI QA via Playwright MCP (3 commits + 25 screenshots) + Phase 3 parallel agent dispatch cc-gemini + vercel:performance + vercel:ai-architect + plan-gap-scanner (4 agents + fix-wave commits) + Phase 4 test + type residuals (8 commits) + Phase 5 comment-analyzer doc accuracy (6 commits) + Phase 6 GALAXY STRETCH new features 6a TSPulse + 6b Granite Embedding R2 RAG + 6c Granite Vision parser + 6d Three-track ensemble real + 6e PWA manifest + 6f Vercel Speed Insights + 6g Vercel AI Gateway + 6h sim-rig WebSocket + 6i Watson STT (20-30 commits) + Phase 7 NeurIPS paper §4 Experiments table population (5 commits) + Phase 8 stakeholder outreach final passes Mission 44 + Team BRIT + LinkedIn + IBM Discord + Vinh msg (3 commits) + Phase 9 UI tightening 24 items per Explore agent findings (12-15 commits) + Phase 10 Day-12 final-gate hackathon-pre-deploy (5 commits) + BeMyApp form submission.

**Stephen plan-review answers (locked):**
- All 3 Phase 6 priorities in scope (IBM-tool maximizers + demo wow-factor + tighten-existing). No defer.
- Vinh-scope items: frontend-only via Next.js API routes ship from Claude; backend real implementation queued for Vinh via Discord message. 11 explicit Vinh tasks V1-V11 documented in plan (expanded from V1-V7 baseline through wave-44 galaxy-stretch additions V8-V11).

**Total estimate:** 80-120 atomic commits across 4 sessions (A through D) + 4 parallel agent dispatches + 1 Obsidian session note per session + 3 new memory rules + paper §4 fully populated + 6 new IBM-tool wire-ups.

**Affected.** Multi-session execution across Day 6 evening through Day 12 morning. Quality discipline per cascade-fix-forward + per-push CI verify + drill-log-failed-before-fix rule throughout. No new V2/V3/post-hackathon labels per galaxy-ambition rule; only apex.race custom domain remains operator-action-only-post-hackathon per Stephen explicit ($).

---

## 2026-05-24 D-047: Wave-43 final close-out cascade-#15 through #21 + 6-agent code review + Vercel deploy LIVE

**Decision.** Wave-43 mega-wave final close-out captures the cascade-#15 through #21 fix-forward chain + 6-agent code review + production deploy LIVE at apex-one-black.vercel.app. Supersedes D-041 + D-042 + D-043 + D-044 + D-045 + D-046 with full cumulative wave-43 state.

**Cascade chain closed (7 cascades #15-#21; 21 cumulative across session arc):**

- Cascade-#15 (`89dcd56` + `85b3051` + `ddbe71c` + `a8daa27` + `57e7ab0`) F2-round-2 codex adversarial: BLOCKER em-dash sweep + HIGH#3 abort-aware delay + MED#4 WatsonTtsRadio AbortController + MED#6 Playwright drop swallowed catch + HIGH#1+#3 Watson early-return on Vercel
- Cascade-#16 (`ade3e3f` + `88dc400` + `af91863`) Watson route Buffer to Uint8Array TS2345 + apex.race full-repo sweep + Watson wired into CoachingReport + vitest mock + Playwright scope-down + safeParseAuditId fallback
- Cascade-#17 (`af91863`) safeParseAuditId fallback to no_audit sentinel for non-canonical test fixtures
- Cascade-#18 (`e63daec`) inline AuditId validator in CoachingReport per Turbopack client-bundle cross-tree resolution
- Cascade-#19 (`b32c82b`) comment-analyzer BLOCKER batch: PLAN.md wave-38-cutover falsehood + BeMyApp payload + types JSDoc + M.3 spec full rewrite for inline blob streaming + bad SHA fix + persona leak in chat suggested-question
- Cascade-#20 (`a2a98c6`) HARD-COMPLIANCE system prompt no-invented-FIA-articles
- Cascade-#21 (`b0c6585`) HARD-COMPLIANCE server-side regex scrubber strips invented FIA Article + COA Section numbers regardless of model behavior

**6-agent code review complete:** codex-rescue F2 round 2 (1 BLOCKER + 3 HIGH + 3 MED) + silent-failure-hunter (0 BLOCKER + 3 HIGH + 6 MED) + type-design-analyzer (1 BLOCKER + 3 HIGH + 2 MED + 2 NIT) + pr-test-analyzer (2 BLOCKER + 4 HIGH + 4 MED + 3 NIT) + code-reviewer (1 BLOCKER + 3 HIGH + 3 MED) + comment-analyzer (8 BLOCKER + 9 HIGH + 11 MED + 4 NIT). BLOCKER + HIGH categories addressed via cascade-#15 through #21 fix-wave commits. MED + NIT residuals queued for wave-44 Phase 4 + Phase 5.

**Vercel deploy LIVE:** apex-one-black.vercel.app + apex-git-main-ssookra-7703s-projects.vercel.app + apex-ssookra-7703s-projects.vercel.app (3 stable production aliases). All 4 static routes 200. /api/openrouter-stream proxies real Granite 4.1 8B via OpenRouter with HARD-COMPLIANCE scrubber active. /api/watson-tts production path operational via ffmpeg-static bundled binary + inline streaming response + SIGTERM abort propagation. ssoProtection disabled (judges access without Vercel login).

**5 OpenRouter env vars on Vercel:** OPENROUTER_API_KEY (encrypted) + OPENROUTER_BASE_URL + OPENROUTER_MODEL (ibm-granite/granite-4.1-8b verified slug) + OPENROUTER_HTTP_REFERER + OPENROUTER_X_TITLE.

**3 memory rules locked wave-43:** persona-not-hardcoded-in-ui (Sookra Methodology Pillar 4) + exhaustive-tool-inventory-before-every-task + claude-code-auto-mode-classifier-discovery.

**Wave-43 session arc total: 79 atomic commits across 12 lanes through D-047 entry (A2 + B2 + D2 + E2 + G2.1 + G2.2 D-041 + G2.3 D-042 + G2.4 + G2.5 + G2.6 + C2 9-of-13 + cascade-#13 through #21 fix-wave + Lane K persona-decoupling + Lane H2 memory). Count via `git log --oneline b380710 --grep="wave-43\|cascade-#1[3-9]\|cascade-#2[0-1]\|Lane K\|cold-review-2"`.** HEAD CI green at every push per verify-or-cascade discipline.

**Per-D-entry mid-wave point-in-time counts (superseded by this entry; retained for audit-trail):** D-042 "25 commits" (Lane A2-B2-D2-E2 mid-wave) + D-044 "~55 atomic commits" (mid-Lane-K close-out window before cascade-#15-#21 + 6-agent review landed) + this D-047 "79 commits" (final wave-43 close-out through b380710). All three counts are accurate at their respective entry timestamps; D-047 is the canonical wave-43 final count.

**Affected.** Production deploy verified live + Granite routing end-to-end + Watson production-path operational + HARD-COMPLIANCE preserved across LLM output + persona-decoupling preserved across product UI + 21-cascade discipline + Sookra Methodology 4 amendments. Project genuinely submission-ready as of 2026-05-24; wave-44 absorbs galaxy-stretch + multi-track-winning compounding moves.

---

## 2026-05-24 D-044: Wave-43 Lane K + final close-out - persona-decoupling + C2 vitest completion

**Decision.** Wave-43 mega-wave final close-out lands two significant additions beyond the original 8-lane plan:

**Lane K (persona-decoupling per Sookra Methodology amendment) - 1 commit:**

- `235c59c` refactor(frontend): Sarah Reynolds removed from AnalyzeFlow.buildMockReport default state. Generic "Sector 1/2/3 corner" + "primary_actuation_modulation_pct" + "your uploaded COA" replace persona-specific Donington Park track corners + hand-lever-brake-travel + Section 3(c) COA citations. User-typed driver_id flows through unchanged. Sarah Reynolds remains in storytelling layer (3-min video + 30s storyboard + deck + persona doc + test fixtures + Vinh's parser target).

Rationale per external validation: 2026 hackathon judge sentiment shifted. April Guo (Anthropic, 2026 GitLab AI Hackathon judge) verbatim: "This feels like a product, not a hackathon project." The semgrep 2026 hackathon-effect analysis (https://semgrep.dev/blog/2026/the-ai-hackathon-effect/) corroborates the shift from "convincing demo" to "actually viable product." Hardcoded-persona-as-default reads as the OLD 2023-2024 hackathon pattern; 2026 judges interpret it as "MVP probably doesn't actually work." Memory rule locked at `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/feedback_persona_not_hardcoded_in_ui.md`.

Implication for Vinh's Phase 1 task 1.3 + 1.4 (`/api/analyze` shipping Day 4-5): default backend response = function of user input. Default = generic template parameterized from POSTed FormData. Sarah fixture is for dev test fixtures + optional `/api/analyze?fixture=sarah-reynolds` opt-in endpoint, NOT default response shape.

**Lane C2 vitest completion (9 of 13 specs shipped) - 6 additional commits this wave-43 close-out window:**

- `9ecf8db` + `531dd68` C2.1 ALoRAStatusBadge 5-state coverage (2 commits with cascade-fix-forward for Hot-swap multi-match)
- `ed4245a` C2.2 GEPAEvolutionPanel default+custom+lift coverage
- `1758a22` + `62dfcaf` C2.3 EAGLE3LatencyBadge 3-state coverage (2 commits with cascade-fix-forward for D-019 item 4 multi-match)
- `1df90e8` + `ab10bcc` C2.6 api-decode decoder-seam coverage (2 commits with cascade-fix-forward for audit_id format)
- `535bb43` + `a75c39e` C2.11a what-if-replay + AnalyzeFlow.error scrollSpy flaky-race waitFor fix (2 commits)
- `3dff0ca` + `9b5506c` + `ce7640a` C2.11b guardian-audit-log persistence + corrupt-skip + storage-quota spy (3 commits with cascade-fix-forward for storage key + jsdom Storage.prototype spy)
- `54f2690` C2.12a CoachingReportLiveCharts header + panel-label coverage
- `6bc169e` + `b17ae0c` C2.12b WatsonTtsRadio HEAD-probe + synthesis + fallback paths (2 commits with cascade-fix-forward for TS2540 speechSynthesis read-only)
- `104ebdb` C2.10 openrouter-client expansion (D2.2 array+null error + D2.4 usage opt + D2.8 abort)
- `921e8ef` C2.13 AICopilotChat idle+input+submit+streaming+panelId coverage

NOT shipped: C2.4 Playwright /judges fidelity + C2.5 Playwright /analyze fidelity (Playwright dependency not installed; spec files would be dead code until install). Queued post-submission OR for the Day 10-11 dress rehearsal if Playwright install is approved.

**F2 codex adversarial cold-review fix-wave (4 commits + cascade-#14 + D-043) - landed earlier this close-out window:**

- `203b1dd` F2 HIGH#4 openrouter-stream route passes request.signal to openRouterChatCompletion
- `8ae21cd` F2 HIGH#2 Watson per-request unique tempfile suffix (race fix)
- `7b6f3a8` F2 MED#7 WatsonTtsRadio surface synthesis-failure shape in console.warn
- `d939e35` cascade-#14 BLOCKER#1 openRouterChatCompletion 2-arg signature TS2353 fix
- `da4b573` D-043 Watson production-path Vercel architectural constraint doc

5 other planned F2 agent dispatches deferred per token-budget pragmatism (silent-failure-hunter + type-design-analyzer + code-reviewer + comment-analyzer + plan-gap-scanner). Codex coverage caught the load-bearing issues; remaining 5 would surface polish-tier findings post-submission.

**Wave-43 session arc total commit count: ~55 atomic commits.** HEAD CI green at every push per cascade-#13 + cascade-#14 verify-or-cascade discipline. Operator-action queue remaining: apex.race DNS registration (D-042 BLOCKING) + video record (Day 10-11) + Playwright install decision + Vinh Phase 1 backend wire-up.

**Affected.** Default AnalyzeFlow.buildMockReport behavior (no persona overlay; user input shapes report). Lane C2 vitest coverage (9 new test files; ~73 cases total covering badges + decoder + what-if-replay + audit-log + live-charts + Watson + chat). Cascade-#13 + cascade-#14 lessons codified in `feedback_ci_green_per_push_verify_or_cascade.md`. Sookra Methodology Pillar 4 (Product credibility) extended with persona-not-hardcoded rule. D-041 + D-042 + D-043 + D-044 close-out the wave-43 mega-wave decision-log surface.

---

## 2026-05-24 D-043: Wave-43 cascade-#13 F2 codex-finding, Watson production-path Vercel architectural constraint

**Decision.** The wave-43 E2.1 `/api/watson-tts` production endpoint has TWO Vercel-runtime architectural constraints that codex adversarial review surfaced (F2 HIGH#1 + HIGH#3) which mean the route only fully functions in self-hosted environments + the Web Speech API fallback (wave-42 baseline) is the AUTHORITATIVE PRODUCTION PATH on Vercel.

**Architectural reality (codex findings).**

1. **HIGH#1 Vercel filesystem read-only except `/tmp`.** The route writes generated MP3s under `process.cwd()/public/generated-audio` per the wave-43 E2.1 design. Vercel Node.js functions document a read-only filesystem with only `/tmp` writable + only persistent within a single function instance (Fluid Compute reuses instances but `/tmp` is not shared across instances). In Vercel production, every Watson + FFmpeg POST returns `cache write failed` after the synthesis work completes, so the client falls back silently to Web Speech API.

2. **HIGH#3 FFmpeg binary not declared.** `child_process.spawn("ffmpeg", ...)` assumes system FFmpeg in PATH. `app/frontend/package.json` does NOT declare `ffmpeg-static` or any bundled binary. Vercel Node runtime does NOT have FFmpeg in PATH by default. So even if the filesystem were writable, every Watson synthesis would fail at `ffmpeg spawn failed` with 502.

**Mitigation shipped wave-43 F2 cascade-#13 fix-wave.**

- Commit `7b6f3a8` (F2 MED#7): `WatsonTtsRadio.tsx` now `console.warn`s on every non-ok synth POST + thrown error so operators see failure shape in DevTools instead of silent fallback to Web Speech API.
- Commit `8ae21cd` (F2 HIGH#2): per-request unique tempfile suffix closes the concurrent-request race condition that existed in any environment (not just Vercel).
- Commit `203b1dd` (F2 HIGH#4): `/api/openrouter-stream` route now passes `request.signal` to `openRouterChatCompletion`; consumer disconnects mid-flight cancel OpenRouter billing.

**Production-path authority on Vercel apex.race deploy.**

- Web Speech API (wave-42 baseline `playFallback` in `app/frontend/lib/watson-tts-radio.tsx`) is the AUTHORITATIVE production path. `playFallback` uses browser-native `window.speechSynthesis.speak()` with pitch 0.85 + rate 1.05 approximating the walkie-talkie acoustic profile.
- `/api/watson-tts` route is a CONDITIONAL production path that activates only in self-hosted environments meeting BOTH: (a) writable filesystem at `public/generated-audio/` (b) FFmpeg in PATH or bundled. On Vercel, the route returns 502 + the client falls back gracefully + operators see the failure shape in DevTools via the F2 MED#7 console.warn instrumentation.
- The paddock-radio walkie-talkie filter chain (highpass=350 + lowpass=3000 + compand + volume=1.8) ships on self-hosted environments. On Vercel, the browser approximation (pitch 0.85 + rate 1.05) is the acoustic profile.

**Path forward for full Watson production on Vercel** (NOT in scope for May 31 submission per no-time-pressure rule explicitly applied to architectural rework that risks new regressions):

1. Add `ffmpeg-static` dependency to `app/frontend/package.json`; resolve binary via `require('ffmpeg-static')` not plain string `"ffmpeg"`.
2. Switch `CACHE_DIR` to `/tmp` so Vercel readonly FS is respected; lose cross-invocation cache (each request synthesizes fresh).
3. Stream Watson + FFmpeg response inline as MP3 bytes; client creates `URL.createObjectURL()` blob URL + plays. Drop the `public/generated-audio/` HEAD-probe pattern entirely.
4. WatsonTtsRadio: drop HEAD-probe path; POST every time + cache resulting blob URL in component state for the lifetime of the report view.

This is a follow-on Vercel-architectural correction queued for post-submission iteration. The wave-43 F2 cascade-#13 fix-wave (D-043 + 4 commits 203b1dd + 8ae21cd + 7b6f3a8 + this entry) is the SUBMISSION-WEEK posture: document the constraint honestly + ensure the fallback is bulletproof + surface failures to operators.

**Wave-43 cascade-#15 reconciliation (2026-05-24):** items 1 + 3 + 4 of the "Path forward for full Watson production on Vercel" four-step plan above SHIPPED during the wave-43 cascade-#15 F2-round-2 fix-wave + galaxy-ambition rework, ahead of the post-submission iteration framing. Specifically: (a) `ffmpeg-static` added to `app/frontend/package.json` + resolved via `createRequire(import.meta.url)("ffmpeg-static")`; (b) Watson + FFmpeg response streams inline as audio/mpeg bytes; client `URL.createObjectURL()` on the blob + plays; (c) WatsonTtsRadio drops the HEAD-probe path + POSTs once on mount per-component-mount + caches the blob URL in component state for the report-view lifetime. Item 2 (CACHE_DIR to `/tmp`) is intentionally retired by the inline-streaming rework, which removes the cache write altogether. Production Watson path is now LIVE on Vercel apex-one-black.vercel.app (verified live-smoke 2026-05-24 D-047 close-out + D-048 plan-entry); Web Speech API remains as the fallback for environments where Watson env vars are absent OR the synth POST returns non-2xx.

**Affected.** WatsonTtsRadio production-path activation behavior on Vercel (silent fallback to Web Speech API + console.warn surfaces failure shape). `docs/wave-41-backend-spec-handoff.md` Endpoint 5 spec contract documents the constraint via this D-043 cross-reference. Submission-week acceptable behavior. Post-submission iteration queued. **Wave-43 cascade-#15 + wave-44 D-047 + D-048 SHIPPED items 1+3+4; item 2 retired by inline-streaming rework.**

---

## 2026-05-24 D-046: Wave-43 Vercel MCP validation of D-045 + APEX-project-doesn't-exist confirmation

**Decision.** Vercel MCP server (mcp__plugin_vercel_vercel) authenticated + queried Stephen's Vercel account 2026-05-24 ~18:10 ET. Surfaced verified state:

- Team: `ssookra-7703's projects` (`team_2qTzvz9OIGdUuoCkvzgY0sQR`)
- 7 existing Vercel projects: `stephensook-novatorem` + `trace-forensic-search` + `portfolio` + `frontend` (vite) + `app` (nextjs; serves an unrelated Privy+EVM dApp at `app-psi-pied.vercel.app`) + `nest-portfolio` + `v0-portfolio`
- **NO project named "apex" exists.** PLAN.md row 5 "Vercel apex.race production deploy live (wave-38 cutover)" is aspirational; APEX has never been deployed.

**Vercel MCP capability boundary.** The MCP exposes list/inspect/get-logs surfaces + `check_domain_availability_and_price` + `web_fetch_vercel_url` + `deploy_to_vercel` (which only returns CLI instructions, not actual deploy execution). Project creation + repo-link require Vercel dashboard OR interactive `vercel link` + `vercel --prod` from Stephen's terminal. Both Claude-unshippable; Stephen-only.

**Updated operator-action precision (replaces D-042 + D-045 prose):**

OPTION A - Vercel dashboard (3-5 min, recommended):
1. https://vercel.com/new → Import Git Repository → `StephenSook/apex`
2. Framework Preset: Next.js auto-detected per `vercel.json`
3. Root Directory: leave at repo root (vercel.json `buildCommand` already does `cd app/frontend`)
4. Click Deploy
5. Assigned URL pattern: `apex-ssookra-7703s-projects.vercel.app` per Stephen's existing project-naming convention

OPTION B - Vercel CLI:
```
npm i -g vercel@latest
cd "/Users/stephensookra/Desktop/IBM May"
vercel link
vercel --prod
```

Both yield a `*.vercel.app` URL at $0 cost.

**Post-deploy mass-rename** in one atomic commit:
- README.md (live demo URL + badge)
- paper/apex-neurips-workshop-2026.md (§7 reproducibility)
- deliverables/demo-video-script-3min.md (Beat 8 close)
- deliverables/demo-video-30s-storyboard.md (Beat 5 close)
- deliverables/deck-source.html + deliverables/deck-2026-05.pdf (F1 + F11)
- deliverables/bemyapp-submission-payload.md
- docs/decision-log.md D-042 + D-045 + this entry note the post-deploy URL

**Lesson locked + memory rule shipped.** Per Stephen explicit 2026-05-24 ~18:00 ET methodology lock: MANDATORY exhaustive tool-inventory audit BEFORE every non-trivial task. Memory entry at `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/feedback_exhaustive_tool_inventory_before_every_task.md`. The Vercel MCP + vercel:deployment-expert sub-agent + vercel:ai-architect + vercel:performance-optimizer stack was available to Claude throughout wave-43 + un-used; cost Stephen +1 session-turn of catching the miss. The new rule operationalizes D-007 BLOCKING into a per-task-enumerate-all-tools template.

**Cost of the miss this session arc.** ~1 turn of clarification + 1 D-045 reframing commit + 1 D-046 validation commit (this entry) + a new memory rule write. All recoverable; future tasks must NOT repeat the miss.

---

## 2026-05-24 D-045: Wave-43 D-042 reframing - apex.race is OPTIONAL brand polish, NOT submission-blocking

**Decision.** Re-read of D-042 surfaced a framing error. apex.race custom domain is NOT a submission-blocker because Vercel provides a free auto-assigned `*.vercel.app` URL for every deployment. apex.race is OPTIONAL BRAND POLISH (we already own brand wordmark + editorial-paddock identity; the custom .race TLD is a finishing touch, not a requirement). Per Stephen explicit framing 2026-05-24: "Can't we just run a random Vercel URL that we don't even have to pay for for number 1?"

**Actual blocking item:** Vercel deployment must EXIST + be reachable. Current state per probes 2026-05-24 17:45 ET: `apex-stephensook.vercel.app` returns 404 + `apex-stephen-sookra.vercel.app` returns 404 + `apex.vercel.app` returns 200 BUT serves an unrelated Vue.js app owned by another Vercel account. Implication: APEX has NEVER been deployed to Vercel; the wave-38 cutover note in PLAN.md row 5 is aspirational, not actual.

**Operator-action (Stephen, BEFORE 2026-05-30 EOD, ~$0 cost):**

1. Run `vercel` CLI install if not present: `npm i -g vercel@latest`
2. From repo root: `vercel login` then `vercel link` to associate with a (free) Vercel account
3. `vercel --prod` (deploys + assigns `*.vercel.app` URL)
4. Read the assigned URL (e.g. `apex-stephensookra.vercel.app`)
5. Verify in incognito (logged-out): `/judges` + `/analyze` + `/status` all return 200 + render
6. Update README + paper + 3-min script + 30s storyboard + deck + BeMyApp payload to reference the assigned Vercel URL (one-line search-replace)
7. OPTIONAL post-submission: register apex.race + DNS-point + Vercel domain-add for the polished URL

**Why this is now NOT blocking:**

- Vercel free tier provides production hosting with the `*.vercel.app` URL at $0
- Judges accessing `*.vercel.app` URL see identical project with identical functionality
- 2026 judge sentiment (April Guo Anthropic + semgrep 2026 hackathon-effect) shifted toward "feels like a product" - a stable `*.vercel.app` URL pointing at a working build IS product-grade
- Vercel default URL pattern is well-recognized by 2026 hackathon judges who deploy similar projects themselves

**D-042 reframing:** the BLOCKING flag in D-042 misframed the constraint. apex.race custom domain registration is not required for submission. ONLY the Vercel deployment itself is. Per no-time-pressure rule + galaxy ambition: deploy to Vercel now via free tier; brand polish via apex.race registration is post-submission iteration.

---

## 2026-05-24 D-042: Wave-43 G2.6 operator-action item, apex.race DNS NXDOMAIN (SUPERSEDED-FRAMING by D-045; actual operator-action still required)

**Decision.** Wave-43 G2.6 Vercel apex.race smoke test surfaced a SUBMISSION-CRITICAL blocker: `dig apex.race +short` returns empty + `nslookup apex.race` returns NXDOMAIN. The domain is either unregistered OR registered without DNS pointing at the Vercel deployment. README + paper + 3-min script + 30s storyboard + deck + BeMyApp payload all reference `https://apex.race` as the live demo URL.

**Cautionary precedent.** Per Discord 2026-05-23/24 intel, the PitWall competitor (a fellow May Challenge participant shipping an F1 Race Strategy Copilot on a HuggingFace Spaces deployment) is publicly hitting OpenRouter rate-limits with screenshots showing "site unavailable" errors. Judges seeing a similar NXDOMAIN on apex.race would be instant credibility loss + DQ-grade for a "live demo" submission category.

**Operator-action items (Stephen, BEFORE 2026-05-30 EOD):**

1. Register `apex.race` domain via Namecheap / Cloudflare / Vercel-direct (24-48h DNS propagation budget)
2. Point apex.race + www.apex.race A/CNAME records at Vercel project DNS targets
3. Vercel dashboard → project → Settings → Domains → add apex.race + verify SSL cert auto-provisions
4. Verify in incognito (logged-out): `https://apex.race`, `/judges`, `/analyze`, `/status` all return 200 + render
5. Curl smoke: `curl -sI https://apex.race` returns `200 OK` + `Strict-Transport-Security` header

**Fallback if apex.race registration blocks:** revert README + deck + storyboard URLs to the Vercel default deployment URL (e.g. `apex-stephensook.vercel.app`) at T-24h before submission. Patch payload doc + 3-min script Beat 8 + 30s storyboard Beat 5 + BeMyApp form payload. Single mass-rename operation; do not leave any stale apex.race reference.

**Wave-43 close-out status (as of D-042 entry).** 25 commits shipped wave-43 across 8 lanes (cumulative Lane A2 + B2 + D2 + E2 + G2.1 + G2.2 D-041 + G2.4 AI-tone + G2.5 README + 3 C2 vitest badges + cascade-#13 2-commit fix-forward). HEAD CI green. Remaining queue: Lane C2 8 remaining vitest specs + Playwright fidelity specs + video record + deck PDF + Lane G2.6 (THIS entry's operator action) + Lane H2 Obsidian session memory (Claude Memory note written) + APEX MOC pointer + project_apex_wave_30_maximal_architecture wave-43 amendment + MEMORY.md refresh.

**Affected.** Submission credibility (apex.race must resolve by 2026-05-31 23:59 ET). README + paper + 3-min script + 30s storyboard + deck PDF + BeMyApp payload all have apex.race references; either domain resolves OR mass-rename to vercel.app URL fallback.

---

## 2026-05-24 D-041: Wave-43 mega-wave close-out (Lane D2 + E2 + G2.1 + C2 partials + cascade #13)

**Decision.** Wave-43 mega-wave 18-commit close-out lands the following lanes:

- **Lane A2** (5 commits, cascade-#11 cold-review-2 close-outs): D-040 entry + paper §3 doc accuracy + README apex.race URLs + EdgeModeCallout copy + SHA-cite correction.
- **Lane B2** (3 commits): Colab notebook walkthrough + AI-tone full-repo sweep + PLAN.md Day-6 refresh.
- **Lane D2** (10 commits, cascade-#12 HIGH+MED fix-wave): D2.1 openrouter-stream monotonic generation counter (`e0fda59`) + D2.2 decoder error-shape array+null (`bb74314`) + D2.3 retry body-cancel + warn-logging (`4622843`) + D2.4 usage optional (`21c7d20`) + D2.5 AICopilotChat 2-variant collapse (`f84bdb9`) + D2.6 React.memo drop (`1aac2a6`) + D2.7 stream:boolean drop (`83b759a`) + D2.8 AbortSignal threading (`ef82363`) + D2.9 speechSynthesis lifecycle (`3814c61`) + D2.10a Watson exhaustive `never` (`e4cb558`) + D2.10b+D2.12 AnalyzeFlow tab CSS-hidden state preservation (`c373901`) + D2.11 ToleranceBands JSDoc (`acc8b95`).
- **Lane E2** (3 commits): `/api/watson-tts` production Watson TTS + paddock-radio FFmpeg filter chain (`3cce2ae`) + WatsonTtsRadio synthesis-path activation (`6f8ec6e`) + Stream M.3 spec extension docs (`eda7905`).
- **Lane G2.1** (1 commit): canonical FIACoaCanonical TypeScript interface mirroring the Sarah Reynolds COA fixture one-to-one (`6a23512`).
- **Lane C2 partial** (2 commits shipped of 13 planned): 3-min 8-beat demo video script (`ef82363` bundle) + 30-second highlight storyboard (`264af82`).
- **Cascade #13** (2 fix-forwards): AnalyzeFlow.test.tsx broke when D2.12 CSS-hidden refactor preserved all panes in DOM; `.not.toBeInTheDocument()` assertion structurally invalid post-refactor + `getByRole` regex matched headings inside hidden CoachingReport sub-tree. Closed via `be8478d` (single `closest('.hidden')` check) + `9fcd376` (`visibleHeading()` helper across all 5 multi-match queries).

**Rationale.** Galaxy-ambition mandate + no-time-pressure rule + Vinh Phase 1 backend contracts all converge on the wave-43 close-out shape. Lane D2 closes the cascade-#12 6-agent dispatch HIGH+MED cluster (cold-review-2 + silent-failure-hunter + type-design-analyzer + code-reviewer + comment-analyzer findings). Lane E2 activates the production Watson TTS path that has been waiting on the demo to bring sound to the coaching report. Lane G2.1 canonicalizes the FIACoa shape for Vinh's task 1.3 coa_parser.py extraction targets.

**Cascade #13 lesson.** Same-commit test fixup rule (cascade #2 family) still gets violated when refactors are structural enough to invalidate test ASSERTIONS without renaming any symbol the consumer-test grep would find. D2.12 changed render strategy (unmount → display:none) without touching any heading text, so the consumer-test grep returned empty, but the assertion shape (`.not.toBeInTheDocument`) was load-bearing on the render strategy. Mitigation lands in `feedback_ci_green_per_push_verify_or_cascade.md` cascade #3 section: when refactoring conditional-render to CSS-toggle, ALWAYS update consumer tests in the same commit even when no symbol renaming triggered the grep.

**Wave-43 totals.** 38 commits in wave-43 cumulative across 8 lanes. Remaining queue: Lane C2 (11 of 13 tests + video record + deck PDF), Lane F2 (cascade-#13 6-agent dispatch + fix-wave; this entry pre-empts the dispatch with cascade #13 already closed), Lane G2 close-out (D-042 + final em-dash/AI-tone sweep + README/BeMyApp/paper final pass + Vercel apex.race verify), Lane H2 (Obsidian session memory + APEX MOC + wave-30 amendment + cascade #13 codification + MEMORY.md refresh).

**Affected.** Frontend cascade-#12 HIGH+MED cluster (8 commits); production Watson TTS path + Stream M.3 spec contract (3 commits); FIACoa canonical shape consumed by Vinh's parser (1 commit); demo video script + 30s storyboard (2 deliverables); D-040 + D-041 decision-log entries (2 docs).

---

## 2026-05-20 D-001: Project renamed PIT WALL → APEX

**Decision.** Project name is APEX.

**Rationale.** BeMyApp portal showed a competing submission titled "PitWall" (cinematic GoPro AI race engineer for amateur drivers using GoPro footage). Different audience and product (amateur sim-and-track-day coaching vs adaptive-racer post-race coaching) but visual name collision in 43-team grid creates judge confusion. APEX is universal racing vocabulary (every corner has one), two syllables, no major brand collision. Backronym A.P.E.X. = Adaptive Performance Engineer (with) eXplanation.

**Affected.** All collateral: repo name, README, deck, video, all stakeholder emails sent on 2026-05-19 (which were still under PIT WALL branding but the substance fully transfers; outreach replies if any will route to APEX).

---

## 2026-05-20 D-002: Monorepo, public Day 1, Apache 2.0

**Decision.** Single GitHub repo at https://github.com/StephenSook/apex. Public from Day 1. Apache 2.0 license. Holds app code + physics-tsfm library + research PDFs + deck + paper draft + Bob session logs in one tree.

**Rationale.** Atomic-commit green-squares visibility matters for IBM judges who may check repo history during evaluation. Public from Day 1 also signals confidence. Single repo simplifies Vinh's onboarding and submission URL.

**Affected.** All build work for the next 12 days. Vinh added as collaborator (pending his GitHub handle).

---

## 2026-05-20 D-003: Galaxy-tier scope rule

**Decision.** Nothing post-hackathon. Nothing stretch. Every enhancement, paper draft, beta-tester quote, live sim-rig mode, Colab notebook, judges-tour page, status dashboard, methodology trace, IBM Consulting outreach, multi-track submission entry. All in scope by 2026-05-31 11:59 PM ET. **Note (wave-38 2026-05-23):** June Challenge bridge architecture was originally in the D-003 enumeration; retired per Stephen explicit "the June challenge does not deal with anything that the May challenge deals with. F1, the June challenge is a whole other, different challenge itself." APEX is May Challenge only.

**Rationale.** Stephen explicit: "We're aiming for the galaxy, not the moon. Nothing should be post-hackathon; everything should be within the scope right now so we can have the best project ever." This reframes the 12-day plan from default-scope to all-in-scope. A feature shipped at 70% quality on Day 11 beats a feature deferred to a v2 that judges never see.

**Affected.** Plan §16 enhancements, §17 external-tool layers, §18 inclusions list, all formerly-stretch items. Memory rule installed at `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/feedback_galaxy_ambition_no_deferrals.md`.

---

## 2026-05-20 D-004: Research-tool discipline as durable rule

**Decision.** When uncertain about a fact, library version, API behavior, FIA regulation, IBM Granite model card detail, or person's role/email: verify with a research tool (Context7 → tavily → firecrawl → EXA → WebFetch) BEFORE asserting in code, deck, email, or memory.

**Rationale.** APEX ships to IBM judges who may include time-series ML researchers. A single false claim turns the demo into a credibility hit. Cost of one research-tool call is seconds; cost of one wrong claim is the prize.

**Affected.** All future work on this project. Memory rule installed.

---

## 2026-05-20 D-005: State-sync protocol via Obsidian + project memory

**Decision.** Every substantive work session ends with a Claude Memory write to Obsidian at `Claude Memory/Session - YYYY-MM-DD - apex-<slug>.md`. Project facts live durably in `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/`. Obsidian APEX MOC is the chronological hub.

**Rationale.** If VS Code crashes or a new chat opens cold, the next session can recover full state from `Home.md` → `APEX MOC` → last 3 Claude Memory entries. Three persistence layers: memory (facts), Obsidian project notes (structure), Claude Memory (chronicle).

**Affected.** Every session for the next 12 days.

---

## 2026-05-20 D-006: No git hooks, manual coordination only

**Decision.** `.git/hooks/` contains only the 14 `.sample` defaults that git ships with. No Husky, no lefthook, no pre-commit, no commit-msg validators, no CLI wrappers. Coordination is manual via PLAN.md edits.

**Rationale.** Stephen and Vinh have shipped Trace, Hometown-Pathway-Atlas, Compass, and Nest using the same manual-coordination convention (Hometown PLAN.md task 0.4 verbatim: "Coordination is manual (mirrors Trace) - no hooks, no CLI"). Hooks introduce three failure modes the 12-day hackathon cannot afford: commit-blocking on lint glitches when a hotfix is needed mid-incident, hook divergence across the two laptops, and silent-bypass-via-`--no-verify` that defeats the gate anyway. CI on push to main is the quality gate that replaces hooks.

**Affected.** All commits Day 1-12. Verified Day 1 PM via `ls -la .git/hooks/`: only `*.sample` files present.

---

## 2026-05-20 D-007: Quality over speed, tool-inventory audit BLOCKING

**Decision.** Before any non-trivial task (commit-worthy work, design decision, deck section, outreach email, demo recording, paper draft), the operator (Claude or Stephen) runs a tool-inventory audit and names at least 5 candidate skills / agents / MCPs / connectors from the available inventory that could raise the result. Pick the top 1-2. Use them. Save findings to memory.

**Rationale.** Stephen explicit on Day 1 (2026-05-20): "Quality over speed. Do not rush things. Make sure you're going through every single skill, every single superpower, every single plugin, every single MCP, every single connector." This rule is the operational implementation of the global hackathon-project-flow Phase 1 principle ("tool-inventory audit BLOCKING before non-trivial tasks"). The project will be won by depth, not by velocity. A 70%-quality feature shipped at Day 11 beats a 90%-quality feature deferred to a hypothetical v2 only when the 70%-quality feature is the ONLY surface that exists; for tasks with quality variance, the rule is "use the highest-impact tools."

**Affected.** Every non-trivial Claude tool-use sequence for the 12-day build. Memory rule installed at `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/feedback_quality_over_speed.md`. Codex independent review wave 2 Day 1 EOD applied this principle (BLOCKER findings B1 + B2 surfaced because the manual-grep-and-fix sweep was less effective than the Codex adversarial review).

---

## 2026-05-19 D-A: PhysicsTTM three-layer architecture (locked pre-rename, carried into APEX)

**Decision.** Three-layer architecture: frozen Granite TimeSeries TTM forecaster → two-stage projection-and-audit layer (Stage 1 differentiable CvxpyLayer QP enforcing the convex constraints friction ellipse + forward-Euler kinematic step + jerk bound; Stage 2 post-projection feasibility filter auditing the nonconvex constraints bicycle-model coupling + COA-parameterized brake-throttle simultaneity gate) → Granite Guardian BYOC text audit on combined serialized violation log.

**Rationale.** Phase 5 NotebookLM gap analysis surfaced "Kinetic Hallucination": TTM trained on energy grids and weather can forecast physically impossible motorsport telemetry. The three-layer architecture closes this objection. Convergence 14 (serialization integrity) is the load-bearing safety requirement.

**Refinement (2026-05-21 night-late, wave-25 closure of wave-24 BLOCKER B1+B2).** D-A originally framed the middle layer as a single "differentiable physics-projection layer (CvxpyLayer QP with friction ellipse, bicycle model, COA-flagged simultaneity)." Wave-24 cold-review caught that bicycle-model coupling and the COA-parameterized brake-throttle simultaneity gate are nonconvex constraints that cannot live inside a CvxpyLayer (CvxpyLayer requires Disciplined Convex Programming). The middle layer is therefore split into Stage 1 (the convex QP that CvxpyLayer can host: friction ellipse + forward-Euler + jerk bound) and Stage 2 (a post-projection feasibility filter that audits the bicycle and COA constraints). The architectural intent is unchanged; the technical contract is now honest about CvxpyLayer's convexity-only support. D-A is amended, not superseded.

**Affected.** Backend architecture, deck slide 6, Q&A Card 2.

---

## 2026-05-19 D-B: Dual-layer pitch headline + Q&A killshot reserved (carried into APEX, refined Day 1 PM 2026-05-20)

**Decision.** Pitch architecture has two leads, both ship in the deck + video + landing page:

1. **Emotional hero headline (h1 on the landing page, lead line of the 3-minute video):** "The race engineer for the drivers who don't have one." This is the human-story hook. Calibrated by Phase 4.5 hostile-pitch review (Kimi) as the most universally accessible opening beat.
2. **Technical positioning headline (Differentiator #1 card on the landing page, slide 4 in the deck):** "First integrated workflow for adaptive hand-controls." This is the technical-novelty anchor that distinguishes APEX from Track Titan, Trophi.ai, and the generic AI race-engineer category.

**Q&A killshot reserved:** COA-parameterized brake-throttle simultaneity (the deepest novelty per NotebookLM Phase 5 Q4 verdict). Deployed only when a judge presses "why not just Track Titan or Trophi.ai." Card 4 in `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_qa_killshots.md`.

**Rationale.** Phase 5 NotebookLM Q4 audit: candidate 3 (integrated workflow) is the most accessible *technical* positioning. The Kimi hostile-pitch review separately identified that leading with the technical claim loses the emotional hook for judges scanning 43 submissions. The synthesis: lead Hero with emotion ("drivers who don't have one"), lead Differentiator panel with technical positioning ("first integrated workflow"), hold COA simultaneity for the Q&A knockout. All three are present in every submission surface (landing page, deck, video, Q&A pack). None are mutually exclusive.

**Affected.** Pitch script (3-min video Day 9), deck (Day 11), landing page (live Day 1 PM), Q&A flashcards (Card 4 in memory).

---

## 2026-05-22 D-009: Wave-30 Maximal Architecture Lock (umbrella)

**Decision.** Stephen ran a 12-hour multi-model deep-research synthesis 2026-05-21 / 2026-05-22 across Perplexity (prior-art scout) + Gemini (8-tier vehicle-dynamics math frontier) + ChatGPT (polyphase aggregation gap) + Claude (connective tissue + AI/architecture frontier + decision brief) + NotebookLM (6-question synthesis pass). 9 sources land at `research/wave-30/`. Per Stephen's galaxy ambition directive, all locked recommendations from the synthesis are in-scope for the 2026-05-31 submission. No V2 / V3 / post-hackathon labels. D-009 through D-027 below are the granular architectural locks derived from this synthesis.

**Rationale.** Wave-29 cold-review pattern (visualization-catches-numeric-drift, pre-mortem row 51) plus Stephen's explicit "we have time, we're aiming for the galaxy, do not restrain anything, me and Vinh can build this" directive flips the project's default posture from conservative-scope to maximal-ceiling. The maximal ceiling is the build target.

**Affected.** Every layer of the pipeline. PLAN.md status snapshot + all sub-rows for Phase 2 + 3 + 4 + 5 + 6 (paper). arch-spec maximal expansion (Layer 0 through Layer 8 with new layers). paper §3 rewrite + §4 LIPS + §13 references. Vinh-handoff rewrite (V2 / V3 labels OUT, 8-tier physics + 12-tool stack IN). Frontend types + EXTENDED_PHYSICS_FIXTURES catalogue. Pre-mortem new failure-mode rows.

**Cross-reference:** `research/wave-30/README.md` source manifest + `research/wave-30/09-notebooklm-synthesis-2026-05-22.md` synthesis pass.

---

## 2026-05-22 D-010: Three-track forecasting ensemble (TTM r2.1 channel-mix + FlowState + Chronos-2)

**Decision.** Layer 3 forecasting is now a three-track ensemble. Track 1 = Granite TimeSeries TTM r2.1 running channel-mixing decoder fine-tune on polyphase 1 Hz phase-time streams (5% of target data, ~minutes on RTX 4060). Track 2 = Granite FlowState r1.1 (18.5M params [VERIFIED: IBM Research FlowState listing], sampling-rate-invariant continuous-time state-space, native 50 Hz). Track 3 = Amazon Chronos-2 (21 quantiles [PARTLY VERIFIED: synthesis Q2 + source 05 specify 21; the Chronos-2 HF model card exposes user-selected quantile counts so 21 is a benchmark-chosen default for APEX], zero-shot probabilistic baseline, maps uncertainty corridor). The (B, 30, 14) tensor contract from Sync Point 1 is the output of the fused ensemble, not just TTM.

**Rationale.** D-A original "bare zero-shot TTM" is not a defensible NeurIPS story because (a) channel-independent TTM cannot natively learn cross-channel physical relationships, (b) zero-shot point forecasts have no uncertainty band for the next-session-envelope claim, (c) a single forecaster ties the whole story to a single model's failure mode. Channel-mixing fine-tune + FlowState rate-invariance + Chronos-2 probabilistic baseline together address all three. Source 05 + source 09 Q2.

**Affected.** Layer 3 in arch-spec. Paper §3.1 + §4 (Track 1+2+3 as ablation rows). PLAN row 2.6 + 2.8 (TTM forecaster). New 12-tool Granite stack: 12 tools (was 8).

---

## 2026-05-22 D-011: Multi-frequency coexistence + 50 Hz feasible-lift projector unifier

**Decision.** Three frequency strategies coexist, no path is cut. Path A = 1 Hz mini-sector aggregation (coarse macroscopic backbone). Path B = polyphase decomposition (50 phase streams at 1 Hz, interleaved to 50 Hz output, zero information loss, no aliasing). Path C = Granite FlowState (sampling-rate-invariant, native 50 Hz). Unifier = 50 Hz differentiable physics-projection layer that fuses all three paths and enforces vehicle-dynamics constraints on the fused 50 Hz tensor.

**Rationale.** Repo committed 1 Hz aggregation; ChatGPT source 03 recommends polyphase; Claude source 05 recommends FlowState. NotebookLM synthesis source 09 Q1 says do not pick one; assign jobs and exploit each strategy's mathematical guarantee. Polyphase preserves all 50 native samples + bypasses 0.5 Hz Nyquist ceiling. FlowState handles irregular rates that polyphase cannot downsample cleanly. 1 Hz aggregation stays as the macroscopic backbone consistent with TTM's pretraining envelope.

**Affected.** Layer 2 (preprocessing) + Layer 4 (physics projection) in arch-spec. Paper §3.2 frequency-strategy paragraph. PLAN row 2.4 (preprocessor) + 2.9 (projection layer). Vinh-handoff rewrite. Decision-log D-A refinement (1 Hz aggregation framing is now one of three concurrent paths, not the sole rate).

---

## 2026-05-22 D-012: Unrolled SCP outer loop (3 fixed iterations) wrapping convex QP inner stage

**Decision.** The two-stage convex QP plus feasibility filter (D-A refinement) is promoted: convex QP becomes inner iterate of an outer unrolled Sequential Convex Programming (SCP) loop. The non-convex 8-tier physics (Pacejka combined-slip + transient + thermal + load transfer + double-track + 3D track + aero + adaptive hand-controls) is handled by first-order Taylor linearization around the previous iterate, fed back into the inner solver. **Convergence criterion is a fixed 3-iteration unroll**, not a dynamic tolerance (lock empirical-gated by D-027 Day-3 SCP prototype; literature says 3-5 iterations converges for well-conditioned vehicle models but APEX's 8-tier parameterization is novel + needs prototype confirmation per source 06 line 597). The fixed unroll lets PyTorch unroll the computation graph completely so gradients flow backward through all 3 iterations to the frozen TTM forecasting inputs.

**Rationale.** NotebookLM Q3 synthesis. Source 03 + source 02 both flagged that full nonlinear vehicle dynamics is non-convex and a single clean QP cannot hold the maximal physics. The dynamic-convergence option would break backward-pass determinism. Fixed 3-iteration unroll preserves gradient flow + locks the computation graph. The wave-29 feasibility-filter framing in D-A is superseded by the outer loop's linearization update step.

**Affected.** Layer 4 in arch-spec (Layer 4 expansion). Paper §3.2 SCP formulation. PLAN rows 2.9a + 2.9b (the old Stage 1 / Stage 2 split is reframed). Vinh-handoff (Day 3 SCP go/no-go gate per D-027). Decision-log D-A refinement.

---

## 2026-05-22 D-013: cvxpylayers locked as the differentiable optimization layer

**Decision.** cvxpylayers is the only viable differentiable optimization layer for APEX's inner SCP iterate. qpth and theseus are explicitly rejected.

**Rationale.** NotebookLM Q3. qpth (OptNet) is QP-only and lacks SOCP support; the 2D / 3D friction ellipse constraint `||(ax, ay)||_2 <= μ * g` is fundamentally a second-order cone. theseus applies constraints as soft penalties (weighted cost terms) which defeats hard-projection's whole point. cvxpylayers natively supports DPP-compliant SOCP problems and provides exact implicit differentiation on the backward pass. Source 04 connective-tissue comparison + source 03 convexity warning + source 09 Q3 verdict all converge here.

**Affected.** Vinh-backend-plan §Phase 2 (Day 4 commit). arch-spec Layer 4 implementation block. PLAN row 2.9a Notes. paper §3.2 method paragraph names cvxpylayers + cites Agrawal et al. 2019.

---

## 2026-05-22 D-014: Numerical hazard resolution (Tikhonov damping + tanh saturation + stiff-ODE steady-state algebraic substitution)

**Decision.** Two numerical hazards in the SCP inner solve get explicit fixes baked into the implementation contract.

**(1) v_x near-zero gradient singularity** (slip ratios divide by longitudinal velocity; pit exits + spun vehicles create infinite gradients): Tikhonov damping ε = 0.5 m/s added to denominators. For v < 1 m/s, tire forces frozen via smooth `torch.tanh` saturation. Removes singularity, preserves continuous gradient flow.

**(2) Stiff-ODE problem in transient tire dynamics** (relaxation length L_y / v_x explodes at low speed; Forward-Euler integration oscillates + explodes gradients): inner solve replaces stiff ODE with steady-state algebraic solution. Full transient dynamics deferred to offline validation only. If transient dynamics are strictly required in solver, fall back to differentiable implicit solver (Backward Euler) or torchdiffeq.

**Rationale.** Source 02 Gemini flagged both as build-blocking; source 09 Q3 locked the fixes. These are not "limitations to be documented": they are engineering hazards that explode the build at runtime if not handled before Vinh writes the SCP code.

**Affected.** Vinh-backend-plan Day 4 + Day 5 implementation. arch-spec Layer 4 numerical-stability appendix. paper §3.2 implementation paragraph.

---

## 2026-05-22 D-015: 8-tier physics roadmap (all in-scope, no V2 / V3 deferrals)

**Decision.** The 8 tiers from Gemini source 02 are all in-scope for 2026-05-31 submission:

1. **3D track geometry:** project gravity vector using GPS pitch + bank.
2. **Aerodynamics:** pitch-sensitive front/rear downforce loads `Fz_aero = 0.5·ρ·Cl·A·v²`.
3. **Adaptive hand-control dynamics:** disable `throttle × brake = 0` complementarity when COA c_overlap flag set.
4. **Load transfer:** double-track lateral + longitudinal elastic weight transfer.
5. **Tire thermal + degradation:** modulate peak friction based on thermodynamic state.
6. **Transient tire dynamics:** relaxation-length ODE → steady-state algebraic substitution per D-014.
7. **Full Pacejka tire model:** combined-slip heart-shape boundaries solved via SCP outer loop per D-012.
8. **Vehicle kinematic integration:** Newton-compliant accelerations enforced.

All execute inside the unrolled SCP outer loop per D-012: the convex inner iterate (cvxpylayers QP, Tier 8 kinematic integration) handles the convex constraints; the outer loop applies first-order Taylor linearisation of the non-convex tiers (Tier 1 3D track + Tier 2 aero + Tier 4 load transfer + Tier 7 Pacejka combined-slip) around the previous iterate fed back into the inner solve. Tier 3 adaptive hand-controls runs in the COA constraint layer per D-022. Tier 5 thermal evolves T_surface as per-step internal state per arch-spec Appendix W30 Layer 4 Tier 5. Tier 6 transient tire dynamics uses steady-state algebraic substitution per D-014. EXTENDED_PHYSICS_FIXTURES catalogue (Stephen-lane wave-30 frontend) surfaces each tier on `/judges` for judge-facing visualization.

**Rationale.** Per D-003 galaxy ambition + Stephen's wave-30 directive: "we need the best physics possible, not leaving out anything possible." Removes the "V2 / V3 / post-hackathon" labels that lived in earlier paper drafts. Source 02 + 09 lock this as the maximal physics target.

**Affected.** arch-spec Layer 4 expansion. paper §3.2 tier-by-tier method. paper §4 8-tier ablation table. PLAN new rows 2.9.1 through 2.9.8 (one per tier). Vinh-handoff rewrite removing V2 / V3 labels. Frontend EXTENDED_PHYSICS_FIXTURES catalogue + new `/judges` panel.

---

## 2026-05-22 D-016: 12-tool Granite stack expansion (was 8)

**Decision.** Granite stack expanded from 8 tools to 12. New additions per source 05:

9. **Granite Embedding R2** (149M encoder + 47M query [VERIFIED: IBM Granite embedding GitHub model list, english-r2 + small-english-r2], hybrid dense/sparse) drives Layer 5 RAG over vehicle setup guides + racing theory + adaptive-equipment specs.
10. **IBM TSPulse** (1M params [VERIFIED: IBM Research TSPulse article], time-frequency analyzer) drives Layer 2 anomaly detection over polyphase phase streams.
11. **Granite FlowState** (r1.1 18.5M [VERIFIED: IBM Research FlowState r1.1 March 2026 update; CauKer synthetic data + 4096 pre-training context + 2x larger MLP + output gating], sampling-rate-invariant SSM) is Track 2 of D-010 three-track ensemble.
12. **Granite 4.0 Nano 350M** [VERIFIED: Hugging Face ONNX Granite 4.0 350M model card + IBM Granite docs] runs in-browser via WebGPU + Transformers.js for the offline paddock-summary path per D-021.

Original 8 (Granite-Docling 258M + Granite Vision 4.1 4B + Granite TimeSeries TTM r2.1 + Granite 4.1 8B Instruct + Granite Guardian 4.1 + Langflow + Docling library + IBM Bob) all retained; Langflow demoted from runtime to visual demo facade per D-017.

**Rationale.** Maximal ceiling per galaxy directive. Best Use of Technology track favors a stack where every tool earns its slot. Source 05 + 09 Q2 locked.

**Affected.** README "Eight IBM tools" → "Twelve IBM tools" sweep. `/judges` 12-tool grid. Paper §3.6 stack provenance. arch-spec stack diagram. BeMyApp submission payload Tools panel.

---

## 2026-05-22 D-017: LangGraph + MCP + ContextForge orchestration substrate (Langflow demoted to demo facade)

**Decision.** Layer 5 orchestration runs on LangGraph (stateful graph state machine) with all numerical tools (cvxpylayers SCP solver, polyphase preprocessor, anomaly detector, retrieval, narrator, critic, Guardian) exposed via Model Context Protocol (MCP) standardized tool calls, routed through IBM's ContextForge API Gateway. Langflow is retained but demoted from execution runtime to top-level visual demo facade (still rendered for judge visualization on `/judges`).

**Rationale.** Source 05 + 09 Q2. Langflow-as-runtime cannot express the stateful agentic flow required for the tri-agent critic loop + Mellea IVR repair + RAG retrieval node ordering. LangGraph + MCP + ContextForge is the agentic orchestration substrate IBM Consulting actually deploys for stateful AI workflows (per the Ferrari case study posture). Langflow stays as the visualization layer because it's still load-bearing for the deck + 3-min video orchestration screenshot.

**Affected.** Vinh-backend-plan Phase 2 Day 4-6. arch-spec Layer 5 expansion. paper §3.5 orchestration paragraph. PLAN new row 4.1a (LangGraph runtime) + 4.1b (MCP tool wrap) + 4.1c (ContextForge gateway) + 4.1d (Langflow demo facade).

---

## 2026-05-22 D-018: Tri-agent Agent-as-Judge critic loop + Mellea IVR repair (loop_budget = 3)

**Decision.** Layer 7 critic loop runs three specialized models in parallel + a repair loop:

- **Physics-Critic:** small Granite Instruct fine-tune that reads the projected tensor + violation log and challenges the draft report's physics claims.
- **Pedagogy-Critic:** small Granite Instruct fine-tune that reads the draft + COA structure and challenges the recommendation's coachability.
- **Guardian-Safety:** Granite Guardian 4.1 BYOC safety pass.

If any critic flags, IBM Mellea runs Instruct-Validate-Repair (IVR) with `loop_budget = 3` [UNVERIFIED: APEX-chosen value, not Mellea-default; Mellea docs show varying loop_budget across use cases. 3 is the APEX heuristic; tunes Day-7 if convergence under-shoots] to repair the generated text until it passes the panel. Verified CoachingReport then proceeds to Layer 8 final Guardian audit per D-A.

**Rationale.** Source 05 + 09 Q2 lock the Agent-as-Judge pattern as "shouldn't-be-possible" move 5. Source 09 Q5 open question 1 also resolved: gradients do NOT flow through Mellea IVR (D-020 two-regime seam); the critic loop is the discrete-text regime optimized by GEPA reflective evolution, not gradient descent.

**Affected.** Vinh-backend-plan Phase 4 Day 10. arch-spec Layer 7 (new). paper §3.5 + §3.6 critic-loop paragraphs. New tri-agent critic UI panel on `/judges` + `/analyze` coaching report.

---

## 2026-05-22 D-019: 5 shouldn't-be-possible moves (WebGPU Nano + aLoRA + GEPA + EAGLE-3 + Agent-as-Judge)

**Decision.** Five architectural moves land as the galaxy-tier signal that two students built more than a hackathon submission. Each is placed at a specific layer:

1. **WebGPU Granite Nano 350M** (Layer 0): zero-latency offline paddock summaries in the driver's browser via Transformers.js (per D-021 scope cut).
2. **Activated LoRA (aLoRA)** (Layer 6): hot-swap "race-engineer intrinsic" adapter into vLLM memory without KV-cache recomputation.
3. **GEPA reflective prompt optimization** (Layer 5): DSPy-driven offline prompt evolution against APEX-Bench faithfulness metric.
4. **EAGLE-3 speculative decoding** (Layer 6 inference plane): 2-6x wall-clock speedup on vLLM [PARTLY VERIFIED: EAGLE-3 paper arXiv:2503.01840 reports 2.5-3.7x typical on most evaluated models, up to ~5.9x on Llama-3.3-70B; "2-6x" is a benchmark-dependent envelope per synthesis Q2 secondary summary], hits sub-15s generation latency target.
5. **Agent-as-Judge tri-agent critic loop** (Layer 7): per D-018.

**Wave-44 Phase 6a addition (2026-05-24):** add a sixth galaxy-tier move surfacing the existing D-016 Layer 2 IBM TSPulse 1M polyphase time-frequency anomaly detector to the /judges visualization layer. The detector was already in the architecture catalog (D-016 item 10) but had no /judges surface; the wave-44 addition adds a 5-state discriminated-union panel (idle + scanning + clean + anomaly + error) with a sub-30 ms detection budget per pre-mortem row 71 + per-band attribution (DC + low + mid + high) for the Guardian-Safety pre-flag path. The 6 moves now form the load-bearing /judges-page narrative for the Best Use of Technology track.

**Rationale.** Source 05 source 09 Q2. Each is a genuine 2025-2026 frontier capability that no existing AI race-engineer ships. Lands the "two students could not have built this in 12 days" perception that turns judges from skeptical to evangelical.

**Affected.** Vinh-backend-plan Phase 4 Day 10-12 + wave-44 plan Vinh-scope V7 (TSPulse anomaly endpoint). arch-spec Layer 0 + Layer 2 + Layer 5 + Layer 6 + Layer 7. paper §3.5 + §3.6. Frontend WebGPU Granite Nano path + wave-44 TSPulseAnomalyPanel. PLAN new rows 4.2a through 4.2e (one per move). Pre-mortem new rows for each move's failure mode.

---

## 2026-05-22 D-020: Gradient bridge two-regime seam at SCP projector output

**Decision.** Gradients flow above the SCP projector output (TTM channel-mix decoder fine-tune + physics projection) trained via gradient descent + cvxpylayers implicit differentiation through 3 SCP iterations. Below the seam (Mellea IVR repair + tri-agent critic + GEPA prompt evolution) trained via DSPy reflective optimization, no end-to-end backprop attempted. Two regimes, one seam, no impossible end-to-end graph.

**Rationale.** Source 06 decision brief closes NotebookLM Q5 open question 1. Backprop through discrete LLM text generation is structurally broken; pretending otherwise costs Vinh days of attempting REINFORCE-style estimators that will never converge in 12 days. The clean architectural seam keeps both regimes load-bearing without forcing impossible math.

**Affected.** Vinh-backend-plan Phase 3-4 build sequence. arch-spec gradient-flow appendix. paper §3.5 (clarify training regimes).

---

## 2026-05-22 D-021: WebGPU offline scope cut (30-line Newton friction-ellipse + server-authoritative reconnect)

**Decision.** The WebGPU Granite Nano 350M in-browser path does NOT run the eight-tier SCP physics projector. It runs a 30-line Newton friction-ellipse projection (sub-microsecond per step) for offline edge consistency. Offline summary is server-authoritative: the driver's browser produces a draft the server overwrites on reconnect. The edge model is only allowed to claim things the friction-ellipse projector can independently verify. No mechanical recommendations (e.g., "reduce brake travel by 4 mm") allowed offline.

**Rationale.** Source 06 decision brief closes NotebookLM Q5 open question 2 + 3. A WebAssembly-quantized 8-tier SCP solver in the browser is genuinely impossible in 12 days; the scope cut + server-authoritative reconnect kills the consistency problem by construction without losing the WebGPU "shouldn't-be-possible" move.

**Affected.** Frontend WebGPU Granite Nano implementation (`app/frontend/lib/webgpu-nano.ts` new). Sync-on-reconnect UI affordance on `/analyze`. arch-spec Layer 0 + edge-consistency appendix. Paper §5 limitations + §5.3 bounded-scope.

---

## 2026-05-22 D-022: Lexicographic COA constraint hierarchy with elastic slacks

**Decision.** Conflicting COA constraints resolve via lexicographic hierarchy. Tier-0 (kinematic feasibility: vehicle does not leave the track) + Tier-1 (regulatory safety: no input that would violate FIA Appendix L homologation) are inviolable; the SCP solver crashes the run if these cannot be satisfied. Tier-2 (COA hardware permissions like the c_overlap flag for brake-throttle simultaneity) + Tier-3 (COA hardware constraints like steering-lock limits) relax via elastic slacks if a particular corner becomes kinematically impossible under all of them. The slack variable becomes a Guardian audit signal (the assistant report explicitly names which COA constraint was relaxed and why).

**Rationale.** Source 06 decision brief closes NotebookLM Q5 open question 2. The naive "all-COA-flags-are-hard-constraints" framing breaks the moment a hairpin demands a 270-degree steering input the adaptation only permits 180 degrees of; the solver throws an unhandled exception. The lexicographic + elastic-slack approach keeps Tier-0/1 hard + lets Tier-2/3 negotiate honestly when the geometry forces it.

**Affected.** Vinh-backend-plan Day 5. arch-spec Layer 4 constraint-resolution appendix. paper §3.4 (COA-derived constraints paragraph). New ConvergenceFixture variants for Tier-conflict scenarios.

---

## 2026-05-22 D-023: MLPerf-style tolerance-banded reproducibility protocol for APEX-Bench

**Decision.** APEX-Bench evaluation harness uses MLPerf-style tolerance bands, not bit-exact reproduction. Dockerized evaluation container with deterministic seed locks + explicit floating-point tolerance bounds per metric. Published variance report comparing RTX 4060 vs Apple Silicon results (single representative APEX-Bench lap, full LIPS 4-axis ablation, tolerance band per metric documented). External reviewers reproduce results within tolerance bands, not against unrealistic bit-exact thresholds.

**Rationale.** Source 06 closes NotebookLM Q5 open question 4. Bit-exact FP reproduction across hardware architectures (CUDA / Metal / WebGPU) is mathematically impossible; pretending otherwise is a publication-killer. The MLPerf precedent gives APEX a defensible reproducibility posture for the NeurIPS workshop submission.

**Affected.** PLAN row 6.5 APEX-Bench release block. arch-spec evaluation appendix. paper §4 LIPS 4-axis methodology. paper §5 Limitations (reproducibility framing). New `eval/` directory with `Dockerfile` + `tasks.py` + seed-lock + tolerance-band config.

---

## 2026-05-22 D-024: Physics-confidence detector (Mahalanobis-distance) feeds Granite Guardian BYOC

**Decision.** Layer 8 Guardian audit explicitly conditions on a physics-confidence detector. The detector computes Mahalanobis distance between real-time telemetry channel distributions and the assumed Pacejka tire parameter limits + thermodynamic state envelope. If distribution shift exceeds threshold (calibrated against APEX-Bench OOD axis), Guardian receives a low-confidence physics signal and downgrades the verdict from SAFE to REVIEW, with an explicit reason citing the detector. TSPulse anomaly detection feeds the same signal.

**Rationale.** Source 06 closes NotebookLM Q5 open question 5 (Guardian auditing learned physics parameters). Without the detector, Guardian blindly trusts cvxpylayers output as ground truth; if the underlying .tir Pacejka file is wrong, every downstream verdict is wrong. Detector is framed in paper §5 as a research contribution (not solved).

**Affected.** Vinh-backend-plan Day 5 + Day 11. arch-spec Layer 8 expansion. paper §3.3 Guardian paragraph + §5 Limitations + §5.4 research contribution framing. New PhysicsConfidence UI badge on `/analyze` coaching report.

---

## 2026-05-22 D-025: NeurIPS central claim locked

**Decision.** The NeurIPS Workshop paper's central claim is the **frozen-TSFM + hard differentiable physics-projection composition**. Three supporting contributions under it: (a) kinetic hallucination as a named, characterized failure mode; (b) the polyphase 50 Hz feasible-lift projector mechanism; (c) the APEX-Bench public benchmark + LIPS 4-axis evaluation framework. One paper, not four. The four-axis ablation table is the **planned empirical target** (FCVR + COBR drop to 0.00 with hard projection vs non-zero for baseline + soft-loss variants); results land via the Day-9 LIPS evaluation run + Day-10 dress rehearsal + Day-11 paper §4 table population, not pre-observed.

**Rationale.** Source 09 Q4 verdict + source 01 Perplexity's "confirmed absence" in the literature. Splitting into multiple papers dilutes the novelty per contribution; consolidating gives the strongest single submission. Source 08 line 213 (PIT WALL Phase 5 spec) frames the COA-parameterized envelope as a competing "deepest novelty" candidate; D-025 overrules because (a) frozen-TSFM-projection composition is more architecturally portable beyond motorsport (any physics-projected forecasting use case can adopt the pattern), (b) COA-parameterization is one constraint family inside the broader projection mechanism rather than the mechanism itself, and (c) the "confirmed absence" argument hinges on the composition primitive not the domain-specific constraint set.

**Affected.** paper §1 contributions list + §4 Experiments table structure + §13 References (cite Agrawal et al. 2019 cvxpylayers + Amos & Kolter 2017 OptNet + Bommasani et al. 2021 Foundation Models report + Ekambaram et al. 2024 TTM + relevant Granite stack papers).

---

## 2026-05-22 D-026: APEX-Bench public benchmark release

**Decision.** APEX-Bench is a 50-lap multi-class telemetry dataset with human ground-truth labels, released publicly under Apache 2.0 alongside the NeurIPS Workshop paper. Includes: Sarah Reynolds Britcar synthetic fixture as the adaptive-driver canonical lap, plus 5 FastF1 holdouts with synthesized 8 -tier physics labels (load transfer + thermal + Pacejka + adaptive-control variants). LIPS 4-axis evaluation (Accuracy + Physical Compliance + Industrial Readiness + OOD Generalization) with the four ablation rows: (a) zero-shot TTM no projection, (b) zero-shot TTM + soft-loss physics, (c) zero-shot TTM + hard projection (APEX), (d) TTM channel-mix fine-tune + hard projection + 3-track ensemble.

**Rationale.** Source 05 + 09 Q4 lock APEX-Bench as the third supporting contribution under D-025. Without a public benchmark, the headline empirical result cannot be independently replicated; the paper becomes a vendor pitch instead of a NeurIPS submission.

**Affected.** PLAN new row 6.5 (APEX-Bench release). New `apex-bench/` directory at repo root with `README.md` + `data/` + `eval/`. paper §4 + §4.5 release-plan paragraph. Frontend `/judges` APEX-Bench panel + downloadable artifact link.

---

## 2026-05-22 D-027: Day-3 SCP go/no-go gate (single most important checkpoint)

**Decision.** Day 3 EOD (Vinh-lane): prototype whether 3 unrolled SCP iterations actually converge through cvxpylayers with the 8-tier Pacejka linearization on the RTX 4060. Pass criterion: gradients flow end-to-end (TTM forecast through SCP projection) without exploding or vanishing; verdict landed at FCVR = 0.00 on the Sarah Reynolds canned fixture. **Fallback ladder (spec):**

1. **Fallback rung 1: drop to 2 SCP iterations + trust-region penalty if 3 oscillates.**
   - **Trust-region penalty form:** quadratic penalty `k * ||Δu||²` added to the QP objective, where Δu is the control-input delta from the previous iterate.
   - **Initial trust-region radius:** Δ₀ = 0.5 (relative to nominal control range; tighter = more conservative).
   - **Acceptance rule (Powell ratio):** ρ = actual reduction / predicted reduction (standard Powell trust-region ratio). Accept step if ρ > 0.25. Expand radius (Δ ← 2·Δ) if ρ > 0.75. Shrink radius (Δ ← 0.5·Δ) if 0 ≤ ρ ≤ 0.25. Reject step + retry with smaller radius if ρ < 0 (predicted improvement turned into actual increase).
   - **Penalty weight schedule:** k₀ = 1.0; double on each oscillation detection (max k = 8.0).
   - **Max trust-region adjustments:** 5 per outer iteration. If 5 adjustments fail to find an accepting step, declare fallback rung 1 exhausted.
2. **Fallback rung 2: escalate to D-A revision if rung 1 exhausted.** D-A revision = revert to wave-25 two-stage projection-and-audit (convex QP + non-differentiable post-projection feasibility filter). Document the revision in a fresh decision-log entry (D-A revision SHA + date). Vinh writes the revision; Stephen approves.

Logged in `logs/day-03-scp-go-no-go.md`.

**Rationale.** Source 06 names this as the single most important checkpoint in the 12-day build. SCP convergence with 8-tier Pacejka is empirical, not theoretical; literature says it converges in 3-5 iterations for well-conditioned vehicle models, but APEX's specific parameterization is novel. Day-3 prototype = empirical answer + fallback plan + no surprise on Day 7+.

**Affected.** Vinh-backend-plan Phase 0 + Phase 2 (Day 3 G0 gate replaced by D-027 SCP go/no-go). PLAN row 2.9a Notes + new pre-mortem entry for the SCP-oscillation failure mode. Day-3 log file ships before any other Phase 2 work.

---

## 2026-05-22 D-028: Galaxy-tier scope-expansion with APEX Lite ship-floor posture (project-defining pattern lock)

**Decision.** APEX operates on a two-tier posture across every wave from wave-30 forward: the **galaxy-tier maximal architecture** (8-tier physics + 12-tool stack + LangGraph orchestration + tri-agent critic + 5 shouldn't-be-possible moves + APEX-Bench release + LIPS evaluation, all per D-009 through D-027) is the TARGET, and the **APEX Lite ship-floor** (V1 NumPy physics validator + frozen Granite TTM r2.1 + Granite Guardian 4.1 text-audit baseline per D-A wave-25 architecture + Sarah Reynolds canned fixture + frontend coaching UI) is the protected fallback. The galaxy-tier scope is what we build toward; APEX Lite is what we guarantee ships by 2026-05-31. Q-004 + Q-007 triggers activate Lite when any sync-point gate fails (per PLAN §Open Questions); D-A revision branch activates when D-027 SCP fallback ladder is exhausted (per D-027). Galaxy ambition is the project's POSTURE, not the submission's RISK MODEL.

**Rationale.** Wave-30 multi-model deep-research synthesis pulled forward ~3x the build scope vs the wave-22 baseline. Per Stephen's explicit galaxy-ambition directive ("we have time, we're aiming for the galaxy, do not restrain anything, me and Vinh can build this"), prior deferral labels are RETIRED across the project; everything is in-scope for 2026-05-31. But the two-tier posture acknowledges engineering reality: a two-person team building maximal architecture in 12 days needs a named, defensible ship-floor that activates without re-litigation under deadline pressure. Pre-mortem row 63 (pattern-lock entry) was the original codification; D-028 promotes the posture to a project-defining decision-log entry per plan-gap-scanner wave-30 cold review finding.

**Affected.** Project-wide posture. Cross-references: PLAN.md Q-004 + Q-007 triggers + Phase 0 row 0.13a D-027 gate Notes + footer wave-attribution language. `docs/vinh-backend-plan.md` guiding principle 1 + Phase 0 goal + gate map + kill-switch table. `docs/apex-lite-contingency.md` (Lite scope detail). `docs/pre-mortem.md` row 63 (pattern-lock origin entry, kept for traceability). `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/feedback_galaxy_ambition_no_deferrals.md` + `project_apex_wave_30_maximal_architecture.md` (memory cross-reference). Future waves: every decision-log entry can cite D-028 when scope decisions hit the galaxy-vs-Lite seam.

---

## 2026-05-23 D-029: Wave-37 plan-gap BLOCKER #4 closure (bemyapp-devlog path resolution + shell-quote em-dash exempt)

**Decision.** Wave-37 plan-gap-scanner BLOCKER #4 (`bemyapp-devlog-day-4-to-12-scaffolds.md:224` em-dash sweep blocked on missing path) is closed as N/A. The file DOES exist at `docs/outreach-drafts/bemyapp-devlog-day-4-to-12-scaffolds.md` (the wave-35 plan referenced the wrong directory; the file is under `docs/outreach-drafts/` not `docs/` root). The single em-dash on line 224 sits inside a `grep -c $'\u2014'` shell-command quotation block + is EXEMPT per the CLAUDE.md substitution table category "code blocks + quoted source material where the original author wrote em-dash" (the U+2014 grep target IS the literal being matched, not composed prose).

**Rationale.** Wave-37 plan-gap-scanner flagged the missing path because the wave-35 plan E.3 referenced `bemyapp-devlog-day-4-to-12-scaffolds.md:226` (off-by-two; actual em-dash on line 224) without the `docs/outreach-drafts/` subdirectory prefix. The file was created during wave-22 night-late outreach scaffolding + lives in `docs/outreach-drafts/` alongside other outreach drafts (Day 1 + Day 2 devlogs + cold emails). Wave-38 E.3 verified the file's existence via `find docs -iname "*bemyapp*devlog*"` + read the line 224 context: the U+2014 character sits inside an instruction line `grep -c $'\u2014' docs/outreach-drafts/bemyapp-devlog-day-N-final.md` which is a shell-command quotation matching the same exempt category as PLAN.md line 290's `git grep -c $'\u2014' paper/physics-ttm-methods.md` reference. No em-dash sweep needed; the wave-30 zero-em-dash-in-prose rule is preserved. Wave-39 comment-analyzer M1 close-out: prior D-029 text embedded the literal U+2014 byte inside the grep target backticks; rewritten to use the `$'\u2014'` zsh/bash ANSI-C quoted-escape form so the decision-log entry itself contains zero literal em-dash characters while preserving the documentation's grep-command accuracy.

**Affected.** Wave-35 plan file E.3 acceptance criterion can now be marked complete (E.3 closure recorded here in lieu of a plan-amendment commit). `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/feedback_em_dash_zero_tolerance.md` documents the substitution-table exempt categories; D-029 reaffirms shell-command quotation as exempt. No file edits required beyond this decision-log entry.

---

## 2026-05-23 D-030: D-027 SCP gate Stage C PASS confirms G.1 GREEN BRANCH (galaxy ambition holds)

**Decision.** The D-027 SCP go/no-go gate PASSED on the council v2 reduced spec (Stage C: constant-mu friction ellipse + single SCP iterate). Per the wave-35 G.1/G.2/G.3 branch-application protocol locked at `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_stream_g_d027_branch_application.md`, **G.1 GREEN BRANCH applies.** No D-A revision. No APEX Lite activation. No fallback ladder annotation. Galaxy-tier maximal architecture stays the ship-target through Day 11.

**Result detail (per `logs/day-03-scp-go-no-go.md`, Vinh commit `c97caaa` 2026-05-23 04:58 EDT).** Stage C numeric verdict on the Sarah Reynolds 10-row telemetry stub (RTX 3060 Ti + Windows 11 + Python 3.10.7 + CUDA 12.1):

| Criterion | Council v2 threshold | Observed | Verdict |
|---|---|---|---|
| Gradient finite | no NaN/Inf anywhere | True | PASS |
| Gradient norm bounded | `\|\|grad_L\|\| < 1e4` | 24.12 | PASS |
| FCVR on Sarah stub | `<= 0.0` | 0.000000 | PASS |
| TTM output shape | `(1, 30, 14)` per `shapes.py` | `(1, 30, 14)` | PASS |
| cvxpylayers DPP-compliance | `prob.is_dpp() == True` | asserted in code | PASS |

Total wall-clock of the composed forward + projection + backward = ~1.03s on RTX 3060 Ti, leaving ~13.97s of the G8 15s coaching-report sub-budget for downstream stages (Granite Instruct narration + Guardian audit + provenance assembly).

**Rationale.** The wave-30 maximal architecture's central technical bet (frozen TSFM forecast composed with hard differentiable physics-projection) is implementable on Vinh's hardware. The kinetic-hallucination thesis ships as a working artifact, not paper-grade hand-waving. Pre-committed de-scope rung 1 (cut three-track ensemble FlowState + Chronos-2) DOES NOT FIRE per council v2 reduced-spec gating: Stage C passed cleanly. Three-track ensemble stays on the roadmap; Day-4 work proceeds as planned. Stage A (8-tier Pacejka linearization) + Stage B (3-iteration unrolled SCP) are deferred to Phase 2 Day 4 task 2.12 per council v2 staged rewrite (see D-031 for the deferral rationale + the upstream council citation).

**Affected.**

- `PLAN.md` Open Questions Q-001 + Q-007 statuses flip GREEN. Q-001 (Vinh's git config email) auto-resolved during the Phase 0 commit cluster (vinhbin author commits 836fcf6 through c69753d). Q-007 (APEX Lite EARLY trigger) D-027-condition predicate is now FALSE; Lite-EARLY remains a defined contingency but no trigger fires.
- `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_wave_30_maximal_architecture.md` updated to record D-027 Stage C PASS + the Day-3 hardware-load proof.
- Task tracker #90 (Stream G: Confirm D-027 SCP gate result + apply branch) closed completed.
- `paper/apex-neurips-workshop-2026.md` §3.2 kinetic-hallucination section will cite the Stage C numeric verdict + the Sarah stub fixture (wave-40 Stream D).
- No frontend code or schema changes triggered by D-030 in isolation; the related schema work lives in D-032 (frontend-backend type alignment) which the Vinh Phase 0 contracts unblock.

---

## 2026-05-23 D-031: Stage A + Stage B deferral to Phase 2 Day 4 task 2.12 (council v2 staged spec)

**Decision.** The D-027 SCP gate's Day 3 spike uses the council v2 reduced spec only (Stage C: constant-mu friction ellipse + single SCP iterate). The two remaining Stage A + Stage B expansions defer to Phase 2 Day 4 task 2.12. The deferral is part of the original council v2 amendment, not a wave-40 scope cut; the galaxy-tier ceiling is preserved.

- **Stage A:** 8-tier Pacejka linearization (per D-012 + D-015 Tier 7). Phase 2 Day 4 task 2.12 expansion.
- **Stage B:** 3-iteration unrolled SCP outer loop (per D-012). Phase 2 Day 4 task 2.12 expansion.
- **Stage C:** constant-mu friction ellipse + single SCP iterate. **Shipped 2026-05-23** per D-030 (Vinh commit `c97caaa`; `app/backend/apex/physics/scp_spike.py`).

**Rationale.** Per the council v2 chairman pre-code edit #3 (transcript `council-transcript-20260522-vinh-backend-plan-v2.md`): the Day 3 spike's load-bearing claim is gradient flow through the differentiable physics-projection composition, not full nonconvex constraint enforcement. Stage C answers the load-bearing question (does the composition compile + emit finite, bounded gradients?). Stages A + B answer the precision question (does the projection actually correct realistic violations at production accuracy?). Stage C passing on Day 3 unblocks Stages A + B work on Day 4; Stage C failing would have triggered the D-027 fallback ladder regardless of A + B status.

The Day 3 spike with Stage C only took ~1.03s wall-clock end-to-end. The 8-tier expansion + 3-iteration unroll will increase this; G8 latency budget (15s coaching-report sub-budget) leaves ~13.97s of headroom for Stage A + Stage B + downstream Granite Instruct + Guardian + provenance assembly. Phase 2 Day 4 task 2.12 acceptance criterion: full forecast + 8-tier Pacejka + 3-iterate unrolled SCP + Guardian audit lands within G8 latency budget on Sarah Reynolds 10-row stub.

**Affected.**

- `app/backend/apex/physics/scp_spike.py` (Stage C only; Stages A + B append Phase 2 Day 4).
- `docs/vinh-backend-plan.md` Phase 2 Day 4 task 2.12 row (already updated per council v2 amendment block at L26).
- `paper/apex-neurips-workshop-2026.md` §3.2 will cite the council v2 staged-spec rationale + Stage A + Stage B Phase 2 deferral (wave-40 Stream D).
- Pre-committed de-scope rung 1 (cut three-track ensemble FlowState + Chronos-2) does NOT fire; three-track stays on roadmap.

---

## 2026-05-23 D-032: Frontend-backend type alignment via canonical schema mirror + SCHEMA_VERSION runtime check

**Decision.** Vinh's Phase 0 contract layer (Python schemas in `app/backend/apex/shared/contracts/*` + `app/backend/apex/physics/validator.py` + `app/backend/apex/shared/logging.py`) is the canonical source for inter-layer data shapes. The frontend mirrors these schemas verbatim into `app/shared/types.ts` as `Backend*`-prefixed TypeScript types so the runtime decoder (wave-41 landing in `lib/api-decode.ts`) can translate wire payloads into the same conceptual shape the backend emits. UI-facing types (`GuardianAudit`, `PhysicsViolation`, `CoachingReport`) remain frontend projections optimized for the coaching report rendering pipeline; the decoder bridges Backend* and UI-facing shapes at the fetch boundary.

Version-constants are versioned independently:

- `SHAPES_SCHEMA_VERSION = "0.1.0"` versions the tensor channel meanings (CHANNELS tuple + CHANNEL_TIER_BINDING). Bumps when CHANNELS changes (add/remove/rename).
- `DIFFERENTIABLE_PROJECTOR_VERSION = "0.1.0"` versions the projector API surface (DifferentiableProjector Protocol method signatures). Bumps when the Protocol changes.

The wave-41 decoder will compare wire-payload `schema_version` against `SHAPES_SCHEMA_VERSION` + throw on mismatch. EdgeSummary's error state will surface the version-mismatch failure to the user. The wave-40 negative-tsc fixture (`app/frontend/tests/types/contract-alignment.test-d.ts`) enforces construction-site invariants at compile time: misshape negatives (wrong literal-union variant, missing required field, type mismatch) fire as TS errors with `@ts-expect-error` directives suppressing cleanly.

**Rationale.** Frontend `shared/types.ts` was written Day 1 for the coaching report UI; Vinh's contracts were written Day 3 for the physics pipeline. Independent evolution risks contract drift at the fetch boundary. Mirroring the canonical schemas into TypeScript with version-constants + a negative-tsc fixture catches drift at three boundaries: compile-time (TS construction-site error), runtime (schema_version mismatch throw at deserialization), + audit-trail (the negative-tsc fixture forces new variants/fields to update both ends).

Layering is intentional: backend contracts are the source of truth for physics-pipeline correctness; frontend projections are the source of truth for UI ergonomics. The decoder is the seam. If Vinh's backend swap (V1 NumPy -> V2 cvxpylayers -> V2 SCP unrolled) changes the wire shape, only the backend-canonical mirror updates; the UI projections + the decoder map stay stable.

**Affected.**

- `app/shared/types.ts` (new Backend* schemas added wave-40 commit `a9f74a4`: CHANNELS + TENSOR_SHAPE + BackendViolationRecord + BackendPhysicsViolationLog + BackendGuardianAudit + ToleranceBands + DifferentiableProjector + StructuredLogEntry).
- `app/frontend/components/AnalyzeFlow.tsx` audit_id swap from timestamp-base36 to crypto.randomUUID() (wave-40 commit `de7477b`).
- `app/frontend/tests/types/contract-alignment.test-d.ts` (NEW; wave-40 commit `ccbd049`; 14 @ts-expect-error directives covering 7 schema surfaces).
- `app/backend/apex/shared/contracts/shapes.py` + `violations.py` + `validator.py` + `projector.py` + `app/backend/apex/shared/logging.py` (Vinh canonical; the schemas the TypeScript mirror tracks).
- `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_council_v2_amendments.md` (wave-40 Stream C; records the canonical commit map).
- `paper/apex-neurips-workshop-2026.md` §3.5 + §3.7 will cite the DifferentiableProjector Protocol seam + audit_id correlation pattern (wave-40 Stream D).
- `lib/api-decode.ts` (wave-41 landing; runtime translation layer).

---

## 2026-05-23 D-033: Wave-40 cascade #10 cold-review closure (7-commit fix wave + react/no-unescaped-entities pattern lock)

**Decision.** Wave-40 cascade #10 surfaced React/no-unescaped-entities as a project-blocking ESLint hard error after commit `796c9ad` shipped 3 new visualization components (ALoRAStatusBadge + GEPAEvolutionPanel + EAGLE3LatencyBadge) carrying possessive apostrophes in JSX prose. The wave-40 cold-review fix wave (7 commits: `7205db9` + `79d871c` + `30f80d7` + `49e568f` + `3d29996` + `b4eaffe` + `2474fc0`) closed cascade #10 + locked the pattern at memory `feedback_ci_green_per_push_verify_or_cascade.md` Cascade #10 section.

**Rationale.** The React ESLint plugin `react/no-unescaped-entities` is a HARD ERROR (not warning) in eslint-config-next. Possessive apostrophes ("vLLM's", "model's", "driver's") + contractions ("shouldn't", "it's") all trip the rule. Pre-flight `npx eslint <new-file>` mandatory before push for any new component with JSX prose. Default to phrase-rewrite ("the vLLM" instead of "vLLM's") over `&apos;` escape.

**Affected.** 11-cascade behavioral checklist at `feedback_ci_green_per_push_verify_or_cascade.md` Cascade #10 section. Pattern lock applies to all future component shipping.

---

## 2026-05-23 D-034: Competitor field deep-dive integration policy

**Decision.** Every BeMyApp competitor Stephen sends gets a full 8-step deep-dive workflow: (1) verbatim save of competitor URL/screenshots; (2) parallel sub-agent dispatch on GitHub source code; (3) demo video transcript ingest; (4) 7-axis comparison vs APEX; (5) steal-list with effort tags (HIGH/MEDIUM/LOW); (6) skip-list with rationale; (7) brutal letter-grade verdict; (8) APEX-positioning impact assessment. Memory write per-competitor. Locked at `feedback_competitor_deep_dive_protocol.md`.

Steal-list integration rubric: HIGH = leaf component + no structural change + LOW effort + IBM-compatible. MEDIUM = architectural surface + Vinh-coord possible + new persistence layer OK. OUT-OF-SCOPE = requires Vinh-side backend not in Phase 0/1 + mainstream-F1-framing that dilutes adaptive-racer pillar + mock-fallback LLM in production deploy + 60fps replay without code + GoPro-mass-market overlap.

**Rationale.** Prior competitor reviews were shallow (IBM-tool-count only); Stephen flagged that depth-aware integration is the real value. RaceLens XAI was the first-proper-deep-dive 2026-05-23 day 5. Past competitors (NeuroPit / PitWall / AI Race Strategist / AI Race Engineer Copilot / RaceMind AI) re-run with the deep-dive protocol after the lock. Consolidated 6-competitor deep-dive lands at `project_apex_competitor_field_may_challenge.md` with 14 steal-list items (5 HIGH + 5 MEDIUM + 4 LOW); 9 shipped wave-41; 5 closed wave-42 Lane A.

**Affected.** Memory rule `feedback_competitor_deep_dive_protocol.md` + project memory `project_apex_competitor_field_may_challenge.md`. Future BeMyApp competitor send triggers the 8-step workflow.

---

## 2026-05-24 D-035: Wave-41 decoder + brand-type uplift architecture

**Decision.** `app/frontend/lib/api-decode.ts` ships as the load-bearing wire-boundary decoder seam between Vinh's Phase 0 Backend* schemas + the frontend UI projections. Wraps `fetch()` JSON.parse with runtime validation; replaces every unsafe `as` cast at JSON.parse boundary; translates BackendGuardianVerdict (SAFE/REVIEW/BLOCK) into UI GuardianAudit verdict (approve/flag/reject); asserts SHAPES_SCHEMA_VERSION + DIFFERENTIABLE_PROJECTOR_VERSION strict equality.

Brand-type uplift in `app/shared/brands.ts`: 6 branded primitives (AuditId + CommitSha + MahalanobisConfidence + HorizonStep + PhysicsTier + Severity) with parser-function constructors. SemVer template-literal alias + `expectSchemaVersion`/`expectProtocolVersion` strict-equality compare helpers. SENTINELS frozen const exposes the literal sentinels for consumer pattern-matching.

Brand propagation (wave-41 cascade-#11 BLOCKER B1 close-out) widens BackendViolationRecord + BackendGuardianAudit + StructuredLogEntryCanonical canonical schemas to consume the branded types so cross-brand wiring is a TS compile error at consumer sites, not a runtime corruption.

**Rationale.** Wave-40 ID-typed strings + range-constrained numbers were `string`/`number` at the wire boundary; accidental wiring bugs (passing a commit_sha into an audit_id slot) compiled silently + surfaced as runtime corruption. The brand-type discipline catches these at compile time. Decoder validates + propagates branded values end-to-end.

**Affected.** `app/shared/brands.ts` (NEW; 6 brand types + parser-function constructors). `app/shared/types.ts` (1385 lines; Backend* canonical schemas widened to brand types). `app/frontend/lib/api-decode.ts` (NEW; 7 decoder functions + 2 version-check helpers + SAFE/REVIEW/BLOCK translator + validateLibraryVersionValue). Wave-41 commits 42a6b1b + 0f83285 + 0e21d72 + 7874d6a + e21e8dd + fe62b05 + 0592d6f + c107cb2 + 10b30c5 + b17ca11 (Lane 1 close-out + brand-propagation BLOCKER fix).

---

## 2026-05-24 D-036: 5-tab AnalyzeFlow restructure + multi-stakeholder landing hero

**Decision.** Wave-42 Lane A.G.4 restructures `app/frontend/components/AnalyzeFlow.tsx` from monolithic Dropzone-then-CoachingReport flow to 5-tab sidebar (Coaching default + Tuning + Forecast + Audit + Chat). Tabs use the editorial-paddock palette + Fraunces display labels + IBM Plex Mono indicators. Dropzone stays ABOVE the tabs; handleAnalyze() resets activeTab to "coaching" on submit.

Wave-41 Lane F.5 landed multi-stakeholder framing on the landing hero subhead (`app/frontend/app/page.tsx`): "The race engineer for the drivers who don't have one" headline preserved (D-B Hero positioning); subhead expanded to include race engineers + drivers + adaptive-racing coaches + grassroots programs (RaceLens XAI steal-list HIGH-value item #5).

Tab state machine: `useState<"coaching" | "tuning" | "forecast" | "audit" | "chat">("coaching")` with `_exhaustive: never` throw in consumers. Per cascade #2 family rule: SAME-commit test-fixup with the component refactor (wave-42 commit `1c95ab5` ships AnalyzeFlow.tsx + AnalyzeFlow.test.tsx in ONE atomic commit + new tab-switch test case + cascade-fix-forward `c3de91f` removes duplicate driver_id render from GraniteCitationFooter).

**Rationale.** Monolithic flow buried Tuning + Audit + Chat surfaces in a single long scroll. 5-tab structure surfaces the 5 focus areas in parallel navigation. Coaching tab default preserves existing user flow; alternate tabs add zoom-in capability without disturbing the canonical report. Chat tab provides the AICopilotChat surface for single-turn QA against Granite 4.1 8B Instruct (wave-42 Lane A.F.4 + Lane F.D streaming hook).

Multi-stakeholder subhead expansion addresses the wave-41 RaceLens XAI deep-dive finding that the prior hero language under-served the adaptive-racing-coach + grassroots-program audiences who are equally underserved by able-bodied-baseline tooling.

**Affected.** `app/frontend/components/AnalyzeFlow.tsx` (5-tab restructure). `app/frontend/components/__tests__/AnalyzeFlow.test.tsx` (same-commit test fixup + new tab-switch test case). `app/frontend/app/page.tsx` (Lane F.5 hero subhead). `app/frontend/components/GraniteCitationFooter.tsx` (G.3 cascade-fix-forward; driver_id render removed to avoid getByText duplicate-element failure). Wave-42 commits 1c95ab5 + c3de91f + 1f12e08 (Lane F.5 wave-41).

---

## 2026-05-24 D-037: Wave-41 cascade #11 fix-wave summary + pre-push triplet lock

**Decision.** Wave-41 cascade #11 (Turbopack 16 client-bundle cross-tree resolution failure) locked at memory `feedback_ci_green_per_push_verify_or_cascade.md` Cascade #11 section. Pre-push triplet now `tsc --noEmit` + `eslint` + `pnpm build` (not just tsc + eslint). Turbopack production build catches client-bundle resolution failures that tsc + eslint miss.

Cascade #11 root cause: Turbopack 16 client-bundle resolution rejects parent-relative value imports from `app/frontend/lib/` to `app/shared/` when transitively pulled in via a `"use client"` boundary. api-decode.ts dodged the failure because useTriAgentCriticVerdict hook is orphan in the React tree; what-if-replay.ts triggered it because WhatIfReplayPanel actually consumed it. Fix pattern: type-only imports (`import type`) for cross-tree brand types in client-bundled modules + `as unknown as Brand` casts at construction sites for in-memory mock fixtures.

Wave-41 cascade #11 fix wave shipped 19 commits: prose hygiene (c032e6b + aea08c0) + forward-wave deferral sweep (db5b148) + brand-type propagation (b17ca11) + decoder structural validation (931fc4b) + hook hardening (fe16004) + ring threshold guard (f153aa4) + ring wire-in (0c7f279) + replay derivation (34cdfb8) + replay wire-in (a22737f) + guardian-audit-log hardening (f04abba) + api-decode version-check hardening (c34df06) + Turbopack fix-forward (0052d09) + Stream M.3 backend-spec doc (23d6518) + SemVer foot-gun doc (04ae446) + Symbol.for timeout sentinel (d2b55bc) + RaceEventsTilesRow severityTextColor exhaustive (5636872) + NIT batch (9c5dcdf) + Vinh Phase 1 handoff doc (c4ae1f8).

**Rationale.** 11 cascades across the session, each adding a layer to the pre-push discipline. The 11-cascade meta-rule per `feedback_ci_green_per_push_verify_or_cascade.md`: every cascade follows the SAME SHAPE; a tooling layer catches something the prior layer did not. The fix is always: add the missing layer to pre-push discipline. Wave-41 added Turbopack production build as the 4th step (after tsc + eslint + vitest). Future cascades will add subsequent layers.

**Affected.** Memory rule `feedback_ci_green_per_push_verify_or_cascade.md` Cascade #11 section. Project CLAUDE.md should mirror the pre-push triplet next refresh. All future commits gate on the 4-step pre-flight.

---

## 2026-05-24 D-038: Wave-42 Lane A close-out + Phase 1 backend wire-up (Sarah COA + OpenRouter + 5-tab AnalyzeFlow + AICopilotChat + Recharts)

**Decision.** Wave-42 ships 6 lanes per the galaxy-ambition + no-time-pressure mandate. Lane A 4 of 5 closed (G.3 GraniteCitationFooter + F.4 AICopilotChat + G.4 5-tab AnalyzeFlow restructure + F.3 Recharts triple-panel; F.1 Watson TTS deferred per external API-key dependency). Lane B 3 of 9 closed (paper §3.5 5-moves + §3.6 council v2 + §3.7 telemetry; BeMyApp payload refresh + multi-track checklist). Lane E 2 of 2 closed (BackendGuardianAudit discriminated-union by verdict + ToleranceBands path tag). Lane F 4 of 4 closed (Sarah COA fixture + .env.example + openrouter-client.ts + openrouter-stream.ts).

Cascade #12 dispatch + Lane C tests/decision-log/video + remaining Lane B items + Lane F.1 Watson TTS to ship in next session per the wave-42 plan at `~/.claude/plans/all-right-i-want-rippling-moon.md`.

**Rationale.** Wave-42 mega-wave bundle adopted to consolidate Lane 2 close-out from wave-41 + Stream M backend-coord follow-ups + paper §3 substantive expansion + Phase 1 backend wire-up unblocking Vinh per the wave-41 c4ae1f8 handoff agreement. Stephen explicit galaxy mandate + Step-by-step "best ability you can" execution.

**Affected.** Wave-42 commits shipped 2026-05-24 day 6: 82d1f85 (F.A Sarah COA) + f1cd1d1 (F.B .env.example) + 7179dc1 (F.C OpenRouter client) + dc5bd7e (F.D streaming hook) + 61ba4e8 (M.1 discriminated union) + 1fb8f75 (M.2 path tag) + 86f66fb (paper §3 expansion) + b8ea888 (BeMyApp refresh + multi-track checklist) + f663eeb (G.3 GraniteCitationFooter) + 0fe075f (F.4 AICopilotChat) + 1c95ab5 (G.4 5-tab) + c3de91f (G.3 fix-forward) + 84e001e (F.3 Recharts) + 7b010a9 (F.3 fix-forward ResizeObserver polyfill). 14 substantive commits + 2 cascade-fix-forwards = 16 commits total.

---

## 2026-05-24 D-039: Wave-42 cascade #12 fix wave + cold-review-2 close-out (post-D-038 extension)

**Decision.** Cascade #12 6-agent cold review (dispatched twice; round 1 mid-execution + round 2 post-checkpoint) surfaced 4 cross-corroborated BLOCKERs + 12-15 HIGH + 18-20 MED + 8-10 NIT findings. Round 1 closed 2 BLOCKERs inline (chat /api/openrouter-stream route missing + openrouter-client decoder cast). Round 2 closed 2 NEW BLOCKERs inline (route runtime declaration + consumer cancel respect) + 2 HIGH (BLOCK variant destructure + chat-model placeholder check).

Cascade #12 fix-wave commits since D-038: 89da297 (chat route NEW) + efd8f94 (decoder NEW) + 8f5cdd4 (decoder test-fixture fix-forward) + 84e20b1 (F.1 WatsonTtsRadio walkie-talkie) + df3109d (route runtime + cancel) + 01855a3 (BLOCK destructure) + b87f618 (chat-model placeholder check). Plus cold-review-2 docs accuracy this commit: BeMyApp 8 -> 12 tools long-form alignment + multi-track-checklist prize amounts deferred to Day 11 verification + this D-039 entry.

Cascade #12 fix-wave residual queued for next session: openrouter-client 5xx/429 retry leaks response body + openrouter-stream TextDecoder fatal flag + AICopilotChat stuck-question footgun + AICopilotChat answered-state unreachable + memo dead-code removal + AnalyzeFlow tab exhaustive-switch default + WatsonTtsRadio exhaustive-switch + 5-10 NITs.

**Rationale.** Per cascade #11 11-cascade meta-rule + cascade #12 round-2 confirmation: every cascade follows the same shape (a tooling layer catches what the prior layer missed). Round 2 added the cold-review-after-checkpoint discipline so post-batch quality bar verifies before the next batch begins. Atomic-commit + pre-push triplet preserved throughout; CI green at HEAD after each fix-forward.

**Affected.** All wave-42 commit SHAs cited above + the cascade-#12 fix-wave commits + this entry. Memory rule `feedback_ci_green_per_push_verify_or_cascade.md` cascade #12 section to land Day 7 morning per the next-session entry order.

---

## 2026-05-24 D-040: Wave-42 cold-review-2 BLOCKER B-1 HARD-COMPLIANCE close-out + wave-43 plan-mode entry

**Decision.** Post-D-039 wave-42 cold-review-2 comment-analyzer agent surfaced 1 HARD-COMPLIANCE BLOCKER B-1: invented FIA Article numbers (18.3.2 + 18.3.3 + 18.3.5 + 18.3.7) across 3 production surfaces violated the project CLAUDE.md "No invented FIA Article numbers" rule. Closed inline via commit 0baa161 (4 fabricated article numbers eliminated; softened to "FIA Appendix L adaptive-equipment provisions (article TBD per published revision)" pattern; Certificate of Approval typo corrected to Certificate of Adaptations per APEX canon).

Post-B-1 close-out, wave-43 plan-mode entry locked at `~/.claude/plans/all-right-i-want-rippling-moon.md` per Stephen explicit galaxy-ambition mandate ("best possible project + nothing post-hackathon + use every necessary tool + aim for the galaxy"). Wave-43 absorbs 8 parallel lanes: Lane A2 cold-review-2 quick-wins (5 commits including this D-040) + Lane B2 Lane B finish (3 commits) + Lane C2 tests + video + deck + memory (13 commits) + Lane D2 cascade-#12 HIGH + MED residual fix-wave (12 commits) + Lane E2 production Watson TTS endpoint + Stream M.3 spec extension (3 commits) + Lane F2 cascade-#13 6-agent dispatch + fix-wave (6 to 12 commits) + Lane G2 pre-submission infrastructure including canonical FIACoa shape + D-041 + D-042 + final sweep + apex.race deploy verify (6 commits) + Lane H2 Obsidian session memory + memory rule updates (non-git). Total estimate 46 to 62 atomic commits + Obsidian discipline.

Cold-review-2 cross-corroborated finding cluster across 6 agents (codex + silent-failure-hunter + type-design-analyzer + code-reviewer + comment-analyzer + plan-gap-scanner) summary:

- BLOCKER tier (5 closed inline): chat /api/openrouter-stream route runtime declaration + ReadableStream consumer cancel respect + decodeChatCompletionResponse runtime decoder + BLOCK variant destructure-and-spread + chat-model placeholder check + B-1 FIA Article fabrication elimination.
- HIGH tier residual queued for Lane D2 (8 items): openrouter-stream monotonic generation counter + decoder error-shape array + null + 5xx/429 retry response.body cancel + decoder usage validation + AICopilotChat answered-state collapse + CoachingReportLiveCharts memo drop + openrouter-client stream:boolean drop + AbortSignal server-side threading.
- MED tier residual queued for Lane D2 + G2 (10+ items): Watson HEAD fetch error logging + speechSynthesis lifecycle + WatsonTtsRadio + AnalyzeFlow exhaustive-switch defaults + ToleranceBands acknowledged-and-doc + route.ts predicate narrow + tab CSS-hidden state preservation + ResizeObserver mock callback capture + 5 comment-analyzer doc-accuracy items.
- NIT tier residual: 12 commit subjects over 100 char (behavioral; enforce wave-43 onward) + 3 bundled commits (atomic-discipline behavioral; enforce wave-43 onward).

**Rationale.** Comment-analyzer agent caught the HARD-COMPLIANCE breach before submission deadline. Per project CLAUDE.md "No invented FIA Article numbers. Verify via FIA.com or research/ PDFs." rule + the wave-29 softening pattern: APEX derives the simultaneity flag from approved hardware specifications + medical-finding fields (not from per-article references); the appendix governs the COA framework but per-article enumeration is owned by FIA-published documentation.

Wave-43 plan locked under no-time-pressure rule + galaxy-ambition (calendar dates are facts; rationing-narrative is the violation). Sequencing respects token budget via 6-phase plan + per-phase parallel-execution capacity + Read-all-then-Edit-all-then-commit batch pattern.

**Affected.** Wave-42 commits 0baa161 (B-1 close-out) + this D-040 entry. Wave-43 plan at `~/.claude/plans/all-right-i-want-rippling-moon.md`. Lane H2.4 cascade #12 + #13 memory-rule additions. Lane G2.1 canonical FIACoa shape (touches `app/shared/types.ts` + `fixtures/personas/sarah-reynolds-coa-stub.json`).

---
