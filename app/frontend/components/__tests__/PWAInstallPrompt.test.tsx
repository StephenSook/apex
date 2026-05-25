import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PWAInstallPrompt from "../PWAInstallPrompt";

// Wave-45 Phase 3 pr-test-analyzer H1 close-out: PWAInstallPrompt
// 6-state DU spec. Mounted-flag pattern + iOS detection + beforeinstall
// prompt event + accepted/dismissed userChoice paths all covered.

interface MatchMediaMock {
  matches: boolean;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
}

function stubMatchMedia(standalone: boolean): void {
  const mock: MatchMediaMock = {
    matches: standalone,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockReturnValue(mock),
  });
}

function stubUserAgent(ua: string): void {
  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    writable: true,
    value: ua,
  });
}

describe("PWAInstallPrompt", () => {
  beforeEach(() => {
    stubMatchMedia(false);
    stubUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders null pre-mount (SSR-matching) + null when standalone display-mode matches", async () => {
    stubMatchMedia(true);
    const { container } = render(<PWAInstallPrompt />);
    // Wait one tick for mounted-flag flip + standalone check to suppress.
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it("renders iOS install instruction banner when navigator.userAgent matches iPhone (no CriOS)", async () => {
    stubUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605 Safari/604.1");
    render(<PWAInstallPrompt />);
    await waitFor(() => {
      expect(screen.getByLabelText(/Install APEX on iOS/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Add to Home Screen/i)).toBeInTheDocument();
  });

  it("captures beforeinstallprompt event + renders Install button", async () => {
    render(<PWAInstallPrompt />);
    const event = new Event("beforeinstallprompt") as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
      platforms: ReadonlyArray<string>;
    };
    Object.assign(event, {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: "accepted", platform: "web" }),
      platforms: ["web"],
    });
    window.dispatchEvent(event);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Install APEX/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/Install APEX as an app on your phone/i)).toBeInTheDocument();
  });

  it("transitions ready→installing→installed when user clicks Install + userChoice accepts", async () => {
    const user = userEvent.setup();
    render(<PWAInstallPrompt />);
    const event = new Event("beforeinstallprompt") as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
      platforms: ReadonlyArray<string>;
    };
    Object.assign(event, {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: "accepted", platform: "web" }),
      platforms: ["web"],
    });
    window.dispatchEvent(event);
    const installButton = await screen.findByRole("button", { name: /Install APEX/i });
    await user.click(installButton);
    await waitFor(() => {
      expect(screen.getByLabelText(/APEX installed confirmation/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/APEX installed/i)).toBeInTheDocument();
  });

  it("transitions ready→installing→dismissed when user clicks Install + userChoice dismissed", async () => {
    const user = userEvent.setup();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<PWAInstallPrompt />);
    const event = new Event("beforeinstallprompt") as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
      platforms: ReadonlyArray<string>;
    };
    Object.assign(event, {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: "dismissed", platform: "web" }),
      platforms: ["web"],
    });
    window.dispatchEvent(event);
    const installButton = await screen.findByRole("button", { name: /Install APEX/i });
    await user.click(installButton);
    await waitFor(() => {
      expect(screen.getByLabelText(/APEX install dismissed/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Install dismissed/i)).toBeInTheDocument();
    warnSpy.mockRestore();
  });
});
