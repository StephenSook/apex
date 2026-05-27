# APEX backend container (Phase 5 task 5.2)
#
# Build:
#   docker build -t apex-backend:0.1.0 app/backend
#
# Run:
#   docker run --rm -p 8000:8000 \
#     -v ${PWD}/fixtures:/srv/fixtures:ro \
#     -e APEX_AUDIT_LOG_PATH=/srv/audit/audit-log.jsonl \
#     apex-backend:0.1.0
#
# Smoke:
#   curl http://localhost:8000/healthz
#   curl http://localhost:8000/api/session-context
#
# Production deploy targets (per Phase 5 task 5.1):
#   - Modal: image = apex-backend; web endpoint exposed at /api/*
#   - Fly.io: fly launch --no-deploy --image apex-backend:0.1.0
#   - Container registry + Vercel functions (per D-046 Vercel deploy)
#
# Heavy ML deps (torch + cvxpy + transformers) are NOT installed in
# this slim image. The /api/what-if-replay route requires them; deploys
# that need that endpoint should swap to apex-backend:0.1.0-cvxpy
# (~3.5 GB) or stage the install per-target.

FROM python:3.10-slim AS base

# --- system deps -------------------------------------------------------
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      git \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /srv/app

# --- python deps (light layer) ----------------------------------------
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir \
      fastapi \
      "uvicorn[standard]" \
      numpy \
      structlog

# --- app code ----------------------------------------------------------
COPY apex apex

# --- runtime ----------------------------------------------------------
ENV PYTHONPATH=/srv/app \
    APEX_AUDIT_LOG_PATH=/srv/audit/audit-log.jsonl \
    APEX_COMMIT_SHA=container

RUN mkdir -p /srv/audit && chmod 0777 /srv/audit

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/healthz')" \
   || exit 1

CMD ["uvicorn", "apex.server:app", "--host", "0.0.0.0", "--port", "8000"]
