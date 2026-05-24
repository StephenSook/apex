# APEX - 3-minute demo video storyboard (production take Day 10)

> Per-second shot list for the 3-minute submission video. Mirrors the 8-beat script in `docs/3-min-pitch-script.md` exactly; this doc adds visual framing, on-screen overlay text, audio bed, and cut style for every shot.
>
> **Length cap:** 2:58. Trim Beat 8 by 3s if Day 10 production take runs long. Pre-mortem mitigation row 17 (demo Wi-Fi fail) keeps the 30-second highlight clip and a fully pre-recorded backup ready.
>
> **Owner:** Stephen Sookra (on-camera + screen capture + voiceover). Day 10 production take. Day 11 cut + thumbnail + 30s highlight clip + AI-tone sweep on transcript.

---

## Production parameters (set before first take)

- **Resolution:** 1920x1080 at 60 fps (judges may pause; sharp frames matter).
- **Aspect:** 16:9 native (BeMyApp + YouTube + Devpost cross-post).
- **Audio:** -14 LUFS integrated loudness, peak -1 dBFS, mono voiceover overdubbed on stereo bed.
- **Voice processing:** light de-essing + 80 Hz high-pass + -3 dB compressor. No reverb.
- **Music bed:** none in Beats 1-3 or 8. Subtle synth pad (sub-mix at -22 LUFS) under Beats 4-7. Bed must not bleed over voiceover; check on phone speakers before lock.
- **Color:** cream `#F4EBD8` paper background where the live UI is on screen; deep racing green `#0A2818` borders; clay `#C1492C` accent on data callouts; amber `#D9A441` on the Guardian verdict stamp; ink `#0F1410` for body text.
- **Lower-third typography:** Fraunces (display) for headlines, IBM Plex Mono for data callouts, IBM Plex Sans for body. Matches the editorial-paddock identity locked in CLAUDE.md.
- **Frame holds:** every cut holds at least 600 ms before the next overlay enters. No fast cuts.
- **Subtitles:** burned-in white on black-shadow track for accessibility (WCAG 2.1 AA Level AAA contrast).

---

## Beat-by-beat shot list

### Beat 1 - Hook (0:00 to 0:08, 8 s)

| Time | Visual | Audio (VO) | On-screen overlay | Cut |
|------|--------|-----------|-------------------|-----|
| 0:00 - 0:03 | Stephen on camera, paddock-direct, eye-level, no zoom. Cream background, racing-green chevron strip across the bottom. | (slow) "There are racing drivers without a paid race engineer." | None. Audio carries it. | Cold open, no transition |
| 0:03 - 0:08 | Stephen on camera. Subtle staggered reveal: project tagline appears as a Fraunces italic overlay. | "APEX is for them." | Overlay (lower-third): *"The race engineer for the drivers who don't have one."* | 800 ms cross-fade |

### Beat 2 - Problem (0:08 to 0:25, 17 s)

| Time | Visual | Audio (VO) | On-screen overlay | Cut |
|------|--------|-----------|-------------------|-----|
| 0:08 - 0:14 | Cut to hand-coded SVG racing line graphic on cream paper. Apex point annotated in clay red. | "A professional race engineer costs four to five hundred pounds a day." | Plex Mono callout: `£400-500 / day` (clay red) | Hard cut |
| 0:14 - 0:20 | Pull-back zoom on the racing line; FIA logo + 2017 timestamp fade in upper-left. | "Every Formula One driver has one. Most adaptive racers, veteran-team drivers, and grassroots competitors do not." | Plex Sans body: `Adaptive racers - veterans - grassroots` | None (continuous zoom) |
| 0:20 - 0:25 | SVG racing line crossfades to a static FIA Appendix L cover-page mockup with the adaptive-equipment-homologation section highlighted. | "After the FIA regulatory revision in late 2017 lifted the single-seater ban on disabled drivers, the barrier stopped being regulatory. It became economic." | Overlay: `2017 - FIA Appendix L revision` (specific revision date verified at camera-ready against the live Appendix L PDF) | 400 ms cross-fade |

### Beat 3 - Hero use case, Sarah moment (0:25 to 0:42, 17 s)

| Time | Visual | Audio (VO) | On-screen overlay | Cut |
|------|--------|-----------|-------------------|-----|
| 0:25 - 0:31 | Cut to BMW M240i Britcar illustration in racing green. Sarah-persona-card slides in from the right. | "Britcar Trophy 2026. Lap 17 of 19 of qualifying at Donington Park." | Overlay (upper-right card): driver name + circuit + lap, Fraunces italic for the lap number | 600 ms slide |
| 0:31 - 0:37 | Hand-control diagram inset over the M240i illustration. Telemetry trace overlay across the bottom. | "Sarah Reynolds is two tenths off her PB and the time is bleeding out in Sector 2 at Old Hairpin." | Plex Mono callout: `+0.34 s - Sector 2 - Old Hairpin` (clay red) | Inset reveal, no cross-fade |
| 0:37 - 0:42 | Cut to Sarah's debrief text rendered in Fraunces italic on cream paper. Paragraph block, line wrap natural. | (paddock voice, reading her debrief) "lost the rears mid Old Hairpin again, can't trail-brake on the lever the way she did at Croft last month." | None during read. After read, lower-third: `Veteran. Left-leg amputee. Britcar Trophy 2026.` (1 s hold then exits) | Soft cut, hold 1 s after "Croft last month" |

### Beat 4 - The architecture, PhysicsTTM 3 layers (0:42 to 1:30, 48 s)

| Time | Visual | Audio (VO) | On-screen overlay | Cut |
|------|--------|-----------|-------------------|-----|
| 0:42 - 0:50 | Cut to Langflow orchestration graph screenshot, full screen, racing-green border. | "APEX is the same IBM Granite stack IBM ships to Scuderia Ferrari's roughly 400 million fans, pointed at the drivers who need a race engineer most." | Overlay: `IBM Granite stack - same as Scuderia Ferrari precedent` | Hard cut |
| 0:50 - 0:58 | Animate three rectangular layer cards entering top-down: TTM (amber), Physics projection (clay), Guardian (racing green). | "Three layers. Layer one is a frozen Granite TimeSeries TTM, IBM's pretrained foundation model from NeurIPS 2024. We do not retrain it." | Layer 1 card: `Granite TimeSeries TTM r2.1 - NeurIPS 2024 - frozen` | Staggered reveal, 200 ms per card |
| 0:58 - 1:08 | Physics projection card highlights. Animated math: friction ellipse, bicycle model, forward-Euler kinematic step. | "Layer two is a differentiable physics projection that enforces the friction ellipse, the bicycle model, and a forward-Euler kinematic step on every forecast step." | Plex Mono math sticker: `ax^2 / mu_x^2 + ay^2 / mu_y^2 <= 1` | Highlight overlay only |
| 1:08 - 1:18 | Guardian card highlights. Animated text-log entries scroll past with check marks. | "Layer three is Granite Guardian with custom rules auditing the structured text log of every projection correction. Granite 4.1 8B Instruct writes the coaching report in a race-engineer voice." | Plex Mono callout: `Granite Guardian 4.1 8B - BYOC rules` | Highlight overlay only |
| 1:18 - 1:30 | Pull back to the three cards visible together. Two-job split annotation arcs between TTM card and Instruct sub-card. | "Two jobs split between two models: TTM forecasts the next-session pace envelope; Instruct turns the envelope plus the COA plus the debrief into a precision tuning recommendation. Aggregation done honestly." | Overlay: `TTM = envelope - Instruct = tuning delta` | None (continuous on the three-card view) |

### Beat 5 - The killer detail, COA simultaneity (1:30 to 2:00, 30 s)

| Time | Visual | Audio (VO) | On-screen overlay | Cut |
|------|--------|-----------|-------------------|-----|
| 1:30 - 1:38 | Side-by-side split. Left: Sarah's synthetic COA hardware-specification section excerpt on cream paper (Section 3(c) describing the MME Motorsport dual-stage trigger hardware). Right: telemetry trace with brake + throttle traces overlaid simultaneously through the Old Hairpin window. | "Three firsts. First pretrained time-series foundation model on motorsport telemetry. First integrated workflow for adaptive hand-controls. First COA-parameterized brake-throttle simultaneity gate." | Three sequential lower-third overlays, one per "First", 1 s each, in Fraunces italic | Hard split-cut |
| 1:38 - 1:46 | Same split view. Track Titan logo (red X) appears overlaid on the right trace; APEX logo (green check) appears next to it. | "Standard tools assume able-bodied physics. They encode throttle times brake equals zero. Sarah's hand-control system explicitly supports simultaneous brake and throttle inputs mid-corner. Her COA permits it." | Plex Mono callout: `throttle * brake = 0  -  WRONG for COA-permitted drivers` (clay red) | None (overlays only) |
| 1:46 - 2:00 | Zoom into the hardware-spec text from Section 3(c) of her synthetic COA. Highlight the dual-stage trigger description. Cut back to telemetry trace with APEX permitted-region shading. | "So when a tool like Track Titan sees her telemetry, it flags her technique as driver error. APEX parses her Certificate of Adaptations, derives the simultaneity flag from her approved hand-control hardware specifications, and feeds it to the model at the tensor level. When the hardware permits it, our Stage 2 feasibility filter recognises the input. We do not coach disabled drivers with the same model as everyone else. We coach them with the model that matches their car." | Final overlay: `COA at tensor level - feature, not bug` (racing green) | 800 ms zoom-in, then 600 ms cross-fade |

### Beat 6 - What APEX returns (2:00 to 2:30, 30 s)

| Time | Visual | Audio (VO) | On-screen overlay | Cut |
|------|--------|-----------|-------------------|-----|
| 2:00 - 2:08 | Cut to live APEX `/analyze` UI. Corner-by-corner coaching report on screen. Three corner cards (Old Hairpin / McLeans / Coppice) visible. | "Sixty seconds after Sarah uploads her telemetry, APEX returns: a corner-by-corner coaching report," | None. The UI carries it. | Hard cut to live UI |
| 2:08 - 2:16 | Scroll the UI down to the tuning card. Highlight the brake-lever-travel delta and the COA section citation. | "a tuning recommendation reduce hand-lever brake travel by four millimetres citing the exact COA section," | Plex Mono callout: `38 mm -> 34 mm - Section 3(c) hardware spec` | Animated scroll |
| 2:16 - 2:22 | Scroll further to the next-session forecast chart. Show the mean line + confidence band. | "a next-session lap-pace envelope forecast," | Overlay: `Forecast envelope - 24 mini-sectors` | Continuous scroll |
| 2:22 - 2:30 | Scroll to the Guardian audit panel. Highlight the verdict stamp + reasoning trace items. Reproducibility footer enters from below. | "and a Granite Guardian safety stamp with the reasoning trace visible. Every claim cites a specific COA section and a specific FIA Article. Provenance is on every line." | Final overlay: `Verdict: APPROVED - audit-demo-20260521-001` (racing green) + provenance footer | 600 ms hold on the verdict stamp |

> **Fallback if Gate G6 slips (decided Day 9 dress rehearsal):** replace this beat's live UI with hand-styled static screenshots of the SAME corner-by-corner cards. Narration is identical. Pre-mortem row 17 mitigation.

### Beat 7 - Stack + team + status (2:30 to 2:50, 20 s)

| Time | Visual | Audio (VO) | On-screen overlay | Cut |
|------|--------|-----------|-------------------|-----|
| 2:30 - 2:38 | Cut to the eight-tool IBM Granite stack grid, 4x2 layout, each cell a badge with the model name + role. | "Eight IBM Granite tools. All load-bearing. Granite-Docling, Granite Vision, Granite TimeSeries TTM, Granite 4.1 8B Instruct, Granite Guardian, Langflow, Docling library, IBM Bob as the build accelerator per the Scuderia Ferrari precedent." | Each tool badge highlights once (200 ms each) as it is named | Stagger highlight |
| 2:38 - 2:44 | Cut to a two-card team panel (Stephen + Vinh) + a Day-N-of-12 indicator chip in the corner. | "Stephen Sookra and Vinh Le. Kennesaw State University. Twelve days. Public from Day 1." | Day-N chip: `Day 12 of 12` (final-cut day-of-recording) | Hard cut |
| 2:44 - 2:50 | Audience-aggregate text reveal centered on cream paper. | "The audience: adaptive racers, veteran-team drivers, and grassroots competitors across UK, US, and EU championship programmes." | Three Fraunces italic lines, top-aligned reveal | Soft cross-fade |

### Beat 8 - Close (2:50 to 2:58, 8 s)

| Time | Visual | Audio (VO) | On-screen overlay | Cut |
|------|--------|-----------|-------------------|-----|
| 2:50 - 2:54 | Hero title returns. Stephen back on camera, paddock-direct. | "APEX is the IBM Consulting reference architecture for governed foundation-model deployment on safety-critical sensor data." | Lower-third (Fraunces italic): `IBM Consulting reference architecture` | 400 ms cross-fade from Beat 7 |
| 2:54 - 2:58 | Wide shot of Stephen + tagline overlay. URLs slide in at the bottom. Apache 2.0 badge sits next to the GitHub URL. | "The race engineer for the drivers who do not have one." | Final overlay: `apex-one-black.vercel.app - github.com/StephenSook/apex - Apache 2.0` | Hold 1.5 s on final frame, then fade to black |

---

## End-card (2:58 to 3:00, 2 s)

Black frame. APEX wordmark in cream centered. No audio. Hard cap at 3:00.

---

## Cuts that DO NOT happen in this video (intentional choices)

- **No music swell into the close.** Pre-mortem decision row 22: the engineering-confident tone is the brand voice. Music swells read as TED-talk pastiche. Avoid.
- **No drone shots / generic motorsport b-roll.** Pre-mortem row 23: stock footage signals "didn't have the real thing." If we cannot shoot it ourselves with permission, we use illustrations.
- **No quick-cut montage.** Each beat holds at least 600 ms after overlay enter. Galaxy-tier coherence beats motion-graphics velocity.
- **No "Visit our website" CTA.** The final overlay shows the URL once; voiceover does not say "go to" or "visit." Anti-AI-tone discipline.
- **No emoji anywhere in burned-in subtitles.** Editorial-paddock palette has no place for emoji.

---

## 30-second highlight clip cut (Day 10 second deliverable)

For judges who watch only the first 30 s of a submission, the highlight cut compresses Beats 1 + 3 + 5 + 8 into 30 s:

| Time | Source | Visual | Audio |
|------|--------|--------|-------|
| 0:00 - 0:05 | Beat 1 | Cream + tagline reveal | "The race engineer for the drivers who don't have one." |
| 0:05 - 0:13 | Beat 3 (compressed) | Sarah debrief block | "Sarah Reynolds. Lap 17 at Donington Park. Two tenths off her PB. Hand-controls in a BMW M240i." |
| 0:13 - 0:25 | Beat 5 (compressed) | Split COA + telemetry view | "Three firsts. Pretrained time-series foundation model on motorsport telemetry. Integrated adaptive-controls workflow. COA-parameterized brake-throttle simultaneity gate. APEX reads the Certificate of Adaptations at the tensor level." |
| 0:25 - 0:30 | Beat 8 | Hero title + URL | "Built on IBM Granite. apex-one-black.vercel.app." |

Saved as `deliverables/demo-video-30s.mp4`.

---

## Day 10 production checklist (final pass before lock)

- [ ] All 8 beats recorded at 1920x1080 at 60 fps.
- [ ] Voiceover overdub re-recorded if delivery pace exceeds 165 words / minute (target 150 wpm).
- [ ] Lower-third overlays match Fraunces + Plex Mono + Plex Sans hierarchy.
- [ ] Color palette holds across all beats (no stock-blue, no generic gradient).
- [ ] Final cut runs 2:58 +/- 1 s. Hard cap 3:00.
- [ ] Burned-in subtitles match VO transcript word-for-word.
- [ ] AI-tone sweep on full transcript: zero em-dashes + zero blocklist words.
- [ ] 30-second highlight clip exported as `deliverables/demo-video-30s.mp4`.
- [ ] Backup pre-recorded full video exported as `deliverables/demo-video-backup.mp4` (pre-mortem row 17).
- [ ] Thumbnail (`deliverables/thumbnail.png`) rendered at 1280x720, no auto-play burn-in.

---

_Last updated: 2026-05-21 evening by Stephen (Day 2 storyboard scaffold, full per-second shot list locked alongside the pitch script). Day 9 dress-rehearsal refinement + Day 10 production take refinement to follow._
