/**
 * R3F Shirt Model Component (r3f-mug architecture)
 * Renders GLB 3D model with R3F <Decal> wrapped smoothly over the model surface.
 * Supports direct 3D raycast click & drag positioning.
 */
"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useGLTF, useTexture, Decal } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";

import { GarmentStyle } from "@/components/customization/studio/types";
import { createGarmentMesh } from "@/lib/garment-model-generator";

export interface ShirtDecalItem {
  id?: string;
  url: string;
  position: [number, number, number]; // [x, y, z]
  rotation: [number, number, number]; // [rx, ry, rz] in radians
  scale: [number, number, number] | number; // [sx, sy, sz]
  targetMeshKey?: string; // "Object_10" (front), "Object_14" (back), "Object_18" (left sleeve), "Object_20" (right sleeve)
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
  onPointerHit?: (point: [number, number, number]) => void;
}

/**
 * Individual Decal Projector Component for 3D Mesh surface
 */
function DecalProjector({ decal }: { decal: ShirtDecalItem }) {
  const decalTexture = useTexture(decal.url);

  if (decalTexture) {
    decalTexture.colorSpace = THREE.SRGBColorSpace;
    decalTexture.anisotropy = 8;
  }

  const img = decalTexture?.image as HTMLImageElement | undefined;
  const aspect = img && img.height > 0
    ? img.width / img.height
    : 1.0;

  const baseScale = Array.isArray(decal.scale)
    ? decal.scale[1]
    : typeof decal.scale === "number" ? decal.scale : 0.35;

  const scaleVector: [number, number, number] = [
    baseScale * aspect,
    baseScale,
    1.2,
  ];

  return (
    <Decal
      position={decal.position}
      rotation={decal.rotation}
      scale={scaleVector}
      map={decalTexture}
      depthTest={true}
      polygonOffsetFactor={-4}
    />
  );
}

const MODEL_PATHS: Record<string, string> = {
  "round-neck":  "/3dproducts/t_shirt.glb",
  "polo":        "/3dproducts/polo_tshirt.glb",
  "hoodie":      "/3dproducts/hoodie.glb",
  "oversized":   "/3dproducts/t_shirt.glb",
  "full-sleeve": "/3dproducts/t_shirt.glb",
  "half-sleeve": "/3dproducts/t_shirt.glb",
};

const STYLE_TRANSFORMS: Record<string, { position: [number, number, number]; scale: [number, number, number] }> = {
  "round-neck":  { position: [0, -2.81, 0.26], scale: [2.2, 2.2, 2.2] },
  "polo":        { position: [0, -1.35, 0],    scale: [3.8, 3.8, 3.8] },
  "hoodie":      { position: [0, -3.3, 0],     scale: [0.024, 0.024, 0.024] },
  "oversized":   { position: [0, -2.81, 0.26], scale: [2.2, 2.2, 2.2] },
  "full-sleeve": { position: [0, -2.81, 0.26], scale: [2.2, 2.2, 2.2] },
  "half-sleeve": { position: [0, -2.81, 0.26], scale: [2.2, 2.2, 2.2] },
};

function getPartColorForMesh(
  key: string,
  index: number,
  totalKeys: number,
  garmentStyle: string,
  partColors?: { body?: string; sleeves?: string; collar?: string; leftSleeve?: string; rightSleeve?: string },
  bodyColor?: string,
  neckColor?: string
): string {
  const keyLower = key.toLowerCase();
  const bodyHex = partColors?.body || bodyColor || "#ffffff";
  const collarHex = partColors?.collar || neckColor || bodyHex;
  const sleevesHex = partColors?.sleeves || bodyHex;
  const leftSleeveHex = partColors?.leftSleeve || sleevesHex;
  const rightSleeveHex = partColors?.rightSleeve || sleevesHex;

  const isNeckOrHood =
    keyLower.includes("ribbing") ||
    keyLower.includes("neck") ||
    keyLower.includes("collar") ||
    keyLower.includes("hood") ||
    key === "Object_6" ||
    key === "Object_8";

  const isLeftSleeve =
    key === "Object_18" ||
    keyLower.includes("sleeve_l") ||
    keyLower.includes("left_sleeve") ||
    keyLower.includes("leftsleeve") ||
    keyLower.includes("sleeve1");

  const isRightSleeve =
    key === "Object_20" ||
    keyLower.includes("sleeve_r") ||
    keyLower.includes("right_sleeve") ||
    keyLower.includes("rightsleeve") ||
    keyLower.includes("sleeve2");

  const isGenericSleeve = isLeftSleeve || isRightSleeve || keyLower.includes("sleeve");

  if (isNeckOrHood) return collarHex;
  if (isLeftSleeve) return leftSleeveHex;
  if (isRightSleeve) return rightSleeveHex;
  if (isGenericSleeve) return sleevesHex;

  // Hoodie GLB mesh index fallback (0: Body, 1: Left sleeve, 2: Right sleeve, 3: Hood & Cuffs)
  if (garmentStyle === "hoodie" && totalKeys >= 4) {
    if (index === 1) return leftSleeveHex;
    if (index === 2) return rightSleeveHex;
    if (index === 3) return collarHex;
    return bodyHex;
  }

  return bodyHex;
}

export function ShirtModel({
  bodyColor,
  neckColor,
  garmentStyle = "round-neck",
  partColors,
  currentView = "front",
  materialRoughness = 0.6,
  materialMetalness = 0.05,
  decal,
  decals,
  onPointerHit,
}: ShirtModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Dynamically load corresponding 3D GLB model based on selected style
  const modelPath = MODEL_PATHS[garmentStyle] || MODEL_PATHS["round-neck"];
  const { nodes } = useGLTF(modelPath) as any;

  // Generate procedural 3D garment group for custom styles as fallback
  const proceduralGroup = React.useMemo(() => {
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

  // Debug requirement: Log loaded GLB mesh hierarchy
  React.useEffect(() => {
    if (groupRef.current) {
      console.log(`\n[3D Studio Debug] Active Garment: ${garmentStyle} (Model: ${modelPath})`);
      groupRef.current.traverse((child: any) => {
        if (child.isMesh) {
          console.log(`Mesh: "${child.name}", Material: "${child.material?.name || "unnamed"}"`);
        }
      });
    }
  }, [garmentStyle, modelPath, nodes]);

  // Calculate target rotation Y based on current view
  const targetRotationY =
    currentView === "back" ? Math.PI :
    currentView === "leftSleeve" ? Math.PI / 2 :
    currentView === "rightSleeve" ? -Math.PI / 2 : 0;

  // Smoothly interpolate rotation to target view
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetRotationY,
        8,
        delta
      );
    }
  });

  // Handle raycast click directly on 3D shirt surface to position decal
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (onPointerHit && e.point) {
      onPointerHit([e.point.x, e.point.y, e.point.z]);
    }
  };

  // Compile active decals list
  const activeDecals: ShirtDecalItem[] = [];
  if (decals && decals.length > 0) {
    activeDecals.push(...decals);
  } else if (decal && decal.url) {
    activeDecals.push({
      url: decal.url,
      position: decal.position,
      rotation: decal.rotation,
      scale: decal.scale,
      targetMeshKey: "Object_10",
    });
  }

  const meshKeys = nodes ? Object.keys(nodes).filter((k) => nodes[k]?.isMesh) : [];
  const defaultFrontKey = meshKeys.find((k) => k === "Object_10" || k.toLowerCase().includes("body") || k.toLowerCase().includes("front")) || meshKeys[0];

  const hasGLBModel = Boolean(nodes && meshKeys.length > 0);
  const activeTransform = STYLE_TRANSFORMS[garmentStyle] || STYLE_TRANSFORMS["round-neck"];

  return (
    <group
      ref={groupRef}
      dispose={null}
      position={activeTransform.position}
      scale={activeTransform.scale}
    >
      {hasGLBModel ? (
        meshKeys.map((key, index) => {
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

          // Clone native material to preserve normal maps, roughness, metalness, and fabric details
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

          // Find decals assigned to this mesh key
          const matchingDecals = activeDecals.filter((d) => {
            const targetKey = d.targetMeshKey || defaultFrontKey;
            return targetKey === key || targetKey === "Object_10";
          });

          return (
            <mesh
              key={key}
              geometry={node.geometry}
              castShadow
              receiveShadow
              onPointerDown={handlePointerDown}
            >
              <primitive object={clonedMaterial} attach="material" />

              {/* Render multi-panel Decals targeted at this mesh part */}
              {matchingDecals.map((dItem, idx) => (
                <DecalProjector key={dItem.id || `decal-${idx}`} decal={dItem} />
              ))}
            </mesh>
          );
        })
      ) : (
        /* Render style-specific 3D Garment Mesh */
        proceduralGroup.children.map((child: any, idx: number) => (
          <mesh
            key={child.name || idx}
            geometry={child.geometry}
            castShadow
            receiveShadow
            onPointerDown={handlePointerDown}
          >
            <primitive object={child.material} attach="material" />
            {/* Project artwork decals onto the torso body surface */}
            {(child.name === "body-mesh" || idx === 0) &&
              activeDecals.map((dItem, dIdx) => (
                <DecalProjector key={dItem.id || `proc-decal-${dIdx}`} decal={dItem} />
              ))}
          </mesh>
        ))
      )}
    </group>
  );
}

useGLTF.preload("/3dproducts/t_shirt.glb");
useGLTF.preload("/3dproducts/polo_tshirt.glb");
useGLTF.preload("/3dproducts/hoodie.glb");

