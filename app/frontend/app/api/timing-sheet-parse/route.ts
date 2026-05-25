/**
 * Wave-44 Phase 6c Granite Vision timing-sheet parser endpoint.
 * Frontend swap-point per wave-44 plan Vinh-scope V1 addition.
 *
 * Accepts multipart/form-data PDF upload + returns structured
 * TimingSheetParsedLaps shape. Today's HEAD implementation routes the
 * uploaded PDF through a canned-fixture parse path so the demo on
 * /judges is exercise-able end-to-end without the Vinh M3-V1 Granite
 * Vision 4.1 4B backend wire-up. The CANNED_LAPS array below mirrors
 * `fixtures/timing-sheets/sarah-reynolds-donington-2026-stub.json`
 * byte-for-byte (5 laps with sector splits + lap times).
 *
 * Backend swap-point: Vinh M3-V1 endpoint at
 * `app/backend/apex/instruct/timing_sheet_parser.py` will invoke
 * Granite Vision 4.1 4B locally + return the same JSON shape. Per
 * Stream M.3 spec extension contract: render path stays identical
 * between mock + real (`GraniteVisionParser.tsx` POSTs here + renders
 * the lap table regardless of which side produces the JSON).
 *
 * OpenRouter Granite Vision swap-path: when `OPENROUTER_API_KEY +
 * OPENROUTER_VISION_MODEL` env vars are present, the route can also
 * proxy the upload to OpenRouter's Granite Vision endpoint instead of
 * Vinh's local inference. Queued for next wave.
 */

import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TimingSheetLap {
  readonly lap: number;
  readonly sector_1_time_s: number;
  readonly sector_2_time_s: number;
  readonly sector_3_time_s: number;
  readonly lap_time_s: number;
}

interface TimingSheetParsedLaps {
  readonly source_filename: string;
  readonly parser: "granite-vision-4.1-4b" | "canned-fixture";
  readonly parse_ms: number;
  readonly laps: ReadonlyArray<TimingSheetLap>;
}

const CANNED_LAPS: ReadonlyArray<TimingSheetLap> = [
  { lap: 1, sector_1_time_s: 24.182, sector_2_time_s: 28.945, sector_3_time_s: 25.612, lap_time_s: 78.739 },
  { lap: 2, sector_1_time_s: 23.871, sector_2_time_s: 28.412, sector_3_time_s: 25.198, lap_time_s: 77.481 },
  { lap: 3, sector_1_time_s: 23.659, sector_2_time_s: 28.103, sector_3_time_s: 24.951, lap_time_s: 76.713 },
  { lap: 4, sector_1_time_s: 23.582, sector_2_time_s: 27.916, sector_3_time_s: 24.832, lap_time_s: 76.330 },
  { lap: 5, sector_1_time_s: 23.504, sector_2_time_s: 27.847, sector_3_time_s: 24.798, lap_time_s: 76.149 },
];

const MAX_PDF_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest): Promise<Response> {
  const t0 = performance.now();
  // Per codex adversarial review wave-44 deep-dive HIGH #3: validate
  // Content-Length + Content-Type upfront BEFORE req.formData() buffers
  // the entire multipart body. Without the upfront cap, an adversarial
  // 100MB+ POST would buffer fully before the file.size check fires
  // + exhaust Vercel Fluid Compute memory budget.
  const contentLength = req.headers.get("content-length");
  if (contentLength !== null) {
    const declared = Number.parseInt(contentLength, 10);
    if (Number.isFinite(declared) && declared > MAX_PDF_BYTES + 16 * 1024) {
      return Response.json(
        {
          error: "pdf_too_large",
          message: `Content-Length ${declared} exceeds 10MB cap.`,
        },
        { status: 413 },
      );
    }
  }
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return Response.json(
      {
        error: "invalid_multipart",
        message: `Expected Content-Type multipart/form-data; got ${contentType || "(missing)"}`,
      },
      { status: 415 },
    );
  }
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err) {
    return Response.json(
      {
        error: "invalid_multipart",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 400 },
    );
  }
  const file = formData.get("pdf");
  if (file === null || !(file instanceof File)) {
    return Response.json(
      {
        error: "missing_pdf",
        message: "Expected multipart/form-data field 'pdf' of type File.",
      },
      { status: 400 },
    );
  }
  if (file.size === 0) {
    return Response.json(
      {
        error: "empty_pdf",
        message: "Uploaded PDF is empty.",
      },
      { status: 400 },
    );
  }
  if (file.size > MAX_PDF_BYTES) {
    return Response.json(
      {
        error: "pdf_too_large",
        message: `PDF size ${file.size} exceeds 10MB cap.`,
      },
      { status: 413 },
    );
  }
  // File type sanity check: most browsers tag uploaded PDFs as
  // application/pdf. Accept missing type for permissive UX but reject
  // explicit non-PDF types since the parser surface assumes PDF input.
  if (file.type && file.type !== "application/pdf") {
    return Response.json(
      {
        error: "invalid_pdf_type",
        message: `Expected file.type application/pdf; got ${file.type}.`,
      },
      { status: 415 },
    );
  }

  const payload: TimingSheetParsedLaps = {
    source_filename: file.name,
    parser: "canned-fixture",
    parse_ms: Math.round(performance.now() - t0),
    laps: CANNED_LAPS,
  };
  return Response.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "X-Apex-Parser-Swap-Point": "vinh-v1-granite-vision-4.1-4b",
    },
  });
}
