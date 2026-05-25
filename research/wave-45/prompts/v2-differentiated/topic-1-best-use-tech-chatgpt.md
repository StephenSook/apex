# Topic 1 (Best Use of Technology) - ChatGPT GPT-5.5 prompt

**Model:** ChatGPT (GPT-5.5)
**Angle:** Adversarial / red-team / "if you were the brutal judge"

---

Pretend you are the most brutal IBM Best Use of Technology judge at the BeMyApp / IBM SkillsBuild AI Builders Challenge May 2026. You have 30 seconds to score each submission. You are tired of "we used Granite Instruct to summarize text" shallow submissions. You want depth, integration, and a load-bearing architectural reason every tool is in the stack.

The submission you are scoring is APEX, an AI race engineer for adaptive racing drivers. Repo at https://github.com/StephenSook/apex. Live at https://apex-one-black.vercel.app.

APEX's 12-tool stack:
1. Granite-Docling 258M (FIA COA PDF parser - INTEGRATION tier)
2. Docling library (ACCELERATOR tier)
3. Granite Vision 4.1 4B (timing-sheet PDF OCR - INTEGRATION tier)
4. Granite TimeSeries TTM r2.1 + channel-mix decoder fine-tune (3-track ensemble Track 1 - INTEGRATION tier)
5. Granite FlowState 9.1M (Track 2 - INTEGRATION tier)
6. IBM TSPulse 1M (polyphase anomaly - INTEGRATION tier)
7. Granite Embedding R2 149M + 47M (hybrid RAG - INTEGRATION tier)
8. Granite Instruct 4.1 8B (narrator - WIRED tier)
9. Granite Guardian 4.1 8B (BYOC custom-rule audit - INTEGRATION tier)
10. Granite 4.0 Nano 350M (in-browser WebGPU - WIRED tier)
11. LangGraph + Granite MCP Gateway + ContextForge (orchestration runtime - INTEGRATION tier; Langflow retained as export-graph artifact)
12. IBM Bob (build ACCELERATOR tier)

Load-bearing claim: engine-agnostic byte-equality lock per D-050 (V1 NumPy + V2 cvxpylayers projectors emit byte-identical violation strings modulo ENGINE header line).

Differentiators:
- Only AI race-engineer workflow we found that reads the FIA Certificate of Adaptations as a binding regulatory input at the tensor level
- COA-parameterized brake-throttle simultaneity gate (adaptive electronic hand-controls invariant)
- First-ever published pretrained TSFM application to adaptive motorsport telemetry per literature review through 2026-Q2

Your job: tear this apart. Find the cracks. Where would you, as a brutal judge, score this lower than the project team thinks? What would you call out as "shallow integration"? What would you say is missing for Best Use of Technology specifically?

Give me 5 brutal criticisms a real judge would actually voice, ranked by how much it would lower the score. Each criticism: what's wrong + how it could be fixed before 2026-05-31 deadline.

No mercy. Stephen wants this to win; he asked you specifically to find what would lose it the prize.
