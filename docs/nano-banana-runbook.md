---
title: Nano Banana Pro Runbook
type: reference
status: actionable
project: APEX
created: 2026-05-28
tags: [runbook, assets, gemini, nano-banana, hero-illustrations]
related: ["[[APEX MOC]]", "[[Decision-Log D-031 visual identity]]"]
---

# Nano Banana Pro runbook

Stephen-action runbook for generating the three editorial-paddock illustrations
the landing page needs (hero + Sarah Reynolds portrait + COA-gate infographic)
via the Gemini API `gemini-3-pro-image-preview` model.

Created 2026-05-28. Source-of-truth for current pricing checked same day against
the Gemini Developer API pricing page.

## TL;DR

- Cost: 3 images x $0.24 = $0.72 total (Standard 4K). Round to under $1.
- No free tier. The `gemini-3-pro-image-preview` row on the official pricing
  page is marked `Free Tier: Not available`. Billing must be enabled on the
  Google AI Studio project for the key to work against this model. Creating
  the key itself is free; using this specific model is not.
- Stephen time: ~10 minutes total (5 min key creation + billing, 2 min script
  run, 3 min visual inspection).
- Script: `scripts/generate-hero-illustrations.sh`. One env var, one command.

## What you are paying for

| Tier | 1K / 2K image | 4K image | Free tier |
| --- | --- | --- | --- |
| Standard | $0.134 | $0.240 | Not available |
| Batch (24h delay) | $0.067 | $0.120 | Not available |

Source: Gemini Developer API pricing page (`ai.google.dev/gemini-api/docs/pricing`),
row `gemini-3-pro-image-preview`. Verified 2026-05-28.

Input tokens for the three prompts add roughly $0.003 total. Negligible.

## Why we cannot use the free tier or Google AI Studio web UI

Three reasons:

1. **API model row is paid-only.** The pricing page row for
   `gemini-3-pro-image-preview` shows `Free Tier: Not available`. The free
   Gemini API tier covers other models (Gemini 2.5 Flash Image, etc) but not
   this one. A Tier 1 billing account is required.
2. **Web UI free path is gated and watermarked.** The Gemini app free tier
   gives roughly 2-3 Nano Banana Pro images per day at 1MP with a visible
   SynthID-plus-visible-watermark, and caps resolution below 4K. Not viable
   for a landing-page hero.
3. **Repeatability.** The script path means we can re-render with prompt
   tweaks in seconds. Hand-clicking through AI Studio is not.

If Stephen has an existing Google AI Pro or Ultra subscription, that unlocks
higher Nano Banana Pro caps inside the Gemini app, but it does NOT change the
API row. The API row stays paid.

## Step 1: Create or reuse a Gemini API key

If you already have a Tier 1 Gemini API key with billing enabled, skip to
step 2.

1. Open `https://aistudio.google.com` and sign in with your Google account.
2. Click `Get API key` in the top-right.
3. Click `Create API key`. Pick or create a Google Cloud project to attach
   it to.
4. Copy the key. It looks like `AIza...`.

## Step 2: Enable billing on the project

This is the gate. Without billing, the API call returns 429 / quota-exceeded
for this model even with a valid key.

1. In AI Studio, open the dashboard for the project the key is attached to.
2. Click `Usage & Billing`, then `Billing`.
3. Click `Set up Billing`. Either create a new Cloud Billing account or
   attach an existing one. Add a payment method.
4. (Recommended) From the same screen, set a `Project Spend Cap`. $5 is
   plenty for this run plus a couple of re-renders. Spend caps apply with a
   roughly one-hour delay; any overages within that window are on you.
5. Wait ~1 minute for the tier to flip from Free to Tier 1. Refresh the
   dashboard if needed.

## Step 3: Export the key and run the script

From the repo root:

```bash
export GOOGLE_API_KEY="AIza...your_key..."
./scripts/generate-hero-illustrations.sh
```

Expected runtime: roughly 30 to 90 seconds per image at 4K (model "Thinking"
phase plus 4K rendering). The script prints HTTP status, file path, mime
type, and byte size for each of the three outputs.

If you want a dry run to inspect the request bodies without spending anything:

```bash
DRY_RUN=1 ./scripts/generate-hero-illustrations.sh
```

If you want 2K instead of 4K (about half the cost, faster):

```bash
IMAGE_SIZE=2K ./scripts/generate-hero-illustrations.sh
```

## Step 4: Verify outputs

The script writes three files into `app/frontend/public/`:

- `hero-illustration-4k.png` (16:9, paddock cockpit at golden hour)
- `sarah-reynolds-portrait-4k.png` (3:4, illustrated profile, hand-controls visible)
- `coa-gate-illustration-4k.png` (16:9, brake-throttle traces crossing at apex)

Open each in Preview. Sanity-check against the editorial-paddock palette
locked in `CLAUDE.md`:

- Background reads as warm cream paper, not pure white.
- Racing-green ink + clay-red accent + amber highlight present.
- Sarah portrait reads as ILLUSTRATED, not photoreal. If it looks like a
  photograph, re-run; the prompt is explicit but Nano Banana Pro is a
  photoreal-capable model and occasionally drifts.
- Negative space is preserved where the script asks for it. The
  text-overlay regions stay empty (the script tells the model NOT to render
  text; we add Fraunces italic overlays in the React layer).
- No invented FIA Article numbers, no logos, no real-person likeness, no
  text strings on the image surface.

## Step 5: Ping Claude

Once the three PNGs land, paste one line into the Claude session:

```
illustrations landed. wire up hero + sarah + coa-gate.
```

Claude will swap them into the landing-page hero, persona page, and COA-gate
explainer section, with the Fraunces / IBM Plex overlays applied in React.

## Re-rendering individual images

If only one needs a re-roll, the cheapest path is editing
`scripts/generate-hero-illustrations.sh` to comment out the two
`generate_one` calls you do not want, then re-run. Each re-roll costs $0.24
at 4K.

## Cost cap, in case of accident

The script makes exactly three API calls per invocation, no retries, no loops.
A worst-case accidental triple run is $2.16. The Project Spend Cap in step 2
backstops anything worse.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `HTTP 401` | Bad or missing key | Re-export `GOOGLE_API_KEY` |
| `HTTP 403` with `PERMISSION_DENIED` | Billing not enabled | Finish step 2 |
| `HTTP 429` quota | Free-tier project still active | Confirm Tier 1 in dashboard |
| `HTTP 400` `Invalid argument` on `imageSize` | Lowercase k | Script uses `4K`; do not edit |
| Output looks photoreal for Sarah | Model drift | Re-run; prompt is explicit |
| Output has rendered text in it | Model ignored "no text" | Re-run; the script keeps overlay regions empty by intent |
| `base64: invalid input` | macOS `base64 -d` line-length quirk | Script auto-falls back to python3 decoder |

## Source pin (don't edit, useful for the post-mortem)

- Pricing source: Gemini Developer API pricing page, row
  `gemini-3-pro-image-preview`, verified 2026-05-28.
- Endpoint: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent`
- Auth header: `x-goog-api-key: <key>`
- Request body keys used: `contents[].role`, `contents[].parts[].text`,
  `generationConfig.responseModalities`, `generationConfig.imageConfig.aspectRatio`,
  `generationConfig.imageConfig.imageSize`.
- Response extraction: `candidates[0].content.parts[*].inlineData.data` is
  the base64 PNG, with `inlineData.mimeType = "image/png"`.
- Image-size constraint: `1K`, `2K`, `4K`. Uppercase K is required. Lowercase
  is rejected.
