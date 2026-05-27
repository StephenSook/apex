# APEX backend container (Phase 5 task 5.2 + wave-48 deploy fixes)
#
# Build:
#   docker build -t apex-backend:0.2.0 app/backend
#
# Run (local):
#   docker run --rm -p 8000:8000 \
#     -v ${PWD}/fixtures:/srv/fixtures:ro \
#     -e APEX_AUDIT_LOG_PATH=/srv/audit/audit-log.jsonl \
#     -e OPENROUTER_API_KEY=$OPENROUTER_API_KEY \
#     apex-backend:0.2.0
#
# Smoke (after `docker run`):
#   curl http://localhost:8000/healthz
#   curl http://localhost:8000/api/session-context
#   curl http://localhost:8000/api/orchestration
#
# Production deploy targets (per Phase 5 task 5.1):
#   - HuggingFace Spaces (Docker SDK, free CPU tier)
#       1. Create Space at huggingface.co/new-space (Docker SDK, CPU basic)
#       2. Copy app/backend/* + fixtures/ into the Space repo
#       3. Add README.md HF Spaces frontmatter (see app/backend/README.md)
#       4. git push to huggingface.co; Spaces builds + serves automatically
#   - Fly.io: `fly launch --no-deploy --image apex-backend:0.2.0`
#   - Modal: `modal deploy` from a wrapped `modal.Image.from_dockerfile()`
#
# wave-48 fixes vs the v0.1.0 Dockerfile:
#   1. `pip install -r requirements.txt` for real (was pinning only 4
#       packages by name; cvxpylayers + transformers were silently
#       missing). Skipped torch+cuda; install CPU torch separately for
#       size.
#   2. `COPY fixtures` so `/api/analyze` + `/api/orchestration` can
#       resolve `fixtures/personas/sarah-reynolds-*` on a fresh
#       container (was 503-ing because fixtures were dev-only).
#   3. HEALTHCHECK extended to 60s start period to accommodate TTM lazy
#       load when `APEX_ENABLE_TTM=1`.

FROM python:3.11-slim AS base

# --- system deps -------------------------------------------------------
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      git \
      curl \
      build-essential \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /srv/app

# --- python deps (light layer; CPU torch only, no cuda) ---------------
# Install CPU-only torch first (much smaller than CUDA wheel; CPU is
# what HF Spaces free tier provides). cvxpy + cvxpylayers + scs +
# clarabel + transformers + granite-tsfm + httpx all install via the
# main requirements.txt pin.
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade pip wheel setuptools
RUN pip install --no-cache-dir torch==2.5.1 --index-url https://download.pytorch.org/whl/cpu
# requirements.txt was authored against Vinh's Windows+CUDA env; filter
# out the torch line + install the rest. Anything we don't need at
# runtime (llama_cpp_python is heavy + only used by the offline G1b
# bench script, never by the FastAPI server) is dropped via the grep.
RUN grep -vE "^(torch==|llama_cpp_python==|fastf1==)" requirements.txt > requirements.lean.txt \
 && pip install --no-cache-dir -r requirements.lean.txt \
 && pip install --no-cache-dir \
      "uvicorn[standard]" \
      python-multipart \
      structlog

# --- app code + fixtures ----------------------------------------------
# COPY assumes the build context contains: apex/ + fixtures/ + (optional)
# docs/. For HF Spaces deploy, the deploy script symlinks/copies
# fixtures from `../../fixtures` into the build context first; for
# repo-root `docker build -f app/backend/Dockerfile .` the COPY paths
# below still resolve. Local-only `docker build app/backend` requires
# `cp -r ../../fixtures app/backend/fixtures` BEFORE building.
COPY apex apex
COPY fixtures /srv/app/fixtures

# --- runtime ----------------------------------------------------------
ENV PYTHONPATH=/srv/app \
    APEX_AUDIT_LOG_PATH=/srv/audit/audit-log.jsonl \
    APEX_COMMIT_SHA=container \
    APEX_ENABLE_TTM=0 \
    PYTHONUNBUFFERED=1

RUN mkdir -p /srv/audit && chmod 0777 /srv/audit

EXPOSE 7860 8000

# HF Spaces routes traffic to port 7860 by default; uvicorn binds both
# to keep local docker-run + Fly.io + HF Spaces all happy.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s \
  CMD curl -fsS http://localhost:${PORT:-7860}/healthz || curl -fsS http://localhost:8000/healthz || exit 1

CMD ["sh", "-c", "uvicorn apex.server:app --host 0.0.0.0 --port ${PORT:-7860}"]
