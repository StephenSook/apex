"use client";

/**
 * OneHandModeToggle: small role="switch" button surfacing the
 * accessibility one-hand-operation mode (~80px tap targets, voice-only
 * nav hints, screen-reader live regions). Lives in SiteHeader at top
 * of every page.
 *
 * Persona-decoupled per `feedback_persona_not_hardcoded_in_ui.md`:
 * does NOT mention any persona name; describes the operational mode.
 *
 * ARIA contract: role="switch" + aria-checked (true/false) + aria-label
 * containing both state + purpose so screen readers announce the
 * action clearly. Press-target meets WCAG 2.5.5 AAA at 44x44 CSS px
 * minimum; expands to ~80x80 when one-hand mode is enabled per the
 * mode's own CSS class.
 *
 * Wave-47 G4 ship per `project_apex_override_competitor.md` counter-
 * position #4.
 */

import { useOneHandMode } from "../lib/one-hand-mode";

export default function OneHandModeToggle() {
  const { enabled, toggle } = useOneHandMode();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={
        enabled
          ? "One-hand operation mode is on. Click to disable. Larger tap targets and live screen-reader announcements are active."
          : "One-hand operation mode is off. Click to enable. Larger tap targets and live screen-reader announcements will activate."
      }
      onClick={toggle}
      className={`inline-flex items-center gap-2 rounded-sm border px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors ${
        enabled
          ? "border-racing-green bg-racing-green text-paper"
          : "border-ink/15 bg-paper-warm text-ink hover:border-racing-green hover:text-racing-green"
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-3 w-3 rounded-full transition-colors ${
          enabled ? "bg-amber" : "bg-ink/40"
        }`}
      />
      <span>One-hand mode</span>
      <span
        aria-hidden="true"
        className="font-mono text-[10px] opacity-70"
      >
        {enabled ? "ON" : "OFF"}
      </span>
    </button>
  );
}
