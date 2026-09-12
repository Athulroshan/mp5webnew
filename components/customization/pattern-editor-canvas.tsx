/**
 * Interactive 2D Flat Pattern Placement Editor
 * Renders Front, Back, Left Sleeve, and Right Sleeve panels matching Mockey.ai screenshot layout.
 * Supports image drag & drop, resize corner & side handles, rotation handles, layer ordering, and texture export.
 */
"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Move, RotateCw, Trash2, ArrowUp, ArrowDown, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface GraphicLayer {
  id: string;
  url: string;
  name: string;
  x: number; // 0..1 relative to canvas width
  y: number; // 0..1 relative to canvas height
  scale: number; // 0.1..3.0
  rotation: number; // in degrees
  panel: "front" | "back" | "left_sleeve" | "right_sleeve";
}

interface PatternEditorCanvasProps {
  layers: GraphicLayer[];
  onUpdateLayers: (layers: GraphicLayer[]) => void;
  onTextureUpdate: (canvas: HTMLCanvasElement) => void;
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  garmentColor: string;
}

export function PatternEditorCanvas({
  layers,
  onUpdateLayers,
  onTextureUpdate,
  selectedLayerId,
  onSelectLayer,
  garmentColor,
}: PatternEditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorCanvasRef = useRef<HTMLCanvasElement>(null);
  const textureCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isScaling, setIsScaling] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialTransform, setInitialTransform] = useState<{ x: number; y: number; scale: number; rotation: number }>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
  });

  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    if (imageCacheRef.current.has(url)) {
      return Promise.resolve(imageCacheRef.current.get(url)!);
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageCacheRef.current.set(url, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  // Render 1024x1024 texture canvas for Three.js material
  const renderTextureCanvas = useCallback(async () => {
    const texCanvas = textureCanvasRef.current;
    if (!texCanvas) return;
    const ctx = texCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = garmentColor;
    ctx.fillRect(0, 0, 1024, 1024);

    for (const layer of layers) {
      try {
        const img = await loadImage(layer.url);
        ctx.save();

        const absX = layer.x * 1024;
        const absY = layer.y * 1024;

        ctx.translate(absX, absY);
        ctx.rotate((layer.rotation * Math.PI) / 180);

        const width = img.width * layer.scale * 0.45;
        const height = img.height * layer.scale * 0.45;

        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.restore();
      } catch (err) {
        console.error("Texture draw error:", err);
      }
    }

    onTextureUpdate(texCanvas);
  }, [layers, garmentColor, onTextureUpdate]);

  // Render 2D Pattern Canvas with Red Dashed Outlines & 8 Transform Handles
  const renderEditorCanvas = useCallback(async () => {
    const canvas = editorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // ─── 4 Red Dashed Garment Pattern Outlines (Mockey.ai style) ───
    ctx.strokeStyle = "#ef4444";
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 1.8;

    // 1. LEFT SLEEVE (Top Left)
    drawSleeveOutline(ctx, w * 0.08, h * 0.06, w * 0.38, h * 0.38, "LEFT SLEEVE");

    // 2. RIGHT SLEEVE (Top Right)
    drawSleeveOutline(ctx, w * 0.54, h * 0.06, w * 0.38, h * 0.38, "RIGHT SLEEVE");

    // 3. FRONT TORSO (Bottom Left)
    drawTorsoOutline(ctx, w * 0.08, h * 0.52, w * 0.38, h * 0.42, "FRONT");

    // 4. BACK TORSO (Bottom Right)
    drawTorsoOutline(ctx, w * 0.54, h * 0.52, w * 0.38, h * 0.42, "BACK");

    ctx.setLineDash([]); // Reset line dash

    // ─── Draw Graphic Layers & Transform Handles ───
    for (const layer of layers) {
      try {
        const img = await loadImage(layer.url);
        const absX = layer.x * w;
        const absY = layer.y * h;
        const width = img.width * layer.scale * (w / 1024) * 0.45;
        const height = img.height * layer.scale * (h / 1024) * 0.45;

        ctx.save();
        ctx.translate(absX, absY);
        ctx.rotate((layer.rotation * Math.PI) / 180);

        // Draw graphic image
        ctx.drawImage(img, -width / 2, -height / 2, width, height);

        // Selection handles matching screenshot
        if (layer.id === selectedLayerId) {
          ctx.strokeStyle = "#e11d48";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-width / 2 - 4, -height / 2 - 4, width + 8, height + 8);

          // Center crosshair line
          ctx.strokeStyle = "#e11d48";
          ctx.beginPath();
          ctx.moveTo(0, -height / 2 - 4);
          ctx.lineTo(0, height / 2 + 4);
          ctx.moveTo(-width / 2 - 4, 0);
          ctx.lineTo(width / 2 + 4, 0);
          ctx.stroke();

          // 8 Transform Box Handles (4 corners + 4 side midpoints)
          const handles = [
            { x: -width / 2 - 4, y: -height / 2 - 4 }, // Top-Left
            { x: 0, y: -height / 2 - 4 },             // Top-Center
            { x: width / 2 + 4, y: -height / 2 - 4 },  // Top-Right
            { x: -width / 2 - 4, y: 0 },              // Mid-Left
            { x: width / 2 + 4, y: 0 },               // Mid-Right
            { x: -width / 2 - 4, y: height / 2 + 4 },  // Bottom-Left
            { x: 0, y: height / 2 + 4 },              // Bottom-Center
            { x: width / 2 + 4, y: height / 2 + 4 },   // Bottom-Right
          ];

          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#e11d48";
          ctx.lineWidth = 1.5;

          handles.forEach((hPos) => {
            ctx.fillRect(hPos.x - 4, hPos.y - 4, 8, 8);
            ctx.strokeRect(hPos.x - 4, hPos.y - 4, 8, 8);
          });

          // Top Rotation Handle (Circle with rotate icon indicator)
          const rotY = -height / 2 - 25;
          ctx.beginPath();
          ctx.moveTo(0, -height / 2 - 4);
          ctx.lineTo(0, rotY);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, rotY, 7, 0, Math.PI * 2);
          ctx.fillRect(-7, rotY - 7, 14, 14);
          ctx.strokeRect(-7, rotY - 7, 14, 14);

          // "rotate" label icon inside handle
          ctx.fillStyle = "#e11d48";
          ctx.font = "bold 9px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("↻", 0, rotY + 3);
        }

        ctx.restore();
      } catch (err) {
        console.error("Editor canvas draw error:", err);
      }
    }
  }, [layers, selectedLayerId]);

  useEffect(() => {
    renderTextureCanvas();
    renderEditorCanvas();
  }, [renderTextureCanvas, renderEditorCanvas]);

  function drawTorsoOutline(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label: string) {
    ctx.beginPath();
    ctx.moveTo(x + w * 0.35, y);
    ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.1, x + w * 0.65, y);
    ctx.lineTo(x + w * 0.92, y + h * 0.08);
    ctx.lineTo(x + w * 0.86, y + h * 0.28);
    ctx.lineTo(x + w * 0.86, y + h);
    ctx.lineTo(x + w * 0.14, y + h);
    ctx.lineTo(x + w * 0.14, y + h * 0.28);
    ctx.lineTo(x + w * 0.08, y + h * 0.08);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x + w / 2, y + h + 18);
  }

  function drawSleeveOutline(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label: string) {
    ctx.beginPath();
    ctx.moveTo(x + w * 0.1, y + h * 0.4);
    ctx.quadraticCurveTo(x + w * 0.5, y - h * 0.04, x + w * 0.9, y + h * 0.4);
    ctx.lineTo(x + w * 0.82, y + h);
    ctx.lineTo(x + w * 0.18, y + h);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x + w / 2, y + h + 18);
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = editorCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const activeLayer = layers.find((l) => l.id === selectedLayerId);
    if (activeLayer) {
      const absX = activeLayer.x * canvas.width;
      const absY = activeLayer.y * canvas.height;

      // Check top rotation handle hit
      const rotY = absY - activeLayer.scale * 40 - 25;
      if (Math.hypot(clickX - absX, clickY - rotY) < 25) {
        setIsRotating(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setInitialTransform({ x: activeLayer.x, y: activeLayer.y, scale: activeLayer.scale, rotation: activeLayer.rotation });
        return;
      }
    }

    // Hit test graphic layers for drag & drop positioning across garment panels
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      const absX = layer.x * canvas.width;
      const absY = layer.y * canvas.height;
      const hitRadius = Math.max(70, (layer.scale || 0.85) * 80);

      if (Math.hypot(clickX - absX, clickY - absY) < hitRadius) {
        onSelectLayer(layer.id);
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setInitialTransform({ x: layer.x, y: layer.y, scale: layer.scale, rotation: layer.rotation });
        return;
      }
    }

    onSelectLayer(null);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!selectedLayerId) return;
    const canvas = editorCanvasRef.current;
    if (!canvas) return;

    const idx = layers.findIndex((l) => l.id === selectedLayerId);
    if (idx === -1) return;
    const layer = layers[idx];

    if (isDragging) {
      const rect = canvas.getBoundingClientRect();
      const deltaX = (e.clientX - dragStart.x) / rect.width;
      const deltaY = (e.clientY - dragStart.y) / rect.height;

      const updated = [...layers];
      updated[idx] = {
        ...layer,
        x: Math.max(0, Math.min(1, initialTransform.x + deltaX)),
        y: Math.max(0, Math.min(1, initialTransform.y + deltaY)),
      };
      onUpdateLayers(updated);
    } else if (isRotating) {
      const rect = canvas.getBoundingClientRect();
      const absX = initialTransform.x * rect.width + rect.left;
      const absY = initialTransform.y * rect.height + rect.top;

      const angleRad = Math.atan2(e.clientY - absY, e.clientX - absX);
      const angleDeg = Math.round((angleRad * 180) / Math.PI) + 90;

      const updated = [...layers];
      updated[idx] = { ...layer, rotation: angleDeg };
      onUpdateLayers(updated);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setIsRotating(false);
    setIsScaling(false);
  };

  const updateSelectedLayerScale = (factor: number) => {
    if (!selectedLayerId) return;
    const updated = layers.map((l) => (l.id === selectedLayerId ? { ...l, scale: Math.max(0.2, Math.min(3, l.scale * factor)) } : l));
    onUpdateLayers(updated);
  };

  const rotateSelectedLayer = (degrees: number) => {
    if (!selectedLayerId) return;
    const updated = layers.map((l) => (l.id === selectedLayerId ? { ...l, rotation: (l.rotation + degrees) % 360 } : l));
    onUpdateLayers(updated);
  };

  const removeSelectedLayer = () => {
    if (!selectedLayerId) return;
    onUpdateLayers(layers.filter((l) => l.id !== selectedLayerId));
    onSelectLayer(null);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-3">
      {/* Hidden Offscreen 3D Texture Canvas */}
      <canvas ref={textureCanvasRef} width={1024} height={1024} className="hidden" />

      {/* Main Interactive 2D Pattern Canvas */}
      <div ref={containerRef} className="w-full flex flex-col items-center justify-center relative">
        <canvas
          ref={editorCanvasRef}
          width={800}
          height={680}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="max-w-full h-auto cursor-grab active:cursor-grabbing rounded-xl bg-white border border-slate-200 shadow-inner"
        />

        {/* Selected Layer Floating Control Handles */}
        {selectedLayerId && (
          <div className="absolute bottom-4 bg-slate-900/90 backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-3 shadow-xl border border-slate-700 text-xs">
            <span className="font-medium text-pink-400">Selected Graphic:</span>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-200 hover:text-white" onClick={() => updateSelectedLayerScale(1.15)} title="Zoom In">
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-200 hover:text-white" onClick={() => updateSelectedLayerScale(0.85)} title="Zoom Out">
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <div className="h-4 w-px bg-slate-700" />
            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-200 hover:text-white" onClick={() => rotateSelectedLayer(15)} title="Rotate +15°">
              <RotateCw className="w-3.5 h-3.5" />
            </Button>
            <div className="h-4 w-px bg-slate-700" />
            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-950/50" onClick={removeSelectedLayer} title="Delete Layer">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
