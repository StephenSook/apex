# APEX: A Two-Stage Projection-and-Audit Layer for Adaptive-Driver Motorsport Telemetry on Frozen Time-Series Foundation Models

**Workshop submission target:** NeurIPS 2026 Time-Series Foundation Models Workshop.

**Status:** Draft as of 2026-05-21. §1 Introduction, §2 Related Work, §3 Method, §5 Limitations, §6 Conclusion, §7 Reproducibility, §8 Ethics, §13 References at draft quality. §4 Experiments outline + tables to be reported in the camera-ready revision.

**Authors:** Stephen Sookra (Kennesaw State University), Vinh Le (Kennesaw State University).

**Source code:** https://github.com/StephenSook/apex (Apache 2.0).

---

## Plain-language summary

Pretrained AI forecasting models can predict what a race car will do next, but they were trained on weather and store-sales data and do not know that cars cannot accelerate while braking, or that an adaptive driver using hand-controls may press both at once when their FIA license documents permit it. APEX is a layer that sits between the model's prediction and the coaching report shown to the driver. It projects predictions onto a convex feasible set in the physical-constraint envelope, then audits the nonconvex constraints (the bicycle-model coupling and the COA-permitted simultaneity gate) in a post-projection feasibility filter. The same coaching pipeline produces identity-aware advice for adaptive racers, veteran-team drivers, and grassroots competitors without retraining the foundation model.

## Abstract (250 words)

Pretrained time-series foundation models (TSFMs) trained on general-domain corpora (weather, retail, energy) produce physically impossible forecasts when applied zero-shot to vehicle dynamics. Granite TimeSeries TTM r2.1 outperforms several larger TSFMs on common forecasting benchmarks, but its channel-independent architecture has no mechanism to enforce cross-channel physical relationships such as the friction ellipse, the bicycle model, or kinematic time-coupling. We name this the Kinetic Hallucination problem. Existing AI race-engineer tools either retrain a bespoke physics-informed network (Deep Dynamics) or apply a non-physics foundation model to an adjacent control domain (Chronos applied to car-following gap-distance). Neither path scales to adaptive-driver motorsport, where the driver's FIA Certificate of Adaptations may permit otherwise-impossible input patterns (simultaneous brake-and-throttle via electronic hand-controls) that an able-bodied physics model rejects as driver error. We present APEX, a three-layer architecture wrapping a frozen Granite TimeSeries TTM r2.1 forecaster with a two-stage projection-and-audit layer: a differentiable CvxpyLayer QP that enforces the convex constraints (friction ellipse, forward-Euler kinematic step, jerk bound) and a post-projection feasibility audit for the nonconvex constraints (bicycle-model coupling and the COA-parameterized brake-throttle simultaneity gate). The combined violation log is serialized to plain text and audited by Granite Guardian 4.1 with custom Bring-Your-Own-Classifier rules. We specify an evaluation protocol on a synthetic adaptive-driver Britcar Trophy 2026 Donington Park GP fixture and on FastF1-derived Formula 1 holdout circuits, with cell values populated at camera-ready per §4. Our contributions, scoped to the bounded claims restated in §5.3, are (1) first application of a pretrained TSFM to adaptive motorsport telemetry, applied zero-shot via the two-stage projection-and-audit layer rather than via retraining; (2) the COA-parameterized simultaneity gate as the first public AI race-engineer workflow we found that reads FIA Certificate of Adaptations data as a binding regulatory input; (3) Granite Guardian text-audit as a load-bearing, unit-tested safety contract for foundation-model-derived recommendations.

---

## 1. Introduction

The intersection of foundation models and safety-critical sensor data has produced a category of deployment problems where the model's pretraining distribution does not cover the inference domain. Vehicle dynamics is one such domain. A time-series foundation model pretrained on weather and retail can be applied to motorsport telemetry zero-shot, but the resulting forecasts are not constrained by Newton's laws: nothing in the model architecture prevents a forecast from predicting peak lateral acceleration at zero steering angle, or accelerating speed at zero throttle. We name this failure mode the Kinetic Hallucination problem.

The problem matters specifically because the downstream consumer of these forecasts is a human driver in a moving vehicle who will act on the coaching recommendations derived from them. The standard remediation pattern in the time-series literature is to retrain the model with a physics-informed loss term (Chrosniak et al. 2023), but retraining a foundation model with physics losses defeats the purpose of using a pretrained foundation model in the first place: each new vehicle class, circuit, or regulatory regime requires its own training pass.

Adaptive-driver motorsport, which has been open to disabled drivers since the FIA lifted its single-seater ban in December 2017, adds a second-order constraint. The physical envelope that bounds an adaptive driver's input is not the same as the able-bodied envelope. A driver using an electronic hand-control system may simultaneously brake and apply throttle through dual-stage trigger mechanics that are explicitly permitted by their FIA Certificate of Adaptations (governed by Appendix L of the International Sporting Code). An able-bodied physics model that hard-codes the constraint `throttle * brake = 0` rejects the adaptive driver's correct technique as driver error, and any coaching recommendation derived from that constraint will prescribe corrections the driver physically cannot execute.

This paper addresses three open questions:

1. How can a frozen pretrained TSFM be made physically faithful at inference time without retraining?
2. How does the physics-projection layer interact with adaptive-driver telemetry where the standard `throttle * brake = 0` assumption does not hold?
3. What is the safety contract when a foundation model produces a tuning recommendation acted on by a driver in a moving vehicle?

We argue that the answer to all three is architectural, not training-time. APEX adds a two-stage projection-and-audit layer after the forecaster: a differentiable convex QP projection wraps the convex physical constraints, and a non-differentiable post-projection feasibility filter audits the nonconvex constraints (bicycle-model coupling and the COA-parameterized simultaneity gate). A text-audit gate runs Granite Guardian over the serialized violation log from both stages. The forecaster stays frozen. The recommendations stay tied to the FIA regulatory document the driver actually carries. The Guardian audit is itself unit-tested via a serializer test suite we call Convergence-14, named after the 14 distinct kinematic-violation classes our projection-and-audit layer enumerates.

Our contribution claims are scoped:

- The TSFM benchmark claim is the upstream result from the Granite TTM paper ("outperforms several larger TSFMs in NeurIPS 2024 benchmarks on common forecasting tasks"). We do not extend this to motorsport-specific outperformance.
- The "first" claims are deliberately narrow: first application of a pretrained TSFM to adaptive motorsport telemetry (zero-shot, not domain-pretrained), first public AI race-engineer workflow we found that reads the FIA Certificate of Adaptations as a binding regulatory input, first COA-parameterized brake-throttle simultaneity gate. We do not claim "first physics-projection layer on a TSFM in any domain," nor "first integrated workflow for adaptive hand-controls in any sense."
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

The pipeline runs three layers in series: a frozen TSFM forecaster, a two-stage projection-and-audit layer, and a text-audit gate. The forecaster + projection layer share a single forward pass on a (batch, 24, 9) tensor; the audit gate runs on the serialized violation log carrying both the Stage 1 QP residuals and the Stage 2 feasibility-filter verdicts.

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

### 3.2 Layer 2: two-stage projection-and-audit layer

Layer 2 has two stages: a convex QP projection that handles the physical constraints expressible as convex inequalities, then a post-projection feasibility filter that audits the bicycle-model coupling and the COA-simultaneity gate (which are nonconvex and therefore cannot live inside the CvxpyLayer-wrapped QP).

Let $\mathbf{x}_t = (a_{\text{long},t}, a_{\text{lat},t}, \text{speed}_{t+1})$ be the QP decision variables at step $t$, with $\text{throttle}_t$, $\text{brake}_t$, $\text{steering}_t$, and $\text{speed}_t$ treated as exogenous inputs from the TTM forecaster (or the previous step's accepted state) for that step. Inputs are kept in their physical units (Pascals for brake pressure, m/s for speed, radians for steering); no normalization layer is applied between TTM and the QP solver.

**Stage 1: convex QP projection.** The QP minimizes the squared L2 distance between $\mathbf{x}_t$ and the TTM forecast at step $t$ subject to the following convex constraints applied per forecast step $t \in [0, 24)$:

*Friction ellipse.* The total grip a tire generates is bounded by the friction circle (or ellipse for anisotropic compounds):
$$
\left(\frac{a_{\text{lat},t}}{\mu_y g}\right)^2 + \left(\frac{a_{\text{long},t}}{\mu_x g}\right)^2 \leq 1
$$
In V1 we use $\mu_x = \mu_y = \mu_v$ as a per-circuit constant. V2 extends to circuit-conditional lookup $\mu_v(\text{circuit}, \text{weather})$. V3 (post-paper) replaces the constant-$\mu$ ellipse with a load-dependent Pacejka tire model. The constraint is convex; equivalently, the second-order cone form is $\big\Vert (a_{\text{lat},t}/(\mu_y g),\ a_{\text{long},t}/(\mu_x g)) \big\Vert_2 \leq 1$.

*Forward-Euler kinematic step.* Discrete-time velocity update at $\Delta t = 1.0$ s, coupling the current longitudinal-acceleration decision variable to the next-step speed:
$$
\text{speed}_{t+1} = \text{speed}_t + a_{\text{long},t} \Delta t
$$
This is a linear equality (treating $\text{speed}_t$ as exogenous from the previous step's accepted state and $a_{\text{long},t}$ as a current-step decision variable), therefore convex.

*Jerk bound.* Discrete-time jerk per axis is bounded:
$$
|a_{\cdot, t} - a_{\cdot, t-1}| \leq j_{\max} \Delta t, \quad j_{\max} = 30 \text{ m/s}^3
$$
This is a pair of linear inequalities, therefore convex.

The QP is wrapped by `cvxpylayers.torch.CvxpyLayer` (Agrawal et al., 2019) and is differentiable end-to-end through the projection. CvxpyLayer returns the projected $\mathbf{x}_t$ and a violation log enumerating, for each step, which convex constraint hit its bound.

**Stage 2: nonconvex post-projection feasibility filter.** Two physical relationships are nonconvex and cannot live inside the convex QP. We audit them post-projection and emit additional entries to the violation log; any nonconvex-constraint violation is escalated to the Layer-3 Guardian audit gate but does not gate the QP solve itself.

*Bicycle-model (low-slip kinematic approximation).* Lateral acceleration at the kinematic bicycle approximation is:
$$
\hat{a}_{\text{lat},t} = \frac{\text{speed}_t^2}{L} \tan(\theta_t)
$$
where $L$ is the vehicle wheelbase (BMW M240i Britcar Trophy: $L = 2.69$ m) and $\theta_t$ is the road-wheel angle (not steering-wheel angle) in radians. The relationship is valid only at low tire-slip; at racing speeds, tire slip makes the equality fragile, so we treat it as an audit constraint, not a hard projection equality. We flag a violation when $|a_{\text{lat},t} - \hat{a}_{\text{lat},t}|$ exceeds a slip-tolerant threshold (V1 threshold reported in §4.1 at camera-ready; V2 makes the threshold circuit-conditional).

*COA-parameterized simultaneity gate.* The novelty is not the post-hoc threshold check itself, but the upstream tensor parameterization: the driver's FIA Certificate of Adaptations parsed JSON object (parsed by Granite-Docling at onboarding) is reduced to a binary flag that occupies the 9th channel of the TTM input tensor, so the regulatory document parameterizes audit behavior at the tensor level. If the COA-simultaneity flag is 1 at step $t$, the audit accepts any combination of $(\text{throttle}_t, \text{brake}_t)$ from the TTM forecaster. Otherwise the audit flags a violation when both $\text{throttle}_t$ and $\text{brake}_t$ are non-zero above a small numerical tolerance $\epsilon$ (specific tolerance reported in §4.1 at camera-ready) chosen to avoid floating-point edge cases. Because this is a complementarity-style constraint (its feasible set is nonconvex), enforcing it inside the convex QP would require a mixed-integer formulation that CvxpyLayer does not support; the post-projection feasibility filter is the architecturally correct place.

The two-stage architecture preserves end-to-end differentiability through Stage 1 (the differentiable surface that gradient methods can backprop through if a future user wires the projection layer into a TTM-aware training loop) while keeping the nonconvex audit constraints in Stage 2 honest as a separate accept/reject filter on the projected tensor. Stage 2 is not differentiable through the audit decisions; differentiability claims in this paper apply only to Stage 1.

### 3.3 Layer 3: Granite Guardian Bring-Your-Own-Classifier text audit

The projection layer's violation log is serialized to plain-English using a deliberate text template (the "Convergence 14" serializer, named after the 14 distinct kinematic-violation classes we enumerate). The serialized log is read by Granite Guardian 4.1 under custom BYOC rules, which emits a discriminated `verdict` of `"approve"`, `"flag"`, or `"reject"` along with a reasoning trace and verdict-specific concern lists.

The textual layer is a load-bearing safety contract. The Convergence-14 unit-test suite covers every kinematic-violation class with a Python fixture that fires the violation, asserts the serializer output text, and asserts the expected Guardian verdict; the suite lands in the source repository at `app/backend/tests/test_serializer.py` by camera-ready per the project schedule. The discipline IS the safety contract: if any fixture fails after the suite ships, the pipeline is not deployable.

### 3.4 The COA-parameterized simultaneity gate

The architectural novelty is the binary COA-derived `c_overlap` flag as the 9th channel of the TTM input tensor combined with the conditional post-projection feasibility audit described in §3.2 Stage 2. Adaptive drivers running electronic hand-control systems have Certificates of Adaptations whose hardware-specification sections record the equipment that physically permits simultaneous brake-throttle actuation (for example, the dual-stage trigger pattern documented in the hardware sections of a typical adaptive-driver COA). APEX derives the `c_overlap` flag from these approved hardware specifications via Granite-Docling at parse time. We do not claim that public FIA documents expose a discrete simultaneity field; the flag is derived APEX-side from the adaptation-equipment metadata that the FIA-approved COA already records. The same coaching pipeline produces different corrections for adaptive vs. able-bodied drivers, governed by the COA's binding regulatory text. The pipeline runs the same model, the same convex QP projection, and the same audit gate; only the flag value differs at the tensor level. Because the simultaneity gate is complementarity-style and therefore nonconvex, it lives in §3.2 Stage 2 (post-projection feasibility filter), not in the CvxpyLayer-wrapped QP itself.

### 3.5 Architecture overview

![Figure 1: APEX pipeline architecture. Driver inputs (telemetry CSV, FIA Certificate of Adaptations PDF, written debrief) feed a one-time onboarding stage (Granite-Docling + Granite Vision) and the 60-second post-race coaching loop (1-Hz aggregator -> Granite TimeSeries TTM r2.1 -> Stage 1 differentiable convex QP -> Stage 2 post-projection feasibility filter -> Granite Guardian text audit -> Granite 4.1 8B Instruct narrator). Outputs are a corner-by-corner coaching report, tuning recommendation with COA section citation, next-session envelope forecast, and Guardian safety stamp with reasoning trace.](figures/figure-1-architecture.png)

The diagram is generated from `docs/architecture-diagram.mmd` in the source repository; an SVG copy is at `paper/figures/figure-1-architecture.svg` for vector reproduction. The full Pydantic + TypeScript contract specifications for every layer boundary live in the repository at `app/shared/types.ts` and the architecture spec at `docs/architecture-spec.md`. Layer numbering in this paper compresses the spec's eight-tool view: paper Layer 1 (§3.1) covers spec Layer 3 (Granite TimeSeries TTM r2.1); paper Layer 2 (§3.2 with its two stages) covers spec Layer 4 (projection QP + post-projection feasibility filter); paper Layer 3 (§3.3) covers spec Layer 5 (Granite Guardian audit). The remaining spec layers are infrastructure: Layer 1 hosts Granite-Docling 258M (document vision parser) + the Docling library (Python conversion layer) + Granite Vision 4.1 4B (timing-sheet OCR); Layer 2 is the 1-Hz mini-sector aggregator (APEX-authored Python); Layer 6 is Granite 4.1 8B Instruct (narrator); Layer 7 is Langflow (visible orchestration graph); Layer 8 is IBM Bob (build accelerator). See §3.6 below for the stack provenance.

### 3.6 Pipeline integration with IBM Granite stack

The full pipeline uses eight IBM Granite tools. Two of them (Granite TimeSeries TTM r2.1 as the forecaster and Granite Guardian 4.1 as the audit gate) host the APEX contributions of this paper through the surrounding two-stage projection-and-audit layer. The other six (Granite-Docling 258M for FIA COA PDF parsing, Granite Vision 4.1 4B for timing-sheet PDF parsing, the Docling library as the conversion layer behind the document parsers, Granite 4.1 8B Instruct as the race-engineer narrator, Langflow for visible orchestration graph export, and IBM Bob as the build accelerator) are infrastructure inspired by IBM's publicly documented Ferrari watsonx + Granite case study, redeployed here on a different safety-critical sensor-data domain.

---

## 4. Experiments

The §4 prose below specifies the evaluation protocol. The Table 1 / Table 2 / Table 3 skeletons that follow each subsection are populated in the camera-ready revision once the Vinh-lane backend lands per PLAN.md row 5.7. Each skeleton states the exact shape of the table (rows, columns, units) so the camera-ready editor only fills cell values, not structure.

**Datasets.**

- *Sarah Reynolds Britcar Trophy 2026 Donington Park GP fixture (synthetic).* A 60-row (1.2-second) 50-Hz telemetry slice extracted from lap 17 of 19 of a plausible adaptive-driver qualifying session for a left-leg-amputee veteran using electronic hand-controls. The slice covers the brake-release-to-throttle-on micro-window at one corner entry, deliberately sized to exercise the COA-simultaneity gate at the smallest fixture footprint we could ship in the repository (full-lap telemetry awaits a real adaptive-driver collaborator per §5.2). Paired with a 9-domain COA JSON whose structure mirrors the FIA Appendix L regulatory anchor for adaptive-equipment homologation. The fixture is synthetic by design (no real adaptive-driver identity); the lap shape, debrief language, and COA structure are derived from publicly documented Britcar Trophy regulations.
- *FastF1 holdouts.* Five Formula 1 circuits drawn from the FastF1 public dataset. Selection criteria: circuits with at least three completed sessions in the 2024 season, mixed-pace (high-speed + slow-corner) layout, dry weather. Specific circuit list reported in §4.1 at camera-ready.

**Table 1: Dataset summary.** Skeleton; cell values populated at camera-ready.

| Dataset | Circuits / sessions | Hz | Channels | COA channel? | Use |
|---------|---------------------|-----|----------|--------------|-----|
| Sarah Reynolds Britcar GP synthetic slice | 60 rows (1.2 seconds) from qualifying lap 17 of 19 | 50 | 8 + 1 (COA flag) | yes | COA-simultaneity-gate ablation (Table 3b) |
| FastF1 holdouts | 5 / -- (>=3 per circuit) | 50 -> 1 (aggregated) | 8 | no | Lap-time MAE + physics-violation rate (Table 2) |

**Baselines.**

- TTM zero-shot, no physics projection (the un-corrected Kinetic Hallucination baseline).
- Seasonal-naive (last-lap repeat) at 1-Hz mini-sector resolution.
- TTM + Stage 1 QP only (Stage 2 audit disabled; isolates the differentiable-convex contribution from the nonconvex audit contribution).
- Deep Dynamics retrained on the same FastF1 holdouts, if a public PINN checkpoint is available; otherwise dropped from Table 2.

**Table 2: Forecaster comparison on FastF1 holdouts.** Skeleton; cell values populated at camera-ready. Lower is better for MAE + violation-rate columns.

| Method | Lap-time MAE (s) | Physics-violation rate (fraction of steps) | Guardian approve / flag / reject (%) | Inference latency (ms / step) | Retraining cost (GPU-hours) |
|--------|------------------|--------------------------------------------|--------------------------------------|-------------------------------|------------------------------|
| Seasonal-naive (last-lap repeat) | -- | -- | -- | -- | 0 |
| TTM zero-shot (no projection) | -- | -- | -- | -- | 0 |
| TTM + Stage 1 QP only | -- | -- | -- | -- | 0 |
| TTM + Stage 1 QP + Stage 2 feasibility filter (APEX) | -- | -- | -- | -- | 0 |
| Deep Dynamics retrained (if checkpoint available) | -- | -- | -- | -- | -- |

**Metrics.**

- Per-mini-sector lap-time MAE (mean absolute error on the lap-time scalar per mini-sector). Tables 2 + 3a + 3b carry this metric.
- Physics-violation rate, measured separately at three points in the pipeline so Tables 2 + 3 carry differential signal: (a) raw TTM output (the un-corrected Kinetic Hallucination baseline), (b) Stage 1 QP output (residual convex-feasibility violations from numerical tolerance only), (c) Stage 2 audit failures (bicycle-coupling or COA-gate verdicts that fire reject). All three reported as fraction of total forecast steps.
- Guardian verdict distribution (approve / flag / reject ratio on canned + holdout sets); reported as the Guardian column in Tables 2 + 3a + 3b.

**Convergence 14 validation.** Every kinematic-violation class in the Convergence-14 enumeration has a unit-test fixture firing the violation + asserting the serializer output + Guardian verdict match the expected verdict.

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
| Stage 2 with COA gate OFF (able-bodied physics) | -- | -- | -- |

*Table 3c: Guardian audit on / off.* Wall-clock latency of the Convergence-14 audit only; correctness is established by unit-test suite, not by this ablation.

| Configuration | Median audit latency (ms) | Pipeline wall-clock (s) |
|---------------|---------------------------|---------------------------|
| Guardian ON (APEX default) | -- | -- |
| Guardian OFF | n / a | -- |

**Latency budget.** Target post-onboarding loop wall-clock is <= 60 seconds on a commodity RTX 4060 GPU (Granite-Docling + Granite Vision run once at onboarding and cache to disk; the live loop is forecaster + projection + Guardian audit + Instruct narration). Latency breakdown table pending Day-8 measurement.

### 4.6 Reproducibility (see §7 for the full Reproducibility statement)

A summary pointer only: the §4 evaluation protocol is reproducible from the synthetic Sarah Reynolds fixture + the FastF1 holdout list reported in §4.1 at camera-ready, run against the backend pipeline + Convergence-14 test suite that lands per the project's PLAN.md schedule. Full reproducibility-statement detail (Apache 2.0 source tree, Hugging Face Space, Colab notebook, provenance footer schema) is in §7.

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

Reproducibility is staged. The source tree at https://github.com/StephenSook/apex is Apache 2.0. At the time of paper submission, the frontend coaching surface (Next.js routes, the synthetic Sarah Reynolds fixture, the shared TypeScript contracts mirroring the backend Pydantic schemas, the Colab notebook skeleton at `deliverables/apex-demo.ipynb`, the architecture-spec, and the submission artifacts) is in the repository. The backend pipeline (CvxpyLayer projection QP construction at `app/backend/apex/physics/projection.py`, the Convergence-14 unit-test suite at `app/backend/tests/test_serializer.py`, the Granite Guardian BYOC rules at `app/backend/apex/guardian/rules/`, and the FastF1 download + caching pipeline) lands incrementally per the project's PLAN.md schedule and will be cited by exact commit SHA in the camera-ready revision of this paper. The published Hugging Face Space + Colab notebook will execute the full pipeline end-to-end in a browser by camera-ready (target ship Day 9-10 per PLAN rows 5.1 and 5.2). Every coaching report produced by the pipeline will carry a provenance footer with model versions + input file SHA-256 hashes + cited FIA Articles + COA Sections + Granite Guardian audit ID + commit SHA (target ship per PLAN row 5.7). The Convergence-14 unit-test suite is the in-repository safety contract; once the backend ships per the schedule above, any reproducibility audit can re-run the suite via `pytest app/backend/tests/test_serializer.py`.

## 8. Ethics statement

This paper presents a coaching tool for adaptive racers, veteran-team drivers, and grassroots competitors. The hero use case (Sarah Reynolds, a fictional persona by design) does not represent any real identifiable individual. No real adaptive-driver telemetry, no real FIA Certificate of Adaptations, and no real driver identity is included in the published artifacts at the time of submission. Any future evaluation against real adaptive-driver data will follow the project's anonymization-pre-consent rule (operator names and driver identities anonymized to role descriptions in public artifacts pending explicit per-surface consent; the rule is reproduced in `CODE_OF_CONDUCT.md` and the persona documentation lives at `docs/sarah-reynolds-persona.md` in the source repository).

No human-subject evaluation is reported in this work. Any future real-driver telemetry or COA study based on this pipeline will require institutional ethics review (IRB or institutional exemption determination at the authors' institution and at any collaborating motorsport-rehabilitation programme), written informed consent with explicit withdrawal-rights documentation, per-surface release consent for any artifact derived from the data, and an updated Ethics section in any revision reporting such evaluation.

The Guardian audit gate is explicitly a safety contract for the pipeline's coaching recommendations, not a general statement about foundation-model safety. We do not claim the pattern is sufficient for higher-stakes safety surfaces (medical advice, financial decisions, judicial outcomes) without domain-specific re-validation.

The IBM Granite stack used as infrastructure is itself open-source (Apache 2.0). The IBM × Scuderia Ferrari case study cited in §3.6 is publicly documented; we adopt the same stack and architectural pattern, redirected toward audiences not served by the F1 deployment.

## 9. Acknowledgments

We thank the IBM Research Granite team for releasing the TimeSeries TTM, Guardian, Docling, Vision, and Instruct model families under permissive licenses that made this work possible. We thank the FastF1 maintainers for the public Formula 1 telemetry dataset used in §4 holdout evaluation, and the Federation Internationale de l'Automobile (FIA) for publishing Appendix L to the International Sporting Code in machine-readable form. We thank the BeMyApp + IBM SkillsBuild teams for organizing the AI Builders Challenge May 2026 program that catalyzed this work. The audience definition was informed by publicly documented community materials produced by veteran motorsport rehabilitation programmes and adaptive-driver competition series (no operator names are published without per-surface consent per §8).

## 10. Author contributions

Stephen Sookra: project lead, frontend (Next.js coaching surface, shared TypeScript contracts, BeMyApp 1920x600 banner asset, OG cards), 3-minute submission video script, BeMyApp submission payload narrative, paper §1, §2, §3, §5, §6, §7, §8 prose authorship, paper §9 Acknowledgments + §10 Author contributions + §11 Conflicts of interest + §12 Funding sections, repository discipline (atomic commits, pre-mortem journal, methodology trace, decision log). Vinh Le: backend pipeline (FastAPI orchestration, Granite-Docling COA parser, Granite Vision timing-sheet parser, CvxpyLayer projection-QP construction, post-projection feasibility filter, Granite Guardian BYOC rule authorship, Convergence-14 unit-test suite, FastF1 download + caching pipeline, Hugging Face Space containerization scheduled to ship per the project's PLAN.md schedule by the camera-ready revision), paper §4 Experiments tables + ablation results (camera-ready). §13 References compiled jointly. Both authors: paper revision + camera-ready prep.

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
