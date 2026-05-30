"""OpenRouter-backed `TextGenerator` for the APEX Narrator (wave-48).

Closes Gemini honesty audit finding #3 (the default `_default_text_generator`
echoes the prompt; the narrator never invoked a real LLM). This module
provides a drop-in `TextGenerator` callable that posts the assembled
narrator prompt to OpenRouter's OpenAI-compatible chat completions API
against an IBM Granite 4.1 8B model.

Wiring shape:

    from apex.instruct.openrouter_generator import build_openrouter_generator
    from apex.instruct.narrator import Narrator

    generator = build_openrouter_generator()           # None if env unset
    narrator = Narrator(text_generator=generator) if generator else Narrator()
    output = narrator.narrate(inputs)

When `OPENROUTER_API_KEY` is unset OR `httpx` is unavailable, the factory
returns None so the caller can transparently fall back to the
deterministic Narrator floor. This is the same env-driven swap-point
pattern as the Stephen-side `/api/openrouter-stream` route at
`app/frontend/app/api/openrouter-stream/route.ts`.

Production routing per `docs/decision-log.md` D-052 + D-054:
  - frontend `/api/openrouter-stream` is the **default** Granite path
    for AICopilotChat (Stephen lane);
  - this backend module is the LangGraph `instruct` node path used by
    the `/api/analyze-upload` end-to-end pipeline (Vinh lane);
  - both share the same OpenRouter `OPENROUTER_API_KEY` env secret on
    the deployed surface; only the FRONTEND production deploy holds it
    today, so on backend deploys without it set the narrator falls
    back to the deterministic floor.

Self-Correcting Retry Loop (OVERRIDE steal #1 per
`project_apex_override_competitor.md`): retries are managed by the
calling `Narrator.narrate_with_retry()`, which feeds an
`attempt` index into the generator. We use the attempt index to attach
a `# Retry directive` system message on attempts > 0 so the LLM knows
why it is being called again.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Callable, Final, Optional

logger = logging.getLogger(__name__)

# Wave-75: OpenRouter serves the IBM Granite 8B model as
# "ibm-granite/granite-4.1-8b" (NO "-instruct" suffix; verified against the
# live catalog). The prior "-instruct" default 404'd, silently dropping the
# backend narrator + the COA Docling bridge to their fallbacks. Override via
# APEX_NARRATOR_MODEL if needed.
_DEFAULT_MODEL: Final[str] = "ibm-granite/granite-4.1-8b"
_DEFAULT_ENDPOINT: Final[str] = "https://openrouter.ai/api/v1/chat/completions"
_DEFAULT_TIMEOUT_S: Final[float] = 25.0
_DEFAULT_MAX_TOKENS: Final[int] = 800
_DEFAULT_TEMPERATURE: Final[float] = 0.2

_SYSTEM_PROMPT: Final[str] = (
    "You are the APEX race-engineer narrator. Convert the structured "
    "race-engineering context (driver_id + COA simultaneity flag + "
    "physics violation summary + Guardian audit verdict + driver "
    "debrief) into a concise corner-by-corner coaching brief.\n\n"
    "HARD CONSTRAINTS:\n"
    "  - Never invent FIA Article numbers. Cite only `Appendix L` + the "
    "    COA section identifier supplied in the prompt.\n"
    "  - Never use the em-dash character (U+2014); use a period, colon, "
    "    comma, or hyphen instead.\n"
    "  - Conditional phrasing on physics claims (\"forecast envelope\" "
    "    not \"guaranteed pace\").\n"
    "  - At most 4 paragraphs. Plain prose. No markdown headers.\n"
    "  - If the COA does not approve simultaneity, never recommend "
    "    simultaneous brake-throttle overlap.\n"
)


def _build_messages(prompt: str, attempt: int) -> list[dict]:
    """Compose the OpenRouter messages array.

    Attempt 0 is the first try; attempts 1 + 2 carry a Pass-1 retry
    directive that tells the LLM the prior attempt was rejected by the
    deterministic validator. The same prompt + same validator + same
    Granite model + bounded retry budget = identical to the OVERRIDE
    pattern.
    """
    messages: list[dict] = [
        {"role": "system", "content": _SYSTEM_PROMPT},
    ]
    if attempt > 0:
        messages.append({
            "role": "system",
            "content": (
                f"# Retry directive (attempt {attempt + 1} of 3)\n"
                "Your previous response was rejected by the Pass-1 "
                "validator. Re-generate the corner-by-corner brief "
                "honoring the HARD CONSTRAINTS above more carefully. "
                "Common rejection causes: invented FIA Article numbers, "
                "em-dash character in prose, simultaneity recommendation "
                "without COA approval."
            ),
        })
    messages.append({"role": "user", "content": prompt})
    return messages


def build_openrouter_generator(
    *,
    model: str | None = None,
    endpoint: str = _DEFAULT_ENDPOINT,
    timeout_s: float = _DEFAULT_TIMEOUT_S,
    max_tokens: int = _DEFAULT_MAX_TOKENS,
    temperature: float = _DEFAULT_TEMPERATURE,
) -> Optional[Callable[[str, int], str]]:
    """Construct a `TextGenerator` that posts to OpenRouter.

    Returns None when the runtime environment is missing prerequisites
    so the caller can transparently fall back to the deterministic
    narrator floor.

    Prerequisites:
      - `OPENROUTER_API_KEY` env var must be set;
      - the `httpx` package must be importable.
    """
    api_key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not api_key:
        logger.info("OPENROUTER_API_KEY not set; narrator stays on deterministic floor")
        return None
    try:
        import httpx
    except ImportError:
        logger.warning("httpx not installed; narrator stays on deterministic floor")
        return None

    resolved_model = (model or os.environ.get(
        "APEX_NARRATOR_MODEL", _DEFAULT_MODEL,
    )).strip()
    referer = os.environ.get(
        "APEX_OPENROUTER_REFERER", "https://apex-one-black.vercel.app",
    )
    title = os.environ.get("APEX_OPENROUTER_TITLE", "APEX Race Engineer (backend)")

    def _generate(prompt: str, attempt: int) -> str:
        """Single LLM call. Bubbles up httpx exceptions so the Narrator
        retry loop OR the calling endpoint can decide how to handle
        upstream 5xx / rate limit / timeout."""
        body = {
            "model": resolved_model,
            "messages": _build_messages(prompt, attempt),
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": referer,
            "X-Title": title,
            "X-Apex-Attempt": str(attempt),
        }
        with httpx.Client(timeout=timeout_s) as client:
            r = client.post(endpoint, headers=headers, json=body)
        if r.status_code != 200:
            raise RuntimeError(
                f"OpenRouter returned {r.status_code}: "
                f"{r.text[:512]!r}"
            )
        payload = r.json()
        try:
            text = payload["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise RuntimeError(
                f"OpenRouter response missing choices[0].message.content: "
                f"{json.dumps(payload)[:512]}"
            ) from exc
        if not isinstance(text, str) or not text.strip():
            raise RuntimeError(
                "OpenRouter returned empty completion (Pass-1 validator "
                "would reject; surfaces as RuntimeError to allow caller "
                "to drop to deterministic floor)"
            )
        return text.strip()

    return _generate


__all__ = ["build_openrouter_generator"]
