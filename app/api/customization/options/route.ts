/**
 * GET /api/customization/options
 * Available customization options for apparel
 */
export async function GET() {
  return Response.json({
    success: true,
    data: {
      options: {
        outfitTypes: ["Top", "T-Shirt", "Bottom", "Both", "Accessories", "Full Set"],
        colors: [
          { name: "white", hex: "#FFFFFF", border: "#E5E7EB" },
          { name: "black", hex: "#000000", border: "#374151" },
          { name: "red", hex: "#EF4444", border: "#DC2626" },
          { name: "blue", hex: "#3B82F6", border: "#2563EB" },
          { name: "green", hex: "#10B981", border: "#059669" },
          { name: "yellow", hex: "#F59E0B", border: "#D97706" },
          { name: "purple", hex: "#8B5CF6", border: "#7C3AED" },
          { name: "brown", hex: "#A0522D", border: "#8B4513" },
          { name: "gray", hex: "#6B7280", border: "#4B5563" },
          { name: "pink", hex: "#EC4899", border: "#DB2777" },
          { name: "orange", hex: "#F97316", border: "#EA580C" },
        ],
        textPlacements: ["Chest", "Back", "Sleeve", "Bottom corner"],
        maxTextLength: 50,
        maxQuantity: 100,
        basePrices: {
          Top: 2500, "T-Shirt": 2000, Bottom: 3000,
          Both: 4500, Accessories: 1500, "Full Set": 6000,
        },
        customizationCosts: { text: 500, premiumColor: 300 },
      },
    },
  });
}
