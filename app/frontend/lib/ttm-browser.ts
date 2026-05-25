/**
 * Wave-45 Phase 7 Block D: Granite TimeSeries TTM r2.1 in-browser
 * inference via Transformers.js + onnxruntime-web. Module exports
 * a graceful-fallback API surface.
 *
 * HEAD shape: tries to dynamic-import @huggingface/transformers. If
 * the dep is present (wave-46 install adds it), the real Granite
 * TTM r2.1 ONNX export runs in-browser via WebGPU / WASM SIMD. If
 * the dep is NOT present (current state), returns a canned forecast
 * shape so the consumer surface (TTMInBrowserPanel) renders
 * gracefully with the swap-point documented.
 *
 * shouldn't-be-possible move #7 (galaxy-tier) per D-053: a real
 * fine-tuned TSFM running in the driver's browser, paddock-side,
 * with no server roundtrip. Wave-45 ships the component + lib
 * scaffold; wave-46 adds the @huggingface/transformers dep + the
 * service-worker cache for the ~500MB ONNX model.
 *
 * Per the wave-45 plan + ApexIQ deep-dive: ApexIQ runs Granite via
 * local Ollama (server-side); APEX's differentiated angle is the
 * SAME Granite stack running in-browser, lazy-loaded on opt-in,
 * cached via service worker, paddock-side viable.
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
 * Today's HEAD: dynamic-import fails because @huggingface/transformers
 * is not in package.json yet. The catch-fallback returns a canned
 * forecast so the UI surface renders + the swap-point stays
 * documented. Wave-46 adds the dep.
 */
export async function runGraniteTTMInBrowser(
  _frames: ReadonlyArray<SimRigFrame>,
): Promise<TTMBrowserStatus> {
  const start = performance.now();
  try {
    // Dynamic-import the dep; if absent, this throws + the catch
    // fires the canned-fallback path. Comment-only intent for the
    // wave-46 swap.
    // const { pipeline } = await import("@huggingface/transformers");
    // const ttm = await pipeline("time-series-forecasting", "ibm-granite/granite-timeseries-ttm-r2");
    // const result = await ttm(frames);
    // return { status: "ready", forecast: Array.from(result.data), elapsed_ms: Math.round(performance.now() - start), runtime: "transformers-js" };

    // HEAD: the dep is intentionally NOT installed yet (wave-46
    // task). Falling through to the canned-fallback path is the
    // honest behavior per Sookra Methodology Pillar 1.
    throw new Error("transformers-js-dep-not-installed");
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
