# APEX demo-video shot list (3-minute, 2-person)

Built around the now-verified-live surfaces. Pairs with the spoken script in `docs/3-min-pitch-script-2-person-v3.md` (the VO column references its beats). The single most important change from earlier cuts: **Beat 6 is now a genuinely live backend run, not a fixture.** Record that shot first and lead the technical story with it.

## Pre-record checklist (do this in order)

1. **Warm the backend.** `curl -s https://ssookra-apex-backend.hf.space/healthz` returns `{"status":"ok"}`. HF free tier cold-starts; hit it twice so the recording run is warm.
2. **Confirm live Granite is firing.** `curl -sD- -o/dev/null -X POST https://apex-one-black.vercel.app/api/openrouter-stream -H 'Content-Type: application/json' -d '{"prompt":"test"}' | grep -i phase` reads `real` (not `stub-on-upstream-error`).
3. **Confirm the canonical demo is live.** `curl -s -X POST https://apex-one-black.vercel.app/api/coaching/analyze-demo | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['ok'],d['source'])"` prints `True backend-live`.
4. OBS scenes: 1920x1080, Chrome at 100% zoom, cursor highlight on, network throttling OFF.
5. Have the COA hardware-spec PDF page open in a tab for the Beat 5 cutaway.

## Shot table

| # | Beat (script) | Duration | Surface / URL | On-screen action | Capture note |
|---|---|---|---|---|---|
| 1 | Beat 1 hero | 0:00-0:18 | `/` landing | Slow scroll past the Fraunces wordmark + racing-line hero | The emotional headline ("the race engineer for the drivers who don't have one") holds on screen during the VO pause |
| 2 | Beat 2 problem | 0:18-0:25 | `/` problem section | Scroll to "The barrier stopped being regulatory. It became economic." | Hold on the line |
| 3 | Beat 3 Sarah debrief | 0:25-0:42 | `/analyze` | Type the debrief in the box; cursor over the telemetry + COA drop slots | Persona name is spoken (VO), not required on the default UI (Lane K) |
| 4 | Beat 4 architecture | 0:42-1:10 | `/judges` pipeline diagram | Scroll the three-layer pipeline (TTM -> QP projection -> Guardian) | Keep it brief; this is the "two jobs, two models, aggregation done honestly" line |
| 5 | Beat 5 COA killshot | 1:10-2:00 | `/judges` COA-gate toggle + what-if-replay | **Flip the COA simultaneity-gate toggle live**; show the verdict flip from violation to permitted; cutaway to the COA hardware-spec PDF page | This is the differentiator. Let the toggle interaction breathe |
| 6 | Beat 6 what APEX returns | 2:00-2:35 | `/analyze` | **Click "Run the canonical demo (live backend)"; the real report renders.** Scroll: corner cards with real deltas, the "computed live by the deployed APEX backend" label, the tuning card, the forecast chart, the Granite Guardian `flag` verdict + reasoning trace | THE headline live proof. Optional: a 2s cutaway to DevTools Network showing the 200 from `/api/coaching/analyze-demo`. Record this shot first while the backend is warm |
| 7 | Live chat | 2:35-2:45 | `/analyze` Chat tab | Type one question; the live Granite 4.1 8B answer streams in | Shows a second live-Granite surface |
| 8 | Edge + honesty | 2:45-2:55 | `/judges` edge panel + IBM-stack grid | Show the WebGPU Granite Nano running in-browser; pan the 14-tool grid with its WIRED / INTEGRATION / ACCELERATOR pills | The honesty tiers are the moat; show them on purpose |
| 9 | Close | 2:55-3:00 | `/` or title card | Apache-2.0 + the live URL `apex-one-black.vercel.app` | End on the mission line + the link |

## Honesty guardrails while recording

- Show only what is genuinely live: the canonical-demo backend run, the live chat, the WebGPU edge model, the COA-gate toggle all run for real. Do not imply arbitrary PDF uploads are fully-live (they are prose-live / numbers-fixture until the Docling bridge ships, per `docs/coa-docling-bridge-spec.md`).
- If the backend cold-starts mid-take, the demo falls back to the labelled fixture; re-warm and re-take rather than narrating the fixture as live.
- No em-dash, no AI-tone words in any on-screen lower-thirds or captions.

## Why shot 6 changes the pitch

Every competitor's "live AI" beat is canned, broken, or mislabeled. APEX's shot 6 is a one-click, genuinely-live backend run producing real physics numbers + a real Granite audit on screen. It is the visual answer to the only question a skeptical judge cares about: is the AI real. Lead the technical half of the video with it.
