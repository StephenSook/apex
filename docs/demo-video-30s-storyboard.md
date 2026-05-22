# Demo video · 30-second highlight clip · storyboard

Pull-forward Day 2 night-late draft of the Stretch S7 30-second clip. Per PLAN §16.4, the clip is cut from the 3-minute submission video for judges who only watch 30 seconds. Strongest 30 seconds. Same audio bed. Production take Day 10 (2026-05-29).

**Length:** 30 seconds hard cap. ffprobe `Duration` must show <= 0:00:30.000.

**Output path:** `deliverables/demo-video-30s.mp4` (1080p H.264, AAC stereo, MP4 container; also publish a 720p variant at `deliverables/demo-video-30s-720p.mp4` for slow connections).

**Audio bed:** Same voice-over recording as the 3-min video, time-aligned cuts. No re-record. Background score: same editorial-paddock cream-paper tone as the 3-min video. Music license per `deliverables/music-license.md`.

**Branding:** Same Fraunces wordmark + editorial-paddock palette as the 3-min video. End-card identical.

---

## Cut sequence

| t | Frame | Voice-over | Source |
|---|-------|------------|--------|
| 0:00 - 0:05 | Cold open. APEX cream-paper title card. Fraunces wordmark fades in. Subtitle below in IBM Plex Sans: "the race engineer for the drivers who don't have one." | "The race engineer for the drivers who don't have one." | Cut from 3-min Beat 1 hero headline. |
| 0:05 - 0:10 | Cut to Sarah Reynolds persona block. BMW M240i illustration on the left, MME Motorsport electronic hand-controls diagram on the right (small "MME Motorsport" attribution label per consent 2026-05-22). Lap-17-of-19 timestamp in IBM Plex Mono lower-right. | "Sarah Reynolds. RAF veteran. Left-leg amputee. Qualifying at Donington Park, lap seventeen of nineteen. She is two tenths off her PB. Her MME hand-controls let her brake and throttle at the same time. Existing AI coaches assume that is impossible." | Cut from 3-min Beat 2 Sarah moment. |
| 0:10 - 0:20 | Live coaching-report screen capture. Camera-style pan across the /analyze route: corner-by-corner cards on the left, tuning recommendation in the middle, next-session forecast on the right, Granite Guardian safety stamp + reasoning trace below. Reproducibility provenance footer visible at the bottom of frame. | "Granite TimeSeries TTM forecasts her next lap. A two-stage projection-and-audit layer reads her FIA Certificate of Adaptations and permits the simultaneity her car supports. Granite Guardian audits every projection step. Sixty seconds end to end." | Cut from 3-min Beat 4 + Beat 6 (architecture + what APEX returns). |
| 0:20 - 0:25 | Cut to the tuning-recommendation card UI alone, full-frame. "Reduce hand-lever brake travel by 4 millimetres" headline. CitationChip showing FIA Appendix L (regulatory anchor) + Section 3(c) of her synthetic COA (the hardware-spec source for the derived c_overlap flag). Forecast envelope behind it shows the persona's synthetic-fixture sector-2 recovery delta from `docs/sarah-reynolds-persona.md`. | "The recommendation cites her actual COA section. Every claim has provenance. Free at the point of use. Open source." | Cut from 3-min Beat 6 close. |
| 0:25 - 0:30 | End card. APEX wordmark + the 8 IBM tool badges in a row + Apache 2.0 + github.com/StephenSook/apex + "IBM SkillsBuild AI Builders Challenge May 2026." | Voice-over ends at 0:25. 0:25 - 0:30 is the silent end card. | New end card; matches the 3-min video end card. |

---

## Capture notes

**For the 0:10 - 0:20 live-coaching-report cut:**
- Use the /analyze route with the Sarah Reynolds canned fixture (Stretch C1; `AnalyzeFlow.buildMockReport()` shipping today).
- Camera-style pan executed in post (After Effects or Premiere Pro keyframed position+scale). No mouse cursor visible.
- Editorial-paddock palette unchanged.
- Provenance footer must show the actual commit SHA at recording time (paste from `git rev-parse --short=12 HEAD` immediately before recording).

**For the 0:20 - 0:25 tuning-card cut:**
- Full-frame close-up of the TuningCard component.
- Forecast envelope strip rendered behind at 30% opacity for visual continuity.

**For 0:25 - 0:30 end card:**
- Static frame, 5 seconds.
- Same end card as the 3-min video so the visual closure is identical regardless of which version the judge watched.

---

## Production checklist (Day 10)

- [ ] 1080p H.264 + 720p H.264 both render < 25 MB target (BeMyApp form upload tolerance).
- [ ] `ffprobe deliverables/demo-video-30s.mp4 2>&1 | grep Duration` returns <= 0:00:30.000.
- [ ] Closed captions baked into a `.vtt` file at `deliverables/demo-video-30s.vtt` (WCAG 2.1 AA accessibility).
- [ ] Voice-over levels match the 3-min video (-23 LUFS broadcast standard or equivalent).
- [ ] No em-dash in any on-screen captions or subtitles (per global em-dash rule).
- [ ] AI-tone sweep on the captions + voice-over transcript: zero blocklist hits.
- [ ] End card holds for full 5 seconds (no premature cut to black).
- [ ] Both files committed to `deliverables/` and pushed before Day 12 submission.

---

## Distribution

- Embed at the top of `apex.race/judges` (PLAN row 5.5; live).
- Link from BeMyApp submission form (PLAN row 7.1).
- Twitter / LinkedIn share-ready (PLAN row 16.4).
- Backup copy on a non-YouTube CDN in case YouTube goes down during the eval window (per pre-mortem.md row 7).

---

## Why 30 seconds

Per the calibration in PLAN §16.4 + global hackathon-project-flow Phase 5: "Some judges only watch 30 seconds. Make those 30 the strongest 30." The 30-second cut keeps the hero headline + Sarah moment + the demo moment + the close. Everything between 0:30 and 3:00 of the long version is depth a judge can opt into.

A judge who watches the 30-second cut and is still curious clicks through to the 3-min video for the architecture explainer + the killer detail beat + the stack + status beat. The 30-second version is the trailer; the 3-min version is the feature.
