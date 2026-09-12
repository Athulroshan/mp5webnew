/**
 * Interactive 3D WebGL Canvas Studio Viewer with Decal Projection
 * Uses Three.js DecalGeometry (inspired by r3f-mug / @react-three/drei Decal)
 * to write/project uploaded images directly OVER the 3D T-Shirt model surface!
 */
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";
import { createTShirtMesh, GarmentColors } from "@/lib/garment-model-generator";
import { RotateCw, Play, Pause, RefreshCw, ZoomIn, ZoomOut, Box, Move, SlidersHorizontal, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DecalState {
  url: string;
  position: [number, number, number]; // [x, y, z] relative to model center
  rotation: number; // in degrees
  scale: number; // 0.1 .. 3.0
  panel: "front" | "back" | "left_sleeve" | "right_sleeve";
}

interface ThreeDCanvasProps {
  colors: GarmentColors;
  decal: DecalState | null;
  className?: string;
  modelPath?: string;
  onUpdateDecal?: (decal: DecalState) => void;
}

export function ThreeDCanvas({
  colors,
  decal,
  className = "",
  modelPath = "/3dproducts/t_shirt.glb",
  onUpdateDecal,
}: ThreeDCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const garmentGroupRef = useRef<THREE.Group | null>(null);
  const targetMeshRef = useRef<THREE.Mesh | null>(null);
  const decalMeshRef = useRef<THREE.Mesh | null>(null);
  const decalTextureRef = useRef<THREE.Texture | null>(null);

  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [isGLTFModel, setIsGLTFModel] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  const isDraggingRef = useRef(false);
  const isDecalDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // Update or Create Decal Mesh projected directly over 3D model surface
  const updateDecalMesh = useCallback(async () => {
    const scene = sceneRef.current;
    const targetMesh = targetMeshRef.current;
    if (!scene || !targetMesh || !decal || !decal.url) {
      if (decalMeshRef.current && scene) {
        scene.remove(decalMeshRef.current);
        decalMeshRef.current.geometry.dispose();
        decalMeshRef.current = null;
      }
      return;
    }

    // Load Decal Image Texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      decal.url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        decalTextureRef.current = texture;

        // Remove old decal mesh if exists
        if (decalMeshRef.current) {
          scene.remove(decalMeshRef.current);
          decalMeshRef.current.geometry.dispose();
          decalMeshRef.current = null;
        }

        // Calculate Decal 3D Position, Orientation & Size
        const pos = new THREE.Vector3(decal.position[0], decal.position[1], decal.position[2]);
        const orientation = new THREE.Euler(0, 0, (decal.rotation * Math.PI) / 180);

        // Aspect ratio of texture
        const img = texture.image as HTMLImageElement | undefined;
        const aspect = img && img.height > 0 ? img.width / img.height : 1.0;
        const sizeScale = decal.scale * 0.45;
        const size = new THREE.Vector3(sizeScale * aspect, sizeScale, 0.4);

        try {
          // Generate DecalGeometry wrapped over model surface
          const decalGeo = new DecalGeometry(targetMesh, pos, orientation, size);

          const decalMat = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            roughness: 0.7,
            metalness: 0.05,
          });

          const decalMesh = new THREE.Mesh(decalGeo, decalMat);
          decalMesh.name = "decal-overlay-mesh";
          scene.add(decalMesh);
          decalMeshRef.current = decalMesh;
        } catch (err) {
          console.error("DecalGeometry generation error:", err);
        }
      },
      undefined,
      (err) => console.error("Decal texture load error:", err)
    );
  }, [decal]);

  // Initialize Three.js WebGL Scene & Load GLB Model
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // ─── Scene ──────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f8fafc");
    sceneRef.current = scene;

    // ─── Camera ─────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 4.2);
    cameraRef.current = camera;

    // ─── Renderer ───────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ─── Studio Lighting Setup ──────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(3, 4, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.8);
    fillLight.position.set(-3, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xecfdf5, 0.9);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Ground Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(6, 6);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.6;
    shadowMesh.receiveShadow = true;
    scene.add(shadowMesh);

    // Group for Garment
    const garmentGroup = new THREE.Group();
    scene.add(garmentGroup);
    garmentGroupRef.current = garmentGroup;

    // ─── Load GLTF / GLB Model ───────────────────────────────
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;

        // Normalize size & center
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetScale = 2.4 / (maxDim || 1);

        model.scale.set(targetScale, targetScale, targetScale);
        model.position.x = -center.x * targetScale;
        model.position.y = -center.y * targetScale;
        model.position.z = -center.z * targetScale;

        // Traverse GLTF meshes to set body color and register target mesh for decal projection
        let chosenTargetMesh: THREE.Mesh | null = null;

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material) {
              const mat = child.material.clone();
              child.material = mat;
              mat.color.set(colors.body);
            }

            // Pick front body mesh for decal target
            if (!chosenTargetMesh || child.name.toLowerCase().includes("body_front") || child.name.includes("Object_10")) {
              chosenTargetMesh = child;
            }
          }
        });

        targetMeshRef.current = chosenTargetMesh || (model.children[0] as THREE.Mesh);
        garmentGroup.add(model);
        setModelLoaded(true);
        setIsGLTFModel(true);
      },
      undefined,
      (err) => {
        console.warn("Using procedural 3D model fallback:", err);
        const procGroup = createTShirtMesh(colors);
        const bodyMesh = procGroup.getObjectByName("body-mesh") as THREE.Mesh;
        targetMeshRef.current = bodyMesh;
        garmentGroup.add(procGroup);
        setModelLoaded(true);
        setIsGLTFModel(false);
      }
    );

    // ─── Animation Loop ─────────────────────────────────────
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (garmentGroupRef.current && isAutoRotate && !isDraggingRef.current) {
        garmentGroupRef.current.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [modelPath]);

  // Redraw Decal Mesh whenever decal prop changes
  useEffect(() => {
    updateDecalMesh();
  }, [updateDecalMesh]);

  // Update Body & Collar colors dynamically
  useEffect(() => {
    const garment = garmentGroupRef.current;
    if (!garment) return;

    garment.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material && child.name !== "decal-overlay-mesh") {
        if (child.name === "neck-mesh" || child.name === "hem-mesh") {
          (child.material as THREE.MeshStandardMaterial).color.set(colors.neck || colors.body);
        } else {
          (child.material as THREE.MeshStandardMaterial).color.set(colors.body);
        }
      }
    });
  }, [colors]);

  // Raycast click/drag directly on 3D Model Surface to position decal
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cameraRef.current || !targetMeshRef.current || !mountRef.current || !decal || !onUpdateDecal) {
      isDraggingRef.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const rect = mountRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const intersects = raycaster.intersectObject(targetMeshRef.current, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      isDecalDraggingRef.current = true;

      // Update 3D Decal position from Raycast hit point
      onUpdateDecal({
        ...decal,
        position: [hit.point.x, hit.point.y, hit.point.z + 0.05],
      });
    } else {
      isDraggingRef.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDecalDraggingRef.current && cameraRef.current && targetMeshRef.current && mountRef.current && decal && onUpdateDecal) {
      const rect = mountRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);
      const intersects = raycaster.intersectObject(targetMeshRef.current, true);

      if (intersects.length > 0) {
        const hit = intersects[0];
        onUpdateDecal({
          ...decal,
          position: [hit.point.x, hit.point.y, hit.point.z + 0.05],
        });
      }
    } else if (isDraggingRef.current && garmentGroupRef.current) {
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      garmentGroupRef.current.rotation.y += deltaX * 0.01;
      garmentGroupRef.current.rotation.x = Math.max(-0.4, Math.min(0.4, garmentGroupRef.current.rotation.x + deltaY * 0.005));

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    isDecalDraggingRef.current = false;
  };

  const resetCamera = () => {
    if (garmentGroupRef.current) {
      garmentGroupRef.current.rotation.set(0, 0, 0);
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0.2, 4.2);
    }
  };

  const zoomCamera = (delta: number) => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(2.2, Math.min(6.5, cameraRef.current.position.z + delta));
    }
  };

  return (
    <div className={`relative w-full h-[520px] bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm ${className}`}>
      {/* 3D WebGL Canvas Surface */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* GLTF Model Badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full shadow-md">
        <Box className="w-3.5 h-3.5 text-emerald-400" />
        <span>{isGLTFModel ? "3D GLB Model (t_shirt.glb)" : "3D Mesh Loaded"}</span>
      </div>

      {/* Floating Studio Toolbar */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white/80 backdrop-blur border border-slate-200/80 rounded-xl p-1.5 shadow-md">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsAutoRotate(!isAutoRotate)}
          className={`h-8 w-8 ${isAutoRotate ? "text-emerald-600 bg-emerald-50" : "text-slate-600"}`}
          title={isAutoRotate ? "Pause Auto Rotation" : "Play Auto Rotation"}
        >
          {isAutoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>

        <Button size="icon" variant="ghost" onClick={resetCamera} className="h-8 w-8 text-slate-600 hover:text-slate-900" title="Reset View">
          <RefreshCw className="w-4 h-4" />
        </Button>

        <div className="h-px w-full bg-slate-200" />

        <Button size="icon" variant="ghost" onClick={() => zoomCamera(-0.4)} className="h-8 w-8 text-slate-600 hover:text-slate-900" title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </Button>

        <Button size="icon" variant="ghost" onClick={() => zoomCamera(0.4)} className="h-8 w-8 text-slate-600 hover:text-slate-900" title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
          <Move className="w-3.5 h-3.5 text-emerald-400" />
          <span>Click directly on 3D T-shirt to place &amp; drag decal over model surface</span>
        </div>
      </div>
    </div>
  );
}
