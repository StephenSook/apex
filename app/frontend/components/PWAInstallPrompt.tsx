"use client";

/**
 * PWAInstallPrompt: Chrome / Edge beforeinstallprompt event listener
 * that surfaces an in-page Install button in the editorial-paddock
 * palette. Defaults to hidden until the browser fires the event;
 * after user clicks the in-page button, defers + prompts via the
 * captured event so the install flow stays inside the page rather
 * than relying on the address-bar discoverability.
 *
 * Wave-44 Phase 6e galaxy-stretch close-out: surfaces the "install
 * APEX as an app on your phone" affordance to judges + adaptive-
 * racing operators in the paddock. Adds shouldn't-be-possible move
 * #6 per D-019 wave-44 amendment.
 *
 * iOS Safari: does NOT fire beforeinstallprompt; the affordance is
 * a separate banner that surfaces below on iOS user-agent detection.
 *
 * Discriminated-union local state per
 * feedback_discriminated_unions_over_contradiction memory rule:
 *   - hidden: no install event captured yet OR app already in
 *     standalone mode (display-mode: standalone matches)
 *   - ready: beforeinstallprompt fired + captured the BeforeInstall-
 *     PromptEvent; render the install button
 *   - installing: user clicked install; prompt() in flight
 *   - installed: install accepted; button collapses
 *   - dismissed: install rejected; button collapses with retry hint
 *   - ios: iOS Safari path; render the manual Add-to-Home-Screen
 *     instruction banner instead of an install button
 */

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

type PWAInstallState =
  | { readonly status: "hidden" }
  | { readonly status: "ready"; readonly event: BeforeInstallPromptEvent }
  | { readonly status: "installing" }
  | { readonly status: "installed" }
  | { readonly status: "dismissed" }
  | { readonly status: "ios" };

/**
 * Mounted-flag pattern per feedback_useState_lazy_init_hydration_footgun
 * memory rule (cascade-#23 lesson). The prior lazy initializer read
 * typeof window + navigator.userAgent at SSR + client first render,
 * producing different values (SSR=hidden, client=ios on iOS Safari)
 * and triggering React 19 hydration mismatch + Playwright pageerror.
 *
 * Fix: SSR + client first render both return "hidden" (renders null).
 * Post-mount useEffect detects iOS Safari + standalone + flips
 * effective state. The setState-in-effect rule is silenced via
 * eslint-disable-next-line (one-shot mount setState; no cascading-
 * render concern).
 */
function detectInitialClientState(): PWAInstallState {
  if (typeof window === "undefined") return { status: "hidden" };
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  if (isStandalone) return { status: "hidden" };
  const ua = window.navigator.userAgent;
  const isIOSSafari =
    /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  if (isIOSSafari) return { status: "ios" };
  return { status: "hidden" };
}

export default function PWAInstallPrompt() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<PWAInstallState>({ status: "hidden" });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (typeof window === "undefined") return;

    // Suppress if already running in standalone mode (installed app).
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setState({ status: "ready", event: e as BeforeInstallPromptEvent });
    };

    const handleInstalled = () => {
      setState({ status: "installed" });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (state.status !== "ready") return;
    setState({ status: "installing" });
    try {
      await state.event.prompt();
      const choice = await state.event.userChoice;
      setState({ status: choice.outcome === "accepted" ? "installed" : "dismissed" });
    } catch (err) {
      // Wave-44 deep-review silent-failure HIGH #8: log the error
      // class + message so the diagnostic is preserved. "dismissed"
      // remains the resolved UI state (user-facing copy says reload
      // to retry) but operators have the actual cause in DevTools.
      console.warn(
        "apex.pwa-install: prompt() or userChoice rejected; surfacing dismissed state.",
        { errorClass: err instanceof Error ? err.constructor.name : typeof err, message: err instanceof Error ? err.message : String(err) },
      );
      setState({ status: "dismissed" });
    }
  };

  // Hydration-safe effective state: pre-mount always returns "hidden"
  // (SSR-matching null render). Post-mount: derive iOS branch from
  // client detection if state machine is still at "hidden" initial.
  // Once any event (beforeinstallprompt / appinstalled) or user action
  // transitions state to ready / installing / etc, the state machine
  // takes over + the iOS detection is no longer applied.
  const effectiveState: PWAInstallState = !mounted
    ? { status: "hidden" }
    : state.status === "hidden"
      ? detectInitialClientState()
      : state;

  if (effectiveState.status === "hidden") return null;

  // a11y: reduced-motion users get static (no pulse) on the install
  // affordance via the body className gating tailwind motion-safe variant.
  if (effectiveState.status === "ios") {
    return (
      <aside
        aria-label="Install APEX on iOS"
        className="flex flex-col gap-2 rounded-sm border-2 border-amber bg-paper-warm p-4"
      >
        <p className="font-mono text-[10px] uppercase tracking-wider text-amber-ink">
          Install APEX on iPhone or iPad
        </p>
        <p className="text-sm leading-snug text-ink-soft">
          Tap the Safari share button, then choose &quot;Add to Home Screen&quot;. APEX runs
          full-screen with no browser chrome, paddock-ready.
        </p>
      </aside>
    );
  }

  if (effectiveState.status === "installed") {
    return (
      <aside
        aria-label="APEX installed confirmation"
        className="flex flex-col gap-2 rounded-sm border-2 border-racing-green bg-paper p-4"
      >
        <p className="font-mono text-[10px] uppercase tracking-wider text-racing-green">
          APEX installed
        </p>
        <p className="text-sm leading-snug text-ink-soft">
          Look for the APEX icon on your home screen. Launches full-screen, paddock-ready.
        </p>
      </aside>
    );
  }

  if (effectiveState.status === "dismissed") {
    return (
      <aside
        aria-label="APEX install dismissed"
        className="flex flex-col gap-2 rounded-sm border border-rule bg-paper-warm p-4"
      >
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
          Install dismissed
        </p>
        <p className="text-sm leading-snug text-ink-soft">
          Reload the page to re-surface the install prompt.
        </p>
      </aside>
    );
  }

  const isInstalling = effectiveState.status === "installing";

  return (
    <aside
      aria-label="Install APEX as an app"
      className="flex flex-col gap-3 rounded-sm border-2 border-racing-green bg-paper p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-1">
        <p className="apex-eyebrow">PWA install affordance</p>
        <p className="font-display text-lg leading-snug text-ink">
          Install APEX as an app on your phone.
        </p>
        <p className="text-sm leading-snug text-ink-soft">
          Full-screen, no browser chrome, paddock-ready. Launches from your home screen.
        </p>
      </div>
      <button
        type="button"
        onClick={handleInstallClick}
        disabled={isInstalling}
        className="self-start rounded-sm border border-racing-green bg-racing-green px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-paper transition-colors hover:bg-racing-green-deep disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
      >
        {isInstalling ? "Installing..." : "Install APEX"}
      </button>
    </aside>
  );
}
