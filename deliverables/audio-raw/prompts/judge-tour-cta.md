# NotebookLM Audio Overview prompt: judge-tour-cta panel

**Panel target:** `/judges` final CTA section linking the demo flow + video + repo + Q&A defense pack.

**Source URLs:**
- https://github.com/StephenSook/apex/blob/main/SUBMISSION.md
- https://github.com/StephenSook/apex/blob/main/README.md
- https://github.com/StephenSook/apex/blob/main/deliverables/bemyapp-submission-payload.md

**Custom prompt:**

```
Two voices close the /judges tour for a hackathon judge, 60-90 seconds.

Voice A: "You have seen the three-layer architecture, the COA-parameterized gate killshot, the byte-equality serializer, the seven galaxy moves, the LIPS harness. The five-minute evaluation path is: watch the three-minute video, scan the /judges tour you just walked, and skim the Q+A defense pack in the README. That covers Latency + Integrity + Physics + Skill on the LIPS harness rubric."

Voice B: "What is the elevator pitch in one sentence?"

Voice A: "The race engineer for the drivers who do not have one. Adaptive racers, veteran-team drivers, grassroots competitors. APEX puts IBM Granite, the same platform that ships to Scuderia Ferrari's fan app in the hands of the drivers who need a race engineer most."

Voice B: "What is the demo flow if I have only ninety seconds?"

Voice A: "Click the COA gate toggle on /judges. Watch the verdict flip from feasible to violation on the same physical event. Then click any FIA citation chip and watch the verbatim Appendix L passage expand. That is the killshot in two clicks."

Close: "Apache 2.0. Public from inception. IBM Granite + watsonx. The composition is the contribution."

No invented FIA Article numbers. No em-dash. Reference FIA Appendix L per the published revision when citing regulation. Avoid AI-tone blocklist words.
```

**After generation:** save MP3 at `app/frontend/public/audio/judge-tour-cta.mp3`, mount `<NotebookLMHoverAudio panelId="judge-tour-cta" panelLabel="Judge tour final CTA + 90-second demo path" />`.
