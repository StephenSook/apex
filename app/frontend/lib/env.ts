/**
 * Wave-46 Phase 2 + Phase 3 + Phase 5 + Phase 6 feature-flag scaffold.
 * Centralized env-var reader for the V12-V15 Vinh-backend wire-flips +
 * Granite 4.1 3B + Granite Speech wire-flips. Each flag defaults false
 * (canned-fallback path) so the frontend ships canned-JSON until Vinh's
 * backend deploy lands; per-flip switch is atomic + reversible per
 * `~/.claude/plans/all-right-i-want-rippling-moon.md` Q3 decision.
 *
 * Convention. Public-readable Vercel env vars use the `NEXT_PUBLIC_` prefix
 * so the same flag value reads identically server-side + client-side.
 * Server-only secrets (no `NEXT_PUBLIC_` prefix) are NOT covered here.
 *
 * Base URL convention. When `NEXT_PUBLIC_USE_REAL_BACKEND_V*` is "1",
 * the route fetches `${NEXT_PUBLIC_VINH_BACKEND_BASE_URL}${endpoint}`.
 * If the base URL is unset the route falls back to canned even when the
 * flag is on; this prevents a misconfigured deploy from cascading to
 * 502s across /judges + /lips-harness panels.
 */

export function readFlag(name: string): boolean {
  const raw = process.env[name];
  return raw === "1" || raw === "true";
}

export function readUrl(name: string): string | null {
  const raw = process.env[name];
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

const FLAG_NAMES = {
  USE_REAL_BACKEND_V12: "NEXT_PUBLIC_USE_REAL_BACKEND_V12",
  USE_REAL_BACKEND_V13: "NEXT_PUBLIC_USE_REAL_BACKEND_V13",
  USE_REAL_BACKEND_V14: "NEXT_PUBLIC_USE_REAL_BACKEND_V14",
  USE_REAL_BACKEND_V15: "NEXT_PUBLIC_USE_REAL_BACKEND_V15",
  USE_REAL_TIMING_SHEET: "NEXT_PUBLIC_USE_REAL_TIMING_SHEET",
  USE_REAL_TSPULSE: "NEXT_PUBLIC_USE_REAL_TSPULSE",
  USE_REAL_RAG: "NEXT_PUBLIC_USE_REAL_RAG",
  USE_REAL_FLOWSTATE: "NEXT_PUBLIC_USE_REAL_FLOWSTATE",
  USE_GRANITE_3B_ROUTING: "NEXT_PUBLIC_USE_GRANITE_3B_ROUTING",
  USE_GRANITE_SPEECH: "NEXT_PUBLIC_USE_GRANITE_SPEECH",
  MELLEA_IVR_ENABLED: "MELLEA_IVR_ENABLED",
} as const;

export type FeatureFlag = keyof typeof FLAG_NAMES;

export function getVinhBackendBaseUrl(): string | null {
  return readUrl("NEXT_PUBLIC_VINH_BACKEND_BASE_URL");
}

export function shouldUseRealBackend(flag: FeatureFlag): boolean {
  if (!readFlag(FLAG_NAMES[flag])) return false;
  if (getVinhBackendBaseUrl() === null) return false;
  return true;
}
