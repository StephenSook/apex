import { promises as fs } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

// Wave-45 Phase 3 pr-test-analyzer H4 close-out: regression-lock the
// cascade-#24 Next.js 16 Server Component dynamic-import restriction.
// /judges/page.tsx is a Server Component (no "use client"). next/
// dynamic with ssr:false is NOT allowed in Server Components per
// node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md:60.
// Re-introducing ssr:false would only surface at deploy-time build;
// this static-source-assert catches it at vitest time.

describe("app/judges/page.tsx Server Component dynamic-import shape", () => {
  it("does NOT contain `ssr: false` (Next.js 16 Server Component restriction; wave-44 cascade-#24 lock)", async () => {
    const judgesPath = join(process.cwd(), "app/judges/page.tsx");
    const src = await fs.readFile(judgesPath, "utf8");
    // The Client Component shells (JudgesGalaxyMovesShell + JudgesEdgePlaneShell)
    // hold the ssr:false dynamic imports legally. /judges/page.tsx as
    // a Server Component must NOT have any inline dynamic() with ssr:false.
    const inlineDynamicWithSsrFalse = /dynamic\([^)]*\{\s*[^}]*ssr:\s*false/m;
    expect(src).not.toMatch(inlineDynamicWithSsrFalse);
  });
});
