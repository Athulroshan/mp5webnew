"use client";

import React, {
  useRef,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import * as THREE from "three";
import { Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Upload, Sparkles } from "lucide-react";
import { useEditor } from "./editor-context";
import { R3FCanvas } from "@/components/customization/r3f-canvas";
import {
  ShirtDecalItem,
  getDefaultDecalAnchor,
} from "@/components/customization/shirt-model";
import { Design, ViewKey } from "./types";

export interface CanvasStageRef {
  exportPNG: () => void;
}

export const CanvasStage = forwardRef<CanvasStageRef>((_, ref) => {
  const { state, dispatch, currentDesigns } = useEditor();
  const {
    currentView,
    selectedDesignId,
    shirtColor,
    partColors,
    garmentStyle,
    zoom,
  } = state;

  const r3fGlRef = useRef<THREE.WebGLRenderer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // ── Drag & Drop file upload on Canvas Stage (PNG/JPG/WEBP) ───────────────
  const processUploadedFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file (PNG, JPG, or WEBP).");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert("File exceeds 50 MB limit.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        if (!url) return;

        const maxZ = Math.max(0, ...currentDesigns.map((d) => d.zIndex));
        const newDesign: Design = {
          id: `design-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          url,
          name: file.name.replace(/\.[^/.]+$/, ""),
          x: 0.5,
          y: 0.45,
          scale: 1.0,
          rotation: 0,
          visible: true,
          zIndex: maxZ + 1,
        };

        dispatch({
          type: "ADD_DESIGN",
          payload: { view: currentView, design: newDesign },
        });
      };
      reader.readAsDataURL(file);
    },
    [currentDesigns, currentView, dispatch]
  );

  const handleStageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    Array.from(e.dataTransfer.files)
      .filter((f) => f.type.startsWith("image/"))
      .forEach(processUploadedFile);
  };

  // ── Compile 3D Decals from EditorContext designs ──────────────────────────
  const decals: ShirtDecalItem[] = useMemo(() => {
    const list: ShirtDecalItem[] = [];

    // Map designs from ALL views so they remain visible when rotating 3D view
    const allViews: ViewKey[] = ["front", "back", "leftSleeve", "rightSleeve"];

    allViews.forEach((v) => {
      const viewDesigns = state.designs[v] || [];
      const anchor = getDefaultDecalAnchor(garmentStyle, v);

      // Coordinate scaling based on style
      const rangeX = garmentStyle === "hoodie" ? 45 : garmentStyle === "polo" ? 0.22 : 0.25;
      const rangeY = garmentStyle === "hoodie" ? 45 : garmentStyle === "polo" ? 0.22 : 0.30;
      const rangeZ = garmentStyle === "hoodie" ? 20 : garmentStyle === "polo" ? 0.15 : 0.18;

      viewDesigns
        .filter((d) => d.visible)
        .forEach((d) => {
          let px = anchor.position[0];
          let py = anchor.position[1];
          let pz = anchor.position[2];

          if (v === "front") {
            px += (d.x - 0.5) * rangeX;
            py -= (d.y - 0.5) * rangeY;
          } else if (v === "back") {
            px -= (d.x - 0.5) * rangeX;
            py -= (d.y - 0.5) * rangeY;
          } else if (v === "leftSleeve") {
            pz -= (d.x - 0.5) * rangeZ;
            py -= (d.y - 0.5) * rangeY;
          } else if (v === "rightSleeve") {
            pz += (d.x - 0.5) * rangeZ;
            py -= (d.y - 0.5) * rangeY;
          }

          const rotRad = (d.rotation * Math.PI) / 180;
          const rx = anchor.rotation[0];
          const ry = anchor.rotation[1];
          const rz = anchor.rotation[2] + rotRad;

          list.push({
            id: d.id,
            url: d.url,
            view: v,
            position: [px, py, pz],
            rotation: [rx, ry, rz],
            scale: anchor.baseScale * d.scale,
            scaleFactor: d.scale,
            rotationDeg: d.rotation,
          });
        });
    });

    return list;
  }, [state.designs, garmentStyle]);

  // ── Click-To-Place and Drag-To-Move 3D Decal ──────────────────────────────
  const handlePointerHit = useCallback(
    (hit: { point: [number, number, number]; meshKey?: string }) => {
      // Find active design to place
      const targetId = selectedDesignId || currentDesigns[currentDesigns.length - 1]?.id;
      if (!targetId) return;

      const anchor = getDefaultDecalAnchor(garmentStyle, currentView);
      const rangeX = garmentStyle === "hoodie" ? 45 : garmentStyle === "polo" ? 0.22 : 0.25;
      const rangeY = garmentStyle === "hoodie" ? 45 : garmentStyle === "polo" ? 0.22 : 0.30;

      let newX = 0.5;
      let newY = 0.5;

      if (currentView === "front" || currentView === "back") {
        const signX = currentView === "back" ? -1 : 1;
        newX = 0.5 + (signX * (hit.point[0] - anchor.position[0])) / rangeX;
        newY = 0.5 - (hit.point[1] - anchor.position[1]) / rangeY;
      } else {
        newX = 0.5 - (hit.point[2] - anchor.position[2]) / rangeX;
        newY = 0.5 - (hit.point[1] - anchor.position[1]) / rangeY;
      }

      newX = Math.max(0.05, Math.min(0.95, newX));
      newY = Math.max(0.05, Math.min(0.95, newY));

      dispatch({
        type: "UPDATE_DESIGN",
        payload: {
          view: currentView,
          id: targetId,
          changes: { x: newX, y: newY },
        },
      });
    },
    [selectedDesignId, currentDesigns, garmentStyle, currentView, dispatch]
  );

  const handleDecalDragMove = useCallback(
    (hit: { point: [number, number, number] }) => {
      handlePointerHit(hit);
    },
    [handlePointerHit]
  );

  // ── Export PNG via gl.domElement.toDataURL with preserveDrawingBuffer ──────
  const exportPNG = useCallback(() => {
    const gl = r3fGlRef.current;
    if (!gl || !gl.domElement) {
      alert("3D canvas is still initializing. Please wait a moment.");
      return;
    }

    try {
      // Export directly from WebGL canvas
      const dataUrl = gl.domElement.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `mpss-${garmentStyle}-custom-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export image. Please try again.");
    }
  }, [garmentStyle]);

  useImperativeHandle(ref, () => ({ exportPNG }), [exportPNG]);

  const selectedDesign = currentDesigns.find((d) => d.id === selectedDesignId);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{ background: "#eef2f6" }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleStageDrop}
    >
      {/* Interactive 3D WebGL Canvas */}
      <R3FCanvas
        bodyColor={partColors.body || shirtColor}
        neckColor={partColors.collar || shirtColor}
        garmentStyle={garmentStyle}
        partColors={partColors}
        currentView={currentView}
        zoom={zoom}
        materialRoughness={
          state.material.id === "cotton"
            ? 0.7
            : state.material.id === "polyester"
            ? 0.35
            : state.material.id === "dry-fit"
            ? 0.4
            : 0.6
        }
        materialMetalness={state.material.id === "polyester" ? 0.1 : 0.03}
        decals={decals}
        className="w-full h-full"
        onPointerHit={handlePointerHit}
        onDecalDragMove={handleDecalDragMove}
        onGlReady={(gl) => {
          r3fGlRef.current = gl;
        }}
      />

      {/* Drag & Drop Visual Indicator Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-violet-600/20 backdrop-blur-xs border-4 border-dashed border-violet-500 rounded-2xl flex flex-col items-center justify-center pointer-events-none z-20 transition-all">
          <div className="bg-white p-5 rounded-2xl shadow-2xl flex flex-col items-center gap-2 text-violet-700 animate-bounce">
            <Upload className="w-8 h-8 text-violet-600" />
            <p className="font-extrabold text-sm">Drop Artwork Image Here</p>
            <p className="text-xs text-slate-500">Projects automatically via 3D Decal</p>
          </div>
        </div>
      )}

      {/* 3D Click & Drag placement hint */}
      {currentDesigns.length > 0 && (
        <div className="absolute top-3 left-4 pointer-events-none z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur rounded-xl border border-slate-200/60 shadow-xs text-[11px] text-slate-600 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          <span>Click anywhere on garment to place logo • Drag to move</span>
        </div>
      )}

      {/* Floating Toolbar for Selected Artwork */}
      {selectedDesign && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl text-xs z-20 border border-white/10 animate-in fade-in slide-in-from-bottom-2">
          <span className="text-slate-200 max-w-[120px] truncate font-semibold">
            {selectedDesign.name}
          </span>
          <div className="w-px h-4 bg-slate-700" />
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "BRING_FORWARD",
                payload: { view: currentView, id: selectedDesignId! },
              })
            }
            className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
            title="Bring forward"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "SEND_BACKWARD",
                payload: { view: currentView, id: selectedDesignId! },
              })
            }
            className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
            title="Send backward"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "TOGGLE_VISIBLE",
                payload: { view: currentView, id: selectedDesignId! },
              })
            }
            className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
            title="Toggle visibility"
          >
            {selectedDesign.visible ? (
              <Eye className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <EyeOff className="h-3.5 w-3.5 text-slate-500" />
            )}
          </button>
          <div className="w-px h-4 bg-slate-700" />
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "DELETE_DESIGN",
                payload: { view: currentView, id: selectedDesignId! },
              })
            }
            className="p-1 rounded-lg hover:bg-red-600/30 text-red-400 transition-colors"
            title="Delete artwork"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
});

CanvasStage.displayName = "CanvasStage";
