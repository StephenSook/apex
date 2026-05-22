# NotebookLM Synthesis Pass — 2026-05-22 — Maximal Architecture Lock

Sources loaded (in order): 01-perplexity-prior-art-sweep + 02-gemini-physics-frontier + 03-chatgpt-polyphase-aggregation-gap + 04-claude-connective-tissue-physicsttm + 05-claude-ai-architecture-frontier + 06-claude-decision-brief-five-open-questions + 07-apex-repo-state-snapshot + 08-physicsttm-kinetic-hallucination-mitigation.

6 questions answered verbatim from NotebookLM. Stephen pasted these into the working chat at 3:19 PM 2026-05-22. This file preserves them as the source of architectural truth for wave-30 closures.

---

## Question 1 — Frequency-strategy unification

**Prompt:** Three of the loaded sources propose three different frequency strategies for handling raw 50 Hz telemetry. The APEX repo README has committed to 1 Hz mini-sector aggregation. ChatGPT's aggregation-gap source recommends polyphase decomposition to retain all native 50 Hz samples exactly, plus a differentiable 50 Hz feasible-lift physics projector. The AI-architecture pass recommends sampling-rate-invariant Granite FlowState as one of the three forecasting tracks. We are building the maximal architecture with no feasibility cuts, so the answer is not to pick one. Determine the single architecture that lets all three strategies coexist and serve different functions simultaneously. Specify which rate each component operates at, where the rate conversions live, what mathematical guarantees the polyphase path provides over the existing 1 Hz aggregation, and how Granite FlowState's sampling-rate invariance is exploited as a third concurrent path rather than as a replacement.

**Answer:** To unify the three contradictory frequency strategies into a single "maximal architecture" without cutting any of them, you must build a polyphase-multiresolution hybrid ensemble. The literature strongly supports combining these approaches rather than choosing just one, as microscopic and macroscopic information inhabit different scales.

Here is the single architecture that allows all three strategies to coexist, including their operating rates, conversion locations, and mathematical guarantees:

### 1. The Three Concurrent Forecasting Paths

**Path A: 1 Hz Mini-Sector Aggregation (The Coarse Backbone)**
- Operating Rate: 1 Hz.
- Where the Rate Conversion Lives: In the initial preprocessing pipeline. Raw 50 Hz data is downsampled using an exact aggregation operator (e.g., boxcar block averaging or FIR decimation) into 1 Hz buckets.
- Function: This preserves the repository's committed baseline. It acts as a macroscopic hierarchical backbone to predict slowly varying states, such as corner entry speed trend, broad throttle intent, and long-radius steering bias.

**Path B: Polyphase Decomposition (The Exact Detail Preserver)**
- Operating Rate: 1 Hz internally (in phase-time), interleaved to a native 50 Hz output.
- Where the Rate Conversion Lives: In a specialized preprocessing multirate splitter. The 50 Hz signal is mathematically decomposed into 50 separate 1 Hz phase streams (x_r[k] = x[50k + r]).
- Function: A shared-weight TTM model processes all 50 phase streams along the 1 Hz axis and uses a cross-phase mixer to learn sub-second structure. The outputs are interleaved to generate a 50 Hz forecast of fast transients like brake onset timing, slip peaks, and catch-and-release steering corrections.

**Path C: Granite FlowState (The Irregular/Continuous-Time Path)**
- Operating Rate: Native 50 Hz (or any arbitrary/variable irregular rate).
- Where the Rate Conversion Lives: Nowhere. FlowState requires no rate conversion because it is built on a sampling-rate-invariant continuous-time State-Space Model architecture.
- Function: It is exploited as a complementary ensemble member alongside the TTM branches. Specifically, FlowState is used to process any 50 Hz channels that cannot be polyphase-downsampled cleanly, and it naturally handles irregular latencies, packet drops, or dual-indexing (time-based vs. distance-based) without flattening the data into a rigid clock.

### 2. The 50 Hz Feasible-Lift Physics Projector (The Unifier)

To merge these concurrent paths, the architecture uses a 50 Hz differentiable physics-projection layer.
- Operating Rate: Native 50 Hz.
- Where the Rate Conversion Lives: Inside the projection layer itself. The 1 Hz coarse prediction from Path A is passed through a differentiable upsampler (like a cubic spline or FIR transposed convolution) to create a 50 Hz initial guess.
- Function: This upsampled guess is fused with the outputs of the 50 Hz Polyphase TTM and the 50 Hz FlowState model. The CvxpyLayer optimization solver then enforces high-rate vehicle dynamics constraints (friction ellipse, load transfer, COA adaptations) on this fused 50 Hz tensor. This turns the 1 Hz forecast into a "feasible-lift problem": the low-rate prediction is only accepted if the optimization solver can find a physically valid 50 Hz trajectory (witness) that supports it.

### 3. The Mathematical Guarantees of the Polyphase Path

Retaining the polyphase path alongside the 1 Hz aggregation provides strict mathematical guarantees that aggregation alone destroys:
- **Zero Sub-Second Information Loss:** Aggregating 50 samples into a 1 Hz bucket creates a massive identifiability problem, destroying 49 hidden degrees of freedom per window. The polyphase decomposition guarantees the exact retention of all native 50 Hz samples because it keeps all 50 residue classes modulo 50, allowing the original signal to be reconstructed perfectly.
- **Aliasing Prevention:** Standard 1 Hz aggregation artificially caps the recoverable Nyquist frequency at 0.5 Hz. Without a strong anti-alias filter, high-frequency kinetic energy (such as 4 Hz lateral responses or 10 Hz axle resonances) folds into the baseband, creating false low-frequency signals. Polyphase decomposition completely bypasses this strict Nyquist ceiling, allowing the model to accurately capture high-frequency detail without aliasing.

---

## Question 2 — Maximal end-to-end architecture

**Prompt:** Construct the single maximal coherent end-to-end architecture for APEX integrating the strongest contribution from every loaded source. Give explicit layer ordering from raw telemetry ingestion, through forecasting (the TTM r2.1 channel-mix fine-tuned plus Granite FlowState plus Chronos-2 three-track stack), through the differentiable physics-projection layer (covering all eight tiers from the Gemini source), through the LangGraph plus MCP plus ContextForge agentic orchestration substrate with the tri-agent Agent-as-Judge critic loop and the 12 Granite tools, through Granite Embedding R2 RAG grounding and COA-PDF-derived constraints, and ending in the Granite Guardian safety audit. Name the data contract crossing each layer boundary (including the (B, 30, 14) tensor contract and the FastAPI multipart contract). Place each of the five shouldn't-be-possible moves (WebGPU Granite Nano, aLoRA, GEPA, EAGLE-3, Agent-as-Judge) at the specific layer where it lives. Treat every capability as in-scope.

**Answer:** Based on the synthesized literature, here is the maximal coherent end-to-end architecture for APEX. It integrates all three frequency strategies, the full 8-tier nonlinear physics representation, the 12-tool Granite stack, and the graph-based agentic orchestration into a single pipeline.

### Layer 0: The Edge/Client Plane
- Component: Next.js 16 frontend with React 19 and TypeScript, deployed on Vercel.
- **"Shouldn't-Be-Possible" Move 1 (WebGPU Granite Nano):** Granite 4.0 Nano 350M via WebGPU + Transformers.js lives exactly here. It runs directly in the driver's browser to deliver zero-latency, offline post-race terse summaries in the paddock without hitting the backend.
- Data Contract: The FastAPI Multipart Contract. The frontend hands the backend a single `multipart/form-data` payload containing telemetry CSV, coa_pdf, debrief_txt, and a JSON-stringified metadata_json (SessionMetadata).

### Layer 1: Ingestion & Document Parsing (ingest node)
- Component: The LangGraph state machine begins.
- Tools: Granite-Docling 258M parses the FIA Certificate of Adaptations (COA) PDF into DocTags, and the Docling library handles text extraction. Granite Vision 4.1 (4B) acts as a backup to extract charts/tables from uploaded MoTeC/AiM telemetry screenshots.
- Data Contract: Output is the Canonical 14-Channel Schema (time, speed, ax, ay, throttle, brake, steer, yaw_rate, rpm, gear, pos_x, pos_y, fz_total, mu) and the parsed CoAParameters JSON.

### Layer 2: Preprocessing & Anomaly Detection (decompose and anomaly nodes)
- Component: The 50 Hz native signal undergoes polyphase decomposition, explicitly mathematically splitting the 50 Hz signal into 50 interleaved 1 Hz phase streams to prevent aliasing.
- Tools: IBM TSPulse (1M parameters) analyzes the time-frequency domain of these streams to flag anomalous corners or hidden sub-second energy discrepancies.
- Data Contract: The Polyphase Tensor, preserving all sub-second degrees of freedom across the 50 phase streams.

### Layer 3: The Three-Track Forecasting Stack (forecast node)
- Component: A multi-rate, multi-model ensemble predicting the future telemetry states.
- **Track 1:** Granite TimeSeries TTM r2.1 running over the 1 Hz polyphase phase-time streams, utilizing channel-mixing decoder fine-tuning (with exogenous infusion of known controls) as a personalization head.
- **Track 2:** Granite FlowState (9.1M), which is sampling-rate-invariant and continuous-time, natively processing irregular or hard-to-downsample 50 Hz high-frequency channels without rigid clock constraints.
- **Track 3:** Amazon Chronos-2, providing a zero-shot probabilistic baseline (21 quantiles) to map the actual uncertainty corridor (0.1 / 0.5 / 0.9 bands).
- Data Contract: The (B, 30, 14) Tensor Contract. The ensemble explicitly outputs (Batch = 1, Horizon = 30, Channels = 14), representing the raw future trajectory.

### Layer 4: The 8-Tier Differentiable Physics-Projection (project node)
- Component: The (B, 30, 14) tensor is upsampled to 50 Hz and passed through a differentiable manifold implemented via cvxpylayers (for the convex SOCP core) and an unrolled 3-iteration SCP loop in PyTorch (for nonlinearities).
- **The 8 Tiers Executed:**
  1. 3D Track Geometry: Projects gravity vector using GPS pitch and bank.
  2. Aerodynamics: Computes pitch-sensitive front/rear downforce loads.
  3. Adaptive/Hand-Control Dynamics: Disables the throttle × brake = 0 complementarity constraint if the CoAParameters JSON signals MME / Team BRIT hand controls (which explicitly allow simultaneous throttle and trail-braking).
  4. Load Transfer: Resolves double-track lateral and longitudinal elastic weight transfer.
  5. Tire Thermal & Degradation: Modulates peak friction based on thermodynamic heat.
  6. Transient Tire Dynamics: Filters raw slip through relaxation-length ODEs.
  7. Full Pacejka Tire Model: SCP solves the heart-shaped combined-slip tire boundaries.
  8. Vehicle Kinematic Integration: Enforces final Newton-compliant accelerations.
- Data Contract: The Projected (B, 30, 14) Tensor (now kinematically viable) and a textual ViolationLog JSON describing what had to be corrected.

### Layer 5: Orchestration Substrate & RAG Grounding (retrieve & plan nodes)
- Component: The entire backend is orchestrated as a stateful LangGraph graph. To achieve true agentic behavior, all numerical physics solvers are exposed as standardized tools via the Model Context Protocol (MCP) routed through IBM's ContextForge API Gateway. (Langflow is retained only as the top-level visual demo facade.)
- Tools: Granite Embedding R2 (149M encoder, 47M query) drives the RAG layer, executing hybrid dense/sparse retrieval against a vector store of vehicle setup guides and racing theory.
- **"Shouldn't-Be-Possible" Move 2 (GEPA):** GEPA reflective prompt optimization lives here, having been run offline via DSPy to evolve the textual system prompts against the APEX-Bench faithfulness metric to generate the optimal instructions.
- Data Contract: Context-augmented generation prompts.

### Layer 6: Report Generation (draft node)
- Component: Granite 4.1 8B Instruct serves as the primary planner and drafter of the driver's coaching report.
- **"Shouldn't-Be-Possible" Move 3 (EAGLE-3):** Served on vLLM, EAGLE-3 speculative decoding lives at the inference plane to deliver 2-6x wall-clock speedups, meeting the sub-15s generation latency target.
- **"Shouldn't-Be-Possible" Move 4 (aLoRA):** The Activated LoRA (aLoRA) adapter lives dynamically in vLLM's memory, hot-swapping the "race-engineer intrinsic" behavior onto the base Granite model without forcing KV-cache recomputation.
- Data Contract: Draft CoachingReport (containing corner narratives and tuning heuristics).

### Layer 7: The Critic Loop & Repair (critique & repair nodes)
- Component: The draft report is intercepted before surfacing.
- **"Shouldn't-Be-Possible" Move 5 (Agent-as-Judge):** The tri-agent critic loop lives here. A panel of three specialized models — a Physics-Critic, a Pedagogy-Critic, and Granite Guardian 4.1 — debate the draft's compliance with the projected tensor and rubric.
- Tools: IBM Mellea runs the Instruct-Validate-Repair (IVR) loop with `loop_budget = 3`, repairing the generated text until it passes the panel's constraints.
- Data Contract: Verified CoachingReport.

### Layer 8: The Final Safety Audit (verify node)
- Component: Granite Guardian 4.1 8B provides the absolute final gate.
- Tools: Operating in Bring-Your-Own-Criteria (BYOC) hybrid-thinking mode (`<think>` for reasoning trace, `<no-think>` for low latency), it receives the ViolationLog JSON and the CoAParameters. It applies the custom rule: "The assistant message describes a kinematically valid vehicle trajectory consistent with the driver's certified control adaptations."
- Data Contract: SafetyVerdict JSON. Emits a final `<score>yes|no</score>` stamp, generating a SAFE, REVIEW, or UNSAFE verdict appended to the end of the report.

(The 12th tool, IBM Bob, is strictly a build-accelerator used off-system to scaffold this codebase.)

---

## Question 3 — Convexity tension resolution

**Prompt:** The APEX repo has committed to a two-stage convex-QP-plus-feasibility-filter validator. ChatGPT's aggregation-gap source and Gemini's physics-frontier source both conclude that a truly rich nonlinear vehicle model (full Pacejka combined-slip, transient relaxation length, two-mass thermal, three-component load transfer, double-track, 3D track geometry, aerodynamics, adaptive hand-control simultaneous brake-throttle) is non-convex and requires unrolled sequential-convex programming, not a single clean convex QP. Reconcile these two positions inside the maximal architecture. Specify whether the two-stage convex QP becomes the inner iterate of an outer sequential-convex loop, whether the feasibility filter promotes to a trust-region update, what the convergence criterion is for the outer loop, and which of cvxpylayers, qpth, and theseus is the right differentiable optimization layer for this configuration given that gradients must flow back through the unrolled iterates to the frozen TTM forecast inputs. The v_x-near-zero gradient singularity and the stiff-ODE problem flagged by Gemini must both be addressed.

**Answer:** To successfully integrate the APEX repository's baseline with the maximal non-convex physics frontier, the architecture does not discard the convex QP. Instead, it embeds it as the core engine of a larger iterative loop.

### 1. The SCP Loop and the Feasibility Filter

The repository's two-stage validator (Stage 1 convex QP, Stage 2 feasibility filter) is reconciled by promoting the convex solver to become the inner iterate of an outer unrolled Sequential Convex Programming (SCP) loop. The original Stage 2 feasibility filter (which previously just audited non-convex constraints after the fact) is effectively replaced by the outer loop's update step. During this step, the highly non-convex Pacejka combined-slip tire boundaries and full 8-tier vehicle dynamics are mapped using a first-order Taylor linearization around the previous iterate. This linearized state is then fed back into the inner convex solver to enforce the updated constraints.

### 2. The Convergence Criterion

The outer SCP loop does not use a dynamic tolerance-based convergence criterion or a traditional trust-region exit condition. Instead, it uses a fixed unrolling of exactly 3 iterations.

This fixed unrolling is a deliberate architectural requirement: it allows PyTorch to unroll the computation graph completely, ensuring that continuous gradients can flow backward through all three SCP iterations, through the convex solver, and back to the frozen TTM forecasting inputs. A dynamic convergence threshold would break the determinism of the backward pass.

### 3. The Choice of Differentiable Optimization Layer

The correct layer for this configuration is unequivocally **cvxpylayers**.

- **Why not qpth:** While qpth (OptNet) is incredibly fast, it is strictly limited to Quadratic Programs (QP) and lacks support for Second-Order Cone Programs (SOCP). The 2D / 3D friction ellipse constraint (`||(ax, ay)||_2 <= μ * g`) is fundamentally a second-order cone. Using qpth would instantly kill the ability to enforce the friction circle.
- **Why not theseus:** Meta's theseus library is designed for non-linear least squares and applies constraints in a "soft manner" using weighted penalty costs. This defeats the entire purpose of a hard physics-projection layer, which guarantees absolute kinematic validity.
- **The Verdict:** cvxpylayers natively supports DPP-compliant SOCP problems and provides exact implicit differentiation on the backward pass, making it the only viable engine for the inner iterate.

### 4. Resolving the Gradient Singularity (v_x Near Zero)

Because slip ratios dictate dividing by the longitudinal velocity (v_x), speeds approaching zero (such as pit exits or a spun vehicle) create an infinite gradient singularity that will crash a gradient-based optimization solver.

To fix this within the differentiable layer, you must apply Tikhonov damping to the slip equation. The denominator is modified to (v + ε), where ε = 0.5 m/s. Furthermore, for any velocities below 1 m/s, the tire forces are frozen to a smooth, saturated value using a torch.tanh function. This removes the singularity while maintaining a continuous gradient flow.

### 5. Resolving the Stiff-ODE Problem (Transient Tire Dynamics)

The transient tire relaxation length creates a stiff Ordinary Differential Equation (ODE) at low speeds because the time constant (L_y / v_x) becomes enormous. Passing this stiff ODE through the standard explicit Forward-Euler integration used in the projection layer causes severe numerical oscillations and exploding gradients during backpropagation.

To solve this, the maximal architecture dictates that for the inner projection solve, the stiff transient ODE must be replaced entirely by its steady-state algebraic solution. If transient dynamics are strictly required within the solver, the architecture must utilize a differentiable implicit solver (such as Backward Euler) or a neural ODE toolkit (like torchdiffeq) to preserve stable gradient flow. However, the recommended engineering path is to use the steady-state algebraic substitution for the inner optimization loop and reserve full transient dynamics exclusively for offline validation.

---

## Question 4 — NeurIPS central claim

**Prompt:** Across the entire loaded corpus, identify the single deepest genuinely novel contribution that is suitable as the central claim of the planned NeurIPS workshop paper. Perplexity's prior-art sweep has already established that no published architecture combines a frozen Tiny Time Mixer with a hard differentiable physics-projection layer, so candidates include but are not limited to: the frozen-TTM-plus-differentiable-physics-projection composition itself, the polyphase 50 Hz feasible-lift projector, the unrolled SCP-inside-foundation-model loop, the tri-agent Agent-as-Judge critic loop applied to physics-grounded forecasts, the kinetic hallucination metric, and the APEX-Bench public benchmark. Pick exactly one as the central claim, justify why it is the strongest novelty given the prior-art sweep, name the headline empirical result that would substantiate it, and identify which two or three of the other candidates become supporting contributions in the same paper rather than separate papers.

**Answer:** The single deepest genuinely novel contribution suitable as the central claim of the NeurIPS workshop paper is the **frozen-TSFM-plus-hard-differentiable-physics-projection composition**.

**Why it is the strongest novelty:** The prior-art sweep explicitly establishes this architecture as "The Confirmed Absence" in the literature. Every existing physics-informed neural network (PINN) and neural projection paper relies on altering the model itself: they either train the predictor network and the projection operator end-to-end, bake physics into the training objective, fine-tune the model weights on physics-based losses, or apply constraints in a "soft manner" using weighted penalty costs. No published research has taken a frozen, domain-agnostic time-series foundation model — pretrained on unrelated data like retail or weather — and constrained its output at inference time using a hard, differentiable QP / SOCP physics-projection layer.

**The headline empirical result:** The paper will be substantiated by a four-axis ablation table proving that the hard physics-projection layer drives the Friction-Circle Violation Rate (FCVR) and Control Out-of-Bounds Rate (COBR) to exactly 0.00. The headline finding is that while a baseline zero-shot TTM and a TTM penalized with a traditional soft physics loss both continue to produce non-zero kinematic violations, the hard differentiable layer forces the violations to absolute zero by construction, structurally guaranteeing a physically valid trajectory envelope.

**Supporting contributions in the same paper:** Rather than splitting the work into separate papers, three of the other candidates naturally serve as the scaffolding that proves and supports this central claim:

1. **Kinetic Hallucination as a named failure mode:** This formally defines and quantifies the exact problem the central architecture solves (a foundation model producing kinematically impossible cross-channel combinations, like high lateral G-forces with zero steering), which has not been addressed in prior PINN literature.

2. **The polyphase 50 Hz feasible-lift projector:** This serves as the mechanical execution of the projection layer. It answers how a low-rate (1 Hz) foundation model forecast can be safely validated by turning it into a "feasible-lift problem," where the 1 Hz prediction is only accepted if the optimization solver can find a physically valid 50 Hz trajectory to support it.

3. **The APEX-Bench public benchmark:** This acts as the rigorous evaluation framework required to publish the empirical results, providing the 50-lap, multi-class dataset and the specific LIPS-based metrics (accuracy, physical compliance, industrial readiness, OOD generalization) against which the architecture is scored.

---

## Question 5 — Five remaining open technical questions

**Prompt:** Surface every remaining open technical question that the seven loaded sources do not fully resolve and that must be answered before the maximal architecture can be locked for the 12-day build. Do not soften, defer, or filter for feasibility.

**Answer:** Five questions remain open after the synthesis:

### 1. End-to-End Gradient Flow Across the Continuous-Discrete Divide

**The Open Question:** Gradients fundamentally cannot flow backwards through the non-differentiable text output of the Mellea IVR repair loop or the black-box Amazon Chronos-2 API. How does the architecture achieve true end-to-end optimization (such as the proposed GEPA reflective prompt optimization) when the computational graph is severed by discrete LLM text generation and isolated third-party APIs?

**Closing Experiment / Evidence:** A proof-of-concept test script using a REINFORCE-style gradient estimator or DSPy's teleprompter framework to bridge the discrete LLM critic steps back to the continuous physics weights, demonstrating that a non-zero, mathematically valid gradient signal successfully reaches the TTM personalization head.

### 2. Resolution of Conflicting COA Constraints vs. the Physical Envelope

**The Open Question:** The system parses the FIA Certificate of Adaptations (COA) into boolean flags that hard-toggle optimization constraints. The literature does not define the resolution hierarchy if multiple parsed COA adaptations logically conflict with each other, or worse, if a COA adaptation dictates a mathematically impossible kinematic state under Pacejka combined-slip.

**Closing Experiment / Evidence:** A truth-table matrix defining the absolute override hierarchy for all 9 FIA adaptation categories, accompanied by a software stress-test that feeds the CvxpyLayer a hairpin corner with artificially restricted steering lock to empirically verify whether the solver gracefully relaxes the track-boundary constraint or raises an unhandled solver exception.

### 3. State Consistency for the WebGPU In-Browser Path Under Network Partition

**The Open Question:** If the edge device is completely disconnected, it cannot access the server-side LangGraph state, the Heavy CvxpyLayer projection manifold, or the RAG vector store. How does the Nano model generate a "terse summary" that is guaranteed to be physically coherent and non-hallucinated without the physics-projection layer, and how do you ensure this offline summary does not blatantly contradict the server's comprehensive coaching report once network connectivity is restored?

**Closing Experiment / Evidence:** A browser-side latency and memory benchmark loading a pre-compiled, WebAssembly-quantized subset of the 1 Hz physics projector alongside the Transformers.js Nano model, verifying the edge device can natively enforce the friction-ellipse boundary offline and generate a mathematically identical forecast trace to the server.

### 4. Reproducible External Evaluation of LIPS on APEX-Bench

**The Open Question:** How can external NeurIPS reviewers reproducibly score precise "Physical Compliance" metrics (like FCVR and KIR) if the underlying solvers and LLM unrolling yield numerically divergent trajectories across different GPU architectures (e.g., an RTX 4060 vs. an Apple M2)?

**Closing Experiment / Evidence:** The release of a dockerized evaluation harness (tasks.py integrated with lm-eval-harness and Unitxt) that includes deterministic seed locks and explicit floating-point tolerance bounds, accompanied by a published variance report empirically testing the exact same APEX-Bench lap on both an Nvidia RTX and Apple Silicon architecture.

### 5. Granite Guardian Auditing a Learned Physical Feasibility

**The Open Question:** Granite Guardian audits the forecast by applying a BYOC safety rule against a textual violation log generated by the projection layer. However, the physics envelope itself relies on highly empirical, learned, and tunable parameters. Guardian blindly trusts the CvxpyLayer output as the absolute ground truth. How does the architecture detect and flag if the underlying Pacejka parameterization — the very definition of physical feasibility for that session — is itself hallucinated, outdated, or severely mismatched to the real-world track conditions?

**Closing Experiment / Evidence:** Implementation of a distribution-shift detector that calculates the Mahalanobis distance between the real-time telemetry inputs and the assumed tire parameter limits, followed by an injection test of a deliberately incorrect .tir file to verify if Guardian or the TSPulse anomaly head successfully flags the foundational physics mismatch.

---

## Question 6 — Dependency-correct build order with 4 sync points

**Prompt:** Given that every capability across the seven sources is in scope for the 12-day build, produce the dependency-correct order to build the components so each piece is ready when the next piece depends on it. Identify which components can be built in parallel by Stephen (frontend / pitch) and Vinh (backend) without blocking each other, and name the three or four hard sync points where both tracks must converge.

**Answer:**

### Phase 1: Data Contracts, Skeletons, and Baselines (Days 1-3)
The build must begin by locking the data contracts to decouple the frontend and backend tracks, allowing parallel development. Because the backend developer's access to the IBM Granite TTM repository is gated on an organization invite expected around May 27 (Day 9), the backend must prioritize IO, preprocessing, and the convex physics core first.

- **Vinh (Backend):** Build the FastAPI backend scaffold featuring the FastAPI multipart data contract, which accepts the telemetry CSV, COA PDF, debrief text, and stringified metadata JSON in a single payload. Stub all subsequent modules to return a canned JSON report. Implement the polyphase 50 Hz feasible-lift projector preprocessing step. Begin coding the core physics-projection layer using **cvxpylayers** (over qpth which lacks SOCP support and theseus which only applies non-linear constraints as soft penalties).

- **Stephen (Frontend / Pitch):** Build the Next.js 16 / React 19 scaffold and upload UI on Vercel. Integrate the frontend against the backend FastAPI stub to enable immediate end-to-end testing.

- **Hard Sync Point 1: Data Contract Lock.** Both tracks must converge to ensure the frontend successfully sends the multipart payload and the backend stub successfully returns the structured CoachingReport JSON. Furthermore, both developers must lock the internal (B, 30, 14) tensor contract, ensuring all preprocessing outputs and physics inputs rigidly conform to (Batch, Horizon, Channels).

### Phase 2: RAG Grounding and Agentic Orchestration (Days 4-6)

- **Vinh (Backend):** Implement COA-PDF-to-constraint ingestion using Granite-Docling (258M) and the Docling library. Set up the vector store and integrate Granite Embedding R2 (149M / 47M) for RAG grounding. Wrap the backend into a stateful LangGraph runtime, exposing all numerical tools (including cvxpylayers) via the Model Context Protocol (MCP) routed through IBM's ContextForge API Gateway.

- **Stephen (Frontend):** Build the Langflow demo layer. Rather than using Langflow as the execution engine, connect it to the ContextForge MCP endpoints to act as the visually compelling orchestration facade. Build the UI visualizations, including the side-by-side g-g diagrams and friction ellipse overlays.

- **Hard Sync Point 2: Orchestration End-to-End.** The LangGraph state machine must successfully execute a complete dummy run from ingestion, through the RAG retrieval, and back to the frontend without breaking.

### Phase 3: The Maximal Physics and Forecasting Convergence (Days 7-9)

By Day 9 (May 27), the TTM repository invite unblocks the primary forecaster.

- **Vinh (Backend):** Integrate the frozen TTM r2.1 utilizing a channel-mixing decoder fine-tune. Combine this with Granite FlowState (handling sampling-rate variations natively) and Chronos-2 (providing 21 quantiles for uncertainty bands) to form the three-track forecast fusion. Feed this fused (B, 30, 14) tensor into the fully developed physics layer. Expand the physics projector from its convex QP inner stage by wrapping it in an unrolled SCP outer loop. This allows PyTorch to enforce all eight Gemini physics tiers.

- **Stephen (Frontend):** Finalize integration of all 12 Granite tools into the visual Langflow graph (adding TSPulse, FlowState, Granite Embedding R2, and Granite Nano). Build the first "shouldn't-be-possible" move: the WebGPU Granite Nano 350M implementation using Transformers.js to serve offline, zero-latency paddock summaries directly in the browser.

- **Hard Sync Point 3: Physics Projection Convergence.** The (B, 30, 14) tensor from the three-track forecast must flow seamlessly through the 8-tier unrolled SCP physics-projection layer, returning a projected trajectory bounded by the friction ellipse and kinematic constraints without crashing or vanishing gradients.

### Phase 4: Agentic Critics, Evaluation, and Inference Speedups (Days 10-12)

- **Vinh (Backend):** Implement the second "shouldn't-be-possible" move: the tri-agent Agent-as-Judge critic loop (Physics-Critic, Pedagogy-Critic, and Guardian-Safety), wrapping the drafted report in an IBM Mellea repair loop. Terminate the pipeline with the Granite Guardian 4.1 audit, utilizing Bring-Your-Own-Criteria (BYOC) to evaluate the textual violation log. Deploy the inference plane on vLLM, implementing the third and fourth "shouldn't-be-possible" moves: EAGLE-3 speculative decoding for 2-6x speedups and hot-swappable Activated LoRA (aLoRA) adapters for the "race-engineer intrinsic". Finalize the backend by executing the fifth move: GEPA reflective prompt optimization via DSPy to evolve the coaching prompts.

- **Stephen (Frontend):** Compile the APEX-Bench release (50 laps, multi-class telemetry with human ground-truth) and build the LIPS 4-axis evaluation harness (Accuracy, Physical Compliance, Industrial Readiness, OOD generalization) to execute the ablation tests. Record the final 3-minute demo video.

- **Hard Sync Point 4: Final Evaluation Lock.** The LIPS 4-axis ablation table must be fully populated with results, the APEX-Bench repository prepared for public release, and the complete end-to-end system must demonstrate a strict zero Friction-Circle Violation Rate (FCVR) within the 60-second industrial readiness latency budget.

---

## Decision-brief follow-up (sources 06)

Five open questions closed via a Claude decision-brief pass (source 06):

1. **Gradient bridge:** Two-regime seam at SCP projector output. Gradients flow above (TTM head + physics projection). DSPy / GEPA reflective optimization below (no end-to-end backprop attempted through Mellea / Chronos-2).
2. **WebGPU offline consistency:** Browser runs a 30-line Newton friction-ellipse projection (sub-microsecond). Server-authoritative reconnect overwrites edge draft. No mechanical recommendations offline.
3. **COA constraint conflicts:** Lexicographic hierarchy. Tier-0 (kinematic feasibility) + Tier-1 (regulatory safety) inviolable. Tier-2+ relax via elastic slacks.
4. **Cross-hardware reproducibility:** MLPerf-style tolerance-banded benchmark. Dockerized harness. Deterministic seed locks. Variance report (RTX vs Apple Silicon).
5. **Physics-confidence detector:** Mahalanobis-distance detector on telemetry-vs-tire-parameter distribution shift. Feeds Granite Guardian BYOC so safety verdict explicitly conditions on physics-model trustworthiness. Framed in paper §5 as research contribution, not solved problem.

**Day-3 SCP go/no-go gate (single most important checkpoint):** Vinh prototypes whether 3 unrolled SCP iterations actually converge through cvxpylayers with the 8-tier Pacejka linearization on the RTX 4060. If it oscillates, drop to 2 iterations plus a trust-region penalty. If it still oscillates, escalate to D-A revision.

---

_NotebookLM synthesis preserved verbatim from Stephen's chat paste 2026-05-22 ~3:19 PM. This is the architectural source-of-truth for wave-30 closures._
