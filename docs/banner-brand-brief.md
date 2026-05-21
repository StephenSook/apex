# APEX BeMyApp 1920x600 Banner Brand Brief

> Editorial magazine cover. Typography-first. Warm cream paper. Single confident geometric element. Deliberate visual contrast with the universal dark-cinematic competitor banner aesthetic.
>
> Canonical source: `app/frontend/lib/bemyapp-banner.tsx` (Next.js ImageResponse renderer).
> Live preview route: `GET /bemyapp-banner` from the dev server.
> Distribution artifact: `deliverables/bemyapp-banner-1920x600.png` (committed PNG, uploaded to the BeMyApp project page top slot).
> Competitor calibration that drove this brief: `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/reference_competitors_calibration.md` (private memory).

---

## Why editorial-magazine-cover, not dark-cinematic

Every visible competitor (NeuroPit, PitWall, AI Race Strategist, RaceMind AI) ships a dark-cinematic banner with a photo-collage race car + telemetry overlay. The category is saturated with one look.

APEX deliberately picks the opposite axis. Warm cream paper, Fraunces italic display type, single confident geometric element, generous negative space. The reader's eye registers it as "editorial magazine cover" before parsing the content. This is differentiation by design language, not by louder rendering.

Calibration anchors:
- NeuroPit -> dark cinematic + brain illustration + dashboard mockup -> "tech-startup pitch deck"
- PitWall -> dark cinematic + workflow icons + GoPro car -> "product launch"
- AI Race Strategist -> stock-photo race car + radar chart overlay -> "stock-template homework"
- RaceMind AI -> default BeMyApp placeholder banner -> "did not ship a banner"
- APEX -> warm cream + Fraunces italic + editorial masthead -> "Monocle magazine cover for motorsport"

The judge clicking through 45 gallery cards sees four similar dark thumbnails in a row. The fifth (ours) breaks the pattern. That is the only thing the banner has to do.

## Strict palette (no off-list colors)

| Token | Hex | Role |
|---|---|---|
| `paper` | `#F4EBD8` | Page background. Dominant. |
| `paper-warm` | `#EAE0C7` | Footer-strip text against racing green. |
| `racing-green` | `#0A2818` | Masthead + footer strips, eyebrow text, accent strokes. |
| `accent` (clay) | `#C1492C` | Differentiator chip background, "+0.34s" delta callout, racing-line dashed shadow. |
| `amber` | `#D9A441` | COA section sticker background, masthead + footer hairline accents. |
| `ink` | `#0F1410` | APEX wordmark, racing-line solid stroke. |
| `ink-soft` | `#1F2A22` | Tagline body. |
| `muted` | `#6F6657` | Sector sub-label, delta callout secondary text. |

Sparing use of clay-red + amber. Cream + ink + racing green carry the structure.

## Typography hierarchy

| Element | Font | Style | Size | Color |
|---|---|---|---|---|
| Masthead eyebrow strip | IBM Plex Mono | 500 | 18px | paper-warm on racing-green |
| Vol/no metadata | IBM Plex Mono | 500 | 18px | amber on racing-green |
| **APEX wordmark** | Fraunces | italic 700 | 260px | ink |
| Tagline | Fraunces | italic 700 | 44px | ink-soft |
| Differentiator chip | IBM Plex Sans | 600 | 18px | paper on accent |
| Sector label | IBM Plex Mono | 500 | 18px | racing-green |
| Sector sub-label | IBM Plex Mono | 500 | 16px | muted |
| **+0.34s delta** | IBM Plex Mono | 500 | 64px | accent |
| Lap metadata | IBM Plex Mono | 500 | 20px | muted |
| COA sticker | IBM Plex Mono | 500 | 16px | ink on amber |
| Footer attribution | IBM Plex Mono | 500 | 18px | paper-warm + amber on racing-green |

Fraunces (italic) drives the brand mark. IBM Plex (sans + mono) carries the data + body text. No third font.

## Composition (1920 x 600)

```
+--------------------------------------------------------------------------------------+
| MASTHEAD STRIP (eyebrow + vol/no + date)                                              |  <-- 56px tall
+--------------------------------------------------------------------------------------+
|                                                  |                                   |
|                                                  |  Sector 2 - Old Hairpin           |
|  APEX                                            |  Donington Park GP                |
|  (Fraunces italic 260pt)                         |                                   |
|                                                  |    [SVG: racing line curve        |
|  The race engineer for the drivers               |     with apex marker]             |
|  who don't have one.                             |                                   |
|  (Fraunces italic 44pt)                          |  +0.34s   Lap 17 of 19            |
|                                                  |           Sarah Reynolds          |
|  [clay-red chip]                                 |                                   |
|  First integrated workflow for                   |  [amber sticker]                  |
|  adaptive hand-controls                          |  COA Section 3(c) - permitted     |
|                                                  |                                   |
+--------------------------------------------------------------------------------------+
| FOOTER STRIP (github URL + IBM Granite attribution + Apache 2.0)                      |  <-- 56px tall
+--------------------------------------------------------------------------------------+
```

Left lockup occupies 58% of the width, right lockup 42%. A 1px hairline separates them. The masthead + footer strips are racing-green with amber 2px hairlines.

## The racing-line SVG element

Single confident geometric: a curved path representing the entry-and-exit of Old Hairpin, with a small apex marker (filled circle + concentric ring) at the inflection point. Solid ink stroke for the line + dashed clay-red shadow underneath suggesting the ideal versus actual line. No labels on the SVG itself; the surrounding Plex Mono labels carry the meaning.

This is the only non-typographic element. Resisting the temptation to add more visual content is the point.

## What this banner does NOT have

- No photograph of a car
- No CGI render of a cockpit, dashboard, or driver
- No stock motorsport b-roll
- No gradient mesh
- No noise texture or grain overlay
- No glow, blur, or "neon" effects
- No emoji
- No marketing icons (gauge / chart / wrench / trophy)

Everything not listed in the composition above is INTENTIONALLY absent. The discipline IS the design.

## Iteration workflow

1. Edit `app/frontend/lib/bemyapp-banner.tsx`.
2. From the repo root: `cd app/frontend && pnpm dev`.
3. Visit `http://localhost:3000/bemyapp-banner` (or `curl http://localhost:3000/bemyapp-banner > /tmp/banner-preview.png`).
4. Visually compare against this brief.
5. Once approved: `curl http://localhost:3000/bemyapp-banner > deliverables/bemyapp-banner-1920x600.png` and commit the PNG.
6. Upload `deliverables/bemyapp-banner-1920x600.png` to the BeMyApp project page top slot at submission time.

## Re-render policy

The Next.js ImageResponse renderer fetches Fraunces + IBM Plex Sans + IBM Plex Mono from Google Fonts CDN at render time. Local renders + Vercel builds need network access to `fonts.googleapis.com`. The committed PNG is the canonical artifact, so even if Google Fonts is unreachable at submission time, the banner already exists in the repo.

## Acceptance criteria

The committed PNG passes when:

1. The PNG is exactly 1920 x 600 pixels.
2. Cream `#F4EBD8` is the dominant color in the central content area (verified by visual check; not by a pixel sampler since cream + ink + racing-green compose).
3. Fraunces italic renders cleanly at 260pt for the APEX wordmark.
4. The tagline reads in one breath without orphan words.
5. The differentiator chip ("First integrated workflow for adaptive hand-controls") sits on a single line.
6. The racing-line SVG element occupies the right lockup's vertical centerline.
7. Masthead + footer strips both have the racing-green background + amber hairline.
8. The github URL + Apache 2.0 attribution + IBM Granite tools-count callout all fit the footer strip without truncation.
9. No em-dash (-) in any prose on the banner (use plain ASCII hyphen).
10. AI-tone sweep on every word: zero blocklist hits (delve, leverage, seamless, robust, comprehensive, unlock, cutting-edge, revolutionary, streamline, ecosystem, easily, simply, empower, intuitive).

If any acceptance criterion fails: edit `bemyapp-banner.tsx`, re-render, commit a new PNG.

---

_Last updated: 2026-05-21 night-late by Stephen (wave-22 banner brief locked alongside the renderer ship). Next iteration: Day 9 dress-rehearsal week, post-stakeholder-quote land. If a real adaptive-driver beta-tester quote lands by Day 8, consider replacing the "+0.34s Sarah Reynolds (fictional persona)" callout with an attributed quote line (per-surface consent required first)._
