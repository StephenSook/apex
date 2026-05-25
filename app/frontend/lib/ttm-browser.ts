/**
 * Wave-45 Phase 7 Block D: Granite TimeSeries TTM r2.1 in-browser
 * inference via Transformers.js + onnxruntime-web. Module exports
 * a graceful-fallback API surface.
 *
 * HEAD-honest shape (corrected 2026-05-25 night per tier-3
 * NotebookLM + ChatGPT review triangulation). The
 * @huggingface/transformers v4.2.0 npm dep IS installed
 * (verified via package.json + pnpm-lock + node_modules); the
 * sibling lib/webgpu-nano.ts uses it to run Granite 4.0 Nano 350M
 * WIRED in-browser via `pipeline("text-generation", ...)`. So
 * "the dep is missing" is NOT the reason TTM ships canned-fallback
 * here.
 *
 * The actual reason: Transformers.js v4 does NOT yet expose a
 * `time-series-forecasting` pipeline task in its public catalog
 * (verified via Context7 query 2026-05-25). Granite TimeSeries TTM
 * r2.1 ONNX export at ibm-granite/granite-timeseries-ttm-r2 is
 * published, but the consumer pipeline class for time-series tasks
 * is not in v4. Running TTM in-browser today requires bypassing
 * the pipeline abstraction + calling onnxruntime-web directly with
 * the TTM tensor shapes — a deeper integration that lands in a
 * later wave when upstream catalog support arrives or we ship the
 * direct-ORT bridge.
 *
 * Therefore the canned-fallback path is the honest current
 * runtime, NOT a bundle-budget or quota constraint as wave-45
 * D-053 originally framed it. The shouldn't-be-possible move #7
 * status downgrades from "Granite TTM running in-browser TODAY" to
 * "Granite TTM in-browser scaffold ready for the day the upstream
 * pipeline task lands; sibling Granite Nano 350M WIRED via the same
 * dep proves the architecture is real, not aspirational."
 *
 * Per the wave-45 plan + ApexIQ deep-dive: ApexIQ runs Granite via
 * local Ollama (server-side); APEX's differentiated angle is the
 * SAME Granite stack running in-browser, lazy-loaded on opt-in.
 * The WIRED proof is Granite Nano 350M via lib/webgpu-nano.ts +
 * EdgeSummary.tsx surface; the TTM-specific path is the scaffold.
 */

import type { SimRigFrame } from "../../shared/types";

export type TTMBrowserStatus =
  | { readonly status: "idle" }
  | { readonly status: "loading"; readonly elapsed_ms: number }
  | { readonly status: "ready"; readonly forecast: ReadonlyArray<number>; readonly elapsed_ms: number; readonly runtime: "transformers-js" | "canned-fallback" }
  | { readonly status: "error"; readonly message: string };

/**
 * Attempt to load the Granite TTM r2.1 ONNX model via Transformers.js.
 * Returns a forecast tensor flattened to a number[] of length 30
 * (the canonical horizon per app/backend/apex/shared/contracts/
 * shapes.py:TENSOR_SHAPE = (None, 30, 14)).
 *
 * Today's HEAD: returns canned-fallback because Transformers.js v4
 * does NOT yet expose a `time-series-forecasting` pipeline task in
 * its public catalog. The @huggingface/transformers v4.2.0 dep IS
 * installed; lib/webgpu-nano.ts proves it works for Granite Nano via
 * `pipeline("text-generation", ...)`. TTM-specific browser inference
 * needs either upstream catalog addition OR a direct onnxruntime-web
 * bridge that bypasses the pipeline abstraction.
 */
export async function runGraniteTTMInBrowser(
  _frames: ReadonlyArray<SimRigFrame>,
): Promise<TTMBrowserStatus> {
  const start = performance.now();
  try {
    // Dynamic-import attempt commented out: the dep IS installed
    // (lib/webgpu-nano.ts wires it for Granite Nano), but the
    // pipeline factory does NOT yet expose a "time-series-forecasting"
    // task. Uncomment when upstream Transformers.js v4 catalog adds
    // the task OR replace with a direct onnxruntime-web call against
    // the TTM r2 ONNX export.
    // const { pipeline } = await import("@huggingface/transformers");
    // const ttm = await pipeline("time-series-forecasting", "ibm-granite/granite-timeseries-ttm-r2");
    // const result = await ttm(frames);
    // return { status: "ready", forecast: Array.from(result.data), elapsed_ms: Math.round(performance.now() - start), runtime: "transformers-js" };

    // HEAD: Transformers.js v4 does not expose time-series-forecasting
    // as a pipeline task; falling through to canned-fallback is the
    // honest behavior per Sookra Methodology Pillar 1.
    throw new Error("transformers-js-v4-no-time-series-forecasting-task");
  } catch {
    // Canned forecast: deterministic 30-step horizon synthesizing a
    // plausible coaching-loop output shape. NOT scientifically valid;
    // serves as the swap-point UI scaffold.
    const cannedForecast = Array.from({ length: 30 }, (_, i) => {
      const t = i / 30;
      return 62 + 12 * Math.sin(t * Math.PI * 2) + 4 * Math.sin(t * Math.PI * 4);
    });
    const elapsed_ms = Math.round(performance.now() - start);
    return {
      status: "ready",
      forecast: cannedForecast,
      elapsed_ms,
      runtime: "canned-fallback",
    };
  }
}
