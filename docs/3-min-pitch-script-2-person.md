# APEX 3-Minute Demo Video Script (2-person: Stephen + Vinh)

> Final-lock version of the 3-min submission video script for the IBM SkillsBuild AI Builders Challenge May 2026 ("AI Beyond the Finish Line"). Length target 2:55, hard cap 3:00.
>
> **Owners.** Stephen Sookra (frontend / product / persona / positioning narration) + Vinh Le (backend / physics / architecture narration). Both on camera Beats 1 + 8; alternating screen-recording-with-VO Beats 2 through 7.
>
> **Cross-references.** `deliverables/demo-video-storyboard.md` for per-second visual framing (mirror the 8-beat shot list verbatim; this 2-person script swaps single-narrator beats for split-narrator beats). `docs/3-min-pitch-script.md` is the prior single-narrator v0. Memory `project_apex_qa_killshots.md` for the Q&A pack used post-pitch.

---

## Voice split rule

- **Stephen narrates:** Beats 1 (Hook) + 3 (Sarah persona) + 6 (Live UI + outputs) + 7 second-half (team + audience) + 8 (Close). The product + persona + positioning narration.
- **Vinh narrates:** Beat 4 (Architecture) + Beat 5 (COA killshot) + Beat 7 first-half (14-tool stack enumeration). The technical depth + physics + IBM Granite stack narration.
- **Both on camera:** Beat 1 opening 3 seconds (cold-open standing side-by-side in cream-paper studio) + Beat 8 closing 4 seconds.
- **Stephen reads Beat 2 (Problem):** narrates over the SVG racing-line graphic. Vinh holds frame.

This split surfaces the two-person team without forcing the viewer to track which voice belongs to which engineer. The product surface is Stephen's voice; the engineering depth is Vinh's voice. Consistent throughout.

---

## Beat-by-beat 2-person script

### Beat 1. Hook (0:00 to 0:08, 8 s)

| Time | Visual | Narrator | What is said |
|------|--------|----------|--------------|
| 0:00 - 0:03 | Both on camera, eye-level, cream background, racing-green chevron strip across the bottom. Stephen left, Vinh right. | Stephen | "There are racing drivers without a paid race engineer." |
| 0:03 - 0:08 | Both on camera. Subtle staggered reveal: project tagline appears in Fraunces italic. | Vinh | "APEX is for them." |

### Beat 2. Problem (0:08 to 0:25, 17 s)

| Time | Visual | Narrator | What is said |
|------|--------|----------|--------------|
| 0:08 - 0:14 | Cut to hand-coded SVG racing line on cream paper. Apex point annotated in clay red. | Stephen | "A professional race engineer costs four to five hundred pounds a day." |
| 0:14 - 0:20 | Pull-back zoom on the racing line; FIA logo + 2017 timestamp fade in upper-left. | Stephen | "Every Formula One driver has one. Most adaptive racers, veteran-team drivers, and grassroots competitors do not." |
| 0:20 - 0:25 | SVG crossfades to FIA Appendix L cover-page mockup; adaptive-equipment-homologation section highlighted. | Stephen | "After the FIA regulatory revision in late 2017 lifted the single-seater ban on disabled drivers, the barrier stopped being regulatory. It became economic." |

### Beat 3. Hero use case, Sarah moment (0:25 to 0:42, 17 s)

| Time | Visual | Narrator | What is said |
|------|--------|----------|--------------|
| 0:25 - 0:31 | Cut to BMW M240i Britcar illustration in racing green. Sarah-persona card slides in from the right. | Stephen | "Britcar Trophy 2026. Lap 17 of 19 of qualifying at Donington Park." |
| 0:31 - 0:37 | Hand-control diagram inset over the M240i illustration; telemetry trace overlay across the bottom. | Stephen | "Sarah Reynolds is two tenths off her PB and the time is bleeding out in Sector 2 at Old Hairpin." |
| 0:37 - 0:42 | Cut to Sarah's debrief text in Fraunces italic. | Stephen (paddock voice, reading her debrief) | "lost the rears mid Old Hairpin again, can't trail-brake on the lever the way she did at Croft last month." |

### Beat 4. The architecture, PhysicsTTM three layers (0:42 to 1:30, 48 s)

| Time | Visual | Narrator | What is said |
|------|--------|----------|--------------|
| 0:42 - 0:50 | Cut to LangGraph orchestration graph screenshot, full screen, racing-green border. | Vinh | "APEX runs on the same IBM Granite stack that ships to Scuderia Ferrari's fan app, pointed at the drivers who need a race engineer most." |
| 0:50 - 0:58 | Animate three rectangular layer cards top-down: TTM amber + Physics projection clay + Guardian racing green. | Vinh | "Three layers. Layer one is a frozen Granite TimeSeries TTM r2.1 with a channel-mix decoder fine-tune per the D-010 Track 1 pivot. NeurIPS 2024 release. We aggregate raw fifty hertz telemetry to one hertz mini-sector tensors so the input sits inside the model's published support envelope." |
| 0:58 - 1:08 | Physics projection card highlights; animated math: friction ellipse, bicycle model, forward-Euler kinematic step. | Vinh | "Layer two is a differentiable Cvxpylayers physics projection at constant mu. Friction ellipse plus bicycle model plus forward-Euler kinematic step plus a circuit-conditional friction lookup. Eight-tier Pacejka linearization, three-iteration SCP outer-loop, and jerk-bound enforcement are deferred swap-points named in the D-031 staged ladder. The HEAD ship is constant-mu friction-ellipse projection only." |
| 1:08 - 1:18 | Guardian card highlights; animated text-log entries scroll with check marks. | Vinh | "Layer three is Granite Guardian 4.1 8B with custom rules auditing the structured text log of every projection correction. Granite 4.1 8B Instruct writes the coaching report in a race-engineer voice." |
| 1:18 - 1:30 | Pull back to the three cards visible together. Two-job-split annotation arcs between TTM and Instruct sub-card. | Vinh | "Two jobs split between two models. TTM forecasts the next-session pace envelope. Instruct turns the envelope plus the Certificate of Adaptations plus the debrief into a precision tuning recommendation. Aggregation done honestly." |

### Beat 5. The killer detail, COA simultaneity (1:30 to 2:00, 30 s)

| Time | Visual | Narrator | What is said |
|------|--------|----------|--------------|
| 1:30 - 1:38 | Side-by-side split. Left: Sarah's synthetic COA hardware-specification section. Right: telemetry trace with brake + throttle simultaneous through the Old Hairpin window. | Vinh | "Three structural moats. First application of a pretrained time-series foundation model to adaptive motorsport telemetry. First public AI race-engineer workflow we found that reads the FIA Certificate of Adaptations as a binding regulatory input. First COA-parameterized brake-throttle simultaneity gate." |
| 1:38 - 1:46 | Same split view. Track Titan logo (red X) overlays on the right trace; APEX logo (green check) appears next to it. | Vinh | "Standard tools assume able-bodied physics. They encode throttle times brake equals zero. Sarah's electronic hand-control system has approved hardware that permits simultaneous brake and throttle inputs mid-corner. Her COA permits it." |
| 1:46 - 2:00 | Zoom into the hardware-spec text from Section 3(c) of her synthetic COA. Highlight the dual-stage trigger description. Cut back to telemetry trace with APEX permitted-region shading. | Vinh | "The V1 NumPy validator reads coa_overlap_flag equals one from her Certificate of Adaptations and routes the constraint per-driver. When the hardware permits it, the projection recognises the input. We do not coach disabled drivers with the same model as everyone else. We coach them with the model that matches their car." |

### Beat 6. What APEX returns (2:00 to 2:30, 30 s)

| Time | Visual | Narrator | What is said |
|------|--------|----------|--------------|
| 2:00 - 2:08 | Cut to live APEX `/analyze` UI. Corner-by-corner coaching report with three corner cards visible. | Stephen | "Sixty seconds after Sarah uploads her telemetry, APEX returns a corner-by-corner coaching report," |
| 2:08 - 2:16 | Scroll the UI to the tuning card. Highlight the brake-lever-travel delta and the COA section citation. | Stephen | "a tuning recommendation, reduce hand-lever brake travel by four millimetres, citing the exact COA section," |
| 2:16 - 2:22 | Scroll to the next-session forecast chart; show the mean line and confidence band. | Stephen | "a next-session lap-pace envelope forecast," |
| 2:22 - 2:30 | Scroll to the Guardian audit panel; verdict stamp + reasoning trace items; reproducibility footer enters. | Stephen | "and a Granite Guardian safety stamp with the reasoning trace visible. Every claim cites a specific Certificate of Adaptations section and a specific FIA Appendix L provision. Provenance on every line." |

### Beat 7. Stack + team + audience (2:30 to 2:50, 20 s)

| Time | Visual | Narrator | What is said |
|------|--------|----------|--------------|
| 2:30 - 2:38 | Cut to the fourteen-tool IBM Granite stack grid. Each cell a badge with the model name + honesty-tier pill. Each tool highlights once as it is named. | Vinh | "Fourteen IBM Granite tools on a per-tool honesty ladder. Granite-Docling, Granite Vision, Granite TimeSeries TTM, Granite FlowState, IBM TSPulse, Granite Embedding R2, Granite Guardian, Granite Instruct 4.1 8B, Granite Instruct 4.1 3B chat-routing, Granite Speech 4.1 2B-Plus, Granite 4.0 Nano WebGPU edge, LangGraph plus Granite MCP Gateway plus ContextForge orchestration, Docling library and Mellea v0.5.0 as build-time accelerators." |
| 2:38 - 2:44 | Cut to a two-card team panel (Stephen + Vinh). Day-12-of-12 indicator chip. | Stephen | "Stephen Sookra and Vinh Le. Kennesaw State University. Twelve days. Public from Day 1. Apache 2.0." |
| 2:44 - 2:50 | Audience-aggregate text reveal centered on cream paper. | Stephen | "The audience: adaptive racers, veteran-team drivers, and grassroots competitors. Adjacent operator engagement with MME Motorsport in Slovenia and adaptive-racing programmes in the United Kingdom." |

### Beat 8. Close (2:50 to 2:58, 8 s)

| Time | Visual | Narrator | What is said |
|------|--------|----------|--------------|
| 2:50 - 2:54 | Hero title returns. Both back on camera, paddock-direct, standing side by side. | Vinh | "APEX is a reference architecture for governed foundation-model deployment on safety-critical sensor data." |
| 2:54 - 2:58 | Wide shot of Stephen + Vinh + tagline overlay. URLs slide in at the bottom. Apache 2.0 badge next to the GitHub URL. | Stephen | "The race engineer for the drivers who do not have one." |

### End-card (2:58 to 3:00, 2 s)

Black frame. APEX wordmark in cream centered. Lower-third in IBM Plex Mono, 18px, cream-at-62%-opacity: `Thanks to MME Motorsport d.o.o. for the per-surface attribution permission grant (2026-05-22).` No audio. Hard cap at 3:00. This end-card line is the Q-008 reciprocity commitment per `docs/consent-log.md` section 1.

---

## Why the 2-person split lands harder than 1-person

1. **Two voices proves two-person team.** Judges read "2 people, 12 days, 14 IBM tools" off the screen. Hearing two voices closes the proof loop. Stephen on the product surface + Vinh on the engineering depth signals real division of labor.
2. **Vinh narrating Beat 4 + Beat 5 carries the technical credibility.** Stephen narrating the COA killshot would land as marketing; Vinh narrating it lands as engineering. Same words, different weight because the speaker built the projection layer.
3. **Stephen narrating Beat 3 (Sarah persona) + Beat 6 (live UI) keeps the product surface coherent.** The product is what Stephen built. He narrates over what he built.
4. **Both on camera Beats 1 + 8 frames the engineering pair without forcing a logo-style intro.** Pre-mortem decision row 14: avoid logo intros. Two engineers in cream-paper studio is the brand.

---

## Total time

2:58 (target 2:55, 3:00 hard cap). Trim Beat 4 by 3 seconds if Day 10 production take runs long: cut the "two jobs split between two models" line and let the visual carry it.

---

## Voice direction (delivery notes)

- **Pace target.** 150 words per minute. Slow + measured. Engineering-confident, not breathless.
- **Pauses.** 1 second after "she did not have one" (Beat 1). 1.5 seconds after "she did at Croft last month" (Beat 3). 0.5 seconds after each "we do not retrain it" / "model that matches their car" emphasis.
- **No em-dash.** No AI-tone blocklist words (leverage, seamless, robust, comprehensive, delve into, cutting-edge, streamline, ecosystem, easily, simply).
- **Paddock voice.** "two tenths off" not "plus zero point three four." "60 seconds" not "one minute." "fourteen" spelled out in writing, said as "fourteen" not "one-four."

---

## Camera + technical setup

- **Resolution.** 1920x1080 at 60 fps.
- **Aspect.** 16:9 native.
- **Audio.** -14 LUFS integrated loudness, peak -1 dBFS. Light de-essing + 80 Hz high-pass + -3 dB compressor. No reverb.
- **Music bed.** None Beats 1-3 or 8. Subtle synth pad under Beats 4-7 at -22 LUFS. Must not bleed over voiceover.
- **Color palette.** Cream `#F4EBD8` background where the live UI is on screen; deep racing green `#0A2818` borders; clay `#C1492C` accent on data callouts; amber `#D9A441` on the Guardian verdict stamp; ink `#0F1410` for body text.
- **Lower-third typography.** Fraunces (display) for headlines + Plex Mono for data callouts + Plex Sans for body.
- **Frame holds.** Every cut holds at least 600 ms before the next overlay enters.
- **Subtitles.** Burned-in white on black-shadow track for WCAG 2.1 AA Level AAA contrast.

---

## Production checklist (Day 10 + Day 11)

- [ ] Pre-record voiceover Day 10 morning. Stephen records his lines; Vinh records his lines; separate stems for clean overdub.
- [ ] Screen-record live demo Day 10 afternoon. Walk the Sarah canned fixture end-to-end. Capture all three corner cards + tuning delta + forecast envelope + Guardian verdict stamp.
- [ ] Day 11 dress rehearsal: full 3 minutes + 5-minute hostile Q&A drill.
- [ ] Day 11 final production take with VO overdub.
- [ ] Day 12 final cut + thumbnail + 30s highlight clip + YouTube unlisted upload.
- [ ] Day 12 AI-tone sweep on full transcript: zero em-dashes + zero blocklist words.

---

## 30-second highlight clip cut (saved as `deliverables/demo-video-30s.mp4`)

| Time | Source | Visual | Narrator | Audio |
|------|--------|--------|----------|-------|
| 0:00 - 0:05 | Beat 1 | Cream + tagline reveal | Stephen | "The race engineer for the drivers who don't have one." |
| 0:05 - 0:13 | Beat 3 (compressed) | Sarah debrief block | Stephen | "Sarah Reynolds. Lap 17 at Donington Park. Two tenths off her PB. Hand-controls in a BMW M240i." |
| 0:13 - 0:25 | Beat 5 (compressed) | Split COA + telemetry view | Vinh | "Three firsts. Pretrained time-series foundation model on motorsport telemetry. Integrated adaptive-controls workflow. COA-parameterized brake-throttle simultaneity gate. APEX reads the Certificate of Adaptations at the tensor level." |
| 0:25 - 0:30 | Beat 8 | Hero title + URL | Stephen | "Built on IBM Granite. apex-one-black.vercel.app." |

---

_Last updated 2026-05-27 evening Day 8 of 12 by Stephen (locked the 2-person split per Stephen-Vinh team-of-2 demo decision; Beats 4 + 5 + 7-first-half assigned to Vinh; Stephen retains product + persona + outputs + close)._
