/**
 * POST /api/contact
 * Submit a contact form inquiry (saved to database)
 */
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof (body.phone || body.contact) === "string" ? (body.phone || body.contact).trim() : "";
    const inquiryType = typeof (body.inquiryType || body.service) === "string" ? (body.inquiryType || body.service).trim() : "";
    const quantity = typeof body.quantity === "string" ? body.quantity.trim() : "";
    const rawMessage = typeof body.message === "string" ? body.message.trim() : "";

    // Backend field validation
    if (!name) {
      return Response.json(
        { success: false, message: "Your Name is required." },
        { status: 400 }
      );
    }

    if (!email) {
      return Response.json(
        { success: false, message: "Business Email is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { success: false, message: "Please enter a valid business email address." },
        { status: 400 }
      );
    }

    if (!rawMessage) {
      return Response.json(
        { success: false, message: "Project Details / Requirements are required." },
        { status: 400 }
      );
    }

    // Format message to preserve optional quantity details in database record
    const formattedMessage = quantity
      ? `${rawMessage}\n\n[Estimated Order Quantity: ${quantity}]`
      : rawMessage;

    let savedInquiry: any = null;

    // Try Prisma DB persistence, with local JSON file fallback if remote network pooler is unreachable
    try {
      savedInquiry = await prisma.contactInquiry.create({
        data: {
          name,
          email,
          phone,
          message: formattedMessage,
          service: inquiryType || "Bulk Garment Production",
        },
      });
    } catch (dbError) {
      console.warn("Database pooler unreachable, saving to local inquiries backup:", (dbError as any)?.message);
      const dataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const filePath = path.join(dataDir, "inquiries.json");
      let existing: any[] = [];
      if (fs.existsSync(filePath)) {
        try {
          existing = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        } catch {
          existing = [];
        }
      }
      savedInquiry = {
        id: `inq-${Date.now()}`,
        name,
        email,
        phone,
        message: formattedMessage,
        service: inquiryType || "Bulk Garment Production",
        status: "new",
        createdAt: new Date().toISOString(),
      };
      existing.push(savedInquiry);
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), "utf-8");
    }

    return Response.json(
      {
        success: true,
        message: "Inquiry received and saved successfully",
        data: {
          inquiry: savedInquiry,
          emailSent: false,
          emailConfigured: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form backend error:", error);
    return Response.json(
      { success: false, message: "Server error occurred while saving inquiry. Please try again." },
      { status: 500 }
    );
  }
}
