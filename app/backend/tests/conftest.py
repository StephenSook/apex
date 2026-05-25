"""Pytest config: put `app/backend/` on sys.path so `import apex.*` resolves
without requiring an editable install. Removes the only blocker to running
`pytest` from the repo root or from `app/backend/`.
"""

from __future__ import annotations

import sys
from pathlib import Path

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))
