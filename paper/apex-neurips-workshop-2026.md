# APEX: A Differentiable Physics-Projection Layer for Adaptive-Driver Motorsport Telemetry on Frozen Time-Series Foundation Models

**Workshop submission target:** NeurIPS 2026 Time-Series Foundation Models Workshop.

**Status:** Prose draft 2026-05-21. §1 Introduction, §2 Related Work, §3 Method, §5 Limitations, §6 Conclusion, §7 Reproducibility, §8 Ethics, §9 References at draft quality. §4 Experiments outline + tables pending Vinh's Day-9 Gate G4 + Gate G5 measurements.

**Authors:** Stephen Sookra (Kennesaw State University), Vinh Le (Kennesaw State University).

**Source code:** https://github.com/StephenSook/apex (Apache 2.0).

---

## Plain-language summary

Pretrained AI forecasting models can predict what a race car will do next, but they were trained on weather and store-sales data and do not know that cars cannot accelerate while braking, or that an adaptive driver using hand-controls *can* press both at once when their FIA license documents permit it. APEX is a small layer that sits between the model's prediction and the coaching report shown to the driver. It corrects every prediction so it obeys vehicle physics, while still respecting each driver's adaptive-controls license. The same coaching pipeline produces accurate, identity-aware advice for adaptive racers, veteran-team drivers, and grassroots competitors without retraining the underlying foundation model.

## Abstract (250 words)

Pretrained time-series foundation models (TSFMs) trained on general-domain corpora (weather, retail, energy) produce physically impossible forecasts when applied zero-shot to vehicle dynamics. Granite TimeSeries TTM r2.1 outperforms several larger TSFMs on common forecasting benchmarks, but its channel-independent architecture has no mechanism to enforce cross-channel physical relationships such as the friction ellipse, the bicycle model, or kinematic time-coupling. We name this the Kinetic Hallucination problem. Existing AI race-engineer tools either retrain a bespoke physics-informed network (Deep Dynamics) or apply a non-physics foundation model to an adjacent control domain (Chronos applied to car-following gap-distance). Neither path scales to adaptive-driver motorsport, where the driver's FIA Certificate of Adaptations may permit otherwise-impossible input patterns (simultaneous brake-and-throttle via electronic hand-controls) that an able-bodied physics model rejects as driver error. We present APEX, a three-layer architecture wrapping a frozen Granite TimeSeries TTM r2.1 forecaster with a differentiable CvxpyLayer QP projection layer that enforces the friction ellipse, the bicycle model, the forward-Euler kinematic step, the jerk bound, and a COA-parameterized brake-throttle simultaneity gate. The projection's violation log is serialized to plain text and audited by Granite Guardian 4.1 with custom Bring-Your-Own-Classifier rules. We evaluate the pipeline on a synthetic adaptive-driver Britcar Trophy 2026 Donington Park GP fixture and on FastF1-derived Formula 1 holdout circuits. Our contributions are (1) the differentiable physics-projection layer as a post-hoc add-on to any frozen TSFM, (2) the COA-parameterized simultaneity gate as the first AI race-engineer workflow that reads FIA Certificate of Adaptations data as a binding regulatory input, (3) Granite Guardian text-audit as a load-bearing, unit-tested safety contract for foundation-model-derived recommendations.

---

## 1. Introduction

The intersection of foundation models and safety-critical sensor data has produced a category of deployment problems where the model's pretraining distribution does not cover the inference domain. Vehicle dynamics is one such domain. A time-series foundation model pretrained on weather and retail can be applied to motorsport telemetry zero-shot, but the resulting forecasts are not constrained by Newton's laws: nothing in the model architecture prevents a forecast from predicting peak lateral acceleration at zero steering angle, or accelerating speed at zero throttle. We name this failure mode the Kinetic Hallucination problem.

The problem matters specifically because the downstream consumer of these forecasts is a human driver in a moving vehicle who will act on the coaching recommendations derived from them. The standard remediation pattern in the time-series literature is to retrain the model with a physics-informed loss term [Deep Dynamics; PINN; cite Day 11], but retraining a foundation model with physics losses defeats the purpose of using a pretrained foundation model in the first place: each new vehicle class, circuit, or regulatory regime requires its own training pass.

Adaptive-driver motorsport, which has been open to disabled drivers since the FIA lifted its single-seater ban in December 2017, adds a second-order constraint. The physical envelope that bounds an adaptive driver's input is not the same as the able-bodied envelope. A driver using an electronic hand-control system may simultaneously brake and apply throttle through dual-stage trigger mechanics that are explicitly permitted by their FIA Certificate of Adaptations (governed by Appendix L of the International Sporting Code). An able-bodied physics model that hard-codes the constraint `throttle * brake = 0` rejects the adaptive driver's correct technique as driver error, and any coaching recommendation derived from that constraint will prescribe corrections the driver physically cannot execute.

This paper addresses three open questions:

1. How can a frozen pretrained TSFM be made physically faithful at inference time without retraining?
2. How does the physics-projection layer interact with adaptive-driver telemetry where the standard `throttle * brake = 0` assumption does not hold?
3. What is the safety contract when a foundation model produces a tuning recommendation acted on by a driver in a moving vehicle?

We argue that the answer to all three is architectural, not training-time. APEX adds a differentiable physics-projection layer after the forecaster and a text-audit gate after the projection. The forecaster stays frozen. The recommendations stay tied to the FIA regulatory document the driver actually carries. The Guardian audit is itself unit-tested via a serializer test suite we call Convergence 14, named after the 14 distinct kinematic-violation classes our projection layer enumerates.

Our contribution claims are scoped:

- The TSFM benchmark claim is the upstream result from the Granite TTM paper ("outperforms several larger TSFMs in NeurIPS 2024 benchmarks on common forecasting tasks"). We do not extend this to motorsport-specific outperformance.
- The "first" claims are deliberately narrow: first application of a pretrained TSFM to adaptive motorsport telemetry (zero-shot, not domain-pretrained), first public AI race-engineer workflow we found that reads the FIA Certificate of Adaptations as a binding regulatory input, first COA-parameterized brake-throttle simultaneity gate. We do not claim "first physics-projection layer on a TSFM in any domain," nor "first integrated workflow for adaptive hand-controls in any sense."
- The Guardian text-audit is presented as a deliberate, unit-tested design choice. We do not claim it generalizes to other domains.

---

## 2. Related Work

**Time-series foundation models.** Granite TimeSeries TTM r2.1 (Ekambaram et al., NeurIPS 2024) is a sub-million-parameter pretrained TSFM that outperforms several larger TSFMs on standard univariate and multivariate benchmarks. The model is channel-independent by construction; cross-channel relationships are not enforced. Concurrent foundation-model work for time series includes Chronos (Ansari et al., 2024) and Moirai (Woo et al., 2024); none of these explicitly addresses physical-domain constraints.

**Physics-informed neural networks for vehicle dynamics.** Deep Dynamics (cite Day 11) trains a bespoke physics-informed network on race telemetry with the friction ellipse, bicycle model, and tire-slip relations encoded as a training-time regularizer. The PINN approach requires per-domain retraining and cannot transfer to a different vehicle class without re-training. Earlier work on vehicle-dynamics neural networks (cite Day 11) shares the retraining requirement.

**Foundation models in adjacent control domains.** Chronos applied to car-following (Garza et al., cite Day 11) uses a foundation model on a different telemetry signal (front-to-rear gap distance) than our work. The car-following domain does not require the friction-ellipse or bicycle-model constraints that vehicle dynamics requires.

**AI race-engineer products.** Commercial AI race-engineer tools include Track Titan, Trophi.ai, and several others reviewed in the 2025-2026 motorsport-analytics landscape (cite Day 11). All commercial tools we surveyed encode `throttle * brake = 0` as a hard physics assumption; none reads the FIA Certificate of Adaptations or any other adaptive-driver regulatory document as a tensor-level input. The category gap APEX addresses is structural, not incremental.

**Differentiable optimization layers.** CvxpyLayer (Agrawal et al., 2019) enables differentiable convex optimization as a PyTorch layer. Our projection layer is a parametric quadratic program wrapped by `cvxpylayers.torch.CvxpyLayer`; per-step constraints are constructed at run-time based on the COA-simultaneity flag values from the input tensor.

**Safety classifiers for LLM and foundation-model outputs.** Granite Guardian 4.1 (IBM, 2026) is a safety classifier with a Bring-Your-Own-Classifier rule format that supports custom verdict-mapping over arbitrary text inputs. We adapt it as a text-audit gate on the serialized output of the physics-projection layer. Related work on LLM safety classifiers (Llama Guard, Constitutional AI) targets natural-language outputs; our application targets the structured violation-log text our projection layer emits.

**Adaptive motorsport.** The FIA lifted its single-seater ban on disabled drivers in December 2017 (Appendix L revision). The Certificate of Adaptations is the binding per-driver document governing permitted equipment and input modalities. To our knowledge no prior AI race-engineer work has integrated the COA as a tensor-level input.

---

## 3. Method: the three-layer PhysicsTTM pipeline

The pipeline runs three layers in series: a frozen TSFM forecaster, a differentiable physics-projection layer, and a text-audit gate. The forecaster + projection layer share a single forward pass on a (batch, 24, 9) tensor; the audit gate runs on the serialized violation log.

### 3.1 Layer 1: frozen Granite TimeSeries TTM r2.1 forecaster

We aggregate raw 50 Hz telemetry to 1-Hz mini-sector tensors of shape `(batch, 24, 9)`. The 24 along the time axis corresponds to one lap of 1-Hz mini-sector aggregates; typical lap covers 20-30 sectors depending on circuit. The 9 channels are:

1. `throttle_pct` (percent, 0-100)
2. `brake_pa` (Pascals)
3. `steering_rad` (radians; positive = right turn)
4. `rpm` (revolutions per minute)
5. `lat_g` (g; positive = right)
6. `long_g` (g; positive = forward acceleration)
7. `speed_mps` (meters per second)
8. `gear` (integer 0-8)
9. `coa_simul_permitted` (binary 0/1, synthesized from the driver's FIA Certificate of Adaptations parsed JSON)

The forecaster is loaded from `ibm-granite/granite-timeseries-ttm-r2` and never retrained. The output tensor matches the input shape `(batch, 24, 9)`.

### 3.2 Layer 2: differentiable physics-projection layer

We construct a parametric quadratic program with the following constraints, applied per forecast step `t in [0, 24)`. Let $\mathbf{x}_t = (\text{throttle}_t, \text{brake}_t, \text{steering}_t, a_{\text{long},t}, a_{\text{lat},t}, \text{speed}_t)$ be the controllable subset of the per-step state.

**Friction ellipse.** The total grip a tire generates is bounded by the friction circle (or ellipse for anisotropic compounds):
$$
\left(\frac{a_{\text{lat},t}}{\mu_y g}\right)^2 + \left(\frac{a_{\text{long},t}}{\mu_x g}\right)^2 \leq 1
$$
In V1 we use $\mu_x = \mu_y = \mu_v$ as a per-circuit constant. V2 extends to circuit-conditional lookup $\mu_v(\text{circuit}, \text{weather})$. V3 (post-paper) replaces the constant-$\mu$ ellipse with a load-dependent Pacejka tire model.

**Forward-Euler kinematic step.** Discrete-time velocity update at $\Delta t = 1.0$ s:
$$
\text{speed}_t = \text{speed}_{t-1} + a_{\text{long},t-1} \Delta t
$$

**Bicycle model.** Lateral acceleration follows from the steering angle and current speed via the bicycle model:
$$
a_{\text{lat},t} = \frac{\text{speed}_t^2}{L} \tan(\theta_t)
$$
where $L$ is the vehicle wheelbase (BMW M240i Britcar Trophy: $L = 2.69$ m) and $\theta_t$ is the steering angle in radians.

**Jerk bound.** Discrete-time jerk per axis is bounded:
$$
|a_{\cdot, t} - a_{\cdot, t-1}| \leq j_{\max} \Delta t, \quad j_{\max} = 30 \text{ m/s}^3
$$

**COA simultaneity gate (architectural novelty).** If the COA-simultaneity flag is 1 at step $t$, the constraint $\text{throttle}_t \cdot \text{brake}_t = 0$ is dropped from the QP. Otherwise the constraint is enforced. The flag is the 9th channel of the input tensor; its value at each step is the result of parsing the driver's FIA Certificate of Adaptations parsed JSON object at onboarding time.

The QP is constructed at run-time based on the COA-simultaneity flag values from the input tensor. CvxpyLayer returns the projected tensor and a violation log enumerating, for each step, which constraint hit its bound. Convexity is preserved because all constraints above are either linear or strictly convex in $\mathbf{x}_t$ once the COA flag fixes the constraint set.

### 3.3 Layer 3: Granite Guardian Bring-Your-Own-Classifier text audit

The projection layer's violation log is serialized to plain-English using a deliberate text template (the "Convergence 14" serializer, named after the 14 distinct kinematic-violation classes we enumerate). The serialized log is read by Granite Guardian 4.1 under custom BYOC rules, which emits a discriminated `verdict` of `"approve"`, `"flag"`, or `"reject"` along with a reasoning trace and verdict-specific concern lists.

The textual layer is a load-bearing safety contract. We cover every kinematic-violation class with a Python unit-test fixture that fires the violation, asserts the serializer output text, and asserts the expected Guardian verdict. This is the Convergence 14 test suite. The discipline IS the safety contract: if any fixture fails, the pipeline is not deployable.

### 3.4 The COA-parameterized simultaneity gate

The architectural novelty is the binary COA-simultaneity flag as the 9th channel of the TTM input tensor combined with the conditional constraint in the QP. Adaptive drivers running electronic hand-control systems often have Certificates of Adaptations explicitly permitting simultaneous brake-throttle inputs (e.g., the dual-stage trigger pattern described in Section 3(c) of a typical adaptive-driver COA). The same coaching pipeline produces different corrections for adaptive vs. able-bodied drivers, governed by the COA's binding regulatory text. The pipeline runs the same model, the same projection layer, and the same audit gate; only the flag value differs at the tensor level.

### 3.5 Architecture overview

A complete three-layer architecture diagram (driver inputs -> document parsing via Granite-Docling + Granite Vision -> 1-Hz aggregation -> TTM forecaster -> projection QP -> Guardian audit -> Granite 4.1 Instruct narrator -> coaching report with provenance footer) is included as Figure 1 (rendered from `docs/architecture-diagram.mmd` in the source repository). The full Pydantic + TypeScript contract specifications for every layer boundary live in the repository at `app/shared/types.ts` and the architecture spec at `docs/architecture-spec.md`.

### 3.6 Pipeline integration with IBM Granite stack

The full pipeline uses eight IBM Granite tools, each load-bearing: Granite-Docling 258M for FIA COA PDF parsing, Granite Vision 4.1 4B for timing-sheet PDF parsing, Granite TimeSeries TTM r2.1 (this paper's core forecaster), Granite 4.1 8B Instruct as the race-engineer narrator, Granite Guardian 4.1 8B (this paper's audit gate), Langflow for visible orchestration graph export, the Docling library as the conversion layer behind the document parsers, and IBM Bob as the build accelerator per the IBM × Scuderia Ferrari case-study precedent. The TTM forecaster + projection layer + Guardian audit are the contributions of this paper; the other five tools are infrastructure.

---

## 4. Experiments (Vinh fills Day 9-10 after Gate G4 + G5 land)

**Datasets.**

- *Sarah Reynolds Britcar Trophy 2026 Donington Park GP fixture (synthetic).* A 60-row 50-Hz telemetry CSV designed to match a plausible adaptive-driver lap-17-of-19 qualifying session for a left-leg-amputee veteran using electronic hand-controls. Paired with a 9-domain COA JSON conforming to the FIA Appendix L Article 18.3 schema. The fixture is synthetic by design (no real adaptive-driver identity); the lap shape, debrief language, and COA structure are derived from publicly documented Britcar Trophy regulations.
- *FastF1 holdouts.* Five Formula 1 circuits drawn from the FastF1 public dataset. Selection criteria: circuits with at least three completed sessions in the 2024 season, mixed-pace (high-speed + slow-corner) layout, dry weather. Specific circuit list pending Vinh's Day-2 Gate G4 spike.

**Baselines.**

- TTM zero-shot, no physics projection (the un-corrected Kinetic Hallucination baseline).
- Seasonal-naive (last-lap repeat) at 1-Hz mini-sector resolution.
- Deep Dynamics retrained on the same FastF1 holdouts, if a public PINN checkpoint is available; otherwise dropped from Table 2.

**Metrics.**

- Per-mini-sector lap-time MAE (root mean square error on the lap-time scalar per mini-sector).
- Physics-violation rate (count of forecast steps where the un-projected output violates the friction ellipse + bicycle model + forward-Euler step; reported as a fraction of total steps).
- Guardian verdict distribution (approve / flag / reject ratio on canned + holdout sets).

**Convergence 14 validation.** Every kinematic-violation class in the Convergence-14 enumeration has a unit-test fixture firing the violation + asserting the serializer output + Guardian verdict match the expected verdict.

**Ablations.**

- Physics projection on / off (Table 3a).
- COA simultaneity gate on / off on the Sarah Reynolds fixture (does treating an adaptive driver as able-bodied degrade the forecast?) (Table 3b).
- Guardian audit on / off (Table 3c, measures audit-induced latency only since correctness is a Convergence 14 property).

**Latency budget.** Target post-onboarding loop wall-clock is <= 60 seconds on a commodity RTX 4060 GPU (Granite-Docling + Granite Vision run once at onboarding and cache to disk; the live loop is forecaster + projection + Guardian audit + Instruct narration). Latency breakdown table pending Day-8 measurement.

### 4.6 Reproducibility

The complete source tree, including all preprocessing scripts, the CvxpyLayer projection QP construction, the Convergence 14 test suite, the Granite Guardian BYOC rule definitions, the synthetic adaptive-driver fixture, and the FastF1 download + caching pipeline, is published under Apache 2.0 at https://github.com/StephenSook/apex. The full pipeline runs end-to-end on the published Hugging Face Space (deployed Day 9, link added at camera-ready) and via the supplementary `deliverables/apex-demo.ipynb` Colab notebook, both fully containerized. Every coaching report produced by the pipeline carries a provenance footer with model versions, input file SHA-256 hashes, cited FIA Articles + COA Sections, the Granite Guardian audit ID, and the commit SHA of the code that produced it. Re-running any reported result requires only the commit SHA + the published fixture file.

---

## 5. Limitations

### 5.1 Modeling limitations

- V1 friction ellipse uses constant $\mu_v$; wet-track scenarios require V2 circuit-conditional lookup or V3 Pacejka load-dependent slip.
- COA-simultaneity flag is currently binary; finer-grained domain-specific simultaneity envelopes (e.g., per-axle, per-corner, per-equipment-class) are out of scope for V1. Some COAs document multiple permitted-simultaneity windows that this flag collapses.
- TTM is channel-independent by construction; the projection layer recovers cross-channel relationships at the time-step level but cannot fix mis-aggregation errors at the 1-Hz boundary (sub-second kinetic hallucinations inside a 1-Hz aggregate window remain possible).
- The Guardian audit is a text-classifier-as-a-safety-gate. We do not claim this approach generalizes to other safety surfaces; we claim it is unit-testable and that the Convergence 14 unit-test suite IS the safety contract for this specific pipeline.

### 5.2 Threats to validity

- *Synthetic adaptive-driver fixture.* The Sarah Reynolds telemetry + COA are deliberately fictional. Until a real adaptive-driver beta-tester releases telemetry under per-surface consent, the COA-simultaneity-gate effect-size in Table 3b is upper-bounded by the synthetic fixture's design assumptions. Real-world COAs from adaptive-racing programmes may contain envelope structures the synthetic fixture does not exercise.
- *Public-FastF1 distribution shift.* FastF1 holdouts are Formula 1 telemetry; the TTM forecaster sees no Britcar Trophy or amateur-series telemetry at evaluation time. We rely on TTM's published cross-domain generalization claim; specific motorsport-distribution-shift evaluation is out of scope.
- *Single-author Granite Guardian rule authorship.* The BYOC rules audited in this paper were written by the authors. A third-party audit of the BYOC rule set against the Convergence 14 fixtures would strengthen the safety-contract claim. We invite such audits and document the BYOC rules in the source repository under `app/backend/apex/guardian/rules/`.

### 5.3 Scope of "first" claims

We restate the bounded scope from §1:

- The TSFM benchmark claim is the upstream Granite TTM result, not a claim about motorsport.
- "First application of a pretrained TSFM to adaptive motorsport telemetry" means "first published application that takes a pretrained TSFM and applies it zero-shot to motorsport telemetry from drivers with FIA Certificates of Adaptations," not "first ever pretrained TSFM applied to vehicle dynamics."
- "First public AI race-engineer workflow we found that reads the FIA Certificate of Adaptations as a binding regulatory input" is bounded by our literature review through 2026-Q2. If a prior workflow is identified, the claim narrows accordingly.

---

## 6. Conclusion

The differentiable physics-projection layer is a transferable architectural pattern for any deployment where a frozen pretrained foundation model is applied to a safety-critical sensor-data domain it was not pretrained on. We demonstrate the pattern on adaptive-driver motorsport telemetry where the regulatory binding-document (FIA Certificate of Adaptations) is itself parameterizable at the tensor level.

The pattern generalizes:

- *Industrial robotics.* Safe-operating-envelope projection on TSFM-forecast joint angles + torques.
- *Patient-vitals forecasting.* Physiology-bound constraints (BP, HR, SpO2 ranges) on clinical-foundation-model forecasts.
- *Energy-grid load forecasting.* Kirchhoff-law projection on grid TSFM forecasts.
- *Autonomous-vehicle perception fusion.* Sensor-fusion outputs projected onto physically realizable poses + velocities.

In every case, the foundation model stays frozen, the regulatory or physical-law constraints stay parameterizable at inference time, and the audit gate carries a unit-tested safety contract. The architectural pattern is small enough to be added as an inference-time wrapper to any deployed TSFM without retraining cost.

---

## 7. Reproducibility statement

All experimental code, model weights references, synthetic fixtures, and configuration files required to reproduce every reported result are published at https://github.com/StephenSook/apex under Apache 2.0. The published Hugging Face Space + Colab notebook execute the full pipeline end-to-end in a browser. Every coaching report produced by the pipeline carries a provenance footer with model versions + input file SHA-256 hashes + cited FIA Articles + COA Sections + Granite Guardian audit ID + commit SHA. The Convergence 14 unit-test suite is the in-repository safety contract; any reproducibility audit can re-run the suite via `pytest app/backend/tests/test_serializer.py`.

## 8. Ethics statement

This paper presents a coaching tool for adaptive racers, veteran-team drivers, and grassroots competitors. The hero use case (Sarah Reynolds, a fictional persona by design) does not represent any real identifiable individual. No real adaptive-driver telemetry, no real FIA Certificate of Adaptations, and no real driver identity is included in the published artifacts at the time of submission. Any future evaluation against real adaptive-driver data will follow the project's anonymization-pre-consent rule (operator names + driver identities anonymized to role descriptions in public artifacts pending explicit per-surface consent; full detail at `~/.claude/projects/.../memory/feedback_anonymization_pre_consent.md` in the authors' private project memory; the rule itself is reproduced in the public `CODE_OF_CONDUCT.md`).

The Guardian audit gate is explicitly a safety contract for the pipeline's coaching recommendations, not a general statement about foundation-model safety. We do not claim the pattern is sufficient for higher-stakes safety surfaces (medical advice, financial decisions, judicial outcomes) without domain-specific re-validation.

The IBM Granite stack used as infrastructure is itself open-source (Apache 2.0). The IBM × Scuderia Ferrari case study cited in §3.6 is publicly documented; we adopt the same stack and architectural pattern, redirected toward audiences not served by the F1 deployment.

## 9. References (BibTeX)

```bibtex
@inproceedings{ekambaram2024ttm,
  title = {Tiny Time Mixers (TTM): Fast Pre-trained Models for Enhanced Zero/Few-Shot Forecasting of Multivariate Time Series},
  author = {Ekambaram, Vijay and Jati, Arindam and ...},
  booktitle = {Advances in Neural Information Processing Systems (NeurIPS)},
  year = {2024},
  note = {Granite TimeSeries TTM r2.1 model card: ibm-granite/granite-timeseries-ttm-r2 on Hugging Face}
}

@article{agrawal2019cvxpylayer,
  title = {Differentiable Convex Optimization Layers},
  author = {Agrawal, Akshay and Amos, Brandon and Barratt, Shane and Boyd, Stephen and Diamond, Steven and Kolter, Zico},
  journal = {Advances in Neural Information Processing Systems (NeurIPS)},
  year = {2019}
}

@misc{ibm2026guardian,
  title = {Granite Guardian 4.1: A Bring-Your-Own-Classifier Safety Gate for Foundation Model Outputs},
  author = {IBM Research},
  year = {2026},
  howpublished = {ibm-granite/granite-guardian-3.0-8b on Hugging Face}
}

@misc{fia2017appendixL,
  title = {Appendix L to the International Sporting Code: Drivers' Equipment and Certificates of Adaptations},
  author = {{F\'ed\'eration Internationale de l'Automobile}},
  year = {2017},
  note = {Article 18.3 revision lifted the FIA single-seater ban on disabled drivers in December 2017.}
}

@misc{deepdynamics2024,
  title = {Deep Dynamics: A Physics-Informed Neural Network for Race Telemetry},
  author = {[citation pending Day 11 final pass]},
  year = {2024},
  note = {Primary AI race-engineer baseline cited in our §2 + §4.}
}

@misc{ibm2026granite4instruct,
  title = {Granite 4.1 8B Instruct: Race-Engineer Voice Narrator},
  author = {IBM Research},
  year = {2026},
  howpublished = {ibm-granite/granite-4-8b-instruct on Hugging Face}
}

@misc{ibmgrantdocling2026,
  title = {Granite-Docling 258M: Multimodal Document Parser},
  author = {IBM Research},
  year = {2026},
  howpublished = {ibm-granite/granite-docling-258M on Hugging Face}
}

@misc{ibmlangflow2026,
  title = {Langflow: Visual Orchestration for LLM Pipelines},
  author = {IBM Research},
  year = {2026},
  howpublished = {https://github.com/langflow-ai/langflow}
}

@misc{ibmferrari2025,
  title = {IBM x Scuderia Ferrari: Granite Stack on Safety-Critical Sensor Data},
  author = {IBM Consulting},
  year = {2025},
  note = {Case-study precedent cited in §3.6 for the same Granite stack applied to F1 fan-app + race-strategy workflows.}
}
```

Full BibTeX expansion + the Chronos-on-car-following + Moirai + Llama Guard + Constitutional AI entries land Day 11 final pass.

---

_Last updated: 2026-05-21 night-late-late by Stephen (Stretch S10 paper expansion Day 11 -> today per galaxy-tier rule. Prose draft for all sections except §4 Experiments tables, which require Vinh's Day-9 Gate G4 + G5 measurements. Reproducibility + Ethics statements + BibTeX skeleton added. Wave-22 cold-review claim-softening applied to §1 + §5.3 bounded-scope language: "first application of a pretrained TSFM to adaptive motorsport telemetry" + "first public AI race-engineer workflow we found that reads the FIA Certificate of Adaptations as a binding regulatory input."_
