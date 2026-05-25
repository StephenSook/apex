import { describe, expect, it } from "vitest";

import { GET } from "../route";

const mockRequest = () => new Request("https://apex-one-black.vercel.app/api/projector-stage-b");

describe("/api/projector-stage-b V13 SCP 3-iterate swap-point stub", () => {
  it("returns 200 with canned-fallback engine + 3 iterates", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      engine: string;
      iterates: ReadonlyArray<unknown>;
      final_residual: number;
      swap_point: string;
    };
    expect(data.engine).toBe("scp-v13-canned-fallback");
    expect(data.iterates).toHaveLength(3);
    expect(data.final_residual).toBeLessThan(0.01);
    expect(data.swap_point).toMatch(/Vinh M3-V13/);
  });

  it("ships X-Apex-Projector-Swap-Point header", async () => {
    const res = await GET(mockRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.headers.get("X-Apex-Projector-Swap-Point")).toBe("vinh-m3-v13-scp-3-iterate");
  });
});
