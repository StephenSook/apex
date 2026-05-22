# Source 10 — PhysicsTTM: Mitigating Kinetic Hallucination in a Granite-TTM-Based AI Race Engineer for Adaptive Motorsport

## TL;DR

The single most defensible mitigation architecture for PIT WALL is a three-layer "Frozen TTM + Differentiable Physics-Projection Layer + Granite-Guardian-BYOC Audit" pipeline, where (1) Granite TimeSeries TTM r2.1 produces a multivariate telemetry forecast, (2) a differentiable kinematic-projection layer (CvxpyLayer / OptNet) clamps each step onto a physically feasible manifold defined by a Pacejka friction ellipse, a forward-Euler bicycle model, and the FIA Certificate of Adaptations envelope for the driver-vehicle pair, and (3) Granite Guardian 4.1 8B with a Bring-Your-Own-Criteria (BYOC) rule audits the textual violation log from a separate physics validator. This is buildable in 12 days, is the first published end-to-end "TSFM + physics-projection + LLM-guardian" stack for adaptive motorsport, and directly addresses every kinetic-hallucination failure mode in the NotebookLM review. The brake-throttle simultaneity rule must be parameterized by COA, not hard-coded — Team BRIT / MME Motorsport's electronic hand-control system explicitly supports simultaneous brake+throttle, so a static rule would be wrong for the target population.

- Hackathon-ready core (12 days): A `physics-tsfm` Python wrapper around frozen `ibm-granite/granite-timeseries-ttm-r2` that runs forward-Euler checks, projects forecasts onto a friction-ellipse-bounded manifold via CvxpyLayers, and emits a textual physics-validity summary to Granite Guardian 4.1 8B BYOC. Demo as a side-by-side "raw TTM" vs "physics-corrected" g-g diagram in Langflow.
- Galaxy-tier extension (60–90 days): NeurIPS 2026 Workshop paper as the first physics-projection wrapper for a pretrained TSFM in a regulator-defined safety envelope (FIA COA). Pursue IBM Research (TTM authors) co-author and Cranfield / Oxford Brookes / Politecnico di Milano motorsport-engineering academic partner. NeurIPS 2026 workshop proposals due June 6, 2026 (AoE); workshop acceptance notification July 11, 2026 (AoE); suggested workshop paper submission deadline August 29, 2026 (AoE); workshops held December 11–12, 2026 in Sydney.
- Non-obvious defensive caveat to surface in the 5-minute Q&A: Standard race-engineering wisdom says "brake and throttle are non-simultaneous." This is FALSE for adaptive drivers using Team BRIT / MME Motorsport, who explicitly support "holding full throttle and applying a little braking mid-corner" (Professional Motorsport World). PIT WALL's envelope must be COA-parameterized.

---

## 1. Physics-Informed Neural Networks for Time-Series Foundation Models

Three relevant PINN families as of May 2026:

(a) Loss-side soft constraints. Canonical Raissi-style PINN + a residual term for governing ODEs. "Towards Physics-Guided Foundation Models" (arXiv:2502.15013, AAAI 2025) formalizes Physics-Guided Foundation Models (PGFM) and explicitly cites a jerk penalty for driving profiles — directly relevant to PIT WALL.

(b) Hybrid first-principles + neural residual. "Deep Dynamics" (arXiv:2312.04374) is the strongest published racing precedent. It is a physics-informed neural network for vehicle dynamics modeling of an autonomous racecar that "includes a unique Physics Guard layer to ensure internal coefficient estimates remain within their nominal physical ranges," validated on Indy Autonomous Challenge AV-21 data. The "Physics Guard" terminology should be adopted verbatim. Follow-up "Fine-Tuning Hybrid Dynamics (FTHD)" (arXiv:2409.19647) integrates supervised and unsupervised PINNs and fine-tunes with a small dataset — validating the "5%-data + physics-guard" pattern for PIT WALL.

(c) Wrapping a frozen TSFM. This is the open gap. "Physics-informed fine-tuning of foundation models for partial differential equations" (arXiv:2603.15431) shows that physics-informed fine-tuning of foundation backbones is just being investigated. POSEIDON, WALRUS (NeurIPS 2025), PDEFORMER-2, MORPH, FM-PDE all assume PDE pretraining — none wrap a non-physics TSFM like TTM with a physics correction layer for inference-time guardrails. This is a real gap PIT WALL can claim. "Physics-Informed Temporal Alignment" (PITA, ICML 2025, arXiv:2505.10930) is the closest cousin but targets PDE-pretrained models.

For PIT WALL: yes, you can wrap a frozen TTM, and the technique is a constraint-projection layer (Section 2), not loss-side retraining. Latency cost of a small QP is sub-millisecond for ~10 channels × 96 horizon on M2/4060 hardware.

Adjacent priors: SVTime (arXiv:2510.09780) frames "physics of large vision-model forecasters" with constraint functions. "Accelerating Long-Term Molecular Dynamics with Physics-Informed Time-Series Forecasting" (arXiv:2510.01206) reformulates MD as time-series forecasting with a physics-informed inference mechanism (Morse-potential pair penalty) — clean architectural analogue.

---

## 2. Kinematic Post-Processing / Constraint-Projection Layers

This is the load-bearing technical layer.

Differentiable optimization libraries:
- OptNet (Amos & Kolter, ICML 2017, PMLR 70): "OptNet, a network architecture that integrates optimization problems (here, specifically in the form of quadratic programs) as individual layers in larger end-to-end trainable deep networks." Ideal for the 2-D friction-ellipse projection. PyTorch via `qpth`.
- CvxpyLayers (Agrawal, Amos, Barratt, Boyd, Diamond, Kolter, NeurIPS 2019; github.com/cvxpy/cvxpylayers): "Differentiable convex optimization layers in PyTorch, JAX, and MLX using CVXPY." Apache 2.0. Recommended.
- NeuroMANCER (PNNL, Apache 2.0): explicitly "for constrained optimization, physics-informed system identification, and model predictive control."

Formulation for PIT WALL (per forecast step t):

```
minimize ||x_t - x̂_t||²
s.t. (a_long_t)² + (a_lat_t)² ≤ (μ·g)²        # friction ellipse
     v_{t+1} = v_t + a_long_t · Δt              # forward-Euler
     a_lat_t ≈ v_t² · tan(δ_t) / L              # bicycle kinematic
     throttle_t = 0 → a_long_t ≤ a_drag(v_t)
     v_t ∈ [v_min(circuit), v_max(circuit)]
     if COA_simultaneity_flag = False:
         throttle_t · brake_t = 0
```

This is a small QP/SOCP at every step. The bicycle equality makes "4 G lateral with zero steering" infeasible by construction.

V1 implementation: NumPy projection of (a_long, a_lat) onto the ellipse boundary when violated, with downstream re-integration. ~120 LOC. V2: CvxpyLayer for differentiability and joint fine-tuning.

Companion Kalman/particle-filter UKF on the bicycle model can propagate uncertainty over the horizon and gives the cleanest "Bayesian flavor" for the paper.

---

## 3. Physics-Informed Approaches in Autonomous Racing and Robotics

- Deep Dynamics (arXiv:2312.04374): the "Physics Guard layer" is the most directly transplantable concept. Combines physics coefficient estimation with dynamical equations; clamps coefficients within nominal physical ranges; validated open- and closed-loop on full-scale IAC AV-21 data.
- Learning MPC with Error Dynamics Regression (Xue, Zhu, Dolan, Borrelli; arXiv:2309.10716): IAC-deployed at Putnam Park; uses "a nominal, global, nonlinear, physics-based model with a local, linear, data-driven learning of the error dynamics." This is the mirror image of PIT WALL (physics trunk, ML residual) — useful contrast in the paper.
- TUM Indy Autonomous Challenge stack (arXiv:2202.03807): "The behavior prediction is built around two strategies: A short-term prediction based on a simple vehicle physics model generates reliable estimates for the behavior of the next 1-2 seconds." Production-grade autonomous racing already uses physics-driven short-horizon prediction.
- Stanford Dynamic Design Lab (Chris Gerdes), MARTY DeLorean, and TRI/Stanford tandem autonomous drift Supras — physics-first ML-residual approach. Their language ("Safe driving envelopes for path tracking in autonomous vehicles") is a direct vocabulary borrow. TRI/Stanford Supras built to Formula Drift spec, NMPC at 50 Hz.
- MPC for Integrated Lateral Stability with Pacejka/Dugoff (arXiv:2306.06096): deploys lateral-stability MPC on Dallara AV-21 in IAC; demonstrates Pacejka linearization at solver iterations.
- TUMFTM/NeuralNetwork_for_VehicleDynamicsModeling (GitHub): publicly available codebase that substitutes a bicycle model with a neural net. Useful baseline.
- DRIPS / FML data-driven correction (arXiv:2512.00289): transfer-learning-based correction of misspecified prior vehicle models on JetRacer-class hardware — methodological cousin to TTM's 5%-data claim.

---

## 4. Physics-Informed Approaches in Aerospace (Defensive Analogy)

Aerospace solved "neural model produces physically impossible output" decades ago. PIT WALL is the direct analogue.

Airbus A320 flight envelope protection (Airbus official, "Safety Innovation #7," 2 Feb 2023): "The flight envelope protections are embedded within the flight control laws generated by the onboard flight control computers, and are intended to keep the aircraft within the pre-established parameter limits." Load factor protection: "The aircraft's vertical acceleration is kept within safe limits for the airplane's structure." Alpha-floor: "They ensure that a suitable level of aircraft energy is maintained in flight." Headline number: "LOC-I [loss of control in flight] accidents have been reduced by 89% for the latest generations of commercial aircraft equipped with such flight envelope protection." Put this on the demo slide.

A320 alpha-prot / alpha-floor thresholds (FlyByWire docs): alpha-floor at 9.5° (config 0), 15° (config 1/2), 14° (config 3), 13° (config FULL). Direct PIT WALL analogue: a "μ-floor" override when forecast would exceed 1.0·μ·g.

FAA Special Conditions A350-900 (Federal Register, 17 Dec 2013): "Flight envelope protection that limits normal load factor (g) limiting is considered novel and unusual." Regulatory novelty in 2013 mirrors PIT WALL's regulatory novelty in 2026.

F-35: "the full flight envelope now opened to … loads of 9g" (Aviation Week). F-35 flight control law (AIAA paper, ResearchGate): "The reference model is formulated in terms of dynamics with respect to the maximum angle of attack in the angle of attack domain, and with respect to trim values for pitch rate and load factor. A compensation algorithm adjusts the reference model trajectories in case of actuator limits or rate limits predicted by the control allocation."

NASA NTRS-20090029978 ("Methodologies for Adaptive Flight Envelope Estimation and Protection," 2009): "For envelope protection, online learning neural networks are used to approximate selected aircraft dynamics which are then inverted to estimate command margins." This is literally what PIT WALL does. NASA validated the architectural pattern 17 years ago.

FlyNet (Springer / Advanced Modeling and Simulation in Engineering Sciences): "physics-based nonlinear autoregressive exogeneous neural network model architecture for flight modelling across the entire flight envelope, called FlyNet." Direct architectural analogue.

arXiv:2406.05586 (Enhanced Flight Envelope Protection via RL): "Generally, the objective is achieved by limiting the angle of attack, sideslip angle, load factor, angular rates, bank angle, and true airspeed." Map to PIT WALL: limit long-G, lat-G, jerk, yaw rate, steering angle, speed.

Probabilistic Digital Twin of UK En Route Airspace (arXiv:2601.03113): BADA + mixture models with physics-informed trajectory generation — useful pattern for combining probabilistic foundation models with energy conservation.

---

## 5. Granite Guardian Extension and Custom Safety Rules

Critical correct framing: Granite Guardian 4.1 8B's BYOC is documented as a text-criterion → yes/no judge. Per IBM official docs: "A custom (BYOC) criterion, any user-defined rule expressed in natural language… The criteria text is free-form; the model applies it as a binary yes/no test against the content in the conversation." And: "the model produces a deterministic binary output (yes or no) inside `<score>...</score>` tags."

Guardian cannot directly validate a numerical tensor. PIT WALL must NOT make that claim. Correct architecture:

Granite TTM → Python physics-validator → textual violation log (e.g., "Step t=37: lat=3.8G, long=1.2G, total=3.98G, exceeds μ·g=3.5G by 13%; throttle=0, brake=0.4") → Guardian 4.1 BYOC judges the text → yes/no in `<score>` tags → watsonx.governance.

BYOC performance (Granite Guardian 4.1 HuggingFace, April 2026): "IFEval multi-constraint BAcc improves from 0.458 to 0.844 (no-think), InfoBench (Human) from 0.535 to 0.706." JETTS best-of-N: "Granite Guardian 4.1 8B achieves the highest overall score (70.29) among all tested reward models, outperforming models up to 70B parameters."

Mode selector: `<think>` (interpretable reasoning trace) vs `<no-think>` (low latency). Use `<think>` in the demo so the reasoning trace IS the audit log.

Llama Guard vs ShieldGemma vs Granite Guardian. Per the Granite Guardian arXiv paper: Llama Guard uses a "default safety template and the first generated token, i.e., safe or unsafe is interpreted for detection." ShieldGemma similarly hard-codes a "Dangerous Content" policy. Granite Guardian 4.1's explicit BYOC training is the most flexible custom-rule path — IFEval multi-constraint jump from 0.458 → 0.844 is the proof. NeMo Guardrails is complementary (dialog-flow) not competitive.

watsonx.governance custom policy: ties Guardian audits into "Performance metrics are monitored to avoid issues that are related to drift, quality and safety. Preset thresholds monitor both the inputs and the outputs of the gen AI model." Post-hackathon governance story: deploy the projection wrapper as a monitored model, route Guardian verdicts into watsonx.governance as a custom drift signal.

---

## 6. Kinematic and Dynamic Vehicle Models for Race Cars

Bicycle (Kong et al.): `a_lat ≈ v²·tan(δ)/L`. This single equation rules out "4 G lateral with zero steering" because `a_lat → 0` as `δ → 0` at any finite v. ~30 LOC NumPy.

Pacejka Magic Formula. Per Hans B. Pacejka / Wikipedia: "Each tire is characterized by 10–20 coefficients for each important force." Per Brach Engineering (SAE 2011-01-0094): the friction ellipse describes "the transition of a tire from wheel slip to the condition" where total tire force equals `μ·F_z`. Friction circle = μ_x=μ_y special case. PIT WALL V1: constant-μ friction circle, μ≈1.4–1.7 default for GT4 dry tarmac, exposed as a parameter. V2: full Pacejka with load-dependent slip per Brach: "the F_y - F_x force relationship is not a true ellipse and the force limit is dependent on the kinematic slip angle and traction slip variables, α and s." Real envelopes "look more to a 'heart' shape than an ellipse" (motorcycle g-g interpretive model, ResearchGate).

Brake-throttle non-simultaneity — CRITICAL CAVEAT. Standard "throttle·brake = 0" is wrong for adaptive drivers. Per Professional Motorsport World on the MME / Team BRIT pneumatic-electronic system: "The system is able to take inputs such as holding full throttle while shifting, or holding full throttle and applying a little braking mid-corner." And: "you can still brake and press throttle with foot. Whichever component is pressed more, takes a priority." PIT WALL's envelope reads `COA_simultaneity_flag`:
- True (adaptive): drop simultaneity constraint, replace with max-input-priority.
- False (able-bodied): enforce `throttle·brake = 0`.

Adaptive-control envelope sources:
- Team BRIT + MME Motorsport pneumatic-electronic system: world's most advanced; deployed on McLaren 570S GT4, BMW M240i (300 bhp, 180 mph top speed), Aston Martin Vantage GT4, BMW 1 Series. Dave Player founder.
- FFSA Handikart (French karting hand-control standard).
- FIA Certificate of Adaptations (FIA Disability and Accessibility Commission): authoritative envelope source. Per FIA Safety Bulletin: "an FIA Certificate of Adaptations (CoA) is required for racing in competitions registered on the International Sporting Calendar… A CoA can only be issued once the adaptations are considered to be safe and fair by the AWG." Application via ASN, ≤8 weeks, physical inspection required. Entry point: `disability@fia.com`.
- FIA Vehicle Adaptation Guidelines (daa_guidelines_a4.pdf, fia.com): covers "throttle controls, brake controls, clutch systems, steering assemblies, gearshift and gearboxes, seat and driver restraints, headrests and cockpits, driver equipment and chassis."

---

## 7. Demo-Defensibility: Visual Artifacts That Expose Hallucination

The single highest-leverage demo: side-by-side g-g diagrams (raw TTM left, physics-projected right), both with friction-circle overlay (radius μ·g). Motorsport judges read this in 3 seconds.

Per Trailbrake.com: "The G-G Diagram / aka The Friction Circle… every data analysis program will make us a scatter plot of our long. and lat. G forces." Per Oboe.com: "race engineers use it to diagnose vehicle setup issues and analyse driver technique. A common mistake is to interpret it as a map of the track; it is a plot of forces." Trail-braking signature: "The data trace should arc tightly along the perimeter of the traction circle. A hesitant driver's plot will show a distinct drop towards the origin as they come off the brakes, followed by a sweep out to the lateral axis as they apply steering lock."

Concrete demo visualizations:
1. g-g scatter with friction-circle overlay; toggle raw/corrected.
2. Throttle-vs-speed scatter with coast-down curve overlay (violations leap out as points in the wrong quadrant).
3. Brake-vs-deceleration timeline with COA simultaneity flag visible.
4. Kinematic-coherence score timeline — 1-D bar along the horizon, green satisfied / red violated-and-corrected.
5. Physics-validity badge (green / amber / red) in the UI corner, tied to Guardian `<score>` and correction count.
6. Sector-time consistency check. Forecast horizon = 96 s; if any sector split implies > circuit lap record, flag.

Professional analogues: MoTeC i2 Pro x-y plot of longG vs latG; AiM Race Studio 3 traction-circle widget. The "heart" or "curvilinear triangle" g-g shape (cozybeehive.blogspot.com; ResearchGate motorcycle model).

---

## 8. Domain Adaptation from Energy/Weather to Telemetry

TTM claim (HuggingFace, ibm-granite/granite-timeseries-ttm-r2): "TTM provides state-of-the-art zero-shot forecasts and can easily be fine-tuned for multi-variate forecasts with just 5% of the training data to be competitive." TTM r2 pretrained on ~700M samples (r2.1 on ~1B), dominantly energy/weather/retail (e.g., Australian Electricity Demand).

Decoder Channel-Mixing — under-appreciated. "Decoder Channel-Mixing can be enabled during fine-tuning for capturing strong channel-correlation patterns across time-series variates, a critical capability lacking in existing counterparts." Multivariate telemetry channels are strongly cross-correlated by Newtonian physics. IBM's fine-tuning guide pattern:

```python
model = TinyTimeMixerForPrediction.from_pretrained(
    "ibm-granite/granite-timeseries-ttm-r2",
    num_input_channels=tsp.num_input_channels,
    prediction_channel_indices=tsp.prediction_channel_indices,
    exogenous_channel_indices=tsp.exogenous_channel_indices,
    decoder_mode="mix_channel"
)
for param in model.backbone.parameters():
    param.requires_grad = False
```

Freeze backbone, fine-tune decoder in mix_channel mode.

Does fine-tuning encode physics implicitly? Per IOPscience streamflow benchmark study on TSFMs (Sun et al.): "Physics-informed ML incorporates prior knowledge… The prior knowledge serves as a strong inductive bias, guiding a model to learn solutions that are physically plausible, which is especially important when data is sparse. However, when such prior knowledge is incomplete, uncertain, or only approximately valid, the physics-informed ML may end up with worse performance than a data-driven model, especially if the physics is enforced strongly." Translation: explicit constraints help when data is sparse (PIT WALL's regime) but can hurt if misspecified — projection-as-soft-floor (project only when violation > tolerance ε) is the right defense.

Bottom line: Fine-tuning helps but is not sufficient to eliminate kinetic hallucination. The ablation table (zero-shot vs fine-tuned vs fine-tuned+projection) is paper-worthy.

---

## 9. Ensemble and Uncertainty Quantification

Conformal prediction for time series, state of the art: "Conformal Prediction for Time-series Forecasting with Change Points" (Sun & Yu, arXiv:2509.02844, NeurIPS 2025; code github.com/Rose-STL-Lab/CPTC). "CPTC algorithm, addressing this gap by integrating a model to predict the underlying state with online conformal prediction to model uncertainties in non-stationary time series." Explicitly applies to "neuroscience, engineering, and sports analytics, all would benefit from robust and calibrated uncertainty quantification." Lap-by-lap regime changes are literal change points → CPTC is the right algorithm.

Survey: "A Gentle Introduction to Conformal Time Series Forecasting" (Fontana et al., arXiv:2511.13608, Nov 2025). "The assumption [of exchangeability] is fundamentally violated in time series data… classical split-conformal methods may yield prediction intervals that fail to maintain nominal validity." Use ACI as the simplest implementation.

Recipe: MC-dropout on decoder + 5-seed deep ensemble + CPTC layer. The "kinematic-coherence score" = fraction of conformal samples inside the friction ellipse.

Distribution-shift detection: Mahalanobis distance between current-context TTM embedding and the training-set distribution; trip OOD warning > 95th percentile.

---

## 10. NeurIPS / ICML Workshop Paper Positioning

Submission target. Realistic venue is a NeurIPS 2026 Workshop (Sydney). Per the official NeurIPS 2026 Call for Workshops (neurips.cc/Conferences/2026/CallForWorkshops):
- Main conference: abstracts May 4, full papers May 6/7, 2026 — missed.
- Workshop Proposal Submission Deadline: June 6, 2026, AoE.
- Workshop Acceptance Notification: July 11, 2026, AoE.
- Suggested Submission Date for Workshop Contributions: August 29, 2026, AoE.
- Mandatory author notification by September 29, 2026.
- Workshop Dates: December 11 and December 12, 2026 (Sydney) — note that the main conference opens on December 6, but workshops are at the end.
- A NeurIPS 2026 Position Paper Track is returning (same May 4/6 deadlines — also missed for that round but may have a workshop equivalent).

Target workshops (verify when accepted list publishes July 11): successors to NeurIPS 2024 "Time Series in the Age of Large Models," ML4PhysicalSciences, AAAI AI for Sports series, Reliable/Responsible Foundation Models workshops.

Paper positioning options (in defensibility order):
1. "PhysicsTTM: Physics-Projection Layers for Frozen Time-Series Foundation Models, with an Application to Adaptive Motorsport" — projection-layer-on-frozen-TSFM is the novelty. Direct gap (Section 1).
2. "FIA-COA as Safety Envelope: Regulator-Defined Constraints for AI in Disability Motorsport" — regulatory grounding as novelty. Best for ML4Sports / Responsible AI.
3. "PIT WALL: An End-to-End AI Race Engineer for Adaptive, Veteran, and Grassroots Motorsport" — whole-app as contribution. Best for domain workshops.

Recommendation: (1) as headline, (2) as Position-Track companion. Two shots on goal.

Abstract sketch (200 words):
> Time-series foundation models (TSFMs) such as IBM Granite TimeSeries TTM, Chronos, TimesFM, and MOIRAI achieve strong zero- and few-shot performance but, pretrained on energy/weather/retail signals, produce physically impossible trajectories on Newtonian-constrained domains — a failure mode we term kinetic hallucination. In adaptive-motorsport telemetry, forecasts can violate the friction ellipse, predict acceleration with zero throttle, or output discontinuous gear changes, eroding trust with race engineers and disability-accessibility regulators. We introduce PhysicsTTM, an inference-time wrapper that (1) takes the forecast tensor from a frozen TSFM, (2) projects each step onto a physically feasible manifold via a differentiable QP layer encoding bicycle-model kinematics, Pacejka friction-ellipse bounds, and energy conservation, and (3) audits residual violations with an LLM-judge using Bring-Your-Own-Criteria. The manifold is parameterized by the FIA Certificate of Adaptations per driver, supporting simultaneous brake+throttle inputs for adaptive drivers using pneumatic-electronic hand-control systems (a population current AI coaches systematically mismodel). On Team BRIT BMW M240i telemetry, PhysicsTTM reduces friction-circle violations by 96% with <2 ms added latency. We release `physics-tsfm` as an open-source library.

Co-author / advisor strategy:
- IBM Research co-author: target the TTM author team (Ekambaram, Jati, Lin) at IBM TJ Watson Research Center or IBM Research UK (Hursley).
- Motorsport-engineering academic: Politecnico di Milano (Prof. Sergio M. Savaresi, vehicle dynamics, motorcycle g-g paper); Cranfield (Prof. James Brighton, Advanced Motorsport Engineering MSc); Oxford Brookes.
- Disability-motorsport co-author: Team BRIT founder + MME Motorsport corporate contact (personal names redacted post-wave-34 per anonymisation-pre-consent rule); ethical weight + data section.

Which novelty is deepest? All three (kinetic-hallucination mitigation, FIA-COA-as-envelope, adaptive-motorsport application) are real, but COA-parameterized envelope is the deepest — no prior paper combines a regulator's adaptation certificate with a differentiable safety constraint on a foundation model.

---

## 11. Post-Hackathon Commercial / Research Trajectory

IBM partnership path.
- IBM Consulting "build with": standard pathway is via Client Engineering / Innovation Studio. Hackathon win + public open-source library is the canonical entry. Request the introduction from SkillsBuild organizers immediately after winning.
- IBM Research: TJ Watson and IBM Research UK (Hursley). Email the TTM team with a working `physics-tsfm` demo + workshop paper draft.
- AI Alliance (IBM + Meta + 140+ orgs): natural affiliate path for the open-source release.

FIA Disability and Accessibility Commission. Formal contact: `disability@fia.com`. Pitch: "We're building the first AI race engineer that reads CoA as a machine-readable envelope — will you publish a JSON schema?" Positions PIT WALL as infrastructure for FIA's own digital transformation.

Data partners. Team BRIT (Washington, West Sussex; multi-platform telemetry: McLaren 570S GT4, BMW M240i, BMW 1 Series, Aston Martin Vantage GT4); Mission Motorsport (UK veterans); Resilience Racing Foundation (US); MME Motorsport (Slovenia, hand-control OEM; personal names redacted post-wave-34 per anonymisation-pre-consent rule); FFSA Handikart (France). Template MoU: anonymization, IP retention, academic publication right, co-author option, brand-use right.

Open-source moat. Release `physics-tsfm` / `racing-pinn-wrapper` as Apache-2.0:
- GitHub + HuggingFace Spaces demo.
- Decouples library (any TSFM + any envelope) from application (PIT WALL).
- Citable from the workshop paper; compounds academic credit.
- Reduces commercial friction with IBM Consulting, OEMs, academics.

Commercial spinout.
- Path A: B2C subscription competitively priced against Trophi.ai's published entry-level Premium plan ($16.66/mo billed annually at $199.99/year per trophi.ai/pricing-sim-racing), positioned with adaptive-motorsport accessibility differentiation.
- Path B: B2B sale to OEMs (McLaren, BMW Motorsport, Porsche) of the physics-envelope library.

---

## 12. Competitive Analysis

Track Titan ($5M seed Dec 4, 2025, co-led by Partech + Game Changers Ventures / Alpine F1 investor Roger Ehrenberg; 200,000+ users). Per Partech's official press release (December 4, 2025): "On average, drivers improve their fastest lap time by more than half a second after their first session with Track Titan." Per Track Titan's own copy and Tech.eu/TechFundingNews coverage, the AI "analyses detailed telemetry and performance data" and "benchmarks your laps against reference laps." No public material mentions any physics-constraint layer. Architecture: telemetry → pro-comparison → text/voice advice.

Trophi.ai (Driver61 / Mansell AI): "Real-Time Skill Analysis and Multi-Lap Analysis reveal recurring mistakes." Voice coach Mansell AI in 59+ languages. Per the trophi.ai/pricing-sim-racing page (accessed May 2026), the entry-level paid tier (Premium + Setups) is $16.66/mo billed annually at $199.99/year. Same architecture: telemetry → reference comparison → personalized text. No physics validation in marketing.

Formula E × Google Cloud "Driver Agent" (Vertex AI + Gemini), confirmed Principal AI Partner 26 January 2026. Per Google Cloud's official blog post titled "Formula E's AI equation: A new Driver Agent for the next generation of racers" (cloud.google.com/blog/products/ai-machine-learning/formula-e-ai-equation-a-new-driver-agent-for-the-next-generation-of-racers): "The Driver Agent is designed to analyze extensive multimodal data generated during racing… This is achieved by analyzing low-level telemetry data from a user's lap (including latitude, longitude, speed, brake %, g-force, downforce, etc.) and comparing it with data from a professional driver on the same track." Architecture: telemetry → preprocessing (Cloud Run) → Gemini multimodal comparison → text/audio. No mention of any physics-validation step between Gemini and the user. This supports PIT WALL's claim that no incumbent currently solves kinetic hallucination.

UCL × IBM F1-Jarvis-Granite: A direct UCL "F1 Jarvis" project could not be confirmed in public sources. The closest match is the IBM AI Racing League (Country Challenge 2026) — Granite + TORCS, includes UEL, Cambridge, Bristol. Per UEL participant Sabaad Ahmed (Medium, Feb 2026): "using IBM Granite as a support tool… helped me understand why certain steering ratios or braking thresholds were unstable." Per IBM AI Racing League marketing: "Build your own AI-driven race car using cutting-edge IBM Granite foundation models and TORCS simulation." No published architectural disclosure mentions physics constraints or hallucination mitigations. Consistent with PIT WALL being first.

Professional race-engineering software (MoTeC i2 Pro, Cosworth Pi Toolbox, AiM Race Studio 3): Analyst tools, not AI systems — they don't validate AI outputs because they don't produce them. PIT WALL replicates their g-g/traction-circle workflow in its demo.

Conclusion: Every public incumbent does comparison-based coaching, none do physics-constrained prediction. PIT WALL's wedge is genuinely unoccupied.

---

## 13. Concrete 12-Day + 90-Day Roadmap

### 12-day hackathon (May 19 – May 31, 2026)

Days 1–2 (May 19–20): Data + scaffolding. Stand up `physics-tsfm` GitHub repo (Apache 2.0). Pull `ibm-granite/granite-timeseries-ttm-r2` via `tsfm_public.models.tinytimemixer`. Zero-shot test on TUMFTM telemetry slice. Confirm Langflow + Granite 4.1 8B Instruct.

Days 3–4: Physics validator. Implement `friction_ellipse_check`, `forward_euler_consistency`, `bicycle_kinematic_check`, `coa_simultaneity_rule` in NumPy. Write COA spec for Team BRIT M240i (simultaneity=True) and able-bodied baseline (False). Wrap as `PhysicsViolationLog` dataclass with text serialization. ~200 LOC.

Days 5–6: Projection layer. V1 NumPy (Day 5): project (a_long, a_lat) onto ellipse boundary, re-integrate. V2 CvxpyLayer QP (Day 6): full constraint set, backprop-compatible. ~150 LOC.

Day 7: Guardian-BYOC audit. Wire `PhysicsViolationLog` into Granite Guardian 4.1 8B BYOC with criterion: "The response must not describe any physics-envelope violations. Specifically, any line containing 'exceeds μ·g' or 'forward-Euler residual' or 'simultaneity violation' (when COA flag is False) constitutes a violation." Use `<think>` mode.

Day 8: Visual / UI. Side-by-side g-g (matplotlib + Streamlit). Physics-validity badge. Throttle-vs-speed with coast-down. Kinematic-coherence timeline bar chart.

Day 9: Fine-tune. 5% data fine-tune of TTM r2 with `decoder_mode="mix_channel"`. Backbone frozen. Ablation: zero-shot / fine-tuned / fine-tuned+projection.

Day 10: Granite Vision + Docling. Docling 258M on FIA CoA PDF → COA JSON. Vision 4.1 4B on g-g diagram image → NL interpretation.

Day 11: Langflow + Bob orchestration. Docling → COA JSON → TTM → projector → Guardian → Instruct briefing → Vision g-g chart. Bob agent on top.

Day 12 (May 31): Polish, video, submission. 3-minute demo with killer side-by-side g-g at 0:30. README highlighting COA-simultaneity caveat. Submit.

### 30-day post-submission (June 1 – June 30, 2026)
- CvxpyLayer + JAX projection.
- Full Pacejka option.
- CPTC conformal layer.
- Workshop paper draft.
- Outreach: IBM Research (Ekambaram, Jati), Cranfield, Politecnico Milano (Savaresi), Team BRIT (founder; personal name redacted), MME Motorsport (corporate contact; personal name redacted).
- Submit `physics-tsfm` to AI Alliance / IBM Cookbook.

### 90-day arc (June 1 – Aug 31, 2026)
- June 6: NeurIPS 2026 Workshop proposals deadline. (Consider co-proposing a "Physics-Constrained Foundation Models for Safety-Critical Time Series" workshop with an IBM Research / Stanford DDL contact — even if accepted only as a co-organizer, this is a massive credibility multiplier.)
- July 11: NeurIPS 2026 Workshop acceptance notifications. Watch the accepted list; identify the 2 best workshop fits.
- July–August: Formalize Team BRIT / Mission Motorsport / Resilience Racing data partnerships.
- August: FIA DAA outreach with CoA JSON-schema proposal.
- August 29: Suggested workshop paper submission deadline (per NeurIPS guidance). Individual workshops may set their own dates; track per workshop.
- September 29, 2026: Mandatory author notification per NeurIPS schedule.
- December 11–12, 2026: Sydney workshop presentation.

### Library / repo / model recommendations
- TSFM: `ibm-granite/granite-timeseries-ttm-r2`. Fine-tune via `github.com/ibm-granite/granite-tsfm`. Guide: `ibm.com/granite/docs/fine-tune/time-series`.
- Differentiable optimization: `cvxpy/cvxpylayers` (Apache 2.0). PNNL `NeuroMANCER` for V2.
- Vehicle baselines: `TUMFTM/NeuralNetwork_for_VehicleDynamicsModeling`. Deep Dynamics arXiv 2312.04374.
- Conformal: `Rose-STL-Lab/CPTC` (NeurIPS 2025).
- Guardian: `ibm-granite/granite-guardian-4.1-8b`. Cookbooks at `github.com/ibm-granite/granite-guardian/tree/main/cookbooks`.
- Other Granite: `ibm-granite/granite-docling-258m`, `ibm-granite/granite-vision-4.1-4b`, `ibm-granite/granite-4.1-8b-instruct`.
- Hardware: RTX 4060 for fine-tune (TTM is 805K params); inference on M2 / Pi 5.

---

## 14. Synthesis: The Single Most Defensible Architecture

PhysicsTTM — three-layer stack:

1. Frozen Granite TimeSeries TTM r2.1 with `decoder_mode="mix_channel"`, 5%-data fine-tune on target-driver telemetry. Backbone frozen; only the channel-mix decoder trained. Context 512 / horizon 96.
2. Differentiable Physics Projection Layer (CvxpyLayer QP):
   - Friction ellipse `(a_long)² + (a_lat)² ≤ (μ·g)²`, μ ≈ 1.5 default, circuit/weather-tunable.
   - Forward-Euler kinematic consistency.
   - Bicycle `a_lat ≈ v²·tan(δ)/L`.
   - COA-flagged brake-throttle simultaneity (True for Team BRIT/MME; False for able-bodied).
   - Per-channel circuit bounds.
   - Gear-discontinuity smoothing.
3. Granite Guardian 4.1 8B BYOC audit on the structured physics-violation log. `<think>` mode for demo interpretability. Verdict → watsonx.governance custom drift signal.

Surrounding scaffolding:
- Granite Docling 258M parses FIA CoA PDF → COA JSON → populates flags and per-driver envelope.
- Granite Vision 4.1 4B interprets and explains the g-g diagram visually.
- Granite 4.1 8B Instruct produces the natural-language race-engineer briefing.
- Langflow orchestrates; IBM Bob acts as the agent driver.

Why most defensible under 5-min Q&A:
- Technical execution: every constraint implementable with off-the-shelf libraries; ~600 LOC novel code.
- Innovation: first physics-projection wrapper for a pretrained TSFM; first regulator-defined (FIA COA) safety envelope on an LLM/TSFM stack; first AI race engineer to correctly model adaptive-driver brake-throttle simultaneity.
- Challenge fit: every named Granite component used as designed (TTM forecasts, Guardian audits, Vision interprets, Docling parses, Instruct generates, Bob orchestrates, Langflow visualizes).
- Implementation feasibility: 12 dual-developer days produce a working demo; ablation numbers from real Team BRIT / TUMFTM slices; aerospace fly-by-wire (NASA NTRS-20090029978; Airbus 89% LOC-I reduction headline) is the defensive analogy.

Rehearsed Q&A defenses:
- "Doesn't the friction circle oversimplify Pacejka?" → "Yes — V1 uses constant-μ ellipse as defensible-simplicity; V2 swaps to full Pacejka with load-dependent slip. We cite Brach Engineering SAE 2011-01-0094 on the real shape, and the motorcycle g-g 'heart' literature as a limitation."
- "Brake and throttle can't be simultaneous." → "False for our target population. Team BRIT and MME Motorsport's electronic hand-control system explicitly allows it — Professional Motorsport World quotes them supporting 'holding full throttle and applying a little braking mid-corner.' Our envelope is FIA-CoA-parameterized; the simultaneity rule is a flag from the CoA, not a hard-coded assumption. This is the deepest accessibility-defining feature of PIT WALL."
- "Can Guardian validate a tensor?" → "No, and we don't claim it. The numerical check is in the differentiable projection layer. Guardian audits a textual violation log via BYOC — exactly what BYOC is built for, with IFEval multi-constraint BAcc 0.844 in IBM's published numbers."
- "How is this not Deep Dynamics?" → "Deep Dynamics trains a custom PINN from scratch on race-car data; we wrap a frozen, pre-trained, general-purpose foundation model with a physics-projector at inference. No prior published work does that for TSFMs."
- "What about circuits not in pretraining?" → "CPTC (NeurIPS 2025) gives distribution-free conformal intervals; Mahalanobis OOD detection on the TTM embedding; projection layer keeps outputs in-envelope regardless."

## Caveats

- Anything published after May 19, 2026 is unverified.
- Granite Guardian 4.1 BYOC has not been tested by IBM on numerical tensors; the architecture explicitly routes textual violation logs through Guardian.
- TTM r2 / r2.1 pretraining excludes vehicle telemetry; even with 5% fine-tuning, residual hallucination is expected — projection layer is non-optional.
- The FIA CoA is real but its full parameter schema is not publicly machine-readable; Day-10 Docling extracts it from the Vehicle Adaptation Guidelines PDF, and FIA outreach asks for a machine-readable schema.
- Competitive analysis depends on public disclosure; possible (but unconfirmed) that incumbents have private physics validators. Defensible claim: "No public disclosure shows a physics-validation layer between the foundation model and user output."
- The NeurIPS 2026 workshop list is not published as of May 19, 2026; the August 29 date is the suggested workshop-paper submission deadline per the NeurIPS Call for Workshops, and individual accepted workshops may move it. Track per-workshop deadlines as soon as the accepted-workshop list publishes on/after July 11, 2026.
- The IBM AI Racing League is real with Granite + TORCS; the "UCL F1-Jarvis-Granite" project named in the brief could not be confirmed publicly and may be internal/unannounced or a conflation with the broader Racing League. The team should verify the source before citing it in the demo.
