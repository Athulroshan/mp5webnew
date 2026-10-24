/**
 * Products Listing & Catalog Page
 * Redesigned according to reference specifications with Warm Cream & Terracotta design tokens.
 * Features:
 * - Top synchronized filter pills & Desktop Categories sidebar
 * - Search card with readable sort labels & view toggle (Grid / List)
 * - Custom Studio promo card ("Launch Studio →")
 * - Product cards with 4:3 hero carousel (arrows + dot indicators) + 1:1 angle thumbnails
 * - "View Details →" and circular arrow button navigation
 * - Floating round terracotta Back to Top button
 * - Empty state with shirt icon and Clear Filters pill
 */
"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowUp,
  Shirt,
  Sparkles,
  SlidersHorizontal,
  X,
  Star,
  CheckCircle,
  PackageCheck,
  Package,
  Factory,
  Scissors,
  Palette,
  Truck,
} from "lucide-react";
import { useCart, formatINR } from "@/lib/cart-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import CommonContactForm from "@/components/sections/contact-form";

// ─── Types ────────────────────────────────────────────────

interface ProductImage {
  url: string;
  alt?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  badge?: string;
  images: (ProductImage | string)[];
  ratingsAverage?: number;
  ratingsCount?: number;
  stock?: number;
  colors?: { name: string; hex: string; available?: boolean }[];
  sizes?: { name: string; available?: boolean }[];
}

// ─── Categories ───────────────────────────────────────────
// Replace old Sportswear / Normal T-Shirts / Hoodies with:
// Round Neck T-Shirts, Polo T-Shirts, Caps, School Uniforms, Shirts.
// "Uniform Sets" is excluded from filter chips, but displayed if present in data.
const categories = [
  { label: "All Products", value: "" },
  { label: "Round Neck T-Shirts", value: "Round Neck T-Shirts" },
  { label: "Polo T-Shirts", value: "Polo T-Shirts" },
  { label: "Caps", value: "Caps" },
  { label: "Industry & Worker Uniforms", value: "Industry & Worker Uniforms" },
  { label: "School Uniforms", value: "School Uniforms" },
  { label: "Shirts", value: "Shirts" },
];

const sortOptions = [
  { label: "Latest", value: "-createdAt" },
  { label: "Oldest", value: "createdAt" },
  { label: "Name A–Z", value: "name" },
  { label: "Price: Low to High", value: "price" },
  { label: "Price: High to Low", value: "-price" },
];

const trustStatements = [
  { icon: CheckCircle, label: "Tirupur Made" },
  { icon: Sparkles, label: "Custom Printing & Embroidery" },
  { icon: PackageCheck, label: "Direct Delivery" },
];

// Helper to normalize images array (only returns real, non-stock user images)
function normalizeImages(images: (ProductImage | string)[] | undefined): ProductImage[] {
  if (!images || images.length === 0) {
    return [];
  }
  return images
    .map((img, idx) => {
      if (typeof img === "string") {
        return { url: img, alt: `Photo ${idx + 1}` };
      }
      return {
        url: img.url || "",
        alt: img.alt || `Photo ${idx + 1}`,
      };
    })
    .filter((img) => Boolean(img.url && !img.url.includes("unsplash.com")));
}

// ─── Category Sidebar Component ───────────────────────────

function CategorySidebar({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Categories Card */}
      <div className="bg-[#FFFDF9] rounded-[24px] border border-[#E6D6BD] p-5 shadow-xs">
        <h3 className="text-xs text-[#7A746E] font-bold mb-4 uppercase tracking-wider flex items-center gap-2">
          <span>CATEGORIES</span>
        </h3>
        <div className="space-y-1.5">
          {categories.map((c) => {
            const isActive = selected === c.value;
            return (
              <button
                key={c.value}
                onClick={() => onSelect(c.value)}
                className={`w-full text-left px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 min-h-[44px] flex items-center justify-between ${
                  isActive
                    ? "bg-[#F7ECE9] text-[#C8452A] font-bold shadow-xs border border-[#C8452A]/20"
                    : "text-[#4A4540] hover:bg-[#F3E6D3]/60 hover:text-[#1F1F1F]"
                }`}
              >
                <span>{c.label}</span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#C8452A]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Studio Promo Card */}
      <div className="bg-[#FFFDF9] rounded-[24px] border border-[#E6D6BD] p-6 shadow-xs text-left relative overflow-hidden group">
        <div className="w-11 h-11 rounded-2xl bg-[#F7ECE9] text-[#C8452A] flex items-center justify-center mb-3">
          <Sparkles className="h-5 w-5" />
        </div>
        <h4 className="font-bold text-base text-[#1F1F1F] mb-1.5">Custom Studio</h4>
        <p className="text-xs text-[#4A4540] leading-relaxed mb-5">
          Design custom logos, artwork, and colors on any garment in our interactive 2D design studio.
        </p>
        <Link
          href="/customization"
          className="inline-flex items-center justify-center w-full min-h-[44px] px-5 py-2.5 rounded-full bg-[#C8452A] hover:bg-[#B03820] text-white text-xs font-bold transition-all shadow-xs group-hover:shadow-md"
        >
          Launch Studio →
        </Link>
      </div>
    </div>
  );
}

// ─── Product Card Component ───────────────────────────────

function ProductCard({
  product,
  viewMode,
}: {
  product: Product;
  viewMode: "grid" | "list";
}) {
  const images = normalizeImages(product.images);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Safeguard index in bounds
  const activeIndex = images.length > 0 && currentIdx < images.length ? currentIdx : 0;
  const currentHero = images.length > 0 ? images[activeIndex] : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleSelectThumb = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx(idx);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // ── List View Layout ──
  if (viewMode === "list") {
    return (
      <div className="bg-[#FFFDF9] rounded-[24px] border border-[#E6D6BD] p-4 sm:p-5 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col md:flex-row gap-5 items-stretch">
        {/* Left: Hero Image + Thumbnails OR Clean Branded Placeholder */}
        <div className="w-full md:w-72 shrink-0 flex flex-col gap-2.5">
          {images.length > 0 && currentHero ? (
            <div className="relative aspect-[4/3] rounded-[18px] overflow-hidden bg-[#F3E6D3] group">
              <img
                src={currentHero.url}
                alt={currentHero.alt || product.name}
                loading="lazy"
                className="w-full h-full object-cover transition-opacity duration-200"
              />
              <Link
                href={`/products/${product.id}`}
                className="absolute inset-0 z-10"
                aria-label={`View ${product.name}`}
              />

              {/* Badges */}
              {product.badge && (
                <Badge className="absolute top-2.5 left-2.5 z-20 pointer-events-none text-[11px] bg-[#C8452A] text-white font-bold border-0 rounded-full px-2.5 py-0.5">
                  {product.badge}
                </Badge>
              )}

              {/* Prev / Next Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 text-[#1F1F1F] hover:bg-white hover:text-[#C8452A] flex items-center justify-center shadow-md transition-all opacity-80 hover:opacity-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 text-[#1F1F1F] hover:bg-white hover:text-[#C8452A] flex items-center justify-center shadow-md transition-all opacity-80 hover:opacity-100"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* Dot Indicators */}
                  <div className="absolute bottom-2 inset-x-0 z-20 flex items-center justify-center gap-1.5 pointer-events-none">
                    {images.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-200 ${
                          i === activeIndex
                            ? "w-4 bg-[#C8452A]"
                            : "w-1.5 bg-white/80 shadow-xs"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="relative aspect-[4/3] rounded-[18px] bg-[#F3E6D3]/60 border border-[#E6D6BD]/70 flex flex-col items-center justify-center p-6 text-center group">
              <Link
                href={`/products/${product.id}`}
                className="absolute inset-0 z-10"
                aria-label={`View ${product.name}`}
              />
              <div className="w-14 h-14 rounded-2xl bg-white/90 border border-[#E6D6BD] flex items-center justify-center text-[#C8452A] shadow-xs group-hover:scale-105 transition-transform mb-2">
                <Shirt className="h-7 w-7" />
              </div>
              <span className="text-xs font-bold text-[#1F1F1F]">{product.category}</span>
              <span className="text-[11px] text-[#7A746E]">Photo available on request</span>
            </div>
          )}

          {/* Thumbnails row */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleSelectThumb(e, idx)}
                  aria-label={`Select angle ${idx + 1}`}
                  className={`relative w-11 h-11 shrink-0 rounded-xl overflow-hidden border transition-all duration-150 ${
                    idx === activeIndex
                      ? "ring-2 ring-[#C8452A] ring-offset-1 border-[#C8452A]"
                      : "border-[#E6D6BD] opacity-75 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt || `Angle ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & CTA */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-bold text-[#C8452A] uppercase tracking-wider">
                {product.category}
              </span>
              {discount > 0 && (
                <span className="text-[11px] font-bold text-[#C8452A] bg-[#F7ECE9] px-2 py-0.5 rounded-full">
                  Save {discount}%
                </span>
              )}
            </div>

            <Link href={`/products/${product.id}`} className="block group">
              <h3 className="text-lg font-bold text-[#1F1F1F] group-hover:text-[#C8452A] transition-colors mb-2">
                {product.name}
              </h3>
            </Link>

            <p className="text-sm text-[#4A4540] line-clamp-2 leading-relaxed mb-4">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E6D6BD]/60 mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-[#1F1F1F]">
                {formatINR(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-[#7A746E] line-through font-normal">
                  {formatINR(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/products/${product.id}`}
                className="text-sm font-bold text-[#C8452A] hover:underline inline-flex items-center gap-1 min-h-[44px] px-2"
              >
                View Details →
              </Link>
              <Link
                href={`/products/${product.id}`}
                aria-label={`View details of ${product.name}`}
                className="w-10 h-10 rounded-full bg-[#F3E6D3] text-[#C8452A] hover:bg-[#C8452A] hover:text-white flex items-center justify-center transition-all duration-150 shadow-xs"
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Grid View Layout ──
  return (
    <div className="bg-[#FFFDF9] rounded-[24px] border border-[#E6D6BD] overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
      {/* Hero Image Container (4:3) OR Clean Branded Placeholder */}
      {images.length > 0 && currentHero ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F3E6D3] rounded-t-[24px] group">
          <img
            src={currentHero.url}
            alt={currentHero.alt || product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-opacity duration-200"
          />

          {/* Link overlay */}
          <Link
            href={`/products/${product.id}`}
            className="absolute inset-0 z-10"
            aria-label={`View ${product.name}`}
          />

          {/* Badges */}
          {product.badge && (
            <Badge className="absolute top-3 left-3 z-20 pointer-events-none text-xs bg-[#C8452A] text-white font-bold border-0 rounded-full px-3 py-1 shadow-xs">
              {product.badge}
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="absolute top-3 right-3 z-20 pointer-events-none text-xs bg-[#1F1F1F] text-white font-bold border-0 rounded-full px-2.5 py-0.5">
              -{discount}%
            </Badge>
          )}

          {/* Prev / Next Arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 text-[#1F1F1F] hover:bg-white hover:text-[#C8452A] flex items-center justify-center shadow-md transition-all opacity-80 hover:opacity-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 text-[#1F1F1F] hover:bg-white hover:text-[#C8452A] flex items-center justify-center shadow-md transition-all opacity-80 hover:opacity-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Dot Indicators */}
              <div className="absolute bottom-2.5 inset-x-0 z-20 flex items-center justify-center gap-1.5 pointer-events-none">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      i === activeIndex
                        ? "w-4 bg-[#C8452A]"
                        : "w-1.5 bg-white/80 shadow-xs"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="relative aspect-[4/3] w-full bg-[#F3E6D3]/60 rounded-t-[24px] flex flex-col items-center justify-center p-6 text-center border-b border-[#E6D6BD]/50 group">
          <Link
            href={`/products/${product.id}`}
            className="absolute inset-0 z-10"
            aria-label={`View ${product.name}`}
          />
          {product.badge && (
            <Badge className="absolute top-3 left-3 z-20 pointer-events-none text-xs bg-[#C8452A] text-white font-bold border-0 rounded-full px-3 py-1 shadow-xs">
              {product.badge}
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="absolute top-3 right-3 z-20 pointer-events-none text-xs bg-[#1F1F1F] text-white font-bold border-0 rounded-full px-2.5 py-0.5">
              -{discount}%
            </Badge>
          )}
          <div className="w-16 h-16 rounded-2xl bg-white/90 border border-[#E6D6BD] flex items-center justify-center text-[#C8452A] shadow-xs group-hover:scale-105 transition-transform mb-2.5">
            <Shirt className="h-8 w-8" />
          </div>
          <span className="text-xs font-bold text-[#1F1F1F] tracking-wide mb-0.5">
            {product.category}
          </span>
          <span className="text-[11px] text-[#7A746E]">
            Photo available on request
          </span>
        </div>
      )}

      {/* Row of Thumbnails (only if images exist) */}
      {images.length > 1 && (
        <div className="px-4 pt-3 pb-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => handleSelectThumb(e, idx)}
              aria-label={`Select angle ${idx + 1}`}
              className={`relative w-11 h-11 shrink-0 rounded-xl overflow-hidden border transition-all duration-150 ${
                idx === activeIndex
                  ? "ring-2 ring-[#C8452A] ring-offset-1 border-[#C8452A]"
                  : "border-[#E6D6BD] opacity-75 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt={img.alt || `Angle ${idx + 1}`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Product Content (no fake ratings) */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#C8452A] uppercase tracking-wider">
              {product.category}
            </span>
          </div>

          <Link href={`/products/${product.id}`} className="group block">
            <h3 className="text-base font-bold text-[#1F1F1F] group-hover:text-[#C8452A] transition-colors line-clamp-1 mb-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-[#4A4540] line-clamp-1 mb-3">
            {product.description}
          </p>
        </div>

        {/* Footer: Price + View Details link + Round Arrow Button */}
        <div className="pt-3 border-t border-[#E6D6BD]/60 flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-[#1F1F1F]">
              {formatINR(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#7A746E] line-through font-normal">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/products/${product.id}`}
              className="text-xs font-bold text-[#C8452A] hover:underline inline-flex items-center gap-0.5 min-h-[44px] px-1"
            >
              View Details →
            </Link>
            <Link
              href={`/products/${product.id}`}
              aria-label={`View details of ${product.name}`}
              className="w-9 h-9 rounded-full bg-[#F3E6D3] text-[#C8452A] hover:bg-[#C8452A] hover:text-white flex items-center justify-center transition-all duration-150 shadow-xs"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Catalog Page ────────────────────────────────────

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF3E8] flex items-center justify-center">
          <span className="text-[#4A4540] font-medium">Loading Products Catalogue...</span>
        </div>
      }
    >
      <ProductsPageInner />
    </Suspense>
  );
}

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("-createdAt");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Monitor scroll for floating Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      if (sort) params.set("sort", sort);

      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setProducts(json.data.products);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="min-h-screen bg-[#FBF3E8] text-[#1F1F1F]">
      {/* ── Top Hero Header with Background Image ─────────── */}
      <div className="relative py-14 sm:py-20 bg-[#F3E6D3] border-b border-[#E6D6BD] overflow-hidden">
        {/* Garment production background image with soft warm overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/images/products/apparel-hero-bg.jpg"
            alt="Tirupur Apparel & Textile Production"
            className="w-full h-full object-cover object-center opacity-30 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F3E6D3]/70 via-[#F3E6D3]/50 to-[#F3E6D3]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow-label mb-2 text-[#C8452A] font-bold text-xs tracking-widest uppercase">
            OUR PRODUCTS
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 text-[#1F1F1F]">
            Apparel &amp; <span className="text-[#C8452A]">Garments</span>
          </h1>
          <p className="text-sm sm:text-base text-[#3A3530] font-medium max-w-2xl mx-auto mb-6">
            T-shirts, polo shirts, caps, and uniforms made in Tirupur. Plain stock and custom orders available.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-[#1F1F1F]">
            {trustStatements.map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-[#FFFDF9]/95 backdrop-blur-sm px-4 py-2 rounded-full border border-[#E6D6BD] shadow-xs"
              >
                <t.icon className="h-4 w-4 text-[#C8452A]" />
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 1. Top Filter Bar (Sticky Pills) ───────────────── */}
      <div className="bg-[#FBF3E8]/95 backdrop-blur-md border-b border-[#E6D6BD] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <span className="text-xs font-black uppercase tracking-wider text-[#7A746E] mr-1 shrink-0">
              FILTER:
            </span>
            {categories.map((c) => {
              const isActive = category === c.value;
              return (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`min-h-[44px] px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center justify-center ${
                    isActive
                      ? "bg-[#C8452A] text-white shadow-sm"
                      : "bg-[#F3E6D3] text-[#1F1F1F] hover:bg-[#EBDBC4] border border-[#E6D6BD]"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Section ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── 2. Search Card ───────────────────────────────── */}
        <div className="bg-[#FFFDF9] rounded-[24px] border border-[#E6D6BD] p-4 sm:p-5 shadow-xs mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search field */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A746E]" />
            <Input
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-11 pr-10 text-sm h-11 border-[#E6D6BD] bg-[#FBF3E8]/60 rounded-full text-[#1F1F1F] placeholder:text-[#7A746E] focus:ring-2 focus:ring-[#C8452A] focus:border-[#C8452A]"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A746E] hover:text-[#1F1F1F] p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort by: Latest dropdown */}
            <Select value={sort} onValueChange={(val) => setSort(val || "-createdAt")}>
              <SelectTrigger className="w-52 h-11 text-xs font-bold border-[#E6D6BD] rounded-full bg-[#F3E6D3] text-[#1F1F1F] px-4">
                <span className="text-[#7A746E] font-medium mr-1">Sort by:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#FFFDF9] border-[#E6D6BD] rounded-2xl shadow-lg">
                {sortOptions.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-xs font-semibold py-2.5 text-[#1F1F1F] focus:bg-[#F7ECE9] focus:text-[#C8452A]"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Grid / List View Toggle */}
            <div className="flex border border-[#E6D6BD] rounded-full p-1 bg-[#F3E6D3]">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`min-h-[36px] min-w-[36px] px-3 rounded-full flex items-center justify-center transition-all ${
                  viewMode === "grid"
                    ? "bg-[#C8452A] text-white shadow-xs font-bold"
                    : "text-[#4A4540] hover:text-[#1F1F1F]"
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={`min-h-[36px] min-w-[36px] px-3 rounded-full flex items-center justify-center transition-all ${
                  viewMode === "list"
                    ? "bg-[#C8452A] text-white shadow-xs font-bold"
                    : "text-[#4A4540] hover:text-[#1F1F1F]"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Filter Drawer Trigger */}
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="sm" className="lg:hidden min-h-[44px] px-4 rounded-full border-[#E6D6BD] bg-[#F3E6D3] text-xs font-bold text-[#1F1F1F]" />}>
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-[#C8452A]" /> Filters
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-[#FBF3E8] border-r border-[#E6D6BD] p-6">
                <SheetHeader>
                  <SheetTitle className="text-left font-bold text-[#1F1F1F] text-lg">
                    Product Categories
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <CategorySidebar selected={category} onSelect={setCategory} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* ── Content Area: Sidebar + Grid/List ─────────────── */}
        <div className="flex gap-8 items-start">
          {/* ── 3. Desktop Left Sidebar ────────────────────── */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24">
            <CategorySidebar selected={category} onSelect={setCategory} />
          </aside>

          {/* ── 4 & 5. Products Area ───────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* Active filter chip indicator */}
            {category && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-[#7A746E] font-medium">Selected:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F7ECE9] text-[#C8452A] border border-[#C8452A]/20">
                  {category}
                  <button
                    onClick={() => setCategory("")}
                    className="hover:opacity-75 p-0.5"
                    aria-label="Remove filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </div>
            )}

            {/* Loading Skeletons */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#FFFDF9] rounded-[24px] border border-[#E6D6BD] p-4 space-y-3 animate-pulse"
                  >
                    <div className="aspect-[4/3] bg-[#F3E6D3] rounded-t-[20px]" />
                    <div className="flex gap-2">
                      <div className="w-10 h-10 bg-[#F3E6D3] rounded-lg" />
                      <div className="w-10 h-10 bg-[#F3E6D3] rounded-lg" />
                      <div className="w-10 h-10 bg-[#F3E6D3] rounded-lg" />
                    </div>
                    <div className="h-4 bg-[#F3E6D3] rounded w-3/4" />
                    <div className="h-3 bg-[#F3E6D3] rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              /* ── 7. Empty State ───────────────────────────── */
              <div className="bg-[#FFFDF9] rounded-[24px] border border-[#E6D6BD] p-12 text-center max-w-xl mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-full bg-[#F7ECE9] text-[#C8452A] flex items-center justify-center mx-auto mb-4">
                  <Shirt className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-extrabold text-[#1F1F1F] mb-2">
                  No products found
                </h3>
                <p className="text-sm text-[#4A4540] max-w-md mx-auto mb-6 leading-relaxed">
                  No products match your search. Try clearing filters or searching for another item.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCategory("");
                    setSearchInput("");
                  }}
                  className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#C8452A] hover:bg-[#B03820] text-white text-xs font-bold transition-all shadow-xs"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              /* Product Grid / List view */
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {!loading && products.length > 0 && (
              <p className="text-center text-xs text-[#7A746E] font-medium mt-10">
                Showing {products.length} products
              </p>
            )}
          </main>
        </div>

        {/* ── Manufacturing Process Teaser Section ──────────── */}
        <section className="mt-20 pt-10 border-t border-[#E6D6BD]">
          <div className="bg-[#1F1F1F] rounded-[28px] p-8 sm:p-12 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 border border-[#3A332D]">
            <div className="max-w-xl text-center md:text-left">
              <span className="eyebrow-label text-[#C8452A] font-bold text-xs tracking-wider mb-2 block uppercase">
                PRODUCTION PIPELINE
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                Manufacturing <span className="text-[#C8452A]">Process</span>
              </h2>
              <p className="text-sm text-[#A89F97] font-normal leading-relaxed">
                From your idea to the finished product. Explore our 5-stage editorial story showcasing Design, Sampling, Bulk Production, Finishing, and Global Delivery.
              </p>
            </div>
            <Link
              href="/products/manufacturing-process"
              className="min-h-[44px] inline-flex items-center justify-center shrink-0 py-3 px-8 rounded-full bg-[#C8452A] hover:bg-[#B03820] text-white text-xs font-bold transition-all shadow-xs"
            >
              Explore Manufacturing Process <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </section>
      </div>

      {/* ── Common Contact & Inquiry Section ──────────────── */}
      <CommonContactForm defaultScope="products" />

      {/* ── 6. Floating Round Terracotta Back to Top Button ─ */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#C8452A] hover:bg-[#B03820] text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#C8452A] focus:ring-offset-2 animate-fade-in"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
