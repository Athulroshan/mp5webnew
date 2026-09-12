/**
 * GET    /api/products/[id] — Get single product
 * PUT    /api/products/[id] — Update product (admin)
 * DELETE /api/products/[id] — Delete product (admin)
 */
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

// ─── GET: single product ─────────────────────────────────
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product || !product.isActive) {
      return Response.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const parsed = {
      ...product,
      images: JSON.parse(product.images),
      videos: JSON.parse(product.videos || "[]"),
      colors: JSON.parse(product.colors),
      sizes: JSON.parse(product.sizes),
      tags: JSON.parse(product.tags),
      features: JSON.parse(product.features),
      specifications: JSON.parse(product.specifications),
      discount: JSON.parse(product.discount),
    };

    return Response.json({ success: true, data: { product: parsed } });
  } catch (error) {
    console.error("Get product error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// ─── PUT: update product (admin) ──────────────────────────
export async function PUT(request: NextRequest, context: RouteContext) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { id } = await context.params;
    const body = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description && { description: body.description }),
        ...(body.price != null && { price: body.price }),
        ...(body.originalPrice != null && { originalPrice: body.originalPrice }),
        ...(body.category && { category: body.category }),
        ...(body.stock != null && { stock: body.stock }),
        ...(body.badge && { badge: body.badge }),
        ...(body.images && { images: JSON.stringify(body.images) }),
        ...(body.videos && { videos: JSON.stringify(body.videos) }),
        ...(body.colors && { colors: JSON.stringify(body.colors) }),
        ...(body.sizes && { sizes: JSON.stringify(body.sizes) }),
        ...(body.isActive != null && { isActive: body.isActive }),
        ...(body.isFeatured != null && { isFeatured: body.isFeatured }),
      },
    });

    return Response.json({
      success: true,
      message: "Product updated",
      data: { product },
    });
  } catch (error) {
    console.error("Update product error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// ─── DELETE: remove product (admin) ───────────────────────
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { id } = await context.params;
    await prisma.product.delete({ where: { id } });

    return Response.json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
