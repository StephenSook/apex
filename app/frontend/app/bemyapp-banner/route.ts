import { renderBeMyAppBanner } from "../../lib/bemyapp-banner";

/**
 * GET /bemyapp-banner - returns the 1920x600 BeMyApp banner as PNG.
 *
 * Used twice:
 *   1. Iteration during banner-design refinement: hit the route from the
 *      dev server. Pass `Cache-Control: no-cache` from the client (curl -H
 *      or browser hard-refresh) to bypass the success-path cache header.
 *   2. As a verifiable source-of-truth for the committed
 *      `deliverables/bemyapp-banner-1920x600.png`. If the brand evolves, the
 *      committed PNG can be re-rendered via `app/frontend/scripts/render-banner.tsx`
 *      which calls the same renderer directly and bypasses this route.
 *
 * On the success path: Cache-Control allows edge caching for an hour so any
 * production fetch is fast. On error: cache-control no-store + structured
 * JSON body (502) so failures do not cache + clients can see the cause.
 */
export async function GET() {
  try {
    const image = await renderBeMyAppBanner();
    if (image.status !== 200) {
      console.error("[bemyapp-banner] renderer returned non-200 status", {
        status: image.status,
      });
      return new Response(
        JSON.stringify({
          error: "Banner renderer returned non-200 status",
          status: image.status,
          fallback:
            "Use deliverables/bemyapp-banner-1920x600.png at the repo root.",
        }),
        {
          status: 502,
          headers: {
            "content-type": "application/json",
            "cache-control": "no-store",
          },
        },
      );
    }
    const headers = new Headers(image.headers);
    headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
    return new Response(image.body, { status: image.status, headers });
  } catch (error) {
    console.error("[bemyapp-banner] renderer threw", {
      message: error instanceof Error ? error.message : String(error),
    });
    return new Response(
      JSON.stringify({
        error:
          "Banner renderer threw; see server logs for details.",
        cause: error instanceof Error ? error.message : String(error),
        fallback:
          "Use deliverables/bemyapp-banner-1920x600.png at the repo root.",
      }),
      {
        status: 502,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
        },
      },
    );
  }
}
