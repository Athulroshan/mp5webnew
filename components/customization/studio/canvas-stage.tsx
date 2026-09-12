/**
 * CanvasStage — Main editor canvas area.
 *
 * Architecture:
 *   ┌─────────────────────────────────┐
 *   │  R3F 3D canvas (shirt/color)    │ ← background
 *   │  + 2D HTML Canvas overlay       │ ← design images + handles
 *   └─────────────────────────────────┘
 *
 * Interaction model:
 *   pointer-down → hit-test handles → start drag/resize/rotate
 *   pointer-move → update transform (via ref, no re-render during drag)
 *   pointer-up   → commit to EditorContext (triggers R3F decal update)
 *
 * Export:
 *   1. Capture R3F WebGL canvas via preserveDrawingBuffer
 *   2. Composite design images on offscreen canvas
 *   3. Trigger PNG download
 */
"use client";

import React, {
  useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle,
} from "react";
import { Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { Design, PrintArea, PRINT_AREAS, ViewKey, Handle, HandleId } from "./types";
import { useEditor } from "./editor-context";
import { R3FCanvas } from "@/components/customization/r3f-canvas";
import { ShirtDecalItem } from "@/components/customization/shirt-model";

// ─── Constants ────────────────────────────────────────────────────────────

const HANDLE_RADIUS = 6;
const ROT_HANDLE_OFFSET = 28; // px above top-center

// ─── Coordinate helpers ────────────────────────────────────────────────────

function designToCanvas(
  d: Design, area: PrintArea, cw: number, ch: number
): { cx: number; cy: number } {
  return {
    cx: (area.left + d.x * area.width) * cw,
    cy: (area.top + d.y * area.height) * ch,
  };
}

function getDesignPixelSize(
  d: Design, img: HTMLImageElement, area: PrintArea, cw: number
): { w: number; h: number } {
  const baseW = area.width * cw * 0.40; // 40% of print area at scale=1
  const aspect = img.naturalWidth / img.naturalHeight;
  return {
    w: baseW * d.scale * (aspect >= 1 ? 1 : aspect),
    h: baseW * d.scale * (aspect >= 1 ? 1 / aspect : 1),
  };
}

function isInsideRotatedRect(
  px: number, py: number,
  cx: number, cy: number,
  w: number, h: number,
  rotDeg: number,
  padding = 8
): boolean {
  const dx = px - cx;
  const dy = py - cy;
  const rad = (-rotDeg * Math.PI) / 180;
  const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
  const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
  return Math.abs(rx) <= w / 2 + padding && Math.abs(ry) <= h / 2 + padding;
}

// ─── Canvas rendering ─────────────────────────────────────────────────────

async function renderOverlay(
  canvas: HTMLCanvasElement,
  designs: Design[],
  selectedId: string | null,
  area: PrintArea,
  imageCache: Map<string, HTMLImageElement>,
  zoom: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const cw = canvas.width;
  const ch = canvas.height;

  ctx.clearRect(0, 0, cw, ch);

  // Draw print area guide (very subtle)
  ctx.save();
  ctx.strokeStyle = "rgba(124,58,237,0.12)";
  ctx.setLineDash([6, 4]);
  ctx.lineWidth = 1;
  ctx.strokeRect(area.left * cw, area.top * ch, area.width * cw, area.height * ch);
  ctx.setLineDash([]);
  ctx.restore();

  // Draw designs back-to-front (sorted by zIndex)
  const sorted = [...designs].sort((a, b) => a.zIndex - b.zIndex);

  for (const d of sorted) {
    if (!d.visible) continue;
    const img = imageCache.get(d.url);
    if (!img) continue;

    const { cx, cy } = designToCanvas(d, area, cw, ch);
    const { w, h } = getDesignPixelSize(d, img, area, cw);
    const rotRad = (d.rotation * Math.PI) / 180;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotRad);
    ctx.globalAlpha = 1;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);

    // Selection box + handles
    if (d.id === selectedId) {
      ctx.strokeStyle = "#7c3aed";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8);

      // Corner + edge handles
      const pts: [number, number][] = [
        [-w / 2 - 4, -h / 2 - 4], [0, -h / 2 - 4], [w / 2 + 4, -h / 2 - 4],
        [-w / 2 - 4, 0],                             [w / 2 + 4, 0],
        [-w / 2 - 4,  h / 2 + 4], [0,  h / 2 + 4], [w / 2 + 4,  h / 2 + 4],
      ];
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#7c3aed";
      ctx.lineWidth = 1.5;
      pts.forEach(([hx, hy]) => {
        ctx.beginPath();
        ctx.arc(hx, hy, HANDLE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Rotation handle line + circle
      ctx.strokeStyle = "#7c3aed";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -h / 2 - 4);
      ctx.lineTo(0, -h / 2 - 4 - ROT_HANDLE_OFFSET);
      ctx.stroke();

      ctx.fillStyle = "#7c3aed";
      ctx.beginPath();
      ctx.arc(0, -h / 2 - 4 - ROT_HANDLE_OFFSET, HANDLE_RADIUS + 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("↻", 0, -h / 2 - 4 - ROT_HANDLE_OFFSET);
    }

    ctx.restore();
  }
}

// ─── Build R3F decal list from designs ────────────────────────────────────

function buildDecals(
  designs: Design[],
  view: ViewKey,
  area: PrintArea,
  canvasW: number,
  canvasH: number,
  imageCache: Map<string, HTMLImageElement>
): ShirtDecalItem[] {
  const decalPositions: Record<ViewKey, [number, number, number]> = {
    front:      [0,  1.25,  0.32],
    back:       [0,  1.25, -0.32],
    leftSleeve: [-0.65, 1.25, 0.0],
    rightSleeve:[0.65,  1.25, 0.0],
  };
  const decalRotations: Record<ViewKey, [number, number, number]> = {
    front:      [0, 0, 0],
    back:       [0, Math.PI, 0],
    leftSleeve: [0, -Math.PI / 2, 0],
    rightSleeve:[0,  Math.PI / 2, 0],
  };

  return designs.filter(d => d.visible).map(d => {
    const img = imageCache.get(d.url);
    const aspect = img ? img.naturalWidth / img.naturalHeight : 1;
    const baseScale = 0.30 * d.scale;
    const [br, bg, bb] = decalRotations[view];
    const rotRad = (d.rotation * Math.PI) / 180;

    // Offset position within the decal plane
    const offsetX = (d.x - 0.5) * 0.6;
    const offsetY = -(d.y - 0.5) * 0.6;
    const [bx, by, bz] = decalPositions[view];

    return {
      id: d.id,
      url: d.url,
      targetMeshKey: view === "front" ? "Object_10" :
                     view === "back"  ? "Object_14" :
                     view === "leftSleeve" ? "Object_18" : "Object_20",
      position: [bx + offsetX, by + offsetY, bz] as [number,number,number],
      rotation: [br, bg, bb + rotRad] as [number,number,number],
      scale: [baseScale * aspect, baseScale, 0.6] as [number,number,number],
    };
  });
}

// ─── Hit test helpers ─────────────────────────────────────────────────────

function hitTestHandle(
  px: number, py: number,
  cx: number, cy: number,
  w: number, h: number,
  rotDeg: number
): HandleId | null {
  const rotRad = (-rotDeg * Math.PI) / 180;

  // Rotate point back to design space
  const dx = px - cx;
  const dy = py - cy;
  const lx = dx * Math.cos(rotRad) - dy * Math.sin(rotRad);
  const ly = dx * Math.sin(rotRad) + dy * Math.cos(rotRad);

  const hw = w / 2 + 4;
  const hh = h / 2 + 4;
  const r = HANDLE_RADIUS + 4;

  // Check rotation handle (in local coords at top-center, above selection box)
  const rotHandleY = -(h / 2 + 4 + ROT_HANDLE_OFFSET);
  if (Math.hypot(lx - 0, ly - rotHandleY) <= r + 4) return "rot";

  // Check 8 resize handles
  const handles: [HandleId, number, number][] = [
    ["tl", -hw, -hh], ["tc", 0, -hh], ["tr", hw, -hh],
    ["ml", -hw, 0  ],                  ["mr", hw, 0  ],
    ["bl", -hw,  hh], ["bc", 0,  hh], ["br", hw,  hh],
  ];
  for (const [id, hx, hy] of handles) {
    if (Math.hypot(lx - hx, ly - hy) <= r) return id;
  }

  // Body drag zone
  if (Math.abs(lx) <= hw && Math.abs(ly) <= hh) return "body";
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────

export interface CanvasStageRef {
  exportPNG: () => void;
}

export const CanvasStage = forwardRef<CanvasStageRef>((_, ref) => {
  const { state, dispatch, currentDesigns } = useEditor();
  const { currentView, selectedDesignId, shirtColor, partColors, zoom } = state;

  const overlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const r3fGlRef = useRef<any>(null);       // Three.js renderer
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const renderRAF = useRef<number | null>(null);

  // Drag state (refs — no re-render during move)
  const dragRef = useRef<{
    type: HandleId;
    designId: string;
    startX: number;
    startY: number;
    origDesign: Design;
  } | null>(null);

  // ── Load images ──────────────────────────────────────────────────────────

  const loadImage = useCallback((url: string): Promise<HTMLImageElement> => {
    if (imageCacheRef.current.has(url)) {
      return Promise.resolve(imageCacheRef.current.get(url)!);
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => { imageCacheRef.current.set(url, img); resolve(img); };
      img.onerror = reject;
      img.src = url;
    });
  }, []);

  // Preload all design images
  useEffect(() => {
    currentDesigns.forEach((d) => loadImage(d.url).catch(() => {}));
  }, [currentDesigns, loadImage]);

  // ── Sync canvas size to container ────────────────────────────────────────

  useEffect(() => {
    const sync = () => {
      const overlay = overlayRef.current;
      const container = containerRef.current;
      if (!overlay || !container) return;
      const rect = container.getBoundingClientRect();
      if (overlay.width !== rect.width || overlay.height !== rect.height) {
        overlay.width = rect.width;
        overlay.height = rect.height;
      }
    };
    sync();
    const ro = new ResizeObserver(sync);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Render overlay ────────────────────────────────────────────────────────

  const scheduleRender = useCallback(() => {
    if (renderRAF.current) return;
    renderRAF.current = requestAnimationFrame(async () => {
      renderRAF.current = null;
      const overlay = overlayRef.current;
      if (!overlay) return;
      const area = PRINT_AREAS[currentView];
      await renderOverlay(overlay, currentDesigns, selectedDesignId, area, imageCacheRef.current, zoom);
    });
  }, [currentDesigns, selectedDesignId, currentView, zoom]);

  useEffect(() => { scheduleRender(); }, [scheduleRender]);

  // ── Pointer events ────────────────────────────────────────────────────────

  const getCanvasPoint = (e: React.PointerEvent | PointerEvent): [number, number] => {
    const overlay = overlayRef.current!;
    const rect = overlay.getBoundingClientRect();
    return [
      ((e.clientX - rect.left) / rect.width) * overlay.width,
      ((e.clientY - rect.top) / rect.height) * overlay.height,
    ];
  };

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const overlay = overlayRef.current;
    if (!overlay) return;
    const [px, py] = getCanvasPoint(e);
    const cw = overlay.width;
    const ch = overlay.height;
    const area = PRINT_AREAS[currentView];

    // Sorted top-to-bottom (last = topmost visually)
    const sorted = [...currentDesigns]
      .sort((a, b) => a.zIndex - b.zIndex)
      .reverse();

    for (const d of sorted) {
      if (!d.visible) continue;
      const img = imageCacheRef.current.get(d.url);
      if (!img) continue;
      const { cx, cy } = designToCanvas(d, area, cw, ch);
      const { w, h } = getDesignPixelSize(d, img, area, cw);

      // If this design is selected, check handles first
      if (d.id === selectedDesignId) {
        const hid = hitTestHandle(px, py, cx, cy, w, h, d.rotation);
        if (hid) {
          dispatch({ type: "SELECT_DESIGN", payload: d.id });
          dragRef.current = {
            type: hid, designId: d.id, startX: px, startY: py, origDesign: { ...d },
          };
          return;
        }
      }

      // Hit test body of any design
      if (isInsideRotatedRect(px, py, cx, cy, w, h, d.rotation)) {
        dispatch({ type: "SELECT_DESIGN", payload: d.id });
        dragRef.current = {
          type: "body", designId: d.id, startX: px, startY: py, origDesign: { ...d },
        };
        return;
      }
    }

    // Click on empty area — deselect
    dispatch({ type: "SELECT_DESIGN", payload: null });
  }, [currentDesigns, selectedDesignId, currentView, dispatch]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    const [px, py] = getCanvasPoint(e);
    const cw = overlay.width;
    const ch = overlay.height;
    const area = PRINT_AREAS[currentView];
    const img = imageCacheRef.current.get(drag.origDesign.url);
    if (!img) return;

    const { origDesign, startX, startY, type } = drag;
    const { cx, cy } = designToCanvas(origDesign, area, cw, ch);
    const { w, h } = getDesignPixelSize(origDesign, img, area, cw);

    let changes: Partial<Design> = {};

    if (type === "body") {
      // Drag: move design
      const deltaX = (px - startX) / (area.width * cw);
      const deltaY = (py - startY) / (area.height * ch);
      changes = {
        x: Math.max(0, Math.min(1, origDesign.x + deltaX)),
        y: Math.max(0, Math.min(1, origDesign.y + deltaY)),
      };
    } else if (type === "rot") {
      // Rotation: angle from design center to mouse
      const angle = Math.atan2(py - cy, px - cx) * 180 / Math.PI + 90;
      changes = { rotation: ((angle % 360) + 360) % 360 };
    } else {
      // Scale: distance-based proportional resize
      const origDist = Math.hypot(startX - cx, startY - cy);
      const newDist  = Math.hypot(px - cx, py - cy);
      if (origDist > 1) {
        const factor = newDist / origDist;
        changes = { scale: Math.max(0.1, Math.min(3, origDesign.scale * factor)) };
      }
    }

    // Live update: mutate overlay canvas directly (no state dispatch) for performance
    const d = currentDesigns.find((d) => d.id === drag.designId);
    if (d) {
      const preview = { ...d, ...changes };
      const previewDesigns = currentDesigns.map((dd) =>
        dd.id === drag.designId ? preview : dd
      );
      renderOverlay(overlay, previewDesigns, drag.designId, area, imageCacheRef.current, state.zoom);
    }

    // Store changes for commit on pointer-up
    drag.origDesign = { ...drag.origDesign, ...changes };
  }, [currentDesigns, currentView, state.zoom]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;

    // Commit final position to context (this pushes to history)
    dispatch({
      type: "UPDATE_DESIGN",
      payload: {
        view: currentView,
        id: drag.designId,
        changes: {
          x: drag.origDesign.x,
          y: drag.origDesign.y,
          scale: drag.origDesign.scale,
          rotation: drag.origDesign.rotation,
        },
      },
    });
  }, [currentView, dispatch]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key === "z" && !e.shiftKey) { e.preventDefault(); dispatch({ type: "UNDO" }); }
      if (meta && (e.key === "Z" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); dispatch({ type: "REDO" }); }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedDesignId) {
        dispatch({ type: "DELETE_DESIGN", payload: { view: currentView, id: selectedDesignId } });
      }
      // Arrow keys: fine movement
      if (selectedDesignId && ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const delta = e.shiftKey ? 0.05 : 0.005;
        const d = currentDesigns.find((d) => d.id === selectedDesignId);
        if (!d) return;
        const changes: Partial<Design> = {
          x: e.key === "ArrowLeft"  ? Math.max(0, d.x - delta)
           : e.key === "ArrowRight" ? Math.min(1, d.x + delta) : d.x,
          y: e.key === "ArrowUp"    ? Math.max(0, d.y - delta)
           : e.key === "ArrowDown"  ? Math.min(1, d.y + delta) : d.y,
        };
        dispatch({ type: "UPDATE_DESIGN", payload: { view: currentView, id: selectedDesignId, changes } });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedDesignId, currentView, currentDesigns, dispatch]);

  // ── Build R3F decals ─────────────────────────────────────────────────

  const decals = buildDecals(
    currentDesigns, currentView,
    PRINT_AREAS[currentView],
    overlayRef.current?.width || 800,
    overlayRef.current?.height || 600,
    imageCacheRef.current
  );

  // ── Export ────────────────────────────────────────────────────────────

  const exportPNG = useCallback(async () => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    // 1. Capture R3F WebGL canvas
    const gl3Ref = r3fGlRef.current;
    const webglCanvas = gl3Ref?.domElement as HTMLCanvasElement | undefined;

    const out = document.createElement("canvas");
    out.width = overlay.width;
    out.height = overlay.height;
    const ctx = out.getContext("2d")!;

    // Draw shirt (3D canvas or white fallback)
    if (webglCanvas) {
      try { ctx.drawImage(webglCanvas, 0, 0, out.width, out.height); } catch {}
    } else {
      ctx.fillStyle = shirtColor;
      ctx.fillRect(0, 0, out.width, out.height);
    }

    // Draw designs
    const area = PRINT_AREAS[currentView];
    const sorted = [...currentDesigns].filter(d => d.visible).sort((a, b) => a.zIndex - b.zIndex);
    for (const d of sorted) {
      const img = imageCacheRef.current.get(d.url);
      if (!img) continue;
      const { cx, cy } = designToCanvas(d, area, out.width, out.height);
      const { w, h } = getDesignPixelSize(d, img, area, out.width);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((d.rotation * Math.PI) / 180);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }

    // Download
    out.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mpss-custom-tshirt-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [currentDesigns, currentView, shirtColor]);

  useImperativeHandle(ref, () => ({ exportPNG }), [exportPNG]);

  // Selected design for toolbar
  const selectedDesign = currentDesigns.find((d) => d.id === selectedDesignId);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ background: "#eef2f6" }}
    >
      {/* 3D shirt canvas (background) */}
      <R3FCanvas
        bodyColor={partColors.body || shirtColor}
        neckColor={partColors.collar || shirtColor}
        garmentStyle={state.garmentStyle}
        partColors={partColors}
        currentView={currentView}
        materialRoughness={state.material.id === "cotton" ? 0.7 : state.material.id === "polyester" ? 0.35 : state.material.id === "dry-fit" ? 0.4 : 0.6}
        materialMetalness={state.material.id === "polyester" ? 0.1 : 0.03}
        decals={decals}
        className="w-full h-full"
        onGlReady={(gl) => { r3fGlRef.current = gl; }}
      />

      {/* 2D interaction overlay */}
      <canvas
        ref={overlayRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: dragRef.current ? "grabbing" : "default", touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Floating toolbar for selected design */}
      {selectedDesign && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900/90 backdrop-blur text-white px-3 py-2 rounded-full shadow-xl text-xs z-20">
          <span className="text-gray-300 max-w-[100px] truncate">{selectedDesign.name}</span>
          <div className="w-px h-4 bg-gray-600" />
          <button
            onClick={() => dispatch({ type: "BRING_FORWARD", payload: { view: currentView, id: selectedDesignId! } })}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
            title="Bring forward"
          ><ArrowUp className="h-3 w-3" /></button>
          <button
            onClick={() => dispatch({ type: "SEND_BACKWARD", payload: { view: currentView, id: selectedDesignId! } })}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
            title="Send backward"
          ><ArrowDown className="h-3 w-3" /></button>
          <button
            onClick={() => dispatch({ type: "TOGGLE_VISIBLE", payload: { view: currentView, id: selectedDesignId! } })}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
            title="Toggle visibility"
          >{selectedDesign.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-gray-400" />}</button>
          <div className="w-px h-4 bg-gray-600" />
          <button
            onClick={() => dispatch({ type: "DELETE_DESIGN", payload: { view: currentView, id: selectedDesignId! } })}
            className="p-1 rounded hover:bg-red-700 text-red-400 transition-colors"
            title="Delete (Del)"
          ><Trash2 className="h-3 w-3" /></button>
        </div>
      )}
    </div>
  );
});

CanvasStage.displayName = "CanvasStage";
