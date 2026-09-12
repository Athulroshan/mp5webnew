"use client";

import React, { useRef, useCallback, useState } from "react";
import {
  Upload, Trash2, ChevronRight, Plus, Eye, EyeOff,
  Layers, Check, Sparkles, SlidersHorizontal, Shirt,
} from "lucide-react";
import { useEditor } from "./editor-context";
import { Design, ViewKey, PartKey, MATERIALS, Material, GARMENT_STYLES, GarmentStyle } from "./types";
import { AISimilarModal } from "./ai-similar-modal";

// ─── Preset colours ───────────────────────────────────────────────────────

const COLOR_SWATCHES = [
  { hex: "#ffffff", label: "White" },
  { hex: "#18181b", label: "Black" },
  { hex: "#dc2626", label: "Red" },
  { hex: "#2563eb", label: "Blue" },
  { hex: "#1e3a8a", label: "Navy" },
  { hex: "#16a34a", label: "Green" },
  { hex: "#7c3aed", label: "Purple" },
  { hex: "#db2777", label: "Pink" },
  { hex: "#f59e0b", label: "Yellow" },
];

export function LeftPanel() {
  const { state, dispatch, currentDesigns } = useEditor();
  const { currentView, selectedDesignId, shirtColor, partColors, material, garmentStyle } = state;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPart, setSelectedPart] = useState<PartKey>("body");
  const [showAI, setShowAI] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Selected design for sliders
  const selectedDesign = currentDesigns.find((d) => d.id === selectedDesignId);

  // Active color for currently selected part
  const activePartColor =
    selectedPart === "body"
      ? partColors.body || shirtColor
      : selectedPart === "collar"
      ? partColors.collar || shirtColor
      : selectedPart === "leftSleeve"
      ? partColors.leftSleeve || partColors.sleeves || shirtColor
      : selectedPart === "rightSleeve"
      ? partColors.rightSleeve || partColors.sleeves || shirtColor
      : partColors.sleeves || shirtColor;

  // ── File handling ────────────────────────────────────────────────────────

  const processFile = useCallback((file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      alert("File exceeds 50 MB. Please upload a smaller image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (!url) return;
      const maxZ = Math.max(0, ...currentDesigns.map((d) => d.zIndex));
      const design: Design = {
        id: `design-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        url,
        name: file.name.replace(/\.[^/.]+$/, ""),
        x: 0.5, y: 0.45,
        scale: 1.0,
        rotation: 0,
        visible: true,
        zIndex: maxZ + 1,
      };
      dispatch({ type: "ADD_DESIGN", payload: { view: currentView, design } });
    };
    reader.readAsDataURL(file);
  }, [currentDesigns, currentView, dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(processFile);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    Array.from(e.dataTransfer.files)
      .filter((f) => f.type.startsWith("image/"))
      .forEach(processFile);
  };

  // ── Design update helpers ────────────────────────────────────────────────

  const updateSelected = (changes: Partial<Design>) => {
    if (!selectedDesignId) return;
    dispatch({ type: "UPDATE_DESIGN", payload: { view: currentView, id: selectedDesignId, changes } });
  };

  const deleteDesign = (id: string) =>
    dispatch({ type: "DELETE_DESIGN", payload: { view: currentView, id } });

  const toggleVisible = (id: string) =>
    dispatch({ type: "TOGGLE_VISIBLE", payload: { view: currentView, id } });

  // ── Color assignment helper ──────────────────────────────────────────────

  const handleApplyColor = (colorHex: string) => {
    dispatch({
      type: "SET_PART_COLOR",
      payload: { part: selectedPart, color: colorHex },
    });
  };

  // ── AI suggestion handler ────────────────────────────────────────────────

  const handleAISuggestion = useCallback((url: string, label: string) => {
    const maxZ = Math.max(0, ...currentDesigns.map((d) => d.zIndex));
    const design: Design = {
      id: `ai-${Date.now()}`,
      url, name: label,
      x: 0.5, y: 0.45,
      scale: 1.0, rotation: 0,
      visible: true, zIndex: maxZ + 1,
    };
    dispatch({ type: "ADD_DESIGN", payload: { view: currentView, design } });
  }, [currentDesigns, currentView, dispatch]);

  return (
    <>
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto text-xs">
        <div className="flex flex-col gap-0 flex-1">

          {/* ── 0. GARMENT STYLE SELECTOR ───────────────────────────────────── */}
          <section className="p-4 border-b border-gray-200 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Shirt className="h-3.5 w-3.5 text-violet-600" />
                Garment Style
              </h3>
              <span className="text-[10px] text-violet-600 font-bold bg-violet-100 px-1.5 py-0.5 rounded-full">
                3D Models
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {GARMENT_STYLES.map((style) => {
                const isSelected = garmentStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => dispatch({ type: "SET_GARMENT_STYLE", payload: style.id })}
                    className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-violet-600 text-white border-violet-600 shadow-md ring-2 ring-violet-300"
                        : "bg-white text-gray-700 border-gray-200 hover:border-violet-300 hover:bg-violet-50/30"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-[11px] leading-tight">{style.name}</p>
                      <p className={`text-[9px] mt-0.5 line-clamp-1 ${isSelected ? "text-violet-100" : "text-gray-400"}`}>
                        {style.description}
                      </p>
                    </div>
                    {style.priceDelta !== 0 && (
                      <span
                        className={`text-[9px] font-bold self-start mt-1.5 px-1.5 py-0.5 rounded-md ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-violet-50 text-violet-700 border border-violet-100"
                        }`}
                      >
                        +{style.priceDelta > 0 ? `₹${style.priceDelta}` : `₹0`}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── 1. UPLOAD DESIGN ───────────────────────────────────────── */}
          <section className="p-4 border-b border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Artwork &amp; Logo
              </h3>
              <span className="text-[10px] text-gray-400 font-medium">PNG / JPG / WEBP</span>
            </div>

            {/* Prominent Add Image CTA Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-[0.98]"
            >
              <Upload className="h-4 w-4" />
              <span>Add Image</span>
            </button>

            {/* Drop zone */}
            <div
              className="relative border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all text-center"
              style={{
                borderColor: isDragOver ? "#7c3aed" : "#e2e8f0",
                background: isDragOver ? "#f5f3ff" : "#f8fafc",
                minHeight: "75px",
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <p className="text-[11px] font-bold text-gray-600">Or Drag &amp; Drop Image File</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Projects automatically onto 3D garment</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Uploaded images gallery / layers */}
            {currentDesigns.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Artwork Layers ({currentDesigns.length})
                  </span>
                </div>
                {[...currentDesigns].reverse().map((d) => (
                  <div
                    key={d.id}
                    onClick={() => dispatch({ type: "SELECT_DESIGN", payload: d.id })}
                    className="flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: d.id === selectedDesignId ? "#f5f3ff" : "#f8fafc",
                      border: `1px solid ${d.id === selectedDesignId ? "#c4b5fd" : "#f1f5f9"}`,
                    }}
                  >
                    <img src={d.url} alt={d.name} className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0" />
                    <span className="text-xs font-semibold text-gray-800 flex-1 truncate">{d.name}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleVisible(d.id); }}
                      className="p-1 rounded-md hover:bg-gray-200 text-gray-500"
                    >
                      {d.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-gray-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); deleteDesign(d.id); }}
                      className="p-1 rounded-md hover:bg-red-100 text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Artwork Position & Scale Controls ───────────────────────── */}
          {selectedDesign && (
            <section className="p-4 border-b border-gray-200 space-y-3 bg-violet-50/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-900">Selected Artwork Controls</span>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "SELECT_DESIGN", payload: null })}
                  className="text-[10px] font-bold text-violet-600 hover:underline"
                >
                  Deselect
                </button>
              </div>

              {/* Scale */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-gray-700">Scale</span>
                  <span className="font-bold text-violet-700">{Math.round(selectedDesign.scale * 100)}%</span>
                </div>
                <input
                  type="range" min="10" max="300" step="1"
                  value={Math.round(selectedDesign.scale * 100)}
                  onChange={(e) => updateSelected({ scale: parseInt(e.target.value, 10) / 100 })}
                  className="w-full h-1.5 rounded-full accent-violet-600 cursor-pointer"
                />
              </div>

              {/* Rotation */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-gray-700">Rotation</span>
                  <span className="font-bold text-violet-700">{Math.round(selectedDesign.rotation)}°</span>
                </div>
                <input
                  type="range" min="0" max="360" step="1"
                  value={Math.round(selectedDesign.rotation)}
                  onChange={(e) => updateSelected({ rotation: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 rounded-full accent-violet-600 cursor-pointer"
                />
              </div>
            </section>
          )}

          {/* ── 2. CUSTOM PART SELECTION ─────────────────────────────────── */}
          <section className="p-4 border-b border-gray-200 space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Custom Part
            </h3>

            {/* Garment Part Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-xl">
              {[
                { id: "body", label: "Body" },
                { id: "sleeves", label: "Sleeves" },
                { id: "collar", label: garmentStyle === "hoodie" ? "Hood" : "Collar" },
              ].map((part) => (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => setSelectedPart(part.id as PartKey)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    selectedPart === part.id || (selectedPart.includes("Sleeve") && part.id === "sleeves")
                      ? "bg-white text-violet-700 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {part.label}
                </button>
              ))}
            </div>

            {/* Independent Sleeve Selector Options */}
            {(selectedPart === "sleeves" || selectedPart.includes("Sleeve")) && (
              <div className="flex items-center gap-1.5 pt-1">
                {[
                  { id: "sleeves", label: "Both Sleeves" },
                  { id: "leftSleeve", label: "Left Only" },
                  { id: "rightSleeve", label: "Right Only" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedPart(item.id as PartKey)}
                    className={`flex-1 py-1 px-1.5 text-[10px] font-semibold rounded-md transition-all border ${
                      selectedPart === item.id
                        ? "bg-violet-50 text-violet-700 border-violet-300 font-bold"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* ── 3. GARMENT / PART COLOR CUSTOMIZATION ──────────────────── */}
          <section className="p-4 border-b border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                {selectedPart === "body"
                  ? "Body Color"
                  : selectedPart === "collar"
                  ? garmentStyle === "hoodie" ? "Hood Color" : "Collar Color"
                  : selectedPart === "leftSleeve"
                  ? "Left Sleeve Color"
                  : selectedPart === "rightSleeve"
                  ? "Right Sleeve Color"
                  : "Sleeve Color"}
              </h3>
              <div
                className="w-4 h-4 rounded-full border border-gray-300 shadow-xs"
                style={{ backgroundColor: activePartColor }}
              />
            </div>

            {/* Swatches */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Custom Picker */}
              <label
                className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-violet-400 transition-colors relative"
                title="Custom Color"
              >
                <Plus className="h-3.5 w-3.5 text-gray-400" />
                <input
                  type="color"
                  value={activePartColor}
                  onChange={(e) => handleApplyColor(e.target.value)}
                  className="sr-only"
                />
              </label>

              {COLOR_SWATCHES.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => handleApplyColor(c.hex)}
                  title={c.label}
                  className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110 relative flex items-center justify-center"
                  style={{
                    backgroundColor: c.hex,
                    borderColor: activePartColor === c.hex ? "#7c3aed" : c.hex === "#ffffff" ? "#e2e8f0" : c.hex,
                    boxShadow: activePartColor === c.hex ? "0 0 0 2px #ede9fe" : "none",
                  }}
                >
                  {activePartColor === c.hex && (
                    <Check
                      className="h-3.5 w-3.5"
                      style={{ color: c.hex === "#ffffff" ? "#18181b" : "#ffffff" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* ── 4. MATERIAL & FABRIC ────────────────────────────────────── */}
          <section className="p-4 border-b border-gray-200 space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Material / Fabric
            </h3>

            <div className="space-y-1.5">
              {MATERIALS.map((m) => {
                const isSelected = material.id === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => dispatch({ type: "SET_MATERIAL", payload: m })}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-violet-50/70 border-violet-400 text-violet-900 shadow-xs"
                        : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{m.name}</p>
                      <p className="text-[10px] text-gray-500">{m.description}</p>
                    </div>
                    {m.priceDelta !== 0 && (
                      <span className="text-[10px] font-bold text-violet-600 bg-violet-100/80 px-1.5 py-0.5 rounded-md shrink-0">
                        {m.priceDelta > 0 ? `+₹${m.priceDelta}` : `-₹${Math.abs(m.priceDelta)}`}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── 5. AI SUGGESTION ────────────────────────────────────────── */}
          <section className="p-4">
            <button
              type="button"
              onClick={() => setShowAI(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-violet-50 hover:border-violet-200 transition-colors group"
            >
              <span className="text-xs font-semibold text-gray-700 group-hover:text-violet-700 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                Find Similar with AI
              </span>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-violet-500" />
            </button>
          </section>
        </div>
      </div>

      {/* AI Modal */}
      {showAI && (
        <AISimilarModal
          onSelectSuggestion={handleAISuggestion}
          onClose={() => setShowAI(false)}
        />
      )}
    </>
  );
}

