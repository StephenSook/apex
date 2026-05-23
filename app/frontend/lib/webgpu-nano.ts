/**
 * WebGPU Granite 4.0 Nano 350M edge inference loader (D-019 item 1
 * + D-021 + PLAN row 5.16 G-5.16). Loads the
 * `onnx-community/granite-4.0-350m-ONNX-web` model via
 * @huggingface/transformers v4 pipeline API with device:"webgpu" +
 * dtype:"fp16". Model card published at
 * https://huggingface.co/onnx-community/granite-4.0-350m-ONNX-web.
 *
 * Pre-load WebGPU capability check per pre-mortem row 61: the probe
 * reads the WebGPU adapter `limits.maxBufferSize` as a CAPABILITY
 * indicator (single largest allocation the adapter will serve);
 * this is NOT a measure of total free VRAM. A device with 2 GB
 * maxBufferSize + heavy neighboring tabs can still OOM at runtime
 * after passing the check. The check catches the common cases
 * (Safari without --enable-webgpu, integrated GPU advertising
 * sub-1.5 GB per-buffer cap, server-side render, missing GPU); the
 * runtime fallback (`error` state from the pipeline loader catch)
 * catches the rest. If the check fails, the loader degrades to
 * `oom` state + surfaces "Edge mode unavailable, server-only path
 * active" via EdgeSummary.tsx role=alert.
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
 * `-ONNX-web` suffix marks the WebGPU-optimized ONNX export with
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
 * Tagged-union result of the WebGPU capability probe (wave-38 cascade
 * #8 silent-failure-hunter H-1 close-out). Prior code collapsed three
 * distinct failure modes into a single `null` return + a generic
 * "WebGPU unavailable" message, misleading users + suppressing
 * adapter-error diagnostics. Each variant carries the data its
 * EdgeSummary state-mapper needs to render a distinct user-facing
 * message.
 */
export type WebGPUProbeResult =
  | { readonly kind: "no_webgpu" }
  | { readonly kind: "no_adapter" }
  | { readonly kind: "adapter_error"; readonly error: unknown }
  | { readonly kind: "ok"; readonly max_buffer_size: number };

/**
 * Browser-side WebGPU capability probe. Returns a tagged-union result
 * distinguishing the three failure modes (WebGPU API absent, adapter
 * request returned null, adapter request threw) from the success path
 * (adapter advertises a non-null `limits.maxBufferSize`). Caller maps
 * each variant to a distinct EdgeSummary state.
 *
 * NOTE per wave-38 cascade #8 silent-failure-hunter H-2: maxBufferSize
 * is the WebGPU spec's PER-BUFFER capability limit (the largest single
 * allocation the adapter will serve), NOT a measure of total free
 * VRAM. A 6 GB discrete GPU typically advertises 2 GiB maxBufferSize
 * (the spec default); an integrated iGPU advertises far less. The
 * runtime pipeline load remains the source of truth for actual memory
 * feasibility; this probe catches the obvious cases (Safari without
 * flag, integrated GPU under-cap, server-side render, missing GPU).
 */
async function probeWebGPUHeadroom(): Promise<WebGPUProbeResult> {
  if (typeof navigator === "undefined" || !("gpu" in navigator)) {
    return { kind: "no_webgpu" };
  }
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
  if (!gpu) {
    return { kind: "no_webgpu" };
  }
  try {
    const adapter = await gpu.requestAdapter();
    if (!adapter || typeof adapter !== "object") {
      return { kind: "no_adapter" };
    }
    const limits = (adapter as { limits?: { maxBufferSize?: number } }).limits;
    if (typeof limits?.maxBufferSize !== "number") {
      return { kind: "no_adapter" };
    }
    return { kind: "ok", max_buffer_size: limits.maxBufferSize };
  } catch (err) {
    // Wave-38 cascade #8 silent-failure-hunter N-1: preserve the
    // underlying adapter error message for dev visibility instead of
    // swallowing the exception silently. CLAUDE.md anti-pattern check:
    // empty catch blocks are never acceptable.
    if (typeof console !== "undefined" && console.warn) {
      console.warn("WebGPU adapter probe threw:", err);
    }
    return { kind: "adapter_error", error: err };
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
      const probe = await probeWebGPUHeadroom();
      if (cancelled) {
        return;
      }
      // Wave-38 cascade #8 silent-failure-hunter H-1 close-out: each
      // probe failure variant maps to a distinct user-facing message
      // so operators can locate the upstream cause (missing browser
      // API vs no adapter vs adapter exception).
      switch (probe.kind) {
        case "no_webgpu":
          setState({
            status: "error",
            message:
              "WebGPU unavailable in this browser. The edge demo requires Chrome 121+ or equivalent with WebGPU enabled.",
          });
          return;
        case "no_adapter":
          setState({
            status: "error",
            message:
              "WebGPU adapter request returned no compatible adapter. Check GPU driver + BIOS WebGPU support.",
          });
          return;
        case "adapter_error": {
          const adapterMessage =
            probe.error instanceof Error ? probe.error.message : String(probe.error);
          setState({
            status: "error",
            message: `WebGPU adapter probe failed: ${adapterMessage}. Re-run the session.`,
          });
          return;
        }
        case "ok":
          break;
        default: {
          const _exhaustive: never = probe;
          throw new Error(`unknown WebGPU probe result: ${String(_exhaustive)}`);
        }
      }
      if (probe.max_buffer_size < WEBGPU_MEMORY_FLOOR_BYTES) {
        setState({
          status: "oom",
          available_bytes: probe.max_buffer_size,
          required_bytes: WEBGPU_MEMORY_FLOOR_BYTES,
        });
        return;
      }
      setState({ status: "loading", progress: 0.5 });
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
        // Wave-38 cascade #8 silent-failure-hunter H-2 close-out:
        // runtime OOM at pipeline-load time maps to the `oom` state
        // when the error message names a memory failure; otherwise
        // routes through the generic `error` state.
        const isMemoryError = /out of memory|OOM|insufficient|allocation|memory/i.test(message);
        if (isMemoryError) {
          setState({
            status: "oom",
            available_bytes: probe.max_buffer_size,
            required_bytes: WEBGPU_MEMORY_FLOOR_BYTES,
          });
          return;
        }
        setState({ status: "error", message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
