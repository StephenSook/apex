import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import EngineAgnosticByteEqualityDemo from "../EngineAgnosticByteEqualityDemo";
import {
  V1_NUMPY_TO_TEXT,
  V2_CVXPYLAYERS_TO_TEXT,
  diffByteEquality,
} from "../../lib/byte-equality-fixture";

describe("EngineAgnosticByteEqualityDemo (wave-45 Phase 10 Block G D-050)", () => {
  it("renders engine-line-diff-only PASS pill on the canonical fixture", () => {
    render(<EngineAgnosticByteEqualityDemo />);
    expect(screen.getByText(/ENGINE-LINE-DIFF-ONLY \(D-050 PASS\)/i)).toBeInTheDocument();
  });

  it("renders both V1 + V2 engine headers", () => {
    render(<EngineAgnosticByteEqualityDemo />);
    expect(screen.getByText("ENGINE=numpy_v1")).toBeInTheDocument();
    expect(screen.getByText("ENGINE=cvxpylayers_v2")).toBeInTheDocument();
  });
});

describe("diffByteEquality (wave-45 Phase 10 Block G)", () => {
  it("returns byte-identical when both inputs match exactly", () => {
    const diff = diffByteEquality(V1_NUMPY_TO_TEXT, V1_NUMPY_TO_TEXT);
    expect(diff.status).toBe("byte-identical");
  });

  it("returns engine-line-diff-only on the canonical V1 vs V2 pair", () => {
    const diff = diffByteEquality(V1_NUMPY_TO_TEXT, V2_CVXPYLAYERS_TO_TEXT);
    expect(diff.status).toBe("engine-line-diff-only");
  });

  it("returns content-diff when bodies differ beyond the engine line", () => {
    const tampered = V2_CVXPYLAYERS_TO_TEXT.replace("violations=3", "violations=99");
    const diff = diffByteEquality(V1_NUMPY_TO_TEXT, tampered);
    expect(diff.status).toBe("content-diff");
  });
});
