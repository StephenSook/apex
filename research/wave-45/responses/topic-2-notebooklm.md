# Topic 2 NotebookLM response (IBM Granite roadmap vs APEX inventory)

> Captured verbatim 2026-05-25 from NotebookLM after Stephen uploaded the 10 Topic-2 sources (IBM Granite + watsonx product pages + Granite TTM r2 + Granite Guardian + Granite Instruct model cards + Guardian arxiv paper + ibm-stack.ts raw + APEX paper + APEX decision-log).

## Granite-family vs APEX usage table

| Granite family | IBM's roadmap emphasis | APEX usage tier | Gap rating | Easiest closure |
|---|---|---|---|---|
| Language Models | "Our most performant dense, non-thinking models yet" with strong instruction-following and tool-calling capabilities | WIRED (Granite 4.1 8B Instruct + Granite 4.0 Nano 350M) | 0 | N/A (matches emphasis) |
| Speech Models | "Industry-leading transcription accuracy across accents, domains and noisy environments" | **MISSING** (uses Watson STT + browser-native Web Speech API) | 5 | Swap Watson STT for Granite Speech 4.1 via OpenRouter/API |
| Vision Models | "Understand documents, charts and images with enterprise-grade precision" | INTEGRATION (Granite Vision 4.1 4B + Granite-Docling 258M) | 2 | Wire frontend /api/timing-sheet-parse to Vinh's M3-V1 actual backend inference swap-point |
| Guardian Models | "Guardrails to detect malicious content and harmful outputs; built for enterprise compliance" | INTEGRATION (Granite Guardian 4.1 8B) | 2 | Connect frontend backend swap-point to completed custom BYOC text-audit rules |
| Embedding Models | "Accurate semantic representations for retrieval, search and classification" | INTEGRATION (Granite Embedding R2) | 3 | Ship Vinh's M3-V8 server-side cosine similarity over precomputed embeddings to replace current lexical TF-IDF mock |
| Time Series Models | "Perform zero-shot and fine-tuned time series forecasting" | INTEGRATION (Granite TimeSeries TTM r2.1 + Granite FlowState 9.1M + IBM TSPulse) | 2 | Wire frontend /api/forecast endpoint directly to Vinh's already-shipped apex/ttm/forecast.py backend pipeline |
| Code / Assistant Models | "Accelerate across your SDLC with an AI partner that understands your codebase" (watsonx Code Assistant) | ACCELERATOR (IBM Bob) | 0 | N/A (matches intended build-time acceleration use case) |

## Most over-claiming component

**Granite 4.0 Nano 350M.** APEX stack inventory marks it as "WIRED" in `ibm-stack.ts` + describes it as "In-browser WebGPU edge model via Transformers.js". However, codebase reveals required `@huggingface/transformers` npm dependency was intentionally NOT installed during this wave to save bundle size + Vercel deployment quotas. Without this dependency, running Granite via Transformers.js locally in the browser is physically impossible, meaning UI is relying on canned-fallback runtime instead of live on-device inference path.

## Most under-claiming component

**LangGraph + MCP + ContextForge.** APEX under-claims on enterprise orchestration logic, publicly marketing Langflow as central piece of stack because it acts as highly visual, easy-to-demonstrate UI for deck + 3-minute pitch video. However, code reveals significantly deeper, more complex integration: actual orchestration runtime relies on LangGraph + Granite MCP Gateway + ContextForge. Langflow was actively demoted by team to mere "visual demo facade" because it could not handle stateful agentic flows required for tri-agent critic loop + Mellea IVR repair. Codebase implements the very "agentic orchestration substrate IBM Consulting actually deploys", making actual engineering depth much stronger than visual-heavy marketing copy suggests.
