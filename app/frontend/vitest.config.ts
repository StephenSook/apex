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
      include: ["app/**", "components/**"],
      exclude: ["node_modules/**", ".next/**", "**/*.config.*", "**/types.ts"],
    },
  },
});
