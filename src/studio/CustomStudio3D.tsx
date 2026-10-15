"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Html } from "@react-three/drei";
import {
  Upload,
  RefreshCw,
  Download,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  ShoppingCart,
  ArrowLeft,
  Crosshair,
  RotateCw,
  Eye,
  Sliders,
  Check,
  Layers,
  Shirt,
  Move,
} from "lucide-react";
import { useCart, formatINR } from "@/lib/cart-context";
import { CanvasErrorBoundary } from "@/components/customization/canvas-error-boundary";
import {
  Garment,
  GarmentId,
  ViewKey,
  LogoItem,
  PartColors,
} from "./Garment";

// ─── Garment Catalogue ─────────────────────────────────────────────────────
export const GARMENT_STYLES: {
  id: GarmentId;
  name: string;
  tag: string;
  priceDelta: number;
  description: string;
}[] = [
  { id: "round",     name: "Round Neck T-Shirt", tag: "Classic",    priceDelta: 0,   description: "Crew-neck everyday comfort" },
  { id: "polo",      name: "Polo T-Shirt",       tag: "Turned Collar", priceDelta: 150, description: "Structured collar & placket" },
  { id: "oversized", name: "Oversized T-Shirt",  tag: "Streetwear", priceDelta: 100, description: "Boxy fit & dropped shoulders" },
  { id: "full",      name: "Full Sleeve T-Shirt",tag: "Extended",   priceDelta: 120, description: "Full wrist-length sleeves" },
  { id: "half",      name: "Half Sleeve T-Shirt",tag: "Relaxed",    priceDelta: 0,   description: "Comfortable elbow sleeves" },
  { id: "hoodie",    name: "Hoodie",             tag: "Heavyweight",priceDelta: 400, description: "Thermal hood & pouch pocket" },
];

// ─── Color Swatches ────────────────────────────────────────────────────────
export const COLOR_SWATCHES = [
  { hex: "#ffffff", label: "Pure White" },
  { hex: "#18181b", label: "Onyx Black" },
  { hex: "#94a3b8", label: "Heather Grey" },
  { hex: "#1e3a8a", label: "Deep Navy" },
  { hex: "#2563eb", label: "Royal Blue" },
  { hex: "#059669", label: "Forest Green" },
  { hex: "#dc2626", label: "Crimson Red" },
  { hex: "#7c3aed", label: "Violet" },
  { hex: "#d97706", label: "Amber Gold" },
  { hex: "#d4a373", label: "Warm Sand" },
];

export const VIEW_TABS: { id: ViewKey; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "back", label: "Back" },
  { id: "leftSleeve", label: "Left Sleeve" },
  { id: "rightSleeve", label: "Right Sleeve" },
];

// ─── WebGL Renderer Exposer ────────────────────────────────────────────────
function GlCapture({ onGlReady }: { onGlReady: (gl: THREE.WebGLRenderer) => void }) {
  const { gl } = useThree();
  useEffect(() => {
    onGlReady(gl);
  }, [gl, onGlReady]);
  return null;
}

// ─── Camera Controller ─────────────────────────────────────────────────────
function CameraRig({
  currentView,
  zoom,
}: {
  currentView: ViewKey;
  zoom: number;
}) {
  const { camera } = useThree();

  const distance = 3.8 * (100 / Math.max(30, Math.min(220, zoom)));

  const targetCoords: Record<ViewKey, [number, number, number]> = {
    front: [0, 0.1, distance],
    back: [0, 0.1, -distance],
    leftSleeve: [-distance, 0.15, 0],
    rightSleeve: [distance, 0.15, 0],
  };

  useEffect(() => {
    const target = targetCoords[currentView] || targetCoords.front;
    camera.position.set(target[0], target[1], target[2]);
    camera.lookAt(0, 0, 0);
  }, [currentView, distance, camera]);

  return null;
}

// ─── Studio Inner Component ────────────────────────────────────────────────
export function CustomStudio3D() {
  const { addItem } = useCart();

  // Garment & Coloring State
  const [garmentId, setGarmentId] = useState<GarmentId>("round");
  const [currentView, setCurrentView] = useState<ViewKey>("front");
  const [selectedPart, setSelectedPart] = useState<"body" | "sleeves" | "collar">("body");
  const [partColors, setPartColors] = useState<PartColors>({
    body: "#ffffff",
    sleeves: "#ffffff",
    collar: "#ffffff",
  });

  // Logos State
  const [logos, setLogos] = useState<LogoItem[]>([]);
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);

  // Tools & Canvas State
  const [isPlacing, setIsPlacing] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showLeftDrawer, setShowLeftDrawer] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);

  // ── Pricing calculation ──────────────────────────────────────────────────
  const activeStyle = GARMENT_STYLES.find((g) => g.id === garmentId) || GARMENT_STYLES[0];
  const basePrice = 799;
  const totalPrice = basePrice + activeStyle.priceDelta;

  // Selected logo helper
  const selectedLogo = logos.find((l) => l.id === selectedLogoId) || logos[logos.length - 1];

  // ── Artwork Upload (PNG/JPG/WEBP) ─────────────────────────────────────────
  const processUploadedFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, or WEBP).");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert("File size exceeds 50MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      if (!url) return;

      const newLogo: LogoItem = {
        id: `logo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        url,
        name: file.name.replace(/\.[^/.]+$/, ""),
        view: currentView,
        scale: 1.0,
        rotation: 0,
        x: 0,
        y: 0,
      };

      setLogos((prev) => [...prev, newLogo]);
      setSelectedLogoId(newLogo.id);
      setIsPlacing(true); // activate place mode immediately
    };
    reader.readAsDataURL(file);
  }, [currentView]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(processUploadedFile);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    Array.from(e.dataTransfer.files)
      .filter((f) => f.type.startsWith("image/"))
      .forEach(processUploadedFile);
  };

  // ── Logo Updates ─────────────────────────────────────────────────────────
  const updateLogo = useCallback((id: string, updates: Partial<LogoItem>) => {
    setLogos((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  }, []);

  const deleteLogo = useCallback((id: string) => {
    setLogos((prev) => prev.filter((l) => l.id !== id));
    setSelectedLogoId((prev) => (prev === id ? null : prev));
  }, []);

  // ── Pointer Place / Drag Handlers ─────────────────────────────────────────
  const handlePointerPlace = useCallback(
    (coords: { x: number; y: number; view: ViewKey }) => {
      if (!selectedLogo) return;
      updateLogo(selectedLogo.id, {
        x: coords.x,
        y: coords.y,
        view: coords.view,
      });
    },
    [selectedLogo, updateLogo]
  );

  // ── Export PNG via gl.domElement.toDataURL ────────────────────────────────
  const handleExportPNG = useCallback(() => {
    const gl = glRef.current;
    if (!gl || !gl.domElement) {
      alert("3D canvas is initializing. Please wait a moment.");
      return;
    }
    try {
      const dataUrl = gl.domElement.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `mpss-3d-${garmentId}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export error:", err);
      alert("Unable to export snapshot.");
    }
  }, [garmentId]);

  // ── Add to Cart with snapshot ────────────────────────────────────────────
  const handleAddToCart = useCallback(() => {
    let snapshotUrl = "";
    if (glRef.current && glRef.current.domElement) {
      try {
        snapshotUrl = glRef.current.domElement.toDataURL("image/png");
      } catch (e) {
        console.warn("Could not capture snapshot for cart:", e);
      }
    }

    addItem(
      {
        id: `custom-3d-${Date.now()}`,
        name: `${activeStyle.name} (Custom 3D)`,
        price: totalPrice,
        color: partColors.body,
        image: snapshotUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500",
        customization: {
          logoName: selectedLogo?.name || "Custom Artwork",
          position: selectedLogo ? { x: selectedLogo.x, y: selectedLogo.y } : undefined,
        },
      },
      1
    );
  }, [addItem, activeStyle, totalPrice, partColors, selectedLogo]);

  // ── Reset View ───────────────────────────────────────────────────────────
  const handleResetView = useCallback(() => {
    setCurrentView("front");
    setZoom(100);
    setIsPlacing(false);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0f19] text-slate-100 overflow-hidden select-none font-sans">
      {/* ── TOP BAR (virtualthreads.io style) ──────────────────────────────── */}
      <header className="h-14 bg-[#111827]/90 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 z-20 shadow-md">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
              M
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Custom Studio
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
                  3D
                </span>
              </span>
            </div>
          </Link>
        </div>

        {/* Center: View Switcher Tabs (Front, Back, Left Sleeve, Right Sleeve) */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
          {VIEW_TABS.map((tab) => {
            const isActive = currentView === tab.id;
            const logoCount = logos.filter((l) => l.view === tab.id).length;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCurrentView(tab.id)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <span>{tab.label}</span>
                {logoCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white/20 text-white text-[9px] flex items-center justify-center font-extrabold">
                    {logoCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Action: 3D View indicator & Add to Cart */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Studio Mode</span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all active:scale-[0.98]"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
            <span className="bg-black/30 px-2 py-0.5 rounded-md text-[11px] font-extrabold text-violet-200">
              {formatINR(totalPrice)}
            </span>
          </button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile drawer toggle */}
        <button
          type="button"
          onClick={() => setShowLeftDrawer(!showLeftDrawer)}
          className="md:hidden absolute top-4 left-4 z-30 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white shadow-xl"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* ── LEFT CONFIGURATOR PANEL ─────────────────────────────────────── */}
        <aside
          className={`
            fixed md:relative inset-y-0 left-0 z-20 w-80 bg-[#111827] border-r border-slate-800/80 flex flex-col shrink-0 overflow-y-auto transition-transform duration-200 text-xs
            ${showLeftDrawer ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <div className="p-4 space-y-6">
            {/* 1. GARMENT STYLE SELECTOR */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Shirt className="w-3.5 h-3.5 text-violet-400" />
                  <span>Garment Style</span>
                </label>
                <span className="text-[10px] text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20 font-semibold">
                  6 Models
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {GARMENT_STYLES.map((style) => {
                  const isSelected = garmentId === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setGarmentId(style.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-violet-600/20 border-violet-500 text-white shadow-md shadow-violet-500/10 ring-1 ring-violet-500"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="font-extrabold text-[11px] leading-tight text-white">
                            {style.name}
                          </p>
                          {isSelected && <Check className="w-3 h-3 text-violet-400" />}
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 line-clamp-1">
                          {style.description}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">{style.tag}</span>
                        <span
                          className={`font-bold px-1.5 py-0.2 rounded text-[9px] ${
                            style.priceDelta > 0
                              ? "bg-violet-500/20 text-violet-300"
                              : "text-slate-400"
                          }`}
                        >
                          {style.priceDelta > 0 ? `+₹${style.priceDelta}` : "Base"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. ARTWORK UPLOAD WITH DRAG AND DROP */}
            <div className="border-t border-slate-800/80 pt-5">
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-violet-400" />
                  <span>Artwork / Logo</span>
                </label>
                <span className="text-[10px] text-slate-500">PNG • JPG • WEBP</span>
              </div>

              {/* Upload CTA Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Artwork</span>
              </button>

              {/* Drag & drop box */}
              <div
                className={`mt-2 border-2 border-dashed rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center ${
                  isDragOver
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
              >
                <p className="text-[11px] font-bold text-slate-300">Or Drag &amp; Drop Image Here</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Projects directly as 3D Decal</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />

              {/* Uploaded Artworks List */}
              {logos.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Active Decals ({logos.length})
                  </span>
                  {logos.map((logo) => {
                    const isSelected = selectedLogo?.id === logo.id;
                    return (
                      <div
                        key={logo.id}
                        onClick={() => setSelectedLogoId(logo.id)}
                        className={`p-2 rounded-xl flex items-center gap-2.5 cursor-pointer border transition-all ${
                          isSelected
                            ? "bg-violet-600/20 border-violet-500 text-white shadow-sm"
                            : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <img
                          src={logo.url}
                          alt={logo.name}
                          className="w-8 h-8 rounded-lg object-contain bg-black/40 border border-slate-800 shrink-0"
                        />
                        <div className="flex-1 truncate">
                          <p className="font-bold text-[11px] truncate text-white">{logo.name}</p>
                          <p className="text-[9px] text-slate-400 capitalize">{logo.view} Tab</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLogo(logo.id);
                          }}
                          className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. LOGO SLIDERS (Scale, Rotation, Horizontal X, Vertical Y) */}
            {selectedLogo && (
              <div className="border-t border-slate-800/80 pt-5 space-y-3.5 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-violet-400" />
                    <span>Logo Controls ({selectedLogo.name})</span>
                  </span>
                </div>

                {/* Scale Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold">Scale</span>
                    <span className="text-violet-400 font-bold">
                      {Math.round(selectedLogo.scale * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="250"
                    step="1"
                    value={Math.round(selectedLogo.scale * 100)}
                    onChange={(e) =>
                      updateLogo(selectedLogo.id, {
                        scale: parseInt(e.target.value, 10) / 100,
                      })
                    }
                    className="w-full h-1.5 bg-slate-800 rounded-full accent-violet-500 cursor-pointer"
                  />
                </div>

                {/* Rotation Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold">Rotation</span>
                    <span className="text-violet-400 font-bold">
                      {Math.round(selectedLogo.rotation)}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={Math.round(selectedLogo.rotation)}
                    onChange={(e) =>
                      updateLogo(selectedLogo.id, {
                        rotation: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full h-1.5 bg-slate-800 rounded-full accent-violet-500 cursor-pointer"
                  />
                </div>

                {/* Horizontal X Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold">Position X</span>
                    <span className="text-violet-400 font-bold">
                      {Math.round(selectedLogo.x * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={Math.round(selectedLogo.x * 100)}
                    onChange={(e) =>
                      updateLogo(selectedLogo.id, {
                        x: parseInt(e.target.value, 10) / 100,
                      })
                    }
                    className="w-full h-1.5 bg-slate-800 rounded-full accent-violet-500 cursor-pointer"
                  />
                </div>

                {/* Vertical Y Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold">Position Y</span>
                    <span className="text-violet-400 font-bold">
                      {Math.round(selectedLogo.y * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={Math.round(selectedLogo.y * 100)}
                    onChange={(e) =>
                      updateLogo(selectedLogo.id, {
                        y: parseInt(e.target.value, 10) / 100,
                      })
                    }
                    className="w-full h-1.5 bg-slate-800 rounded-full accent-violet-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 4. CUSTOM PART TABS (Body / Sleeves / Collar) */}
            <div className="border-t border-slate-800/80 pt-5 space-y-3">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-violet-400" />
                <span>Custom Part</span>
              </label>

              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {[
                  { id: "body", label: "Body" },
                  { id: "sleeves", label: "Sleeves" },
                  { id: "collar", label: garmentId === "hoodie" ? "Hood" : "Collar" },
                ].map((part) => (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => setSelectedPart(part.id as any)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      selectedPart === part.id
                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {part.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. COLOR SWATCHES */}
            <div className="border-t border-slate-800/80 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  {selectedPart === "body"
                    ? "Body Color"
                    : selectedPart === "collar"
                    ? garmentId === "hoodie"
                      ? "Hood Color"
                      : "Collar Color"
                    : "Sleeve Color"}
                </label>
                <div
                  className="w-4 h-4 rounded-full border border-slate-700 shadow-sm"
                  style={{
                    backgroundColor:
                      selectedPart === "body"
                        ? partColors.body
                        : selectedPart === "collar"
                        ? partColors.collar
                        : partColors.sleeves,
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-2.5 items-center">
                {/* Custom Color Input */}
                <label
                  className="w-7 h-7 rounded-full border-2 border-dashed border-slate-700 hover:border-violet-400 flex items-center justify-center cursor-pointer transition-colors relative"
                  title="Pick custom hex color"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="color"
                    value={
                      selectedPart === "body"
                        ? partColors.body
                        : selectedPart === "collar"
                        ? partColors.collar
                        : partColors.sleeves
                    }
                    onChange={(e) =>
                      setPartColors((prev) => ({
                        ...prev,
                        [selectedPart]: e.target.value,
                      }))
                    }
                    className="sr-only"
                  />
                </label>

                {COLOR_SWATCHES.map((swatch) => {
                  const currentColor =
                    selectedPart === "body"
                      ? partColors.body
                      : selectedPart === "collar"
                      ? partColors.collar
                      : partColors.sleeves;
                  const isCurrent = currentColor.toLowerCase() === swatch.hex.toLowerCase();

                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() =>
                        setPartColors((prev) => ({
                          ...prev,
                          [selectedPart]: swatch.hex,
                        }))
                      }
                      title={swatch.label}
                      className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 relative flex items-center justify-center"
                      style={{
                        backgroundColor: swatch.hex,
                        borderColor: isCurrent ? "#8b5cf6" : swatch.hex === "#ffffff" ? "#475569" : swatch.hex,
                        boxShadow: isCurrent ? "0 0 0 2px #c4b5fd" : "none",
                      }}
                    >
                      {isCurrent && (
                        <Check
                          className={`w-3 h-3 ${
                            swatch.hex === "#ffffff" ? "text-slate-900" : "text-white"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* ── CENTER 3D VIEWPORT ───────────────────────────────────────────── */}
        <main
          className="flex-1 relative overflow-hidden bg-[#0a0e17]"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          {/* Client-Only R3F Canvas */}
          <CanvasErrorBoundary fallbackTitle="3D Customizer Error">
            <Canvas
              shadows
              camera={{ position: [0, 0.1, 3.8], fov: 34 }}
              gl={{
                preserveDrawingBuffer: true,
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
              }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              <GlCapture onGlReady={(gl) => { glRef.current = gl; }} />
              <CameraRig currentView={currentView} zoom={zoom} />

              {/* Studio Lighting */}
              <ambientLight intensity={1.2} />
              <directionalLight
                position={[4, 6, 4]}
                intensity={1.6}
                castShadow
                shadow-mapSize={1024}
              />
              <directionalLight position={[-4, 4, -4]} intensity={0.8} color="#e0f2fe" />
              <directionalLight position={[0, -2, 3]} intensity={0.4} color="#ffffff" />
              <hemisphereLight intensity={0.5} groundColor="#1e293b" color="#ffffff" />

              {/* OrbitControls — Disabled while placing logo */}
              <OrbitControls
                makeDefault
                enabled={!isPlacing}
                enableRotate={!isPlacing}
                enableZoom={!isPlacing}
                rotateSpeed={0.8}
                minDistance={1.6}
                maxDistance={6.5}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 1.75}
                target={[0, 0, 0]}
              />

              <Suspense
                fallback={
                  <Html center>
                    <div className="flex flex-col items-center gap-2 bg-slate-900/90 text-white px-5 py-3 rounded-2xl border border-slate-700 shadow-xl">
                      <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold">Rendering 3D Mesh...</span>
                    </div>
                  </Html>
                }
              >
                <Garment
                  garmentId={garmentId}
                  partColors={partColors}
                  currentView={currentView}
                  logos={logos}
                  selectedLogoId={selectedLogoId}
                  isPlacing={isPlacing}
                  onPointerPlace={handlePointerPlace}
                />
              </Suspense>

              <ContactShadows
                position={[0, -1.6, 0]}
                opacity={0.45}
                scale={6}
                blur={2.5}
                far={4}
              />
            </Canvas>
          </CanvasErrorBoundary>

          {/* Drag & Drop Visual Indicator Overlay */}
          {isDragOver && (
            <div className="absolute inset-0 bg-violet-600/20 backdrop-blur-xs border-4 border-dashed border-violet-500 rounded-2xl flex flex-col items-center justify-center pointer-events-none z-20">
              <div className="bg-slate-900 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-2 text-violet-400 border border-violet-500/30">
                <Upload className="w-8 h-8 animate-bounce text-violet-400" />
                <p className="font-extrabold text-sm text-white">Drop Artwork Image Here</p>
                <p className="text-xs text-slate-400">Projects directly as 3D Decal</p>
              </div>
            </div>
          )}

          {/* Place Tool Active Hint Banner */}
          {isPlacing && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-violet-600 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-violet-600/30 animate-pulse">
              <Crosshair className="w-4 h-4" />
              <span>Place Tool Active: Click or drag on the garment to position logo</span>
              <button
                type="button"
                onClick={() => setIsPlacing(false)}
                className="ml-2 bg-black/20 hover:bg-black/40 px-2 py-0.5 rounded text-[10px] font-extrabold"
              >
                Done
              </button>
            </div>
          )}

          {/* ── FLOATING STUDIO TOOLBAR (Center Bottom) ────────────────────── */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 shadow-2xl">
            {/* Tool 1: Place Logo */}
            <button
              type="button"
              onClick={() => setIsPlacing(!isPlacing)}
              title="Click & Drag to position logo"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isPlacing
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Place Logo</span>
            </button>

            {/* Tool 2: Orbit / Inspect */}
            <button
              type="button"
              onClick={() => setIsPlacing(false)}
              title="Rotate 3D model"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !isPlacing
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Orbit</span>
            </button>

            <div className="w-px h-5 bg-slate-700 mx-1" />

            {/* Zoom Controls */}
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(30, z - 15))}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              title="Zoom out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="text-[11px] font-bold text-slate-300 min-w-[42px] text-center">
              {zoom}%
            </span>

            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(200, z + 15))}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              title="Zoom in"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-5 bg-slate-700 mx-1" />

            {/* Reset View */}
            <button
              type="button"
              onClick={handleResetView}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              title="Reset 3D camera to front"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset View</span>
            </button>

            {/* Export PNG */}
            <button
              type="button"
              onClick={handleExportPNG}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/30"
              title="Download high-res PNG snapshot"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PNG</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CustomStudio3D;
