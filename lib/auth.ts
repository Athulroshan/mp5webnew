/**
 * Authentication helpers
 * JWT token creation, verification, and request guards
 */
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";
const SALT_ROUNDS = 12;

// ─── Password utilities ──────────────────────────────────

/** Hash a plain-text password */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/** Compare a plain-text password against a hash */
export async function comparePassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ─── JWT utilities ────────────────────────────────────────

/** Sign a JWT token for the given user id */
export function signToken(userId: string): string {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE as jwt.SignOptions["expiresIn"],
  });
}

/** Verify and decode a JWT token, returns the payload or null */
export function verifyToken(token: string): { id: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string };
  } catch {
    return null;
  }
}

// ─── Request helpers ──────────────────────────────────────

/** Extract the token from Authorization header or auth_token cookie */
function extractToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7);
  const cookieToken = request.cookies.get("auth_token")?.value;
  return cookieToken || null;
}

/** Get the authenticated user from a request, or null */
export async function getUserFromRequest(request: NextRequest) {
  const token = extractToken(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  // Built-in admin shortcut (matches the refer backend's admin logic)
  if (payload.id === "admin") {
    return {
      id: "admin",
      name: "Administrator",
      email: process.env.ADMIN_EMAIL || "admin@mpss.com",
      role: "admin",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) return null;
  return user;
}

/** Require an authenticated user — returns the user or a 401 Response */
export async function requireAuth(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return {
      user: null,
      error: Response.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      ),
    };
  }
  return { user, error: null };
}

/** Require an admin user — returns the user or a 403 Response */
export async function requireAdmin(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return { user: null, error };

  if (user!.role !== "admin") {
    return {
      user: null,
      error: Response.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      ),
    };
  }
  return { user, error: null };
}
