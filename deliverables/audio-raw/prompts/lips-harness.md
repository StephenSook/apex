# NotebookLM Audio Overview prompt: lips-harness panel

**Panel target:** `/judges` LIPS harness section linking to `/lips-harness` APEX-Bench v0.1.0.

**Source URLs:**
- https://github.com/StephenSook/apex/blob/main/paper/apex-neurips-workshop-2026.md (section 4 + section 5)
- https://github.com/StephenSook/apex/blob/main/docs/decision-log.md (D-026 + D-019 + D-058)
- https://github.com/StephenSook/apex/blob/main/README.md

**Custom prompt:**

```
Two voices explain the LIPS harness + APEX-Bench public release in 90-120 seconds.

Voice A: "LIPS stands for Latency + Integrity + Physics + Skill. Four axes, each with a per-axis grading rubric. The harness is a Docker-compose evaluation environment that runs APEX against canonical telemetry holdouts and emits a per-axis score plus an aggregate band."

Voice B: "What is the public contribution?"

Voice A: "APEX-Bench v0.1.0. The harness is open source under Apache 2.0. The canonical fixtures are public. Anyone can submit a coach to the leaderboard, and Granite Guardian audits every submission against the HARD-COMPLIANCE rule set before it lands. No leaderboard padding, no invented FIA Article numbers, no PII leak."

Voice B: "Why does this matter for the hackathon?"

Voice A: "Two reasons. One, it is a public benchmark contribution to the open race-engineering community. Two, it forces honesty: APEX's own scores live on the same leaderboard as any future submission, so every claim we make about the three-layer pipeline is reproducible by anyone with a clone of the repo."

Voice B: "Who's on the leaderboard today?"

Voice A: "APEX HEAD v0.0.1-preview. Latency band B-plus, Integrity A, Physics A-minus, Skill B (the persona-decoupled adaptive-driver track is harder than the able-bodied track for any coach that does not parameterize the COA gate)."

Close: "Public benchmark. Granite Guardian audited. Reproducible from the repo."

No invented FIA Article numbers. No em-dash. Reference FIA Appendix L per the published revision when citing regulation.
```

**After generation:** save MP3 at `app/frontend/public/audio/lips-harness.mp3`, mount `<NotebookLMHoverAudio panelId="lips-harness" panelLabel="LIPS harness + APEX-Bench v0.1.0 public release" />`.
