"use client";

/**
 * RacingLineHero (wave-46 Phase B revision-3):
 *
 * Editorial-publication rebuild per parallel Gemini design agent
 * (DIRECTION A "Velocity, Annotated") + feature-dev:code-architect
 * (full from-scratch rewrite with 960x600 widescreen viewBox, vertical
 * telemetry sidebar, COA-GATE amber annotation as adaptive-driver cue,
 * paper-grain feTurbulence atmospheric depth). Both agents converged
 * on: 2D SVG is the right substrate (R3F not needed; magazine-cover
 * quality lives in composition + typography + restraint); the rev-2
 * problem was not technology but discipline (square viewBox, centered
 * symmetry, infinite-loop animation, evenly-weighted telemetry ribbon
 * at the bottom read as Bloomberg Terminal).
 *
 * Key design moves:
 *  - 960x600 widescreen viewBox replaces 1000x1000 square (diagram -> spread)
 *  - Apex point sits at right-third intersection (rule of thirds, not center)
 *  - Single-shot racing-line draw (stroke-dashoffset 0; animation-fill-mode
 *    forwards) replaces infinite loop; final frame holds confidently
 *  - Telemetry repositioned as vertical sidebar upper-left (editorial inset)
 *    replacing the bottom ribbon (Bloomberg Terminal pattern)
 *  - feTurbulence paper-grain filter overlay on the cream rect (printed-on-
 *    paper register)
 *  - COA-GATE amber annotation adjacent to APEX label = the adaptive-driver
 *    cue, technical-engineering register NOT medical/wheelchair imagery
 *    (per project_apex_override_competitor.md counter-position)
 *  - Pure CSS + SMIL (no framer-motion dependency added; existing animation
 *    primitives sufficient)
 *  - prefers-reduced-motion: car snaps to apex t-position via static
 *    transform, racing line renders complete, all keyframes off
 *
 * Editorial paddock palette preserved: cream paper #F4EBD8 + racing-green
 * #0A2818 + clay-red #C1492C + amber #D9A441 + ink #0F1410. Fraunces
 * variable display font (--font-display CSS var) + IBM Plex Sans + IBM
 * Plex Mono for numerics. No invented FIA Article numbers (HARD-COMPLIANCE).
 */

const TRACK_PATH = "M 60 220 C 280 220, 460 220, 600 320 S 820 500, 920 540";
const LINE_PATH = "M 60 240 C 280 240, 480 240, 620 340 S 820 480, 920 520";

const APEX_X = 720;
const APEX_Y = 410;
const LINE_LENGTH = 1100;

export default function RacingLineHero() {
  return (
    <div className="relative w-full">
      <style>{`
        @keyframes line-draw {
          from { stroke-dashoffset: ${LINE_LENGTH}; opacity: 0; }
          12% { opacity: 1; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes apex-spring {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.18); opacity: 1; }
          80% { transform: scale(0.94); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes apex-breathe {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 0.32; }
        }
        @keyframes telemetry-bar-fill {
          from { transform: scaleX(0); }
          to { transform: scaleX(var(--bar-value)); }
        }
        .hero-line {
          stroke-dasharray: ${LINE_LENGTH};
          stroke-dashoffset: ${LINE_LENGTH};
          animation: line-draw 2.4s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
        }
        .hero-apex-outer {
          transform-origin: ${APEX_X}px ${APEX_Y}px;
          transform: scale(0);
          animation:
            apex-spring 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 0.9s forwards,
            apex-breathe 3.2s ease-in-out 1.6s infinite;
        }
        .hero-apex-core {
          transform-origin: ${APEX_X}px ${APEX_Y}px;
          transform: scale(0);
          animation: apex-spring 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 1.05s forwards;
        }
        .hero-telemetry-bar {
          transform-origin: left center;
          transform: scaleX(0);
          animation: telemetry-bar-fill 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .hero-telemetry-throttle { --bar-value: 0.78; animation-delay: 1.2s; }
        .hero-telemetry-brake { --bar-value: 0.45; animation-delay: 1.4s; }
        .hero-telemetry-steering { --bar-value: 0.62; animation-delay: 1.6s; }
        @media (prefers-reduced-motion: reduce) {
          .hero-line {
            stroke-dasharray: none !important;
            stroke-dashoffset: 0 !important;
            animation: none !important;
            opacity: 1 !important;
          }
          .hero-apex-outer,
          .hero-apex-core {
            transform: scale(1) !important;
            animation: none !important;
            opacity: 1 !important;
          }
          .hero-telemetry-bar {
            animation: none !important;
            transform: scaleX(var(--bar-value)) !important;
          }
          .racing-car-motion {
            display: none !important;
          }
          .racing-car-static {
            display: block !important;
          }
        }
        .racing-car-static { display: none; }
      `}</style>

      <svg
        viewBox="0 0 960 600"
        role="img"
        aria-label="A corner racing line with the apex point marked at the upper-right third. Editorial illustration: warm cream paper backdrop with paper-grain texture, deep racing-green track surface running diagonally from upper-left to lower-right, signal clay-red racing line traced through the apex, amber apex marker, vertical telemetry sidebar in the upper-left showing throttle, brake, and steering percentages. COA-GATE adaptive-control simultaneity annotation visible next to the apex label."
        className="block h-auto w-full"
      >
        <defs>
          <filter id="paper-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="2"
              stitchTiles="stitch"
              seed="7"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.06
                      0 0 0 0 0.08
                      0 0 0 0 0.06
                      0 0 0 0.07 0"
            />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
          <radialGradient id="paper-vignette" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#F4EBD8" stopOpacity="0" />
            <stop offset="65%" stopColor="#F4EBD8" stopOpacity="0" />
            <stop offset="100%" stopColor="#D9CEB8" stopOpacity="0.55" />
          </radialGradient>
          <linearGradient id="track-shade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0A2818" />
            <stop offset="100%" stopColor="#06190E" />
          </linearGradient>
          <linearGradient id="line-fade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C1492C" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#C1492C" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#C1492C" stopOpacity="1" />
          </linearGradient>
        </defs>

        <g aria-hidden="true">
          <rect x={0} y={0} width={960} height={600} fill="#F4EBD8" />
          <rect x={0} y={0} width={960} height={600} filter="url(#paper-grain)" />
        </g>

        <g aria-hidden="true">
          <path
            d={TRACK_PATH}
            stroke="url(#track-shade)"
            strokeWidth={132}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d={TRACK_PATH}
            stroke="#F4EBD8"
            strokeWidth={2}
            strokeDasharray="6 18"
            strokeLinecap="round"
            fill="none"
            opacity={0.55}
          />
          <path
            d={TRACK_PATH}
            stroke="#D9CEB8"
            strokeWidth={1}
            strokeLinecap="round"
            fill="none"
            opacity={0.4}
            transform="translate(0, -68)"
          />
          <path
            d={TRACK_PATH}
            stroke="#D9CEB8"
            strokeWidth={1}
            strokeLinecap="round"
            fill="none"
            opacity={0.4}
            transform="translate(0, 68)"
          />
        </g>

        <path
          d={LINE_PATH}
          stroke="url(#line-fade)"
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
          className="hero-line"
          aria-hidden="true"
        />

        <g aria-hidden="true">
          <circle
            cx={APEX_X}
            cy={APEX_Y}
            r={26}
            fill="#D9A441"
            opacity={0.4}
            className="hero-apex-outer"
          />
          <circle
            cx={APEX_X}
            cy={APEX_Y}
            r={11}
            fill="#D9A441"
            className="hero-apex-core"
          />
          <circle
            cx={APEX_X}
            cy={APEX_Y}
            r={4}
            fill="#0F1410"
            className="hero-apex-core"
          />
        </g>

        <g className="racing-car-motion" aria-hidden="true">
          <polygon
            points="-12,-7 14,0 -12,7 -7,0"
            fill="#C1492C"
            stroke="#0F1410"
            strokeWidth={1.2}
            strokeLinejoin="round"
          >
            <animateMotion
              dur="7s"
              repeatCount="indefinite"
              rotate="auto"
              path={LINE_PATH}
              begin="0.6s"
            />
          </polygon>
          <polygon
            points="-6,-3 4,0 -6,3"
            fill="#F4EBD8"
            opacity={0.5}
            strokeLinejoin="round"
          >
            <animateMotion
              dur="7s"
              repeatCount="indefinite"
              rotate="auto"
              path={LINE_PATH}
              begin="0.6s"
            />
          </polygon>
        </g>

        <g className="racing-car-static" aria-hidden="true">
          <polygon
            points={`${APEX_X - 12},${APEX_Y - 7} ${APEX_X + 14},${APEX_Y} ${APEX_X - 12},${APEX_Y + 7} ${APEX_X - 7},${APEX_Y}`}
            fill="#C1492C"
            stroke="#0F1410"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
        </g>

        <g aria-hidden="true" transform="translate(60, 60)">
          <text
            x={0}
            y={0}
            fontFamily="var(--font-display, Fraunces, Georgia, serif)"
            fontSize={13}
            fontStyle="italic"
            fill="#0F1410"
            opacity={0.55}
          >
            APEX no.07
          </text>
          <text
            x={0}
            y={28}
            fontFamily="'IBM Plex Mono', ui-monospace, monospace"
            fontSize={9}
            letterSpacing={2.4}
            fill="#0F1410"
            opacity={0.75}
          >
            TELEMETRY · T7
          </text>

          <g transform="translate(0, 56)">
            <text
              x={0}
              y={0}
              fontFamily="'IBM Plex Mono', ui-monospace, monospace"
              fontSize={9}
              letterSpacing={2}
              fill="#0F1410"
              opacity={0.6}
            >
              THROTTLE
            </text>
            <rect x={0} y={8} width={140} height={6} fill="#0F1410" opacity={0.08} />
            <rect
              x={0}
              y={8}
              width={140}
              height={6}
              fill="#0A2818"
              className="hero-telemetry-bar hero-telemetry-throttle"
            />
          </g>

          <g transform="translate(0, 92)">
            <text
              x={0}
              y={0}
              fontFamily="'IBM Plex Mono', ui-monospace, monospace"
              fontSize={9}
              letterSpacing={2}
              fill="#0F1410"
              opacity={0.6}
            >
              BRAKE
            </text>
            <rect x={0} y={8} width={140} height={6} fill="#0F1410" opacity={0.08} />
            <rect
              x={0}
              y={8}
              width={140}
              height={6}
              fill="#C1492C"
              className="hero-telemetry-bar hero-telemetry-brake"
            />
          </g>

          <g transform="translate(0, 128)">
            <text
              x={0}
              y={0}
              fontFamily="'IBM Plex Mono', ui-monospace, monospace"
              fontSize={9}
              letterSpacing={2}
              fill="#0F1410"
              opacity={0.6}
            >
              STEER
            </text>
            <rect x={0} y={8} width={140} height={6} fill="#0F1410" opacity={0.08} />
            <rect
              x={0}
              y={8}
              width={140}
              height={6}
              fill="#D9A441"
              className="hero-telemetry-bar hero-telemetry-steering"
            />
          </g>
        </g>

        <g aria-hidden="true" fontFamily="'IBM Plex Mono', ui-monospace, monospace" fill="#0F1410">
          <text
            x={260}
            y={155}
            fontSize={11}
            letterSpacing={3.2}
            textAnchor="start"
          >
            BRAKING
          </text>
          <line x1={260} y1={163} x2={328} y2={163} stroke="#0F1410" strokeWidth={1.2} />

          <text
            x={APEX_X + 44}
            y={APEX_Y - 32}
            fontSize={11}
            letterSpacing={3.2}
            textAnchor="start"
          >
            APEX
          </text>
          <line
            x1={APEX_X + 28}
            y1={APEX_Y - 22}
            x2={APEX_X + 42}
            y2={APEX_Y - 28}
            stroke="#0F1410"
            strokeWidth={1.2}
          />

          <g transform={`translate(${APEX_X + 44}, ${APEX_Y - 12})`}>
            <circle cx={4} cy={-4} r={3} fill="#D9A441" />
            <text
              x={12}
              y={0}
              fontSize={9}
              letterSpacing={2.2}
              fill="#D9A441"
              opacity={0.9}
            >
              COA-GATE
            </text>
          </g>

          <text
            x={910}
            y={555}
            fontSize={11}
            letterSpacing={3.2}
            textAnchor="end"
          >
            EXIT
          </text>
          <line x1={830} y1={547} x2={910} y2={547} stroke="#0F1410" strokeWidth={1.2} />
        </g>

        <g aria-hidden="true">
          <text
            x={910}
            y={55}
            fontFamily="var(--font-display, Fraunces, Georgia, serif)"
            fontSize={22}
            fontStyle="italic"
            fill="#0F1410"
            textAnchor="end"
            opacity={0.85}
          >
            Lap 17, T7 entry +0.08s
          </text>
          <line x1={620} y1={68} x2={910} y2={68} stroke="#0F1410" strokeWidth={0.5} opacity={0.35} />
        </g>

        <rect
          x={0}
          y={0}
          width={960}
          height={600}
          fill="url(#paper-vignette)"
          aria-hidden="true"
        />
      </svg>
    </div>
  );
}
