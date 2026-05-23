/**
 * Wave-39 type-design-analyzer HIGH close-out. Deliberate-misshape
 * negative tsc fixture verifying that the wave-38 Stream A discrete-
 * variant discriminated unions WebGPUProbeResult + GraniteNanoEdgeState
 * + ConnectivityState actually enforce their variant invariants at
 * construction sites.
 *
 * Mirrors the wave-37 cascade-#5 single-line assertion-helper pattern
 * from `tests/types/positional-binding.test-d.ts`: each
 * `@ts-expect-error` directive asserts that the NEXT statement MUST
 * emit a TypeScript error. If tsc does NOT emit an error on the next-
 * statement line, tsc emits `TS2578 Unused '@ts-expect-error'
 * directive.` which fails the build. Single-line assertion helpers
 * wrap the negative fixtures so the entire type check fires on one
 * line + the `@ts-expect-error` directive immediately above
 * suppresses cleanly (multi-line object literals attribute errors to
 * inner element columns that `@ts-expect-error` does not suppress
 * cleanly per the cascade-#7 root cause).
 *
 * This file is type-only (no runtime code, no test framework). It
 * runs through the standard CI tsc invocation (frontend job's
 * "TypeScript type-check" step).
 *
 * If you add a new variant to WebGPUProbeResult, GraniteNanoEdgeState,
 * or ConnectivityState, add a corresponding @ts-expect-error fixture
 * below to verify the new variant's construction-site enforcement.
 */

import type { GraniteNanoEdgeState, WebGPUProbeResult } from "../../lib/webgpu-nano";
import type { ConnectivityState } from "../../lib/sync-on-reconnect";

// Single-line assertion helpers. Each accepts the typed value at the
// call site so misshapen variant literals fire TS errors on the ONE
// line of the call (which is what `@ts-expect-error` suppresses).
function assertProbe(_: WebGPUProbeResult): void {}
function assertEdgeState(_: GraniteNanoEdgeState): void {}
function assertConnectivity(_: ConnectivityState): void {}

// ---------------------------------------------------------------------------
// WebGPUProbeResult: 4-variant tagged union ("no_webgpu" | "no_adapter" |
// "adapter_error" | "ok")
// ---------------------------------------------------------------------------

// Canonical variants. MUST compile clean.
assertProbe({ kind: "no_webgpu" });
assertProbe({ kind: "no_adapter" });
assertProbe({ kind: "adapter_error", error: new Error("test") });
assertProbe({ kind: "ok", max_buffer_size: 2_147_483_648 });

// Misshape #1: unknown kind tag.
// @ts-expect-error wave-39 type-design HIGH: "unsupported" is not a WebGPUProbeResult variant.
assertProbe({ kind: "unsupported" });

// Misshape #2: ok variant missing max_buffer_size.
// @ts-expect-error wave-39 type-design HIGH: ok variant requires max_buffer_size.
assertProbe({ kind: "ok" });

// Misshape #3: adapter_error variant missing error.
// @ts-expect-error wave-39 type-design HIGH: adapter_error variant requires error.
assertProbe({ kind: "adapter_error" });

// Misshape #4: max_buffer_size as string (not number).
// @ts-expect-error wave-39 type-design HIGH: max_buffer_size must be number.
assertProbe({ kind: "ok", max_buffer_size: "2147483648" });

// Misshape #5: no_webgpu variant carrying max_buffer_size (variant payload mismatch).
// @ts-expect-error wave-39 type-design HIGH: no_webgpu variant carries no payload.
assertProbe({ kind: "no_webgpu", max_buffer_size: 100 });

// ---------------------------------------------------------------------------
// GraniteNanoEdgeState: 5-variant discriminated union
// ---------------------------------------------------------------------------

// Canonical variants. MUST compile clean.
assertEdgeState({ status: "loading", progress: 0.5 });
assertEdgeState({ status: "ready", pipelineReady: true });
assertEdgeState({ status: "oom", available_bytes: 500_000_000, required_bytes: 1_500_000_000 });
assertEdgeState({ status: "offline", reconnect_pending: true });
assertEdgeState({ status: "error", message: "test" });

// Misshape #1: unknown status tag.
// @ts-expect-error wave-39 type-design HIGH: "pending" is not a GraniteNanoEdgeState variant.
assertEdgeState({ status: "pending", progress: 0.5 });

// Misshape #2: ready variant with pipelineReady: false (literal-type true required).
// @ts-expect-error wave-39 type-design HIGH: ready variant requires pipelineReady literal true.
assertEdgeState({ status: "ready", pipelineReady: false });

// Misshape #3: offline variant with reconnect_pending: false (literal-type true required).
// @ts-expect-error wave-39 type-design HIGH: offline variant requires reconnect_pending literal true.
assertEdgeState({ status: "offline", reconnect_pending: false });

// Misshape #4: loading variant with progress as string.
// @ts-expect-error wave-39 type-design HIGH: loading variant progress must be number.
assertEdgeState({ status: "loading", progress: "0.5" });

// Misshape #5: oom variant missing required_bytes.
// @ts-expect-error wave-39 type-design HIGH: oom variant requires both available_bytes + required_bytes.
assertEdgeState({ status: "oom", available_bytes: 500_000_000 });

// Misshape #6: error variant missing message.
// @ts-expect-error wave-39 type-design HIGH: error variant requires message string.
assertEdgeState({ status: "error" });

// Misshape #7: loading variant missing progress.
// @ts-expect-error wave-39 type-design HIGH: loading variant requires progress number.
assertEdgeState({ status: "loading" });

// ---------------------------------------------------------------------------
// ConnectivityState: 2-variant discriminated union
// ---------------------------------------------------------------------------

// Canonical variants. MUST compile clean.
assertConnectivity({ status: "online" });
assertConnectivity({ status: "offline", reconnect_pending: true });

// Misshape #1: unknown status tag.
// @ts-expect-error wave-39 type-design HIGH: "reconnecting" is not a ConnectivityState variant.
assertConnectivity({ status: "reconnecting" });

// Misshape #2: offline variant missing reconnect_pending.
// @ts-expect-error wave-39 type-design HIGH: offline variant requires reconnect_pending literal true.
assertConnectivity({ status: "offline" });

// Misshape #3: online variant carrying reconnect_pending (variant payload mismatch).
// @ts-expect-error wave-39 type-design HIGH: online variant carries no reconnect_pending.
assertConnectivity({ status: "online", reconnect_pending: true });

// Misshape #4: offline variant with reconnect_pending: false (literal-type true required).
// @ts-expect-error wave-39 type-design HIGH: offline variant requires reconnect_pending literal true.
assertConnectivity({ status: "offline", reconnect_pending: false });
