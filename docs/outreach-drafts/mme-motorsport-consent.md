# MME Motorsport - Per-Surface Consent Email Draft (Q-006)

> Per global CLAUDE.md operator-unassociation principle: any supplier or operator named in marketing copy without explicit per-surface consent is a risk. APEX positioning currently names MME Motorsport as the hand-control supplier in Sarah Reynolds persona materials. This email requests per-surface consent for the named association. If declined or no reply by Day 10, fall back to anonymized "leading UK adaptive-hand-control supplier" in all surfaces.
>
> **Owner:** Stephen Sookra. **Send date:** Day 2 (2026-05-21) morning. **Reply window:** by EOD Day 10 (2026-05-29). **Fallback decision date:** Day 10 morning if no reply.
>
> **Sender email:** ssookra@students.kennesaw.edu (consistent with Phase 1 + Phase 2 outreach).

---

## To

Primary: `info@mme-motorsport.com` (verify on Day 2 via `mme-motorsport.com/contact` before send)
Cc (optional): None (this is a single-org ask, not a broadcast)

## Subject

Per-surface attribution request, APEX project, IBM SkillsBuild May 2026

## Body

Hi,

I am a sophomore Computer Science student at Kennesaw State University. My teammate Vinh Le and I are building APEX, an AI race engineer for adaptive racers, for the IBM SkillsBuild AI Builders Challenge (submission 2026-05-31).

APEX uses the FIA Certificate of Adaptations under Article 18.3 of Appendix L as a tensor-level input. When a driver's COA permits simultaneous brake-throttle inputs, our physics-projection layer permits the input. That is the architectural detail that distinguishes APEX from existing race-engineer AI tools (Track Titan, Trophi.ai), which assume able-bodied physics and systematically misdiagnose adaptive drivers.

Our hero persona is a fictional driver named Sarah Reynolds (RAF veteran, left-leg amputee, Britcar Trophy in a hand-controlled BMW M240i). The persona materials currently reference MME Motorsport electronic hand-controls as her supplier, because the simultaneity-permitting hand-control technology you ship is exactly what makes the COA-aware physics layer matter.

I would like to ask for explicit per-surface attribution permission before any of these materials are published or submitted:

1. The public landing page at `apex.race` (or fallback `apex.vercel.app`) - one Sarah-persona block citing "MME Motorsport electronic hand-controls"
2. The repo README at `https://github.com/StephenSook/apex` - one identical citation
3. The IBM SkillsBuild BeMyApp submission Story block - one identical citation
4. The 3-minute submission demo video - voice-over reference and visual on-screen text

If any of these surfaces would prefer anonymization ("leading UK adaptive-hand-control supplier") or different framing, I will adjust before the 2026-05-31 submission and will not name MME on that surface.

If we do not hear back by 2026-05-29 (10 days before submission), I will anonymize the persona materials across every surface by default.

The project is public from Day 1 of build at https://github.com/StephenSook/apex with a full PLAN.md and architecture spec, so you can review the broader claims before deciding.

Thank you for the time. The adaptive-racer community Team BRIT, Mission Motorsport, Operation Motorsport, FFSA Handikart deserves better AI tooling than what currently exists. APEX is our 12-day attempt at that bar, with the IBM Granite stack underneath.

With respect,

Stephen Sookra
Computer Science, Kennesaw State University
ssookra@students.kennesaw.edu
GitHub: github.com/StephenSook
LinkedIn: linkedin.com/in/stephen-sookra-633682339

---

## After-send checklist

- [ ] Verify primary contact email via mme-motorsport.com/contact before send.
- [ ] Log send timestamp in `docs/stakeholder-outreach-log.md` (Day 2 morning).
- [ ] Log reply status in `~/.claude/projects/-Users-stephensookra-Desktop-IBM-May/memory/project_apex_stakeholders.md`.
- [ ] If reply consents: keep current persona materials.
- [ ] If reply declines for specific surface: anonymize on that surface only.
- [ ] If no reply by EOD 2026-05-29: anonymize across all four surfaces, document fallback in Q-006 closure.

## Per-surface anonymization fallback wording

Replace "MME Motorsport electronic hand-controls" with one of:
- (Hero / READMEs) "a leading UK adaptive hand-control supplier"
- (Video voiceover) "her electronic hand controls"
- (BeMyApp Story) "the kind of electronic hand-control system that adaptive drivers like Team BRIT competitors actually use"

Replace specific simultaneity-permission citation with:
- "her COA explicitly permits the simultaneous brake-throttle inputs her hand-controls support"

The architectural claim (COA-aware physics) does not depend on the supplier name. The supplier name is narrative texture only.

---

_Last updated: 2026-05-20 PM by Stephen (Day 1 EOD draft, send Day 2 AM)._
