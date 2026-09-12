"use client";

import React, { useState, useCallback } from "react";
import { X, Sparkles, Upload, AlertTriangle } from "lucide-react";
import { AISuggestion } from "./types";
import { aiService } from "./ai-service";

interface AISimilarModalProps {
  onSelectSuggestion: (url: string, label: string) => void;
  onClose: () => void;
}

export function AISimilarModal({ onSelectSuggestion, onClose }: AISimilarModalProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [inputUrl, setInputUrl] = useState<string | null>(null);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setInputUrl(url);
      runSearch(url);
    };
    reader.readAsDataURL(file);
  }, []);

  const runSearch = useCallback(async (url: string) => {
    setStatus("loading");
    try {
      const results = await aiService.findSimilarDesigns(url);
      setSuggestions(results);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-sm font-semibold text-gray-800">Find Similar with AI</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Upload to search */}
          {status === "idle" && (
            <>
              <p className="text-xs text-gray-500 text-center">
                Upload or select a design to find visually similar graphics.
              </p>
              <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#ede9fe,#ddd6fe)" }}>
                  <Upload className="h-5 w-5 text-violet-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700">Upload an image</p>
                  <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, or WEBP</p>
                </div>
                <input type="file" accept="image/*" className="sr-only" onChange={handleFileInput} />
              </label>
              <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg p-2 flex gap-1.5 items-start">
                <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                AI similarity is currently running in demo mode. Results are curated mock suggestions.
              </p>
            </>
          )}

          {/* Loading */}
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-violet-100" />
                <div className="absolute inset-0 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Analyzing design...</p>
              <p className="text-xs text-gray-400">Finding similar graphics</p>
            </div>
          )}

          {/* Results */}
          {status === "done" && (
            <>
              <p className="text-xs text-gray-500">Click a suggestion to add it to your design.</p>
              <div className="grid grid-cols-3 gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { onSelectSuggestion(s.url, s.label); onClose(); }}
                    className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100 hover:border-violet-400 transition-all hover:shadow-lg"
                  >
                    <img src={s.url} alt={s.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                      <p className="text-[9px] text-white font-medium truncate">{s.label}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setStatus("idle"); setSuggestions([]); }}
                className="w-full py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Search again
              </button>
            </>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="text-center py-8 space-y-3">
              <p className="text-sm text-red-600 font-medium">Search failed</p>
              <button
                onClick={() => { setStatus("idle"); }}
                className="text-xs text-violet-600 underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
