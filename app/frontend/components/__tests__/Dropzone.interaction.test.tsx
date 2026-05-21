import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Dropzone from "../Dropzone";

function makeFile(name: string, size: number, type: string): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("Dropzone interaction", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("Remove file click does not bubble to the dropzone wrapper (Codex wave-15 MED guard)", async () => {
    const user = userEvent.setup();
    const onAnalyze = vi.fn();
    const { container } = render(<Dropzone onAnalyze={onAnalyze} />);

    const telemetryInput = container.querySelectorAll<HTMLInputElement>('input[type="file"]')[0];
    const file = makeFile("session.csv", 4096, "text/csv");
    await user.upload(telemetryInput, file);

    // File now loaded; the "Remove file" button is visible.
    const remove = screen.getByRole("button", { name: /Remove file/i });
    // Spy on the file input click; if the Remove click bubbles to the dropzone
    // wrapper, the wrapper's onClick handler would re-trigger inputRef.current.click().
    const inputClickSpy = vi.spyOn(telemetryInput, "click");

    await user.click(remove);

    expect(inputClickSpy).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /Remove file/i })).not.toBeInTheDocument();
  });
});
