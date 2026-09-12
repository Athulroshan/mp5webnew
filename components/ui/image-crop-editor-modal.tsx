/**
 * Production-quality visual image crop editor.
 * Canvas-based: image moves under a fixed, visible crop frame with rule-of-thirds grid,
 * corner bracket handles (┌ ┐ └ ┘), and center side tick marks matching modern camera/editor UIs.
 * Zero quality loss: exports lossless PNG at the crop region's native pixel resolution.
 */
"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Check,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type CropRatioOption = "1:1" | "16:9" | "4:3" | "original";

interface CropEditorModalProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string | null;
  onConfirm: (
    croppedDataUrl: string,
    meta: { ratio: string; originalWidth: number; originalHeight: number }
  ) => void;
  variant?: "circle" | "landscape";
  initialRatio?: CropRatioOption;
}

interface Vec2 {
  x: number;
  y: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function getRatioValue(ratio: CropRatioOption, imgW: number, imgH: number) {
  if (ratio === "1:1") return 1;
  if (ratio === "16:9") return 16 / 9;
  if (ratio === "4:3") return 4 / 3;
  return imgW / imgH; // "original"
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ImageCropEditorModal({
  open,
  onClose,
  imageSrc,
  onConfirm,
  variant = "landscape",
  initialRatio,
}: CropEditorModalProps) {
  /* ── effective default ratio ── */
  const defaultRatio: CropRatioOption =
    initialRatio ?? (variant === "circle" ? "1:1" : "16:9");

  /* ── state ── */
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [ratio, setRatio] = useState<CropRatioOption>(defaultRatio);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Vec2>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0); // multiples of 90°

  /* ── refs ── */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* drag ── */
  const drag = useRef<{ active: boolean; startClient: Vec2; startOffset: Vec2 }>({
    active: false,
    startClient: { x: 0, y: 0 },
    startOffset: { x: 0, y: 0 },
  });

  /* pinch ── */
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);

  /* ── load image ── */
  useEffect(() => {
    if (!imageSrc) return;
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => setImg(el);
    el.src = imageSrc;
  }, [imageSrc]);

  /* ── reset when image or ratio changes ── */
  const reset = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  useEffect(() => {
    if (img) reset();
  }, [img, ratio, reset]);

  /* ── canvas size: matches container width & calculated aspect height ── */
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const cw = containerRef.current.clientWidth;
      const ch = Math.min(460, Math.max(340, Math.round(cw * 0.72)));
      setCanvasSize({ w: cw, h: ch });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [open]);

  /* ── helper to calculate crop box bounds ── */
  const getCropBox = useCallback(
    (CW: number, CH: number, imgW: number, imgH: number, r: CropRatioOption) => {
      const ratioVal = getRatioValue(r, imgW, imgH);
      const pad = 24;
      const maxW = CW - pad * 2;
      const maxH = CH - pad * 2;

      let cropW = maxW;
      let cropH = Math.round(cropW / ratioVal);

      if (cropH > maxH) {
        cropH = maxH;
        cropW = Math.round(cropH * ratioVal);
      }

      const cropX = Math.round((CW - cropW) / 2);
      const cropY = Math.round((CH - cropH) / 2);

      return { cropX, cropY, cropW, cropH, ratioVal };
    },
    []
  );

  /* ── clamp pan offset so image always covers crop frame ── */
  const clampOffset = useCallback(
    (newOffset: Vec2, currentZoom: number, r: CropRatioOption) => {
      if (!img || canvasSize.w === 0) return newOffset;
      const CW = canvasSize.w;
      const CH = canvasSize.h;
      const { cropW, cropH } = getCropBox(
        CW,
        CH,
        img.naturalWidth,
        img.naturalHeight,
        r
      );

      const isRotated90 = rotation % 180 !== 0;
      const srcW = isRotated90 ? img.naturalHeight : img.naturalWidth;
      const srcH = isRotated90 ? img.naturalWidth : img.naturalHeight;
      const baseScale = Math.max(cropW / srcW, cropH / srcH);
      const scale = baseScale * currentZoom;

      const scaledW = srcW * scale;
      const scaledH = srcH * scale;

      const maxOffsetX = Math.max(0, (scaledW - cropW) / 2);
      const maxOffsetY = Math.max(0, (scaledH - cropH) / 2);

      return {
        x: clamp(newOffset.x, -maxOffsetX, maxOffsetX),
        y: clamp(newOffset.y, -maxOffsetY, maxOffsetY),
      };
    },
    [img, canvasSize, rotation, getCropBox]
  );

  /* ── draw ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img || canvasSize.w === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CW = canvasSize.w;
    const CH = canvasSize.h;
    canvas.width = CW;
    canvas.height = CH;

    /* crop box dimensions */
    const { cropX, cropY, cropW, cropH } = getCropBox(
      CW,
      CH,
      img.naturalWidth,
      img.naturalHeight,
      ratio
    );

    /* scale calculation */
    const isRotated90 = rotation % 180 !== 0;
    const srcW = isRotated90 ? img.naturalHeight : img.naturalWidth;
    const srcH = isRotated90 ? img.naturalWidth : img.naturalHeight;
    const baseScale = Math.max(cropW / srcW, cropH / srcH);
    const scale = baseScale * zoom;

    /* ── background canvas fill ── */
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, CW, CH);

    /* ── draw image centred on canvas with pan & rotation ── */
    ctx.save();
    ctx.translate(CW / 2 + offset.x, CH / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      img,
      (-img.naturalWidth * scale) / 2,
      (-img.naturalHeight * scale) / 2,
      img.naturalWidth * scale,
      img.naturalHeight * scale
    );
    ctx.restore();

    /* ── dim overlay outside crop frame ── */
    ctx.fillStyle = "rgba(0, 0, 0, 0.58)";
    /* top */
    ctx.fillRect(0, 0, CW, cropY);
    /* bottom */
    ctx.fillRect(0, cropY + cropH, CW, CH - cropY - cropH);
    /* left */
    ctx.fillRect(0, cropY, cropX, cropH);
    /* right */
    ctx.fillRect(cropX + cropW, cropY, CW - cropX - cropW, cropH);

    /* ── crop boundary outline ── */
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(cropX, cropY, cropW, cropH);

    /* ── 3x3 rule-of-thirds grid overlay ── */
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      const x = Math.round(cropX + (cropW / 3) * i);
      const y = Math.round(cropY + (cropH / 3) * i);
      /* vertical line */
      ctx.beginPath();
      ctx.moveTo(x, cropY);
      ctx.lineTo(x, cropY + cropH);
      ctx.stroke();
      /* horizontal line */
      ctx.beginPath();
      ctx.moveTo(cropX, y);
      ctx.lineTo(cropX + cropW, y);
      ctx.stroke();
    }

    /* ── corner L-brackets (┌ ┐ └ ┘) and side middle ticks ── */
    const L = Math.min(18, Math.round(cropW * 0.12)); // corner bracket arm length
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "square";
    ctx.lineJoin = "miter";

    // 1. Top-Left Corner ┌
    ctx.beginPath();
    ctx.moveTo(cropX, cropY + L);
    ctx.lineTo(cropX, cropY);
    ctx.lineTo(cropX + L, cropY);
    ctx.stroke();

    // 2. Top-Right Corner ┐
    ctx.beginPath();
    ctx.moveTo(cropX + cropW - L, cropY);
    ctx.lineTo(cropX + cropW, cropY);
    ctx.lineTo(cropX + cropW, cropY + L);
    ctx.stroke();

    // 3. Bottom-Left Corner └
    ctx.beginPath();
    ctx.moveTo(cropX, cropY + cropH - L);
    ctx.lineTo(cropX, cropY + cropH);
    ctx.lineTo(cropX + L, cropY + cropH);
    ctx.stroke();

    // 4. Bottom-Right Corner ┘
    ctx.beginPath();
    ctx.moveTo(cropX + cropW - L, cropY + cropH);
    ctx.lineTo(cropX + cropW, cropY + cropH);
    ctx.lineTo(cropX + cropW, cropY + cropH - L);
    ctx.stroke();

    // 5. Middle Side Ticks (Top, Bottom, Left, Right)
    const midX = Math.round(cropX + cropW / 2);
    const midY = Math.round(cropY + cropH / 2);
    const tickLen = 14;

    // Top Middle Tick
    ctx.beginPath();
    ctx.moveTo(midX - tickLen / 2, cropY);
    ctx.lineTo(midX + tickLen / 2, cropY);
    ctx.stroke();

    // Bottom Middle Tick
    ctx.beginPath();
    ctx.moveTo(midX - tickLen / 2, cropY + cropH);
    ctx.lineTo(midX + tickLen / 2, cropY + cropH);
    ctx.stroke();

    // Left Middle Tick
    ctx.beginPath();
    ctx.moveTo(cropX, midY - tickLen / 2);
    ctx.lineTo(cropX, midY + tickLen / 2);
    ctx.stroke();

    // Right Middle Tick
    ctx.beginPath();
    ctx.moveTo(cropX + cropW, midY - tickLen / 2);
    ctx.lineTo(cropX + cropW, midY + tickLen / 2);
    ctx.stroke();
  }, [img, ratio, zoom, offset, rotation, canvasSize, variant, getCropBox]);

  /* ── compute crop size for display ── */
  const cropDisplayInfo = React.useMemo(() => {
    if (!img) return null;
    const ratioVal = getRatioValue(ratio, img.naturalWidth, img.naturalHeight);
    let cropW = img.naturalWidth;
    let cropH = Math.round(cropW / ratioVal);
    if (cropH > img.naturalHeight) {
      cropH = img.naturalHeight;
      cropW = Math.round(cropH * ratioVal);
    }
    return { w: cropW, h: cropH };
  }, [img, ratio]);

  /* ─── event handlers ─────────────────────────────────────────────── */

  const startDrag = (clientX: number, clientY: number) => {
    drag.current = {
      active: true,
      startClient: { x: clientX, y: clientY },
      startOffset: { ...offset },
    };
  };

  const moveDrag = (clientX: number, clientY: number) => {
    if (!drag.current.active) return;
    const rawOffset = {
      x: clientX - drag.current.startClient.x + drag.current.startOffset.x,
      y: clientY - drag.current.startClient.y + drag.current.startOffset.y,
    };
    setOffset(clampOffset(rawOffset, zoom, ratio));
  };

  const endDrag = () => {
    drag.current.active = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = clamp(zoom + (e.deltaY < 0 ? 0.08 : -0.08), 1, 4);
    setZoom(newZoom);
    setOffset((currentOffset) => clampOffset(currentOffset, newZoom, ratio));
  };

  const getTouchDist = (t: React.TouchList) =>
    Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      drag.current.active = false;
      pinch.current = { dist: getTouchDist(e.touches), zoom };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2 && pinch.current) {
      const d = getTouchDist(e.touches);
      const delta = d / pinch.current.dist;
      const newZoom = clamp(pinch.current.zoom * delta, 1, 4);
      setZoom(newZoom);
      setOffset((currentOffset) => clampOffset(currentOffset, newZoom, ratio));
    }
  };

  /* ── export ── */
  const handleSave = () => {
    if (!img) return;
    const ratioVal = getRatioValue(ratio, img.naturalWidth, img.naturalHeight);

    /* target crop resolution */
    let outW = img.naturalWidth;
    let outH = Math.round(outW / ratioVal);
    if (outH > img.naturalHeight) {
      outH = img.naturalHeight;
      outW = Math.round(outH * ratioVal);
    }

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = outW;
    exportCanvas.height = outH;
    const ctx = exportCanvas.getContext("2d")!;

    const isRotated90 = rotation % 180 !== 0;
    const srcW = isRotated90 ? img.naturalHeight : img.naturalWidth;
    const srcH = isRotated90 ? img.naturalWidth : img.naturalHeight;
    const baseScale = Math.max(outW / srcW, outH / srcH);
    const scale = baseScale * zoom;

    /* scale the pan from canvas coords → export coords */
    const CW = canvasSize.w;
    const CH = canvasSize.h;
    const { cropW: canvasCropW } = getCropBox(
      CW,
      CH,
      img.naturalWidth,
      img.naturalHeight,
      ratio
    );
    const scaleFactor = outW / canvasCropW;
    const exportOffsetX = offset.x * scaleFactor;
    const exportOffsetY = offset.y * scaleFactor;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.save();
    ctx.translate(outW / 2 + exportOffsetX, outH / 2 + exportOffsetY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(
      img,
      (-img.naturalWidth * scale) / 2,
      (-img.naturalHeight * scale) / 2,
      img.naturalWidth * scale,
      img.naturalHeight * scale
    );
    ctx.restore();

    const dataUrl = exportCanvas.toDataURL("image/png", 1.0);
    onConfirm(dataUrl, {
      ratio,
      originalWidth: img.naturalWidth,
      originalHeight: img.naturalHeight,
    });
    onClose();
  };

  /* ─── render ─────────────────────────────────────────────────────── */
  if (!open) return null;

  const ratioLabels: { key: CropRatioOption; label: string }[] = [
    { key: "16:9", label: "16:9" },
    { key: "4:3", label: "4:3" },
    { key: "1:1", label: "1:1" },
    { key: "original", label: "Original" },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="p-0 rounded-2xl shadow-2xl overflow-hidden border-0 bg-[#090d16]"
        style={{ width: "min(640px, 95vw)", maxHeight: "92vh" }}
      >
        {/* ── header ── */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#090d16] border-b border-white/10">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-sm font-bold text-white tracking-wide">
              {variant === "circle" ? "Edit Profile Photo" : "Edit Image"}
            </DialogTitle>
          </div>
          {img && (
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <span>
                {img.naturalWidth} × {img.naturalHeight}px
              </span>
            </div>
          )}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── canvas ── */}
        <div
          ref={containerRef}
          className="relative w-full bg-[#090d16] select-none touch-none"
          style={{ cursor: drag.current.active ? "grabbing" : "grab" }}
          onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
          onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={endDrag}
          onWheel={handleWheel}
        >
          <canvas
            ref={canvasRef}
            style={{ display: "block", width: "100%", height: canvasSize.h }}
          />
          {!img && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
              Loading image…
            </div>
          )}
        </div>

        {/* ── ratio presets (article cover only) ── */}
        {variant !== "circle" && (
          <div className="flex items-center gap-2 px-5 pt-3 flex-wrap">
            {ratioLabels.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setRatio(key);
                  reset();
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                  ratio === key
                    ? "bg-violet-600 text-white border-violet-600 shadow"
                    : "text-slate-400 border-white/10 hover:border-white/30 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* ── zoom control: − ━━━━━━━━━●━━━━━━━━ + ── */}
        <div className="flex items-center gap-3 px-5 py-3.5">
          <button
            type="button"
            onClick={() => {
              const newZoom = clamp(zoom - 0.1, 1, 4);
              setZoom(newZoom);
              setOffset((curr) => clampOffset(curr, newZoom, ratio));
            }}
            className="h-7 w-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 text-sm font-bold"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => {
              const newZoom = Number(e.target.value);
              setZoom(newZoom);
              setOffset((curr) => clampOffset(curr, newZoom, ratio));
            }}
            className="flex-1 h-1 accent-violet-500 cursor-pointer"
          />
          <button
            type="button"
            onClick={() => {
              const newZoom = clamp(zoom + 0.1, 1, 4);
              setZoom(newZoom);
              setOffset((curr) => clampOffset(curr, newZoom, ratio));
            }}
            className="h-7 w-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 text-sm font-bold"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── footer actions: Reset | Cancel Save ── */}
        <div className="flex items-center justify-between px-5 pb-4 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors border border-white/10 hover:border-white/20"
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </button>
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors border border-white/10 hover:border-white/20"
            >
              <RotateCw className="h-3 w-3" />
              Rotate
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


