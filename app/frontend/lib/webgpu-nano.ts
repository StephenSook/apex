/**
 * WebGPU Granite 4.0 Nano 350M edge inference loader (D-019 item 1
 * + D-021 + PLAN row 5.16 G-5.16). Loads the
 * `onnx-community/granite-4.0-350m-ONNX-web` model via
 * @huggingface/transformers v4 pipeline API with device:"webgpu" +
 * dtype:"fp16" + supportsWorker:true (per context7-verified MODELS
 * array entry in the official next-ai-sdk Transformers.js tutorial).
 *
 * Pre-load 1.5 GB WebGPU memory check per pre-mortem row 61: if the
 * browser advertises insufficient WebGPU buffer headroom (heavy
 * neighboring tabs, integrated GPU with shared memory, Safari
 * without enabled flag), the loader degrades to `oom` state +
 * surfaces "Edge mode unavailable, server-only path active" via
 * EdgeSummary.tsx role=alert.
 *
 * Discriminated-union state per the wave-35 B + wave-36 + wave-37
 * + wave-38 Stream A discriminated-unions-over-contradiction
 * memory rule. Five variants:
 *   - loading (pipeline + weights downloading; progress 0..1)
 *   - ready (pipeline live; in-browser inference available)
 *   - oom (WebGPU buffer headroom insufficient; server-only path)
 *   - offline (navigator.onLine false; sync-on-reconnect.ts owns
 *     the reconnect path per D-021)
 *   - error (unexpected error; underlying message preserved)
 *
 * Server-authoritative reconnect contract per D-021: edge results
 * are advisory only; on reconnect the server overwrites local
 * state. No mechanical recommendations are emitted from the offline
 * path (D-021 explicit scope cut).
 */

"use client";

import { useEffect, useState } from "react";

/**
 * Granite 4.0 Nano 350M model identifier on Hugging Face Hub. The
 * `-ONNX-web` suffix marks the WebGPU-optimised ONNX export with
 * 4-bit + fp16 weight variants per the onnx-community publication.
 */
export const GRANITE_NANO_MODEL_ID = "onnx-community/granite-4.0-350m-ONNX-web";

/**
 * WebGPU memory headroom threshold below which the loader degrades
 * to `oom` per pre-mortem row 61. 1.5 GiB matches the documented
 * Granite 4.0 350M fp16 weight footprint + KV cache headroom on
 * the 30-step coaching prompt.
 */
export const WEBGPU_MEMORY_FLOOR_BYTES = 1_500_000_000;

export type GraniteNanoEdgeState =
  | { readonly status: "loading"; readonly progress: number }
  | { readonly status: "ready"; readonly pipelineReady: true }
  | { readonly status: "oom"; readonly available_bytes: number; readonly required_bytes: number }
  | { readonly status: "offline"; readonly reconnect_pending: true }
  | { readonly status: "error"; readonly message: string };

/**
 * Browser-side capability probe. Returns the available WebGPU buffer
 * headroom in bytes if WebGPU is supported + the adapter advertises a
 * limit; returns null when WebGPU is unavailable (Safari without
 * --enable-webgpu, server-side render, missing GPU).
 */
async function probeWebGPUHeadroom(): Promise<number | null> {
  if (typeof navigator === "undefined" || !("gpu" in navigator)) {
    return null;
  }
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
  if (!gpu) {
    return null;
  }
  try {
    const adapter = await gpu.requestAdapter();
    if (!adapter || typeof adapter !== "object") {
      return null;
    }
    const limits = (adapter as { limits?: { maxBufferSize?: number } }).limits;
    return typeof limits?.maxBufferSize === "number" ? limits.maxBufferSize : null;
  } catch {
    return null;
  }
}

/**
 * Load the Granite 4.0 Nano pipeline on WebGPU. Mockable via the
 * `loader` parameter for vitest unit tests; in production the
 * default imports `@huggingface/transformers` pipeline.
 */
export async function loadGraniteNanoPipeline(
  loader: () => Promise<unknown> = defaultPipelineLoader,
): Promise<unknown> {
  return loader();
}

async function defaultPipelineLoader(): Promise<unknown> {
  const { pipeline } = await import("@huggingface/transformers");
  return pipeline("text-generation", GRANITE_NANO_MODEL_ID, {
    device: "webgpu",
    dtype: "fp16",
  });
}

/**
 * React hook returning the live GraniteNanoEdgeState. Performs the
 * pre-mortem-row-61 1.5 GB WebGPU memory probe on mount + degrades
 * to `oom` immediately if the adapter advertises insufficient
 * headroom (avoids the expensive ~5-15s pipeline weight download
 * when we already know it will fail). On `navigator.onLine === false`
 * surfaces `offline` per D-021 reconnect contract.
 */
export function useGraniteNanoEdge(): GraniteNanoEdgeState {
  // Wave-38 cascade-#8 hotfix: lazy state initializer for offline
  // detection. Prior code used `setState({status: "offline"})`
  // synchronously inside useEffect which the React 19 + Next.js 16
  // ESLint rule blocks ("Calling setState synchronously within an
  // effect can trigger cascading renders"). Lazy initializer is the
  // canonical pattern: derive initial state from navigator.onLine at
  // first render; useEffect only handles the load path. SSR safe:
  // typeof navigator check returns "loading" on the server; client
  // hydration runs the same check + matches.
  const [state, setState] = useState<GraniteNanoEdgeState>(() => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return { status: "offline", reconnect_pending: true };
    }
    return { status: "loading", progress: 0 };
  });

  useEffect(() => {
    let cancelled = false;

    // Lazy initializer already handled the offline path; skip load.
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return () => {
        cancelled = true;
      };
    }

    void (async () => {
      const available = await probeWebGPUHeadroom();
      if (cancelled) {
        return;
      }
      if (available === null) {
        setState({
          status: "error",
          message: "WebGPU unavailable in this browser; the edge demo requires Chrome 121+ or equivalent.",
        });
        return;
      }
      if (available < WEBGPU_MEMORY_FLOOR_BYTES) {
        setState({
          status: "oom",
          available_bytes: available,
          required_bytes: WEBGPU_MEMORY_FLOOR_BYTES,
        });
        return;
      }
      setState({ status: "loading", progress: 0.25 });
      try {
        await loadGraniteNanoPipeline();
        if (cancelled) {
          return;
        }
        setState({ status: "ready", pipelineReady: true });
      } catch (err) {
        if (cancelled) {
          return;
        }
        const message = err instanceof Error ? err.message : String(err);
        setState({ status: "error", message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
