/**
 * Product detail page — dynamic route [productId]
 * Shows product info, images, color/size selection, add to cart
 */
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Heart, ArrowLeft, ArrowRight, Check, Truck, Shield, RotateCcw, Shirt } from "lucide-react";
import { useCart, formatINR } from "@/lib/cart-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────

interface ProductColor {
  name: string;
  hex: string;
  available: boolean;
  imageIndex?: number;
}

interface ProductSize {
  name: string;
  available: boolean;
  stock: number;
}

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
  colors: ProductColor[];
  sizes: ProductSize[];
  ratingsAverage: number;
  ratingsCount: number;
  stock: number;
  specifications?: Record<string, string>;
}

// ─── Component ────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [toastVisible, setToastVisible] = useState(false);

  // Fetch product
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${params.productId}`);
        const json = await res.json();
        if (json.success) {
          setProduct(json.data.product);
          // Set defaults
          const availableColor = json.data.product.colors?.find((c: ProductColor) => c.available);
          if (availableColor) setSelectedColor(availableColor.name);
          const availableSize = json.data.product.sizes?.find((s: ProductSize) => s.available);
          if (availableSize) setSelectedSize(availableSize.name);
        }
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: `${product.id}-${selectedColor}-${selectedSize}`,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
      color: selectedColor,
      size: selectedSize,
    }, quantity);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-gray-500 font-light text-lg mb-4">Product not found</p>
        <Link
          href="/products"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "font-light inline-flex items-center"
          )}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Link>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#FBF3E8] text-[#1F1F1F]">
      {/* Toast */}
      {toastVisible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1F1F1F] text-white px-5 py-3 rounded-full shadow-xl animate-slide-in text-sm font-medium flex items-center gap-2">
          <Check className="h-4 w-4 text-[#C8452A]" /> Added to cart
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-[#7A746E] mb-8">
          <Link href="/products" className="hover:text-[#C8452A] transition-colors">Products</Link>
          <span>/</span>
          <span className="text-[#1F1F1F]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image gallery or placeholder */}
          <div className="space-y-4">
            {product.images && product.images.length > 0 && product.images[0]?.url && !product.images[0]?.url.includes("unsplash.com") ? (
              <div className="relative aspect-square rounded-[24px] overflow-hidden bg-white border border-[#E8DAC8] shadow-sm">
                <img
                  src={product.images[activeImage]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.badge && (
                  <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full bg-[#C8452A] text-white shadow-xs">
                    {product.badge}
                  </span>
                )}
              </div>
            ) : (
              <div className="relative aspect-square rounded-[24px] bg-[#F3E6D3]/60 border border-[#E8DAC8] flex flex-col items-center justify-center p-8 text-center shadow-xs">
                {product.badge && (
                  <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full bg-[#C8452A] text-white shadow-xs">
                    {product.badge}
                  </span>
                )}
                <div className="w-20 h-20 rounded-3xl bg-white/90 border border-[#E8DAC8] flex items-center justify-center text-[#C8452A] shadow-xs mb-3">
                  <Shirt className="h-10 w-10" />
                </div>
                <h3 className="text-base font-bold text-[#1F1F1F]">{product.name}</h3>
                <p className="text-xs text-[#7A746E] mt-1">Photo available on request</p>
              </div>
            )}
            {/* Thumbnail strip (only when valid user images exist) */}
            {product.images && product.images.length > 1 && product.images[0]?.url && !product.images[0]?.url.includes("unsplash.com") && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-18 h-18 rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImage === i ? "border-[#C8452A] ring-2 ring-[#C8452A]/20 scale-105" : "border-[#E8DAC8] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-6">
            <div>
              <p className="eyebrow-label mb-2">{product.category}</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1F1F1F] mb-3">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F]">Price on Request</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F3E6D3] text-[#C8452A] border border-[#E6D6BD]">
                Customized Order
              </span>
            </div>

            <p className="text-[#4A4540] text-base leading-relaxed">{product.description}</p>

            {/* Color selection */}
            {product.colors?.length > 0 && (
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-[#7A746E] mb-3">Color: <span className="text-[#1F1F1F] font-bold">{selectedColor}</span></p>
                <div className="flex gap-2.5">
                  {product.colors.map((c, idx) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        if (!c.available) return;
                        setSelectedColor(c.name);
                        // Dynamically switch photo to color's image index if available or match by index
                        if (c.imageIndex !== undefined && product.images?.[c.imageIndex]) {
                          setActiveImage(c.imageIndex);
                        } else if (product.images?.[idx]) {
                          setActiveImage(idx);
                        }
                      }}
                      disabled={!c.available}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${
                        selectedColor === c.name ? "border-[#C8452A] ring-2 ring-[#C8452A]/30 scale-110 shadow-xs" : "border-[#E8DAC8]"
                      } ${!c.available ? "opacity-30 cursor-not-allowed" : "hover:scale-105"}`}
                      style={{ backgroundColor: c.hex }}
                      title={`${c.name} (Click to view photo)`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {product.sizes?.length > 0 && (
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-[#7A746E] mb-3">Size: <span className="text-[#1F1F1F] font-bold">{selectedSize}</span></p>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => s.available && setSelectedSize(s.name)}
                      disabled={!s.available}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                        selectedSize === s.name
                          ? "border-[#C8452A] bg-[#C8452A] text-white shadow-xs"
                          : "border-[#E8DAC8] bg-[#FBF3E8] text-[#4A4540] hover:border-[#C8452A]"
                      } ${!s.available ? "opacity-30 cursor-not-allowed" : ""}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/contact?subject=${encodeURIComponent(`Pricing & Customization Enquiry: ${product.name}`)}`}
                className="btn-pill-primary flex-1 py-3 text-sm text-center font-bold flex items-center justify-center gap-2"
              >
                <span>Request Custom Quote</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-[#E8DAC8] bg-white rounded-full overflow-hidden w-fit">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2.5 text-[#4A4540] hover:bg-[#F3E6D3] transition-colors font-bold text-sm"
                  >
                    −
                  </button>
                  <span className="px-3 py-2.5 text-center text-[#1F1F1F] font-bold min-w-[2.5rem] text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3.5 py-2.5 text-[#4A4540] hover:bg-[#F3E6D3] transition-colors font-bold text-sm"
                  >
                    +
                  </button>
                </div>

                <Button
                  size="lg"
                  variant="outline"
                  className="btn-pill-secondary px-4 text-xs font-bold"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  title="Add to Enquiry Cart"
                >
                  <ShoppingCart className="h-4 w-4 mr-1.5" />
                  Add to Cart
                </Button>
              </div>
            </div>

            {/* Simple Product Highlights */}
            <div className="pt-4 border-t border-[#E8DAC8] space-y-2">
              <p className="text-xs uppercase font-bold tracking-wider text-[#7A746E]">Product Details</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#F3E6D3]/40 p-2.5 rounded-xl border border-[#E8DAC8]">
                  <span className="text-[#7A746E] block text-[11px]">Material</span>
                  <span className="font-bold text-[#1F1F1F]">
                    {product.specifications?.material || (product.category === "Caps" ? "Cotton & Breathable Mesh" : "100% Cotton")}
                  </span>
                </div>
                <div className="bg-[#F3E6D3]/40 p-2.5 rounded-xl border border-[#E8DAC8]">
                  <span className="text-[#7A746E] block text-[11px]">Fit / Size</span>
                  <span className="font-bold text-[#1F1F1F]">
                    {product.specifications?.fit || (product.category === "Caps" ? "Adjustable Free Size" : "Regular Comfort Fit")}
                  </span>
                </div>
                <div className="bg-[#F3E6D3]/40 p-2.5 rounded-xl border border-[#E8DAC8]">
                  <span className="text-[#7A746E] block text-[11px]">Type</span>
                  <span className="font-bold text-[#1F1F1F]">
                    {product.specifications?.type || product.specifications?.visor || (product.category === "Caps" ? "Curved Visor Cap" : product.category?.includes("Uniform") ? "Workwear Uniform" : "Ribbed Round Neck")}
                  </span>
                </div>
                <div className="bg-[#F3E6D3]/40 p-2.5 rounded-xl border border-[#E8DAC8]">
                  <span className="text-[#7A746E] block text-[11px]">Origin</span>
                  <span className="font-bold text-[#1F1F1F]">
                    {product.specifications?.origin || "Tirupur, India"}
                  </span>
                </div>
              </div>
            </div>

            {/* Simple Trust Points */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E8DAC8]">
              {[
                { icon: Truck, label: "Tirupur Made", sub: "Direct from factory" },
                { icon: Shield, label: "Quality Checked", sub: "Checked before shipping" },
                { icon: RotateCcw, label: "Direct Support", sub: "Call & WhatsApp help" },
              ].map((item, i) => (
                <div key={i} className="text-center p-3 rounded-2xl bg-[#F3E6D3]/40 border border-[#E8DAC8]">
                  <item.icon className="h-5 w-5 mx-auto text-[#C8452A] mb-1.5" />
                  <p className="text-xs text-[#1F1F1F] font-bold">{item.label}</p>
                  <p className="text-[11px] text-[#7A746E]">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Direct Enquiry Box */}
        <div className="mt-16 card-warm p-8 text-center max-w-2xl mx-auto space-y-3">
          <h3 className="text-xl font-bold text-[#1F1F1F]">Need bulk quantity or custom logos?</h3>
          <p className="text-sm text-[#4A4540] max-w-md mx-auto">
            Contact our team in Tirupur for wholesale pricing, fabric GSM details, or custom embroidery.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#C8452A] text-white text-xs font-bold hover:bg-[#B03820] transition-colors shadow-xs"
            >
              For Enquiry →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



