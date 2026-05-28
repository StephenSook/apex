"""Judges-page backend endpoints (wave-49).

Pure-Python computation that produces the paired-verdict diff +
4-axis LIPS rows + 8-tier projector trace + 3-iterate SCP loop that
the /judges + /lips-harness pages consume via wire-flip routes.
"""

from apex.judges.coa_diff import compute_coa_diff

__all__ = ["compute_coa_diff"]
