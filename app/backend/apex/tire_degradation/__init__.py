"""Tire degradation predictor (wave-49 Phase 7.2 backend).

TTM-r2 forecast consumer that extrapolates per-axle wear over a
10-lap stint horizon. Returns the `TireDegradationResponse` shape
the frontend `TireDegradationPanel` consumes.
"""

from apex.tire_degradation.predictor import predict_tire_degradation

__all__ = ["predict_tire_degradation"]
