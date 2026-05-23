/**
 * Friction-ellipse offline projector (D-021 + PLAN row 5.16). Pure-
 * TS radial-projection closed-form scaling an unconstrained
 * (a_long, a_lat) acceleration pair onto the unit friction-ellipse
 * boundary |(a_lat / (mu_y * g), a_long / (mu_x * g))|_2 <= 1 per
 * paper §3.2 Stage 1 friction-ellipse constraint. The "iterate"
 * loop is defensive scaffolding (in case future variants generalize
 * to non-radial projection); for the unit-friction case implemented
 * here, the closed-form scale converges in exactly one pass.
 *
 * Runs offline in the browser (no network) when the WebGPU edge mode
 * is active per D-019 item 1. Server-authoritative reconnect logic
 * (sync-on-reconnect.ts) overwrites the projected value with the
 * canonical server result on reconnect; the edge projection is
 * advisory only (no mechanical recommendations emitted offline per
 * D-021 explicit scope cut).
 *
 * Numerical conditioning:
 * - Non-finite (NaN / Infinity) inputs return null per the wave-37
 *   silent-failure pattern lock; caller renders role=alert.
 * - Already-inside-ellipse inputs return unchanged (no projection
 *   needed; identity short-circuit).
 * - Numerical floor epsilon = 1e-6 on the magnitude denominator
 *   prevents divide-by-zero when both axes simultaneously vanish.
 *   (NOT Tikhonov regularization; the projector is closed-form
 *   radial scaling, not a gradient-based iterate.)
 * - Max 8 defensive iterates with 1e-4 convergence tolerance;
 *   converges on iterate 1 for unit-friction cases (closed-form
 *   radial scale onto the boundary is exact in one step).
 */

const G = 9.81;
const EPSILON = 1e-6;
const MAX_ITERATES = 8;
const CONVERGENCE_TOL = 1e-4;

export interface FrictionEllipseProjection {
  readonly a_long: number;
  readonly a_lat: number;
  readonly iterates: number;
  readonly converged: boolean;
}

/**
 * Project (a_long, a_lat) onto the friction-ellipse boundary. Returns
 * null if any input is non-finite OR mu <= 0 (degenerate). Returns
 * the input pair unchanged with iterates=0 + converged=true when the
 * pair is already inside the ellipse.
 *
 * @param a_long longitudinal acceleration in m/s^2
 * @param a_lat lateral acceleration in m/s^2
 * @param mu friction coefficient (typically 0.8 - 1.4 for racing tires)
 */
export function projectOntoFrictionEllipse(
  a_long: number,
  a_lat: number,
  mu: number,
): FrictionEllipseProjection | null {
  if (!Number.isFinite(a_long) || !Number.isFinite(a_lat) || !Number.isFinite(mu)) {
    return null;
  }
  if (mu <= 0) {
    return null;
  }

  const limit = mu * G;
  const norm = Math.hypot(a_long, a_lat);
  if (norm <= limit) {
    return { a_long, a_lat, iterates: 0, converged: true };
  }

  let proj_long = a_long;
  let proj_lat = a_lat;
  for (let i = 1; i <= MAX_ITERATES; i++) {
    const r = Math.hypot(proj_long, proj_lat);
    const residual = r - limit;
    if (Math.abs(residual) < CONVERGENCE_TOL) {
      return { a_long: proj_long, a_lat: proj_lat, iterates: i, converged: true };
    }
    const scale = limit / Math.max(r, EPSILON);
    proj_long = a_long * scale;
    proj_lat = a_lat * scale;
  }
  // Wave-38 cascade #8 silent-failure-hunter N-4 close-out: final
  // isFinite guard prevents the non-converged branch from emitting
  // NaN / Infinity into the EdgeSummary ReadyPanel under extreme
  // floating-point underflow (a_long = 1e-300 etc.). Caller renders
  // role=alert when this branch returns null.
  if (!Number.isFinite(proj_long) || !Number.isFinite(proj_lat)) {
    return null;
  }
  return { a_long: proj_long, a_lat: proj_lat, iterates: MAX_ITERATES, converged: false };
}
