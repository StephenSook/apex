"""IBM TSPulse polyphase anomaly detector (Vinh M3-V7 swap-point).

Wave-48 ship. Module exposes the lazy `TSPulseAnomalyDetector`; routes
import from this package + cache the singleton at module load.
"""

from apex.tspulse.anomaly import (
    TSPulseAnomalyDetector,
    TSPulseAnomalyResult,
    detect_anomaly,
    get_anomaly_detector,
)

__all__ = [
    "TSPulseAnomalyDetector",
    "TSPulseAnomalyResult",
    "detect_anomaly",
    "get_anomaly_detector",
]
