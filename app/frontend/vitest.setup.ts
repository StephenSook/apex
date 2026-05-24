import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom does not implement scrollIntoView. Define the prototype method once
// before any test renders a component that calls it (AnalyzeFlow's focus-effect
// + any future scroll-on-mount component). Direct assignment is necessary
// because vi.spyOn cannot spy on a property that does not exist yet.
if (!("scrollIntoView" in Element.prototype)) {
  (Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView = vi.fn();
}

// Wave-42 Lane A.F.3 fix-forward 84e001e: jsdom does not implement
// ResizeObserver. Recharts ResponsiveContainer uses it to track parent
// dimensions; without the polyfill the entire AnalyzeFlow component tree
// crashes at mount (empty <div /> rendered). Mock with a no-op stub
// since charts are visual + not asserted against in unit tests
// (Playwright fidelity covers visual rendering).
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}

afterEach(() => {
  cleanup();
});
