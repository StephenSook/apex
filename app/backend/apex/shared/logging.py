"""Structured logging with audit_id correlation across all backend layers.

Council v2 SRE peer catch: no audit_id correlation across forecast/projection/
Guardian logs means post-demo debrief is archaeology. Every log line emitted
by the backend carries audit_id + commit_sha + model_versions so a single
filter `audit_id=<hex>` reconstructs the full request trace from TTM
forward through Guardian audit to provenance footer.

Format: line-oriented JSON (newline-delimited). Trivial to grep, pipe through
jq, ship to a log aggregator if APEX ever leaves the demo box.

Usage:
    from apex.shared.logging import get_logger, audit_context

    logger = get_logger(__name__)

    with audit_context(audit_id):  # set once at Guardian.audit() entry
        logger.info("forecast.completed", forecast_shape=tuple(out.shape))
        logger.warning("projection.fcvr", fcvr=0.067, threshold=0.0)

    # outside the context manager, audit_id falls back to "no_audit"
    logger.info("startup.completed")
"""

from __future__ import annotations

import json
import logging
import os
import subprocess
import sys
from contextlib import contextmanager
from contextvars import ContextVar
from datetime import datetime, timezone
from functools import lru_cache
from typing import Any, Iterator


# ---- Audit-id correlation (the council v2 SRE peer's fix) -------------

_audit_id_var: ContextVar[str] = ContextVar("audit_id", default="no_audit")


@contextmanager
def audit_context(audit_id: str) -> Iterator[None]:
    """Bind `audit_id` to all log lines emitted within this block.

    Guardian.audit() opens this context at entry; every downstream log line
    (validator, projection, narrator, provenance) inherits the same audit_id
    automatically.
    """
    token = _audit_id_var.set(audit_id)
    try:
        yield
    finally:
        _audit_id_var.reset(token)


def current_audit_id() -> str:
    return _audit_id_var.get()


# ---- Provenance baked into every line ---------------------------------

@lru_cache(maxsize=1)
def commit_sha() -> str:
    """Resolve current commit SHA once per process.

    Returns 'unknown' if git is unavailable (e.g. running from a wheel or in
    a container without .git). Cached so we do not exec git on every log line.
    """
    try:
        out = subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"],
            stderr=subprocess.DEVNULL,
            timeout=2,
        )
        return out.decode().strip()
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        return "unknown"


@lru_cache(maxsize=1)
def model_versions() -> dict[str, str]:
    """Best-effort version snapshot of the load-bearing libraries.

    Cached once per process. Returns "unknown" for libraries that fail
    to import (the production backend will not run in that case, but
    structured logging must never crash on import-time discovery).
    """
    versions: dict[str, str] = {}
    for name in ("torch", "transformers", "tsfm_public", "cvxpy", "cvxpylayers", "numpy"):
        try:
            module = __import__(name)
            versions[name] = getattr(module, "__version__", "no_version_attr")
        except ImportError:
            versions[name] = "not_installed"
    return versions


# ---- JSON line formatter ----------------------------------------------

class _AuditJSONFormatter(logging.Formatter):
    """One JSON object per line.

    Schema:
      ts          ISO 8601 UTC seconds precision
      level       INFO|WARNING|ERROR|...
      logger      qualified module name
      event       short snake_case event name (passed as msg)
      audit_id    set by audit_context, or 'no_audit'
      commit_sha  resolved once per process
      models      version snapshot dict
      ...         all logger.info(**kwargs) keyword args appear as top-level
    """

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "ts": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "event": record.getMessage(),
            "audit_id": current_audit_id(),
            "commit_sha": commit_sha(),
            "models": model_versions(),
        }
        # Surface caller-supplied kwargs (logger.info("ev", k=v)) as top-level fields.
        extras = getattr(record, "extras", None)
        if extras:
            for k, v in extras.items():
                if k not in payload:
                    payload[k] = v
        return json.dumps(payload, default=str, sort_keys=False)


class _StructuredAdapter(logging.LoggerAdapter):
    """Lets callers write logger.info("event.name", k=v, k2=v2)."""

    def process(self, msg: str, kwargs: dict[str, Any]) -> tuple[str, dict[str, Any]]:
        extras = kwargs.pop("extras", {})
        # Hoist any kwargs that aren't standard logging params into extras.
        reserved = {"exc_info", "stack_info", "stacklevel", "extra"}
        spurious = {k: kwargs.pop(k) for k in list(kwargs) if k not in reserved}
        merged = {**extras, **spurious}
        kwargs["extra"] = {"extras": merged}
        return msg, kwargs


@lru_cache(maxsize=None)
def _root_handler_installed() -> bool:
    """Install our JSON handler on the root logger exactly once.

    Idempotent: multiple get_logger() calls do not stack handlers.
    """
    handler = logging.StreamHandler(stream=sys.stderr)
    handler.setFormatter(_AuditJSONFormatter())
    root = logging.getLogger("apex")
    root.addHandler(handler)
    root.setLevel(os.environ.get("APEX_LOG_LEVEL", "INFO"))
    root.propagate = False
    return True


def get_logger(name: str) -> _StructuredAdapter:
    """Return a structured-JSON logger for `name` (typically __name__).

    The returned adapter accepts kwargs that get serialized as top-level
    JSON fields on each log line. Use snake_case event names as the message.
    """
    _root_handler_installed()
    if not name.startswith("apex"):
        name = f"apex.{name}"
    return _StructuredAdapter(logging.getLogger(name), {})


__all__ = [
    "audit_context",
    "commit_sha",
    "current_audit_id",
    "get_logger",
    "model_versions",
]
