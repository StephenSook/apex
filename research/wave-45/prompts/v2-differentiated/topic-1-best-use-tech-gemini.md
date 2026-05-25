# Topic 1 (Best Use of Technology) - Gemini 2.5 Pro prompt

**Model:** Gemini 2.5 Pro (1M+ context)
**Angle:** Aggregate across IBM marketing decks, Granite case study PDFs, Mission 44 docs, BeMyApp judging rubric.

---

I am submitting to the IBM SkillsBuild AI Builders Challenge May 2026 ("AI Beyond the Finish Line" theme). My project is APEX, an AI race engineer for adaptive racing drivers (drivers with FIA Certificates of Adaptations). Full submission at https://github.com/StephenSook/apex; live deploy at https://apex-one-black.vercel.app.

The 12-tool IBM Granite stack in APEX:
1. Granite-Docling 258M (FIA COA PDF parser)
2. Docling library (open-source conversion layer)
3. Granite Vision 4.1 4B (timing-sheet PDF OCR)
4. Granite TimeSeries TTM r2.1 + fine-tune (channel-mix decoder, Track 1 of 3-track ensemble)
5. Granite FlowState 9.1M (Track 2, sampling-rate-invariant continuous-time SSM)
6. IBM TSPulse 1M (polyphase time-frequency anomaly detection)
7. Granite Embedding R2 149M + 47M (hybrid dense + sparse RAG)
8. Granite Instruct 4.1 8B (race-engineer narrator)
9. Granite Guardian 4.1 8B (BYOC physics-confidence audit + downgrade)
10. Granite 4.0 Nano 350M (WebGPU in-browser edge model)
11. LangGraph + Granite MCP Gateway + ContextForge (orchestration runtime; Langflow retained as export-graph artifact)
12. IBM Bob (build accelerator)

Architecture: frozen TTM forecast > differentiable CvxpyLayer projection QP > Granite Guardian text audit; engine-agnostic byte-equality lock (V1 NumPy + V2 cvxpylayers projectors emit byte-identical violation strings modulo the leading ENGINE header line).

Your task: aggregate across IBM's published case studies (Ferrari watsonx, Mercedes, Climate TRACE, NASA Snow & Ice, IBM Mission 44 / Hamilton Commission, Granite Time Series whitepapers, Granite Code papers, Granite Guardian safety papers, Granite Vision technical reports, watsonx orchestrate docs, Langflow docs, IBM Mellea Instruct-Validate-Repair docs).

For each IBM ecosystem doc you can recall, tell me:
1. What technical pattern IBM is publicly proudest of (which Granite model + which integration depth they showcase)
2. Whether APEX's current 12-tool stack already mirrors that pattern OR is missing a load-bearing piece
3. Specifically: which Granite component on APEX's stack would IBM judges (as opposed to motorsport judges) find most compelling, and which would they find under-utilized

Return as 12 numbered sections (one per APEX tool). For each: IBM's "we love this" angle, APEX's current usage depth, and the gap (if any) to close before submission deadline 2026-05-31.

You have 1M+ context; use it. Aggregate broadly.
