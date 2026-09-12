/**
 * POST /api/auth/register
 * Register a new user account
 */
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return Response.json(
        { success: false, message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check for existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json(
        { success: false, message: "User already exists with this email" },
        { status: 400 }
      );
    }

    // Create user with hashed password
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    const token = signToken(user.id);

    return Response.json(
      {
        success: true,
        message: "User registered successfully",
        data: {
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
          token,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json(
      { success: false, message: "Server error during registration" },
      { status: 500 }
    );
  }
}
