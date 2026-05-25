"use client";

/**
 * Dropzone: three-slot upload surface for the APEX analyze flow.
 *
 * Slots map 1:1 to the multipart fields in `AnalyzeRequestPayload`
 * (`app/shared/types.ts`):
 *   telemetry_csv (max 50 MB), coa_pdf (max 10 MB), debrief (1000-char cap),
 *   driver_id (slug).
 *
 * Wave-12 refactor lessons (review trail in `docs/pre-mortem.md` rows 21+):
 *   - SlotState is a discriminated union so contradictory states cannot exist.
 *   - DropzoneSubmission field names mirror the backend Pydantic schema verbatim
 *     (snake_case + telemetry_csv / coa_pdf / driver_id) so the parent does not
 *     have to re-map at fetch time.
 *   - Validators reject empty (0-byte) and below-minimum-floor files instead of
 *     silently accepting them.
 *   - Drop handler rejects multi-file drops and directory drops with a clear
 *     error message in the same slot's error region.
 *   - The native file input lives as a sibling of the clickable region so the
 *     two affordances do not double-fire the picker.
 *   - onAnalyze is awaited and any rejection surfaces in a parent-or-self
 *     errorMessage rendered as role=alert near the submit button.
 *
 * WCAG 2.1 AA baseline: Tab+Space/Enter opens the picker, drag-and-drop is
 * enhancement, drag-state changes announce via aria-live polite, errors via
 * role=alert, focus ring inherits :focus-visible from globals.css, reduced
 * motion honored globally.
 */

import {
  useCallback,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import VoiceDebriefInput from "./VoiceDebriefInput";

export type SlotKey = "telemetry" | "coa";

export const MIN_TELEMETRY_BYTES = 1024;
export const MAX_TELEMETRY_BYTES = 50 * 1024 * 1024;
export const MAX_COA_BYTES = 10 * 1024 * 1024;
export const MAX_DEBRIEF_CHARS = 1000;

const TELEMETRY_ACCEPT = ".csv,text/csv";
const COA_ACCEPT = ".pdf,application/pdf";

export type SlotState =
  | { readonly status: "idle" }
  | { readonly status: "drag" }
  | { readonly status: "filled"; readonly file: File }
  | { readonly status: "error"; readonly error: string };

export type DropzoneState = {
  readonly telemetry: SlotState;
  readonly coa: SlotState;
  readonly debrief: string;
  readonly debriefError: string | null;
  readonly driverId: string;
};

export type Action =
  | { type: "setFile"; slot: SlotKey; file: File }
  | { type: "clearFile"; slot: SlotKey }
  | { type: "setError"; slot: SlotKey; error: string }
  | { type: "setDragging"; slot: SlotKey; isDragging: boolean }
  | { type: "setDebrief"; value: string }
  | { type: "setDriverId"; value: string }
  | { type: "resetForm" };

export const idleSlot: SlotState = { status: "idle" };

export const initialState: DropzoneState = {
  telemetry: idleSlot,
  coa: idleSlot,
  debrief: "",
  debriefError: null,
  driverId: "",
};

export function reducer(state: DropzoneState, action: Action): DropzoneState {
  switch (action.type) {
    case "setFile":
      return { ...state, [action.slot]: { status: "filled", file: action.file } satisfies SlotState };
    case "clearFile":
      return { ...state, [action.slot]: idleSlot };
    case "setError":
      return { ...state, [action.slot]: { status: "error", error: action.error } satisfies SlotState };
    case "setDragging": {
      const current = state[action.slot];
      if (action.isDragging) {
        if (current.status === "idle") return { ...state, [action.slot]: { status: "drag" } satisfies SlotState };
        return state;
      }
      if (current.status === "drag") return { ...state, [action.slot]: idleSlot };
      return state;
    }
    case "setDebrief": {
      const over = action.value.length > MAX_DEBRIEF_CHARS;
      return {
        ...state,
        debrief: action.value,
        debriefError: over
          ? `Debrief is ${action.value.length} characters; the cap is ${MAX_DEBRIEF_CHARS}. Trim ${action.value.length - MAX_DEBRIEF_CHARS} before submitting.`
          : null,
      };
    }
    case "setDriverId":
      return { ...state, driverId: action.value };
    case "resetForm":
      return initialState;
    default:
      return state;
  }
}

export function slotLabel(slot: SlotKey): string {
  return slot === "telemetry" ? "telemetry CSV" : "FIA COA PDF";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateTelemetry(file: File): string | null {
  if (file.size === 0) {
    return "File is empty (0 B). Re-export from your data logger and try again.";
  }
  if (file.size < MIN_TELEMETRY_BYTES) {
    return `File is ${formatBytes(file.size)}; raw 50 Hz telemetry CSV is typically several kilobytes or more. Verify your export is complete.`;
  }
  if (file.size > MAX_TELEMETRY_BYTES) {
    return `File is ${formatBytes(file.size)}; the limit is ${formatBytes(MAX_TELEMETRY_BYTES)}.`;
  }
  const name = file.name.toLowerCase();
  const ok =
    name.endsWith(".csv") ||
    file.type === "text/csv" ||
    file.type === "application/vnd.ms-excel";
  if (!ok) {
    return "Telemetry must be a .csv file exported from FastF1, MoTeC, AiM, or compatible.";
  }
  return null;
}

export function validateCoa(file: File): string | null {
  if (file.size === 0) {
    return "File is empty (0 B). Re-export from the FIA portal or your NSA and try again.";
  }
  if (file.size > MAX_COA_BYTES) {
    return `File is ${formatBytes(file.size)}; the limit is ${formatBytes(MAX_COA_BYTES)}.`;
  }
  const name = file.name.toLowerCase();
  const ok = name.endsWith(".pdf") || file.type === "application/pdf";
  if (!ok) {
    return "The COA must be a .pdf as issued by an FIA-affiliated National Sporting Authority.";
  }
  return null;
}

export interface DropzoneSubmission {
  readonly telemetry_csv: File;
  readonly coa_pdf: File;
  readonly debrief: string;
  readonly driver_id: string;
}

export interface DropzoneProps {
  readonly onAnalyze?: (submission: DropzoneSubmission) => void | Promise<void>;
  readonly isSubmitting?: boolean;
  readonly errorMessage?: string;
}

export default function Dropzone({ onAnalyze, isSubmitting = false, errorMessage }: DropzoneProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [announce, setAnnounce] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isFilled = (slot: SlotState): slot is { status: "filled"; file: File } => slot.status === "filled";

  const debriefValid = state.debrief.trim().length > 0 && state.debriefError === null;
  const driverValid = state.driverId.trim().length > 0;
  const canSubmit =
    isFilled(state.telemetry) &&
    isFilled(state.coa) &&
    debriefValid &&
    driverValid &&
    !isSubmitting;

  const announceFor = useCallback((message: string) => setAnnounce(message), []);

  const dispatchFile = useCallback(
    (slot: SlotKey, file: File) => {
      const validator = slot === "telemetry" ? validateTelemetry : validateCoa;
      const err = validator(file);
      if (err) {
        dispatch({ type: "setError", slot, error: err });
        announceFor(`Error in ${slotLabel(slot)}: ${err}`);
      } else {
        dispatch({ type: "setFile", slot, file });
        announceFor(`Selected ${file.name} for ${slotLabel(slot)}.`);
      }
    },
    [announceFor],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmit || !isFilled(state.telemetry) || !isFilled(state.coa)) return;
      setSubmitError(null);
      try {
        await onAnalyze?.({
          telemetry_csv: state.telemetry.file,
          coa_pdf: state.coa.file,
          debrief: state.debrief.trim(),
          driver_id: state.driverId.trim(),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Analysis failed. Try again, or check the COA upload.";
        setSubmitError(message);
        announceFor(`Submit failed: ${message}`);
      }
    },
    [announceFor, canSubmit, onAnalyze, state.coa, state.debrief, state.driverId, state.telemetry],
  );

  const surfaceError = errorMessage ?? submitError;

  return (
    <section
      id="dropzone"
      aria-labelledby="dropzone-title"
      className="border-y border-rule bg-paper-warm"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10 lg:py-24">
        <header className="flex flex-col gap-3 pb-10 lg:pb-12">
          <p className="apex-eyebrow">
            Step 1 of 1 · Bring your own session
          </p>
          <h2
            id="dropzone-title"
            className="font-display text-4xl tracking-tight text-ink sm:text-5xl"
          >
            Upload your session.
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-ink-soft">
            Three artefacts. Telemetry CSV from your data logger, the FIA Certificate
            of Adaptations as a PDF, and a sentence or two from your own debrief.
            APEX returns a corner-by-corner coaching report inside two minutes.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-10"
          aria-describedby="dropzone-privacy"
        >
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            <FileSlot
              slot="telemetry"
              label="Telemetry CSV"
              hint="50 Hz channels: throttle, brake, steering, RPM, lat-G, long-G, speed, gear, time."
              accept={TELEMETRY_ACCEPT}
              maxBytes={MAX_TELEMETRY_BYTES}
              state={state.telemetry}
              dispatch={dispatch}
              dispatchFile={dispatchFile}
              announceFor={announceFor}
            />
            <FileSlot
              slot="coa"
              label="FIA Certificate of Adaptations"
              hint="Granite-Docling parses each of the nine adaptation domains and the simultaneity envelope."
              accept={COA_ACCEPT}
              maxBytes={MAX_COA_BYTES}
              state={state.coa}
              dispatch={dispatch}
              dispatchFile={dispatchFile}
              announceFor={announceFor}
            />
            <DebriefSlot
              value={state.debrief}
              error={state.debriefError}
              dispatch={dispatch}
            />
          </div>

          <DriverIdField value={state.driverId} dispatch={dispatch} />

          <p id="dropzone-privacy" className="font-mono text-xs leading-relaxed text-muted">
            Uploads stay on the APEX backend long enough to produce one coaching report,
            then drop. The FIA COA is parsed into structured JSON and cached against your
            driver identifier so re-runs skip the document pass. No telemetry leaves
            this session.
          </p>

          {surfaceError && (
            <p role="alert" className="font-sans text-sm leading-relaxed text-accent">
              {surfaceError}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              {canSubmit ? "Ready to analyze" : "All four fields required"}
            </p>
            <button
              type="submit"
              disabled={!canSubmit}
              className={
                "rounded-sm px-6 py-3 font-mono text-sm uppercase tracking-wider transition-colors " +
                (canSubmit
                  ? "bg-racing-green text-paper hover:bg-racing-green-deep"
                  : "bg-paper-shadow text-muted cursor-not-allowed")
              }
            >
              {isSubmitting ? "Analyzing..." : "Generate coaching report"}
            </button>
          </div>

          <span aria-live="polite" className="sr-only">
            {announce}
          </span>
        </form>
      </div>
    </section>
  );
}

interface FileSlotProps {
  slot: SlotKey;
  label: string;
  hint: string;
  accept: string;
  maxBytes: number;
  state: SlotState;
  dispatch: React.Dispatch<Action>;
  dispatchFile: (slot: SlotKey, file: File) => void;
  announceFor: (message: string) => void;
}

function FileSlot({ slot, label, hint, accept, maxBytes, state, dispatch, dispatchFile, announceFor }: FileSlotProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();
  const labelId = useId();
  const hintId = useId();
  const errorId = useId();
  const dragDepth = useRef(0);

  const openPicker = useCallback(() => {
    if (!inputRef.current) {
      announceFor(`Picker for ${slotLabel(slot)} is not ready yet. Try again in a moment.`);
      return;
    }
    inputRef.current.click();
  }, [announceFor, slot]);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (file) dispatchFile(slot, file);
    },
    [dispatchFile, slot],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragDepth.current = 0;
      const files = event.dataTransfer.files;
      if (!files || files.length === 0) {
        dispatch({ type: "setDragging", slot, isDragging: false });
        return;
      }
      if (files.length > 1) {
        dispatch({
          type: "setError",
          slot,
          error: `Drop one file at a time (you dropped ${files.length}). Pick the ${slotLabel(slot)} you want and try again.`,
        });
        return;
      }
      const item = event.dataTransfer.items?.[0];
      const entry = item && typeof item.webkitGetAsEntry === "function" ? item.webkitGetAsEntry() : null;
      if (entry && entry.isDirectory) {
        dispatch({
          type: "setError",
          slot,
          error: "Folders cannot be uploaded. Open the folder and drag the file inside it.",
        });
        return;
      }
      dispatchFile(slot, files[0]);
    },
    [dispatch, dispatchFile, slot],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPicker();
      }
    },
    [openPicker],
  );

  const onDragEnter = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragDepth.current += 1;
      if (dragDepth.current === 1) dispatch({ type: "setDragging", slot, isDragging: true });
    },
    [dispatch, slot],
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const onDragLeave = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) dispatch({ type: "setDragging", slot, isDragging: false });
    },
    [dispatch, slot],
  );

  const status = state.status;
  const errorMessage = state.status === "error" ? state.error : null;
  const file = state.status === "filled" ? state.file : null;

  const containerClasses = (() => {
    const base = "relative flex flex-col gap-3 rounded-sm border-2 border-dashed p-6 transition-colors min-h-[180px] cursor-pointer";
    switch (status) {
      case "filled":
        return `${base} border-racing-green bg-paper`;
      case "error":
        return `${base} border-accent bg-paper`;
      case "drag":
        return `${base} border-racing-green bg-paper-shadow`;
      default:
        return `${base} border-rule bg-paper hover:border-racing-green`;
    }
  })();

  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="font-mono text-xs uppercase tracking-wider text-ink-soft">
        {label}
      </span>
      <div
        role="button"
        tabIndex={0}
        aria-labelledby={labelId}
        aria-describedby={`${hintId} ${errorMessage ? errorId : ""}`.trim()}
        onClick={openPicker}
        onKeyDown={onKeyDown}
        onDrop={onDrop}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={containerClasses}
      >
        <SlotBody status={status} file={file} maxBytes={maxBytes} />
      </div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        onChange={onChange}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />
      <p id={hintId} className="text-xs leading-relaxed text-muted">
        {hint}
      </p>
      {errorMessage && (
        <p id={errorId} role="alert" className="text-xs leading-relaxed text-accent">
          {errorMessage}
        </p>
      )}
      {file && (
        <button
          type="button"
          onClick={(event) => {
            // Stop the click from bubbling to the dropzone wrapper above; otherwise
            // clearing the file would immediately reopen the file picker.
            event.stopPropagation();
            dispatch({ type: "clearFile", slot });
            announceFor(`Cleared ${slotLabel(slot)}.`);
          }}
          className="self-start font-mono text-xs uppercase tracking-wider text-ink-soft hover:text-accent hover:underline"
        >
          Remove file
        </button>
      )}
    </div>
  );
}

function SlotBody({
  status,
  file,
  maxBytes,
}: {
  status: SlotState["status"];
  file: File | null;
  maxBytes: number;
}): ReactNode {
  if (status === "filled" && file) {
    return (
      <>
        <span className="font-mono text-xs uppercase tracking-wider text-racing-green">
          Loaded
        </span>
        <span className="font-display text-lg leading-snug text-ink break-words">
          {file.name}
        </span>
        <span className="font-mono text-xs text-muted">
          {formatBytes(file.size)} · {file.type || "type pending"}
        </span>
      </>
    );
  }
  if (status === "drag") {
    return (
      <>
        <span className="font-mono text-xs uppercase tracking-wider text-racing-green">
          Drop to upload
        </span>
        <span className="font-display text-lg text-ink">Release the file here.</span>
      </>
    );
  }
  return (
    <>
      <span className="font-mono text-xs uppercase tracking-wider text-muted">
        Drag a file or press Enter
      </span>
      <span className="font-display text-lg text-ink">Choose a file.</span>
      <span className="font-mono text-xs text-muted">
        Up to {formatBytes(maxBytes)}.
      </span>
    </>
  );
}

interface DebriefSlotProps {
  value: string;
  error: string | null;
  dispatch: React.Dispatch<Action>;
}

function DebriefSlot({ value, error, dispatch }: DebriefSlotProps) {
  const id = useId();
  const hintId = useId();
  const errorId = useId();
  const remaining = MAX_DEBRIEF_CHARS - value.length;
  const overCap = remaining < 0;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-mono text-xs uppercase tracking-wider text-ink-soft">
        Your debrief
      </label>
      <VoiceDebriefInput
        onTranscript={(transcript) => dispatch({ type: "setDebrief", value: transcript })}
      />
      <textarea
        id={id}
        value={value}
        onChange={(event) => dispatch({ type: "setDebrief", value: event.target.value })}
        aria-describedby={`${hintId} ${error ? errorId : ""}`.trim()}
        aria-invalid={overCap}
        rows={6}
        placeholder="Lost the rears mid-corner again. Cannot trail-brake the lever the way I could at the previous round."
        className="min-h-[180px] rounded-sm border-2 border-rule bg-paper p-4 font-sans text-sm leading-relaxed text-ink placeholder:text-muted focus:border-racing-green focus:outline-none"
      />
      <p id={hintId} className="text-xs leading-relaxed text-muted">
        Two or three sentences from your post-session debrief, typed or dictated. APEX
        cross-references the debrief against the forecast envelope and your COA limits.
      </p>
      <p className={`font-mono text-xs ${overCap ? "text-accent" : "text-muted"}`}>
        {overCap ? `${-remaining} over the limit.` : `${remaining} characters left.`}
      </p>
      {error && (
        <p id={errorId} role="alert" className="text-xs leading-relaxed text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

function DriverIdField({
  value,
  dispatch,
}: {
  value: string;
  dispatch: React.Dispatch<Action>;
}) {
  const id = useId();
  const hintId = useId();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="font-mono text-xs uppercase tracking-wider text-ink-soft">
          Driver identifier
        </label>
        <input
          id={id}
          value={value}
          onChange={(event) => dispatch({ type: "setDriverId", value: event.target.value })}
          aria-describedby={hintId}
          placeholder="your-driver-slug-2026"
          className="rounded-sm border-2 border-rule bg-paper p-3 font-mono text-sm text-ink placeholder:text-muted focus:border-racing-green focus:outline-none"
        />
        <p id={hintId} className="text-xs leading-relaxed text-muted">
          Short slug. APEX caches your parsed COA against this identifier so repeat
          sessions skip the document parse step.
        </p>
      </div>
      <ContractFooter />
    </div>
  );
}

function ContractFooter() {
  const items = useMemo(
    () =>
      [
        { name: "Telemetry channels", value: "8 + time" },
        { name: "COA domains parsed", value: "9 of 9" },
        { name: "Round-trip target", value: "< 60 s" },
        { name: "Backend contract", value: "app/shared/types.ts" },
      ] as const,
    [],
  );

  return (
    <dl className="grid gap-2 self-end rounded-sm border border-rule bg-paper p-4 font-mono text-xs leading-relaxed text-muted">
      {items.map((item) => (
        <div key={item.name} className="flex justify-between gap-4">
          <dt>{item.name}</dt>
          <dd className="text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
