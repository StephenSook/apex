import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "../route";

/**
 * Wave-46 C10 upload-telemetry route test scaffold.
 *
 * Scope: only the EARLY-VALIDATION paths that fire BEFORE `req.formData()`
 * is awaited. Tests that depend on parsing a multipart/form-data body
 * are deferred to integration-level Playwright coverage because the
 * node 22 + undici Vitest test-env strips the File subclass off
 * FormData entries during Request body re-parse, causing the route's
 * `instanceof File` check to fail spuriously on any test that round-
 * trips a FormData blob through `new Request()`. Production Vercel
 * Edge runtime preserves the File subclass natively + the route works
 * correctly in production smoke tests. See cascade-#48 trace
 * 2026-05-27 for the discovery + decision.
 *
 * The remaining 3 cases cover the security floor (Content-Type
 * allowlist + Content-Length cap) that the test environment CAN
 * reach reliably without touching the formData parse path.
 */
describe("/api/upload-telemetry wave-46 Phase 7.5 strict CSV parser route (pre-formData paths only)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it("rejects 413 when Content-Length declares > 5 MB + 16 KB", async () => {
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

  it("returns 400 missing_csv when formData has no 'csv' field (test-env-safe path)", async () => {
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
});
