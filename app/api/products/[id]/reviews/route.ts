/**
 * POST /api/products/[id]/reviews — Add a review to a product
 */
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { rating, comment } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return Response.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check product exists
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return Response.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Check for duplicate review
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: user!.id, productId: id } },
    });
    if (existing) {
      return Response.json(
        { success: false, message: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: { rating, comment: comment || "", userId: user!.id, productId: id },
    });

    // Update product rating average
    const agg = await prisma.review.aggregate({
      where: { productId: id },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.product.update({
      where: { id },
      data: {
        ratingsAverage: agg._avg.rating || 0,
        ratingsCount: agg._count,
      },
    });

    return Response.json(
      { success: true, message: "Review added", data: { review } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add review error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
