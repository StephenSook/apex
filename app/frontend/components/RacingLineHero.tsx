"use client";

/**
 * RacingLineHero (wave-46 Phase B revision-4):
 *
 * Iteration on revision-3 per Stephen visual review 2026-05-26: rev-3
 * shipped the editorial composition (paper grain, COA-GATE annotation,
 * Fraunces italic eyebrow, asymmetric apex) but the SVG rendered too
 * small inside its column and the upper-left vertical telemetry sidebar
 * lost the rev-2 bottom-stacked telemetry-bar rhythm that Stephen
 * preferred. Rev-4 restores the bottom telemetry strip (THROTTLE racing-
 * green + BRAKE clay-red + STEER amber) while keeping every rev-3
 * editorial gain.
 *
 * Key rev-4 moves:
 *  - viewBox bumped to 1000x900 (was 960x600). Taller aspect lets the
 *    hero fill a column without becoming a letterbox sliver.
 *  - Track stroke width bumped to 160 (was 132); track is the hero, not
 *    a thin diagram element.
 *  - APEX/BRAKING/EXIT labels bumped to 24px (were 11px). Judges can
 *    read these from across a room now.
 *  - Apex marker outer ring r=42, inner r=18, dot r=7 (was 26/11/4).
 *    The killshot focal point looks like one.
 *  - Bottom telemetry strip restored. Three stacked horizontal bars at
 *    the bottom (THROTTLE green / BRAKE clay-red / STEER amber), each
 *    with a 14px mono label, bar height 12px, bar width 280px. Rev-3's
 *    upper-left vertical sidebar is removed.
 *  - Single-shot stroke-dashoffset draw + spring marker + breathe +
 *    SMIL animateMotion car preserved from rev-3.
 *  - Paper-grain feTurbulence + radial vignette + COA-GATE amber
 *    annotation + Fraunces italic eyebrow preserved from rev-3.
 *  - prefers-reduced-motion fallback preserved.
 *
 * Editorial paddock palette unchanged: cream paper #F4EBD8 + racing-
 * green #0A2818 + clay-red #C1492C + amber #D9A441 + ink #0F1410.
 * Fraunces variable display (--font-display) + IBM Plex Mono numerics.
 * Pure CSS + SMIL; no framer-motion / R3F dependency added.
 */

const TRACK_PATH = "M 60 220 C 280 220, 480 220, 620 360 S 880 660, 940 720";
const LINE_PATH = "M 60 240 C 280 240, 500 240, 640 380 S 880 640, 940 700";

const APEX_X = 740;
const APEX_Y = 480;
const LINE_LENGTH = 1300;

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
        @keyframes throttle-cycle {
          0% { transform: scaleX(0.95); }
          14% { transform: scaleX(0.82); }
          28% { transform: scaleX(0.18); }
          42% { transform: scaleX(0.08); }
          54% { transform: scaleX(0.42); }
          72% { transform: scaleX(0.78); }
          88% { transform: scaleX(0.92); }
          100% { transform: scaleX(0.95); }
        }
        @keyframes brake-cycle {
          0% { transform: scaleX(0.06); }
          14% { transform: scaleX(0.22); }
          28% { transform: scaleX(0.88); }
          42% { transform: scaleX(0.72); }
          54% { transform: scaleX(0.34); }
          72% { transform: scaleX(0.08); }
          100% { transform: scaleX(0.06); }
        }
        @keyframes steer-cycle {
          0% { transform: scaleX(0.10); }
          22% { transform: scaleX(0.28); }
          42% { transform: scaleX(0.82); }
          54% { transform: scaleX(0.88); }
          72% { transform: scaleX(0.46); }
          100% { transform: scaleX(0.10); }
        }
        @keyframes throttle-spark {
          0% { transform: translateX(266px); opacity: 0.9; }
          14% { transform: translateX(230px); }
          28% { transform: translateX(50px); opacity: 0.4; }
          42% { transform: translateX(22px); opacity: 0.35; }
          54% { transform: translateX(118px); opacity: 0.7; }
          72% { transform: translateX(218px); opacity: 0.9; }
          88% { transform: translateX(258px); }
          100% { transform: translateX(266px); opacity: 0.9; }
        }
        @keyframes brake-spark {
          0% { transform: translateX(17px); opacity: 0.4; }
          14% { transform: translateX(62px); }
          28% { transform: translateX(246px); opacity: 0.95; }
          42% { transform: translateX(202px); }
          54% { transform: translateX(96px); opacity: 0.6; }
          72% { transform: translateX(22px); opacity: 0.35; }
          100% { transform: translateX(17px); opacity: 0.4; }
        }
        @keyframes steer-spark {
          0% { transform: translateX(28px); opacity: 0.4; }
          22% { transform: translateX(78px); }
          42% { transform: translateX(230px); opacity: 0.9; }
          54% { transform: translateX(246px); opacity: 1; }
          72% { transform: translateX(128px); opacity: 0.65; }
          100% { transform: translateX(28px); opacity: 0.4; }
        }
        @keyframes spark-breath {
          0%, 100% { filter: drop-shadow(0 0 2px currentColor); }
          50% { filter: drop-shadow(0 0 8px currentColor); }
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
          will-change: transform;
        }
        .hero-telemetry-throttle {
          animation: throttle-cycle 7s ease-in-out 1.2s infinite;
        }
        .hero-telemetry-brake {
          animation: brake-cycle 7s ease-in-out 1.2s infinite;
        }
        .hero-telemetry-steering {
          animation: steer-cycle 7s ease-in-out 1.2s infinite;
        }
        .hero-telemetry-spark {
          will-change: transform, opacity;
          transform-origin: 0 0;
        }
        .hero-telemetry-throttle-spark {
          color: #0A2818;
          animation:
            throttle-spark 7s ease-in-out 1.2s infinite,
            spark-breath 1.6s ease-in-out infinite;
        }
        .hero-telemetry-brake-spark {
          color: #C1492C;
          animation:
            brake-spark 7s ease-in-out 1.2s infinite,
            spark-breath 1.6s ease-in-out infinite;
        }
        .hero-telemetry-steering-spark {
          color: #D9A441;
          animation:
            steer-spark 7s ease-in-out 1.2s infinite,
            spark-breath 1.6s ease-in-out infinite;
        }
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
          .hero-telemetry-throttle {
            animation: none !important;
            transform: scaleX(0.82) !important;
          }
          .hero-telemetry-brake {
            animation: none !important;
            transform: scaleX(0.46) !important;
          }
          .hero-telemetry-steering {
            animation: none !important;
            transform: scaleX(0.68) !important;
          }
          .hero-telemetry-throttle-spark {
            animation: none !important;
            transform: translateX(229px) !important;
            opacity: 0.9 !important;
          }
          .hero-telemetry-brake-spark {
            animation: none !important;
            transform: translateX(128px) !important;
            opacity: 0.9 !important;
          }
          .hero-telemetry-steering-spark {
            animation: none !important;
            transform: translateX(190px) !important;
            opacity: 0.9 !important;
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
        viewBox="0 0 1000 900"
        role="img"
        aria-label="A corner racing line with the apex point marked at the upper-right third. Editorial illustration: warm cream paper backdrop with paper-grain texture, deep racing-green track surface running diagonally from upper-left to lower-right, signal clay-red racing line traced through the apex, amber apex marker with breathing pulse, bottom telemetry strip showing throttle (racing-green) at 82 percent, brake (clay-red) at 46 percent, and steering (amber) at 68 percent. COA-GATE adaptive-control simultaneity annotation visible next to the apex label."
        className="block h-auto w-full"
        preserveAspectRatio="xMidYMid meet"
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
          <radialGradient id="paper-vignette" cx="50%" cy="50%" r="78%">
            <stop offset="0%" stopColor="#F4EBD8" stopOpacity="0" />
            <stop offset="65%" stopColor="#F4EBD8" stopOpacity="0" />
            <stop offset="100%" stopColor="#D9CEB8" stopOpacity="0.6" />
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
          <rect x={0} y={0} width={1000} height={900} fill="#F4EBD8" />
          <rect x={0} y={0} width={1000} height={900} filter="url(#paper-grain)" />
        </g>

        <g aria-hidden="true">
          <path
            d={TRACK_PATH}
            stroke="url(#track-shade)"
            strokeWidth={160}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d={TRACK_PATH}
            stroke="#F4EBD8"
            strokeWidth={3}
            strokeDasharray="8 22"
            strokeLinecap="round"
            fill="none"
            opacity={0.6}
          />
        </g>

        <path
          d={LINE_PATH}
          stroke="url(#line-fade)"
          strokeWidth={8}
          strokeLinecap="round"
          fill="none"
          className="hero-line"
          aria-hidden="true"
        />

        <g aria-hidden="true">
          <circle
            cx={APEX_X}
            cy={APEX_Y}
            r={42}
            fill="#D9A441"
            opacity={0.4}
            className="hero-apex-outer"
          />
          <circle
            cx={APEX_X}
            cy={APEX_Y}
            r={18}
            fill="#D9A441"
            className="hero-apex-core"
          />
          <circle
            cx={APEX_X}
            cy={APEX_Y}
            r={7}
            fill="#0F1410"
            className="hero-apex-core"
          />
        </g>

        <g className="racing-car-motion" aria-hidden="true">
          <polygon
            points="-18,-11 22,0 -18,11 -10,0"
            fill="#C1492C"
            stroke="#0F1410"
            strokeWidth={1.6}
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
            points="-10,-5 6,0 -10,5"
            fill="#F4EBD8"
            opacity={0.55}
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
            points={`${APEX_X - 18},${APEX_Y - 11} ${APEX_X + 22},${APEX_Y} ${APEX_X - 18},${APEX_Y + 11} ${APEX_X - 10},${APEX_Y}`}
            fill="#C1492C"
            stroke="#0F1410"
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        </g>

        <g aria-hidden="true" fontFamily="'IBM Plex Mono', ui-monospace, monospace" fill="#0F1410">
          <text
            x={220}
            y={130}
            fontSize={26}
            letterSpacing={5}
            textAnchor="start"
          >
            BRAKING
          </text>
          <line x1={220} y1={146} x2={350} y2={146} stroke="#0F1410" strokeWidth={2} />

          <text
            x={APEX_X + 62}
            y={APEX_Y - 48}
            fontSize={26}
            letterSpacing={5}
            textAnchor="start"
          >
            APEX
          </text>
          <line
            x1={APEX_X + 40}
            y1={APEX_Y - 34}
            x2={APEX_X + 60}
            y2={APEX_Y - 42}
            stroke="#0F1410"
            strokeWidth={2}
          />

          <g transform={`translate(${APEX_X + 62}, ${APEX_Y - 18})`}>
            <circle cx={6} cy={-5} r={5} fill="#D9A441" />
            <text
              x={18}
              y={0}
              fontSize={12}
              letterSpacing={3}
              fill="#D9A441"
              opacity={0.92}
            >
              COA-GATE
            </text>
          </g>

          <text
            x={950}
            y={760}
            fontSize={26}
            letterSpacing={5}
            textAnchor="end"
          >
            EXIT
          </text>
          <line x1={840} y1={748} x2={950} y2={748} stroke="#0F1410" strokeWidth={2} />
        </g>

        <g aria-hidden="true">
          <text
            x={950}
            y={62}
            fontFamily="var(--font-display, Fraunces, Georgia, serif)"
            fontSize={28}
            fontStyle="italic"
            fill="#0F1410"
            textAnchor="end"
            opacity={0.88}
          >
            Lap 17, T7 entry +0.08s
          </text>
          <line x1={580} y1={78} x2={950} y2={78} stroke="#0F1410" strokeWidth={0.8} opacity={0.4} />
        </g>

        <g aria-hidden="true" transform="translate(60, 820)">
          <g>
            <text
              x={0}
              y={-12}
              fontFamily="'IBM Plex Mono', ui-monospace, monospace"
              fontSize={14}
              letterSpacing={3}
              fill="#0F1410"
              opacity={0.78}
            >
              THROTTLE
            </text>
            <rect x={130} y={-22} width={280} height={12} fill="#0F1410" opacity={0.08} rx={2} />
            <rect
              x={130}
              y={-22}
              width={280}
              height={12}
              fill="#0A2818"
              rx={2}
              className="hero-telemetry-bar hero-telemetry-throttle"
            />
            <circle
              cx={130}
              cy={-16}
              r={5}
              fill="#0A2818"
              className="hero-telemetry-spark hero-telemetry-throttle-spark"
            />
            <text
              x={420}
              y={-12}
              fontFamily="'IBM Plex Mono', ui-monospace, monospace"
              fontSize={14}
              letterSpacing={3}
              fill="#0F1410"
              opacity={0.78}
              textAnchor="start"
            >
              live
            </text>
          </g>

          <g transform="translate(0, 28)">
            <text
              x={0}
              y={-12}
              fontFamily="'IBM Plex Mono', ui-monospace, monospace"
              fontSize={14}
              letterSpacing={3}
              fill="#0F1410"
              opacity={0.78}
            >
              BRAKE
            </text>
            <rect x={130} y={-22} width={280} height={12} fill="#0F1410" opacity={0.08} rx={2} />
            <rect
              x={130}
              y={-22}
              width={280}
              height={12}
              fill="#C1492C"
              rx={2}
              className="hero-telemetry-bar hero-telemetry-brake"
            />
            <circle
              cx={130}
              cy={-16}
              r={5}
              fill="#C1492C"
              className="hero-telemetry-spark hero-telemetry-brake-spark"
            />
            <text
              x={420}
              y={-12}
              fontFamily="'IBM Plex Mono', ui-monospace, monospace"
              fontSize={14}
              letterSpacing={3}
              fill="#0F1410"
              opacity={0.78}
              textAnchor="start"
            >
              live
            </text>
          </g>

          <g transform="translate(0, 56)">
            <text
              x={0}
              y={-12}
              fontFamily="'IBM Plex Mono', ui-monospace, monospace"
              fontSize={14}
              letterSpacing={3}
              fill="#0F1410"
              opacity={0.78}
            >
              STEER
            </text>
            <rect x={130} y={-22} width={280} height={12} fill="#0F1410" opacity={0.08} rx={2} />
            <rect
              x={130}
              y={-22}
              width={280}
              height={12}
              fill="#D9A441"
              rx={2}
              className="hero-telemetry-bar hero-telemetry-steering"
            />
            <circle
              cx={130}
              cy={-16}
              r={5}
              fill="#D9A441"
              className="hero-telemetry-spark hero-telemetry-steering-spark"
            />
            <text
              x={420}
              y={-12}
              fontFamily="'IBM Plex Mono', ui-monospace, monospace"
              fontSize={14}
              letterSpacing={3}
              fill="#0F1410"
              opacity={0.78}
              textAnchor="start"
            >
              live
            </text>
          </g>
        </g>

        <rect
          x={0}
          y={0}
          width={1000}
          height={900}
          fill="url(#paper-vignette)"
          aria-hidden="true"
        />
      </svg>
    </div>
  );
}
