# Honeycomb.io OpenTelemetry runbook (wave-51c)

Stephen-action runbook for flipping the APEX backend OTel scaffolding from console-only output to a live production observability dashboard at Honeycomb.io free tier.

## What this gives you

A queryable dashboard at https://ui.honeycomb.io that shows every HTTP request to the APEX backend on the HF Space, broken into the per-node LangGraph span tree (ingestion + RAG + projection + guardian + instruct + provenance) with latency, error rate, and trace-by-trace drill-down.

Use this in the BeMyApp submission story as the OVERRIDE-counter on the production-grade-instrumentation judging axis. Override ships OpenTelemetry scaffolding; APEX ships a public dashboard receiving live spans.

## Prerequisites

- HF Space deployed at https://huggingface.co/spaces/ssookra/apex-backend per `docs/deploy-guide-wave-48.md`
- HF write token already configured for the Space

## Total cost

Free. Honeycomb free tier: 20 million events per month, 60 days retention, no credit card, no time limit.

## Total Stephen time

About 25 minutes end to end, broken roughly:
- 5 min Honeycomb signup + environment creation
- 5 min copy API key + set 3 env vars on the HF Space
- 10 min Factory rebuild wait + first request smoke
- 5 min open dashboard + verify a span landed

## Steps

### 1. Sign up at Honeycomb

1. Go to https://www.honeycomb.io/signup
2. Sign up with the gmail Stephen uses for the submission
3. On the team-creation prompt, set team name to `apex`
4. Skip the integrations onboarding wizard; do step 2 manually below

### 2. Create the production environment + ingest API key

1. From the Honeycomb home screen, click the environment switcher in the top-left (it will say "test" by default)
2. Click "Manage Environments"
3. Click "Create Environment"
4. Name: `production`
5. Click into the new `production` environment
6. Click Settings (gear icon, bottom-left) then "API Keys"
7. Click "Create API Key"
8. Name: `apex-backend-hf-space`
9. Permissions: leave default ("Send Events" + "Create Datasets" both on)
10. Copy the long ingest key now. Honeycomb will not show it again.

### 3. Set the 3 env vars on the HF Space

1. Go to https://huggingface.co/spaces/ssookra/apex-backend/settings
2. Scroll to "Variables and Secrets"
3. Click "New secret" three times, setting each of:

| Key | Value |
|---|---|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `https://api.honeycomb.io` |
| `OTEL_EXPORTER_OTLP_HEADERS` | `x-honeycomb-team=<paste-key-from-step-2>` |
| `APEX_OTEL_ENABLED` | `1` |

Note: the endpoint is the BASE URL without a path. The OTel Python SDK appends `/v1/traces` automatically per the OTLP HTTP spec. Do not append it manually or you will get a 404 from Honeycomb.

Note: the headers value is a single string `x-honeycomb-team=<key>` (NO quotes, NO spaces). If you have multiple key-value pairs separate them with commas: `key1=val1,key2=val2`.

### 4. Factory rebuild the HF Space

1. Still on the Space settings page, scroll to the very bottom
2. Click "Factory rebuild"
3. Confirm. The Space rebuilds the container from scratch (forces requirements.txt re-install so the OTLP exporter package lands).
4. Wait about 5-8 minutes. Watch the build log; success looks like "Container running".

### 5. Send a smoke request

From any browser or terminal:

```
curl https://ssookra-apex-backend.hf.space/healthz
curl https://ssookra-apex-backend.hf.space/api/orchestration
```

The first hits a trivial route; the second runs the full LangGraph 6-node pipeline which is the path you want spans for.

### 6. Verify spans landed in Honeycomb

1. Go to https://ui.honeycomb.io
2. Top-left environment switcher: confirm `production` is selected
3. Left sidebar: click "Datasets"
4. You should see a new dataset named `apex-backend` (matches the `OTEL_SERVICE_NAME` default)
5. Click into it
6. Click "Query" tab
7. Default query shows the last 2 hours of spans. You should see your two smoke requests.
8. Click any row to see the full span tree.

If no dataset appears after 5 minutes:
- Check the Space build log for `OTel OTLP HTTP exporter active` log line at startup
- Verify the API key was copied without trailing whitespace
- Verify the endpoint is `https://api.honeycomb.io` not `https://api.honeycomb.io:443/v1/traces`
- Ping Claude with the build log snippet

### 7. Public dashboard link for the submission

1. In the Honeycomb dataset, click "Boards" left-sidebar
2. Click "New Board" then name it `APEX production observability`
3. Add a few panels: P95 latency over time, error rate, top routes by traffic
4. Click "Share" then toggle "Public link"
5. Copy the public URL
6. Ping Claude with the URL so it can wire the "Production observability" link on /judges per the wave-48 OVERRIDE-counter plan

## After this lands

Claude will:
- Add a "Production observability" link block on /judges pointing at the public Honeycomb board URL
- Update SUBMISSION.md story to mention the public OTel dashboard as the OVERRIDE-counter on the production-grade-instrumentation axis
- Note the wave-51c fix in `docs/decision-log.md` (constructor-arg-vs-env-var Honeycomb bug closed)

## Reference

- Honeycomb OTel docs: https://docs.honeycomb.io/send-data/opentelemetry/
- Honeycomb OTLP HTTP ingest spec: https://api.honeycomb.io/v1/traces
- OTel Python SDK env var spec: https://opentelemetry.io/docs/specs/otel/protocol/exporter/
- APEX OTel scaffolding source: `app/backend/apex/observability.py`
- APEX wave-48 OTel decision: `docs/decision-log.md` D-067
