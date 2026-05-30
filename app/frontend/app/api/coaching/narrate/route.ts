/**
 * POST /api/coaching/narrate
 *
 * Wave-64 live-coaching wiring. Generates the corner-by-corner coaching
 * NARRATIVE for the /analyze surface live, via Granite 4.1 8B Instruct
 * (the same OpenRouter-wired model that already powers the AICopilotChat
 * route). This converts the headline "APEX analyzes your session" loop
 * from a 100% canned fixture into a genuinely Granite-generated coaching
 * pass over the driver's typed debrief.
 *
 * Honesty contract (load-bearing; this is the project's differentiator):
 *   - The model writes COACHING PROSE only. It is given the structured
 *     deltas (each corner's name, sector, and current_delta_s) + the
 *     driver's debrief, and asked to ground its advice in those numbers.
 *   - It NEVER produces the numbers themselves. current_delta_s, the
 *     forecast envelope, and the tuning delta stay sourced from the
 *     physics / fixture layer on the client; this route does not return
 *     them, so the LLM cannot fabricate telemetry.
 *   - It NEVER asserts FIA Article / COA Section numbers. The system
 *     prompt forbids it AND every returned text field is run through the
 *     canonical server-side scrubber (`scrubInventedRegulatoryAnchors`)
 *     before it leaves this route, matching the /api/openrouter-stream +
 *     /api/coach-code defense-in-depth invariant.
 *   - The FIA / COA citations themselves are NOT generated here; they
 *     stay fixture-sourced on the client report, so no fabricated
 *     regulatory anchor can reach the provenance footer.
 *
 * Phase gate (mirrors /api/openrouter-stream): live generation requires
 * BOTH OPENROUTER_API_KEY and OPENROUTER_MODEL populated. When either is
 * absent, OR the model returns unparseable JSON after a bounded retry, OR
 * the upstream call fails, the route returns `{ ok: false, source }` with
 * a 200 status. The client's `applyLiveNarrative` reads `ok: false` and
 * degrades honestly to the authored fixture narrative (labelled
 * "fixture"), so the analyze surface never breaks.
 *
 * Wire contract:
 *   Request body (JSON):
 *     {
 *       driver_id: string,
 *       debrief: string,
 *       corners: Array<{ name: string, sector: 1|2|3, current_delta_s: number }>,
 *       tuning_delta: { parameter: string, current: number, recommended: number, unit: string }
 *     }
 *   Response 200 (live):
 *     { ok: true, source: "granite-live",
 *       corners: Array<{ name, recommendation, recommendation_beginner,
 *                        reasoning_chain: Array<{ step, label, content }> }>,
 *       summary: string }
 *   Response 200 (degraded):
 *     { ok: false, source: "stub" | "upstream-error" | "parse-error" }
 *   Response 400: invalid request body (text/plain).
 */

import {
  openRouterChatCompletion,
  type ChatMessage,
} from "../../../../lib/openrouter-client";
import { scrubInventedRegulatoryAnchors } from "../../../../lib/scrub-regulatory-anchors";

// Node.js runtime required for the OpenRouter fetch wrapper's connection
// lifetime + env access (same rationale as /api/openrouter-stream).
export const runtime = "nodejs";

// Bounded retry: 1 retry on a JSON parse failure = 2 LLM calls worst case.
// The model occasionally wraps its JSON in prose or a ```json fence; a
// single re-ask with an explicit "JSON only" directive recovers most of
// those without unbounded budget exposure.
const NARRATE_MAX_RETRIES = 1;

const REASONING_STEPS = ["cause", "consequences", "recommendation", "evidence"] as const;
type ReasoningStep = (typeof REASONING_STEPS)[number];

interface NarrateCornerInput {
  readonly name: string;
  readonly sector: number;
  readonly current_delta_s: number;
}

interface NarrateRequestBody {
  readonly driver_id?: unknown;
  readonly debrief?: unknown;
  readonly corners?: unknown;
  readonly tuning_delta?: unknown;
}

interface ValidatedRequest {
  readonly driver_id: string;
  readonly debrief: string;
  readonly corners: ReadonlyArray<NarrateCornerInput>;
  readonly tuning_delta: {
    readonly parameter: string;
    readonly current: number;
    readonly recommended: number;
    readonly unit: string;
  };
}

function isCornerInput(value: unknown): value is NarrateCornerInput {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.name === "string" &&
    typeof c.sector === "number" &&
    typeof c.current_delta_s === "number" &&
    Number.isFinite(c.current_delta_s)
  );
}

function validateBody(body: NarrateRequestBody): ValidatedRequest | null {
  if (typeof body.driver_id !== "string" || body.driver_id.trim() === "") return null;
  if (typeof body.debrief !== "string") return null;
  if (!Array.isArray(body.corners) || body.corners.length === 0) return null;
  if (!body.corners.every(isCornerInput)) return null;
  const t = body.tuning_delta;
  if (typeof t !== "object" || t === null) return null;
  const td = t as Record<string, unknown>;
  if (
    typeof td.parameter !== "string" ||
    typeof td.current !== "number" ||
    typeof td.recommended !== "number" ||
    typeof td.unit !== "string"
  ) {
    return null;
  }
  return {
    driver_id: body.driver_id,
    debrief: body.debrief,
    // Re-map to strip any extra client-sent fields (defense: the LLM only
    // sees name/sector/delta, never any speculative telemetry the client
    // might add later).
    corners: body.corners.map((c) => ({
      name: c.name,
      sector: c.sector,
      current_delta_s: c.current_delta_s,
    })),
    tuning_delta: {
      parameter: td.parameter,
      current: td.current,
      recommended: td.recommended,
      unit: td.unit,
    },
  };
}

const SYSTEM_PROMPT = [
  "You are the APEX AI race engineer, coaching an adaptive (hand-controls) racing driver.",
  "You are given the driver's written debrief and a list of corners. Each corner has a name, a sector (1-3), and current_delta_s: the driver's time lost or gained versus the reference line, in seconds (positive = slower than reference, negative = faster).",
  "Write corner-by-corner coaching that responds to the driver's debrief and is grounded in each corner's current_delta_s.",
  "",
  "HARD RULES:",
  "1. Do NOT invent or state any numeric telemetry beyond the current_delta_s you are given (no lap times, speeds, g-loads, percentages, distances, or temperatures you were not given). You may restate the given delta.",
  "2. NEVER invent FIA Article numbers or COA Section numbers. Refer to regulatory grounding only as 'FIA Appendix L per the published revision' and 'the COA simultaneity gate' or 'the COA-derived c_overlap flag'. Use no numeric Article or Section identifiers.",
  "3. Tone: editorial-paddock. Quiet authority. No marketing words, no exclamation marks, no hype.",
  "4. Keep the driver's adaptive hand-controls context in mind: brake-throttle simultaneity is governed by the COA, not assumed illegal.",
  "",
  "Output STRICT JSON ONLY. No prose before or after, no markdown fence. The shape is:",
  '{"corners":[{"name":string,"recommendation":string,"recommendation_beginner":string,"reasoning_chain":[{"step":"cause"|"consequences"|"recommendation"|"evidence","label":string,"content":string}]}],"summary":string}',
  "Return exactly one corner object per input corner, in the same order, with the same name. 'recommendation' is 2-3 expert sentences. 'recommendation_beginner' is 1-2 plain-language sentences. 'reasoning_chain' has 2-4 steps. 'summary' is one sentence over the whole session.",
].join("\n");

interface LiveCorner {
  readonly name: string;
  readonly recommendation: string;
  readonly recommendation_beginner: string;
  readonly reasoning_chain: ReadonlyArray<{
    readonly step: ReasoningStep;
    readonly label: string;
    readonly content: string;
  }>;
}

interface LiveNarrative {
  readonly corners: ReadonlyArray<LiveCorner>;
  readonly summary: string;
}

/**
 * Defensive JSON extraction: the model is told "JSON only" but may still
 * wrap output in a ```json fence or stray prose. Slice from the first `{`
 * to the last `}` before parsing. Returns null on any failure so the
 * caller falls through to retry / honest degrade.
 */
function extractJson(raw: string): unknown {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

function coerceStep(value: unknown): ReasoningStep {
  return REASONING_STEPS.includes(value as ReasoningStep)
    ? (value as ReasoningStep)
    : "recommendation";
}

/**
 * Validate the parsed object against the expected shape AND scrub every
 * free-text field through the regulatory-anchor scrubber before it can
 * leave the route. Returns null if the shape does not match the requested
 * corner count / names so the caller degrades honestly rather than
 * rendering a mismatched merge.
 */
function validateAndScrub(
  parsed: unknown,
  expected: ReadonlyArray<NarrateCornerInput>,
): LiveNarrative | null {
  if (typeof parsed !== "object" || parsed === null) return null;
  const p = parsed as Record<string, unknown>;
  if (!Array.isArray(p.corners) || p.corners.length !== expected.length) return null;

  const corners: LiveCorner[] = [];
  for (let i = 0; i < p.corners.length; i++) {
    const c = p.corners[i] as Record<string, unknown>;
    if (typeof c !== "object" || c === null) return null;
    if (typeof c.recommendation !== "string" || c.recommendation.trim() === "") return null;
    const beginner =
      typeof c.recommendation_beginner === "string" && c.recommendation_beginner.trim() !== ""
        ? c.recommendation_beginner
        : c.recommendation;
    const chainRaw = Array.isArray(c.reasoning_chain) ? c.reasoning_chain : [];
    const reasoning_chain = chainRaw
      .filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null)
      .map((s) => ({
        step: coerceStep(s.step),
        label: scrubInventedRegulatoryAnchors(typeof s.label === "string" ? s.label : ""),
        content: scrubInventedRegulatoryAnchors(typeof s.content === "string" ? s.content : ""),
      }))
      .filter((s) => s.content.trim() !== "");
    corners.push({
      // Pin the name to the server-known input name so a model rename
      // cannot drift the client-side merge key.
      name: expected[i].name,
      recommendation: scrubInventedRegulatoryAnchors(c.recommendation),
      recommendation_beginner: scrubInventedRegulatoryAnchors(beginner),
      reasoning_chain,
    });
  }
  const summary =
    typeof p.summary === "string" ? scrubInventedRegulatoryAnchors(p.summary) : "";
  return { corners, summary };
}

function jsonResponse(payload: unknown, phase: string): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Apex-Coaching-Phase": phase,
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  let body: NarrateRequestBody;
  try {
    body = (await request.json()) as NarrateRequestBody;
  } catch {
    return new Response("apex.coaching-narrate: request body must be valid JSON.", {
      status: 400,
    });
  }

  const validated = validateBody(body);
  if (validated === null) {
    return new Response(
      "apex.coaching-narrate: body must include driver_id, debrief, non-empty corners[], and tuning_delta.",
      { status: 400 },
    );
  }

  // Phase gate: both env vars required (matches /api/openrouter-stream).
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  const productionReady =
    apiKey !== undefined && apiKey.trim() !== "" && model !== undefined && model.trim() !== "";

  if (!productionReady) {
    const missingApiKey = apiKey === undefined || apiKey.trim() === "";
    const missingModel = model === undefined || model.trim() === "";
    if (missingApiKey || missingModel) {
      console.warn(
        `apex.coaching-narrate: env incomplete; client falls back to fixture narrative (missing: ${
          [missingApiKey ? "OPENROUTER_API_KEY" : "", missingModel ? "OPENROUTER_MODEL" : ""]
            .filter(Boolean)
            .join(", ")
        })`,
      );
    }
    return jsonResponse({ ok: false, source: "stub" }, "stub-env-missing");
  }

  const userPayload = JSON.stringify({
    debrief: validated.debrief,
    corners: validated.corners,
    tuning_delta: validated.tuning_delta,
  });

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPayload },
  ];

  try {
    let live: LiveNarrative | null = null;
    for (let attempt = 0; attempt <= NARRATE_MAX_RETRIES; attempt++) {
      const response = await openRouterChatCompletion(
        { messages, temperature: 0.3, max_tokens: 1400 },
        { signal: request.signal },
      );
      const rawText = response.choices[0]?.message.content ?? "";
      if (rawText.trim().length === 0) {
        throw new Error(
          `apex.coaching-narrate: empty completion on attempt ${attempt} (choices=${response.choices?.length ?? 0})`,
        );
      }
      const parsed = extractJson(rawText);
      live = parsed === null ? null : validateAndScrub(parsed, validated.corners);
      if (live !== null) break;
      if (attempt < NARRATE_MAX_RETRIES) {
        messages.push({ role: "assistant", content: rawText });
        messages.push({
          role: "system",
          content:
            "Your previous reply was not valid JSON in the required shape. Reply again with STRICT JSON ONLY (no markdown fence, no prose), exactly one corner object per input corner in order, matching the schema in the first system message.",
        });
      }
    }

    if (live === null) {
      console.error("apex.coaching-narrate: JSON parse failed after retry budget; client degrades to fixture");
      return jsonResponse({ ok: false, source: "parse-error" }, "parse-error");
    }

    return jsonResponse(
      { ok: true, source: "granite-live", corners: live.corners, summary: live.summary },
      "real",
    );
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    const logger = isAbort ? console.warn : console.error;
    logger("apex.coaching-narrate: upstream failure; client degrades to fixture narrative", {
      message: err instanceof Error ? err.message : String(err),
      errorName: err instanceof Error ? err.name : typeof err,
    });
    return jsonResponse({ ok: false, source: "upstream-error" }, "upstream-error");
  }
}
