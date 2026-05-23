"""APEX shared contracts package.

Single source of truth for inter-layer types. See shapes.py for the canonical
(B, 30, 14) tensor contract; subsequent modules (projector.py Protocol,
violation_log.py serializer) import from here.
"""

from .shapes import (
    CHANNEL_COUNT,
    CHANNEL_TIER_BINDING,
    CHANNELS,
    HORIZON,
    SCHEMA_VERSION,
    TENSOR_SHAPE,
    channel_index,
)

__all__ = [
    "CHANNEL_COUNT",
    "CHANNEL_TIER_BINDING",
    "CHANNELS",
    "HORIZON",
    "SCHEMA_VERSION",
    "TENSOR_SHAPE",
    "channel_index",
]
