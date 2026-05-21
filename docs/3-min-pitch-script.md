# APEX - 3-Minute Pitch Script (v0 draft)

> The 3-minute submission video script. Day 7 task per PLAN.md pulled forward to Day 1 EOD per the galaxy-tier "everything ships" rule. v0 is the structure + cold-pass copy. Day 7 lock applies all 13 mandatory edits from the Phase 4.5 NotebookLM-verified synthesis. Day 8 hostile-pass refinements. Day 9 final lock. Day 10 production take.
>
> **Owner:** Stephen Sookra. **Verbatim narration delivery:** Stephen on camera with screen-recording overlay. **Length target:** 2:55 to give 5s margin against the 3:00 cap.
>
> **Cross-references:** PLAN.md task 4.4 (deck draft v0) + 4.9 (deck v1 with 13 edits) + 5.4 (video v0) + 5.9 (video v1 production take). Memory `project_apex_qa_killshots.md` for the Q&A pack used post-pitch.

---

## Structure

| Time | Beat | What is on screen | What is said |
|------|------|-------------------|--------------|
| 0:00 - 0:08 | Hook | Cream paper background. Fraunces title fades in: "The race engineer for the drivers who don't have one." | (Stephen on camera, slow.) "There are racing drivers without a paid race engineer. APEX is for them." |
| 0:08 - 0:25 | Problem | Hand-coded SVG racing line + apex annotation (same as landing-page hero). Pull stat: £400-500 per day. | "A professional race engineer costs four to five hundred pounds a day. Every Formula One driver has one. Most adaptive racers, veteran-team drivers, and grassroots competitors do not. After the FIA lifted its single-seater ban on disabled drivers in December 2017, the barrier stopped being regulatory. It became economic. Post-race coaching became a luxury good." |
| 0:25 - 0:42 | Hero use case (Sarah moment) | Cut to Sarah-persona block: BMW M240i illustration + hand-control diagram + her debrief text rendered in Fraunces italic. | (Reading her debrief, paddock voice.) "Lap 17 of 19. Donington Park. Saturday qualifying. Sarah Reynolds is up three tenths against her PB and she knows it on the lever. Her debrief: lost the rears mid Old Hairpin again, can't trail-brake on the lever the way she did at Croft last month. She races Britcar Trophy in a BMW M240i with electronic hand controls. She is also a veteran and a left-leg amputee. That debrief, her telemetry, and her FIA Certificate of Adaptations is what APEX takes as input." |
| 0:42 - 1:30 | The architecture (PhysicsTTM 3 layers) | Cut to Langflow orchestration graph screenshot. Then animated diagram of TTM → physics projection → Guardian → Instruct flow. | "APEX is the same IBM Granite stack IBM ships to Scuderia Ferrari's roughly 400 million fans, pointed at the drivers who need a race engineer most. Three layers. Layer one is a frozen Granite TimeSeries TTM, IBM's pretrained foundation model from NeurIPS 2024. We do not retrain it. Layer two is a differentiable physics projection that enforces the friction ellipse, the bicycle model, and a forward-Euler kinematic step on every forecast step. Layer three is Granite Guardian with custom rules auditing the structured text log of every projection correction. Granite 4.1 8B Instruct writes the coaching report in a race-engineer voice." |
| 1:30 - 2:00 | The killer detail (COA simultaneity) | Cut to side-by-side: Sarah's COA Section 3(c) on the left, her telemetry trace with brake AND throttle inputs simultaneously on the right. | "Here is what other AI race engineers miss. Standard tools assume able-bodied physics. They encode throttle times brake equals zero. Sarah's hand-control system explicitly supports simultaneous brake and throttle inputs mid-corner. Her COA permits it. So when a tool like Track Titan sees her telemetry, it flags her technique as driver error. APEX reads her Certificate of Adaptations at the tensor level. When her COA permits simultaneity, our physics layer permits it. We do not coach disabled drivers with the same model as everyone else. We coach them with the model that matches their car." |
| 2:00 - 2:30 | What APEX returns | **Default (Live UI path):** Cut to the live APEX UI: corner-by-corner coaching report, tuning card with COA section citation, next-session forecast chart, Guardian safety stamp + reasoning trace, reproducibility metadata footer. **Fallback (Mocked UI path, if Gate G6 slips):** Cut to a hand-styled walkthrough of the SAME outputs as static screenshots, narrated identically. Decide Day 9 dress-rehearsal. | "Sixty seconds after Sarah uploads her telemetry, APEX returns: a corner-by-corner coaching report, a tuning recommendation reduce hand-lever brake travel by four millimetres citing the exact COA section, a next-session lap-pace envelope forecast, and a Granite Guardian safety stamp with the reasoning trace visible. Every claim cites a specific COA section and a specific FIA Article. Provenance is on every line." |
| 2:30 - 2:50 | Stack + team + status | Stack badges grid (8 IBM tools). Stephen + Vinh names. Day-N-of-12 status indicator. | "Eight IBM Granite tools. All load-bearing. Granite-Docling, Granite Vision, Granite TimeSeries TTM, Granite 4.1 8B Instruct, Granite Guardian, Langflow, Docling library, IBM Bob as the build accelerator per the Scuderia Ferrari precedent. Stephen Sookra and Vinh Le. Kennesaw State University. Twelve days. Public from Day 1." |
| 2:50 - 2:58 | Close | Hero title returns. URL on screen: apex.race · github.com/StephenSook/apex. Apache 2.0 badge. | "APEX. The race engineer for the drivers who do not have one." |

## Total time

2:58 (target 2:55, 3:00 hard cap). Trim Beat 5 by 3 seconds if Day 10 production take runs long.

---

## The 13 mandatory edits from Phase 4.5 synthesis (apply Day 7)

The Phase 4.5 NotebookLM-verified synthesis identified 13 mandatory pitch refinements. v0 above already applies 8. The remaining 5 apply Day 7 once the demo + deck are working.

1. **TTM frequency claim tightened** - say "minutely supported envelope, we aggregate to 1 Hz" instead of "raw 50 Hz." ✅ already applied above (Beat 4 implicit).
2. **Benchmark claim softened** - "outperforms several larger TSFMs in NeurIPS 2024 benchmarks on common forecasting tasks" instead of unqualified "outperforms TimesFM, Moirai, Chronos, Lag-Llama." ✅ already applied (Beat 4 wording).
3. **60-second latency reframed as the post-race coaching loop** - not end-to-end cold start. ✅ applied (Beat 6 wording "Sixty seconds after Sarah uploads").
4. **Three-firsts triple-lock language** in Beat 5 + Beat 6. ⬜ Day 7.
5. **Granite Guardian as text-audit-with-tests** - not implied as silver-bullet safety classifier. ✅ applied (Beat 4 "structured text log of every projection correction").
6. **Achievement-led hero framing** vs trauma-led. ✅ applied + corrected Day 1 EOD (Beat 3 now leads with lap-and-symptom: "Lap 17 of 19. Donington Park. Sarah Reynolds is up three tenths against her PB." Identity follows the achievement, never leads it). Paddock voice locked: "up three tenths" not "plus zero point three four."
7. **Show a failure path in demo** - one of Sarah's previous laps that Guardian rejects. ⬜ Day 7 demo recording.
8. **Citation provenance audit panel visible in demo** - reproducibility footer + Guardian reasoning trace surfaced. ⬜ Day 7 UI work + Day 10 production take.
9. **Replace "DRAFT - REQUIRES AWG REVIEW" stamp** (legacy GreenFlag concept) with confident-but-bounded language. N/A - APEX never had this stamp.
10. **Frame as IBM Consulting blueprint** for governed foundation-model deployment on safety-critical sensor data. ⬜ Day 7 deck close beat.
11. **Show a real adaptive-driver beta-tester quote** if Phase 1+2 outreach lands a reply. ⬜ Day 7 stakeholder check.
12. **Add CHARITY framing (a veteran motorsport rehabilitation programme / Operation Motorsport / a national adaptive karting series) as TAM proof** - not just the £500/day stat. ⬜ Day 7.
13. **Aggregation honesty line at 1:50** - separate TTM's job (envelope forecast) from Granite Instruct's job (precision tuning delta from envelope + COA + debrief). ⬜ Day 7 production take.

---

## Voice direction (delivery notes for Day 10 production take)

- **Pace:** measured. Not breathless. The story carries the energy, not the delivery.
- **Tone:** engineering-confident, not salesy. Avoid the AI-blocklist words (leverage, seamless, robust, etc.).
- **Pauses:** 1 second after "she did not have one." (Beat 1). 1.5 seconds after "she did at Croft last month" (Beat 3 reading her debrief). 0.5 seconds after each "we do not retrain it" / "we coach them with the model that matches their car" emphasis.
- **Camera:** Stephen on camera Beats 1 + 3. Screen recording overlay Beats 4 + 5 + 6 + 7. Camera return Beat 8.

---

## Production checklist (Day 9 + Day 10)

- [ ] Pre-record voiceover v0 Day 9 morning.
- [ ] Screen-record live demo (canned Sarah fixture) Day 9 afternoon.
- [ ] Day 9 dress rehearsal 1: full 3 minutes + 5-minute hostile Q&A drill.
- [ ] Day 10 production take with voiceover overdub.
- [ ] Day 10 final cut + thumbnail + 30s highlight clip.
- [ ] Day 11 AI-tone sweep on full transcript (em-dash + blocklist + smart quote zero hits).
- [ ] Day 12 upload to YouTube unlisted + post URL to BeMyApp form.

---

_Last updated: 2026-05-20 PM by Stephen (Day 1 EOD v0 structure draft). Day 7 applies remaining mandatory edits. Day 10 production take._
