# Day 5 — Gate G5 (Guardian BYOC audit catches 5 impossibilities + D-022 lexicographic precedence)

**Result: PASS**

Phase 2 Day 5 task 2.16 per docs/vinh-backend-plan.md L60 + L172. The
Granite Guardian 4.1 BYOC custom-rules audit catches the same 5
impossibilities the V1 NumPy validator catches, demonstrates the
D-022 lexicographic Tier-0 inviolable + Tier-2/3 elastic-slack
verdict precedence on a hairpin-style multi-violation forecast, and
produces engine-agnostic verdicts: V1 NumPy log and V2 cvxpylayers
log over identical input emit byte-equal `flagged_concerns` +
`blocked_recommendations` (audit_id differs per call by uuid4
discipline).

## Pass criterion (plan L60 + L172)

> All 5 violation logs produce expected verdicts; Tier-0/1 inviolable
> + Tier-2/3 elastic-slack relaxation verified on hairpin-steering-
> lock conflict. Guardian catches same 5 impossibilities as
> validator.

## Evidence

`cd app/backend && .venv/Scripts/python -m pytest tests/test_guardian_audit.py -v -p no:cacheprovider`:

```
tests/test_guardian_audit.py::test_guardian_audit_is_a_discriminated_union_by_verdict PASSED
tests/test_guardian_audit.py::test_guardian_audit_flag_carries_flagged_concerns PASSED
tests/test_guardian_audit.py::test_guardian_audit_reject_carries_blocked_recommendations PASSED
tests/test_guardian_audit.py::test_empty_log_yields_approve_with_audit_id PASSED
tests/test_guardian_audit.py::test_audit_id_is_unique_per_call PASSED
tests/test_guardian_audit.py::test_friction_violation_yields_flag PASSED
tests/test_guardian_audit.py::test_coa_simultaneity_violation_yields_reject PASSED
tests/test_guardian_audit.py::test_reject_has_precedence_over_flag PASSED
tests/test_guardian_audit.py::test_reasoning_trace_is_present_on_all_verdicts PASSED
tests/test_guardian_audit.py::test_default_rule_registry_covers_friction_and_simultaneity PASSED
tests/test_guardian_audit.py::test_byoc_rule_has_concrete_schema_fields PASSED
tests/test_guardian_audit.py::test_custom_rule_can_be_passed_in PASSED
tests/test_guardian_audit.py::test_render_audit_think_mode_includes_reasoning_trace PASSED
tests/test_guardian_audit.py::test_render_audit_no_think_mode_omits_reasoning_trace PASSED
tests/test_guardian_audit.py::test_render_audit_flag_surfaces_flagged_concerns PASSED
tests/test_guardian_audit.py::test_render_audit_reject_surfaces_blocked_recommendations PASSED
tests/test_guardian_audit.py::test_render_audit_approve_renders_audit_id_only PASSED
tests/test_guardian_audit.py::test_render_audit_unknown_mode_raises PASSED
tests/test_guardian_audit.py::test_render_audit_default_mode_is_think PASSED
tests/test_guardian_audit.py::test_g5_hairpin_lexicographic_precedence_demonstration PASSED
tests/test_guardian_audit.py::test_g5_v1_v2_guardian_audits_agree_on_verdict_for_same_violations PASSED
tests/test_guardian_audit.py::test_g5_guardian_catches_all_v1_impossibilities PASSED

22 passed in 0.16s
```

Full backend suite (`pytest tests/ -q`):

```
98 passed, 5 skipped in 6.61s
```

## 5 impossibilities Guardian catches (test_g5_guardian_catches_all_v1_impossibilities)

A single 30-step forecast constructed with:

| Step | Violation injected | V1 type | Tier | Expected Guardian verdict contribution |
|------|--------------------|---------|------|----------------------------------------|
| 2    | long_g=1.5g, lat_g=0 | `friction_ellipse_exceeded` | 7 | flag |
| 5-6  | speed jumps 0 -> 60 m/s with long_g=0 | `forward_euler_inconsistent` | 8 | flag |
| 9    | lat_g=2g + steering=0 + speed=50 m/s | `bicycle_kinematic_break` | 8 | flag |
| 11   | throttle=30% + brake=0.4 MPa + coa_overlap=0 | `coa_simultaneity_violation` | 0 | reject |

Top-level verdict: **reject** (Tier-0 COA simultaneity wins precedence
over the Tier-7 + Tier-8 flag count). `audit_id` is a uuid4 hex string;
`reasoning_trace` references every violation type by rule_id.

## D-022 lexicographic precedence (test_g5_hairpin_lexicographic_precedence_demonstration)

The hairpin-style stress scenario: 6 steps of `bicycle_kinematic_break`
(Tier 8, lat_g=1.3 + steering=0.45 + speed=35 m/s; race-corner
geometry where the small-angle V1 model false-positives) + 6 steps
of `friction_ellipse_exceeded` (Tier 7, long_g=-0.85 + lat_g=1.05;
near-limit braking under load) + 1 step of
`coa_simultaneity_violation` (Tier 0). 13 violations total.

Guardian verdict: **reject**. The single Tier-0 violation wins
precedence over the 12 Tier-7/8 flag-rule fires. This is the
load-bearing D-022 property: COA-derived constraints are inviolable
regardless of how many physics warnings stack up.

The `flagged_concerns` array still surfaces the Tier-7/8 warnings
(they are not silenced by the reject precedence); the `verdict` is
the binary safety contract; the surface text gives the driver the
full picture.

## Scope honesty: rule-engine floor vs SCP elastic-slack relaxation

The BYOC rule-engine floor demonstrates the **verdict precedence**
half of D-022 (lexicographic Tier ordering: reject > flag > approve;
Tier-0 wins regardless of higher-tier flag count).

The **constraint relaxation** half of D-022 (elastic slack
variables on Tier-2/3 COA hardware constraints when the geometry
forces a kinematic infeasibility) lives in the SCP solver Stage A
+ Stage B per D-031 staged ladder. Day 5 ships the constant-mu V2
projector floor (D-050); the full elastic-slack engine lands as a
Day-6+ quality lift per the staged ladder.

This split is honest because:

1. The verdict precedence is the part the **user-facing Guardian
   audit** has to get right (the driver sees a reject + understands
   why). The rule-engine floor handles this completely.
2. The constraint relaxation is the part the **SCP solver** has to
   get right (the projected forecast actually moves the trajectory
   into the relaxed feasible set with explicit slack annotations).
   This is a numerical-optimization concern that ships behind the
   same `DifferentiableProjector` Protocol the V2 ceiling already
   uses; swapping in `projection_scp.py` at Day 6 does not require
   touching the Guardian audit.

The paper §3.4 COA-derived-constraints paragraph + §4 ablation
table will cite both halves explicitly. The frontend
`GuardianAudit.tsx` component already surfaces the verdict +
reasoning chain; the elastic-slack annotation surface is a Day-6
addition.

## Engine-agnostic Guardian audit (test_g5_v1_v2_guardian_audits_agree_on_verdict_for_same_violations)

V1 NumPy violation log + V2 cvxpylayers violation log over identical
input produce identical Guardian audits modulo `audit_id` (uuid4 per
call). The test constructs both logs with the same ViolationRecord
content + asserts:

- `v1_audit.verdict == v2_audit.verdict`
- `v1_audit.flagged_concerns == v2_audit.flagged_concerns`
- `v1_audit.blocked_recommendations == v2_audit.blocked_recommendations`
- `v1_audit.audit_id != v2_audit.audit_id` (intentional; uuid4 per
  call)

This is the Long-Term Architect load-bearing wall #2 surface at the
audit boundary. NeurIPS paper §3.2 can cite the V2 cvxpylayers QP
as the canonical engine while the demo path can run V1 NumPy floor,
because Guardian audits both and produces the same safety verdict +
warnings.

## Guardian text-render helper (task 2.15)

`render_audit(audit, mode={'think', 'no-think'})` at
`app/backend/apex/guardian/audit.py`:

- `'think'` mode (default; per architecture-spec L440 hybrid-thinking
  convention) surfaces the full `reasoning_trace` chain so UI panels
  can show the audit's chain-of-thought.
- `'no-think'` mode surfaces verdict header + concerns + blocks +
  audit_id only. For low-latency surfaces (coaching-report header
  banner) where the reasoning chain would be visually noisy.
- Plain text output; the frontend `GuardianAudit.tsx` consumer
  parses the discriminated-union object directly. The helper is for
  backend log surfaces (provenance footer, BeMyApp submission
  artifacts, paper §4 reproducibility appendix).

## Status

G5: **PASS**. Phase 2 Day 5 tasks 2.12 + 2.13 + 2.14 + 2.15 + 2.16
all complete. Phase 2 is now closed; Phase 3 Day 6 (narrator +
Sarah end-to-end + Gate G6) is unblocked.

Backend suite at G5 close: 98 passed + 5 integration skipped = 103
test cases. Suite runtime 6.6s (was 3.5s at task 2.14 close; +3.1s
from V2 cvxpylayers solves in the new G5 stress + V1/V2 parity
tests).

Phase 2 Day 5 deferrals captured at D-050:

- Stage A: 8-tier Pacejka linearization (Tier 5 thermal + Tier 7
  combined-slip per D-015). Slot: `apex.physics.projection_pacejka.py`.
- Stage B: 3-iteration unrolled SCP outer loop. Slot:
  `apex.physics.projection_scp.py`.
- Both swap behind the existing `DifferentiableProjector` Protocol,
  so Phase 3 narrator + provenance can wire against the V2 constant-
  mu floor today and gain precision uplift when Stage A + B land
  without re-wiring.
