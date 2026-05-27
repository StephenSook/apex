# NotebookLM Audio Overview prompt: byte-equality panel

**Panel target:** `/judges` EngineAgnosticByteEqualityDemo section (D-050 serializer regression guarantee).

**Source URLs:**
- https://github.com/StephenSook/apex/blob/main/paper/apex-neurips-workshop-2026.md (section 3.3)
- https://github.com/StephenSook/apex/blob/main/docs/decision-log.md (D-050)

**Custom prompt:**

```
Two voices explain what byte-equality means + why it matters, 60-90 seconds.

Voice A: "The V1 NumPy validator and the V2 cvxpylayers physics-projection ceiling emit byte-identical violation strings modulo the leading engine header line. Same telemetry, same input, byte-for-byte same to_text output below the header."

Voice B: "Why does that matter? Sounds like an implementation detail."

Voice A: "It is a regression contract, not a marketing claim. The serializer is the boundary between the projection layer and the Guardian audit. If V1 and V2 emit different text for the same physics event, then refactoring V1 to V2 or vice versa would silently change what Guardian sees, which would silently change refusal verdicts. Byte-equality locks that interface. We can swap engines without changing recommendations."

Voice B: "Is this user-facing?"

Voice A: "It is engineering safety, not killshot positioning. The user-relevant invariant is verdict and recommendation invariance under engine swap. Byte-equality is the strongest form of that contract because byte-identical text trivially implies verdict invariance."

Close: "Engine swap without recommendation drift. That is the contract."

No invented FIA Article numbers. No em-dash. Reference FIA Appendix L per the published revision when citing regulation. Avoid AI-tone words ('leverage' / 'seamless' / 'robust').
```

**After generation:** save MP3 at `app/frontend/public/audio/byte-equality.mp3`, mount `<NotebookLMHoverAudio panelId="byte-equality" panelLabel="D-050 byte-equality serializer regression contract" />`.
