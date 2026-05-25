# Topic 3 (Competitor activity since 2026-05-23) - NotebookLM prompt

**Model:** NotebookLM
**Angle:** Ground-truth ranking using only the competitor-field memory entry + new intel.

---

## Sources to upload first

1. APEX competitor-field memory entry: https://github.com/StephenSook/apex/blob/main/research/competitor-field/ (any file you can find showing the 7-competitor consolidated deep-dive)
2. The most recent competitor-field 7-axis table from the wave-45 plan or wave-43 memory roll-up
3. Each competitor's public landing artifact (BeMyApp / Devpost / GitHub README) for: NeuroPit, PitWall, RaceLens XAI, AI Race Strategist, RaceMind AI, AI Race Engineer Copilot, ApexIQ
4. APEX's own README + paper + Q&A flashcards for direct comparison
5. The Perplexity + Gemini outputs from Topic-3 of this same dispatch (paste them in once you have Stephen's responses from the other two models)

## Prompt (paste verbatim once sources are uploaded)

You have:
- APEX's prior competitor-field memory (pre-2026-05-23 baseline ranking with letter grades)
- Each competitor's current public artifact
- The 2 sibling deep-dives from Perplexity + Gemini on the same competitor field

Score each of the 7 competitors against APEX on a 7-axis comparison (matching the existing rubric):
1. Depth of IBM Granite integration
2. Adaptive-racing differentiator
3. Visible audience
4. Frontend polish
5. Test coverage
6. Production-readiness (deployed + 200s)
7. Submission package quality

For each axis: cite the specific source passage that justifies the score.

Output a letter-grade per competitor (A+ to F) reflecting threat to APEX winning EACH of the 4 BeMyApp prize categories (1st / Runner-up / Best Use of Technology / Most Innovative).

Then: identify any one competitor whose threat level has SHIFTED materially in the last 72 hours (based on any new artifact dated 2026-05-23 to 2026-05-25). Cite the artifact.

Then: recommend the ONE move APEX should make this week to widen the gap against the highest-threat competitor.

Cite everything. No hallucination.
