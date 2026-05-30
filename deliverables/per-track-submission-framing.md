# APEX per-track submission framing (IBM SkillsBuild AI Builders Challenge, May 2026)

Lift this copy into the BeMyApp submission. One submission enters every eligible track; it can win only the single highest prize it qualifies for, so the strategy is: enter all, and frame each track in that track's own rubric vocabulary. Lead with Best Innovative (APEX's strongest axis), then Best Technology, then the grand-prize synthesis.

Judging rubric (4 axes, reaffirmed on the May Challenge Discord 2026-05-27): Technical Execution, Innovation, Challenge Fit, Implementation & Feasibility.

---

## Best Innovative (lead with this)

**One-sentence claim.** APEX is the first AI race-engineer workflow we found that reads a driver's FIA Certificate of Adaptations as a binding safety input, so it coaches adaptive racers whose hand-controls do things able-bodied-tuned tools flag as errors.

**Why it is genuinely novel.**
- The COA-parameterized brake-throttle simultaneity gate: every other race-engineer tool hard-codes a brake-throttle mutual-exclusion. APEX reads the driver's Certificate of Adaptations and, where the hardware is approved, treats simultaneous brake-and-throttle as legal rather than as an error. No competitor in the gallery targets adaptive drivers at all.
- The architecture composition: a frozen Granite TimeSeries TTM forecaster wrapped in a differentiable convex-QP physics projection (friction ellipse + forward-Euler + jerk bound) and audited by Granite Guardian. Frozen-foundation-model plus differentiable-physics-projection is an unusual, defensible design, not a prompt-chain.
- A byte-equality serializer regression contract between the NumPy V1 and cvxpylayers V2 projectors, enforced by tests.

**Rubric mapping.** Innovation: the COA gate + the physics composition. Challenge Fit ("AI Beyond the Finish Line"): an audience the FIA only un-banned in 2017 and that current tools systematically misdiagnose.

---

## Best Technology

**One-sentence claim.** APEX is a real, running IBM Granite system: live Granite coaching verified in production, a deployed backend computing real physics, and 192 backend tests gating every commit in CI.

**The evidence (all verifiable).**
- **Live Granite, verified.** The /analyze coaching narrative is generated live by Granite 4.1 8B Instruct (via OpenRouter), confirmed responding at `phase=real` in production. The "Run the canonical demo (live backend)" path runs the canonical telemetry through the deployed FastAPI backend's LangGraph pipeline and returns real physics-projected deltas, a deterministic Guardian rule-audit, and APEX's deterministic rule-based coaching of those live numbers (the live Granite 4.1 8B narrative is the default /analyze path).
- **Honest per-tool tiers.** 14 IBM Granite tools, each carrying an explicit WIRED / INTEGRATION / ACCELERATOR status pill backed by `app/frontend/lib/ibm-stack.ts`. Three are wired live end-to-end (now powering multiple surfaces), nine are UI-complete with a documented backend swap-point routing to the live backend, two are build-time accelerators. Nothing is presented as live that is not.
- **Engineering rigor.** 192 backend tests run in CI alongside frontend type-check, lint, vitest, build, and Playwright. A WebGPU Granite 4.0 Nano edge model runs in-browser. Apache 2.0, public from day one, authentic multi-wave commit history.

**Rubric mapping.** Technical Execution: real Granite wiring + tests-in-CI + live deploy. Implementation & Feasibility: every INTEGRATION tool has a named swap-point and the backend is already deployed and healthy.

---

## Grand Prize / First Place (synthesis)

**One-sentence claim.** APEX pairs a genuinely novel idea (the COA adaptive-driver gate) with a genuinely working system (live Granite + a deployed real-physics backend + tests-in-CI) in service of a real, under-served audience.

**Why it wins across all four axes.**
- **Innovation:** the COA simultaneity gate (above).
- **Technical Execution:** live Granite verified in prod + 192 tests in CI + a deployed backend computing real output.
- **Challenge Fit:** adaptive, veteran, and grassroots racers who cannot afford a paid race engineer; the barrier moved from regulatory (lifted 2017) to economic, and APEX addresses the economic one.
- **Implementation & Feasibility:** live Vercel deploy, deployed backend, honest fallbacks everywhere, per-surface stakeholder consent (MME Motorsport, Team BRIT engineering review), and a documented swap-point for every not-yet-live tool.

**The differentiator versus the field.** Every competitor reviewed shows the same failure shape APEX avoids: a polished front-end over an AI that is broken, canned, or mislabeled on the live surface, with no tests and no dev history. APEX's honest tiers + tests-in-CI + a live deploy whose Granite path actually works is the edge the whole field lacks.

---

## Runner-up

Same submission, same evidence as Grand Prize. If the grand prize goes elsewhere, APEX's all-round strength (novel idea + working system + real mission + honest engineering) is built to land top-three on the rubric rather than excelling on a single axis and failing the others.

---

## Pre-submit per-track checklist

- [ ] Enter the grand-prize track.
- [ ] Enter Best Innovative (lead the writeup with the COA gate).
- [ ] Enter Best Technology (lead with live Granite verified + tests-in-CI).
- [ ] Confirm every track's opt-in checkbox on the BeMyApp form is ticked.
- [ ] Demo video shows: the canonical live-backend demo (real numbers), live Granite coaching responding to a debrief, the WebGPU edge model, and the COA-gate toggle.
- [ ] Public links live: app, /judges, /status, repo, video.
