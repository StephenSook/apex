# Prompt 2 — IBM Granite new models since 2026-02

**Paste verbatim into Perplexity + Gemini + ChatGPT + NotebookLM.**

---

List every IBM Granite model variant released between 2026-02-01 and 2026-05-25 (today). For each model include:

- Release date
- Parameter count
- Hugging Face / OpenRouter / IBM watsonx.ai availability
- Intended use cases
- ONNX export status (for browser-side Transformers.js wiring)
- Any benchmark numbers (MMLU + HumanEval + lap-time-forecasting + multivariate-TSF if applicable)

Specifically cover:

- **Granite Code variants** (Granite Code 8B + 20B + larger; any code-explanation / code-coaching capability)
- **Granite Time Series r3 or later** (any post-r2 TSFM with better lap-periodic forecasting?)
- **Granite Speech** (any TTS or STT model worth swapping Watson TTS / Watson STT for?)
- **Granite Embedding 2nd-gen** (any post-R2 embedder with smaller browser bundle?)
- **Granite Vision 4.1 5B+ or later** (any successor to Granite Vision 4.1 4B?)
- **Granite Multimodal** (any unified vision + language + time-series model?)

For our specific use case: APEX ships a 12-tool IBM Granite stack with per-tool honesty tier. We are looking for new tools to deepen the "Best Use of Technology" track win. Any model that would meaningfully increase our IBM-tool count OR meaningfully deepen our integration of an existing tool slot?

Specifically rate (high / medium / low) the value of adding each new model to APEX for the IBM SkillsBuild AI Builders Challenge May 2026 submission (deadline 2026-05-31).

**Output format**: Structured table with columns (Model | Release date | Params | HF/OR/watsonx | ONNX | Intended use | Value for APEX). Cite sources per row. Mark UNCERTAIN explicitly when data is missing.

**Context**: APEX repo at github.com/StephenSook/apex. Current stack: Granite-Docling 258M + Granite Vision 4.1 4B + Granite TimeSeries TTM r2.1 + Granite FlowState 9.1M + IBM TSPulse 1M + Granite Embedding R2 149M + Granite Instruct 4.1 8B + Granite Guardian 4.1 8B + Granite 4.0 Nano 350M + Langflow (facade) + Docling library + IBM Bob.

---

## Where to save the response

`research/wave-45/responses/prompt-2-{perplexity,gemini,chatgpt,notebooklm}.md`
