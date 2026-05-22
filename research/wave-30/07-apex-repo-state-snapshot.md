# Source 7 — APEX Repository State (github.com/StephenSook/apex)

## Purpose Of This Source

This document is the seventh and final source for the APEX Maximal Architecture Lock NotebookLM synthesis pass. It captures the current committed state of the APEX codebase so the synthesis pass treats the repo's existing choices as the baseline that the maximal architecture must either preserve or explicitly supersede. It is also one of the three documents holding a contradictory frequency strategy that the synthesis must reconcile.

This source is a snapshot of a live read of the public repository, not a saved research artifact. It should be loaded last in the NotebookLM bundle.

---

## 1. Repository Overview

- Repository: github.com/StephenSook/apex
- Commit volume at time of read: 222 commits, all dated within Day 1 and Day 2 of the build window.
- Language breakdown: approximately 86 percent TypeScript, 8 percent Shell, 4.5 percent Jupyter Notebook, remainder CSS and JavaScript.
- There is no Python in the language breakdown yet. The entire backend is unwritten. Everything that exists is the frontend, the scaffolding, and the planning and docs layer.

## 2. What Is Already Built

- A Next.js 16 frontend using React 19 and TypeScript, intended for Vercel deployment.
- The frontend upload surface and supporting UI work.
- A mature planning and documentation spine for a Day 2 project: PLAN.md, CLAUDE.md, STATUS_DAY1 and STATUS_DAY2 files, SUBMISSION.md, an architecture-spec under docs, a pre-mortem document with 48 or more entries, plus bob-sessions, research, paper, and deliverables folders.
- A fixtures folder containing the synthetic demo persona: a telemetry CSV for a single lap, a Certificate of Adaptations PDF and its parsed JSON, and a written debrief text file. This is synthetic adaptive-driver demo data the team controls.

## 3. What Is Not Built

- The Python backend. The physics-tsfm folder exists but contains no Python. The backend app folder is a stub. The requirements file is marked as Day 2 onwards.
- No forecasting code, no physics-projection layer, no Granite Guardian integration, no orchestration layer.

## 4. The Committed Architecture (As Stated In The Repo README And Docs)

The repo has already committed, in writing, to specific architectural choices. These are the baseline the maximal architecture must either keep or explicitly replace.

### 4.1 Forecasting

- A frozen IBM Granite TimeSeries TTM forecaster, used zero-shot, not retrained.

### 4.2 Frequency Strategy

- The README commits to aggregating raw 50 Hz telemetry into 1 Hz mini-sector tensors to fit the model's published support envelope.
- This is one of three contradictory frequency strategies across the source corpus. The other two are ChatGPT's polyphase decomposition and the AI-architecture pass's sampling-rate-invariant Granite FlowState. The synthesis pass must reconcile all three.

### 4.3 The Validator

- A two-stage validator sits between the forecaster and the report.
- Stage 1 is a differentiable CvxpyLayer convex QP that enforces the convex constraints: friction ellipse, forward-Euler kinematic consistency, and jerk bounds.
- Stage 2 is a post-projection feasibility filter that audits the non-convex constraints: bicycle-model coupling, and a COA-parameterized brake-throttle simultaneity gate that reads the driver's FIA Certificate of Adaptations.
- This two-stage convex-QP-plus-filter design is in tension with the ChatGPT and Gemini finding that the full nonlinear physics is non-convex and requires unrolled sequential-convex programming. The synthesis pass must reconcile this.

### 4.4 Safety Audit

- IBM Granite Guardian audits a textual violation log and issues a safety verdict.

### 4.5 The Granite Tool Stack

- Eight IBM tools are committed: Granite-Docling 258M, Granite Vision 4.1, Granite TimeSeries TTM r2.1, Granite 4.1 8B Instruct, Granite Guardian 4.1 8B, Langflow for visible orchestration, the Docling library, and IBM Bob as a build accelerator.
- The AI-architecture frontier pass recommends expanding this to twelve tools by adding Granite Embedding R2, Granite TSPulse, Granite FlowState, and Granite 4.0 Nano WebGPU. The synthesis pass should treat the eight-tool stack as the baseline and the twelve-tool stack as the maximal target.

## 5. Deployment Posture

- Frontend: Next.js 16, React 19, TypeScript, deployed to Vercel.
- Backend: planned as Python 3.12, FastAPI, Pydantic v2, cvxpylayers, granite-tsfm, torch, deployed to a Hugging Face Space.

## 6. Data And Demo Posture

- Listed data source: FastF1 telemetry slices, public.
- The canned demo fixture is a synthetic adaptive-driver persona, single lap. Because this fixture is synthetic and team-controlled, it can be authored with full sensor coverage including brake pressure, steering angle, and G-force channels.
- This matters because Perplexity's prior-art sweep found that real FastF1 telemetry has a boolean-only brake channel and no steering-angle or G-force channels. The synthetic fixture sidesteps that gap for the canned demo; a live judge dropping in real FastF1 data would still hit it. This is a framing decision for the synthesis pass and the demo plan.

## 7. Schedule And Process Notes

- The build status indicates the backend developer's TTM smoke test is gated on an organization invite, expected around May 27. Because that gate blocks the backend track, it is a real schedule dependency the build sequencing must account for.
- The repo's planning docs include a no-em-dash style rule, stated as a deliberate anti-AI-tone measure, applying to prose, commits, the deck, the video, and emails.
- Commercial-tool comparisons in the README are still placeholders, and the hand-control supplier is redacted in line with the team's operator-attribution practice.

## 8. The Two Contradictions This Source Carries Into Synthesis

1. Frequency strategy. The repo commits to 1 Hz mini-sector aggregation. ChatGPT's source proposes polyphase decomposition. The AI-architecture pass proposes Granite FlowState's sampling-rate invariance. Three strategies, one architecture required.
2. Convexity. The repo commits to a two-stage convex-QP-plus-feasibility-filter validator. ChatGPT and Gemini both conclude the full nonlinear physics is non-convex and needs unrolled sequential-convex programming. The synthesis pass must determine whether the convex QP becomes the inner iterate of an outer SCP loop, or whether the design changes more fundamentally.

These are not flaws in the repo. They are the exact decisions the synthesis pass exists to lock.
