import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import RAGCitationBadge from "../RAGCitationBadge";
import type { RAGRetrieval } from "../../lib/rag-retrieve";

// Wave-45 Phase 3 close-out: RAGCitationBadge 3-case spec. Mirrors the
// wave-44 TSPulseAnomalyPanel + ALoRAStatusBadge spec template.

const SAMPLE_RETRIEVALS: ReadonlyArray<RAGRetrieval> = [
  {
    chunk: {
      id: "test-chunk-1",
      source: "docs/architecture-spec.md",
      title: "Test chunk title",
      text: "Test chunk text body content.",
    },
    score: 5.42,
  },
  {
    chunk: {
      id: "test-chunk-2",
      source: "docs/methodology.md",
      title: "Second test chunk",
      text: "Second body content here.",
    },
    score: 3.18,
  },
];

describe("RAGCitationBadge", () => {
  it("renders zero-retrievals fallback copy when retrievals array is empty", () => {
    render(<RAGCitationBadge retrievals={[]} />);
    expect(screen.getByText(/No corpus chunks retrieved/i)).toBeInTheDocument();
  });

  it("renders top-N retrievals with source + title + score + body", () => {
    render(<RAGCitationBadge retrievals={SAMPLE_RETRIEVALS} />);
    expect(screen.getByText(/docs\/architecture-spec\.md/)).toBeInTheDocument();
    expect(screen.getByText(/Test chunk title/)).toBeInTheDocument();
    expect(screen.getByText(/Test chunk text body content/)).toBeInTheDocument();
    expect(screen.getByText(/docs\/methodology\.md/)).toBeInTheDocument();
    expect(screen.getByText(/Second test chunk/)).toBeInTheDocument();
    expect(screen.getByText(/score 5\.42/)).toBeInTheDocument();
    expect(screen.getByText(/score 3\.18/)).toBeInTheDocument();
  });

  it("renders retrieverLabel prop override in the header", () => {
    render(
      <RAGCitationBadge
        retrievals={SAMPLE_RETRIEVALS}
        retrieverLabel="Granite Embedding R2 cosine (Vinh M3-V8 WIRED)"
      />,
    );
    expect(
      screen.getByText(/Granite Embedding R2 cosine \(Vinh M3-V8 WIRED\)/),
    ).toBeInTheDocument();
  });
});
