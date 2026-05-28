"use client";

/**
 * RacingLineHero3DGate — decides at runtime whether to mount the R3F
 * canvas over the SVG hero, then renders the SVG fallback + (optionally)
 * the R3F overlay + liquid-glass telemetry chips.
 *
 * Wave-52 cinematic depth upgrade per docs/r3f-phase-2-spec.md.
 *
 * Rules (both checks run inside a single useEffect + rAF per
 * feedback_react19_set_state_in_effect_workarounds.md + the rAF-defer
 * pattern from lib/use-prefers-reduced-motion.ts):
 *   1. prefers-reduced-motion: reduce  -> show SVG only, skip R3F.
 *   2. navigator.hardwareConcurrency < 4 -> low-CPU device, skip R3F.
 *   3. Both false -> mount R3F overlay + liquid-glass chips on top of SVG.
 *
 * Initial state false (NOT lazy initializer reading navigator) per
 * feedback_useState_lazy_init_hydration_footgun.md. The check moves to
 * useEffect so SSR + client first-paint stay in sync.
 *
 * Per feedback_nextjs16_dynamic_ssr_false_client_only.md: this gate is
 * itself dynamic-imported from RacingLineHeroShell with ssr:false; both
 * are Client Components ("use client" first line).
 */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import RacingLineHero from "./RacingLineHero";

const RacingLineHero3DCanvas = dynamic(() => import("./RacingLineHero3DCanvas"), {
  ssr: false,
  loading: () => null,
});

interface ChipDef {
  readonly label: string;
  readonly values: ReadonlyArray<string>;
  readonly color: string;
  readonly position: string;
}

const CHIP_CYCLE: ReadonlyArray<ChipDef> = [
  {
    label: "THROTTLE",
    values: ["82%", "54%", "18%", "08%", "42%", "78%", "92%"],
    color: "#0A2818",
    position: "bottom-4 left-4",
  },
  {
    label: "BRAKE",
    values: ["06%", "22%", "88%", "72%", "34%", "08%", "04%"],
    color: "#C1492C",
    position: "bottom-4 left-32",
  },
  {
    label: "STEER",
    values: ["10%", "28%", "82%", "88%", "46%", "22%", "10%"],
    color: "#D9A441",
    position: "bottom-4 left-60",
  },
  {
    label: "COA-GATE",
    values: ["PASS", "PASS", "WARN", "PASS", "PASS", "PASS", "PASS"],
    color: "#D9A441",
    position: "bottom-4 right-4",
  },
];

function TelemetryChips() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => (n + 1) % 7), 620);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {CHIP_CYCLE.map((chip) => (
        <div
          key={chip.label}
          className={`apex-glass absolute ${chip.position} rounded px-2 py-1`}
          style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}
        >
          <span
            className="block text-[10px] tracking-widest opacity-60"
            style={{ color: "#0F1410" }}
          >
            {chip.label}
          </span>
          <span
            className="block text-sm font-semibold tabular-nums"
            style={{ color: chip.color }}
          >
            {chip.values[tick % chip.values.length]}
          </span>
        </div>
      ))}
    </>
  );
}

export default function RacingLineHero3DGate() {
  const [showR3F, setShowR3F] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof window.matchMedia !== "function") return;

    let rafId = 0;

    const evaluate = () => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const lowCPU =
        typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency < 4;
      const enabled = !reducedMotion && !lowCPU;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setShowR3F(enabled));
    };

    evaluate();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => evaluate();
    mq.addEventListener("change", onChange);

    return () => {
      cancelAnimationFrame(rafId);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      <RacingLineHero />
      {showR3F && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <RacingLineHero3DCanvas />
        </div>
      )}
      {showR3F && <TelemetryChips />}
    </div>
  );
}
