import { describe, expect, it } from "vitest";

import { POST } from "../../app/api/timing-sheet-parse/route";

// Wave-45 Phase 3 pr-test-analyzer BLOCKER B1 close-out per wave-44
// deep-review. Cover the 4 error branches + the 200 success path with
// X-Apex-Parser-Swap-Point header preservation invariant.

function buildMultipartRequest(
  body: BodyInit | null,
  contentType = "multipart/form-data; boundary=----webkittest",
): Request {
  return new Request("http://test/api/timing-sheet-parse", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body,
  });
}

describe("POST /api/timing-sheet-parse", () => {
  it("returns 415 invalid_multipart when Content-Type is not multipart/form-data", async () => {
    const req = new Request("http://test/api/timing-sheet-parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdf: "fake" }),
    });
    const res = await POST(req as Parameters<typeof POST>[0]);
    expect(res.status).toBe(415);
    const body = await res.json();
    expect(body.error).toBe("invalid_multipart");
  });

  it("returns 400 missing_pdf when 'pdf' field absent from multipart body", async () => {
    const fd = new FormData();
    fd.append("notpdf", new File(["x"], "x.pdf", { type: "application/pdf" }));
    const req = new Request("http://test/api/timing-sheet-parse", {
      method: "POST",
      body: fd,
    });
    const res = await POST(req as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("missing_pdf");
  });

  it("returns 400 empty_pdf when 'pdf' file size is 0", async () => {
    const fd = new FormData();
    fd.append("pdf", new File([], "empty.pdf", { type: "application/pdf" }));
    const req = new Request("http://test/api/timing-sheet-parse", {
      method: "POST",
      body: fd,
    });
    const res = await POST(req as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("empty_pdf");
  });

  it("returns 200 with X-Apex-Parser-Swap-Point header on canned-fixture upload", async () => {
    const pdfContent = "%PDF-1.4 canned fixture test";
    const fd = new FormData();
    fd.append("pdf", new File([pdfContent], "canned.pdf", { type: "application/pdf" }));
    const req = new Request("http://test/api/timing-sheet-parse", {
      method: "POST",
      body: fd,
    });
    const res = await POST(req as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Apex-Parser-Swap-Point")).toBe("vinh-v1-granite-vision-4.1-4b");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const body = await res.json();
    expect(body.parser).toBe("canned-fixture");
    expect(body.source_filename).toBe("canned.pdf");
    expect(body.laps).toHaveLength(5);
  });
});
