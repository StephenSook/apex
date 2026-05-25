# Prompt 4 — Research-as-validation for wave-45 ships

**Paste verbatim into Perplexity + Gemini + ChatGPT + NotebookLM.**

---

Given our wave-45 plan ships the following 8 features today + tomorrow + during Day 10 video record:

(a) **Interactive COA gate toggle** on /judges — tactile flip of `coa_overlap_flag = 1` <-> `coa_overlap_flag = 0` showing projector verdict change
(b) **Real-time ApexCamPanel pipeline visualization** on /judges — 6-stage pipeline cycling at 1.5s per stage
(c) **`/changelog` auto-rendered from git log** — ISR hourly, conventional-commit prefix color pills, default feat-only view
(d) **Real Granite TimeSeries TTM running in-browser via Transformers.js** — opt-in lazy-loaded with WebGPU/WASM SIMD (canned-fallback HEAD; full dep wave-46)
(e) **Per-track sponsor tightening copy** ("Wins X because Y") on /judges
(f) **`/judge-tour?step=N` 6-step walkthrough mode** — paced for 2-minute judge attention span
(g) **Multi-driver `/compare` view** — baseline vs improved deltas + verdict
(h) **Sookra Methodology Five Pillars `/methodology` landing**
(i) **Engine-agnostic byte-equality demo** on /judges (wave-45 Phase 10 — shipping post this prompt)

Which of these has the HIGHEST judge-recognized impact per academic + hackathon-judging research? Rank order them by expected judging-rubric lift (1 = highest impact; 9 = lowest impact).

For each ranked position, cite:
- The judging-research paper / hackathon-postmortem / IBM-rubric-documentation that supports the impact estimate.
- The specific judge-recognition cognitive bias OR attention pattern the feature exploits.
- An honest counterfactual: what could go wrong with the feature in actual judge testing?

Also call out: among the 8 features, which one is most likely to be the SINGLE killshot in a hostile Q&A scenario? Cite reasoning + judging-research source.

**Output format**: Numbered ranked list (1 through 9). Each entry has (rank, feature, impact rationale, source citation, counterfactual). Final paragraph names the single-killshot feature + reasoning. Cite at least 3 academic / industry sources.

**Context**: APEX (github.com/StephenSook/apex) for IBM SkillsBuild AI Builders Challenge May 2026 deadline 2026-05-31. Submission auto-enters 4 prize categories ($5K total prize ladder). 7-competitor field; NeuroPit B+ MEDIUM-HIGH threat is the only real architectural-depth rival. APEX positioning: adaptive-racer pillar + COA gate + engine-agnostic byte-equality lock + 7 shouldn't-be-possible moves + Sookra Methodology Five Pillars + frozen-backbone TSFM + fine-tune-first per D-052 G4 pivot.

---

## Where to save the response

`research/wave-45/responses/prompt-4-{perplexity,gemini,chatgpt,notebooklm}.md`
