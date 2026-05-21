# APEX - Architecture Specification

> Full design depth for the APEX agentic AI race engineer. PLAN.md is the coordination surface; this is the design surface.

**Status:** v0 skeleton committed Day 1 (2026-05-20). Day 2 expansion fills in the physics math, COA schema, API contracts.

---

## System overview

APEX takes three inputs from a driver, runs them through a four-stage IBM Granite pipeline wrapped in a PhysicsTTM three-layer safety architecture, and returns four outputs.

```
Inputs                Pipeline                              Outputs
──────                ────────                              ───────
telemetry CSV   ┐  ┌─ Granite-Docling (one-time, cached)
                ├─ │  Granite Vision 4.1 (one-time, cached)
COA PDF         │  │
                ├─ │  1-Hz mini-sector aggregator   ──┐
debrief text    │  │                                  │
                ├─ │  Granite TimeSeries TTM r2.1   ──┤
                │  │  (frozen, channel-independent)    │   coaching report
                │  │                                  │
                │  │  Differentiable physics projection│   tuning recommendation
                │  │  (CvxpyLayers QP)              ──┤   + COA section citation
                │  │                                  │
                │  │  Granite Guardian 4.1 BYOC     ──┤   next-session envelope
                │  │  (text audit + reasoning trace)   │   forecast chart
                │  │                                  │
                │  │  Granite 4.1 8B Instruct       ──┤   Guardian safety stamp
                │  │  (race-engineer narrator)         │   + reasoning trace
                │  │                                  │
                │  └─ Langflow (visible orchestration)─┘
                │
                └─ IBM Bob (build accelerator, off-loop)
```

Live demo runs the bottom four steps in <= 60s on RTX 4060 (post-onboarding loop, document parsing cached).

---

## Component spec

### 1. Document parsing (one-time, cached at onboarding)

**1a. Granite-Docling 258M (`app/backend/apex/intake/coa_parser.py`)**

Parses the driver's FIA Certificate of Adaptations PDF into structured JSON. Preserves Appendix L section IDs and the 9 adaptation domain headings (throttle, brake, clutch, steering, gearshift, seat / restraints, headrest / cockpit, driver equipment, chassis).

- Cache key: SHA-256 of the COA PDF bytes.
- Output schema: see PLAN.md §Shared Contracts row "FIA COA parsed JSON shape."
- Latency budget: out of critical path (cached). Cold parse 30-90s on M2.

**1a-bis. Docling library (`app/backend/apex/intake/docling_conv.py`)**

Open-source IBM Docling conversion layer (`docling` PyPI package), distinct from the Granite-Docling 258M vision model used in 1a. Wraps PDF + table conversion utilities, OCR fallbacks, and the table-extraction routines that Granite-Docling's vision pass hands off to. Counts as the 8th IBM tool independent of the Granite-Docling model itself per the README + SUBMISSION 8-tool list.

- Role: post-process Granite-Docling raw output into the structured JSON schema; handle non-vision-driven sections (text-only Appendix L preambles, PDF metadata).
- Output: cleaned `FIACoa` shape (see `app/shared/types.ts`).
- Latency budget: included in 1a's cold-parse budget.

**1b. Granite Vision 4.1 4B (`app/backend/apex/vision/timing_parser.py`)**

Parses official timing-sheet PDFs (SRO Motorsports, Britcar) into CSV. Charts and tables only, not phone photos.

- Cache key: SHA-256 of the timing-sheet PDF bytes.
- Output schema: see PLAN.md §Shared Contracts row "Timing-sheet parsed CSV shape."
- Latency budget: out of critical path. Cold parse 10-30s.

### 2. 1-Hz mini-sector aggregator (`app/backend/apex/ttm/aggregator.py`)

Aggregates raw 50 Hz telemetry (8 channels) to 1 Hz mini-sector tensors that sit inside Granite TimeSeries TTM r2.1's published minutely-to-weekly support envelope.

- Why aggregate: TTM r2 public release does not support sub-second resolution. We honor this by aggregating per mini-sector (~70 m at 150 mph).
- 9th synthetic channel: COA simultaneity bit (0 or 1) derived from the COA parse.
- Output tensor shape: `(batch, context_length=128, num_channels=9)`.

### 3. Granite TimeSeries TTM r2.1 (`app/backend/apex/ttm/forecast.py`)

Zero-shot multivariate forecaster. Frozen weights, no retraining. NeurIPS 2024 "Tiny Time Mixers" paper.

**Input tensor shape:** `(batch_size, context_length, num_channels)` where:
- `batch_size`: 1 for a single-lap analyze call, > 1 for backfill batches.
- `context_length`: 24 (one lap of 1-Hz mini-sector aggregates; typical lap covers 20-30 sectors depending on circuit).
- `num_channels`: 9 → `[throttle_pct, brake_pa, steering_rad, rpm, lat_g, long_g, speed_mps, gear, coa_simul_permitted]`. The 9th channel is a binary flag synthesized from the FIA COA parsed JSON (Section 3(c) of the driver's Certificate of Adaptations); it tells TTM that simultaneous brake-throttle was permitted at that mini-sector, which the channel-independent forecaster otherwise has no way to know.

**Output tensor shape:** `(batch_size, prediction_length, num_channels)` where `prediction_length` defaults to 24 (next session's mini-sector envelope) and `num_channels` matches the input 9.

**Defensible claim** (per Phase 4.5 mandatory edit #2): "outperforms several larger TSFMs in NeurIPS 2024 benchmarks on common forecasting tasks." We do NOT claim to outperform every TSFM.

**Honest caveat:** TTM is channel-independent by default. Cross-channel physical relationships (friction ellipse, bicycle model, kinematic step) are NOT enforced by TTM. That is the job of Layer 2 (physics projection). TTM forecasts the envelope; Layer 2 projects it onto the feasible manifold; Layer 6 (Granite Instruct) turns the projected envelope into the precision tuning delta. Two jobs split between two models per Phase 4.5 mandatory edit #13.

### 4. Differentiable physics-projection layer (`app/backend/apex/physics/projection.py`)

The novel architectural contribution. Wraps TTM's raw forecast with a differentiable QP that enforces physical feasibility per step. `cvxpylayers.torch.CvxpyLayer` implementation with a parametric QP.

Constraints (V1, ships by Gate G5):

**Friction ellipse:**

```
a_lat[t]^2 + a_long[t]^2 <= (mu_v * g)^2          for all t in [0, prediction_length)
```

where `mu_v` is a constant per-circuit friction coefficient (V1), `g = 9.81 m/s^2`, `a_lat` and `a_long` are the projected lateral and longitudinal accelerations in g. V2 (Day 5+) replaces `mu_v` with a circuit-conditional lookup `mu_v(circuit, weather)` and V3 (post-NeurIPS) replaces the constant-mu ellipse with a Pacejka load-dependent slip model.

**Forward-Euler kinematic step:**

```
speed[t] = speed[t-1] + a_long[t-1] * dt          for all t in [1, prediction_length)
```

where `dt = 1.0 s` at 1-Hz mini-sector aggregation. This couples speed-evolution to longitudinal acceleration so TTM's channel-independent forecast cannot drift the speed channel away from the acceleration channel.

**Bicycle model:**

```
a_lat[t] = (speed[t]^2 / L) * tan(steering_rad[t])          for all t in [0, prediction_length)
```

where `L = 2.69 m` is the BMW M240i wheelbase for the canned Sarah Reynolds demo case. Couples lateral acceleration to speed-squared and steering angle so TTM cannot forecast lateral G without the corresponding steering input.

**Jerk bound:**

```
|a_long[t] - a_long[t-1]| <= jerk_max * dt          for all t in [1, prediction_length)
|a_lat[t] - a_lat[t-1]| <= jerk_max * dt
```

where `jerk_max = 30 m/s^3` (conservative human + tyre tolerance). Prevents intra-second sub-grid hallucinations that the 1-Hz aggregation would otherwise hide.

**COA simultaneity flag:**

```
if coa_simul_permitted[t] == 1:
    no brake * throttle constraint  (the COA explicitly permits simultaneity)
else:
    throttle_pct[t] * brake_pa[t] == 0          (able-bodied physics; one or the other, never both)
```

The COA simultaneity flag is the 9th input channel; the constraint is constructed at QP-build time based on the channel value. This is the architectural detail that distinguishes APEX from Track Titan + Trophi.ai.

**Returns:** `(corrected_tensor, violation_log)` where `corrected_tensor` is the projected forecast and `violation_log` is a list of `PhysicsViolation` records (one per step that hit a constraint) serialized to plain English for Layer 5 audit.

The violation log is serialized to plain English for Layer 3. The serializer is treated as safety-critical code, not glue (see Convergence 14).

**Failure mode (pre-mortem row 9):** infeasible QP (no feasible solution exists for the constraint set on a given lap). V1 catches and logs infeasibility, falls back to the prior-lap baseline. V2 (Day 5+) relaxes the mu bound and logs the relaxation in the Guardian audit so the user knows the recommendation operated on a relaxed envelope.

### 5. Granite Guardian 4.1 8B BYOC text audit (`app/backend/apex/guardian/audit.py`)

Reads the structured English violation log from Layer 2 with custom Bring-Your-Own-Classifier rules. Outputs the `GuardianAudit` discriminated union (see `app/shared/types.ts`):

- `verdict: "approve" | "flag" | "reject"`. Narrows the output shape.
- `reasoning_trace: ReadonlyArray<string>`. Think-mode chain visible in the UI.
- `flagged_concerns: ReadonlyArray<string>` (only on `"flag"`). Soft warnings.
- `blocked_recommendations: ReadonlyArray<string>` (only on `"reject"`). Hard blocks.
- `audit_id: string`. Provenance key for the report's footer.

**BYOC rule schema** (concrete shape, Day 5 implementation):

```json
{
  "rule_id": "friction_ellipse_breach",
  "trigger": {
    "violation_type": "friction_ellipse",
    "severity_min": "warning"
  },
  "verdict_map": {
    "info":      "approve",
    "warning":   "flag",
    "rejected":  "reject"
  },
  "concern_template": "Friction-ellipse breach at step {step}: a_lat={a_lat:.2f}, a_long={a_long:.2f}, max_allowed={max:.2f}.",
  "block_template":   "Cannot approve recommendation - friction envelope exceeded at step {step}. Re-run with circuit-conditional mu (V2)."
}
```

Each rule fires on a `PhysicsViolation` matching `trigger.violation_type` + `trigger.severity_min`. The `verdict_map` produces the highest-precedence verdict across all matched rules (`reject` > `flag` > `approve`). Templated strings get interpolated with the violation record fields before being added to `reasoning_trace`, `flagged_concerns`, or `blocked_recommendations` per the rule's verdict.

**Convergence 14 (load-bearing safety contract):** every kinematic violation type has a unit-test fixture covering the serializer output AND the expected Guardian verdict. The textual layer is a deliberate design choice with deliberate test coverage.

### 6. Granite 4.1 8B Instruct race-engineer narrator (`app/backend/apex/instruct/narrator.py`)

Reads:
- The physics-projected forecast envelope (Layer 2 output, after Layer 3 audit)
- The driver's COA structured JSON (Layer 1a)
- The timing-sheet CSV (Layer 1b)
- The driver's debrief text

Emits:
- Corner-by-corner coaching report (Markdown)
- Tuning recommendation card with COA section citation + FIA Article reference
- 90-character pull-out one-liner for the demo

### 7. Langflow visible orchestration (`app/backend/apex/langflow/graph.json`)

Exports the full pipeline as a Langflow graph for the demo. Screenshot in the deck (Day 8). The graph is the demo's visual proof of agentic orchestration.

### 8. IBM Bob (off-loop, build-time)

Drives codebase development per the IBM × Scuderia Ferrari case-study precedent. Bob sessions committed to `bob-sessions/` directory.

---

## Frontend stack

See `app/frontend/` for the live code.

- **Framework:** Next.js 16.2.6 + React 19.2.4 (App Router, Turbopack).
- **Styling:** Tailwind CSS v4 with `@theme inline` tokens in `app/frontend/app/globals.css`.
- **Typography:** IBM Plex Sans (body), IBM Plex Mono (numerics), Fraunces (display, italic emphasis) via `next/font/google`.
- **Palette:** editorial-paddock per the Day 1 lock (see CLAUDE.md §Editorial-paddock visual identity).
- **Accessibility:** WCAG 2.1 AA from minute one (skip link, focus-visible ring, semantic landmarks, `prefers-reduced-motion` honored). Color contrast verified per token in `globals.css`.
- **Motion:** CSS-only `.apex-rise` staggered reveal. No JS animation library on the landing page.

---

## Deployment

- **Frontend:** Vercel (free tier) at `https://apex.race` (domain pending). Build via `pnpm build`. Turbopack production builds.
- **Backend:** Hugging Face Space (free tier). Dockerfile in `app/backend/Dockerfile` (Day 5). Keep-alive cron during the judging window (May 28-31).
- **Colab notebook:** `deliverables/apex-demo.ipynb` published Day 9.

---

## Verification

- `pnpm build` (Next.js 16 production build, includes TypeScript)
- `pnpm lint` (ESLint 9, eslint-config-next)
- `pytest` (Day 2+ backend tests)
- `pytest --cov=apex --cov-fail-under=70` (Day 5+ when Phase 2 ships)
- `scripts/ai-tone-sweep.sh` (em-dash + blocklist sweep, Day 11 pre-submit)
- Live curl smoke: `curl -s http://localhost:3000 | grep "APEX"`

---

## COA parsed JSON schema (mirror of `app/shared/types.ts` `FIACoa`)

Granite-Docling parses the COA PDF into structured JSON matching the `FIACoa` interface in `app/shared/types.ts`. Nine adaptation domains, each optional but at least one populated:

```ts
interface FIACoa {
  driver:   { name, impairment, license_class };
  vehicle:  { make, model, homologation };
  adaptations: {
    throttle?: FIAAdaptationDomain;
    brake?:    FIAAdaptationDomain;
    clutch?:   FIAAdaptationDomain;
    steering?: FIAAdaptationDomain;
    gearshift?:FIAAdaptationDomain;
    seat?:     FIAAdaptationDomain;
    headrest?: FIAAdaptationDomain;
    driver_equipment?: FIAAdaptationDomain;
    chassis?:  FIAAdaptationDomain;
  };
  simultaneity_envelope: {
    brake_throttle_permitted: boolean;
    coa_section_id: string;        // e.g. "Section 3(c)" for Sarah Reynolds.
    homologation_class: string;    // e.g. "Group H" Britcar Trophy compound class.
  };
}

interface FIAAdaptationDomain {
  section_id: string;              // e.g. "3.a" referencing Appendix L Article 18.3.2(a).
  description: string;             // Human-readable summary.
  constraints: ReadonlyArray<string>;  // Free text from Granite-Docling parse.
}
```

Day 1 EOD: type fully declared + tested via the wave-15 vitest suite (TuningCard + CoachingReport tests). Vinh's Pydantic mirror at `app/backend/apex/schemas.py` lands Day 2-3.

## Telemetry CSV channel spec (mirror of `app/shared/types.ts` `TelemetryChannels`)

8 instantaneous channels + `t_session_s`:

| Channel | Type | Unit | Sign convention |
|---------|------|------|-----------------|
| `t_session_s` | float | seconds | monotonic increasing within session |
| `throttle_pct` | float | percent (0-100, NOT 0-1) | always non-negative |
| `brake_pa` | float | Pascals | always non-negative |
| `steering_rad` | float | radians | positive = right turn |
| `rpm` | float | revolutions / minute | always non-negative |
| `lat_g` | float | g (1 g ≈ 9.81 m/s^2) | positive = right |
| `long_g` | float | g | positive = forward acceleration |
| `speed_mps` | float | meters / second | always non-negative |
| `gear` | int | 0-8 | 0 = neutral |

Sign conventions are binding across frontend TypeScript + backend Pydantic. Violating them requires a `⚠️ CONTRACT` commit prefix per PLAN.md §Coordination Protocol rule 10.

## Open items (Day 5+ expansion, no longer Day 2)

- [ ] FastAPI route handler signatures (`POST /api/analyze`, `GET /api/sim-rig/stream`); Vinh Day 5-6.
- [ ] Pydantic schemas mirroring `app/shared/` TypeScript types; Vinh Day 2-3 (driver_id on CoachingReport per wave-14 ⚠️ CONTRACT).
- [ ] Vinh's Granite-Docling smoke test on a real FIA COA PDF; Day 2 Gate G2.
- [ ] BYOC rule registry populated with all violation types Convergence-14-tested; Day 5 alongside Gate G5.

---

## Cross-references

- `PLAN.md` §Status dashboard for task ownership
- `PLAN.md` §Shared Contracts for API + tensor + JSON shapes
- `PLAN.md` §Decisions for D-A and D-B carrying in from PIT WALL phase
- `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_stack.md` for IBM tool version pins
- `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_qa_killshots.md` for Q&A defense pack
- `research/pit-wall-physics-constrained-foundation-models.pdf` for the Phase 5 NotebookLM-verified mitigation rationale

_Last updated: 2026-05-21 evening by Stephen (wave-19 expansion: Layer 3 TTM tensor shape + 9-channel enumeration, Layer 4 physics-projection full math equations + constraint derivations + jerk-max + wheelbase constants + V1/V2/V3 ladder, Layer 5 BYOC rule schema concrete example, COA parsed JSON schema mirror, telemetry CSV channel spec with units + sign conventions)._
