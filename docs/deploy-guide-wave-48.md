# APEX Wave-48 Deploy Guide

End-to-end deploy instructions for the wave-48 backend completion + real-model wires. Stephen-action items numbered; Claude-action items annotated with what to ping back about.

## Goal

Move APEX from "canned-fallback wire-flip surface" to "real Granite stack end-to-end" by:

1. Deploying the Vinh-side FastAPI backend to HuggingFace Spaces (Docker SDK, free CPU tier).
2. Setting Vercel env vars so the frontend wire-flip helper points at the deployed backend.
3. Flipping `NEXT_PUBLIC_USE_REAL_*` env flags on Vercel.
4. Adding `HF_TOKEN` (and optionally `OPENROUTER_API_KEY`, `OPENWEATHER_API_KEY`, `REPLICATE_API_TOKEN`) so the real-model paths fire.

Honest position: the frontend route engine field flips from `*-canned-fallback` to the actual engine label only after both env config + deploy land.

## Prerequisites (Stephen action; one-time)

1. **HuggingFace token (write scope)**. Get at https://huggingface.co/settings/tokens. Pin Stephen-side; named `apex-deploy`. Save into:
    - Mac keychain or `~/.zshenv`: `export HF_TOKEN="hf_..."`
    - Vercel project env (later in step 3).

2. **Create HF Space**. Visit https://huggingface.co/new-space:
    - Name: `apex-backend` (or any single-word slug)
    - Owner: `StephenSook`
    - License: `apache-2.0`
    - SDK: **Docker** (NOT Gradio / Streamlit / Static)
    - Hardware: `CPU basic` (free; 16 GB RAM, 2 vCPU; sufficient since OpenRouter handles LLM)
    - Visibility: `Public`
    - Click `Create Space`. The Space URL becomes `https://huggingface.co/spaces/StephenSook/apex-backend`. Live URL becomes `https://stephensook-apex-backend.hf.space`.

3. **OpenRouter token (already set on Vercel prod per wave-43 D-046)**. Verify the production Vercel project still has `OPENROUTER_API_KEY` populated; if not, regenerate at https://openrouter.ai/keys.

4. **Optional: OpenWeather API key**. Sign up at https://openweathermap.org/api (free 1000 calls/day) if you want the `/api/weather-brief` route to serve real forecasts vs the Donington fixture. Save the key for step 3.

5. **Optional: Replicate token**. Sign up at https://replicate.com/account (pay-per-call). Save if you want to wire `/api/timing-sheet-parse` against Granite Vision 4.1 4B for real PDF parsing.

## Deploy steps

### Step 1: Deploy backend to HF Spaces

Run from the repo root:

```bash
export APEX_HF_TOKEN="hf_..." # from prerequisite 1
export APEX_HF_SPACE="StephenSook/apex-backend"
bash scripts/deploy-backend-hf-spaces.sh
```

The script copies `app/backend/apex/`, `requirements.txt`, `Dockerfile`, `fixtures/personas/sarah-reynolds-*`, and writes a HF Spaces README with the Docker SDK frontmatter. Then `huggingface_hub.HfApi.upload_folder()` pushes to the Space.

Watch the HF Spaces dashboard for the build to turn green (~10 minutes first build, ~3 minutes subsequent). On green:

```bash
curl https://stephensook-apex-backend.hf.space/healthz
# {"status":"ok"}

curl https://stephensook-apex-backend.hf.space/api/orchestration | jq .nodes
# 6-node LangGraph trace with real engine labels
```

### Step 2: Vercel env vars (frontend wire-flip)

Visit https://vercel.com/stephens-projects/apex/settings/environment-variables. Add OR update (Production + Preview + Development):

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_VINH_BACKEND_BASE_URL` | `https://stephensook-apex-backend.hf.space` | wire-flip target |
| `NEXT_PUBLIC_USE_REAL_BACKEND_V14` | `1` | LangGraph orchestration route |
| `NEXT_PUBLIC_USE_REAL_BACKEND_V12` | `1` | Pacejka projector route |
| `NEXT_PUBLIC_USE_REAL_BACKEND_V13` | `1` | SCP projector route |
| `NEXT_PUBLIC_USE_REAL_BACKEND_V15` | `1` | LIPS harness route |
| `NEXT_PUBLIC_USE_REAL_RAG` | leave UNSET (or `0`) | Force HF Inference path (Vinh backend doesn't have a RAG endpoint yet) |
| `NEXT_PUBLIC_USE_REAL_TSPULSE` | `1` | TSPulse anomaly route (Vinh swap-point) |
| `NEXT_PUBLIC_USE_REAL_TIMING_SHEET` | `1` | Vision parser route |
| `NEXT_PUBLIC_USE_REAL_SESSION_CONTEXT` | `1` | Session tile feed |
| `NEXT_PUBLIC_USE_REAL_AUDIT_LOG` | `1` | Audit log persistence |
| `NEXT_PUBLIC_USE_REAL_WHAT_IF_REPLAY` | `1` | Mutation replay |
| `HF_TOKEN` | `hf_...` | server-side; enables HF Inference embedding path on /api/rag-retrieve |
| `OPENWEATHER_API_KEY` | `your-key` | optional; enables real OpenWeather path on /api/weather-brief |
| `REPLICATE_API_TOKEN` | `r8_...` | optional; future Replicate Granite Vision wire |

After saving, redeploy: `vercel --prod` (or push a commit to main).

### Step 3: Verify production end-to-end

```bash
# Frontend should return real engine labels (not "*-canned-fallback")
curl https://apex-one-black.vercel.app/api/orchestration | jq .engine
# "langgraph-v14-real"   (not "langgraph-v14-canned-fallback")

curl https://apex-one-black.vercel.app/api/rag-retrieve \
  -X POST -H "Content-Type: application/json" \
  -d '{"query":"COA simultaneity gate"}' | jq .engine
# "granite-embedding-r2-hf-inference"   (if HF_TOKEN is set)
```

Open https://apex-one-black.vercel.app/judges in browser DevTools, expand any /api/* response. The body's `engine` field + the response headers should show the REAL engine name. The `swap_point` strings are now documentation of where the backend code is, not a placeholder for missing wires.

## Acceptance criteria

- `https://stephensook-apex-backend.hf.space/healthz` returns 200.
- `https://stephensook-apex-backend.hf.space/api/orchestration` returns a 6-node trace with `engine: "langgraph-v14-real"`.
- Production frontend at `https://apex-one-black.vercel.app/judges` shows real LangGraph trace data (not canned-fallback) in DevTools.
- `/api/rag-retrieve` returns `engine: "granite-embedding-r2-hf-inference"` when HF_TOKEN is set.
- Voice debrief (when `OPENROUTER_API_KEY` set on the backend Space env) flows through real Granite 4.1 8B Instruct for narration in the LangGraph instruct node.

## Rollback

If HF Space deploy hits a quota issue or fails to boot, the wire-flip helper transparently falls back to the canned-fallback path on any upstream failure (network + 5xx + parse + timeout). No frontend code change required for rollback; the env-flag flip OR `NEXT_PUBLIC_VINH_BACKEND_BASE_URL` unset both restore the canned behaviour.

## Honesty inventory after deploy (engine labels by route)

| Route | Pre-deploy | Post-deploy |
|-------|-----------|-------------|
| `/api/orchestration` | `langgraph-v14-canned-fallback` | `langgraph-v14-real` |
| `/api/projector-stage-a` | `pacejka-canned-fallback` | `pacejka-real` (when V12 swap-point lands on backend) |
| `/api/projector-stage-b` | `scp-canned-fallback` | `scp-real` (when V13 swap-point lands on backend) |
| `/api/lips-harness` | `lips-canned-fallback` | `lips-real` (when V15 swap-point lands on backend) |
| `/api/rag-retrieve` | `rag-v8-canned-fallback` | `granite-embedding-r2-hf-inference` |
| `/api/timing-sheet-parse` | `canned-fixture` | `granite-vision-4.1-4b` (when V1 swap-point lands; or wire to Replicate) |
| `/api/tspulse/anomaly` | `tspulse-canned-fallback` | `tspulse-real` (when V7 swap-point lands on backend) |
| `/api/session-context` | `session-context-canned-fallback` | `session-context-real` |
| `/api/audit-log` | `audit-log-canned-fallback` | `audit-log-real` |
| `/api/what-if-replay` | `what-if-canned-fallback` | `what-if-real` |
| `/api/weather-brief` | `demo-fixture-donington-park` | `openweather-3h-forecast` (when OPENWEATHER_API_KEY set) |
| `/api/sim-rig/stream` | `simulator-sine-deterministic` (no V2 swap; honest as labelled) | unchanged unless Vinh ships V2 |
| `/api/openrouter-stream` | `granite-4.1-8b-real` when env set; stub-coaching otherwise | unchanged (already real path on prod) |
| `/api/coach-code` | `granite-4.1-8b-real` when env set; canned otherwise | unchanged |
| `/api/watson-tts` | `watson-real` when env set; web-speech-api on browser fallback | unchanged |

After step 3, **10 of 14 routes flip to real engine labels**. 4 routes (`/api/coach-code`, `/api/openrouter-stream`, `/api/watson-tts`, `/api/sim-rig/stream`) were already shipping the real path when their env was set, or in the sim-rig case ARE honestly labelled as a deterministic simulator (no V2 hardware wire exists or is expected to exist within the demo window).
