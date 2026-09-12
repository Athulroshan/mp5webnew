/**
 * GET /api/orders/[id] — Get single order
 * PUT /api/orders/[id] — Update order status (admin)
 */
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const { id } = await context.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { select: { name: true, images: true, category: true } } } },
        user: { select: { name: true, email: true } },
      },
    });

    if (!order) {
      return Response.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Users can only see their own orders (admins can see all)
    if (order.userId !== user!.id && user!.role !== "admin") {
      return Response.json({ success: false, message: "Not authorized" }, { status: 403 });
    }

    return Response.json({ success: true, data: { order } });
  } catch (error) {
    console.error("Get order error:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { id } = await context.params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.status) {
      updateData.status = body.status;
      if (body.status === "shipped") updateData.shippedAt = new Date();
      if (body.status === "delivered") updateData.deliveredAt = new Date();
      if (body.status === "cancelled") {
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = body.cancellationReason || "";
      }
    }
    if (body.tracking) updateData.tracking = JSON.stringify(body.tracking);

    const order = await prisma.order.update({ where: { id }, data: updateData });

    return Response.json({ success: true, message: "Order updated", data: { order } });
  } catch (error) {
    console.error("Update order error:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
