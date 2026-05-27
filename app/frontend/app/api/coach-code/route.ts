/**
 * POST /api/coach-code
 *
 * Wave-46 D-058 Phase 6.2 NEW route. Granite 4.1 8B Instruct (via
 * OpenRouter) code-feedback surface for engineers building telemetry
 * tools. Demonstrates breadth of the IBM Granite stack beyond the
 * race-engineer narrator path (Granite Code 8B was DEPRECATED per HF
 * model card 2026; Granite 4.1 8B mainline supersedes with HumanEval
 * 87.2% pass@1).
 *
 * Hook contract:
 *   - Request body: `{ "code": string, "question": string }`
 *   - Response: JSON `CoachCodeResponse` with engine + model + feedback + tokens + retry_count + violation_summary
 *   - Status: 200 on success; 4xx on validation; 5xx on backend failure
 *
 * HARD-COMPLIANCE scrubber applied server-side per
 * `feedback_llm_output_compliance_scrubber.md` so any hallucinated FIA
 * Article / COA Section regulatory anchors in Granite output get
 * normalized to "FIA Appendix L per the published revision" /
 * "the COA simultaneity gate" before the client receives them.
 *
 * Cascade-#47 wave-46 OVERRIDE-steal Self-Correcting Retry Loop (per
 * project_apex_override_competitor.md steal #1, lifted from OVERRIDE
 * core/pipeline.py:118-132). On detection of forbidden-anchor patterns
 * in the LLM output, append a `# Retry directive` system message listing
 * the violated patterns and regenerate. Bounded budget of 2 retries =
 * 3 LLM calls worst case. After the budget exhausts the scrubber still
 * fires as defense in depth; the retry_count + violation_summary
 * surface the self-correction history to consumers so violations are
 * not silently hidden.
 *
 * Security guards:
 *   - Hard cap on code body length (32 KB) prevents adversarial gigantic prompts
 *   - Question + code both required non-empty (400 missing_field otherwise)
 *   - NO code execution. Returns text feedback only.
 *   - Retry budget bounds runaway token cost (max 3 LLM calls per request)
 *
 * Canned-fallback: when OPENROUTER_API_KEY env var is unset, returns a
 * canned coach-code response so /coach-code page renders end-to-end on
 * a fresh clone without an API key. Real Granite 4.1 8B fires when key
 * is present (same pattern as /api/openrouter-stream production-phase).
 */

import type { NextRequest } from "next/server";

import type { CoachCodeResponse } from "../../../../shared/types";
import { openRouterChatCompletion, type ChatMessage } from "../../../lib/openrouter-client";
import {
  detectInventedRegulatoryAnchors,
  scrubInventedRegulatoryAnchors,
} from "../../../lib/scrub-regulatory-anchors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CODE_BYTES = 32 * 1024;
const MAX_QUESTION_BYTES = 4 * 1024;
const DEFAULT_MODEL = "ibm-granite/granite-4.1-8b-instruct";
const MAX_RETRIES = 2;

interface CoachCodeRequestBody {
  readonly code?: unknown;
  readonly question?: unknown;
}

function isValidString(value: unknown, maxBytes: number): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  if (new TextEncoder().encode(trimmed).length > maxBytes) return false;
  return true;
}

const SYSTEM_PROMPT = [
  "You are APEX-coach-code, a code-feedback agent built on Granite 4.1 8B Instruct.",
  "You explain how telemetry-pipeline code interacts with the APEX three-layer architecture",
  "(frozen Granite TimeSeries TTM forecaster + V2 cvxpylayers projector + Granite Guardian audit).",
  "You provide concise technical feedback (under 400 words).",
  "Hard rules:",
  "  - Do NOT execute code. You return text feedback only.",
  "  - Do NOT invent FIA Article numbers or COA Section numbers. Reference only 'FIA Appendix L per the published revision' + 'the COA simultaneity gate' if regulatory anchors are needed.",
  "  - Be specific. Cite line numbers or function names from the user's code when possible.",
  "  - Conditional phrasing on physics or performance claims ('forecast envelope' not 'guaranteed pace').",
].join("\n");

const CANNED_FEEDBACK = [
  "Reviewing your snippet against the APEX three-layer architecture.",
  "",
  "Stage 1 (forecaster): your code reads telemetry at 50 Hz. Aggregate to 1 Hz mini-sector tensor of shape (B, 30, 14) before invoking the TTM forecaster per the shared/contracts/shapes.py canonical channel ordering. The TTM expects the (B, 30, 14) shape per D-016 channel expansion.",
  "",
  "Stage 2 (projector): the V2 cvxpylayers projector at app/backend/apex/physics/projection.py expects the TTM output verbatim. Pass through without resampling. Per D-050 byte-equality lock, the V1 NumPy validator + V2 cvxpylayers ceiling emit byte-identical violation strings modulo the leading ENGINE header line; do not modify the .to_text() output.",
  "",
  "Stage 3 (Guardian audit): serialize via PhysicsViolationLog (app/backend/apex/shared/contracts/violations.py) + pass to Guardian audit. The Guardian custom-rule registry (D-024 physics-confidence detector) consumes the serialized log + emits a Verdict.",
  "",
  "Compliance notes: every regulatory anchor in the coaching output should cite FIA Appendix L per the published revision (do not invent Article numbers). The COA simultaneity gate handles the adaptive-driver brake-throttle overlap path.",
  "",
  "Suggestion: extract the aggregation step into a separate testable function so the 50 Hz -> 1 Hz mini-sector transform has its own unit test against the canonical CHANNELS tuple in shapes.py.",
].join("\n");

const COACH_CODE_SWAP_POINT =
  "app/frontend/app/api/coach-code/route.ts -> openrouter-client.ts -> ibm-granite/granite-4.1-8b-instruct via OpenRouter (D-058 wave-46 Phase 6.2; HEAD-wired, no Vinh-side proxy)";

function cannedPayload(t0: number): CoachCodeResponse {
  return {
    engine: "coach-code-canned-fallback",
    compute_ms: Math.round(performance.now() - t0),
    model: DEFAULT_MODEL,
    feedback: scrubInventedRegulatoryAnchors(CANNED_FEEDBACK),
    prompt_tokens: 0,
    completion_tokens: 0,
    swap_point: COACH_CODE_SWAP_POINT,
    retry_count: 0,
    violation_summary: [[]],
  };
}

function buildRetryDirective(violations: ReadonlyArray<string>): string {
  return [
    "# Retry directive",
    "",
    "Your previous response contained forbidden regulatory-anchor patterns:",
    ...violations.map((label) => `  - ${label}`),
    "",
    "Regenerate the response WITHOUT inventing any FIA Article numbers, COA Section numbers, Appendix § references, or numeric regulation citations.",
    "Reference only 'FIA Appendix L per the published revision' for FIA anchors and 'the COA simultaneity gate' for COA anchors.",
    "All technical analysis content from your previous response should remain; only the forbidden regulatory anchors must be replaced.",
  ].join("\n");
}

export async function POST(req: NextRequest): Promise<Response> {
  const t0 = performance.now();
  let body: CoachCodeRequestBody;
  try {
    body = (await req.json()) as CoachCodeRequestBody;
  } catch {
    return Response.json(
      { error: "invalid_json", message: "Expected JSON body { code: string, question: string }." },
      { status: 400 },
    );
  }
  if (!isValidString(body.code, MAX_CODE_BYTES)) {
    return Response.json(
      {
        error: "missing_code",
        message: `Expected non-empty 'code' string (max ${MAX_CODE_BYTES} bytes).`,
      },
      { status: 400 },
    );
  }
  if (!isValidString(body.question, MAX_QUESTION_BYTES)) {
    return Response.json(
      {
        error: "missing_question",
        message: `Expected non-empty 'question' string (max ${MAX_QUESTION_BYTES} bytes).`,
      },
      { status: 400 },
    );
  }
  const code = body.code.trim();
  const question = body.question.trim();

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.length === 0) {
    const payload = cannedPayload(t0);
    return Response.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Coach-Code-Engine": payload.engine,
      },
    });
  }

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Code under review:\n\n\`\`\`\n${code}\n\`\`\`\n\nQuestion: ${question}`,
    },
  ];

  let rawFeedback = "";
  let promptTokens = 0;
  let completionTokens = 0;
  let model = DEFAULT_MODEL;
  const violationSummary: string[][] = [];
  let retryCount = 0;

  try {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const completion = await openRouterChatCompletion({
        messages,
        max_tokens: 800,
        temperature: 0.3,
      });
      rawFeedback = completion.choices[0]?.message?.content ?? "";
      promptTokens += completion.usage?.prompt_tokens ?? 0;
      completionTokens += completion.usage?.completion_tokens ?? 0;
      model = completion.model ?? DEFAULT_MODEL;

      const violations = detectInventedRegulatoryAnchors(rawFeedback);
      const attemptLabels = violations.map((v) => v.pattern);
      violationSummary.push(attemptLabels);

      if (violations.length === 0) break;

      if (attempt < MAX_RETRIES) {
        retryCount += 1;
        messages.push({ role: "assistant", content: rawFeedback });
        messages.push({
          role: "system",
          content: buildRetryDirective(attemptLabels),
        });
      }
    }

    const scrubbed = scrubInventedRegulatoryAnchors(rawFeedback);
    const payload: CoachCodeResponse = {
      engine: "coach-code-real",
      compute_ms: Math.round(performance.now() - t0),
      model,
      feedback: scrubbed,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      swap_point: COACH_CODE_SWAP_POINT,
      retry_count: retryCount,
      violation_summary: violationSummary,
    };
    return Response.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Coach-Code-Engine": payload.engine,
        "X-Apex-Coach-Code-Retry-Count": String(retryCount),
      },
    });
  } catch (err) {
    console.warn("[apex/coach-code] OpenRouter call failed; falling back to canned", err);
    const payload = cannedPayload(t0);
    return Response.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Apex-Coach-Code-Engine": payload.engine,
        "X-Apex-Coach-Code-Fallback": "openrouter-error",
      },
    });
  }
}
