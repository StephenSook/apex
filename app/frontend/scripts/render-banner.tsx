import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { renderBeMyAppBanner } from "../lib/bemyapp-banner";

async function main() {
  const outputPath = resolve(
    process.cwd(),
    "../../deliverables/bemyapp-banner-1920x600.png",
  );
  const response = await renderBeMyAppBanner();
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(outputPath, buffer);
  console.log(`Wrote ${buffer.byteLength} bytes to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
