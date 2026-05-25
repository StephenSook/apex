import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import JudgeWalkthroughStep from "../JudgeWalkthroughStep";

describe("JudgeWalkthroughStep (wave-45 Phase 4 Block C.1)", () => {
  it("renders eyebrow + headline + body text", () => {
    render(
      <JudgeWalkthroughStep
        stepNumber={1}
        totalSteps={6}
        eyebrow="Step 1"
        headline="Problem statement headline"
        body={<p>Body paragraph text here</p>}
      />,
    );
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Problem statement headline")).toBeInTheDocument();
    expect(screen.getByText("Body paragraph text here")).toBeInTheDocument();
  });

  it("renders CTA link when provided", () => {
    render(
      <JudgeWalkthroughStep
        stepNumber={2}
        totalSteps={6}
        eyebrow="Step 2"
        headline="Stack headline"
        body={<p>Body</p>}
        cta={{ href: "/judges#stack", label: "Open IBM stack panel" }}
      />,
    );
    const link = screen.getByRole("link", { name: /Open IBM stack panel/i });
    expect(link).toHaveAttribute("href", "/judges#stack");
  });

  it("renders previous + next nav when both provided", () => {
    render(
      <JudgeWalkthroughStep
        stepNumber={3}
        totalSteps={6}
        eyebrow="Step 3"
        headline="Middle step"
        body={<p>Body</p>}
        previousStep={2}
        nextStep={4}
      />,
    );
    expect(screen.getByRole("link", { name: /Previous/i })).toHaveAttribute(
      "href",
      "/judge-tour?step=2",
    );
    expect(screen.getByRole("link", { name: /Next/i })).toHaveAttribute(
      "href",
      "/judge-tour?step=4",
    );
  });

  it("renders only Next when first step", () => {
    render(
      <JudgeWalkthroughStep
        stepNumber={1}
        totalSteps={6}
        eyebrow="Step 1"
        headline="First step"
        body={<p>Body</p>}
        nextStep={2}
      />,
    );
    expect(screen.queryByRole("link", { name: /Previous/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Next/i })).toBeInTheDocument();
  });

  it("renders only Previous when last step", () => {
    render(
      <JudgeWalkthroughStep
        stepNumber={6}
        totalSteps={6}
        eyebrow="Step 6"
        headline="Last step"
        body={<p>Body</p>}
        previousStep={5}
      />,
    );
    expect(screen.getByRole("link", { name: /Previous/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Next/i })).not.toBeInTheDocument();
  });

  it("renders progress indicator text 'Step N of M'", () => {
    render(
      <JudgeWalkthroughStep
        stepNumber={3}
        totalSteps={6}
        eyebrow="Step 3"
        headline="Headline"
        body={<p>Body</p>}
      />,
    );
    expect(screen.getByText(/3 of 6/i)).toBeInTheDocument();
  });
});
