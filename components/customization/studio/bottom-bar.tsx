"use client";

import React, { useCallback } from "react";
import { Minus, Plus, RefreshCw, Copy, Download, Sparkles } from "lucide-react";
import { useEditor } from "./editor-context";

interface BottomBarProps {
  onExport: () => void;
  onResetView?: () => void;
}

export function BottomBar({ onExport, onResetView }: BottomBarProps) {
  const { state, dispatch, currentDesigns } = useEditor();
  const { zoom, selectedDesignId, currentView } = state;

  const selectedDesign = currentDesigns.find((d) => d.id === selectedDesignId);

  const zoomIn = () => dispatch({ type: "SET_ZOOM", payload: zoom + 10 });
  const zoomOut = () => dispatch({ type: "SET_ZOOM", payload: zoom - 10 });
  const resetZoom = () => {
    dispatch({ type: "SET_ZOOM", payload: 100 });
    if (onResetView) onResetView();
  };

  const duplicate = useCallback(() => {
    if (!selectedDesignId) return;
    dispatch({ type: "DUPLICATE_DESIGN", payload: { view: currentView, id: selectedDesignId } });
  }, [selectedDesignId, currentView, dispatch]);

  return (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 py-2.5 bg-white/90 backdrop-blur-sm border-t border-slate-200 z-10">
      {/* Left — zoom controls & reset view */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={zoomOut}
          className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-40"
          disabled={zoom <= 25}
          title="Zoom out"
        >
          <Minus className="h-3 w-3" />
        </button>

        <button
          type="button"
          onClick={resetZoom}
          className="px-2.5 h-7 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors min-w-[52px] text-center"
          title="Reset zoom"
        >
          {zoom}%
        </button>

        <button
          type="button"
          onClick={zoomIn}
          className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-40"
          disabled={zoom >= 200}
          title="Zoom in"
        >
          <Plus className="h-3 w-3" />
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={resetZoom}
          className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-full shadow-xs hover:bg-slate-50 transition-colors"
          title="Reset 3D camera view"
        >
          <RefreshCw className="h-3 w-3 text-slate-500" />
          <span>Reset View</span>
        </button>

        {selectedDesign && (
          <button
            type="button"
            onClick={duplicate}
            className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center hover:bg-slate-50 text-slate-700 transition-colors"
            title="Duplicate selected artwork"
          >
            <Copy className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Center — feature badge */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-200 bg-violet-50/70">
        <Sparkles className="h-3 w-3 text-violet-600" />
        <span className="text-xs font-bold text-violet-800">3D Texture Projected Configurator</span>
      </div>

      {/* Right — export */}
      <button
        type="button"
        onClick={onExport}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:bg-violet-700 bg-violet-600 shadow-md"
        title="Download PNG capture"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Export PNG</span>
      </button>
    </div>
  );
}

