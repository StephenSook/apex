/**
 * Server-side OpenRouter client wrapper. Fetches the OpenAI-compatible
 * `/chat/completions` endpoint with env-var-loaded API key + base URL +
 * model + leaderboard-attribution headers. Wraps in retry policy +
 * AbortController timeout per the cascade-#11 hook-hardening pattern
 * (Symbol.for timeout-abort sentinel + structured error context).
 *
 * Wave-42 Lane F.C close-out per `docs/vinh-phase-1-handoff.md` Q3
 * Phase 1 task ownership split (Stephen owns 1.7 OpenRouter API
 * plumbing). NOT a client-bundled module: invoked from Next.js API
 * routes / server actions; API key never enters the client bundle.
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

export interface ChatCompletionRequest {
  readonly model?: string;
  readonly messages: ReadonlyArray<ChatMessage>;
  readonly temperature?: number;
  readonly max_tokens?: number;
  readonly stream?: boolean;
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
  readonly usage: ChatCompletionUsage;
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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffMs(attemptZeroIndexed: number): number {
  const ms = BACKOFF_BASE_MS * Math.pow(2, attemptZeroIndexed);
  return Math.min(BACKOFF_CAP_MS, ms);
}

export interface OpenRouterClientOptions {
  readonly timeoutMs?: number;
  readonly maxRetries5xx?: number;
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
    stream: request.stream ?? false,
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
        await delay(waitMs);
        continue;
      }

      if (response.status >= 500 && response.status < 600 && attempt5xx < maxRetries5xx) {
        attempt5xx += 1;
        clearTimeout(timeoutHandle);
        await delay(backoffMs(attempt5xx - 1));
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "<no body>");
        throw new Error(
          `apex.openrouter-client: ${response.status} ${response.statusText}; body=${errorBody}`,
        );
      }

      const payload = (await response.json()) as ChatCompletionResponse;
      return payload;
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
    }
  }
}
