"use client";

/**
 * StatusLiveIndicator: client-side fetch of the latest GitHub Actions run on
 * `main`. Unauthenticated REST call (60 req/hr per IP); the judging window
 * fits well under that budget. No third-party uptime SaaS in the loop.
 *
 * Failure modes:
 *   - 403 rate limit: render a neutral "CI status temporarily unavailable" tile.
 *   - Network down: same neutral tile.
 *   - GitHub returns conclusion=null (in-progress): render in-progress tile.
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
  | { readonly status: "error"; readonly message: string };

const REPO_OWNER = "StephenSook";
const REPO_NAME = "apex";
const ENDPOINT = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?branch=main&per_page=1`;

export default function StatusLiveIndicator() {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch(ENDPOINT, { signal: controller.signal, headers: { Accept: "application/vnd.github+json" } })
      .then(async (res) => {
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        const data = (await res.json()) as { workflow_runs?: ReadonlyArray<ActionsRun> };
        const latest = data.workflow_runs?.[0];
        if (!latest) throw new Error("No runs on main yet");
        setState({ status: "ok", run: latest });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Unknown error";
        setState({ status: "error", message });
      });
    return () => controller.abort();
  }, []);

  if (state.status === "loading") return <LoadingTile />;
  if (state.status === "error") return <ErrorTile message={state.message} />;
  return <RunTile run={state.run} />;
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

function ErrorTile({ message }: { message: string }) {
  return (
    <article
      role="alert"
      className="flex flex-col gap-2 rounded-sm border-2 border-amber bg-paper p-5"
    >
      <p className="font-mono text-xs uppercase tracking-wider text-amber">
        CI status temporarily unavailable
      </p>
      <p className="text-sm leading-relaxed text-ink-soft">
        Could not reach the GitHub Actions API ({message}). Check directly at{" "}
        <a
          href="https://github.com/StephenSook/apex/actions"
          target="_blank"
          rel="noopener noreferrer"
          className="text-racing-green underline-offset-4 hover:underline"
        >
          github.com/StephenSook/apex/actions
        </a>
        .
      </p>
    </article>
  );
}

function RunTile({ run }: { run: ActionsRun }) {
  const verdict = pickVerdict(run.status, run.conclusion);
  const tone = TONE[verdict];
  const label = LABEL[verdict];
  const shortSha = typeof run.head_sha === "string" ? run.head_sha.slice(0, 7) : "unknown";
  const updated = run.updated_at ? new Date(run.updated_at).toLocaleString() : "unknown";
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

type Verdict = "success" | "failure" | "cancelled" | "in_progress" | "unknown";

const TONE: Record<Verdict, { readonly border: string; readonly text: string }> = {
  success: { border: "border-racing-green", text: "text-racing-green" },
  failure: { border: "border-accent", text: "text-accent" },
  cancelled: { border: "border-amber", text: "text-amber" },
  in_progress: { border: "border-rule", text: "text-ink-soft" },
  unknown: { border: "border-rule", text: "text-ink-soft" },
};

const LABEL: Record<Verdict, string> = {
  success: "Green",
  failure: "Failing",
  cancelled: "Cancelled",
  in_progress: "Running",
  unknown: "Unknown",
};

function pickVerdict(status: string, conclusion: string | null): Verdict {
  if (status !== "completed") return "in_progress";
  switch (conclusion) {
    case "success":
      return "success";
    case "failure":
    case "timed_out":
    case "action_required":
      return "failure";
    case "cancelled":
      return "cancelled";
    default:
      return "unknown";
  }
}
