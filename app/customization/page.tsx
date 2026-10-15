"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Check, Sparkles } from "lucide-react";
import CustomStudio2D, { CustomStudio2DRef, Design } from "@/components/CustomStudio2D";
import { useCart, formatINR } from "@/lib/cart-context";

export default function CustomizationPage() {
  const { addItem, totalItems } = useCart();
  const studioRef = useRef<CustomStudio2DRef>(null);
  const [design, setDesign] = useState<Design | null>(null);
  const [addedToast, setAddedToast] = useState(false);

  const garmentName =
    design?.garment === "polo" ? "Polo T-Shirt" : "Round Neck T-Shirt";
  const garmentPrice = design?.garment === "polo" ? 949 : 799;

  const handleAddToCart = () => {
    const currentDesign = studioRef.current?.getDesign() || design;
    if (!currentDesign) return;

    addItem(
      {
        id: `custom-2d-${Date.now()}`,
        name: `${garmentName} (Customized)`,
        price: garmentPrice,
        color: currentDesign.colors.body,
        image:
          currentDesign.garment === "polo"
            ? "/assets/studio/polo-front-shade.jpg"
            : "/assets/studio/tee-front-shade.jpg",
        customization: {
          logoName: currentDesign.reference ? "With Reference" : "Custom Artwork",
          placement: "Torso / Sleeve",
          ...currentDesign,
        } as any,
      },
      1
    );

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#0b0f19] text-slate-100 select-none">
      {/* ── Studio Top Header Bar ─────────────────────────────────────────── */}
      <header className="h-14 bg-[#111827] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Products</span>
          </Link>

          <div className="w-px h-5 bg-slate-800 hidden sm:block" />

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white text-xs font-black shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
              M
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight text-white">
                Custom Studio
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
                2D Studio
              </span>
            </div>
          </Link>
        </div>

        {/* Center Hint */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Real-time fabric shading & multi-part colour preview</span>
        </div>

        {/* Right Actions: Add to Cart & Cart Link */}
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="View Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30 transition-all active:scale-[0.98]"
          >
            {addedToast ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
                <span className="bg-black/25 px-1.5 py-0.5 rounded text-[10px] font-extrabold text-violet-200">
                  {formatINR(garmentPrice)}
                </span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── 2D Custom Studio Component ──────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        <CustomStudio2D ref={studioRef} onDesignChange={setDesign} />
      </div>
    </div>
  );
}
