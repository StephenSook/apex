# PhysicsTTM NeurIPS-Style Methods Specification

This document defines the methods section for APEX/PhysicsTTM: a frozen time-series foundation model wrapped by a vehicle-physics projection layer conditioned by adaptive-control metadata. The formulation is written for a NeurIPS workshop paper, with explicit assumptions, equations, implementation choices, evaluation metrics, ablations, and limitations.

APEX's central methodological claim is that **PhysicsTTM projects raw forecasts from a frozen IBM Granite TimeSeries TTM model into a vehicle- and adaptation-aware feasible set**, rather than claiming TTM itself understands vehicle physics. Tiny Time Mixer is a compact MLP-Mixer time-series foundation model with variants up to 1536 context steps in the r2 release; its official model card describes channel-independent pretraining with optional channel-mixing fine-tuning rather than hard physical constraints ([TTM arXiv paper](https://arxiv.org/abs/2401.03955), [Granite TTM r2 model card](https://huggingface.co/ibm-granite/granite-timeseries-ttm-r2)).

The methodological novelty is the composition: **frozen TSFM forecast + post-hoc differentiable projection + motorsport vehicle-dynamics constraints + COA-derived adaptive-control semantics**. This does not claim that differentiable optimization layers are new (OptNet introduced QP layers in neural networks; cvxpylayers generalized differentiable convex optimization layers to disciplined convex programs per [OptNet](https://arxiv.org/abs/1703.00443) + [cvxpylayers](https://arxiv.org/abs/1910.12430)).

## Notation

Let \(X_{t-L+1:t} \in \mathbb{R}^{L \times d}\) denote the input telemetry history over \(L\) timesteps and \(d\) channels. Let \(H\) be the forecast horizon, and let a frozen time-series foundation model \(f_\theta\) produce a raw forecast:

\[
\hat{Y}_{t+1:t+H} = f_\theta(X_{t-L+1:t}), \quad \hat{Y} \in \mathbb{R}^{H \times d}.
\]

For each predicted timestep \(h\), the predicted vector is the wave-30 D-016 14-channel contract:

\[
\hat{y}_{h} =
[
\hat{\tau}_{h},
\hat{b}_{h},
\hat{\delta}_{h},
\hat{r}_{h},
\hat{a}_{y,h},
\hat{a}_{x,h},
\hat{v}_{x,h},
\hat{G}_{h},
\hat{c}_{\text{overlap},h},
\hat{F}_{z,h},
\hat{\mu}_{v,h},
\hat{\phi}_{h},
\hat{\beta}_{h},
\hat{\omega}_{h}
]^\top,
\]

where \(\tau \in [0,1]\) is throttle command, \(b \in [0,1]\) is brake command, \(\delta\) is steering angle (radians, road-wheel), \(r\) is engine RPM, \(a_y\) is lateral acceleration (g), \(a_x\) is longitudinal acceleration (g), \(v_x\) is longitudinal speed (m/s), \(G\) is gear (integer 0-8), \(c_{\text{overlap}} \in \{0, 1\}\) is the COA-derived simultaneity flag, \(F_z\) is per-tire vertical-load aggregate after Tier 4 double-track load-transfer adjustments, \(\mu_v\) is the per-step friction coefficient consumed + updated by Tier 5 tire thermal + Tier 7 Pacejka combined-slip, \(\phi\) is track-frame pitch (radians; Tier 1 3D track geometry input), \(\beta\) is track-frame bank (radians; Tier 1), and \(\omega\) is yaw rate (radians/second; Tier 8 kinematic integration input). The forecast tensor shape is \((B, 30, 14)\) per the wave-30 D-016 channel expansion (the wave-22 baseline was \((B, 24, 9)\); migration pads channels 9-13 with zeros + extends the time axis to 30). The internal SCP solver carries \(T_{\text{surface}} + T_{\text{core}}\) as internal state per Tier 5 (not channels of the input tensor); see paper §3.1 + arch-spec Appendix W30 for the full channel-to-tier binding.

Let \(m\) denote vehicle mass, \(L = l_f + l_r\) wheelbase, \(l_f\) and \(l_r\) front and rear axle distances, \(I_z\) yaw inertia, \(g\) gravitational acceleration, and \(\mu\) the estimated tire-road friction coefficient. For a hackathon demo, these can be fixed nominal constants; for a paper, sensitivity analysis over \(L\), \(\mu\), and acceleration bounds should be reported.

## Frozen TTM backbone

The base forecaster is IBM Granite TimeSeries TTM r2. TTM uses adaptive patching, resolution prefix tuning, and diverse resolution sampling, and the r2 model card lists TTM-B, TTM-E, and TTM-A variants with context lengths up to 1536 timesteps ([TTM arXiv paper](https://arxiv.org/abs/2401.03955), [Granite TTM r2 model card](https://huggingface.co/ibm-granite/granite-timeseries-ttm-r2)).

The paper should use one of three explicit modes:

| Mode | Backbone | Decoder/head | Claim strength |
|---|---|---|---|
| Zero-shot TTM | Frozen | Frozen | Strongest “no retraining” demo, weakest accuracy |
| Few-shot TTM | Frozen | Fine-tuned head only | Best paper tradeoff, consistent with TTM usage pattern |
| End-to-end TTM | Fine-tuned | Fine-tuned | Not recommended for the novelty claim |

The recommended paper setup is **frozen backbone with optional head fine-tuning**, because the TTM paper and model card describe freezing the backbone and fine-tuning a lightweight decoder/head as a core usage pattern ([TTM arXiv paper](https://arxiv.org/abs/2401.03955), [Granite TTM r2 model card](https://huggingface.co/ibm-granite/granite-timeseries-ttm-r2)).

## Projection layer

PhysicsTTM defines the corrected forecast \(Y^*\) as the closest feasible forecast to TTM’s raw output:

\[
Y^* = \Pi_{\mathcal{C}(c)}(\hat{Y})
=
\underset{Y \in \mathbb{R}^{H \times d}}{\mathrm{argmin}}
\;
\frac{1}{2}
\sum_{h=1}^{H}
(y_h - \hat{y}_h)^\top W_h (y_h - \hat{y}_h)
+ \lambda_{\text{soft}}\Phi_{\text{soft}}(Y)
\quad
\text{s.t.}
\quad
Y \in \mathcal{C}_{\text{hard}}(c).
\]

Here \(W_h \succ 0\) is a per-channel confidence weight matrix, \(\Phi_{\text{soft}}\) contains soft physics penalties, and \(c\) is driver and vehicle metadata. The metadata \(c\) includes vehicle constants and an adaptive-control indicator derived from approved hardware specifications. This is a projection layer in the tradition of optimization-defined neural layers, where the projection is differentiable under regularity conditions through the KKT system ([OptNet](https://arxiv.org/abs/1703.00443), [cvxpylayers](https://arxiv.org/abs/1910.12430), [Deep Declarative Networks](https://ieeexplore.ieee.org/document/9355027/)).

For inference-only demos, gradients through the projection layer are not required. For methods-paper completeness, the differentiability statement is:

\[
\frac{\partial Y^*}{\partial \hat{Y}}
\quad
\text{is obtained by implicit differentiation of the KKT conditions when constraint qualifications hold.}
\]

APEX should not claim that the projection provides global guarantees for nonconvex vehicle dynamics. It can claim hard feasibility to solver tolerance for convex constraints, and local first-order feasibility for linearized or sequentially convex approximations of nonconvex constraints ([OptNet](https://arxiv.org/abs/1703.00443), [cvxpylayers](https://arxiv.org/abs/1910.12430)).

## Vehicle-dynamics constraints

### Hard box constraints

These constraints are convex, easy to implement, and defensible at both 1 Hz and higher-rate telemetry:

\[
0 \le v_{x,h} \le v_{\max}
\]

\[
a_{x,\min} \le a_{x,h} \le a_{x,\max}
\]

\[
|\delta_h| \le \delta_{\max}
\]

\[
0 \le \tau_h \le 1, \quad 0 \le b_h \le 1.
\]

These constraints should be implemented as hard linear inequalities in the QP or SOCP. They are not novel, but they are critical to preventing physically impossible forecasts.

### Kinematic bicycle consistency

The kinematic bicycle model assumes negligible tire slip and relates speed, steering, yaw rate, and wheelbase. For heading \(\psi\), speed \(v\), steering angle \(\delta\), and body slip approximation \(\beta = \arctan(l_r \tan\delta / L)\), the model is:

\[
\dot{x} = v\cos(\psi+\beta),
\quad
\dot{y} = v\sin(\psi+\beta),
\quad
\dot{\psi} = \frac{v\cos\beta\tan\delta}{L}.
\]

For small \(\beta\), yaw rate consistency is:

\[
\omega_h \approx \frac{v_{x,h}\tan\delta_h}{L}.
\]

This relationship is a standard vehicle-dynamics approximation and appears in vehicle dynamics references such as Rajamani’s *Vehicle Dynamics and Control* ([Rajamani, Springer](https://link.springer.com/book/10.1007/978-1-4614-1433-9)). Because \(\tan(\delta)\) and \(v_x\tan(\delta)\) are nonlinear, the paper should use it as a soft penalty or a linearized constraint:

\[
\Phi_{\text{yaw}}(Y)
=
\sum_{h=1}^{H}
\left(
\omega_h - \frac{v_{x,h}\tan\delta_h}{L}
\right)^2.
\]

For a QP implementation, linearize around the raw forecast \((\hat{v}_{x,h}, \hat{\delta}_h)\):

\[
\frac{v_{x,h}\tan\delta_h}{L}
\approx
\frac{\hat{v}_{x,h}\tan\hat{\delta}_h}{L}
+
\frac{\tan\hat{\delta}_h}{L}(v_{x,h}-\hat{v}_{x,h})
+
\frac{\hat{v}_{x,h}\sec^2\hat{\delta}_h}{L}(\delta_h-\hat{\delta}_h).
\]

This makes the yaw consistency term quadratic in the optimization variables and compatible with a convex QP when used as a penalty.

### Dynamic bicycle model context

For high-speed racing, the dynamic bicycle model includes lateral velocity \(v_y\), yaw rate \(\omega\), tire cornering stiffnesses \(C_{\alpha f}, C_{\alpha r}\), and yaw inertia \(I_z\). A common linearized form is:

\[
\frac{d}{dt}
\begin{bmatrix}
v_y \\
\omega
\end{bmatrix}
=
\begin{bmatrix}
-\frac{C_{\alpha f}+C_{\alpha r}}{m v_x}
&
-v_x - \frac{C_{\alpha f}l_f - C_{\alpha r}l_r}{m v_x}
\\
-\frac{C_{\alpha f}l_f - C_{\alpha r}l_r}{I_z v_x}
&
-\frac{C_{\alpha f}l_f^2 + C_{\alpha r}l_r^2}{I_z v_x}
\end{bmatrix}
\begin{bmatrix}
v_y \\
\omega
\end{bmatrix}
+
\begin{bmatrix}
C_{\alpha f}/m \\
C_{\alpha f}l_f/I_z
\end{bmatrix}
\delta.
\]

This richer model is useful for related-work framing, but it requires variables and parameters not present in many public telemetry datasets. Deep Dynamics and FTHD demonstrate physics-informed high-speed racing models with tire-force structure, but they train custom physics-informed models rather than wrapping a frozen TSFM with a projection layer ([Deep Dynamics](https://arxiv.org/abs/2312.04374), [FTHD](https://arxiv.org/abs/2409.19647)).

### Friction circle and friction ellipse

The tire-force friction circle is:

\[
\sqrt{F_x^2 + F_y^2} \le \mu F_z.
\]

At vehicle level, this is often approximated by a g-g friction ellipse:

\[
\left(\frac{a_{x,h}}{a_{x,\max}}\right)^2
+
\left(\frac{a_{y,h}}{a_{y,\max}}\right)^2
\le 1.
\]

The friction ellipse is grounded in tire-force ellipse literature and is commonly used as a combined longitudinal-lateral grip budget ([Brach and Brach, SAE](https://saemobilus.sae.org/papers/tire-force-ellipse-friction-ellipse-tire-characteristics-2011-01-0094)).

The exact ellipse can be implemented as a second-order cone constraint:

\[
\left\|
\begin{bmatrix}
a_{x,h}/a_{x,\max} \\
a_{y,h}/a_{y,\max}
\end{bmatrix}
\right\|_2
\le 1.
\]

This makes the projection an SOCP rather than a QP. cvxpylayers supports differentiable disciplined convex programs, so an SOCP is acceptable for the paper if implementation latency allows it ([cvxpylayers](https://arxiv.org/abs/1910.12430)).

If the demo must remain a strict QP, use a conservative polyhedral approximation to the ellipse:

\[
s_k^\top
\begin{bmatrix}
a_{x,h}/a_{x,\max} \\
a_{y,h}/a_{y,\max}
\end{bmatrix}
\le 1,
\quad
k = 1,\dots,K,
\]

where \(s_k = [\cos(2\pi k/K), \sin(2\pi k/K)]^\top\). With \(K=8\), this becomes an octagonal inner approximation. The paper should state that this is conservative and chosen for QP compatibility.

### Acceleration and speed coherence

The forward-Euler kinematic step is enforced as a hard equality at the inner SCP iterate:

\[
v_{x,h+1} = v_{x,h} + a_{x,h}\Delta t.
\]

Treating \(v_{x,h}\) as exogenous from the previous step's accepted state and \(a_{x,h}\) as a current-step decision variable makes the equality linear + therefore convex; CvxpyLayer enforces it inside the Stage 1 QP solve (per paper §3.2). The earlier methods draft framed the equality as a soft penalty \(\Phi_{\text{kin}}\) to accommodate noisy 1 Hz telemetry, but the wave-30 architecture absorbs the noise into the SCP outer-loop trust-region (D-027 Powell-ratio acceptance) rather than relaxing the kinematic equality itself.

### Steering-rate and jerk constraints

Steering-rate and jerk constraints are active:

\[
\left|
\frac{\delta_h - \delta_{h-1}}{\Delta t}
\right|
\le
\dot{\delta}_{\max},
\quad
\left|
\frac{a_{x,h} - a_{x,h-1}}{\Delta t}
\right|
\le
j_{\max},
\quad
j_{\max} = 8 \text{ m/s}^3 \approx 0.815 \text{ g/s}.
\]

The wave-30 D-011 multi-frequency coexistence pattern coordinates rate enforcement across three sampling rates: the 1 Hz mini-sector aggregation of the TTM r2.1 backbone uses the tighter \(j_{\max} = 8 \text{ m/s}^3\) value to keep the constraint load-bearing at the coarser sampling rate, polyphase phase-streams feed TSPulse anomaly detection at higher rates, and Granite FlowState runs the rate constraint at native 50 Hz on the raw upstream signal before mini-sector aggregation. The 1 Hz aggregation caveat is consistent with vehicle-modeling work that compares kinematic and dynamic models under different sampling and control settings ([Kinematic and Dynamic Vehicle Models for Autonomous Driving Control Design](https://nuhuo08.github.io/control/IV_KinematicMPC_jason.pdf)).

## Brake-throttle and adaptive-control constraints

### Default able-bodied brake-throttle model

For conventional pedal-control telemetry, high throttle and high brake at the same instant is usually suspicious. Exact exclusivity,

\[
\tau_h b_h = 0,
\]

is bilinear and nonconvex. The recommended demo and paper formulation is a soft exclusivity penalty:

\[
\Phi_{\text{BT}}^{\text{AB}}(Y)
=
\sum_{h=1}^{H}
\tau_h b_h.
\]

If a strict convex QP is required, replace bilinear exclusivity with a single signed actuation variable \(u_h \in [-1,1]\), where \(u_h > 0\) means throttle and \(u_h < 0\) means brake. This is cleaner mathematically but less faithful to raw motorsport telemetry channels.

### Adaptive hand-control exception

For approved adaptive hand-control systems, brake-throttle overlap can be legitimate. MME Motorsport’s hand-controls page explicitly describes “holding full throttle and applying a little braking in the corner” as a simultaneous-control case, and Professional Motorsport World documents the same Team BRIT and MME control mechanism ([MME Motorsport hand controls](https://www.mme-motorsport.com/en/products/hand-controls), [Professional Motorsport World feature](https://www.pmw-magazine.com/features/behind-mme-team-brit-hand-control-tech.html)).

Let \(c_{\text{overlap}} \in \{0,1\}\) be a **derived** flag from approved hardware specifications, not an explicit FIA COA field. Then:

\[
\Phi_{\text{BT}}(Y; c_{\text{overlap}})
=
(1 - c_{\text{overlap}})
\sum_{h=1}^{H}
\tau_h b_h.
\]

This removes the brake-throttle exclusivity penalty for adaptive hardware that permits overlap. If a more nuanced system is needed, define a permitted overlap envelope:

\[
\tau_h b_h \le \rho_{\max}(c),
\]

where \(\rho_{\max}(c)=0\) for conventional controls and \(\rho_{\max}(c)>0\) for approved hand-control configurations. Because \(\tau_h b_h\) is bilinear, the envelope should be implemented as a soft penalty or approximated with piecewise-linear constraints.

### COA-derived semantics

FIA materials describe the Certificate of Adaptations as authorizing vehicle modifications required for drivers with disabilities, but the public FIA sources do not expose a discrete “simultaneity permitted” field ([FIA Disability and Accessibility page](https://www.fia.com/disability-accessibility), [FIA Appendix L PDF](https://www.fia.com/sites/default/files/appendix_l_2022_publie_le_15_december_2021_0.pdf)). Therefore, the safe wording is:

> APEX derives a simultaneity flag from approved COA hardware specifications and adaptation metadata.

The unsafe wording is:

> The COA contains an explicit simultaneity flag.

## Complete optimization forms

### QP version for the hackathon demo

Use this when the demo must be simple, fast, and explainable:

\[
Y^* =
\underset{Y}{\mathrm{argmin}}
\;
\frac{1}{2}
\sum_{h=1}^{H}
(y_h - \hat{y}_h)^\top W_h (y_h - \hat{y}_h)
+
\lambda_{\text{yaw}}\Phi_{\text{yaw-lin}}(Y)
+
\lambda_{\text{kin}}\Phi_{\text{kin}}(Y)
+
\lambda_{\text{BT}}\Phi_{\text{BT}}(Y;c_{\text{overlap}})
\]

\[
\text{s.t.}
\quad
0 \le v_{x,h} \le v_{\max},
\quad
a_{x,\min} \le a_{x,h} \le a_{x,\max},
\quad
|\delta_h| \le \delta_{\max},
\quad
0 \le \tau_h,b_h \le 1,
\]

\[
s_k^\top
\begin{bmatrix}
a_{x,h}/a_{x,\max} \\
a_{y,h}/a_{y,\max}
\end{bmatrix}
\le 1
\quad
\forall h,k.
\]

This is a convex QP when the yaw term is linearized and brake-throttle overlap is handled as either a soft penalty evaluated around fixed raw values or with a convex surrogate. For the demo, the output should show raw TTM violations, projected feasibility, and the specific constraints that changed.

### SOCP version for the paper

Use this when exact friction-ellipse feasibility is more important than strict QP labeling:

\[
Y^* =
\underset{Y}{\mathrm{argmin}}
\;
\frac{1}{2}
\sum_{h=1}^{H}
(y_h - \hat{y}_h)^\top W_h (y_h - \hat{y}_h)
+
\lambda_{\text{yaw}}\Phi_{\text{yaw-lin}}(Y)
+
\lambda_{\text{kin}}\Phi_{\text{kin}}(Y)
+
\lambda_{\text{BT}}\Phi_{\text{BT}}(Y;c_{\text{overlap}})
\]

\[
\text{s.t.}
\quad
\left\|
\begin{bmatrix}
a_{x,h}/a_{x,\max} \\
a_{y,h}/a_{y,\max}
\end{bmatrix}
\right\|_2
\le 1
\quad
\forall h,
\]

plus the same box and rate constraints. This is an SOCP and can be implemented with cvxpylayers if latency is acceptable ([cvxpylayers](https://arxiv.org/abs/1910.12430)).

### Sequential convex version for future work

Nonconvex constraints such as exact tire forces, Pacejka tire models, and nonlinear engine maps require sequential convex programming or soft penalties. Sequential convex programming is common in autonomous racing trajectory planning, but it introduces additional latency and convergence caveats ([Sequential Convex Programming for Autonomous Vehicle Racing](https://doi.org/10.1109/TIV.2022.3168130)).

## Physical validity metrics

The paper should report both forecast accuracy and physical validity. Accuracy alone is insufficient because a low-MAE forecast can still violate vehicle physics.

### Forecast accuracy

\[
\text{MSE}
=
\frac{1}{N H d}
\sum_{i=1}^{N}
\sum_{h=1}^{H}
\sum_{j=1}^{d}
(\hat{x}^{j}_{i,t+h} - x^{j}_{i,t+h})^2.
\]

\[
\text{MAE}
=
\frac{1}{N H d}
\sum_{i=1}^{N}
\sum_{h=1}^{H}
\sum_{j=1}^{d}
|\hat{x}^{j}_{i,t+h} - x^{j}_{i,t+h}|.
\]

### Constraint violation rate

For each constraint \(f_k(y) \le 0\), report:

\[
\text{CVR}_k
=
\frac{1}{N H}
\sum_{i=1}^{N}
\sum_{h=1}^{H}
\mathbf{1}[f_k(\hat{y}_{i,h}) > \epsilon_k].
\]

Report separate violation rates for brake-throttle overlap, friction envelope, speed-acceleration coherence, yaw consistency, and bounds.

### Projection distance

\[
\text{PD}
=
\frac{1}{N H}
\sum_{i=1}^{N}
\sum_{h=1}^{H}
\|
\hat{y}_{i,h} -
\Pi_{\mathcal{C}}(\hat{y}_{i,h})
\|_2.
\]

Projection distance is the cleanest “kinetic hallucination magnitude” metric. A large projection distance means the raw forecast was far from the feasible set.

### Feasibility rate

\[
\text{FR}
=
\frac{1}{N H}
\sum_{i=1}^{N}
\sum_{h=1}^{H}
\mathbf{1}[\hat{y}_{i,h} \in \mathcal{C}].
\]

This measures how often raw forecasts are already physically valid.

### Post-projection accuracy degradation

\[
\text{PPAD}
=
\text{MAE}(Y^*,Y_{\text{true}})
-
\text{MAE}(\hat{Y},Y_{\text{true}}).
\]

The desired result is a large reduction in constraint violations with small PPAD.

### Adaptive brake-throttle metrics

For adaptive control, define:

- **BT false positive**: a legitimate overlap state is incorrectly flagged as impossible.
- **BT false negative**: an illegitimate overlap state is allowed when no adaptive overlap flag exists.

For a binary overlap label \(o_h = \mathbf{1}[\tau_h > \tau_0 \land b_h > b_0]\), report:

\[
\text{BT-FP}
=
\frac{\#\{\text{adaptive legitimate overlaps flagged invalid}\}}
{\#\{\text{adaptive legitimate overlaps}\}}.
\]

\[
\text{BT-FN}
=
\frac{\#\{\text{non-adaptive invalid overlaps allowed}\}}
{\#\{\text{non-adaptive invalid overlaps}\}}.
\]

This metric directly tests the APEX claim that adaptive drivers should not be evaluated with able-bodied brake-throttle assumptions.

## Ablation plan

The paper should use this ablation table if time permits:

| ID | Condition | Frozen TSFM? | Projection? | COA-aware? | Purpose |
|---|---:|---:|---:|---:|---|
| A1 | Last-value repeat | No | No | No | Naive baseline |
| A2 | LSTM | No | No | No | Standard sequence baseline |
| A3 | PatchTST or iTransformer | No | No | No | Non-foundation transformer baseline |
| A4 | Kinematic bicycle extrapolator | No | Implicit | No | Physics-only baseline |
| A5 | TTM zero-shot | Yes | No | No | Raw frozen TSFM |
| A6 | TTM few-shot head | Backbone yes | No | No | TTM adaptation without projection |
| A7 | TTM plus able-bodied projection | Yes | Yes | No | Shows conventional physics constraints |
| A8 | TTM plus COA-derived projection | Yes | Yes | Yes | Main APEX method |
| A9 | PINN or soft physics-loss model | No | Soft only | No | Distinguishes projection from PINN training |

For the paper, A8 should reduce brake-throttle false positives on adaptive fixtures while maintaining or improving physical validity. Deep Dynamics and FTHD should be used in related work rather than necessarily reimplemented, unless there is time and data for a fair PINN baseline ([Deep Dynamics](https://arxiv.org/abs/2312.04374), [FTHD](https://arxiv.org/abs/2409.19647)).

## Dataset plan

### Public racing telemetry

OpenF1 and FastF1 provide public Formula 1 telemetry such as speed, throttle, brake, RPM, gear, and position, but these datasets are able-bodied only and may lack steering angle depending on source and channel availability ([OpenF1 API](https://openf1.org), [FastF1 GitHub](https://github.com/theOehrly/Fast-F1)). They are useful for testing TTM forecasting and conventional constraints, but they do not validate adaptive hand-control behavior.

### Synthetic adaptive telemetry

The adaptive-driver validation should use synthetic or semi-synthetic fixtures generated from the kinematic bicycle model plus adaptive brake-throttle overlap rules. This must be disclosed clearly:

> No real Team BRIT or adaptive-driver telemetry is used. Adaptive validation uses COA-constrained synthetic fixtures based on published hand-control mechanisms.

This disclosure is important because MME and Team BRIT prove the mechanism, not the availability of public telemetry ([MME Motorsport hand controls](https://www.mme-motorsport.com/en/products/hand-controls), [Professional Motorsport World feature](https://www.pmw-magazine.com/features/behind-mme-team-brit-hand-control-tech.html)).

### Minimum fixture set

The implementation should include four fixtures:

| Fixture | Description | Expected behavior |
|---|---|---|
| F1 | Able-bodied valid lap segment | Projection changes little |
| F2 | Able-bodied impossible overlap | Projection penalizes or removes overlap |
| F3 | Adaptive valid overlap | Projection preserves overlap when \(c_{\text{overlap}}=1\) |
| F4 | Kinetic hallucination | Projection corrects impossible acceleration, yaw, or friction state |

These fixtures are enough for the hackathon demo. For a NeurIPS workshop paper, add public F1 telemetry experiments and report all physical-validity metrics across multiple seeds or sessions.

## Implementation checklist

### Required for hackathon demo

- Load TTM r2 and forecast a telemetry window.
- Implement QP projection with box constraints, finite-difference speed-acceleration coherence, polyhedral friction approximation, and adaptive brake-throttle penalty toggle.
- Log raw constraint violations and post-projection violations.
- Show before/after plots for raw TTM versus PhysicsTTM.
- Include one adaptive overlap fixture where the able-bodied projection fails and COA-derived projection succeeds.

### Required for NeurIPS workshop paper

- Define all channels, units, normalization, and vehicle constants.
- Report TTM mode: zero-shot, frozen-backbone plus head, or fully fine-tuned.
- Report CVR, PD, FR, PPAD, BT-FP, and BT-FN.
- Run ablations A1 through A8, and A9 if feasible.
- Include sensitivity analysis over \(\mu\), \(L\), \(\epsilon_k\), and projection weights.
- State that the adaptive flag is derived from approved hardware metadata, not an explicit FIA COA field.
- Include a limitations section explaining synthetic adaptive data and public telemetry gaps.

## Safe claims and unsafe claims

### Safe claims

- PhysicsTTM guarantees hard satisfaction of convex constraints to solver tolerance.
- The projection is model-agnostic and can wrap a frozen TTM forecast without modifying the backbone.
- The adaptive brake-throttle exception is derived from approved hand-control hardware metadata.
- A QP-compatible version can use linearized yaw consistency and a polyhedral friction approximation.
- An SOCP version can encode the friction ellipse more directly.

### Unsafe claims

- Do not claim global feasibility for exact nonlinear tire dynamics.
- Do not claim that the FIA COA has an explicit simultaneity flag.
- Do not claim that TTM itself learns vehicle physics.
- Do not claim that soft penalties guarantee constraint satisfaction.
- Do not claim real adaptive-driver telemetry validation unless that data is actually obtained.

## Methods-section draft

### Physics-constrained projection layer

Let \(\hat{Y}=f_\theta(X)\) denote the raw \(H\)-step telemetry forecast from a frozen Granite TTM backbone. PhysicsTTM computes \(Y^*=\Pi_{\mathcal{C}(c)}(\hat{Y})\), the nearest forecast satisfying a driver- and vehicle-conditioned feasible set. The projection solves a weighted minimum-distance convex program:

\[
Y^*
=
\underset{Y}{\mathrm{argmin}}
\;
\frac{1}{2}
\sum_{h=1}^{H}
(y_h-\hat{y}_h)^\top W_h(y_h-\hat{y}_h)
+
\lambda_{\text{yaw}}\Phi_{\text{yaw}}(Y)
+
\lambda_{\text{kin}}\Phi_{\text{kin}}(Y)
+
\lambda_{\text{BT}}\Phi_{\text{BT}}(Y;c)
\]

subject to hard box constraints on speed, steering, acceleration, throttle, and brake. A QP implementation uses a conservative polyhedral approximation to the friction ellipse, while an SOCP implementation enforces \(\|(a_x/a_{x,\max},a_y/a_{y,\max})\|_2 \le 1\). The optimization-layer formulation follows OptNet and cvxpylayers, which differentiate through convex programs via KKT implicit differentiation ([OptNet](https://arxiv.org/abs/1703.00443), [cvxpylayers](https://arxiv.org/abs/1910.12430)).

### Vehicle physics

The feasible set encodes four classes of physics constraints. First, hard bounds enforce \(v_x \ge 0\), bounded steering, bounded acceleration, and normalized actuator ranges. Second, kinematic consistency penalizes deviations from the bicycle-model relation \(\omega \approx v_x\tan\delta/L\), using a linearized form for QP compatibility. Third, the friction budget limits combined longitudinal and lateral acceleration through either an SOCP friction ellipse or a conservative polyhedral approximation. Fourth, speed-acceleration coherence penalizes deviations from \(v_{x,h+1}=v_{x,h}+a_{x,h}\Delta t\). The kinematic bicycle and dynamic bicycle foundations are standard in vehicle dynamics, while recent racing work such as Deep Dynamics and FTHD demonstrates the importance of physics-aware modeling in high-speed autonomy ([Rajamani, Springer](https://link.springer.com/book/10.1007/978-1-4614-1433-9), [Deep Dynamics](https://arxiv.org/abs/2312.04374), [FTHD](https://arxiv.org/abs/2409.19647)).

### Adaptive-control conditioning

For conventional control systems, simultaneous high throttle and high brake is penalized through \(\Phi_{\text{BT}}^{\text{AB}}=\sum_h \tau_h b_h\). For approved adaptive hand-control systems, APEX derives \(c_{\text{overlap}}=1\) from hardware specifications and removes or relaxes the exclusivity penalty:

\[
\Phi_{\text{BT}}(Y;c_{\text{overlap}})
=
(1-c_{\text{overlap}})
\sum_h \tau_h b_h.
\]

This reflects published MME and Team BRIT mechanisms that permit full throttle with light braking mid-corner, while avoiding the incorrect claim that the FIA COA contains an explicit simultaneity field ([MME Motorsport hand controls](https://www.mme-motorsport.com/en/products/hand-controls), [Professional Motorsport World feature](https://www.pmw-magazine.com/features/behind-mme-team-brit-hand-control-tech.html), [FIA Disability and Accessibility page](https://www.fia.com/disability-accessibility)).

### Evaluation

The evaluation reports standard forecast error and physical validity. Standard metrics include MAE and MSE. Physical metrics include constraint violation rate, projection distance, feasibility rate, post-projection accuracy degradation, and adaptive brake-throttle false positive and false negative rates. The central hypothesis is that PhysicsTTM reduces constraint violations and adaptive brake-throttle false positives substantively while producing only small post-projection accuracy degradation.

## Bottom line

APEX has enough physics material for a hackathon demo now. For a NeurIPS-style workshop paper, the missing proof is empirical rather than conceptual: implement the projection, run the fixtures and public telemetry ablations, report physical validity metrics, and state the adaptive-data limitation honestly. The strongest paper framing is:

> PhysicsTTM treats time-series foundation model outputs as statistically plausible but physically unconstrained forecasts, then projects them into a vehicle- and driver-conditioned feasible set. This makes adaptive-control exceptions explicit at the tensor level while preserving the frozen TSFM backbone.
