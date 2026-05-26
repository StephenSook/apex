"use client";

/**
 * CommitTimelineEntry: renders one commit row on the /changelog
 * timeline. Wave-45 Phase 5 Block C.2 close-out. Conventional-commit
 * prefix color pill + truncated subject + click-to-expand for full
 * body. Editorial-paddock palette per-prefix:
 *
 *   feat  -> racing-green
 *   fix   -> amber
 *   docs  -> muted
 *   test  -> ink (default)
 *   refactor -> accent (clay red)
 *   chore -> rule
 *   perf  -> racing-green
 *
 * Any commit subject not starting with conventional-commit prefix
 * renders with muted-rule fallback.
 */

import { useEffect, useState } from "react";

export interface CommitTimelineEntryProps {
  readonly sha: string;
  readonly subject: string;
  readonly author: string;
  readonly authorIso: string;
}

type ConventionalPrefix =
  | "feat"
  | "fix"
  | "docs"
  | "test"
  | "refactor"
  | "chore"
  | "perf"
  | "fail"
  | "other";

function classifyPrefix(subject: string): ConventionalPrefix {
  const match = subject.match(/^(feat|fix|docs|test|refactor|chore|perf|fail)(?:\(|:)/);
  if (match === null) return "other";
  return match[1] as ConventionalPrefix;
}

function prefixPillClass(prefix: ConventionalPrefix): string {
  switch (prefix) {
    case "feat":
      return "border-racing-green bg-paper text-racing-green";
    case "fix":
      return "border-amber bg-paper text-amber";
    case "docs":
      return "border-rule bg-paper text-muted";
    case "test":
      return "border-rule bg-paper text-ink";
    case "refactor":
      return "border-accent bg-paper text-accent";
    case "chore":
      return "border-rule bg-paper text-muted";
    case "perf":
      return "border-racing-green bg-paper text-racing-green";
    case "fail":
      return "border-accent bg-paper text-accent";
    case "other":
      return "border-rule bg-paper text-ink-soft";
    default: {
      const _exhaustive: never = prefix;
      throw new Error(`unknown conventional prefix: ${String(_exhaustive)}`);
    }
  }
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return iso;
  const diffMs = Date.now() - then;
  const seconds = Math.round(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toISOString().slice(0, 10);
}

export default function CommitTimelineEntry({
  sha,
  subject,
  author,
  authorIso,
}: CommitTimelineEntryProps) {
  const [expanded, setExpanded] = useState(false);
  // Wave-45.5 code-reviewer IMPORTANT I-1 close: formatRelative calls
  // Date.now() which differs between SSR + client hydration, triggering
  // React hydration-mismatch warnings + flipping "0s ago" -> "32m ago"
  // on hydrate. mounted-flag pattern per feedback_useState_lazy_init_
  // hydration_footgun: render raw authorIso during SSR + replace with
  // relative form after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  const prefix = classifyPrefix(subject);
  const truncated = subject.length > 80 ? `${subject.slice(0, 77)}...` : subject;
  return (
    <li className="flex flex-col gap-1 rounded-sm border-l-2 border-rule bg-paper-warm p-3">
      <div className="flex items-baseline gap-3">
        <span
          className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${prefixPillClass(prefix)}`}
        >
          {prefix === "other" ? "ship" : prefix}
        </span>
        <span className="font-mono text-xs text-racing-green">{sha.slice(0, 7)}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
          {author} · {mounted ? formatRelative(authorIso) : authorIso.slice(0, 10)}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="self-start text-left font-display text-base leading-snug text-ink transition-colors hover:text-racing-green"
        aria-expanded={expanded}
      >
        {expanded ? subject : truncated}
      </button>
    </li>
  );
}
