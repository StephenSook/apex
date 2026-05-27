import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "../route";

const CANONICAL_HEADER =
  "t_session_s,throttle_pct,brake_pa,steering_rad,rpm,lat_g,long_g,speed_mps,gear";

function csvRequest(body: string): Request {
  const formData = new FormData();
  formData.append("csv", new File([body], "session.csv", { type: "text/csv" }));
  return new Request("https://apex-one-black.vercel.app/api/upload-telemetry", {
    method: "POST",
    body: formData,
  });
}

function buildValidCsv(rows: number): string {
  const lines: string[] = [CANONICAL_HEADER];
  for (let i = 0; i < rows; i++) {
    const t = (i * 0.02).toFixed(3);
    lines.push(`${t},78.5,0.12,0.045,9100,0.85,-0.18,42.1,4`);
  }
  return lines.join("\n");
}

describe("/api/upload-telemetry wave-46 Phase 7.5 strict CSV parser route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 200 with parsed payload + canonical channel summaries on valid CSV", async () => {
    const res = await POST(csvRequest(buildValidCsv(20)) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      engine: string;
      compute_ms: number;
      source_filename: string;
      row_count: number;
      first_row_t_session_s: number;
      last_row_t_session_s: number;
      channels: ReadonlyArray<{ channel: string; min: number; max: number; mean: number; samples: number }>;
      head_preview: ReadonlyArray<Record<string, number>>;
    };
    expect(data.engine).toBe("upload-telemetry-strict-parser");
    // Production Vercel Edge returns File with .name === "session.csv";
    // node 22 + undici test-env returns Blob with no name + falls back
    // to "uploaded.csv" sentinel. Accept either.
    expect(data.source_filename).toMatch(/^(session|uploaded)\.csv$/);
    expect(data.row_count).toBe(20);
    expect(data.first_row_t_session_s).toBe(0);
    expect(data.last_row_t_session_s).toBeCloseTo(0.38, 3);
    expect(data.channels.length).toBe(3);
    expect(data.channels.map((c) => c.channel)).toEqual([
      "throttle_pct",
      "speed_mps",
      "lat_g",
    ]);
    expect(data.head_preview.length).toBe(5);
  });

  it("returns 200 with X-Apex-Upload-Telemetry-Engine header", async () => {
    const res = await POST(csvRequest(buildValidCsv(5)) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Apex-Upload-Telemetry-Engine")).toBe(
      "upload-telemetry-strict-parser",
    );
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("rejects 415 when Content-Type is not multipart/form-data", async () => {
    const req = new Request("https://apex-one-black.vercel.app/api/upload-telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: "x" }),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(415);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("invalid_multipart");
  });

  it("rejects 400 when csv field is missing from the multipart body", async () => {
    const formData = new FormData();
    formData.append("not_csv", new File(["x"], "x.csv", { type: "text/csv" }));
    const req = new Request("https://apex-one-black.vercel.app/api/upload-telemetry", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("missing_csv");
  });

  it("rejects 400 when CSV is empty", async () => {
    const formData = new FormData();
    formData.append("csv", new File([""], "empty.csv", { type: "text/csv" }));
    const req = new Request("https://apex-one-black.vercel.app/api/upload-telemetry", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("empty_csv");
  });

  it("rejects 400 with csv_missing_headers when canonical header missing", async () => {
    const bad = "t_session_s,bogus_col,wrong_col\n0,1,2\n";
    const res = await POST(csvRequest(bad) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; message: string };
    expect(body.error).toBe("csv_missing_headers");
    expect(body.message).toMatch(/throttle_pct/);
  });

  it("rejects 400 with csv_missing_rows when only the header row is present", async () => {
    const headerOnly = CANONICAL_HEADER;
    const res = await POST(csvRequest(headerOnly) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("csv_missing_rows");
  });

  it("rejects 400 with csv_no_valid_rows when every data row fails numeric parse", async () => {
    const bad = `${CANONICAL_HEADER}\nfoo,bar,baz,qux,quux,corge,grault,garply,waldo`;
    const res = await POST(csvRequest(bad) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("csv_no_valid_rows");
  });

  it("rejects 413 when Content-Length declares >5MB", async () => {
    const formData = new FormData();
    formData.append("csv", new File(["x"], "x.csv", { type: "text/csv" }));
    const req = new Request("https://apex-one-black.vercel.app/api/upload-telemetry", {
      method: "POST",
      headers: { "Content-Length": String(10 * 1024 * 1024 + 17 * 1024) },
      body: formData,
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(413);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("csv_too_large");
  });

  it("response payload omits duration_s field (wave-46.5 R9 single-source-of-truth)", async () => {
    const res = await POST(csvRequest(buildValidCsv(10)) as unknown as Parameters<typeof POST>[0]);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.duration_s).toBeUndefined();
    expect(typeof data.first_row_t_session_s).toBe("number");
    expect(typeof data.last_row_t_session_s).toBe("number");
  });

  it("head_preview contains at most 5 rows even for large inputs", async () => {
    const res = await POST(csvRequest(buildValidCsv(200)) as unknown as Parameters<typeof POST>[0]);
    const data = (await res.json()) as { head_preview: unknown[]; row_count: number };
    expect(data.row_count).toBe(200);
    expect(data.head_preview.length).toBe(5);
  });

  it("channel summaries report sane min/max/mean across all 200 rows", async () => {
    const res = await POST(csvRequest(buildValidCsv(200)) as unknown as Parameters<typeof POST>[0]);
    const data = (await res.json()) as {
      channels: ReadonlyArray<{ channel: string; min: number; max: number; mean: number; samples: number }>;
    };
    const throttle = data.channels.find((c) => c.channel === "throttle_pct");
    expect(throttle).toBeDefined();
    expect(throttle?.min).toBe(78.5);
    expect(throttle?.max).toBe(78.5);
    expect(throttle?.mean).toBe(78.5);
    expect(throttle?.samples).toBe(200);
  });
});
