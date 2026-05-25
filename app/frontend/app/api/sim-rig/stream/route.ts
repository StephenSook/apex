/**
 * Wave-44 Phase 6h sim-rig live HTTP-stream endpoint. Backs the
 * SimRigStream client `httpStream` mode + activates Stretch S1 from
 * PLAN.md (live telemetry path on the demo Day 10 deploy without
 * requiring a separate WebSocket server).
 *
 * Wire shape: NDJSON (newline-delimited JSON) frames emitted at 20Hz
 * via ReadableStream. Each frame is a SimRigFrame per shared/types.ts.
 * Client consumes via fetch().body.getReader() + TextDecoder + split
 * on newline. Vercel Fluid Compute supports streaming responses + the
 * 5-minute function-timeout budget exceeds any single coaching
 * session.
 *
 * Backend swap-point: Vinh M3-V2 endpoint at app/backend/apex/sim_rig/
 * websocket_server.py per wave-44 plan Vinh-scope V2 addition. When
 * that lands, /api/sim-rig/stream stays as the Vercel-side proxy /
 * fallback + the Live page can opt into either path via the mode prop.
 * Render path stays identical between simulated + httpStream + live
 * WebSocket modes per Stream M.3 spec extension.
 *
 * Wave-44 Lane K persona-decoupling: synthetic GT4 hand-controls lap
 * stream; circuit-agnostic; no driver persona in route shape.
 */

import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TICK_INTERVAL_MS = 50;
const LAP_LENGTH_S = 78;

interface TelemetryChannels {
  readonly t_session_s: number;
  readonly throttle_pct: number;
  readonly brake_pa: number;
  readonly steering_rad: number;
  readonly rpm: number;
  readonly lat_g: number;
  readonly long_g: number;
  readonly speed_mps: number;
  readonly gear: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

interface SimRigFrame {
  readonly t_sim: number;
  readonly channels: TelemetryChannels;
}

function pickGear(speed: number): 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 {
  if (speed < 25) return 2;
  if (speed < 40) return 3;
  if (speed < 55) return 4;
  if (speed < 70) return 5;
  return 6;
}

function buildFrame(elapsed: number): SimRigFrame {
  const lap_t = elapsed % LAP_LENGTH_S;
  const phase = (lap_t / LAP_LENGTH_S) * 2 * Math.PI;
  const baseSpeed = 50 + 30 * Math.sin(phase) + 20 * Math.sin(phase * 2);
  const slowHairpin = lap_t > 28 && lap_t < 36;
  const speed = slowHairpin ? Math.max(22, baseSpeed * 0.45) : baseSpeed;
  const throttle = slowHairpin
    ? 0.15 + 0.05 * Math.sin(phase * 4)
    : 0.6 + 0.3 * Math.sin(phase * 2);
  const brake_pa = slowHairpin
    ? 1.8e6
    : Math.max(0, 1.2e6 * Math.sin(phase * 3));
  const steering = slowHairpin
    ? 0.92 * Math.sin(phase * 2)
    : 0.35 * Math.sin(phase * 1.5);
  const lat_g = -Math.abs(0.7 * Math.sin(phase * 2)) - (slowHairpin ? 0.15 : 0);
  const long_g = (throttle - brake_pa / 5e6) * 0.9;
  const rpm = 3500 + (speed / 80) * 4500;

  return {
    t_sim: elapsed,
    channels: {
      t_session_s: elapsed,
      throttle_pct: Math.max(0, Math.min(100, throttle * 100)),
      brake_pa,
      steering_rad: steering,
      rpm,
      lat_g,
      long_g,
      speed_mps: speed,
      gear: pickGear(speed),
    },
  };
}

export async function GET(req: NextRequest): Promise<Response> {
  const encoder = new TextEncoder();
  const start = Date.now();
  let intervalHandle: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const emit = () => {
        if (req.signal.aborted) {
          if (intervalHandle !== null) {
            clearInterval(intervalHandle);
            intervalHandle = null;
          }
          try {
            controller.close();
          } catch {
            // Already closed.
          }
          return;
        }
        const elapsed = (Date.now() - start) / 1000;
        const frame = buildFrame(elapsed);
        const line = `${JSON.stringify(frame)}\n`;
        try {
          controller.enqueue(encoder.encode(line));
        } catch {
          if (intervalHandle !== null) {
            clearInterval(intervalHandle);
            intervalHandle = null;
          }
        }
      };
      // Emit first frame immediately so clients see data before the
      // first interval tick.
      emit();
      intervalHandle = setInterval(emit, TICK_INTERVAL_MS);

      // Wire abort cleanup so the consumer disconnect tears down the
      // interval + closes the controller.
      req.signal.addEventListener("abort", () => {
        if (intervalHandle !== null) {
          clearInterval(intervalHandle);
          intervalHandle = null;
        }
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      });
    },
    cancel() {
      if (intervalHandle !== null) {
        clearInterval(intervalHandle);
        intervalHandle = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store, no-transform",
      "X-Apex-Stream-Shape": "ndjson-simrigframe-20hz",
    },
  });
}
