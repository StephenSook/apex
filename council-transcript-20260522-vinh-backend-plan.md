# LLM Council Transcript — Vinh Backend Plan Pressure Test

**Date:** 2026-05-22
**Mode:** TECHNICAL
**Subject:** `docs/vinh-backend-plan.md`
**Question:** Pressure-test the 10-day backend execution plan. Owner has not started. Will it ship by 2026-05-31? Are gates correct, dependencies covered, sequencing realistic?

---

## Framed question

10-day backend execution plan for APEX hackathon. Covers TTM smoke test → NumPy physics validator → CvxpyLayer QP V2 → Granite Guardian BYOC → Granite-Docling/Vision intake → Granite 4.1 8B narrator → Langflow orchestration → deploy. Owner (Vinh) has NOT started backend work (Phase 0 untouched, `app/backend/apex/*` is empty `.gitkeep`, no `logs/day-02-*`, no fixtures, no requirements.txt, no venv). 8 gates G1-G8. Council should pressure-test feasibility, sequencing risk, missing dependencies, and gate-structure correctness.

User constraints: keep emotional driver-hook narrative; do not send a separate brief to Stephen.

---

## Round 1 — Advisors (7, in parallel)

### Long-Term Architect
[Response A in peer review]
Decisions age worst at package boundaries. `app/backend/apex/{physics,ttm,guardian,instruct}` nesting means every fixture, test, Langflow node imports `apex.physics.validator` by Day 11. June `physics-tsfm` carve-out = rename across test suite + paper reproducibility appendix + TouchLine reuse. Fix today, costs nothing: make `physics/`, `ttm/`, `guardian/` siblings of `apex/`, re-export from `apex`. V1 NumPy as fork (not config flag) — if V1/V2 produce different violation strings, camera-ready fixtures diverge from hackathon fixtures. Make validator return `PhysicsViolationLog` whose `.to_text()` is engine-agnostic from Day 3. Fine to defer: Langflow, Sim-rig, Docling fallback. Painful: Vercel+OpenRouter coupling bakes hosted-inference into pip-installable library.

### Contrarian
[Response B in peer review]
Plan is doomed as written. Fatal flaw #1: Day 2 gone, Phase 0 unstarted. Fatal flaw #2: "ship V1, upgrade to V2" contradicts D-A locked CvxpyLayer + NeurIPS paper §3.2. Fatal flaw #3: 9 gates in 6 working days while building 13 other things. Cut now, not Day 5: V1 NumPy floor publicly, drop Langflow to screenshot-only, kill sim-rig.

### Outsider
[Response C in peer review]
Reading cold, lost on page 1. 12+ undefined acronyms (TTM, CvxpyLayer, BYOC, COA, FIA, NIL, MOC, D-001..D-B, Convergence 14). Missing for a plan doc: env setup, Python version, requirements.txt, definition-of-done per day, API contract for Stephen, data source, fallback for blocked days, handoff points. Notes-to-self.

### First Principles
[Response D in peer review]
Strip everything. Hackathon needs a 4-minute artifact a judge can grok on a phone. D-A is self-imposed, not a judging criterion. Sarah Reynolds end-to-end IS the demo. Cut to Lite Day 3 (now). Ship Sarah loop Day 6 with NumPy-only physics, mocked Docling JSON, hardcoded Guardian rule. Days 7-11 on video and README.

### Executor
[Response E in peer review]
Aggressive but executable at 70% scope. First 4 hours: torch CUDA alone, granite-tsfm + transformers + fastf1, defer cvxpy, smoke-test TTM, pin requirements.txt. Stalls: cvxpylayers Windows builds (fall back to M2), fastf1 cache (500MB rate-limited; start hour 1), Convergence-14 underestimated (1.5 days). Cut G6-G8 to stretch. 18 honest days in 10 calendar. Add "Day 4 EOD: if cvxpylayers fails, switch to M2" gate.

### Software Lead
[Response F in peer review]
Contract mismatches: (1) Channel count off-by-one — PLAN.md defines 9 channels with `t` as 9th, but `t` is time index. `derive_simultaneity_flag` returns scalar bool; no per-step broadcast to `(batch, 24, 1)`. Tensor will be `(batch, 24, 8)` and TTM silently produces wrong forecasts. (2) Two sources of truth for simultaneity. (3) Violation-log schema drift: dataclass vs `List[dict]`. Missing tests: G3 no round-trip serializer assertion; G4 no holdout split; G6 passes on renders not correctness. Bugs: forward-Euler at 1Hz false-positives; cache invalidation absent; `audit_id: None` to UI.

### Expansionist
[Response G in peer review]
Plan ships a hackathon submission when you could ship a category. Three vectors: (1) Spin out `fia-coa-parse` PyPI Day 7. (2) Publish Convergence-14 as `physics-ttm-bench` benchmark. (3) Ship `physics-tsfm` core library Day 8 for June TouchLine reuse. Killshot: DM Nicolas Hamilton or Billy Monger with working demo for real adaptive racer in submission video.

---

## Anonymization mapping

A=Long-Term Architect, B=Contrarian, C=Outsider, D=First Principles, E=Executor, F=Software Lead, G=Expansionist.

---

## Round 2 — Peer Reviews (5, in parallel)

### Senior engineer (PR reviewer)
- Strongest: **F** (only response that audits the wiring; bugs that ship broken regardless of scope)
- Devil's advocate: **A** (package-boundary debt; two `__init__.py` files now vs cross-repo rename later)
- Biggest blind spot: **C** (wrong audience — solo backend lead's working doc, not onboarding)
- ALL missed: Nobody verified `granite-tsfm` exposes a frozen-encoder forward pass autograd-compatible with `cvxpylayers` end-to-end. If TTM forward pass isn't differentiable through to QP, V2 is dead on arrival.

### SRE / on-call
- Strongest: **E** (only response thinking like on-call; names failure points + fallbacks)
- Devil's advocate: **F** (silent tensor-shape bugs are exactly the failure that passes G1-G5 then explodes in judge demo)
- Biggest blind spot: **G** (external-person dependency on Day 3 = worst possible on-call surface)
- ALL missed: No observability (structured logging, audit_id tracing, latency SLOs). No deploy rollback for OpenRouter rate-limits. No demo-day backup for single-shot 11:59pm ET submission. fastf1 cache as SPOF.

### Security
- Strongest: **F** (data-integrity failures; you cannot audit what you cannot trust to deserialize)
- Devil's advocate: **A** (hosted-inference coupling bakes trust boundaries into pip library — supply-chain concern)
- Biggest blind spot: **D** (hardcoded Guardian + mocked Docling removes the only two adversarial-input chokepoints)
- ALL missed: PDF parser attack surface (DoS, XXE, prompt-injection in PDF body). CSV telemetry injection (NaN-pinning TTM). OpenRouter egress without PII scrubbing. Guardian text-only means serializer bug = security bypass. No signed submission artifact.

### Junior developer
- Strongest: **C** (only response naming the actual barrier to entry: 12+ acronyms, no glossary, no env setup)
- Devil's advocate: **F** (everyone argues scope; F finds bugs that ship silently wrong — worse than cut scope)
- Biggest blind spot: **G** (assumes I know who Nicolas Hamilton and Billy Monger are; most insider-coded)
- ALL missed: Nobody asked where the plan file is or if a new contributor could find a CONTRIBUTING.md or "start here" entry point.

### Future maintainer (6 months)
- Strongest: **A** (only response thinking in migration cost units; `.to_text()` engine-agnostic boundary is the seam to swap NumPy↔CvxpyLayer without divergent fixtures)
- Devil's advocate: **F** (bugs that don't surface until someone tries to reproduce Table 3 of NeurIPS paper)
- Biggest blind spot: **D** (hardcoded + mocked guarantees December maintainer inherits prototype with no extension surface)
- ALL missed: **Three-target collision** — same code must serve hackathon demo + NeurIPS artifact + PyPI library. Day 1 needs explicit public-API surface contract (`apex._internal` vs `apex.physics.*`).

---

## Peer-review vote tally

**Strongest:** F=3, E=1, C=1, A=1. **F dominates.**
**Devil's advocate:** F=3, A=2. **F appears in devil's-advocate slot 3 times — strong signal of underrated correctness.**
**Biggest blind spot:** D=2, G=2, C=1.

---

## Chairman Synthesis

[Full verdict — see section below in main response]
