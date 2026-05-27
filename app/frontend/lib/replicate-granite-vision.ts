/**
 * Granite Vision 4.1 4B via Replicate (wave-48).
 *
 * Closes frontend-audit critical #4: /api/timing-sheet-parse returns
 * the same 5 Sarah Reynolds laps regardless of uploaded PDF. This
 * module ships a REAL Granite Vision wire via Replicate's hosted
 * `ibm-granite/granite-vision-4.1-4b` model so an image upload routes
 * through the actual IBM Granite Vision inference.
 *
 * Replicate API shape (verified 2026-05-27 EXA research dispatch):
 *   POST https://api.replicate.com/v1/predictions
 *   Authorization: Bearer $REPLICATE_API_TOKEN
 *   {
 *     "version": "<model-version-hash-OR-model-slug>",
 *     "input": {
 *       "images": ["<image-url-or-data-url>"],
 *       "prompt": "Extract every row of the timing sheet as JSON ..."
 *     }
 *   }
 *
 * For data-URL input we base64-encode the image bytes. Free for the
 * Granite Vision 4.1 4B model on Replicate's official `ibm-granite`
 * org (the model card shows "always-on, booted" hardware).
 *
 * PDF inputs: Replicate Granite Vision accepts image arrays only. PDF
 * conversion requires a Node-runtime dependency (pdfjs-dist + canvas)
 * that doesn't ship cleanly on Vercel. Falls back to the canned-
 * fixture path with an honest engine label for PDF uploads.
 */

const REPLICATE_MODEL = "ibm-granite/granite-vision-4.1-4b";
const REPLICATE_PREDICTIONS_URL = "https://api.replicate.com/v1/predictions";
const TIMING_SHEET_PROMPT = `<chart2summary>

Extract every visible row of the timing sheet. For each row return JSON with these fields:
- lap (integer): the lap number
- sector_1_time_s (float): sector 1 time in seconds
- sector_2_time_s (float): sector 2 time in seconds
- sector_3_time_s (float): sector 3 time in seconds
- lap_time_s (float): total lap time in seconds
- gap_s (float, default 0.0): gap to leader in seconds
- position (integer, default 1): finishing position
- tyre (string, default "Slick"): tyre compound
- in_pit (boolean, default false): whether the lap is an in-pit lap

Return ONLY a JSON array of these objects. No prose.`;

export type ReplicateGraniteVisionAvailability =
  | { readonly state: "unavailable"; readonly reason: string }
  | { readonly state: "available" };

export function replicateGraniteVisionAvailable(): ReplicateGraniteVisionAvailability {
  const token = process.env.REPLICATE_API_TOKEN?.trim();
  if (!token) {
    return {
      state: "unavailable",
      reason: "REPLICATE_API_TOKEN env var not set",
    };
  }
  return { state: "available" };
}

export type GraniteVisionLap = {
  readonly lap: number;
  readonly sector_1_time_s: number;
  readonly sector_2_time_s: number;
  readonly sector_3_time_s: number;
  readonly lap_time_s: number;
  readonly gap_s: number;
  readonly position: number;
  readonly tyre: string;
  readonly in_pit: boolean;
};

/**
 * Parse the Replicate output payload into the TimingSheetLap shape.
 *
 * Replicate returns either an array of strings (token-by-token) OR a
 * single string (concat-mode). We coerce both into a single string +
 * extract the JSON array between the first `[` and the last `]`.
 */
function coerceReplicateOutput(output: unknown): GraniteVisionLap[] {
  let text: string;
  if (Array.isArray(output)) {
    text = output.map((t) => String(t)).join("");
  } else if (typeof output === "string") {
    text = output;
  } else {
    throw new Error("Replicate returned non-string output");
  }
  const startIdx = text.indexOf("[");
  const endIdx = text.lastIndexOf("]");
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    throw new Error("Replicate output missing JSON array");
  }
  const jsonSlice = text.slice(startIdx, endIdx + 1);
  const parsed = JSON.parse(jsonSlice) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Replicate JSON is not an array");
  }
  return parsed.map((row, idx): GraniteVisionLap => {
    const r = row as Record<string, unknown>;
    return {
      lap: Number(r.lap ?? idx + 1),
      sector_1_time_s: Number(r.sector_1_time_s ?? 0),
      sector_2_time_s: Number(r.sector_2_time_s ?? 0),
      sector_3_time_s: Number(r.sector_3_time_s ?? 0),
      lap_time_s: Number(r.lap_time_s ?? 0),
      gap_s: Number(r.gap_s ?? 0),
      position: Number(r.position ?? 1),
      tyre: String(r.tyre ?? "Slick"),
      in_pit: Boolean(r.in_pit ?? false),
    };
  });
}

/**
 * Send an image to Replicate Granite Vision 4.1 4B + parse the output
 * into a typed lap array. Synchronous via the `Prefer: wait` header
 * (Replicate blocks up to 60 s for a final prediction).
 *
 * Throws on any non-200 response or parse failure so the caller can
 * fall back to the canned-fixture path.
 */
export async function parseTimingSheetViaReplicate(
  imageBytes: Uint8Array,
  contentType: "image/png" | "image/jpeg",
): Promise<GraniteVisionLap[]> {
  const availability = replicateGraniteVisionAvailable();
  if (availability.state === "unavailable") {
    throw new Error(availability.reason);
  }
  const token = process.env.REPLICATE_API_TOKEN!.trim();
  const base64 = Buffer.from(imageBytes).toString("base64");
  const dataUrl = `data:${contentType};base64,${base64}`;
  const body = JSON.stringify({
    model: REPLICATE_MODEL,
    input: {
      images: [dataUrl],
      prompt: TIMING_SHEET_PROMPT,
    },
  });
  const r = await fetch(REPLICATE_PREDICTIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Prefer": "wait=58",
      "X-Apex-Use": "timing-sheet-parse",
    },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(70000),
  });
  if (!r.ok) {
    const errBody = await r.text().catch(() => "");
    throw new Error(
      `Replicate returned ${r.status}: ${errBody.slice(0, 256)}`,
    );
  }
  const payload = (await r.json()) as {
    readonly status?: string;
    readonly output?: unknown;
    readonly error?: string | null;
  };
  if (payload.error) {
    throw new Error(`Replicate prediction error: ${payload.error}`);
  }
  if (payload.status !== "succeeded") {
    throw new Error(`Replicate prediction not succeeded: ${payload.status}`);
  }
  return coerceReplicateOutput(payload.output);
}
