# Day 3 — G-0.5 TTM-r2 hardware-load gate (PASS)

**Date:** 2026-05-23 (Day 3)
**Operator:** Vinh Le
**Hardware:** Windows 11 + Python 3.10.7 + RTX 3060 Ti (8 GB VRAM, CUDA 12.1)
**Gate origin:** Council v2 transcript 2026-05-22 v2 (Senior Eng peer catch). The original wave-30 plan jumped straight to D-027 without confirming TTM-r2 even loads on the operator's hardware; G-0.5 closes that pre-condition.

## Pass criterion

TTM-r2 loads from HuggingFace Hub + runs a forward pass on the operator's GPU + emits a tensor matching the `shapes.py` `TENSOR_SHAPE = (None, 30, 14)` contract.

## Result

PASS.

```
input shape: (2, 512, 14) on cuda:0
forward took 439.1 ms
prediction_outputs shape: (2, 30, 14)
VRAM allocated: 11.5 MiB
VRAM reserved:  28.0 MiB
```

## Findings

1. TTM-r2 native `context_length = 512` (not the wave-30 plan's implied 30). Our 30-step horizon is the output, the 512-step history is the input.
2. TTM-r2 native `prediction_length = 96`; we truncate to first 30 via `prediction_filter_length=30` per shapes.py HORIZON.
3. TTM-r2 accepts `num_input_channels=14` cleanly. No adapter needed at the input boundary.
4. VRAM footprint is trivial (~12 MiB allocated). 8 GB card has full headroom for cvxpylayers SCP + Granite 4.1 8B Q4 GGUF (G1b) running concurrently.
5. **Operator hardware note:** plan documents say RTX 4060 (Stephen's box). Vinh runs RTX 3060 Ti (Ampere, 8 GB VRAM, 448 GB/s memory bandwidth). 3060 Ti has more CUDA cores + memory bandwidth than 4060; TTM inference is memory-bound, so 3060 Ti meets or beats the plan's latency budget. Decision: keep plan's "RTX 4060" wording for Stephen's lane, file documentation amendment to note Vinh runs 3060 Ti.

## Implication for D-027 Stage C

- Gradient flow proof can use real TTM output, not a hardcoded random tensor: build the spike with TTM-forward + cvxpylayers-projection composed.
- 439ms forward latency leaves ~14.5s of the 15s G8 coaching-report sub-budget for everything downstream (SCP projection + Guardian audit + Granite Instruct narrator).

## Cross-references

- `app/backend/apex/shared/contracts/shapes.py` — canonical 14-channel contract
- `docs/vinh-backend-plan.md` Phase 0 task G-0.5
- `council-transcript-20260522-vinh-backend-plan-v2.md` blind spot (a)
