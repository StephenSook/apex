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

afterEach(() => {
  cleanup();
});
