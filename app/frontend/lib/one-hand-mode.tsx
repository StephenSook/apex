"use client";

/**
 * Wave-47 G4 one-hand accessibility mode provider per
 * `project_apex_override_competitor.md` counter-position #4. OVERRIDE
 * has ZERO adaptive-driver / wheelchair / hand-controls / Paralympic
 * copy anywhere; APEX moat lives in the engineering register for one-
 * hand-operation drivers who need larger tap targets + voice-only
 * navigation + screen-reader-friendly live regions. This module
 * provides the Context + hook + persistence layer; the toggle
 * component lives in `components/OneHandModeToggle.tsx` + the CSS
 * specifically applies under the `html.apex-one-hand` body-level class.
 *
 * Persistence: `localStorage.apex-one-hand-mode = "1" | "0"`. SSR-safe
 * (lazy useState initializer reads localStorage only after mount; no
 * hydration mismatch).
 *
 * Persona-decoupled per `feedback_persona_not_hardcoded_in_ui.md`
 * Lane K rule: the mode is a UI accessibility setting, not a Sarah-
 * Reynolds-or-similar persona pre-bind. Activating one-hand mode does
 * NOT change any narrative content; it only changes layout density +
 * tap-target sizing + voice-affordance signals.
 *
 * Editorial-paddock palette preserved; one-hand mode does not alter
 * the cream + racing-green + clay-red + amber + ink locked palette.
 *
 * Cross-references:
 *  - `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_override_competitor.md`
 *  - WCAG 2.5.5 Target Size (Enhanced, AAA): 44x44 CSS px minimum; one-
 *    hand mode raises to 80x80 CSS px for thumb reachability per
 *    Apple Human Interface Guidelines + Microsoft Surface adaptive-
 *    controller research on single-handed touch input.
 */

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "apex-one-hand-mode";
const HTML_CLASS = "apex-one-hand";

interface OneHandModeContextValue {
  readonly enabled: boolean;
  readonly toggle: () => void;
  readonly setEnabled: (next: boolean) => void;
}

const OneHandModeContext = createContext<OneHandModeContextValue>({
  enabled: false,
  toggle: () => {},
  setEnabled: () => {},
});

export function OneHandModeProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === "1") setEnabledState(true);
    } catch {
      // localStorage may be unavailable in private-mode browsers; default to disabled.
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (enabled) {
      root.classList.add(HTML_CLASS);
    } else {
      root.classList.remove(HTML_CLASS);
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    } catch {
      // Persistence is best-effort; ignore quota / private-mode errors.
    }
  }, [enabled, mounted]);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
  }, []);

  const toggle = useCallback(() => {
    setEnabledState((prev) => !prev);
  }, []);

  return (
    <OneHandModeContext.Provider value={{ enabled, toggle, setEnabled }}>
      {children}
    </OneHandModeContext.Provider>
  );
}

export function useOneHandMode(): OneHandModeContextValue {
  return useContext(OneHandModeContext);
}
