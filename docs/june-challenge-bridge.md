# APEX June Challenge Bridge - Architecture & Pitch

> Mapping the APEX PhysicsTTM architecture from motorsport telemetry to the June Challenge theme (FIFA World Cup player-tracking telemetry). Day 8 task per PLAN.md Stretch S3. Pulled forward to Day 1 EOD per galaxy-tier scope. Internal planning doc + Day 8 deck slide content.
>
> **Why this exists.** The IBM SkillsBuild Grand Prize is awarded across BOTH the May Challenge ("AI Beyond the Finish Line") and the June Challenge (FIFA World Cup). To compete for Grand Prize, APEX has to credibly extend to the June theme. This doc proves the architecture transfers cleanly so a judge reading the Day 11 deck sees "the team is already executing both halves of the prize structure."
>
> **Owner:** Stephen Sookra (narrative + architecture mapping). Backend implementation: Vinh-lane Day 13+ post-submission.

---

## The architectural claim

The PhysicsTTM three-layer pattern (frozen pretrained TSFM + differentiable physics-projection + Granite Guardian text audit) is sport-agnostic. The motorsport-specific bits are:

1. **Input channels** (8 telemetry channels + COA-simultaneity flag) - motorsport-specific schema
2. **Physics constraints** (friction ellipse, bicycle model, COA-aware brake-throttle simultaneity) - motorsport vehicle-dynamics
3. **Domain narrator vocabulary** (race-engineer voice, FIA Article references, lap-time framing) - motorsport jargon

Everything else - the architectural pattern of constraining a frozen TSFM with a domain-specific physics layer + a Guardian-audited safety envelope + a Granite Instruct narrator - is generic.

For FIFA World Cup player-tracking telemetry, the substitution map is direct.

---

## Substitution map: motorsport → FIFA

| APEX layer | Motorsport instance | FIFA player-tracking instance |
|------------|--------------------|--------------------------------|
| **Layer 0 (Inputs)** | Telemetry CSV (50 Hz, 8 channels) + FIA COA + driver debrief | Player tracking CSV (25 Hz, x/y/v/a positional data) + tactical board notes + manager debrief |
| **Layer 1a (Doc parsing)** | Granite-Docling on FIA COA | Granite-Docling on tactical-formation diagrams + match-report PDFs |
| **Layer 1b (Vision)** | Granite Vision 4.1 on timing sheets | Granite Vision 4.1 on heatmap diagrams + xG charts |
| **Layer 2a (Aggregator)** | 1-Hz mini-sector telemetry tensor | 1-Hz per-phase-of-play positional tensor (build-up / transition / set-piece) |
| **Layer 2b (TTM)** | Granite TTM r2.1 zero-shot forecast next-lap envelope | Granite TTM r2.1 zero-shot forecast next-phase positional envelope (where will players be in 5s) |
| **Layer 2c (Physics)** | CvxpyLayer QP: friction ellipse + bicycle model + COA simultaneity | CvxpyLayer QP: max human acceleration (~10 m/s^2) + max turn rate + ball-distance bound + offside-line check |
| **Layer 3 (Guardian)** | Granite Guardian on text log of physics violations + COA safe envelope | Granite Guardian on text log of physics violations + tactical-instruction safe envelope (e.g., "should this winger track back to defend a counter-attack?") |
| **Layer 4 (Narrator)** | Granite 4.1 8B Instruct: race-engineer voice + COA citation | Granite 4.1 8B Instruct: assistant-coach voice + tactical-board reference |

The pattern is the same. The substitutions are content not architecture.

---

## What's hard about the FIFA mapping

1. **Player-tracking data licensing.** Motorsport telemetry is sometimes-public via FastF1; FIFA player-tracking is sold by Sportradar / StatsPerform / Genius Sports under enterprise licensing. For a 30-day June Challenge, the team would either: (a) use a public alternative (StatsBomb has free open data for select matches), (b) generate synthetic player-tracking from match videos via computer vision, or (c) license a single match dataset for the demo.

2. **No FIA-COA-equivalent binding doc.** The FIA Certificate of Adaptations is the load-bearing innovation of APEX (first AI to read it at tensor level). FIFA has no direct analogue for individual-player safety/role envelopes. The closest equivalent: **player-position-role specs** (does this player play winger or full-back; if winger, do they invert?). These are tactical, not safety-regulatory. Re-frame the COA-tensor-level claim to "first AI to read player role-spec at tensor level" for FIFA - weaker than the COA framing because role-specs aren't FIA-binding.

3. **Domain narrator vocabulary.** Race engineer voice is genre-specific (corner exit, brake pressure delta, lock-up, oversteer). Football assistant-coach voice is different (press intensity, second-ball recovery, vertical compactness). The Granite Instruct system prompt has to be re-written.

4. **Physics constraints are softer.** Friction ellipse for a car is precise (mu × g hard ceiling). Maximum human player acceleration is empirically ~10 m/s^2 for elite athletes - a soft prior, not a hard physical limit. CvxpyLayer QP can still enforce, but the constraint set is less elegant than motorsport.

---

## Pitch frame for the June submission (if entered)

**3-min video Beat structure (mirrors APEX May pitch):**

- 0:00 - 0:08: "The same architecture that wraps a frozen Granite TSFM with physics constraints for adaptive racers - now pointed at the world's biggest sport."
- 0:08 - 0:25: Why elite football needs this. Manager debrief windows are 90 seconds at half-time. Player-tracking data is overwhelming. Existing AI tactical tools (Twelve, MatchMetrics, SciSports) treat the data statistically without enforcing kinematic feasibility.
- 0:25 - 0:42: Hero use case. A specific match moment (e.g., "down 1-0 at half-time, manager has 90 seconds to decide a tactical change"). PhysicsTTM forecasts the next-phase positional envelope. Guardian audits the recommendation against player-role spec.
- 0:42 - 1:30: Same three-layer architecture, same eight IBM Granite tools, same Convergence-14 safety pattern. The substitution map (above) lives in one slide.
- 1:30 - 2:00: The killer detail. Where APEX-May reads FIA Article 18.3, APEX-June reads the tactical role-spec at tensor level. First AI to do this for elite football.
- 2:00 - 2:30: Same UI, different output. Tactical recommendation card with role-spec citation. Phase-of-play forecast chart. Guardian safety stamp.
- 2:30 - 2:50: Same stack, expanded - now ships for two sports, one architecture.
- 2:50 - 2:58: Close.

---

## What this doc commits to

This bridge doc is the **architectural commitment**, not a June implementation commitment. If APEX-May wins anything, we have a defensible Day 13+ extension story for the Grand Prize judges. If APEX-May does not win, we still hold the architectural map for any post-hackathon publication.

**One slide in the APEX-May Day 11 deck** references this doc + one diagram from the substitution map. That slide answers the implicit question "is this a one-trick architecture or a real pattern" in the judging panel's mind.

---

## What NOT to do

- **Do not start June implementation Day 12-30.** May submission is the focus. Galaxy-tier rule says ship May Core 6 + Stretch 10, then engineering-retro, then optionally entertain June.
- **Do not over-claim FIFA in the May pitch.** The May pitch should reference the June bridge ONCE in the closing beat: "same architecture, multiple sports, one IBM Granite stack." More than that distracts from the COA-simultaneity killshot.
- **Do not license enterprise player-tracking data Day 12-30** without the June Challenge actively being entered. License costs are material; defer until the team has decided to enter June.

---

## Cross-references

- PLAN.md §Scope tiering Stretch S3 (this is the doc that satisfies S3)
- `docs/3-min-pitch-script.md` Beat 7 (stack + team) - one sentence references June extension
- `docs/methodology.md` §Phase 6 build (Day 8 task)
- `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_stack.md` (IBM Granite stack reusability is the underlying claim)

---

_Last updated: 2026-05-20 Day 1 EOD by Stephen (v0 pulled forward from Day 8 per galaxy-tier rule). Day 8 final polish + deck-slide render before May submission._
