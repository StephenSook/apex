# NotebookLM Audio Overview prompt: architecture-figure panel

**Panel target:** `/judges` Architecture section (the three-layer PhysicsTTM figure).

**Source URLs to upload as NotebookLM sources:**
- https://github.com/StephenSook/apex/blob/main/README.md
- https://github.com/StephenSook/apex/blob/main/paper/apex-neurips-workshop-2026.md
- https://github.com/StephenSook/apex/blob/main/docs/architecture-spec.md

**Custom prompt to paste into NotebookLM Audio Overview "Customize" field:**

```
Two voices explain the APEX three-layer architecture to a hackathon judge in 90-120 seconds. Voice A is the race-engineer narrator (calm, conversational, no marketing). Voice B is the technical questioner (asks one clarifying question per layer, no filler).

Layer 1: frozen Granite TimeSeries TTM r2.1 (NeurIPS 2024). Voice A names the model, says it is pretrained + zero-shot + sub-1M parameters + channel-mix decoder per D-010 Track 1, and explains we aggregate raw 50 Hz telemetry to 1 Hz mini-sector tensors so the input sits inside the model's published support envelope. Voice B asks why we do not fine-tune. Voice A: because the published benchmarks beat several larger TSFMs zero-shot, and freezing the forecaster keeps the differentiable physics projection downstream provably stable.

Layer 2: differentiable CvxpyLayers physics projection. Voice A names the friction ellipse + bicycle model + forward-Euler kinematic step + jerk bound + circuit-conditional friction lookup. Voice B asks about the COA simultaneity flag. Voice A explains the gate reads coa_overlap_flag = 1 for adaptive drivers (the FIA Certificate of Adaptations approves brake-throttle simultaneity per Appendix L) versus = 0 for able-bodied drivers (mutual exclusion enforced); the differentiable layer routes the constraint per-driver.

Layer 3: Granite Guardian 4.1 8B BYOC safety classifier. Voice A explains every projection log + coaching narration passes through a custom-rule registry (D-024 physics-confidence detector) that emits a Verdict and triggers refusal honesty when a rule fires. Voice B asks how that protects judges from invented FIA Article numbers. Voice A: server-side regex scrubber pre-pass + Guardian audit + retry-directive loop on coach-code per OVERRIDE-steal #1.

End with: "The three layers compose. The composition is the contribution." (verbatim closing.)

Do NOT mention specific FIA Article numbers. Use FIA Appendix L per the published revision throughout. No em-dash in prose. No AI-tone words ('leverage' / 'seamless' / 'robust' / 'comprehensive' / 'delve into').
```

**After generation:** download MP3, save at `app/frontend/public/audio/architecture-figure.mp3`, mount `<NotebookLMHoverAudio panelId="architecture-figure" panelLabel="Three-layer PhysicsTTM architecture" />` on the matching /judges section.
