import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules/**", ".next/**", "dist/**"],
    coverage: {
      reporter: ["text", "json-summary"],
      // Frontend coverage targets app/ + components/. Shared contract types at
      // `../shared/types.ts` are deliberately out of scope: types-only files have
      // no runtime coverage signal and Vinh's Pydantic mirror is the real test
      // surface (covered by backend pytest once Vinh scaffolds it).
      include: ["app/**", "components/**"],
      exclude: ["node_modules/**", ".next/**", "**/*.config.*"],
      // Auto-restore vi.fn/spyOn between tests so prototype-stub leaks (Element.scrollIntoView)
      // do not bleed across worker-reuse boundaries.
    },
    restoreMocks: true,
  },
});
