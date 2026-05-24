# Wave-41 backend-spec handoff (Stream M.3)

Cascade-#11 plan-gap-scanner BLOCKER#2 close-out. Documents 3 backend
endpoints that frontend wave-41 surfaces stub locally + swap to fetch
calls when Vinh ships the FastAPI handlers.

Created: 2026-05-24. Owners: Vinh (backend implementation), Stephen
(frontend integration verification).

## Purpose

Wave-41 frontend ships 3 stubbed surfaces that depend on backend
endpoints not yet implemented:

1. **`/api/audit-log`** (POST) - immutable JSONL audit-chain
   persistence for the GuardianAudit verdict stream. Frontend stub:
   `app/frontend/lib/guardian-audit-log.ts` localStorage emulation
   per the NeuroPit `common/audit.py:34-46` write-before-emit pattern.
2. **`/api/what-if-replay`** (POST) - deterministic counterfactual
   replay engine. Frontend stub: `app/frontend/lib/what-if-replay.ts`
   mocks the V2 cvxpylayers re-projection per the NeuroPit
   `whatif/replay.py:221-266` pattern.
3. **`/api/session-context`** (GET) - live race-event telemetry
   tiles. Frontend stub: `app/frontend/components/RaceEventsTilesRow
   .tsx` 4-tile mock fixture per the RaceMind AI `RaceEventsBar.jsx`
   pattern.

When Vinh's FastAPI handlers ship, the frontend stub-to-fetch swap
is a single-line change per surface; the type contracts stay
identical so consumer sites need zero updates.

## Endpoint 1: POST /api/audit-log

### Purpose

Persist the GuardianAudit verdict chain to a disk-backed JSONL file
with filesystem-append atomicity (POSIX guarantees ≤PIPE_BUF byte
atomicity). The frontend localStorage emulation has known cross-tab
race losses (two tabs concurrently appendVerdict() can race-lose
one verdict); backend disk persistence fixes that for free.

### Request shape

```typescript
// Mirror of app/frontend/lib/guardian-audit-log.ts
// GuardianAuditLogLine interface (camelCase TS -> snake_case JSON
// applies per APEX wire convention).
interface RequestBody {
  readonly written_at_iso: string;       // ISO 8601 UTC with seconds
  readonly commit_sha: string;            // 7-40 char lowercase hex
                                          // OR "unknown" sentinel
  readonly verdict: GuardianAudit          // UI-facing variant
                  | BackendGuardianAudit;  // Backend canonical
}
```

### Response shape

```typescript
interface ResponseBody {
  readonly persisted: true;                // Always true on 200
  readonly line_index: number;             // 0-indexed position in
                                            // the audit log file
  readonly file_path: string;              // Server-side path for
                                            // operator drill-in
}
```

### Status codes

- `200 OK`: persisted; consumer proceeds with the emit.
- `400 Bad Request`: verdict shape rejected by Vinh's Pydantic
  validator. Consumer drops the emit + surfaces the error.
- `413 Payload Too Large`: per-line size budget exceeded. Backend
  caps at 8 KiB per line (matches NeuroPit pattern).
- `503 Service Unavailable`: disk full / IO error. Consumer falls
  back to localStorage emulation + logs warning.

### Persistence guarantees

- **Append atomicity**: ≤PIPE_BUF byte writes are atomic per POSIX
  pipe spec. Backend writes via `fcntl.flock` exclusive lock as
  defense in depth for >4 KiB lines (PIPE_BUF=4096 on macOS+Linux).
- **Durability**: `fsync()` per write before returning 200. Cost:
  ~1ms per call on SSD; acceptable for the ≤10 audit/sec rate the
  Guardian emits.
- **Retention**: rolling 500-line tail per file; older lines rotate
  to `audit-log-YYYY-MM-DD.jsonl.gz` archive. Matches the frontend
  localStorage `MAX_RETAINED_LINES` constant.

## Endpoint 2: POST /api/what-if-replay

### Purpose

Run the V2 cvxpylayers projector over a mutated fixture; return the
re-projected violation log. Frontend stub mocks this with a
hand-rolled BackendPhysicsViolationLog; backend ships the real
differentiable re-projection.

### Request shape

```typescript
// Mirror of app/frontend/lib/what-if-replay.ts WhatIfReplayResult
// minus the resolved result + adds the mutation key for backend
// dispatch.
interface RequestBody {
  readonly baseline_fixture_id: string;    // ConvergenceFixture.id
                                            // from CONVERGENCE_FIXTURES
  readonly mutation_key: string;           // e.g. "coa-overlap-invert"
                                            // per WHAT_IF_MUTATIONS
                                            // catalogue
}
```

### Response shape

```typescript
interface ResponseBody {
  readonly mutated_fixture: ConvergenceFixture;     // Result of
                                                     // mutation.apply()
  readonly replayed_violation_log: BackendPhysicsViolationLog;
                                                     // V2 cvxpylayers
                                                     // re-projection
  readonly schema_version: string;                  // SHAPES_SCHEMA_VERSION
  readonly protocol_version: string;                // DIFFERENTIABLE
                                                     // _PROJECTOR_VERSION
}
```

### Determinism contract

- Same `baseline_fixture_id + mutation_key` MUST produce byte-
  identical `replayed_violation_log` per `violations.py to_text()`
  output across calls.
- Backend MUST use the same frozen-TSFM checkpoint + the same
  cvxpylayers projection coefficients as the production
  `/api/forecast` endpoint; replay is a counterfactual over the
  SAME engine, not a different one.

### Status codes

- `200 OK`: replay successful; consumer renders the mutated +
  replayed result.
- `400 Bad Request`: unknown `baseline_fixture_id` OR `mutation_key`
  not applicable to fixture (e.g. MUTATION_COA_OVERLAP_INVERT
  passed with non-coa_simultaneity fixture). Consumer surfaces the
  structured error per the frontend stub's defensive-throw pattern.
- `503 Service Unavailable`: V2 projector hardware load failed.
  Consumer falls back to V1 NumPy validator OR displays "replay
  unavailable" panel.

## Endpoint 3: GET /api/session-context

### Purpose

Return current race-event telemetry tile data for the /judges
session-context row. Frontend stub uses 4 hard-coded mock tiles;
backend ships real-time data when the operator deploys with a
telemetry feed.

### Response shape

```typescript
// Mirror of app/frontend/components/RaceEventsTilesRow.tsx
// RaceEventsTile + TileSeverity union.
interface ResponseBody {
  readonly tiles: ReadonlyArray<{
    readonly key: string;
    readonly label: string;
    readonly value: string;
    readonly detail: string;
    readonly severity: "ok" | "monitor" | "critical";
  }>;
  readonly fetched_at_iso: string;          // ISO 8601 UTC for
                                             // cache-coherence checks
}
```

### Caching

- Backend caches per-track responses for 30 seconds; track-temp +
  weather + tire-state shift on slower timescales than the cache.
- Session-phase tile updates per-lap; backend invalidates the
  cache on each lap-completion event.

### Status codes

- `200 OK`: tile data returned.
- `404 Not Found`: no active session. Frontend falls back to mock
  fixture for the demo.
- `503 Service Unavailable`: telemetry feed down. Frontend falls
  back to mock + displays "telemetry offline" status badge.

## Frontend swap-points

Frontend modules to update when each endpoint ships (single-line
changes per surface):

| Surface | Stub location | Swap target |
| --- | --- | --- |
| Audit log append | `app/frontend/lib/guardian-audit-log.ts` `appendVerdict()` | Replace localStorage write with `fetch('/api/audit-log', { method: 'POST', body: JSON.stringify(line) })`; keep localStorage as fallback. |
| What-if replay | `app/frontend/lib/what-if-replay.ts` `runWhatIfReplay()` | Replace sync mock with `await fetch('/api/what-if-replay', { method: 'POST', body: JSON.stringify({ baseline_fixture_id, mutation_key }) })`; consumer surface stays sync per the existing `WhatIfReplayResult` shape (consumer wraps in async). |
| Session context | `app/frontend/components/RaceEventsTilesRow.tsx` `MOCK_TILES` | Replace with `useEffect` + fetch hook; tiles array shape stays identical. |

## Decision-log cross-reference

When Vinh ships any of the 3 endpoints, add the corresponding
decision-log entry citing this spec doc + the commit SHA + the
frontend swap-point commit SHA. Pattern: D-### "Stream M.3
endpoint /api/{name} ships."

## Verification

- Cross-tab race no longer happens with backend swap path (POSIX
  filesystem-append atomicity).
- Replay engine determinism verified byte-identical across N calls
  per the same `(baseline_fixture_id, mutation_key)` tuple.
- Session-context tile data updates per lap-completion event.

## Endpoint 4: POST /api/openrouter-stream

### Purpose

Server-side proxy to the OpenRouter `/chat/completions` endpoint with
`stream: true`, parsing SSE frames + emitting plain-text chunks to the
client `useOpenRouterStream` hook. The hook is consumed by the
AICopilotChat surface for single-turn QA against Granite 4.1 8B
Instruct narrator.

Wave-42 Lane F.D shipped the route stub + hook + chat surface; wave-43
cascade-#12 BLOCKER #1 close-out (commit `40e3e22`) added the production
proxy path. Stream M.3 spec extension formalizes the contract.

### Request shape

```typescript
// app/frontend/lib/openrouter-stream.ts hook contract
interface RequestBody {
  readonly prompt: string;
}
```

### Response shape

```
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Transfer-Encoding: chunked

<chunk 1>
<chunk 2>
...
```

Plain-text ReadableStream with chunked content. The hook accumulates
chunks into `state.partial` while `status === "streaming"` and into
`state.full` once `status === "ready"`.

### Status codes

- `200 OK`: streaming response (chunks flow as Granite produces tokens)
- `400 Bad Request`: missing or empty prompt field
- `502 Bad Gateway`: OpenRouter upstream failure (5xx after retry budget)
- `504 Gateway Timeout`: 60s end-to-end stream wall-clock exceeded

### Runtime

`export const runtime = "nodejs"` (NOT Edge). OpenRouter streaming
requires longer-than-Edge-budget connection lifetimes.

### Cache contract

Streaming responses are NOT cached server-side. The chat surface stores
QA pairs in localStorage via AICopilotChat's per-panel history.

### Atomicity contract

Each `POST /api/openrouter-stream` is one independent request; no
shared state. Concurrent requests fan out to independent OpenRouter
connections (rate-limited by OpenRouter's `account-id` budget).

---

## Endpoint 5: POST /api/watson-tts

### Purpose

Server-side synthesis of coaching-report narration via IBM Watson Text
to Speech REST + paddock-radio FFmpeg filter chain (highpass=350 +
lowpass=3000 + compand + volume=1.8) for the walkie-talkie acoustic
profile. Cached MP3 per audit_id under
`public/generated-audio/{audit_id}.mp3`.

Wave-43 Lane E2.1 close-out (commit `3cce2ae`) ships the production
endpoint; Lane E2.2 (commit `6f8ec6e`) activates the production path
in the client WatsonTtsRadio surface (HEAD-probe cache first; POST
to synthesize on cache miss; Web Speech API fallback on any failure).

### Request shape

```typescript
// app/frontend/lib/watson-tts-radio.tsx WatsonTtsRadioProps + Lane E2.2
interface RequestBody {
  readonly audit_id: string;    // [a-zA-Z0-9_-]{1,64}
  readonly text: string;        // < 8000 chars
}
```

### Response shape

```typescript
interface SuccessResponse {
  readonly url: string;         // /generated-audio/{audit_id}.mp3
  readonly cached: boolean;     // true if existing file; false if just-synthesized
}

interface ErrorResponse {
  readonly error: string;       // apex.watson-tts: ... prefix
}
```

### Status codes

- `200 OK`: synthesis or cache hit; client renders `<audio src={url}>`
- `400 Bad Request`: missing env vars (WATSON_TTS_API_KEY +
  WATSON_TTS_URL) OR malformed body OR validation failure
- `502 Bad Gateway`: Watson REST failure (non-2xx, unexpected
  Content-Type, empty body) OR FFmpeg pipeline failure OR cache-write
  failure

### Runtime

`export const runtime = "nodejs"` (NOT Edge). Required for
`child_process.spawn` (FFmpeg) + `node:fs/promises` (cache I/O).

### Cache contract

Cache key = `audit_id` (1-64 chars matching `[a-zA-Z0-9_-]`). Cache
hit is detected via `existsSync({audit_id}.mp3)` BEFORE the Watson
REST call. Atomic write via tempfile rename pattern: write to
`{audit_id}.mp3.tmp` first, rename to `{audit_id}.mp3` after FFmpeg
completes, so HEAD probes from the client never see a half-written
file. `public/generated-audio/` directory is gitignored; the cache is
regenerated on demand (Vercel deployments start with empty cache).

### Atomicity contract

Concurrent requests for the same `audit_id` race-write to distinct
tempfiles (each tempfile is unique by process / request identity in
practice since Node's spawn allocates fresh fds), then both rename
to the same final path. POSIX rename is atomic; whichever request
completes second simply overwrites the first's result with identical
content (same input text + same FFmpeg pipeline = same output bytes).
No partial-file exposure.

### Environment variables (required)

- `WATSON_TTS_API_KEY`: IBM Cloud Watson TTS API key
- `WATSON_TTS_URL`: regional service URL (e.g.
  `https://api.us-south.text-to-speech.watson.cloud.ibm.com`)
- `WATSON_TTS_VOICE`: optional voice ID (defaults to
  `en-US_HenryV3Voice`)

When any of the required vars are missing, the endpoint returns 400 +
the client falls back to the Web Speech API path automatically.

### FFmpeg dependency

The Vercel build environment provides FFmpeg via the build image; for
local development install via `brew install ffmpeg` (macOS) or
`apt-get install ffmpeg` (Linux). The endpoint uses
`child_process.spawn("ffmpeg", ...)` directly (no fluent-ffmpeg or
similar SDK) to avoid the Node-22 simdjson dyld bug documented in the
global three-brain stack memory.

### Verification

- POST `{audit_id: "test-001", text: "test phrase"}` returns 200 +
  `{"url": "/generated-audio/test-001.mp3", "cached": false}` on
  first call.
- Repeat returns 200 + `{"cached": true}`.
- HEAD on the returned URL returns 200 + `Content-Type: audio/mpeg`.
- Browser `<audio src>` element plays the filtered narration with the
  walkie-talkie acoustic profile.

---

Wave-41 cascade-#11 plan-gap-scanner BLOCKER#2 close-out. Wave-43
Lane E2.3 extends with Endpoints 4 + 5 (production path for the
streaming chat + Watson TTS surfaces).
