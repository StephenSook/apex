import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import MobileInstallQR from "../MobileInstallQR";

describe("MobileInstallQR (wave-45 Phase 6 Block C.3 + wave-45.5 honesty sweep)", () => {
  it("renders default heading 'Open on phone (PWA install)' (post-honesty sweep)", () => {
    render(<MobileInstallQR />);
    expect(screen.getByText(/Open on phone/i)).toBeInTheDocument();
    expect(screen.queryByText(/^Scan to install on phone$/i)).not.toBeInTheDocument();
  });

  it("renders the default install URL as a clickable link", () => {
    render(<MobileInstallQR />);
    const link = screen.getByRole("link", { name: /apex-one-black\.vercel\.app/i });
    expect(link).toHaveAttribute("href", "https://apex-one-black.vercel.app/judges");
  });

  it("honors targetUrl + heading props", () => {
    render(
      <MobileInstallQR
        targetUrl="https://example.com/judges"
        heading="Custom heading text"
      />,
    );
    expect(screen.getByText("Custom heading text")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /example\.com\/judges/i })).toHaveAttribute(
      "href",
      "https://example.com/judges",
    );
  });

  it("renders aria-label communicating placeholder semantics (not scan-promise)", () => {
    render(<MobileInstallQR />);
    const aside = screen.getByLabelText(/Mobile install URL affordance with QR visual placeholder/i);
    expect(aside).toBeInTheDocument();
  });

  it("renders honest copy about scannable QR landing later", () => {
    render(<MobileInstallQR />);
    expect(screen.getByText(/Scannable QR via static-asset bundling lands wave-46/i)).toBeInTheDocument();
  });
});
