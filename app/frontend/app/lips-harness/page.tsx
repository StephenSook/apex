/**
 * /lips-harness page: wave-45 Phase 9 Block F V15 surface for the
 * LIPS 4-axis evaluation harness + APEX-Bench release per D-026 + G10.
 * Server Component fetching /api/lips-harness at request-time. Renders
 * the 4-row ablation table covering zero-shot TTM + soft-loss-only +
 * APEX hard projection + full 3-track ensemble + 8-tier physics.
 *
 * HEAD ships canned-fallback engine while Vinh wires the Dockerized
 * evaluation harness at eval/Dockerfile + apex-bench/ Day 11.
 *
 * Cross-ref: paper §4.6 Reproducibility statement + D-026 + G10.
 */

import type { Metadata } from "next";

import APEXBenchLeaderboard from "../../components/APEXBenchLeaderboard";
import NotebookLMHoverAudio from "../../components/NotebookLMHoverAudio";
import type { LIPSResponse } from "../../../shared/types";

export const metadata: Metadata = {
  title: "APEX · LIPS 4-axis evaluation harness",
  description:
    "4-axis ablation table for the APEX hard-projection composition vs zero-shot Granite TTM baseline, per D-026 + G10 reproducibility statement.",
};

export const dynamic = "force-dynamic";

type FetchResult =
  | { readonly ok: true; readonly data: LIPSResponse }
  | { readonly ok: false; readonly cause: "http" | "transport" | "parse"; readonly detail: string };

async function fetchLIPS(): Promise<FetchResult> {
  // Wave-45.5 code-reviewer CRITICAL C-1 close: Vercel server lambda has no
  // localhost:3000; NEXT_PUBLIC_BASE_URL is not set in any deploy. Prefer
  // VERCEL_URL (Vercel-injected; https-prefixed) > NEXT_PUBLIC_BASE_URL
  // (explicit override) > localhost (next start dev path only).
  const vercelUrl = process.env.VERCEL_URL;
  const explicit = process.env.NEXT_PUBLIC_BASE_URL;
  const baseUrl = vercelUrl
    ? `https://${vercelUrl}`
    : explicit ?? "http://localhost:3000";
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/lips-harness`, { cache: "no-store" });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[apex/lips-harness] transport error", detail);
    return { ok: false, cause: "transport", detail };
  }
  if (!res.ok) {
    const detail = `HTTP ${res.status} ${res.statusText}`;
    console.error("[apex/lips-harness] http error", detail);
    return { ok: false, cause: "http", detail };
  }
  try {
    const data = (await res.json()) as LIPSResponse;
    return { ok: true, data };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[apex/lips-harness] parse error", detail);
    return { ok: false, cause: "parse", detail };
  }
}

export default async function LIPSHarnessPage() {
  const result = await fetchLIPS();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-3">
        <p className="apex-eyebrow">Vinh M3-V15 · D-026 + G10 reproducibility</p>
        <h1 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">
          LIPS 4-axis evaluation harness.
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-ink-soft">
          Latency + Integrity + Physics + Skill 4-axis ablation across the four canonical
          configurations of the APEX stack. The hard-projection composition (V2 cvxpylayers
          per D-050 byte-equality lock) is the load-bearing claim; zero-shot Granite TTM is
          published as honest disclosure per D-052 G4 pivot rather than as the production
          forecaster path.
        </p>
        <div className="mt-2">
          <NotebookLMHoverAudio
            panelId="lips-harness"
            panelLabel="LIPS harness + APEX-Bench v0.1.0 public release"
          />
        </div>
      </header>

      {!result.ok && (
        <p
          role="alert"
          className="rounded-sm border-2 border-accent bg-paper p-4 font-mono text-sm text-accent"
        >
          /api/lips-harness {result.cause} failure: {result.detail}.
        </p>
      )}

      {result.ok && (
        <section className="flex flex-col gap-4 rounded-sm border-2 border-rule bg-paper p-6">
          <div className="flex flex-wrap items-baseline gap-3">
            <span
              className={`rounded-sm border px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${
                result.data.engine === "lips-v15-real"
                  ? "border-racing-green bg-paper text-racing-green"
                  : "border-amber bg-paper text-amber"
              }`}
            >
              Engine: {result.data.engine}
            </span>
            <span className="rounded-sm border border-rule bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              Dataset: {result.data.dataset}
            </span>
            <span className="rounded-sm border border-rule bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              Seed: {result.data.seed}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-racing-green text-left">
                  <th className="px-3 py-2 font-display text-base text-ink">
                    Configuration
                  </th>
                  <th className="px-3 py-2 font-display text-base text-ink">
                    Lap-time MAE (s)
                  </th>
                  <th className="px-3 py-2 font-display text-base text-ink">
                    Physics-violation rate
                  </th>
                  <th className="px-3 py-2 font-display text-base text-ink">
                    Guardian approve %
                  </th>
                  <th className="px-3 py-2 font-display text-base text-ink">
                    Inference latency (ms)
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.data.rows.map((row, idx) => (
                  <tr
                    key={row.configuration}
                    className={`border-b border-rule ${
                      idx === result.data.rows.length - 1 ? "bg-paper-warm" : "bg-paper"
                    }`}
                  >
                    <td className="px-3 py-3 font-mono text-xs text-ink">
                      {row.configuration}
                    </td>
                    <td className="px-3 py-3 font-mono text-sm text-ink-soft">
                      {row.lap_time_mae_s.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 font-mono text-sm text-ink-soft">
                      {(row.physics_violation_rate * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-3 font-mono text-sm text-ink-soft">
                      {row.guardian_approve_pct}%
                    </td>
                    <td className="px-3 py-3 font-mono text-sm text-ink-soft">
                      {row.inference_latency_ms}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
            Swap-point: <span className="text-ink-soft">{result.data.swap_point}</span>
          </p>
        </section>
      )}

      <section className="flex flex-col gap-3 rounded-sm border-2 border-rule bg-paper-warm p-6">
        <h2 className="font-display text-2xl tracking-tight text-ink">
          What you are looking at.
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          The 4 rows map to the canonical ablation in paper §4.6 Reproducibility + §4.2 baselines. Row 1 (zero-shot TTM) is
          the G4 honest-disclosure baseline per D-052. Row 2 (soft-loss-only) demonstrates
          that constraint violation is hard to reduce via differentiable loss alone. Row 3
          (APEX hard projection) shows the V2 cvxpylayers projection eliminating violations.
          Row 4 (full 3-track + 8-tier) is the production composition under D-010 + D-012
          + D-015. Engine-agnostic byte-equality per D-050 applies between V1 NumPy + V2
          cvxpylayers projectors (.to_text() output byte-identical modulo ENGINE line).
        </p>
      </section>

      <APEXBenchLeaderboard />
    </main>
  );
}
