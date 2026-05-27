# Sarah Reynolds - Donington 2026, Session Debrief

**Driver:** Sarah Reynolds (BritCar Endurance Championship, Class 4)
**Vehicle:** Limitless Racing #44 (MME Motorsport electronic hand-control unit, approved per COA MSUK-MED-COA-2026-0184)
**Circuit:** Donington Park, National Layout, 2.06 mi / 3.32 km
**Session:** Free Practice 2, 2026-04-18, 5 representative laps recorded

---

## What worked

The hand-control simultaneity envelope held cleanly into Redgate and Coppice. I trail-braked deeper than last weekend at Cadwell and the front rotated without snapping. The medical-derived hand-control geometry (independent lever paths per the MME spec) let me feather the throttle through the long right at Schwantz while still holding the brake into the late apex.

The car carried more minimum speed through the Old Hairpin than I expected; the new aero balance shifted load toward the front. That was the COA-permitted tuning delta my engineer pulled from the last debrief.

## What hurt

Three corners cost me time:

1. **Turn 1 (Redgate, hairpin).** I keep arriving slightly too hot and the rear steps out under brake. The hand-control geometry can hold the brake longer but I'm releasing too aggressively into turn-in. The data suggests I'm losing ~0.3 s here every lap.
2. **Turn 4 (Old Hairpin, apex).** Minimum speed is 8 m/s lower than the reference; I'm rolling brake into the apex when I should be balanced on the throttle. The COA simultaneity permission lets me overlap but I'm under-using it.
3. **Turn 7 (Goddards, exit).** I'm short-shifting out of fear the rear breaks loose; the data says the friction envelope still has 0.15 g of margin at the throttle-application point. The minimum-speed deficit compounds through the next straight.

## Compounding effect over a stint

Three corners × ~0.20 s mean loss = ~0.60 s per lap. Over a 50-lap stint that is ~30 s, which is roughly a track-position swap with the next class car. The closing phase of the race is where this hurts most.

## Questions for APEX

1. Where is the friction-ellipse envelope actually living at Redgate entry? The Guardian rule fires if I push past it, but I want to know how much margin I have before the rule fires, not just whether it fires.
2. Is there a tuning delta on brake bias that closes the Goddards exit-throttle gap without losing the Redgate front bite?
3. The COA simultaneity flag is set to `true` (hand-control approval is current per MSUK-MED-COA-2026-0184 expiring 2027-02-11). Are there cornering scenarios in the forecast horizon where APEX recommends I do NOT exercise the simultaneity permission, even though it is permitted?

## What I will NOT change

The hand-control hardware (MME Motorsport electronic actuator) is approved per COA; do not recommend hardware changes. Recommendations should stay on tuning + driving technique only. The medical findings on the COA (T6 complete spinal cord injury, 2018) are stable and not part of the recommendation surface.

---

> **Fictional persona disclosure.** Sarah Reynolds is a fictional persona created for the IBM SkillsBuild AI Builders Challenge May 2026 submission. Any resemblance to real adaptive racers is coincidental. See `docs/sarah-reynolds-persona.md` for the full persona brief + `fixtures/personas/sarah-reynolds-coa-stub.json` for the canonical COA fixture.
