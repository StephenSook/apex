"use client";

/**
 * TelemetryUploadPanel: interactive file picker + multipart-POST upload
 * to /api/upload-telemetry. Renders strict-parser result inline with
 * per-channel summary stats + head-preview table. Wave-46 D-058 Phase
 * 7.5 close-out.
 *
 * Discriminated-union state per `feedback_discriminated_unions_over_contradiction.md`:
 *   - idle: file picker ready
 *   - uploading: POST in flight
 *   - ready: response received + parsed
 *   - error: 4xx validation or 5xx parse failure (role=alert)
 *
 * Operator empathy: judges who run an adaptive racer or grassroots club
 * series can upload their own session CSV + see APEX parse it inline.
 * No sign-in, no cloud upload (everything stays on the apex-one-black
 * Vercel deploy).
 */

import { useRef, useState } from "react";

import type { UploadTelemetryResponse } from "../../shared/types";

type PanelState =
  | { readonly status: "idle" }
  | { readonly status: "uploading"; readonly filename: string }
  | { readonly status: "ready"; readonly payload: UploadTelemetryResponse }
  | { readonly status: "error"; readonly message: string };

const ACCEPTED_TYPES = ".csv,text/csv,application/vnd.ms-excel";

export default function TelemetryUploadPanel() {
  const [state, setState] = useState<PanelState>({ status: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setState({ status: "uploading", filename: file.name });
    try {
      const formData = new FormData();
      formData.append("csv", file);
      const res = await fetch("/api/upload-telemetry", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        throw new Error(errBody.message ?? `HTTP ${res.status}`);
      }
      const payload = (await res.json()) as UploadTelemetryResponse;
      setState({ status: "ready", payload });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file !== undefined) void handleFile(file);
  };

  const handleReset = () => {
    setState({ status: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isUploading = state.status === "uploading";

  return (
    <section
      aria-labelledby="telemetry-upload-panel-title"
      className="flex flex-col gap-4 rounded-sm border-2 border-rule bg-paper p-5"
    >
      <header>
        <p className="apex-eyebrow">Strict-parser upload (max 5 MB, 10 000 rows, canonical APEX-Bench header)</p>
        <h2
          id="telemetry-upload-panel-title"
          className="font-display text-2xl tracking-tight text-ink"
        >
          Bring your own CSV.
        </h2>
      </header>

      <label className="flex flex-col gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
          Telemetry CSV (header row + data rows; t_session_s + throttle_pct + brake_pa + steering_rad + rpm + lat_g + long_g + speed_mps + gear)
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleInputChange}
          disabled={isUploading}
          className="rounded-sm border border-rule bg-paper-warm p-2 font-mono text-xs text-ink file:mr-3 file:rounded-sm file:border file:border-racing-green file:bg-racing-green file:px-3 file:py-1 file:font-mono file:text-[10px] file:uppercase file:tracking-wider file:text-paper hover:file:bg-racing-green-deep"
        />
      </label>

      {state.status === "uploading" && (
        <p className="font-mono text-[11px] uppercase tracking-wider text-amber">
          Uploading + parsing {state.filename}...
        </p>
      )}

      {state.status === "ready" && (
        <article className="flex flex-col gap-3 rounded-sm border-l-2 border-racing-green bg-paper-warm p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-racing-green">
            {state.payload.source_filename} · {state.payload.row_count.toLocaleString()} rows · {state.payload.duration_s.toFixed(2)} s duration · {state.payload.compute_ms} ms parse
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {state.payload.channels.map((channel) => (
              <div
                key={channel.channel}
                className="flex flex-col gap-1 rounded-sm border border-rule bg-paper p-3 font-mono text-xs"
              >
                <span className="text-[10px] uppercase tracking-wider text-muted">{channel.channel}</span>
                <span className="text-ink">
                  min <span className="tabular-nums">{channel.min.toFixed(2)}</span>
                </span>
                <span className="text-ink">
                  max <span className="tabular-nums">{channel.max.toFixed(2)}</span>
                </span>
                <span className="text-ink">
                  mean <span className="tabular-nums">{channel.mean.toFixed(2)}</span>
                </span>
              </div>
            ))}
          </div>
          {state.payload.head_preview.length > 0 && (
            <details className="rounded-sm border border-rule bg-paper p-3">
              <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-racing-green">
                Head preview ({state.payload.head_preview.length} rows)
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto text-[10px] leading-relaxed text-ink">
                {state.payload.head_preview
                  .map((row) =>
                    Object.entries(row)
                      .map(([k, v]) => `${k}=${v.toFixed(2)}`)
                      .join(" "),
                  )
                  .join("\n")}
              </pre>
            </details>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="self-start rounded-sm border border-racing-green bg-paper px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-racing-green transition-colors hover:bg-racing-green hover:text-paper"
          >
            Upload another CSV
          </button>
        </article>
      )}

      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-sm border-2 border-accent bg-paper p-3 font-mono text-xs leading-relaxed text-accent"
        >
          Upload error: {state.message}.
        </p>
      )}

      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Cross-ref: <span className="text-ink-soft">D-058 wave-46 Phase 7.5 + Sookra Methodology Pillar 4 (Operator empathy) + canonical APEX-Bench header per app/shared/types.ts TelemetryRow contract</span>
      </p>
    </section>
  );
}
