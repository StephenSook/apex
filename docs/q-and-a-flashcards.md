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

**A:** You're right that Guardian audits text, not tensors. Architecture is explicit about it. The defense is a unit-test suite: every kinematic violation type has a fixture producing a known text log and a verified Guardian verdict. The serializer is safety-critical code with safety-critical test coverage. Guardian's reasoning trace surfaces in think-mode in the UI, so the audit is never a black box.

**Why this lands.** Demonstrates engineering-level thinking, not just ML-level. "Safety-critical code with unit tests" is exactly what an IBM judge wants to hear.

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

## Catch-all flashcard (Card 6, drafted Day 9 after dress rehearsal)

For questions outside the 5 cards: "We deliberately scope-limited APEX V1 to the COA + TTM + two-stage projection-and-audit pattern, with V1 / V2 / V3 boundaries documented in the architecture spec at `docs/architecture-spec.md` and the bounded-scope statement in the paper at §5.3. Happy to walk through where your question intersects the V1 boundary."

---

_Last updated: 2026-05-20 Day 1 EOD by Stephen. Mirrors `project_apex_qa_killshots.md` in memory. Update both in lockstep on any wording change._
