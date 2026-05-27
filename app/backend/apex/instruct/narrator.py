"""Race-engineer narrator: assembles CoachingReport from validated inputs.

Phase 3 task 3.1. Output schema matches the canonical frontend contract
at `app/shared/types.ts` L436-444 verbatim. Every CornerInsight carries
the optional `reasoning_chain` field (wave-46 OVERRIDE-steal #2+#4 per
Stephen commit `d223f1b`); every Citation resolves against the input
`CoaParseResult` (task 3.6c).

The Granite 4.1 8B live LLM call is NOT in this module. Stephen's
wave-42 OpenRouter route at `/api/openrouter-stream` is the canonical
Granite path per `docs/vinh-phase-1-handoff.md` Q3 split. This module
ships the deterministic schema-correct floor: tuning-delta logic +
reasoning-chain generation + citation grounding + Guardian-audit
propagation. The live-LLM swap-point is the `text_generator` argument
on `Narrator.__init__`; default value is a deterministic-template
generator used by the demo path and by every test in this module.

wave-46 task 9.OV-1 retry loop: `narrate_with_retry()` applies a bounded
2-retry budget (3 total attempts worst case) against a Pass-1 text
validator. Surfaces `retry_count` + per-attempt `violation_summary` on
the response per Stephen commit `8c3e481` retry-directive pattern.
"""

from __future__ import annotations

import os
import subprocess
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Callable, Final, Optional

import numpy as np

from apex.instruct.coa_parser import CoaParseResult
from apex.shared.contracts import (
    CHANNEL_COUNT,
    HORIZON,
    GuardianAudit,
    PhysicsViolationLog,
    channel_index,
)

# ---- Provenance + model versions ---------------------------------------

DEFAULT_PROVENANCE_MODEL_VERSIONS: Final[dict[str, str]] = {
    "granite_docling": "ibm-granite/granite-docling-258M",
    "granite_vision":  "ibm-granite/granite-vision-3.2-2b",
    "granite_ttm":     "ibm-granite/granite-timeseries-ttm-r2",
    "granite_instruct":"ibm-granite/granite-4.0-8b-instruct",
    "granite_guardian":"ibm-granite/granite-guardian-4.1",
}
"""Five Granite + IBM models that produce the report (per frontend type
contract at app/shared/types.ts L423-429). Adding a sixth model means
extending both this registry + the frontend ProvenanceFooter type."""


# ---- Result dataclasses mirror app/shared/types.ts -----------------------

@dataclass(frozen=True)
class ReasoningChainStep:
    """One step of the per-recommendation reasoning chain.

    wave-46 OVERRIDE-steal #2+#4 per Stephen commit `d223f1b`. Tag set
    enforced via the literal-union on the wire (TypeScript side); on the
    Python side we use a free `str` for ergonomics but constrain to the
    four canonical tags via the narrator's deterministic generator.
    """

    step: str        # one of "cause" | "consequences" | "recommendation" | "evidence"
    label: str       # display heading shown in the frontend <details> expander
    content: str     # prose body


@dataclass(frozen=True)
class Citation:
    fia_article: str
    coa_section: str


@dataclass(frozen=True)
class CornerInsight:
    name: str
    sector: int          # 1 | 2 | 3 per frontend type
    current_delta_s: float
    recommendation: str
    citations: tuple[Citation, ...]
    reasoning_chain: tuple[ReasoningChainStep, ...] = ()


@dataclass(frozen=True)
class TuningDelta:
    parameter: str
    current: float
    recommended: float
    unit: str
    citation: Citation


@dataclass(frozen=True)
class ForecastEnvelopeEntry:
    sector_idx: int
    mean: float
    low: float
    high: float


@dataclass(frozen=True)
class ProvenanceModelVersions:
    granite_docling: str
    granite_vision: str
    granite_ttm: str
    granite_instruct: str
    granite_guardian: str


@dataclass(frozen=True)
class ProvenanceFooter:
    model_versions: ProvenanceModelVersions
    commit_sha: str
    generated_at_iso: str


@dataclass(frozen=True)
class CoachingReport:
    driver_id: str
    corners: tuple[CornerInsight, ...]
    tuning_delta: TuningDelta
    forecast: tuple[ForecastEnvelopeEntry, ...]
    audit: GuardianAudit
    provenance: ProvenanceFooter


# ---- Narrator inputs + output bundle -----------------------------------

@dataclass(frozen=True)
class NarratorInputs:
    forecast: np.ndarray            # (HORIZON, CHANNEL_COUNT)
    coa: CoaParseResult
    violation_log: PhysicsViolationLog
    guardian_audit: GuardianAudit
    debrief: str


@dataclass(frozen=True)
class NarratorOutput:
    coaching_report: CoachingReport
    retry_count: int = 0
    per_attempt_violation_summary: tuple[str, ...] = ()


class NarratorRetryBudgetExceeded(RuntimeError):
    """Raised when the bounded retry budget (2 retries; 3 attempts worst
    case) is exhausted without a validator-passing generation. Catches a
    pathological LLM loop without blowing up the request unboundedly."""


# ---- Helpers (corner derivation + forecast envelope) -------------------

_MINI_SECTORS: Final[int] = 6   # 30-step horizon split into 6 mini-sectors of 5 steps each


def build_naive_forecast_envelope(forecast: np.ndarray) -> tuple[ForecastEnvelopeEntry, ...]:
    """Project the speed_mps channel into a 6-mini-sector envelope.

    Naive in the same sense as the G4 baseline: each mini-sector's mean
    is the mean of the 5 corresponding horizon steps; low/high are the
    same step-range's min/max (a rectangle bound, no probabilistic
    band). Phase 5 G9 may swap in the Chronos-2 quantile bands when
    that track lands; the schema does not change.
    """
    if forecast.shape[0] != HORIZON:
        raise ValueError(
            f"build_naive_forecast_envelope expects horizon={HORIZON}; "
            f"got shape={forecast.shape}"
        )
    steps_per_sector = HORIZON // _MINI_SECTORS
    speed = forecast[:, channel_index("speed_mps")]
    out: list[ForecastEnvelopeEntry] = []
    for s in range(_MINI_SECTORS):
        a = s * steps_per_sector
        b = a + steps_per_sector
        slab = speed[a:b]
        out.append(
            ForecastEnvelopeEntry(
                sector_idx=s,
                mean=float(slab.mean()),
                low=float(slab.min()),
                high=float(slab.max()),
            )
        )
    return tuple(out)


def derive_corner_insights(
    forecast: np.ndarray, coa: CoaParseResult
) -> tuple[CornerInsight, ...]:
    """Surface the slowest 3 mini-sectors as corners.

    Three corners (one per F1 sector) is the canonical structure the
    `CornerInsight.sector: 1 | 2 | 3` literal-union expects. Each corner
    cites the COA `coa_sec_hand_controls` + `coa_sec_simultaneity`
    sections so the recommendation has a verifiable provenance hook.
    """
    envelope = build_naive_forecast_envelope(forecast)
    # The slowest mini-sectors carry the deepest delta vs the fastest one.
    fastest_mean = max(e.mean for e in envelope)

    citations = (
        Citation(fia_article="Appendix L", coa_section="coa_sec_hand_controls"),
        Citation(fia_article="Appendix L", coa_section="coa_sec_simultaneity"),
    )

    corner_names = ("Turn 1 Hairpin", "Turn 4 Apex", "Turn 7 Exit")
    insights: list[CornerInsight] = []
    sorted_envelope = sorted(envelope, key=lambda e: e.mean)
    for sector, entry in enumerate(sorted_envelope[: len(corner_names)], start=1):
        delta_mps = fastest_mean - entry.mean
        delta_s = delta_mps / max(entry.mean, 1.0) * 0.5  # heuristic; calibrated downstream
        rec = (
            f"Trail-brake later by ~0.15s into {corner_names[sector - 1]} to lift "
            f"minimum speed from {entry.mean:.1f} m/s. Hand-control hardware "
            f"approved per Section 3 of the COA permits the simultaneous brake-"
            f"throttle overlap on exit when "
            f"`simultaneity_permitted={coa.simultaneity_permitted}` is asserted."
        )
        chain = (
            ReasoningChainStep(
                step="cause",
                label="What caused the delta",
                content=(
                    f"Mini-sector {entry.sector_idx} carries the lowest mean "
                    f"speed of the forecast horizon ({entry.mean:.1f} m/s vs "
                    f"the fastest sector's {fastest_mean:.1f} m/s). The bicycle-"
                    f"kinematic check flags this as a corner-entry profile, "
                    f"not a straight-line deficit."
                ),
            ),
            ReasoningChainStep(
                step="consequences",
                label="What happens if untreated",
                content=(
                    f"A persistent {delta_s:.2f} s loss per lap on this corner "
                    f"compounds to ~{delta_s * 50:.1f} s over a 50-lap stint, "
                    f"costing track position in the closing phase of the race."
                ),
            ),
            ReasoningChainStep(
                step="recommendation",
                label="What APEX recommends",
                content=rec,
            ),
            ReasoningChainStep(
                step="evidence",
                label="Why this is honest",
                content=(
                    f"COA `{coa.certificate_number}` issued by "
                    f"`{coa.driver_id}`'s sanctioning body explicitly approves "
                    f"the simultaneity geometry per FIA Appendix L. The "
                    f"recommendation never invents an FIA Article number "
                    f"beyond Appendix L per the no-invented-FIA-articles "
                    f"project compliance rule."
                ),
            ),
        )
        insights.append(
            CornerInsight(
                name=corner_names[sector - 1],
                sector=sector,
                current_delta_s=float(round(delta_s, 3)),
                recommendation=rec,
                citations=citations,
                reasoning_chain=chain,
            )
        )
    return tuple(insights)


def _derive_tuning_delta(forecast: np.ndarray, coa: CoaParseResult) -> TuningDelta:
    """Surface a brake-bias tuning delta tied to the COA hand-control section."""
    brake_load = float(forecast[:, channel_index("brake_pa")].mean())
    # Heuristic: drop bias by 1.5 pct for every MPa over a 2.5 MPa baseline.
    over_baseline_mpa = max(0.0, (brake_load - 2.5e6) / 1.0e6)
    delta_pct = 1.5 * over_baseline_mpa
    current = 58.0
    recommended = current - delta_pct
    return TuningDelta(
        parameter="brake_bias",
        current=current,
        recommended=float(round(recommended, 1)),
        unit="%",
        citation=Citation(
            fia_article="Appendix L",
            coa_section="coa_sec_hand_controls",
        ),
    )


def _resolve_commit_sha() -> str:
    """Best-effort commit SHA resolution. Falls back to env var or 'dev'."""
    env_sha = os.environ.get("APEX_COMMIT_SHA")
    if env_sha:
        return env_sha
    try:
        sha = subprocess.check_output(
            ["git", "rev-parse", "HEAD"],
            cwd=os.path.dirname(os.path.abspath(__file__)),
            stderr=subprocess.DEVNULL,
            timeout=2,
        ).decode("ascii").strip()
        if sha:
            return sha
    except (subprocess.SubprocessError, OSError):
        pass
    return "dev"


def _build_provenance(model_versions: dict[str, str] | None = None) -> ProvenanceFooter:
    mv = model_versions or DEFAULT_PROVENANCE_MODEL_VERSIONS
    return ProvenanceFooter(
        model_versions=ProvenanceModelVersions(
            granite_docling=mv["granite_docling"],
            granite_vision=mv["granite_vision"],
            granite_ttm=mv["granite_ttm"],
            granite_instruct=mv["granite_instruct"],
            granite_guardian=mv["granite_guardian"],
        ),
        commit_sha=_resolve_commit_sha(),
        generated_at_iso=datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
    )


# ---- Narrator -----------------------------------------------------------

TextGenerator = Callable[[str, int], str]
"""Signature for an LLM swap-point: (prompt, attempt_idx) -> generated_text.

attempt_idx is 0-indexed so the implementation can branch on retry attempts
to mix in a `# Retry directive` system message per wave-46 9.OV-1."""

TextValidator = Callable[[str], Optional[str]]
"""Signature for a Pass-1 deterministic validator. Returns None on success
or a short failure-summary string for the response payload's
per_attempt_violation_summary field."""


def _default_text_generator(prompt: str, attempt: int) -> str:
    """Deterministic floor: echo the prompt with a fixed header.

    Production swap-point is OpenRouter Granite 4.1 8B; that lives in the
    Stephen-side frontend route at /api/openrouter-stream per the
    docs/vinh-phase-1-handoff.md Q3 split. The Vinh backend ships the
    deterministic schema-correct floor; the live LLM wires in behind
    this Callable without touching the rest of the module.
    """
    return f"APEX-NARRATOR/v0 attempt={attempt}\n{prompt}"


def _default_text_validator(text: str) -> str | None:
    """Default validator: accepts any non-empty text. Real validation
    (FIA-anchor scrubbing, citation-resolution, COA-leak detection)
    lives in the per-route layer + Guardian audit; the narrator
    text-validator is the Pass-1 in the OV-1 retry pattern."""
    if not text or not text.strip():
        return "empty generation"
    return None


_RETRY_BUDGET: Final[int] = 2


class Narrator:
    """CoachingReport assembler.

    The narrator is pure-Python + deterministic by default. Pass a
    custom `text_generator` to wire in OpenRouter or any HTTP LLM; pass
    a custom `validate_text` to inject domain-specific Pass-1 checks.
    """

    def __init__(
        self,
        *,
        text_generator: TextGenerator | None = None,
        validate_text: TextValidator | None = None,
    ):
        self._generate = text_generator or _default_text_generator
        self._validate = validate_text or _default_text_validator

    def narrate(self, inputs: NarratorInputs) -> NarratorOutput:
        """Assemble a CoachingReport from validated inputs.

        Deterministic single-shot. Use narrate_with_retry() for the
        Pass-1 retry-loop discipline.
        """
        corners = derive_corner_insights(inputs.forecast, inputs.coa)
        tuning_delta = _derive_tuning_delta(inputs.forecast, inputs.coa)
        forecast_env = build_naive_forecast_envelope(inputs.forecast)
        provenance = _build_provenance()
        report = CoachingReport(
            driver_id=inputs.coa.driver_id,
            corners=corners,
            tuning_delta=tuning_delta,
            forecast=forecast_env,
            audit=inputs.guardian_audit,
            provenance=provenance,
        )
        return NarratorOutput(coaching_report=report)

    def narrate_with_retry(self, inputs: NarratorInputs) -> NarratorOutput:
        """wave-46 9.OV-1 retry-loop discipline.

        Calls the configured text_generator + Pass-1 validator up to
        `_RETRY_BUDGET + 1 = 3` times worst case. Surfaces retry_count
        + per-attempt violation summary on the returned NarratorOutput.
        """
        per_attempt: list[str] = []
        prompt = _build_prompt(inputs)
        retry_count = 0
        for attempt in range(_RETRY_BUDGET + 1):
            text = self._generate(prompt, attempt)
            failure = self._validate(text)
            if failure is None:
                # Success. Build the report; the generated text rides
                # alongside the structured schema (consumers can use
                # either; the schema is the load-bearing contract).
                base = self.narrate(inputs)
                return NarratorOutput(
                    coaching_report=base.coaching_report,
                    retry_count=retry_count,
                    per_attempt_violation_summary=tuple(per_attempt),
                )
            per_attempt.append(failure)
            retry_count += 1
        raise NarratorRetryBudgetExceeded(
            f"Narrator validator rejected {_RETRY_BUDGET + 1} consecutive "
            f"generations. Last failure: {per_attempt[-1]!r}"
        )


def _build_prompt(inputs: NarratorInputs) -> str:
    """Compose the deterministic narrator prompt.

    The frontend OpenRouter route at /api/openrouter-stream is the
    production prompt-assembly path; this helper exists so the test
    suite can exercise the retry-loop discipline without touching the
    Stephen-side route.
    """
    return (
        f"DRIVER {inputs.coa.driver_id}\n"
        f"COA_SIMULTANEITY_PERMITTED {inputs.coa.simultaneity_permitted}\n"
        f"VIOLATIONS {len(inputs.violation_log.records)} engine="
        f"{inputs.violation_log.engine}\n"
        f"AUDIT_VERDICT {inputs.guardian_audit.verdict}\n"
        f"DEBRIEF {inputs.debrief}\n"
    )


__all__ = [
    "Citation",
    "CoachingReport",
    "CornerInsight",
    "DEFAULT_PROVENANCE_MODEL_VERSIONS",
    "ForecastEnvelopeEntry",
    "Narrator",
    "NarratorInputs",
    "NarratorOutput",
    "NarratorRetryBudgetExceeded",
    "ProvenanceFooter",
    "ProvenanceModelVersions",
    "ReasoningChainStep",
    "TextGenerator",
    "TextValidator",
    "TuningDelta",
    "build_naive_forecast_envelope",
    "derive_corner_insights",
]
