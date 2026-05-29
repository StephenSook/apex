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
  OTEL_EXPORTER_OTLP_ENDPOINT=...     # OTLP collector base URL
                                      # (e.g. https://api.honeycomb.io)
  OTEL_EXPORTER_OTLP_HEADERS=...      # comma-separated k=v pairs
                                      # (e.g. x-honeycomb-team=<key>)
  OTEL_SERVICE_NAME=apex-backend      # defaults to "apex-backend"

Honeycomb wire-up (wave-51c): point at https://api.honeycomb.io and
set `OTEL_EXPORTER_OTLP_HEADERS=x-honeycomb-team=<ingest-key>`. The
OTel Python SDK reads both env vars natively when OTLPSpanExporter()
is constructed without explicit kwargs, then appends `/v1/traces` to
the base URL per the OTLP HTTP spec. Honeycomb free tier supports
unlimited ingest + 60-day retention without a credit card.
"""

from __future__ import annotations

import logging
import os
import time

from apex import observability_metrics

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
    except ImportError as exc:
        logger.warning(
            "APEX_OTEL_ENABLED=1 but core opentelemetry packages not installed; "
            "skipping (install with `pip install opentelemetry-api "
            "opentelemetry-sdk`): %s",
            exc,
        )
        return None

    # FastAPIInstrumentor is OPTIONAL per wave-51d cascade-#60: the
    # opentelemetry-instrumentation 0.60b pins wrapt<2.0 which conflicts
    # with Vinh's wrapt==2.2.1 requirements pin. Without auto-instrumentation,
    # request-level spans land via the manual middleware fallback below.
    # If instrumentation-fastapi IS installed, it provides richer auto-spans.
    try:
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
        fastapi_instrumentor_available = True
    except ImportError:
        FastAPIInstrumentor = None  # type: ignore[assignment]
        fastapi_instrumentor_available = False

    service_name = os.environ.get("OTEL_SERVICE_NAME", "apex-backend")
    resource = Resource.create({"service.name": service_name})
    provider = TracerProvider(resource=resource)

    # Wire OTLP HTTP exporter when an endpoint is configured, else fall
    # back to console so spans stay visible in container logs.
    #
    # wave-51c Honeycomb fix: prior revision passed `endpoint=` explicitly
    # to OTLPSpanExporter, which the Python SDK treats as the FULL signal
    # URL (no `/v1/traces` auto-append). Stephen would set
    # OTEL_EXPORTER_OTLP_ENDPOINT=https://api.honeycomb.io, the exporter
    # would POST to that root path, Honeycomb would 404, no spans land.
    # Construct without kwargs so the SDK reads endpoint + headers from
    # env vars per the OTLP spec + appends `/v1/traces` automatically.
    # Honeycomb header `x-honeycomb-team=<key>` rides on
    # OTEL_EXPORTER_OTLP_HEADERS.
    #
    # ALSO additive: console exporter kept on alongside OTLP when both
    # APEX_OTEL_CONSOLE=1 + OTLP endpoint set, so local docker-compose
    # runs see span output in logs while still shipping to a collector.
    otlp_endpoint = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT", "").strip()
    otlp_active = False
    if otlp_endpoint:
        try:
            from opentelemetry.exporter.otlp.proto.http.trace_exporter import (
                OTLPSpanExporter,
            )
            # No kwargs: SDK reads OTEL_EXPORTER_OTLP_ENDPOINT +
            # OTEL_EXPORTER_OTLP_HEADERS from env + appends /v1/traces.
            otlp_exporter = OTLPSpanExporter()
            provider.add_span_processor(BatchSpanProcessor(otlp_exporter))
            otlp_active = True
            logger.info(
                "OTel OTLP HTTP exporter active (endpoint=%s, "
                "SDK appends /v1/traces; headers via "
                "OTEL_EXPORTER_OTLP_HEADERS)",
                otlp_endpoint,
            )
        except ImportError:
            logger.warning(
                "OTLP exporter package missing "
                "(opentelemetry-exporter-otlp-proto-http); falling back "
                "to console only"
            )

    # Console exporter: always on when OTLP is off (so spans go somewhere);
    # additive when APEX_OTEL_CONSOLE=1 is set alongside OTLP for local
    # debugging.
    want_console = (
        not otlp_active
        or os.environ.get("APEX_OTEL_CONSOLE", "").strip() in {"1", "true", "yes"}
    )
    if want_console:
        provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))
        if not otlp_active:
            logger.info("OTel exporter using console (no OTLP endpoint set)")
        else:
            logger.info("OTel console exporter additive alongside OTLP")

    trace.set_tracer_provider(provider)

    tracer = trace.get_tracer(service_name)

    if fastapi_instrumentor_available and FastAPIInstrumentor is not None:
        FastAPIInstrumentor.instrument_app(app)
        logger.info("OTel auto-instrumentation active on FastAPI app")
    else:
        # Wave-51d cascade-#60 manual fallback: register a FastAPI middleware
        # that creates a span per request. Cheaper than full auto-
        # instrumentation but still surfaces HTTP method + path + status
        # + latency to Honeycomb. Skip noisy paths so the dashboard does
        # not drown in healthz polling.
        @app.middleware("http")
        async def apex_otel_request_middleware(request, call_next):
            path = request.url.path
            # Skip readiness + the observability panel's own polling so the
            # live dashboard reflects real product traffic, not self-polling.
            if path in {"/healthz", "/favicon.ico", "/api/observability/summary"}:
                return await call_next(request)
            started = time.perf_counter()
            with tracer.start_as_current_span(f"{request.method} {path}") as span:
                span.set_attribute("http.method", request.method)
                span.set_attribute("http.url", str(request.url))
                span.set_attribute("http.route", path)
                response = await call_next(request)
                span.set_attribute("http.status_code", response.status_code)
                # Mirror into the in-process live-metrics aggregator with the
                # REAL Honeycomb trace_id so /api/observability/summary can
                # deep-link each recent request to its trace waterfall.
                try:
                    span_ctx = span.get_span_context()
                    trace_id_hex = (
                        format(span_ctx.trace_id, "032x")
                        if span_ctx and span_ctx.trace_id
                        else None
                    )
                except Exception:  # pragma: no cover - defensive
                    trace_id_hex = None
                observability_metrics.record_request(
                    route=path,
                    method=request.method,
                    status=response.status_code,
                    duration_ms=(time.perf_counter() - started) * 1000.0,
                    trace_id=trace_id_hex,
                )
                return response

        logger.info(
            "OTel manual request-tracing middleware active (FastAPIInstrumentor "
            "not installed; install opentelemetry-instrumentation-fastapi for "
            "richer auto-spans when wrapt compatibility permits)"
        )
    return tracer


__all__ = ["setup_observability"]
