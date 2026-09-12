/**
 * GET /api/auth/me
 * Get the current authenticated user profile
 */
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    // Built-in admin doesn't have a DB record
    if (user!.id === "admin") {
      return Response.json({ success: true, data: { user } });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user!.id },
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, avatar: true, address: true,
        isActive: true, emailVerified: true, lastLogin: true,
        createdAt: true,
      },
    });

    return Response.json({ success: true, data: { user: fullUser } });
  } catch (error) {
    console.error("Get profile error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
