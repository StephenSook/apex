# APEX consent log

Per-surface attribution consents received for APEX (IBM SkillsBuild AI Builders Challenge, May 2026 submission). Each entry records the consent grant: sender, date, scope (which public-facing surfaces are approved for naming), and the verbatim grant text.

Default posture per global CLAUDE.md mod-tool-attribution principle: anonymous + aggregate until explicit per-surface consent confirmed. Each row below is a load-bearing exception to that default.

This file is the source of truth for "may we name X on surface Y?" questions during pre-submit cold review (PLAN row 8.4). Cold reviewers should grep this file before flagging operator attribution.

---

## 1. MME Motorsport d.o.o. (Marko Mlakar) - 2026-05-22

**Sender:** Marko Mlakar `info@mme-motorsport.com`
**CC:** Sebastjan Filipic `sebastjan@mme-motorsport.com`
**Subject:** RE: Per-surface attribution request, APEX project, IBM SkillsBuild May 2026
**Date received:** 2026-05-22 03:17 AM ET (early-morning Friday)
**Reply to:** Stephen Sookra `ssookra@students.kennesaw.edu`
**Consent scope:** all 4 surfaces requested in Stephen's outreach + downstream derivatives

**Verbatim consent grant:**

> Hello Stephen.
>
> Thank you for your email.
>
> Feel free to use the MME Motorsport Hand Controls in your projects.
>
> Wish you all the best with the project!
>
> Marko

**Signature block:**

> Marko Mlakar
> MME Motorsport d.o.o.
> Semi-Automatic Gearbox Shifting Components & Motorsport Electronics
> Todraz 20 | 4224 Gorenja vas | Slovenia
> http://www.mme-motorsport.com

**Approved surfaces (per Stephen's outreach enumeration):**

1. The public landing page at `apex.race` (or fallback `apex.vercel.app`) - one Sarah-persona block citing "MME Motorsport electronic hand-controls"
2. The repo README at `https://github.com/StephenSook/apex` - one identical citation
3. The IBM SkillsBuild BeMyApp submission Story block - one identical citation
4. The 3-minute submission demo video - voice-over reference and visual on-screen text

**Approved attribution form:** "MME Motorsport" or "MME Motorsport d.o.o." (corporate citation). Product name "MME Motorsport Hand Controls" explicitly approved by Marko's grant wording.

**Not approved:** Naming Marko Mlakar or Sebastjan Filipic personally on any public surface; only corporate-entity naming. Per general professional-courtesy posture, the individuals who granted consent do not get named in the public-facing materials unless they separately approve.

**Citation language standard for APEX public surfaces:**

"Sarah Reynolds (synthetic adaptive-driver persona) runs MME Motorsport electronic hand-controls. The simultaneity-permitting hardware specification recorded in her synthetic Certificate of Adaptations is consistent with the dual-stage trigger pattern that MME Motorsport ships as a real adaptive-equipment product. MME Motorsport (Todraz, Slovenia) granted per-surface attribution permission on 2026-05-22."

**Geography reconciliation:** Sarah Reynolds persona is a fictional UK Britcar Trophy driver. MME Motorsport is Slovenian. Sarah importing MME equipment for UK racing is plausible (MME ships globally; many UK adaptive drivers use MME). Persona materials should drop the "UK adaptive-hand-control supplier" anonymized placeholder language and name MME directly. Sarah stays UK-Britcar; supplier stays MME-Slovenia.

**Outreach origin (the email Stephen sent that received this consent):**

Sent: 2026-05-20 (Day 1 of build).
Original draft: `docs/outreach-drafts/adaptive-supplier-consent-day-1.md`.
Key request: "I would like to ask for explicit per-surface attribution permission before any of these materials are published or submitted... If any of these surfaces would prefer anonymization ('leading UK adaptive-hand-control supplier') or different framing, I will adjust before the 2026-05-31 submission and will not name MME on that surface. If we do not hear back by 2026-05-29 (10 days before submission), I will anonymize the persona materials across every surface by default."

**Effect on project posture:**

- Sarah Reynolds persona materials get MME named (anonymized placeholder removed)
- Pre-mortem row 17 (operator-attribution violation risk) closed on MME surface
- PLAN Q-006 (per-surface consent for adaptive-equipment supplier) ✅ resolved
- Stakeholder outreach log updated with consent receipt
- Project memory `project_apex_consent_mme_motorsport.md` added so the consent travels across sessions

**Reciprocity / acknowledgement:**

Marko + MME Motorsport granted consent at no cost. Per professional courtesy: an acknowledgement in the project's deck / video credits / README acks section is appropriate. Stephen-lane decision on the exact wording.

---

## Template for future consent entries

Use this template when new consents arrive:

```
## N. <Org name> (<contact name>) - <ISO date>

**Sender:** <contact name> <email>
**CC:** <any cc>
**Subject:** <subject line>
**Date received:** <ISO datetime + ET>
**Reply to:** Stephen Sookra
**Consent scope:** <surfaces enumerated>

**Verbatim consent grant:** <quoted block>

**Signature block:** <quoted block>

**Approved surfaces:** <list>
**Approved attribution form:** <citation form>
**Not approved:** <out-of-scope items>
**Citation language standard:** <paragraph>
**Effect on project posture:** <bullets>
**Reciprocity / acknowledgement:** <bullets>
```

---

_Last updated: 2026-05-22 by Stephen (MME Motorsport consent landing per email received 2026-05-22 03:17 AM ET)._
