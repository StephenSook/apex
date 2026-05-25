/**
 * Mock data for the /judges visualisation route only. Wave-38 E.2
 * extraction from app/frontend/app/judges/page.tsx per wave-37
 * silent-failure-hunter NIT N-2. These mocks render placeholder
 * tri-agent verdicts + physics-confidence states on the /judges
 * page so the discriminated-union surfaces are visible to judges
 * + cold-review agents without a live backend.
 *
 * DO NOT IMPORT FROM PRODUCTION PATHS. The canonical APEX coaching
 * pipeline emits TriAgentVerdictPanel + PhysicsConfidence values
 * from the Vinh-lane backend at app/backend/apex/critics/ +
 * app/backend/apex/physics/confidence.py respectively. The mocks
 * here are display-only for /judges.
 *
 * Anonymized-pre-consent: no real driver names; the Sarah Reynolds
 * persona referenced in the mock reasoning traces is fictional by
 * design per docs/sarah-reynolds-persona.md + consent-log.md §1.
 */

import type { ALoRAStatus } from "../../components/ALoRAStatusBadge";
import type { EAGLE3State } from "../../components/EAGLE3LatencyBadge";
import type { GEPAOptimization } from "../../components/GEPAEvolutionPanel";
import type { PhysicsConfidence, TriAgentVerdictPanel } from "../../../shared/types";

export const MOCK_TRI_AGENT_VERDICT: TriAgentVerdictPanel = [
  {
    critic: "physics",
    verdict: "approve",
    reasoning_trace: [
      "Friction-ellipse residual within tolerance on Tier 7 Pacejka linearisation.",
      "Forward-Euler kinematic step (Tier 8) consistent across 30-step horizon.",
      "Two-mass thermal model (Tier 5) T_surface evolves within ambient + warmup bounds.",
    ],
    critic_run_id: "mock-physics-001",
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
    critic_run_id: "mock-pedagogy-001",
  },
  {
    critic: "guardian_safety",
    verdict: "approve",
    reasoning_trace: [
      "FIA Appendix L compliance preserved across all COA-derived constraints.",
      "Physics-projection envelope within Tier-0 + Tier-1 inviolable bounds.",
    ],
    critic_run_id: "mock-guardian-safety-001",
  },
];

export const MOCK_PHYSICS_CONFIDENCE: PhysicsConfidence = {
  status: "in_distribution",
  mahalanobis_distance: 1.84,
  threshold_p95: 2.5,
};

/**
 * Wave-35 A.13 reject-verdict mock. Demonstrates discriminated-
 * union narrowing on Guardian-Safety reject (FIA Appendix L COA-
 * section conflict surfaces blocked_recommendations rather than
 * the flag/approve verdict extras). Pairs with MOCK_TRI_AGENT_-
 * VERDICT so judges see both panel states side-by-side.
 */
export const MOCK_TRI_AGENT_VERDICT_REJECT: TriAgentVerdictPanel = [
  {
    critic: "physics",
    verdict: "approve",
    reasoning_trace: [
      "SCP outer-loop converged in 2 iterates with Powell ratio rho = 0.74 within trust-region tolerance.",
      "Tier 7 Pacejka linearisation residual within 0.04 friction-coefficient units; below the 0.10 flag threshold.",
    ],
    critic_run_id: "mock-physics-reject-002",
  },
  {
    critic: "pedagogy",
    verdict: "approve",
    reasoning_trace: [
      "Recommendation is coachable; references trail-braking technique with the adaptive-driver context preamble.",
    ],
    critic_run_id: "mock-pedagogy-reject-002",
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
    critic_run_id: "mock-guardian-safety-reject-002",
  },
];

/**
 * Wave-35 A.14 out-of-distribution physics-confidence mock.
 * Demonstrates the downgrade arrow rendering (approve -> review)
 * when the Mahalanobis distance exceeds the p95 threshold derived
 * from the Sarah Reynolds fixture distribution. Pairs with
 * MOCK_PHYSICS_CONFIDENCE so judges see both detector states.
 */
export const MOCK_PHYSICS_CONFIDENCE_OOD: PhysicsConfidence = {
  status: "out_of_distribution",
  mahalanobis_distance: 3.92,
  threshold_p95: 2.5,
  downgrade_from: "approve",
  downgrade_to: "review",
};

/**
 * Wave-40 Stream B.1 aLoRA active adapter mock (D-019 item 2).
 * Demonstrates the discriminated-union active variant with a
 * sub-200 ms hot-swap round-trip (pre-mortem row 67 success
 * criterion). Cites NeurIPS-2024-area aLoRA work per
 * docs/decision-log.md D-019 item 2 framing.
 */
export const MOCK_ALORA_STATUS_ACTIVE: ALoRAStatus = {
  status: "active",
  adapter_name: "race-engineer-intrinsic-v1",
  rank: 8,
  alpha: 16,
  lambda: 0.5,
  swap_ms: 142,
};

/**
 * Wave-40 Stream B.2 GEPA optimization mock (D-019 item 3). Five
 * iterations evolving the race-engineer narration prompt against
 * APEX-Bench faithfulness p95 (0.74 baseline -> 0.91 final). Cites
 * the 2025 DSPy GEPA work per docs/decision-log.md D-019 item 3.
 */
export const MOCK_GEPA_OPTIMIZATION: GEPAOptimization = {
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
 * Wave-40 Stream B.3 EAGLE-3 active speculative-decode mock (D-019
 * item 4). 3.2x speedup + 78% accepted-token-rate + draft rank 4
 * per the arXiv:2503.01840 verified envelope (2.5-3.7x typical band).
 */
export const MOCK_EAGLE3_ACTIVE: EAGLE3State = {
  status: "active",
  speedup_x: 3.2,
  accepted_token_rate: 0.78,
  draft_rank: 4,
  draft_model: "granite-instruct-4.1-draft-rank-4",
};
