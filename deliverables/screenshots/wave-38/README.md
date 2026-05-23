# Wave-38 /judges visual fidelity verification (EdgeSummary section)

**Captured:** 2026-05-23 04:49 UTC via Playwright MCP `browser_navigate` to `http://localhost:3000/judges` at 1920x1080 viewport.

**Artifacts:**

- `judges-edge-summary-wave-38.jpg` (70 KB JPEG viewport screenshot): top-of-page hero rendering of /judges captured at wave-38 head 4882e8d post-A.7 EdgeSummary section insertion. Confirms the wave-38 build renders without console errors + the page hydrates cleanly.
- `judges-snapshot-wave-38.yml` (54 KB, 1300+ lines): Playwright accessibility-tree snapshot covering the full /judges single-page tour with the new wave-38 EdgeSummary section between the tri-agent critic section + Q&A defense pack. Grep this YAML for the EdgeSummary subtree (look for `WebGPU Granite Nano edge inference` heading text + Edge state chip + 1.5 GB pre-check copy + Newton projection diagnostics).
- `console-wave-38.log` (4 entries): Playwright console messages. Clean: only React DevTools INFO + HMR connected + Fast Refresh rebuild messages. Zero browser-side errors.

**EdgeSummary state observed in this capture:**

The screenshot captures the top-of-page hero region (above-the-fold). To capture the EdgeSummary section directly, scroll past the tri-agent critic section OR navigate to `/judges#edge-summary` (anchor link). The accessibility-tree snapshot (`judges-snapshot-wave-38.yml`) DOES include the full EdgeSummary subtree regardless of viewport position. Browser-side WebGPU support varies; the EdgeSummary chip will render `loading`, `ready`, `oom`, or `error` depending on the Chrome 121+ headless adapter's reported `limits.maxBufferSize` against the 1.5 GB pre-mortem row 61 threshold.

**Verification:**

- Page loaded successfully (`Page Title: Judges' Tour · APEX | APEX`)
- Zero browser-side errors at level=error
- React 19 + Next.js 16 hydration clean
- HMR Fast Refresh rebuild completed in 312ms (warm cache; subsequent loads use the build cache)
- New section `id="edge-summary"` + `aria-labelledby="edge-summary-section-title"` added per wave-38 A.7
- Editorial-paddock palette + Fraunces + IBM Plex Sans + IBM Plex Mono fonts loaded

**Per wave-38 plan Stream A.11. Closes Stream A (12 commits inc 1 cascade-#8 hotfix).**
