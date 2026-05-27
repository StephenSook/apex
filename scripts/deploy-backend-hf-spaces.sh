#!/usr/bin/env bash
# APEX backend HF Spaces deploy script (wave-48).
#
# Pushes app/backend/ + fixtures/personas/ to a HuggingFace Space using
# Docker SDK. Free CPU tier is enough; no GPU needed because the LLM
# path goes through OpenRouter + ML inference via HF Inference API.
#
# Prerequisites:
#   - huggingface_hub CLI: `pip install huggingface_hub`
#   - HF login: `huggingface-cli login` (token with `write` scope)
#   - Space pre-created at https://huggingface.co/spaces/<user>/<space>
#     with Docker SDK + CPU basic tier
#
# Env:
#   APEX_HF_SPACE=<user/space>   e.g. ssookra/apex-backend (HF username
#                                NOT GitHub username; defaults to
#                                ssookra/apex-backend if unset)
#   APEX_HF_TOKEN=<token>        write-scope token
#
# Usage:
#   APEX_HF_SPACE=ssookra/apex-backend bash scripts/deploy-backend-hf-spaces.sh
#
# After deploy:
#   1. Set Vercel env vars: NEXT_PUBLIC_VINH_BACKEND_BASE_URL=https://<user>-<space>.hf.space
#   2. Flip 11 USE_REAL_* env flags to 1 in Vercel project settings
#   3. Verify: `curl https://<user>-<space>.hf.space/healthz`

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="${REPO_ROOT}/.hf-space-build"
SPACE_REPO="${APEX_HF_SPACE:-ssookra/apex-backend}"
HF_TOKEN="${APEX_HF_TOKEN:-${HF_TOKEN:-}}"

if [[ -z "$HF_TOKEN" ]]; then
  echo "ERROR: APEX_HF_TOKEN or HF_TOKEN env var must be set (write scope)" >&2
  echo "Get one at: https://huggingface.co/settings/tokens" >&2
  exit 1
fi

echo "[deploy] target Space: $SPACE_REPO"
echo "[deploy] build dir:    $BUILD_DIR"

# Clean + stage
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Copy backend code
cp -r "$REPO_ROOT/app/backend/apex"          "$BUILD_DIR/apex"
cp    "$REPO_ROOT/app/backend/requirements.txt" "$BUILD_DIR/requirements.txt"
cp    "$REPO_ROOT/app/backend/Dockerfile"    "$BUILD_DIR/Dockerfile"

# Copy fixtures (canonical Sarah Reynolds for /api/orchestration + /api/analyze)
mkdir -p "$BUILD_DIR/fixtures/personas"
cp "$REPO_ROOT/fixtures/personas/sarah-reynolds-telemetry.csv"  "$BUILD_DIR/fixtures/personas/"
cp "$REPO_ROOT/fixtures/personas/sarah-reynolds-coa-stub.json"  "$BUILD_DIR/fixtures/personas/"
cp "$REPO_ROOT/fixtures/personas/sarah-reynolds-debrief.md"     "$BUILD_DIR/fixtures/personas/"

# Write the HF Spaces README with the required YAML frontmatter.
cat > "$BUILD_DIR/README.md" <<'EOF'
---
title: APEX Backend
emoji: 🏎️
colorFrom: green
colorTo: red
sdk: docker
app_port: 7860
pinned: false
license: apache-2.0
short_description: APEX race-engineer backend (FastAPI + LangGraph + Granite)
---

# APEX Backend on HuggingFace Spaces

This Space hosts the **APEX** race-engineer backend for the IBM SkillsBuild AI Builders Challenge May 2026 submission. The frontend lives at <https://apex-one-black.vercel.app>; this Space is the Python FastAPI backend it calls.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET    | `/healthz`              | container readiness probe |
| GET    | `/api/session-context`  | race-session tile feed |
| GET    | `/api/orchestration`    | LangGraph 6-node trace on canonical Sarah Reynolds fixture |
| POST   | `/api/audit-log`        | append-only Guardian audit log (JSONL + flock) |
| POST   | `/api/what-if-replay`   | byte-deterministic V2 cvxpylayers replay |
| POST   | `/api/analyze`          | end-to-end pipeline (JSON file-path input; legacy) |
| POST   | `/api/analyze-upload`   | end-to-end pipeline (multipart upload; wave-48) |

## Honesty surface

- Forecast engine: deterministic seasonal-naive baseline. Frozen TTM r2 wire is gated behind `APEX_ENABLE_TTM=1` Space env (see Phase 4 Day 4 G4 FAIL pivot in [`logs/day-04-g4.md`](https://github.com/StephenSook/apex/blob/main/logs/day-04-g4.md)).
- Narrator engine: OpenRouter Granite 4.1 8B when `OPENROUTER_API_KEY` is set; deterministic template floor otherwise. Honest engine surfaced in the per-node trace detail.
- Orchestration: deterministic 6-node Python state machine modeled on LangGraph semantics; not the `langgraph` package runtime. See [`docs/decision-log.md`](https://github.com/StephenSook/apex/blob/main/docs/decision-log.md) D-067.

## License

Apache 2.0. Repo: <https://github.com/StephenSook/apex>.
EOF

# Auto-install huggingface_hub if missing. Quiet on success.
if ! python3 -c "import huggingface_hub" 2>/dev/null; then
  echo "[deploy] huggingface_hub not installed; running pip3 install ..."
  pip3 install --quiet huggingface_hub
fi

# Push via huggingface_hub. Quote the heredoc delimiter ('PYEOF') so
# nothing in the Python source interpolates from the surrounding shell;
# token + paths come in via env vars at runtime. Prevents the token
# from landing in `ps -ef` output or any shell-trace log.
echo "[deploy] uploading to https://huggingface.co/spaces/$SPACE_REPO ..."
export _APEX_HF_TOKEN="$HF_TOKEN"
export _APEX_BUILD_DIR="$BUILD_DIR"
export _APEX_SPACE_REPO="$SPACE_REPO"
python3 - <<'PYEOF'
import os
from huggingface_hub import HfApi
api = HfApi(token=os.environ["_APEX_HF_TOKEN"])
api.upload_folder(
    folder_path=os.environ["_APEX_BUILD_DIR"],
    repo_id=os.environ["_APEX_SPACE_REPO"],
    repo_type="space",
    commit_message="wave-48 backend deploy",
)
print(f"[deploy] OK: pushed to space {os.environ['_APEX_SPACE_REPO']}")
PYEOF
unset _APEX_HF_TOKEN _APEX_BUILD_DIR _APEX_SPACE_REPO

echo ""
echo "[deploy] Done."
echo "[deploy] Watch build at: https://huggingface.co/spaces/$SPACE_REPO"
echo "[deploy] Test once green: curl https://${SPACE_REPO/\//-}.hf.space/healthz"
