/**
 * Custom Studio — Full-Screen Mockup Editor
 * Orchestrator: wires EditorProvider, left-panel, canvas-stage, view-switcher, bottom-bar.
 * All logic lives in the sub-components.
 */
"use client";

import React, { useRef, useCallback, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart, MoreHorizontal, Cpu, Palette, Layers,
  Maximize2, Wand2, Video, Sparkles, MousePointer, Hand,
  MessageSquare, RotateCcw, RotateCw, ArrowLeft, X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart, formatINR } from "@/lib/cart-context";

import { GARMENT_STYLES } from "@/components/customization/studio/types";
import { EditorProvider, useEditor } from "@/components/customization/studio/editor-context";

// ─── Left icon rail ────────────────────────────────────────────────────────
import { LeftPanel } from "@/components/customization/studio/left-panel";
import { CanvasStage, CanvasStageRef } from "@/components/customization/studio/canvas-stage";
import { BottomBar } from "@/components/customization/studio/bottom-bar";
import { ViewSwitcher } from "@/components/customization/studio/view-switcher";
import { ThreeDCanvas } from "@/components/customization/3d-canvas";

// ─── Left icon rail ────────────────────────────────────────────────────────

const LEFT_RAIL = [
  { icon: Palette,        label: "Edit",          id: "edit" },
  { icon: Layers,         label: "Models",        id: "models", badge: true },
  { icon: Maximize2,      label: "Layout",        id: "layout" },
  { icon: Wand2,          label: "AI Bg",         id: "ai_bg" },
  { icon: Video,          label: "Video",         id: "video" },
  { icon: MoreHorizontal, label: "More",          id: "more" },
  { icon: Sparkles,       label: "AI Design",     id: "ai_design", accent: true },
];

// ─── Right tool rail ───────────────────────────────────────────────────────

const RIGHT_TOOLS = [
  { icon: MousePointer, label: "Select",  id: "select" },
  { icon: Hand,         label: "Pan",     id: "pan" },
  { icon: MessageSquare,label: "Comment", id: "comment" },
  { icon: RotateCcw,    label: "Undo",    id: "undo" },
  { icon: RotateCw,     label: "Redo",    id: "redo" },
];

// ─── Inner studio (needs access to EditorContext) ─────────────────────────

function StudioInner() {
  const { state, dispatch, canUndo, canRedo, currentDesigns } = useEditor();
  const { addItem } = useCart();
  const stageRef = useRef<CanvasStageRef>(null);
  const [activeTool, setActiveTool] = useState("select");
  const [showMobileLeftPanel, setShowMobileLeftPanel] = useState(false);

  const handleExport = useCallback(() => {
    stageRef.current?.exportPNG();
  }, []);

  const handleResetView = useCallback(() => {
    dispatch({ type: "SET_VIEW", payload: "front" });
    dispatch({ type: "SET_ZOOM", payload: 100 });
  }, [dispatch]);

  const currentStyleOpt = GARMENT_STYLES.find((s) => s.id === state.garmentStyle);
  const stylePriceDelta = currentStyleOpt ? currentStyleOpt.priceDelta : 0;
  const totalPrice = 799 + state.material.priceDelta + stylePriceDelta;

  const handleAddToCart = useCallback(() => {
    const styleName = currentStyleOpt ? currentStyleOpt.name : "Custom 3D T-Shirt";
    const title = `${styleName} (${state.material.name})`;
    addItem(
      {
        id: `custom-${Date.now()}`,
        name: title,
        price: totalPrice,
        color: state.shirtColor,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500",
      },
      1
    );
  }, [state, currentStyleOpt, totalPrice, addItem]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f1f5f9] overflow-hidden select-none">
      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-white border-b border-slate-200 px-4 h-12 shrink-0 z-20 gap-2 shadow-xs">
        {/* Left Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              M
            </div>
            <span className="text-sm font-extrabold text-slate-900 hidden md:block">
              Custom Studio <span className="text-violet-600 text-xs font-semibold">3D</span>
            </span>
          </Link>

          {/* Mobile panel toggle */}
          <button
            type="button"
            onClick={() => setShowMobileLeftPanel(!showMobileLeftPanel)}
            className="md:hidden px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-lg border border-violet-200 flex items-center gap-1"
          >
            <Palette className="h-3.5 w-3.5" />
            <span>Customize</span>
          </button>
        </div>

        {/* Center — Top View Navigation */}
        <div className="overflow-x-auto no-scrollbar">
          <ViewSwitcher />
        </div>

        {/* Right — 3D View indicator & Add to Cart */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-xl shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-violet-600" />
            <span>3D View</span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-sm active:scale-[0.98]"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Add to Cart</span>
            <Badge className="ml-1 bg-white/20 text-white text-[10px] px-1.5 py-0 border-0 font-extrabold">
              {formatINR(totalPrice)}
            </Badge>
          </button>
        </div>
      </div>

      {/* ── MAIN WORKSPACE ──────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left customization panel (desktop & mobile drawer overlay) */}
        <div
          className={`
          fixed md:relative inset-y-12 md:inset-y-0 left-0 z-30 md:z-auto transition-transform duration-200 flex shrink-0
          ${showMobileLeftPanel ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
        `}
        >
          <LeftPanel />
        </div>

        {/* Backdrop for mobile drawer */}
        {showMobileLeftPanel && (
          <div
            onClick={() => setShowMobileLeftPanel(false)}
            className="md:hidden fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-xs"
          />
        )}

        {/* Center 3D viewport canvas stage */}
        <div className="flex-1 relative overflow-hidden bg-[#f1f5f9]">
          <CanvasStage ref={stageRef} />
          <BottomBar onExport={handleExport} onResetView={handleResetView} />
        </div>

        {/* Right side toolbar */}
        <div className="w-11 sm:w-12 bg-white border-l border-slate-200 flex flex-col items-center py-3 gap-1 shrink-0 z-10 shadow-xs">
          {RIGHT_TOOLS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => {
                if (tool.id === "undo") {
                  dispatch({ type: "UNDO" });
                  return;
                }
                if (tool.id === "redo") {
                  dispatch({ type: "REDO" });
                  return;
                }
                if (tool.id === "reset_view") {
                  handleResetView();
                  return;
                }
                setActiveTool(tool.id);
              }}
              title={tool.label}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-colors ${
                activeTool === tool.id
                  ? "bg-violet-50 text-violet-700 border border-violet-200 font-bold"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <tool.icon className="h-4 w-4" />
            </button>
          ))}
          <div className="w-6 h-px bg-slate-200 my-1" />
          <Link
            href="/"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
            title="Back to home"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Page export (wraps with EditorProvider) ──────────────────────────────

export default function CustomStudioPage() {
  return (
    <EditorProvider>
      <StudioInner />
    </EditorProvider>
  );
}
