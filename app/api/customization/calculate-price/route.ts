/**
 * POST /api/customization/calculate-price
 * Calculate price for a custom apparel order
 */
import { NextRequest } from "next/server";

const BASE_PRICES: Record<string, number> = {
  Top: 2500,
  "T-Shirt": 2000,
  Bottom: 3000,
  Both: 4500,
  Accessories: 1500,
  "Full Set": 6000,
};

const PREMIUM_COLORS = ["gold", "silver", "metallic"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { outfitType, quantity, customText, selectedColor } = body;

    if (!outfitType || !quantity || !selectedColor) {
      return Response.json(
        { success: false, message: "outfitType, quantity, and selectedColor are required" },
        { status: 400 }
      );
    }

    const basePrice = BASE_PRICES[outfitType] || 2500;
    let customizationCost = 0;

    // Text customization adds cost
    if (customText) customizationCost += 500;

    // Premium colors cost more
    if (PREMIUM_COLORS.includes(selectedColor.toLowerCase())) {
      customizationCost += 300;
    }

    const unitPrice = basePrice + customizationCost;
    const totalPrice = unitPrice * quantity;

    return Response.json({
      success: true,
      data: {
        unitPrice,
        totalPrice,
        breakdown: { basePrice, customizationCost, quantity, unitPrice },
      },
    });
  } catch (error) {
    console.error("Calculate price error:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
