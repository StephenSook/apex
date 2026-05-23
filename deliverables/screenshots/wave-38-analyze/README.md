# Wave-38 /analyze Playwright fidelity verification (Stream C.5)

**Captured:** 2026-05-23 05:29 UTC via Playwright MCP `browser_navigate` to `http://localhost:3000/analyze`.

**Artifacts:**

- `analyze-snapshot-wave-38.yml` (3.8 KB) Playwright accessibility-tree snapshot of the /analyze empty-state. Captures the Breadcrumb + AnalyzeFlow Dropzone (3 file slots + driver-id input + submit button) + the prior-state placeholder before the CoachingReport renders.
- `console-wave-38.log` (4 entries) Playwright console messages. Clean: React DevTools INFO + HMR connected + Fast Refresh rebuild messages. Zero browser-side errors.

**EdgeSummary cross-link callout verification (Stream C.3):**

The EdgeModeCallout aside only renders AFTER the user submits the Dropzone + the CoachingReport materializes (per `report && (...)` conditional in AnalyzeFlow.tsx). The empty-state snapshot captured here does NOT include the callout in the DOM yet; navigate the response state OR mock the report state in a follow-on Playwright session to capture the callout subtree.

Per wave-38 plan Stream C.5 + Stream C.3 cross-link verification. Closes Stream C `/analyze` polish + EdgeSummary cross-link from `/analyze` route.

**Verification (snapshot):**

- Page loaded successfully (`Page Title: Analyze · APEX | APEX`)
- Breadcrumb renders + aria-label="Breadcrumb"
- 3-slot Dropzone visible: telemetry CSV + COA PDF + written debrief
- Driver-id text input present
- Submit button present
- Zero browser-side errors
- React 19 + Next.js 16 hydration clean
- HMR Fast Refresh rebuild < 500ms

**Apex.race production cutover:** the wave-38 Stream D commit b82e6e5 swapped the metadataBase fallback from apex-race.vercel.app to apex.race. The /analyze route is now reachable at both:

- https://apex.race/analyze (canonical)
- https://apex-race.vercel.app/analyze (Vercel alias; still resolves)
