"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Html } from "@react-three/drei";
import {
  ShirtModel,
  ShirtDecalProps,
  ShirtDecalItem,
} from "@/components/customization/shirt-model";
import { GarmentStyle } from "@/components/customization/studio/types";
import { CanvasErrorBoundary } from "@/components/customization/canvas-error-boundary";

interface R3FCanvasProps {
  bodyColor: string;
  neckColor: string;
  garmentStyle?: GarmentStyle;
  partColors?: {
    body?: string;
    sleeves?: string;
    collar?: string;
    leftSleeve?: string;
    rightSleeve?: string;
  };
  currentView?: string;
  zoom?: number;
  materialRoughness?: number;
  materialMetalness?: number;
  decal?: ShirtDecalProps | null;
  decals?: ShirtDecalItem[];
  className?: string;
  enableZoom?: boolean;
  enableRotate?: boolean;
  onPointerHit?: (hit: {
    point: [number, number, number];
    normal?: [number, number, number];
    meshKey?: string;
    view?: string;
  }) => void;
  onDecalDragMove?: (hit: {
    point: [number, number, number];
    normal?: [number, number, number];
    meshKey?: string;
  }) => void;
  onDecalDragEnd?: () => void;
  onGlReady?: (gl: THREE.WebGLRenderer) => void;
}

// Expose the WebGL renderer for toDataURL() PNG export
function GlExposer({ onGlReady }: { onGlReady?: (gl: THREE.WebGLRenderer) => void }) {
  const { gl } = useThree();
  useEffect(() => {
    if (onGlReady) onGlReady(gl);
  }, [gl, onGlReady]);
  return null;
}

function CanvasLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 bg-white/95 backdrop-blur px-6 py-3.5 rounded-2xl shadow-xl border border-slate-200 text-xs font-semibold text-slate-800 pointer-events-none">
        <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
        <span>Loading 3D Garment...</span>
      </div>
    </Html>
  );
}

// ─── Camera Controller & OrbitControls ──────────────────────────────────────

function CameraRig({
  currentView = "front",
  zoom = 100,
}: {
  currentView?: string;
  zoom?: number;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // Calculate distance based on zoom percentage (100% = default 3.8 distance)
  const clampedZoom = Math.max(25, Math.min(250, zoom));
  const distance = 3.8 * (100 / clampedZoom);

  // Target camera positions for views
  const viewCameraOffsets: Record<string, [number, number, number]> = {
    front: [0, 0.1, distance],
    back: [0, 0.1, -distance],
    leftSleeve: [-distance, 0.15, 0],
    rightSleeve: [distance, 0.15, 0],
  };

  useFrame((_, delta) => {
    const target = viewCameraOffsets[currentView] || viewCameraOffsets.front;
    // Smoothly interpolate camera position
    camera.position.x = THREE.MathUtils.damp(camera.position.x, target[0], 5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target[1], 5, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target[2], 5, delta);
    camera.lookAt(0, 0, 0);
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableRotate={true}
      rotateSpeed={0.8}
      enableZoom={true}
      minDistance={1.6}
      maxDistance={6.5}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 1.75}
      target={[0, 0, 0]}
    />
  );
}

// ─── Scene Experience with Studio Lighting ─────────────────────────────────

function Experience({
  bodyColor,
  neckColor,
  garmentStyle,
  partColors,
  currentView,
  zoom = 100,
  materialRoughness,
  materialMetalness,
  decal,
  decals,
  onPointerHit,
  onDecalDragMove,
  onDecalDragEnd,
  onGlReady,
}: R3FCanvasProps) {
  return (
    <>
      <GlExposer onGlReady={onGlReady} />

      {/* Robust Studio Lighting Setup — 100% local, no network HDR dependencies */}
      <ambientLight intensity={1.1} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.6}
        castShadow
        shadow-mapSize={1024}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-4, 4, -4]} intensity={0.8} color="#e0f2fe" />
      <directionalLight position={[0, -2, 3]} intensity={0.4} color="#ffffff" />
      <hemisphereLight intensity={0.5} groundColor="#334155" color="#ffffff" />

      <CameraRig currentView={currentView} zoom={zoom} />

      <ShirtModel
        bodyColor={bodyColor}
        neckColor={neckColor}
        garmentStyle={garmentStyle}
        partColors={partColors}
        currentView={currentView}
        materialRoughness={materialRoughness}
        materialMetalness={materialMetalness}
        decal={decal}
        decals={decals}
        onPointerHit={onPointerHit}
        onDecalDragMove={onDecalDragMove}
        onDecalDragEnd={onDecalDragEnd}
      />

      <ContactShadows
        position={[0, -1.6, 0]}
        opacity={0.35}
        scale={6}
        blur={2.5}
        far={4}
      />
    </>
  );
}

// ─── Client-Only R3F Canvas Container with Error Boundary ───────────────────

export function R3FCanvas(props: R3FCanvasProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`relative w-full h-full bg-[#f1f5f9] flex items-center justify-center ${props.className || ""}`}>
        <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full bg-[#f1f5f9] overflow-hidden ${props.className || ""}`}>
      <CanvasErrorBoundary fallbackTitle="3D Studio Error">
        {/* preserveDrawingBuffer: true — required for gl.domElement.toDataURL export */}
        <Canvas
          shadows
          camera={{ position: [0, 0.1, 3.8], fov: 34 }}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
        >
          <Suspense fallback={<CanvasLoader />}>
            <Experience {...props} />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
