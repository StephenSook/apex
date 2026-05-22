# IBM SkillsBuild Discord #may-challenge-and-labs Technical-Depth Post

> Mid-build technical-depth post for the IBM SkillsBuild Discord community. Send window Day 7-8 (2026-05-26 to 2026-05-27) AFTER D-027 SCP gate result lands (so we're not signaling fragility) AND BEFORE Day 9 demo recording (so feedback can still influence the demo).
>
> **Owner:** Stephen Sookra. **Send to:** `#may-challenge-and-labs` channel in IBM SkillsBuild Discord (`discord.gg/Nmcm2uCze4`). **Reply expectation:** technical questions from IBM staff + lurking judges + Granite contributors; no formal endorsement ask in this surface.
>
> **Strategic intent:** signal architecture depth + IBM Granite stack utilisation to anyone reading the channel (lurking judges, IBM employees, fellow competitors who appreciate the depth). Calibration: post technical-depth + IBM tool depth, NOT specific competitor positioning (no Track Titan / Trophi.ai comparison framing here).

---

## Body (paste-ready)

```
APEX progress check-in for the May Challenge community.

What we are building: AI race engineer for adaptive racing drivers (paraplegic + amputee hand-control users + sensory-accommodation drivers across the UK championships) on the IBM Granite stack. Submission 2026-05-31. Public repo at github.com/StephenSook/apex.

Wave-30 architecture lock landed Day 3 per a 12-hour multi-model deep-research synthesis. Twelve IBM Granite tools earning their slot: Granite-Docling 258M (parses FIA Certificate of Adaptations), Granite Vision 4.1 (parses timing sheets), Granite TimeSeries TTM r2.1 channel-mixing decoder fine-tune as Track 1 of a three-track forecasting ensemble, Granite FlowState 9.1M (Track 2, sampling-rate-invariant continuous-time SSM), Granite 4.1 8B Instruct (narrator), Granite Guardian 4.1 BYOC (safety audit), Granite Embedding R2 hybrid dense+sparse (RAG retrieval), IBM TSPulse 1M (anomaly detection on polyphase phase streams), Granite 4.0 Nano 350M (in-browser WebGPU edge path via Transformers.js), Langflow (visible orchestration facade), Docling library, IBM Bob.

NeurIPS Workshop paper draft at paper/apex-neurips-workshop-2026.md. Central claim: frozen-TSFM + hard differentiable physics-projection composition (confirmed-absence in the prior-art sweep). Three supporting contributions: kinetic hallucination as a named failure mode, polyphase 50 Hz feasible-lift projector, APEX-Bench public benchmark (50-lap multi-class + LIPS 4-axis ablation, Apache 2.0).

Day-3 SCP go/no-go gate result will share here when it lands. Open to architecture feedback from anyone in the channel who wants to read the brief.

X days to go.
```

---

## Tone notes

- Technical depth visible immediately (12-tool stack named with version pins).
- Avoid competitor-comparison framing (Track Titan + Trophi.ai not named in Discord; that framing lives in the LinkedIn DMs + paper Related Work section).
- "Open to architecture feedback" = invitation-not-pitch. Lowers any "you're recruiting endorsement" pushback.
- Replace "X days to go" with current days-remaining number at send time.
- Replace `paper/apex-neurips-workshop-2026.md` reference with a deep-link if Vercel apex.race/paper is live by send time.

## After-send checklist

- [ ] Confirm D-027 SCP gate result is landed + green (or fallback documented) before posting. Do NOT post if gate is still in flight or freshly failed.
- [ ] Update "X days to go" to current count.
- [ ] Post to `#may-challenge-and-labs` channel (NOT direct DMs to BeMyApp staff).
- [ ] Log post timestamp + URL in `docs/stakeholder-outreach-log.md` (new Phase 7 row).
- [ ] Monitor thread replies for 24h post-send; respond to technical questions.

---

_Last updated: 2026-05-22 night Day 3 by Stephen + Claude. Fires conditionally Day 7-8 after D-027 gate result lands green._
