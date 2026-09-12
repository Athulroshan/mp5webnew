/**
 * GET  /api/products — List products with filtering, search, pagination, sort
 * POST /api/products — Create a product (admin only)
 */
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { NextRequest } from "next/server";

// ─── GET: list products ───────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const sort = searchParams.get("sort") || "-createdAt";

    // Build where clause
    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) (where.price as Record<string, number>).gte = minPrice;
      if (maxPrice !== undefined) (where.price as Record<string, number>).lte = maxPrice;
    }

    // Build orderBy
    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "price") orderBy = { price: "asc" };
    else if (sort === "-price") orderBy = { price: "desc" };
    else if (sort === "name") orderBy = { name: "asc" };
    else if (sort === "-name") orderBy = { name: "desc" };
    else if (sort === "createdAt") orderBy = { createdAt: "asc" };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: where as never,
        orderBy: orderBy as never,
        skip,
        take: limit,
      }),
      prisma.product.count({ where: where as never }),
    ]);

    // Parse JSON fields for the response
    const parsed = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images),
      videos: JSON.parse(p.videos || "[]"),
      colors: JSON.parse(p.colors),
      sizes: JSON.parse(p.sizes),
      tags: JSON.parse(p.tags),
      features: JSON.parse(p.features),
      specifications: JSON.parse(p.specifications),
      discount: JSON.parse(p.discount),
    }));

    return Response.json({
      success: true,
      data: {
        products: parsed,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNextPage: skip + products.length < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return Response.json(
      { success: false, message: "Server error while fetching products" },
      { status: 500 }
    );
  }
}

// ─── POST: create product (admin) ─────────────────────────
export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { name, description, price, category, stock = 0 } = body;

    if (!name || !description || price == null || !category) {
      return Response.json(
        { success: false, message: "Name, description, price, and category are required" },
        { status: 400 }
      );
    }

    // Generate SKU
    const sku = `${category.substring(0, 3).toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        originalPrice: body.originalPrice,
        category,
        subcategory: body.subcategory || "",
        brand: body.brand || "",
        stock,
        sku,
        images: JSON.stringify(body.images || []),
        videos: JSON.stringify(body.videos || []),
        colors: JSON.stringify(body.colors || []),
        sizes: JSON.stringify(body.sizes || []),
        tags: JSON.stringify(body.tags || []),
        features: JSON.stringify(body.features || []),
        specifications: JSON.stringify(body.specifications || {}),
        badge: body.badge || "",
        isCustomizable: body.isCustomizable || false,
        isFeatured: body.isFeatured || false,
      },
    });

    return Response.json(
      { success: true, message: "Product created", data: { product } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);
    return Response.json(
      { success: false, message: "Server error while creating product" },
      { status: 500 }
    );
  }
}
