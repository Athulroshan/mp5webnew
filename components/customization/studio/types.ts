/**
 * Core TypeScript types for the T-Shirt Mockup Studio Editor.
 * Single source of truth for all shared interfaces.
 */

// ─── View ──────────────────────────────────────────────────────────────────

export type ViewKey = "front" | "back" | "leftSleeve" | "rightSleeve";

export const VIEW_LABELS: Record<ViewKey, string> = {
  front: "Front",
  back: "Back",
  leftSleeve: "Left Sleeve",
  rightSleeve: "Right Sleeve",
};

// ─── Design Layer ──────────────────────────────────────────────────────────

export interface Design {
  id: string;
  url: string;       // data URL from FileReader
  name: string;
  // Position within print area — normalized 0→1
  x: number;
  y: number;
  // Transform
  scale: number;     // 1.0 = 100%
  rotation: number;  // degrees 0–360
  visible: boolean;
  zIndex: number;
}

// ─── Parts ────────────────────────────────────────────────────────────────

export type PartKey = "body" | "sleeves" | "collar" | "leftSleeve" | "rightSleeve";

export interface PartColors {
  body: string;
  sleeves: string;
  collar: string;
  leftSleeve?: string;
  rightSleeve?: string;
}

export const PART_LABELS: Record<PartKey, string> = {
  body: "Body",
  sleeves: "Sleeves (Both)",
  leftSleeve: "Left Sleeve",
  rightSleeve: "Right Sleeve",
  collar: "Collar",
};

// ─── Material ─────────────────────────────────────────────────────────────

export interface Material {
  id: string;
  name: string;
  description: string;
  priceDelta: number; // added to base price in INR
}

export const MATERIALS: Material[] = [
  { id: "cotton",        name: "Cotton",         description: "Soft, breathable, everyday wear",           priceDelta: 0   },
  { id: "polyester",     name: "Polyester",       description: "Durable, wrinkle-resistant, vibrant prints", priceDelta: -50 },
  { id: "cotton-blend",  name: "Cotton Blend",    description: "Comfort of cotton + strength of polyester",  priceDelta: 30  },
  { id: "dry-fit",       name: "Dry-Fit",         description: "Moisture-wicking for sports & activity",     priceDelta: 80  },
  { id: "prem-cotton",   name: "Premium Cotton",  description: "Supima cotton — ultra-soft, ring-spun",      priceDelta: 150 },
];

// ─── Print Area (per view) ─────────────────────────────────────────────────

export interface PrintArea {
  left: number;   // fraction of canvas width
  top: number;    // fraction of canvas height
  width: number;  // fraction of canvas width
  height: number; // fraction of canvas height
}

export const PRINT_AREAS: Record<ViewKey, PrintArea> = {
  front:      { left: 0.28, top: 0.16, width: 0.44, height: 0.58 },
  back:       { left: 0.28, top: 0.16, width: 0.44, height: 0.58 },
  leftSleeve: { left: 0.10, top: 0.25, width: 0.28, height: 0.40 },
  rightSleeve:{ left: 0.62, top: 0.25, width: 0.28, height: 0.40 },
};

// ─── Garment Product Styles ─────────────────────────────────────────────

export type GarmentStyle =
  | "round-neck"
  | "polo"
  | "oversized"
  | "full-sleeve"
  | "half-sleeve"
  | "hoodie";

export interface GarmentStyleOption {
  id: GarmentStyle;
  name: string;
  description: string;
  priceDelta: number;
}

export const GARMENT_STYLES: GarmentStyleOption[] = [
  { id: "round-neck",  name: "Round-neck T-shirt",   description: "Classic crew neck standard fit",    priceDelta: 0 },
  { id: "polo",        name: "Collar / Polo T-shirt", description: "3D turned collar & placket detail", priceDelta: 150 },
  { id: "oversized",   name: "Oversized T-shirt",    description: "Dropped shoulders & wide cut",      priceDelta: 100 },
  { id: "full-sleeve", name: "Full-sleeve T-shirt",  description: "Extended long sleeves to wrist",   priceDelta: 120 },
  { id: "half-sleeve", name: "Half-sleeve T-shirt",  description: "Relaxed casual half sleeves",       priceDelta: 0 },
  { id: "hoodie",      name: "Hoodie",               description: "3D Hood & kangaroo pouch pocket",   priceDelta: 400 },
];

// ─── History ──────────────────────────────────────────────────────────────

export interface HistorySnapshot {
  designs: Record<ViewKey, Design[]>;
  garmentStyle: GarmentStyle;
  shirtColor: string;
  partColors: PartColors;
  material: Material;
}

// ─── Editor State ─────────────────────────────────────────────────────────

export interface EditorState {
  designs: Record<ViewKey, Design[]>;
  currentView: ViewKey;
  selectedDesignId: string | null;
  garmentStyle: GarmentStyle;
  shirtColor: string;
  partColors: PartColors;
  material: Material;
  zoom: number;
  past: HistorySnapshot[];
  future: HistorySnapshot[];
}

// ─── Editor Actions ────────────────────────────────────────────────────────

export type EditorAction =
  | { type: "ADD_DESIGN";        payload: { view: ViewKey; design: Design } }
  | { type: "UPDATE_DESIGN";     payload: { view: ViewKey; id: string; changes: Partial<Design> } }
  | { type: "DELETE_DESIGN";     payload: { view: ViewKey; id: string } }
  | { type: "DUPLICATE_DESIGN";  payload: { view: ViewKey; id: string } }
  | { type: "SELECT_DESIGN";     payload: string | null }
  | { type: "SET_VIEW";          payload: ViewKey }
  | { type: "SET_GARMENT_STYLE"; payload: GarmentStyle }
  | { type: "SET_SHIRT_COLOR";   payload: string }
  | { type: "SET_PART_COLOR";    payload: { part: PartKey; color: string } }
  | { type: "SET_MATERIAL";      payload: Material }
  | { type: "SET_ZOOM";          payload: number }
  | { type: "BRING_FORWARD";     payload: { view: ViewKey; id: string } }
  | { type: "SEND_BACKWARD";     payload: { view: ViewKey; id: string } }
  | { type: "TOGGLE_VISIBLE";    payload: { view: ViewKey; id: string } }
  | { type: "UNDO" }
  | { type: "REDO" };

// ─── AI ───────────────────────────────────────────────────────────────────

export interface AISuggestion {
  id: string;
  url: string;
  label: string;
}

// ─── Canvas Handle Types ───────────────────────────────────────────────────

export type HandleId =
  | "tl" | "tc" | "tr"
  | "ml" | "mr"
  | "bl" | "bc" | "br"
  | "rot"
  | "body";

export interface Handle {
  id: HandleId;
  px: number; // canvas pixel x
  py: number; // canvas pixel y
}
