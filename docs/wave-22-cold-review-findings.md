# Wave-22 cold review findings

> Stephen-requested cold review on wave-19/20/21/22 work. Dispatched 2026-05-21 night-late. Six parallel agents + mechanical Bash sweep. All seven returned within ~12 minutes. Findings consolidated below; closures land in atomic commits in the same wave.
>
> Brief that dispatched this review: `docs/wave-22-cold-review-brief.md`.

---

## Lenses dispatched

| Lens | Subagent type | Returned |
|---|---|---|
| 1 | `pr-review-toolkit:code-reviewer` | 3 HIGH + 3 MED + 1 NIT |
| 2 | `pr-review-toolkit:silent-failure-hunter` | 3 BLOCKER (re-tiered HIGH) + 4 HIGH + 5 MED |
| 3 | `pr-review-toolkit:type-design-analyzer` | 1 HIGH + 3 MED + 6 NIT |
| 4 | `pr-review-toolkit:comment-analyzer` | 2 BLOCKER + 5 HIGH + 6 MED + 5 NIT |
| 5 | `cc-gemini-plugin:gemini-agent` | 2 BLOCKER + 3 HIGH + 5 MED + 4 NIT |
| 6 | `codex:codex-rescue` | 3 HIGH + 4 MED |
| 7 | `plan-gap-scanner` | 6 WARN + 6 NIT |
| Bash mechanical sweep | em-dash + AI-tone blocklist + operator-attribution + tsc | Clean (3 hits are self-referencing rules text, not real violations) |

## Ground truth check (pre-synthesis)

- 179 commits total (`git log --oneline | wc -l`)
- 5 production routes: `/`, `/analyze`, `/judges`, `/sim-rig`, `/status` + `/bemyapp-banner` route handler + 5 `opengraph-image.tsx` files (root + 4 per-route)
- 57 vitest test cases across 9 test files
- `app/frontend/lib/og-card.tsx` + `app/frontend/lib/bemyapp-banner.tsx` both shipped
- `deliverables/bemyapp-banner-1920x600.png` is 112,685 bytes, 1920x600 PNG RGBA non-interlaced

Gemini under-counted (179 vs claimed 165; 57 tests counted correctly by code-reviewer; gemini said 60 because it counted `it(` + `test(` patterns including describe-internal nestings). Methodology Phase 6 still claims "155 commits + 4 routes + 52 tests" - stale by 24 commits / 1 route / 5 tests.

---

## BLOCKER (close in this wave)

### B1. `simultaneity_envelope` schema contradiction across types.ts vs arch-spec vs PLAN
**Source:** gemini Q4 #5.
**Location:** `app/shared/types.ts:136` (hoisted `coa_simul_permitted: boolean` to top-level FIACoa) vs `docs/architecture-spec.md` §COA parsed JSON schema (still describes legacy sub-object `simultaneity_envelope: { brake_throttle_permitted, coa_section_id, homologation_class }`) vs `PLAN.md` Shared Contracts row "FIA COA parsed JSON shape" (legacy sub-object).
**Risk:** types.ts asserts itself as single-source-of-truth (line 8). Two prose docs describe a contract shape the canonical type no longer carries. Vinh-side Pydantic mirror, when shipped, will pick whichever doc he reads first.
**Fix:** Rewrite arch-spec §COA section + PLAN Shared Contracts row to match the hoisted-flag shape. Add `brake_travel_adjustable_mm` optional tuple field documented.

### B2. `context_length` drift (24 vs 128)
**Source:** gemini Q4 #2.
**Location:** `docs/architecture-spec.md:84` (24) vs `PLAN.md:308` Shared Contracts (128).
**Risk:** TTM r2.1 supports 24, 52, 96, 512, 1024. Both 24 and 128 are valid model contexts but they imply different aggregation strategies; Vinh-side implementation picks whichever doc he reads.
**Fix:** PLAN.md change `context_length=128` -> `context_length=24` to match arch-spec.

### B3. Banner brand brief typography table stale vs v2 renderer
**Source:** comment-analyzer B1, gemini Q2.
**Location:** `docs/banner-brand-brief.md:53-54` (table shows +0.34s = 64px, lap metadata = 20px) vs `app/frontend/lib/bemyapp-banner.tsx:305` (56px) + `:316` (17px). Wave-22 session note documents the v2 restack that shrunk the sizes to fix overlap.
**Risk:** Brief is cited from `app/frontend/lib/bemyapp-banner.tsx:17` and `docs/pre-mortem.md:90` as design source of truth. Future re-render from the brief produces output that doesn't match the committed PNG.
**Fix:** Brief table -> 56px + 17px to match v2.

### B4. SimRigStream tick-rate contradicted across three docs (60 Hz / 20 Hz / 10 Hz)
**Source:** comment-analyzer B2.
**Location:** `app/frontend/components/SimRigStream.tsx:7-8` (JSDoc "60 Hz sim feed") vs `:23` (`TICK_INTERVAL_MS = 50` = 20 Hz, also rendered on-screen via `1000 / TICK_INTERVAL_MS` at `:159`) vs `app/shared/types.ts:323` (`SimRigFrame` doc-comment "Live telemetry slice at 10 Hz").
**Risk:** Judge looking at the live tile sees "Ring buffer 120 of 120 frames at 20 Hz" but reads the JSDoc claim of 60 Hz. Three internal docs disagree.
**Fix:** Canonical = 20 Hz (the constant + the on-screen label). Rewrite JSDoc + shared-types comment to match.

### B5. "First pretrained time-series foundation model on motorsport telemetry" wording contradicts "we don't retrain it"
**Source:** codex HIGH AREA 2 #1.
**Location:** `docs/3-min-pitch-script.md:19` (Beat 5) + `deliverables/bemyapp-submission-payload.md:62` (Magic Solution) + supporting copy in private memory.
**Risk:** Reads as "the model was pretrained ON motorsport data" - a judge then learns we use a general IBM TTM zero-shot on motorsport telemetry and the claim contradicts the architecture's "we do not retrain it" line in the same script. Official Rules DQ trigger #6: "false information about identity, address, ownership of rights" - a hostile reading of motorsport-pretraining-vs-zero-shot-application could be flagged.
**Fix:** Swap to "first application of a pretrained time-series foundation model to adaptive motorsport telemetry" across all three surfaces.

---

## HIGH (close in this wave)

### H1. SimRigStream bare-catch swallows ALL errors on the WebSocket message path
**Source:** silent-failure-hunter B1, code-reviewer H1.
**Location:** `app/frontend/components/SimRigStream.tsx:106-117`.
**Issue:** `try { JSON.parse(event.data as string) as SimRigFrame; if (...) ... } catch { console.warn("JSON parse error") }`. The catch is parameterless, captures everything (cast errors, dereferences on null, reducer throws), and log lies about the cause. Three failure surfaces collapse into one log line. Live demo "Live indicator on but channels frozen" failure mode.
**Fix:** Type-guard `isSimRigFrame(unknown): value is SimRigFrame`. Separate transport (non-string) / parse / shape failure paths. Each logs its own cause.

### H2. SimRigStream `as string` + `as SimRigFrame` casts violate CONTRIBUTING.md no-`as` rule
**Source:** code-reviewer H1.
**Location:** `app/frontend/components/SimRigStream.tsx:108`.
**Fix:** Lands with H1 fix (the type-guard pattern doesn't need cast).

### H3. SimRigStream unbounded reconnect loop + uncleared timer
**Source:** silent-failure-hunter B2, code-reviewer H2.
**Location:** `app/frontend/components/SimRigStream.tsx:118-134`.
**Issue:** No max-retry. Pre-Day-9 misconfigured server = infinite "Reconnecting" yellow label. setTimeout handle not captured -> leaked timer on unmount with stacked reconnect loops if route navigates back-and-forth. `disconnect` action overwrites the `error` state silently.
**Fix:** Track timer in ref + clearTimeout on cleanup. Cap retries at 6 attempts (~31s total backoff). On exhaustion, dispatch terminal error visible via role="alert".

### H4. SimRigStream `gear as 0|1|2|3|4|5|6|7|8` cast in `buildSimulatedFrame`
**Source:** code-reviewer H3.
**Location:** `app/frontend/components/SimRigStream.tsx:241`.
**Fix:** `pickGear(speed: number): 0|1|2|...|8` helper with literal-typed return.

### H5. render-banner.tsx silent-corruption surface
**Source:** silent-failure-hunter B3, codex MED AREA 1.
**Location:** `app/frontend/scripts/render-banner.tsx:6-15`.
**Issue:** No PNG magic-byte validation. ImageResponse status not checked. Output path resolves from `process.cwd()` so wrong-CWD writes go silently to the wrong place. Worst case: re-render writes garbage as the canonical artifact, submission ships broken banner.
**Fix:** Anchor output path to `import.meta.url`. Status != 200 -> throw. Buffer < 8 bytes -> throw. PNG magic bytes mismatch -> throw.

### H6. SimRigStreamProps should be discriminated union forcing websocketUrl in live mode
**Source:** type-design-analyzer HIGH (direct answer to my dispatch question).
**Location:** `app/frontend/components/SimRigStream.tsx:62-65` + the runtime `role="alert"` fallback at `:148-152`.
**Issue:** Compile-time hole. `<SimRigStream mode="live" />` typechecks but throws an error on first render. Matches the anti-pattern documented in `feedback_discriminated_unions_over_contradiction.md`.
**Fix:** Promote `SimRigStreamProps` to union: `{ mode?: "simulated" } | { mode: "live"; websocketUrl: string }`. Collapse the runtime fallback to dead code.

### H7. bemyapp-banner.tsx names competitor projects verbatim in checked-in source
**Source:** comment-analyzer H4.
**Location:** `app/frontend/lib/bemyapp-banner.tsx:8-9`.
**Issue:** Top-of-file JSDoc named four competing teams in the live BeMyApp gallery to motivate the editorial-magazine-cover direction. The mod-tool attribution principle in global CLAUDE.md applies by analogy: naming competing teams in our public repo without their per-surface consent is asymmetric. The calibration source is explicitly private memory; the comment leaked the operator-association we deliberately avoid in marketing copy.
**Fix:** Softened to "Deliberate contrast with the universal dark-cinematic banner aesthetic observed across competing projects in the BeMyApp gallery (calibration source kept in private memory per the project's operator-attribution rule)."

### H8. pre-mortem.md row 46 named a competing team in a public file
**Source:** comment-analyzer M6 (tier up given anonymization-pre-consent rule).
**Location:** `docs/pre-mortem.md:90`.
**Issue:** Row 46 named a specific competing team and critiqued their banner choice. Same operator-attribution rule applies: critiquing a competing team's submission design in our own public submission's pre-mortem is asymmetric.
**Fix:** Softened to "(observed: at least one project in the live BeMyApp gallery shipped the default placeholder despite having an otherwise polished page)."

### H9. og-card.tsx silently falls back to default Satori font
**Source:** silent-failure-hunter H3.
**Location:** `app/frontend/lib/og-card.tsx:21-171`.
**Issue:** ImageResponse called with NO `fonts: [...]` array. Satori has no access to system fonts (`Georgia`, `SF Mono`, `Segoe UI`, `-apple-system`, `ui-monospace`). All system-font references fall back to Satori's bundled default (Inter). The editorial-paddock brand identity is silently lost on all 5 OG cards.
**Fix:** Extract `loadBrandFonts()` from bemyapp-banner.tsx into a shared util `lib/brand-fonts.ts`. Use in both renderers. OG cards get real Fraunces + Plex.

### H10. fetchGoogleFont has no timeout, no Content-Type check, sequential fetches
**Source:** silent-failure-hunter H1, codex HIGH AREA 1, type-design-analyzer MED #4.
**Location:** `app/frontend/lib/bemyapp-banner.tsx:39-83`.
**Issue:** No AbortSignal.timeout means a slow CDN response hangs the renderer for minutes locally / Vercel function timeout. Content-Type not validated so a 200-with-HTML-body fails opaquely. Sequential await chain at `:65-76` adds up to 800-2000ms cold render when parallel would be 250-500ms.
**Fix:** AbortSignal.timeout(10_000) on both fetches. Content-Type sniff against `font/*` + `application/octet-stream`. Promise.all the four font loads.

### H11. bemyapp-banner route returns generic 500 + caches the error for 1 hour
**Source:** silent-failure-hunter H2.
**Location:** `app/frontend/app/bemyapp-banner/route.ts:17-25`.
**Issue:** No try/catch. Cache-Control set unconditionally so a 500 from the renderer is cached on edge for 1 hour. Long-running failure surface.
**Fix:** Wrap renderer call in try/catch. On error: structured JSON body (502 + `cache-control: no-store` + fallback hint pointing at the committed PNG). On non-200 from renderer: same.

### H12. methodology + PLAN commit/route/test counts stale
**Source:** gemini Q1 + Q7.
**Locations:** `docs/methodology.md:71` ("155 commits + 4 routes + 52 tests") vs ground truth (179 + 5 + 57). `PLAN.md:56` + `PLAN.md:498` say "165+" / "175+" depending on which footer.
**Fix:** Bump all three numbers across both files. Add `/sim-rig` to the route list everywhere.

### H13. "First integrated workflow" claim is too broad against AI race-engineer field
**Source:** codex HIGH AREA 2 #2.
**Location:** Pitch Beat 5 + payload Magic Solution + banner Differentiator #1 chip.
**Risk:** Laptica + other AI race-engineer products exist. "First integrated workflow" is wide enough that a judge familiar with the AI race-engineer field can knock it down in 60 seconds.
**Fix:** Soften to "first public AI race-engineer workflow we found that uses FIA Certificate of Adaptations data to govern adaptive hand-control constraints." Lead with the COA-parameterized claim, which is the defensible differentiator.

### H14. wave-22 cold-review-brief scope: og-card.tsx claim verified, test count off by 3
**Source:** gemini Q6.
**Location:** `docs/wave-22-cold-review-brief.md:13-24`.
**Verified:** og-card.tsx DOES exist (gemini missed it; code-reviewer + comment-analyzer + silent-failure-hunter all found it). The brief is correct on this point.
**Drift:** Brief says "SimRigStream.test.tsx (NEW wave-19, 4 tests)" but the file has 4 tests in the same it() block + indirect helpers. Brief is fine.
**Fix:** No action; gemini's miss was an artifact of its file-discovery, not a real scope issue.

---

## MED (queue for next polish wave, NOT closing this wave)

| ID | Source | Location | Summary |
|---|---|---|---|
| M1 | code-reviewer M1 | `SimRigStream.tsx:40, 55-56` | `reset` action variant in reducer is dead code (no dispatcher) |
| M2 | code-reviewer M2 + silent-failure-hunter H4 | `__tests__/SimRigStream.test.tsx` | Live-mode WebSocket happy-path + reconnect loop untested. Add MockWebSocket helper. |
| M3 | code-reviewer M3, silent-failure-hunter M5 | `app/bemyapp-banner/route.ts` + 5 opengraph-image.tsx files | No explicit `runtime` declaration |
| M4 | type-design-analyzer MED | shared/types.ts SimRigFrame boundary | No structural validation on the WebSocket boundary; `as SimRigFrame` cast is a lie if shape drifts |
| M5 | type-design-analyzer MED | `bemyapp-banner.tsx:32-37` GoogleFont | Shadows next/og's Font type; install satori directly + import Font from there |
| M6 | silent-failure-hunter M3 | `SimRigStream.tsx:42-48` | Ring-buffer splice mutation pattern fragile; use `slice(-RING_BUFFER_SIZE)` instead |
| M7 | comment-analyzer M1 | `bemyapp-submission-payload.md:16` | "[PLAN task 5.14 - design + render Day 2-3]" annotation inside the form-aligned code block. Move to preamble. |
| M8 | comment-analyzer M2 | `bemyapp-banner.tsx:64-83` | `loadBrandFonts` no JSDoc on why Fraunces is fetched twice (italic 700 needs its own TTF binary per Satori font-tuple rule) |
| M9 | comment-analyzer M3 | `bemyapp-banner.tsx:41-55` | `fetchGoogleFont` regex fragility undocumented |
| M10 | comment-analyzer M4 | `og-card.tsx` | No top-of-file JSDoc; bemyapp-banner has 14 lines, og-card has zero |
| M11 | comment-analyzer M5 | `banner-brand-brief.md:67-78` | Composition ASCII diagram doesn't lock the SVG dimensions |
| M12 | plan-gap-scanner WARN #4 | PLAN row 5.14 | No acceptance criterion or rollback path on the banner task |
| M13 | plan-gap-scanner WARN #6 | PLAN row 5.15 | No acceptance criterion on the gallery-examples calibration task |
| M14 | plan-gap-scanner WARN #7 | PLAN row 6.5 | Pre-mortem rows 46-48 not cross-referenced from PLAN tasks |
| M15 | gemini Q7 #7 | methodology vs wave-19 session note | Internally inconsistent on whether 4 or 5 routes are live |
| M16 | gemini Q7 #8 | README.md | Status snapshot one day stale |
| M17 | codex MED AREA 3 #3 | bemyapp-banner.tsx right-lockup | Sector 2 / +0.34s / COA Section 3(c) is insider-coded; one plain-language anchor would help judges |
| M18 | codex MED AREA 3 #1 | banner-brand-brief.md:92 | Brief forbids ALL technical artifacts (telemetry trace, IBM badge); adding one technical cue would prevent design-theatre read |
| M19 | comment-analyzer N4 -> MED per D-004 | bemyapp-submission-payload.md:90 | "60s end-to-end on RTX 4060" needs benchmark cite |
| M20 | comment-analyzer N4 -> MED per D-004 | pitch script Beat 5 | "Track Titan ... flags her technique as driver error" is inferred from "throttle*brake=0" but unverified. Soften or verify. |

## NIT (Day 11 polish)

| ID | Source | Location | Summary |
|---|---|---|---|
| N1 | code-reviewer N1 + silent-failure-hunter B3 | `render-banner.tsx:7-10` | Hard-coded relative path; closed by H5 fix already |
| N2 | comment-analyzer N2 | both lib renderers | Palette tokens duplicated; extract to `lib/brand-tokens.ts` |
| N3 | comment-analyzer N3 | `bemyapp-banner.tsx:373` | "8 tools" count hardcoded in 3 places |
| N4 | comment-analyzer N5 | `banner-brand-brief.md:137` | wave-22 attribution in permanent file |
| N5 | type-design-analyzer NIT | reducer `default:` arm | Add `never` exhaustiveness guard |
| N6 | type-design-analyzer NIT | StreamState.mode | Removable; derive from props |
| N7 | type-design-analyzer NIT | tyre: string | Narrow to Pirelli compound union |
| N8 | type-design-analyzer NIT | t_sim vs t_session_s | Document clock-axis distinction in JSDoc |
| N9 | plan-gap-scanner NIT #8-9 | PLAN footer + wave-21 evening pass not recorded | Footer needs wave-22 update |
| N10 | plan-gap-scanner NIT #11 | D0.7 vs row 0.13 | Two ID schemes for same task |
| N11 | plan-gap-scanner NIT #12 | PLAN line 8 | "$5K across May+June" vs verified $15K total |

---

## Mechanical sweep results

```
EM-DASH SWEEP:
  docs/pre-mortem.md:22 - quoted historical artifact in row 2 (em-dashes shipped Day 1 EOD, since fixed). Self-referencing, NOT a real violation.

AI-TONE BLOCKLIST:
  docs/banner-brand-brief.md:131 - the rules-text itself listing the banned words. NOT a violation.
  PLAN.md:176 - "unlock 3 private repos" uses literal verb "unlock" (not the marketing "unlock") in row 1.13 description. Acceptable.

OPERATOR-NAME SWEEP: clean.
TSC: clean.
```

---

## Closure order (this wave)

Eight atomic commits, ordered for fewest cross-file rebases:

1. `docs(reviews): wave-22 cold review findings` (this file).
2. `docs(claims): soften pretrained-TSFM + integrated-workflow claims (B5, H13)`.
3. `docs(spec,plan): hoist simultaneity_envelope + context_length=24 + tick-rate 20Hz + brief font sizes (B1, B2, B3, B4)`.
4. `docs(plan,methodology): count drift -> 179 commits + 5 routes + 57 tests (H12, M15, M16)`.
5. `fix(privacy): anonymize competitor names in bemyapp-banner + pre-mortem row 46 (H7, H8)`.
6. `refactor(sim-rig): discriminated union + type-guard parse + pickGear + reconnect-timer cleanup + max-retry (H1, H2, H3, H4, H6)`.
7. `refactor(banner): fetchGoogleFont timeout + parallel + content-type + route error-handling + PNG magic-byte validation + og-card brand fonts (H5, H9, H10, H11)`.
8. `docs(plan): close gap-scanner WARN findings (M12, M13, M14, cross-ref pre-mortem rows 46-48)`.

MEDs M1-M20 queue for the Day-3 polish wave. NITs queue for Day-11 final.

---

## Net assessment from the seven lenses

- **Narrative coherence is genuinely strong.** Three-firsts language, dual-layer positioning, editorial-paddock identity, NeuroPit-depth panel match, audit-first framing, three-layer story all align across pitch / payload / banner / paper / README / spec.
- **Numeric drift is the highest-density miss.** Counts of commits, routes, tests, font sizes across methodology + PLAN + brand brief. Cheap to fix; ships in one commit.
- **Schema drift on simultaneity_envelope is the highest-severity miss.** types.ts is SSOT; spec + PLAN didn't follow. Risk: Vinh-side Pydantic mirror picks the legacy shape.
- **Silent-failure surface in SimRigStream is the highest demo-day risk.** Live demo "indicator on, numbers frozen" failure mode = lost sponsor track. Fixes ship in this wave.
- **Editorial-magazine-cover banner direction is well-executed but insider-coded.** Codex MED #3 is right that judges parse the right-lockup as decorative jargon without a plain-language anchor. Day-3 polish.

The most load-bearing single edit: H6 + H1+H2 (SimRigStream discriminated union + type-guard JSON.parse). Locks the highest-risk Day-9 cutover surface against compile-time + runtime drift in one refactor.

_Last updated: 2026-05-21 night-late by Stephen (wave-22 cold review consolidated)._
