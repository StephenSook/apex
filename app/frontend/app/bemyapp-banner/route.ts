import { renderBeMyAppBanner } from "../../lib/bemyapp-banner";

/**
 * GET /bemyapp-banner - returns the 1920x600 BeMyApp banner as PNG.
 *
 * Used twice:
 *   1. Local iteration during banner-design refinement: hit the route from the
 *      dev server + screenshot for visual review (Playwright MCP or curl).
 *   2. As a verifiable source-of-truth for the committed
 *      `deliverables/bemyapp-banner-1920x600.png`: if the brand evolves the
 *      committed PNG can be re-rendered by running the dev server + curling
 *      `/bemyapp-banner > deliverables/bemyapp-banner-1920x600.png`.
 *
 * Cache header is set so any production fetch is served from CDN; the canonical
 * artifact uploaded to BeMyApp is the committed PNG, not this route response.
 */
export async function GET() {
  const image = await renderBeMyAppBanner();
  const headers = new Headers(image.headers);
  headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
  return new Response(image.body, {
    status: image.status,
    headers,
  });
}
