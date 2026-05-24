"use client";

/**
 * RaceEventsTilesRow: 4-tile session-context row that lives above the
 * eight-tier physics grid on /judges. Mock for wave-41 visualization;
 * wires to real telemetry feed per the `/api/session-context`
 * endpoint spec in the Stream M.3 spec handoff at
 * `docs/wave-41-backend-spec-handoff.md`.
 *
 * Wave-41 Stream G.5 close-out per the competitor field deep-dive
 * memory `project_apex_competitor_field_may_challenge.md` steal-list
 * MEDIUM-value item #5 (RaceMind AI RaceEventsBar.jsx). RaceMind ships
 * dynamic race-event tiles (Yellow Flag + DRS Enabled + Tire Critical
 * + Rain Detected) with status badges + colored borders that visually
 * energize the dashboard density. APEX adapts the pattern to the
 * adaptive-racer session-context dimensions: Track Temp + Weather +
 * Tire State + Session Phase.
 *
 * Editorial-paddock palette: warm cream paper background + per-tile
 * accent border tied to status (amber for "monitor"; signal clay for
 * "critical"; deep racing green for "ok").
 *
 * Per `feedback_discriminated_unions_over_contradiction.md`: tile state
 * is a tagged-union variant per tile category so a future "ok" /
 * "monitor" / "critical" variant for any dimension cannot accidentally
 * carry the wrong payload.
 */

const TRACK_TEMP_C = 42;
const RAIN_PROBABILITY_PCT = 75;
const TIRE_LAP = 18;
const TIRE_DEGRADATION_PCT = 67;
const SESSION_RACE_LAP = 45;
const SESSION_TOTAL_LAPS = 78;

type TileSeverity = "ok" | "monitor" | "critical";

function severityBorder(severity: TileSeverity): string {
  switch (severity) {
    case "ok":
      return "border-racing-green";
    case "monitor":
      return "border-amber";
    case "critical":
      return "border-accent";
    default: {
      const _exhaustive: never = severity;
      throw new Error(`unknown RaceEventsTile severity: ${String(_exhaustive)}`);
    }
  }
}

function severityLabel(severity: TileSeverity): string {
  switch (severity) {
    case "ok":
      return "OK";
    case "monitor":
      return "Monitor";
    case "critical":
      return "Critical";
    default: {
      const _exhaustive: never = severity;
      throw new Error(`unknown RaceEventsTile severity: ${String(_exhaustive)}`);
    }
  }
}

interface RaceEventsTile {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly severity: TileSeverity;
}

const MOCK_TILES: ReadonlyArray<RaceEventsTile> = [
  {
    key: "track-temp",
    label: "Track temperature",
    value: `${TRACK_TEMP_C}°C`,
    detail: "Within Pirelli soft-compound operating window (35-50°C).",
    severity: "ok",
  },
  {
    key: "weather",
    label: "Weather",
    value: "Dry",
    detail: `Rain probability ${RAIN_PROBABILITY_PCT}% within the next hour per Met Office radar mock.`,
    severity: "monitor",
  },
  {
    key: "tire-state",
    label: "Tire state",
    value: `Soft · lap ${TIRE_LAP}`,
    detail: `Degradation ${TIRE_DEGRADATION_PCT}% per stint-degradation curve; pit window opens at lap ${TIRE_LAP + 3}.`,
    severity: "monitor",
  },
  {
    key: "session-phase",
    label: "Session phase",
    value: `Race · ${SESSION_RACE_LAP} of ${SESSION_TOTAL_LAPS}`,
    detail: "Strategic phase: undercut window open against immediate prior competitor.",
    severity: "ok",
  },
];

export default function RaceEventsTilesRow() {
  return (
    <section
      aria-labelledby="race-events-tiles-title"
      className="flex flex-col gap-3"
    >
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p className="apex-eyebrow">Session context · wave-41 Stream G.5</p>
          <h3
            id="race-events-tiles-title"
            className="font-display text-2xl tracking-tight text-ink"
          >
            Live from the track.
          </h3>
        </div>
        <span className="rounded-sm border border-rule bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted">
          Mock fixture · /api/session-context spec
        </span>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_TILES.map((tile) => (
          <li
            key={tile.key}
            className={`flex flex-col gap-2 rounded-sm border-2 ${severityBorder(tile.severity)} bg-paper-warm p-4`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {tile.label}
              </p>
              <span
                className={`rounded-sm border border-rule bg-paper px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                  tile.severity === "ok"
                    ? "text-racing-green"
                    : tile.severity === "monitor"
                      ? "text-amber"
                      : "text-accent"
                }`}
              >
                {severityLabel(tile.severity)}
              </span>
            </div>
            <p className="font-display text-2xl tracking-tight text-ink">{tile.value}</p>
            <p className="text-xs leading-snug text-ink-soft">{tile.detail}</p>
          </li>
        ))}
      </ul>
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Cross-ref:{" "}
        <span className="text-ink-soft">
          steal-list MEDIUM item #5 (RaceMind AI RaceEventsBar.jsx pattern;
          competitor field deep-dive memory wave-41 day 5)
        </span>
      </p>
    </section>
  );
}
