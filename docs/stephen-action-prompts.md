# Stephen action prompts: ready-to-paste copy for the remaining wave-51 stretches

Wave-51 + wave-51b shipped the cinematic SVG hero + BlurText + live latency badge + citation footer scroll-anchor pulse end-to-end. The Phase 2 stretches below need Stephen-side input (asset generation, account signup, demo recording) before Claude can wire the result into the deploy.

Order of impact-per-hour:

| Stretch | Stephen cost | Claude follow-up | Impact |
|---|---|---|---|
| Nano Banana Pro editorial illustrations | $5 + 2 hr | 30 min wire | Visual lift across /judges + /coach-code + landing |
| NotebookLM master Audio Overview | free + 4 hr | 30 min wire | Narrative depth on /judges hero block |
| Honeycomb.io free OpenTelemetry dashboard | free + 30 min | 30 min wire | Production observability rebuttal vs OVERRIDE |
| Replicate FLUX 1.1 alt path | $0.05 per image + 1 hr | 15 min wire | Alternative if Nano Banana credit budget tight |
| Hume Octave 2 demo voiceover | $14 + 3 hr | none | Emotion-aware coach voice on 3 min demo video |
| 21st.dev Magic MCP component | $20 + 4 hr | none | Optional surface polish; risk of generic AI bias vs editorial-paddock identity |
| R3F Phase 2 cinematic overlay | none | 4-5 hr Claude | More depth on the landing hero (Bloom + Vignette + Instances) |

---

## 1. Nano Banana Pro editorial illustrations

**Tool.** Nano Banana Pro is Google DeepMind's Gemini 3 Pro Image model. Model ID `gemini-3-pro-image-preview`. Access via Google AI Studio + Gemini API with `GOOGLE_API_KEY`. Pricing per image: $0.134 (1K) + $0.134 (2K) + $0.240 (4K). Killer feature is legible stylized text rendering inside the image.

**Three illustrations to generate** (all 4K so Banana renders sharp Fraunces-style text):

### Illustration 1: Hero illustration for landing page right column

Paste this prompt into Google AI Studio + Gemini API `generateContent` with `model: gemini-3-pro-image-preview`:

```
Editorial paddock motorsport press kit illustration in warm cream paper texture style. A 1970s race-team telemetry workshop scene at golden hour: a single hand-controls-adapted GT4 race car cockpit foreground, ambient amber paddock-light glow, paper-grain noise overlay throughout, hand-lettered Fraunces italic display headline "The race engineer for the drivers who don't have one." overlaid on the lower-third with deep racing-green ink color #0A2818. Background warm cream paper #F4EBD8 with subtle racing-green track-line silhouette behind. Clay-red signal accent #C1492C on the apex marker. Amber heat-glow #D9A441 on the dashboard telemetry. Editorial cover composition for a paddock-night magazine issue. NO sci-fi neon. NO purple-indigo gradients. NO cold-cyber palette. The aesthetic is Octane Magazine meets Wallpaper editorial spread. 4K resolution. Aspect ratio 16:10.
```

Save the output as `app/frontend/public/hero-illustration-4k.png` then ping Claude.

### Illustration 2: Sarah Reynolds persona portrait

Sarah is fictional per Lane K rule. The portrait is illustrated, not photographic, so the fictional-persona aspect is preserved + judges immediately read "this is a story persona, not a real driver."

```
Editorial paddock illustration of a fictional adaptive race driver named Sarah Reynolds in profile inside a Britcar Trophy BMW M240i cockpit. Mid-thirties RAF veteran style, focused expression on the racing line ahead, left-leg amputee with prosthesis below knee, electronic hand-control hardware on the steering wheel rim with MME Motorsport ring-throttle paddle visible. Warm cream paper texture background with subtle racing-green track-line behind. Hand-control hardware in clay-red signal accent. Amber dashboard glow on right edge. Editorial illustration style; NOT photoreal. Headline overlay in Fraunces italic: "Sarah Reynolds. Britcar Trophy. Donington Park." Editorial-paddock palette: cream #F4EBD8 + racing-green #0A2818 + clay-red #C1492C + amber #D9A441 + ink #0F1410. 4K resolution. Aspect ratio 3:4 portrait.
```

Save as `app/frontend/public/sarah-reynolds-portrait-4k.png`.

### Illustration 3: COA gate visual for /judges hero

```
Editorial paddock infographic illustration of the brake-throttle simultaneity gate concept. Two telemetry traces overlaid in clay-red and racing-green crossing at the apex of a corner. Amber heat-glow halo around the apex crossing point. Fraunces italic display headline "FIA Certificate of Adaptations as tensor input" overlaid in deep racing-green ink. Background warm cream paper texture with subtle paddock dust grain. Bottom-right corner: Plex Mono callout "coa_overlap_flag = 1". Editorial-paddock palette only: cream + racing-green + clay-red + amber + ink. NO purple. NO cold-blue. NO sci-fi neon. 4K resolution. Aspect ratio 16:10.
```

Save as `app/frontend/public/coa-gate-illustration-4k.png`.

Total Stephen time: about 2 hours including prompt iteration + image QA. Cost ~$1 (3 images at 4K).

**Claude follow-up on asset arrival** (~30 min):
- Wire hero illustration into the landing page hero figure via next/image with priority
- Wire Sarah portrait into /judges + /coach-code hero blocks
- Wire COA gate illustration into the existing COA-gate panel on /judges
- Verify Lighthouse LCP not regressed (priority + width/height attrs)

---

## 2. NotebookLM master Audio Overview

**Tool.** NotebookLM web UI at https://notebooklm.google.com. Free with Google login.

### Steps for Stephen

1. Create new notebook titled "APEX paper §3 + decisions"
2. Upload source documents:
   - `paper/apex-neurips-workshop-2026.md` (§3.1 through §3.8)
   - `docs/decision-log.md` (D-001 through D-070)
   - `docs/architecture-spec.md`
   - `README.md`
3. In the Studio panel, choose "Audio Overview" with format "Deep dive" + length "Long" + custom focus prompt:

```
Generate a 10-minute conversational deep-dive on APEX. Cover these specific topics in order: (1) the problem APEX solves for adaptive racers / veteran-team drivers / grassroots competitors and why a paid race engineer is a luxury good; (2) the PhysicsTTM three-layer architecture (frozen Granite TimeSeries TTM r2.1 forecaster + Cvxpylayers differentiable physics projection + Granite Guardian 4.1 audit) and why the wrapper is the contribution not the model; (3) the COA-parameterized brake-throttle simultaneity gate killshot for adaptive drivers running hand-control hardware; (4) the 14-tool IBM Granite stack per-tool honesty tier ladder. Tone: engineering-confident, paddock-direct. NO em-dash. NO marketing language like leverage / seamless / robust. Speak slower than feels natural.
```

4. Click Generate. NotebookLM produces a 10-12 minute MP4 with two hosts.
5. Download as MP3. Use online MP4 to MP3 converter OR `ffmpeg -i input.mp4 -vn -ab 192k -ar 44100 output.mp3` if comfortable with ffmpeg.
6. Drop the MP3 at `app/frontend/public/audio/master-overview.mp3` then ping Claude.

Total Stephen time: about 4 hours including listening QA + drift hunt + any regenerate cycles.

**Claude follow-up on MP3 arrival** (~30 min):
- Add a hero-block audio player at the top of /judges using the existing NotebookLMHoverAudio panel pattern with a new master-overview panelId
- Add a "Listen: 10-minute deep-dive" CTA in the landing page hero just below the BlurText headline
- Add the audio embed link to SUBMISSION.md BeMyApp form copy

---

## 3. Honeycomb.io free OpenTelemetry dashboard

**Tool.** Honeycomb.io free tier supports OpenTelemetry ingestion. Sign up at https://honeycomb.io and create a new environment + API key.

### Steps for Stephen

1. Sign up at honeycomb.io with email + create a new team "apex"
2. Create environment "production"
3. Copy the ingest API key from the environment settings
4. Set the env var on the HF Space backend via the HF web UI at https://huggingface.co/spaces/ssookra/apex-backend/settings:
   - Key: `OTEL_EXPORTER_OTLP_ENDPOINT` Value: `https://api.honeycomb.io:443`
   - Key: `OTEL_EXPORTER_OTLP_HEADERS` Value: `x-honeycomb-team=<api-key-from-step-3>`
   - Key: `APEX_OTEL_ENABLED` Value: `1`
5. Restart the HF Space (Settings -> Factory rebuild)
6. Ping Claude

**Claude follow-up on env vars set** (~30 min):
- Verify the existing `app/backend/apex/observability.py` lazy OTel scaffolding wires through cleanly to the Honeycomb endpoint
- Add a "Production observability" link on /judges pointing at the public Honeycomb dashboard URL
- Update SUBMISSION.md story to mention the production OTel dashboard as the OVERRIDE-counter on the production-grade-instrumentation axis

Total Stephen time: about 30 minutes. Cost: free.

---

## 4. Replicate FLUX 1.1 alt path

If Nano Banana Pro credit budget tight OR you prefer the FLUX 1.1 aesthetic over Banana, alternative image generation via Replicate.

### Stephen flow

1. Sign up at https://replicate.com with GitHub OAuth
2. Add billing card (cost ~$0.05 per image; 3 images total ~$0.15)
3. Visit https://replicate.com/black-forest-labs/flux-1.1-pro
4. Use the same 3 prompts from section 1 (Hero, Sarah, COA gate)
5. Download outputs as PNG, save to `app/frontend/public/` with the same filenames
6. Ping Claude (same wire-up)

Total Stephen time: about 1 hour. Cost ~$0.15.

---

## 5. Hume Octave 2 demo voiceover

For the 3-minute demo video voiceover, Hume Octave 2 supports emotion-modulated TTS. Differentiator vs synthesized robotic TTS that judges hear in every other submission.

### Stephen flow

1. Sign up at https://hume.ai/octave Creator tier ($14/month, 1M chars, commercial license included)
2. Open the Studio
3. Paste Beat 5 of the pitch script (the COA killshot from Vinh's narration) and generate the voiceover with emotion preset "engineering-confident"
4. Iterate on emotion presets per beat until the cadence matches the cm-devvit-style production target (~150 wpm)
5. Export each beat as WAV
6. Splice into the demo video via Audacity or ffmpeg per `docs/3-min-pitch-script-2-person-v3.md` per-beat recording sequence

Total Stephen time: about 3 hours. Cost $14 (one month). NOT Claude-shippable; the voice is part of the demo video Stephen records.

---

## 6. R3F Phase 2 cinematic overlay (Claude-shippable; needs Stephen go-ahead)

If the wave-51 SVG cinematic hero gives the wow factor you wanted, stop here. If you want MORE cinematic depth (volumetric Bloom + 3D Vignette + GPU-particles + depth-of-field), Claude can ship a Phase 2 R3F overlay on top of the existing SVG fallback.

**Stack** (compatibility verified per wave-51 research dispatch):
- `@react-three/fiber@9.6.1` (already installed)
- `@react-three/drei@10.7.7` (already installed)
- `three@0.184.0` (already installed)
- ADD `@react-three/postprocessing@3.0.4`
- ADD `postprocessing@6.39.1`

**Scene**:
- TubeGeometry racing line ribbon with emissive clay-red material
- Sphere apex marker with emissiveIntensity 2.4 to catch Bloom
- Instances<sphereGeometry> particle field (200-300 amber motes orbiting the racing line)
- CinemaCamera slow orbital lerp via useFrame
- EffectComposer with Bloom + Vignette + subtle ChromaticAberration

**Gate switch**: dynamic-imported via next/dynamic ssr:false; reduce-motion + low-core (`navigator.hardwareConcurrency < 4`) users get the wave-51 SVG hero instead. Bundle weight ~280KB gzip; not loaded for fallback users.

**Cost**: 4-5 hours Claude work + Playwright verify + Codex adversarial review. Ship as a single atomic commit + cascade-fix-forward discipline if anything breaks. Fallback path is the wave-51 SVG hero at HEAD which works clean.

**Risk**: Next.js 16 hydration unknowns + R3F + EffectComposer first-time install. Mitigation: single atomic commit; revert clean if CI red.

**Stephen go-ahead trigger**: say "ship R3F Phase 2" and Claude executes.

---

## 7. 21st.dev Magic MCP component generation

If you want me to actually generate a 21st.dev component (e.g., a more polished /upload drag-drop zone, or a hero treatment alternative), I have access to `mcp__magic__21st_magic_component_builder`. Risk: 21st.dev generated components default to a generic AI-aesthetic palette (purple/indigo gradients on white) that conflicts with editorial-paddock. Claude would need to manually re-skin the output to fit the cream + racing-green + clay-red + amber + ink system.

**Cost**: $20 / month 21st.dev Pro for 400 credits (about 80 component generations) + 4 hours Claude integration work. Skip unless a specific surface (e.g., /upload drag-drop) needs the polish.

**Stephen go-ahead trigger**: name the specific surface you want polished + Claude dispatches the 21st.dev component builder.

---

## Recommended sequence for next 4 days

**Day 9 (today after this session)**:
- Stephen: sign up Honeycomb.io free tier + set 3 env vars on HF Space (~30 min). Ping Claude. Claude wires "Production observability" link on /judges (~30 min). Concrete OVERRIDE-counter shipped.
- Stephen: 3 Nano Banana Pro illustrations (~2 hr + $1). Ping Claude. Claude wires illustrations to landing + /judges + /coach-code (~30 min).

**Day 10**:
- Stephen: NotebookLM master Audio Overview (~4 hr). Ping Claude. Claude wires master MP3 to /judges hero block (~30 min).
- Stephen: 3-min demo video record per docs/3-min-pitch-script-2-person-v3.md + 30-sec highlight clip + YouTube unlisted upload (~5 hr).

**Day 11**:
- Stephen: BeMyApp form submission with multi-track checkboxes + 1920x600 banner.
- Stephen: 5 stakeholder DM follow-ups (Mission 44, Team BRIT Al Locke per-surface attribution consent confirm, MME Motorsport consent re-confirm).

**Day 12 T-4hr pre-submit gate (2026-05-31 19:59 ET)**:
- Claude: hackathon-pre-deploy skill chain
- Em-dash + AI-tone + operator-attribution sweeps
- Production smoke verify all routes 200
- Stephen: submit by 21:00 ET to leave 3-hour buffer

---

## Items I am NOT recommending (brutally honest)

- **21st.dev Magic MCP**: skip unless you name a specific surface. Editorial-paddock identity at risk.
- **R3F Phase 2 overlay**: skip unless wave-51 SVG hero is not enough wow. The cinematic SVG is genuinely good. Adding 280KB bundle for marginal visual gain at T-4d is risky.
- **CoachingReportLiveCharts real-wire to /api/analyze lap_history**: needs backend schema extension Vinh has not shipped + ~3 hours co-ordination. The honest demo-data caption shipped wave-50 5f67900 reads engineering-candor; defer the real wire to post-submission.

---

_Last updated 2026-05-28 Day 9 wave-51b close-out_
