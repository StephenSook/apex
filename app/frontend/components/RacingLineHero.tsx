"use client";

/**
 * RacingLineHero (wave-46 Phase B revision-2):
 *
 * Replaces the wave-46 Phase B1 R3F implementation that shipped a black-tunnel
 * silhouette with overlapping labels per Stephen visual review 2026-05-26.
 * That implementation hit three pitfalls simultaneously: (1) R3F PerspectiveCamera
 * positioned under the TubeGeometry rendering the unlit dark face; (2) drei <Text>
 * + <Html> labels Z-fought the canvas projection producing text-on-mesh overlap;
 * (3) the TubeGeometry control points produced a hood-like extrusion rather than
 * a recognizable corner racing line.
 *
 * Wave-46 Phase B revision-2 ships a pure 2D SVG implementation with SMIL
 * animateMotion for the car traveling the racing line, CSS keyframe pulse for
 * the apex marker, and stroke-dasharray reveal for the line itself. Labels live
 * OUTSIDE the visualization grid so the racing line is never occluded. Editorial
 * paddock palette preserved verbatim: cream paper #F4EBD8 background, racing-
 * green #0A2818 track surface, clay-red #C1492C racing line + car, amber #D9A441
 * apex pulse, ink #0F1410 labels, IBM Plex Mono numerics.
 *
 * Trade-off: drops ~120 KB gzip of three.js + @react-three/fiber + @react-three/
 * drei dependency footprint; the bundle is now zero-cost beyond the inline SVG.
 * SMIL is supported in every evergreen browser + Safari + iOS. prefers-reduced-
 * motion preserved: car snaps to apex + telemetry ribbon goes static.
 *
 * See `docs/decision-log.md` D-063 for the original Phase B ship-decision and
 * D-064 (forthcoming) for the revision-2 visual-review rollback context.
 */

const TRACK_PATH =
  "M 80 200 C 220 200, 360 200, 480 320 S 720 720, 880 800";

const LINE_PATH =
  "M 80 240 C 240 240, 360 240, 500 360 S 720 700, 880 760";

const APEX_X = 620;
const APEX_Y = 520;

export default function RacingLineHero() {
  return (
    <div className="relative w-full">
      <style>{`
        @keyframes apex-pulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.55); opacity: 0.25; }
        }
        @keyframes line-reveal {
          0% { stroke-dashoffset: 1600; opacity: 0; }
          15% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes telemetry-throttle {
          0%, 30% { transform: scaleX(0.95); }
          45%, 55% { transform: scaleX(0.20); }
          70%, 100% { transform: scaleX(0.85); }
        }
        @keyframes telemetry-brake {
          0%, 30% { transform: scaleX(0.05); }
          45%, 55% { transform: scaleX(0.78); }
          70%, 100% { transform: scaleX(0.10); }
        }
        @keyframes telemetry-steering {
          0% { transform: scaleX(0.05); }
          50% { transform: scaleX(0.85); }
          100% { transform: scaleX(0.20); }
        }
        .apex-pulse-ring {
          transform-origin: ${APEX_X}px ${APEX_Y}px;
          animation: apex-pulse 2.2s ease-in-out infinite;
        }
        .racing-line-reveal {
          stroke-dasharray: 1600;
          animation: line-reveal 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .telemetry-bar { transform-origin: left center; }
        .telemetry-throttle-bar { animation: telemetry-throttle 6s ease-in-out infinite; }
        .telemetry-brake-bar { animation: telemetry-brake 6s ease-in-out infinite; }
        .telemetry-steering-bar { animation: telemetry-steering 6s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .apex-pulse-ring,
          .racing-line-reveal,
          .telemetry-throttle-bar,
          .telemetry-brake-bar,
          .telemetry-steering-bar,
          .racing-car-motion {
            animation: none !important;
          }
          .racing-line-reveal {
            stroke-dasharray: none !important;
          }
        }
      `}</style>

      <svg
        viewBox="0 0 1000 1000"
        role="img"
        aria-label="A racing line through a corner with the apex point marked, animated stylized telemetry visualization. Editorial paddock palette: warm cream paper backdrop, deep racing-green track surface, signal clay-red racing line, amber apex marker."
        className="w-full h-auto block"
      >
        <defs>
          <linearGradient id="line-fade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C1492C" stopOpacity={0.35} />
            <stop offset="40%" stopColor="#C1492C" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#C1492C" stopOpacity={1} />
          </linearGradient>
          <linearGradient id="track-shade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0A2818" />
            <stop offset="100%" stopColor="#06190E" />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={1000} height={1000} fill="#F4EBD8" />

        <g aria-hidden="true">
          {Array.from({ length: 16 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 62.5}
              y1={0}
              x2={i * 62.5}
              y2={1000}
              stroke="#0F1410"
              strokeWidth={0.5}
              opacity={0.06}
            />
          ))}
          {Array.from({ length: 16 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={i * 62.5}
              x2={1000}
              y2={i * 62.5}
              stroke="#0F1410"
              strokeWidth={0.5}
              opacity={0.06}
            />
          ))}
        </g>

        <path
          d={TRACK_PATH}
          stroke="url(#track-shade)"
          strokeWidth={108}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d={TRACK_PATH}
          stroke="#F4EBD8"
          strokeWidth={2}
          strokeDasharray="6 14"
          strokeLinecap="round"
          fill="none"
          opacity={0.65}
        />

        <path
          d={LINE_PATH}
          stroke="url(#line-fade)"
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          className="racing-line-reveal"
        />

        <circle
          cx={APEX_X}
          cy={APEX_Y}
          r={32}
          fill="#D9A441"
          opacity={0.35}
          className="apex-pulse-ring"
        />
        <circle cx={APEX_X} cy={APEX_Y} r={16} fill="#D9A441" />
        <circle cx={APEX_X} cy={APEX_Y} r={6} fill="#0F1410" />

        <g className="racing-car-motion">
          <polygon
            points="-14,-9 14,0 -14,9"
            fill="#C1492C"
            stroke="#0F1410"
            strokeWidth={1.5}
            strokeLinejoin="round"
          >
            <animateMotion
              dur="6s"
              repeatCount="indefinite"
              rotate="auto"
              path={LINE_PATH}
            />
          </polygon>
        </g>

        <g fontFamily="'IBM Plex Mono', ui-monospace, monospace" fill="#0F1410">
          <text
            x={140}
            y={150}
            fontSize={22}
            letterSpacing={4}
            textAnchor="start"
          >
            BRAKING
          </text>
          <line x1={140} y1={162} x2={250} y2={162} stroke="#0F1410" strokeWidth={1.5} />

          <text
            x={APEX_X + 50}
            y={APEX_Y - 35}
            fontSize={22}
            letterSpacing={4}
            textAnchor="start"
          >
            APEX
          </text>
          <line
            x1={APEX_X + 25}
            y1={APEX_Y - 25}
            x2={APEX_X + 45}
            y2={APEX_Y - 30}
            stroke="#0F1410"
            strokeWidth={1.5}
          />

          <text
            x={920}
            y={870}
            fontSize={22}
            letterSpacing={4}
            textAnchor="end"
          >
            EXIT
          </text>
          <line x1={810} y1={862} x2={920} y2={862} stroke="#0F1410" strokeWidth={1.5} />

          <text
            x={920}
            y={95}
            fontSize={14}
            letterSpacing={2.5}
            textAnchor="end"
            opacity={0.6}
          >
            T7 ENTRY, LAP 17
          </text>
        </g>

        <g transform="translate(80, 920)">
          <text
            x={0}
            y={-10}
            fontFamily="'IBM Plex Mono', ui-monospace, monospace"
            fontSize={11}
            letterSpacing={2.5}
            fill="#0F1410"
            opacity={0.7}
          >
            THROTTLE
          </text>
          <rect x={120} y={-20} width={260} height={10} fill="#0F1410" opacity={0.08} />
          <rect
            x={120}
            y={-20}
            width={260}
            height={10}
            fill="#0A2818"
            className="telemetry-bar telemetry-throttle-bar"
          />

          <text
            x={420}
            y={-10}
            fontFamily="'IBM Plex Mono', ui-monospace, monospace"
            fontSize={11}
            letterSpacing={2.5}
            fill="#0F1410"
            opacity={0.7}
          >
            BRAKE
          </text>
          <rect x={520} y={-20} width={180} height={10} fill="#0F1410" opacity={0.08} />
          <rect
            x={520}
            y={-20}
            width={180}
            height={10}
            fill="#C1492C"
            className="telemetry-bar telemetry-brake-bar"
          />

          <text
            x={740}
            y={-10}
            fontFamily="'IBM Plex Mono', ui-monospace, monospace"
            fontSize={11}
            letterSpacing={2.5}
            fill="#0F1410"
            opacity={0.7}
          >
            STEER
          </text>
          <rect x={840} y={-20} width={80} height={10} fill="#0F1410" opacity={0.08} />
          <rect
            x={840}
            y={-20}
            width={80}
            height={10}
            fill="#D9A441"
            className="telemetry-bar telemetry-steering-bar"
          />
        </g>
      </svg>
    </div>
  );
}
