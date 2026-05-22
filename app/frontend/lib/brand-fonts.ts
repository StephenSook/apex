/**
 * Brand-fonts loader shared by every Next.js ImageResponse renderer (banner
 * + OG cards). Fonts fetched from Google Fonts CDN at render time so binary
 * font files stay out of the repo. The exported `BrandFont` record is a
 * strict subtype of next/og's Font option struct (upstream's `FontOptions`,
 * re-exported as `Font` from `next/dist/compiled/@vercel/og/satori/index.d.ts`):
 * every `BrandFont` is assignable to upstream `Font`, but not vice-versa
 * because `BrandFont` makes more fields required + narrows their types.
 * Five narrowings vs upstream:
 *   - `data: Buffer | ArrayBuffer` -> `ArrayBuffer`
 *   - `name: string` -> `"Fraunces" | "PlexSans" | "PlexMono"` (three brand families)
 *   - `weight?: 100..900` -> required `400 | 500 | 600 | 700`
 *   - `style?: "normal" | "italic"` -> required `"normal" | "italic"`
 *   - `lang?: string` -> dropped (we author English-only banners)
 * The narrow form is load-bearing for the OG renderer's `fontFamily`
 * strings. The `next/dist/compiled/...` path is a Next.js-private compiled
 * bundle and may rename across minor versions; a future maintainer wanting
 * the upstream type should install `satori` as a direct dependency and
 * `import type { Font } from "satori"`.
 *
 * Satori only supports TTF / OTF / WOFF (not WOFF2). Google Fonts returns
 * WOFF2 to modern Chrome user-agents; the Wget UA below reliably returns
 * the TTF variant.
 *
 * Both fetches are guarded by AbortSignal.timeout so a slow CDN does not
 * hang the entire render pipeline. Content-Type is sniffed so a 200 HTML
 * error page does not silently become "font data."
 *
 * All four font fetches run in parallel via Promise.all so the cold-render
 * latency is bounded by the slowest single fetch, not the sum of all four.
 */

const GOOGLE_FONTS_UA = "Wget/1.21.4 (linux-gnu)";
const FETCH_TIMEOUT_MS = 10_000;

export interface BrandFont {
  readonly name: "Fraunces" | "PlexSans" | "PlexMono";
  readonly data: ArrayBuffer;
  readonly weight: 400 | 500 | 600 | 700;
  readonly style: "normal" | "italic";
}

interface FontSpec {
  readonly name: BrandFont["name"];
  readonly cssUrl: string;
  readonly weight: BrandFont["weight"];
  readonly style: BrandFont["style"];
}

const FONT_SPECS: ReadonlyArray<FontSpec> = [
  {
    name: "Fraunces",
    cssUrl:
      "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600&display=swap",
    weight: 600,
    style: "normal",
  },
  {
    name: "Fraunces",
    cssUrl:
      "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,700&display=swap",
    weight: 700,
    style: "italic",
  },
  {
    name: "PlexSans",
    cssUrl:
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@500&display=swap",
    weight: 500,
    style: "normal",
  },
  {
    name: "PlexMono",
    cssUrl:
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&display=swap",
    weight: 500,
    style: "normal",
  },
];

async function fetchGoogleFont(cssUrl: string): Promise<ArrayBuffer> {
  const cssResponse = await fetch(cssUrl, {
    headers: { "User-Agent": GOOGLE_FONTS_UA },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!cssResponse.ok) {
    throw new Error(
      `Google Fonts CSS fetch failed (${cssResponse.status}): ${cssUrl}`,
    );
  }
  const css = await cssResponse.text();
  const match = css.match(/src:\s*url\((https:\/\/[^)]+\.(?:ttf|otf|woff))\)/);
  if (!match) {
    throw new Error(
      `Could not extract TTF/OTF/WOFF font URL from Google Fonts CSS at ${cssUrl}. CSS preview: ${css.slice(0, 200)}`,
    );
  }
  const fontUrl = match[1];
  const fontResponse = await fetch(fontUrl, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!fontResponse.ok) {
    throw new Error(`Font file fetch failed (${fontResponse.status}): ${fontUrl}`);
  }
  const contentType = fontResponse.headers.get("content-type") ?? "";
  if (!/font|application\/octet-stream/i.test(contentType)) {
    throw new Error(
      `Font response has unexpected Content-Type "${contentType}" from ${fontUrl}; refusing to use as font data`,
    );
  }
  return fontResponse.arrayBuffer();
}

export async function loadBrandFonts(): Promise<ReadonlyArray<BrandFont>> {
  const buffers = await Promise.all(
    FONT_SPECS.map((spec) => fetchGoogleFont(spec.cssUrl)),
  );
  return FONT_SPECS.map((spec, idx) => ({
    name: spec.name,
    data: buffers[idx],
    weight: spec.weight,
    style: spec.style,
  }));
}
