"use client";

/**
 * CoachingReportLiveCharts: Recharts triple-panel rendering Lap Time
 * progression + Tire Wear + Speed/Brake Temp from the wave-42 mock
 * fixture. Lives below CornerList + ForecastChart in CoachingReport;
 * surfaces the time-series telemetry context that the per-corner
 * insights are derived from so judges can pattern-match the
 * recommendation prose against the underlying lap-shape.
 *
 * Wave-42 Lane A.F.3 close-out per the competitor field deep-dive
 * memory `project_apex_competitor_field_may_challenge.md` steal-list
 * HIGH-value item #2 (RaceMind AI dashboard chart pattern). APEX
 * adapts the triple-panel layout to the adaptive-racer telemetry
 * dimensions: Lap Time (sector delta vs reference), Tire Wear
 * (degradation percent per lap), Speed + Brake Temp (dual-axis per
 * lap).
 *
 * Editorial-paddock palette: --color-racing-green for baseline +
 * --color-accent for hot lap + --color-amber for caution zones +
 * --color-rule for axes + --color-paper-warm for chart background.
 *
 * Memoization: React.memo keyed on report.audit_id (branded AuditId
 * from cascade-#11 propagation) to prevent re-render churn when the
 * parent CoachingReport re-renders for unrelated reasons.
 *
 * Mock-fixture phase: production wires the per-lap telemetry payload
 * via Stream M.3 spec handoff backend extension (Vinh adds the
 * `lap_history[].lap_time_s + tire_wear_pct + avg_speed_mph +
 * brake_temp_c` payload to the AnalyzeResponse emitter in his next
 * sync window).
 */

import { memo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CoachingReport } from "../../shared/types";

interface LapTimePoint {
  readonly lap: number;
  readonly delta_s: number;
  readonly reference_s: number;
}

interface TireWearPoint {
  readonly lap: number;
  readonly degradation_pct: number;
}

interface SpeedBrakePoint {
  readonly lap: number;
  readonly avg_speed_mph: number;
  readonly brake_temp_c: number;
}

// Mock-fixture data; backend wires per Stream M.3 spec extension.
const MOCK_LAP_TIMES: ReadonlyArray<LapTimePoint> = [
  { lap: 1, delta_s: 0.0, reference_s: 0.0 },
  { lap: 2, delta_s: 0.18, reference_s: 0.0 },
  { lap: 3, delta_s: 0.05, reference_s: 0.0 },
  { lap: 4, delta_s: -0.12, reference_s: 0.0 },
  { lap: 5, delta_s: 0.34, reference_s: 0.0 },
  { lap: 6, delta_s: 0.21, reference_s: 0.0 },
  { lap: 7, delta_s: -0.08, reference_s: 0.0 },
];

const MOCK_TIRE_WEAR: ReadonlyArray<TireWearPoint> = [
  { lap: 1, degradation_pct: 4 },
  { lap: 2, degradation_pct: 11 },
  { lap: 3, degradation_pct: 19 },
  { lap: 4, degradation_pct: 28 },
  { lap: 5, degradation_pct: 38 },
  { lap: 6, degradation_pct: 49 },
  { lap: 7, degradation_pct: 62 },
];

const MOCK_SPEED_BRAKE: ReadonlyArray<SpeedBrakePoint> = [
  { lap: 1, avg_speed_mph: 142, brake_temp_c: 380 },
  { lap: 2, avg_speed_mph: 145, brake_temp_c: 420 },
  { lap: 3, avg_speed_mph: 147, brake_temp_c: 460 },
  { lap: 4, avg_speed_mph: 148, brake_temp_c: 510 },
  { lap: 5, avg_speed_mph: 144, brake_temp_c: 580 },
  { lap: 6, avg_speed_mph: 142, brake_temp_c: 620 },
  { lap: 7, avg_speed_mph: 146, brake_temp_c: 590 },
];

interface CoachingReportLiveChartsProps {
  readonly report: CoachingReport;
}

function CoachingReportLiveChartsBase(_props: CoachingReportLiveChartsProps) {
  return (
    <section
      aria-labelledby="live-charts-title"
      className="flex flex-col gap-4 rounded-sm border border-rule bg-paper-warm p-5"
    >
      <header>
        <p className="apex-eyebrow">Live charts · wave-42 Lane A.F.3</p>
        <h3
          id="live-charts-title"
          className="font-display text-2xl tracking-tight text-ink"
        >
          Lap-over-lap telemetry context.
        </h3>
        <p className="pt-1 text-xs leading-relaxed text-ink-soft">
          Three panels covering pace progression + tire degradation +
          speed-vs-brake-temp coupling. Mock fixture for the Day-6 demo;
          backend wires per Stream M.3 spec extension.
        </p>
      </header>

      <div className="flex flex-col gap-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
          Lap-time delta vs reference (seconds; positive = slower)
        </p>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[...MOCK_LAP_TIMES]} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="var(--color-rule)" strokeDasharray="3 3" />
              <XAxis
                dataKey="lap"
                tick={{ fontSize: 10, fill: "var(--color-muted)" }}
                stroke="var(--color-rule)"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--color-muted)" }}
                stroke="var(--color-rule)"
                domain={["dataMin - 0.1", "dataMax + 0.1"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-paper)",
                  border: "1px solid var(--color-rule)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="delta_s"
                stroke="var(--color-accent)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--color-accent)" }}
                name="Delta (s)"
              />
              <Line
                type="monotone"
                dataKey="reference_s"
                stroke="var(--color-racing-green)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="Reference"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
          Tire degradation across stint (percent)
        </p>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={[...MOCK_TIRE_WEAR]}
              margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
            >
              <CartesianGrid stroke="var(--color-rule)" strokeDasharray="3 3" />
              <XAxis
                dataKey="lap"
                tick={{ fontSize: 10, fill: "var(--color-muted)" }}
                stroke="var(--color-rule)"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--color-muted)" }}
                stroke="var(--color-rule)"
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-paper)",
                  border: "1px solid var(--color-rule)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                }}
              />
              <Area
                type="monotone"
                dataKey="degradation_pct"
                stroke="var(--color-amber)"
                fill="var(--color-amber)"
                fillOpacity={0.3}
                name="Degradation (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
          Average speed + brake disc temperature per lap
        </p>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[...MOCK_SPEED_BRAKE]}
              margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
            >
              <CartesianGrid stroke="var(--color-rule)" strokeDasharray="3 3" />
              <XAxis
                dataKey="lap"
                tick={{ fontSize: 10, fill: "var(--color-muted)" }}
                stroke="var(--color-rule)"
              />
              <YAxis
                yAxisId="speed"
                orientation="left"
                tick={{ fontSize: 10, fill: "var(--color-muted)" }}
                stroke="var(--color-rule)"
                domain={[130, 160]}
              />
              <YAxis
                yAxisId="temp"
                orientation="right"
                tick={{ fontSize: 10, fill: "var(--color-muted)" }}
                stroke="var(--color-rule)"
                domain={[300, 700]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-paper)",
                  border: "1px solid var(--color-rule)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                }}
              />
              <Legend
                wrapperStyle={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--color-muted)",
                }}
              />
              <Bar
                yAxisId="speed"
                dataKey="avg_speed_mph"
                fill="var(--color-racing-green)"
                name="Avg speed (mph)"
              />
              <Bar
                yAxisId="temp"
                dataKey="brake_temp_c"
                fill="var(--color-accent)"
                name="Brake temp (C)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Cross-ref:{" "}
        <span className="text-ink-soft">
          steal-list HIGH item #2 (RaceMind AI dashboard chart pattern);
          backend wires per Stream M.3 spec
        </span>
      </p>
    </section>
  );
}

const CoachingReportLiveCharts = memo(
  CoachingReportLiveChartsBase,
  (prev, next) => prev.report.audit?.audit_id === next.report.audit?.audit_id,
);

export default CoachingReportLiveCharts;
