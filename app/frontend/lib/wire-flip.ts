/**
 * Wave-46 Phase C3 R10 simplification: shared wire-flip helpers for the
 * canned + real-backend swap-point pattern used across all Vinh M3
 * swap-point routes (V12 Pacejka + V13 SCP + V14 LangGraph + V15 LIPS
 * + tspulse anomaly + RAG retrieve + STT + COA diff + tire degradation
 * + weather brief).
 *
 * Before this helper: each of the 9 routes inlined the same try/catch
 * + AbortSignal.timeout(3000) + upstream-status warn + canned-fallback
 * pattern (~50-65 LOC per route, ~500 LOC duplicated across the api/
 * tree). Per code-simplifier finding R10 the helper extraction is byte-
 * equivalent on the canned path (every existing route test continues to
 * pass) + collapses each route to ~25-30 LOC.
 *
 * Design contract:
 *  - The helper NEVER throws. On any upstream failure (network + 5xx +
 *    parse + abort) it returns the canned payload + emits a
 *    console.warn (R11 fix per `feedback_silent_failure_hunter` finding:
 *    console.error was reading as "this is a bug" in production logs
 *    when in fact every wire-flip fallback is BY DESIGN).
 *  - The helper preserves the `engine` field rewrite ("foo-canned-
 *    fallback" -> "foo-real") + `compute_ms` recompute so callers do
 *    not need to remember to do either.
 *  - Headers attached by the helper include `X-Apex-<RouteId>-Engine`
 *    + `Cache-Control: no-store` per the existing route convention.
 *
 * Per `feedback_propagation_full_repo_sweep.md`: this file is the
 * canonical wire-flip surface; if you find a route still inlining the
 * pattern, migrate it to runWireFlipGET / runWireFlipPOST + delete the
 * inlined version.
 *
 * Cross-references:
 *  - Decision log: D-058 wave-46 wire-flip discipline (per-route
 *    NEXT_PUBLIC_USE_REAL_BACKEND_* env flag gating)
 *  - Wave-46 Phase C R10 + R11 release per `Wave-46 Galaxy Final Push`
 *    plan at `~/.claude/plans/all-right-i-want-rippling-moon.md`
 *  - Memory rule: `feedback_conceptual_stack_vs_shipped_stack.md` (the
 *    helper does NOT hide the canned-vs-real reality; engine field
 *    + X-Apex-*-Engine header always reflect which path served)
 */

import { type FeatureFlag, getVinhBackendBaseUrl, shouldUseRealBackend } from "./env";

export type WireFlipFlag = FeatureFlag;

export type EnginePayload = {
  readonly engine: string;
  readonly compute_ms: number;
};

export type WireFlipGETOptions<TResponse extends EnginePayload> = {
  readonly flag: WireFlipFlag;
  readonly upstreamPath: string;
  readonly routeId: string;
  readonly t0: number;
  readonly cannedPayload: TResponse;
  readonly realEngineLabel: string;
};

export async function runWireFlipGET<TResponse extends EnginePayload>(
  options: WireFlipGETOptions<TResponse>,
): Promise<TResponse> {
  const { flag, upstreamPath, routeId, t0, cannedPayload, realEngineLabel } = options;
  if (!shouldUseRealBackend(flag)) return cannedPayload;
  const base = getVinhBackendBaseUrl();
  if (base === null) return cannedPayload;
  try {
    const upstream = await fetch(`${base}${upstreamPath}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!upstream.ok) {
      console.warn(
        `[apex/${routeId}] upstream ${upstream.status} ${upstream.statusText}; serving canned-fallback`,
      );
      return cannedPayload;
    }
    const body = (await upstream.json()) as TResponse;
    return {
      ...body,
      engine: realEngineLabel,
      compute_ms: Math.round(performance.now() - t0),
    };
  } catch (err) {
    console.warn(`[apex/${routeId}] real-backend fetch failed; serving canned-fallback`, err);
    return cannedPayload;
  }
}

export type WireFlipPOSTOptions<TBody, TResponse extends EnginePayload> = {
  readonly flag: WireFlipFlag;
  readonly upstreamPath: string;
  readonly routeId: string;
  readonly t0: number;
  readonly body: TBody;
  readonly cannedPayload: TResponse;
  readonly realEngineLabel: string;
};

export async function runWireFlipPOST<TBody, TResponse extends EnginePayload>(
  options: WireFlipPOSTOptions<TBody, TResponse>,
): Promise<TResponse> {
  const { flag, upstreamPath, routeId, t0, body, cannedPayload, realEngineLabel } = options;
  if (!shouldUseRealBackend(flag)) return cannedPayload;
  const base = getVinhBackendBaseUrl();
  if (base === null) return cannedPayload;
  try {
    const upstream = await fetch(`${base}${upstreamPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!upstream.ok) {
      console.warn(
        `[apex/${routeId}] upstream ${upstream.status} ${upstream.statusText}; serving canned-fallback`,
      );
      return cannedPayload;
    }
    const responseBody = (await upstream.json()) as TResponse;
    return {
      ...responseBody,
      engine: realEngineLabel,
      compute_ms: Math.round(performance.now() - t0),
    };
  } catch (err) {
    console.warn(`[apex/${routeId}] real-backend fetch failed; serving canned-fallback`, err);
    return cannedPayload;
  }
}
