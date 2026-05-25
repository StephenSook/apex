# APEX - Q&A Defense Pack (Five Flashcards)

> Five rehearsed flashcards covering the five highest-probability attacks an IBM SkillsBuild judge could raise during the 5-minute Q&A after the 3-minute pitch on 2026-05-31. Memorize verbatim. Each card delivers in 30 seconds. Both Stephen and Vinh memorize all five.
>
> **Owner:** Stephen Sookra. **Internal canonical rehearsal source** (private to operator setup, with NAMED operators for grounded internal rehearsal): `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_qa_killshots.md`. **This file** is the PUBLIC-anonymized mirror per `feedback_anonymization_pre_consent.md`: operator names redacted to role descriptions until per-surface consent confirmed. If consent arrives, this file gets renamed-back in a `⚠️ CONTRACT`-prefixed commit. **Cross-references:** PLAN.md tasks 2.4, 2.8, 2.13, 3.5, 4.11, 6.11 (rehearsal schedule).
>
> **Rehearsal protocol.** Three hostile passes minimum. Solo pass Day 6 (paired) + paired pass Day 8 + hostile pass Day 9 + final cold pass Day 11 evening.

---

## Card 1 - Deep Dynamics attack (Tuesday Day 1, after Beat 4 of pitch)

**Q:** Isn't this just Deep Dynamics with an IBM logo? They already built a Physics Guard layer for autonomous race cars.

**A:** Deep Dynamics is a brilliant precedent solving a different problem. They trained a bespoke neural network from scratch on race-car data. APEX takes a frozen general-purpose foundation model (Granite TTM, pretrained on weather and retail) and wraps it with a two-stage projection-and-audit layer at inference: Stage 1 is a differentiable CvxpyLayer convex QP that enforces the convex constraints, Stage 2 is a post-projection feasibility filter that audits the nonconvex constraints. We aren't building a custom PINN. We're constraining an off-the-shelf TSFM. No prior published work does that for vehicle dynamics without retraining.

**Why this lands.** Accepts the precedent honestly, then names the architectural distinction in one clean sentence (frozen-and-wrapped vs trained-from-scratch). Don't argue against Deep Dynamics. Argue for the paradigm.

---

## Card 2 - Kinetic Hallucination attack (Day 2 memorization, drilled Day 6+)

**Q:** TTM was trained on energy grids and weather. How do you stop it forecasting physically impossible telemetry, like 4G lateral with zero steering, or speed increasing with throttle at zero?

**A:** That's exactly the problem PhysicsTTM solves. Every TTM forecast step passes through a two-stage projection-and-audit layer. Stage 1 is a differentiable CvxpyLayer convex QP enforcing the friction ellipse (total acceleration bounded by mu times g in m/s squared), the forward-Euler kinematic step tying speed to longitudinal acceleration, and a jerk bound. Stage 2 is a post-projection feasibility filter auditing the bicycle-model coupling between lateral G, steering angle, and speed, and the COA-parameterized brake-throttle simultaneity gate. Both audited constraints are nonconvex and cannot live in CvxpyLayer's Disciplined Convex Programming form. Stage 2 is an accept-reject filter on the Stage 1 output: when the bicycle relation or the COA gate flags a violation, the audit record is escalated to Granite Guardian which decides approve, flag, or reject. The architecture's safety contract is the Granite Guardian audit on the combined Stage 1 + Stage 2 violation log, unit-tested per the Convergence 14 fixture suite. We do not claim Stage 2 silently corrects bicycle or COA-gate violations; we claim the audit catches them and the unit tests prove the catch-rate. V1 uses constant-mu, not full Pacejka. Sub-second hallucinations inside 1-Hz aggregates remain V2 work. The worst zero-order impossibilities never reach the driver without a Guardian verdict attached.

**Why this lands.** Names the three constraints concretely, owns the gaps proactively. Acknowledging the limitations before the judge does is a power move.

---

## Card 3 - Serialization gap attack (Day 3 drill)

**Q:** Granite Guardian judges text, not numbers. If your Python script that translates physics violations into English has a bug, your whole safety story collapses. How do you protect against that?

**A:** You're right that Guardian audits text, not tensors. The defense has two locks. First, the Convergence-14 fixture suite: every kinematic violation type has a fixture producing a known text log + a verified Guardian verdict. The serializer is safety-critical code with safety-critical test coverage. Guardian's reasoning trace surfaces in think-mode in the UI, so the audit is never a black box. Second, the D-050 byte-equality test acts as a regression guarantee against engine swaps: the V1 NumPy validator + V2 cvxpylayers projector emit byte-identical `.to_text()` output modulo the leading ENGINE header line on the same physical event. The Vinh pytest assertion at `app/backend/tests/test_physics_v2.py::test_v1_v2_to_text_byte_equal_modulo_engine_line` locks this at HEAD so future engine swaps (Stage A 8-tier Pacejka, Stage B 3-iteration SCP, eventual GPU-accelerated cvxpylayers) cannot silently change the audit input that Guardian sees.

**Why this lands.** Two-layered defense (Convergence-14 fixture proof + D-050 engine-swap regression guarantee) addresses the serializer-fragility attack at both the test-coverage axis + the regression-stability axis. The pitch headline of the project is the COA-bound adaptive-controls model + the brake-throttle simultaneity gate (Card 4); D-050 is the engineering safety contract behind the pitch, not the pitch itself. /judges renders EngineAgnosticByteEqualityDemo so a judge can see the byte-equality + the ENGINE-line-only diff in one tactile surface, but the surrounding copy frames it as a regression guarantee against engine swaps, not as the project's load-bearing positioning headline. Reframing per wave-45 Phase 18 tier-3 ChatGPT Brutal Judge Review #4 close-out + new `feedback_byte_equality_regression_guarantee_not_killshot.md` memory rule.

---

## Card 4 - COA simultaneity (the offensive card, Day 4 drill)

**Q:** Why can't an adaptive racing driver just use Track Titan or Trophi.ai? They already exist, they're funded, they're proven.

**A:** Because public documentation for both tools, which we surveyed through 2026-Q2, does not show any conditional removal of the able-bodied brake-throttle mutual-exclusion assumption. We also found no public reference in either platform's docs to FIA Certificates of Adaptations as a parsed input. Adaptive electronic hand-control systems explicitly support simultaneous brake and throttle. That's not a bug, it's the adaptation. Without explicit COA handling, the technique reads as either invalid telemetry or driver error. APEX reads the FIA Certificate of Adaptations as a flag at the tensor level. We're not coaching disabled drivers with the same model as everyone else. We're coaching them with the model that matches their car.

**Why this lands.** Knockout punch. Actively reframes incumbents as broken for this population. Slow down on "We're not coaching disabled drivers with the same model as everyone else" - that's the line that wins the room.

---

## Card 5 - Latency attack (Day 5 drill)

**Q:** You claim 60 seconds end-to-end. On a laptop CPU? Granite-Docling alone takes 10-15 minutes. That number is fiction.

**A:** You're right that a cold-start pipeline can't fit in 60 seconds. Claiming it would be dishonest. What runs live in the 60-second demo is the core race-engineer loop: TTM forecast, physics projection, Guardian audit, Granite Instruct briefing. Document parsing (FIA COA + timing sheet) runs once at driver onboarding, cached. A driver's adaptation profile doesn't change between sessions. The 60 seconds is the post-race coaching loop, not the registration flow.

**Why this lands.** Accept the criticism, reframe what "60 seconds" actually covers, ground in product-design reality. If you'd defended the 60-second-from-scratch claim, you'd lose. By naming what's cached and why, you turn the attack into a product-design answer.

---

## Rehearsal log

| Date | Pass type | Outcome |
|------|-----------|---------|
| 2026-05-25 | Solo Day 6 | scheduled |
| 2026-05-28 | Paired + hostile Day 9 dress rehearsal 1 | scheduled |
| 2026-05-29 | Hostile Day 10 dress rehearsal 2 | scheduled |
| 2026-05-30 | Final cold pass Day 11 evening | scheduled |

## Delivery rules

- Each answer under 30 seconds. Time yourself.
- Whoever feels the question better takes the answer. The other nods.
- If a question doesn't match a card exactly, redirect to the closest card. Don't ad-lib.
- After a 3-hostile-pass, the team can ad-lib variations because the core answers are locked.

## Catch-all flashcard (Card 6, updated 2026-05-23 Day 5 post wave-40)

For questions outside the 5 cards: "Wave-30 locked the maximal architecture: 8-tier physics + three-track forecasting ensemble + twelve-tool IBM Granite stack + LangGraph orchestration + tri-agent Agent-as-Judge critic loop + five shouldn't-be-possible moves (WebGPU Granite Nano, Activated LoRA hot-swap, GEPA reflective prompt evolution, EAGLE-3 speculative decoding, Agent-as-Judge tri-agent critic). All five are in-scope; no V2 or V3 labels. The bounded-scope statement at paper §5.3 + the architecture spec at `docs/architecture-spec.md` Appendix W30 list the explicit non-claims. Happy to walk through where your question intersects the in-scope galaxy."

## Card 7 (drafted 2026-05-23 Day 5 post Phase 0 handoff)

"Vinh shipped the Phase 0 contract layer Day 3 night: shapes.py (the canonical (B, 30, 14) tensor + 14-channel CHANNELS enum + CHANNEL_TIER_BINDING + SCHEMA_VERSION), violations.py (PhysicsViolationLog + GuardianAudit with uuid4().hex audit_id + 14 ViolationType literals), validator.py (V1 NumPy validator signatures + ToleranceBands per the council v2 channel-specific tolerance fix), projector.py (DifferentiableProjector Protocol seam letting us swap V1 NumPy + V2 cvxpylayers + future qpth / theseus without touching consumers; PROTOCOL_VERSION distinct from SCHEMA_VERSION), logging.py (audit_id-correlated JSON log lines via Python contextvar + per-line ts + level + logger + event + audit_id + commit_sha + models snapshot), and scp_spike.py (the D-027 Stage C constant-mu single-iterate gradient-flow proof that emitted gradient finite True + ||grad_L|| = 24.12 below the council v2 1e4 threshold + FCVR = 0 on the Sarah Reynolds 10-row stub). Frontend mirrors live in `app/shared/types.ts` as Backend* prefixed TypeScript types + a negative-tsc fixture at `tests/types/contract-alignment.test-d.ts` catches schema drift at compile time. The wave-41 decoder at `lib/api-decode.ts` swaps mock fixtures for live backend payloads when Vinh wires the FastAPI endpoints Day 7-8."

## Card 8 (drafted 2026-05-23 Day 5 post galaxy-moves surface pull-forward; corrected wave-40 cold-review codex HIGH)

"Wave-30 D-019 enumerates five shouldn't-be-possible moves; wave-38 shipped move #1 (WebGPU Granite Nano 350M edge inference via Transformers.js v4 on /judges + on /analyze with the 30-line Newton friction-ellipse projector for the offline path per D-021 server-authoritative reconnect). Wave-40 shipped the visualization surfaces for moves #2 (Activated LoRA hot-swap adapter status badge with rank + alpha + lambda + swap-round-trip-ms), #3 (GEPA reflective prompt evolution panel with candidate count + APEX-Bench faithfulness p95 trajectory over N iterations + per-iteration selected prompt ID), #4 (EAGLE-3 speculative decoding latency badge with speedup + accepted-token-rate + draft rank), and #5 polish on the tri-agent Agent-as-Judge critic loop via a new useTriAgentCriticVerdict data-source hook so the Day 7-8 backend wire-up is a fetch swap, not a build-from-zero. Moves #2 through #4 render in /judges#galaxy-moves between the 8-tier extended-physics grid + the tri-agent critic section; move #5 renders in the following tri-agent section; move #1 renders in /judges#edge-summary further down."

---

## Card 9 - Watson TTS Vercel production-path rescue (Day 12 drill; tier-3 NotebookLM Topic 1 add)

**Q:** Vercel filesystem is read-only and has no `ffmpeg` binary. How did Watson TTS run in production?

**A:** Initial Watson TTS endpoint failed in Vercel production because IBM's Watson TTS SDK writes the synthesized audio to a temp file by default and then post-processes via ffmpeg. Vercel's serverless runtime exposes no writable filesystem and ships no ffmpeg binary, so the route silently fell back to the browser's native Web Speech API. Three engineering moves rescued the production path: (a) installed `ffmpeg-static` so the binary ships in the deploy bundle, (b) replaced the SDK's cache-write step with an in-memory `Readable` stream constructed from the SDK's audio buffer, (c) piped Watson's audio buffer through ffmpeg as raw stdin/stdout in `nodejs` runtime mode + streamed the resulting MP3 bytes inline to the frontend via `URL.createObjectURL(new Blob([buffer]))`. End-to-end Watson TTS now runs live on Vercel with zero filesystem writes. The architectural workaround is documented in the decision-log + `app/frontend/app/api/watson-tts/route.ts` + the WatsonTtsRadio component honesty pill flips from `ready_fallback` to `ready_watson` once the inline-stream path completes the first invocation.

**Why this lands.** Demonstrates extreme technical tenacity keeping IBM technology functional within a constrained cloud environment. Directly satisfies the "Technical Execution" judging criterion which IBM explicitly defines as "effective use of IBM technology in a functional, well-structured solution". Most submissions silently fall back to non-IBM substitutes when Vercel-style constraints bite; APEX engineered around them so Watson stays in the production loop.

---

## Card 10 - PitWall reclassification attack defense (Day 12 drill; tier-3 ChatGPT Adversarial Positioning hardest-to-defend rebuttal)

**Q (PitWall framing):** Real race engineers call strategy live. APEX debriefs after the flag. Why are you calling it a race engineer?

**A:** Race strategy is one slice of race engineering; translating driver feedback into faster, safer setup is another, and that is exactly where adaptive drivers are underserved today. APEX is the first workflow that binds the FIA Certificate of Adaptations into the model itself, so when a driver is legally allowed brake-and-throttle overlap, we coach the real car they drive, not an able-bodied abstraction. Live strategy calls + post-session coaching are complementary; PitWall serves the elite F1 strategist slice + APEX serves the adaptive + grassroots driver-coaching slice that nobody else covers.

**Why this lands.** Concedes the obvious truth (live strategy IS part of race engineering) + broadens the definition back to setup-and-feedback translation where APEX is credible + drops the one claim no generic strategy/chat competitor can match in 30 seconds: COA-bound adaptive-controls model + brake-throttle simultaneity gate. Pre-empts the single hardest 30-second attack identified by the ChatGPT Adversarial Positioning Deep Dive across the 7-competitor field.

---

## Card 11 - "Conceptual stack not shipped stack" defense (Day 12 drill; tier-3 ChatGPT Brutal Judge Review #1 close-out)

**Q (brutal judge framing):** Your judges page says only two IBM tools are fully wired at HEAD. The rest are "integration" or "facade" or "mock". You're asking me to reward planned integration, not executed integration. Why should this win Best Use of Technology?

**A:** Five IBM tools are end-to-end live in the production coaching path right now: Granite Instruct 4.1 8B narrating coaching reports via OpenRouter, Granite 4.0 Nano 350M running in the driver's browser via WebGPU + Transformers.js v4 (see `lib/webgpu-nano.ts` + `EdgeSummary.tsx`), Granite-Docling 258M parsing the COA PDF into structured JSON cached at onboarding, the differentiable cvxpylayers V2 projector enforcing physics constraints with engine-agnostic byte-equality against the V1 NumPy validator, and Watson TTS streaming the audio coaching debrief inline through the production-path rescue (see Card 9). The remaining seven tools carry honest "INTEGRATION" tier because their backend wires are Vinh-scope swap-points (V1-V15) with frontend canonical type contracts already live + the swap is one constructor call. We deliberately publish the honesty tier instead of mocking every tool as WIRED; the trade is brutal-judge transparency for occasional "asking me to reward planned integration" reads. The five live tools each do load-bearing work simpler alternatives could not (Instruct narrates regulatory-aware coaching; Nano runs offline on the pit-wall laptop when cellular drops; Docling parses non-standard FIA hand-control specs; cvxpylayers grants byte-identical safety contract across V1+V2 engines; Watson TTS keeps voice-debrief in IBM stack instead of falling back to browser-native).

**Why this lands.** Reframes "twelve tools" → "five end-to-end live + seven honest integration" instead of letting the judge feel ambushed by the tier markers. Names exactly which tools are live + cites the consumer file so the judge can verify in 30 seconds.

---

_Last updated: 2026-05-25 night by Stephen + Claude. Mirrors `project_apex_qa_killshots.md` in memory. Update both in lockstep on any wording change. Wave-40 Stream E.4 added Cards 6 update + Card 7 (Phase 0 handoff) + Card 8 (galaxy moves surface pull-forward). Wave-45 tier-3 review added Card 9 (Watson TTS rescue) + Card 10 (PitWall reclassification rebuttal) + Card 11 (conceptual-stack defense)._
