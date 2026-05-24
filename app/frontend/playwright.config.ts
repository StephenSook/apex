import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for APEX wave-43 C2.4 + C2.5 fidelity specs.
 *
 * - `testDir: "tests/playwright"` keeps vitest + Playwright spec dirs
 *   physically separated so the two runners do not cross-collect.
 * - `webServer.command` boots Next dev mode against port 3000.
 * - Chromium-only on CI for runtime budget. Add `firefox` + `webkit`
 *   projects later if cross-browser visual regression matters.
 * - `reporter: [["list"], ["html", { open: "never" }]]` so CI logs show
 *   green/red per spec + a static HTML report gets archived as a build
 *   artifact for failure-triage.
 */
export default defineConfig({
  testDir: "tests/playwright",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI !== undefined ? 2 : 0,
  workers: process.env.CI !== undefined ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
