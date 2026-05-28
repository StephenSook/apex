"""LIPS 4-axis evaluation harness (wave-49 V15).

Latency + Integrity + Physics + Skill ablation runner. Returns the
4-row table the /lips-harness page renders.
"""

from apex.lips.harness import compute_lips_4_axis

__all__ = ["compute_lips_4_axis"]
