import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const [productsCount, orders, products] = await Promise.all([
      prisma.product.count(),
      prisma.order.findMany({
        include: {
          items: {
            include: { product: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.product.findMany({
        orderBy: { createdAt: "desc" }
      })
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;

    // Category breakdown
    const categoryStats: Record<string, { count: number; stock: number }> = {};
    products.forEach((p) => {
      if (!categoryStats[p.category]) {
        categoryStats[p.category] = { count: 0, stock: 0 };
      }
      categoryStats[p.category].count += 1;
      categoryStats[p.category].stock += p.stock;
    });

    const categoryData = Object.keys(categoryStats).map((cat) => ({
      category: cat,
      productsCount: categoryStats[cat].count,
      totalStock: categoryStats[cat].stock,
    }));

    // Low stock products alert (< 10)
    const lowStockProducts = products
      .filter((p) => p.stock < 10)
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        stock: p.stock,
        price: p.price,
      }));

    // Mock sales trend data for chart
    const salesTrend = [
      { month: "Jan", sales: 45000 },
      { month: "Feb", sales: 52000 },
      { month: "Mar", sales: 61000 },
      { month: "Apr", sales: 58000 },
      { month: "May", sales: 74000 },
      { month: "Jun", sales: 89000 },
      { month: "Jul", sales: 95000 },
      { month: "Aug", sales: totalRevenue + 12000 },
    ];

    return Response.json({
      success: true,
      data: {
        totalProducts: productsCount,
        totalOrders,
        totalRevenue,
        categoryData,
        lowStockProducts,
        salesTrend,
        recentOrders: orders.slice(0, 5),
      },
    });
  } catch (err) {
    console.error("Admin analytics error:", err);
    return Response.json(
      { success: false, message: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
