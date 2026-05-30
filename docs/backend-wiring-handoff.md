# Backend wiring handoff (wave-68, 2026-05-30)

The FastAPI backend is **already deployed and healthy**. "Wiring the other tools live" is a Vercel environment-variable change, not a deploy. This doc is the exact, verified action list.

## Verified state (probed 2026-05-30)

- `GET https://ssookra-apex-backend.hf.space/healthz` -> `{"status":"ok"}`, 200, ~0.27s (warm, not cold-sleeping).
- `GET /api/orchestration` -> `engine: "langgraph-v14-real"`, 6-node LangGraph trace, real `compute_ms`. **Real.**
- `POST /api/analyze` (backend-local Sarah fixtures) -> real `coaching_report`: `current_delta_s: 0.248`, min-speed 38.7 m/s, COA-parsed citations, reasoning chains. **Real physics + LangGraph.**
- `GET /api/tspulse/anomaly` -> `engine: "tspulse-stub"`. **Honest stub** until `APEX_ENABLE_TSPULSE=1` is set on the backend Space.
- Live Granite coaching already confirmed `phase=real` on `/api/openrouter-stream` + `/api/coaching/narrate`.

## Action 1 (cosmetic, the self-heal already covers it): fix the OpenRouter slug

The wave-66 `normalizeGraniteModelSlug` self-heal already corrects the bad `-instruct` slug at runtime, so prod is `phase=real`. To silence the warn at the source, set on Vercel (Settings -> Environment Variables, Production):

```
OPENROUTER_MODEL = ibm-granite/granite-4.1-8b
```

Then redeploy. Confirm: `curl -sD- -o/dev/null -X POST https://apex-one-black.vercel.app/api/openrouter-stream -H 'Content-Type: application/json' -d '{"prompt":"test"}' | grep -i phase` should read `real`.

To do it from the CLI on your machine instead (run with the `!` prefix in Claude Code so the output lands here):

```
! cd "/Users/stephensookra/Desktop/IBM May/app/frontend" && vercel link && printf 'ibm-granite/granite-4.1-8b' | vercel env add OPENROUTER_MODEL production && vercel --prod
```

## Action 2: wire the INTEGRATION tools to the live backend

Set on Vercel (Production), then redeploy:

```
NEXT_PUBLIC_VINH_BACKEND_BASE_URL = https://ssookra-apex-backend.hf.space
```

Then flip the per-tool flags. Every frontend route falls back to its canned fixture on any backend failure, so a flag flip can never 5xx the UI. Flip and verify the response `engine` field per route (a `*-real` engine = genuinely live; a `*-stub` engine = the backend is honestly stubbed for that tool until its model is enabled).

Per-route probe results (each backend route hit directly 2026-05-30):

| Vercel flag | Backend route | Probe result | Flip? |
|---|---|---|---|
| `NEXT_PUBLIC_USE_REAL_BACKEND_V14=1` | `GET /api/orchestration` | HTTP 200, `engine=langgraph-v14-real` | **YES, verified real** |
| `NEXT_PUBLIC_USE_REAL_SESSION_CONTEXT=1` | `GET /api/session-context` | HTTP 200, real tiles | **YES, verified real** |
| `NEXT_PUBLIC_USE_REAL_AUDIT_LOG=1` | `POST /api/audit-log` | HTTP 500 to a generic probe body (payload-shape sensitive) | Optional. Safe to flip (frontend falls back to fixture on 500) but verify the panel shows real data before relying on it |
| `NEXT_PUBLIC_USE_REAL_WHAT_IF_REPLAY=1` | `POST /api/what-if-replay` | HTTP 500 to a generic probe body | Optional, same caveat as audit-log |
| `NEXT_PUBLIC_USE_REAL_TSPULSE=1` | `GET /api/tspulse/anomaly` | HTTP 200, `engine=tspulse-stub` | Honest stub; no real gain until `APEX_ENABLE_TSPULSE=1` on the backend Space |
| `NEXT_PUBLIC_USE_REAL_TIMING_SHEET` / `_RAG` / `_FLOWSTATE` / `_BACKEND_V12` / `_V13` / `_V15` | (no matching route) | **HTTP 404 (not implemented on this Space)** | NO. Flipping makes the frontend fetch a 404 and fall back to fixture; no gain |

**Recommended for submission (verified safe + real):** set `NEXT_PUBLIC_VINH_BACKEND_BASE_URL=https://ssookra-apex-backend.hf.space`, flip `NEXT_PUBLIC_USE_REAL_BACKEND_V14=1` and `NEXT_PUBLIC_USE_REAL_SESSION_CONTEXT=1`, redeploy. That moves the /judges orchestration panel + session-context to the genuinely-live backend (`langgraph-v14-real`). Leave the 404 and stub flags OFF: the honest fixture is the correct state for those until the backend implements / enables them. The headline live pipeline is already shipped via the "Run the canonical demo (live backend)" CTA on /analyze (no flag needed; defaults to this Space).

## The COA contract gap (blocks full user-upload wiring)

`POST /api/analyze-upload` requires `coa` as **JSON** (`json.loads(coa_bytes)`), but the frontend Dropzone collects a **PDF**. So routing the live `/analyze` upload to the backend works only for a JSON COA (the canonical Sarah fixture), not an arbitrary judge PDF. To close this, either:

- add a Granite-Docling PDF -> JSON COA parse step in front of `run_langgraph` on the backend, or
- ship the canonical Sarah COA JSON in the frontend and POST it alongside the user's telemetry for the "Try the canonical demo fixture" CTA only (real backend coaching on the canonical demo; arbitrary PDF uploads keep the current honest fixture-plus-live-narrative path).

Until then, the deployed `/analyze` shows live Granite coaching prose over fixture numbers (honest, labelled). The real physics numbers exist on the backend; this gap is the only thing between the deployed `/analyze` and a fully-live numbers-plus-prose pipeline.
