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
                │  │  Granite 4.1 Instruct 8B       ──┤   Guardian safety stamp
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

- We do not claim to outperform every TSFM. The defensible claim: "outperforms several larger TSFMs in NeurIPS 2024 benchmarks on common forecasting tasks."
- Output: `(batch, prediction_length=24, num_channels=9)` next-lap mini-sector envelope.
- Honest caveat: TTM is channel-independent by default. Cross-channel physical relationships are NOT enforced by TTM. That is the job of Layer 2 (physics projection).

### 4. Differentiable physics-projection layer (`app/backend/apex/physics/projection.py`)

The novel architectural contribution. Wraps TTM's raw forecast with a differentiable QP that enforces physical feasibility per step.

Constraints (V1, ships by Gate G5):

- **Friction ellipse:** `a_lat^2 + a_long^2 <= (mu_v * g)^2`, with `mu_v` constant per circuit.
- **Forward-Euler kinematic step:** `speed_t = speed_{t-1} + a_long * dt`.
- **Bicycle model:** `a_lat = (speed^2 / L) * tan(steering_angle)` with `L` = wheelbase.
- **Jerk bound:** `|a_t - a_{t-1}| <= jerk_max * dt` to prevent intra-second sub-grid hallucinations.
- **COA simultaneity flag:** if COA permits brake + throttle simultaneity (Team BRIT, MME hand-controls), constraint relaxed. Otherwise enforce `brake * throttle = 0`.

V2 (Day 5+, ships by Gate G5):

- **Circuit-conditional mu lookup:** `mu_v(circuit, weather)` instead of constant.
- **Pacejka full friction-ellipse:** load-dependent slip vs constant mu.

Implementation: `cvxpylayers.torch.CvxpyLayer` with a parametric QP. Returns `(corrected_tensor, violation_log)`.

The violation log is serialized to plain English for Layer 3. The serializer is treated as safety-critical code, not glue (see Convergence 14).

### 5. Granite Guardian 4.1 8B BYOC text audit (`app/backend/apex/guardian/audit.py`)

Reads the structured English violation log from Layer 2 with custom Bring-Your-Own-Classifier rules. Outputs:

- `verdict`: "approve" / "flag" / "reject"
- `reasoning_trace`: think-mode chain visible in the UI
- `blocked_recommendations`: any recommendation that violates the COA safe envelope

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

## Open items (Day 2 expansion)

- [ ] Exact COA parsed JSON schema fields (defer until Granite-Docling test on a real FIA COA example PDF on Day 2)
- [ ] Exact telemetry CSV channel names + units (defer until FastF1 slice tested on Day 2)
- [ ] Exact Guardian BYOC rule schema (defer until Day 5)
- [ ] FastAPI route handler signatures (`POST /api/analyze`, `GET /api/sim-rig/stream`)
- [ ] Pydantic schemas mirroring `app/shared/` TypeScript types

---

## Cross-references

- `PLAN.md` §Status dashboard for task ownership
- `PLAN.md` §Shared Contracts for API + tensor + JSON shapes
- `PLAN.md` §Decisions for D-A and D-B carrying in from PIT WALL phase
- `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_stack.md` for IBM tool version pins
- `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_qa_killshots.md` for Q&A defense pack
- `research/pit-wall-physics-constrained-foundation-models.pdf` for the Phase 5 NotebookLM-verified mitigation rationale

_Last updated: 2026-05-20 by Stephen (Day 1 v0 skeleton)._
