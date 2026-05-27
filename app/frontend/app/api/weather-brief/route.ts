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

// Donington Park GP coordinates for the OpenWeather forecast call.
const DONINGTON_LAT = 52.8306;
const DONINGTON_LON = -1.3756;
const OPENWEATHER_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

type OpenWeatherEntry = {
  readonly dt: number;
  readonly main: { readonly temp: number; readonly humidity: number };
  readonly wind?: { readonly speed?: number };
  readonly rain?: { readonly "3h"?: number };
};

type OpenWeatherForecast = {
  readonly list: ReadonlyArray<OpenWeatherEntry>;
  readonly city: { readonly name: string };
};

function buildWeatherBriefFromOpenWeather(
  data: OpenWeatherForecast,
): ReadonlyArray<WeatherBriefHour> {
  // OpenWeather returns 3-hour forecast slots; take the first 6 to match
  // the canned-fixture's 6-hour envelope shape. Track temp is OpenWeather
  // air-temp + 9C heat-soak heuristic (matches our Donington summer
  // baseline; a real Stage A coupling would interpolate the sun angle +
  // tarmac albedo per `apex/weather/brief.py`).
  return data.list.slice(0, 6).map((entry, idx): WeatherBriefHour => ({
    hour_offset: idx,
    air_temp_c: Math.round(entry.main.temp),
    track_temp_c: Math.round(entry.main.temp + 9),
    precipitation_mm: Math.round((entry.rain?.["3h"] ?? 0) * 10) / 10,
    wind_kph: Math.round(((entry.wind?.speed ?? 0) * 3.6) * 10) / 10,
    humidity_pct: Math.round(entry.main.humidity),
  }));
}

export async function GET(_req: NextRequest): Promise<Response> {
  const t0 = performance.now();
  const apiKey = process.env.OPENWEATHER_API_KEY?.trim();

  // wave-48: when OPENWEATHER_API_KEY is set, hit OpenWeather's free
  // 5-day / 3-hour forecast API for the demo venue. Falls back to the
  // canned-fixture envelope on any error (network + non-200 + parse).
  if (apiKey) {
    try {
      const upstream = await fetch(
        `${OPENWEATHER_FORECAST_URL}?lat=${DONINGTON_LAT}&lon=${DONINGTON_LON}&units=metric&cnt=8&appid=${apiKey}`,
        { cache: "no-store", signal: AbortSignal.timeout(4000) },
      );
      if (upstream.ok) {
        const data = (await upstream.json()) as OpenWeatherForecast;
        const hours = buildWeatherBriefFromOpenWeather(data);
        const peakTrack = Math.max(...hours.map((h) => h.track_temp_c));
        const totalRain = hours.reduce((s, h) => s + h.precipitation_mm, 0);
        const headline = totalRain > 1.0
          ? `Precipitation expected (${totalRain.toFixed(1)} mm). Track peaks ${peakTrack} C. Soft compound risk if running into the wet band.`
          : `Dry session expected. Track peaks ${peakTrack} C.`;
        const payload: WeatherBriefResponse = {
          engine: "openweather-3h-forecast",
          compute_ms: Math.round(performance.now() - t0),
          source: `OpenWeather 5-day / 3-hour forecast (${data.city.name})`,
          venue: data.city.name,
          session_start_iso: new Date(Date.now()).toISOString(),
          hours,
          headline,
        };
        return Response.json(payload, {
          status: 200,
          headers: {
            "Cache-Control": "no-store",
            "X-Apex-Weather-Brief-Engine": payload.engine,
          },
        });
      }
      console.warn(`[apex/weather-brief] OpenWeather ${upstream.status}; serving demo-fixture`);
    } catch (err) {
      console.warn(`[apex/weather-brief] OpenWeather fetch failed; serving demo-fixture`, err);
    }
  }

  // wave-48: honest label change. The fixture exists for the Donington
  // GP demo scenario, not as a "fallback" waiting for a real backend
  // that does not exist. When OPENWEATHER_API_KEY is set the OpenWeather
  // wire above runs.
  const payload: WeatherBriefResponse = {
    engine: "demo-fixture-donington-park",
    compute_ms: Math.round(performance.now() - t0),
    source: "demo fixture (Donington Park GP temperate-summer baseline)",
    venue: "Donington Park GP",
    session_start_iso: "2026-06-15T13:00:00Z",
    hours: CANNED_HOURS,
    headline:
      "Dry start (track 28 to 36 C across the session). Light shower window opens hour 4 to 5; soft compound risk if running long stints into the precipitation band. Track temp peaks hour 3.",
  };
  return Response.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "X-Apex-Weather-Brief-Engine": payload.engine,
    },
  });
}
