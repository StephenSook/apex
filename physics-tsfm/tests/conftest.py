"""Pytest config: put physics-tsfm package root + APEX backend root on
sys.path so test_carve_out can resolve `physics_tsfm` + its underlying
`apex.shared.contracts` re-export."""

from __future__ import annotations

import sys
from pathlib import Path

PACKAGE_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PACKAGE_ROOT))

APEX_BACKEND = PACKAGE_ROOT.parent / "app" / "backend"
sys.path.insert(0, str(APEX_BACKEND))
