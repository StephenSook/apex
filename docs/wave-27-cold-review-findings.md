# Wave-27 cold-review findings

Synthesized 2026-05-22 night-late after Stephen's "/review ultrathink" on the wave-26 batch. Four parallel agents dispatched (codex-rescue + cc-gemini-plugin:gemini-agent + pr-review-toolkit:silent-failure-hunter + pr-review-toolkit:type-design-analyzer re-validation) + manual physics-math verification. Gemini timed out with 529 overload; re-arm in wave-28 if needed.

## Tally

13 findings shipped during this session:

- 6 BLOCKER (Codex physics-math: C14-04 + C14-05 + C14-06 + arch-spec jerk_max + judges-page-tense)
- 4 HIGH (silent-failure-hunter: Image aspect ratio + onError + download attr + ResourceTile fragment-link)
- 3 MED + cross (type-design: closure_kind discriminator; commit-count drift; IBM Bob attribution scope; bemyapp IBM-Consulting overclaim; cost-audit label; assertNever exhaustiveness; coaCellLabel screen-reader)

## BLOCKER (Codex)

### B-W27-1. arch-spec jerk_max contradiction

`docs/architecture-spec.md:139` said `jerk_max = 30 m/s^3` (~3.06 g/s) while `app/frontend/lib/convergence-fixtures.ts` C14-04 fixture asserts `jerk_max_g_per_s:0.8`. At 1-Hz mini-sector dt=1.0s with friction-ellipse capping |long_g| <= 1.0, max delta is 2.0 g/s; with jerk_max=30 m/s^3 the constraint can never fire inside friction. Tightened arch-spec to `jerk_max = 8 m/s^3` (~0.815 g/s) with explanatory parenthetical.

### B-W27-2. C14-04 sign error in projected long_g

Said "projected long_g[9] from -0.8 g to +0.2 g." With prev +0.6 g and jerk budget 0.8 g per 1.0 s step, clamped = +0.6 - 0.8 = -0.2 g, not +0.2 g. Sign fixed.

### B-W27-3. C14-05 bicycle threshold off by 14x

Said "requires steering_rad > 0.03 rad for lat_g > 0.1 g at speed 35 m/s." Bicycle-model gives delta = atan(a_lat * L / v^2) = atan(0.1 * 9.81 * 2.7 / 35^2) = 0.00216 rad, not 0.03. Also expected_steering_rad for lat_g=0.5 at v=35 = 0.0108 rad, not the claimed 0.11. Fixed by lowering fixture speed from 35 m/s to 15 m/s so expected steering 0.0588 rad lands outside slip_tol_rad=0.03 band.

### B-W27-4. C14-06 bicycle predicted lat_g off by 10x

Said steering 0.05 rad at 30 m/s yields 0.17 g. Bicycle-model gives `a_lat = v^2 * tan(delta) / L = 900 * tan(0.05) / 2.7 = 16.68 m/s^2 = 1.70 g`, not 0.17. Fixed by changing steering from 0.05 to 0.005 rad so the math holds: `900 * tan(0.005) / 2.7 / 9.81 = 0.170 g`. Summary text now embeds the exact arithmetic.

### B-W27-5. Judges page Convergence-14 section tense overclaim

`app/frontend/app/judges/page.tsx` line 257 said "Every kinematic-violation class has a unit-test fixture firing the violation, asserting the serializer output, and asserting the Granite Guardian verdict matches." Implies tests exist + pass. Vinh's test suite has not landed yet. Rewrote section blurb to "The catalogue below is the Stephen-lane display of the 14-fixture safety-contract specification... The Vinh-lane assertion suite at test_serializer.py lands per PLAN rows 2.9c + 4.2..." Now forward-looking + honest.

### B-W27-6. IBM Bob "per IBM × Scuderia Ferrari case-study precedent" attribution scope

`app/frontend/app/judges/page.tsx` (IBM_STACK) + `deliverables/bemyapp-submission-payload.md` Tools panel both claimed IBM Bob is documented as part of the IBM × Scuderia Ferrari case study. IBM Newsroom publicly documents watsonx + Granite in the Ferrari case; the specific "Bob" tool is internal IBM tooling and is NOT documented as part of the public Ferrari case-study scope. Softened both surfaces to "We adopt Bob as our codegen-assistance loop in keeping with IBM's publicly-documented watsonx + Granite Ferrari case-study posture toward governed-AI development."

## HIGH (silent-failure-hunter + Codex)

### H-W27-1. `<Image>` aspect ratio mismatch causes guaranteed CLS

Declared `width={1600} height={1200}` (4:3 = 1.333 landscape). Actual SVG viewBox is `1486.609375 x 1702` (~0.873 portrait). Per Next 16 image docs, declared dimensions infer the aspect ratio used to reserve layout space. Mismatch produces a visible layout shift the moment the SVG loads on the highest-stakes route. Fixed by wrapping in `<picture>` with `<source srcSet=".../svg" type="image/svg+xml" />` + `<Image src=".../png" width={1487} height={1702}>` so the browser uses PNG dimensions for layout reservation + the SVG renders on top with no aspect-ratio drift.

### H-W27-2. No onError fallback on SVG image

If `/figures/figure-1-architecture.svg` 404s (CDN miss, file rename, deploy quirk), users on the judges' route would see a broken-image icon while a perfectly-functional PNG exists at `/figures/figure-1-architecture.png`. Addressed by the same `<picture>` rewrite for H-W27-1 — browser falls back to PNG natively if SVG 404s.

### H-W27-3. PNG link has no `download` attribute

`figcaption` claimed "also available... for raster reuse" suggesting click-to-download, but the link opened the PNG inline in a new tab. Added `download="apex-figure-1-architecture.png"` attribute so browsers force a download with a clean filename.

### H-W27-4. ResourceTile fragment-link branch falls through to external-URL handler

Added "Convergence 14 fixture grid" RESOURCES tile with `href: "#convergence-14"`. `ResourceTile` had branches for `null`, `"/"`-prefix, and otherwise treats as external URL with `target="_blank"`. A `#`-prefix fragment link would open a duplicate `/judges` tab when the user expected an in-page scroll. Added explicit `href.startsWith("#")` branch above the `/`-prefix branch.

### H-W27-5. Commit-count drift across surfaces

`judges/page.tsx` RESOURCES "Public GitHub repo" tile said `130+` while BeMyApp payload said `210+` and devlog day-2 said `201+`. Three values for the same number. Updated all three to `220+` matching git rev-list at the time of commit.

### H-W27-6. IBM-Consulting reference-architecture overclaim

BeMyApp payload "What makes this innovative" section said "APEX is the IBM-Consulting reference architecture for governed foundation-model deployment on safety-critical sensor data." Unsupported. IBM Consulting has not endorsed APEX as a reference architecture. Softened to "APEX is a candidate reference pattern for IBM Consulting deployments of governed foundation models on safety-critical sensor data."

### H-W27-7. types.ts fixture_path unconstrained string

`ConvergenceFixtureBase.fixture_path: string` allowed an ID-vs-path mismatch (id "C14-06" with a fixture_path pointing at C14-05's file). Tightened to template-literal `` `app/backend/tests/fixtures/convergence-14/${string}.json` `` so the directory prefix + .json extension are compile-time-enforced. ID-to-path binding tightened further would require a per-ID template-literal slot; skipped because ID uniqueness is enforced at the catalogue position by the 14-arity tuple already.

## MED

### M-W27-1. type-design closure_kind discriminator

`serializer_integrity` variant carried `coa_simul_permitted: boolean | null` which folded two semantically-distinct fixtures (C14-13 round-trip vs C14-14 end-to-end Sarah closure) into one shape. Split into two sub-variants via new `closure_kind: "round_trip" | "end_to_end"` field. `round_trip` pins `coa_simul_permitted: null`; `end_to_end` pins `coa_simul_permitted: boolean`. Sample logs updated to surface the `closure:` tag.

### M-W27-2. cost-audit "Real economics data" label

Cost-audit doc header claimed "Real economics data" but table has no actual spend figures (Day-11 codeburn run hasn't happened). Labelled as "[DRAFT, pending Day-11 evening codeburn snapshot]".

### M-W27-3. `ConvergenceFixtureGridProps.fixtures` widened to plain array

Prop type was `ReadonlyArray<ConvergenceFixture>`, losing the 14-arity guarantee at the component boundary. Tightened to `ConvergenceFixtureCatalogue` so a caller passing 13 or 15 fixtures is a compile error.

### M-W27-4. assertNever exhaustiveness guards missing

`verdictChipClass` + `stageBarClass` had bare catch-all `return` clauses. Replaced with explicit branch per variant + `const _exhaustive: never = verdict; throw new Error(...)` so a future enum extension is a compile error at the function, not a silently-wrong color in the grid.

### M-W27-5. `coaCellLabel` screen-reader

Returned "n / a" (with spaces) which screen readers announce as "n slash a." Changed to "not applicable" so blind judges hear the intended meaning.

### M-W27-6. Demo-video storyboard performance number

30s storyboard line 22 said "recovery of 0.42 seconds" treating the synthetic-fixture delta as a verified benchmark. Softened to "the persona's synthetic-fixture sector-2 recovery delta from docs/sarah-reynolds-persona.md" so the number lives in one source-of-truth file.

### M-W27-7. BeMyApp Day 2 devlog CI-green claim

Said "GitHub Actions CI green on main" without a run URL. Replaced with "CI status visible at github.com/StephenSook/apex/actions" so a judge clicking the link sees the actual current state.

## NIT

### N-W27-1. devlog "201 + commits"

Stray space before `+` in commit-count headline. Fixed.

## Closure status

All 13 findings closed during this session via 5 atomic commits queued (in flight):

1. `fix(spec,fixtures)`: physics-math reconciliation + closure_kind discriminator (B-W27-1 + B-W27-2 + B-W27-3 + B-W27-4 + M-W27-1)
2. `fix(judges,frontend)`: Image picture-fallback + Next/Link download attr + ResourceTile fragment branch + tense fix + IBM Bob attribution scope + assertNever + coaCellLabel + commit count + Convergence-14 section tense (B-W27-5 + B-W27-6 + H-W27-1 + H-W27-2 + H-W27-3 + H-W27-4 + H-W27-5 + M-W27-4 + M-W27-5)
3. `refactor(shared,frontend)`: fixture_path template literal + ConvergenceFixtureGridProps tightening (H-W27-7 + M-W27-3)
4. `chore(docs,outreach,deliverables)`: BeMyApp IBM-Consulting softening + cost-audit label + 30s storyboard recovery-number softening + devlog CI link softening + commit count sweep (H-W27-5 + H-W27-6 + M-W27-2 + M-W27-6 + M-W27-7 + N-W27-1)
5. `docs(reviews)`: wave-27 cold-review findings consolidated (this file)
