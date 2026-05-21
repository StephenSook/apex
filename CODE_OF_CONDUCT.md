# APEX Code of Conduct

APEX adopts the [Contributor Covenant version 2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) with two project-specific additions documented below.

---

## Standard Contributor Covenant 2.1

The full text of the Contributor Covenant 2.1 applies to APEX. Read it at the link above.

The short version: we treat each other with respect. Examples of behavior that contribute to a positive environment include demonstrating empathy and kindness, being respectful of differing opinions, viewpoints, and experiences, giving and gracefully accepting constructive feedback, and accepting responsibility and apologizing to those affected by our mistakes.

Examples of unacceptable behavior include the use of sexualized language or imagery, trolling, insulting comments, personal or political attacks, public or private harassment, publishing others' private information without explicit permission, and other conduct which could reasonably be considered inappropriate in a professional setting.

---

## Project-specific addition 1: Anonymization-pre-consent

APEX ships to adaptive racers, veteran motorsport rehabilitation programmes, and grassroots competitors. Many community members prefer to be unassociated with the tooling they use, especially in asymmetric-conflict domains where adversaries can use defender-side attribution to engineer workarounds.

The project rule:

- Default to anonymous + aggregate when referring to community members, mod teams, operators, or supplier organizations.
- Per-surface consent applies separately to README, deck, video, BeMyApp submission, social cards, and any other public surface.
- Personal contact information (email, phone, social handle) of project members is kept in private memory only. Public-repo files use `[personal email kept private]` or `[school address kept private]`.
- Filename privacy counts. A filename embedding an operator identity is itself a leak.

Contributors who violate the anonymization-pre-consent rule will be asked to redact + sweep. Repeat violations are grounds for removal from the project per the standard Covenant enforcement.

Full detail at `feedback_anonymization_pre_consent.md` + `feedback_privacy_sweep_three_surfaces.md` in the project's private memory.

## Project-specific addition 2: Respect for the adaptive-racer audience

The project's hero use case is a fictional adaptive racer (Sarah Reynolds; see `docs/sarah-reynolds-persona.md`). The persona is fictional by design; the audience is real.

Contributors must:

- Use achievement-led language, not trauma-led language. Open with what the driver did at lap 17, not with the injury that brought them into the sport.
- Avoid "inspiring," "brave," or charity-coded framing. Adaptive racers do not need a sympathy product; they need a coaching layer that existing tools systematically misdiagnose.
- Use the lexicon the community uses. "Adaptive racer," "hand-control system," "FIA Certificate of Adaptations," "Appendix L." Not "disabled driver," "wheelchair-bound," "special needs."
- Cite the FIA regulatory document by section ID. The COA is a binding document; vagueness is a credibility hit.

Contributors who violate the audience-respect rule will be coached on the lexicon. Repeat violations are grounds for removal per the standard Covenant enforcement.

---

## Enforcement

Community leaders are responsible for clarifying and enforcing this Code of Conduct and will take appropriate and fair corrective action in response to any behavior that they deem inappropriate, threatening, offensive, or harmful.

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the project maintainers via the contact methods listed in `README.md`. Reports will be reviewed and investigated promptly and fairly.

Project maintainers reserve the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned with this Code of Conduct, or to ban temporarily or permanently any contributor for other behaviors that they deem inappropriate, threatening, offensive, or harmful.

---

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant](https://www.contributor-covenant.org), version 2.1, available at <https://www.contributor-covenant.org/version/2/1/code_of_conduct.html>.

The two project-specific additions are original to APEX, sourced from `~/.claude/CLAUDE.md` (mod-tool attribution principle) and the APEX `docs/decision-log.md`.

---

_Last updated: 2026-05-21 evening by Stephen (initial adoption alongside CONTRIBUTING.md, wave-19 polish)._
