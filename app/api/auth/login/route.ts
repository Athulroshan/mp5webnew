/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { NextRequest } from "next/server";

// Built-in admin credentials (from env)
const ADMIN_USERNAME = "adminmpss";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@mpss.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email: identifier, password } = body;

    if (!identifier || !password) {
      return Response.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Admin shortcut login (by username)
    if (identifier === ADMIN_USERNAME) {
      if (password !== ADMIN_PASSWORD) {
        return Response.json(
          { success: false, message: "Invalid credentials" },
          { status: 401 }
        );
      }
      const token = signToken("admin");
      const res = Response.json({
        success: true,
        message: "Login successful",
        data: {
          user: { id: "admin", name: "Administrator", email: ADMIN_EMAIL, role: "admin" },
          token,
        },
      });
      res.headers.set("Set-Cookie", `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
      return res;
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email: identifier } });
    if (!user) {
      return Response.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return Response.json(
        { success: false, message: "Account is deactivated" },
        { status: 401 }
      );
    }

    // Verify password
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return Response.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = signToken(user.id);

    const res = Response.json({
      success: true,
      message: "Login successful",
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });
    res.headers.set("Set-Cookie", `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
    return res;
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { success: false, message: "Server error during login" },
      { status: 500 }
    );
  }
}
