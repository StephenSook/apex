import { writeFile } from "node:fs/promises";

import { LOGO_VARIANTS, renderApexLogo, type LogoVariant } from "../lib/apex-logo";

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * Renders every logo variant to /tmp for side-by-side review, OR a single
 * variant to an explicit path:
 *   npx tsx scripts/render-logo.tsx                         # all -> /tmp/apex-logo-<variant>.png
 *   npx tsx scripts/render-logo.tsx monogram-green <path>   # one -> <path>
 */
async function renderOne(variant: LogoVariant, outputPath: string) {
  const response = await renderApexLogo(variant);
  if (response.status !== 200) {
    throw new Error(`renderApexLogo(${variant}) returned status ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength < 8 || !buffer.subarray(0, 8).equals(PNG_MAGIC)) {
    throw new Error(`Output for ${variant} is not a valid PNG (${buffer.byteLength} bytes)`);
  }
  await writeFile(outputPath, buffer);
  console.log(`Wrote ${buffer.byteLength} bytes -> ${outputPath}`);
}

async function main() {
  const [variantArg, pathArg] = process.argv.slice(2);
  if (variantArg && pathArg) {
    if (!LOGO_VARIANTS.includes(variantArg as LogoVariant)) {
      throw new Error(
        `Unknown variant "${variantArg}"; expected one of: ${LOGO_VARIANTS.join(", ")}`,
      );
    }
    await renderOne(variantArg as LogoVariant, pathArg);
    return;
  }
  for (const variant of LOGO_VARIANTS) {
    await renderOne(variant, `/tmp/apex-logo-${variant}.png`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
