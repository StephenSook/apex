"use client";

/**
 * GraniteVisionParser: /judges-facing demo of the IBM Granite Vision
 * 4.1 4B timing-sheet parser. Wave-44 Phase 6c galaxy-stretch
 * close-out per the wave-30 maximal architecture D-019 catalog +
 * wave-44 plan Vinh-scope V1 backend swap-point.
 *
 * Surface: upload a timing-sheet PDF (or click the canned-fixture
 * button to skip the file picker) + render the parsed lap table
 * with sector splits + lap time. Parser identifier ("granite-vision-
 * 4.1-4b" once Vinh M3-V1 lands; "canned-fixture" today) surfaces under
 * the table so judges see the honest wire-up tier per the BLOCKER 4
 * honesty audit.
 *
 * Discriminated-union local state per
 * feedback_discriminated_unions_over_contradiction.md:
 *   - idle: no file uploaded yet
 *   - parsing: POST in flight
 *   - ready: parse complete; laps table renders
 *   - error: POST failed; reason surfaces under role=alert
 * Exhaustive switch _exhaustive:never default.
 */

import { useState } from "react";

// Per wave-44 deep-review type-design BLOCKER #1 close-out: import
// shared types from app/shared/types.ts (single source of truth
// vs the prior parallel duplicate declarations in this file + the
// route handler).
import type { TimingSheetParsedLaps } from "../../shared/types";

type ParserState =
  | { readonly status: "idle" }
  | { readonly status: "parsing"; readonly filename: string }
  | { readonly status: "ready"; readonly parsed: TimingSheetParsedLaps }
  | { readonly status: "error"; readonly message: string };

const PARSE_ENDPOINT = "/api/timing-sheet-parse";

function statusBorder(status: ParserState["status"]): string {
  switch (status) {
    case "idle":
      return "border-rule";
    case "parsing":
      return "border-amber";
    case "ready":
      return "border-racing-green";
    case "error":
      return "border-accent";
    default: {
      const _exhaustive: never = status;
      throw new Error(`unknown parser status: ${String(_exhaustive)}`);
    }
  }
}

async function postPDF(file: File): Promise<TimingSheetParsedLaps> {
  const formData = new FormData();
  formData.append("pdf", file);
  const response = await fetch(PARSE_ENDPOINT, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const message = await response.text().catch(() => "(no body)");
    throw new Error(`HTTP ${response.status}: ${message.slice(0, 200)}`);
  }
  const json = (await response.json()) as TimingSheetParsedLaps;
  return json;
}

export default function GraniteVisionParser() {
  const [state, setState] = useState<ParserState>({ status: "idle" });

  const handleFile = async (file: File) => {
    setState({ status: "parsing", filename: file.name });
    try {
      const parsed = await postPDF(file);
      setState({ status: "ready", parsed });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleCanned = async () => {
    const canned = new File(["%PDF-1.4 canned fixture"], "canned-timing-sheet.pdf", {
      type: "application/pdf",
    });
    await handleFile(canned);
  };

  return (
    <section
      aria-labelledby="vision-parser-title"
      className={`flex flex-col gap-3 rounded-sm border-2 ${statusBorder(state.status)} bg-paper p-5`}
    >
      <header>
        <p className="apex-eyebrow">Granite Vision 4.1 4B, D-016 (timing-sheet parser)</p>
        <h3
          id="vision-parser-title"
          className="font-display text-2xl tracking-tight text-ink"
        >
          PDF timing sheet to structured laps.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Upload a national-championship timing-sheet PDF. Granite Vision 4.1 4B parses
          sector splits per lap. Today routes to the canned fixture for the public deploy;
          Vinh M3-V1 backend wires the real Granite Vision inference per Stream M.3.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <label className="flex cursor-pointer items-center rounded-sm border border-racing-green bg-paper px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-racing-green transition-colors hover:bg-racing-green hover:text-paper">
          Upload PDF
          <input
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
            disabled={state.status === "parsing"}
          />
        </label>
        <button
          type="button"
          onClick={() => void handleCanned()}
          disabled={state.status === "parsing"}
          className="rounded-sm border border-amber bg-paper px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-amber-ink transition-colors hover:bg-amber hover:text-paper disabled:cursor-not-allowed disabled:opacity-50"
        >
          Try the canned fixture
        </button>
      </div>

      {state.status === "parsing" && (
        <p className="font-mono text-xs text-amber-ink" aria-live="polite">
          Parsing {state.filename}...
        </p>
      )}

      {state.status === "ready" && (
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[11px] uppercase tracking-wider text-racing-green">
            {state.parsed.laps.length} laps parsed from {state.parsed.source_filename} in {state.parsed.parse_ms} ms
          </p>
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-rule text-left text-[10px] uppercase tracking-wider text-muted">
                  <th className="py-2">Lap</th>
                  <th className="py-2">S1 (s)</th>
                  <th className="py-2">S2 (s)</th>
                  <th className="py-2">S3 (s)</th>
                  <th className="py-2">Lap (s)</th>
                </tr>
              </thead>
              <tbody>
                {state.parsed.laps.map((lap) => (
                  <tr key={lap.lap} className="border-b border-rule text-ink">
                    <td className="py-2 font-bold">{lap.lap}</td>
                    <td className="py-2">{lap.sector_1_time_s.toFixed(3)}</td>
                    <td className="py-2">{lap.sector_2_time_s.toFixed(3)}</td>
                    <td className="py-2">{lap.sector_3_time_s.toFixed(3)}</td>
                    <td className="py-2">{lap.lap_time_s.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
            Parser: <span className="text-ink-soft">{state.parsed.parser}</span>
          </p>
        </div>
      )}

      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-sm border-2 border-accent bg-paper p-3 font-mono text-xs leading-relaxed text-accent"
        >
          Parse error: {state.message}. Try a different PDF or use the canned fixture.
        </p>
      )}

      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Cross-ref: <span className="text-ink-soft">D-016 + wave-44 plan Vinh M3-V1 + Stream M.3 spec extension</span>
      </p>
    </section>
  );
}
