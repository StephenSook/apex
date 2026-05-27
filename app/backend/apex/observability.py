"""OpenTelemetry tracing initialization (wave-48 quality-bar audit).

Closes OVERRIDE-steal #QB per `project_apex_override_competitor.md`:
production-grade hackathon submissions ship OTel span tracing for
every LLM + ML inference call. This module sets up the tracer + auto-
instruments the FastAPI app when env `APEX_OTEL_ENABLED=1` is set;
otherwise it's a no-op so dev + CI runs do not need OTel installed.

Span shape per route per request:
  POST /api/analyze-upload
  ├── apex.upload_validate (extension + size checks)
  ├── apex.upload_persist (tempdir + write)
  └── apex.langgraph_runtime
      ├── apex.node.ingestion
      ├── apex.node.rag
      ├── apex.node.projection
      │   └── apex.ttm.forecast (when APEX_ENABLE_TTM=1)
      ├── apex.node.guardian
      ├── apex.node.instruct
      │   └── apex.openrouter.chat_completion (when narrator wires)
      └── apex.node.provenance

Configure via env:
  APEX_OTEL_ENABLED=1                 # turn on
  OTEL_EXPORTER_OTLP_ENDPOINT=...     # OTLP collector (Honeycomb, etc)
  OTEL_SERVICE_NAME=apex-backend      # defaults to "apex-backend"
"""

from __future__ import annotations

import logging
import os

logger = logging.getLogger(__name__)


def setup_observability(app):
    """Initialize OpenTelemetry + auto-instrument the FastAPI app.

    Idempotent: safe to call once on FastAPI startup. No-op when the
    env-flag is off or the OTel packages are not installed (so CI +
    dev environments work without an OTLP collector).

    Args:
      app: the FastAPI app instance to instrument.

    Returns: tracer instance if OTel is active, else None.
    """
    if os.environ.get("APEX_OTEL_ENABLED", "").strip() not in {"1", "true", "yes"}:
        return None
    try:
        from opentelemetry import trace
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import (
            BatchSpanProcessor,
            ConsoleSpanExporter,
        )
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    except ImportError as exc:
        logger.warning(
            "APEX_OTEL_ENABLED=1 but opentelemetry packages not installed; "
            "skipping (install with `pip install opentelemetry-api "
            "opentelemetry-sdk opentelemetry-instrumentation-fastapi`): %s",
            exc,
        )
        return None

    service_name = os.environ.get("OTEL_SERVICE_NAME", "apex-backend")
    resource = Resource.create({"service.name": service_name})
    provider = TracerProvider(resource=resource)

    # Try to load the OTLP exporter if an endpoint is configured;
    # otherwise fall back to the console exporter so spans are still
    # visible in container logs.
    otlp_endpoint = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT", "").strip()
    if otlp_endpoint:
        try:
            from opentelemetry.exporter.otlp.proto.http.trace_exporter import (
                OTLPSpanExporter,
            )
            exporter = OTLPSpanExporter(endpoint=otlp_endpoint)
            logger.info("OTel exporter wired to OTLP %s", otlp_endpoint)
        except ImportError:
            logger.warning(
                "OTLP exporter package missing; falling back to console"
            )
            exporter = ConsoleSpanExporter()
    else:
        exporter = ConsoleSpanExporter()
        logger.info("OTel exporter using console (no OTLP endpoint set)")

    provider.add_span_processor(BatchSpanProcessor(exporter))
    trace.set_tracer_provider(provider)

    FastAPIInstrumentor.instrument_app(app)
    logger.info("OTel auto-instrumentation active on FastAPI app")
    return trace.get_tracer(service_name)


__all__ = ["setup_observability"]
