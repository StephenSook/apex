# Topic 4 NotebookLM response (Score wave-45 ships against BeMyApp rubric)

> Captured verbatim 2026-05-25 from NotebookLM after Stephen uploaded the 12 Topic-4 sources (Official Rules + APEX README + paper + pitch script + Q&A + decision-log + all 6 wave-45 live route PDFs: /judges + /judge-tour + /lips-harness + /changelog + /compare + /methodology).

## 16 wave-45 ships scored against 4 BeMyApp prize categories (1-10)

| Ship | 1st Place | Runner-up | Best Use of Tech | Most Innovative |
|---|---:|---:|---:|---:|
| a) Interactive COA gate toggle | 10 | 8 | 9 | 10 |
| b) Real-time apex-cam pipeline visualization | 9 | 9 | 8 | 8 |
| c) /changelog auto-rendered from git log | 7 | 10 | 7 | 6 |
| d) Granite TTM in-browser via Transformers.js | 9 | 6 | 10 | 10 |
| e) Per-track sponsor tightening copy | 10 | 9 | 5 | 6 |
| f) /judge-tour 6-step walkthrough | 9 | 9 | 6 | 6 |
| g) Multi-driver /compare baseline-vs-improved | 8 | 8 | 8 | 7 |
| h) /methodology Sookra Five Pillars landing | 9 | 10 | 7 | 7 |
| i) Engine-agnostic byte-equality demo (D-050) | 10 | 9 | 10 | 9 |
| j) NeurIPS Workshop paper draft | 10 | 8 | 9 | 10 |
| k) /lips-harness LIPS 4-axis ablation | 8 | 8 | 10 | 8 |
| l) LangGraph runtime orchestration trace | 8 | 9 | 10 | 8 |
| m) OG cards on every route | 6 | 9 | 5 | 4 |
| n) Mobile install QR + PWA | 8 | 10 | 8 | 8 |
| o) Sim-rig HTTP stream + 20Hz NDJSON | 8 | 8 | 9 | 8 |
| p) Voice debrief input | 8 | 8 | 8 | 8 |

## Top 3 ships per prize category

### 1st Place ($2,250)
1. (i) **Engine-agnostic byte-equality demo (D-050)** — single most defensible technical-positioning claim; proves physics-projection layer genuinely works.
2. (a) **Interactive COA gate toggle** — instantly communicates core human + technical problem (adaptive drivers need different physical constraint envelope) in a tactile judge-facing switch.
3. (j) **NeurIPS Workshop paper draft** — packaging hackathon code into academic paper with named scientific problem (Kinetic Hallucination) proves galaxy-tier ambition + elevates overall impact.

### Runner-up ($1,250)
1. (c) **/changelog auto-rendered from git log** — automatically pulling + rendering live build history proves to judges that 300+ commits were legitimately shipped over 12 days.
2. (h) **/methodology Sookra Five Pillars landing** — systematizes extreme operational discipline (LLM-output compliance scrubber + no-hardcoded-personas rule); establishes as actual product.
3. (n) **Mobile install QR + PWA** — giving judges QR to install app on their phone + full-screen paddock-ready UI = ultimate flex of production readiness.

### Best Use of Technology ($750)
1. (l) **LangGraph runtime orchestration trace** — proves team didn't just use basic Langflow but stepped up to enterprise-grade LangGraph + MCP + ContextForge state machine.
2. (k) **/lips-harness LIPS 4-axis ablation** — comprehensive empirical test harness proving technical success of physics projection vs zero-shot baseline.
3. (i) **Engine-agnostic byte-equality demo (D-050)** — architectural feat of having two entirely different mathematical solver engines (NumPy + cvxpylayers) output identical logs for AI safety guardrail.

### Most Innovative ($750)
1. (a) **Interactive COA gate toggle** — creative leap turning FIA regulatory PDF into binary tensor flag fundamentally altering physics calculations = highly original AI application in motorsports.
2. (d) **Granite TTM in-browser via Transformers.js** — running time-series foundation model completely client-side in browser via WebGPU pushes boundaries of edge AI.
3. (j) **NeurIPS Workshop paper draft** — sheer creativity + ambition framing 12-day hackathon submission as novel research contribution to time-series foundation models.

## NEUTRAL or HURTS (Feature-bloat / Over-claim risk)

### HURTS — (d) Granite TTM in-browser via Transformers.js

While pitched heavily as "7th shouldn't-be-possible move", project decision log admits `@huggingface/transformers` npm dependency is "intentionally NOT installed this wave per bundle-size + Vercel-deploy-quota constraints". UI merely renders "canned-fallback path" producing deterministic 30-step mock forecast. Attempted mitigation via honesty discipline badge flipping from amber to green once installed, but marketing as completed galaxy move when actual library uninstalled + data mocked = massive over-claim. If judge looks at network tab or code, project's technical credibility could instantly collapse.

### NEUTRAL — (m) OG cards on every route

Open Graph tags generate preview images when links shared on social media. Adds professional polish + UI hygiene but has absolutely no bearing on AI Builders Challenge judging rubric criteria (Technical Execution / Innovation / Challenge Fit / Implementation). Pure meta-project padding.
