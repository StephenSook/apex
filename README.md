# APEX

**AI race engineer for adaptive racers.**

APEX takes a driver's telemetry, their FIA Certificate of Adaptations, and a written debrief, and produces a corner-by-corner coaching report plus a tuning recommendation in seconds. Built on the IBM Granite stack for the IBM SkillsBuild AI Builders Challenge (May 2026, theme: "AI Beyond the Finish Line"). Submission deadline: 2026-05-31.

## Why this exists

A pro race engineer costs roughly £400-500 a day (Driver61). Every F1 driver has one. Most adaptive racers, veteran-team drivers, and grassroots competitors do not. After the FIA lifted its single-seater ban on disabled drivers in December 2017, the wall stopped being regulatory and became economic: post-race coaching is a luxury good. APEX is the same Granite + watsonx + Bob stack IBM ships to Scuderia Ferrari's roughly 400 million fans, pointed at the drivers who need a race engineer the most.

## The stack

- **Granite-Docling 258M** parses the FIA Certificate of Adaptations PDF into structured JSON.
- **Granite Vision 4.1 4B** parses official timing-sheet PDFs (charts and tables, not phone photos).
- **Granite TimeSeries TTM r2.1** zero-shot forecasts next-session lap pace from multivariate telemetry. Wrapped in a differentiable physics-projection layer (friction ellipse, bicycle model, COA-aware brake-throttle simultaneity flag) to prevent kinetic hallucinations.
- **Granite 4.1 8B Instruct** writes the corner-by-corner coaching report in a race-engineer voice.
- **Granite Guardian 4.1 8B** classifies every recommendation against the COA safe envelope.
- **Langflow** orchestrates the agentic graph visibly.
- **Docling** is the document conversion layer.
- **IBM Bob** is the build accelerator, per the IBM x Scuderia Ferrari case-study precedent.

## Team

- Stephen Sookra (frontend, deck, video, narrative, stakeholder outreach)
- Vinh Le (backend, ML pipeline, Langflow, FastAPI, infra)

## Status

Day 1 of 12. Build kickoff 2026-05-20. Submission 2026-05-31 23:59 ET.

Live demo, Colab notebook, NeurIPS workshop paper draft, and judges' tour landing page all linked here by Day 11.

## License

Apache 2.0. See [LICENSE](./LICENSE).
