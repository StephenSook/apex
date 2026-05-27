# NotebookLM Audio Overview prompt: galaxy-moves panel

**Panel target:** `/judges` Galaxy Moves cluster (seven moves stack: 8-tier physics, SCP outer loop, COA-parameterized gate, byte-equality serializer, tri-agent critic, TSPulse polyphase anomaly, Granite TimeSeries TTM in-browser scaffold).

**Source URLs:**
- https://github.com/StephenSook/apex/blob/main/paper/apex-neurips-workshop-2026.md
- https://github.com/StephenSook/apex/blob/main/docs/decision-log.md
- https://github.com/StephenSook/apex/blob/main/README.md

**Custom prompt:**

```
Two voices walk a hackathon judge through the seven moves that compose into the APEX three-layer architecture, 90-120 seconds, conversational.

Move 1: 8-tier physics linearization stack (Pacejka tire + thermal + bicycle + jerk + friction-ellipse + Pacejka linearization + forward-Euler kinematic + SCP outer loop wrapper). Voice A: "We did not stop at the friction ellipse. The projector layer linearizes through eight tiers per D-015."

Move 2: SCP outer loop (3-iteration sequential convex programming wrapper). Voice A: "Stage B wraps Stage A in three Taylor-step iterates. Convergence at residual 0.0011 per D-031 staged ladder."

Move 3: COA-parameterized simultaneity gate. Voice B: "What is the killshot here?" Voice A: "The same physical event, brake 0.42 MPa residual + throttle 12 percent rising. coa_overlap_flag = 1 returns feasible. = 0 returns violation. The projector reads the flag from the driver's Certificate of Adaptations PDF and routes the constraint. Nobody else in the field is doing this."

Move 4: byte-equality serializer (D-050). Voice A: "The V1 NumPy validator and V2 cvxpylayers ceiling emit byte-identical violation strings modulo the engine header line. The serializer is the regression contract."

Move 5: Agent-as-Judge tri-agent critic loop (D-019 item 5). Voice A: "Three specialist Granite-Critic instances in parallel: Physics + Pedagogy + Guardian-Safety. Mellea Instruct-Validate-Repair fires with loop_budget = 3 if any critic flags."

Move 6: IBM TSPulse 1M polyphase time-frequency anomaly (wave-44 D-049 addition). Voice A: "Pre-projector window-level anomaly detection."

Move 7: Granite TimeSeries TTM r2.1 in-browser scaffold (wave-45 D-053 addition). Voice A: "Transformers.js + WebGPU on the client edge."

Close: "These seven moves are independently cuttable per the APEX Lite contingency. The three-layer pipeline above stands without any of them. The composition is the contribution."

No invented FIA Article numbers. No em-dash. Reference FIA Appendix L per the published revision when citing regulation.
```

**After generation:** save MP3 at `app/frontend/public/audio/galaxy-moves.mp3`, mount `<NotebookLMHoverAudio panelId="galaxy-moves" panelLabel="Seven galaxy moves" />`.
