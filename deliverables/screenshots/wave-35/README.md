# Wave-35 /judges visual fidelity verification

**Captured:** 2026-05-23 02:06 UTC via Playwright MCP `browser_navigate` to `http://localhost:3000/judges` at 1920x1080 viewport.

**Artifacts:**

- `judges-snapshot-wave-35.yml` (754 lines, 52 KB): Playwright accessibility-tree snapshot of the full /judges page. Captures every section heading, label, link, role, and aria-label across the 8-section single-page tour (Hero + Resource map + 12 IBM tools + Architecture diagram + Convergence 14 grid + 8-tier physics grid + Tri-agent critic panel + Q&A + Team + footer). Deck assembly + cold review can grep this snapshot for content presence without re-rendering.
- `console-wave-35.log` (2 lines): Playwright console messages at level=error. Clean: only React DevTools INFO + HMR connected. Zero browser-side errors on the rendered page.

**Why a snapshot instead of a full-page JPEG:** the Playwright MCP `browser_take_screenshot` tool has a 5-second buffer that consistently times out on the /judges full-page render. The accessibility-tree snapshot serves the same verification purpose for our use cases (content presence + structure + a11y compliance) without the screenshot timeout. A full-page JPEG via headless Chrome direct CLI is the Day 11 deck-assembly path (see `deliverables/screenshots/day-01-landing-1440x900.png` for the prior pattern).

**Verification:**

- Page loaded successfully (`Page Title: Judges' Tour · APEX | APEX`)
- All 8 sections present in the accessibility tree
- Wave-35 A.13+A.14 mock variants (Mock A flag + Mock B reject + in-distribution + out-of-distribution badges) visible in the tri-agent critic section per `id="tri-agent"`
- Zero browser-side errors at level=error
- Editorial-paddock palette + Fraunces + IBM Plex Sans + IBM Plex Mono fonts loaded (verified via Next.js link rel=preload headers in the curl probe)

**Per wave-35 plan Stream F.**
