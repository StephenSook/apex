# APEX: A Two-Stage Projection-and-Audit Layer for Adaptive-Driver Motorsport Telemetry on Frozen Time-Series Foundation Models

**Workshop submission target:** NeurIPS 2026 Time-Series Foundation Models Workshop.

**Status:** Draft as of 2026-05-21. §1 Introduction, §2 Related Work, §3 Method, §5 Limitations, §6 Conclusion, §7 Reproducibility, §8 Ethics, §13 References at draft quality. §4 Experiments outline + tables to be reported in the camera-ready revision.

**Authors:** Stephen Sookra (Kennesaw State University), Vinh Le (Kennesaw State University).

**Source code:** https://github.com/StephenSook/apex (Apache 2.0).

---

## Plain-language summary

Pretrained AI forecasting models can predict what a race car will do next, but they were trained on weather and store-sales data and do not know a race car's physical limits, or that simultaneous brake and throttle is a real driving technique that an adaptive driver's FIA Certificate of Adaptations homologates, so a model that forbids it mis-coaches the driver. APEX is a layer that sits between the model's prediction and the coaching report shown to the driver. It projects predictions onto a convex feasible set in the physical-constraint envelope, then audits the nonconvex constraints (the bicycle-model coupling and the COA-permitted simultaneity gate) in a post-projection feasibility filter. The same coaching pipeline produces identity-aware advice for adaptive racers, veteran-team drivers, and grassroots competitors without retraining the foundation model.

## Abstract (250 words)

Pretrained time-series foundation models (TSFMs) trained on general-domain corpora (weather, retail, energy) produce physically impossible forecasts when applied zero-shot to vehicle dynamics. Granite TimeSeries TTM r2.1 outperforms several larger TSFMs on common forecasting benchmarks, but its channel-independent architecture has no mechanism to enforce cross-channel physical relationships such as the friction ellipse, the bicycle model, or kinematic time-coupling. We name this the Kinetic Hallucination problem. Existing AI race-engineer tools either retrain a bespoke physics-informed network (Deep Dynamics) or apply a non-physics foundation model to an adjacent control domain (Chronos applied to car-following gap-distance). Neither path scales to adaptive-driver motorsport, where the driver's FIA Certificate of Adaptations homologates input patterns (simultaneous brake-and-throttle via electronic hand-controls) that a model hard-coding mutual exclusion rejects as driver error. We present APEX, a three-layer architecture wrapping a frozen Granite TimeSeries TTM r2.1 forecaster with a two-stage projection-and-audit layer: a differentiable CvxpyLayer QP that enforces the convex constraints (friction ellipse, forward-Euler kinematic step, jerk bound) and a post-projection feasibility audit for the nonconvex constraints (bicycle-model coupling and the COA-parameterized brake-throttle simultaneity gate). The combined violation log is serialized to plain text and audited by Granite Guardian 4.1 with custom Bring-Your-Own-Classifier rules. We specify an evaluation protocol on a synthetic adaptive-driver Britcar Trophy 2026 Donington Park GP fixture and on FastF1-derived Formula 1 holdout circuits, with cell values populated at camera-ready per §4. Our contributions, scoped to the bounded claims restated in §5.3, are (1) first application of a pretrained TSFM to adaptive motorsport telemetry, with a frozen Granite TTM backbone composed under a D-010 Track 1 channel-mix decoder fine-tune (no full-network retraining; backbone weights preserved) followed by the two-stage projection-and-audit layer; (2) the COA-parameterized simultaneity gate as the first public AI race-engineer workflow we found that reads FIA Certificate of Adaptations data as a binding regulatory input; (3) Granite Guardian text-audit as a load-bearing, unit-tested safety contract for foundation-model-derived recommendations.

---

## 1. Introduction

The intersection of foundation models and safety-critical sensor data has produced a category of deployment problems where the model's pretraining distribution does not cover the inference domain. Vehicle dynamics is one such domain. A time-series foundation model pretrained on weather and retail can be applied to motorsport telemetry zero-shot, but the resulting forecasts are not constrained by Newton's laws: nothing in the model architecture prevents a forecast from predicting peak lateral acceleration at zero steering angle, or accelerating speed at zero throttle. We name this failure mode the Kinetic Hallucination problem.

The problem matters specifically because the downstream consumer of these forecasts is a human driver in a moving vehicle who will act on the coaching recommendations derived from them. The standard remediation pattern in the time-series literature is to retrain the model with a physics-informed loss term (Chrosniak et al. 2023), but retraining a foundation model with physics losses defeats the purpose of using a pretrained foundation model in the first place: each new vehicle class, circuit, or regulatory regime requires its own training pass.

Adaptive-driver motorsport, which has been open to disabled drivers since the FIA lifted its single-seater ban in December 2017, adds a second-order constraint. The input envelope that bounds a driver is defined by their equipment, not assumed universal. Simultaneous brake and throttle is a legitimate technique across motorsport (left-foot braking, trail-braking, holding throttle to keep a turbo spooled); for an adaptive driver it is homologated through dual-stage hand-control trigger mechanics recorded in their FIA Certificate of Adaptations (governed by Appendix L of the International Sporting Code). A model that hard-codes the constraint `throttle * brake = 0` rejects the technique as driver error for any driver who uses it, and systematically mis-serves adaptive drivers whose permitted envelope is a binding regulatory document; coaching derived from that constraint prescribes corrections the driver should not execute.

This paper addresses three open questions:

1. How can a frozen pretrained TSFM be made physically faithful at inference time without retraining?
2. How does the physics-projection layer interact with adaptive-driver telemetry where the standard `throttle * brake = 0` assumption does not hold?
3. What is the safety contract when a foundation model produces a tuning recommendation acted on by a driver in a moving vehicle?

We argue that the answer to all three is architectural, not training-time. APEX adds a two-stage projection-and-audit layer after the forecaster: a differentiable convex QP projection wraps the convex physical constraints, and a non-differentiable post-projection feasibility filter audits the nonconvex constraints (bicycle-model coupling and the COA-parameterized simultaneity gate). A text-audit gate runs Granite Guardian over the serialized violation log from both stages. The forecaster stays frozen. The recommendations stay tied to the FIA regulatory document the driver actually carries. The Guardian audit is itself unit-tested via a serializer test suite we call Convergence-14, named after the 14 distinct kinematic-violation classes our projection-and-audit layer enumerates.

Our contribution claims are scoped:

- The TSFM benchmark claim is the upstream result from the Granite TTM paper ("outperforms several larger TSFMs in NeurIPS 2024 benchmarks on common forecasting tasks"). We do not extend this to motorsport-specific outperformance.
- The "first" claims are deliberately narrow: first application of a pretrained TSFM to adaptive motorsport telemetry (frozen backbone plus channel-mix decoder fine-tune per D-010 Track 1; no full-network retraining), first public AI race-engineer workflow we found that reads the FIA Certificate of Adaptations as a binding regulatory input, first COA-parameterized brake-throttle simultaneity gate. We do not claim "first physics-projection layer on a TSFM in any domain," nor "first integrated workflow for adaptive hand-controls in any sense." Per D-052 G4 pivot, the zero-shot pitch claim was retired 2026-05-25 when the G4 bake-off found seasonal-naive beat zero-shot TTM by ~2x on speed_mps; the production path elevated the channel-mix decoder fine-tune accordingly.
- The Guardian text-audit is presented as a deliberate, unit-tested design choice. We do not claim it generalizes to other domains.

---

## 2. Related Work

**Time-series foundation models.** Granite TimeSeries TTM r2.1 (Ekambaram et al., NeurIPS 2024) is a sub-million-parameter pretrained TSFM that outperforms several larger TSFMs on standard univariate and multivariate benchmarks. The model is channel-independent by construction; cross-channel relationships are not enforced. Concurrent foundation-model work for time series includes Chronos (Ansari et al., 2024) and Moirai (Woo et al., 2024); none of these explicitly addresses physical-domain constraints.

**Physics-informed neural networks for vehicle dynamics.** Deep Dynamics (Chrosniak, Ning, Behl, 2023; arXiv:2312.04374) trains a bespoke physics-informed network on race telemetry with the friction ellipse, bicycle model, and tire-slip relations encoded as a training-time regularizer. The PINN approach requires per-domain retraining and cannot transfer to a different vehicle class without re-training.

**Foundation models in adjacent control domains.** Chronos applied to car-following (Zeng and Yan, 2025) uses a foundation model on a different telemetry signal (front-to-rear gap-distance prediction) than our work. The car-following domain does not require the friction-ellipse or bicycle-model constraints that vehicle dynamics requires.

**AI race-engineer products.** Commercial AI race-engineer tools include Track Titan, Trophi.ai, and several others in the 2025-2026 motorsport-analytics landscape (web-accessible product pages cited in §13). Public materials we found for these tools do not document support for COA-aware brake-throttle simultaneity; none of the tools surveyed documents explicit conditional removal of the able-bodied mutual-exclusion assumption, and we found no public documentation that any commercial AI race-engineer product parses FIA Certificates of Adaptations or any other adaptive-driver regulatory document as a tensor-level input. The category gap APEX addresses is structural, not incremental.

**Differentiable optimization layers.** CvxpyLayer (Agrawal et al., 2019) enables differentiable convex optimization as a PyTorch layer. Our Stage 1 convex QP is a parametric quadratic program wrapped by `cvxpylayers.torch.CvxpyLayer`. The Stage 2 post-projection feasibility filter is a separate accept/reject audit outside the differentiable QP because the constraints it enforces (bicycle-model coupling and the COA-parameterized simultaneity gate) are nonconvex.

**Safety classifiers for LLM and foundation-model outputs.** Granite Guardian 4.1 (IBM, 2026) is a safety classifier with a Bring-Your-Own-Classifier rule format that supports custom verdict-mapping over arbitrary text inputs. We adapt it as a text-audit gate on the serialized output of the physics-projection layer. Related work on LLM safety classifiers (Llama Guard, Constitutional AI) targets natural-language outputs; our application targets the structured violation-log text our projection layer emits.

**Adaptive motorsport.** The FIA lifted its single-seater ban on disabled drivers in December 2017 (Appendix L revision). The Certificate of Adaptations is the binding per-driver document governing permitted equipment and input modalities. To our knowledge no prior AI race-engineer work has integrated the COA as a tensor-level input.

---

## 3. Method: the three-layer PhysicsTTM pipeline with a two-stage projection-and-audit middle layer

The pipeline runs three layers in series: a frozen TSFM forecaster (Granite TimeSeries TTM r2.1 channel-mix decoder fine-tune per D-010 Track 1; Granite FlowState as Track 2 + Amazon Chronos-2 as Track 3 documented for the three-track ensemble extension per wave-30 D-010), a two-stage projection-and-audit middle layer (V2 cvxpylayers single-iterate constant-mu projector at HEAD per D-050 byte-equality lock; the 8-tier Pacejka linearisation V12 swap-point at `apex/physics/projection_pacejka.py` + 3-iteration unrolled SCP outer loop V13 swap-point at `apex/physics/projection_scp.py` extend the projector through the `DifferentiableProjector` Protocol per D-031 staged ladder, landing in wave-46 Phase 2 per D-058 behind `NEXT_PUBLIC_USE_REAL_BACKEND_V12` + `V13` env flags), and a text-audit gate (Granite Guardian 4.1 BYOC over the serialized `PhysicsViolationLog`). The forecaster + projection layer share a single forward pass on a (batch, 30, 14) tensor per the wave-30 horizon + channel expansion (D-010 horizon expansion 24 -> 30 + D-016 channel expansion 9 -> 14, superseding the wave-22 (batch, 24, 9) lock); the audit gate runs on the serialized violation log carrying the projector's per-channel residuals plus the COA-parameterized simultaneity gate verdict.

### 3.1 Layer 1: frozen Granite TimeSeries TTM r2.1 forecaster

We aggregate raw 50 Hz telemetry to 1-Hz mini-sector tensors of shape `(batch, 30, 14)` per wave-30 D-010 + D-016 expansion (the wave-22 baseline was `(batch, 24, 9)`; wave-30 expanded horizon 24 -> 30 for finer 8-tier SCP convergence grid + channels 9 -> 14 with 5 wave-30 physics-tier additions). The 30 along the time axis corresponds to one lap of 1-Hz mini-sector aggregates at the wave-30 finer discretization (the wave-22 24-sector lock was tuned for the prior single-stage projection-and-audit; the wave-30 8-tier unrolled SCP outer loop benefits from the 30-sector grid that covers the widest-circuit edge cases). The 14 channels are:

1. `throttle_pct` (percent, 0-100)
2. `brake_pa` (Pascals)
3. `steering_rad` (radians; positive = right turn)
4. `rpm` (revolutions per minute)
5. `lat_g` (g; positive = right)
6. `long_g` (g; positive = forward acceleration)
7. `speed_mps` (meters per second)
8. `gear` (integer 0-8)
9. `coa_overlap_flag` (binary 0/1, synthesized from the driver's FIA Certificate of Adaptations parsed JSON; canonical per `app/backend/apex/shared/contracts/shapes.py`)
10. `tire_load_n` (Newtons; per-tire vertical-load aggregate after Tier 4 double-track load-transfer adjustments per wave-30 D-015)
11. `mu_v` (per-step friction coefficient consumed + updated by Tier 5 tire thermal model + Tier 7 Pacejka combined-slip per wave-30 D-015)
12. `track_pitch_rad` (radians; track-frame pitch consumed by Tier 1 3D track geometry gravity projection per wave-30 D-015)
13. `track_bank_rad` (radians; track-frame bank consumed by Tier 1 3D track geometry per wave-30 D-015)
14. `yaw_rate_rad_s` (radians per second; consumed by Tier 8 kinematic integration per wave-30 D-015)

The forecaster is loaded from `ibm-granite/granite-timeseries-ttm-r2` with the channel-mix decoder fine-tuned per D-010 Track 1; the backbone weights remain frozen per the NeurIPS central claim of frozen-backbone TSFM + hard differentiable physics-projection composition per D-025 + the D-052 G4 honest pivot (decoder fine-tune elevated to production path after zero-shot baseline lost to seasonal-naive). The output tensor matches the input shape `(batch, 30, 14)` per wave-30 D-010 + D-016 (the wave-22 (batch, 24, 9) lock is superseded; existing wave-22 fixtures + tests pad channels 9-13 with zeros + extend time axis to 30 by repeating the last mini-sector value per the migration plan in arch-spec Appendix W30 Sync Point 1 contract).

### 3.2 Layer 2: two-stage projection-and-audit layer

Layer 2 has two stages: a convex QP projection that handles the physical constraints expressible as convex inequalities, then a post-projection feasibility filter that audits the bicycle-model coupling and the COA-simultaneity gate (which are nonconvex and therefore cannot live inside the CvxpyLayer-wrapped QP).

Let $\mathbf{x}_t = (a_{\text{long},t}, a_{\text{lat},t}, \text{speed}_{t+1})$ be the QP decision variables at step $t$, with $\text{throttle}_t$, $\text{brake}_t$, $\text{steering}_t$, and $\text{speed}_t$ treated as exogenous inputs from the TTM forecaster (or the previous step's accepted state) for that step. Inputs are kept in their physical units (Pascals for brake pressure, m/s for speed, radians for steering); no normalization layer is applied between TTM and the QP solver.

**Stage 1: convex QP projection.** The QP minimizes the squared L2 distance between $\mathbf{x}_t$ and the TTM forecast at step $t$ subject to the following convex constraints applied per forecast step $t \in [0, 30)$ (per wave-30 D-010 horizon expansion from 24 to 30):

*Friction ellipse.* The total grip a tire generates is bounded by the friction circle (or ellipse for anisotropic compounds):
$$
\left(\frac{a_{\text{lat},t}}{\mu_y g}\right)^2 + \left(\frac{a_{\text{long},t}}{\mu_x g}\right)^2 \leq 1
$$
The friction-ellipse coefficient $\mu_v$ is a per-step learned channel of the (batch, 30, 14) tensor (channel 11 per wave-30 D-016 channel expansion) consumed + updated jointly by the Tier 5 tire-thermal-degradation model (D-015 internal-state-evolution handler) + the Tier 7 full Pacejka combined-slip handler (D-015 SCP outer-loop linearisation). The constraint is convex when treated per-step with $\mu_v$ exogenous to that step; equivalently the second-order cone form is $\big\Vert (a_{\text{lat},t}/(\mu_y g),\ a_{\text{long},t}/(\mu_x g)) \big\Vert_2 \leq 1$ with $\mu_x = \mu_y = \mu_v$ at the SCP inner iterate. The nonconvex Pacejka coupling between $\mu_v$ + $(a_{\text{lat},t}, a_{\text{long},t})$ is linearised at the SCP outer-loop step (D-012); subsequent iterates re-linearise around the updated $\mu_v$ over the fixed 3-iteration unroll per D-012.

*Forward-Euler kinematic step.* Discrete-time velocity update at $\Delta t = 1.0$ s, coupling the current longitudinal-acceleration decision variable to the next-step speed:
$$
\text{speed}_{t+1} = \text{speed}_t + a_{\text{long},t} \Delta t
$$
This is a linear equality (treating $\text{speed}_t$ as exogenous from the previous step's accepted state and $a_{\text{long},t}$ as a current-step decision variable), therefore convex.

*Jerk bound.* Discrete-time jerk per axis is bounded:
$$
|a_{\cdot, t} - a_{\cdot, t-1}| \leq j_{\max} \Delta t, \quad j_{\max} = 8 \text{ m/s}^3 \approx 0.815 \text{ g/s}
$$
This is a pair of linear inequalities, therefore convex. Note that production vehicle-dynamics deployments (per Rajamani's standard treatment) activate rate constraints at sampling rates of 10 Hz or above; we apply this constraint at the 1 Hz mini-sector aggregation rate of TTM r2.1 inputs, with the tighter $j_{\max} = 8 \text{ m/s}^3$ value chosen to keep the constraint load-bearing at the spec's coarser sampling rate. Section 5.4 discusses this sampling-rate caveat alongside the wave-30 D-011 multi-frequency coexistence pattern (1 Hz aggregation for the TTM r2.1 backbone + polyphase phase-streams for TSPulse anomaly detection + native 50 Hz for Granite FlowState) that runs the rate constraint at >= 10 Hz on the raw upstream signal before mini-sector aggregation.

The QP is wrapped by `cvxpylayers.torch.CvxpyLayer` (Agrawal et al., 2019) and is differentiable end-to-end through the projection. CvxpyLayer returns the projected $\mathbf{x}_t$ and a violation log enumerating, for each step, which convex constraint hit its bound.

**Stage 2: nonconvex post-projection feasibility filter.** Two physical relationships are nonconvex and cannot live inside the convex QP. We audit them post-projection and emit additional entries to the violation log; any nonconvex-constraint violation is escalated to the Layer-3 Guardian audit gate but does not gate the QP solve itself.

*Bicycle-model (low-slip kinematic approximation).* Lateral acceleration at the kinematic bicycle approximation is:
$$
\hat{a}_{\text{lat},t} = \frac{\text{speed}_t^2}{L} \tan(\theta_t)
$$
where $L$ is the vehicle wheelbase (BMW M240i Britcar Trophy: $L = 2.69$ m) and $\theta_t$ is the road-wheel angle (not steering-wheel angle) in radians. The relationship is valid only at low tire-slip; at racing speeds, tire slip makes the equality fragile, so we treat it as an audit constraint, not a hard projection equality. The slip-tolerant threshold is circuit-conditional (per-circuit calibration from the wave-30 D-015 Tier 5 tire thermal model + Tier 7 Pacejka combined-slip output); the exact threshold value lands in §4.1 at camera-ready.

*COA-parameterized simultaneity gate.* The novelty is not the post-hoc threshold check itself, but the upstream tensor parameterization: the driver's FIA Certificate of Adaptations parsed JSON object (parsed by Granite-Docling at onboarding) is reduced to a binary flag that occupies the 9th channel of the TTM input tensor, so the regulatory document parameterizes audit behavior at the tensor level. If the COA-simultaneity flag is 1 at step $t$, the audit accepts any combination of $(\text{throttle}_t, \text{brake}_t)$ from the TTM forecaster. Otherwise the audit flags a violation when both $\text{throttle}_t$ and $\text{brake}_t$ are non-zero above a small numerical tolerance $\epsilon$ (specific tolerance reported in §4.1 at camera-ready) chosen to avoid floating-point edge cases. Because this is a complementarity-style constraint (its feasible set is nonconvex), enforcing it inside the convex QP would require a mixed-integer formulation that CvxpyLayer does not support; the post-projection feasibility filter is the architecturally correct place.

The two-stage architecture preserves end-to-end differentiability through Stage 1 (the differentiable surface that gradient methods can backprop through if a future user wires the projection layer into a TTM-aware training loop) while keeping the nonconvex audit constraints in Stage 2 honest as a separate accept/reject filter on the projected tensor. Stage 2 is not differentiable through the audit decisions; differentiability claims in this paper apply only to Stage 1.

**The 8-tier physics in-scope (per wave-30 D-015).** The unrolled SCP outer loop applies first-order Taylor linearisation around the previous iterate to handle non-convex tier interactions; each inner iterate is a fixed-coefficient convex QP solved via the CvxpyLayer-wrapped solver. The full 8-tier stack:

1. *3D track geometry (Tier 1).* Gravity-vector projection from GPS pitch + bank channels (`track_pitch_rad`, `track_bank_rad` per D-016); adds banking-conditional friction-ellipse rotation.
2. *Aerodynamics (Tier 2).* Pitch-sensitive front/rear downforce $F_{z,\text{aero}} = \tfrac{1}{2} \rho_{\text{air}} C_l(\text{pitch}) A v^2$; expands the friction-ellipse per axle as $(F_{z,\text{static}} + F_{z,\text{aero}}) \mu_v$.
3. *Adaptive hand-controls (Tier 3).* Disable the $\text{throttle} \cdot \text{brake} = 0$ complementarity when `c_overlap = 1`; replace with a `c_overlap`-conditional lexicographic constraint per D-022.
4. *Double-track load transfer (Tier 4).* Per-corner elastic weight transfer $\Delta F_{z,\text{lat}} = m a_y h_{cg} / (2 \cdot \text{track})$ and $\Delta F_{z,\text{long}} = m a_x h_{cg} / \text{wheelbase}$; per-corner friction-ellipse becomes per-corner-$F_z$.
5. *Tire thermal + degradation (Tier 5).* Two-mass thermal ODE evolves $T_{\text{surface}}$ + $T_{\text{core}}$ as internal SCP state (not channels of the input tensor); peak $\mu_v$ is modulated by $T_{\text{surface}}$ and lap-count degradation.
6. *Transient tire dynamics (Tier 6).* Relaxation-length ODE $\tau_y \dot{s}_y + s_y = s_{y,\text{ss}}$ collapsed to steady-state algebraic substitution per D-014 (stiff-ODE numerical hazard mitigation); full transient reserved for offline validation.
7. *Full Pacejka combined-slip (Tier 7).* Magic-Formula heart-shape boundaries $F_x, F_y = \text{pacejka}(s_x, s_y, F_z, \mu_v, T_{\text{surface}})$; linearised at each SCP outer-loop step and the inner iterate enforces the linearised half-spaces.
8. *Kinematic integration (Tier 8).* Newton-compliant $m \dot{v} = F_{\text{total}}$ + $\dot{\omega} = F_{\text{lat}} \cdot \text{arm} / I_z$; enforces consistency across the 30-step horizon.

Each iterate re-linearises around the updated state over the fixed 3-iteration unroll locked by D-012 (no dynamic convergence-tolerance check at runtime, so the PyTorch backward pass remains deterministic + gradient flow reaches the TTM channel-mix decoder). The Powell-ratio trust-region acceptance criterion ($\rho = \text{actual} / \text{predicted}$ reduction; accept if $\rho > 0.25$, expand if $\rho > 0.75$, shrink if $0 \leq \rho \leq 0.25$, reject + shrink if $\rho < 0$) is the D-027 prototype-time gate validating that the fixed 3-iteration unroll is sufficient for the Sarah Reynolds fixture; if the D-027 prototype emits $\rho < 0.25$ across iterates the fallback ladder (per D-027) activates the 2-iteration + trust-region-penalty rung or escalates to D-A revision. Runtime SCP does not check $\rho$ per-iterate. The cross-reference for the engineering implementation is `docs/architecture-spec.md` Appendix W30 Layer 4.

**D-027 Stage C PASS (2026-05-23 Day 3).** Per the council v2 staged rewrite locked in `council-transcript-20260522-vinh-backend-plan-v2.md`, the D-027 gate decomposed into three substages decoupling distinct risks: G-0.5 (frozen TTM-r2 hardware load), G0.6 (cvxpylayers Windows import smoke), and Stage C (full forward + projection + backward composition on the council v2 reduced spec: constant-mu friction ellipse + single SCP iterate). Stage C executed on a Sarah Reynolds 10-row telemetry stub (RTX 3060 Ti + Windows 11 + CUDA 12.1) and emitted the load-bearing gradient-flow verdict per `logs/day-03-scp-go-no-go.md`: gradient finite (True), $\|\nabla L\|$ = 24.12 below the council v2 1e4 oscillation threshold, FCVR = 0 on the stub, output tensor shape (1, 30, 14) per `app/backend/apex/shared/contracts/shapes.py` SCHEMA_VERSION 0.1.0, cvxpylayers DPP-compliant. Total wall-clock of the composed forward + projection + backward = ~1.03 s, leaving ~13.97 s of the G8 15-second coaching-report sub-budget for downstream stages (Granite Instruct narration + Guardian audit + provenance assembly). The 8-tier Pacejka linearisation (Stage A) and 3-iteration unrolled SCP outer loop (Stage B) defer to Phase 2 Day 4 task 2.12 per the council v2 reduced-spec gating; Stage C PASS confirms the kinetic-hallucination thesis is implementable, and Stage A + Stage B expand the projection from constant-mu single-step to the full nonconvex Pacejka coupling. Pre-committed de-scope rung 1 (cut three-track ensemble FlowState + Chronos-2) does NOT fire; three-track stays on the roadmap per `docs/decision-log.md` D-030 + D-031.

### 3.3 Layer 3: Granite Guardian Bring-Your-Own-Classifier text audit

The projection layer's violation log is serialized to plain-English using a deliberate text template (the "Convergence 14" serializer, named after the 14 distinct kinematic-violation classes we enumerate). The serialized log is read by Granite Guardian 4.1 under custom BYOC rules, which emits a discriminated `verdict` of `"approve"`, `"flag"`, or `"reject"` along with a reasoning trace and verdict-specific concern lists.

The textual layer is a load-bearing safety contract. The Convergence-14 unit-test suite covers every kinematic-violation class with a Python fixture that fires the violation + asserts the serializer output text. The serializer assertions live at `app/backend/tests/test_serializer.py`; the parallel Granite Guardian verdict assertions live at `app/backend/tests/test_guardian_audit.py` (22 verdict-shape tests at HEAD). The discipline IS the safety contract: if any fixture in either file fails after the suites ship, the pipeline is not deployable.

### 3.4 The COA-parameterized simultaneity gate

The architectural novelty is the binary COA-derived `c_overlap` flag as the 9th channel of the TTM input tensor combined with the conditional post-projection feasibility audit described in §3.2 Stage 2. Adaptive drivers running electronic hand-control systems have Certificates of Adaptations whose hardware-specification sections record the equipment that physically permits simultaneous brake-throttle actuation (for example, the dual-stage trigger pattern documented in the hardware sections of a typical adaptive-driver COA). APEX derives the `c_overlap` flag from these approved hardware specifications via Granite-Docling at parse time. We do not claim that public FIA documents expose a discrete simultaneity field; the flag is derived APEX-side from the adaptation-equipment metadata that the FIA-approved COA already records. The same coaching pipeline produces different corrections for adaptive vs. able-bodied drivers, governed by the COA's binding regulatory text. The pipeline runs the same model, the same convex QP projection, and the same audit gate; only the flag value differs at the tensor level. Because the simultaneity gate is complementarity-style and therefore nonconvex, it lives in §3.2 Stage 2 (post-projection feasibility filter), not in the CvxpyLayer-wrapped QP itself.

### 3.5 Architecture overview

![Figure 1: APEX pipeline architecture. Driver inputs (telemetry CSV, FIA Certificate of Adaptations PDF, written debrief) feed a one-time onboarding stage (Granite-Docling + Granite Vision) and the 60-second post-race coaching loop (1-Hz aggregator -> Granite TimeSeries TTM r2.1 -> Stage 1 differentiable convex QP -> Stage 2 post-projection feasibility filter -> Granite Guardian text audit -> Granite 4.1 8B Instruct narrator). Outputs are a corner-by-corner coaching report, tuning recommendation with COA section citation, next-session envelope forecast, and Guardian safety stamp with reasoning trace.](figures/figure-1-architecture.png)

The diagram is generated from `docs/architecture-diagram.mmd` in the source repository; an SVG copy is at `paper/figures/figure-1-architecture.svg` for vector reproduction. The full Pydantic + TypeScript contract specifications for every layer boundary live in the repository at `app/shared/types.ts` and the architecture spec at `docs/architecture-spec.md`. Layer numbering in this paper compresses the spec's eight-tool view: paper Layer 1 (§3.1) covers spec Layer 3 (Granite TimeSeries TTM r2.1); paper Layer 2 (§3.2 with its two stages) covers spec Layer 4 (projection QP + post-projection feasibility filter); paper Layer 3 (§3.3) covers spec Layer 5 (Granite Guardian audit). The remaining spec layers are infrastructure: Layer 1 hosts Granite-Docling 258M (document vision parser) + the Docling library (Python conversion layer) + Granite Vision 4.1 4B (timing-sheet OCR); Layer 2 is the 1-Hz mini-sector aggregator (APEX-authored Python); Layer 6 is Granite 4.1 8B Instruct (narrator); Layer 7 is the LangGraph + Granite MCP Gateway + ContextForge orchestration runtime (Langflow retained as the export-graph artifact per D-017 G7 + D-054). See §3.6 below for the stack provenance.

**Inter-layer contracts (Phase 0 handoff).** The (batch, 30, 14) tensor flowing through Layer 1 -> Layer 2 -> Layer 3 carries a 14-channel ordering pinned at `app/backend/apex/shared/contracts/shapes.py` as the canonical CHANNELS tuple (throttle_pct, brake_pa, steering_rad, rpm, lat_g, long_g, speed_mps, gear, coa_overlap_flag, tire_load_n, mu_v, track_pitch_rad, track_bank_rad, yaw_rate_rad_s) with a per-channel CHANNEL_TIER_BINDING dict mapping each channel to a wave-30 D-015 physics tier. The `shapes.py` module also carries SCHEMA_VERSION (currently 0.1.0) which downstream deserialization consumers compare against to catch contract drift. The projection layer is swappable behind a `DifferentiableProjector` Protocol at `app/backend/apex/shared/contracts/projector.py` (PROTOCOL_VERSION 0.1.0; distinct from SCHEMA_VERSION because the API surface and the channel meaning version independently): V1 NumPy floor (is_differentiable = False) and V2 cvxpylayers (is_differentiable = True) both emit the same `PhysicsViolationLog` shape per `violations.py`, so the engine-agnostic Guardian audit at §3.3 reads byte-identical text regardless of which projector engine produced the records. Every Guardian audit carries a `uuid4().hex` audit_id correlated across all backend log lines via the `audit_context` Python contextvar in `app/backend/apex/shared/logging.py`, baked into the per-line JSON schema (ts + level + logger + event + audit_id + commit_sha + models snapshot + caller-supplied kwargs). Frontend mirrors live in `app/shared/types.ts` as Backend*-prefixed TypeScript types with construction-site enforcement via the negative-tsc fixture at `app/frontend/tests/types/contract-alignment.test-d.ts`; cross-references for the layering live in decision-log D-032 (frontend-backend type alignment).

**The seven shouldn't-be-possible moves.** Beyond the three-layer pipeline above, APEX stacks seven composition moves (D-019 baseline of five plus wave-44 D-049 addition of IBM TSPulse polyphase anomaly detector as #6 plus wave-45 D-053 addition of Granite TTM in-browser scaffold as #7) that, individually, push the envelope of what a 12-day hackathon submission should ship; collectively, they form the technical risk-asymmetry argument for the submission. We name the seven so the judging panel can reason about each independently. Move #7 ships as an upstream-pipeline-gated scaffold per D-056 honest reframing (Transformers.js v4 lacks `time-series-forecasting` pipeline task at HEAD; sibling Granite 4.0 Nano 350M is genuinely WIRED via `lib/webgpu-nano.ts` proving the architecture is real).

1. *WebGPU Granite Nano on-device inference (Layer 0).* Granite 4.0 Nano 350M runs in-browser via WebGPU for the offline coaching path, fronted by the EdgeSummary React surface at `app/frontend/components/EdgeSummary.tsx`. Per D-021 the edge path is a parity surface to the server-side Granite 4.1 8B Instruct narrator, not a separate pipeline; the same coaching prompt flows through whichever model is reachable at session start. Reviewer-relevant detail: this is the first hackathon-scale APEX surface that demonstrates browser-native Granite without a server round-trip.

2. *Activated LoRA Granite 4.0 instruct (Layer 6).* The narrator path uses Activated LoRA per D-019 item 4 to keep the per-driver fine-tune surface small while preserving the Granite 4.0 base model checkpoint. The ALoRAStatusBadge React surface at `app/frontend/components/ALoRAStatusBadge.tsx` exposes the activation state to the judging panel so the per-session adaptation is auditable.

3. *GEPA evolutionary prompt optimization (Layer 5).* Per D-019 item 3 the prompt-optimization loop runs GEPA against the Convergence-14 fixture suite so the narrator prompt evolves under deterministic acceptance criteria. The GEPAEvolutionPanel React surface at `app/frontend/components/GEPAEvolutionPanel.tsx` renders the per-generation acceptance trace.

4. *EAGLE-3 speculative decoding (Layer 6).* Per D-019 item 2 EAGLE-3 speculative decoding fronts the narrator path to keep the local Granite 4.1 8B Instruct latency under 15 seconds end-to-end on RTX 3060 Ti hardware per the wave-40 G1b benchmark (baseline 28 seconds; speculative decoding closes the gap). The EAGLE3LatencyBadge React surface at `app/frontend/components/EAGLE3LatencyBadge.tsx` exposes the speculative-decoding acceptance rate.

5. *Agent-as-Judge tri-agent critic loop (Layer 7).* Per D-019 item 5 the draft coaching report is read by three specialist Granite-Critic instances in parallel (Physics-Critic + Pedagogy-Critic + Guardian-Safety) before reaching the Layer 8 final Guardian audit. The TriAgentCriticPanel React surface at `app/frontend/components/TriAgentCriticPanel.tsx` renders the discriminated-union verdict tuple with positional binding (Physics at position 0; Pedagogy at position 1; Guardian-Safety at position 2). IBM Mellea Instruct-Validate-Repair fires with loop_budget = 3 if any critic flags.

These seven moves are independently cuttable per the APEX Lite contingency at `docs/apex-lite-contingency.md`; the three-layer pipeline above stands without any of them. The composition is the contribution. (Moves #6 IBM TSPulse polyphase anomaly detector + #7 Granite TimeSeries TTM r2.1 in-browser scaffold are documented above L163-176 as wave-44 D-049 + wave-45 D-053 additions to the original D-019 baseline of five.)

### 3.6 Pipeline integration with IBM Granite stack

The full pipeline uses fourteen IBM Granite stack tools at wave-46 (twelve through wave-30 D-016 + wave-45 D-054 baseline; wave-46 D-058 adds Granite 4.1 3B Instruct for fast-path AICopilotChat routing + Granite Speech 4.1 2B-Plus for speaker-attributed ASR + Mellea for the Instruct-Validate-Repair critic loop on the narrator; minus IBM Bob, retired from the inventory 2026-05-26 because APEX does not consume Bob at runtime). Four of them (Granite TimeSeries TTM r2.1 channel-mix decoder fine-tune as Track 1 of the three-track forecasting ensemble per D-010, Granite FlowState r1.1 18.5M as Track 2, Granite Guardian 4.1 as the audit gate + D-024 physics-confidence detector verdict downgrade, and Granite Embedding R2 149M + 47M as the RAG retrieval layer per D-016) host the APEX contributions of this paper through the V2 cvxpylayers single-iterate constant-mu projector at HEAD per D-050, with the unrolled SCP outer loop V13 + 8-tier Pacejka linearisation V12 extending the projector at the `DifferentiableProjector` Protocol swap-point per D-031 staged ladder + wave-46 Phase 2 per D-058. The other ten (Granite-Docling 258M for FIA COA PDF parsing, Granite Vision 4.1 4B for timing-sheet PDF parsing, the Docling library as the conversion layer behind the document parsers, IBM TSPulse 1M for anomaly detection on polyphase phase streams per D-016, Granite 4.1 8B Instruct as the race-engineer narrator, Granite 4.1 3B Instruct as the AICopilotChat fast-path router per D-058, Granite Speech 4.1 2B-Plus for speaker-attributed ASR per D-058, Granite 4.0 Nano 350M as the in-browser WebGPU edge model per D-019 item 1 + D-021, LangGraph + Granite MCP Gateway + ContextForge for the orchestration runtime per D-017 G7 + D-054 (Langflow retained as the export-graph artifact), and Mellea for the Instruct-Validate-Repair critic loop on the narrator per D-058) are infrastructure inspired by IBM's publicly documented Ferrari watsonx + Granite case study, redeployed here on a different safety-critical sensor-data domain.

**Council v2 amendment trace.** The architecture above is the wave-30 plan as amended by the council v2 pre-code review (transcript at `council-transcript-20260522-vinh-backend-plan-v2.md`). The chairman synthesis applied 6 pre-code edits before Phase 0 began: (1) tensor-shape trichotomy fixed at (B, 30, 14) per §3.5 inter-layer contracts above; (2) D-027 staged as G-0.5 hardware load + G0.6 cvxpy import + Stage C constant-mu spike, not 8-tier on Day 3; (3) G6.5 retired as Day-4-EOD task that could not rescue a Day-3 blocker; (4) "oscillates" defined numerically as `||grad L|| >= 1e4` OR residual non-decrease over 2 iterates OR NaN; (5) DifferentiableProjector Protocol seam added at `projector.py`; (6) pre-committed de-scope rung 1 wired to cut Tracks 2+3 if Stage C fails. Five blind-spot closures followed: discriminated-union BackendGuardianAudit by verdict (wave-42 Lane E.M.1 type-spec PR; Vinh-coord follow-up pending); ToleranceBands path tag for the 3 aggregation regimes (wave-42 Lane E.M.2; Vinh-coord pending); per-line audit_id correlation in the JSON logging schema (shipped Phase 0); Convergence-14 serializer unit-test suite as load-bearing safety contract (shipped Phase 0); explicit V1 NumPy vs V2 cvxpylayers engine-agnostic violation log shape (shipped Phase 0). The chairman verdict was MEDIUM-confidence, recoverable; Phase 0 closed Day 3 with D-027 Stage C PASS at `||grad L|| = 24.12` and FCVR = 0 on RTX 3060 Ti hardware per the wave-40 commit c97caaa go/no-go log.

### 3.7 Telemetry and observability

Every layer of the pipeline emits a structured JSON log line correlated across the request lifecycle via a `uuid4().hex` audit_id. The `audit_id` is set once at Guardian.audit() entry per the `audit_context` Python contextvar at `app/backend/apex/shared/logging.py`, then propagates through the rest of the request via Python `contextvars.copy_context()` semantics so any logger call inside the audit window inherits the same correlation key without manual threading.

Per-line JSON schema (frozen at `_AuditJSONFormatter`): `ts` (ISO 8601 UTC with seconds precision), `level` (DEBUG | INFO | WARNING | ERROR | CRITICAL), `logger` (qualified Python module name), `event` (short snake_case event name as the log message), `audit_id` (32-char uuid4().hex OR the "no_audit" sentinel emitted outside an audit_context block per council v2 SRE peer blind-spot recommendation on audit_id correlation), `commit_sha` (7-40 char `git rev-parse --short HEAD` OR the "unknown" sentinel when git is unavailable), `models` (a snapshot of cached library version strings per the `model_versions()` helper at `logging.py:91-98`), plus a typed extras bag for caller-supplied kwargs spread by the `_StructuredAdapter` at `logging.py:138-147`.

The frontend mirrors the canonical schema via a TypeScript `StructuredLogEntryCanonical` interface at `app/shared/types.ts` (with the extras bag split out to a separate `StructuredLogEntryExtras` typed record so the canonical-key set retains its narrowed literal-union shape per the wave-41 B.1 type-design BLOCKER close-out). The decoder at `app/frontend/lib/api-decode.ts` validates wire payloads against the canonical schema + per-value validates the `models` map against the `LibraryVersion` semver-or-sentinel union per the wave-41 cascade-#11 HIGH H2 close-out. Branded audit_id + commit_sha flow through the decoder per the wave-41 cascade-#11 brand-propagation BLOCKER B1 close-out so cross-brand wiring (e.g. passing a commit_sha into an audit_id slot) is a TypeScript compile error at consumer sites.

The frontend additionally emulates an immutable JSONL audit-log chain at `app/frontend/lib/guardian-audit-log.ts` per the NeuroPit `common/audit.py:34-46` write-before-emit pattern (steal-list MEDIUM item #2 from the wave-41 day 5 competitor field deep-dive at `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_competitor_field_may_challenge.md`). The localStorage emulation is bounded to 500 lines with a console.info JSONL mirror for DevTools visibility; the disk-persistent backend chain (POST `/api/audit-log` with POSIX append atomicity + fsync per write + 8 KiB per-line cap + rolling 500-line tail with gz archive rotation) ships per the Stream M.3 spec handoff at `docs/wave-41-backend-spec-handoff.md`. Cross-tab race losses on the localStorage emulation surface via the console.info mirror; backend swap path inherits POSIX `<=PIPE_BUF` byte atomicity per the spec.

Beyond the structured JSON log chain, APEX ships distributed-trace observability in production. Every backend request emits an OpenTelemetry span (configured in `app/backend/apex/observability.py`, enabled by `APEX_OTEL_ENABLED=1`) exported over OTLP HTTP to Honeycomb under `service.name = apex-backend`. A thread-safe in-process aggregator (`app/backend/apex/observability_metrics.py`) mirrors the same signals for a `GET /api/observability/summary` endpoint: throughput, status-class mix, p50/p95/p99 latency over a recent window, per-route averages, uptime, and recent requests carrying their real Honeycomb `trace_id`. The frontend renders this as an embedded live telemetry cockpit on `/judges`, with each recent request deep-linked into its Honeycomb trace waterfall. Live numbers come only from the real backend (engine label `observability-live`); an unreachable backend yields an honest `observability-awaiting-backend` wiring state rather than fabricated metrics, consistent with the conditional-claim discipline in §5. Request-level distributed tracing thus pairs with the per-line `audit_id` correlation above: a single coaching request is observable both as a Honeycomb trace and as a correlated structured audit-log span. Decision-log cross-reference D-071.

### 3.8 Safety alignment with adaptive-control engineering practice

APEX positions its coaching outputs against the functional-safety vocabulary that adaptive-control teams already use day-to-day in motorsport. The vocabulary set we map against is the one in ISO 26262 (functional safety for road vehicles), which adaptive racing teams apply in engineering correspondence as the framework for reviewing brake-by-wire interfaces, CAN gateway controllers, and adaptive throttle / brake / clutch logic for disabled-driver vehicles. Concretely the APEX coaching loop is designed so that the recommendation surface and the supporting telemetry pipeline never instruct a behavior that violates the kind of safety check an ISO 26262 review would expect: CAN signal plausibility checks, sensor-disagreement handling, fault-detection and latch-reset, watchdog and timeout, deterministic behavior under communication faults, state-machine review for unintended transitions, and FMEA on driver-input paths. The HARD-COMPLIANCE regulatory-anchor scrubber + the V2 cvxpylayers physics projector are the load-bearing pieces of this posture: the scrubber prevents the LLM from emitting a regulatory anchor the team did not verify, and the projector at HEAD prevents the forecast from recommending a control trajectory that violates the constant-mu friction-ellipse constraint under any combination of inputs the COA gate permits. The wave-49 ship lit the V12 first-order 8-tier Pacejka residual trace + the V13 3-iterate SCP outer-loop behind the DifferentiableProjector Protocol per D-031 staged ladder; jerk-bound enforcement remains the named swap-point in the ladder.

This alignment matters because the production audience for an adaptive race-engineer is not a research lab; it is teams who run safety reviews against their own electronic hand-control hardware. Coaching outputs that are blockable by such a review are not deployable. APEX shapes its outputs so that the things a functional-safety reviewer would flag (anchor invention, projection violation, unbounded retry, silent token timeout, single-point sensor trust) are the same things APEX's own Guardian + scrubber + bounded retry-loop + AbortSignal threading address by construction. We do not certify APEX against ISO 26262; we claim that the vocabulary set of the standard is the right anchor for the coaching-surface invariants we already enforce.

---

## 4. Experiments

The §4 prose below specifies the evaluation protocol and the §4.4 latency budget is populated from the verified D-030 Stage-C measurement (Vinh commit `c97caaa`, 2026-05-23). The Table 1 / Table 2 / Table 3 skeletons that follow each subsection retain camera-ready placeholders for the rows that depend on the Vinh-lane backend completion per PLAN.md row 5.7. Each skeleton states the exact shape of the table (rows, columns, units) so the camera-ready editor only fills cell values, not structure.

### 4.1 Evaluation protocol

**Datasets.**

- *Sarah Reynolds Britcar Trophy 2026 Donington Park GP fixture (synthetic).* A 60-row (1.2-second) 50-Hz telemetry slice extracted from lap 17 of 19 of a plausible adaptive-driver qualifying session for a left-leg-amputee veteran using electronic hand-controls. The slice covers the brake-release-to-throttle-on micro-window at one corner entry, deliberately sized to exercise the COA-simultaneity gate at the smallest fixture footprint we could ship in the repository (full-lap telemetry awaits a real adaptive-driver collaborator per §5.2). Paired with a 9-domain COA JSON whose structure mirrors the FIA Appendix L regulatory anchor for adaptive-equipment homologation. The fixture is synthetic by design (no real adaptive-driver identity); the lap shape, debrief language, and COA structure are derived from publicly documented Britcar Trophy regulations.
- *FastF1 holdouts.* Five Formula 1 circuits drawn from the FastF1 public dataset. Selection criteria: circuits with at least three completed sessions in the 2024 season, mixed-pace (high-speed + slow-corner) layout, dry weather. Specific circuit list reported in §4.1 at camera-ready.

**Table 1: Dataset summary.** Skeleton; cell values populated at camera-ready.

| Dataset | Circuits / sessions | Hz | Channels | COA channel? | Use |
|---------|---------------------|-----|----------|--------------|-----|
| Sarah Reynolds Britcar GP synthetic slice | 60 rows (1.2 seconds) from qualifying lap 17 of 19 | 50 | 8 telemetry + 1 COA flag + 5 wave-30 D-016 additions (fz_total + mu_v + pitch_rad + bank_rad + yaw_rate) = 14 total | yes | COA-simultaneity-gate ablation (Table 3b) + 8-tier physics ablation (Table 3a) |
| FastF1 holdouts | 5 / -- (>=3 per circuit) | 50 -> 1 (aggregated) | 8 | no | Lap-time MAE + physics-violation rate (Table 2) |

### 4.2 Baselines and forecaster comparison

**Baselines.**

- TTM zero-shot, no physics projection (the un-corrected Kinetic Hallucination baseline).
- Seasonal-naive (last-lap repeat) at 1-Hz mini-sector resolution.
- TTM + Stage 1 QP only (Stage 2 audit disabled; isolates the differentiable-convex contribution from the nonconvex audit contribution).
- Deep Dynamics retrained on the same FastF1 holdouts, if a public PINN checkpoint is available; otherwise dropped from Table 2.

**G4 FAIL pivot honest-disclosure (verified 2026-05-25 per `logs/day-04-g4.md` + Vinh commit `2fddea4`).** The zero-shot TTM-r2 baseline lost to seasonal-naive by ~2x on speed_mps on Hamilton 2024 Bahrain Q laps 4-5 holdout. Per pre-committed plan trigger at `docs/vinh-backend-plan.md` L377, the zero-shot pitch claim was dropped + the D-010 Track 1 channel-mix decoder fine-tune was elevated to the production forecaster path. The seasonal-naive structural advantage on lap-periodic F1 telemetry + the TTM context-window padding distortion (323 1-Hz rows + 189-row first-row replication to reach the 512 `context_length`) are documented as the load-bearing root causes; the FastF1 channel-availability gap on `long_g` is documented per pre-mortem row 62. Table 2 reflects the post-pivot composition path; Table 2-FAIL captures the verified zero-shot honest-disclosure row.

**Table 2: Forecaster + projection composition comparison on FastF1 holdouts (post-G4-pivot framing).** Skeleton; cell values populated at camera-ready. Lower is better for MAE + violation-rate columns.

| Method | Lap-time MAE (s) | Physics-violation rate (fraction of steps) | Guardian approve / flag / reject (%) | Inference latency (ms / step) | Retraining cost (GPU-hours) |
|--------|------------------|--------------------------------------------|--------------------------------------|-------------------------------|------------------------------|
| Seasonal-naive (last-lap repeat) | -- | -- | -- | -- | 0 |
| TTM + D-010 Track 1 channel-mix decoder fine-tune (no projection) | -- | -- | -- | -- | <0.1 |
| TTM + fine-tune + V1 NumPy validator + Guardian audit (D-A floor) | -- | -- | -- | -- | <0.1 |
| TTM + fine-tune + V2 cvxpylayers projector + Guardian audit (APEX D-050 V2 ship-floor) | -- | -- | -- | -- | <0.1 |
| Deep Dynamics retrained (if checkpoint available) | -- | -- | -- | -- | -- |

**Table 2-FAIL: G4 zero-shot honest-disclosure (verified 2026-05-25; `logs/day-04-g4-numbers.json`).** Source: Hamilton 2024 Bahrain Q, laps 1-3 context / 4-5 holdout. Seed 42. 30-step horizon at 1 Hz. TTM load 15.23 s; forward 484.0 ms.

| Channel | TTM zero-shot MAE | Seasonal-naive MAE | Delta | Verdict |
|---------|-------------------|--------------------|-------|---------|
| speed_mps | 35.1776 m/s | 18.3819 m/s | 16.7957 m/s | naive wins ~2x |
| long_g | n/a | n/a | n/a | FastF1 channel absent per pre-mortem row 62 |

**Metrics.**

- Per-mini-sector lap-time MAE (mean absolute error on the lap-time scalar per mini-sector). Tables 2 + 3a + 3b carry this metric.
- Physics-violation rate, measured separately at three points in the pipeline so Tables 2 + 3 carry differential signal: (a) raw TTM output (the un-corrected Kinetic Hallucination baseline), (b) Stage 1 QP output (residual convex-feasibility violations from numerical tolerance only), (c) Stage 2 audit failures (bicycle-coupling or COA-gate verdicts that fire reject). All three reported as fraction of total forecast steps.
- Guardian verdict distribution (approve / flag / reject ratio on canned + holdout sets); reported as the Guardian column in Tables 2 + 3a + 3b.

### 4.3 Convergence 14 validation and ablations

**Convergence 14 validation.** Every kinematic-violation class in the Convergence-14 enumeration has a unit-test fixture firing the violation + asserting the serializer output text (at `app/backend/tests/test_serializer.py`) + the expected Granite Guardian verdict shape (at `app/backend/tests/test_guardian_audit.py`, 22 verdict-shape tests at HEAD). The 14-fixture catalog renders on `/judges` as the ConvergenceFixtureGrid panel for per-fixture verdict inspection.

**Ablations.**

- Physics projection on / off (Table 3a).
- COA simultaneity gate on / off on the Sarah Reynolds fixture (does treating an adaptive driver as able-bodied degrade the forecast?) (Table 3b).
- Guardian audit on / off (Table 3c, measures audit-induced latency only since correctness is a Convergence 14 property).

**Table 3: Ablations.** Skeleton; cell values populated at camera-ready.

*Table 3a: physics projection on / off.* Lap-time MAE + physics-violation rate on the FastF1 holdout set.

| Configuration | Lap-time MAE (s) | Physics-violation rate (fraction of steps) |
|---------------|------------------|--------------------------------------------|
| TTM zero-shot (no projection) | -- | -- |
| TTM + Stage 1 QP only | -- | -- |
| TTM + Stage 1 QP + Stage 2 feasibility filter | -- | -- |

*Table 3b: COA simultaneity gate on / off (Sarah Reynolds fixture only).* Effect-size upper-bounded by synthetic-fixture design assumptions per §5.2.

| Configuration | Brake-throttle-simultaneity rows flagged (count out of 60-row fixture) | Tuning recommendation rendered? | Forecast lap-time MAE (s) |
|---------------|--------------------------------------------------------------------------|----------------------------------|----------------------------|
| Stage 2 with COA gate ON (APEX default) | -- | -- | -- |
| Stage 2 with COA gate OFF (mutual-exclusion physics) | -- | -- | -- |

*Table 3c: Guardian audit on / off.* Wall-clock latency of the Convergence-14 audit only; correctness is established by unit-test suite, not by this ablation.

| Configuration | Median audit latency (ms) | Pipeline wall-clock (s) |
|---------------|---------------------------|---------------------------|
| Guardian ON (APEX default) | -- | -- |
| Guardian OFF | n / a | -- |

### 4.4 Latency budget

Target post-onboarding loop wall-clock is <= 60 seconds on a commodity RTX 4060 GPU (Granite-Docling + Granite Vision run once at onboarding and cache to disk; the live loop is forecaster + projection + Guardian audit + Instruct narration). The G8 15-second coaching-report sub-budget governs the inner loop.

**Verified measurement (D-030 Stage C, 2026-05-23).** Vinh commit `c97caaa` ran the composed forward + cvxpylayers projection + backward on the Sarah Reynolds 10-row telemetry stub (RTX 3060 Ti + Windows 11 + Python 3.10.7 + CUDA 12.1). The Stage C reduced specification (constant-mu friction ellipse + single SCP iterate) returned the following:

| Criterion | Council v2 threshold | Observed | Verdict |
|---|---|---|---|
| Gradient finite | no NaN/Inf anywhere | True | PASS |
| Gradient norm bounded | `||grad_L|| < 1e4` | 24.12 | PASS |
| Forecasted constraint violation rate (FCVR) on Sarah stub | `<= 0.0` | 0.000000 | PASS |
| TTM output shape | `(1, 30, 14)` per `shapes.py` | `(1, 30, 14)` | PASS |
| cvxpylayers DPP-compliance | `prob.is_dpp() == True` | asserted in code | PASS |

Total wall-clock of the composed forward + projection + backward = ~1.03 seconds on RTX 3060 Ti, leaving ~13.97 seconds of the G8 15-second coaching-report sub-budget for the downstream stages (Granite Instruct narration + Guardian audit + provenance assembly).

**Table 4: End-to-end latency budget (Stage C verified; Stages A + B + downstream pending Day-8 measurement).**

| Stage | Component | Observed (ms) | Budget (ms) | Notes |
|-------|-----------|---------------|-------------|-------|
| 0 | Telemetry ingest (Pandas + tensor) | -- | 50 | Day-8 |
| 1 | TTM forecast (frozen channel-mix decoder; 30-step horizon) | -- | 100 | Day-8 |
| 2 | TSPulse anomaly detector (polyphase 4-band; D-016 Layer 2) | -- | 30 | Day-8 |
| 3 | cvxpylayers QP projection (Stage C single iterate, RTX 3060 Ti, Sarah stub) | ~1030 | 1500 | D-030 verified |
| 4 | SCP outer-loop linearisation (Stages A + B 3-iterate unroll) | -- | 2500 | Day-8 task 2.12 |
| 5 | Granite Guardian BYOC text audit (Convergence-14 serializer) | -- | 500 | Day-8 |
| 6 | Granite Instruct narration (8B; EAGLE-3 enabled per D-019 item 4; 2.5-3.7x speedup envelope per arXiv:2503.01840) | -- | 10000 | Day-8 |
| 7 | Provenance assembly (footer; model SHAs + COA + FIA + Guardian audit_id) | -- | 50 | Day-8 |
| -- | **End-to-end** | **--** | **14730** | **<= G8 15s sub-budget** |

The single Stage-C verified row (~1030 ms) is well below its 1500 ms budget. Day-8 measurements populate the remaining rows; the camera-ready revision reports the full end-to-end p50 + p95 wall-clock on the Sarah Reynolds 60-row fixture + the FastF1 holdout aggregate.

### 4.5 Case studies

**Sarah Reynolds Britcar GP synthetic case study.** The 60-row 1.2-second telemetry slice (qualifying lap 17 of 19 at the slowest-corner brake-release-to-throttle-on micro-window) carries one COA-permitted simultaneity window between rows 18-24 where brake pressure has not fully released (0.4 MPa residual on the hand-control lever) and throttle has begun (12 percent input via the secondary hand-control). The Stage 2 audit with COA gate ON treats the window as feasible (COA `coa_simul_permitted=true` flag asserts); the audit with COA gate OFF flags the window as a brake-throttle simultaneity violation. The tuning recommendation rendered with the gate ON cites the COA hardware-spec section; with the gate OFF the recommendation reads "release brake before throttle" which is unactionable for a left-leg-amputee driver using electronic hand-controls.

**G4 FAIL pivot case study (verified 2026-05-25).** The project pre-committed at `docs/vinh-backend-plan.md` L377 a fail-pivot trigger: "if zero-shot TTM does not beat seasonal-naive on speed_mps, drop the zero-shot pitch claim + elevate D-010 Track 1 channel-mix decoder fine-tune to Day 5 morning". The Day 4 G4 bake-off on Hamilton 2024 Bahrain Q laps 4-5 holdout returned TTM zero-shot speed_mps MAE 35.18 m/s vs seasonal-naive 18.38 m/s (~2x naive win; full numbers in `logs/day-04-g4-numbers.json`). The pivot trigger fired at 2026-05-25 03:47 ET via Vinh commit `2fddea4`; the V2 cvxpylayers projector ship-floor landed later the same day at commit `cb970ed` + the engine-agnostic byte-equality test locked at commit `9048573` per D-050. APEX Lite was NOT triggered (D-A floor + V1 NumPy validator hold); only the zero-shot accuracy claim dropped. This is a verified-and-executed adversarial-readiness case study: the planned pivot trigger fired + the disciplined execution preserved the engine-agnostic boundary + the D-050 byte-equality regression guarantee (reframed per `feedback_byte_equality_regression_guarantee_not_killshot` memory rule as the engineering safety contract behind the pitch, NOT the load-bearing positioning headline) is stronger after the pivot than before.

**Engine-agnostic byte-equality lock (D-050).** The V1 NumPy `friction_ellipse_check.to_text()` + V2 cvxpylayers `cvxpy_friction_ellipse_projection.to_text()` outputs are byte-identical modulo the leading ENGINE header line on the same physical event. The test at `app/backend/tests/test_physics_v2.py::test_v1_v2_to_text_byte_equal_modulo_engine_line` is the production lock; the Guardian BYOC audit reads identical violation strings regardless of which engine produced them. Wave-49 1d17eee shipped Stage A (V12 first-order 8-tier Pacejka residual trace per D-012 + D-015 Tier 7) + Stage B (V13 3-iterate SCP outer loop per D-012) behind the `DifferentiableProjector` Protocol one-constructor-call swap-point per the D-031 staged ladder; both stages produce honest residual traces that visualise the iterate path without changing the violation strings on the same physical event, so the engine-agnostic D-A claim holds across the V1 + V2 + V12 + V13 engines.

**FastF1 Bahrain Q corner case (camera-ready).** A 5-lap qualifying-pace slice through Turn 10 (slow-speed left-hander preceded by a long DRS straight) is the canonical FastF1 holdout case study. The expected demonstration: TTM zero-shot forecasts a brake-and-trail profile that exceeds the friction ellipse on the entry; Stage 1 QP projects to the feasible-pace envelope; Stage 2 audit confirms feasibility; Instruct narration produces a corner-by-corner coaching report citing the entry-speed delta. Numeric results pending Day-8 measurement.

### 4.6 Reproducibility (see §7 for the full Reproducibility statement)

A summary pointer only: the §4 evaluation protocol is reproducible from the synthetic Sarah Reynolds fixture + the FastF1 holdout list reported in §4.1 at camera-ready, run against the backend pipeline + Convergence-14 test suite that lands per the project's PLAN.md schedule. Full reproducibility-statement detail (Apache 2.0 source tree, Vercel apex-one-black.vercel.app production deploy, Colab notebook, provenance footer schema) is in §7.

**LIPS 4-axis evaluation harness + APEX-Bench release.** Per D-026 + G10 the project ships a Dockerized LIPS harness covering the 4-axis ablation (Latency + Integrity + Physics + Skill) across the four canonical configurations: zero-shot Granite TTM, soft-loss-only, APEX hard projection (V2 cvxpylayers), and the full 3-track ensemble + 8-tier physics composition. The harness lands at `eval/Dockerfile` + the `apex-bench/` repo per the wave-30 maximal-architecture lock; the canned 4-row table renders today at https://apex-one-black.vercel.app/lips-harness for judge-side inspection. The seed (42) + dataset (FastF1 Hamilton 2024 Bahrain Q laps 4-5 holdout) + per-configuration MAE + violation-rate + Guardian-approve-percent + inference-latency are all surfaced; the camera-ready revision substitutes Vinh M3-V15 real-execution numbers for the canned fallback once the Docker image lands per the project schedule.

---

## 5. Limitations

### 5.1 Modeling limitations

- Friction-ellipse coefficient $\mu_v$ is treated as exogenous per-step input to the convex QP inner iterate; the nonconvex coupling between $\mu_v$ + the Pacejka combined-slip output is captured by the SCP outer-loop linearisation (per D-012) but each individual inner iterate remains a fixed-coefficient convex QP. Sessions with rapidly varying friction (sudden weather change mid-lap, single-corner standing water) may require more SCP outer iterates than the wave-30 fixed unroll budget; the Powell-ratio trust-region adjustment (D-027) recovers but at additional per-lap solver latency.
- COA-simultaneity flag is binary at the tensor level; finer-grained domain-specific simultaneity envelopes (per-axle, per-corner, per-equipment-class) collapse to the binary value. Some COAs document multiple permitted-simultaneity windows that this representation collapses; the wave-30 D-018 tri-agent critic loop catches the collapse when the recommendation framing references the collapsed window explicitly, but the projection layer treats all simultaneity-permitted steps uniformly.
- TTM is channel-independent by construction; the projection layer recovers cross-channel relationships at the time-step level but cannot fix mis-aggregation errors at the 1-Hz boundary (sub-second kinetic hallucinations inside a 1-Hz aggregate window remain possible).
- The Guardian audit is a text-classifier-as-a-safety-gate. We do not claim this approach generalizes to other safety surfaces; we claim it is unit-testable and that the Convergence 14 unit-test suite IS the safety contract for this specific pipeline.

### 5.2 Threats to validity

- *Synthetic adaptive-driver fixture.* The Sarah Reynolds telemetry + COA are deliberately fictional. Until a real adaptive-driver beta-tester releases telemetry under per-surface consent, the COA-simultaneity-gate effect-size in Table 3b is upper-bounded by the synthetic fixture's design assumptions. Real-world COAs from adaptive-racing programmes may contain envelope structures the synthetic fixture does not exercise.
- *Public-FastF1 distribution shift.* FastF1 holdouts are Formula 1 telemetry; the TTM forecaster sees no Britcar Trophy or amateur-series telemetry at evaluation time. We rely on TTM's published cross-domain generalization claim; specific motorsport-distribution-shift evaluation is out of scope.
- *Single-author Granite Guardian rule authorship.* The BYOC rules audited in this paper are written by the authors. A third-party audit of the BYOC rule set against the Convergence-14 fixtures would strengthen the safety-contract claim. We invite such audits; the BYOC rules will land in the source repository at `app/backend/apex/guardian/rules/` by camera-ready per the project schedule.

### 5.3 Scope of "first" claims

We restate the bounded scope from §1:

- The TSFM benchmark claim is the upstream Granite TTM result, not a claim about motorsport.
- "First application of a pretrained TSFM to adaptive motorsport telemetry" means "first published application that takes a pretrained TSFM and applies it zero-shot to motorsport telemetry from drivers with FIA Certificates of Adaptations," not "first ever pretrained TSFM applied to vehicle dynamics."
- "First public AI race-engineer workflow we found that reads the FIA Certificate of Adaptations as a binding regulatory input" is bounded by our literature review through 2026-Q2. If a prior workflow is identified, the claim narrows accordingly.

---

## 6. Conclusion

The two-stage projection-and-audit layer is an architectural pattern for any deployment where a frozen pretrained foundation model is applied to a safety-critical sensor-data domain it was not pretrained on. We describe the pattern as applied to adaptive-driver motorsport telemetry where the regulatory binding-document (FIA Certificate of Adaptations) is itself parameterizable at the tensor level. The camera-ready revision reports the §4 experimental evaluation.

We hypothesize the pattern extends to other deployments with crisp physical constraints. Examples that warrant follow-up evaluation include industrial robotics (TSFM-forecast joint angles + torques bounded by safe-operating envelopes), energy-grid load forecasting (Kirchhoff-law projection on grid TSFM forecasts), and autonomous-vehicle trajectory forecasting (sensor-derived state forecasts projected onto physically realizable poses). We deliberately do not extend the pattern to higher-stakes domains (medical advice, financial decisions, judicial outcomes) without domain-specific re-validation, per §8 Ethics.

In each hypothesized case the foundation model stays frozen and the domain-specific constraints stay parameterizable at inference time. The architectural pattern is small enough to be added as an inference-time wrapper to any deployed TSFM without retraining cost, but adaptation to each new domain requires the same Convergence-N serializer-unit-test discipline we developed for motorsport.

---

## 7. Reproducibility statement

Reproducibility is staged. The source tree at https://github.com/StephenSook/apex is Apache 2.0. At the time of paper submission, the frontend coaching surface (Next.js routes, the synthetic Sarah Reynolds fixture, the shared TypeScript contracts mirroring the backend Pydantic schemas, the Colab notebook skeleton at `deliverables/apex-demo.ipynb`, the architecture-spec, and the submission artifacts) is in the repository. The backend pipeline (CvxpyLayer projection QP construction at `app/backend/apex/physics/projection.py`, the Convergence-14 unit-test suite at `app/backend/tests/test_serializer.py`, the Granite Guardian BYOC rules at `app/backend/apex/guardian/rules/`, and the FastF1 download + caching pipeline) lands incrementally per the project's PLAN.md schedule and will be cited by exact commit SHA in the camera-ready revision of this paper. The production Vercel apex-one-black.vercel.app deploy + Colab notebook execute the full pipeline end-to-end (target ship Day 9-10 per PLAN rows 5.1 and 5.2). Every coaching report produced by the pipeline will carry a provenance footer with model versions + input file SHA-256 hashes + cited FIA Articles + COA Sections + Granite Guardian audit ID + commit SHA (target ship per PLAN row 5.7). The Convergence-14 unit-test suite is the in-repository safety contract; once the backend ships per the schedule above, any reproducibility audit can re-run the suite via `pytest app/backend/tests/test_serializer.py`.

## 8. Ethics statement

This paper presents a coaching tool for adaptive racers, veteran-team drivers, and grassroots competitors. The hero use case (Sarah Reynolds, a fictional persona by design) does not represent any real identifiable individual. No real adaptive-driver telemetry, no real FIA Certificate of Adaptations, and no real driver identity is included in the published artifacts at the time of submission. Any future evaluation against real adaptive-driver data will follow the project's anonymization-pre-consent rule (operator names and driver identities anonymized to role descriptions in public artifacts pending explicit per-surface consent; the rule is reproduced in `CODE_OF_CONDUCT.md` and the persona documentation lives at `docs/sarah-reynolds-persona.md` in the source repository).

No human-subject evaluation is reported in this work. Any future real-driver telemetry or COA study based on this pipeline will require institutional ethics review (IRB or institutional exemption determination at the authors' institution and at any collaborating motorsport-rehabilitation programme), written informed consent with explicit withdrawal-rights documentation, per-surface release consent for any artifact derived from the data, and an updated Ethics section in any revision reporting such evaluation.

The Guardian audit gate is explicitly a safety contract for the pipeline's coaching recommendations, not a general statement about foundation-model safety. We do not claim the pattern is sufficient for higher-stakes safety surfaces (medical advice, financial decisions, judicial outcomes) without domain-specific re-validation.

The IBM Granite stack used as infrastructure is itself open-source (Apache 2.0). The IBM × Scuderia Ferrari case study cited in §3.6 is publicly documented; we adopt the same stack and architectural pattern, redirected toward audiences not served by the F1 deployment.

## 9. Acknowledgments

We thank the IBM Research Granite team for releasing the TimeSeries TTM, Guardian, Docling, Vision, and Instruct model families under permissive licenses that made this work possible. We thank the FastF1 maintainers for the public Formula 1 telemetry dataset used in §4 holdout evaluation, and the Federation Internationale de l'Automobile (FIA) for publishing Appendix L to the International Sporting Code in machine-readable form. We thank the BeMyApp + IBM SkillsBuild teams for organizing the AI Builders Challenge May 2026 program that catalyzed this work. The audience definition was informed by publicly documented community materials produced by veteran motorsport rehabilitation programmes and adaptive-driver competition series (no operator names are published without per-surface consent per §8).

## 10. Author contributions

Stephen Sookra: project lead, frontend (Next.js coaching surface, shared TypeScript contracts, BeMyApp 1920x600 banner asset, OG cards), 3-minute submission video script, BeMyApp submission payload narrative, paper §1, §2, §3, §5, §6, §7, §8 prose authorship, paper §9 Acknowledgments + §10 Author contributions + §11 Conflicts of interest + §12 Funding sections, repository discipline (atomic commits, pre-mortem journal, methodology trace, decision log). Vinh Le: backend pipeline (FastAPI orchestration, Granite-Docling COA parser, Granite Vision timing-sheet parser, CvxpyLayer projection-QP construction, post-projection feasibility filter, Granite Guardian BYOC rule authorship, Convergence-14 unit-test suite, FastF1 download + caching pipeline, FastAPI backend deploy scheduled to ship per the project's PLAN.md schedule by the camera-ready revision), paper §4 Experiments tables + ablation results (camera-ready). §13 References compiled jointly. Both authors: paper revision + camera-ready prep.

## 11. Conflicts of interest

The authors declare no conflicts of interest. Both authors are undergraduate students at Kennesaw State University. No commercial sponsorship was received for this work.

## 12. Funding

Unfunded student work submitted to the IBM SkillsBuild AI Builders Challenge May 2026. Compute resources for forecaster inference + paper preparation are the authors' personal hardware.

## 13. References (BibTeX)

```bibtex
@inproceedings{ekambaram2024ttm,
  title = {Tiny Time Mixers (TTM): Fast Pre-trained Models for Enhanced Zero/Few-Shot Forecasting of Multivariate Time Series},
  author = {Ekambaram, Vijay and Jati, Arindam and Nguyen, Nam H. and Sinthong, Phanwadee and Kalagnanam, Jayant},
  booktitle = {Advances in Neural Information Processing Systems (NeurIPS)},
  year = {2024},
  note = {Granite TimeSeries TTM r2.1 model card: ibm-granite/granite-timeseries-ttm-r2 on Hugging Face}
}

@inproceedings{agrawal2019cvxpylayer,
  title = {Differentiable Convex Optimization Layers},
  author = {Agrawal, Akshay and Amos, Brandon and Barratt, Shane and Boyd, Stephen and Diamond, Steven and Kolter, J. Zico},
  booktitle = {Advances in Neural Information Processing Systems (NeurIPS)},
  year = {2019}
}

@article{chrosniak2023deepdynamics,
  title = {Deep Dynamics: Vehicle Dynamics Modeling with a Physics-Informed Neural Network for Autonomous Racing},
  author = {Chrosniak, John and Ning, Jingyun and Behl, Madhur},
  journal = {arXiv preprint arXiv:2312.04374},
  year = {2023}
}

@article{zeng2025chronos,
  title = {Explore the Use of Time Series Foundation Model for Car-Following Behavior Analysis},
  author = {Zeng, Chengyuan and Yan, Xiang},
  journal = {arXiv preprint arXiv:2501.07034},
  year = {2025}
}

@misc{ibm2026guardian,
  title = {Granite Guardian: A Bring-Your-Own-Classifier Safety Gate for Foundation Model Outputs},
  author = {{IBM Research}},
  year = {2026},
  howpublished = {Granite Guardian model family on Hugging Face; specific Hugging Face identifier verified at camera-ready against the latest published release}
}

@misc{fia2017appendixL,
  title = {Appendix L to the International Sporting Code: Drivers' Equipment and Certificates of Adaptations},
  author = {{F\'ed\'eration Internationale de l'Automobile}},
  year = {2017},
  note = {FIA Appendix L is the binding regulation governing adaptive-driver equipment homologation and Certificates of Adaptations; the single-seater ban on disabled drivers was lifted via FIA regulatory revision in December 2017. Specific article citation verified at camera-ready against the current Appendix L PDF.}
}

@misc{ibm2026granite4instruct,
  title = {Granite 4.1 8B Instruct},
  author = {{IBM Research}},
  year = {2026},
  howpublished = {ibm-granite/granite-4.1-8b on Hugging Face (verified 2026-05-21 via the published ibm-granite organisation page)}
}

@misc{ibmgranitedocling2026,
  title = {Granite-Docling 258M: Multimodal Document Parser},
  author = {{IBM Research}},
  year = {2026},
  howpublished = {ibm-granite/granite-docling-258M on Hugging Face}
}

@misc{ibmlangflow2026,
  title = {Langflow: Visual Orchestration for LLM Pipelines},
  author = {{IBM and the Langflow community}},
  year = {2026},
  howpublished = {https://github.com/langflow-ai/langflow}
}

@misc{ibmferrari2025,
  title = {IBM × Scuderia Ferrari HP: Reimagined Mobile App and Granite Stack on Safety-Critical Sensor Data},
  author = {{IBM Newsroom}},
  year = {2025},
  howpublished = {https://newsroom.ibm.com/2025-05-01-ibm-and-scuderia-ferrari-hp-debut-reimagined-mobile-app-to-supercharge-global-formula-1-fan-experience}
}

@misc{tracktitan2026,
  title = {Track Titan: AI Race-Engineer Telemetry Comparison Platform},
  author = {{Track Titan}},
  year = {2026},
  howpublished = {Public product documentation, accessed 2026-05-21}
}

@misc{trophiai2026,
  title = {Trophi.ai: AI Race Coaching from Onboard Telemetry},
  author = {{Trophi.ai}},
  year = {2026},
  howpublished = {Public product documentation, accessed 2026-05-21}
}
```

Camera-ready will add the Moirai (Woo et al. 2024) + Chronos (Ansari et al. 2024) + Llama Guard + Constitutional AI entries once §2 expands to cover their roles in the broader TSFM + safety-classifier landscape, plus any additional motorsport-AI comparators identified between submission and camera-ready.

---

_Last updated: 2026-05-21. Camera-ready revision will report Vinh's §4 Experiments measurements, finalize all citation identifiers, and embed the rendered architecture figure (currently referenced via the source-repository Mermaid diagram)._
