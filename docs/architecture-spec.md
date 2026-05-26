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
                │  │  Stage 1 - Differentiable convex  │   tuning recommendation
                │  │  QP (CvxpyLayer):              ──┤   + COA section citation
                │  │  friction ellipse + forward-Euler │
                │  │  + jerk bound                     │
                │  │                                  │
                │  │  Stage 2 - Post-projection        │   next-session envelope
                │  │  feasibility filter:           ──┤   forecast chart
                │  │  bicycle-model + COA gate         │
                │  │                                  │
                │  │  Granite Guardian 4.1 BYOC     ──┤   Guardian safety stamp
                │  │  (text audit on combined          │   + reasoning trace
                │  │  QP + feasibility log)            │
                │  │                                  │
                │  │  Granite 4.1 8B Instruct       ──┤   coaching report prose
                │  │  (race-engineer narrator)         │   + COA + FIA Article cites
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

Open-source IBM Docling conversion layer (`docling` PyPI package), distinct from the Granite-Docling 258M vision model used in 1a. Wraps PDF + table conversion utilities, OCR fallbacks, and the table-extraction routines that Granite-Docling's vision pass hands off to. Counted as a distinct entry in the fifteen-tool IBM Granite stack at wave-46 (twelve through wave-30 D-016 baseline + wave-45 D-054; wave-30 added Granite Embedding R2 + IBM TSPulse + Granite FlowState + Granite 4.0 Nano on the wave-22 8-tool baseline; wave-46 D-058 added Granite 4.1 3B Instruct fast-path routing + Granite Speech 4.1 2B-Plus ASR + Mellea IVR loop).

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
- Output tensor shape: `(batch, context_length=30, num_channels=14)`. **Wave-30 supersedes wave-22.** The wave-22 BLOCKER B2 lock (context_length=24, num_channels=9) is replaced by the wave-30 Maximal Architecture Lock per D-010 + D-016: horizon expands from 24 to 30 mini-sectors (finer discretization for 8-tier SCP convergence stability per Appendix W30; covers wider circuits than the 20-30-sector wave-22 estimate); channels expand from 9 to 14 (8 telemetry + 1 COA flag + 5 wave-30 additions: fz_total + mu_v + pitch_rad + bank_rad + yaw_rate). The wave-22 24-sector lock was tuned for V1 single-stage projection-and-audit; wave-30 8-tier unrolled SCP benefits from the finer 30-sector grid.

### 3. Granite TimeSeries TTM r2.1 (`app/backend/apex/ttm/forecast.py`)

Zero-shot multivariate forecaster. Frozen weights, no retraining. NeurIPS 2024 "Tiny Time Mixers" paper.

**Input tensor shape:** `(batch_size, context_length, num_channels)` where (wave-30 supersedes wave-22; see line 83 reconciliation note):
- `batch_size`: 1 for a single-lap analyze call, > 1 for backfill batches.
- `context_length`: 30 (one lap of 1-Hz mini-sector aggregates at finer discretization than the wave-22 24-sector lock; matches the 30-sector horizon chosen by the wave-30 multi-model synthesis for 8-tier SCP convergence stability).
- `num_channels`: 14 → `[throttle_pct, brake_pa, steering_rad, rpm, lat_g, long_g, speed_mps, gear, coa_simul_permitted, fz_total, mu_v, pitch_rad, bank_rad, yaw_rate]`. The 9th channel `coa_simul_permitted` is a binary `c_overlap` flag derived from the approved hand-control hardware specifications recorded in the driver's FIA Certificate of Adaptations (parsed by Granite-Docling at onboarding). It tells TTM that simultaneous brake-throttle is hardware-permitted at that mini-sector, which the channel-independent forecaster otherwise has no way to know. Important: public FIA documents do not expose a discrete simultaneity field; APEX derives this flag from approved adaptation-equipment metadata, not from an explicit FIA-defined boolean. Channels 10-14 (fz_total + mu_v + pitch_rad + bank_rad + yaw_rate) are wave-30 additions feeding the 8-tier physics solver per D-016.

**Output tensor shape:** `(batch_size, prediction_length, num_channels)` where `prediction_length` defaults to 30 (next session's mini-sector envelope at wave-30 lock; was 24 pre-wave-30) and `num_channels` matches the input 14 (was 9 pre-wave-30).

**Defensible claim** (per Phase 4.5 mandatory edit #2): "outperforms several larger TSFMs in NeurIPS 2024 benchmarks on common forecasting tasks." We do NOT claim to outperform every TSFM.

**Honest caveat:** TTM is channel-independent by default. Cross-channel physical relationships (friction ellipse, bicycle model, kinematic step) are NOT enforced by TTM. That is the job of Layer 2 (physics projection). TTM forecasts the envelope; Layer 2 projects it onto the feasible manifold; Layer 6 (Granite Instruct) turns the projected envelope into the precision tuning delta. Two jobs split between two models per Phase 4.5 mandatory edit #13.

### 4. Two-stage projection-and-audit layer (`app/backend/apex/physics/projection.py`)

The novel architectural contribution. Two stages: a differentiable convex QP that handles the constraints expressible as convex inequalities, followed by a non-differentiable post-projection feasibility filter that audits the nonconvex constraints. The split is necessary because CvxpyLayer is convex-only; the bicycle-model coupling (nonlinear equality) and the COA-parameterized simultaneity gate (complementarity) cannot live inside the QP. Wave-25 propagated the paper §3.2 two-stage architecture into this spec.

#### Stage 1: convex QP projection

`cvxpylayers.torch.CvxpyLayer` implementation with a parametric QP. Decision variables per step `t`: `(a_long[t], a_lat[t], speed[t+1])`. Exogenous inputs: `(throttle[t], brake[t], steering_rad[t], speed[t])` taken from the TTM forecaster (or the previous step's accepted state). Objective: minimize the squared L2 distance between the decision-variable triple and the TTM forecast triple at step `t`.

Constraints (V1, ships by Gate G5):

**Friction ellipse:**

```
a_lat[t]^2 + a_long[t]^2 <= (mu_v * g)^2          for all t in [0, prediction_length)
```

Equivalently as a second-order cone constraint:

```
norm([a_lat[t] / (mu_y * g), a_long[t] / (mu_x * g)], 2) <= 1
```

where `mu_v` is a per-circuit friction coefficient (constant in the convex inner iterate; updated per outer iterate by the 8-tier physics linearisation per D-012 + D-015 Tier 7 Pacejka combined-slip model), `g = 9.81 m/s^2`, and `a_lat` + `a_long` are the projected lateral and longitudinal accelerations in m/s^2 (the canonical SI convention used uniformly across the `(batch, 30, 14)` tensor contract per the wave-30 lock at lines 83 + 89-94; storage convention `lat_g + long_g` is multiplied through by `g` at the QP input boundary; the friction ellipse then bounds the m/s^2 magnitudes by `mu_v * g`). The wave-22 `(batch, 24, 9)` schema is superseded by `(batch, 30, 14)` per D-010 horizon-expansion + D-016 channel-expansion. Galaxy-tier scope per D-009 + D-028 keeps the 8-tier Pacejka combined-slip + circuit-conditional `mu_v` lookup + load-transfer adjustments + tire-thermal modulation all in-scope for the 2026-05-31 submission (NOT deferred to a future version). Convex inner stage; nonlinearities handled in the unrolled SCP outer loop per D-012.

**Forward-Euler kinematic step (current-step coupling):**

```
speed[t+1] = speed[t] + a_long[t] * dt          for all t in [0, prediction_length)
```

where `dt = 1.0 s` at 1-Hz mini-sector aggregation. Couples the current-step `a_long[t]` decision variable to the next-step `speed[t+1]` via linear equality. `speed[t]` is treated as exogenous from the previous step's accepted state. Convex.

**Jerk bound:**

```
|a_long[t] - a_long[t-1]| <= jerk_max * dt          for all t in [1, prediction_length)
|a_lat[t] - a_lat[t-1]| <= jerk_max * dt
```

where `jerk_max = 8 m/s^3` (approximately 0.815 g per second; tighter than the upstream human-tolerance ~30 m/s^3 bound because the 1-Hz mini-sector aggregation already smooths intra-second jerk, so a tighter inequality at 1-Hz dt keeps the constraint load-bearing at the spec's sampling rate). Prior-step `a_·[t-1]` treated as exogenous. Pair of linear inequalities, convex. Prevents inter-mini-sector hallucinations where TTM would otherwise forecast physically-implausible sign reversals in long_g or lat_g across adjacent 1-Hz steps. The Convergence-14 fixture C14-04 exercises this bound at the 0.8 g/s headline number; both values reconcile via 8 m/s^3 / 9.81 m/s^2 ≈ 0.815 g/s.

**Sampling-rate caveat (per Rajamani vehicle dynamics + Vinh's physics-ttm-neurips-methods.md §4).** Rate constraints (jerk and steering-rate) in production vehicle-dynamics practice activate at >=10 Hz sampling rates where intra-second driver inputs are not aliased. The C14-04 1 Hz fixture is a deliberate demo simplification: at 1 Hz aggregation, sub-second inputs collapse into the aggregate window and the jerk constraint catches inter-mini-sector sign reversals rather than the full rate violation surface a >=10 Hz pipeline would. Production telemetry deployments should route the jerk-bound at >=10 Hz on the raw 50 Hz upstream signal before mini-sector aggregation. The hackathon demo uses 1 Hz aggregation because the public TTM r2.1 backbone is trained on 1 Hz mini-sector tensors and the inter-mini-sector hallucination surface is the load-bearing failure mode our review process targeted; the >=10 Hz production trajectory is documented in `paper/physics-ttm-methods.md` per wave-30 D-011 multi-frequency coexistence + D-015 8-tier in-scope physics (all in-scope for 2026-05-31 submission; no deferral hedge).

**Stage 1 returns:** `(qp_corrected_tensor, qp_violation_log)` where `qp_corrected_tensor` is the projected forecast and `qp_violation_log` is a list of `PhysicsViolation` records (one per step that hit a convex-constraint bound). Differentiable end-to-end through the projection (gradient methods can backprop through Stage 1 if a future user wires the projection layer into a TTM-aware training loop).

#### Stage 2: post-projection feasibility filter

Audits the nonconvex constraints outside the convex QP. Not differentiable through the audit decisions; this is a structured accept/reject filter on the Stage-1 output.

**Bicycle-model audit (low-slip kinematic approximation):**

```
a_lat_hat[t] = (speed[t]^2 / L) * tan(steering_rad[t])          # kinematic bicycle expected lateral acceleration
flag violation when |a_lat[t] - a_lat_hat[t]| > slip_tolerance
```

where `L = 2.69 m` is the BMW M240i wheelbase for the canned Sarah Reynolds demo case, `steering_rad[t]` is the road-wheel angle (not steering-wheel angle), and `slip_tolerance` is a V1 constant (specific value committed at Gate G5 land, reported in the paper §4.1 at camera-ready). The kinematic bicycle approximation holds only at low tire-slip; at racing speeds, tire slip makes the equality fragile, so this is an audit, not a hard projection equality.

**COA-parameterized simultaneity gate:**

```
if coa_simul_permitted[t] == 1:
    audit accepts any (throttle[t], brake[t])    # the COA explicitly permits simultaneity
else:
    flag violation when throttle[t] > eps AND brake[t] > eps    # able-bodied complementarity
```

where `eps` is a small numerical tolerance (specific value committed at Gate G5 land, reported in paper §4.1 at camera-ready) chosen to avoid floating-point edge cases. The COA simultaneity flag is the 9th input channel; the audit consults the channel value per step. The novelty is the upstream tensor parameterization: the driver's FIA Certificate of Adaptations parsed JSON object is reduced to a binary flag that occupies the 9th channel of the TTM input tensor, so the regulatory document parameterizes audit behavior at the tensor level. This is the architectural detail that distinguishes APEX from Track Titan + Trophi.ai.

**Stage 2 returns:** `feasibility_log`, a list of `PhysicsViolation` records (one per step that failed the bicycle audit OR the COA simultaneity audit). Concatenated with the Stage 1 `qp_violation_log` to form the combined `violation_log` consumed by Layer 5.

**Combined returns from Layer 4:** `(corrected_tensor, violation_log)` where `corrected_tensor` is the Stage 1 projected forecast and `violation_log` is `qp_violation_log + feasibility_log`. The serializer (Convergence-14) treats both violation classes uniformly downstream.

**Failure modes:**
- (pre-mortem row 9) Infeasible Stage 1 QP. V1 NumPy floor (APEX Lite ship-floor per D-028) catches and logs infeasibility, falls back to the prior-lap baseline. The galaxy-tier maximal architecture (per D-012 unrolled SCP outer loop + D-022 lexicographic COA constraint hierarchy) relaxes the mu bound via Tier-2/3 elastic slacks and logs the relaxation in the Guardian audit so the user knows the recommendation operated on a relaxed envelope.
- Stage 2 audit-failure: if the audit flags a violation, the projected tensor still ships downstream; the audit annotates the violation in the log so Layer 5 Guardian can decide approve/flag/reject. The audit never modifies the projected tensor.

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
  "block_template":   "Cannot approve recommendation - friction envelope exceeded at step {step}. Re-run with circuit-conditional mu lookup (galaxy-tier D-015 Tier 5 thermal-conditioned mu)."
}
```

Each rule fires on a `PhysicsViolation` matching `trigger.violation_type` + `trigger.severity_min`. The `verdict_map` produces the highest-precedence verdict across all matched rules (`reject` > `flag` > `approve`). Templated strings get interpolated with the violation record fields before being added to `reasoning_trace`, `flagged_concerns`, or `blocked_recommendations` per the rule's verdict.

**Convergence 14 (load-bearing safety contract):** every kinematic violation type has a unit-test fixture covering the serializer output AND the expected Guardian verdict. The textual layer is a deliberate design choice with deliberate test coverage.

### 6. Granite 4.1 8B Instruct race-engineer narrator (`app/backend/apex/instruct/narrator.py`)

Reads:
- The physics-projected forecast envelope (Stage 1 `corrected_tensor` from Layer 4, with the Stage 2 feasibility verdict carried in the combined `violation_log`; Granite Guardian audit decision from Layer 5 also attached)
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

- **Frontend:** Vercel (free tier) at `https://apex-one-black.vercel.app` (domain pending). Build via `pnpm build`. Turbopack production builds.
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
  // Hoisted from the previous `simultaneity_envelope` sub-object to top-level
  // per wave-19 type lock; this is the LOAD-BEARING flag of the entire project,
  // so it sits at the same nesting depth as driver + vehicle + adaptations.
  // Wave-22 cold review BLOCKER B1 caught the lingering sub-object shape in
  // this spec + PLAN.md Shared Contracts row and aligned both to types.ts.
  coa_simul_permitted: boolean;     // c_overlap flag derived from approved hand-control hardware specs in the parsed COA. e.g. true for Sarah Reynolds' synthetic COA where her Section 3(c) records dual-stage trigger hardware.
  brake_travel_adjustable_mm?: readonly [number, number];   // optional [min, max] in mm.
  fia_section_refs: ReadonlyArray<string>;   // Pointers into the parsed COA structure (e.g. "Appendix-L/3(c)" referring to the FIA Appendix L regulatory anchor + Section 3(c) of the parsed driver-specific COA). Used by the citation chip on the coaching report. Never references a fabricated FIA-internal field.
}

interface FIAAdaptationDomain {
  section_id: string;              // Pointer into the parsed COA (e.g. "3.a" referencing Section 3.a of the driver-specific COA document; the FIA Appendix L anchor lives in fia_section_refs above).
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

---

## Appendix W30: Wave-30 Maximal Architecture Lock (2026-05-22)

Per Stephen's galaxy ambition directive + 9-source multi-model deep-research synthesis at `research/wave-30/`. Decision-log D-009 through D-028 are the granular locks. This appendix overlays the wave-30 maximal architecture on top of the layered spec above, expanding Layer 2 + Layer 4 + Layer 5 + adding Layer 0 + Layer 7 + Layer 8 conditioning. Prior deferral labels are RETIRED per D-009 + D-028. Everything below is in-scope for 2026-05-31.

### Layer 0 - Edge / Client Plane (NEW per D-019 + D-021)

**Component.** Next.js 16 + React 19 + TypeScript on Vercel. WebGPU Granite 4.0 Nano 350M via Transformers.js for offline browser inference.

**Scope (D-021 scope cut).** Browser runs ONLY a 30-line Newton friction-ellipse projection (`||(a_lat, a_long)||_2 <= mu_v * g`, sub-microsecond per step). NOT the 8-tier SCP solver. The Nano model produces a draft post-race summary; the server overwrites the draft on reconnect (server-authoritative). The edge model is only allowed to claim things the friction-ellipse projector can independently verify. No mechanical recommendations (e.g. specific brake-travel deltas) allowed offline.

**Data contract.** FastAPI multipart contract upstream (frontend -> backend): `multipart/form-data` payload of telemetry CSV + COA PDF + debrief text + JSON-stringified metadata. Edge summary -> server reconcile contract: `{ edge_summary: string, edge_friction_verdict: "safe" | "review", edge_audit_id: string }` returned to server on reconnect for verdict-overwrite reconciliation.

### Layer 2 expansion - Polyphase + FlowState + 1Hz preprocessor (D-011)

**Three concurrent paths.** Raw 50 Hz telemetry from CSV upload runs through three preprocessors simultaneously:

- **Path A (1 Hz aggregation, the coarse backbone).** Boxcar / FIR decimation to 1 Hz mini-sector tensor. Operating rate 1 Hz. Feeds TTM r2.1 channel-mix forecaster (Track 1).
- **Path B (polyphase decomposition, the exact detail preserver).** 50 Hz signal mathematically split into 50 separate 1 Hz phase streams: `x_r[k] = x[50k + r]` for r in 0..49. Each phase stream is a 1 Hz tensor. Shared-weight TTM processes all 50 phase streams along the 1 Hz axis; cross-phase mixer learns sub-second structure; outputs interleave to a 50 Hz forecast. Operating rate 1 Hz internally, 50 Hz at output.
- **Path C (Granite FlowState, the irregular rate-invariant path).** Sampling-rate-invariant continuous-time state-space model. Operating rate native 50 Hz, requires no rate conversion. Used for channels that cannot be polyphase-downsampled cleanly + handles irregular latencies / packet drops / dual-indexing.

**Mathematical guarantees.** Path B retention of all 50 native samples (no information loss); aliasing prevention (50 phase streams bypass the 0.5 Hz Nyquist ceiling that boxcar aggregation imposes); Path A backward compatibility with TTM r2.1's 1 Hz pretraining envelope.

**Anomaly head.** IBM TSPulse (1M params) reads the polyphase phase streams + flags time-frequency anomalies before the forecasters consume them.

**Output contract.** PolyphaseTensor of shape `(B, 50, 30, 14)` for Path B (Batch x Phase x Horizon x Channels) plus the Path A 1 Hz tensor of shape `(B, 30, 14)` plus the Path C native-rate stream. All three fan out to Layer 3.

### Layer 3 expansion - Three-track forecasting ensemble (D-010)

**Track 1: Granite TTM r2.1 with channel-mix decoder fine-tune + exogenous infusion.** Reads Path A 1 Hz tensor + Path B polyphase streams. Channel-mix decoder fine-tuned on ~5% of target data as a personalization head (frozen backbone, fine-tuned head only). Exogenous infusion: known control channels (throttle / brake / steering) fed as exogenous conditioning so TTM's forecast respects driver intent.

**Track 2: Granite FlowState r1.1 (18.5M params; upgraded from r1.0 9.1M per March 2026 release with CauKer synthetic data + 4096 pre-training context + 2x larger MLP + output gating).** Reads Path C native 50 Hz channels directly. Sampling-rate-invariant continuous-time SSM. Output at native 50 Hz.

**Track 3: Amazon Chronos-2.** Zero-shot probabilistic baseline. Outputs 21 quantiles per channel; maps uncertainty corridor (0.1 / 0.5 / 0.9 bands) for the next-session envelope.

**Fusion.** All three tracks output (B, 30, 14)-shaped tensors (Path A + Track 1 + Track 3) and (B, 50, 30, 14) from Path B + Track 1 polyphase. Layer 4 projection upsamples Path A to 50 Hz and fuses with Path B + Path C + Track 3 quantile bands.

**Sync Point 1 contract.** The (B, 30, 14) tensor contract supersedes the wave-22 (B, 24, 9) lock per D-010 horizon-expansion + D-016 channel-expansion (see Layer 3 input-tensor lines 89-92 for the reconciliation note). Horizon expands from 24 to 30 mini-sectors (finer 8-tier SCP convergence grid); channels expand from 9 to 14 (8 telemetry + 1 COA flag + 5 wave-30 physics additions). Channels enumeration locked: `[throttle_pct, brake_pa, steering_rad, rpm, lat_g, long_g, speed_mps, gear, coa_simul_permitted, fz_total, mu_v, pitch_rad, bank_rad, yaw_rate]` (14 channels per D-016 expanded schema; original 9 + 5 new for 8-tier physics: fz_total (Tier 4) + mu_v (Tier 5) + pitch_rad + bank_rad (Tier 1) + yaw_rate (Tier 8)). Existing wave-22 fixtures + tests pad with zeros on channels 9-13 (placeholder) + extend the time axis from 24 to 30 by repeating the last mini-sector value; D-027 SCP gate validates the new schema end-to-end before Phase 1+ ships.

### Layer 4 expansion - 8-tier unrolled SCP physics-projection (D-012 + D-015)

**Outer loop: unrolled Sequential Convex Programming, fixed 3 iterations.** Convex QP becomes inner iterate. Non-convex 8-tier physics handled by first-order Taylor linearization around the previous iterate, fed back into the inner solver. Convergence criterion is the fixed 3-iteration unroll (not dynamic tolerance) so PyTorch's backward pass remains deterministic and gradient flow reaches the TTM channel-mix decoder.

**Inner iterate: cvxpylayers convex QP with SOCP friction-ellipse constraint.** cvxpylayers locked per D-013 (qpth lacks SOCP; theseus only applies soft constraints).

**The 8 tiers (executed inside the SCP outer loop, all in-scope):**

1. **3D track geometry (Tier 1).** Project gravity vector using GPS pitch + bank. Constraints: `g_track = g * (cos(pitch) * cos(bank) [vertical], -sin(pitch) [longitudinal], sin(bank) * cos(pitch) [lateral])`. Adds banking-conditional friction-ellipse rotation.
2. **Aerodynamics (Tier 2).** Pitch-sensitive front/rear downforce loads. `F_z_aero = 0.5 * rho_air * Cl(pitch) * A * v^2`. Expands the friction-ellipse `(F_z_total = F_z_static + F_z_aero) * mu_v` per axle.
3. **Adaptive hand-control dynamics (Tier 3).** Disable `throttle * brake = 0` complementarity constraint if COAParameters.c_overlap = true. Replace with a `c_overlap`-conditional lexicographic constraint per D-022.
4. **Load transfer (Tier 4).** Double-track lateral + longitudinal elastic weight transfer. `dFz_lat = m * a_y * h_cg / (track * 2)`; `dFz_long = m * a_x * h_cg / wheelbase`. Per-corner friction-ellipse becomes per-corner-`F_z`.
5. **Tire thermal + degradation (Tier 5).** Modulate peak friction `mu_v` based on thermodynamic state. Two-mass thermal model: tire-core + tire-surface; degradation decreases peak `mu_v` over lap time. `mu_v(T_surface, lap_count)`. **Note on T_surface:** `T_surface` is a per-step learned/derived INTERNAL STATE of the SCP solver (computed from the two-mass thermal ODE), NOT an input channel of the 14-channel tensor. Initial `T_surface(t=0)` defaults to ambient-plus-warmup per circuit metadata; subsequent steps evolve via the thermal model. The 14-channel input tensor stays at 14 (no 15th temperature channel needed).
6. **Transient tire dynamics (Tier 6).** Relaxation-length ODE: `tau_y * d(slip_y)/dt + slip_y = slip_y_steady_state`. Per D-014, inner SCP solver uses steady-state algebraic substitution; full transient dynamics reserved for offline validation only (`tests/transient_tire_offline_validation.py`).
7. **Full Pacejka tire model (Tier 7).** Combined-slip heart-shape boundaries. `F_x, F_y = pacejka(s_x, s_y, F_z, mu_v, T_surface)` via Magic Formula. SCP outer loop linearizes Pacejka around previous iterate; cvxpylayers inner solver enforces the linearized half-spaces.
8. **Vehicle kinematic integration (Tier 8).** Newton-compliant `m * a = F_total`, `dot{v} = a`, `dot{omega} = F_lateral * arm / I_z`. Final integration enforces consistency across the 30-step horizon.

**Numerical hazards resolved (D-014):**

- **v_x near-zero gradient singularity.** Slip-ratio denominator becomes `(v_x + epsilon)` with `epsilon = 0.5 m/s`. For `v_x < 1 m/s`, tire forces saturate via `torch.tanh(slip / threshold) * F_z * mu_v` (smooth, gradient-preserving).
- **Stiff-ODE problem in Tier 6.** Inner solver substitutes steady-state algebraic form. Backward Euler / torchdiffeq fallback path documented in `vinh-backend-plan.md` Phase 2 if transient dynamics are strictly required at runtime.

**Lexicographic COA constraint hierarchy (D-022):**

- **Tier-0 (inviolable):** kinematic feasibility (vehicle stays on track).
- **Tier-1 (inviolable):** regulatory safety (no input violating FIA Appendix L homologation).
- **Tier-2 (elastic slack):** COA hardware permissions (c_overlap flag).
- **Tier-3 (elastic slack):** COA hardware constraints (steering-lock limits, brake-actuation envelopes).

If a corner becomes kinematically impossible under all COA Tier-2/3 constraints, the SCP solver relaxes Tier-2/3 via slack variables. The relaxation emits a Guardian audit signal (the report explicitly names which COA constraint was relaxed + why).

**Output contract.** `(projected_tensor: (B, 30, 14), violation_log: List[ViolationRecord], scp_iterates: List[ConvergenceTrace], physics_confidence: float, tier_slacks: Dict[int, float])`. Layer 5 + Layer 7 + Layer 8 all consume from this contract.

### Layer 5 expansion - LangGraph + MCP + ContextForge orchestration + RAG (D-017)

**Substrate.** LangGraph stateful state-machine graph wraps the backend. All numerical tools (polyphase preprocessor + anomaly detector + three-track forecaster + SCP projector + RAG retriever + narrator + tri-agent critic + Guardian audit) exposed as standardized tools via Model Context Protocol (MCP), routed through IBM ContextForge API Gateway.

**Langflow demotion.** Langflow is retained but demoted from runtime to top-level visual demo facade. Renders on /judges as the orchestration screenshot judges see; does NOT execute the backend graph.

**RAG layer.** Granite Embedding R2 (149M encoder, 47M query) drives hybrid dense + sparse retrieval against a vector store of: (a) vehicle setup guides, (b) racing theory, (c) adaptive-equipment specifications (MME Motorsport documented permission for brake-throttle simultaneity; per consent-log §1 corporate-only attribution).

**GEPA reflective prompt optimization (D-019 item 3).** DSPy-driven offline prompt evolution against APEX-Bench faithfulness metric. Output: optimized system prompts for the narrator + tri-agent critic + Guardian BYOC rule strings. Lives in `app/backend/apex/prompts/` with version-tagged generations.

**Gradient bridge two-regime seam (D-020).** Gradients flow above the SCP projector output (TTM channel-mix decoder + physics projection trained by gradient descent + cvxpylayers implicit differentiation through 3 SCP iterations). Below the seam (Mellea repair + tri-agent critic + prompts) optimized by DSPy / GEPA reflective evolution. No end-to-end backprop attempted through Mellea text repair or Chronos-2 API (structurally broken; would burn days of build time on impossible math).

### Layer 6 expansion - Narrator + EAGLE-3 + aLoRA inference plane (D-019 items 2 + 4)

**Narrator.** Granite 4.1 8B Instruct as primary planner + drafter.

**EAGLE-3 speculative decoding (D-019 item 4).** vLLM serving EAGLE-3 draft model alongside Granite 4.1 8B target. 2-6x wall-clock speedup. Hits 15s coaching-report generation budget (G8 latency target tightened from 60s ceiling).

**aLoRA hot-swap (D-019 item 2).** Activated LoRA adapter for the "race-engineer intrinsic" loaded dynamically into vLLM memory without KV-cache recomputation. Lets the same Granite 4.1 8B base serve both general race-engineer + adaptive-driver-specialized + grassroots-specialized modes via aLoRA swap.

**Output.** Draft CoachingReport (corner narratives + tuning heuristics + provenance footer scaffold).

### Layer 7 - Tri-agent critic loop + Mellea IVR repair (NEW per D-018)

**Tri-agent panel (parallel execution):**

- **Physics-Critic.** Small Granite Instruct fine-tune. Reads projected tensor + violation log. Challenges draft report's physics claims (e.g. "the report says the driver can brake later, but the projected tensor shows friction-ellipse saturation at the proposed entry speed").
- **Pedagogy-Critic.** Small Granite Instruct fine-tune. Reads draft + COA structure. Challenges recommendation coachability (e.g. "the report recommends a brake-travel reduction the driver's COA section 3(c) hardware spec cannot mechanically execute").
- **Guardian-Safety.** Granite Guardian 4.1 BYOC safety pass with hybrid-thinking mode (`<think>` for reasoning trace + `<no-think>` for low-latency verdict).

**Mellea IVR repair (loop_budget = 3).** If any critic flags, IBM Mellea Instruct-Validate-Repair loop revises the report. Caps at 3 iterations to bound latency.

**Output.** Verified CoachingReport (Tier-1 safety + Tier-1 physics + Tier-1 pedagogy all pass).

### Layer 8 expansion - Granite Guardian audit + Physics-confidence detector (D-024)

**Physics-confidence detector.** Mahalanobis-distance detector over real-time telemetry vs assumed Pacejka tire parameter limits + thermodynamic state envelope. Calibrated against APEX-Bench OOD axis. Threshold = X (calibration TBD wave-30 Day 5).

**Guardian conditioning.** Granite Guardian 4.1 receives `(violation_log, projected_tensor, physics_confidence, scp_iterates, tier_slacks)`. BYOC rule extended: "The assistant message describes a kinematically valid vehicle trajectory consistent with the driver's certified control adaptations AND the underlying physics model is in-distribution for this session (Mahalanobis distance under threshold)."

**Verdict downgrade rule.** If physics-confidence detector signals OUT-OF-DISTRIBUTION, Guardian downgrades verdict from SAFE -> REVIEW (or SAFE -> UNSAFE if Tier-0/1 also violated). Verdict downgrade reason is explicit in the audit trail.

**TSPulse anomaly feed.** TSPulse anomaly score also feeds Guardian conditioning so Layer 2 anomalies surface in the Layer 8 verdict.

### Layer 8 output + provenance footer

**SafetyVerdict JSON.** `{ verdict: "SAFE" | "REVIEW" | "UNSAFE", reason_codes: List[str], physics_confidence: float, mahalanobis_distance: float, tspulse_anomaly_score: float, tier_slack_relaxations: Dict[int, float], audit_id: str }`.

**Provenance footer extended.** ProvenanceFooter schema (per `app/shared/types.ts:258`) extends with: `granite_embedding_r2_version`, `granite_flowstate_version`, `granite_nano_version`, `tspulse_version`, `chronos2_version`, `cvxpylayers_version`, `scp_iterations_used`, `physics_confidence_score`. 12 model versions total (was 5; added 4 from D-016 expanded stack + 3 from new layers + cvxpylayers + scp_iterations).

### 4 Hard Sync Points (per source 09 Q6)

1. **Sync Point 1 (Day 1-2):** Data contract lock. FastAPI multipart contract + (B, 30, 14) tensor contract (now expanded to 14 channels). Independent of TTM org-invite. Vinh ships Day 1.
2. **Sync Point 2 (Day 4-6):** Orchestration end-to-end. LangGraph + MCP + ContextForge dummy run from ingestion through RAG to frontend.
3. **Sync Point 3 (Day 7-9):** Physics projection convergence. Three-track forecast tensor flows through 8-tier unrolled SCP without crashing or vanishing gradients. FCVR = 0.00 on Sarah Reynolds canned fixture.
4. **Sync Point 4 (Day 10-12):** Final evaluation lock. LIPS 4-axis ablation table populated; APEX-Bench prepared for public release; FCVR = 0.00 verified; 60-second industrial-readiness latency budget met (with 15s coaching-report generation via EAGLE-3 + aLoRA).

### Day-3 SCP go/no-go gate (D-027)

Single most important checkpoint in 12-day build. **Today: Day 3 = 2026-05-22.** Vinh prototypes 3 unrolled SCP iterations through cvxpylayers with 8-tier Pacejka linearization on RTX 4060 in a 6h time-box. Logged in `logs/day-03-scp-go-no-go.md`.

**Pass criterion.** Gradients flow end-to-end (TTM channel-mix forecast through SCP projection without exploding / vanishing); FCVR = 0.00 on Sarah Reynolds canned fixture.

**Fallback ladder.**
1. **Fallback 1:** Drop to 2 SCP iterations + trust-region penalty if 3 oscillates. Re-run.
2. **Fallback 2:** Escalate to D-A revision (`docs/decision-log.md` entry D-A-revision-wave-31) if 2 also oscillates.

Blocks everything in Phase 1+. Vinh does NOT proceed to TTM smoke / FlowState integration / Chronos-2 integration / RAG / LangGraph until D-027 passes or escalation logged.

### Cross-references

- `research/wave-30/README.md` - source manifest
- `research/wave-30/09-notebooklm-synthesis-2026-05-22.md` - architectural source-of-truth
- `docs/decision-log.md` D-009 through D-027 - granular architectural locks
- `docs/vinh-backend-plan.md` - Vinh's day-by-day execution plan (wave-30-revised gate map)
- `paper/apex-neurips-workshop-2026.md` §3 - paper exposition of this maximal architecture (rewrite landing wave-30 atomic commit)
- `paper/physics-ttm-methods.md` - companion methods spec (landing wave-30 row 6.7c per Vinh adoption design)
- `PLAN.md` - status snapshot + day-by-day task rows reflect this lock

---

_Last updated: 2026-05-22 night-late by Stephen (wave-30 Maximal Architecture Lock: 8-tier physics in-scope, unrolled 3-iteration SCP outer loop wrapping convex QP inner stage, three-track forecasting ensemble TTM r2.1 + FlowState + Chronos-2, multi-frequency 1Hz + polyphase + FlowState coexistence with 50Hz feasible-lift projector unifier, 12-tool Granite stack, LangGraph + MCP + ContextForge orchestration with Langflow demoted to demo facade, tri-agent Agent-as-Judge critic loop + Mellea IVR repair, 5 shouldn't-be-possible moves (WebGPU Granite Nano + aLoRA + GEPA + EAGLE-3 + Agent-as-Judge), Tikhonov damping + stiff-ODE steady-state substitution, gradient bridge two-regime seam at SCP output, WebGPU offline scope cut, lexicographic COA hierarchy with elastic slacks, MLPerf tolerance-banded reproducibility, Physics-confidence detector via Mahalanobis-distance, NeurIPS central claim + APEX-Bench public release; full lock in Appendix W30 above)._
