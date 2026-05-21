import { describe, expect, it } from "vitest";

import {
  formatBytes,
  idleSlot,
  initialState,
  MAX_COA_BYTES,
  MAX_DEBRIEF_CHARS,
  MAX_TELEMETRY_BYTES,
  MIN_TELEMETRY_BYTES,
  reducer,
  slotLabel,
  validateCoa,
  validateTelemetry,
  type DropzoneState,
} from "../Dropzone";

function makeFile(name: string, size: number, type = ""): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

describe("formatBytes", () => {
  it("renders sub-KB values as bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("renders KB at one decimal", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1024 * 1023)).toBe("1023.0 KB");
  });

  it("renders MB at one decimal", () => {
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
    expect(formatBytes(1024 * 1024 * 50)).toBe("50.0 MB");
  });
});

describe("slotLabel", () => {
  it("maps the two slot keys to their human labels", () => {
    expect(slotLabel("telemetry")).toBe("telemetry CSV");
    expect(slotLabel("coa")).toBe("FIA COA PDF");
  });
});

describe("validateTelemetry", () => {
  it("rejects 0-byte files (silent-failure B1 regression guard)", () => {
    const file = makeFile("session.csv", 0, "text/csv");
    expect(validateTelemetry(file)).toMatch(/empty/i);
  });

  it("rejects files below the minimum-bytes floor", () => {
    const file = makeFile("session.csv", MIN_TELEMETRY_BYTES - 1, "text/csv");
    const result = validateTelemetry(file);
    expect(result).toMatch(/several kilobytes/i);
  });

  it("rejects files larger than the upper limit", () => {
    const file = makeFile("session.csv", MAX_TELEMETRY_BYTES + 1, "text/csv");
    expect(validateTelemetry(file)).toMatch(/limit is/i);
  });

  it("accepts a real-looking csv by extension only (no MIME type set)", () => {
    const file = makeFile("session.csv", MIN_TELEMETRY_BYTES + 100);
    expect(validateTelemetry(file)).toBeNull();
  });

  it("accepts a csv with text/csv MIME and no extension match", () => {
    const file = makeFile("session", MIN_TELEMETRY_BYTES + 100, "text/csv");
    expect(validateTelemetry(file)).toBeNull();
  });

  it("accepts a csv with the Windows-Excel MIME quirk (application/vnd.ms-excel)", () => {
    const file = makeFile("session", MIN_TELEMETRY_BYTES + 100, "application/vnd.ms-excel");
    expect(validateTelemetry(file)).toBeNull();
  });

  it("rejects a wrong-extension file (e.g. .pdf masquerading)", () => {
    const file = makeFile("session.pdf", MIN_TELEMETRY_BYTES + 100, "application/pdf");
    expect(validateTelemetry(file)).toMatch(/\.csv file/);
  });
});

describe("validateCoa", () => {
  it("rejects 0-byte PDFs", () => {
    const file = makeFile("coa.pdf", 0, "application/pdf");
    expect(validateCoa(file)).toMatch(/empty/i);
  });

  it("rejects PDFs over the 10MB cap", () => {
    const file = makeFile("coa.pdf", MAX_COA_BYTES + 1, "application/pdf");
    expect(validateCoa(file)).toMatch(/limit is/i);
  });

  it("accepts a real-looking PDF by extension", () => {
    const file = makeFile("coa.pdf", 4096);
    expect(validateCoa(file)).toBeNull();
  });

  it("accepts a PDF with application/pdf MIME and no extension match", () => {
    const file = makeFile("coa", 4096, "application/pdf");
    expect(validateCoa(file)).toBeNull();
  });

  it("rejects a non-PDF (e.g. .csv masquerading)", () => {
    const file = makeFile("coa.csv", 4096, "text/csv");
    expect(validateCoa(file)).toMatch(/\.pdf/);
  });
});

describe("reducer", () => {
  it("idleSlot is the initial state for both slots", () => {
    expect(initialState.telemetry).toEqual(idleSlot);
    expect(initialState.coa).toEqual(idleSlot);
    expect(initialState.debrief).toBe("");
    expect(initialState.debriefError).toBeNull();
    expect(initialState.driverId).toBe("");
  });

  it("setFile transitions a slot to filled with the file ref", () => {
    const file = makeFile("session.csv", 2048, "text/csv");
    const next = reducer(initialState, { type: "setFile", slot: "telemetry", file });
    expect(next.telemetry.status).toBe("filled");
    if (next.telemetry.status === "filled") {
      expect(next.telemetry.file).toBe(file);
    }
  });

  it("clearFile returns slot to idle", () => {
    const file = makeFile("session.csv", 2048, "text/csv");
    const filled = reducer(initialState, { type: "setFile", slot: "telemetry", file });
    const cleared = reducer(filled, { type: "clearFile", slot: "telemetry" });
    expect(cleared.telemetry.status).toBe("idle");
  });

  it("setError transitions slot to error and overwrites any prior file", () => {
    const file = makeFile("session.csv", 2048, "text/csv");
    const filled = reducer(initialState, { type: "setFile", slot: "telemetry", file });
    const errored = reducer(filled, { type: "setError", slot: "telemetry", error: "boom" });
    expect(errored.telemetry.status).toBe("error");
    if (errored.telemetry.status === "error") {
      expect(errored.telemetry.error).toBe("boom");
    }
  });

  it("setDragging only transitions idle <-> drag, not filled <-> drag", () => {
    const draggedFromIdle = reducer(initialState, {
      type: "setDragging",
      slot: "telemetry",
      isDragging: true,
    });
    expect(draggedFromIdle.telemetry.status).toBe("drag");

    const file = makeFile("session.csv", 2048, "text/csv");
    const filled = reducer(initialState, { type: "setFile", slot: "telemetry", file });
    const filledDragAttempt = reducer(filled, {
      type: "setDragging",
      slot: "telemetry",
      isDragging: true,
    });
    expect(filledDragAttempt.telemetry.status).toBe("filled");
  });

  it("setDebrief records under-cap value with no error", () => {
    const next = reducer(initialState, { type: "setDebrief", value: "Lost the rears." });
    expect(next.debrief).toBe("Lost the rears.");
    expect(next.debriefError).toBeNull();
  });

  it("setDebrief flags an over-cap value but does NOT silently trim it", () => {
    const longValue = "a".repeat(MAX_DEBRIEF_CHARS + 50);
    const next = reducer(initialState, { type: "setDebrief", value: longValue });
    expect(next.debrief).toBe(longValue);
    expect(next.debriefError).toMatch(/Trim 50/);
  });

  it("setDriverId stores the driver identifier", () => {
    const next = reducer(initialState, { type: "setDriverId", value: "sarah-reynolds-britcar-2026" });
    expect(next.driverId).toBe("sarah-reynolds-britcar-2026");
  });

  it("resetForm restores the canonical initial state", () => {
    const file = makeFile("session.csv", 2048, "text/csv");
    let state: DropzoneState = reducer(initialState, { type: "setFile", slot: "telemetry", file });
    state = reducer(state, { type: "setDebrief", value: "Pasted a long debrief here." });
    state = reducer(state, { type: "setDriverId", value: "foo" });
    expect(state).not.toEqual(initialState);
    const reset = reducer(state, { type: "resetForm" });
    expect(reset).toEqual(initialState);
  });
});
