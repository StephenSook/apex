# APEX: A Differentiable Physics-Projection Layer for Adaptive-Driver Motorsport Telemetry on Frozen Time-Series Foundation Models

**Workshop submission target:** NeurIPS 2026 Time-Series Foundation Models Workshop

**Status:** Draft outline, 2026-05-21. Prose + method written; experiments + ablations pending Vinh's Day-9 Gate G4 + Gate G5 results.

**Authors:** Stephen Sookra (Kennesaw State University), Vinh Le (Kennesaw State University).

**Source code + reproducibility:** https://github.com/StephenSook/apex (Apache 2.0).

---

## Abstract (target 250 words, draft 240)

Pretrained time-series foundation models (TSFMs) trained on general-domain corpora (weather, retail, energy) can produce physically impossible forecasts when applied to vehicle dynamics. Granite TimeSeries TTM r2.1 outperforms several larger TSFMs on common forecasting benchmarks, but its channel-independent architecture has no mechanism to enforce cross-channel physical relationships (the friction ellipse, the bicycle model, kinematic time-coupling). We name this the Kinetic Hallucination problem. Existing AI race-engineer tools either retrain a bespoke physics-informed network (Deep Dynamics) or apply a non-physics foundation model to a different control domain (Chronos on car-following). Neither path scales to adaptive-driver motorsport, where the driver's FIA Certificate of Adaptations may permit otherwise-impossible input patterns (simultaneous brake-and-throttle via electronic hand-controls) that an able-bodied physics model rejects as driver error. We present APEX, a three-layer architecture wrapping a frozen Granite TimeSeries TTM r2.1 forecaster with a differentiable CvxpyLayer QP projection layer that enforces the friction ellipse, the bicycle model, the forward-Euler kinematic step, the jerk bound, and a COA-parameterized brake-throttle simultaneity gate. The projection layer's violation log is serialized to plain text and audited by Granite Guardian 4.1 with custom Bring-Your-Own-Classifier rules. We evaluate the pipeline on synthetic adaptive-driver telemetry matching the FIA Appendix L COA structure and on FastF1-derived Formula 1 holdout circuits. Our key contributions are: (1) the differentiable physics-projection layer as a post-hoc add-on to any frozen TSFM, (2) the COA-parameterized simultaneity gate as the first integrated workflow for adaptive hand-controls, (3) Granite Guardian text-audit as a load-bearing safety contract for foundation-model-derived recommendations.

---

## 1. Introduction (1 page)

The intersection of foundation models and safety-critical sensor data has produced a category of deployment problems where the model's pretraining distribution does not cover the inference domain. Vehicle dynamics is one such domain. A TSFM pretrained on weather and retail can be applied to motorsport telemetry zero-shot, but the resulting forecasts are not constrained by Newton's laws.

This paper addresses three open questions:

1. How can a frozen pretrained TSFM be made physically faithful at inference time without retraining?
2. How does the physics-projection layer interact with adaptive-driver telemetry where the standard `throttle * brake = 0` assumption does not hold?
3. What is the safety contract when a foundation model produces a tuning recommendation acted on by a driver in a moving vehicle?

We argue that the answer to all three is architectural, not training-time. APEX adds a differentiable physics-projection layer after the forecaster and a text-audit gate after the projection. The forecaster stays frozen. The recommendations stay tied to the FIA regulatory document the driver actually carries. The Guardian audit is itself unit-tested via a serializer test suite we call Convergence 14.

The contribution claims are bounded:

- The TSFM benchmark claim is "outperforms several larger TSFMs in NeurIPS 2024 benchmarks on common forecasting tasks" (Granite TTM paper). We do not extend this to motorsport-specific outperformance.
- The "first" claims are scoped: first pretrained TSFM applied to motorsport telemetry, first integrated workflow for adaptive hand-controls, first COA-parameterized brake-throttle simultaneity gate. We do not claim first physics-projection layer on a TSFM in any domain.
- The Guardian text-audit is presented as a deliberate design choice with deliberate test coverage, not as a general safety solution.

## 2. Related work (1 page)

**Time-series foundation models.** Granite TimeSeries TTM r2.1 (Ekambaram et al., NeurIPS 2024) is a sub-million-parameter pretrained TSFM that outperforms several larger TSFMs on common forecasting benchmarks. The model is channel-independent by default; cross-channel physical relationships are not enforced.

**Physics-informed networks for vehicle dynamics.** Deep Dynamics (citation pending Day 11) trains a bespoke physics-informed neural network on race telemetry, with the physics constraints encoded as a training-time regularizer. The PINN approach requires per-domain retraining and cannot be transferred to a different vehicle class without re-training.

**Foundation models in adjacent control domains.** Chronos-on-car-following (Garza et al., citation pending) applies Chronos to a different forecaster on different inputs (car-following gap-distance prediction, not full-vehicle dynamics).

**AI race-engineer tools.** Track Titan and Trophi.ai are the two best-known commercial offerings. Both encode `throttle * brake = 0` as a hard physics assumption. Neither reads the FIA Certificate of Adaptations.

**Differentiable optimization layers.** CvxpyLayer (Agrawal et al., 2019) enables differentiable convex optimization as a PyTorch layer. Our projection layer is a parametric QP wrapped by `cvxpylayers.torch.CvxpyLayer`.

**Safety classifiers for LLM outputs.** Granite Guardian 4.1 (IBM, 2026) is a safety classifier with a Bring-Your-Own-Classifier rule format. We adapt it as a text-audit gate on the serialized output of the physics-projection layer.

## 3. Method: the three-layer PhysicsTTM pipeline (1.5 pages)

### 3.1 Layer 1: frozen Granite TimeSeries TTM r2.1 forecaster

We aggregate raw 50 Hz telemetry to 1-Hz mini-sector tensors of shape `(batch, 24, 9)` where the 9th channel is a binary COA-simultaneity flag synthesized from the FIA Certificate of Adaptations parsed JSON. The forecaster is loaded from `ibm-granite/granite-timeseries-ttm-r2` and never retrained. The output is `(batch, 24, 9)` matching the input shape.

### 3.2 Layer 2: differentiable physics-projection layer

We construct a parametric QP with the following constraints, applied per forecast step `t in [0, 24)`:

**Friction ellipse:** $a_{\text{lat},t}^2 + a_{\text{long},t}^2 \leq (\mu_v g)^2$, with $\mu_v$ a per-circuit constant in V1 and a circuit-conditional lookup $\mu_v(\text{circuit}, \text{weather})$ in V2.

**Forward-Euler kinematic step:** $\text{speed}_t = \text{speed}_{t-1} + a_{\text{long},t-1} \Delta t$, with $\Delta t = 1.0$ s.

**Bicycle model:** $a_{\text{lat},t} = (\text{speed}_t^2 / L) \tan(\theta_t)$, with $L$ the vehicle wheelbase and $\theta_t$ the steering angle in radians.

**Jerk bound:** $|a_{\cdot, t} - a_{\cdot, t-1}| \leq \text{jerk}_{\max} \Delta t$, with $\text{jerk}_{\max} = 30$ m/s$^3$.

**COA simultaneity gate:** if the COA-simultaneity flag is 1 at step $t$, the constraint $\text{throttle}_t \cdot \text{brake}_t = 0$ is dropped. Otherwise it is enforced.

The QP is constructed at run-time based on the COA-simultaneity flag values from the input tensor. CvxpyLayer returns the projected tensor and a violation log enumerating each step where a constraint hit its bound.

### 3.3 Layer 3: Granite Guardian Bring-Your-Own-Classifier text audit

The violation log is serialized to plain-English using a deliberate text template (the "Convergence 14" serializer). Granite Guardian 4.1 reads the serialized log under custom BYOC rules and emits a discriminated `verdict` of `"approve"`, `"flag"`, or `"reject"` along with a reasoning trace and verdict-specific concern lists. The textual layer is a load-bearing safety contract; we cover every kinematic violation type with a Python unit-test fixture verifying both the serializer output and the expected Guardian verdict.

### 3.4 The COA-parameterized simultaneity gate

The architectural novelty is the binary COA-simultaneity flag as the 9th channel of the TTM input tensor + the conditional constraint in the QP. Adaptive drivers running electronic hand-control systems often have FIA Certificates of Adaptations explicitly permitting simultaneous brake-throttle inputs (e.g., the dual-stage trigger pattern described in Section 3(c) of a typical adaptive-driver COA). The same coaching pipeline produces different corrections for adaptive vs. able-bodied drivers, governed by the COA's binding regulatory text.

## 4. Experiments (1 page, Vinh fills Day 9-10)

**Datasets.**
- Synthetic adaptive-driver Britcar Trophy 2026 Donington Park GP qualifying session (Sarah Reynolds canned fixture; 60-row 50 Hz CSV + 9-domain COA JSON).
- FastF1 holdouts: 5 Formula 1 circuits (TBD Vinh Day 2 Gate G4 spike).

**Baselines.**
- TTM zero-shot, no physics projection.
- Seasonal-naive (last-lap repeat).
- (Optional) Deep Dynamics retrained, if checkpoint available.

**Metrics.**
- Per-mini-sector lap-time MAE.
- Physics-violation rate (count of forecast steps where the un-projected output violates the friction ellipse + bicycle model + forward-Euler step).
- Guardian verdict distribution (approve / flag / reject ratio on canned + holdout sets).

**Convergence 14 validation.** Every kinematic-violation type has a unit-test fixture firing the violation + asserting the serializer output + Guardian verdict match the expected verdict.

**Ablations.**
- Physics projection on / off.
- COA simultaneity gate on / off (does treating an adaptive driver as able-bodied degrade the forecast?).
- Guardian audit on / off.

## 5. Limitations (0.5 page)

- V1 friction ellipse uses constant $\mu_v$; wet-track scenarios require V2 circuit-conditional lookup or V3 Pacejka load-dependent slip.
- COA-simultaneity flag is currently binary; finer-grained domain-specific simultaneity envelopes (e.g., per-axle, per-corner) are out of scope for V1.
- TTM is channel-independent; the QP recovers cross-channel relationships but cannot fix mis-aggregation errors at the 1-Hz boundary.
- The Guardian audit is a text-classifier-as-a-safety-gate. We do not claim this generalizes; we claim it is unit-testable and that the unit-test suite IS the safety contract.

## 6. Conclusion (0.5 page)

The differentiable physics-projection layer is a transferable architectural pattern for any deployment where a frozen pretrained foundation model is applied to a safety-critical sensor-data domain it was not pretrained on. We demonstrate the pattern on adaptive-driver motorsport telemetry where the regulatory binding-document (FIA Certificate of Adaptations) is itself parameterizable at the tensor level. The pattern generalizes to industrial robotics (safe-operating-envelope projection on TSFM forecasts), patient-vitals forecasting (physiology-bound constraints on clinical foundation models), and energy-grid load forecasting (Kirchhoff-law projection on grid TSFMs).

## References

(BibTeX block, Day 11 fill from architecture-spec.md citations + Phase 4.5 synthesis source list + the verified-fact memory in `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/reference_verified_facts_day1.md`.)

---

_Last updated: 2026-05-21 evening by Stephen. Stretch S10 prose draft Day-2 pull-forward per galaxy-tier rule. Vinh fills §4 experiments + ablations + final reference list Day 9-10 after Gate G4 + G5 results land._
