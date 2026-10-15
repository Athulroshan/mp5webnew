"use client";

import React, { useRef, useMemo, useState, Component, ReactNode, ErrorInfo } from "react";
import * as THREE from "three";
import { useGLTF, useTexture, Decal } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";

export type GarmentId = "round" | "polo" | "oversized" | "full" | "half" | "hoodie";
export type ViewKey = "front" | "back" | "leftSleeve" | "rightSleeve";

export interface LogoItem {
  id: string;
  url: string;
  name: string;
  view: ViewKey;
  scale: number; // 0.2 to 2.5
  rotation: number; // 0 to 360 degrees
  x: number; // horizontal offset (-1 to 1)
  y: number; // vertical offset (-1 to 1)
}

export interface PartColors {
  body: string;
  sleeves: string;
  collar: string;
  leftSleeve?: string;
  rightSleeve?: string;
}

export interface GarmentProps {
  garmentId: GarmentId;
  partColors: PartColors;
  currentView: ViewKey;
  logos: LogoItem[];
  selectedLogoId?: string | null;
  isPlacing?: boolean;
  onPointerPlace?: (coords: { x: number; y: number; view: ViewKey }) => void;
}

// ─── Preload all 6 GLB models ──────────────────────────────────────────────
const GLB_PATHS: Record<GarmentId, string> = {
  round: "/models/round.glb",
  polo: "/models/polo.glb",
  oversized: "/models/oversized.glb",
  full: "/models/full.glb",
  half: "/models/half.glb",
  hoodie: "/models/hoodie.glb",
};

try {
  useGLTF.preload("/models/round.glb");
  useGLTF.preload("/models/polo.glb");
  useGLTF.preload("/models/oversized.glb");
  useGLTF.preload("/models/full.glb");
  useGLTF.preload("/models/half.glb");
  useGLTF.preload("/models/hoodie.glb");
} catch (e) {
  console.warn("Preload notice:", e);
}

// ─── Style Transforms ──────────────────────────────────────────────────────
const STYLE_TRANSFORMS: Record<
  GarmentId,
  { position: [number, number, number]; scale: [number, number, number] }
> = {
  round:     { position: [0, -2.81, 0.26], scale: [2.2, 2.2, 2.2] },
  polo:      { position: [0, -1.35, 0],    scale: [3.8, 3.8, 3.8] },
  oversized: { position: [0, -2.81, 0.26], scale: [2.35, 2.2, 2.35] },
  full:      { position: [0, -2.81, 0.26], scale: [2.2, 2.2, 2.2] },
  half:      { position: [0, -2.81, 0.26], scale: [2.2, 2.2, 2.2] },
  hoodie:    { position: [0, -3.3, 0],     scale: [0.024, 0.024, 0.024] },
};

// ─── Decal Projector ───────────────────────────────────────────────────────
function DecalProjectorContent({
  logo,
  garmentId,
}: {
  logo: LogoItem;
  garmentId: GarmentId;
}) {
  const texture = useTexture(logo.url);

  if (texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
  }

  const img = texture?.image as HTMLImageElement | undefined;
  const aspect = img && img.height > 0 ? img.width / img.height : 1.0;

  // Compute anchor and offsets per garment style
  const isHoodie = garmentId === "hoodie";
  const isPolo = garmentId === "polo";

  const baseScale = isHoodie ? 38.0 : isPolo ? 0.22 : 0.32;
  const rangeX = isHoodie ? 45.0 : isPolo ? 0.24 : 0.28;
  const rangeY = isHoodie ? 45.0 : isPolo ? 0.24 : 0.28;

  let pos: [number, number, number];
  let rot: [number, number, number];

  const rotRad = (logo.rotation * Math.PI) / 180;

  if (isHoodie) {
    if (logo.view === "back") {
      pos = [-logo.x * rangeX, 136 - logo.y * rangeY, -22.5];
      rot = [0, Math.PI, rotRad];
    } else if (logo.view === "leftSleeve") {
      pos = [-58, 136 - logo.y * rangeY, -logo.x * 15];
      rot = [0, -Math.PI / 2, rotRad];
    } else if (logo.view === "rightSleeve") {
      pos = [58, 136 - logo.y * rangeY, logo.x * 15];
      rot = [0, Math.PI / 2, rotRad];
    } else {
      pos = [logo.x * rangeX, 136 - logo.y * rangeY, 21.5];
      rot = [0, 0, rotRad];
    }
  } else if (isPolo) {
    if (logo.view === "back") {
      pos = [-logo.x * rangeX, 0.38 - logo.y * rangeY, -0.165];
      rot = [0, Math.PI, rotRad];
    } else if (logo.view === "leftSleeve") {
      pos = [-0.28, 0.45 - logo.y * rangeY, -logo.x * 0.12];
      rot = [0, -Math.PI / 2, rotRad];
    } else if (logo.view === "rightSleeve") {
      pos = [0.28, 0.45 - logo.y * rangeY, logo.x * 0.12];
      rot = [0, Math.PI / 2, rotRad];
    } else {
      pos = [logo.x * rangeX, 0.38 - logo.y * rangeY, 0.185];
      rot = [0, 0, rotRad];
    }
  } else {
    // round, oversized, full, half
    if (logo.view === "back") {
      pos = [-logo.x * rangeX, 1.30 - logo.y * rangeY, -0.145];
      rot = [0, Math.PI, rotRad];
    } else if (logo.view === "leftSleeve") {
      pos = [-0.26, 1.45 - logo.y * rangeY, -logo.x * 0.12];
      rot = [0, -Math.PI / 2, rotRad];
    } else if (logo.view === "rightSleeve") {
      pos = [0.26, 1.45 - logo.y * rangeY, logo.x * 0.12];
      rot = [0, Math.PI / 2, rotRad];
    } else {
      pos = [logo.x * rangeX, 1.30 - logo.y * rangeY, 0.155];
      rot = [0, 0, rotRad];
    }
  }

  const effectiveScale = baseScale * logo.scale;
  const scaleVector: [number, number, number] = [
    effectiveScale * aspect,
    effectiveScale,
    effectiveScale * 1.5,
  ];

  return (
    <Decal
      position={pos}
      rotation={rot}
      scale={scaleVector}
      map={texture}
      depthTest={true}
      polygonOffsetFactor={-4}
    />
  );
}

function LogoDecal({ logo, garmentId }: { logo: LogoItem; garmentId: GarmentId }) {
  if (!logo.url) return null;
  return (
    <React.Suspense fallback={null}>
      <DecalProjectorContent logo={logo} garmentId={garmentId} />
    </React.Suspense>
  );
}

// ─── Color Mapping for Meshes ──────────────────────────────────────────────
function getMeshColor(
  meshKey: string,
  meshIndex: number,
  garmentId: GarmentId,
  colors: PartColors
): string {
  const key = meshKey.toLowerCase();
  const body = colors.body || "#ffffff";
  const collar = colors.collar || body;
  const sleeves = colors.sleeves || body;
  const leftSleeve = colors.leftSleeve || sleeves;
  const rightSleeve = colors.rightSleeve || sleeves;

  // Collar / Ribbing / Hood
  if (
    key.includes("ribbing") ||
    key.includes("neck") ||
    key.includes("collar") ||
    key.includes("hood") ||
    meshKey === "Object_6" ||
    meshKey === "Object_8"
  ) {
    return collar;
  }

  // Sleeves
  if (key.includes("sleeve_l") || key.includes("left_sleeve") || meshKey === "Object_18") {
    return leftSleeve;
  }
  if (key.includes("sleeve_r") || key.includes("right_sleeve") || meshKey === "Object_20") {
    return rightSleeve;
  }
  if (key.includes("sleeve")) {
    return sleeves;
  }

  // Hoodie index mapping
  if (garmentId === "hoodie") {
    if (meshIndex === 1) return leftSleeve;
    if (meshIndex === 2) return rightSleeve;
    if (meshIndex === 3) return collar;
    return body;
  }

  // Polo
  if (garmentId === "polo") {
    if (meshKey === "Object_6" || key.includes("button")) return "#f8fafc";
    return body;
  }

  return body;
}

// ─── Procedural Mesh Generator Fallback ────────────────────────────────────
function ProceduralGarmentModel({
  garmentId,
  partColors,
  logos,
  isPlacing,
  currentView,
  onPointerPlace,
}: GarmentProps) {
  const isDraggingRef = useRef(false);

  const isHoodie = garmentId === "hoodie";
  const isPolo = garmentId === "polo";
  const isOversized = garmentId === "oversized";
  const isFullSleeve = garmentId === "full" || isHoodie;

  const torsoRadius = isOversized ? 1.15 : isHoodie ? 1.18 : 1.0;
  const torsoHeight = isOversized ? 2.6 : isHoodie ? 2.65 : 2.4;
  const sleeveRadius = isOversized ? 0.48 : isHoodie ? 0.44 : 0.42;
  const sleeveLength = isFullSleeve ? 1.85 : isOversized ? 1.1 : 0.9;
  const sleeveDropY = isFullSleeve ? -0.1 : 0.65;
  const sleeveAngleZ = isFullSleeve ? Math.PI / 4 : Math.PI / 3;

  const bodyHex = partColors.body || "#ffffff";
  const collarHex = partColors.collar || bodyHex;
  const sleeveHex = partColors.sleeves || bodyHex;

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!isPlacing) return;
    e.stopPropagation();
    isDraggingRef.current = true;
    handlePlaceRaycast(e);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isPlacing || !isDraggingRef.current) return;
    e.stopPropagation();
    handlePlaceRaycast(e);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handlePlaceRaycast = (e: ThreeEvent<PointerEvent>) => {
    if (!onPointerPlace || !e.point || !e.object) return;
    const local = e.object.worldToLocal(e.point.clone());
    const x = Math.max(-1, Math.min(1, local.x / (torsoRadius * 1.1)));
    const y = Math.max(-1, Math.min(1, -local.y / (torsoHeight * 0.45)));
    onPointerPlace({ x, y, view: currentView });
  };

  return (
    <group position={[0, -0.2, 0]}>
      {/* Torso */}
      <mesh
        castShadow
        receiveShadow
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <cylinderGeometry
          args={[torsoRadius * 0.95, torsoRadius * 1.05, torsoHeight, 48, 32, true]}
        />
        <meshStandardMaterial
          color={bodyHex}
          roughness={isHoodie ? 0.75 : 0.6}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
        {logos.map((logo) => (
          <LogoDecal key={logo.id} logo={logo} garmentId={garmentId} />
        ))}
      </mesh>

      {/* Left Sleeve */}
      <mesh
        position={[isFullSleeve ? -1.45 : -1.25, sleeveDropY, 0]}
        rotation={[0, 0, -sleeveAngleZ]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry
          args={[sleeveRadius * 0.85, sleeveRadius * (isFullSleeve ? 0.65 : 1.0), sleeveLength, 24, 16, true]}
        />
        <meshStandardMaterial color={sleeveHex} roughness={0.6} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>

      {/* Right Sleeve */}
      <mesh
        position={[isFullSleeve ? 1.45 : 1.25, sleeveDropY, 0]}
        rotation={[0, 0, sleeveAngleZ]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry
          args={[sleeveRadius * 0.85, sleeveRadius * (isFullSleeve ? 0.65 : 1.0), sleeveLength, 24, 16, true]}
        />
        <meshStandardMaterial color={sleeveHex} roughness={0.6} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>

      {/* Collar / Hood */}
      <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
        {isHoodie ? (
          <sphereGeometry args={[0.75, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.75]} />
        ) : isPolo ? (
          <torusGeometry args={[0.5, 0.12, 16, 32, Math.PI * 1.4]} />
        ) : (
          <torusGeometry args={[0.48, 0.08, 16, 32]} />
        )}
        <meshStandardMaterial color={collarHex} roughness={0.5} metalness={0.08} />
      </mesh>
    </group>
  );
}

// ─── GLB Garment Model ─────────────────────────────────────────────────────
function GLBGarmentModel(props: GarmentProps) {
  const { garmentId, partColors, logos, isPlacing, currentView, onPointerPlace } = props;
  const path = GLB_PATHS[garmentId] || GLB_PATHS.round;
  const { nodes } = useGLTF(path) as any;
  const isDraggingRef = useRef(false);

  const meshKeys = useMemo(
    () => (nodes ? Object.keys(nodes).filter((k) => nodes[k]?.isMesh) : []),
    [nodes]
  );

  const transform = STYLE_TRANSFORMS[garmentId] || STYLE_TRANSFORMS.round;

  const defaultDecalKey =
    meshKeys.find((k) => k === "Object_10" || k.toLowerCase().includes("body") || k.toLowerCase().includes("front")) ||
    meshKeys[0];

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!isPlacing) return;
    e.stopPropagation();
    isDraggingRef.current = true;
    handlePlaceRaycast(e);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isPlacing || !isDraggingRef.current) return;
    e.stopPropagation();
    handlePlaceRaycast(e);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handlePlaceRaycast = (e: ThreeEvent<PointerEvent>) => {
    if (!onPointerPlace || !e.point || !e.object) return;
    const local = e.object.worldToLocal(e.point.clone());

    const isHoodie = garmentId === "hoodie";
    const isPolo = garmentId === "polo";
    const rangeX = isHoodie ? 45.0 : isPolo ? 0.24 : 0.28;
    const rangeY = isHoodie ? 45.0 : isPolo ? 0.24 : 0.28;
    const centerY = isHoodie ? 136.0 : isPolo ? 0.38 : 1.30;

    let x = 0;
    let y = 0;

    if (currentView === "front" || currentView === "back") {
      const signX = currentView === "back" ? -1 : 1;
      x = Math.max(-1, Math.min(1, (signX * local.x) / rangeX));
      y = Math.max(-1, Math.min(1, (centerY - local.y) / rangeY));
    } else {
      x = Math.max(-1, Math.min(1, -local.z / (rangeX * 0.7)));
      y = Math.max(-1, Math.min(1, (centerY - local.y) / rangeY));
    }

    onPointerPlace({ x, y, view: currentView });
  };

  return (
    <group position={transform.position} scale={transform.scale}>
      {meshKeys.map((key, idx) => {
        const node = nodes[key];
        const hex = getMeshColor(key, idx, garmentId, partColors);

        const originalMat = node.material as THREE.MeshStandardMaterial | undefined;
        let mat: THREE.MeshStandardMaterial;

        if (originalMat) {
          mat = originalMat.clone();
          mat.color = new THREE.Color(hex);
        } else {
          mat = new THREE.MeshStandardMaterial({
            color: hex,
            roughness: 0.6,
            metalness: 0.05,
            side: THREE.DoubleSide,
          });
        }

        const isDecalMesh = key === defaultDecalKey || key === "Object_10" || key === "Object_5" || (garmentId === "hoodie" && idx === 0);

        return (
          <mesh
            key={key}
            geometry={node.geometry}
            castShadow
            receiveShadow
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <primitive object={mat} attach="material" />
            {isDecalMesh &&
              logos.map((logo) => (
                <LogoDecal key={logo.id} logo={logo} garmentId={garmentId} />
              ))}
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Error Boundary Fallback to Procedural Garment ─────────────────────────
class ModelErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: any) {
    console.warn("Using built-in procedural model fallback:", err);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ─── Main Garment Component ────────────────────────────────────────────────
export function Garment(props: GarmentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { currentView } = props;

  // Smooth rotation Y per view tab
  const targetRotationY = useMemo(() => {
    switch (currentView) {
      case "back": return Math.PI;
      case "leftSleeve": return Math.PI / 2;
      case "rightSleeve": return -Math.PI / 2;
      case "front":
      default: return 0;
    }
  }, [currentView]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetRotationY,
        7,
        delta
      );
    }
  });

  return (
    <group ref={groupRef}>
      <ModelErrorBoundary fallback={<ProceduralGarmentModel {...props} />}>
        <React.Suspense fallback={<ProceduralGarmentModel {...props} />}>
          <GLBGarmentModel {...props} />
        </React.Suspense>
      </ModelErrorBoundary>
    </group>
  );
}
