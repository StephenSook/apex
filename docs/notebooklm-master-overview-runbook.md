# NotebookLM master Audio Overview runbook

Generate the 10-minute master Audio Overview MP3 that mounts on the
`/judges` hero block and ships in `SUBMISSION.md`. Two paths.

## Path A (primary): scripted via `notebooklm-py`

teng-lin/notebooklm-py is an unofficial Python wrapper over the same
internal NotebookLM RPC the web UI uses. Cookie-based auth via
Playwright Chromium. NO GCP billing project required.

```bash
# one-time setup
uv tool install notebooklm-py
notebooklm login   # opens Chromium for Google sign-in; saves session

# every run
cd "/Users/stephensookra/Desktop/IBM May"
uv run --with notebooklm-py scripts/generate-master-overview.py
```

The script uploads 4 source files (paper, decision log, architecture
spec, README), creates a notebook, requests Audio Overview with
`deep_dive` format + `long` length + the locked focus prompt, polls
until ready (10-20 minutes), and downloads to
`app/frontend/public/audio/master-overview.mp3`.

If the script aborts on auth (session cookie expired), re-run
`notebooklm login` and retry.

## Path B (fallback): NotebookLM web UI

If the SDK breaks against a Google internal-API change, do it by hand.
~25 minutes end-to-end.

1. Open https://notebooklm.google.com signed in to the Google account
   you use for the hackathon.
2. Click **New notebook**. Title it `APEX master overview (judges)`.
3. Upload the 4 source files from the repo root:
   - `paper/apex-neurips-workshop-2026.md`
   - `docs/decision-log.md`
   - `docs/architecture-spec.md`
   - `README.md`
4. Wait for all 4 sources to finish processing (green check).
5. Open the **Studio** panel on the right.
6. On the **Audio Overview** tile, click the pencil icon to customize.
7. Set **Format** to `Deep Dive`. Set **Length** to `Long`.
8. In the custom instructions field, paste this prompt verbatim (it
   matches the prompt embedded in the script):

   > Produce a ten-minute deep-dive Audio Overview for IBM SkillsBuild
   > judges evaluating APEX, an AI race engineer for adaptive racers.
   > Cover four pillars, in order, with roughly equal time each.
   > One: the problem. A professional race engineer costs hundreds of
   > pounds per day, well beyond the budget of adaptive racers, veteran
   > drivers, and grassroots competitors. The FIA lifted its single-
   > seater ban on disabled drivers in December 2017, but the economic
   > barrier replaced the regulatory one. APEX targets the drivers who
   > do not have a race engineer at all.
   > Two: the PhysicsTTM three-layer architecture. A frozen Granite
   > TimeSeries TTM forecaster, wrapped in a two-stage projection-and-
   > audit layer (Stage 1 differentiable CvxpyLayer convex QP for
   > friction-ellipse, forward-Euler, and jerk bound; Stage 2 post-
   > projection feasibility filter for bicycle-model coupling and the
   > COA-parameterized brake-throttle simultaneity gate), audited by
   > Granite Guardian 4.1 with BYOC custom rules. Explain why frozen
   > TSFM plus post-hoc projection is structurally different from a
   > retrained physics-informed neural network.
   > Three: the COA-parameterized brake-throttle simultaneity gate
   > killshot. Existing AI race-engineer tools encode throttle times
   > brake equals zero because able-bodied drivers do not press both.
   > Adaptive drivers do, when their FIA Certificate of Adaptations
   > permits simultaneity through their hand-control system. APEX reads
   > the COA at tensor level. To the best of the team's literature
   > review through 2026-Q2, no prior public AI race-engineer workflow
   > reads COA data as a binding regulatory input.
   > Four: the fourteen-tool IBM Granite stack honesty tier ladder.
   > Two tools wired end-to-end at HEAD (Granite Instruct 4.1 8B and
   > Granite 4.0 Nano 350M). Ten at frontend-integration with canonical
   > type contracts and backend swap-points. Two build-time
   > accelerators. Walk the ladder and explain why honest tier labels
   > beat marketing tool counts.
   > Tone: paddock-direct, engineering-confident, conversational. Do
   > not use em-dash. Do not use the words leverage, seamless, robust,
   > comprehensive, unlock, cutting-edge, revolutionary, streamline,
   > ecosystem, easily, or simply. Speak at roughly 150 words per
   > minute. Treat the listener as a technical judge who has read the
   > abstract and wants the engineering substance, not a sales pitch.
   > Close on the editorial line: the race engineer for the drivers
   > who do not have one.

9. Click **Generate**. Wait 10 to 20 minutes.
10. When the audio appears, click the three-dot menu next to the
    player, then **Download**. NotebookLM exports `.wav`.
11. Convert to `.mp3` (smaller; matches existing `public/audio/*.mp3`
    convention):

    ```bash
    cd "/Users/stephensookra/Desktop/IBM May"
    ffmpeg -i ~/Downloads/<the-downloaded-file>.wav \
      -codec:a libmp3lame -qscale:a 4 \
      app/frontend/public/audio/master-overview.mp3
    ```

12. Ping Claude when the MP3 lands. Claude wires it onto `/judges`
    hero block and adds the listening CTA to `SUBMISSION.md`.

## Time estimate

- Path A: 2 minutes setup + 15-25 minutes generation = 20 minutes total.
- Path B: 5 minutes setup + 15-25 minutes generation + 2 minutes convert
  = 25 minutes total.

## Authentication notes

Neither path requires a GCP billing project. NotebookLM's free tier
(`notebooklm.google.com`) allows 3 Audio Overviews per day on a free
account. The unofficial SDKs reuse the same web session via Playwright
cookies, so they hit the same free-tier quota.

The official `discoveryengine.googleapis.com/v1alpha/.../audioOverviews`
endpoint exists but requires a Google Cloud project with the Discovery
Engine API enabled and the Podcast API User IAM role. That is the paid
NotebookLM Enterprise surface. Not in scope for this hackathon.
