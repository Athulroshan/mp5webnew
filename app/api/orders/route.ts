/**
 * GET  /api/orders — List user's orders
 * POST /api/orders — Create a new order
 */
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { NextRequest } from "next/server";

// ─── GET: user's orders ───────────────────────────────────
export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const status = searchParams.get("status") || undefined;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: user!.id };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: where as never,
        include: { items: { include: { product: { select: { name: true, images: true, category: true } } } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: where as never }),
    ]);

    return Response.json({
      success: true,
      data: {
        orders,
        pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalOrders: total },
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ─── POST: create order ───────────────────────────────────
export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { items, paymentMethod, shippingAddress } = body;

    if (!items?.length || !paymentMethod || !shippingAddress) {
      return Response.json(
        { success: false, message: "Items, payment method, and shipping address are required" },
        { status: 400 }
      );
    }

    // Validate products and stock
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) {
        return Response.json(
          { success: false, message: `Product ${item.productId} not found or unavailable` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return Response.json(
          { success: false, message: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const shipping = subtotal > 1000 ? 0 : 100;
    const total = subtotal + tax + shipping;

    // Generate order number
    const orderNumber = `MPSS-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user!.id,
        paymentMethod,
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress: JSON.stringify(shippingAddress),
        billingAddress: JSON.stringify(body.billingAddress || shippingAddress),
        notes: JSON.stringify(body.notes || {}),
        estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        items: {
          create: items.map((item: { productId: string; quantity: number; price: number; size?: string; color?: string; customization?: object }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size || "",
            color: item.color || "",
            customization: JSON.stringify(item.customization || {}),
          })),
        },
      },
      include: { items: true },
    });

    // Decrement stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return Response.json(
      { success: true, message: "Order created", data: { order } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
