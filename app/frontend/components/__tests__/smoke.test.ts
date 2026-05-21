import { describe, expect, it } from "vitest";

describe("vitest smoke test", () => {
  it("runs in jsdom + has expect", () => {
    expect(1 + 1).toBe(2);
    expect(globalThis.document).toBeDefined();
  });
});
