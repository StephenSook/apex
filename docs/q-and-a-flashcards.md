# APEX - Q&A Defense Pack (Five Flashcards)

> Five rehearsed flashcards covering the five highest-probability attacks an IBM SkillsBuild judge could raise during the 5-minute Q&A after the 3-minute pitch on 2026-05-31. Memorize verbatim. Each card delivers in 30 seconds. Both Stephen and Vinh memorize all five.
>
> **Owner:** Stephen Sookra. **Internal canonical rehearsal source:** `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_qa_killshots.md` (which uses NAMED operators including Team BRIT for grounded internal rehearsal). **This file** is the PUBLIC-anonymized mirror per the anonymization-pre-consent rule (`feedback_anonymization_pre_consent.md`): operator names redacted to role descriptions until per-surface consent confirmed. If consent arrives, this file gets renamed-back in a `⚠️ CONTRACT`-prefixed commit. **Cross-references:** PLAN.md tasks 2.4, 2.8, 2.13, 3.5, 4.11, 6.11 (rehearsal schedule).
>
> **Rehearsal protocol.** Three hostile passes minimum. Solo pass Day 6 (paired) + paired pass Day 8 + hostile pass Day 9 + final cold pass Day 11 evening.

---

## Card 1 - Deep Dynamics attack (Tuesday Day 1, after Beat 4 of pitch)

**Q:** Isn't this just Deep Dynamics with an IBM logo? They already built a Physics Guard layer for autonomous race cars.

**A:** Deep Dynamics is a brilliant precedent, but it solves a different problem. They trained a bespoke neural network from scratch on race-car data. APEX proves a different pattern: we take a frozen, general-purpose foundation model (Granite TTM, pretrained on weather and retail) and wrap it with a differentiable physics-projection layer at inference time. We aren't building a custom PINN; we're constraining an off-the-shelf TSFM. To our knowledge, no prior published work does that for vehicle dynamics without retraining the model from the ground up.

**Why this lands.** Accepts the precedent honestly, then names the architectural distinction in one clean sentence (frozen-and-wrapped vs trained-from-scratch). Don't argue against Deep Dynamics. Argue for the paradigm.

---

## Card 2 - Kinetic Hallucination attack (Day 2 memorization, drilled Day 6+)

**Q:** TTM was trained on energy grids and weather. How do you stop it forecasting physically impossible telemetry, like 4G lateral with zero steering, or speed increasing with throttle at zero?

**A:** That's exactly the problem we built PhysicsTTM to solve. After TTM produces the forecast tensor, every step passes through a differentiable QP layer that enforces three hard constraints: the friction ellipse (total acceleration bounded by mu times g), a forward-Euler kinematic check tying speed to longitudinal acceleration, and the bicycle model tying lateral G to steering angle and speed. Lateral G with zero steering becomes infeasible by construction. We're honest about residual gaps: V1 uses constant-mu, not full Pacejka, and sub-second hallucinations inside 1-Hz aggregates remain possible. Those are V2 work. But the worst zero-order impossibilities are prevented before they reach the driver.

**Why this lands.** Names the three constraints concretely, owns the gaps proactively. Acknowledging the limitations before the judge does is a power move.

---

## Card 3 - Serialization gap attack (Day 3 drill)

**Q:** Granite Guardian judges text, not numbers. If your Python script that translates physics violations into English has a bug, your whole safety story collapses. How do you protect against that?

**A:** You're right that Guardian audits text, not tensors, and we're explicit about that in the architecture. The defense is a unit-test suite covering every violation type: each kinematic failure mode has a fixture that produces a known text log and a verified Guardian verdict. The serializer is treated as safety-critical code, not glue code. We also surface Guardian's reasoning trace in think-mode in the UI, so the audit isn't a black box. The textual layer is a deliberate design choice with deliberate test coverage.

**Why this lands.** Demonstrates engineering-level thinking, not just ML-level. "Safety-critical code with unit tests" is exactly what an IBM judge wants to hear.

---

## Card 4 - COA simultaneity (the offensive card, Day 4 drill)

**Q:** Why can't an adaptive racing driver just use Track Titan or Trophi.ai? They already exist, they're funded, they're proven.

**A:** Because they'll misdiagnose every adaptive driver they touch. Track Titan and Trophi.ai use able-bodied physics. Their models assume throttle times brake equals zero. Adaptive electronic hand-control systems explicitly support simultaneous brake and throttle mid-corner. That's not a bug, it's the adaptation. So when those tools see simultaneous inputs, they flag it as a driver error and penalize technique that's actually required. APEX is the only AI race engineer that reads the FIA Certificate of Adaptations as a flag at the tensor level. When the COA says simultaneity is permitted, our physics model permits it. We're not coaching disabled drivers with the same model as everyone else. We're coaching them with the model that matches their car.

**Why this lands.** Knockout punch. Actively reframes incumbents as broken for this population. Slow down on "We're not coaching disabled drivers with the same model as everyone else" - that's the line that wins the room.

---

## Card 5 - Latency attack (Day 5 drill)

**Q:** You claim 60 seconds end-to-end. On a laptop CPU? Granite-Docling alone takes 10-15 minutes. That number is fiction.

**A:** You're right that a cold-start, end-to-end pipeline can't fit in 60 seconds, and that would be dishonest to claim. What runs live in the 60-second demo is the core race-engineer loop: TTM forecast, physics projection, Guardian audit, Granite Instruct briefing. Document parsing (the FIA COA and timing sheet) runs once at driver onboarding and is cached. That's how production AI race engineering actually works. A driver's adaptation profile doesn't change between sessions. The 60 seconds is the post-race coaching loop, not the registration flow.

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

For questions outside the 5 cards: "We deliberately scope-limited APEX V1 to the COA + TTM + physics layer pattern. The question you're asking is genuinely open and a great Day 13 conversation. Happy to dig in."

---

_Last updated: 2026-05-20 Day 1 EOD by Stephen. Mirrors `project_apex_qa_killshots.md` in memory. Update both in lockstep on any wording change._
