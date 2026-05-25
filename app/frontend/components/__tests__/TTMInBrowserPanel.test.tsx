import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import TTMInBrowserPanel from "../TTMInBrowserPanel";

describe("TTMInBrowserPanel (D-053 shouldn't-be-possible move #7)", () => {
  it("renders idle state with Run TTM in-browser button + opt-in copy", () => {
    render(<TTMInBrowserPanel />);
    expect(screen.getByRole("button", { name: /Run TTM in-browser/i })).toBeInTheDocument();
    expect(screen.getByText(/lazy-loaded on opt-in/i)).toBeInTheDocument();
  });

  it("transitions idle -> ready with canned-fallback runtime pill on button click (HEAD state)", async () => {
    const user = userEvent.setup();
    render(<TTMInBrowserPanel />);
    await user.click(screen.getByRole("button", { name: /Run TTM in-browser/i }));
    await waitFor(() => {
      expect(screen.getByText(/Runtime: canned-fallback/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/30-step horizon at 1 Hz/i)).toBeInTheDocument();
  });

  it("renders 30 forecast cells in the ready state", async () => {
    const user = userEvent.setup();
    render(<TTMInBrowserPanel />);
    await user.click(screen.getByRole("button", { name: /Run TTM in-browser/i }));
    await waitFor(() => {
      const cells = screen.getAllByLabelText(/Forecast step \d+/);
      expect(cells).toHaveLength(30);
    });
  });
});
