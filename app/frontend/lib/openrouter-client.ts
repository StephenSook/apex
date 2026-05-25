/**
 * Server-side OpenRouter client wrapper. Fetches the OpenAI-compatible
 * `/chat/completions` endpoint with env-var-loaded API key + base URL +
 * model + leaderboard-attribution headers. Wraps in retry policy +
 * AbortController timeout per the cascade-#11 hook-hardening pattern
 * (Symbol.for timeout-abort sentinel + structured error context).
 *
 * Wave-42 Lane F.C close-out per `docs/vinh-phase-1-handoff.md` Q3
 * Phase 1 task ownership split (Stephen owns 1.7 OpenRouter API
 * plumbing). Wave-43 D2.x hardened via cold-review-2 closures
 * (D2.1 monotonic-counter pattern + D2.2 array+null error shape +
 * D2.3 retry-body cancel + warn logging + D2.7 drop stream:boolean +
 * D2.8 abort propagation); wave-44 Phase 4.1 + 4.2 closed delay()
 * AbortSignal listener leak + decodeChatCompletionResponse partial-
 * validation hardening. NOT a client-bundled module: invoked from
 * Next.js API routes / server actions; API key never enters the
 * client bundle.
 *
 * Retry policy:
 *   - 5xx response: exponential backoff (200ms base; cap 1600ms;
 *     attempt-indexed); default 3 retries before throwing.
 *   - 429 response: 1 retry honoring Retry-After header (capped at
 *     60 seconds for safety).
 *   - Other 4xx: no retry; throws with structured error message.
 *   - Network error / fetch throw: no retry; surfaces to caller.
 *
 * Timeout: 30 seconds default. Symbol.for sentinel identity for
 * timeout-abort discrimination from genuine abort errors. Per the
 * cascade-#11 NIT N1 pattern.
 *
 * Cross-references:
 *  - `app/frontend/lib/use-tri-agent-critic.ts` (cascade-#11 hook
 *    hardening reference for the AbortController + Symbol.for pattern)
 *  - `app/frontend/lib/api-decode.ts` (decoder seam + version checks)
 *  - `docs/vinh-phase-1-handoff.md` (Q2 + Q3 Phase 1 decisions)
 *  - `.env.example` (env-var slot contract)
 */

export interface ChatMessage {
  readonly role: "system" | "user" | "assistant";
  readonly content: string;
}

// Wave-43 D2.7 close-out per cold-review-2 type-design H4 + codex HIGH:
// dropped `stream?: boolean` from ChatCompletionRequest. Field was
// exposed in the public type surface + serialized into fetch body but
// the function unconditionally calls `await response.json()` which
// breaks if OpenRouter returns SSE-shaped body for stream:true. Future
// stream variant lives in a separate `openRouterChatCompletionStream`
// function. Single-shot is the only contract this helper exposes.
export interface ChatCompletionRequest {
  readonly model?: string;
  readonly messages: ReadonlyArray<ChatMessage>;
  readonly temperature?: number;
  readonly max_tokens?: number;
}

export interface ChatCompletionChoice {
  readonly index: number;
  readonly message: ChatMessage;
  readonly finish_reason: "stop" | "length" | "content_filter" | "tool_calls" | null;
}

export interface ChatCompletionUsage {
  readonly prompt_tokens: number;
  readonly completion_tokens: number;
  readonly total_tokens: number;
}

export interface ChatCompletionResponse {
  readonly id: string;
  readonly model: string;
  readonly created: number;
  readonly choices: ReadonlyArray<ChatCompletionChoice>;
  /**
   * Wave-43 D2.4 close-out per cold-review-2 silent-failure H-R2-4:
   * usage is OPTIONAL because some OpenRouter-proxied providers omit
   * the usage breakdown on streaming-disabled single-shot responses.
   * Consumers must guard with `response.usage?.total_tokens ?? 0`.
   */
  readonly usage?: ChatCompletionUsage;
}

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES_5XX = 3;
const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_TEMPERATURE = 0.2;
const DEFAULT_MAX_TOKENS = 1024;
const MAX_RETRY_AFTER_MS = 60_000;
const BACKOFF_BASE_MS = 200;
const BACKOFF_CAP_MS = 1600;

const TIMEOUT_REASON: symbol = Symbol.for("apex.openrouter-client.timeout");

function loadEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === null || value.trim() === "") {
    throw new Error(
      `apex.openrouter-client: env var ${name} is required but missing or empty. Populate per .env.example.`,
    );
  }
  return value;
}

function loadEnv(name: string, fallback?: string): string | undefined {
  const value = process.env[name];
  if (value === undefined || value === null || value.trim() === "") {
    return fallback;
  }
  return value;
}

/**
 * Wave-43 cascade-#15 F2 round-2 HIGH#3 close-out per codex
 * adversarial: abortable delay that honors the consumer signal during
 * retry backoff windows. Prior delay() ran setTimeout uninterruptibly
 * for up to BACKOFF_CAP_MS (60s) regardless of signal.aborted state,
 * so a consumer that disconnected mid-flight kept the server request
 * pinned until the full backoff ladder ran out. The new shape rejects
 * the delay promise immediately on signal abort so the surrounding
 * retry loop unwinds + the OpenRouter fetch budget is freed.
 */
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal !== undefined && signal.aborted) {
      reject(new DOMException(String(signal.reason ?? "aborted"), "AbortError"));
      return;
    }
    // Wave-44 Phase 4.1 type-design-analyzer BLOCKER B1 close-out:
    // remove abort listener on resolve so it does not leak across
    // multiple retry-loop iterations sharing the same consumer signal.
    // Prior shape used `{ once: true }` which only removed AFTER the
    // listener fired; if setTimeout resolved first (no abort), the
    // listener stayed registered against the long-lived signal +
    // accumulated N listeners across N retries.
    let onAbort: (() => void) | null = null;
    const handle = setTimeout(() => {
      if (signal !== undefined && onAbort !== null) {
        signal.removeEventListener("abort", onAbort);
      }
      resolve();
    }, ms);
    if (signal !== undefined) {
      onAbort = () => {
        clearTimeout(handle);
        reject(new DOMException(String(signal.reason ?? "aborted"), "AbortError"));
      };
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

function backoffMs(attemptZeroIndexed: number): number {
  const ms = BACKOFF_BASE_MS * Math.pow(2, attemptZeroIndexed);
  return Math.min(BACKOFF_CAP_MS, ms);
}

export interface OpenRouterClientOptions {
  readonly timeoutMs?: number;
  readonly maxRetries5xx?: number;
  /**
   * Wave-43 D2.8 close-out per cold-review-2 codex M1: consumer signal
   * threaded into the fetch so server-side route handlers can pass
   * request.signal + the OpenRouter call aborts when the client
   * disconnects mid-flight (prevents server-side work continuing
   * against a dead consumer). Symbol.for timeout-abort path remains
   * separate from this consumer-signal path.
   */
  readonly signal?: AbortSignal;
}

// Wave-42 cascade-#12 BLOCKER close-out (silent-failure-hunter B3 +
// type-design-analyzer H3 + codex HIGH cross-corroboration). The
// prior shape used `(await response.json()) as ChatCompletionResponse`
// which is the unsafe-cast-at-JSON.parse-boundary anti-pattern that
// `app/frontend/lib/api-decode.ts` exists to prevent (file header
// explicitly calls out this pattern as "the single highest-impact
// silent-failure surface in the codebase"). Wire-side validator
// added here scoped to the openrouter-client module since this is
// the only consumer of the ChatCompletionResponse shape.
function isRecord(raw: unknown): raw is Record<string, unknown> {
  return typeof raw === "object" && raw !== null && !Array.isArray(raw);
}

function decodeChatCompletionResponse(raw: unknown): ChatCompletionResponse {
  if (!isRecord(raw)) {
    throw new Error(
      `apex.openrouter-client: response body must be object; got ${typeof raw}.`,
    );
  }
  // Some OpenAI-compatible providers (Anthropic via OpenRouter, etc) emit
  // HTTP 200 with `{ error: { message: "..." } }` for content_filter
  // rejections. Surface as structured error rather than letting the
  // missing `choices` array crash downstream consumers.
  //
  // Wave-43 D2.2 close-out per cold-review-2 silent-failure H-R2-2:
  // guard `raw.error !== null` explicitly (treating null as not-an-error
  // because some providers serialize `{error: null}` on success) +
  // handle array-form `{error: [{message: "..."}]}` (TogetherAI variant).
  // JSON.stringify wrapped in try/catch since circular refs can throw.
  if (raw.error !== undefined && raw.error !== null) {
    let message: string;
    if (Array.isArray(raw.error)) {
      const first = raw.error[0];
      if (typeof first === "object" && first !== null && "message" in first && typeof (first as Record<string, unknown>).message === "string") {
        message = (first as Record<string, unknown>).message as string;
      } else {
        try {
          message = JSON.stringify(raw.error);
        } catch {
          message = "<unserializable error array>";
        }
      }
    } else if (typeof raw.error === "object") {
      const errorObj = raw.error as { message?: unknown };
      if (typeof errorObj.message === "string") {
        message = errorObj.message;
      } else {
        try {
          message = JSON.stringify(raw.error);
        } catch {
          message = "<unserializable error object>";
        }
      }
    } else {
      message = String(raw.error);
    }
    throw new Error(`apex.openrouter-client: provider returned error: ${message}`);
  }
  if (typeof raw.id !== "string") {
    throw new Error(
      `apex.openrouter-client: response missing id string; got ${typeof raw.id}.`,
    );
  }
  if (typeof raw.model !== "string") {
    throw new Error(
      `apex.openrouter-client: response missing model string; got ${typeof raw.model}.`,
    );
  }
  if (!Array.isArray(raw.choices)) {
    throw new Error(
      `apex.openrouter-client: response missing choices array; got ${typeof raw.choices}.`,
    );
  }
  if (raw.choices.length === 0) {
    throw new Error(`apex.openrouter-client: response choices array empty.`);
  }
  for (const [idx, choice] of raw.choices.entries()) {
    if (!isRecord(choice)) {
      throw new Error(
        `apex.openrouter-client: response.choices[${idx}] must be object; got ${typeof choice}.`,
      );
    }
    const choiceRec = choice as Record<string, unknown>;
    if (!isRecord(choiceRec.message)) {
      throw new Error(
        `apex.openrouter-client: response.choices[${idx}].message must be object.`,
      );
    }
    const messageRec = choiceRec.message as Record<string, unknown>;
    if (typeof messageRec.content !== "string") {
      throw new Error(
        `apex.openrouter-client: response.choices[${idx}].message.content must be string.`,
      );
    }
    // Wave-44 Phase 4.2 type-design-analyzer H1 close-out: validate the
    // remaining declared fields instead of casting-through. Prior shape
    // validated only id + model + choices[].message.content; finish_reason
    // literal union + index numeric + message.role literal + optional
    // usage shape passed through unchecked. Provider regressions on
    // finish_reason "tool_use" or similar would silently flow through.
    if (typeof choiceRec.index !== "number") {
      throw new Error(
        `apex.openrouter-client: response.choices[${idx}].index must be number; got ${typeof choiceRec.index}.`,
      );
    }
    const role = messageRec.role;
    if (role !== "assistant" && role !== "user" && role !== "system") {
      throw new Error(
        `apex.openrouter-client: response.choices[${idx}].message.role must be assistant|user|system; got ${JSON.stringify(role)}.`,
      );
    }
    const finishReason = choiceRec.finish_reason;
    if (
      finishReason !== "stop"
      && finishReason !== "length"
      && finishReason !== "content_filter"
      && finishReason !== "tool_calls"
      && finishReason !== null
    ) {
      throw new Error(
        `apex.openrouter-client: response.choices[${idx}].finish_reason must be stop|length|content_filter|tool_calls|null; got ${JSON.stringify(finishReason)}.`,
      );
    }
  }
  if (typeof raw.created !== "number") {
    throw new Error(
      `apex.openrouter-client: response.created must be number; got ${typeof raw.created}.`,
    );
  }
  if (raw.usage !== undefined) {
    if (!isRecord(raw.usage)) {
      throw new Error(
        `apex.openrouter-client: response.usage must be object when present; got ${typeof raw.usage}.`,
      );
    }
    const usageRec = raw.usage as Record<string, unknown>;
    for (const field of ["prompt_tokens", "completion_tokens", "total_tokens"]) {
      if (typeof usageRec[field] !== "number") {
        throw new Error(
          `apex.openrouter-client: response.usage.${field} must be number when usage present; got ${typeof usageRec[field]}.`,
        );
      }
    }
  }
  // Wave-44 deep-review type-design BLOCKER #3 close-out: construct
  // the return object explicitly from validated fields instead of
  // erasing the validation work with a final double-cast. Future
  // additions to ChatCompletionResponse now trigger a TS error here
  // (forcing the new field through the validation surface above)
  // instead of silently shipping uncovered fields through the cast.
  const choices: ReadonlyArray<ChatCompletionChoice> = raw.choices.map((c) => {
    const choice = c as Record<string, unknown>;
    const message = choice.message as Record<string, unknown>;
    return {
      index: choice.index as number,
      message: {
        role: message.role as ChatMessage["role"],
        content: message.content as string,
      },
      finish_reason: choice.finish_reason as ChatCompletionChoice["finish_reason"],
    };
  });
  const usage: ChatCompletionUsage | undefined = raw.usage !== undefined
    ? {
        prompt_tokens: (raw.usage as Record<string, unknown>).prompt_tokens as number,
        completion_tokens: (raw.usage as Record<string, unknown>).completion_tokens as number,
        total_tokens: (raw.usage as Record<string, unknown>).total_tokens as number,
      }
    : undefined;
  return {
    id: raw.id,
    model: raw.model,
    created: raw.created,
    choices,
    usage,
  };
}

/**
 * POST /chat/completions to OpenRouter. Retries on 5xx + 429 per the
 * policy documented at the file header. Aborts after the timeout.
 * Throws on non-recoverable errors with structured `apex.openrouter-
 * client:` prefix.
 */
export async function openRouterChatCompletion(
  request: ChatCompletionRequest,
  options: OpenRouterClientOptions = {},
): Promise<ChatCompletionResponse> {
  const apiKey = loadEnvOrThrow("OPENROUTER_API_KEY");
  const baseUrl = loadEnv("OPENROUTER_BASE_URL", DEFAULT_BASE_URL) ?? DEFAULT_BASE_URL;
  const defaultModel = loadEnvOrThrow("OPENROUTER_MODEL");
  const httpReferer = loadEnv("OPENROUTER_HTTP_REFERER");
  const xTitle = loadEnv("OPENROUTER_X_TITLE");

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries5xx = options.maxRetries5xx ?? DEFAULT_MAX_RETRIES_5XX;

  const url = `${baseUrl}/chat/completions`;
  const body = JSON.stringify({
    model: request.model ?? defaultModel,
    messages: request.messages,
    temperature: request.temperature ?? DEFAULT_TEMPERATURE,
    max_tokens: request.max_tokens ?? DEFAULT_MAX_TOKENS,
    stream: false,
  });

  const headers: Record<string, string> = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (httpReferer !== undefined) headers["HTTP-Referer"] = httpReferer;
  if (xTitle !== undefined) headers["X-Title"] = xTitle;

  let attempt5xx = 0;
  let attempt429 = 0;

  while (true) {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(TIMEOUT_REASON), timeoutMs);
    // Wave-43 D2.8: chain consumer-signal abort into internal controller
    // so timeout + consumer cancel both flow through one signal.
    const consumerSignal = options.signal;
    const consumerAbortHandler = consumerSignal !== undefined
      ? () => controller.abort(consumerSignal.reason)
      : undefined;
    if (consumerSignal !== undefined && consumerAbortHandler !== undefined) {
      if (consumerSignal.aborted) {
        controller.abort(consumerSignal.reason);
      } else {
        consumerSignal.addEventListener("abort", consumerAbortHandler, { once: true });
      }
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });

      if (response.status === 429 && attempt429 === 0) {
        const retryAfter = response.headers.get("Retry-After");
        const parsed = retryAfter !== null ? parseInt(retryAfter, 10) : NaN;
        const waitMs = Number.isFinite(parsed) && parsed > 0
          ? Math.min(MAX_RETRY_AFTER_MS, parsed * 1000)
          : 1000;
        attempt429 += 1;
        clearTimeout(timeoutHandle);
        // Wave-43 D2.3 close-out per cold-review-2 silent-failure
        // H-R2-3 + B1: cancel response.body BEFORE retry so Node
        // undici releases the socket immediately (otherwise GC delay
        // can exhaust the connection pool under load). console.warn
        // logs the retry attempt so operators have a cost signal
        // during the demo window.
        await response.body?.cancel().catch(() => undefined);
        if (typeof console !== "undefined" && console.warn) {
          console.warn(`apex.openrouter-client: 429 rate-limited; retrying after ${waitMs}ms (attempt ${attempt429}).`);
        }
        await delay(waitMs, options.signal);
        continue;
      }

      if (response.status >= 500 && response.status < 600 && attempt5xx < maxRetries5xx) {
        attempt5xx += 1;
        clearTimeout(timeoutHandle);
        // Wave-43 D2.3 close-out: same response.body cancel + warn pattern
        // applied to 5xx retry path.
        await response.body?.cancel().catch(() => undefined);
        if (typeof console !== "undefined" && console.warn) {
          console.warn(`apex.openrouter-client: ${response.status} server error; retrying with exponential backoff (attempt ${attempt5xx}/${maxRetries5xx}).`);
        }
        await delay(backoffMs(attempt5xx - 1), options.signal);
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "<no body>");
        throw new Error(
          `apex.openrouter-client: ${response.status} ${response.statusText}; body=${errorBody}`,
        );
      }

      const rawPayload: unknown = await response.json();
      return decodeChatCompletionResponse(rawPayload);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        const isTimeout = controller.signal.reason === TIMEOUT_REASON;
        if (isTimeout) {
          throw new Error(
            `apex.openrouter-client: request timed out after ${timeoutMs / 1000}s. Consider raising OpenRouterClientOptions.timeoutMs.`,
          );
        }
        throw err;
      }
      throw err;
    } finally {
      clearTimeout(timeoutHandle);
      if (consumerSignal !== undefined && consumerAbortHandler !== undefined) {
        consumerSignal.removeEventListener("abort", consumerAbortHandler);
      }
    }
  }
}
