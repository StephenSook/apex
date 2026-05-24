# APEX 3-min demo video script

> Wave-43 Lane C2.7 close-out per the plan acceptance criterion (8-beat 3-min spoken pace; ~450 words). Record Day 10-11 per the calendar. Editorial-paddock visual identity throughout. Sarah Reynolds persona is fictional + watermarked.

**Target runtime:** 180 seconds.
**Total word budget:** ~450 words at ~150 wpm engineer-paddock pacing.
**Voice direction:** quiet authority. No marketing hype. No em-dash in spoken prose; the script uses periods + colons.

---

## Beat 1: Hook (0:00 - 0:15; ~38 words)

> A professional race engineer costs hundreds of pounds per day. Every Formula 1 driver has one. Most adaptive racers, veteran-team drivers, and grassroots competitors do not. The FIA lifted its single-seater ban on disabled drivers in 2017. The regulatory barrier dropped. The economic barrier stayed.

**On-screen:** APEX wordmark in Fraunces italic on warm cream paper. Sarah Reynolds composite portrait (fictional persona). Donington Park Lap 17 telemetry slice scrolling at 1Hz.

---

## Beat 2: Telemetry upload + COA parse (0:15 - 0:35; ~50 words)

> Sarah uploads three things: her telemetry CSV, her FIA Certificate of Adaptations PDF, and a 30-second written debrief. Granite-Docling parses the COA at the tensor level. It extracts the hand-control hardware specification and produces the COA-overlap flag that routes through every layer downstream.

**On-screen:** /analyze Dropzone with the three files dragging in. Granite-Docling extraction trace showing the simultaneity flag flip to permitted.

---

## Beat 3: PhysicsTTM pipeline forecast + projection (0:35 - 1:05; ~75 words)

> The pipeline runs three layers. Layer one: a frozen Granite TimeSeries TTM forecaster from NeurIPS 2024 turns 1-Hz mini-sector telemetry into a next-session pace envelope. Layer two: a two-stage projection-and-audit layer. Stage one is a differentiable convex QP enforcing the friction ellipse, the forward-Euler kinematic step, and a jerk bound. Stage two is a post-projection feasibility filter that audits the bicycle-model coupling and the COA-parameterized brake-throttle simultaneity gate.

**On-screen:** PhysicsTTM diagram animating layer-by-layer. Forecast envelope drawing on the chart. Stage 1 QP constraints highlighting per-step.

---

## Beat 4: Tri-agent critic loop verdict (1:05 - 1:30; ~62 words)

> Three Granite-Critic instances read the draft coaching report in parallel. Physics-Critic, Pedagogy-Critic, Guardian-Safety. If any critic flags, IBM Mellea Instruct-Validate-Repair fires with loop budget three until the panel approves. Then the final Guardian audit. Every recommendation that reaches the driver has been read by three independent agents plus the safety gate.

**On-screen:** TriAgentCriticPanel on /judges. Three critic verdicts streaming in. Mellea repair loop indicator. Guardian green stamp.

---

## Beat 5: Coaching report + tuning + walkie-talkie (1:30 - 2:00; ~75 words)

> The coaching report renders. Corner-by-corner insights, tuning recommendations, forecast envelope. Every claim cites a specific FIA Appendix L provision and a specific COA section. Provenance on every line. The Watson TTS walkie-talkie reads the report in race-engineer voice with the filter chain that gives it the paddock-radio acoustic profile. Sarah hears it on her cool-down lap.

**On-screen:** CoachingReport 5-tab AnalyzeFlow showing Coaching tab. Citation footer expandable. Walkie-talkie audio playback button. Audio waveform.

---

## Beat 6: WebGPU Granite Nano edge demo (2:00 - 2:20; ~50 words)

> If Sarah loses connection in the paddock, the Granite 4.0 Nano 350M model runs in her browser via WebGPU. Same coaching prompt. Same output shape. No round-trip. The Edge Summary card on the judges page surfaces the move in pipeline order.

**On-screen:** /judges Edge Summary card showing the in-browser model load + inference. Network indicator drops; coaching still works.

---

## Beat 7: Five shouldn't-be-possible moves + COA killshot (2:20 - 2:45; ~62 words)

> Five composition moves stack on top. WebGPU Granite Nano. Activated LoRA. GEPA evolutionary prompt optimization. EAGLE-3 speculative decoding for sub-15-second local latency. And the tri-agent Agent-as-Judge critic loop. The architectural novelty is the COA-parameterized brake-throttle simultaneity gate. The same coaching pipeline produces different physics corrections for adaptive versus able-bodied drivers, governed by the driver's COA.

**On-screen:** Five galaxy-tier panels on /judges. What-if-replay drawer flipping the COA flag. Violation log appearing on the able-bodied counterfactual.

---

## Beat 8: IBM Granite stack + adaptive-racer mission + close (2:45 - 3:00; ~38 words)

> Twelve IBM Granite tools. Every slot load-bearing. Built for adaptive racers first, every grassroots competitor second. APEX dot race. Built on IBM Granite for the drivers who do not have a race engineer.

**On-screen:** 12-tool IBM Granite stack mosaic. APEX wordmark resolve. apex-one-black.vercel.app URL. IBM SkillsBuild May Challenge submission badge.

---

## Recording notes

- Read at a quiet authority pace. No upspeak. No marketing cadence. Match the editorial-paddock tone of the frontend.
- Pause between beats for visual transitions.
- Watson TTS walkie-talkie clip plays diegetically in Beat 5; do not voice-over during it.
- Sarah Reynolds is a fictional persona; mention the watermark only if a judge asks in Q+A.
- No em-dash anywhere in spoken prose; pause for the period.
- AI-tone blocklist enforced: no "leverage", no "seamless", no "robust", no "comprehensive", no "delve", no "cutting-edge", no "streamline", no "ecosystem", no "easily", no "simply".

## Cross-references

- `paper/apex-neurips-workshop-2026.md` §3 architecture for technical accuracy spot-check
- `deliverables/demo-video-30s-storyboard.md` 30-second highlight clip (subset of beats 1 + 4 + 6 + 7)
- `deliverables/deck-2026-05.pdf` 11-frame slide deck (mirrors these 8 beats)
- `deliverables/bemyapp-submission-payload.md` submission form payload
