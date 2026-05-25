# Topic 2 (IBM Granite new models) - Gemini 2.5 Pro prompt

**Model:** Gemini 2.5 Pro (1M+ context)
**Angle:** Compare Granite vs Llama / Mistral / Claude / Gemini for our specific use case.

---

APEX is an AI race engineer for adaptive racing drivers, built almost entirely on IBM Granite. Submission to IBM SkillsBuild AI Builders Challenge May 2026 (deadline 2026-05-31). Repo: https://github.com/StephenSook/apex.

The architecture pattern is "frozen pretrained foundation model + differentiable projection + text audit":
- Granite TimeSeries TTM r2.1 (frozen backbone + channel-mix decoder fine-tune) generates lap-time / speed / acceleration forecasts
- A differentiable convex QP projects the forecast onto a feasible-physics envelope (friction ellipse + forward-Euler kinematic step + COA-parameterized brake-throttle simultaneity gate)
- Granite Guardian 4.1 8B audits the violation log in text form (engine-agnostic byte-equality across V1 NumPy + V2 cvxpylayers projectors per D-050)

Your task: aggregate across the public technical reports + model cards + papers + blog posts for EACH of these foundation-model families and tell me where Granite is honestly strongest vs each one for THIS pattern:

- IBM Granite TimeSeries (TTM r2.1, FlowState 9.1M, TSPulse 1M)
- Amazon Chronos / Chronos-2
- Google TimesFM
- Salesforce Moirai / Lag-Llama
- AutoTimes / Time-LLM / GPT4TS adaptations
- Granite 4.1 8B Instruct
- Llama 3.3 70B Instruct
- Mistral Large 2
- Claude Sonnet 4.5
- Gemini 2.5 Pro / Flash
- Granite Guardian 4.1 8B
- Llama Guard 3
- Constitutional AI / Anthropic's CAI techniques
- OpenAI's safety stack

For each comparison: who wins the "frozen-backbone + projection + audit" pattern on:
1. Sample efficiency (small fine-tune set lifts the metric)
2. Bring-your-own-code (BYOC) custom-rule extensibility
3. License (commercial freedom)
4. In-region availability (EU / US / hybrid cloud)
5. Edge / WebGPU compatibility (in-browser inference)
6. Long-tail safety (adaptive-driving niche; FIA Certificates of Adaptations as a parsed regulatory input)

Then: identify the 3 strongest "honest defensible advantages" APEX can claim for choosing Granite for this exact use case. AND identify the 3 areas where APEX's Granite-only stack is BEHIND best-in-class (Claude / Llama / Gemini / Chronos / TimesFM) and why we accepted that trade-off.

Use your 1M context. Aggregate broadly across technical reports + blog posts + paper publications.
