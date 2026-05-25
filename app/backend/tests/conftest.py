"""Pytest config: put `app/backend/` on sys.path so `import apex.*` resolves
without requiring an editable install. Removes the only blocker to running
`pytest` from the repo root or from `app/backend/`.

Adds an `integration` marker for tests that download HuggingFace models or
touch the FastF1 cache (~3s+ per run). Run integration tests with:
    pytest --integration
Default `pytest` invocations skip them so the unit suite stays sub-second.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))


def pytest_addoption(parser):
    parser.addoption(
        "--integration",
        action="store_true",
        default=False,
        help="run integration tests that load real models / hit FastF1 cache",
    )


def pytest_configure(config):
    config.addinivalue_line(
        "markers",
        "integration: heavy tests that load TTM-r2 / hit FastF1 cache. "
        "Skipped by default; enable with --integration.",
    )


def pytest_collection_modifyitems(config, items):
    if config.getoption("--integration"):
        return
    skip_integration = pytest.mark.skip(reason="needs --integration flag")
    for item in items:
        if "integration" in item.keywords:
            item.add_marker(skip_integration)
