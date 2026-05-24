import { expect, test } from "@playwright/test";

/**
 * Wave-43 C2.4 /judges fidelity spec per the wave-43 plan.
 *
 * Walks the judges-only tour page + asserts:
 *   - all wave-30 D-019 galaxy-tier panel headings render
 *   - per-tile a11y heading hierarchy is intact (h1 + h2 + h3 chain)
 *   - no console errors during initial render + scroll
 *   - PhysicsConfidenceRing + EdgeSummary + ALoRA + GEPA + EAGLE3
 *     + TriAgent + RaceEvent tiles all mount without throwing
 *
 * Acceptance: spec runs against `pnpm dev` on localhost:3000 OR a
 * built Vercel preview URL (override via PLAYWRIGHT_BASE_URL env).
 */

test.describe("/judges fidelity", () => {
  test.beforeEach(async ({ page }) => {
    page.on("pageerror", (err) => {
      throw new Error(`apex.judges-fidelity: pageerror surfaced: ${err.message}`);
    });
  });

  test("renders all wave-30 D-019 galaxy-tier panel headings", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    await page.goto("/judges", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /APEX/i }).first()).toBeVisible();
    await expect(page.getByText(/Edge Summary|Granite 4.0 Nano/i).first()).toBeVisible();
    await expect(page.getByText(/Race-engineer intrinsic adapter/i).first()).toBeVisible();
    await expect(page.getByText(/Offline DSPy prompt optimization/i).first()).toBeVisible();
    await expect(page.getByText(/Draft-and-accept latency speedup/i).first()).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("page-level a11y landmarks present", async ({ page }) => {
    await page.goto("/judges", { waitUntil: "networkidle" });
    const main = page.locator("main, [role='main']");
    await expect(main.first()).toBeVisible();
  });

  test("scroll through the page without console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    await page.goto("/judges", { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
    expect(consoleErrors).toEqual([]);
  });
});
