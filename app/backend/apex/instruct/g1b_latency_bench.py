"""G1b - Granite 4.1 8B Q4_K_M GGUF latency bench on RTX 3060 Ti (Phase 0 task 0.8).

Measures tokens/sec on a representative 300-word coaching-report prompt.
Council v2 implication: G1b feeds into the aLoRA hot-swap + EAGLE-3 deploy
decision (D-019 items 2 + 4). The G8 wall-clock budget is 60s end-to-end
with a 15s coaching-report sub-budget (post-D-019 EAGLE-3 + aLoRA
tightening); G1b tells us how much headroom Granite has before EAGLE-3
speculative decoding is mandatory vs nice-to-have.

Pass criterion: tokens/sec measured + logged. No fail criterion at this
phase; this is a baseline number for the 9 PM Discord sync with Stephen.

Run from repo root:
  app/backend/.venv/Scripts/python.exe -u app/backend/apex/instruct/g1b_latency_bench.py
"""

from __future__ import annotations

import sys
import time
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(REPO_ROOT / "app" / "backend"))

from apex.shared.contracts import new_audit_id  # noqa: E402
from apex.shared.logging import audit_context, get_logger  # noqa: E402

logger = get_logger("instruct.g1b_latency_bench")

# Representative coaching-report prompt: ~300 words, mimics the Phase 3
# narrator's likely prompt shape. Real prompts will carry COA citations,
# forecast envelope, and debrief context; this stub captures the structural
# token count without depending on Phase 1 / Phase 3 artifacts.
COACHING_PROMPT = """You are APEX, an AI race engineer for adaptive racers.
Generate a coaching report for the following corner exit.

Driver: Sarah Reynolds (fictional persona)
Hand-control supplier: MME Motorsport
Circuit: Donington Park, Old Hairpin (turn 4)
Lap: 12 of 25 in the qualifying session

Forecast envelope (TTM r2.1 + cvxpylayers 8-tier physics projection):
- Brake-release at apex: predicted speed 38.2 m/s, lateral acceleration 1.18 g
- Throttle pickup window: 250 ms wider than driver's current sample
- COA section 4.3: brake-throttle simultaneity permitted per approved hardware
- Friction-ellipse margin: 12 percent slip headroom on inside rear tire

Driver debrief observations:
- Driver reports late turn-in feeling versus session 3
- Hand-control overlap window is the load-bearing setup choice
- Wants to know whether to commit earlier or wait for confirmation

Generate a coaching report with:
- One short paragraph of context-setting
- Three specific tuning adjustments with FIA Article + COA section citations
- One safety caveat tied to the friction-ellipse margin
- One closing line that asks for the driver's preferred adaptation path

Keep total length under 200 words. Cite each claim. Do not invent FIA
Article numbers; if uncertain, mark the citation as PENDING for review.
"""


def main() -> int:
    print("=" * 72)
    print("G1b - Granite 4.1 8B Q4_K_M GGUF latency bench on RTX 3060 Ti")
    print("=" * 72)
    audit_id = new_audit_id()
    with audit_context(audit_id):
        from huggingface_hub import hf_hub_download
        from llama_cpp import Llama

        print(f"audit_id: {audit_id}")
        print()

        # ---- Download / locate the GGUF ---------------------------------
        print("[1/3] resolving granite-4.1-8b-Q4_K_M.gguf ...")
        t0 = time.time()
        gguf_path = hf_hub_download(
            repo_id="ibm-granite/granite-4.1-8b-GGUF",
            filename="granite-4.1-8b-Q4_K_M.gguf",
        )
        dl_s = time.time() - t0
        size_gb = Path(gguf_path).stat().st_size / 1024**3
        print(f"      resolved in {dl_s:.2f}s; size={size_gb:.2f} GiB")
        logger.info("g1b.gguf_resolved", elapsed_s=round(dl_s, 2), size_gb=round(size_gb, 2))

        # ---- Load the model into llama.cpp ------------------------------
        # n_gpu_layers=-1 offloads all layers to GPU. For an 8B Q4_K_M model
        # (~5 GiB), this fits in the 3060 Ti's 8 GiB VRAM with TTM already
        # loaded (~12 MiB).
        print("[2/3] loading Granite 4.1 8B Q4_K_M into llama.cpp (GPU layers=all) ...")
        t0 = time.time()
        llm = Llama(
            model_path=gguf_path,
            n_gpu_layers=-1,
            n_ctx=2048,
            verbose=False,
            seed=42,
        )
        load_s = time.time() - t0
        print(f"      loaded in {load_s:.2f}s")
        logger.info("g1b.llama_loaded", elapsed_s=round(load_s, 2))

        # ---- Run the bench ----------------------------------------------
        prompt_tokens = len(llm.tokenize(COACHING_PROMPT.encode("utf-8")))
        print(f"[3/3] generating 200 tokens on a {prompt_tokens}-token prompt ...")
        # Warm-up (Q4 kernel JIT)
        _ = llm(COACHING_PROMPT, max_tokens=8, temperature=0.0)
        t0 = time.time()
        out = llm(
            COACHING_PROMPT,
            max_tokens=200,
            temperature=0.7,
            top_p=0.95,
            stop=["</response>", "\n\nEnd of coaching report"],
        )
        gen_s = time.time() - t0
        completion_tokens = out["usage"]["completion_tokens"]
        total_tokens = out["usage"]["total_tokens"]
        tps = completion_tokens / gen_s if gen_s > 0 else 0.0
        print(f"      generated {completion_tokens} tokens in {gen_s:.2f}s")
        print(f"      tokens/sec: {tps:.1f}")
        print(f"      total context tokens: {total_tokens}")

        # ---- Verdict ----------------------------------------------------
        # No hard fail criterion; this is a baseline measurement. We do log
        # whether the 15s coaching-report sub-budget is met at base-Granite
        # speed (no EAGLE-3, no aLoRA) to inform the D-019 deploy decision.
        budget_15s_met = gen_s < 15.0
        print()
        print("=" * 72)
        print(f"BASELINE: {tps:.1f} tok/s @ Q4_K_M on RTX 3060 Ti")
        print(f"  200-token coaching report: {gen_s:.2f}s")
        print(f"  Fits 15s sub-budget at base Granite (no EAGLE-3 / aLoRA)? {budget_15s_met}")
        print("=" * 72)
        logger.info(
            "g1b.verdict",
            tokens_per_sec=round(tps, 1),
            completion_tokens=completion_tokens,
            gen_s=round(gen_s, 2),
            budget_15s_met=budget_15s_met,
        )
        return 0


if __name__ == "__main__":
    sys.exit(main())
