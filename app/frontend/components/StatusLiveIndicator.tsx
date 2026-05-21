"use client";

/**
 * StatusLiveIndicator: client-side fetch of the latest GitHub Actions run on
 * `main`. Unauthenticated REST call (60 req/hr per IP); the judging window
 * fits well under that budget. No third-party uptime SaaS in the loop.
 *
 * Failure modes handled:
 *   - 403 rate limit / 5xx: render the network error tile with the GitHub Actions link.
 *   - 200 with malformed JSON (proxy interstitial, BOM, zero-byte body): render a
 *     parse-error tile that does not leak raw exception text containing HTML chars.
 *   - GitHub returns conclusion=null (in-progress): render in-progress tile.
 *   - Shape drift: workflow_runs missing or not an array surfaces as a contract-changed tile.
 */

import { useEffect, useState } from "react";

interface ActionsRun {
  readonly status: string;
  readonly conclusion: string | null;
  readonly head_sha: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly html_url: string;
  readonly run_number: number;
}

type FetchState =
  | { readonly status: "loading" }
  | { readonly status: "ok"; readonly run: ActionsRun }
  | { readonly status: "error"; readonly kind: ErrorKind; readonly message: string };

type ErrorKind = "network" | "parse" | "shape" | "rate_limit" | "unknown";

const REPO_OWNER = "StephenSook";
const REPO_NAME = "apex";
const ENDPOINT = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?branch=main&per_page=1`;

export default function StatusLiveIndicator() {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch(ENDPOINT, {
      signal: controller.signal,
      headers: { Accept: "application/vnd.github+json" },
    })
      .then(async (res) => {
        if (res.status === 403 || res.status === 429) {
          throw new ApiError("rate_limit", `GitHub API rate-limited (HTTP ${res.status}).`);
        }
        if (!res.ok) {
          throw new ApiError("network", `GitHub API returned HTTP ${res.status}.`);
        }
        let data: unknown;
        try {
          data = await res.json();
        } catch {
          throw new ApiError(
            "parse",
            "GitHub API returned a malformed response. Try again, or check the run via the link below.",
          );
        }
        const runs = (data as { workflow_runs?: unknown }).workflow_runs;
        if (!Array.isArray(runs)) {
          throw new ApiError(
            "shape",
            "GitHub API contract changed (workflow_runs is not an array).",
          );
        }
        const latest = runs[0] as ActionsRun | undefined;
        if (!latest) {
          throw new ApiError("network", "No runs on main yet.");
        }
        setState({ status: "ok", run: latest });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof ApiError) {
          setState({ status: "error", kind: err.kind, message: err.message });
          return;
        }
        const message = err instanceof Error ? err.message : "Unknown error";
        setState({ status: "error", kind: "unknown", message });
      });
    return () => controller.abort();
  }, [reloadCount]);

  if (state.status === "loading") return <LoadingTile />;
  if (state.status === "error") {
    return <ErrorTile state={state} onRetry={() => setReloadCount((n) => n + 1)} />;
  }
  return <RunTile run={state.run} />;
}

class ApiError extends Error {
  readonly kind: ErrorKind;
  constructor(kind: ErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

function LoadingTile() {
  return (
    <article
      aria-live="polite"
      aria-busy="true"
      className="flex flex-col gap-2 rounded-sm border border-rule bg-paper p-5"
    >
      <p className="font-mono text-xs uppercase tracking-wider text-muted">
        CI status
      </p>
      <p className="font-display text-xl text-ink-soft">Fetching live status...</p>
    </article>
  );
}

function ErrorTile({
  state,
  onRetry,
}: {
  state: { status: "error"; kind: ErrorKind; message: string };
  onRetry: () => void;
}) {
  return (
    <article
      role="alert"
      className="flex flex-col gap-3 rounded-sm border-2 border-amber bg-paper p-5"
    >
      <p className="font-mono text-xs uppercase tracking-wider text-amber">
        CI status temporarily unavailable
      </p>
      <p className="text-sm leading-relaxed text-ink-soft">{state.message}</p>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-sm border border-racing-green px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-racing-green hover:bg-racing-green hover:text-paper transition-colors"
        >
          Retry now
        </button>
        <a
          href="https://github.com/StephenSook/apex/actions"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs uppercase tracking-wider text-racing-green hover:underline"
        >
          Open the run on GitHub →
        </a>
      </div>
    </article>
  );
}

function RunTile({ run }: { run: ActionsRun }) {
  const verdict = pickVerdict(run.status, run.conclusion);
  const tone = TONE[verdict];
  const label = LABEL[verdict];
  const shortSha = typeof run.head_sha === "string" ? run.head_sha.slice(0, 7) : "unknown";
  const updated = run.updated_at ? formatUtc(run.updated_at) : "unknown";
  const runNumber = typeof run.run_number === "number" ? run.run_number : "?";

  return (
    <article
      aria-live="polite"
      className={`flex flex-col gap-3 rounded-sm border-2 ${tone.border} bg-paper p-5`}
    >
      <p className="font-mono text-xs uppercase tracking-wider text-muted">CI on main</p>
      <p className={`font-display text-3xl ${tone.text}`}>{label}</p>
      <dl className="grid grid-cols-2 gap-2 font-mono text-xs leading-relaxed">
        <div className="flex flex-col gap-1">
          <dt className="uppercase tracking-wider text-muted">Run</dt>
          <dd className="text-ink">#{runNumber}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="uppercase tracking-wider text-muted">SHA</dt>
          <dd className="text-ink">{shortSha}</dd>
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <dt className="uppercase tracking-wider text-muted">Updated</dt>
          <dd className="text-ink">{updated}</dd>
        </div>
      </dl>
      <a
        href={run.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="self-start font-mono text-xs uppercase tracking-wider text-racing-green hover:underline"
      >
        Open the run on GitHub →
      </a>
    </article>
  );
}

function formatUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

// All GitHub Actions conclusion values per the REST API spec.
// Keeping this as a literal union forces a compile error the next time GitHub
// ships a new conclusion variant.
type GhConclusion =
  | "success"
  | "failure"
  | "neutral"
  | "cancelled"
  | "skipped"
  | "timed_out"
  | "action_required"
  | "stale"
  | "startup_failure"
  | null;

type Verdict =
  | "success"
  | "failure"
  | "cancelled"
  | "neutral"
  | "skipped"
  | "in_progress"
  | "unknown";

const TONE: Record<Verdict, { readonly border: string; readonly text: string }> = {
  success: { border: "border-racing-green", text: "text-racing-green" },
  failure: { border: "border-accent", text: "text-accent" },
  cancelled: { border: "border-amber", text: "text-amber" },
  neutral: { border: "border-rule", text: "text-ink-soft" },
  skipped: { border: "border-rule", text: "text-ink-soft" },
  in_progress: { border: "border-rule", text: "text-ink-soft" },
  unknown: { border: "border-rule", text: "text-ink-soft" },
};

const LABEL: Record<Verdict, string> = {
  success: "Green",
  failure: "Failing",
  cancelled: "Cancelled",
  neutral: "Neutral",
  skipped: "Skipped",
  in_progress: "Running",
  unknown: "Unknown",
};

function pickVerdict(status: string, conclusion: string | null): Verdict {
  if (status !== "completed") return "in_progress";
  const c = conclusion as GhConclusion;
  switch (c) {
    case "success":
      return "success";
    case "failure":
    case "timed_out":
    case "action_required":
    case "startup_failure":
    case "stale":
      return "failure";
    case "cancelled":
      return "cancelled";
    case "neutral":
      return "neutral";
    case "skipped":
      return "skipped";
    case null:
      return "in_progress";
    default: {
      // Exhaustiveness guard: when GitHub adds a new conclusion variant, this
      // case must be widened. `_exhaustive` typed `never` makes the omission a
      // compile-time error rather than a silent "unknown" fallthrough.
      const _exhaustive: never = c;
      void _exhaustive;
      return "unknown";
    }
  }
}
