# APEX Demo Video Production Runbook v3

> Bridges `docs/3-min-pitch-script-2-person-v3.md` → recording. Stephen + Vinh both narrate per the voice split. 2:58 cap (target 2:55, hard 3:00) per BeMyApp May Challenge rule.
>
> **Adapted from** `github.com/StephenSook/context-mod-devvit/docs/submission/demo-video-runbook.md` (Reddit Mod Tools Hackathon 2026 production approach Stephen + Vinh already know). Same OBS + Audacity + ffmpeg toolchain. Same per-beat clip discipline. Same captions-baked-in workflow. Adapted: editorial-paddock palette + Fraunces + Plex (vs cm-devvit's dark + Geist Mono), 3-minute target (vs cm-devvit's 60-sec cap), 2-person split (vs cm-devvit's primary-single-voice).

## Tooling (all macOS)

| Tool | Purpose | Install |
|------|---------|---------|
| OBS Studio | Screen capture 1920x1080 @ 30 fps | `brew install --cask obs` |
| Audacity | Voiceover record + edit | `brew install --cask audacity` |
| ffmpeg | Stitch + bake captions + final encode | `brew install ffmpeg` |
| DaVinci Resolve (optional) | Color match between takes if OBS scenes drift | `brew install --cask davinci-resolve` |

## OBS settings

Settings → Output → Recording:

- Format: `mkv` (record to mkv; transcode to mp4 in ffmpeg · protects against crashes)
- Encoder: `Apple VideoToolbox H264` (hardware-accelerated on Apple Silicon)
- Bitrate: `12000 kbps`
- Keyframe interval: `2`
- Audio bitrate: `192 kbps` (we re-record VO separately so this is just ambient)

Settings → Video:

- Base canvas: `1920x1080`
- Output: `1920x1080`
- FPS: `30` (NOT 60 · 30 fps reads more like a screen tutorial than a marketing reel; cm-devvit lesson verbatim)

Settings → Audio:

- Disable desktop audio capture (cleaner mix; we add VO in post)
- Mic source: built-in or USB mic; gate noise via Filters → Noise Suppression (RNNoise)

## OBS scenes (3 scenes total)

Per `3-min-pitch-script-2-person-v3.md` Beat-by-beat:

1. **Scene "Studio camera"** · both Stephen + Vinh on cream backdrop. Used for Beats 1 + 7b + 8.
2. **Scene "Landing + Architecture"** · full-screen Chrome at `https://apex-one-black.vercel.app/` then `/judges` for Beats 2 + 4 + 7a.
3. **Scene "Sarah debrief + COA"** · split-screen Chrome at `/analyze` with Sarah persona card + COA hardware-spec PDF for Beats 3 + 5.
4. **Scene "Demo outputs + Guardian"** · full-screen Chrome at `/analyze` UI with corner-by-corner coaching report + dashboard scroll for Beat 6.

Pre-position the cursor before each scene begins recording. Cm-devvit lesson: "Pre-roll OBS so the cursor is already on the right element when each beat starts. Saves seconds of where-do-I-click footage."

## Recording sequence

Matches `3-min-pitch-script-2-person-v3.md` beat sheet:

| Beat | Time | Scene | Narrator | What to capture |
|------|------|-------|----------|-----------------|
| 1 Cold open | 0:00-0:08 | Studio | Stephen + Vinh | Both on camera, eye-level, cream background, racing-green chevron strip across bottom |
| 2 Problem | 0:08-0:25 | Landing | Stephen | SVG racing line on cream paper + apex point clay-red annotation + FIA logo + Appendix L mockup |
| 3 Sarah moment | 0:25-0:42 | Sarah + COA | Stephen | BMW M240i illustration + Sarah persona card slide-in + hand-control diagram inset + debrief Fraunces-italic block |
| 4 Architecture | 0:42-1:30 | Landing | Vinh | LangGraph orchestration graph + 3 layer cards entering top-down + friction-ellipse math sticker + Guardian text-log scroll |
| 5 COA killshot | 1:30-2:00 | Sarah + COA | Vinh | Side-by-side COA hardware-spec + brake/throttle telemetry trace + Track Titan red-X overlay + APEX green-check + Section 3(c) zoom + permitted-region shading |
| 6 Demo outputs | 2:00-2:30 | Demo + Guardian | Stephen | Live `/analyze` UI scroll through corner cards + tuning card + forecast chart + Guardian verdict stamp + provenance footer |
| 7a Stack | 2:30-2:38 | Landing | Vinh | 14-tool IBM Granite stack grid (use `/ibm-stack` page) with per-tool honesty-tier pill highlight stagger |
| 7b Team + audience | 2:38-2:50 | Studio | Stephen | Two-card team panel (Stephen + Vinh) + Day-12-of-12 indicator chip + audience-aggregate text reveal |
| 8 Close | 2:50-2:58 | Studio | Vinh + Stephen | Hero title returns + Stephen + Vinh both back on camera side by side + tagline overlay + URLs slide-in + Apache 2.0 badge |

## Voiceover record (Audacity)

1. New project at 48 kHz, mono channel.
2. Read each beat as a separate clip. Don't try to nail the whole 3 minutes in one take.
3. Speak slower than feels natural · ~2.5 words/second target (~150 wpm). The script is dense.
4. After all clips recorded:
   - Apply **Effect → Filter Curve EQ → Voice (Low Cut at 80 Hz)**
   - Apply **Effect → Compressor → Soft Limiter** (Ratio 2:1, Threshold -18 dB)
   - Apply **Effect → Normalize → -1.0 dB peak**
5. Export each beat as `raw-vo/vo-<beat>.wav` (uncompressed PCM 48 kHz mono).

Stephen records: cold-open / problem / sarah / demo / team / close.
Vinh records: cold-open (his line) / architecture / coa / stack / close (his line).

Beats 1 + 8 produce TWO VO files each: one Stephen, one Vinh. The stitch script concatenates them in order.

## Stitch (ffmpeg)

```bash
# From repo root:
bash scripts/build-demo-video-stitch.sh
```

Reads from:
- `raw-obs/{cold-open,problem,sarah,architecture,coa,demo,stack,team,close}.mkv`
- `raw-vo/vo-{cold-open,problem,sarah,architecture,coa,demo,stack,team,close}.wav` (Beats 1 + 8 produce TWO files each, suffixed `-stephen.wav` / `-vinh.wav`)
- `deliverables/audio-raw/demo-video-captions.srt`

Writes:
- `beats/<beat>.mp4` per-beat trimmed + scaled to 1920x1080 30 fps
- `beats/concat-raw.mp4` concatenated raw
- `beats/final.mp4` captions baked

Output is YouTube-ready. Upload as unlisted. Paste URL into BeMyApp form.

## Caption SRT pre-bake + post-record swap

Pre-baked SRT at `deliverables/audio-raw/demo-video-captions.srt`. 8 cue blocks matching beat boundaries.

Per cm-devvit `captions.notes.md` lesson: **pre-baked text is APPROXIMATE · swap after recording**. Stephen + Vinh's actual VO will paraphrase ~10-30%. After recording:

1. Open `demo-video-captions.srt` in any text editor
2. Play the recorded VO mp3/wav alongside
3. Replace each cue's text with what was actually said
4. Keep timestamps as-is unless a beat overruns its boundary (then nudge by ≤200 ms)
5. Save + re-run `bash scripts/build-demo-video-stitch.sh`

## Font

`subtitles=` ffmpeg filter respects libass styling. Default font may render as Times-style. To force IBM Plex Mono (project font):

```bash
ffmpeg -i input.mp4 \
  -vf "subtitles=demo-video-captions.srt:force_style='FontName=IBM Plex Mono,FontSize=22,PrimaryColour=&H100F14,Outline=1.5,Shadow=0.5,BackColour=&HF4EBD8,BorderStyle=4'" \
  -c:a copy output.mp4
```

IBM Plex Mono must be installed system-wide for libass to find it. Verify with `fc-list | grep -i "plex mono"` (after `brew install fontconfig` if needed).

Color codes: `PrimaryColour=&H100F14` = ink `#0F1410`. `BackColour=&HF4EBD8` = cream `#F4EBD8` background per editorial-paddock palette.

## Recording window

| Day | Date | Activity |
|-----|------|----------|
| 9 | 2026-05-28 | OBS scene setup + dress rehearsal (full take but discard; pace check; mic level check) |
| 10 | 2026-05-29 | Per-beat OBS captures (Scenes 1-4) + per-beat Audacity VO records |
| 11 | 2026-05-30 morning | First production-quality take + post-record caption SRT swap + ffmpeg stitch + cut 30-sec highlight |
| 11 | 2026-05-30 afternoon | AI-tone sweep on transcript + thumbnail render at 1280x720 |
| 11 | 2026-05-30 evening | YouTube unlisted upload (full + 30-sec) + paste URL into BeMyApp form draft |
| 12 | 2026-05-31 | Final BeMyApp form submission + multi-track checkbox tick + retrospective |

## Pre-record rehearsal checklist (Stephen + Vinh, run T-3 → T-1 = Day 9 evening)

1. Production Vercel deploy at `https://apex-one-black.vercel.app` responds on all 20 API routes (zero 5xx) and returns 200 on every public page; 6 audio MP3 assets present
2. `/analyze` flow walks end-to-end with Sarah canned fixture without errors
3. `/judges` page renders Q&A defense pack including PitWall counter-position card 6
4. `/ibm-stack` page renders 14-tool grid with honesty-tier pills
5. OBS preset: 1920x1080 capture, 30 fps, h.264 hardware-accel via Apple VideoToolbox
6. Audacity input gain checked (-12 dBFS peaks during normal speech; will normalize to -1 dB later)
7. IBM Plex Mono installed system-wide (`fc-list | grep -i "plex mono"` returns non-empty)
8. ffmpeg available: `which ffmpeg` returns `/opt/homebrew/bin/ffmpeg` or `/usr/local/bin/ffmpeg`
9. `raw-obs/` + `raw-vo/` + `beats/` directories exist at repo root (create if missing)
10. Studio backdrop sourced (cream-paper backdrop OR cream wall + soft light)
11. Camera positioned at eye-level for two-person studio shots (Beats 1 + 8). Stephen left, Vinh right.

## What does NOT happen in production (cm-devvit lessons + editorial-paddock identity carry-over)

- **No music swell into the close.** Engineering-confident tone is the brand voice. Music swells read as TED-talk pastiche.
- **No drone shots / generic motorsport b-roll.** Stock footage signals "didn't have the real thing." Use real production-deploy screenshots + illustrations only.
- **No quick-cut montage.** Each beat holds at least 600 ms after overlay enters. Galaxy-tier coherence beats motion-graphics velocity.
- **No "Visit our website" CTA.** Final overlay shows URL once. Voiceover does not say "go to" or "visit." Anti-AI-tone discipline.
- **No emoji anywhere in burned-in subtitles.** Editorial-paddock palette has no place for emoji.
- **No AI-generated b-roll.** Real screenshots from production deploy only.
- **No transitions** (cuts only). Saves time + reads more like a real demo than a marketing reel.
- **No music** OR a single subtle bed at low volume. Don't compete with VO.
- **Don't read captions verbatim.** Captions = key claims. VO = paraphrase + transitions.

## Cross-references

- `docs/3-min-pitch-script-2-person-v3.md` · final 8-beat script with Stephen + Vinh voice split
- `deliverables/demo-video-storyboard.md` · per-second visual framing (existing storyboard locked Day 2)
- `deliverables/audio-raw/demo-video-captions.srt` · pre-baked SRT with paraphrase swap pattern
- `scripts/build-demo-video-stitch.sh` · ffmpeg stitch automation
- `github.com/StephenSook/context-mod-devvit/docs/submission/demo-video-runbook.md` · original cm-devvit runbook this v3 adapts
- `github.com/StephenSook/context-mod-devvit/scripts/demo/stitch.sh` · original cm-devvit stitch script this v3 adapts
- `github.com/StephenSook/context-mod-devvit/scripts/demo/captions-live-data.srt` · original cm-devvit SRT format reference

---

_Last updated 2026-05-27 evening Day 8 of 12 by Stephen. v3 adapts the cm-devvit production approach for APEX's 3-minute 2-person split + editorial-paddock palette + Fraunces + IBM Plex typography._
