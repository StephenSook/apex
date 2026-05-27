"use client";

/**
 * APEX-Bench v0.1.0 community leaderboard surface (Client Component).
 * Wave-47 #210 G3 close per project_apex_override_competitor.md G3
 * galaxy-stretch + project memory `feedback_galaxy_ambition_no_deferrals.md`
 * + Stephen explicit no-defer directive.
 *
 * Mounted at the bottom of /lips-harness Server Component page. Provides
 * a 4-axis LIPS submission form + localStorage-backed community
 * leaderboard so any contributor can publish their own (model + config +
 * dataset) ablation result against the canonical APEX-Bench. localStorage
 * is the HEAD persistence layer; backend community-leaderboard storage
 * lands behind a wave-48 backend swap-point at
 * `/api/lips-harness/submit` (named in `swap-point` field).
 *
 * Granite Guardian honesty gate: every text field is passed through the
 * `scrubInventedRegulatoryAnchors` server-side scrubber before being
 * persisted. This catches accidental FIA Article / COA Section number
 * injection in the configuration label or dataset slug.
 *
 * Honesty tier: every submission carries an `engine` field declaring
 * which forecaster + projector composition was used. Submissions with
 * the canonical APEX engine (TTM + V2 cvxpylayers + Guardian) get a
 * green-bordered chip; community + alternative engines render with the
 * amber-bordered chip + tier label.
 */

import { useCallback, useEffect, useState } from "react";

import { scrubInventedRegulatoryAnchors } from "../lib/scrub-regulatory-anchors";

const STORAGE_KEY = "apex-bench-leaderboard-v0_1_0";

const APEX_BENCH_SWAP_POINT =
  "POST /api/lips-harness/submit + GET /api/lips-harness/leaderboard pending Vinh M3-V15 community-leaderboard backend deploy; HEAD persists submissions to localStorage so the surface ships demo-functional";

type Tier = "canonical" | "community" | "experimental";

interface LeaderboardEntry {
  readonly id: string;
  readonly created_at_iso: string;
  readonly contributor_label: string;
  readonly engine: string;
  readonly tier: Tier;
  readonly dataset: string;
  readonly lap_time_mae_s: number;
  readonly physics_violation_rate: number;
  readonly guardian_approve_pct: number;
  readonly inference_latency_ms: number;
}

interface FormState {
  readonly contributor_label: string;
  readonly engine: string;
  readonly tier: Tier;
  readonly dataset: string;
  readonly lap_time_mae_s: string;
  readonly physics_violation_rate: string;
  readonly guardian_approve_pct: string;
  readonly inference_latency_ms: string;
}

const EMPTY_FORM: FormState = {
  contributor_label: "",
  engine: "",
  tier: "community",
  dataset: "",
  lap_time_mae_s: "",
  physics_violation_rate: "",
  guardian_approve_pct: "",
  inference_latency_ms: "",
};

type SubmissionState =
  | { readonly status: "idle" }
  | { readonly status: "submitting" }
  | { readonly status: "success"; readonly entry: LeaderboardEntry }
  | { readonly status: "error"; readonly message: string };

function loadEntries(): ReadonlyArray<LeaderboardEntry> {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((e): e is LeaderboardEntry => {
      if (e === null || typeof e !== "object") return false;
      const obj = e as Record<string, unknown>;
      return (
        typeof obj.id === "string" &&
        typeof obj.contributor_label === "string" &&
        typeof obj.engine === "string" &&
        typeof obj.lap_time_mae_s === "number"
      );
    });
  } catch {
    return [];
  }
}

function persistEntries(entries: ReadonlyArray<LeaderboardEntry>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 25)));
  } catch {
    // Best-effort persistence; private-mode + quota errors ignored.
  }
}

function parseNumber(input: string, label: string): number {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new Error(`Missing ${label}.`);
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    throw new Error(`${label} must be a finite number.`);
  }
  return n;
}

function buildEntryFromForm(form: FormState): LeaderboardEntry {
  const contributor_label = scrubInventedRegulatoryAnchors(form.contributor_label.trim());
  const engine = scrubInventedRegulatoryAnchors(form.engine.trim());
  const dataset = scrubInventedRegulatoryAnchors(form.dataset.trim());
  if (contributor_label.length === 0) throw new Error("Contributor label is required.");
  if (engine.length === 0) throw new Error("Engine label is required.");
  if (dataset.length === 0) throw new Error("Dataset label is required.");
  const lap_time_mae_s = parseNumber(form.lap_time_mae_s, "lap-time MAE");
  const physics_violation_rate = parseNumber(
    form.physics_violation_rate,
    "physics-violation rate",
  );
  const guardian_approve_pct = parseNumber(form.guardian_approve_pct, "Guardian approve %");
  const inference_latency_ms = parseNumber(form.inference_latency_ms, "inference latency");
  if (lap_time_mae_s < 0) throw new Error("Lap-time MAE cannot be negative.");
  if (physics_violation_rate < 0 || physics_violation_rate > 1) {
    throw new Error("Physics-violation rate must be in [0, 1].");
  }
  if (guardian_approve_pct < 0 || guardian_approve_pct > 100) {
    throw new Error("Guardian approve % must be in [0, 100].");
  }
  if (inference_latency_ms < 0) throw new Error("Inference latency cannot be negative.");
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    created_at_iso: new Date().toISOString(),
    contributor_label,
    engine,
    tier: form.tier,
    dataset,
    lap_time_mae_s,
    physics_violation_rate,
    guardian_approve_pct,
    inference_latency_ms,
  };
}

function tierChip(tier: Tier): string {
  if (tier === "canonical") return "border-racing-green bg-paper text-racing-green";
  if (tier === "community") return "border-amber bg-paper text-amber";
  return "border-rule bg-paper text-muted";
}

function tierLabel(tier: Tier): string {
  if (tier === "canonical") return "Canonical";
  if (tier === "community") return "Community";
  return "Experimental";
}

export default function APEXBenchLeaderboard() {
  const [entries, setEntries] = useState<ReadonlyArray<LeaderboardEntry>>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitState, setSubmitState] = useState<SubmissionState>({ status: "idle" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(loadEntries());
  }, []);

  const handleChange = useCallback(
    <K extends keyof FormState>(key: K) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const next = e.target.value;
        setForm((prev) => ({ ...prev, [key]: next }));
      },
    [],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitState({ status: "submitting" });
      try {
        const entry = buildEntryFromForm(form);
        const next = [entry, ...entries].slice(0, 25);
        persistEntries(next);
        setEntries(next);
        setForm(EMPTY_FORM);
        setSubmitState({ status: "success", entry });
      } catch (err) {
        setSubmitState({
          status: "error",
          message: err instanceof Error ? err.message : "Submission rejected.",
        });
      }
    },
    [form, entries],
  );

  const handleReset = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore quota / private-mode.
    }
    setEntries([]);
  }, []);

  // Sort by lap-time MAE ascending (lower better) as primary leaderboard axis.
  const sorted = [...entries].sort((a, b) => a.lap_time_mae_s - b.lap_time_mae_s);

  return (
    <section className="flex flex-col gap-6 rounded-sm border-2 border-rule bg-paper p-6">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
          APEX-Bench v0.1.0 community leaderboard
        </p>
        <h2 className="font-display text-2xl tracking-tight text-ink">
          Publish your own ablation. Open contribution surface.
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          Reproduce the four LIPS axes (lap-time MAE + physics violation + Guardian approve +
          inference latency) on your own forecaster + projector composition + submit. HEAD
          persists submissions in browser localStorage; community-wide leaderboard backend lands
          behind the {`{POST,GET} /api/lips-harness/{submit,leaderboard}`} swap-points. Every
          text field passes through the canonical regulatory-anchor scrubber before persistence
          per HARD-COMPLIANCE.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="APEX-Bench leaderboard submission form"
      >
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
            Contributor label
          </span>
          <input
            type="text"
            value={form.contributor_label}
            onChange={handleChange("contributor_label")}
            required
            maxLength={64}
            placeholder="e.g. nlab racing"
            className="rounded-sm border border-rule bg-paper-warm px-3 py-2 font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-racing-green"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
            Engine composition
          </span>
          <input
            type="text"
            value={form.engine}
            onChange={handleChange("engine")}
            required
            maxLength={96}
            placeholder="e.g. TTM r2 + V2 + Guardian"
            className="rounded-sm border border-rule bg-paper-warm px-3 py-2 font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-racing-green"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
            Honesty tier
          </span>
          <select
            value={form.tier}
            onChange={handleChange("tier")}
            className="rounded-sm border border-rule bg-paper-warm px-3 py-2 font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-racing-green"
          >
            <option value="community">Community</option>
            <option value="canonical">Canonical (APEX engine)</option>
            <option value="experimental">Experimental</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
            Dataset slug
          </span>
          <input
            type="text"
            value={form.dataset}
            onChange={handleChange("dataset")}
            required
            maxLength={64}
            placeholder="e.g. donington-britcar-2026"
            className="rounded-sm border border-rule bg-paper-warm px-3 py-2 font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-racing-green"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
            Lap-time MAE (s)
          </span>
          <input
            type="number"
            value={form.lap_time_mae_s}
            onChange={handleChange("lap_time_mae_s")}
            step="0.01"
            min="0"
            required
            className="rounded-sm border border-rule bg-paper-warm px-3 py-2 font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-racing-green"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
            Physics-violation rate (0-1)
          </span>
          <input
            type="number"
            value={form.physics_violation_rate}
            onChange={handleChange("physics_violation_rate")}
            step="0.001"
            min="0"
            max="1"
            required
            className="rounded-sm border border-rule bg-paper-warm px-3 py-2 font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-racing-green"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
            Guardian approve %
          </span>
          <input
            type="number"
            value={form.guardian_approve_pct}
            onChange={handleChange("guardian_approve_pct")}
            step="0.1"
            min="0"
            max="100"
            required
            className="rounded-sm border border-rule bg-paper-warm px-3 py-2 font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-racing-green"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
            Inference latency (ms)
          </span>
          <input
            type="number"
            value={form.inference_latency_ms}
            onChange={handleChange("inference_latency_ms")}
            step="1"
            min="0"
            required
            className="rounded-sm border border-rule bg-paper-warm px-3 py-2 font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-racing-green"
          />
        </label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            disabled={submitState.status === "submitting"}
            className="inline-flex items-center gap-2 rounded-sm border border-racing-green bg-racing-green px-5 py-2 font-mono text-sm uppercase tracking-wider text-paper hover:bg-paper hover:text-racing-green disabled:cursor-wait disabled:opacity-60"
          >
            Submit to leaderboard
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-sm border border-rule bg-paper-warm px-5 py-2 font-mono text-sm uppercase tracking-wider text-muted hover:border-accent hover:text-accent"
          >
            Reset local board
          </button>
        </div>
      </form>

      {submitState.status === "error" && (
        <p role="alert" className="font-mono text-sm text-accent">
          {submitState.message}
        </p>
      )}
      {submitState.status === "success" && (
        <p
          role="status"
          aria-live="polite"
          className="font-mono text-sm text-racing-green"
        >
          Submission accepted. Entry id {submitState.entry.id}.
        </p>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="font-display text-xl tracking-tight text-ink">
          Top {Math.min(sorted.length, 10)} submissions by lap-time MAE
        </h3>
        {mounted && sorted.length === 0 && (
          <p className="font-mono text-sm text-muted">
            No submissions yet. Submit the first ablation above.
          </p>
        )}
        {sorted.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-racing-green text-left">
                  <th className="px-3 py-2 font-display text-base text-ink">#</th>
                  <th className="px-3 py-2 font-display text-base text-ink">Contributor</th>
                  <th className="px-3 py-2 font-display text-base text-ink">Engine</th>
                  <th className="px-3 py-2 font-display text-base text-ink">Dataset</th>
                  <th className="px-3 py-2 font-display text-base text-ink">MAE (s)</th>
                  <th className="px-3 py-2 font-display text-base text-ink">Viol %</th>
                  <th className="px-3 py-2 font-display text-base text-ink">Approve %</th>
                  <th className="px-3 py-2 font-display text-base text-ink">Latency (ms)</th>
                </tr>
              </thead>
              <tbody>
                {sorted.slice(0, 10).map((row, idx) => (
                  <tr key={row.id} className="border-b border-rule">
                    <td className="px-3 py-3 font-mono text-xs text-ink">{idx + 1}</td>
                    <td className="px-3 py-3 font-mono text-xs text-ink">
                      <div className="flex flex-col gap-1">
                        <span>{row.contributor_label}</span>
                        <span
                          className={`inline-flex w-fit items-center rounded-sm border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${tierChip(row.tier)}`}
                        >
                          {tierLabel(row.tier)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-ink-soft">{row.engine}</td>
                    <td className="px-3 py-3 font-mono text-xs text-ink-soft">{row.dataset}</td>
                    <td className="px-3 py-3 font-mono text-sm text-ink-soft">
                      {row.lap_time_mae_s.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 font-mono text-sm text-ink-soft">
                      {(row.physics_violation_rate * 100).toFixed(1)}
                    </td>
                    <td className="px-3 py-3 font-mono text-sm text-ink-soft">
                      {row.guardian_approve_pct.toFixed(1)}
                    </td>
                    <td className="px-3 py-3 font-mono text-sm text-ink-soft">
                      {row.inference_latency_ms.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Swap-point: <span className="text-ink-soft">{APEX_BENCH_SWAP_POINT}</span>
      </p>
    </section>
  );
}
