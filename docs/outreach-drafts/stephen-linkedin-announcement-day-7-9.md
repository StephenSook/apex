# Stephen Personal LinkedIn Announcement (Day 7-9 timing)

> Mid-build "building APEX" long-form post on Stephen's own LinkedIn timeline. Send window Day 7-9 (2026-05-26 to 2026-05-28) AFTER D-027 SCP gate result lands AND BEFORE Day 9 demo-video record. Reach: Stephen's network + LinkedIn algorithmic discovery + hashtag feed.
>
> **Owner:** Stephen Sookra. **Post to:** Stephen's personal LinkedIn timeline (`linkedin.com/in/stephen-sookra-633682339`). **Length:** ~400 words (LinkedIn engagement sweet spot). **Reply expectation:** Stephen's network reactions + adaptive-racing community signals + foundation-model researcher cold connections.
>
> **Strategic intent:** industry-network awareness + recruiter visibility + adaptive-racing community discovery. Reveals strategy to lurking competitors (acknowledged trade-off) but the architecture is publicly committed in the repo anyway, so the cat is already out. Same calibration as Discord post: technical-depth + IBM tool depth, NO competitor-comparison framing.

---

## Body (paste-ready)

```
Building APEX with Vinh Le for the IBM SkillsBuild AI Builders Challenge May 2026.

APEX is an AI race engineer specifically tuned for adaptive racing drivers (paraplegic + amputee hand-control users, sensory-accommodation drivers, military veterans transitioning to motorsport, grassroots adaptive racers running modified-controls vehicles). Submission deadline 2026-05-31.

Why this exists: the leading commercial AI race-engineer tools we surveyed do not show public documentation of any conditional removal of the able-bodied "throttle and brake never simultaneous" assumption, nor any FIA Certificate of Adaptations parsing path. Adaptive technique routinely reads as invalid telemetry or driver error. We fix that.

How: twelve IBM Granite tools earning their slot in a five-layer architecture. Layer 1 intake via Granite-Docling COA parser + Granite Vision 4.1 timing-sheet parser. Layer 2 polyphase preprocessing + IBM TSPulse anomaly detection. Layer 3 three-track forecasting ensemble built on Granite TimeSeries TTM r2.1 (channel-mixing decoder fine-tune) + Granite FlowState (sampling-rate-invariant continuous-time SSM) + Amazon Chronos-2 (21-quantile probabilistic baseline). Layer 4 unrolled Sequential Convex Programming physics-projection layer wrapping cvxpylayers convex QP with 8-tier vehicle dynamics inside (Pacejka combined-slip + transient tire ODE + two-mass thermal + double-track load transfer + 3D track geometry + aerodynamics + adaptive hand-controls + kinematic integration). Layer 5 Granite 4.1 8B Instruct narrator + Granite Guardian 4.1 BYOC safety audit + Granite Embedding R2 RAG retrieval + IBM Mellea Instruct-Validate-Repair. Plus a Layer 0 edge path running Granite 4.0 Nano 350M in-browser via WebGPU + Transformers.js.

Stack rationale: every tool earns its slot against a NeurIPS Workshop paper draft that names the central novelty (frozen time-series foundation model + hard differentiable physics-projection composition, a confirmed-absence in the prior-art sweep) and three supporting contributions (kinetic hallucination as a characterised failure mode, polyphase 50 Hz feasible-lift projector, APEX-Bench public benchmark with LIPS 4-axis ablation released under Apache 2.0 alongside the paper).

Status: [X+] atomic commits across Day 1 through [current day] (atomic-commit discipline, conventional commits prefixes, push-after-every-commit). Wave-30 maximal architecture lock landed Day 3 night. Day-3 Sequential Convex Programming go/no-go gate is the single most important checkpoint of the build.

Open to technical feedback from anyone in the adaptive-racing community, IBM Granite contributors, sim-racing engineering folks, foundation-model + physics-projection researchers. Repo public Day 1 at github.com/StephenSook/apex (Apache 2.0). Paper draft + architecture spec + decision log all live there.

9 days to go.

#IBMSkillsBuild #IBMGranite #AdaptiveRacing #MotorsportAI #PhysicsML #NeurIPS
```

---

## Tone notes

- Builds-in-public momentum signal + invites connection without sounding like a self-promotional pitch.
- Hashtags target three audiences: IBM staff feed (#IBMSkillsBuild + #IBMGranite), adaptive-racing community (#AdaptiveRacing + #MotorsportAI), research community (#PhysicsML + #NeurIPS).
- "Twelve IBM Granite tools earning their slot" framing = Best Use of Technology track signal without explicit prize-hunting language.
- Confidence + transparency on what's done (257+ commits, wave-30 lock, paper draft live) without overclaim on what's still in flight (D-027 result + Day 4+).
- British spelling on "parameterised" (not in post body but generally consistent across project).
- Zero em-dash. Zero AI-tone blocklist words.

## After-send checklist

- [ ] Confirm D-027 SCP gate result is landed (green or with fallback documented) before posting. Do NOT post during in-flight uncertainty.
- [ ] Update "X days to go" + "Y+ atomic commits" to current counts at send time.
- [ ] Consider adding a single screenshot (one of: /judges Convergence-14 grid, paper Figure 1 architecture diagram, or apex-one-black.vercel.app landing-page hero) for LinkedIn-feed visual stop power.
- [ ] If 30-second highlight clip is live by Day 9, embed via LinkedIn native video upload (NOT YouTube embed, which throttles reach).
- [ ] Post to Stephen's personal LinkedIn timeline (NOT a Company Page).
- [ ] Log post URL + timestamp in `docs/stakeholder-outreach-log.md` (new Phase 7 row).
- [ ] Monitor reactions + comments for 48h post-send; respond to questions.

---

_Last updated: 2026-05-22 night Day 3 by Stephen + Claude. Fires conditionally Day 7-9 after D-027 gate result lands green._
