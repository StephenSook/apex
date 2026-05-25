# Topic 2 (IBM Granite new models) - NotebookLM prompt

**Model:** NotebookLM
**Angle:** Score the 12-tool inventory against IBM's own Granite roadmap.

---

## Sources to upload first

1. IBM Granite official documentation index (https://www.ibm.com/granite if reachable, OR pdf saves of the latest Granite blog posts)
2. IBM watsonx documentation (https://www.ibm.com/watsonx)
3. Granite Time Series whitepaper (https://research.ibm.com/blog/time-series-foundation-model OR the TTM r2 model card)
4. Granite Guardian paper (arxiv.org/abs/2412.07724 or successor)
5. APEX ibm-stack.ts canonical inventory at https://github.com/StephenSook/apex/blob/main/app/frontend/lib/ibm-stack.ts
6. APEX paper §3.5 + §3.6 stack provenance at https://github.com/StephenSook/apex/blob/main/paper/apex-neurips-workshop-2026.md
7. APEX decision-log D-016 (12-tool stack expansion) + D-019 (galaxy moves) + D-026 (maximal architecture) + D-054 (Vinh V12-V15 stubs) at https://github.com/StephenSook/apex/blob/main/docs/decision-log.md

## Prompt (paste verbatim once sources uploaded)

You have IBM's official Granite documentation and APEX's current 12-tool stack inventory in your sources.

Cross-reference: for each Granite product family IBM is currently emphasizing in their public roadmap, score whether APEX is leveraging that family at the depth IBM would consider load-bearing (vs shallow / vs missing).

Output a table:
| Granite family | IBM's roadmap emphasis | APEX usage tier (WIRED / INTEGRATION / FACADE / ACCELERATOR / MISSING) | Gap rating (0 = matches IBM's emphasis; 1-5 = how far behind) | Easiest closure |

Then: identify the single Granite component that APEX's submission is most over-claiming on (frontend says "WIRED" but code shows shallower integration). Cite the source passage.

Then: identify the single Granite component that APEX's submission is most under-claiming on (code shows deeper integration than the marketing copy claims). Cite the source passage.

Cite all claims to source passages. No hallucination.
