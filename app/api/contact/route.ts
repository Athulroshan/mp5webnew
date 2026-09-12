/**
 * POST /api/contact
 * Submit a contact form inquiry (saved to database)
 */
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, service } = body;

    if (!name || !email || !message) {
      return Response.json(
        { success: false, message: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        phone: phone || "",
        message,
        service: service || "",
      },
    });

    return Response.json(
      { success: true, message: "Inquiry submitted successfully", data: { inquiry } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
