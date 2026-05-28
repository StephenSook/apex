# R3F Phase 2 cinematic overlay implementation spec

Produced by `feature-dev:code-architect` subagent dispatch 2026-05-28 wave-51c. NOT YET IMPLEMENTED. Stephen confirms then Claude ships across 5-6 atomic commits.

## Decision context

Wave-51 shipped the SVG cinematic hero (rev-5) end-to-end. Stephen explicit "if the SVG hero is not enough wow" trigger for R3F Phase 2. The R3F overlay LAYERS on top of the existing SVG, never replaces it. The SVG remains the fallback for prefers-reduced-motion + low-CPU (hardwareConcurrency < 4) users.

Dependencies to add (compatibility verified by `general-purpose` wave-51 research):
- `@react-three/postprocessing@3.0.4`
- `postprocessing@6.39.1`

Existing dependencies kept as-is:
- `@react-three/fiber@9.6.1`
- `@react-three/drei@10.7.7`
- `three@0.184.0`

Bundle impact: ~83 KB gzip incremental, deferred via next/dynamic ssr:false.

## File plan

| File | Action | LoC |
|---|---|---|
| `app/frontend/components/RacingLineHero3DCanvas.tsx` | NEW | ~190 |
| `app/frontend/components/RacingLineHero3DGate.tsx` | NEW | ~70 |
| `app/frontend/components/RacingLineHeroShell.tsx` | EDIT | ~40 |
| `app/frontend/package.json` | EDIT | 2 dep entries |

No changes to `RacingLineHero.tsx` (existing SVG rev-5). It stays as the fallback.

## Scene composition

**Track ribbon**: CatmullRomCurve3 over 7 control points mapped from SVG viewBox (1000x900) to normalized world space [-1, 1]. TubeGeometry(curve, 120 tubularSegments, 0.012 radius, 8 radialSegments). meshStandardMaterial: color #0A2818 racing-green, emissive #C1492C clay-red, emissiveIntensity 0.28.

**Apex marker**: Sphere at apex world position (0.48, -0.067, 0.22). radius 0.045, emissive #D9A441 amber, emissiveIntensity 1.8. useFrame breathes scale on `1 + 0.06 * sin(t)` matching the SVG orbital ring rhythm.

**Spark instances**: 256 small spheres distributed along the curve, each at individual phase + drift speed. Colors cycle clay-red / amber / cream paper per `i % 3`. Position updated each frame via curve.getPoint at the phase+speed-modulated parameter.

**Cinematic camera drift**: useFrame oscillates camera.position.x on `sin(t*0.00012) * 0.14` band, position.y on `cos(t*0.000084) * 0.05` band. lookAt(APEX_WORLD) every frame. No OrbitControls.

**Post-processing pipeline**: EffectComposer with Bloom (intensity 0.55, luminanceThreshold 0.55, luminanceSmoothing 0.08, mipmapBlur true) + Vignette (offset 0.22, darkness 0.55) + ChromaticAberration (offset Vector2(0.0006, 0.0006), radialModulation false).

## Editorial-paddock palette mapping

| R3F material use | Hex | Palette name |
|---|---|---|
| Track tube base | `#0A2818` | racing-green |
| Track tube emissive | `#C1492C` | clay-red |
| Apex sphere + emissive | `#D9A441` | amber |
| Point light | `#D9A441` | amber |
| Ambient light tint | `#F4EBD8` | cream-paper |
| Spark variant A | `#C1492C` | clay-red |
| Spark variant B | `#D9A441` | amber |
| Spark variant C | `#F4EBD8` | cream-paper |

No purple. No cyan. No blue. No neon green.

## Bundle deferral chain

1. Server renders RacingLineHeroShell stub
2. Client hydrates shell; next/dynamic(ssr:false) fetches the gate chunk
3. While fetching: skeleton animate-pulse placeholder visible (instant)
4. Gate chunk loads; gate mounts; useState(false); SVG renders immediately via static import inside gate
5. Gate useEffect fires; rAF-deferred; evaluates motion + CPU
6. If R3F enabled: next/dynamic(ssr:false) for canvas chunk begins fetching
7. Canvas mounts into absolute inset-0 div; R3F scene initializes

SVG is never behind a dynamic import itself. Reliable first real paint regardless of how long the R3F chunk takes.

## Hydration safety guards

Per `feedback_useState_lazy_init_hydration_footgun.md` + `feedback_react19_set_state_in_effect_workarounds.md`:
- useState initial value MUST be `false` literal (NOT a lazy initializer reading navigator or window)
- prefers-reduced-motion + hardwareConcurrency check happens inside useEffect callback
- setShowR3F is deferred via requestAnimationFrame to dodge React 19 set-state-in-effect lint rule
- Match the rAF defer pattern from `lib/use-prefers-reduced-motion.ts`

## Liquid-glass telemetry chips

Four chips at absolute positions over the canvas using the existing `.apex-glass` utility from globals.css line 311:

- THROTTLE `bottom-4 left-4` color `#0A2818`
- BRAKE `bottom-4 left-32` color `#C1492C`
- STEER `bottom-4 left-60` color `#D9A441`
- COA-GATE `bottom-4 right-4` color `#D9A441`

Plain DOM siblings over the canvas (NOT drei `<Html>`). setInterval 620ms updates synthetic value cycle. Chips render only when showR3F=true. SVG telemetry strip (lines 628-756 of RacingLineHero.tsx) handles reduce-motion + low-CPU users with its existing animation.

## Atomic commit ladder

```
feat(hero): add @react-three/postprocessing@3.0.4 + postprocessing@6.39.1 deps
feat(hero): add RacingLineHero3DCanvas R3F scene (ribbon + apex + sparks + PostFX)
feat(hero): add RacingLineHero3DGate prefers-reduced-motion + low-CPU switch
feat(hero): wire liquid-glass telemetry chips into RacingLineHero3DGate
refactor(hero): update RacingLineHeroShell to dynamic-import the gate
test(hero): update snapshot + confirm CI green for hero shell
```

## Risk register

1. **Next.js 16 + dynamic ssr:false + React 19 quirks**: per `feedback_nextjs16_dynamic_ssr_false_client_only.md` rule, both shell + gate are Client Components. Verify the literal `"use client"` first line in both files before commit.

2. **postprocessing + three peer dep pinning**: postprocessing@6.39.1 peer dep `three >=0.149`; ours is 0.184.0. Both satisfied. Pin exact versions in package.json (no caret) to prevent minor bumps shifting the peer resolution.

3. **Mobile Safari iOS performance**: 256-instance + Bloom + Vignette + ChromaticAberration on A15 may drop below 30fps. Two mitigations: `hardwareConcurrency < 4` gate skips R3F on low-end devices; canvas can add `gl={{ powerPreference: "high-performance" }}` as follow-up if profiling shows throttling.

4. **React 19 set-state-in-effect lint (cascade-#55 class)**: gate has `setShowR3F` (in rAF callback) + `TelemetryChips`'s `setTick` (in setInterval). Both are async/timer callbacks (NOT synchronous in-render). No violation. Confirm with `pnpm lint` after first commit.

5. **Production bundle size budget**: target <300KB gzip incremental. New additions ~83KB gzip total. Main bundle unchanged because both new chunks load via next/dynamic.

## Critical implementation gotchas

- `CinematicCamera` must NOT be inside an `<OrbitControls>` tree
- TubeGeometry constructed in useMemo with empty dep array (never reference props/state inside the factory)
- `absolute inset-0` div wrapping canvas MUST sit inside the gate's outer `relative w-full overflow-hidden` div, NOT outside it (canvas bleeds outside hero bounds otherwise)
- `pointerEvents: "none"` on `<Canvas>` style is load-bearing (without it canvas captures all click + hover events over hero area)
- `useFrame` in CinematicCamera calling `camera.lookAt` every frame is safe; pure matrix operation
- `performance.now()` inside useFrame is intentional for smooth periodic oscillations (`delta` parameter is for physics/movement; `performance.now()` for monotonic clock)

## Ship trigger

Stephen confirms after reviewing this spec. Then Claude executes the 5-6 atomic commits in order, verifying CI green per push per `feedback_cascade_fix_forward_discipline`.
