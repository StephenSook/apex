import { writeFile } from "node:fs/promises";

import { SLIDE_NAMES, renderApexSlide, type SlideName } from "../lib/apex-slides";

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 *   npx tsx scripts/render-slides.tsx                  # both -> /tmp/apex-slide-<name>.png
 *   npx tsx scripts/render-slides.tsx issue <path>     # one  -> <path>
 */
async function renderOne(slide: SlideName, outputPath: string) {
  const response = await renderApexSlide(slide);
  if (response.status !== 200) {
    throw new Error(`renderApexSlide(${slide}) returned status ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength < 8 || !buffer.subarray(0, 8).equals(PNG_MAGIC)) {
    throw new Error(`Output for ${slide} is not a valid PNG (${buffer.byteLength} bytes)`);
  }
  await writeFile(outputPath, buffer);
  console.log(`Wrote ${buffer.byteLength} bytes -> ${outputPath}`);
}

async function main() {
  const [slideArg, pathArg] = process.argv.slice(2);
  if (slideArg && pathArg) {
    if (!SLIDE_NAMES.includes(slideArg as SlideName)) {
      throw new Error(`Unknown slide "${slideArg}"; expected one of: ${SLIDE_NAMES.join(", ")}`);
    }
    await renderOne(slideArg as SlideName, pathArg);
    return;
  }
  for (const slide of SLIDE_NAMES) {
    await renderOne(slide, `/tmp/apex-slide-${slide}.png`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
