import { describe, expect, it } from "vitest";

import { CORPUS, retrieveChunks } from "../../lib/rag-retrieve";

describe("retrieveChunks lexical retrieval", () => {
  it("returns empty array for empty query", () => {
    expect(retrieveChunks("", 3)).toEqual([]);
  });

  it("returns empty array for query with only stop-words", () => {
    expect(retrieveChunks("the a is and or", 3)).toEqual([]);
  });

  it("returns top-k results sorted by score descending", () => {
    const results = retrieveChunks("physics projection projector tier", 3);
    expect(results.length).toBeLessThanOrEqual(3);
    expect(results.length).toBeGreaterThan(0);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it("retrieves the physics-projector chunk for physics-projection query", () => {
    const results = retrieveChunks("eight-tier physics projector", 3);
    expect(results.length).toBeGreaterThan(0);
    const ids = results.map((r) => r.chunk.id);
    expect(ids).toContain("decision-d016-eight-tier");
  });

  it("retrieves the tri-agent critic chunk for critic-related query", () => {
    const results = retrieveChunks("tri-agent critic verdict", 3);
    expect(results.length).toBeGreaterThan(0);
    const ids = results.map((r) => r.chunk.id);
    expect(ids).toContain("decision-d018-tri-agent");
  });

  it("retrieves the COA simultaneity chunk for COA-related query", () => {
    const results = retrieveChunks("COA hand-controls simultaneity adaptive", 3);
    expect(results.length).toBeGreaterThan(0);
    const ids = results.map((r) => r.chunk.id);
    expect(ids).toContain("methodology-coa-simultaneity");
  });

  it("title-token match boosts score over body-only match", () => {
    const titleMatch = retrieveChunks("Sookra Methodology pillars", 3);
    expect(titleMatch.length).toBeGreaterThan(0);
    expect(titleMatch[0].chunk.id).toBe("methodology-five-pillars");
  });

  it("corpus has at least 10 chunks", () => {
    expect(CORPUS.length).toBeGreaterThanOrEqual(10);
  });
});
