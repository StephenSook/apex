# APEX 3-Minute Demo Video Script v3 (Stephen + Vinh 2-person, cm-devvit-style production)

> **Length cap.** 2:58 cap (target 2:55, hard 3:00). Per BeMyApp May Challenge submission rule.
> **First-60s discipline.** Per cm-devvit lesson (judges may stop watching), every load-bearing claim must land in the first 60 seconds. Beats 1-4 cover the architecture-grade content. Beats 5-8 add depth.
> **Production model.** Adapted from `github.com/StephenSook/context-mod-devvit/scripts/demo` + `docs/submission/demo-video-runbook.md`. Per-beat OBS clip + per-beat VO + ffmpeg stitch + captions baked. NO music. NO transitions. NO AI-generated b-roll. Real product screenshots from `https://apex-one-black.vercel.app`.
> **Owners.** Stephen Sookra (frontend / product / persona / positioning narration). Vinh Le (backend / physics / architecture narration). Both on camera Beats 1 + 8.
> **Cross-references.** `deliverables/demo-video-storyboard.md` for per-second visual framing (mirror the 8-beat shot list verbatim). `docs/demo-video-runbook-v3.md` for OBS scenes + Audacity workflow + ffmpeg stitch. `scripts/build-demo-video-stitch.sh` for the per-beat assembly automation.

---

## Voice rule (cm-devvit lesson: single-voice cadence per beat, NEVER cross-talk mid-beat)

Per cm-devvit demo-video-script.md observation: "60s primary cut is single-voice (Stephen) so the cadence stays consistent." APEX scales this to 3 min with TWO single-voice tracks, never overlapping:

- **Stephen records: Beats 1 + 2 + 3 + 6 + 7-second-half + 8** (product / persona / positioning).
- **Vinh records: Beat 4 + Beat 5 + Beat 7-first-half** (architecture / COA killshot / 14-tool stack).
- **Both on camera Beats 1 + 8** for cold-open + close (visual proof of two-person team).
- **Never simultaneous narration.** Each beat is one voice end-to-end.

Cm-devvit lesson: "Read each beat as a separate clip. Don't try to nail the whole thing in one take. Speak slower than feels natural ~2.5 words/second target." APEX adopts verbatim.

---

## Beat sheet (180.0s total)

### 0:00 - 0:08 Beat 1. Cold open (8 s)

**Scene.** Both Stephen + Vinh on camera, eye-level, cream background `#F4EBD8`, racing-green chevron strip across bottom. Stephen left, Vinh right.

**Stephen** (slow, paddock-direct): "There are racing drivers without a paid race engineer."

(1.0 s hold, both still on camera.)

**Vinh** (same pace): "APEX is for them."

**Visual overlay 0:03-0:08.** Fraunces italic lower-third fades in: *"The race engineer for the drivers who don't have one."*

**Cut.** Hold 1 second after Vinh's line. Hard cut to Beat 2.

---

### 0:08 - 0:25 Beat 2. Problem (17 s)

**Scene.** Hand-coded SVG racing line graphic on cream paper. Apex point annotated in clay red. Pull-back zoom across the 17 s.

**Stephen.** "A professional race engineer costs several hundred pounds a day."

(0:14 transition: FIA logo + 2017 timestamp fade in upper-left.)

**Stephen.** "Every Formula One driver has one. Most adaptive racers, veteran-team drivers, and grassroots competitors do not."

(0:20 transition: SVG crossfades to FIA Appendix L cover-page mockup; adaptive-equipment-homologation section highlighted.)

**Stephen.** "After the FIA regulatory revision in late 2017 lifted the single-seater ban on disabled drivers, the barrier stopped being regulatory. It became economic."

**Visual overlay.** Plex Mono callout at 0:08 in clay red: `several hundred £ / day`. Plex Sans body at 0:14: `Adaptive racers · veterans · grassroots`. Final overlay at 0:20: `2017 · FIA Appendix L revision`.

**Cut.** Hard cut to Beat 3.

---

### 0:25 - 0:42 Beat 3. Hero use case, Sarah moment (17 s)

**Scene.** BMW M240i Britcar illustration in racing green. Sarah-persona card slides in from right.

**Stephen.** "Britcar Trophy 2026. Lap 17 of 19 of qualifying at Donington Park."

(0:31 transition: hand-control diagram inset over the M240i; telemetry trace overlay across bottom.)

**Stephen.** "Sarah Reynolds is two tenths off her PB and the time is bleeding out in Sector 2 at Old Hairpin."

(0:37 transition: cut to her debrief text rendered in Fraunces italic on cream paper.)

**Stephen** (paddock voice, reading her debrief): "lost the rears mid Old Hairpin again, can't trail-brake on the lever the way she did at Croft last month."

**Visual overlay.** Upper-right driver card at 0:25 (name + circuit + lap). Plex Mono callout at 0:31 in clay red: `+0.34 s · Sector 2 · Old Hairpin`. Lower-third at 0:42 (1 s hold then exits): `Veteran. Left-leg amputee. Britcar Trophy 2026.`

**Persona disclaimer caption** (small Plex Mono, lower-right, sticky 0:25-0:42): `Fictional persona by design.`

**Cut.** Soft cut, hold 1 s after "Croft last month."

---

### 0:42 - 1:30 Beat 4. Architecture, PhysicsTTM three layers (48 s) · VINH

**Scene transition.** Cut to LangGraph orchestration graph screenshot, full screen, racing-green border.

**Vinh** (engineering-confident, measured): "APEX runs on IBM Granite, the same platform that ships to Scuderia Ferrari's fan app, pointed at the drivers who need a race engineer most."

(0:50 transition: animate three rectangular layer cards entering top-down. Layer 1 amber + Layer 2 clay + Layer 3 racing-green.)

**Vinh.** "Three layers. Layer one is a frozen Granite TimeSeries TTM r2.1 with a channel-mix decoder fine-tune per the D-010 Track 1 pivot. NeurIPS 2024 release. We aggregate raw fifty hertz telemetry to one hertz mini-sector tensors so the input sits inside the model's published support envelope."

(0:58 transition: physics projection card highlights; animated math: friction ellipse, bicycle model, forward-Euler kinematic step.)

**Vinh.** "Layer two is a differentiable Cvxpylayers physics projection at constant mu. Friction ellipse plus bicycle model plus forward-Euler kinematic step plus a circuit-conditional friction lookup. The wave-49 ship lit the V12 first-order 8-tier Pacejka residual trace plus the V13 three-iterate SCP outer-loop behind the DifferentiableProjector Protocol; jerk-bound enforcement is the remaining named swap-point in the D-031 staged ladder."

(1:08 transition: Guardian card highlights; animated text-log entries scroll past with check marks.)

**Vinh.** "Layer three is Granite Guardian 4.1 8B with custom rules auditing the structured text log of every projection correction. Granite 4.1 8B Instruct writes the coaching report in a race-engineer voice."

(1:18 transition: pull back to all three cards visible together. Two-job-split annotation arcs between TTM and Instruct sub-card.)

**Vinh.** "Two jobs split between two models. TTM forecasts the next-session pace envelope. Instruct turns the envelope plus the Certificate of Adaptations plus the debrief into a precision tuning recommendation. Aggregation done honestly."

**Visual overlays.** Layer-1 card text at 0:50: `Granite TimeSeries TTM r2.1 · NeurIPS 2024 · channel-mix decoder fine-tune per D-010 Track 1`. Plex Mono math sticker at 0:58: `ax² / μx² + ay² / μy² ≤ 1`. Guardian callout at 1:08: `Granite Guardian 4.1 8B · BYOC rules`. Final at 1:18: `TTM = envelope · Instruct = tuning delta`.

**Cut.** Hard cut to Beat 5.

---

### 1:30 - 2:00 Beat 5. Killer detail, COA-parameterized simultaneity gate (30 s) · VINH

**Scene.** Side-by-side split. Left: Sarah's synthetic COA hardware-specification section excerpt on cream paper (Section 3(c) describing MME Motorsport dual-stage trigger). Right: telemetry trace with brake + throttle overlaid simultaneously through Old Hairpin window.

**Vinh.** "Three structural moats. First application of a pretrained time-series foundation model to adaptive motorsport telemetry. First public AI race-engineer workflow we found that reads the FIA Certificate of Adaptations as a binding regulatory input. First COA-parameterized brake-throttle simultaneity gate."

(1:38 transition: Track Titan logo with red X overlays the right trace; APEX logo with green check appears next to it.)

**Vinh.** "Standard tools hard-code throttle times brake equals zero. But that is a real racing technique, left-foot braking, trail-braking. Sarah's hand controls are homologated to do it, and her Certificate of Adaptations records it."

(1:46 transition: zoom into hardware-spec text from Section 3(c) of synthetic COA. Highlight dual-stage trigger description. Cut back to telemetry trace with APEX permitted-region shading.)

**Vinh.** "The V1 NumPy validator reads coa_overlap_flag equals one from her Certificate of Adaptations and routes the constraint per-driver. When the hardware permits it, the projection recognises the input. We do not coach disabled drivers with the same model as everyone else. We coach them with the model that matches their car."

**Visual overlays.** Three sequential lower-third overlays at 1:30 in Fraunces italic, 1 s each, one per "First": *"First on adaptive telemetry"* / *"First COA as tensor input"* / *"First simultaneity gate."* Plex Mono callout at 1:38 in clay red: `throttle × brake = 0  ·  WRONG for COA-permitted drivers`. Final overlay at 1:46 in racing green: `COA at tensor level · feature, not bug`.

**Cut.** 800 ms zoom-in at 1:46 then 600 ms cross-fade to Beat 6.

---

### 2:00 - 2:30 Beat 6. What APEX returns (30 s) · STEPHEN

**Scene.** Live APEX `/analyze` UI capture. Corner-by-corner coaching report on screen. Three corner cards (Old Hairpin / McLeans / Coppice) visible.

**Stephen.** "Sixty seconds after Sarah uploads her telemetry, APEX returns a corner-by-corner coaching report,"

(2:08 transition: scroll UI down to tuning card. Highlight brake-lever-travel delta and COA section citation.)

**Stephen.** "a tuning recommendation, reduce hand-lever brake travel by four millimetres, citing the exact COA section,"

(2:16 transition: scroll further to next-session forecast chart. Show mean line + confidence band.)

**Stephen.** "a next-session lap-pace envelope forecast,"

(2:22 transition: scroll to Guardian audit panel. Highlight verdict stamp + reasoning trace items. Reproducibility footer enters from below.)

**Stephen.** "and a Granite Guardian safety stamp with the reasoning trace visible. Every claim cites a specific Certificate of Adaptations section and a specific FIA Appendix L provision. Provenance on every line."

**Visual overlays.** Plex Mono callout at 2:08: `38 mm → 34 mm · Section 3(c) hardware spec`. Subtitle at 2:16: `Forecast envelope · 30 mini-sectors`. Final overlay at 2:22 in racing green: `Verdict: APPROVED · audit-id sarah-langgraph-<ms>`. Reproducibility footer from below: `Granite Guardian 4.1 8B + commit SHA <head>`.

**Cut.** 600 ms hold on verdict stamp. Hard cut to Beat 7.

---

### 2:30 - 2:50 Beat 7. Stack + team + audience (20 s) · VINH (first 8 s) → STEPHEN (last 12 s)

**Scene.** 14-tool IBM Granite stack grid. Each cell a badge with model name + honesty-tier pill. Each tool highlights once (100 ms each) as Vinh names it.

**Vinh.** "Fourteen IBM Granite tools on a per-tool honesty ladder. Granite-Docling, Granite Vision, Granite TimeSeries TTM, Granite FlowState, IBM TSPulse, Granite Embedding R2, Granite Guardian, Granite Instruct 4.1 8B, Granite Instruct 4.1 3B chat-routing, Granite Speech 4.1 2B-Plus, Granite 4.0 Nano WebGPU edge, LangGraph plus Granite MCP Gateway plus ContextForge orchestration, Docling library and Mellea v0.5.0 as build-time accelerators."

(2:38 transition: cut to two-card team panel · Stephen + Vinh. Day-12-of-12 indicator chip.)

**Stephen.** "Stephen Sookra and Vinh Le. Kennesaw State University. Twelve days. Public from Day 1. Apache 2.0."

(2:44 transition: audience-aggregate text reveal centered on cream paper.)

**Stephen.** "The audience: adaptive racers, veteran-team drivers, and grassroots competitors. Adjacent operator engagement with MME Motorsport in Slovenia and adaptive-racing programmes in the United Kingdom."

**Visual overlays.** Stagger highlight on each tool 100 ms. Day-N chip at 2:38: `Day 12 of 12`. Three Fraunces italic lines at 2:44, top-aligned reveal.

**Cut.** Soft cross-fade to Beat 8.

---

### 2:50 - 2:58 Beat 8. Close (8 s) · VINH then STEPHEN

**Scene.** Hero title returns. Both back on camera, paddock-direct, standing side by side. Wide shot.

**Vinh.** "APEX is a reference architecture for governed foundation-model deployment on safety-critical sensor data."

(2:54 transition: wide shot of Stephen + Vinh + tagline overlay. URLs slide in at bottom. Apache 2.0 badge next to GitHub URL.)

**Stephen.** "The race engineer for the drivers who do not have one."

**Visual overlays.** Lower-third at 2:50 in Fraunces italic: *"IBM Consulting reference architecture for governed foundation-model deployment."* Final overlay at 2:54: `apex-one-black.vercel.app · github.com/StephenSook/apex · Apache 2.0`.

**Cut.** Hold 1.5 s on final frame. Fade to black.

---

### 2:58 - 3:00 End-card (2 s)

Black frame. APEX wordmark in cream centered. Lower-third in IBM Plex Mono, 18px, cream-at-62%-opacity:

> Thanks to MME Motorsport d.o.o. for the per-surface attribution permission grant (2026-05-22).

No audio. Hard cap at 3:00.

---

## Production observability B-roll (optional insert, visual-only, zero added runtime)

Wave-53 shipped a live production-observability cockpit on `/judges`: an OpenTelemetry span on every backend request exported to Honeycomb, mirrored in an embedded panel with real trace-waterfall deep-links. It is strong proof of production rigor (most hackathon backends ship none), so it earns a place in the visual track without spending a single second of the locked 180s budget.

**Rule.** Visual-only insert. It changes NO voiceover line and adds NO runtime. The 8-beat structure and the storyboard's verbatim shot list stay unchanged. If the Day 10 take runs long, this insert is cut first.

**Where it backs.** Beat 7 (2:30-2:50, stack + infra) is the natural home. While Vinh names the orchestration runtime, a 3 to 4 second picture-in-picture of the live `/judges` cockpit (throughput, p50/p95/p99, one trace row deep-linking into Honeycomb) plays lower-right, then exits. No VO references it; the visual carries it.

**Caption (Plex Mono, lower-third, optional).** `Live production telemetry · OpenTelemetry to Honeycomb · /judges`

**Extended-cut option.** If a longer non-BeMyApp cut is ever produced, a dedicated 6 to 8 second observability beat can sit between Beat 6 and Beat 7 with its own VO. Out of scope for the 180s submission cut.

---

## Total runtime

2:58 +/- 1 s. Trim Beat 4 by 3 s if Day 10 production take runs long: cut the "two jobs split between two models" line and let the visual carry it.

---

## Cm-devvit production carry-overs (Vinh already knows this workflow)

Per `github.com/StephenSook/context-mod-devvit/docs/submission/demo-video-runbook.md` + `scripts/demo/stitch.sh` + `captions-live-data.srt`:

**Tooling.**

| Tool | Purpose | Install |
|------|---------|---------|
| OBS Studio | Screen capture 1920x1080 30 fps h.264 hardware-accel (Apple VideoToolbox) | `brew install --cask obs` |
| Audacity | Voiceover record + edit | `brew install --cask audacity` |
| ffmpeg | Stitch + bake captions + final encode | `brew install ffmpeg` |
| DaVinci Resolve (optional) | Color match between takes if OBS scenes drift | `brew install --cask davinci-resolve` |

**OBS settings.** Same as cm-devvit. 1920x1080 base + output. 30 fps (NOT 60). MKV record (transcode to MP4 in ffmpeg; protects against crashes). Bitrate 12000 kbps. Keyframe interval 2. Disable desktop audio capture; we add VO in post.

**OBS scenes (3 scenes total).**

1. `Scene "Landing + Architecture"` · full-screen Chrome at `https://apex-one-black.vercel.app/` for Beat 2 + 3 + 4 architecture cards.
2. `Scene "Sarah debrief + COA"` · split-screen Chrome at `https://apex-one-black.vercel.app/analyze` with Sarah persona card surfaced, plus COA hardware-spec PDF for Beat 5.
3. `Scene "Demo outputs + Guardian"` · full-screen Chrome at `/analyze` UI with corner-by-corner coaching report visible, plus dashboard scroll for Beat 6.

Pre-position cursor before each scene begins recording.

**Per-beat recording sequence.**

| Beat | Time | Scene | Narrator | Files to produce |
|------|------|-------|----------|------------------|
| 1 Cold open | 0:00-0:08 | studio camera (cream backdrop) | Both | `raw-obs/cold-open.mkv` + `raw-vo/vo-cold-open.wav` |
| 2 Problem | 0:08-0:25 | Landing + Architecture | Stephen | `raw-obs/problem.mkv` + `raw-vo/vo-problem.wav` |
| 3 Sarah | 0:25-0:42 | Sarah debrief + COA | Stephen | `raw-obs/sarah.mkv` + `raw-vo/vo-sarah.wav` |
| 4 Architecture | 0:42-1:30 | Landing + Architecture | Vinh | `raw-obs/architecture.mkv` + `raw-vo/vo-architecture.wav` |
| 5 COA killshot | 1:30-2:00 | Sarah debrief + COA | Vinh | `raw-obs/coa.mkv` + `raw-vo/vo-coa.wav` |
| 6 Demo outputs | 2:00-2:30 | Demo outputs + Guardian | Stephen | `raw-obs/demo.mkv` + `raw-vo/vo-demo.wav` |
| 7a Stack | 2:30-2:38 | Landing + Architecture (`/ibm-stack` page) | Vinh | `raw-obs/stack.mkv` + `raw-vo/vo-stack.wav` |
| 7b Team + audience | 2:38-2:50 | studio camera + cream | Stephen | `raw-obs/team.mkv` + `raw-vo/vo-team.wav` |
| 8 Close | 2:50-2:58 | studio camera (Stephen + Vinh both) | Vinh + Stephen | `raw-obs/close.mkv` + `raw-vo/vo-close.wav` |

**Voiceover record (Audacity).** Same workflow as cm-devvit. 48 kHz mono. Filter Curve EQ Voice (Low Cut at 80 Hz). Compressor Soft Limiter Ratio 2:1 Threshold -18 dB. Normalize -1 dB peak. Export each beat as `vo-<beat>.wav` uncompressed PCM 48 kHz mono.

**Stitch (ffmpeg).** Single command: `bash scripts/build-demo-video-stitch.sh`. Reads from `raw-obs/<beat>.mkv` + `raw-vo/vo-<beat>.wav` + `deliverables/audio-raw/demo-video-captions.srt`. Writes `beats/final.mp4`. Captions baked via libass `subtitles=` filter (Fraunces or IBM Plex Mono if installed; defaults work fine).

---

## Voice direction (delivery notes for production take)

- **Pace.** ~150 words per minute. Slower than feels natural. Cm-devvit lesson: "Read **slower than feels natural** · the script is dense. ~2.5 words/sec target."
- **Tone.** Engineering-confident, not breathless. Not salesy. Cm-devvit: "Sound like you're telling a fellow dev about a project, not pitching a VC."
- **Captions vs VO.** Don't read captions verbatim. Captions = key claims. VO = paraphrase + transitions. Cm-devvit lesson verbatim.
- **AI-tone blocklist.** No "leverage" / "seamless" / "robust" / "comprehensive" / "delve into" / "cutting-edge" / "streamline" / "ecosystem" / "easily" / "simply" / "amazing" / "revolutionary" / "powerful" / "sophisticated."
- **Pauses.** 1.0 s after "she did not have one" (Beat 1). 1.5 s after "she did at Croft last month" (Beat 3 reading her debrief). 0.5 s after each "we do not retrain it" / "model that matches their car" emphasis.
- **Paddock voice.** "two tenths off" not "plus zero point three four." "sixty seconds" not "one minute." Fourteen spelled out as "fourteen" not "one-four."
- **Re-record check.** If delivery exceeds 165 wpm OR captures any blocklist word OR adds an em-dash inflection, re-record that beat. Cm-devvit lesson: separate-clip-per-beat = re-record cost is one beat, not the whole video.

---

## Cm-devvit production carry-overs (what DOES NOT happen)

Per `demo-video-storyboard.md` cuts-that-do-not-happen + cm-devvit demo-video-script.md:

- **No music swell into the close.** Engineering-confident tone is the brand voice. Music swells read as TED-talk pastiche.
- **No drone shots / generic motorsport b-roll.** Stock footage signals "didn't have the real thing." If we cannot shoot it ourselves with permission, use illustrations.
- **No quick-cut montage.** Each beat holds at least 600 ms after overlay enters. Galaxy-tier coherence beats motion-graphics velocity.
- **No "Visit our website" CTA.** Final overlay shows URL once. Voiceover does not say "go to" or "visit." Anti-AI-tone discipline.
- **No emoji anywhere in burned-in subtitles.** Editorial-paddock palette has no place for emoji.
- **No AI-generated b-roll.** Real screenshots from the production deploy `https://apex-one-black.vercel.app` only.
- **No transitions** (cuts only). Saves time + reads more like a real demo than a marketing reel.
- **No music** OR a single subtle bed at low volume. Don't compete with VO.

---

## 30-second highlight clip cut (Day 10 second deliverable)

For judges who watch only the first 30 s of a submission, the highlight cut compresses Beats 1 + 3 + 5 + 8 into 30 s. Saved as `deliverables/demo-video-30s.mp4`.

| Time | Source | Visual | Narrator | Audio |
|------|--------|--------|----------|-------|
| 0:00-0:05 | Beat 1 | Cream + tagline reveal | Stephen | "The race engineer for the drivers who don't have one." |
| 0:05-0:13 | Beat 3 compressed | Sarah debrief block | Stephen | "Sarah Reynolds. Lap 17 at Donington Park. Two tenths off her PB. Hand-controls in a BMW M240i." |
| 0:13-0:25 | Beat 5 compressed | Split COA + telemetry view | Vinh | "Three firsts. Pretrained time-series foundation model on motorsport telemetry. Integrated adaptive-controls workflow. COA-parameterized brake-throttle simultaneity gate. APEX reads the Certificate of Adaptations at the tensor level." |
| 0:25-0:30 | Beat 8 | Hero title + URL | Stephen | "Built on IBM Granite. apex-one-black.vercel.app." |

---

## Day 10 production checklist (final pass before lock)

- [ ] All 8 beats recorded at 1920x1080 30 fps.
- [ ] Voiceover overdub re-recorded if delivery pace exceeds 165 wpm (target 150 wpm).
- [ ] Lower-third overlays match Fraunces + Plex Mono + Plex Sans hierarchy.
- [ ] Color palette holds across all beats (no stock-blue, no generic gradient).
- [ ] Final cut runs 2:58 +/- 1 s. Hard cap 3:00.
- [ ] Burned-in subtitles match VO transcript word-for-word (replace pre-baked SRT with post-record transcription per `deliverables/audio-raw/demo-video-captions.srt` swap pattern).
- [ ] AI-tone sweep on full transcript: zero em-dashes + zero blocklist words.
- [ ] 30-second highlight clip exported as `deliverables/demo-video-30s.mp4`.
- [ ] Backup pre-recorded full video exported as `deliverables/demo-video-backup.mp4` (pre-mortem row 17).
- [ ] Thumbnail rendered at 1280x720 (`deliverables/thumbnail.png`), no auto-play burn-in.
- [ ] YouTube unlisted upload (full 3-min + 30-sec highlight clip).
- [ ] BeMyApp form pastes the unlisted YouTube URL.

---

## Why the cm-devvit-style production lands harder for APEX

1. **Per-beat clip discipline = re-record cost is one beat.** Cm-devvit's "read each beat as a separate clip" pattern means a flubbed line in Beat 4 only requires re-recording 48 seconds, not the whole 3 minutes. For a 2-person shoot this matters more (every coordinated double-take wastes both people's time).
2. **Hard cuts + real screenshots = "we shipped it" signal.** Marketing-reel transitions train judges to expect marketing-grade product. Cm-devvit's demo-style cuts trained Reddit hackathon judges that the demo IS the product. Same instinct lands at IBM SkillsBuild.
3. **Captions baked = judges watch muted.** Cm-devvit lesson verbatim. BeMyApp judges scanning 100+ submissions on phone speakers benefit from baked-in captions matching the editorial-paddock palette.
4. **No music = engineering-confident.** Cm-devvit ran no music and still landed. APEX adopts. Music would compete with VO + signal marketing-reel posture.
5. **Two-person voice split = proof of two-person team.** Judges read "Stephen + Vinh, 12 days, 14 IBM tools" off the page. Hearing two voices closes the proof loop. Vinh narrating the COA killshot (Beat 5) carries technical credibility because HE BUILT the physics projector.

---

_Last updated 2026-05-27 evening Day 8 of 12 by Stephen. v3 supersedes v0 single-narrator + v2 2-person draft. Production tooling adapted from cm-devvit `docs/submission/demo-video-runbook.md` + `scripts/demo/stitch.sh` per the same-workflow-Vinh-knows directive._
