"use client";

import React from "react";
import { CheckCircle, X } from "lucide-react";
import { MATERIALS, Material } from "./types";
import { formatINR } from "@/lib/cart-context";

interface MaterialModalProps {
  current: Material;
  onSelect: (m: Material) => void;
  onClose: () => void;
}

export function MaterialModal({ current, onSelect, onClose }: MaterialModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Custom Material</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Material list */}
        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
          {MATERIALS.map((mat) => {
            const isSelected = mat.id === current.id;
            return (
              <button
                key={mat.id}
                onClick={() => { onSelect(mat); onClose(); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all hover:border-violet-300 hover:bg-violet-50"
                style={{
                  borderColor: isSelected ? "#7c3aed" : "#f3f4f6",
                  background: isSelected ? "#faf5ff" : "white",
                }}
              >
                {/* Color swatch */}
                <div
                  className="w-10 h-10 rounded-lg flex-shrink-0 border border-gray-200"
                  style={{
                    background:
                      mat.id === "cotton"       ? "linear-gradient(135deg,#f9fafb,#e5e7eb)" :
                      mat.id === "polyester"    ? "linear-gradient(135deg,#ede9fe,#c4b5fd)" :
                      mat.id === "cotton-blend" ? "linear-gradient(135deg,#ecfdf5,#a7f3d0)" :
                      mat.id === "dry-fit"      ? "linear-gradient(135deg,#eff6ff,#bfdbfe)" :
                                                  "linear-gradient(135deg,#fff7ed,#fcd34d)",
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">{mat.name}</p>
                    {mat.priceDelta !== 0 && (
                      <span className="text-[10px] font-medium text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded-full">
                        {mat.priceDelta > 0 ? "+" : ""}{formatINR(mat.priceDelta)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{mat.description}</p>
                </div>
                {isSelected && <CheckCircle className="h-4 w-4 text-violet-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
