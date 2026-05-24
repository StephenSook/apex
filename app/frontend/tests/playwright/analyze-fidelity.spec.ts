import { expect, test } from "@playwright/test";

/**
 * Wave-43 C2.5 /analyze fidelity spec.
 *
 * Walks the /analyze flow + asserts:
 *   - Dropzone renders with file inputs + debrief textarea + driver-id textbox + submit button
 *   - All 4 affordances are visible + correctly labeled
 *   - No console errors during initial render
 *   - Persona-decoupling Lane K rule: Sarah Reynolds is NOT in the
 *     default /analyze landing-state DOM (pre-submission UI is generic)
 *
 * Submission flow + full report rendering is covered by vitest
 * (AnalyzeFlow.test.tsx) which provides reliable mock-driven coverage
 * without Playwright fixture-validation brittleness. This spec focuses
 * on the Dropzone landing UX + the persona-decoupling rule that vitest
 * cannot enforce end-to-end (vitest mocks the report builder; Playwright
 * sees actual rendered DOM).
 *
 * Acceptance: spec runs against `pnpm dev` on localhost:3000 OR a
 * built Vercel preview URL (override via PLAYWRIGHT_BASE_URL env).
 */

test.describe("/analyze fidelity", () => {
  test.beforeEach(async ({ page }) => {
    page.on("pageerror", (err) => {
      throw new Error(`apex.analyze-fidelity: pageerror surfaced: ${err.message}`);
    });
  });

  test("Dropzone renders all 4 input affordances", async ({ page }) => {
    await page.goto("/analyze", { waitUntil: "networkidle" });
    await expect(page.getByRole("textbox", { name: /Driver identifier/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /Your debrief/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Generate coaching report/i })).toBeVisible();
    const fileInputs = page.locator('input[type="file"]');
    await expect(fileInputs).toHaveCount(2);
  });

  test("Persona-decoupling Lane K rule: Sarah NOT in default landing DOM", async ({ page }) => {
    await page.goto("/analyze", { waitUntil: "networkidle" });
    // Sarah Reynolds persona must NOT appear in the default /analyze
    // landing-state DOM. Per Lane K (Sookra Methodology amendment
    // 2026-05-24), personas live in storytelling surfaces only;
    // product UI default-state is generic.
    await expect(page.getByText(/sarah[ -]reynolds/i)).toHaveCount(0);
    await expect(page.getByText(/sarah-reynolds-britcar-2026/i)).toHaveCount(0);
  });

  test("No console errors on initial render", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    await page.goto("/analyze", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    expect(consoleErrors).toEqual([]);
  });
});
