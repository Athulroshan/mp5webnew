"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { PartColors, PartKey, PART_LABELS } from "./types";

interface PartsModalProps {
  partColors: PartColors;
  onChange: (part: PartKey, color: string) => void;
  onClose: () => void;
}

const PART_SWATCHES: string[] = [
  "#ffffff", "#18181b", "#991b1b", "#1e40af",
  "#065f46", "#d97706", "#7c3aed", "#ec4899",
  "#94a3b8", "#c4b5fd", "#fbcfe8", "#fde68a",
];

export function PartsModal({ partColors, onChange, onClose }: PartsModalProps) {
  const [activePart, setActivePart] = useState<PartKey>("body");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Custom Parts</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Part selector tabs */}
          <div className="flex gap-2">
            {(Object.keys(PART_LABELS) as PartKey[]).map((part) => (
              <button
                key={part}
                onClick={() => setActivePart(part)}
                className="flex-1 py-2 text-xs font-semibold rounded-lg border-2 transition-all"
                style={{
                  borderColor: activePart === part ? "#7c3aed" : "#e5e7eb",
                  background: activePart === part ? "#faf5ff" : "white",
                  color: activePart === part ? "#7c3aed" : "#6b7280",
                }}
              >
                {PART_LABELS[part]}
              </button>
            ))}
          </div>

          {/* Visual t-shirt part diagram */}
          <div className="flex items-center justify-center py-2">
            <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
              {/* Collar */}
              <path
                d="M44 8 Q60 18 76 8"
                stroke={partColors.collar} strokeWidth="6" strokeLinecap="round"
                opacity={activePart === "collar" ? 1 : 0.4}
                className="cursor-pointer"
                onClick={() => setActivePart("collar")}
              />
              {/* Left sleeve */}
              <path
                d="M44 12 L14 28 L20 48 L40 36 Z"
                fill={partColors.sleeves} stroke="#e5e7eb" strokeWidth="1"
                opacity={activePart === "sleeves" ? 1 : 0.5}
                className="cursor-pointer"
                onClick={() => setActivePart("sleeves")}
              />
              {/* Right sleeve */}
              <path
                d="M76 12 L106 28 L100 48 L80 36 Z"
                fill={partColors.sleeves} stroke="#e5e7eb" strokeWidth="1"
                opacity={activePart === "sleeves" ? 1 : 0.5}
                className="cursor-pointer"
                onClick={() => setActivePart("sleeves")}
              />
              {/* Body */}
              <path
                d="M40 36 L20 48 L20 95 L100 95 L100 48 L80 36 Q60 42 40 36Z"
                fill={partColors.body} stroke="#e5e7eb" strokeWidth="1"
                opacity={activePart === "body" ? 1 : 0.5}
                className="cursor-pointer"
                onClick={() => setActivePart("body")}
              />
            </svg>
          </div>

          {/* Current part color display */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div
              className="w-8 h-8 rounded-lg border-2 border-white shadow"
              style={{ backgroundColor: partColors[activePart] }}
            />
            <div>
              <p className="text-xs text-gray-500">Active Part</p>
              <p className="text-sm font-semibold text-gray-800">{PART_LABELS[activePart]}</p>
            </div>
            <input
              type="color"
              value={partColors[activePart]}
              onChange={(e) => onChange(activePart, e.target.value)}
              className="ml-auto w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
            />
          </div>

          {/* Swatches */}
          <div className="grid grid-cols-6 gap-2">
            {PART_SWATCHES.map((c) => (
              <button
                key={c}
                onClick={() => onChange(activePart, c)}
                className="w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: partColors[activePart] === c ? "#7c3aed" : "#e5e7eb",
                  boxShadow: partColors[activePart] === c ? "0 0 0 2px #ede9fe" : "none",
                }}
                title={c}
              />
            ))}
          </div>

          {/* Done button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
