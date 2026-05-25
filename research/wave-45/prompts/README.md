# Wave-45 Block E tier-3 cross-model research prompts

Paste-ready prompts for Stephen to run across 4 LLMs in parallel (Perplexity + Gemini + ChatGPT + NotebookLM). Each prompt asks the SAME question across all 4 models for synthesis triangulation. Stephen captures responses + drops them in `research/wave-45/responses/<prompt-N>-<model>.md` for synthesis ingestion.

Per `feedback_research_escalation_protocol.md` memory rule. Wave-45 plan Phase 8 close-out.

## Prompt files

1. `prompt-1-best-use-of-technology-winners.md` — past IBM SkillsBuild Best-Use-of-Technology winning patterns
2. `prompt-2-ibm-granite-new-models.md` — IBM Granite new models since 2026-02
3. `prompt-3-competitor-activity-since-may-23.md` — adaptive motorsport competitor activity since 2026-05-23
4. `prompt-4-research-as-validation.md` — judge-recognized-impact ranking of wave-45 ships

## Process

For each prompt:

1. Paste verbatim into Perplexity + Gemini + ChatGPT + NotebookLM (4 sessions in parallel).
2. Save each response as `research/wave-45/responses/prompt-N-{perplexity,gemini,chatgpt,notebooklm}.md`.
3. Send responses back to Claude in a single message ("synthesize prompt N").
4. Claude synthesizes into `research/wave-45/synthesis.md` + locks any new memory rules.

## Why 4 models

Triangulation. Each model has different training-data cutoff + different bias + different access (Perplexity = web search; ChatGPT = OpenAI corpus; Gemini = Google corpus; NotebookLM = user-uploaded corpus). Disagreement surfaces the uncertainty band; agreement raises confidence.

Per `feedback_research_escalation_protocol.md`: tier-1 = Claude-side single-call; tier-2 = Claude wide-pass; tier-3 = cross-model fan-out. Wave-45 Phase 8 is tier-3.
