import { ImageResponse } from "next/og";

import { loadBrandFonts } from "./brand-fonts";

/**
 * APEX submission slides (16:9, 1920x1080) for the BeMyApp "Issue" and "Magic
 * Solution" file-upload slots. Same editorial brand system + `loadBrandFonts`
 * helper as `./bemyapp-banner`, so the uploaded supporting visuals match the
 * banner exactly. Copy is grounded in the real system and stays consistent
 * with the banner's honest "simultaneity derived" wording (no invented FIA
 * article numbers; the COA is the cited authority).
 *
 * Re-render via `app/frontend/scripts/render-slides.tsx`.
 */

export const SLIDE_SIZE = { width: 1920, height: 1080 } as const;
export const SLIDE_CONTENT_TYPE = "image/png" as const;

const PAPER = "#F4EBD8";
const PAPER_WARM = "#EAE0C7";
const RACING_GREEN = "#0A2818";
const ACCENT = "#C1492C";
const AMBER = "#D9A441";
const INK = "#0F1410";
const INK_SOFT = "#1F2A22";
const MUTED = "#6F6657";

export type SlideName = "issue" | "solution";

export const SLIDE_NAMES: ReadonlyArray<SlideName> = ["issue", "solution"];

export async function renderApexSlide(slide: SlideName): Promise<ImageResponse> {
  const fonts = await loadBrandFonts();
  const body = slide === "issue" ? <IssueSlide /> : <SolutionSlide />;
  return new ImageResponse(body, { ...SLIDE_SIZE, fonts: [...fonts] });
}

function Masthead({ left, right }: { left: string; right: string }) {
  return (
    <div
      style={{
        background: RACING_GREEN,
        color: PAPER_WARM,
        padding: "20px 88px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "PlexMono",
        fontSize: 26,
        letterSpacing: 6,
        textTransform: "uppercase",
        borderBottom: `3px solid ${AMBER}`,
      }}
    >
      <span>{left}</span>
      <span style={{ color: AMBER }}>{right}</span>
    </div>
  );
}

function Footer({
  left,
  center,
  right,
  italic,
}: {
  left?: string;
  center?: string;
  right?: string;
  italic?: boolean;
}) {
  return (
    <div
      style={{
        background: RACING_GREEN,
        color: PAPER_WARM,
        padding: "22px 88px",
        display: "flex",
        alignItems: "center",
        justifyContent: italic ? "center" : "space-between",
        fontFamily: italic ? "Fraunces" : "PlexMono",
        fontStyle: italic ? "italic" : "normal",
        fontWeight: italic ? 700 : 400,
        fontSize: italic ? 34 : 24,
        letterSpacing: italic ? 0 : 2,
        borderTop: `3px solid ${AMBER}`,
      }}
    >
      {italic ? (
        <span style={{ color: PAPER }}>{center}</span>
      ) : (
        <>
          <span>{left}</span>
          <span style={{ color: AMBER }}>{center}</span>
          <span>{right}</span>
        </>
      )}
    </div>
  );
}

function IssueSlide() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: PAPER,
        color: INK,
        fontFamily: "PlexSans",
      }}
    >
      <Masthead left="The Problem" right="Adaptive Motorsport" />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "56px 88px",
        }}
      >
        <div
          style={{
            fontFamily: "Fraunces",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 92,
            lineHeight: 1.04,
            color: INK,
            letterSpacing: -2,
            maxWidth: 1500,
            marginBottom: 28,
          }}
        >
          Adaptive driving gets misread as driver error.
        </div>
        <div
          style={{
            fontSize: 34,
            lineHeight: 1.4,
            color: INK_SOFT,
            maxWidth: 1500,
            marginBottom: 52,
            display: "flex",
          }}
        >
          Every car on a pro grid has a race engineer. Adaptive, veteran, and
          grassroots drivers do not. Generic telemetry tools never read the
          driver's hardware, so they flag COA-permitted inputs as mistakes.
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: 36 }}>
          <ContrastCard
            tone="bad"
            tag="Generic telemetry"
            line1="Simultaneous brake + throttle"
            verdict="Flagged: driver error"
          />
          <ContrastCard
            tone="good"
            tag="APEX"
            line1="Reads the COA hardware spec"
            verdict="Simultaneity derived, within spec"
          />
        </div>
      </div>
      <Footer italic center="The race engineer for the drivers who don't have one." />
    </div>
  );
}

function ContrastCard({
  tone,
  tag,
  line1,
  verdict,
}: {
  tone: "bad" | "good";
  tag: string;
  line1: string;
  verdict: string;
}) {
  const color = tone === "bad" ? ACCENT : RACING_GREEN;
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: tone === "bad" ? "#FBEFE9" : "#E6EDE5",
        border: `3px solid ${color}`,
        borderRadius: 10,
        padding: "28px 32px",
        gap: 14,
      }}
    >
      <div
        style={{
          alignSelf: "flex-start",
          background: color,
          color: PAPER,
          fontFamily: "PlexMono",
          fontSize: 20,
          fontWeight: 500,
          letterSpacing: 2,
          textTransform: "uppercase",
          padding: "6px 14px",
          borderRadius: 4,
          display: "flex",
        }}
      >
        {tag}
      </div>
      <div style={{ fontSize: 32, color: INK, display: "flex" }}>{line1}</div>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Mark tone={tone} color={color} />
        <div
          style={{
            fontFamily: "PlexMono",
            fontSize: 28,
            fontWeight: 500,
            color,
            display: "flex",
          }}
        >
          {verdict}
        </div>
      </div>
    </div>
  );
}

function Mark({ tone, color }: { tone: "bad" | "good"; color: string }) {
  if (tone === "good") {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6 17 l6 6 l13 -15"
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 8 l16 16 M24 8 l-16 16"
        stroke={color}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SolutionSlide() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: PAPER,
        color: INK,
        fontFamily: "PlexSans",
      }}
    >
      <Masthead left="How APEX Works" right="IBM Granite Stack" />
      <div style={{ flex: 1, display: "flex", flexDirection: "row", padding: "44px 88px" }}>
        <div
          style={{
            flex: "0 0 50%",
            display: "flex",
            flexDirection: "column",
            paddingRight: 48,
          }}
        >
          <div
            style={{
              fontFamily: "Fraunces",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 50,
              color: INK,
              marginBottom: 26,
              display: "flex",
            }}
          >
            One pipeline. Identity-aware.
          </div>
          <PipelineStep n="1" title="Driver's COA" desc="Certificate of Adaptations (PDF)" />
          <PipelineStep n="2" title="Docling bridge" desc="Parses the COA hardware spec (pypdf)" />
          <PipelineStep
            n="3"
            title="Differentiable-QP physics"
            desc="cvxpy optimal line + COA-derived simultaneity gate"
          />
          <PipelineStep
            n="4"
            title="Guardian audit"
            desc="Deterministic rule-check; returns an honest error, never a guess"
          />
          <PipelineStep
            n="5"
            title="Narration + stability probe"
            desc="Coaching report, flagged when fragile to sensor drift"
          />
        </div>
        <div
          style={{
            flex: "1 1 50%",
            display: "flex",
            flexDirection: "column",
            paddingLeft: 48,
            borderLeft: `2px solid ${INK}22`,
          }}
        >
          <div
            style={{
              fontFamily: "Fraunces",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 50,
              color: INK,
              marginBottom: 26,
              display: "flex",
            }}
          >
            14 IBM Granite tools, honestly tiered.
          </div>
          <Tier
            color={RACING_GREEN}
            label="3 wired live"
            body="Granite 4.1 8B Instruct (OpenRouter) - Granite 4.0 Nano (WebGPU edge) - Granite Embedding R2 (HF Inference)"
          />
          <Tier
            color={AMBER}
            label="9 integration"
            body="Full UI integration with documented backend swap-points"
          />
          <Tier color={MUTED} label="2 accelerators" body="Build-time tooling" />
          <div
            style={{
              marginTop: 18,
              fontSize: 26,
              color: INK_SOFT,
              lineHeight: 1.35,
              display: "flex",
            }}
          >
            Every tool carries its real status on the live /judges page. The
            labels are the moat.
          </div>
        </div>
      </div>
      <Footer
        left="Live demo - 192 tests in CI"
        center="github.com/StephenSook/apex"
        right="Apache 2.0"
      />
    </div>
  );
}

function PipelineStep({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", marginBottom: 22, gap: 18 }}>
      <div
        style={{
          flex: "0 0 auto",
          width: 50,
          height: 50,
          borderRadius: 50,
          background: RACING_GREEN,
          color: PAPER,
          fontFamily: "PlexMono",
          fontSize: 26,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {n}
      </div>
      <div style={{ display: "flex", flexDirection: "column", paddingTop: 2 }}>
        <div style={{ fontSize: 30, fontWeight: 500, color: INK, display: "flex" }}>{title}</div>
        <div style={{ fontSize: 25, color: MUTED, lineHeight: 1.3, display: "flex", maxWidth: 740 }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

function Tier({ color, label, body }: { color: string; label: string; body: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", marginBottom: 22 }}>
      <div
        style={{
          alignSelf: "flex-start",
          background: color,
          color: color === AMBER ? INK : PAPER,
          fontFamily: "PlexMono",
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: 2,
          textTransform: "uppercase",
          padding: "6px 14px",
          borderRadius: 4,
          marginBottom: 10,
          display: "flex",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 27, color: INK, lineHeight: 1.32, display: "flex", maxWidth: 820 }}>
        {body}
      </div>
    </div>
  );
}
