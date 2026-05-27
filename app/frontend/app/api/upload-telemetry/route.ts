/**
 * POST /api/upload-telemetry
 *
 * Wave-46 D-058 Phase 7.5 NEW route. Accepts a judge-uploadable
 * telemetry CSV (multipart/form-data field `csv`), parses with a
 * strict canonical-header validator + per-row numeric-shape check,
 * returns `UploadTelemetryResponse` with row_count + duration + per-
 * channel summary stats (min/max/mean for throttle_pct + speed_mps +
 * lat_g) + a 5-row head preview.
 *
 * Security guards (per `feedback_llm_output_compliance_scrubber.md`
 * spirit applied to file uploads):
 *   - Content-Length cap 5 MB upfront (prevents adversarial 100MB+ POST)
 *   - Content-Type allowlist text/csv + application/vnd.ms-excel
 *   - File size cap 5 MB on the parsed File
 *   - File type sanity check (text/csv or text/plain; fallback OK)
 *   - Strict header validation: first row must contain canonical
 *     TelemetryRow fields (t_session_s + throttle_pct + brake_pa +
 *     steering_rad + rpm + lat_g + long_g + speed_mps + gear).
 *   - Row count cap 10000 (prevents memory exhaustion via long file)
 *   - Per-row numeric parse with Number.isFinite guard; reject row if
 *     any expected field fails to parse to a finite number.
 *   - NO code execution. NO eval. Pure-string CSV split.
 *
 * Vercel Sandbox isolation deferred wave-46.5 (would add cross-process
 * sandboxing for the parse step); strict parser + size + row caps
 * provide the security floor for wave-46 ship.
 *
 * Hook contract:
 *   - Request: multipart/form-data with field `csv` of File type
 *   - Response: JSON UploadTelemetryResponse
 *   - Status: 200 on success; 4xx on validation; 5xx on parse failure
 */

import type { NextRequest } from "next/server";

import type {
  TelemetryChannelSummary,
  UploadTelemetryResponse,
} from "../../../../shared/types";

// Wave-47 cascade-C close per Codex BLOCKER (upload-telemetry runtime
// Undici File-subclass mismatch). Switched runtime to "edge" so the
// native Web Platform multipart parser preserves File subclass natively
// on FormData entries; Node 22 + Undici Vitest test-env strips the
// subclass during Request body re-parse but production Vercel Edge
// preserves it. Edge native body cap is 4.5 MB which is BELOW our 5 MB
// soft cap so the Content-Length check still has merit as fast-fail.
export const runtime = "edge";
export const dynamic = "force-dynamic";

const MAX_CSV_BYTES = 5 * 1024 * 1024;
const MAX_ROWS = 10_000;
const CANONICAL_HEADERS: ReadonlyArray<string> = [
  "t_session_s",
  "throttle_pct",
  "brake_pa",
  "steering_rad",
  "rpm",
  "lat_g",
  "long_g",
  "speed_mps",
  "gear",
];
const SUMMARY_CHANNELS: ReadonlyArray<string> = ["throttle_pct", "speed_mps", "lat_g"];

function summarize(rows: ReadonlyArray<Record<string, number>>, channel: string): TelemetryChannelSummary {
  const values = rows
    .map((row) => row[channel])
    .filter((v): v is number => Number.isFinite(v));
  if (values.length === 0) {
    return { channel, min: 0, max: 0, mean: 0, samples: 0 };
  }
  let min = values[0];
  let max = values[0];
  let sum = 0;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
  }
  return { channel, min, max, mean: sum / values.length, samples: values.length };
}

export async function POST(req: NextRequest): Promise<Response> {
  const t0 = performance.now();
  const contentLength = req.headers.get("content-length");
  if (contentLength !== null) {
    const declared = Number.parseInt(contentLength, 10);
    if (Number.isFinite(declared) && declared > MAX_CSV_BYTES + 16 * 1024) {
      return Response.json(
        { error: "csv_too_large", message: `Content-Length ${declared} exceeds 5MB cap.` },
        { status: 413 },
      );
    }
  }
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return Response.json(
      { error: "invalid_multipart", message: `Expected Content-Type multipart/form-data; got ${contentType || "(missing)"}` },
      { status: 415 },
    );
  }
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err) {
    return Response.json(
      { error: "invalid_multipart", message: err instanceof Error ? err.message : String(err) },
      { status: 400 },
    );
  }
  const file = formData.get("csv");
  // Wave-47 cascade-C: accept Blob OR File (File extends Blob). Edge
  // runtime preserves File subclass natively in production but a
  // defensive check against bare Blob keeps the route resilient if a
  // future runtime change loses the subclass.
  if (file === null || !(file instanceof Blob)) {
    return Response.json(
      { error: "missing_csv", message: "Expected multipart/form-data field 'csv' of type File or Blob." },
      { status: 400 },
    );
  }
  const fileName =
    file instanceof File && typeof file.name === "string" && file.name.length > 0
      ? file.name
      : "uploaded.csv";
  if (file.size === 0) {
    return Response.json({ error: "empty_csv", message: "Uploaded CSV is empty." }, { status: 400 });
  }
  if (file.size > MAX_CSV_BYTES) {
    return Response.json(
      { error: "csv_too_large", message: `CSV size ${file.size} exceeds 5MB cap.` },
      { status: 413 },
    );
  }
  const allowedTypes = new Set(["text/csv", "application/vnd.ms-excel", "text/plain", ""]);
  if (file.type && !allowedTypes.has(file.type)) {
    return Response.json(
      { error: "invalid_csv_type", message: `Expected text/csv; got ${file.type}.` },
      { status: 415 },
    );
  }

  let text: string;
  try {
    text = await file.text();
  } catch (err) {
    return Response.json(
      { error: "csv_read_failed", message: err instanceof Error ? err.message : String(err) },
      { status: 400 },
    );
  }

  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    return Response.json(
      { error: "csv_missing_rows", message: "CSV needs a header row + at least one data row." },
      { status: 400 },
    );
  }

  const headerLine = lines[0];
  const headers = headerLine.split(",").map((h) => h.trim());
  const headerIndexByName = new Map<string, number>();
  for (let i = 0; i < headers.length; i++) {
    headerIndexByName.set(headers[i], i);
  }
  const missing = CANONICAL_HEADERS.filter((h) => !headerIndexByName.has(h));
  if (missing.length > 0) {
    return Response.json(
      {
        error: "csv_missing_headers",
        message: `Missing canonical headers: ${missing.join(", ")}. Expected: ${CANONICAL_HEADERS.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  if (lines.length - 1 > MAX_ROWS) {
    return Response.json(
      {
        error: "csv_too_many_rows",
        message: `Got ${lines.length - 1} data rows; cap is ${MAX_ROWS}.`,
      },
      { status: 413 },
    );
  }

  const rows: Array<Record<string, number>> = [];
  for (let r = 1; r < lines.length; r++) {
    const cells = lines[r].split(",");
    const row: Record<string, number> = {};
    let valid = true;
    for (const headerName of CANONICAL_HEADERS) {
      const idx = headerIndexByName.get(headerName);
      if (idx === undefined) {
        valid = false;
        break;
      }
      const value = Number.parseFloat(cells[idx] ?? "");
      if (!Number.isFinite(value)) {
        valid = false;
        break;
      }
      row[headerName] = value;
    }
    if (valid) rows.push(row);
  }

  if (rows.length === 0) {
    return Response.json(
      {
        error: "csv_no_valid_rows",
        message: "Parsed zero valid rows; every data row failed numeric validation.",
      },
      { status: 400 },
    );
  }

  const firstRow = rows[0];
  const lastRow = rows[rows.length - 1];
  const channels = SUMMARY_CHANNELS.map((ch) => summarize(rows, ch));
  const headPreview = rows.slice(0, 5);

  const payload: UploadTelemetryResponse = {
    engine: "upload-telemetry-strict-parser",
    compute_ms: Math.round(performance.now() - t0),
    source_filename: fileName,
    row_count: rows.length,
    first_row_t_session_s: firstRow.t_session_s,
    last_row_t_session_s: lastRow.t_session_s,
    // duration_s dropped wave-46.5 type-design REWORK R9: consumers
    // compute it inline as `last_row_t_session_s - first_row_t_session_s`
    // to remove the single-source-of-truth violation.
    channels,
    head_preview: headPreview,
  };
  return Response.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "X-Apex-Upload-Telemetry-Engine": payload.engine,
    },
  });
}
