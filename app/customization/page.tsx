"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import CustomStudio2D, { CustomStudio2DRef, Design } from "@/components/CustomStudio2D";
import { useCart } from "@/lib/cart-context";
import MLogo from "@/components/ui/m-logo";

export default function CustomizationPage() {
  const { addItem, totalItems } = useCart();
  const studioRef = useRef<CustomStudio2DRef>(null);
  const [design, setDesign] = useState<Design | null>(null);
  const [selectedSize, setSelectedSize] = useState<"S" | "M" | "L" | "XL">("M");
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
        name: `${garmentName} (Customized - Size ${selectedSize})`,
        price: garmentPrice,
        size: selectedSize,
        color: currentDesign.colors.body,
        image:
          currentDesign.garment === "polo"
            ? "/assets/studio/polo-front-shade.jpg"
            : "/assets/studio/tee-front-shade.jpg",
        customization: {
          logoName: currentDesign.reference ? "With Reference" : "Custom Artwork",
          placement: "Torso / Sleeve",
          size: selectedSize,
          ...currentDesign,
        } as any,
      },
      1
    );

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#FBF3E8] text-[#1F1F1F] select-none">
      {/* ── Studio Top Header Bar ─────────────────────────────────────────── */}
      <header className="h-16 bg-[#FFFDF9] border-b border-[#E6D6BD] px-4 sm:px-8 flex items-center justify-between shrink-0 z-20 shadow-xs">
        {/* Left: ← Products Link */}
        <Link
          href="/products"
          className="flex items-center gap-2 text-xs font-bold text-[#4A4540] hover:text-[#C8452A] transition-colors"
          title="Return to Products"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Products</span>
        </Link>

        {/* Center: Outline M logo and Title */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link href="/" className="hover:opacity-90 transition-opacity flex items-center">
            <MLogo size={30} />
          </Link>
          <h1 className="text-base sm:text-lg font-extrabold text-[#1F1F1F] tracking-tight">
            Design your <span className="text-[#C8452A]">T-shirt</span>
          </h1>
        </div>

        {/* Right: Round Cart Button */}
        <Link
          href="/cart"
          className="relative w-10 h-10 rounded-full bg-[#FFFDF9] border border-[#E6D6BD] hover:border-[#C8452A] flex items-center justify-center text-[#1F1F1F] transition-colors shadow-2xs group"
          title="View Cart"
          aria-label={`View Cart (${totalItems} items)`}
        >
          <ShoppingCart className="w-4 h-4 text-[#1F1F1F] group-hover:text-[#C8452A] transition-colors" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#C8452A] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {totalItems}
            </span>
          )}
        </Link>
      </header>

      {/* ── Custom Studio 2D Work Area ──────────────────────────────────────── */}
      <div className="flex-1 flex overflow-y-auto">
        <CustomStudio2D
          ref={studioRef}
          onDesignChange={setDesign}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          onAddToCart={handleAddToCart}
          addedToast={addedToast}
          garmentPrice={garmentPrice}
        />
      </div>
    </div>
  );
}
