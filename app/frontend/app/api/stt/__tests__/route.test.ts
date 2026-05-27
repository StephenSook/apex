import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "../route";

function mockRequest(body: unknown = {}): Request {
  return new Request("https://apex-one-black.vercel.app/api/stt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/stt wave-46 Phase 5.6 Granite Speech 4.1 2B-Plus swap-point", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 200 with canned-fallback engine + mock transcript (default no env flag)", async () => {
    const res = await POST(mockRequest({}) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      engine: string;
      transcript: string;
      confidence: number;
      language: string;
      speakers: ReadonlyArray<{ speaker: string; text: string }>;
      word_timestamps: ReadonlyArray<{ word: string }>;
      swap_point: string;
    };
    expect(data.engine).toBe("stt-v9-canned-fallback");
    expect(data.transcript).toMatch(/APEX coach/);
    expect(data.confidence).toBeGreaterThan(0.9);
    expect(data.language).toBe("en-US");
    expect(data.speakers.length).toBe(1);
    expect(data.speakers[0].speaker).toBe("race-engineer");
    expect(data.word_timestamps.length).toBeGreaterThan(0);
    expect(data.swap_point).toMatch(/Vinh M3-V9/);
  });

  it("ships X-Apex-Stt-Swap-Point + X-Apex-Stt-Engine headers", async () => {
    const res = await POST(mockRequest({}) as unknown as Parameters<typeof POST>[0]);
    expect(res.headers.get("X-Apex-Stt-Swap-Point")).toBe(
      "vinh-m3-v9-watson-stt-granite-speech-4-1-2b-plus",
    );
    expect(res.headers.get("X-Apex-Stt-Engine")).toBe("stt-v9-canned-fallback");
  });

  it("accepts empty POST body for canned-fallback testing", async () => {
    const req = new Request("https://apex-one-black.vercel.app/api/stt", { method: "POST" });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string };
    expect(data.engine).toBe("stt-v9-canned-fallback");
  });

  it("stays canned when env flag on but base URL unset (misconfig safety)", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_GRANITE_SPEECH", "1");
    const res = await POST(mockRequest({}) as unknown as Parameters<typeof POST>[0]);
    const data = (await res.json()) as { engine: string };
    expect(data.engine).toBe("stt-v9-canned-fallback");
  });

  it("returns real engine when env flag on + base URL set + upstream OK", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_GRANITE_SPEECH", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          engine: "will-be-overwritten",
          compute_ms: 99,
          transcript: "Real transcript output from Granite Speech.",
          confidence: 0.98,
          language: "fr-FR",
          speakers: [
            { speaker: "driver", start_s: 0, end_s: 4.2, text: "Real transcript output from Granite Speech." },
          ],
          word_timestamps: [{ word: "Real", start_s: 0, end_s: 0.3 }],
          swap_point: "real swap-point payload",
        }),
        { status: 200 },
      ),
    );
    const res = await POST(mockRequest({ audio: "ZmFrZQ==" }) as unknown as Parameters<typeof POST>[0]);
    const data = (await res.json()) as {
      engine: string;
      transcript: string;
      language: string;
    };
    expect(data.engine).toBe("stt-v9-real");
    expect(data.transcript).toBe("Real transcript output from Granite Speech.");
    expect(data.language).toBe("fr-FR");
    expect(res.headers.get("X-Apex-Stt-Engine")).toBe("stt-v9-real");
  });

  it("falls back to canned when env flag on + base URL set + upstream 5xx", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_GRANITE_SPEECH", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("upstream down", { status: 503 }));
    const res = await POST(mockRequest({ audio: "ZmFrZQ==" }) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string; transcript: string };
    expect(data.engine).toBe("stt-v9-canned-fallback");
    expect(data.transcript).toMatch(/APEX coach/);
  });

  it("falls back to canned when env flag on + base URL set + fetch throws", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_GRANITE_SPEECH", "1");
    vi.stubEnv("NEXT_PUBLIC_VINH_BACKEND_BASE_URL", "https://vinh.example/api-root");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ENOTFOUND vinh.example"));
    const res = await POST(mockRequest({ audio: "ZmFrZQ==" }) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string };
    expect(data.engine).toBe("stt-v9-canned-fallback");
  });

  // Wave-46 C12 R3 audio-body cap tests per project memory
  // feedback_llm_output_compliance_scrubber.md spirit applied to file
  // uploads + the 5 MB cap rationale in route.ts wave-46 Phase 9.3
  // code-reviewer HIGH 3 ship comment.

  it("rejects 413 audio_too_large when Content-Length declares > 5 MB", async () => {
    const req = new Request("https://apex-one-black.vercel.app/api/stt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(6 * 1024 * 1024),
      },
      body: JSON.stringify({ audio: "x" }),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(413);
    const body = (await res.json()) as { error: string; message: string };
    expect(body.error).toBe("audio_too_large");
    expect(body.message).toMatch(/5 MB|5242880|5\s*MB/);
  });

  it("rejects 400 invalid_content_length when Content-Length is not parseable", async () => {
    const req = new Request("https://apex-one-black.vercel.app/api/stt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": "not-a-number",
      },
      body: JSON.stringify({ audio: "x" }),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("invalid_content_length");
  });

  it("accepts request when Content-Length is exactly at 5 MB cap (boundary)", async () => {
    const req = new Request("https://apex-one-black.vercel.app/api/stt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(5 * 1024 * 1024),
      },
      body: JSON.stringify({ audio: "x" }),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { engine: string };
    expect(data.engine).toBe("stt-v9-canned-fallback");
  });

  it("accepts request when Content-Length header is absent (Vercel Edge native cap is the floor)", async () => {
    const req = new Request("https://apex-one-black.vercel.app/api/stt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio: "x" }),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);
  });
});
