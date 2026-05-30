/**
 * Wave-69: strict wire-boundary decoder for the deployed APEX backend's
 * `coaching_report` payload (POST /api/analyze + /api/analyze-upload ->
 * `{ coaching_report, trace, swap_point }`).
 *
 * Unlike the throwing decoders in `api-decode.ts`, this one returns `null`
 * on any shape mismatch so the caller can degrade honestly to the
 * illustrative fixture rather than surfacing an error. The backend's
 * `coaching_report` shares the `CoachingReport` contract field-for-field
 * (verified against the live backend 2026-05-30), so a clean payload
 * decodes 1:1; the strict guards exist purely so a backend contract drift
 * can never render a malformed report on the headline surface.
 *
 * The returned report is stamped `narrative_source: "backend-live"` so the
 * coaching surface labels it as fully backend-computed (real physics +
 * Granite Guardian audit + Granite coaching), distinct from the
 * "granite-live" (live prose over fixture numbers) and "fixture" sources.
 */

import type {
  Citation,
  CoachingReport,
  CornerInsight,
  GuardianAudit,
  NextSessionForecast,
  ProvenanceFooter,
  ReasoningChainStep,
  TuningDelta,
} from "../../shared/types";

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function str(v: unknown): v is string {
  return typeof v === "string";
}
function num(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

const REASONING_STEPS = ["cause", "consequences", "recommendation", "evidence"] as const;

function decodeCitation(raw: unknown): Citation | null {
  if (!isObj(raw) || !str(raw.fia_article) || !str(raw.coa_section)) return null;
  return { fia_article: raw.fia_article, coa_section: raw.coa_section };
}

function decodeCitations(raw: unknown): ReadonlyArray<Citation> | null {
  if (!Array.isArray(raw)) return null;
  const out: Citation[] = [];
  for (const c of raw) {
    const d = decodeCitation(c);
    if (d === null) return null;
    out.push(d);
  }
  return out;
}

function decodeReasoningChain(raw: unknown): ReadonlyArray<ReasoningChainStep> | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: ReasoningChainStep[] = [];
  for (const s of raw) {
    if (!isObj(s) || !str(s.label) || !str(s.content)) continue;
    const step = (REASONING_STEPS as ReadonlyArray<string>).includes(s.step as string)
      ? (s.step as ReasoningChainStep["step"])
      : ("recommendation" as const);
    out.push({ step, label: s.label, content: s.content });
  }
  return out.length > 0 ? out : undefined;
}

function decodeCorner(raw: unknown): CornerInsight | null {
  if (!isObj(raw)) return null;
  if (!str(raw.name) || !num(raw.current_delta_s) || !str(raw.recommendation)) return null;
  const sector = raw.sector === 1 || raw.sector === 2 || raw.sector === 3 ? raw.sector : null;
  if (sector === null) return null;
  const citations = decodeCitations(raw.citations);
  if (citations === null) return null;
  const corner: CornerInsight = {
    name: raw.name,
    sector,
    current_delta_s: raw.current_delta_s,
    recommendation: raw.recommendation,
    citations,
    reasoning_chain: decodeReasoningChain(raw.reasoning_chain),
    ...(str(raw.recommendation_beginner) ? { recommendation_beginner: raw.recommendation_beginner } : {}),
  };
  return corner;
}

function decodeTuning(raw: unknown): TuningDelta | null {
  if (!isObj(raw)) return null;
  if (!str(raw.parameter) || !num(raw.current) || !num(raw.recommended) || !str(raw.unit)) return null;
  const citation = decodeCitation(raw.citation);
  if (citation === null) return null;
  return {
    parameter: raw.parameter,
    current: raw.current,
    recommended: raw.recommended,
    unit: raw.unit,
    citation,
  };
}

function decodeForecast(raw: unknown): NextSessionForecast | null {
  if (!Array.isArray(raw)) return null;
  const out: Array<{ sector_idx: number; mean: number; low: number; high: number }> = [];
  for (const p of raw) {
    if (!isObj(p) || !num(p.sector_idx) || !num(p.mean) || !num(p.low) || !num(p.high)) return null;
    out.push({ sector_idx: p.sector_idx, mean: p.mean, low: p.low, high: p.high });
  }
  // Reject an empty forecast: matches the corners-length guard and stops the
  // AnalyzeFlow summary tab from rendering Math.min(...[]) = Infinity on a
  // sparse backend payload. Empty -> null -> honest fixture fallback upstream.
  return out.length > 0 ? out : null;
}

function strArray(raw: unknown): ReadonlyArray<string> | null {
  if (!Array.isArray(raw) || !raw.every(str)) return null;
  return raw;
}

function decodeAudit(raw: unknown): GuardianAudit | null {
  if (!isObj(raw) || !str(raw.audit_id)) return null;
  const trace = strArray(raw.reasoning_trace);
  if (trace === null) return null;
  if (raw.verdict === "approve") {
    return { verdict: "approve", reasoning_trace: trace, audit_id: raw.audit_id };
  }
  if (raw.verdict === "flag") {
    const concerns = strArray(raw.flagged_concerns);
    if (concerns === null) return null;
    return { verdict: "flag", reasoning_trace: trace, flagged_concerns: concerns, audit_id: raw.audit_id };
  }
  if (raw.verdict === "reject") {
    const blocked = strArray(raw.blocked_recommendations);
    if (blocked === null) return null;
    return { verdict: "reject", reasoning_trace: trace, blocked_recommendations: blocked, audit_id: raw.audit_id };
  }
  return null;
}

function decodeProvenance(raw: unknown): ProvenanceFooter | null {
  if (!isObj(raw) || !str(raw.commit_sha) || !str(raw.generated_at_iso)) return null;
  const mv = raw.model_versions;
  if (!isObj(mv)) return null;
  if (
    !str(mv.granite_docling) ||
    !str(mv.granite_vision) ||
    !str(mv.granite_ttm) ||
    !str(mv.granite_instruct) ||
    !str(mv.granite_guardian)
  ) {
    return null;
  }
  return {
    model_versions: {
      granite_docling: mv.granite_docling,
      granite_vision: mv.granite_vision,
      granite_ttm: mv.granite_ttm,
      granite_instruct: mv.granite_instruct,
      granite_guardian: mv.granite_guardian,
    },
    commit_sha: raw.commit_sha,
    generated_at_iso: raw.generated_at_iso,
  };
}

/**
 * Decode the backend `coaching_report` object into a `CoachingReport`
 * stamped `narrative_source: "backend-live"`. Returns `null` on any shape
 * mismatch so the caller degrades to the fixture report.
 */
export function decodeCoachingReport(raw: unknown): CoachingReport | null {
  if (!isObj(raw) || !str(raw.driver_id)) return null;
  if (!Array.isArray(raw.corners) || raw.corners.length === 0) return null;
  const corners: CornerInsight[] = [];
  for (const c of raw.corners) {
    const d = decodeCorner(c);
    if (d === null) return null;
    corners.push(d);
  }
  const tuning_delta = decodeTuning(raw.tuning_delta);
  if (tuning_delta === null) return null;
  const forecast = decodeForecast(raw.forecast);
  if (forecast === null) return null;
  const audit = decodeAudit(raw.audit);
  if (audit === null) return null;
  const provenance = decodeProvenance(raw.provenance);
  if (provenance === null) return null;
  return {
    driver_id: raw.driver_id,
    corners,
    tuning_delta,
    forecast,
    audit,
    provenance,
    narrative_source: "backend-live",
  };
}
