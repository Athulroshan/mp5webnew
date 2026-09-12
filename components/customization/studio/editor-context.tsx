/**
 * Central Editor State Management
 * useReducer with full undo/redo history stack.
 * Every state-mutating action first pushes a snapshot to `past`.
 */
"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";
import {
  EditorState, EditorAction, ViewKey, Design, HistorySnapshot, MATERIALS,
} from "./types";

// ─── Initial state ────────────────────────────────────────────────────────

const emptyViews = (): EditorState["designs"] => ({
  front: [], back: [], leftSleeve: [], rightSleeve: [],
});

const INITIAL_STATE: EditorState = {
  designs: emptyViews(),
  currentView: "front",
  selectedDesignId: null,
  garmentStyle: "round-neck",
  shirtColor: "#ffffff",
  partColors: { body: "#ffffff", sleeves: "#ffffff", collar: "#ffffff" },
  material: MATERIALS[0],
  zoom: 100,
  past: [],
  future: [],
};

// ─── History helpers ──────────────────────────────────────────────────────

const HISTORY_LIMIT = 50;

function snapshot(s: EditorState): HistorySnapshot {
  return {
    designs: JSON.parse(JSON.stringify(s.designs)),
    garmentStyle: s.garmentStyle,
    shirtColor: s.shirtColor,
    partColors: { ...s.partColors },
    material: { ...s.material },
  };
}

function pushHistory(s: EditorState): EditorState {
  const past = [...s.past, snapshot(s)].slice(-HISTORY_LIMIT);
  return { ...s, past, future: [] };
}

function restoreSnapshot(s: EditorState, snap: HistorySnapshot): EditorState {
  return {
    ...s,
    designs: snap.designs,
    garmentStyle: snap.garmentStyle || "round-neck",
    shirtColor: snap.shirtColor,
    partColors: snap.partColors,
    material: snap.material,
    selectedDesignId: null,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {

    case "ADD_DESIGN": {
      const s = pushHistory(state);
      return {
        ...s,
        designs: {
          ...s.designs,
          [action.payload.view]: [
            ...s.designs[action.payload.view],
            action.payload.design,
          ],
        },
        selectedDesignId: action.payload.design.id,
      };
    }

    case "UPDATE_DESIGN": {
      const { view, id, changes } = action.payload;
      // Only push to history if not a "live drag" (position changes during drag
      // are committed in bulk; callers can batch using a flag)
      const s = pushHistory(state);
      return {
        ...s,
        designs: {
          ...s.designs,
          [view]: s.designs[view].map((d) =>
            d.id === id ? { ...d, ...changes } : d
          ),
        },
      };
    }

    case "DELETE_DESIGN": {
      const { view, id } = action.payload;
      const s = pushHistory(state);
      return {
        ...s,
        designs: {
          ...s.designs,
          [view]: s.designs[view].filter((d) => d.id !== id),
        },
        selectedDesignId:
          state.selectedDesignId === id ? null : state.selectedDesignId,
      };
    }

    case "DUPLICATE_DESIGN": {
      const { view, id } = action.payload;
      const orig = state.designs[view].find((d) => d.id === id);
      if (!orig) return state;
      const copy: Design = {
        ...orig,
        id: `design-${Date.now()}`,
        x: Math.min(0.95, orig.x + 0.05),
        y: Math.min(0.95, orig.y + 0.05),
        zIndex: Math.max(...state.designs[view].map((d) => d.zIndex), 0) + 1,
      };
      const s = pushHistory(state);
      return {
        ...s,
        designs: {
          ...s.designs,
          [view]: [...s.designs[view], copy],
        },
        selectedDesignId: copy.id,
      };
    }

    case "SELECT_DESIGN":
      return { ...state, selectedDesignId: action.payload };

    case "SET_VIEW":
      return { ...state, currentView: action.payload, selectedDesignId: null };

    case "SET_GARMENT_STYLE": {
      const s = pushHistory(state);
      return {
        ...s,
        garmentStyle: action.payload,
      };
    }

    case "SET_SHIRT_COLOR": {
      const s = pushHistory(state);
      return {
        ...s,
        shirtColor: action.payload,
        partColors: {
          body: action.payload,
          sleeves: action.payload,
          collar: action.payload,
          leftSleeve: action.payload,
          rightSleeve: action.payload,
        },
      };
    }

    case "SET_PART_COLOR": {
      const s = pushHistory(state);
      const { part, color } = action.payload;
      const newPartColors = { ...s.partColors, [part]: color };
      if (part === "sleeves") {
        newPartColors.leftSleeve = color;
        newPartColors.rightSleeve = color;
      }
      return {
        ...s,
        partColors: newPartColors,
      };
    }

    case "SET_MATERIAL": {
      const s = pushHistory(state);
      return { ...s, material: action.payload };
    }

    case "SET_ZOOM":
      return { ...state, zoom: Math.max(25, Math.min(200, action.payload)) };

    case "BRING_FORWARD": {
      const { view, id } = action.payload;
      const list = [...state.designs[view]];
      const idx = list.findIndex((d) => d.id === id);
      if (idx < 0 || idx === list.length - 1) return state;
      [list[idx], list[idx + 1]] = [list[idx + 1], list[idx]];
      return { ...state, designs: { ...state.designs, [view]: list } };
    }

    case "SEND_BACKWARD": {
      const { view, id } = action.payload;
      const list = [...state.designs[view]];
      const idx = list.findIndex((d) => d.id === id);
      if (idx <= 0) return state;
      [list[idx], list[idx - 1]] = [list[idx - 1], list[idx]];
      return { ...state, designs: { ...state.designs, [view]: list } };
    }

    case "TOGGLE_VISIBLE": {
      const { view, id } = action.payload;
      return {
        ...state,
        designs: {
          ...state.designs,
          [view]: state.designs[view].map((d) =>
            d.id === id ? { ...d, visible: !d.visible } : d
          ),
        },
      };
    }

    case "UNDO": {
      if (state.past.length === 0) return state;
      const past = [...state.past];
      const snap = past.pop()!;
      return {
        ...restoreSnapshot(state, snap),
        past,
        future: [snapshot(state), ...state.future].slice(0, HISTORY_LIMIT),
      };
    }

    case "REDO": {
      if (state.future.length === 0) return state;
      const future = [...state.future];
      const snap = future.shift()!;
      return {
        ...restoreSnapshot(state, snap),
        past: [...state.past, snapshot(state)].slice(-HISTORY_LIMIT),
        future,
      };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────

interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  canUndo: boolean;
  canRedo: boolean;
  currentDesigns: Design[];
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, INITIAL_STATE);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;
  const currentDesigns = state.designs[state.currentView];

  return (
    <EditorContext.Provider value={{ state, dispatch, canUndo, canRedo, currentDesigns }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside <EditorProvider>");
  return ctx;
}
