# ApexIQ competitor deep-dive — Stephen verbatim (2026-05-25)

## Stephen verbatim message

> here is ther github https://github.com/NikhilRaikwar/ApexIQ youtube tanscript
> [full transcript follows...]
> Make sure you're using your project memory for this project, because this is another project that got submitted to the project gallery from another team. You have your project memory for this to thoroughly look through everything, take a deep dive on this thing to see if we can steal anything or defer things. Really look through it, please. Quality over speed.

## Submission surfaces

- **BeMyApp project page**: https://ibmskillsbuildchallenge-hub.bemyapp.com/#/projects/6a143176ae093c5d430db37a
- **GitHub**: https://github.com/NikhilRaikwar/ApexIQ
- **YouTube demo**: 3 minutes, posted 2026-05-25 #ApexIQ #IBMGranite #GenerativeAI

## Project name

**ApexIQ - Explainable AI Race Engineer Copilot**

Direct positioning collision with APEX. Same May Challenge cohort.

## Single creator

NikhilRaikwar (single-person team).

## Tagline + banner

- "AI Beyond the Finish Line" (matches challenge theme)
- "Faster Decisions. Smarter Racing. Clearer Insights."
- "Race Smarter. Win Consistently."
- "Built by Nikhil Raikwar"

## Tech stack (banner-declared)

- IBM logo
- Granite granite4.1:3b (3B model variant; APEX uses 4.1 8B)
- FastAPI (Python)
- Next.js
- Python

## Six advertised features (banner)

1. Real TORCS Telemetry via SCR UDP
2. IBM Granite 4.1 AI Explanations (Engineer + Fan dual-mode)
3. Segment Diagnostics (Risk, Lost-time, Events)
4. Compare Runs (Baseline vs Improved + Deltas + Verdict)
5. Export Summary (.json + .md for Judges)
6. Split-screen proof (TORCS + ApexIQ side-by-side)
7. Local-First (No Paid APIs)
8. Reproducible + Exportable
9. Race Smarter + Win Consistently positioning

## "The Issue" panel (BeMyApp)

- "Car racing generates massive amounts of telemetry data per lap, including vehicle speed, wheel slip, angle, and track positioning."
- "However, analyzing this high-velocity data quickly during a live race is extremely difficult. Race teams and fans are flooded with noisy data that lacks context, and traditional dashboards only display raw numbers without providing intelligent reasoning."
- Four challenges enumerated: Information overload + Difficulty generating actionable real-time insights + Complete lack of context for fans + Limited explainability behind driver performance drops or risk factors
- "As motorsport becomes increasingly data-driven, there is a growing need for intelligent systems that can transform complex telemetry into fast, explainable, and actionable insights for both engineers and spectators."

## "Our Magic Solution" panel (BeMyApp)

> ApexIQ is an AI-powered Explainable Race Engineer Copilot designed to bridge the gap between raw racing data and human understanding.
>
> The platform combines:
> 1. Live TORCS telemetry ingestion via SCR UDP
> 2. Segment risk and lost-time analytics
> 3. Dual-mode AI explainability
> 4. Baseline vs. Improved performance comparison
>
> Using IBM Granite 4.1, the system analyzes race telemetry in real time and generates explainable strategy recommendations instead of simply displaying raw numbers.
>
> Key capabilities include:
> 1. Real-time telemetry analytics dashboard
> 2. Engineer Mode for highly technical, mechanical adjustments
> 3. Fan Mode for engaging, easy-to-understand spectator narratives
> 4. Built-in Performance Comparator to validate driver progress with measurable deltas
> 5. Seamless judge-ready JSON & Markdown report export
>
> The goal is to create an intelligent co-pilot that improves operational awareness for teams, enhances the viewing experience for fans, and demonstrates the power of explainable AI beyond the finish line.

## Demo video transcript (full, 3:13)

[Full transcript inlined here from Stephen's paste]

The demo flow walks:
- Select race → practice → new race
- Live telemetry statistics fire as soon as race launches
- Click "generate AI insights" → segment risk scores + loss time estimates + event detection passed to IBM Granite 4.1
- Engineer mode output = highly technical precise feedback on telemetry anomalies
- Fan mode output = engaging easy-to-understand explanation (SAME data, two audiences = explanability layer)
- Scroll to performance tabs to evaluate driver
- Save initial race data under "baseline" tab
- Adjust driver aggression + log next run + save under "improved" tab
- Hit "compare" reveals delta metrics:
  - +0.55 increase in average speed
  - +4.27 jump in risk score
  - +0.22 on wheel slip
  - Verdict: "faster but riskier; tune for stability before final submission"
- Segment diagnostics break lap into entry / mid / exit zones; visually highlight where time is being lost
- Footer line: bridge running + actively connected + ingested data point counter rapidly climbing (proves real live UDP streaming, not replayed CSV)
- "Export summary" generates judge-ready report
- Open exported JSON file in anti-gravity editor; raw data beautifully structured
- Redirect to website + review final dashboard state
- Jump to game screen to watch gaming car execute improved line flawlessly
- Wrap on "any motorsport telemetry stream speaking UDP can plug right in"

## Stephen request

"Take a deep dive on this thing to see if we can steal anything or defer things. Really look through it, please. Quality over speed."

## Protocol

Per `feedback_competitor_deep_dive_protocol.md`: 8-step deep-dive (verbatim save DONE + parallel sub-agent dispatch on GitHub + demo transcript + 7-axis comparison + steal-list + skip-list + brutal letter-grade + APEX-positioning impact + memory write).
