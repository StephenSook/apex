"use client";

/**
 * SimRigStream: client-side consumer for live sim-rig telemetry.
 *
 * Ships against an in-memory simulated stream today (synthetic Sarah Reynolds
 * Donington lap on a 50 ms tick = 20 Hz). Live mode connects to a backend
 * WebSocket at the URL passed via `websocketUrl` per the SimRigFrame contract
 * in app/shared/types.ts. Simulated mode + live mode share the same render
 * path so the production cutover is a one-prop change.
 *
 * Failure modes handled:
 *   - WebSocket connection lost mid-session: reconnect with exponential backoff.
 *   - Backend returns malformed frames: drop the frame, log to console, keep stream alive.
 *   - User navigates away mid-stream: WebSocket.close() on unmount.
 */

import { useEffect, useReducer, useRef } from "react";

import type { SimRigFrame, TelemetryRow } from "../../shared/types";

const TICK_INTERVAL_MS = 50;
const RING_BUFFER_SIZE = 120;

type StreamMode = "simulated" | "live";

interface StreamState {
  readonly mode: StreamMode;
  readonly connected: boolean;
  readonly frames: ReadonlyArray<SimRigFrame>;
  readonly error: string | null;
}

type Action =
  | { type: "frame"; frame: SimRigFrame }
  | { type: "connect" }
  | { type: "disconnect" }
  | { type: "error"; message: string }
  | { type: "reset" };

function reducer(state: StreamState, action: Action): StreamState {
  switch (action.type) {
    case "frame": {
      const next = [...state.frames, action.frame];
      if (next.length > RING_BUFFER_SIZE) next.splice(0, next.length - RING_BUFFER_SIZE);
      return { ...state, frames: next, error: null };
    }
    case "connect":
      return { ...state, connected: true, error: null };
    case "disconnect":
      return { ...state, connected: false };
    case "error":
      return { ...state, error: action.message, connected: false };
    case "reset":
      return { mode: state.mode, connected: false, frames: [], error: null };
    default:
      return state;
  }
}

export interface SimRigStreamProps {
  readonly mode?: StreamMode;
  readonly websocketUrl?: string;
}

export default function SimRigStream({
  mode = "simulated",
  websocketUrl,
}: SimRigStreamProps) {
  const [state, dispatch] = useReducer(reducer, {
    mode,
    connected: false,
    frames: [],
    error: null,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (mode === "simulated") {
      dispatch({ type: "connect" });
      const start = Date.now();
      intervalRef.current = setInterval(() => {
        const t = (Date.now() - start) / 1000;
        dispatch({ type: "frame", frame: buildSimulatedFrame(t) });
      }, TICK_INTERVAL_MS);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }

    if (!websocketUrl) {
      dispatch({ type: "error", message: "Live mode requires websocketUrl prop." });
      return;
    }

    let reconnectDelay = 1000;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      const ws = new WebSocket(websocketUrl);
      wsRef.current = ws;
      ws.onopen = () => dispatch({ type: "connect" });
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string) as SimRigFrame;
          if (typeof data.t_sim !== "number" || !data.channels) {
            console.warn("[SimRigStream] dropped malformed frame", data);
            return;
          }
          dispatch({ type: "frame", frame: data });
        } catch {
          console.warn("[SimRigStream] JSON parse error on frame");
        }
      };
      ws.onerror = () => dispatch({ type: "error", message: "WebSocket error." });
      ws.onclose = () => {
        dispatch({ type: "disconnect" });
        if (cancelled) return;
        setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 30000);
      };
    };

    connect();
    return () => {
      cancelled = true;
      wsRef.current?.close();
    };
  }, [mode, websocketUrl]);

  return <StreamView state={state} />;
}

function StreamView({ state }: { state: StreamState }) {
  const latest = state.frames[state.frames.length - 1];
  return (
    <article
      aria-live="polite"
      className="flex flex-col gap-3 rounded-sm border-2 border-rule bg-paper p-5"
    >
      <header className="flex items-baseline justify-between gap-3">
        <p className="apex-eyebrow">Live sim-rig stream</p>
        <ConnectionIndicator connected={state.connected} mode={state.mode} />
      </header>
      {state.error && (
        <p role="alert" className="font-mono text-xs leading-relaxed text-accent">
          {state.error}
        </p>
      )}
      {latest ? (
        <ChannelGrid channels={latest.channels} elapsed={latest.t_sim} />
      ) : (
        <p className="font-mono text-xs text-muted">Waiting for first frame...</p>
      )}
      <p className="font-mono text-xs text-muted">
        Ring buffer {state.frames.length} of {RING_BUFFER_SIZE} frames at {1000 / TICK_INTERVAL_MS} Hz.
      </p>
    </article>
  );
}

function ConnectionIndicator({
  connected,
  mode,
}: {
  connected: boolean;
  mode: StreamMode;
}) {
  const label = mode === "simulated" ? "Simulated" : connected ? "Live" : "Reconnecting";
  const tone = mode === "simulated" ? "text-amber" : connected ? "text-racing-green" : "text-accent";
  return (
    <span className={`font-mono text-xs uppercase tracking-wider ${tone}`}>{label}</span>
  );
}

function ChannelGrid({
  channels,
  elapsed,
}: {
  channels: TelemetryRow;
  elapsed: number;
}) {
  const rows: ReadonlyArray<readonly [string, string]> = [
    ["Elapsed", `${elapsed.toFixed(2)} s`],
    ["Speed", `${channels.speed_mps.toFixed(1)} m/s`],
    ["Throttle", `${channels.throttle_pct.toFixed(0)} %`],
    ["Brake", `${(channels.brake_pa / 1e6).toFixed(2)} MPa`],
    ["Steering", `${channels.steering_rad.toFixed(2)} rad`],
    ["Lat G", `${channels.lat_g.toFixed(2)}`],
    ["Long G", `${channels.long_g.toFixed(2)}`],
    ["Gear", `${channels.gear}`],
    ["RPM", `${channels.rpm.toFixed(0)}`],
  ];
  return (
    <dl className="grid grid-cols-3 gap-2 font-mono text-xs leading-relaxed">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-1">
          <dt className="uppercase tracking-wider text-muted">{label}</dt>
          <dd className="text-base text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Sarah Reynolds Donington Park lap-17 canned synthetic stream.
// Roughly one lap of telemetry on a 50 ms tick (20 Hz; see TICK_INTERVAL_MS).
// The simulator loops infinitely so the live tile is animated for the demo
// before the live WebSocket path lands.
function buildSimulatedFrame(elapsed: number): SimRigFrame {
  const lapTime = 78.0;
  const lap_t = elapsed % lapTime;
  const phase = (lap_t / lapTime) * 2 * Math.PI;

  // Synthesize a plausible lap with a sector-2 Old Hairpin slowdown.
  const baseSpeed = 50 + 30 * Math.sin(phase) + 20 * Math.sin(phase * 2);
  const old_hairpin = lap_t > 28 && lap_t < 36;
  const speed = old_hairpin ? Math.max(22, baseSpeed * 0.45) : baseSpeed;
  const throttle = old_hairpin ? 0.15 + 0.05 * Math.sin(phase * 4) : 0.6 + 0.3 * Math.sin(phase * 2);
  const brake_pa = old_hairpin ? 1.8e6 : Math.max(0, 1.2e6 * Math.sin(phase * 3));
  const steering = old_hairpin ? 0.92 * Math.sin(phase * 2) : 0.35 * Math.sin(phase * 1.5);
  const lat_g = -Math.abs(0.7 * Math.sin(phase * 2)) - (old_hairpin ? 0.15 : 0);
  const long_g = (throttle - brake_pa / 5e6) * 0.9;
  const rpm = 3500 + (speed / 80) * 4500;
  const gear = speed < 25 ? 2 : speed < 40 ? 3 : speed < 55 ? 4 : speed < 70 ? 5 : 6;

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
      gear: gear as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
    },
  };
}
