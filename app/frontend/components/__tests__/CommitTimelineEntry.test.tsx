import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import CommitTimelineEntry from "../CommitTimelineEntry";

describe("CommitTimelineEntry", () => {
  it("renders feat-prefix commit with racing-green pill + truncated subject", () => {
    render(
      <CommitTimelineEntry
        sha="abc1234567"
        subject="feat(frontend): wave-45 Phase 5 Block C.2 changelog + apex-cam"
        author="Stephen Sookra"
        authorIso="2026-05-25T18:00:00Z"
      />,
    );
    expect(screen.getByText("feat")).toBeInTheDocument();
    expect(screen.getByText(/abc1234/)).toBeInTheDocument();
    expect(screen.getByText(/Stephen Sookra/)).toBeInTheDocument();
  });

  it("classifies fix-prefix commit with amber pill", () => {
    render(
      <CommitTimelineEntry
        sha="deadbeef"
        subject="fix(frontend): wave-45 cascade-#27 escape apostrophes"
        author="Stephen Sookra"
        authorIso="2026-05-25T18:30:00Z"
      />,
    );
    expect(screen.getByText("fix")).toBeInTheDocument();
  });

  it("expands subject on click + collapses on second click", async () => {
    const user = userEvent.setup();
    const longSubject =
      "feat(frontend): wave-45 Phase 5 Block C.2 changelog + apex-cam visualization + commit-timeline-entry render with conventional-commit prefix color pill";
    render(
      <CommitTimelineEntry
        sha="abc1234"
        subject={longSubject}
        author="Stephen Sookra"
        authorIso="2026-05-25T18:00:00Z"
      />,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button.textContent).toMatch(/\.\.\.$/);
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button.textContent).toBe(longSubject);
  });

  it("classifies non-prefix commit as 'ship' (fallback) with muted-rule pill", () => {
    render(
      <CommitTimelineEntry
        sha="abc1234"
        subject="Initial commit"
        author="vinhbin"
        authorIso="2026-05-22T00:00:00Z"
      />,
    );
    expect(screen.getByText("ship")).toBeInTheDocument();
  });
});
