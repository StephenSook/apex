/**
 * Wave-46 D-058 Phase 7.3 NEW route. Pre-race weather brief swap-point.
 * Vinh ships the real consumer at `app/backend/apex/weather/brief.py`
 * pulling from NOAA + Met Office free public APIs.
 *
 * HEAD canned path: returns canned 6-hour forecast envelope for a
 * temperate-summer European-circuit baseline. Frontend renders
 * identically between canned + real per Stream M.3 spec extension
 * contract.
 *
 * Wave-46 D-058 wire-flip: when (future) `NEXT_PUBLIC_USE_REAL_WEATHER`
 * env flag flips + Vinh backend deploys with NOAA / Met Office API key,
 * this route forwards to `${base}/api/weather-brief`. Flag not yet
 * added to lib/env.ts since neither backend nor consumer UI card ship
 * in wave-46; flag lands wave-46.5 alongside WeatherBriefCard UI
 * consumer mount.
 */

import type { NextRequest } from "next/server";

import type { WeatherBriefHour, WeatherBriefResponse } from "../../../../shared/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const CANNED_HOURS: ReadonlyArray<WeatherBriefHour> = [
  { hour_offset: 0, air_temp_c: 19, track_temp_c: 28, precipitation_mm: 0.0, wind_kph: 8, humidity_pct: 58 },
  { hour_offset: 1, air_temp_c: 20, track_temp_c: 31, precipitation_mm: 0.0, wind_kph: 9, humidity_pct: 56 },
  { hour_offset: 2, air_temp_c: 22, track_temp_c: 34, precipitation_mm: 0.0, wind_kph: 10, humidity_pct: 54 },
  { hour_offset: 3, air_temp_c: 23, track_temp_c: 36, precipitation_mm: 0.0, wind_kph: 11, humidity_pct: 52 },
  { hour_offset: 4, air_temp_c: 23, track_temp_c: 35, precipitation_mm: 0.2, wind_kph: 12, humidity_pct: 56 },
  { hour_offset: 5, air_temp_c: 21, track_temp_c: 32, precipitation_mm: 0.6, wind_kph: 14, humidity_pct: 63 },
];

export async function GET(_req: NextRequest): Promise<Response> {
  const t0 = performance.now();
  const payload: WeatherBriefResponse = {
    engine: "weather-brief-canned-fallback",
    compute_ms: Math.round(performance.now() - t0),
    source: "canned-fixture (Donington Park GP temperate-summer baseline)",
    venue: "Donington Park GP",
    session_start_iso: "2026-06-15T13:00:00Z",
    hours: CANNED_HOURS,
    headline:
      "Dry start (track 28-36 C across the session). Light shower window opens hour 4-5; soft compound risk if running long stints into the precipitation band. Track temp peaks hour 3.",
  };
  return Response.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "X-Apex-Weather-Brief-Engine": payload.engine,
    },
  });
}
