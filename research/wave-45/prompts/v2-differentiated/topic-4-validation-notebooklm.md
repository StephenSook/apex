# Topic 4 (Research-as-validation for wave-45 ships) - NotebookLM prompt

**Model:** NotebookLM
**Angle:** Score wave-45 ships directly against BeMyApp rubric.

---

## Sources to upload first

1. BeMyApp judging rubric (from the project portal Rules / Judging tab)
2. APEX README at https://github.com/StephenSook/apex/blob/main/README.md
3. APEX paper draft at https://github.com/StephenSook/apex/blob/main/paper/apex-neurips-workshop-2026.md
4. APEX 3-min pitch script at https://github.com/StephenSook/apex/blob/main/docs/3-min-pitch-script.md
5. APEX Q&A flashcards at https://github.com/StephenSook/apex/blob/main/docs/q-and-a-flashcards.md
6. APEX decision-log at https://github.com/StephenSook/apex/blob/main/docs/decision-log.md (focus on D-049 + D-053 + D-054 + D-055 for wave-44/45 ships)
7. APEX live /judges page rendered HTML (https://apex-one-black.vercel.app/judges; print to PDF or paste the page text)
8. APEX live /judge-tour rendered HTML
9. APEX live /lips-harness rendered HTML
10. APEX live /changelog rendered HTML
11. APEX live /compare rendered HTML
12. APEX live /methodology rendered HTML

## Prompt (paste verbatim once sources uploaded)

You have the BeMyApp judging rubric and APEX's full submission package (README + paper + pitch script + Q&A + decision-log + all 6 wave-45 page renders).

For each of the 16 wave-45 ships listed below, score 1-10 on each of the 4 BeMyApp prize categories (1st Place / Runner-up / Best Use of Technology / Most Innovative). Cite the source passage that justifies each score.

Wave-45 ships:
a) Interactive COA gate toggle
b) Real-time apex-cam pipeline visualization
c) /changelog auto-rendered from git log
d) Granite TTM in-browser via Transformers.js
e) Per-track sponsor tightening copy
f) /judge-tour 6-step walkthrough
g) Multi-driver /compare baseline-vs-improved
h) /methodology Sookra Five Pillars landing
i) Engine-agnostic byte-equality demo (D-050)
j) NeurIPS Workshop paper draft
k) /lips-harness LIPS 4-axis ablation
l) LangGraph runtime orchestration trace
m) OG cards on every route
n) Mobile install QR + PWA
o) Sim-rig HTTP stream + 20Hz NDJSON
p) Voice debrief input

Then: for each prize category, identify the TOP 3 wave-45 ships that maximize that category's score. Cite the source passage for each.

Then: identify any wave-45 ship that is NEUTRAL or HURTS the submission (feature-bloat, over-claim, distraction). Cite the source passage.

Cite everything. No hallucination.
