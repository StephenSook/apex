# Day 3 — G1 TTM zero-shot smoke (PASS)

**Date:** 2026-05-23 (Day 3)
**Operator:** Vinh Le
**Hardware:** Windows 11 + Python 3.10.7 + RTX 3060 Ti

## Pass criterion (plan G1 row)

TTM r2.1 loads + 1Hz inference < 60s on operator hardware + channel-mix
decoder fine-tune scaffold ready (D-010 Track 1). The 60s budget is the
end-to-end load + inference ceiling, not a per-call latency target.

## Result

PASS.

```
load (FastF1 + TTM):    3.08s   (budget < 60s)
warm inference:         10.5ms  (budget < 60s)
output shape:           (1, 30, 14) matches shapes.py
all-finite output:      True
```

## What G1 proves beyond G-0.5

G-0.5 ran TTM on a random tensor; G1 runs it on real Hamilton 2024 Bahrain
Q telemetry (5 laps, ~2637 timesteps at FastF1's native ~50 Hz raw rate)
loaded from the FastF1 cache prefetched by Phase 0 task 0.6. Same shape
contract holds end-to-end on real data.

## FastF1 channel-availability gap (pre-mortem row 62)

FastF1 ships 5 of the 14 channels: `throttle_pct`, `brake_pa` (boolean,
tiled to 0 / 3.5 MPa), `rpm`, `speed_mps` (converted from km/h), `gear`.
The remaining 9 channels (`steering_rad`, `lat_g`, `long_g`,
`coa_overlap_flag`, `tire_load_n`, `mu_v`, `track_pitch_rad`,
`track_bank_rad`, `yaw_rate_rad_s`) are zero-filled at the G1 boundary
and emit a structured warning per row. This is the documented gap from
pre-mortem row 62 (all three wide-pass research sources flagged it);
demo path uses Sarah Reynolds synthetic telemetry which has all 14
channels by design.

## Implications for downstream phases

- **G8 60s wall-clock budget:** TTM inference is now ~10ms warm. Subtract
  that from the 15s coaching-report sub-budget; ~14990ms left for
  cvxpylayers projection + Granite Instruct narration + Guardian audit
  + provenance footer assembly.
- **APEX-Bench eval harness:** the FastF1-driven path through TTM is
  validated. G10's LIPS 4-axis ablation table can populate
  zero-shot-TTM and APEX-hard-projection rows from this path.
- **Channel-mix decoder fine-tune (Track 1 of three-track ensemble):**
  G1 ran zero-shot; the decoder fine-tune scaffold lands at Phase 2 Day
  4 task 2.8 once the validator floor (G3) is in place.

## Structured logging trace

Every step emitted JSON with audit_id `946419e9b8704d808a1c6e6980fbfbc5`
+ commit_sha `c69753d` + the model_versions snapshot. The audit_id
correlation across `g1.start` -> `g1.fastf1_loaded` -> `g1.ttm_loaded`
-> `g1.ttm_forward` -> `g1.verdict` is the SRE peer's catch from council
v2 working end-to-end on a real request.
