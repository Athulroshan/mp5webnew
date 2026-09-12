"use client";

import React, { Suspense, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Html } from "@react-three/drei";
import { ShirtModel, ShirtDecalProps, ShirtDecalItem } from "@/components/customization/shirt-model";

import { GarmentStyle } from "@/components/customization/studio/types";

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
  materialRoughness?: number;
  materialMetalness?: number;
  decal?: ShirtDecalProps | null;
  decals?: ShirtDecalItem[];
  className?: string;
  enableZoom?: boolean;
  enableRotate?: boolean;
  onPointerHit?: (point: [number, number, number]) => void;
  onGlReady?: (gl: THREE.WebGLRenderer) => void;
}

// Expose the WebGL renderer so we can call toDataURL() for export
function GlExposer({ onGlReady }: { onGlReady?: (gl: any) => void }) {
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

function Experience({
  bodyColor,
  neckColor,
  garmentStyle,
  partColors,
  currentView,
  materialRoughness,
  materialMetalness,
  decal,
  decals,
  enableZoom = false,
  enableRotate = true,
  onPointerHit,
  onGlReady,
}: R3FCanvasProps) {
  return (
    <>
      <GlExposer onGlReady={onGlReady} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 5, 5]} intensity={1.4} castShadow shadow-mapSize={1024} />
      <directionalLight position={[-5, 3, -3]} intensity={0.6} color="#e0f2fe" />
      <Environment preset="city" />

      <OrbitControls
        makeDefault
        enableRotate={enableRotate}
        rotateSpeed={0.8}
        enableZoom={enableZoom}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.75}
        target={[0, 0, 0]}
      />

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
      />

      <ContactShadows position={[0, -1.6, 0]} opacity={0.35} scale={6} blur={2.5} far={4} />
    </>
  );
}

export function R3FCanvas({
  bodyColor,
  neckColor,
  garmentStyle = "round-neck",
  partColors,
  currentView = "front",
  materialRoughness = 0.6,
  materialMetalness = 0.05,
  decal,
  decals,
  className = "",
  enableZoom = false,
  enableRotate = true,
  onPointerHit,
  onGlReady,
}: R3FCanvasProps) {
  return (
    <div className={`relative w-full h-full bg-[#f1f5f9] overflow-hidden ${className}`}>
      {/* preserveDrawingBuffer: true — required for toDataURL() export */}
      <Canvas
        shadows
        camera={{ position: [0, 0.1, 4.0], fov: 34 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <Experience
            bodyColor={bodyColor}
            neckColor={neckColor}
            garmentStyle={garmentStyle}
            partColors={partColors}
            currentView={currentView}
            materialRoughness={materialRoughness}
            materialMetalness={materialMetalness}
            decal={decal}
            decals={decals}
            enableZoom={enableZoom}
            enableRotate={enableRotate}
            onPointerHit={onPointerHit}
            onGlReady={onGlReady}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
