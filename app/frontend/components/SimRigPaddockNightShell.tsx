"use client";

/**
 * SimRigPaddockNightShell: client-side scoped dark-mode wrapper for the
 * /sim-rig page. Wave-46 Phase 8.1 close-out.
 *
 * Toggles `data-paddock-night="true"` on the wrapping div so the CSS
 * variable overrides in globals.css cascade through every descendant
 * that uses bg-paper / text-ink / border-rule / etc. Toggle persists
 * the preference in localStorage so a returning user keeps their last
 * mode. Hydration-safe via the mounted-flag pattern (per
 * feedback_useState_lazy_init_hydration_footgun.md).
 *
 * Footer of /sim-rig page renders OUTSIDE this shell so the always-dark
 * racing-green footer keeps its original cream-on-green look regardless
 * of the dark-mode flip.
 */

import { useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "apex.sim-rig.paddock-night";

interface SimRigPaddockNightShellProps {
  readonly children: ReactNode;
}

export default function SimRigPaddockNightShell({
  children,
}: SimRigPaddockNightShellProps) {
  const [dark, setDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    // Mounted-flag + eslint-disable per
    // feedback_react19_set_state_in_effect_workarounds.md: localStorage is a
    // post-hydration client-only signal, and the dark-state must NOT leak into
    // SSR (per feedback_useState_lazy_init_hydration_footgun.md). The
    // workaround is the documented mounted-flag pattern with disable comments.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "true") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDark(true);
      }
    } catch {
      // localStorage unavailable (private mode + iframe sandbox); ignore.
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, dark ? "true" : "false");
    } catch {
      // localStorage unavailable; ignore.
    }
  }, [dark, mounted]);

  return (
    <div data-paddock-night={mounted && dark ? "true" : "false"}>
      <div className="mx-auto flex max-w-6xl items-center justify-end px-6 pt-4 lg:px-10 lg:pt-6">
        <button
          type="button"
          onClick={() => setDark((prev) => !prev)}
          aria-pressed={mounted && dark}
          className="rounded-sm border border-rule bg-paper-warm px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft transition-colors hover:bg-paper-shadow hover:text-ink"
        >
          {mounted && dark ? "Daylight" : "Paddock night"}
        </button>
      </div>
      {children}
    </div>
  );
}
