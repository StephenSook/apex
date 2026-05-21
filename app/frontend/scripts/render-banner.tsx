import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { renderBeMyAppBanner } from "../lib/bemyapp-banner";

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

async function main() {
  // Anchor the output path to this script's own location so the script works
  // regardless of the directory it was invoked from. Resolves to:
  //   <repo-root>/deliverables/bemyapp-banner-1920x600.png
  const outputPath = fileURLToPath(
    new URL("../../../deliverables/bemyapp-banner-1920x600.png", import.meta.url),
  );

  const response = await renderBeMyAppBanner();
  if (response.status !== 200) {
    throw new Error(
      `renderBeMyAppBanner returned non-200 status ${response.status}; aborting write to ${outputPath}`,
    );
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength < 8) {
    throw new Error(
      `Output buffer too small (${buffer.byteLength} bytes); aborting write to ${outputPath}`,
    );
  }
  if (!buffer.subarray(0, 8).equals(PNG_MAGIC)) {
    throw new Error(
      `Output buffer is not a PNG (first 8 bytes: ${buffer.subarray(0, 8).toString("hex")}); aborting write to ${outputPath}`,
    );
  }
  await writeFile(outputPath, buffer);
  console.log(`Wrote ${buffer.byteLength} bytes to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
