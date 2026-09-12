/**
 * Dedicated Manufacturing Process Page — Interactive Presentation / Slider
 * Route: /products/manufacturing-process
 * Features a large presentation slider, 17 process slides with uploaded factory photos,
 * horizontal stage progress bar, Equipment & Technology card slider, Quality & Inspection section,
 * interactive AQL chart, and Lightbox zoom modal.
 */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Palette,
  Scissors,
  Factory,
  Package,
  Truck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2,
  ZoomIn,
  X,
  Layers,
  Search,
  FileCheck,
  Award,
  Cpu,
  Boxes,
  Maximize2,
  Sliders,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CommonContactForm from "@/components/sections/contact-form";

interface SlideData {
  id: string;
  slideIndex: number;
  stepNumber: string;
  title: string;
  category: string;
  phaseGroup: "Yarn" | "Inspection" | "Fabric" | "Cutting" | "Stitching" | "Finishing" | "Quality" | "Packing" | "Shipment";
  tagline: string;
  description: string;
  keyPoints: string[];
  primaryImage: string;
  fallbackImage: string;
  altText: string;
  contain?: boolean;
}

const slides: SlideData[] = [
  {
    id: "yarn-stacking",
    slideIndex: 1,
    stepNumber: "01",
    title: "Yarn Stacking",
    category: "MATERIAL PREPARATION",
    phaseGroup: "Yarn",
    tagline: "Incoming yarn and raw materials organized systematically before production.",
    description:
      "All incoming yarn lots, raw thread spools, and greige materials are systematically received, cataloged, and organized in temperature-regulated holding racks. Each batch is tagged with lot numbers and composition certificates for complete raw material traceability.",
    keyPoints: [
      "Systematic lot-based yarn storage & color grouping",
      "Organized raw material holding area before production",
      "Full digital lot tracking & material inventory control",
    ],
    primaryImage: "/images/manufacturing/yarn-stacking/main.jpeg",
    fallbackImage: "/uploads/yarn_stacking_real.jpg",
    altText: "Yarn stacking and raw material storage area with yellow boundary line",
  },
  {
    id: "sample-planning",
    slideIndex: 2,
    stepNumber: "02",
    title: "Sample Planning & Pre-Production Audit",
    category: "PRE-PRODUCTION PLANNING",
    phaseGroup: "Inspection",
    tagline: "Pre-production sample planning, size specification mapping, and tech pack review.",
    description:
      "Production merchandisers and senior QA engineers review buyer tech packs, compute statistical sampling plans (AQL 2.5), calculate consumption yields, and outline quality standards before bulk manufacturing begins.",
    keyPoints: [
      "Pre-production sample plan formulation & tech pack mapping",
      "Calculation of AQL statistical sampling tables and acceptable defect limits",
      "Material consumption planning & trim spec board verification",
    ],
    primaryImage: "/images/manufacturing/sample-plan/main.jpeg",
    fallbackImage: "/uploads/sample_plan_real.jpg",
    altText: "Senior QA planner formulating pre-production sample plan and reviewing tech packs",
  },
  {
    id: "yarn-stacking-area",
    slideIndex: 3,
    stepNumber: "03",
    title: "Yarn Stacking Area",
    category: "MATERIAL STORAGE",
    phaseGroup: "Yarn",
    tagline: "Organized yarn storage and holding area.",
    description:
      "A dedicated warehouse holding section designed for high-capacity yarn and greige fabric roll storage. Heavy-duty pallet racking and yellow safety boundaries maintain efficient material flow directly to production lines.",
    keyPoints: [
      "High-density pallet rack storage management",
      "First-In-First-Out (FIFO) material staging",
      "Dust-protected clean storage environment",
    ],
    primaryImage: "/images/manufacturing/yarn-stacking-area/main.jpeg",
    fallbackImage: "/uploads/yarn_stacking_real.jpg",
    altText: "Organized greige fabric and yarn stacking warehouse area",
  },
  {
    id: "cut-pattern",
    slideIndex: 4,
    stepNumber: "04",
    title: "Cut Pattern",
    category: "PATTERN PREPARATION",
    phaseGroup: "Fabric",
    tagline: "Preparation of garment patterns and templates before fabric cutting.",
    description:
      "Garment merchandisers and pattern makers draft master garment templates, size grading charts, and paper marker layouts. Hanging approved pattern boards ensure exact seam allowances and component shapes across all sizes.",
    keyPoints: [
      "CAD pattern drafting & approved master pattern boards",
      "Size grading across S to 3XL with seam allowance marking",
      "Optimized marker layout for maximum fabric yield",
    ],
    primaryImage: "/images/manufacturing/cut-pattern/main.jpeg",
    fallbackImage: "/uploads/cut_pattern_real.jpg",
    altText: "Hanging approved garment pattern templates and cut pattern rack",
  },
  {
    id: "fabric-stacking",
    slideIndex: 5,
    stepNumber: "05",
    title: "Fabric Stacking",
    category: "FABRIC PREPARATION",
    phaseGroup: "Fabric",
    tagline: "Layering and alignment of fabric before cutting.",
    description:
      "Fabric rolls are relaxed to eliminate tension before being stacked on long spreading tables. Multi-ply fabric lays are precisely aligned layer-by-layer to maintain vertical edge registration across up to 100 plies.",
    keyPoints: [
      "Tension-free multi-ply fabric lay spreading",
      "Edge-alignment registration for multi-layer accuracy",
      "24-hour fabric relaxation period before cutting",
    ],
    primaryImage: "/images/manufacturing/fabric-stacking/main.jpeg",
    fallbackImage: "/uploads/fabric_stacking_real.jpg",
    altText: "Multi-ply fabric stacking and fabric roll warehouse storage",
  },
  {
    id: "fabric-inspection",
    slideIndex: 6,
    stepNumber: "06",
    title: "Fabric Inspection",
    category: "QUALITY CONTROL",
    phaseGroup: "Inspection",
    tagline: "Inspection of fabric for defects, shade, consistency and quality.",
    description:
      "100% of fabric rolls pass over translucent light inspection tables based on the 4-Point System. Quality auditors inspect for weave holes, slubs, bowed weft, shade variations, and GSM weight consistency.",
    keyPoints: [
      "Light table inspection with overhead fluorescent lighting",
      "4-Point System defect penalty scoring",
      "GSM weight check & shade shading verification",
    ],
    primaryImage: "/images/manufacturing/fabric-inspection/main.jpeg",
    fallbackImage: "/uploads/fabric_inspection_machine_real.jpg",
    altText: "Fabric inspection machine unit checking fabric rolls for defects and shade consistency",
  },
  {
    id: "fabric-cutting",
    slideIndex: 7,
    stepNumber: "07",
    title: "Fabric Cutting",
    category: "CUTTING",
    phaseGroup: "Cutting",
    tagline: "Conventional and precision fabric cutting according to approved patterns.",
    description:
      "Master cutters use vertical straight-knife and band-knife machinery to cut multi-layered fabric lays following printed paper marker templates, creating clean panel edges and precise alignment notches.",
    keyPoints: [
      "Straight-knife & high-speed band knife cutting",
      "Notch cutting for component assembly registration",
      "Ply numbering & bundle identification tags",
    ],
    primaryImage: "/images/manufacturing/fabric-cutting/main.jpeg",
    fallbackImage: "/uploads/fabric_cutting_machine_real.jpg",
    altText: "Fabric cutting hall with SAN-V band knife cutting machines and spreading tables",
  },
  {
    id: "automated-fabric-cutting",
    slideIndex: 8,
    stepNumber: "08",
    title: "Automated Fabric Cutting",
    category: "ADVANCED CUTTING",
    phaseGroup: "Cutting",
    tagline: "Computer-controlled automated cutting and accurate panel production.",
    description:
      "Our state-of-the-art CNC automated cutter utilizes vacuum compression and oscillating knife heads to slice through thick fabric lays with millimeter accuracy, boosting output and eliminating human cutting errors.",
    keyPoints: [
      "Vacuum-assisted lay compression for zero ply shifting",
      "Computer-guided oscillating blade head with auto-sharpening",
      "High-speed automated panel production with 0.1mm tolerance",
    ],
    primaryImage: "/images/manufacturing/automated-fabric-cutting/main.jpeg",
    fallbackImage: "/uploads/automated_cutting_real.jpg",
    altText: "Automated CNC computer-controlled fabric cutting machine line",
  },
  {
    id: "cut-panel-inspection",
    slideIndex: 9,
    stepNumber: "09",
    title: "Cut Panel Inspection",
    category: "QUALITY CONTROL",
    phaseGroup: "Inspection",
    tagline: "Inspection of cut panels for dimensions, shape, alignment and defects.",
    description:
      "Before cut bundles move to sewing, quality checkers inspect top, middle, and bottom plies against acrylic master templates to confirm pattern accuracy, notch alignment, and shade sorting.",
    keyPoints: [
      "Template overlay check against master acrylic patterns",
      "Shade-sorting & ply numbering audit to prevent shading",
      "Bundle tagging & defect-free panel clearance",
    ],
    primaryImage: "/images/manufacturing/cut-panel-inspection/main.jpeg",
    fallbackImage: "/uploads/cut_panel_inspection_real.jpg",
    altText: "Cut panel inspection area with CUT PANEL INSPECTION AREA sign and bundle tables",
  },
  {
    id: "stitching",
    slideIndex: 10,
    stepNumber: "10",
    title: "Stitching Area",
    category: "GARMENT ASSEMBLY",
    phaseGroup: "Stitching",
    tagline: "Garment assembly and stitching operations.",
    description:
      "Garment panels move through synchronized sewing lines equipped with single-needle lockstitch, 4-thread overlock, and coverstitch workstations. Skilled operators assemble components under inline supervisor monitoring.",
    keyPoints: [
      "Synchronized modular assembly lines with single-piece flow",
      "High-speed ISO 301 lockstitch & 504 overlock machinery",
      "Stitch density (SPI) & seam elasticity inline verification",
    ],
    primaryImage: "/images/manufacturing/stitching/main.jpeg",
    fallbackImage: "/uploads/stitching_area_real.jpg",
    altText: "Industrial garment stitching hall with rows of JUKI sewing machines",
  },
  {
    id: "ironing",
    slideIndex: 11,
    stepNumber: "11",
    title: "Ironing",
    category: "FINISHING",
    phaseGroup: "Finishing",
    tagline: "Pressing and ironing for garment appearance and finishing.",
    description:
      "Assembled garments undergo vacuum-assisted steam ironing. Operators press collars, seams, and bodies on vacuum bucks to eliminate wrinkles, set dimensions, and enhance fabric luster.",
    keyPoints: [
      "Boiler steam pressing with vacuum extraction bucks",
      "Garment measurement setting & crease removal",
      "Heat-sensitive fabric temperature regulation",
    ],
    primaryImage: "/images/manufacturing/ironing/main.jpeg",
    fallbackImage: "/uploads/ironing_real.jpg",
    altText: "Industrial steam ironing section with vacuum extraction tables and pressing bucks",
  },
  {
    id: "packing",
    slideIndex: 12,
    stepNumber: "12",
    title: "Packing",
    category: "PACKING",
    phaseGroup: "Packing",
    tagline: "Folding, tagging, polybagging, and preparing finished garments for packing.",
    description:
      "Pressed garments receive woven brand tags, price hangtags, and barcode stickers. Finished garments are neatly folded with tissue inserts, inserted into sealed polybags, and pre-sorted by size.",
    keyPoints: [
      "Brand hangtag, price ticket & barcode sticker attachment",
      "Neat garment folding with protective tissue backing",
      "Self-seal polybagging with suffocating safety warnings",
    ],
    primaryImage: "/images/manufacturing/packing/main.jpeg",
    fallbackImage: "/uploads/packing_area_real.jpg",
    altText: "Garment packing tables with SIZE-05 and SIZE-06 signs and tag attachment",
  },
  {
    id: "stacking",
    slideIndex: 13,
    stepNumber: "13",
    title: "Stacking Area",
    category: "FINISHED GOODS",
    phaseGroup: "Packing",
    tagline: "Temporary organization and storage of packed garments before cartonization.",
    description:
      "Polybagged garments are organized on spacious sorting tables by color, size ratio, and style code. Clear visual batch labels prevent mix-ups before final master carton packing.",
    keyPoints: [
      "Clean tabletop batch organization by size ratio",
      "Pre-carton audit for polybag barcode scanning",
      "Dust-free temporary holding environment",
    ],
    primaryImage: "/images/manufacturing/stacking/main.jpeg",
    fallbackImage: "/uploads/stacking_area_real.jpg",
    altText: "Finished polybagged garments stacked in blue industrial storage crates before carton packing",
  },
  {
    id: "assortment-checking",
    slideIndex: 14,
    stepNumber: "14",
    title: "Assortment Checking",
    category: "PACKAGING & RATIO CONTROL",
    phaseGroup: "Packing",
    tagline: "Physical verification of garment size distribution, color ratios, and barcode tags.",
    description:
      "QA merchandisers physically count and inspect polybagged garments against buyer purchase orders — verifying exact size ratios (S, M, L, XL), color assortments, price hangtags, and UPC/EAN barcode labels on tabletop audit stations.",
    keyPoints: [
      "Physical size ratio & color breakdown verification against PO packing list",
      "Barcode scanner audit for polybag UPC/EAN codes and hangtag prices",
      "Pre-carton audit clearance to prevent size breakdown errors in export boxes",
    ],
    primaryImage: "/images/manufacturing/assortment-checking/main.jpeg",
    fallbackImage: "/uploads/assortment_checking_real.jpg",
    altText: "QA auditor performing garment size assortment checking on polybagged shirts at inspection table",
  },
  {
    id: "carton-loading",
    slideIndex: 15,
    stepNumber: "15",
    title: "Carton Loading",
    category: "DISPATCH",
    phaseGroup: "Shipment",
    tagline: "Placing packed garments into shipping cartons according to order ratio.",
    description:
      "Garments are packed into heavy-duty 5-ply corrugated export cartons following buyer breakdown rules (solid size or ratio pack). Each carton is moisture-sealed with inner liner bags and reinforced with plastic strapping.",
    keyPoints: [
      "5-ply heavy corrugated export carton packing",
      "Desiccant silica gel pouch placement against humidity",
      "Carton gross weight verification & security strapping",
    ],
    primaryImage: "/images/manufacturing/carton-loading/main.jpeg",
    fallbackImage: "/uploads/carton_loading_real.jpg",
    altText: "Stacked PROSPPER EXPORTS 5-ply export master cartons ready for shipment",
  },
  {
    id: "carton-open-verification",
    slideIndex: 16,
    stepNumber: "16",
    title: "Carton Open Verification",
    category: "PACKAGING & CONTENT AUDIT",
    phaseGroup: "Quality",
    tagline: "Opening randomly sampled export cartons to verify inner polybag packing, size ratios, and barcode tags.",
    description:
      "QA inspectors randomly unseal packed master export cartons on the warehouse floor to physically audit polybag alignment, barcode tag legibility, tissue folding, desiccant pouch placement, and exact garment size ratios inside each box.",
    keyPoints: [
      "Unsealing & physical audit of polybagged garments inside sampled master cartons",
      "Verification of inner barcode labels, hangtags & size sticker accuracy",
      "Desiccant silica gel pouch placement & inner poly liner audit",
    ],
    primaryImage: "/images/manufacturing/carton-verifying/main.jpeg",
    fallbackImage: "/uploads/carton_open_verifying_real.jpg",
    altText: "QA auditor performing open carton content verification auditing polybagged garments and barcodes",
  },
  {
    id: "carton-marking-check",
    slideIndex: 17,
    stepNumber: "17",
    title: "Carton Marking Check",
    category: "SHIPPING & LABEL AUDIT",
    phaseGroup: "Quality",
    tagline: "Verifying export carton labels, PO numbers, style codes, and shipping marks against buyer specifications.",
    description:
      "Before final dispatch, QA inspectors audit master carton markings, barcode stickers, PO details, destination tags, gross/net weight readings, and size breakdown charts to guarantee zero shipping errors and full customs compliance.",
    keyPoints: [
      "Detailed audit of buyer PO number, style code, color & destination marks",
      "Verification of gross/net carton weight & dimension measurements",
      "Barcode scanning & carton number sequence compliance check",
    ],
    primaryImage: "/images/manufacturing/carton-marking-check/main.jpeg",
    fallbackImage: "/uploads/carton_marking_check_real.jpg",
    altText: "QA inspector performing carton marking check on stacked export cartons with audit checklist",
  },
  {
    id: "trims-checking",
    slideIndex: 18,
    stepNumber: "18",
    title: "Trims & Label Accessories Audit",
    category: "TRIMS & ACCESSORIES AUDIT",
    phaseGroup: "Quality",
    tagline: "Physical inspection of brand labels, care tags, hangtags, zippers, and trim placement.",
    description:
      "QA auditors carefully check brand main neck labels, care/content tags, barcode hangtags, snap buttons, zippers, and decorative trims against approved buyer trim cards to ensure 100% correct placement and attachment quality.",
    keyPoints: [
      "Verification of main neck labels, care tags & country of origin markings",
      "Zipper smooth-function test, snap button pull test & trim card matching",
      "Barcode hangtag price & style number accuracy verification",
    ],
    primaryImage: "/images/manufacturing/trims-checking/main.jpeg",
    fallbackImage: "/uploads/trims_checking_real.jpg",
    altText: "QA auditor inspecting garment main label, care tag, and hangtag trims at inspection table",
  },
  {
    id: "garment-measurement-checking",
    slideIndex: 19,
    stepNumber: "19",
    title: "Garment Measurement Audit",
    category: "MEASUREMENT & TOLERANCE AUDIT",
    phaseGroup: "Quality",
    tagline: "Physical measurement audit of chest, length, sleeve, and neck tolerances using measuring tapes against approved size specs.",
    description:
      "QA auditors lay out sample garments flat on spacious inspection tables, using calibrated measuring tapes to verify chest width, body length, sleeve length, shoulder slope, and neck width against tech pack spec sheets (within ±0.5cm tolerance).",
    keyPoints: [
      "Precision measurement checking across XS, S, M, L, XL, XXL size specs",
      "Calibrated measuring tape audit against tech pack tolerance charts (±0.5cm)",
      "Pre-shipment measurement clearance to eliminate sizing discrepancies",
    ],
    primaryImage: "/images/manufacturing/measurement-checking/main.jpeg",
    fallbackImage: "/uploads/measurement_checking_real.jpg",
    altText: "Senior QA auditor conducting garment measurement checking on inspection table using measuring tape",
  },
  {
    id: "aql-piece-checking",
    slideIndex: 20,
    stepNumber: "20",
    title: "AQL Garment Piece Checking",
    category: "WORKMANSHIP & DEFECT AUDIT",
    phaseGroup: "Quality",
    tagline: "100% visual and tactile piece-by-piece inspection of sampled garments for stitching and fabric defects.",
    description:
      "QA auditors conduct piece-by-piece visual and tactile inspections of sampled garments on white inspection tables — examining seam tension, SPI stitch density, open seams, raw edges, oil stains, color shading, and fabric defects under standardized lighting.",
    keyPoints: [
      "100% piece-by-piece inspection of sampled garments from selected cartons",
      "Categorization of defects into Critical, Major (AQL 2.5), and Minor (AQL 4.0)",
      "Seam strength, SPI density, thread trimming & surface cleanliness audit",
    ],
    primaryImage: "/images/manufacturing/aql-piece-checking/main.jpeg",
    fallbackImage: "/uploads/aql_piece_checking_real.jpg",
    altText: "QA auditor performing piece-by-piece AQL garment checking on inspection table",
  },
  {
    id: "final-quality-inspection",
    slideIndex: 21,
    stepNumber: "21",
    title: "Final Quality Inspection",
    category: "FINAL QUALITY CONTROL",
    phaseGroup: "Quality",
    tagline: "Final garment inspection before shipment, including appearance & workmanship.",
    description:
      "QA auditors conduct a rigorous AQL 2.5 final random inspection (FRI). They verify workmanship, measurement tolerances, packaging accuracy, labeling, needle safety, and carton markings.",
    keyPoints: [
      "AQL 2.5 Major / 4.0 Minor pre-shipment audit clearance",
      "Workmanship, measurement, label & packaging verification",
      "Official Certificate of Inspection (COI) issuance",
    ],
    primaryImage: "/images/manufacturing/final-quality-inspection/main.jpeg",
    fallbackImage: "/uploads/final_quality_inspection_real.jpg",
    altText: "QA auditors conducting final random inspection FRI measuring finished garments and checking tags",
  },
  {
    id: "inspection-photo-capture",
    slideIndex: 22,
    stepNumber: "22",
    title: "Digital Photo Evidence Capture",
    category: "DIGITAL REPORTING",
    phaseGroup: "Quality",
    tagline: "Capturing high-resolution camera photographs of cartons, labels, and defect evidence for buyer reporting.",
    description:
      "Inspectors photograph master export cartons, size markings, measurement tapes, trim cards, and any defect evidence directly on site. These high-resolution images are compiled into the buyer's 19-sheet Master Excel report.",
    keyPoints: [
      "On-site camera photo capture of cartons, defect evidence & measurement charts",
      "Auto-embedding high-res photos into 19-sheet Master Excel audit report templates",
      "Complete digital transparency & photographic proof for buyer sign-off",
    ],
    primaryImage: "/images/manufacturing/inspection-photos/main.jpeg",
    fallbackImage: "/uploads/inspection_photos_real.jpg",
    altText: "QA auditor photographing export carton and defect evidence for digital inspection report",
  },
  {
    id: "final-shipment-stacking",
    slideIndex: 23,
    stepNumber: "23",
    title: "Final Shipment Carton Stacking",
    category: "SHIPMENT",
    phaseGroup: "Shipment",
    tagline: "Organized stacking of sealed cartons for shipment.",
    description:
      "Sealed export cartons are stacked on wooden pallets, stretch-wrapped for weather protection, and staged in the dispatch warehouse ready for container loading and worldwide shipping.",
    keyPoints: [
      "Wooden pallet stacking & stretch-film weather wrapping",
      "Shipping mark & side-mark barcode verification",
      "Container dock dispatch staging",
    ],
    primaryImage: "/images/manufacturing/final-shipment-stacking/main.jpeg",
    fallbackImage: "/uploads/final_shipment_stacking_real.jpg",
    altText: "Sealed export shipping cartons neatly stacked on blue pallets in dispatch warehouse hall",
  },
];

const phaseMilestones = [
  { name: "Yarn", matchIdxs: [0, 1, 2] },
  { name: "Fabric", matchIdxs: [3, 4, 5] },
  { name: "Cutting", matchIdxs: [6, 7, 8] },
  { name: "Stitching", matchIdxs: [9] },
  { name: "Finishing", matchIdxs: [10] },
  { name: "Packing", matchIdxs: [11, 12, 13] },
  { name: "Quality", matchIdxs: [14, 15, 16, 17, 18, 19, 20, 21] },
  { name: "Shipment", matchIdxs: [22] },
];

const equipmentItems = [
  {
    id: "eq-automated-cutter",
    title: "Automated CNC Fabric Cutting System",
    description:
      "Computerized lay-cutting machine with vacuum table compression and automatic blade sharpening. Slices multi-ply lays with 0.1mm tolerance, maximizing yield and speed.",
    image: "/images/manufacturing/automated-fabric-cutting/main.jpeg",
    fallback: "/uploads/automated_cutting_real.jpg",
    icon: Cpu,
  },
  {
    id: "eq-needle-sorting",
    title: "Needle Sorting & Metal Detection Machine",
    description:
      "Vital quality and safety control equipment designed for broken needle detection and metal fragment sorting to guarantee 100% garment safety before shipment.",
    image: "/images/manufacturing/needle-sorting/main.jpeg",
    fallback: "/uploads/needle_sorting_real.jpg",
    icon: ShieldCheck,
  },
  {
    id: "eq-pattern-making",
    title: "Pattern Making Machine & CAD Plotter",
    description:
      "Computer-aided pattern drafting and plotting equipment for creating accurate garment patterns and master templates, supporting consistent cutting and high-volume production.",
    image: "/images/manufacturing/pattern-making/main.jpeg",
    fallback: "/uploads/pattern_making_real.jpg",
    icon: Palette,
  },
];

export default function ManufacturingProcessPage() {
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; desc: string; contain?: boolean } | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const currentSlide = slides[currentSlideIdx];

  const handleImageError = (key: string) => {
    setImgErrors((prev) => ({ ...prev, [key]: true }));
  };

  const nextSlide = useCallback(() => {
    setCurrentSlideIdx((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlideIdx((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Keyboard Navigation (Left & Right Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch Swipe Navigation for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextSlide(); // Swipe Left -> Next
    if (distance < -50) prevSlide(); // Swipe Right -> Prev
    setTouchStart(null);
    setTouchEnd(null);
  };

  const activeImgUrl = imgErrors[currentSlide.id] ? currentSlide.fallbackImage : currentSlide.primaryImage;

  return (
    <div className="min-h-screen bg-slate-50/70 pt-16 sm:pt-20 pb-20">
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-slate-200/80 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <Link href="/products" className="hover:text-violet-600 transition-colors">Products</Link>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="text-slate-900 font-semibold">Manufacturing Process</span>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <section
        className="relative py-12 sm:py-16 text-white overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #090d16 0%, #1e1b4b 45%, #312e81 80%, #4338ca 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-violet-600/30 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-3 bg-violet-500/25 text-violet-200 border border-violet-400/30 px-3.5 py-1 text-xs font-semibold rounded-full shadow-xs">
            <Building2 className="h-3.5 w-3.5 mr-1.5 text-violet-300" />
            Interactive Garment Manufacturing Presentation
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3 text-white leading-tight">
            Manufacturing Process
          </h1>
          <p className="text-base sm:text-lg text-indigo-100 font-normal max-w-2xl mx-auto mb-6 leading-relaxed">
            From your idea to the finished product — navigate through our 17-step interactive production experience with actual factory photography.
          </p>
        </div>
      </section>

      {/* ── Process Progress Navigation Bar ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-slate-200/80 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {phaseMilestones.map((m, idx) => {
            const isCurrent = m.matchIdxs.includes(currentSlideIdx);
            const isPassed = Math.max(...m.matchIdxs) < currentSlideIdx;
            return (
              <React.Fragment key={m.name}>
                <button
                  onClick={() => setCurrentSlideIdx(m.matchIdxs[0])}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isCurrent
                      ? "bg-violet-600 text-white shadow-md scale-105"
                      : isPassed
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                  )}
                  {m.name}
                </button>
                {idx < phaseMilestones.length - 1 && (
                  <span
                    className={`text-xs font-bold select-none transition-colors ${
                      isPassed || isCurrent ? "text-emerald-500 font-black" : "text-slate-300"
                    }`}
                  >
                    →
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* ── FEATURED INTERACTIVE MANUFACTURING PROCESS SLIDER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div
          className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden transition-all duration-300"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Slide Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px] items-stretch">
            {/* LEFT / MAIN AREA: Photograph or Tech Display */}
            <div className="lg:col-span-7 relative bg-slate-950 flex items-center justify-center overflow-hidden group cursor-pointer min-h-[340px] lg:min-h-[520px]">
              {activeImgUrl ? (
                <>
                  <img
                    src={activeImgUrl}
                    alt={currentSlide.altText}
                    onError={() => handleImageError(currentSlide.id)}
                    className="w-full h-full object-cover min-h-[340px] lg:min-h-[520px] group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />

                  {/* Stage Counter Badge on Image */}
                  <Badge className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur text-white border-0 text-xs font-bold px-3 py-1 shadow-md">
                    Slide {currentSlide.stepNumber} / {slides.length}
                  </Badge>

                  {/* Click to Zoom Overlay */}
                  <button
                    onClick={() =>
                      setLightboxImage({
                        url: activeImgUrl,
                        title: `Slide ${currentSlide.stepNumber}: ${currentSlide.title}`,
                        desc: currentSlide.description,
                      })
                    }
                    className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-xl px-3 py-2 text-slate-900 text-xs font-bold shadow-lg flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity"
                  >
                    <ZoomIn className="h-4 w-4 text-violet-600" /> Click to Expand Photo
                  </button>
                </>
              ) : (
                <div className="p-8 sm:p-12 text-center text-white flex flex-col items-center justify-center space-y-4 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 w-full h-full">
                  <div className="w-16 h-16 rounded-2xl bg-violet-600/30 text-violet-400 border border-violet-500/30 flex items-center justify-center">
                    <Factory className="h-8 w-8" />
                  </div>
                  <Badge className="bg-violet-600/30 text-violet-300 border-violet-500/40 text-xs font-bold px-3 py-1">
                    {currentSlide.category}
                  </Badge>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {currentSlide.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md font-normal leading-relaxed">
                    {currentSlide.tagline}
                  </p>
                  <Badge className="bg-slate-900/90 backdrop-blur text-slate-300 border-0 text-xs font-bold px-3 py-1 shadow-md">
                    Slide {currentSlide.stepNumber} / {slides.length}
                  </Badge>
                </div>
              )}
            </div>

            {/* RIGHT / CONTENT AREA: Description & Info */}
            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-white border-t lg:border-t-0 lg:border-l border-slate-100">
              <div>
                {/* Category Label */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <Badge className="bg-violet-100 text-violet-800 border-violet-200 text-[11px] font-bold uppercase tracking-wider px-3 py-1">
                    {currentSlide.category}
                  </Badge>
                  <span className="text-xs font-extrabold text-slate-400">
                    {currentSlide.stepNumber} of {slides.length}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-2">
                  {currentSlide.title}
                </h2>

                {/* Tagline */}
                <p className="text-xs sm:text-sm font-semibold text-violet-700 mb-4 leading-snug">
                  "{currentSlide.tagline}"
                </p>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-6">
                  {currentSlide.description}
                </p>

                {/* Key Technical Points */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  {currentSlide.keyPoints.map((point, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs font-medium text-slate-700 leading-normal">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slider Bottom Navigation Controls */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={prevSlide}
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-xl border-slate-300 text-slate-700 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={nextSlide}
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-xl border-slate-300 text-slate-700 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                <div className="text-center">
                  <span className="text-sm font-black text-slate-900">{currentSlide.stepNumber}</span>
                  <span className="text-xs text-slate-400 font-bold"> / {slides.length}</span>
                </div>

                <Button
                  onClick={nextSlide}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs"
                >
                  Next Step <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Interactive Thumbnail Carousel Strip */}
          <div className="bg-slate-900 p-3 sm:p-4 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {slides.map((slideItem, sIdx) => {
              const isActive = sIdx === currentSlideIdx;
              const thumbUrl = imgErrors[slideItem.id] ? slideItem.fallbackImage : slideItem.primaryImage;
              return (
                <button
                  key={slideItem.id}
                  onClick={() => setCurrentSlideIdx(sIdx)}
                  className={`relative shrink-0 w-16 sm:w-20 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                    isActive
                      ? "border-violet-500 scale-105 ring-2 ring-violet-500/50"
                      : "border-slate-800 opacity-60 hover:opacity-100"
                  }`}
                  title={`${slideItem.stepNumber}. ${slideItem.title}`}
                >
                  <img
                    src={thumbUrl}
                    alt={slideItem.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-[10px] font-black text-white">{slideItem.stepNumber}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── EQUIPMENT & TECHNOLOGY SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge className="mb-2 bg-violet-100 text-violet-800 border-violet-200 text-xs font-semibold">
            Advanced Machinery
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Equipment &amp; Technology Showcase
          </h2>
          <p className="text-sm text-slate-500 font-normal">
            High-precision machinery powering consistent quality, speed, and safety.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipmentItems.map((eq) => {
            const imgUrl = imgErrors[eq.id] ? eq.fallback : eq.image;
            return (
              <div
                key={eq.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
                onClick={() =>
                  setLightboxImage({
                    url: imgUrl,
                    title: eq.title,
                    desc: eq.description,
                  })
                }
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 flex items-center justify-center">
                  {imgUrl ? (
                    <>
                      <img
                        src={imgUrl}
                        alt={eq.title}
                        onError={() => handleImageError(eq.id)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60" />
                      <div className="absolute top-3 left-3 p-2 rounded-xl bg-slate-900/90 text-white backdrop-blur shadow-sm">
                        <eq.icon className="h-4 w-4 text-violet-400" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur rounded-lg px-2.5 py-1 text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-bold flex items-center gap-1">
                        <ZoomIn className="h-3.5 w-3.5 text-violet-600" /> View Machine
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
                      <div className="p-3 rounded-2xl bg-violet-600/30 text-violet-300 border border-violet-500/30 mb-2">
                        <eq.icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-300">Technical Equipment</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 group-hover:text-violet-600 transition-colors line-clamp-1">
                      {eq.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-3">
                      {eq.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── QUALITY & INSPECTION SECTION & AQL CHART ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <Badge className="mb-2 bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-semibold">
            Quality Verification Standards
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Quality Assurance &amp; AQL Sampling Chart
          </h2>
          <p className="text-sm text-slate-500 font-normal">
            Acceptable Quality Limit (AQL 2.5 Major / 4.0 Minor) inspection standards and needle safety testing.
          </p>
        </div>

        {/* Interactive AQL Chart Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-emerald-200 shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* AQL Chart Container with Contain Fit & Zoom */}
            <div
              className="w-full lg:w-1/2 relative bg-slate-900 rounded-2xl p-4 overflow-hidden group cursor-pointer flex items-center justify-center min-h-[260px]"
              onClick={() =>
                setLightboxImage({
                  url: "/images/manufacturing/aql-chart/main.jpeg",
                  title: "ANSI / ASQ STANDARD Z1.4-2003 — Single Sampling Plan for Normal Inspection",
                  desc: "Official Acceptable Quality Limit (AQL) chart used by third-party auditors to determine sample size code letters and rejection numbers for Normal Inspection (AQL 0.065 to 6.5).",
                  contain: true,
                })
              }
            >
              <img
                src="/images/manufacturing/aql-chart/main.jpeg"
                alt="Official ANSI/ASQ STANDARD Z1.4-2003 AQL Inspection Chart Table"
                className="w-full max-h-[340px] object-contain rounded-xl group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors" />
              <div className="absolute bottom-3 right-3 bg-emerald-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold shadow-md flex items-center gap-1.5">
                <Maximize2 className="h-4 w-4" /> Click to Expand &amp; Zoom Chart
              </div>
            </div>

            {/* AQL Information */}
            <div className="w-full lg:w-1/2 space-y-4">
              <Badge className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1 border-0">
                ISO 2859-1 / ANSI / ASQ Z1.4 Standard
              </Badge>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Acceptable Quality Limit (AQL) Standards
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Our pre-shipment inspections follow international AQL standards. Sample sizes are selected at random based on total lot order size.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <h4 className="text-xs font-bold text-emerald-900 mb-1">Critical Defects (AQL 0.0)</h4>
                  <p className="text-[11px] text-emerald-700 font-normal">Zero tolerance for broken needles, sharp edges, or hazardous chemical residues.</p>
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <h4 className="text-xs font-bold text-emerald-900 mb-1">Major Defects (AQL 2.5)</h4>
                  <p className="text-[11px] text-emerald-700 font-normal">Open seams, dimensional tolerance deviations (&gt;1.5cm), or severe panel shading.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Control Checklist Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3">
              <Search className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Yarn &amp; Fabric Inspection</h4>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Light table inspection on raw fabric rolls and spectrophotometer color matching across yarn lots.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3">
              <FileCheck className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Cut Panel Inspection</h4>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Notch alignment, template measurement audit, and continuous sewing line SPI checks.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Needle Sorting &amp; Metal Safety</h4>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              High-sensitivity metal detection and needle sorting machine verifying 100% of finished garments before shipment.
            </p>
          </div>
        </div>
      </section>

      {/* ── UNIFIED COMMON CONTACT SECTION ── */}
      <CommonContactForm defaultScope="products" />

      {/* ── LIGHTBOX / ZOOM MODAL FOR FACTORY PHOTOGRAPHS ── */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in-0 duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative bg-slate-900 rounded-3xl max-w-4xl w-full p-4 sm:p-6 overflow-hidden border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-white truncate pr-4">
                {lightboxImage.title}
              </h3>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden my-4 relative flex items-center justify-center min-h-[300px] bg-black/50 rounded-2xl">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className={`w-full max-h-[60vh] rounded-xl ${
                  lightboxImage.contain ? "object-contain" : "object-cover sm:object-contain"
                }`}
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed shrink-0 pt-2 border-t border-slate-800">
              {lightboxImage.desc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
