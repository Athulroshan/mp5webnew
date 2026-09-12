"use client";

import React from "react";
import { ViewKey, VIEW_LABELS } from "./types";
import { useEditor } from "./editor-context";

export function ViewSwitcher() {
  const { state, dispatch } = useEditor();
  const views: ViewKey[] = ["front", "back", "leftSleeve", "rightSleeve"];

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200/80">
      {views.map((v) => {
        const isActive = state.currentView === v;
        const designCount = state.designs[v].filter((d) => d.visible).length;
        return (
          <button
            key={v}
            type="button"
            onClick={() => dispatch({ type: "SET_VIEW", payload: v })}
            className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isActive
                ? "bg-white text-violet-700 shadow-xs border border-violet-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <span>{VIEW_LABELS[v]}</span>
            {designCount > 0 && (
              <span className="w-4 h-4 rounded-full text-[9px] font-bold text-white bg-violet-600 flex items-center justify-center">
                {designCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

