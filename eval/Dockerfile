# APEX-Bench v0.0.1-preview reproducibility harness (Phase 6 task 6.4b)
#
# Build:
#   docker build -t apex-bench:0.0.1-preview -f eval/Dockerfile .
#
# Run:
#   docker run --rm \
#     -v "${PWD}/fixtures:/srv/fixtures:ro" \
#     -v "${PWD}/apex-bench/out:/srv/out" \
#     apex-bench:0.0.1-preview
#
# Outputs land under apex-bench/out/:
#   - sarah_coaching_report.json
#   - sarah_violation_log.txt
#   - lips_ablation.csv
#
# Tolerance bands per D-023 MLPerf protocol. The V2 row requires
# torch + cvxpy + cvxpylayers; the bench gracefully degrades and
# logs "skipped" for V2 if those deps are absent (e.g. ARM hosts).

FROM python:3.10-slim AS base

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      git build-essential \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /srv/apex

# Core deps. Add torch + cvxpy + cvxpylayers in a separate layer so the
# bench image can grow incrementally for hosts that can pull them.
RUN pip install --no-cache-dir \
      numpy \
      structlog

# Optional V2 layer. Commented out by default so the bench image is
# pullable on small free-tier hosts. Uncomment for hosts that can
# install torch + cvxpylayers (Modal, Fly.io with > 4 GB RAM).
# RUN pip install --no-cache-dir torch cvxpy cvxpylayers

# Bring in the APEX backend + apex-bench runner.
COPY app/backend /srv/apex/app/backend
COPY apex-bench  /srv/apex/apex-bench
COPY fixtures    /srv/fixtures

ENV PYTHONPATH=/srv/apex/app/backend:/srv/apex \
    APEX_COMMIT_SHA=bench-container

VOLUME /srv/out

ENTRYPOINT ["python", "apex-bench/run_bench.py", "--out", "/srv/out"]
