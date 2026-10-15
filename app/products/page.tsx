/**
 * Products Listing & Catalog Page
 * Dedicated product showcase with category filtering, search, sorting,
 * grid/list view, shopping cart integration, and 3D Customizer shortcuts.
 */
"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Grid3X3,
  List,
  ShoppingCart,
  Star,
  Heart,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  PackageCheck,
  CheckCircle,
  Shirt,
  Tag,
  Palette,
  Scissors,
  Factory,
  Package,
  Truck,
} from "lucide-react";
import { useCart, formatINR } from "@/lib/cart-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
  alt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  badge: string;
  images: ProductImage[];
  ratingsAverage: number;
  ratingsCount: number;
  stock: number;
}

// ─── Categories ───────────────────────────────────────────

const categories = [
  { label: "All Products", value: "" },
  { label: "Sportswear", value: "Sportswear" },
  { label: "Caps", value: "Caps" },
  { label: "Round Neck T-Shirts", value: "Round Neck T-Shirts" },
  { label: "Polo T-Shirts", value: "Polo T-Shirts" },
  { label: "Normal T-Shirts", value: "Normal T-Shirts" },
  { label: "Hoodies", value: "Hoodies" },
];

const trustStatements = [
  { icon: CheckCircle, label: "Premium Quality Garments" },
  { icon: Sparkles, label: "Custom 3D Print Studio" },
  { icon: PackageCheck, label: "Fast Global Delivery" },
];

const manufacturingSteps = [
  {
    step: "Step 1",
    title: "Design & Concept",
    description: "Share your vision — we create digital designs and detailed tech packs.",
    icon: Palette,
  },
  {
    step: "Step 2",
    title: "Sampling",
    description: "Receive physical samples for approval before bulk production.",
    icon: Scissors,
  },
  {
    step: "Step 3",
    title: "Production",
    description: "Precision manufacturing with real-time quality checks.",
    icon: Factory,
  },
  {
    step: "Step 4",
    title: "Finishing",
    description: "Custom labeling, packaging, and final inspection.",
    icon: Package,
  },
  {
    step: "Step 5",
    title: "Delivery",
    description: "Timely shipping with full tracking and documentation.",
    icon: Truck,
  },
];

// ─── Toast component (inline) ─────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl animate-slide-in text-sm font-light flex items-center gap-2">
      <ShoppingCart className="h-4 w-4 text-emerald-400" />
      {message}
    </div>
  );
}

// ─── Category sidebar content ─────────────────────────────

function CategoryFilter({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="space-y-2 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wider flex items-center gap-1.5">
        <Tag className="h-3.5 w-3.5 text-violet-600" /> Categories
      </h3>
      {categories.map((c) => (
        <button
          key={c.value}
          onClick={() => onSelect(c.value)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selected === c.value
              ? "bg-violet-50 text-violet-700 font-semibold"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

// ─── Product card ─────────────────────────────────────────

function ProductCard({
  product,
  viewMode,
  onAddToCart,
}: {
  product: Product;
  viewMode: "grid" | "list";
  onAddToCart: (p: Product) => void;
}) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const imgUrl = product.images?.[0]?.url || "/placeholder.svg";

  if (viewMode === "list") {
    return (
      <Card className="flex flex-col sm:flex-row overflow-hidden group hover:shadow-lg transition-all duration-300 border-gray-200">
        <Link href={`/products/${product.id}`} className="w-full sm:w-52 shrink-0 relative overflow-hidden bg-gray-100 aspect-[4/3] sm:aspect-square">
          <img src={imgUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          {product.badge && (
            <Badge className="absolute top-2 left-2 text-xs bg-violet-600 text-white border-0">{product.badge}</Badge>
          )}
        </Link>
        <div className="flex-1 flex flex-col p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-xs text-violet-600 font-semibold uppercase tracking-wider mb-1">{product.category}</p>
              <Link href={`/products/${product.id}`}>
                <h3 className="text-lg font-bold text-gray-900 hover:text-violet-600 transition-colors">{product.name}</h3>
              </Link>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-semibold">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>{product.ratingsAverage} ({product.ratingsCount})</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 font-normal mb-4 line-clamp-2">{product.description}</p>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-gray-900">{formatINR(product.price)}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through font-normal">{formatINR(product.originalPrice)}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link href="/customization">
                <Button size="sm" variant="outline" className="text-violet-700 border-violet-200 hover:bg-violet-50 text-xs font-semibold">
                  <Sparkles className="h-3.5 w-3.5 mr-1 text-violet-600" /> Customize 3D
                </Button>
              </Link>
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold" onClick={() => onAddToCart(product)}>
                <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-gray-200 flex flex-col">
      <Link href={`/products/${product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-gray-100">
        <img src={imgUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.badge && (
          <Badge className="absolute top-3 left-3 text-xs bg-violet-600 text-white font-semibold border-0 shadow-sm">{product.badge}</Badge>
        )}
        {discount > 0 && (
          <Badge variant="destructive" className="absolute top-3 right-3 text-xs font-bold">-{discount}%</Badge>
        )}
        {/* Hover action bar */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
          <Button size="sm" className="flex-1 bg-white hover:bg-gray-100 text-slate-900 font-semibold text-xs shadow-md" onClick={(e) => { e.preventDefault(); onAddToCart(product); }}>
            <ShoppingCart className="h-3.5 w-3.5 mr-1 text-violet-600" /> Add to Cart
          </Button>
          <Link href="/customization" className="inline-block" onClick={(e) => e.stopPropagation()}>
            <Button size="sm" variant="secondary" className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-md" title="Customize in 3D Studio">
              <Sparkles className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </Link>

      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider">{product.category}</span>
          <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            <span>{product.ratingsAverage}</span>
          </div>
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-bold text-gray-900 mb-2 hover:text-violet-600 transition-colors line-clamp-1">{product.name}</h3>
        </Link>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between border-t border-gray-50 mt-auto">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-gray-900">{formatINR(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through font-normal">{formatINR(product.originalPrice)}</span>
          )}
        </div>
        <Link href="/customization" className="text-xs text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-0.5">
          3D Studio <ArrowRight className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><span className="text-gray-500 font-medium">Loading Products Catalogue...</span></div>}>
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
  const [toast, setToast] = useState({ message: "", visible: false });
  const { addItem } = useCart();

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      if (sort) params.set("sort", sort);

      const res = await fetch(`/api/products?${params}`);
      const json = await res.json();
      if (json.success) setProducts(json.data.products);
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
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
    });
    setToast({ message: `${product.name} added to cart`, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <Toast message={toast.message} visible={toast.visible} />

      {/* ── Hero Banner ──────────────────────────────────── */}
      <div
        className="relative py-14 sm:py-20 text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)" }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-3 bg-violet-500/20 text-violet-200 border-violet-400/30 px-3 py-1 text-xs">
            Product Showcase &amp; Custom Apparel Store
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Explore Apparel &amp; Garment Collection
          </h1>
          <p className="text-base sm:text-lg text-indigo-100 font-normal max-w-2xl mx-auto mb-6">
            Discover premium blank &amp; custom-printed T-shirts, polo shirts, sportswear, and hoodies. Customize any item live in 3D.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-indigo-200">
            {trustStatements.map((t, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full border border-white/10">
                <t.icon className="h-4 w-4 text-emerald-400" />
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category Quick Bar ────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-2 shrink-0">Filter:</span>
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  category === c.value
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Catalog Grid ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products by name or category..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 text-sm border-gray-200"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <Select value={sort} onValueChange={(val) => setSort(val || "-createdAt")}>
              <SelectTrigger className="w-48 text-xs font-medium border-gray-200">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-createdAt" className="text-xs font-medium">Newest Arrivals</SelectItem>
                <SelectItem value="price" className="text-xs font-medium">Price: Low to High</SelectItem>
                <SelectItem value="-price" className="text-xs font-medium">Price: High to Low</SelectItem>
                <SelectItem value="name" className="text-xs font-medium">Name: A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-50">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`h-8 px-2.5 ${viewMode === "grid" ? "bg-white text-violet-700 shadow-xs" : "text-gray-500"}`}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`h-8 px-2.5 ${viewMode === "list" ? "bg-white text-violet-700 shadow-xs" : "text-gray-500"}`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Filter Trigger */}
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="sm" className="sm:hidden text-xs font-medium border-gray-200" />}>
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" /> Filters
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle className="text-left font-bold text-gray-900">Product Categories</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <CategoryFilter selected={category} onSelect={setCategory} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar Filter */}
          <aside className="hidden lg:block w-60 shrink-0">
            <CategoryFilter selected={category} onSelect={setCategory} />

            {/* 3D Customizer Promo Box */}
            <div className="mt-6 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl p-5 text-white shadow-md">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-bold text-sm mb-1">Custom 3D Studio</h4>
              <p className="text-xs text-indigo-100 mb-4 leading-relaxed">
                Design custom logos, prints, and colors directly on 3D T-shirt models in real-time.
              </p>
              <Link href="/customization">
                <Button size="sm" className="w-full bg-white hover:bg-gray-100 text-violet-900 font-bold text-xs">
                  Launch 3D Studio
                </Button>
              </Link>
            </div>
          </aside>

          {/* Main Product Grid */}
          <div className="flex-1">
            {/* Active Filters */}
            {category && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-gray-500">Active Category Filter:</span>
                <Badge className="bg-violet-100 text-violet-800 border-violet-200 text-xs font-semibold">
                  {category}
                  <button onClick={() => setCategory("")} className="ml-1.5 text-violet-600 hover:text-violet-900">✕</button>
                </Badge>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 animate-pulse overflow-hidden">
                    <div className="aspect-[4/5] bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Shirt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                  We couldn't find any products matching your criteria. Try changing category filters or search query.
                </p>
                <Button variant="outline" onClick={() => { setCategory(""); setSearchInput(""); }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}

            {!loading && products.length > 0 && (
              <p className="text-center text-xs text-gray-500 font-medium mt-10">
                Showing all {products.length} products
              </p>
            )}
          </div>
        </div>

        {/* ── Manufacturing Process Teaser Banner (Links to sub-page) ── */}
        <section className="mt-20 pt-10 border-t border-slate-200">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
            <div className="max-w-xl text-center md:text-left">
              <Badge className="mb-3 bg-violet-500/20 text-violet-200 border-violet-400/30 text-xs font-semibold px-3 py-1">
                Product Sub-Page
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                Manufacturing Process
              </h2>
              <p className="text-sm text-indigo-100/90 font-normal leading-relaxed">
                From your idea to the finished product. Explore our 5-stage editorial story showcasing Design, Sampling, Bulk Production, Finishing, and Global Delivery.
              </p>
            </div>
            <Link href="/products/manufacturing-process" className="shrink-0">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-7 py-6 rounded-xl shadow-lg hover:scale-[1.02] transition-all">
                Explore Manufacturing Process <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </div>

      {/* ── Common Contact & Inquiry Section ── */}
      <CommonContactForm defaultScope="products" />
    </div>
  );
}

