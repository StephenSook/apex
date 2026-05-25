import { describe, expect, it } from "vitest";

import { GET } from "../route";

const mockRequest = () => new Request("https://apex-one-black.vercel.app/api/projector-stage-a");

describe("/api/projector-stage-a V12 Pacejka swap-point stub", () => {
  it("returns 200 with canned-fallback engine + 8 tiers", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      engine: string;
      tiers: ReadonlyArray<unknown>;
      swap_point: string;
    };
    expect(data.engine).toBe("pacejka-v12-canned-fallback");
    expect(data.tiers).toHaveLength(8);
    expect(data.swap_point).toMatch(/Vinh M3-V12/);
  });

  it("ships X-Apex-Projector-Swap-Point header", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.headers.get("X-Apex-Projector-Swap-Point")).toBe("vinh-m3-v12-pacejka-linearization");
  });
});
