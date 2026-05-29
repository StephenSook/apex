/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import FIABlockquoteChip from "../FIABlockquoteChip";

describe("FIABlockquoteChip wave-46 OVERRIDE-steal #3 component", () => {
  it("renders quote text + attribution + revision citation chip + Verify-on-FIA-com link", () => {
    render(
      <FIABlockquoteChip
        quote="Where a driver requires adaptive control technology, the technical commission shall verify."
        attribution="Adaptive vehicle modifications + control-input simultaneity, FIA Appendix L"
      />,
    );
    expect(screen.getByText(/requires adaptive control technology/i)).toBeInTheDocument();
    // Honesty guard: the chip must label itself a characterization, never a verbatim FIA quote.
    expect(screen.getByText(/not a verbatim quote/i)).toBeInTheDocument();
    expect(screen.getByText(/Adaptive vehicle modifications/i)).toBeInTheDocument();
    // Wave-47 cascade-#53 fix: "FIA Appendix L" appears in BOTH the
    // attribution prop value + the always-rendered chip span; use
    // getAllByText so the assertion accepts the documented multi-mount.
    expect(screen.getAllByText(/FIA Appendix L/i).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/Per the published revision in effect at session time/i),
    ).toBeInTheDocument();
    const verifyLink = screen.getByRole("link", { name: /Verify on FIA.com/i });
    expect(verifyLink).toBeInTheDocument();
    expect(verifyLink).toHaveAttribute("href", "https://www.fia.com/disability-accessibility");
    expect(verifyLink).toHaveAttribute("target", "_blank");
    expect(verifyLink).toHaveAttribute("rel", "noreferrer noopener");
  });

  it("does NOT contain em-dash characters per feedback_em_dash_zero_tolerance HARD-COMPLIANCE", () => {
    render(
      <FIABlockquoteChip
        quote="Where a driver requires adaptive control technology, the technical commission shall verify."
        attribution="FIA Appendix L"
      />,
    );
    const article = document.querySelector("figure");
    expect(article).not.toBeNull();
    expect(article?.textContent ?? "").not.toMatch(/—/);
  });

  it("does NOT leak any invented FIA Article number (HARD-COMPLIANCE)", () => {
    render(
      <FIABlockquoteChip
        quote="Where a driver requires adaptive control technology, the technical commission shall verify."
        attribution="FIA Appendix L"
      />,
    );
    const article = document.querySelector("figure");
    const text = article?.textContent ?? "";
    expect(text).not.toMatch(/FIA Article \d+/);
    expect(text).not.toMatch(/Article \d+\.\d+/);
  });

  it("respects custom revision prop when provided", () => {
    render(
      <FIABlockquoteChip
        quote="Test quote."
        attribution="FIA Appendix L"
        revision="2026 Q1 revision"
      />,
    );
    expect(screen.getByText(/2026 Q1 revision/i)).toBeInTheDocument();
  });
});
