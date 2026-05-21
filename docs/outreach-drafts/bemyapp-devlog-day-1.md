# BeMyApp Community Devlog - Day 1

> Daily community-ping per the always-ship trivials list (PLAN.md §Scope tiering). Posted to BeMyApp May Challenge chat room. Stephen owns. Around 90 seconds of work per day. Galaxy-tier rule says ship every build day evening.
>
> **Owner:** Stephen Sookra. **Send to:** BeMyApp May Challenge chat room (Chat Rooms widget on the projects page).

---

## Day 1 ping (post 2026-05-20 evening ET)

```
Day 1 done on APEX. Building an AI race engineer for adaptive racers (drivers running hand-controls, veteran-team competitors, grassroots-budget teams) on the IBM Granite stack.

Pipeline: telemetry CSV + FIA Certificate of Adaptations + driver debrief into a frozen Granite TimeSeries TTM r2.1 forecaster, wrapped in a differentiable physics-projection layer (CvxpyLayer QP with friction ellipse + bicycle model + COA-flagged brake-throttle simultaneity), audited by Granite Guardian 4.1 with BYOC custom rules, narrated by Granite 4.1 8B Instruct.

Repo public Day 1: https://github.com/StephenSook/apex (Apache 2.0). 67 atomic commits, Mermaid architecture in the README. Team: Stephen Sookra (frontend + pitch) + Vinh Le (backend + ML).

11 days to go.
```

## Day 2 ping template (post 2026-05-21 evening ET, fill in after Gate G1+G4 results)

```
Day 2 on APEX.

[If G1+G4 both pass:] Gate G1 (TTM smoke) and Gate G4 (TTM zero-shot vs seasonal-naive on 5 FastF1 holdouts) both green. Sub-1M-param TTM beats naive on [X] of 5 circuits. PhysicsTTM physics-projection layer starts Day 3.

[If G4 fails:] Honest update: TTM zero-shot lost to seasonal-naive on [X] of 5 holdouts. Domain shift from weather/retail-pretraining to motorsport telemetry is real. Pivoting pitch from "TTM forecasts pace" to "physics-constrained envelope + COA-aware narrator" - same product, different anchor. APEX Lite contingency activated.

[If APEX Lite triggered:] Lite mode invoked. Same product surface (coaching report + tuning recommendation + Guardian audit), simpler forecaster substituted for TTM. 10 days to go.

[Always end with:] Repo: https://github.com/StephenSook/apex
```

## Day 3-10 ping templates

Day 3: Phase 2 physics validator V1 lands. NumPy-only kinematic checker on 5 impossible-physics traces. Q&A Card 3 memorized.

Day 4: Coaching-report React component wires against canned Sarah Reynolds fixture. End-to-end frontend → mocked backend flow tested.

Day 5: CvxpyLayer V2 replaces NumPy validator. Granite Guardian BYOC custom rules. Convergence 14 serializer unit-test suite lands.

Day 6: End-to-end Sarah Reynolds canned case runs. Gate G6 = the Core 6 ship-blocker. Granite Instruct narrator emits the coaching report.

Day 7: Langflow visible orchestration graph exports. Deck draft v0 + 3-min pitch script storyboard. LinkedIn DM beta-tester escalation (Day 3 already actioned, this is Day-5 follow-up).

Day 8: June Challenge bridge architecture doc. Latency closure under 60s on RTX 4060. Deck draft v1 with all 13 mandatory edits from Phase 4.5 synthesis.

Day 9: Hugging Face Space deploy. Colab notebook publishes. Sim-rig WebSocket integration. Dress rehearsal 1.

Day 10: Production demo video + 30s highlight clip. Lite contingency final decision (default NO).

Day 11: Submission package. Methodology trace. Judges page. Status dashboard. NeurIPS Workshop paper draft.

Day 12: Submit to BeMyApp.

## Discipline

- Send each evening of build day.
- Keep to under 80 words.
- No em-dash. No AI-blocklist words.
- Tag IBM SkillsBuild + IBM Granite when relevant.
- Link to repo every time (judges + lurkers).

---

_Last updated: 2026-05-20 Day 1 EOD by Stephen. Day 1 send: ready. Day 2+ fills in after each gate._
