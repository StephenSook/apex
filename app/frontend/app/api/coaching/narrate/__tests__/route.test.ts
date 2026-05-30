import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "../route";

const VALID_BODY = {
  driver_id: "test-driver",
  debrief: "Lost the rears mid the slow hairpin.",
  corners: [
    { name: "Sector 1 corner", sector: 1, current_delta_s: 0.34 },
    { name: "Sector 2 corner", sector: 2, current_delta_s: 0.08 },
  ],
  tuning_delta: {
    parameter: "primary_actuation_modulation_pct",
    current: 100,
    recommended: 90,
    unit: "pct",
  },
};

function mockRequest(body: unknown): Request {
  return new Request("https://apex-one-black.vercel.app/api/coaching/narrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function liveCompletion(content: string) {
  return {
    id: "test",
    model: "ibm-granite/granite-4.1-8b-instruct",
    created: 1,
    choices: [
      {
        index: 0,
        message: { role: "assistant" as const, content },
        finish_reason: "stop" as const,
      },
    ],
    usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
  };
}

function enableProduction(): void {
  vi.stubEnv("OPENROUTER_API_KEY", "sk-test-mock-key");
  vi.stubEnv("OPENROUTER_MODEL", "ibm-granite/granite-4.1-8b-instruct");
}

describe("/api/coaching/narrate wave-64 live Granite coaching", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 400 when the body is not JSON", async () => {
    const req = new Request("https://apex-one-black.vercel.app/api/coaching/narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "<not-json>",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when corners[] is empty or missing", async () => {
    const res = await POST(mockRequest({ ...VALID_BODY, corners: [] }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when tuning_delta is malformed", async () => {
    const res = await POST(mockRequest({ ...VALID_BODY, tuning_delta: { parameter: "x" } }));
    expect(res.status).toBe(400);
  });

  it("returns ok:false source:stub when OPENROUTER env is unset", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");
    vi.stubEnv("OPENROUTER_MODEL", "");
    const res = await POST(mockRequest(VALID_BODY));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { ok: boolean; source: string };
    expect(data.ok).toBe(false);
    expect(data.source).toBe("stub");
  });

  it("returns ok:true granite-live with one corner per input on a clean JSON completion", async () => {
    enableProduction();
    const mod = await import("../../../../../lib/openrouter-client");
    const live = JSON.stringify({
      corners: [
        {
          name: "WRONG NAME FROM MODEL",
          recommendation: "Trail-brake across two micro-presses to hold the entry rotation.",
          recommendation_beginner: "Brake a touch later in two gentle presses.",
          reasoning_chain: [
            { step: "cause", label: "Why", content: "Entry rotation arrives late." },
            { step: "recommendation", label: "Do", content: "Split the brake input." },
          ],
        },
        {
          name: "Sector 2 corner",
          recommendation: "Pick the throttle up sooner as you unwind the steering.",
          recommendation_beginner: "Get on the power a bit earlier here.",
          reasoning_chain: [],
        },
      ],
      summary: "Two corners cost most of the lap delta.",
    });
    vi.spyOn(mod, "openRouterChatCompletion").mockResolvedValue(liveCompletion(live));

    const res = await POST(mockRequest(VALID_BODY));
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      ok: boolean;
      source: string;
      corners: ReadonlyArray<{ name: string; recommendation: string }>;
      summary: string;
    };
    expect(data.ok).toBe(true);
    expect(data.source).toBe("granite-live");
    expect(data.corners).toHaveLength(2);
    // Name is pinned to the server-known input name, not the model's rename.
    expect(data.corners[0].name).toBe("Sector 1 corner");
    expect(data.corners[0].recommendation).toMatch(/micro-presses/);
    expect(data.summary).toMatch(/lap delta/);
  });

  it("scrubs invented FIA Article numbers out of the live narrative", async () => {
    enableProduction();
    const mod = await import("../../../../../lib/openrouter-client");
    const live = JSON.stringify({
      corners: [
        {
          name: "Sector 1 corner",
          recommendation: "Per FIA Article 5.2 your hand controls clear the overlap; split the brake.",
          recommendation_beginner: "Your controls are fine; brake in two presses.",
          reasoning_chain: [],
        },
        {
          name: "Sector 2 corner",
          recommendation: "Throttle pickup is conservative; pick it up sooner.",
          recommendation_beginner: "Get on the power earlier.",
          reasoning_chain: [],
        },
      ],
      summary: "ok",
    });
    vi.spyOn(mod, "openRouterChatCompletion").mockResolvedValue(liveCompletion(live));

    const res = await POST(mockRequest(VALID_BODY));
    const data = (await res.json()) as { corners: ReadonlyArray<{ recommendation: string }> };
    expect(data.corners[0].recommendation).not.toMatch(/FIA Article \d/i);
    expect(data.corners[0].recommendation).toMatch(/Appendix L per the published revision/);
  });

  it("returns ok:false source:parse-error when the model never returns valid JSON", async () => {
    enableProduction();
    const mod = await import("../../../../../lib/openrouter-client");
    vi.spyOn(mod, "openRouterChatCompletion").mockResolvedValue(
      liveCompletion("I cannot produce JSON, here is prose instead."),
    );
    const res = await POST(mockRequest(VALID_BODY));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { ok: boolean; source: string };
    expect(data.ok).toBe(false);
    expect(data.source).toBe("parse-error");
  });

  it("returns ok:false source:upstream-error when the OpenRouter call throws", async () => {
    enableProduction();
    const mod = await import("../../../../../lib/openrouter-client");
    vi.spyOn(mod, "openRouterChatCompletion").mockRejectedValue(
      new Error("ECONNREFUSED openrouter.ai"),
    );
    const res = await POST(mockRequest(VALID_BODY));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { ok: boolean; source: string };
    expect(data.ok).toBe(false);
    expect(data.source).toBe("upstream-error");
  });

  it("returns ok:false source:parse-error when corner count mismatches the request", async () => {
    enableProduction();
    const mod = await import("../../../../../lib/openrouter-client");
    // Request has 2 corners; model returns 1 -> shape mismatch -> parse-error.
    const live = JSON.stringify({
      corners: [{ name: "Sector 1 corner", recommendation: "x", recommendation_beginner: "y", reasoning_chain: [] }],
      summary: "s",
    });
    vi.spyOn(mod, "openRouterChatCompletion").mockResolvedValue(liveCompletion(live));
    const res = await POST(mockRequest(VALID_BODY));
    const data = (await res.json()) as { ok: boolean; source: string };
    expect(data.ok).toBe(false);
    expect(data.source).toBe("parse-error");
  });
});
