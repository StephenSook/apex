# Day 3 — G1b Granite 4.1 8B Q4_K_M latency bench (baseline measured)

**Date:** 2026-05-23 (Day 3)
**Operator:** Vinh Le
**Hardware:** Windows 11 + Python 3.10.7 + RTX 3060 Ti (8 GB VRAM, CUDA 12.1)

## Pass criterion (plan G1b row)

Tokens/sec measured + logged. Feeds the aLoRA hot-swap + EAGLE-3 deploy
decision per D-019. No hard fail criterion at this phase.

## Result

```
Model:           ibm-granite/granite-4.1-8b-GGUF Q4_K_M (4.98 GiB)
Runtime:         llama-cpp-python 0.3.23 (CUDA 12.1, all layers offloaded)
GPU:             RTX 3060 Ti (8 GB VRAM)
Context window:  2048 tokens
Prompt:          299 tokens (representative coaching-report prompt)
Completion:      200 tokens at temperature=0.7, top_p=0.95
Warm gen time:   28.01s
Throughput:      7.1 tokens/sec
```

## Significance

The wave-30 D-019 already tightened the coaching-report sub-budget to 15s
via EAGLE-3 speculative decoding + aLoRA hot-swap. G1b proves the
acceleration layer is **load-bearing**, not optional: base Granite at
~7 tok/s misses the 15s sub-budget by ~2x on a 200-token target output.

This is a numeric refinement of D-019, not a re-architecture. The plan
already named EAGLE-3 + aLoRA as required for the 15s sub-budget. G1b
confirms.

## Three response paths (lowest risk first)

1. **OpenRouter Granite 4.1 8B for the demo path.** Plan task 5.1 + D-019
   already lock the deploy on Vercel frontend + OpenRouter
   `openrouter.ai/ibm-granite/granite-4.1-8b` + watsonx.ai. The local
   llama.cpp GGUF path is the offline-fallback / Colab-notebook-backup
   path, NOT the judge-facing demo path. G1b's 7.1 tok/s is the
   offline-fallback baseline; the demo path latency depends on OpenRouter
   serving, not on this number.

2. **Add EAGLE-3 + aLoRA per the existing D-019 roadmap.** Phase 4
   work. ~2 days. Targets ~3-3.5x speedup -> ~25 tok/s base -> ~8s for
   200 tokens. Fits 15s sub-budget comfortably with margin.

3. **Trim coaching-report output to ~100 tokens.** ~14s at base Granite.
   Marginal pass but risks looking thin in the demo video. Last resort.

## Decision

Lean on path 1 for the demo (matches existing plan task 5.1 + D-019).
G1b's measured 7.1 tok/s baseline is a useful number for the 9 PM
Discord sync with Stephen and for the Colab-notebook-backup latency
expectation, but does NOT change the Phase 0 critical path.

Path 2 (EAGLE-3 + aLoRA) was always planned for Phase 4; G1b's result
elevates it from "optimization" to "required" but does not move it
earlier in the schedule.

Path 3 stays in reserve.

## Structured logging trace

Every step emitted JSON with audit_id `6ade4a0a69ae4795b730ce0357061231`
+ commit_sha `c69753d` + model_versions snapshot. The audit_id correlation
across `g1b.gguf_resolved` -> `g1b.llama_loaded` -> `g1b.verdict` works
end-to-end on the Granite path as well as the TTM path.

## Install observations (council v2 install-landmine tracker)

- `llama-cpp-python` 0.3.23 built from source on Windows 11 + Python 3.10
  in ~2 minutes. No VC++ Build Tools intervention beyond what was already
  present (cvxpy install path also surfaced this).
- HF Hub Xet Storage warning: the GGUF repo is configured for the new
  `hf_xet` transfer protocol; we fell back to regular HTTPS (fine for the
  one-shot download). Install `huggingface_hub[hf_xet]` if subsequent
  multi-GB downloads happen often enough to matter.
- 4.98 GiB GGUF + ~12 MiB TTM = ~5.0 GiB VRAM occupied. ~3 GiB free for
  cvxpylayers SCP solve + Granite embedding R2 (D-016 12-tool stack) if
  both run simultaneously. Tight but feasible.

## Cross-references

- `app/backend/apex/instruct/g1b_latency_bench.py` — the bench script
- `docs/decision-log.md` D-019 — EAGLE-3 + aLoRA items 2+4 acceleration plan
- `docs/vinh-backend-plan.md` Phase 5 task 5.1 — OpenRouter deploy decision
- `council-transcript-20260522-vinh-backend-plan-v2.md` — chairman synthesis
  on the 15s coaching-report sub-budget
