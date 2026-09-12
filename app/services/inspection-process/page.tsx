/**
 * Dedicated Inspection Process Page — Interactive Presentation / Slider
 * Route: /services/inspection-process
 * Features a large emerald-themed presentation slider with 9 inspection steps,
 * real factory photographs, milestone navigation bar, thumbnail carousel strip,
 * 9-card visual timeline flow, AQL 2.5/4.0 standards card, Excel reporting card, and Lightbox zoom modal.
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  Maximize2,
  CheckCircle2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CommonContactForm from "@/components/sections/contact-form";


interface PhaseSlide {
  id: string;
  slideIndex: number;
  stepNumber: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  keyPoints: string[];
  primaryImage: string;
  fallbackImage: string;
  altText: string;
}

const inspectionSlides: PhaseSlide[] = [
  {
    id: "sample-plan",
    slideIndex: 1,
    stepNumber: "01",
    title: "Sample Plan",
    category: "PRE-INSPECTION SETUP",
    tagline: "Formulating statistical AQL 2.5 sampling plans and auditing buyer tech packs.",
    description:
      "Inspection begins with an approved sampling plan that determines the quantity and selection of garments to be inspected based on ISO 2859-1 / ANSI Z1.4 sampling tables.",
    keyPoints: [
      "Formulation of AQL 2.5 Major / 4.0 Minor statistical sampling plan tables",
      "Review of buyer PO specifications, approved tech packs & sealed counter-samples",
      "Calculated sample size distribution & factory audit workflow timeline setup",
    ],
    primaryImage: "/images/manufacturing/sample-plan/main.jpeg",
    fallbackImage: "/uploads/sample_plan_real.jpg",
    altText: "Senior QA auditor calculating AQL sample plan and reviewing tech packs on wall",
  },
  {
    id: "carton-checking",
    slideIndex: 2,
    stepNumber: "02",
    title: "Carton Checking",
    category: "DISPATCH & PACKAGING AUDIT",
    tagline: "Checking master export cartons for structural integrity, quantity, and packing rules.",
    description:
      "Check cartons for quantity, physical condition, identification, 5-ply corrugated strength, liner seals, and packing accuracy.",
    keyPoints: [
      "5-ply heavy corrugated export carton condition & weight check",
      "Physical count & box identification against packing list",
      "Silica gel pouch placement & inner poly liner moisture audit",
    ],
    primaryImage: "/images/manufacturing/carton-loading/main.jpeg",
    fallbackImage: "/uploads/carton_loading_real.jpg",
    altText: "QA inspector auditing master export cartons in dispatch area",
  },
  {
    id: "carton-marking-check",
    slideIndex: 3,
    stepNumber: "03",
    title: "Carton Marking Check",
    category: "SHIPPING & LABEL AUDIT",
    tagline: "Verifying export carton labels, PO numbers, style codes, and shipping marks.",
    description:
      "Verify carton markings, labels, shipping information, destination tags, gross/net weight readings, and other required details against the approved specifications.",
    keyPoints: [
      "Detailed audit of buyer PO number, style code, color & destination marks",
      "Verification of gross/net carton weight & dimension measurements",
      "Barcode scanning & carton number sequence compliance check",
    ],
    primaryImage: "/images/manufacturing/carton-marking-check/main.jpeg",
    fallbackImage: "/uploads/carton_marking_check_real.jpg",
    altText: "QA inspector checking carton marking labels against order specifications",
  },
  {
    id: "carton-verifying",
    slideIndex: 4,
    stepNumber: "04",
    title: "Carton Opening & Verification",
    category: "CONTENT UNSEALING AUDIT",
    tagline: "Unsealing sampled master cartons to verify inner polybag packing and product details.",
    description:
      "Open selected cartons and verify the contents, packing arrangement, product details, tissue folding, and exact quantities.",
    keyPoints: [
      "Unsealing & physical content audit of polybagged garments inside sampled cartons",
      "Verification of inner barcode tags, hangtags & size sticker accuracy",
      "Desiccant silica gel pouch placement & inner poly liner audit",
    ],
    primaryImage: "/images/manufacturing/carton-verifying/main.jpeg",
    fallbackImage: "/uploads/carton_open_verifying_real.jpg",
    altText: "QA auditor opening export carton and verifying inner polybagged garments",
  },
  {
    id: "assortment-checking",
    slideIndex: 5,
    stepNumber: "05",
    title: "Assortment Checking",
    category: "SIZE & RATIO CONTROL",
    tagline: "Physical verification of garment size distribution, color ratios, and barcode hangtags.",
    description:
      "Verify the assortment of sizes, colors, styles, and quantities against the approved order requirements on inspection tables.",
    keyPoints: [
      "Physical count & size ratio verification (XS to XXL breakdown)",
      "Polybag barcode sticker, hangtag & price label scanning",
      "Assortment ratio compliance check before master carton packing",
    ],
    primaryImage: "/images/manufacturing/assortment-checking/main.jpeg",
    fallbackImage: "/uploads/assortment_checking_real.jpg",
    altText: "QA auditor sorting polybagged garment stacks by size ratios and checking hangtags",
  },
  {
    id: "inspection-photos",
    slideIndex: 6,
    stepNumber: "06",
    title: "Inspection Photos",
    category: "DIGITAL EVIDENCE CAPTURE",
    tagline: "Capturing high-resolution camera photographs of cartons, labels, and defect evidence.",
    description:
      "Capture inspection photographs as visual records of the products, packaging, defect evidence, and inspection findings for the 19-sheet Master Excel report.",
    keyPoints: [
      "On-site camera photo capture of cartons, defect evidence & measurement charts",
      "19-sheet Master Excel report format with auto-embedded high-res photo grids",
      "Complete digital transparency & photographic proof for buyer sign-off",
    ],
    primaryImage: "/images/manufacturing/inspection-photos/main.jpeg",
    fallbackImage: "/uploads/inspection_photos_real.jpg",
    altText: "QA auditor taking high-resolution mobile photos of cartons and inspection evidence",
  },
  {
    id: "measurement-checking",
    slideIndex: 7,
    stepNumber: "07",
    title: "Measurement Check",
    category: "DIMENSIONAL TOLERANCE",
    tagline: "Measuring selected garments against approved size specifications and permitted tolerances.",
    description:
      "Measure selected garments and compare measurements against approved size specifications and permitted tolerances (enforcing ±0.5cm tolerance).",
    keyPoints: [
      "Precision measurement audit across XS, S, M, L, XL, XXL size specs",
      "Calibrated measuring tape audit against tech pack tolerance charts (±0.5cm)",
      "Pre-shipment measurement clearance to eliminate sizing discrepancies",
    ],
    primaryImage: "/images/manufacturing/measurement-checking/main.jpeg",
    fallbackImage: "/uploads/measurement_checking_real.jpg",
    altText: "Senior QA auditor measuring garment chest and length using measuring tape",
  },
  {
    id: "trims-checking",
    slideIndex: 8,
    stepNumber: "08",
    title: "Trims Checking",
    category: "TRIMS & ACCESSORIES AUDIT",
    tagline: "Inspecting buttons, zippers, labels, threads, accessories, and other trims for quality.",
    description:
      "Inspect buttons, zippers, labels, threads, accessories, and other trims for quality, correctness, attachment strength, and compliance.",
    keyPoints: [
      "Verification of main neck labels, care tags & country of origin markings",
      "Zipper smooth-function test, snap button pull test & trim card matching",
      "Barcode hangtag price & style number accuracy verification",
    ],
    primaryImage: "/images/manufacturing/trims-checking/main.jpeg",
    fallbackImage: "/uploads/trims_checking_real.jpg",
    altText: "QA auditor examining garment brand labels, care tags, and zippers at inspection table",
  },
  {
    id: "aql-piece-checking",
    slideIndex: 9,
    stepNumber: "09",
    title: "AQL Piece Checking",
    category: "WORKMANSHIP & AQL AUDIT",
    tagline: "100% visual and tactile piece-by-piece inspection according to AQL standards.",
    description:
      "Inspect selected pieces according to the AQL (Acceptable Quality Limit) standard and record defects to determine the final inspection result.",
    keyPoints: [
      "100% piece-by-piece inspection of sampled garments from selected cartons",
      "Categorization of defects into Critical, Major (AQL 2.5), and Minor (AQL 4.0)",
      "Seam strength, SPI density, thread trimming & surface cleanliness audit",
    ],
    primaryImage: "/images/manufacturing/aql-piece-checking/main.jpeg",
    fallbackImage: "/uploads/aql_piece_checking_real.jpg",
    altText: "QA auditor performing 100% piece-by-piece AQL garment checking on inspection table",
  },
];

const inspectionMilestones = [
  { name: "Sample Plan", matchIdx: 0 },
  { name: "Carton Check", matchIdx: 1 },
  { name: "Marking Check", matchIdx: 2 },
  { name: "Carton Open", matchIdx: 3 },
  { name: "Assortment", matchIdx: 4 },
  { name: "Photos", matchIdx: 5 },
  { name: "Measurement", matchIdx: 6 },
  { name: "Trims Check", matchIdx: 7 },
  { name: "AQL Piece Check", matchIdx: 8 },
];

export default function InspectionProcessPage() {
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
    desc: string;
    contain?: boolean;
  } | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const currentSlide = inspectionSlides[currentSlideIdx];

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  const nextSlide = useCallback(() => {
    setCurrentSlideIdx((prev) => (prev + 1) % inspectionSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlideIdx((prev) => (prev - 1 + inspectionSlides.length) % inspectionSlides.length);
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch Swipe for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextSlide();
    if (distance < -50) prevSlide();
    setTouchStart(null);
    setTouchEnd(null);
  };

  const activeImgUrl = imgErrors[currentSlide.id] ? currentSlide.fallbackImage : currentSlide.primaryImage;

  return (
    <div className="min-h-screen bg-slate-50/70 pt-16 sm:pt-20 pb-20">
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-slate-200/80 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <Link href="/services" className="hover:text-emerald-600 transition-colors">Services</Link>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="text-slate-900 font-semibold">Inspection Process</span>
        </div>
      </div>

      {/* ── Hero Banner (Emerald / Green Accent) ── */}
      <section
        className="relative py-14 sm:py-20 text-white overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #064e3b 0%, #047857 40%, #059669 80%, #10b981 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-emerald-400/25 text-emerald-100 border border-emerald-300/30 px-3.5 py-1 text-xs font-semibold rounded-full shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-emerald-200" />
            ISO 2859-1 &amp; AQL 2.5/4.0 Standard Quality Audit
          </Badge>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-white leading-tight">
            Inspection Process
          </h1>
          <p className="text-base sm:text-xl text-emerald-100 font-normal max-w-3xl mx-auto mb-6 leading-relaxed">
            A systematic quality inspection process to ensure every shipment meets approved specifications, quality standards, and customer requirements.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-emerald-100/90 pt-2 border-t border-emerald-500/30 max-w-3xl mx-auto">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <span>AQL 2.5 Major / 4.0 Minor</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <span>24-Hour Digital Reporting</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <span>Official COI Certification</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Process Progress Navigation Bar (Top Milestone Strip) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-slate-200/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {inspectionMilestones.map((m, idx) => {
            const isCurrent = idx === currentSlideIdx;
            const isPassed = idx < currentSlideIdx;
            return (
              <React.Fragment key={m.name}>
                <button
                  onClick={() => setCurrentSlideIdx(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isCurrent
                      ? "bg-emerald-600 text-white shadow-md scale-105"
                      : isPassed
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                  )}
                  {m.name}
                </button>
                {idx < inspectionMilestones.length - 1 && (
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

      {/* ── FEATURED INTERACTIVE INSPECTION SLIDER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div
          className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden transition-all duration-300"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Slide Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px] items-stretch">
            {/* LEFT / MAIN AREA: Factory Photograph */}
            <div className="lg:col-span-7 relative bg-slate-950 flex items-center justify-center overflow-hidden group cursor-pointer min-h-[340px] lg:min-h-[520px]">
              <img
                src={activeImgUrl}
                alt={currentSlide.altText}
                onError={() => handleImageError(currentSlide.id)}
                className="w-full h-full object-cover min-h-[340px] lg:min-h-[520px] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />

              {/* Counter Badge on Image */}
              <Badge className="absolute top-4 left-4 bg-emerald-950/90 backdrop-blur text-white border-0 text-xs font-bold px-3 py-1 shadow-md">
                Slide {currentSlide.stepNumber} / {inspectionSlides.length}
              </Badge>

              {/* Click to Zoom Button */}
              <button
                onClick={() =>
                  setLightboxImage({
                    url: activeImgUrl,
                    title: `Step ${currentSlide.stepNumber}: ${currentSlide.title}`,
                    desc: currentSlide.description,
                  })
                }
                className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-xl px-3 py-2 text-slate-900 text-xs font-bold shadow-lg flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity"
              >
                <ZoomIn className="h-4 w-4 text-emerald-600" /> Click to Expand Photo
              </button>
            </div>

            {/* RIGHT / CONTENT AREA: Description & Info */}
            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-white border-t lg:border-t-0 lg:border-l border-slate-100">
              <div>
                {/* Category Label */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[11px] font-bold uppercase tracking-wider px-3 py-1">
                    {currentSlide.category}
                  </Badge>
                  <span className="text-xs font-extrabold text-slate-400">
                    {currentSlide.stepNumber} of {inspectionSlides.length}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-2">
                  {currentSlide.title}
                </h2>

                {/* Tagline */}
                <p className="text-xs sm:text-sm font-semibold text-emerald-700 mb-4 leading-snug">
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

              {/* Slider Controls */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={prevSlide}
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-xl border-slate-300 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                    aria-label="Previous Step"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={nextSlide}
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-xl border-slate-300 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                    aria-label="Next Step"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                <div className="text-center">
                  <span className="text-sm font-black text-slate-900">{currentSlide.stepNumber}</span>
                  <span className="text-xs text-slate-400 font-bold"> / {inspectionSlides.length}</span>
                </div>

                <Button
                  onClick={nextSlide}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs"
                >
                  Next Step <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Interactive Thumbnail Carousel Strip */}
          <div className="bg-slate-900 p-3 sm:p-4 border-t border-slate-800 flex items-center gap-3 overflow-x-auto no-scrollbar">
            {inspectionSlides.map((slideItem, sIdx) => {
              const isActive = sIdx === currentSlideIdx;
              const thumbUrl = imgErrors[slideItem.id] ? slideItem.fallbackImage : slideItem.primaryImage;
              return (
                <button
                  key={slideItem.id}
                  onClick={() => setCurrentSlideIdx(sIdx)}
                  className={`relative shrink-0 w-24 sm:w-28 aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                    isActive
                      ? "border-emerald-500 scale-105 ring-2 ring-emerald-500/50"
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
                    <span className="text-xs font-black text-white">{slideItem.stepNumber}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── INSPECTION STANDARDS & AQL CHART SHOWCASE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <Badge className="mb-2 bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-semibold">
            Technical Quality Framework
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            AQL 2.5 Inspection &amp; Certification Framework
          </h2>
          <p className="text-sm text-slate-500 font-normal">
            International ISO 2859-1 / ANSI Z1.4 sampling tables and 24-hour digital reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* AQL Chart Interactive Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-600 text-white text-xs font-bold px-3 py-1">
                  ANSI / ASQ Z1.4 Standard
                </Badge>
                <span className="text-xs text-slate-400 font-semibold">Sampling Table</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Official AQL Inspection Sampling Plan
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Statistical lot sampling matrix used by third-party auditors to determine lot sample sizes, code letters, and acceptable defect thresholds for Critical (0.0), Major (2.5), and Minor (4.0) defects.
              </p>
            </div>

            <div
              className="relative bg-slate-900 rounded-2xl p-4 overflow-hidden group cursor-pointer flex items-center justify-center min-h-[200px]"
              onClick={() =>
                setLightboxImage({
                  url: "/images/manufacturing/aql-chart/main.jpeg",
                  title: "ANSI / ASQ STANDARD Z1.4-2003 AQL Inspection Chart Table",
                  desc: "Official Acceptable Quality Limit (AQL) table used by third-party auditors to determine sample size code letters and rejection numbers for Normal Inspection.",
                  contain: true,
                })
              }
            >
              <img
                src="/images/manufacturing/aql-chart/main.jpeg"
                alt="AQL Inspection Chart Table"
                className="w-full max-h-[220px] object-contain rounded-xl group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors" />
              <div className="absolute bottom-3 right-3 bg-emerald-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold shadow-md flex items-center gap-1.5">
                <Maximize2 className="h-4 w-4" /> Click to Zoom AQL Chart
              </div>
            </div>
          </div>

          {/* Master Excel Report Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-teal-600 text-white text-xs font-bold px-3 py-1">
                  19-Sheet Excel Format
                </Badge>
                <span className="text-xs text-slate-400 font-semibold">Digital Deliverable</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Master Digital Excel Inspection Report
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Complete digital audit package delivered within 24 hours. Includes embedded high-res defect photos, dimensional measurement audit charts, needle safety logs, and container seal numbers.
              </p>
            </div>

            <div
              className="relative bg-slate-900 rounded-2xl p-4 overflow-hidden group cursor-pointer flex items-center justify-center min-h-[200px]"
              onClick={() =>
                setLightboxImage({
                  url: "/images/manufacturing/cut-panel-inspection/main.jpeg",
                  title: "Master Digital Excel Inspection Report",
                  desc: "Comprehensive digital inspection report showing Audit sheet, Packing List, Measurement, Defect Photos, and AQL results.",
                  contain: true,
                })
              }
            >
              <img
                src="/images/manufacturing/cut-panel-inspection/main.jpeg"
                alt="Digital Defect Inspection Audit & Report System"
                className="w-full max-h-[220px] object-contain rounded-xl group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors" />
              <div className="absolute bottom-3 right-3 bg-teal-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold shadow-md flex items-center gap-1.5">
                <Maximize2 className="h-4 w-4" /> Click to Expand Report
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── UNIFIED COMMON CONTACT SECTION ── */}
      <CommonContactForm defaultScope="services" />

      {/* ── LIGHTBOX / ZOOM MODAL ── */}
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
