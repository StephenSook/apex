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

---

Wave-41 cascade-#11 plan-gap-scanner BLOCKER#2 close-out.
