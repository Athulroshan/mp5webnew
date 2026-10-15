"use client";

import React, { useRef, useMemo, useState, Component, ReactNode, ErrorInfo } from "react";
import * as THREE from "three";
import { useGLTF, useTexture, Decal } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";

import { GarmentStyle } from "@/components/customization/studio/types";
import { createGarmentMesh } from "@/lib/garment-model-generator";

export interface ShirtDecalItem {
  id?: string;
  url: string;
  view?: string;
  position?: [number, number, number]; // [x, y, z] in mesh local coords
  rotation?: [number, number, number]; // [rx, ry, rz] in radians
  scale?: number | [number, number, number];
  rotationDeg?: number;
  scaleFactor?: number;
  targetMeshKey?: string;
}

export interface ShirtDecalProps {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number] | number;
}

export interface ShirtModelProps {
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
}

// ─── Decal Projector ────────────────────────────────────────────────────────

function DecalProjectorContent({
  decal,
  baseScaleMultiplier = 1.0,
}: {
  decal: ShirtDecalItem;
  baseScaleMultiplier?: number;
}) {
  const decalTexture = useTexture(decal.url);

  if (decalTexture) {
    decalTexture.colorSpace = THREE.SRGBColorSpace;
    decalTexture.anisotropy = 8;
  }

  const img = decalTexture?.image as HTMLImageElement | undefined;
  const aspect = img && img.height > 0 ? img.width / img.height : 1.0;

  const rawScale =
    typeof decal.scale === "number"
      ? decal.scale
      : Array.isArray(decal.scale)
      ? decal.scale[1]
      : (decal.scaleFactor || 1.0) * 0.35;

  const effectiveScale = rawScale * baseScaleMultiplier;

  const scaleVector: [number, number, number] = [
    effectiveScale * aspect,
    effectiveScale,
    effectiveScale * 1.5,
  ];

  const pos: [number, number, number] = decal.position || [0, 0, 0];
  const rot: [number, number, number] = decal.rotation || [0, 0, 0];

  return (
    <Decal
      position={pos}
      rotation={rot}
      scale={scaleVector}
      map={decalTexture}
      depthTest={true}
      polygonOffsetFactor={-4}
    />
  );
}

function DecalProjector({
  decal,
  baseScaleMultiplier = 1.0,
}: {
  decal: ShirtDecalItem;
  baseScaleMultiplier?: number;
}) {
  if (!decal.url) return null;
  return (
    <React.Suspense fallback={null}>
      <DecalProjectorContent decal={decal} baseScaleMultiplier={baseScaleMultiplier} />
    </React.Suspense>
  );
}

// ─── GLB Model Paths & Preloading ──────────────────────────────────────────

export const MODEL_PATHS: Record<string, string> = {
  "round-neck":  "/models/round-neck.glb",
  "polo":        "/models/polo.glb",
  "oversized":   "/models/oversized.glb",
  "full-sleeve": "/models/full-sleeve.glb",
  "half-sleeve": "/models/half-sleeve.glb",
  "hoodie":      "/models/hoodie.glb",
};

// Preload all 6 models from public/models/
try {
  useGLTF.preload("/models/round-neck.glb");
  useGLTF.preload("/models/polo.glb");
  useGLTF.preload("/models/oversized.glb");
  useGLTF.preload("/models/full-sleeve.glb");
  useGLTF.preload("/models/half-sleeve.glb");
  useGLTF.preload("/models/hoodie.glb");
} catch (e) {
  console.warn("Could not preload one or more GLTF models:", e);
}

const STYLE_TRANSFORMS: Record<
  string,
  { position: [number, number, number]; scale: [number, number, number] }
> = {
  "round-neck":  { position: [0, -2.81, 0.26], scale: [2.2, 2.2, 2.2] },
  "polo":        { position: [0, -1.35, 0],    scale: [3.8, 3.8, 3.8] },
  "hoodie":      { position: [0, -3.3, 0],     scale: [0.024, 0.024, 0.024] },
  "oversized":   { position: [0, -2.81, 0.26], scale: [2.35, 2.2, 2.35] },
  "full-sleeve": { position: [0, -2.81, 0.26], scale: [2.2, 2.2, 2.2] },
  "half-sleeve": { position: [0, -2.81, 0.26], scale: [2.2, 2.2, 2.2] },
};

// ─── Color mapping for parts ───────────────────────────────────────────────

function getPartColorForMesh(
  key: string,
  index: number,
  totalKeys: number,
  garmentStyle: string,
  partColors?: {
    body?: string;
    sleeves?: string;
    collar?: string;
    leftSleeve?: string;
    rightSleeve?: string;
  },
  bodyColor?: string,
  neckColor?: string
): string {
  const keyLower = key.toLowerCase();
  const bodyHex = partColors?.body || bodyColor || "#ffffff";
  const collarHex = partColors?.collar || neckColor || bodyHex;
  const sleevesHex = partColors?.sleeves || bodyHex;
  const leftSleeveHex = partColors?.leftSleeve || sleevesHex;
  const rightSleeveHex = partColors?.rightSleeve || sleevesHex;

  // 1. Ribbing / Collar / Hood
  const isNeckOrHood =
    keyLower.includes("ribbing") ||
    keyLower.includes("neck") ||
    keyLower.includes("collar") ||
    keyLower.includes("hood") ||
    key === "Object_6" ||
    key === "Object_8";

  // 2. Sleeves
  const isLeftSleeve =
    key === "Object_18" ||
    keyLower.includes("sleeve_l") ||
    keyLower.includes("left_sleeve") ||
    keyLower.includes("leftsleeve") ||
    keyLower.includes("sleeve1") ||
    keyLower.includes("sleeves_node_6");

  const isRightSleeve =
    key === "Object_20" ||
    keyLower.includes("sleeve_r") ||
    keyLower.includes("right_sleeve") ||
    keyLower.includes("rightsleeve") ||
    keyLower.includes("sleeve2") ||
    keyLower.includes("sleeves_node_7");

  const isGenericSleeve = isLeftSleeve || isRightSleeve || keyLower.includes("sleeve");

  if (isNeckOrHood) return collarHex;
  if (isLeftSleeve) return leftSleeveHex;
  if (isRightSleeve) return rightSleeveHex;
  if (isGenericSleeve) return sleevesHex;

  // 3. Hoodie mesh index mapping (0: Body, 1: Left sleeve, 2: Right sleeve, 3: Hood & Pocket)
  if (garmentStyle === "hoodie" && totalKeys >= 4) {
    if (index === 1) return leftSleeveHex;
    if (index === 2) return rightSleeveHex;
    if (index === 3) return collarHex;
    return bodyHex;
  }

  // 4. Polo mesh mapping (Object_5: Shirt body, Object_6: Buttons)
  if (garmentStyle === "polo") {
    if (key === "Object_6" || keyLower.includes("button")) {
      return "#f8fafc"; // White/pearl button
    }
    return bodyHex;
  }

  return bodyHex;
}

// ─── Default Decal Anchor Positions per style and view ─────────────────────

export function getDefaultDecalAnchor(
  garmentStyle: string,
  view: string
): { position: [number, number, number]; rotation: [number, number, number]; baseScale: number } {
  if (garmentStyle === "hoodie") {
    switch (view) {
      case "back":
        return { position: [0, 136, -22.5], rotation: [0, Math.PI, 0], baseScale: 40 };
      case "leftSleeve":
        return { position: [-58, 136, 0], rotation: [0, -Math.PI / 2, 0], baseScale: 30 };
      case "rightSleeve":
        return { position: [58, 136, 0], rotation: [0, Math.PI / 2, 0], baseScale: 30 };
      case "front":
      default:
        return { position: [0, 136, 21.5], rotation: [0, 0, 0], baseScale: 40 };
    }
  }

  if (garmentStyle === "polo") {
    switch (view) {
      case "back":
        return { position: [0, 0.38, -0.165], rotation: [0, Math.PI, 0], baseScale: 0.22 };
      case "leftSleeve":
        return { position: [-0.28, 0.45, 0], rotation: [0, -Math.PI / 2, 0], baseScale: 0.16 };
      case "rightSleeve":
        return { position: [0.28, 0.45, 0], rotation: [0, Math.PI / 2, 0], baseScale: 0.16 };
      case "front":
      default:
        return { position: [0, 0.38, 0.185], rotation: [0, 0, 0], baseScale: 0.22 };
    }
  }

  // round-neck, oversized, full-sleeve, half-sleeve
  switch (view) {
    case "back":
      return { position: [0, 1.30, -0.145], rotation: [0, Math.PI, 0], baseScale: 0.32 };
    case "leftSleeve":
      return { position: [-0.26, 1.45, 0], rotation: [0, -Math.PI / 2, 0], baseScale: 0.22 };
    case "rightSleeve":
      return { position: [0.26, 1.45, 0], rotation: [0, Math.PI / 2, 0], baseScale: 0.22 };
    case "front":
    default:
      return { position: [0, 1.30, 0.155], rotation: [0, 0, 0], baseScale: 0.32 };
  }
}

// ─── Procedural Mesh Component ─────────────────────────────────────────────

function ProceduralGarment({
  bodyColor,
  neckColor,
  garmentStyle = "round-neck",
  partColors,
  decals = [],
  onPointerHit,
  onDecalDragMove,
  onDecalDragEnd,
}: ShirtModelProps) {
  const isDraggingRef = useRef(false);

  const proceduralGroup = useMemo(() => {
    return createGarmentMesh(
      {
        body: partColors?.body || bodyColor,
        leftSleeve: partColors?.leftSleeve || partColors?.sleeves || partColors?.body || bodyColor,
        rightSleeve: partColors?.rightSleeve || partColors?.sleeves || partColors?.body || bodyColor,
        collar: partColors?.collar || neckColor || partColors?.body || bodyColor,
      },
      garmentStyle
    );
  }, [bodyColor, neckColor, partColors, garmentStyle]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    if (e.object && e.point) {
      const local = e.object.worldToLocal(e.point.clone());
      onPointerHit?.({
        point: [local.x, local.y, local.z],
        meshKey: e.object.name || "body-mesh",
      });
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDraggingRef.current) return;
    e.stopPropagation();
    if (e.object && e.point) {
      const local = e.object.worldToLocal(e.point.clone());
      onDecalDragMove?.({
        point: [local.x, local.y, local.z],
        meshKey: e.object.name || "body-mesh",
      });
    }
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      onDecalDragEnd?.();
    }
  };

  return (
    <group position={[0, -0.2, 0]} scale={[1.0, 1.0, 1.0]}>
      {proceduralGroup.children.map((child: any, idx: number) => {
        const isBody = child.name === "body-mesh" || idx === 0;
        return (
          <mesh
            key={child.name || idx}
            geometry={child.geometry}
            castShadow
            receiveShadow
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <primitive object={child.material} attach="material" />
            {isBody &&
              decals.map((d, dIdx) => (
                <DecalProjector
                  key={d.id || `proc-decal-${dIdx}`}
                  decal={d}
                  baseScaleMultiplier={0.8}
                />
              ))}
          </mesh>
        );
      })}
    </group>
  );
}

// ─── GLB Model Component with Error Fallback ───────────────────────────────

function GLBGarment({
  bodyColor,
  neckColor,
  garmentStyle = "round-neck",
  partColors,
  materialRoughness = 0.6,
  materialMetalness = 0.05,
  decals = [],
  onPointerHit,
  onDecalDragMove,
  onDecalDragEnd,
}: ShirtModelProps) {
  const modelPath = MODEL_PATHS[garmentStyle] || MODEL_PATHS["round-neck"];
  const { nodes } = useGLTF(modelPath) as any;
  const isDraggingRef = useRef(false);

  const meshKeys = useMemo(
    () => (nodes ? Object.keys(nodes).filter((k) => nodes[k]?.isMesh) : []),
    [nodes]
  );

  const activeTransform = STYLE_TRANSFORMS[garmentStyle] || STYLE_TRANSFORMS["round-neck"];

  const handlePointerDown = (e: ThreeEvent<PointerEvent>, meshKey: string) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    if (e.object && e.point) {
      const local = e.object.worldToLocal(e.point.clone());
      onPointerHit?.({
        point: [local.x, local.y, local.z],
        meshKey,
      });
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>, meshKey: string) => {
    if (!isDraggingRef.current) return;
    e.stopPropagation();
    if (e.object && e.point) {
      const local = e.object.worldToLocal(e.point.clone());
      onDecalDragMove?.({
        point: [local.x, local.y, local.z],
        meshKey,
      });
    }
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      onDecalDragEnd?.();
    }
  };

  const defaultDecalMeshKey =
    meshKeys.find((k) => k === "Object_10" || k.toLowerCase().includes("body") || k.toLowerCase().includes("front")) ||
    meshKeys[0];

  return (
    <group position={activeTransform.position} scale={activeTransform.scale}>
      {meshKeys.map((key, index) => {
        const node = nodes[key];
        const targetColorHex = getPartColorForMesh(
          key,
          index,
          meshKeys.length,
          garmentStyle,
          partColors,
          bodyColor,
          neckColor
        );

        const originalMat = node.material as THREE.MeshStandardMaterial | undefined;
        let clonedMaterial: THREE.MeshStandardMaterial;

        if (originalMat) {
          clonedMaterial = originalMat.clone();
          clonedMaterial.color = new THREE.Color(targetColorHex);
        } else {
          clonedMaterial = new THREE.MeshStandardMaterial({
            color: targetColorHex,
            roughness: materialRoughness,
            metalness: materialMetalness,
            side: THREE.DoubleSide,
          });
        }

        // Match decals targeted to this mesh or default body
        const matchingDecals = decals.filter((d) => {
          if (!d.targetMeshKey) {
            return key === defaultDecalMeshKey;
          }
          return d.targetMeshKey === key;
        });

        const scaleMultiplier = garmentStyle === "hoodie" ? 40 : garmentStyle === "polo" ? 0.8 : 1.0;

        return (
          <mesh
            key={key}
            geometry={node.geometry}
            castShadow
            receiveShadow
            onPointerDown={(e) => handlePointerDown(e, key)}
            onPointerMove={(e) => handlePointerMove(e, key)}
            onPointerUp={handlePointerUp}
          >
            <primitive object={clonedMaterial} attach="material" />
            {matchingDecals.map((dItem, idx) => (
              <DecalProjector
                key={dItem.id || `decal-${idx}`}
                decal={dItem}
                baseScaleMultiplier={scaleMultiplier}
              />
            ))}
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Model Error Boundary (Falls back to Procedural Mesh) ──────────────────

interface ModelBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ModelBoundaryState {
  hasError: boolean;
}

class ModelErrorBoundary extends Component<ModelBoundaryProps, ModelBoundaryState> {
  constructor(props: ModelBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ModelBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("[GLB Model Failed, using Procedural Mesh fallback]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ─── Main ShirtModel Orchestrator ──────────────────────────────────────────

export function ShirtModel(props: ShirtModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { currentView = "front", garmentStyle = "round-neck" } = props;

  // Compile active decals list
  const activeDecals: ShirtDecalItem[] = useMemo(() => {
    if (props.decals && props.decals.length > 0) {
      return props.decals;
    }
    if (props.decal && props.decal.url) {
      return [
        {
          url: props.decal.url,
          position: props.decal.position,
          rotation: props.decal.rotation,
          scale: props.decal.scale,
          targetMeshKey: "Object_10",
        },
      ];
    }
    return [];
  }, [props.decals, props.decal]);

  // View angle interpolation
  const targetRotationY = useMemo(() => {
    if (currentView === "back") return Math.PI;
    if (currentView === "leftSleeve") return Math.PI / 2;
    if (currentView === "rightSleeve") return -Math.PI / 2;
    return 0;
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
      <ModelErrorBoundary
        fallback={<ProceduralGarment {...props} decals={activeDecals} />}
      >
        <React.Suspense
          fallback={<ProceduralGarment {...props} decals={activeDecals} />}
        >
          <GLBGarment {...props} decals={activeDecals} />
        </React.Suspense>
      </ModelErrorBoundary>
    </group>
  );
}
