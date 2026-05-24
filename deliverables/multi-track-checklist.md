# APEX Multi-Track Checklist - IBM SkillsBuild AI Builders Challenge May 2026

> Wave-42 Lane B.E.3 close-out per docs/vinh-phase-1-handoff.md project context. Documents APEX positioning per official judging category. Per Discord clarification from Lucas-BMA (Day 1 EOD; reference: `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/reference_discord_intel_day_1.md`): NO opt-in tracks; ONE submission per team; judges award 4 prizes based on 4 evaluation criteria.

## Hackathon mechanics

- Single submission per team via BeMyApp project page
- Judges award (cash amounts per the live BeMyApp project page; Day 11 morning verification per the pre-submit checklist below):
  - **1st Place**
  - **Runner-up**
  - **Best Use of Technology** (weighted toward IBM Granite stack depth)
  - **Most Innovative** (weighted toward novel architecture)
- Additional **Grand Prize** awarded across the May + June challenges to one standout submission.
- 4 evaluation criteria per the rules PDF:
  - Technical Execution
  - Innovation
  - Challenge Fit
  - Implementation / Feasibility
- Hard deadline: 2026-05-31, 11:59 PM ET
- Per the Official Rules Google Doc (verified via `reference_ibm_skillsbuild_org.md`): a single submission can compete for any prize it qualifies for; the highest-ranked judging surface determines the cash prize.

## APEX positioning per prize category

### 1st Place ($5K)

**APEX argument.** Adaptive racers + veterans + grassroots competitors are an underserved audience the May Challenge brief explicitly names. APEX is the first IBM-Granite-stack AI race engineer that reads the FIA Certificate of Adaptations at the tensor level. The Convergence-14 fixture suite (visible at /judges) is the unit-tested safety contract that prevents the "adaptive driving misdiagnosed as driver error" failure mode. apex-one-black.vercel.app ships live in production.

**Evidence surfaces:**
- apex-one-black.vercel.app live frontend with /judges + /analyze + /status + /sim-rig
- 14-fixture Convergence catalogue with serializer round-trip tests
- 5 shouldn't-be-possible moves stacked on the 3-layer pipeline
- COA-parameterized simultaneity gate (D-022) demonstrated via what-if-replay on /judges
- 3-min demo video + 11-frame deck PDF
- 60+ atomic commits across 12 days; CI green per push

### Best Use of Technology ($2K)

**APEX argument.** APEX uses 12 IBM Granite tools per the wave-30 D-016 stack expansion. Every tool is load-bearing (no "logo on slide" tools). The integration depth includes:

- Granite TimeSeries TTM r2.1 as the frozen TSFM forecaster (NeurIPS 2024)
- Granite FlowState 9.1M as Track 2 of the 3-track forecasting ensemble per D-010
- IBM TSPulse 1M for polyphase anomaly detection on 50 Hz phase streams per D-016
- Granite Guardian 4.1 as the BYOC custom-rules audit gate + D-024 physics-confidence detector verdict downgrade
- Granite Embedding R2 149M + 47M as the RAG retrieval layer for FIA Appendix L citations per D-016
- Granite-Docling 258M for FIA COA PDF parsing
- Granite Vision 4.1 4B for timing-sheet PDF parsing
- Docling library as the document conversion backend
- Granite 4.1 8B Instruct as the race-engineer narrator
- Granite 4.0 Nano 350M as the in-browser WebGPU edge model per D-019 item 1 + D-021
- Langflow for visible orchestration graph per D-017
- IBM Bob as the build accelerator

**Evidence surfaces:**
- /judges page Stack tab enumerates all 12 tools with per-tool layer mapping
- README + paper §3.6 cite each tool with D-### decision-log anchor
- watsonx.ai bonus path lands if Day 10-11 runway permits per `docs/vinh-phase-1-handoff.md` Q2 decision

### Most Innovative ($2K)

**APEX argument.** The innovation density rests on 5 composition moves per wave-42 paper §3.5 expansion. Each is independently cuttable per APEX Lite contingency; the composition is the contribution.

**5 shouldn't-be-possible moves:**
1. WebGPU Granite Nano 350M in-browser inference (Layer 0; EdgeSummary.tsx)
2. Activated LoRA Granite 4.0 instruct (Layer 6; ALoRAStatusBadge.tsx)
3. GEPA evolutionary prompt optimization (Layer 5; GEPAEvolutionPanel.tsx)
4. EAGLE-3 speculative decoding for sub-15s local latency (Layer 6; EAGLE3LatencyBadge.tsx)
5. Agent-as-Judge tri-agent critic loop with Mellea Instruct-Validate-Repair (Layer 7; TriAgentCriticPanel.tsx)

**Plus the wave-30 D-022 architectural novelty:** the COA-parameterized brake-throttle simultaneity gate is the load-bearing identity-aware coaching mechanism. The 9th tensor channel (coa_overlap_flag) routes through both Stage 1 differentiable QP constraints + Stage 2 nonconvex feasibility filter so adaptive-driver telemetry produces different physics corrections than able-bodied baseline.

**Evidence surfaces:**
- Paper §3.4 COA-parameterized simultaneity gate
- Paper §3.5 5-moves articulation
- what-if-replay demonstrates COA mutation flips violation log per wave-41 G.1
- 5 React surfaces (EdgeSummary + ALoRAStatusBadge + GEPAEvolutionPanel + EAGLE3LatencyBadge + TriAgentCriticPanel) all visible on /judges

### Runner-up ($2K)

**APEX argument.** Per the Devpost stacking-rules clarification (`reference_competitors_calibration.md`), Runner-up is the consolation prize if 1st Place is awarded to a competitor; APEX qualifies for the same evaluation criteria so the same evidence surfaces apply.

## Competitor field positioning

Per the wave-41 day 5 consolidated competitor deep-dive at `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_competitor_field_may_challenge.md`: 6 visible May Challenge competitors. APEX positioned to win all 4 categories per the deep-dive threat-ranking analysis. Steal-list integrations from NeuroPit + PitWall + AI Race Engineer Copilot + RaceMind AI + RaceLens XAI + AI Race Strategist (14 items: 5 HIGH + 5 MEDIUM + 4 LOW) all shipped across wave-41 + wave-42 Lane A.

## Pre-submit final-pass checklist

Per `feedback_ci_green_per_push_verify_or_cascade.md` 11-cascade behavioral checklist + Day 11 morning verification:

- [ ] apex-one-black.vercel.app live + Vercel production deploy green
- [ ] /judges all sections render without console errors (Playwright fidelity wave-42 Lane C.H.2)
- [ ] /analyze 5-tab structure renders with chat + Live Charts + confidence ring + walkie-talkie audio (Playwright fidelity wave-42 Lane C.H.3)
- [ ] BeMyApp form payload pasted into live form (this doc)
- [ ] Banner image uploaded (deliverables/bemyapp-banner-1920x600.png)
- [ ] GitHub URL https://github.com/StephenSook/apex confirmed public + green CI on HEAD
- [ ] 3-min demo video uploaded + linked (deliverables/demo-video-script-3min.md beats matched)
- [ ] 11-frame deck PDF rendered (deliverables/deck-2026-05.pdf via Playwright HTML-to-PDF)
- [ ] Team member GitHub handles confirmed (StephenSook + Vinh-handle)
- [ ] AI-tone sweep clean across paper + README + deck + video script
- [ ] Em-dash sweep clean across composed prose
- [ ] No named operators without per-surface consent (per `feedback_anonymization_pre_consent.md`)
- [ ] Sarah Reynolds persona watermark visible in all surfaces (fictional-persona NIL discipline)

## Cross-references

- `deliverables/bemyapp-submission-payload.md` (form-field payload)
- `paper/apex-neurips-workshop-2026.md` (technical write-up)
- `README.md` (repo-level submission entrypoint)
- `docs/decision-log.md` (D-001 through latest)
- `docs/vinh-phase-1-handoff.md` (Phase 1 ownership split)
- `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/reference_ibm_skillsbuild_org.md` (official rules + prize structure verification)
- `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/reference_discord_intel_day_1.md` (Discord clarifications)
- `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_competitor_field_may_challenge.md` (competitor field deep-dive)
