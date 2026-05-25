import { describe, expect, it } from "vitest";

import { GET } from "../route";

const mockRequest = () => new Request("https://apex-one-black.vercel.app/api/lips-harness");

describe("/api/lips-harness V15 LIPS swap-point stub", () => {
  it("returns 200 with canned-fallback engine + 4 ablation rows + seed 42", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      engine: string;
      rows: ReadonlyArray<{ configuration: string }>;
      dataset: string;
      seed: number;
      swap_point: string;
    };
    expect(data.engine).toBe("lips-v15-canned-fallback");
    expect(data.rows).toHaveLength(4);
    expect(data.seed).toBe(42);
    expect(data.dataset).toMatch(/Hamilton/);
    expect(data.swap_point).toMatch(/Vinh M3-V15/);
  });

  it("ships X-Apex-Lips-Swap-Point header", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.headers.get("X-Apex-Lips-Swap-Point")).toBe("vinh-m3-v15-lips-4-axis");
  });

  it("rows cover the canonical 4-axis ablation order (zero-shot -> soft-loss -> hard projection -> full 3-track + 8-tier)", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    const data = (await res.json()) as { rows: ReadonlyArray<{ configuration: string }> };
    expect(data.rows[0].configuration).toMatch(/Zero-shot/);
    expect(data.rows[3].configuration).toMatch(/Full 3-track ensemble \+ 8-tier physics/);
  });
});
