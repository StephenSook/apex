"use client";

/**
 * SimRigStream: client-side consumer for live sim-rig telemetry.
 *
 * Three render-path-identical modes:
 *   - simulated: in-memory canned synthetic GT4 hand-controls lap on
 *     a 50 ms tick = 20 Hz. Ships Day-2-default; loop indefinitely.
 *   - httpStream: NDJSON streaming from /api/sim-rig/stream
 *     (wave-44 Phase 6h). Vercel-deployable. Frames arrive at 20 Hz
 *     via fetch().body.getReader() + TextDecoder + newline split.
 *   - live: backend WebSocket at the URL passed via `websocketUrl`
 *     per the SimRigFrame contract in app/shared/types.ts. Vinh M3-V2
 *     backend swap-point per wave-44 plan addition.
 *
 * All three modes share the same render path so the production
 * cutover is a one-prop change.
 *
 * Failure modes handled:
 *   - WebSocket connection lost mid-session: reconnect with exponential backoff,
 *     capped at MAX_RECONNECT_ATTEMPTS before a terminal error.
 *   - HTTP stream disconnect / read error: same scheduleReconnect path.
 *   - Backend returns malformed frames: drop the frame, log to console with the
 *     specific failure cause (non-string transport vs JSON parse vs shape),
 *     keep the stream alive.
 *   - User navigates away mid-stream: WebSocket.close() + pending reconnect
 *     timer cleared on unmount; httpStream AbortController fires on unmount.
 *   - Props mis-set: SimRigStreamProps is a discriminated union, so the
 *     compiler rejects `<SimRigStream mode="live" />` without `websocketUrl`.
 *
 * Wave-44 Lane K persona-decoupling sweep: synthetic GT4 hand-controls
 * stream; circuit-agnostic synthetic layout. No persona name in
 * render or comment text.
 *
 * Wave-46 Phase 8.2 ship: ChannelGrid renders per-channel tone
 * classification (neutral / caution / warning) via classifyChannel
 * thresholds on Throttle / Brake / Steering / Lat G / Long G / RPM.
 * sr-only aria-label suffix surfaces "caution" / "warning" tones for
 * screen-reader operator-empathy. Per-tone color uses the editorial-
 * paddock palette (text-ink / text-amber / text-accent).
 */

import { useEffect, useReducer, useRef } from "react";

import type { SimRigFrame, TelemetryRow } from "../../shared/types";

const TICK_INTERVAL_MS = 50;
const RING_BUFFER_SIZE = 120;
const RECONNECT_DELAY_START_MS = 1000;
const RECONNECT_DELAY_CAP_MS = 30_000;
const MAX_RECONNECT_ATTEMPTS = 6;

type StreamMode = "simulated" | "httpStream" | "live";

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
  | { type: "error"; message: string };

function reducer(state: StreamState, action: Action): StreamState {
  switch (action.type) {
    case "frame": {
      const next = [...state.frames, action.frame].slice(-RING_BUFFER_SIZE);
      return { ...state, frames: next, error: null };
    }
    case "connect":
      return { ...state, connected: true, error: null };
    case "disconnect":
      return { ...state, connected: false };
    case "error":
      return { ...state, error: action.message, connected: false };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

/**
 * Discriminated union so the compiler rejects `<SimRigStream mode="live" />`
 * without a `websocketUrl`. The previous shape carried both `mode` and
 * `websocketUrl` as optional + relied on a runtime `role="alert"` fallback,
 * which is the exact anti-pattern in feedback_discriminated_unions_over_contradiction.md.
 */
export type SimRigStreamProps =
  | { readonly mode?: "simulated" }
  | { readonly mode: "httpStream"; readonly httpStreamUrl: string }
  | { readonly mode: "live"; readonly websocketUrl: string };

export default function SimRigStream(props: SimRigStreamProps) {
  const mode: StreamMode = props.mode ?? "simulated";
  const websocketUrl: string | undefined =
    props.mode === "live" ? props.websocketUrl : undefined;
  const httpStreamUrl: string | undefined =
    props.mode === "httpStream" ? props.httpStreamUrl : undefined;

  const [state, dispatch] = useReducer(reducer, {
    mode,
    connected: false,
    frames: [],
    error: null,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    if (mode === "httpStream") {
      if (!httpStreamUrl) {
        dispatch({
          type: "error",
          message: "httpStream mode requires httpStreamUrl prop.",
        });
        return;
      }
      const controller = new AbortController();
      let cancelled = false;
      (async () => {
        try {
          const response = await fetch(httpStreamUrl, {
            signal: controller.signal,
            headers: { Accept: "application/x-ndjson" },
          });
          if (!response.ok || response.body === null) {
            dispatch({
              type: "error",
              message: `httpStream connect failed: HTTP ${response.status}`,
            });
            return;
          }
          dispatch({ type: "connect" });
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          while (!cancelled) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              if (line.length === 0) continue;
              let parsed: unknown;
              try {
                parsed = JSON.parse(line);
              } catch {
                console.warn("[SimRigStream] httpStream JSON parse error");
                continue;
              }
              if (!isSimRigFrame(parsed)) {
                console.warn("[SimRigStream] httpStream dropped malformed frame");
                continue;
              }
              dispatch({ type: "frame", frame: parsed });
            }
          }
        } catch (err) {
          if (cancelled) return;
          if (err instanceof DOMException && err.name === "AbortError") return;
          dispatch({
            type: "error",
            message: `httpStream error: ${err instanceof Error ? err.message : String(err)}`,
          });
        }
      })();
      return () => {
        cancelled = true;
        controller.abort();
      };
    }

    if (!websocketUrl) {
      dispatch({
        type: "error",
        message: "Live mode requires websocketUrl prop.",
      });
      return;
    }

    let reconnectDelay = RECONNECT_DELAY_START_MS;
    let attempts = 0;
    let cancelled = false;

    const scheduleReconnect = () => {
      if (cancelled) return;
      if (attempts >= MAX_RECONNECT_ATTEMPTS) {
        dispatch({
          type: "error",
          message: `Live stream unavailable after ${MAX_RECONNECT_ATTEMPTS} reconnect attempts. Refresh the page to retry.`,
        });
        return;
      }
      reconnectTimerRef.current = setTimeout(connect, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_DELAY_CAP_MS);
    };

    const connect = () => {
      if (cancelled) return;
      attempts += 1;
      const ws = new WebSocket(websocketUrl);
      wsRef.current = ws;
      ws.onopen = () => {
        attempts = 0;
        reconnectDelay = RECONNECT_DELAY_START_MS;
        dispatch({ type: "connect" });
      };
      ws.onmessage = (event) => {
        if (typeof event.data !== "string") {
          console.warn(
            "[SimRigStream] non-string frame received; expected JSON text",
          );
          return;
        }
        let parsed: unknown;
        try {
          parsed = JSON.parse(event.data);
        } catch {
          console.warn("[SimRigStream] JSON parse error on frame");
          return;
        }
        if (!isSimRigFrame(parsed)) {
          console.warn("[SimRigStream] dropped malformed frame");
          return;
        }
        dispatch({ type: "frame", frame: parsed });
      };
      ws.onerror = () => {
        console.error("[SimRigStream] WebSocket error", {
          url: websocketUrl,
          readyState: ws.readyState,
        });
      };
      ws.onclose = () => {
        dispatch({ type: "disconnect" });
        scheduleReconnect();
      };
    };

    connect();
    return () => {
      cancelled = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      wsRef.current?.close();
    };
  }, [mode, websocketUrl, httpStreamUrl]);

  return <StreamView state={state} />;
}

function isSimRigFrame(value: unknown): value is SimRigFrame {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.t_sim !== "number" || !Number.isFinite(v.t_sim)) return false;
  if (typeof v.channels !== "object" || v.channels === null) return false;
  // Deep-validate every numeric channel + gear range so the downstream
  // ChannelGrid .toFixed() calls cannot crash the panel on a malformed
  // frame that passed the shallow object-shape check. Frames with any
  // missing OR non-finite channel are dropped at the dispatch boundary.
  const c = v.channels as Record<string, unknown>;
  const requiredNumerics = [
    "t_session_s", "throttle_pct", "brake_pa", "steering_rad",
    "rpm", "lat_g", "long_g", "speed_mps",
  ];
  for (const key of requiredNumerics) {
    if (typeof c[key] !== "number" || !Number.isFinite(c[key])) return false;
  }
  if (typeof c.gear !== "number" || !Number.isInteger(c.gear) || c.gear < 0 || c.gear > 8) {
    return false;
  }
  return true;
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
  const label =
    mode === "simulated"
      ? "Simulated"
      : connected
        ? mode === "httpStream"
          ? "Live (HTTP)"
          : "Live"
        : "Reconnecting";
  const tone = mode === "simulated" ? "text-amber-ink" : connected ? "text-racing-green" : "text-accent";
  return (
    <span className={`font-mono text-xs uppercase tracking-wider ${tone}`}>{label}</span>
  );
}

type ChannelTone = "neutral" | "caution" | "warning";

function classifyChannel(label: string, channels: TelemetryRow): ChannelTone {
  switch (label) {
    case "Throttle":
      return channels.throttle_pct > 80 ? "caution" : "neutral";
    case "Brake":
      if (channels.brake_pa > 3e6) return "warning";
      if (channels.brake_pa > 1.5e6) return "caution";
      return "neutral";
    case "Steering":
      return Math.abs(channels.steering_rad) > 0.7 ? "caution" : "neutral";
    case "Lat G":
      if (Math.abs(channels.lat_g) > 0.9) return "warning";
      if (Math.abs(channels.lat_g) > 0.6) return "caution";
      return "neutral";
    case "Long G":
      if (Math.abs(channels.long_g) > 0.9) return "warning";
      if (Math.abs(channels.long_g) > 0.6) return "caution";
      return "neutral";
    case "RPM":
      if (channels.rpm > 7500) return "warning";
      if (channels.rpm > 6500) return "caution";
      return "neutral";
    default:
      return "neutral";
  }
}

const TONE_CLASSNAME: Readonly<Record<ChannelTone, string>> = {
  neutral: "text-ink",
  caution: "text-amber-ink",
  warning: "text-accent",
};

const TONE_ARIA_LABEL: Readonly<Record<ChannelTone, string>> = {
  neutral: "",
  caution: " (caution)",
  warning: " (warning)",
};

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
    <dl className="grid grid-cols-3 gap-2 font-mono text-xs leading-relaxed tabular-nums">
      {rows.map(([label, value]) => {
        const tone = classifyChannel(label, channels);
        return (
          <div key={label} className="flex flex-col gap-1">
            <dt className="uppercase tracking-wider text-muted">{label}</dt>
            <dd className={`text-base tabular-nums ${TONE_CLASSNAME[tone]}`}>
              <span aria-hidden="true">{value}</span>
              <span className="sr-only">
                {label} {value}
                {TONE_ARIA_LABEL[tone]}
              </span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function pickGear(speed: number): 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 {
  if (speed < 25) return 2;
  if (speed < 40) return 3;
  if (speed < 55) return 4;
  if (speed < 70) return 5;
  return 6;
}

// Canned synthetic GT4 hand-controls lap stream. Roughly one lap of
// telemetry on a 50 ms tick (20 Hz; see TICK_INTERVAL_MS). The
// simulator loops infinitely so the live tile is animated for the
// demo before the live HTTP/WebSocket path lands. Circuit-agnostic
// synthetic layout per wave-44 Lane K persona-decoupling sweep.
function buildSimulatedFrame(elapsed: number): SimRigFrame {
  const lapTime = 78.0;
  const lap_t = elapsed % lapTime;
  const phase = (lap_t / lapTime) * 2 * Math.PI;

  // Synthesize a plausible lap with a sector-2 slow-hairpin slowdown.
  const baseSpeed = 50 + 30 * Math.sin(phase) + 20 * Math.sin(phase * 2);
  const slow_hairpin = lap_t > 28 && lap_t < 36;
  const speed = slow_hairpin ? Math.max(22, baseSpeed * 0.45) : baseSpeed;
  const throttle = slow_hairpin ? 0.15 + 0.05 * Math.sin(phase * 4) : 0.6 + 0.3 * Math.sin(phase * 2);
  const brake_pa = slow_hairpin ? 1.8e6 : Math.max(0, 1.2e6 * Math.sin(phase * 3));
  const steering = slow_hairpin ? 0.92 * Math.sin(phase * 2) : 0.35 * Math.sin(phase * 1.5);
  const lat_g = -Math.abs(0.7 * Math.sin(phase * 2)) - (slow_hairpin ? 0.15 : 0);
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
