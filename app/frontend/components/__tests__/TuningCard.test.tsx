import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { TuningDelta } from "../../../shared/types";
import TuningCard from "../TuningCard";

function makeTuning(overrides: Partial<TuningDelta> = {}): TuningDelta {
  return {
    parameter: "hand_lever_brake_travel",
    current: 38.0,
    recommended: 34.0,
    unit: "mm",
    citation: { fia_article: "Appendix L", coa_section: "Section 3(c) hardware spec" },
    ...overrides,
  };
}

describe("TuningCard", () => {
  it("renders the parameter with underscores converted to spaces", () => {
    render(<TuningCard tuning={makeTuning()} />);
    expect(screen.getByRole("heading", { name: /hand lever brake travel/i })).toBeInTheDocument();
  });

  it("renders current + recommended + delta with units", () => {
    render(<TuningCard tuning={makeTuning()} />);
    expect(screen.getByText("38.00 mm")).toBeInTheDocument();
    expect(screen.getByText("34.00 mm")).toBeInTheDocument();
    expect(screen.getByText("-4.00 mm")).toBeInTheDocument();
  });

  it("prefixes positive deltas with +", () => {
    render(<TuningCard tuning={makeTuning({ current: 30, recommended: 32 })} />);
    expect(screen.getByText("+2.00 mm")).toBeInTheDocument();
  });

  it("renders citation chip with FIA Appendix L anchor + COA hardware-spec pointer", () => {
    render(<TuningCard tuning={makeTuning()} />);
    expect(screen.getByText("Appendix L")).toBeInTheDocument();
    expect(screen.getByText("Section 3(c) hardware spec")).toBeInTheDocument();
  });

  it("renders role=alert when current is NaN (silent-failure H2 regression guard)", () => {
    render(<TuningCard tuning={makeTuning({ current: Number.NaN })} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Tuning unavailable/i)).toBeInTheDocument();
    expect(screen.queryByText("NaN mm")).not.toBeInTheDocument();
  });

  it("renders role=alert when recommended is Infinity", () => {
    render(<TuningCard tuning={makeTuning({ recommended: Number.POSITIVE_INFINITY })} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Tuning unavailable/i)).toBeInTheDocument();
  });
});
