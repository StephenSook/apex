/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import OneHandModeToggle from "../OneHandModeToggle";
import { OneHandModeProvider } from "../../lib/one-hand-mode";

/**
 * Wave-47 G4 one-hand accessibility mode toggle component test scaffold.
 *
 * Covers: ARIA role=switch + aria-checked state machine + localStorage
 * persistence + html.apex-one-hand class toggle.
 */
describe("OneHandModeToggle wave-47 G4 component", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("apex-one-hand");
  });

  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("apex-one-hand");
  });

  it("renders as role=switch with aria-checked=false on initial mount (off state)", () => {
    render(
      <OneHandModeProvider>
        <OneHandModeToggle />
      </OneHandModeProvider>,
    );
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toBeInTheDocument();
    expect(switchEl).toHaveAttribute("aria-checked", "false");
    expect(switchEl.getAttribute("aria-label")).toMatch(/One-hand operation mode is off/i);
  });

  it("toggles aria-checked + adds html.apex-one-hand class + persists to localStorage on click", async () => {
    const user = userEvent.setup();
    render(
      <OneHandModeProvider>
        <OneHandModeToggle />
      </OneHandModeProvider>,
    );
    const switchEl = screen.getByRole("switch");
    await user.click(switchEl);
    expect(switchEl).toHaveAttribute("aria-checked", "true");
    expect(switchEl.getAttribute("aria-label")).toMatch(/One-hand operation mode is on/i);
    expect(document.documentElement.classList.contains("apex-one-hand")).toBe(true);
    expect(window.localStorage.getItem("apex-one-hand-mode")).toBe("1");
  });

  it("toggles back to off state on second click + clears html class + sets localStorage 0", async () => {
    const user = userEvent.setup();
    render(
      <OneHandModeProvider>
        <OneHandModeToggle />
      </OneHandModeProvider>,
    );
    const switchEl = screen.getByRole("switch");
    await user.click(switchEl);
    await user.click(switchEl);
    expect(switchEl).toHaveAttribute("aria-checked", "false");
    expect(document.documentElement.classList.contains("apex-one-hand")).toBe(false);
    expect(window.localStorage.getItem("apex-one-hand-mode")).toBe("0");
  });
});
