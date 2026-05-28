"use client";

/**
 * RacingLineHero3DCanvas — R3F GPU overlay layered over the SVG hero.
 *
 * Wave-52 cinematic depth upgrade per docs/r3f-phase-2-spec.md. Sits
 * absolute-fill behind the SVG so the SVG track + text + telemetry
 * strip remain fully legible. The R3F scene contributes:
 *   - Track ribbon: CatmullRomCurve3 + TubeGeometry along the same
 *     corner geometry as the SVG LINE_PATH, in editorial-paddock palette.
 *   - Apex marker: Sphere with emissiveIntensity 1.8 at the apex point.
 *   - 256 amber spark instances drifting along the curve.
 *   - Slow cinematic orbital camera drift via useFrame.
 *   - EffectComposer: Bloom + Vignette + ChromaticAberration.
 *
 * Palette (all from editorial-paddock, NO purple, NO cyan, NO neon):
 *   cream     #F4EBD8  — spark fill, ambient light tint
 *   green     #0A2818  — track ribbon base
 *   clay-red  #C1492C  — tube emissive, spark variant
 *   amber     #D9A441  — apex sphere, sparks, point light
 *   ink       #0F1410  — scene background (transparent canvas)
 */

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from "@react-three/postprocessing";
import * as THREE from "three";

const C_AMBER = "#D9A441";
const C_CLAY = "#C1492C";
const C_GREEN = "#0A2818";
const C_CREAM = "#F4EBD8";

// Track curve geometry. Control points mirror the SVG LINE_PATH semantics
// normalized to world space [-1, 1].
const RAW_CURVE_POINTS: ReadonlyArray<readonly [number, number, number]> = [
  [-0.88, 0.511, 0],
  [-0.44, 0.511, 0],
  [0.0, 0.511, 0.1],
  [0.24, 0.2, 0.18],
  [0.48, -0.067, 0.22],
  [0.76, -0.067, 0.15],
  [0.88, -0.267, 0],
];

const APEX_WORLD = new THREE.Vector3(0.48, -0.067, 0.22);
const CURVE = new THREE.CatmullRomCurve3(
  RAW_CURVE_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  "catmullrom",
  0.45,
);

const SPARK_COUNT = 256;

function TrackRibbon() {
  const tubeGeo = useMemo(
    () => new THREE.TubeGeometry(CURVE, 120, 0.012, 8, false),
    [],
  );
  return (
    <mesh geometry={tubeGeo}>
      <meshStandardMaterial
        color={C_GREEN}
        emissive={C_CLAY}
        emissiveIntensity={0.28}
        roughness={0.55}
        metalness={0.18}
      />
    </mesh>
  );
}

function ApexMarker() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.scale.setScalar(1 + 0.06 * Math.sin(performance.now() * 0.0014));
  });
  return (
    <mesh ref={ref} position={APEX_WORLD}>
      <sphereGeometry args={[0.045, 20, 20]} />
      <meshStandardMaterial
        color={C_AMBER}
        emissive={C_AMBER}
        emissiveIntensity={1.8}
        roughness={0.1}
        metalness={0.0}
      />
    </mesh>
  );
}

interface SparkSpawn {
  readonly phase: number;
  readonly speed: number;
  readonly scale: number;
}

function SparkField() {
  const spawns = useMemo<ReadonlyArray<SparkSpawn>>(() => {
    return Array.from({ length: SPARK_COUNT }, (_, i) => ({
      phase: i / SPARK_COUNT,
      speed: 0.04 + (i % 7) * 0.006,
      scale: 0.003 + (i % 5) * 0.0015,
    }));
  }, []);

  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!ref.current) return;
    const t = performance.now() * 0.0003;
    const children = ref.current.children;
    for (let i = 0; i < spawns.length; i++) {
      const s = spawns[i]!;
      const mesh = children[i] as THREE.Mesh | undefined;
      if (!mesh) continue;
      const p = (((s.phase + t * s.speed) % 1) + 1) % 1;
      const pt = CURVE.getPoint(p);
      mesh.position.copy(pt);
      mesh.scale.setScalar(s.scale);
    }
  });

  return (
    <group ref={ref}>
      {spawns.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 5, 5]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? C_CLAY : i % 3 === 1 ? C_AMBER : C_CREAM}
            emissive={i % 3 === 1 ? C_AMBER : C_CLAY}
            emissiveIntensity={0.9}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function CinematicCamera() {
  useFrame(({ camera }) => {
    const t = performance.now() * 0.00012;
    camera.position.x = Math.sin(t) * 0.14;
    camera.position.y = 0.08 + Math.cos(t * 0.7) * 0.05;
    camera.lookAt(APEX_WORLD);
  });
  return null;
}

function PostFX() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.55}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.08}
        mipmapBlur
      />
      <Vignette offset={0.22} darkness={0.55} eskil={false} />
      <ChromaticAberration offset={[0.0006, 0.0006]} radialModulation={false} modulationOffset={0} />
    </EffectComposer>
  );
}

export default function RacingLineHero3DCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0.08, 1.6], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.35} color={C_CREAM} />
      <pointLight
        position={APEX_WORLD.clone().add(new THREE.Vector3(0, 0.3, 0.3))}
        color={C_AMBER}
        intensity={2.2}
        distance={1.6}
      />
      <TrackRibbon />
      <ApexMarker />
      <SparkField />
      <CinematicCamera />
      <PostFX />
    </Canvas>
  );
}
