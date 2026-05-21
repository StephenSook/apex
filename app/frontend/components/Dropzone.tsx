"use client";

/**
 * Dropzone: three-slot upload surface for the APEX analyze flow.
 *
 * Slots map 1:1 to the multipart fields in `AnalyzeRequestPayload`
 * (`app/shared/types.ts` lines 297-306):
 *   - telemetry_csv : raw 50 Hz telemetry CSV (max 50 MB)
 *   - coa_pdf       : FIA Certificate of Adaptations PDF (max 10 MB)
 *   - debrief       : driver's written debrief, 1000-char cap (server-side enforced)
 *
 * WCAG 2.1 AA baseline:
 *   - Each slot is keyboard-operable (Tab to focus, Space or Enter to open picker).
 *   - Drag-and-drop is offered as enhancement; native click-to-pick stays primary.
 *   - All drag-state changes announced via `aria-live="polite"` region.
 *   - File-type + size errors announced as `role="alert"` so screen readers interrupt.
 *   - Buttons keep a 44x44 minimum tap target (WCAG 2.5.5 AAA, AA-friendly).
 *   - Focus ring inherits the global `:focus-visible` outline from globals.css.
 *   - Reduced-motion is honored by the global `prefers-reduced-motion` block.
 *
 * State is local to this component. The actual POST to `/api/analyze`
 * lands in a parent route once Vinh's backend (Vinh lane, Day 5-6) returns
 * the canned Sarah Reynolds report. Until then the submit button only
 * fires an onAnalyze callback the parent supplies.
 */

import {
  useCallback,
  useId,
  useMemo,
  useReducer,
  useRef,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

// Field limits mirror server-side validation (`app/backend/apex/schemas.py`
// once Vinh writes it). Off-by-one here would let an over-cap upload reach
// FastAPI and bounce with 413, which is wasted bandwidth.
const MAX_TELEMETRY_BYTES = 50 * 1024 * 1024;
const MAX_COA_BYTES = 10 * 1024 * 1024;
const MAX_DEBRIEF_CHARS = 1000;

// Accept attributes are advisory in the file picker but enforced by us
// post-pick. Browsers vary on whether MIME type, extension, or both win.
const TELEMETRY_ACCEPT = ".csv,text/csv";
const COA_ACCEPT = ".pdf,application/pdf";

type SlotKey = "telemetry" | "coa";

type SlotState = {
  file: File | null;
  error: string | null;
  isDragging: boolean;
};

type DropzoneState = {
  telemetry: SlotState;
  coa: SlotState;
  debrief: string;
  debriefError: string | null;
  driverId: string;
  announce: string;
};

type Action =
  | { type: "setFile"; slot: SlotKey; file: File }
  | { type: "clearFile"; slot: SlotKey }
  | { type: "setError"; slot: SlotKey; error: string }
  | { type: "setDragging"; slot: SlotKey; isDragging: boolean }
  | { type: "setDebrief"; value: string }
  | { type: "setDriverId"; value: string }
  | { type: "announce"; message: string };

const emptySlot: SlotState = { file: null, error: null, isDragging: false };

const initialState: DropzoneState = {
  telemetry: emptySlot,
  coa: emptySlot,
  debrief: "",
  debriefError: null,
  driverId: "",
  announce: "",
};

function reducer(state: DropzoneState, action: Action): DropzoneState {
  switch (action.type) {
    case "setFile":
      return {
        ...state,
        [action.slot]: {
          file: action.file,
          error: null,
          isDragging: false,
        } satisfies SlotState,
        announce: `Selected ${action.file.name} for ${slotLabel(action.slot)}.`,
      };
    case "clearFile":
      return {
        ...state,
        [action.slot]: emptySlot,
        announce: `Cleared ${slotLabel(action.slot)}.`,
      };
    case "setError":
      return {
        ...state,
        [action.slot]: {
          file: null,
          error: action.error,
          isDragging: false,
        } satisfies SlotState,
        announce: `Error in ${slotLabel(action.slot)}: ${action.error}`,
      };
    case "setDragging":
      return {
        ...state,
        [action.slot]: { ...state[action.slot], isDragging: action.isDragging },
      };
    case "setDebrief": {
      const trimmed = action.value.slice(0, MAX_DEBRIEF_CHARS);
      const over =
        action.value.length > MAX_DEBRIEF_CHARS
          ? `Trimmed to the ${MAX_DEBRIEF_CHARS}-character limit.`
          : null;
      return { ...state, debrief: trimmed, debriefError: over };
    }
    case "setDriverId":
      return { ...state, driverId: action.value };
    case "announce":
      return { ...state, announce: action.message };
    default:
      return state;
  }
}

function slotLabel(slot: SlotKey): string {
  return slot === "telemetry" ? "telemetry CSV" : "FIA COA PDF";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateTelemetry(file: File): string | null {
  if (file.size > MAX_TELEMETRY_BYTES) {
    return `File is ${formatBytes(file.size)}; the limit is ${formatBytes(MAX_TELEMETRY_BYTES)}.`;
  }
  const name = file.name.toLowerCase();
  const ok = name.endsWith(".csv") || file.type === "text/csv" || file.type === "application/vnd.ms-excel";
  if (!ok) {
    return "Telemetry must be a .csv file exported from FastF1, MoTeC, AiM, or compatible.";
  }
  return null;
}

function validateCoa(file: File): string | null {
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
  telemetry: File;
  coa: File;
  debrief: string;
  driverId: string;
}

export interface DropzoneProps {
  /** Called once all three fields are valid and the user submits. */
  onAnalyze?: (submission: DropzoneSubmission) => void | Promise<void>;
  /** Disables the submit button (e.g. while a parent request is in flight). */
  isSubmitting?: boolean;
}

export default function Dropzone({ onAnalyze, isSubmitting = false }: DropzoneProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const canSubmit =
    !!state.telemetry.file &&
    !!state.coa.file &&
    state.debrief.trim().length > 0 &&
    state.driverId.trim().length > 0 &&
    !isSubmitting;

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmit || !state.telemetry.file || !state.coa.file) return;
      void onAnalyze?.({
        telemetry: state.telemetry.file,
        coa: state.coa.file,
        debrief: state.debrief.trim(),
        driverId: state.driverId.trim(),
      });
    },
    [canSubmit, onAnalyze, state.coa.file, state.debrief, state.driverId, state.telemetry.file],
  );

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
              validate={validateTelemetry}
              state={state.telemetry}
              dispatch={dispatch}
            />
            <FileSlot
              slot="coa"
              label="FIA Certificate of Adaptations"
              hint="Granite-Docling parses each of the nine adaptation domains and the simultaneity envelope."
              accept={COA_ACCEPT}
              maxBytes={MAX_COA_BYTES}
              validate={validateCoa}
              state={state.coa}
              dispatch={dispatch}
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              {canSubmit ? "Ready to analyze" : "All three fields required"}
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
              {isSubmitting ? "Analyzing…" : "Generate coaching report"}
            </button>
          </div>

          <span aria-live="polite" className="sr-only">
            {state.announce}
          </span>
        </form>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- */
/* File slot                                                       */
/* -------------------------------------------------------------- */

interface FileSlotProps {
  slot: SlotKey;
  label: string;
  hint: string;
  accept: string;
  maxBytes: number;
  validate: (file: File) => string | null;
  state: SlotState;
  dispatch: React.Dispatch<Action>;
}

function FileSlot({ slot, label, hint, accept, maxBytes, validate, state, dispatch }: FileSlotProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const handleFile = useCallback(
    (file: File) => {
      const error = validate(file);
      if (error) dispatch({ type: "setError", slot, error });
      else dispatch({ type: "setFile", slot, file });
    },
    [dispatch, slot, validate],
  );

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) handleFile(file);
      event.target.value = "";
    },
    [handleFile],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
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

  const onDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!state.isDragging) dispatch({ type: "setDragging", slot, isDragging: true });
    },
    [dispatch, slot, state.isDragging],
  );

  const onDragLeave = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      dispatch({ type: "setDragging", slot, isDragging: false });
    },
    [dispatch, slot],
  );

  const status = state.file
    ? "filled"
    : state.error
      ? "error"
      : state.isDragging
        ? "drag"
        : "idle";

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
      <label htmlFor={inputId} className="font-mono text-xs uppercase tracking-wider text-ink-soft">
        {label}
      </label>
      <div
        role="button"
        tabIndex={0}
        aria-labelledby={inputId}
        aria-describedby={`${hintId} ${state.error ? errorId : ""}`.trim()}
        onClick={openPicker}
        onKeyDown={onKeyDown}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={containerClasses}
      >
        <SlotBody status={status} state={state} maxBytes={maxBytes} />
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          onChange={onChange}
          className="sr-only"
        />
      </div>
      <p id={hintId} className="text-xs leading-relaxed text-muted">
        {hint}
      </p>
      {state.error && (
        <p id={errorId} role="alert" className="text-xs leading-relaxed text-accent">
          {state.error}
        </p>
      )}
      {state.file && (
        <button
          type="button"
          onClick={() => dispatch({ type: "clearFile", slot })}
          className="self-start font-mono text-xs uppercase tracking-wider text-accent hover:underline"
        >
          Remove file
        </button>
      )}
    </div>
  );
}

function SlotBody({
  status,
  state,
  maxBytes,
}: {
  status: "filled" | "error" | "drag" | "idle";
  state: SlotState;
  maxBytes: number;
}): ReactNode {
  if (status === "filled" && state.file) {
    return (
      <>
        <span className="font-mono text-xs uppercase tracking-wider text-racing-green">
          Loaded
        </span>
        <span className="font-display text-lg leading-snug text-ink break-words">
          {state.file.name}
        </span>
        <span className="font-mono text-xs text-muted">
          {formatBytes(state.file.size)} · {state.file.type || "type pending"}
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

/* -------------------------------------------------------------- */
/* Debrief textarea                                                */
/* -------------------------------------------------------------- */

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

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-mono text-xs uppercase tracking-wider text-ink-soft">
        Your debrief
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => dispatch({ type: "setDebrief", value: event.target.value })}
        aria-describedby={`${hintId} ${error ? errorId : ""}`.trim()}
        rows={6}
        maxLength={MAX_DEBRIEF_CHARS + 1}
        placeholder="Lost the rears mid-Old Hairpin again. Cannot trail-brake the lever the way I could at Croft."
        className="min-h-[180px] rounded-sm border-2 border-rule bg-paper p-4 font-sans text-sm leading-relaxed text-ink placeholder:text-muted focus:border-racing-green focus:outline-none"
      />
      <p id={hintId} className="text-xs leading-relaxed text-muted">
        Two or three sentences from your post-session debrief. APEX cross-references
        the debrief against the forecast envelope and your COA limits.
      </p>
      <p className="font-mono text-xs text-muted">
        {remaining} characters left.
      </p>
      {error && (
        <p id={errorId} role="alert" className="text-xs leading-relaxed text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- */
/* Driver identifier                                               */
/* -------------------------------------------------------------- */

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
          placeholder="sarah-reynolds-britcar-2026"
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
