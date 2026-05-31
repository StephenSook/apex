/**
 * Wave-64 live-coaching merge helper.
 *
 * `applyLiveNarrative` takes the structurally-complete base coaching
 * report (built client-side from the physics / fixture layer, carrying
 * the real deltas, forecast envelope, tuning delta, and FIA / COA
 * citations) and asks the OpenRouter-wired `/api/coaching/narrate` route
 * to regenerate the corner-by-corner NARRATIVE live via Granite 4.1 8B
 * Instruct, grounded in the driver's debrief + those same deltas.
 *
 * The merge is deliberately narrow: only the prose fields
 * (`recommendation`, `recommendation_beginner`, `reasoning_chain`) are
 * replaced with the live output. The numbers (`current_delta_s`,
 * `forecast`, `tuning_delta`), the `citations`, the audit, and the
 * provenance footer are kept verbatim from the base report. The model
 * writes coaching; it does not produce telemetry or regulatory anchors.
 *
 * Honest degrade: on ANY failure (no API key -> route returns ok:false;
 * network error; ok:false for parse/upstream; shape mismatch) the base
 * report is returned unchanged with `narrative_source: "fixture"`. The
 * analyze surface therefore never breaks, and the rendered label always
 * tells the truth about which path produced the prose.
 */

import type { CoachingReport, CornerInsight, ReasoningChainStep } from "../../shared/types";

const NARRATE_ENDPOINT = "/api/coaching/narrate";

interface LiveCornerPayload {
  readonly name?: unknown;
  readonly recommendation?: unknown;
  readonly recommendation_beginner?: unknown;
  readonly reasoning_chain?: unknown;
}

interface NarrateResponse {
  readonly ok?: unknown;
  readonly source?: unknown;
  readonly corners?: unknown;
  readonly summary?: unknown;
}

const REASONING_STEPS = ["cause", "consequences", "recommendation", "evidence"] as const;

function fixture(base: CoachingReport): CoachingReport {
  return { ...base, narrative_source: "fixture" };
}

function toReasoningChain(value: unknown): ReadonlyArray<ReasoningChainStep> | undefined {
  if (!Array.isArray(value)) return undefined;
  const steps = value
    .filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null)
    .map((s) => ({
      step: (REASONING_STEPS as ReadonlyArray<string>).includes(s.step as string)
        ? (s.step as ReasoningChainStep["step"])
        : ("recommendation" as const),
      label: typeof s.label === "string" ? s.label : "",
      content: typeof s.content === "string" ? s.content : "",
    }))
    .filter((s) => s.content.trim() !== "");
  return steps.length > 0 ? steps : undefined;
}

/**
 * Merge live corner prose into the base report by index. The route pins
 * each returned corner's name to the input name, so index alignment is
 * authoritative; a per-corner guard still falls back to the base prose
 * for any corner the model returned empty.
 */
function merge(
  base: CoachingReport,
  liveCorners: ReadonlyArray<LiveCornerPayload>,
): CoachingReport {
  let appliedCount = 0;
  const corners: CornerInsight[] = base.corners.map((corner, i) => {
    const live = liveCorners[i];
    if (
      live === undefined ||
      typeof live.recommendation !== "string" ||
      live.recommendation.trim() === ""
    ) {
      return corner;
    }
    appliedCount += 1;
    const chain = toReasoningChain(live.reasoning_chain);
    return {
      ...corner,
      recommendation: live.recommendation,
      recommendation_beginner:
        typeof live.recommendation_beginner === "string" &&
        live.recommendation_beginner.trim() !== ""
          ? live.recommendation_beginner
          : corner.recommendation_beginner,
      // Keep the base chain when the model omitted one (undefined leaves
      // the fixture chain intact; a present chain replaces it).
      reasoning_chain: chain ?? corner.reasoning_chain,
    };
  });
  // Only claim "granite-live" when at least one corner actually received live
  // prose. An ok:true response whose corners are all empty leaves 100% base
  // prose, which is a fixture, not live output; label it honestly.
  if (appliedCount === 0) return fixture(base);
  return { ...base, corners, narrative_source: "granite-live" };
}

export async function applyLiveNarrative(
  base: CoachingReport,
  debrief: string,
  options?: { readonly signal?: AbortSignal },
): Promise<CoachingReport> {
  try {
    const response = await fetch(NARRATE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: options?.signal,
      body: JSON.stringify({
        driver_id: base.driver_id,
        debrief,
        corners: base.corners.map((c) => ({
          name: c.name,
          sector: c.sector,
          current_delta_s: c.current_delta_s,
        })),
        tuning_delta: {
          parameter: base.tuning_delta.parameter,
          current: base.tuning_delta.current,
          recommended: base.tuning_delta.recommended,
          unit: base.tuning_delta.unit,
        },
      }),
    });
    if (!response.ok) return fixture(base);
    const data = (await response.json()) as NarrateResponse;
    if (data.ok !== true || !Array.isArray(data.corners) || data.corners.length === 0) {
      return fixture(base);
    }
    return merge(base, data.corners as ReadonlyArray<LiveCornerPayload>);
  } catch {
    // Network error, abort, or malformed JSON: degrade honestly.
    return fixture(base);
  }
}

/**
 * Wave-79: upgrade an already-backend-live report (real backend numbers +
 * deterministic backend prose) with live Granite corner prose from the same
 * /api/coaching/narrate route, keeping the backend numbers verbatim. On
 * success the provenance becomes "backend-granite-live" (numbers
 * backend-computed, narrative live Granite). On ANY failure the backend
 * report is returned unchanged, so it stays honestly "backend-live" (real
 * numbers, deterministic prose) and the canonical demo never breaks or
 * downgrades to a fixture.
 */
export async function applyLiveNarrativeToBackend(
  backendReport: CoachingReport,
  debrief: string,
  options?: { readonly signal?: AbortSignal },
): Promise<CoachingReport> {
  const upgraded = await applyLiveNarrative(backendReport, debrief, options);
  if (upgraded.narrative_source === "granite-live") {
    // Live prose merged over the real backend numbers: relabel so the
    // provenance reflects that both layers are live.
    return { ...upgraded, narrative_source: "backend-granite-live" };
  }
  // No live prose landed (route down, empty, or malformed). Keep the backend
  // report as-is; the decoder already stamped it "backend-live".
  return backendReport;
}
