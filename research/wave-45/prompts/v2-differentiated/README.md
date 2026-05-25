# Tier-3 Cross-Model Research Dispatch v2 (Differentiated by Model Strength)

Wave-45 Phase 8 Block E v2 re-issue. 4 topics x 4 model angles = 16 paste-ready prompts.

Each topic stresses a different facet on each model so synthesis triangulates across strengths instead of asking the same question 4 ways:

| Model | Strength | Prompt angle |
|-------|---------|--------------|
| Perplexity | Web grounding + recent sources | Facts on the ground (links, dates, names) |
| Gemini 2.5 Pro | 1M+ context + aggregation | Aggregate + compare across docs/decks/codebases |
| ChatGPT (GPT-5.5) | Critical-thinking + adversarial framing | Adversarial / red-team / weakness-hunt |
| NotebookLM | Document-grounded synthesis | Score APEX directly against rubric / sources you feed it |

## How to use

1. Open Perplexity, Gemini, ChatGPT, and NotebookLM in 4 tabs.
2. For each of the 4 topics: paste the model-specific prompt verbatim into the matching tab.
3. Save the response back to `research/wave-45/responses/<topic>-<model>.md`.
4. Tell Claude when all 16 are done; Claude synthesizes via `research/wave-45/synthesis.md`.

## Topics

- **Topic 1:** Best Use of IBM Technology track winning patterns
- **Topic 2:** IBM Granite new models since 2026-02
- **Topic 3:** Competitor activity since 2026-05-23
- **Topic 4:** Research-as-validation for wave-45 ships

## Files

```
v2-differentiated/
  topic-1-best-use-tech-perplexity.md
  topic-1-best-use-tech-gemini.md
  topic-1-best-use-tech-chatgpt.md
  topic-1-best-use-tech-notebooklm.md
  topic-2-ibm-granite-perplexity.md
  topic-2-ibm-granite-gemini.md
  topic-2-ibm-granite-chatgpt.md
  topic-2-ibm-granite-notebooklm.md
  topic-3-competitor-perplexity.md
  topic-3-competitor-gemini.md
  topic-3-competitor-chatgpt.md
  topic-3-competitor-notebooklm.md
  topic-4-validation-perplexity.md
  topic-4-validation-gemini.md
  topic-4-validation-chatgpt.md
  topic-4-validation-notebooklm.md
```
