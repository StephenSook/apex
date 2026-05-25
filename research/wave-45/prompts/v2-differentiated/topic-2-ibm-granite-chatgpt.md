# Topic 2 (IBM Granite new models) - ChatGPT GPT-5.5 prompt

**Model:** ChatGPT (GPT-5.5)
**Angle:** Biggest missed integration opportunity + adversarial framing.

---

I'm shipping APEX to IBM SkillsBuild AI Builders Challenge May 2026 (deadline 2026-05-31). Repo: https://github.com/StephenSook/apex.

Current IBM Granite stack (12 tools):
1. Granite-Docling 258M (FIA COA PDF parser)
2. Docling library (build accelerator)
3. Granite Vision 4.1 4B (timing-sheet OCR)
4. Granite TimeSeries TTM r2.1 + channel-mix decoder fine-tune (Track 1)
5. Granite FlowState 9.1M (Track 2)
6. IBM TSPulse 1M (anomaly detection)
7. Granite Embedding R2 149M+47M (hybrid RAG)
8. Granite Instruct 4.1 8B (narrator; WIRED via OpenRouter)
9. Granite Guardian 4.1 8B (BYOC audit; INTEGRATION at HEAD)
10. Granite 4.0 Nano 350M (in-browser WebGPU; WIRED via Transformers.js)
11. LangGraph + Granite MCP Gateway + ContextForge (orchestration runtime; INTEGRATION; Langflow retained as export-graph artifact)
12. IBM Bob (build accelerator)

Your job as a brutal adversarial reviewer: where is the BIGGEST missed integration opportunity in this stack?

Specifically:
- Is there a Granite variant we should have used but didn't?
- Is there a Granite tool we're using shallow when we could use deep?
- Is there a pattern from IBM watsonx orchestrate / IBM watsonx.governance / IBM Mellea Instruct-Validate-Repair / IBM Granite agentic-flows that would land harder than what we currently ship?
- Is there a Granite Code variant that could write a "explain-your-coaching-recommendation-in-Python" feature for software-side coaching?
- Is there a Granite Speech model that could replace our current Web Speech API voice-debrief?
- Is there a Granite Embedding tier we should have used (e.g., 30M instead of 149M for edge cases)?

Frame 5 specific "you should have done X" criticisms a brutal judge would voice. For each: what's the missed opportunity, what's the EASIEST fix that could land before 2026-05-31, and what's the realistic-effort fix that could land in 24-48 hours.

No mercy. Find the biggest gap.
