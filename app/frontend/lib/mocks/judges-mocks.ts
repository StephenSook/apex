/**
 * Demonstration fixtures for the /judges visualisation route. Each
 * constant in this file is an INTENTIONAL fixture demonstrating a
 * specific verdict-shape OR detector-state variant the corresponding
 * panel can render. They are NOT placeholders concealing a missing
 * backend wire.
 *
 * Wave-49 rename: previously named `MOCK_*`, renamed to `DEMO_*` to
 * convey intent. The legacy `MOCK_*` aliases are re-exported for
 * backwards-compatibility with any consumers that haven't migrated.
 *
 * Why these stay as fixtures (rather than backend fetches):
 *   - TriAgentVerdictPanel flag-vs-reject: the /judges page renders
 *     BOTH variants side-by-side so judges see the discriminated-
 *     union narrowing on flag (flagged_concerns extra) vs reject
 *     (blocked_recommendations extra). A single live verdict cannot
 *     show both simultaneously; this is a SHAPE demonstration.
 *   - PhysicsConfidence in-distribution vs OOD: same pattern. Pairs
 *     the "approve" + "review" verdicts on the same panel so the
 *     downgrade-arrow rendering is visible.
 *   - ALoRA + EAGLE-3 + GEPA + TSPulse states: shouldn't-be-possible
 *     moves per D-019 + D-016. The panels are CAPABILITY demonstrations
 *     of what the corresponding paper claim looks like in UI; backend
 *     for each is documented but not deployed on the HF Space (D-027
 *     + D-031 staged ladder + G4 FAIL pivot frame the deferrals).
 *
 * Live data path (when available):
 *   - TriAgentCriticPanel: POST /api/critics/verdict (wave-49; live).
 *   - PhysicsConfidenceRing: future Mahalanobis detector endpoint.
 *   - TSPulseAnomalyPanel: GET /api/tspulse/anomaly (wave-49 live;
 *     panel fetches automatically when no prop is passed).
 *
 * Anonymized-pre-consent: no real driver names; the Sarah Reynolds
 * persona referenced in the reasoning traces is fictional by design
 * per docs/sarah-reynolds-persona.md + consent-log.md §1.
 */

import type { ALoRAStatus } from "../../components/ALoRAStatusBadge";
import type { EAGLE3State } from "../../components/EAGLE3LatencyBadge";
import type { GEPAOptimization } from "../../components/GEPAEvolutionPanel";
import type { TSPulseAnomalyState } from "../../components/TSPulseAnomalyPanel";
import type {
  COADiffProjectionTraceEntry,
  NextSessionForecast,
  PhysicsConfidence,
  TriAgentVerdictPanel,
} from "../../../shared/types";

export const DEMO_TRI_AGENT_VERDICT: TriAgentVerdictPanel = [
  {
    critic: "physics",
    verdict: "approve",
    reasoning_trace: [
      "Friction-ellipse residual within tolerance on Tier 7 Pacejka linearisation.",
      "Forward-Euler kinematic step (Tier 8) consistent across 30-step horizon.",
      "Two-mass thermal model (Tier 5) T_surface evolves within ambient + warmup bounds.",
    ],
    critic_run_id: "demo-physics-001",
  },
  {
    critic: "pedagogy",
    verdict: "flag",
    reasoning_trace: [
      "Coaching narrative reads correct but assumes prior trail-braking technique knowledge.",
      "Adaptive-driver context not centred in the recommendation framing.",
    ],
    flagged_concerns: [
      "Add one-sentence trail-braking definition for first-time adaptive racers.",
    ],
    critic_run_id: "demo-pedagogy-001",
  },
  {
    critic: "guardian_safety",
    verdict: "approve",
    reasoning_trace: [
      "FIA Appendix L compliance preserved across all COA-derived constraints.",
      "Physics-projection envelope within Tier-0 + Tier-1 inviolable bounds.",
    ],
    critic_run_id: "demo-guardian-safety-001",
  },
];

export const DEMO_PHYSICS_CONFIDENCE: PhysicsConfidence = {
  status: "in_distribution",
  mahalanobis_distance: 1.84,
  threshold_p95: 2.5,
};

/**
 * Reject-verdict shape demonstration. Pairs with DEMO_TRI_AGENT_VERDICT
 * so judges see flag + reject side by side; reject carries
 * blocked_recommendations rather than the flag/approve extras.
 */
export const DEMO_TRI_AGENT_VERDICT_REJECT: TriAgentVerdictPanel = [
  {
    critic: "physics",
    verdict: "approve",
    reasoning_trace: [
      "SCP outer-loop converged in 2 iterates with Powell ratio rho = 0.74 within trust-region tolerance.",
      "Tier 7 Pacejka linearisation residual within 0.04 friction-coefficient units; below the 0.10 flag threshold.",
    ],
    critic_run_id: "demo-physics-reject-002",
  },
  {
    critic: "pedagogy",
    verdict: "approve",
    reasoning_trace: [
      "Recommendation is coachable; references trail-braking technique with the adaptive-driver context preamble.",
    ],
    critic_run_id: "demo-pedagogy-reject-002",
  },
  {
    critic: "guardian_safety",
    verdict: "reject",
    reasoning_trace: [
      "Recommendation conflicts with the driver's FIA Certificate of Adaptations hardware-spec section.",
      "COA-permitted brake-throttle simultaneity gate is open in the projection but the recommendation requests a hardware change that would close it.",
    ],
    blocked_recommendations: [
      "Reduce brake-pedal travel by 4 mm (would invalidate the existing hand-control mapping per the COA hardware-spec section).",
    ],
    critic_run_id: "demo-guardian-safety-reject-002",
  },
];

/**
 * Out-of-distribution physics-confidence demonstration. Pairs with
 * DEMO_PHYSICS_CONFIDENCE so judges see the downgrade arrow
 * rendering (approve -> review) when Mahalanobis distance exceeds
 * the p95 threshold.
 */
export const DEMO_PHYSICS_CONFIDENCE_OOD: PhysicsConfidence = {
  status: "out_of_distribution",
  mahalanobis_distance: 3.92,
  threshold_p95: 2.5,
  downgrade_from: "approve",
  downgrade_to: "review",
};

/**
 * aLoRA active adapter demonstration (D-019 item 2). Sub-200 ms
 * hot-swap round-trip per pre-mortem row 67. Cites NeurIPS-2024-area
 * aLoRA work per docs/decision-log.md D-019 item 2.
 */
export const DEMO_ALORA_STATUS_ACTIVE: ALoRAStatus = {
  status: "active",
  adapter_name: "race-engineer-intrinsic-v1",
  rank: 8,
  alpha: 16,
  lambda: 0.5,
  swap_ms: 142,
};

/**
 * GEPA optimization demonstration (D-019 item 3). 5 iterations
 * evolving the race-engineer narration prompt against APEX-Bench
 * faithfulness p95 (0.74 baseline -> 0.91 final). Cites the 2025
 * DSPy GEPA work per docs/decision-log.md D-019 item 3.
 */
export const DEMO_GEPA_OPTIMIZATION: GEPAOptimization = {
  run_id: "gepa-run-2026-05-23-001",
  base_prompt_id: "race-engineer-base-v1",
  base_faithfulness_p95: 0.74,
  iterations: [
    { iteration: 1, candidates_evaluated: 8, faithfulness_p95: 0.78, selected_prompt_id: "gepa-001" },
    { iteration: 2, candidates_evaluated: 8, faithfulness_p95: 0.83, selected_prompt_id: "gepa-014" },
    { iteration: 3, candidates_evaluated: 8, faithfulness_p95: 0.87, selected_prompt_id: "gepa-021" },
    { iteration: 4, candidates_evaluated: 4, faithfulness_p95: 0.89, selected_prompt_id: "gepa-027" },
    { iteration: 5, candidates_evaluated: 4, faithfulness_p95: 0.91, selected_prompt_id: "gepa-031" },
  ],
  final_prompt_id: "gepa-031",
  final_faithfulness_p95: 0.91,
};

/**
 * EAGLE-3 active speculative-decode demonstration (D-019 item 4).
 * 3.2x speedup + 78% accepted-token-rate + draft rank 4 per the
 * arXiv:2503.01840 verified envelope (2.5-3.7x typical band).
 */
export const DEMO_EAGLE3_ACTIVE: EAGLE3State = {
  status: "active",
  speedup_x: 3.2,
  accepted_token_rate: 0.78,
  draft_rank: 4,
  draft_model: "granite-instruct-4.1-draft-rank-4",
};

/**
 * TSPulse anomaly active demonstration (D-016 Layer 2). 18.7 ms
 * per-window detection (under the pre-mortem row 71 30 ms budget)
 * with mid-band + high-band anomaly score 2.94 breaching the p95
 * threshold 2.10. Demonstrates the discriminated-union anomaly
 * variant + the polyphase per-band attribution surface.
 *
 * Wave-49: TSPulseAnomalyPanel now fetches /api/tspulse/anomaly
 * live when no prop is passed. This constant remains as the
 * fallback shape demonstration when the live fetch fails OR when
 * a test explicitly passes it as a prop override.
 */
export const DEMO_TSPULSE_ACTIVE: TSPulseAnomalyState = {
  status: "anomaly",
  window_index: 1428,
  score: 2.94,
  threshold_p95: 2.1,
  affected_bands: ["mid", "high"],
  detection_ms: 18.7,
};

// ---- Backwards-compat aliases ----------------------------------
// Pre-wave-49 imports of `MOCK_*` continue to resolve. Remove these
// aliases once all consumers migrate to the `DEMO_*` names. The
// MOCK_ prefix predates the wave-49 naming convention but the
// underlying values are unchanged.
/**
 * Real projection convergence residuals from the COA-permitted verdict
 * (mirrors `CANNED_PERMITTED.projection_trace` in
 * app/frontend/app/api/judges/coa-diff/route.ts). These are genuine
 * CvxpyLayer QP convergence values, not invented confidence numbers, so
 * the ConfidenceDecompositionPanel can decompose physics feasibility
 * honestly.
 */
export const DEMO_PROJECTION_TRACE: ReadonlyArray<COADiffProjectionTraceEntry> = [
  { stage: "friction_ellipse", residual_norm: 0.0008, status: "converged" },
  { stage: "forward_euler", residual_norm: 0.0003, status: "converged" },
  { stage: "bicycle_model", residual_norm: 0.0011, status: "converged" },
  { stage: "coa_simultaneity", residual_norm: 0.0, status: "converged" },
];

/**
 * Demo next-session forecast envelope (mirrors the generic illustrative
 * report built in AnalyzeFlow.buildMockReport). Real-shaped 90 percent
 * envelope so the ConfidenceDecompositionPanel can derive forecast
 * certainty from genuine band widths.
 */
export const DEMO_FORECAST: NextSessionForecast = [
  { sector_idx: 0, mean: 47.42, low: 47.21, high: 47.66 },
  { sector_idx: 1, mean: 31.18, low: 31.02, high: 31.39 },
  { sector_idx: 2, mean: 28.91, low: 28.72, high: 29.18 },
  { sector_idx: 3, mean: 33.04, low: 32.81, high: 33.34 },
  { sector_idx: 4, mean: 26.77, low: 26.55, high: 27.02 },
];

export const MOCK_TRI_AGENT_VERDICT = DEMO_TRI_AGENT_VERDICT;
export const MOCK_TRI_AGENT_VERDICT_REJECT = DEMO_TRI_AGENT_VERDICT_REJECT;
export const MOCK_PHYSICS_CONFIDENCE = DEMO_PHYSICS_CONFIDENCE;
export const MOCK_PHYSICS_CONFIDENCE_OOD = DEMO_PHYSICS_CONFIDENCE_OOD;
export const MOCK_ALORA_STATUS_ACTIVE = DEMO_ALORA_STATUS_ACTIVE;
export const MOCK_GEPA_OPTIMIZATION = DEMO_GEPA_OPTIMIZATION;
export const MOCK_EAGLE3_ACTIVE = DEMO_EAGLE3_ACTIVE;
export const MOCK_TSPULSE_ACTIVE = DEMO_TSPULSE_ACTIVE;
