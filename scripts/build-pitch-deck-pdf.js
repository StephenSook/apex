const { chromium } = require("/Users/stephensookra/Desktop/IBM May/app/frontend/node_modules/.pnpm/@playwright+test@1.60.0/node_modules/playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  const htmlPath = path.resolve("/Users/stephensookra/Desktop/IBM May/deliverables/apex-pitch-deck.html");
  await page.goto("file://" + htmlPath, { waitUntil: "networkidle" });
  // wait a beat for Google Fonts to render
  await page.waitForTimeout(2500);
  await page.pdf({
    path: "/Users/stephensookra/Desktop/IBM May/deliverables/apex-pitch-deck.pdf",
    width: "1920px",
    height: "1080px",
    printBackground: true,
    pageRanges: "1-10",
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  await browser.close();
  console.log("OK pdf rendered");
})();
